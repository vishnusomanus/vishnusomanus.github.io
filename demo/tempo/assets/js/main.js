/* Tempo — Marigold Static band template. All JavaScript for the site, vanilla, no dependencies.
 *
 *  1. Band data: BAND, RELEASES, TOUR, PRODUCTS, CONTACT_TOPICS
 *  2. Helpers (formatting, storage, toast, downloads)
 *  3. Artwork: release covers and merch mock-ups drawn as SVG
 *  4. Audio: previews synthesized in the browser and the player engine
 *  5. Player interfaces: player bar, track buttons, keyboard shortcuts
 *  6. Home page: release countdown, pre-save, next shows, video poster, merch preview
 *  7. Music page: discography filter and release detail with track list
 *  8. Tour page: region and country filters, calendar files
 *  9. Merch page and the cart drawer
 * 10. Press kit: bio tabs, copy, downloads
 * 11. Forms (validation, contact routing and success states)
 * 12. Header, mobile menu, scroll reveal
 * 13. Back to top button
 */
(function () {
  'use strict';

  /* ------------------------------------------------------------------
   * 1. Band data. Edit these to make the site yours (see DOCS.md, Content).
   * ------------------------------------------------------------------ */
  var BAND = {
    name: 'Marigold Static',
    site: 'https://marigoldstatic.example',
    email: 'hello@marigoldstatic.example',
    currency: 'USD',
    locale: 'en-US',
    freeShippingFrom: 60,   // free US shipping threshold, in the currency above
    shipping: 6,          // flat shipping below the threshold
    // Demo only: when every tour date is in the past, move the tour and the new album (releases with
    // campaign: true) forward to the same weeks of the next year, by whole weeks so weekdays never change,
    // so the demo always has an album on the way and upcoming shows. Set to false on your real site.
    keepDemoDatesFresh: true
  };

  // Every release, newest first. type is 'album', 'ep' or 'single' (used by music.html?type=).
  // date is the release date (YYYY-MM-DD); a release dated in the future shows as "Out <date>" with a
  // countdown and pre-save, and only its tracks marked `early: true` can be played before then.
  // art picks the cover colors and motif (see cover() below). Track lengths are the full lengths
  // shown in the track list; the demo plays a 30-second preview generated in the browser.
  // Add `src: 'audio/glasshouse.mp3'` to a track to play a real file instead.
  var RELEASES = [
    { id: 'weather-for-two', type: 'album', title: 'Weather for Two', date: '2026-11-13', campaign: true, label: 'Lantern House Records', cat: 'LHR031',
      art: { bg: '#2b3fd6', a: '#ff4d94', b: '#ffcf33', ink: '#15130f', motif: 'weather' }, merch: 'wft-lp',
      blurb: 'The second album: eleven songs written over one long winter in a Near South apartment, recorded live to tape in nine days at Antelope Hall with producer Ailsa Braid. Bigger synths, closer vocals, and the first song Callum has ever sung.',
      credits: 'Produced by Ailsa Braid. Recorded at Antelope Hall, Lincoln. Mixed by Tomás Reyes. Mastered at Salt Valley Lacquer. Strings on 4 and 11 arranged by Fenna de Wit.',
      tracks: [
        { title: 'Forecast', len: '1:48' },
        { title: 'Glasshouse', len: '3:41', early: true },
        { title: 'Low Pressure', len: '4:12' },
        { title: 'Weather for Two', len: '3:58' },
        { title: 'Platte in March', len: '3:27' },
        { title: 'Isobars', len: '2:54' },
        { title: 'Under the Harris Overpass', len: '4:36' },
        { title: 'Static on the Line', len: '3:19' },
        { title: 'Second Summer', len: '3:44' },
        { title: 'Night Shift Radio', len: '4:05' },
        { title: 'Clearing', len: '5:21' }
      ] },
    { id: 'glasshouse', type: 'single', title: 'Glasshouse', date: '2026-09-18', label: 'Lantern House Records', cat: 'LHR030',
      art: { bg: '#ff4d94', a: '#2b3fd6', b: '#f4efe6', ink: '#15130f', motif: 'glass' }, merch: 'glasshouse-tee',
      blurb: 'The first single from Weather for Two: a song about growing tomatoes on a fire escape and pretending it counts as a garden. Backed with a live take from the empty Near South Pool.',
      credits: 'Produced by Ailsa Braid. B-side recorded live by Kirsty Moffat at Near South Pool.',
      tracks: [
        { title: 'Glasshouse', len: '3:41' },
        { title: 'Glasshouse (Near South Pool session)', len: '4:02' }
      ] },
    { id: 'creek-in-winter', type: 'single', title: 'Creek in Winter', date: '2025-12-05', label: 'Lantern House Records', cat: 'LHR027',
      art: { bg: '#15130f', a: '#c9cff7', b: '#ff4d94', ink: '#f4efe6', motif: 'river' },
      blurb: 'A standalone winter single, written on the walk home along Salt Creek after the last show of 2025.',
      credits: 'Produced by Marigold Static and Ailsa Braid.',
      tracks: [
        { title: 'Creek in Winter', len: '3:33' },
        { title: 'Creek in Winter (voice memo demo)', len: '3:10' }
      ] },
    { id: 'lowland-signal', type: 'album', title: 'Lowland Signal', date: '2024-04-19', label: 'Lantern House Records', cat: 'LHR019',
      art: { bg: '#ffcf33', a: '#2b3fd6', b: '#ff4d94', ink: '#15130f', motif: 'signal' }, merch: 'lowland-lp',
      blurb: 'The debut album. Ten songs about late freight trains, grain-elevator light and the radio left on in the next room, shortlisted for the Great Plains Independent Album of the Year.',
      credits: 'Produced by Ailsa Braid. Recorded at Cornhusker Road Studios, Waverly. Mixed by Tomás Reyes.',
      tracks: [
        { title: 'Lowland Signal', len: '3:52' },
        { title: 'Elevator Light', len: '3:29' },
        { title: 'Overpass Choir', len: '4:18' },
        { title: 'Satellite Town', len: '3:06' },
        { title: 'Small Hours', len: '4:44' },
        { title: 'Rail Yard Lights', len: '3:37' },
        { title: 'Copper & Rain', len: '3:12' },
        { title: 'The Long Way Home from Havelock', len: '4:51' },
        { title: 'Signal Fade', len: '2:48' },
        { title: 'Everything Hums', len: '5:09' }
      ] },
    { id: 'paper-moons', type: 'single', title: 'Paper Moons', date: '2023-10-06', label: 'Lantern House Records', cat: 'LHR014',
      art: { bg: '#c9cff7', a: '#ff4d94', b: '#15130f', ink: '#15130f', motif: 'moons' },
      blurb: 'The single that got them signed: a waltz-time love song for a moon made of tracing paper.',
      credits: 'Produced by Reuben Oyelaran.',
      tracks: [
        { title: 'Paper Moons', len: '3:24' },
        { title: 'Paper Moons (piano version)', len: '2:58' }
      ] },
    { id: 'night-bus-hymns', type: 'ep', title: 'Night Bus Hymns', date: '2022-03-11', label: 'Self-released', cat: 'MS004',
      art: { bg: '#15130f', a: '#ffcf33', b: '#ff4d94', ink: '#f4efe6', motif: 'bus' }, merch: 'nbh-cassette',
      blurb: 'Five songs written on Route 44 between rehearsals and night shifts. Recorded in a weekend at the band’s rehearsal room above a laundromat.',
      credits: 'Recorded and mixed by Reuben Oyelaran. Mastered by Ines Kowal.',
      tracks: [
        { title: 'Route 44', len: '3:15' },
        { title: 'Night Bus Hymn', len: '4:02' },
        { title: 'Sodium Halo', len: '3:41' },
        { title: 'Last Call', len: '3:22' },
        { title: 'Home by Four', len: '4:30' }
      ] },
    { id: 'sodium-light', type: 'ep', title: 'Sodium Light', date: '2020-06-26', label: 'Self-released', cat: 'MS002',
      art: { bg: '#ff4d94', a: '#ffcf33', b: '#15130f', ink: '#15130f', motif: 'sun' },
      blurb: 'The first EP, finished in lockdown with every part recorded in a different apartment.',
      credits: 'Recorded at home by Marigold Static. Mixed by Reuben Oyelaran.',
      tracks: [
        { title: 'Sodium Light', len: '3:38' },
        { title: 'Near South', len: '3:04' },
        { title: 'Burnt Orange', len: '3:51' },
        { title: 'Tape Hiss Lullaby', len: '4:16' }
      ] },
    { id: 'overpass', type: 'single', title: 'Overpass', date: '2019-02-15', label: 'Self-released', cat: 'MS001',
      art: { bg: '#f4efe6', a: '#2b3fd6', b: '#ff4d94', ink: '#15130f', motif: 'grid' },
      blurb: 'The debut single, pressed as 300 lathe-cut 7-inches and sold out at the launch show.',
      credits: 'Recorded live in the back room at the Starlite Tap.',
      tracks: [
        { title: 'Overpass', len: '3:47' },
        { title: 'Holdrege', len: '2:59' }
      ] }
  ];

  var TYPES = { album: 'Album', ep: 'EP', single: 'Single' };

  // Tour regions (tour.html?region=midwest) and dates. status: 'on-sale', 'low' (last tickets), 'sold-out'
  // or 'soon' (tickets not on sale yet; onSale is the date they go on sale). time is the doors time, 24-hour (shown as 7:00 PM).
  var REGIONS = [
    { id: 'midwest', label: 'Midwest' },
    { id: 'europe', label: 'Europe' },
    { id: 'na', label: 'Coasts & Canada' }
  ];
  var TOUR = [
    { id: 'lincoln-1', date: '2026-11-13', time: '19:00', city: 'Lincoln, NE', country: 'United States', region: 'midwest', venue: 'Haymarket Ballroom', status: 'sold-out', note: 'Album launch', support: 'Hazel Okafor' },
    { id: 'lincoln-2', date: '2026-11-14', time: '19:00', city: 'Lincoln, NE', country: 'United States', region: 'midwest', venue: 'Haymarket Ballroom', status: 'low', note: 'Second night added', support: 'Hazel Okafor' },
    { id: 'omaha', date: '2026-11-17', time: '19:00', city: 'Omaha, NE', country: 'United States', region: 'midwest', venue: 'Benson Assembly Rooms', status: 'on-sale', support: 'Hazel Okafor' },
    { id: 'kansas-city', date: '2026-11-19', time: '19:00', city: 'Kansas City, MO', country: 'United States', region: 'midwest', venue: 'Crossroads Electric', status: 'low', support: 'Hazel Okafor' },
    { id: 'des-moines', date: '2026-11-20', time: '19:30', city: 'Des Moines, IA', country: 'United States', region: 'midwest', venue: 'The Ingersoll Room', status: 'on-sale', support: 'Hazel Okafor' },
    { id: 'minneapolis', date: '2026-11-22', time: '19:00', city: 'Minneapolis, MN', country: 'United States', region: 'midwest', venue: 'Riverfront Hall', status: 'on-sale', support: 'Hazel Okafor' },
    { id: 'chicago', date: '2026-11-24', time: '19:00', city: 'Chicago, IL', country: 'United States', region: 'midwest', venue: 'The Ravenswood', status: 'sold-out', support: 'Hazel Okafor' },
    { id: 'milwaukee', date: '2026-11-28', time: '19:30', city: 'Milwaukee, WI', country: 'United States', region: 'midwest', venue: 'Third Ward Sound House', status: 'on-sale', support: 'Hazel Okafor' },
    { id: 'madison', date: '2026-11-29', time: '19:00', city: 'Madison, WI', country: 'United States', region: 'midwest', venue: 'The Willy Street Rooms', status: 'on-sale', support: 'Hazel Okafor' },
    { id: 'amsterdam', date: '2026-12-03', time: '20:00', city: 'Amsterdam', country: 'Netherlands', region: 'europe', venue: 'Het Pakhuis', status: 'low', support: 'Twin Ferries' },
    { id: 'brussels', date: '2026-12-04', time: '19:30', city: 'Brussels', country: 'Belgium', region: 'europe', venue: 'La Serre', status: 'on-sale', support: 'Twin Ferries' },
    { id: 'berlin', date: '2026-12-06', time: '20:00', city: 'Berlin', country: 'Germany', region: 'europe', venue: 'Kesselhaus Nord', status: 'on-sale', support: 'Twin Ferries' },
    { id: 'hamburg', date: '2026-12-07', time: '20:00', city: 'Hamburg', country: 'Germany', region: 'europe', venue: 'Hafenklang Halle', status: 'on-sale', support: 'Twin Ferries' },
    { id: 'copenhagen', date: '2026-12-09', time: '20:00', city: 'Copenhagen', country: 'Denmark', region: 'europe', venue: 'Pumpestationen', status: 'on-sale', support: 'Twin Ferries' },
    { id: 'paris', date: '2026-12-11', time: '19:30', city: 'Paris', country: 'France', region: 'europe', venue: 'La Bulle', status: 'sold-out', support: 'Twin Ferries' },
    { id: 'toronto', date: '2027-02-18', time: '19:00', city: 'Toronto', country: 'Canada', region: 'na', venue: 'Ossington Ballroom', status: 'on-sale', support: 'Lake Effect Choir' },
    { id: 'brooklyn', date: '2027-02-20', time: '19:00', city: 'Brooklyn, NY', country: 'United States', region: 'na', venue: 'Kent Avenue Hall', status: 'low', support: 'Lake Effect Choir' },
    { id: 'philadelphia', date: '2027-02-21', time: '19:00', city: 'Philadelphia, PA', country: 'United States', region: 'na', venue: 'The Foundry Room', status: 'on-sale', support: 'Lake Effect Choir' },
    { id: 'washington-dc', date: '2027-02-24', time: '19:00', city: 'Washington, DC', country: 'United States', region: 'na', venue: 'The H Street Room', status: 'on-sale', support: 'Lake Effect Choir' },
    { id: 'los-angeles', date: '2027-02-27', time: '19:00', city: 'Los Angeles, CA', country: 'United States', region: 'na', venue: 'The Glassell Room', status: 'soon', onSale: '2026-10-23', support: 'Lake Effect Choir' },
    { id: 'san-francisco', date: '2027-02-28', time: '19:00', city: 'San Francisco, CA', country: 'United States', region: 'na', venue: 'Mission Assembly', status: 'soon', onSale: '2026-10-23', support: 'Lake Effect Choir' }
  ];
  // Where "Tickets" buttons go. Replace with your ticketing links (one per show if you like: add `tickets` to a show).
  function ticketUrl(show) { return show.tickets || 'https://tickets.example/marigold-static/' + show.id; }

  // Merch. price is in BAND.currency. colours: name + swatch hex; sizes: list, soldOut: sizes that can't be bought.
  // kind picks the SVG mock-up: 'lp', 'cd', 'cassette', 'tee', 'hoodie', 'poster', 'tote' or 'pins'.
  var PRODUCTS = [
    { id: 'wft-lp', name: 'Weather for Two — LP', cat: 'music', kind: 'lp', release: 'weather-for-two', price: 32, badge: 'Pre-order',
      desc: '180g vinyl in a gatefold sleeve with a 12-page lyric zine. Ships the week of release.',
      colours: [{ name: 'Cobalt blue', hex: '#2b3fd6' }, { name: 'Black', hex: '#15130f' }] },
    { id: 'wft-cd', name: 'Weather for Two — CD', cat: 'music', kind: 'cd', release: 'weather-for-two', price: 15, badge: 'Pre-order',
      desc: 'Six-panel digipak with fold-out poster. Signed by the band while supplies last.' },
    { id: 'lowland-lp', name: 'Lowland Signal — LP', cat: 'music', kind: 'lp', release: 'lowland-signal', price: 28,
      desc: 'The debut album on sun-yellow vinyl, with a download code.',
      colours: [{ name: 'Sun yellow', hex: '#ffcf33' }] },
    { id: 'nbh-cassette', name: 'Night Bus Hymns — Cassette', cat: 'music', kind: 'cassette', release: 'night-bus-hymns', price: 12, badge: 'Last 30',
      desc: 'Pink-shell cassette with a hand-numbered J-card. Includes a download code.' },
    { id: 'glasshouse-tee', name: 'Glasshouse tee', cat: 'apparel', kind: 'tee', price: 30,
      desc: 'Heavyweight organic cotton with a two-color riso-style print. Relaxed fit.',
      colours: [{ name: 'Bone', hex: '#f4efe6' }, { name: 'Ink', hex: '#15130f' }, { name: 'Pink', hex: '#ff4d94' }],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'], soldOut: ['XXL'] },
    { id: 'static-hoodie', name: 'Static Club hoodie', cat: 'apparel', kind: 'hoodie', price: 55,
      desc: 'Brushed-back fleece with an embroidered sun on the chest and the tour dates on the back.',
      colours: [{ name: 'Ink', hex: '#15130f' }, { name: 'Cobalt', hex: '#2b3fd6' }],
      sizes: ['S', 'M', 'L', 'XL'], soldOut: ['S'] },
    { id: 'tour-poster', name: 'Tour poster (18×24 riso print)', cat: 'accessories', kind: 'poster', price: 25,
      desc: 'Three-color risograph print on 65 lb recycled stock. Each one is slightly different.' },
    { id: 'tote', name: 'Weather tote bag', cat: 'accessories', kind: 'tote', price: 18,
      desc: 'Heavy canvas tote, big enough for twelve records and a raincoat.',
      colours: [{ name: 'Natural', hex: '#e9dcc1' }, { name: 'Ink', hex: '#15130f' }] },
    { id: 'pins', name: 'Enamel pin set', cat: 'accessories', kind: 'pins', price: 12,
      desc: 'Three hard-enamel pins: the sun, a raincloud and the Route 44 night bus.' }
  ];
  var MERCH_CATS = { music: 'Music', apparel: 'Apparel', accessories: 'Accessories' };

  // Contact form topics (contact.html?topic=booking). Each one says where the message goes.
  // Booking is routed by region: the region <select> in the booking fields picks the agent.
  var CONTACT_TOPICS = {
    booking: { label: 'Booking', to: { uk: 'Jonah Ekwueme, Northpoint Agency (UK & Europe)', na: 'Priya Desai, Wide Sky Touring (North America)' }, reply: 'Replies within three business days.' },
    press: { label: 'Press and interviews', to: 'Hollie Grant, Paper Plane PR', reply: 'Replies within two business days. Tell us your deadline.' },
    sync: { label: 'Sync and licensing', to: 'The sync team at Lantern House Records', reply: 'Replies within a week.' },
    merch: { label: 'Orders and merch', to: 'The Marigold Static shop', reply: 'Replies within two business days.' },
    general: { label: 'Something else', to: 'The band (Isla reads these)', reply: 'We read everything, but can’t always reply.' }
  };

  /* ------------------------------------------------------------------
   * 2. Helpers
   * ------------------------------------------------------------------ */
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var page = document.body.getAttribute('data-page') || '';
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }
  function clamp(n, a, b) { return Math.min(b, Math.max(a, n)); }
  // A short reference for a confirmation, like MS-7K2Q (no 0/O or 1/I to misread).
  function makeRef(prefix) {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', out = '';
    for (var i = 0; i < 4; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
    return prefix + '-' + out;
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function clock(s) { s = Math.max(0, Math.floor(s || 0)); return Math.floor(s / 60) + ':' + pad(s % 60); }
  function secs(len) { var p = len.split(':'); return Number(p[0]) * 60 + Number(p[1]); }
  function parseDate(iso) { var p = iso.split('-'); return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2])); }
  function fmtDate(iso, opts) { return parseDate(iso).toLocaleDateString(BAND.locale, opts || { day: 'numeric', month: 'long', year: 'numeric' }); }
  // Doors time for visitors: '19:00' in the data reads '7:00 PM'.
  function doorsTime(t) { var p = t.split(':'), h = Number(p[0]); return (h % 12 || 12) + ':' + p[1] + (h < 12 ? ' AM' : ' PM'); }
  function money(n) { return new Intl.NumberFormat(BAND.locale, { style: 'currency', currency: BAND.currency, minimumFractionDigits: n % 1 ? 2 : 0 }).format(n); }
  function today() { var d = new Date(); return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function isOut(rel) { return parseDate(rel.date) <= today(); }
  function getRelease(id) { return RELEASES.filter(function (r) { return r.id === id; })[0]; }
  function getProduct(id) { return PRODUCTS.filter(function (p) { return p.id === id; })[0]; }
  function minutes(rel) { return Math.round(rel.tracks.reduce(function (a, t) { return a + secs(t.len); }, 0) / 60); }
  function hash(str) { var h = 2166136261; for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function seeded(seed) {
    var s = seed || 1;
    return function () { s = Math.imul(s ^ (s >>> 15), 2246822507) ^ Math.imul(s ^ (s >>> 13), 3266489909); s ^= s >>> 16; return (s >>> 0) / 4294967296; };
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

  function readJSON(key, fallback) {
    try { var v = JSON.parse(safeStorage.getItem(key)); return v == null ? fallback : v; } catch (e) { return fallback; }
  }
  function writeJSON(key, value) { try { safeStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* private mode */ } }
  var toastTimer;
  function toast(msg) {
    var el = $('#toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('is-visible'); }, 3200);
  }
  // Save a generated file (calendar entries, press kit text, artwork).
  function download(name, text, type) {
    var url = URL.createObjectURL(new Blob([text], { type: type || 'text/plain;charset=utf-8' }));
    var a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }
  function copyText(text, done) {
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); done(true); } catch (e) { done(false); }
      ta.remove();
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(function () { done(true); }, fallback);
    else fallback();
  }

  // Demo only (see BAND.keepDemoDatesFresh): once the whole tour has passed, move the tour and the new album
  // (campaign: true) forward to the same weeks of a later year, by whole weeks so weekdays never change.
  (function freshenDemoDates() {
    if (!BAND.keepDemoDatesFresh || !TOUR.length) return;
    var DAY = 864e5;
    var num = function (iso) { return Math.round(Date.parse(iso + 'T00:00:00Z') / DAY); };
    var iso = function (n) { return new Date(n * DAY).toISOString().slice(0, 10); };
    var t = today(), now = num(t.getFullYear() + '-' + pad(t.getMonth() + 1) + '-' + pad(t.getDate()));
    var last = TOUR.reduce(function (a, s) { return s.date > a ? s.date : a; }, ''), shift = 0;
    for (var y = 1; num(last) + shift < now && y < 100; y++) {
      shift = Math.round((num((Number(last.slice(0, 4)) + y) + last.slice(4)) - num(last)) / 7) * 7;
    }
    if (!shift) return;
    var move = function (d) { return iso(num(d) + shift); };
    TOUR.forEach(function (s) { s.date = move(s.date); if (s.onSale) s.onSale = move(s.onSale); });
    RELEASES.forEach(function (r) { if (r.campaign) r.date = move(r.date); });
  })();
  // Shows whose tickets were "on sale soon" are on sale once their onSale date has come.
  TOUR.forEach(function (s) { if (s.status === 'soon' && s.onSale && parseDate(s.onSale) <= today()) s.status = 'on-sale'; });
  // Pre-orders become plain products once their release is out.
  PRODUCTS.forEach(function (p) { var r = p.release && getRelease(p.release); if (p.badge === 'Pre-order' && r && isOut(r)) p.badge = 'Out now'; });

  // Release and tour dates written in the pages: [data-release-note] (the banner), [data-release-cta] (pre-save
  // and pre-order links, which read RELEASE_CTA[their data-release-cta] once the album is out), [data-release-day]
  // ("November 13, 2026", or "November 13" with ="dm"), [data-release-year], [data-tour-years] ("2026–27") and
  // [data-tour-from] ("November 2026"). They follow the dates in RELEASES and TOUR, including the demo shift.
  var RELEASE_CTA = { listen: 'Listen', 'listen-album': 'Listen to the album', 'listen-now': 'Listen now', 'buy-lp': 'Buy the LP' };
  function initDemoText() {
    var rel = RELEASES[0], out = isOut(rel);
    $$('[data-release-note]').forEach(function (el) {
      el.textContent = rel.title + ' is out ' + (out ? 'now' : fmtDate(rel.date, { day: 'numeric', month: 'long' })) + '. ';
    });
    if (out) $$('[data-release-cta]').forEach(function (el) { var k = el.getAttribute('data-release-cta'); if (Object.prototype.hasOwnProperty.call(RELEASE_CTA, k)) el.textContent = RELEASE_CTA[k]; });
    $$('[data-release-day]').forEach(function (el) {
      el.textContent = fmtDate(rel.date, el.getAttribute('data-release-day') === 'dm' ? { day: 'numeric', month: 'long' } : { day: 'numeric', month: 'long', year: 'numeric' });
    });
    $$('[data-release-year]').forEach(function (el) { el.textContent = rel.date.slice(0, 4); });
    // The home page title ends "…, out November 13".
    document.title = document.title.replace(/out [A-Z][a-z]+ \d{1,2}$/, out ? 'out now' : 'out ' + fmtDate(rel.date, { day: 'numeric', month: 'long' }));
    if (TOUR.length) {
      var dates = TOUR.map(function (s) { return s.date; }).sort();
      var years = tourYearsText();
      $$('[data-tour-years]').forEach(function (el) {
        if (el.textContent !== years) document.title = document.title.replace(el.textContent, years);
        el.textContent = years;
      });
      $$('[data-tour-from]').forEach(function (el) { el.textContent = fmtDate(dates[0], { month: 'long', year: 'numeric' }); });
    }
  }
  // "2026–27": the years of the tour (the poster art and [data-tour-years]).
  function tourYearsText() {
    var dates = TOUR.map(function (s) { return s.date; }).sort();
    if (!dates.length) return '';
    var y1 = dates[0].slice(0, 4), y2 = dates[dates.length - 1].slice(0, 4);
    return y1 === y2 ? y1 : y1 + '–' + y2.slice(2);
  }
  function upcomingShows() { var t = today(); return TOUR.filter(function (s) { return parseDate(s.date) >= t; }); }

  /* ------------------------------------------------------------------
   * 3. Artwork
   * ------------------------------------------------------------------ */
  // Square release cover. Each motif is a small riso-style composition: two inks multiplied over a
  // paper color, a halftone layer and the title set in the display face.
  var coverSeq = 0;
  function cover(rel, opts) {
    opts = opts || {};
    var a = rel.art, uid = rel.id + (opts.uid || '') + '-' + (++coverSeq), r = seeded(hash(rel.id)), m = '';
    // Multiply only reads as overprinted ink on light paper; on dark or saturated paper the inks print flat.
    var mult = /^#(f4efe6|ffcf33|c9cff7|ffc2da|ebe4d6)$/i.test(a.bg) ? ' style="mix-blend-mode:multiply"' : '';
    var lines = function (n, y0, gap, col, w) { var s = ''; for (var i = 0; i < n; i++) s += '<path d="M0 ' + (y0 + i * gap) + 'H400" stroke="' + col + '" stroke-width="' + w + '"/>'; return s; };
    switch (a.motif) {
      case 'weather':
        m = '<circle cx="250" cy="150" r="104" fill="' + a.b + '"' + mult + '/>' +
          '<g fill="none" stroke="' + a.a + '" stroke-width="16" stroke-linecap="round"' + mult + '>' +
          [0, 1, 2, 3].map(function (i) { return '<path d="M' + (40 + i * 18) + ' ' + (214 + i * 26) + 'q40 -34 80 0t80 0t80 0t80 0"/>'; }).join('') + '</g>' +
          '<g stroke="' + a.ink + '" stroke-width="5" stroke-linecap="round">' + Array.apply(null, Array(14)).map(function (_, i) { var x = 30 + i * 26, y = 40 + (i % 3) * 22; return '<path d="M' + x + ' ' + y + 'l-10 28"/>'; }).join('') + '</g>';
        break;
      case 'glass':
        m = '<g' + mult + '>' + [0, 1, 2].map(function (i) { return '<rect x="' + (64 + i * 92) + '" y="' + (70 + i * 20) + '" width="120" height="210" rx="60" fill="' + (i % 2 ? a.a : a.b) + '"/>'; }).join('') + '</g>' +
          '<g fill="none" stroke="' + a.ink + '" stroke-width="5">' + [0, 1, 2].map(function (i) { return '<rect x="' + (72 + i * 92) + '" y="' + (78 + i * 20) + '" width="120" height="210" rx="60"/>'; }).join('') + '</g>' +
          '<circle cx="300" cy="96" r="22" fill="' + a.ink + '"/>';
        break;
      case 'river':
        m = '<circle cx="200" cy="140" r="82" fill="' + a.a + '"/>' +
          '<g fill="none" stroke="' + a.b + '" stroke-width="6" stroke-linecap="round">' + [0, 1, 2, 3, 4, 5].map(function (i) { return '<path d="M' + (30 + i * 6) + ' ' + (220 + i * 18) + 'c60 -18 110 18 170 0s110 -18 170 0"/>'; }).join('') + '</g>';
        break;
      case 'signal':
        m = '<g' + mult + '><circle cx="120" cy="300" r="70" fill="' + a.b + '"/></g>' +
          '<g fill="none" stroke="' + a.a + '" stroke-width="18"' + mult + '>' + [1, 2, 3, 4].map(function (i) { return '<path d="M' + (120 - i * 62) + ' 300a' + (i * 62) + ' ' + (i * 62) + ' 0 0 1 ' + (i * 124) + ' 0"/>'; }).join('') + '</g>' +
          '<path d="M120 300V130" stroke="' + a.ink + '" stroke-width="8"/><circle cx="120" cy="126" r="12" fill="' + a.ink + '"/>';
        break;
      case 'moons':
        m = [0, 1, 2, 3].map(function (i) { return '<circle cx="' + (90 + i * 75) + '" cy="' + (150 + (i % 2) * 40) + '" r="58" fill="' + (i % 2 ? a.a : 'none') + '" stroke="' + a.b + '" stroke-width="5"' + mult + '/>'; }).join('');
        break;
      case 'bus':
        m = '<g' + mult + '><rect x="40" y="120" width="320" height="130" rx="22" fill="' + a.a + '"/></g>' +
          '<g fill="' + a.ink + '">' + [0, 1, 2, 3, 4].map(function (i) { return '<rect x="' + (58 + i * 60) + '" y="140" width="44" height="40" rx="6" fill="' + a.ink + '"/>'; }).join('') + '</g>' +
          '<g fill="' + a.b + '"><circle cx="110" cy="256" r="26"/><circle cx="290" cy="256" r="26"/></g>' +
          '<text x="330" y="232" text-anchor="end" font-family="Big Shoulders Display, Arial Narrow, sans-serif" font-weight="900" font-size="40" fill="' + a.ink + '">44</text>';
        break;
      case 'sun':
        m = '<circle cx="200" cy="200" r="96" fill="' + a.a + '"' + mult + '/>' +
          '<g stroke="' + a.b + '" stroke-width="6" stroke-linecap="round">' + Array.apply(null, Array(24)).map(function (_, i) { var t = i / 24 * Math.PI * 2; return '<path d="M' + (200 + Math.cos(t) * 118).toFixed(1) + ' ' + (200 + Math.sin(t) * 118).toFixed(1) + 'L' + (200 + Math.cos(t) * 150).toFixed(1) + ' ' + (200 + Math.sin(t) * 150).toFixed(1) + '"/>'; }).join('') + '</g>';
        break;
      default: // grid
        m = '<g' + mult + '><rect x="60" y="60" width="180" height="180" fill="' + a.a + '"/><rect x="160" y="140" width="180" height="180" fill="' + a.b + '"/></g>' +
          '<g stroke="' + a.ink + '" stroke-width="3">' + lines(8, 40, 40, a.ink, 3) + '</g>';
    }
    var title = esc(rel.title.toUpperCase());
    var size = rel.title.length > 13 ? 44 : 58;
    var a11y = opts.label === '' ? 'aria-hidden="true"' : 'role="img" aria-label="' + esc(opts.label || 'Cover art for ' + rel.title) + '"';
    return '<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" ' + a11y + ' focusable="false">' +
      '<defs><pattern id="ht-' + uid + '" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(' + Math.round(r() * 60) + ')"><circle cx="4" cy="4" r="1.6" fill="' + a.ink + '"/></pattern></defs>' +
      '<rect width="400" height="400" fill="' + a.bg + '"/>' + m +
      '<rect width="400" height="400" fill="url(#ht-' + uid + ')" opacity=".09"/>' +
      '<text x="24" y="376" font-family="Big Shoulders Display, Arial Narrow, sans-serif" font-weight="900" font-size="' + size + '" letter-spacing="-.5" fill="' + a.ink + '">' + title + '</text>' +
      '<text x="376" y="34" text-anchor="end" font-family="Space Mono, monospace" font-size="13" font-weight="700" fill="' + a.ink + '">MARIGOLD STATIC</text>' +
      '</svg>';
  }
  function paintCovers(root) {
    $$('[data-cover]', root).forEach(function (el) {
      var rel = getRelease(el.getAttribute('data-cover'));
      var label = el.getAttribute('data-cover-label');
      if (rel) el.innerHTML = cover(rel, { label: label === null ? undefined : label });
    });
  }

  // Merch mock-ups, drawn for the selected color.
  function productArt(p, colour) {
    var hex = colour ? colour.hex : '#15130f';
    var dark = /^#(15|2b)/.test(hex);
    var print = dark ? '#f4efe6' : '#15130f';
    var rel = p.release && getRelease(p.release);
    var sleeve = rel ? '<g transform="translate(70 90) scale(.65)">' + cover(rel, { label: '' }).replace('<svg ', '<svg width="400" height="400" ') + '</g>' : '';
    var bg = '<rect width="400" height="500" fill="#ebe4d6"/><circle cx="300" cy="120" r="86" fill="#ffcf33" opacity=".55"/>';
    var body;
    switch (p.kind) {
      case 'lp':
        body = '<g class="vinyl-disc"><circle cx="250" cy="220" r="128" fill="' + hex + '" stroke="#15130f" stroke-width="3"/>' +
          '<g fill="none" stroke="' + (dark ? '#f4efe6' : '#15130f') + '" stroke-opacity=".22">' + [118, 104, 90, 76, 62].map(function (r) { return '<circle cx="250" cy="220" r="' + r + '"/>'; }).join('') + '</g>' +
          '<circle cx="250" cy="220" r="34" fill="' + (rel ? rel.art.a : '#ff4d94') + '" stroke="#15130f" stroke-width="3"/><circle cx="250" cy="220" r="5" fill="#15130f"/></g>' +
          '<rect x="68" y="88" width="264" height="264" fill="#15130f" transform="translate(5 5)"/>' + sleeve +
          '<rect x="70" y="90" width="260" height="260" fill="none" stroke="#15130f" stroke-width="3"/>';
        break;
      case 'cd':
        body = '<circle cx="268" cy="240" r="100" fill="#d9d0bf" stroke="#15130f" stroke-width="3"/><circle cx="268" cy="240" r="16" fill="#ebe4d6" stroke="#15130f" stroke-width="3"/>' +
          '<rect x="73" y="125" width="238" height="238" fill="#15130f"/><g transform="translate(70 120) scale(.59)">' + (rel ? cover(rel, { label: '' }).replace('<svg ', '<svg width="400" height="400" ') : '') + '</g>' +
          '<rect x="70" y="120" width="236" height="236" fill="none" stroke="#15130f" stroke-width="3"/>';
        break;
      case 'cassette':
        body = '<g transform="rotate(-6 200 250)"><rect x="60" y="150" width="280" height="180" rx="14" fill="#ff4d94" stroke="#15130f" stroke-width="4"/>' +
          '<rect x="84" y="172" width="232" height="72" rx="6" fill="#f4efe6" stroke="#15130f" stroke-width="3"/>' +
          '<text x="100" y="204" font-family="Big Shoulders Display, Arial Narrow, sans-serif" font-weight="900" font-size="26" fill="#15130f">NIGHT BUS HYMNS</text><text x="100" y="228" font-family="Space Mono, monospace" font-size="12" fill="#15130f">MARIGOLD STATIC · SIDE A</text>' +
          '<rect x="128" y="262" width="144" height="46" rx="23" fill="#15130f"/><circle cx="152" cy="285" r="15" fill="#f4efe6"/><circle cx="248" cy="285" r="15" fill="#f4efe6"/></g>';
        break;
      case 'tee':
        body = '<path d="M130 110 L90 125 L50 190 L95 215 L115 185 L115 400 L285 400 L285 185 L305 215 L350 190 L310 125 L270 110 C258 135 232 146 200 146 C168 146 142 135 130 110Z" fill="' + hex + '" stroke="#15130f" stroke-width="4" stroke-linejoin="round"/>' +
          '<g' + (dark ? '' : ' style="mix-blend-mode:multiply"') + '><circle cx="200" cy="230" r="44" fill="#ff4d94"/><rect x="176" y="208" width="66" height="84" rx="33" fill="#2b3fd6" opacity=".85"/></g>' +
          '<text x="200" y="330" text-anchor="middle" font-family="Big Shoulders Display, Arial Narrow, sans-serif" font-weight="900" font-size="30" fill="' + print + '">GLASSHOUSE</text>';
        break;
      case 'hoodie':
        body = '<path d="M150 118 L96 136 Q72 146 64 176 L42 380 L88 388 L112 236 L112 420 L288 420 L288 236 L312 388 L358 380 L336 176 Q328 146 304 136 L250 118Z" fill="' + hex + '" stroke="#15130f" stroke-width="4" stroke-linejoin="round"/>' +
          '<path d="M146 122 C140 62 260 62 254 122 C244 150 156 150 146 122Z" fill="' + hex + '" stroke="#15130f" stroke-width="4" stroke-linejoin="round"/>' +
          '<path d="M164 122 C170 98 230 98 236 122" fill="none" stroke="' + print + '" stroke-opacity=".5" stroke-width="3"/>' +
          '<path d="M186 142 v42 M214 142 v42" stroke="' + print + '" stroke-width="3" stroke-linecap="round"/>' +
          '<path d="M146 336 H254 L270 404 H130Z" fill="none" stroke="' + print + '" stroke-opacity=".55" stroke-width="3" stroke-linejoin="round"/>' +
          '<circle cx="252" cy="206" r="20" fill="#ffcf33" stroke="#15130f" stroke-width="2"/>' +
          '<path d="M44 366 L88 372 M112 406 H288 M312 372 L356 366" stroke="' + print + '" stroke-opacity=".4" stroke-width="3"/>';
        break;
      case 'poster':
        body = '<g transform="rotate(3 200 250)"><rect x="95" y="60" width="210" height="300" fill="#15130f" transform="translate(6 6)"/><rect x="95" y="60" width="210" height="300" fill="#f4efe6" stroke="#15130f" stroke-width="3"/>' +
          '<circle cx="230" cy="150" r="58" fill="#ff4d94" style="mix-blend-mode:multiply"/><circle cx="180" cy="180" r="50" fill="#2b3fd6" style="mix-blend-mode:multiply" opacity=".9"/>' +
          '<text x="110" y="290" font-family="Big Shoulders Display, Arial Narrow, sans-serif" font-weight="900" font-size="34" fill="#15130f">MARIGOLD</text><text x="110" y="322" font-family="Big Shoulders Display, Arial Narrow, sans-serif" font-weight="900" font-size="34" fill="#15130f">STATIC</text>' +
          '<text x="110" y="344" font-family="Space Mono, monospace" font-size="10" fill="#15130f">TOUR ' + tourYearsText() + '</text></g>';
        break;
      case 'tote':
        body = '<path d="M150 170 C150 80 250 80 250 170" fill="none" stroke="#15130f" stroke-width="12"/><path d="M150 170 C150 80 250 80 250 170" fill="none" stroke="' + hex + '" stroke-width="6"/>' +
          '<rect x="90" y="160" width="220" height="250" fill="' + hex + '" stroke="#15130f" stroke-width="4"/>' +
          '<g stroke="#2b3fd6" stroke-width="7" stroke-linecap="round" fill="none"' + (dark ? '' : ' style="mix-blend-mode:multiply"') + '><path d="M120 300q20 -16 40 0t40 0t40 0t40 0"/><path d="M120 322q20 -16 40 0t40 0t40 0t40 0"/></g>' +
          '<circle cx="230" cy="240" r="34" fill="#ffcf33" stroke="#15130f" stroke-width="2"/><text x="200" y="384" text-anchor="middle" font-family="Big Shoulders Display, Arial Narrow, sans-serif" font-weight="900" font-size="24" fill="' + print + '">WEATHER FOR TWO</text>';
        break;
      default: // pins
        body = '<rect x="80" y="110" width="240" height="300" rx="10" fill="#f4efe6" stroke="#15130f" stroke-width="3"/>' +
          '<circle cx="200" cy="190" r="44" fill="#ffcf33" stroke="#15130f" stroke-width="5"/>' +
          '<path d="M118 330 a28 28 0 0 1 28 -34 a36 36 0 0 1 66 8 a22 22 0 0 1 2 44 h-80 a22 22 0 0 1 -16 -18Z" fill="#c9cff7" stroke="#15130f" stroke-width="5"/>' +
          '<rect x="226" y="290" width="76" height="46" rx="10" fill="#ff4d94" stroke="#15130f" stroke-width="5"/><circle cx="244" cy="342" r="7" fill="#15130f"/><circle cx="284" cy="342" r="7" fill="#15130f"/>';
    }
    return '<svg viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + esc(p.name + (colour ? ', ' + colour.name : '')) + '" focusable="false">' + bg + body + '</svg>';
  }

  /* ------------------------------------------------------------------
   * 4. Audio. Each track's preview is a short piece of music synthesized in the browser (a pad, bass,
   * arpeggio and drums in a key, tempo and chord progression picked from the track id), encoded as
   * a WAV file and played with a normal <audio> element. Nothing is downloaded.
   * ------------------------------------------------------------------ */
  var TRACKS = [];
  RELEASES.forEach(function (rel) {
    rel.tracks.forEach(function (t, i) {
      t.id = rel.id + '-' + (i + 1);
      t.n = i + 1;
      t.release = rel;
      TRACKS.push(t);
    });
  });
  function getTrack(id) { return TRACKS.filter(function (t) { return t.id === id; })[0]; }
  function playable(t) { return isOut(t.release) || !!t.early; }

  var Synth = (function () {
    var RATE = 22050, LENGTH = 30;
    var MAJOR = [0, 2, 4, 5, 7, 9, 11], MINOR = [0, 2, 3, 5, 7, 8, 10];
    var PROGS = [[0, 5, 3, 4], [0, 3, 4, 4], [0, 4, 5, 3], [5, 3, 0, 4], [0, 2, 3, 4], [0, 5, 2, 3]];
    var cache = {};
    function hz(m) { return 440 * Math.pow(2, (m - 69) / 12); }
    function chord(root, scale, deg) {
      return [0, 2, 4].map(function (k) { var d = deg + k; return root + scale[d % 7] + 12 * Math.floor(d / 7); });
    }
    // A sine lookup table and running phases keep rendering fast (about 30 seconds of audio in well
    // under a quarter of a second on a phone).
    var TABLE = 4096, SINE = new Float32Array(TABLE + 1);
    for (var q = 0; q <= TABLE; q++) SINE[q] = Math.sin(q / TABLE * Math.PI * 2);
    function osc(ph) { return SINE[(ph * TABLE) | 0]; }
    function render(track) {
      var rnd = seeded(hash(track.id));
      var root = 45 + Math.floor(rnd() * 9);
      var scale = rnd() < 0.55 ? MAJOR : MINOR;
      var prog = PROGS[Math.floor(rnd() * PROGS.length)];
      var bpm = 84 + Math.floor(rnd() * 40);
      var beat = 60 / bpm, barLen = beat * 4, step = beat / 2;
      var arp = [0, 1, 2, 1, 2, 0, 1, 2].map(function (v) { return rnd() < 0.3 ? (v + 1) % 3 : v; });
      var chords = prog.map(function (d) { return chord(root, scale, d).map(hz); });
      var n = RATE * LENGTH, out = new Float32Array(n), dt = 1 / RATE, noise = seeded(hash(track.id + 'n'));
      var ph = new Float32Array(9); // pad x6, arpeggio x2, bass
      var aEnv = 0, bEnv = 0, kEnv = 0, kPh = 0, sEnv = 0, hEnv = 0;
      var aDec = Math.exp(-7 * dt), bDec = Math.exp(-3.2 * dt), kDec = Math.exp(-9 * dt), sDec = Math.exp(-22 * dt), hDec = Math.exp(-60 * dt);
      var lastStep = -1, lastBeat = -1, lastHalf = -1, kT = 0;
      for (var i = 0; i < n; i++) {
        var t = i * dt;
        var bar = Math.floor(t / barLen), tb = t - bar * barLen, ch = chords[bar % 4];
        // Pad: three sines plus slightly detuned copies, faded in and out with each bar.
        var penv = Math.min(1, tb / 0.35) * Math.min(1, (barLen - tb) / 0.12), pad = 0;
        for (var k = 0; k < 3; k++) {
          ph[k] = (ph[k] + ch[k] * dt) % 1;
          ph[k + 3] = (ph[k + 3] + ch[k] * 1.004 * dt) % 1;
          pad += osc(ph[k]) + 0.5 * osc(ph[k + 3]);
        }
        pad *= 0.055 * penv;
        // Arpeggio an octave up on eighth notes.
        var si = Math.floor(t / step);
        if (si !== lastStep) { lastStep = si; aEnv = 1; }
        aEnv *= aDec;
        var af = ch[arp[si % 8]] * 2;
        ph[6] = (ph[6] + af * dt) % 1;
        ph[7] = (ph[7] + af * 2 * dt) % 1;
        var arpS = (osc(ph[6]) + 0.25 * osc(ph[7])) * 0.11 * aEnv * (bar >= 1 ? 1 : 0.4);
        // Bass on every beat; drums join after two bars (kick on 1 and 3, snare-ish noise on 2 and 4, off-beat hats).
        var bi = Math.floor(t / beat);
        if (bi !== lastBeat) {
          lastBeat = bi; bEnv = 1;
          if (bar >= 2 && bi % 2 === 0) { kEnv = 1; kT = 0; }
          if (bar >= 2 && bi % 2 === 1) sEnv = 1;
        }
        bEnv *= bDec;
        ph[8] = (ph[8] + ch[0] / 2 * dt) % 1;
        var bass = osc(ph[8]) * 0.2 * bEnv;
        var hi = Math.floor(t / beat - 0.5);
        if (hi !== lastHalf) { lastHalf = hi; if (bar >= 2) hEnv = 1; }
        kT += dt; kEnv *= kDec; sEnv *= sDec; hEnv *= hDec;
        kPh = (kPh + (48 + 90 * Math.max(0, 1 - kT * 18)) * dt) % 1;
        var drums = osc(kPh) * kEnv * 0.42 + (noise() * 2 - 1) * (sEnv * 0.07 + hEnv * 0.045);
        var fade = Math.min(1, t / 1.2) * Math.min(1, (LENGTH - t) / 2.5);
        var v = (pad + arpS + bass + drums) * fade * 1.4;
        out[i] = (v > 1 ? 1 : v < -1 ? -1 : v - v * v * v / 3 * 0.5) * 0.8;
      }
      return out;
    }
    function wav(samples) {
      var buf = new ArrayBuffer(44 + samples.length * 2), v = new DataView(buf);
      function str(o, s) { for (var i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); }
      str(0, 'RIFF'); v.setUint32(4, 36 + samples.length * 2, true); str(8, 'WAVE'); str(12, 'fmt ');
      v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, RATE, true);
      v.setUint32(28, RATE * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); str(36, 'data');
      v.setUint32(40, samples.length * 2, true);
      for (var i = 0; i < samples.length; i++) v.setInt16(44 + i * 2, clamp(samples[i], -1, 1) * 0x7fff, true);
      return new Blob([buf], { type: 'audio/wav' });
    }
    return {
      url: function (track) {
        if (track.src) return track.src;
        if (!cache[track.id]) cache[track.id] = URL.createObjectURL(wav(render(track)));
        return cache[track.id];
      }
    };
  })();

  var Player = (function () {
    var audio = null, subs = [];
    var state = { queue: [], index: -1, playing: false, muted: false };
    function emit(type) { subs.forEach(function (fn) { fn(type); }); }
    function current() { return state.queue[state.index] || null; }
    function ensureAudio() {
      if (audio) return audio;
      audio = new Audio();
      audio.preload = 'auto';
      audio.addEventListener('timeupdate', function () { emit('time'); });
      audio.addEventListener('loadedmetadata', function () { emit('time'); });
      audio.addEventListener('play', function () { state.playing = true; emit('state'); });
      audio.addEventListener('pause', function () { state.playing = false; emit('state'); });
      audio.addEventListener('ended', function () {
        if (state.index < state.queue.length - 1) go(state.index + 1, true);
        else { state.playing = false; audio.currentTime = 0; emit('state'); }
      });
      audio.addEventListener('error', function () { state.playing = false; emit('state'); toast('This track could not be loaded.'); });
      return audio;
    }
    function go(index, autoplay) {
      var t = state.queue[index];
      if (!t) return;
      state.index = index;
      ensureAudio();
      audio.src = Synth.url(t);
      audio.muted = state.muted;
      emit('track');
      if (autoplay) play();
      if ('mediaSession' in navigator && window.MediaMetadata) {
        navigator.mediaSession.metadata = new window.MediaMetadata({ title: t.title, artist: BAND.name, album: t.release.title });
      }
    }
    function play() {
      if (!audio || !current()) return;
      var p = audio.play();
      if (p && p.catch) p.catch(function () { state.playing = false; emit('state'); });
    }
    function pause() { if (audio) audio.pause(); }
    var api = {
      state: state,
      current: current,
      on: function (fn) { subs.push(fn); },
      // Load a list of tracks and start at the given one.
      load: function (tracks, startId, autoplay) {
        state.queue = tracks.filter(playable);
        var i = state.queue.map(function (t) { return t.id; }).indexOf(startId);
        go(i < 0 ? 0 : i, autoplay !== false);
      },
      toggle: function () { if (!current()) return; if (state.playing) pause(); else play(); },
      play: play,
      pause: pause,
      next: function () { if (state.index < state.queue.length - 1) go(state.index + 1, state.playing); },
      prev: function () {
        if (audio && audio.currentTime > 3) { audio.currentTime = 0; return; }
        if (state.index > 0) go(state.index - 1, state.playing);
        else if (audio) audio.currentTime = 0;
      },
      seek: function (s) { if (audio && isFinite(audio.duration)) audio.currentTime = clamp(s, 0, audio.duration); },
      skip: function (d) { if (audio) api.seek(audio.currentTime + d); },
      time: function () { return audio ? audio.currentTime : 0; },
      duration: function () { return audio && isFinite(audio.duration) ? audio.duration : 30; },
      toggleMute: function () { state.muted = !state.muted; if (audio) audio.muted = state.muted; emit('state'); },
      close: function () {
        pause();
        state.queue = []; state.index = -1;
        if (audio) { audio.removeAttribute('src'); audio.load(); }
        emit('track');
      }
    };
    if ('mediaSession' in navigator) {
      try {
        navigator.mediaSession.setActionHandler('play', play);
        navigator.mediaSession.setActionHandler('pause', pause);
        navigator.mediaSession.setActionHandler('nexttrack', api.next);
        navigator.mediaSession.setActionHandler('previoustrack', api.prev);
      } catch (e) { /* unsupported action */ }
    }
    return api;
  })();

  /* ------------------------------------------------------------------
   * 5. Player interfaces
   * ------------------------------------------------------------------ */
  var ICON_PLAY = '<svg viewBox="0 0 24 24" class="i-play" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.6-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z"/></svg>';
  var ICON_PAUSE = '<svg viewBox="0 0 24 24" class="i-pause" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4.2" height="14" rx="1.2"/><rect x="13.8" y="5" width="4.2" height="14" rx="1.2"/></svg>';
  var EQ = '<span class="eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span>';

  // A track button's name: "Play 01: Title", so it includes the number the button shows.
  function trackLabel(t, playing) { return (playing ? 'Pause ' : 'Play ') + pad(t.n) + ': ' + t.title; }
  // A row in a track list: numbered button that turns into play/pause, title and length.
  function trackRow(t) {
    var can = playable(t);
    return '<li class="track" data-track-row="' + t.id + '">' +
      '<button type="button" class="track-btn" data-track="' + t.id + '" aria-pressed="false" aria-label="' + esc(trackLabel(t, false)) + '"' + (can ? '' : ' disabled aria-describedby="locked-' + t.id + '"') + '>' +
      '<span class="num" aria-hidden="true">' + pad(t.n) + '</span>' + ICON_PLAY + ICON_PAUSE + '</button>' +
      '<div class="min-w-0"><p class="track-title truncate font-bold">' + esc(t.title) + '</p>' +
      (can ? '<p class="flex items-center gap-2 text-sm opacity-80"><span data-now-label hidden>' + EQ + ' Now playing</span><span data-preview-label>30-second preview</span></p>'
        : '<p id="locked-' + t.id + '" class="text-sm opacity-80">Out ' + esc(fmtDate(t.release.date, { day: 'numeric', month: 'long' })) + '</p>') + '</div>' +
      '<span class="font-mono text-sm opacity-80"><span class="sr-only">Length </span>' + t.len + '</span></li>';
  }
  function trackList(rel) { return '<ol class="mt-2" aria-label="Track list for ' + esc(rel.title) + '">' + rel.tracks.map(trackRow).join('') + '</ol>'; }

  function syncPlayState() {
    var cur = Player.current(), playing = Player.state.playing;
    $$('[data-track]').forEach(function (b) {
      var mine = !!cur && cur.id === b.getAttribute('data-track');
      var t = getTrack(b.getAttribute('data-track'));
      b.setAttribute('aria-pressed', String(mine && playing));
      b.classList.toggle('is-loaded', mine);
      if (t) b.setAttribute('aria-label', trackLabel(t, mine && playing));
      var row = b.closest('[data-track-row]');
      if (row) {
        if (mine) row.setAttribute('aria-current', 'true'); else row.removeAttribute('aria-current');
        row.classList.toggle('is-playing', mine && playing);
        var now = $('[data-now-label]', row), prev = $('[data-preview-label]', row);
        if (now) now.hidden = !mine;
        if (prev) prev.hidden = mine;
      }
    });
    $$('[data-play-release]').forEach(function (b) {
      var rel = getRelease(b.getAttribute('data-play-release'));
      var mine = !!cur && cur.release === rel && !b.hasAttribute('data-play-track');
      var track = b.getAttribute('data-play-track');
      if (track) mine = !!cur && cur.id === track;
      var on = mine && playing;
      b.setAttribute('aria-pressed', String(on));
      var label = $('[data-label]', b);
      if (label) label.textContent = on ? 'Pause' : (b.getAttribute('data-label-play') || 'Play');
      $$('.i-play', b).forEach(function (i) { i.classList.toggle('hidden', on); });
      $$('.i-pause', b).forEach(function (i) { i.classList.toggle('hidden', !on); });
    });
    $$('[data-playing-when]').forEach(function (el) {
      var id = el.getAttribute('data-playing-when');
      el.classList.toggle('is-playing', !!cur && playing && (cur.release.id === id || cur.id === id));
    });
  }

  function initPlayerBar() {
    var bar = $('#player');
    if (!bar) return;
    var seek = $('[data-seek]', bar), status = $('#player-status');
    var shown = false;
    function show(on) {
      if (on === shown) return;
      shown = on;
      document.documentElement.classList.toggle('has-player', on);
      if (on) {
        bar.hidden = false;
        requestAnimationFrame(function () { requestAnimationFrame(function () { bar.classList.remove('is-tucked'); }); });
      } else {
        bar.classList.add('is-tucked');
        setTimeout(function () { if (!shown) bar.hidden = true; }, reduceMotion ? 0 : 360);
      }
    }
    function renderTime() {
      var t = Player.time(), d = Player.duration();
      seek.max = String(Math.round(d));
      seek.value = String(Math.floor(t));
      seek.style.setProperty('--v', (t / d * 100).toFixed(2) + '%');
      seek.setAttribute('aria-valuetext', clock(t) + ' of ' + clock(d));
      $('[data-cur]', bar).textContent = clock(t);
      $('[data-dur]', bar).textContent = clock(d);
    }
    function renderTrack() {
      var t = Player.current();
      show(!!t);
      if (!t) return;
      $('[data-np-title]', bar).textContent = t.title;
      $('[data-np-release]', bar).textContent = t.release.title + ' · ' + TYPES[t.release.type];
      $('[data-np-cover]', bar).innerHTML = cover(t.release, { uid: '-np', label: '' });
      $('[data-act="prev"]', bar).disabled = false;
      $('[data-act="next"]', bar).disabled = Player.state.index >= Player.state.queue.length - 1;
      status.textContent = 'Now playing: ' + t.title + ' from ' + t.release.title + ' (30-second preview)';
      renderTime();
    }
    function renderState() {
      var on = Player.state.playing;
      var btn = $('[data-act="toggle"]', bar);
      btn.setAttribute('aria-label', on ? 'Pause' : 'Play');
      $('.i-play', btn).classList.toggle('hidden', on);
      $('.i-pause', btn).classList.toggle('hidden', !on);
      bar.classList.toggle('is-playing', on);
      var mute = $('[data-act="mute"]', bar);
      mute.setAttribute('aria-pressed', String(Player.state.muted));
      $('[data-icon-sound]', mute).classList.toggle('hidden', Player.state.muted);
      $('[data-icon-muted]', mute).classList.toggle('hidden', !Player.state.muted);
    }
    bar.addEventListener('click', function (e) {
      var b = e.target.closest('[data-act]');
      if (!b) return;
      var act = b.getAttribute('data-act');
      if (act === 'toggle') Player.toggle();
      else if (act === 'next') Player.next();
      else if (act === 'prev') Player.prev();
      else if (act === 'mute') Player.toggleMute();
      else if (act === 'close') { Player.close(); var main = $('#main'); if (main) main.focus({ preventScroll: true }); }
    });
    seek.addEventListener('input', function () { Player.seek(Number(seek.value)); });
    Player.on(function (type) {
      if (type === 'time') renderTime();
      else if (type === 'track') { renderTrack(); renderState(); }
      else renderState();
      if (type !== 'time') syncPlayState();
    });
  }

  function initTrackButtons() {
    document.addEventListener('click', function (e) {
      var b = e.target.closest('[data-track], [data-play-release]');
      if (!b || b.disabled) return;
      var id = b.getAttribute('data-track') || b.getAttribute('data-play-track');
      var rel = getRelease(b.getAttribute('data-play-release')) || (id && getTrack(id).release);
      var cur = Player.current();
      if (id ? (cur && cur.id === id) : (cur && cur.release === rel)) { Player.toggle(); return; }
      var first = id || (rel.tracks.filter(playable)[0] || {}).id;
      if (!first) { toast(rel.title + ' is out ' + fmtDate(rel.date) + '.'); return; }
      Player.load(rel.tracks, first, true);
    });
    // Space or K plays and pauses; Shift+N / Shift+P skip tracks. Ignored while typing or on a control.
    document.addEventListener('keydown', function (e) {
      if (!Player.current() || e.ctrlKey || e.metaKey || e.altKey) return;
      var tag = (e.target.tagName || '').toLowerCase();
      if (/^(input|textarea|select|button|a|summary)$/.test(tag) || e.target.isContentEditable) return;
      if (e.key === ' ' || e.key === 'k' || e.key === 'K') { e.preventDefault(); Player.toggle(); }
      else if (e.shiftKey && (e.key === 'N' || e.key === 'n')) Player.next();
      else if (e.shiftKey && (e.key === 'P' || e.key === 'p')) Player.prev();
    });
  }

  /* ------------------------------------------------------------------
   * 6. Home page
   * ------------------------------------------------------------------ */
  function newRelease() { return RELEASES[0]; }
  function initRelease() {
    var rel = newRelease();
    // Countdown to the release date, or the "out now" state once it's out.
    var cd = $('[data-countdown]');
    $$('[data-release-state]').forEach(function (el) { el.hidden = el.getAttribute('data-release-state') !== (isOut(rel) ? 'out' : 'soon'); });
    $$('[data-release-date]').forEach(function (el) { el.textContent = fmtDate(rel.date, { weekday: 'long', day: 'numeric', month: 'long' }); });
    if (cd && !isOut(rel)) {
      var target = parseDate(rel.date).getTime();
      var tick = function () {
        var left = Math.max(0, target - Date.now());
        var d = Math.floor(left / 864e5), h = Math.floor(left / 36e5) % 24, m = Math.floor(left / 6e4) % 60, s = Math.floor(left / 1e3) % 60;
        $('[data-cd="d"]', cd).textContent = d;
        $('[data-cd="h"]', cd).textContent = pad(h);
        $('[data-cd="m"]', cd).textContent = pad(m);
        $('[data-cd="s"]', cd).textContent = pad(s);
        if (!left) { clearInterval(timer); initRelease(); }
      };
      var timer = setInterval(tick, 1000);
      tick();
      cd.setAttribute('aria-label', 'Out in ' + Math.ceil((target - Date.now()) / 864e5) + ' days');
    }
    // Pre-save: remembered in localStorage (tempo-presave). Connect it to your pre-save service link.
    $$('[data-presave]').forEach(function (b) {
      function render() {
        var on = !!readJSON('tempo-presave', false);
        b.setAttribute('aria-pressed', String(on));
        $('[data-label]', b).textContent = on ? 'Pre-saved' : 'Pre-save the album';
      }
      b.addEventListener('click', function () {
        var on = !readJSON('tempo-presave', false);
        writeJSON('tempo-presave', on);
        render();
        toast(on ? 'Pre-saved. It’ll be in your library on ' + fmtDate(rel.date, { day: 'numeric', month: 'long' }) + '.' : 'Pre-save removed.');
      });
      render();
    });
    // Track list for the new album on the home page.
    var list = $('[data-new-tracklist]');
    if (list) { list.innerHTML = trackList(rel); syncPlayState(); }
  }

  function showRow(s, compact) {
    var d = parseDate(s.date);
    var dow = d.toLocaleDateString(BAND.locale, { weekday: 'short' });
    var mon = d.toLocaleDateString(BAND.locale, { month: 'short' });
    var status = {
      'on-sale': '',
      low: '<span class="chip chip-sun">Last tickets</span>',
      'sold-out': '<span class="chip chip-ink">Sold out</span>',
      soon: s.onSale ? '<span class="chip chip-paper">On sale ' + esc(fmtDate(s.onSale, { day: 'numeric', month: 'short' })) + '</span>' : '<span class="chip chip-paper">On sale soon</span>'
    }[s.status];
    var label = s.city + ', ' + fmtDate(s.date);
    var action = s.status === 'sold-out'
      ? '<a href="tour.html?notify=' + encodeURIComponent(s.id) + '#notify" class="btn-ghost btn-sm" aria-label="Join the waitlist for ' + esc(label) + '">Waitlist</a>'
      : s.status === 'soon'
        ? '<a href="tour.html?notify=' + encodeURIComponent(s.id) + '#notify" class="btn-ghost btn-sm" aria-label="Remind me: ' + esc(label) + '">Remind me</a>'
        : '<a href="' + esc(ticketUrl(s)) + '" class="btn-primary btn-sm" aria-label="Tickets for ' + esc(label) + '">Tickets</a>';
    return '<li class="show-row' + (s.status === 'sold-out' ? ' is-sold' : '') + '">' +
      '<div class="show-date" aria-hidden="true"><span class="font-mono text-[0.68rem] font-bold uppercase">' + esc(dow) + '</span><span class="font-display text-[2.1rem] font-black">' + d.getDate() + '</span><span class="font-mono text-[0.68rem] font-bold uppercase">' + esc(mon) + '</span></div>' +
      '<div class="min-w-0"><p class="sr-only">' + esc(fmtDate(s.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })) + '</p>' +
      '<h3 class="font-display text-[1.9rem] leading-none font-extrabold uppercase sm:text-[2.2rem]">' + esc(s.city) + '</h3>' +
      '<p class="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-soft"><span class="font-bold text-ink">' + esc(s.venue) + '</span><span>' + esc(s.country) + '</span>' + status + (s.note ? '<span class="chip chip-pink">' + esc(s.note) + '</span>' : '') + '</p>' +
      (compact ? '' : '<p class="mt-1 text-sm text-subtle">Doors ' + esc(doorsTime(s.time)) + ' · with ' + esc(s.support) + '</p>') + '</div>' +
      '<div class="show-actions">' + (compact ? '' : '<button type="button" class="btn-ghost btn-sm" data-ics="' + esc(s.id) + '" aria-label="Add ' + esc(label) + ' to your calendar"><svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4M12 13v4M10 15h4"/></svg>Calendar</button>') + action + '</div></li>';
  }

  function initHome() {
    var next = $('[data-next-shows]');
    if (next) {
      var list = upcomingShows().slice(0, 4);
      next.innerHTML = list.length ? list.map(function (s) { return showRow(s, true); }).join('') : '<li class="py-8 text-soft">No dates on sale right now. Sign up below and you’ll hear first.</li>';
    }
    var merch = $('[data-merch-preview]');
    if (merch) {
      merch.innerHTML = ['wft-lp', 'glasshouse-tee', 'tour-poster'].map(getProduct).map(function (p) {
        var c = p.colours && p.colours[0];
        return '<li class="reveal"><a href="merch.html#p-' + p.id + '" class="group block">' +
          '<div class="card card-shadow overflow-hidden transition duration-300 group-hover:-translate-y-1"><div class="aspect-[4/5] [&>svg]:h-full [&>svg]:w-full">' + productArt(p, c) + '</div></div>' +
          '<div class="mt-4 flex items-baseline justify-between gap-3"><h3 class="font-display text-2xl leading-none font-extrabold uppercase">' + esc(p.name) + '</h3><span class="font-mono text-sm font-bold">' + money(p.price) + '</span></div>' +
          (p.badge ? '<p class="mt-2"><span class="chip chip-pink">' + esc(p.badge) + '</span></p>' : '') + '</a></li>';
      }).join('');
    }
    initVideo();
  }

  // Click-to-play video poster. Nothing third-party loads until a visitor presses play, and in the
  // demo (no data-video-embed set) a built-in visualiser plays the single's preview instead.
  function initVideo() {
    var box = $('[data-video]');
    if (!box) return;
    var btn = $('[data-video-play]', box), label = btn.getAttribute('aria-label');
    Player.on(function (type) {
      if (type === 'time' || !box.classList.contains('is-started')) return;
      var cur = Player.current(), on = !!cur && Player.state.playing && cur.release.id === box.getAttribute('data-video-release');
      btn.setAttribute('aria-label', on ? 'Pause the demo video' : label);
      box.classList.toggle('is-playing', on);
    });
    btn.addEventListener('click', function () {
      var src = box.getAttribute('data-video-embed');
      if (src) {
        var f = document.createElement('iframe');
        f.src = src + (src.indexOf('?') < 0 ? '?' : '&') + 'autoplay=1';
        f.title = box.getAttribute('data-video-title') || 'Video';
        f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
        f.className = 'absolute inset-0 h-full w-full';
        $('[data-video-stage]', box).replaceChildren(f);
        f.focus();
        return;
      }
      box.classList.add('is-started');
      $('[data-video-note]').hidden = false;
      var rel = getRelease(box.getAttribute('data-video-release'));
      var cur = Player.current();
      if (cur && cur.release === rel) Player.toggle();
      else Player.load(rel.tracks, rel.tracks[0].id, true);
    });
  }

  /* ------------------------------------------------------------------
   * 7. Music page
   * ------------------------------------------------------------------ */
  function initMusic() {
    var grid = $('[data-release-grid]');
    if (!grid) return;
    var detail = $('[data-release-detail]');
    var params = new URLSearchParams(location.search);
    var type = TYPES[params.get('type')] ? params.get('type') : 'all';
    var released = RELEASES.filter(isOut);
    var selected = getRelease(params.get('release')) || released.filter(function (r) { return r.type === 'album'; })[0] || RELEASES[0];

    function updateUrl() {
      var q = new URLSearchParams();
      if (type !== 'all') q.set('type', type);
      q.set('release', selected.id);
      history.replaceState(null, '', location.pathname + '?' + q.toString() + location.hash);
    }
    function card(r) {
      var out = isOut(r);
      return '<li class="rel-card reveal">' +
        '<a href="music.html?release=' + r.id + '#release" data-open-release="' + r.id + '" class="cover card-shadow"><span class="sr-only">' + esc(r.title) + ', ' + TYPES[r.type] + ': show tracks</span>' + cover(r, { uid: '-g', label: '' }) + '</a>' +
        '<div class="mt-4 flex flex-wrap items-center gap-2"><span class="chip ' + (r.type === 'album' ? 'chip-pink' : r.type === 'ep' ? 'chip-sun' : 'chip-paper') + '">' + TYPES[r.type] + '</span>' +
        '<span class="meta">' + (out ? parseDate(r.date).getFullYear() : 'Out ' + esc(fmtDate(r.date, { day: 'numeric', month: 'short' }))) + '</span></div>' +
        '<h3 class="mt-2 font-display text-[1.8rem] leading-none font-extrabold uppercase"><a href="music.html?release=' + r.id + '#release" data-open-release="' + r.id + '" class="hover:text-pink-deep">' + esc(r.title) + '</a></h3>' +
        '<p class="mt-1.5 text-sm text-soft">' + r.tracks.length + ' tracks · ' + minutes(r) + ' min</p></li>';
    }
    function renderGrid() {
      var list = RELEASES.filter(function (r) { return type === 'all' || r.type === type; });
      grid.innerHTML = list.map(card).join('');
      $$('[data-type-filter]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-type-filter') === type)); });
      $('[data-release-count]').textContent = list.length + (list.length === 1 ? ' release' : ' releases');
      revealNow(grid);
    }
    function renderDetail(focus) {
      var r = selected, out = isOut(r), i = RELEASES.indexOf(r);
      var prev = RELEASES[i + 1], next = RELEASES[i - 1];
      var buy = r.merch && getProduct(r.merch);
      var hasPlayable = r.tracks.some(playable);
      detail.innerHTML =
        '<div class="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">' +
        '<div class="min-w-0 lg:sticky lg:top-28 lg:self-start"><div class="cover card-shadow">' + cover(r, { uid: '-d' }) + '</div>' +
        '<dl class="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 text-sm">' +
        '<div><dt class="meta">Released</dt><dd class="mt-1 font-bold">' + (out ? '' : 'Out ') + esc(fmtDate(r.date)) + '</dd></div>' +
        '<div><dt class="meta">Format</dt><dd class="mt-1 font-bold">' + TYPES[r.type] + ' · ' + r.tracks.length + ' tracks</dd></div>' +
        '<div><dt class="meta">Label</dt><dd class="mt-1 font-bold">' + esc(r.label) + '</dd></div>' +
        '<div><dt class="meta">Catalog</dt><dd class="mt-1 font-mono font-bold">' + esc(r.cat) + '</dd></div></dl></div>' +
        '<div class="min-w-0"><p class="eyebrow">' + TYPES[r.type] + ' · ' + (out ? parseDate(r.date).getFullYear() : 'Out ' + esc(fmtDate(r.date, { day: 'numeric', month: 'long' }))) + '</p>' +
        '<h2 id="release-title" tabindex="-1" class="h-section mt-4 focus:outline-none">' + esc(r.title) + '</h2>' +
        '<p class="lead mt-5 max-w-2xl">' + esc(r.blurb) + '</p>' +
        '<div class="mt-7 flex flex-wrap gap-3">' +
        (hasPlayable ? '<button type="button" class="btn-primary btn-lg" data-play-release="' + r.id + '" aria-pressed="false" data-label-play="' + (out ? 'Play ' + (r.type === 'ep' ? 'EP' : TYPES[r.type].toLowerCase()) : 'Play the single') + '">' + ICON_PLAY.replace('class="i-play"', 'class="i-play h-5 w-5"') + ICON_PAUSE.replace('class="i-pause"', 'class="i-pause hidden h-5 w-5"') + '<span data-label>' + (out ? 'Play ' + (r.type === 'ep' ? 'EP' : TYPES[r.type].toLowerCase()) : 'Play the single') + '</span></button>' : '') +
        (buy ? '<a href="merch.html#p-' + buy.id + '" class="btn-ghost btn-lg">' + (out ? 'Buy ' : 'Pre-order ') + esc(buy.kind === 'lp' ? 'the vinyl' : buy.kind === 'cassette' ? 'the cassette' : 'merch') + '</a>' : '') +
        '<button type="button" class="btn-ghost btn-lg" data-share-release>Copy link</button></div>' +
        '<div class="mt-10 flex items-baseline justify-between gap-4 border-b-2 border-ink pb-3"><h3 class="font-display text-2xl font-extrabold uppercase">Track list</h3><span class="meta">' + minutes(r) + ' min</span></div>' +
        trackList(r) +
        '<p class="mt-6 text-sm leading-relaxed text-subtle">' + esc(r.credits) + '</p>' +
        '<nav class="mt-10 flex flex-wrap justify-between gap-3 border-t-2 border-ink pt-6" aria-label="More releases">' +
        (prev ? '<a href="music.html?release=' + prev.id + '#release" data-open-release="' + prev.id + '" class="btn-ghost btn-sm"><span aria-hidden="true">←</span> ' + esc(prev.title) + '</a>' : '<span></span>') +
        (next ? '<a href="music.html?release=' + next.id + '#release" data-open-release="' + next.id + '" class="btn-ghost btn-sm">' + esc(next.title) + ' <span aria-hidden="true">→</span></a>' : '') +
        '</nav></div></div>';
      syncPlayState();
      if (focus) {
        $('#release').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        $('#release-title').focus({ preventScroll: true });
      }
    }
    $$('[data-type-filter]').forEach(function (b) {
      b.addEventListener('click', function () { type = b.getAttribute('data-type-filter'); renderGrid(); updateUrl(); });
    });
    document.addEventListener('click', function (e) {
      var a = e.target.closest('[data-open-release]');
      if (a) {
        e.preventDefault();
        selected = getRelease(a.getAttribute('data-open-release'));
        renderDetail(true);
        updateUrl();
        return;
      }
      if (e.target.closest('[data-share-release]')) {
        var url = location.href.split('#')[0] + '#release';
        copyText(url, function (ok) { toast(ok ? 'Link to ' + selected.title + ' copied.' : 'Copy the address from the address bar.'); });
      }
    });
    // Counts on the filter buttons.
    $$('[data-type-count]').forEach(function (el) {
      var t = el.getAttribute('data-type-count');
      el.textContent = RELEASES.filter(function (r) { return t === 'all' || r.type === t; }).length;
    });
    renderGrid();
    renderDetail(false);
    if (params.get('release') && location.hash === '#release') setTimeout(function () { $('#release').scrollIntoView(); }, 0);
  }

  /* ------------------------------------------------------------------
   * 8. Tour page
   * ------------------------------------------------------------------ */
  function icsFor(s) {
    function e(v) { return String(v).replace(/\\/g, '\\\\').replace(/([,;])/g, '\\$1').replace(/\n/g, '\\n'); }
    var start = s.date.replace(/-/g, '') + 'T' + s.time.replace(':', '') + '00';
    var end = s.date.replace(/-/g, '') + 'T230000';
    var stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
    return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//' + BAND.name + '//Tour//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'BEGIN:VEVENT',
      'UID:' + s.id + '-' + s.date + '@' + BAND.site.replace(/^https?:\/\//, ''),
      'DTSTAMP:' + stamp, 'DTSTART:' + start, 'DTEND:' + end,
      'SUMMARY:' + e(BAND.name + ' at ' + s.venue),
      'LOCATION:' + e(s.venue + ', ' + s.city + ', ' + s.country),
      'DESCRIPTION:' + e('Doors ' + doorsTime(s.time) + '. Support from ' + s.support + '. Tickets: ' + ticketUrl(s)),
      'URL:' + ticketUrl(s), 'END:VEVENT', 'END:VCALENDAR'].join('\r\n') + '\r\n';
  }
  function initIcs() {
    document.addEventListener('click', function (e) {
      var b = e.target.closest('[data-ics]');
      if (!b) return;
      var s = TOUR.filter(function (x) { return x.id === b.getAttribute('data-ics'); })[0];
      if (!s) return;
      download('marigold-static-' + s.id + '-' + s.date + '.ics', icsFor(s), 'text/calendar;charset=utf-8');
      toast('Calendar file for ' + s.city + ' downloaded.');
    });
  }

  function initTour() {
    var list = $('[data-tour-list]');
    if (!list) return;
    var regionBtns = $$('[data-region]'), countrySel = $('#tour-country'), count = $('[data-tour-count]'), empty = $('[data-tour-empty]');
    var params = new URLSearchParams(location.search);
    var region = REGIONS.some(function (r) { return r.id === params.get('region'); }) ? params.get('region') : 'all';
    var country = params.get('country') || '';
    var shows = upcomingShows();

    function countries() {
      var seen = {};
      return shows.filter(function (s) { return region === 'all' || s.region === region; })
        .map(function (s) { return s.country; }).filter(function (c) { if (seen[c]) return false; seen[c] = 1; return true; }).sort();
    }
    function fillCountries() {
      var cs = countries();
      if (cs.indexOf(country) < 0) country = '';
      countrySel.innerHTML = '<option value="">All countries</option>' + cs.map(function (c) { return '<option' + (c === country ? ' selected' : '') + '>' + esc(c) + '</option>'; }).join('');
    }
    function render() {
      var res = shows.filter(function (s) { return (region === 'all' || s.region === region) && (!country || s.country === country); });
      list.innerHTML = res.map(function (s) { return showRow(s, false); }).join('');
      empty.hidden = res.length > 0;
      count.textContent = res.length + (res.length === 1 ? ' date' : ' dates') + (region !== 'all' ? ' in ' + REGIONS.filter(function (r) { return r.id === region; })[0].label : '') + (country ? ', ' + country : '');
      regionBtns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-region') === region)); });
      var q = new URLSearchParams();
      if (region !== 'all') q.set('region', region);
      if (country) q.set('country', country);
      var qs = q.toString();
      history.replaceState(null, '', location.pathname + (qs ? '?' + qs : '') + location.hash);
    }
    $$('[data-region-count]').forEach(function (el) {
      var r = el.getAttribute('data-region-count');
      el.textContent = shows.filter(function (s) { return r === 'all' || s.region === r; }).length;
    });
    regionBtns.forEach(function (b) { b.addEventListener('click', function () { region = b.getAttribute('data-region'); fillCountries(); render(); }); });
    countrySel.addEventListener('change', function () { country = countrySel.value; render(); });
    $$('[data-tour-reset]').forEach(function (b) { b.addEventListener('click', function () { region = 'all'; country = ''; fillCountries(); render(); }); });
    fillCountries();
    render();

    // Past shows (anything dated before today).
    var past = TOUR.filter(function (s) { return parseDate(s.date) < today(); });
    var pastBox = $('[data-past-shows]');
    if (pastBox && past.length) {
      $('[data-past-list]').insertAdjacentHTML('afterbegin', past.reverse().map(function (s) {
        return '<li class="flex flex-wrap justify-between gap-x-6 gap-y-1 border-b border-ink/15 py-3"><span class="font-bold">' + esc(s.city) + ' · ' + esc(s.venue) + '</span><span class="font-mono text-sm text-subtle">' + esc(fmtDate(s.date)) + '</span></li>';
      }).join(''));
    }

    // tour.html?notify=<show id> fills in the notify form's city and country.
    var notify = TOUR.filter(function (s) { return s.id === params.get('notify'); })[0];
    var form = $('#notify-form');
    if (form) {
      var sel = form.elements.country;
      sel.innerHTML = '<option value="">Choose a country</option>' + TOUR.map(function (s) { return s.country; }).filter(function (c, i, a) { return a.indexOf(c) === i; }).sort().concat(['Somewhere else']).map(function (c) { return '<option>' + esc(c) + '</option>'; }).join('');
      if (notify) { form.elements.city.value = notify.city.replace(/,.*$/, ''); sel.value = notify.country; }
    }
  }

  /* ------------------------------------------------------------------
   * 9. Merch and the cart drawer. The bag is saved in localStorage under "tempo-cart" as
   * [{ id, colour, size, qty }]. Checkout is a demo step: connect your shop (see DOCS.md).
   * ------------------------------------------------------------------ */
  var CART_KEY = 'tempo-cart';
  function readCart() {
    var raw = readJSON(CART_KEY, []);
    if (!Array.isArray(raw)) return [];
    return raw.filter(function (l) {
      var p = l && getProduct(l.id);
      if (!p || !(l.qty >= 1)) return false;
      if (p.colours && !p.colours.some(function (c) { return c.name === l.colour; })) return false;
      if (p.sizes && (p.sizes.indexOf(l.size) < 0 || (p.soldOut || []).indexOf(l.size) >= 0)) return false;
      return true;
    }).map(function (l) { return { id: l.id, colour: l.colour || '', size: l.size || '', qty: clamp(Math.floor(l.qty), 1, 10) }; });
  }
  var cart = readCart();
  function lineKey(l) { return [l.id, l.colour, l.size].join('|'); }
  function saveCart() { writeJSON(CART_KEY, cart); renderCart(); }
  function cartCount() { return cart.reduce(function (a, l) { return a + l.qty; }, 0); }
  function subtotal() { return cart.reduce(function (a, l) { return a + getProduct(l.id).price * l.qty; }, 0); }
  function addToCart(item) {
    var existing = cart.filter(function (l) { return lineKey(l) === lineKey(item); })[0];
    if (existing) existing.qty = Math.min(10, existing.qty + item.qty);
    else cart.push(item);
    saveCart();
  }

  var drawer, panel, opener;
  function openCart(view) {
    if (!drawer) return;
    opener = document.activeElement;
    setCartView(view || 'bag');
    drawer.hidden = false;
    document.documentElement.classList.add('drawer-open');
    requestAnimationFrame(function () { requestAnimationFrame(function () { drawer.classList.add('is-open'); }); });
    panel.focus();
  }
  function closeCart() {
    if (!drawer || drawer.hidden) return;
    drawer.classList.remove('is-open');
    document.documentElement.classList.remove('drawer-open');
    setTimeout(function () { drawer.hidden = true; }, reduceMotion ? 0 : 350);
    if (opener && opener.focus) opener.focus();
  }
  function setCartView(view) {
    $$('[data-cart-view]', drawer).forEach(function (el) { el.hidden = el.getAttribute('data-cart-view') !== view; });
    $('[data-cart-title]', drawer).textContent = view === 'checkout' ? 'Checkout' : view === 'done' ? 'Order placed' : 'Your bag';
  }
  function renderCart() {
    var n = cartCount();
    $$('[data-cart-count]').forEach(function (el) { el.textContent = n; el.hidden = n === 0; });
    $$('[data-cart-open]').forEach(function (b) { b.setAttribute('aria-label', 'Open bag, ' + n + (n === 1 ? ' item' : ' items')); });
    if (!drawer) return;
    var items = $('[data-cart-items]', drawer), sub = subtotal();
    $('[data-cart-empty]', drawer).hidden = cart.length > 0;
    $('[data-cart-footer]', drawer).hidden = cart.length === 0;
    items.innerHTML = cart.map(function (l, i) {
      var p = getProduct(l.id), c = p.colours && p.colours.filter(function (x) { return x.name === l.colour; })[0];
      var opts = [l.colour, l.size].filter(Boolean).join(' · ');
      return '<li class="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-4 border-b-2 border-ink/15 py-4">' +
        '<div class="overflow-hidden rounded-lg border-2 border-ink [&>svg]:block [&>svg]:h-full [&>svg]:w-full">' + productArt(p, c) + '</div>' +
        '<div class="min-w-0"><div class="flex items-start justify-between gap-3"><p class="font-bold leading-snug">' + esc(p.name) + '</p><p class="font-mono text-sm font-bold">' + money(p.price * l.qty) + '</p></div>' +
        (opts ? '<p class="text-sm text-subtle">' + esc(opts) + '</p>' : '') +
        '<div class="mt-2.5 flex items-center justify-between gap-3"><div class="inline-flex items-center rounded-full border-2 border-ink" role="group" aria-label="Quantity of ' + esc(p.name) + '">' +
        '<button type="button" class="grid h-8 w-8 place-items-center rounded-full hover:bg-paper-2 disabled:opacity-40" data-qty="' + i + '" data-d="-1" aria-label="Decrease quantity"' + (l.qty <= 1 ? ' disabled' : '') + '>−</button>' +
        '<span class="min-w-7 text-center font-mono text-sm font-bold" aria-live="polite">' + l.qty + '</span>' +
        '<button type="button" class="grid h-8 w-8 place-items-center rounded-full hover:bg-paper-2 disabled:opacity-40" data-qty="' + i + '" data-d="1" aria-label="Increase quantity"' + (l.qty >= 10 ? ' disabled' : '') + '>+</button></div>' +
        '<button type="button" class="text-sm font-bold underline underline-offset-4 hover:text-pink-deep" data-remove="' + i + '">Remove<span class="sr-only"> ' + esc(p.name) + '</span></button></div></div></li>';
    }).join('');
    $$('[data-cart-subtotal]', drawer).forEach(function (el) { el.textContent = money(sub); });
    var left = BAND.freeShippingFrom - sub, ship = $('[data-ship]', drawer);
    ship.textContent = left > 0 ? 'Spend ' + money(left) + ' more for free US shipping.' : 'You’ve unlocked free US shipping.';
    $('[data-ship-bar]', drawer).style.width = clamp(sub / BAND.freeShippingFrom * 100, 0, 100) + '%';
    var shipCost = left > 0 ? BAND.shipping : 0;
    $$('[data-cart-shipping]', drawer).forEach(function (el) { el.textContent = shipCost ? money(shipCost) : 'Free'; });
    $$('[data-cart-total]', drawer).forEach(function (el) { el.textContent = money(sub + shipCost); });
    var summary = $('[data-checkout-lines]', drawer);
    if (summary) summary.innerHTML = cart.map(function (l) { var p = getProduct(l.id); return '<li class="flex justify-between gap-4 py-1.5"><span>' + l.qty + ' × ' + esc(p.name) + (l.size ? ' (' + esc(l.size) + ')' : '') + '</span><span class="font-mono">' + money(p.price * l.qty) + '</span></li>'; }).join('');
  }
  function initCart() {
    drawer = $('#cart');
    if (!drawer) return;
    panel = $('[role="dialog"]', drawer);
    $$('[data-cart-open]').forEach(function (b) { b.addEventListener('click', function () { openCart('bag'); }); });
    drawer.addEventListener('click', function (e) {
      if (e.target.closest('[data-cart-close]')) { closeCart(); return; }
      var q = e.target.closest('[data-qty]');
      if (q) {
        var i = Number(q.getAttribute('data-qty'));
        cart[i].qty = clamp(cart[i].qty + Number(q.getAttribute('data-d')), 1, 10);
        saveCart();
        var again = $('[data-qty="' + i + '"][data-d="' + q.getAttribute('data-d') + '"]', drawer);
        if (again && !again.disabled) again.focus(); else panel.focus();
        return;
      }
      var r = e.target.closest('[data-remove]');
      if (r) {
        var p = getProduct(cart[Number(r.getAttribute('data-remove'))].id);
        cart.splice(Number(r.getAttribute('data-remove')), 1);
        saveCart();
        toast(p.name + ' removed from your bag.');
        panel.focus();
        return;
      }
      if (e.target.closest('[data-checkout]')) { setCartView('checkout'); panel.focus(); return; }
      if (e.target.closest('[data-back-to-bag]')) { setCartView('bag'); panel.focus(); return; }
      if (e.target.closest('[data-place-order]')) {
        // Nothing is charged here. Replace this with a redirect to your checkout (see DOCS.md, Merch and cart).
        $$('[data-order-ref]', drawer).forEach(function (el) { el.textContent = makeRef('MS'); });
        cart = [];
        saveCart();
        setCartView('done');
        panel.focus();
      }
    });
    document.addEventListener('keydown', function (e) {
      if (drawer.hidden) return;
      if (e.key === 'Escape') { e.preventDefault(); closeCart(); return; }
      if (e.key !== 'Tab') return;
      var f = $$('a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])', panel).filter(function (el) { return el.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === panel)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    renderCart();
  }

  function initMerch() {
    var grid = $('[data-merch-grid]');
    if (!grid) return;
    var params = new URLSearchParams(location.search);
    var cat = MERCH_CATS[params.get('cat')] ? params.get('cat') : 'all';
    grid.innerHTML = PRODUCTS.map(function (p) {
      var c0 = p.colours ? p.colours[0] : null;
      var colours = p.colours && p.colours.length > 1
        ? '<fieldset class="mt-4"><legend class="meta">Color: <span class="font-bold text-ink" data-colour-name>' + esc(c0.name) + '</span></legend><div class="mt-2 flex flex-wrap gap-2.5">' +
          p.colours.map(function (c, i) { return '<label class="swatch" style="--sw:' + c.hex + '"><input type="radio" class="sr-only" name="colour" value="' + esc(c.name) + '"' + (i === 0 ? ' checked' : '') + '><span class="sr-only">' + esc(c.name) + '</span></label>'; }).join('') + '</div></fieldset>'
        : (c0 ? '<p class="meta mt-4">Color: <span class="font-bold text-ink">' + esc(c0.name) + '</span></p>' : '');
      var sizes = p.sizes
        ? '<fieldset class="mt-4"><legend class="meta">Size</legend><div class="mt-2 flex flex-wrap gap-2">' +
          p.sizes.map(function (s) { var out = (p.soldOut || []).indexOf(s) >= 0; return '<label class="pill"><input type="radio" class="sr-only" name="size" value="' + s + '"' + (out ? ' disabled' : '') + ' aria-describedby="err-' + p.id + '"><span>' + s + '</span>' + (out ? '<span class="sr-only"> (sold out)</span>' : '') + '</label>'; }).join('') +
          '</div><p class="field-error" id="err-' + p.id + '" aria-live="polite"></p></fieldset>'
        : '';
      return '<li id="p-' + p.id + '" data-cat="' + p.cat + '" class="reveal">' +
        '<article class="card card-shadow flex h-full flex-col overflow-hidden" aria-labelledby="name-' + p.id + '">' +
        '<div class="relative aspect-[4/5] border-b-2 border-ink [&>svg]:h-full [&>svg]:w-full" data-product-art>' + productArt(p, c0) + '</div>' +
        '<form class="flex flex-1 flex-col p-5" data-product="' + p.id + '" novalidate>' +
        '<div class="flex items-start justify-between gap-4"><h3 id="name-' + p.id + '" class="font-display text-[1.65rem] leading-none font-extrabold uppercase">' + esc(p.name) + '</h3><p class="font-mono text-lg font-bold">' + money(p.price) + '</p></div>' +
        (p.badge ? '<p class="mt-2"><span class="chip ' + (p.badge === 'Pre-order' ? 'chip-pink' : 'chip-sun') + '">' + esc(p.badge) + '</span></p>' : '') +
        '<p class="mt-3 text-sm leading-relaxed text-soft">' + esc(p.desc) + '</p>' + colours + sizes +
        '<div class="mt-auto pt-5"><button type="submit" class="btn-dark w-full">Add to bag<span class="sr-only">: ' + esc(p.name) + '</span></button></div>' +
        '</form></article></li>';
    }).join('');

    function filter() {
      $$('[data-cat]', grid).forEach(function (li) { li.hidden = cat !== 'all' && li.getAttribute('data-cat') !== cat; });
      $$('[data-merch-filter]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-merch-filter') === cat)); });
      var n = $$('[data-cat]', grid).filter(function (li) { return !li.hidden; }).length;
      $('[data-merch-count]').textContent = n + (n === 1 ? ' item' : ' items');
      var q = new URLSearchParams(location.search);
      if (cat === 'all') q.delete('cat'); else q.set('cat', cat);
      var qs = q.toString();
      history.replaceState(null, '', location.pathname + (qs ? '?' + qs : '') + location.hash);
      revealNow(grid);
    }
    $$('[data-merch-filter]').forEach(function (b) { b.addEventListener('click', function () { cat = b.getAttribute('data-merch-filter'); filter(); }); });
    $$('[data-merch-count-for]').forEach(function (el) {
      var c = el.getAttribute('data-merch-count-for');
      el.textContent = PRODUCTS.filter(function (p) { return c === 'all' || p.cat === c; }).length;
    });

    grid.addEventListener('change', function (e) {
      var form = e.target.closest('[data-product]');
      if (!form) return;
      var p = getProduct(form.getAttribute('data-product'));
      if (e.target.name === 'colour') {
        var c = p.colours.filter(function (x) { return x.name === e.target.value; })[0];
        form.closest('article').querySelector('[data-product-art]').innerHTML = productArt(p, c);
        $('[data-colour-name]', form).textContent = c.name;
      }
      if (e.target.name === 'size') $('#err-' + p.id).textContent = '';
    });
    grid.addEventListener('submit', function (e) {
      e.preventDefault();
      var form = e.target, p = getProduct(form.getAttribute('data-product'));
      var size = form.elements.size ? $('input[name="size"]:checked', form) : null;
      if (p.sizes && !size) {
        $('#err-' + p.id).textContent = 'Choose a size first.';
        var first = $('input[name="size"]:not(:disabled)', form);
        if (first) first.focus();
        return;
      }
      var colour = p.colours ? (form.elements.colour ? $('input[name="colour"]:checked', form).value : p.colours[0].name) : '';
      addToCart({ id: p.id, colour: colour, size: size ? size.value : '', qty: 1 });
      openCart('bag');
      toast(p.name + ' added to your bag.');
    });
    filter();
    if (location.hash && $(location.hash)) setTimeout(function () { $(location.hash).scrollIntoView(); }, 0);
  }

  /* ------------------------------------------------------------------
   * 10. Press kit
   * ------------------------------------------------------------------ */
  function initPress() {
    var tabs = $$('[role="tab"][data-bio]');
    if (tabs.length) {
      var select = function (tab, focus) {
        tabs.forEach(function (t) {
          var on = t === tab;
          t.setAttribute('aria-selected', String(on));
          t.tabIndex = on ? 0 : -1;
          $('#' + t.getAttribute('aria-controls')).hidden = !on;
        });
        if (focus) tab.focus();
        var panelEl = $('#' + tab.getAttribute('aria-controls'));
        $('[data-bio-words]').textContent = panelEl.textContent.trim().split(/\s+/).length + ' words';
      };
      tabs.forEach(function (t, i) {
        t.addEventListener('click', function () { select(t); });
        t.addEventListener('keydown', function (e) {
          var n = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : null;
          if (n === null) return;
          e.preventDefault();
          select(tabs[(n + tabs.length) % tabs.length], true);
        });
      });
      select(tabs[0]);
      $('[data-copy-bio]').addEventListener('click', function () {
        var tab = tabs.filter(function (t) { return t.getAttribute('aria-selected') === 'true'; })[0];
        var text = $$('p', $('#' + tab.getAttribute('aria-controls'))).map(function (p) { return p.textContent.trim(); }).join('\n\n');
        copyText(text, function (ok) { toast(ok ? tab.textContent.trim() + ' bio copied.' : 'Select the text and copy it.'); });
      });
    }
    $$('[data-copy]').forEach(function (b) {
      b.addEventListener('click', function () {
        var v = b.getAttribute('data-copy');
        copyText(v, function (ok) { toast(ok ? v + ' copied.' : 'Select the address and copy it.'); });
      });
    });
    document.addEventListener('click', function (e) {
      var b = e.target.closest('[data-download]');
      if (!b) return;
      var kind = b.getAttribute('data-download');
      if (kind === 'bio') {
        var text = $$('[data-bio-panel]').map(function (p) { return p.getAttribute('data-bio-panel').toUpperCase() + ' BIO\n\n' + $$('p', p).map(function (x) { return x.textContent.trim(); }).join('\n\n'); }).join('\n\n\n');
        download('marigold-static-bio.txt', text + '\n');
      } else if (kind === 'facts') {
        var rows = $$('[data-fact]').map(function (el) { return $('dt', el).textContent.trim() + ': ' + $('dd', el).textContent.trim().replace(/\s+/g, ' '); });
        download('marigold-static-fact-sheet.txt', BAND.name.toUpperCase() + ' — FACT SHEET\n\n' + rows.join('\n') + '\n');
      } else if (kind === 'cover') {
        var rel = newRelease();
        download(rel.id + '-cover.svg', cover(rel, { uid: '-dl' }).replace('<svg ', '<svg width="2000" height="2000" '), 'image/svg+xml');
      } else if (kind === 'logo') {
        download('marigold-static-logo.svg', $('#logo-art').outerHTML.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" '), 'image/svg+xml');
      } else if (kind === 'rider') {
        download('marigold-static-tech-rider.txt', $('#rider-text').textContent.trim().replace(/\n\s+/g, '\n') + '\n');
      }
      toast('Download started.');
    });
  }

  /* ------------------------------------------------------------------
   * 11. Forms. Every form validates in the browser and shows a success state. Nothing is sent:
   * to connect a real service (Formspree, Netlify Forms, your mailing list), replace the body of
   * onValid() with a fetch, for example:
   *   fetch('https://formspree.io/f/your-id', { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
   *     .then(function (r) { if (r.ok) showSuccess(form); else showError(form); });
   * ------------------------------------------------------------------ */
  function setFieldError(f, msg) {
    var box = f.closest('[data-field]');
    var out = box && $('.field-error', box);
    if (f.type !== 'radio' && f.type !== 'checkbox') f.setAttribute('aria-invalid', msg ? 'true' : 'false');
    else if (box) $$('input', box).forEach(function (i) { i.setAttribute('aria-invalid', msg ? 'true' : 'false'); });
    if (out) out.textContent = msg;
  }
  function message(f) {
    var v = f.validity, label = f.getAttribute('data-name') || 'This field';
    if (v.valueMissing) {
      if (f.type === 'checkbox') return f.getAttribute('data-required-msg') || 'Please check this box to continue.';
      if (f.type === 'radio') return f.getAttribute('data-required-msg') || 'Choose one option.';
      if (f.tagName === 'SELECT') return 'Choose ' + label.toLowerCase() + '.';
      return label + ' is required.';
    }
    if (v.typeMismatch && f.type === 'email') return 'Enter an email address like name@example.com.';
    if (v.typeMismatch && f.type === 'url') return 'Enter a full web address starting with https://';
    if (v.tooShort) return 'Please write at least ' + f.minLength + ' characters (' + f.value.trim().length + ' so far).';
    if (v.rangeUnderflow) return f.getAttribute('data-min-msg') || 'Choose a later date.';
    if (v.patternMismatch) return f.getAttribute('data-pattern-msg') || 'Check the format.';
    return '';
  }
  function validate(f) {
    if (f.type !== 'radio' && f.type !== 'checkbox' && f.value !== f.value.trim() && f.value.trim() === '') f.value = '';
    var msg = f.checkValidity() ? '' : message(f);
    setFieldError(f, msg);
    return !msg;
  }
  function fieldsOf(form) {
    return $$('input, select, textarea', form).filter(function (f) { return f.type !== 'hidden' && !f.closest('[hidden]') && f.willValidate; });
  }
  function onValid(form) {
    var box = document.getElementById(form.getAttribute('data-success'));
    var name = form.elements.name || form.elements.first_name;
    $$('[data-success-name]', box).forEach(function (el) { el.textContent = name && name.value.trim() ? ', ' + name.value.trim().split(' ')[0] : ''; });
    var route = $('[data-route-to]', form), reply = $('[data-route-reply]', form);
    $$('[data-success-route]', box).forEach(function (el) { el.textContent = route ? route.textContent : ''; });
    $$('[data-success-reply]', box).forEach(function (el) { el.textContent = reply ? reply.textContent : ''; });
    $$('[data-ref]', box).forEach(function (el) { el.textContent = makeRef('MS'); });
    form.hidden = true;
    box.hidden = false;
    box.setAttribute('tabindex', '-1');
    box.focus();
  }
  function initForms() {
    $$('form[data-validate]').forEach(function (form) {
      // Listen on the form rather than on each field, so fields shown later (the contact
      // topic's extra fields) are checked as you go too: when a field loses focus (if filled)
      // or a choice changes, and again as an invalid field is being corrected.
      function field(t) { return fieldsOf(form).indexOf(t) > -1 ? t : null; }
      function choice(f) { return f.type === 'radio' || f.type === 'checkbox' || f.tagName === 'SELECT'; }
      function invalid(f) { return f.getAttribute('aria-invalid') === 'true'; }
      function live(f) { if (f.type === 'radio' || f.value || invalid(f)) validate(f); }
      form.addEventListener('focusout', function (e) { var f = field(e.target); if (f && !choice(f)) live(f); });
      form.addEventListener('change', function (e) { var f = field(e.target); if (f && choice(f)) live(f); });
      form.addEventListener('input', function (e) { var f = field(e.target); if (f && invalid(f)) validate(f); });
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var bad = fieldsOf(form).filter(function (f) { return !validate(f); });
        if (bad.length) { bad[0].focus(); return; }
        onValid(form);
      });
    });
    $$('[data-form-again]').forEach(function (b) {
      b.addEventListener('click', function () {
        var box = b.closest('[data-success-box]');
        var form = $('form[data-success="' + box.id + '"]');
        form.reset();
        form.dispatchEvent(new Event('change'));
        box.hidden = true;
        form.hidden = false;
        var first = fieldsOf(form)[0];
        if (first) first.focus();
      });
    });
    // Character counters: <textarea data-counter="msg-count" minlength="30">
    $$('[data-counter]').forEach(function (f) {
      var out = document.getElementById(f.getAttribute('data-counter'));
      function upd() {
        var n = f.value.trim().length, min = f.minLength;
        out.textContent = n < min ? n + ' / ' + min + ' characters minimum' : n + ' characters';
      }
      f.addEventListener('input', upd);
      f.form.addEventListener('change', upd);
      upd();
    });
    // Dates can't be in the past.
    $$('input[type="date"][data-future]').forEach(function (f) { var d = today(); f.min = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); });
    initContactRouting();
  }

  // Contact page: the topic radios show extra fields and say where the message will go.
  function initContactRouting() {
    var form = $('#contact-form');
    if (!form) return;
    var to = $('[data-route-to]', form), reply = $('[data-route-reply]', form);
    function topic() { var r = $('input[name="topic"]:checked', form); return r ? r.value : ''; }
    function update() {
      var t = topic(), info = CONTACT_TOPICS[t];
      $$('[data-topic-fields]', form).forEach(function (box) {
        var on = box.getAttribute('data-topic-fields') === t;
        box.hidden = !on;
        $$('input, select, textarea', box).forEach(function (f) {
          if (f.hasAttribute('data-required')) f.required = on;
          if (!on) setFieldError(f, '');
        });
      });
      $('[data-route]', form).hidden = !info;
      if (!info) return;
      var dest = info.to;
      if (typeof dest === 'object') dest = dest[form.elements.booking_region.value === 'na' ? 'na' : 'uk'];
      to.textContent = dest;
      reply.textContent = info.reply;
    }
    form.addEventListener('change', update);
    var want = new URLSearchParams(location.search).get('topic');
    var radio = want && $('input[name="topic"][value="' + want.replace(/[^a-z]/g, '') + '"]', form);
    if (radio) radio.checked = true;
    update();
  }

  /* ------------------------------------------------------------------
   * 12. Header, mobile menu, scroll reveal
   * ------------------------------------------------------------------ */
  var io = null;
  function revealNow(root) {
    $$('.reveal:not(.is-visible)', root).forEach(function (el) {
      if (!io) { el.classList.add('is-visible'); return; }
      io.observe(el);
    });
  }
  function initChrome() {
    var menuBtn = $('#menu-toggle'), menu = $('#mobile-menu');
    function setMenu(open) {
      menuBtn.setAttribute('aria-expanded', String(open));
      $('.sr-only', menuBtn).textContent = open ? 'Close menu' : 'Menu';
      menu.hidden = !open;
      $('[data-icon-open]', menuBtn).classList.toggle('hidden', open);
      $('[data-icon-close]', menuBtn).classList.toggle('hidden', !open);
      document.documentElement.classList.toggle('menu-open', open);
    }
    if (menuBtn && menu) {
      menuBtn.addEventListener('click', function () { setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'); });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') { setMenu(false); menuBtn.focus(); }
      });
      window.matchMedia('(min-width: 1024px)').addEventListener('change', function (m) { if (m.matches) setMenu(false); });
      $$('[data-cart-open]', menu).forEach(function (b) { b.addEventListener('click', function () { setMenu(false); }); });
    }
    var header = $('#site-header');
    function onScroll() { header.classList.toggle('is-scrolled', window.scrollY > 8); }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

    // Reveal on scroll. Revealing an element also reveals everything above it,
    // so fast jumps (End key, anchors) never leave content hidden.
    if (!('IntersectionObserver' in window) || reduceMotion) { $$('.reveal').forEach(function (el) { el.classList.add('is-visible'); }); return; }
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var bottom = en.target.getBoundingClientRect().bottom;
        $$('.reveal:not(.is-visible)').forEach(function (el) { if (el.getBoundingClientRect().top <= bottom) { el.classList.add('is-visible'); io.unobserve(el); } });
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
    $$('.reveal').forEach(function (el, i) { el.style.transitionDelay = (i % 3) * 70 + 'ms'; io.observe(el); });
  }

  /* Start everything */
  paintCovers(document);
  initPlayerBar();
  initTrackButtons();
  initDemoText();
  initRelease();
  initHome();
  initMusic();
  initTour();
  initIcs();
  initCart();
  initMerch();
  initPress();
  initForms();
  initChrome();
  syncPlayState();

  // Exposed for tests and debugging.
  window.Tempo = { BAND: BAND, RELEASES: RELEASES, TOUR: TOUR, PRODUCTS: PRODUCTS, Player: Player, icsFor: icsFor, readCart: readCart, page: page };
})();

