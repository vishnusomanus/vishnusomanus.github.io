/* Hashfen — dependency-free research tools.
 * Data is in data.js. Prices and network figures are editable research assumptions.
 * Production form integration belongs in initContact; show success only after response.ok.
 */
(() => {
  "use strict";
  const { networks: NETWORKS, guides: GUIDES, plans: PLANS, team: TEAM } = window.HASHFEN_DATA;
  const TIME_ZONE = "America/Denver";
  const STORAGE_KEYS = {
    watch: "hashfen:watch:v1",
    planner: "hashfen:planner:v1",
    scenarios: "hashfen:scenarios:v1",
  };
  const MAX_SCENARIOS = 8;
  const NETWORK_MAP = Object.fromEntries(NETWORKS.map((network) => [network.id, network]));
  const PLAN_MAP = Object.fromEntries(PLANS.map((plan) => [plan.id, plan]));
  const LAYERS = { all: "All architectures", "Layer 1": "Layer 1", Rollup: "Rollup", "App chain": "App chain" };
  const SORTS = { name: "name", fee: "fee", finality: "finality" };
  const TOPICS = { research: true, profile: true, plan: true, other: true };
  const LIMITS = {
    operations: { min: 1, max: 100000, integer: true },
    units: { min: 21000, max: 30000000, integer: true },
    fee: { min: 0.01, max: 10000 },
    token: { min: 0.01, max: 1000000 },
    saving: { min: 0, max: 60 },
    windows: { min: 1, max: 5, integer: true },
  };
  const FIELD_NAMES = {
    operations: "Operations",
    units: "Fee units per operation",
    fee: "Fee rate",
    token: "Token value",
    saving: "Batch saving",
    windows: "Finality windows",
  };
  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];
  const own = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
  const isRecord = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
  const known = (id) => typeof id === "string" && own(NETWORK_MAP, id);
  const escape = (value) =>
    String(value).replace(
      /[&<>"']/g,
      (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char],
    );
  const cleanText = (value, length) =>
    typeof value === "string" ? value.replace(/[\u0000-\u001f\u007f]/g, "").slice(0, length) : "";
  const money = (value) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  const number = (value, maximumFractionDigits = 2) =>
    new Intl.NumberFormat("en-US", { maximumFractionDigits }).format(value);
  const plural = (count, word, pluralWord = word + "s") => `${count} ${count === 1 ? word : pluralWord}`;
  const parameters = new URLSearchParams(location.search);
  const queryKey = (key, map, fallback) => (own(map, parameters.get(key)) ? parameters.get(key) : fallback);
  const clamp = (value, min, max, fallback = min) => {
    const numeric = typeof value === "number" || typeof value === "string" ? Number(value) : NaN;
    return Number.isFinite(numeric) ? Math.min(max, Math.max(min, numeric)) : fallback;
  };
  const safeStorage = (() => {
    const memory = new Map();
    let blocked = false;
    return {
      getItem(key) {
        if (!blocked) {
          try {
            const value = window.localStorage.getItem(key);
            if (value !== null) memory.set(key, value);
            else memory.delete(key);
            return value;
          } catch {
            blocked = true;
          }
        }
        return memory.has(key) ? memory.get(key) : null;
      },
      setItem(key, value) {
        const text = String(value);
        memory.set(key, text);
        if (!blocked) {
          try {
            window.localStorage.setItem(key, text);
          } catch {
            blocked = true;
          }
        }
      },
      removeItem(key) {
        memory.delete(key);
        if (!blocked) {
          try {
            window.localStorage.removeItem(key);
          } catch {
            blocked = true;
          }
        }
      },
    };
  })();
  function readJSON(key) {
    const value = safeStorage.getItem(key);
    if (value === null) return null;
    try {
      return JSON.parse(value);
    } catch {
      safeStorage.removeItem(key);
      return null;
    }
  }
  function writeJSON(key, value) {
    safeStorage.setItem(key, JSON.stringify(value));
  }
  function cleanWatch(value) {
    if (!isRecord(value) || !Array.isArray(value.items)) return { items: [] };
    const items = [];
    value.items.slice(0, 48).forEach((item) => {
      if (!isRecord(item) || !own(item, "id") || !known(item.id) || items.some((row) => row.id === item.id)) return;
      items.push({ id: item.id, note: cleanText(own(item, "note") ? item.note : "", 600) });
    });
    return { items: items.slice(0, NETWORKS.length) };
  }
  function readWatch() {
    const raw = readJSON(STORAGE_KEYS.watch);
    const clean = cleanWatch(raw);
    if (raw !== null) writeJSON(STORAGE_KEYS.watch, clean);
    return clean;
  }
  function defaults(id = NETWORKS[0].id) {
    const network = NETWORK_MAP[known(id) ? id : NETWORKS[0].id];
    return {
      network: network.id,
      operations: 100,
      units: network.units,
      fee: network.fee,
      token: network.token,
      saving: 0,
      windows: 2,
    };
  }
  function cleanPlanner(raw) {
    const result = defaults(isRecord(raw) && own(raw, "network") ? raw.network : NETWORKS[0].id);
    if (!isRecord(raw)) return result;
    // Inputs saved before the rename kept fee units under "gas".
    if (!own(raw, "units") && own(raw, "gas")) raw = { ...raw, units: raw.gas };
    Object.entries(LIMITS).forEach(([key, limit]) => {
      if (!own(raw, key)) return;
      const value = clamp(raw[key], limit.min, limit.max, result[key]);
      result[key] = limit.integer ? Math.floor(value) : Math.round(value * 100) / 100;
    });
    if (![1, 2, 3, 5].includes(result.windows)) result.windows = 2;
    return result;
  }
  function readPlanner() {
    const raw = readJSON(STORAGE_KEYS.planner);
    const clean = cleanPlanner(raw);
    if (raw !== null) writeJSON(STORAGE_KEYS.planner, clean);
    return clean;
  }
  function cleanScenarios(raw) {
    if (!Array.isArray(raw)) return [];
    const result = [];
    raw.slice(0, 40).forEach((item) => {
      if (!isRecord(item) || !own(item, "id") || typeof item.id !== "string" || !/^hf-[a-z0-9-]{1,50}$/.test(item.id))
        return;
      if (result.some((row) => row.id === item.id) || !own(item, "values") || !isRecord(item.values)) return;
      const name = cleanText(own(item, "name") ? item.name : "", 60).trim();
      if (!name) return;
      result.push({
        id: item.id,
        name,
        note: cleanText(own(item, "note") ? item.note : "", 400),
        values: cleanPlanner(item.values),
      });
    });
    return result.slice(0, MAX_SCENARIOS);
  }
  function readScenarios() {
    const raw = readJSON(STORAGE_KEYS.scenarios);
    const clean = cleanScenarios(raw);
    if (raw !== null) writeJSON(STORAGE_KEYS.scenarios, clean);
    return clean;
  }
  // Validate all state at boot, including state owned by a different page.
  readWatch();
  readPlanner();
  readScenarios();
  let announcementTimer;
  function announce(message) {
    const target = $("[data-announcement]");
    if (!target) return;
    clearTimeout(announcementTimer);
    target.textContent = message;
    target.hidden = false;
    announcementTimer = setTimeout(() => {
      target.hidden = true;
    }, 4500);
  }
  const arrow =
    '<svg viewBox="0 0 24 24" class="inline-block size-4 shrink-0 align-middle" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14"/></svg>';
  function saved(id) {
    return readWatch().items.some((item) => item.id === id);
  }
  function watchButton(network) {
    const active = saved(network.id);
    return `<button class="btn-outline text-xs" type="button" data-watch="${network.id}" aria-pressed="${active}" aria-label="${active ? "Remove from watchlist" : "Save to watchlist"}: ${escape(network.name)}">${active ? "Remove from watchlist" : "Save to watchlist"}</button>`;
  }
  function card(network) {
    if (document.body.dataset.page === "networks") {
      return `<article class="grid min-w-0 border border-line bg-panel md:grid-cols-[240px_1fr] xl:grid-cols-[240px_1fr_280px]" data-network="${network.id}">
        <a href="network.html?network=${network.id}" class="flex items-center border-b border-line bg-[#191924] md:border-b-0 md:border-r"><img src="${network.art}" width="400" height="330" alt="${escape(network.name)} network geometry" loading="lazy" class="aspect-[400/330] w-full object-contain"></a>
        <div class="p-6"><p class="eyebrow">HF—${String(network.index).padStart(2, "0")} / ${escape(network.layer)}</p><h3 class="mt-4 text-lg leading-relaxed"><a class="hover:text-lime" href="network.html?network=${network.id}">${escape(network.name)}</a></h3><p class="mt-4 text-sm font-bold text-violet">${escape(network.heading)}</p><p class="mt-4 max-w-2xl text-sm leading-relaxed text-muted">${escape(network.summary)}</p><a class="text-link mt-5 inline-block text-sm" href="network.html?network=${network.id}">Read the profile ${arrow}</a></div>
        <div class="border-t border-line p-6 md:col-span-2 xl:col-span-1 xl:border-l xl:border-t-0"><dl class="grid grid-cols-2 gap-5 text-xs"><div><dt class="text-muted">Fee rate</dt><dd class="mt-2 text-base text-lime">${number(network.fee)} nanotokens</dd></div><div><dt class="text-muted">Finality input</dt><dd class="mt-2 text-base">${network.finality} seconds</dd></div><div class="col-span-2 border-t border-line pt-4"><dt class="text-muted">Consensus model</dt><dd class="mt-2">${escape(network.consensus)}</dd></div></dl><div class="mt-6">${watchButton(network)}</div></div>
      </article>`;
    }
    return `<article class="min-w-0 border border-line bg-panel" data-network="${network.id}"><a href="network.html?network=${network.id}"><img src="${network.art}" width="400" height="330" alt="${escape(network.name)} network geometry" loading="lazy" class="w-full"></a><div class="p-5"><div class="flex flex-wrap justify-between gap-3 text-xs text-muted"><span>${escape(network.layer)}</span><span>${escape(network.ticker)}</span></div><h3 class="mt-5 text-base leading-relaxed"><a class="hover:text-lime" href="network.html?network=${network.id}">${escape(network.name)}</a></h3><p class="mt-4 min-h-12 text-sm leading-relaxed text-muted">${escape(network.heading)}</p><dl class="mt-5 grid grid-cols-2 gap-4 border-t border-line pt-4 text-xs"><div><dt class="text-muted">Fee rate</dt><dd class="mt-2 font-bold">${number(network.fee)} nanotokens</dd></div><div><dt class="text-muted">Finality input</dt><dd class="mt-2 font-bold">${network.finality} seconds</dd></div></dl><div class="mt-6 flex flex-wrap items-center justify-between gap-4"><a class="text-link text-sm" href="network.html?network=${network.id}">Read the profile ${arrow}</a>${watchButton(network)}</div></div></article>`;
  }
  function updateWatchUI() {
    $$("[data-watch-count]").forEach((element) => {
      element.textContent = readWatch().items.length;
    });
    $$("[data-watch]").forEach((button) => {
      const id = button.dataset.watch;
      if (!known(id)) return;
      const active = saved(id);
      button.textContent = active ? "Remove from watchlist" : "Save to watchlist";
      button.setAttribute("aria-pressed", String(active));
      button.setAttribute(
        "aria-label",
        `${active ? "Remove from watchlist" : "Save to watchlist"}: ${NETWORK_MAP[id].name}`,
      );
    });
  }
  function toggleWatch(id) {
    if (!known(id)) return;
    const state = readWatch();
    const index = state.items.findIndex((item) => item.id === id);
    if (index === -1) state.items.push({ id, note: "" });
    else state.items.splice(index, 1);
    writeJSON(STORAGE_KEYS.watch, state);
    updateWatchUI();
    renderResearch();
    announce(`${NETWORK_MAP[id].name} ${index === -1 ? "saved to" : "removed from"} your watchlist.`);
  }
  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-watch]");
    if (button) toggleWatch(button.dataset.watch);
  });
  function initNetworkLibrary() {
    const form = $("[data-network-filters]");
    if (!form) return;
    form.elements.q.value = cleanText(parameters.get("q") || "", 100);
    form.elements.layer.value = queryKey("layer", LAYERS, "all");
    form.elements.sort.value = queryKey("sort", SORTS, "name");
    function render() {
      const query = form.elements.q.value.trim().toLowerCase();
      const layer = own(LAYERS, form.elements.layer.value) ? form.elements.layer.value : "all";
      const order = own(SORTS, form.elements.sort.value) ? form.elements.sort.value : "name";
      const items = NETWORKS.filter(
        (network) =>
          (layer === "all" || network.layer === layer) &&
          `${network.name} ${network.consensus} ${network.use} ${network.heading}`.toLowerCase().includes(query),
      );
      items.sort((a, b) =>
        order === "name" ? a.name.localeCompare(b.name) : a[order] - b[order] || a.name.localeCompare(b.name),
      );
      $("[data-network-grid]").innerHTML = items.map(card).join("");
      $("[data-network-count]").textContent = `${plural(items.length, "profile")} shown from ${NETWORKS.length}.`;
      $("[data-network-empty]").hidden = items.length > 0;
      updateWatchUI();
    }
    form.addEventListener("input", (event) => {
      if (event.target.name === "q") render();
    });
    form.addEventListener("change", (event) => {
      if (event.target.name !== "q") render();
    });
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      render();
    });
    form.addEventListener("reset", () => setTimeout(render, 0));
    render();
  }
  function initNetworkDetail() {
    const target = $("[data-network-detail]");
    if (!target) return;
    const id = queryKey("network", NETWORK_MAP, NETWORKS[0].id);
    const network = NETWORK_MAP[id];
    document.title = `${network.name}: network research profile — Hashfen`;
    $('meta[name="description"]').content = network.summary;
    $('meta[property="og:title"]').content = document.title;
    $('meta[property="og:description"]').content = network.summary;
    target.innerHTML = `<div class="grid gap-9 lg:grid-cols-[1fr_1.1fr]"><div><img src="${network.art}" width="400" height="330" alt="${escape(network.name)} network geometry" class="w-full"><p class="mt-4 text-xs text-muted">REFERENCE GEOMETRY / HF—${String(network.index).padStart(2, "0")}</p><dl class="mt-7 grid grid-cols-2 gap-x-6">${network.metrics.map((metric) => `<div class="metric"><dt>${escape(metric.label)}</dt><dd>${escape(metric.value)}</dd></div>`).join("")}<div class="metric"><dt>Consensus model</dt><dd>${escape(network.consensus)}</dd></div></dl></div><div><p class="eyebrow">${escape(network.layer)} / ${escape(network.ticker)}</p><h1 class="mt-6 text-[clamp(1.7rem,4vw,3rem)] leading-relaxed">${escape(network.name)}</h1><p class="mt-6 text-xl text-violet">${escape(network.heading)}</p><p class="mt-6 leading-relaxed text-muted">${escape(network.summary)}</p><div class="mt-7 flex flex-wrap gap-3"><a class="btn" href="planner.html?network=${network.id}">Model a transaction ${arrow}</a>${watchButton(network)}</div><section class="mt-9 border-t border-line pt-6"><h2 class="text-base leading-relaxed">A useful research route</h2><p class="mt-4 text-muted">${escape(network.use)}.</p><p class="mt-5 leading-relaxed text-muted">${escape(network.note)}</p></section><section class="mt-8 border-t border-line pt-6"><h2 class="text-base leading-relaxed">Keep in view</h2><p class="mt-4 leading-relaxed text-muted">${escape(network.risk)}.</p><ul class="mt-5 space-y-3 text-sm text-muted">${network.checks.map((check) => `<li class="border-l border-violet pl-4">${escape(check)}</li>`).join("")}</ul></section></div></div><p class="mt-8 border border-line bg-panel p-5 text-sm leading-relaxed text-muted">All figures in this profile are editable planning assumptions. They are not current network quotes or investment recommendations. Review the relevant operating documentation before relying on a real network.</p>`;
    $("[data-related]").innerHTML = NETWORKS.filter((item) => item.id !== id)
      .slice(0, 3)
      .map(card)
      .join("");
  }
  function calculate(values) {
    const clean = cleanPlanner(values);
    const network = NETWORK_MAP[clean.network];
    const fullUnits = clean.operations * clean.units;
    const beforeTokens = (fullUnits * clean.fee) / 1e9;
    const tokens = beforeTokens * (1 - clean.saving / 100);
    const total = tokens * clean.token;
    return {
      ...clean,
      networkName: network.name,
      fullUnits,
      beforeTokens,
      tokens,
      total,
      perOperation: total / clean.operations,
      beforeTotal: beforeTokens * clean.token,
      savingTotal: (beforeTokens - tokens) * clean.token,
      waitSeconds: network.finality * clean.windows,
      tokenSymbol: network.ticker,
    };
  }
  function planValues(form) {
    const errors = [];
    const values = { network: form.elements.network.value };
    if (!known(values.network)) errors.push("Choose a network from the list.");
    Object.entries(LIMITS).forEach(([key, limit]) => {
      const raw = form.elements[key].value;
      const value = Number(raw);
      if (
        !raw.trim() ||
        !Number.isFinite(value) ||
        value < limit.min ||
        value > limit.max ||
        (limit.integer && !Number.isInteger(value))
      ) {
        errors.push(
          `${FIELD_NAMES[key]} must be ${limit.integer ? "a whole number " : ""}between ${number(limit.min)} and ${number(limit.max)}.`,
        );
        form.elements[key].setAttribute("aria-invalid", "true");
      } else {
        values[key] = value;
        form.elements[key].removeAttribute("aria-invalid");
      }
    });
    if (!errors.length && ![1, 2, 3, 5].includes(values.windows))
      errors.push("Choose a finality allowance from the list.");
    return { values, errors };
  }
  function markPlanStale() {
    $("[data-plan-total]").textContent = "—";
    $("[data-plan-per]").textContent = "Correct the highlighted input to see an updated estimate.";
    $("[data-plan-breakdown]").innerHTML = "";
    $("[data-plan-range]").textContent = "The comparison returns when every input is within range.";
  }
  function renderPlan(values) {
    const result = calculate(values);
    $("[data-plan-total]").textContent = money(result.total);
    $("[data-plan-per]").textContent =
      `${money(result.perOperation)} per operation across ${plural(result.operations, "operation")}.`;
    $("[data-plan-breakdown]").innerHTML = [
      ["Network profile", result.networkName],
      ["Fee units", `${number(result.fullUnits, 0)} fee units`],
      ["Before batching", money(result.beforeTotal)],
      ["Batch saving", `${result.saving}% / ${money(result.savingTotal)}`],
      ["Token amount", `${number(result.tokens, 8)} ${result.tokenSymbol}`],
      ["Settlement allowance", `${number(result.waitSeconds, 0)} seconds / ${plural(result.windows, "window")}`],
    ]
      .map(
        ([label, value]) =>
          `<div class="flex flex-wrap justify-between gap-3 border-t border-ink/25 pt-3"><dt>${escape(label)}</dt><dd class="font-bold">${escape(value)}</dd></div>`,
      )
      .join("");
    $("[data-plan-range]").textContent =
      `At half the entered fee rate, this plan is ${money(result.total / 2)}. At twice the fee rate, it is ${money(result.total * 2)}. The operation count, token value and batching assumption stay the same.`;
  }
  function fillPlanner(values) {
    const form = $("[data-planner-form]");
    if (!form) return;
    const clean = cleanPlanner(values);
    Object.entries(clean).forEach(([key, value]) => {
      form.elements[key].value = value;
    });
    $("[data-planner-error]").hidden = true;
    $$("[aria-invalid]", form).forEach((element) => element.removeAttribute("aria-invalid"));
    writeJSON(STORAGE_KEYS.planner, clean);
    renderPlan(clean);
  }
  function renderScenarios() {
    const list = $("[data-scenario-list]");
    if (!list) return;
    const scenarios = readScenarios();
    list.innerHTML = scenarios.length
      ? scenarios
          .map((scenario) => {
            const result = calculate(scenario.values);
            return `<article class="min-w-0 border border-line bg-panel p-6" data-scenario="${scenario.id}"><p class="eyebrow">${escape(result.networkName)} / ${plural(result.operations, "operation")}</p><h3 class="mt-4 text-sm leading-relaxed">${escape(scenario.name)}</h3><p class="mt-5 text-2xl font-bold text-lime">${money(result.total)}</p><p class="mt-3 text-sm leading-relaxed text-muted">fee rate ${number(result.fee)} · ${number(result.units, 0)} fee units per operation · ${result.saving}% batch saving · ${result.waitSeconds}s settlement allowance</p>${scenario.note ? `<p class="mt-4 whitespace-pre-wrap break-words border-l border-violet pl-4 text-sm text-muted">${escape(scenario.note)}</p>` : ""}<div class="mt-6 flex flex-wrap gap-3"><button class="btn-outline" type="button" data-load-scenario="${scenario.id}" aria-label="Load: ${escape(scenario.name)}">Load</button><button class="btn-outline" type="button" data-remove-scenario="${scenario.id}" aria-label="Remove: ${escape(scenario.name)}">Remove</button></div></article>`;
          })
          .join("")
      : '<p class="border border-line bg-panel p-7 text-muted">No scenarios saved yet. Give your working assumptions a name above to keep the comparison useful.</p>';
    $("[data-clear-scenarios]").disabled = scenarios.length === 0;
  }
  function initPlanner() {
    const form = $("[data-planner-form]");
    if (!form) return;
    const proposed = parameters.get("network");
    fillPlanner(known(proposed) ? defaults(proposed) : readPlanner());
    function update(event) {
      if (event) event.preventDefault();
      const { values, errors } = planValues(form);
      const error = $("[data-planner-error]");
      error.hidden = errors.length === 0;
      error.textContent = errors.join(" ");
      if (errors.length) {
        markPlanStale();
        return false;
      }
      writeJSON(STORAGE_KEYS.planner, cleanPlanner(values));
      renderPlan(values);
      return true;
    }
    form.addEventListener("submit", (event) => {
      update(event);
    });
    form.addEventListener("input", (event) => {
      if (event.target.name !== "network") update();
    });
    form.addEventListener("change", (event) => {
      if (event.target.name === "network" && known(event.target.value)) {
        const values = defaults(event.target.value);
        values.operations = readPlanner().operations;
        fillPlanner(values);
      } else update();
    });
    $("[data-profile-reset]").addEventListener("click", () => {
      fillPlanner(defaults(form.elements.network.value));
      announce("Reference profile assumptions restored.");
    });
    let serial = 0;
    const save = $("[data-save-scenario]");
    save.addEventListener("submit", (event) => {
      event.preventDefault();
      const name = cleanText(save.elements.name.value, 60).trim();
      const status = $("[data-scenario-status]");
      if (!name) {
        status.textContent = "Give the scenario a name before saving.";
        save.elements.name.focus();
        return;
      }
      if (!update()) {
        status.textContent = "Check the calculation inputs before saving.";
        return;
      }
      const scenarios = readScenarios();
      const sameName = scenarios.find((item) => item.name.toLowerCase() === name.toLowerCase());
      const record = {
        id: sameName ? sameName.id : `hf-${Date.now().toString(36)}-${++serial}`,
        name,
        note: cleanText(save.elements.note.value, 400),
        values: readPlanner(),
      };
      const next = sameName
        ? scenarios.map((item) => (item.id === record.id ? record : item))
        : [record, ...scenarios].slice(0, MAX_SCENARIOS);
      writeJSON(STORAGE_KEYS.scenarios, cleanScenarios(next));
      renderScenarios();
      status.textContent = `${name} ${sameName ? "updated" : "saved"}. ${plural(readScenarios().length, "scenario")} in your research record.`;
    });
    document.addEventListener("click", (event) => {
      const load = event.target.closest("[data-load-scenario]");
      if (load) {
        const scenario = readScenarios().find((item) => item.id === load.dataset.loadScenario);
        if (!scenario) return;
        fillPlanner(scenario.values);
        save.elements.name.value = scenario.name;
        save.elements.note.value = scenario.note;
        form.elements.network.focus();
        announce(`${scenario.name} loaded into the planner.`);
      }
      const remove = event.target.closest("[data-remove-scenario]");
      if (remove) {
        const current = readScenarios();
        const index = current.findIndex((item) => item.id === remove.dataset.removeScenario);
        if (index === -1) return;
        writeJSON(
          STORAGE_KEYS.scenarios,
          current.filter((item) => item.id !== remove.dataset.removeScenario),
        );
        renderScenarios();
        const next = $$("[data-remove-scenario]")[Math.min(index, current.length - 2)];
        (next || save.elements.name).focus();
        announce("Scenario removed.");
      }
    });
    $("[data-clear-scenarios]").addEventListener("click", () => {
      writeJSON(STORAGE_KEYS.scenarios, []);
      renderScenarios();
      save.elements.name.focus();
      announce("All saved scenarios cleared.");
    });
    renderScenarios();
  }
  function researchCard(item) {
    const network = NETWORK_MAP[item.id];
    return `<article class="min-w-0 border border-line bg-panel p-5" data-research-item="${item.id}"><div class="flex items-center justify-between gap-3"><span class="eyebrow">${escape(network.ticker)}</span><button class="text-link text-sm" type="button" data-remove-watch="${item.id}" aria-label="Remove: ${escape(network.name)}">Remove</button></div><h2 class="mt-5 text-base leading-relaxed"><a href="network.html?network=${item.id}" class="hover:text-lime">${escape(network.name)}</a></h2><p class="mt-4 text-sm text-muted">${escape(network.layer)} · ${network.finality}s finality input</p><img src="${network.art}" width="400" height="330" alt="" class="mt-5 w-full"><label class="label mt-5">Research note for ${escape(network.name)}<textarea data-network-note="${item.id}" class="field" rows="4" maxlength="600" placeholder="What do you want to check?">${escape(item.note)}</textarea></label><p data-note-status="${item.id}" class="mt-3 text-xs text-muted" role="status"></p><a href="planner.html?network=${item.id}" class="text-link mt-5 inline-block text-sm">Plan with this profile ${arrow}</a></article>`;
  }
  function renderResearch() {
    const target = $("[data-research-list]");
    if (!target) return;
    const state = readWatch();
    target.innerHTML = state.items.map(researchCard).join("");
    $("[data-research-empty]").hidden = state.items.length > 0;
    $("[data-research-count]").textContent = `${plural(state.items.length, "network")} saved for research.`;
    $("[data-clear-watch]").disabled = state.items.length === 0;
    const comparison = $("[data-comparison]");
    comparison.innerHTML = state.items.length
      ? `<table class="w-full min-w-[620px] border-collapse text-left text-sm"><caption class="sr-only">Saved network planning assumptions</caption><thead><tr class="border-b border-line"><th class="p-4 font-bold" scope="col">Profile</th><th class="p-4 font-bold" scope="col">Architecture</th><th class="p-4 font-bold" scope="col">Fee input</th><th class="p-4 font-bold" scope="col">Finality input</th><th class="p-4 font-bold" scope="col">Reference transfer</th></tr></thead><tbody>${state.items
          .map((item) => {
            const network = NETWORK_MAP[item.id];
            return `<tr class="border-b border-line"><th class="p-4 font-bold" scope="row">${escape(network.name)}</th><td class="p-4 text-muted">${escape(network.layer)}</td><td class="p-4">${number(network.fee)} nanotokens</td><td class="p-4">${network.finality}s</td><td class="p-4">${number(network.units, 0)} fee units</td></tr>`;
          })
          .join("")}</tbody></table>`
      : '<p class="border border-line p-6 text-muted">Save a network above to begin the side-by-side comparison.</p>';
  }
  function initResearch() {
    const picker = $("[data-watch-picker]");
    if (!picker) return;
    picker.addEventListener("submit", (event) => {
      event.preventDefault();
      const id = picker.elements.network.value;
      if (!known(id)) return;
      if (saved(id)) {
        announce(`${NETWORK_MAP[id].name} is already on your watchlist.`);
        return;
      }
      const state = readWatch();
      state.items.push({ id, note: "" });
      writeJSON(STORAGE_KEYS.watch, state);
      renderResearch();
      updateWatchUI();
      announce(`${NETWORK_MAP[id].name} added to your watchlist.`);
    });
    document.addEventListener("input", (event) => {
      const id = event.target.dataset.networkNote;
      if (!known(id)) return;
      const state = readWatch();
      const item = state.items.find((row) => row.id === id);
      if (!item) return;
      item.note = cleanText(event.target.value, 600);
      writeJSON(STORAGE_KEYS.watch, state);
      // Do not replace the textarea while it is being edited.
      $(`[data-note-status="${id}"]`).textContent = "Research note saved.";
    });
    document.addEventListener("click", (event) => {
      const remove = event.target.closest("[data-remove-watch]");
      if (!remove || !known(remove.dataset.removeWatch)) return;
      const state = readWatch();
      const index = state.items.findIndex((item) => item.id === remove.dataset.removeWatch);
      state.items = state.items.filter((item) => item.id !== remove.dataset.removeWatch);
      writeJSON(STORAGE_KEYS.watch, state);
      renderResearch();
      updateWatchUI();
      const next = $$("[data-remove-watch]")[Math.min(index, state.items.length - 1)];
      (next || picker.elements.network).focus();
      announce("Network removed from the research workspace.");
    });
    $("[data-clear-watch]").addEventListener("click", () => {
      writeJSON(STORAGE_KEYS.watch, { items: [] });
      renderResearch();
      updateWatchUI();
      picker.elements.network.focus();
      announce("Research watchlist cleared.");
    });
    renderResearch();
  }
  function priceCalculation(values) {
    const plan = PLAN_MAP[own(PLAN_MAP, values.plan) ? values.plan : "team"];
    const seats = Math.floor(clamp(values.seats, 1, 100, plan.seats));
    const queries = Math.floor(clamp(values.queries, 0, 1000000, plan.queries));
    const extraSeats = Math.max(0, seats - plan.seats);
    const extraBlocks = Math.ceil(Math.max(0, queries - plan.queries) / 10000);
    const additions = extraSeats * plan.extraSeat + extraBlocks * plan.extraQuery;
    const annual = values.billing === "annual";
    const total = annual ? plan.annual + additions * 12 : plan.price + additions;
    return { plan, seats, queries, extraSeats, extraBlocks, additions, annual, total };
  }
  function initPricing() {
    const cards = $("[data-pricing-cards]");
    if (!cards) return;
    cards.innerHTML = PLANS.map(
      (plan) =>
        `<article class="flex flex-col border ${plan.id === "team" ? "border-lime bg-panel" : "border-line"} p-6"><p class="eyebrow">${escape(plan.name)}</p><h2 class="mt-5 text-lg leading-relaxed">${escape(plan.headline)}</h2><p class="mt-7 text-4xl font-bold text-lime">$${plan.price}<span class="text-sm font-normal text-muted"> / month</span></p><p class="mt-4 text-sm text-muted">${plural(plan.seats, "researcher seat")} · ${number(plan.queries, 0)} monthly lookups</p><ul class="mt-7 grow space-y-4 text-sm text-muted">${plan.features.map((feature) => `<li class="border-t border-line pt-3">${escape(feature)}</li>`).join("")}</ul><a href="company.html?plan=${plan.id}#contact" class="btn-outline mt-7">Discuss ${escape(plan.name)}</a></article>`,
    ).join("");
    const form = $("[data-pricing-form]");
    form.elements.plan.value = queryKey("plan", PLAN_MAP, "team");
    const initial = PLAN_MAP[form.elements.plan.value];
    form.elements.seats.value = initial.seats;
    form.elements.queries.value = initial.queries;
    function render() {
      const result = priceCalculation(Object.fromEntries(new FormData(form)));
      $("[data-price-total]").textContent = `${money(result.total)} / ${result.annual ? "year" : "month"}`;
      $("[data-price-breakdown]").innerHTML = [
        ["Base subscription", money(result.annual ? result.plan.annual : result.plan.price)],
        [
          `${plural(result.extraSeats, "additional seat")}`,
          money(result.extraSeats * result.plan.extraSeat * (result.annual ? 12 : 1)),
        ],
        [
          `${plural(result.extraBlocks, "extra lookup block")}`,
          money(result.extraBlocks * result.plan.extraQuery * (result.annual ? 12 : 1)),
        ],
        [
          "Billing basis",
          result.annual ? `${money(result.total / 12)} monthly equivalent, billed annually` : "Billed monthly",
        ],
      ]
        .map(
          ([key, value]) =>
            `<div class="flex flex-wrap justify-between gap-3 border-b border-line pb-3"><dt class="text-muted">${escape(key)}</dt><dd>${escape(value)}</dd></div>`,
        )
        .join("");
      $("[data-price-contact]").href = `company.html?plan=${result.plan.id}#contact`;
    }
    form.addEventListener("input", render);
    form.addEventListener("change", (event) => {
      if (event.target.name === "plan" && own(PLAN_MAP, event.target.value)) {
        const plan = PLAN_MAP[event.target.value];
        form.elements.seats.value = plan.seats;
        form.elements.queries.value = plan.queries;
      }
      render();
    });
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      render();
    });
    render();
  }
  function initGuides() {
    const form = $("[data-guide-filters]");
    if (!form) return;
    function render() {
      const query = form.elements.q.value.trim().toLowerCase();
      const category = ["Costs", "Settlement", "Risk", "Research"].includes(form.elements.category.value)
        ? form.elements.category.value
        : "all";
      const items = GUIDES.filter(
        (guide) =>
          (category === "all" || guide.category === category) &&
          `${guide.title} ${guide.summary} ${guide.paragraphs.join(" ")}`.toLowerCase().includes(query),
      );
      $("[data-guide-count]").textContent = `${plural(items.length, "research note")} shown.`;
      $("[data-guide-list]").innerHTML = items.length
        ? items
            .map(
              (guide) =>
                `<article class="min-w-0 border border-line bg-panel p-6"><p class="eyebrow">${escape(guide.category)}</p><h2 class="mt-5 text-base leading-relaxed">${escape(guide.title)}</h2><p class="mt-5 leading-relaxed text-muted">${escape(guide.summary)}</p><details class="mt-5 border-t border-line pt-5"><summary class="font-bold text-lime">Read the research note</summary><div class="mt-5 space-y-4 leading-relaxed text-muted">${guide.paragraphs.map((paragraph) => `<p>${escape(paragraph)}</p>`).join("")}<p class="border-l border-violet pl-4 text-paper">${escape(guide.check)}</p></div></details></article>`,
            )
            .join("")
        : '<p class="border border-line p-7 text-muted">No research notes match those terms. Try a broader question or another area.</p>';
    }
    form.addEventListener("input", (event) => {
      if (event.target.name === "q") render();
    });
    form.addEventListener("change", (event) => {
      if (event.target.name !== "q") render();
    });
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      render();
    });
    render();
  }
  function initContact() {
    const target = $("[data-team]");
    if (target)
      target.innerHTML = TEAM.map(
        (person) =>
          `<article class="min-w-0"><img src="${person.art}" width="300" height="300" alt="Illustrated portrait of ${escape(person.name)}" class="w-full"><p class="eyebrow mt-6">${escape(person.role)}</p><h2 class="mt-4 text-base leading-relaxed">${escape(person.name)}</h2><p class="mt-5 leading-relaxed text-muted">${escape(person.text)}</p></article>`,
      ).join("");
    const form = $("[data-contact-form]");
    if (!form) return;
    const selected = parameters.get("plan");
    if (own(PLAN_MAP, selected)) {
      form.elements.topic.value = "plan";
      form.elements.message.value = `I would like to discuss the ${PLAN_MAP[selected].name} plan for our team.`;
    }
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      $$("[data-error]", form).forEach((element) => {
        element.textContent = "";
      });
      $$("[aria-invalid]", form).forEach((element) => element.removeAttribute("aria-invalid"));
      const name = form.elements.name.value.trim();
      const email = form.elements.email.value.trim();
      const message = form.elements.message.value.trim();
      const errors = {};
      if (name.length < 2 || name.length > 100) errors.name = "Please enter your name, using 2–100 characters.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 180)
        errors.email = "Please enter a complete email address.";
      if (message.length < 12 || message.length > 2000)
        errors.message = "Please add a little detail, using 12–2,000 characters.";
      if (!own(TOPICS, form.elements.topic.value)) errors.topic = "Choose a topic from the list.";
      const summary = $("[data-contact-errors]");
      summary.hidden = Object.keys(errors).length === 0;
      if (Object.keys(errors).length) {
        summary.textContent = `Please check ${plural(Object.keys(errors).length, "highlighted field")}.`;
        Object.entries(errors).forEach(([key, value]) => {
          $(`[data-error="${key}"]`, form).textContent = value;
          form.elements[key].setAttribute("aria-invalid", "true");
        });
        const first = $('[aria-invalid="true"]', form);
        if (first) first.focus();
        return;
      }
      // Connect a real endpoint here with fetch(form.action, { method:'POST', body:new FormData(form) }).
      // In production, show the success panel below ONLY after a response with response.ok.
      // Contact details remain in this page's form only; they are never written to localStorage.
      const reference = `HF-${String(Date.now()).slice(-6)}`;
      $("[data-contact-thanks]").textContent = `Thanks, ${name.split(/\s+/)[0]}. Your question has reached us.`;
      $("[data-contact-reference]").textContent = `Your reference: ${reference}`;
      form.hidden = true;
      const success = $("[data-contact-success]");
      success.hidden = false;
      success.focus();
      success.scrollIntoView({ block: "start", behavior: "instant" });
    });
    $("[data-contact-another]").addEventListener("click", () => {
      $("[data-contact-success]").hidden = true;
      form.hidden = false;
      form.reset();
      form.elements.name.focus();
    });
  }
  function initMenu() {
    const button = $("[data-menu-toggle]");
    const menu = $("#mobile-menu");
    if (!button || !menu) return;
    function close(focus = false) {
      menu.hidden = true;
      button.setAttribute("aria-expanded", "false");
      button.setAttribute("aria-label", "Open menu");
      if (focus) button.focus();
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
  function initReveals() {
    const elements = $$(".reveal");
    if (matchMedia("(prefers-reduced-motion:reduce)").matches || !("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting || entry.boundingClientRect.top < innerHeight) {
            elements.forEach((element) => {
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
  $$("[data-profile-picker]").forEach((select) => {
    select.innerHTML = NETWORKS.map(
      (network) => `<option value="${network.id}">${escape(network.name)} / ${escape(network.layer)}</option>`,
    ).join("");
  });
  const featured = $("[data-featured]");
  if (featured) featured.innerHTML = NETWORKS.slice(0, 3).map(card).join("");
  initNetworkLibrary();
  initNetworkDetail();
  initPlanner();
  initResearch();
  initPricing();
  initGuides();
  initContact();
  updateWatchUI();
  initMenu();
  initReveals();
})();
