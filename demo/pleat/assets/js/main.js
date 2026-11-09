/* Pleat — a small workroom ledger.
 * Data, pricing and appointment rules live here. No libraries or external requests.
 * Amounts are whole dollars, inclusive of materials described in each service.
 * Forms validate in the browser and show the workroom's confirmation with a short
 * reference; connect the documented handlers to a server so requests are delivered.
 */
(() => {
  "use strict";

  const TIME_ZONE = "America/New_York";
  const STORE_PLAN = "pleat:repair-plan";
  const PLAN_VERSION = 1;
  const MAX_LINES = 12;
  const MAX_QUANTITY = 6;
  const BOOK_AHEAD_DAYS = 42;
  const SLOT_STEP = 40;
  const HOURS = {
    2: { open: "09:30", close: "17:30" },
    3: { open: "09:30", close: "17:30" },
    4: { open: "09:30", close: "17:30" },
    5: { open: "09:30", close: "17:30" },
    6: { open: "10:00", close: "15:00" },
  };
  // The workroom closes for a winter break every year and on US federal holidays,
  // worked out for any year by bankHolidays(). Add one-off closures to
  // EXTRA_CLOSED as ISO dates, e.g. "2027-07-16".
  const WINTER_BREAK = { from: "12-24", through: "01-02" };
  const CLOSE_ON_BANK_HOLIDAYS = true;
  const EXTRA_CLOSED = [];
  const CATEGORIES = {
    all: "All alterations",
    everyday: "Everyday fit",
    tailoring: "Tailoring",
    repair: "Repair & restore",
    occasion: "Occasion wear",
  };
  const COMPLEXITY = {
    standard: { name: "Everyday cloth", multiplier: 1, days: 0, note: "Cotton, linen, denim and unlined wool." },
    delicate: {
      name: "Delicate or fine cloth",
      multiplier: 1.25,
      days: 2,
      note: "Silk, fine wool and slippery or fragile cloth.",
    },
    detailed: {
      name: "Detailed construction",
      multiplier: 1.5,
      days: 4,
      note: "Velvet, beading, matched checks or several layers.",
    },
  };
  const URGENCY = {
    standard: {
      name: "Standard schedule",
      multiplier: 0,
      days: null,
      note: "The longest alteration sets the estimated turnaround. We agree on a pickup date at the fitting.",
    },
    priority: {
      name: "Priority request (+30%)",
      multiplier: 0.3,
      days: 3,
      note: "A request for about half the estimated turnaround, never less than 3 business days. Capacity and garment suitability must be confirmed; occasion work may need longer.",
    },
  };
  const SERVICES = {
    "trouser-hem": {
      name: "Pants hem",
      category: "everyday",
      art: "trousers",
      price: 24,
      days: 5,
      short: "A cleaner break, with the finish your pants were made for.",
      description:
        "From an everyday pair of chinos to wool dress pants with cuffs. We pin the length on you, check both legs and preserve the original character of the hem.",
      finishes: {
        machine: {
          name: "Machine-stitched hem",
          extra: 0,
          note: "A neat, durable finish for chinos, cotton and casual pants.",
        },
        blind: {
          name: "Blind hem",
          extra: 8,
          note: "An almost invisible finish for tailored wool and dress pants.",
        },
        turnup: {
          name: "Cuffed hem",
          extra: 12,
          note: "A balanced cuff, with enough allowance left for the right depth.",
        },
      },
      checks: [
        "The break over the front of your shoe.",
        "The way each leg hangs when standing naturally.",
        "Enough hem allowance for your chosen finish.",
      ],
      bring:
        "The shoes you will wear most often with these pants. Bring a belt if that is how you normally wear them.",
      limit: "Lengthening depends on the cloth already inside the hem. Old fold marks may remain visible.",
      related: ["waist-adjust", "zip-trouser", "denim-patch"],
    },
    "waist-adjust": {
      name: "Pants waist adjustment",
      category: "tailoring",
      art: "trousers",
      price: 38,
      days: 7,
      short: "A waistband that sits comfortably, without pulling at the seat.",
      description:
        "We adjust the waistband and center-back seam together, keeping the seat and pockets balanced. A small waist alteration can make a familiar pair feel entirely different.",
      finishes: {
        takein: { name: "Take in waist and seat", extra: 0, note: "For a modest reduction, usually up to 1.5 inches." },
        letout: {
          name: "Let out waist and seat",
          extra: 6,
          note: "Subject to the available seam allowance, checked in person.",
        },
        split: {
          name: "Split waistband construction",
          extra: 14,
          note: "For pants whose waistband needs additional reconstruction.",
        },
      },
      checks: [
        "Comfort when sitting, as well as standing.",
        "The position of the back pockets after adjustment.",
        "A smooth transition from waistband to seat.",
      ],
      bring: "The usual shirt or underlayer, plus a belt if you use one.",
      limit:
        "Large changes can distort pockets and the fly. We will recommend a smaller change if that gives a better result.",
      related: ["trouser-hem", "jacket-waist", "zip-trouser"],
    },
    "jacket-sleeve": {
      name: "Jacket sleeve length",
      category: "tailoring",
      art: "coat",
      price: 55,
      days: 8,
      short: "The right amount of shirt cuff, with the lining sitting cleanly.",
      description:
        "We set the sleeve length on your body, balance both sides and resew the lining so the cuff falls freely. Original buttons are moved and replaced with care.",
      finishes: {
        plain: { name: "Plain sleeve end", extra: 0, note: "A clean sleeve without a vent or button detail." },
        buttons: {
          name: "Vent and decorative buttons",
          extra: 20,
          note: "Button positions and sleeve vent are rebuilt to suit the new length.",
        },
        working: {
          name: "Working buttonholes assessment",
          extra: 40,
          note: "An estimated allowance only. Working cuffs may require alteration from the shoulder.",
        },
      },
      checks: [
        "How much shirt cuff you want to show.",
        "A balanced length with arms relaxed.",
        "Vent depth, lining ease and button spacing.",
      ],
      bring: "Your usual shirt. If this is part of a suit, bring the pants too.",
      limit: "Working buttonholes can restrict shortening. Shoulder alterations are quoted individually.",
      related: ["jacket-waist", "coat-lining", "button-set"],
    },
    "jacket-waist": {
      name: "Jacket body shaping",
      category: "tailoring",
      art: "coat",
      price: 75,
      days: 10,
      short: "A little definition through the body, with room to move.",
      description:
        "Taking in a jacket is about balance as much as size. We shape through the side or back seams, keep the hem level and check that the jacket still moves with you.",
      finishes: {
        seams: { name: "Two-seam shaping", extra: 0, note: "A measured change through two existing seams." },
        four: { name: "Four-seam shaping", extra: 30, note: "A more distributed adjustment for a smoother line." },
        unlined: {
          name: "Unlined jacket finish",
          extra: 15,
          note: "Visible internal seams are finished to match the original.",
        },
      },
      checks: [
        "The closure without pulling or gaping.",
        "The line of the vents and front edges.",
        "Movement through the shoulders when seated.",
      ],
      bring: "The shirt, layers and pants you will wear with the jacket.",
      limit:
        "We do not offer routine shoulder narrowing. A size change of more than one size rarely keeps the original proportions.",
      related: ["jacket-sleeve", "trouser-hem", "coat-lining"],
    },
    "dress-hem": {
      name: "Dress hem",
      category: "occasion",
      art: "dress",
      price: 40,
      days: 7,
      short: "An even fall, from a simple day dress to a sweeping skirt.",
      description:
        "We pin all the way around, allow bias-cut cloth to settle and choose a hem that suits the movement of the dress. The final length is checked with your occasion shoes.",
      finishes: {
        straight: {
          name: "Straight, single-layer hem",
          extra: 0,
          note: "An uncomplicated dress with one layer of cloth.",
        },
        lined: {
          name: "Dress with a separate lining",
          extra: 20,
          note: "Both dress and lining are shortened and finished separately.",
        },
        full: {
          name: "Full or bias-cut skirt",
          extra: 40,
          note: "Extra sweep and settling time are allowed for in the work.",
        },
      },
      checks: [
        "The length with the correct shoes.",
        "An even fall after the cloth has settled.",
        "The relationship between lining and outer hem.",
      ],
      bring: "Your shoes and the underlayers you plan to wear. For a long dress, bring the actual occasion shoes.",
      limit: "Beaded edges, lace borders and trains need an individual assessment rather than a standard hem price.",
      related: ["dress-fit", "strap-adjust", "skirt-waist"],
    },
    "dress-fit": {
      name: "Dress bodice fitting",
      category: "occasion",
      art: "dress",
      price: 65,
      days: 10,
      short: "A bodice that follows you, without fighting your movement.",
      description:
        "We work through the existing seams to adjust the fit at bust, waist or side body. Each change is pinned in person and checked sitting, standing and moving.",
      finishes: {
        side: { name: "Side-seam fitting", extra: 0, note: "A straightforward adjustment through the side seams." },
        lined: {
          name: "Lined bodice fitting",
          extra: 30,
          note: "The lining is opened, adjusted and closed separately.",
        },
        structured: {
          name: "Structured bodice assessment",
          extra: 55,
          note: "Boning and internal support need more fitting time. Final work is agreed individually.",
        },
      },
      checks: [
        "Comfort and support with the intended underlayers.",
        "Bust darts, waistline and side-seam balance.",
        "Whether a second fitting will be needed.",
      ],
      bring: "The exact undergarments or shapewear you plan to wear. A different bra can change the entire fit.",
      limit: "Major bridal reconstruction and new corsetry are quoted separately after consultation.",
      related: ["dress-hem", "strap-adjust", "zip-dress"],
    },
    "strap-adjust": {
      name: "Dress strap adjustment",
      category: "occasion",
      art: "dress",
      price: 25,
      days: 5,
      short: "A small adjustment that lifts the whole fit.",
      description:
        "We shorten straps to place the neckline and armhole where they belong. Both sides are checked separately; bodies and garments are seldom perfectly symmetrical.",
      finishes: {
        simple: { name: "Simple pair of straps", extra: 0, note: "Two unembellished fabric straps." },
        lined: {
          name: "Lined or concealed attachment",
          extra: 12,
          note: "The strap end is accessed inside the bodice lining.",
        },
        embellished: {
          name: "Embellished straps",
          extra: 25,
          note: "Beads or trims are carefully removed and reattached.",
        },
      },
      checks: [
        "The neckline when standing and leaning forward.",
        "Enough ease at the underarm.",
        "An even line across the back.",
      ],
      bring: "The bra or underlayer you will wear with the dress.",
      limit: "Changing strap length can change bust position. We may suggest a bodice adjustment as well.",
      related: ["dress-fit", "dress-hem", "zip-dress"],
    },
    "skirt-waist": {
      name: "Skirt waist adjustment",
      category: "everyday",
      art: "skirt",
      price: 42,
      days: 7,
      short: "Sitting at the right place, with the pleats still in order.",
      description:
        "We reshape the waistband and the seam below it as one alteration. Pleats, darts and lining are kept in balance so the skirt hangs as intended.",
      finishes: {
        plain: { name: "Plain waistband", extra: 0, note: "A simple waistband with a side or back seam." },
        lined: { name: "Lined skirt", extra: 15, note: "The lining is adjusted alongside the outer skirt." },
        pleated: {
          name: "Pleated or detailed waist",
          extra: 30,
          note: "Pleats or decorative details are reset after the adjustment.",
        },
      },
      checks: ["The intended waist position.", "Comfort when seated.", "The line of darts, pleats and side seams."],
      bring: "The top or layer that you usually tuck in.",
      limit: "Letting out depends on original seam allowance. Permanent pleats limit large size changes.",
      related: ["dress-hem", "zip-dress", "button-set"],
    },
    "shirt-sleeve": {
      name: "Shirt sleeve shortening",
      category: "everyday",
      art: "shirt",
      price: 35,
      days: 6,
      short: "A cuff that stops where you want it, not halfway down your hand.",
      description:
        "We remove the cuff, shorten the sleeve and rebuild the pleats and placket so the result looks considered. Both sleeves are measured independently.",
      finishes: {
        cuff: { name: "Standard button cuff", extra: 0, note: "The original cuff is removed and reattached." },
        double: { name: "Double or French cuff", extra: 12, note: "A double cuff is reset to the correct length." },
        placket: {
          name: "Extended placket reconstruction",
          extra: 22,
          note: "For a larger reduction where the placket needs rebuilding.",
        },
      },
      checks: [
        "Cuff position with arms relaxed and bent.",
        "The length under a jacket sleeve.",
        "Enough placket opening to roll the sleeve comfortably.",
      ],
      bring: "Your jacket if the shirt will usually be worn beneath it.",
      limit: "A very large reduction can make the sleeve opening too narrow. We assess this at fitting.",
      related: ["button-set", "jacket-sleeve", "seam-repair"],
    },
    "zip-trouser": {
      name: "Pants zipper replacement",
      category: "repair",
      art: "trousers",
      price: 35,
      days: 5,
      short: "A sound new zipper, matched to the garment rather than the nearest drawer.",
      description:
        "We remove the failed zipper, reinforce worn cloth where needed and fit a suitable replacement. The fly and waistband are checked before the pants leave the bench.",
      finishes: {
        standard: {
          name: "Standard coil zipper",
          extra: 0,
          note: "A durable zipper for most everyday pants; materials included.",
        },
        metal: {
          name: "Metal denim zipper",
          extra: 8,
          note: "A robust metal replacement for jeans and heavier pants.",
        },
        concealed: { name: "Concealed side zipper", extra: 12, note: "For pants with an invisible side zipper." },
      },
      checks: [
        "Whether the slider or the entire zipper has failed.",
        "The strength of the cloth around the fly.",
        "The waistband closure and zipper stop.",
      ],
      bring: "The clean pants. No fitting is normally needed for a like-for-like replacement.",
      limit: "Worn fabric around the zipper may need a separate reinforcement. We will agree this first.",
      related: ["trouser-hem", "waist-adjust", "denim-patch"],
    },
    "zip-dress": {
      name: "Dress or skirt zipper",
      category: "repair",
      art: "skirt",
      price: 42,
      days: 7,
      short: "A smooth fastening, with the seams meeting where they should.",
      description:
        "An invisible zipper only works well when it is set without stretching the cloth. We stabilize the opening, match the color and check the waistline joins cleanly.",
      finishes: {
        unlined: { name: "Unlined garment", extra: 0, note: "A replacement zipper up to 22 inches, with materials included." },
        lined: {
          name: "Lined garment",
          extra: 20,
          note: "The lining is carefully released and resewn around the new zipper.",
        },
        long: {
          name: "Long or detailed opening",
          extra: 30,
          note: "For long zippers, piping or detailed seam junctions.",
        },
      },
      checks: [
        "The color and length of the replacement.",
        "The strength of the seam and the fabric edge.",
        "A smooth closure across waist and trim lines.",
      ],
      bring: "The clean garment. If the zipper failed because the fit is tight, book a fitting too.",
      limit: "Some specialty colors need extra sourcing time; we discuss alternatives before ordering.",
      related: ["dress-fit", "skirt-waist", "dress-hem"],
    },
    "denim-patch": {
      name: "Denim reinforcement",
      category: "repair",
      art: "trousers",
      price: 30,
      days: 6,
      short: "Strength where it is needed, with a finish you choose.",
      description:
        "A soft internal patch supports worn denim, with rows of stitching to spread the strain. We can blend the thread into the cloth or make the mend part of the story.",
      finishes: {
        small: {
          name: "One area, up to 3 inches",
          extra: 0,
          note: "A small tear or worn patch, supported from the inside.",
        },
        large: { name: "One area, up to 6 inches", extra: 18, note: "A larger worn area with additional reinforcement." },
        pair: { name: "Two small areas", extra: 25, note: "Useful for the inner thighs or matching knee repairs." },
      },
      checks: [
        "The size of the weak area beyond the visible hole.",
        "The direction of the weave and strain.",
        "Whether a visible or blended finish will suit you.",
      ],
      bring: "Freshly washed jeans. Tell us if you would enjoy a visible repair.",
      limit: "Very thin denim may continue to wear around a repair. We will be honest about its likely life.",
      related: ["trouser-hem", "zip-trouser", "seam-repair"],
    },
    "knit-darn": {
      name: "Knitwear darning",
      category: "repair",
      art: "knit",
      price: 32,
      days: 10,
      short: "Small holes, rebuilt with a patient hand and sympathetic yarn.",
      description:
        "We hand-darn small holes in wool and cashmere, rebuilding the weave with a soft matching yarn or a deliberate contrast. It is a repair to live with, rather than disguise at any cost.",
      finishes: {
        small: { name: "One hole, up to 3/4 inch", extra: 0, note: "A small hole with sound knitting around it." },
        pair: { name: "Two small holes", extra: 22, note: "Two holes on the same garment, up to 3/4 inch each." },
        visible: {
          name: "Visible darn, up to 1.5 inches",
          extra: 25,
          note: "A contrast repair with color discussed in the workroom.",
        },
      },
      checks: [
        "The stability of the surrounding knit.",
        "A yarn weight and color that suits the piece.",
        "Whether the damage needs treatment before repair.",
      ],
      bring:
        "The clean knitwear, plus any spare yarn supplied with it. Treat active moth problems before bringing garments into the studio.",
      limit: "A hand darn has its own texture. Large runs or very fine machine knits may need a specialist reknitter.",
      related: ["button-set", "seam-repair", "coat-lining"],
    },
    "coat-lining": {
      name: "Coat lining repair",
      category: "repair",
      art: "coat",
      price: 55,
      days: 10,
      short: "A comfortable inside for a coat with plenty left to give.",
      description:
        "Torn linings catch at every wear. We reinforce or replace the worn panel, keep the right amount of movement through the shoulder and close the lining neatly.",
      finishes: {
        panel: {
          name: "One lining panel",
          extra: 0,
          note: "A matched or complementary replacement for a damaged section.",
        },
        sleeves: {
          name: "Pair of sleeve linings",
          extra: 40,
          note: "Both sleeve linings replaced, including standard lining cloth.",
        },
        full: {
          name: "Full relining allowance",
          extra: 165,
          note: "A starting allowance for a complete coat lining; final quote after inspection.",
        },
      },
      checks: [
        "Where friction is causing the damage.",
        "Ease across the back and under the arms.",
        "The condition of pockets and internal seams.",
      ],
      bring: "Your clean coat and the layers you normally wear underneath.",
      limit:
        "Fragile outer cloth and extensive internal construction can change the scope. Full relinings are confirmed individually.",
      related: ["jacket-sleeve", "button-set", "seam-repair"],
    },
    "button-set": {
      name: "Buttons & fasteners",
      category: "repair",
      art: "shirt",
      price: 15,
      days: 3,
      short: "A loose end put right before it becomes a lost favorite.",
      description:
        "We secure buttons with the right thread shank and reinforce the cloth if needed. Hooks, bars and snaps are checked for alignment and a comfortable closure.",
      finishes: {
        pair: {
          name: "Up to two buttons",
          extra: 0,
          note: "Use your original or spare buttons. Standard matching buttons are included if available.",
        },
        set: { name: "Set of up to six buttons", extra: 15, note: "A full matching set on a shirt or cardigan." },
        hook: { name: "Hook and bar replacement", extra: 6, note: "A secure new fastener for a waistband or collar." },
      },
      checks: [
        "The condition of the cloth behind the fastener.",
        "The thread shank needed for the fabric thickness.",
        "Alignment when the garment is worn.",
      ],
      bring: "Any original spare buttons. Distinctive or decorative buttons are sourced by agreement.",
      limit: "Specialty button sourcing costs are agreed separately. Damaged buttonholes may need another repair.",
      related: ["shirt-sleeve", "coat-lining", "seam-repair"],
    },
    "seam-repair": {
      name: "Split seam repair",
      category: "repair",
      art: "shirt",
      price: 20,
      days: 4,
      short: "A seam closed properly, with the cause checked as well as the split.",
      description:
        "We check whether the thread has failed or the cloth itself has worn away, then rebuild the seam with a suitable finish. A little reinforcement can prevent the same split returning.",
      finishes: {
        plain: { name: "Simple seam, up to 8 inches", extra: 0, note: "A straight repair in sound unlined cloth." },
        lined: {
          name: "Seam inside a lined garment",
          extra: 15,
          note: "The lining is opened and closed to reach the damaged seam.",
        },
        reinforced: { name: "Reinforced seam repair", extra: 20, note: "Additional backing supports a weakened area." },
      },
      checks: [
        "The strength of the surrounding fabric.",
        "Enough ease to prevent renewed strain.",
        "A seam finish appropriate to the original.",
      ],
      bring: "The clean garment. If the seam splits when worn, a fitting helps us understand the strain.",
      limit: "A seam repair cannot fix a garment that is too small. We may suggest a fit adjustment first.",
      related: ["waist-adjust", "denim-patch", "knit-darn"],
    },
  };

  // Small line drawings for each service, drawn on a 48 × 48 grid. Dashed lines are
  // marked with a "d:" prefix. Keys match SERVICES.
  const ICONS = {
    "trouser-hem": ["M15 5h18l3 30h-9l-3-18-3 18h-9z", "d:M10 29h28", "M24 46v-6m-3 3 3-3 3 3"],
    "waist-adjust": [
      "M13 12h22v6H13z",
      "M14 18l-2 24h10l2-14 2 14h10l-2-24",
      "M3 15h6m-2-2 2 2-2 2",
      "M45 15h-6m2-2-2 2 2 2",
    ],
    "jacket-sleeve": [
      "M12 4h16l4 36-17 3z",
      "M14.5 33 31 31",
      "M42 42V28m-3 3 3-3 3 3",
      "c:21 38",
      "c:25 37.5",
      "c:29 37",
    ],
    "jacket-waist": [
      "M18 6 10 9l2 33h24l2-33-8-3-6 8z",
      "M18 6l4 14 2-6M30 6l-4 14-2-6",
      "M24 20v22",
      "M2 26h6m-2-2 2 2-2 2",
      "M46 26h-6m2-2-2 2 2 2",
    ],
    "dress-hem": [
      "M19 4v6M29 4v6",
      "M17 10h14l2 12H15z",
      "M15 22 9 42h30l-6-20",
      "d:M10 36h28",
      "M44 44v-6m-3 3 3-3 3 3",
    ],
    "dress-fit": [
      "M14 10q10 8 20 0l3 16-3 12H14l-3-12z",
      "M20 38l1-9M28 38l-1-9",
      "M2 24h6m-2-2 2 2-2 2",
      "M46 24h-6m2-2-2 2 2 2",
    ],
    "strap-adjust": [
      "M12 24q12 8 24 0l2 18H10z",
      "M16 26 18 10M32 26 30 10",
      "M8 16V6m-3 3 3-3 3 3",
      "M40 16V6m-3 3 3-3 3 3",
    ],
    "skirt-waist": [
      "M15 8h18v6H15z",
      "M15 14 8 42h32l-7-28",
      "M20 14l-3 28M24 14v28M28 14l3 28",
      "M2 11h7m-2-2 2 2-2 2",
      "M46 11h-7m2-2-2 2 2 2",
    ],
    "shirt-sleeve": ["M10 4h18l2 26H12z", "M12 30h18v8H12z", "M17 30v-8", "c:26 34", "M40 6v32M37 6h6M37 38h6"],
    "zip-trouser": [
      "M14 4h20v40H14z",
      "M20 8h4M24 11h4M20 14h4M24 17h4M20 20h4M24 23h4M20 26h4",
      "M21 28h6v7h-6z",
      "M24 35v6",
    ],
    "zip-dress": ["M15 6h18l3 14-4 22H16l-4-22z", "d:M24 6v22", "M22 28h4l-1 7h-2z", "M18 6l6 5 6-5"],
    "denim-patch": ["d:M10 10h28v28H10z", "M14 16h20M14 21h20M14 26h20M14 31h20", "M21 22q3-3 6 0q1 5-3 5q-4 0-3-5z"],
    "knit-darn": [
      "M10 12h24v24H10z",
      "M16 12v24M22 12v24M28 12v24",
      "M10 18h6m6 0h6M16 24h6m6 0h6M10 30h6m6 0h6",
      "M36 10l10-6",
      "M36 10c-4 4 0 8-2 12",
    ],
    "coat-lining": [
      "M8 42 10 8l10-4 4 6 4-6 10 4 2 34z",
      "M20 4v38M28 4v38",
      "M20 16l8-4M20 24l8-4M20 32l8-4M20 40l8-4",
    ],
    "button-set": [
      "c12:24 21",
      "c:20 17",
      "c:28 17",
      "c:20 25",
      "c:28 25",
      "M20 17l8 8M28 17l-8 8",
      "M30 35l12 9",
      "M30 35c-6 4-12 2-14 8",
    ],
    "seam-repair": [
      "M24 4v12M24 32v12",
      "M22 16q-3 8 0 16M26 16q3 8 0 16",
      "M20 7l8 3M20 12l8 3M20 35l8 3M20 40l8 3",
      "M33 26l11-11",
    ],
  };
  function icon(key, size = "size-8") {
    const parts = (ICONS[key] || []).map((part) => {
      if (part.startsWith("d:")) return `<path d="${part.slice(2)}" stroke-dasharray="2.5 2.5"/>`;
      const circle = /^c(\d*):([\d.]+) ([\d.]+)$/.exec(part);
      if (circle) return `<circle cx="${circle[2]}" cy="${circle[3]}" r="${circle[1] || 1.6}"/>`;
      return `<path d="${part}"/>`;
    });
    return `<svg class="${size}" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${parts.join("")}</svg>`;
  }

  const PEOPLE = {
    iona: {
      name: "Iona Fenwick",
      role: "Founder & tailoring lead",
      art: "person-iona",
      picture: "Iona's dress form, with a half-made jacket basted in white thread",
      days: [2, 3, 4, 5],
      appointments: ["fitting", "occasion", "collection"],
      bio: "Iona trained in coat making before opening Pleat in 2014. She notices the way a sleeve turns and the way a jacket settles when you sit. Her favorite work is the subtle sort: a small change that makes a garment feel entirely yours.",
      note: "Tailoring, jackets and occasion fittings. Tuesday to Friday.",
    },
    malachy: {
      name: "Malachy Cresswell",
      role: "Alterations & denim specialist",
      art: "person-malachy",
      picture: "Malachy's industrial sewing machine stitching a denim seam",
      days: [2, 4, 5, 6],
      appointments: ["fitting", "repair", "collection"],
      bio: "Malachy joined the workroom after a decade working with everyday clothing and uniforms. He is particular about how pants hang, strong pocket corners and a denim repair that remains comfortable. He believes the clothes you wear most deserve the best attention.",
      note: "Everyday fitting, pants and denim. Tuesday, Thursday, Friday and Saturday.",
    },
    eluned: {
      name: "Eluned Telfer",
      role: "Hand repair & finishing",
      art: "person-eluned",
      picture: "Eluned's darning mushroom with a darn half woven, and balls of yarn",
      days: [3, 4, 5, 6],
      appointments: ["repair", "occasion", "collection"],
      bio: "Eluned works with the smaller details: hand darning, delicate hems and the lining you only notice when it is wrong. She keeps a yarn drawer arranged by weight and enjoys making a visible mend feel like it has always belonged.",
      note: "Knitwear, delicate cloth and repair assessments. Wednesday to Saturday.",
    },
  };
  const APPOINTMENTS = {
    fitting: {
      name: "Everyday fitting — 20 minutes",
      short: "an everyday fitting",
      minutes: 20,
      maxGarments: 4,
      note: "For hems, sleeves and everyday shape adjustments. Bring up to four garments.",
    },
    repair: {
      name: "Repair assessment — 20 minutes",
      short: "a repair assessment",
      minutes: 20,
      maxGarments: 4,
      note: "For denim, knitwear, linings and repairs you would like us to assess.",
    },
    occasion: {
      name: "Occasion consultation — 40 minutes",
      short: "an occasion consultation",
      minutes: 40,
      maxGarments: 2,
      note: "Time for an occasion dress or more detailed tailoring. Bring the exact shoes and underlayers.",
    },
    collection: {
      name: "Pickup fitting — 20 minutes",
      short: "a pickup fitting",
      minutes: 20,
      maxGarments: 4,
      note: "A final try-on for completed work. Bring your claim ticket if you have it.",
    },
  };
  // The appointment a service page suggests, by service category.
  const SERVICE_APPOINTMENT = { everyday: "fitting", tailoring: "fitting", repair: "repair", occasion: "occasion" };
  const WORK_CATEGORIES = { all: "All work", fit: "Alterations", repair: "Repairs", occasion: "Occasion" };
  const WORK = [
    {
      id: "overcoat",
      title: "The inherited overcoat",
      category: "fit",
      art: "work-overcoat",
      label: "Sleeves & body",
      service: "jacket-sleeve",
      garment: "Wool overcoat · sleeve and body adjustment",
      before: "A beautifully made coat with sleeves that covered the hands and too much room through the back.",
      method:
        "We shortened at the cuff, reset the decorative buttons and took a measured amount through the back seams. The original deep hem and generous pockets stayed exactly as they were.",
      result: "A coat with the same generous character, sitting comfortably on a new pair of shoulders.",
      detail: "Two fittings · original buttons retained · blind-finished cuffs",
      lesson: "The shoulder was already right. Adjusting the body and sleeves was enough.",
    },
    {
      id: "denim",
      title: "Not quite finished jeans",
      category: "repair",
      art: "work-denim",
      label: "Inner-thigh reinforcement",
      service: "denim-patch",
      garment: "Everyday denim · two reinforced worn areas",
      before: "The inner thighs were thinning, though the rest of the denim still had years of wear left.",
      method:
        "Soft cotton backing went inside each worn area. Close rows of stitching followed the grain and extended beyond the visible wear, spreading the strain across sound cloth.",
      result: "A comfortable, flexible repair that blends into the faded denim from a little distance.",
      detail: "Internal cotton support · blended thread · original seams untouched",
      lesson: "Bringing denim in before it tears leaves us more strong cloth to work with.",
    },
    {
      id: "occasion",
      title: "The dress, worn twice",
      category: "occasion",
      art: "work-occasion",
      label: "Hem & straps",
      service: "dress-hem",
      garment: "Lined occasion dress · shorter hem and adjusted straps",
      before: "A long dress saved for one celebration, ready for a more everyday second life.",
      method:
        "We pinned a new mid-calf length, shortened the lining separately and lifted the straps a little. A quiet hand finish kept the movement soft.",
      result: "The dress kept its beautiful drape and found a place in regular rotation.",
      detail: "Two-layer hem · hand finish · original strap detail preserved",
      lesson: "Changing a hem can change when you wear something, without changing what you love about it.",
    },
    {
      id: "jumper",
      title: "A small green square",
      category: "repair",
      art: "work-jumper",
      label: "Visible darn",
      service: "knit-darn",
      garment: "Oatmeal wool sweater · contrast hand darn",
      before: "A hole at the elbow, with sound knitting around it and a wearer happy to let the repair show.",
      method:
        "We chose a soft green wool of similar weight and rebuilt the damaged area by hand. A slightly larger square spreads the stress beyond the edge of the hole.",
      result: "A repair with its own character, soft enough to forget about while wearing it.",
      detail: "Visible darn · soft wool yarn · repaired from sound edges",
      lesson: "A contrast color can make a repaired piece feel more personal, rather than less perfect.",
    },
    {
      id: "linen",
      title: "The linen shirt, reset",
      category: "fit",
      art: "work-linen",
      label: "Sleeve length",
      service: "shirt-sleeve",
      garment: "Linen shirt · sleeves shortened at the cuff",
      before: "A favorite summer shirt, with cuffs that needed rolling even on the days they were better down.",
      method:
        "The cuffs came off, each sleeve was measured independently, and the pleats were reset before the cuffs went back. The plackets kept their original opening.",
      result: "A shirt that works with the sleeves up or down, without a telltale extra seam.",
      detail: "Original cuffs · balanced sleeve lengths · linen pressed lightly",
      lesson: "Shortening at the cuff keeps the shoulder and upper sleeve just as they were.",
    },
    {
      id: "pleats",
      title: "A little room at the waist",
      category: "fit",
      art: "work-pleats",
      label: "Waistband",
      service: "skirt-waist",
      garment: "Pleated wool skirt · waistband adjustment",
      before: "A skirt with lovely movement, saved in the closet because the waistband was uncomfortable.",
      method:
        "We used the available seam allowance, reset the waistband and distributed the change without opening the permanent pleats. The lining gained the same ease.",
      result: "The same crisp outline, now comfortable enough to choose on an ordinary morning.",
      detail: "Existing allowance used · pleats preserved · lining adjusted",
      lesson: "We always look inside before promising to let something out. The available cloth sets the limit.",
    },
  ];
  const CARE_CATEGORIES = {
    all: "All notes",
    wool: "Wool & knitwear",
    everyday: "Everyday cloth",
    occasion: "Delicate pieces",
  };
  const CARE = [
    {
      id: "air",
      category: "wool",
      title: "Give wool some air",
      read: "2 minute read",
      intro: "A little air often does more good than another wash.",
      steps: [
        "Hang woven wool on a broad hanger somewhere airy, away from direct sun.",
        "For knitwear, lay it flat on a clean towel so the shoulders do not stretch.",
        "Brush a coat gently in the direction of the nap once it is dry.",
      ],
      avoid: "Do not hang a heavy wet knit. Water and gravity can pull it out of shape.",
      studio: "If a coat has lost its shape, bring it in before using steam at home.",
    },
    {
      id: "knit-wash",
      category: "wool",
      title: "Wash knitwear gently",
      read: "3 minute read",
      intro: "The care label comes first. Temperature and movement both matter.",
      steps: [
        "Use the method on the label and a wool-suitable detergent.",
        "Keep water temperatures consistent when washing and rinsing.",
        "Press out water without twisting, roll in a towel and dry flat to the original shape.",
      ],
      avoid: "Rubbing, wringing and hot water can felt wool. A hot radiator can also distort it.",
      studio: "Small holes are easier to darn before the surrounding stitches unravel.",
    },
    {
      id: "denim",
      category: "everyday",
      title: "Let denim settle into its own life",
      read: "2 minute read",
      intro: "Wash when it needs washing, and catch the thin bits early.",
      steps: [
        "Turn jeans inside out and follow the washing label.",
        "Close the zipper to protect it and other garments.",
        "Check the inner thighs, pocket corners and knees after drying.",
      ],
      avoid: "Do not wait for a pale, thin area to become a large tear if you want a quiet repair.",
      studio: "A soft internal patch can reinforce denim before a hole opens.",
    },
    {
      id: "linen",
      category: "everyday",
      title: "Let linen look like linen",
      read: "2 minute read",
      intro: "Its easy creases are part of the cloth, not a problem to solve.",
      steps: [
        "Check the label before washing and leave room in the washer.",
        "Smooth seams and collars while damp.",
        "Press inside out if you want a crisper finish, using the temperature stated on the label.",
      ],
      avoid: "Heavy starch and very hot pressing can make soft linen feel brittle.",
      studio: "A light press after an alteration keeps the garment’s relaxed character.",
    },
    {
      id: "silk",
      category: "occasion",
      title: "Take your time with silk",
      read: "3 minute read",
      intro: "Silk can react to water, friction and even a small spot treatment.",
      steps: [
        "Read the care label and use a professional cleaner when instructed.",
        "Keep perfume and hair products away from the cloth.",
        "Store out of direct light on a padded hanger, with space around it.",
      ],
      avoid: "Do not rub a mark or test a stain remover on a visible area. Water can leave a ring.",
      studio: "Bring silk in clean. Tell us about any fragile areas before we pin it.",
    },
    {
      id: "buttons",
      category: "everyday",
      title: "Catch a loose button early",
      read: "2 minute read",
      intro: "A few minutes now can save a search for a matching button later.",
      steps: [
        "Check buttons when you put a garment away, especially coat cuffs.",
        "Keep spare buttons labeled with the garment they belong to.",
        "If a button wobbles on a few threads, stop pulling at it and arrange a repair.",
      ],
      avoid: "Sewing a coat button flat to thick cloth can make the closure pull. It usually needs a thread shank.",
      studio: "Bring the original spare if you have one; we can secure it with the right spacing.",
    },
    {
      id: "storage",
      category: "wool",
      title: "Put winter clothes away clean",
      read: "3 minute read",
      intro: "Good storage begins before the box closes.",
      steps: [
        "Clean and dry garments according to their labels before storing.",
        "Inspect folds and seams for damage, and repair small holes first.",
        "Fold knitwear with room to breathe and check stored pieces regularly.",
      ],
      avoid:
        "Cedar and lavender do not replace cleaning and inspection. Treat active moth problems before bringing clothes to the workroom.",
      studio: "We can assess old moth damage once the garment and storage area have been treated.",
    },
    {
      id: "occasion",
      category: "occasion",
      title: "After the occasion",
      read: "2 minute read",
      intro: "A dress needs a little attention before it returns to the closet.",
      steps: [
        "Check the hem for dirt and the underarms for marks.",
        "Arrange cleaning promptly, following the care label.",
        "Store fully dry, with enough space for the skirt and support for the shoulders.",
      ],
      avoid: "Do not leave a delicate dress in a thin dry-cleaning bag for long-term storage.",
      studio:
        "Before the next outing, try the dress on with the actual shoes and underlayers. Leave time for any adjustment.",
    },
  ];

  /* Shared helpers: all storage goes through this one adapter. The mirror is also
   * written during successful native writes, so a later storage failure does not
   * lose the most recent state within the same page view.
   */
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const own = (object, key) => typeof key === "string" && Object.prototype.hasOwnProperty.call(object, key);
  const memory = new Map();
  const safeStorage = {
    getItem(key) {
      // A value that couldn't be written (storage full, for example) is only in memory, and is the newest.
      if (memory.has(key)) return memory.get(key);
      try {
        return window.localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    setItem(key, value) {
      try {
        window.localStorage.setItem(key, value);
        memory.delete(key);
      } catch {
        /* memory remains usable */
        memory.set(key, value);
      }
    },
    removeItem(key) {
      memory.delete(key);
      try {
        window.localStorage.removeItem(key);
      } catch {
        /* memory already cleared */
      }
    },
  };
  const money = (value) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value);
  const plural = (count, word) => `${count} ${word}${count === 1 ? "" : "s"}`;
  const escape = (value) =>
    String(value).replace(
      /[&<>"']/g,
      (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char],
    );
  const integer = (value, fallback, min, max) => {
    const number = Number(value);
    return Number.isFinite(number) ? Math.min(max, Math.max(min, Math.floor(number))) : fallback;
  };
  const setText = (selector, value) =>
    $$(selector).forEach((el) => {
      el.textContent = value;
    });
  const firstKey = (map) => Object.keys(map)[0];
  const qs = new URLSearchParams(window.location.search);
  let toastTimer;
  // A short reference, like PL-7K2Q (no 0/O or 1/I to misread).
  function makeRef() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let ref = "PL-";
    for (let i = 0; i < 4; i++) ref += chars.charAt(Math.floor(Math.random() * chars.length));
    return ref;
  }
  function toast(message) {
    const el = $("#toast");
    if (!el) return;
    clearTimeout(toastTimer);
    el.textContent = message;
    el.hidden = false;
    toastTimer = setTimeout(() => {
      el.hidden = true;
    }, 6000);
  }
  function options(select, map, selected) {
    if (!select) return;
    select.replaceChildren();
    Object.entries(map).forEach(([key, item]) => {
      const option = document.createElement("option");
      option.value = key;
      option.textContent = typeof item === "string" ? item : item.name;
      option.selected = selected === key;
      select.append(option);
    });
  }
  function updateQuery(key, value) {
    // file:// also works: a restricted history API should not stop filtering.
    try {
      const url = new URL(window.location.href);
      if (value === "all" || !value) url.searchParams.delete(key);
      else url.searchParams.set(key, value);
      window.history.replaceState(null, "", url);
    } catch {
      /* filtering is useful even without a history API */
    }
  }
  function mountFilters(target, map, selected, onChange) {
    const root = $(target);
    if (!root) return;
    root.replaceChildren();
    Object.entries(map).forEach(([key, label]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "chip";
      button.textContent = label;
      button.dataset.filter = key;
      button.setAttribute("aria-pressed", String(key === selected));
      button.addEventListener("click", () => {
        $$("button", root).forEach((btn) => btn.setAttribute("aria-pressed", String(btn === button)));
        onChange(key);
      });
      root.append(button);
    });
  }

  function emptyPlan() {
    return { version: PLAN_VERSION, lines: [], urgency: "standard" };
  }
  function normalisePlan(raw) {
    const cleaned = emptyPlan();
    if (!raw || typeof raw !== "object" || Array.isArray(raw) || raw.version !== PLAN_VERSION) return cleaned;
    if (own(URGENCY, raw.urgency)) cleaned.urgency = raw.urgency;
    if (!Array.isArray(raw.lines)) return cleaned;
    raw.lines.slice(0, MAX_LINES).forEach((line) => {
      if (!line || typeof line !== "object" || !own(SERVICES, line.service)) return;
      const service = SERVICES[line.service];
      if (!own(service.finishes, line.finish) || !own(COMPLEXITY, line.complexity)) return;
      cleaned.lines.push({
        service: line.service,
        finish: line.finish,
        complexity: line.complexity,
        quantity: integer(line.quantity, 1, 1, MAX_QUANTITY),
      });
    });
    return cleaned;
  }
  function readPlan() {
    try {
      return normalisePlan(JSON.parse(safeStorage.getItem(STORE_PLAN)));
    } catch {
      return emptyPlan();
    }
  }
  let plan = readPlan();
  function planCount() {
    return plan.lines.reduce((sum, line) => sum + line.quantity, 0);
  }
  function persistPlan() {
    safeStorage.setItem(STORE_PLAN, JSON.stringify(plan));
    // Re-read through the same adapter: this must work with native storage blocked.
    plan = readPlan();
    setText("[data-plan-count]", planCount());
  }
  function linePrice(line) {
    if (!own(SERVICES, line.service)) return 0;
    const service = SERVICES[line.service];
    if (!own(service.finishes, line.finish) || !own(COMPLEXITY, line.complexity)) return 0;
    return (
      Math.round((service.price + service.finishes[line.finish].extra) * COMPLEXITY[line.complexity].multiplier * 100) /
      100
    );
  }
  function totals() {
    const subtotal = plan.lines.reduce((sum, line) => sum + linePrice(line) * line.quantity, 0);
    const surcharge = Math.round(subtotal * URGENCY[plan.urgency].multiplier * 100) / 100;
    const days = plan.lines.reduce(
      (longest, line) => Math.max(longest, SERVICES[line.service].days + COMPLEXITY[line.complexity].days),
      0,
    );
    // Priority asks for about half the longest estimated turnaround, with URGENCY.priority.days
    // as the floor: a 14-business-day job becomes 7, never 3.
    const fastest = URGENCY[plan.urgency].days;
    return {
      subtotal,
      surcharge,
      total: subtotal + surcharge,
      days: fastest ? Math.max(fastest, Math.ceil(days / 2)) : days,
      standardDays: days,
    };
  }
  function addLine(line) {
    if (plan.lines.length >= MAX_LINES) {
      toast("Your plan has 12 garment lines. Remove a line before adding another.");
      return false;
    }
    plan.lines.push(line);
    persistPlan();
    return true;
  }
  function planText() {
    if (!plan.lines.length) return "No repair plan added.";
    const prices = totals();
    return (
      plan.lines
        .map(
          (line) =>
            `${line.quantity} × ${SERVICES[line.service].name} / ${SERVICES[line.service].finishes[line.finish].name} / ${COMPLEXITY[line.complexity].name}: ${money(linePrice(line) * line.quantity)}`,
        )
        .join("\n") +
      `\n${URGENCY[plan.urgency].name}\nEstimated total: ${money(prices.total)}. Subject to inspection and agreed scope.`
    );
  }

  /* Calendar helpers use UTC noon to represent civil dates. We never parse
   * a date-only input as a visitor-local midnight, which would shift dates for
   * people browsing from another time zone.
   */
  function today() {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date());
    const part = (type) => parts.find((item) => item.type === type).value;
    return `${part("year")}-${part("month")}-${part("day")}`;
  }
  const dateObject = (iso) => new Date(`${iso}T12:00:00Z`);
  function addDays(iso, amount) {
    const date = dateObject(iso);
    date.setUTCDate(date.getUTCDate() + amount);
    return date.toISOString().slice(0, 10);
  }
  function formatDay(iso, short = false) {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: TIME_ZONE,
      weekday: short ? "short" : "long",
      day: "numeric",
      month: short ? "short" : "long",
    }).format(dateObject(iso));
  }
  const weekday = (iso) => dateObject(iso).getUTCDay();
  const isoDate = (year, month, day) =>
    `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const holidayCache = new Map();
  // US federal holidays for any year, by rule. A holiday on a Saturday is also observed on the
  // Friday before, and one on a Sunday on the Monday after. Returns { "YYYY-MM-DD": "Name" }.
  function bankHolidays(year) {
    if (holidayCache.has(year)) return holidayCache.get(year);
    const out = {};
    // The nth given weekday of a month (1 = first).
    const nthWeekday = (month, day, nth) => {
      let date = isoDate(year, month, 1);
      while (weekday(date) !== day) date = addDays(date, 1);
      return addDays(date, (nth - 1) * 7);
    };
    const lastMonday = (month) => {
      let date = addDays(isoDate(year, month + 1, 1), -1);
      while (weekday(date) !== 1) date = addDays(date, -1);
      return date;
    };
    const fixed = (month, day, name) => {
      const date = isoDate(year, month, day);
      out[date] = name;
      if (weekday(date) === 6) out[addDays(date, -1)] = `${name} (observed)`;
      if (weekday(date) === 0) out[addDays(date, 1)] = `${name} (observed)`;
    };
    fixed(1, 1, "New Year’s Day");
    // Next January 1 on a Saturday is observed on December 31 of this year.
    if (weekday(isoDate(year + 1, 1, 1)) === 6) out[isoDate(year, 12, 31)] = "New Year’s Day (observed)";
    out[nthWeekday(1, 1, 3)] = "Martin Luther King Jr. Day";
    out[nthWeekday(2, 1, 3)] = "Washington’s Birthday";
    out[lastMonday(5)] = "Memorial Day";
    fixed(6, 19, "Juneteenth");
    fixed(7, 4, "Independence Day");
    out[nthWeekday(9, 1, 1)] = "Labor Day";
    out[nthWeekday(10, 1, 2)] = "Columbus Day";
    fixed(11, 11, "Veterans Day");
    out[nthWeekday(11, 4, 4)] = "Thanksgiving Day";
    fixed(12, 25, "Christmas Day");
    holidayCache.set(year, out);
    return out;
  }
  // Why the workroom is closed on an otherwise open weekday, or "" when it isn't.
  function closure(iso) {
    const holidays = bankHolidays(Number(iso.slice(0, 4)));
    if (CLOSE_ON_BANK_HOLIDAYS && own(holidays, iso)) return holidays[iso];
    const md = iso.slice(5);
    if (md >= WINTER_BREAK.from || md <= WINTER_BREAK.through) return "Winter break";
    if (EXTRA_CLOSED.includes(iso)) return "Studio closed";
    return "";
  }
  function opening(iso) {
    if (closure(iso)) return null;
    const day = String(weekday(iso));
    return own(HOURS, day) ? HOURS[day] : null;
  }
  const minutes = (hhmm) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3));
  const clock = (value) => `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
  // "09:30" as the visitor reads it: "9:30am". Slots keep 24-hour values for the arithmetic.
  function timeLabel(hhmm) {
    const hour = Number(hhmm.slice(0, 2));
    const mins = hhmm.slice(3);
    return `${hour % 12 || 12}${mins === "00" ? "" : `:${mins}`}${hour < 12 ? "am" : "pm"}`;
  }
  function availablePeople(type, day) {
    return Object.entries(PEOPLE).filter(
      ([, person]) => person.appointments.includes(type) && person.days.includes(weekday(day)),
    );
  }
  function slotsFor(day, type, personKey) {
    const hours = opening(day);
    if (!hours || !own(APPOINTMENTS, type) || day <= today() || day > addDays(today(), BOOK_AHEAD_DAYS)) return [];
    const eligible = availablePeople(type, day).filter(([key]) => personKey === "any" || key === personKey);
    if (!eligible.length) return [];
    const duration = APPOINTMENTS[type].minutes;
    const slots = [];
    for (let time = minutes(hours.open); time + duration <= minutes(hours.close); time += SLOT_STEP) {
      // Lunch is protected, as is the full requested appointment duration.
      if (time < 13 * 60 + 30 && time + duration > 12 * 60 + 30) continue;
      const available = eligible.filter(([key]) => {
        const seed =
          Number(day.replaceAll("-", "")) + Math.floor(time / SLOT_STEP) + Object.keys(PEOPLE).indexOf(key) * 11;
        return seed % 5 !== 0;
      });
      if (available.length) slots.push({ time: clock(time), people: available.map(([key]) => key) });
    }
    return slots;
  }
  function nextFitting() {
    for (let offset = 1; offset <= BOOK_AHEAD_DAYS; offset += 1) {
      const day = addDays(today(), offset);
      const slots = slotsFor(day, "fitting", "any");
      if (slots.length) return `${formatDay(day, true)} at ${timeLabel(slots[0].time)}`;
    }
    return "Contact the studio for a fitting";
  }

  function initHeader() {
    const toggle = $("#menu-toggle");
    const menu = $("#mobile-menu");
    if (!toggle || !menu) return;
    function close(returnFocus = false) {
      menu.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
      if (returnFocus) toggle.focus();
    }
    toggle.addEventListener("click", () => {
      const open = menu.hidden;
      menu.hidden = !open;
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !menu.hidden) close(true);
    });
    window.matchMedia("(min-width: 1024px)").addEventListener("change", (event) => {
      if (event.matches) close();
    });
  }
  function initReveal() {
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    document.documentElement.classList.add("js");
    const elements = $$(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Reveal anything above too: fast anchor and End-key jumps stay complete.
            const bottom = entry.target.getBoundingClientRect().bottom;
            elements.forEach((el) => {
              if (el.getBoundingClientRect().top <= bottom) {
                el.classList.add("is-visible");
                observer.unobserve(el);
              }
            });
          }
        });
      },
      { threshold: 0.05 },
    );
    elements.forEach((el) => observer.observe(el));
  }
  function serviceCard(key, compact = false) {
    const service = SERVICES[key];
    return `<article class="group border border-line bg-white p-5 sm:p-6"><div class="flex items-start justify-between gap-3"><span class="grid size-14 shrink-0 place-items-center bg-ink text-gold">${icon(key)}</span><p class="shrink-0 text-sm font-semibold">From ${money(service.price)}</p></div><p class="eyebrow mt-5 text-ochre">${CATEGORIES[service.category]}</p><h${compact ? "3" : "2"} class="display mt-3 text-2xl"><a class="hover:underline underline-offset-4" href="service.html?service=${key}">${service.name}</a></h${compact ? "3" : "2"}><p class="mt-4 text-sm leading-7 text-muted">${service.short}</p><div class="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4"><span class="text-xs text-muted">${plural(service.days, "business day")}</span><a class="text-link text-sm" href="service.html?service=${key}">Finishes &amp; fitting</a></div></article>`;
  }
  function initServices() {
    const root = $("[data-services]");
    if (!root) return;
    let category = own(CATEGORIES, qs.get("category")) ? qs.get("category") : "all";
    const search = $("#service-search");
    function render() {
      const term = search.value.trim().toLowerCase();
      const keys = Object.keys(SERVICES).filter((key) => {
        const item = SERVICES[key];
        return (
          (category === "all" || category === item.category) &&
          `${item.name} ${item.short} ${item.description}`.toLowerCase().includes(term)
        );
      });
      root.innerHTML = keys.map((key) => serviceCard(key)).join("");
      setText("[data-service-count]", `${plural(keys.length, "service")} in the workroom`);
      $("[data-service-empty]").hidden = keys.length > 0;
    }
    mountFilters("[data-service-filters]", CATEGORIES, category, (key) => {
      category = key;
      updateQuery("category", key);
      render();
    });
    search.addEventListener("input", render);
    render();
  }
  function initDetail() {
    const heading = $("[data-detail-name]");
    if (!heading) return;
    const key = own(SERVICES, qs.get("service")) ? qs.get("service") : "trouser-hem";
    const service = SERVICES[key];
    const finish = $("#detail-finish");
    heading.textContent = service.name;
    document.title = `${service.name} — Pleat, Alexandria`;
    setText("[data-detail-category]", CATEGORIES[service.category]);
    setText("[data-detail-description]", service.description);
    setText("[data-detail-days]", plural(service.days, "business day"));
    $("[data-detail-art]").src = `assets/img/${service.art}.svg`;
    $("[data-detail-art]").alt = `${service.name}: garment construction drawing`;
    $("[data-detail-icon]").innerHTML = icon(key, "size-14");
    $("[data-detail-book]").href = `book.html?type=${SERVICE_APPOINTMENT[service.category]}`;
    $("[data-detail-checks]").innerHTML = service.checks
      .map((text) => `<li class="border-b border-line pb-3">${text}</li>`)
      .join("");
    setText("[data-detail-bring]", service.bring);
    setText("[data-detail-limit]", service.limit);
    $("[data-related-services]").innerHTML = service.related.map((id) => serviceCard(id, true)).join("");
    options(
      finish,
      Object.fromEntries(
        Object.entries(service.finishes).map(([id, item]) => [
          id,
          `${item.name} — ${money(service.price + item.extra)}`,
        ]),
      ),
    );
    function update() {
      const choice = own(service.finishes, finish.value) ? finish.value : firstKey(service.finishes);
      setText("[data-detail-price]", money(service.price + service.finishes[choice].extra));
      setText("[data-detail-finish-note]", service.finishes[choice].note);
    }
    finish.addEventListener("change", update);
    $("[data-detail-add]").addEventListener("click", () => {
      const choice = own(service.finishes, finish.value) ? finish.value : firstKey(service.finishes);
      if (addLine({ service: key, finish: choice, complexity: "standard", quantity: 1 }))
        toast(`${service.name} added to your estimate. Open Your estimate to review it.`);
    });
    update();
  }
  function renderPlan() {
    const root = $("[data-plan-items]");
    if (!root) return;
    const count = planCount();
    const prices = totals();
    setText(
      "[data-plan-caption]",
      count
        ? `${plural(count, "garment")} · estimated prices before inspection`
        : "Start with one garment. Your plan will appear here.",
    );
    root.innerHTML = plan.lines
      .map((line, index) => {
        const service = SERVICES[line.service];
        return `<article class="py-5" data-plan-line="${index}"><div class="flex items-start justify-between gap-4"><h3 class="font-semibold">${line.quantity} × ${service.name}</h3><p class="shrink-0 font-semibold">${money(linePrice(line) * line.quantity)}</p></div><p class="mt-2 text-sm text-muted">${service.finishes[line.finish].name} · ${COMPLEXITY[line.complexity].name}</p><button class="text-link mt-3 min-h-10 text-sm" type="button" data-remove-line="${index}" aria-label="Remove ${escape(service.name)} from plan">Remove garment</button></article>`;
      })
      .join("");
    setText("[data-subtotal]", money(prices.subtotal));
    setText("[data-surcharge]", money(prices.surcharge));
    setText("[data-total]", money(prices.total));
    setText(
      "[data-turnaround]",
      count
        ? plan.urgency === "priority" && prices.days < prices.standardDays
          ? `${plural(prices.days, "business day")} requested (standard ${prices.standardDays})`
          : plural(prices.days, "business day")
        : "Add a garment",
    );
    setText("[data-urgency-note]", URGENCY[plan.urgency].note);
    $("[data-clear-plan]").disabled = !plan.lines.length;
    $("[data-save-plan]").disabled = !plan.lines.length;
    $("[data-print-plan]").disabled = !plan.lines.length;
    $$("[data-remove-line]", root).forEach((button) => {
      button.addEventListener("click", () => {
        const index = integer(button.dataset.removeLine, -1, -1, plan.lines.length - 1);
        if (index < 0) return;
        const name = SERVICES[plan.lines[index].service].name;
        plan.lines.splice(index, 1);
        persistPlan();
        renderPlan();
        const remaining = $$("[data-remove-line]", root);
        if (remaining.length) remaining[Math.min(index, remaining.length - 1)].focus();
        else $("#plan-title").focus();
        setText("[data-save-status]", `${name} removed. Your plan now has ${plural(planCount(), "garment")}.`);
      });
    });
  }
  function initQuote() {
    const form = $("#quote-add");
    if (!form) return;
    const serviceSelect = $("#quote-service");
    const finishSelect = $("#quote-finish");
    const complexitySelect = $("#quote-complexity");
    const quantityInput = $("#quote-quantity");
    const urgencySelect = $("#quote-urgency");
    const initial = own(SERVICES, qs.get("service")) ? qs.get("service") : "trouser-hem";
    options(serviceSelect, SERVICES, initial);
    options(complexitySelect, COMPLEXITY, "standard");
    options(urgencySelect, URGENCY, plan.urgency);
    $("[data-line-preview]").setAttribute("aria-live", "polite");
    $("[data-total]").setAttribute("aria-live", "polite");
    function currentLine() {
      const serviceKey = own(SERVICES, serviceSelect.value) ? serviceSelect.value : "trouser-hem";
      const service = SERVICES[serviceKey];
      return {
        service: serviceKey,
        finish: own(service.finishes, finishSelect.value) ? finishSelect.value : firstKey(service.finishes),
        complexity: own(COMPLEXITY, complexitySelect.value) ? complexitySelect.value : "standard",
        quantity: integer(quantityInput.value, 1, 1, MAX_QUANTITY),
      };
    }
    function preview() {
      const line = currentLine();
      setText("[data-line-preview]", money(linePrice(line) * line.quantity));
      setText(
        "[data-quote-finish-note]",
        `${SERVICES[line.service].finishes[line.finish].note} ${COMPLEXITY[line.complexity].note}`,
      );
    }
    function changeService() {
      const key = own(SERVICES, serviceSelect.value) ? serviceSelect.value : "trouser-hem";
      options(
        finishSelect,
        Object.fromEntries(
          Object.entries(SERVICES[key].finishes).map(([id, finish]) => [
            id,
            `${finish.name} (+${money(finish.extra)})`,
          ]),
        ),
      );
      preview();
    }
    serviceSelect.addEventListener("change", changeService);
    finishSelect.addEventListener("change", preview);
    complexitySelect.addEventListener("change", preview);
    quantityInput.addEventListener("input", preview);
    urgencySelect.addEventListener("change", () => {
      plan.urgency = own(URGENCY, urgencySelect.value) ? urgencySelect.value : "standard";
      persistPlan();
      renderPlan();
    });
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const quantity = Number(quantityInput.value);
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY || !quantityInput.value.trim()) {
        $("#quantity-error").textContent = "Choose a whole number between 1 and 6.";
        quantityInput.setAttribute("aria-invalid", "true");
        quantityInput.focus();
        return;
      }
      $("#quantity-error").textContent = "";
      quantityInput.removeAttribute("aria-invalid");
      const line = currentLine();
      if (addLine(line)) {
        renderPlan();
        setText(
          "[data-save-status]",
          `${plural(line.quantity, "garment")} added. Estimated total ${money(totals().total)}.`,
        );
      }
    });
    $("[data-clear-plan]").addEventListener("click", () => {
      plan = emptyPlan();
      safeStorage.removeItem(STORE_PLAN);
      setText("[data-plan-count]", 0);
      urgencySelect.value = "standard";
      renderPlan();
      $("#plan-title").focus();
      setText("[data-save-status]", "Your repair plan has been cleared.");
    });
    $("[data-save-plan]").addEventListener("click", () => {
      persistPlan();
      renderPlan();
      setText(
        "[data-save-status]",
        `Repair plan saved for this browser session: ${plural(planCount(), "garment")}, ${money(totals().total)} estimated total. When browser storage is available, it is kept for your next visit too.`,
      );
    });
    $("[data-print-plan]").addEventListener("click", () => window.print());
    changeService();
    renderPlan();
  }

  /* Fitting calendar: a rolling six-week window, specialist work days, valid
   * appointment durations and a request confirmation. Availability is illustrative
   * until an operator connects a booking backend; requests are confirmed by email.
   */
  function initBooking() {
    const form = $("#booking-form");
    if (!form) return;
    const typeSelect = $("#appointment-type");
    const personSelect = $("#appointment-person");
    let type = own(APPOINTMENTS, qs.get("type")) ? qs.get("type") : "fitting";
    let person = own(PEOPLE, qs.get("person")) ? qs.get("person") : "any";
    // A link to a named specialist keeps them selected: if they don't offer the
    // requested (or default) appointment, start from the first one they do offer.
    if (person !== "any" && !PEOPLE[person].appointments.includes(type)) type = PEOPLE[person].appointments[0];
    let offset = 1;
    let chosenDay = "";
    let chosenTime = "";
    options(typeSelect, APPOINTMENTS, type);
    $("[data-fitting-slots]").setAttribute("aria-live", "polite");
    $("[data-week-label]").setAttribute("aria-live", "polite");
    function invalidateReview() {
      $("#booking-review").hidden = true;
    }
    function populatePeople() {
      const eligible = Object.fromEntries(
        Object.entries(PEOPLE).filter(([, item]) => item.appointments.includes(type)),
      );
      if (person !== "any" && !own(eligible, person)) person = "any";
      options(personSelect, { any: "First suitable specialist", ...eligible }, person);
    }
    function renderSlots() {
      const root = $("[data-fitting-slots]");
      root.replaceChildren();
      chosenTime = "";
      invalidateReview();
      if (!chosenDay) {
        const text = document.createElement("p");
        text.className = "col-span-full text-sm text-muted";
        text.textContent = "Choose an open day to see fitting times.";
        root.append(text);
        return;
      }
      const slots = slotsFor(chosenDay, type, person);
      slots.forEach((slot) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "slot";
        button.dataset.slot = slot.time;
        button.textContent = timeLabel(slot.time);
        button.setAttribute("aria-pressed", "false");
        button.setAttribute("aria-label", `${timeLabel(slot.time)} on ${formatDay(chosenDay)}`);
        button.addEventListener("click", () => {
          chosenTime = slot.time;
          $$("button", root).forEach((el) => el.setAttribute("aria-pressed", String(el === button)));
          $("#slot-error").textContent = "";
          invalidateReview();
        });
        root.append(button);
      });
      if (!slots.length)
        root.innerHTML =
          '<p class="col-span-full text-sm text-muted">No suitable times on this day. Choose another day or specialist.</p>';
    }
    function renderDays() {
      const root = $("[data-fitting-days]");
      root.replaceChildren();
      const from = addDays(today(), offset);
      const through = addDays(today(), Math.min(offset + 6, BOOK_AHEAD_DAYS));
      setText("[data-week-label]", `${formatDay(from, true)} – ${formatDay(through, true)}`);
      for (let i = offset; i <= Math.min(offset + 6, BOOK_AHEAD_DAYS); i += 1) {
        const day = addDays(today(), i);
        const button = document.createElement("button");
        const hours = opening(day);
        const slots = slotsFor(day, type, person);
        button.type = "button";
        button.className = "slot";
        button.dataset.day = day;
        button.disabled = !slots.length;
        button.setAttribute("aria-pressed", String(chosenDay === day));
        const dateLabel = document.createElement("span");
        dateLabel.className = "block font-semibold";
        dateLabel.textContent = formatDay(day, true);
        const status = document.createElement("span");
        status.className = "mt-1 block text-xs";
        status.textContent = !hours
          ? (own(HOURS, String(weekday(day))) && closure(day)) || "Closed"
          : !slots.length
            ? "No suitable times"
            : plural(slots.length, "time");
        // The name starts with what the day shows ("Tue, Nov 10, 11 times"), then says it in full.
        button.setAttribute(
          "aria-label",
          `${dateLabel.textContent}, ${status.textContent} (${formatDay(day)}${!hours ? `, studio closed${closure(day) ? `: ${closure(day)}` : ""}` : !slots.length ? ", no suitable appointments" : ""})`,
        );
        button.append(dateLabel, " ", status);
        button.addEventListener("click", () => {
          chosenDay = day;
          $$("button", root).forEach((el) => el.setAttribute("aria-pressed", String(el === button)));
          $("#day-error").textContent = "";
          renderSlots();
        });
        root.append(button);
      }
      $("[data-week-prev]").disabled = offset <= 1;
      $("[data-week-next]").disabled = offset + 7 > BOOK_AHEAD_DAYS;
    }
    function resetCalendar() {
      chosenDay = "";
      chosenTime = "";
      setText("[data-appointment-note]", APPOINTMENTS[type].note);
      renderDays();
      renderSlots();
    }
    typeSelect.addEventListener("change", () => {
      type = own(APPOINTMENTS, typeSelect.value) ? typeSelect.value : "fitting";
      populatePeople();
      resetCalendar();
    });
    personSelect.addEventListener("change", () => {
      person = own(PEOPLE, personSelect.value) ? personSelect.value : "any";
      resetCalendar();
    });
    $("[data-week-prev]").addEventListener("click", () => {
      offset = Math.max(1, offset - 7);
      resetCalendar();
    });
    $("[data-week-next]").addEventListener("click", () => {
      offset = Math.min(BOOK_AHEAD_DAYS - 6, offset + 7);
      resetCalendar();
    });
    form.addEventListener("input", invalidateReview);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const name = form.elements.namedItem("name").value.trim();
      const email = form.elements.namedItem("email").value.trim();
      const notes = form.elements.namedItem("notes").value.trim();
      const contact = form.elements.namedItem("contact").checked;
      const validName = validateField(
        form,
        "booking-name",
        name.length >= 2 && name.length <= 80,
        "Please enter your name (2–80 characters).",
      );
      const validEmail = validateField(
        form,
        "booking-email",
        validEmailAddress(email),
        "Please enter a valid email address.",
      );
      const validNotes = validateField(
        form,
        "booking-notes",
        notes.length >= 12 && notes.length <= 1200,
        "Tell us a little about the garment (12–1,200 characters).",
      );
      $("#booking-contact-error").textContent = contact ? "" : "Please allow us to contact you about this request.";
      form.elements.namedItem("contact").setAttribute("aria-invalid", String(!contact));
      const liveSlots = chosenDay ? slotsFor(chosenDay, type, person) : [];
      const validDay = chosenDay > today() && chosenDay <= addDays(today(), BOOK_AHEAD_DAYS) && !!opening(chosenDay);
      const validSlot = liveSlots.find((slot) => slot.time === chosenTime);
      $("#day-error").textContent = validDay ? "" : "Choose an open fitting day.";
      $("#slot-error").textContent = validSlot ? "" : "Choose an available fitting time.";
      if (!validDay || !validSlot || !validName || !validEmail || !validNotes || !contact) {
        if (!validDay) $("[data-fitting-days] button:not(:disabled)")?.focus();
        else if (!validSlot) $("[data-fitting-slots] button")?.focus();
        else $('[aria-invalid="true"]', form)?.focus();
        return;
      }
      const actualPerson = person === "any" ? validSlot.people[0] : person;
      const fitting = `${formatDay(chosenDay)} at ${timeLabel(chosenTime)} (Eastern time)`;
      const ref = makeRef();
      const lines = [
        ["Reference", ref],
        ["Name", name],
        ["Email", email],
        ["Appointment", APPOINTMENTS[type].name],
        ["Requested time", fitting],
        ["Specialist", PEOPLE[actualPerson].name],
        ["Garments", notes],
        ["Repair plan", planText()],
      ];
      $("[data-booking-summary]").replaceChildren();
      lines.forEach(([label, value]) => {
        const paragraph = document.createElement("p");
        const title = document.createElement("strong");
        title.textContent = `${label}: `;
        paragraph.append(title, document.createTextNode(value));
        $("[data-booking-summary]").append(paragraph);
      });
      setText("[data-booking-ref]", ref);
      // Backend integration point: POST validated fields and selected slot to a
      // server, revalidate actual availability there, then show this confirmation
      // (with the server's own reference, if it returns one) only when it answers OK.
      form.hidden = true;
      $("#booking-review").hidden = false;
      $("#booking-review").focus();
    });
    setText(
      "[data-booking-plan]",
      plan.lines.length
        ? `${plural(planCount(), "garment")} · ${money(totals().total)} estimated total. Your full plan will be included in the request.`
        : "No garments added yet. You can still request a fitting without an estimate.",
    );
    populatePeople();
    resetCalendar();
  }

  function workCard(item, compact = false) {
    return `<article><a href="service.html?service=${item.service}" class="block overflow-hidden bg-ink"><img class="w-full transition-transform duration-500 hover:scale-[1.02]" src="assets/img/${item.art}.svg" width="530" height="520" alt="${escape(item.garment)}"></a><p class="eyebrow mt-5 text-ochre">${WORK_CATEGORIES[item.category]} / ${escape(item.label)}</p><h${compact ? "3" : "2"} class="display mt-3 text-2xl">${item.title}</h${compact ? "3" : "2"}><p class="mt-3 text-sm leading-7 text-muted">${item.garment}</p>${compact ? `<a class="text-link mt-4 inline-block text-sm" href="work.html">Read the work ledger</a>` : `<button class="text-link mt-4 min-h-11 text-sm" type="button" data-open-work="${item.id}" aria-haspopup="dialog" aria-controls="work-dialog">Read the alteration notes<span class="sr-only">: ${item.title}</span></button>`}</article>`;
  }
  function initWork() {
    const featured = $("[data-featured-work]");
    if (featured) featured.innerHTML = [WORK[0], WORK[3], WORK[2]].map((item) => workCard(item, true)).join("");
    const root = $("[data-work-grid]");
    if (!root) return;
    let selected = own(WORK_CATEGORIES, qs.get("kind")) ? qs.get("kind") : "all";
    const dialog = $("#work-dialog");
    let opener = null;
    function openWork(item, button) {
      opener = button;
      $("[data-work-detail]").innerHTML =
        `<div class="grid gap-6 sm:grid-cols-2"><img class="w-full" src="assets/img/${item.art}.svg" width="530" height="520" alt="${escape(item.garment)}"><div><p class="eyebrow text-ochre">${WORK_CATEGORIES[item.category]} / ${escape(item.label)}</p><h2 class="display mt-4 text-3xl">${item.title}</h2><p class="mt-5 text-sm leading-7 text-muted">${item.detail}</p></div></div><dl class="mt-6 space-y-5 text-sm leading-7"><div><dt class="font-semibold">Before</dt><dd class="mt-2 text-muted">${item.before}</dd></div><div><dt class="font-semibold">At the bench</dt><dd class="mt-2 text-muted">${item.method}</dd></div><div><dt class="font-semibold">After</dt><dd class="mt-2 text-muted">${item.result}</dd></div></dl><p class="mt-6 border-t border-line pt-5 text-sm leading-7">${item.lesson}</p><a class="button mt-6" href="service.html?service=${item.service}">Explore this alteration</a>`;
      dialog.setAttribute("aria-label", item.title);
      dialog.showModal();
      $("[data-close-work]").focus();
    }
    function closeWork() {
      dialog.close();
      opener?.focus();
    }
    $("[data-close-work]").addEventListener("click", closeWork);
    dialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      closeWork();
    });
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) {
        const bounds = dialog.getBoundingClientRect();
        if (
          event.clientX < bounds.left ||
          event.clientX > bounds.right ||
          event.clientY < bounds.top ||
          event.clientY > bounds.bottom
        )
          closeWork();
      }
    });
    function render() {
      const filtered = WORK.filter((item) => selected === "all" || item.category === selected);
      root.innerHTML = filtered.map((item) => workCard(item)).join("");
      setText("[data-work-count]", `${plural(filtered.length, "piece")} from the workroom ledger`);
      $$("[data-open-work]", root).forEach((button) => {
        button.addEventListener("click", () => {
          const item = WORK.find((work) => work.id === button.dataset.openWork);
          if (item) openWork(item, button);
        });
      });
    }
    mountFilters("[data-work-filters]", WORK_CATEGORIES, selected, (key) => {
      selected = key;
      updateQuery("kind", key);
      render();
    });
    render();
  }
  function initTeam() {
    const root = $("[data-team]");
    if (!root) return;
    root.innerHTML = Object.entries(PEOPLE)
      .map(
        ([key, person], index) =>
          `<article><div class="bg-ink p-5"><p class="eyebrow text-gold">Workroom / 0${index + 1}</p><img class="w-full" src="assets/img/${person.art}.svg" width="530" height="520" alt="${escape(person.picture)}"></div><h3 class="display mt-6 text-2xl">${person.name}</h3><p class="mt-2 text-sm font-semibold text-ochre">${person.role}</p><p class="mt-4 text-sm leading-7 text-muted">${person.bio}</p><p class="mt-4 border-t border-line pt-4 text-xs leading-6 text-muted">${person.note}</p><a class="text-link mt-5 inline-block text-sm" href="book.html?type=${person.appointments[0]}&amp;person=${key}">Request ${APPOINTMENTS[person.appointments[0]].short} with ${person.name.split(" ")[0]}</a></article>`,
      )
      .join("");
  }
  function initCare() {
    const root = $("[data-care-notes]");
    if (!root) return;
    let category = own(CARE_CATEGORIES, qs.get("fabric")) ? qs.get("fabric") : "all";
    const search = $("#care-search");
    function render() {
      const term = search.value.trim().toLowerCase();
      const items = CARE.filter(
        (item) =>
          (category === "all" || category === item.category) &&
          `${item.title} ${item.intro} ${item.steps.join(" ")} ${item.avoid}`.toLowerCase().includes(term),
      );
      root.innerHTML = items
        .map(
          (item, index) =>
            `<details class="border border-line bg-white p-5 sm:p-6" ${index === 0 ? "open" : ""}><summary class="flex items-start justify-between gap-4"><span><span class="eyebrow text-ochre">${CARE_CATEGORIES[item.category]} / ${item.read}</span><span class="display mt-3 block text-2xl">${item.title}</span></span><svg class="mt-2 size-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m5 9 7 7 7-7"/></svg></summary><p class="mt-5 text-sm leading-7 text-muted">${item.intro}</p><ol class="mt-5 space-y-3 text-sm leading-7">${item.steps.map((text, i) => `<li class="flex gap-3"><span class="font-semibold text-ochre">0${i + 1}</span><span>${text}</span></li>`).join("")}</ol><p class="mt-5 border-t border-line pt-4 text-sm leading-7"><strong>Avoid:</strong> ${item.avoid}</p><p class="mt-4 text-sm leading-7 text-muted"><strong>From the workroom:</strong> ${item.studio}</p></details>`,
        )
        .join("");
      setText("[data-care-count]", `${plural(items.length, "care note")} for a longer wardrobe life`);
      $("[data-care-empty]").hidden = items.length > 0;
    }
    mountFilters("[data-care-filters]", CARE_CATEGORIES, category, (key) => {
      category = key;
      updateQuery("fabric", key);
      render();
    });
    search.addEventListener("input", render);
    render();
  }

  function validEmailAddress(value) {
    return value.length <= 180 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }
  function validateField(form, id, valid, message) {
    const field = $(`#${id}`, form);
    const error = $(`#${id}-error`, form);
    error.textContent = valid ? "" : message;
    field.setAttribute("aria-invalid", String(!valid));
    return valid;
  }
  function initContact() {
    const form = $("#contact-form");
    if (!form) return;
    const topics = {
      alteration: "An alteration",
      repair: "A repair",
      occasion: "An occasion garment",
      access: "Access or a quiet fitting",
      collection: "A garment ready for pickup",
    };
    form.addEventListener("input", () => {
      $("#contact-review").hidden = true;
    });
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const name = form.elements.namedItem("name").value.trim();
      const email = form.elements.namedItem("email").value.trim();
      const message = form.elements.namedItem("message").value.trim();
      const chosenTopic = form.elements.namedItem("topic").value;
      const topic = own(topics, chosenTopic) ? topics[chosenTopic] : topics.alteration;
      const checks = [
        validateField(
          form,
          "contact-name",
          name.length >= 2 && name.length <= 80,
          "Please enter your name (2–80 characters).",
        ),
        validateField(form, "contact-email", validEmailAddress(email), "Please enter a valid email address."),
        validateField(
          form,
          "contact-message",
          message.length >= 12 && message.length <= 1500,
          "Tell us a little more (12–1,500 characters).",
        ),
      ];
      if (checks.includes(false)) {
        $('[aria-invalid="true"]', form)?.focus();
        return;
      }
      setText(
        "[data-contact-summary]",
        `Thank you, ${name.split(/\s+/)[0]}. Your inquiry about ${topic.toLowerCase()} has reached the workroom. We reply to ${email} within two business days, often with a question or two about the garment. Your reference is ${makeRef()}.`,
      );
      // Backend integration point: fetch a configured form endpoint with FormData.
      // Show this confirmation only after a successful, validated server response.
      form.hidden = true;
      $("#contact-review").hidden = false;
      $("#contact-review").focus();
    });
  }

  setText("[data-year]", new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, year: "numeric" }).format(new Date()));
  setText("[data-plan-count]", planCount());
  setText("[data-next-fitting]", nextFitting());
  setText("[data-opening-next]", `Next fitting request: ${nextFitting()}.`);
  initHeader();
  initServices();
  initDetail();
  initQuote();
  initBooking();
  initWork();
  initTeam();
  initCare();
  initContact();
  initReveal();
})();
