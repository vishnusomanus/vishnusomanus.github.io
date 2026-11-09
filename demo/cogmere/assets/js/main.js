/* Cogmere Bicycle Workshop — standalone, dependency-free interactions. */
(() => {
  "use strict";
  const TIME_ZONE = "America/Los_Angeles";
  const STORAGE_KEYS = { plan: "cogmere.repair-plan.v1", checks: "cogmere.ride-checks.v1" };
  const BIKE_TYPES = {
    standard: { label: "Road / hybrid / gravel", rate: 0 },
    cargo: { label: "Cargo / longtail", rate: 0.2 },
    electric: { label: "E-bike mechanical work", rate: 0.15 },
  };
  const PARTS_GRADES = {
    everyday: { label: "Everyday dependable", multiplier: 1 },
    durable: { label: "Longer-wearing upgrade", multiplier: 1.4 },
    labour: { label: "Labor only / parts to confirm", multiplier: 0 },
  };
  const RIDE_TYPES = {
    daily: {
      label: "Everyday commute",
      tip: "Allow a little margin for the journey. A rushed departure is an easy time to miss a loose wheel or a forgotten light.",
    },
    weekend: {
      label: "Longer weekend loop",
      tip: "Start with charged lights even on a bright day. A wrong turn, a repair stop or a change of weather can make the ride longer than planned.",
    },
    loaded: {
      label: "Loaded / overnight ride",
      tip: "Take a short loaded test ride before a long trip. Recheck luggage clearance and fasteners after the first few miles.",
    },
  };
  const SERVICE_CATEGORIES = [
    "All repairs",
    "Inspection",
    "Servicing",
    "Wheels",
    "Brakes",
    "Drivetrain",
    "Bearings",
    "Controls",
  ];
  const GUIDE_CATEGORIES = { care: "Everyday care", symptoms: "Noises & symptoms", riding: "Ready to ride" };
  const CONTACT_TOPICS = {
    repair: {
      label: "Repair question",
      next: "The mechanic who knows that part of the bike best will answer at {email}. If it sounds like a safety problem, we'll suggest a drop-off time.",
    },
    parts: {
      label: "Parts compatibility",
      next: "We'll check the fit and reply at {email}. A photo of the part or its markings helps if we ask for one.",
    },
    access: {
      label: "Access & visiting",
      next: "We'll reply at {email} with anything that makes the visit easier, from a quieter time to space for a cargo bike.",
    },
    collection: {
      label: "An existing pickup",
      next: "We'll check your job ticket on the bench and reply at {email} with where the bike stands.",
    },
  };
  const DROP_OFF_TIMES = ["9:20am", "10:00am", "11:20am", "1:00pm", "2:20pm", "3:40pm"];
  // Add YYYY-MM-DD dates here for one-off closures. Recurring US federal holidays are calculated.
  const EXTRA_CLOSURES = [];
  // null keeps the calendar rolling. An explicit future YYYY-MM-DD array can replace it on a live site.
  const FIXED_OPENING_DATES = null;
  const SERVICES = [
    {
      id: "check",
      name: "Safety check",
      category: "Inspection",
      labour: 2500,
      parts: 0,
      minutes: 25,
      mechanic: "eirlys",
      short: "A careful once-over before the miles begin.",
      suitable: "A bike that has been stored, bought used or simply needs a second pair of eyes.",
      steps: [
        "Check wheel security, tire condition and visible frame damage.",
        "Inspect brake operation, steering play and drivetrain wear.",
        "Write a short priority list, with urgent work explained first.",
      ],
      note: "Adjustments and replacement parts are quoted separately. Stop riding if a safety-critical fault is found.",
      art: "check.svg",
      keywords:
        "safety inspection once-over used bought stored winter shed loose rattle wobble noise creak worried",
      perBike: true,
    },
    {
      id: "service",
      name: "Everyday tune-up",
      category: "Servicing",
      labour: 9500,
      parts: 1500,
      minutes: 90,
      mechanic: "bertram",
      short: "A dependable refresh for the bike you reach for most.",
      suitable: "Everyday bikes with rough shifting, tired brakes or a season of ordinary wear.",
      steps: [
        "Inspect the whole bicycle and measure chain wear.",
        "Adjust mechanical brakes and gears, lubricate cables and torque accessible fasteners.",
        "True minor wheel wobbles, lubricate the chain and test ride.",
      ],
      note: "Includes routine gear and rim-brake adjustment. Major wheel work, hydraulic bleeding and new parts are additional.",
      art: "service.svg",
      keywords:
        "tune-up tune up annual service rough shifting squeal squeak brakes rubbing noise creak clunk spring commuter",
      perBike: true,
    },
    {
      id: "overhaul",
      name: "Full teardown & rebuild",
      category: "Servicing",
      labour: 25000,
      parts: 5000,
      minutes: 210,
      mechanic: "bertram",
      short: "Take the bike back to its good foundations.",
      suitable: "A well-used bicycle worth keeping, with several systems due attention.",
      steps: [
        "Strip the drivetrain, contact points and accessible serviceable bearings.",
        "Clean, inspect and rebuild with appropriate grease and fresh cable routing.",
        "Set brakes and gears, torque checked fasteners and finish with a road test.",
      ],
      note: "Seized parts, damaged threads and proprietary components need an inspection before a fixed quote.",
      art: "overhaul.svg",
      keywords: "full service strip rebuild overhaul seized grinding crunchy rough old bike restore winter",
      perBike: true,
    },
    {
      id: "puncture",
      name: "Inner tube replacement",
      category: "Wheels",
      labour: 1500,
      parts: 1000,
      minutes: 20,
      mechanic: "taran",
      short: "Find the cause, not just the hole.",
      suitable: "A conventional tubed tire that will not hold pressure.",
      steps: [
        "Remove the wheel and inspect the tire, rim tape and valve hole.",
        "Install the correct tube and remove any lodged debris.",
        "Inflate within tire and rim limits and check wheel security.",
      ],
      note: "One wheel. Tires and rim tape are additional if damaged. Cargo and hub-gear wheel removal may need more labor.",
      art: "puncture.svg",
      keywords: "puncture flat tire inner tube slow leak pressure valve going down keeps going flat",
    },
    {
      id: "tyre",
      name: "Tire installation",
      category: "Wheels",
      labour: 2000,
      parts: 4500,
      minutes: 25,
      mechanic: "taran",
      short: "Fresh grip, straight seating and the right size.",
      suitable: "A worn, cut or unsuitable tire on a tubed wheel.",
      steps: [
        "Confirm tire size, clearance and rim compatibility.",
        "Inspect rim tape, install the new tire and check the tube.",
        "Seat the bead evenly and inflate within the stated limits.",
      ],
      note: "Per wheel, excluding a new tube if needed. Tubeless installation has its own service.",
      art: "tyre.svg",
      keywords: "new tire worn bald cut sidewall bulge cracked grip flat",
    },
    {
      id: "tubeless",
      name: "Tubeless refresh",
      category: "Wheels",
      labour: 3000,
      parts: 2000,
      minutes: 40,
      mechanic: "taran",
      short: "A clean start for a system that needs to seal.",
      suitable: "An existing compatible tubeless wheel with dried sealant or a slow leak.",
      steps: [
        "Remove the tire and inspect rim tape and the valve.",
        "Clean old sealant, inspect the bead and add fresh sealant.",
        "Reseat and pressure-check the tire, with follow-up advice.",
      ],
      note: "Per wheel. New rim tape, valves and damaged tires are additional. We cannot guarantee a damaged casing will seal.",
      art: "tubeless.svg",
      keywords: "tubeless sealant burp slow leak flat puncture dried sealant",
    },
    {
      id: "rim",
      name: "Rim brake setup",
      category: "Brakes",
      labour: 2500,
      parts: 2000,
      minutes: 30,
      mechanic: "eirlys",
      short: "A firm lever and a cleaner stop.",
      suitable: "Cable-operated rim brakes with uneven pad contact or a long lever pull.",
      steps: [
        "Inspect cables, housing, rims and pad condition.",
        "Align pads, center the brake and set cable tension.",
        "Check lever feel and braking on a controlled test ride.",
      ],
      note: "For one brake. Rim wear or frayed cables may require replacement before adjustment is safe.",
      art: "rim.svg",
      keywords: "brakes squeal squeak rubbing pads worn long lever pull weak stopping rim brake v-brake",
    },
    {
      id: "disc",
      name: "Disc brake alignment",
      category: "Brakes",
      labour: 2500,
      parts: 3000,
      minutes: 30,
      mechanic: "eirlys",
      short: "Fix the scrape and check the stopping power.",
      suitable: "A rubbing mechanical or hydraulic disc brake with sound components.",
      steps: [
        "Inspect rotor wear, mounting bolts and pad condition.",
        "Align the caliper and assess rotor runout.",
        "Bed in adjusted or replaced pads where appropriate.",
      ],
      note: "For one brake. A bent rotor, contaminated pads or hydraulic fault may need separate work.",
      art: "disc.svg",
      keywords: "disc brakes rubbing scrape scraping squeal squeak ting rotor pads noise",
    },
    {
      id: "bleed",
      name: "Hydraulic brake bleed",
      category: "Brakes",
      labour: 4500,
      parts: 1500,
      minutes: 45,
      mechanic: "eirlys",
      short: "Fresh fluid and a properly assessed lever.",
      suitable: "A compatible hydraulic brake with a soft or inconsistent lever.",
      steps: [
        "Check for leaks and identify the correct fluid and bleed procedure.",
        "Bleed one brake, clean contact surfaces and check the system.",
        "Assess lever feel, pad clearance and braking under load.",
      ],
      note: "One brake, using the correct fluid. A leak or damaged hose must be repaired first; some systems need specialist referral.",
      art: "bleed.svg",
      keywords: "spongy soft lever hydraulic fluid brakes pull to the bar weak",
    },
    {
      id: "gears",
      name: "Gear adjustment",
      category: "Drivetrain",
      labour: 3000,
      parts: 0,
      minutes: 35,
      mechanic: "bertram",
      short: "Shifts that arrive where you ask them to.",
      suitable: "A mechanical derailleur system that hesitates, chatters or overshifts.",
      steps: [
        "Inspect cable movement, chain wear and hanger alignment.",
        "Set limit screws, cable tension and derailleur clearance.",
        "Check every gear under light load and explain any wear.",
      ],
      note: "Includes adjustment of one or two derailleurs. A bent hanger, worn drivetrain or new cables are additional.",
      art: "gears.svg",
      keywords: "gears skipping slipping jumping chatter noise clicking ticking shifting indexing derailleur",
    },
    {
      id: "chain",
      name: "Chain replacement",
      category: "Drivetrain",
      labour: 2000,
      parts: 3500,
      minutes: 25,
      mechanic: "bertram",
      short: "Measured, matched and cut to the right length.",
      suitable: "A chain at its wear limit, before it damages more expensive parts.",
      steps: [
        "Measure wear and check cassette and chainring condition.",
        "Select a compatible chain, size and install it correctly.",
        "Lubricate and test under load for skipping.",
      ],
      note: "The parts allowance covers a typical mechanical chain. A worn cassette may need replacement to prevent skipping.",
      art: "chain.svg",
      keywords: "chain stretch stretched worn skipping slipping noise squeak rusty jumping",
    },
    {
      id: "cassette",
      name: "Cassette replacement",
      category: "Drivetrain",
      labour: 2500,
      parts: 6500,
      minutes: 35,
      mechanic: "bertram",
      short: "Fresh teeth for a drivetrain that has done its miles.",
      suitable: "A worn cassette or a suitable change of gearing.",
      steps: [
        "Check freehub fit, gear range and derailleur capacity.",
        "Remove the old cassette, clean the freehub and install the new one correctly.",
        "Check chain compatibility, indexing and shifting under load.",
      ],
      note: "A new chain is commonly needed too. Confirm range changes with us before ordering parts.",
      art: "cassette.svg",
      keywords: "cassette sprockets skipping slipping worn teeth gears jumping range",
    },
    {
      id: "wheel",
      name: "Wheel true & tension",
      category: "Wheels",
      labour: 3500,
      parts: 500,
      minutes: 45,
      mechanic: "taran",
      short: "A wheel that runs straight and carries load evenly.",
      suitable: "A modest lateral wobble in a serviceable spoked wheel.",
      steps: [
        "Inspect the rim, hub, spoke condition and overall tension.",
        "Correct lateral and radial runout within safe limits.",
        "Balance tension and stress-relieve the wheel.",
      ],
      note: "Per wheel. A cracked rim, severely damaged wheel or seized nipples may need a rebuild or replacement.",
      art: "wheel.svg",
      keywords: "wobble wobbly buckle buckled bent wheel true spoke broken spoke rubbing",
    },
    {
      id: "bearings",
      name: "Bearing service",
      category: "Bearings",
      labour: 5000,
      parts: 2500,
      minutes: 60,
      mechanic: "taran",
      short: "Find the roughness behind the rumble.",
      suitable: "A serviceable hub, headset or bottom bracket that needs care.",
      steps: [
        "Identify the bearing system and inspect for play or roughness.",
        "Clean and adjust serviceable bearings, or quote compatible replacement.",
        "Reassemble, torque correctly and check smooth operation.",
      ],
      note: "One bearing assembly. Press-fit, proprietary or seized systems need a compatibility check first.",
      art: "bearings.svg",
      keywords: "creak creaking click clicking knocking rumble play headset bottom bracket hub grinding noise",
    },
    {
      id: "cables",
      name: "Cable & housing replacement",
      category: "Controls",
      labour: 3500,
      parts: 2500,
      minutes: 45,
      mechanic: "eirlys",
      short: "Lighter action starts with a clear path.",
      suitable: "A stiff, corroded or frayed mechanical brake or gear cable.",
      steps: [
        "Inspect the full cable route and any damaged stops.",
        "Install a new inner cable and housing with sealed ends.",
        "Set tension, trim and cap the cable, then test its operation.",
      ],
      note: "One cable run. Internal routing and handlebar tape replacement can add time and parts.",
      art: "cables.svg",
      keywords: "stiff sticky cable frayed rusty shifting heavy brakes slow return",
    },
    {
      id: "fit",
      name: "Contact point setup",
      category: "Controls",
      labour: 4500,
      parts: 1000,
      minutes: 45,
      mechanic: "eirlys",
      short: "Small position changes, carefully agreed.",
      suitable: "A saddle, bar or lever position that needs checking for your everyday ride.",
      steps: [
        "Talk through your current position and riding needs.",
        "Check safe adjustment limits and make agreed saddle or lever changes.",
        "Torque the adjusted parts and take a short comfort check ride.",
      ],
      note: "A practical setup conversation, not a clinical bike fit. Persistent pain should be discussed with a qualified health care professional.",
      art: "fit.svg",
      keywords: "saddle height position comfort knee back reach handlebar setup",
      perBike: true,
    },
  ];
  const TEAM = [
    {
      id: "eirlys",
      name: "Mina Thao",
      role: "Brakes & contact points",
      image: "mechanic-1.svg",
      experience: "Twelve years of workshop practice",
      copy: "Mina likes a clear lever feel, tidy cable routing and the moment a rider understands what a small adjustment has changed.",
      approach: "Bring a description of the problem in your own words. There is no special vocabulary needed.",
      specialisms: ["Rim and disc brakes", "Hydraulic systems", "Everyday riding position"],
    },
    {
      id: "bertram",
      name: "Bert Renner",
      role: "Drivetrains & complete services",
      image: "mechanic-2.svg",
      experience: "Fifteen years keeping bikes moving",
      copy: "Bert looks after workhorse commuters and well-loved touring bikes. He measures first, cleans properly and tries an adjustment before reaching for a new part.",
      approach: "A noisy gear can have several causes. We work through them, show the wear and explain the options.",
      specialisms: ["Mechanical gears", "Chain and cassette wear", "Complete rebuilds"],
    },
    {
      id: "taran",
      name: "Dara Brody",
      role: "Wheels, tires & bearings",
      image: "mechanic-3.svg",
      experience: "Nine years at the wheel stand",
      copy: "Dara enjoys the patient work: a balanced wheel, a tire that seats evenly and a hub that turns smoothly under load.",
      approach: "Tell us where you ride and what you carry. Tires and wheels should suit the actual journey.",
      specialisms: ["Wheel tension", "Tubeless care", "Serviceable bearings"],
    },
  ];
  const GUIDES = [
    {
      id: "pressure",
      title: "A pressure check worth making",
      category: "care",
      art: "note-pressure.svg",
      intro:
        "The sidewall gives a limit, not a personal setting. Rider weight, tire width, load and the surface all matter.",
      points: [
        "Check pressure before a long ride using a reliable gauge. A thumb squeeze is a rough clue, not a measurement.",
        "Stay within both tire and rim limits. If those limits differ, follow the lower maximum.",
        "Make small changes and note how the bike feels. Do not compensate for a damaged tire by adding pressure.",
      ],
      warning: "Bulges, exposed casing or a damaged bead mean the tire needs professional assessment before riding.",
    },
    {
      id: "chain-care",
      title: "Clean chain, quieter ride",
      category: "care",
      art: "note-chain.svg",
      intro: "A little regular attention does more than a thick layer of fresh oil over road grit.",
      points: [
        "Wipe the chain with a cloth, keeping fingers clear of moving sprockets.",
        "Apply a suitable bicycle lubricant sparingly to the rollers. Let it settle, then wipe the outside.",
        "Keep oil away from brake pads, rotors and wheel rims. Ask us to measure chain wear during a visit.",
      ],
      warning: "Do not use a high-pressure washer around bearings or electrical connections.",
    },
    {
      id: "brake-noise",
      title: "When a brake starts talking",
      category: "symptoms",
      art: "note-brake.svg",
      intro:
        "A little noise in the wet can be ordinary. A new scrape, grinding sound or loss of braking is a reason to stop and check.",
      points: [
        "Check that the wheel is seated securely before investigating further.",
        "Look for visible damage or debris without touching a hot disc rotor.",
        "Avoid spraying lubricant anywhere near a brake. Contaminated pads may need replacing.",
      ],
      warning: "Stop riding if braking is weak, inconsistent or mechanically damaged. Arrange a workshop inspection.",
    },
    {
      id: "gears-skip",
      title: "Why a gear skips under load",
      category: "symptoms",
      art: "note-gears.svg",
      intro: "An adjustment can help some shifting problems. A worn chain and cassette need a different conversation.",
      points: [
        "Note whether it happens in one gear or across several, and whether the chain tries to change gear.",
        "Tell the mechanic about a recent wheel removal, fall or chain replacement.",
        "Avoid hard efforts while the drivetrain skips. Sudden loss of drive can cause a fall.",
      ],
      warning: "Do not assume tightening a cable will cure wear. A measured inspection comes first.",
    },
    {
      id: "wet-ride",
      title: "After the wet ride",
      category: "care",
      art: "note-wet.svg",
      intro:
        "You do not need a spotless bicycle every evening. Dry contact points and a wiped drivetrain are a useful start.",
      points: [
        "Let the bike drain, then wipe the frame and chain with a clean cloth.",
        "Check that lights work, remove wet bags and dry contact points before storage.",
        "Inspect brake wear more often through gritty weather and keep an eye on cable movement.",
      ],
      warning:
        "Follow the manufacturer instructions for an e-bike. Do not open a battery pack or dry it with direct heat.",
    },
    {
      id: "long-loop",
      title: "Pack for the longer loop",
      category: "riding",
      art: "note-kit.svg",
      intro: "Carry the things you know how to use. A small, well-chosen kit is better than a bag of unfamiliar tools.",
      points: [
        "Pack a correct spare tube, tire levers, a working pump and the tool needed to remove your wheel.",
        "Add water, food, a layer and a way to contact someone if plans change.",
        "Check your route, daylight and weather. Tell someone your plan if riding alone.",
      ],
      warning: "Practice a wheel removal at home. Some bikes need special tools or procedures.",
    },
    {
      id: "stored-bike",
      title: "Back out of the shed",
      category: "riding",
      art: "note-shed.svg",
      intro: "A bike that was fine last season still needs a fresh check before its first ride back.",
      points: [
        "Inspect tires for cracking and inflate within the stated limits.",
        "Check wheel attachment, steering, brake operation and free movement of the drivetrain.",
        "Start with a short, gentle ride somewhere quiet. Stop if something feels loose or unreliable.",
      ],
      warning: "Visible frame damage, a seized part or unreliable braking should be inspected before riding.",
    },
    {
      id: "wheel-wobble",
      title: "A wobble is worth checking",
      category: "symptoms",
      art: "note-wobble.svg",
      intro: "A wheel can appear out of line because of the rim, tire seating or how it sits in the frame.",
      points: [
        "Look for a tire bead that sits unevenly, and check that the wheel is correctly secured.",
        "Check for a broken spoke without putting fingers into a moving wheel.",
        "Explain when the wobble started and whether there was an impact. A photo can help the conversation.",
      ],
      warning: "Do not ride a cracked rim, loose wheel or badly damaged tire. Transport the bike instead.",
    },
  ];
  const CHECKS = [
    {
      id: "tyres",
      title: "Tires: pressure and condition",
      copy: "Check pressure with a gauge and look for cuts, bulges or anything lodged in the tread.",
      kinds: ["daily", "weekend", "loaded"],
      wet: false,
    },
    {
      id: "wheels",
      title: "Wheels: seated and secure",
      copy: "Check wheel attachment using the correct procedure for your bike. Spin each wheel and listen.",
      kinds: ["daily", "weekend", "loaded"],
      wet: false,
    },
    {
      id: "brakes",
      title: "Brakes: both working properly",
      copy: "Check each brake separately at walking pace. Stop if the lever, pad or stopping force feels wrong.",
      kinds: ["daily", "weekend", "loaded"],
      wet: false,
    },
    {
      id: "steering",
      title: "Steering and contact points",
      copy: "Check that the bar, stem and saddle are secure, without play or unusual movement.",
      kinds: ["daily", "weekend", "loaded"],
      wet: false,
    },
    {
      id: "chain",
      title: "Chain and shifting",
      copy: "Check that the chain is lubricated and gears move cleanly. Keep hands clear of a moving drivetrain.",
      kinds: ["daily", "weekend", "loaded"],
      wet: false,
    },
    {
      id: "visibility",
      title: "Lights and being seen",
      copy: "Check front and rear lights, reflectors and battery levels. Carry a backup for a long day.",
      kinds: ["daily", "weekend", "loaded"],
      wet: false,
    },
    {
      id: "repair-kit",
      title: "A repair kit you can use",
      copy: "Carry a suitable tube, pump, levers and any wheel-removal tool your bike needs.",
      kinds: ["weekend", "loaded"],
      wet: false,
    },
    {
      id: "fuel",
      title: "Water, food and a spare layer",
      copy: "Match supplies to the route, weather and the time until the next reliable stop.",
      kinds: ["weekend", "loaded"],
      wet: false,
    },
    {
      id: "route",
      title: "Route, daylight and a way home",
      copy: "Check the route, charge your phone and plan an alternative if the ride needs to end early.",
      kinds: ["weekend", "loaded"],
      wet: false,
    },
    {
      id: "luggage",
      title: "Luggage balanced and attached",
      copy: "Check rack fasteners, bag clips and heel clearance. Keep loads clear of wheels and brakes.",
      kinds: ["loaded"],
      wet: false,
    },
    {
      id: "overnight",
      title: "Overnight kit and next-day needs",
      copy: "Check shelter, dry clothes and charging plans. Leave room for food and an unexpected extra layer.",
      kinds: ["loaded"],
      wet: false,
    },
    {
      id: "wet-grip",
      title: "Wet-weather grip and stopping room",
      copy: "Allow more distance, avoid abrupt moves and check brake contact surfaces for grit.",
      kinds: ["daily", "weekend", "loaded"],
      wet: true,
    },
    {
      id: "rain-layer",
      title: "Rain layer and dry essentials",
      copy: "Pack a waterproof layer and protect your phone, keys and spare clothing from water.",
      kinds: ["daily", "weekend", "loaded"],
      wet: true,
    },
  ];

  const SERVICE_MAP = Object.fromEntries(SERVICES.map((item) => [item.id, item]));
  const TEAM_MAP = Object.fromEntries(TEAM.map((person) => [person.id, person]));
  const CHECK_MAP = Object.fromEntries(CHECKS.map((item) => [item.id, item]));
  const has = (map, key) => typeof key === "string" && Object.prototype.hasOwnProperty.call(map, key);
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
  const money = (value) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value / 100);
  const escape = (value) =>
    String(value).replace(
      /[&<>"']/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
    );
  const plural = (count, one, many = one + "s") => `${count} ${count === 1 ? one : many}`;
  // Whole-bike packages (perBike) make sense once per bike; per-wheel or per-brake jobs go up to four.
  const maxQty = (id) => (has(SERVICE_MAP, id) && SERVICE_MAP[id].perBike ? 1 : 4);
  const boundedQty = (value, id) =>
    Number.isFinite(Number(value)) ? Math.min(maxQty(id), Math.max(1, Math.trunc(Number(value)))) : 1;
  // Keep a copy on every write: if storage becomes unavailable mid-session, reads still work.
  const safeStorage = (() => {
    const memory = new Map();
    return {
      getItem(key) {
        // A value that couldn't be written (storage full, for example) is only in memory, and is the newest.
        if (memory.has(key)) return memory.get(key);
        try {
          return window.localStorage.getItem(key);
        } catch {
          /* Sandboxed previews and strict privacy can block storage. */
          return null;
        }
      },
      setItem(key, value) {
        try {
          window.localStorage.setItem(key, String(value));
          memory.delete(key);
        } catch {
          /* Memory retains the state. */
          memory.set(key, String(value));
        }
      },
      removeItem(key) {
        memory.delete(key);
        try {
          window.localStorage.removeItem(key);
        } catch {
          /* Already removed in memory. */
        }
      },
    };
  })();
  function readJSON(key) {
    const raw = safeStorage.getItem(key);
    if (raw === null) return null;
    try {
      return JSON.parse(raw);
    } catch {
      safeStorage.removeItem(key);
      return null;
    }
  }
  function cleanPlan(value) {
    const clean = { jobs: [], bike: "standard", parts: "everyday" };
    if (!value || typeof value !== "object" || Array.isArray(value)) return clean;
    if (has(BIKE_TYPES, value.bike)) clean.bike = value.bike;
    if (has(PARTS_GRADES, value.parts)) clean.parts = value.parts;
    if (!Array.isArray(value.jobs)) return clean;
    value.jobs.slice(0, 64).forEach((job) => {
      if (!job || typeof job !== "object" || !has(SERVICE_MAP, job.id)) return;
      const existing = clean.jobs.find((item) => item.id === job.id);
      const qty = boundedQty(job.qty, job.id);
      if (existing) existing.qty = Math.min(maxQty(job.id), existing.qty + qty);
      else clean.jobs.push({ id: job.id, qty });
    });
    return clean;
  }
  function readPlan() {
    const raw = readJSON(STORAGE_KEYS.plan);
    const clean = cleanPlan(raw);
    if (raw !== null) safeStorage.setItem(STORAGE_KEYS.plan, JSON.stringify(clean));
    return clean;
  }
  function writePlan(plan) {
    safeStorage.setItem(STORAGE_KEYS.plan, JSON.stringify(cleanPlan(plan)));
  }
  function cleanChecks(value) {
    const clean = { kind: "daily", weather: "dry", done: [] };
    if (!value || typeof value !== "object" || Array.isArray(value)) return clean;
    if (has(RIDE_TYPES, value.kind)) clean.kind = value.kind;
    if (["dry", "wet"].includes(value.weather)) clean.weather = value.weather;
    if (Array.isArray(value.done)) clean.done = [...new Set(value.done.filter((id) => has(CHECK_MAP, id)))];
    return clean;
  }
  function readChecks() {
    const raw = readJSON(STORAGE_KEYS.checks);
    const clean = cleanChecks(raw);
    if (raw !== null) safeStorage.setItem(STORAGE_KEYS.checks, JSON.stringify(clean));
    return clean;
  }
  function writeChecks(state) {
    safeStorage.setItem(STORAGE_KEYS.checks, JSON.stringify(cleanChecks(state)));
  }
  let noticeTimer;
  function announce(message) {
    const notice = $("#notice");
    clearTimeout(noticeTimer);
    notice.textContent = message;
    notice.hidden = false;
    noticeTimer = setTimeout(() => {
      notice.hidden = true;
    }, 5000);
  }
  function planTotals(plan) {
    let labour = 0,
      parts = 0,
      minutes = 0,
      count = 0;
    plan.jobs.forEach((job) => {
      if (!has(SERVICE_MAP, job.id)) return;
      const service = SERVICE_MAP[job.id];
      labour += service.labour * job.qty;
      parts += Math.round(service.parts * PARTS_GRADES[plan.parts].multiplier) * job.qty;
      minutes += service.minutes * job.qty;
      count += job.qty;
    });
    const complexity = Math.round(labour * BIKE_TYPES[plan.bike].rate);
    return { labour, parts, complexity, total: labour + parts + complexity, minutes, count };
  }
  const partsLabel = (item, plan) =>
    item.parts ? `${money(Math.round(item.parts * PARTS_GRADES[plan.parts].multiplier))} parts` : "parts to confirm";
  function planText(plan) {
    const totals = planTotals(plan);
    const jobs = plan.jobs.map((job) => `${job.qty} × ${SERVICE_MAP[job.id].name}`).join("\n");
    return `Cogmere repair estimate\n${jobs || "No repairs selected"}\nBike: ${BIKE_TYPES[plan.bike].label}\nParts: ${PARTS_GRADES[plan.parts].label}\nLabor: ${money(totals.labour)}\nBike complexity: ${money(totals.complexity)}\nParts allowance: ${money(totals.parts)}\nEstimated total: ${money(totals.total)} before sales tax\nSubject to inspection; no work or parts authorized.`;
  }
  function addJob(id) {
    if (!has(SERVICE_MAP, id)) return;
    const plan = readPlan();
    const job = plan.jobs.find((item) => item.id === id);
    if (job && job.qty >= maxQty(id)) {
      announce(
        maxQty(id) === 1
          ? `${SERVICE_MAP[id].name} is already in your plan. It covers the whole bike.`
          : `${SERVICE_MAP[id].name} is already at the maximum of four.`,
      );
      return;
    }
    if (job) job.qty += 1;
    else plan.jobs.push({ id, qty: 1 });
    writePlan(plan);
    announce(`${SERVICE_MAP[id].name} added to your repair plan.`);
    renderEstimate();
  }
  function serviceCard(item) {
    return `<article class="service-card flex flex-col"><a href="service.html?repair=${item.id}" class="block" tabindex="-1" aria-hidden="true"><img src="assets/img/${item.art}" width="240" height="250" alt="" class="aspect-[1.35] w-full object-contain bg-mist" loading="lazy"></a><div class="flex flex-1 flex-col p-3 sm:p-5"><p class="eyebrow text-blue">${escape(item.category)}</p><h3 class="mt-2 text-base font-bold leading-tight sm:mt-3 sm:text-xl"><a href="service.html?repair=${item.id}" class="hover:underline">${escape(item.name)}</a></h3><p class="mt-3 hidden flex-1 text-sm leading-relaxed text-muted sm:block">${escape(item.short)}</p><div class="mt-auto border-t border-line pt-3 sm:mt-5 sm:pt-4"><p class="font-semibold">${money(item.labour)} <span class="text-xs font-normal text-muted">labor</span></p><p class="mt-1 text-xs text-muted">${item.minutes} min · ${item.parts ? `${money(item.parts)} typical parts` : "parts to confirm"}</p></div><button class="btn btn-line btn-small mt-3 w-full sm:mt-4" data-add-repair="${item.id}" aria-label="Add repair: ${escape(item.name)}">Add repair <span aria-hidden="true">+</span></button></div></article>`;
  }
  // Search splits the query into words; every word must appear somewhere in the item's text.
  const searchWords = (value) =>
    String(value || "")
      .toLocaleLowerCase("en-US")
      .split(/[^a-z0-9$'-]+/)
      .filter(Boolean)
      .slice(0, 8);
  const matchesAll = (words, text) => {
    const haystack = text.toLocaleLowerCase("en-US");
    return words.every((word) => haystack.includes(word.length > 4 && word.endsWith("s") ? word.slice(0, -1) : word));
  };
  function initServiceBoard() {
    const grid = $("[data-service-grid]");
    if (!grid) return;
    let category = "All repairs";
    const filters = $("[data-service-filters]");
    filters.innerHTML = SERVICE_CATEGORIES.map(
      (name) =>
        `<button class="chip" type="button" data-service-category="${name}" aria-pressed="${name === category}">${name}</button>`,
    ).join("");
    const search = $("[data-service-search]"),
      sort = $("[data-service-sort]");
    function render() {
      const words = searchWords(search.value);
      const matches = SERVICES.filter(
        (item) =>
          (category === "All repairs" || item.category === category) &&
          matchesAll(
            words,
            `${item.name} ${item.category} ${item.keywords} ${item.short} ${item.suitable} ${item.steps.join(" ")} ${item.note}`,
          ),
      );
      if (sort.value === "price") matches.sort((a, b) => a.labour - b.labour);
      if (sort.value === "time") matches.sort((a, b) => a.minutes - b.minutes);
      grid.innerHTML = matches.map(serviceCard).join("");
      $("[data-service-count]").textContent = `${plural(matches.length, "repair")} on the board`;
      $("[data-service-empty]").hidden = matches.length !== 0;
      $$("[data-service-category]").forEach((button) =>
        button.setAttribute("aria-pressed", String(button.dataset.serviceCategory === category)),
      );
    }
    filters.addEventListener("click", (event) => {
      const button = event.target.closest("[data-service-category]");
      if (!button || !SERVICE_CATEGORIES.includes(button.dataset.serviceCategory)) return;
      category = button.dataset.serviceCategory;
      render();
    });
    search.addEventListener("input", render);
    sort.addEventListener("change", render);
    $("[data-reset-filters]").addEventListener("click", () => {
      category = "All repairs";
      search.value = "";
      sort.value = "recommended";
      render();
      search.focus();
    });
    render();
  }
  function initServiceDetail() {
    const root = $("[data-service-detail]");
    if (!root) return;
    const requested = new URLSearchParams(location.search).get("repair");
    const item = has(SERVICE_MAP, requested) ? SERVICE_MAP[requested] : SERVICE_MAP.check;
    const person = TEAM_MAP[item.mechanic];
    document.title = `${item.name} — Cogmere Bicycle Workshop`;
    root.innerHTML = `<section class="border-b border-ink bg-mist"><div class="wrap grid items-center gap-9 py-10 md:grid-cols-[1.5fr_1fr] md:py-14"><div><a href="services.html" class="text-link text-sm">All repairs</a><p class="eyebrow mt-7 text-blue">${escape(item.category)} / REPAIR NOTES</p><h1 class="mt-4 text-[clamp(2.5rem,5.4vw,4.75rem)] font-black leading-[1.02] tracking-tight">${escape(item.name)}</h1><p class="mt-6 max-w-xl text-lg text-muted">${escape(item.short)}</p><div class="mt-7 flex flex-wrap gap-3"><button class="btn" data-add-repair="${item.id}" aria-label="Add repair to estimate: ${escape(item.name)}">Add repair to estimate</button><a class="btn btn-line" href="book.html?repair=${item.id}">Arrange a drop-off</a></div></div><img class="max-h-80 w-full object-contain" src="assets/img/${item.art}" width="240" height="250" alt="Technical drawing for ${escape(item.name.toLowerCase())}"></div></section><section class="wrap grid items-start gap-10 py-14 lg:grid-cols-[1.4fr_1fr]"><div><p class="eyebrow text-blue">WHEN IT MAKES SENSE</p><h2 class="mt-4 text-3xl font-bold">The right job for your bike.</h2><p class="mt-5 text-lg leading-relaxed text-muted">${escape(item.suitable)}</p><h2 class="mt-10 text-3xl font-bold">What happens on the stand.</h2><ol class="mt-6 space-y-5">${item.steps.map((step, index) => `<li class="flex gap-4 border-b border-line pb-5"><span class="font-display text-2xl font-bold text-blue">0${index + 1}</span><p class="pt-1 leading-relaxed">${escape(step)}</p></li>`).join("")}</ol><div class="mt-8 border-l-4 border-blue bg-mist p-5"><h3 class="font-semibold">Before you decide</h3><p class="mt-3 text-sm leading-relaxed text-muted">${escape(item.note)}</p></div></div><aside class="border border-ink bg-white p-7"><p class="eyebrow text-blue">THE WORKSHOP TICKET</p><dl class="mt-6 space-y-5"><div class="flex justify-between gap-4"><dt>Labor</dt><dd class="text-2xl font-bold">${money(item.labour)}</dd></div><div class="flex justify-between gap-4"><dt>Typical parts allowance</dt><dd>${item.parts ? money(item.parts) : "Parts to confirm"}</dd></div><div class="flex justify-between gap-4"><dt>Approximate bench time</dt><dd>${item.minutes} min</dd></div></dl><p class="mt-6 border-t border-line pt-5 text-sm leading-relaxed text-muted">Prices don't include sales tax. ${item.parts ? "Parts depend on compatibility." : "Most bikes need no parts for this job; if one does, we confirm it with you first."} Cargo, e-bike and internal-routing complexity may add labor. Your estimate shows these choices.</p><div class="mt-7 flex items-center gap-4"><img class="size-16 object-cover" src="assets/img/${person.image}" width="240" height="250" alt=""><div><p class="text-sm font-semibold">${escape(person.name)}</p><p class="mt-1 text-xs text-muted">${escape(person.role)}</p></div></div><a class="text-link mt-5 inline-block text-sm" href="workshop.html">Meet the workshop</a></aside></section>`;
  }
  function renderEstimate() {
    const root = $("[data-estimate-lines]");
    if (!root) return;
    const plan = readPlan(),
      totals = planTotals(plan);
    $("[data-bike-type]").value = plan.bike;
    $("[data-parts-grade]").value = plan.parts;
    root.innerHTML = plan.jobs
      .map((job) => {
        const item = SERVICE_MAP[job.id];
        return `<article class="grid gap-4 border border-line bg-white p-5 sm:grid-cols-[72px_1fr]"><img class="w-18" src="assets/img/${item.art}" width="240" height="250" alt=""><div class="min-w-0"><div class="flex items-start justify-between gap-3"><h3 class="text-lg font-bold"><a class="hover:underline" href="service.html?repair=${item.id}">${escape(item.name)}</a></h3><button type="button" class="text-link text-sm" data-remove-repair="${item.id}" aria-label="Remove ${escape(item.name)}">Remove</button></div><p class="mt-2 text-sm text-muted">${money(item.labour)} labor + ${partsLabel(item, plan)} ${item.perBike ? "for the whole bike" : "per job"}</p><div class="mt-4 flex flex-wrap items-center justify-between gap-4">${item.perBike ? '<p class="text-sm">One per bike</p>' : `<div class="flex items-center gap-3"><label class="text-sm" for="qty-${item.id}">Quantity</label><input id="qty-${item.id}" class="field w-20" type="number" min="1" max="4" step="1" value="${job.qty}" data-job-qty="${item.id}"></div>`}<p class="font-semibold">${money((item.labour + Math.round(item.parts * PARTS_GRADES[plan.parts].multiplier)) * job.qty)}</p></div></div></article>`;
      })
      .join("");
    $("[data-plan-count]").textContent = plural(totals.count, "job");
    $("[data-estimate-empty]").hidden = plan.jobs.length !== 0;
    $("[data-labour-total]").textContent = money(totals.labour);
    $("[data-complexity-total]").textContent = money(totals.complexity);
    $("[data-parts-total]").textContent = money(totals.parts);
    $("[data-estimate-total]").textContent = money(totals.total);
    $("[data-bench-total]").textContent = `${totals.minutes} minutes approximate combined bench time.`;
    const ids = plan.jobs.map((job) => job.id);
    const notes = [];
    if (
      (ids.includes("service") || ids.includes("overhaul")) &&
      ids.some((id) => ["gears", "rim", "check"].includes(id))
    )
      notes.push(
        "A complete tune-up includes routine brake and gear adjustment and a safety inspection. We will remove duplicated work from the final quote after seeing the bike.",
      );
    if (ids.includes("overhaul") && ids.includes("service"))
      notes.push(
        "An everyday tune-up and a full teardown & rebuild cover the same bike. Choose one package, or tell us if these are for different bikes.",
      );
    if (plan.parts === "labour" && ids.length)
      notes.push(
        "Parts are not included in this estimate. We confirm compatibility and the exact parts cost before starting.",
      );
    if (plan.bike === "electric" && ids.length)
      notes.push("Mechanical work only. We do not open battery packs, motors or electronic control systems.");
    const copyArea = $("[data-copy-fallback]");
    if (copyArea) copyArea.value = planText(plan);
    $("[data-overlap-notes]").innerHTML = notes
      .map((note) => `<p class="border-l-4 border-blue bg-mist p-4 text-sm leading-relaxed">${note}</p>`)
      .join("");
  }
  function initEstimate() {
    const select = $("[data-add-service]");
    if (!select) return;
    select.innerHTML = SERVICES.map(
      (item) => `<option value="${item.id}">${escape(item.name)} — ${money(item.labour)} labor</option>`,
    ).join("");
    const requested = new URLSearchParams(location.search).get("repair");
    if (has(SERVICE_MAP, requested)) select.value = requested;
    $("[data-add-job]").addEventListener("submit", (event) => {
      event.preventDefault();
      addJob(select.value);
    });
    [
      ["[data-bike-type]", "bike", BIKE_TYPES],
      ["[data-parts-grade]", "parts", PARTS_GRADES],
    ].forEach(([selector, key, map]) => {
      $(selector).addEventListener("change", (event) => {
        if (!has(map, event.target.value)) return;
        const plan = readPlan();
        plan[key] = event.target.value;
        writePlan(plan);
        renderEstimate();
        announce("Estimate settings updated.");
      });
    });
    $("[data-estimate-lines]").addEventListener("change", (event) => {
      const input = event.target.closest("[data-job-qty]");
      if (!input || !has(SERVICE_MAP, input.dataset.jobQty)) return;
      const plan = readPlan(),
        job = plan.jobs.find((item) => item.id === input.dataset.jobQty);
      if (!job) return;
      job.qty = boundedQty(input.value, job.id);
      writePlan(plan);
      renderEstimate();
      $(`#qty-${job.id}`)?.focus();
      announce("Repair quantity updated.");
    });
    $("[data-estimate-lines]").addEventListener("click", (event) => {
      const button = event.target.closest("[data-remove-repair]");
      if (!button || !has(SERVICE_MAP, button.dataset.removeRepair)) return;
      const plan = readPlan(),
        id = button.dataset.removeRepair;
      const index = plan.jobs.findIndex((item) => item.id === id);
      plan.jobs = plan.jobs.filter((item) => item.id !== id);
      writePlan(plan);
      renderEstimate();
      const buttons = $$("[data-remove-repair]");
      (buttons[Math.min(index, buttons.length - 1)] || select).focus();
      announce(`${SERVICE_MAP[id].name} removed from your repair plan.`);
    });
    $("[data-clear-plan]").addEventListener("click", () => {
      const plan = readPlan();
      plan.jobs = [];
      writePlan(plan);
      renderEstimate();
      select.focus();
      announce("Repair plan cleared.");
    });
    $("[data-copy-estimate]").addEventListener("click", async () => {
      const text = planText(readPlan());
      try {
        await navigator.clipboard.writeText(text);
        announce("Estimate copied. It is not a booking or work authorization.");
      } catch {
        let area = $("[data-copy-fallback]");
        if (!area) {
          area = document.createElement("textarea");
          area.setAttribute("aria-label", "Repair estimate to copy");
          area.setAttribute("readonly", "");
          area.rows = 10;
          area.dataset.copyFallback = "";
          area.className = "field mt-4";
          $("[data-overlap-notes]").before(area);
        }
        area.value = text;
        area.focus();
        area.select();
        announce("Copy is unavailable here. Select and copy the estimate text shown below your repair plan.");
      }
    });
    renderEstimate();
  }
  function dateKey(date) {
    return date.toISOString().slice(0, 10);
  }
  function dateFromKey(key) {
    return new Date(`${key}T12:00:00Z`);
  }
  function todayKey() {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date());
    const part = (type) => parts.find((item) => item.type === type).value;
    return `${part("year")}-${part("month")}-${part("day")}`;
  }
  function addDays(key, days) {
    const date = dateFromKey(key);
    date.setUTCDate(date.getUTCDate() + days);
    return dateKey(date);
  }
  // The nth (1 = first) given weekday (0 = Sunday) of a zero-based month.
  function nthWeekday(year, month, weekday, n) {
    const date = new Date(Date.UTC(year, month, 1, 12));
    date.setUTCDate(1 + ((weekday - date.getUTCDay() + 7) % 7) + (n - 1) * 7);
    return dateKey(date);
  }
  function lastMonday(year, month) {
    const date = new Date(Date.UTC(year, month + 1, 0, 12));
    date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7));
    return dateKey(date);
  }
  // US federal holidays for a year. A date-fixed holiday closes on the day itself and on the weekday it's
  // observed: Friday when it falls on a Saturday, Monday when it falls on a Sunday.
  function bankHolidays(year) {
    const days = new Set();
    const fixed = (month, day) => {
      const key = `${year}-${month}-${day}`,
        weekday = dateFromKey(key).getUTCDay();
      days.add(key);
      if (weekday === 6) days.add(addDays(key, -1));
      if (weekday === 0) days.add(addDays(key, 1));
    };
    fixed("01", "01"); // New Year's Day.
    days.add(nthWeekday(year, 0, 1, 3)); // Martin Luther King Jr. Day.
    days.add(nthWeekday(year, 1, 1, 3)); // Presidents' Day.
    days.add(lastMonday(year, 4)); // Memorial Day.
    fixed("06", "19"); // Juneteenth.
    fixed("07", "04"); // Independence Day.
    days.add(nthWeekday(year, 8, 1, 1)); // Labor Day.
    days.add(nthWeekday(year, 9, 1, 2)); // Columbus Day.
    fixed("11", "11"); // Veterans Day.
    days.add(nthWeekday(year, 10, 4, 4)); // Thanksgiving Day.
    fixed("12", "25"); // Christmas Day.
    // Next New Year's Day on a Saturday is observed on December 31 of this year.
    if (dateFromKey(`${year + 1}-01-01`).getUTCDay() === 6) days.add(`${year}-12-31`);
    return days;
  }
  function isOpeningDay(key) {
    const date = dateFromKey(key),
      weekday = date.getUTCDay();
    return (
      weekday >= 2 && weekday <= 6 && !bankHolidays(date.getUTCFullYear()).has(key) && !EXTRA_CLOSURES.includes(key)
    );
  }
  function openingDates() {
    const today = todayKey();
    if (Array.isArray(FIXED_OPENING_DATES)) {
      const validDates = FIXED_OPENING_DATES.filter((key) => {
        if (typeof key !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(key) || key <= today) return false;
        const date = dateFromKey(key);
        return !Number.isNaN(date.getTime()) && dateKey(date) === key && isOpeningDay(key);
      });
      return [...new Set(validDates)].sort().slice(0, 10);
    }
    const dates = [];
    for (let offset = 1; offset < 90 && dates.length < 10; offset++) {
      const key = addDays(today, offset);
      if (isOpeningDay(key)) dates.push(key);
    }
    return dates;
  }
  function longDate(key) {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: TIME_ZONE,
    }).format(dateFromKey(key));
  }
  function initBooking() {
    const form = $("[data-booking-form]");
    if (!form) return;
    const dates = openingDates(),
      dateSelect = $("[data-book-date]"),
      mechanicSelect = $("[data-book-mechanic]");
    dateSelect.innerHTML = dates.map((key) => `<option value="${key}">${longDate(key)}</option>`).join("");
    mechanicSelect.insertAdjacentHTML(
      "beforeend",
      TEAM.map(
        (person) => `<option value="${person.id}">${escape(person.name)} — ${escape(person.role)}</option>`,
      ).join(""),
    );
    const requested = new URLSearchParams(location.search).get("repair");
    const requestRepair = has(SERVICE_MAP, requested) ? requested : null;
    if (requestRepair) mechanicSelect.value = SERVICE_MAP[requestRepair].mechanic;
    function slotsForSelection() {
      if (!dates.includes(dateSelect.value)) return [];
      // Each specialist has a short bench handoff during the day; omit that window.
      const personIndex = TEAM.findIndex((person) => person.id === mechanicSelect.value);
      return DROP_OFF_TIMES.filter((_, index) => personIndex === -1 || index !== personIndex + 1);
    }
    function renderSlots() {
      $("[data-book-slot]").value = "";
      $("[data-book-slots]").innerHTML = slotsForSelection()
        .map(
          (time) =>
            `<button class="chip min-h-12 font-semibold" type="button" data-select-slot="${time}" aria-pressed="false">${time}</button>`,
        )
        .join("");
      if (!dates.length)
        $("[data-book-slots]").innerHTML =
          '<p class="col-span-full text-sm">Please call the workshop to arrange a drop-off.</p>';
    }
    dateSelect.addEventListener("change", renderSlots);
    mechanicSelect.addEventListener("change", renderSlots);
    $("[data-book-slots]").addEventListener("click", (event) => {
      const button = event.target.closest("[data-select-slot]");
      if (!button || !slotsForSelection().includes(button.dataset.selectSlot)) return;
      $("[data-book-slot]").value = button.dataset.selectSlot;
      $$("[data-select-slot]").forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
      $("[data-book-error='slot']").textContent = "";
    });
    const plan = readPlan();
    $("[data-book-plan]").textContent = plan.jobs.length
      ? `${plan.jobs.map((job) => `${job.qty} × ${SERVICE_MAP[job.id].name}`).join(", ")}. Estimate ${money(planTotals(plan).total)} before sales tax, subject to inspection.`
      : requestRepair
        ? `Asking about: ${SERVICE_MAP[requestRepair].name}.`
        : "No repair plan selected. That is fine: describe the problem and we can inspect the bike together.";
    const done = $("[data-book-done]");
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const values = Object.fromEntries(new FormData(form));
      const errors = {};
      if (!dates.includes(values.date) || !isOpeningDay(values.date) || values.date <= todayKey())
        errors.date = "Choose an upcoming opening day.";
      if (!has(TEAM_MAP, values.mechanic) && values.mechanic !== "any")
        errors.mechanic = "Choose a mechanic from the list.";
      if (!slotsForSelection().includes(values.slot)) errors.slot = "Choose a drop-off time.";
      if (!validName(values.name)) errors.name = "Enter your name (at least two characters).";
      if (!validEmail(values.email)) errors.email = "Enter your email address, like sam@example.com.";
      if (String(values.bike || "").trim().length < 3) errors.bike = "Add a short description of your bike.";
      showErrors(form, "book", errors);
      if (Object.keys(errors).length) return;
      // To take real bookings, send the validated form to your endpoint here and only show the
      // success state when it answers OK. With Formspree, for example:
      //   const response = await fetch("https://formspree.io/f/your-id", {
      //     method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
      //   if (!response.ok) { show an error and keep the form; return; }
      // (make this listener async). Until then the page shows the success state straight away.
      const person = has(TEAM_MAP, values.mechanic) ? TEAM_MAP[values.mechanic] : null;
      const firstName = values.name.trim().split(/\s+/)[0];
      const shortDay = new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
        timeZone: TIME_ZONE,
      }).format(dateFromKey(values.date));
      const plan = readPlan();
      const jobs = plan.jobs.length
        ? plan.jobs.map((job) => `${job.qty} × ${SERVICE_MAP[job.id].name}`).join(", ")
        : requestRepair
          ? SERVICE_MAP[requestRepair].name
          : "Inspection and a chat about the bike";
      const details = {
        "Drop-off": `${longDate(values.date)} at ${values.slot}`,
        Mechanic: person ? person.name : "First suitable mechanic",
        Name: values.name.trim(),
        Email: values.email.trim(),
        Bike: values.bike.trim(),
        Work: jobs,
      };
      $("[data-done-day]", done).textContent = `${shortDay} at ${values.slot}`;
      $("[data-done-ref]", done).textContent = reference();
      $("[data-book-summary]", done).innerHTML = Object.entries(details)
        .map(
          ([key, value]) =>
            `<div><dt class="eyebrow text-blue">${escape(key)}</dt><dd class="mt-1 break-words">${escape(value)}</dd></div>`,
        )
        .join("");
      $("[data-done-step-confirm]", done).textContent =
        `Thanks, ${firstName}. We email ${values.email.trim()} within a business day to confirm the time.`;
      $("[data-done-step-drop]", done).textContent =
        `At drop-off, ${person ? person.name.split(" ")[0] : "one of the mechanics"} looks over the bike with you and writes the price on your job ticket. Nothing starts until you agree to it.`;
      form.hidden = true;
      done.hidden = false;
      done.focus();
      done.scrollIntoView({ block: "start", behavior: "auto" });
    });
    $("[data-book-again]").addEventListener("click", () => {
      form.reset();
      renderSlots();
      done.hidden = true;
      form.hidden = false;
      dateSelect.focus();
    });
    renderSlots();
  }
  // A short reference the customer can quote on the phone, e.g. CG-4821.
  function reference() {
    return `CG-${String(Math.floor(1000 + Math.random() * 9000))}`;
  }
  function validName(value) {
    return typeof value === "string" && value.trim().length >= 2 && value.trim().length <= 80;
  }
  function validEmail(value) {
    return typeof value === "string" && value.length <= 150 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }
  function showErrors(form, prefix, errors) {
    $$(`[data-${prefix}-error]`, form).forEach((node) => {
      node.textContent = errors[node.dataset[prefix + "Error"]] || "";
    });
    $$('input:not([type="hidden"]),select,textarea', form).forEach((input) => {
      if (errors[input.name]) input.setAttribute("aria-invalid", "true");
      else input.removeAttribute("aria-invalid");
    });
    const first = Object.keys(errors)[0];
    if (first) {
      const target = first === "slot" ? $("[data-select-slot]", form) : form.elements.namedItem(first);
      target?.focus();
    }
  }
  function initContact() {
    const form = $("[data-contact-form]");
    if (!form) return;
    const done = $("[data-contact-done]");
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const values = Object.fromEntries(new FormData(form)),
        errors = {};
      if (!validName(values.name)) errors.name = "Enter your name (at least two characters).";
      if (!validEmail(values.email)) errors.email = "Enter your email address, like sam@example.com.";
      if (String(values.message || "").trim().length < 15)
        errors.message = "Add a little more detail (at least 15 characters).";
      showErrors(form, "contact", errors);
      if (Object.keys(errors).length) return;
      // Connect a real endpoint here (e.g. Formspree) and show the success state only when it answers OK:
      //   const response = await fetch("https://formspree.io/f/your-id", {
      //     method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
      //   if (!response.ok) { show an error and keep the form; return; }
      const topic = has(CONTACT_TOPICS, values.topic) ? values.topic : "repair";
      $("[data-contact-name]", done).textContent = values.name.trim().split(/\s+/)[0];
      $("[data-contact-ref]", done).textContent = reference();
      $("[data-contact-next]", done).textContent = CONTACT_TOPICS[topic].next.replace("{email}", values.email.trim());
      form.hidden = true;
      done.hidden = false;
      done.focus();
    });
    $("[data-contact-again]").addEventListener("click", () => {
      form.reset();
      done.hidden = true;
      form.hidden = false;
      $("#contact-name").focus();
    });
  }
  function renderTeam() {
    const root = $("[data-team]");
    if (!root) return;
    root.innerHTML = TEAM.map(
      (person) =>
        `<article class="border border-line bg-white"><img class="aspect-[1.2] w-full object-contain bg-mist" src="assets/img/${person.image}" width="240" height="250" alt="Illustrated portrait of ${escape(person.name)}"><div class="p-6"><p class="eyebrow text-blue">${escape(person.role)}</p><h3 class="mt-3 text-2xl font-bold">${escape(person.name)}</h3><p class="mt-2 text-xs text-muted">${escape(person.experience)}</p><p class="mt-5 text-sm leading-relaxed text-muted">${escape(person.copy)}</p><ul class="mt-5 space-y-2 border-y border-line py-5 text-sm">${person.specialisms.map((item) => `<li>— ${escape(item)}</li>`).join("")}</ul><blockquote class="mt-5 text-sm leading-relaxed">“${escape(person.approach)}”</blockquote></div></article>`,
    ).join("");
  }
  const guideText = (guide) =>
    `${guide.title} ${GUIDE_CATEGORIES[guide.category]} ${guide.intro} ${guide.points.join(" ")} ${guide.warning}`;
  // Reading time from the note's own words (about 200 words a minute), never less than a minute.
  const readingMinutes = (guide) => Math.max(1, Math.round(guideText(guide).split(/\s+/).length / 200));
  function initGuides() {
    const root = $("[data-guides]");
    if (!root) return;
    const search = $("[data-guide-search]"),
      category = $("[data-guide-category]");
    function render() {
      const words = searchWords(search.value);
      const chosen = has(GUIDE_CATEGORIES, category.value) ? category.value : "all";
      const matches = GUIDES.filter(
        (guide) => (chosen === "all" || guide.category === chosen) && matchesAll(words, guideText(guide)),
      );
      $("[data-guide-count]").textContent = plural(matches.length, "ride note");
      root.innerHTML = matches.length
        ? matches
            .map(
              (guide) =>
                `<article class="border border-line bg-white"><div class="grid items-center gap-5 border-b border-line p-5 sm:grid-cols-[180px_1fr]"><img class="block aspect-[8/5] w-full border border-line" src="assets/img/${guide.art}" width="320" height="200" alt="" loading="lazy"><div><p class="eyebrow text-blue">${GUIDE_CATEGORIES[guide.category]}</p><h2 class="mt-3 text-2xl font-bold leading-tight">${escape(guide.title)}</h2><p class="mt-3 text-xs text-muted">${plural(readingMinutes(guide), "minute")} to read</p></div></div><div class="p-6"><p class="leading-relaxed text-muted">${escape(guide.intro)}</p><details class="mt-5"><summary class="text-link">Read the workshop notes</summary><ol class="mt-5 space-y-4 text-sm leading-relaxed">${guide.points.map((point, index) => `<li><span class="font-semibold text-blue">0${index + 1} / </span>${escape(point)}</li>`).join("")}</ol><p class="mt-5 border-l-4 border-blue bg-mist p-4 text-sm leading-relaxed">${escape(guide.warning)}</p></details></div></article>`,
            )
            .join("")
        : '<p class="border border-line p-8 md:col-span-2">No ride notes match that search. Try a broader word or choose all ride notes.</p>';
    }
    search.addEventListener("input", render);
    category.addEventListener("change", render);
    render();
  }
  function visibleChecks(state) {
    return CHECKS.filter((item) => item.kinds.includes(state.kind) && (!item.wet || state.weather === "wet"));
  }
  function renderChecklist() {
    const root = $("[data-checklist]");
    if (!root) return;
    const state = readChecks(),
      visible = visibleChecks(state);
    $("[data-ride-kind]").value = state.kind;
    $("[data-ride-weather]").value = state.weather;
    root.innerHTML = visible
      .map(
        (item) =>
          `<label class="flex cursor-pointer items-start gap-4 py-6" for="check-${item.id}"><input class="mt-1 size-6 shrink-0" id="check-${item.id}" type="checkbox" data-check-id="${item.id}" ${state.done.includes(item.id) ? "checked" : ""} aria-describedby="check-copy-${item.id}"><span><span class="block font-semibold">${escape(item.title)}</span><span id="check-copy-${item.id}" class="mt-2 block text-sm leading-relaxed text-muted">${escape(item.copy)}</span></span></label>`,
      )
      .join("");
    updateChecklistProgress(state);
  }
  function updateChecklistProgress(state) {
    const visible = visibleChecks(state),
      done = visible.filter((item) => state.done.includes(item.id)).length;
    $("[data-check-progress]").textContent = `${done} of ${visible.length} checked`;
    const meter = $("[data-check-meter]");
    meter.setAttribute("aria-valuemax", String(visible.length));
    meter.setAttribute("aria-valuenow", String(done));
    meter.setAttribute("aria-valuetext", `${done} of ${visible.length} checked`);
    $("[data-check-bar]").style.width = `${visible.length ? (done / visible.length) * 100 : 0}%`;
    $("[data-ride-tip]").textContent = RIDE_TYPES[state.kind].tip;
  }
  function initChecklist() {
    if (!$("[data-checklist]")) return;
    [
      ["[data-ride-kind]", "kind"],
      ["[data-ride-weather]", "weather"],
    ].forEach(([selector, key]) => {
      $(selector).addEventListener("change", (event) => {
        const value = event.target.value;
        if (key === "kind" ? !has(RIDE_TYPES, value) : !["dry", "wet"].includes(value)) return;
        const state = readChecks();
        state[key] = value;
        writeChecks(state);
        renderChecklist();
        announce("Ride checklist updated. Check today's bike before checking off each item.");
      });
    });
    $("[data-checklist]").addEventListener("change", (event) => {
      const input = event.target.closest("[data-check-id]");
      if (!input || !has(CHECK_MAP, input.dataset.checkId)) return;
      const state = readChecks(),
        id = input.dataset.checkId;
      state.done = state.done.filter((key) => key !== id);
      if (input.checked) state.done.push(id);
      writeChecks(state);
      updateChecklistProgress(readChecks());
    });
    $("[data-reset-checks]").addEventListener("click", () => {
      const state = readChecks();
      state.done = [];
      writeChecks(state);
      renderChecklist();
      $("[data-check-id]")?.focus();
      announce("Fresh checklist ready. Previous checks cleared.");
    });
    renderChecklist();
  }
  function initNavigation() {
    const button = $("#menu-toggle"),
      menu = $("#mobile-menu");
    function closeMenu(returnFocus = false) {
      menu.hidden = true;
      button.setAttribute("aria-expanded", "false");
      button.setAttribute("aria-label", "Open menu");
      if (returnFocus) button.focus();
    }
    button.addEventListener("click", () => {
      const opening = menu.hidden;
      menu.hidden = !opening;
      button.setAttribute("aria-expanded", String(opening));
      button.setAttribute("aria-label", opening ? "Close menu" : "Open menu");
      if (opening) $("a", menu)?.focus();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !menu.hidden) closeMenu(true);
    });
    document.addEventListener("click", (event) => {
      if (!menu.hidden && !menu.contains(event.target) && !button.contains(event.target)) closeMenu();
    });
    matchMedia("(min-width: 1024px)").addEventListener("change", (event) => {
      if (event.matches) closeMenu();
    });
  }
  function initReveals() {
    const elements = $$(".reveal");
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      elements.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const position = elements.indexOf(entry.target);
          elements.slice(0, position + 1).forEach((el) => {
            el.classList.add("is-visible");
            observer.unobserve(el);
          });
        });
      },
      { threshold: 0.08 },
    );
    elements.forEach((el) => observer.observe(el));
  }
  $$("[data-year]").forEach((node) => {
    node.textContent = new Intl.DateTimeFormat("en-US", { year: "numeric", timeZone: TIME_ZONE }).format(new Date());
  });
  const featured = $("[data-featured]");
  if (featured)
    featured.innerHTML = ["service", "puncture", "rim", "gears"].map((id) => serviceCard(SERVICE_MAP[id])).join("");
  const nextDay = $("[data-next-day]");
  if (nextDay && openingDates()[0])
    nextDay.textContent = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      timeZone: TIME_ZONE,
    }).format(dateFromKey(openingDates()[0]));
  const nextOpening = $("[data-next-opening]");
  if (nextOpening) {
    const nextDay = openingDates()[0];
    nextOpening.textContent = nextDay
      ? `Next drop-off day: ${longDate(nextDay)}. Please arrange your visit before arriving.`
      : "Please call the workshop to arrange your next drop-off day.";
  }
  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-add-repair]");
    if (button) addJob(button.dataset.addRepair);
  });
  initNavigation();
  initServiceBoard();
  initServiceDetail();
  initEstimate();
  initBooking();
  renderTeam();
  initGuides();
  initChecklist();
  initContact();
  initReveals();
})();
