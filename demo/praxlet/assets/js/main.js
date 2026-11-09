/* Praxlet — module catalog, low-voltage build planning and inquiries.
   Catalog prices are cents. Current is a planning allowance in milliamps. */
(() => {
  "use strict";
  const TIME_ZONE = "America/New_York";
  const POWER_MARGIN = 1.25;
  const MAX_COMPARE = 4;
  const MAX_SAVED = 6;
  const MAX_MODULE_QTY = 4;
  const STORAGE = {
    build: "praxlet:build:v1",
    saved: "praxlet:saved:v1",
    compare: "praxlet:compare:v1",
  };
  const AGE_NOTE = "Recommended for ages 11+. Contains small parts.";
  const TOPICS = {
    quote: "quote",
    kit: "kit or classroom set",
    module: "module specification",
    project: "project question",
    visit: "workbench visit",
    support: "build support question",
  };
  const INTERFACES = {
    core: "Controller",
    power: "Selectable supply",
    mechanical: "Mechanical",
    i2c: "I²C",
    pwm: "PWM",
    digital: "Digital",
    analogue: "Analog",
  };
  const CATEGORIES = ["Control", "Power", "Motion", "Sensing", "Output", "Structure"];
  const { modules: MODULES, projects: PROJECTS, guides: GUIDES, team: TEAM } = window.PRAXLET_DATA;
  const MODULE_MAP = Object.fromEntries(MODULES.map((item) => [item.id, item]));
  const PROJECT_MAP = Object.fromEntries(PROJECTS.map((item) => [item.id, item]));
  const GUIDE_MAP = Object.fromEntries(GUIDES.map((item) => [item.id, item]));
  const own = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];
  const escape = (value) =>
    String(value).replace(
      /[&<>"']/g,
      (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char],
    );
  const money = (pence) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(
      pence / 100,
    );
  const number = (value) => new Intl.NumberFormat("en-US").format(value);
  const plural = (n, word, words = word + "s") => `${n} ${n === 1 ? word : words}`;
  const clamp = (value, min, max, fallback = min) => {
    const parsed = ["number", "string"].includes(typeof value) ? Number(value) : NaN;
    return Number.isFinite(parsed) ? Math.max(min, Math.min(max, Math.floor(parsed))) : fallback;
  };
  const cleanText = (value, max) =>
    typeof value === "string"
      ? value
          .replace(/[\u0000-\u001f\u007f]/g, "")
          .trim()
          .slice(0, max)
      : "";
  const validModule = (id) => typeof id === "string" && own(MODULE_MAP, id);
  const validProject = (id) => typeof id === "string" && own(PROJECT_MAP, id);
  const parameters = new URLSearchParams(location.search);
  const arrow =
    '<svg class="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 12h16m-7-7 7 7-7 7"/></svg>';

  // A write always reaches memory first. Every storage operation is isolated here.
  const safeStorage = (() => {
    const memory = new Map();
    let available = true;
    return {
      getItem(key) {
        if (available) {
          try {
            const value = window.localStorage.getItem(key);
            if (value !== null) memory.set(key, value);
            return value;
          } catch {
            available = false;
          }
        }
        return memory.has(key) ? memory.get(key) : null;
      },
      setItem(key, value) {
        const text = String(value);
        memory.set(key, text);
        if (available) {
          try {
            window.localStorage.setItem(key, text);
          } catch {
            available = false;
          }
        }
      },
      removeItem(key) {
        memory.delete(key);
        if (available) {
          try {
            window.localStorage.removeItem(key);
          } catch {
            available = false;
          }
        }
      },
    };
  })();
  function readJSON(key) {
    const raw = safeStorage.getItem(key);
    if (raw === null) return null;
    try {
      return JSON.parse(raw);
    } catch {
      safeStorage.removeItem(key);
      return null;
    }
  }
  function writeJSON(key, value) {
    safeStorage.setItem(key, JSON.stringify(value));
  }
  function projectBuild(project) {
    return {
      parts: Object.entries(project.parts).map(([id, qty]) => ({ id, qty })),
      voltage: project.voltage,
      budget: 35000,
      kits: 1,
    };
  }
  function cleanBuild(raw) {
    const clean = { parts: [], voltage: 5, budget: 35000, kits: 1 };
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return clean;
    if (own(raw, "voltage") && ["number", "string"].includes(typeof raw.voltage)) {
      const voltage = Number(raw.voltage);
      if ([3.3, 5].includes(voltage)) clean.voltage = voltage;
    }
    if (own(raw, "budget")) clean.budget = clamp(raw.budget, 0, 1000000, 35000);
    if (own(raw, "kits")) clean.kits = clamp(raw.kits, 1, 12, 1);
    if (own(raw, "parts") && Array.isArray(raw.parts))
      raw.parts.slice(0, 64).forEach((part) => {
        if (!part || typeof part !== "object" || !own(part, "id") || !validModule(part.id)) return;
        const item = MODULE_MAP[part.id];
        const limit =
          ["core", "power"].includes(item.interface) || item.id === "tackrail" || item.id === "shelfwing"
            ? 1
            : MAX_MODULE_QTY;
        const qty = clamp(own(part, "qty") ? part.qty : 1, 1, limit);
        const existing = clean.parts.find((row) => row.id === item.id);
        if (existing) existing.qty = Math.min(limit, existing.qty + qty);
        else clean.parts.push({ id: item.id, qty });
      });
    return clean;
  }
  function readBuild() {
    const raw = readJSON(STORAGE.build);
    const clean = raw === null ? projectBuild(PROJECT_MAP["line-courier"]) : cleanBuild(raw);
    writeJSON(STORAGE.build, clean);
    return clean;
  }
  function saveBuild(build) {
    writeJSON(STORAGE.build, cleanBuild(build));
  }
  function readCompare() {
    const raw = readJSON(STORAGE.compare);
    const clean = Array.isArray(raw) ? [...new Set(raw.filter(validModule))].slice(0, MAX_COMPARE) : [];
    if (raw !== null) writeJSON(STORAGE.compare, clean);
    return clean;
  }
  function readSaved() {
    const raw = readJSON(STORAGE.saved);
    const result = [];
    if (Array.isArray(raw))
      raw.slice(0, 20).forEach((item) => {
        if (
          !item ||
          typeof item !== "object" ||
          !own(item, "id") ||
          typeof item.id !== "string" ||
          !/^[a-z0-9-]{8,48}$/.test(item.id) ||
          !own(item, "name")
        )
          return;
        const name = cleanText(item.name, 60);
        const build = cleanBuild(own(item, "build") ? item.build : null);
        if (
          !build.parts.length ||
          name.length < 2 ||
          result.some((entry) => entry.id === item.id || entry.name.toLowerCase() === name.toLowerCase())
        )
          return;
        result.push({ id: item.id, name, build });
      });
    const clean = result.slice(0, MAX_SAVED);
    if (raw !== null) writeJSON(STORAGE.saved, clean);
    return clean;
  }
  let announcementTimer;
  function announce(message) {
    const area = $("[data-announcement]");
    clearTimeout(announcementTimer);
    area.textContent = message;
    area.hidden = false;
    announcementTimer = setTimeout(() => {
      area.hidden = true;
    }, 4500);
  }
  function voltageText(item) {
    return item.voltage ? item.voltage + " V" : item.interface === "power" ? "3.3 / 5 V selectable" : "No supply needed";
  }
  function moduleCard(item, compact = false) {
    const compared = readCompare().includes(item.id);
    return `<article class="min-w-0 reveal" data-module="${item.id}">
      <a href="module.html?module=${item.id}" class="block border border-line bg-wash"><img src="assets/img/${item.id}.svg" width="420" height="320" class="w-full" alt="${escape(item.name)} ${escape(item.title.toLowerCase())}" loading="lazy"></a>
      <p class="eyebrow mt-4 text-muted">${item.code} / ${escape(item.category)}</p>
      <h3 class="mt-2 text-3xl uppercase leading-none"><a href="module.html?module=${item.id}">${escape(item.name)}</a></h3>
      <p class="mt-2 text-sm text-muted">${escape(item.title)}</p>
      <div class="mt-4 flex items-end justify-between gap-3 border-t border-line pt-3"><p class="text-sm">${voltageText(item)}<span class="mt-1 block text-xs text-muted">${escape(INTERFACES[item.interface])}</span></p><p class="font-semibold">${money(item.price)}</p></div>
      ${compact ? "" : `<button type="button" data-compare="${item.id}" class="text-link mt-4 text-sm" aria-pressed="${compared}" aria-label="${compared ? "Remove comparison" : "Compare"} ${escape(item.name)}">${compared ? "Remove comparison" : "Compare"}</button>`}
    </article>`;
  }
  function renderComparison() {
    const ids = readCompare();
    $$("[data-compare-count]").forEach((element) => {
      element.textContent = ids.length;
    });
    $$("[data-compare]").forEach((button) => {
      const active = ids.includes(button.dataset.compare);
      const label = active ? "Remove comparison" : "Compare";
      button.setAttribute("aria-pressed", String(active));
      button.textContent = label;
      button.setAttribute("aria-label", `${label} ${MODULE_MAP[button.dataset.compare].name}`);
    });
    const target = $("[data-comparison]");
    if (!target) return;
    $("[data-compare-section]").hidden = !ids.length;
    target.innerHTML = ids
      .map((id) => {
        const item = MODULE_MAP[id];
        return `<article class="min-w-0 border border-ink bg-paper p-5"><p class="eyebrow text-red">${item.code}</p><h3 class="mt-2 text-3xl uppercase">${escape(item.name)}</h3><p class="mt-2 text-sm text-muted">${escape(item.title)}</p><dl class="mt-4"><div class="spec-line"><dt>Price</dt><dd>${money(item.price)}</dd></div><div class="spec-line"><dt>Voltage</dt><dd class="text-right">${voltageText(item)}</dd></div><div class="spec-line"><dt>Planning current</dt><dd>${item.current} mA</dd></div><div class="spec-line"><dt>Interface</dt><dd>${escape(INTERFACES[item.interface])}</dd></div><div class="spec-line"><dt>Mass</dt><dd>${item.mass} g</dd></div><div class="spec-line"><dt>Size</dt><dd class="text-right">${escape(item.dimensions)}</dd></div><div class="spec-line"><dt>Mounting slots</dt><dd>${item.slotCapacity || (item.extraSlots ? "+" + item.extraSlots : item.slots)}</dd></div></dl><button type="button" data-remove-comparison="${id}" class="text-link mt-5 text-sm" aria-label="Remove ${escape(item.name)} from comparison">Remove</button></article>`;
      })
      .join("");
  }
  function toggleComparison(id) {
    if (!validModule(id)) return;
    const ids = readCompare();
    const index = ids.indexOf(id);
    if (index >= 0) ids.splice(index, 1);
    else if (ids.length < MAX_COMPARE) ids.push(id);
    else {
      announce("Your comparison has four modules. Remove one before adding another.");
      return;
    }
    writeJSON(STORAGE.compare, ids);
    renderComparison();
    announce(`${MODULE_MAP[id].name} ${index >= 0 ? "removed from" : "added to"} comparison.`);
  }
  function initComparison() {
    document.addEventListener("click", (event) => {
      const toggle = event.target.closest("[data-compare]");
      if (toggle) toggleComparison(toggle.dataset.compare);
      const remove = event.target.closest("[data-remove-comparison]");
      if (remove) {
        const focusId = remove.dataset.removeComparison;
        toggleComparison(focusId);
        const next =
          $("[data-remove-comparison]") || $(`[data-compare="${focusId}"]`) || $("[data-module-filters] input");
        next?.focus();
      }
    });
    $("[data-clear-compare]")?.addEventListener("click", () => {
      writeJSON(STORAGE.compare, []);
      renderComparison();
      ($("[data-compare]") || $("[data-module-filters] input"))?.focus();
      announce("Comparison cleared.");
    });
    renderComparison();
  }
  function initCatalogue() {
    const form = $("[data-module-filters]");
    if (!form) return;
    const category = form.elements.category;
    category.insertAdjacentHTML("beforeend", CATEGORIES.map((value) => `<option>${value}</option>`).join(""));
    function render() {
      const query = form.elements.q.value.trim().toLowerCase();
      const selected = CATEGORIES.includes(category.value) ? category.value : "all";
      const volts = ["5", "3.3", "0"].includes(form.elements.voltage.value) ? form.elements.voltage.value : "all";
      let items = MODULES.filter(
        (item) =>
          (selected === "all" || item.category === selected) &&
          (volts === "all" || String(item.voltage) === volts) &&
          `${item.name} ${item.title} ${item.description} ${item.code} ${item.category} ${item.interface}`
            .toLowerCase()
            .includes(query),
      );
      const sort = form.elements.sort.value;
      if (sort === "price") items = [...items].sort((a, b) => a.price - b.price);
      else if (sort === "current")
        items = [...items].sort((a, b) => a.current - b.current || a.name.localeCompare(b.name));
      else if (sort === "name") items = [...items].sort((a, b) => a.name.localeCompare(b.name));
      $("[data-module-grid]").innerHTML = items.map((item) => moduleCard(item)).join("");
      $("[data-module-empty]").hidden = !!items.length;
      $("[data-module-count]").textContent =
        `${plural(items.length, "module")} ${query || selected !== "all" || volts !== "all" ? `${items.length === 1 ? "matches" : "match"} your filters` : "in the catalog"}. Prices exclude sales tax.`;
      renderComparison();
      revealNew();
    }
    form.addEventListener("input", (event) => {
      if (event.target.name === "q") render();
    });
    form.addEventListener("change", (event) => {
      if (event.target.name !== "q") render();
    });
    form.addEventListener("submit", (event) => event.preventDefault());
    form.addEventListener("reset", () => setTimeout(render));
    render();
  }
  function initModule() {
    const target = $("[data-module-detail]");
    if (!target) return;
    const requested = parameters.get("module");
    const item = validModule(requested) ? MODULE_MAP[requested] : MODULES[0];
    document.title = `${item.name} — ${item.title} — Praxlet`;
    const dependencies = Object.entries(item.requires || {})
      .map(([id, qty]) => `${qty} × ${MODULE_MAP[id].name}`)
      .join(", ");
    target.innerHTML = `<header class="pb-6"><p class="eyebrow text-red">${escape(item.category)} / ${item.code}</p><h1 class="mt-4 text-7xl uppercase leading-none">${escape(item.name)}</h1><p class="mt-2 font-display text-3xl uppercase text-muted">${escape(item.title)}</p><p class="mt-5 text-lg leading-relaxed">${escape(item.description)}</p></header><div class="grid items-start gap-9 lg:grid-cols-2"><div><img src="assets/img/${item.id}.svg" width="420" height="320" class="w-full border border-line" alt="${escape(item.name)}, drawn to show its construction"><p class="mt-4 border-y border-line py-3 text-xs uppercase tracking-widest">${item.code} / ${escape(item.dimensions)}</p><div class="mt-7 grid gap-6 sm:grid-cols-2"><div><h2 class="text-2xl uppercase">In the box</h2><ul class="mt-3 list-disc space-y-2 pl-5 text-sm text-muted">${item.includes.map((value) => `<li>${escape(value)}</li>`).join("")}</ul></div><div><h2 class="text-2xl uppercase">A useful note</h2><p class="mt-3 text-sm leading-relaxed text-muted">${escape(item.note)}</p></div></div></div><div><dl class="mt-6"><div class="spec-line"><dt>Logic / supply</dt><dd>${voltageText(item)}</dd></div><div class="spec-line"><dt>Interface</dt><dd>${escape(INTERFACES[item.interface])}${item.ports ? ` / ${item.ports} ${item.ports === 1 ? "port" : "ports"}` : ""}</dd></div><div class="spec-line"><dt>Planning current</dt><dd>${item.current} mA</dd></div><div class="spec-line"><dt>Mounting positions</dt><dd>${item.slotCapacity || (item.extraSlots ? "+" + item.extraSlots : item.slots)}</dd></div><div class="spec-line"><dt>Mass</dt><dd>${item.mass} g</dd></div>${item.address ? `<div class="spec-line"><dt>Fixed I²C address</dt><dd>${item.address}</dd></div>` : ""}${dependencies ? `<div class="spec-line"><dt>Also needed</dt><dd>${escape(dependencies)}</dd></div>` : ""}<div class="spec-line"><dt>Suitable for</dt><dd class="text-right">Ages 11+, supervised</dd></div></dl><p class="mt-3 text-sm font-semibold" data-age-note>${AGE_NOTE}</p><div class="mt-6 flex flex-wrap items-end justify-between gap-5"><p class="text-sm">Price before sales tax<strong class="mt-1 block font-display text-5xl font-medium">${money(item.price)}</strong></p><a href="configurator.html?module=${item.id}" class="btn btn-red">Add to your kit ${arrow}</a></div><button type="button" data-compare="${item.id}" class="text-link mt-5 text-sm" aria-pressed="false">Compare</button><section class="mt-8 border-t border-ink pt-6"><h2 class="text-3xl uppercase">Start with a careful check.</h2><ol class="mt-4 list-decimal space-y-3 pl-5 text-sm text-muted">${item.steps.map((value) => `<li>${escape(value)}</li>`).join("")}</ol><a href="docs.html?guide=first-power" class="text-link mt-5 inline-block text-sm">Read the first-power field note</a></section></div></div>`;
    $("[data-related-modules]").innerHTML = MODULES.filter(
      (value) =>
        value.id !== item.id && (value.category === item.category || value.id === "dockfin" || value.id === "tackrail"),
    )
      .slice(0, 3)
      .map((value) => moduleCard(value))
      .join("");
    renderComparison();
  }
  function analyse(build) {
    const parts = build.parts;
    const get = (id) => parts.find((part) => part.id === id)?.qty || 0;
    const controllers = parts.filter((part) => MODULE_MAP[part.id].interface === "core");
    const controller = controllers.length === 1 ? MODULE_MAP[controllers[0].id] : null;
    const supply = parts.find((part) => MODULE_MAP[part.id].supply);
    const capacity = supply ? MODULE_MAP[supply.id].supply : 0;
    const cost = parts.reduce((sum, part) => sum + MODULE_MAP[part.id].price * part.qty, 0);
    const current = parts.reduce((sum, part) => sum + MODULE_MAP[part.id].current * part.qty, 0);
    const required = Math.ceil(current * POWER_MARGIN);
    const mounting = parts.reduce((sum, part) => sum + MODULE_MAP[part.id].slots * part.qty, 0);
    const availableMounting =
      get("tackrail") * MODULE_MAP.tackrail.slotCapacity + get("shelfwing") * MODULE_MAP.shelfwing.extraSlots;
    const ports = { i2c: 0, pwm: 0, digital: 0, analogue: 0 };
    const addresses = new Map();
    const issues = [];
    if (!parts.length) issues.push("Choose a controller, power board and chassis to begin a useful system check.");
    if (controllers.length !== 1) issues.push("Use exactly one controller in each kit.");
    if (!supply) issues.push("Add the Dockfin power board for a rated supply and a headroom check.");
    if (!get("tackrail") && parts.length)
      issues.push("Add a Tackrail chassis to give the kit a checked mounting capacity.");
    if (controller && controller.voltage !== build.voltage)
      issues.push(`${controller.name} requires ${controller.voltage} V; the supply is set to ${build.voltage} V.`);
    parts.forEach((part) => {
      const item = MODULE_MAP[part.id];
      if (item.voltage && item.interface !== "core" && item.voltage !== build.voltage)
        issues.push(
          `${item.name} requires ${item.voltage} V and does not match the ${build.voltage} V supply setting.`,
        );
      if (own(ports, item.interface)) ports[item.interface] += item.ports * part.qty;
      if (item.address) {
        const group = addresses.get(item.address) || [];
        group.push({ name: item.name, qty: part.qty });
        addresses.set(item.address, group);
      }
      Object.entries(item.requires || {}).forEach(([id, qty]) => {
        if (get(id) < qty * part.qty)
          issues.push(`${part.qty} × ${item.name} needs at least ${qty * part.qty} × ${MODULE_MAP[id].name}.`);
      });
    });
    if (controller)
      Object.keys(ports).forEach((key) => {
        if (ports[key] > controller.capacity[key])
          issues.push(
            `${INTERFACES[key]} needs ${ports[key]} ports; ${controller.name} provides ${controller.capacity[key]}.`,
          );
      });
    addresses.forEach((group, address) => {
      const total = group.reduce((sum, row) => sum + row.qty, 0);
      if (total > 1)
        issues.push(
          `${group.map((row) => `${row.qty} × ${row.name}`).join(" and ")} share fixed I²C address ${address}. Use one per bus or a suitable engineered interface.`,
        );
    });
    if (availableMounting && mounting > availableMounting)
      issues.push(`${mounting} mounting positions are used, but the chassis and deck provide ${availableMounting}.`);
    if (capacity && required > capacity)
      issues.push(
        `With the 25% allowance this build needs ${number(required)} mA, above the ${number(capacity)} mA supply rating.`,
      );
    return {
      cost,
      classCost: cost * build.kits,
      current,
      required,
      capacity,
      mounting,
      availableMounting,
      ports,
      controller,
      issues,
      count: parts.reduce((sum, part) => sum + part.qty, 0),
    };
  }
  function addPart(build, id, qty = 1) {
    if (!validModule(id)) return build;
    const item = MODULE_MAP[id];
    if (item.interface === "core")
      build.parts = build.parts.filter((part) => MODULE_MAP[part.id].interface !== "core" || part.id === id);
    const row = build.parts.find((part) => part.id === id);
    const limit =
      ["core", "power"].includes(item.interface) || ["tackrail", "shelfwing"].includes(item.id) ? 1 : MAX_MODULE_QTY;
    if (row) row.qty = Math.min(limit, row.qty + qty);
    else build.parts.push({ id, qty: clamp(qty, 1, limit) });
    return cleanBuild(build);
  }
  function lineKey(id) {
    return `[data-build-line="${id}"]`;
  }
  function buildLine(part) {
    const item = MODULE_MAP[part.id];
    const limit =
      ["core", "power"].includes(item.interface) || ["tackrail", "shelfwing"].includes(item.id) ? 1 : MAX_MODULE_QTY;
    return `<article class="grid grid-cols-[76px_1fr] gap-4 border-b border-line py-5" data-build-line="${item.id}"><img src="assets/img/${item.id}.svg" width="420" height="320" alt="" class="w-full"><div class="min-w-0"><div class="flex flex-wrap items-start justify-between gap-3"><div><h3 class="text-2xl uppercase leading-none"><a href="module.html?module=${item.id}">${escape(item.name)}</a></h3><p class="mt-1 text-xs text-muted">${escape(item.title)}</p></div><p data-part-total class="text-sm font-semibold">${money(item.price * part.qty)}</p></div><div class="mt-4 flex flex-wrap items-end justify-between gap-3"><label class="text-xs font-semibold">Quantity<input type="number" data-part-qty="${item.id}" class="field mt-1 w-20 py-1" min="1" max="${limit}" value="${part.qty}" aria-label="Quantity ${escape(item.name)}"></label><button type="button" data-remove-part="${item.id}" class="text-link text-xs" aria-label="Remove ${escape(item.name)} from kit">Remove</button></div></div></article>`;
  }
  function renderBuildSummary() {
    const target = $("[data-build-summary]");
    if (!target) return;
    const build = readBuild(),
      result = analyse(build);
    $("[data-build-count]").textContent = plural(result.count, "module");
    target.innerHTML = `<dl><div class="spec-line"><dt>One kit, before sales tax</dt><dd data-kit-total class="font-semibold">${money(result.cost)}</dd></div><div class="spec-line"><dt>${plural(build.kits, "kit")}</dt><dd data-class-total class="font-semibold">${money(result.classCost)}</dd></div><div class="spec-line"><dt>Working budget / kit</dt><dd>${money(build.budget)}</dd></div><div class="spec-line"><dt>Budget difference / kit</dt><dd data-budget-difference>${result.cost <= build.budget ? money(build.budget - result.cost) + " within" : money(result.cost - build.budget) + " above"}</dd></div><div class="spec-line"><dt>Mounting positions</dt><dd>${result.mounting} / ${result.availableMounting}</dd></div></dl>${
      result.controller
        ? `<p class="mt-4 text-xs text-muted">${result.controller.name}: ${Object.keys(result.ports)
            .map((key) => `${result.ports[key]}/${result.controller.capacity[key]} ${INTERFACES[key]}`)
            .join(" · ")}</p>`
        : ""
    }`;
    $("[data-build-issues]").innerHTML = result.issues.length
      ? `<p class="font-semibold text-red" data-compatibility-state>${plural(result.issues.length, "point")} to check</p><ul class="list-disc space-y-2 pl-5 text-sm">${result.issues.map((issue) => `<li>${escape(issue)}</li>`).join("")}</ul>`
      : '<p class="font-semibold" data-compatibility-state>Listed specifications agree.</p><p class="text-sm text-muted">The voltage, interfaces, dependencies, mounting space and planned current are within the listed limits. Check the assembled circuit before use.</p>';
    const quote = $("[data-quote-link]");
    if (quote) {
      quote.href = result.count ? "contact.html?topic=quote" : "contact.html?topic=kit";
      quote.firstChild.textContent = result.count
        ? `Request a quote for ${plural(build.kits, "kit")} `
        : "Ask about a first kit ";
    }
    const ratio = result.capacity ? Math.min(100, Math.round((result.required / result.capacity) * 100)) : 0;
    $("[data-power-chart]").innerHTML =
      `<p class="text-sm"><strong data-required-current>${number(result.required)} mA</strong> including allowance</p><div class="mt-3 h-5 border border-ink bg-paper" role="img" aria-label="${result.required} milliamps required of ${result.capacity} available"><div class="h-full ${result.required > result.capacity ? "bg-red" : "bg-ink"}" style="width:${ratio}%"></div></div><p class="mt-2 text-xs text-muted">${number(result.current)} mA module allowance × 1.25 / ${number(result.capacity)} mA supply capacity</p>`;
  }
  function renderBuildLines() {
    const target = $("[data-build-lines]");
    if (!target) return;
    const build = readBuild();
    target.innerHTML = build.parts.length
      ? build.parts.map(buildLine).join("")
      : '<div class="border border-line bg-wash p-7"><h3 class="text-3xl uppercase">An open bench.</h3><p class="mt-3 text-sm text-muted">Start with a controller, Dockfin power board and Tackrail chassis, or load one of the project parts lists above.</p></div>';
    renderBuildSummary();
  }
  function renderSavedBuilds() {
    const target = $("[data-saved-builds]");
    if (!target) return;
    const saved = readSaved();
    target.innerHTML = saved.length
      ? saved
          .map((item) => {
            const result = analyse(item.build);
            return `<article class="min-w-0 border border-line p-5" data-saved-build="${item.id}"><h3 class="break-words text-2xl uppercase">${escape(item.name)}</h3><p class="mt-2 text-sm text-muted">${plural(result.count, "module")} · ${item.build.voltage} V · ${money(result.cost)} / kit</p><div class="mt-4 flex flex-wrap gap-5"><button type="button" data-load-build="${item.id}" class="text-link text-sm" aria-label="Load ${escape(item.name)} build">Load</button><button type="button" data-delete-build="${item.id}" class="text-link text-sm" aria-label="Remove ${escape(item.name)} saved build">Remove</button></div></article>`;
          })
          .join("")
      : '<p class="text-sm text-muted">No named builds yet. Give the current kit a short name to keep a useful starting point.</p>';
  }
  function bomText(build) {
    const result = analyse(build);
    return [
      "PRAXLET / BUILD RECORD",
      `Supply setting: ${build.voltage} V`,
      ...build.parts.map(
        (part) =>
          `${part.qty} × ${MODULE_MAP[part.id].name} (${MODULE_MAP[part.id].code}) — ${money(MODULE_MAP[part.id].price * part.qty)}`,
      ),
      "",
      `One kit: ${money(result.cost)} before sales tax`,
      `${plural(build.kits, "kit")}: ${money(result.classCost)}`,
      `Planning current including 25% allowance: ${result.required} mA`,
      `Supply rating: ${result.capacity} mA`,
      "",
      ...result.issues.map((issue) => "Check: " + issue),
      "",
      "Verify the assembled circuit before extended use.",
    ].join("\n");
  }
  function syncBuildFields() {
    const build = readBuild();
    $("[data-build-voltage]").value = build.voltage;
    $("[data-build-budget]").value = build.budget / 100;
    $("[data-kit-count]").value = build.kits;
  }
  function initBuilder() {
    if (!$("[data-build-lines]")) return;
    const project = parameters.get("project"),
      module = parameters.get("module");
    if (validProject(project)) saveBuild(projectBuild(PROJECT_MAP[project]));
    else if (validModule(module)) saveBuild(addPart(readBuild(), module));
    if (validProject(project) || validModule(module)) {
      try {
        history.replaceState(null, "", location.pathname);
      } catch {
        /* Opaque origins can block history changes. */
      }
    }
    $("[data-preset]").insertAdjacentHTML(
      "beforeend",
      PROJECTS.map((item) => `<option value="${item.id}">${escape(item.title)}</option>`).join(""),
    );
    $("[data-preset]").value = validProject(project) ? project : "line-courier";
    $("[data-part-picker]").innerHTML = MODULES.map(
      (item) =>
        `<option value="${item.id}">${escape(item.name)} — ${escape(item.title)} — ${money(item.price)}</option>`,
    ).join("");
    syncBuildFields();
    renderBuildLines();
    renderSavedBuilds();
    $("[data-add-part]").addEventListener("submit", (event) => {
      event.preventDefault();
      const id = $("[data-part-picker]").value;
      if (!validModule(id)) return;
      saveBuild(addPart(readBuild(), id));
      renderBuildLines();
      announce(`${MODULE_MAP[id].name} added. The build check has been updated.`);
    });
    $("[data-load-preset]").addEventListener("click", () => {
      const id = $("[data-preset]").value;
      if (id === "empty") saveBuild({ parts: [], voltage: 5, budget: 35000, kits: 1 });
      else if (validProject(id)) saveBuild(projectBuild(PROJECT_MAP[id]));
      else return;
      syncBuildFields();
      renderBuildLines();
      announce(
        id === "empty"
          ? "The kit bench is clear."
          : "Project parts loaded. Check the supply and the full assembly before use.",
      );
    });
    function settingsChanged(event) {
      const build = readBuild();
      const volts = Number($("[data-build-voltage]").value);
      build.voltage = [3.3, 5].includes(volts) ? volts : 5;
      build.budget = clamp(Number($("[data-build-budget]").value) * 100, 0, 1000000);
      build.kits = clamp($("[data-kit-count]").value, 1, 12, 1);
      saveBuild(build);
      if (event.type === "change") {
        $("[data-build-voltage]").value = build.voltage;
        $("[data-build-budget]").value = build.budget / 100;
        $("[data-kit-count]").value = build.kits;
      }
      renderBuildSummary();
    }
    ["[data-build-voltage]", "[data-build-budget]", "[data-kit-count]"].forEach((selector) => {
      $(selector).addEventListener("input", settingsChanged);
      $(selector).addEventListener("change", settingsChanged);
    });
    document.addEventListener("change", (event) => {
      const input = event.target.closest("[data-part-qty]");
      if (!input) return;
      const id = input.dataset.partQty,
        build = readBuild();
      const row = build.parts.find((part) => part.id === id);
      if (!row) return;
      row.qty = input.value;
      saveBuild(build);
      const clean = readBuild();
      const quantity = clean.parts.find((part) => part.id === id)?.qty || 1;
      // Keep this input in place. Replacing it during change causes reentrant blur/change errors.
      input.value = quantity;
      $("[data-part-total]", $(lineKey(id))).textContent = money(MODULE_MAP[id].price * quantity);
      renderBuildSummary();
    });
    document.addEventListener("click", (event) => {
      const button = event.target.closest("[data-remove-part]");
      if (!button) return;
      const build = readBuild();
      const index = build.parts.findIndex((part) => part.id === button.dataset.removePart);
      if (index < 0) return;
      build.parts.splice(index, 1);
      saveBuild(build);
      renderBuildLines();
      ($$("[data-remove-part]")[Math.min(index, build.parts.length - 1)] || $("[data-part-picker]")).focus();
      announce("Module removed. Compatibility and totals have been recalculated.");
    });
    $("[data-clear-build]").addEventListener("click", () => {
      const build = readBuild();
      build.parts = [];
      saveBuild(build);
      renderBuildLines();
      $("[data-part-picker]").focus();
      announce("The current kit is clear. Your named builds are still available.");
    });
    $("[data-copy-bom]").addEventListener("click", async () => {
      const content = bomText(readBuild());
      try {
        if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
        await navigator.clipboard.writeText(content);
        announce("Parts list copied.");
      } catch {
        const field = $("[data-copy-fallback]");
        field.hidden = false;
        field.value = content;
        field.focus();
        field.select();
        announce("Select and copy the parts list below.");
      }
    });
    $("[data-save-build]").addEventListener("submit", (event) => {
      event.preventDefault();
      const name = cleanText($("[data-build-name]").value, 60);
      const error = $("[data-build-name-error]");
      error.textContent = "";
      $("[data-build-name]").removeAttribute("aria-invalid");
      if (name.length < 2) {
        error.textContent = "Give this build a name of at least two characters.";
        $("[data-build-name]").setAttribute("aria-invalid", "true");
        $("[data-build-name]").focus();
        return;
      }
      const build = readBuild();
      if (!build.parts.length) {
        error.textContent = "Add at least one module before saving a named build.";
        return;
      }
      const saved = readSaved();
      const existing = saved.find((item) => item.name.toLowerCase() === name.toLowerCase());
      if (existing) {
        existing.name = name;
        existing.build = build;
      } else if (saved.length < MAX_SAVED)
        saved.push({ id: `kit-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`, name, build });
      else {
        error.textContent = "Six builds are saved. Remove one, or use an existing name to update it.";
        return;
      }
      writeJSON(STORAGE.saved, saved);
      renderSavedBuilds();
      announce(existing ? "Named build updated." : "Named build saved.");
    });
    document.addEventListener("click", (event) => {
      const load = event.target.closest("[data-load-build]");
      if (load) {
        const item = readSaved().find((entry) => entry.id === load.dataset.loadBuild);
        if (!item) return;
        saveBuild(item.build);
        $("[data-build-name]").value = item.name;
        syncBuildFields();
        renderBuildLines();
        $("[data-build-voltage]").focus();
        announce(`${item.name} loaded on the kit bench.`);
      }
      const remove = event.target.closest("[data-delete-build]");
      if (remove) {
        const saved = readSaved();
        const index = saved.findIndex((item) => item.id === remove.dataset.deleteBuild);
        if (index < 0) return;
        saved.splice(index, 1);
        writeJSON(STORAGE.saved, saved);
        renderSavedBuilds();
        ($$("[data-delete-build]")[Math.min(index, saved.length - 1)] || $("[data-build-name]")).focus();
        announce("Named build removed. The current kit has not changed.");
      }
    });
  }
  function projectCard(project, details = false) {
    const build = projectBuild(project),
      result = analyse(build);
    return `<article class="min-w-0 border border-line"><img src="assets/img/project-${project.art}.svg" width="420" height="320" alt="Illustration for ${escape(project.title)}" class="w-full" loading="lazy"><div class="p-5"><p class="eyebrow text-red">${escape(project.level)} / ${project.minutes} MINUTES</p><h3 class="mt-3 text-3xl uppercase leading-none">${escape(project.title)}</h3><p class="mt-4 text-sm leading-relaxed text-muted">${escape(project.summary)}</p><p class="mt-4 text-sm font-semibold">${money(result.cost)} / kit · ${project.voltage} V</p>${details ? `<details class="mt-5 border-t border-line"><summary class="py-4 text-sm font-semibold">The question, the parts & the method</summary><p class="text-sm"><strong>Investigate:</strong> ${escape(project.learn)}</p><ul class="mt-4 list-disc space-y-2 pl-5 text-sm text-muted">${build.parts.map((part) => `<li>${part.qty} × <a class="underline" href="module.html?module=${part.id}">${escape(MODULE_MAP[part.id].name)}</a></li>`).join("")}</ul><ol class="mt-5 list-decimal space-y-3 pl-5 text-sm">${project.steps.map((value) => `<li>${escape(value)}</li>`).join("")}</ol></details>` : ""}<a href="configurator.html?project=${project.id}" class="btn btn-line mt-5 w-full">Build this parts list ${arrow}</a></div></article>`;
  }
  function initProjects() {
    const target = $("[data-project-grid]");
    if (!target) return;
    let level = "all";
    function render() {
      const items = PROJECTS.filter((item) => level === "all" || item.level === level);
      target.innerHTML = items.map((item) => projectCard(item, true)).join("");
      $("[data-project-count]").textContent = plural(items.length, "project");
      $$("[data-project-level]").forEach((button) =>
        button.setAttribute("aria-pressed", String(button.dataset.projectLevel === level)),
      );
    }
    $("[data-project-filters]").addEventListener("click", (event) => {
      const button = event.target.closest("[data-project-level]");
      if (!button || !["all", "First build", "Next step"].includes(button.dataset.projectLevel)) return;
      level = button.dataset.projectLevel;
      render();
    });
    render();
  }
  function initGuides() {
    const form = $("[data-guide-filters]");
    if (!form) return;
    const guide = parameters.get("guide");
    const requested = guide && own(GUIDE_MAP, guide) ? guide : null;
    function render() {
      const query = form.elements.q.value.trim().toLowerCase();
      const category = ["Planning", "Assembly", "Interfaces", "Experiments", "Teaching"].includes(
        form.elements.category.value,
      )
        ? form.elements.category.value
        : "all";
      const items = GUIDES.filter(
        (item) =>
          (category === "all" || item.category === category) &&
          `${item.title} ${item.summary} ${item.steps.join(" ")} ${item.caution}`.toLowerCase().includes(query),
      );
      $("[data-guide-grid]").innerHTML = items
        .map(
          (item) =>
            `<article class="border border-line p-6"><p class="eyebrow text-red">${escape(item.category)}</p><h2 class="mt-3 text-3xl uppercase leading-none">${escape(item.title)}</h2><p class="mt-4 text-sm leading-relaxed text-muted">${escape(item.summary)}</p><details id="guide-${item.id}" class="mt-5 border-t border-line"${requested === item.id ? " open" : ""}><summary class="py-4 text-sm font-semibold">Read the field note</summary><ol class="list-decimal space-y-3 pl-5 text-sm">${item.steps.map((value) => `<li>${escape(value)}</li>`).join("")}</ol><p class="mt-5 border-t border-line pt-4 text-sm font-semibold">${escape(item.caution)}</p></details></article>`,
        )
        .join("");
      $("[data-guide-count]").textContent =
        `${plural(items.length, "field note")} ${query || category !== "all" ? `${items.length === 1 ? "matches" : "match"} your search` : "for the workbench"}.`;
    }
    form.addEventListener("input", (event) => {
      if (event.target.name === "q") render();
    });
    form.addEventListener("change", (event) => {
      if (event.target.name !== "q") render();
    });
    form.addEventListener("submit", (event) => event.preventDefault());
    render();
  }
  function initTeam() {
    const target = $("[data-team]");
    if (target)
      target.innerHTML = TEAM.map(
        (person, index) =>
          `<article><img src="assets/img/person-${index + 1}.svg" width="420" height="320" alt="Portrait of ${escape(person.name)}" class="w-full"><p class="eyebrow mt-5 text-red">${escape(person.role)}</p><h3 class="mt-3 text-3xl uppercase">${escape(person.name)}</h3><p class="mt-4 text-sm leading-relaxed text-muted">${escape(person.bio)}</p></article>`,
      ).join("");
  }
  function londonDateKey() {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  }
  function requestReference(kind = "") {
    return `PX-${kind}${londonDateKey().replace(/-/g, "")}-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`;
  }
  function clearErrors(form) {
    $$("[data-error]", form).forEach((element) => {
      element.textContent = "";
    });
    $$("[aria-invalid]", form).forEach((element) => element.removeAttribute("aria-invalid"));
    $("[data-form-summary]", form).hidden = true;
  }
  function errorField(form, name, message) {
    $(`[data-error="${name}"]`, form).textContent = message;
    form.elements[name].setAttribute("aria-invalid", "true");
  }
  function initContact() {
    const form = $("[data-contact-form]");
    if (!form) return;
    const topicField = $("[data-contact-topic]");
    const requested = parameters.get("topic");
    if (requested && own(TOPICS, requested)) topicField.value = requested;
    else topicField.value = "kit";
    const build = readBuild();
    const quoteBox = $("[data-quote-kit]"),
      countField = $("[data-quote-count]");
    countField.value = build.kits;
    function kitLines(value) {
      return value.parts.map((part) => `${part.qty} × ${MODULE_MAP[part.id].name}`).join(", ");
    }
    function renderAside() {
      const current = readBuild(),
        result = analyse(current);
      $("[data-contact-kit]").innerHTML =
        `<p class="eyebrow text-red">YOUR CURRENT KIT BENCH</p><h2 class="mt-3 text-3xl uppercase">A useful starting point.</h2><p class="mt-4 text-sm leading-relaxed">${result.count ? `${plural(result.count, "module")}, ${current.voltage} V, ${money(result.cost)} per kit. ${escape(kitLines(current))}.` : "No modules on the bench yet. That is fine: describe the question and we can start there."}</p>${result.count ? '<button type="button" data-use-quote class="btn btn-red btn-small mt-4">Request a quote for this kit</button>' : ""}<a href="configurator.html" class="text-link mt-4 block text-sm">Edit the parts list</a>`;
    }
    function renderQuote() {
      const current = readBuild(),
        result = analyse(current);
      const quoting = topicField.value === "quote";
      quoteBox.hidden = !quoting;
      $("[data-contact-kit]").hidden = quoting;
      countField.disabled = !quoting || !result.count;
      $("[data-quote-fields]").hidden = !result.count;
      $("[data-quote-parts]").innerHTML = result.count
        ? `<ul class="divide-y divide-line border-y border-line text-sm">${current.parts
            .map(
              (part) =>
                `<li class="flex justify-between gap-4 py-2"><span>${part.qty} × ${escape(MODULE_MAP[part.id].name)} <span class="text-muted">${MODULE_MAP[part.id].code}</span></span><span>${money(MODULE_MAP[part.id].price * part.qty)}</span></li>`,
            )
            .join("")}</ul><p class="mt-2 text-xs text-muted">${plural(result.count, "module")} · ${current.voltage} V supply setting${result.issues.length ? ` · ${plural(result.issues.length, "build point")} we will check with you` : ""}</p>`
        : '<p class="text-sm">Your kit bench is empty. <a class="underline" href="configurator.html">Add modules on the kit bench</a> or load a project parts list, then come back to request a quote.</p>';
      const kits = clamp(countField.value, 1, 12, current.kits);
      $("[data-quote-totals]").innerHTML = `<div class="spec-line"><dt>One kit</dt><dd>${money(result.cost)}</dd></div><div class="spec-line"><dt>${plural(kits, "kit")}, before sales tax</dt><dd data-quote-total class="font-semibold">${money(result.cost * kits)}</dd></div>`;
      $("[data-quote-list]").value = result.count ? bomText({ ...current, kits }) : "";
    }
    renderAside();
    renderQuote();
    topicField.addEventListener("change", () => {
      clearErrors(form);
      renderQuote();
    });
    countField.addEventListener("input", renderQuote);
    countField.addEventListener("change", () => {
      const value = Number(countField.value);
      if (Number.isInteger(value) && value >= 1 && value <= 12) {
        const current = readBuild();
        current.kits = value;
        saveBuild(current);
      }
      renderQuote();
    });
    document.addEventListener("click", (event) => {
      if (!event.target.closest("[data-use-quote]")) return;
      topicField.value = "quote";
      renderQuote();
      topicField.focus();
    });
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      clearErrors(form);
      const data = Object.fromEntries(new FormData(form));
      let errors = 0;
      const name = cleanText(data.name, 100),
        email = cleanText(data.email, 160),
        message = cleanText(data.message, 2000);
      const quoting = data.topic === "quote";
      const current = readBuild(),
        result = analyse(current);
      const kits = Number(countField.value);
      if (name.length < 2) {
        errorField(form, "name", "Please enter your name, using at least two characters.");
        errors++;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        errorField(form, "email", "Please enter a complete email address.");
        errors++;
      }
      if (!own(TOPICS, data.topic)) {
        errorField(form, "topic", "Please choose a topic from the list.");
        errors++;
      } else if (quoting && !result.count) {
        errorField(form, "topic", "Your kit bench is empty. Add modules first, or choose another topic.");
        errors++;
      } else if (quoting && !(Number.isInteger(kits) && kits >= 1 && kits <= 12)) {
        errorField(form, "kits", "Choose between 1 and 12 kits. For more, give the number in your message.");
        errors++;
      }
      if (message.length < 12 && !quoting) {
        errorField(form, "message", "Please add a little more context, at least twelve characters.");
        errors++;
      }
      if (data.reply !== "on") {
        errorField(form, "reply", "Please let us know we may reply about this request.");
        errors++;
      }
      if (errors) {
        const summary = $("[data-form-summary]", form);
        summary.textContent = `Please check ${plural(errors, "highlighted field")}.`;
        summary.hidden = false;
        $('[aria-invalid="true"]', form)?.focus();
        return;
      }
      /* Production integration point: POST a FormData payload to your endpoint here.
         Await response.ok before revealing the success below; retain the form on errors.
         For a quote, FormData carries topic=quote, kits and partsList (the full build record).
         See DOCS.md for a worked Formspree example. No email or confirmation is claimed sent. */
      const firstName = name.split(/\s+/)[0];
      const summary = $("[data-quote-summary]");
      if (quoting) {
        if (kits !== current.kits) saveBuild({ ...current, kits });
        $("[data-success-eyebrow]").textContent = "QUOTE REQUEST RECEIVED";
        $("[data-success-title]").textContent = `Your quote for ${plural(kits, "kit")} is with the team.`;
        $("[data-success-message]").textContent =
          `Thanks, ${firstName}. We’ll price the parts list below and email a written quote to ${email} within two business days.`;
        $("[data-reference]").textContent = requestReference("Q");
        summary.innerHTML = `<h3 class="text-2xl uppercase">The kit you asked about</h3><p class="mt-2 text-sm">${escape(kitLines(current))}</p><dl class="mt-4 text-sm"><div class="spec-line"><dt>One kit</dt><dd>${money(result.cost)}</dd></div><div class="spec-line"><dt>Number of kits</dt><dd data-quote-success-kits>${kits}</dd></div><div class="spec-line"><dt>Total before sales tax</dt><dd data-quote-success-total class="font-semibold">${money(result.cost * kits)}</dd></div></dl><h3 class="mt-6 text-2xl uppercase">What happens next</h3><ol class="mt-3 list-decimal space-y-2 pl-5 text-sm"><li>We check the parts list against stock and the build notes on the bench.</li><li>You receive a written quote by email, valid for 30 days, with any school or club pricing applied.</li><li>Reply with a purchase order or pay by card; class sets are packed and shipped within five business days.</li></ol><p class="mt-4 text-xs font-semibold">${AGE_NOTE}</p>`;
        summary.hidden = false;
      } else {
        const topicLabel = TOPICS[data.topic];
        $("[data-success-eyebrow]").textContent = "A USEFUL NEXT STEP";
        $("[data-success-title]").textContent = "Your question is with the team.";
        $("[data-success-message]").textContent =
          `Thanks, ${firstName}. We’ll review your ${topicLabel} and reply within two business days. If we need to check a specification on the bench, we’ll explain the next step.`;
        $("[data-reference]").textContent = requestReference();
        summary.hidden = true;
        summary.innerHTML = "";
      }
      form.hidden = true;
      $("[data-contact-kit]").hidden = true;
      const success = $("[data-contact-success]");
      success.hidden = false;
      success.focus();
    });
    $("[data-contact-another]").addEventListener("click", () => {
      $("[data-contact-success]").hidden = true;
      form.hidden = false;
      form.reset();
      topicField.value = "kit";
      countField.value = readBuild().kits;
      clearErrors(form);
      renderAside();
      renderQuote();
      form.elements.name.focus();
    });
  }
  function initMenu() {
    const button = $("[data-menu-toggle]"),
      menu = $("#mobile-menu");
    function close(returnFocus = false) {
      menu.hidden = true;
      button.setAttribute("aria-expanded", "false");
      button.setAttribute("aria-label", "Open menu");
      if (returnFocus) button.focus();
    }
    button.addEventListener("click", () => {
      const open = button.getAttribute("aria-expanded") !== "true";
      menu.hidden = !open;
      button.setAttribute("aria-expanded", String(open));
      button.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      if (open) $("a", menu).focus();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !menu.hidden) close(true);
    });
    matchMedia("(min-width:1024px)").addEventListener("change", (event) => {
      if (event.matches) close();
    });
  }
  function revealNew() {
    const elements = $$(".reveal:not(.is-visible)");
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting || entry.boundingClientRect.top < innerHeight) {
            $$(".reveal").forEach((element) => {
              if (element.getBoundingClientRect().top <= entry.boundingClientRect.bottom)
                element.classList.add("is-visible");
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px 80px 0px" },
    );
    elements.forEach((element) => observer.observe(element));
  }
  $$("[data-year]").forEach((element) => {
    element.textContent = new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, year: "numeric" }).format(new Date());
  });
  if ($("[data-featured-modules]"))
    $("[data-featured-modules]").innerHTML = ["arcloop", "hushwheel", "rangetail", "scoutline"]
      .map((id) => moduleCard(MODULE_MAP[id], true))
      .join("");
  if ($("[data-featured-projects]"))
    $("[data-featured-projects]").innerHTML = PROJECTS.slice(0, 3)
      .map((item) => projectCard(item))
      .join("");
  initMenu();
  initCatalogue();
  initModule();
  initComparison();
  initBuilder();
  initProjects();
  initGuides();
  initTeam();
  initContact();
  revealNew();
})();
