/* Solace (Budd Bay Counseling) — practice data. Plain JavaScript, no dependencies.
   Everything the pages calculate from lives here: hours, holidays, clinicians, fees, the sliding
   scale, insurance plans, groups and the match quiz weights. assets/js/main.js reads it as
   window.SOLACE. Keep the words in the HTML pages in step when you change it; see DOCS.md, "Content". */
window.SOLACE = (function () {
  'use strict';

  /* ---------- The practice ---------- */
  var PRACTICE = {
    name: 'Budd Bay Counseling',
    timeZone: 'America/Los_Angeles',
    zoneName: 'Pacific time',
    phone: '(360) 555-0142',
    phoneHref: 'tel:+13605550142',
    email: 'hello@buddbaycounseling.example',
    coordinator: 'Wynona Tsosie',
    coordinatorFirst: 'Wynona',
    refPrefix: 'BBC',          // consultation and group references look like BBC-7K2QH
    replyBusinessDays: 1,      // "we reply within 1 business day"
    consultLeadDays: 2         // a free consultation can be booked from this many days ahead
  };

  /* Office hours (sessions), 24-hour Pacific wall-clock times. Day 0 is Sunday; null = closed.
     Keep in step with the hours lists in the HTML (data-hours). */
  var HOURS = {
    0: null,
    1: ['08:00', '20:00'],
    2: ['08:00', '20:00'],
    3: ['08:00', '20:00'],
    4: ['08:00', '20:00'],
    5: ['08:00', '17:00'],
    6: ['09:00', '13:00']
  };
  /* When the front desk answers the phone and the intake inbox. */
  var PHONE_HOURS = { 1: ['09:00', '17:00'], 2: ['09:00', '17:00'], 3: ['09:00', '17:00'], 4: ['09:00', '17:00'], 5: ['09:00', '17:00'] };

  /* US federal holidays, worked out for any year from rules. { month, day } is a fixed date (moved to
     the Friday before when it falls on a Saturday and the Monday after on a Sunday, as federal
     holidays are observed). { month, weekday (0 = Sunday), nth } is "the nth weekday", nth -1 = last. */
  var HOLIDAYS = [
    { name: 'New Year’s Day', month: 1, day: 1 },
    { name: 'Martin Luther King Jr. Day', month: 1, weekday: 1, nth: 3 },
    { name: 'Presidents’ Day', month: 2, weekday: 1, nth: 3 },
    { name: 'Memorial Day', month: 5, weekday: 1, nth: -1 },
    { name: 'Juneteenth', month: 6, day: 19 },
    { name: 'Independence Day', month: 7, day: 4 },
    { name: 'Labor Day', month: 9, weekday: 1, nth: 1 },
    { name: 'Indigenous Peoples’ Day', month: 10, weekday: 1, nth: 2 },
    { name: 'Veterans Day', month: 11, day: 11 },
    { name: 'Thanksgiving', month: 11, weekday: 4, nth: 4 },
    { name: 'Christmas Day', month: 12, day: 25 }
  ];
  /* One-off closures as 'YYYY-MM-DD' (Pacific date), e.g. a team training day. */
  var EXTRA_CLOSED = [];

  /* ---------- Who we see and what brings people in ---------- */
  var CLIENTS = {
    adults: 'Adults',
    couples: 'Couples',
    teens: 'Teens (13–17)',
    children: 'Children (4–12)',
    families: 'Families'
  };
  /* label: shown in filters and the quiz. short: used inside sentences ("Works with grief and OCD"). */
  var CONCERNS = {
    anxiety: { label: 'Anxiety and worry', short: 'anxiety' },
    depression: { label: 'Low mood and depression', short: 'low mood' },
    trauma: { label: 'Trauma and PTSD', short: 'trauma' },
    grief: { label: 'Grief and loss', short: 'grief' },
    relationships: { label: 'Relationships', short: 'relationships' },
    ocd: { label: 'OCD and intrusive thoughts', short: 'OCD' },
    identity: { label: 'Identity, gender and sexuality', short: 'identity' },
    parenting: { label: 'Parenting and child behavior', short: 'parenting' },
    perinatal: { label: 'Pregnancy and new parenthood', short: 'new parenthood' },
    transitions: { label: 'Life changes and burnout', short: 'life changes' },
    school: { label: 'School and college stress', short: 'school stress' },
    emotions: { label: 'Intense emotions', short: 'intense emotions' }
  };
  var FORMATS = { inperson: 'In person', video: 'Video' };
  var TIMES = { daytime: 'Daytime', evening: 'Evenings', saturday: 'Saturdays' };

  /* ---------- Clinicians (team.html, clinician.html, match.html, contact.html) ----------
     tier: which row of FEES applies. days: session hours by weekday (0 = Sunday). A shift that
     ends after EVENING_FROM counts as "evenings"; one that starts before DAYTIME_UNTIL counts as
     "daytime"; day 6 counts as "Saturdays". accepting: 'yes' or 'waitlist' (wait: the usual wait).
     insurance: keys of PLANS this clinician is in network with. sliding: holds sliding-scale spots.
     modalities: keys of MODALITIES (approach.html). art: portrait file in assets/img. */
  var EVENING_FROM = '17:00';
  var DAYTIME_UNTIL = '15:00';
  var CLINICIANS = {
    ostrander: {
      name: 'Dr. Jessamyn Ostrander', first: 'Jessamyn', short: 'Dr. Ostrander', credential: 'PsyD',
      role: 'Licensed psychologist · Clinical director', pronouns: 'she/her', tier: 'psychologist',
      clients: ['adults', 'teens'], concerns: ['anxiety', 'ocd', 'depression', 'school'],
      modalities: ['cbt', 'erp', 'act'], formats: ['inperson', 'video'],
      days: { 1: ['09:00', '16:00'], 2: ['09:00', '16:00'], 4: ['09:00', '16:00'] },
      accepting: 'waitlist', wait: 'about 6 weeks', insurance: ['soundshore', 'rainshadow'], sliding: false,
      languages: ['English'], since: 2014,
      focus: 'Anxiety, OCD and the perfectionism that often comes with them',
      summary: 'Jessamyn helps adults and older teens step out of the loop of worry, checking and reassurance-seeking, using exposure-based CBT that is gentle, planned together and never rushed.',
      bio: [
        'Jessamyn founded Budd Bay Counseling after nine years at a university counseling center, where she saw how often anxiety hides behind high achievement. She works with adults and teens from 16 who live with OCD, panic, health anxiety and the exhausting kind of perfectionism.',
        'Her sessions are structured but warm: you agree each step before you take it, and practice between sessions is planned together so it fits real life. As clinical director she also supervises our associate therapist.'
      ],
      words: 'Anxiety is very good at making life smaller. My job is to help you take back the parts of it you miss, one manageable step at a time.',
      training: ['PsyD, Clinical Psychology', 'Licensed psychologist, Washington State', 'Advanced training in exposure and response prevention (ERP)'],
      art: 'portrait-ostrander.svg'
    },
    delacorte: {
      name: 'Eamon Delacorte', first: 'Eamon', short: 'Eamon', credential: 'LICSW',
      role: 'Licensed independent clinical social worker', pronouns: 'he/him', tier: 'licensed',
      clients: ['adults'], concerns: ['trauma', 'grief', 'anxiety', 'transitions'],
      modalities: ['emdr', 'cbt', 'mindfulness'], formats: ['inperson', 'video'],
      days: { 2: ['12:00', '20:00'], 3: ['08:00', '16:00'], 4: ['12:00', '20:00'] },
      accepting: 'yes', insurance: ['soundshore', 'cascadia', 'harborlight'], sliding: true,
      languages: ['English'], since: 2011,
      focus: 'Trauma, grief and the long tail of hard jobs',
      summary: 'Eamon works with adults carrying trauma and loss, including first responders, health care staff and veterans, using EMDR and a steady, practical kind of talk therapy.',
      bio: [
        'Before training as a therapist, Eamon spent six years as a hospital social worker, sitting with families on the worst days of their lives. He now works with adults living with the after-effects of trauma, sudden loss and the slow build-up of stress that comes with caring work.',
        'He is trained in EMDR and uses it only when you feel ready; many people start with skills for sleep, anger and feeling safe in their own body first. Evening sessions are available on Tuesdays and Thursdays.'
      ],
      words: 'You don’t have to tell me everything to start. We go at the pace that keeps you steady, and you stay in charge of what we talk about.',
      training: ['MSW, Clinical Social Work', 'LICSW, Washington State', 'EMDR Basic Training (completed)'],
      art: 'portrait-delacorte.svg'
    },
    quintanar: {
      name: 'Isaura Quintanar', first: 'Isaura', short: 'Isaura', credential: 'LMFT',
      role: 'Licensed marriage and family therapist', pronouns: 'she/her', tier: 'licensed',
      clients: ['couples', 'families', 'adults'], concerns: ['relationships', 'parenting', 'perinatal', 'identity'],
      modalities: ['gottman', 'eft', 'family'], formats: ['inperson', 'video'],
      days: { 1: ['10:00', '18:00'], 3: ['10:00', '18:00'], 6: ['09:00', '13:00'] },
      accepting: 'yes', insurance: ['soundshore', 'rainshadow'], sliding: false,
      languages: ['English', 'Spanish'], since: 2016,
      focus: 'Couples, blended families and becoming parents',
      summary: 'Isaura sees couples and families, in English or Spanish, who want to argue less, understand each other more and make room for big changes like a new baby or a blended home.',
      bio: [
        'Isaura works with couples of every shape and stage: dating, married, separated and deciding, and parents raising children across two homes. She also leads our one-day couples workshop.',
        'Her sessions draw on the Gottman Method and Emotionally Focused Therapy. Expect practical tools for hard conversations alongside time to understand the patterns underneath them. Saturday morning sessions are available.'
      ],
      words: 'Most couples who come in aren’t short on love. They’re short on ways to reach each other when things get tense, and that can be learned.',
      training: ['MA, Marriage and Family Therapy', 'LMFT, Washington State', 'Gottman Method Couples Therapy, Level 2', 'Sessions in English and Spanish'],
      art: 'portrait-quintanar.svg'
    },
    mukherjee: {
      name: 'Nadira Mukherjee', first: 'Nadira', short: 'Nadira', credential: 'LMHC',
      role: 'Licensed mental health counselor', pronouns: 'she/they', tier: 'licensed',
      clients: ['teens', 'adults'], concerns: ['depression', 'anxiety', 'identity', 'emotions', 'school'],
      modalities: ['dbt', 'cbt', 'act'], formats: ['video'],
      days: { 1: ['13:00', '20:00'], 2: ['13:00', '20:00'], 3: ['13:00', '20:00'], 4: ['13:00', '20:00'] },
      accepting: 'yes', insurance: ['cascadia', 'soundshore', 'rainshadow'], sliding: true,
      languages: ['English'], since: 2019,
      focus: 'Teens and young adults, intense emotions and identity',
      summary: 'Nadira works by video with teens and young adults up to 25 across Washington, with DBT-informed skills for big feelings, low mood and figuring out who you are.',
      bio: [
        'Nadira sees teens from 13 and young adults up to 25, all by video, so sessions fit around school, college and work anywhere in Washington. She is LGBTQ+ affirming and often works with young people exploring identity, gender and sexuality.',
        'Her approach is DBT-informed: practical skills for intense emotions, urges and relationships, practiced in session and adapted to real life. With teens, she agrees with you and your parent or carer up front what stays private. She also leads Tide Pool, our teen skills group.'
      ],
      words: 'Teens can tell when an adult is just going through the motions. I try to be honest, curious and on your side, even when that means saying something hard.',
      training: ['MA, Clinical Mental Health Counseling', 'LMHC, Washington State', 'Intensive training in DBT skills for adolescents'],
      art: 'portrait-mukherjee.svg'
    },
    thornbury: {
      name: 'Coralie Thornbury', first: 'Coralie', short: 'Coralie', credential: 'LMHC',
      role: 'Licensed mental health counselor · Child and family therapist', pronouns: 'she/her', tier: 'licensed',
      clients: ['children', 'families'], concerns: ['parenting', 'perinatal', 'anxiety', 'grief'],
      modalities: ['play', 'family', 'mindfulness'], formats: ['inperson'],
      days: { 2: ['08:00', '15:00'], 3: ['08:00', '15:00'], 5: ['08:00', '15:00'] },
      accepting: 'waitlist', wait: 'about 4 weeks', insurance: ['cascadia', 'soundshore'], sliding: false,
      languages: ['English'], since: 2013,
      focus: 'Young children, worried kids and new parents',
      summary: 'Coralie works in our playroom with children from 4 to 12 and their parents, and with new and expecting parents finding their feet.',
      bio: [
        'Children often can’t explain what’s wrong, but they can show it. Coralie uses play, drawing and sand tray work to help children from 4 to 12 with worries, big changes, grief and behavior that has everyone stuck.',
        'Parents are part of the work: most months include a parent-only session with practical next steps for home. Coralie also supports parents through pregnancy and the first year, and leads our Little Hours circle for new parents.'
      ],
      words: 'Play is how children work things out. When a family can see what a child has been trying to say, things usually start to soften at home too.',
      training: ['MA, Counseling Psychology', 'LMHC, Washington State', 'Certificate in Child-Centered Play Therapy', 'Perinatal mental health training'],
      art: 'portrait-thornbury.svg'
    },
    pellerin: {
      name: 'Iver Pellerin', first: 'Iver', short: 'Iver', credential: 'LMHC-A',
      role: 'Associate counselor, under the supervision of Dr. Ostrander', pronouns: 'he/they', tier: 'associate',
      clients: ['adults'], concerns: ['transitions', 'depression', 'grief', 'relationships'],
      modalities: ['act', 'cbt', 'mindfulness'], formats: ['inperson', 'video'],
      days: { 3: ['14:00', '20:00'], 4: ['14:00', '20:00'], 5: ['10:00', '17:00'], 6: ['09:00', '13:00'] },
      accepting: 'yes', insurance: ['harborlight'], sliding: true,
      languages: ['English', 'Norwegian'], since: 2025,
      focus: 'Burnout, big life changes and feeling stuck',
      summary: 'Iver works with adults through burnout, career and relationship changes and low mood, with lower fees, sliding-scale spots and evening and Saturday times.',
      bio: [
        'Iver is a licensed mental health counselor associate, completing supervised hours toward full licensure under Dr. Ostrander. Associate fees are lower, and most of his week is kept for sliding-scale clients.',
        'He uses Acceptance and Commitment Therapy (ACT) to help people get unstuck: noticing the thoughts that pull you around, and choosing what you want your days to be about. He co-leads Steady Ground, our anxiety skills group.'
      ],
      words: 'Feeling stuck isn’t a character flaw. Often it means the life you’ve built no longer fits, and that’s worth taking seriously.',
      training: ['MA, Clinical Mental Health Counseling', 'LMHC-Associate, Washington State', 'Supervised by Dr. Jessamyn Ostrander, PsyD'],
      art: 'portrait-pellerin.svg'
    }
  };

  /* ---------- Approaches (approach.html) ---------- */
  var MODALITIES = {
    cbt: 'Cognitive behavioral therapy (CBT)',
    erp: 'Exposure and response prevention (ERP)',
    emdr: 'EMDR',
    dbt: 'DBT-informed skills',
    act: 'Acceptance and commitment therapy (ACT)',
    gottman: 'Gottman Method couples therapy',
    eft: 'Emotionally focused therapy (EFT)',
    play: 'Play therapy',
    family: 'Family therapy',
    mindfulness: 'Mindfulness-based therapy'
  };

  /* ---------- Fees (fees.html) ----------
     US dollars per session. CPT codes help with insurance claims and superbills. */
  var FEES = {
    rows: [
      { id: 'consult', label: 'Free consultation', length: '15 min, phone or video', code: '' },
      { id: 'intake', label: 'First session (assessment)', length: '60 min', code: '90791' },
      { id: 'individual', label: 'Individual session', length: '53 min', code: '90837' },
      { id: 'couples', label: 'Couples or family session', length: '50 min', code: '90847' },
      { id: 'extended', label: 'Extended session (EMDR, intensives)', length: '80 min', code: '90837 + 99354' }
    ],
    tiers: {
      psychologist: { label: 'Psychologist', who: 'PhD or PsyD', consult: 0, intake: 210, individual: 190, couples: 205, extended: 285 },
      licensed: { label: 'Licensed therapist', who: 'LMHC, LICSW or LMFT', consult: 0, intake: 185, individual: 165, couples: 180, extended: 250 },
      associate: { label: 'Associate therapist', who: 'Licensed associate, supervised', consult: 0, intake: 130, individual: 110, couples: 125, extended: 165 }
    },
    groupSession: 55,
    workshopPerCouple: 290,
    cancelHours: 24,
    lateCancelFee: 75
  };

  /* Sliding scale (fees.html). Income as a share of the federal poverty guideline for the
     household size: guideline = base + perPerson × (people − 1). Update these with each year's
     guidelines. Bands are checked in order; above the last band the standard fee applies. The fee
     is for an individual session with a clinician who holds sliding-scale spots. */
  var SLIDING = {
    base: 15650,
    perPerson: 5500,
    maxHousehold: 10,
    bands: [
      { upTo: 150, fee: 40 },
      { upTo: 200, fee: 60 },
      { upTo: 250, fee: 80 },
      { upTo: 300, fee: 100 },
      { upTo: 400, fee: 125 }
    ]
  };

  /* Insurance plans (fees.html, team.html, match.html). type: 'in' = in network with the
     clinicians who list the plan; 'eap' = employee assistance program (free sessions, then
     self-pay or another plan); 'oon' = out of network, we give you a superbill to claim. */
  var PLANS = {
    soundshore: { name: 'Sound Shore Health', type: 'in' },
    cascadia: { name: 'Cascadia Mutual', type: 'in' },
    rainshadow: { name: 'Rainshadow Health Plan', type: 'in' },
    harborlight: { name: 'Harborlight EAP', type: 'eap', sessions: 6 },
    northfork: { name: 'Northfork Benefits', type: 'oon' },
    saltwater: { name: 'Saltwater Health', type: 'oon' }
  };
  /* Out-of-network estimate: the share your plan might pay of an allowed amount, after the deductible. */
  var OON = { allowed: 140, shares: [50, 60, 70, 80], defaultShare: 60 };

  /* ---------- Groups (services.html, index.html) ----------
     Start dates are rules, not dates, so they never go stale: a cohort starts on the nth weekday
     (0 = Sunday) of each listed month; the next one shown is the first at least MIN_LEAD_DAYS ahead. */
  var GROUP_RULES = { minLeadDays: 7, lookAheadMonths: 24 };
  var GROUPS = [
    { id: 'steady', name: 'Steady Ground', topic: 'CBT skills for anxiety', who: 'Adults 18+', weekday: 2, nth: 1, months: [1, 3, 5, 9], start: '18:00', end: '19:30', weeks: 8, format: 'inperson', size: 8, leaders: ['pellerin', 'ostrander'], fee: 'group' },
    { id: 'tidepool', name: 'Tide Pool', topic: 'DBT-informed skills for teens', who: 'Teens 14–17', weekday: 3, nth: 1, months: [1, 4, 9], start: '16:30', end: '18:00', weeks: 10, format: 'video', size: 8, leaders: ['mukherjee'], fee: 'group' },
    { id: 'slacktide', name: 'Slack Tide', topic: 'A grief support circle', who: 'Adults grieving any loss', weekday: 4, nth: 2, months: [2, 4, 6, 8, 10, 12], start: '17:30', end: '19:00', weeks: 6, format: 'inperson', size: 10, leaders: ['delacorte'], fee: 'group' },
    { id: 'littlehours', name: 'Little Hours', topic: 'A circle for new and expecting parents', who: 'Parents of babies under one, babies welcome', weekday: 6, nth: 1, months: [1, 3, 5, 7, 9, 11], start: '10:00', end: '11:30', weeks: 6, format: 'inperson', size: 8, leaders: ['thornbury'], fee: 'group' },
    { id: 'twooars', name: 'Two Oars', topic: 'A one-day couples workshop', who: 'Couples in any kind of relationship', weekday: 6, nth: 3, months: [3, 6, 10], start: '09:30', end: '16:00', weeks: 0, format: 'inperson', size: 8, leaders: ['quintanar'], fee: 'workshop' }
  ];

  /* ---------- Match quiz (match.html) ----------
     who → the CLIENTS key a clinician must see. Points add up per clinician; the top
     MATCH.results are shown. A clinician who doesn't offer the chosen format is left out. */
  var WHO = {
    me: { label: 'Me', client: 'adults' },
    couple: { label: 'Me and my partner', client: 'couples' },
    teen: { label: 'My teen (13–17)', client: 'teens' },
    child: { label: 'My child (4–12)', client: 'children' },
    family: { label: 'Our family', client: 'families' }
  };
  var MATCH = {
    results: 3,
    maxConcerns: 3,
    points: { concern: 3, time: 1, payment: 2, accepting: 2 }
  };

  return {
    PRACTICE: PRACTICE, HOURS: HOURS, PHONE_HOURS: PHONE_HOURS, HOLIDAYS: HOLIDAYS, EXTRA_CLOSED: EXTRA_CLOSED,
    CLIENTS: CLIENTS, CONCERNS: CONCERNS, FORMATS: FORMATS, TIMES: TIMES,
    EVENING_FROM: EVENING_FROM, DAYTIME_UNTIL: DAYTIME_UNTIL, CLINICIANS: CLINICIANS, MODALITIES: MODALITIES,
    FEES: FEES, SLIDING: SLIDING, PLANS: PLANS, OON: OON, GROUP_RULES: GROUP_RULES, GROUPS: GROUPS,
    WHO: WHO, MATCH: MATCH
  };
})();