/* ------------------------------------------------------------------
 * 13. Back to top
 * ------------------------------------------------------------------ */
/* ---------- Back to top ----------
   A button that fades in after you scroll about one screen down. It returns to
   the top (instantly if the visitor prefers reduced motion) and moves keyboard
   focus to the main content. It lifts itself above toasts and the player bar
   so they never overlap. Mark your own UI with data-back-to-top-avoid.
   To remove the button: delete this block and the .back-to-top styles in src/input.css. */
(function () {
  'use strict';
  if (document.querySelector('.back-to-top')) return;

  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'back-to-top';
  btn.setAttribute('aria-label', 'Back to top');
  btn.title = 'Back to top';
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></svg>';
  document.body.appendChild(btn);

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var AVOID = '#toast.is-visible, [data-back-to-top-avoid]';
  var queued = false;

  function lift() {
    var offset = 0;
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    Array.prototype.forEach.call(document.querySelectorAll(AVOID), function (el) {
      var r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      if (r.bottom > vh - 140 && r.right > vw - 96 && r.top < vh) offset = Math.max(offset, vh - r.top + 8);
    });
    btn.style.setProperty('--btt-lift', offset + 'px');
  }
  function update() {
    queued = false;
    var blocked = document.documentElement.classList.contains('menu-open') || document.documentElement.classList.contains('drawer-open');
    btn.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.9 && !blocked);
    lift();
  }
  function schedule() {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(update);
  }
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  document.addEventListener('transitionend', function (e) { if (e.target !== btn) schedule(); }, true);
  update();

  function focusTop() {
    var target = document.getElementById('main') || document.querySelector('main');
    if (!target) return;
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.classList.add('back-to-top-target');
    target.focus({ preventScroll: true });
  }
  btn.addEventListener('click', function () {
    if (reduceMotion.matches) { window.scrollTo({ top: 0, behavior: 'auto' }); focusTop(); return; }
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
