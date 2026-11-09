/* Rillmark — site data. Edit this file to make the site yours (see DOCS.md, "Content").
 *
 * Everything the pages list is generated from these constants by assets/js/main.js:
 *   STUDIO        name, contact details, hours and booking rules
 *   DISCIPLINES   the four kinds of work, used by filters, cards and the estimator
 *   PROJECTS      every project: card, case study, styleframes, credits and results
 *   REEL          which projects appear in the home page showreel, in order
 *   SERVICES      the estimator's prices per service (US dollars, before sales tax)
 *   STYLES        animation styles and their price factor
 *   ADD_ONS       optional extras with their prices
 *   JOURNAL       dated notes, newest first (they roll forward, see KEEP_DEMO_CURRENT in main.js)
 *   TOPICS        journal topics
 *   PEOPLE        collaborators shown on the about page
 */
window.RILLMARK = (function () {
  'use strict';

  var STUDIO = {
    name: 'Rillmark',
    director: 'Marika Drever',
    email: 'studio@rillmark.example',
    phone: '(860) 555-0152',
    address: ['Studio 3, 61 Arch Street', 'Hartford, CT 06103'],
    // Opening hours, by day of the week (0 = Sunday). Times are America/New_York.
    hours: { 1: ['09:30', '17:30'], 2: ['09:30', '17:30'], 3: ['09:30', '17:30'], 4: ['09:30', '17:30'], 5: ['09:30', '14:00'] },
    // How far ahead a new project can start, and how many business days a reply takes.
    leadWeeks: 6,
    replyWorkingDays: 2,
    // The studio closes every winter between these days (month-day, inclusive).
    winterClosure: ['12-24', '01-04']
  };

  var DISCIPLINES = {
    titles: { name: 'Title sequences', short: 'Titles', blurb: 'Opening and end titles for drama, documentary, festivals and games.' },
    brand: { name: 'Brand motion', short: 'Brand', blurb: 'Motion identities and toolkits that teams can keep using after launch.' },
    explainer: { name: 'Explainer animation', short: 'Explainer', blurb: 'Clear, warm films that make one difficult idea simple.' },
    music: { name: 'Music videos', short: 'Music', blurb: 'Animated and mixed-media videos for independent artists and labels.' }
  };

  /* Every project. `discipline` is a key of DISCIPLINES. `motif` picks the artwork drawn in
     main.js (section 6, ART), with `palette` = [background, foreground, accent, second accent].
     `frames` are the styleframes on the case study: `t` is the moment in the film (0–1) the frame
     is drawn at. `runtime` is in seconds. */
  var PROJECTS = [
    {
      id: 'season-of-tides', title: 'Season of Tides', client: 'Bracken Hall', discipline: 'brand', year: 2026, runtime: 45,
      role: 'Direction, design and animation', motif: 'tides', palette: ['#14233f', '#f4ead3', '#d9a441', '#7fb7c9'],
      summary: 'A motion identity for a concert hall’s new season, built from the swell of a held note.',
      tags: ['orchestra', 'season launch', 'identity', 'toolkit'],
      brief: [
        'Bracken Hall’s orchestra had a new music director, a season themed around the sea and a marketing team of three. They needed one identity that could carry forty concerts, from a sold-out Mahler to a Sunday family matinee, without a new animation for each.',
        'The ask: a launch film for the season announcement, and a system the in-house team could use for every concert after it.'
      ],
      frames: [
        { t: 0.08, caption: 'Opening: a single line, the A the orchestra tunes to.' },
        { t: 0.34, caption: 'The line swells into a tide as the strings come in.' },
        { t: 0.62, caption: 'Program cards ride the wave crest.' },
        { t: 0.92, caption: 'The resolve: the season mark settles on the horizon.' }
      ],
      process: [
        { title: 'Listening first', text: 'We recorded the orchestra tuning and drew the waveform by hand. Every motion in the system eases on the shape of that sound.' },
        { title: 'Six behaviors', text: 'Swell, ebb, crest, slack, surge and still: six named moves cover announcements, repertoire, artist stories and last-minute changes.' },
        { title: 'Handover', text: 'An After Effects template with timing notes, plus a half-day workshop, so the team now makes new pieces in an afternoon.' }
      ],
      results: [
        { figure: '40', label: 'concerts promoted from one toolkit' },
        { figure: '3 h', label: 'average time to make a new concert trailer' },
        { figure: '+18%', label: 'season ticket sales over the year before' }
      ],
      credits: [['Client', 'Bracken Hall'], ['Direction and animation', 'Marika Drever'], ['Sound design', 'Calum Torrance'], ['Producer', 'Rory Baird']],
      quote: { text: 'It moves like us: precise when it needs to be, generous everywhere else.', name: 'Stuart Kinney', role: 'Program director, Bracken Hall' }
    },
    {
      id: 'paper-lanterns', title: 'Paper Lanterns', client: 'Small Weather', discipline: 'music', year: 2026, runtime: 214,
      role: 'Direction, cel animation and compositing', motif: 'lanterns', palette: ['#1b1030', '#ffe7c2', '#ff9f5a', '#8f6bd8'],
      summary: 'A hand-drawn video for a slow, glowing single: lanterns rise over a sleeping town.',
      tags: ['band', 'single', 'hand-drawn', 'cel'],
      brief: [
        'Small Weather wanted their first video since signing to be made by hand, not by a plug-in. The song is about a night walk after a funeral, so it had to be warm rather than sad.',
        'Budget and schedule allowed eight weeks and two animators. We chose a limited palette and twelve frames per second to make that count.'
      ],
      frames: [
        { t: 0.1, caption: 'Verse one: the first lantern leaves a kitchen window.' },
        { t: 0.4, caption: 'Chorus: the whole street joins in.' },
        { t: 0.7, caption: 'Bridge: the lanterns drift over the river.' },
        { t: 0.95, caption: 'Last chorus: they become the stars.' }
      ],
      process: [
        { title: 'Pencil animatic', text: 'Every shot drawn on paper first and cut to the demo, so the band signed off on the rhythm before a single frame was colored.' },
        { title: 'Two hands, one line', text: 'Isabel Moncur and Marika split the shots by scene and swapped a brush set so the line quality never jumps.' },
        { title: 'Glow in the comp', text: 'Grain and glow were added in compositing, not painted, so the band could ask for a warmer night two days before delivery.' }
      ],
      results: [
        { figure: '2,568', label: 'drawings, colored in TVPaint' },
        { figure: '8 weeks', label: 'from first call to premiere' },
        { figure: 'Shortlisted', label: 'animated video of the year, at the Capitol Region Screen Awards' }
      ],
      credits: [['Artist', 'Small Weather'], ['Director', 'Marika Drever'], ['Cel animation', 'Isabel Moncur'], ['Color', 'Lucas Pacheco']],
      quote: { text: 'We watched it in the van and nobody spoke for a minute. That’s the song.', name: 'Tamar Lyall', role: 'Singer, Small Weather' }
    },
    {
      id: 'morrowfield-titles', title: 'Morrowfield Festival Titles', client: 'Morrowfield Film Festival', discipline: 'titles', year: 2025, runtime: 30,
      role: 'Direction, design and 3D', motif: 'iris', palette: ['#0f0f12', '#f2f0ea', '#e8473b', '#f3c34a'],
      summary: 'A festival bumper and pre-show titles built around a camera iris that never quite closes.',
      tags: ['festival', 'bumper', 'movie theater', 'pre-show'],
      brief: [
        'Morrowfield screens 120 films in ten days across three theaters. The festival wanted a 30-second bumper before every screening that audiences would still enjoy on day ten.',
        'It also had to work as a 6-second sting, on lobby screens with no sound, and in the festival’s print program.'
      ],
      frames: [
        { t: 0.05, caption: 'The iris begins almost shut.' },
        { t: 0.38, caption: 'Blades turn; color floods through.' },
        { t: 0.66, caption: 'The festival mark forms in the aperture.' },
        { t: 0.96, caption: 'Hold for the sponsor line, then cut to black.' }
      ],
      process: [
        { title: 'One mechanism', text: 'A nine-blade iris modeled in Cinema 4D, so every version (30 s, 6 s, lobby loop, stills) comes from the same scene.' },
        { title: 'Ten endings', text: 'A different color on each day of the festival keeps the bumper fresh for regulars without a new edit.' },
        { title: 'Theater checks', text: 'Graded and checked on the main screen at Morrowfield before delivery as a DCP and web masters.' }
      ],
      results: [
        { figure: '120', label: 'screenings opened by the bumper' },
        { figure: '10', label: 'daily colorways from one scene' },
        { figure: '4', label: 'formats: theater, sting, lobby loop and print' }
      ],
      credits: [['Client', 'Morrowfield Film Festival'], ['Direction and design', 'Marika Drever'], ['3D and lighting', 'Jojo Dalgety'], ['Music', 'Calum Torrance']],
      quote: null
    },
    {
      id: 'lowlight-hours', title: 'The Lowlight Hours', client: 'Kettlebrook Pictures', discipline: 'titles', year: 2025, runtime: 72,
      role: 'Title design and animation', motif: 'windows', palette: ['#101828', '#f6efe1', '#f2b84b', '#5f7da8'],
      summary: 'Opening titles for a six-part drama set in one Hartford apartment house over one long night.',
      tags: ['drama', 'television', 'opening titles', 'typography'],
      brief: [
        'The Lowlight Hours follows six neighbors in a Frog Hollow six-family house over a single winter night. The showrunner wanted titles that told you that before anyone spoke.',
        'Kettlebrook asked for a 70-second main title, an end-credit roller and episode cards for six episodes.'
      ],
      frames: [
        { t: 0.12, caption: 'Dusk: the stairwell is dark.' },
        { t: 0.4, caption: 'Windows light one by one as names appear.' },
        { t: 0.7, caption: 'The whole building is awake.' },
        { t: 0.98, caption: 'The title card, the last window still lit.' }
      ],
      process: [
        { title: 'Six windows, six lives', text: 'Each window belongs to a character; it lights when their actor’s name appears, so the titles quietly introduce the cast.' },
        { title: 'Type for the building', text: 'A condensed type set in the proportions of the building’s windows, kerned frame by frame where the motion made gaps.' },
        { title: 'Graded with the show', text: 'Delivered in the drama’s own color pipeline so the titles cut straight into the first shot.' }
      ],
      results: [
        { figure: '6', label: 'episodes, each with its own title card' },
        { figure: '72 s', label: 'main title, plus a 20-second short version' },
        { figure: 'Nominated', label: 'title design of the year, Capitol Region Screen Awards' }
      ],
      credits: [['Production', 'Kettlebrook Pictures'], ['Title design', 'Marika Drever'], ['Music', 'Calum Torrance'], ['Edit', 'Lucas Pacheco']],
      quote: { text: 'Marika found the visual idea inside a very complicated show, then gave us titles our viewers talk about.', name: 'Annis Greig', role: 'Series producer, Kettlebrook Pictures' }
    },
    {
      id: 'heat-gets-home', title: 'How the Heat Gets Home', client: 'Coltsville Heat', discipline: 'explainer', year: 2025, runtime: 95,
      role: 'Script, design and animation', motif: 'pipes', palette: ['#f2eadf', '#2b2233', '#e4572e', '#2f8f83'],
      summary: 'An explainer for a community heat network: where the warm water comes from and what it costs.',
      tags: ['energy', 'co-op', 'community', 'public information'],
      brief: [
        'Coltsville Heat is a community-owned heat network connecting 900 apartments to warmth from a riverside water-source heat pump. Residents had questions: is it safe, what happens to my boiler, who do I call?',
        'The co-op needed one film for door-to-door tablets, the website and a public meeting, with subtitles in four languages.'
      ],
      frames: [
        { t: 0.1, caption: 'The river, the pump and the first pipe.' },
        { t: 0.4, caption: 'Heat travels under the street.' },
        { t: 0.7, caption: 'Into the apartment: the heat exchanger.' },
        { t: 0.95, caption: 'Who to call, and what it costs.' }
      ],
      process: [
        { title: 'Questions first', text: 'We sat in on two residents’ meetings and wrote the script from the questions people actually asked.' },
        { title: 'One drop of water', text: 'The film follows a single drop of warm water from the Connecticut River to a kitchen radiator, so nobody has to understand a diagram.' },
        { title: 'Four languages', text: 'Type and timing were designed so the subtitles in English, Spanish, Polish and Portuguese never fight the animation.' }
      ],
      results: [
        { figure: '900', label: 'households reached door to door' },
        { figure: '4', label: 'subtitle languages' },
        { figure: '−60%', label: 'calls to the helpline asking how it works' }
      ],
      credits: [['Client', 'Coltsville Heat'], ['Script, design and animation', 'Marika Drever'], ['Voice and sound', 'Calum Torrance']],
      quote: null
    },
    {
      id: 'borrow-anything', title: 'Borrow Anything', client: 'Brightwell Libraries', discipline: 'explainer', year: 2024, runtime: 60,
      role: 'Direction, design and animation', motif: 'books', palette: ['#fbf1d9', '#22305a', '#ef6f3c', '#3aa58b'],
      summary: 'A cheerful film telling a library service’s readers that they can borrow drills, ukuleles and tents.',
      tags: ['library', 'public sector', 'campaign', 'social'],
      brief: [
        'Brightwell Libraries had quietly built a lending collection of 400 things that aren’t books, from sewing machines to telescopes. Hardly anyone knew.',
        'They needed a 60-second film for buses, movie theaters and social, plus cut-downs, on a city budget.'
      ],
      frames: [
        { t: 0.1, caption: 'A shelf of books, as expected.' },
        { t: 0.42, caption: 'One spine slides out. It’s a ukulele case.' },
        { t: 0.7, caption: 'The shelf fills with things.' },
        { t: 0.96, caption: 'End card: your card, the whole shelf.' }
      ],
      process: [
        { title: 'The shelf is the stage', text: 'Every shot happens on one bookshelf, which kept design time low and the idea instantly readable.' },
        { title: 'Cut-downs from day one', text: 'Animated in a square-safe frame so the 9:16 and 1:1 versions were a re-frame, not a re-animate.' },
        { title: 'Real staff voices', text: 'Library staff recorded the voiceover in a meeting room. It sounds like the place, because it is.' }
      ],
      results: [
        { figure: '3×', label: 'loans of non-book items within a quarter' },
        { figure: '5', label: 'versions from one animation' },
        { figure: '$0', label: 'spent on stock footage or music licenses' }
      ],
      credits: [['Client', 'Brightwell Libraries'], ['Direction and animation', 'Marika Drever'], ['Sound', 'Calum Torrance']],
      quote: { text: 'Our borrowers keep quoting it back to us at the desk.', name: 'Duncan Whyte', role: 'Service manager, Brightwell Libraries' }
    },
    {
      id: 'weather-made', title: 'Weather-Made', client: 'Ledgewear', discipline: 'brand', year: 2024, runtime: 30,
      role: 'Motion identity and launch film', motif: 'rain', palette: ['#20343a', '#eef3ef', '#f2c14e', '#7dbfa8'],
      summary: 'A motion language for a Maine outdoor clothing brand, drawn from sideways rain.',
      tags: ['outdoor', 'retail', 'identity', 'launch film'],
      brief: [
        'Ledgewear makes rain gear on the Maine coast and tests it on the ledges. The rebrand needed motion that felt like weather, not like a sports ad.',
        'Deliverables: a launch film, logo animations, product-page loops and a set of rules for the in-house content team.'
      ],
      frames: [
        { t: 0.1, caption: 'Rain arrives from the left, as it does on the Maine coast.' },
        { t: 0.42, caption: 'The mark turns into the wind.' },
        { t: 0.7, caption: 'Product loops: seams in the squall.' },
        { t: 0.95, caption: 'Clearing: the mark holds steady.' }
      ],
      process: [
        { title: 'Wind direction', text: 'Everything in the system enters at the angle of a coastal nor’easter. It sounds fussy; it makes the brand unmistakable.' },
        { title: 'Loops that breathe', text: 'Product loops run at an uneven rhythm so they never look mechanical on a store page.' },
        { title: 'Rules in a page', text: 'The whole motion guide fits on one page: angle, speed, easing, and three things never to do.' }
      ],
      results: [
        { figure: '1 page', label: 'motion guide the team actually uses' },
        { figure: '26', label: 'product loops delivered' },
        { figure: '+31%', label: 'time on product pages after launch' }
      ],
      credits: [['Client', 'Ledgewear'], ['Direction and design', 'Marika Drever'], ['3D cloth', 'Jojo Dalgety']],
      quote: null
    },
    {
      id: 'ninefold-onboarding', title: 'Ninefold Onboarding', client: 'Ninefold', discipline: 'explainer', year: 2024, runtime: 120,
      role: 'Design and animation system', motif: 'grid', palette: ['#f3f1fb', '#1d1640', '#6c4cf0', '#ff7a6b'],
      summary: 'Nine short films that walk new users of a savings app through nine features, one tile at a time.',
      tags: ['fintech', 'app', 'product', 'UI animation'],
      brief: [
        'Ninefold is a savings app whose home screen is a three-by-three grid of jars. New users didn’t understand the grid, and support was answering the same nine questions.',
        'The brief: nine films of under 15 seconds each, one per feature, that could live inside the app and in help articles.'
      ],
      frames: [
        { t: 0.08, caption: 'The empty grid: nine jars.' },
        { t: 0.4, caption: 'A jar fills as a round-up lands.' },
        { t: 0.7, caption: 'Jars trade places when you reorder them.' },
        { t: 0.95, caption: 'The full grid, ready for payday.' }
      ],
      process: [
        { title: 'UI, not a cartoon', text: 'Built from the app’s real components and type, so the films match what users see a second later.' },
        { title: 'A shared grammar', text: 'Every film opens on the grid and closes on the grid, so they work in any order.' },
        { title: 'Lottie delivery', text: 'Delivered as lightweight Lottie files for the app and MP4 for help pages, from one source.' }
      ],
      results: [
        { figure: '9', label: 'films under 15 seconds' },
        { figure: '−42%', label: 'onboarding support tickets' },
        { figure: '180 KB', label: 'average in-app file size' }
      ],
      credits: [['Client', 'Ninefold'], ['Design and animation', 'Marika Drever']],
      quote: null
    },
    {
      id: 'cold-open', title: 'Cold Open', client: 'Half Fathom', discipline: 'music', year: 2024, runtime: 188,
      role: 'Direction, edit and VHS compositing', motif: 'glitch', palette: ['#0d0d14', '#f5f5f0', '#ff4f7b', '#46d3e6'],
      summary: 'A jittery, type-driven video cut from rehearsal tapes, for a post-punk band’s loudest single.',
      tags: ['band', 'post-punk', 'typography', 'mixed media'],
      brief: [
        'Half Fathom had a box of VHS rehearsal tapes from 2009, a single called Cold Open and no budget for a shoot.',
        'They wanted the video to feel like the song: tight, nervy and over before you’re ready.'
      ],
      frames: [
        { t: 0.06, caption: 'Tracking lines before the count-in.' },
        { t: 0.36, caption: 'The lyric breaks into bars.' },
        { t: 0.64, caption: 'Chorus: color channels split on the snare.' },
        { t: 0.97, caption: 'Tape runs out.' }
      ],
      process: [
        { title: 'Digitize everything', text: 'Eleven hours of tape captured and logged by Lucas Pacheco; we used 94 seconds of it.' },
        { title: 'Cut to the snare', text: 'Every glitch is keyed to a drum hit, so the video plays the song back at you.' },
        { title: 'Type as an instrument', text: 'The lyrics are set in heavy bars that stretch and snap with the vocal.' }
      ],
      results: [
        { figure: '94 s', label: 'of archive used, from eleven hours' },
        { figure: '2 weeks', label: 'from tapes to premiere' },
        { figure: 'Playlisted', label: 'on a national music channel' }
      ],
      credits: [['Artist', 'Half Fathom'], ['Director and editor', 'Marika Drever'], ['Archive and color', 'Lucas Pacheco']],
      quote: { text: 'It sounds silly, but the video made the song louder.', name: 'Sean Quigley', role: 'Guitar, Half Fathom' }
    },
    {
      id: 'seastack', title: 'Seastack', client: 'Harlan Films', discipline: 'titles', year: 2023, runtime: 64,
      role: 'Title design and animation', motif: 'seastack', palette: ['#1e3550', '#f5ecd9', '#f08a4b', '#9cc7c4'],
      summary: 'Titles for a feature documentary about the last keepers of a lighthouse in Long Island Sound.',
      tags: ['documentary', 'feature', 'coast', 'opening titles'],
      brief: [
        'Seastack is a feature documentary about three keepers and the rock they lived on. The director wanted titles as patient as the film: one day passing, in a minute.',
        'Harlan Films needed main titles, a festival trailer end card and a poster still.'
      ],
      frames: [
        { t: 0.05, caption: 'First light behind the stack.' },
        { t: 0.4, caption: 'The sun climbs; the birds come out.' },
        { t: 0.7, caption: 'Afternoon: the tide turns.' },
        { t: 0.97, caption: 'Dusk: the title, and the lamp.' }
      ],
      process: [
        { title: 'One day, one shot', text: 'A single locked-off view that moves through a whole day, so the titles feel like the keepers’ routine.' },
        { title: 'Drawn from the archive', text: 'The stack’s silhouette was traced from the keepers’ own photographs.' },
        { title: 'Poster from the film', text: 'The final frame was printed as the festival poster, so the campaign and the film share one image.' }
      ],
      results: [
        { figure: '1', label: 'continuous shot, 64 seconds' },
        { figure: '9', label: 'festivals screened, with the titles in the trailer' },
        { figure: 'Poster', label: 'printed from the final frame' }
      ],
      credits: [['Production', 'Harlan Films'], ['Title design', 'Marika Drever'], ['Score', 'Calum Torrance']],
      quote: null
    },
    {
      id: 'threads-of-millhaven', title: 'Threads of Millhaven', client: 'Millhaven Museum', discipline: 'brand', year: 2023, runtime: 40,
      role: 'Exhibition motion and identity', motif: 'loom', palette: ['#3a2418', '#f6ead8', '#d9653b', '#e8c46b'],
      summary: 'Gallery films and a moving identity for an exhibition about the women who ran the silk mills.',
      tags: ['museum', 'exhibition', 'heritage', 'projection'],
      brief: [
        'Millhaven Museum’s exhibition told the story of the mill workers who made the city run. It needed a moving identity for the gallery, the website and posters at bus stops.',
        'The centerpiece: a projected loom on a 13-foot wall that visitors walk past.'
      ],
      frames: [
        { t: 0.1, caption: 'The warp is strung.' },
        { t: 0.4, caption: 'The weft crosses, line by line.' },
        { t: 0.7, caption: 'A pattern emerges from the names.' },
        { t: 0.95, caption: 'The finished cloth: the exhibition mark.' }
      ],
      process: [
        { title: 'At loom speed', text: 'The projection runs at the real speed of a power loom, recorded at the museum’s working machine.' },
        { title: 'Names in the cloth', text: 'The weft pattern is built from the names of 312 workers in the museum’s records.' },
        { title: 'From wall to bus stop', text: 'The same pattern generates the posters, so every one is slightly different.' }
      ],
      results: [
        { figure: '312', label: 'names woven into the projection' },
        { figure: '13 ft', label: 'projection wall' },
        { figure: '61,000', label: 'visitors over the exhibition’s run' }
      ],
      credits: [['Client', 'Millhaven Museum'], ['Design and animation', 'Marika Drever'], ['Producer', 'Rory Baird']],
      quote: null
    },
    {
      id: 'tactile-futures', title: 'Tactile Futures', client: 'Tactile Futures Conference', discipline: 'brand', year: 2023, runtime: 20,
      role: 'Conference identity and stage motion', motif: 'dots', palette: ['#121a2b', '#eef1f6', '#5ce1b9', '#f6b04a'],
      summary: 'A stage identity for a conference on touch and accessible design, built on a raised-dot grid.',
      tags: ['conference', 'accessibility', 'events', 'stage screens'],
      brief: [
        'Tactile Futures brings together designers working on touch, haptics and accessible interfaces. Its identity had to be calm on stage, legible for low-vision attendees and never flash.',
        'Deliverables: speaker intros, holding loops, a 20-second opener and social cards.'
      ],
      frames: [
        { t: 0.05, caption: 'The resting grid.' },
        { t: 0.35, caption: 'A fingertip passes; the dots rise.' },
        { t: 0.65, caption: 'Speaker intro: the name in raised dots.' },
        { t: 0.95, caption: 'Holding loop between talks.' }
      ],
      process: [
        { title: 'No flashing, ever', text: 'Every animation tested against photosensitivity guidelines, with slow, low-contrast changes only.' },
        { title: 'Readable at the back', text: 'Type sizes set from the back row of the hall, then checked by attendees with low vision.' },
        { title: 'Live templates', text: 'Speaker intros built as templates the event team filled in on the day.' }
      ],
      results: [
        { figure: '38', label: 'speaker intros made on the day from templates' },
        { figure: '0', label: 'flashing frames' },
        { figure: '2', label: 'years running, the identity reused' }
      ],
      credits: [['Client', 'Tactile Futures'], ['Design and motion', 'Marika Drever'], ['Sound', 'Calum Torrance']],
      quote: null
    },
    {
      id: 'ochil-lights', title: 'Talcott Lights', client: 'Corran', discipline: 'music', year: 2023, runtime: 241,
      role: 'Direction and generative animation', motif: 'aurora', palette: ['#0b1424', '#eef4f2', '#7ef0c0', '#b48cf2'],
      summary: 'A slow aurora over the hills for an ambient record, generated from the track’s own stems.',
      tags: ['ambient', 'album', 'generative', 'landscape'],
      brief: [
        'Corran recorded the album in a cabin under Talcott Mountain. The lead track is four minutes of drones that build like weather. The video needed to hold attention without cutting.',
        'It also had to loop as a live visual for the album tour.'
      ],
      frames: [
        { t: 0.08, caption: 'Night over the hills, stars only.' },
        { t: 0.38, caption: 'The first ribbon, from the bass stem.' },
        { t: 0.66, caption: 'The strings stem adds the violet.' },
        { t: 0.95, caption: 'Full aurora as the drones peak.' }
      ],
      process: [
        { title: 'Driven by stems', text: 'Each ribbon of light follows one stem of the mix, so the sky plays the track.' },
        { title: 'No cuts', text: 'One four-minute shot; the motion supplies the edit.' },
        { title: 'Tour-ready', text: 'Exported as a seamless loop for the band’s live projector.' }
      ],
      results: [
        { figure: '4 min', label: 'single shot, no cuts' },
        { figure: '3', label: 'stems driving the light' },
        { figure: '22', label: 'tour dates with the live loop' }
      ],
      credits: [['Artist', 'Corran'], ['Direction and animation', 'Marika Drever']],
      quote: null
    },
    {
      id: 'book-in-every-bag', title: 'A Book in Every Bag', client: 'Bookwren', discipline: 'explainer', year: 2022, runtime: 75,
      role: 'Direction, illustration and animation', motif: 'satchel', palette: ['#fff4dc', '#2a2350', '#ff7b54', '#4cb5ae'],
      summary: 'A fundraising film for a children’s literacy nonprofit that puts a book in every school bag.',
      tags: ['nonprofit', 'children', 'fundraising', 'illustration'],
      brief: [
        'Bookwren gives a free book to every elementary school student in Greater Hartford each semester. The nonprofit needed a film for its benefit night that would make adults reach for their phones.',
        'Requirements: under 90 seconds, no sad music, and a clear ask at the end.'
      ],
      frames: [
        { t: 0.1, caption: 'An empty school bag.' },
        { t: 0.42, caption: 'A book goes in. Stories come out.' },
        { t: 0.7, caption: 'Every bag in the class glows.' },
        { t: 0.96, caption: 'The ask: $10 is one child’s book for a semester.' }
      ],
      process: [
        { title: 'Children’s drawings', text: 'Students from two Hartford elementary schools drew the creatures that fly out of the bag.' },
        { title: 'One clear number', text: 'The whole script builds to one figure, $10, so the ask is impossible to miss.' },
        { title: 'Made for a school gym', text: 'Mixed for a school-gym PA as well as phones.' }
      ],
      results: [
        { figure: '$57,500', label: 'raised on the benefit night' },
        { figure: '5,750', label: 'books funded' },
        { figure: '2', label: 'elementary schools drew the characters' }
      ],
      credits: [['Client', 'Bookwren'], ['Direction and animation', 'Marika Drever'], ['Illustration', 'Isabel Moncur'], ['Music', 'Calum Torrance']],
      quote: null
    },
    {
      id: 'hollowtide', title: 'Hollowtide', client: 'Glimmerfield Games', discipline: 'titles', year: 2022, runtime: 50,
      role: 'Trailer titles and logo animation', motif: 'tower', palette: ['#16202c', '#f1ece2', '#f2b84b', '#4fb8c9'],
      summary: 'Logo and trailer titles for an indie game about a lighthouse town slowly swallowed by the sea.',
      tags: ['games', 'trailer', 'logo', 'low-poly'],
      brief: [
        'Glimmerfield is a four-person studio in Hartford. Hollowtide, their second game, needed a logo animation and trailer titles for its store page and a showcase slot.',
        'The art style is low-poly and muted, so the titles had to sit inside it, not on top.'
      ],
      frames: [
        { t: 0.06, caption: 'Low tide: the town is dry.' },
        { t: 0.4, caption: 'The water rises with the logo.' },
        { t: 0.7, caption: 'Only the tower is left.' },
        { t: 0.96, caption: 'Release date card.' }
      ],
      process: [
        { title: 'Built in their engine', text: 'Assets came from the game itself, so the trailer titles match the game exactly.' },
        { title: 'Tide as transition', text: 'The rising water wipes between shots and reveals each title.' },
        { title: 'Store-ready', text: 'Delivered in every size the stores ask for, including the looping capsule art.' }
      ],
      results: [
        { figure: '50 s', label: 'trailer with titles throughout' },
        { figure: '1.2M', label: 'trailer views in its first month' },
        { figure: '7', label: 'store sizes delivered' }
      ],
      credits: [['Client', 'Glimmerfield Games'], ['Titles and logo animation', 'Marika Drever'], ['3D', 'Jojo Dalgety']],
      quote: null
    }
  ];

  // The showreel on the home page: these projects, in this order. Each scene runs SCENE_SECONDS.
  var REEL = { scenes: ['season-of-tides', 'lowlight-hours', 'paper-lanterns', 'heat-gets-home', 'seastack', 'ochil-lights'], sceneSeconds: 4, fps: 24 };

  /* The estimator (services.html). Prices are US dollars, before sales tax.
     total = design + animation (seconds × perSecond × style factor) + extra rounds + add-ons, then rush. */
  var SERVICES = {
    titles: { name: 'Title sequence', design: 3000, perSecond: 120, seconds: 60, min: 15, max: 180, weeks: 5 },
    brand: { name: 'Brand motion system', design: 4000, perSecond: 90, seconds: 30, min: 15, max: 120, weeks: 6 },
    explainer: { name: 'Explainer animation', design: 2400, perSecond: 75, seconds: 90, min: 30, max: 180, weeks: 5 },
    music: { name: 'Music video', design: 2500, perSecond: 40, seconds: 180, min: 120, max: 300, weeks: 6 }
  };
  var STYLES = {
    graphic: { name: '2D graphic', factor: 1, note: 'Shape, type and color' },
    mixed: { name: 'Mixed media', factor: 1.25, note: 'Collage, footage and texture' },
    cel: { name: 'Hand-drawn cel', factor: 1.45, note: 'Frame-by-frame drawing' },
    cgi: { name: '3D', factor: 1.6, note: 'Modeled, lit and rendered' }
  };
  var ROUNDS = { included: 2, extraFee: 600, max: 4 };
  var RUSH = { uplift: 0.3, weeksFactor: 0.65, threshold: 4 };
  var DEPOSIT = 0.4;
  var ADD_ONS = {
    sound: { name: 'Sound design and mix', base: 600, perSecond: 6 },
    cutdowns: { name: 'Social cut-downs (9:16, 1:1, 4:5)', base: 1000, perSecond: 0 },
    captions: { name: 'Caption files and burned-in subtitles', base: 150, perSecond: 0 }
  };

  /* Journal notes, newest first. Dates are written for the week of DEMO_ANCHOR in main.js and,
     while KEEP_DEMO_CURRENT is true, move forward in whole weeks so the newest note is always recent. */
  var TOPICS = {
    process: 'Process',
    craft: 'Craft',
    studio: 'Studio',
    tools: 'Tools'
  };
  var JOURNAL = [
    {
      id: 'give-motion-a-verb', date: '2026-10-20', topic: 'process', minutes: 6, title: 'Give motion a verb',
      excerpt: 'A useful movement system starts with language more specific than “energetic” or “premium”.',
      body: [
        'Every brand brief I get asks for motion that is “dynamic”. That word has never once helped me animate anything. So the first thing I do on a brand project now is ask the client to pick verbs instead: does the logo arrive, or does it surface? Does a headline slide in, or does it get pushed?',
        'For Bracken Hall we ended up with six verbs taken from the sea: swell, ebb, crest, slack, surge and still. Each became a preset with its own easing curve. A year later the team still uses the names in meetings, which is how I know they stuck.',
        'If you’re writing a motion brief, try it: list five verbs your brand would do and five it would never do. It will save us a week.'
      ]
    },
    {
      id: 'designing-for-the-quiet-cut', date: '2026-10-08', topic: 'craft', minutes: 4, title: 'Designing for the quiet cut',
      excerpt: 'Most of what I make is watched with the sound off. Timing has to carry the rhythm on its own.',
      body: [
        'Around four in five plays of a social film happen muted. That changes how I cut: the rhythm has to live in the picture, so I animate to a click track and then check the whole piece with the speakers off.',
        'The quiet cut has rules. Hold type for at least a second and a half per line. Put the beat on a change of shape, not just a change of position. And never rely on a sound effect to explain an action.',
        'Then we add the sound back in, and it gets better again. Calum calls it “earning the mix”.'
      ]
    },
    {
      id: 'after-the-hero-film', date: '2026-09-23', topic: 'process', minutes: 7, title: 'After the hero film',
      excerpt: 'Building a motion kit that stays expressive in the everyday hands of an in-house team.',
      body: [
        'The launch film is the bit everyone remembers, but it’s maybe a fifth of a brand motion job. The rest is what happens on a rainy Tuesday six months later, when someone in marketing needs a 6-second sting for a program change.',
        'So the kit gets as much care as the film: templates with locked timing and editable text, a one-page guide, and a short recorded walkthrough. I test it by handing it to someone who has never opened After Effects.',
        'If they can make something good in an hour, the kit is done.'
      ]
    },
    {
      id: 'twenty-four-frames-of-the-tay', date: '2026-09-04', topic: 'studio', minutes: 3, title: 'Twenty-four frames of the Connecticut',
      excerpt: 'The view from the studio window, one frame an hour for a day, and why I keep doing it.',
      body: [
        'Once a season I put a camera on the studio windowsill and take one frame an hour for a day. Twenty-four frames of the river, the Founders Bridge and the hills past East Hartford.',
        'It’s the best color reference I have. The September set has a gray-green at four in the afternoon that ended up in the Seastack titles, and a pink at six that I still haven’t found a use for.'
      ]
    },
    {
      id: 'index-cards', date: '2026-08-13', topic: 'process', minutes: 5, title: 'Why I storyboard on index cards',
      excerpt: 'Cheap, shuffleable and impossible to over-polish: the best tool in the studio costs $3 a pack.',
      body: [
        'Every project starts on 4 × 6 inch cards pinned to the wall. One card, one shot. Drawn in marker, so nobody, me included, can mistake them for finished frames.',
        'The magic is that you can shuffle them. Half the best edits in my work came from a client moving two cards around during a call.',
        'Once the order holds, the cards get photographed and cut into an animatic. Only then do I open a computer.'
      ]
    },
    {
      id: 'kerning-a-title-that-moves', date: '2026-07-15', topic: 'craft', minutes: 6, title: 'Kerning a title that has to move',
      excerpt: 'Type that looks perfect as a still can fall apart at 24 frames a second. Here’s how I check it.',
      body: [
        'Kerning is set for stillness. The moment letters move independently, gaps open and close that no type designer intended. On The Lowlight Hours, the title card looked right on frame 1 and wrong on frame 40.',
        'My fix is unglamorous: I scrub through at quarter speed and keyframe the tracking where it drifts. It took a day for a 70-second title. Nobody will ever notice, which is the point.'
      ]
    },
    {
      id: 'a-pipeline-i-didnt-need', date: '2026-06-19', topic: 'tools', minutes: 8, title: 'A week with a 3D pipeline I didn’t need',
      excerpt: 'I tried to make a 2D explainer in a full 3D pipeline. Here’s what I learned before I went back.',
      body: [
        'In June I set myself a test: rebuild one scene of How the Heat Gets Home in Blender, start to finish, to see if a 3D pipeline would make the next explainer faster.',
        'It didn’t. Lighting a flat illustration style in 3D is a fight, and renders turned a ten-minute change into an overnight wait. What I did gain was camera moves I couldn’t have drawn, and I’ll use those, sparingly.',
        'The lesson is the one I keep relearning: pick the tool for the look, not the look for the tool.'
      ]
    },
    {
      id: 'what-a-second-costs', date: '2026-05-18', topic: 'studio', minutes: 5, title: 'What a second of animation costs',
      excerpt: 'Why my estimate starts with seconds and style, and why the first number is never the whole story.',
      body: [
        'People are often surprised that a 60-second film can cost more than a 3-minute one. The difference is almost always style: a second of hand-drawn cel can be forty drawings; a second of graphic animation might be four keyframes.',
        'So the estimator on the services page starts there: how long, and how it’s made. Design and direction are a fixed cost on top, because a 15-second film still needs an idea.',
        'The estimate is honest about the rest, too: extra rounds of changes cost time, and so does a rush.'
      ]
    },
    {
      id: 'notes-from-a-festival-jury', date: '2026-04-23', topic: 'studio', minutes: 4, title: 'Notes from a festival jury',
      excerpt: 'Three days, 140 short films and one thing every winner had in common.',
      body: [
        'I spent three days this spring on the animation jury of a short-film festival. We watched 140 films. The winners weren’t the most technically ambitious; they were the ones where every shot knew why it was there.',
        'I came home and cut eight seconds from a title sequence I’d thought was finished.'
      ]
    }
  ];

  // Collaborators on the about page. `shape` and `colour` draw their portrait mark in main.js.
  var PEOPLE = [
    { name: 'Calum Torrance', role: 'Sound design and music', base: 'West Hartford', shape: 'wave', colour: '#7fb7c9', note: 'Has scored or sound-designed eight of the films in the index. Records foley in his stairwell.' },
    { name: 'Jojo Dalgety', role: '3D, lighting and cloth', base: 'Wethersfield', shape: 'cube', colour: '#f2b84b', note: 'Cinema 4D and Houdini. Joins when a project needs things that are modeled, lit and rendered.' },
    { name: 'Isabel Moncur', role: 'Cel animation and illustration', base: 'Middletown', shape: 'line', colour: '#ff9f5a', note: 'Draws frame by frame in TVPaint. The hand behind Paper Lanterns and Bookwren.' },
    { name: 'Lucas Pacheco', role: 'Edit and color', base: 'Hartford', shape: 'bars', colour: '#8f6bd8', note: 'Cuts, grades and wrangles archive. Owns more VHS decks than anyone should.' },
    { name: 'Rory Baird', role: 'Producer', base: 'Glastonbury', shape: 'grid', colour: '#5ce1b9', note: 'Schedules, budgets and the calm voice on the call when the deadline moves.' }
  ];

  return {
    STUDIO: STUDIO, DISCIPLINES: DISCIPLINES, PROJECTS: PROJECTS, REEL: REEL,
    SERVICES: SERVICES, STYLES: STYLES, ROUNDS: ROUNDS, RUSH: RUSH, DEPOSIT: DEPOSIT, ADD_ONS: ADD_ONS,
    TOPICS: TOPICS, JOURNAL: JOURNAL, PEOPLE: PEOPLE
  };
})();
