/*
 * Tessel: menus, theme, reveals and every interactive feature. Vanilla JavaScript, no dependencies.
 * Content (field types, templates, plans, integrations, changelog, stories) lives in data.js (window.TESSEL).
 * Each init function looks for its own markup and returns early on pages that don't have it.
 *
 *  1. Settings
 *  2. Helpers: storage, own-key checks, dates in Omaha's time zone
 *  3. Theme, menu, reveals, footer year
 *  4. Home: the live form builder
 *  5. Templates: cards, gallery, preview dialog, shortlist
 *  6. Features: section nav, logic demo, analytics, integration strip
 *  7. Pricing calculator
 *  8. Integrations directory
 *  9. Changelog
 * 10. Customers
 * 11. Contact: sales hours, walkthrough, sales form
 * 12. Sign up and sign in
 */
(() => {
  "use strict";

  /* ---------- 1. Settings ---------- */

  const DATA = window.TESSEL;
  // Tessel is in Omaha: sales hours and the weekly walkthrough are worked out in Central Time.
  const TIME_ZONE = "America/Chicago";
  // While on, changelog dates move forward by whole weeks after DEMO_ANCHOR, so the newest release
  // always reads as recent. Turn it off to show the dates in data.js exactly as written.
  const KEEP_DEMO_CURRENT = true;
  const DEMO_ANCHOR = "2026-10-27";
  const STORAGE_KEYS = {
    theme: "tessel:theme", // "light" | "dark"
    builder: "tessel:builder:v1", // { title, fields: [{ type, label, required }] }
    saved: "tessel:saved-templates:v1", // [template ids]
    pricing: "tessel:pricing:v1", // { billing: "monthly" | "annual", responses: number }
  };
  // Sales hours, Monday (1) to Friday (5), Central Time.
  const SALES_HOURS = { days: [1, 2, 3, 4, 5], open: "08:00", close: "17:30" };
  // The live walkthrough: every Thursday (4) at noon Central, the first one at least a day away.
  const WALKTHROUGH = { weekday: 4, time: "12:00" };
  // Trial length for Maker and Team sign-ups.
  const TRIAL_DAYS = 14;
  // The analytics card on the features page: totals and the share of starts that reached each question.
  const ANALYTICS = {
    questions: ["Name", "Email", "Number of guests", "Dietary needs", "Parking pass"],
    ranges: {
      7: { views: 1204, starts: 788, finishes: 629, reached: [100, 97, 94, 83, 80] },
      30: { views: 4812, starts: 2966, finishes: 2288, reached: [100, 96, 92, 78, 77] },
    },
  };

  /* ---------- 2. Helpers ---------- */

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const own = (object, key) => typeof key === "string" && Object.prototype.hasOwnProperty.call(object, key);
  const esc = (value) =>
    String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const num = (n) => n.toLocaleString("en-US");
  const plural = (count, word, other = word + "s") => `${num(count)} ${count === 1 ? word : other}`;
  const params = new URLSearchParams(location.search);
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const slugify = (text) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "untitled";
  const money = (amount, cents = false) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: cents ? 2 : 0,
      maximumFractionDigits: cents ? 2 : 0,
    }).format(amount);
  const ACCENT_BG = { tomato: "bg-tomato", butter: "bg-butter", mint: "bg-mint", peri: "bg-peri", bubble: "bg-bubble" };
  const accentBg = (accent) => (own(ACCENT_BG, accent) ? ACCENT_BG[accent] : "bg-butter");
  const ACCENT_HEX = { tomato: "#ff6b42", butter: "#ffd84a", mint: "#86e2b6", peri: "#a9b2ff", bubble: "#ffb4d0" };

  // localStorage, or memory when it is blocked (sandboxed iframes, strict privacy settings).
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

  // Dates. Keys are "YYYY-MM-DD" in Central Time; date maths happens at noon UTC so it never slips a day.
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
    const p = Object.fromEntries(partsFormat.formatToParts(date).map((part) => [part.type, part.value]));
    return { key: `${p.year}-${p.month}-${p.day}`, minutes: Number(p.hour) * 60 + Number(p.minute) };
  }
  // ?now=YYYY-MM-DDTHH:MM previews the site at another Central time (for reviews and screenshots).
  const NOW = (() => {
    const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})$/.exec(params.get("now") || "");
    if (match) {
      const guess = new Date(`${match[1]}T${match[2]}:${match[3]}:00Z`);
      if (!isNaN(guess)) {
        const seen = zoned(guess);
        const seenUtc = new Date(`${seen.key}T00:00:00Z`).getTime() + seen.minutes * 60000;
        return new Date(guess.getTime() - (seenUtc - guess.getTime()));
      }
    }
    return new Date();
  })();
  const NOW_ZONED = zoned(NOW);
  const TODAY = NOW_ZONED.key;
  const noon = (key) => new Date(key + "T12:00:00Z");
  const keyOf = (date) => date.toISOString().slice(0, 10);
  const addDays = (key, days) => keyOf(new Date(noon(key).getTime() + days * 86400000));
  const daysBetween = (a, b) => Math.round((noon(b) - noon(a)) / 86400000);
  const weekday = (key) => noon(key).getUTCDay();
  const fmt = (options) => new Intl.DateTimeFormat("en-US", { timeZone: "UTC", ...options });
  const shortDate = fmt({ month: "short", day: "numeric", year: "numeric" });
  const longDate = fmt({ weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const dayMonth = fmt({ weekday: "long", month: "long", day: "numeric" });
  const monthName = fmt({ month: "long" });
  const toMinutes = (time) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3));
  // "17:30" -> "5:30 p.m.", "08:00" -> "8 a.m."
  function clock(time) {
    const [h, m] = time.split(":").map(Number);
    return `${((h + 11) % 12) + 1}${m ? ":" + String(m).padStart(2, "0") : ""} ${h < 12 ? "a.m." : "p.m."}`;
  }

  // Short-lived status messages for screen readers.
  function announce(element, message) {
    if (!element) return;
    element.textContent = "";
    setTimeout(() => (element.textContent = message), 30);
  }

  // Shared form helpers: show or clear one field's error.
  function setError(form, name, message) {
    const slot = $(`[data-error-for="${name}"]`, form);
    const input = form.elements[name];
    if (slot) slot.textContent = message || "";
    if (input && input.setAttribute) {
      if (message) input.setAttribute("aria-invalid", "true");
      else input.removeAttribute("aria-invalid");
    }
    return !message;
  }
  function focusFirstError(form) {
    const bad = $('[aria-invalid="true"]', form);
    if (bad) bad.focus();
  }
  const reference = (prefix) => {
    const letters = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
    let out = "";
    for (let i = 0; i < 4; i++) out += letters[Math.floor(Math.random() * letters.length)];
    return `${prefix}-${out}`;
  };

  /* ---------- 3. Theme, menu, reveals, footer year ---------- */

  function initTheme() {
    const root = document.documentElement;
    const meta = $('meta[name="theme-color"]');
    // The head script reads localStorage directly; when it's blocked, restore a choice made in this page view.
    const saved = safeStorage.getItem(STORAGE_KEYS.theme);
    if (saved === "dark") root.classList.add("dark");
    if (saved === "light") root.classList.remove("dark");
    function sync() {
      const dark = root.classList.contains("dark");
      $$("[data-theme-toggle]").forEach((button) => {
        button.setAttribute("aria-pressed", String(dark));
        $("[data-icon-moon]", button).classList.toggle("hidden", dark);
        $("[data-icon-sun]", button).classList.toggle("hidden", !dark);
      });
      if (meta) meta.setAttribute("content", dark ? "#151310" : "#fbf3e4");
    }
    $$("[data-theme-toggle]").forEach((button) =>
      button.addEventListener("click", () => {
        const dark = root.classList.toggle("dark");
        safeStorage.setItem(STORAGE_KEYS.theme, dark ? "dark" : "light");
        sync();
      }),
    );
    sync();
  }

  function initMenu() {
    const toggle = $("#menu-toggle"),
      menu = $("#mobile-menu");
    if (!toggle || !menu) return;
    function set(open, returnFocus = false) {
      menu.hidden = !open;
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      $("[data-icon-open]", toggle).classList.toggle("hidden", open);
      $("[data-icon-close]", toggle).classList.toggle("hidden", !open);
      if (open) $("a", menu).focus();
      else if (returnFocus) toggle.focus();
    }
    toggle.addEventListener("click", () => set(menu.hidden));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !menu.hidden) set(false, true);
    });
    matchMedia("(min-width: 1280px)").addEventListener("change", (event) => {
      if (event.matches) set(false);
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

  function initDates() {
    $$("[data-year]").forEach((element) => (element.textContent = TODAY.slice(0, 4)));
    // "Coming next" months on the changelog: the month N months after this one.
    $$("[data-months-ahead]").forEach((element) => {
      const n = Number(element.getAttribute("data-months-ahead")) || 0;
      const [y, m] = TODAY.split("-").map(Number);
      element.textContent = monthName.format(new Date(Date.UTC(y, m - 1 + n, 15)));
    });
  }

  /* ---------- 4. Home: the live form builder ---------- */

  const { FIELD_TYPES, FIELD_ORDER, MAX_FIELDS, BUILDER_DEFAULT } = DATA;

  // Make stored or default builder state safe to use: known types only, short strings, at most MAX_FIELDS.
  function cleanBuilder(raw) {
    const source = raw && typeof raw === "object" && Array.isArray(raw.fields) ? raw : BUILDER_DEFAULT;
    const title =
      typeof source.title === "string" && source.title.trim() ? source.title.slice(0, 48) : BUILDER_DEFAULT.title;
    const fields = source.fields
      .filter((field) => field && own(FIELD_TYPES, field.type))
      .slice(0, MAX_FIELDS)
      .map((field, index) => ({
        id: "f" + (index + 1),
        type: field.type,
        label: typeof field.label === "string" ? field.label.slice(0, 60) : FIELD_TYPES[field.type].label,
        required: field.required === true,
      }));
    return { title, fields };
  }

  const ICONS = {
    up: '<svg viewBox="0 0 20 20" class="size-4" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 5-5 5 5"/></svg>',
    down: '<svg viewBox="0 0 20 20" class="size-4" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 8 5 5 5-5"/></svg>',
    remove:
      '<svg viewBox="0 0 20 20" class="size-4" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="m5 5 10 10M15 5 5 15"/></svg>',
    plus: '<svg viewBox="0 0 20 20" class="size-3.5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M10 4v12M4 10h12"/></svg>',
  };

  function initBuilder() {
    const root = $("[data-builder]");
    if (!root) return;
    const list = $("[data-builder-list]", root);
    const addBox = $("[data-builder-add]", root);
    const preview = $("[data-builder-preview]", root);
    const titleInput = $("[data-builder-title]", root);
    const status = $("[data-builder-status]", root);
    let state = cleanBuilder(readJSON(STORAGE_KEYS.builder));
    let nextId = state.fields.length + 1;
    let answers = {};
    let touched = {};
    let submitted = null; // response number once the preview form has been sent

    const save = () =>
      writeJSON(STORAGE_KEYS.builder, {
        title: state.title,
        fields: state.fields.map(({ type, label, required }) => ({ type, label, required })),
      });

    addBox.innerHTML = FIELD_ORDER.map(
      (type) =>
        `<button type="button" class="btn btn-sm btn-plain min-h-9! gap-1! px-2.5! text-[13px]!" data-add-field="${type}">${ICONS.plus}${esc(FIELD_TYPES[type].name)}</button>`,
    ).join("");

    function renderEditor() {
      const count = state.fields.length;
      list.innerHTML =
        state.fields
          .map((field, index) => {
            const type = FIELD_TYPES[field.type];
            const n = index + 1;
            return `<li class="overflow-hidden rounded-lg border-[2.5px] border-line bg-card" data-field-id="${field.id}">
  <div class="flex items-center gap-1.5 border-b-2 border-line ${accentBg(type.accent)} py-1 pr-1 pl-2.5 text-coal">
    <span class="font-mono text-xs font-semibold">${n} &middot; ${esc(type.name)}</span>
    <span class="ml-auto flex gap-1">
      <button type="button" class="icon-btn size-7! rounded-md! border-2! border-coal! bg-cream! text-coal! shadow-none!" data-move="-1" aria-label="Move question ${n} up"${index === 0 ? " disabled" : ""}>${ICONS.up}</button>
      <button type="button" class="icon-btn size-7! rounded-md! border-2! border-coal! bg-cream! text-coal! shadow-none!" data-move="1" aria-label="Move question ${n} down"${index === count - 1 ? " disabled" : ""}>${ICONS.down}</button>
      <button type="button" class="icon-btn size-7! rounded-md! border-2! border-coal! bg-cream! text-coal! shadow-none!" data-remove aria-label="Remove question ${n}">${ICONS.remove}</button>
    </span>
  </div>
  <div class="flex items-center gap-2 p-2">
    <input class="field mt-0! min-h-9! px-2! py-1! text-sm" type="text" maxlength="60" value="${esc(field.label)}" aria-label="Question ${n} wording" data-label-input>
    <button type="button" class="flex shrink-0 items-center gap-1.5 text-xs font-bold" aria-pressed="${field.required}" data-required>Required<span class="sr-only"> (question ${n})</span><span class="switch" aria-hidden="true"></span></button>
  </div>
</li>`;
          })
          .join("") ||
        '<li class="rounded-lg border-[2.5px] border-dashed border-line p-4 text-center text-sm font-semibold">No questions yet. Add one below.</li>';
      $$("[data-add-field]", addBox).forEach((button) => (button.disabled = count >= MAX_FIELDS));
      $("[data-field-count]", root).textContent = plural(count, "field");
      $("[data-builder-slug]", root).textContent = slugify(state.title);
    }

    // Is this answer acceptable? Returns an error message or "".
    function problem(field) {
      const value = answers[field.id];
      const empty = value === undefined || value === "" || value === false;
      if (empty) return field.required ? "This question is required." : "";
      if (field.type === "email" && !EMAIL_RE.test(String(value).trim()))
        return "Enter an email like name@company.example.";
      if (field.type === "phone" && String(value).replace(/\D/g, "").length < 10)
        return "Enter a 10-digit phone number.";
      return "";
    }

    function fieldHtml(field) {
      const type = FIELD_TYPES[field.type];
      const id = "pv-" + field.id;
      const value = answers[field.id];
      const req = field.required
        ? ' <span class="text-tomato" aria-hidden="true">*</span><span class="sr-only">(required)</span>'
        : "";
      const err = `<span id="${id}-err" class="error" data-preview-error="${field.id}"></span>`;
      const label = esc(field.label || type.label);
      if (field.type === "choice" || field.type === "rating") {
        const options = field.type === "choice" ? type.options : ["1", "2", "3", "4", "5"];
        return `<fieldset data-preview-field="${field.id}" aria-describedby="${id}-err"><legend class="label">${label}${req}</legend>
  <div class="mt-2 flex flex-wrap gap-1.5">${options
    .map(
      (option, i) =>
        `<label class="chip min-h-9! px-3! text-sm${field.type === "rating" ? " w-10 justify-center px-0!" : ""}"><input class="sr-only" type="radio" name="${id}" value="${esc(option)}"${value === option ? " checked" : ""}>${field.type === "rating" ? `${i + 1}<span class="sr-only"> out of 5</span>` : esc(option)}</label>`,
    )
    .join("")}</div>${err}</fieldset>`;
      }
      if (field.type === "consent") {
        return `<div data-preview-field="${field.id}"><label class="flex items-start gap-2.5 font-semibold"><input id="${id}" type="checkbox" class="mt-0.5 size-5 shrink-0 accent-tomato"${value ? " checked" : ""} aria-describedby="${id}-err">${label}${req}</label>${err}</div>`;
      }
      const input =
        field.type === "long"
          ? `<textarea id="${id}" class="field min-h-20" rows="2" placeholder="${esc(type.placeholder)}" aria-describedby="${id}-err">${esc(value || "")}</textarea>`
          : `<input id="${id}" class="field" type="${{ email: "email", phone: "tel", date: "date" }[field.type] || "text"}" value="${esc(value || "")}"${type.placeholder ? ` placeholder="${esc(type.placeholder)}"` : ""} autocomplete="off" aria-describedby="${id}-err">`;
      return `<div data-preview-field="${field.id}"><label class="label" for="${id}">${label}${req}</label>${input}${err}</div>`;
    }

    function updateValidation() {
      let needed = 0,
        done = 0;
      state.fields.forEach((field) => {
        const message = problem(field);
        if (field.required) {
          needed++;
          if (!message) done++;
        }
        const slot = $(`[data-preview-error="${field.id}"]`, preview);
        if (!slot) return;
        const show = touched[field.id] ? message : "";
        slot.textContent = show;
        const input = $(`#pv-${field.id}`, preview);
        if (input) {
          if (show) input.setAttribute("aria-invalid", "true");
          else input.removeAttribute("aria-invalid");
        }
      });
      const bar = $("[data-preview-bar]", preview);
      const text = $("[data-preview-progress]", preview);
      if (bar) bar.style.width = needed ? `${Math.round((done / needed) * 100)}%` : "100%";
      if (text) text.textContent = needed ? `${done} of ${needed} required answered` : "No required questions";
    }

    function renderPreview() {
      if (submitted) {
        const name = state.fields.find((f) => f.type === "short" && answers[f.id]);
        preview.innerHTML = `<div class="grid justify-items-start gap-3 rounded-lg border-[2.5px] border-line bg-mint p-5 text-coal" role="status">
  <p class="font-display text-2xl">Response #${submitted} recorded</p>
  <p class="font-semibold">Thanks${name ? ", " + esc(String(answers[name.id]).trim().split(/\s+/)[0]) : ""}! This is the thank-you screen your respondents see.</p>
  <button type="button" class="btn btn-sm btn-plain" data-preview-again>Fill it in again</button>
</div>`;
        return;
      }
      preview.innerHTML = `<form class="grid gap-4" novalidate data-preview-form>
  <h3 class="font-display text-xl leading-tight">${esc(state.title)}</h3>
  <div><div class="h-3 overflow-hidden rounded-full border-2 border-line bg-card"><div class="h-full bg-tomato transition-[width] duration-300" style="width:0%" data-preview-bar></div></div>
  <p class="mt-1 font-mono text-xs font-semibold" data-preview-progress></p></div>
  ${state.fields.map(fieldHtml).join("")}
  <button type="submit" class="btn btn-sm btn-tomato justify-self-start"${state.fields.length ? "" : " disabled"}>Submit</button>
</form>`;
      updateValidation();
    }

    function render() {
      renderEditor();
      renderPreview();
    }

    function commit(message, focusSelector) {
      save();
      render();
      if (message) announce(status, `${message} ${plural(state.fields.length, "field")}.`);
      if (focusSelector) {
        const target = $(focusSelector, root);
        if (target && !target.disabled) target.focus();
      }
    }

    titleInput.value = state.title;
    titleInput.addEventListener("input", () => {
      state.title = titleInput.value.trim() ? titleInput.value.slice(0, 48) : BUILDER_DEFAULT.title;
      save();
      $("[data-builder-slug]", root).textContent = slugify(state.title);
      const heading = $("[data-preview-form] h3", preview);
      if (heading) heading.textContent = state.title;
    });

    addBox.addEventListener("click", (event) => {
      const button = event.target.closest("[data-add-field]");
      if (!button || state.fields.length >= MAX_FIELDS) return;
      const type = button.getAttribute("data-add-field");
      if (!own(FIELD_TYPES, type)) return;
      const id = "f" + nextId++;
      state.fields.push({ id, type, label: FIELD_TYPES[type].label, required: false });
      submitted = null;
      commit(`${FIELD_TYPES[type].name} added.`);
    });

    list.addEventListener("click", (event) => {
      const item = event.target.closest("[data-field-id]");
      if (!item) return;
      const id = item.getAttribute("data-field-id");
      const index = state.fields.findIndex((f) => f.id === id);
      if (index < 0) return;
      const move = event.target.closest("[data-move]");
      if (move) {
        const to = index + Number(move.getAttribute("data-move"));
        if (to < 0 || to >= state.fields.length) return;
        const [field] = state.fields.splice(index, 1);
        state.fields.splice(to, 0, field);
        const dir = move.getAttribute("data-move");
        commit(`Moved to position ${to + 1}.`, `[data-field-id="${id}"] [data-move="${dir}"]`);
        const again = $(`[data-field-id="${id}"] [data-move="${dir}"]`, root);
        if (again && again.disabled) $(`[data-field-id="${id}"] [data-move="${-dir}"]`, root).focus();
        return;
      }
      if (event.target.closest("[data-remove]")) {
        const [field] = state.fields.splice(index, 1);
        delete answers[field.id];
        delete touched[field.id];
        const next = state.fields[Math.min(index, state.fields.length - 1)];
        commit(`${FIELD_TYPES[field.type].name} removed.`, next ? `[data-field-id="${next.id}"] [data-remove]` : "[data-add-field]");
        return;
      }
      if (event.target.closest("[data-required]")) {
        state.fields[index].required = !state.fields[index].required;
        commit(state.fields[index].required ? "Marked required." : "Marked optional.", `[data-field-id="${id}"] [data-required]`);
      }
    });

    list.addEventListener("input", (event) => {
      const input = event.target.closest("[data-label-input]");
      if (!input) return;
      const id = input.closest("[data-field-id]").getAttribute("data-field-id");
      const field = state.fields.find((f) => f.id === id);
      field.label = input.value.slice(0, 60);
      save();
      const block = $(`[data-preview-field="${id}"]`, preview);
      const target = block && $("legend, label", block);
      if (target && target.firstChild) target.firstChild.nodeValue = field.label || FIELD_TYPES[field.type].label;
    });

    function readAnswer(target) {
      const block = target.closest("[data-preview-field]");
      if (!block) return;
      const id = block.getAttribute("data-preview-field");
      answers[id] = target.type === "checkbox" ? target.checked : target.value;
      touched[id] = true;
      updateValidation();
    }
    preview.addEventListener("input", (event) => readAnswer(event.target));
    preview.addEventListener("change", (event) => readAnswer(event.target));
    preview.addEventListener("submit", (event) => {
      event.preventDefault();
      state.fields.forEach((f) => (touched[f.id] = true));
      updateValidation();
      if (state.fields.some((f) => problem(f))) {
        const bad = $('[aria-invalid="true"], fieldset:has(.error:not(:empty)) input', preview);
        if (bad) bad.focus();
        return;
      }
      submitted = 128 + Math.floor(Math.random() * 40);
      renderPreview();
    });
    preview.addEventListener("click", (event) => {
      if (!event.target.closest("[data-preview-again]")) return;
      submitted = null;
      answers = {};
      touched = {};
      renderPreview();
      const first = $("input, textarea", preview);
      if (first) first.focus();
    });

    $("[data-builder-reset]", root).addEventListener("click", () => {
      state = cleanBuilder(BUILDER_DEFAULT);
      nextId = state.fields.length + 1;
      answers = {};
      touched = {};
      submitted = null;
      titleInput.value = state.title;
      safeStorage.removeItem(STORAGE_KEYS.builder);
      render();
      announce(status, `Builder reset. ${plural(state.fields.length, "field")}.`);
    });

    render();
  }

  /* ---------- 5. Templates ---------- */

  const { TEMPLATES, TEMPLATE_CATEGORIES } = DATA;
  const TEMPLATE_MAP = Object.fromEntries(TEMPLATES.map((t) => [t.id, t]));

  function readSaved() {
    const raw = readJSON(STORAGE_KEYS.saved);
    return Array.isArray(raw) ? [...new Set(raw.filter((id) => own(TEMPLATE_MAP, id)))] : [];
  }
  let saved = readSaved();

  // A field's kind, from the hint in brackets in data.js ("Shift (choice)").
  function fieldKind(label) {
    const hint = (/\(([^)]+)\)/.exec(label) || [])[1] || "";
    if (/payment/.test(hint)) return "payment";
    if (/upload/.test(hint)) return "upload";
    if (/rating|0–10/.test(hint)) return "rating";
    if (/checkbox/.test(hint)) return "checkbox";
    if (/date/.test(hint)) return "date";
    if (/choice/.test(hint)) return "choice";
    if (/logic|if /.test(hint)) return "logic";
    return "text";
  }
  const KIND_NAMES = {
    payment: "Payment",
    upload: "File upload",
    rating: "Rating",
    checkbox: "Checkbox",
    date: "Date",
    choice: "Choice",
    logic: "Shown by logic",
    text: "Text",
  };

  // A sticker in the thumbnail's corner for each category (drawn in a 52×52 box).
  const CATEGORY_BADGES = {
    events: '<path d="M12 18h28v6a4 4 0 0 0 0 8v6H12v-6a4 4 0 0 0 0-8z"/><path d="M30 18v20" stroke-dasharray="3 3"/>',
    feedback: '<path d="M12 14h28v18H24l-8 6v-6h-4z"/><path d="M19 23h14"/>',
    hr: '<rect x="12" y="19" width="28" height="19" rx="3"/><path d="M21 19v-4h10v4M12 27h28"/>',
    education: '<path d="m10 22 16-8 16 8-16 8z"/><path d="M17 26v8c5 4 13 4 18 0v-8M42 22v9"/>',
    leads: '<circle cx="26" cy="26" r="13"/><circle cx="26" cy="26" r="6"/><circle cx="26" cy="26" r="1.5" fill="#16130f"/>',
    orders: '<path d="M14 20h24l-2 18H16z"/><path d="M20 20c0-8 12-8 12 0"/>',
    nonprofit: '<path d="M26 38s-13-7-13-16a7 7 0 0 1 13-3 7 7 0 0 1 13 3c0 9-13 16-13 16z"/>',
  };

  // The thumbnail: a little form on the template's accent color, drawn from its first four fields.
  function templateArt(template) {
    const rows = template.fields
      .slice(0, 4)
      .map((label, i) => {
        const y = 46 + i * 30;
        const w = Math.min(130, 28 + label.replace(/\s*\(.*\)/, "").length * 5);
        const kind = fieldKind(label);
        let input = `<rect x="66" y="${y + 8}" width="168" height="14" rx="3" fill="#fffaf1" stroke="#16130f" stroke-width="2"/>`;
        if (kind === "choice")
          input = [0, 1, 2].map((k) => `<circle cx="${74 + k * 46}" cy="${y + 15}" r="6" fill="${k ? "#fffaf1" : "#16130f"}" stroke="#16130f" stroke-width="2"/><rect x="${84 + k * 46}" y="${y + 12}" width="24" height="6" rx="2" fill="#16130f" opacity=".35"/>`).join("");
        if (kind === "rating")
          input = [0, 1, 2, 3, 4].map((k) => `<rect x="${66 + k * 22}" y="${y + 8}" width="16" height="14" rx="3" fill="${k < 4 ? ACCENT_HEX[template.accent] : "#fffaf1"}" stroke="#16130f" stroke-width="2"/>`).join("");
        if (kind === "payment")
          input = `<rect x="66" y="${y + 6}" width="60" height="18" rx="3" fill="#16130f"/><rect x="72" y="${y + 11}" width="12" height="8" rx="1" fill="#ffd84a"/><rect x="132" y="${y + 8}" width="102" height="14" rx="3" fill="#fffaf1" stroke="#16130f" stroke-width="2"/>`;
        if (kind === "upload")
          input = `<rect x="66" y="${y + 6}" width="168" height="18" rx="3" fill="none" stroke="#16130f" stroke-width="2" stroke-dasharray="5 4"/><path d="M150 ${y + 20}v-9m-4 4 4-4 4 4" stroke="#16130f" stroke-width="2" fill="none"/>`;
        if (kind === "checkbox")
          input = `<rect x="66" y="${y + 8}" width="14" height="14" rx="2" fill="#16130f"/><rect x="86" y="${y + 12}" width="90" height="6" rx="2" fill="#16130f" opacity=".35"/>`;
        if (kind === "date")
          input = `<rect x="66" y="${y + 8}" width="100" height="14" rx="3" fill="#fffaf1" stroke="#16130f" stroke-width="2"/><rect x="146" y="${y + 8}" width="20" height="14" fill="#16130f"/>`;
        return `<rect x="66" y="${y}" width="${w}" height="5" rx="2" fill="#16130f"/>${input}`;
      })
      .join("");
    const badge = own(CATEGORY_BADGES, template.cat) ? CATEGORY_BADGES[template.cat] : "";
    return `<svg viewBox="0 0 300 170" class="block w-full" aria-hidden="true"><rect width="300" height="170" fill="${ACCENT_HEX[template.accent] || "#ffd84a"}"/><path d="M0 34h300M0 68h300M0 102h300M0 136h300M50 0v170M100 0v170M150 0v170M200 0v170M250 0v170" stroke="#16130f" stroke-opacity=".1" stroke-width="2"/><rect x="54" y="20" width="200" height="170" rx="8" fill="#16130f"/><rect x="50" y="16" width="200" height="170" rx="8" fill="#fffaf1" stroke="#16130f" stroke-width="2.5"/><rect x="66" y="28" width="${Math.min(150, template.name.length * 8)}" height="9" rx="2" fill="#16130f"/>${rows}<g transform="translate(236 14) rotate(8 26 26)"><circle cx="28" cy="28" r="24" fill="#16130f"/><circle cx="26" cy="26" r="24" fill="#fffaf1" stroke="#16130f" stroke-width="2.5"/><g fill="none" stroke="#16130f" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">${badge}</g></g></svg>`;
  }

  function saveButton(template, extra = "") {
    const on = saved.includes(template.id);
    return `<button type="button" class="icon-btn size-10! aria-pressed:bg-butter! aria-pressed:text-coal! ${extra}" aria-pressed="${on}" aria-label="Save ${esc(template.name)}" data-save="${template.id}"><svg viewBox="0 0 20 20" class="size-5" fill="${on ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" aria-hidden="true" data-save-icon><path d="M5 2.5h10v15l-5-3.5-5 3.5z"/></svg></button>`;
  }

  function templateCard(template, { linkOut = false } = {}) {
    const cat = TEMPLATE_CATEGORIES[template.cat];
    const title = linkOut
      ? `<a href="templates.html?preview=${template.id}" class="hover:underline hover:decoration-[3px] hover:underline-offset-4">${esc(template.name)}</a>`
      : `<button type="button" class="text-left hover:underline hover:decoration-[3px] hover:underline-offset-4" data-tpl-open="${template.id}">${esc(template.name)}</button>`;
    return `<li><article class="card flex h-full flex-col overflow-hidden">
  <div class="border-b-[2.5px] border-line">${templateArt(template)}</div>
  <div class="flex flex-1 flex-col p-5">
    <div class="flex items-start justify-between gap-3">
      <div><p class="font-mono text-xs font-semibold text-ink-soft uppercase">${esc(cat)}</p><h3 class="mt-1 text-xl font-extrabold">${title}</h3></div>
      ${linkOut ? "" : saveButton(template)}
    </div>
    <p class="mt-2 flex-1 text-ink-soft">${esc(template.desc)}</p>
    <p class="mt-4 font-mono text-xs font-semibold">${plural(template.fields.length, "field")} &middot; used by ${num(template.uses)} teams</p>
  </div>
</article></li>`;
  }

  function initFeaturedTemplates() {
    const list = $("[data-featured-templates]");
    if (!list) return;
    const ids = list.getAttribute("data-featured-templates").split(/\s+/).filter((id) => own(TEMPLATE_MAP, id));
    list.innerHTML = ids.map((id) => templateCard(TEMPLATE_MAP[id], { linkOut: true })).join("");
  }

  function setSaved(next) {
    saved = next;
    writeJSON(STORAGE_KEYS.saved, saved);
    $$("[data-saved-count]").forEach((element) => (element.textContent = String(saved.length)));
    $$("[data-save]").forEach((button) => {
      const on = saved.includes(button.getAttribute("data-save"));
      button.setAttribute("aria-pressed", String(on));
      const icon = $("[data-save-icon]", button);
      if (icon) icon.setAttribute("fill", on ? "currentColor" : "none");
    });
  }
  function toggleSaved(id) {
    if (!own(TEMPLATE_MAP, id)) return;
    setSaved(saved.includes(id) ? saved.filter((s) => s !== id) : saved.concat(id));
  }

  function initTemplates() {
    const grid = $("[data-tpl-grid]");
    if (!grid) return;
    const search = $("[data-tpl-search]");
    const count = $("[data-tpl-count]");
    const empty = $("[data-tpl-empty]");
    const dialog = $("[data-tpl-dialog]");
    const validCat = (value) => value === "all" || value === "saved" || own(TEMPLATE_CATEGORIES, value);
    let cat = validCat(params.get("cat")) ? params.get("cat") : "all";
    let query = (params.get("q") || "").slice(0, 60);
    search.value = query;
    const radio = $(`input[name="tpl-cat"][value="${cat}"]`);
    if (radio) radio.checked = true;

    function syncUrl() {
      const next = new URLSearchParams();
      if (cat !== "all") next.set("cat", cat);
      if (query.trim()) next.set("q", query.trim());
      const qs = next.toString();
      history.replaceState(null, "", location.pathname + (qs ? "?" + qs : "") + location.hash);
    }

    function render() {
      const words = query.toLowerCase().split(/\s+/).filter(Boolean);
      const shown = TEMPLATES.filter((t) => {
        if (cat === "saved" && !saved.includes(t.id)) return false;
        if (cat !== "all" && cat !== "saved" && t.cat !== cat) return false;
        const hay = [t.name, t.desc, TEMPLATE_CATEGORIES[t.cat], ...t.fields].join(" ").toLowerCase();
        return words.every((w) => hay.includes(w));
      });
      grid.innerHTML = shown.map((t) => templateCard(t)).join("");
      count.textContent = plural(shown.length, "template");
      empty.hidden = shown.length > 0;
      const noneSaved = cat === "saved" && !saved.length;
      $("[data-tpl-empty-title]").textContent = noneSaved ? "Nothing saved yet." : "No templates match that.";
      $("[data-tpl-empty-text]").textContent = noneSaved
        ? "Tap the bookmark on any template to keep it on your shortlist."
        : "Try a shorter word, or pick another category. You can also start from a blank form.";
    }

    search.addEventListener("input", () => {
      query = search.value.slice(0, 60);
      render();
      syncUrl();
    });
    $("[data-tpl-chips]").addEventListener("change", (event) => {
      if (!validCat(event.target.value)) return;
      cat = event.target.value;
      render();
      syncUrl();
    });
    $("[data-tpl-reset]").addEventListener("click", () => {
      cat = "all";
      query = "";
      search.value = "";
      $('input[name="tpl-cat"][value="all"]').checked = true;
      render();
      syncUrl();
      search.focus();
    });

    let opener = null;
    function openPreview(id, from) {
      if (!own(TEMPLATE_MAP, id) || !dialog.showModal) return;
      const t = TEMPLATE_MAP[id];
      opener = from || null;
      $("[data-tpl-dialog-cat]", dialog).textContent = TEMPLATE_CATEGORIES[t.cat];
      $("[data-tpl-dialog-cat]", dialog).className = `sticker ${accentBg(t.accent)}`;
      $("[data-tpl-dialog-name]", dialog).textContent = t.name;
      $("[data-tpl-dialog-desc]", dialog).textContent = t.desc;
      $("[data-tpl-dialog-uses]", dialog).textContent = `${plural(t.fields.length, "field")} · used by ${num(t.uses)} teams`;
      $("[data-tpl-dialog-fields]", dialog).innerHTML = t.fields
        .map((label, i) => {
          const kind = fieldKind(label);
          return `<li class="flex items-center gap-3 rounded-lg border-2 border-line bg-card px-3 py-2.5"><span class="grid size-7 shrink-0 place-items-center rounded-md border-2 border-line ${accentBg(t.accent)} font-mono text-sm font-semibold text-coal">${i + 1}</span><span class="min-w-0 flex-1 font-semibold">${esc(label.replace(/\s*\(.*\)/, ""))}</span><span class="shrink-0 rounded-full border-2 border-line px-2 py-0.5 font-mono text-xs font-semibold">${KIND_NAMES[kind]}</span></li>`;
        })
        .join("");
      const saveBtn = $("[data-tpl-dialog-save]", dialog);
      saveBtn.setAttribute("data-save", t.id);
      saveBtn.setAttribute("aria-pressed", String(saved.includes(t.id)));
      saveBtn.textContent = saved.includes(t.id) ? "Saved" : "Save";
      $("[data-tpl-dialog-use]", dialog).href = `signup.html?template=${t.id}`;
      dialog.showModal();
    }
    dialog.addEventListener("close", () => {
      if (opener && document.contains(opener)) opener.focus();
    });
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog || event.target.closest("[data-tpl-close]")) dialog.close();
    });
    $("[data-tpl-dialog-save]", dialog).addEventListener("click", (event) => {
      const button = event.currentTarget;
      toggleSaved(button.getAttribute("data-save"));
      button.textContent = button.getAttribute("aria-pressed") === "true" ? "Saved" : "Save";
      if (cat === "saved") render();
    });

    grid.addEventListener("click", (event) => {
      const save = event.target.closest("[data-save]");
      if (save) {
        toggleSaved(save.getAttribute("data-save"));
        if (cat === "saved") {
          render();
          search.focus();
        }
        return;
      }
      const open = event.target.closest("[data-tpl-open]");
      if (open) openPreview(open.getAttribute("data-tpl-open"), open);
    });

    render();
    setSaved(saved);
    // ?preview=<template id> opens that template's preview (the home page links here).
    const preview = params.get("preview");
    if (own(TEMPLATE_MAP, preview)) {
      const button = $(`[data-tpl-open="${preview}"]`, grid);
      openPreview(preview, button);
    }
  }

  /* ---------- 6. Features ---------- */

  function initSectionNav() {
    const nav = $("[data-section-nav]");
    if (!nav || !("IntersectionObserver" in window)) return;
    const links = $$("a", nav);
    const sections = links.map((a) => $(a.getAttribute("href"))).filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.forEach((a) =>
            a.getAttribute("href") === "#" + entry.target.id
              ? a.setAttribute("aria-current", "true")
              : a.removeAttribute("aria-current"),
          );
        });
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    sections.forEach((s) => observer.observe(s));
  }

  function initLogicDemo() {
    const demo = $("[data-logic-demo]");
    if (!demo) return;
    const form = $("[data-logic-form]", demo);
    const { TICKETS, ADDON_TSHIRT } = DATA;
    function update() {
      const attend = form.elements.attend.value;
      const ticket = own(TICKETS, form.elements.ticket.value) ? form.elements.ticket.value : "general";
      const inPerson = attend === "inperson";
      const rules = { r1: inPerson, r2: inPerson, r3: inPerson && ticket === "student", r4: attend === "online" };
      Object.keys(rules).forEach((rule) => {
        $$(`[data-show="${rule}"]`, form).forEach((element) => (element.hidden = !rules[rule]));
        const item = $(`[data-rule="${rule}"]`, demo);
        item.classList.toggle("bg-mint", rules[rule]);
        item.classList.toggle("text-coal", rules[rule]);
        item.classList.toggle("bg-card", !rules[rule]);
        item.classList.toggle("opacity-60", !rules[rule]);
      });
      const on = Object.values(rules).filter(Boolean).length;
      $("[data-rules-count]", demo).textContent = `${on} of 4 rules on`;
      const total = (inPerson ? TICKETS[ticket].price : 0) + (form.elements.tshirt.checked ? ADDON_TSHIRT : 0);
      $("[data-logic-total]", demo).textContent = money(total, true);
    }
    form.addEventListener("change", update);
    form.addEventListener("submit", (event) => event.preventDefault());
    update();
  }

  function initAnalytics() {
    const card = $("[data-analytics]");
    if (!card) return;
    const list = $("[data-dropoff]", card);
    function show(range) {
      if (!own(ANALYTICS.ranges, range)) return;
      const r = ANALYTICS.ranges[range];
      $$("[data-range]", card).forEach((b) => b.setAttribute("aria-pressed", String(b.getAttribute("data-range") === range)));
      $('[data-stat="views"]', card).textContent = num(r.views);
      $('[data-stat="starts"]', card).textContent = num(r.starts);
      $('[data-stat="finishes"]', card).textContent = num(r.finishes);
      $('[data-stat="rate"]', card).textContent = Math.round((r.finishes / r.starts) * 100) + "%";
      // The biggest fall between two questions is flagged.
      let worst = 1;
      r.reached.forEach((p, i) => {
        if (i && r.reached[i - 1] - p > r.reached[worst - 1] - r.reached[worst]) worst = i;
      });
      list.innerHTML = ANALYTICS.questions
        .map((q, i) => {
          const flagged = i === worst;
          return `<li class="grid grid-cols-[7.5rem_minmax(0,1fr)_3rem] items-center gap-3 text-sm sm:grid-cols-[9rem_minmax(0,1fr)_3rem]"><span class="truncate font-semibold">${esc(q)}</span><span class="h-5 rounded-sm border-2 border-line bg-card"><span class="block h-full ${flagged ? "bg-tomato" : "bg-peri"}" style="width:${r.reached[i]}%"></span></span><span class="text-right font-mono font-semibold">${r.reached[i]}%</span>${flagged ? `<span class="col-span-3 -mt-1 font-mono text-xs font-semibold">&uarr; ${r.reached[i - 1] - r.reached[i]} points lost here. Make it optional?</span>` : ""}</li>`;
        })
        .join("");
    }
    card.addEventListener("click", (event) => {
      const button = event.target.closest("[data-range]");
      if (button) show(button.getAttribute("data-range"));
    });
    show("30");
  }

  /* ---------- 8 (shared). Integration logos ---------- */

  const { INTEGRATIONS, INTEGRATION_CATEGORIES } = DATA;
  // A simple drawn mark for each integration, in a 40×40 box.
  const GLYPHS = {
    wave: '<path d="M6 16c5-6 9-6 14 0s9 6 14 0M6 26c5-6 9-6 14 0s9 6 14 0"/>',
    leaf: '<path d="M8 32C8 18 16 9 32 8c0 15-8 24-24 24zM8 32l14-14"/>',
    coin: '<circle cx="20" cy="20" r="12"/><path d="M20 13v14M16 17h6a3 3 0 0 1 0 6h-6"/>',
    bird: '<path d="M8 24c4 6 14 8 20 2l6-10-6 1c-3-6-11-6-12 2l-8 5z"/><circle cx="24" cy="15" r="1.5" fill="#16130f"/>',
    stripes: '<rect x="8" y="8" width="24" height="24" rx="4"/><path d="M8 16 16 8M8 26 26 8M14 32 32 14M24 32l8-8"/>',
    stack: '<path d="m20 8 13 7-13 7-13-7z"/><path d="m7 21 13 7 13-7M7 27l13 7 13-7"/>',
    envelope: '<rect x="7" y="11" width="26" height="18" rx="3"/><path d="m8 13 12 9 12-9"/>',
    grid: '<rect x="8" y="8" width="24" height="24" rx="3"/><path d="M8 16h24M8 24h24M16 8v24M24 8v24"/>',
    fold: '<path d="M10 7h14l7 7v19H10z"/><path d="M24 7v7h7M15 21h11M15 26h8"/>',
    box: '<path d="M7 14 20 8l13 6v14l-13 6-13-6z"/><path d="m7 14 13 6 13-6M20 20v14"/>',
    bubble: '<path d="M8 10h24v15H18l-7 6v-6H8z"/><path d="M14 17h12"/>',
    bell: '<path d="M12 27V18a8 8 0 0 1 16 0v9l3 3H9zM17 33h6"/>',
    bolt: '<path d="M22 6 10 22h9l-2 12 13-17h-9z"/>',
    hook: '<path d="M20 6v16a6 6 0 1 1-6-6"/><circle cx="20" cy="6" r="2"/>',
    lantern: '<path d="M15 10h10M16 10l-3 6v12l3 4h8l3-4V16l-3-6M20 6v4"/><path d="M17 22h6"/>',
    calendar: '<rect x="8" y="10" width="24" height="22" rx="3"/><path d="M8 17h24M14 7v6M26 7v6"/><rect x="13" y="21" width="5" height="5" fill="#16130f"/>',
    board: '<rect x="7" y="8" width="26" height="24" rx="3"/><path d="M16 8v24M25 8v24"/><rect x="9.5" y="12" width="4" height="5" fill="#16130f"/><rect x="18.5" y="12" width="4" height="9" fill="#16130f"/>',
    pen: '<path d="m10 30 3-9 13-13 6 6-13 13zM8 33h24"/>',
    bars: '<path d="M8 32h24"/><rect x="10" y="20" width="5" height="12"/><rect x="18" y="12" width="5" height="20"/><rect x="26" y="16" width="5" height="16"/>',
    whistle: '<path d="M8 18h17a7 7 0 1 1-6 10H12a4 4 0 0 1-4-4z"/><path d="M24 18v-5h7"/>',
  };
  function glyph(item, size = "size-12") {
    const paths = own(GLYPHS, item.glyph) ? GLYPHS[item.glyph] : GLYPHS.box;
    return `<svg viewBox="0 0 40 40" class="${size} shrink-0 rounded-lg border-[2.5px] border-line" aria-hidden="true"><rect width="40" height="40" fill="${ACCENT_HEX[item.accent] || "#ffd84a"}"/><g fill="none" stroke="#16130f" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">${paths}</g></svg>`;
  }

  function initIntegrationStrip() {
    const strip = $("[data-integration-strip]");
    if (!strip) return;
    const map = Object.fromEntries(INTEGRATIONS.map((i) => [i.id, i]));
    strip.innerHTML = strip
      .getAttribute("data-integration-strip")
      .split(/\s+/)
      .filter((id) => own(map, id))
      .map(
        (id) =>
          `<li><a href="integrations.html?q=${encodeURIComponent(map[id].name)}" class="card flex flex-col items-center gap-3 p-4 text-center font-extrabold transition-transform hover:-translate-y-1">${glyph(map[id])}${esc(map[id].name)}<span class="font-mono text-xs font-semibold text-ink-soft">${esc(INTEGRATION_CATEGORIES[map[id].cat])}</span></a></li>`,
      )
      .join("");
  }

  /* ---------- 7. Pricing calculator ---------- */

  const { PLANS, VOLUME_STEPS, DEFAULT_VOLUME, ANNUAL_DISCOUNT } = DATA;

  // Monthly price of a plan at a volume, before any annual discount; null when the plan can't take it.
  function planMonthly(id, volume) {
    const plan = PLANS[id];
    if (volume > plan.max) return null;
    const over = Math.max(0, volume - plan.included);
    return plan.base + (over ? Math.ceil(over / plan.block) * plan.extra : 0);
  }
  const shown = (monthly, billing) => (billing === "annual" ? Math.round(monthly * (1 - ANNUAL_DISCOUNT)) : monthly);

  function initPricing() {
    const root = $("[data-pricing]");
    if (!root) return;
    const range = $("[data-volume]", root);
    const stored = readJSON(STORAGE_KEYS.pricing) || {};
    const stepOf = (value) => VOLUME_STEPS.indexOf(Number(value));
    let billing = ["monthly", "annual"].includes(params.get("billing"))
      ? params.get("billing")
      : ["monthly", "annual"].includes(stored.billing)
        ? stored.billing
        : "annual";
    let step = stepOf(params.get("responses"));
    if (step < 0) step = stepOf(stored.responses);
    if (step < 0) step = stepOf(DEFAULT_VOLUME);
    range.value = String(step);
    $(`input[name="billing"][value="${billing}"]`, root).checked = true;

    // A "Best fit" sticker on each plan card, shown on the recommended one.
    $$("[data-plan]", root).forEach((card) => {
      card.classList.add("relative");
      card.insertAdjacentHTML(
        "afterbegin",
        '<p class="sticker absolute -top-4 right-4 rotate-3 bg-mint!" data-best hidden>Best fit</p>',
      );
    });

    function render() {
      const volume = VOLUME_STEPS[step];
      const label = num(volume);
      $("[data-volume-out]", root).textContent = label;
      range.setAttribute("aria-valuetext", `${label} responses a month`);
      let best = null;
      Object.keys(PLANS).forEach((id) => {
        const monthly = planMonthly(id, volume);
        const card = $(`[data-plan="${id}"]`, root);
        const price = $(`[data-price="${id}"]`, root);
        const note = $(`[data-plan-note="${id}"]`, root);
        card.classList.toggle("border-dashed", monthly === null);
        card.classList.toggle("shadow-none", monthly === null);
        if (monthly === null) {
          price.textContent = "—";
          note.textContent = `Up to ${num(PLANS[id].max)} responses a month`;
          return;
        }
        const amount = shown(monthly, billing);
        price.textContent = money(amount);
        const blocks = volume > PLANS[id].included ? Math.ceil((volume - PLANS[id].included) / PLANS[id].block) : 0;
        if (!amount) note.textContent = `${num(PLANS[id].included)} responses a month, free forever`;
        else
          note.textContent =
            (billing === "annual" ? `Billed ${money(amount * 12)} a year` : "Billed monthly") +
            (blocks ? ` · includes ${plural(blocks, "extra block")} of ${num(PLANS[id].block)}` : "");
        if (best === null || amount < shown(planMonthly(best, volume), billing)) best = id;
      });
      if (volume >= 50000) best = "business";
      $$("[data-plan]", root).forEach((card) => {
        const on = card.getAttribute("data-plan") === best;
        $("[data-best]", card).hidden = !on;
        card.classList.toggle("shadow-brut-lg", on);
      });
      const summary = $("[data-pricing-summary]", root);
      if (best === "business")
        summary.textContent = `At ${label} responses a month, Business volume pricing usually beats Team (${money(shown(planMonthly("team", volume), billing))} a month). Talk to sales for a quote.`;
      else if (best === "free") summary.textContent = `At ${label} responses a month, Free fits best: $0, forever.`;
      else
        summary.textContent = `At ${label} responses a month, ${PLANS[best].name} fits best: ${money(shown(planMonthly(best, volume), billing))} a month, billed ${billing === "annual" ? "annually" : "monthly"}.`;
      writeJSON(STORAGE_KEYS.pricing, { billing, responses: volume });
    }
    range.addEventListener("input", () => {
      step = Math.max(0, Math.min(VOLUME_STEPS.length - 1, Number(range.value) || 0));
      render();
    });
    root.addEventListener("change", (event) => {
      if (event.target.name === "billing" && ["monthly", "annual"].includes(event.target.value)) {
        billing = event.target.value;
        render();
      }
    });
    render();
  }

  /* ---------- 8. Integrations directory ---------- */

  function initIntegrations() {
    const grid = $("[data-int-grid]");
    if (!grid) return;
    const search = $("[data-int-search]");
    const validCat = (value) => value === "all" || own(INTEGRATION_CATEGORIES, value);
    let cat = validCat(params.get("cat")) ? params.get("cat") : "all";
    let query = (params.get("q") || "").slice(0, 60);
    search.value = query;
    $(`input[name="int-cat"][value="${cat}"]`).checked = true;

    function syncUrl() {
      const next = new URLSearchParams();
      if (cat !== "all") next.set("cat", cat);
      if (query.trim()) next.set("q", query.trim());
      const qs = next.toString();
      history.replaceState(null, "", location.pathname + (qs ? "?" + qs : ""));
    }
    function render() {
      const words = query.toLowerCase().split(/\s+/).filter(Boolean);
      const list = INTEGRATIONS.filter((item) => {
        if (cat !== "all" && item.cat !== cat) return false;
        const hay = [item.name, item.desc, INTEGRATION_CATEGORIES[item.cat], ...item.syncs].join(" ").toLowerCase();
        return words.every((w) => hay.includes(w));
      });
      grid.innerHTML = list
        .map(
          (item) => `<li><article class="card flex h-full flex-col p-5">
  <div class="flex items-center gap-3">${glyph(item)}<div class="min-w-0"><h3 class="text-lg font-extrabold">${esc(item.name)}</h3><p class="font-mono text-xs font-semibold text-ink-soft uppercase">${esc(INTEGRATION_CATEGORIES[item.cat])}</p></div></div>
  <p class="mt-4 flex-1 text-ink-soft">${esc(item.desc)}</p>
  <details class="group mt-4 rounded-lg border-2 border-line">
    <summary class="flex items-center justify-between px-3 py-2 text-sm font-bold">What syncs<span class="transition-transform group-open:rotate-45" aria-hidden="true">+</span></summary>
    <ul class="grid gap-1.5 border-t-2 border-line px-3 py-2.5 text-sm">${item.syncs.map((s) => `<li class="flex gap-2"><span aria-hidden="true">&#9632;</span>${esc(s)}</li>`).join("")}</ul>
  </details>
  <a href="signup.html" class="btn btn-sm btn-plain mt-4 self-start">Connect ${esc(item.name)}</a>
</article></li>`,
        )
        .join("");
      $("[data-int-count]").textContent = plural(list.length, "integration");
      $("[data-int-empty]").hidden = list.length > 0;
    }
    search.addEventListener("input", () => {
      query = search.value.slice(0, 60);
      render();
      syncUrl();
    });
    $("[data-int-chips]").addEventListener("change", (event) => {
      if (!validCat(event.target.value)) return;
      cat = event.target.value;
      render();
      syncUrl();
    });
    $("[data-int-reset]").addEventListener("click", () => {
      query = "";
      cat = "all";
      search.value = "";
      $('input[name="int-cat"][value="all"]').checked = true;
      render();
      syncUrl();
      search.focus();
    });
    render();
  }

  /* ---------- 9. Changelog ---------- */

  // Whole weeks to move the changelog forward: 0 on DEMO_ANCHOR (the dates read exactly as written).
  function demoShiftDays() {
    if (!KEEP_DEMO_CURRENT) return 0;
    const days = daysBetween(DEMO_ANCHOR, TODAY);
    return days > 0 ? Math.floor(days / 7) * 7 : 0;
  }

  function initChangelog() {
    const list = $("[data-change-list]");
    if (!list) return;
    const { CHANGES, CHANGE_TAGS } = DATA;
    const shift = demoShiftDays();
    const TAG_BG = { new: "bg-mint", improved: "bg-peri", fixed: "bg-bubble" };
    const entries = CHANGES.map((c) => ({ ...c, date: addDays(c.date, shift) })).sort((a, b) =>
      a.date < b.date ? 1 : -1,
    );
    let tag = "all";
    function render() {
      const shown = entries.filter((c) => tag === "all" || c.tag === tag);
      list.innerHTML = shown
        .map(
          (c) => `<li class="relative">
  <span class="absolute top-2 -left-[2.15rem] size-4 rounded-sm border-[2.5px] border-line ${TAG_BG[c.tag] || "bg-butter"} sm:-left-[2.65rem]" aria-hidden="true"></span>
  <article class="card p-5 sm:p-6">
    <div class="flex flex-wrap items-center gap-3"><time class="font-mono text-sm font-semibold" datetime="${c.date}">${shortDate.format(noon(c.date))}</time><span class="sticker ${TAG_BG[c.tag] || "bg-butter"} shadow-none!">${esc(CHANGE_TAGS[c.tag] || c.tag)}</span></div>
    <h3 class="mt-3 text-2xl font-extrabold">${esc(c.title)}</h3>
    <ul class="mt-3 grid gap-2 text-ink-soft">${c.body.map((line) => `<li class="flex gap-2"><span aria-hidden="true">&rarr;</span><span>${esc(line)}</span></li>`).join("")}</ul>
  </article>
</li>`,
        )
        .join("");
      $("[data-change-count]").textContent = plural(shown.length, "release");
    }
    $("[data-change-chips]").addEventListener("change", (event) => {
      const value = event.target.value;
      if (value === "all" || own(CHANGE_TAGS, value)) {
        tag = value;
        render();
      }
    });
    render();
  }

  // Changelog newsletter. Connect a real service here (see DOCS.md, "Forms").
  function initSubscribe() {
    const form = $("[data-subscribe]");
    if (!form) return;
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const email = form.elements.email.value.trim();
      const ok = setError(form, "email", EMAIL_RE.test(email) ? "" : "Enter an email like you@company.example.");
      if (!ok) return focusFirstError(form);
      // To go live: POST new FormData(form) to your newsletter service and show this only when it answers OK.
      const done = $("[data-subscribe-done]", form);
      done.textContent = `You're on the list, ${email}. Look for a confirmation from Tessel; the roundup goes out on the first Tuesday of each month.`;
      done.classList.remove("hidden");
      form.elements.email.value = "";
    });
  }

  /* ---------- 10. Customers ---------- */

  // Flat illustrated portraits; `look` picks skin, hair and shirt from these lists.
  const SKIN = ["#c98a5e", "#f0c39a", "#8d5a3b", "#e5a97e", "#6b4128", "#d9a07a"];
  const HAIR = ["#2d1d14", "#a5642a", "#151515", "#d9b25f", "#4a2e1f", "#7d7d7d"];
  const SHIRT = ["#ff6b42", "#a9b2ff", "#86e2b6", "#ffd84a", "#ffb4d0", "#16130f"];
  function portrait(index, background) {
    const skin = SKIN[index % SKIN.length],
      hair = HAIR[(index * 2) % HAIR.length],
      shirt = SHIRT[(index + 2) % SHIRT.length];
    const styles = [
      `<path d="M18 26c0-10 6-16 14-16s14 6 14 16c-6-4-12-5-18-8-3 4-6 7-10 8z" fill="${hair}"/>`,
      `<path d="M16 34c-2-16 5-24 16-24s18 8 16 24l-4-10c-8 0-16-3-20-8-2 6-4 12-8 18z" fill="${hair}"/>`,
      `<path d="M19 22c2-8 8-11 13-11s11 3 13 11c-8-3-18-3-26 0z" fill="${hair}"/>`,
      `<circle cx="32" cy="12" r="7" fill="${hair}"/><path d="M19 24c1-8 7-12 13-12s12 4 13 12c-8-4-18-4-26 0z" fill="${hair}"/>`,
    ];
    return `<svg viewBox="0 0 64 64" class="size-12 shrink-0 rounded-lg border-[2.5px] border-line" aria-hidden="true"><rect width="64" height="64" fill="${background}"/><path d="M10 64c2-14 10-20 22-20s20 6 22 20z" fill="${shirt}" stroke="#16130f" stroke-width="2.5"/><ellipse cx="32" cy="29" rx="12" ry="14" fill="${skin}" stroke="#16130f" stroke-width="2.5"/>${styles[index % styles.length]}<circle cx="27" cy="30" r="1.8" fill="#16130f"/><circle cx="37" cy="30" r="1.8" fill="#16130f"/><path d="M28 36c2.5 2 5.5 2 8 0" fill="none" stroke="#16130f" stroke-width="2" stroke-linecap="round"/></svg>`;
  }

  function storyChart(story) {
    const max = Math.max(story.before, story.after) || 1;
    const bar = (value, y, fill) =>
      `<rect x="96" y="${y}" width="${Math.max(4, (value / max) * 180)}" height="18" fill="${fill}" stroke="#16130f" stroke-width="2"/><text x="${100 + Math.max(4, (value / max) * 180)}" y="${y + 14}" font-size="12" font-weight="600" fill="currentColor">${value}</text>`;
    return `<figure class="mt-5"><svg viewBox="0 0 310 56" class="w-full text-ink" role="img" aria-label="${esc(story.chartLabel)}: ${story.before} before Tessel, ${story.after} with Tessel"><g font-family="Ubuntu Sans Mono, monospace"><text x="0" y="16" font-size="12" font-weight="600" fill="currentColor">Before</text><text x="0" y="44" font-size="12" font-weight="600" fill="currentColor">With Tessel</text>${bar(story.before, 3, "var(--color-bg-2)")}${bar(story.after, 31, ACCENT_HEX[story.accent])}</g></svg><figcaption class="mt-1 font-mono text-xs font-semibold text-ink-soft">${esc(story.chartLabel)}</figcaption></figure>`;
  }

  function initCustomers() {
    const grid = $("[data-story-grid]");
    if (!grid) return;
    const { STORIES, INDUSTRIES } = DATA;
    let industry = "all";
    function render() {
      const list = STORIES.map((s, i) => ({ ...s, index: i })).filter(
        (s) => industry === "all" || s.industry === industry,
      );
      grid.innerHTML = list
        .map(
          (s) => `<li id="${s.id}" class="scroll-mt-28"><article class="card flex h-full flex-col overflow-hidden">
  <div class="flex items-center justify-between gap-3 border-b-[2.5px] border-line ${accentBg(s.accent)} px-5 py-4 text-coal"><div><h3 class="text-xl font-extrabold">${esc(s.company)}</h3><p class="text-sm font-semibold">${esc(s.place)}</p></div><span class="sticker bg-cream! shadow-none!">${esc(INDUSTRIES[s.industry])}</span></div>
  <div class="flex flex-1 flex-col p-5">
    <p class="font-display text-4xl">${esc(s.metric)}</p><p class="font-semibold">${esc(s.metricLabel)}</p>
    ${storyChart(s)}
    <blockquote class="mt-5 flex-1 text-lg leading-snug font-semibold">&ldquo;${esc(s.quote)}&rdquo;</blockquote>
    <div class="mt-5 flex items-center gap-3">${portrait(s.index, ACCENT_HEX[s.accent])}<p><span class="block font-extrabold">${esc(s.person)}</span><span class="text-sm text-ink-soft">${esc(s.role)}</span></p></div>
    <p class="mt-4 border-t-2 border-dashed border-line pt-3 text-sm text-ink-soft"><span class="font-bold text-ink">Forms:</span> ${esc(s.forms)}</p>
  </div>
</article></li>`,
        )
        .join("");
      $("[data-story-count]").textContent = plural(list.length, "story", "stories");
    }
    $("[data-story-chips]").addEventListener("change", (event) => {
      const value = event.target.value;
      if (value === "all" || own(INDUSTRIES, value)) {
        industry = value;
        render();
      }
    });
    render();
    const target = location.hash.slice(1);
    if (target && STORIES.some((s) => s.id === target)) {
      const element = document.getElementById(target);
      if (element) element.scrollIntoView();
    }
  }

  /* ---------- 11. Contact ---------- */

  function salesStatus() {
    const day = weekday(TODAY);
    const open = toMinutes(SALES_HOURS.open),
      close = toMinutes(SALES_HOURS.close);
    const isDay = (key) => SALES_HOURS.days.includes(weekday(key));
    if (isDay(TODAY) && NOW_ZONED.minutes >= open && NOW_ZONED.minutes < close)
      return { open: true, text: `Open now · until ${clock(SALES_HOURS.close)} CT` };
    if (isDay(TODAY) && NOW_ZONED.minutes < open)
      return { open: false, text: `Closed · opens today at ${clock(SALES_HOURS.open)} CT` };
    let next = addDays(TODAY, 1);
    while (!isDay(next)) next = addDays(next, 1);
    const when = daysBetween(TODAY, next) === 1 ? "tomorrow" : dayMonth.format(noon(next)).split(",")[0];
    return { open: false, text: `Closed · opens ${when} at ${clock(SALES_HOURS.open)} CT`, day };
  }

  // The first walkthrough day (a Thursday) at least one day after today.
  function nextWalkthrough() {
    let key = addDays(TODAY, 1);
    while (weekday(key) !== WALKTHROUGH.weekday) key = addDays(key, 1);
    return key;
  }

  function initContact() {
    const status = $("[data-sales-status]");
    if (status) {
      const s = salesStatus();
      $("[data-sales-status-text]", status).textContent = s.text;
      const dot = $("[data-sales-dot]", status);
      dot.classList.toggle("bg-mint", s.open);
      dot.classList.toggle("bg-tomato", !s.open);
    }
    const walk = $("[data-next-walkthrough]");
    if (walk) walk.textContent = `${dayMonth.format(noon(nextWalkthrough()))} · ${clock(WALKTHROUGH.time).replace(/^12 p\.m\./, "12:00 p.m.")} CT`;

    const form = $("[data-sales-form]");
    if (!form) return;
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const v = (name) => (form.elements[name].value || "").trim();
      const phoneDigits = v("phone").replace(/\D/g, "");
      const checks = [
        setError(form, "name", v("name").length >= 2 ? "" : "Please tell us your name."),
        setError(form, "email", EMAIL_RE.test(v("email")) ? "" : "Enter a work email like you@company.example."),
        setError(form, "company", v("company") ? "" : "Which organization is this for?"),
        setError(form, "phone", !phoneDigits || phoneDigits.length >= 10 ? "" : "Enter a 10-digit phone number, or leave it blank."),
        setError(form, "size", v("size") ? "" : "Choose your team size."),
        setError(form, "volume", v("volume") ? "" : "Choose a rough monthly volume."),
      ];
      if (checks.includes(false)) return focusFirstError(form);
      // To go live: send new FormData(form) to your CRM or a form service (e.g. Formspree) with fetch,
      // and show the success state below only when it answers OK.
      const first = v("name").split(/\s+/)[0];
      const bigVolume = ["50k-250k", "250k+"].includes(v("volume")) || v("size") === "251+";
      const rep = bigVolume ? "Ysolde Ebbesen" : "Leopold Rasmussen";
      const done = $("[data-sales-done]");
      $("[data-sales-done-title]", done).textContent = `Thanks, ${first}.`;
      $("[data-sales-done-text]", done).textContent = `${rep} on our sales team has your request and will reply to ${v("email")} within one business day, usually with a few times for a 30-minute call.`;
      $("[data-sales-ref]", done).textContent = reference("TS");
      form.hidden = true;
      done.hidden = false;
      done.focus();
    });
  }

  /* ---------- 12. Sign up and sign in ---------- */

  const SIGNUP_PLANS = {
    free: "Free plan: 100 responses a month, unlimited forms.",
    maker: "Maker trial: 14 days free, no card needed.",
    team: "Team trial: 14 days of every feature, no card needed.",
  };

  function initAuth() {
    const tabs = $$("[data-auth-tab]");
    if (!tabs.length) return;
    function select(name, focus = false) {
      tabs.forEach((tab) => {
        const on = tab.getAttribute("data-auth-tab") === name;
        tab.setAttribute("aria-selected", String(on));
        tab.tabIndex = on ? 0 : -1;
        if (on && focus) tab.focus();
      });
      $$("[data-auth-panel]").forEach((panel) => (panel.hidden = panel.getAttribute("data-auth-panel") !== name));
    }
    tabs.forEach((tab, i) => {
      tab.addEventListener("click", () => select(tab.getAttribute("data-auth-tab")));
      tab.addEventListener("keydown", (event) => {
        if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
        event.preventDefault();
        select(tabs[(i + (event.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length].getAttribute("data-auth-tab"), true);
      });
    });
    const fromHash = () => select(location.hash === "#signin" ? "signin" : "signup");
    fromHash();
    window.addEventListener("hashchange", fromHash);

    // ?plan=free|maker|team and ?template=<id> (from pricing and the templates gallery).
    const plan = own(SIGNUP_PLANS, params.get("plan")) ? params.get("plan") : "free";
    const template = own(TEMPLATE_MAP, params.get("template")) ? TEMPLATE_MAP[params.get("template")] : null;
    $("[data-plan-banner]").textContent =
      SIGNUP_PLANS[plan] + (template ? ` Starting with the ${template.name} template.` : "");

    // Show / hide password.
    $$("[data-show-password]").forEach((button) =>
      button.addEventListener("click", () => {
        const input = document.getElementById(button.getAttribute("data-show-password"));
        const show = input.type === "password";
        input.type = show ? "text" : "password";
        button.textContent = show ? "Hide" : "Show";
        button.setAttribute("aria-pressed", String(show));
      }),
    );

    const signup = $("[data-signup-form]");
    const STRENGTH = [
      ["", "At least 8 characters, with a number."],
      ["bg-tomato", "Weak: add more characters."],
      ["bg-butter", "Okay: a number or capital would help."],
      ["bg-mint", "Good password."],
      ["bg-mint", "Strong password."],
    ];
    function strength(pw) {
      if (!pw) return 0;
      let score = 1;
      if (pw.length >= 8 && /\d/.test(pw)) score++;
      if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
      if (pw.length >= 12 || /[^A-Za-z0-9]/.test(pw)) score++;
      return pw.length < 8 ? 1 : score;
    }
    signup.elements.password.addEventListener("input", () => {
      const score = strength(signup.elements.password.value);
      $$("[data-strength-bars] span").forEach((bar, i) => {
        ["bg-tomato", "bg-butter", "bg-mint"].forEach((c) => bar.classList.remove(c));
        if (i < score && STRENGTH[score][0]) bar.classList.add(STRENGTH[score][0]);
      });
      $("[data-strength-text]").textContent = STRENGTH[score][1];
    });
    signup.addEventListener("submit", (event) => {
      event.preventDefault();
      const name = signup.elements.name.value.trim();
      const email = signup.elements.email.value.trim();
      const pw = signup.elements.password.value;
      const checks = [
        setError(signup, "name", name.length >= 2 ? "" : "Please tell us your name."),
        setError(signup, "email", EMAIL_RE.test(email) ? "" : "Enter an email like you@company.example."),
        setError(signup, "password", pw.length >= 8 && /\d/.test(pw) ? "" : "Use at least 8 characters, including a number."),
        setError(signup, "terms", signup.elements.terms.checked ? "" : "Please agree to the terms to continue."),
      ];
      if (checks.includes(false)) return focusFirstError(signup);
      // To go live: create the account with your auth provider and show this only when it succeeds.
      const first = name.split(/\s+/)[0];
      const done = $("[data-signup-done]");
      $("[data-signup-done-title]", done).textContent = `Welcome aboard, ${first}!`;
      const trialEnds = longDate.format(noon(addDays(TODAY, TRIAL_DAYS)));
      $("[data-signup-done-text]", done).textContent =
        (plan === "free"
          ? "Your Free workspace is ready, with 100 responses a month and every template."
          : `Your ${TRIAL_DAYS}-day ${plan === "team" ? "Team" : "Maker"} trial runs until ${trialEnds}. No card needed until then.`) +
        (template ? ` We've set up the ${template.name} template for you.` : "") +
        ` A link to confirm ${email} is on its way.`;
      $("[data-signup-workspace]", done).textContent = `tessel.example/w/${slugify(first)}`;
      signup.hidden = true;
      done.hidden = false;
      done.focus();
    });

    const signin = $("[data-signin-form]");
    signin.addEventListener("submit", (event) => {
      event.preventDefault();
      const checks = [
        setError(signin, "email", EMAIL_RE.test(signin.elements.email.value.trim()) ? "" : "Enter the email you signed up with."),
        setError(signin, "password", signin.elements.password.value ? "" : "Enter your password."),
      ];
      if (checks.includes(false)) return focusFirstError(signin);
      // To go live: sign in with your auth provider, then redirect to the app.
      const done = $("[data-signin-done]");
      signin.hidden = true;
      $("#reset-box").hidden = true;
      done.hidden = false;
      done.focus();
    });

    const resetToggle = $("[data-reset-toggle]");
    const resetBox = $("#reset-box");
    resetToggle.addEventListener("click", () => {
      resetBox.hidden = !resetBox.hidden;
      resetToggle.setAttribute("aria-expanded", String(!resetBox.hidden));
      if (!resetBox.hidden) $("input", resetBox).focus();
    });
    const reset = $("[data-reset-form]");
    reset.addEventListener("submit", (event) => {
      event.preventDefault();
      const email = reset.elements.email.value.trim();
      if (!setError(reset, "email", EMAIL_RE.test(email) ? "" : "Enter the email you signed up with.")) return focusFirstError(reset);
      $("[data-reset-done]").textContent = `If there's a Tessel account for ${email}, a reset link is on its way. It works for 30 minutes.`;
    });
  }

  /* ---------- Start ---------- */

  initTheme();
  initMenu();
  initReveals();
  initDates();
  initBuilder();
  initFeaturedTemplates();
  initTemplates();
  initSectionNav();
  initLogicDemo();
  initAnalytics();
  initIntegrationStrip();
  initPricing();
  initIntegrations();
  initChangelog();
  initSubscribe();
  initCustomers();
  initContact();
  initAuth();
})();
