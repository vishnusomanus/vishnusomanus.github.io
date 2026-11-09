/* Mend (Ledgerock Physical Therapy) — site scripts. Vanilla JavaScript, no dependencies.
   All clinic data (hours, federal holiday rules, treatments, clinicians, body map, exercises, prices and
   insurers) lives at the top of this file. Keep it in step with the HTML pages; see DOCS.md, "Content". */
(function () {
  'use strict';

  /* ======================================================================
     1. Clinic settings
     ====================================================================== */

  /* Time zone and opening hours. Times are 24-hour wall-clock times in Billings (Mountain Time).
     Day 0 is Sunday; null means closed. Keep in step with the hours lists in the HTML (data-hours). */
  var CLINIC = {
    name: 'Ledgerock Physical Therapy',
    timeZone: 'America/Denver',
    phone: '(406) 555-0126',
    phoneHref: 'tel:+14065550126'
  };
  var HOURS = {
    0: null,
    1: ['07:30', '20:00'],
    2: ['07:30', '20:00'],
    3: ['07:30', '20:00'],
    4: ['07:30', '20:00'],
    5: ['07:30', '18:00'],
    6: ['08:30', '13:00']
  };
  /* US federal holidays are worked out for every year by bankHolidays() below, so the schedule never
     shows a past date. Set to false to stay open on federal holidays. */
  var CLOSE_ON_BANK_HOLIDAYS = true;
  // Closed every year on these dates even when they fall on a Saturday (the observed holiday then moves to a weekday).
  var CLOSED_EVERY_YEAR = [
    { md: '12-25', label: 'Christmas Day' },
    { md: '07-04', label: 'Independence Day' },
    { md: '01-01', label: 'New Year’s Day' }
  ];
  // One-off closures (clinic date 'YYYY-MM-DD'), e.g. { date: '2027-03-12', label: 'a staff training day' }.
  var EXTRA_CLOSED = [];

  /* ---------- Treatments (treatments.html, book.html, prices.html, home) ----------
     minutes: appointment length. price: self-pay price in dollars. tags: filters on treatments.html.
     Order here is the order on every page. Art for each is in ART below. */
  var TREATMENTS = {
    initial: {
      name: 'Initial evaluation', minutes: 45, price: 140, tags: ['pain', 'sport', 'surgery'],
      blurb: 'Your first visit for a new problem: we listen, assess how you move and agree a plan together.',
      includes: ['A full history and movement assessment', 'A clear explanation of what is going on', 'Hands-on treatment if it helps on the day', 'Your first home exercises, written down'],
      who: 'Anyone new to us, or back with a new problem.'
    },
    followup: {
      name: 'Follow-up physical therapy', minutes: 30, price: 95, tags: ['pain', 'sport', 'surgery'],
      blurb: 'Review your progress, adjust the exercises and add hands-on treatment where it helps.',
      includes: ['Progress check against your goals', 'Exercises updated as you get stronger', 'Joint mobilization, soft tissue work or taping'],
      who: 'After an initial evaluation with any of our PTs.'
    },
    massage: {
      name: 'Sports massage', minutes: 45, price: 85, tags: ['sport', 'pain'],
      blurb: 'Firm, focused soft tissue work for tight, overworked muscles, before or after a big event.',
      includes: ['A quick chat about training and nagging aches', 'Deep tissue and trigger point work', 'Simple stretches to take away'],
      who: 'Runners, cyclists, desk workers and weekend gardeners.'
    },
    acupuncture: {
      name: 'Dry needling', minutes: 30, price: 75, tags: ['pain'],
      blurb: 'Trigger point dry needling from PTs with added training, used alongside exercise for pain relief.',
      includes: ['A safety check before your first session', 'Fine single-use needles, usually 10–20 minutes', 'Advice on how to keep the benefit going'],
      who: 'Persistent neck, back, shoulder and knee pain.'
    },
    postop: {
      name: 'Post-operative rehab', minutes: 45, price: 105, tags: ['surgery'],
      blurb: 'Step-by-step rehab after joint replacements, ACL reconstruction, shoulder and foot surgery.',
      includes: ['Your surgeon’s protocol, followed to the letter', 'Swelling, scar and range of motion work', 'Strength and return-to-activity milestones'],
      who: 'From a few days after surgery, once you are home.'
    },
    pelvic: {
      name: 'Pelvic health physical therapy', minutes: 60, price: 165, tags: ['pregnancy'],
      blurb: 'Private, unhurried care for pregnancy-related pain, postpartum recovery and bladder symptoms.',
      includes: ['A longer first appointment in a private room', 'Pelvic floor assessment, only with your consent', 'A return-to-exercise plan after birth'],
      who: 'Pregnancy, postpartum, menopause and continence concerns.'
    },
    running: {
      name: 'Running gait analysis', minutes: 60, price: 150, tags: ['sport'],
      blurb: 'Slow-motion video of you running, a strength screen and a plan to run farther with fewer aches.',
      includes: ['Treadmill video from three angles', 'Strength and mobility screen', 'A video summary and four-week plan'],
      who: 'New runners, marathon builds and recurring running injuries.'
    },
    pilates: {
      name: 'Clinical Pilates (1:1)', minutes: 45, price: 90, tags: ['pain', 'pregnancy'],
      blurb: 'One-on-one Pilates with a PT, built around your injury, your back or your pregnancy.',
      includes: ['Mat and small equipment work', 'Breathing and deep core control', 'A short routine for home'],
      who: 'Back pain, hypermobility, prenatal and postpartum strength.'
    },
    shockwave: {
      name: 'Shockwave therapy', minutes: 20, price: 110, tags: ['sport', 'pain'],
      blurb: 'Radial shockwave for stubborn tendon pain, alongside a loading program.',
      includes: ['Suitability check at your first session', 'Usually three to five weekly sessions', 'Tendon loading exercises in between'],
      who: 'Plantar heel pain, Achilles, tennis elbow and hip tendons.'
    },
    video: {
      name: 'Video visit', minutes: 30, price: 75, tags: ['online', 'pain', 'pregnancy'],
      blurb: 'Advice, exercise reviews and progressions from home, on your phone or laptop.',
      includes: ['A secure video link sent before your appointment', 'Exercise checks with your camera', 'Notes and videos afterwards'],
      who: 'Follow-ups, busy weeks and patients farther away in Montana.'
    }
  };
  var TREATMENT_TAGS = {
    all: 'All treatments',
    pain: 'Aches and pains',
    sport: 'Sport and running',
    surgery: 'After surgery',
    pregnancy: 'Pregnancy and pelvic health',
    online: 'From home'
  };

  /* ---------- Clinicians (team.html, book.html) ----------
     treatments: what each person offers. shifts: diary hours by weekday (0 = Sunday), clamped to HOURS.
     Portraits are assets/img/team-<id>.svg. Keep the cards on team.html in step. */
  var CLINICIANS = {
    varcoe: {
      name: 'Thea Varcoe', first: 'Thea', role: 'Clinic director, orthopedic physical therapist',
      treatments: ['initial', 'followup', 'acupuncture', 'shockwave', 'video'],
      shifts: { 1: ['08:00', '16:00'], 2: ['08:00', '16:00'], 4: ['12:00', '20:00'], 5: ['08:00', '14:00'] }
    },
    brannigan: {
      name: 'Ruairi Brannigan', first: 'Ruairi', role: 'Sports physical therapist',
      treatments: ['initial', 'followup', 'running', 'acupuncture', 'shockwave'],
      shifts: { 1: ['12:00', '20:00'], 3: ['07:30', '15:30'], 4: ['07:30', '15:30'], 6: ['08:30', '13:00'] }
    },
    adeyinka: {
      name: 'Folake Adeyinka', first: 'Folake', role: 'Senior physical therapist, orthopedic rehab',
      treatments: ['initial', 'followup', 'postop', 'acupuncture', 'pilates'],
      shifts: { 1: ['07:30', '15:30'], 3: ['12:00', '20:00'], 4: ['08:00', '16:00'], 5: ['12:00', '18:00'] }
    },
    lydgate: {
      name: 'Harriet Lydgate', first: 'Harriet', role: 'Pelvic health physical therapist',
      treatments: ['initial', 'followup', 'pelvic', 'pilates', 'video'],
      shifts: { 2: ['12:00', '20:00'], 3: ['09:00', '17:00'], 5: ['09:00', '17:00'] }
    },
    kimber: {
      name: 'Farah Kimber', first: 'Farah', role: 'Physical therapist, clinical Pilates',
      treatments: ['initial', 'followup', 'pilates', 'video'],
      shifts: { 1: ['16:00', '20:00'], 2: ['08:00', '14:00'], 3: ['15:00', '20:00'], 5: ['07:30', '13:00'] }
    },
    sefton: {
      name: 'Ewan Sefton', first: 'Ewan', role: 'Sports massage therapist',
      treatments: ['massage'],
      shifts: { 2: ['07:30', '15:30'], 4: ['14:00', '20:00'], 5: ['07:30', '15:30'], 6: ['08:30', '13:00'] }
    }
  };

  /* ---------- Online diary (book.html, home, treatments.html, team.html) ---------- */
  var BOOKING = {
    slotStep: 30,         // minutes between start times
    daysPerPage: 7,       // days shown at once in the day picker
    pages: 2,             // pages of days (2 x 7 = the next 14 days, today included)
    noticeMinutes: 120,   // earliest bookable start is this long after now
    demoBusyShare: 0.45,  // share of slots shown as taken so the diary looks real. Set to 0 when connected.
    refPrefix: 'LP'       // booking reference prefix
  };

  /* ---------- Body map (conditions.html) ----------
     view: which figure the hotspot sits on. treatments: suggested treatment ids. exercises: area filter
     on exercises.html. redFlags: when not to wait for physical therapy. General information, not a diagnosis. */
  var BODY_AREAS = {
    neck: {
      label: 'Neck', view: 'back', exercises: 'neck', treatments: ['initial', 'acupuncture', 'video'],
      intro: 'Most neck pain settles within a few weeks with gentle movement, and it is rarely a sign of anything serious.',
      conditions: [
        { name: 'Mechanical neck pain', feel: 'Stiffness and an ache that is worse after long spells at a desk or driving.', help: 'Regular movement breaks, mobility exercises and a look at your set-up.' },
        { name: 'Whiplash-associated pain', feel: 'Neck pain and headaches in the days after a car accident or fall.', help: 'Staying gently active, reassurance and a graded exercise plan.' },
        { name: 'Pinched nerve (cervical radiculopathy)', feel: 'Pain, pins and needles or weakness running down one arm.', help: 'Positions that ease the arm pain, nerve mobility and strength work.' }
      ],
      redFlags: ['Neck pain after a significant fall, crash or blow, with numbness or weakness: call 911.', 'Sudden dizziness, double vision, slurred speech or trouble swallowing: call 911.']
    },
    shoulder: {
      label: 'Shoulder', view: 'front', exercises: 'shoulder', treatments: ['initial', 'followup', 'acupuncture'],
      intro: 'Shoulders are very mobile, so they rely on good muscle control. Most problems respond well to the right exercise.',
      conditions: [
        { name: 'Rotator cuff related pain', feel: 'An ache on the outside of the arm, worse lifting overhead or lying on that side.', help: 'Load management and a progressive strengthening program.' },
        { name: 'Frozen shoulder', feel: 'Gradual pain then marked stiffness, especially reaching behind your back.', help: 'Pain relief strategies, gentle range of motion work and patience.' },
        { name: 'Shoulder instability', feel: 'The shoulder feels loose or has slipped out, often after a sporting fall.', help: 'Strength and control work, and referral for imaging if it keeps happening.' }
      ],
      redFlags: ['Shoulder or arm pain with chest pain, breathlessness or sweating: call 911.', 'A hot, red, swollen joint with a fever: call your doctor or go to urgent care today.']
    },
    'elbow-wrist': {
      label: 'Elbow and wrist', view: 'front', exercises: 'shoulder', treatments: ['initial', 'shockwave', 'acupuncture'],
      intro: 'Elbow and wrist pain is often linked to grip-heavy work, a new hobby or a sudden jump in training.',
      conditions: [
        { name: 'Tennis elbow', feel: 'Pain on the outside of the elbow when gripping, lifting a gallon of milk or using a mouse.', help: 'Tendon loading exercises, activity changes and sometimes shockwave.' },
        { name: 'Golfer’s elbow', feel: 'Pain on the inside of the elbow, worse with gripping and wrist bending.', help: 'Progressive loading and a look at technique or tools.' },
        { name: 'Carpal tunnel syndrome', feel: 'Tingling in the thumb and first fingers, often waking you at night.', help: 'Night splints, nerve gliding and advice on when to see your doctor.' }
      ],
      redFlags: ['An obvious deformity or you cannot move the wrist after a fall: go to urgent care or the ER.', 'Numbness that is spreading or a hand that is getting weaker: call your doctor or go to urgent care today.']
    },
    'upper-back': {
      label: 'Upper back', view: 'back', exercises: 'back', treatments: ['initial', 'followup', 'massage'],
      intro: 'The upper back is built for rotation. Long hours sitting still can leave it stiff and sore.',
      conditions: [
        { name: 'Thoracic stiffness', feel: 'A band of ache between the shoulder blades, eased by moving about.', help: 'Rotation and extension exercises, and breaking up long sitting spells.' },
        { name: 'Rib joint pain', feel: 'A sharp catch on breathing in or twisting, often after lifting or coughing.', help: 'Gentle mobilization, breathing exercises and reassurance.' },
        { name: 'Muscle strain', feel: 'Tender, tight muscles after a new activity or a heavy lift.', help: 'Staying active, heat, massage and gradual return to load.' }
      ],
      redFlags: ['Chest pain spreading to the arm, jaw or back, or with breathlessness: call 911.', 'Upper back pain with fever, unexplained weight loss or a history of cancer: see your doctor today.']
    },
    'lower-back': {
      label: 'Lower back', view: 'back', exercises: 'back', treatments: ['initial', 'pilates', 'acupuncture'],
      intro: 'Low back pain is very common and usually improves within six weeks. Gentle movement helps more than rest.',
      conditions: [
        { name: 'Non-specific low back pain', feel: 'Ache or spasm across the lower back, worse with bending or sitting.', help: 'Reassurance, staying active and a graded strength program.' },
        { name: 'Sciatica', feel: 'Pain, tingling or numbness running from the buttock down the leg.', help: 'Calming positions, nerve mobility and a gradual return to normal activity.' },
        { name: 'Disc-related pain', feel: 'Pain after lifting or bending, sometimes with leg symptoms.', help: 'Most settle without surgery; exercise and pacing are the mainstays.' }
      ],
      redFlags: ['Numbness around your buttocks or genitals, or new problems controlling your bladder or bowels: go to the ER now.', 'Weakness in both legs or pain with fever and feeling unwell: go to urgent care or the ER right away.']
    },
    hip: {
      label: 'Hip and groin', view: 'front', exercises: 'hip', treatments: ['initial', 'followup', 'shockwave'],
      intro: 'Hip pain can come from the joint, the tendons around it or even the lower back. A good assessment sorts out which.',
      conditions: [
        { name: 'Hip osteoarthritis', feel: 'Groin ache and stiffness, especially first thing and after sitting.', help: 'Strength work, weight management advice and keeping active.' },
        { name: 'Lateral hip pain', feel: 'Pain on the outside of the hip, worse lying on that side or climbing stairs.', help: 'Avoiding compressed positions and progressive glute strengthening.' },
        { name: 'Groin strain', feel: 'Sharp pain in the groin after kicking, sprinting or changing direction.', help: 'A staged return to sport with adductor strength milestones.' }
      ],
      redFlags: ['You cannot stand or put weight on the leg after a fall: go to the ER.', 'A hot, painful hip with a fever: call your doctor or go to urgent care today.']
    },
    knee: {
      label: 'Knee', view: 'front', exercises: 'knee', treatments: ['initial', 'postop', 'running'],
      intro: 'Knees respond well to strength. Even after injuries or surgery, most people get back to the things they enjoy.',
      conditions: [
        { name: 'Runner’s knee (patellofemoral pain)', feel: 'Ache around the kneecap on stairs, squats or after sitting.', help: 'Hip and thigh strength and adjusting training load.' },
        { name: 'Knee osteoarthritis', feel: 'Stiffness and an ache that varies day to day, sometimes with swelling.', help: 'Exercise is the first-line treatment, alongside pacing.' },
        { name: 'Ligament and meniscus injuries', feel: 'A twist with swelling, giving way or catching.', help: 'Early rehab, and referral for imaging or a surgical opinion where needed.' }
      ],
      redFlags: ['A swollen, hot or red calf, especially after surgery or a long trip: go to urgent care or the ER right away.', 'A knee that is locked and will not straighten after an injury: go to urgent care.']
    },
    'ankle-foot': {
      label: 'Ankle and foot', view: 'front', exercises: 'ankle', treatments: ['initial', 'shockwave', 'running'],
      intro: 'Ankle sprains and heel pain are among the things we see most. Early, guided rehab cuts the chance of them coming back.',
      conditions: [
        { name: 'Ankle sprain', feel: 'Swelling and bruising on the outside of the ankle after rolling it.', help: 'Early weight bearing, then balance and strength work.' },
        { name: 'Achilles tendinopathy', feel: 'Stiffness above the heel, worst first thing and at the start of a run.', help: 'Calf loading program, footwear and training changes.' },
        { name: 'Plantar heel pain', feel: 'Sharp heel pain on your first steps in the morning.', help: 'Calf and foot strengthening, load changes and sometimes shockwave.' }
      ],
      redFlags: ['You cannot take four steps after an injury, or there is bone tenderness: go to urgent care for an X-ray.', 'A swollen, painful calf after being in a cast or boot: go to urgent care or the ER right away.']
    }
  };

  /* ---------- Home exercise library (exercises.html) ----------
     dose: { sets, reps } or { sets, hold } (seconds). rest: seconds between sets in the helper.
     pose: joints for the drawing (see figureSVG). General exercises only: stop if pain is sharp or worsens. */
  var EXERCISE_AREAS = { all: 'All areas', neck: 'Neck', shoulder: 'Shoulder', back: 'Back', hip: 'Hip', knee: 'Knee', ankle: 'Ankle and foot', core: 'Core' };
  var LEVELS = { easy: 'Easy', moderate: 'Moderate', harder: 'Harder' };
  var EQUIPMENT = { none: 'No equipment', chair: 'Chair', band: 'Resistance band', mat: 'Mat', step: 'Step', wall: 'Wall' };
  var CHAIR = '<path d="M58 66h34M60 66v24M90 66v24M58 66V38" stroke="#97a7d8" stroke-width="3"/>';
  var MAT = '<rect x="12" y="89" width="140" height="3" rx="1.5" fill="#c0cbea" stroke="none"/>';
  var EXERCISES = [
    { id: 'chin-tuck', name: 'Chin tucks', area: 'neck', level: 'easy', equipment: 'chair', dose: { sets: 3, reps: 10 }, rest: 20,
      steps: ['Sit tall with your feet flat.', 'Glide your chin straight back, as if making a double chin.', 'Hold for two seconds, then relax.'], tip: 'Keep your eyes level: it is a slide, not a nod.',
      pose: { props: CHAIR, torso: [[68, 38], [66, 62]], head: [70, 28], far: { arm: [[67, 40], [70, 52], [78, 59]], leg: [[66, 63], [81, 63], [81, 87], [88, 89]] }, near: { arm: [[68, 40], [73, 52], [81, 58]], leg: [[66, 62], [83, 62], [84, 87], [91, 89]] }, marks: '<path d="M90 27h-9m3-3-3 3 3 3"/>' } },
    { id: 'trap-stretch', name: 'Upper trapezius stretch', area: 'neck', level: 'easy', equipment: 'none', dose: { sets: 3, hold: 20 }, rest: 15,
      steps: ['Stand or sit tall and let your shoulders drop.', 'Tilt your ear toward one shoulder.', 'Rest your hand lightly on your head and breathe.'], tip: 'A gentle stretch, never a pull. Swap sides each set.',
      pose: { torso: [[80, 34], [80, 58]], head: [73, 26], far: { arm: [[74, 36], [70, 48], [68, 60]], leg: [[76, 58], [75, 74], [74, 89]] }, near: { arm: [[86, 36], [96, 28], [82, 18]], leg: [[84, 58], [85, 74], [86, 89]] }, marks: '<path d="M86 33q6 3 11 1" stroke-dasharray="3 3"/>' } },
    { id: 'pendulum', name: 'Shoulder pendulums', area: 'shoulder', level: 'easy', equipment: 'none', dose: { sets: 2, reps: 15 }, rest: 20,
      steps: ['Lean forward with one hand on a table.', 'Let the sore arm hang loose.', 'Rock your body so the arm swings in small circles.'], tip: 'Let gravity do the work: the shoulder muscles stay relaxed.',
      pose: { props: '<path d="M112 58h40M118 58v32M148 58v32" stroke="#97a7d8" stroke-width="3"/>', torso: [[104, 46], [72, 58]], head: [114, 42], far: { arm: [[102, 47], [110, 54], [118, 57]], leg: [[72, 58], [68, 74], [66, 89], [73, 89]] }, near: { arm: [[100, 48], [99, 62], [98, 76]], leg: [[72, 58], [76, 74], [76, 89], [83, 89]] }, marks: '<ellipse cx="98" cy="79" rx="9" ry="3.5" stroke-dasharray="3 3"/>' } },
    { id: 'wall-slide', name: 'Wall slides', area: 'shoulder', level: 'moderate', equipment: 'wall', dose: { sets: 3, reps: 10 }, rest: 30,
      steps: ['Face a wall with your forearms resting on it.', 'Slide your arms up the wall, keeping light pressure.', 'Lower slowly back to the start.'], tip: 'Stop just before any pinch at the top and build the range over weeks.',
      pose: { props: '<path d="M120 6v84" stroke="#97a7d8" stroke-width="3"/>', torso: [[100, 34], [96, 58]], head: [104, 24], far: { arm: [[99, 37], [112, 32], [115, 17]], leg: [[96, 58], [94, 74], [94, 89], [101, 89]] }, near: { arm: [[101, 36], [114, 30], [117, 14]], leg: [[96, 58], [98, 74], [99, 89], [106, 89]] }, marks: '<path d="M128 36V14m-3 4 3-4 3 4"/>' } },
    { id: 'band-rotation', name: 'Band external rotation', area: 'shoulder', level: 'moderate', equipment: 'band', dose: { sets: 3, reps: 12 }, rest: 30,
      steps: ['Anchor a band at elbow height in a door.', 'Keep your elbow tucked to your side, bent to a right angle.', 'Turn your forearm out against the band, then return slowly.'], tip: 'A rolled towel under the arm helps keep the elbow in.',
      pose: { props: '<path d="M146 6v84" stroke="#97a7d8" stroke-width="3"/>', torso: [[80, 34], [80, 58]], head: [80, 24], far: { arm: [[74, 36], [72, 48], [70, 60]], leg: [[76, 58], [75, 74], [74, 89]] }, near: { arm: [[86, 36], [88, 50], [104, 46]], leg: [[84, 58], [85, 74], [86, 89]] }, marks: '<path d="M104 46 146 50" stroke-width="2"/><path d="M98 38q6-2 8 4"/>' } },
    { id: 'cat-camel', name: 'Cat–camel', area: 'back', level: 'easy', equipment: 'mat', dose: { sets: 2, reps: 10 }, rest: 20,
      steps: ['Kneel on all fours, hands under shoulders.', 'Slowly round your back up toward the ceiling.', 'Then let it sag gently, lifting your head a little.'], tip: 'Move with your breath and keep it slow and comfortable.',
      pose: { props: MAT, torso: [[60, 60], [82, 42], [104, 60]], head: [50, 64], far: { arm: [[58, 61], [57, 74], [56, 88]], leg: [[102, 61], [100, 87], [122, 88]] }, near: { arm: [[60, 60], [61, 74], [62, 88]], leg: [[104, 60], [105, 87], [127, 88]] }, marks: '<path d="M82 34v-9m-3 3 3-3 3 3"/>' } },
    { id: 'knee-to-chest', name: 'Knee to chest', area: 'back', level: 'easy', equipment: 'mat', dose: { sets: 3, hold: 20 }, rest: 15,
      steps: ['Lie on your back with your knees bent.', 'Hug one knee gently toward your chest.', 'Hold, breathe, then swap legs.'], tip: 'Keep your head and shoulders relaxed on the floor.',
      pose: { props: MAT, torso: [[30, 85], [72, 85]], head: [20, 83], far: { arm: [[30, 86], [44, 87], [58, 87]], leg: [[72, 86], [96, 86], [120, 86], [125, 81]] }, near: { arm: [[32, 85], [52, 74], [76, 64]], leg: [[72, 85], [78, 64], [94, 71]] }, marks: '<path d="M90 56q-8-6-16-2m3-4-3 4 5 1"/>' } },
    { id: 'bird-dog', name: 'Bird dog', area: 'back', level: 'moderate', equipment: 'mat', dose: { sets: 3, reps: 8 }, rest: 30,
      steps: ['Start on all fours with a flat back.', 'Reach one arm forward and the opposite leg back.', 'Hold for three seconds without tipping, then swap.'], tip: 'Imagine a cup of coffee balanced on your lower back.',
      pose: { props: MAT, torso: [[60, 60], [100, 60]], head: [50, 57], far: { arm: [[60, 61], [60, 74], [60, 88]], leg: [[100, 61], [100, 87], [122, 88]] }, near: { arm: [[60, 60], [46, 56], [32, 52]], leg: [[100, 60], [117, 60], [134, 60], [138, 55]] }, marks: '<path d="M24 52h-8M146 58h8"/>' } },
    { id: 'glute-bridge', name: 'Glute bridge', area: 'hip', level: 'easy', equipment: 'mat', dose: { sets: 3, reps: 12 }, rest: 30,
      steps: ['Lie on your back, knees bent, feet hip-width apart.', 'Squeeze your buttocks and lift your hips.', 'Pause at the top, then lower slowly.'], tip: 'Push through your heels and avoid arching your lower back.',
      pose: { props: MAT, focus: [70, 70, 10], ghost: '<path d="M30 85h40l24-23 8 24"/>', torso: [[30, 85], [70, 66]], head: [20, 83], far: { arm: [[32, 87], [46, 88], [60, 88]], leg: [[70, 67], [92, 58], [98, 86], [106, 88]] }, near: { arm: [[32, 87], [46, 88], [60, 88]], leg: [[70, 66], [96, 56], [102, 86], [110, 88]] }, marks: '<path d="M64 56V42m-3.5 3.5L64 42l3.5 3.5"/>' } },
    { id: 'clamshell', name: 'Clamshells', area: 'hip', level: 'easy', equipment: 'band', dose: { sets: 3, reps: 12 }, rest: 30,
      steps: ['Lie on your side with knees bent and feet together.', 'Keeping your feet touching, lift the top knee.', 'Lower with control.'], tip: 'Roll your top hip slightly forward so the right muscles work.',
      pose: { props: MAT, focus: [84, 76, 10], ghost: '<path d="M82 78 107 84 124 80"/>', torso: [[36, 82], [82, 80]], head: [24, 76], far: { arm: [[36, 83], [26, 86], [19, 78]], leg: [[82, 82], [108, 88], [125, 83], [130, 85]] }, near: { arm: [[40, 80], [54, 74], [64, 80]], leg: [[82, 78], [101, 57], [124, 79], [129, 81]] }, marks: '<path d="M116 76q0-11-10-17m5 1-5-1 1 5"/>' } },
    { id: 'hip-flexor', name: 'Kneeling hip flexor stretch', area: 'hip', level: 'moderate', equipment: 'mat', dose: { sets: 3, hold: 30 }, rest: 15,
      steps: ['Kneel on one knee with the other foot in front.', 'Tuck your tail under and shift your weight forward.', 'Feel the stretch at the front of the back hip.'], tip: 'Use a folded towel under your knee for comfort.',
      pose: { props: '<ellipse cx="66" cy="89" rx="9" ry="2.5" fill="#c0cbea" stroke="none"/>', torso: [[82, 36], [80, 60]], head: [83, 26], far: { arm: [[81, 38], [87, 48], [83, 58]], leg: [[80, 61], [66, 87], [46, 88]] }, near: { arm: [[82, 38], [75, 48], [79, 58]], leg: [[80, 60], [98, 62], [100, 88], [107, 88]] }, marks: '<path d="M73 66q-3 8-5 16" stroke-dasharray="3 3"/>' } },
    { id: 'straight-leg-raise', name: 'Straight leg raise', area: 'knee', level: 'easy', equipment: 'mat', dose: { sets: 3, reps: 10 }, rest: 30,
      steps: ['Lie on your back with one knee bent.', 'Tighten the thigh of the straight leg.', 'Lift it to the height of the other knee, then lower slowly.'], tip: 'Keep the knee locked straight the whole time.',
      pose: { props: MAT, torso: [[30, 86], [74, 86]], head: [20, 84], far: { arm: [[30, 87], [44, 88], [58, 88]], leg: [[74, 87], [90, 68], [106, 88], [112, 88]] }, near: { arm: [[30, 87], [44, 88], [58, 88]], leg: [[74, 86], [98, 76], [122, 66], [124, 60]] }, marks: '<path d="M132 82q6-10 2-20m-4 3 4-3 2 4"/>' } },
    { id: 'sit-to-stand', name: 'Sit to stand', area: 'knee', level: 'moderate', equipment: 'chair', dose: { sets: 3, reps: 10 }, rest: 45,
      steps: ['Sit near the front of a firm chair.', 'Lean forward and stand up without using your hands.', 'Sit back down slowly, lightly touching the seat.'], tip: 'Make it easier with a higher chair, harder with a lower one.',
      pose: { props: '<path d="M38 66h30M40 66v24M66 66v24M38 66V36" stroke="#97a7d8" stroke-width="3"/>', torso: [[88, 36], [70, 58]], head: [95, 28], far: { arm: [[87, 39], [98, 46], [110, 47]], leg: [[70, 59], [86, 66], [85, 88], [93, 88]] }, near: { arm: [[88, 38], [100, 44], [112, 44]], leg: [[70, 58], [88, 64], [88, 88], [96, 88]] }, marks: '<path d="M60 44q4-12 16-16m-4-2 4 2-2 4"/>' } },
    { id: 'step-up', name: 'Step-ups', area: 'knee', level: 'harder', equipment: 'step', dose: { sets: 3, reps: 10 }, rest: 45,
      steps: ['Stand facing a stair or sturdy step.', 'Step up, pushing through the whole foot.', 'Step down slowly with the other leg.'], tip: 'Keep your knee in line with your second toe.',
      pose: { props: '<rect x="92" y="72" width="44" height="18" rx="2" fill="#eff2fa" stroke="#97a7d8" stroke-width="2"/>', torso: [[101, 18], [100, 42]], head: [103, 9], far: { arm: [[100, 20], [94, 32], [90, 40]], leg: [[100, 43], [92, 58], [82, 68]] }, near: { arm: [[101, 20], [106, 32], [112, 40]], leg: [[100, 42], [104, 57], [106, 72], [114, 72]] }, marks: '' } },
    { id: 'calf-raise', name: 'Calf raises', area: 'ankle', level: 'easy', equipment: 'chair', dose: { sets: 3, reps: 15 }, rest: 30,
      steps: ['Stand holding the back of a chair.', 'Rise up onto your toes as high as you can.', 'Lower slowly over three seconds.'], tip: 'Progress to one leg at a time when two feel easy.',
      pose: { props: '<path d="M112 50h22M114 50v40M132 50v40" stroke="#97a7d8" stroke-width="3"/>', torso: [[80, 30], [80, 54]], head: [82, 20], far: { arm: [[79, 33], [92, 43], [108, 50]], leg: [[78, 54], [78, 70], [80, 83], [87, 89]] }, near: { arm: [[81, 32], [95, 42], [112, 50]], leg: [[80, 54], [81, 70], [83, 83], [90, 89]] }, marks: '<path d="M71 88V76m-3 3 3-3 3 3"/>' } },
    { id: 'single-leg-balance', name: 'Single leg balance', area: 'ankle', level: 'moderate', equipment: 'none', dose: { sets: 3, hold: 30 }, rest: 20,
      steps: ['Stand near a counter for safety.', 'Lift one foot and balance on the other.', 'Keep your hips level and your gaze steady.'], tip: 'Too easy? Try it with your eyes closed, still near the counter.',
      pose: { torso: [[80, 32], [80, 56]], head: [81, 22], far: { arm: [[79, 34], [68, 42], [56, 46]], leg: [[80, 57], [92, 62], [90, 76]] }, near: { arm: [[81, 34], [92, 42], [104, 46]], leg: [[80, 56], [81, 72], [82, 89], [89, 89]] }, marks: '<path d="M70 92h-6M100 92h6"/>' } },
    { id: 'ankle-alphabet', name: 'Ankle alphabet', area: 'ankle', level: 'easy', equipment: 'chair', dose: { sets: 2, reps: 1 }, rest: 15,
      steps: ['Sit with one leg out straight.', 'Draw the letters A to Z in the air with your big toe.', 'Move from the ankle, not the knee.'], tip: 'Great in the first days after a sprain, little and often.',
      pose: { props: CHAIR, torso: [[68, 38], [66, 62]], head: [70, 28], far: { arm: [[67, 40], [65, 52], [61, 62]], leg: [[66, 63], [82, 63], [83, 88], [90, 88]] }, near: { arm: [[68, 40], [67, 52], [63, 62]], leg: [[66, 62], [84, 64], [104, 70], [110, 65]] }, marks: '<path d="M114 60l4-12 4 12m-6.5-4h5"/>' } },
    { id: 'dead-bug', name: 'Dead bug', area: 'core', level: 'harder', equipment: 'mat', dose: { sets: 3, reps: 8 }, rest: 45,
      steps: ['Lie on your back, arms up, knees bent over hips.', 'Slowly lower one arm and the opposite leg.', 'Return and swap sides, keeping your back still.'], tip: 'Breathe out as you lower; stop if your back lifts off the floor.',
      pose: { props: MAT, torso: [[34, 86], [76, 86]], head: [24, 84], far: { arm: [[34, 86], [24, 80], [12, 76]], leg: [[76, 87], [98, 82], [122, 78]] }, near: { arm: [[36, 85], [38, 70], [40, 56]], leg: [[76, 86], [80, 68], [96, 66]] }, marks: '' } }
  ];
  var PLAN_KEY = 'mend-plan';
  var PLAN_MAX = 12;

  /* ---------- Prices, packages and insurers (prices.html) ---------- */
  var PACKAGES = [
    { id: 'rehab-4', name: 'Rehab block', treatment: 'followup', sessions: 4, price: 340, note: 'Four follow-up sessions with your PT.' },
    { id: 'massage-5', name: 'Massage card', treatment: 'massage', sessions: 5, price: 385, note: 'Five sports massages, shareable within a household.' },
    { id: 'pilates-6', name: 'Pilates course', treatment: 'pilates', sessions: 6, price: 485, note: 'Six one-to-one clinical Pilates sessions.' },
    { id: 'acu-4', name: 'Dry needling course', treatment: 'acupuncture', sessions: 4, price: 270, note: 'Four dry needling sessions, after an evaluation.' }
  ];
  var PACKAGE_MONTHS = 6; // packages are valid for this many months from the first session
  /* All plan names are fictional. status: 'direct' = we bill the plan, 'claim' = you pay and submit a
     claim. auth: needs prior authorization before the first visit. gp: needs a referral from a primary
     care provider first. */
  var INSURERS = {
    solent: { name: 'Cottonwood Mutual PPO', status: 'direct', auth: true, gp: false },
    wealden: { name: 'Meadowlark HMO', status: 'direct', auth: true, gp: true },
    harbourgate: { name: 'Prairie Gate Health PPO', status: 'direct', auth: true, gp: false },
    downland: { name: 'Bluestem Care Indemnity', status: 'claim', auth: false, gp: false },
    northmere: { name: 'Granite Peak Medical POS', status: 'claim', auth: true, gp: true },
    fernhurst: { name: 'Tallgrass Assurance PPO', status: 'direct', auth: true, gp: false },
    tidewell: { name: 'Homestead Health Savings Plan', status: 'claim', auth: false, gp: false },
    brightling: { name: 'Bright Prairie Workplace Health', status: 'claim', auth: false, gp: false }
  };

  /* ======================================================================
     2. Helpers
     ====================================================================== */
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  // Own-key lookups, so URL or stored values like "constructor" never match built-in properties.
  function has(obj, key) { return typeof key === 'string' && Object.prototype.hasOwnProperty.call(obj, key); }
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : (many || one + 's')); }
  function money(n) { return '$' + (n % 1 ? n.toFixed(2) : String(n)); }
  function param(name) { try { return new URLSearchParams(window.location.search).get(name); } catch (e) { return null; } }
  function setParams(values) {
    try {
      var url = new URL(window.location.href);
      Object.keys(values).forEach(function (k) {
        if (values[k]) url.searchParams.set(k, values[k]); else url.searchParams.delete(k);
      });
      window.history.replaceState(null, '', url.pathname + url.search + url.hash);
    } catch (e) { /* file:// in some browsers: the page still works without the URL update */ }
  }

  /* localStorage, or an in-memory stand-in when it's blocked (sandboxed iframes, strict privacy
     settings). The exercise plan then lasts for the page view instead of disappearing. */
  var safeStorage = (function () {
    var local = null;
    try { local = window.localStorage; local.getItem('_'); } catch (e) { local = null; /* blocked */ }
    // A save that fails (storage full) stays in memory, and memory is read first, so the change isn't lost.
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
  function readJSON(key) { try { return JSON.parse(safeStorage.getItem(key)); } catch (e) { return null; } }
  function writeJSON(key, value) { try { safeStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* full or blocked */ } }

  var toastTimer;
  function toast(msg) {
    var t = $('[data-toast]');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('is-visible'); }, 3200);
  }
  // A stable pseudo-random number per string, so demo "taken" slots don't change between renders.
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967295; }

  var ICON = {
    check: '<svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7"/></svg>',
    clock: '<svg class="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>',
    arrow: '<svg class="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    alert: '<svg class="size-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3.5 2.8 19.5h18.4Z"/><path d="M12 9.5v4.5M12 17v.01"/></svg>'
  };

  /* ======================================================================
     3. Dates and times (everything in the clinic's time zone)
     ====================================================================== */
  function toMin(hhmm) { var p = hhmm.split(':'); return Number(p[0]) * 60 + Number(p[1]); }
  function fmtTime(mins) {
    var h = Math.floor(mins / 60), m = mins % 60, ap = h < 12 ? 'am' : 'pm';
    var h12 = h % 12 === 0 ? 12 : h % 12;
    return h12 + (m ? ':' + String(m).padStart(2, '0') : '') + ' ' + ap;
  }
  function fmtRange(r) { return fmtTime(toMin(r[0])) + ' – ' + fmtTime(toMin(r[1])); }
  function partsIn(date, zone) {
    var out = {};
    new Intl.DateTimeFormat('en-US', { timeZone: zone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
      .formatToParts(date).forEach(function (p) { if (p.type !== 'literal') out[p.type] = parseInt(p.value, 10); });
    if (out.hour === 24) out.hour = 0;
    return out;
  }
  function keyOf(y, m, d) { return y + '-' + String(m).padStart(2, '0') + '-' + String(d).padStart(2, '0'); }
  function addDays(key, n) {
    var d = key.split('-').map(Number), x = new Date(Date.UTC(d[0], d[1] - 1, d[2] + n));
    return keyOf(x.getUTCFullYear(), x.getUTCMonth() + 1, x.getUTCDate());
  }
  function weekday(key) { var d = key.split('-').map(Number); return new Date(Date.UTC(d[0], d[1] - 1, d[2])).getUTCDay(); }
  function dateLabel(key, opts) {
    var d = key.split('-').map(Number);
    return new Date(Date.UTC(d[0], d[1] - 1, d[2], 12)).toLocaleDateString('en-US', Object.assign({ timeZone: 'UTC' }, opts));
  }
  /* Preview another moment with ?now=YYYY-MM-DDTHH:MM (clinic time), e.g. ?now=2027-12-24T16:30. */
  var NOW_OVERRIDE = (function () {
    var v = param('now'), m = v && /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(v);
    if (!m || Number(m[2]) < 1 || Number(m[2]) > 12 || Number(m[3]) < 1 || Number(m[3]) > 31 || Number(m[4]) > 23 || Number(m[5]) > 59) return null;
    return { year: Number(m[1]), month: Number(m[2]), dayOfMonth: Number(m[3]), mins: Number(m[4]) * 60 + Number(m[5]) };
  })();
  function clinicNow() {
    var o = NOW_OVERRIDE;
    if (o) { var k = keyOf(o.year, o.month, o.dayOfMonth); return { key: k, year: o.year, month: o.month, day: weekday(k), mins: o.mins }; }
    var p = partsIn(new Date(), CLINIC.timeZone);
    var key = keyOf(p.year, p.month, p.day);
    return { key: key, year: p.year, month: p.month, day: weekday(key), mins: p.hour * 60 + p.minute };
  }
  function relativeDay(key, today) {
    if (key === today) return 'Today';
    if (key === addDays(today, 1)) return 'Tomorrow';
    return dateLabel(key, { weekday: 'short', day: 'numeric', month: 'short' });
  }

  /* ---------- US federal holidays ----------
     Worked out for any year by rule. A holiday on a Saturday is observed on the Friday before and one on a
     Sunday on the Monday after, as federal offices do. Returns { 'YYYY-MM-DD': name }. One-off extra
     closures go in EXTRA_CLOSED. */
  var holidayCache = Object.create(null);
  function bankHolidays(y) {
    if (holidayCache[y]) return holidayCache[y];
    var out = Object.create(null);
    function dayOnOrAfter(key, wd) { while (weekday(key) !== wd) key = addDays(key, 1); return key; }
    function lastMonday(month) { var k = addDays(keyOf(y, month + 1, 1), -1); while (weekday(k) !== 1) k = addDays(k, -1); return k; }
    function fixed(year, month, date, name) {
      var key = keyOf(year, month, date), wd = weekday(key);
      if (wd === 6) out[addDays(key, -1)] = name + ' (observed)';
      else if (wd === 0) out[addDays(key, 1)] = name + ' (observed)';
      else out[key] = name;
    }
    fixed(y, 1, 1, 'New Year’s Day');
    fixed(y + 1, 1, 1, 'New Year’s Day'); // a Saturday New Year's Day is observed on Dec 31 of this year
    out[dayOnOrAfter(keyOf(y, 1, 15), 1)] = 'Martin Luther King Jr. Day';
    out[dayOnOrAfter(keyOf(y, 2, 15), 1)] = 'Presidents’ Day';
    out[lastMonday(5)] = 'Memorial Day';
    fixed(y, 6, 19, 'Juneteenth');
    fixed(y, 7, 4, 'Independence Day');
    out[dayOnOrAfter(keyOf(y, 9, 1), 1)] = 'Labor Day';
    out[dayOnOrAfter(keyOf(y, 10, 8), 1)] = 'Columbus Day';
    fixed(y, 11, 11, 'Veterans Day');
    out[dayOnOrAfter(keyOf(y, 11, 22), 4)] = 'Thanksgiving Day';
    fixed(y, 12, 25, 'Christmas Day');
    holidayCache[y] = out;
    return out;
  }
  // Why the clinic is closed on a date (federal holiday or extra closure), or null.
  function closedReason(key) {
    var hol = bankHolidays(Number(key.slice(0, 4)));
    if (CLOSE_ON_BANK_HOLIDAYS && has(hol, key)) return hol[key];
    for (var j = 0; j < CLOSED_EVERY_YEAR.length; j++) if (CLOSED_EVERY_YEAR[j].md === key.slice(5)) return CLOSED_EVERY_YEAR[j].label;
    for (var i = 0; i < EXTRA_CLOSED.length; i++) if (EXTRA_CLOSED[i].date === key) return EXTRA_CLOSED[i].label;
    return null;
  }
  function hoursOn(key) { return closedReason(key) ? null : HOURS[weekday(key)]; }

  /* ======================================================================
     4. Header, reveal, footer year
     ====================================================================== */
  var header = $('[data-header]');
  if (header) {
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 30); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    var menuBtn = $('[data-menu-button]', header), menu = $('[data-mobile-menu]', header);
    if (menuBtn && menu) {
      var setMenu = function (open, returnFocus) {
        menuBtn.setAttribute('aria-expanded', String(open));
        menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        menu.hidden = !open;
        $('[data-icon-open]', menuBtn).hidden = open;
        $('[data-icon-close]', menuBtn).hidden = !open;
        if (!open && returnFocus) menuBtn.focus();
      };
      menuBtn.addEventListener('click', function () { setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'); });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') setMenu(false, true);
      });
      document.addEventListener('click', function (e) {
        if (menuBtn.getAttribute('aria-expanded') === 'true' && !header.contains(e.target)) setMenu(false);
      });
      $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
      window.matchMedia('(min-width: 1024px)').addEventListener('change', function (e) { if (e.matches) setMenu(false); });
    }
  }

  // Scroll reveal. Revealing an element also reveals everything before it, so fast jumps never leave gaps.
  var reveals = $$('.reveal');
  if (!('IntersectionObserver' in window) || reduceMotion.matches) {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var index = reveals.indexOf(entry.target);
        reveals.slice(0, index + 1).forEach(function (el) { el.classList.add('is-visible'); io.unobserve(el); });
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  }

  $$('[data-year]').forEach(function (el) { el.textContent = String(clinicNow().year); });

  /* ======================================================================
     5. Opening hours: today's row, open-now pill, federal holiday notice
     ====================================================================== */
  function openStatus() {
    var now = clinicNow(), h = hoursOn(now.key);
    if (h && now.mins >= toMin(h[0]) && now.mins < toMin(h[1])) {
      return { open: true, text: 'Open now · until ' + fmtTime(toMin(h[1])) };
    }
    for (var i = 0; i < 14; i++) {
      var key = addDays(now.key, i), hh = hoursOn(key);
      if (!hh || (i === 0 && now.mins >= toMin(hh[0]))) continue;
      var when = i === 0 ? 'today' : i === 1 ? 'tomorrow' : dateLabel(key, { weekday: 'long' });
      return { open: false, text: 'Closed now · opens ' + when + ' at ' + fmtTime(toMin(hh[0])) };
    }
    return { open: false, text: 'Call us for our hours' };
  }
  function renderHours() {
    var now = clinicNow(), s = openStatus();
    $$('[data-hours] [data-day]').forEach(function (row) {
      row.setAttribute('data-today', String(Number(row.getAttribute('data-day')) === now.day && !closedReason(now.key)));
    });
    $$('[data-open-status]').forEach(function (el) {
      el.hidden = false;
      el.setAttribute('data-open', String(s.open));
      $('[data-open-text]', el).textContent = s.text;
    });
    $$('[data-holiday-note]').forEach(function (el) {
      var days = Number(el.getAttribute('data-holiday-note')) || 21;
      for (var i = 0; i < days; i++) {
        var key = addDays(now.key, i), name = closedReason(key);
        if (name && HOURS[weekday(key)]) {
          el.textContent = 'Closed ' + (i === 0 ? 'today' : i === 1 ? 'tomorrow' : dateLabel(key, { weekday: 'long', day: 'numeric', month: 'long' })) + ' for ' + name + '.';
          el.hidden = false;
          return;
        }
      }
      el.textContent = 'Closed on federal holidays.';
      el.hidden = false;
    });
  }
  renderHours();
  setInterval(renderHours, 60000);

  /* ======================================================================
     6. Treatment art (one drawing per treatment; used on several pages)
     ====================================================================== */
  var ART = {
    initial: '<rect x="22" y="14" width="52" height="72" rx="6" fill="#ffffff"/><rect x="36" y="9" width="24" height="10" rx="3" fill="#c0cbea"/><g fill="#f6e46b"><rect x="32" y="27" width="14" height="7" rx="2.5"/><rect x="34" y="38" width="14" height="7" rx="2.5"/><rect x="35" y="49" width="14" height="7" rx="2.5"/><rect x="34" y="60" width="14" height="7" rx="2.5"/><rect x="31" y="71" width="14" height="7" rx="2.5"/></g><path d="M55 31h11M57 42h8M57 53h11M56 64h7M54 75h12"/>',
    followup: '<path d="M40 6v26c0 4-6 6-6 12 0 5 5 8 14 8s14-3 14-8c0-6-6-8-6-12V6" fill="#f1d6c2"/><ellipse cx="62" cy="50" rx="5" ry="7" fill="#e9bfa5"/><path d="M38 90V68c0-4-4-5-4-10h28c0 5-4 6-4 10v22" fill="#f1d6c2"/><path d="M78 34a32 32 0 0 1 2 26" stroke="#b23a2d"/><path d="m74 56 6 5 4-7" stroke="#b23a2d"/><path d="M18 62a32 32 0 0 1-2-26" stroke="#b23a2d"/><path d="m22 40-6-5-4 7" stroke="#b23a2d"/>',
    massage: '<path d="M6 62c12-14 30-18 48-14 14 3 22 6 34 6v16c-14 0-26-2-38 0-16 3-30 6-44 6Z" fill="#dfe5f5"/><path d="M30 50c-3-10-1-22 5-26 3-2 6 0 6 3v16M41 26c0-5 7-5 7 0v18M48 27c0-5 7-5 7 0v17M55 31c0-4 7-4 7 0v15" fill="#f1d6c2"/><path d="M30 50c4 3 22 4 32-4" /><path d="M70 30l6-6M74 38l8-3M66 22l2-8" stroke="#b23a2d"/>',
    acupuncture: '<circle cx="48" cy="22" r="12" fill="#f1d6c2"/><path d="M42 34v8c-12 2-26 8-30 22v24h72V64c-4-14-18-20-30-22v-8" fill="#dfe5f5"/><g stroke="#b23a2d"><path d="M64 52 72 32M72 60l14-12M28 54l-6-20M34 70l-4-14"/></g><g fill="#dc6f62" stroke="#b23a2d"><circle cx="72" cy="31" r="2.6"/><circle cx="87" cy="47" r="2.6"/><circle cx="22" cy="33" r="2.6"/><circle cx="30" cy="55" r="2.6"/></g>',
    postop: '<path d="M30 6c2 20 6 32 4 44-2 12-6 22-4 38h22c-2-16 0-26 2-38 2-12-2-24-4-44" fill="#f1d6c2"/><path d="M42 36v20" stroke="#b23a2d"/><path d="M38 39h8M38 44h8M38 49h8M38 54h8" stroke="#b23a2d"/><path d="M70 10h14M77 10v76M70 46h14M72 88h10"/><rect x="72" y="20" width="10" height="4" rx="2" fill="#c0cbea"/>',
    pelvic: '<path d="M48 32c-8-10-22-14-32-8-6 4-4 16 2 24 6 8 12 12 18 24h24c6-12 12-16 18-24 6-8 8-20 2-24-10-6-24-2-32 8Z" fill="#f1d6c2"/><path d="M41 30h14l-3 24h-8Z" fill="#f6e46b"/><ellipse cx="34" cy="64" rx="5" ry="6" fill="#ffffff"/><ellipse cx="62" cy="64" rx="5" ry="6" fill="#ffffff"/><rect x="42" y="12" width="12" height="7" rx="2.5" fill="#c0cbea"/><rect x="42" y="21" width="12" height="7" rx="2.5" fill="#c0cbea"/>',
    running: '<path d="M16 62c4-10 8-22 12-28h14c2 6 8 10 16 12 10 2 22 6 26 14v6H16Z" fill="#dfe5f5"/><path d="M14 68h74c0 6-4 8-10 8H22c-6 0-8-4-8-8Z" fill="#f6e46b"/><path d="M40 40l8 4M38 47l9 4M52 46l6 6"/><path d="M4 42h8M2 52h10M6 32h6" stroke="#b23a2d"/>',
    pilates: '<path d="M6 88h84" stroke="#97a7d8"/><circle cx="48" cy="68" r="18" fill="#dfe5f5"/><path d="M48 50V26" stroke-width="6" stroke="#34489a"/><circle cx="48" cy="14" r="7" fill="#34489a" stroke="none"/><path d="M30 30h36" stroke-width="4" stroke="#34489a"/><path d="M48 50 30 62l-4 24M48 50l18 12 4 24" stroke-width="4.5" stroke="#34489a"/><circle cx="30" cy="62" r="2" fill="#dc6f62" stroke="none"/><circle cx="66" cy="62" r="2" fill="#dc6f62" stroke="none"/>',
    shockwave: '<path d="M14 36v34c0 8 6 12 14 12h52c8 0 10-6 6-10-6-6-20-8-34-12-10-3-14-12-14-24Z" fill="#f1d6c2"/><path d="M6 94 18 82" stroke-width="7" stroke="#212f66"/><g stroke="#b23a2d"><path d="M26 74a8 8 0 0 1 6 8M22 66a16 16 0 0 1 16 16M18 58a24 24 0 0 1 26 24"/></g>',
    video: '<rect x="16" y="20" width="64" height="44" rx="4" fill="#ffffff"/><path d="M8 72h80l-6 8H14Z" fill="#c0cbea"/><circle cx="48" cy="36" r="7" fill="#dfe5f5"/><path d="M34 60c0-8 6-12 14-12s14 4 14 12" fill="#dfe5f5"/><g stroke="#b23a2d"><path d="M76 10a12 12 0 0 1 10 10M76 4a18 18 0 0 1 16 16"/></g>'
  };
  function artSVG(id, cls) {
    return '<svg class="' + cls + '" viewBox="0 0 96 96" fill="none" stroke="#18224a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (has(ART, id) ? ART[id] : '') + '</svg>';
  }

  /* ======================================================================
     7. Online diary: slots from clinician shifts, opening hours and appointment length
     ====================================================================== */
  function cliniciansFor(tid) {
    return Object.keys(CLINICIANS).filter(function (id) { return CLINICIANS[id].treatments.indexOf(tid) !== -1; });
  }
  function shiftOn(cid, key) {
    var hours = hoursOn(key), sh = CLINICIANS[cid].shifts[weekday(key)];
    if (!hours || !sh) return null;
    var from = Math.max(toMin(sh[0]), toMin(hours[0])), to = Math.min(toMin(sh[1]), toMin(hours[1]));
    return to > from ? [from, to] : null;
  }
  // All open start times for one treatment on one date. pref: a clinician id or 'any'.
  function slotsFor(tid, pref, key, now) {
    if (!has(TREATMENTS, tid)) return [];
    now = now || clinicNow();
    if (key < now.key) return [];
    var t = TREATMENTS[tid], out = {};
    var people = cliniciansFor(tid);
    if (pref && pref !== 'any') people = people.filter(function (c) { return c === pref; });
    people.forEach(function (c) {
      var sh = shiftOn(c, key);
      if (!sh) return;
      for (var m = sh[0]; m + t.minutes <= sh[1]; m += BOOKING.slotStep) {
        if (key === now.key && m - now.mins < BOOKING.noticeMinutes) continue;
        if (hash(c + key + m) < BOOKING.demoBusyShare) continue;
        if (!out[m]) out[m] = { key: key, mins: m, who: c };
      }
    });
    return Object.keys(out).map(Number).sort(function (a, b) { return a - b; }).map(function (m) { return out[m]; });
  }
  function horizonDays() { return BOOKING.daysPerPage * BOOKING.pages; }
  function firstAvailable(tid, pref) {
    var now = clinicNow();
    for (var i = 0; i < horizonDays(); i++) {
      var s = slotsFor(tid, pref, addDays(now.key, i), now);
      if (s.length) return s[0];
    }
    return null;
  }
  function slotText(s, withWho) {
    return relativeDay(s.key, clinicNow().key) + ' · ' + fmtTime(s.mins) + (withWho ? ' with ' + CLINICIANS[s.who].first : '');
  }

  // Home and anywhere else: next available appointment for a treatment.
  function renderNextSlots() {
    $$('[data-next-slot]').forEach(function (box) {
      var tid = box.getAttribute('data-next-slot') || 'initial';
      var s = firstAvailable(tid, 'any');
      var text = $('[data-next-slot-text]', box), who = $('[data-next-slot-who]', box);
      if (!s) { box.hidden = true; return; }
      text.textContent = relativeDay(s.key, clinicNow().key) + ' · ' + fmtTime(s.mins);
      if (who) who.textContent = 'with ' + CLINICIANS[s.who].name;
      var link = $('a', box);
      if (link) link.href = 'book.html?treatment=' + tid + '&clinician=' + s.who;
      box.hidden = false;
    });
  }
  renderNextSlots();
  setInterval(renderNextSlots, 60000);

  /* Diary strips (home and book.html): the next seven days as columns. data-diary-strip="<treatment id>"
     lists free times for that treatment, linking to book.html?treatment=…&day=…; "hours" lists opening hours. */
  function closedLabel(key) {
    var reason = closedReason(key);
    if (reason) return reason.charAt(0).toUpperCase() + reason.slice(1);
    return 'Closed on ' + dateLabel(key, { weekday: 'long' }) + 's';
  }
  function renderDiaryStrips() {
    $$('[data-diary-strip]').forEach(function (list) {
      var mode = list.getAttribute('data-diary-strip'), now = clinicNow(), html = '';
      for (var i = 0; i < 7; i++) {
        var key = addDays(now.key, i), h = hoursOn(key), today = i === 0;
        var date = '<span class="flex items-baseline gap-1.5"><span class="font-mono text-[.75rem] tracking-[.06em] uppercase ' + (today ? 'font-semibold text-ink' : 'text-muted') + '">' + (today ? 'Today' : dateLabel(key, { weekday: 'short' })) + '</span>' +
          '<span class="font-mono text-[.75rem] text-muted">' + dateLabel(key, { month: 'short' }) + '</span><span class="font-display text-[1.6rem] leading-tight text-ink">' + dateLabel(key, { day: 'numeric' }) + '</span></span>';
        var base = 'flex h-full flex-col items-start gap-1 rounded-sm border px-3 py-2.5 lg:py-3 ';
        if (!h) {
          html += '<li><div class="' + base + 'border-rule-strong bg-[repeating-linear-gradient(135deg,var(--color-paper-dark)_0_6px,var(--color-paper)_6px_12px)]">' + date +
            '<span><span class="block font-semibold text-muted">Closed</span><span class="block text-sm text-muted">' + esc(closedLabel(key)) + '</span></span></div></li>';
          continue;
        }
        var cls = base + (today ? 'border-ink bg-hi-soft' : 'border-rule-strong bg-sheet');
        if (mode === 'hours' || !has(TREATMENTS, mode)) {
          html += '<li><div class="' + cls + '">' + date + '<span><span class="block font-semibold text-ink">Open</span><span class="block text-sm">' + fmtRange(h) + '</span></span></div></li>';
          continue;
        }
        var slots = slotsFor(mode, 'any', key, now);
        if (!slots.length) {
          html += '<li><div class="' + cls + '">' + date + '<span><span class="block font-semibold text-muted">' + (today ? 'No times left' : 'Fully booked') + '</span><span class="block text-sm text-muted">Open ' + fmtRange(h) + '</span></span></div></li>';
          continue;
        }
        html += '<li><a href="book.html?treatment=' + mode + '&amp;day=' + key + '" class="group ' + cls + ' hover:border-biro-600 hover:shadow-[3px_3px_0_var(--color-biro-200)]">' + date +
          '<span><span class="block font-semibold text-biro-700 group-hover:underline">' + plural(slots.length, 'time') + ' free</span><span class="block text-sm">from ' + fmtTime(slots[0].mins) + '</span></span></a></li>';
      }
      list.innerHTML = html;
    });
  }
  renderDiaryStrips();
  setInterval(renderDiaryStrips, 60000);

  /* ======================================================================
     8. Treatment lists (home index, treatments.html)
     ====================================================================== */
  function treatmentNo(id) { return String(Object.keys(TREATMENTS).indexOf(id) + 1).padStart(2, '0'); }
  function treatmentCard(id, compact) {
    var t = TREATMENTS[id], next = firstAvailable(id, 'any');
    if (compact) {
      return '<li class="row"><a href="treatments.html#' + id + '" class="group grid grid-cols-[3.5rem_minmax(0,1fr)_auto] items-start gap-4 py-4">' +
        '<span class="grid size-14 place-items-center rounded-sm bg-biro-50">' + artSVG(id, 'size-11') + '</span>' +
        '<span class="min-w-0"><span class="block font-display text-xl font-medium text-ink group-hover:underline">' + esc(t.name) + '</span>' +
        '<span class="mt-0.5 block text-[.95rem] leading-snug">' + esc(t.blurb) + '</span></span>' +
        '<span class="pt-1 text-right font-mono text-[.85rem] whitespace-nowrap text-ink">' + money(t.price) + '<span class="block text-muted">' + t.minutes + ' min</span></span></a></li>';
    }
    var who = cliniciansFor(id).map(function (c) { return CLINICIANS[c].first; });
    return '<article id="' + id + '" class="row grid scroll-mt-28 gap-5 py-9 md:grid-cols-[7rem_minmax(0,1fr)] md:gap-8" data-treatment-card="' + id + '" aria-labelledby="t-' + id + '">' +
      '<div class="flex items-start gap-4 md:block"><p class="idx">T-' + treatmentNo(id) + '</p><span class="mt-2 grid size-20 place-items-center rounded-sm border border-rule-strong bg-sheet md:size-28">' + artSVG(id, 'size-16 md:size-24') + '</span></div>' +
      '<div class="min-w-0"><div class="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1"><h3 id="t-' + id + '" class="font-display text-[1.8rem] font-medium">' + esc(t.name) + '</h3>' +
      '<p class="font-mono text-ink"><span class="text-[1.4rem] font-semibold">' + money(t.price) + '</span> <span class="text-muted">· ' + t.minutes + ' min</span></p></div>' +
      '<p class="lead mt-2 max-w-3xl">' + esc(t.blurb) + '</p>' +
      '<div class="mt-5 grid gap-6 lg:grid-cols-[1.25fr_1fr]"><div><p class="kicker">What’s included</p><ul class="dash-list mt-2 grid gap-1">' + t.includes.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>' +
      '<dl class="grid content-start gap-3 text-[.97rem]"><div><dt class="kicker">Good for</dt><dd class="mt-0.5">' + esc(t.who) + '</dd></div><div><dt class="kicker">With</dt><dd class="mt-0.5">' + esc(who.join(', ')) + '</dd></div></dl></div>' +
      '<div class="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3"><a class="btn btn-ink btn-sm" href="book.html?treatment=' + id + '">Book<span class="sr-only"> ' + esc(t.name) + '</span></a>' +
      '<p class="note flex items-center gap-1.5">' + ICON.clock + '<span>' + (next ? 'Next free: ' + esc(slotText(next, false)) : 'Call us for the next opening') + '</span></p></div></div></article>';
  }
  $$('[data-treatment-list]').forEach(function (list) {
    var ids = (list.getAttribute('data-treatment-list') || '').split(/\s+/).filter(function (id) { return has(TREATMENTS, id); });
    list.innerHTML = ids.map(function (id) { return treatmentCard(id, true); }).join('');
  });

  var treatmentGrid = $('[data-treatment-grid]');
  if (treatmentGrid) (function () {
    var chips = $('[data-treatment-filters]'), count = $('[data-treatment-count]');
    var current = has(TREATMENT_TAGS, param('for')) ? param('for') : 'all';
    chips.innerHTML = Object.keys(TREATMENT_TAGS).map(function (k) {
      return '<button type="button" class="chip justify-start" data-tag="' + k + '" aria-pressed="false">' + esc(TREATMENT_TAGS[k]) + '</button>';
    }).join('');
    function render() {
      var ids = Object.keys(TREATMENTS).filter(function (id) { return current === 'all' || TREATMENTS[id].tags.indexOf(current) !== -1; });
      treatmentGrid.innerHTML = ids.map(function (id) { return treatmentCard(id, false); }).join('');
      $$('[data-tag]', chips).forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-tag') === current)); });
      count.textContent = 'Showing ' + plural(ids.length, 'treatment') + (current === 'all' ? '' : ' for ' + TREATMENT_TAGS[current].toLowerCase());
    }
    chips.addEventListener('click', function (e) {
      var b = e.target.closest('[data-tag]');
      if (!b) return;
      current = b.getAttribute('data-tag');
      setParams({ for: current === 'all' ? '' : current });
      render();
    });
    render();
    if (window.location.hash) {
      var target = document.getElementById(window.location.hash.slice(1));
      if (target && target.hasAttribute('data-treatment-card')) target.scrollIntoView();
    }
  })();

  /* ======================================================================
     9. Body map (home) and the conditions pages (conditions.html)
     The body map is a radio group: each drawn region is one radio, arrow keys move between them.
     ====================================================================== */
  var AREA_ORDER = Object.keys(BODY_AREAS);
  function areaPhrase(id) { return 'the ' + BODY_AREAS[id].label.toLowerCase(); }
  var bodyMap = $('[data-body-map]');
  if (bodyMap) (function () {
    var spots = $$('[data-area]', bodyMap);
    var buttons = $$('[data-area-btn]');
    var panel = $('[data-area-panel]');
    var current = has(BODY_AREAS, param('area')) ? param('area') : 'lower-back';
    function select(id, focus, fromUser) {
      if (!has(BODY_AREAS, id)) return;
      current = id;
      spots.forEach(function (s) {
        var on = s.getAttribute('data-area') === id;
        s.setAttribute('aria-checked', String(on));
        s.setAttribute('tabindex', on ? '0' : '-1');
        if (on && focus) s.focus();
      });
      buttons.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-area-btn') === id)); });
      render();
      if (fromUser) setParams({ area: id });
    }
    function render() {
      var a = BODY_AREAS[current];
      $('[data-area-title]', panel).textContent = a.label;
      $('[data-area-intro]', panel).textContent = a.intro;
      $('[data-area-conditions]', panel).innerHTML = a.conditions.map(function (c) {
        return '<li class="py-2.5"><span class="block font-semibold text-ink">' + esc(c.name) + '</span><span class="block text-[.95rem]">' + esc(c.feel) + '</span></li>';
      }).join('');
      $('[data-area-book]', panel).href = 'book.html?treatment=initial&area=' + current;
      var more = $('[data-area-more]', panel);
      more.href = 'conditions.html?area=' + current;
      more.innerHTML = 'Read about ' + esc(areaPhrase(current)) + ICON.arrow;
      $$('[data-area-name]', panel).forEach(function (el) { el.textContent = a.label.toLowerCase(); });
    }
    function reveal() {
      if (window.matchMedia('(max-width: 1279px)').matches) panel.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });
    }
    spots.forEach(function (s, i) {
      s.addEventListener('click', function () { select(s.getAttribute('data-area'), false, true); });
      s.addEventListener('keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = spots[(i + 1) % spots.length];
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = spots[(i - 1 + spots.length) % spots.length];
        else if (e.key === 'Home') next = spots[0];
        else if (e.key === 'End') next = spots[spots.length - 1];
        else if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); select(s.getAttribute('data-area'), false, true); return; }
        if (next) { e.preventDefault(); select(next.getAttribute('data-area'), true, true); }
      });
    });
    buttons.forEach(function (b) {
      b.addEventListener('click', function () { select(b.getAttribute('data-area-btn'), false, true); reveal(); });
    });
    select(current, false, false);
  })();

  /* A small pictogram with the area marked, used beside each area on conditions.html. */
  var LOCATOR = {
    neck: '<ellipse cx="30" cy="25" rx="6" ry="5"/>', shoulder: '<circle cx="17" cy="33" r="6"/><circle cx="43" cy="33" r="6"/>',
    'elbow-wrist': '<ellipse cx="11" cy="58" rx="5" ry="11"/><ellipse cx="49" cy="58" rx="5" ry="11"/>', 'upper-back': '<rect x="20" y="31" width="20" height="17" rx="4"/>',
    'lower-back': '<rect x="21" y="49" width="18" height="13" rx="4"/>', hip: '<ellipse cx="30" cy="66" rx="12" ry="7"/>',
    knee: '<circle cx="24" cy="90" r="5.5"/><circle cx="36" cy="90" r="5.5"/>', 'ankle-foot': '<circle cx="23" cy="112" r="5.5"/><circle cx="37" cy="112" r="5.5"/>'
  };
  function locatorSVG(id) {
    return '<svg class="h-auto w-16 shrink-0 sm:w-20" viewBox="0 0 60 122" aria-hidden="true"><g fill="#ffffff" stroke="#34489a" stroke-width="1.6" stroke-linejoin="round">' +
      '<circle cx="30" cy="11" r="8"/><path d="M22 23h16l7 6 6 40-5 1-6-33-1 25 2 46h-8l-3-38-3 38h-8l2-46-1-25-6 33-5-1 6-40Z"/></g>' +
      '<g fill="#f6e46b" stroke="#18224a" stroke-width="1.2" style="mix-blend-mode:multiply">' + (has(LOCATOR, id) ? LOCATOR[id] : '') + '</g>' +
      '<text x="30" y="121" text-anchor="middle" class="fill-muted font-mono text-[7px] uppercase">' + BODY_AREAS[id].view + '</text></svg>';
  }
  var areaSections = $('[data-area-sections]');
  if (areaSections) (function () {
    areaSections.innerHTML = AREA_ORDER.map(function (id, i) {
      var a = BODY_AREAS[id], n = EXERCISES.filter(function (e) { return e.area === a.exercises; }).length;
      return '<article id="' + id + '" class="row scroll-mt-28 py-10 first:border-t-0 first:pt-2" data-area-section="' + id + '" aria-labelledby="h-' + id + '">' +
        '<div class="flex items-start justify-between gap-6"><div class="min-w-0"><p class="idx">' + String(i + 1).padStart(2, '0') + ' / ' + String(AREA_ORDER.length).padStart(2, '0') + '</p>' +
        '<h2 id="h-' + id + '" class="section-title mt-1">' + esc(a.label) + '</h2><p class="lead mt-3 max-w-3xl">' + esc(a.intro) + '</p></div>' + locatorSVG(id) + '</div>' +
        '<h3 class="kicker mt-7">Common problems</h3><div class="mt-2 border-b border-rule">' + a.conditions.map(function (c) {
          return '<div class="grid gap-3 border-t border-rule py-4 md:grid-cols-[1fr_1.25fr_1.25fr] md:gap-6"><h4 class="font-display text-[1.2rem] font-medium">' + esc(c.name) + '</h4>' +
            '<p><span class="block font-mono text-[.75rem] tracking-[.06em] text-muted uppercase">Often feels like</span>' + esc(c.feel) + '</p>' +
            '<p><span class="block font-mono text-[.75rem] tracking-[.06em] text-muted uppercase">What usually helps</span>' + esc(c.help) + '</p></div>';
        }).join('') + '</div>' +
        '<div class="mt-7 grid gap-8 lg:grid-cols-[1.2fr_1fr]"><div><h3 class="kicker">Suggested appointments</h3><ul class="mt-3 grid gap-2">' + a.treatments.map(function (tid) {
          var t = TREATMENTS[tid];
          return '<li><a class="group flex items-center gap-3 rounded-sm border border-rule-strong bg-sheet p-2.5 pr-4 hover:border-biro-500" href="book.html?treatment=' + tid + '&amp;area=' + id + '">' +
            '<span class="grid size-12 shrink-0 place-items-center rounded-sm bg-biro-50">' + artSVG(tid, 'size-9') + '</span><span class="min-w-0 flex-1"><span class="block font-semibold text-ink group-hover:underline">' + esc(t.name) + '</span>' +
            '<span class="font-mono text-[.8rem] text-muted">' + t.minutes + ' min · ' + money(t.price) + '</span></span><span class="text-biro-600">' + ICON.arrow + '</span></a></li>';
        }).join('') + '</ul><p class="mt-3"><a class="arrow-link" href="exercises.html?area=' + a.exercises + '">See ' + esc(plural(n, EXERCISE_AREAS[a.exercises].toLowerCase() + ' exercise')) + ICON.arrow + '</a></p></div>' +
        '<div class="self-start border-l-[3px] border-margin-500 bg-margin-50 p-5"><h3 class="flex items-center gap-2 font-display text-xl font-medium text-margin-700">' + ICON.alert + 'Don’t wait for PT if…</h3>' +
        '<ul class="dash-list mt-3 grid gap-2.5 text-ink">' + a.redFlags.map(function (f) { return '<li>' + esc(f) + '</li>'; }).join('') + '</ul></div></div></article>';
    }).join('');
    // Side index: mark the area in view.
    var links = $$('[data-area-link]');
    function mark(id) { links.forEach(function (l) { if (l.getAttribute('data-area-link') === id) l.setAttribute('aria-current', 'true'); else l.removeAttribute('aria-current'); }); }
    if ('IntersectionObserver' in window) {
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) mark(en.target.getAttribute('data-area-section')); });
      }, { rootMargin: '-30% 0px -60% 0px' });
      $$('[data-area-section]', areaSections).forEach(function (s) { spy.observe(s); });
    }
    var start = param('area');
    if (has(BODY_AREAS, start)) {
      mark(start);
      var el = document.getElementById(start);
      if (el) window.requestAnimationFrame(function () { el.scrollIntoView(); });
    }
  })();

  /* ======================================================================
     10. Team (team.html): workdays, "in clinic today" and next session
     ====================================================================== */
  var DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  function nextInClinic(cid) {
    var now = clinicNow();
    for (var i = 0; i < 14; i++) {
      var key = addDays(now.key, i), sh = shiftOn(cid, key);
      if (!sh || (i === 0 && now.mins >= sh[1])) continue;
      return { key: key, shift: sh, today: i === 0 };
    }
    return null;
  }
  $$('[data-clinician]').forEach(function (card) {
    var id = card.getAttribute('data-clinician');
    if (!has(CLINICIANS, id)) return;
    var c = CLINICIANS[id];
    var days = $('[data-days]', card);
    if (days) {
      days.innerHTML = [1, 2, 3, 4, 5, 6].map(function (d) {
        var sh = c.shifts[d];
        return '<li class="rounded-sm border px-1 py-1.5 text-center ' + (sh ? 'border-biro-300 bg-sheet text-ink' : 'border-rule bg-paper-dark text-muted') + '">' +
          '<span class="block font-mono text-xs font-medium tracking-[.06em] uppercase">' + DAY_SHORT[d] + '</span>' +
          '<span class="block text-[.8rem] leading-tight">' + (sh ? fmtTime(toMin(sh[0])).replace(' ', '') + '<span class="sr-only"> to </span><span aria-hidden="true">–</span>' + fmtTime(toMin(sh[1])).replace(' ', '') : 'Off') + '</span></li>';
      }).join('');
    }
    var badge = $('[data-in-clinic]', card);
    if (badge) {
      var n = nextInClinic(id);
      badge.textContent = !n ? 'Away for the next two weeks' : n.today ? 'In clinic today, until ' + fmtTime(n.shift[1]) : 'Next in clinic ' + relativeDay(n.key, clinicNow().key).replace('Tomorrow', 'tomorrow') + ', from ' + fmtTime(n.shift[0]);
      badge.className = 'tag ' + (n && n.today ? 'tag-hi' : 'tag-mute');
    }
    var offers = $('[data-offers]', card);
    if (offers) offers.innerHTML = c.treatments.map(function (t) { return '<li class="tag tag-ink">' + esc(TREATMENTS[t].name) + '</li>'; }).join('');
    var next = $('[data-clinician-next]', card);
    if (next) {
      var s = null;
      c.treatments.forEach(function (t) { var x = firstAvailable(t, id); if (x && (!s || x.key + x.mins / 10000 < s.key + s.mins / 10000)) s = x; });
      next.textContent = s ? 'First free slot: ' + relativeDay(s.key, clinicNow().key) + ', ' + fmtTime(s.mins) : 'Call us for availability';
    }
  });
  var teamFilters = $('[data-team-filters]');
  if (teamFilters) (function () {
    var cards = $$('[data-clinician]');
    var current = has(TREATMENTS, param('treatment')) ? param('treatment') : 'all';
    var opts = ['all'].concat(Object.keys(TREATMENTS));
    teamFilters.innerHTML = opts.map(function (k) {
      return '<button type="button" class="chip justify-start" data-team-tag="' + k + '" aria-pressed="false">' + esc(k === 'all' ? 'Everyone' : TREATMENTS[k].name) + '</button>';
    }).join('');
    function render() {
      var shown = 0;
      cards.forEach(function (card) {
        var id = card.getAttribute('data-clinician');
        var on = current === 'all' || (has(CLINICIANS, id) && CLINICIANS[id].treatments.indexOf(current) !== -1);
        card.hidden = !on;
        if (on) shown++;
      });
      $$('[data-team-tag]', teamFilters).forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-team-tag') === current)); });
      $('[data-team-count]').textContent = current === 'all' ? 'Showing all ' + plural(shown, 'clinician') : plural(shown, 'clinician') + ' offer' + (shown === 1 ? 's ' : ' ') + TREATMENTS[current].name.toLowerCase();
    }
    teamFilters.addEventListener('click', function (e) {
      var b = e.target.closest('[data-team-tag]');
      if (!b) return;
      current = b.getAttribute('data-team-tag');
      setParams({ treatment: current === 'all' ? '' : current });
      render();
    });
    render();
  })();

  /* ======================================================================
     11. Booking (book.html): treatment → clinician → time → details and health screening
     ====================================================================== */
  var bookingForm = $('[data-booking]');
  if (bookingForm) (function () {
    var state = { step: 1, treatment: null, clinician: 'any', slot: null, page: 0, day: null };
    var steps = $$('[data-step]', bookingForm);
    var stepsNav = $$('[data-steps-nav] li');
    var prevBtn = $('[data-prev]', bookingForm), nextBtn = $('[data-next]', bookingForm), submitBtn = $('[data-submit]', bookingForm);
    var summary = $('[data-summary]');
    var stepError = $('[data-step-error]', bookingForm);

    // Step 1: treatments
    $('[data-treatment-options]').innerHTML = Object.keys(TREATMENTS).map(function (id) {
      var t = TREATMENTS[id];
      return '<label class="choice"><input type="radio" name="treatment" value="' + id + '"><span class="choice-box flex items-center gap-4">' +
        '<span class="grid size-14 shrink-0 place-items-center rounded-sm bg-biro-50">' + artSVG(id, 'size-11') + '</span><span class="min-w-0 flex-1"><span class="block font-semibold text-ink">' + esc(t.name) + '</span>' +
        '<span class="block font-mono text-[.8rem] text-muted">' + t.minutes + ' min · ' + money(t.price) + '</span><span class="mt-1 hidden" data-suggest="' + id + '"><span class="suggest">Suggested for <span data-suggest-area></span></span></span></span><span class="choice-tick">' + ICON.check + '</span></span></label>';
    }).join('');

    function renderClinicians() {
      var box = $('[data-clinician-options]'), ids = cliniciansFor(state.treatment);
      if (state.clinician !== 'any' && ids.indexOf(state.clinician) === -1) state.clinician = 'any';
      var first = firstAvailable(state.treatment, 'any');
      var html = '<label class="choice"><input type="radio" name="clinician" value="any"' + (state.clinician === 'any' ? ' checked' : '') + '><span class="choice-box flex items-center gap-4">' +
        '<span class="grid size-14 shrink-0 place-items-center rounded-sm bg-hi-soft text-ink"><svg class="size-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg></span>' +
        '<span class="min-w-0 flex-1"><span class="block font-semibold text-ink">First available</span><span class="block text-sm text-muted">' + (first ? 'Earliest: ' + esc(slotText(first, true)) : 'Any clinician') + '</span></span><span class="choice-tick">' + ICON.check + '</span></span></label>';
      html += ids.map(function (id) {
        var c = CLINICIANS[id], s = firstAvailable(state.treatment, id);
        var days = Object.keys(c.shifts).map(function (d) { return DAY_SHORT[d]; }).join(', ');
        return '<label class="choice"><input type="radio" name="clinician" value="' + id + '"' + (state.clinician === id ? ' checked' : '') + '><span class="choice-box flex items-center gap-4">' +
          '<img src="assets/img/team-' + id + '.svg" alt="" width="56" height="56" class="size-14 shrink-0 rounded-sm border border-rule-strong">' +
          '<span class="min-w-0 flex-1"><span class="block font-semibold text-ink">' + esc(c.name) + '</span><span class="block text-sm">' + esc(c.role) + '</span>' +
          '<span class="block font-mono text-[.8rem] text-muted">' + esc(days) + (s ? ' · next ' + esc(slotText(s, false)) : '') + '</span></span><span class="choice-tick">' + ICON.check + '</span></span></label>';
      }).join('');
      box.innerHTML = html;
    }

    // Step 3: days and times
    function dayKeys() {
      var now = clinicNow(), out = [];
      for (var i = 0; i < BOOKING.daysPerPage; i++) out.push(addDays(now.key, state.page * BOOKING.daysPerPage + i));
      return out;
    }
    function renderDays() {
      var now = clinicNow(), keys = dayKeys(), box = $('[data-days]', bookingForm);
      if (!state.day || keys.indexOf(state.day) === -1 || !slotsFor(state.treatment, state.clinician, state.day, now).length) {
        state.day = null;
        for (var i = 0; i < keys.length; i++) if (slotsFor(state.treatment, state.clinician, keys[i], now).length) { state.day = keys[i]; break; }
      }
      box.innerHTML = keys.map(function (k) {
        var n = slotsFor(state.treatment, state.clinician, k, now).length, reason = closedReason(k), closed = reason ? 'closed for ' + reason : HOURS[weekday(k)] ? null : 'closed on ' + dateLabel(k, { weekday: 'long' }) + 's';
        var working = cliniciansFor(state.treatment).some(function (c) { return (state.clinician === 'any' || c === state.clinician) && shiftOn(c, k); });
        var note = closed ? 'Closed' : !working ? 'Off' : k === now.key ? 'None' : 'Full';
        var label = dateLabel(k, { weekday: 'long', day: 'numeric', month: 'long' }) + (n ? ', ' + plural(n, 'time') + ' free' : closed ? ', ' + closed : !working ? ', not in clinic' : k === now.key ? ', no times left today' : ', fully booked');
        return '<button type="button" class="day" data-day-key="' + k + '" aria-pressed="' + (k === state.day) + '"' + (n ? '' : ' disabled') + ' aria-label="' + esc(label) + '">' +
          '<small>' + (k === now.key ? 'Today' : dateLabel(k, { weekday: 'short' })) + '</small><span class="day-num">' + dateLabel(k, { day: 'numeric' }) + '</span><small>' + (n ? dateLabel(k, { month: 'short' }) : note) + '</small></button>';
      }).join('');
      var first = keys[0], last = keys[keys.length - 1];
      $('[data-day-range]', bookingForm).textContent = dateLabel(first, { day: 'numeric', month: 'short' }) + ' – ' + dateLabel(last, { day: 'numeric', month: 'short' });
      $('[data-day-prev]', bookingForm).disabled = state.page === 0;
      $('[data-day-next]', bookingForm).disabled = state.page >= BOOKING.pages - 1;
      renderSlots();
    }
    function renderSlots() {
      var box = $('[data-slots]', bookingForm), title = $('[data-slots-title]', bookingForm);
      if (!state.day) {
        title.textContent = 'No times free this week';
        box.innerHTML = '<p class="col-span-full rounded-sm border-l-[3px] border-biro-400 bg-biro-50 p-4">Try the next week' + (state.clinician !== 'any' ? ', or choose “First available”' : '') + '. You can also call us at ' + esc(CLINIC.phone) + '.</p>';
        return;
      }
      var slots = slotsFor(state.treatment, state.clinician, state.day);
      title.textContent = dateLabel(state.day, { weekday: 'long', day: 'numeric', month: 'long' });
      var groups = [['Morning', 0, 720], ['Afternoon', 720, 1020], ['Evening', 1020, 1440]];
      box.innerHTML = groups.map(function (g) {
        var list = slots.filter(function (s) { return s.mins >= g[1] && s.mins < g[2]; });
        if (!list.length) return '';
        return '<div class="col-span-full"><p class="kicker mb-2">' + g[0] + '</p><div class="grid grid-cols-3 gap-2 sm:grid-cols-4">' +
          list.map(function (s) {
            var on = state.slot && state.slot.key === s.key && state.slot.mins === s.mins;
            return '<button type="button" class="slot" data-slot="' + s.mins + '" data-who="' + s.who + '" aria-pressed="' + !!on + '">' + fmtTime(s.mins) +
              (state.clinician === 'any' ? '<span class="block text-xs font-medium opacity-80">' + esc(CLINICIANS[s.who].first) + '</span>' : '') + '</button>';
          }).join('') + '</div></div>';
      }).join('');
    }
    bookingForm.addEventListener('click', function (e) {
      var d = e.target.closest('[data-day-key]');
      if (d && !d.disabled) { state.day = d.getAttribute('data-day-key'); renderDays(); return; }
      var s = e.target.closest('[data-slot]');
      if (s) {
        var who = s.getAttribute('data-who');
        state.slot = { key: state.day, mins: Number(s.getAttribute('data-slot')), who: has(CLINICIANS, who) ? who : null };
        renderSlots();
        updateSummary();
        hideError();
        return;
      }
      if (e.target.closest('[data-day-prev]')) { state.page = Math.max(0, state.page - 1); state.day = null; renderDays(); return; }
      if (e.target.closest('[data-day-next]')) { state.page = Math.min(BOOKING.pages - 1, state.page + 1); state.day = null; renderDays(); }
    });
    bookingForm.addEventListener('change', function (e) {
      if (e.target.name === 'treatment' && has(TREATMENTS, e.target.value)) {
        state.treatment = e.target.value; state.slot = null; hideError(); updateSummary(); updateScreening();
      }
      if (e.target.name === 'clinician') {
        state.clinician = e.target.value === 'any' || has(CLINICIANS, e.target.value) ? e.target.value : 'any';
        state.slot = null; state.day = null; state.page = 0; hideError(); updateSummary();
      }
      if (e.target.closest('[data-screening]')) updateScreening();
    });

    function updateSummary() {
      var t = state.treatment && TREATMENTS[state.treatment];
      $('[data-sum-treatment]', summary).textContent = t ? t.name + ' (' + t.minutes + ' min)' : 'Not chosen yet';
      var who = state.slot && state.slot.who ? CLINICIANS[state.slot.who].name : state.clinician === 'any' ? 'First available' : CLINICIANS[state.clinician].name;
      $('[data-sum-clinician]', summary).textContent = t ? who : 'Not chosen yet';
      $('[data-sum-time]', summary).textContent = state.slot ? dateLabel(state.slot.key, { weekday: 'long', day: 'numeric', month: 'long' }) + ', ' + fmtTime(state.slot.mins) : 'Not chosen yet';
      $('[data-sum-price]', summary).textContent = t ? money(t.price) : '–';
    }

    // Health screening: any "yes" to a red-flag question stops the online booking.
    var REDFLAG_ADVICE = {
      cauda: 'Numbness around your buttocks or genitals, or new bladder or bowel problems, need checking today. Go to the ER now or call 911.',
      trauma: 'After a significant fall, crash or blow, you need to be checked for a fracture first. Go to urgent care or the ER, or call 911 if you are badly hurt.',
      systemic: 'Pain with a fever, unexplained weight loss or feeling generally unwell should be seen by a doctor first. Call your doctor or go to urgent care today.',
      weakness: 'Weakness that is getting worse needs to be assessed urgently. Go to urgent care or the ER now, or call 911 if it came on suddenly.'
    };
    function redFlags() {
      return $$('[data-redflag]', bookingForm).filter(function (q) {
        var yes = $('input[value="yes"]', q);
        return yes && yes.checked;
      }).map(function (q) { return q.getAttribute('data-redflag'); });
    }
    function updateScreening() {
      var flags = redFlags(), panel = $('[data-redflag-panel]', bookingForm);
      panel.hidden = !flags.length;
      $('[data-redflag-text]', panel).textContent = flags.map(function (f) { return has(REDFLAG_ADVICE, f) ? REDFLAG_ADVICE[f] : ''; }).join(' ');
      submitBtn.disabled = flags.length > 0;
      var notes = [], t = state.treatment;
      var checked = function (name) { var el = $('input[name="' + name + '"]', bookingForm); return el && el.checked; };
      if (checked('pregnant') && (t === 'shockwave' || t === 'acupuncture')) notes.push('Shockwave and some dry needling sites are not used in pregnancy. We will suggest another option when we confirm.');
      if (checked('pacemaker') && t === 'shockwave') notes.push('Shockwave is not suitable with a pacemaker. We will call you to talk through alternatives.');
      if (checked('anticoagulants') && (t === 'acupuncture' || t === 'massage')) notes.push('Let your therapist know which blood thinner you take: we may adapt the treatment.');
      if (checked('surgery') && t !== 'postop') notes.push('Recent surgery? Post-operative rehab may suit you better. We will check when we confirm.');
      var box = $('[data-screening-notes]', bookingForm);
      box.innerHTML = notes.map(function (n) { return '<li class="flex gap-2">' + ICON.alert + '<span>' + esc(n) + '</span></li>'; }).join('');
      box.hidden = !notes.length;
    }

    function showError(msg) { stepError.textContent = msg; stepError.hidden = false; }
    function hideError() { stepError.textContent = ''; stepError.hidden = true; }
    function go(step, focus) {
      state.step = step;
      steps.forEach(function (s) { s.hidden = Number(s.getAttribute('data-step')) !== step; });
      stepsNav.forEach(function (li, i) {
        var n = i + 1;
        li.setAttribute('data-state', n < step ? 'done' : n === step ? 'current' : 'todo');
        if (n === step) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
        var b = $('button', li);
        if (b) b.disabled = n >= step;
      });
      prevBtn.hidden = step === 1;
      nextBtn.hidden = step === steps.length;
      submitBtn.hidden = step !== steps.length;
      hideError();
      if (step === 2) renderClinicians();
      if (step === 3) renderDays();
      if (step === 4) updateScreening();
      updateSummary();
      if (focus) {
        var h = $('[data-step="' + step + '"] legend', bookingForm);
        if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
        var top = bookingForm.getBoundingClientRect().top + window.scrollY - 110;
        if (window.scrollY > top) window.scrollTo({ top: top, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
      }
    }
    nextBtn.addEventListener('click', function () {
      if (state.step === 1 && !state.treatment) return showError('Please choose a treatment to continue.');
      if (state.step === 3 && !state.slot) return showError('Please choose a day and a time to continue.');
      go(state.step + 1, true);
    });
    prevBtn.addEventListener('click', function () { go(Math.max(1, state.step - 1), true); });
    stepsNav.forEach(function (li, i) {
      var b = $('button', li);
      if (b) b.addEventListener('click', function () {
        var target = i + 1;
        if (target >= state.step) return;
        go(target, true);
      });
    });

    var fields = $$('[data-step="4"] [required]', bookingForm);
    bookingForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (redFlags().length) { updateScreening(); $('[data-redflag-panel]', bookingForm).scrollIntoView({ block: 'center' }); return; }
      var first = null;
      fields.forEach(function (f) { var m = fieldMessage(f); setFieldError(f, m); if (m && !first) first = f; });
      var unanswered = $$('[data-redflag]', bookingForm).filter(function (q) { return !$('input:checked', q); });
      if (unanswered.length) {
        $('[data-screening-error]', bookingForm).textContent = 'Please answer ' + (unanswered.length === 1 ? 'the last health question' : 'all ' + unanswered.length + ' health questions') + ' so we can book you safely.';
        $('[data-screening-error]', bookingForm).hidden = false;
        if (!first) first = $('input', unanswered[0]);
      } else {
        $('[data-screening-error]', bookingForm).hidden = true;
      }
      if (first) { first.focus(); return; }
      /* Connect here: send the request to your booking system or a form service, e.g.
         fetch('https://formspree.io/f/your-id', { method: 'POST', body: new FormData(bookingForm), headers: { Accept: 'application/json' } })
         and only show the confirmation below when the response is OK. See DOCS.md, "Forms". */
      var name = $('#bk-name').value.trim(), firstName = name.split(/\s+/)[0];
      var ref = BOOKING.refPrefix + '-' + Math.floor(hash(name + state.slot.key + state.slot.mins + Date.now()) * 0xfffff).toString(36).toUpperCase().padStart(4, '0');
      var who = state.slot.who ? CLINICIANS[state.slot.who].name : 'one of our PTs';
      var t = TREATMENTS[state.treatment];
      var confirm = $('[data-confirm]');
      $('[data-confirm-name]', confirm).textContent = firstName;
      $('[data-confirm-ref]', confirm).textContent = ref;
      $('[data-confirm-what]', confirm).textContent = t.name + ' (' + t.minutes + ' minutes) with ' + who;
      $('[data-confirm-when]', confirm).textContent = dateLabel(state.slot.key, { weekday: 'long', day: 'numeric', month: 'long' }) + ' at ' + fmtTime(state.slot.mins);
      $('[data-confirm-price]', confirm).textContent = money(t.price) + ', paid at the clinic';
      $('[data-confirm-by]', confirm).textContent = confirmBy();
      bookingForm.hidden = true;
      $('[data-steps-nav]').hidden = true;
      confirm.hidden = false;
      var h = $('h2', confirm);
      h.setAttribute('tabindex', '-1');
      h.focus({ preventScroll: true });
      confirm.scrollIntoView({ block: 'start', behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    });
    $('[data-book-again]').addEventListener('click', function () { window.location.href = 'book.html'; });

    // "We'll confirm by …": the end of the next open day.
    function confirmBy() {
      var now = clinicNow();
      for (var i = 0; i < 10; i++) {
        var key = addDays(now.key, i), h = hoursOn(key);
        if (!h || (i === 0 && now.mins >= toMin(h[1]) - 60)) continue;
        return (i === 0 ? 'today' : i === 1 ? 'tomorrow' : dateLabel(key, { weekday: 'long' })) + ' by ' + fmtTime(toMin(h[1]));
      }
      return 'within one business day';
    }

    // Prefill from the URL: ?treatment=, ?clinician=, ?area=, ?day=
    var pt = param('treatment'), pc = param('clinician'), pa = param('area');
    if (has(TREATMENTS, pt)) {
      state.treatment = pt;
      $('input[name="treatment"][value="' + pt + '"]', bookingForm).checked = true;
    }
    if (has(CLINICIANS, pc) && (!state.treatment || CLINICIANS[pc].treatments.indexOf(state.treatment) !== -1)) state.clinician = pc;
    var areaSelect = $('#bk-area');
    if (areaSelect) {
      areaSelect.innerHTML = '<option value="">Choose an area (optional)</option>' + Object.keys(BODY_AREAS).map(function (k) { return '<option value="' + k + '">' + esc(BODY_AREAS[k].label) + '</option>'; }).join('') + '<option value="other">Somewhere else</option>';
      if (has(BODY_AREAS, pa)) areaSelect.value = pa;
    }
    // Coming from the body map: mark the treatments suggested for that area.
    if (has(BODY_AREAS, pa)) {
      BODY_AREAS[pa].treatments.forEach(function (tid) {
        var tag = $('[data-suggest="' + tid + '"]', bookingForm);
        if (tag) { tag.classList.remove('hidden'); tag.classList.add('block'); $('[data-suggest-area]', tag).textContent = areaPhrase(pa); }
      });
      var areaNote = $('[data-area-note]', bookingForm);
      if (areaNote) { $('[data-area-note-name]', areaNote).textContent = areaPhrase(pa); areaNote.hidden = false; }
    }
    // ?day=YYYY-MM-DD (from the diary strips): open the time step on that day if it is in the diary.
    var pd = param('day');
    if (state.treatment && pd && /^\d{4}-\d{2}-\d{2}$/.test(pd)) {
      var today = clinicNow().key;
      for (var di = 0; di < horizonDays(); di++) {
        if (addDays(today, di) === pd) { state.page = Math.floor(di / BOOKING.daysPerPage); state.day = pd; break; }
      }
    }
    go(state.day ? 3 : state.treatment ? 2 : 1, false);
  })();

  /* ======================================================================
     12. Exercise library, my plan (localStorage "mend-plan") and the rep and hold helper
     Plan shape: { items: ["glute-bridge", ...], done: { date: "YYYY-MM-DD", ids: ["glute-bridge"] } }
     ====================================================================== */
  var EX_BY_ID = {};
  EXERCISES.forEach(function (x) { EX_BY_ID[x.id] = x; });
  /* Exercise drawings: limbs are drawn twice (an ink outline, then a fill), the far side in pale blue,
     the near side in white. pose.ghost is the start position (dashed), pose.focus a highlighter mark on the
     working muscles, pose.marks the red-pencil arrows. */
  function figureSVG(ex, cls) {
    var p = ex.pose;
    function line(pts) { return pts.map(function (q, i) { return (i ? 'L' : 'M') + q[0] + ' ' + q[1]; }).join(''); }
    function torso(pts) { return pts.length === 3 ? 'M' + pts[0].join(' ') + 'Q' + pts[1].join(' ') + ' ' + pts[2].join(' ') : line(pts); }
    function limb(d, w, fill) { return '<path d="' + d + '" stroke="#18224a" stroke-width="' + (w + 3) + '"/><path d="' + d + '" stroke="' + fill + '" stroke-width="' + w + '"/>'; }
    var f = p.focus ? '<circle cx="' + p.focus[0] + '" cy="' + p.focus[1] + '" r="' + p.focus[2] + '" fill="#f6e46b" stroke="none"/>' : '';
    return '<svg class="' + cls + '" viewBox="0 0 160 100" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M6 90.5h148" stroke="#aebdd3" stroke-width="1.2"/>' + (p.props || '') + f +
      (p.ghost ? '<g stroke="#97a7d8" stroke-width="2" stroke-dasharray="3 3">' + p.ghost + '</g>' : '') +
      limb(line(p.far.arm), 4.5, '#c0cbea') + limb(line(p.far.leg), 5.5, '#c0cbea') +
      limb(torso(p.torso), 9, '#ffffff') +
      '<circle cx="' + p.head[0] + '" cy="' + p.head[1] + '" r="7" fill="#ffffff" stroke="#18224a" stroke-width="1.8"/>' +
      limb(line(p.near.leg), 5.5, '#ffffff') + limb(line(p.near.arm), 4.5, '#ffffff') +
      '<g stroke="#b23a2d" stroke-width="1.8">' + (p.marks || '') + '</g></svg>';
  }
  function doseText(ex) {
    var d = ex.dose;
    if (d.hold) return plural(d.sets, 'set') + ' × ' + d.hold + ' s hold';
    if (ex.id === 'ankle-alphabet') return plural(d.sets, 'set') + ' × A to Z, each foot';
    return plural(d.sets, 'set') + ' × ' + plural(d.reps, 'rep');
  }
  function todayKey() { return clinicNow().key; }
  function loadPlan() {
    var raw = readJSON(PLAN_KEY), items = [], done = [];
    if (raw && typeof raw === 'object' && Array.isArray(raw.items)) {
      raw.items.forEach(function (id) { if (has(EX_BY_ID, id) && items.indexOf(id) === -1 && items.length < PLAN_MAX) items.push(id); });
      if (raw.done && typeof raw.done === 'object' && raw.done.date === todayKey() && Array.isArray(raw.done.ids)) {
        raw.done.ids.forEach(function (id) { if (items.indexOf(id) !== -1 && done.indexOf(id) === -1) done.push(id); });
      }
    }
    return { items: items, done: done };
  }
  function savePlan(plan) { writeJSON(PLAN_KEY, { items: plan.items, done: { date: todayKey(), ids: plan.done } }); }

  var library = $('[data-exercise-list]');
  if (library) (function () {
    var plan = loadPlan();
    var filters = { area: has(EXERCISE_AREAS, param('area')) ? param('area') : 'all', level: 'all', equipment: 'all' };
    var areaChips = $('[data-ex-areas]'), levelSel = $('#ex-level'), equipSel = $('#ex-equipment');
    areaChips.innerHTML = Object.keys(EXERCISE_AREAS).map(function (k) {
      return '<button type="button" class="chip" data-ex-area="' + k + '" aria-pressed="false">' + esc(EXERCISE_AREAS[k]) + '</button>';
    }).join('');
    levelSel.innerHTML = '<option value="all">Any level</option>' + Object.keys(LEVELS).map(function (k) { return '<option value="' + k + '">' + LEVELS[k] + '</option>'; }).join('');
    equipSel.innerHTML = '<option value="all">Any equipment</option>' + Object.keys(EQUIPMENT).map(function (k) { return '<option value="' + k + '">' + EQUIPMENT[k] + '</option>'; }).join('');
    var lv = param('level'), eq = param('equipment');
    if (has(LEVELS, lv)) { filters.level = lv; levelSel.value = lv; }
    if (has(EQUIPMENT, eq)) { filters.equipment = eq; equipSel.value = eq; }

    function card(ex) {
      var inPlan = plan.items.indexOf(ex.id) !== -1, no = String(EXERCISES.indexOf(ex) + 1).padStart(2, '0');
      return '<li class="flex flex-col bg-sheet" data-exercise="' + ex.id + '">' +
        '<div class="ruled relative border-b border-rule px-3 pt-6">' + (inPlan ? '<span class="absolute top-2 right-2 font-mono text-[.72rem] font-semibold tracking-[.06em] text-ink uppercase"><span class="bg-hi px-1">In my plan</span></span>' : '') +
        '<span class="absolute top-2 left-3 font-mono text-[.75rem] text-margin-600">E-' + no + '</span>' + figureSVG(ex, 'mx-auto block h-auto w-full max-w-[19rem]') + '</div>' +
        '<div class="flex flex-1 flex-col p-5"><div class="flex flex-wrap gap-1.5"><span class="tag tag-ink">' + esc(EXERCISE_AREAS[ex.area]) + '</span><span class="tag tag-mute">' + esc(LEVELS[ex.level]) + '</span>' +
        (ex.equipment !== 'none' ? '<span class="tag tag-mute">' + esc(EQUIPMENT[ex.equipment]) + '</span>' : '') + '</div>' +
        '<h3 class="mt-3 font-display text-[1.35rem] font-medium">' + esc(ex.name) + '</h3><p class="mt-0.5 font-mono text-[.88rem] font-medium text-margin-700">' + esc(doseText(ex)) + '</p>' +
        '<details class="mt-3"><summary class="cursor-pointer text-[.97rem] font-semibold text-biro-700 underline decoration-biro-300 underline-offset-4">How to do it</summary>' +
        '<ol class="mt-2 grid list-decimal gap-1 pl-5 text-[.97rem]">' + ex.steps.map(function (st) { return '<li>' + esc(st) + '</li>'; }).join('') + '</ol>' +
        '<p class="note mt-2">' + esc(ex.tip) + '</p></details>' +
        '<div class="mt-auto pt-4"><button type="button" class="btn btn-sm w-full ' + (inPlan ? 'btn-paper border-ink' : 'btn-line') + '" data-plan-toggle="' + ex.id + '" aria-pressed="' + inPlan + '">' +
        (inPlan ? ICON.check + 'In my plan' : 'Add to my plan') + '<span class="sr-only">: ' + esc(ex.name) + '</span></button></div></div></li>';
    }
    function renderList() {
      var list = EXERCISES.filter(function (ex) {
        return (filters.area === 'all' || ex.area === filters.area) && (filters.level === 'all' || ex.level === filters.level) && (filters.equipment === 'all' || ex.equipment === filters.equipment);
      });
      library.innerHTML = list.map(card).join('');
      $('[data-ex-empty]').hidden = list.length > 0;
      $('[data-ex-count]').textContent = 'Showing ' + plural(list.length, 'exercise') + (filters.area === 'all' ? '' : ' for the ' + EXERCISE_AREAS[filters.area].toLowerCase());
      $$('[data-ex-area]', areaChips).forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-ex-area') === filters.area)); });
    }
    function renderPlan() {
      var box = $('[data-plan-list]'), n = plan.items.length;
      $$('[data-plan-count]').forEach(function (el) { el.textContent = String(n); });
      $('[data-plan-summary]').textContent = n ? plan.done.length + ' of ' + plural(n, 'exercise') + ' done today' : 'Your plan is empty';
      $('[data-plan-empty]').hidden = n > 0;
      $('[data-plan-actions]').hidden = n === 0;
      box.innerHTML = plan.items.map(function (id, i) {
        var ex = EX_BY_ID[id], done = plan.done.indexOf(id) !== -1;
        return '<li class="flex items-center gap-3 py-2.5"><input type="checkbox" class="check" id="plan-done-' + id + '" data-plan-done="' + id + '"' + (done ? ' checked' : '') + '>' +
          '<label for="plan-done-' + id + '" class="min-w-0 flex-1 leading-snug"><span class="block font-semibold text-ink' + (done ? ' line-through decoration-biro-400' : '') + '">' + esc(ex.name) + '</span><span class="text-sm text-muted">' + esc(doseText(ex)) + '</span></label>' +
          '<button type="button" class="grid size-9 shrink-0 place-items-center rounded-sm text-muted hover:bg-biro-50 hover:text-ink" data-plan-up="' + id + '"' + (i === 0 ? ' disabled' : '') + ' aria-label="Move ' + esc(ex.name) + ' up"><svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 15 6-6 6 6"/></svg></button>' +
          '<button type="button" class="grid size-9 shrink-0 place-items-center rounded-sm text-muted hover:bg-margin-50 hover:text-margin-700" data-plan-remove="' + id + '" aria-label="Remove ' + esc(ex.name) + ' from my plan"><svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button></li>';
      }).join('');
      helper.refresh();
    }
    function toggle(id) {
      var i = plan.items.indexOf(id);
      if (i === -1) {
        if (plan.items.length >= PLAN_MAX) { toast('Your plan holds up to ' + PLAN_MAX + ' exercises. Remove one first.'); return; }
        plan.items.push(id);
        toast(EX_BY_ID[id].name + ' added to your plan');
      } else {
        plan.items.splice(i, 1);
        plan.done = plan.done.filter(function (x) { return x !== id; });
        toast(EX_BY_ID[id].name + ' removed from your plan');
      }
      savePlan(plan);
      renderList();
      renderPlan();
    }
    library.addEventListener('click', function (e) {
      var b = e.target.closest('[data-plan-toggle]');
      if (!b) return;
      var id = b.getAttribute('data-plan-toggle');
      if (!has(EX_BY_ID, id)) return;
      toggle(id);
      var again = $('[data-plan-toggle="' + id + '"]', library);
      if (again) again.focus();
    });
    areaChips.addEventListener('click', function (e) {
      var b = e.target.closest('[data-ex-area]');
      if (!b) return;
      filters.area = b.getAttribute('data-ex-area');
      setParams({ area: filters.area === 'all' ? '' : filters.area });
      renderList();
    });
    levelSel.addEventListener('change', function () { filters.level = has(LEVELS, levelSel.value) ? levelSel.value : 'all'; setParams({ level: filters.level === 'all' ? '' : filters.level }); renderList(); });
    equipSel.addEventListener('change', function () { filters.equipment = has(EQUIPMENT, equipSel.value) ? equipSel.value : 'all'; setParams({ equipment: filters.equipment === 'all' ? '' : filters.equipment }); renderList(); });
    $('[data-ex-reset]').addEventListener('click', function () {
      filters = { area: 'all', level: 'all', equipment: 'all' };
      levelSel.value = 'all'; equipSel.value = 'all';
      setParams({ area: '', level: '', equipment: '' });
      renderList();
    });
    var planBox = $('[data-plan]');
    planBox.addEventListener('change', function (e) {
      var id = e.target.getAttribute('data-plan-done');
      if (!id || !has(EX_BY_ID, id)) return;
      plan.done = plan.done.filter(function (x) { return x !== id; });
      if (e.target.checked) plan.done.push(id);
      savePlan(plan);
      renderPlan();
      var cb = document.getElementById('plan-done-' + id);
      if (cb) cb.focus();
    });
    planBox.addEventListener('click', function (e) {
      var up = e.target.closest('[data-plan-up]'), rm = e.target.closest('[data-plan-remove]');
      if (up) {
        var id = up.getAttribute('data-plan-up'), i = plan.items.indexOf(id);
        if (i > 0) { plan.items.splice(i, 1); plan.items.splice(i - 1, 0, id); savePlan(plan); renderPlan(); var again = $('[data-plan-up="' + id + '"]'); if (again && !again.disabled) again.focus(); }
      }
      if (rm) toggle(rm.getAttribute('data-plan-remove'));
      if (e.target.closest('[data-plan-clear]')) {
        plan = { items: [], done: [] };
        savePlan(plan);
        renderList();
        renderPlan();
        toast('Your plan has been cleared');
      }
      if (e.target.closest('[data-plan-print]')) window.print();
    });

    /* ---------- Rep and hold helper ----------
       Counts reps with a big button, or times holds; rests between sets; marks the exercise done. */
    var helper = (function () {
      var root = $('[data-helper]');
      var sel = $('#helper-exercise', root), display = $('[data-helper-display]', root), setText = $('[data-helper-set]', root);
      var mainBtn = $('[data-helper-main]', root), resetBtn = $('[data-helper-reset]', root), live = $('[data-helper-live]', root);
      var ring = $('[data-helper-ring]', root), phaseText = $('[data-helper-phase]', root);
      var CIRC = 2 * Math.PI * 52;
      var h = { id: null, set: 1, reps: 0, phase: 'ready', endsAt: 0, remaining: 0, timer: null };
      function ex() { return EX_BY_ID[h.id]; }
      function stop() { clearInterval(h.timer); h.timer = null; }
      function setRing(fraction) { ring.style.strokeDasharray = CIRC.toFixed(1); ring.style.strokeDashoffset = (CIRC * (1 - Math.max(0, Math.min(1, fraction)))).toFixed(1); }
      function announce(msg) { live.textContent = msg; }
      function draw() {
        var x = ex();
        if (!x) return;
        var holdMode = !!x.dose.hold;
        setText.textContent = h.phase === 'finished' ? 'All sets done' : 'Set ' + h.set + ' of ' + x.dose.sets;
        if (h.phase === 'rest') {
          display.textContent = Math.ceil(h.remaining) + ' s';
          phaseText.textContent = 'Rest before the next set';
          mainBtn.textContent = 'Skip rest';
          setRing(h.remaining / x.rest);
        } else if (h.phase === 'finished') {
          display.textContent = '✓';
          phaseText.textContent = 'Nicely done. Checked off in your plan for today.';
          mainBtn.textContent = 'Start again';
          setRing(1);
        } else if (holdMode) {
          display.textContent = Math.ceil(h.phase === 'hold' ? h.remaining : x.dose.hold) + ' s';
          phaseText.textContent = h.phase === 'hold' ? 'Hold steady and keep breathing' : 'Get into position, then start the hold';
          mainBtn.textContent = h.phase === 'hold' ? 'Pause' : h.phase === 'paused' ? 'Resume hold' : 'Start hold';
          setRing(h.phase === 'ready' ? 0 : 1 - h.remaining / x.dose.hold);
        } else {
          var target = x.id === 'ankle-alphabet' ? 1 : x.dose.reps;
          display.textContent = h.reps + ' / ' + target;
          phaseText.textContent = x.id === 'ankle-alphabet' ? 'Tap when you reach Z' : 'Tap once for each rep';
          mainBtn.textContent = x.id === 'ankle-alphabet' ? 'Done A to Z' : '+1 rep';
          setRing(h.reps / target);
        }
      }
      function finishSet() {
        var x = ex();
        stop();
        if (h.set >= x.dose.sets) {
          h.phase = 'finished';
          if (plan.items.indexOf(x.id) !== -1 && plan.done.indexOf(x.id) === -1) { plan.done.push(x.id); savePlan(plan); renderPlan(); }
          announce(x.name + ': all ' + plural(x.dose.sets, 'set') + ' done.');
          draw();
          return;
        }
        announce('Set ' + h.set + ' done. Rest for ' + x.rest + ' seconds.');
        h.phase = 'rest';
        run(x.rest, function () { h.set += 1; h.reps = 0; h.phase = 'ready'; announce('Rest over. Set ' + h.set + ' of ' + x.dose.sets + '.'); draw(); });
      }
      function run(seconds, done) {
        stop();
        h.remaining = seconds;
        h.endsAt = Date.now() + seconds * 1000;
        h.timer = setInterval(function () {
          h.remaining = Math.max(0, (h.endsAt - Date.now()) / 1000);
          if (h.remaining <= 0) { stop(); done(); return; }
          draw();
        }, 200);
        draw();
      }
      function reset() { stop(); h.set = 1; h.reps = 0; h.phase = 'ready'; h.remaining = 0; announce(''); draw(); }
      function choose(id) { if (!has(EX_BY_ID, id)) return; h.id = id; sel.value = id; reset(); }
      mainBtn.addEventListener('click', function () {
        var x = ex();
        if (!x) return;
        if (h.phase === 'finished') { reset(); return; }
        if (h.phase === 'rest') { stop(); h.set += 1; h.reps = 0; h.phase = 'ready'; draw(); return; }
        if (x.dose.hold) {
          if (h.phase === 'hold') { stop(); h.phase = 'paused'; draw(); return; }
          var secs = h.phase === 'paused' ? h.remaining : x.dose.hold;
          h.phase = 'hold';
          run(secs, finishSet);
          return;
        }
        var target = x.id === 'ankle-alphabet' ? 1 : x.dose.reps;
        h.reps += 1;
        if (h.reps >= target) finishSet(); else draw();
      });
      resetBtn.addEventListener('click', reset);
      sel.addEventListener('change', function () { choose(sel.value); });
      function refresh() {
        var inPlan = plan.items.slice(), others = EXERCISES.filter(function (x) { return inPlan.indexOf(x.id) === -1; });
        sel.innerHTML = (inPlan.length ? '<optgroup label="My plan">' + inPlan.map(function (id) { return '<option value="' + id + '">' + esc(EX_BY_ID[id].name) + '</option>'; }).join('') + '</optgroup>' : '') +
          '<optgroup label="' + (inPlan.length ? 'Other exercises' : 'All exercises') + '">' + others.map(function (x) { return '<option value="' + x.id + '">' + esc(x.name) + '</option>'; }).join('') + '</optgroup>';
        if (!h.id || !has(EX_BY_ID, h.id)) choose(inPlan[0] || EXERCISES[0].id); else sel.value = h.id;
      }
      $('[data-plan]').addEventListener('click', function (e) {
        var start = e.target.closest('[data-plan-start]');
        if (!start || !plan.items.length) return;
        var next = plan.items.filter(function (id) { return plan.done.indexOf(id) === -1; })[0] || plan.items[0];
        choose(next);
        root.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });
        mainBtn.focus({ preventScroll: true });
      });
      return { refresh: refresh };
    })();

    renderList();
    renderPlan();
  })();

  /* ======================================================================
     13. Prices and insurance (prices.html)
     ====================================================================== */
  var priceTable = $('[data-price-table]');
  if (priceTable) {
    priceTable.innerHTML = Object.keys(TREATMENTS).map(function (id) {
      var t = TREATMENTS[id];
      return '<tr class="border-t border-rule-strong"><th scope="row" class="py-3 pr-3 text-left font-normal"><span class="flex items-center gap-3"><span class="hidden size-11 shrink-0 place-items-center rounded-sm bg-biro-50 sm:grid">' + artSVG(id, 'size-9') + '</span><span class="min-w-0"><span class="block font-semibold text-ink">' + esc(t.name) + '</span>' +
        '<span class="hidden text-sm text-muted sm:block">' + esc(t.who) + '</span></span></span></th><td class="py-3 pr-3 font-mono text-[.9rem] whitespace-nowrap">' + t.minutes + ' min</td>' +
        '<td class="py-3 text-right font-mono text-[1.05rem] font-semibold whitespace-nowrap text-ink">' + money(t.price) + '</td></tr>';
    }).join('');
  }
  var packageList = $('[data-package-list]');
  if (packageList) {
    packageList.innerHTML = PACKAGES.map(function (p) {
      var t = TREATMENTS[p.treatment], full = t.price * p.sessions;
      return '<li class="row grid gap-4 py-5 sm:grid-cols-[3.5rem_minmax(0,1fr)_auto] sm:items-center"><span class="hidden size-14 place-items-center rounded-sm bg-biro-50 sm:grid">' + artSVG(p.treatment, 'size-11') + '</span>' +
        '<div class="min-w-0"><h3 class="font-display text-[1.35rem] font-medium">' + esc(p.name) + ' <span class="tag tag-hi ml-1 align-middle">Save ' + money(full - p.price) + '</span></h3>' +
        '<p class="mt-0.5 text-[.97rem]">' + esc(p.note) + '</p><p class="note mt-0.5">' + money(Math.round(p.price / p.sessions * 100) / 100) + ' a session · valid ' + PACKAGE_MONTHS + ' months</p></div>' +
        '<p class="font-mono sm:text-right"><span class="block text-[1.5rem] font-semibold text-ink">' + money(p.price) + '</span><span class="text-sm text-muted">instead of <s>' + money(full) + '</s></span></p></li>';
    }).join('');
  }
  var estimator = $('[data-estimator]');
  if (estimator) (function () {
    var tSel = $('#est-treatment', estimator), nIn = $('#est-sessions', estimator), usePk = $('#est-package', estimator), out = $('[data-est-result]', estimator);
    tSel.innerHTML = Object.keys(TREATMENTS).map(function (id) { return '<option value="' + id + '">' + esc(TREATMENTS[id].name) + ' (' + money(TREATMENTS[id].price) + ')</option>'; }).join('');
    var pt = param('treatment');
    tSel.value = has(TREATMENTS, pt) ? pt : 'followup';
    function calc() {
      var id = has(TREATMENTS, tSel.value) ? tSel.value : 'followup', t = TREATMENTS[id];
      var n = Math.max(1, Math.min(20, Math.round(Number(nIn.value) || 1)));
      var full = t.price * n, best = full, lines = [];
      var pk = PACKAGES.filter(function (p) { return p.treatment === id; })[0];
      if (usePk.checked && pk && n >= pk.sessions) {
        var blocks = Math.floor(n / pk.sessions), rest = n - blocks * pk.sessions;
        best = blocks * pk.price + rest * t.price;
        lines.push(plural(blocks, pk.name.toLowerCase()) + ' (' + plural(blocks * pk.sessions, 'session') + ') at ' + money(pk.price) + ' each');
        if (rest) lines.push(plural(rest, 'extra session') + ' at ' + money(t.price));
      } else {
        lines.push(plural(n, 'session') + ' at ' + money(t.price));
        if (pk && usePk.checked) lines.push('The ' + pk.name.toLowerCase() + ' starts at ' + plural(pk.sessions, 'session') + '.');
      }
      $('[data-est-total]', out).textContent = money(best);
      $('[data-est-lines]', out).innerHTML = lines.map(function (l) { return '<li>' + esc(l) + '</li>'; }).join('');
      $('[data-est-saving]', out).textContent = best < full ? 'You save ' + money(full - best) + ' against paying per session.' : pk ? '' : 'There is no package for this treatment.';
      $('[data-est-time]', out).textContent = plural(t.minutes * n, 'minute') + ' with us in total.';
    }
    estimator.addEventListener('submit', function (e) { e.preventDefault(); calc(); });
    [tSel, nIn, usePk].forEach(function (el) { el.addEventListener('input', calc); el.addEventListener('change', calc); });
    calc();
  })();
  var insurerSel = $('#insurer');
  if (insurerSel) (function () {
    var out = $('[data-insurer-result]');
    insurerSel.innerHTML = '<option value="">Choose your insurer</option>' + Object.keys(INSURERS).map(function (k) { return '<option value="' + k + '">' + esc(INSURERS[k].name) + '</option>'; }).join('') + '<option value="other">My insurer isn’t listed</option>';
    $('[data-insurer-list]').innerHTML = Object.keys(INSURERS).map(function (k) {
      var i = INSURERS[k];
      return '<li class="flex items-center justify-between gap-3 border-t border-rule-strong py-2.5"><span class="font-semibold text-ink">' + esc(i.name) + '</span><span class="tag ' + (i.status === 'direct' ? 'tag-ink' : 'tag-mute') + '">' + (i.status === 'direct' ? 'We bill them' : 'Pay and claim') + '</span></li>';
    }).join('');
    function render() {
      var k = insurerSel.value;
      if (!k) { out.hidden = true; return; }
      out.hidden = false;
      var title = $('[data-ins-title]', out), list = $('[data-ins-steps]', out);
      if (!has(INSURERS, k)) {
        title.textContent = 'We can still see you';
        list.innerHTML = ['Pay for each appointment at the clinic.', 'We give you an itemized receipt with our provider details.', 'Check with your insurer whether they will reimburse you, and whether they need a referral from your primary care provider.'].map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('');
        return;
      }
      var i = INSURERS[k], steps = [];
      if (i.gp) steps.push('Ask your primary care provider for a referral first: ' + i.name + ' asks for one.');
      if (i.auth) steps.push('Call ' + i.name + ' for prior authorization before your first visit.');
      if (i.status === 'direct') {
        title.textContent = 'We bill ' + i.name + ' directly';
        steps.push('Bring your insurance card and any authorization number to your first appointment.');
        steps.push('We bill them for covered sessions. You pay any copay or deductible, and anything over your visit limit.');
      } else {
        title.textContent = 'Pay us, then claim from ' + i.name;
        steps.push('Pay at each appointment by card.');
        steps.push('We email an itemized receipt so you can submit your claim.');
      }
      list.innerHTML = steps.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('');
      setParams({ insurer: k });
    }
    var pi = param('insurer');
    if (has(INSURERS, pi)) insurerSel.value = pi;
    insurerSel.addEventListener('change', render);
    render();
  })();

  /* ======================================================================
     14. Forms: inline validation and success states
     ====================================================================== */
  var topicSel = $('#c-topic');
  if (topicSel) {
    var topic = param('topic');
    if (topic && $('option[value="' + topic.replace(/[^a-z-]/g, '') + '"]', topicSel)) topicSel.value = topic.replace(/[^a-z-]/g, '');
  }
  function fieldMessage(f) {
    var v = f.value.trim();
    if (f.type === 'checkbox') return f.required && !f.checked ? 'Please check this box to continue.' : '';
    if (f.required && !v) {
      var lbl = f.id && $('label[for="' + f.id + '"]');
      return 'Please fill in ' + (lbl ? lbl.textContent.replace(/\(.*\)/, '').trim().toLowerCase() : 'this field') + '.';
    }
    if (v && f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Enter an email address like name@example.com.';
    if (v && f.type === 'tel' && v.replace(/\D/g, '').length < 10) return 'Enter a phone number with the area code, like (406) 555-0126.';
    var min = Number(f.getAttribute('minlength'));
    if (v && min && v.length < min) return 'Please write at least ' + plural(min, 'character') + '.';
    return '';
  }
  var uid = 0;
  function setFieldError(f, msg) {
    if (!f.id) f.id = 'f-' + (++uid);
    var id = f.id + '-error', el = document.getElementById(id);
    if (!el) {
      el = document.createElement('p');
      el.id = id;
      el.className = 'field-error';
      el.hidden = true;
      var anchor = f.type === 'checkbox' ? f.closest('label') : (f.closest('[data-field-wrap]') || f);
      anchor.insertAdjacentElement('afterend', el);
      var d = f.getAttribute('aria-describedby');
      f.setAttribute('aria-describedby', d ? d + ' ' + id : id);
    }
    el.textContent = msg;
    el.hidden = !msg;
    f.setAttribute('aria-invalid', msg ? 'true' : 'false');
  }
  /* Pressing a submit button blurs the field first. Re-checking it then would add or remove an error line
     and move the button before the click lands, so the submit handler does the checking instead. */
  var pressingSubmit = false;
  document.addEventListener('pointerdown', function (e) { if (e.target.closest && e.target.closest('button[type="submit"]')) pressingSubmit = true; }, true);
  document.addEventListener('pointerup', function () { setTimeout(function () { pressingSubmit = false; }, 0); }, true);
  $$('input[required], textarea[required], select[required], input[type="email"], input[type="tel"]').forEach(function (f) {
    f.addEventListener('blur', function () { if (!pressingSubmit && (f.getAttribute('aria-invalid') === 'true' || f.value)) setFieldError(f, fieldMessage(f)); });
    f.addEventListener('change', function () { if (!pressingSubmit && f.getAttribute('aria-invalid') === 'true') setFieldError(f, fieldMessage(f)); });
  });
  $$('form[data-validate]').forEach(function (form) {
    var fields = $$('input, textarea, select', form).filter(function (f) { return f.required || f.type === 'email' || f.type === 'tel' || f.hasAttribute('minlength'); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var first = null;
      fields.forEach(function (f) { var m = fieldMessage(f); setFieldError(f, m); if (m && !first) first = f; });
      var ok = $('[data-success]', form);
      if (first) { if (ok) ok.hidden = true; first.focus(); return; }
      /* Connect here: e.g. fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
         and show the success message only when the response is OK. See DOCS.md, "Forms". */
      var nameField = $('input[name="name"]', form);
      var firstName = nameField ? nameField.value.trim().split(/\s+/)[0] : '';
      var ref = BOOKING.refPrefix + '-' + Math.floor(hash(form.id + Date.now()) * 0xfffff).toString(36).toUpperCase().padStart(4, '0');
      var msg = (form.getAttribute('data-success-text') || 'Thanks. We’ll be in touch soon.').replace('{name}', firstName || 'there').replace('{ref}', ref);
      if (ok) { ok.textContent = msg; ok.hidden = false; ok.setAttribute('tabindex', '-1'); ok.focus(); }
      form.reset();
      if (topicSel && form.contains(topicSel)) topicSel.value = 'general';
      fields.forEach(function (f) { f.removeAttribute('aria-invalid'); });
    });
  });
})();

