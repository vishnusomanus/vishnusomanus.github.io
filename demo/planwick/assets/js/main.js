/* Planwick browser features: catalog data stays local; no live service calls. */
(() => {
  "use strict";
  const D = window.PLANWICK_DATA;
  if (!D) return;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const own = (object, key) => typeof key === "string" && Object.hasOwn(object, key);
  const mapById = (items) => Object.fromEntries(items.map((item) => [item.id, item]));
  const initiativeMap = mapById(D.initiatives);
  const integrationMap = mapById(D.integrations);
  const usecaseMap = mapById(D.usecases);
  const escapeHTML = (value) =>
    String(value).replace(
      /[&<>"']/g,
      (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char],
    );
  const clamp = (value, min, max, fallback) =>
    (typeof value === "number" || (typeof value === "string" && value.trim() !== "")) && Number.isFinite(Number(value))
      ? Math.min(max, Math.max(min, Number(value)))
      : fallback;
  const count = (number, word) => `${number} ${word}${number === 1 ? "" : "s"}`;
  const money = (pence) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: pence % 100 ? 2 : 0,
    }).format(pence / 100);
  const announce = (message) => {
    $("#announcement").textContent = message;
  };
  const arrow =
    '<svg class="size-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M4 12h16m-6-6 6 6-6 6"/></svg>';
  const KEYS = {
    workspace: "planwick.workspace.v1",
    pricing: "planwick.pricing.v1",
    integrations: "planwick.integrations.v1",
  };
  // Memory is written first, preserving read-after-write if localStorage is unavailable.
  const safeStorage = (() => {
    const memory = new Map();
    let blocked = false;
    return {
      get(key) {
        if (memory.has(key)) return memory.get(key);
        if (!blocked) {
          try {
            const value = localStorage.getItem(key);
            memory.set(key, value);
            return value;
          } catch {
            blocked = true;
          }
        }
        return null;
      },
      set(key, value) {
        const serialised = JSON.stringify(value);
        memory.set(key, serialised);
        if (!blocked) {
          try {
            localStorage.setItem(key, serialised);
          } catch {
            blocked = true;
          }
        }
      },
      read(key, sanitise) {
        let parsed = null;
        try {
          parsed = JSON.parse(this.get(key));
        } catch {
          /* Replace malformed data with a clean state. */
        }
        const clean = sanitise(parsed);
        this.set(key, clean);
        return clean;
      },
    };
  })();
  const validIds = (list, catalogue) =>
    Array.isArray(list) ? [...new Set(list.filter((id) => own(catalogue, id)))] : [];
  const defaultWorkspace = () => ({
    items: D.initiatives.map(({ id, stage, reach, impact, confidence, effort }) => ({
      id,
      stage,
      reach,
      impact,
      confidence,
      effort,
    })),
    scope: D.initiatives.slice(0, 6).map((item) => item.id),
    capacity: 8,
    sorted: false,
  });
  function sanitiseWorkspace(raw) {
    const base = defaultWorkspace();
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return base;
    const overrides = new Map();
    if (Array.isArray(raw.items))
      raw.items.forEach((item) => {
        if (item && own(initiativeMap, item.id) && !overrides.has(item.id)) overrides.set(item.id, item);
      });
    base.items = base.items.map((item) => {
      const saved = overrides.get(item.id);
      if (!saved) return item;
      return {
        id: item.id,
        stage: ["now", "next", "later"].includes(saved.stage) ? saved.stage : item.stage,
        reach: Math.round(clamp(saved.reach, 1, 10000, item.reach)),
        impact: [0.5, 1, 2, 3].includes(saved.impact) ? saved.impact : item.impact,
        confidence: Math.round(clamp(saved.confidence, 10, 100, item.confidence) / 5) * 5,
        effort: Math.round(clamp(saved.effort, 1, 40, item.effort)),
      };
    });
    base.scope = Array.isArray(raw.scope) ? validIds(raw.scope, initiativeMap) : base.scope;
    base.capacity = Math.round(clamp(raw.capacity, 1, 40, 8));
    base.sorted = raw.sorted === true;
    return base;
  }
  function sanitisePricing(raw) {
    const value = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
    return {
      plan: own(D.plans, value.plan) ? value.plan : "team",
      seats: Math.round(clamp(value.seats, 2, 200, 10)),
      billing: value.billing === "annual" ? "annual" : "monthly",
      insights: value.insights === true,
      archive: value.archive === true,
    };
  }
  let workspace = safeStorage.read(KEYS.workspace, sanitiseWorkspace);
  const saveWorkspace = () => {
    safeStorage.set(KEYS.workspace, sanitiseWorkspace(workspace));
    workspace = safeStorage.read(KEYS.workspace, sanitiseWorkspace);
  };
  const score = (item) => (item.reach * item.impact * (item.confidence / 100)) / item.effort;
  const rankedItems = () => [...workspace.items].sort((a, b) => score(b) - score(a) || a.id.localeCompare(b.id));
  const KEEP_RELEASES_CURRENT = true;
  const FIXED_RELEASE_START = "2026-10-26";
  const KEEP_CONVERSATIONS_CURRENT = true;
  const FIXED_CONVERSATION_START = "2026-10-20";
  const londonToday = () => {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date());
    const part = (name) => parts.find((value) => value.type === name).value;
    return new Date(`${part("year")}-${part("month")}-${part("day")}T12:00:00Z`);
  };
  const addDays = (date, days) => {
    const next = new Date(date);
    next.setUTCDate(next.getUTCDate() + days);
    return next;
  };
  const isoDate = (date) => date.toISOString().slice(0, 10);
  const displayDate = (date) =>
    new Intl.DateTimeFormat("en-US", { timeZone: "UTC", day: "numeric", month: "long", year: "numeric" }).format(date);
  const weekdayDate = (date) =>
    `${new Intl.DateTimeFormat("en-US", { timeZone: "UTC", weekday: "long" }).format(date)}, ${displayDate(date)}`;
  function releaseStart() {
    if (!KEEP_RELEASES_CURRENT) return new Date(`${FIXED_RELEASE_START}T12:00:00Z`);
    const today = londonToday();
    return addDays(today, (8 - today.getUTCDay()) % 7 || 7);
  }
  // US federal holidays for any year, by rule, moved to the observed weekday when they fall on a weekend.
  function federalHolidays(year) {
    const nth = (month, weekday, n) => {
      const first = new Date(Date.UTC(year, month, 1, 12));
      return addDays(first, ((weekday - first.getUTCDay() + 7) % 7) + (n - 1) * 7);
    };
    const fixed = (month, day) => {
      const date = new Date(Date.UTC(year, month, day, 12));
      return addDays(date, date.getUTCDay() === 6 ? -1 : date.getUTCDay() === 0 ? 1 : 0);
    };
    return [
      fixed(0, 1), // New Year's Day
      nth(0, 1, 3), // Martin Luther King Jr. Day
      nth(1, 1, 3), // Washington's Birthday
      addDays(nth(5, 1, 1), -7), // Memorial Day: last Monday of May
      fixed(5, 19), // Juneteenth
      fixed(6, 4), // Independence Day
      nth(8, 1, 1), // Labor Day
      nth(9, 1, 2), // Columbus Day
      fixed(10, 11), // Veterans Day
      nth(10, 4, 4), // Thanksgiving
      fixed(11, 25), // Christmas Day
    ].map(isoDate);
  }
  function conversationDays() {
    const start = KEEP_CONVERSATIONS_CURRENT ? londonToday() : new Date(`${FIXED_CONVERSATION_START}T12:00:00Z`);
    const days = [];
    for (let offset = 1; days.length < 6 && offset < 60; offset++) {
      const date = addDays(start, offset);
      // Closed on federal holidays and from Christmas Eve through January 3.
      const month = date.getUTCMonth();
      const day = date.getUTCDate();
      const closed =
        federalHolidays(date.getUTCFullYear()).includes(isoDate(date)) ||
        (month === 11 && day >= 24) ||
        (month === 0 && day <= 3);
      if ([2, 4].includes(date.getUTCDay()) && !closed) days.push(date);
    }
    return days;
  }
  $$("[data-year]").forEach((element) => {
    element.textContent = londonToday().getUTCFullYear();
  });
  $$("[data-next-cycle]").forEach((element) => {
    element.textContent = displayDate(releaseStart());
  });
  const menuButton = $("#menu-toggle");
  const mobileMenu = $("#mobile-menu");
  function closeMenu(restore = false) {
    mobileMenu.hidden = true;
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open menu");
    if (restore) menuButton.focus();
  }
  menuButton.addEventListener("click", () => {
    const open = menuButton.getAttribute("aria-expanded") !== "true";
    mobileMenu.hidden = !open;
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !mobileMenu.hidden) closeMenu(true);
  });
  window.matchMedia("(min-width: 1024px)").addEventListener("change", (event) => {
    if (event.matches) closeMenu();
  });
  const reveals = $$(".reveal");
  if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting || entry.boundingClientRect.top < innerHeight) {
            // Reveal earlier content too after an anchor jump or an instant End scroll.
            reveals.forEach((element) => {
              if (element.getBoundingClientRect().top < innerHeight) {
                element.classList.add("is-visible");
                observer.unobserve(element);
              }
            });
          }
        }),
      { threshold: 0.05 },
    );
    reveals.forEach((element) => observer.observe(element));
  } else reveals.forEach((element) => element.classList.add("is-visible"));
  function featureCard(item) {
    return `<article class="rounded-[2rem] border border-line bg-white p-7"><img src="assets/img/${item.image}.svg" width="540" height="400" alt="" class="mb-6 w-full rounded-2xl bg-mist"><h3 class="font-display text-4xl font-bold">${escapeHTML(item.title)}</h3><p class="mt-4 leading-relaxed text-muted">${escapeHTML(item.summary)}</p><a href="product.html#${item.id}" class="text-link mt-5">Explore ${item.id === "align" ? "alignment" : item.id === "prioritise" ? "priorities" : "release planning"} ${arrow}</a></article>`;
  }
  if ($("[data-home-features]")) $("[data-home-features]").innerHTML = D.product.map(featureCard).join("");
  if ($("[data-home-integrations]"))
    $("[data-home-integrations]").innerHTML = D.integrations
      .slice(0, 4)
      .map(
        (item) =>
          `<a class="rounded-3xl border border-line bg-white p-5 transition hover:-translate-y-1" href="integrations.html?connection=${item.id}"><img src="assets/img/${item.id}.svg" width="540" height="400" alt="" class="w-full"><h3 class="mt-4 font-display text-3xl font-bold">${item.title}</h3><p class="mt-2 text-sm text-muted">${item.summary}</p></a>`,
      )
      .join("");
  function setupProduct() {
    const panels = $("[data-product-panels]");
    if (!panels) return;
    panels.innerHTML = D.product
      .map(
        (item, index) =>
          `<section id="panel-${item.id}" role="tabpanel" aria-labelledby="tab-${item.id}" tabindex="0" ${index ? "hidden" : ""} class="mt-8 grid gap-8 rounded-[2rem] border border-line bg-white p-6 md:grid-cols-2 md:items-center sm:p-10"><img src="assets/img/${item.image}.svg" width="540" height="400" alt="" class="w-full rounded-2xl bg-mist"><div><h3 class="font-display text-5xl font-bold leading-none">${item.title}</h3><p class="mt-5 leading-relaxed text-muted">${item.summary}</p><ul class="mt-5 list-disc space-y-2 pl-5">${item.points.map((point) => `<li>${point}</li>`).join("")}</ul><a href="workspace.html" class="text-link mt-6">Try it in your roadmap ${arrow}</a></div></section>`,
      )
      .join("");
    const tabs = $$("[data-product-tab]");
    const select = (id, focus = false) => {
      if (!D.product.some((item) => item.id === id)) return;
      tabs.forEach((tab) => {
        const active = tab.dataset.productTab === id;
        tab.setAttribute("aria-selected", String(active));
        tab.tabIndex = active ? 0 : -1;
        $(`#panel-${tab.dataset.productTab}`).hidden = !active;
        if (active && focus) tab.focus();
      });
    };
    const remember = (id) => history.replaceState(null, "", `#${id}`);
    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => {
        select(tab.dataset.productTab);
        remember(tab.dataset.productTab);
      });
      tab.addEventListener("keydown", (event) => {
        const target = {
          ArrowRight: (index + 1) % tabs.length,
          ArrowLeft: (index + tabs.length - 1) % tabs.length,
          Home: 0,
          End: tabs.length - 1,
        }[event.key];
        if (target !== undefined) {
          event.preventDefault();
          select(tabs[target].dataset.productTab, true);
          remember(tabs[target].dataset.productTab);
        }
      });
    });
    select(location.hash.slice(1));
    // Links such as product.html#commit can arrive while this page is already open.
    window.addEventListener("hashchange", () => {
      const id = location.hash.slice(1);
      if (!D.product.some((item) => item.id === id)) return;
      select(id);
      $("[data-product-tabs]").scrollIntoView({ block: "start" });
    });
  }
  function setupWorkspace() {
    const board = $("[data-roadmap]");
    if (!board) return;
    const filters = $("#workspace-filters");
    const status = $("[data-workspace-status]");
    const capacity = $("[data-capacity]");
    const dialog = $("#score-dialog");
    const scoreForm = $("#score-form");
    let editedId = null;
    let returnId = null;
    capacity.value = workspace.capacity;
    function renderPlan() {
      const selected = rankedItems().filter((item) => workspace.scope.includes(item.id));
      const total = selected.reduce((sum, item) => sum + item.effort, 0);
      const weeks = Math.ceil(total / workspace.capacity);
      $("[data-capacity-summary]").textContent = selected.length
        ? `${count(selected.length, "initiative")}, ${count(total, "effort point")} across ${count(weeks, "week")} at ${count(workspace.capacity, "point")} a week. Starts ${displayDate(releaseStart())}.`
        : "No initiatives in this release. Add an initiative from the board to calculate a plan.";
      let cumulative = 0;
      $("[data-release-plan]").innerHTML = selected
        .map((item) => {
          cumulative += item.effort;
          const week = Math.ceil(cumulative / workspace.capacity);
          const finish = addDays(releaseStart(), (week - 1) * 7 + 4);
          return `<li class="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-white p-5"><div><h3 class="font-display text-2xl font-bold">${initiativeMap[item.id].title}</h3><p class="mt-1 text-sm text-muted">${count(item.effort, "point")} · Week ${week} · By ${displayDate(finish)}</p></div><button type="button" class="text-link text-sm" data-remove-scope="${item.id}">Remove<span class="sr-only"> ${initiativeMap[item.id].title} from release</span></button></li>`;
        })
        .join("");
    }
    function renderBoard(focusId) {
      const term = filters.elements.search.value.trim().toLowerCase();
      const team = filters.elements.team.value;
      const stageFilter = filters.elements.stage.value;
      const records = (workspace.sorted ? rankedItems() : workspace.items).filter((item) => {
        const source = initiativeMap[item.id];
        return (
          (team === "all" || source.team === team) &&
          (stageFilter === "all" || item.stage === stageFilter) &&
          `${source.title} ${source.summary} ${source.owner} ${source.evidence}`.toLowerCase().includes(term)
        );
      });
      $("[data-initiative-count]").textContent =
        `${count(records.length, "initiative")} shown. ${workspace.sorted ? "Ordered by priority score." : "Original planning order."}`;
      board.innerHTML = ["now", "next", "later"]
        .map((stage) => {
          const items = records.filter((item) => item.stage === stage);
          return `<section class="rounded-[2rem] bg-mist p-4 sm:p-5"><div class="mb-5 flex items-center justify-between"><h2 class="font-display text-4xl font-bold">${stage[0].toUpperCase() + stage.slice(1)}</h2><span class="rounded-full border border-line bg-white px-3 py-1 text-sm">${items.length}</span></div><div class="space-y-4">${
            items.length
              ? items
                  .map((item) => {
                    const source = initiativeMap[item.id];
                    const selected = workspace.scope.includes(item.id);
                    return `<article class="rounded-3xl border border-line bg-white p-5"><p class="eyebrow">${source.team}</p><h3 class="mt-3 font-display text-3xl font-bold leading-none">${source.title}</h3><p class="mt-3 text-sm leading-relaxed text-muted">${source.summary}</p><details class="mt-3 text-sm"><summary class="cursor-pointer underline underline-offset-4">Evidence behind the idea</summary><p class="mt-2 text-muted">${source.evidence}</p></details><p class="mt-4 text-xs text-muted">Owner: ${source.owner}</p><div class="mt-4 flex items-center justify-between gap-2 border-y border-line py-3"><p class="text-sm">Score <strong>${score(item).toFixed(1)}</strong><br><span class="text-xs text-muted">${count(item.effort, "effort point")}</span></p><button type="button" class="text-link text-sm" data-edit-score="${item.id}">Edit score<span class="sr-only"> for ${source.title}</span></button></div><label for="stage-${item.id}" class="label mt-4 text-xs">Planning stage<select id="stage-${item.id}" class="field mt-1 text-sm" data-stage="${item.id}">${["now", "next", "later"].map((value) => `<option value="${value}" ${value === item.stage ? "selected" : ""}>${value[0].toUpperCase() + value.slice(1)}</option>`).join("")}</select></label><button type="button" data-scope="${item.id}" aria-pressed="${selected}" class="pill mt-4 w-full text-sm">${selected ? "In release scope" : "Add to release scope"}</button></article>`;
                  })
                  .join("")
              : '<p class="rounded-2xl border border-dashed border-line p-5 text-sm text-muted">No initiatives match this stage and these filters.</p>'
          }</div></section>`;
        })
        .join("");
      if (focusId) $(`[data-${focusId.type}="${focusId.id}"]`)?.focus();
      renderPlan();
    }
    filters.addEventListener("input", () => renderBoard());
    filters.addEventListener("submit", (event) => event.preventDefault());
    board.addEventListener("change", (event) => {
      const id = event.target.dataset.stage;
      if (!own(initiativeMap, id) || !["now", "next", "later"].includes(event.target.value)) return;
      workspace.items.find((item) => item.id === id).stage = event.target.value;
      saveWorkspace();
      renderBoard({ type: "stage", id });
      status.textContent = `${initiativeMap[id].title} moved to ${event.target.value}.`;
    });
    board.addEventListener("click", (event) => {
      const scopeButton = event.target.closest("[data-scope]");
      const editButton = event.target.closest("[data-edit-score]");
      if (scopeButton && own(initiativeMap, scopeButton.dataset.scope)) {
        const id = scopeButton.dataset.scope;
        const selected = workspace.scope.includes(id);
        workspace.scope = selected ? workspace.scope.filter((value) => value !== id) : [...workspace.scope, id];
        saveWorkspace();
        renderBoard({ type: "scope", id });
        status.textContent = `${initiativeMap[id].title} ${selected ? "removed from" : "added to"} release scope.`;
      }
      if (editButton && own(initiativeMap, editButton.dataset.editScore)) {
        editedId = editButton.dataset.editScore;
        returnId = editedId;
        const item = workspace.items.find((record) => record.id === editedId);
        $("#score-title").textContent = `Priority: ${initiativeMap[editedId].title}`;
        ["reach", "impact", "confidence", "effort"].forEach((key) => {
          scoreForm.elements[key].value = item[key];
        });
        $("#score-error").textContent = "";
        previewScore();
        dialog.showModal();
        scoreForm.elements.reach.focus();
      }
    });
    function previewScore() {
      const candidate = Object.fromEntries(
        ["reach", "impact", "confidence", "effort"].map((key) => [key, Number(scoreForm.elements[key].value)]),
      );
      $("[data-score-preview]").textContent = Number.isFinite(score(candidate)) ? score(candidate).toFixed(1) : "—";
    }
    scoreForm.addEventListener("input", previewScore);
    scoreForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const invalid = [...scoreForm.elements].find((field) => field.willValidate && !field.validity.valid);
      if (invalid) {
        $("#score-error").textContent = "Check the limits shown on each priority input.";
        invalid.focus();
        return;
      }
      const item = workspace.items.find((record) => record.id === editedId);
      ["reach", "impact", "confidence", "effort"].forEach((key) => {
        item[key] = Number(scoreForm.elements[key].value);
      });
      saveWorkspace();
      dialog.close();
      renderBoard({ type: "edit-score", id: returnId });
      status.textContent = `Priority inputs saved for ${initiativeMap[editedId].title}.`;
    });
    $("[data-close-score]").addEventListener("click", () => dialog.close());
    dialog.addEventListener("close", () => $(`[data-edit-score="${returnId}"]`)?.focus());
    capacity.addEventListener("input", () => {
      if (!capacity.validity.valid || capacity.value === "") return;
      workspace.capacity = Number(capacity.value);
      saveWorkspace();
      renderPlan();
    });
    capacity.addEventListener("blur", () => {
      capacity.value = workspace.capacity;
    });
    $("[data-apply-scores]").addEventListener("click", () => {
      workspace.sorted = true;
      saveWorkspace();
      renderBoard();
      status.textContent = "Roadmap ordered by priority score within each stage.";
    });
    $("[data-clear-scope]").addEventListener("click", () => {
      workspace.scope = [];
      saveWorkspace();
      renderBoard();
      status.textContent = "Release scope cleared. Your initiative priorities are unchanged.";
    });
    $("[data-release-plan]").addEventListener("click", (event) => {
      const button = event.target.closest("[data-remove-scope]");
      if (!button || !own(initiativeMap, button.dataset.removeScope)) return;
      const buttons = $$("[data-remove-scope]");
      const index = buttons.indexOf(button);
      const id = button.dataset.removeScope;
      workspace.scope = workspace.scope.filter((value) => value !== id);
      saveWorkspace();
      renderBoard();
      const remaining = $$("[data-remove-scope]");
      (remaining[Math.min(index, remaining.length - 1)] || $("[data-clear-scope]")).focus();
      announce(`${initiativeMap[id].title} removed from the release.`);
    });
    $("[data-reset-workspace]").addEventListener("click", () => {
      workspace = defaultWorkspace();
      saveWorkspace();
      capacity.value = workspace.capacity;
      filters.reset();
      renderBoard();
      status.textContent = "Original roadmap, scores and release scope restored.";
    });
    renderBoard();
  }
  function setupUsecases() {
    const tabs = $("[data-usecase-tabs]");
    if (!tabs) return;
    let active = "product";
    function render() {
      tabs.innerHTML = D.usecases
        .map(
          (item) =>
            `<button type="button" class="pill" data-usecase="${item.id}" aria-pressed="${item.id === active}">${item.title}</button>`,
        )
        .join("");
      const item = usecaseMap[active];
      $("[data-usecase-detail]").innerHTML =
        `<article class="mt-8 grid gap-8 rounded-[2rem] border border-line bg-white p-7 md:grid-cols-[1.1fr_.9fr] md:items-center sm:p-10"><div><p class="eyebrow">${item.title}</p><h2 class="mt-4 font-display text-5xl font-bold leading-none">${item.heading}</h2><p class="mt-5 leading-relaxed text-muted">${item.summary}</p><ul class="mt-5 list-disc space-y-3 pl-5">${item.practices.map((point) => `<li>${point}</li>`).join("")}</ul><p class="mt-5 text-sm text-muted">Suggested rhythm: ${item.cadence}</p><button class="btn mt-6" type="button" data-apply-usecase="${item.id}">Use this release starting point ${arrow}</button></div><div class="rounded-3xl bg-mist p-7"><h3 class="font-display text-3xl font-bold">A focused first scope</h3><ul class="mt-5 space-y-3">${item.scope.map((id) => `<li class="rounded-2xl bg-white p-4 text-sm">${initiativeMap[id].title}</li>`).join("")}</ul><p class="mt-5 text-sm text-muted">${item.capacity} effort points per week. Adjust your own scope and capacity in the workspace.</p><a href="workspace.html" class="text-link mt-5">Open your roadmap ${arrow}</a></div></article>`;
    }
    tabs.addEventListener("click", (event) => {
      const id = event.target.closest("[data-usecase]")?.dataset.usecase;
      if (!own(usecaseMap, id)) return;
      active = id;
      render();
      $(`[data-usecase="${id}"]`).focus();
    });
    $("[data-usecase-detail]").addEventListener("click", (event) => {
      const id = event.target.closest("[data-apply-usecase]")?.dataset.applyUsecase;
      if (!own(usecaseMap, id)) return;
      workspace.scope = [...usecaseMap[id].scope];
      workspace.capacity = usecaseMap[id].capacity;
      saveWorkspace();
      const feedback = $("[data-scope-feedback]");
      feedback.hidden = false;
      feedback.textContent = `${usecaseMap[id].title}: ${count(workspace.scope.length, "initiative")} added to your release scope at ${count(workspace.capacity, "point")} a week. Open your roadmap to adjust the plan.`;
    });
    render();
  }
  function setupPricing() {
    const form = $("#pricing-form");
    if (!form) return;
    let state = safeStorage.read(KEYS.pricing, sanitisePricing);
    const params = new URLSearchParams(location.search);
    if (own(D.plans, params.get("plan"))) state.plan = params.get("plan");
    if (params.has("seats")) state.seats = Math.round(clamp(params.get("seats"), 2, 200, state.seats));
    if (["monthly", "annual"].includes(params.get("billing"))) state.billing = params.get("billing");
    $("[data-pricing-cards]").innerHTML = Object.entries(D.plans)
      .map(
        ([id, plan]) =>
          `<article class="rounded-[2rem] border border-line ${id === "team" ? "bg-mist" : "bg-white"} p-7"><p class="eyebrow">${id === "team" ? "Room to grow" : id === "start" ? "A good beginning" : "A wider view"}</p><h2 class="mt-4 font-display text-5xl font-bold">${plan.title}</h2><p class="mt-4 text-muted">${plan.summary}</p><p class="mt-6"><strong class="font-display text-5xl">${money(plan.rate)}</strong> / person / month</p><ul class="mt-6 list-disc space-y-3 pl-5 text-sm">${plan.features.map((feature) => `<li>${feature}</li>`).join("")}</ul><a href="#calculator" data-select-plan="${id}" class="btn btn-outline mt-7 w-full">Calculate ${plan.title}</a></article>`,
      )
      .join("");
    function setFields() {
      form.elements.plan.value = state.plan;
      form.elements.seats.value = state.seats;
      form.elements.billing.value = state.billing;
      form.elements.insights.checked = state.insights;
      form.elements.archive.checked = state.archive;
    }
    function calculate() {
      const base = D.plans[state.plan].rate * state.seats;
      const seatTotal = state.billing === "annual" ? Math.round(base * 0.8) : base;
      const extras = (state.insights ? 4000 : 0) + (state.archive ? 2000 : 0);
      const total = seatTotal + extras;
      $("[data-price-total]").textContent = money(total);
      $("[data-price-period]").textContent =
        state.billing === "annual" ? "per month, billed annually" : "per month, billed monthly";
      $("[data-price-breakdown]").innerHTML =
        `<div class="flex justify-between gap-4"><dt>${D.plans[state.plan].title} · ${count(state.seats, "person").replace("persons", "people")}</dt><dd>${money(seatTotal)}</dd></div>${state.insights ? `<div class="flex justify-between gap-4"><dt>Insights pack</dt><dd>${money(4000)}</dd></div>` : ""}${state.archive ? `<div class="flex justify-between gap-4"><dt>Extended archive</dt><dd>${money(2000)}</dd></div>` : ""}<div class="flex justify-between gap-4 border-t border-white/20 pt-4"><dt>${state.billing === "annual" ? "Annual invoice" : "Monthly invoice"}</dt><dd>${money(total * (state.billing === "annual" ? 12 : 1))}</dd></div>`;
      $("[data-price-saving]").textContent =
        state.billing === "annual"
          ? `Annual billing saves ${money((base - seatTotal) * 12)} a year on seats. Add-ons keep the same monthly equivalent.`
          : "Switch to annual billing to save 20% on seats.";
      $("[data-plan-contact]").href = `contact.html?plan=${state.plan}&seats=${state.seats}&billing=${state.billing}`;
      safeStorage.set(KEYS.pricing, state);
      state = safeStorage.read(KEYS.pricing, sanitisePricing);
    }
    form.addEventListener("input", () => {
      if (!form.elements.seats.validity.valid || form.elements.seats.value === "") return;
      state = sanitisePricing({
        plan: form.elements.plan.value,
        seats: form.elements.seats.value,
        billing: form.elements.billing.value,
        insights: form.elements.insights.checked,
        archive: form.elements.archive.checked,
      });
      calculate();
    });
    form.elements.seats.addEventListener("blur", () => {
      form.elements.seats.value = state.seats;
    });
    form.addEventListener("submit", (event) => event.preventDefault());
    $$("[data-select-plan]").forEach((link) =>
      link.addEventListener("click", () => {
        state.plan = link.dataset.selectPlan;
        setFields();
        calculate();
      }),
    );
    $("[data-reset-pricing]").addEventListener("click", () => {
      state = sanitisePricing(null);
      setFields();
      calculate();
      announce("Pricing reset to ten people on Team, billed monthly.");
    });
    setFields();
    calculate();
  }
  function setupIntegrations() {
    const grid = $("[data-integrations]");
    if (!grid) return;
    const filters = $("#integration-filters");
    let saved = safeStorage.read(KEYS.integrations, (raw) => validIds(raw, integrationMap));
    const connection = new URLSearchParams(location.search).get("connection");
    if (own(integrationMap, connection)) filters.elements.search.value = integrationMap[connection].title;
    const persist = () => {
      safeStorage.set(KEYS.integrations, saved);
      saved = safeStorage.read(KEYS.integrations, (raw) => validIds(raw, integrationMap));
    };
    function render(focusId) {
      const term = filters.elements.search.value.trim().toLowerCase();
      const category = filters.elements.category.value;
      const items = D.integrations.filter(
        (item) =>
          (category === "all" || item.category === category) &&
          (!filters.elements.saved.checked || saved.includes(item.id)) &&
          `${item.title} ${item.summary} ${item.category}`.toLowerCase().includes(term),
      );
      $("[data-integration-count]").textContent = `${count(items.length, "connection")} shown.`;
      grid.innerHTML = items.length
        ? items
            .map(
              (item) =>
                `<article class="flex flex-col rounded-[2rem] border border-line bg-white p-6"><img src="assets/img/${item.id}.svg" width="540" height="400" alt="" class="w-full rounded-2xl bg-mist"><p class="eyebrow mt-5">${item.category}</p><h2 class="mt-3 font-display text-3xl font-bold">${item.title}</h2><p class="mt-3 text-sm leading-relaxed text-muted">${item.summary}</p><details class="mt-4 text-sm"><summary class="cursor-pointer underline underline-offset-4">Review access & setup</summary><p class="mt-3"><strong>Access:</strong> ${item.permission}</p><p class="mt-3"><strong>First check:</strong> ${item.checkpoint}</p></details><button type="button" class="pill mt-6 w-full" data-save-integration="${item.id}" aria-pressed="${saved.includes(item.id)}">${saved.includes(item.id) ? "Remove from rollout" : "Add to rollout"}<span class="sr-only">: ${item.title}</span></button></article>`,
            )
            .join("")
        : '<p class="rounded-3xl border border-line bg-white p-7 text-muted md:col-span-2 lg:col-span-3">No connections match those choices. Try another search or turn off the rollout filter.</p>';
      $("[data-rollout-summary]").textContent = saved.length
        ? `${count(saved.length, "connection")} in your rollout, in the order we’ll set them up.`
        : "Your rollout is clear. Add connections above to build a practical setup checklist.";
      $("[data-rollout]").innerHTML = saved
        .map(
          (id, index) =>
            `<li class="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-line bg-white p-5"><div class="max-w-2xl"><p class="eyebrow">Step ${index + 1} · ${integrationMap[id].owner}</p><h3 class="mt-2 font-display text-3xl font-bold">${integrationMap[id].title}</h3><p class="mt-2 text-sm text-muted">${integrationMap[id].checkpoint}</p></div><button type="button" class="text-link text-sm" data-remove-integration="${id}">Remove<span class="sr-only"> ${integrationMap[id].title} from checklist</span></button></li>`,
        )
        .join("");
      if (focusId) $(`[data-save-integration="${focusId}"]`)?.focus();
    }
    filters.addEventListener("input", () => render());
    filters.addEventListener("submit", (event) => event.preventDefault());
    grid.addEventListener("click", (event) => {
      const button = event.target.closest("[data-save-integration]");
      if (!button || !own(integrationMap, button.dataset.saveIntegration)) return;
      const id = button.dataset.saveIntegration;
      const removing = saved.includes(id);
      const previous = $$("[data-save-integration]").indexOf(button);
      saved = removing ? saved.filter((item) => item !== id) : [...saved, id];
      persist();
      render(id);
      if (removing && filters.elements.saved.checked) {
        const remaining = $$("[data-save-integration]");
        (remaining[Math.min(previous, remaining.length - 1)] || filters.elements.saved).focus();
      }
      announce(`${integrationMap[id].title} ${removing ? "removed from" : "added to"} the rollout.`);
    });
    $("[data-rollout]").addEventListener("click", (event) => {
      const button = event.target.closest("[data-remove-integration]");
      if (!button || !own(integrationMap, button.dataset.removeIntegration)) return;
      const index = $$("[data-remove-integration]").indexOf(button);
      const id = button.dataset.removeIntegration;
      saved = saved.filter((item) => item !== id);
      persist();
      render();
      const remaining = $$("[data-remove-integration]");
      (remaining[Math.min(index, remaining.length - 1)] || $("[data-clear-integrations]")).focus();
      announce(`${integrationMap[id].title} removed from the rollout.`);
    });
    $("[data-clear-integrations]").addEventListener("click", () => {
      saved = [];
      persist();
      render();
      announce("Connection rollout cleared.");
    });
    render();
  }
  function setupResources() {
    const grid = $("[data-resources]");
    if (!grid) return;
    const form = $("#resource-filters");
    function render() {
      const term = form.elements.search.value.trim().toLowerCase();
      const items = D.resources.filter(
        (item) =>
          (form.elements.topic.value === "all" || item.topic === form.elements.topic.value) &&
          `${item.title} ${item.summary} ${item.steps.join(" ")} ${item.takeaway}`.toLowerCase().includes(term),
      );
      $("[data-resource-count]").textContent = `${count(items.length, "guide")} found.`;
      grid.innerHTML = items.length
        ? items
            .map(
              (item) =>
                `<article class="rounded-[2rem] border border-line bg-white p-7"><div class="flex items-center justify-between gap-3"><p class="eyebrow">${item.topic}</p><span class="text-xs text-muted">${item.minutes} minute read</span></div><h2 class="mt-4 font-display text-4xl font-bold leading-none">${item.title}</h2><p class="mt-4 leading-relaxed text-muted">${item.summary}</p><details class="mt-6"><summary class="text-link cursor-pointer">Read the guide<span class="sr-only">: ${item.title}</span></summary><ol class="mt-5 list-decimal space-y-4 pl-5 text-sm leading-relaxed">${item.steps.map((step) => `<li>${step}</li>`).join("")}</ol><p class="mt-5 rounded-2xl bg-mist p-4 text-sm">${item.takeaway}</p></details></article>`,
            )
            .join("")
        : '<p class="rounded-3xl border border-line bg-white p-7 text-muted md:col-span-2">No guides match those choices. Try a broader phrase or another topic.</p>';
    }
    form.addEventListener("input", render);
    form.addEventListener("submit", (event) => event.preventDefault());
    render();
  }
  function setupContact() {
    const form = $("#contact-form");
    if (!form) return;
    $("[data-team]").innerHTML = D.team
      .map(
        (person) =>
          `<article><h3 class="font-display text-2xl font-bold">${person.name}</h3><p class="mt-1 text-sm font-medium">${person.role}</p><p class="mt-2 text-sm text-muted">${person.detail}</p></article>`,
      )
      .join("");
    const dateOptions = conversationDays();
    form.elements.date.innerHTML =
      '<option value="flexible">I’m flexible</option>' +
      dateOptions.map((date) => `<option value="${isoDate(date)}">${weekdayDate(date)}</option>`).join("");
    const params = new URLSearchParams(location.search);
    const plan = params.get("plan");
    if (own(D.plans, plan)) {
      const seats = Math.round(clamp(params.get("seats"), 2, 200, 10));
      const billing = params.get("billing") === "annual" ? "annual" : "monthly";
      form.elements.topic.value = "pricing";
      form.elements.seats.value = seats <= 10 ? "2-10" : seats <= 30 ? "11-30" : seats <= 75 ? "31-75" : "76+";
      form.elements.message.value = `I’d like to discuss the ${D.plans[plan].title} plan for ${seats} people, with ${billing} billing.`;
    }
    const showTopic = () => {
      $("[data-walkthrough-fields]").hidden = form.elements.topic.value !== "walkthrough";
    };
    form.elements.topic.addEventListener("change", showTopic);
    showTopic();
    function clearErrors() {
      $$("[data-error]").forEach((element) => {
        element.textContent = "";
      });
      $$("[aria-invalid]", form).forEach((element) => element.removeAttribute("aria-invalid"));
      $("#form-error-summary").hidden = true;
    }
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      clearErrors();
      const errors = {};
      if (form.elements.name.value.trim().length < 2) errors.name = "Please give us your name.";
      if (!form.elements.email.validity.valid || !form.elements.email.value.trim())
        errors.email = "Enter a valid work email address.";
      if (form.elements.team.value.trim().length < 2) errors.team = "Tell us your team or organization.";
      if (form.elements.message.value.trim().length < 12)
        errors.message = "Add at least 12 characters so we can understand the question.";
      if (!form.elements.consent.checked) errors.consent = "Please agree that we can reply to this request.";
      const fields = Object.keys(errors);
      if (fields.length) {
        fields.forEach((name) => {
          $(`[data-error="${name}"]`).textContent = errors[name];
          form.elements[name].setAttribute("aria-invalid", "true");
        });
        const summary = $("#form-error-summary");
        summary.hidden = false;
        summary.textContent = `Please check ${count(fields.length, "field")} below.`;
        form.elements[fields[0]].focus();
        return;
      }
      // Front-end presentation only. Connect fetch/FormData here in production,
      // and display success only after the service returns response.ok.
      // No personal fields are saved to browser storage or sent by this template.
      const firstName = form.elements.name.value.trim().split(/\s+/)[0];
      const reference = `PW-${crypto.getRandomValues(new Uint32Array(1))[0].toString(36).slice(0, 6).toUpperCase().padStart(6, "0")}`;
      $("[data-contact-thanks]").textContent =
        `Thanks, ${firstName}. We’ll take a look at your question about ${form.elements.topic.selectedOptions[0].textContent.toLowerCase()} and help you find a useful next step.`;
      $("[data-contact-reference]").textContent = reference;
      const chosenDate =
        form.elements.topic.value === "walkthrough" && form.elements.date.value !== "flexible"
          ? form.elements.date.selectedOptions[0].textContent
          : "";
      $("[data-contact-date]").hidden = !chosenDate;
      $("[data-contact-date]").textContent = chosenDate
        ? `We’ll suggest a walkthrough time on ${chosenDate}, in Eastern time.`
        : "";
      form.hidden = true;
      $("#contact-success").hidden = false;
      $("#contact-success").focus();
    });
    $("[data-new-request]").addEventListener("click", () => {
      form.reset();
      clearErrors();
      showTopic();
      $("#contact-success").hidden = true;
      form.hidden = false;
      form.elements.name.focus();
    });
  }
  setupProduct();
  setupWorkspace();
  setupUsecases();
  setupPricing();
  setupIntegrations();
  setupResources();
  setupContact();
})();
