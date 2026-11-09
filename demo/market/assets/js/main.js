/* Kiln & Co. — store script
 * Vanilla JavaScript, no dependencies. Sections:
 *  1. Product catalog      5. Cart drawer & toast     9. Product page
 *  2. SVG product art        6. Header & mobile menu   10. Cart page
 *  3. Helpers                7. Home page              11. Checkout page
 *  4. Cart (localStorage)    8. Shop page              12. Forms & FAQ
 */
document.documentElement.classList.add('js');

(function () {
  'use strict';

  /* ------------------------------------------------------------------
   * 1. Product catalog — edit, add or remove products here.
   *    shape: vase | bud | mug | cup | tumbler | bowl | plate | pitcher | planter
   * ------------------------------------------------------------------ */
  var PRODUCTS = [
    {
      id: 'ridge-vase', name: 'Ridge Vase', category: 'Vases', price: 68, shape: 'vase',
      rating: 4.9, reviews: 214, badge: 'Bestseller', featured: 1,
      blurb: 'A tall, generous vase thrown in one pull, with a soft shoulder that holds branches upright.',
      glazes: [{ name: 'Oat', color: '#e6d9c2' }, { name: 'Moss', color: '#76855a' }, { name: 'Ink', color: '#2e3a4b' }],
      sizes: [{ name: 'Medium · 9.5 in', delta: 0 }, { name: 'Large · 12.5 in', delta: 26 }],
      details: ['Stoneware, fired to 2300°F', 'Fully glazed inside — watertight', 'Raw clay foot protects your furniture'],
      dims: 'Medium: 9.5 in tall, 5.5 in wide. Large: 12.5 in tall, 7 in wide.'
    },
    {
      id: 'daily-mug', name: 'Daily Mug', category: 'Mugs & Cups', price: 32, shape: 'mug',
      rating: 4.8, reviews: 532, badge: 'Bestseller', featured: 2,
      blurb: 'Our first and most-loved piece. A wide thumb-rest handle and a lip thin enough for a good cup of tea.',
      glazes: [{ name: 'Speckled White', color: '#efe8dc' }, { name: 'Terracotta', color: '#b65a33' }, { name: 'Sea Glass', color: '#9cbcb0' }],
      sizes: [{ name: '8 oz', delta: 0 }, { name: '12 oz', delta: 4 }],
      details: ['Stoneware with lead-free glaze', 'Dishwasher and microwave safe', 'Each one is slightly different'],
      dims: '8 oz: 3.5 in tall. 12 oz: 4 in tall.'
    },
    {
      id: 'wide-serving-bowl', name: 'Wide Serving Bowl', category: 'Bowls', price: 84, shape: 'bowl',
      rating: 4.9, reviews: 98, badge: 'New', featured: 3,
      blurb: 'Made for salads that need room and pasta for six. Shallow enough to show off what is inside.',
      glazes: [{ name: 'Celadon', color: '#a9bfa2' }, { name: 'Oat', color: '#e6d9c2' }, { name: 'Iron', color: '#5b4436' }],
      sizes: [{ name: 'One size · 12.5 in', delta: 0 }],
      details: ['Stoneware, hand-trimmed foot', 'Dishwasher safe', 'Oven safe to 425°F'],
      dims: '12.5 in wide, 3.5 in tall.'
    },
    {
      id: 'dinner-plate', name: 'Dinner Plate', category: 'Plates', price: 34, shape: 'plate',
      rating: 4.7, reviews: 301, featured: 4,
      blurb: 'A flat, wide rim and a gently raised well — sturdy enough for every day, handsome enough for guests.',
      glazes: [{ name: 'Speckled White', color: '#efe8dc' }, { name: 'Slate', color: '#6f7a80' }, { name: 'Moss', color: '#76855a' }],
      sizes: [{ name: 'Side · 8.5 in', delta: -8 }, { name: 'Dinner · 10.5 in', delta: 0 }],
      details: ['Stoneware, chip-resistant rim', 'Dishwasher and microwave safe', 'Stacks neatly'],
      dims: 'Side: 8.5 in. Dinner: 10.5 in.'
    },
    {
      id: 'morning-pitcher', name: 'Morning Pitcher', category: 'Serveware', price: 76, shape: 'pitcher',
      rating: 4.8, reviews: 76,
      blurb: 'Pours without dripping, which took us forty-one prototypes. Water, milk, flowers — all welcome.',
      glazes: [{ name: 'Sea Glass', color: '#9cbcb0' }, { name: 'Oat', color: '#e6d9c2' }, { name: 'Terracotta', color: '#b65a33' }],
      sizes: [{ name: '1 quart', delta: 0 }],
      details: ['Stoneware with a pulled spout', 'Dishwasher safe', 'Fully glazed inside'],
      dims: '1 quart. 7.5 in tall.'
    },
    {
      id: 'everyday-bowl', name: 'Everyday Bowl', category: 'Bowls', price: 28, shape: 'bowl',
      rating: 4.8, reviews: 412,
      blurb: 'The bowl you reach for first: oats in the morning, noodles at night, ice cream whenever.',
      glazes: [{ name: 'Terracotta', color: '#b65a33' }, { name: 'Speckled White', color: '#efe8dc' }, { name: 'Ink', color: '#2e3a4b' }],
      sizes: [{ name: 'Small · 5.5 in', delta: 0 }, { name: 'Medium · 6.5 in', delta: 6 }],
      details: ['Stoneware with lead-free glaze', 'Dishwasher and microwave safe', 'Comfortable to hold in two hands'],
      dims: 'Small: 5.5 in wide. Medium: 6.5 in wide.'
    },
    {
      id: 'terrace-planter', name: 'Terrace Planter', category: 'Planters', price: 58, shape: 'planter',
      rating: 4.7, reviews: 133, badge: 'New',
      blurb: 'A tapered planter with a hidden drainage hole and matching saucer, for herbs, ferns and fig cuttings.',
      glazes: [{ name: 'Iron', color: '#5b4436' }, { name: 'Oat', color: '#e6d9c2' }, { name: 'Celadon', color: '#a9bfa2' }],
      sizes: [{ name: 'Small · 6 in', delta: 0 }, { name: 'Large · 8.5 in', delta: 24 }],
      details: ['Unglazed interior lets roots breathe', 'Drainage hole and saucer included', 'Frost-resistant'],
      dims: 'Small: 6 in wide. Large: 8.5 in wide.'
    },
    {
      id: 'bud-vase', name: 'Bud Vase', category: 'Vases', price: 26, shape: 'bud',
      rating: 4.9, reviews: 187,
      blurb: 'Small, round and steady. Built for a single stem from the garden or the side of the road.',
      glazes: [{ name: 'Terracotta', color: '#b65a33' }, { name: 'Celadon', color: '#a9bfa2' }, { name: 'Speckled White', color: '#efe8dc' }],
      sizes: [{ name: 'One size · 4.5 in', delta: 0 }],
      details: ['Stoneware', 'Watertight', 'Lovely in groups of three'],
      dims: '4.5 in tall, 3.5 in wide.'
    },
    {
      id: 'pour-tumbler', name: 'Pour Tumbler, Set of 2', category: 'Mugs & Cups', price: 38, shape: 'tumbler',
      rating: 4.6, reviews: 154,
      blurb: 'A straight-sided cup for water, wine or a cold brew. Sold as a pair, because drinks are better shared.',
      glazes: [{ name: 'Slate', color: '#6f7a80' }, { name: 'Oat', color: '#e6d9c2' }, { name: 'Sea Glass', color: '#9cbcb0' }],
      sizes: [{ name: 'Set of 2 · 8 oz', delta: 0 }],
      details: ['Stoneware, set of two', 'Dishwasher safe', 'Raw clay band at the base for grip'],
      dims: '8 oz. 4 in tall.'
    },
    {
      id: 'pasta-plate', name: 'Shallow Pasta Plate', category: 'Plates', price: 36, shape: 'plate',
      rating: 4.8, reviews: 89,
      blurb: 'Somewhere between a plate and a bowl — the right shape for risotto, curry and anything with a sauce.',
      glazes: [{ name: 'Iron', color: '#5b4436' }, { name: 'Celadon', color: '#a9bfa2' }, { name: 'Speckled White', color: '#efe8dc' }],
      sizes: [{ name: 'One size · 9 in', delta: 0 }],
      details: ['Stoneware', 'Dishwasher and microwave safe', 'Gently sloped walls'],
      dims: '9 in wide, 1.5 in deep.'
    },
    {
      id: 'espresso-cup', name: 'Espresso Cup', category: 'Mugs & Cups', price: 22, shape: 'cup',
      rating: 4.7, reviews: 66,
      blurb: 'A tiny, thick-walled cup that keeps a double shot warm to the last sip.',
      glazes: [{ name: 'Ink', color: '#2e3a4b' }, { name: 'Terracotta', color: '#b65a33' }, { name: 'Oat', color: '#e6d9c2' }],
      sizes: [{ name: '3 oz', delta: 0 }],
      details: ['Stoneware', 'Dishwasher safe', 'Thick walls for heat'],
      dims: '3 oz. 2.5 in tall.'
    },
    {
      id: 'studio-vase', name: 'Studio Vase', category: 'Vases', price: 94, shape: 'vase',
      rating: 5.0, reviews: 41, badge: 'Limited',
      blurb: 'A one-off glaze test we liked too much to retire. Made in batches of twenty, numbered on the base.',
      glazes: [{ name: 'Ash Blue', color: '#7d97a8' }, { name: 'Iron', color: '#5b4436' }],
      sizes: [{ name: 'Large · 12.5 in', delta: 0 }],
      details: ['Stoneware, numbered on the base', 'Watertight', 'Glaze varies from piece to piece'],
      dims: '12.5 in tall, 7 in wide.'
    }
  ];

  var CATEGORIES = ['Vases', 'Mugs & Cups', 'Bowls', 'Plates', 'Serveware', 'Planters'];
  var BACKDROPS = ['#ece4d8', '#e6e2d8', '#ede3dd', '#e3e6dd', '#e9e1d3', '#e4e1dc'];
  var FREE_SHIPPING = 75;
  var STANDARD_SHIPPING = 8;
  var EXPRESS_SHIPPING = 18;
  var TAX_RATE = 0.08;
  var PROMO = { code: 'WELCOME10', rate: 0.10 };

  function findProduct(id) {
    for (var i = 0; i < PRODUCTS.length; i++) if (PRODUCTS[i].id === id) return PRODUCTS[i];
    return null;
  }

  /* ------------------------------------------------------------------
   * 2. SVG product art — every product "photo" is drawn here.
   *    art(product, glazeIndex, view) → SVG string. Views: 0 hero,
   *    1 close-up, 2 on a shelf, 3 pair.
   * ------------------------------------------------------------------ */
  var uid = 0;

  function hexToRgb(hex) {
    var n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function shade(hex, amt) {
    var c = hexToRgb(hex).map(function (v) {
      return Math.round(amt < 0 ? v * (1 + amt) : v + (255 - v) * amt);
    });
    return '#' + c.map(function (v) { return ('0' + v.toString(16)).slice(-2); }).join('');
  }
  function isLight(hex) {
    var c = hexToRgb(hex);
    return (c[0] * 299 + c[1] * 587 + c[2] * 114) / 1000 > 150;
  }
  function seeded(seed) {
    var h = 0;
    for (var i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
    return function () {
      h = (h * 1103515245 + 12345) & 0x7fffffff;
      return h / 0x7fffffff;
    };
  }

  // Outline of each shape, sitting on a floor at y=420, centered on x=200.
  var SHAPES = {
    vase: {
      body: 'M172 118 C172 110 228 110 228 118 L227 152 C227 180 292 206 292 300 C292 382 254 420 200 420 C146 420 108 382 108 300 C108 206 173 180 173 152 Z',
      rim: [200, 118, 28, 6], width: 92
    },
    bud: {
      body: 'M186 236 C186 230 214 230 214 236 L213 262 C213 274 276 290 276 350 C276 398 246 420 200 420 C154 420 124 398 124 350 C124 290 187 274 187 262 Z',
      rim: [200, 236, 14, 4], width: 76
    },
    mug: {
      body: 'M132 222 L268 222 L264 396 C263 412 252 420 236 420 L164 420 C148 420 137 412 136 396 Z',
      rim: [200, 222, 68, 13], width: 74,
      handle: 'M266 262 C330 258 334 366 262 364'
    },
    cup: {
      body: 'M150 300 L250 300 L246 398 C245 412 236 420 222 420 L178 420 C164 420 155 412 154 398 Z',
      rim: [200, 300, 50, 10], width: 56,
      handle: 'M248 324 C292 322 294 388 246 384',
      saucer: true
    },
    tumbler: {
      body: 'M150 228 L250 228 L243 404 C242 414 236 420 226 420 L174 420 C164 420 158 414 157 404 Z',
      rim: [200, 228, 50, 10], width: 54
    },
    bowl: {
      body: 'M48 282 C52 368 118 420 200 420 C282 420 348 368 352 282 Z',
      rim: [200, 282, 152, 34], width: 120, inner: true
    },
    plate: { plate: true, width: 170 },
    pitcher: {
      body: 'M156 168 C156 226 120 268 120 334 C120 394 156 420 200 420 C244 420 280 394 280 334 C280 268 244 226 244 168 Z',
      rim: [200, 168, 44, 9], width: 86,
      handle: 'M258 200 C334 206 330 318 274 338',
      spout: 'M166 164 C150 160 128 150 110 140 C114 158 132 180 162 192 Z'
    },
    planter: {
      body: 'M116 262 L284 262 L262 404 C261 414 254 420 244 420 L156 420 C146 420 139 414 138 404 Z',
      rim: [200, 262, 84, 15], width: 92, plant: true
    }
  };

  function vessel(shape, glaze, seedKey, ids) {
    var s = SHAPES[shape];
    var rand = seeded(seedKey);
    var dark = shade(glaze, -0.42);
    var mid = shade(glaze, -0.14);
    var light = shade(glaze, 0.38);
    var clay = '#d6bf9f';
    var out = '';

    out += '<defs>' +
      '<linearGradient id="g' + ids + '" x1="0" x2="1">' +
        '<stop offset="0" stop-color="' + dark + '"/>' +
        '<stop offset=".28" stop-color="' + glaze + '"/>' +
        '<stop offset=".42" stop-color="' + light + '"/>' +
        '<stop offset=".6" stop-color="' + glaze + '"/>' +
        '<stop offset="1" stop-color="' + dark + '"/>' +
      '</linearGradient>' +
      '<linearGradient id="c' + ids + '" x1="0" x2="1">' +
        '<stop offset="0" stop-color="' + shade(clay, -0.35) + '"/>' +
        '<stop offset=".4" stop-color="' + shade(clay, 0.25) + '"/>' +
        '<stop offset="1" stop-color="' + shade(clay, -0.3) + '"/>' +
      '</linearGradient>' +
      (s && s.body ? '<clipPath id="k' + ids + '"><path d="' + s.body + '"/></clipPath>' : '') +
    '</defs>';

    if (s.plate) {
      // A plate resting on a second one, seen from a low angle.
      out += '<radialGradient id="p' + ids + '" cx=".38" cy=".3" r=".75">' +
        '<stop offset="0" stop-color="' + light + '"/><stop offset=".55" stop-color="' + glaze + '"/><stop offset="1" stop-color="' + mid + '"/></radialGradient>';
      out += '<radialGradient id="w' + ids + '" cx=".5" cy=".15" r=".9">' +
        '<stop offset="0" stop-color="' + mid + '"/><stop offset=".6" stop-color="' + glaze + '"/><stop offset="1" stop-color="' + shade(glaze, 0.2) + '"/></radialGradient>';
      [[338, 0.92], [300, 1]].forEach(function (pl) {
        var cy = pl[0], k = pl[1], rx = 168 * k, ry = 54 * k;
        // rim edge (thickness) then glazed top
        out += '<ellipse cx="200" cy="' + (cy + 12) + '" rx="' + rx + '" ry="' + ry + '" fill="' + dark + '"/>';
        out += '<path d="M' + (200 - rx) + ' ' + cy + ' A' + rx + ' ' + ry + ' 0 0 0 ' + (200 + rx) + ' ' + cy + ' L' + (200 + rx) + ' ' + (cy + 12) + ' A' + rx + ' ' + ry + ' 0 0 1 ' + (200 - rx) + ' ' + (cy + 12) + ' Z" fill="url(#c' + ids + ')"/>';
        out += '<ellipse cx="200" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="url(#p' + ids + ')"/>';
        out += '<ellipse cx="200" cy="' + (cy + 3) + '" rx="' + (rx * 0.64) + '" ry="' + (ry * 0.62) + '" fill="url(#w' + ids + ')"/>';
        out += '<ellipse cx="200" cy="' + (cy + 3) + '" rx="' + (rx * 0.64) + '" ry="' + (ry * 0.62) + '" fill="none" stroke="' + dark + '" stroke-opacity=".18" stroke-width="2"/>';
      });
      out += '<path d="M78 280 C118 258 170 250 214 250" stroke="#fff" stroke-opacity=".45" stroke-width="5" fill="none" stroke-linecap="round"/>';
      for (var j = 0; j < 34; j++) {
        var a = rand() * Math.PI * 2, d = Math.sqrt(rand());
        out += '<circle cx="' + (200 + Math.cos(a) * d * 150) + '" cy="' + (302 + Math.sin(a) * d * 46) + '" r="' + (0.8 + rand() * 1.5) + '" fill="' + (isLight(glaze) ? dark : light) + '" opacity="' + (0.2 + rand() * 0.35) + '"/>';
      }
      return out;
    }

    if (s.saucer) {
      out += '<ellipse cx="200" cy="426" rx="104" ry="20" fill="url(#c' + ids + ')"/>';
      out += '<ellipse cx="200" cy="420" rx="104" ry="20" fill="url(#g' + ids + ')"/>';
      out += '<ellipse cx="200" cy="420" rx="62" ry="11" fill="' + mid + '" opacity=".6"/>';
    }
    if (s.handle) {
      out += '<path d="' + s.handle + '" fill="none" stroke="' + dark + '" stroke-width="24" stroke-linecap="round"/>';
      out += '<path d="' + s.handle + '" fill="none" stroke="' + mid + '" stroke-width="15" stroke-linecap="round"/>';
    }
    if (s.plant) {
      var leaves = [[-50, -128, -38], [-18, -150, -12], [16, -140, 14], [46, -118, 38], [-70, -88, -62], [64, -84, 62], [0, -110, 0]];
      leaves.forEach(function (l, i) {
        out += '<path d="M200 262 Q' + (200 + l[0] * 0.5) + ' ' + (262 + l[1] * 0.4) + ' ' + (200 + l[0]) + ' ' + (262 + l[1]) + '" stroke="#4e6138" stroke-width="3" fill="none"/>';
        out += '<ellipse cx="' + (200 + l[0]) + '" cy="' + (262 + l[1]) + '" rx="17" ry="38" transform="rotate(' + l[2] + ' ' + (200 + l[0]) + ' ' + (262 + l[1]) + ')" fill="' + (i % 2 ? '#6e8550' : '#587042') + '"/>';
        out += '<path d="M' + (200 + l[0]) + ' ' + (262 + l[1] + 30) + ' L' + (200 + l[0]) + ' ' + (262 + l[1] - 30) + '" transform="rotate(' + l[2] + ' ' + (200 + l[0]) + ' ' + (262 + l[1]) + ')" stroke="#8aa069" stroke-width="1.5"/>';
      });
    }

    out += '<path d="' + s.body + '" fill="url(#g' + ids + ')"/>';
    // Raw clay foot with a wavy glaze line.
    var wave = 'M40 400 Q80 392 120 399 T200 398 T280 400 T360 396 L360 440 L40 440 Z';
    if (shape === 'planter' || shape === 'tumbler') wave = 'M40 392 Q90 388 130 393 T210 391 T290 394 T360 390 L360 440 L40 440 Z';
    out += '<g clip-path="url(#k' + ids + ')">';
    out += '<path d="' + wave + '" fill="url(#c' + ids + ')"/>';
    for (var i = 0; i < 40; i++) {
      out += '<circle cx="' + (60 + rand() * 280) + '" cy="' + (110 + rand() * 290) + '" r="' + (0.7 + rand() * 1.7) + '" fill="' + (isLight(glaze) ? dark : light) + '" opacity="' + (0.18 + rand() * 0.35) + '"/>';
    }
    out += '</g>';

    if (s.rim) {
      var r = s.rim;
      out += '<ellipse cx="' + r[0] + '" cy="' + r[1] + '" rx="' + r[2] + '" ry="' + r[3] + '" fill="' + light + '"/>';
      out += '<ellipse cx="' + r[0] + '" cy="' + (r[1] + r[3] * 0.18) + '" rx="' + (r[2] * 0.9) + '" ry="' + (r[3] * 0.72) + '" fill="' + (s.plant ? '#4a3a2c' : dark) + '"/>';
      if (s.inner) out += '<ellipse cx="200" cy="' + (r[1] + 6) + '" rx="' + (r[2] * 0.82) + '" ry="' + (r[3] * 0.58) + '" fill="' + mid + '"/>';
    }
    if (s.spout) out += '<path d="' + s.spout + '" fill="' + glaze + '"/><path d="M110 140 C130 150 150 160 166 164" stroke="' + light + '" stroke-width="4" fill="none" stroke-linecap="round"/>';
    return out;
  }

  function art(product, glazeIndex, view) {
    glazeIndex = glazeIndex || 0;
    view = view || 0;
    var g = product.glazes[glazeIndex] || product.glazes[0];
    var bg = BACKDROPS[PRODUCTS.indexOf(product) % BACKDROPS.length];
    var id = 'a' + (++uid);
    var w = (SHAPES[product.shape].width || 90);
    var box = '0 0 400 500';
    var scene = '';

    if (view === 1) {
      box = '90 190 220 275'; // close-up on the glaze and foot
    }
    if (view === 2) bg = shade(bg, -0.06);

    scene += '<rect width="400" height="500" fill="' + bg + '"/>';
    scene += '<radialGradient id="l' + id + '" cx=".3" cy=".2" r=".9"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>';
    scene += '<rect width="400" height="500" fill="url(#l' + id + ')"/>';

    if (view === 2) {
      // Shelf with a wall shadow.
      scene += '<rect y="420" width="400" height="80" fill="' + shade(bg, -0.12) + '"/>';
      scene += '<rect y="420" width="400" height="6" fill="' + shade(bg, 0.25) + '"/>';
      scene += '<path d="M300 0 L400 0 L400 420 L230 420 Z" fill="#000" opacity=".04"/>';
    }

    var shadow = '<ellipse cx="200" cy="' + (product.shape === 'plate' ? 398 : 424) + '" rx="' + (w * 1.15) + '" ry="12" fill="#2a2016" opacity=".16" filter="url(#b' + id + ')"/>';
    scene += '<filter id="b' + id + '" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>';

    if (view === 3) {
      // Two pieces side by side, the second in the next glaze.
      var g2 = product.glazes[(glazeIndex + 1) % product.glazes.length];
      scene += '<g transform="translate(-60 70) scale(.82)">' + shadow + vessel(product.shape, g.color, product.id + 'a', id + 'x') + '</g>';
      scene += '<g transform="translate(130 120) scale(.72)">' + shadow + vessel(product.shape, g2.color, product.id + 'b', id + 'y') + '</g>';
    } else {
      scene += shadow + vessel(product.shape, g.color, product.id + glazeIndex, id);
    }

    return '<svg viewBox="' + box + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' +
      escapeHtml(product.name + ' in ' + g.name) + '" preserveAspectRatio="xMidYMid slice">' + scene + '</svg>';
  }

  /* ------------------------------------------------------------------
   * 3. Helpers
   * ------------------------------------------------------------------ */
  var money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
  function fmt(n) { return money.format(n); }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
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

  function store(key, value) {
    try {
      if (value === undefined) return JSON.parse(safeStorage.getItem(key));
      safeStorage.setItem(key, JSON.stringify(value));
    } catch (e) { return null; }
  }
  function stars(rating) {
    var full = Math.round(rating);
    var s = '';
    for (var i = 1; i <= 5; i++) {
      s += '<svg viewBox="0 0 20 20" class="h-3.5 w-3.5 ' + (i <= full ? 'fill-ink' : 'fill-line') + '" aria-hidden="true"><path d="M10 1.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L10 14.8l-5.2 2.8 1-5.8L1.5 7.7l5.9-.8z"/></svg>';
    }
    return '<span class="inline-flex items-center gap-0.5" role="img" aria-label="Rated ' + rating + ' out of 5">' + s + '</span>';
  }
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Product card, shared by the home page, shop and related products.
  function productCard(p) {
    var badge = p.badge ? '<span class="absolute left-3 top-3 z-10 rounded-full bg-cream/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-ink backdrop-blur">' + p.badge + '</span>' : '';
    var dots = p.glazes.map(function (g) {
      return '<span class="h-3 w-3 rounded-full ring-1 ring-ink/15" style="background:' + g.color + '" title="' + escapeHtml(g.name) + '"></span>';
    }).join('');
    return '' +
      '<article class="group reveal relative flex flex-col">' +
        '<a href="product.html?id=' + p.id + '" class="relative block aspect-[4/5] overflow-hidden rounded-2xl bg-sand">' +
          badge +
          '<span class="art absolute inset-0 transition duration-700 ease-[var(--ease-soft)] group-hover:scale-[1.04] group-hover:opacity-0">' + art(p, 0, 0) + '</span>' +
          '<span class="art absolute inset-0 scale-[1.04] opacity-0 transition duration-700 ease-[var(--ease-soft)] group-hover:scale-100 group-hover:opacity-100" aria-hidden="true">' + art(p, 1 % p.glazes.length, 2) + '</span>' +
          '<span class="sr-only">View ' + escapeHtml(p.name) + '</span>' +
        '</a>' +
        '<div class="mt-4 flex items-start justify-between gap-3">' +
          '<div>' +
            '<h3 class="font-display text-lg leading-snug"><a href="product.html?id=' + p.id + '" class="link-underline">' + escapeHtml(p.name) + '</a></h3>' +
            '<p class="mt-1 text-sm text-stone">' + escapeHtml(p.category) + '</p>' +
          '</div>' +
          '<p class="text-[15px] font-medium tabular-nums">' + fmt(p.price) + '</p>' +
        '</div>' +
        '<div class="mt-3 flex items-center justify-between">' +
          '<div class="flex gap-1.5">' + dots + '</div>' +
          '<button type="button" data-add="' + p.id + '" class="rounded-full border border-line px-3.5 py-1.5 text-xs font-medium transition hover:border-ink hover:bg-ink hover:text-cream">Quick add</button>' +
        '</div>' +
      '</article>';
  }

  /* ------------------------------------------------------------------
   * 4. Cart — stored in localStorage as [{ id, glaze, size, qty }]
   * ------------------------------------------------------------------ */
  var CART_KEY = 'kiln-cart';
  var PROMO_KEY = 'kiln-promo';

  var MAX_QTY = 99; // matches the product page's quantity input

  // Whole quantity from 1 to MAX_QTY, or null when the value isn't usable.
  function clampQty(value) {
    var n = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
    if (!isFinite(n)) return null;
    n = Math.floor(n);
    return n < 1 ? null : Math.min(MAX_QTY, n);
  }
  function validIndex(value, length) {
    return typeof value === 'number' && value % 1 === 0 && value >= 0 && value < length ? value : 0;
  }
  // Turn whatever is in storage into a valid cart: known products, in-range
  // glaze/size indexes and whole quantities. Anything else is dropped and
  // duplicate lines are merged. Prices are never stored; totals always come
  // from PRODUCTS.
  function normalizeCart(raw) {
    if (!Array.isArray(raw)) return [];
    var out = [], byKey = {};
    raw.forEach(function (entry) {
      if (!entry || typeof entry !== 'object' || typeof entry.id !== 'string') return;
      var p = findProduct(entry.id);
      var qty = clampQty(entry.qty);
      if (!p || qty === null) return;
      var item = { id: entry.id, glaze: validIndex(entry.glaze, p.glazes.length), size: validIndex(entry.size, p.sizes.length), qty: qty };
      var key = item.id + ':' + item.glaze + ':' + item.size;
      if (byKey[key]) byKey[key].qty = Math.min(MAX_QTY, byKey[key].qty + qty);
      else { byKey[key] = item; out.push(item); }
    });
    return out;
  }

  var Cart = {
    items: function () {
      var raw = null;
      try { raw = safeStorage.getItem(CART_KEY); } catch (e) {}
      var items = normalizeCart(store(CART_KEY));
      // Self-heal: replace corrupt or tampered data with the cleaned version.
      if (raw !== null && raw !== JSON.stringify(items)) store(CART_KEY, items);
      return items;
    },
    save: function (items) { store(CART_KEY, normalizeCart(items)); renderCartUI(); },
    add: function (id, glaze, size, qty) {
      Cart.save(Cart.items().concat([{ id: id, glaze: glaze, size: size, qty: qty }]));
    },
    setQty: function (index, qty) {
      var items = Cart.items();
      if (!items[index]) return;
      var amount = clampQty(qty);
      if (amount === null) items.splice(index, 1); else items[index].qty = amount;
      Cart.save(items);
    },
    remove: function (index) { Cart.setQty(index, 0); },
    clear: function () { store(CART_KEY, []); store(PROMO_KEY, null); renderCartUI(); },
    line: function (item) {
      var p = findProduct(item.id);
      var size = p.sizes[item.size] || p.sizes[0];
      var glaze = p.glazes[item.glaze] || p.glazes[0];
      var unit = p.price + size.delta;
      return { product: p, glaze: glaze, size: size, unit: unit, total: unit * item.qty, qty: item.qty };
    },
    count: function () { return Cart.items().reduce(function (n, i) { return n + i.qty; }, 0); },
    totals: function (shippingMethod) {
      var subtotal = Cart.items().reduce(function (n, i) { return n + Cart.line(i).total; }, 0);
      var promo = store(PROMO_KEY) === PROMO.code;
      var discount = promo ? Math.round(subtotal * PROMO.rate * 100) / 100 : 0;
      var shipping = 0;
      if (subtotal > 0) {
        if (shippingMethod === 'express') shipping = EXPRESS_SHIPPING;
        else shipping = subtotal >= FREE_SHIPPING ? 0 : STANDARD_SHIPPING;
      }
      var tax = Math.round((subtotal - discount) * TAX_RATE * 100) / 100;
      return { subtotal: subtotal, discount: discount, shipping: shipping, tax: tax, total: subtotal - discount + shipping + tax, promo: promo };
    }
  };

  // Free-shipping progress bar markup.
  function shippingProgress(subtotal) {
    var left = Math.max(0, FREE_SHIPPING - subtotal);
    var pct = Math.min(100, (subtotal / FREE_SHIPPING) * 100);
    var msg = left > 0
      ? 'You are <strong class="font-semibold">' + fmt(left) + '</strong> away from free shipping.'
      : '<strong class="font-semibold">Your order ships free.</strong>';
    return '<p class="text-sm">' + msg + '</p>' +
      '<div class="mt-2 h-1.5 overflow-hidden rounded-full bg-oat" role="progressbar" aria-label="Progress to free shipping" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + Math.round(pct) + '">' +
        '<div class="h-full rounded-full bg-moss transition-[width] duration-500" style="width:' + pct + '%"></div>' +
      '</div>';
  }

  /* ------------------------------------------------------------------
   * 5. Cart drawer & toast
   * ------------------------------------------------------------------ */
  var drawer = $('#cart-drawer');
  var overlay = $('#cart-overlay');
  var lastFocus = null;

  function focusables(root) {
    return $$('a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])', root)
      .filter(function (el) { return el.offsetParent !== null; });
  }

  function openDrawer() {
    if (!drawer) return;
    var t = $('#toast');
    if (t) t.classList.add('translate-y-6', 'opacity-0', 'pointer-events-none');
    lastFocus = document.activeElement;
    renderDrawer();
    drawer.hidden = false;
    overlay.hidden = false;
    document.body.classList.add('drawer-open');
    requestAnimationFrame(function () {
      drawer.classList.remove('translate-x-full');
      overlay.classList.remove('opacity-0');
      $('[data-drawer-close]', drawer).focus();
    });
    $$('[data-cart-open]').forEach(function (b) { b.setAttribute('aria-expanded', 'true'); });
  }

  function closeDrawer() {
    if (!drawer || drawer.hidden) return;
    drawer.classList.add('translate-x-full');
    overlay.classList.add('opacity-0');
    document.body.classList.remove('drawer-open');
    $$('[data-cart-open]').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
    setTimeout(function () { drawer.hidden = true; overlay.hidden = true; }, reduceMotion ? 0 : 350);
    if (lastFocus) lastFocus.focus();
  }

  function renderDrawer() {
    if (!drawer) return;
    var body = $('[data-drawer-body]', drawer);
    var foot = $('[data-drawer-foot]', drawer);
    var items = Cart.items();
    var t = Cart.totals();
    $('[data-drawer-progress]', drawer).innerHTML = shippingProgress(t.subtotal);
    if (!items.length) {
      body.innerHTML = '<div class="flex h-full flex-col items-center justify-center px-6 text-center">' +
        '<p class="font-display text-2xl">Your cart is empty</p>' +
        '<p class="mt-2 text-sm text-stone">Mugs, vases and bowls are waiting on the shelf.</p>' +
        '<a href="shop.html" class="btn-primary mt-6">Shop the collection</a></div>';
      foot.hidden = true;
      return;
    }
    foot.hidden = false;
    patch(body, '<ul class="divide-y divide-line">' + items.map(function (item, i) {
      var l = Cart.line(item);
      return '<li class="flex gap-4 py-5" data-line="' + lineKey(item) + '">' +
        '<a href="product.html?id=' + l.product.id + '" class="art block h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-sand">' + art(l.product, item.glaze, 0) + '</a>' +
        '<div class="flex flex-1 flex-col">' +
          '<div class="flex justify-between gap-3"><p class="font-display text-base leading-snug">' + escapeHtml(l.product.name) + '</p><p class="text-sm tabular-nums">' + fmt(l.total) + '</p></div>' +
          '<p class="mt-0.5 text-xs text-stone">' + escapeHtml(l.glaze.name + ' · ' + l.size.name) + '</p>' +
          '<div class="mt-auto flex items-center justify-between pt-2">' +
            qtyStepper(i, item.qty, 'sm') +
            '<button type="button" data-remove="' + i + '" class="text-xs text-stone underline underline-offset-4 hover:text-clay">Remove</button>' +
          '</div>' +
        '</div></li>';
    }).join('') + '</ul>');
    $('[data-drawer-subtotal]', drawer).textContent = fmt(t.subtotal);
  }

  function qtyStepper(index, qty, size) {
    var h = size === 'sm' ? 'h-8' : 'h-10';
    return '<div class="inline-flex ' + h + ' items-center rounded-full border border-line">' +
      '<button type="button" data-qty-step="-1" data-index="' + index + '" class="grid ' + h + ' w-8 place-items-center rounded-full text-stone hover:text-ink" aria-label="Decrease quantity">−</button>' +
      '<span class="w-6 text-center text-sm tabular-nums" aria-live="polite">' + qty + '</span>' +
      '<button type="button" data-qty-step="1" data-index="' + index + '" class="grid ' + h + ' w-8 place-items-center rounded-full text-stone hover:text-ink" aria-label="Increase quantity">+</button>' +
    '</div>';
  }

  // A cart line's id: product, glaze and size (the cart merges lines with the same three).
  function lineKey(item) { return item.id + ':' + item.glaze + ':' + item.size; }

  // Re-render `root` from `html` in place: nodes that are still there are updated rather than
  // replaced, so after − or + the focused button keeps focus and the quantity's live region
  // announces the new number. A cart line (data-line) is only reused for the same item.
  function patch(root, html) {
    var tpl = document.createElement('template');
    tpl.innerHTML = html;
    morph(root, tpl.content);
  }
  function morph(from, to) {
    var i, a, b;
    if (from.nodeType === 1 && to.nodeType === 1) {
      for (i = from.attributes.length - 1; i >= 0; i--) {
        if (!to.hasAttribute(from.attributes[i].name)) from.removeAttribute(from.attributes[i].name);
      }
      for (i = 0; i < to.attributes.length; i++) {
        b = to.attributes[i];
        if (from.getAttribute(b.name) !== b.value) from.setAttribute(b.name, b.value);
      }
    }
    var kids = from.childNodes, next = to.childNodes;
    for (i = 0; i < next.length; i++) {
      a = kids[i]; b = next[i];
      if (!a) from.appendChild(b.cloneNode(true));
      else if (a.nodeType !== b.nodeType || a.nodeName !== b.nodeName ||
        (a.nodeType === 1 && a.getAttribute('data-line') !== b.getAttribute('data-line'))) from.replaceChild(b.cloneNode(true), a);
      else if (a.nodeType === 1) morph(a, b);
      else if (a.nodeValue !== b.nodeValue) a.nodeValue = b.nodeValue;
    }
    while (kids.length > next.length) from.removeChild(from.lastChild);
  }

  // Keyboard focus after a cart line's −, + or Remove (drawer and cart page): the same control
  // on the same line; if the line is gone, the same control on the next line, else on the
  // previous line; if the cart is now empty, the empty cart's "Shop" link.
  function keepLineFocus(button, change) {
    var inDrawer = !!(drawer && drawer.contains(button));
    var scope = function () { return inDrawer ? $('[data-drawer-body]', drawer) : $('#cart-lines'); };
    var line = button.closest('[data-line]');
    if (!line) return change();
    var keys = $$('[data-line]', scope()).map(function (li) { return li.getAttribute('data-line'); });
    var at = keys.indexOf(line.getAttribute('data-line'));
    var control = button.hasAttribute('data-remove') ? '[data-remove]' : '[data-qty-step="' + button.getAttribute('data-qty-step') + '"]';
    change();
    var rows = $$('[data-line]', scope());
    var row = [keys[at], keys[at + 1], keys[at - 1]].reduce(function (found, key) {
      return found || rows.filter(function (li) { return key && li.getAttribute('data-line') === key; })[0];
    }, null);
    var target = row ? $(control, row) : inDrawer ? $('[data-drawer-body] a', drawer) : $('#cart-empty a');
    if (target && target !== document.activeElement) target.focus();
  }

  var toastTimer;
  function toast(html) {
    var el = $('#toast');
    if (!el) return;
    $('[data-toast-msg]', el).innerHTML = html;
    el.classList.remove('translate-y-6', 'opacity-0', 'pointer-events-none');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      el.classList.add('translate-y-6', 'opacity-0', 'pointer-events-none');
    }, 3600);
  }

  function renderCartUI() {
    var count = Cart.count();
    $$('[data-cart-count]').forEach(function (el) {
      el.textContent = count;
      el.hidden = count === 0;
    });
    $$('[data-cart-open]').forEach(function (b) {
      b.setAttribute('aria-label', 'Open cart, ' + count + (count === 1 ? ' item' : ' items'));
    });
    if (drawer && !drawer.hidden) renderDrawer();
    if (document.body.dataset.page === 'cart') renderCartPage();
    if (document.body.dataset.page === 'checkout') renderCheckoutSummary();
  }

  function bumpBadge() {
    $$('[data-cart-count]').forEach(function (el) {
      el.classList.remove('badge-pop');
      void el.offsetWidth;
      el.classList.add('badge-pop');
    });
  }

  function addToCart(id, glaze, size, qty) {
    var p = findProduct(id);
    Cart.add(id, glaze, size, qty);
    bumpBadge();
    toast('<strong class="font-semibold">' + escapeHtml(p.name) + '</strong> added to your cart. ' +
      '<button type="button" data-cart-open class="ml-1 underline underline-offset-4">View cart</button>');
  }

  // Global click handling (works for content rendered later, too).
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-cart-open], [data-drawer-close], [data-add], [data-qty-step], [data-remove], [data-toast-close]');
    if (!t) return;
    if (t.hasAttribute('data-cart-open')) { e.preventDefault(); openDrawer(); }
    else if (t.hasAttribute('data-drawer-close')) closeDrawer();
    else if (t.hasAttribute('data-add')) addToCart(t.getAttribute('data-add'), 0, defaultSize(t.getAttribute('data-add')), 1);
    else if (t.hasAttribute('data-qty-step')) {
      var idx = +t.getAttribute('data-index');
      var item = Cart.items()[idx];
      if (item) keepLineFocus(t, function () { Cart.setQty(idx, item.qty + (+t.getAttribute('data-qty-step'))); });
    }
    else if (t.hasAttribute('data-remove')) keepLineFocus(t, function () { Cart.remove(+t.getAttribute('data-remove')); });
    else if (t.hasAttribute('data-toast-close')) $('#toast').classList.add('translate-y-6', 'opacity-0', 'pointer-events-none');
  });

  function defaultSize(id) {
    var p = findProduct(id);
    for (var i = 0; i < p.sizes.length; i++) if (p.sizes[i].delta === 0) return i;
    return 0;
  }

  if (overlay) overlay.addEventListener('click', closeDrawer);

  document.addEventListener('keydown', function (e) {
    if (drawer && !drawer.hidden) {
      if (e.key === 'Escape') { closeDrawer(); return; }
      if (e.key === 'Tab') {
        var f = focusables(drawer);
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
  });

  // Keep the badge in sync across tabs.
  window.addEventListener('storage', function (e) { if (e.key === CART_KEY) renderCartUI(); });

  /* ------------------------------------------------------------------
   * 6. Header, mobile menu, static art and scroll reveal
   * ------------------------------------------------------------------ */
  var menuBtn = $('#menu-toggle');
  var menu = $('#mobile-menu');
  function setMenu(open) {
    menuBtn.setAttribute('aria-expanded', String(open));
    menu.hidden = !open;
    $('[data-icon-open]', menuBtn).classList.toggle('hidden', open);
    $('[data-icon-close]', menuBtn).classList.toggle('hidden', !open);
  }
  if (menuBtn && menu) {
    menuBtn.addEventListener('click', function () { setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') { setMenu(false); menuBtn.focus(); }
    });
    window.matchMedia('(min-width: 1024px)').addEventListener('change', function (m) { if (m.matches) setMenu(false); });
  }

  // Header shadow once the page scrolls.
  var header = $('#site-header');
  if (header) {
    var onScroll = function () { header.classList.toggle('shadow-[0_1px_0_var(--color-line)]', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // <div data-art="product-id" data-glaze="1" data-view="2"> → product illustration.
  function hydrateArt(root) {
    $$('[data-art]', root).forEach(function (el) {
      var p = findProduct(el.getAttribute('data-art'));
      if (p) el.innerHTML = art(p, +(el.getAttribute('data-glaze') || 0), +(el.getAttribute('data-view') || 0));
    });
  }

  var revealObserver = ('IntersectionObserver' in window && !reduceMotion)
    ? new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add('is-visible'); revealObserver.unobserve(en.target); }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 })
    : null;
  function reveal(root) {
    $$('.reveal:not(.is-visible)', root).forEach(function (el, i) {
      if (!revealObserver) { el.classList.add('is-visible'); return; }
      el.style.transitionDelay = Math.min(i % 4, 3) * 80 + 'ms';
      revealObserver.observe(el);
    });
  }

  // Current year in footers.
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ------------------------------------------------------------------
   * 7. Home page
   * ------------------------------------------------------------------ */
  function initHome() {
    var grid = $('#bestsellers');
    if (!grid) return;
    var picks = PRODUCTS.filter(function (p) { return p.featured; })
      .sort(function (a, b) { return a.featured - b.featured; });
    grid.innerHTML = picks.map(productCard).join('');
  }

  /* ------------------------------------------------------------------
   * 8. Shop page — filters, sort and live count
   * ------------------------------------------------------------------ */
  function initShop() {
    var grid = $('#product-grid');
    var form = $('#filters');
    if (!grid || !form) return;
    var priceInput = $('#price-max');
    var priceOut = $('#price-max-value');
    var sort = $('#sort');
    var count = $('#result-count');
    var empty = $('#no-results');

    var params = new URLSearchParams(location.search);
    var preset = params.get('category');
    if (preset && CATEGORIES.indexOf(preset) !== -1) {
      var radio = $('input[name="category"][value="' + CSS.escape(preset) + '"]', form);
      if (radio) radio.checked = true;
    }

    // Product counts beside each category.
    $$('[data-count-for]', form).forEach(function (el) {
      var c = el.getAttribute('data-count-for');
      el.textContent = c === 'all' ? PRODUCTS.length : PRODUCTS.filter(function (p) { return p.category === c; }).length;
    });

    function apply() {
      var cat = ($('input[name="category"]:checked', form) || {}).value || 'all';
      var max = +priceInput.value;
      priceOut.textContent = max >= +priceInput.max ? 'Any price' : 'Up to ' + fmt(max);
      var list = PRODUCTS.filter(function (p) {
        return (cat === 'all' || p.category === cat) && p.price <= max;
      });
      var by = sort.value;
      list.sort(function (a, b) {
        if (by === 'price-asc') return a.price - b.price;
        if (by === 'price-desc') return b.price - a.price;
        if (by === 'rating') return b.rating - a.rating;
        if (by === 'name') return a.name.localeCompare(b.name);
        return PRODUCTS.indexOf(a) - PRODUCTS.indexOf(b);
      });
      grid.innerHTML = list.map(productCard).join('');
      count.textContent = list.length + (list.length === 1 ? ' product' : ' products');
      empty.hidden = list.length > 0;
      $('#shop-heading').textContent = cat === 'all' ? 'All ceramics' : cat;
      reveal(grid);

      var url = new URL(location.href);
      if (cat === 'all') url.searchParams.delete('category'); else url.searchParams.set('category', cat);
      history.replaceState(null, '', url);
    }

    var toggle = $('#filters-toggle');
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(open));
      form.classList.toggle('hidden', !open);
    });

    form.addEventListener('input', apply);
    form.addEventListener('submit', function (e) { e.preventDefault(); });
    sort.addEventListener('change', apply);
    $('#reset-filters').addEventListener('click', function () {
      form.reset();
      $('input[name="category"][value="all"]', form).checked = true;
      priceInput.value = priceInput.max;
      sort.value = 'featured'; // the sort menu sits outside the form, so form.reset() misses it
      apply();
    });
    apply();
  }

  /* ------------------------------------------------------------------
   * 9. Product page
   * ------------------------------------------------------------------ */
  function initProduct() {
    var root = $('#product');
    if (!root) return;
    var id = new URLSearchParams(location.search).get('id');
    var p = findProduct(id) || PRODUCTS[0];
    var state = { glaze: 0, size: defaultSize(p.id), view: 0, qty: 1 };

    document.title = p.name + ' — Kiln & Co.';
    $('[data-p="name"]').textContent = p.name;
    $('[data-p="crumb"]').textContent = p.name;
    $('[data-p="category"]').textContent = p.category;
    $('[data-p="category-link"]').href = 'shop.html?category=' + encodeURIComponent(p.category);
    $('[data-p="category-link"]').textContent = p.category;
    $('[data-p="blurb"]').textContent = p.blurb;
    $('[data-p="rating"]').innerHTML = stars(p.rating) + '<span class="ml-2 text-sm text-stone">' + p.rating.toFixed(1) + ' · ' + p.reviews + ' reviews</span>';
    $('[data-p="details"]').innerHTML = p.details.map(function (d) { return '<li>' + escapeHtml(d) + '</li>'; }).join('');
    $('[data-p="dims"]').textContent = p.dims;
    var badge = $('[data-p="badge"]');
    if (p.badge) { badge.textContent = p.badge; badge.hidden = false; }

    var main = $('#gallery-main');
    var thumbs = $('#gallery-thumbs');
    var viewNames = ['Front view', 'Glaze close-up', 'On the shelf', 'Pair'];

    function renderGallery() {
      main.innerHTML = art(p, state.glaze, state.view);
      thumbs.innerHTML = viewNames.map(function (name, v) {
        var on = v === state.view;
        return '<button type="button" data-view="' + v + '" aria-label="' + name + '" aria-pressed="' + on + '" class="art aspect-square overflow-hidden rounded-xl bg-sand ring-offset-2 ring-offset-paper transition ' +
          (on ? 'ring-2 ring-ink' : 'opacity-75 hover:opacity-100') + '">' + art(p, state.glaze, v) + '</button>';
      }).join('');
    }

    thumbs.addEventListener('click', function (e) {
      var b = e.target.closest('[data-view]');
      if (!b) return;
      state.view = +b.getAttribute('data-view');
      renderGallery();
      $('[data-view="' + state.view + '"]', thumbs).focus();
    });

    // Glaze swatches
    var glazeBox = $('#glaze-options');
    glazeBox.innerHTML = p.glazes.map(function (g, i) {
      return '<label class="cursor-pointer">' +
        '<input type="radio" name="glaze" value="' + i + '" class="peer sr-only"' + (i === 0 ? ' checked' : '') + '>' +
        '<span class="block h-10 w-10 rounded-full ring-1 ring-ink/15 ring-offset-2 ring-offset-paper transition peer-checked:ring-2 peer-checked:ring-ink peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-clay" style="background:' + g.color + '"></span>' +
        '<span class="sr-only">' + escapeHtml(g.name) + '</span></label>';
    }).join('');
    // Sizes
    var sizeBox = $('#size-options');
    sizeBox.innerHTML = p.sizes.map(function (s, i) {
      return '<label class="cursor-pointer">' +
        '<input type="radio" name="size" value="' + i + '" class="peer sr-only"' + (i === state.size ? ' checked' : '') + '>' +
        '<span class="block rounded-full border border-line px-4 py-2 text-sm transition hover:border-ink peer-checked:border-ink peer-checked:bg-ink peer-checked:text-cream peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-clay">' + escapeHtml(s.name) + '</span></label>';
    }).join('');

    function renderPrice() {
      var unit = p.price + p.sizes[state.size].delta;
      $('[data-p="price"]').textContent = fmt(unit);
      $('[data-p="glaze-name"]').textContent = p.glazes[state.glaze].name;
      $('#add-total').textContent = fmt(unit * state.qty);
    }

    $('#buy-form').addEventListener('change', function (e) {
      if (e.target.name === 'glaze') { state.glaze = +e.target.value; renderGallery(); }
      if (e.target.name === 'size') state.size = +e.target.value;
      renderPrice();
    });

    var qtyInput = $('#qty');
    function setQty(n) {
      state.qty = Math.max(1, Math.min(99, n || 1));
      qtyInput.value = state.qty;
      renderPrice();
    }
    $('#qty-minus').addEventListener('click', function () { setQty(state.qty - 1); });
    $('#qty-plus').addEventListener('click', function () { setQty(state.qty + 1); });
    qtyInput.addEventListener('change', function () { setQty(parseInt(qtyInput.value, 10)); });

    $('#buy-form').addEventListener('submit', function (e) {
      e.preventDefault();
      addToCart(p.id, state.glaze, state.size, state.qty);
      var btn = $('#add-btn');
      btn.dataset.label = btn.dataset.label || btn.firstElementChild.textContent;
      btn.firstElementChild.textContent = 'Added';
      setTimeout(function () { btn.firstElementChild.textContent = btn.dataset.label; }, 1600);
    });

    // Related: same category first, then the rest.
    var related = PRODUCTS.filter(function (x) { return x !== p && x.category === p.category; })
      .concat(PRODUCTS.filter(function (x) { return x !== p && x.category !== p.category; }))
      .slice(0, 4);
    $('#related').innerHTML = related.map(productCard).join('');

    renderGallery();
    renderPrice();
  }

  /* ------------------------------------------------------------------
   * 10. Cart page
   * ------------------------------------------------------------------ */
  function renderCartPage() {
    var list = $('#cart-lines');
    if (!list) return;
    var items = Cart.items();
    var t = Cart.totals();
    $('#cart-empty').hidden = items.length > 0;
    $('#cart-full').hidden = items.length === 0;
    $('#cart-title-count').textContent = items.length ? '(' + Cart.count() + ')' : '';
    if (!items.length) { list.innerHTML = ''; return; }

    patch(list, items.map(function (item, i) {
      var l = Cart.line(item);
      return '<li class="flex gap-5 py-6 sm:gap-6" data-line="' + lineKey(item) + '">' +
        '<a href="product.html?id=' + l.product.id + '" class="art block h-32 w-26 shrink-0 overflow-hidden rounded-xl bg-sand sm:h-40 sm:w-32">' + art(l.product, item.glaze, 0) + '</a>' +
        '<div class="flex min-w-0 flex-1 flex-col">' +
          '<div class="flex flex-wrap justify-between gap-x-4 gap-y-1">' +
            '<div><h2 class="font-display text-xl"><a class="link-underline" href="product.html?id=' + l.product.id + '">' + escapeHtml(l.product.name) + '</a></h2>' +
            '<p class="mt-1 text-sm text-stone">' + escapeHtml(l.glaze.name) + ' · ' + escapeHtml(l.size.name) + '</p>' +
            '<p class="mt-1 text-sm text-stone">' + fmt(l.unit) + ' each</p></div>' +
            '<p class="font-medium tabular-nums">' + fmt(l.total) + '</p>' +
          '</div>' +
          '<div class="mt-auto flex items-center justify-between pt-4">' + qtyStepper(i, item.qty) +
            '<button type="button" data-remove="' + i + '" class="text-sm text-stone underline underline-offset-4 hover:text-clay">Remove</button>' +
          '</div>' +
        '</div></li>';
    }).join(''));

    $('#cart-progress').innerHTML = shippingProgress(t.subtotal);
    $('#sum-subtotal').textContent = fmt(t.subtotal);
    $('#sum-discount-row').hidden = !t.promo;
    $('#sum-discount').textContent = '−' + fmt(t.discount);
    $('#sum-shipping').textContent = t.shipping ? fmt(t.shipping) : 'Free';
    $('#sum-tax').textContent = fmt(t.tax);
    $('#sum-total').textContent = fmt(t.total);
    var applied = $('#promo-applied');
    applied.hidden = !t.promo;
    $('#promo-form').hidden = t.promo;
  }

  function initCart() {
    if (!$('#cart-lines')) return;
    var form = $('#promo-form');
    var input = $('#promo');
    var err = $('#promo-error');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (input.value.trim().toUpperCase() === PROMO.code) {
        store(PROMO_KEY, PROMO.code);
        err.textContent = '';
        input.removeAttribute('aria-invalid');
        input.value = '';
        renderCartPage();
        toast('Code <strong class="font-semibold">' + PROMO.code + '</strong> applied — 10% off.');
      } else {
        err.textContent = input.value.trim() ? 'That code isn’t valid. Try WELCOME10.' : 'Enter a promo code.';
        input.setAttribute('aria-invalid', 'true');
      }
    });
    $('#promo-remove').addEventListener('click', function () {
      store(PROMO_KEY, null);
      renderCartPage();
    });
    renderCartPage();
  }

  /* ------------------------------------------------------------------
   * 11. Checkout page (demo — no payment is processed)
   * ------------------------------------------------------------------ */
  function shippingMethod() {
    var r = $('input[name="delivery"]:checked');
    return r ? r.value : 'standard';
  }

  function renderCheckoutSummary() {
    var box = $('#checkout-lines');
    if (!box) return;
    var items = Cart.items();
    var t = Cart.totals(shippingMethod());
    $('#checkout-empty').hidden = items.length > 0;
    $('#checkout-main').hidden = items.length === 0;
    if (!items.length) return;
    box.innerHTML = items.map(function (item) {
      var l = Cart.line(item);
      return '<li class="flex items-center gap-4 py-3">' +
        '<span class="art relative block h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-sand">' + art(l.product, item.glaze, 0) + '</span>' +
        '<span class="min-w-0 flex-1"><span class="block truncate text-sm font-medium">' + escapeHtml(l.product.name) + ' <span class="text-stone">× ' + item.qty + '</span></span>' +
        '<span class="block text-xs text-stone">' + escapeHtml(l.glaze.name + ' · ' + l.size.name) + '</span></span>' +
        '<span class="text-sm tabular-nums">' + fmt(l.total) + '</span></li>';
    }).join('');
    $('#co-subtotal').textContent = fmt(t.subtotal);
    $('#co-discount-row').hidden = !t.promo;
    $('#co-discount').textContent = '−' + fmt(t.discount);
    $('#co-shipping').textContent = t.shipping ? fmt(t.shipping) : 'Free';
    $('#co-tax').textContent = fmt(t.tax);
    $('#co-total').textContent = fmt(t.total);
    var std = $('#standard-price');
    if (std) std.textContent = t.subtotal >= FREE_SHIPPING ? 'Free' : fmt(STANDARD_SHIPPING);
  }

  function initCheckout() {
    var form = $('#checkout-form');
    if (!form) return;
    form.addEventListener('change', function (e) { if (e.target.name === 'delivery') renderCheckoutSummary(); });

    // Light input formatting for the demo card fields.
    var card = $('#card-number');
    card.addEventListener('input', function () {
      var d = card.value.replace(/\D/g, '').slice(0, 19);
      card.value = d.replace(/(.{4})/g, '$1 ').trim();
    });
    var exp = $('#card-expiry');
    exp.addEventListener('input', function () {
      var d = exp.value.replace(/\D/g, '').slice(0, 4);
      exp.value = d.length > 2 ? d.slice(0, 2) + ' / ' + d.slice(2) : d;
    });

    setupValidation(form, function () {
      // Replace this block with a call to your payment provider (e.g. Stripe Checkout).
      var t = Cart.totals(shippingMethod());
      var order = makeRef('KC');
      $('#confirm-number').textContent = order;
      $('#confirm-total').textContent = fmt(t.total);
      $('#confirm-email').textContent = $('#email').value;
      Cart.clear();
      $('#checkout-main').hidden = true;
      $('#checkout-empty').hidden = true;
      var done = $('#checkout-done');
      done.hidden = false;
      done.focus();
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });

    renderCheckoutSummary();
  }

  /* ------------------------------------------------------------------
   * 12. Forms (validation, newsletter, contact) and FAQ search
   *     Forms are front-end only. To collect real submissions, point the
   *     form's action at a service such as Formspree or Netlify Forms.
   * ------------------------------------------------------------------ */
  function luhn(num) {
    var sum = 0, alt = false;
    for (var i = num.length - 1; i >= 0; i--) {
      var n = +num[i];
      if (alt) { n *= 2; if (n > 9) n -= 9; }
      sum += n; alt = !alt;
    }
    return sum % 10 === 0;
  }

  function fieldMessage(el) {
    var v = el.value.trim();
    var label = el.getAttribute('data-label') || 'This field';
    if (el.required && !v) return label + ' is required.';
    if (!v) return '';
    if (el.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Enter an email address like name@example.com.';
    if (el.minLength > 0 && v.length < el.minLength) return label + ' needs at least ' + el.minLength + ' characters.';
    var rule = el.getAttribute('data-validate');
    if (rule === 'card') {
      var d = v.replace(/\D/g, '');
      if (d.length < 13 || !luhn(d)) return 'Enter a valid card number. In test mode, use 4242 4242 4242 4242.';
    }
    if (rule === 'expiry') {
      var m = v.match(/^(\d{2})\s*\/\s*(\d{2})$/);
      if (!m || +m[1] < 1 || +m[1] > 12) return 'Use the format MM / YY.';
      var end = new Date(2000 + +m[2], +m[1], 1);
      if (end <= new Date()) return 'This card has expired.';
    }
    if (rule === 'cvc' && !/^\d{3,4}$/.test(v)) return 'Enter the 3 or 4 digit code.';
    if (rule === 'postcode') {
      // US addresses need a ZIP code (5 digits, optional +4); other countries keep the looser check.
      var country = el.form && el.form.elements.country;
      if (!country || country.value === 'United States') {
        if (!/^\d{5}(-\d{4})?$/.test(v)) return 'Enter a 5-digit ZIP code, like 98402.';
      } else if (!/^[A-Za-z0-9 -]{3,10}$/.test(v)) return 'Enter a valid postal code.';
    }
    return '';
  }

  function showError(el, msg) {
    var errId = el.id + '-error';
    var err = document.getElementById(errId);
    if (!err) {
      err = document.createElement('p');
      err.id = errId;
      err.className = 'field-error';
      el.insertAdjacentElement('afterend', err);
    }
    err.textContent = msg;
    if (msg) {
      el.setAttribute('aria-invalid', 'true');
      var desc = (el.getAttribute('aria-describedby') || '').split(' ').filter(Boolean);
      if (desc.indexOf(errId) === -1) desc.push(errId);
      el.setAttribute('aria-describedby', desc.join(' '));
    } else {
      el.removeAttribute('aria-invalid');
    }
  }

  function setupValidation(form, onValid) {
    form.setAttribute('novalidate', '');
    var fields = $$('input, select, textarea', form).filter(function (el) {
      return el.type !== 'radio' && el.type !== 'checkbox' && el.type !== 'hidden' && el.type !== 'submit';
    });
    fields.forEach(function (el) {
      el.addEventListener('blur', function () { if (el.value.trim() || el.hasAttribute('aria-invalid')) showError(el, fieldMessage(el)); });
      el.addEventListener('input', function () { if (el.hasAttribute('aria-invalid')) showError(el, fieldMessage(el)); });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstBad = null;
      fields.forEach(function (el) {
        var msg = fieldMessage(el);
        showError(el, msg);
        if (msg && !firstBad) firstBad = el;
      });
      var status = $('[data-form-status]', form);
      if (firstBad) {
        if (status) status.textContent = 'Please fix the highlighted fields.';
        firstBad.focus();
        return;
      }
      if (status) status.textContent = '';
      onValid(form);
    });
  }

  // A short reference, like KC-7K2Q (no 0/O or 1/I to misread over the phone).
  function makeRef(prefix) {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', out = '';
    for (var i = 0; i < 4; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
    return prefix + '-' + out;
  }

  function successSwap(form, html) {
    var box = document.createElement('div');
    box.setAttribute('role', 'status');
    box.setAttribute('tabindex', '-1');
    box.className = 'rounded-2xl border border-line bg-cream p-6 focus:outline-none';
    box.innerHTML = html;
    form.replaceWith(box);
    box.focus();
  }

  $$('[data-form="newsletter"]').forEach(function (form) {
    setupValidation(form, function () {
      // Demo only: nothing is sent. Connect your email provider here.
      var dark = form.hasAttribute('data-dark');
      successSwap(form, '<p class="font-display text-xl ' + (dark ? 'text-ink' : '') + '">Thanks — you’re on the list.</p>' +
        '<p class="mt-1 text-sm text-stone">Look out for a confirmation email from us; click the link inside to finish signing up.</p>');
    });
  });

  $$('[data-form="contact"]').forEach(function (form) {
    setupValidation(form, function () {
      // Demo only: nothing is sent. Point the form at Formspree or similar.
      successSwap(form, '<p class="font-display text-2xl">Thank you for writing.</p>' +
        '<p class="mt-2 text-stone">Your message has reached our studio, and one of us will reply within one business day. Your reference is <strong class="font-semibold text-ink">' + makeRef('KC') + '</strong>.</p>');
    });
  });

  function initFaq() {
    var input = $('#faq-search');
    if (!input) return;
    var items = $$('[data-faq]');
    var groups = $$('[data-faq-group]');
    var none = $('#faq-none');
    var status = $('#faq-status');
    input.addEventListener('input', function () {
      var q = input.value.trim().toLowerCase();
      var shown = 0;
      items.forEach(function (d) {
        var hit = !q || d.textContent.toLowerCase().indexOf(q) !== -1;
        d.hidden = !hit;
        if (hit) shown++;
        if (q && hit) d.open = true;
        if (!q) d.open = false;
      });
      groups.forEach(function (g) { g.hidden = !$$('[data-faq]', g).some(function (d) { return !d.hidden; }); });
      none.hidden = shown > 0;
      status.textContent = q ? shown + (shown === 1 ? ' answer' : ' answers') + ' found' : '';
    });
  }

  /* ------------------------------------------------------------------
   * Boot
   * ------------------------------------------------------------------ */
  hydrateArt(document);
  var page = document.body.dataset.page;
  if (page === 'home') initHome();
  if (page === 'shop') initShop();
  if (page === 'product') initProduct();
  if (page === 'cart') initCart();
  if (page === 'checkout') initCheckout();
  if (page === 'faq') initFaq();
  renderCartUI();
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
