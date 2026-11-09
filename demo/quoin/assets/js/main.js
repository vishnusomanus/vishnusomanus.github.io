/* Quoin: inventory, cart, project board, reservation requests and opening days. */
(() => {
  "use strict";
  const { products: PRODUCTS, guides: GUIDES, team: TEAM } = window.QUOIN_DATA;
  const own = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
  const PRODUCT_MAP = Object.fromEntries(PRODUCTS.map((product) => [product.id, product]));
  const TIME_ZONE = "America/New_York";
  const STORAGE_KEYS = {
    basket: "quoin.basket.v1",
    board: "quoin.board.v1",
    lastRequest: "quoin.last-request.v1",
  };
  // What one price and one unit of stock buys. `label` follows the price ("per pair").
  const UNITS = {
    piece: { one: "piece", many: "pieces", label: "piece" },
    pair: { one: "pair", many: "pairs", label: "pair" },
    set: { one: "set", many: "sets", label: "set of six" },
    pack: { one: "pack", many: "packs", label: "pack of four" },
  };
  // Opening days: Wednesday to Saturday (0 = Sunday). The yard closes on US federal
  // holidays (worked out for any year in bankHolidays()) and for the Christmas break below.
  const OPEN_WEEKDAYS = [3, 4, 5, 6];
  const OPENING_HOURS = "10am–5pm";
  const CLOSE_ON_BANK_HOLIDAYS = true;
  // Yearly closures as month-day ranges ("MM-DD", inclusive); a range may run over New Year. The
  // first matching entry gives the reason shown, so name single days before the longer break.
  const YARD_CLOSURES = [
    { from: "12-25", to: "12-25", label: "Christmas Day" },
    { from: "01-01", to: "01-01", label: "New Year’s Day" },
    { from: "12-24", to: "01-02", label: "Christmas break" },
  ];
  // How long requested pieces are held while the yard calls the customer back.
  const HOLD_HOURS = 48;
  const FINISHES = {
    none: [{ id: "original", label: "As described", extra: 0 }],
    wax: [
      { id: "original", label: "Cleaned, as found", extra: 0 },
      { id: "waxed", label: "Light wax finish", extra: 25 },
    ],
    brass: [
      { id: "original", label: "Keep the patina", extra: 0 },
      { id: "polished", label: "Hand polish", extra: 15 },
    ],
    metal: [
      { id: "original", label: "Cleaned, as found", extra: 0 },
      { id: "protected", label: "Clear protective wax", extra: 20 },
    ],
    stone: [
      { id: "original", label: "Dry cleaned", extra: 0 },
      { id: "cleaned", label: "Specialist surface clean", extra: 50 },
    ],
  };
  const ROOMS = ["Undecided", "Entrance", "Kitchen", "Living room", "Bedroom", "Bathroom", "Garden"];
  const DELIVERY = { local: 65, north: 145, mainland: 395, perHeavyBand: 25 };
  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];
  const escape = (value) =>
    String(value).replace(
      /[&<>"']/g,
      (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char],
    );
  const money = (value) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
  const cleanText = (value, limit = 120) =>
    typeof value === "string" ? value.replace(/[\u0000-\u001f\u007f]/g, "").slice(0, limit) : "";
  const clamp = (value, min, max) =>
    Math.min(max, Math.max(min, Number.isFinite(Number(value)) ? Math.floor(Number(value)) : min));
  const validProduct = (id) => typeof id === "string" && own(PRODUCT_MAP, id);
  const plural = (number, word) => `${number} ${word}${number === 1 ? "" : "s"}`;
  const unitOf = (product) => (own(UNITS, product.unit) ? UNITS[product.unit] : UNITS.piece);
  // "1 pair", "12 packs": counts in the unit the price is for.
  const units = (product, number) => `${number} ${number === 1 ? unitOf(product).one : unitOf(product).many}`;
  const safeStorage = (() => {
    const memory = new Map();
    let blocked = false;
    return {
      getItem(key) {
        if (!blocked) {
          try {
            const value = window.localStorage.getItem(key);
            if (value !== null) memory.set(key, value);
            return value;
          } catch {
            blocked = true;
          }
        }
        return memory.has(key) ? memory.get(key) : null;
      },
      setItem(key, value) {
        memory.set(key, String(value));
        if (!blocked) {
          try {
            window.localStorage.setItem(key, String(value));
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
  function readJSON(key, fallback) {
    const raw = safeStorage.getItem(key);
    if (raw === null) return fallback;
    try {
      return JSON.parse(raw);
    } catch {
      safeStorage.removeItem(key);
      return fallback;
    }
  }
  function optionsFor(product) {
    return own(FINISHES, product.finishGroup) ? FINISHES[product.finishGroup] : FINISHES.none;
  }
  function finishFor(product, id) {
    return optionsFor(product).find((option) => option.id === id) || optionsFor(product)[0];
  }
  function loadBasket() {
    const raw = readJSON(STORAGE_KEYS.basket, []);
    const rows = [];
    const remaining = Object.fromEntries(PRODUCTS.map((product) => [product.id, product.stock]));
    if (Array.isArray(raw))
      raw.slice(0, 50).forEach((row) => {
        if (!row || typeof row !== "object" || !own(row, "id") || !validProduct(row.id)) return;
        const product = PRODUCT_MAP[row.id];
        const finish = finishFor(product, own(row, "finish") ? row.finish : "original");
        if (remaining[product.id] < 1) return;
        const quantity = clamp(own(row, "quantity") ? row.quantity : 1, 1, remaining[product.id]);
        const existing = rows.find((item) => item.id === product.id && item.finish === finish.id);
        if (existing) existing.quantity += quantity;
        else rows.push({ id: product.id, finish: finish.id, quantity });
        remaining[product.id] -= quantity;
      });
    safeStorage.setItem(STORAGE_KEYS.basket, JSON.stringify(rows));
    return rows;
  }
  function loadBoard() {
    const raw = readJSON(STORAGE_KEYS.board, {});
    const result = { name: "", budget: 0, items: [] };
    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      result.name = cleanText(own(raw, "name") ? raw.name : "", 80);
      result.budget = clamp(own(raw, "budget") ? raw.budget : 0, 0, 1000000);
      if (own(raw, "items") && Array.isArray(raw.items))
        raw.items.slice(0, 30).forEach((item) => {
          if (!item || typeof item !== "object" || !own(item, "id") || !validProduct(item.id)) return;
          if (result.items.some((row) => row.id === item.id)) return;
          result.items.push({
            id: item.id,
            room: own(item, "room") && ROOMS.includes(item.room) ? item.room : ROOMS[0],
            note: cleanText(own(item, "note") ? item.note : "", 300),
          });
        });
    }
    safeStorage.setItem(STORAGE_KEYS.board, JSON.stringify(result));
    return result;
  }
  let basket = loadBasket();
  let board = loadBoard();
  let toastTimer;
  function toast(message) {
    const area = $("[data-toast]");
    if (!area) return;
    clearTimeout(toastTimer);
    area.textContent = message;
    area.hidden = false;
    toastTimer = setTimeout(() => {
      area.hidden = true;
    }, 3800);
  }
  function saveBasket() {
    safeStorage.setItem(STORAGE_KEYS.basket, JSON.stringify(basket));
    updateBasketCount();
  }
  function saveBoard() {
    safeStorage.setItem(STORAGE_KEYS.board, JSON.stringify(board));
    updateSaveButtons();
  }
  function basketCount() {
    return basket.reduce((sum, row) => sum + row.quantity, 0);
  }
  function basketCost() {
    return basket.reduce(
      (sum, row) => sum + (PRODUCT_MAP[row.id].price + finishFor(PRODUCT_MAP[row.id], row.finish).extra) * row.quantity,
      0,
    );
  }
  function basketWeight() {
    return basket.reduce((sum, row) => sum + PRODUCT_MAP[row.id].weight * row.quantity, 0);
  }
  function updateBasketCount() {
    const count = basketCount();
    $$("[data-basket-count]").forEach((element) => {
      element.textContent = count;
    });
    $$("[data-basket-link]").forEach((element) => {
      element.setAttribute("aria-label", `Cart, ${plural(count, "item")}`);
    });
  }
  function updateSaveButtons() {
    $$("[data-save]").forEach((button) => {
      const saved = board.items.some((item) => item.id === button.dataset.save);
      button.setAttribute("aria-pressed", String(saved));
      const product = PRODUCT_MAP[button.dataset.save];
      button.textContent = saved ? "Saved to board" : "Save to board";
      if (product) button.setAttribute("aria-label", `${saved ? "Saved to board" : "Save to board"}: ${product.name}`);
    });
  }
  function toggleSave(id) {
    if (!validProduct(id)) return;
    const index = board.items.findIndex((item) => item.id === id);
    if (index >= 0) board.items.splice(index, 1);
    else board.items.push({ id, room: ROOMS[0], note: "" });
    saveBoard();
    toast(index >= 0 ? "Piece removed from your project board." : "Piece saved to your project board.");
  }
  function stockRemaining(id, exceptFinish = null) {
    const used = basket
      .filter((row) => row.id === id && row.finish !== exceptFinish)
      .reduce((sum, row) => sum + row.quantity, 0);
    return Math.max(0, PRODUCT_MAP[id].stock - used);
  }
  function addToBasket(id, finishId = "original", quantity = 1) {
    if (!validProduct(id)) return false;
    const product = PRODUCT_MAP[id];
    const finish = finishFor(product, finishId);
    const row = basket.find((item) => item.id === id && item.finish === finish.id);
    const available = stockRemaining(id, finish.id);
    const desired = (row?.quantity || 0) + clamp(quantity, 1, product.stock);
    if (available < 1 || (row && row.quantity >= available)) {
      toast(
        product.stock === 1
          ? `The only ${unitOf(product).one} in lot ${product.lot} is already in your cart.`
          : `All ${units(product, product.stock)} in lot ${product.lot} are already in your cart.`,
      );
      return false;
    }
    const adjusted = Math.min(desired, available);
    if (row) row.quantity = adjusted;
    else basket.push({ id, finish: finish.id, quantity: adjusted });
    saveBasket();
    toast(`${product.name} added to your cart${desired > available ? ", up to the available quantity" : ""}.`);
    return true;
  }
  function card(product, compact = false) {
    const saved = board.items.some((row) => row.id === product.id);
    const heading = document.body.dataset.page === "stock" ? "h2" : "h3";
    return `<article class="min-w-0 reveal" data-product="${product.id}">
      <a href="lot.html?lot=${product.id}" class="group block overflow-hidden bg-wash"><img src="${product.art}" alt="${escape(product.name)}" width="400" height="330" loading="lazy" class="w-full transition duration-500 motion-safe:group-hover:scale-[1.03]"></a>
      <div class="mt-4 flex items-center justify-between gap-3 text-xs uppercase tracking-widest text-muted"><span>Lot ${product.lot}</span><span class="normal-case tracking-wide">${escape(product.era)}</span></div>
      <${heading} class="mt-3 text-[1.65rem] leading-tight"><a href="lot.html?lot=${product.id}" class="hover:text-rust">${escape(product.name)}</a></${heading}>
      <p class="mt-2 text-sm leading-snug text-muted">${escape(product.provenance)}</p>
      <p class="mt-3 text-xs tracking-wide text-muted">${escape(product.dimensions)}</p>
      <div class="mt-3 flex items-baseline justify-between gap-3 border-t border-line pt-3"><p class="text-base font-semibold">${money(product.price)}${product.unit === "piece" ? "" : ` <span class="text-xs font-normal text-muted">per ${unitOf(product).label}</span>`}</p><p class="text-right text-xs text-muted">${units(product, product.stock)} in stock</p></div>
      ${compact ? "" : `<div class="mt-4 flex flex-wrap gap-x-4 gap-y-3"><button type="button" data-save="${product.id}" aria-pressed="${saved}" aria-label="${saved ? "Saved to board" : "Save to board"}: ${escape(product.name)}" class="text-link text-xs">${saved ? "Saved to board" : "Save to board"}</button><button type="button" data-quick="${product.id}" class="text-link text-xs" aria-label="Quick look: ${escape(product.name)}">Quick look</button></div>`}
    </article>`;
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
  function initMenu() {
    const button = $("[data-menu-toggle]");
    const menu = $("#mobile-menu");
    function close(returnFocus = false) {
      if (!menu || !button) return;
      menu.hidden = true;
      button.setAttribute("aria-expanded", "false");
      button.setAttribute("aria-label", "Open menu");
      if (returnFocus) button.focus();
    }
    button?.addEventListener("click", () => {
      const open = button.getAttribute("aria-expanded") !== "true";
      menu.hidden = !open;
      button.setAttribute("aria-expanded", String(open));
      button.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      if (open) $("a", menu)?.focus();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !menu.hidden) close(true);
    });
    matchMedia("(min-width:1024px)").addEventListener("change", (event) => {
      if (event.matches) close();
    });
  }
  function initStock() {
    const grid = $("[data-stock-grid]");
    if (!grid) return;
    const form = $("[data-stock-filters]");
    const params = new URLSearchParams(location.search);
    const categories = new Set(PRODUCTS.map((product) => product.category));
    form.elements.q.value = cleanText(params.get("q"), 80);
    if (categories.has(params.get("category"))) form.elements.category.value = params.get("category");
    if (["100", "300", "500"].includes(params.get("max"))) form.elements.max.value = params.get("max");
    if (["lot", "low", "high", "name"].includes(params.get("sort"))) form.elements.sort.value = params.get("sort");
    function render() {
      const query = form.elements.q.value.trim().toLocaleLowerCase("en-US");
      const category = form.elements.category.value;
      const max = form.elements.max.value === "all" ? Infinity : Number(form.elements.max.value);
      const matches = PRODUCTS.filter(
        (product) =>
          (category === "all" || product.category === category) &&
          product.price <= max &&
          `${product.name} ${product.category} ${product.intro} ${product.provenance} ${product.era} ${product.lot}`
            .toLocaleLowerCase("en-US")
            .includes(query),
      );
      const sorters = {
        lot: (a, b) => a.lot.localeCompare(b.lot),
        low: (a, b) => a.price - b.price,
        high: (a, b) => b.price - a.price,
        name: (a, b) => a.name.localeCompare(b.name),
      };
      const sort = own(sorters, form.elements.sort.value) ? form.elements.sort.value : "lot";
      matches.sort(sorters[sort]);
      grid.innerHTML = matches.map((product) => card(product)).join("");
      $("[data-stock-count]").textContent = `${plural(matches.length, "lot")} to consider`;
      $("[data-stock-empty]").hidden = matches.length > 0;
      revealNew();
    }
    form.addEventListener("input", render);
    form.addEventListener("submit", (event) => event.preventDefault());
    $("[data-reset-filters]").addEventListener("click", () => {
      form.reset();
      render();
      form.elements.q.focus();
    });
    render();
  }
  function finishOptions(product) {
    return optionsFor(product)
      .map(
        (option) =>
          `<option value="${option.id}">${escape(option.label)}${option.extra ? ` (+${money(option.extra)})` : ""}</option>`,
      )
      .join("");
  }
  function purchaseForm(product, prefix) {
    return `<form data-purchase="${product.id}" class="mt-7 space-y-5">
      <label class="label" for="${prefix}-finish">Preparation<select id="${prefix}-finish" name="finish" class="field">${finishOptions(product)}</select></label>
      <div class="grid grid-cols-[100px_1fr] items-end gap-4"><label class="label" for="${prefix}-quantity">${product.unit === "piece" ? "Quantity" : `${unitOf(product).many[0].toUpperCase()}${unitOf(product).many.slice(1)}`}<input id="${prefix}-quantity" name="quantity" class="field" type="number" min="1" max="${product.stock}" value="1" required></label><div class="pb-3 text-right"><span class="sr-only">Unit price</span><span data-unit-price class="font-display text-4xl">${money(product.price)}</span><span class="mt-1 block text-xs text-muted">per ${unitOf(product).label}, before sales tax</span></div></div>
      <div class="flex flex-wrap gap-3"><button type="submit" class="btn">Add to cart</button><button type="button" data-save="${product.id}" aria-pressed="false" class="btn-outline">Save to board</button></div>
      <p data-purchase-status role="status" class="text-sm text-muted"></p>
    </form>`;
  }
  function initLot() {
    const container = $("[data-lot-detail]");
    if (!container) return;
    const id = new URLSearchParams(location.search).get("lot");
    const product = validProduct(id) ? PRODUCT_MAP[id] : PRODUCTS[0];
    const fallback =
      id && !validProduct(id)
        ? '<p class="mb-6 border border-line p-4 text-sm">That lot was not recognized. Here is one worth a look instead.</p>'
        : "";
    document.title = `${product.name} | Quoin`;
    container.innerHTML = `${fallback}<div class="grid items-start gap-10 lg:grid-cols-[1.15fr_1fr]">
      <div><img src="${product.art}" width="400" height="330" alt="${escape(product.name)}, drawn to show its construction" class="w-full"><p class="measure mt-4">Measured by hand / ${escape(product.dimensions)}</p><div class="mt-6 grid gap-6 sm:grid-cols-2 sm:gap-5"><div><p class="eyebrow">Condition</p><p class="mt-3 text-sm leading-relaxed text-muted">${escape(product.condition)}</p></div><div><p class="eyebrow">A considered use</p><p class="mt-3 text-sm leading-relaxed text-muted">${escape(product.use)}</p></div></div></div>
      <div><p class="eyebrow">Lot ${product.lot} / ${escape(product.category)} / <span class="normal-case tracking-wide">${escape(product.era)}</span></p><h1 class="mt-5 text-5xl leading-tight sm:text-6xl">${escape(product.name)}</h1><p class="mt-6 text-lg leading-relaxed text-muted">${escape(product.intro)}</p><p class="mt-4 border-l-2 border-rust pl-4 text-sm leading-relaxed">${escape(product.provenance)}</p>
      <dl class="mt-7 grid grid-cols-2 gap-5 border-y border-line py-5 text-sm"><div><dt class="text-muted">Dimensions</dt><dd class="mt-2 font-semibold">${escape(product.dimensions)}</dd></div><div><dt class="text-muted">Approximate weight</dt><dd class="mt-2 font-semibold">${product.weight} lb${product.unit === "piece" ? "" : ` per ${unitOf(product).one}`}</dd></div><div><dt class="text-muted">Availability</dt><dd class="mt-2 font-semibold">${units(product, product.stock)}${product.unit === "piece" ? "" : ` <span class="font-normal text-muted">(priced per ${unitOf(product).label})</span>`}</dd></div><div><dt class="text-muted">Price includes</dt><dd class="mt-2 font-semibold">Stated preparation, before sales tax</dd></div></dl>${purchaseForm(product, "lot")}
      <details class="mt-6 border-t border-line py-5"><summary class="cursor-pointer text-sm font-semibold">Before you bring it home</summary><p class="mt-4 text-sm leading-relaxed text-muted">Check your opening, mounting points and access route. Reclaimed pieces may need specialist installation. When you send a reservation request we hold the pieces for ${HOLD_HOURS} hours and call you to go through condition and installation before any payment.</p><div class="mt-4 flex flex-wrap gap-x-5 gap-y-2"><a href="visit.html#delivery" class="text-link text-sm">Pickup & delivery</a><a href="visit.html?lot=${product.id}#ask" class="text-link text-sm">Ask about this lot</a></div></details></div></div>`;
    $("[data-related]").innerHTML = PRODUCTS.filter((item) => item.id !== product.id)
      .sort((a, b) => Number(b.category === product.category) - Number(a.category === product.category))
      .slice(0, 3)
      .map((item) => card(item, true))
      .join("");
    updateSaveButtons();
  }
  function initQuickLook() {
    const dialog = $("[data-quick-dialog]");
    if (!dialog) return;
    let opener;
    function close() {
      dialog.close();
      opener?.focus();
    }
    document.addEventListener("click", (event) => {
      const button = event.target.closest("[data-quick]");
      if (!button || !validProduct(button.dataset.quick)) return;
      opener = button;
      const product = PRODUCT_MAP[button.dataset.quick];
      $("[data-quick-content]").innerHTML =
        `<div><img src="${product.art}" alt="${escape(product.name)}" width="400" height="330" class="w-full"><p class="measure mt-4">${escape(product.dimensions)} / ${product.weight} lb</p></div><div><p class="eyebrow">Lot ${product.lot} / <span class="normal-case tracking-wide">${escape(product.era)}</span></p><h2 id="quick-title" class="mt-4 text-4xl">${escape(product.name)}</h2><p class="mt-5 leading-relaxed text-muted">${escape(product.intro)}</p><p class="mt-3 text-sm text-muted">${escape(product.provenance)}</p>${purchaseForm(product, "quick")}<a href="lot.html?lot=${product.id}" class="text-link mt-5 inline-block text-sm">Read the condition notes</a></div>`;
      updateSaveButtons();
      dialog.showModal();
      $("[data-close-dialog]").focus();
    });
    $("[data-close-dialog]").addEventListener("click", close);
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) close();
    });
    dialog.addEventListener("cancel", () => {
      opener?.focus();
    });
  }
  function initProductActions() {
    document.addEventListener("click", (event) => {
      const save = event.target.closest("[data-save]");
      if (save) toggleSave(save.dataset.save);
    });
    document.addEventListener("change", (event) => {
      const form = event.target.closest("[data-purchase]");
      if (!form || !validProduct(form.dataset.purchase)) return;
      const product = PRODUCT_MAP[form.dataset.purchase];
      const finish = finishFor(product, form.elements.finish.value);
      $("[data-unit-price]", form).textContent = money(product.price + finish.extra);
    });
    document.addEventListener("submit", (event) => {
      const form = event.target.closest("[data-purchase]");
      if (!form) return;
      event.preventDefault();
      if (!form.reportValidity()) return;
      const id = form.dataset.purchase;
      if (!validProduct(id)) return;
      const added = addToBasket(id, form.elements.finish.value, form.elements.quantity.value);
      $("[data-purchase-status]", form).textContent = added
        ? `${PRODUCT_MAP[id].name} is in your cart.`
        : "Everything we have in this lot is already in your cart.";
    });
  }
  function lineKey(row) {
    return `${row.id}:${row.finish}`;
  }
  function basketRow(row) {
    const product = PRODUCT_MAP[row.id];
    const finish = finishFor(product, row.finish);
    const key = lineKey(row);
    return `<article data-line="${key}" class="grid grid-cols-[84px_1fr] gap-5 border-b border-line py-6 sm:grid-cols-[120px_1fr]"><a href="lot.html?lot=${row.id}"><img src="${product.art}" width="400" height="330" alt="${escape(product.name)}" class="w-full"></a><div class="min-w-0"><p class="eyebrow">Lot ${product.lot}</p><h2 class="mt-2 text-2xl sm:text-3xl"><a href="lot.html?lot=${row.id}">${escape(product.name)}</a></h2><p class="mt-2 text-sm text-muted">${escape(finish.label)} · ${money(product.price + finish.extra)} per ${unitOf(product).label}</p><div class="mt-4 flex flex-wrap items-end justify-between gap-4"><label class="text-xs font-semibold">${product.unit === "piece" ? "Quantity" : `${unitOf(product).many[0].toUpperCase()}${unitOf(product).many.slice(1)}`}<input data-line-quantity="${key}" type="number" min="1" max="${stockRemaining(row.id, row.finish)}" value="${row.quantity}" class="field mt-1 w-20 py-2" aria-label="Quantity: ${escape(product.name)}, ${escape(finish.label)}"></label><span data-line-total class="text-lg font-semibold">${money((product.price + finish.extra) * row.quantity)}</span><button type="button" data-remove-line="${key}" class="text-link text-xs" aria-label="Remove: ${escape(product.name)}, ${escape(finish.label)}">Remove</button></div></div></article>`;
  }
  // The price panel on the cart and checkout pages. `delivery` is null on the cart page (pickup
  // or a delivery guide is chosen at checkout), or the result of checkoutDelivery() on the checkout.
  function summaryMarkup(delivery = null) {
    const goods = basketCost();
    const row = (label, value, extra = "") =>
      `<div class="flex justify-between gap-4${extra}"><dt>${label}</dt><dd class="text-right">${value}</dd></div>`;
    let rows = row(plural(basketCount(), "item"), money(goods));
    let total = goods;
    let totalLabel = "Subtotal, before sales tax";
    let note = "Preparation prices are included. Sales tax is added when we confirm your total. Choose pickup or delivery on the next page.";
    if (!delivery) {
      rows += row("Pickup in Troy", "Free");
      rows += row("Delivery", "Priced at the next step");
    } else if (delivery.method === "collect") {
      rows += row("Pickup in Troy", "Free");
      totalLabel = "Total at pickup, before sales tax";
      note = "You pay when you pick up, by card or check, with sales tax added. Nothing is taken online.";
    } else if (delivery.price) {
      rows += row(`Delivery to ${escape(delivery.area)} (guide)`, money(delivery.price));
      total = goods + delivery.price;
      totalLabel = "Estimated total, before sales tax";
      note = "The delivery guide is confirmed on the phone once we know the access and the route. Sales tax is added when we confirm your total.";
    } else if (delivery.individual) {
      rows += row(`Delivery to ${escape(delivery.area)}`, "Quoted separately");
      note = "This route needs a carrier quote. We include it when we call you back.";
    } else {
      rows += row("Delivery", "Add your ZIP code");
      note = "Add a delivery ZIP code to see a guide price.";
    }
    rows += row("Approximate load", `${basketWeight()} lb`);
    rows += row(totalLabel, money(total), " border-t border-line pt-4 font-semibold");
    return `<dl class="space-y-4 text-sm">${rows}</dl><p class="mt-4 text-xs leading-relaxed text-muted">${note}</p>`;
  }
  function renderBasket() {
    const lines = $("[data-basket-lines]");
    if (!lines) return;
    lines.innerHTML = basket.length
      ? basket.map(basketRow).join("")
      : `<div class="border border-line p-8"><h2 class="text-4xl">Something good will turn up.</h2><p class="mt-5 text-muted">Your cart is empty. Start with a useful detail or a piece that gives the whole room its character.</p><a href="stock.html" class="btn mt-6">Browse the inventory</a>${lastRequestMarkup()}</div>`;
    $("[data-basket-summary]").innerHTML = basket.length
      ? summaryMarkup()
      : '<p class="text-sm leading-relaxed text-muted">Nothing here yet. Pickup at the yard is free; delivery is priced by ZIP code and weight.</p>';
    $("[data-checkout-link]").hidden = !basket.length;
  }
  function initBasket() {
    if (!$("[data-basket-lines]")) return;
    renderBasket();
    document.addEventListener("change", (event) => {
      if (!event.target.matches("[data-line-quantity]")) return;
      const key = event.target.dataset.lineQuantity;
      const row = basket.find((item) => lineKey(item) === key);
      if (!row) return;
      row.quantity = clamp(event.target.value, 1, stockRemaining(row.id, row.finish));
      saveBasket();
      // Keep the edited input in place: replacing it during change can trigger a second native blur/change.
      basket.forEach((line) => {
        const element = $(`[data-line="${lineKey(line)}"]`);
        if (!element) return;
        const input = $("[data-line-quantity]", element);
        input.value = line.quantity;
        input.max = stockRemaining(line.id, line.finish);
        const product = PRODUCT_MAP[line.id];
        $("[data-line-total]", element).textContent = money(
          (product.price + finishFor(product, line.finish).extra) * line.quantity,
        );
      });
      $("[data-basket-summary]").innerHTML = summaryMarkup();
      toast("Cart quantity updated.");
    });
    document.addEventListener("click", (event) => {
      const button = event.target.closest("[data-remove-line]");
      if (!button) return;
      const oldIndex = basket.findIndex((row) => lineKey(row) === button.dataset.removeLine);
      if (oldIndex < 0) return;
      basket.splice(oldIndex, 1);
      saveBasket();
      renderBasket();
      const next = $$("[data-remove-line]")[Math.min(oldIndex, basket.length - 1)];
      (next || $("[data-basket-lines] a"))?.focus();
      toast("Piece removed from your cart.");
    });
  }
  function boardCard(item) {
    const product = PRODUCT_MAP[item.id];
    return `<article data-board-item="${item.id}" class="min-w-0 border border-line p-5"><img src="${product.art}" width="400" height="330" alt="${escape(product.name)}" class="w-full"><div class="mt-4 flex justify-between text-xs uppercase tracking-widest text-muted"><span>Lot ${product.lot}</span><span>${money(product.price)}${product.unit === "piece" ? "" : ` / ${unitOf(product).one}`}</span></div><h2 class="mt-3 text-3xl"><a href="lot.html?lot=${item.id}">${escape(product.name)}</a></h2><p class="mt-3 text-xs text-muted">${escape(product.dimensions)}</p><label class="label mt-5">Room<select data-board-room="${item.id}" class="field">${ROOMS.map((room) => `<option${room === item.room ? " selected" : ""}>${room}</option>`).join("")}</select></label><label class="label mt-4">Measurements & ideas<textarea data-board-note="${item.id}" rows="3" maxlength="300" class="field">${escape(item.note)}</textarea></label><div class="mt-5 flex flex-wrap gap-x-5 gap-y-3"><button type="button" data-board-add="${item.id}" class="text-link text-sm">Add to cart</button><button type="button" data-board-remove="${item.id}" class="text-link text-sm" aria-label="Remove from board: ${escape(product.name)}">Remove from board</button></div></article>`;
  }
  function boardTotal() {
    return board.items.reduce((sum, item) => sum + PRODUCT_MAP[item.id].price, 0);
  }
  function updateBoardTotal() {
    const total = boardTotal();
    let message = `${plural(board.items.length, "piece")} on your board · ${money(total)} before optional preparation and delivery.`;
    if (board.budget > 0)
      message +=
        total <= board.budget
          ? ` ${money(board.budget - total)} within your working budget.`
          : ` ${money(total - board.budget)} above your working budget.`;
    $("[data-project-total]").textContent = message;
  }
  function renderBoard() {
    const grid = $("[data-project-grid]");
    if (!grid) return;
    grid.innerHTML = board.items.map(boardCard).join("");
    $("[data-project-empty]").hidden = board.items.length > 0;
    updateBoardTotal();
  }
  function initBoard() {
    if (!$("[data-project-grid]")) return;
    $("[data-project-name]").value = board.name;
    $("[data-project-budget]").value = board.budget || "";
    renderBoard();
    $("[data-board-picker]").innerHTML = PRODUCTS.map(
      (product) =>
        `<option value="${product.id}">Lot ${product.lot} · ${escape(product.name)} · ${money(product.price)}</option>`,
    ).join("");
    $("[data-board-pick]").addEventListener("click", () => {
      const id = $("[data-board-picker]").value;
      if (!validProduct(id)) return;
      if (board.items.some((item) => item.id === id)) {
        toast("That piece is already on your board.");
        return;
      }
      board.items.push({ id, room: ROOMS[0], note: "" });
      saveBoard();
      renderBoard();
      toast("Piece saved to your project board.");
    });
    function saved() {
      saveBoard();
      $("[data-project-status]").textContent = "Your project has been updated.";
      updateBoardTotal();
    }
    $("[data-project-name]").addEventListener("input", (event) => {
      board.name = cleanText(event.target.value, 80);
      saved();
    });
    $("[data-project-budget]").addEventListener("input", (event) => {
      if (event.target.value !== "" && Number(event.target.value) < 0) event.target.value = "0";
      board.budget = clamp(event.target.value, 0, 1000000);
      saved();
    });
    document.addEventListener("input", (event) => {
      const id = event.target.dataset.boardNote;
      const item = board.items.find((row) => row.id === id);
      if (item) {
        item.note = cleanText(event.target.value, 300);
        saved();
      }
    });
    document.addEventListener("change", (event) => {
      const id = event.target.dataset.boardRoom;
      const item = board.items.find((row) => row.id === id);
      if (item && ROOMS.includes(event.target.value)) {
        item.room = event.target.value;
        saved();
      }
    });
    document.addEventListener("click", (event) => {
      const remove = event.target.closest("[data-board-remove]");
      if (remove) {
        const index = board.items.findIndex((row) => row.id === remove.dataset.boardRemove);
        if (index < 0) return;
        board.items.splice(index, 1);
        saved();
        renderBoard();
        ($$("[data-board-remove]")[Math.min(index, board.items.length - 1)] || $("[data-project-empty] a"))?.focus();
      }
      const add = event.target.closest("[data-board-add]");
      if (add) addToBasket(add.dataset.boardAdd);
    });
    $("[data-print-board]").addEventListener("click", () => window.print());
  }
  function normalisePostcode(value) {
    return cleanText(value, 10).replace(/\s/g, "");
  }
  // A 5-digit ZIP code with an optional +4.
  const POSTCODE_PATTERN = /^(?!000)\d{5}(-?\d{4})?$/;
  // Routes without a guide price: Puerto Rico and the US Virgin Islands (006-009), Hawaii and the
  // Pacific territories (967-969), Alaska (995-999) and military addresses (090-098, 340, 962-966).
  // These get an individual carrier quote instead.
  const INDIVIDUAL_AREAS = ["006", "007", "008", "009", "340"];
  const INDIVIDUAL_DISTRICTS = /^(09[0-8]|96[2-9]|99[5-9])/;
  function deliveryQuote(value, weight) {
    const postcode = normalisePostcode(value);
    if (!POSTCODE_PATTERN.test(postcode)) return { error: "Enter a 5-digit ZIP code, such as 12180." };
    const area = postcode.slice(0, 3);
    const outward = postcode.slice(0, 5);
    if (INDIVIDUAL_AREAS.includes(area) || INDIVIDUAL_DISTRICTS.test(outward))
      return {
        individual: true,
        area: outward,
        message: `${outward} needs an individual carrier quote. Send us your ZIP code and the lot numbers below and we'll price it.`,
      };
    // Local: the Capital Region. North: the Hudson Valley, the Adirondacks, the Berkshires and southern Vermont.
    const band = ["120", "121", "122", "123"].includes(area)
      ? "local"
      : ["124", "125", "126", "127", "128", "129", "012", "052", "053"].includes(area)
        ? "north"
        : "mainland";
    const load = Math.max(0, Number(weight) || 0);
    const extra = Math.max(0, Math.ceil((load - 100) / 100)) * DELIVERY.perHeavyBand;
    return {
      price: DELIVERY[band] + extra,
      band,
      area: outward,
      weight: load,
      note: "Guide only for one street-level stop with clear access. We confirm handling, route and price before you pay.",
    };
  }
  function initDelivery() {
    const form = $("[data-delivery-form]");
    if (!form) return;
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const weights = { small: 20, medium: 100, heavy: 250 };
      const weight = own(weights, form.elements.load.value) ? weights[form.elements.load.value] : 10;
      const result = deliveryQuote(form.elements.postcode.value, weight);
      $("#delivery-error").textContent = result.error || "";
      form.elements.postcode.setAttribute("aria-invalid", String(Boolean(result.error)));
      $("[data-delivery-result]").textContent = result.error
        ? ""
        : result.individual
          ? result.message
          : `${money(result.price)} guide price to ${result.area} for up to ${weight} lb. ${result.note}`;
      if (result.error) form.elements.postcode.focus();
    });
  }
  function setFieldError(form, name, message, selector = "data-error") {
    const field = form.elements[name];
    const error = $(`[${selector}="${name}"]`, form);
    if (error) error.textContent = message;
    if (field) field.setAttribute("aria-invalid", String(Boolean(message)));
  }
  const validPhone = (value) => /^[+()\d\s-]{7,25}$/.test(value) && value.replace(/\D/g, "").length >= 10;
  function validateContact(form, extra = {}, selector = "data-error") {
    const messages = {
      name: form.elements.name.value.trim().length >= 2 ? "" : "Enter your name (at least two characters).",
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.elements.email.value.trim())
        ? ""
        : "Enter an email address, such as sam@example.com.",
      ...extra,
    };
    let valid = true;
    Object.entries(messages).forEach(([name, message]) => {
      setFieldError(form, name, message, selector);
      if (message) valid = false;
    });
    if (!valid) $('[aria-invalid="true"]', form)?.focus();
    return valid;
  }
  // Preview a date with ?now=YYYY-MM-DD or ?now=YYYY-MM-DDTHH:MM (read as New York time); otherwise the real clock.
  function now() {
    const value = new URLSearchParams(location.search).get("now");
    const match = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?$/.exec(value || "");
    if (match) {
      const date = new Date(Date.UTC(+match[1], +match[2] - 1, +match[3], +(match[4] || 12), +(match[5] || 0)));
      if (!Number.isNaN(date.getTime()) && date.getUTCDate() === +match[3]) {
        // How far New York's clock is from UTC at that moment, so the typed time is read as local.
        const parts = Object.fromEntries(
          new Intl.DateTimeFormat("en-US", {
            timeZone: TIME_ZONE,
            hourCycle: "h23",
            year: "numeric",
            month: "numeric",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
          })
            .formatToParts(date)
            .map((part) => [part.type, part.value]),
        );
        const shown = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute);
        return new Date(date.getTime() - (shown - date.getTime()));
      }
    }
    return new Date();
  }
  // "Wed, Oct 21, 2026"
  const dayLabel = (date) =>
    `${formatDate(date, { weekday: "short" })}, ${formatDate(date, { day: "numeric", month: "short", year: "numeric" })}`;
  const formatDate = (date, options) =>
    new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, ...options }).format(date);
  function readLastRequest() {
    const raw = readJSON(STORAGE_KEYS.lastRequest, null);
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
    const { ref, items, total, method, when } = raw;
    if (typeof ref !== "string" || !/^QN-\d{4}$/.test(ref)) return null;
    if (!Number.isInteger(items) || items < 1 || items > 999) return null;
    if (!Number.isInteger(total) || total < 0 || total > 10000000) return null;
    if (method !== "collect" && method !== "delivery") return null;
    if (typeof when !== "string") return null;
    return { ref, items, total, method, when: cleanText(when, 60) };
  }
  function lastRequestMarkup() {
    const last = readLastRequest();
    if (!last) return "";
    return `<div class="mt-8 border-t border-line pt-5 text-sm"><p class="font-semibold">Your last reservation request: ${last.ref}</p><p class="mt-2 text-muted">${plural(last.items, "item")}, ${money(last.total)}, ${last.method === "collect" ? "for pickup" : "for delivery"}. Requested on ${escape(last.when)}. If we haven't called within one business day, call us at (518) 555-0142 and mention ${last.ref}.</p></div>`;
  }
  // The checkout's delivery choice, for the summary and the confirmation.
  function checkoutDelivery(form) {
    if (form.elements.method.value !== "delivery") return { method: "collect" };
    const quote = deliveryQuote(form.elements.postcode.value, basketWeight());
    if (quote.error) return { method: "delivery" };
    return { method: "delivery", ...quote };
  }
  function collectionDays() {
    return openingDays(8)
      .filter((day) => !day.closed)
      .slice(0, 6);
  }
  /*
   * Sending a reservation request. As written, the request is checked in the browser and the
   * confirmation is shown straight away. To receive requests, create a form at https://formspree.io
   * (or your own endpoint) and replace showConfirmation(details) in the submit handler with:
   *
   *   fetch("https://formspree.io/f/your-form-id", {
   *     method: "POST",
   *     body: new FormData(form),
   *     headers: { Accept: "application/json" },
   *   }).then((response) => (response.ok ? showConfirmation(details) : showSendError()));
   *
   * Only show the confirmation (and clear the cart) when the response is OK; on an error keep the
   * form and the cart, and ask the customer to try again or call the yard.
   */
  function initCheckout() {
    const form = $("[data-checkout-form]");
    if (!form) return;
    const content = $("[data-checkout-content]");
    const empty = $("[data-checkout-empty]");
    const done = $("[data-checkout-done]");
    if (!basket.length) {
      content.hidden = true;
      empty.hidden = false;
      $("[data-checkout-last]").innerHTML = lastRequestMarkup();
      return;
    }
    $("[data-checkout-items]").innerHTML = basket
      .map((row) => {
        const product = PRODUCT_MAP[row.id];
        const finish = finishFor(product, row.finish);
        return `<div class="grid grid-cols-[64px_1fr] gap-4 border-b border-line py-4"><img src="${product.art}" width="400" height="330" alt="" class="w-full"><div class="min-w-0"><p class="font-semibold">${escape(product.name)}</p><p class="mt-1 text-sm text-muted">Lot ${product.lot} · ${units(product, row.quantity)} · ${escape(finish.label)}</p><p class="mt-1 text-sm">${money((product.price + finish.extra) * row.quantity)}</p></div></div>`;
      })
      .join("");
    const days = collectionDays();
    form.elements.day.innerHTML =
      '<option value="">Any opening day</option>' +
      days
        .map(
          (day) =>
            `<option value="${day.key}">${formatDate(day.date, { weekday: "long", day: "numeric", month: "long" })}</option>`,
        )
        .join("");
    const postcodeField = $("[data-postcode-field]");
    const dayField = $("[data-day-field]");
    function update() {
      const delivery = form.elements.method.value === "delivery";
      postcodeField.hidden = !delivery;
      dayField.hidden = delivery;
      $("[data-checkout-summary]").innerHTML = summaryMarkup(checkoutDelivery(form));
    }
    form.addEventListener("change", (event) => {
      if (event.target.name === "method") update();
    });
    form.elements.postcode.addEventListener("input", update);
    form.addEventListener("input", (event) => {
      if (event.target.getAttribute("aria-invalid") === "true") setFieldError(form, event.target.name, "");
    });
    update();
    function showConfirmation(details) {
      const lines = basket.map((row) => {
        const product = PRODUCT_MAP[row.id];
        const finish = finishFor(product, row.finish);
        return `<li class="flex justify-between gap-4 border-b border-line py-3"><span>Lot ${product.lot} · ${escape(product.name)} · ${units(product, row.quantity)}${finish.extra ? `, ${escape(finish.label.toLowerCase())}` : ""}</span><span class="shrink-0">${money((product.price + finish.extra) * row.quantity)}</span></li>`;
      });
      const held = new Date(details.when.getTime() + HOLD_HOURS * 3600000);
      $("[data-done-title]").textContent = `Reservation request ${details.ref} received.`;
      $("[data-done-intro]").textContent =
        `Thanks, ${details.first}. We'll call you at ${details.phone} within one business day to go through condition, measurements and ${details.plan}. The pieces are held for you until ${formatDate(
          held,
          { weekday: "long", day: "numeric", month: "long", hour: "numeric", minute: "2-digit", hour12: true },
        )
          .replace(/\s*(AM|PM)$/, (match, period) => period.toLowerCase())}.`;
      $("[data-done-lines]").innerHTML =
        lines.join("") +
        `<li class="flex justify-between gap-4 py-3 font-semibold"><span>${details.totalLabel}</span><span>${money(details.total)}</span></li>`;
      safeStorage.setItem(
        STORAGE_KEYS.lastRequest,
        JSON.stringify({
          ref: details.ref,
          items: basketCount(),
          total: details.total,
          method: details.method,
          when: dayLabel(details.when),
        }),
      );
      basket = [];
      saveBasket();
      content.hidden = true;
      done.hidden = false;
      done.focus();
      done.scrollIntoView({ block: "start" });
    }
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const phone = form.elements.phone.value.trim();
      const delivery = form.elements.method.value === "delivery";
      const quote = delivery ? deliveryQuote(form.elements.postcode.value, basketWeight()) : {};
      const valid = validateContact(form, {
        phone: validPhone(phone) ? "" : "Enter a phone number we can call, such as (518) 555-0164.",
        postcode: !delivery || !quote.error ? "" : "Enter the delivery ZIP code, such as 12180.",
      });
      if (!valid || !basket.length) return;
      const goods = basketCost();
      const day = days.find((option) => option.key === form.elements.day.value);
      const details = {
        ref: `QN-${String(Math.floor(1000 + Math.random() * 9000))}`,
        first: cleanText(form.elements.name.value.trim().split(/\s+/)[0], 40),
        phone: cleanText(phone, 25),
        when: now(),
        method: delivery ? "delivery" : "collect",
        plan: delivery
          ? quote.individual
            ? `a carrier quote for delivery to ${quote.area}`
            : `delivery to ${quote.area}`
          : day
            ? `pickup on ${formatDate(day.date, { weekday: "long", day: "numeric", month: "long" })}`
            : "a pickup day",
        total: delivery && quote.price ? goods + quote.price : goods,
        totalLabel: delivery
          ? quote.price
            ? "Estimated total with delivery, before sales tax"
            : "Subtotal before sales tax (delivery quoted separately)"
          : "Total at pickup, before sales tax",
      };
      showConfirmation(details);
    });
  }
  function initCare() {
    const form = $("[data-care-form]");
    if (!form) return;
    function render() {
      const query = form.elements.q.value.trim().toLowerCase();
      const material = form.elements.material.value;
      const matches = GUIDES.filter(
        (guide) =>
          (material === "all" || guide.material === material) &&
          `${guide.title} ${guide.summary} ${guide.steps.join(" ")} ${guide.caution}`.toLowerCase().includes(query),
      );
      $("[data-care-grid]").innerHTML = matches
        .map(
          (guide) =>
            `<article class="min-w-0 border border-line p-6 sm:p-8"><p class="eyebrow">${escape(guide.material)} / ${plural(guide.steps.length, "step")}</p><h2 class="mt-4 text-4xl">${escape(guide.title)}</h2><p class="mt-5 leading-relaxed text-muted">${escape(guide.summary)}</p><details class="mt-5 border-t border-line pt-4"><summary class="cursor-pointer text-sm font-semibold">Read the care note</summary><ol class="mt-5 list-decimal space-y-4 pl-5 text-sm leading-relaxed text-muted">${guide.steps.map((step) => `<li>${escape(step)}</li>`).join("")}</ol><p class="mt-6 border-l-2 border-rust pl-4 text-sm leading-relaxed text-rust">${escape(guide.caution)}</p></details></article>`,
        )
        .join("");
      $("[data-care-count]").textContent = plural(matches.length, "care note");
      $("[data-care-empty]").hidden = matches.length > 0;
    }
    form.addEventListener("submit", (event) => event.preventDefault());
    form.addEventListener("input", render);
    render();
  }
  function initTeam() {
    const container = $("[data-team]");
    if (!container) return;
    container.innerHTML = TEAM.map(
      (person) =>
        `<article class="min-w-0"><div class="relative overflow-hidden bg-wash"><img src="${person.portrait}" width="400" height="300" alt="${escape(person.look)}" class="w-full"><span class="absolute bottom-4 left-4 text-xs tracking-widest text-ink">Q / ${escape(person.initials)}</span></div><p class="eyebrow mt-6">${escape(person.role)}</p><h2 class="mt-3 text-3xl">${escape(person.name)}</h2><p class="mt-4 text-sm leading-relaxed text-muted">${escape(person.text)}</p></article>`,
    ).join("");
  }
  // Dates are worked out as "YYYY-MM-DD" keys in New York time, then handled as noon UTC.
  const keyOf = (year, month, day) => `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const dateOf = (key) => new Date(`${key}T12:00:00Z`);
  const addDays = (key, days) => {
    const date = dateOf(key);
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().slice(0, 10);
  };
  const weekday = (key) => dateOf(key).getUTCDay();
  function londonKey(date) {
    const parts = Object.fromEntries(
      new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" })
        .formatToParts(date)
        .filter((part) => part.type !== "literal")
        .map((part) => [part.type, part.value]),
    );
    return `${parts.year}-${parts.month}-${parts.day}`;
  }
  // US federal holidays for any year, as { "YYYY-MM-DD": name }. A fixed-date holiday that falls on a
  // weekend is also marked on its observed weekday (Saturday to Friday, Sunday to Monday), and the yard
  // stays shut on the date itself, since it opens on Saturdays.
  const holidayCache = Object.create(null);
  function bankHolidays(year) {
    if (holidayCache[year]) return holidayCache[year];
    const out = Object.create(null);
    const nthWeekday = (month, target, count) => {
      let key = keyOf(year, month, 1);
      while (weekday(key) !== target) key = addDays(key, 1);
      return addDays(key, (count - 1) * 7);
    };
    const lastMonday = (month) => {
      let key = addDays(month === 12 ? keyOf(year + 1, 1, 1) : keyOf(year, month + 1, 1), -1);
      while (weekday(key) !== 1) key = addDays(key, -1);
      return key;
    };
    const fixed = (month, day, name) => {
      const key = keyOf(year, month, day);
      out[key] = name;
      if (weekday(key) === 6) out[addDays(key, -1)] = `${name} (observed)`;
      if (weekday(key) === 0) out[addDays(key, 1)] = `${name} (observed)`;
    };
    fixed(1, 1, "New Year’s Day");
    out[nthWeekday(1, 1, 3)] = "Martin Luther King Jr. Day";
    out[nthWeekday(2, 1, 3)] = "Washington’s Birthday";
    out[lastMonday(5)] = "Memorial Day";
    fixed(6, 19, "Juneteenth");
    fixed(7, 4, "Independence Day");
    out[nthWeekday(9, 1, 1)] = "Labor Day";
    out[nthWeekday(10, 1, 2)] = "Columbus Day";
    fixed(11, 11, "Veterans Day");
    out[nthWeekday(11, 4, 4)] = "Thanksgiving Day";
    fixed(12, 25, "Christmas Day");
    // When next New Year's Day is a Saturday, it's observed on December 31 of this year.
    if (weekday(keyOf(year + 1, 1, 1)) === 6) out[keyOf(year, 12, 31)] = "New Year’s Day (observed)";
    holidayCache[year] = out;
    return out;
  }
  // Why the yard is shut on an opening weekday, or null when it's open.
  function closedReason(key) {
    const holidays = bankHolidays(Number(key.slice(0, 4)));
    if (CLOSE_ON_BANK_HOLIDAYS && own(holidays, key)) return holidays[key];
    const monthDay = key.slice(5);
    const closure = YARD_CLOSURES.find((range) =>
      range.from <= range.to
        ? monthDay >= range.from && monthDay <= range.to
        : monthDay >= range.from || monthDay <= range.to,
    );
    return closure ? closure.label : null;
  }
  // The next `count` open days from today, with any closed opening weekdays in between (reason given).
  function openingDays(count = 6) {
    const days = [];
    let key = londonKey(now());
    for (let step = 0; step < 120 && days.filter((day) => !day.closed).length < count; step++) {
      if (OPEN_WEEKDAYS.includes(weekday(key))) {
        const reason = closedReason(key);
        days.push({ key, date: dateOf(key), closed: Boolean(reason), reason });
      }
      key = addDays(key, 1);
    }
    return days;
  }
  function initDates() {
    $$("[data-year]").forEach((element) => {
      element.textContent = formatDate(now(), { year: "numeric" });
    });
    const container = $("[data-opening-days]");
    if (!container) return;
    // Runs of closed days for the same reason (a Christmas break) collapse into one card.
    const cards = [];
    openingDays(6).forEach((day) => {
      const last = cards[cards.length - 1];
      if (day.closed && last?.closed && last.reason === day.reason) last.end = day;
      else cards.push({ ...day });
    });
    container.innerHTML = cards
      .map((card) =>
        card.closed
          ? `<div class="border border-dashed border-line p-4"><p class="text-sm font-semibold">${dayLabel(card.date)}${card.end ? ` – ${dayLabel(card.end.date)}` : ""}</p><p class="mt-2 text-xs text-rust">Closed · ${escape(card.reason)}</p></div>`
          : `<div class="border border-line bg-white/40 p-4"><p class="text-sm font-semibold">${dayLabel(card.date)}</p><p class="mt-2 text-xs text-muted">Open ${OPENING_HOURS} · yard & covered store</p></div>`,
      )
      .join("");
  }
  const CONTACT_TOPICS = {
    stock: "A piece in stock",
    selling: "Offering pieces to the yard",
    delivery: "Delivery or pickup",
    other: "Something else",
  };
  /*
   * The contact form checks the fields in the browser and then shows the thank-you message. To
   * receive questions, post the form to Formspree (https://formspree.io) or your own endpoint in the
   * submit handler, in place of showThanks():
   *
   *   fetch("https://formspree.io/f/your-form-id", {
   *     method: "POST",
   *     body: new FormData(form),
   *     headers: { Accept: "application/json" },
   *   }).then((response) => (response.ok ? showThanks() : showSendError()));
   *
   * Show the thank-you message only once the response is OK.
   */
  function initContact() {
    const form = $("[data-contact-form]");
    if (!form) return;
    const params = new URLSearchParams(location.search);
    form.elements.topic.innerHTML = Object.entries(CONTACT_TOPICS)
      .map(([value, label]) => `<option value="${value}">${label}</option>`)
      .join("");
    const topic = params.get("topic");
    if (topic && own(CONTACT_TOPICS, topic)) form.elements.topic.value = topic;
    const lot = params.get("lot");
    if (validProduct(lot)) {
      form.elements.topic.value = "stock";
      form.elements.message.value = `About lot ${PRODUCT_MAP[lot].lot}, ${PRODUCT_MAP[lot].name}: `;
    }
    const result = $("[data-contact-result]");
    form.addEventListener("input", (event) => {
      if (event.target.getAttribute("aria-invalid") === "true")
        setFieldError(form, event.target.name, "", "data-contact-error");
    });
    function showThanks() {
      const first = cleanText(form.elements.name.value.trim().split(/\s+/)[0], 40);
      const selling = form.elements.topic.value === "selling";
      $("[data-contact-thanks]").textContent = `Thanks, ${first}. Your message is with the yard.`;
      $("[data-contact-next]").textContent = selling
        ? "Lowenna looks through offers on Wednesdays and replies within a week, usually by email. If the pieces suit us, she'll arrange a visit to see them."
        : "We reply within one business day, usually by email. If you gave a lot number, we'll check the piece on the shelf before we answer.";
      form.hidden = true;
      result.hidden = false;
      result.focus();
    }
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const message = form.elements.message.value.trim();
      if (
        !validateContact(
          form,
          { message: message.length >= 10 ? "" : "Add a little more detail (at least ten characters)." },
          "data-contact-error",
        )
      )
        return;
      showThanks();
    });
    $("[data-contact-again]").addEventListener("click", () => {
      form.reset();
      result.hidden = true;
      form.hidden = false;
      form.elements.name.focus();
    });
  }
  const featured = $("[data-featured]");
  if (featured)
    featured.innerHTML = PRODUCTS.filter((product) => product.featured)
      .map((product) => card(product, true))
      .join("");
  initMenu();
  initStock();
  initLot();
  initQuickLook();
  initProductActions();
  initBasket();
  initBoard();
  initDelivery();
  initCheckout();
  initCare();
  initTeam();
  initDates();
  initContact();
  updateBasketCount();
  updateSaveButtons();
  revealNew();
})();
