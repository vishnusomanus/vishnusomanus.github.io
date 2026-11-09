/* Brayline Driving School (Steer template) — all template JavaScript. Vanilla, no dependencies.
 *
 *  1. Data            school, prices, discounts, intensive courses, areas, instructors,
 *                     lesson availability rules, permit test questions, student passes (edit here)
 *  2. Helpers         DOM, storage, money, Eau Claire time, dates, federal holidays, ZIP codes
 *  3. Availability    free lesson times worked out from today for each instructor
 *  4. Header          sticky header, accessible mobile menu, next free lesson in the top strip
 *  5. Reveal          fade content in as it scrolls into view
 *  6. ZIP code check  every [data-postcode-form] and the booking form's ZIP code
 *  7. Home            next free lesson card, instructor strip, latest passes
 *  8. Lessons         block price table, intensive courses, price calculator
 *  9. Instructors     filters, cards, choose an instructor (saved)
 * 10. Booking         week-view slot picker and booking request
 * 11. Permit quiz     multiple-choice quiz with scoring, review and best scores (saved)
 * 12. Areas           district map and panel
 * 13. Passes          student passes wall with filters and stats
 * 14. FAQ             live search
 * 15. Contact         office status, hours and the contact form
 * 16. Back to top     (separate block at the end of the file)
 */
