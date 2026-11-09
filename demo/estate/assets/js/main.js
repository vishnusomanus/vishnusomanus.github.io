/* Estate — Harbor & Hill Realty
 * Vanilla JavaScript, no dependencies.
 *
 *  1. Data: agents and properties (edit these to use your own listings)
 *  2. Artwork: SVG illustrations for exteriors, interiors and floor plans
 *  3. Shared UI: header, mobile menu, saved homes, reveal, toast, forms
 *  4. Pages: home (featured), listings (filters), property (gallery, calculator)
 */
(function () {
  'use strict';

  /* ======================================================================
   * 1. DATA
   * ==================================================================== */

  var AGENTS = [
    { id: 1, name: 'Eleanor Vance', role: 'Founding Partner', phone: '(207) 555-0156', email: 'eleanor@example.com', img: 'assets/img/agent-1.svg' },
    { id: 2, name: 'Marcus Bell', role: 'Senior Agent, Coastal Homes', phone: '(207) 555-0151', email: 'marcus@example.com', img: 'assets/img/agent-2.svg' },
    { id: 3, name: 'Priya Nair', role: 'Rentals Director', phone: '(207) 555-0152', email: 'priya@example.com', img: 'assets/img/agent-3.svg' },
    { id: 4, name: 'Tom Okafor', role: 'Agent, Waterfront Apartments', phone: '(207) 555-0153', email: 'tom@example.com', img: 'assets/img/agent-4.svg' },
    { id: 5, name: 'Grace Lindholm', role: 'Agent, Family Homes', phone: '(207) 555-0154', email: 'grace@example.com', img: 'assets/img/agent-5.svg' },
    { id: 6, name: 'Daniel Ruiz', role: 'Valuation Specialist', phone: '(207) 555-0155', email: 'daniel@example.com', img: 'assets/img/agent-6.svg' }
  ];

  // status: 'buy' or 'rent' (rent prices are per month). listed: days since listing.
  // look: exterior style, time of day and colors used by the artwork.
  var PROPERTIES = [
    { id: 1, title: 'Glasshouse on Cedar Ridge', address: '18 Cedar Ridge Road', area: 'Cedar Heights', status: 'buy', type: 'House',
      price: 1450000, beds: 4, baths: 3, sqft: 3200, year: 2021, parking: '2-car garage', lot: '0.4 acres', listed: 2, agent: 1, badges: ['New'],
      look: { kind: 'modern', time: 'dusk', wall: '#e8e2d6', trim: '#3b403c', accent: '#7d8f7a', room: '#ece6da' },
      summary: 'A light-filled modern home cantilevered over a wooded slope, with floor-to-ceiling glass on every level and a heated lap pool.',
      features: ['Floor-to-ceiling glazing', 'Heated lap pool', 'Chef’s kitchen with island', 'Radiant floor heating', 'Solar panels with battery', 'Home office with forest view'] },
    { id: 2, title: 'Harborside Loft', address: 'Unit 6C, 40 Quay Street', area: 'The Docklands', status: 'buy', type: 'Apartment',
      price: 685000, beds: 2, baths: 2, sqft: 1240, year: 2016, parking: '1 secure space', lot: '—', listed: 5, agent: 4, badges: [],
      look: { kind: 'apartment', time: 'night', wall: '#d8d0c3', trim: '#2f3633', accent: '#3d4f6b', room: '#e9e3d8' },
      summary: 'A corner loft with exposed brick, 10-foot ceilings and a balcony that looks straight across the working harbor.',
      features: ['Corner unit with two aspects', 'Private balcony', 'Exposed brick and timber beams', 'Concierge and gym', 'Bike storage', 'Walk to ferry terminal'] },
    { id: 3, title: 'Rose Cottage', address: '7 Orchard Lane', area: 'Linden Park', status: 'buy', type: 'Cottage',
      price: 540000, beds: 3, baths: 1, sqft: 1500, year: 1912, parking: 'Driveway', lot: '0.2 acres', listed: 9, agent: 5, badges: ['Open house Sat'],
      look: { kind: 'cottage', time: 'golden', wall: '#efe5d1', trim: '#6b4b3e', accent: '#b5653f', room: '#efe7d8' },
      summary: 'A storybook 1912 cottage with original fireplaces, a deep front porch and a cottage garden full of climbing roses.',
      features: ['Original fireplaces', 'Wraparound front porch', 'Mature cottage garden', 'Updated electrics (2023)', 'Walk-in pantry', 'Five minutes to Linden Park school'] },
    { id: 4, title: 'Westshore Beach House', address: '3 Dune View Drive', area: 'Westshore', status: 'buy', type: 'House',
      price: 1120000, beds: 3, baths: 2, sqft: 2100, year: 2008, parking: 'Carport', lot: '0.3 acres', listed: 14, agent: 2, badges: [],
      look: { kind: 'coastal', time: 'day', wall: '#f4f1ea', trim: '#5c6f7a', accent: '#5b8aa6', room: '#f1ede4' },
      summary: 'Raised on timber piles above the dunes, with a wraparound deck and a private boardwalk to the beach.',
      features: ['Direct beach access', 'Wraparound ocean deck', 'Outdoor shower', 'Vaulted living room', 'Storm-rated windows', 'Room for a boat'] },
    { id: 5, title: 'Mill Lane Townhouse', address: '22 Mill Lane', area: 'Old Harbor', status: 'buy', type: 'Townhouse',
      price: 795000, beds: 3, baths: 2, sqft: 1680, year: 1890, parking: 'Permit parking', lot: '—', listed: 3, agent: 1, badges: ['New'],
      look: { kind: 'townhouse', time: 'day', wall: '#c98b6b', trim: '#2f3a40', accent: '#7a8b6d', room: '#eee6da' },
      summary: 'A restored Victorian terrace on a quiet cobbled lane, two minutes from Old Harbor’s cafés and the waterfront.',
      features: ['Restored period details', 'South-facing courtyard', 'Bay window living room', 'New kitchen (2024)', 'Loft storage', 'Two minutes to the waterfront'] },
    { id: 6, title: 'Skyline Residence 14B', address: '14B Meridian Tower', area: 'The Docklands', status: 'rent', type: 'Apartment',
      price: 3400, beds: 2, baths: 2, sqft: 1100, year: 2022, parking: '1 space', lot: '—', listed: 1, agent: 3, badges: ['New', 'Furnished'],
      look: { kind: 'apartment', time: 'dusk', wall: '#cfd5d6', trim: '#2c3436', accent: '#a7834b', room: '#ebe6dc' },
      summary: 'A furnished fourteenth-floor apartment with sunset views over the bay, a residents’ rooftop and 24-hour concierge.',
      features: ['Fully furnished', 'Rooftop terrace and pool', '24-hour concierge', 'Floor-to-ceiling windows', 'In-unit laundry', 'Pets considered'] },
    { id: 7, title: 'Garden Flat on Elm Street', address: '11A Elm Street', area: 'Linden Park', status: 'rent', type: 'Apartment',
      price: 1850, beds: 1, baths: 1, sqft: 720, year: 1925, parking: 'Street', lot: '—', listed: 6, agent: 3, badges: [],
      look: { kind: 'townhouse', time: 'golden', wall: '#e3d6bf', trim: '#3e4a3f', accent: '#7d8f7a', room: '#efe8db' },
      summary: 'A calm garden-level flat with its own entrance and a private patio, steps from Linden Park and the farmers’ market.',
      features: ['Private entrance', 'Private patio garden', 'High ceilings', 'Updated bathroom', 'Storage room', 'Near the farmers’ market'] },
    { id: 8, title: 'Hillcrest Modern', address: '5 Summit Way', area: 'Hillcrest', status: 'buy', type: 'House',
      price: 1890000, beds: 5, baths: 4, sqft: 4100, year: 2019, parking: '3-car garage', lot: '0.6 acres', listed: 21, agent: 1, badges: ['Price reduced'],
      look: { kind: 'modern', time: 'day', wall: '#f1ede5', trim: '#a8774f', accent: '#3d4f6b', room: '#efebe3' },
      summary: 'A five-bedroom family home at the top of Hillcrest with panoramic views over Marlow Bay and an indoor-outdoor kitchen.',
      features: ['Panoramic bay views', 'Indoor-outdoor kitchen', 'Media room', 'Guest suite with own entrance', 'EV charging', 'Landscaped terraces'] },
    { id: 9, title: 'Dune Cottage', address: '9 Seagrass Lane', area: 'Westshore', status: 'rent', type: 'House',
      price: 4200, beds: 3, baths: 2, sqft: 1650, year: 2012, parking: 'Driveway', lot: '0.2 acres', listed: 11, agent: 2, badges: ['Pets OK'],
      look: { kind: 'coastal', time: 'golden', wall: '#eef0ec', trim: '#4f6470', accent: '#b5653f', room: '#f0ebe1' },
      summary: 'A breezy beach house a short walk from the surf, with a sunny deck, outdoor shower and space for boards and bikes.',
      features: ['Two minutes to the beach', 'Sunny deck', 'Outdoor shower', 'Board and bike storage', 'Pets welcome', 'Available from November'] },
    { id: 10, title: 'Chapel Row No. 7', address: '7 Chapel Row', area: 'Old Harbor', status: 'buy', type: 'Townhouse',
      price: 925000, beds: 4, baths: 3, sqft: 2050, year: 1885, parking: 'Garage (rear)', lot: '—', listed: 30, agent: 5, badges: [],
      look: { kind: 'townhouse', time: 'dusk', wall: '#7d93a6', trim: '#283035', accent: '#a7834b', room: '#ece4d6' },
      summary: 'A tall four-story townhouse on Old Harbor’s prettiest row, with a roof terrace that catches the evening sun.',
      features: ['Roof terrace with harbor view', 'Four stories', 'Original sash windows', 'Wine cellar', 'Rear garage', 'Top-rated school catchment'] },
    { id: 11, title: 'Orchard Cottage', address: '2 Apple Tree Close', area: 'Cedar Heights', status: 'rent', type: 'Cottage',
      price: 2600, beds: 2, baths: 1, sqft: 980, year: 1938, parking: 'Driveway', lot: '0.15 acres', listed: 4, agent: 3, badges: [],
      look: { kind: 'cottage', time: 'day', wall: '#f3ede0', trim: '#4e5d52', accent: '#7d8f7a', room: '#f1ebdf' },
      summary: 'A cozy two-bedroom cottage beside an old apple orchard, with a wood stove and a garden shed for projects.',
      features: ['Wood-burning stove', 'Large garden with shed', 'Quiet cul-de-sac', 'Updated kitchen', 'Unfurnished', 'Twelve-month lease'] },
    { id: 12, title: 'The Wharf Penthouse', address: 'Penthouse, 1 Wharf Road', area: 'The Docklands', status: 'buy', type: 'Apartment',
      price: 2350000, beds: 3, baths: 3, sqft: 2600, year: 2020, parking: '2 secure spaces', lot: '—', listed: 8, agent: 4, badges: ['Exclusive'],
      look: { kind: 'apartment', time: 'golden', wall: '#e4dccd', trim: '#3a3632', accent: '#7d8f7a', room: '#efe9df' },
      summary: 'A full-floor penthouse with a wraparound terrace, private lift and 270° views from the lighthouse to the hills.',
      features: ['Wraparound terrace', 'Private lift', '270° bay views', 'Primary suite with dressing room', 'Two secure parking spaces', 'Residents’ spa'] }
  ];

  /* ======================================================================
   * 2. ARTWORK (inline SVG)
   * ==================================================================== */

  var uidCounter = 0;
  function uid(p) { uidCounter += 1; return p + uidCounter; }

  // Small seeded random generator, so each property always looks the same.
  function rng(seed) {
    var a = seed * 9301 + 49297;
    return function () { a = (a * 16807) % 2147483647; return (a % 10000) / 10000; };
  }

  // Mix a hex color toward another color by t (0..1).
  function mix(a, b, t) {
    var pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
    var r = Math.round(((pa >> 16) & 255) * (1 - t) + ((pb >> 16) & 255) * t);
    var g = Math.round(((pa >> 8) & 255) * (1 - t) + ((pb >> 8) & 255) * t);
    var bl = Math.round((pa & 255) * (1 - t) + (pb & 255) * t);
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + bl).toString(16).slice(1);
  }

  var TIMES = {
    day:    { sky: ['#9fc3de', '#e9f0ec'], orb: '#fff7dc', ground: '#93ad7f', far: '#b7c7b2', glass: '#bcd4de', lit: false, dim: 0 },
    golden: { sky: ['#eea974', '#fbe4c6'], orb: '#ffe6ad', ground: '#a6a66e', far: '#d5b796', glass: '#f3d4a3', lit: false, dim: 0.06 },
    dusk:   { sky: ['#4b5888', '#e8a586'], orb: '#ffd9b3', ground: '#59664f', far: '#7f7a8e', glass: '#ffcd78', lit: true, dim: 0.3 },
    night:  { sky: ['#121a31', '#33406a'], orb: '#f4f1e6', ground: '#28362f', far: '#2d3955', glass: '#ffc76a', lit: true, dim: 0.52 }
  };
  var NIGHT = '#16203a';

  function svgOpen(label) {
    return '<svg class="art" viewBox="0 0 900 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg"' +
      (label ? ' role="img" aria-label="' + esc(label) + '"' : ' aria-hidden="true"') + '>';
  }

  function sky(t, r) {
    var id = uid('sky');
    var s = '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + t.sky[0] + '"/><stop offset="1" stop-color="' + t.sky[1] + '"/></linearGradient></defs>' +
      '<rect width="900" height="600" fill="url(#' + id + ')"/>';
    if (t === TIMES.night) {
      for (var i = 0; i < 40; i++) s += '<circle cx="' + Math.round(r() * 900) + '" cy="' + Math.round(r() * 300) + '" r="' + (r() * 1.4 + .4).toFixed(1) + '" fill="#fff" opacity="' + (r() * .6 + .3).toFixed(2) + '"/>';
      s += '<circle cx="720" cy="110" r="34" fill="' + t.orb + '"/><circle cx="706" cy="100" r="30" fill="' + t.sky[0] + '" opacity=".25"/>';
    } else {
      var cy = t === TIMES.day ? 110 : t === TIMES.golden ? 250 : 330;
      s += '<circle cx="700" cy="' + cy + '" r="' + (t === TIMES.day ? 46 : 70) + '" fill="' + t.orb + '" opacity="' + (t === TIMES.day ? .95 : .8) + '"/>';
      if (t === TIMES.day) {
        s += cloud(160, 120, 1) + cloud(480, 80, .8);
      }
    }
    return s;
  }
  function cloud(x, y, k) {
    return '<g fill="#fff" opacity=".85" transform="translate(' + x + ' ' + y + ') scale(' + k + ')"><ellipse cx="0" cy="0" rx="60" ry="18"/><ellipse cx="-22" cy="-12" rx="28" ry="20"/><ellipse cx="18" cy="-16" rx="32" ry="24"/></g>';
  }
  function hills(t) {
    return '<path d="M0 400 C150 340 260 360 390 380 S640 330 900 370 V600 H0Z" fill="' + t.far + '" opacity=".55"/>';
  }
  function tree(x, y, s, t, r) {
    var g = mix('#5f7d55', NIGHT, t.dim), g2 = mix('#7c9a68', NIGHT, t.dim);
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')">' +
      '<rect x="-5" y="-10" width="10" height="70" fill="' + mix('#6b4f3a', NIGHT, t.dim) + '"/>' +
      '<circle cx="0" cy="-40" r="46" fill="' + g + '"/><circle cx="-30" cy="-14" r="32" fill="' + g + '"/><circle cx="30" cy="-18" r="34" fill="' + g + '"/>' +
      '<circle cx="-12" cy="-58" r="24" fill="' + g2 + '" opacity="' + (.5 + r() * .3).toFixed(2) + '"/></g>';
  }
  function windowPane(x, y, w, h, t, frame, glowId) {
    var fill = t.lit ? 'url(#' + glowId + ')' : t.glass;
    var s = '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + fill + '" stroke="' + frame + '" stroke-width="5"/>';
    if (!t.lit) s += '<path d="M' + (x + w * .15) + ' ' + (y + h) + ' L' + (x + w * .55) + ' ' + y + ' L' + (x + w * .7) + ' ' + y + ' L' + (x + w * .3) + ' ' + (y + h) + 'Z" fill="#fff" opacity=".25"/>';
    return s;
  }
  function glowDef(t) {
    var id = uid('glow');
    return { id: id, def: '<defs><radialGradient id="' + id + '" cx=".5" cy=".7" r=".9"><stop offset="0" stop-color="#ffe3a6"/><stop offset="1" stop-color="' + t.glass + '"/></radialGradient></defs>' };
  }

  var EXTERIORS = {
    modern: function (o, t, r) {
      var wall = mix(o.wall, NIGHT, t.dim), dark = mix(o.trim, NIGHT, t.dim * .6), wood = mix('#a8774f', NIGHT, t.dim);
      var gl = glowDef(t), s = gl.def + hills(t);
      s += '<rect x="0" y="470" width="900" height="130" fill="' + t.ground + '"/>';
      s += tree(90, 420, 1.1, t, r) + tree(820, 410, 1.25, t, r);
      // lower volume
      s += '<rect x="170" y="300" width="470" height="170" fill="' + wall + '"/>';
      s += windowPane(190, 322, 270, 140, t, dark, gl.id);
      s += '<path d="M280 322v140M370 322v140" stroke="' + dark + '" stroke-width="4"/>';
      for (var i = 0; i < 14; i++) s += '<rect x="' + (482 + i * 10) + '" y="318" width="6" height="152" fill="' + wood + '"/>';
      s += '<rect x="170" y="292" width="480" height="10" fill="' + dark + '"/>';
      // upper cantilevered volume
      s += '<rect x="300" y="180" width="460" height="112" fill="' + dark + '"/>';
      s += windowPane(330, 200, 400, 74, t, mix('#1e2421', NIGHT, t.dim), gl.id);
      s += '<path d="M430 200v74M530 200v74M630 200v74" stroke="#1e2421" stroke-width="4"/>';
      s += '<rect x="292" y="172" width="476" height="10" fill="' + mix('#1e2421', NIGHT, t.dim * .5) + '"/>';
      // pool + terrace
      s += '<rect x="60" y="490" width="430" height="12" fill="' + mix('#d8d2c6', NIGHT, t.dim) + '"/>';
      s += '<rect x="80" y="502" width="390" height="40" fill="' + mix('#5aa3c2', NIGHT, t.dim * .7) + '"/>';
      s += '<path d="M100 516h80M220 526h90M340 514h70" stroke="#fff" stroke-width="3" opacity=".5" stroke-linecap="round"/>';
      if (t.lit) s += '<ellipse cx="325" cy="470" rx="190" ry="14" fill="#ffd58a" opacity=".25"/>';
      return s;
    },
    townhouse: function (o, t, r) {
      var cols = [o.wall, '#e6dcc8', mix(o.wall, '#5c6f7a', .55)];
      var trim = mix(o.trim, NIGHT, t.dim * .5), gl = glowDef(t), s = gl.def + hills(t);
      s += '<rect x="0" y="470" width="900" height="130" fill="' + mix('#b9b2a5', NIGHT, t.dim) + '"/>';
      s += '<rect x="0" y="470" width="900" height="16" fill="' + mix('#d7d0c3', NIGHT, t.dim) + '"/>';
      for (var i = 0; i < 3; i++) {
        var x = 150 + i * 200, wall = mix(cols[i], NIGHT, t.dim);
        s += '<rect x="' + x + '" y="230" width="200" height="240" fill="' + wall + '" stroke="' + mix(wall, '#000', .15) + '" stroke-width="2"/>';
        s += '<polygon points="' + (x - 6) + ',232 ' + (x + 100) + ',150 ' + (x + 206) + ',232" fill="' + mix('#4a4f55', NIGHT, t.dim) + '"/>';
        s += '<rect x="' + (x + 140) + '" y="160" width="22" height="50" fill="' + mix('#8a5a44', NIGHT, t.dim) + '"/>';
        s += windowPane(x + 74, 180, 52, 38, t, trim, gl.id);
        s += windowPane(x + 28, 258, 56, 70, t, trim, gl.id) + windowPane(x + 116, 258, 56, 70, t, trim, gl.id);
        // bay window
        s += '<polygon points="' + (x + 18) + ',372 ' + (x + 110) + ',372 ' + (x + 104) + ',452 ' + (x + 24) + ',452" fill="' + mix(wall, '#000', .12) + '"/>';
        s += windowPane(x + 30, 382, 68, 58, t, trim, gl.id);
        s += '<rect x="' + (x + 128) + '" y="378" width="46" height="92" rx="23" fill="' + mix(['#2f4a3d', '#7a2e2e', '#1f2f45'][i], NIGHT, t.dim * .5) + '"/>';
        s += '<rect x="' + (x + 120) + '" y="462" width="62" height="10" fill="' + mix('#cfc7b9', NIGHT, t.dim) + '"/>';
      }
      s += tree(70, 430, .9, t, r) + tree(840, 425, 1, t, r);
      s += '<rect x="112" y="380" width="6" height="100" fill="' + mix('#2b2f33', NIGHT, t.dim) + '"/><circle cx="115" cy="374" r="10" fill="' + (t.lit ? '#ffdf9a' : '#e8e3d6') + '"/>';
      if (t.lit) s += '<circle cx="115" cy="374" r="40" fill="#ffd58a" opacity=".18"/>';
      return s;
    },
    cottage: function (o, t, r) {
      var wall = mix(o.wall, NIGHT, t.dim), trim = mix(o.trim, NIGHT, t.dim * .6), roof = mix('#5b4a42', NIGHT, t.dim);
      var shutter = mix(o.accent, NIGHT, t.dim), gl = glowDef(t), s = gl.def + hills(t);
      s += '<rect x="0" y="470" width="900" height="130" fill="' + t.ground + '"/>';
      s += tree(110, 430, 1.2, t, r) + tree(800, 440, 1.05, t, r);
      s += '<rect x="560" y="140" width="40" height="110" fill="' + mix('#9a5b45', NIGHT, t.dim) + '"/>';
      s += '<rect x="240" y="290" width="420" height="180" fill="' + wall + '"/>';
      s += '<polygon points="210,300 450,150 690,300" fill="' + roof + '"/>';
      s += '<polygon points="235,300 450,166 665,300" fill="none" stroke="' + mix(roof, '#000', .2) + '" stroke-width="3"/>';
      s += windowPane(410, 210, 80, 60, t, trim, gl.id);
      [[270, 330], [550, 330]].forEach(function (p) {
        s += '<rect x="' + (p[0] - 18) + '" y="' + (p[1] - 4) + '" width="16" height="88" fill="' + shutter + '"/><rect x="' + (p[0] + 82) + '" y="' + (p[1] - 4) + '" width="16" height="88" fill="' + shutter + '"/>';
        s += windowPane(p[0], p[1], 80, 80, t, trim, gl.id) + '<path d="M' + (p[0] + 40) + ' ' + p[1] + 'v80M' + p[0] + ' ' + (p[1] + 40) + 'h80" stroke="' + trim + '" stroke-width="3"/>';
      });
      // porch
      s += '<polygon points="380,330 450,300 520,330" fill="' + roof + '"/>';
      s += '<rect x="420" y="360" width="60" height="110" rx="4" fill="' + mix('#3e5a48', NIGHT, t.dim * .5) + '"/><circle cx="470" cy="418" r="4" fill="#d9b56a"/>';
      s += '<rect x="384" y="330" width="8" height="140" fill="' + wall + '"/><rect x="508" y="330" width="8" height="140" fill="' + wall + '"/>';
      // fence + flowers
      for (var i = 0; i < 30; i++) {
        var fx = 20 + i * 30;
        if (fx > 400 && fx < 500) continue;
        s += '<path d="M' + fx + ' 520 V488 l6 -8 l6 8 V520Z" fill="' + mix('#faf6ee', NIGHT, t.dim) + '"/>';
      }
      s += '<rect x="0" y="500" width="410" height="6" fill="' + mix('#faf6ee', NIGHT, t.dim) + '"/><rect x="490" y="500" width="410" height="6" fill="' + mix('#faf6ee', NIGHT, t.dim) + '"/>';
      for (var j = 0; j < 40; j++) {
        s += '<circle cx="' + Math.round(250 + r() * 410) + '" cy="' + Math.round(468 + r() * 10) + '" r="' + (3 + r() * 3).toFixed(1) + '" fill="' + mix(['#d4627a', '#f2c14e', '#e88f6b', '#f7f0f0'][j % 4], NIGHT, t.dim) + '"/>';
      }
      s += '<polygon points="430,470 470,470 520,600 380,600" fill="' + mix('#d8cbb2', NIGHT, t.dim) + '"/>';
      return s;
    },
    apartment: function (o, t, r) {
      var wall = mix(o.wall, NIGHT, t.dim), trim = mix(o.trim, NIGHT, t.dim * .4), gl = glowDef(t), s = gl.def;
      s += '<rect x="40" y="250" width="180" height="300" fill="' + mix('#8c929b', NIGHT, t.dim + .1) + '"/><rect x="690" y="210" width="190" height="340" fill="' + mix('#7d848e', NIGHT, t.dim + .1) + '"/>';
      for (var a = 0; a < 6; a++) for (var b = 0; b < 3; b++) {
        s += '<rect x="' + (60 + b * 52) + '" y="' + (275 + a * 44) + '" width="30" height="24" fill="' + (t.lit && r() > .45 ? '#ffd27c' : mix('#a7b6c2', NIGHT, t.dim)) + '"/>';
        s += '<rect x="' + (710 + b * 56) + '" y="' + (235 + a * 48) + '" width="34" height="26" fill="' + (t.lit && r() > .5 ? '#ffd27c' : mix('#a7b6c2', NIGHT, t.dim)) + '"/>';
      }
      s += '<rect x="270" y="70" width="380" height="480" fill="' + wall + '"/>';
      s += '<rect x="262" y="60" width="396" height="16" fill="' + trim + '"/>';
      for (var row = 0; row < 9; row++) {
        var y = 92 + row * 48;
        for (var c = 0; c < 4; c++) {
          var x = 290 + c * 90, on = t.lit ? r() > .35 : false;
          s += '<rect x="' + x + '" y="' + y + '" width="70" height="34" fill="' + (on ? 'url(#' + gl.id + ')' : t.glass) + '" stroke="' + trim + '" stroke-width="3"/>';
          if (!t.lit) s += '<path d="M' + (x + 10) + ' ' + (y + 34) + 'l22 -34h10l-22 34z" fill="#fff" opacity=".25"/>';
        }
        s += '<rect x="282" y="' + (y + 36) + '" width="356" height="5" fill="' + trim + '"/>';
        s += '<path d="M282 ' + (y + 36) + 'v-10h356v10" fill="none" stroke="' + trim + '" stroke-width="2" opacity=".7"/>';
      }
      s += '<rect x="0" y="520" width="900" height="80" fill="' + mix('#b5ada0', NIGHT, t.dim) + '"/>';
      s += '<rect x="410" y="470" width="100" height="80" fill="' + (t.lit ? '#ffd994' : mix('#2f3633', NIGHT, t.dim)) + '"/>';
      s += tree(230, 500, .7, t, r) + tree(680, 505, .75, t, r);
      return s;
    },
    coastal: function (o, t, r) {
      var wall = mix(o.wall, NIGHT, t.dim), trim = mix(o.trim, NIGHT, t.dim * .5), gl = glowDef(t), s = gl.def;
      s += '<rect x="0" y="360" width="900" height="80" fill="' + mix('#5f9fbe', NIGHT, t.dim) + '"/>';
      s += '<path d="M0 380h900M0 400h900M0 420h900" stroke="#fff" stroke-width="2" opacity=".25" stroke-dasharray="40 30"/>';
      s += '<path d="M0 430 C200 410 330 445 520 425 S780 410 900 430 V600 H0Z" fill="' + mix('#e7d4ad', NIGHT, t.dim) + '"/>';
      s += '<path d="M0 470 C180 455 300 480 470 466 S760 450 900 470 V600 H0Z" fill="' + mix('#dcc596', NIGHT, t.dim) + '"/>';
      // stilts + deck
      for (var i = 0; i < 6; i++) s += '<rect x="' + (250 + i * 80) + '" y="350" width="12" height="130" fill="' + mix('#8a6b4e', NIGHT, t.dim) + '"/>';
      s += '<rect x="230" y="342" width="460" height="14" fill="' + mix('#a8835e', NIGHT, t.dim) + '"/>';
      s += '<rect x="270" y="210" width="380" height="132" fill="' + wall + '"/>';
      for (var k = 0; k < 9; k++) s += '<path d="M270 ' + (222 + k * 14) + 'h380" stroke="' + mix(wall, '#000', .1) + '" stroke-width="2"/>';
      s += '<polygon points="250,214 460,140 670,214" fill="' + mix('#5c6f7a', NIGHT, t.dim * .7) + '"/>';
      s += windowPane(300, 236, 150, 84, t, trim, gl.id) + windowPane(470, 236, 70, 84, t, trim, gl.id) + windowPane(560, 236, 64, 84, t, trim, gl.id);
      s += '<path d="M375 236v84" stroke="' + trim + '" stroke-width="4"/>';
      s += '<path d="M230 342v-34h460v34M260 308v34M300 308v34M340 308v34M380 308v34M420 308v34M460 308v34M500 308v34M540 308v34M580 308v34M620 308v34M660 308v34" stroke="' + mix('#f4efe6', NIGHT, t.dim) + '" stroke-width="4" fill="none"/>';
      s += '<path d="M690 356 L780 470" stroke="' + mix('#a8835e', NIGHT, t.dim) + '" stroke-width="14"/>';
      for (var g = 0; g < 26; g++) {
        var gx = Math.round(r() * 900), gy = Math.round(470 + r() * 110);
        s += '<path d="M' + gx + ' ' + gy + 'l-6 -22M' + gx + ' ' + gy + 'l2 -26M' + gx + ' ' + gy + 'l9 -20" stroke="' + mix('#8a9a5b', NIGHT, t.dim) + '" stroke-width="2.5" stroke-linecap="round"/>';
      }
      return s;
    }
  };

  function exterior(p, time) {
    var t = TIMES[time || p.look.time], r = rng(p.id * 7 + (time ? 3 : 0));
    return svgOpen(p.title + ', exterior') + sky(t, r) + EXTERIORS[p.look.kind](p.look, t, r) + '</svg>';
  }

  // Interiors share a room shell: wall, floor, window with the time-of-day sky.
  function roomShell(p, t, r) {
    var wall = p.look.room, floor = '#c7a37a', s = '';
    var skyId = uid('isky');
    s += '<defs><linearGradient id="' + skyId + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + t.sky[0] + '"/><stop offset="1" stop-color="' + t.sky[1] + '"/></linearGradient></defs>';
    s += '<rect width="900" height="600" fill="' + wall + '"/>';
    s += '<rect y="430" width="900" height="170" fill="' + floor + '"/>';
    for (var i = 0; i < 8; i++) s += '<path d="M0 ' + (450 + i * 22) + 'h900" stroke="#b08c64" stroke-width="2" opacity=".45"/>';
    s += '<rect x="0" y="424" width="900" height="8" fill="' + mix(wall, '#000', .12) + '"/>';
    return { s: s, skyId: skyId };
  }
  function viewWindow(x, y, w, h, t, skyId) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="url(#' + skyId + ')"/>' +
      '<path d="M' + x + ' ' + (y + h * .72) + ' C' + (x + w * .3) + ' ' + (y + h * .6) + ' ' + (x + w * .6) + ' ' + (y + h * .7) + ' ' + (x + w) + ' ' + (y + h * .62) + ' V' + (y + h) + ' H' + x + 'Z" fill="' + t.far + '"/>' +
      '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="none" stroke="#f7f4ee" stroke-width="10"/>' +
      '<path d="M' + (x + w / 2) + ' ' + y + 'v' + h + '" stroke="#f7f4ee" stroke-width="6"/>';
  }
  var INTERIORS = {
    living: function (p, t, r) {
      var sh = roomShell(p, t, r), a = p.look.accent, s = sh.s;
      s += viewWindow(540, 80, 290, 300, t, sh.skyId);
      s += '<rect x="150" y="120" width="190" height="130" fill="#fff" stroke="' + mix(a, '#000', .3) + '" stroke-width="6"/><circle cx="215" cy="185" r="38" fill="' + mix(a, '#fff', .3) + '"/><rect x="250" y="150" width="60" height="70" fill="' + p.look.trim + '" opacity=".7"/>';
      s += '<ellipse cx="320" cy="520" rx="300" ry="46" fill="' + mix(p.look.room, a, .35) + '"/>';
      s += '<rect x="90" y="320" width="400" height="110" rx="26" fill="' + a + '"/><rect x="110" y="280" width="360" height="70" rx="22" fill="' + mix(a, '#fff', .12) + '"/>';
      s += '<rect x="70" y="330" width="50" height="100" rx="22" fill="' + mix(a, '#000', .1) + '"/><rect x="460" y="330" width="50" height="100" rx="22" fill="' + mix(a, '#000', .1) + '"/>';
      s += '<rect x="140" y="300" width="80" height="54" rx="14" fill="#f3ead9"/><rect x="360" y="300" width="80" height="54" rx="14" fill="' + mix(a, '#fff', .5) + '"/>';
      s += '<rect x="210" y="470" width="220" height="16" rx="8" fill="#6b4f3a"/><rect x="230" y="486" width="10" height="40" fill="#6b4f3a"/><rect x="400" y="486" width="10" height="40" fill="#6b4f3a"/>';
      s += '<circle cx="290" cy="462" r="12" fill="#e9d8b8"/>';
      s += '<path d="M600 430 V250 Q600 200 650 200" stroke="#2f3633" stroke-width="5" fill="none"/><path d="M630 200 h50 l-12 30 h-26z" fill="#2f3633"/>';
      if (t.lit) s += '<ellipse cx="655" cy="250" rx="70" ry="50" fill="#ffd58a" opacity=".35"/>';
      s += '<path d="M780 430 l-14 -70 h52 l-14 70z" fill="#c9b79c"/>';
      for (var i = 0; i < 7; i++) s += '<ellipse cx="' + (792 + Math.cos(i) * 34) + '" cy="' + (330 - i * 10) + '" rx="30" ry="12" transform="rotate(' + (-60 + i * 22) + ' ' + (792 + Math.cos(i) * 34) + ' ' + (330 - i * 10) + ')" fill="' + (i % 2 ? '#5f7d55' : '#7c9a68') + '"/>';
      return s;
    },
    kitchen: function (p, t, r) {
      var sh = roomShell(p, t, r), a = p.look.accent, s = sh.s;
      s += '<rect x="40" y="250" width="820" height="90" fill="#fbfaf7"/>';
      for (var i = 0; i < 40; i++) s += '<path d="M' + (40 + i * 20.5) + ' 250v90" stroke="#e6e1d8" stroke-width="2"/>';
      for (var j = 0; j < 4; j++) s += '<path d="M40 ' + (272 + j * 22) + 'h820" stroke="#e6e1d8" stroke-width="2"/>';
      s += '<rect x="40" y="100" width="420" height="130" fill="' + a + '"/><path d="M145 100v130M250 100v130M355 100v130" stroke="' + mix(a, '#000', .2) + '" stroke-width="3"/>';
      s += viewWindow(560, 90, 230, 150, t, sh.skyId);
      s += '<rect x="40" y="340" width="820" height="90" fill="' + mix(a, '#000', .08) + '"/><rect x="30" y="334" width="840" height="12" fill="#e9e4dc"/>';
      for (var k = 0; k < 8; k++) s += '<rect x="' + (110 + k * 100) + '" y="370" width="30" height="4" rx="2" fill="#c9a86a"/>';
      s += '<rect x="230" y="420" width="460" height="110" fill="' + mix(a, '#fff', .15) + '"/><rect x="215" y="410" width="490" height="16" fill="#f1ede6"/>';
      [290, 400, 510, 620].forEach(function (x) { s += '<rect x="' + (x - 22) + '" y="452" width="44" height="12" rx="6" fill="#6b4f3a"/><path d="M' + (x - 14) + ' 464 l-6 70M' + (x + 14) + ' 464 l6 70" stroke="#6b4f3a" stroke-width="5"/>'; });
      [330, 460, 590].forEach(function (x) { s += '<path d="M' + x + ' 0v170" stroke="#2f3633" stroke-width="3"/><path d="M' + (x - 26) + ' 196 a26 26 0 0 1 52 0z" fill="#c9a86a"/>' + (t.lit ? '<ellipse cx="' + x + '" cy="214" rx="48" ry="26" fill="#ffd58a" opacity=".35"/>' : ''); });
      s += '<ellipse cx="400" cy="404" rx="44" ry="10" fill="#e8e1d4"/><circle cx="388" cy="394" r="11" fill="#f2c94c"/><circle cx="408" cy="392" r="11" fill="#f2c94c"/><circle cx="398" cy="384" r="10" fill="#9bbf5a"/>';
      return s;
    },
    bedroom: function (p, t, r) {
      var sh = roomShell(p, t, r), a = p.look.accent, s = sh.s;
      s += viewWindow(80, 90, 190, 260, t, sh.skyId);
      s += '<path d="M60 70 q30 160 0 330 h40 q-20 -165 0 -330z" fill="' + mix(a, '#fff', .55) + '"/><path d="M290 70 q-30 160 0 330 h-40 q20 -165 0 -330z" fill="' + mix(a, '#fff', .55) + '"/>';
      s += '<rect x="420" y="140" width="190" height="120" fill="#fff" stroke="#c9b79c" stroke-width="6"/><path d="M440 230 C480 170 520 220 590 170" stroke="' + a + '" stroke-width="6" fill="none"/>';
      s += '<rect x="360" y="270" width="320" height="140" rx="16" fill="' + mix(a, '#000', .15) + '"/>';
      s += '<rect x="330" y="380" width="380" height="110" rx="10" fill="#faf8f3"/><rect x="330" y="420" width="380" height="72" rx="8" fill="' + a + '"/>';
      s += '<rect x="370" y="350" width="130" height="54" rx="16" fill="#fff"/><rect x="540" y="350" width="130" height="54" rx="16" fill="#fff"/>';
      [290, 750].forEach(function (x) {
        s += '<rect x="' + (x - 40) + '" y="390" width="80" height="80" rx="6" fill="#8a6b4e"/><rect x="' + (x - 4) + '" y="330" width="8" height="60" fill="#2f3633"/><path d="M' + (x - 30) + ' 336 h60 l-10 -40 h-40z" fill="#efe3c9"/>';
        if (t.lit) s += '<ellipse cx="' + x + '" cy="330" rx="60" ry="44" fill="#ffd58a" opacity=".35"/>';
      });
      s += '<ellipse cx="520" cy="540" rx="320" ry="40" fill="' + mix(p.look.room, '#8a6b4e', .25) + '"/>';
      return s;
    }
  };
  function interior(p, kind) {
    var t = TIMES[p.look.time], r = rng(p.id * 13);
    return svgOpen(p.title + ', ' + kind) + INTERIORS[kind](p, t, r) + '</svg>';
  }

  // Five views per property, used by the gallery and lightbox.
  function gallery(p) {
    var alt = { day: 'golden', golden: 'dusk', dusk: 'night', night: 'dusk' }[p.look.time];
    return [
      { label: 'Exterior', html: function () { return exterior(p); } },
      { label: 'Living room', html: function () { return interior(p, 'living'); } },
      { label: 'Kitchen', html: function () { return interior(p, 'kitchen'); } },
      { label: 'Primary bedroom', html: function () { return interior(p, 'bedroom'); } },
      { label: 'Exterior at ' + (alt === 'night' ? 'night' : alt), html: function () { return exterior(p, alt); } }
    ];
  }

  // A simple, readable floor plan scaled to the number of bedrooms.
  function floorPlan(p) {
    var beds = p.beds, W = 760, H = 460, s = '<svg class="art" viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Floor plan with ' + beds + ' bedrooms">';
    s += '<rect width="800" height="500" fill="#fffdf9"/>';
    var x0 = 20, y0 = 20, splitX = x0 + W * 0.52;
    s += '<g fill="none" stroke="#1b2420" stroke-width="2">';
    s += '<rect x="' + x0 + '" y="' + y0 + '" width="' + W + '" height="' + H + '" stroke-width="8"/>';
    s += '<path d="M' + splitX + ' ' + y0 + 'v' + H + '"/>';
    s += '<path d="M' + x0 + ' ' + (y0 + H * .58) + 'h' + (splitX - x0) + '"/>';
    var rows = beds + 1, rh = H / rows;
    for (var i = 1; i < rows; i++) s += '<path d="M' + splitX + ' ' + (y0 + rh * i) + 'h' + (x0 + W - splitX) + '"/>';
    s += '</g>';
    // door swings
    s += '<g fill="none" stroke="#a7834b" stroke-width="2">';
    for (var d = 0; d < rows; d++) s += '<path d="M' + splitX + ' ' + (y0 + rh * d + 14) + ' a34 34 0 0 1 34 34"/>';
    s += '</g>';
    s += '<g font-family="DM Sans, system-ui, sans-serif" font-size="17" fill="#1b2420" text-anchor="middle">';
    s += '<text x="' + ((x0 + splitX) / 2) + '" y="' + (y0 + H * .29) + '" font-weight="700">Living / Dining</text><text x="' + ((x0 + splitX) / 2) + '" y="' + (y0 + H * .29 + 22) + '" font-size="14" fill="#66706a">' + Math.round(p.sqft * .3) + ' sq ft</text>';
    s += '<text x="' + ((x0 + splitX) / 2) + '" y="' + (y0 + H * .8) + '" font-weight="700">Kitchen</text>';
    for (var b = 0; b < beds; b++) s += '<text x="' + ((splitX + x0 + W) / 2) + '" y="' + (y0 + rh * b + rh / 2 + 6) + '" font-weight="700">' + (b === 0 ? 'Primary bedroom' : 'Bedroom ' + (b + 1)) + '</text>';
    s += '<text x="' + ((splitX + x0 + W) / 2) + '" y="' + (y0 + rh * beds + rh / 2 + 6) + '" font-weight="700">Bath' + (p.baths > 1 ? 's (' + p.baths + ')' : '') + '</text>';
    s += '</g></svg>';
    return s;
  }

  /* ======================================================================
   * 3. SHARED UI
   * ==================================================================== */

  var $ = function (sel, el) { return (el || document).querySelector(sel); };
  var $$ = function (sel, el) { return Array.prototype.slice.call((el || document).querySelectorAll(sel)); };
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function money(n) { return '$' + Math.round(n).toLocaleString('en-US'); }
  function priceLabel(p) { return money(p.price) + (p.status === 'rent' ? '<span class="text-base font-sans text-muted"> /mo</span>' : ''); }
  function byId(id) { return PROPERTIES.filter(function (p) { return p.id === id; })[0]; }
  function agentById(id) { return AGENTS.filter(function (a) { return a.id === id; })[0]; }
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Saved homes (favourites) live in localStorage.
  var SAVED_KEY = 'estate-saved';
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

  // Returns a clean list of known property ids, repairing corrupt or tampered storage.
  function getSaved() {
    var raw = null, stored = null;
    try { raw = safeStorage.getItem(SAVED_KEY); stored = JSON.parse(raw); } catch (e) {}
    var list = (Array.isArray(stored) ? stored : []).filter(function (id, i, all) {
      return typeof id === 'number' && PROPERTIES.some(function (p) { return p.id === id; }) && all.indexOf(id) === i;
    });
    if (raw !== null && raw !== JSON.stringify(list)) {
      try { safeStorage.setItem(SAVED_KEY, JSON.stringify(list)); } catch (e) {}
    }
    return list;
  }
  function setSaved(list) { try { safeStorage.setItem(SAVED_KEY, JSON.stringify(list)); } catch (e) {} updateSavedCount(); }
  function isSaved(id) { return getSaved().indexOf(id) !== -1; }
  function toggleSaved(id) {
    var list = getSaved(), i = list.indexOf(id);
    if (i === -1) list.push(id); else list.splice(i, 1);
    setSaved(list);
    return i === -1;
  }
  function updateSavedCount() {
    var n = getSaved().length;
    $$('[data-saved-count]').forEach(function (el) { el.textContent = n; el.hidden = n === 0; });
  }
  window.addEventListener('storage', function (e) { if (e.key === SAVED_KEY) { updateSavedCount(); syncHearts(); } });

  var HEART = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 20s-7-4.4-9.2-8.6C1.2 8.3 3 4.8 6.4 4.5c2-.2 3.6.9 4.6 2.4 1-1.5 2.6-2.6 4.6-2.4 3.4.3 5.2 3.8 3.6 6.9C19 15.6 12 20 12 20Z" fill="none"/></svg>';
  function heartButton(p, extra) {
    var on = isSaved(p.id);
    return '<button type="button" class="heart ' + (extra || '') + '" data-heart="' + p.id + '" aria-pressed="' + on + '" aria-label="' + (on ? 'Remove ' : 'Save ') + esc(p.title) + (on ? ' from saved homes' : ' to saved homes') + '">' + HEART + '</button>';
  }
  function syncHearts() {
    $$('[data-heart]').forEach(function (b) {
      var p = byId(+b.dataset.heart), on = isSaved(p.id);
      b.setAttribute('aria-pressed', String(on));
      b.setAttribute('aria-label', (on ? 'Remove ' : 'Save ') + p.title + (on ? ' from saved homes' : ' to saved homes'));
    });
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-heart]');
    if (!b) return;
    e.preventDefault();
    var added = toggleSaved(+b.dataset.heart);
    syncHearts();
    toast(added ? 'Saved to your homes' : 'Removed from saved homes');
    document.dispatchEvent(new CustomEvent('saved-change'));
  });

  // Toast
  var toastEl, toastTimer;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      toastEl.setAttribute('role', 'status');
      toastEl.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-visible'); }, 2400);
  }

  // Header shadow on scroll
  var header = $('.site-header');
  function onScroll() { if (header) header.classList.toggle('is-scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu
  var menuBtn = $('[data-menu-toggle]'), menu = $('#mobile-menu');
  function setMenu(open) {
    if (!menu) return;
    menu.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    $('[data-icon-open]', menuBtn).classList.toggle('hidden', open);
    $('[data-icon-close]', menuBtn).classList.toggle('hidden', !open);
  }
  if (menuBtn) {
    menuBtn.addEventListener('click', function () { setMenu(menu.hidden); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !menu.hidden) { setMenu(false); menuBtn.focus(); }
    });
    window.matchMedia('(min-width: 1024px)').addEventListener('change', function () { setMenu(false); });
  }

  // Static artwork placeholders: <div data-art="exterior" data-id="3" data-time="dusk">
  function hydrateArt(scope) {
    $$('[data-art]', scope).forEach(function (el) {
      var p = byId(+el.dataset.id) || PROPERTIES[0], kind = el.dataset.art;
      el.innerHTML = kind === 'exterior' ? exterior(p, el.dataset.time) : interior(p, kind);
      if (el.dataset.decorative !== undefined) $('svg', el).setAttribute('aria-hidden', 'true');
    });
  }

  // Scroll reveal. When one element reveals, everything above it reveals too,
  // so jumping down the page never leaves hidden content behind.
  var io = null;
  function revealUpTo(target) {
    var top = target.getBoundingClientRect().top;
    $$('.reveal:not(.is-in)').forEach(function (el) {
      if (el.getBoundingClientRect().top <= top + 1) { el.classList.add('is-in'); if (io) io.unobserve(el); }
    });
  }
  if (!reduceMotion && 'IntersectionObserver' in window) {
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) revealUpTo(en.target); });
    }, { rootMargin: '0px 0px -6% 0px' });
  }
  function observeReveals(scope) {
    $$('.reveal:not(.is-in)', scope).forEach(function (el) {
      if (io) io.observe(el); else el.classList.add('is-in');
    });
  }

  // Forms: inline validation and a success state.
  // To receive submissions, set the form's action to your form service (e.g. Formspree)
  // and replace the success block in the submit handler with:
  //   fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
  function validateField(field) {
    var msg = '', v = field.validity;
    if (v.valueMissing) msg = field.type === 'checkbox' ? 'Please check this box to continue.' : 'Please fill in this field.';
    else if (v.typeMismatch && field.type === 'email') msg = 'Please enter a valid email address, like name@example.com.';
    else if (v.patternMismatch) msg = field.dataset.patternMessage || 'Please check the format.';
    else if (v.tooShort) msg = 'Please write at least ' + field.minLength + ' characters.';
    else if (v.rangeUnderflow) msg = field.type === 'date' ? 'Please choose a date from tomorrow onwards.' : 'Please enter ' + field.min + ' or more.';
    else if (v.rangeOverflow) msg = 'Please enter ' + field.max + ' or less.';
    var wrap = field.closest('[data-field]') || field.parentNode;
    var err = $('.field-error', wrap);
    if (msg) {
      if (!err) {
        err = document.createElement('p');
        err.className = 'field-error';
        err.id = (field.id || field.name) + '-error';
        wrap.appendChild(err);
      }
      err.textContent = msg;
      field.setAttribute('aria-invalid', 'true');
      field.setAttribute('aria-describedby', err.id);
    } else {
      if (err) err.remove();
      field.removeAttribute('aria-invalid');
      field.removeAttribute('aria-describedby');
    }
    return !msg;
  }
  // Pressing a submit button takes focus from the field before the click lands. Checking the
  // field on that blur could add an error above the button and move it from under the pointer,
  // losing the click, so the submit handler (which checks every field) does it instead.
  var pressedSubmit = null;
  document.addEventListener('pointerdown', function (e) { pressedSubmit = e.target.closest ? e.target.closest('[type="submit"]') : null; }, true);
  document.addEventListener('click', function () { pressedSubmit = null; }, true);
  $$('form[data-validate]').forEach(function (form) {
    var fields = function () { return $$('input, select, textarea', form).filter(function (f) { return f.willValidate; }); };
    fields().forEach(function (f) {
      f.addEventListener('blur', function () {
        if (pressedSubmit && pressedSubmit.form === form) return;
        if (f.value || f.getAttribute('aria-invalid')) validateField(f);
      });
      f.addEventListener('input', function () { if (f.getAttribute('aria-invalid')) validateField(f); });
      f.addEventListener('change', function () { if (f.getAttribute('aria-invalid')) validateField(f); });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = fields().map(validateField).every(Boolean);
      if (!ok) { var first = $('[aria-invalid="true"]', form); if (first) first.focus(); return; }
      var success = $('[data-success]', form);
      var body = $('[data-form-body]', form);
      if (body) body.hidden = true;
      // A short reference, like HH-7K2Q (no 0/O or 1/I to misread over the phone).
      var refEl = success && $('[data-ref]', success);
      if (refEl) {
        var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', ref = 'HH-';
        for (var i = 0; i < 4; i++) ref += chars.charAt(Math.floor(Math.random() * chars.length));
        refEl.textContent = ref;
      }
      if (success) { success.hidden = false; success.focus(); }
      form.reset();
    });
    $$('[data-form-reset]', form).forEach(function (b) {
      b.addEventListener('click', function () {
        var body = $('[data-form-body]', form);
        if (body) body.hidden = false;
        $('[data-success]', form).hidden = true;
        // The first field you can fill in (fields() leaves out the viewing form's hidden property reference).
        var first = fields()[0];
        if (first) first.focus();
      });
    });
  });

  // Dates in forms can't be in the past: the earliest choice is tomorrow on the
  // visitor's device (local date, not the UTC date from toISOString()).
  $$('input[type="date"][data-future]').forEach(function (el) {
    var d = new Date(); d.setDate(d.getDate() + 1);
    el.min = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  });

  // Footer year
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------------------------------------------------------------------
   * Property cards (grid and list layouts)
   * ------------------------------------------------------------------- */
  var ICON_BED = '<svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M3 18V7M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5"/><circle cx="7" cy="11" r="1.6"/></svg>';
  var ICON_BATH = '<svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3ZM6 12V6a2 2 0 0 1 3.5-1.3M7 19l-1 2M17 19l1 2"/></svg>';
  var ICON_AREA = '<svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>';

  function facts(p) {
    return '<ul class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">' +
      '<li class="flex items-center gap-1.5">' + ICON_BED + '<span>' + p.beds + ' bd</span></li>' +
      '<li class="flex items-center gap-1.5">' + ICON_BATH + '<span>' + p.baths + ' ba</span></li>' +
      '<li class="flex items-center gap-1.5">' + ICON_AREA + '<span>' + p.sqft.toLocaleString('en-US') + ' sq ft</span></li></ul>';
  }
  function badges(p) {
    var list = [p.status === 'rent' ? 'For rent' : 'For sale'].concat(p.badges);
    return '<div class="absolute top-3 left-3 flex flex-wrap gap-1.5">' + list.map(function (b, i) {
      return '<span class="badge' + (i === 0 ? ' bg-forest! text-white!' : '') + '">' + esc(b) + '</span>';
    }).join('') + '</div>';
  }
  function card(p, view) {
    var href = 'property.html?id=' + p.id;
    if (view === 'list') {
      return '<article class="reveal group card flex flex-col overflow-hidden sm:flex-row">' +
        '<a href="' + href + '" class="media block aspect-[4/3] sm:aspect-auto sm:w-80 sm:shrink-0" tabindex="-1" aria-hidden="true">' + exterior(p).replace('role="img"', 'aria-hidden="true" data-r') + badges(p) + '</a>' +
        '<div class="relative flex min-w-0 flex-1 flex-col gap-2 p-6">' +
          '<div class="absolute top-4 right-4">' + heartButton(p, 'border border-line') + '</div>' +
          '<p class="h-display text-2xl text-forest">' + priceLabel(p) + '</p>' +
          '<h3 class="pr-12 text-lg font-semibold"><a class="hover:text-brass-600" href="' + href + '">' + esc(p.title) + '</a></h3>' +
          '<p class="text-sm text-muted">' + esc(p.address) + ', ' + esc(p.area) + '</p>' +
          '<p class="mt-1 line-clamp-2 text-sm text-muted">' + esc(p.summary) + '</p>' +
          '<div class="mt-auto border-t border-line pt-3">' + facts(p) + '</div>' +
        '</div></article>';
    }
    return '<article class="reveal group card flex flex-col overflow-hidden">' +
      '<div class="relative">' +
        '<a href="' + href + '" class="media block aspect-[4/3]" tabindex="-1" aria-hidden="true">' + exterior(p).replace('role="img"', 'aria-hidden="true" data-r') + '</a>' +
        badges(p) + '<div class="absolute top-3 right-3">' + heartButton(p) + '</div>' +
      '</div>' +
      '<div class="flex flex-1 flex-col gap-1.5 p-5">' +
        '<p class="h-display text-2xl text-forest">' + priceLabel(p) + '</p>' +
        '<h3 class="text-base font-semibold"><a class="hover:text-brass-600" href="' + href + '">' + esc(p.title) + '</a></h3>' +
        '<p class="text-sm text-muted">' + esc(p.address) + ', ' + esc(p.area) + '</p>' +
        '<div class="mt-auto border-t border-line pt-3">' + facts(p) + '</div>' +
      '</div></article>';
  }

  /* ======================================================================
   * 4. PAGES
   * ==================================================================== */

  hydrateArt(document);

  // Home: featured listings
  var featured = $('[data-featured]');
  if (featured) {
    featured.innerHTML = [1, 3, 12, 4, 5, 6].map(function (id) { return card(byId(id), 'grid'); }).join('');
  }

  /* ---------------- Listings ---------------- */
  var results = $('[data-results]');
  if (results) {
    var form = $('[data-filters]');
    var params = new URLSearchParams(location.search);
    var PRICE_OPTIONS = {
      buy: [['', 'Any price'], ['600000', 'Up to $600k'], ['900000', 'Up to $900k'], ['1250000', 'Up to $1.25M'], ['2000000', 'Up to $2M']],
      rent: [['', 'Any rent'], ['2000', 'Up to $2,000/mo'], ['3000', 'Up to $3,000/mo'], ['4500', 'Up to $4,500/mo']]
    };
    // A URL value that isn't one of the select's options is ignored, so the control
    // and the results always agree (e.g. ?type=banana or a misspelt location).
    function option(sel, value, fallback) {
      return value !== null && sel && Array.prototype.some.call(sel.options, function (o) { return o.value === value; }) ? value : fallback;
    }
    var agentParam = params.get('agent') || '';
    var state = {
      status: params.get('status') === 'rent' ? 'rent' : (params.get('status') === 'all' ? 'all' : 'buy'),
      location: option(form.elements.location, params.get('location'), ''),
      type: option(form.elements.type, params.get('type'), ''),
      max: params.get('max') || '',
      beds: option(form.elements.beds, params.get('beds'), ''),
      baths: option(form.elements.baths, params.get('baths'), ''),
      saved: params.get('saved') === '1',
      agent: agentById(+agentParam) ? agentParam : '',
      sort: option($('[name="sort"]'), params.get('sort'), 'newest'),
      view: 'grid'
    };
    try { state.view = safeStorage.getItem('estate-view') === 'list' ? 'list' : 'grid'; } catch (e) {}
    if (state.saved) state.status = 'all';

    function fillPriceOptions() {
      var sel = form.elements.max;
      var opts = PRICE_OPTIONS[state.status === 'rent' ? 'rent' : 'buy'];
      sel.innerHTML = opts.map(function (o) { return '<option value="' + o[0] + '">' + o[1] + '</option>'; }).join('');
      if (!opts.some(function (o) { return o[0] === state.max; })) state.max = '';
      sel.value = state.max;
      sel.disabled = state.status === 'all';
    }
    function syncControls() {
      $$('[data-status]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.status === state.status)); });
      ['location', 'type', 'beds', 'baths', 'sort'].forEach(function (k) { if (form.elements[k]) form.elements[k].value = state[k]; });
      $('[name="sort"]').value = state.sort;
      form.elements.saved.checked = state.saved;
      fillPriceOptions();
      $$('[data-view]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.view === state.view)); });
      // Header nav: highlight Buy or Rent
      $$('[data-nav-status]').forEach(function (a) {
        if (a.dataset.navStatus === state.status && !state.saved) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
      });
    }
    function filtered() {
      var saved = getSaved();
      var list = PROPERTIES.filter(function (p) {
        if (state.status !== 'all' && p.status !== state.status) return false;
        if (state.location && p.area !== state.location) return false;
        if (state.type && p.type !== state.type) return false;
        if (state.max && state.status !== 'all' && p.price > +state.max) return false;
        if (state.beds && p.beds < +state.beds) return false;
        if (state.baths && p.baths < +state.baths) return false;
        if (state.saved && saved.indexOf(p.id) === -1) return false;
        if (state.agent && p.agent !== +state.agent) return false;
        return true;
      });
      var sorters = {
        newest: function (a, b) { return a.listed - b.listed; },
        'price-asc': function (a, b) { return a.price - b.price; },
        'price-desc': function (a, b) { return b.price - a.price; },
        size: function (a, b) { return b.sqft - a.sqft; }
      };
      return list.sort(sorters[state.sort] || sorters.newest);
    }
    function render() {
      var list = filtered();
      // Toggle only the layout classes, keeping the container's own (mt-8).
      results.classList.add('grid', 'gap-6');
      results.classList.toggle('sm:grid-cols-2', state.view !== 'list');
      results.classList.toggle('xl:grid-cols-3', state.view !== 'list');
      results.innerHTML = list.map(function (p) { return card(p, state.view); }).join('');
      $('[data-empty]').hidden = list.length > 0;
      var plural = list.length === 1 ? '' : 's';
      var noun = state.saved ? 'saved home' + plural : state.status === 'rent' ? 'rental' + plural : state.status === 'all' ? 'home' + plural : 'home' + plural + ' for sale';
      $('[data-count]').textContent = list.length + ' ' + noun;
      var ag = state.agent && agentById(+state.agent);
      var note = $('[data-agent-note]');
      note.hidden = !ag;
      if (ag) $('[data-agent-name]', note).textContent = ag.name;
      $('[data-listings-title]').textContent = state.saved ? 'Saved homes' : state.status === 'rent' ? 'Homes for rent' : state.status === 'all' ? 'All homes' : 'Homes for sale';
      observeReveals(results);
      // Keep the URL shareable
      var url = new URL(location.href);
      ['status', 'location', 'type', 'max', 'beds', 'baths', 'agent', 'sort'].forEach(function (k) {
        var v = state[k];
        if (k === 'status' && v === 'buy') v = '';
        if (k === 'sort' && v === 'newest') v = '';
        if (v) url.searchParams.set(k, v); else url.searchParams.delete(k);
      });
      if (state.saved) url.searchParams.set('saved', '1'); else url.searchParams.delete('saved');
      history.replaceState(null, '', url);
    }

    $$('[data-status]').forEach(function (b) {
      b.addEventListener('click', function () { state.status = b.dataset.status; state.saved = false; syncControls(); render(); });
    });
    form.addEventListener('change', function (e) {
      var el = e.target;
      if (el.name === 'saved') { state.saved = el.checked; if (state.saved) state.status = 'all'; else if (state.status === 'all') state.status = 'buy'; syncControls(); }
      else if (el.name in state) state[el.name] = el.value;
      render();
    });
    form.addEventListener('submit', function (e) { e.preventDefault(); });
    $('[name="sort"]').addEventListener('change', function (e) { state.sort = e.target.value; render(); });
    $$('[data-view]').forEach(function (b) {
      b.addEventListener('click', function () {
        state.view = b.dataset.view;
        try { safeStorage.setItem('estate-view', state.view); } catch (e) {}
        syncControls(); render();
      });
    });
    $$('[data-reset]').forEach(function (b) {
      b.addEventListener('click', function () {
        state.location = state.type = state.max = state.beds = state.baths = state.agent = '';
        state.saved = false;
        if (state.status === 'all') state.status = 'buy';
        syncControls(); render();
      });
    });
    var filterToggle = $('[data-filter-toggle]'), filterPanel = $('#filter-panel');
    filterToggle.addEventListener('click', function () {
      var open = filterPanel.classList.toggle('hidden') === false;
      filterToggle.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('saved-change', function () { if (state.saved) render(); });
    syncControls();
    render();
  }

  /* ---------------- Property detail ---------------- */
  var detail = $('[data-property]');
  if (detail) {
    var pid = +new URLSearchParams(location.search).get('id');
    var p = byId(pid) || PROPERTIES[0];
    var agent = agentById(p.agent);
    var views = gallery(p);
    // The site name comes from the page's og:site_name, so renaming the site in the <head> renames this too.
    var siteMeta = $('meta[property="og:site_name"]');
    var siteName = (siteMeta && siteMeta.getAttribute('content')) || 'Harbor & Hill Realty';
    document.title = p.title + ' — ' + p.area + ' | ' + siteName;
    var metaDesc = $('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', p.summary);

    $('[data-p-title]').textContent = p.title;
    $('[data-p-crumb]').textContent = p.title;
    $('[data-p-crumb-list]').href = 'listings.html?status=' + p.status;
    $('[data-p-crumb-list]').textContent = p.status === 'rent' ? 'For rent' : 'For sale';
    $('[data-p-address]').textContent = p.address + ', ' + p.area + ', Marlow Bay';
    $('[data-p-price]').innerHTML = priceLabel(p);
    $('[data-p-status]').textContent = p.status === 'rent' ? 'For rent' : 'For sale';
    $('[data-p-badges]').innerHTML = p.badges.map(function (b) { return '<span class="badge border border-line">' + esc(b) + '</span>'; }).join('');
    $('[data-p-heart]').innerHTML = heartButton(p, 'border border-line');
    $('[data-p-summary]').textContent = p.summary;
    $('[data-p-more]').textContent = 'Built in ' + p.year + ', this ' + p.type.toLowerCase() + ' offers ' + p.sqft.toLocaleString('en-US') +
      ' sq ft across ' + p.beds + ' bedroom' + (p.beds > 1 ? 's' : '') + ' and ' + p.baths + ' bathroom' + (p.baths > 1 ? 's' : '') +
      '. ' + p.area + ' puts you close to ' + ({ 'Cedar Heights': 'forest trails and the Cedar Heights village shops', 'The Docklands': 'the ferry terminal, galleries and waterfront restaurants', 'Linden Park': 'the park, the Saturday farmers’ market and well-regarded schools', 'Westshore': 'surf beaches, the coastal path and the Westshore marina', 'Old Harbor': 'cobbled lanes, independent cafés and the harbor wall', 'Hillcrest': 'the lookout, golf club and the best views in Marlow Bay' }[p.area] || 'everything Marlow Bay has to offer') + '.';
    $('[data-p-features]').innerHTML = p.features.map(function (f) {
      return '<li class="flex items-start gap-3"><svg class="mt-1 size-4 shrink-0 text-brass" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="m4 10 4 4 8-8"/></svg><span>' + esc(f) + '</span></li>';
    }).join('');
    var factRows = [['Type', p.type], ['Bedrooms', p.beds], ['Bathrooms', p.baths], ['Interior', p.sqft.toLocaleString('en-US') + ' sq ft'], ['Year built', p.year], ['Parking', p.parking], ['Lot', p.lot], ['Reference', 'HH-' + (1000 + p.id)]];
    $('[data-p-facts]').innerHTML = factRows.map(function (r) {
      return '<div class="flex justify-between gap-4 border-b border-line py-3"><dt class="text-muted">' + r[0] + '</dt><dd class="text-right font-medium">' + esc(r[1]) + '</dd></div>';
    }).join('');
    $('[data-p-keyfacts]').innerHTML = facts(p);
    $('[data-p-plan]').innerHTML = floorPlan(p);

    // Gallery: one large image and four thumbnails, all opening the lightbox
    var galleryEl = $('[data-p-gallery]');
    // The last photo shows "View all N photos", so its name starts with that text.
    function photoLabel(v, i) {
      var label = 'Open photo ' + (i + 1) + ' of ' + views.length + ': ' + v.label;
      return i === views.length - 1 ? 'View all ' + views.length + ' photos (' + label + ')' : label;
    }
    galleryEl.innerHTML = views.map(function (v, i) {
      return '<button type="button" class="group media block w-full overflow-hidden rounded-2xl ' + (i === 0 ? 'col-span-2 row-span-2 aspect-[4/3] md:aspect-auto' : 'hidden aspect-[4/3] md:block') + '" data-open="' + i + '" aria-label="' + photoLabel(v, i) + '">' + v.html() +
        (i === views.length - 1 ? '<span class="absolute right-3 bottom-3 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-ink">View all ' + views.length + ' photos</span>' : '') + '</button>';
    }).join('');
    $('[data-p-photos-mobile]').textContent = 'View all ' + views.length + ' photos';

    // Lightbox
    var lb = $('[data-lightbox]'), lbStage = $('[data-lb-stage]'), lbCaption = $('[data-lb-caption]'), current = 0, lastFocus = null;
    function showSlide(i) {
      current = (i + views.length) % views.length;
      lbStage.innerHTML = views[current].html();
      lbCaption.textContent = (current + 1) + ' / ' + views.length + ' · ' + views[current].label;
    }
    function openLightbox(i) {
      lastFocus = document.activeElement;
      showSlide(i);
      lb.hidden = false;
      document.body.style.overflow = 'hidden';
      $('[data-lb-close]').focus();
    }
    function closeLightbox() {
      lb.hidden = true;
      document.body.style.overflow = '';
      if (lastFocus) lastFocus.focus();
    }
    document.addEventListener('click', function (e) {
      var o = e.target.closest('[data-open]');
      if (o) openLightbox(+o.dataset.open);
    });
    $('[data-lb-close]').addEventListener('click', closeLightbox);
    $('[data-lb-prev]').addEventListener('click', function () { showSlide(current - 1); });
    $('[data-lb-next]').addEventListener('click', function () { showSlide(current + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target.hasAttribute('data-lb-backdrop')) closeLightbox(); });
    document.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowRight') showSlide(current + 1);
      else if (e.key === 'ArrowLeft') showSlide(current - 1);
      else if (e.key === 'Tab') {
        var f = $$('button', lb), first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });

    // Mortgage calculator (sales) or move-in costs (rentals)
    var calc = $('[data-calc]'), moveIn = $('[data-movein]');
    if (p.status === 'buy') {
      moveIn.hidden = true;
      var cf = calc.elements;
      cf.price.value = p.price;
      var update = function () {
        var price = Math.max(0, +cf.price.value || 0);
        var depPct = +cf.deposit.value, rate = (+cf.rate.value || 0) / 100 / 12, n = +cf.term.value * 12;
        var dep = price * depPct / 100, loan = price - dep;
        var monthly = rate ? loan * rate / (1 - Math.pow(1 + rate, -n)) : loan / n;
        var interest = monthly * n - loan;
        $('[data-out-deposit]').textContent = money(dep) + ' (' + depPct + '%)';
        $('[data-out-monthly]').textContent = money(monthly);
        $('[data-out-loan]').textContent = money(loan);
        $('[data-out-interest]').textContent = money(interest);
        $('[data-out-total]').textContent = money(monthly * n + dep);
        var share = loan + interest > 0 ? loan / (loan + interest) * 100 : 100;
        $('[data-bar-principal]').style.width = share.toFixed(1) + '%';
      };
      calc.addEventListener('input', update);
      calc.addEventListener('submit', function (e) { e.preventDefault(); });
      update();
    } else {
      calc.hidden = true;
      var deposit = p.price * 1.5;
      $('[data-movein-rent]').textContent = money(p.price);
      $('[data-movein-deposit]').textContent = money(deposit);
      $('[data-movein-total]').textContent = money(p.price + deposit);
    }
    $('[data-calc-heading]').textContent = p.status === 'buy' ? 'Mortgage calculator' : 'Move-in costs';

    // Agent card + viewing form
    $('[data-agent-img]').src = agent.img;
    $('[data-agent-img]').alt = 'Portrait of ' + agent.name;
    $('[data-agent-name]').textContent = agent.name;
    $('[data-agent-role]').textContent = agent.role;
    $('[data-agent-phone]').textContent = agent.phone;
    $('[data-agent-phone]').href = 'tel:' + agent.phone.replace(/[^\d+]/g, '');
    $('[data-agent-email]').href = 'mailto:' + agent.email + '?subject=' + encodeURIComponent(p.title + ' (HH-' + (1000 + p.id) + ')');
    $('[data-agent-listings]').href = 'listings.html?status=all&agent=' + agent.id;
    $('[name="property"]').value = p.title + ' (HH-' + (1000 + p.id) + ')';
    $('[data-viewing-for]').textContent = p.title;

    // Similar homes: same status, closest in price
    var similar = PROPERTIES.filter(function (x) { return x.id !== p.id && x.status === p.status; })
      .sort(function (a, b) { return Math.abs(a.price - p.price) - Math.abs(b.price - p.price); }).slice(0, 3);
    $('[data-similar]').innerHTML = similar.map(function (x) { return card(x, 'grid'); }).join('');

    // Share / copy link
    var share = $('[data-share]');
    share.addEventListener('click', function () {
      if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(function () { toast('Link copied'); }, function () { toast('Couldn’t copy. Use the address bar.'); });
      else toast('Copy the link from the address bar');
    });
  }

  updateSavedCount();
  observeReveals(document);
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
