/*
 * Latchline: menus, reveals and every interactive feature. Content lives in data.js (window.LATCHLINE).
 * Each init function looks for its own markup and returns early on pages that don't have it.
 */
(() => {
  "use strict";

  const DATA = window.LATCHLINE;
  const {
    SEGMENTS,
    MOTIONS,
    PLAYBOOKS,
    STAGES,
    INDUSTRIES,
    STORIES,
    RESOURCE_TYPES,
    TOPICS,
    RESOURCES,
    TEAM,
    ANNUAL_DISCOUNT,
    PLANS,
    ADDONS,
    HOURS,
    CLOSED_DATES,
    DEMO_SLOTS,
  } = DATA;

  // Everything dated (office hours, demo slots, clinics, plan previews) is worked out in Reno's time zone.
  const TIME_ZONE = "America/Los_Angeles";
  // While on, the onboarding clinic and demo slots are always worked out from today, so the demo never shows
  // a date in the past. Turn it off to list fixed clinic dates from FIXED_CLINIC_DATES instead.
  const KEEP_DEMO_CURRENT = true;
  const FIXED_CLINIC_DATES = ["2026-11-12", "2026-12-10", "2027-01-14"];
  const STORAGE_KEYS = {
    shortlist: "latchline:shortlist:v1",
    quote: "latchline:quote:v1",
  };

  /* ---------- Small helpers ---------- */

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const own = (object, key) => typeof key === "string" && Object.prototype.hasOwnProperty.call(object, key);
  const esc = (value) =>
    String(value).replace(
      /[&<>"']/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
    );
  const plural = (count, word, other = word + "s") => `${count.toLocaleString("en-US")} ${count === 1 ? word : other}`;
  const params = new URLSearchParams(location.search);
  const PLAYBOOK_MAP = Object.fromEntries(PLAYBOOKS.map((item) => [item.id, item]));
  const STAGE_MAP = Object.fromEntries(STAGES.map((item) => [item.id, item]));
  const STORY_MAP = Object.fromEntries(STORIES.map((item) => [item.id, item]));
  const TEAM_MAP = Object.fromEntries(TEAM.map((item) => [item.id, item]));

  // US dollars: whole dollars when the amount is round, cents otherwise ($790, $994.50).
  function money(amount) {
    const cents = Math.round(amount * 100);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: cents % 100 ? 2 : 0,
      maximumFractionDigits: 2,
    }).format(cents / 100);
  }

  function validParam(name, map, fallback) {
    const value = params.get(name);
    return value !== null && own(map, value) ? value : fallback;
  }

  function announce(message) {
    const notice = $("#notice");
    if (!notice) return;
    notice.textContent = message;
    notice.hidden = false;
    clearTimeout(announce.timer);
    announce.timer = setTimeout(() => (notice.hidden = true), 3200);
  }

  /* ---------- Storage: localStorage, or memory when it is blocked ---------- */

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
        memory.set(key, String(value));
        if (available) {
          try {
            window.localStorage.setItem(key, String(value));
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
    const value = safeStorage.getItem(key);
    if (value === null) return null;
    try {
      return JSON.parse(value);
    } catch {
      safeStorage.removeItem(key);
      return null;
    }
  }
  const writeJSON = (key, value) => safeStorage.setItem(key, JSON.stringify(value));

  /* ---------- Dates in America/Los_Angeles ---------- */

  const partsFormat = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
  function zoned(date) {
    const parts = Object.fromEntries(partsFormat.formatToParts(date).map((part) => [part.type, part.value]));
    return {
      key: `${parts.year}-${parts.month}-${parts.day}`,
      minutes: Number(parts.hour) * 60 + Number(parts.minute),
    };
  }
  // The UTC instant of a wall-clock time in Reno ("2026-10-27", "10:30").
  function renoInstant(key, time) {
    const [y, m, d] = key.split("-").map(Number);
    const [hh, mm] = time.split(":").map(Number);
    const guess = Date.UTC(y, m - 1, d, hh, mm);
    const seen = zoned(new Date(guess));
    const seenUtc = Date.UTC(...seen.key.split("-").map((v, i) => Number(v) - (i === 1 ? 1 : 0)), 0, seen.minutes);
    return new Date(guess - (seenUtc - guess));
  }
  // ?now=YYYY-MM-DDTHH:MM previews the site at another Reno time (handy for screenshots and reviews).
  const NOW = (() => {
    const value = params.get("now");
    const match = value && /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})$/.exec(value);
    if (match) {
      const instant = renoInstant(match[1], match[2]);
      if (!isNaN(instant)) return instant;
    }
    return new Date();
  })();
  const TODAY = zoned(NOW).key;

  const noon = (key) => new Date(key + "T12:00:00Z");
  const keyOf = (date) => date.toISOString().slice(0, 10);
  const addDays = (key, days) => keyOf(new Date(noon(key).getTime() + days * 86400000));
  const weekday = (key) => noon(key).getUTCDay();
  const longDate = new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const shortDate = new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const dayName = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", weekday: "long" });
  const formatLong = (key) => longDate.format(noon(key));
  const formatShort = (key) => shortDate.format(noon(key));

  // "13:30" -> "1:30 p.m."
  function clock(time) {
    const [h, m] = time.split(":").map(Number);
    return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "a.m." : "p.m."}`;
  }

  /*
   * Days the Reno office and support desk close, by rule, for any year: the federal holidays Latchline
   * observes plus Nevada Day (last Friday in October) and Family Day (the day after Thanksgiving).
   * A Saturday holiday is observed on the Friday before, a Sunday holiday on the Monday after.
   */
  const holidayCache = new Map();
  function holidaysFor(year) {
    if (holidayCache.has(year)) return holidayCache.get(year);
    const key = (m, d) => `${year}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const nth = (m, dow, n) => {
      const first = key(m, 1);
      return addDays(first, ((dow - weekday(first) + 7) % 7) + (n - 1) * 7);
    };
    // The last given weekday of a month (months used here are May and October, never December).
    const last = (m, dow) => {
      const end = addDays(key(m + 1, 1), -1);
      return addDays(end, -((weekday(end) - dow + 7) % 7));
    };
    const observed = (k) => (weekday(k) === 6 ? addDays(k, -1) : weekday(k) === 0 ? addDays(k, 1) : k);
    const thanksgiving = nth(11, 4, 4);
    const list = [
      [observed(key(1, 1)), "New Year's Day"],
      [nth(1, 1, 3), "Martin Luther King Jr. Day"],
      [nth(2, 1, 3), "Presidents' Day"],
      [last(5, 1), "Memorial Day"],
      [observed(key(6, 19)), "Juneteenth"],
      [observed(key(7, 4)), "Independence Day"],
      [nth(9, 1, 1), "Labor Day"],
      [last(10, 5), "Nevada Day"],
      [thanksgiving, "Thanksgiving"],
      [addDays(thanksgiving, 1), "Family Day"],
      [observed(key(12, 25)), "Christmas Day"],
    ];
    // New Year's Day on a Saturday is observed on December 31 of the year before.
    const nextNewYear = `${year + 1}-01-01`;
    if (weekday(nextNewYear) === 6) list.push([addDays(nextNewYear, -1), "New Year's Day (observed)"]);
    const map = new Map(list.filter(([k]) => k.startsWith(String(year))));
    holidayCache.set(year, map);
    return map;
  }
  const holidayName = (key) =>
    holidaysFor(Number(key.slice(0, 4))).get(key) || (CLOSED_DATES.includes(key) ? "Office closed" : "");
  const isWorkday = (key) => own(HOURS, String(weekday(key))) && !holidayName(key);
  function nextWorkday(key, inclusive = false) {
    let day = inclusive ? key : addDays(key, 1);
    for (let i = 0; i < 30 && !isWorkday(day); i++) day = addDays(day, 1);
    return day;
  }
  function upcomingClosures(count) {
    const found = [];
    for (let i = 0; i < 400 && found.length < count; i++) {
      const key = addDays(TODAY, i);
      const name = holidayName(key);
      if (name && weekday(key) !== 0 && weekday(key) !== 6) found.push({ key, name });
    }
    return found;
  }

  /* ---------- Menu, reveals and footer year ---------- */

  function initMenu() {
    const toggle = $("#menu-toggle"),
      menu = $("#mobile-menu");
    if (!toggle || !menu) return;
    function close(returnFocus = false) {
      menu.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
      if (returnFocus) toggle.focus();
    }
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") !== "true";
      menu.hidden = !open;
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      if (open) $("a", menu).focus();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !menu.hidden) close(true);
    });
    matchMedia("(min-width: 1024px)").addEventListener("change", (event) => {
      if (event.matches) close();
    });
  }

  function initReveals() {
    const items = $$(".reveal");
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      items.forEach((element) => element.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (!entry.isIntersecting && entry.boundingClientRect.top >= innerHeight) return;
          // Reveal everything above this element too, so jumps (End key, anchors) never leave gaps.
          items.forEach((element) => {
            if (element.getBoundingClientRect().top <= entry.boundingClientRect.bottom) {
              element.classList.add("is-visible");
              observer.unobserve(element);
            }
          });
        }),
      { rootMargin: "0px 0px 60px 0px" },
    );
    items.forEach((element) => observer.observe(element));
  }

  function initYear() {
    $$("[data-year]").forEach((element) => (element.textContent = TODAY.slice(0, 4)));
  }

  /* ---------- Playbooks and the shortlist ---------- */

  function readShortlist() {
    const raw = readJSON(STORAGE_KEYS.shortlist);
    const clean = Array.isArray(raw)
      ? [...new Set(raw.filter((id) => own(PLAYBOOK_MAP, id)))].slice(0, PLAYBOOKS.length)
      : [];
    if (raw !== null && JSON.stringify(raw) !== JSON.stringify(clean)) writeJSON(STORAGE_KEYS.shortlist, clean);
    return clean;
  }
  let shortlist = readShortlist();

  function saveButton(playbook) {
    const saved = shortlist.includes(playbook.id);
    return `<button type="button" class="inline-flex min-h-10 items-center gap-2 rounded-lg border px-3 text-sm font-semibold ${saved ? "border-cobalt bg-cobalt-soft text-cobalt-deep" : "border-line-strong bg-card hover:bg-mist"}" data-save="${playbook.id}" aria-pressed="${saved}" aria-label="${saved ? "Remove" : "Save"} ${esc(playbook.title)} ${saved ? "from" : "to"} your shortlist">
      <svg viewBox="0 0 20 20" class="size-4" fill="${saved ? "currentColor" : "none"}" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M5 3h10v14l-5-3.5L5 17z" stroke-linejoin="round"/></svg>${saved ? "Shortlisted" : "Shortlist"}</button>`;
  }

  function playbookCard(playbook, heading = "h3") {
    return `<article class="panel reveal flex min-w-0 flex-col overflow-hidden" data-playbook="${playbook.id}">
      <img src="assets/img/${playbook.art}" alt="" width="480" height="270" class="aspect-video w-full border-b border-line bg-mist object-cover" />
      <div class="flex flex-1 flex-col p-5">
        <p class="tick flex flex-wrap gap-x-3 text-ink-faint"><span>${SEGMENTS[playbook.segment]}</span><span aria-hidden="true">/</span><span>${MOTIONS[playbook.motion]}</span></p>
        <${heading} class="mt-2 text-xl font-semibold leading-snug">${esc(playbook.title)}</${heading}>
        <p class="mt-2 text-sm leading-relaxed text-ink-soft">${esc(playbook.summary)}</p>
        <dl class="mt-4 grid grid-cols-3 gap-2 border-y border-line py-3 text-center">
          <div><dt class="tick text-ink-faint">Target</dt><dd class="font-display text-lg font-semibold">${playbook.days} days</dd></div>
          <div><dt class="tick text-ink-faint">Tasks</dt><dd class="font-display text-lg font-semibold">${playbook.tasks}</dd></div>
          <div><dt class="tick text-ink-faint">Roles</dt><dd class="font-display text-lg font-semibold">${playbook.roles.length}</dd></div>
        </dl>
        <p class="mt-3 text-sm"><span class="font-semibold">First value:</span> ${esc(playbook.firstValue)}</p>
        <div class="mt-auto flex flex-wrap items-center justify-between gap-3 pt-5">
          <a class="text-link text-sm" href="product.html?playbook=${playbook.id}#plan">Preview the plan<span class="sr-only">: ${esc(playbook.title)}</span></a>
          ${saveButton(playbook)}
        </div>
      </div>
    </article>`;
  }

  function setShortlist(next) {
    shortlist = next;
    writeJSON(STORAGE_KEYS.shortlist, shortlist);
    // Swap every save button for this playbook, keeping focus on the one that was pressed.
    $$("[data-save]").forEach((button) => {
      const playbook = PLAYBOOK_MAP[button.dataset.save];
      const hadFocus = document.activeElement === button;
      const holder = document.createElement("div");
      holder.innerHTML = saveButton(playbook);
      const fresh = holder.firstElementChild;
      button.replaceWith(fresh);
      if (hadFocus) fresh.focus();
    });
    renderShortlist();
  }

  function toggleSaved(id) {
    if (!own(PLAYBOOK_MAP, id)) return;
    const saved = shortlist.includes(id);
    setShortlist(saved ? shortlist.filter((item) => item !== id) : [...shortlist, id]);
    announce(`${PLAYBOOK_MAP[id].title} ${saved ? "removed from" : "added to"} your shortlist.`);
  }

  function renderShortlist() {
    const count = $("[data-shortlist-count]");
    if (!count) return;
    count.textContent = String(shortlist.length);
    $("[data-shortlist-label]").textContent = shortlist.length === 1 ? "playbook shortlisted" : "playbooks shortlisted";
    const list = $("[data-shortlist-list]");
    list.innerHTML = shortlist
      .map((id) => {
        const item = PLAYBOOK_MAP[id];
        return `<li class="flex items-center justify-between gap-3 border-t border-white/15 py-2.5 first:border-t-0">
          <span class="min-w-0 text-sm"><span class="block font-semibold">${esc(item.title)}</span><span class="text-haze">${item.days} days · ${MOTIONS[item.motion]}</span></span>
          <button type="button" class="grid size-9 shrink-0 place-items-center rounded-lg border border-white/25 hover:bg-white/10" data-remove="${id}" aria-label="Remove ${esc(item.title)} from your shortlist">
            <svg viewBox="0 0 20 20" class="size-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="m5 5 10 10M15 5 5 15"/></svg>
          </button></li>`;
      })
      .join("");
    $("[data-shortlist-empty]").hidden = shortlist.length > 0;
    $("[data-shortlist-actions]").hidden = shortlist.length === 0;
    const total = shortlist.reduce((sum, id) => sum + PLAYBOOK_MAP[id].tasks, 0);
    $("[data-shortlist-total]").textContent = shortlist.length
      ? `${plural(total, "task")} across ${plural(shortlist.length, "playbook")}`
      : "";
  }

  function initSaveButtons() {
    document.addEventListener("click", (event) => {
      const save = event.target.closest("[data-save]");
      if (save) toggleSaved(save.dataset.save);
      const remove = event.target.closest("[data-remove]");
      if (remove) {
        const index = shortlist.indexOf(remove.dataset.remove);
        toggleSaved(remove.dataset.remove);
        // Keep focus in the list: the next item's remove button, or the clear-all fallback.
        const buttons = $$("[data-remove]");
        (buttons[Math.min(index, buttons.length - 1)] || $("[data-shortlist-heading]"))?.focus();
      }
    });
    const clear = $("[data-shortlist-clear]");
    if (clear)
      clear.addEventListener("click", () => {
        setShortlist([]);
        announce("Shortlist cleared.");
        $("[data-shortlist-heading]").focus();
      });
    renderShortlist();
  }

  const LENGTHS = { any: Infinity, 14: 14, 30: 30, 60: 60 };
  const SORTS = {
    recommended: () => 0,
    fastest: (a, b) => a.days - b.days || a.title.localeCompare(b.title),
    lightest: (a, b) => a.tasks - b.tasks || a.title.localeCompare(b.title),
    az: (a, b) => a.title.localeCompare(b.title),
  };

  function initPlaybooks() {
    const form = $("[data-playbook-filters]");
    if (!form) return;
    const grid = $("[data-playbook-grid]");
    const segments = $("[data-segment-chips]");
    segments.innerHTML = [["all", "All"], ...Object.entries(SEGMENTS)]
      .map(
        ([key, label]) =>
          `<label class="chip"><input class="sr-only" type="radio" name="segment" value="${key}" />${label} <span class="tick text-ink-faint" data-segment-count="${key}"></span></label>`,
      )
      .join("");
    form.elements.motion.innerHTML =
      `<option value="all">Any motion</option>` +
      Object.entries(MOTIONS)
        .map(([key, label]) => `<option value="${key}">${label}</option>`)
        .join("");

    form.elements.segment.value = params.get("segment") === "all" ? "all" : validParam("segment", SEGMENTS, "all");
    form.elements.motion.value = validParam("motion", MOTIONS, "all");
    form.elements.duration.value = validParam("duration", LENGTHS, "any");
    form.elements.sort.value = validParam("sort", SORTS, "recommended");
    form.elements.q.value = (params.get("q") || "").slice(0, 60);

    const matches = (item, values, ignoreSegment = false) => {
      const words = values.q.toLowerCase().split(/\s+/).filter(Boolean);
      const haystack = [item.title, item.summary, item.firstValue, ...item.roles, ...item.milestones]
        .join(" ")
        .toLowerCase();
      return (
        (ignoreSegment || values.segment === "all" || item.segment === values.segment) &&
        (values.motion === "all" || item.motion === values.motion) &&
        item.days <= LENGTHS[values.duration] &&
        words.every((word) => haystack.includes(word))
      );
    };

    function render() {
      const values = {
        segment: form.elements.segment.value,
        motion: form.elements.motion.value,
        duration: form.elements.duration.value,
        sort: form.elements.sort.value,
        q: form.elements.q.value.trim(),
      };
      const found = PLAYBOOKS.filter((item) => matches(item, values)).sort(SORTS[values.sort]);
      grid.innerHTML = found.map((item) => playbookCard(item)).join("");
      $$(".reveal", grid).forEach((element) => element.classList.add("is-visible"));
      // Live counts on each segment chip reflect the other filters.
      [["all"], ...Object.keys(SEGMENTS).map((key) => [key])].forEach(([key]) => {
        const n = PLAYBOOKS.filter(
          (item) => matches(item, values, true) && (key === "all" || item.segment === key),
        ).length;
        $(`[data-segment-count="${key}"]`).textContent = String(n);
      });
      $("[data-playbook-count]").textContent =
        `${plural(found.length, "playbook")}${found.length === PLAYBOOKS.length ? "" : ` of ${PLAYBOOKS.length}`}`;
      $("[data-playbook-empty]").hidden = found.length > 0;
      const query = new URLSearchParams();
      if (values.segment !== "all") query.set("segment", values.segment);
      if (values.motion !== "all") query.set("motion", values.motion);
      if (values.duration !== "any") query.set("duration", values.duration);
      if (values.sort !== "recommended") query.set("sort", values.sort);
      if (values.q) query.set("q", values.q);
      history.replaceState(null, "", query.toString() ? `?${query}` : location.pathname);
    }
    form.addEventListener("submit", (event) => event.preventDefault());
    form.addEventListener("input", render);
    form.addEventListener("change", render);
    $("[data-playbook-reset]").addEventListener("click", () => {
      form.reset();
      form.elements.segment.value = "all";
      render();
      form.elements.q.focus();
    });
    render();
  }

  function initFeatured() {
    const holder = $("[data-featured-playbooks]");
    if (!holder) return;
    holder.innerHTML = ["saas-kickoff", "payroll-switch", "multi-site"]
      .map((id) => playbookCard(PLAYBOOK_MAP[id]))
      .join("");
  }

  /* ---------- Product: stage explorer and plan preview ---------- */

  const STATUS = {
    done: { label: "Done", chip: "border-moss/30 bg-moss-soft text-moss", dot: "bg-moss" },
    doing: { label: "In progress", chip: "border-cobalt/30 bg-cobalt-soft text-cobalt-deep", dot: "bg-cobalt" },
    blocked: { label: "Blocked", chip: "border-flare/30 bg-flare-soft text-flare", dot: "bg-flare" },
    next: { label: "Up next", chip: "border-line-strong bg-card text-ink-soft", dot: "bg-line-strong" },
  };

  function initStages() {
    const list = $("[data-stage-tabs]");
    if (!list) return;
    const panel = $("[data-stage-panel]");
    let view = "customer";
    list.innerHTML = STAGES.map(
      (stage, index) =>
        `<button type="button" role="tab" id="tab-${stage.id}" aria-controls="stage-panel" data-stage="${stage.id}" class="group flex min-w-44 shrink-0 flex-col items-start gap-1 rounded-xl border border-line bg-card px-4 py-3 text-left aria-selected:border-cobalt aria-selected:bg-cobalt aria-selected:text-white lg:min-w-0 lg:flex-1">
          <span class="tick text-ink-faint group-aria-selected:text-white/80">Stage ${index + 1} · ${stage.days}</span>
          <span class="font-semibold">${esc(stage.name)}</span></button>`,
    ).join("");
    const tabs = $$("[role=tab]", list);

    function select(id, focus = false, updateHash = true) {
      const stage = STAGE_MAP[id];
      const index = STAGES.indexOf(stage);
      tabs.forEach((tab) => {
        const on = tab.dataset.stage === id;
        tab.setAttribute("aria-selected", String(on));
        tab.tabIndex = on ? 0 : -1;
        if (on && focus) tab.focus();
      });
      panel.setAttribute("aria-labelledby", `tab-${id}`);
      const lane = (name) =>
        stage.tasks
          .filter((task) => task.lane === name)
          .map(
            (task) =>
              `<li class="flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm ${STATUS[task.status].chip}"><span class="font-medium">${esc(task.label)}</span><span class="tick whitespace-nowrap">${STATUS[task.status].label}</span></li>`,
          )
          .join("");
      $("[data-stage-number]").textContent = `Stage ${index + 1} of ${STAGES.length} · ${stage.days}`;
      $("[data-stage-name]").textContent = stage.name;
      $("[data-stage-summary]").textContent = stage.summary;
      $("[data-stage-view]").textContent = view === "customer" ? stage.customer : stage.team;
      $("[data-stage-view-label]").textContent = view === "customer" ? "What the customer sees" : "What your team sees";
      $("[data-stage-automations]").innerHTML = stage.automations
        .map(
          (item) =>
            `<li class="flex gap-2.5"><svg viewBox="0 0 20 20" class="mt-0.5 size-4 shrink-0 text-cobalt" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M11 2 4 11h5l-1 7 7-9h-5z" stroke-linejoin="round"/></svg>${esc(item)}</li>`,
        )
        .join("");
      $("[data-stage-signal]").textContent = stage.signal;
      $("[data-lane-customer]").innerHTML = lane("customer");
      $("[data-lane-team]").innerHTML = lane("team");
      $("[data-stage-progress]").style.width = `${((index + 1) / STAGES.length) * 100}%`;
      if (updateHash) history.replaceState(null, "", `${location.search}#stage-${id}`);
    }
    const current = () => tabs.find((tab) => tab.getAttribute("aria-selected") === "true").dataset.stage;

    list.addEventListener("click", (event) => {
      const tab = event.target.closest("[role=tab]");
      if (tab) select(tab.dataset.stage);
    });
    list.addEventListener("keydown", (event) => {
      const index = tabs.findIndex((tab) => tab.dataset.stage === current());
      const moves = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
      let next = null;
      if (own(moves, event.key)) next = (index + moves[event.key] + tabs.length) % tabs.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = tabs.length - 1;
      if (next === null) return;
      event.preventDefault();
      select(tabs[next].dataset.stage, true);
    });
    $$("[data-view]").forEach((button) =>
      button.addEventListener("click", () => {
        view = button.dataset.view;
        $$("[data-view]").forEach((other) => other.setAttribute("aria-pressed", String(other === button)));
        select(current());
      }),
    );
    $("[data-stage-step]")?.addEventListener("click", () => {
      const index = STAGES.findIndex((stage) => stage.id === current());
      select(STAGES[(index + 1) % STAGES.length].id);
    });
    const fromHash = location.hash.replace(/^#stage-/, "");
    select(own(STAGE_MAP, fromHash) ? fromHash : STAGES[0].id, false, false);
  }

  // The default kickoff: the first working Monday at least three days from today (or the next business day).
  function defaultKickoff() {
    let day = addDays(TODAY, 3);
    while (weekday(day) !== 1) day = addDays(day, 1);
    return nextWorkday(day, true);
  }

  /*
   * Spread a playbook's milestones across its target days from kickoff. A milestone that lands on a
   * weekend or office closure moves to the next business day. Returns [{ name, day, key }].
   */
  function planDates(playbook, kickoff) {
    const steps = playbook.milestones.length - 1;
    return playbook.milestones.map((name, index) => {
      const day = Math.round((playbook.days * index) / steps);
      return { name, day, key: nextWorkday(addDays(kickoff, day), true) };
    });
  }

  function initPlanPreview() {
    const form = $("[data-plan-form]");
    if (!form) return;
    form.elements.playbook.innerHTML = PLAYBOOKS.map(
      (item) => `<option value="${item.id}">${esc(item.title)} (${item.days} days)</option>`,
    ).join("");
    form.elements.playbook.value = validParam("playbook", PLAYBOOK_MAP, "saas-kickoff");
    form.elements.kickoff.min = TODAY;
    form.elements.kickoff.value = defaultKickoff();
    function render() {
      const playbook = PLAYBOOK_MAP[form.elements.playbook.value];
      let kickoff = form.elements.kickoff.value;
      const valid = /^\d{4}-\d{2}-\d{2}$/.test(kickoff) && !isNaN(noon(kickoff));
      $("[data-kickoff-error]").textContent = valid ? "" : "Choose a kickoff date.";
      if (!valid) return;
      const moved = !isWorkday(kickoff);
      kickoff = nextWorkday(kickoff, true);
      const dates = planDates(playbook, kickoff);
      const lastKey = dates[dates.length - 1].key;
      let working = 0;
      for (let key = kickoff; key < lastKey; key = addDays(key, 1)) if (isWorkday(key)) working++;
      $("[data-plan-note]").textContent = moved
        ? `That date is a weekend or office closure, so the plan starts on ${formatLong(kickoff)}.`
        : "";
      $("[data-plan-list]").innerHTML = dates
        .map(
          (step, index) =>
            `<li class="relative grid grid-cols-[auto_1fr] gap-x-4 pb-6 last:pb-0">
              <span class="relative z-10 grid size-9 place-items-center rounded-full border-2 ${index === dates.length - 1 ? "border-cobalt bg-cobalt text-white" : "border-line-strong bg-card"} font-mono text-xs">${index + 1}</span>
              <div class="min-w-0 pt-1">
                <p class="font-semibold">${esc(step.name)}</p>
                <p class="text-sm text-ink-faint"><time datetime="${step.key}">${formatShort(step.key)}</time> · day ${step.day}${holidayName(addDays(kickoff, step.day)) ? ` (moved for ${esc(holidayName(addDays(kickoff, step.day)))})` : ""}</p>
              </div>
            </li>`,
        )
        .join("");
      $("[data-plan-summary]").textContent = `First value by ${formatLong(lastKey)}`;
      $("[data-plan-detail]").textContent =
        `${plural(working, "business day")} from kickoff · ${plural(playbook.tasks, "task")} · ${playbook.roles.join(", ")}`;
      $("[data-plan-link]").href = `playbooks.html?q=${encodeURIComponent(playbook.title)}`;
    }
    form.addEventListener("submit", (event) => event.preventDefault());
    form.addEventListener("input", render);
    render();
  }

  /* ---------- Customers ---------- */

  function change(metric) {
    if (metric.unit === "%") {
      const points = metric.after - metric.before;
      return `${points > 0 ? "+" : "−"}${Math.abs(points)} pts`;
    }
    const pct = Math.round(((metric.after - metric.before) / metric.before) * 100);
    return `${pct > 0 ? "+" : "−"}${Math.abs(pct)}%`;
  }
  const withUnit = (value, unit) => (unit === "%" ? `${value}%` : unit ? `${value} ${unit}` : String(value));

  function storyMark(story, size = "size-9") {
    const shapes = {
      circle:
        '<circle cx="16" cy="16" r="10" fill="none" stroke="currentColor" stroke-width="4"/><circle cx="16" cy="16" r="3" fill="currentColor"/>',
      stack:
        '<rect x="5" y="6" width="22" height="5" rx="2" fill="currentColor"/><rect x="5" y="13.5" width="16" height="5" rx="2" fill="currentColor" opacity=".7"/><rect x="5" y="21" width="10" height="5" rx="2" fill="currentColor" opacity=".45"/>',
      leaf: '<path d="M6 26C6 13 13 6 26 6c0 13-7 20-20 20z" fill="currentColor"/><path d="M8 24 20 12" stroke="#fff" stroke-width="2"/>',
      diamond: '<path d="m16 3 13 13-13 13L3 16z" fill="currentColor"/><path d="m16 10 6 6-6 6-6-6z" fill="#fff"/>',
      chevron:
        '<path d="m4 8 8 8-8 8M14 8l8 8-8 8M24 8l4 8-4 8" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linejoin="round"/>',
      square:
        '<rect x="5" y="5" width="22" height="22" rx="3" fill="none" stroke="currentColor" stroke-width="4"/><path d="M11 21V11h10" fill="none" stroke="currentColor" stroke-width="3"/>',
    };
    return `<svg viewBox="0 0 32 32" class="${size} shrink-0" aria-hidden="true">${shapes[story.mark]}</svg>`;
  }

  function metricChart(story) {
    const rowH = 84;
    const rows = story.metrics
      .map((metric, index) => {
        const max = Math.max(metric.before, metric.after);
        const w = (value) => Math.max(6, Math.round((value / max) * 300));
        const y = index * rowH;
        return `<g transform="translate(0 ${y})">
          <text x="0" y="12" font-size="13" font-weight="600" fill="#0c1427">${esc(metric.label)}</text>
          <rect x="0" y="24" width="${w(metric.before)}" height="16" rx="3" fill="#98a2b5"/>
          <text x="${w(metric.before) + 8}" y="37" font-size="12" fill="#3b4660">Before: ${withUnit(metric.before, metric.unit)}</text>
          <rect x="0" y="46" width="${w(metric.after)}" height="16" rx="3" fill="#1f45d6"/>
          <text x="${w(metric.after) + 8}" y="59" font-size="12" font-weight="600" fill="#15329f">After: ${withUnit(metric.after, metric.unit)}</text>
        </g>`;
      })
      .join("");
    const summary = story.metrics
      .map((m) => `${m.label}: ${withUnit(m.before, m.unit)} before, ${withUnit(m.after, m.unit)} after`)
      .join(". ");
    return `<svg viewBox="0 0 460 ${story.metrics.length * rowH}" class="w-full" role="img" aria-label="${esc(summary)}" font-family="Funnel Sans, sans-serif">${rows}</svg>`;
  }

  function initCustomers() {
    const grid = $("[data-story-grid]");
    if (!grid) return;
    const chips = $("[data-industry-chips]");
    chips.innerHTML = [["all", "All industries"], ...Object.entries(INDUSTRIES)]
      .map(
        ([key, label]) =>
          `<label class="chip"><input class="sr-only" type="radio" name="industry" value="${key}" />${label}</label>`,
      )
      .join("");
    const form = $("[data-story-filters]");
    form.elements.industry.value = "all";
    const detail = $("[data-story-detail]");

    function showStory(id, focus = false) {
      const story = STORY_MAP[id];
      const playbook = PLAYBOOK_MAP[story.playbook];
      detail.innerHTML = `
        <div class="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
          <div class="min-w-0">
            <p class="tick flex items-center gap-2 text-cobalt">${storyMark(story, "size-6")} ${esc(story.company)} · ${INDUSTRIES[story.industry]} · ${esc(story.size)}</p>
            <h2 class="mt-4 text-3xl font-semibold leading-tight sm:text-4xl" tabindex="-1" data-story-title>${esc(story.headline)}</h2>
            ${story.body.map((p) => `<p class="mt-4 leading-relaxed text-ink-soft">${esc(p)}</p>`).join("")}
            <blockquote class="mt-8 border-l-4 border-sun pl-5">
              <p class="font-display text-xl leading-snug">“${esc(story.quote)}”</p>
              <footer class="mt-3 text-sm text-ink-faint">${esc(story.person)}, ${esc(story.role)}, ${esc(story.company)}</footer>
            </blockquote>
            <p class="mt-8 text-sm">Playbook used: <a class="text-link" href="product.html?playbook=${playbook.id}#plan">${esc(playbook.title)}</a></p>
          </div>
          <div class="panel dotgrid min-w-0 p-6">
            <h3 class="tick text-ink-faint">Before and after Latchline</h3>
            <div class="mt-5">${metricChart(story)}</div>
            <ul class="mt-5 grid gap-3 sm:grid-cols-3">${story.metrics
              .map(
                (m) =>
                  `<li class="rounded-xl border border-line bg-card p-3"><span class="block font-display text-2xl font-semibold text-cobalt">${change(m)}</span><span class="text-xs text-ink-soft">${esc(m.label)}</span></li>`,
              )
              .join("")}</ul>
          </div>
        </div>`;
      $$("[data-story-open]", grid).forEach((button) =>
        button.setAttribute("aria-pressed", String(button.dataset.storyOpen === id)),
      );
      const query = new URLSearchParams(location.search);
      query.set("story", id);
      history.replaceState(null, "", `?${query}`);
      if (focus) {
        detail.scrollIntoView({ block: "start" });
        $("[data-story-title]", detail).focus({ preventScroll: true });
      }
    }

    function render() {
      const industry = form.elements.industry.value;
      const found = STORIES.filter((story) => industry === "all" || story.industry === industry);
      grid.innerHTML = found
        .map((story) => {
          const lead = story.metrics[0];
          return `<article class="panel flex min-w-0 flex-col p-6">
            <p class="flex items-center gap-2.5 font-display text-lg font-semibold">${storyMark(story)}${esc(story.company)}</p>
            <p class="tick mt-1 text-ink-faint">${INDUSTRIES[story.industry]} · ${esc(story.size)}</p>
            <p class="mt-5 font-display text-5xl font-semibold tracking-tight text-cobalt">${change(lead)}</p>
            <p class="text-sm text-ink-soft">${esc(lead.label.toLowerCase())}: ${withUnit(lead.before, lead.unit)} to ${withUnit(lead.after, lead.unit)}</p>
            <h3 class="mt-5 text-lg font-semibold leading-snug">${esc(story.headline)}</h3>
            <div class="mt-auto pt-6"><button type="button" class="btn btn-quiet btn-sm aria-pressed:bg-ink aria-pressed:text-white" data-story-open="${story.id}" aria-pressed="false">Read the story<span class="sr-only">: ${esc(story.company)}</span></button></div>
          </article>`;
        })
        .join("");
      $("[data-story-count]").textContent = plural(found.length, "story", "stories");
      const current = new URLSearchParams(location.search).get("story");
      const keep = found.find((story) => story.id === current) || found[0];
      showStory(keep.id);
    }
    grid.addEventListener("click", (event) => {
      const open = event.target.closest("[data-story-open]");
      if (open) showStory(open.dataset.storyOpen, true);
    });
    form.addEventListener("change", render);
    render();
  }

  /* ---------- Pricing calculator ---------- */

  const BILLING = { monthly: "Monthly", annual: "Annual" };
  const PLAN_CHOICES = { auto: true, ...PLANS };

  function cleanQuote(raw) {
    const quote = { active: 30, billing: "annual", plan: "auto", addons: [] };
    if (!raw || typeof raw !== "object") return quote;
    const active = Number(raw.active);
    if (Number.isInteger(active) && active >= 1 && active <= 1000) quote.active = active;
    if (own(BILLING, raw.billing)) quote.billing = raw.billing;
    if (own(PLAN_CHOICES, raw.plan)) quote.plan = raw.plan;
    if (Array.isArray(raw.addons)) quote.addons = [...new Set(raw.addons.filter((id) => own(ADDONS, id)))];
    return quote;
  }
  function quoteFromParams() {
    if (!params.has("active")) return null;
    return cleanQuote({
      active: params.get("active"),
      billing: params.get("billing"),
      plan: params.get("plan"),
      addons: (params.get("addons") || "").split(",").filter(Boolean),
    });
  }

  // Monthly recurring cost of one plan before any annual discount.
  function planMonthly(planId, active, addons) {
    const plan = PLANS[planId];
    const extra = Math.max(0, active - plan.included);
    const addonCost = addons
      .filter((id) => ADDONS[id].recurring && !plan.bundled.includes(id))
      .reduce((sum, id) => sum + ADDONS[id].price, 0);
    return plan.fee + extra * plan.extra + addonCost;
  }
  function recommendedPlan(active, addons) {
    const eligible = Object.keys(PLANS).filter((id) => active <= PLANS[id].max);
    return eligible.reduce(
      (best, id) => (planMonthly(id, active, addons) < planMonthly(best, active, addons) ? id : best),
      eligible[0],
    );
  }

  /*
   * The quote breakdown: line items, the monthly figure, what is billed per period and the one-time total.
   * Example: 60 active, Growth, annual, SSO + CRM sync = $790 + 10 × $11 + $150 + $120 = $1,170 a month,
   * minus 15% = $994.50 a month, billed $11,934 a year.
   */
  function priceQuote(quote) {
    const planId =
      quote.plan !== "auto" && quote.active <= PLANS[quote.plan].max
        ? quote.plan
        : recommendedPlan(quote.active, quote.addons);
    const plan = PLANS[planId];
    const extra = Math.max(0, quote.active - plan.included);
    const lines = [
      { label: `${plan.name} platform fee, ${plan.included} active onboardings included`, amount: plan.fee },
    ];
    if (extra)
      lines.push({ label: `${plural(extra, "extra onboarding")} × ${money(plan.extra)}`, amount: extra * plan.extra });
    quote.addons
      .filter((id) => ADDONS[id].recurring)
      .forEach((id) =>
        lines.push({
          label: ADDONS[id].name,
          amount: plan.bundled.includes(id) ? 0 : ADDONS[id].price,
          included: plan.bundled.includes(id),
        }),
      );
    const monthly = lines.reduce((sum, line) => sum + line.amount, 0);
    const annual = quote.billing === "annual";
    const perMonth = annual ? Math.round(monthly * (1 - ANNUAL_DISCOUNT) * 100) / 100 : monthly;
    const oneTime = quote.addons.filter((id) => !ADDONS[id].recurring).reduce((sum, id) => sum + ADDONS[id].price, 0);
    const billed = annual ? Math.round(perMonth * 12 * 100) / 100 : perMonth;
    return {
      planId,
      plan,
      lines,
      monthly,
      perMonth,
      discount: monthly - perMonth,
      billed,
      oneTime,
      firstInvoice: billed + oneTime,
      annual,
    };
  }
  function quoteSentence(quote) {
    const priced = priceQuote(quote);
    const extras = quote.addons.map((id) => ADDONS[id].name);
    return `${priced.plan.name} plan, ${plural(quote.active, "active onboarding")}, ${quote.billing} billing${extras.length ? `, with ${extras.join(", ")}` : ""}: ${money(priced.perMonth)} a month${priced.annual ? `, billed ${money(priced.billed)} a year` : ""}${priced.oneTime ? `, plus ${money(priced.oneTime)} one-time` : ""}.`;
  }

  function initPricing() {
    const form = $("[data-quote-form]");
    if (!form) return;
    const cards = $("[data-plan-cards]");
    cards.innerHTML = Object.entries(PLANS)
      .map(
        ([
          id,
          plan,
        ]) => `<label class="panel relative flex min-w-0 flex-col p-5 has-checked:border-cobalt has-checked:shadow-[0_0_0_2px_var(--color-cobalt)] has-disabled:cursor-not-allowed has-disabled:opacity-55">
          <span class="flex items-center justify-between gap-3">
            <span class="font-display text-xl font-semibold">${plan.name}</span>
            <input type="radio" name="plan" value="${id}" class="size-5 accent-cobalt" />
          </span>
          <span class="mt-1 text-sm text-ink-soft">${plan.blurb}</span>
          <span class="mt-4 font-display text-3xl font-semibold">${money(plan.fee)}<span class="text-base font-normal text-ink-faint"> / month</span></span>
          <span class="text-sm text-ink-faint">${plan.included} active included, then ${money(plan.extra)} each, up to ${plan.max.toLocaleString("en-US")}</span>
          <span class="mt-4 grid gap-1.5 text-sm">${plan.points.map((point) => `<span class="flex gap-2"><svg viewBox="0 0 20 20" class="mt-0.5 size-4 shrink-0 text-moss" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m4 10 4 4 8-8"/></svg>${point}</span>`).join("")}</span>
          <span class="tick mt-4 hidden w-fit rounded-full bg-sun px-2.5 py-1 text-ink" data-recommended="${id}">Lowest price</span>
          <span class="mt-3 hidden text-sm text-flare" data-too-small="${id}">Up to ${plan.max} active onboardings</span>
        </label>`,
      )
      .join("");
    $("[data-addon-list]").innerHTML = Object.entries(ADDONS)
      .map(
        ([
          id,
          addon,
        ]) => `<label class="flex items-start gap-3 rounded-xl border border-line bg-card p-3.5 has-checked:border-cobalt has-checked:bg-cobalt-soft/60">
          <input type="checkbox" name="addons" value="${id}" class="mt-1 size-4 accent-cobalt" />
          <span class="min-w-0 flex-1"><span class="flex flex-wrap justify-between gap-x-3 font-semibold"><span>${addon.name}</span><span data-addon-price="${id}">${money(addon.price)}${addon.recurring ? " / mo" : " once"}</span></span>
          <span class="block text-sm text-ink-soft">${addon.note}</span></span>
        </label>`,
      )
      .join("");

    let quote = quoteFromParams() || cleanQuote(readJSON(STORAGE_KEYS.quote));
    const range = form.elements.active,
      number = form.elements.activeNumber;

    function fill() {
      range.value = String(Math.min(quote.active, Number(range.max)));
      number.value = String(quote.active);
      form.elements.billing.value = quote.billing;
      $$("[name=addons]", form).forEach((box) => (box.checked = quote.addons.includes(box.value)));
    }
    function render() {
      const priced = priceQuote(quote);
      const auto = recommendedPlan(quote.active, quote.addons);
      $$("[name=plan]", form).forEach((radio) => {
        const plan = PLANS[radio.value];
        radio.disabled = quote.active > plan.max;
        radio.checked = radio.value === priced.planId;
        $(`[data-recommended="${radio.value}"]`).classList.toggle("hidden", radio.value !== auto);
        $(`[data-too-small="${radio.value}"]`).classList.toggle("hidden", !radio.disabled);
      });
      $$("[name=addons]", form).forEach((box) => {
        const bundled = priced.plan.bundled.includes(box.value);
        $(`[data-addon-price="${box.value}"]`).textContent = bundled
          ? `Included in ${priced.plan.name}`
          : `${money(ADDONS[box.value].price)}${ADDONS[box.value].recurring ? " / mo" : " once"}`;
      });
      $("[data-plan-mode]").textContent =
        quote.plan === "auto" || quote.plan !== priced.planId
          ? `Showing ${priced.plan.name}, the lowest price for ${plural(quote.active, "active onboarding")}.`
          : `You chose ${priced.plan.name}.`;
      $("[data-auto-plan]").hidden = quote.plan === "auto";
      $("[data-quote-lines]").innerHTML = priced.lines
        .map(
          (line) =>
            `<tr class="border-b border-line"><th scope="row" class="py-2.5 pr-3 text-left font-normal">${esc(line.label)}</th><td class="py-2.5 text-right font-mono whitespace-nowrap">${line.included ? "Included" : money(line.amount)}</td></tr>`,
        )
        .join("");
      $("[data-quote-subtotal]").textContent = money(priced.monthly);
      $("[data-discount-row]").hidden = !priced.annual;
      $("[data-quote-discount]").textContent = `−${money(priced.discount)}`;
      $("[data-quote-month]").textContent = money(priced.perMonth);
      $("[data-quote-billed-label]").textContent = priced.annual ? "Billed today for 12 months" : "Billed each month";
      $("[data-quote-billed]").textContent = money(priced.billed);
      $("[data-onetime-row]").hidden = !priced.oneTime;
      $("[data-quote-onetime]").textContent = money(priced.oneTime);
      $("[data-quote-first]").textContent = money(priced.firstInvoice);
      $("[data-quote-saving]").textContent = priced.annual
        ? `Annual billing saves ${money(priced.discount * 12)} a year.`
        : `Switch to annual billing to save ${money(Math.round(priced.monthly * ANNUAL_DISCOUNT * 12 * 100) / 100)} a year.`;
      $("[data-quote-per]").textContent = `${money(priced.perMonth / quote.active)} per active onboarding each month`;
      const query = new URLSearchParams({
        topic: "sales",
        active: String(quote.active),
        billing: quote.billing,
        plan: priced.planId,
      });
      if (quote.addons.length) query.set("addons", quote.addons.join(","));
      $("[data-quote-link]").href = `contact.html?${query}`;
      writeJSON(STORAGE_KEYS.quote, quote);
    }
    function readForm(source) {
      let active = Math.round(Number(source === number ? number.value : range.value));
      if (!Number.isFinite(active) || active < 1) active = 1;
      if (active > 1000) active = 1000;
      quote.active = active;
      quote.billing = form.elements.billing.value;
      quote.addons = $$("[name=addons]:checked", form).map((box) => box.value);
    }
    form.addEventListener("submit", (event) => event.preventDefault());
    form.addEventListener("input", (event) => {
      if (event.target.name === "plan") return;
      readForm(event.target);
      if (event.target === range) number.value = range.value;
      if (event.target === number && quote.active <= Number(range.max)) range.value = String(quote.active);
      render();
    });
    number.addEventListener("change", () => (number.value = String(quote.active)));
    form.addEventListener("change", (event) => {
      if (event.target.name !== "plan") return;
      quote.plan = event.target.value;
      render();
    });
    $("[data-auto-plan]").addEventListener("click", () => {
      quote.plan = "auto";
      render();
      announce("Showing the lowest-priced plan again.");
    });
    fill();
    render();
  }

  /* ---------- Resources and the onboarding clinic ---------- */

  // The onboarding clinic runs on the second Thursday of each month at 10:00 a.m. PT, skipping closures.
  function clinicDates(count = 3) {
    if (!KEEP_DEMO_CURRENT) return FIXED_CLINIC_DATES.filter((key) => key >= TODAY).slice(0, count);
    const dates = [];
    let [year, month] = TODAY.split("-").map(Number);
    for (let i = 0; i < 24 && dates.length < count; i++) {
      const first = `${year}-${String(month).padStart(2, "0")}-01`;
      const key = addDays(first, ((4 - weekday(first) + 7) % 7) + 7);
      if (key >= addDays(TODAY, 2) && isWorkday(key)) dates.push(key);
      month = month === 12 ? 1 : month + 1;
      if (month === 1) year++;
    }
    return dates;
  }

  function resourceGlyph(type) {
    const glyphs = {
      guide:
        '<rect x="8" y="6" width="26" height="36" rx="3" fill="#dfe6ff"/><path d="M14 15h14M14 21h14M14 27h9" stroke="#1f45d6" stroke-width="2.4" stroke-linecap="round"/><path d="M34 12h6v30H14v-0" fill="none" stroke="#0c1427" stroke-width="2"/>',
      template:
        '<rect x="6" y="6" width="36" height="36" rx="4" fill="#fff3c7"/><path d="M6 17h36M18 17v25" stroke="#0c1427" stroke-width="2"/><rect x="22" y="22" width="15" height="5" rx="1.5" fill="#1f45d6"/><rect x="22" y="31" width="10" height="5" rx="1.5" fill="#98a2b5"/>',
      checklist:
        '<rect x="8" y="5" width="32" height="38" rx="4" fill="#d6f0e2"/><path d="m13 16 3 3 6-6M13 28l3 3 6-6" fill="none" stroke="#186b48" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M26 16h9M26 28h9" stroke="#0c1427" stroke-width="2.2" stroke-linecap="round"/>',
      benchmark:
        '<rect x="5" y="5" width="38" height="38" rx="4" fill="#e6eaf1"/><path d="M11 35V25M19 35V15M27 35V21M35 35V11" stroke="#1f45d6" stroke-width="5" stroke-linecap="round"/><path d="M9 38h30" stroke="#0c1427" stroke-width="2"/>',
      recording:
        '<rect x="4" y="9" width="40" height="28" rx="5" fill="#fde3dc"/><path d="m20 17 10 6-10 6z" fill="#b83218"/><path d="M14 42h20" stroke="#0c1427" stroke-width="2.4" stroke-linecap="round"/>',
    };
    return `<svg viewBox="0 0 48 48" class="size-12 shrink-0" aria-hidden="true">${glyphs[type]}</svg>`;
  }

  const RESOURCE_SORTS = {
    newest: (a, b) => b.published.localeCompare(a.published),
    shortest: (a, b) => a.minutes - b.minutes || b.published.localeCompare(a.published),
  };

  function initResources() {
    const form = $("[data-resource-filters]");
    if (!form) return;
    $("[data-type-chips]").innerHTML = [["all", "Everything"], ...Object.entries(RESOURCE_TYPES)]
      .map(
        ([key, label]) =>
          `<label class="chip"><input class="sr-only" type="radio" name="type" value="${key}" />${label}${key === "all" ? "" : "s"} <span class="tick text-ink-faint" data-type-count="${key}"></span></label>`,
      )
      .join("");
    form.elements.topic.innerHTML =
      `<option value="all">All topics</option>` +
      Object.entries(TOPICS)
        .map(([key, label]) => `<option value="${key}">${label}</option>`)
        .join("");
    form.elements.type.value = validParam("type", RESOURCE_TYPES, "all");
    form.elements.topic.value = validParam("topic", TOPICS, "all");
    const grid = $("[data-resource-grid]");
    const published = new Intl.DateTimeFormat("en-US", {
      timeZone: "UTC",
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    function render() {
      const type = form.elements.type.value,
        topic = form.elements.topic.value,
        sort = form.elements.sort.value;
      const words = form.elements.q.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
      const base = RESOURCES.filter(
        (item) =>
          (topic === "all" || item.topic === topic) &&
          words.every((word) =>
            `${item.title} ${item.summary} ${TEAM_MAP[item.author].name}`.toLowerCase().includes(word),
          ),
      );
      const found = base.filter((item) => type === "all" || item.type === type).sort(RESOURCE_SORTS[sort]);
      ["all", ...Object.keys(RESOURCE_TYPES)].forEach((key) => {
        $(`[data-type-count="${key}"]`).textContent = String(
          base.filter((item) => key === "all" || item.type === key).length,
        );
      });
      grid.innerHTML = found
        .map((item) => {
          const author = TEAM_MAP[item.author];
          const verb = item.type === "recording" ? "watch" : "read";
          return `<li class="panel flex min-w-0 flex-col p-5">
            <div class="flex items-start justify-between gap-4">${resourceGlyph(item.type)}<span class="tick rounded-full bg-mist px-2.5 py-1 text-ink-soft">${RESOURCE_TYPES[item.type]}</span></div>
            <h3 class="mt-4 text-lg font-semibold leading-snug">${esc(item.title)}</h3>
            <p class="mt-2 text-sm leading-relaxed text-ink-soft">${esc(item.summary)}</p>
            <p class="mt-auto pt-4 text-xs text-ink-faint">${TOPICS[item.topic]} · ${item.minutes} min ${verb} · <time datetime="${item.published}">${published.format(noon(item.published))}</time> · ${esc(author.name)}</p>
          </li>`;
        })
        .join("");
      $("[data-resource-count]").textContent = plural(found.length, "resource");
      $("[data-resource-empty]").hidden = found.length > 0;
    }
    form.addEventListener("submit", (event) => event.preventDefault());
    form.addEventListener("input", render);
    form.addEventListener("change", render);
    $("[data-resource-reset]").addEventListener("click", () => {
      form.reset();
      form.elements.type.value = "all";
      render();
    });
    render();
  }

  function initClinic() {
    const holder = $("[data-clinic-dates]");
    if (!holder) return;
    const dates = clinicDates(3);
    holder.innerHTML = dates
      .map(
        (
          key,
          index,
        ) => `<li class="flex flex-wrap items-center justify-between gap-3 border-t border-white/15 py-3 first:border-t-0">
          <span><span class="block font-semibold">${formatLong(key)}</span><span class="text-sm text-haze">10:00–11:00 a.m. PT · online</span></span>
          <a class="${index === 0 ? "btn btn-sm" : "inline-flex min-h-10 items-center rounded-lg border border-white/30 px-3 text-sm font-semibold hover:bg-white/10"}" href="contact.html?topic=clinic&amp;date=${key}">Save a seat<span class="sr-only"> on ${formatLong(key)}</span></a>
        </li>`,
      )
      .join("");
  }

  /* ---------- Company: team and office hours ---------- */

  function portrait(person, index) {
    const backs = ["#dfe6ff", "#fff3c7", "#d6f0e2", "#e6eaf1", "#fde3dc"];
    const hair = {
      short: `<path d="M64 84c-2-30 16-46 38-46s38 15 36 44c-6-14-16-22-36-22-17 0-30 8-38 24z" fill="${person.hairColor}"/>`,
      long: `<path d="M60 150c-10-40-8-68 2-86 10-20 28-28 42-28 22 0 40 16 42 46 2 22-2 46-8 68-4-30-6-52-10-64-14 4-38 2-52-14-4 20-8 46-16 78z" fill="${person.hairColor}"/>`,
      curly: `<g fill="${person.hairColor}">${[
        [70, 64],
        [82, 50],
        [98, 44],
        [114, 46],
        [128, 56],
        [136, 72],
        [64, 80],
        [92, 54],
        [110, 58],
      ]
        .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="15"/>`)
        .join("")}</g>`,
      bun: `<circle cx="102" cy="34" r="16" fill="${person.hairColor}"/><path d="M66 86c-4-28 14-44 36-44s40 14 36 44c-8-16-20-24-36-24s-28 8-36 24z" fill="${person.hairColor}"/>`,
      crop: `<path d="M68 76c2-22 16-34 34-34s32 12 34 34c-10-8-20-12-34-12s-24 4-34 12z" fill="${person.hairColor}"/>`,
      wave: `<path d="M64 92c-6-34 12-54 40-54 24 0 38 16 34 40-14-4-26-14-32-24-8 16-22 30-42 38z" fill="${person.hairColor}"/>`,
    };
    const glasses = person.glasses
      ? `<g fill="none" stroke="#0c1427" stroke-width="3"><circle cx="88" cy="94" r="10"/><circle cx="116" cy="94" r="10"/><path d="M98 94h8"/></g>`
      : "";
    const behind = person.hair === "long" ? hair.long : "";
    const front =
      person.hair === "long"
        ? `<path d="M66 84c4-26 20-40 38-40 20 0 34 14 36 38-12-10-26-14-40-14-12 0-24 6-34 16z" fill="${person.hairColor}"/>`
        : hair[person.hair];
    return `<svg viewBox="0 0 200 200" class="aspect-square w-full" role="img" aria-label="Illustrated portrait of ${esc(person.name)}">
      <rect width="200" height="200" fill="${backs[index % backs.length]}"/>
      <path d="M0 0h200M0 40h200M0 80h200M0 120h200M0 160h200M40 0v200M80 0v200M120 0v200M160 0v200" stroke="#0c1427" stroke-opacity=".06"/>
      ${behind}
      <path d="M40 200c4-40 30-58 62-58s58 18 62 58z" fill="${person.shirt}"/>
      <path d="M90 128h24v22c-8 6-16 6-24 0z" fill="${person.skin}"/>
      <ellipse cx="102" cy="92" rx="34" ry="40" fill="${person.skin}"/>
      ${front}${glasses}
      <path d="M92 114q10 7 20 0" fill="none" stroke="#0c1427" stroke-width="3" stroke-linecap="round"/>
      <circle cx="88" cy="94" r="3" fill="#0c1427"/><circle cx="116" cy="94" r="3" fill="#0c1427"/>
    </svg>`;
  }

  function initTeam() {
    const grid = $("[data-team-grid]");
    if (!grid) return;
    grid.innerHTML = TEAM.map(
      (person, index) => `<li class="panel reveal min-w-0 overflow-hidden">
        ${portrait(person, index)}
        <div class="border-t border-line p-4">
          <h3 class="text-lg font-semibold">${esc(person.name)}</h3>
          <p class="tick mt-0.5 text-cobalt">${esc(person.role)}</p>
          <p class="mt-2 text-sm leading-relaxed text-ink-soft">${esc(person.bio)}</p>
        </div>
      </li>`,
    ).join("");
  }

  function officeStatus() {
    const now = zoned(NOW);
    const toMinutes = (time) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3));
    if (isWorkday(now.key)) {
      const [open, close] = HOURS[String(weekday(now.key))];
      if (now.minutes >= toMinutes(open) && now.minutes < toMinutes(close))
        return { open: true, text: `Open now. The support desk closes at ${clock(close)} PT.` };
      if (now.minutes < toMinutes(open)) return { open: false, text: `Closed. Opens today at ${clock(open)} PT.` };
    }
    const next = nextWorkday(now.key);
    const reason = holidayName(now.key) ? ` for ${holidayName(now.key)}` : "";
    const when = next === addDays(now.key, 1) ? "tomorrow" : dayName.format(noon(next));
    return { open: false, text: `Closed${reason}. Opens ${when} at ${clock(HOURS[String(weekday(next))][0])} PT.` };
  }

  function initOffice() {
    $$("[data-office-status]").forEach((element) => {
      const status = officeStatus();
      element.textContent = status.text;
      const dot = element.parentElement.querySelector("[data-office-dot]");
      if (dot) dot.className = `size-2.5 shrink-0 rounded-full ${status.open ? "bg-moss" : "bg-flare"}`;
    });
    const list = $("[data-closures]");
    if (list)
      list.innerHTML = upcomingClosures(4)
        .map(
          (item) =>
            `<li class="flex justify-between gap-4 border-b border-line py-2.5 text-sm"><span>${esc(item.name)}</span><time datetime="${item.key}" class="text-ink-soft">${formatShort(item.key)}</time></li>`,
        )
        .join("");
  }

  /* ---------- Contact: demo picker and qualified inquiry ---------- */

  // A slot looks taken when this simple hash of its date and time says so; the same slots stay taken all day.
  function slotTaken(key, time) {
    let hash = 7;
    for (const char of key + time) hash = (hash * 31 + char.charCodeAt(0)) % 9973;
    return hash % 4 === 0;
  }
  function demoDays(count = 5) {
    const days = [];
    let key = nextWorkday(TODAY);
    for (let i = 0; i < 40 && days.length < count; i++) {
      if (isWorkday(key)) days.push(key);
      key = addDays(key, 1);
    }
    return days;
  }
  const localTime = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZoneName: "short" });
  const viewerZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const TOPIC_LABELS = {
    sales: "Talk to sales about a plan",
    demo: "Book a 30-minute demo",
    migration: "Move from another tool",
    partner: "Become an implementation partner",
    clinic: "Join an onboarding clinic",
  };
  const FREE_MAIL = ["gmail", "yahoo", "hotmail", "outlook", "icloud", "aol", "proton", "protonmail", "live", "msn"];

  function initDemoPicker(form) {
    const days = demoDays(5);
    const dayList = $("[data-demo-days]");
    const slotList = $("[data-demo-slots]");
    let day = days[0];
    dayList.innerHTML = days
      .map(
        (
          key,
        ) => `<label class="flex min-w-0 flex-col items-center rounded-xl border border-line-strong bg-card px-2 py-2.5 text-center has-checked:border-cobalt has-checked:bg-cobalt has-checked:text-white has-focus-visible:outline-3 has-focus-visible:outline-cobalt">
          <input type="radio" name="demoDay" value="${key}" class="sr-only" />
          <span class="tick">${shortDate.format(noon(key)).split(",")[0]}</span>
          <span class="font-display text-2xl font-semibold">${Number(key.slice(8))}</span>
          <span class="text-xs">${new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "short" }).format(noon(key))}</span>
        </label>`,
      )
      .join("");
    form.elements.demoDay.value = day;

    function renderSlots() {
      const open = DEMO_SLOTS.filter((time) => !slotTaken(day, time));
      slotList.innerHTML = DEMO_SLOTS.map((time) => {
        const taken = slotTaken(day, time);
        const instant = renoInstant(day, time);
        const local =
          viewerZone !== TIME_ZONE
            ? `<span class="block text-xs opacity-80">${localTime.format(instant)} your time</span>`
            : "";
        return `<label class="rounded-lg border px-3 py-2 text-sm ${taken ? "cursor-not-allowed border-dashed border-line-strong text-ink-faint line-through" : "border-line-strong bg-card hover:bg-mist has-checked:border-cobalt has-checked:bg-cobalt-soft has-checked:text-cobalt-deep has-focus-visible:outline-3 has-focus-visible:outline-cobalt"}">
          <input type="radio" name="demoTime" value="${time}" class="sr-only" ${taken ? "disabled" : ""} />
          <span class="font-semibold">${clock(time)} PT</span>${taken ? '<span class="sr-only"> (booked)</span>' : local}
        </label>`;
      }).join("");
      $("[data-demo-open]").textContent = `${plural(open.length, "time")} open on ${formatLong(day)}`;
      updateSummary();
    }
    function updateSummary() {
      const time = form.elements.demoTime ? [...$$("[name=demoTime]", form)].find((r) => r.checked)?.value : "";
      form.elements.demoSlot.value = time ? `${formatLong(day)} at ${clock(time)} PT` : "";
      $("[data-demo-summary]").textContent = time
        ? `Held for you: ${form.elements.demoSlot.value}.`
        : "Choose a time to hold it while you finish the form.";
    }
    dayList.addEventListener("change", () => {
      day = form.elements.demoDay.value;
      renderSlots();
    });
    slotList.addEventListener("change", updateSummary);
    renderSlots();
    // After form.reset(): back to the first day with no time chosen.
    return function reset() {
      day = days[0];
      form.elements.demoDay.value = day;
      renderSlots();
    };
  }

  function initContact() {
    const form = $("[data-contact-form]");
    if (!form) return;
    form.elements.topic.innerHTML = Object.entries(TOPIC_LABELS)
      .map(([key, label]) => `<option value="${key}">${label}</option>`)
      .join("");
    const resetDemo = initDemoPicker(form);

    // Context that travels with the enquiry: a pricing quote, a clinic date or the playbook shortlist.
    const notes = [];
    const quote = quoteFromParams();
    const clinic = params.get("date");
    let topic = validParam("topic", TOPIC_LABELS, location.hash === "#demo" ? "demo" : "sales");
    if (clinic !== null && clinicDates(3).includes(clinic)) {
      topic = "clinic";
      notes.push(`Onboarding clinic: ${formatLong(clinic)}, 10:00 a.m. PT.`);
    } else if (topic === "clinic" && clinicDates(1).length) {
      notes.push(`Onboarding clinic: ${formatLong(clinicDates(1)[0])}, 10:00 a.m. PT.`);
    }
    if (quote) {
      notes.push(`Quote: ${quoteSentence(quote)}`);
      form.elements.monthly.value = String(quote.active);
    }
    if (shortlist.length)
      notes.push(`Shortlisted playbooks: ${shortlist.map((id) => PLAYBOOK_MAP[id].title).join(", ")}.`);
    form.elements.topic.value = topic;
    form.elements.context.value = notes.join(" ");
    $("[data-context-list]").innerHTML = notes.map((note) => `<li>${esc(note)}</li>`).join("");
    $("[data-context]").hidden = notes.length === 0;

    const demoBox = $("[data-demo-box]");
    function syncTopic() {
      demoBox.hidden = form.elements.topic.value !== "demo";
    }
    form.elements.topic.addEventListener("change", syncTopic);
    syncTopic();
    window.addEventListener("hashchange", () => {
      if (location.hash === "#demo") {
        form.elements.topic.value = "demo";
        syncTopic();
      }
    });

    function setError(name, message) {
      const field = form.elements[name];
      const target = field instanceof RadioNodeList ? field[0] : field;
      if (target && target.setAttribute) target.setAttribute("aria-invalid", "true");
      $(`[data-error="${name}"]`, form).textContent = message;
    }
    function clearErrors() {
      $$("[data-error]", form).forEach((element) => (element.textContent = ""));
      $$("[aria-invalid]", form).forEach((element) => element.removeAttribute("aria-invalid"));
      $("[data-form-errors]").hidden = true;
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      clearErrors();
      const value = (name) => form.elements[name].value.trim();
      const errors = [];
      const add = (name, message) => {
        setError(name, message);
        errors.push(name);
      };
      if (value("name").length < 2 || value("name").length > 80) add("name", "Enter your name.");
      const email = value("email").toLowerCase();
      const domain = email.split("@")[1] || "";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 160)
        add("email", "Enter a work email address, like sam@yourcompany.example.");
      else if (FREE_MAIL.includes(domain.split(".")[0]))
        add("email", "Use your work email so we can match you to your company.");
      if (value("company").length < 2) add("company", "Enter your company name.");
      if (!value("role")) add("role", "Choose the role closest to yours.");
      if (!value("size")) add("size", "Choose your company size.");
      const monthly = Number(value("monthly"));
      if (!Number.isInteger(monthly) || monthly < 1 || monthly > 5000)
        add("monthly", "Enter a whole number between 1 and 5,000.");
      if (!value("timeline")) add("timeline", "Choose when you'd like to start.");
      if (value("message").length > 1500) add("message", "Keep this under 1,500 characters.");
      if (form.elements.topic.value === "demo" && !form.elements.demoSlot.value)
        add("demoSlot", "Choose a demo time, or pick another topic.");
      if (!form.elements.consent.checked) add("consent", "Let us know we may contact you about this request.");
      if (errors.length) {
        const summary = $("[data-form-errors]");
        summary.textContent = `Please check ${plural(errors.length, "field")} below.`;
        summary.hidden = false;
        const first = form.elements[errors[0]];
        (first instanceof RadioNodeList
          ? $("[data-demo-days] input:checked", form)
          : first.type === "hidden"
            ? $("[name=demoTime]:not(:disabled)", form)
            : first
        ).focus();
        return;
      }

      /*
       * Connect a real endpoint here, for example Formspree:
       *   const response = await fetch("https://formspree.io/f/your-id", { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
       * and show the success state below only when response.ok is true.
       */
      const enterprise = monthly >= 150 || ["201-1000", "1000+"].includes(value("size"));
      const owner =
        form.elements.topic.value === "partner"
          ? TEAM_MAP.nkechi
          : form.elements.topic.value === "migration"
            ? TEAM_MAP.elodie
            : enterprise
              ? TEAM_MAP.laszlo
              : null;
      const reference = `LL-${TODAY.slice(2).replaceAll("-", "")}-${String(Math.floor(1000 + Math.random() * 9000))}`;
      const now = zoned(NOW);
      const replyDay = isWorkday(now.key) && now.minutes < 15 * 60 ? now.key : nextWorkday(now.key);
      const first = value("name").split(/\s+/)[0];
      $("[data-success-title]").textContent = `Thanks, ${first}. Request received.`;
      $("[data-success-reference]").textContent = reference;
      $("[data-success-owner]").textContent = owner
        ? `${owner.name}, ${owner.role.toLowerCase()}, will pick this up personally.`
        : "Our sales team in Reno will pick this up.";
      const steps = [
        `We reply by the end of ${replyDay === now.key ? "today" : formatLong(replyDay)} (Pacific time), using ${email}.`,
      ];
      if (form.elements.topic.value === "demo")
        steps.push(
          `Your demo is held for ${form.elements.demoSlot.value}. We'll confirm it with a calendar invite in that reply.`,
        );
      else if (form.elements.topic.value === "clinic")
        steps.push("We'll add you to the clinic list and send the joining link the day before.");
      else
        steps.push(
          enterprise
            ? "Expect a 30-minute discovery call, then a written proposal within a week."
            : "We'll suggest a playbook and a plan that fits your volume.",
        );
      steps.push(
        `Before we talk, it helps to have one recent onboarding in mind: who was involved and where it slowed down.`,
      );
      $("[data-success-steps]").innerHTML = steps.map((step) => `<li>${esc(step)}</li>`).join("");
      form.hidden = true;
      const success = $("[data-contact-success]");
      success.hidden = false;
      success.focus();
    });
    $("[data-new-enquiry]").addEventListener("click", () => {
      form.reset();
      form.elements.topic.value = topic;
      form.elements.context.value = notes.join(" ");
      clearErrors();
      resetDemo();
      syncTopic();
      form.hidden = false;
      $("[data-contact-success]").hidden = true;
      form.elements.name.focus();
    });
  }

  /* ---------- Start ---------- */

  initMenu();
  initYear();
  initSaveButtons();
  initFeatured();
  initPlaybooks();
  initStages();
  initPlanPreview();
  initCustomers();
  initPricing();
  initResources();
  initClinic();
  initTeam();
  initOffice();
  initContact();
  initReveals();
})();