(function () {
  'use strict';

  /* ------------------------------------------------------------------
   * 1. Data — times are "HH:MM" in TIME_ZONE. Weekday indexes: 0 = Sunday … 6 = Saturday.
   * ------------------------------------------------------------------ */
  const TIME_ZONE = 'America/Chicago';

  const SCHOOL = {
    name: 'Brayline Driving School',
    phone: '(715) 555-0137',
    phoneHref: '+17155550137'
  };

  // Hourly lesson prices in $.
  const TRANSMISSIONS = {
    manual: { name: 'Manual', rate: 82 },
    automatic: { name: 'Automatic', rate: 75 }
  };
  // Lesson lengths offered in the booking form, in minutes.
  const LESSON_LENGTHS = { 60: '1 hour', 90: '1½ hours', 120: '2 hours' };
  const LESSON_ADJ = { 60: '1-hour', 90: '1½-hour', 120: '2-hour' };
  // New students: the first FIRST_HOURS hours at FIRST_RATE an hour.
  const FIRST_RATE = 55;
  const FIRST_HOURS = 2;
  // Block bookings: $ off every hour when booking at least `min` hours (highest tier first).
  const BLOCK_TIERS = [
    { min: 30, off: 8 },
    { min: 20, off: 6 },
    { min: 10, off: 4 }
  ];
  const STUDENT_DISCOUNT = 0.05; // blocks of 10+ hours and intensive courses
  const TEST_CAR_PRICE = 145;    // the car for the road test, with a one-hour warm-up lesson
  const PASS_PLUS_PRICE = 420;   // the Winter & Highway course, six hours after the road test

  // Intensive courses: fixed prices including the car for the test.
  const INTENSIVES = {
    i15: { name: '15-hour course', hours: 15, weeks: 1, price: { manual: 1290, automatic: 1190 }, suits: 'You’ve driven before, or didn’t pass a road test and want to sharpen up.' },
    i20: { name: '20-hour course', hours: 20, weeks: 2, price: { manual: 1660, automatic: 1530 }, suits: 'You’ve had some lessons and know the basics.' },
    i30: { name: '30-hour course', hours: 30, weeks: 3, price: { manual: 2390, automatic: 2190 }, suits: 'A few hours behind the wheel, but not many.' },
    i40: { name: '40-hour course', hours: 40, weeks: 4, price: { manual: 3090, automatic: 2840 }, suits: 'Complete beginners who want to learn fast.' }
  };
  // Intensive courses start on a Monday at least this many days away (time to schedule a road test).
  const INTENSIVE_LEAD_DAYS = 14;

  // ZIP codes we cover, and nearby ones we cover by arrangement.
  const AREAS = {
    54701: { name: 'South Eau Claire', places: ['Randall Park', 'Putnam Heights', 'Oakwood', 'Town of Washington'] },
    54703: { name: 'Downtown, north and west Eau Claire', places: ['Downtown', 'North Side Hill', 'Water Street', 'Town of Union'] },
    54720: { name: 'Altoona', places: ['Altoona', 'River Prairie', 'Lake Altoona'] },
    54729: { name: 'Chippewa Falls and Lake Hallie', places: ['Chippewa Falls', 'Lake Hallie', 'Lake Wissota', 'Anson'] },
    54739: { name: 'Elk Mound and the west', places: ['Elk Mound', 'Town of Elk Mound', 'Spring Brook'] },
    54742: { name: 'Fall Creek and the southeast', places: ['Fall Creek', 'Foster', 'Town of Ludington'] }
  };
  const NEARBY = {
    54724: 'Bloomer',
    54751: 'Menomonie',
    54758: 'Osseo'
  };

  // Instructors. t: the car's transmission; days: weekdays they teach; hours: first start and finish time;
  // car.body: hatch | suv | saloon (sedan) | estate (station wagon), drawn by carSvg().
  const INSTRUCTORS = {
    lowri: {
      name: 'Lowri Pennick', short: 'Lowri', role: 'Founder · instructor since 2009', t: 'manual',
      car: { body: 'hatch', colour: '#0b4f6c', label: 'Blue five-door hatchback', fuel: 'Gas' },
      areas: ['54703', '54729', '54739'], languages: ['English', 'Spanish'], days: [1, 2, 3, 4, 5], hours: ['09:00', '17:00'],
      firstTime: 72, good: ['Nervous learners', 'Refresher lessons'],
      bio: 'Started Brayline after ten years as a paramedic. Calm, methodical and known for getting nervous drivers around their first big roundabout.'
    },
    kwabena: {
      name: 'Kwabena Frimpong', short: 'Kwabena', role: 'Instructor since 2016', t: 'automatic',
      car: { body: 'suv', colour: '#f2ae00', label: 'Yellow compact SUV', fuel: 'Electric' },
      areas: ['54729', '54720', '54742'], languages: ['English', 'Twi'], days: [2, 3, 4, 5, 6], hours: ['08:00', '16:00'],
      firstTime: 69, good: ['Electric cars', 'Later starters'],
      bio: 'Drove city buses in Eau Claire for twelve years and still enjoys Clairemont Avenue at rush hour. His electric car is quiet enough to talk everything through.'
    },
    agnieszka: {
      name: 'Agnieszka Wolny', short: 'Agnieszka', role: 'Instructor since 2014', t: 'manual',
      car: { body: 'estate', colour: '#b42318', label: 'Red station wagon', fuel: 'Gas' },
      areas: ['54742', '54701', '54739'], languages: ['English', 'Polish'], days: [1, 2, 3, 4, 6], hours: ['07:00', '15:00'],
      firstTime: 70, good: ['Early mornings', 'Lessons in Polish'],
      bio: 'Teaches in English or Polish and happily explains anything twice. Early starts suit her, so she’s ideal before school, college or a shift.'
    },
    rhona: {
      name: 'Rhona Tealby', short: 'Rhona', role: 'Instructor since 2018', t: 'automatic',
      car: { body: 'saloon', colour: '#0c6e78', label: 'Teal hybrid sedan', fuel: 'Hybrid' },
      areas: ['54703', '54701', '54739'], languages: ['English', 'American Sign Language'], days: [1, 3, 5, 6], hours: ['10:00', '18:00'],
      firstTime: 66, good: ['Neurodivergent learners', 'Deaf learners'],
      bio: 'Trained to teach autistic, ADHD and dyslexic learners, and signs in ASL. Breaks every drive into small steps with a picture-based lesson plan.'
    },
    fergal: {
      name: 'Fergal Brackenbury', short: 'Fergal', role: 'Intensive courses and Winter & Highway', t: 'manual',
      car: { body: 'hatch', colour: '#062536', label: 'Black five-door hatchback', fuel: 'Gas' },
      areas: ['54703', '54729', '54720', '54742', '54701', '54739'], languages: ['English'], days: [1, 2, 3, 4, 5, 6], hours: ['08:00', '16:00'],
      firstTime: 65, good: ['Intensive courses', 'Winter & Highway'],
      bio: 'Runs our intensive courses and Winter & Highway. A former rally co-driver who is very relaxed about speed and very strict about mirrors.'
    },
    harpreet: {
      name: 'Harpreet Dhaliwal', short: 'Harpreet', role: 'Instructor since 2020', t: 'automatic',
      car: { body: 'hatch', colour: '#5b3f8c', label: 'Purple hybrid hatchback', fuel: 'Hybrid' },
      areas: ['54703', '54729', '54720'], languages: ['English', 'Punjabi', 'Hindi'], days: [1, 2, 3, 4, 5], hours: ['13:00', '20:00'],
      firstTime: 67, good: ['Evening lessons', 'Older learners'],
      bio: 'Teaches afternoons and evenings, so lessons fit around college and shifts. Speaks Punjabi and Hindi and is great with older learners.'
    }
  };

  // Lessons can be booked from tomorrow up to this many days ahead.
  const BOOK_AHEAD_DAYS = 28;
  // Demo availability: roughly this share (0–100) of each instructor's schedule shows as already booked.
  const DEMO_BUSY = 45;
  // No lessons on US federal holidays (worked out for any year in bankHolidays()).
  const CLOSE_ON_BANK_HOLIDAYS = true;
  // The holiday break: no lessons from December 24 to January 1 inclusive ("MM-DD"), every year, whatever
  // weekday Christmas falls on. Set it to null to teach through it (federal holidays still apply).
  const CHRISTMAS_BREAK = { from: '12-24', to: '01-01', label: 'Holiday break' };
  // Extra days with no lessons, on top of Sundays, federal holidays and the holiday break:
  // { md: 'MM-DD', label } every year, or { md: 'YYYY-MM-DD', label } for one year only (a staff day, a move).
  const EXTRA_CLOSED = [];
  // Office hours per weekday (contact page status); null = closed.
  const OFFICE_HOURS = [null, ['09:00', '17:00'], ['09:00', '17:00'], ['09:00', '17:00'], ['09:00', '17:00'], ['09:00', '17:00'], ['09:00', '12:00']];

  // Permit test quiz. answer: the index of the right option. Written for this school from the Wisconsin
  // Motorists' Handbook, not taken from the official test.
  const TOPICS = {
    hazards: 'Hazards and attitude',
    rules: 'Rules of the road',
    weather: 'Weather and night',
    people: 'Sharing the road',
    car: 'Car and safety',
    fast: 'Highways and interstates'
  };
  const QUESTIONS = [
    { topic: 'hazards', q: 'In good, dry conditions, what following distance does the Wisconsin Motorists’ Handbook recommend?', options: ['One second', 'Two seconds', 'Four seconds', 'One car length'], answer: 2, why: 'Use the four-second rule: pick a fixed point ahead and count. If you reach it before “one thousand four,” you’re too close.' },
    { topic: 'weather', q: 'It’s starting to snow. How should your four-second gap change?', options: ['Keep it at four seconds', 'Add extra seconds', 'Cut it in half, so you can see past', 'It doesn’t matter if your tires are new'], answer: 1, why: 'Add a second for every adverse condition, such as heavier traffic, rain, snow or ice.' },
    { topic: 'weather', q: 'Your steering suddenly feels very light on a wet road. What is most likely happening?', options: ['The power steering has failed', 'The tires are riding on a layer of water', 'The tire pressures are too high', 'The parking brake is partly on'], answer: 1, why: 'That’s hydroplaning. Ease off the gas, keep the wheel straight and don’t try to stop or turn until the tires grip again.' },
    { topic: 'weather', q: 'On a cold, wet day, which part of the road is likely to freeze first?', options: ['Bridges and overpasses', 'Uphill stretches', 'The lane next to the curb', 'Intersections with signals'], answer: 0, why: 'Bridges and overpasses freeze before the rest of the road. Shady spots are slippery early too, so slow down before you reach them.' },
    { topic: 'weather', q: 'When must your low-beam headlights be on?', options: ['Only when it’s fully dark', 'From half an hour past sunset to half an hour before sunrise, and when you can’t see 500 feet ahead', 'Only on unlit roads', 'Only when it’s raining'], answer: 1, why: 'Those are the times you must use them. They’re also recommended whenever your wipers are on, or it’s rainy, snowy or foggy.' },
    { topic: 'weather', q: 'An oncoming driver has left their high beams on at night. What should you do?', options: ['Flash your high beams at them', 'Look toward the right side of the road', 'Look straight at the lights until they pass', 'Switch on your own high beams'], answer: 1, why: 'Look toward the right side of the road until they pass, and slow down if you need to. Don’t answer with your own high beams.' },
    { topic: 'car', q: 'Why are bald tires dangerous in bad weather?', options: ['They make the steering heavy', 'They reduce traction and increase stopping distance', 'They only hurt your gas mileage', 'They switch off the anti-lock brakes'], answer: 1, why: 'Worn tires grip less and take longer to stop, and they can hydroplane even at low speeds.' },
    { topic: 'car', q: 'It snowed overnight. What should you clear before you drive?', options: ['Just enough of the windshield to see', 'The windshield and the rear window', 'All windows, lights, side mirrors and license plates', 'Nothing: it will blow off'], answer: 2, why: 'Clear snow and ice from all windows, lights, side mirrors and license plates, so you can see and others can see you.' },
    { topic: 'car', q: 'Who has to wear a seat belt in Wisconsin?', options: ['Only the driver', 'Only people in the front seats', 'You and your passengers, at any age', 'Only children under 8'], answer: 2, why: 'Wisconsin law requires you and your passengers to wear seat belts at any age, even in a car with air bags.' },
    { topic: 'car', q: 'Generally, until what age does a child in Wisconsin need a booster seat?', options: ['Age 4', 'Age 6', 'Age 8', 'Age 12'], answer: 2, why: 'Generally, children ride in a child safety seat until age 4 and a booster seat until age 8. Check the seat’s manual for its weight and height limits.' },
    { topic: 'hazards', q: 'You feel tired on a long drive and keep drifting in your lane. What is the safest thing to do?', options: ['Open a window and carry on', 'Turn the radio up', 'Pull over somewhere safe and rest', 'Drive faster to get there sooner'], answer: 2, why: 'Fresh air and music don’t fix tiredness. Yawning, drifting from your lane or hitting the rumble strip all mean it’s time to pull over and rest.' },
    { topic: 'hazards', q: 'You hold an instruction permit. When may you use a cell phone while driving?', options: ['When you’re stopped at a red light', 'Only to report an emergency', 'Whenever it’s on speaker', 'On quiet country roads'], answer: 1, why: 'Instruction permit and probationary license holders can use a cell phone only to report an emergency. Set your GPS before you start out.' },
    { topic: 'hazards', q: 'About how far before a turn should you start signaling?', options: ['About three seconds, or 100 feet', 'Just as you start turning', 'A full block', 'Only if someone is behind you'], answer: 0, why: 'Start about three seconds, or about 100 feet, before the turn. If you’re turning just after an intersection, wait until you’ve crossed it.' },
    { topic: 'hazards', q: 'It’s dusk on a rural road and you see eyes shining in your headlights. What should you do?', options: ['Speed up to get past', 'Slow down, use your horn and be ready to stop', 'Flash your high beams', 'Swerve into the other lane'], answer: 1, why: 'Deer are most active from sunset to sunrise, and there’s often more than one. Slow down, use your horn and be ready to stop.' },
    { topic: 'rules', q: 'Two cars reach a four-way stop at the same time. Who goes first?', options: ['The bigger vehicle', 'The driver on the right', 'The driver on the left', 'Whoever signals first'], answer: 1, why: 'The first to arrive goes first. If you arrive together, the driver on the right goes first.' },
    { topic: 'rules', q: 'A traffic signal shows a flashing yellow arrow. What should you do?', options: ['Stop and wait for a green arrow', 'Yield first, then turn with caution', 'Speed up before it turns red', 'Turn straight away: you have the right of way'], answer: 1, why: 'A flashing yellow arrow means you may turn, but you must yield to oncoming traffic and people crossing first.' },
    { topic: 'rules', q: 'When may you turn right on a red light?', options: ['Never', 'After stopping and yielding, unless a sign prohibits it', 'Without stopping, if nothing is coming', 'Only with a green arrow'], answer: 1, why: 'Come to a stop, yield to all traffic and people crossing, then go if it’s safe and no sign prohibits the turn.' },
    { topic: 'rules', q: 'You’re turning at an intersection and someone is still crossing the road you’re turning onto. Who has the right of way?', options: ['You do, because you have a green light', 'The person crossing', 'Whoever is faster', 'Nobody: it depends on the road markings'], answer: 1, why: 'Yield to pedestrians and bicyclists who are still in the intersection, even when your light is green.' },
    { topic: 'rules', q: 'An ambulance is coming with its lights and siren on. What should you do?', options: ['Speed up to stay ahead of it', 'Pull over to the side of the road and stop until it passes', 'Stop right where you are, even in an intersection', 'Keep going at the same speed'], answer: 1, why: 'Pull over to the side and stop until it has passed. Don’t stop in the middle of an intersection.' },
    { topic: 'rules', q: 'A school bus has stopped ahead with its red lights flashing. What must you do?', options: ['Slow down and pass with care', 'Stop at least 20 feet away', 'Stop only if you’re behind it', 'Sound your horn and go around'], answer: 1, why: 'Stop at least 20 feet away, whichever side of the road it’s on. The one exception is the far side of a divided highway.' },
    { topic: 'people', q: 'How much room should you give a bicyclist when you pass?', options: ['One foot', 'At least three feet', 'Half a car width', 'Room only matters above 40 mph'], answer: 1, why: 'Give at least three feet, and wait for oncoming traffic to clear before you pass. Bicyclists can use the whole lane.' },
    { topic: 'people', q: 'You come up behind a tractor with an orange triangle on the back. What does the triangle tell you?', options: ['It’s carrying a wide load', 'It could be traveling at 25 mph or less', 'It’s about to turn', 'It has the right of way everywhere'], answer: 1, why: 'That’s the slow-moving vehicle sign. Be patient: farm equipment may not have brake lights or turn signals.' },
    { topic: 'people', q: 'Why should you look out for motorcyclists at intersections?', options: ['They always have the right of way', 'They’re small and easy to miss, especially in your blind spots', 'They’re slower than cars', 'They can’t stop quickly'], answer: 1, why: 'Motorcycles are easy to miss behind pillars, signs and other vehicles. Check your blind spots and look twice.' },
    { topic: 'people', q: 'You see a pedestrian with a white cane or a guide dog about to cross. What must you do?', options: ['Sound your horn to warn them', 'Stop at least 10 feet away until they’re off the road', 'Drive around them slowly', 'Wave them across'], answer: 1, why: 'Yield even if they aren’t in an intersection. Stop at least 10 feet away until the person is off the road.' },
    { topic: 'fast', q: 'What is the right way to get onto a highway from an on-ramp?', options: ['Stop at the end of the ramp and wait for a gap', 'Use the acceleration lane to match the flow, then merge', 'Merge slowly: others will brake for you', 'Go straight across to the left lane'], answer: 1, why: 'Speed up in the acceleration lane to merge with the flow of traffic, and don’t count on others to make room.' },
    { topic: 'fast', q: 'An emergency vehicle is stopped on the shoulder with its lights flashing. What should you do?', options: ['Stay in your lane at the same speed', 'Sound your horn as you pass', 'Move into a lane not next to it, or slow down if you can’t', 'Stop beside it'], answer: 2, why: 'It’s the law: move into a lane that isn’t next to the stopped vehicle, or slow down if you can’t, and stay there until you’re past it.' }
  ];

  // Student passes (past dates, written for the week of DEMO_ANCHOR). minors: notes from the examiner
  // on the road test; hours: hours of lessons with us before the road test.
  const PASSES = [
    { name: 'Tegan W.', date: '2026-10-20', instructor: 'agnieszka', t: 'manual', first: true, minors: 2, hours: 41, area: 'Elk Mound', quote: 'Two notes from the examiner, both for mirrors. Agnieszka will never let me forget it.' },
    { name: 'Haris M.', date: '2026-10-19', instructor: 'harpreet', t: 'automatic', first: true, minors: 4, hours: 28, area: 'Chippewa Falls', quote: 'Evening lessons after college made it all fit. Passed on my 18th birthday week.' },
    { name: 'Bethany O.', date: '2026-10-16', instructor: 'lowri', t: 'manual', first: false, minors: 3, hours: 52, area: 'Randall Park', quote: 'Second go. Lowri never once made me feel bad about the first.' },
    { name: 'Kobe A.', date: '2026-10-15', instructor: 'kwabena', t: 'automatic', first: true, minors: 1, hours: 26, area: 'Altoona', quote: 'Just one note from the examiner! The electric car made hill starts a non-event.' },
    { name: 'Anais J.', date: '2026-10-13', instructor: 'rhona', t: 'automatic', first: true, minors: 5, hours: 47, area: 'Putnam Heights', quote: 'Rhona’s picture plans were the first time lessons made sense to me.' },
    { name: 'Kacper Z.', date: '2026-10-10', instructor: 'fergal', t: 'manual', first: true, minors: 3, hours: 30, area: 'North Side Hill', quote: 'Three-week intensive, road test that Friday. Tired but very happy.' },
    { name: 'Lacey D.', date: '2026-10-08', instructor: 'agnieszka', t: 'manual', first: true, minors: 2, hours: 36, area: 'Oakwood', quote: '7am lessons before work. Worth every early alarm.' },
    { name: 'Ollie P.', date: '2026-10-06', instructor: 'lowri', t: 'manual', first: true, minors: 4, hours: 40, area: 'Lake Hallie', quote: 'I was terrified of roundabouts. Now I go out of my way to use them.' },
    { name: 'Iqra S.', date: '2026-10-02', instructor: 'harpreet', t: 'automatic', first: false, minors: 2, hours: 33, area: 'Lake Wissota', quote: 'Harpreet explained everything in Punjabi for my mom too.' },
    { name: 'Jaylen B.', date: '2026-09-30', instructor: 'kwabena', t: 'automatic', first: true, minors: 3, hours: 24, area: 'Fall Creek', quote: 'Kwabena knows every lane on every roundabout in the Chippewa Valley.' },
    { name: 'Dominika K.', date: '2026-09-28', instructor: 'agnieszka', t: 'manual', first: true, minors: 1, hours: 38, area: 'Spring Brook', quote: 'Lessons in Polish and English. Passed with one note from the examiner!' },
    { name: 'Rory F.', date: '2026-09-25', instructor: 'fergal', t: 'manual', first: false, minors: 6, hours: 20, area: 'Anson', quote: 'Refresher block after failing elsewhere. All set in five weeks.' },
    { name: 'Yasmin H.', date: '2026-09-23', instructor: 'rhona', t: 'automatic', first: true, minors: 2, hours: 44, area: 'Town of Elk Mound', quote: 'Calm, patient and never in a rush. Exactly what I needed.' },
    { name: 'Brodie C.', date: '2026-09-19', instructor: 'fergal', t: 'manual', first: true, minors: 3, hours: 40, area: 'Foster', quote: 'Did the 40-hour course over summer break.' },
    { name: 'Kiera N.', date: '2026-09-17', instructor: 'lowri', t: 'manual', first: true, minors: 2, hours: 37, area: 'Water Street', quote: 'Passed first time and my mom cried more than I did.' },
    { name: 'Wiktor L.', date: '2026-09-15', instructor: 'agnieszka', t: 'manual', first: true, minors: 4, hours: 34, area: 'Town of Washington', quote: 'Pick-up from work every Tuesday. Couldn’t have done it otherwise.' },
    { name: 'Paige T.', date: '2026-09-11', instructor: 'kwabena', t: 'automatic', first: true, minors: 2, hours: 22, area: 'Lake Altoona', quote: 'Learned at 34 in an automatic. Should have done it years ago.' },
    { name: 'Corin E.', date: '2026-09-09', instructor: 'harpreet', t: 'automatic', first: false, minors: 5, hours: 39, area: 'Downtown', quote: 'Third time’s the charm, thanks to Harpreet’s mock tests.' },
    { name: 'Ilona V.', date: '2026-09-05', instructor: 'rhona', t: 'automatic', first: true, minors: 3, hours: 50, area: 'Elk Mound', quote: 'Rhona signed the whole way through. First time pass!' },
    { name: 'Alfie R.', date: '2026-09-03', instructor: 'fergal', t: 'manual', first: true, minors: 1, hours: 15, area: 'Town of Ludington', quote: 'One-week intensive after a year of driving with my dad.' },
    { name: 'Darcey G.', date: '2026-09-01', instructor: 'lowri', t: 'manual', first: false, minors: 4, hours: 46, area: 'Randall Park', quote: 'Failed on a roundabout, passed on the same one a month later.' },
    { name: 'Shanice Q.', date: '2026-08-28', instructor: 'kwabena', t: 'automatic', first: true, minors: 2, hours: 27, area: 'River Prairie', quote: 'Quiet car, calm instructor, clean pass.' },
    { name: 'Leyton U.', date: '2026-08-26', instructor: 'agnieszka', t: 'manual', first: true, minors: 3, hours: 35, area: 'Foster', quote: 'Agnieszka’s parking tricks got me through the backing and parking.' },
    { name: 'Jemima Y.', date: '2026-08-21', instructor: 'harpreet', t: 'automatic', first: true, minors: 2, hours: 30, area: 'Lake Hallie', quote: 'Lessons after my shifts at the hospital. Great teacher.' },
    { name: 'Mischa I.', date: '2026-08-19', instructor: 'rhona', t: 'automatic', first: false, minors: 4, hours: 42, area: 'Elk Mound', quote: 'My anxiety used to win. Rhona helped me find a way through it.' },
    { name: 'Kenzie X.', date: '2026-08-14', instructor: 'fergal', t: 'manual', first: true, minors: 2, hours: 30, area: 'North Side Hill', quote: 'Did Winter & Highway a week later too. I-94 is no problem now.' },
    { name: 'Sasha B.', date: '2026-08-12', instructor: 'lowri', t: 'manual', first: true, minors: 3, hours: 43, area: 'Chippewa Falls', quote: 'Lowri’s little notebook of “what went well” kept me going.' },
    { name: 'Ewa N.', date: '2026-08-07', instructor: 'agnieszka', t: 'manual', first: true, minors: 1, hours: 33, area: 'Oakwood', quote: 'Learned on the same roads as the test. No surprises on the day.' },
    { name: 'Ryley M.', date: '2026-08-05', instructor: 'kwabena', t: 'automatic', first: true, minors: 3, hours: 25, area: 'Foster', quote: 'Kwabena made Clairemont Avenue feel like a quiet lane.' },
    { name: 'Keeley S.', date: '2026-07-31', instructor: 'harpreet', t: 'automatic', first: true, minors: 2, hours: 29, area: 'Lake Wissota', quote: 'Passed, then drove my grandma up to Lake Superior the next weekend.' }
  ];

  // Demo dates: the passes above are written for the week of DEMO_ANCHOR. While KEEP_DEMO_CURRENT
  // is true, every pass moves forward by the whole weeks since then (weekdays stay right), so the wall
  // always looks recent. Set it to false on a real site and add passes with their real dates.
  const KEEP_DEMO_CURRENT = true;
  const DEMO_ANCHOR = '2026-10-21';

  const STORE_INSTRUCTOR = 'steer:instructor';
  const STORE_QUIZ = 'steer:quiz';
  const STORE_PLAN = 'steer:plan';

  /* ------------------------------------------------------------------
   * 2. Helpers
   * ------------------------------------------------------------------ */
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.prototype.slice.call((root || document).querySelectorAll(sel));
  const params = new URLSearchParams(window.location.search);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  // localStorage, or an in-memory stand-in when the browser blocks it (a sandboxed iframe, strict
  // privacy settings): saved state then lasts for this page view instead of the feature doing nothing.
  const safeStorage = (function () {
    let local = null;
    try { local = window.localStorage; local.getItem('_'); } catch (e) { local = null; /* blocked */ }
    // A save that fails (storage full) stays in memory, and memory is read first, so the change isn't lost.
    const memory = Object.create(null);
    return {
      getItem: (key) => {
        if (key in memory) return memory[key];
        try { return local ? local.getItem(key) : null; } catch (e) { return null; }
      },
      setItem: (key, value) => {
        if (local) {
          try { local.setItem(key, String(value)); delete memory[key]; return; } catch (e) { /* full */ }
        }
        memory[key] = String(value);
      },
      removeItem: (key) => {
        delete memory[key];
        if (local) { try { local.removeItem(key); } catch (e) { /* blocked */ } }
      }
    };
  })();
  const store = {
    get(key) { try { const raw = safeStorage.getItem(key); return raw === null ? null : JSON.parse(raw); } catch (e) { return null; } },
    set(key, value) { try { safeStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* full or blocked */ } },
    remove(key) { try { safeStorage.removeItem(key); } catch (e) { /* blocked */ } }
  };

  // Values from the URL or storage must be the data's own keys, so ?i=constructor matches nothing.
  const hasOwn = (obj, key) => typeof key === 'string' && Object.prototype.hasOwnProperty.call(obj, key);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const plural = (n, one, many) => n + ' ' + (n === 1 ? one : (many || one + 's'));
  const round2 = (n) => Math.round(n * 100) / 100;
  function money(n) { const v = round2(n); return (v < 0 ? '−$' : '$') + (Number.isInteger(Math.abs(v)) ? Math.abs(v).toLocaleString('en-US') : Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })); }
  function hoursText(h) { return (h % 1 ? String(Math.floor(h)) + '½' : String(h)) + (h === 1 ? ' hour' : ' hours'); }
  function toMin(hhmm) { const p = hhmm.split(':'); return +p[0] * 60 + +p[1]; }
  // Minutes after midnight to 12-hour clock times: "7am", "1:30pm", "12pm".
  function clock(min) {
    const h = Math.floor(min / 60) % 24, m = min % 60;
    return (h % 12 || 12) + (m ? ':' + String(m).padStart(2, '0') : '') + (h < 12 ? 'am' : 'pm');
  }
  const hhmm = (min) => String(Math.floor(min / 60)).padStart(2, '0') + ':' + String(min % 60).padStart(2, '0');

  const DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const DAY_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const MONTH_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // Calendar dates are "YYYY-MM-DD" keys, worked out in UTC so clock changes never shift a day.
  const keyOf = (y, m, d) => y + '-' + String(m).padStart(2, '0') + '-' + String(d).padStart(2, '0');
  function dateOfKey(key) { const p = key.split('-'); return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2], 12)); }
  const keyOfDate = (d) => keyOf(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
  function addDays(key, n) { const d = dateOfKey(key); d.setUTCDate(d.getUTCDate() + n); return keyOfDate(d); }
  const weekday = (key) => dateOfKey(key).getUTCDay();
  const daysBetween = (a, b) => Math.round((dateOfKey(b) - dateOfKey(a)) / 86400000);
  const mondayOf = (key) => addDays(key, -((weekday(key) + 6) % 7));
  // A real calendar date in YYYY-MM-DD form (rejects 2026-02-30).
  function validKey(s) {
    if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
    const p = s.split('-');
    return +p[1] >= 1 && +p[1] <= 12 && keyOfDate(dateOfKey(s)) === s;
  }
  const shortDate = (key) => { const d = dateOfKey(key); return DAY[d.getUTCDay()] + ', ' + MONTH[d.getUTCMonth()] + ' ' + d.getUTCDate(); };
  const longDate = (key) => { const d = dateOfKey(key); return DAY_LONG[d.getUTCDay()] + ', ' + MONTH_LONG[d.getUTCMonth()] + ' ' + d.getUTCDate(); };
  const fullDate = (key) => MONTH_LONG[dateOfKey(key).getUTCMonth()] + ' ' + dateOfKey(key).getUTCDate() + ', ' + key.slice(0, 4);

  // Wall-clock time in Eau Claire, whatever the visitor's own time zone is.
  const tzParts = new Intl.DateTimeFormat('en-US', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  function partsAt(date) {
    const o = {};
    tzParts.formatToParts(date).forEach((p) => { o[p.type] = p.value; });
    return { y: +o.year, m: +o.month, d: +o.day, h: +o.hour % 24, min: +o.minute };
  }
  // ?at=2026-10-21T10:30 previews the site at an Eau Claire date and time (for testing availability).
  const AT = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})$/.exec(params.get('at') || '');
  function nowLondon() {
    if (AT && validKey(AT[1]) && +AT[2] < 24 && +AT[3] < 60) {
      return { key: AT[1], day: weekday(AT[1]), mins: +AT[2] * 60 + +AT[3] };
    }
    const p = partsAt(new Date());
    const k = keyOf(p.y, p.m, p.d);
    return { key: k, day: weekday(k), mins: p.h * 60 + p.min };
  }
  const NOW = nowLondon();
  const TODAY = NOW.key;

  // "today", "yesterday", "3 days ago", "2 weeks ago", "3 months ago" for a past date key.
  function ago(key) {
    const n = daysBetween(key, TODAY);
    if (n <= 0) return 'today';
    if (n === 1) return 'yesterday';
    if (n < 14) return n + ' days ago';
    if (n < 60) return plural(Math.floor(n / 7), 'week') + ' ago';
    return plural(Math.floor(n / 30), 'month') + ' ago';
  }

  // Deterministic pseudo-random numbers (FNV-1a + mix) so demo availability is stable for a given day.
  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    h ^= h >>> 16; h = Math.imul(h, 2246822507) >>> 0;
    h ^= h >>> 13; h = Math.imul(h, 3266489909) >>> 0;
    h ^= h >>> 16;
    return h >>> 0;
  }

  // US federal holidays for a year, as { "YYYY-MM-DD": name }, on the day they're observed: one that falls
  // on a Saturday is observed on the Friday before, one on a Sunday on the Monday after.
  const holidayCache = Object.create(null);
  function bankHolidays(y) {
    if (holidayCache[y]) return holidayCache[y];
    const out = Object.create(null);
    // The nth Monday (or other weekday) of a month, and the last Monday of a month.
    const nth = (month, day, n) => { let k = keyOf(y, month, 1); while (weekday(k) !== day) k = addDays(k, 1); return addDays(k, (n - 1) * 7); };
    const lastMonday = (month) => { let k = addDays(keyOf(month === 12 ? y + 1 : y, month === 12 ? 1 : month + 1, 1), -1); while (weekday(k) !== 1) k = addDays(k, -1); return k; };
    const fixed = (key, name) => {
      const d = weekday(key);
      if (d === 6) out[addDays(key, -1)] = name + ' (observed)';
      else if (d === 0) out[addDays(key, 1)] = name + ' (observed)';
      else out[key] = name;
    };
    fixed(keyOf(y, 1, 1), "New Year's Day");
    out[nth(1, 1, 3)] = 'MLK Day';
    out[nth(2, 1, 3)] = "Presidents' Day";
    out[lastMonday(5)] = 'Memorial Day';
    fixed(keyOf(y, 6, 19), 'Juneteenth');
    fixed(keyOf(y, 7, 4), 'Independence Day');
    out[nth(9, 1, 1)] = 'Labor Day';
    out[nth(10, 1, 2)] = 'Columbus Day';
    fixed(keyOf(y, 11, 11), 'Veterans Day');
    out[nth(11, 4, 4)] = 'Thanksgiving';
    fixed(keyOf(y, 12, 25), 'Christmas Day');
    // New Year's Day on a Saturday is observed on December 31 of the year before.
    if (weekday(keyOf(y + 1, 1, 1)) === 6) out[keyOf(y, 12, 31)] = "New Year's Day (observed)";
    // Drop the observed day that landed in the previous year.
    Object.keys(out).forEach((k) => { if (k.slice(0, 4) !== String(y)) delete out[k]; });
    holidayCache[y] = out;
    return out;
  }
  // Why there are no lessons on a date (federal holiday or extra closed day), or null.
  function closedReason(key) {
    const hol = bankHolidays(+key.slice(0, 4));
    if (CLOSE_ON_BANK_HOLIDAYS && hasOwn(hol, key)) return hol[key];
    const md = key.slice(5);
    if (md === '12-25') return 'Christmas Day';
    if (CHRISTMAS_BREAK) {
      const b = CHRISTMAS_BREAK;
      if (b.from <= b.to ? md >= b.from && md <= b.to : md >= b.from || md <= b.to) return b.label;
    }
    const extra = EXTRA_CLOSED.find((x) => x.md === md || x.md === key);
    return extra ? extra.label : null;
  }

  // US ZIP codes: five digits ("54701"), with or without the +4 ("54701-1234", "547011234").
  // Returns { outward: the five digits, text } or null.
  function parsePostcode(raw) {
    const m = /^(\d{5})(?:-?(\d{4}))?$/.exec(String(raw || '').replace(/\s+/g, ''));
    if (!m) return null;
    return { outward: m[1], text: m[2] ? m[1] + '-' + m[2] : m[1] };
  }
  // { status: 'covered' | 'nearby' | 'outside', outward, text }
  function coverage(pc) {
    if (hasOwn(AREAS, pc.outward)) return { status: 'covered', outward: pc.outward, text: pc.text };
    if (hasOwn(NEARBY, pc.outward)) return { status: 'nearby', outward: pc.outward, text: pc.text };
    return { status: 'outside', outward: pc.outward, text: pc.text };
  }

  function setError(form, name, msg) {
    const el = $('[data-error="' + name + '"]', form);
    if (el) el.textContent = msg || '';
    $$('[name="' + name + '"]', form).forEach((input) => {
      if (msg) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid');
    });
    return !msg;
  }
  function focusFirstError(form) {
    const bad = $('[aria-invalid="true"]', form);
    if (bad) bad.focus();
  }
  // A US phone number: 10 digits, with or without a leading 1 or +1.
  function validPhone(s) {
    const d = String(s).replace(/[\s().-]/g, '');
    return /^(?:\+?1)?[2-9]\d{2}[2-9]\d{6}$/.test(d);
  }
  // A short booking or message reference, e.g. "BL-7K2Q9".
  function reference(seed) {
    return 'BL-' + (hash(seed + '|' + Date.now()) % 60466176).toString(36).toUpperCase().padStart(5, '0');
  }

  const instructorList = () => Object.keys(INSTRUCTORS);
  const portrait = (id, cls) => '<img src="assets/img/instructors/' + id + '.svg" alt="" width="200" height="200" class="' + cls + '">';

  // A side-on drawing of an instructor's car, with a student-driver sign on the door and a roof sign.
  const CAR_BODIES = {
    hatch: { body: 'M20 84V66Q20 56 32 54L62 50 84 28Q90 22 100 22H150Q160 22 166 30L184 52Q198 54 200 66V84Z', glass: 'M70 50 88 32Q92 28 98 28H122V50ZM128 28H148Q156 28 160 34L172 50H128Z', roof: 112 },
    suv: { body: 'M18 84V60Q18 50 30 48L58 44 74 20Q78 14 88 14H162Q172 14 176 22L190 44Q202 46 204 58V84Z', glass: 'M66 44 80 22Q82 20 88 20H124V44ZM130 20H162Q168 20 171 26L180 44H130Z', roof: 104 },
    saloon: { body: 'M14 84V68Q14 60 24 58L60 54 82 32Q88 26 98 26H138Q148 26 154 34L172 54 198 56Q206 58 206 68V84Z', glass: 'M70 54 88 34Q92 31 98 31H118V54ZM124 31H138Q146 31 150 37L162 54H124Z', roof: 110 },
    estate: { body: 'M16 84V66Q16 56 28 54L58 50 80 28Q86 22 96 22H186Q196 22 198 30L202 54Q206 58 206 66V84Z', glass: 'M66 50 84 30Q88 27 94 27H124V50ZM130 27H160V50H130ZM166 27H188Q192 27 194 32L196 50H166Z', roof: 130 }
  };
  function carSvg(car, title) {
    const b = hasOwn(CAR_BODIES, car.body) ? CAR_BODIES[car.body] : CAR_BODIES.hatch;
    const top = car.body === 'suv' ? 14 : car.body === 'saloon' ? 26 : 22;
    const wheel = (x) => '<circle cx="' + x + '" cy="86" r="16" fill="#062536"/><circle cx="' + x + '" cy="86" r="7" fill="#b7cdd7"/>';
    return '<svg viewBox="0 0 220 110" class="block w-full" role="img" aria-label="' + esc(title) + '">' +
      '<ellipse cx="110" cy="102" rx="96" ry="6" fill="#0d2230" opacity=".12"/>' +
      '<rect x="' + (b.roof - 22) + '" y="' + (top - 11) + '" width="44" height="11" rx="4" fill="#ffc531"/>' +
      '<path d="' + b.body + '" fill="' + car.colour + '"/>' +
      '<path d="' + b.glass + '" fill="#dcf0f1"/>' +
      '<rect x="' + (car.body === 'saloon' || car.body === 'estate' ? 196 : 192) + '" y="62" width="10" height="7" rx="2" fill="#fff3d0"/>' +
      '<rect x="' + (car.body === 'saloon' ? 14 : 18) + '" y="62" width="7" height="8" rx="2" fill="#b42318"/>' +
      '<g transform="translate(88 60)"><rect width="46" height="13" rx="2" fill="#fff"/><text x="23" y="9.6" text-anchor="middle" font-family="Readex Pro, sans-serif" font-size="8.5" font-weight="700" fill="#b42318">STUDENT</text></g>' +
      wheel(car.body === 'saloon' ? 54 : 56) + wheel(car.body === 'estate' ? 168 : 164) +
      (car.fuel === 'Electric' ? '<path d="m146 52-6 10h5l-3 9 9-12h-5l3-7Z" fill="#fff"/>' : '') +
      '</svg>';
  }

  /* ------------------------------------------------------------------
   * 3. Availability — each instructor's schedule is worked out from rules and today's date, so it
   *    never goes stale. Replace freeUnits() with your real schedule to go live.
   * ------------------------------------------------------------------ */
  const FIRST_BOOKABLE = addDays(TODAY, 1);
  const LAST_BOOKABLE = addDays(TODAY, BOOK_AHEAD_DAYS);
  const unitCache = Object.create(null);

  // Free half-hour units in an instructor's workday: an array of booleans from their first
  // start time, or null when they don't teach that day.
  function freeUnits(id, key) {
    const cacheKey = id + '|' + key;
    if (cacheKey in unitCache) return unitCache[cacheKey];
    const ins = INSTRUCTORS[id];
    let out = null;
    if (ins.days.indexOf(weekday(key)) !== -1 && !closedReason(key)) {
      const start = toMin(ins.hours[0]), units = (toMin(ins.hours[1]) - start) / 30;
      out = new Array(units).fill(true);
      let u = 0;
      while (u < units) {
        const r = hash(id + '|' + key + '|' + u);
        if (r % 100 < DEMO_BUSY) {
          const len = 2 + ((r >>> 8) % 3); // a 1, 1½ or 2 hour lesson already booked
          for (let j = u; j < Math.min(units, u + len); j++) out[j] = false;
          u += len;
        } else {
          u += 1 + ((r >>> 12) % 2);
        }
      }
    }
    unitCache[cacheKey] = out;
    return out;
  }
  // Start times (minutes after midnight, on the hour) when an instructor can teach a lesson of `mins`.
  function startsFor(id, key, mins) {
    if (key < FIRST_BOOKABLE || key > LAST_BOOKABLE) return [];
    const units = freeUnits(id, key);
    if (!units) return [];
    const start = toMin(INSTRUCTORS[id].hours[0]), need = mins / 30, out = [];
    for (let u = 0; u + need <= units.length; u++) {
      if ((start + u * 30) % 60) continue;
      let ok = true;
      for (let j = u; j < u + need; j++) if (!units[j]) { ok = false; break; }
      if (ok) out.push(start + u * 30);
    }
    return out;
  }
  // Instructors matching a filter { t, area, instructor }.
  function eligible(filter) {
    return instructorList().filter((id) => {
      const ins = INSTRUCTORS[id];
      if (filter.instructor && filter.instructor !== 'any') return id === filter.instructor;
      if (filter.t && ins.t !== filter.t) return false;
      if (filter.area && ins.areas.indexOf(filter.area) === -1) return false;
      return true;
    });
  }
  // Free start times on a day: [{ mins, ids: [instructor ids free then] }], earliest first.
  function slotsOn(key, filter, mins) {
    const byStart = Object.create(null);
    eligible(filter).forEach((id) => {
      startsFor(id, key, mins).forEach((s) => { (byStart[s] = byStart[s] || []).push(id); });
    });
    return Object.keys(byStart).map(Number).sort((a, b) => a - b).map((s) => ({ mins: s, ids: byStart[s] }));
  }
  // The next free lesson for a filter: { key, mins, id } or null.
  function nextFree(filter, mins) {
    for (let k = FIRST_BOOKABLE; k <= LAST_BOOKABLE; k = addDays(k, 1)) {
      const slots = slotsOn(k, filter, mins);
      if (slots.length) return { key: k, mins: slots[0].mins, id: pickInstructor(slots[0].ids, filter) };
    }
    return null;
  }
  function countFree(filter, mins, from, days) {
    let n = 0;
    for (let i = 0; i < days; i++) n += slotsOn(addDays(from, i), filter, mins).length;
    return n;
  }
  // Prefer the saved instructor when several are free at the same time.
  function pickInstructor(ids, filter) {
    const saved = savedInstructor();
    if (saved && ids.indexOf(saved) !== -1 && (!filter.t || INSTRUCTORS[saved].t === filter.t)) return saved;
    return ids[0];
  }
  const whenText = (key, mins) => (key === FIRST_BOOKABLE ? 'Tomorrow' : longDate(key)) + ', ' + clock(mins);
  const bookHref = (slot, extra) => 'book.html?i=' + slot.id + '&t=' + INSTRUCTORS[slot.id].t + '&slot=' + slot.key + 'T' + hhmm(slot.mins) + (extra || '');

  function savedInstructor() {
    const v = store.get(STORE_INSTRUCTOR);
    return hasOwn(INSTRUCTORS, v) ? v : null;
  }

  /* ------------------------------------------------------------------
   * 4. Header
   * ------------------------------------------------------------------ */
  const header = $('#site-header');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const menuBtn = $('#menu-toggle'), menu = $('#mobile-menu');
  function setMenu(open) {
    // The menu sits right under the header, whatever height the header has.
    if (open) menu.style.top = Math.max(0, header.getBoundingClientRect().bottom) + 'px';
    menu.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
    $('[data-icon-open]', menuBtn).classList.toggle('hidden', open);
    $('[data-icon-close]', menuBtn).classList.toggle('hidden', !open);
    document.body.classList.toggle('menu-is-open', open);
  }
  menuBtn.addEventListener('click', () => setMenu(menu.hidden));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !menu.hidden) { setMenu(false); menuBtn.focus(); }
  });
  $$('a', menu).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  window.matchMedia('(min-width: 1280px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });

  // The next free lesson with anyone, in the top strip of every page.
  const NEXT_ANY = nextFree({}, 120) || nextFree({}, 60);
  $$('[data-next-slot-short]').forEach((a) => {
    if (!NEXT_ANY) return;
    a.textContent = (NEXT_ANY.key === FIRST_BOOKABLE ? 'Tomorrow' : shortDate(NEXT_ANY.key)) + ', ' + clock(NEXT_ANY.mins) + ' with ' + INSTRUCTORS[NEXT_ANY.id].short;
    a.href = bookHref(NEXT_ANY, '&d=120');
  });

  /* ------------------------------------------------------------------
   * 5. Reveal — everything above the fold edge is revealed on scroll too,
   *    so fast jumps (End key, anchors) never leave content hidden.
   * ------------------------------------------------------------------ */
  function initReveal() {
    const pending = $$('.reveal:not(.is-visible)');
    const show = (el) => el.classList.add('is-visible');
    if (reduceMotion || !('IntersectionObserver' in window)) { pending.forEach(show); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { show(en.target); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    pending.forEach((el, i) => { el.style.transitionDelay = Math.min(i % 4, 3) * 70 + 'ms'; io.observe(el); });
    let queued = false;
    const revealAbove = () => {
      queued = false;
      const limit = window.innerHeight * 0.92;
      $$('.reveal:not(.is-visible)').forEach((el) => {
        if (el.getBoundingClientRect().top < limit) { show(el); io.unobserve(el); }
      });
    };
    window.addEventListener('scroll', () => {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(revealAbove);
    }, { passive: true });
    if (window.location.hash) window.addEventListener('load', revealAbove);
  }

  /* ------------------------------------------------------------------
   * 6. ZIP code check
   * ------------------------------------------------------------------ */
  // The result box for a checked ZIP code (HTML), used on the home, areas and booking pages.
  function coverageHtml(c, withBook) {
    if (c.status === 'covered') {
      const who = eligible({ area: c.outward }).map((id) => INSTRUCTORS[id].short);
      return '<div class="mt-3 rounded-2xl bg-go-soft p-4 text-sm"><p class="font-display text-base font-semibold text-go">Yes, we pick up from ' + esc(c.text) + '.</p>' +
        '<p class="mt-1 text-ink">' + esc(AREAS[c.outward].places.join(', ')) + '. ' + plural(who.length, 'instructor') + ' teach' + (who.length === 1 ? 'es' : '') + ' there: ' + esc(who.join(', ')) + '.</p>' +
        (withBook ? '<a class="text-link mt-2 inline-block" href="book.html?postcode=' + encodeURIComponent(c.text) + '">Book a lesson from ' + esc(c.outward) + '</a>' : '') + '</div>';
    }
    if (c.status === 'nearby') {
      return '<div class="mt-3 rounded-2xl bg-sun-soft p-4 text-sm"><p class="font-display text-base font-semibold text-ink">' + esc(c.outward) + ' (' + esc(NEARBY[c.outward]) + ') is by arrangement.</p>' +
        '<p class="mt-1 text-ink">We pick up there for intensive courses, or you can meet your instructor at our office in Eau Claire. Call ' + SCHOOL.phone + ' to arrange it.</p></div>';
    }
    return '<div class="mt-3 rounded-2xl bg-cloud p-4 text-sm"><p class="font-display text-base font-semibold text-route">We don’t cover ' + esc(c.outward) + ' yet.</p>' +
      '<p class="mt-1 text-ink">Our instructors teach in 54701, 54703, 54720, 54729, 54739 and 54742. If you work or study in one of those, we can pick you up from there instead.</p></div>';
  }
  const POSTCODE_ERROR = 'Enter a 5-digit ZIP code, like 54701.';

  $$('[data-postcode-form]').forEach((form) => {
    const input = $('[name="postcode"]', form), out = $('[data-postcode-result]', form);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const pc = parsePostcode(input.value);
      if (!pc) { setError(form, 'postcode', POSTCODE_ERROR); out.innerHTML = ''; input.focus(); return; }
      setError(form, 'postcode', '');
      input.value = pc.text;
      const c = coverage(pc);
      out.innerHTML = coverageHtml(c, true);
      document.dispatchEvent(new CustomEvent('steer:postcode', { detail: c }));
    });
    input.addEventListener('input', () => { if (input.getAttribute('aria-invalid') === 'true') setError(form, 'postcode', ''); });
  });

  /* ------------------------------------------------------------------
   * 7. Home
   * ------------------------------------------------------------------ */
  const nextCard = $('[data-next-card]');
  if (nextCard && NEXT_ANY) {
    const ins = INSTRUCTORS[NEXT_ANY.id];
    $('[data-next-when]', nextCard).textContent = whenText(NEXT_ANY.key, NEXT_ANY.mins);
    $('[data-next-detail]', nextCard).textContent = '2-hour ' + ins.t + ' lesson with ' + ins.name + ', picking up in ' + ins.areas.join(', ') + '.';
    $('[data-next-link]', nextCard).href = bookHref(NEXT_ANY, '&d=120');
    const n = countFree({}, 60, FIRST_BOOKABLE, 7);
    $('[data-next-week-count]', nextCard).textContent = plural(n, 'free time') + ' in the next 7 days';
  }

  const strip = $('[data-instructor-strip]');
  if (strip) {
    strip.innerHTML = instructorList().map((id) => {
      const ins = INSTRUCTORS[id], nx = nextFree({ instructor: id }, 60);
      return '<li class="reveal"><a href="instructors.html#' + id + '" class="card flex h-full items-center gap-4 p-4 transition hover:border-route">' +
        portrait(id, 'size-20 shrink-0 rounded-full bg-cloud') +
        '<span class="min-w-0"><span class="block font-display text-lg font-semibold text-route">' + esc(ins.name) + '</span>' +
        '<span class="mt-0.5 block text-sm text-slate">' + TRANSMISSIONS[ins.t].name + ' · ' + esc(ins.languages.join(', ')) + '</span>' +
        '<span class="mt-2 inline-flex items-center gap-1.5 rounded-full bg-go-soft px-2.5 py-0.5 text-xs font-semibold text-go">' + (nx ? 'Next free: ' + shortDate(nx.key) + ', ' + clock(nx.mins) : 'Call for times') + '</span></span></a></li>';
    }).join('');
  }

  // Pass dates, moved forward by whole weeks while KEEP_DEMO_CURRENT is on.
  const PASS_SHIFT = KEEP_DEMO_CURRENT ? Math.max(0, Math.floor(daysBetween(DEMO_ANCHOR, TODAY) / 7) * 7) : 0;
  const passes = PASSES.map((p) => Object.assign({}, p, { date: addDays(p.date, PASS_SHIFT) }))
    .filter((p) => p.date <= TODAY)
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  const PASS_COLOURS = [
    { card: 'bg-route text-white', sub: 'text-mist', ring: 'bg-sun text-ink' },
    { card: 'bg-sun-soft text-ink', sub: 'text-slate', ring: 'bg-route text-white' },
    { card: 'bg-teal-soft text-ink', sub: 'text-slate', ring: 'bg-teal text-white' },
    { card: 'bg-night text-white', sub: 'text-mist', ring: 'bg-sun text-ink' }
  ];
  function passCard(p, i) {
    const c = PASS_COLOURS[i % PASS_COLOURS.length], ins = INSTRUCTORS[p.instructor];
    return '<li class="reveal"><article class="flex h-full flex-col rounded-[1.75rem] p-6 ' + c.card + '">' +
      '<div class="flex items-start justify-between gap-3"><div><h3 class="font-display text-2xl font-bold">' + esc(p.name) + '</h3>' +
      '<p class="mt-1 text-sm ' + c.sub + '"><time datetime="' + p.date + '">' + fullDate(p.date) + '</time> · ' + ago(p.date) + '</p></div>' +
      '<span class="grid size-14 shrink-0 place-items-center rounded-full font-display text-xs leading-tight font-bold text-center ' + c.ring + '">' + (p.first ? 'First<br>time' : 'Passed') + '</span></div>' +
      '<blockquote class="mt-4 flex-1 text-lg leading-snug">“' + esc(p.quote) + '”</blockquote>' +
      '<p class="mt-5 flex items-center gap-3 text-sm ' + c.sub + '">' + portrait(p.instructor, 'size-9 rounded-full bg-white') +
      '<span>' + esc(ins.short) + ' · ' + TRANSMISSIONS[p.t].name + ' · ' + plural(p.minors, 'minor') + ' · ' + esc(p.area) + '</span></p>' +
      '</article></li>';
  }
  const latest = $('[data-pass-latest]');
  if (latest) latest.innerHTML = passes.slice(0, 3).map(passCard).join('');

  /* ------------------------------------------------------------------
   * 8. Lessons — block table, intensive courses, price calculator
   * ------------------------------------------------------------------ */
  const blockTable = $('[data-block-table]');
  if (blockTable) {
    const rows = [{ h: 1, off: 0, label: 'Pay as you go, per hour' }].concat(BLOCK_TIERS.slice().reverse().map((t) => ({ h: t.min, off: t.off, label: t.min + ' hours' + (t === BLOCK_TIERS[0] ? ' or more' : '') })));
    const cell = (t, r) => '<td class="px-3 py-4 sm:px-5"><span class="font-display text-lg font-bold">' + money((TRANSMISSIONS[t].rate - r.off) * r.h) + '</span>' + (r.h > 1 ? '<span class="block text-xs text-slate">' + money(TRANSMISSIONS[t].rate - r.off) + ' an hour</span>' : '') + '</td>';
    blockTable.innerHTML = rows.map((r) => '<tr class="border-t border-line"><th scope="row" class="px-3 py-4 font-display font-semibold sm:px-5">' + r.label + (r.off ? '<span class="block font-sans text-xs font-normal text-slate sm:hidden">' + money(r.off) + ' off an hour</span>' : '') + '</th>' +
      '<td class="hidden px-5 py-4 text-slate sm:table-cell">' + (r.off ? money(r.off) + ' an hour' : '–') + '</td>' + cell('manual', r) + cell('automatic', r) + '</tr>').join('');
  }

  // Intensive courses start on Mondays at least INTENSIVE_LEAD_DAYS away, skipping weeks with a closed day.
  function intensiveStarts(count) {
    const out = [];
    let k = mondayOf(addDays(TODAY, INTENSIVE_LEAD_DAYS + 6));
    while (out.length < count) {
      let open = true;
      for (let i = 0; i < 5; i++) if (closedReason(addDays(k, i))) open = false;
      if (open) out.push(k);
      k = addDays(k, 7);
    }
    return out;
  }
  const intensiveList = $('[data-intensive-list]');
  if (intensiveList) {
    const starts = intensiveStarts(3);
    $('[data-intensive-next]').textContent = longDate(starts[0]) + ', ' + starts[0].slice(0, 4);
    intensiveList.innerHTML = Object.keys(INTENSIVES).map((id, i) => {
      const c = INTENSIVES[id];
      return '<li class="reveal card flex flex-col p-6' + (i === 3 ? ' border-sun' : '') + '">' +
        '<p class="badge self-start ' + (i === 3 ? 'badge-sun' : 'badge-teal') + '">' + plural(c.weeks, 'week') + '</p>' +
        '<h3 class="mt-4 font-display text-xl font-semibold text-route">' + c.name + '</h3>' +
        '<p class="mt-2 flex-1 text-sm text-slate">' + esc(c.suits) + '</p>' +
        '<dl class="mt-4"><div class="spec-row"><dt>Manual</dt><dd>' + money(c.price.manual) + '</dd></div><div class="spec-row"><dt>Automatic</dt><dd>' + money(c.price.automatic) + '</dd></div></dl>' +
        '<p class="mt-4 text-sm text-slate">Starts ' + starts.map((s) => MONTH[dateOfKey(s).getUTCMonth()] + ' ' + dateOfKey(s).getUTCDate()).join(', ') + '</p>' +
        '<a href="lessons.html?mode=intensive&amp;course=' + id + '#calculator" class="link-arrow mt-4 text-sm">Price it out</a></li>';
    }).join('');
  }

  // Price calculator: returns { lines: [{ label, amount }], total, paygo, saving, hours }.
  function quote(o) {
    const rate = TRANSMISSIONS[o.t].rate, lines = [];
    let paygo = 0, hours;
    if (o.mode === 'weekly') {
      hours = o.h;
      const tier = BLOCK_TIERS.find((t) => hours >= t.min), off = tier ? tier.off : 0;
      const firstHrs = o.first ? Math.min(FIRST_HOURS, hours) : 0, rest = hours - firstHrs;
      if (firstHrs) lines.push({ label: hoursText(firstHrs) + ' at the new-student rate, ' + money(FIRST_RATE), amount: firstHrs * FIRST_RATE });
      if (rest) lines.push({ label: hoursText(rest) + ' at ' + money(rate - off) + (off ? ' (block rate)' : ''), amount: rest * (rate - off) });
      if (o.student && hours >= BLOCK_TIERS[BLOCK_TIERS.length - 1].min) {
        const lessons = lines.reduce((s, l) => s + l.amount, 0);
        lines.push({ label: 'Student discount, ' + STUDENT_DISCOUNT * 100 + '%', amount: -Math.round(lessons * STUDENT_DISCOUNT) });
      }
      paygo = hours * rate;
      if (o.testcar) { lines.push({ label: 'Car for the road test, with warm-up', amount: TEST_CAR_PRICE }); paygo += TEST_CAR_PRICE; }
    } else {
      const c = INTENSIVES[o.course];
      hours = c.hours;
      lines.push({ label: c.name + ', road test car included', amount: c.price[o.t] });
      if (o.student) lines.push({ label: 'Student discount, ' + STUDENT_DISCOUNT * 100 + '%', amount: -Math.round(c.price[o.t] * STUDENT_DISCOUNT) });
      paygo = hours * rate + TEST_CAR_PRICE;
    }
    if (o.plus) { lines.push({ label: 'Winter & Highway, six hours', amount: PASS_PLUS_PRICE }); paygo += PASS_PLUS_PRICE; }
    const total = round2(lines.reduce((s, l) => s + l.amount, 0));
    return { lines: lines, total: total, paygo: paygo, saving: round2(paygo - total), hours: hours };
  }

  const calc = $('[data-calc]');
  if (calc) {
    const courseSel = $('[name="course"]', calc);
    courseSel.innerHTML = Object.keys(INTENSIVES).map((id) => '<option value="' + id + '">' + INTENSIVES[id].name + ' (' + plural(INTENSIVES[id].weeks, 'week') + ')</option>').join('');
    const hoursIn = $('[name="h"]', calc);
    const MAX_H = +hoursIn.max;

    // Saved choices first, then the URL (?mode=, ?t=, ?h=, ?course=) wins.
    const saved = store.get(STORE_PLAN);
    const plan = { mode: 'weekly', t: 'automatic', h: 20, course: 'i30', first: true, student: false, testcar: true, plus: false };
    if (saved && typeof saved === 'object') {
      if (saved.mode === 'weekly' || saved.mode === 'intensive') plan.mode = saved.mode;
      if (hasOwn(TRANSMISSIONS, saved.t)) plan.t = saved.t;
      if (Number.isInteger(saved.h) && saved.h >= 1 && saved.h <= MAX_H) plan.h = saved.h;
      if (hasOwn(INTENSIVES, saved.course)) plan.course = saved.course;
      ['first', 'student', 'testcar', 'plus'].forEach((k) => { if (typeof saved[k] === 'boolean') plan[k] = saved[k]; });
    }
    const pm = params.get('mode'), pt = params.get('t'), ph = parseInt(params.get('h'), 10), pc = params.get('course');
    if (pm === 'weekly' || pm === 'intensive') plan.mode = pm;
    if (hasOwn(TRANSMISSIONS, pt)) plan.t = pt;
    if (ph >= 1 && ph <= MAX_H) plan.h = ph;
    if (hasOwn(INTENSIVES, pc)) { plan.course = pc; if (!pm) plan.mode = 'intensive'; }

    $('[name="mode"][value="' + plan.mode + '"]', calc).checked = true;
    $('[name="t"][value="' + plan.t + '"]', calc).checked = true;
    hoursIn.value = plan.h;
    courseSel.value = plan.course;
    ['first', 'student', 'testcar', 'plus'].forEach((k) => { $('[name="' + k + '"]', calc).checked = plan[k]; });

    const read = () => ({
      mode: $('[name="mode"]:checked', calc).value,
      t: $('[name="t"]:checked', calc).value,
      h: +hoursIn.value,
      course: courseSel.value,
      first: $('[name="first"]', calc).checked,
      student: $('[name="student"]', calc).checked,
      testcar: $('[name="testcar"]', calc).checked,
      plus: $('[name="plus"]', calc).checked
    });
    let shareUrl = '';
    function update() {
      const o = read();
      const intensive = o.mode === 'intensive';
      $('[data-calc-weekly]').hidden = intensive;
      $('[data-calc-intensive]').hidden = !intensive;
      $('[name="first"]', calc).disabled = intensive;
      $('[name="testcar"]', calc).disabled = intensive;
      $('[data-testcar-note]').textContent = intensive ? 'Included in every course' : money(TEST_CAR_PRICE) + ', with a warm-up lesson';
      if (intensive) { o.first = false; o.testcar = false; }
      $('[data-calc-hours-out]').textContent = plural(o.h, 'hour');
      const q = quote(o);
      $('[data-calc-total]').textContent = money(q.total);
      $('[data-calc-summary]').textContent = TRANSMISSIONS[o.t].name + ', ' + (intensive ? INTENSIVES[o.course].name + ' over ' + plural(INTENSIVES[o.course].weeks, 'week') : plural(o.h, 'hour') + ' of lessons') + (q.hours ? ' · ' + money(round2((q.total - (o.plus ? PASS_PLUS_PRICE : 0)) / q.hours)) + ' an hour on average' + (intensive || o.testcar ? ', road test car included' : '') : '');
      $('[data-calc-lines]').innerHTML = q.lines.map((l) => '<li class="flex items-baseline justify-between gap-4 border-b border-dashed border-white/20 py-2.5"><span class="text-mist">' + esc(l.label) + '</span><span class="font-semibold tabular-nums ' + (l.amount < 0 ? 'text-sun' : '') + '">' + money(l.amount) + '</span></li>').join('');
      const weeks = Math.ceil(o.h / 2);
      $('[data-calc-saving]').textContent = (q.saving > 0 ? 'You save ' + money(q.saving) + ' on pay-as-you-go prices. ' : 'Pay as you go: no commitment. ') +
        (intensive ? 'Daily lessons over ' + plural(INTENSIVES[o.course].weeks, 'week') + '.' : 'At two hours a week, that’s about ' + plural(weeks, 'week') + '.');
      $('[data-calc-book]').href = 'book.html?t=' + o.t;
      const u = new URLSearchParams({ mode: o.mode, t: o.t });
      if (intensive) u.set('course', o.course); else u.set('h', String(o.h));
      shareUrl = window.location.href.split('?')[0].split('#')[0] + '?' + u.toString() + '#calculator';
      try { window.history.replaceState(null, '', '?' + u.toString() + window.location.hash); } catch (e) { /* file:// or sandboxed */ }
      store.set(STORE_PLAN, read());
    }
    calc.addEventListener('input', update);
    calc.addEventListener('change', update);
    calc.addEventListener('submit', (e) => e.preventDefault());
    update();

    const copied = $('[data-calc-copied]');
    $('[data-calc-copy]').addEventListener('click', () => {
      const done = () => { copied.textContent = 'Link copied. Send it to whoever’s helping you pay.'; };
      const fallback = () => { copied.textContent = 'Copy this link: ' + shareUrl; };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(shareUrl).then(done, fallback);
      else fallback();
    });
  }

  /* ------------------------------------------------------------------
   * 9. Instructors — filters, cards, choose (saved in STORE_INSTRUCTOR)
   * ------------------------------------------------------------------ */
  function renderChosen() {
    const id = savedInstructor();
    $$('[data-chosen-name]').forEach((el) => { el.textContent = id ? INSTRUCTORS[id].name : 'None chosen yet'; });
    $$('[data-chosen-book]').forEach((a) => { a.hidden = !id; if (id) a.href = 'book.html?i=' + id + '&t=' + INSTRUCTORS[id].t; });
    $$('[data-choose]').forEach((btn) => {
      const on = btn.getAttribute('data-choose') === id;
      btn.setAttribute('aria-pressed', String(on));
      $('[data-choose-label]', btn).textContent = on ? 'Your instructor' : 'Choose ' + INSTRUCTORS[btn.getAttribute('data-choose')].short;
    });
  }

  const list = $('[data-instructor-list]');
  if (list) {
    const areaSel = $('[data-filter-area]'), langSel = $('[data-filter-lang]');
    areaSel.insertAdjacentHTML('beforeend', Object.keys(AREAS).map((a) => '<option value="' + a + '">' + a + ' · ' + esc(AREAS[a].name) + '</option>').join(''));
    const langs = [];
    instructorList().forEach((id) => INSTRUCTORS[id].languages.forEach((l) => { if (l !== 'English' && langs.indexOf(l) === -1) langs.push(l); }));
    langSel.insertAdjacentHTML('beforeend', langs.sort().map((l) => '<option value="' + esc(l) + '">' + esc(l) + '</option>').join(''));

    const DAY_LETTERS = [1, 2, 3, 4, 5, 6, 0];
    list.innerHTML = instructorList().map((id) => {
      const ins = INSTRUCTORS[id], nx = nextFree({ instructor: id }, 60);
      return '<li id="' + id + '" class="reveal card flex flex-col overflow-hidden" data-instructor="' + id + '">' +
        '<div class="grid gap-5 p-6 sm:grid-cols-[8rem_1fr] sm:p-7">' + portrait(id, 'size-28 rounded-full bg-cloud sm:size-32') +
        '<div class="min-w-0"><p class="text-sm text-slate">' + esc(ins.role) + '</p><h3 class="mt-1 font-display text-2xl font-bold text-route">' + esc(ins.name) + '</h3>' +
        '<ul class="mt-3 flex flex-wrap gap-2"><li class="badge ' + (ins.t === 'manual' ? 'badge-night' : 'badge-sun') + '">' + TRANSMISSIONS[ins.t].name + '</li>' + ins.good.map((g) => '<li class="badge badge-teal">' + esc(g) + '</li>').join('') + '</ul>' +
        '<p class="mt-4 text-slate">' + esc(ins.bio) + '</p></div></div>' +
        '<div class="grid gap-5 border-t border-line bg-cloud/60 p-6 sm:grid-cols-[12rem_1fr] sm:p-7">' +
        '<div><div class="rounded-2xl bg-white p-2">' + carSvg(ins.car, ins.car.label + ' with a student-driver sign') + '</div><p class="mt-2 text-xs text-slate">' + esc(ins.car.label) + ' · ' + esc(ins.car.fuel) + ' · dual controls</p></div>' +
        '<dl class="min-w-0 text-sm">' +
        '<div class="spec-row"><dt>Areas</dt><dd>' + ins.areas.join(', ') + '</dd></div>' +
        '<div class="spec-row"><dt>Teaches in</dt><dd>' + esc(ins.languages.join(', ')) + '</dd></div>' +
        '<div class="spec-row"><dt>First-time passes</dt><dd>' + ins.firstTime + '%</dd></div>' +
        '<div class="spec-row items-center"><dt>Days</dt><dd><span class="sr-only">' + esc(ins.days.map((d) => DAY_LONG[d]).join(', ')) + ', ' + clock(toMin(ins.hours[0])) + ' to ' + clock(toMin(ins.hours[1])) + '</span><span class="flex flex-wrap justify-end gap-1" aria-hidden="true">' +
        DAY_LETTERS.map((d) => '<span class="grid size-7 place-items-center rounded-full text-xs font-bold ' + (ins.days.indexOf(d) !== -1 ? 'bg-route text-white' : 'bg-white text-slate') + '">' + DAY[d].charAt(0) + '</span>').join('') + '</span></dd></div>' +
        '<div class="spec-row"><dt>Hours</dt><dd>' + clock(toMin(ins.hours[0])) + '–' + clock(toMin(ins.hours[1])) + '</dd></div>' +
        '<div class="spec-row"><dt>Next free</dt><dd class="text-go">' + (nx ? shortDate(nx.key) + ', ' + clock(nx.mins) : 'Call the office') + '</dd></div></dl></div>' +
        '<div class="mt-auto flex flex-wrap gap-3 p-6 pt-0 sm:px-7 sm:pb-7">' +
        '<button type="button" class="btn-ghost btn-sm aria-pressed:bg-route aria-pressed:text-white" aria-pressed="false" data-choose="' + id + '">' +
        '<svg viewBox="0 0 24 24" class="size-4" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg><span data-choose-label>Choose ' + esc(ins.short) + '</span></button>' +
        '<a class="btn-sun btn-sm" href="book.html?i=' + id + '&amp;t=' + ins.t + '">Book with ' + esc(ins.short) + '</a></div></li>';
    }).join('');

    const tBtns = $$('[data-filter-t] [data-t]');
    let tFilter = 'all';
    const pt = params.get('t');
    if (hasOwn(TRANSMISSIONS, pt)) tFilter = pt;
    const pa = params.get('area');
    if (hasOwn(AREAS, pa)) areaSel.value = pa;
    function filter() {
      let shown = 0;
      tBtns.forEach((b) => b.setAttribute('aria-pressed', String(b.getAttribute('data-t') === tFilter)));
      $$('[data-instructor]', list).forEach((li) => {
        const ins = INSTRUCTORS[li.getAttribute('data-instructor')];
        const ok = (tFilter === 'all' || ins.t === tFilter) &&
          (areaSel.value === 'all' || ins.areas.indexOf(areaSel.value) !== -1) &&
          (langSel.value === 'all' || ins.languages.indexOf(langSel.value) !== -1);
        li.hidden = !ok;
        if (ok) shown++;
      });
      $('[data-instructor-count]').textContent = shown === instructorList().length ? 'All ' + shown + ' instructors' : plural(shown, 'instructor') + ' match' + (shown === 1 ? 'es' : '');
      $('[data-instructor-empty]').hidden = shown > 0;
    }
    tBtns.forEach((b) => b.addEventListener('click', () => { tFilter = b.getAttribute('data-t'); filter(); }));
    areaSel.addEventListener('change', filter);
    langSel.addEventListener('change', filter);
    $('[data-filter-reset]').addEventListener('click', () => { tFilter = 'all'; areaSel.value = 'all'; langSel.value = 'all'; filter(); });
    list.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-choose]');
      if (!btn) return;
      const id = btn.getAttribute('data-choose');
      if (savedInstructor() === id) store.remove(STORE_INSTRUCTOR); else store.set(STORE_INSTRUCTOR, id);
      renderChosen();
    });
    filter();
  }
  renderChosen();

  /* ------------------------------------------------------------------
   * 10. Booking — week view of free times, then a booking request
   * ------------------------------------------------------------------ */
  const booking = $('[data-booking]');
  if (booking) {
    const st = { t: 'automatic', d: 120, instructor: 'any', area: null, postcode: null, week: 0, slot: null };
    const insSel = $('[name="instructor"]', booking), pcInput = $('[name="postcode"]', booking), pcOut = $('[data-postcode-result]', booking);
    const weekEl = $('[data-week]');
    // The week view shows seven days at a time, starting tomorrow.
    const maxWeek = Math.floor((BOOK_AHEAD_DAYS - 1) / 7);
    const weekIndex = (key) => Math.min(maxWeek, Math.max(0, Math.floor(daysBetween(FIRST_BOOKABLE, key) / 7)));

    // URL: ?i=, ?t=, ?d=, ?slot=YYYY-MM-DDTHH:MM, ?postcode=; then the saved instructor.
    const pi = params.get('i'), ptr = params.get('t'), pd = params.get('d'), ps = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})$/.exec(params.get('slot') || '');
    const saved = savedInstructor();
    if (hasOwn(TRANSMISSIONS, ptr)) st.t = ptr;
    if (hasOwn(LESSON_LENGTHS, pd)) st.d = +pd;
    if (hasOwn(INSTRUCTORS, pi)) { st.instructor = pi; st.t = INSTRUCTORS[pi].t; }
    else if (saved && !hasOwn(TRANSMISSIONS, ptr)) { st.instructor = saved; st.t = INSTRUCTORS[saved].t; }
    $('[name="t"][value="' + st.t + '"]', booking).checked = true;
    $('[name="d"][value="' + st.d + '"]', booking).checked = true;

    function filterNow() { return { t: st.t, area: st.area, instructor: st.instructor }; }
    function fillInstructors() {
      const opts = instructorList().filter((id) => INSTRUCTORS[id].t === st.t);
      if (st.instructor !== 'any' && opts.indexOf(st.instructor) === -1) st.instructor = 'any';
      insSel.innerHTML = '<option value="any">Whoever is free first</option>' + opts.map((id) => {
        const ins = INSTRUCTORS[id], covers = !st.area || ins.areas.indexOf(st.area) !== -1;
        return '<option value="' + id + '"' + (covers ? '' : ' disabled') + '>' + esc(ins.name) + (covers ? ' · ' + ins.areas.join(', ') : ' · doesn’t cover ' + st.area) + '</option>';
      }).join('');
      if (st.instructor !== 'any' && st.area && INSTRUCTORS[st.instructor].areas.indexOf(st.area) === -1) st.instructor = 'any';
      insSel.value = st.instructor;
      const n = eligible({ t: st.t, area: st.area }).length;
      $('[data-instructor-hint]').textContent = plural(n, 'instructor') + ' teach' + (n === 1 ? 'es' : '') + ' in ' + (/^[aeiou]/.test(st.t) ? 'an ' : 'a ') + st.t + ' car' + (st.area ? ' in ' + st.area : '') + '.';
    }
    // Jump to the week with the next free time for the current choices.
    function weekOfNext() {
      const nx = nextFree(filterNow(), st.d);
      return nx ? weekIndex(nx.key) : 0;
    }
    function slotValid() {
      if (!st.slot) return false;
      const s = slotsOn(st.slot.key, filterNow(), st.d).find((x) => x.mins === st.slot.mins);
      if (!s) return false;
      if (s.ids.indexOf(st.slot.id) === -1) st.slot.id = pickInstructor(s.ids, filterNow());
      return true;
    }
    function renderWeek() {
      const mon = addDays(FIRST_BOOKABLE, st.week * 7), sun = addDays(mon, 6);
      $('[data-week-label]').textContent = shortDate(mon) + ' – ' + shortDate(sun);
      $('[data-week-prev]').disabled = st.week <= 0;
      $('[data-week-next]').disabled = st.week >= maxWeek;
      let total = 0;
      const f = filterNow();
      weekEl.innerHTML = [0, 1, 2, 3, 4, 5, 6].map((i) => {
        const k = addDays(mon, i), d = dateOfKey(k);
        const head = '<p class="week-head"><span class="block font-semibold text-route">' + DAY[d.getUTCDay()] + '</span><span class="block text-xs text-slate">' + MONTH[d.getUTCMonth()] + ' ' + d.getUTCDate() + '</span></p>';
        let note = '';
        if (k < FIRST_BOOKABLE) note = k === TODAY ? 'Today' : 'Past';
        else if (k > LAST_BOOKABLE) note = 'Opens later';
        else if (weekday(k) === 0) note = 'No lessons';
        else if (closedReason(k)) note = closedReason(k);
        if (note) return '<div class="week-day" data-off>' + head + '<p class="slot-none">' + esc(note) + '</p></div>';
        const slots = slotsOn(k, f, st.d);
        total += slots.length;
        if (!slots.length) return '<div class="week-day">' + head + '<p class="slot-none">No free times</p></div>';
        return '<div class="week-day">' + head + '<div class="week-slots">' + slots.map((s) => {
          const id = pickInstructor(s.ids, f), on = !!(st.slot && st.slot.key === k && st.slot.mins === s.mins);
          return '<button type="button" class="slot" aria-pressed="' + on + '" data-key="' + k + '" data-mins="' + s.mins + '" data-id="' + id + '" aria-label="' + longDate(k) + ', ' + clock(s.mins) + ' with ' + esc(INSTRUCTORS[id].name) + '">' + clock(s.mins) + '</button>';
        }).join('') + '</div></div>';
      }).join('');
      const nx = total ? null : nextFree(f, st.d);
      $('[data-week-summary]').innerHTML = total
        ? plural(total, 'free start time') + ' in these seven days for a ' + LESSON_ADJ[st.d] + ' ' + st.t + ' lesson' + (st.instructor !== 'any' ? ' with ' + esc(INSTRUCTORS[st.instructor].short) : '') + '. Lessons can be booked from tomorrow, up to four weeks ahead.'
        : 'No free times in these seven days for these choices.' + (nx ? ' <button type="button" class="text-link" data-jump-next>Next free: ' + whenText(nx.key, nx.mins) + '</button>' : ' Try another instructor or lesson length, or call ' + SCHOOL.phone + '.');
    }
    function summary() {
      const set = (k, v) => { $('[data-sum="' + k + '"]').textContent = v; };
      set('area', st.postcode ? st.postcode : 'ZIP code not checked');
      set('lesson', TRANSMISSIONS[st.t].name + ', ' + LESSON_LENGTHS[st.d]);
      set('instructor', st.slot ? INSTRUCTORS[st.slot.id].name : st.instructor === 'any' ? 'Whoever is free first' : INSTRUCTORS[st.instructor].name);
      set('when', st.slot ? shortDate(st.slot.key) + ', ' + clock(st.slot.mins) + '–' + clock(st.slot.mins + st.d) : 'Not picked yet');
      set('price', money(lessonPrice()));
    }
    function lessonPrice() {
      const h = st.d / 60, rate = TRANSMISSIONS[st.t].rate;
      const first = $('[name="first"]', booking).checked ? Math.min(FIRST_HOURS, h) : 0;
      return first * FIRST_RATE + (h - first) * rate;
    }
    function refresh(jump) {
      fillInstructors();
      if (!slotValid()) st.slot = null;
      if (jump) st.week = st.slot ? weekIndex(st.slot.key) : weekOfNext();
      renderWeek();
      summary();
    }

    // A slot from the URL is kept only if it is still free with these choices.
    if (ps && validKey(ps[1]) && +ps[2] < 24 && +ps[3] < 60) {
      const mins = +ps[2] * 60 + +ps[3];
      const s = slotsOn(ps[1], filterNow(), st.d).find((x) => x.mins === mins);
      if (s) st.slot = { key: ps[1], mins: mins, id: pickInstructor(s.ids, filterNow()) };
    }

    function checkPostcode(focusOnError) {
      const pc = parsePostcode(pcInput.value);
      if (!pc) { setError(booking, 'postcode', POSTCODE_ERROR); pcOut.innerHTML = ''; if (focusOnError) pcInput.focus(); return null; }
      setError(booking, 'postcode', '');
      pcInput.value = pc.text;
      const c = coverage(pc);
      pcOut.innerHTML = coverageHtml(c, false);
      st.area = c.status === 'covered' ? c.outward : null;
      st.postcode = c.status === 'covered' ? pc.text : null;
      refresh(true);
      return c;
    }
    $('[data-postcode-check]').addEventListener('click', () => checkPostcode(true));
    pcInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); checkPostcode(true); } });
    pcInput.addEventListener('input', () => { if (pcInput.getAttribute('aria-invalid') === 'true') setError(booking, 'postcode', ''); });
    const ppc = params.get('postcode');
    if (ppc && parsePostcode(ppc)) { pcInput.value = ppc; }

    $$('[name="t"]', booking).forEach((r) => r.addEventListener('change', () => { st.t = r.value; refresh(true); }));
    $$('[name="d"]', booking).forEach((r) => r.addEventListener('change', () => { st.d = +r.value; refresh(true); }));
    insSel.addEventListener('change', () => {
      st.instructor = hasOwn(INSTRUCTORS, insSel.value) ? insSel.value : 'any';
      if (st.instructor === 'any') store.remove(STORE_INSTRUCTOR); else store.set(STORE_INSTRUCTOR, st.instructor);
      refresh(true);
    });
    $('[name="first"]', booking).addEventListener('change', summary);
    $('[data-week-prev]').addEventListener('click', () => { if (st.week > 0) { st.week--; renderWeek(); } });
    $('[data-week-next]').addEventListener('click', () => { if (st.week < maxWeek) { st.week++; renderWeek(); } });
    weekEl.addEventListener('click', (e) => {
      const b = e.target.closest('.slot');
      if (!b) return;
      st.slot = { key: b.getAttribute('data-key'), mins: +b.getAttribute('data-mins'), id: b.getAttribute('data-id') };
      $$('.slot', weekEl).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      setError(booking, 'slot', '');
      summary();
    });
    $('[data-week-summary]').addEventListener('click', (e) => {
      if (!e.target.closest('[data-jump-next]')) return;
      st.week = weekOfNext();
      renderWeek();
      const first = $('.slot', weekEl);
      if (first) first.focus();
    });

    if (ppc && parsePostcode(ppc)) checkPostcode(false); else refresh(true);

    // To connect a real booking system, send the request in the submit handler below (for example
    // fetch() to Formspree or your booking API, with the slot fields added to the FormData) and show
    // the confirmation only when it answers OK.
    booking.addEventListener('submit', (e) => {
      e.preventDefault();
      let ok = true;
      const c = parsePostcode(pcInput.value) ? coverage(parsePostcode(pcInput.value)) : null;
      if (!c) ok = setError(booking, 'postcode', POSTCODE_ERROR) && ok;
      else if (c.status !== 'covered') ok = setError(booking, 'postcode', 'We don’t pick up from ' + c.outward + ' for weekly lessons. Call ' + SCHOOL.phone + ' and we’ll find a way.') && ok;
      else if (st.area !== c.outward) checkPostcode(false);
      if (!st.slot) {
        $('[data-error="slot"]').textContent = 'Pick a free time from the week view.';
        ok = false;
      }
      const name = $('[name="name"]', booking).value.trim(), phone = $('[name="phone"]', booking).value.trim(), email = $('[name="email"]', booking).value.trim();
      ok = setError(booking, 'name', name.length >= 2 ? '' : 'Enter your name.') && ok;
      ok = setError(booking, 'phone', validPhone(phone) ? '' : 'Enter a 10-digit US cell number, like (715) 555-0199.') && ok;
      ok = setError(booking, 'email', EMAIL.test(email) ? '' : 'Enter an email address, like sam@example.com.') && ok;
      const lic = $('[name="licence"]:checked', booking);
      ok = setError(booking, 'licence', lic ? '' : 'Tell us whether you have your instruction permit.') && ok;
      if (!ok) {
        const bad = $('[aria-invalid="true"]', booking);
        if (bad) bad.focus(); else if (!st.slot) weekEl.scrollIntoView({ block: 'center' });
        return;
      }
      const ins = INSTRUCTORS[st.slot.id], first = name.split(/\s+/)[0];
      $('[data-done-title]').textContent = 'Thanks, ' + first + '. We’ve got your request.';
      $('[data-done-ref]').textContent = reference(name + st.slot.key + st.slot.mins);
      const row = (k, v) => '<div class="spec-row"><dt>' + k + '</dt><dd>' + esc(v) + '</dd></div>';
      $('[data-done-summary]').innerHTML = row('When', longDate(st.slot.key) + ', ' + st.slot.key.slice(0, 4) + ', ' + clock(st.slot.mins) + ' to ' + clock(st.slot.mins + st.d)) +
        row('Lesson', TRANSMISSIONS[st.t].name + ', ' + LESSON_LENGTHS[st.d]) + row('Instructor', ins.name) + row('Pick-up', pcInput.value) + row('Price', money(lessonPrice()) + ', paid at the end of the lesson');
      $('[data-done-next]').innerHTML = [
        ins.short + ' will text ' + esc(phone) + ' within one business day to confirm the time and the exact pick-up point.',
        lic.value === 'have' ? 'Bring your instruction permit: ' + ins.short + ' checks it before you drive.' : 'You need your instruction permit in hand before the lesson. Call us to move it if you don’t have it yet.',
        'Need to change it? Move or cancel free of charge up to 48 hours before on ' + SCHOOL.phone + '.'
      ].map((t) => '<li>' + t + '</li>').join('');
      $('[data-booking-wrap]').hidden = true;
      $('[data-booking-done]').hidden = false;
      const panel = $('[data-booking-done-panel]');
      panel.scrollIntoView({ block: 'start', behavior: reduceMotion ? 'auto' : 'smooth' });
      panel.focus({ preventScroll: true });
    });
    ['name', 'phone', 'email'].forEach((n) => $('[name="' + n + '"]', booking).addEventListener('input', (ev) => { if (ev.target.getAttribute('aria-invalid') === 'true') setError(booking, n, ''); }));
    $$('[name="licence"]', booking).forEach((r) => r.addEventListener('change', () => setError(booking, 'licence', '')));
  }

  /* ------------------------------------------------------------------
   * 11. Permit test quiz — best scores saved in STORE_QUIZ
   * ------------------------------------------------------------------ */
  const QUIZ_MODES = { quick: { name: 'Quick ten', size: 10 }, full: { name: 'All ' + QUESTIONS.length, size: QUESTIONS.length } };
  const PASS_SHARE = 0.8; // the Wisconsin knowledge test's passing score: 40 out of 50
  // Best-score keys: a mode ("quick", "full") or "topic-<id>".
  function bestKeyValid(k) { return hasOwn(QUIZ_MODES, k) || (typeof k === 'string' && k.indexOf('topic-') === 0 && hasOwn(TOPICS, k.slice(6))); }
  function readBest() {
    const raw = store.get(STORE_QUIZ), out = {};
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return out;
    Object.keys(raw).forEach((k) => {
      const v = raw[k];
      if (bestKeyValid(k) && v && Number.isInteger(v.score) && Number.isInteger(v.total) && v.total > 0 && v.total <= QUESTIONS.length && v.score >= 0 && v.score <= v.total && validKey(v.date)) out[k] = { score: v.score, total: v.total, date: v.date };
    });
    return out;
  }
  const bestLabel = (k) => (hasOwn(QUIZ_MODES, k) ? QUIZ_MODES[k].name : TOPICS[k.slice(6)]);
  function renderBest() {
    const best = readBest();
    $$('[data-quiz-best]').forEach((dl) => {
      const keys = Object.keys(QUIZ_MODES).concat(Object.keys(best).filter((k) => !hasOwn(QUIZ_MODES, k)));
      dl.innerHTML = keys.map((k) => '<div class="spec-row"><dt>' + esc(bestLabel(k)) + '</dt><dd>' + (best[k] ? best[k].score + ' out of ' + best[k].total + '<span class="block text-xs font-normal text-mist">' + ago(best[k].date) + '</span>' : 'Not tried yet') + '</dd></div>').join('');
    });
    const home = $('[data-quiz-best-home]');
    if (home && best.quick) home.textContent = 'Your best Quick ten score: ' + best.quick.score + ' out of 10. Can you beat it?';
  }
  renderBest();

  const quiz = $('[data-quiz]');
  if (quiz) {
    const topicSel = $('[data-quiz-topic]');
    topicSel.insertAdjacentHTML('beforeend', Object.keys(TOPICS).map((t) => {
      const n = QUESTIONS.filter((q) => q.topic === t).length;
      return '<option value="' + t + '">' + esc(TOPICS[t]) + ' (' + plural(n, 'question') + ')</option>';
    }).join(''));
    const ptopic = params.get('topic'), pmode = params.get('mode');
    if (hasOwn(TOPICS, ptopic)) topicSel.value = ptopic;
    if (hasOwn(QUIZ_MODES, pmode)) $('[name="quiz-mode"][value="' + pmode + '"]', quiz).checked = true;

    const startEl = $('[data-quiz-start]'), runEl = $('[data-quiz-run]'), endEl = $('[data-quiz-end]');
    const optsEl = $('[data-quiz-options]'), fb = $('[data-quiz-feedback]');
    const checkBtn = $('[data-quiz-check]'), nextBtn = $('[data-quiz-next]');
    const run = { list: [], i: 0, answers: [], score: 0, key: 'quick' };

    function shuffle(arr) {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; }
      return a;
    }
    function show(el) { [startEl, runEl, endEl].forEach((x) => { x.hidden = x !== el; }); }
    function begin() {
      const mode = $('[name="quiz-mode"]:checked', quiz).value, topic = topicSel.value;
      const pool = QUESTIONS.map((q, i) => i).filter((i) => topic === 'all' || QUESTIONS[i].topic === topic);
      run.list = shuffle(pool).slice(0, topic === 'all' ? QUIZ_MODES[mode].size : pool.length);
      run.i = 0; run.answers = []; run.score = 0;
      run.key = topic === 'all' ? mode : 'topic-' + topic;
      show(runEl);
      renderQuestion();
    }
    function renderQuestion() {
      const q = QUESTIONS[run.list[run.i]], n = run.list.length;
      $('[data-quiz-progress-text]').textContent = 'Question ' + (run.i + 1) + ' of ' + n;
      $('[data-quiz-bar]').style.width = (run.i / n * 100) + '%';
      $('[data-quiz-q-topic]').textContent = TOPICS[q.topic];
      const legend = $('[data-quiz-question]');
      legend.textContent = q.q;
      optsEl.innerHTML = q.options.map((o, i) => '<label class="opt"><input type="radio" name="quiz-answer" value="' + i + '"><span class="opt-key" aria-hidden="true">' + 'ABCD'.charAt(i) + '</span><span class="pt-1">' + esc(o) + '</span></label>').join('');
      fb.hidden = true; fb.className = 'mt-5 rounded-2xl p-4'; fb.innerHTML = '';
      checkBtn.hidden = false; checkBtn.disabled = true;
      nextBtn.hidden = true;
      $('[data-quiz-score-live]').textContent = 'Score: ' + run.score + ' of ' + run.i;
      if (run.i > 0) legend.focus();
    }
    optsEl.addEventListener('change', () => { checkBtn.disabled = false; });
    checkBtn.addEventListener('click', () => {
      const picked = $('[name="quiz-answer"]:checked', optsEl);
      if (!picked) return;
      const q = QUESTIONS[run.list[run.i]], a = +picked.value, right = a === q.answer;
      run.answers.push(a);
      if (right) run.score++;
      $$('.opt', optsEl).forEach((lab, i) => {
        $('input', lab).disabled = true;
        if (i === q.answer) lab.setAttribute('data-state', 'right');
        else if (i === a) lab.setAttribute('data-state', 'wrong');
      });
      fb.hidden = false;
      fb.className = 'mt-5 rounded-2xl p-4 ' + (right ? 'bg-go-soft' : 'bg-stop-soft');
      fb.innerHTML = '<p class="font-display font-semibold ' + (right ? 'text-go' : 'text-stop') + '">' + (right ? 'Correct.' : 'Not quite. The answer is ' + 'ABCD'.charAt(q.answer) + ': ' + esc(q.options[q.answer]) + '.') + '</p><p class="mt-1 text-ink">' + esc(q.why) + '</p>';
      checkBtn.hidden = true;
      nextBtn.hidden = false;
      nextBtn.textContent = run.i + 1 < run.list.length ? 'Next question' : 'See my result';
      $('[data-quiz-score-live]').textContent = 'Score: ' + run.score + ' of ' + (run.i + 1);
      nextBtn.focus();
    });
    nextBtn.addEventListener('click', () => {
      run.i++;
      if (run.i < run.list.length) renderQuestion(); else finish();
    });
    $('[data-quiz-quit]').addEventListener('click', () => { if (run.answers.length) { run.list = run.list.slice(0, run.answers.length); finish(); } else show(startEl); });

    function ring(score, total) {
      const r = 64, c = 2 * Math.PI * r, share = total ? score / total : 0;
      return '<svg viewBox="0 0 160 160" class="size-40 -rotate-90" aria-hidden="true"><circle cx="80" cy="80" r="' + r + '" fill="none" stroke="#f1f6f8" stroke-width="16"/>' +
        '<circle cx="80" cy="80" r="' + r + '" fill="none" stroke="' + (share >= PASS_SHARE ? '#17734a' : '#ffc531') + '" stroke-width="16" stroke-linecap="round" stroke-dasharray="' + (c * share).toFixed(1) + ' ' + c.toFixed(1) + '"/></svg>' +
        '<p class="absolute inset-0 grid place-items-center text-center font-display"><span><span class="block text-4xl font-bold text-route">' + Math.round(share * 100) + '%</span><span class="block text-xs text-slate">' + score + ' of ' + total + '</span></span></p>';
    }
    let wrongOnly = false;
    function renderReview() {
      $('[data-quiz-review]').innerHTML = run.list.map((qi, n) => {
        const q = QUESTIONS[qi], a = run.answers[n], right = a === q.answer;
        if (wrongOnly && right) return '';
        return '<li class="rounded-2xl border-2 p-5 ' + (right ? 'border-go/30' : 'border-stop/30') + '"><p class="flex items-start gap-3"><span class="badge shrink-0 ' + (right ? 'badge-go' : 'bg-stop-soft text-stop') + '">' + (right ? 'Right' : 'Missed') + '</span><span class="font-display font-semibold">' + esc(q.q) + '</span></p>' +
          (right ? '' : '<p class="mt-3 text-sm"><span class="text-slate">Your answer:</span> ' + esc(q.options[a]) + '</p>') +
          '<p class="mt-1 text-sm"><span class="text-slate">Right answer:</span> <strong>' + esc(q.options[q.answer]) + '</strong></p><p class="mt-2 text-sm text-slate">' + esc(q.why) + '</p></li>';
      }).join('') || '<li class="rounded-2xl bg-go-soft p-5 font-display font-semibold text-go">You didn’t miss any. Nice driving.</li>';
    }
    function finish() {
      const total = run.list.length, score = run.score, share = total ? score / total : 0;
      const best = readBest(), prev = best[run.key];
      const isBest = total > 0 && (!prev || score / total > prev.score / prev.total || (score / total === prev.score / prev.total && total >= prev.total));
      if (isBest) { best[run.key] = { score: score, total: total, date: TODAY }; store.set(STORE_QUIZ, best); }
      show(endEl);
      $('[data-quiz-bar]').style.width = '100%';
      $('[data-quiz-ring]').innerHTML = ring(score, total);
      const title = $('[data-quiz-result-title]');
      title.textContent = share >= PASS_SHARE ? 'That’s a passing score.' : share >= 0.6 ? 'Getting there.' : 'Keep practicing.';
      $('[data-quiz-result-text]').textContent = 'You scored ' + score + ' out of ' + total + '. ' +
        (share >= PASS_SHARE ? 'The Wisconsin knowledge test needs 40 out of 50, or 80%.' : 'The Wisconsin knowledge test needs 80% (40 out of 50). Read the explanations below and try again.') +
        (isBest ? (prev ? ' A new best for ' + bestLabel(run.key) + '!' : ' Saved as your best for ' + bestLabel(run.key) + '.') : ' Your best for ' + bestLabel(run.key) + ' is still ' + prev.score + ' out of ' + prev.total + '.');
      wrongOnly = false;
      $('[data-quiz-wrong-only]').setAttribute('aria-pressed', 'false');
      renderReview();
      renderBest();
      title.focus();
    }
    $('[data-quiz-wrong-only]').addEventListener('click', (e) => {
      wrongOnly = !wrongOnly;
      e.currentTarget.setAttribute('aria-pressed', String(wrongOnly));
      renderReview();
    });
    $('[data-quiz-begin]').addEventListener('click', begin);
    $('[data-quiz-again]').addEventListener('click', () => { show(startEl); $('[data-quiz-begin]').focus(); });
    $('[data-quiz-reset]').addEventListener('click', () => { store.remove(STORE_QUIZ); renderBest(); });
  }

  /* ------------------------------------------------------------------
   * 12. Areas — district buttons, map highlight, panel
   * ------------------------------------------------------------------ */
  const districtBtns = $('[data-district-buttons]');
  if (districtBtns) {
    const panel = $('[data-district-panel]'), map = $('[data-area-map]');
    districtBtns.innerHTML = Object.keys(AREAS).map((a) => '<button type="button" class="chip" aria-pressed="false" data-pick-district="' + a + '">' + a + '</button>').join('');
    function pick(a) {
      $$('[data-pick-district]', districtBtns).forEach((b) => b.setAttribute('aria-pressed', String(b.getAttribute('data-pick-district') === a)));
      $$('[data-district]', map).forEach((el) => { if (el.getAttribute('data-district') === a) el.setAttribute('data-active', ''); else el.removeAttribute('data-active'); });
      const area = AREAS[a], ids = eligible({ area: a });
      panel.innerHTML = '<p class="font-display text-sm font-semibold text-teal">' + a + '</p><h3 class="mt-1 font-display text-2xl font-bold text-route">' + esc(area.name) + '</h3>' +
        '<p class="mt-2 text-slate">' + esc(area.places.join(', ')) + '</p>' +
        '<h4 class="mt-5 font-display text-sm font-semibold text-ink">' + plural(ids.length, 'instructor') + ' teach' + (ids.length === 1 ? 'es' : '') + ' here</h4><ul class="mt-3 grid gap-3">' +
        ids.map((id) => {
          const ins = INSTRUCTORS[id], nx = nextFree({ instructor: id }, 60);
          return '<li class="flex items-center gap-3">' + portrait(id, 'size-11 shrink-0 rounded-full bg-cloud') + '<span class="min-w-0 text-sm"><a href="instructors.html#' + id + '" class="text-link">' + esc(ins.name) + '</a><span class="block text-slate">' + TRANSMISSIONS[ins.t].name + (nx ? ' · next free ' + shortDate(nx.key) + ', ' + clock(nx.mins) : '') + '</span></span></li>';
        }).join('') + '</ul><a href="book.html?postcode=' + a + '" class="btn-sun btn-sm mt-6">Book from ' + a + '</a>';
    }
    districtBtns.addEventListener('click', (e) => { const b = e.target.closest('[data-pick-district]'); if (b) pick(b.getAttribute('data-pick-district')); });
    document.addEventListener('steer:postcode', (e) => {
      const c = e.detail;
      $$('.map-pill', map).forEach((g) => g.removeAttribute('data-active'));
      if (c.status === 'covered') pick(c.outward);
      else if (c.status === 'nearby') {
        const pill = $$('.map-pill', map).find((g) => $('text', g).textContent.indexOf(c.outward + ' ') === 0);
        if (pill) pill.setAttribute('data-active', '');
      }
    });
    const pa = params.get('area');
    pick(hasOwn(AREAS, pa) ? pa : '54701');
  }

  /* ------------------------------------------------------------------
   * 13. Passes wall — filters and stats
   * ------------------------------------------------------------------ */
  const wall = $('[data-pass-wall]');
  if (wall) {
    const insSel = $('[data-pass-instructor]'), tBtns = $$('[data-pass-t] [data-t]'), firstBtn = $('[data-pass-first]');
    insSel.insertAdjacentHTML('beforeend', instructorList().map((id) => '<option value="' + id + '">' + esc(INSTRUCTORS[id].name) + '</option>').join(''));
    const pi = params.get('i');
    if (hasOwn(INSTRUCTORS, pi)) insSel.value = pi;
    let tFilter = 'all', firstOnly = false;
    function stats(rows) {
      const set = (k, v) => { const el = $('[data-pass-stat="' + k + '"]'); if (el) el.textContent = v; };
      set('count', String(rows.length));
      set('first', rows.length ? Math.round(rows.filter((p) => p.first).length / rows.length * 100) + '%' : '–');
      set('minors', rows.length ? (rows.reduce((s, p) => s + p.minors, 0) / rows.length).toFixed(1) : '–');
      set('latest', rows.length ? rows[0].name + ', ' + ago(rows[0].date) : '–');
    }
    function render() {
      tBtns.forEach((b) => b.setAttribute('aria-pressed', String(b.getAttribute('data-t') === tFilter)));
      firstBtn.setAttribute('aria-pressed', String(firstOnly));
      const rows = passes.filter((p) => (tFilter === 'all' || p.t === tFilter) && (insSel.value === 'all' || p.instructor === insSel.value) && (!firstOnly || p.first));
      wall.innerHTML = rows.map(passCard).join('');
      $$('.reveal', wall).forEach((el) => el.classList.add('is-visible'));
      $('[data-pass-count]').textContent = plural(rows.length, 'pass', 'passes') + (rows.length === passes.length ? ' on the wall' : ' match');
      $('[data-pass-empty]').hidden = rows.length > 0;
    }
    tBtns.forEach((b) => b.addEventListener('click', () => { tFilter = b.getAttribute('data-t'); render(); }));
    insSel.addEventListener('change', render);
    firstBtn.addEventListener('click', () => { firstOnly = !firstOnly; render(); });
    $('[data-pass-reset]').addEventListener('click', () => { tFilter = 'all'; firstOnly = false; insSel.value = 'all'; render(); });
    stats(passes);
    render();
  }

  /* ------------------------------------------------------------------
   * 14. FAQ — live search with highlighted matches
   * ------------------------------------------------------------------ */
  const faqSearch = $('[data-faq-search]');
  if (faqSearch) {
    const items = $$('[data-faq]'), groups = $$('[data-faq-group]');
    const originals = items.map((d) => d.innerHTML);
    const status = $('[data-faq-status]');
    const defaultStatus = plural(items.length, 'question') + ' in ' + groups.length + ' groups.';
    function highlight(root, words) {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      const re = new RegExp('(' + words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')', 'gi');
      nodes.forEach((n) => {
        if (!re.test(n.nodeValue)) return;
        re.lastIndex = 0;
        const span = document.createElement('span');
        span.innerHTML = esc(n.nodeValue).replace(re, '<mark>$1</mark>');
        n.parentNode.replaceChild(span, n);
      });
    }
    function search() {
      const q = faqSearch.value.trim().toLowerCase().slice(0, 80);
      const words = q.split(/\s+/).filter(Boolean);
      let shown = 0;
      items.forEach((d, i) => {
        d.innerHTML = originals[i];
        const ok = !words.length || words.every((w) => d.textContent.toLowerCase().indexOf(w) !== -1);
        d.hidden = !ok;
        if (ok) shown++;
        if (ok && words.length) { d.open = true; highlight(d, words); } else if (!words.length) d.open = false;
      });
      groups.forEach((g) => { g.hidden = !$$('[data-faq]', g).some((d) => !d.hidden); });
      $('[data-faq-empty]').hidden = shown > 0;
      status.textContent = !words.length ? defaultStatus : shown ? plural(shown, 'question') + ' match' + (shown === 1 ? 'es' : '') + ' “' + q + '”.' : 'Nothing matches “' + q + '”.';
    }
    faqSearch.addEventListener('input', search);
    $('[data-faq-form]').addEventListener('submit', (e) => e.preventDefault());
    status.textContent = defaultStatus;
    const pq = params.get('q');
    if (pq) { faqSearch.value = pq.slice(0, 80); search(); }
  }

  /* ------------------------------------------------------------------
   * 15. Contact — office status, today's hours, the contact form
   * ------------------------------------------------------------------ */
  const officeText = $('[data-office-status-text]');
  if (officeText) {
    const h = OFFICE_HOURS[NOW.day], closed = closedReason(TODAY);
    if (h && !closed && NOW.mins >= toMin(h[0]) && NOW.mins < toMin(h[1])) {
      officeText.textContent = 'Office open now, until ' + clock(toMin(h[1]));
      $('[data-office-status] span').className = 'size-2.5 rounded-full bg-go-soft ring-4 ring-go/40';
    } else {
      for (let i = 0; i < 14; i++) {
        const k = addDays(TODAY, i), oh = OFFICE_HOURS[weekday(k)];
        if (!oh || closedReason(k) || (i === 0 && NOW.mins >= toMin(oh[0]))) continue;
        officeText.textContent = 'Office opens ' + (i === 0 ? 'today' : i === 1 ? 'tomorrow' : DAY_LONG[weekday(k)]) + ' at ' + clock(toMin(oh[0])) + '. Leave a message any time.';
        break;
      }
    }
    $$('[data-hours-table] tr').forEach((tr) => {
      if (+tr.getAttribute('data-day') === NOW.day) { tr.classList.add('font-semibold', 'text-route'); tr.setAttribute('aria-current', 'date'); }
    });
  }

  const contact = $('[data-contact-form]');
  if (contact) {
    const topicSel = $('[name="topic"]', contact);
    const ptopic = params.get('topic');
    if (ptopic && $$('option', topicSel).some((o) => o.value === ptopic)) topicSel.value = ptopic;
    // To connect a form service, post new FormData(contact) with fetch() in the submit handler
    // below (for example to Formspree) and show the thank-you panel only when it answers OK.
    contact.addEventListener('submit', (e) => {
      e.preventDefault();
      const v = (n) => $('[name="' + n + '"]', contact).value.trim();
      let ok = true;
      ok = setError(contact, 'name', v('name').length >= 2 ? '' : 'Enter your name.') && ok;
      ok = setError(contact, 'email', EMAIL.test(v('email')) ? '' : 'Enter an email address, like sam@example.com.') && ok;
      ok = setError(contact, 'phone', !v('phone') || validPhone(v('phone')) ? '' : 'Enter a 10-digit US phone number, or leave it blank.') && ok;
      ok = setError(contact, 'message', v('message').length >= 10 ? '' : 'Tell us a little more (at least 10 characters).') && ok;
      if (!ok) { focusFirstError(contact); return; }
      const first = v('name').split(/\s+/)[0];
      $('[data-contact-done-title]').textContent = 'Thanks, ' + first + '.';
      $('[data-contact-ref]').textContent = reference(v('email') + v('message'));
      $('[data-contact-done-text]').textContent = 'Shona will reply to ' + v('email') + ' within one business day. If it’s about a lesson in the next 48 hours, call ' + SCHOOL.phone + ' instead.';
      contact.hidden = true;
      const done = $('[data-contact-done]');
      done.hidden = false;
      done.focus();
    });
    $$('input, textarea', contact).forEach((el) => el.addEventListener('input', () => { if (el.getAttribute('aria-invalid') === 'true') setError(contact, el.name, ''); }));
    $('[data-contact-again]').addEventListener('click', () => {
      contact.reset();
      contact.hidden = false;
      $('[data-contact-done]').hidden = true;
      $('[name="name"]', contact).focus();
    });
  }

  initReveal();

  // Footer year
  $$('[data-year]').forEach((el) => { el.textContent = TODAY.slice(0, 4); });
})();

