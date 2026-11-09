/* Northstar Admin: all template JavaScript. Vanilla JS, no dependencies.
 *
 * Sections:
 *   1. Helpers            7. Charts (sparkline, line/area, donut, bars, funnel, heatmap)
 *   2. Demo data          8. Overview & analytics pages
 *   3. Theme              9. Orders table
 *   4. Sidebar & drawer  10. Customers & side panel
 *   5. Menus & search    11. Products
 *   6. Toast, modals,    12. Settings & sign-in
 *      tabs, forms       13. Scroll reveal
 *
 * Replace the demo data in section 2 with data from your own API.
 */
(function () {
  'use strict';

  /* localStorage, or memory when it's blocked or a save fails (storage full). Memory is read first, so a change
     that couldn't be saved still shows for this page view. */
  var safeStorage = (function () {
    var local = null;
    try { local = window.localStorage; local.getItem('_'); } catch (e) { local = null; /* blocked */ }
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

  /* ===================================================================
   * 1. Helpers
   * ================================================================= */
  var $ = function (sel, el) { return (el || document).querySelector(sel); };
  var $$ = function (sel, el) { return Array.prototype.slice.call((el || document).querySelectorAll(sel)); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  var money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
  var money0 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  var num = new Intl.NumberFormat('en-US');
  function short(v) {
    var unit = v >= 1e6 ? ['M', 1e6] : v >= 1e3 ? ['k', 1e3] : ['', 1];
    var n = v / unit[1];
    return (n >= 100 ? Math.round(n) : Math.round(n * 10) / 10) + unit[0];
  }
  function fmtDate(d, opts) { return d.toLocaleDateString('en-US', opts || { month: 'short', day: 'numeric', year: 'numeric' }); }
  function initials(name) { return name.split(' ').map(function (p) { return p[0]; }).join('').slice(0, 2); }
  // A short reference, like TC-7K2Q (no 0/O or 1/I to misread).
  function makeRef(prefix) {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', out = '';
    for (var i = 0; i < 4; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
    return prefix + '-' + out;
  }

  // Deterministic pseudo-random numbers so the demo data is the same on every load.
  function rng(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function series(seed, n, base, spread, trend) {
    var r = rng(seed), out = [], v = base;
    for (var i = 0; i < n; i++) {
      v = Math.max(base * 0.35, v + (r() - 0.45) * spread + (trend || 0));
      out.push(Math.round(v));
    }
    return out;
  }

  // Avatar colors, picked by name so each person keeps the same color.
  var AVATAR = ['bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300',
    'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300',
    'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
    'bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-300',
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
    'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300'];
  function avatar(name, size) {
    var h = 0;
    for (var i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
    return '<span class="grid ' + (size || 'size-8') + ' shrink-0 place-items-center rounded-full text-xs font-semibold ' +
      AVATAR[h % AVATAR.length] + '" aria-hidden="true">' + esc(initials(name)) + '</span>';
  }

  /* ===================================================================
   * 2. Demo data
   * ================================================================= */
  /* TODAY is the "current" date every chart, order and invoice is generated from. It is the visitor's
   * today, so the demo never goes stale; preview another day with ?now=YYYY-MM-DD. */
  var TODAY = (function () {
    var m = /[?&]now=(\d{4})-(\d{2})-(\d{2})/.exec(location.search);
    var d = m ? new Date(+m[1], +m[2] - 1, +m[3]) : new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  })();
  // A date `n` calendar days before TODAY (calendar math, so daylight-saving changes don't repeat a day).
  function daysAgo(n) { return new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate() - n); }
  var NAMES = ['Olivia Martin', 'Jackson Lee', 'Isabella Nguyen', 'William Kim', 'Sofia Davis', 'Liam Johnson',
    'Ava Patel', 'Noah Garcia', 'Mia Thompson', 'Ethan Brown', 'Amelia Wilson', 'Lucas Anderson', 'Harper Clark',
    'Mason Rodriguez', 'Evelyn Lewis', 'Logan Walker', 'Aria Hall', 'Elijah Young', 'Chloe King', 'James Wright',
    'Layla Scott', 'Benjamin Green', 'Zoe Adams', 'Henry Baker'];
  var CITIES = ['Portland, OR', 'Austin, TX', 'Boise, ID', 'Raleigh, NC', 'Madison, WI', 'Tampa, FL',
    'Denver, CO', 'Savannah, GA', 'Seattle, WA', 'Minneapolis, MN', 'Spokane, WA', 'Burlington, VT'];
  var STATUSES = [['Paid', 'badge-green'], ['Pending', 'badge-amber'], ['Refunded', 'badge-zinc'], ['Failed', 'badge-red']];
  var CHANNELS = ['Online store', 'Mobile app', 'Wholesale', 'Marketplace'];

  var PRODUCTS = [
    { name: 'Summit 40L Backpack', sku: 'PK-040', cat: 'Packs', price: 189, stock: 46, cap: 120, sold: 812, hue: 'indigo', icon: 'pack' },
    { name: 'Trail Runner Pro', sku: 'FW-112', cat: 'Footwear', price: 149, stock: 8, cap: 90, sold: 1204, hue: 'amber', icon: 'shoe' },
    { name: 'Alpine Down Jacket', sku: 'AP-310', cat: 'Apparel', price: 279, stock: 31, cap: 80, sold: 640, hue: 'cyan', icon: 'jacket' },
    { name: 'Ridge Water Bottle', sku: 'GR-021', cat: 'Gear', price: 32, stock: 214, cap: 300, sold: 2310, hue: 'emerald', icon: 'bottle' },
    { name: 'Basecamp Tent 2P', sku: 'CM-502', cat: 'Camping', price: 349, stock: 0, cap: 40, sold: 288, hue: 'pink', icon: 'tent' },
    { name: 'Glacier Sunglasses', sku: 'GR-077', cat: 'Gear', price: 89, stock: 64, cap: 150, sold: 978, hue: 'violet', icon: 'glasses' },
    { name: 'Canyon Hiking Socks', sku: 'AP-018', cat: 'Apparel', price: 18, stock: 12, cap: 400, sold: 3450, hue: 'amber', icon: 'sock' },
    { name: 'Aurora Headlamp', sku: 'GR-240', cat: 'Gear', price: 54, stock: 88, cap: 160, sold: 1530, hue: 'indigo', icon: 'lamp' },
    { name: 'Cascade Rain Shell', sku: 'AP-205', cat: 'Apparel', price: 199, stock: 23, cap: 90, sold: 702, hue: 'cyan', icon: 'jacket' },
    { name: 'Tundra Sleeping Bag', sku: 'CM-330', cat: 'Camping', price: 229, stock: 5, cap: 60, sold: 391, hue: 'violet', icon: 'bag' },
    { name: 'Peak Trekking Poles', sku: 'GR-150', cat: 'Gear', price: 119, stock: 0, cap: 70, sold: 455, hue: 'emerald', icon: 'poles' },
    { name: 'Meadow Camp Mug', sku: 'CM-014', cat: 'Camping', price: 24, stock: 176, cap: 250, sold: 2780, hue: 'pink', icon: 'mug' }
  ];

  var ORDERS = (function () {
    var r = rng(42), out = [];
    for (var i = 0; i < 48; i++) {
      var roll = r();
      var st = roll < 0.6 ? 0 : roll < 0.8 ? 1 : roll < 0.9 ? 2 : 3;
      var items = 1 + Math.floor(r() * 4);
      var p = PRODUCTS[Math.floor(r() * PRODUCTS.length)];
      out.push({
        id: 'NS-' + (4821 - i),
        customer: NAMES[Math.floor(r() * NAMES.length)],
        date: new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate(), 0, 0, 0, -Math.floor(i * 0.8 * 86400000 + r() * 40000000)),
        status: STATUSES[st][0],
        badge: STATUSES[st][1],
        channel: CHANNELS[Math.floor(r() * CHANNELS.length)],
        items: items,
        product: p.name,
        total: Math.round((p.price * items * (0.85 + r() * 0.3)) * 100) / 100
      });
    }
    return out;
  })();

  var CUSTOMERS = NAMES.map(function (name, i) {
    var r = rng(100 + i);
    var mine = ORDERS.filter(function (o) { return o.customer === name; });
    var spent = mine.reduce(function (s, o) { return s + (o.status === 'Paid' ? o.total : 0); }, 0) + Math.round(r() * 1800);
    return {
      name: name,
      email: name.toLowerCase().replace(' ', '.') + '@example.com',
      city: CITIES[i % CITIES.length],
      joined: new Date(2023 + Math.floor(r() * 3), Math.floor(r() * 12), 1 + Math.floor(r() * 27)),
      orders: mine.length + Math.floor(r() * 9),
      spent: spent,
      segment: spent > 1500 ? 'VIP' : spent > 700 ? 'Returning' : 'New',
      recent: mine.slice(0, 4)
    };
  });

  /* ===================================================================
   * 3. Theme
   * ================================================================= */
  $$('[data-theme-toggle]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var dark = document.documentElement.classList.toggle('dark');
      try { safeStorage.setItem('ns-theme', dark ? 'dark' : 'light'); } catch (e) {}
      btn.setAttribute('aria-pressed', String(dark));
    });
    btn.setAttribute('aria-pressed', String(document.documentElement.classList.contains('dark')));
  });

  /* ===================================================================
   * 4. Sidebar (desktop collapse) & drawer (mobile)
   * ================================================================= */
  var root = document.documentElement;
  var sidebar = $('#sidebar');
  var backdrop = $('[data-drawer-backdrop]');
  var drawerOpener = null;

  function syncNavLabels() {
    var collapsed = root.classList.contains('sb-collapsed') && window.innerWidth >= 1024;
    $$('.nav-item', sidebar).forEach(function (a) {
      var label = $('.sb-label', a);
      if (!label) return;
      // Icon only: name each link after its label. The collapse button then expands the sidebar.
      var text = a.hasAttribute('data-sidebar-collapse') ? 'Expand sidebar' : label.textContent.trim();
      if (collapsed) { a.setAttribute('aria-label', text); a.title = text; }
      else { a.removeAttribute('aria-label'); a.removeAttribute('title'); }
    });
    $$('[data-sidebar-collapse]').forEach(function (b) {
      b.setAttribute('aria-expanded', String(!root.classList.contains('sb-collapsed')));
    });
  }
  $$('[data-sidebar-collapse]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var c = root.classList.toggle('sb-collapsed');
      try { safeStorage.setItem('ns-sidebar', c ? 'collapsed' : 'open'); } catch (e) {}
      syncNavLabels();
      // Charts re-measure through their ResizeObservers once the width transition ends.
    });
  });

  function focusables(el) {
    return $$('a[href], button:not([disabled]), input:not([disabled]):not([type=hidden]), select, textarea, [tabindex]:not([tabindex="-1"])', el)
      .filter(function (x) { return x.offsetParent !== null || x === document.activeElement; });
  }
  function trap(el, e) {
    if (e.key !== 'Tab') return;
    var f = focusables(el);
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function setDrawer(open) {
    if (!sidebar) return;
    sidebar.classList.toggle('-translate-x-full', !open);
    sidebar.classList.toggle('translate-x-0', open);
    backdrop.hidden = !open;
    document.body.classList.toggle('overflow-hidden', open);
    $$('[data-drawer-open]').forEach(function (b) { b.setAttribute('aria-expanded', String(open)); });
    if (open) {
      sidebar.setAttribute('role', 'dialog');
      sidebar.setAttribute('aria-modal', 'true');
      var f = focusables(sidebar); if (f.length) f[0].focus();
    } else {
      sidebar.removeAttribute('role');
      sidebar.removeAttribute('aria-modal');
      if (drawerOpener) drawerOpener.focus();
    }
  }
  function drawerIsOpen() { return sidebar && sidebar.classList.contains('translate-x-0') && window.innerWidth < 1024; }
  $$('[data-drawer-open]').forEach(function (b) {
    b.addEventListener('click', function () { drawerOpener = b; setDrawer(true); });
  });
  $$('[data-drawer-close]').forEach(function (b) { b.addEventListener('click', function () { setDrawer(false); }); });
  if (backdrop) backdrop.addEventListener('click', function () { setDrawer(false); });
  if (sidebar) {
    sidebar.addEventListener('keydown', function (e) {
      if (!drawerIsOpen()) return;
      if (e.key === 'Escape') setDrawer(false);
      else trap(sidebar, e);
    });
  }
  window.matchMedia('(min-width: 1024px)').addEventListener('change', function (m) {
    if (m.matches && sidebar && sidebar.classList.contains('translate-x-0')) setDrawer(false);
    syncNavLabels();
  });
  syncNavLabels();

  /* ===================================================================
   * 5. Dropdown menus & global search
   * ================================================================= */
  var openMenu = null;
  function closeMenu(focusButton) {
    if (!openMenu) return;
    openMenu.panel.hidden = true;
    openMenu.button.setAttribute('aria-expanded', 'false');
    if (focusButton) openMenu.button.focus();
    openMenu = null;
  }
  $$('[data-dropdown]').forEach(function (wrap) {
    var button = $('[data-dropdown-button]', wrap);
    var panel = $('[data-dropdown-panel]', wrap);
    button.addEventListener('click', function (e) {
      e.stopPropagation();
      var wasOpen = openMenu && openMenu.panel === panel;
      closeMenu(false);
      if (wasOpen) return;
      panel.hidden = false;
      button.setAttribute('aria-expanded', 'true');
      openMenu = { button: button, panel: panel };
      var first = $('[role=menuitem]', panel) || focusables(panel)[0];
      if (first) first.focus();
    });
    panel.addEventListener('keydown', function (e) {
      var items = $$('[role=menuitem]', panel);
      var i = items.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') { e.preventDefault(); items[(i + 1) % items.length].focus(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); }
      else if (e.key === 'Home') { e.preventDefault(); items[0].focus(); }
      else if (e.key === 'End') { e.preventDefault(); items[items.length - 1].focus(); }
      else if (e.key === 'Tab') closeMenu(false);
    });
    panel.addEventListener('click', function (e) { e.stopPropagation(); });
  });
  document.addEventListener('click', function () { closeMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && openMenu) closeMenu(true); });

  $$('[data-mark-read]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      $$('[data-unread]').forEach(function (el) { el.removeAttribute('data-unread'); el.classList.remove('bg-brand-50/60', 'dark:bg-brand-500/5'); });
      $$('[data-unread-dot]').forEach(function (d) { d.hidden = true; });
      $$('[data-notif-badge]').forEach(function (b) { b.hidden = true; });
      toast('All notifications marked as read');
    });
  });

  // Global search: pages, customers and orders.
  var SEARCH = [
    { label: 'Overview', hint: 'Page', href: 'index.html' },
    { label: 'Analytics', hint: 'Page', href: 'analytics.html' },
    { label: 'Orders', hint: 'Page', href: 'orders.html' },
    { label: 'Customers', hint: 'Page', href: 'customers.html' },
    { label: 'Products', hint: 'Page', href: 'products.html' },
    { label: 'Settings', hint: 'Page', href: 'settings.html' },
    { label: 'Team members', hint: 'Settings', href: 'settings.html#team' },
    { label: 'Billing & plans', hint: 'Settings', href: 'settings.html#billing' }
  ].concat(CUSTOMERS.map(function (c) { return { label: c.name, hint: 'Customer', href: 'customers.html?q=' + encodeURIComponent(c.name) }; }))
    .concat(ORDERS.map(function (o) { return { label: o.id, hint: 'Order · ' + o.customer, href: 'orders.html?q=' + o.id }; }))
    .concat(PRODUCTS.map(function (p) { return { label: p.name, hint: 'Product', href: 'products.html?q=' + encodeURIComponent(p.name) }; }));

  var search = $('[data-global-search]');
  var results = $('[data-search-results]');
  if (search && results) {
    var active = -1;
    var render = function () {
      var q = search.value.trim().toLowerCase();
      if (!q) { results.hidden = true; search.setAttribute('aria-expanded', 'false'); return; }
      var hits = SEARCH.filter(function (s) { return (s.label + ' ' + s.hint).toLowerCase().indexOf(q) !== -1; }).slice(0, 8);
      active = hits.length ? 0 : -1;
      results.innerHTML = hits.length
        ? hits.map(function (h, i) {
            return '<li role="option" id="sr-' + i + '" aria-selected="' + (i === 0) + '"><a href="' + h.href + '" tabindex="-1" class="flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm text-zinc-700 aria-selected:bg-zinc-100 dark:text-zinc-300">' +
              '<span class="truncate">' + esc(h.label) + '</span><span class="shrink-0 text-xs text-zinc-500 dark:text-zinc-400">' + esc(h.hint) + '</span></a></li>';
          }).join('')
        : '<li class="px-3 py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">No results for “' + esc(search.value) + '”</li>';
      results.hidden = false;
      search.setAttribute('aria-expanded', 'true');
      search.setAttribute('aria-activedescendant', hits.length ? 'sr-0' : '');
      highlight();
    };
    var highlight = function () {
      $$('[role=option]', results).forEach(function (li, i) {
        li.setAttribute('aria-selected', String(i === active));
        $('a', li).classList.toggle('bg-zinc-100', i === active);
        $('a', li).classList.toggle('dark:bg-zinc-800', i === active);
      });
      if (active >= 0) search.setAttribute('aria-activedescendant', 'sr-' + active);
    };
    search.addEventListener('input', render);
    search.addEventListener('keydown', function (e) {
      var opts = $$('[role=option]', results);
      if (e.key === 'ArrowDown' && opts.length) { e.preventDefault(); active = (active + 1) % opts.length; highlight(); }
      else if (e.key === 'ArrowUp' && opts.length) { e.preventDefault(); active = (active - 1 + opts.length) % opts.length; highlight(); }
      else if (e.key === 'Enter' && active >= 0 && opts[active]) { e.preventDefault(); location.href = $('a', opts[active]).getAttribute('href'); }
      else if (e.key === 'Escape') { search.value = ''; render(); search.blur(); }
    });
    search.addEventListener('blur', function () { setTimeout(function () { results.hidden = true; search.setAttribute('aria-expanded', 'false'); }, 150); });
    document.addEventListener('keydown', function (e) {
      var typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName);
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) {
        e.preventDefault();
        // On phones the search field lives in the top bar too, so focusing it is enough.
        search.focus();
        search.select();
      }
    });
  }

  /* ===================================================================
   * 6. Toast, modals, tabs, forms
   * ================================================================= */
  var toastEl = $('[data-toast]');
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    $('[data-toast-text]', toastEl).textContent = msg;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-visible'); }, 2800);
  }
  $$('[data-toast-msg]').forEach(function (b) {
    b.addEventListener('click', function (e) {
      if (b.tagName === 'A' && b.getAttribute('href') === '#') e.preventDefault();
      toast(b.dataset.toastMsg);
    });
  });

  var modalOpener = null;
  function openModal(id) {
    var m = document.getElementById(id);
    if (!m) return;
    modalOpener = document.activeElement;
    m.hidden = false;
    document.body.classList.add('overflow-hidden');
    var f = $('[autofocus]', m) || focusables(m)[0];
    if (f) f.focus();
  }
  function closeModal(m) {
    m.hidden = true;
    if (!$$('[data-modal]').some(function (x) { return !x.hidden; }) && !drawerIsOpen()) document.body.classList.remove('overflow-hidden');
    if (modalOpener) modalOpener.focus();
  }
  $$('[data-modal-open]').forEach(function (b) { b.addEventListener('click', function () { openModal(b.dataset.modalOpen); }); });
  $$('[data-modal]').forEach(function (m) {
    $$('[data-modal-close]', m).forEach(function (b) { b.addEventListener('click', function () { closeModal(m); }); });
    m.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.stopPropagation(); closeModal(m); } else trap(m, e);
    });
    m.addEventListener('mousedown', function (e) { if (e.target === m || e.target.hasAttribute('data-modal-backdrop')) closeModal(m); });
  });

  // Accessible tabs: [role=tablist] > [role=tab][aria-controls]
  $$('[role=tablist][data-tabs]').forEach(function (list) {
    var tabs = $$('[role=tab]', list);
    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.hidden = !on;
      });
      if (focus) tab.focus();
      if (list.dataset.tabs === 'hash') history.replaceState(null, '', '#' + tab.getAttribute('aria-controls').replace('panel-', ''));
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(t); });
      t.addEventListener('keydown', function (e) {
        var n = null;
        if (e.key === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
        if (e.key === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
        if (e.key === 'Home') n = tabs[0];
        if (e.key === 'End') n = tabs[tabs.length - 1];
        if (n) { e.preventDefault(); select(n, true); }
      });
    });
    var fromHash = list.dataset.tabs === 'hash' && location.hash && $('[aria-controls="panel-' + location.hash.slice(1) + '"]', list);
    select(fromHash || tabs.filter(function (t) { return t.getAttribute('aria-selected') === 'true'; })[0] || tabs[0]);
  });

  // Toggle switches: <button role="switch" aria-checked>
  $$('[role=switch]').forEach(function (s) {
    s.addEventListener('click', function () { s.setAttribute('aria-checked', String(s.getAttribute('aria-checked') !== 'true')); });
  });

  // Form validation. A form with data-validate checks its fields, then calls a
  // named handler (data-on-valid) or shows a toast (data-success).
  var HANDLERS = {};
  function checkField(f) {
    var msg = '';
    var v = f.value.trim();
    if (f.required && !v) msg = (f.dataset.label || 'This field') + ' is required.';
    else if (f.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) msg = 'Enter a valid email address.';
    else if (f.minLength > 0 && v && v.length < f.minLength) msg = 'Use at least ' + f.minLength + ' characters.';
    var id = f.id + '-error';
    var err = document.getElementById(id);
    if (msg) {
      if (!err) {
        err = document.createElement('p');
        err.className = 'field-error';
        err.id = id;
        (f.closest('[data-field]') || f.parentNode).appendChild(err);
      }
      err.textContent = msg;
      f.setAttribute('aria-invalid', 'true');
      f.setAttribute('aria-describedby', id);
    } else {
      if (err) err.remove();
      f.removeAttribute('aria-invalid');
      f.removeAttribute('aria-describedby');
    }
    return !msg;
  }
  function bindForms(scope) {
    $$('form[data-validate]', scope).forEach(function (form) {
      if (form.dataset.bound) return;
      form.dataset.bound = '1';
      form.noValidate = true;
      var fields = $$('input[required], input[type=email], input[minlength], textarea[required], select[required]', form);
      fields.forEach(function (f) {
        f.addEventListener('blur', function () { if (f.value) checkField(f); });
        f.addEventListener('input', function () { if (f.getAttribute('aria-invalid')) checkField(f); });
      });
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var ok = fields.map(checkField).every(Boolean);
        if (!ok) { $('[aria-invalid="true"]', form).focus(); return; }
        // Demo only: nothing is sent. To save for real, send new FormData(form)
        // to your API here (e.g. fetch('/api/profile', { method: 'POST', body: new FormData(form) })).
        if (form.dataset.onValid && HANDLERS[form.dataset.onValid]) HANDLERS[form.dataset.onValid](form);
        else toast(form.dataset.success || 'Saved');
      });
    });
  }

  /* ===================================================================
   * 7. Charts. Every chart is SVG; colors come from CSS variables, so
   *    they follow light/dark mode without re-rendering.
   * ================================================================= */
  var uid = 0;
  function color(i) { return 'var(--chart-' + i + ')'; }
  function niceMax(v) {
    if (v <= 0) return 1;
    var p = Math.pow(10, Math.floor(Math.log10(v)));
    var n = v / p;
    var steps = [1, 1.2, 1.6, 2, 2.4, 3, 4, 5, 6, 8, 10];
    for (var i = 0; i < steps.length; i++) if (n <= steps[i]) return steps[i] * p;
    return 10 * p;
  }
  // Smooth path through points without overshooting (horizontal-midpoint cubic).
  function smooth(pts) {
    var d = 'M' + pts[0][0].toFixed(1) + ',' + pts[0][1].toFixed(1);
    for (var i = 1; i < pts.length; i++) {
      var xm = (pts[i - 1][0] + pts[i][0]) / 2;
      d += ' C' + xm.toFixed(1) + ',' + pts[i - 1][1].toFixed(1) + ' ' + xm.toFixed(1) + ',' + pts[i][1].toFixed(1) + ' ' + pts[i][0].toFixed(1) + ',' + pts[i][1].toFixed(1);
    }
    return d;
  }
  // Re-render a chart whenever its container changes width.
  function responsive(el, draw) {
    var last = 0;
    draw();
    if (!('ResizeObserver' in window)) return;
    var t;
    new ResizeObserver(function () {
      var w = el.clientWidth;
      if (Math.abs(w - last) < 2) return;
      last = w;
      clearTimeout(t);
      t = setTimeout(draw, 60);
    }).observe(el);
  }

  function sparkline(el) {
    var vals = el.dataset.sparkline.split(',').map(Number);
    var c = color(el.dataset.color || 1);
    var W = 120, H = 36;
    var min = Math.min.apply(null, vals), max = Math.max.apply(null, vals);
    var pts = vals.map(function (v, i) { return [i * W / (vals.length - 1), 3 + (H - 6) * (1 - (v - min) / (max - min || 1))]; });
    var id = 'sp' + (++uid);
    el.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" class="h-9 w-full overflow-visible" aria-hidden="true">' +
      '<defs><linearGradient id="' + id + '" x1="0" x2="0" y1="0" y2="1"><stop offset="0" style="stop-color:' + c + ';stop-opacity:.25"/><stop offset="1" style="stop-color:' + c + ';stop-opacity:0"/></linearGradient></defs>' +
      '<path d="' + smooth(pts) + ' L' + W + ',' + H + ' L0,' + H + ' Z" fill="url(#' + id + ')"/>' +
      '<path d="' + smooth(pts) + '" fill="none" style="stroke:' + c + '" stroke-width="1.75" vector-effect="non-scaling-stroke" stroke-linecap="round"/></svg>';
  }

  /* Line / area chart with hover + keyboard tooltip.
   * cfg: { labels, series:[{name, color, values, area, dashed, hidden}], format, axis, height } */
  function lineChart(el, cfg) {
    var tip = document.createElement('div');
    tip.className = 'chart-tip';
    tip.hidden = true;
    var holder = document.createElement('div');
    el.innerHTML = '';
    el.appendChild(holder);
    el.appendChild(tip);
    el.classList.add('relative');
    el.tabIndex = 0;
    el.setAttribute('role', 'group');
    var activeIdx = -1;
    var geo;

    function draw() {
      var W = Math.max(260, el.clientWidth), H = cfg.height || 260;
      var pad = { t: 10, r: 10, b: 26, l: cfg.yWidth || 44 };
      var vis = cfg.series.filter(function (s) { return !s.hidden; });
      var all = [];
      vis.forEach(function (s) { all = all.concat(s.values); });
      var max = niceMax(Math.max.apply(null, all.concat([1])));
      var n = cfg.labels.length;
      var x = function (i) { return pad.l + (n === 1 ? 0 : i * (W - pad.l - pad.r) / (n - 1)); };
      var y = function (v) { return pad.t + (H - pad.t - pad.b) * (1 - v / max); };
      var svg = '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" class="block max-w-full" aria-hidden="true">';
      for (var g = 0; g <= 4; g++) {
        var gv = max * g / 4, gy = y(gv);
        svg += '<line x1="' + pad.l + '" x2="' + (W - pad.r) + '" y1="' + gy + '" y2="' + gy + '" style="stroke:var(--chart-grid)" stroke-dasharray="' + (g ? '3 4' : '0') + '"/>';
        svg += '<text x="' + (pad.l - 8) + '" y="' + (gy + 4) + '" text-anchor="end" font-size="11" style="fill:var(--chart-text)">' + esc((cfg.axis || short)(gv)) + '</text>';
      }
      var step = Math.ceil(n / (W < 520 ? 4 : 7));
      for (var i = 0; i < n; i += step) {
        svg += '<text x="' + x(i) + '" y="' + (H - 6) + '" text-anchor="' + (i === 0 ? 'start' : 'middle') + '" font-size="11" style="fill:var(--chart-text)">' + esc(cfg.labels[i]) + '</text>';
      }
      vis.forEach(function (s) {
        var pts = s.values.map(function (v, i) { return [x(i), y(v)]; });
        var line = smooth(pts);
        if (s.area) {
          var id = 'ga' + (++uid);
          svg += '<defs><linearGradient id="' + id + '" x1="0" x2="0" y1="0" y2="1"><stop offset="0" style="stop-color:' + s.color + ';stop-opacity:.28"/><stop offset="1" style="stop-color:' + s.color + ';stop-opacity:0"/></linearGradient></defs>';
          svg += '<path d="' + line + ' L' + x(n - 1) + ',' + y(0) + ' L' + x(0) + ',' + y(0) + ' Z" fill="url(#' + id + ')"/>';
        }
        svg += '<path d="' + line + '" fill="none" style="stroke:' + s.color + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"' + (s.dashed ? ' stroke-dasharray="4 5" opacity=".7"' : '') + '/>';
      });
      svg += '<line data-cursor x1="0" x2="0" y1="' + pad.t + '" y2="' + (H - pad.b) + '" style="stroke:var(--chart-text)" stroke-opacity=".35" visibility="hidden"/>';
      vis.forEach(function (s, k) {
        svg += '<circle data-dot="' + k + '" r="4.5" style="fill:' + s.color + ';stroke:var(--chart-surface)" stroke-width="2" visibility="hidden"/>';
      });
      svg += '</svg>';
      holder.innerHTML = svg;
      geo = { x: x, y: y, n: n, vis: vis, pad: pad, W: W };
      if (activeIdx >= 0) show(activeIdx);
    }

    function show(i) {
      if (!geo) return;
      activeIdx = Math.max(0, Math.min(geo.n - 1, i));
      var cx = geo.x(activeIdx);
      var cur = $('[data-cursor]', holder);
      cur.setAttribute('x1', cx); cur.setAttribute('x2', cx); cur.setAttribute('visibility', 'visible');
      var rows = '';
      geo.vis.forEach(function (s, k) {
        var dot = $('[data-dot="' + k + '"]', holder);
        dot.setAttribute('cx', cx); dot.setAttribute('cy', geo.y(s.values[activeIdx])); dot.setAttribute('visibility', 'visible');
        rows += '<div class="mt-1 flex items-center justify-between gap-4"><span class="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400"><span class="size-2 rounded-full" style="background:' + s.color + '"></span>' + esc(s.name) + '</span><span class="font-semibold tabular-nums text-zinc-900 dark:text-white">' + esc((cfg.format || num.format)(s.values[activeIdx])) + '</span></div>';
      });
      tip.innerHTML = '<div class="font-medium text-zinc-900 dark:text-white">' + esc(cfg.tipLabels ? cfg.tipLabels[activeIdx] : cfg.labels[activeIdx]) + '</div>' + rows;
      tip.hidden = false;
      var tw = tip.offsetWidth;
      var left = cx + 14;
      if (left + tw > el.clientWidth) left = cx - tw - 14;
      tip.style.left = Math.max(0, left) + 'px';
      tip.style.top = '8px';
    }
    function hide() {
      activeIdx = -1;
      tip.hidden = true;
      $$('[data-dot],[data-cursor]', holder).forEach(function (d) { d.setAttribute('visibility', 'hidden'); });
    }
    el.addEventListener('mousemove', function (e) {
      if (!geo) return;
      var rect = holder.getBoundingClientRect();
      var px = e.clientX - rect.left;
      var i = Math.round((px - geo.pad.l) / ((geo.W - geo.pad.l - geo.pad.r) / Math.max(1, geo.n - 1)));
      show(i);
    });
    el.addEventListener('mouseleave', hide);
    el.addEventListener('blur', hide);
    el.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); show(activeIdx < 0 ? 0 : activeIdx + 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); show(activeIdx < 0 ? geo.n - 1 : activeIdx - 1); }
      else if (e.key === 'Escape') hide();
    });
    responsive(el, draw);
    return {
      update: function (next) { for (var k in next) cfg[k] = next[k]; activeIdx = -1; tip.hidden = true; draw(); },
      redraw: draw
    };
  }

  function donut(el, segs, centerLabel) {
    var total = segs.reduce(function (s, x) { return s + x.value; }, 0);
    var R = 70, C = 2 * Math.PI * R, off = 0;
    var svg = '<svg viewBox="0 0 180 180" class="size-44 -rotate-90" aria-hidden="true">';
    svg += '<circle cx="90" cy="90" r="' + R + '" fill="none" style="stroke:var(--chart-grid)" stroke-width="18"/>';
    segs.forEach(function (s, i) {
      var len = C * s.value / total;
      svg += '<circle data-seg="' + i + '" cx="90" cy="90" r="' + R + '" fill="none" style="stroke:' + s.color + '" stroke-width="18" stroke-dasharray="' + Math.max(0, len - 3).toFixed(2) + ' ' + C.toFixed(2) + '" stroke-dashoffset="' + (-off).toFixed(2) + '" class="cursor-pointer transition-[stroke-width] duration-200"/>';
      off += len;
    });
    svg += '</svg>';
    el.innerHTML = '<div class="relative mx-auto grid size-44 place-items-center">' + svg +
      '<div class="absolute inset-0 grid place-items-center text-center"><div><div class="text-2xl font-semibold tracking-tight text-zinc-900 tabular-nums dark:text-white" data-donut-value>' + esc(short(total)) + '</div><div class="text-xs text-zinc-500 dark:text-zinc-400" data-donut-label>' + esc(centerLabel) + '</div></div></div></div>';
    var legend = $('[data-donut-legend="' + el.id + '"]');
    function focus(i) {
      $$('[data-seg]', el).forEach(function (c, k) { c.setAttribute('stroke-width', k === i ? 24 : 18); c.style.opacity = i == null || k === i ? 1 : 0.35; });
      $('[data-donut-value]', el).textContent = i == null ? short(total) : Math.round(segs[i].value / total * 100) + '%';
      $('[data-donut-label]', el).textContent = i == null ? centerLabel : segs[i].name;
    }
    $$('[data-seg]', el).forEach(function (c, i) {
      c.addEventListener('mouseenter', function () { focus(i); });
      c.addEventListener('mouseleave', function () { focus(null); });
    });
    if (legend) {
      legend.innerHTML = segs.map(function (s, i) {
        return '<li><button type="button" data-leg="' + i + '" class="flex w-full items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800/60">' +
          '<span class="flex items-center gap-2 text-zinc-600 dark:text-zinc-300"><span class="size-2.5 rounded-sm" style="background:' + s.color + '"></span>' + esc(s.name) + '</span>' +
          '<span class="font-medium tabular-nums text-zinc-900 dark:text-white">' + num.format(s.value) + ' <span class="text-xs font-normal text-zinc-500 dark:text-zinc-400">' + Math.round(s.value / total * 100) + '%</span></span></button></li>';
      }).join('');
      $$('[data-leg]', legend).forEach(function (b, i) {
        b.addEventListener('mouseenter', function () { focus(i); });
        b.addEventListener('focus', function () { focus(i); });
        b.addEventListener('mouseleave', function () { focus(null); });
        b.addEventListener('blur', function () { focus(null); });
      });
    }
  }

  // Stacked bar chart: cfg { labels, series:[{name,color,values}], format }
  function barChart(el, cfg) {
    var tip = document.createElement('div');
    tip.className = 'chart-tip';
    tip.hidden = true;
    var holder = document.createElement('div');
    el.innerHTML = '';
    el.appendChild(holder);
    el.appendChild(tip);
    el.classList.add('relative');
    function draw() {
      var W = Math.max(260, el.clientWidth), H = cfg.height || 240;
      var pad = { t: 10, r: 6, b: 26, l: 40 };
      var n = cfg.labels.length;
      var totals = cfg.labels.map(function (_, i) { return cfg.series.reduce(function (s, x) { return s + x.values[i]; }, 0); });
      var max = niceMax(Math.max.apply(null, totals));
      var bw = (W - pad.l - pad.r) / n;
      var barW = Math.min(28, bw * 0.6);
      var y = function (v) { return (H - pad.t - pad.b) * v / max; };
      var svg = '<svg width="' + W + '" height="' + H + '" class="block max-w-full" aria-hidden="true">';
      for (var g = 0; g <= 4; g++) {
        var gy = H - pad.b - y(max * g / 4);
        svg += '<line x1="' + pad.l + '" x2="' + (W - pad.r) + '" y1="' + gy + '" y2="' + gy + '" style="stroke:var(--chart-grid)" stroke-dasharray="' + (g ? '3 4' : '0') + '"/>';
        svg += '<text x="' + (pad.l - 8) + '" y="' + (gy + 4) + '" text-anchor="end" font-size="11" style="fill:var(--chart-text)">' + esc((cfg.axis || short)(max * g / 4)) + '</text>';
      }
      cfg.labels.forEach(function (lab, i) {
        var cx = pad.l + bw * i + bw / 2, acc = 0;
        svg += '<g data-bar="' + i + '" class="cursor-pointer">';
        svg += '<rect x="' + (pad.l + bw * i) + '" y="' + pad.t + '" width="' + bw + '" height="' + (H - pad.t - pad.b) + '" fill="transparent" data-hit/>';
        cfg.series.forEach(function (s, k) {
          var h = y(s.values[i]);
          var top = k === cfg.series.length - 1;
          svg += '<rect x="' + (cx - barW / 2) + '" y="' + (H - pad.b - acc - h) + '" width="' + barW + '" height="' + Math.max(0, h - (k ? 1.5 : 0)) + '" rx="' + (top ? 4 : 1.5) + '" style="fill:' + s.color + '"/>';
          acc += h;
        });
        svg += '</g>';
        if (W > 520 || i % 2 === 0) svg += '<text x="' + cx + '" y="' + (H - 6) + '" text-anchor="middle" font-size="11" style="fill:var(--chart-text)">' + esc(lab) + '</text>';
      });
      svg += '</svg>';
      holder.innerHTML = svg;
      $$('[data-bar]', holder).forEach(function (g) {
        var i = +g.dataset.bar;
        g.addEventListener('mouseenter', function () {
          $$('[data-bar]', holder).forEach(function (o) { o.style.opacity = o === g ? 1 : 0.45; });
          tip.innerHTML = '<div class="font-medium text-zinc-900 dark:text-white">' + esc(cfg.labels[i]) + '</div>' + cfg.series.map(function (s) {
            return '<div class="mt-1 flex justify-between gap-4"><span class="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400"><span class="size-2 rounded-full" style="background:' + s.color + '"></span>' + esc(s.name) + '</span><span class="font-semibold tabular-nums text-zinc-900 dark:text-white">' + esc((cfg.format || num.format)(s.values[i])) + '</span></div>';
          }).join('');
          tip.hidden = false;
          var cx = pad.l + bw * i + bw / 2;
          var left = cx + 16;
          if (left + tip.offsetWidth > el.clientWidth) left = cx - tip.offsetWidth - 16;
          tip.style.left = Math.max(0, left) + 'px';
          tip.style.top = '8px';
        });
      });
      holder.addEventListener('mouseleave', function () {
        tip.hidden = true;
        $$('[data-bar]', holder).forEach(function (o) { o.style.opacity = 1; });
      });
    }
    responsive(el, draw);
  }

  function funnel(el, steps) {
    var top = steps[0].value;
    el.innerHTML = steps.map(function (s, i) {
      var pct = s.value / top * 100;
      var conv = i ? Math.round(s.value / steps[i - 1].value * 1000) / 10 : null;
      return '<li class="grid grid-cols-[7rem_1fr] items-center gap-4 sm:grid-cols-[9rem_1fr_4.5rem]">' +
        '<span class="text-sm text-zinc-600 dark:text-zinc-300">' + esc(s.name) + '</span>' +
        '<span class="relative h-9 overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800"><span class="absolute inset-y-0 left-0 rounded-md bg-gradient-to-r from-brand-600 to-brand-400 transition-[width] duration-700" style="width:' + pct.toFixed(1) + '%"></span>' +
        (pct > 30
          ? '<span class="absolute inset-y-0 left-3 flex items-center text-xs font-semibold tabular-nums text-white">' + num.format(s.value) + '</span>'
          : '<span class="absolute inset-y-0 flex items-center text-xs font-semibold tabular-nums text-zinc-700 dark:text-zinc-200" style="left:calc(' + pct.toFixed(1) + '% + 8px)">' + num.format(s.value) + '</span>') +
        '</span>' +
        '<span class="col-start-2 -mt-2 text-xs text-zinc-500 tabular-nums sm:col-start-auto sm:mt-0 sm:text-right dark:text-zinc-400">' + (conv == null ? '100%' : '<span aria-hidden="true">&darr; </span>' + conv + '%<span class="sr-only"> of previous step</span>') + '</span></li>';
    }).join('');
  }

  function heatmap(el) {
    var weeks = 52, r = rng(7);
    var end = new Date(TODAY);
    // Step by calendar days (not 24-hour blocks) so daylight-saving changes never shift a day.
    var start = new Date(end.getFullYear(), end.getMonth(), end.getDate() - ((weeks - 1) * 7 + end.getDay()));
    var days = [];
    for (var d = new Date(start); d <= end; d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)) {
      var weekend = d.getDay() === 0 || d.getDay() === 6;
      var v = Math.max(0, Math.round((weekend ? 6 : 18) * r() + (r() < 0.1 ? 14 : 0) - (r() < 0.15 ? 20 : 0)));
      days.push({ date: new Date(d), value: v });
    }
    var max = Math.max.apply(null, days.map(function (x) { return x.value; }));
    var tip = document.createElement('div');
    tip.className = 'chart-tip';
    tip.hidden = true;
    var holder = document.createElement('div');
    el.innerHTML = '';
    el.appendChild(holder);
    el.appendChild(tip);
    el.classList.add('relative');
    function level(v) { return v === 0 ? 0 : Math.min(4, Math.ceil(v / max * 4)); }
    var fills = ['var(--heat-0)', 'color-mix(in srgb, var(--chart-1) 28%, var(--heat-0))', 'color-mix(in srgb, var(--chart-1) 52%, var(--heat-0))', 'color-mix(in srgb, var(--chart-1) 76%, var(--heat-0))', 'var(--chart-1)'];
    function draw() {
      var W = Math.max(260, el.clientWidth);
      var lab = 28, gap = 3;
      // Show as many recent weeks as fit (all 52 on desktop, fewer on phones).
      var shown = Math.min(weeks, Math.floor((W - lab) / (10 + gap)));
      var skip = weeks - shown;
      var cell = Math.min(16, Math.floor((W - lab) / shown) - gap);
      var H = 18 + 7 * (cell + gap);
      var svg = '<svg width="' + (lab + shown * (cell + gap)) + '" height="' + H + '" class="block max-w-full" aria-hidden="true">';
      ['Mon', 'Wed', 'Fri'].forEach(function (t, k) {
        svg += '<text x="0" y="' + (18 + (1 + k * 2) * (cell + gap) + cell - 2) + '" font-size="10" style="fill:var(--chart-text)">' + t + '</text>';
      });
      var lastMonth = -1;
      days.forEach(function (dd, i) {
        var w = Math.floor((i + start.getDay()) / 7) - skip, dow = dd.date.getDay();
        if (w < 0) return;
        var x = lab + w * (cell + gap), yy = 18 + dow * (cell + gap);
        if (dd.date.getDate() <= 7 && dd.date.getMonth() !== lastMonth && dow === 0) {
          lastMonth = dd.date.getMonth();
          svg += '<text x="' + x + '" y="11" font-size="10" style="fill:var(--chart-text)">' + dd.date.toLocaleDateString('en-US', { month: 'short' }) + '</text>';
        }
        svg += '<rect data-day="' + i + '" x="' + x + '" y="' + yy + '" width="' + cell + '" height="' + cell + '" rx="2.5" style="fill:' + fills[level(dd.value)] + '"/>';
      });
      svg += '</svg>';
      holder.innerHTML = svg;
      $$('[data-day]', holder).forEach(function (rect) {
        rect.addEventListener('mouseenter', function () {
          var dd = days[+rect.dataset.day];
          tip.innerHTML = '<span class="font-semibold text-zinc-900 dark:text-white">' + dd.value + ' orders</span> <span class="text-zinc-500 dark:text-zinc-400">on ' + fmtDate(dd.date, { weekday: 'short', month: 'short', day: 'numeric' }) + '</span>';
          tip.hidden = false;
          var x = +rect.getAttribute('x'), yy = +rect.getAttribute('y');
          var left = x - tip.offsetWidth / 2 + cell / 2;
          tip.style.left = Math.max(0, Math.min(el.clientWidth - tip.offsetWidth, left)) + 'px';
          tip.style.top = (yy - 40) + 'px';
        });
      });
      holder.onmouseleave = function () { tip.hidden = true; };
    }
    responsive(el, draw);
    var total = days.reduce(function (s, x) { return s + x.value; }, 0);
    var t = $('[data-heat-total]');
    if (t) t.textContent = num.format(total);
  }

  $$('[data-sparkline]').forEach(sparkline);

  /* ===================================================================
   * 8. Overview & analytics pages
   * ================================================================= */
  function dayLabels(n, opts) {
    var out = [];
    for (var i = n - 1; i >= 0; i--) out.push(fmtDate(daysAgo(i), opts || { month: 'short', day: 'numeric' }));
    return out;
  }
  // The last twelve months, ending with this month.
  var MONTH_DATES = [];
  for (var mi = 11; mi >= 0; mi--) MONTH_DATES.push(new Date(TODAY.getFullYear(), TODAY.getMonth() - mi, 1));
  var MONTHS = MONTH_DATES.map(function (d) { return fmtDate(d, { month: 'short' }); });
  var MONTH_TIPS = MONTH_DATES.map(function (d) { return fmtDate(d, { month: 'short', year: 'numeric' }); });

  // Dated text in the pages follows TODAY too. Without JavaScript the pages show neutral text instead.
  $$('[data-today-long]').forEach(function (el) {
    el.textContent = ', ' + fmtDate(TODAY, { weekday: 'long', month: 'long', day: 'numeric' });
  });
  $$('[data-range-30d]').forEach(function (el) {
    var from = daysAgo(29);
    el.textContent = from.getFullYear() === TODAY.getFullYear()
      ? fmtDate(from, { month: 'short', day: 'numeric' }) + ' – ' + fmtDate(TODAY)
      : fmtDate(from) + ' – ' + fmtDate(TODAY);
  });
  $$('[data-renews]').forEach(function (el) {
    el.textContent = fmtDate(new Date(TODAY.getFullYear(), TODAY.getMonth() + 1, 1), { month: 'long', day: 'numeric', year: 'numeric' });
  });
  // Billing history: one invoice on the 1st of this month and of each month before it.
  $$('[data-invoice]').forEach(function (row) {
    var d = new Date(TODAY.getFullYear(), TODAY.getMonth() - Number(row.dataset.invoice), 1);
    var id = 'INV-' + d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(3, '0');
    var cells = row.querySelectorAll('td');
    cells[0].textContent = id;
    cells[1].textContent = fmtDate(d);
    var link = row.querySelector('[data-toast-msg]');
    if (link) link.setAttribute('data-toast-msg', 'Downloading ' + id + '.pdf');
  });
  // Scale a generated series so it adds up to a given total (keeps the KPI cards and chart consistent).
  function scaleTo(arr, total) {
    var sum = arr.reduce(function (a, b) { return a + b; }, 0);
    var out = arr.map(function (v) { return Math.round(v * total / sum); });
    out[out.length - 1] += total - out.reduce(function (a, b) { return a + b; }, 0); // fix rounding drift
    return out;
  }
  var REVENUE = {
    '7d': { labels: dayLabels(7, { weekday: 'short' }), tip: dayLabels(7, { weekday: 'long', month: 'short', day: 'numeric' }), now: scaleTo(series(11, 7, 1650, 380, 18), 11240), prev: scaleTo(series(12, 7, 1500, 300, 5), 10584) },
    '30d': { labels: dayLabels(30), tip: dayLabels(30, { weekday: 'short', month: 'short', day: 'numeric' }), now: scaleTo(series(21, 30, 1450, 320, 9), 48290), prev: scaleTo(series(22, 30, 1350, 280, 4), 42963) },
    '12m': { labels: MONTHS, tip: MONTH_TIPS, now: scaleTo(series(31, 12, 32000, 6200, 1500), 512880), prev: scaleTo(series(32, 12, 28000, 5000, 900), 431350) }
  };
  var revEl = $('[data-revenue-chart]');
  if (revEl) {
    var revChart;
    var setRange = function (key) {
      var d = REVENUE[key];
      var total = d.now.reduce(function (a, b) { return a + b; }, 0);
      var prev = d.prev.reduce(function (a, b) { return a + b; }, 0);
      var delta = (total - prev) / prev * 100;
      $('[data-revenue-total]').textContent = money0.format(total);
      var dEl = $('[data-revenue-delta]');
      dEl.textContent = (delta >= 0 ? '+' : '') + delta.toFixed(1) + '%';
      dEl.className = 'badge ' + (delta >= 0 ? 'badge-green' : 'badge-red');
      revEl.setAttribute('aria-label', 'Revenue chart, ' + key + ': ' + money0.format(total) + ' total. Use left and right arrow keys to read values.');
      var cfg = {
        labels: d.labels, tipLabels: d.tip, format: money0.format, axis: function (v) { return '$' + short(v); },
        series: [
          { name: 'This period', color: color(1), values: d.now, area: true },
          { name: 'Previous period', color: 'var(--chart-text)', values: d.prev, dashed: true }
        ]
      };
      if (revChart) revChart.update(cfg); else revChart = lineChart(revEl, Object.assign({ height: 280 }, cfg));
    };
    $$('[data-range]').forEach(function (b) {
      b.addEventListener('click', function () {
        $$('[data-range]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        setRange(b.dataset.range);
      });
    });
    setRange('30d');
  }

  var trafficEl = $('#traffic-donut');
  if (trafficEl) {
    donut(trafficEl, [
      { name: 'Organic search', value: 18420, color: color(1) },
      { name: 'Direct', value: 9310, color: color(2) },
      { name: 'Social', value: 6280, color: color(3) },
      { name: 'Referral', value: 3940, color: color(4) },
      { name: 'Email', value: 2650, color: color(5) }
    ], 'Sessions');
  }

  function orderRow(o, compact) {
    return '<tr>' +
      '<td class="font-medium text-zinc-900 dark:text-white"><a class="hover:text-brand-600 dark:hover:text-brand-400" href="orders.html?q=' + o.id + '">' + o.id + '</a></td>' +
      '<td><div class="flex items-center gap-2.5">' + avatar(o.customer, 'size-7') + '<span class="text-zinc-700 dark:text-zinc-300">' + esc(o.customer) + '</span></div></td>' +
      (compact ? '' : '<td class="text-zinc-500 dark:text-zinc-400">' + esc(o.product) + '</td>') +
      '<td><span class="badge ' + o.badge + '">' + o.status + '</span></td>' +
      '<td class="text-right font-medium tabular-nums text-zinc-900 dark:text-white">' + money.format(o.total) + '</td></tr>';
  }
  var recent = $('[data-recent-orders]');
  if (recent) recent.innerHTML = ORDERS.slice(0, 8).map(function (o) { return orderRow(o, true); }).join('');

  var topProducts = $('[data-top-products]');
  if (topProducts) {
    var best = PRODUCTS.slice().sort(function (a, b) { return b.sold * b.price - a.sold * a.price; }).slice(0, 5);
    var bestMax = best[0].sold * best[0].price;
    topProducts.innerHTML = best.map(function (p) {
      var rev = p.sold * p.price;
      return '<li class="py-2.5"><div class="flex items-center justify-between gap-3 text-sm"><span class="truncate text-zinc-700 dark:text-zinc-300">' + esc(p.name) + '</span><span class="font-medium tabular-nums text-zinc-900 dark:text-white">' + money0.format(rev) + '</span></div>' +
        '<div class="mt-1.5 h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800"><div class="h-full rounded-full bg-brand-500" style="width:' + (rev / bestMax * 100).toFixed(1) + '%"></div></div></li>';
    }).join('');
  }

  // Analytics
  var trafficLine = $('[data-traffic-chart]');
  if (trafficLine) {
    var tSeries = [
      { name: 'Visitors', color: color(1), values: series(51, 30, 4200, 600, 22), area: true },
      { name: 'Sign-ups', color: color(2), values: series(52, 30, 1400, 260, 8) },
      { name: 'Trials', color: color(4), values: series(53, 30, 520, 120, 4) }
    ];
    var tChart = lineChart(trafficLine, { labels: dayLabels(30), tipLabels: dayLabels(30, { weekday: 'short', month: 'short', day: 'numeric' }), series: tSeries, height: 300 });
    trafficLine.setAttribute('aria-label', 'Visitors, sign-ups and trials over the last 30 days. Use arrow keys to read values.');
    var legendEl = $('[data-traffic-legend]');
    legendEl.innerHTML = tSeries.map(function (s, i) {
      return '<button type="button" aria-pressed="true" data-series="' + i + '" class="inline-flex items-center gap-2 rounded-md px-2 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-100 aria-[pressed=false]:opacity-40 dark:text-zinc-300 dark:hover:bg-zinc-800"><span class="size-2.5 rounded-full" style="background:' + s.color + '"></span>' + s.name + '</button>';
    }).join('');
    $$('[data-series]', legendEl).forEach(function (b) {
      b.addEventListener('click', function () {
        var s = tSeries[+b.dataset.series];
        var visible = tSeries.filter(function (x) { return !x.hidden; }).length;
        if (!s.hidden && visible === 1) return; // keep at least one line
        s.hidden = !s.hidden;
        b.setAttribute('aria-pressed', String(!s.hidden));
        tChart.redraw();
      });
    });
  }
  var channelEl = $('[data-channel-chart]');
  if (channelEl) {
    barChart(channelEl, {
      labels: MONTHS, format: money0.format, axis: function (v) { return '$' + short(v); },
      series: [
        { name: 'New customers', color: color(1), values: series(61, 12, 14000, 3000, 600) },
        { name: 'Returning', color: color(2), values: series(62, 12, 11000, 2400, 500) }
      ]
    });
  }
  var funnelEl = $('[data-funnel]');
  if (funnelEl) {
    funnel(funnelEl, [
      { name: 'Store visits', value: 48210 },
      { name: 'Product views', value: 27680 },
      { name: 'Added to cart', value: 8912 },
      { name: 'Checkout', value: 4310 },
      { name: 'Purchased', value: 2864 }
    ]);
  }
  var heatEl = $('[data-heatmap]');
  if (heatEl) heatmap(heatEl);

  /* ===================================================================
   * 9. Orders table: search, filter, sort, paginate, select
   * ================================================================= */
  var ordersBody = $('[data-orders-body]');
  if (ordersBody) {
    var params = new URLSearchParams(location.search);
    var state = { q: params.get('q') || '', status: 'All', sort: 'date', dir: -1, page: 1, per: 10, selected: {} };
    var qInput = $('[data-orders-search]');
    var statusSel = $('[data-orders-status]');
    qInput.value = state.q;

    // Status tab counts
    $$('[data-status-count]').forEach(function (el) {
      var s = el.dataset.statusCount;
      el.textContent = s === 'All' ? ORDERS.length : ORDERS.filter(function (o) { return o.status === s; }).length;
    });

    var filtered = function () {
      var q = state.q.trim().toLowerCase();
      var list = ORDERS.filter(function (o) {
        return (state.status === 'All' || o.status === state.status) &&
          (!q || (o.id + ' ' + o.customer + ' ' + o.product + ' ' + o.channel).toLowerCase().indexOf(q) !== -1);
      });
      list.sort(function (a, b) {
        var x = a[state.sort], y = b[state.sort];
        if (x instanceof Date) { x = +x; y = +y; }
        return (x > y ? 1 : x < y ? -1 : 0) * state.dir;
      });
      return list;
    };
    var renderOrders = function () {
      var list = filtered();
      var pages = Math.max(1, Math.ceil(list.length / state.per));
      state.page = Math.min(state.page, pages);
      var startIdx = (state.page - 1) * state.per;
      var pageItems = list.slice(startIdx, startIdx + state.per);
      ordersBody.innerHTML = pageItems.map(function (o) {
        var sel = !!state.selected[o.id];
        return '<tr class="' + (sel ? 'bg-brand-50/60 dark:bg-brand-500/5' : '') + '">' +
          '<td class="w-10"><input type="checkbox" class="checkbox" data-select="' + o.id + '" aria-label="Select order ' + o.id + '"' + (sel ? ' checked' : '') + '></td>' +
          '<td class="font-medium text-zinc-900 dark:text-white">' + o.id + '</td>' +
          '<td><div class="flex items-center gap-2.5">' + avatar(o.customer, 'size-7') + '<div><div class="text-zinc-900 dark:text-white">' + esc(o.customer) + '</div><div class="text-xs text-zinc-500 dark:text-zinc-400">' + o.items + (o.items > 1 ? ' items' : ' item') + '</div></div></div></td>' +
          '<td class="text-zinc-500 dark:text-zinc-400">' + fmtDate(o.date) + '</td>' +
          '<td><span class="badge ' + o.badge + '">' + o.status + '</span></td>' +
          '<td class="text-zinc-500 dark:text-zinc-400">' + esc(o.channel) + '</td>' +
          '<td class="text-right font-medium tabular-nums text-zinc-900 dark:text-white">' + money.format(o.total) + '</td>' +
          '<td class="w-10 text-right"><button type="button" class="icon-btn size-8" data-toast-row="' + o.id + '" aria-label="More actions for ' + o.id + '"><svg viewBox="0 0 20 20" fill="currentColor" class="size-4" aria-hidden="true"><circle cx="4" cy="10" r="1.5"/><circle cx="10" cy="10" r="1.5"/><circle cx="16" cy="10" r="1.5"/></svg></button></td></tr>';
      }).join('');
      $('[data-orders-empty]').hidden = list.length > 0;
      $('[data-orders-range]').textContent = list.length ? (startIdx + 1) + '–' + (startIdx + pageItems.length) + ' of ' + list.length : '0 results';
      $('[data-page-prev]').disabled = state.page <= 1;
      $('[data-page-next]').disabled = state.page >= pages;
      var nums = $('[data-page-numbers]');
      var html = '';
      for (var p = 1; p <= pages; p++) {
        html += '<button type="button" data-page="' + p + '" class="hidden size-8 rounded-lg text-sm font-medium sm:inline-grid sm:place-items-center ' + (p === state.page ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800') + '"' + (p === state.page ? ' aria-current="page"' : '') + ' aria-label="Page ' + p + '">' + p + '</button>';
      }
      nums.innerHTML = html;
      $$('th[data-sort]').forEach(function (th) {
        th.setAttribute('aria-sort', th.dataset.sort === state.sort ? (state.dir > 0 ? 'ascending' : 'descending') : 'none');
      });
      var all = $('[data-select-all]');
      var onPage = pageItems.filter(function (o) { return state.selected[o.id]; }).length;
      all.checked = pageItems.length > 0 && onPage === pageItems.length;
      all.indeterminate = onPage > 0 && onPage < pageItems.length;
      var count = Object.keys(state.selected).length;
      var bar = $('[data-bulk-bar]');
      bar.hidden = count === 0;
      $('[data-bulk-count]').textContent = count + (count === 1 ? ' order selected' : ' orders selected');
    };

    qInput.addEventListener('input', function () { state.q = qInput.value; state.page = 1; renderOrders(); });
    statusSel.addEventListener('change', function () {
      state.status = statusSel.value; state.page = 1;
      $$('[data-status-tab]').forEach(function (t) { t.setAttribute('aria-pressed', String(t.dataset.statusTab === state.status)); });
      renderOrders();
    });
    $$('[data-status-tab]').forEach(function (t) {
      t.addEventListener('click', function () {
        statusSel.value = t.dataset.statusTab;
        statusSel.dispatchEvent(new Event('change'));
      });
    });
    $$('th[data-sort] .sort-btn').forEach(function (b) {
      b.addEventListener('click', function () {
        var key = b.parentNode.dataset.sort;
        if (state.sort === key) state.dir *= -1; else { state.sort = key; state.dir = key === 'customer' || key === 'id' ? 1 : -1; }
        renderOrders();
      });
    });
    $('[data-page-prev]').addEventListener('click', function () { state.page--; renderOrders(); });
    $('[data-page-next]').addEventListener('click', function () { state.page++; renderOrders(); });
    $('[data-page-numbers]').addEventListener('click', function (e) {
      var b = e.target.closest('[data-page]'); if (!b) return;
      state.page = +b.dataset.page; renderOrders();
    });
    ordersBody.addEventListener('change', function (e) {
      var id = e.target.dataset.select; if (!id) return;
      if (e.target.checked) state.selected[id] = true; else delete state.selected[id];
      renderOrders();
    });
    ordersBody.addEventListener('click', function (e) {
      var b = e.target.closest('[data-toast-row]');
      if (b) toast('Opening actions for order ' + b.dataset.toastRow + '…');
    });
    $('[data-select-all]').addEventListener('change', function (e) {
      var list = filtered();
      var startIdx = (state.page - 1) * state.per;
      list.slice(startIdx, startIdx + state.per).forEach(function (o) {
        if (e.target.checked) state.selected[o.id] = true; else delete state.selected[o.id];
      });
      renderOrders();
    });
    $('[data-bulk-clear]').addEventListener('click', function () { state.selected = {}; renderOrders(); });
    $('[data-bulk-paid]').addEventListener('click', function () {
      var n = 0;
      ORDERS.forEach(function (o) {
        if (state.selected[o.id] && o.status !== 'Paid') { o.status = 'Paid'; o.badge = 'badge-green'; n++; }
      });
      var count = Object.keys(state.selected).length;
      state.selected = {};
      renderOrders();
      toast(n ? n + ' of ' + count + ' orders marked as paid' : 'Those orders were already paid');
    });
    $('[data-bulk-export]').addEventListener('click', function () {
      toast('Exporting ' + Object.keys(state.selected).length + ' orders. The CSV will arrive by email.');
    });
    renderOrders();
  }

  /* ===================================================================
   * 10. Customers list & detail panel
   * ================================================================= */
  var custBody = $('[data-customers-body]');
  if (custBody) {
    var cq = $('[data-customers-search]');
    var seg = 'All';
    cq.value = new URLSearchParams(location.search).get('q') || '';
    var renderCustomers = function () {
      var q = cq.value.trim().toLowerCase();
      var list = CUSTOMERS.filter(function (c) {
        return (seg === 'All' || c.segment === seg) && (!q || (c.name + ' ' + c.email + ' ' + c.city).toLowerCase().indexOf(q) !== -1);
      });
      custBody.innerHTML = list.map(function (c) {
        var i = CUSTOMERS.indexOf(c);
        var badge = c.segment === 'VIP' ? 'badge-blue' : c.segment === 'Returning' ? 'badge-green' : 'badge-zinc';
        return '<tr class="cursor-pointer" data-customer="' + i + '">' +
          '<td><button type="button" class="flex items-center gap-3 text-left" data-open-customer="' + i + '">' + avatar(c.name, 'size-9') + '<span><span class="block font-medium text-zinc-900 dark:text-white">' + esc(c.name) + '</span><span class="block text-xs text-zinc-500 dark:text-zinc-400">' + esc(c.email) + '</span></span></button></td>' +
          '<td class="text-zinc-500 dark:text-zinc-400">' + esc(c.city) + '</td>' +
          '<td><span class="badge ' + badge + '">' + c.segment + '</span></td>' +
          '<td class="tabular-nums text-zinc-700 dark:text-zinc-300">' + c.orders + '</td>' +
          '<td class="text-right font-medium tabular-nums text-zinc-900 dark:text-white">' + money.format(c.spent) + '</td></tr>';
      }).join('');
      $('[data-customers-empty]').hidden = list.length > 0;
      $('[data-customers-count]').textContent = list.length + (list.length === 1 ? ' customer' : ' customers');
    };
    cq.addEventListener('input', renderCustomers);
    $$('[data-segment]').forEach(function (b) {
      b.addEventListener('click', function () {
        seg = b.dataset.segment;
        $$('[data-segment]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        renderCustomers();
      });
    });
    custBody.addEventListener('click', function (e) {
      var row = e.target.closest('[data-customer]');
      if (row) openCustomer(+row.dataset.customer, $('[data-open-customer]', row));
    });

    var panel = $('#customer-panel');
    var panelOpener = null;
    var openCustomer = function (i, opener) {
      var c = CUSTOMERS[i];
      panelOpener = opener;
      $('[data-panel-avatar]', panel).innerHTML = avatar(c.name, 'size-14 text-base');
      $('[data-panel-name]', panel).textContent = c.name;
      $('[data-panel-email]', panel).textContent = c.email;
      $('[data-panel-city]', panel).textContent = c.city;
      $('[data-panel-joined]', panel).textContent = fmtDate(c.joined, { month: 'long', year: 'numeric' });
      $('[data-panel-orders]', panel).textContent = c.orders;
      $('[data-panel-spent]', panel).textContent = money0.format(c.spent);
      $('[data-panel-aov]', panel).textContent = money0.format(c.spent / Math.max(1, c.orders));
      $('[data-panel-segment]', panel).textContent = c.segment;
      $('[data-panel-recent]', panel).innerHTML = c.recent.length ? c.recent.map(function (o) {
        return '<li class="flex items-center justify-between gap-3 py-3 text-sm"><div><div class="font-medium text-zinc-900 dark:text-white">' + o.id + '</div><div class="text-xs text-zinc-500 dark:text-zinc-400">' + fmtDate(o.date) + ' · ' + esc(o.product) + '</div></div><div class="text-right"><div class="font-medium tabular-nums text-zinc-900 dark:text-white">' + money.format(o.total) + '</div><span class="badge ' + o.badge + ' mt-1">' + o.status + '</span></div></li>';
      }).join('') : '<li class="py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">No orders in the last 30 days.</li>';
      panel.hidden = false;
      document.body.classList.add('overflow-hidden');
      requestAnimationFrame(function () { $('[data-panel-sheet]', panel).classList.remove('translate-x-full'); });
      $('[data-panel-close]', panel).focus();
    };
    var closePanel = function () {
      $('[data-panel-sheet]', panel).classList.add('translate-x-full');
      setTimeout(function () { panel.hidden = true; }, reduceMotion ? 0 : 250);
      document.body.classList.remove('overflow-hidden');
      if (panelOpener) panelOpener.focus();
    };
    $$('[data-panel-close]', panel).forEach(function (b) { b.addEventListener('click', closePanel); });
    $('[data-panel-backdrop]', panel).addEventListener('click', closePanel);
    panel.addEventListener('keydown', function (e) { if (e.key === 'Escape') closePanel(); else trap(panel, e); });
    renderCustomers();
  }

  /* ===================================================================
   * 11. Products: grid/table view, category filter, inventory
   * ================================================================= */
  var ICONS = {
    pack: '<rect x="16" y="14" width="32" height="40" rx="9"/><rect x="22" y="32" width="20" height="14" rx="3" fill-opacity=".45"/><path d="M24 14v-3a8 8 0 0 1 16 0v3" fill="none" stroke-width="3"/>',
    shoe: '<path d="M8 40c4-8 12-14 16-18l8 6c6 4 14 6 22 7 2 0 3 2 3 4v4H8z"/><rect x="8" y="44" width="49" height="5" rx="2.5" fill-opacity=".45"/>',
    jacket: '<path d="M22 12h20l12 10-5 9-5-3v26H20V28l-5 3-5-9z"/><path d="M32 14v40" fill="none" stroke-width="2" stroke-opacity=".45"/>',
    bottle: '<rect x="25" y="8" width="14" height="7" rx="2" fill-opacity=".6"/><rect x="21" y="15" width="22" height="41" rx="7"/><rect x="21" y="28" width="22" height="10" fill-opacity=".4"/>',
    tent: '<path d="M32 10 56 52H8z"/><path d="M32 26 40 52H24z" fill-opacity=".45"/>',
    glasses: '<circle cx="20" cy="34" r="10"/><circle cx="44" cy="34" r="10"/><path d="M30 32h4M10 30 6 24M54 30l4-6" fill="none" stroke-width="3"/>',
    sock: '<path d="M22 8h16v26l12 10a7 7 0 0 1-8 11L24 44a6 6 0 0 1-2-5z"/><rect x="22" y="8" width="16" height="7" fill-opacity=".45"/>',
    lamp: '<rect x="8" y="26" width="48" height="8" rx="4" fill-opacity=".45"/><rect x="22" y="20" width="20" height="20" rx="6"/><circle cx="32" cy="30" r="5" fill-opacity=".45"/>',
    bag: '<rect x="14" y="12" width="36" height="42" rx="16"/><path d="M20 30h24" fill="none" stroke-width="3" stroke-opacity=".45"/>',
    poles: '<path d="M22 8 18 56M42 8l4 48" fill="none" stroke-width="4"/><rect x="18" y="8" width="8" height="12" rx="3"/><rect x="38" y="8" width="8" height="12" rx="3"/>',
    mug: '<rect x="12" y="18" width="30" height="34" rx="6"/><path d="M42 26h5a6 6 0 0 1 0 12h-5" fill="none" stroke-width="4"/>'
  };
  var HUES = {
    indigo: 'bg-indigo-50 text-indigo-500 dark:bg-indigo-500/10 dark:text-indigo-400',
    amber: 'bg-amber-50 text-amber-500 dark:bg-amber-500/10 dark:text-amber-400',
    cyan: 'bg-cyan-50 text-cyan-500 dark:bg-cyan-500/10 dark:text-cyan-400',
    emerald: 'bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-400',
    pink: 'bg-pink-50 text-pink-500 dark:bg-pink-500/10 dark:text-pink-400',
    violet: 'bg-violet-50 text-violet-500 dark:bg-violet-500/10 dark:text-violet-400'
  };
  function thumb(p, size) {
    return '<span class="grid ' + size + ' shrink-0 place-items-center rounded-lg ' + HUES[p.hue] + '" aria-hidden="true"><svg viewBox="0 0 64 64" class="size-3/5 drop-shadow-sm" fill="currentColor" stroke="currentColor" stroke-linecap="round"><ellipse cx="32" cy="60" rx="20" ry="2.5" fill-opacity=".18" stroke="none"/>' + ICONS[p.icon] + '</svg></span>';
  }
  function stockInfo(p) {
    var pct = p.stock / p.cap * 100;
    if (p.stock === 0) return { label: 'Out of stock', badge: 'badge-red', bar: 'bg-red-500', pct: 0 };
    if (pct < 15) return { label: 'Low stock', badge: 'badge-amber', bar: 'bg-amber-500', pct: pct };
    return { label: 'In stock', badge: 'badge-green', bar: 'bg-emerald-500', pct: pct };
  }
  var prodGrid = $('[data-products-grid]');
  if (prodGrid) {
    var pState = { cat: 'All', q: new URLSearchParams(location.search).get('q') || '', view: 'grid' };
    // Only accept known views; anything else in storage would hide both layouts.
    try { pState.view = safeStorage.getItem('ns-products-view') === 'table' ? 'table' : 'grid'; } catch (e) {}
    var pq = $('[data-products-search]');
    pq.value = pState.q;
    var prodTable = $('[data-products-table]');
    var low = PRODUCTS.filter(function (p) { return p.stock > 0 && p.stock / p.cap < 0.15; }).length;
    var out = PRODUCTS.filter(function (p) { return p.stock === 0; }).length;
    var value = PRODUCTS.reduce(function (s, p) { return s + p.stock * p.price; }, 0);
    $('[data-stat-products]').textContent = PRODUCTS.length;
    $('[data-stat-low]').textContent = low;
    $('[data-stat-out]').textContent = out;
    $('[data-stat-value]').textContent = money0.format(value);

    var renderProducts = function () {
      var q = pq.value.trim().toLowerCase();
      var list = PRODUCTS.filter(function (p) {
        return (pState.cat === 'All' || p.cat === pState.cat) && (!q || (p.name + ' ' + p.sku + ' ' + p.cat).toLowerCase().indexOf(q) !== -1);
      });
      prodGrid.innerHTML = list.map(function (p) {
        var s = stockInfo(p);
        return '<article class="card group flex flex-col p-4">' +
          '<div class="relative">' + thumb(p, 'aspect-[4/3] w-full') + '<span class="badge ' + s.badge + ' absolute top-2.5 left-2.5">' + s.label + '</span></div>' +
          '<div class="mt-4 flex items-start justify-between gap-3"><div class="min-w-0"><h3 class="truncate text-sm font-semibold text-zinc-900 dark:text-white">' + esc(p.name) + '</h3><p class="mt-0.5 font-mono text-xs text-zinc-500 dark:text-zinc-400">' + p.sku + ' · ' + p.cat + '</p></div><p class="text-sm font-semibold tabular-nums text-zinc-900 dark:text-white">' + money0.format(p.price) + '</p></div>' +
          '<div class="mt-4"><div class="flex justify-between text-xs text-zinc-500 dark:text-zinc-400"><span>Inventory</span><span class="tabular-nums">' + p.stock + ' / ' + p.cap + '</span></div><div class="mt-1.5 h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800" role="meter" aria-label="Inventory for ' + esc(p.name) + '" aria-valuemin="0" aria-valuemax="' + p.cap + '" aria-valuenow="' + p.stock + '"><div class="h-full rounded-full ' + s.bar + '" style="width:' + s.pct.toFixed(1) + '%"></div></div></div>' +
          '<div class="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400"><span>' + num.format(p.sold) + ' sold</span><button type="button" class="font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400" data-restock="' + esc(p.name) + '">Restock</button></div></article>';
      }).join('');
      $('[data-products-tbody]').innerHTML = list.map(function (p) {
        var s = stockInfo(p);
        return '<tr><td><div class="flex items-center gap-3">' + thumb(p, 'size-10') + '<div><div class="font-medium text-zinc-900 dark:text-white">' + esc(p.name) + '</div><div class="font-mono text-xs text-zinc-500 dark:text-zinc-400">' + p.sku + '</div></div></div></td>' +
          '<td class="text-zinc-500 dark:text-zinc-400">' + p.cat + '</td>' +
          '<td><div class="flex w-40 items-center gap-3"><div class="h-1.5 flex-1 rounded-full bg-zinc-100 dark:bg-zinc-800"><div class="h-full rounded-full ' + s.bar + '" style="width:' + s.pct.toFixed(1) + '%"></div></div><span class="w-14 text-right text-xs tabular-nums text-zinc-500 dark:text-zinc-400">' + p.stock + '/' + p.cap + '</span></div></td>' +
          '<td><span class="badge ' + s.badge + '">' + s.label + '</span></td>' +
          '<td class="text-right tabular-nums text-zinc-700 dark:text-zinc-300">' + num.format(p.sold) + '</td>' +
          '<td class="text-right font-medium tabular-nums text-zinc-900 dark:text-white">' + money0.format(p.price) + '</td>' +
          '<td class="text-right"><button type="button" class="btn btn-ghost px-2 py-1 text-xs" data-restock="' + esc(p.name) + '">Restock</button></td></tr>';
      }).join('');
      $('[data-products-empty]').hidden = list.length > 0;
      prodGrid.hidden = pState.view !== 'grid' || !list.length;
      prodTable.hidden = pState.view !== 'table' || !list.length;
      $$('[data-view]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.view === pState.view)); });
      $('[data-products-count]').textContent = list.length + (list.length === 1 ? ' product' : ' products');
    };
    pq.addEventListener('input', renderProducts);
    $$('[data-cat]').forEach(function (b) {
      b.addEventListener('click', function () {
        pState.cat = b.dataset.cat;
        $$('[data-cat]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        renderProducts();
      });
    });
    $$('[data-view]').forEach(function (b) {
      b.addEventListener('click', function () {
        pState.view = b.dataset.view;
        try { safeStorage.setItem('ns-products-view', pState.view); } catch (e) {}
        renderProducts();
      });
    });
    document.addEventListener('click', function (e) {
      var b = e.target.closest('[data-restock]');
      if (b) toast('Restock request ' + makeRef('TC') + ' created for ' + b.dataset.restock);
    });
    renderProducts();
  }

  /* ===================================================================
   * 12. Settings & sign-in
   * ================================================================= */
  HANDLERS.invite = function (form) {
    var email = $('#invite-email', form).value.trim();
    var role = $('#invite-role', form).value;
    var name = email.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
    var row = document.createElement('li');
    row.className = 'flex flex-wrap items-center justify-between gap-3 px-5 py-4';
    row.innerHTML = '<div class="flex min-w-0 items-center gap-3">' + avatar(name, 'size-9') + '<div class="min-w-0"><div class="truncate text-sm font-medium text-zinc-900 dark:text-white">' + esc(name) + ' <span class="badge badge-amber ml-1">Invited</span></div><div class="truncate text-xs text-zinc-500 dark:text-zinc-400">' + esc(email) + '</div></div></div>' +
      '<span class="text-sm text-zinc-500 dark:text-zinc-400">' + esc(role) + '</span>';
    $('[data-team-list]').appendChild(row);
    form.reset();
    closeModal($('#invite-modal'));
    toast('Invitation sent to ' + email);
  };
  HANDLERS.signin = function (form) {
    var btn = $('button[type=submit]', form);
    btn.disabled = true;
    btn.textContent = 'Signing in…';
    // Demo only: no account is checked. Replace with a call to your auth API.
    setTimeout(function () { location.href = 'index.html'; }, 700);
  };
  $$('[data-team-list]').forEach(function (list) {
    list.addEventListener('click', function (e) {
      var b = e.target.closest('[data-remove-member]');
      if (!b) return;
      var li = b.closest('li');
      var name = b.dataset.removeMember;
      li.remove();
      toast(name + ' removed from the team');
    });
  });
  $$('[data-plan]').forEach(function (b) {
    b.addEventListener('click', function () {
      $$('[data-plan]').forEach(function (x) {
        var on = x === b;
        x.setAttribute('aria-pressed', String(on));
        x.textContent = on ? 'Current plan' : 'Switch to ' + x.dataset.plan;
        x.closest('[data-plan-card]').classList.toggle('ring-2', on);
        x.closest('[data-plan-card]').classList.toggle('ring-brand-500', on);
      });
      $('[data-current-plan]').textContent = b.dataset.plan;
      toast('Plan changed to ' + b.dataset.plan + '. The new price starts on your next invoice.');
    });
  });
  $$('[data-password-toggle]').forEach(function (b) {
    b.addEventListener('click', function () {
      var input = document.getElementById(b.getAttribute('aria-controls'));
      var show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      b.setAttribute('aria-pressed', String(show));
      b.textContent = show ? 'Hide' : 'Show';
    });
  });
  var bio = $('#profile-bio');
  if (bio) {
    var counter = $('[data-bio-count]');
    var upd = function () { counter.textContent = bio.value.length + ' / 240'; };
    bio.addEventListener('input', upd);
    upd();
  }
  bindForms(document);

  /* ===================================================================
   * 13. Scroll reveal: reveals everything above an element too, so fast
   *     jumps never leave hidden content behind.
   * ================================================================= */
  var reveals = $$('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var idx = reveals.indexOf(en.target);
        for (var i = 0; i <= idx; i++) {
          if (!reveals[i].classList.contains('is-in')) { reveals[i].classList.add('is-in'); io.unobserve(reveals[i]); }
        }
      });
    }, { rootMargin: '0px 0px -5% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  }
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

/* ---------- Footer year ----------
   The copyright year in the footer (<span data-year>) is this year, so it never goes stale. */
(function () {
  'use strict';
  Array.prototype.forEach.call(document.querySelectorAll('[data-year]'), function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
