/* Riverbend Church — site script
 * Vanilla JavaScript, no dependencies. Sections:
 *  1. Church settings and service schedule    9. Sermon archive
 *  2. People, series and sermons              10. Sermon page
 *  3. Events                                  11. Events calendar
 *  4. Groups, giving and visit settings       12. Groups finder
 *  5. Helpers and dates                       13. Plan your visit
 *  6. Artwork: avatars, series covers, icons  14. Giving form
 *  7. Header, menu, reveal, countdown         15. Forms
 *  8. Audio player                            16. Boot
 */
document.documentElement.classList.add('js');

(function () {
  'use strict';

  /* ------------------------------------------------------------------
   * 1. Church settings and service schedule
   *    Times are wall-clock times in CHURCH.timeZone, whatever the
   *    visitor's own time zone is. day: 0 = Sunday … 6 = Saturday.
   * ------------------------------------------------------------------ */
  const CHURCH = {
    name: 'Riverbend Church',
    timeZone: 'America/Chicago',
    timeZoneLabel: 'Central Time',
    place: 'Riverbend Church, 418 Riverside Avenue, Lawrence, KS 66044',
    liveUrl: 'sermons.html#live',       // where "Watch live" goes during a service
    uidDomain: 'riverbend.example'      // used in the UID of downloaded .ics files
  };

  const SERVICES = [
    { day: 0, start: '09:00', minutes: 75, name: 'Sunday Gathering' },
    { day: 0, start: '11:00', minutes: 75, name: 'Sunday Gathering' }
  ];

  // Demo dates: sermons and events are written for the week of DEMO_ANCHOR. While
  // KEEP_DEMO_CURRENT is true they move forward in whole weeks so the demo never looks
  // out of date (weekdays never change). Set it to false once you enter real dates.
  const KEEP_DEMO_CURRENT = true;
  const DEMO_ANCHOR = '2026-10-11';

  /* ------------------------------------------------------------------
   * 2. People, series and sermons
   *    avatar: colors and shapes for the SVG portrait drawn by avatar().
   *    style: short | long | bun | curly | coily | waves | bald
   * ------------------------------------------------------------------ */
  const PEOPLE = {
    dana: {
      name: 'Dana Okafor', role: 'Lead Pastor', email: 'dana@riverbend.example',
      bio: 'Dana planted Riverbend in 2011 with twelve friends and a borrowed coffee urn. She preaches most Sundays and still makes the coffee.',
      avatar: { skin: '#8a5636', hair: '#1d1411', style: 'coily', bg: '#f6a96b', shirt: '#5b2a6e', glasses: true }
    },
    luis: {
      name: 'Luis Herrera', role: 'Pastor of Families', email: 'luis@riverbend.example',
      bio: 'Former fourth-grade teacher, father of three and the reason Riverbend Kids has a snack budget. Leads our family and kids ministries.',
      avatar: { skin: '#c48a5f', hair: '#2a1d16', style: 'short', bg: '#bcd9e8', shirt: '#33603b', beard: true }
    },
    hannah: {
      name: 'Hannah Brooks', role: 'Associate Pastor, Care', email: 'hannah@riverbend.example',
      bio: 'Hannah oversees pastoral care, the prayer team and our grief and recovery groups. Ask her about hospital chaplaincy or quilting.',
      avatar: { skin: '#f1c7a6', hair: '#b4532a', style: 'long', bg: '#c9dcc0', shirt: '#1f5577' }
    },
    marcus: {
      name: 'Marcus Bell', role: 'Youth Director', email: 'marcus@riverbend.example',
      bio: 'Marcus runs Wednesday youth nights for grades 6–12 and coaches the church’s famously average softball team.',
      avatar: { skin: '#6b4029', hair: '#140e0c', style: 'bald', bg: '#efe5f5', shirt: '#f6a96b', beard: true }
    },
    june: {
      name: 'June Whitaker', role: 'Kids Director', email: 'june@riverbend.example',
      bio: 'June leads a team of 60 volunteers who make Sunday mornings safe, loud and joyful for children from birth to fifth grade.',
      avatar: { skin: '#e8b48f', hair: '#e9d8b4', style: 'bun', bg: '#fde3cc', shirt: '#5b2a6e', glasses: true }
    },
    theo: {
      name: 'Theo Nakamura', role: 'Worship & Arts', email: 'theo@riverbend.example',
      bio: 'Theo leads the band and choir, writes some of the songs we sing and runs the Thursday open rehearsal anyone can join.',
      avatar: { skin: '#e2b48c', hair: '#151215', style: 'waves', bg: '#bcd9e8', shirt: '#2b1b36' }
    },
    priya: {
      name: 'Priya Raman', role: 'Operations & Generosity', email: 'priya@riverbend.example',
      bio: 'Priya keeps the lights on, the books open and the budget published. She answers every giving question within a day.',
      avatar: { skin: '#a8714d', hair: '#1b1210', style: 'long', bg: '#f6a96b', shirt: '#33603b' }
    },
    ruth: {
      name: 'Ruth Aldana', role: 'Community Care Coordinator', email: 'ruth@riverbend.example',
      bio: 'Ruth runs the Riverbend Pantry and our meal train, and knows every social worker in Douglas County by first name.',
      avatar: { skin: '#c9946b', hair: '#5b5651', style: 'curly', bg: '#c9dcc0', shirt: '#9a4716', glasses: true }
    }
  };
  // Order of the staff grid on about.html.
  const STAFF = ['dana', 'luis', 'hannah', 'marcus', 'june', 'theo', 'priya', 'ruth'];

  // art: table | sun | wheat | wave (see seriesArt()).
  const SERIES = {
    'open-table': { title: 'Open Table', subtitle: 'Hospitality in the Gospel of Luke', art: 'table', blurb: 'Jesus spends a remarkable amount of Luke at dinner. Five weeks on who gets invited, who sits where and what happens when bread is broken.' },
    'ordinary-psalms': { title: 'Psalms for Ordinary Days', subtitle: 'Prayers for Mondays, too', art: 'sun', blurb: 'Four well-worn psalms for weeks that are neither terrible nor wonderful, just long.' },
    'ruth': { title: 'Ruth: Faithful in the Field', subtitle: 'Loyalty, loss and a harvest', art: 'wheat', blurb: 'A short book about a widow, an immigrant and a farmer who left the edges of his field unharvested on purpose.' },
    'unhurried': { title: 'Unhurried', subtitle: 'Learning the rhythm of rest', art: 'wave', blurb: 'A summer series on rest, Sabbath and why Jesus kept taking his friends away from the crowds.' }
  };

  const BOOKS = { luke: 'Luke', psalms: 'Psalms', ruth: 'Ruth', matthew: 'Matthew', mark: 'Mark' };

  // Newest first is not required: the archive sorts by date. duration is in seconds.
  // audio: leave '' to use the simulated player, or set a URL to an .mp3/.m4a file.
  // Scripture quotations are from the King James Version (public domain).
  const SERMONS = [
    {
      id: 'room-at-the-table', title: 'Room at the Table', series: 'open-table', part: 5, speaker: 'dana',
      date: '2026-10-11', book: 'luke', passage: 'Luke 14:12–24', duration: 2322, audio: '',
      summary: 'Jesus tells a dinner host to invite the people who can never invite him back. Dana asks who is missing from our tables, and what it costs to set another place.',
      verse: { text: 'But when thou makest a feast, call the poor, the maimed, the lame, the blind.', ref: 'Luke 14:13 (KJV)' },
      notes: [
        ['Invitations are a kind of sermon', 'Who we eat with says what we believe about who matters. In Luke, Jesus is criticized more for his dinner guests than for anything he teaches.'],
        ['The excuses sound reasonable', 'A field, some oxen, a new marriage. None of the guests in the parable are villains; they are simply busy. Busyness is the quietest way to decline grace.'],
        ['The house will be full', 'The host does not cancel the party. He widens the guest list until the house is full, and the people who come are the ones nobody expected.']
      ],
      questions: [
        'Think of the last three meals you shared. Who was at the table, and who could have been?',
        'Which of the excuses in verses 18–20 sounds most like your own week?',
        'What would it look like for your group to “set another place” this month?',
        'Where have you been the unexpected guest, welcomed when you did not expect to be?'
      ]
    },
    {
      id: 'come-down-quickly', title: 'Come Down Quickly', series: 'open-table', part: 4, speaker: 'luis',
      date: '2026-10-04', book: 'luke', passage: 'Luke 19:1–10', duration: 2050, audio: '',
      summary: 'A short tax collector climbs a tree to see Jesus, and Jesus invites himself to dinner. Luis on being seen before we have tidied up.',
      verse: { text: 'For the Son of man is come to seek and to save that which was lost.', ref: 'Luke 19:10 (KJV)' },
      notes: [
        ['Curiosity counts', 'Zacchaeus does not come to repent. He comes to look. Jesus treats curiosity as enough of a start.'],
        ['Jesus goes first', 'Before Zacchaeus says a word, Jesus calls him by name and asks to stay at his house. Welcome comes before change, not after it.'],
        ['Generosity follows', 'Half his goods, four times what he took. Nobody demands it; joy does what rules could not.']
      ],
      questions: [
        'What “tree” have you climbed to get a look at faith from a safe distance?',
        'Why do you think Jesus asked to stay with Zacchaeus instead of lecturing him?',
        'The crowd grumbles in verse 7. When have you been part of the grumbling crowd?'
      ]
    },
    {
      id: 'a-great-way-off', title: 'A Great Way Off', series: 'open-table', part: 3, speaker: 'dana',
      date: '2026-09-27', book: 'luke', passage: 'Luke 15:11–32', duration: 2465, audio: '',
      summary: 'Two sons, one party and a father who runs. Dana looks at the younger son who left, the older son who stayed, and the feast both are invited to.',
      verse: { text: 'But when he was yet a great way off, his father saw him, and had compassion, and ran, and fell on his neck, and kissed him.', ref: 'Luke 15:20 (KJV)' },
      notes: [
        ['The father was watching the road', 'He sees his son “a great way off”, which means he was looking. Grace is not reluctant; it is already on the porch.'],
        ['Running was undignified', 'Respectable fathers did not run. This one does, and takes the shame of the reunion on himself.'],
        ['The story ends with a question', 'We never learn whether the older brother goes in. Luke leaves the door open, and the music playing.']
      ],
      questions: [
        'Are you more like the younger son or the older one right now? Why?',
        'What does it mean to you that the father ran?',
        'Who is standing outside the party in your life, and how could you invite them in?'
      ]
    },
    {
      id: 'known-in-the-breaking', title: 'Known in the Breaking of Bread', series: 'open-table', part: 2, speaker: 'hannah',
      date: '2026-09-20', book: 'luke', passage: 'Luke 24:13–35', duration: 2180, audio: '',
      summary: 'Two grieving friends walk to Emmaus with a stranger they do not recognize until supper. Hannah on hope that arrives slowly, and often at the table.',
      verse: { text: 'Did not our heart burn within us, while he talked with us by the way?', ref: 'Luke 24:32 (KJV)' },
      notes: [
        ['Grief walks in circles', 'The two disciples tell the stranger the whole story, including the parts they cannot make sense of. Jesus lets them talk first.'],
        ['Hospitality opens their eyes', '“Abide with us,” they say. It is their invitation to supper that becomes the moment of recognition.'],
        ['Then they run back', 'Seven miles, at night, to tell their friends. Hope that is real always wants to be shared.']
      ],
      questions: [
        'When has God felt like a stranger walking beside you?',
        'Why do you think they recognized Jesus at the table, rather than on the road?',
        'Who do you know who is “walking to Emmaus” right now, and how could you walk with them?'
      ]
    },
    {
      id: 'dinner-at-levis', title: 'Dinner at Levi’s', series: 'open-table', part: 1, speaker: 'luis',
      date: '2026-09-13', book: 'luke', passage: 'Luke 5:27–32', duration: 1985, audio: '',
      summary: 'Jesus calls a tax collector, and the first thing Levi does is throw a party for all his questionable friends. Luis opens the series with the guest list nobody approved.',
      verse: { text: 'They that are whole need not a physician; but they that are sick. I came not to call the righteous, but sinners to repentance.', ref: 'Luke 5:31–32 (KJV)' },
      notes: [
        ['A call, then a party', 'Levi leaves everything, and then hosts a great feast. Following Jesus starts with an open house.'],
        ['The wrong crowd', 'Tax collectors and sinners fill the room. Jesus is comfortable there, and the religious experts are not.'],
        ['A doctor among the sick', 'Jesus describes his work as medicine. Churches should feel more like clinics than clubs.']
      ],
      questions: [
        'Levi’s first response was to invite his friends. Who would you invite?',
        'Why do you think the Pharisees found the dinner so offensive?',
        'Where does our church feel more like a club than a clinic?'
      ]
    },
    {
      id: 'beside-still-waters', title: 'Beside Still Waters', series: 'ordinary-psalms', part: 4, speaker: 'hannah',
      date: '2026-09-06', book: 'psalms', passage: 'Psalm 23', duration: 1870, audio: '',
      summary: 'The most familiar psalm, read slowly. Hannah on a shepherd who leads at the pace of the slowest sheep.',
      verse: { text: 'The LORD is my shepherd; I shall not want. He maketh me to lie down in green pastures: he leadeth me beside the still waters.', ref: 'Psalm 23:1–2 (KJV)' },
      notes: [
        ['“Maketh me lie down”', 'Sometimes rest is not a reward but an instruction. The shepherd knows when the sheep need to stop.'],
        ['The valley is on the route', 'The psalm does not promise a way around the valley of the shadow, only company through it.'],
        ['A table in front of enemies', 'Goodness is set out in plain sight of what threatens us. Hope does not wait for every problem to be solved.']
      ],
      questions: [
        'Which line of Psalm 23 do you find hardest to believe this week?',
        'What does “he maketh me to lie down” look like in your schedule?',
        'Who has been a shepherd to you in a dark valley?'
      ]
    },
    {
      id: 'be-still', title: 'Be Still, and Know', series: 'ordinary-psalms', part: 3, speaker: 'dana',
      date: '2026-08-30', book: 'psalms', passage: 'Psalm 46', duration: 2290, audio: '',
      summary: 'Mountains fall into the sea and the psalmist tells us to be still. Dana on why stillness is an act of trust, not a mood.',
      verse: { text: 'God is our refuge and strength, a very present help in trouble.', ref: 'Psalm 46:1 (KJV)' },
      notes: [
        ['The earth is moving', 'Psalm 46 is not written for calm days. Its stillness is the stillness of a refuge in a storm.'],
        ['A river that makes glad', 'In the middle of chaos there is a river in the city of God. Our church sits beside a river for a reason, we like to think.'],
        ['Stop fighting', '“Be still” can be read as “let go” or “stop”. It is less about quiet and more about surrender.']
      ],
      questions: [
        'What feels like “the earth moving” in your life at the moment?',
        'How do you practice stillness, if at all?',
        'Where have you seen God as “a very present help”?'
      ]
    },
    {
      id: 'unto-the-hills', title: 'Unto the Hills', series: 'ordinary-psalms', part: 2, speaker: 'marcus',
      date: '2026-08-23', book: 'psalms', passage: 'Psalm 121', duration: 1760, audio: '',
      summary: 'A pilgrim song for the road. Marcus on where we look for help, and the God who does not sleep so we can.',
      verse: { text: 'I will lift up mine eyes unto the hills, from whence cometh my help. My help cometh from the LORD, which made heaven and earth.', ref: 'Psalm 121:1–2 (KJV)' },
      notes: [
        ['A song for travelers', 'Pilgrims sang this on the way to Jerusalem. It is a psalm for people in the middle of a journey.'],
        ['He does not slumber', 'You are allowed to sleep. Keeping the world turning is not your job.'],
        ['Going out and coming in', 'The psalm ends with the most ordinary movements of a day. God keeps those too.']
      ],
      questions: [
        'Where do you look first when you need help?',
        'What would change if you really believed God “shall not slumber”?',
        'Which journey are you in the middle of right now?'
      ]
    },
    {
      id: 'fearfully-made', title: 'Known All the Way Down', series: 'ordinary-psalms', part: 1, speaker: 'luis',
      date: '2026-08-16', book: 'psalms', passage: 'Psalm 139', duration: 2120, audio: '',
      summary: 'Psalm 139 says we are searched and known. Luis on why being fully known can feel frightening, and why it is the beginning of being fully loved.',
      verse: { text: 'I will praise thee; for I am fearfully and wonderfully made: marvellous are thy works; and that my soul knoweth right well.', ref: 'Psalm 139:14 (KJV)' },
      notes: [
        ['Searched and known', 'The psalm begins with God knowing our sitting down and rising up. Nothing about us is a surprise.'],
        ['Nowhere to flee', 'Heaven, the grave, the far side of the sea. The psalmist runs out of places God is not.'],
        ['Fearfully and wonderfully', 'Our bodies, our stories and our quirks are described as marvelous work.']
      ],
      questions: [
        'Does being fully known feel comforting or uncomfortable to you? Why?',
        'Which part of yourself do you find hardest to call “wonderfully made”?',
        'How can your group help each other feel known?'
      ]
    },
    {
      id: 'where-you-go', title: 'Where You Go', series: 'ruth', part: 3, speaker: 'dana',
      date: '2026-08-09', book: 'ruth', passage: 'Ruth 1', duration: 2235, audio: '',
      summary: 'Naomi has lost everything and tells her daughters-in-law to go home. Ruth refuses. Dana on loyalty that holds when there is nothing in it for us.',
      verse: { text: 'Whither thou goest, I will go; and where thou lodgest, I will lodge: thy people shall be my people, and thy God my God.', ref: 'Ruth 1:16 (KJV)' },
      notes: [
        ['Naomi’s bitterness is allowed', 'She renames herself Mara, “bitter”. The book does not rush her grief.'],
        ['Ruth chooses a people', 'Her famous words are a promise to a person before they are a statement of faith.'],
        ['Faithfulness looks ordinary', 'Ruth’s loyalty is lived out in walking, working and staying.']
      ],
      questions: [
        'Who has stayed with you when it cost them something?',
        'Is there someone you are being asked to “go with” in this season?',
        'How does Naomi’s honesty about her bitterness speak to you?'
      ]
    },
    {
      id: 'leave-some-for-the-gleaners', title: 'Leave Some for the Gleaners', series: 'ruth', part: 2, speaker: 'hannah',
      date: '2026-08-02', book: 'ruth', passage: 'Ruth 2', duration: 2010, audio: '',
      summary: 'Boaz tells his workers to drop extra grain on purpose. Hannah on generosity built into the edges of our lives.',
      verse: { text: 'And let fall also some of the handfuls of purpose for her, and leave them, that she may glean them, and rebuke her not.', ref: 'Ruth 2:16 (KJV)' },
      notes: [
        ['Margins on purpose', 'The law told farmers to leave the edges of their fields for the poor. Boaz goes further than the law asks.'],
        ['Dignity in the gift', 'Ruth gathers what is left for her. She is treated as a worker, not a charity case.'],
        ['Kindness gets noticed', 'Boaz has heard about Ruth’s faithfulness. Small kindnesses travel further than we think.']
      ],
      questions: [
        'What are the “edges of your field” that you could leave for others?',
        'How can we give in ways that protect people’s dignity?',
        'Where have you been on the receiving end of a quiet kindness?'
      ]
    },
    {
      id: 'a-redeemer-shows-up', title: 'A Redeemer Who Shows Up', series: 'ruth', part: 1, speaker: 'luis',
      date: '2026-07-26', book: 'ruth', passage: 'Ruth 3–4', duration: 2400, audio: '',
      summary: 'A late-night conversation on a threshing floor and a deal at the town gate. Luis on a redeemer who keeps his word in public.',
      verse: { text: 'Blessed be the LORD, which hath not left thee this day without a kinsman.', ref: 'Ruth 4:14 (KJV)' },
      notes: [
        ['Courage on the threshing floor', 'Ruth takes a bold risk on Naomi’s plan. Faith is sometimes a brave request.'],
        ['Business at the gate', 'Boaz settles things properly and in public. Love that redeems is also love that is accountable.'],
        ['Naomi holds a child', 'The book that began with three funerals ends with a baby in Naomi’s lap.']
      ],
      questions: [
        'Where do you need to make a brave request this season?',
        'Why do you think the story makes such a point of Boaz doing things publicly?',
        'Where have you seen an ending you did not expect?'
      ]
    },
    {
      id: 'come-and-rest', title: 'Come and Rest', series: 'unhurried', part: 2, speaker: 'dana',
      date: '2026-07-19', book: 'matthew', passage: 'Matthew 11:28–30', duration: 2150, audio: '',
      summary: 'Jesus offers rest to the weary and a yoke that is easy. Dana on the difference between rest and a day off.',
      verse: { text: 'Come unto me, all ye that labour and are heavy laden, and I will give you rest.', ref: 'Matthew 11:28 (KJV)' },
      notes: [
        ['An invitation, not a demand', 'Jesus does not say “try harder to rest”. He says “come”.'],
        ['A yoke is still a yoke', 'Rest with Jesus is not doing nothing. It is pulling alongside someone stronger.'],
        ['Meek and lowly', 'Jesus describes his own heart as gentle. We become like the one we walk with.']
      ],
      questions: [
        'What makes you weary right now?',
        'What is the difference between rest and simply stopping work?',
        'What would an “easy yoke” look like in your week?'
      ]
    },
    {
      id: 'come-away', title: 'Come Away for a While', series: 'unhurried', part: 1, speaker: 'marcus',
      date: '2026-07-12', book: 'mark', passage: 'Mark 6:30–32', duration: 1690, audio: '',
      summary: 'The disciples are so busy they cannot eat, and Jesus takes them away in a boat. Marcus opens our summer series on rest.',
      verse: { text: 'Come ye yourselves apart into a desert place, and rest a while: for there were many coming and going, and they had no leisure so much as to eat.', ref: 'Mark 6:31 (KJV)' },
      notes: [
        ['Even good work wears us out', 'The disciples had just come back from a successful mission. Success can be exhausting too.'],
        ['Jesus notices', 'He sees that they have not eaten. Rest begins with being noticed.'],
        ['The crowd follows anyway', 'Rest is interrupted. Jesus does not give up on it; he builds it back in later.']
      ],
      questions: [
        'When did you last “come away for a while”?',
        'What keeps you from resting, even when you could?',
        'How can we protect rest for each other as a church?'
      ]
    }
  ];

  const PROGRESS_KEY = 'riverbend-sermon-progress';

  /* ------------------------------------------------------------------
   * 3. Events
   *    date is the first date; weekly: 'YYYY-MM-DD' repeats it every week
   *    up to and including that date. start/end are 24-hour church times.
   * ------------------------------------------------------------------ */
  const EVENT_CATS = {
    worship: { label: 'Worship', dot: 'bg-plum', chip: 'bg-lilac text-plum' },
    community: { label: 'Community', dot: 'bg-apricot-dark', chip: 'bg-apricot-light text-apricot-dark' },
    kids: { label: 'Kids & youth', dot: 'bg-river-dark', chip: 'bg-river-light text-river-dark' },
    serve: { label: 'Serve', dot: 'bg-sage-dark', chip: 'bg-sage-light text-sage-dark' },
    classes: { label: 'Classes', dot: 'bg-rose', chip: 'bg-[#fbe4e8] text-rose' }
  };

  const EVENTS = [
    { id: 'youth-night', title: 'Youth Night', cat: 'kids', date: '2026-09-30', weekly: '2027-01-27', start: '18:30', end: '20:30', place: 'The Loft (upstairs, east entrance)', summary: 'Games, dinner, worship and small groups for grades 6–12. Bring a friend; first-timers eat free.' },
    { id: 'morning-prayer', title: 'Tuesday Morning Prayer', cat: 'worship', date: '2026-09-29', weekly: '2027-01-26', start: '07:00', end: '07:45', place: 'The Chapel, and on Zoom', summary: 'Forty-five quiet minutes of scripture and prayer before work. Coffee from 6:45.' },
    { id: 'river-trail-cleanup', title: 'River Trail Clean-up', cat: 'serve', date: '2026-10-17', start: '09:00', end: '12:00', place: 'Burcham Park trailhead, Lawrence', summary: 'We adopt two miles of the Kansas River trail. Gloves, grabbers and doughnuts provided; wear shoes you don’t love.' },
    { id: 'newcomers-lunch', title: 'Newcomers’ Lunch', cat: 'community', date: '2026-10-18', start: '12:30', end: '13:45', place: 'The River Room', summary: 'New to Riverbend? Have lunch with our pastors, ask anything and meet other people who are new too. Kids welcome; childcare in Room 104.' },
    { id: 'kids-volunteer-training', title: 'Kids Check-in Volunteer Training', cat: 'serve', date: '2026-10-21', start: '19:00', end: '20:30', place: 'Riverbend Kids wing', summary: 'Everything you need to serve on the Sunday check-in team, including our safeguarding training. Background checks can be done on the night.' },
    { id: 'block-party', title: 'Riverbend Block Party', cat: 'community', date: '2026-10-24', start: '11:00', end: '15:00', place: 'Riverside Avenue (closed to traffic)', summary: 'Food trucks, a bouncy castle, live music and a chili cook-off on the street outside the church. Free and for the whole neighborhood.' },
    { id: 'baptism-sunday', title: 'Baptism Sunday', cat: 'worship', date: '2026-10-25', start: '11:00', end: '12:30', place: 'Main auditorium', summary: 'We celebrate baptisms at the 11:00 gathering. Thinking about being baptized? Talk to any pastor by the Sunday before.' },
    { id: 'family-movie-night', title: 'Family Movie Night', cat: 'kids', date: '2026-10-30', start: '18:00', end: '20:00', place: 'The River Room', summary: 'A family film on the big screen, free popcorn and blankets on the floor. Rated G, pajamas encouraged.' },
    { id: 'starting-point', title: 'Starting Point', cat: 'classes', date: '2026-11-01', start: '16:00', end: '18:00', place: 'Room 210', summary: 'A two-hour class on who we are, what we believe and how to get involved. The first step toward membership, and dinner is included.' },
    { id: 'mens-breakfast', title: 'Men’s Breakfast', cat: 'community', date: '2026-11-07', start: '07:30', end: '09:00', place: 'The River Room', summary: 'Pancakes, bacon and an honest conversation. This month: fathers, sons and the things we never said.' },
    { id: 'pantry-packing', title: 'Pantry Packing Day', cat: 'serve', date: '2026-11-14', start: '09:00', end: '12:00', place: 'Riverbend Pantry (north door)', summary: 'Pack 300 family food boxes for the Riverbend Pantry. Great for families with children over eight.' },
    { id: 'grief-workshop', title: 'Grief Doesn’t Keep a Calendar', cat: 'classes', date: '2026-11-19', start: '18:30', end: '20:30', place: 'The Chapel', summary: 'A gentle evening workshop with Pastor Hannah Brooks for anyone carrying loss. Come alone or bring someone.' },
    { id: 'community-dinner', title: 'Community Dinner', cat: 'community', date: '2026-11-22', start: '17:00', end: '19:00', place: 'The River Room', summary: 'A free sit-down dinner for anyone in Lawrence. Bring a dish if you can, or just bring yourself.' },
    { id: 'worship-night', title: 'Night of Worship', cat: 'worship', date: '2026-12-04', start: '19:00', end: '20:30', place: 'Main auditorium', summary: 'An evening of songs, scripture and prayer with the Riverbend band and choir. Childcare available for under-fives.' },
    { id: 'kids-workshop', title: 'Kids’ Craft Workshop', cat: 'kids', date: '2026-12-05', start: '10:00', end: '12:00', place: 'Riverbend Kids wing', summary: 'Crafts, stories and snacks for kids aged 4–11 while parents get a quiet morning. Register at the kids’ desk.' },
    { id: 'quiet-service', title: 'A Quiet Evening Service', cat: 'worship', date: '2026-12-13', start: '17:00', end: '18:00', place: 'The Chapel', summary: 'A candlelit, unhurried service for anyone in a hard season. Short readings, silence and prayer. No band.' },
    { id: 'marriage-course', title: 'Marriage Course: Week 1', cat: 'classes', date: '2026-12-09', start: '19:00', end: '21:00', place: 'Room 210', summary: 'Seven evenings for couples, married or engaged. Dinner for two at candlelit tables, a short talk and private conversation.' }
  ];

  /* ------------------------------------------------------------------
   * 4. Groups, giving and visit settings
   * ------------------------------------------------------------------ */
  const DAYS = { sun: 'Sunday', mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday' };
  const AREAS = { downtown: 'Downtown & Old West', east: 'East Lawrence', west: 'West Lawrence', north: 'North Lawrence', campus: 'Near KU campus', online: 'Online' };
  const STAGES = { everyone: 'Everyone', 'young-adults': 'Young adults', students: 'Students', families: 'Families', women: 'Women', men: 'Men', 'second-half': '55 and over' };

  const GROUPS = [
    { id: 'mass-street-young-adults', name: 'Young Adults on Mass Street', day: 'tue', time: '19:00', area: 'downtown', stage: 'young-adults', host: 'Jess & Aaron Kim', where: 'Upstairs at Third Space Coffee', spots: 6, childcare: false, blurb: 'Twenty- and thirty-somethings working through the Sunday sermon over coffee. Mostly singles, a few newly-weds.' },
    { id: 'west-side-families', name: 'West Side Families', day: 'sun', time: '17:00', area: 'west', stage: 'families', host: 'The Okonkwo family', where: 'A home near Wakarusa Drive', spots: 3, childcare: true, blurb: 'Dinner together, then adults talk while a sitter runs a kids’ lesson in the basement.' },
    { id: 'north-lawrence-neighbors', name: 'North Lawrence Neighbors', day: 'thu', time: '18:30', area: 'north', stage: 'everyone', host: 'Pat & Glenn Hoffman', where: 'The Hoffmans’ porch (inside in winter)', spots: 5, childcare: false, blurb: 'A potluck group of all ages that has met on the same porch for eight years. Bring a side.' },
    { id: 'grad-students', name: 'Grad & Med Students', day: 'wed', time: '20:00', area: 'campus', stage: 'students', host: 'Samira Haddad', where: 'Room near Watson Library (KU)', spots: 8, childcare: false, blurb: 'A late-evening group that fits around lab and clinical schedules. Snacks and honest questions.' },
    { id: 'dawn-prayer', name: 'Dawn Prayer Online', day: 'tue', time: '06:30', area: 'online', stage: 'everyone', host: 'Pastor Hannah Brooks', where: 'Zoom, cameras optional', spots: 20, childcare: false, blurb: 'Twenty minutes of prayer before the day begins. Join from your kitchen, bed or commute.' },
    { id: 'women-in-the-word', name: 'Women in the Word', day: 'thu', time: '09:30', area: 'downtown', stage: 'women', host: 'Linda Ferris', where: 'Riverbend, Room 210', spots: 4, childcare: true, blurb: 'A morning Bible study for women of every age, with free childcare in the kids’ wing.' },
    { id: 'mens-breakfast-group', name: 'Saturday Men’s Breakfast', day: 'sat', time: '07:00', area: 'east', stage: 'men', host: 'Dale Morrison', where: 'Ladybird Diner booth (the big one)', spots: 2, childcare: false, blurb: 'Eggs, coffee and a chapter of Proverbs. Twelve men, one very patient waitress.' },
    { id: 'second-half', name: 'Second Half', day: 'mon', time: '19:00', area: 'west', stage: 'second-half', host: 'Ron & Marisol Vega', where: 'A home off Bob Billings Parkway', spots: 4, childcare: false, blurb: 'For empty-nesters and retirees asking what faithfulness looks like in the second half of life.' },
    { id: 'new-parents', name: 'New Parents Circle', day: 'sun', time: '12:30', area: 'downtown', stage: 'families', host: 'Bri & Tom Castellano', where: 'Riverbend, the Nursery Lounge', spots: 0, childcare: true, blurb: 'For parents of babies and toddlers. Bring the baby; we will hold them while you eat.' },
    { id: 'open-hands', name: 'Open Hands Recovery', day: 'fri', time: '19:00', area: 'downtown', stage: 'everyone', host: 'Kevin R.', where: 'Riverbend, the Chapel', spots: 15, childcare: false, blurb: 'A confidential twelve-step style group for anyone working through addiction or compulsive habits.' },
    { id: 'online-evening', name: 'Riverbend Online Group', day: 'wed', time: '19:30', area: 'online', stage: 'everyone', host: 'Alicia Grant', where: 'Zoom', spots: 9, childcare: false, blurb: 'For shift workers, caregivers and anyone who can’t get out in the evening. Same discussion, no commute.' },
    { id: 'grupo-espanol', name: 'Grupo en español', day: 'fri', time: '18:30', area: 'east', stage: 'everyone', host: 'Pastor Luis Herrera', where: 'A home in East Lawrence', spots: 6, childcare: true, blurb: 'Cena, oración y conversación en español. Families welcome, all ages.' },
    { id: 'east-lawrence-dinner', name: 'East Lawrence Dinner Group', day: 'mon', time: '18:00', area: 'east', stage: 'families', host: 'Marta & Joel Lindqvist', where: 'A home near Hobbs Park', spots: 1, childcare: true, blurb: 'Five families, eleven kids and a very long table. Loud, warm and always over by 8.' }
  ];

  // Giving: amounts for the chips, funds, and the card fee the "cover the fees" option adds.
  const GIVING = {
    amounts: [25, 50, 100, 250, 500],
    defaultAmount: 50,
    min: 1, max: 50000,
    fee: { percent: 2.2, fixed: 0.30 },
    funds: {
      general: 'General fund',
      pantry: 'Riverbend Pantry',
      partners: 'Global partners',
      'river-room': 'River Room renovation'
    }
  };

  // Plan your visit: how many upcoming Sundays to offer, and which kids' room each age goes to.
  const VISIT = {
    sundays: 4,
    maxAdults: 10,
    maxKids: 6,
    rooms: [
      { upTo: 2, name: 'Nursery', room: 'Room 101' },
      { upTo: 5, name: 'Preschool', room: 'Room 104' },
      { upTo: 10, name: 'Elementary', room: 'Rooms 106–108' },
      { upTo: 17, name: 'Youth', room: 'Stays with you in the service' }
    ]
  };

  /* ------------------------------------------------------------------
   * 5. Helpers and dates
   * ------------------------------------------------------------------ */
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.prototype.slice.call((root || document).querySelectorAll(sel));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  }
  // localStorage, or an in-memory stand-in when the browser blocks it (a sandboxed iframe, strict
  // privacy settings): saved state then lasts for this page view instead of the feature doing nothing.
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

  function read(key) {
    try { return JSON.parse(safeStorage.getItem(key)); } catch (e) { return null; }
  }
  function write(key, value) {
    try {
      if (value === null) safeStorage.removeItem(key);
      else safeStorage.setItem(key, JSON.stringify(value));
    } catch (e) { /* storage full or blocked: the page keeps working without it */ }
  }
  // The page's URL parameters with lower-case names, so ?ID= and ?id= both work.
  function urlParams() {
    const out = new URLSearchParams();
    new URLSearchParams(location.search).forEach((v, k) => out.append(k.toLowerCase(), v));
    return out;
  }
  // Values of a parameter that are keys of `allowed`: case-insensitive, comma-separated or repeated.
  function urlValues(params, name, allowed) {
    const out = [];
    params.getAll(name).join(',').split(',').forEach((v) => {
      const k = v.trim().toLowerCase();
      if (k && Object.prototype.hasOwnProperty.call(allowed, k) && out.indexOf(k) === -1) out.push(k);
    });
    return out;
  }
  // Replace the query string without adding a history entry.
  function setUrl(params) {
    const q = params.toString();
    history.replaceState(null, '', location.pathname + (q ? '?' + q : '') + location.hash);
  }
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : many); }
  function clamp(n, min, max) { return Math.min(max, Math.max(min, n)); }

  // Dates are whole day numbers (days since 1970-01-01) so time zones never shift them.
  function dayNum(ymd) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd || '');
    return m ? Math.round(Date.UTC(+m[1], +m[2] - 1, +m[3]) / 864e5) : NaN;
  }
  function ymd(day) { return new Date(day * 864e5).toISOString().slice(0, 10); }
  function weekday(day) { return ((day + 4) % 7 + 7) % 7; } // 0 = Sunday
  function fmtDay(day, opts) { return new Intl.DateTimeFormat('en-US', Object.assign({ timeZone: 'UTC' }, opts)).format(new Date(day * 864e5)); }
  const longDate = (day) => fmtDay(day, { weekday: 'long', month: 'long', day: 'numeric' });
  const shortDate = (day) => fmtDay(day, { month: 'short', day: 'numeric', year: 'numeric' });
  function mins(hhmm) { const p = String(hhmm).split(':'); return (+p[0]) * 60 + (+p[1] || 0); }
  // '18:30' → '6:30 pm'
  function fmtTime(hhmm) {
    const m = mins(hhmm);
    const h = Math.floor(m / 60) % 24;
    return ((h % 12) || 12) + ':' + String(m % 60).padStart(2, '0') + (h < 12 ? ' am' : ' pm');
  }

  // Wall-clock parts of an instant in the church's time zone (falls back to the visitor's).
  let tzFormat;
  try {
    tzFormat = new Intl.DateTimeFormat('en-US', { timeZone: CHURCH.timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
  } catch (e) {
    tzFormat = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
  }
  function tzParts(ms) {
    const p = {};
    tzFormat.formatToParts(new Date(ms)).forEach((x) => { p[x.type] = x.value; });
    return { day: dayNum(p.year + '-' + p.month + '-' + p.day), secs: (+p.hour % 24) * 3600 + (+p.minute) * 60 + (+p.second) };
  }
  // Today and the time of day at the church.
  function churchNow() { return tzParts(Date.now()); }
  // A church wall-clock time → real instant (handles daylight saving).
  function zonedToDate(day, minutes) {
    const guess = day * 864e5 + minutes * 6e4;
    const offset = (ms) => { const p = tzParts(ms); return (p.day * 864e5 + p.secs * 1000) - ms; };
    let utc = guess - offset(guess);
    const second = guess - offset(utc);
    if (second !== utc) utc = second;
    return new Date(utc);
  }

  const TODAY = churchNow().day;
  const SHIFT = KEEP_DEMO_CURRENT ? Math.floor((TODAY - dayNum(DEMO_ANCHOR)) / 7) * 7 : 0;
  SERMONS.forEach((s) => { s.day = dayNum(s.date) + SHIFT; });
  SERMONS.sort((a, b) => b.day - a.day);
  EVENTS.forEach((e) => { e.day = dayNum(e.date) + SHIFT; if (e.weekly) e.until = dayNum(e.weekly) + SHIFT; });

  // Every occurrence of every event, sorted by date and time.
  const OCCURRENCES = (function () {
    const out = [];
    EVENTS.forEach((e) => {
      const last = e.weekly ? e.until : e.day;
      for (let d = e.day; d <= last; d += 7) out.push({ ev: e, day: d, key: e.id + '-' + ymd(d) });
    });
    return out.sort((a, b) => a.day - b.day || mins(a.ev.start) - mins(b.ev.start));
  })();

  function findSermon(id) { return SERMONS.find((s) => s.id === String(id || '').trim().toLowerCase()) || null; }
  // 2322 → '38:42'; 3725 → '1:02:05'
  function clock(sec) {
    sec = Math.max(0, Math.round(sec));
    const h = Math.floor(sec / 3600), m = Math.floor(sec / 60) % 60, s = sec % 60;
    return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(s).padStart(2, '0');
  }
  function spokenTime(sec) {
    sec = Math.max(0, Math.round(sec));
    const m = Math.floor(sec / 60), s = sec % 60;
    return (m ? plural(m, 'minute', 'minutes') + ' ' : '') + plural(s, 'second', 'seconds');
  }

  /* ------------------------------------------------------------------
   * 6. Artwork: avatars, series covers and icons (all SVG)
   * ------------------------------------------------------------------ */
  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    const f = (v) => clamp(Math.round(v + amt * (amt < 0 ? v : 255 - v)), 0, 255);
    return '#' + [f(n >> 16), f((n >> 8) & 255), f(n & 255)].map((v) => v.toString(16).padStart(2, '0')).join('');
  }
  function seeded(seed) {
    let s = 0;
    for (let i = 0; i < seed.length; i++) s = (s * 31 + seed.charCodeAt(i)) >>> 0;
    return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  }

  // A friendly flat portrait. `label` makes it an image with alt text; otherwise decorative.
  function avatar(id, label) {
    const p = PEOPLE[id];
    if (!p) return '';
    const a = p.avatar;
    const hair = a.hair;
    const skinDark = shade(a.skin, -0.18);
    let back = '', front = '';
    if (a.style === 'long') {
      back = `<path d="M33 52c0-22 12-34 27-34s27 12 27 34v44c-8 4-46 4-54 0z" fill="${hair}"/>`;
      front = `<path d="M37 52c1-19 10-28 23-28 14 0 23 9 23 26-9-2-18-8-23-16-4 9-12 15-23 18z" fill="${hair}"/>`;
    } else if (a.style === 'bun') {
      back = `<circle cx="60" cy="20" r="11" fill="${hair}"/>`;
      front = `<path d="M37 54c-1-20 9-31 23-31s24 11 23 31c-3-10-11-17-23-17s-20 7-23 17z" fill="${hair}"/>`;
    } else if (a.style === 'curly') {
      for (let i = 0; i < 9; i++) {
        const ang = Math.PI * (1.05 + i * 0.112);
        back += `<circle cx="${(60 + 23 * Math.cos(ang)).toFixed(1)}" cy="${(48 + 21 * Math.sin(ang)).toFixed(1)}" r="9" fill="${hair}"/>`;
      }
      front = `<path d="M38 50c2-14 11-22 22-22s20 8 22 22c-6-6-14-9-22-9s-16 3-22 9z" fill="${hair}"/>`;
    } else if (a.style === 'coily') {
      back = `<circle cx="60" cy="44" r="31" fill="${hair}"/>`;
      front = `<path d="M39 50c3-12 11-18 21-18s18 6 21 18c-6-4-13-6-21-6s-15 2-21 6z" fill="${hair}"/>`;
    } else if (a.style === 'waves') {
      front = `<path d="M37 54c-2-21 9-32 24-32 13 0 23 9 22 26-6-6-11-9-17-9-3 6-11 10-21 10-3 1-6 3-8 5z" fill="${hair}"/>`;
    } else if (a.style === 'short') {
      front = `<path d="M38 52c-2-18 8-29 22-29s24 10 22 29c-2-8-6-12-10-13-8 3-20 3-28-1-3 3-5 8-6 14z" fill="${hair}"/>`;
    } else { // bald
      front = `<path d="M44 36c5-6 11-8 16-8s11 2 16 8c-5-2-10-3-16-3s-11 1-16 3z" fill="${skinDark}" opacity=".5"/>`;
    }
    const beard = a.beard ? `<path d="M40 60c2 15 10 23 20 23s18-8 20-23c-4 6-9 7-12 7-3-2-13-2-16 0-3 0-8-1-12-7z" fill="${hair}"/>` : '';
    const glasses = a.glasses ? `<g fill="none" stroke="#2b1b36" stroke-width="2"><circle cx="51.5" cy="57" r="6.2"/><circle cx="68.5" cy="57" r="6.2"/><path d="M57.7 57h4.6"/></g>` : '';
    const role = label ? `role="img" aria-label="${escapeHtml(label)}"` : 'aria-hidden="true" focusable="false"';
    return `<svg viewBox="0 0 120 120" ${role}><rect width="120" height="120" fill="${a.bg}"/><circle cx="96" cy="22" r="30" fill="#fff" opacity=".22"/>` +
      `<path d="M16 122c2-24 20-37 44-37s42 13 44 37z" fill="${a.shirt}"/><path d="M50 84c3 5 7 7 10 7s7-2 10-7z" fill="${skinDark}"/>` +
      back + `<rect x="51" y="66" width="18" height="20" rx="7" fill="${skinDark}"/>` +
      `<circle cx="38.5" cy="58" r="4.5" fill="${a.skin}"/><circle cx="81.5" cy="58" r="4.5" fill="${a.skin}"/><ellipse cx="60" cy="55" rx="21.5" ry="24.5" fill="${a.skin}"/>` +
      `<circle cx="47" cy="66" r="3.5" fill="#f6a96b" opacity=".35"/><circle cx="73" cy="66" r="3.5" fill="#f6a96b" opacity=".35"/>` +
      beard + front +
      `<circle cx="52" cy="57.5" r="2.1" fill="#2b1b36"/><circle cx="68" cy="57.5" r="2.1" fill="#2b1b36"/>` +
      `<path d="M54 67.5q6 5 12 0" fill="none" stroke="#2b1b36" stroke-width="2.1" stroke-linecap="round"/>` + glasses + '</svg>';
  }

  // Series cover art, 320×200, drawn from the series' `art` motif. `v` (e.g. the sermon's
  // part number) shifts the composition so each message in a series looks a little different.
  function seriesArt(key, v) {
    const s = SERIES[key];
    v = v || 0;
    const rnd = seeded(key + v);
    let g = '';
    if (!s) return '';
    if (s.art === 'table') {
      g = '<rect width="320" height="200" fill="#fde3cc"/><circle cx="276" cy="30" r="70" fill="#f6a96b" opacity=".5"/>' +
        '<ellipse cx="160" cy="138" rx="124" ry="44" fill="#431d52"/><ellipse cx="160" cy="130" rx="124" ry="44" fill="#5b2a6e"/>';
      const seats = 5 + (v % 3);
      for (let i = 0; i < seats; i++) {
        const ang = (i / seats) * Math.PI * 2 + 0.3 + v * 0.35;
        const x = 160 + 88 * Math.cos(ang), y = 130 + 28 * Math.sin(ang);
        g += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="17" ry="7" fill="#fffdf9"/><ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="10" ry="4" fill="#f4eadb"/>`;
      }
      g += '<ellipse cx="160" cy="128" rx="34" ry="11" fill="#e39a5c"/><path d="M134 126q26-16 52 0" fill="#f6b27a"/>' +
        '<rect x="196" y="98" width="5" height="26" rx="2" fill="#fffdf9"/><path d="M198.5 86c4 5 4 9 0 12-4-3-4-7 0-12z" fill="#f6a96b"/>';
    } else if (s.art === 'sun') {
      const sx = 120 + (v % 4) * 40, sy = 84 + (v % 2) * 14;
      g = `<rect width="320" height="200" fill="#e3f0f6"/><circle cx="${sx}" cy="${sy}" r="40" fill="#f6a96b"/>`;
      for (let i = 0; i < 12; i++) {
        const ang = (i / 12) * Math.PI * 2;
        g += `<path d="M${(sx + 52 * Math.cos(ang)).toFixed(1)} ${(sy + 52 * Math.sin(ang)).toFixed(1)}L${(sx + 64 * Math.cos(ang)).toFixed(1)} ${(sy + 64 * Math.sin(ang)).toFixed(1)}" stroke="#f6a96b" stroke-width="5" stroke-linecap="round"/>`;
      }
      g += '<path d="M0 132c50-30 100-34 160-12s110 18 160-8v88H0z" fill="#c9dcc0"/><path d="M0 160c60-26 120-20 180-2s100 12 140-4v46H0z" fill="#8fb486"/><path d="M0 186c80-14 160-14 320-4v18H0z" fill="#33603b"/>' +
        '<path d="M70 52q6-6 12 0q6-6 12 0M98 40q4-4 8 0q4-4 8 0" fill="none" stroke="#2b1b36" stroke-width="2.4" stroke-linecap="round"/>';
    } else if (s.art === 'wheat') {
      g = '<rect width="320" height="200" fill="#f7e2b5"/><circle cx="250" cy="58" r="34" fill="#fffdf9" opacity=".7"/><path d="M0 170h320v30H0z" fill="#d79a3c"/>';
      for (let i = 0; i < 16; i++) {
        const x = 12 + i * 19 + rnd() * 8, top = 70 + rnd() * 50, lean = (rnd() - 0.5) * 20;
        const tx = x + lean;
        g += `<path d="M${x.toFixed(1)} 200Q${(x + lean / 2).toFixed(1)} ${(top + 60).toFixed(1)} ${tx.toFixed(1)} ${top.toFixed(1)}" fill="none" stroke="#b9772a" stroke-width="2.4"/>`;
        for (let k = 0; k < 4; k++) {
          const yy = top + k * 9;
          g += `<ellipse cx="${(tx - 4).toFixed(1)}" cy="${yy.toFixed(1)}" rx="3.6" ry="7" transform="rotate(-28 ${(tx - 4).toFixed(1)} ${yy.toFixed(1)})" fill="#c98a2e"/><ellipse cx="${(tx + 4).toFixed(1)}" cy="${yy.toFixed(1)}" rx="3.6" ry="7" transform="rotate(28 ${(tx + 4).toFixed(1)} ${yy.toFixed(1)})" fill="#c98a2e"/>`;
        }
        g += `<ellipse cx="${tx.toFixed(1)}" cy="${(top - 6).toFixed(1)}" rx="3.4" ry="7" fill="#c98a2e"/>`;
      }
    } else {
      const mx = 84 + (v % 3) * 60;
      g = `<rect width="320" height="200" fill="#efe5f5"/><circle cx="${mx}" cy="62" r="26" fill="#fffdf9"/><circle cx="${mx + 12}" cy="56" r="24" fill="#efe5f5"/>`;
      for (let i = 0; i < 6; i++) {
        const y = 108 + i * 17;
        g += `<path d="M-10 ${y}q20-10 40 0t40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0" fill="none" stroke="#5b2a6e" stroke-width="3" stroke-linecap="round" opacity="${(0.25 + i * 0.13).toFixed(2)}"/>`;
      }
      const bx = 30 + ((v * 97) % 230);
      g += `<g transform="translate(${bx - 206} 0)"><path d="M206 104h52l-8 12h-36z" fill="#f6a96b"/><path d="M231 104V74l18 26z" fill="#fffdf9"/></g>`;
    }
    return `<svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">${g}</svg>`;
  }

  const ICON = {
    play: '<svg viewBox="0 0 24 24" class="h-6 w-6 translate-x-px" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l11-6.5a1 1 0 0 0 0-1.72l-11-6.5A1 1 0 0 0 8 5.5z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" class="h-6 w-6" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4.5" height="14" rx="1.2"/><rect x="13.5" y="5" width="4.5" height="14" rx="1.2"/></svg>',
    back: '<svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.6-5.9"/><path d="M4 4v4.5h4.5"/><text x="12" y="15.6" text-anchor="middle" font-size="7.5" font-weight="800" fill="currentColor" stroke="none" font-family="Nunito Sans, sans-serif">15</text></svg>',
    fwd: '<svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20 4v4.5h-4.5"/><text x="12" y="15.6" text-anchor="middle" font-size="7.5" font-weight="800" fill="currentColor" stroke="none" font-family="Nunito Sans, sans-serif">15</text></svg>',
    clock: '<svg viewBox="0 0 20 20" class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="10" cy="10" r="7.5"/><path d="M10 6v4l2.5 2"/></svg>',
    pin: '<svg viewBox="0 0 20 20" class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M10 18s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10z"/><circle cx="10" cy="8" r="2"/></svg>',
    cal: '<svg viewBox="0 0 20 20" class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4.5" width="14" height="12.5" rx="2"/><path d="M3 8.5h14M7 3v3M13 3v3"/></svg>',
    user: '<svg viewBox="0 0 20 20" class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="10" cy="7" r="3.2"/><path d="M4 17c.8-3.2 3.2-5 6-5s5.2 1.8 6 5"/></svg>',
    arrow: '<svg viewBox="0 0 20 20" class="h-4 w-4 shrink-0 transition group-hover:translate-x-0.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 10h12M11 5l5 5-5 5"/></svg>'
  };

  // [data-avatar="dana"] and [data-series-art="open-table"] placeholders in the HTML.
  function hydrateArt(root) {
    $$('[data-avatar]', root).forEach((el) => {
      const p = PEOPLE[el.getAttribute('data-avatar')];
      if (p) el.innerHTML = avatar(el.getAttribute('data-avatar'), el.hasAttribute('data-decorative') ? '' : 'Portrait of ' + p.name);
    });
    $$('[data-series-art]', root).forEach((el) => { el.innerHTML = seriesArt(el.getAttribute('data-series-art')); });
  }

  /* ------------------------------------------------------------------
   * 7. Header, mobile menu, scroll reveal, service status and countdown
   * ------------------------------------------------------------------ */
  const menuBtn = $('#menu-toggle');
  const menu = $('#mobile-menu');
  function setMenu(open) {
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.hidden = !open;
    $('[data-icon-open]', menuBtn).classList.toggle('hidden', open);
    $('[data-icon-close]', menuBtn).classList.toggle('hidden', !open);
  }
  if (menuBtn && menu) {
    menuBtn.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') { setMenu(false); menuBtn.focus(); }
    });
    window.matchMedia('(min-width: 1024px)').addEventListener('change', (m) => { if (m.matches) setMenu(false); });
  }

  // Header border and shadow once the page scrolls.
  const header = $('#site-header');
  if (header) {
    const onScroll = () => {
      const on = window.scrollY > 8;
      header.classList.toggle('shadow-soft', on);
      header.classList.toggle('border-line', on);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  const revealObserver = ('IntersectionObserver' in window && !reduceMotion)
    ? new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          // Reveal this element and everything above it, so fast jumps never leave gaps.
          const top = en.target.getBoundingClientRect().top;
          $$('.reveal:not(.is-visible)').forEach((el) => {
            if (el.getBoundingClientRect().top <= top) { el.classList.add('is-visible'); revealObserver.unobserve(el); }
          });
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 })
    : null;
  function reveal(root) {
    $$('.reveal:not(.is-visible)', root).forEach((el) => {
      if (revealObserver) revealObserver.observe(el); else el.classList.add('is-visible');
    });
  }

  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  // The service happening now, or the next one: { live, service, day, startsIn (seconds) }.
  // Add ?live=1 to any URL to preview the "live" state.
  function serviceState() {
    const now = churchNow();
    const weekSecs = weekday(now.day) * 86400 + now.secs;
    const forceLive = urlParams().get('live') === '1';
    let best = null;
    SERVICES.forEach((s) => {
      const start = s.day * 86400 + mins(s.start) * 60;
      const end = start + s.minutes * 60;
      const live = (weekSecs >= start && weekSecs < end) || (weekSecs + 604800 >= start && weekSecs + 604800 < end);
      let wait = (start - weekSecs + 604800) % 604800;
      if (live) wait = 0;
      if (!best || (live && !best.live) || (!best.live && wait < best.startsIn)) {
        best = { live, service: s, startsIn: wait, day: now.day + Math.floor((now.secs + wait) / 86400) };
      }
    });
    if (forceLive && best && !best.live) {
      best = { live: true, service: SERVICES[0], startsIn: 0, day: now.day };
    }
    if (best && best.live) {
      // A live service started today (or late last night for services that cross midnight).
      best.day = now.day - (now.secs < mins(best.service.start) * 60 && !forceLive ? 1 : 0);
    }
    return best;
  }

  function updateStatus() {
    const st = serviceState();
    if (!st) return;
    $$('[data-service-status]').forEach((el) => {
      el.innerHTML = st.live
        ? '<span class="live-dot chip-dot bg-[#ff6b7f]" aria-hidden="true"></span><span>Live now: ' + escapeHtml(st.service.name) + '</span> <a href="' + CHURCH.liveUrl + '" class="font-bold text-apricot underline underline-offset-4">Watch</a>'
        : '<span class="chip-dot bg-apricot" aria-hidden="true"></span><span>Next gathering: ' + escapeHtml(fmtDay(st.day, { weekday: 'long' })) + ' at ' + fmtTime(st.service.start) + '</span>';
    });
    // "This Sunday" dates on the home and visit pages: the next Sunday with a service still to come.
    const sunday = st.day + ((7 - weekday(st.day)) % 7);
    $$('[data-this-sunday]').forEach((el) => { el.textContent = fmtDay(sunday, { weekday: 'long', month: 'long', day: 'numeric' }); });
  }

  // <div data-countdown> on the home and sermons pages.
  function initCountdowns() {
    const boxes = $$('[data-countdown]');
    if (!boxes.length) return;
    let lastState = '';
    function render() {
      const st = serviceState();
      if (!st) return;
      const stateKey = st.live ? 'live' : 'next-' + st.day + st.service.start;
      if (stateKey !== lastState) {
        lastState = stateKey;
        boxes.forEach((box) => {
          const dark = box.hasAttribute('data-dark');
          box.innerHTML = st.live
            ? `<p class="flex items-center gap-2.5 text-sm font-extrabold uppercase tracking-[0.14em] ${dark ? 'text-[#ffb3bd]' : 'text-rose'}"><span class="live-dot chip-dot size-2.5 bg-rose" aria-hidden="true"></span>Live now</p>
               <p class="mt-2 font-display text-2xl font-extrabold">${escapeHtml(st.service.name)}</p>
               <p class="mt-1 text-sm ${dark ? 'text-white/80' : 'text-muted'}">Started at ${fmtTime(st.service.start)} ${escapeHtml(CHURCH.timeZoneLabel)}. Join us online or come as you are.</p>
               <a href="${CHURCH.liveUrl}" class="${dark ? 'btn-warm' : 'btn-primary'} mt-5 w-full sm:w-auto">Watch live</a>`
            : `<p class="text-sm font-bold ${dark ? 'text-white/80' : 'text-muted'}">Next gathering starts in</p>
               <div class="mt-3 grid grid-cols-4 gap-2 text-center" aria-hidden="true">
                 ${['days', 'hours', 'min', 'sec'].map((u) => `<div class="rounded-2xl ${dark ? 'bg-white/10' : 'bg-sand'} px-1 py-2.5"><span data-cd="${u}" class="block font-display text-2xl font-extrabold tabular-nums sm:text-[1.75rem]">0</span><span class="block text-[11px] font-bold uppercase tracking-wider ${dark ? 'text-white/75' : 'text-muted'}">${u}</span></div>`).join('')}
               </div>
               <p class="sr-only" data-cd="spoken"></p>
               <p class="mt-3 text-sm font-semibold">${escapeHtml(longDate(st.day))} · ${fmtTime(st.service.start)} <span class="font-normal ${dark ? 'text-white/75' : 'text-muted'}">${escapeHtml(CHURCH.timeZoneLabel)}</span></p>`;
        });
      }
      if (!st.live) {
        const t = st.startsIn;
        const parts = { days: Math.floor(t / 86400), hours: Math.floor(t / 3600) % 24, min: Math.floor(t / 60) % 60, sec: t % 60 };
        boxes.forEach((box) => {
          Object.keys(parts).forEach((k) => { const el = $('[data-cd="' + k + '"]', box); if (el) el.textContent = k === 'days' ? parts[k] : String(parts[k]).padStart(2, '0'); });
          const spoken = $('[data-cd="spoken"]', box);
          const text = 'Starts in ' + plural(parts.days, 'day', 'days') + ', ' + plural(parts.hours, 'hour', 'hours') + ' and ' + plural(parts.min, 'minute', 'minutes') + '.';
          if (spoken && spoken.textContent !== text) spoken.textContent = text;
        });
      }
    }
    render();
    setInterval(render, 1000);
  }

  /* ------------------------------------------------------------------
   * 8. Audio player
   *    Uses the <audio> element when the sermon has an `audio` URL;
   *    otherwise it simulates playback over the sermon's `duration`.
   *    Keys while focus is in the player: Space/K play-pause, J/L ±15 s,
   *    arrows on the slider ±5 s, Home/End jump to start/end.
   * ------------------------------------------------------------------ */
  const SPEEDS = [1, 1.25, 1.5, 1.75, 2, 0.75];
  const players = [];

  // Saved positions: { sermonId: seconds }. Only known ids and sensible numbers survive.
  function readProgress() {
    const raw = read(PROGRESS_KEY);
    const out = {};
    if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
      Object.keys(raw).forEach((id) => {
        const s = findSermon(id);
        const v = Number(raw[id]);
        if (s && isFinite(v) && v >= 5 && v < s.duration - 5) out[s.id] = Math.floor(v);
      });
    }
    return out;
  }
  function saveProgress(id, seconds) {
    const all = readProgress();
    if (seconds === null) delete all[id]; else all[id] = Math.floor(seconds);
    write(PROGRESS_KEY, Object.keys(all).length ? all : null);
  }

  function playerMarkup(s) {
    const sp = PEOPLE[s.speaker];
    return `<div class="player-dark relative overflow-hidden rounded-[1.75rem] bg-ink p-5 text-white shadow-lift sm:p-7" data-player="${s.id}" role="group" aria-label="Audio player: ${escapeHtml(s.title)}">
      <svg viewBox="0 0 400 120" class="pointer-events-none absolute -right-10 -top-6 w-80 text-white/[.06]" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><path d="M0 30q25-18 50 0t50 0 50 0 50 0 50 0 50 0 50 0 50 0M0 60q25-18 50 0t50 0 50 0 50 0 50 0 50 0 50 0 50 0M0 90q25-18 50 0t50 0 50 0 50 0 50 0 50 0 50 0 50 0"/></svg>
      <audio preload="none"${s.audio ? ' src="' + escapeHtml(s.audio) + '"' : ''}></audio>
      <div class="relative flex items-center gap-4">
        <button type="button" data-p="toggle" class="grid size-14 shrink-0 place-items-center rounded-full bg-apricot text-ink shadow-soft transition hover:scale-105" aria-label="Play">${ICON.play}</button>
        <div class="min-w-0 flex-1">
          <p class="truncate font-display text-lg font-extrabold leading-tight sm:text-xl">${escapeHtml(s.title)}</p>
          <p class="mt-0.5 truncate text-sm text-white/75">${escapeHtml(sp ? sp.name : '')} · ${escapeHtml(s.passage)}</p>
        </div>
      </div>
      <div class="relative mt-5">
        <input type="range" class="scrub block" data-p="scrub" min="0" max="${s.duration}" step="5" value="0" aria-label="Seek">
        <div class="mt-2 flex justify-between text-xs font-bold tabular-nums text-white/75"><span data-p="current">0:00</span><span data-p="remaining">-${clock(s.duration)}</span></div>
      </div>
      <div class="relative mt-3 flex items-center justify-between gap-3">
        <div class="flex items-center gap-1">
          <button type="button" data-p="back" class="grid size-11 place-items-center rounded-full text-white/90 transition hover:bg-white/10" aria-label="Back 15 seconds">${ICON.back}</button>
          <button type="button" data-p="fwd" class="grid size-11 place-items-center rounded-full text-white/90 transition hover:bg-white/10" aria-label="Forward 15 seconds">${ICON.fwd}</button>
        </div>
        <p data-p="resume" class="hidden text-xs font-semibold text-apricot"></p>
        <button type="button" data-p="speed" class="min-w-16 rounded-full px-3 py-2 text-sm font-extrabold tabular-nums ring-1 ring-white/30 transition ring-inset hover:bg-white/10" aria-label="Playback speed 1×">1×</button>
      </div>
      ${s.audio ? '' : '<p class="relative mt-4 border-t border-white/10 pt-3 text-xs text-white/70">Demo player: no audio file is attached, so playback is simulated over the sermon’s length.</p>'}
      <p class="sr-only" data-p="announce" aria-live="polite"></p>
    </div>`;
  }

  function initPlayer(root, s) {
    const audio = $('audio', root);
    const btn = $('[data-p="toggle"]', root);
    const scrub = $('[data-p="scrub"]', root);
    const cur = $('[data-p="current"]', root);
    const rem = $('[data-p="remaining"]', root);
    const speedBtn = $('[data-p="speed"]', root);
    const announce = $('[data-p="announce"]', root);
    const resume = $('[data-p="resume"]', root);
    const real = !!s.audio;
    let duration = s.duration;
    let t = readProgress()[s.id] || 0;
    let playing = false, rate = 1, timer = null, last = 0, lastSaved = 0;

    if (t) { resume.textContent = 'Resuming at ' + clock(t); resume.classList.remove('hidden'); }

    const time = () => (real && audio.readyState > 0 ? audio.currentTime : t);
    function render() {
      const now = time();
      scrub.max = Math.round(duration);
      scrub.value = Math.round(now);
      scrub.style.setProperty('--pct', (duration ? (now / duration) * 100 : 0) + '%');
      scrub.setAttribute('aria-valuetext', spokenTime(now) + ' of ' + spokenTime(duration));
      cur.textContent = clock(now);
      rem.textContent = '-' + clock(duration - now);
    }
    function setPlaying(p) {
      playing = p;
      btn.innerHTML = p ? ICON.pause : ICON.play;
      btn.setAttribute('aria-label', p ? 'Pause' : 'Play');
      root.classList.toggle('is-playing', p);
    }
    function save() {
      const now = time();
      lastSaved = now;
      saveProgress(s.id, now >= duration - 5 || now < 5 ? null : now);
    }
    function tick() {
      const n = performance.now();
      t = Math.min(duration, t + ((n - last) / 1000) * rate);
      last = n;
      render();
      if (Math.abs(t - lastSaved) >= 5) save();
      if (t >= duration) { pause(); t = 0; saveProgress(s.id, null); render(); announce.textContent = 'Finished.'; }
    }
    function play() {
      players.forEach((p) => { if (p !== api) p.pause(); });
      resume.classList.add('hidden');
      if (real) {
        const pr = audio.play();
        if (pr && pr.catch) pr.catch(() => setPlaying(false));
      } else {
        last = performance.now();
        clearInterval(timer);
        timer = setInterval(tick, 250);
      }
      setPlaying(true);
    }
    function pause() {
      if (!playing) return;
      if (real) audio.pause();
      else { clearInterval(timer); timer = null; }
      setPlaying(false);
      save();
    }
    function seek(x) {
      x = clamp(x, 0, duration);
      if (real && audio.readyState > 0) audio.currentTime = x;
      t = x;
      render();
      save();
    }
    const api = { pause, play, id: s.id };
    players.push(api);

    if (real) {
      audio.addEventListener('loadedmetadata', () => {
        if (isFinite(audio.duration) && audio.duration > 0) duration = audio.duration;
        if (t) audio.currentTime = t;
        audio.playbackRate = rate;
        render();
      });
      audio.addEventListener('timeupdate', () => { t = audio.currentTime; render(); if (Math.abs(t - lastSaved) >= 5) save(); });
      audio.addEventListener('pause', () => { if (playing) { setPlaying(false); save(); } });
      audio.addEventListener('play', () => setPlaying(true));
      audio.addEventListener('ended', () => { setPlaying(false); saveProgress(s.id, null); announce.textContent = 'Finished.'; });
    }

    btn.addEventListener('click', () => (playing ? pause() : play()));
    $('[data-p="back"]', root).addEventListener('click', () => seek(time() - 15));
    $('[data-p="fwd"]', root).addEventListener('click', () => seek(time() + 15));
    scrub.addEventListener('input', () => seek(+scrub.value));
    speedBtn.addEventListener('click', () => {
      rate = SPEEDS[(SPEEDS.indexOf(rate) + 1) % SPEEDS.length];
      if (real) audio.playbackRate = rate;
      speedBtn.textContent = rate + '×';
      speedBtn.setAttribute('aria-label', 'Playback speed ' + rate + '×');
      announce.textContent = 'Speed ' + rate + '×';
    });
    root.addEventListener('keydown', (e) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const k = e.key.toLowerCase();
      const onButton = e.target.tagName === 'BUTTON';
      if (k === 'k' || (k === ' ' && !onButton)) { e.preventDefault(); playing ? pause() : play(); }
      else if (k === 'j') { e.preventDefault(); seek(time() - 15); }
      else if (k === 'l') { e.preventDefault(); seek(time() + 15); }
    });
    window.addEventListener('pagehide', () => { if (playing) save(); });
    render();
    return api;
  }

  function mountPlayer(el, s) {
    el.innerHTML = playerMarkup(s);
    initPlayer($('[data-player]', el), s);
  }

  /* ------------------------------------------------------------------
   * 9. Sermon archive — series, speaker and book filters, search, URL state
   *    sermons.html?series=open-table&speaker=dana&book=luke&q=table
   * ------------------------------------------------------------------ */
  function sermonCard(s, progress) {
    const sp = PEOPLE[s.speaker];
    const series = SERIES[s.series];
    const pos = progress && progress[s.id];
    return `<article class="card card-hover group relative flex flex-col overflow-hidden">
      <div class="art relative aspect-[16/10] overflow-hidden">${seriesArt(s.series, s.part)}
        <span class="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-ink/85 px-2.5 py-1 text-xs font-bold tabular-nums text-white">${ICON.clock}${clock(s.duration)}</span>
        ${pos ? `<span class="absolute bottom-3 left-3 rounded-full bg-apricot px-2.5 py-1 text-xs font-bold text-ink">Resume at ${clock(pos)}</span>` : ''}
      </div>
      <div class="flex flex-1 flex-col p-5 sm:p-6">
        <p class="text-xs font-extrabold uppercase tracking-[0.14em] text-apricot-dark">${escapeHtml(series ? series.title : '')}</p>
        <h3 class="mt-2 font-display text-xl font-extrabold leading-snug"><a href="sermon.html?id=${s.id}" class="after:absolute after:inset-0 after:content-[''] focus:outline-none">${escapeHtml(s.title)}</a></h3>
        <p class="mt-2 text-sm text-muted">${escapeHtml(s.passage)}</p>
        <div class="mt-auto flex items-center gap-3 pt-5 text-sm">
          <span class="size-9 shrink-0 overflow-hidden rounded-full">${avatar(s.speaker, '')}</span>
          <span class="min-w-0"><span class="block truncate font-bold">${escapeHtml(sp ? sp.name : '')}</span><span class="block text-muted">${shortDate(s.day)}</span></span>
        </div>
      </div>
    </article>`;
  }

  function initSermons() {
    const list = $('#sermon-list');
    if (!list) return;
    const form = $('#sermon-filters');
    const count = $('#sermon-count');
    const empty = $('#sermon-empty');
    const sel = { series: $('#f-series'), speaker: $('#f-speaker'), book: $('#f-book') };
    const search = $('#f-search');
    const speakers = {};
    SERMONS.forEach((s) => { speakers[s.speaker] = PEOPLE[s.speaker].name; });
    const books = {};
    SERMONS.forEach((s) => { books[s.book] = BOOKS[s.book] || s.book; });
    const sources = { series: Object.fromEntries(Object.keys(SERIES).map((k) => [k, SERIES[k].title])), speaker: speakers, book: books };
    Object.keys(sel).forEach((k) => {
      Object.keys(sources[k]).forEach((v) => {
        const o = document.createElement('option');
        o.value = v; o.textContent = sources[k][v];
        sel[k].appendChild(o);
      });
    });

    // Series cards above the list.
    const strip = $('#series-strip');
    if (strip) {
      strip.innerHTML = Object.keys(SERIES).map((k) => {
        const n = SERMONS.filter((s) => s.series === k).length;
        return `<li><button type="button" data-series="${k}" aria-pressed="false" class="group card card-hover flex w-full flex-col overflow-hidden text-left aria-pressed:ring-2 aria-pressed:ring-plum">
          <span class="art block aspect-[16/9] overflow-hidden">${seriesArt(k)}</span>
          <span class="block p-4"><span class="block font-display text-lg font-extrabold leading-tight">${escapeHtml(SERIES[k].title)}</span><span class="mt-1 block text-sm text-muted">${plural(n, 'message', 'messages')} · ${escapeHtml(SERIES[k].subtitle)}</span></span>
        </button></li>`;
      }).join('');
      strip.addEventListener('click', (e) => {
        const b = e.target.closest('[data-series]');
        if (!b) return;
        sel.series.value = sel.series.value === b.dataset.series ? '' : b.dataset.series;
        apply(true);
        list.scrollIntoView({ block: 'start', behavior: reduceMotion ? 'auto' : 'smooth' });
      });
    }

    const params = urlParams();
    Object.keys(sel).forEach((k) => { const v = urlValues(params, k, sources[k]); sel[k].value = v[0] || ''; });
    search.value = (params.get('q') || '').slice(0, 80);

    function apply(writeUrl) {
      const q = search.value.trim().toLowerCase();
      const words = q.split(/\s+/).filter(Boolean);
      const f = { series: sel.series.value, speaker: sel.speaker.value, book: sel.book.value };
      const hits = SERMONS.filter((s) => {
        if (f.series && s.series !== f.series) return false;
        if (f.speaker && s.speaker !== f.speaker) return false;
        if (f.book && s.book !== f.book) return false;
        if (!words.length) return true;
        const hay = [s.title, s.passage, s.summary, SERIES[s.series].title, PEOPLE[s.speaker].name].join(' ').toLowerCase();
        return words.every((w) => hay.indexOf(w) !== -1);
      });
      const progress = readProgress();
      list.innerHTML = hits.map((s) => '<li class="flex">' + sermonCard(s, progress).replace('<article class="', '<article class="w-full ') + '</li>').join('');
      empty.hidden = hits.length > 0;
      count.textContent = hits.length === SERMONS.length ? 'Showing all ' + SERMONS.length + ' sermons' : 'Showing ' + plural(hits.length, 'sermon', 'sermons') + ' of ' + SERMONS.length;
      $$('[data-series]', strip).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.series === f.series)));
      $('#f-clear').hidden = !(f.series || f.speaker || f.book || q);
      if (writeUrl) {
        const p = new URLSearchParams();
        Object.keys(f).forEach((k) => { if (f[k]) p.set(k, f[k]); });
        if (q) p.set('q', search.value.trim());
        setUrl(p);
      }
    }
    Object.keys(sel).forEach((k) => sel[k].addEventListener('change', () => apply(true)));
    let tmr;
    search.addEventListener('input', () => { clearTimeout(tmr); tmr = setTimeout(() => apply(true), 180); });
    form.addEventListener('submit', (e) => { e.preventDefault(); apply(true); });
    const clear = () => { Object.keys(sel).forEach((k) => { sel[k].value = ''; }); search.value = ''; apply(true); search.focus(); };
    $('#f-clear').addEventListener('click', clear);
    $$('[data-clear-filters]').forEach((b) => b.addEventListener('click', clear));
    apply(false);

    // Latest message in the "live" panel.
    const latest = $('#latest-player');
    if (latest) mountPlayer(latest, SERMONS[0]);
  }

  /* ------------------------------------------------------------------
   * 10. Sermon page — sermon.html?id=room-at-the-table
   * ------------------------------------------------------------------ */
  function initSermon() {
    const id = urlParams().get('id');
    const s = findSermon(id) || SERMONS[0];
    const series = SERIES[s.series];
    const sp = PEOPLE[s.speaker];
    const notFound = id && !findSermon(id);
    document.title = s.title + ' — ' + series.title + ' — Riverbend Church';
    const meta = $('meta[name="description"]');
    if (meta) meta.setAttribute('content', s.summary);
    const setText = (sel, text) => { const el = $(sel); if (el) el.textContent = text; };
    setText('#sermon-title', s.title);
    setText('#sermon-series', series.title);
    setText('#sermon-crumb', s.title);
    setText('#sermon-summary', s.summary);
    setText('#sermon-meta-date', longDate(s.day) + ', ' + fmtDay(s.day, { year: 'numeric' }));
    setText('#sermon-meta-passage', s.passage);
    setText('#sermon-meta-length', clock(s.duration).replace(/:\d\d$/, '') + ' min');
    $('#sermon-notfound').hidden = !notFound;
    $('#sermon-art').innerHTML = seriesArt(s.series, s.part);
    const seriesLink = $('#sermon-series-link');
    seriesLink.href = 'sermons.html?series=' + s.series;
    $('#sermon-series-crumb').href = seriesLink.href;
    seriesLink.textContent = 'All of ' + series.title;
    mountPlayer($('#sermon-player'), s);

    $('#sermon-verse').innerHTML = `<p>“${escapeHtml(s.verse.text)}”</p><footer class="mt-3 font-sans text-sm font-bold text-apricot-dark">${escapeHtml(s.verse.ref)}</footer>`;
    $('#sermon-notes').innerHTML = s.notes.map((n, i) => `<li class="flex gap-4"><span class="grid size-9 shrink-0 place-items-center rounded-full bg-lilac font-display font-extrabold text-plum">${i + 1}</span><div><h3 class="font-display text-lg font-extrabold">${escapeHtml(n[0])}</h3><p class="mt-1 leading-relaxed text-ink/85">${escapeHtml(n[1])}</p></div></li>`).join('');
    $('#sermon-questions').innerHTML = s.questions.map((q) => `<li class="pl-1.5 leading-relaxed marker:font-display marker:font-extrabold marker:text-apricot-dark">${escapeHtml(q)}</li>`).join('');

    $('#speaker-card').innerHTML = `<div class="flex items-center gap-4"><span class="size-16 shrink-0 overflow-hidden rounded-2xl">${avatar(s.speaker, 'Portrait of ' + sp.name)}</span><div><p class="font-display text-lg font-extrabold">${escapeHtml(sp.name)}</p><p class="text-sm text-muted">${escapeHtml(sp.role)}</p></div></div><p class="mt-4 text-sm leading-relaxed text-muted">${escapeHtml(sp.bio)}</p><a href="sermons.html?speaker=${s.speaker}" class="link mt-4 inline-block text-sm">More from ${escapeHtml(sp.name.split(' ')[0])}</a>`;

    const inSeries = SERMONS.filter((x) => x.series === s.series).sort((a, b) => a.day - b.day);
    $('#series-list').innerHTML = inSeries.map((x, i) => {
      const cur = x.id === s.id;
      return `<li><a href="sermon.html?id=${x.id}"${cur ? ' aria-current="page"' : ''} class="flex items-center gap-3 rounded-2xl px-3 py-2.5 transition hover:bg-sand aria-[current=page]:bg-lilac"><span class="grid size-8 shrink-0 place-items-center rounded-full ${cur ? 'bg-plum text-white' : 'bg-sand text-ink'} text-sm font-extrabold">${i + 1}</span><span class="min-w-0"><span class="block truncate font-bold">${escapeHtml(x.title)}</span><span class="block text-xs text-muted">${escapeHtml(x.passage)} · ${shortDate(x.day)}</span></span></a></li>`;
    }).join('');
    setText('#series-blurb', series.blurb);

    // Related: rest of the series first, then the same speaker.
    const related = SERMONS.filter((x) => x.id !== s.id && x.series === s.series)
      .concat(SERMONS.filter((x) => x.id !== s.id && x.series !== s.series && x.speaker === s.speaker))
      .slice(0, 3);
    const progress = readProgress();
    $('#related-list').innerHTML = related.map((x) => '<li class="flex">' + sermonCard(x, progress).replace('<article class="', '<article class="w-full ') + '</li>').join('');

    // Copy discussion questions.
    const copyBtn = $('#copy-questions');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const text = s.title + ' (' + s.passage + ')\n\n' + s.questions.map((q, i) => (i + 1) + '. ' + q).join('\n');
        const done = (ok) => {
          $('#copy-status').textContent = ok ? 'Questions copied to your clipboard.' : 'Copy failed. Select the questions and copy them instead.';
        };
        if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(() => done(true), () => done(false));
        else done(false);
      });
    }
  }

  /* ------------------------------------------------------------------
   * 11. Events calendar — month grid and list, category filter,
   *     detail dialog and .ics download.
   *     events.html?view=list&cat=kids,serve&month=2026-11&event=block-party-2026-10-24
   * ------------------------------------------------------------------ */
  function eventMeta(o) {
    return longDate(o.day) + ' · ' + fmtTime(o.ev.start) + '–' + fmtTime(o.ev.end);
  }

  function icsText(s) { return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n'); }
  // Lines longer than 75 bytes are folded (RFC 5545), counting UTF-8 bytes, not characters.
  function icsFold(line) {
    const out = [];
    let cur = '', bytes = 0;
    Array.from(line).forEach((ch) => {
      const b = new TextEncoder().encode(ch).length;
      if (bytes + b > 74) { out.push(cur); cur = ' '; bytes = 1; }
      cur += ch;
      bytes += b;
    });
    out.push(cur);
    return out.join('\r\n');
  }
  const icsStamp = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  // A standards-compliant calendar file for one occurrence, with times in UTC.
  function buildIcs(o) {
    const e = o.ev;
    const lines = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Riverbend Church//Events//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'UID:' + o.key + '@' + CHURCH.uidDomain,
      'DTSTAMP:' + icsStamp(new Date()),
      'DTSTART:' + icsStamp(zonedToDate(o.day, mins(e.start))),
      'DTEND:' + icsStamp(zonedToDate(o.day, mins(e.end))),
      'SUMMARY:' + icsText(e.title),
      'LOCATION:' + icsText(e.place + ', ' + CHURCH.place),
      'DESCRIPTION:' + icsText(e.summary),
      'END:VEVENT', 'END:VCALENDAR'
    ];
    return lines.map(icsFold).join('\r\n') + '\r\n';
  }
  function downloadIcs(o) {
    const blob = new Blob([buildIcs(o)], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = o.key + '.ics';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  function eventCard(o, opts) {
    const c = EVENT_CATS[o.ev.cat];
    return `<li><button type="button" data-open-event="${o.key}" class="group card card-hover flex w-full items-start gap-4 p-4 text-left sm:p-5">
      <span class="grid w-14 shrink-0 place-items-center rounded-2xl bg-sand py-2 text-center"><span class="text-[11px] font-extrabold uppercase tracking-wider text-apricot-dark">${fmtDay(o.day, { month: 'short' })}</span><span class="font-display text-2xl font-extrabold leading-none">${fmtDay(o.day, { day: 'numeric' })}</span></span>
      <span class="min-w-0 flex-1">
        <span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${c.chip}">${escapeHtml(c.label)}</span>
        <span class="mt-1.5 block font-display text-lg font-extrabold leading-snug group-hover:text-plum">${escapeHtml(o.ev.title)}</span>
        <span class="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted"><span class="inline-flex items-center gap-1.5">${ICON.clock}${fmtDay(o.day, { weekday: 'short' })} ${fmtTime(o.ev.start)}</span>${opts && opts.place ? `<span class="inline-flex min-w-0 items-center gap-1.5">${ICON.pin}<span class="truncate">${escapeHtml(o.ev.place)}</span></span>` : ''}</span>
      </span>
    </button></li>`;
  }

  // Event dialog, shared by the events and home pages.
  function setupEventDialog() {
    const dlg = $('#event-dialog');
    if (!dlg) return null;
    let current = null;
    let opener = null;
    function open(o, from) {
      current = o;
      opener = from || document.activeElement;
      const c = EVENT_CATS[o.ev.cat];
      $('[data-ev="cat"]', dlg).className = 'inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ' + c.chip;
      $('[data-ev="cat"]', dlg).textContent = c.label;
      $('[data-ev="title"]', dlg).textContent = o.ev.title;
      $('[data-ev="when"]', dlg).textContent = eventMeta(o);
      $('[data-ev="where"]', dlg).textContent = o.ev.place;
      $('[data-ev="summary"]', dlg).textContent = o.ev.summary;
      $('[data-ev="repeat"]', dlg).textContent = o.ev.weekly ? 'Every ' + fmtDay(o.day, { weekday: 'long' }) + ' until ' + longDate(o.ev.until) + '.' : '';
      $('[data-ev="status"]', dlg).textContent = '';
      if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
      $('[data-ev="title"]', dlg).focus();
      const p = urlParams(); p.set('event', o.key); setUrl(p);
    }
    function close() {
      if (typeof dlg.close === 'function') dlg.close(); else dlg.removeAttribute('open');
    }
    dlg.addEventListener('close', () => {
      const p = urlParams(); p.delete('event'); setUrl(p);
      if (opener && document.contains(opener)) opener.focus();
    });
    dlg.addEventListener('click', (e) => { if (e.target === dlg) close(); });
    $$('[data-ev-close]', dlg).forEach((b) => b.addEventListener('click', close));
    $('[data-ev="ics"]', dlg).addEventListener('click', () => {
      if (!current) return;
      downloadIcs(current);
      $('[data-ev="status"]', dlg).textContent = 'Downloaded ' + current.key + '.ics. Open it to add the event to your calendar.';
    });
    document.addEventListener('click', (e) => {
      const b = e.target.closest('[data-open-event]');
      if (!b) return;
      const o = OCCURRENCES.find((x) => x.key === b.getAttribute('data-open-event'));
      if (o) open(o, b);
    });
    return { open };
  }

  function initEvents() {
    const grid = $('#cal-grid');
    if (!grid) return;
    const dialog = setupEventDialog();
    const params = urlParams();
    const today = TODAY;
    const state = {
      view: params.get('view') === 'list' ? 'list' : 'month',
      cats: urlValues(params, 'cat', EVENT_CATS),
      month: null,
      selected: today
    };
    const mm = /^(\d{4})-(\d{2})$/.exec(params.get('month') || '');
    const todayDate = new Date(today * 864e5);
    state.month = mm && +mm[2] >= 1 && +mm[2] <= 12 ? { y: +mm[1], m: +mm[2] - 1 } : { y: todayDate.getUTCFullYear(), m: todayDate.getUTCMonth() };
    if (mm) state.selected = Math.round(Date.UTC(state.month.y, state.month.m, 1) / 864e5);

    // Category pills
    const catBox = $('#cal-cats');
    catBox.innerHTML = Object.keys(EVENT_CATS).map((k) => `<label class="pill"><input type="checkbox" class="sr-only" value="${k}"${state.cats.indexOf(k) !== -1 ? ' checked' : ''}><span class="chip-dot ${EVENT_CATS[k].dot}" aria-hidden="true"></span>${escapeHtml(EVENT_CATS[k].label)}</label>`).join('');
    catBox.addEventListener('change', () => { state.cats = $$('input:checked', catBox).map((i) => i.value); render(true); });

    const visible = () => OCCURRENCES.filter((o) => !state.cats.length || state.cats.indexOf(o.ev.cat) !== -1);

    function writeUrl() {
      const p = new URLSearchParams();
      if (state.view === 'list') p.set('view', 'list');
      if (state.cats.length) p.set('cat', state.cats.join(','));
      if (state.view === 'month') p.set('month', state.month.y + '-' + String(state.month.m + 1).padStart(2, '0'));
      const ev = urlParams().get('event');
      if (ev) p.set('event', ev);
      setUrl(p);
    }

    function renderMonth(list) {
      const first = Math.round(Date.UTC(state.month.y, state.month.m, 1) / 864e5);
      const daysIn = new Date(Date.UTC(state.month.y, state.month.m + 1, 0)).getUTCDate();
      const start = first - weekday(first);
      const weeks = Math.ceil((weekday(first) + daysIn) / 7);
      const byDay = {};
      list.forEach((o) => { (byDay[o.day] = byDay[o.day] || []).push(o); });
      $('#cal-title').textContent = fmtDay(first, { month: 'long', year: 'numeric' });
      let html = '<table class="w-full table-fixed border-collapse"><caption class="sr-only">Events in ' + escapeHtml(fmtDay(first, { month: 'long', year: 'numeric' })) + '</caption><thead><tr>';
      ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach((d, i) => {
        html += `<th scope="col" class="pb-3 text-center text-xs font-extrabold uppercase tracking-wider text-muted"><abbr title="${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][i]}" class="no-underline">${d}</abbr></th>`;
      });
      html += '</tr></thead><tbody>';
      for (let w = 0; w < weeks; w++) {
        html += '<tr>';
        for (let i = 0; i < 7; i++) {
          const d = start + w * 7 + i;
          const inMonth = d >= first && d < first + daysIn;
          const evs = inMonth ? (byDay[d] || []) : [];
          const isToday = d === today;
          const isSel = d === state.selected;
          html += `<td class="h-16 border border-line p-1 align-top sm:h-36 sm:p-1.5 ${inMonth ? 'bg-shell' : 'bg-sand/50'}">`;
          if (inMonth) {
            const label = longDate(d) + (evs.length ? ', ' + plural(evs.length, 'event', 'events') : ', no events') + (isToday ? ', today' : '');
            html += `<button type="button" data-day="${d}" aria-pressed="${isSel}" aria-label="${escapeHtml(label)}" class="flex w-full flex-col items-center gap-1 rounded-xl p-1 transition hover:bg-sand sm:items-start ${isSel ? 'bg-lilac' : ''}">
              <span class="grid size-7 place-items-center rounded-full text-sm font-extrabold ${isToday ? 'bg-plum text-white' : ''}">${fmtDay(d, { day: 'numeric' })}</span>
              ${evs.length ? `<span class="flex gap-1 sm:hidden" aria-hidden="true">${evs.slice(0, 3).map((o) => `<span class="chip-dot size-1.5 ${EVENT_CATS[o.ev.cat].dot}"></span>`).join('')}</span>` : ''}
            </button>
            <ul class="mt-0.5 hidden space-y-1 sm:block">${evs.slice(0, 2).map((o) => `<li><button type="button" data-open-event="${o.key}" class="block w-full rounded-lg px-2 py-1.5 text-left text-[12px] leading-tight ${EVENT_CATS[o.ev.cat].chip} hover:brightness-95"><span class="sr-only">${escapeHtml(longDate(d))}: </span><span class="block font-semibold">${fmtTime(o.ev.start)}</span><span class="line-clamp-2 font-extrabold">${escapeHtml(o.ev.title)}</span></button></li>`).join('')}${evs.length > 2 ? `<li><button type="button" data-day="${d}" class="px-1.5 text-[12px] font-bold text-plum hover:underline">+${evs.length - 2} more<span class="sr-only"> on ${escapeHtml(longDate(d))}</span></button></li>` : ''}</ul>`;
          } else {
            html += `<span class="grid size-7 place-items-center text-sm font-bold text-muted" aria-hidden="true">${fmtDay(d, { day: 'numeric' })}</span>`;
          }
          html += '</td>';
        }
        html += '</tr>';
      }
      grid.innerHTML = html + '</tbody></table>';

      // Agenda for the selected day.
      const dayEvs = byDay[state.selected] || [];
      const inThisMonth = state.selected >= first && state.selected < first + daysIn;
      $('#cal-day-title').textContent = inThisMonth ? longDate(state.selected) : 'Pick a day';
      $('#cal-day-list').innerHTML = dayEvs.length
        ? dayEvs.map((o) => eventCard(o, { place: true })).join('')
        : `<li class="rounded-2xl border border-dashed border-ink/20 p-5 text-sm text-muted">${inThisMonth ? 'Nothing on this day' + (state.cats.length ? ' in the selected categories' : '') + '. Pick another day, or switch to the list.' : 'Choose a date in the calendar to see what’s on.'}</li>`;
      // Coming up after the selected day.
      const after = list.filter((o) => o.day > state.selected && !o.ev.weekly).slice(0, 3);
      $('#cal-next-list').innerHTML = after.map((o) => eventCard(o)).join('') ||
        '<li class="rounded-2xl border border-dashed border-ink/20 p-5 text-sm text-muted">Nothing else scheduled yet.</li>';
    }

    function renderList(list) {
      const upcoming = list.filter((o) => o.day >= today);
      const weeklyIds = {};
      const weekly = [];
      const once = [];
      upcoming.forEach((o) => {
        if (o.ev.weekly) { if (!weeklyIds[o.ev.id]) { weeklyIds[o.ev.id] = 1; weekly.push(o); } } else once.push(o);
      });
      let html = '';
      if (weekly.length) {
        html += `<section aria-labelledby="weekly-h" class="rounded-[1.75rem] bg-sand p-5 sm:p-6"><h3 id="weekly-h" class="font-display text-lg font-extrabold">Every week</h3><ul class="mt-4 grid gap-3 md:grid-cols-2">${weekly.map((o) => `<li><button type="button" data-open-event="${o.key}" class="flex w-full items-center gap-3 rounded-2xl bg-shell p-4 text-left shadow-soft transition hover:-translate-y-0.5"><span class="chip-dot size-2.5 ${EVENT_CATS[o.ev.cat].dot}" aria-hidden="true"></span><span class="min-w-0"><span class="block font-bold">${escapeHtml(o.ev.title)}</span><span class="block text-sm text-muted">${fmtDay(o.day, { weekday: 'long' })}s, ${fmtTime(o.ev.start)}–${fmtTime(o.ev.end)}</span></span></button></li>`).join('')}</ul></section>`;
      }
      const months = {};
      const order = [];
      once.forEach((o) => {
        const k = ymd(o.day).slice(0, 7);
        if (!months[k]) { months[k] = []; order.push(k); }
        months[k].push(o);
      });
      order.forEach((k) => {
        html += `<section class="mt-10" aria-labelledby="m-${k}"><h3 id="m-${k}" class="font-display text-2xl font-extrabold">${fmtDay(months[k][0].day, { month: 'long', year: 'numeric' })}</h3><ul class="mt-4 grid gap-3 lg:grid-cols-2">${months[k].map((o) => eventCard(o, { place: true })).join('')}</ul></section>`;
      });
      if (!once.length && !weekly.length) html = '<p class="rounded-2xl border border-dashed border-ink/20 p-6 text-muted">No upcoming events in these categories.</p>';
      $('#cal-list').innerHTML = html;
    }

    function render(updateUrl) {
      const list = visible();
      const isList = state.view === 'list';
      $('#cal-month').hidden = isList;
      $('#cal-list').hidden = !isList;
      $$('[data-view]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.view === state.view)));
      if (isList) renderList(list); else renderMonth(list);
      const n = list.filter((o) => o.day >= today && !o.ev.weekly).length;
      $('#cal-count').textContent = plural(n, 'upcoming event', 'upcoming events') + (state.cats.length ? ' in ' + state.cats.map((k) => EVENT_CATS[k].label).join(', ') : '') + ', plus weekly gatherings';
      if (updateUrl) writeUrl();
    }

    $$('[data-view]').forEach((b) => b.addEventListener('click', () => { state.view = b.dataset.view; render(true); }));
    function moveMonth(delta) {
      const d = new Date(Date.UTC(state.month.y, state.month.m + delta, 1));
      state.month = { y: d.getUTCFullYear(), m: d.getUTCMonth() };
      const first = Math.round(d.getTime() / 864e5);
      state.selected = first <= today && today < first + 31 && new Date(today * 864e5).getUTCMonth() === state.month.m ? today : first;
      render(true);
    }
    $('#cal-prev').addEventListener('click', () => moveMonth(-1));
    $('#cal-next').addEventListener('click', () => moveMonth(1));
    $('#cal-today').addEventListener('click', () => {
      const d = new Date(today * 864e5);
      state.month = { y: d.getUTCFullYear(), m: d.getUTCMonth() };
      state.selected = today;
      render(true);
    });
    grid.addEventListener('click', (e) => {
      const b = e.target.closest('[data-day]');
      if (!b) return;
      state.selected = +b.dataset.day;
      render(false);
      const again = $('[data-day="' + state.selected + '"]', grid);
      if (again) again.focus();
      if (window.innerWidth < 1024) $('#cal-day').scrollIntoView({ block: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' });
    });
    render(false);
    const evKey = params.get('event');
    const o = evKey && OCCURRENCES.find((x) => x.key === evKey.toLowerCase());
    if (o && dialog) dialog.open(o);
  }

  /* ------------------------------------------------------------------
   * 12. Groups finder — groups.html?day=tue,thu&area=west&stage=families&childcare=1
   * ------------------------------------------------------------------ */
  function initGroups() {
    const list = $('#group-list');
    if (!list) return;
    const facets = { day: DAYS, area: AREAS, stage: STAGES };
    const params = urlParams();
    const state = { day: urlValues(params, 'day', DAYS), area: urlValues(params, 'area', AREAS), stage: urlValues(params, 'stage', STAGES), childcare: params.get('childcare') === '1' };
    const care = $('#g-childcare');
    care.checked = state.childcare;

    function matches(g, skip) {
      return Object.keys(facets).every((f) => f === skip || !state[f].length || state[f].indexOf(g[f]) !== -1) && (!state.childcare || g.childcare);
    }
    function renderFacets() {
      Object.keys(facets).forEach((f) => {
        const box = $('#facet-' + f);
        box.innerHTML = Object.keys(facets[f]).map((k) => {
          const n = GROUPS.filter((g) => g[f] === k && matches(g, f)).length;
          const on = state[f].indexOf(k) !== -1;
          return `<label class="pill"><input type="checkbox" class="sr-only" name="${f}" value="${k}"${on ? ' checked' : ''}${!n && !on ? ' disabled' : ''}>${escapeHtml(f === 'day' ? facets[f][k].slice(0, 3) : facets[f][k])}<span class="text-xs font-semibold opacity-70">${n}</span></label>`;
        }).join('');
      });
    }
    function card(g) {
      const full = g.spots === 0;
      return `<li class="flex"><article class="card flex w-full flex-col p-6">
        <div class="flex items-start justify-between gap-4">
          <span class="grid shrink-0 place-items-center rounded-2xl bg-lilac px-3 py-2 text-center"><span class="text-[11px] font-extrabold uppercase tracking-wider text-plum">${DAYS[g.day].slice(0, 3)}</span><span class="font-display text-base font-extrabold leading-tight">${fmtTime(g.time)}</span></span>
          <span class="rounded-full px-3 py-1 text-xs font-bold ${full ? 'bg-sand text-muted' : 'bg-sage-light text-sage-dark'}">${full ? 'Full: join the waitlist' : plural(g.spots, 'spot', 'spots') + ' open'}</span>
        </div>
        <h3 class="mt-5 font-display text-xl font-extrabold leading-snug">${escapeHtml(g.name)}</h3>
        <p class="mt-2 flex-1 leading-relaxed text-muted">${escapeHtml(g.blurb)}</p>
        <ul class="mt-5 space-y-1.5 text-sm">
          <li class="flex items-center gap-2">${ICON.pin}<span>${escapeHtml(g.where)}, <span class="text-muted">${escapeHtml(AREAS[g.area])}</span></span></li>
          <li class="flex items-center gap-2">${ICON.user}<span>Hosted by ${escapeHtml(g.host)}</span></li>
        </ul>
        <div class="mt-5 flex flex-wrap gap-2"><span class="tag">${escapeHtml(STAGES[g.stage])}</span>${g.childcare ? '<span class="tag bg-river-light text-river-dark">Childcare</span>' : ''}</div>
        <a href="contact.html?topic=groups&amp;group=${g.id}" class="btn-outline btn-sm mt-6 self-start">${full ? 'Join the waitlist' : 'Ask to join'}<span class="sr-only"> ${escapeHtml(g.name)}</span></a>
      </article></li>`;
    }
    function render(updateUrl) {
      const hits = GROUPS.filter((g) => matches(g));
      renderFacets();
      list.innerHTML = hits.map(card).join('');
      $('#group-empty').hidden = hits.length > 0;
      $('#group-count').textContent = hits.length === GROUPS.length ? 'All ' + GROUPS.length + ' groups' : plural(hits.length, 'group matches', 'groups match') + ' your filters';
      const any = state.day.length || state.area.length || state.stage.length || state.childcare;
      $('#g-clear').hidden = !any;
      if (updateUrl) {
        const p = new URLSearchParams();
        Object.keys(facets).forEach((f) => { if (state[f].length) p.set(f, state[f].join(',')); });
        if (state.childcare) p.set('childcare', '1');
        setUrl(p);
      }
    }
    $('#group-filters').addEventListener('submit', (e) => e.preventDefault());
    $('#group-filters').addEventListener('change', (e) => {
      const t = e.target;
      if (t === care) state.childcare = care.checked;
      else if (facets[t.name]) state[t.name] = $$('input[name="' + t.name + '"]:checked').map((i) => i.value);
      render(true);
      const again = t.name && $('input[name="' + t.name + '"][value="' + t.value + '"]');
      if (again) again.focus();
    });
    const clear = () => { state.day = []; state.area = []; state.stage = []; state.childcare = false; care.checked = false; render(true); };
    $('#g-clear').addEventListener('click', clear);
    $$('[data-clear-groups]').forEach((b) => b.addEventListener('click', clear));
    render(false);
  }

  /* ------------------------------------------------------------------
   * 13. Plan your visit — next Sundays, party size, kids' ages, summary
   * ------------------------------------------------------------------ */
  function roomFor(age) { return VISIT.rooms.find((r) => age <= r.upTo) || VISIT.rooms[VISIT.rooms.length - 1]; }

  function initVisit() {
    const form = $('#visit-form');
    if (!form) return;
    const sundaySel = $('#v-sunday');
    const now = churchNow();
    const lastStart = Math.max.apply(null, SERVICES.filter((s) => s.day === 0).map((s) => mins(s.start) * 60));
    let first = now.day + ((7 - weekday(now.day)) % 7);
    if (first === now.day && now.secs >= lastStart) first += 7;
    for (let i = 0; i < VISIT.sundays; i++) {
      const d = first + i * 7;
      const o = document.createElement('option');
      o.value = ymd(d);
      o.textContent = longDate(d) + (i === 0 ? ' (this Sunday)' : '');
      sundaySel.appendChild(o);
    }
    $('#v-times').innerHTML = SERVICES.filter((s) => s.day === 0).map((s, i) => `<label class="option flex-1 items-center gap-3"><input type="radio" class="sr-only" name="time" value="${s.start}"${i === 0 ? ' checked' : ''}><span class="font-display text-lg font-extrabold">${fmtTime(s.start)}</span><span class="text-sm text-muted">${s.minutes} min</span></label>`).join('');

    const adults = $('#v-adults'), kids = $('#v-kids'), ages = $('#v-ages');
    function stepper(input, min, max) {
      const box = input.closest('[data-stepper]');
      const set = (v) => { input.value = clamp(isFinite(v) ? Math.round(v) : min, min, max); update(); };
      $('[data-step="-1"]', box).addEventListener('click', () => set(+input.value - 1));
      $('[data-step="1"]', box).addEventListener('click', () => set(+input.value + 1));
      input.addEventListener('change', () => set(+input.value));
    }
    stepper(adults, 1, VISIT.maxAdults);
    stepper(kids, 0, VISIT.maxKids);

    function renderAges() {
      const n = +kids.value;
      const have = $$('select', ages);
      for (let i = have.length; i < n; i++) {
        const wrap = document.createElement('div');
        const opts = ['<option value="">Age</option>'].concat(Array.from({ length: 18 }, (_, a) => `<option value="${a}">${a === 0 ? 'Under 1' : a + (a === 1 ? ' year' : ' years')}</option>`)).join('');
        wrap.innerHTML = `<label for="v-age-${i + 1}" class="field-label">Child ${i + 1}</label><select id="v-age-${i + 1}" name="age-${i + 1}" class="field" required data-label="Child ${i + 1}’s age">${opts}</select>`;
        ages.appendChild(wrap);
        bindField($('select', wrap));
      }
      have.slice(n).forEach((s) => s.parentElement.remove());
      $('#v-ages-wrap').hidden = n === 0;
    }

    let inService = 0;
    function update() {
      renderAges();
      const day = dayNum(sundaySel.value);
      const time = ($('input[name="time"]:checked', form) || {}).value;
      const a = +adults.value, k = +kids.value;
      const rooms = [];
      inService = 0; // children old enough to sit with you
      $$('select', ages).forEach((s) => {
        if (s.value === '') return;
        const r = roomFor(+s.value);
        if (r === VISIT.rooms[VISIT.rooms.length - 1]) inService++;
        if (rooms.indexOf(r) === -1) rooms.push(r);
      });
      $('#v-summary').innerHTML = `
        <div class="flex items-start gap-3"><span class="mt-0.5 text-apricot">${ICON.cal}</span><p><span class="block font-bold">${escapeHtml(isFinite(day) ? longDate(day) : '')}</span><span class="text-white/75">${time ? fmtTime(time) : ''} ${escapeHtml(CHURCH.timeZoneLabel)} · doors open 20 minutes early</span></p></div>
        <div class="flex items-start gap-3"><span class="mt-0.5 text-apricot">${ICON.user}</span><p><span class="block font-bold">${plural(a, 'adult', 'adults')}${k ? ', ' + plural(k, 'child', 'children') : ''}</span><span class="text-white/75">We’ll save ${plural(a + inService, 'seat', 'seats')} together</span></p></div>
        ${k ? `<div class="flex items-start gap-3"><span class="mt-0.5 text-apricot">${ICON.pin}</span><p><span class="block font-bold">Kids’ check-in</span><span class="text-white/75">${rooms.length ? rooms.map((r) => escapeHtml(r.name + ': ' + r.room)).join('<br>') : 'Add ages to see which rooms'}</span></p></div>` : ''}`;
    }
    form.addEventListener('change', (e) => { if (!e.target.closest('[data-stepper]')) update(); });
    update();

    setupValidation(form, () => {
      const day = dayNum(sundaySel.value);
      const time = $('input[name="time"]:checked', form).value;
      const name = $('#v-name').value.trim().split(' ')[0];
      // To connect: send new FormData(form) to your form service here (see DOCS.md, Forms).
      successSwap(form, `<p class="font-display text-2xl font-extrabold">See you ${escapeHtml(longDate(day))}, ${escapeHtml(name)}!</p>
        <p class="mt-3 leading-relaxed text-muted">We’ve saved you ${plural(+adults.value + inService, 'seat', 'seats')} at the ${fmtTime(time)} gathering, and a host will meet you at the welcome tent. We’ll email you a reminder before Sunday. Your reference is <strong class="text-ink">${makeRef('RC')}</strong>.</p>
        <a href="index.html" class="btn-primary mt-6">Back to home</a>`);
    });
  }

  /* ------------------------------------------------------------------
   * 14. Giving form — amount chips, custom amount, fund, cover the fee.
   *     Nothing is charged until you connect your provider in the submit handler.
   * ------------------------------------------------------------------ */
  function feeFor(amount) {
    // What to add so that, after the card fee, the church receives the full amount.
    const gross = (amount + GIVING.fee.fixed) / (1 - GIVING.fee.percent / 100);
    return Math.round((gross - amount) * 100) / 100;
  }

  function initGive() {
    const form = $('#give-form');
    if (!form) return;
    const chips = $('#give-amounts');
    chips.innerHTML = GIVING.amounts.map((a) => `<label class="option justify-center py-3.5 font-display text-xl font-extrabold"><input type="radio" class="sr-only" name="amount" value="${a}"${a === GIVING.defaultAmount ? ' checked' : ''}>$${a}</label>`).join('');
    const custom = $('#g-custom');
    const fund = $('#g-fund');
    fund.innerHTML = Object.keys(GIVING.funds).map((k) => `<option value="${k}">${escapeHtml(GIVING.funds[k])}</option>`).join('');
    const pf = urlValues(urlParams(), 'fund', GIVING.funds)[0];
    if (pf) fund.value = pf;
    const cover = $('#g-cover');
    $('#g-fee-rate').textContent = GIVING.fee.percent + '% + ' + money.format(GIVING.fee.fixed);

    function amount() {
      const c = custom.value.replace(/[$,\s]/g, '');
      if (c !== '') return /^\d+(\.\d{1,2})?$/.test(c) ? +c : NaN;
      const r = $('input[name="amount"]:checked', form);
      return r ? +r.value : NaN;
    }
    function update() {
      const a = amount();
      const ok = isFinite(a) && a >= GIVING.min && a <= GIVING.max;
      const fee = ok ? feeFor(a) : 0;
      const freq = $('input[name="frequency"]:checked', form).value;
      const per = { once: '', weekly: ' every week', monthly: ' every month' }[freq];
      $('#g-fee').textContent = ok ? money.format(fee) : '$0.00';
      $('#give-total').textContent = ok ? money.format(a + (cover.checked ? fee : 0)) : '—';
      $('#give-total-note').textContent = ok
        ? (cover.checked
            ? 'Riverbend receives the full ' + money.format(a) + per + '.'
            : 'After card fees of about ' + money.format(Math.round((a * GIVING.fee.percent / 100 + GIVING.fee.fixed) * 100) / 100) + ', Riverbend receives about ' + money.format(Math.max(0, a - (a * GIVING.fee.percent / 100 + GIVING.fee.fixed))) + per + '.')
        : 'Choose or enter an amount.';
      $('#give-per').textContent = per ? per.trim() : 'one time';
      $('#give-fund-label').textContent = GIVING.funds[fund.value];
      $('#give-submit').textContent = ok ? 'Give ' + money.format(a + (cover.checked ? fee : 0)) + per : 'Give';
    }
    // Typing a custom amount clears the chips; picking a chip clears the custom amount.
    custom.addEventListener('input', () => { if (custom.value.trim()) $$('input[name="amount"]', form).forEach((r) => { r.checked = false; }); update(); });
    chips.addEventListener('change', () => { custom.value = ''; showError(custom, ''); update(); });
    form.addEventListener('change', update);
    update();

    setupValidation(form, () => {
      const a = amount();
      const fee = cover.checked ? feeFor(a) : 0;
      const freq = $('input[name="frequency"]:checked', form).value;
      // Connect your payment provider here (Stripe Checkout, PayPal, Tithe.ly, Planning Center
      // Giving...): create a checkout session on your server and redirect to it. See DOCS.md.
      successSwap(form, `<p class="font-display text-2xl font-extrabold">Thank you, ${escapeHtml($('#g-name').value.trim().split(' ')[0])}.</p>
        <p class="mt-3 leading-relaxed text-muted">Your gift of ${money.format(a + fee)}${freq === 'once' ? '' : freq === 'weekly' ? ' every week' : ' every month'} to the ${escapeHtml(GIVING.funds[fund.value])} is confirmed. A receipt is on its way to your email${freq === 'once' ? '' : ', with a link to change or cancel your giving'}. Your reference is <strong class="text-ink">${makeRef('RC')}</strong>.</p>
        <a href="index.html" class="btn-primary mt-6">Back to home</a>`);
    }, () => {
      const raw = custom.value.trim();
      const a = amount();
      let msg = '';
      if (raw === '' && !isFinite(a)) msg = 'Choose an amount or enter your own.';
      else if (raw !== '' && !isFinite(a)) msg = 'Enter an amount in dollars, like 75 or 75.50.';
      else if (a < GIVING.min) msg = 'The smallest gift is ' + money.format(GIVING.min) + '.';
      else if (a > GIVING.max) msg = 'For gifts over ' + money.format(GIVING.max) + ', please contact our office.';
      return { el: custom, msg };
    });
  }

  /* ------------------------------------------------------------------
   * 15. Forms — inline validation, success state. They send nothing until connected.
   * ------------------------------------------------------------------ */
  function fieldMessage(el) {
    const v = el.value.trim();
    const label = el.getAttribute('data-label') || 'This field';
    if (el.type === 'checkbox') return el.required && !el.checked ? (el.getAttribute('data-msg') || 'Please check this box.') : '';
    if (el.required && !v) return el.tagName === 'SELECT' ? 'Please choose ' + label.charAt(0).toLowerCase() + label.slice(1) + '.' : label + ' is required.';
    if (!v) return '';
    const rule = el.getAttribute('data-validate') || el.type;
    if (rule === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Enter an email address like name@example.com.';
    if (rule === 'tel' && !/^[+()\d\s.-]{7,20}$/.test(v)) return 'Enter a phone number, digits only.';
    const min = +el.getAttribute('minlength');
    if (min && v.length < min) return label + ' needs at least ' + min + ' characters.';
    return '';
  }

  function showError(el, msg) {
    const errId = el.id + '-error';
    let err = document.getElementById(errId);
    if (!err) {
      if (!msg) { el.removeAttribute('aria-invalid'); return; }
      err = document.createElement('p');
      err.id = errId;
      err.className = 'field-error';
      (el.closest('[data-error-after]') || el).insertAdjacentElement('afterend', err);
    }
    err.textContent = msg;
    if (msg) {
      el.setAttribute('aria-invalid', 'true');
      const desc = (el.getAttribute('aria-describedby') || '').split(' ').filter(Boolean);
      if (desc.indexOf(errId) === -1) desc.push(errId);
      el.setAttribute('aria-describedby', desc.join(' '));
    } else {
      el.removeAttribute('aria-invalid');
    }
  }

  function fieldsOf(root) {
    return $$('input, select, textarea', root).filter((el) =>
      el.type !== 'radio' && el.type !== 'hidden' && el.type !== 'submit' && el.id && !el.hasAttribute('data-novalidate'));
  }
  function bindField(el) {
    el.addEventListener('blur', () => { if (el.value.trim() || el.hasAttribute('aria-invalid')) showError(el, fieldMessage(el)); });
    el.addEventListener('input', () => { if (el.hasAttribute('aria-invalid')) showError(el, fieldMessage(el)); });
    el.addEventListener('change', () => { if (el.hasAttribute('aria-invalid')) showError(el, fieldMessage(el)); });
  }

  // extra(): optional custom check returning { el, msg } or null.
  function setupValidation(form, onValid, extra) {
    form.setAttribute('novalidate', '');
    fieldsOf(form).forEach(bindField);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let firstBad = null;
      fieldsOf(form).forEach((el) => {
        const msg = fieldMessage(el);
        showError(el, msg);
        if (msg && !firstBad) firstBad = el;
      });
      if (extra) {
        const r = extra();
        if (r && r.msg) { showError(r.el, r.msg); if (!firstBad) firstBad = r.el; }
      }
      const status = $('[data-form-status]', form);
      if (firstBad) {
        if (status) status.textContent = 'Please fix the highlighted fields.';
        firstBad.focus();
        return;
      }
      if (status) status.textContent = '';
      onValid(form);
    });
  }

  // A short reference for confirmations, like RC-7K2Q (no 0/O or 1/I to misread over the phone).
  function makeRef(prefix) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let out = '';
    for (let i = 0; i < 4; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
    return prefix + '-' + out;
  }

  function successSwap(form, html) {
    const box = document.createElement('div');
    box.setAttribute('role', 'status');
    box.setAttribute('tabindex', '-1');
    box.className = 'card p-7 text-ink focus:outline-none sm:p-9';
    box.innerHTML = '<svg viewBox="0 0 48 48" class="mb-5 h-12 w-12" aria-hidden="true"><circle cx="24" cy="24" r="24" fill="#e6efe0"/><path d="m15 24.5 6 6 12-13" fill="none" stroke="#33603b" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' + html;
    form.replaceWith(box);
    box.focus();
  }

  function initForms() {
    // To connect a form: replace successSwap(...) with a fetch() to your form service, e.g.
    // fetch('https://formspree.io/f/your-id', { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
    $$('[data-form="newsletter"]').forEach((form) => setupValidation(form, () => {
      successSwap(form, '<p class="font-display text-xl font-extrabold">You’re on the list.</p><p class="mt-2 text-muted">Look out for a confirmation email from us; once you click the link, Riverbend Weekly arrives on Thursday mornings.</p>');
    }));

    const contact = $('#contact-form');
    if (contact) {
      // contact.html?topic=groups&group=west-side-families pre-fills the form.
      const p = urlParams();
      const topic = $('#c-topic');
      const t = (p.get('topic') || '').toLowerCase();
      if ($('option[value="' + t.replace(/[^a-z-]/g, '') + '"]', topic)) topic.value = t;
      const g = GROUPS.find((x) => x.id === (p.get('group') || '').toLowerCase());
      if (g) {
        topic.value = 'groups';
        $('#c-message').value = 'Hi! I’d like to ' + (g.spots ? 'join' : 'go on the waitlist for') + ' “' + g.name + '” (' + DAYS[g.day] + 's at ' + fmtTime(g.time) + '). ';
        const note = $('#c-group-note');
        note.textContent = 'You’re asking about ' + g.name + '. ' + g.host + ' will get back to you.';
        note.hidden = false;
      }
      setupValidation(contact, () => {
        successSwap(contact, `<p class="font-display text-2xl font-extrabold">Thanks, ${escapeHtml($('#c-name').value.trim().split(' ')[0])}.</p><p class="mt-3 leading-relaxed text-muted">Your message has reached the church office, and someone will reply within two business days. Your reference is <strong class="text-ink">${makeRef('RC')}</strong>.</p>`);
      });
    }

    const prayer = $('#prayer-form');
    if (prayer) {
      const follow = $('#p-follow'), email = $('#p-email'), priv = $('#p-private');
      const sync = () => {
        email.required = follow.checked;
        $('#p-email-req').hidden = !follow.checked;
        if (!follow.checked && email.hasAttribute('aria-invalid')) showError(email, fieldMessage(email));
        $('#p-who').textContent = priv.checked ? 'Only our pastors will read this request.' : 'Our pastors and the 12-person prayer team will pray for this during the week.';
      };
      follow.addEventListener('change', sync);
      priv.addEventListener('change', sync);
      sync();
      setupValidation(prayer, () => {
        const name = $('#p-name').value.trim().split(' ')[0];
        successSwap(prayer, `<p class="font-display text-2xl font-extrabold">${name ? 'Thank you, ' + escapeHtml(name) + '.' : 'Thank you for trusting us.'}</p>
          <p class="mt-3 leading-relaxed text-muted">${priv.checked ? 'Only our pastoral team will see your request' : 'Our pastors and prayer team will pray for you this week'}${follow.checked ? ', and a pastor will get in touch' : ''}.</p>
          <p class="mt-5 rounded-2xl bg-sand p-4 text-sm leading-relaxed">If you are in crisis or thinking about harming yourself, call or text <strong>988</strong> (Suicide &amp; Crisis Lifeline) any time, or <strong>911</strong> in an emergency.</p>`);
      });
    }
  }

  /* ------------------------------------------------------------------
   * 16. Boot — home, about and shared pieces
   * ------------------------------------------------------------------ */
  function initHome() {
    const latest = $('#latest-sermon');
    if (latest) {
      const s = SERMONS[0];
      const series = SERIES[s.series];
      $('#latest-title').textContent = s.title;
      $('#latest-meta').textContent = series.title + ', part ' + s.part + ' · ' + PEOPLE[s.speaker].name + ' · ' + longDate(s.day);
      $('#latest-summary').textContent = s.summary;
      $('#latest-link').href = 'sermon.html?id=' + s.id;
      $('#latest-art').innerHTML = seriesArt(s.series, s.part);
      mountPlayer(latest, s);
    }
    const evList = $('#home-events');
    if (evList) {
      setupEventDialog();
      const next = OCCURRENCES.filter((o) => o.day >= TODAY && !o.ev.weekly).slice(0, 4);
      evList.innerHTML = next.map((o) => eventCard(o, { place: true })).join('');
    }
  }

  function initAbout() {
    const grid = $('#staff-grid');
    if (!grid) return;
    grid.innerHTML = STAFF.map((id) => {
      const p = PEOPLE[id];
      return `<li class="reveal card flex flex-col overflow-hidden"><div class="art aspect-square overflow-hidden">${avatar(id, 'Illustrated portrait of ' + p.name)}</div><div class="flex flex-1 flex-col p-5"><h3 class="font-display text-lg font-extrabold">${escapeHtml(p.name)}</h3><p class="text-sm font-bold text-apricot-dark">${escapeHtml(p.role)}</p><p class="mt-3 flex-1 text-sm leading-relaxed text-muted">${escapeHtml(p.bio)}</p><a href="mailto:${p.email}" class="link mt-4 inline-block self-start break-all text-sm">${p.email}</a></div></li>`;
    }).join('');
  }

  hydrateArt(document);
  updateStatus();
  setInterval(updateStatus, 30000);
  initCountdowns();
  const page = document.body.dataset.page;
  if (page === 'home') initHome();
  if (page === 'sermons') initSermons();
  if (page === 'sermon') initSermon();
  if (page === 'events') initEvents();
  if (page === 'groups') initGroups();
  if (page === 'visit') initVisit();
  if (page === 'give') initGive();
  if (page === 'about') initAbout();
  initForms();
  reveal(document);
})();

/* ---------- Back to top ----------
   A button that fades in after you scroll about one screen down. It returns to
   the top (instantly if the visitor prefers reduced motion) and moves keyboard
   focus to the main content. It lifts itself above toasts so they never overlap, and
   steps aside while an in-page "Back to top" link (e.g. in the footer) is on screen.
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
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></svg>';
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