/* ---------- Back to top ----------
   A button that fades in after you scroll about one screen down. It returns to
   the top (instantly if the visitor prefers reduced motion) and moves keyboard
   focus to the main content. It lifts itself above toasts so they never overlap, and
   steps aside while an in-page "Back to top" link (e.g. in a footer) is on screen.
   Mark your own UI with data-back-to-top-avoid (lift above it) or data-back-to-top-hide
   (hide while covering it). To remove the button: delete this block and the .back-to-top
   styles in src/input.css. */
(function () {
  'use strict';
  if (document.querySelector('.back-to-top')) return;

  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'back-to-top';
  btn.setAttribute('aria-label', 'Back to top');
  btn.title = 'Back to top';
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></svg>';
  document.body.appendChild(btn);

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  // Fixed UI the button should never sit on top of (toasts, snackbars...).
  var AVOID = '[data-toast], #toast, .toast, [data-back-to-top-avoid]';
  var queued = false;

  function isShown(el) {
    var cs = window.getComputedStyle(el);
    return cs.display !== 'none' && cs.visibility !== 'hidden' && parseFloat(cs.opacity) > 0.05;
  }

  // Lift the button above any visible avoid-element in the bottom-right corner.
  function lift() {
    var offset = 0;
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    Array.prototype.forEach.call(document.querySelectorAll(AVOID), function (el) {
      if (!isShown(el)) return;
      var r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      if (r.bottom > vh - 140 && r.right > vw - 96 && r.top < vh) offset = Math.max(offset, vh - r.top + 4);
    });
    btn.style.setProperty('--btt-lift', offset + 'px');
  }

  // In-page "Back to top" links (e.g. in a footer): hide the button while one is on screen.
  var inlineLinks = Array.prototype.filter.call(document.querySelectorAll('a'), function (a) {
    return /back to top/i.test(a.textContent);
  });
  function inlineLinkInView() {
    return inlineLinks.some(function (a) {
      var r = a.getBoundingClientRect();
      return r.width > 0 && r.top < window.innerHeight && r.bottom > 0;
    });
  }

  // Elements marked data-back-to-top-hide (e.g. a sticky sidebar with a form) hide the
  // button while it would sit on top of them.
  function coversHideZone() {
    var b = btn.getBoundingClientRect();
    return Array.prototype.some.call(document.querySelectorAll('[data-back-to-top-hide]'), function (el) {
      // Only while the element is pinned (sticky/fixed); in normal flow it just scrolls past.
      var pos = window.getComputedStyle(el).position;
      if (pos !== 'sticky' && pos !== 'fixed') return false;
      var r = el.getBoundingClientRect();
      return r.width > 0 && r.left < b.right && r.right > b.left && r.top < b.bottom && r.bottom > b.top;
    });
  }

  function update() {
    queued = false;
    btn.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.9 && !inlineLinkInView() && !coversHideZone());
    lift();
  }
  function schedule() {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(update);
  }

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  // Toasts animate in and out; re-check the lift whenever another element transitions.
  document.addEventListener('transitionrun', function (e) { if (e.target !== btn) schedule(); }, true);
  document.addEventListener('transitionend', function (e) { if (e.target !== btn) schedule(); }, true);
  update();

  // Send focus to the skip-link target (or <main>) so keyboard users start at the top.
  function focusTop() {
    var skip = Array.prototype.find.call(document.querySelectorAll('a[href^="#"]'), function (a) {
      return /skip/i.test(a.textContent) && a.getAttribute('href').length > 1;
    });
    var target = (skip && document.getElementById(skip.getAttribute('href').slice(1))) || document.querySelector('main');
    if (!target) return;
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.classList.add('back-to-top-target');
    target.focus({ preventScroll: true });
  }

  btn.addEventListener('click', function () {
    if (reduceMotion.matches) {
      window.scrollTo({ top: 0, behavior: 'auto' });
      focusTop();
      return;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Move focus once the smooth scroll has finished (with a fallback for older browsers).
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
