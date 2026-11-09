/*
 * Wardline: menus, reveals and every interactive feature. Content lives in data.js (window.WARDLINE).
 * Each init function looks for its own markup and returns early on pages that don't have it.
 */
(() => {
  "use strict";

  const {
    FRAMEWORKS,
    FAMILIES,
    CONTROLS,
    INTEGRATION_CATEGORIES,
    INTEGRATIONS,
    ANNUAL_DISCOUNT,
    PLANS,
    ADDONS,
    ASSESSMENT,
    TRUST_CATEGORIES,
    SUBPROCESSORS,
    DOCUMENTS,
    PERSONAL_DOMAINS,
    DEMO,
    SPECIALISTS,
    STORIES,
  } = window.WARDLINE;

  // Wardline works from Richmond, Virginia: office hours, demo slots and trust center dates use Eastern time.
  const TIME_ZONE = "America/New_York";
  const ZONE_LABEL = "ET";
  /*
   * While on, dated content rolls forward so the demo never looks stale: the SOC 2 report period and its
   * issue date, the ISO 27001 certificate cycle, the latest penetration test month and the demo slots.
   * Turn it off to show the fixed dates in FIXED_REPORTS instead (see DOCS.md).
   */
  const KEEP_DEMO_CURRENT = true;
  const FIXED_REPORTS = {
    soc2Start: "2025-10-01",
    soc2End: "2026-09-30",
    soc2Issued: "2026-10-28",
    isoIssued: "2025-03-14",
    pentest: "2026-08",
  };
  const STORAGE_KEYS = {
    assessment: "wardline:assessment:v1",
    pricing: "wardline:pricing:v1",
    integrations: "wardline:integrations:v1",
    demo: "wardline:demo-draft:v1",
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
  const byId = (list) => Object.fromEntries(list.map((item) => [item.id, item]));
  const FW = byId(FRAMEWORKS);
  const FW_BY_CODE = Object.fromEntries(FRAMEWORKS.map((item) => [item.code, item]));
  const FAMILY = byId(FAMILIES);
  const INTEGRATION = byId(INTEGRATIONS);
  const PLAN = byId(PLANS);
  const ADDON = byId(ADDONS);
  const DOCUMENT = byId(DOCUMENTS);

  // US dollars, whole dollars: $1,656.
  const money = (amount) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);

  function announce(message) {
    const notice = $("#notice");
    if (!notice) return;
    notice.textContent = message;
    notice.hidden = false;
    clearTimeout(announce.timer);
    announce.timer = setTimeout(() => (notice.hidden = true), 3200);
  }

  // Reference codes such as TR-7KQ4MD: no 0/O or 1/I, so they read clearly over the phone.
  function code(length) {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let out = "";
    for (let i = 0; i < length; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
    return out;
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
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" ? parsed : null;
    } catch {
      safeStorage.removeItem(key);
      return null;
    }
  }
  const writeJSON = (key, value) => safeStorage.setItem(key, JSON.stringify(value));

  /* ---------- Dates in America/New_York ---------- */

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
  // The UTC instant of a wall-clock time in Richmond ("2026-11-04", "10:00").
  function easternInstant(key, time) {
    const [y, m, d] = key.split("-").map(Number);
    const [hh, mm] = time.split(":").map(Number);
    const guess = Date.UTC(y, m - 1, d, hh, mm);
    const seen = zoned(new Date(guess));
    const [sy, sm, sd] = seen.key.split("-").map(Number);
    const seenUtc = Date.UTC(sy, sm - 1, sd, 0, seen.minutes);
    return new Date(guess - (seenUtc - guess));
  }
  // ?now=YYYY-MM-DDTHH:MM previews the site at another Eastern time (handy for screenshots and reviews).
  const NOW = (() => {
    const value = params.get("now");
    const match = value && /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})$/.exec(value);
    if (match) {
      const instant = easternInstant(match[1], match[2]);
      if (!isNaN(instant)) return instant;
    }
    return new Date();
  })();
  const TODAY = zoned(NOW).key;
  const YEAR = Number(TODAY.slice(0, 4));

  const noon = (key) => new Date(key + "T12:00:00Z");
  const keyOf = (date) => date.toISOString().slice(0, 10);
  const addDays = (key, days) => keyOf(new Date(noon(key).getTime() + days * 86400000));
  const weekday = (key) => noon(key).getUTCDay();
  const pad = (n) => String(n).padStart(2, "0");
  const fmt = (options) => new Intl.DateTimeFormat("en-US", { timeZone: "UTC", ...options });
  const mediumDate = fmt({ month: "short", day: "numeric", year: "numeric" });
  const shortDate = fmt({ month: "short", day: "numeric" });
  const longDate = fmt({ weekday: "long", month: "long", day: "numeric" });
  const dayTab = fmt({ weekday: "short", month: "short", day: "numeric" });
  const monthYear = fmt({ month: "long", year: "numeric" });
  const formatMedium = (key) => mediumDate.format(noon(key));

  // "13:30" -> "1:30 p.m."
  function clock(time) {
    const [h, m] = time.split(":").map(Number);
    return `${((h + 11) % 12) + 1}:${pad(m)} ${h < 12 ? "a.m." : "p.m."}`;
  }

  /*
   * US federal holidays for any year, by rule. The office and the demo calendar close on these.
   * A Saturday holiday is observed on the Friday before, a Sunday holiday on the Monday after.
   */
  const holidayCache = new Map();
  function holidaysFor(year) {
    if (holidayCache.has(year)) return holidayCache.get(year);
    const key = (m, d) => `${year}-${pad(m)}-${pad(d)}`;
    const nth = (m, dow, n) => {
      const first = key(m, 1);
      return addDays(first, ((dow - weekday(first) + 7) % 7) + (n - 1) * 7);
    };
    const last = (m, dow) => {
      const end = addDays(key(m + 1, 1), -1);
      return addDays(end, -((weekday(end) - dow + 7) % 7));
    };
    const observed = (k) => (weekday(k) === 6 ? addDays(k, -1) : weekday(k) === 0 ? addDays(k, 1) : k);
    const list = [
      [observed(key(1, 1)), "New Year's Day"],
      [nth(1, 1, 3), "Martin Luther King Jr. Day"],
      [nth(2, 1, 3), "Washington's Birthday"],
      [last(5, 1), "Memorial Day"],
      [observed(key(6, 19)), "Juneteenth"],
      [observed(key(7, 4)), "Independence Day"],
      [nth(9, 1, 1), "Labor Day"],
      [nth(10, 1, 2), "Columbus Day"],
      [observed(key(11, 11)), "Veterans Day"],
      [nth(11, 4, 4), "Thanksgiving Day"],
      [observed(key(12, 25)), "Christmas Day"],
    ];
    // New Year's Day on a Saturday is observed on December 31 of the year before.
    const nextNewYear = `${year + 1}-01-01`;
    if (weekday(nextNewYear) === 6) list.push([addDays(nextNewYear, -1), "New Year's Day (observed)"]);
    const map = new Map(list.filter(([k]) => k.startsWith(String(year))));
    holidayCache.set(year, map);
    return map;
  }
  const holidayName = (key) => holidaysFor(Number(key.slice(0, 4))).get(key) || "";
  const isBusinessDay = (key) => weekday(key) !== 0 && weekday(key) !== 6 && !holidayName(key);
  function nextBusinessDays(fromKey, count) {
    const days = [];
    let day = fromKey;
    for (let i = 0; i < 60 && days.length < count; i++) {
      day = addDays(day, 1);
      if (isBusinessDay(day)) days.push(day);
    }
    return days;
  }

  /*
   * Report dates for the trust center. With KEEP_DEMO_CURRENT, the SOC 2 period ends on the latest
   * September 30 whose report has been issued (fourth Wednesday of October), the ISO certificate runs in
   * three-year cycles from March 14, 2025, and the penetration test is the latest August.
   */
  function reportDates() {
    if (!KEEP_DEMO_CURRENT) return { ...FIXED_REPORTS };
    const fourthWednesday = (year) => {
      const first = `${year}-10-01`;
      return addDays(first, ((3 - weekday(first) + 7) % 7) + 21);
    };
    let endYear = YEAR;
    if (TODAY < fourthWednesday(endYear)) endYear -= 1;
    let isoYear = 2025;
    while (`${isoYear + 3}-03-14` <= TODAY) isoYear += 3;
    const pentestYear = Number(TODAY.slice(5, 7)) >= 9 ? YEAR : YEAR - 1;
    return {
      soc2Start: `${endYear - 1}-10-01`,
      soc2End: `${endYear}-09-30`,
      soc2Issued: fourthWednesday(endYear),
      isoIssued: `${isoYear}-03-14`,
      pentest: `${pentestYear}-08`,
    };
  }

  /* ---------- Menu, reveals, year and relative dates ---------- */

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

  /*
   * Dates relative to today, filled in the browser: data-day-offset="-2" (a date two days ago) with
   * data-format="short|medium|weekday", and data-days-until="46" (a count that never runs out).
   */
  function initDates() {
    $$("[data-year]").forEach((element) => (element.textContent = String(YEAR)));
    $$("[data-day-offset]").forEach((element) => {
      const offset = Number(element.dataset.dayOffset);
      if (!Number.isFinite(offset)) return;
      const key = addDays(TODAY, offset);
      const style = element.dataset.format || "short";
      element.textContent =
        style === "medium"
          ? formatMedium(key)
          : style === "weekday"
            ? longDate.format(noon(key))
            : shortDate.format(noon(key));
      if (element.tagName === "TIME") element.setAttribute("datetime", key);
    });
    $$("[data-today]").forEach((element) => {
      element.textContent = formatMedium(TODAY);
      if (element.tagName === "TIME") element.setAttribute("datetime", TODAY);
    });
  }

  /* ---------- Drawn framework seals (original badges, not any official mark) ---------- */

  function seal(id, size = 64) {
    const fw = own(FW, id) ? FW[id] : FRAMEWORKS[0];
    const ink = "#0b1a2c",
      teal = "#0b6f80",
      soft = "#dff1f3";
    const words = fw.name.split(" ");
    const label = (y, text, s = 11) =>
      `<text x="32" y="${y}" text-anchor="middle" font-family="Roboto Mono, ui-monospace, monospace" font-size="${s}" font-weight="500" fill="${ink}">${esc(text)}</text>`;
    const twoLines =
      words.length > 1 ? label(31, words[0], 11) + label(44, words.slice(1).join(" "), 10) : label(37, words[0], 12);
    let shape = "";
    if (fw.seal === "hex") {
      shape = `<path d="M32 3 57 17.5v29L32 61 7 46.5v-29Z" fill="${soft}" stroke="${ink}" stroke-width="2"/><path d="M32 10 51 21v22L32 54 13 43V21Z" fill="#fff" stroke="${teal}" stroke-width="1.5"/>`;
    } else if (fw.seal === "round") {
      const ticks = Array.from({ length: 24 }, (_, i) => {
        const a = (i / 24) * Math.PI * 2;
        const x1 = 32 + Math.cos(a) * 26,
          y1 = 32 + Math.sin(a) * 26,
          x2 = 32 + Math.cos(a) * 29,
          y2 = 32 + Math.sin(a) * 29;
        return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${teal}" stroke-width="1.5"/>`;
      }).join("");
      shape = `<circle cx="32" cy="32" r="30" fill="${soft}" stroke="${ink}" stroke-width="2"/>${ticks}<circle cx="32" cy="32" r="22" fill="#fff" stroke="${ink}" stroke-width="1"/>`;
    } else if (fw.seal === "cross") {
      shape = `<path d="M32 3 56 11v20c0 15-10 25-24 30C18 56 8 46 8 31V11Z" fill="${soft}" stroke="${ink}" stroke-width="2"/><path d="M28 8h8v6h-8z" fill="${teal}"/><path d="M15 17h34v14c0 10-7 18-17 22-10-4-17-12-17-22Z" fill="#fff" stroke="${teal}" stroke-width="1.2"/>`;
    } else if (fw.seal === "ring") {
      const dots = Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
        const x = 32 + Math.cos(a) * 25 - 2,
          y = 32 + Math.sin(a) * 25 - 2;
        return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="4" height="4" fill="${teal}" transform="rotate(45 ${(x + 2).toFixed(1)} ${(y + 2).toFixed(1)})"/>`;
      }).join("");
      shape = `<circle cx="32" cy="32" r="30" fill="#fff" stroke="${ink}" stroke-width="2"/>${dots}<circle cx="32" cy="32" r="19" fill="${soft}"/>`;
    } else if (fw.seal === "card") {
      shape = `<rect x="3" y="11" width="58" height="42" rx="6" fill="${soft}" stroke="${ink}" stroke-width="2"/><rect x="3" y="17" width="58" height="5" fill="${ink}"/><rect x="9" y="26" width="10" height="7" rx="1.5" fill="none" stroke="${teal}" stroke-width="1.5"/>`;
      return `<svg viewBox="0 0 64 64" width="${size}" height="${size}" role="img" aria-label="${esc(fw.name)} badge">${shape}${label(42, fw.name, 9.5)}</svg>`;
    } else {
      shape = `<path d="M32 3 61 24 50 59H14L3 24Z" fill="${soft}" stroke="${ink}" stroke-width="2"/><path d="M32 13 52 27 45 51H19L12 27Z" fill="#fff" stroke="${teal}" stroke-width="1.2"/><path d="M20 47h24M18 41h28" stroke="${teal}" stroke-width="1" opacity=".5"/>`;
    }
    return `<svg viewBox="0 0 64 64" width="${size}" height="${size}" role="img" aria-label="${esc(fw.name)} badge">${shape}${twoLines}</svg>`;
  }

  function initSeals() {
    $$("[data-seal]").forEach((element) => {
      const id = element.dataset.seal;
      if (own(FW, id)) element.innerHTML = seal(id, Number(element.dataset.size) || 64);
    });
  }

  /* ---------- Control library math (frameworks page, home, assessment) ---------- */

  const controlsFor = (id) => CONTROLS.filter((control) => control[2].includes(FW[id].code));
  function overlap(a, b) {
    const ca = FW[a].code,
      cb = FW[b].code;
    const shared = [],
      onlyA = [],
      onlyB = [];
    CONTROLS.forEach((control) => {
      const inA = control[2].includes(ca),
        inB = control[2].includes(cb);
      if (inA && inB) shared.push(control);
      else if (inA) onlyA.push(control);
      else if (inB) onlyB.push(control);
    });
    return { shared, onlyA, onlyB };
  }
  const familyOf = (control) => FAMILY[control[0].slice(0, 2)];

  function initStats() {
    $$("[data-stat]").forEach((element) => {
      const stat = element.dataset.stat;
      if (stat === "controls") element.textContent = String(CONTROLS.length);
      else if (stat === "frameworks") element.textContent = String(FRAMEWORKS.length);
      else if (stat === "integrations") element.textContent = String(INTEGRATIONS.length);
      else if (stat === "checks")
        element.textContent = String(INTEGRATIONS.reduce((sum, item) => sum + item.checks, 0));
      else if (stat.startsWith("fw:") && own(FW, stat.slice(3)))
        element.textContent = String(controlsFor(stat.slice(3)).length);
    });
  }

  /* ---------- Home: framework overview cards and the hero dashboard ---------- */

  function initFrameworkCards() {
    const grid = $("[data-framework-cards]");
    if (!grid) return;
    grid.innerHTML = FRAMEWORKS.map((fw) => {
      const count = controlsFor(fw.id).length;
      const shared = controlsFor(fw.id).filter((control) => control[2].length > 1).length;
      return `<li class="reveal flex min-w-0 flex-col border-t border-line pt-6">
        <div class="flex items-center gap-4"><span class="shrink-0">${seal(fw.id, 56)}</span>
        <div class="min-w-0"><h3 class="text-xl font-semibold">${esc(fw.name)}</h3><p class="text-sm text-slate-2">${esc(fw.region)}</p></div></div>
        <p class="mt-4 text-[0.97rem] leading-relaxed text-slate">${esc(fw.summary)}</p>
        <p class="mt-4 font-mono text-sm text-ink"><span class="font-semibold">${count}</span> controls · <span class="font-semibold">${shared}</span> shared with another framework</p>
        <a class="text-link mt-4 text-sm" href="frameworks.html?fw=${fw.id}">Explore ${esc(fw.name)}<span class="sr-only"> controls and overlaps</span></a>
      </li>`;
    }).join("");
  }

  // The hero dashboard switches between three sample workspaces' frameworks.
  function initHeroDashboard() {
    const root = $("[data-hero-dash]");
    if (!root) return;
    const states = {
      soc2: { pass: 57, attn: 3, fail: 1, ready: 93, days: 46 },
      iso27001: { pass: 54, attn: 7, fail: 2, ready: 86, days: 73 },
      hipaa: { pass: 34, attn: 2, fail: 0, ready: 94, days: 29 },
    };
    const buttons = $$("[data-dash-fw]", root);
    function show(id) {
      const state = states[id];
      const total = state.pass + state.attn + state.fail;
      buttons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.dashFw === id)));
      $("[data-dash-total]", root).textContent = String(total);
      $("[data-dash-pass]", root).textContent = String(state.pass);
      $("[data-dash-attn]", root).textContent = String(state.attn);
      $("[data-dash-fail]", root).textContent = String(state.fail);
      $("[data-dash-ready]", root).textContent = `${state.ready}%`;
      $("[data-dash-meter]", root).style.width = `${state.ready}%`;
      $("[data-dash-name]", root).textContent = FW[id].name;
      const opens = addDays(TODAY, state.days);
      $("[data-dash-window]", root).textContent = `${formatMedium(opens)} · in ${plural(state.days, "day")}`;
      // Stacked status bar: widths in percent of all controls.
      $("[data-dash-bar-pass]", root).style.width = `${(state.pass / total) * 100}%`;
      $("[data-dash-bar-attn]", root).style.width = `${(state.attn / total) * 100}%`;
      $("[data-dash-bar-fail]", root).style.width = `${(state.fail / total) * 100}%`;
    }
    buttons.forEach((button) => button.addEventListener("click", () => show(button.dataset.dashFw)));
    show("soc2");
  }

  /* ---------- Tabs (platform tour) ---------- */

  function initTabs() {
    $$("[data-tabs]").forEach((root) => {
      const tabs = $$('[role="tab"]', root);
      if (!tabs.length) return;
      function select(tab, focus = false, updateHash = false) {
        tabs.forEach((item) => {
          const on = item === tab;
          item.setAttribute("aria-selected", String(on));
          item.tabIndex = on ? 0 : -1;
          $("#" + item.getAttribute("aria-controls")).hidden = !on;
        });
        if (focus) tab.focus();
        if (updateHash) history.replaceState(null, "", "#" + tab.dataset.tab);
      }
      tabs.forEach((tab, index) => {
        tab.addEventListener("click", () => select(tab, false, true));
        tab.addEventListener("keydown", (event) => {
          let next = null;
          if (event.key === "ArrowRight" || event.key === "ArrowDown") next = tabs[(index + 1) % tabs.length];
          else if (event.key === "ArrowLeft" || event.key === "ArrowUp")
            next = tabs[(index - 1 + tabs.length) % tabs.length];
          else if (event.key === "Home") next = tabs[0];
          else if (event.key === "End") next = tabs[tabs.length - 1];
          if (next) {
            event.preventDefault();
            select(next, true, true);
          }
        });
      });
      const fromHash = tabs.find((tab) => "#" + tab.dataset.tab === location.hash);
      select(fromHash || tabs[0]);
      if (fromHash) root.scrollIntoView({ block: "start" });
    });
  }

  /* ---------- Frameworks explorer and cross-mapping ---------- */

  function initFrameworks() {
    const root = $("[data-fw-explorer]");
    if (!root) return;
    const form = $("[data-fw-form]", root);
    const chips = $("[data-fw-chips]", form);
    chips.innerHTML = FRAMEWORKS.map(
      (fw) =>
        `<label class="chip"><input class="sr-only" type="radio" name="fw" value="${fw.id}" />${esc(fw.name)}</label>`,
    ).join("");
    const versus = form.elements.vs;
    let primary = own(FW, params.get("fw")) ? params.get("fw") : "soc2";
    let compare = params.get("vs");
    if (compare !== "none" && (!own(FW, compare) || compare === primary))
      compare = primary === "iso27001" ? "soc2" : "iso27001";
    form.elements.fw.value = primary;
    let view = "shared";

    function fillVersus() {
      versus.innerHTML =
        FRAMEWORKS.filter((fw) => fw.id !== primary)
          .map((fw) => `<option value="${fw.id}">${esc(fw.name)}</option>`)
          .join("") + `<option value="none">No comparison</option>`;
      versus.value = compare;
    }

    function badges(control) {
      return control[2]
        .split("")
        .map(
          (letter) =>
            `<span class="rounded-sm border border-line bg-cloud px-1.5 py-0.5 font-mono text-[0.7rem] text-slate">${esc(FW_BY_CODE[letter].name)}</span>`,
        )
        .join(" ");
    }

    function venn(a, b, result) {
      const { shared, onlyA, onlyB } = result;
      const num = (x, value, size, color) =>
        `<text x="${x}" y="112" text-anchor="middle" font-family="Anek Latin, sans-serif" font-size="${size}" font-weight="600" fill="${color}">${value}</text>`;
      const tag = (x, text, color) =>
        `<text x="${x}" y="222" text-anchor="middle" font-family="Roboto Mono, monospace" font-size="11" fill="${color}">${esc(text)}</text>`;
      return `<svg viewBox="0 0 400 232" class="h-auto w-full max-w-md" role="img" aria-label="${esc(FW[a].name)} and ${esc(FW[b].name)}: ${shared.length} shared controls, ${onlyA.length} only in ${esc(FW[a].name)}, ${onlyB.length} only in ${esc(FW[b].name)}">
        <circle cx="150" cy="100" r="92" fill="#0b6f80" fill-opacity=".1" stroke="#0b6f80" stroke-width="2"/>
        <circle cx="250" cy="100" r="92" fill="#0b1a2c" fill-opacity=".05" stroke="#0b1a2c" stroke-width="2" stroke-dasharray="6 4"/>
        ${num(100, onlyA.length, 32, "#0b1a2c")}${num(200, shared.length, 38, "#08525f")}${num(300, onlyB.length, 32, "#0b1a2c")}
        <path d="M100 124v76M200 124v76M300 124v76" stroke="#93a1b3" stroke-dasharray="2 3"/>
        ${tag(84, "ONLY " + FW[a].name.toUpperCase(), "#3f4d61")}${tag(200, "SHARED", "#08525f")}${tag(316, "ONLY " + FW[b].name.toUpperCase(), "#3f4d61")}
      </svg>`;
    }

    function render() {
      const fw = FW[primary];
      const mine = controlsFor(primary);
      $("[data-fw-seal]", root).innerHTML = seal(primary, 72);
      $("[data-fw-name]", root).textContent = fw.full;
      $("[data-fw-summary]", root).textContent = fw.summary;
      $("[data-fw-issuer]", root).textContent = fw.issuer;
      $("[data-fw-prep]", root).textContent = fw.prep;
      $("[data-fw-count]", root).textContent = String(mine.length);
      const families = FAMILIES.map((family) => ({
        family,
        count: mine.filter((control) => control[0].startsWith(family.id)).length,
        total: CONTROLS.filter((control) => control[0].startsWith(family.id)).length,
      })).filter((row) => row.count > 0);
      $("[data-fw-family-count]", root).textContent = plural(families.length, "control family", "control families");
      $("[data-fw-families]", root).innerHTML = families
        .map(
          (row) => `<li class="grid grid-cols-[minmax(0,11rem)_1fr_auto] items-center gap-3 py-1.5 text-sm">
            <span class="truncate">${esc(row.family.name)}</span>
            <span class="h-2 rounded-sm bg-cloud" aria-hidden="true"><span class="block h-2 rounded-sm bg-teal" style="width:${(row.count / row.total) * 100}%"></span></span>
            <span class="font-mono text-xs text-slate">${row.count}/${row.total}</span></li>`,
        )
        .join("");

      const compareBox = $("[data-fw-compare]", root);
      compareBox.hidden = compare === "none";
      if (compare !== "none") {
        const result = overlap(primary, compare);
        const pct = Math.round((result.shared.length / mine.length) * 100);
        $("[data-fw-venn]", root).innerHTML = venn(primary, compare, result);
        $("[data-fw-overlap-text]", root).textContent =
          `${result.shared.length} of ${fw.name}'s ${mine.length} controls (${pct}%) also count toward ${FW[compare].name}. ` +
          `Adding ${FW[compare].name} after ${fw.name} means ${plural(result.onlyB.length, "new control")}, not ${controlsFor(compare).length}.`;
        const views = { shared: result.shared, onlyA: result.onlyA, onlyB: result.onlyB };
        $$("[data-fw-view]", root).forEach((input) => {
          const label = input.closest("label");
          const name =
            input.value === "shared"
              ? "Shared"
              : input.value === "onlyA"
                ? `Only ${fw.name}`
                : `Only ${FW[compare].name}`;
          $("[data-fw-view-label]", label).textContent = `${name} (${views[input.value].length})`;
        });
        const rows = views[view];
        $("[data-fw-rows]", root).innerHTML = rows.length
          ? rows
              .map(
                (control) => `<tr class="border-t border-line align-top">
                <td class="py-2.5 pr-4 font-mono text-xs whitespace-nowrap text-teal-deep">${control[0]}</td>
                <td class="py-2.5 pr-4">${esc(control[1])}<span class="mt-0.5 block text-xs text-slate-2">${esc(familyOf(control).name)}</span></td>
                <td class="hidden py-2.5 sm:table-cell"><span class="flex flex-wrap gap-1">${badges(control)}</span></td></tr>`,
              )
              .join("")
          : `<tr><td colspan="3" class="py-6 text-center text-slate">No controls in this group.</td></tr>`;
      }
      const url = new URL(location.href);
      url.searchParams.set("fw", primary);
      url.searchParams.set("vs", compare);
      history.replaceState(null, "", url.pathname + url.search + url.hash);
    }

    form.addEventListener("change", (event) => {
      if (event.target.name === "fw") {
        primary = event.target.value;
        if (compare === primary) compare = FRAMEWORKS.find((fw) => fw.id !== primary).id;
        fillVersus();
      } else if (event.target.name === "vs") {
        compare = event.target.value;
      }
      render();
    });
    $$("[data-fw-view]", root).forEach((input) =>
      input.addEventListener("change", () => {
        view = input.value;
        render();
      }),
    );
    fillVersus();
    render();
    renderMatrix();
  }

  // Pairwise shared-control matrix under the explorer.
  function renderMatrix() {
    const table = $("[data-fw-matrix]");
    if (!table) return;
    const head = `<thead><tr><th scope="col" class="p-2 text-left"><span class="sr-only">Framework</span></th>${FRAMEWORKS.map((fw) => `<th scope="col" class="p-2 font-mono text-xs font-medium text-slate">${esc(fw.name)}</th>`).join("")}</tr></thead>`;
    const body = FRAMEWORKS.map((row) => {
      const cells = FRAMEWORKS.map((col) => {
        if (row.id === col.id)
          return `<td class="bg-ink p-2 text-center font-mono text-sm font-semibold text-white">${controlsFor(row.id).length}</td>`;
        const shared = overlap(row.id, col.id).shared.length;
        const share = shared / controlsFor(row.id).length;
        const tone =
          share >= 0.75
            ? "bg-teal-soft text-teal-deep font-semibold"
            : share >= 0.4
              ? "bg-cloud text-ink"
              : "bg-card text-slate";
        return `<td class="${tone} p-2 text-center font-mono text-sm"><a class="block hover:underline" href="frameworks.html?fw=${row.id}&amp;vs=${col.id}#explorer" aria-label="${esc(row.name)} and ${esc(col.name)}: ${shared} shared controls">${shared}</a></td>`;
      }).join("");
      return `<tr class="border-t border-line"><th scope="row" class="p-2 text-left text-sm font-semibold whitespace-nowrap">${esc(row.name)}</th>${cells}</tr>`;
    }).join("");
    table.innerHTML =
      `<caption class="sr-only">Shared controls between pairs of frameworks</caption>` +
      head +
      `<tbody>${body}</tbody>`;
  }

  /* ---------- Readiness assessment ---------- */

  const QUESTION = byId(ASSESSMENT.questions);
  // The quiz steps, in order: size, the five scored questions, target, deadline.
  const STEPS = ["size", ...ASSESSMENT.questions.map((q) => q.id), "target", "deadline"];

  function cleanAnswers(raw) {
    const answers = {};
    if (!raw || typeof raw !== "object") return answers;
    if (own(ASSESSMENT.sizes, raw.size)) answers.size = raw.size;
    ASSESSMENT.questions.forEach((q) => {
      if (own(q.options, raw[q.id])) answers[q.id] = raw[q.id];
    });
    if (own(ASSESSMENT.targets, raw.target)) answers.target = raw.target;
    if (own(ASSESSMENT.deadlines, raw.deadline)) answers.deadline = raw.deadline;
    return answers;
  }

  // Score, band, ranked gaps and timeline for a complete set of answers.
  function assess(answers) {
    let score = 0,
      gapWeeks = 0;
    const gaps = [],
      strengths = [];
    ASSESSMENT.questions.forEach((q, index) => {
      const option = q.options[answers[q.id]];
      score += option.points;
      gapWeeks += option.weeks;
      if (option.points < 20) gaps.push({ q, option, missing: 20 - option.points, index });
      else strengths.push(q);
    });
    gaps.sort((a, b) => b.missing - a.missing || a.index - b.index);
    const factor = ASSESSMENT.sizes[answers.size].factor;
    const target = ASSESSMENT.targets[answers.target];
    const low = Math.round((target.weeks[0] + gapWeeks) * factor);
    const high = Math.round((target.weeks[1] + gapWeeks * 1.5) * factor);
    const band = ASSESSMENT.bands.find((item) => score >= item.min).label;
    const deadline = ASSESSMENT.deadlines[answers.deadline];
    let verdict = "open";
    if (deadline.weeks !== null)
      verdict = high <= deadline.weeks ? "fits" : low <= deadline.weeks ? "tight" : "unlikely";
    return { score, band, gaps, strengths, low, high, gapWeeks, verdict, deadline, target };
  }

  function initAssessment() {
    const form = $("[data-assess-form]");
    if (!form) return;
    const steps = $$("[data-step]", form);
    const progress = $("[data-assess-progress]");
    const counter = $("[data-assess-counter]");
    const back = $("[data-assess-back]");
    const next = $("[data-assess-next]");
    const result = $("[data-assess-result]");
    const error = $("[data-assess-error]");
    let answers = cleanAnswers(readJSON(STORAGE_KEYS.assessment));
    let current = 0;

    // Options are drawn from data so the copy lives in one place.
    $$("[data-options]", form).forEach((box) => {
      const id = box.dataset.options;
      const map =
        id === "size"
          ? ASSESSMENT.sizes
          : id === "target"
            ? ASSESSMENT.targets
            : id === "deadline"
              ? ASSESSMENT.deadlines
              : QUESTION[id].options;
      box.innerHTML = Object.entries(map)
        .map(
          ([value, option]) =>
            `<label class="option"><input type="radio" class="mt-1 size-4 shrink-0 accent-teal" name="${id}" value="${value}" ${answers[id] === value ? "checked" : ""} /><span class="font-semibold">${esc(option.label)}</span></label>`,
        )
        .join("");
    });
    ASSESSMENT.questions.forEach((q) => {
      const title = $(`[data-q-title="${q.id}"]`, form);
      if (title) title.textContent = q.title;
    });

    function save() {
      writeJSON(STORAGE_KEYS.assessment, answers);
    }

    function show(index, focus = true) {
      current = index;
      steps.forEach((step, i) => (step.hidden = i !== index));
      form.hidden = false;
      result.hidden = true;
      counter.textContent = `Question ${index + 1} of ${STEPS.length}`;
      progress.style.width = `${((index + 1) / STEPS.length) * 100}%`;
      back.disabled = index === 0;
      next.textContent = index === STEPS.length - 1 ? "See my results" : "Next question";
      error.textContent = "";
      if (focus) $("legend", steps[index]).focus();
    }

    function renderResult(focus = true) {
      const r = assess(answers);
      form.hidden = true;
      result.hidden = false;
      counter.textContent = "Your results";
      progress.style.width = "100%";
      $("[data-result-score]", result).textContent = String(r.score);
      $("[data-result-band]", result).textContent = r.band;
      const ring = $("[data-result-ring]", result);
      ring.setAttribute("stroke-dasharray", `${(r.score / 100) * 301.6} 301.6`);
      $("[data-result-target]", result).textContent = r.target.label;
      $("[data-result-timeline]", result).textContent = `${r.low}–${r.high} weeks`;
      $("[data-result-after]", result).textContent = r.target.after;
      const verdicts = {
        fits: [`Being ready ${r.deadline.label.toLowerCase()} looks realistic for preparation.`, "pass", "Realistic"],
        tight: [
          `Being ready ${r.deadline.label.toLowerCase()} is tight. Starting on the top gaps this month matters.`,
          "attn",
          "Tight",
        ],
        unlikely: [
          `Being ready ${r.deadline.label.toLowerCase()} is unlikely from preparation alone. Talk to us about scoping, or a Type I or readiness report first.`,
          "fail",
          "At risk",
        ],
        open: [
          "No fixed date. A target date helps keep the work moving; most teams pick one with their auditor.",
          "pass",
          "No date",
        ],
      };
      const [text, tone, word] = verdicts[r.verdict];
      $("[data-result-verdict]", result).textContent = text;
      const pill = $("[data-result-pill]", result);
      pill.className = `status status-${tone}`;
      pill.textContent = word;
      $("[data-result-gaps]", result).innerHTML = r.gaps.length
        ? r.gaps
            .map(
              (gap, i) => `<li class="grid grid-cols-[2rem_1fr] gap-3 border-t border-line py-4">
              <span class="font-mono text-sm text-slate-2">${pad(i + 1)}</span>
              <div class="min-w-0"><div class="flex flex-wrap items-center gap-x-3 gap-y-1"><h3 class="text-lg font-semibold">${esc(gap.q.gap)}</h3>
              <span class="status ${gap.missing >= 10 ? "status-fail" : "status-attn"}">${gap.missing >= 10 ? "High priority" : "Medium priority"}</span></div>
              <p class="mt-1 text-sm text-slate-2">You said: ${esc(gap.option.label)} · about ${plural(gap.option.weeks, "week")} of work</p>
              <p class="mt-1.5 text-[0.97rem] leading-relaxed">${esc(gap.option.fix)}</p></div></li>`,
            )
            .join("")
        : `<li class="border-t border-line py-4">No gaps in these five areas. The remaining work is framework-specific.</li>`;
      $("[data-result-gap-count]", result).textContent = r.gaps.length
        ? plural(r.gaps.length, "gap") + ", most important first"
        : "No gaps";
      $("[data-result-strengths]", result).textContent = r.strengths.length
        ? "Already strong: " + r.strengths.map((q) => q.gap.toLowerCase()).join(", ") + "."
        : "";
      const fwParam = answers.target.startsWith("soc2") ? "soc2" : answers.target;
      $("[data-result-demo]", result).href = `contact.html?fw=${fwParam}&size=${answers.size}`;
      $("[data-result-explore]", result).href = `frameworks.html?fw=${fwParam}`;
      if (focus) $("[data-result-heading]", result).focus();
    }

    function currentAnswer() {
      const id = STEPS[current];
      const checked = $(`input[name="${id}"]:checked`, form);
      return checked ? checked.value : null;
    }

    form.addEventListener("change", (event) => {
      if (event.target.type === "radio") {
        answers[event.target.name] = event.target.value;
        answers = cleanAnswers(answers);
        save();
        error.textContent = "";
      }
    });
    back.addEventListener("click", () => current > 0 && show(current - 1));
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!currentAnswer()) {
        error.textContent = "Choose one answer to continue.";
        $("input", steps[current]).focus();
        return;
      }
      if (current < STEPS.length - 1) show(current + 1);
      else renderResult();
    });
    $("[data-assess-restart]").addEventListener("click", () => {
      answers = {};
      safeStorage.removeItem(STORAGE_KEYS.assessment);
      $$("input", form).forEach((input) => (input.checked = false));
      show(0);
      announce("Answers cleared. Starting again.");
    });
    $("[data-assess-edit]").addEventListener("click", () => show(0));

    const complete = STEPS.every((id) => own(answers, id));
    if (complete) renderResult(false);
    else
      show(
        Math.max(
          0,
          STEPS.findIndex((id) => !own(answers, id)),
        ),
        false,
      );
  }

  /* ---------- Pricing calculator ---------- */

  function quote(state) {
    const plan = PLANS.find((item) => state.employees <= item.maxEmployees) || PLANS[PLANS.length - 1];
    const lines = [
      {
        label: `${plan.name} plan · includes ${plural(plan.includedEmployees, "employee")} and ${plural(plan.includedFrameworks, "framework")}`,
        amount: plan.base,
      },
    ];
    const extraPeople = Math.max(0, state.employees - plan.includedEmployees);
    if (extraPeople)
      lines.push({
        label: `${plural(extraPeople, "more employee")} × ${money(plan.perEmployee)}`,
        amount: extraPeople * plan.perEmployee,
      });
    const extraFrameworks = Math.max(0, state.frameworks - plan.includedFrameworks);
    if (extraFrameworks)
      lines.push({
        label: `${plural(extraFrameworks, "more framework")} × ${money(plan.extraFramework)}`,
        amount: extraFrameworks * plan.extraFramework,
      });
    const included = [];
    ADDONS.forEach((addon) => {
      if (plan.includes.includes(addon.id)) {
        included.push(addon);
        return;
      }
      if (!state.addons.includes(addon.id)) return;
      const amount = addon.unit === "employee" ? addon.price * state.employees : addon.price;
      lines.push({
        label:
          addon.unit === "employee"
            ? `${addon.name} · ${plural(state.employees, "employee")} × ${money(addon.price)}`
            : addon.name,
        amount,
      });
    });
    const monthly = lines.reduce((sum, line) => sum + line.amount, 0);
    const annualMonthly = Math.round((monthly * (100 - ANNUAL_DISCOUNT)) / 100);
    return {
      plan,
      lines,
      included,
      monthly,
      annualMonthly,
      annualTotal: annualMonthly * 12,
      saving: (monthly - annualMonthly) * 12,
    };
  }

  function cleanPricing(raw) {
    const state = { employees: 60, frameworks: 1, addons: [], billing: "annual" };
    if (!raw || typeof raw !== "object") return state;
    const employees = Number(raw.employees);
    if (Number.isInteger(employees) && employees >= 5 && employees <= 2000) state.employees = employees;
    const frameworks = Number(raw.frameworks);
    if (Number.isInteger(frameworks) && frameworks >= 1 && frameworks <= FRAMEWORKS.length)
      state.frameworks = frameworks;
    if (Array.isArray(raw.addons)) state.addons = [...new Set(raw.addons.filter((id) => own(ADDON, id)))];
    if (raw.billing === "monthly") state.billing = "monthly";
    return state;
  }

  function initPricing() {
    // Plan cards: "from" prices at each plan's included size, annual billing.
    $$("[data-plan-price]").forEach((element) => {
      const id = element.dataset.planPrice;
      if (!own(PLAN, id)) return;
      const plan = PLAN[id];
      const yearly =
        element.dataset.billing === "monthly" ? plan.base : Math.round((plan.base * (100 - ANNUAL_DISCOUNT)) / 100);
      element.textContent = money(yearly);
    });
    const form = $("[data-pricing-form]");
    if (!form) return;
    let state = cleanPricing(readJSON(STORAGE_KEYS.pricing));
    const range = form.elements.employeesRange;
    const number = form.elements.employees;
    $("[data-addon-list]", form).innerHTML = ADDONS.map(
      (addon) => `<label class="option items-center" data-addon-row="${addon.id}">
        <input type="checkbox" name="addon" value="${addon.id}" class="size-4 shrink-0 accent-teal" />
        <span class="min-w-0 flex-1"><span class="block font-semibold">${esc(addon.name)}</span><span class="block text-sm text-slate-2">${esc(addon.note)}</span></span>
        <span class="shrink-0 text-right font-mono text-sm" data-addon-price="${addon.id}"></span></label>`,
    ).join("");

    function syncInputs() {
      range.value = String(state.employees);
      number.value = String(state.employees);
      form.elements.frameworks.value = String(state.frameworks);
      form.elements.billing.value = state.billing;
    }

    function render() {
      const q = quote(state);
      $$('input[name="addon"]', form).forEach((input) => {
        const included = q.plan.includes.includes(input.value);
        input.checked = included || state.addons.includes(input.value);
        input.disabled = included;
        const addon = ADDON[input.value];
        $(`[data-addon-price="${addon.id}"]`, form).textContent = included
          ? `Included in ${q.plan.name}`
          : addon.unit === "employee"
            ? `${money(addon.price)}/employee`
            : `${money(addon.price)}/mo`;
      });
      $("[data-frameworks-out]", form).textContent = plural(state.frameworks, "framework");
      $("[data-q-plan]").textContent = q.plan.name;
      $("[data-q-lines]").innerHTML =
        q.lines
          .map(
            (line) =>
              `<li class="flex justify-between gap-4 border-t border-white/10 py-2.5 text-sm"><span class="min-w-0 text-frost">${esc(line.label)}</span><span class="shrink-0 font-mono">${money(line.amount)}</span></li>`,
          )
          .join("") +
        q.included
          .map(
            (addon) =>
              `<li class="flex justify-between gap-4 border-t border-white/10 py-2.5 text-sm"><span class="min-w-0 text-frost">${esc(addon.name)}</span><span class="shrink-0 font-mono">Included</span></li>`,
          )
          .join("");
      const annual = state.billing === "annual";
      $("[data-total]").textContent = money(annual ? q.annualMonthly : q.monthly);
      $("[data-total-note]").textContent = annual
        ? `per month, billed annually: ${money(q.annualTotal)} a year. You save ${money(q.saving)} against monthly billing.`
        : `per month, billed monthly. Annual billing would be ${money(q.annualMonthly)} a month.`;
      $("[data-q-summary]").textContent =
        `${q.plan.name} · ${plural(state.employees, "employee")} · ${plural(state.frameworks, "framework")}`;
      $("[data-q-contact]").href =
        `contact.html?plan=${q.plan.id}&size=${state.employees <= 50 ? "s1" : state.employees <= 200 ? "s2" : state.employees <= 1000 ? "s3" : "s4"}`;
      $$("[data-plan-card]").forEach((card) => {
        const on = card.dataset.planCard === q.plan.id;
        card.classList.toggle("ring-2", on);
        card.classList.toggle("ring-teal", on);
        $("[data-plan-match]", card).hidden = !on;
      });
      writeJSON(STORAGE_KEYS.pricing, state);
    }

    form.addEventListener("input", (event) => {
      const target = event.target;
      if (target === range) {
        state.employees = Number(range.value);
        number.value = range.value;
        $("[data-employees-error]", form).textContent = "";
      } else if (target === number) {
        const value = Number(number.value);
        $("[data-employees-error]", form).textContent =
          Number.isInteger(value) && value >= 5 && value <= 2000 ? "" : "Enter a whole number from 5 to 2,000.";
        if (!Number.isInteger(value) || value < 5 || value > 2000) return;
        state.employees = value;
        range.value = String(value);
      } else if (target.name === "frameworks") {
        const value = Number(target.value);
        if (!Number.isInteger(value) || value < 1 || value > FRAMEWORKS.length) return;
        state.frameworks = value;
      } else if (target.name === "billing") {
        state.billing = target.value === "monthly" ? "monthly" : "annual";
      } else if (target.name === "addon") {
        state.addons = $$('input[name="addon"]:checked:not(:disabled)', form).map((input) => input.value);
      } else return;
      render();
    });
    $$("[data-step-fw]", form).forEach((button) =>
      button.addEventListener("click", () => {
        state.frameworks = Math.min(FRAMEWORKS.length, Math.max(1, state.frameworks + Number(button.dataset.stepFw)));
        form.elements.frameworks.value = String(state.frameworks);
        render();
      }),
    );
    form.addEventListener("submit", (event) => event.preventDefault());
    $("[data-pricing-reset]").addEventListener("click", () => {
      state = cleanPricing(null);
      syncInputs();
      $("[data-employees-error]", form).textContent = "";
      render();
      announce("Estimate reset to 60 employees and one framework.");
    });
    syncInputs();
    render();
  }

  /* ---------- Integrations directory ---------- */

  const CATEGORY_TONES = {
    cloud: "#0b6f80",
    identity: "#3f4c96",
    hr: "#7a3f74",
    ticketing: "#8a4f12",
    code: "#22303f",
    endpoint: "#2c6a4c",
  };
  // A drawn monogram: the category sets the shape and color, the name gives two letters.
  function monogram(item, size = 48) {
    const tone = CATEGORY_TONES[item.category];
    const letters = item.name.slice(0, 2);
    const shapes = {
      cloud: `<path d="M14 34a9 9 0 0 1 1-18 12 12 0 0 1 22-2 9 9 0 0 1 4 20Z" fill="${tone}"/>`,
      identity: `<circle cx="24" cy="24" r="21" fill="${tone}"/><circle cx="24" cy="24" r="16" fill="none" stroke="#fff" stroke-opacity=".35"/>`,
      hr: `<rect x="3" y="3" width="42" height="42" rx="21" ry="12" fill="${tone}"/>`,
      ticketing: `<path d="M3 10h42v9a5 5 0 0 0 0 10v9H3v-9a5 5 0 0 0 0-10Z" fill="${tone}"/>`,
      code: `<rect x="3" y="3" width="42" height="42" rx="4" fill="${tone}"/><path d="M9 9h6M9 39h6M33 9h6M33 39h6" stroke="#fff" stroke-opacity=".4"/>`,
      endpoint: `<rect x="5" y="6" width="38" height="28" rx="3" fill="${tone}"/><path d="M2 38h44l-3 4H5Z" fill="${tone}"/>`,
    };
    const y = item.category === "cloud" ? 30 : item.category === "endpoint" ? 25 : 29;
    return `<svg viewBox="0 0 48 48" width="${size}" height="${size}" aria-hidden="true">${shapes[item.category]}<text x="24" y="${y}" text-anchor="middle" font-family="Anek Latin, sans-serif" font-size="13" font-weight="700" fill="#fff">${esc(letters)}</text></svg>`;
  }

  function cleanIntegrationFilters(raw) {
    const state = { category: "all", q: "", sort: "name" };
    if (!raw || typeof raw !== "object") return state;
    if (raw.category === "all" || own(INTEGRATION_CATEGORIES, raw.category)) state.category = raw.category;
    if (typeof raw.q === "string") state.q = raw.q.slice(0, 60);
    if (raw.sort === "checks") state.sort = "checks";
    return state;
  }

  function initIntegrations() {
    const form = $("[data-int-form]");
    if (!form) return;
    let state = cleanIntegrationFilters(readJSON(STORAGE_KEYS.integrations));
    const fromUrl = params.get("category");
    if (fromUrl && own(INTEGRATION_CATEGORIES, fromUrl)) state.category = fromUrl;
    const chips = $("[data-int-chips]", form);
    const grid = $("[data-int-grid]");

    function matchesQuery(item, q) {
      return `${item.name} ${item.summary} ${INTEGRATION_CATEGORIES[item.category]}`.toLowerCase().includes(q);
    }

    function render(save = true) {
      const q = state.q.trim().toLowerCase();
      const counts = { all: INTEGRATIONS.filter((item) => matchesQuery(item, q)).length };
      Object.keys(INTEGRATION_CATEGORIES).forEach(
        (id) => (counts[id] = INTEGRATIONS.filter((item) => item.category === id && matchesQuery(item, q)).length),
      );
      chips.innerHTML = [["all", "All"], ...Object.entries(INTEGRATION_CATEGORIES)]
        .map(
          ([id, name]) =>
            `<label class="chip"><input class="sr-only" type="radio" name="category" value="${id}" ${state.category === id ? "checked" : ""} />${esc(name)} <span class="font-mono text-xs text-slate-2">${counts[id]}</span></label>`,
        )
        .join("");
      let items = INTEGRATIONS.filter(
        (item) => (state.category === "all" || item.category === state.category) && matchesQuery(item, q),
      );
      items = items.sort((a, b) =>
        state.sort === "checks" ? b.checks - a.checks || a.name.localeCompare(b.name) : a.name.localeCompare(b.name),
      );
      grid.innerHTML = items
        .map(
          (item) => `<li class="panel flex min-w-0 flex-col p-5" data-integration="${item.id}">
          <div class="flex items-start gap-4">${monogram(item)}<div class="min-w-0"><h2 class="text-xl font-semibold">${esc(item.name)}</h2><p class="mono-label mt-0.5 text-slate-2">${esc(INTEGRATION_CATEGORIES[item.category])}</p></div></div>
          <p class="mt-4 flex-1 text-[0.97rem] leading-relaxed text-slate">${esc(item.summary)}</p>
          <dl class="mt-4 grid grid-cols-3 gap-2 border-t border-line pt-3 text-sm">
            <div><dt class="text-xs text-slate-2">Checks</dt><dd class="font-mono font-medium">${item.checks}</dd></div>
            <div><dt class="text-xs text-slate-2">Setup</dt><dd class="font-mono font-medium">${item.minutes} min</dd></div>
            <div><dt class="text-xs text-slate-2">Access</dt><dd class="text-xs leading-snug">${esc(item.access)}</dd></div>
          </dl></li>`,
        )
        .join("");
      const checks = items.reduce((sum, item) => sum + item.checks, 0);
      $("[data-int-count]").textContent =
        `${plural(items.length, "integration")} · ${plural(checks, "automated check")}`;
      $("[data-int-empty]").hidden = items.length > 0;
      form.elements.sort.value = state.sort;
      if (save) writeJSON(STORAGE_KEYS.integrations, state);
    }

    form.elements.q.value = state.q;
    form.addEventListener("input", (event) => {
      if (event.target.name === "q") state.q = event.target.value.slice(0, 60);
      else if (event.target.name === "category") state.category = event.target.value;
      else if (event.target.name === "sort") state.sort = event.target.value === "checks" ? "checks" : "name";
      else return;
      const focusedCategory = event.target.name === "category" ? event.target.value : null;
      render();
      if (focusedCategory) $(`input[name="category"][value="${focusedCategory}"]`, form).focus();
    });
    form.addEventListener("submit", (event) => event.preventDefault());
    $("[data-int-clear]").addEventListener("click", () => {
      state = cleanIntegrationFilters(null);
      form.elements.q.value = "";
      render();
      form.elements.q.focus();
    });
    render(false);
  }

  /* ---------- Trust center ---------- */

  function initTrust() {
    const root = $("[data-trust]");
    if (!root) return;
    const dates = reportDates();
    $$("[data-report]", root).forEach((element) => {
      const what = element.dataset.report;
      if (what === "soc2-period")
        element.textContent = `${formatMedium(dates.soc2Start)} – ${formatMedium(dates.soc2End)}`;
      else if (what === "soc2-issued") element.textContent = formatMedium(dates.soc2Issued);
      else if (what === "iso-issued") element.textContent = formatMedium(dates.isoIssued);
      else if (what === "iso-valid")
        element.textContent = formatMedium(addDays(`${Number(dates.isoIssued.slice(0, 4)) + 3}-03-14`, -1));
      else if (what === "pentest") element.textContent = monthYear.format(noon(dates.pentest + "-15"));
    });

    // Control status by category.
    const all = TRUST_CATEGORIES.flatMap((category) => category.controls);
    const passing = all.filter((control) => control[1] === "pass").length;
    $("[data-trust-summary]", root).textContent = `${passing} of ${all.length} controls passing`;
    $("[data-trust-attn]", root).textContent = plural(all.length - passing, "control") + " being monitored";
    const icon = (status) =>
      status === "pass"
        ? `<svg viewBox="0 0 16 16" class="size-3.5" aria-hidden="true"><path d="M3 8.5 6.5 12 13 4.5" fill="none" stroke="currentColor" stroke-width="2"/></svg>`
        : `<svg viewBox="0 0 16 16" class="size-3.5" aria-hidden="true"><path d="M8 2 15 14H1Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M8 6.5v3.5M8 11.5v1" stroke="currentColor" stroke-width="1.6"/></svg>`;
    $("[data-trust-categories]", root).innerHTML = TRUST_CATEGORIES.map((category) => {
      const ok = category.controls.filter((control) => control[1] === "pass").length;
      return `<details class="panel group" ${category.id === "infra" ? "open" : ""}>
        <summary class="flex min-h-14 items-center justify-between gap-4 px-5 py-3"><span class="font-display text-lg font-semibold">${esc(category.name)}</span>
        <span class="flex items-center gap-3"><span class="font-mono text-sm text-slate">${ok}/${category.controls.length}</span>
        <svg viewBox="0 0 20 20" class="size-4 shrink-0 transition group-open:rotate-180" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m5 8 5 5 5-5"/></svg></span></summary>
        <ul class="border-t border-line px-5 py-2">${category.controls
          .map(
            ([
              name,
              status,
            ]) => `<li class="flex items-center justify-between gap-4 py-2 text-[0.97rem]"><span class="min-w-0">${esc(name)}</span>
            <span class="status ${status === "pass" ? "status-pass" : "status-attn"}">${icon(status)}${status === "pass" ? "Passing" : "Monitoring"}</span></li>`,
          )
          .join("")}</ul></details>`;
    }).join("");

    $("[data-subprocessors]", root).innerHTML = SUBPROCESSORS.map(
      (item) =>
        `<tr class="border-t border-line"><th scope="row" class="py-3 pr-4 text-left font-semibold">${esc(item.name)}</th><td class="py-3 pr-4">${esc(item.purpose)}</td><td class="py-3 pr-4">${esc(item.location)}</td><td class="py-3">${esc(item.data)}</td></tr>`,
    ).join("");

    initAccessRequest(root);
  }

  function initAccessRequest(root) {
    const form = $("[data-access-form]", root);
    if (!form) return;
    const list = $("[data-doc-list]", form);
    list.innerHTML = DOCUMENTS.filter((doc) => doc.gated)
      .map(
        (
          doc,
        ) => `<label class="option items-center"><input type="checkbox" name="docs" value="${doc.id}" class="size-4 shrink-0 accent-teal" ${params.get("doc") === doc.id ? "checked" : ""} />
        <span class="min-w-0 flex-1 font-semibold">${esc(doc.name)}</span>${doc.nda ? `<span class="mono-label shrink-0 text-slate-2">NDA</span>` : ""}</label>`,
      )
      .join("");
    $$("[data-request-doc]", root).forEach((button) =>
      button.addEventListener("click", () => {
        const box = $(`input[name="docs"][value="${button.dataset.requestDoc}"]`, form);
        if (box) box.checked = true;
        syncNda();
        form.scrollIntoView({ block: "start" });
        form.elements.name.focus();
      }),
    );
    const ndaBox = $("[data-nda]", form);
    function needsNda() {
      return $$('input[name="docs"]:checked', form).some((input) => DOCUMENT[input.value].nda);
    }
    function syncNda() {
      ndaBox.hidden = !needsNda();
    }
    form.addEventListener("change", syncNda);
    syncNda();

    function setError(field, message) {
      const error = $(`[data-error-for="${field}"]`, form);
      const input = form.elements[field];
      if (error) error.textContent = message;
      if (input && input.setAttribute) input.setAttribute("aria-invalid", message ? "true" : "false");
      return !message;
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const name = form.elements.name.value.trim();
      const email = form.elements.email.value.trim().toLowerCase();
      const company = form.elements.company.value.trim();
      const docs = $$('input[name="docs"]:checked', form).map((input) => input.value);
      const domain = email.split("@")[1] || "";
      let ok = true;
      ok = setError("name", name ? "" : "Enter your full name.") && ok;
      ok =
        setError(
          "email",
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
            ? "Enter an email address like name@company.example."
            : PERSONAL_DOMAINS.includes(domain)
              ? "Use your work email so we can match you to your company."
              : "",
        ) && ok;
      ok = setError("company", company ? "" : "Enter your company name.") && ok;
      const docError = $('[data-error-for="docs"]', form);
      docError.textContent = docs.length ? "" : "Choose at least one document.";
      ok = docs.length > 0 && ok;
      const nda = form.elements.nda;
      const ndaMissing = needsNda() && !nda.checked;
      $('[data-error-for="nda"]', form).textContent = ndaMissing ? "Accept the NDA to request these documents." : "";
      nda.setAttribute("aria-invalid", String(ndaMissing));
      ok = !ndaMissing && ok;
      if (!ok) {
        const firstBad = $('[aria-invalid="true"]', form) || $('input[name="docs"]', form);
        firstBad.focus();
        return;
      }
      // To connect a real endpoint (for example Formspree), POST new FormData(form) here with fetch() and
      // show the success panel only when the response is OK.
      const reference = `TR-${code(6)}`;
      const success = $("[data-access-success]", root);
      $("[data-access-ref]", success).textContent = reference;
      $("[data-access-greeting]", success).textContent =
        `Thanks, ${name.split(" ")[0]}. Your request is with our security team.`;
      $("[data-access-docs]", success).textContent = docs.map((id) => DOCUMENT[id].name).join(", ");
      const by = nextBusinessDays(TODAY, 1)[0];
      $("[data-access-by]", success).textContent = longDate.format(noon(by));
      form.hidden = true;
      success.hidden = false;
      $("h3", success).focus();
    });
    $("[data-access-again]", root).addEventListener("click", () => {
      form.reset();
      syncNda();
      $("[data-access-success]", root).hidden = true;
      form.hidden = false;
      form.elements.name.focus();
    });
  }

  /* ---------- Customer stories: before and after charts ---------- */

  function storyChart(metric) {
    const max = Math.max(metric.before, metric.after, 1);
    const w = (value) => Math.max(2, (value / max) * 190);
    const label = (value) => `${value}${metric.unit}`;
    return `<figure class="min-w-0">
      <figcaption class="text-sm font-semibold">${esc(metric.label)} <span class="font-normal text-slate-2">(${metric.better} is better)</span></figcaption>
      <svg viewBox="0 0 320 64" class="mt-2 h-auto w-full max-w-sm" role="img" aria-label="${esc(metric.label)}: ${label(metric.before)} before, ${label(metric.after)} with Wardline">
        <text x="0" y="17" font-family="Roboto Mono, monospace" font-size="10" fill="#566376">BEFORE</text>
        <rect x="58" y="6" width="${w(metric.before).toFixed(1)}" height="16" fill="#93a1b3"/>
        <text x="${(64 + w(metric.before)).toFixed(1)}" y="18" font-family="Roboto Mono, monospace" font-size="11" fill="#0b1a2c">${esc(label(metric.before))}</text>
        <text x="0" y="49" font-family="Roboto Mono, monospace" font-size="10" fill="#566376">AFTER</text>
        <rect x="58" y="38" width="${w(metric.after).toFixed(1)}" height="16" fill="#0b6f80"/>
        <text x="${(64 + w(metric.after)).toFixed(1)}" y="50" font-family="Roboto Mono, monospace" font-size="11" font-weight="500" fill="#08525f">${esc(label(metric.after))}</text>
      </svg></figure>`;
  }

  function initStories() {
    $$("[data-story-charts]").forEach((box) => {
      const story = STORIES.find((item) => item.id === box.dataset.storyCharts);
      if (story) box.innerHTML = story.metrics.map(storyChart).join("");
    });
    const filter = $("[data-story-filter]");
    if (!filter) return;
    const used = FRAMEWORKS.filter((fw) => STORIES.some((story) => story.frameworks.includes(fw.id)));
    $("[data-story-chips]", filter).innerHTML = [["all", "All stories"], ...used.map((fw) => [fw.id, fw.name])]
      .map(
        ([id, name]) =>
          `<label class="chip"><input class="sr-only" type="radio" name="storyfw" value="${id}" ${id === "all" ? "checked" : ""} />${esc(name)}</label>`,
      )
      .join("");
    filter.addEventListener("change", () => {
      const value = filter.elements.storyfw.value;
      let shown = 0;
      $$("[data-story]").forEach((section) => {
        const on = value === "all" || section.dataset.frameworks.split(" ").includes(value);
        section.hidden = !on;
        if (on) shown++;
      });
      $("[data-story-count]").textContent = `Showing ${plural(shown, "story", "stories")}`;
    });
  }

  /* ---------- Book a demo: three steps and a slot picker ---------- */

  // Time zones a visitor can view the slots in. "local" is the browser's own zone.
  const VIEW_ZONES = {
    local: "",
    "America/New_York": "Eastern (ET)",
    "America/Chicago": "Central (CT)",
    "America/Denver": "Mountain (MT)",
    "America/Los_Angeles": "Pacific (PT)",
    "America/Anchorage": "Alaska (AKT)",
    "Pacific/Honolulu": "Hawaii (HT)",
  };
  function localZone() {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || TIME_ZONE;
    } catch {
      return TIME_ZONE;
    }
  }
  function zoneTime(instant, zone) {
    const options = { timeZone: zone, hour: "numeric", minute: "2-digit", timeZoneName: "short" };
    const text = new Intl.DateTimeFormat("en-US", options).format(instant);
    return text.replace("AM", "a.m.").replace("PM", "p.m.");
  }
  function zoneDay(instant, zone) {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: zone,
      weekday: "short",
      month: "short",
      day: "numeric",
    }).format(instant);
  }
  // A slot looks taken when this simple hash of its date and time says so; the same slots stay taken all day.
  function slotTaken(key, time) {
    let hash = 7;
    for (const ch of key + time) hash = (hash * 31 + ch.charCodeAt(0)) % 1009;
    return hash % 4 === 0;
  }
  function specialistFor(draft) {
    const fws = draft.frameworks || [];
    return (
      SPECIALISTS.find(
        (person) =>
          (person.rule === "hipaa" && fws.includes("hipaa")) ||
          (person.rule === "pci" && fws.includes("pci")) ||
          (person.rule === "large" && (draft.size === "s3" || draft.size === "s4")),
      ) || SPECIALISTS[SPECIALISTS.length - 1]
    );
  }

  function cleanDraft(raw) {
    const draft = {
      role: "",
      size: "",
      frameworks: [],
      timeline: "",
      first: "",
      last: "",
      email: "",
      company: "",
      note: "",
    };
    if (!raw || typeof raw !== "object") return draft;
    if (own(DEMO.roles, raw.role)) draft.role = raw.role;
    if (own(DEMO.sizes, raw.size)) draft.size = raw.size;
    if (Array.isArray(raw.frameworks)) draft.frameworks = [...new Set(raw.frameworks.filter((id) => own(FW, id)))];
    if (own(DEMO.timelines, raw.timeline)) draft.timeline = raw.timeline;
    ["first", "last", "email", "company", "note"].forEach((field) => {
      if (typeof raw[field] === "string") draft[field] = raw[field].slice(0, field === "note" ? 600 : 120);
    });
    return draft;
  }

  function initDemo() {
    const form = $("[data-demo-form]");
    if (!form) return;
    let draft = cleanDraft(readJSON(STORAGE_KEYS.demo));
    // Links from the assessment, frameworks and pricing pages prefill the first step.
    if (own(FW, params.get("fw")) && !draft.frameworks.includes(params.get("fw")))
      draft.frameworks.push(params.get("fw"));
    if (own(DEMO.sizes, params.get("size"))) draft.size = params.get("size");
    const fromPlan = own(PLAN, params.get("plan")) ? PLAN[params.get("plan")] : null;
    if (fromPlan)
      $("[data-demo-plan]").textContent =
        `You're looking at the ${fromPlan.name} plan. We'll bring your estimate to the call.`;
    $("[data-demo-plan]").hidden = !fromPlan;

    const radios = (name, map) =>
      Object.entries(map)
        .map(
          ([value, label]) =>
            `<label class="option items-center"><input type="radio" name="${name}" value="${value}" class="size-4 shrink-0 accent-teal" /><span class="font-semibold">${esc(label)}</span></label>`,
        )
        .join("");
    $("[data-demo-roles]", form).innerHTML = radios("role", DEMO.roles);
    $("[data-demo-sizes]", form).innerHTML = radios("size", DEMO.sizes);
    $("[data-demo-fws]", form).innerHTML = FRAMEWORKS.map(
      (fw) =>
        `<label class="chip"><input type="checkbox" name="frameworks" value="${fw.id}" class="size-4 accent-teal" />${esc(fw.name)}</label>`,
    ).join("");
    form.elements.timeline.innerHTML =
      `<option value="">Choose a timeline</option>` +
      Object.entries(DEMO.timelines)
        .map(([value, label]) => `<option value="${value}">${esc(label)}</option>`)
        .join("");

    // Restore the draft into the fields.
    if (draft.role) form.elements.role.value = draft.role;
    if (draft.size) form.elements.size.value = draft.size;
    $$('input[name="frameworks"]', form).forEach((input) => (input.checked = draft.frameworks.includes(input.value)));
    form.elements.timeline.value = draft.timeline;
    ["first", "last", "email", "company", "note"].forEach((field) => (form.elements[field].value = draft[field]));

    const steps = $$("[data-demo-step]", form);
    const markers = $$("[data-demo-marker]");
    let step = 0;
    let slot = null;
    let zone = own(VIEW_ZONES, params.get("tz")) && params.get("tz") !== "local" ? params.get("tz") : localZone();

    const zoneSelect = form.elements.zone;
    const local = localZone();
    zoneSelect.innerHTML = Object.entries(VIEW_ZONES)
      .filter(([id]) => id !== local)
      .map(
        ([id, label]) =>
          `<option value="${id === "local" ? local : id}">${esc(id === "local" ? `Your time zone (${local.replace(/_/g, " ")})` : label)}</option>`,
      )
      .join("");
    zoneSelect.value = zone;
    if (zoneSelect.value !== zone) zone = local;

    function saveDraft() {
      draft.role = form.elements.role.value;
      draft.size = form.elements.size.value;
      draft.frameworks = $$('input[name="frameworks"]:checked', form).map((input) => input.value);
      draft.timeline = form.elements.timeline.value;
      ["first", "last", "email", "company", "note"].forEach((field) => (draft[field] = form.elements[field].value));
      draft = cleanDraft(draft);
      writeJSON(STORAGE_KEYS.demo, draft);
    }
    form.addEventListener("input", (event) => {
      if (event.target.name !== "slot" && event.target.name !== "day" && event.target.name !== "zone") saveDraft();
    });
    form.addEventListener("change", (event) => {
      if (event.target.name !== "slot" && event.target.name !== "day" && event.target.name !== "zone") saveDraft();
    });

    function setError(field, message) {
      const error = $(`[data-error-for="${field}"]`, form);
      if (error) error.textContent = message;
      const input = form.elements[field];
      if (input && input.setAttribute) input.setAttribute("aria-invalid", message ? "true" : "false");
      return !message;
    }

    function validate(index) {
      let ok = true;
      if (index === 0) {
        ok = setError("role", form.elements.role.value ? "" : "Choose your role.") && ok;
        ok = setError("size", form.elements.size.value ? "" : "Choose your company size.") && ok;
        const fwError = $('[data-error-for="frameworks"]', form);
        const anyFw = $$('input[name="frameworks"]:checked', form).length > 0;
        fwError.textContent = anyFw ? "" : "Choose at least one framework.";
        ok = anyFw && ok;
        ok = setError("timeline", form.elements.timeline.value ? "" : "Choose a timeline.") && ok;
      } else if (index === 1) {
        const email = form.elements.email.value.trim().toLowerCase();
        ok = setError("first", form.elements.first.value.trim() ? "" : "Enter your first name.") && ok;
        ok = setError("last", form.elements.last.value.trim() ? "" : "Enter your last name.") && ok;
        ok =
          setError(
            "email",
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
              ? "Enter an email address like name@company.example."
              : PERSONAL_DOMAINS.includes(email.split("@")[1])
                ? "Use your work email so we can prepare for your call."
                : "",
          ) && ok;
        ok = setError("company", form.elements.company.value.trim() ? "" : "Enter your company name.") && ok;
      } else {
        const error = $('[data-error-for="slot"]', form);
        // Only a time on the day shown counts; one picked on another day stays hidden.
        const picked = slot !== null && slot.startsWith(`${day}T`);
        error.textContent = picked ? "" : "Choose a time for the call.";
        ok = picked;
      }
      if (!ok) {
        const first = $('[aria-invalid="true"]', steps[index]) || $("input, select", steps[index]);
        if (first) first.focus();
      }
      return ok;
    }

    function show(index, focus = true) {
      step = index;
      steps.forEach((element, i) => (element.hidden = i !== index));
      markers.forEach((marker, i) => {
        marker.classList.toggle("text-teal", i === index);
        marker.classList.toggle("border-ink", i <= index);
        marker.classList.toggle("border-line", i > index);
        marker.classList.toggle("font-semibold", i <= index);
        if (i === index) marker.setAttribute("aria-current", "step");
        else marker.removeAttribute("aria-current");
      });
      $("[data-demo-back]", form).hidden = index === 0;
      $("[data-demo-next]", form).textContent = index === steps.length - 1 ? "Book the call" : "Continue";
      if (index === 2) renderSlots();
      if (focus) $("legend, h2", steps[index]).focus();
    }

    const days = nextBusinessDays(TODAY, DEMO.days);
    let day = days[0];
    function renderSlots() {
      $("[data-demo-days]", form).innerHTML = days
        .map((key) => {
          const open = DEMO.times.filter((time) => !slotTaken(key, time)).length;
          return `<label class="chip flex-col items-start gap-0 py-2"><input class="sr-only" type="radio" name="day" value="${key}" ${key === day ? "checked" : ""} /><span>${esc(dayTab.format(noon(key)))}</span><span class="text-xs font-normal text-slate-2">${plural(open, "time")} open</span></label>`;
        })
        .join("");
      const sameZone =
        zoneTime(easternInstant(day, "12:00"), zone) === zoneTime(easternInstant(day, "12:00"), TIME_ZONE);
      $("[data-demo-slots]", form).innerHTML = DEMO.times
        .map((time) => {
          const instant = easternInstant(day, time);
          const taken = slotTaken(day, time);
          const value = `${day}T${time}`;
          const viewer = zoneTime(instant, zone);
          const viewerDay = zoneDay(instant, zone);
          const crossesDay = viewerDay !== zoneDay(instant, TIME_ZONE);
          return `<label class="option items-center ${taken ? "opacity-60" : ""}"><input type="radio" name="slot" value="${value}" class="size-4 shrink-0 accent-teal" ${taken ? "disabled" : ""} ${slot === value ? "checked" : ""} />
          <span class="min-w-0 flex-1"><span class="block font-semibold">${esc(viewer)}${crossesDay ? ` · ${esc(viewerDay)}` : ""}</span>
          <span class="block text-sm text-slate-2">${sameZone ? "Richmond office time" : `${esc(clock(time))} ${ZONE_LABEL} in Richmond`}</span></span>
          <span class="shrink-0 text-sm ${taken ? "text-slate-2" : "text-pass font-semibold"}">${taken ? "Booked" : "Open"}</span></label>`;
        })
        .join("");
      const holidays = [];
      for (let key = addDays(TODAY, 1); key <= days[days.length - 1]; key = addDays(key, 1))
        if (holidayName(key)) holidays.push(key);
      $("[data-demo-holiday]", form).textContent = holidays.length
        ? `Closed ${holidays.map((key) => `${shortDate.format(noon(key))} for ${holidayName(key)}`).join(" and ")}.`
        : "";
      $("[data-demo-daylabel]", form).textContent = longDate.format(noon(day));
    }
    form.addEventListener("change", (event) => {
      if (event.target.name === "day") {
        day = event.target.value;
        renderSlots();
        $(`input[name="day"][value="${day}"]`, form).focus();
      } else if (event.target.name === "slot") {
        slot = event.target.value;
        $('[data-error-for="slot"]', form).textContent = "";
      } else if (event.target.name === "zone") {
        zone = event.target.value;
        renderSlots();
      }
    });

    $("[data-demo-back]", form).addEventListener("click", () => show(step - 1));
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!validate(step)) return;
      if (step < steps.length - 1) {
        show(step + 1);
        return;
      }
      saveDraft();
      // To connect a real scheduler or CRM, POST the form data here and show the success panel only when it
      // answers OK. Nothing leaves the browser in this version.
      const [slotDay, slotTime] = slot.split("T");
      const instant = easternInstant(slotDay, slotTime);
      const person = specialistFor(draft);
      const reference = `DM-${slotDay.slice(5, 7)}${slotDay.slice(8, 10)}-${code(4)}`;
      const success = $("[data-demo-success]");
      $("[data-demo-ref]", success).textContent = reference;
      $("[data-demo-greeting]", success).textContent = `You're booked, ${draft.first.trim()}.`;
      $("[data-demo-when]", success).textContent =
        `${longDate.format(noon(slotDay))} at ${clock(slotTime)} ${ZONE_LABEL}` +
        (zoneTime(instant, zone) === zoneTime(instant, TIME_ZONE)
          ? ""
          : ` (${zoneTime(instant, zone)}, ${zoneDay(instant, zone)})`);
      $("[data-demo-person]", success).textContent = `${person.name}, ${person.role}`;
      $("[data-demo-chosen]", success).textContent = draft.frameworks.map((id) => FW[id].name).join(", ");
      form.hidden = true;
      $("[data-demo-steps]").hidden = true;
      success.hidden = false;
      $("h2", success).focus();
      safeStorage.removeItem(STORAGE_KEYS.demo);
    });
    show(0, false);
  }

  /* ---------- Office status (footer and contact) ---------- */

  function initOfficeStatus() {
    $$("[data-office-status]").forEach((element) => {
      const now = zoned(NOW);
      const holiday = holidayName(now.key);
      const open = isBusinessDay(now.key) && now.minutes >= 8 * 60 + 30 && now.minutes < 17 * 60 + 30;
      element.textContent = holiday
        ? `Closed today for ${holiday}`
        : open
          ? "Open now · 8:30 a.m.–5:30 p.m. ET"
          : "Closed now · Mon–Fri, 8:30 a.m.–5:30 p.m. ET";
    });
  }

  initMenu();
  initDates();
  initSeals();
  initStats();
  initFrameworkCards();
  initHeroDashboard();
  initTabs();
  initFrameworks();
  initAssessment();
  initPricing();
  initIntegrations();
  initTrust();
  initStories();
  initDemo();
  initOfficeStatus();
  initReveals();
})();