/* ---------- Back to top ----------
   A button that fades in after you scroll about one screen down. It returns to the top (instantly
   if the visitor prefers reduced motion) and moves keyboard focus to the main content. Mark your own
   UI with data-back-to-top-avoid (lift above it). To remove the button: delete this block and the
   .back-to-top styles in src/input.css. */
(function () {
  'use strict';
  if (document.querySelector('.back-to-top')) return;
  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'back-to-top';
  btn.setAttribute('aria-label', 'Back to top');
  btn.title = 'Back to top';
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></svg>';
  document.body.appendChild(btn);
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var queued = false;
  function lift() {
    var offset = 0, vw = window.innerWidth, vh = window.innerHeight;
    Array.prototype.forEach.call(document.querySelectorAll('[data-toast].is-visible, [data-back-to-top-avoid]'), function (el) {
      var r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      if (r.bottom > vh - 140 && r.right > vw - 96 && r.top < vh) offset = Math.max(offset, vh - r.top + 4);
    });
    btn.style.setProperty('--btt-lift', offset + 'px');
  }
  function update() {
    queued = false;
    lift();
    btn.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.9);
  }
  function schedule() { if (!queued) { queued = true; window.requestAnimationFrame(update); } }
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  update();
  function focusTop() {
    var target = document.getElementById('main');
    if (target) target.focus({ preventScroll: true });
  }
  btn.addEventListener('click', function () {
    if (reduceMotion.matches) { window.scrollTo({ top: 0, behavior: 'auto' }); focusTop(); return; }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    var done = false;
    function finish() { if (done) return; done = true; window.removeEventListener('scrollend', finish); focusTop(); }
    if ('onscrollend' in window) window.addEventListener('scrollend', finish);
    window.setTimeout(finish, 1500);
  });
})();
