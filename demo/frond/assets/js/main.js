/* Frond: the plant room.
 * All prices and availability come from FROND_PRODUCTS in data.js. Dates (shipping, pickup,
 * federal holidays, the copyright year) are worked out in America/Los_Angeles time from today, so the demo
 * never goes stale. Add ?now=YYYY-MM-DDTHH:MM to any page to preview another moment.
 * No requests, payments or orders are made by this script.
 */
(() => {
  "use strict";

  const PRODUCTS = window.FROND_PRODUCTS || [];
  const PRODUCT_MAP = Object.fromEntries(PRODUCTS.map((plant) => [plant.id, plant]));
  const BASKET_KEY = "frond-basket-v1";
  const OPTIONS_KEY = "frond-options-v1";
  const LAST_ORDER_KEY = "frond-last-order-v1";
  const TIME_ZONE = "America/Los_Angeles";
  const FREE_DELIVERY = 7500; // cents, after discounts
  const DELIVERY_PRICE = 895;
  const GIFT_WRAP_PRICE = 500;
  const GIFT_MESSAGE_MAX = 150;
  const COUPON = "GROW10";
  const SHOP_ADDRESS = "18 East 5th Avenue, Eugene, OR 97401";

  // Shipping rule. Plants go out Monday through Thursday only, so they never sit in a courier warehouse
  // over a weekend. Orders placed before the cutoff on a shipping day leave that afternoon; later orders
  // go on the next shipping day. US federal holidays (computed below) are never shipping days.
  const DISPATCH = { cutoff: "12:00", days: [1, 2, 3, 4], transit: "1–2 business days" };
  // Opening hours by weekday (0 = Sunday), as [open, close]; null = closed. Pickup orders are
  // ready the next day the shop is open, so we can check and wrap each plant.
  const HOURS = {
    0: ["11:00", "15:00"],
    1: null,
    2: ["10:00", "17:00"],
    3: ["10:00", "17:00"],
    4: ["10:00", "17:00"],
    5: ["10:00", "17:00"],
    6: ["10:00", "17:00"],
  };
  const BANK_HOLIDAY_HOURS = ["11:00", "15:00"];
  // Days the shop is shut every year ('MM-DD'), whatever the weekday. Add one-off closures here too.
  const SHOP_CLOSED = ["12-25", "01-01"];
  // Thanksgiving moves every year, so it is closed by name rather than by date.
  const THANKSGIVING = "Thanksgiving";

  const SIZES = { standard: "Standard", large: "Large" };
  const POTS = { growing: "Nursery pot", ceramic: "Ceramic cover pot" };
  const LIGHTS = {
    bright: "Bright, indirect light",
    soft: "Soft, indirect light",
    low: "Lower light",
  };
  const LIGHT_ORDER = { bright: 2, soft: 1, low: 0 };
  const CARE_LEVELS = {
    easy: "Easy-going",
    regular: "Regular attention",
  };
  const ROOMS = { desk: "Desk", shelf: "Shelf", statement: "Statement" };
  const ROOM_TEXT = {
    Desk: "a desk or table plant",
    Shelf: "a shelf or trailing plant",
    Statement: "a floor-standing statement plant",
  };
  // ZIP codes our courier reaches, around Eugene: Eugene and Coburg, Springfield, Pleasant Hill, Creswell,
  // Cottage Grove, Junction City, Veneta and Harrisburg. PO box ZIP codes are left out on purpose.
  // Oregon has no sales tax, and every ZIP code here is in Oregon, so no checkout adds any.
  const DELIVERY_ZIPS = [
    "97401",
    "97402",
    "97403",
    "97404",
    "97405",
    "97408",
    "97477",
    "97478",
    "97455",
    "97426",
    "97424",
    "97448",
    "97487",
    "97446",
  ];
  const SYMPTOMS = {
    yellow: {
      title: "Start with the soil.",
      copy: "An occasional older leaf can yellow naturally. Several at once, with wet soil, can point to roots staying too damp. Check the drainage hole and empty any water in the cover pot.",
      action:
        "Let the plant dry to its recommended depth before watering again. If the stems are soft or there is a sour smell, ask us to look at a photo of the roots.",
    },
    brown: {
      title: "Check the air, then the water.",
      copy: "Brown tips can follow a dry spell, hot air from a heating vent or mineral build-up. They cannot turn green again, but the next leaves can grow well.",
      action:
        "Move away from heat and check the soil before changing your routine. For sensitive plants, try rainwater or filtered water. Don’t compensate with repeated heavy watering.",
    },
    droop: {
      title: "Drooping can mean two things.",
      copy: "A dry plant and an overwatered plant can both droop. Feel the soil and lift the pot before reaching for a watering can.",
      action:
        "If dry and light, water thoroughly and let it drain. If wet and heavy, stop watering and check for blocked drainage. Avoid feeding a plant while it is struggling.",
    },
    pests: {
      title: "Give this one a little space.",
      copy: "Fine webs, sticky patches or moving specks deserve a closer look. Isolate the plant from its neighbors and check both sides of each leaf.",
      action:
        "Wipe accessible leaves with a damp cloth and photograph what you see. Ask us to help identify the pest before choosing a treatment; follow product instructions carefully.",
    },
    lean: {
      title: "Follow the light.",
      copy: "Long gaps between leaves and a pronounced lean often mean the plant is reaching for more light. A dark corner can keep a tolerant plant alive without helping it grow well.",
      action:
        "Move it gradually closer to indirect light, avoiding a sudden jump into direct sun. Turn it a quarter turn each week. Trim stretched vines only once healthy growth returns.",
    },
  };

  const own = (map, key) => Object.prototype.hasOwnProperty.call(map, key);
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const html = (value) =>
    String(value).replace(
      /[&<>"']/g,
      (character) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[character],
    );
  const money = (pence) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: pence % 100 ? 2 : 0,
    }).format(pence / 100);
  const plural = (number, one, many = `${one}s`) => (number === 1 ? one : many);
  const integer = (value, min, max) => {
    const number = Number(value);
    return Number.isFinite(number) ? Math.min(max, Math.max(min, Math.floor(number))) : min;
  };
  // "Philodendron ‘Prince of Orange’": the botanical name in italics, the cultivar in quotes, upright.
  const botanicalText = (plant) => `${plant.botanical}${plant.cultivar ? ` ‘${plant.cultivar}’` : ""}`;
  const botanicalHTML = (plant) =>
    `<i>${html(plant.botanical)}</i>${plant.cultivar ? ` ‘${html(plant.cultivar)}’` : ""}`;
  const potText = (plant) => `${plant.pot} pot, ${plant.glaze} glaze`;
  const iconArrow =
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6"/></svg>';
  const iconMinus =
    '<svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 10h12"/></svg>';
  const iconPlus =
    '<svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 10h12M10 4v12"/></svg>';
  const iconVan =
    '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true" class="mt-0.5 shrink-0"><path d="M3 6h11v10H3zM14 9h4l3 3v4h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17.5" cy="17.5" r="1.8"/></svg>';

  /* ------------------------------------------------------------------
   * Dates in America/Los_Angeles: today, federal holidays, shipping and pickup
   * ------------------------------------------------------------------ */
  const pad = (n) => String(n).padStart(2, "0");
  const keyOf = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;
  const toDate = (key) => new Date(`${key}T12:00:00Z`);
  const addDays = (key, n) => {
    const date = toDate(key);
    date.setUTCDate(date.getUTCDate() + n);
    return date.toISOString().slice(0, 10);
  };
  const weekday = (key) => toDate(key).getUTCDay();
  const toMins = (time) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));
  const clock = (mins) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 12 && !m) return "12 noon";
    return `${h % 12 || 12}${m ? `:${pad(m)}` : ""}${h < 12 ? "am" : "pm"}`;
  };
  const fmtDate = (key, opts = {}) =>
    new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      timeZone: "UTC",
      ...opts,
    }).format(toDate(key));

  // ?now=2026-12-24T15:30 previews the site at that Pacific time (for review and screenshots).
  const PREVIEW = (() => {
    const raw = new URLSearchParams(window.location.search).get("now");
    if (typeof raw !== "string") return null;
    const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
    if (
      !match ||
      +match[2] < 1 ||
      +match[2] > 12 ||
      +match[3] < 1 ||
      +match[3] > 31 ||
      +match[4] > 23 ||
      +match[5] > 59
    )
      return null;
    const date = keyOf(+match[1], +match[2], +match[3]);
    if (toDate(date).toISOString().slice(0, 10) !== date) return null;
    return { date, mins: +match[4] * 60 + +match[5] };
  })();

  function shopNow() {
    if (PREVIEW) return PREVIEW;
    const parts = Object.fromEntries(
      new Intl.DateTimeFormat("en-US", {
        timeZone: TIME_ZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      })
        .formatToParts(new Date())
        .map((part) => [part.type, part.value]),
    );
    return { date: `${parts.year}-${parts.month}-${parts.day}`, mins: Number(parts.hour) * 60 + Number(parts.minute) };
  }

  const holidayCache = Object.create(null);
  // US federal holidays for any year, from the rules (no list of dates to go out of date). A holiday on
  // a Saturday is observed on the Friday before and one on a Sunday on the Monday after, so New Year's
  // Day can fall on December 31 of the year before. The second Monday of October is a federal holiday
  // under the name Columbus Day; Oregon calls it Indigenous Peoples' Day.
  function bankHolidays(y) {
    if (holidayCache[y]) return holidayCache[y];
    const out = Object.create(null);
    // The nth given weekday of a month, for example the third Monday of January.
    const nthWeekday = (month, day, n) => {
      let k = keyOf(y, month, 1);
      while (weekday(k) !== day) k = addDays(k, 1);
      return addDays(k, (n - 1) * 7);
    };
    const lastMonday = (month) => {
      let k = addDays(keyOf(y, month + 1, 1), -1);
      while (weekday(k) !== 1) k = addDays(k, -1);
      return k;
    };
    const fixed = (key, name) => {
      const day = weekday(key);
      if (day === 6) return [addDays(key, -1), `${name} (observed)`];
      if (day === 0) return [addDays(key, 1), `${name} (observed)`];
      return [key, name];
    };
    const add = ([key, name]) => {
      if (key.startsWith(`${y}-`)) out[key] = name;
    };
    add(fixed(keyOf(y, 1, 1), "New Year’s Day"));
    out[nthWeekday(1, 1, 3)] = "Martin Luther King Jr. Day";
    out[nthWeekday(2, 1, 3)] = "Presidents’ Day";
    out[lastMonday(5)] = "Memorial Day";
    add(fixed(keyOf(y, 6, 19), "Juneteenth"));
    add(fixed(keyOf(y, 7, 4), "Independence Day"));
    out[nthWeekday(9, 1, 1)] = "Labor Day";
    out[nthWeekday(10, 1, 2)] = "Indigenous Peoples’ Day";
    add(fixed(keyOf(y, 11, 11), "Veterans Day"));
    out[nthWeekday(11, 4, 4)] = THANKSGIVING;
    add(fixed(keyOf(y, 12, 25), "Christmas Day"));
    add(fixed(keyOf(y + 1, 1, 1), "New Year’s Day"));
    holidayCache[y] = out;
    return out;
  }
  const isBankHoliday = (key) => own(bankHolidays(Number(key.slice(0, 4))), key);

  function isDispatchDay(key) {
    return DISPATCH.days.includes(weekday(key)) && !isBankHoliday(key) && !SHOP_CLOSED.includes(key.slice(5));
  }
  function nextDispatchDay(key) {
    let k = key;
    while (!isDispatchDay(k)) k = addDays(k, 1);
    return k;
  }
  // The day an order placed now leaves us: today before the cutoff on a shipping day, else the next one.
  function dispatchDate(now = shopNow()) {
    if (isDispatchDay(now.date) && now.mins < toMins(DISPATCH.cutoff)) return now.date;
    return nextDispatchDay(addDays(now.date, 1));
  }
  function hoursOn(key) {
    if (SHOP_CLOSED.includes(key.slice(5))) return null;
    const holiday = bankHolidays(Number(key.slice(0, 4)))[key];
    if (holiday === THANKSGIVING) return null;
    if (holiday) return BANK_HOLIDAY_HOURS;
    return HOURS[weekday(key)];
  }
  // Pickup orders are ready the next day the shop is open.
  function collectionDate(now = shopNow()) {
    let k = addDays(now.date, 1);
    while (!hoursOn(k)) k = addDays(k, 1);
    return k;
  }
  // "today", "tomorrow" or "on Tuesday, October 20".
  function relativeDay(key, now = shopNow()) {
    if (key === now.date) return `today, ${fmtDate(key)}`;
    if (key === addDays(now.date, 1)) return `tomorrow, ${fmtDate(key)}`;
    return `on ${fmtDate(key)}`;
  }
  function dispatchLine(now = shopNow()) {
    const sent = dispatchDate(now);
    if (sent === now.date) {
      const left = toMins(DISPATCH.cutoff) - now.mins;
      const hrs = Math.floor(left / 60);
      const mins = left % 60;
      const within = hrs
        ? `${hrs} ${plural(hrs, "hr")}${mins ? ` ${mins} ${plural(mins, "min")}` : ""}`
        : `${mins} ${plural(mins, "min")}`;
      return `Order within ${within} and we ship it today, ${fmtDate(sent)}.`;
    }
    return `Order now and we ship it ${relativeDay(sent, now)}.`;
  }

  /* ------------------------------------------------------------------
   * Storage: every read, write and removal goes through safeStorage
   * ------------------------------------------------------------------ */
  // The map remains the source of truth if the browser starts denying writes after an earlier read,
  // and stands in for localStorage entirely when access throws (sandboxed iframes, strict privacy).
  const safeStorage = (() => {
    const memory = new Map();
    let available = true;
    return {
      get(key) {
        if (memory.has(key)) return memory.get(key);
        if (available) {
          try {
            const value = window.localStorage.getItem(key);
            if (value !== null) memory.set(key, value);
            return value;
          } catch (_) {
            available = false;
          }
        }
        return null;
      },
      set(key, value) {
        memory.set(key, String(value));
        if (available) {
          try {
            window.localStorage.setItem(key, String(value));
          } catch (_) {
            available = false;
          }
        }
      },
      remove(key) {
        memory.delete(key);
        if (available) {
          try {
            window.localStorage.removeItem(key);
          } catch (_) {
            available = false;
          }
        }
      },
    };
  })();

  function readJSON(key, fallback) {
    try {
      return JSON.parse(safeStorage.get(key)) ?? fallback;
    } catch (_) {
      return fallback;
    }
  }

  function stock(plant, size) {
    return size === "large" ? plant.largeStock : plant.stock;
  }

  function coverPrice(size) {
    return size === "large" ? 1200 : 800;
  }

  function price(plant, size = "standard", pot = "growing") {
    return (plant.price + (size === "large" ? plant.largeDelta : 0)) * 100 + (pot === "ceramic" ? coverPrice(size) : 0);
  }

  function variantKey(item) {
    return `${item.id}:${item.size}:${item.pot}`;
  }

  function cleanBasket(raw) {
    if (!Array.isArray(raw)) return [];
    const cleaned = [];
    const usedStock = Object.create(null);
    for (const item of raw.slice(0, 60)) {
      if (!item || typeof item !== "object" || Array.isArray(item)) continue;
      if (typeof item.id !== "string" || !own(PRODUCT_MAP, item.id)) continue;
      if (typeof item.size !== "string" || typeof item.pot !== "string") continue;
      if (!own(SIZES, item.size) || !own(POTS, item.pot)) continue;
      const plant = PRODUCT_MAP[item.id];
      const inventoryKey = `${plant.id}:${item.size}`;
      const used = usedStock[inventoryKey] || 0;
      const remaining = Math.max(0, stock(plant, item.size) - used);
      if (!remaining) continue;
      if (typeof item.qty !== "number") continue;
      const count = item.qty;
      if (!Number.isFinite(count) || count < 1) continue;
      const qty = integer(count, 1, remaining);
      const existing = cleaned.find((line) => variantKey(line) === variantKey(item));
      if (existing) existing.qty += qty;
      else cleaned.push({ id: plant.id, size: item.size, pot: item.pot, qty });
      usedStock[inventoryKey] = used + qty;
    }
    return cleaned;
  }

  function cleanOptions(raw) {
    const candidate = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
    return {
      shipping: candidate.shipping === "collect" ? "collect" : "standard",
      postcode:
        typeof candidate.postcode === "string"
          ? /^[\d-]{1,10}$/.test(candidate.postcode.trim())
            ? candidate.postcode.trim()
            : ""
          : "",
      coupon: candidate.coupon === COUPON ? COUPON : "",
    };
  }

  // The last order placed in this browser: { number: "FR-12345", items, total (cents), when }.
  function readLastOrder() {
    const order = readJSON(LAST_ORDER_KEY, null);
    if (!order || typeof order !== "object" || Array.isArray(order)) return null;
    if (typeof order.number !== "string" || !/^FR-\d{5}$/.test(order.number)) return null;
    if (typeof order.total !== "number" || !Number.isInteger(order.total) || order.total < 0 || order.total > 1e7)
      return null;
    if (typeof order.items !== "number" || !Number.isInteger(order.items) || order.items < 1 || order.items > 999)
      return null;
    if (typeof order.when !== "string") return null;
    return { number: order.number, total: order.total, items: order.items, when: order.when.slice(0, 120) };
  }
  function lastOrderHTML() {
    const order = readLastOrder();
    if (!order) return "";
    return `<div class="mt-6 rounded-2xl border border-line bg-white p-5 text-sm"><p class="font-bold">Your last order: ${html(order.number)}</p><p class="mt-1 text-muted">${order.items} ${plural(order.items, "plant")}, ${money(order.total)}. ${html(order.when)}</p></div>`;
  }

  let basket = cleanBasket(readJSON(BASKET_KEY, []));
  let options = cleanOptions(readJSON(OPTIONS_KEY, {}));
  // Persist the sanitized representation, never prices or personal information.
  safeStorage.set(BASKET_KEY, JSON.stringify(basket));
  safeStorage.set(OPTIONS_KEY, JSON.stringify(options));

  function persist() {
    basket = cleanBasket(basket);
    safeStorage.set(BASKET_KEY, JSON.stringify(basket));
    safeStorage.set(OPTIONS_KEY, JSON.stringify(cleanOptions(options)));
    updateBadges();
  }

  function countBasket() {
    return basket.reduce((sum, item) => sum + item.qty, 0);
  }

  function updateBadges() {
    const count = countBasket();
    $$("[data-basket-count]").forEach((badge) => {
      badge.textContent = String(count);
      badge.parentElement.setAttribute("aria-label", `Cart, ${count} ${plural(count, "item")}`);
    });
  }

  let noticeTimer;
  function announce(message) {
    const status = $("#site-status");
    if (!status) return;
    clearTimeout(noticeTimer);
    status.hidden = false;
    status.classList.remove("hidden");
    status.textContent = message;
    noticeTimer = setTimeout(() => {
      status.hidden = true;
      status.classList.add("hidden");
    }, 5500);
  }

  function availableToAdd(id, size) {
    if (!own(PRODUCT_MAP, id)) return 0;
    const used = basket.filter((line) => line.id === id && line.size === size).reduce((sum, line) => sum + line.qty, 0);
    return Math.max(0, stock(PRODUCT_MAP[id], size) - used);
  }

  function addPlant(id, size = "standard", pot = "growing", requested = 1) {
    if (!own(PRODUCT_MAP, id) || !own(SIZES, size) || !own(POTS, pot)) return false;
    const plant = PRODUCT_MAP[id];
    const available = availableToAdd(id, size);
    if (!available) {
      announce(`Every ${plant.name.toLowerCase()} we have in this size is already in your cart.`);
      return false;
    }
    const qty = integer(requested, 1, available);
    const key = variantKey({ id, size, pot });
    const existing = basket.find((line) => variantKey(line) === key);
    if (existing) existing.qty += qty;
    else basket.push({ id, size, pot, qty });
    persist();
    document.dispatchEvent(new CustomEvent("frond:basket-change"));
    announce(
      `${qty} ${plural(qty, "plant")} added: ${plant.name}. Cart: ${countBasket()} ${plural(countBasket(), "item")}.`,
    );
    return true;
  }

  // Totals in cents. `extras.giftWrap` adds gift wrapping at checkout.
  function totals(extras = {}) {
    const subtotal = basket.reduce((sum, item) => sum + price(PRODUCT_MAP[item.id], item.size, item.pot) * item.qty, 0);
    const discount = options.coupon === COUPON ? Math.round(subtotal * 0.1) : 0;
    const afterDiscount = subtotal - discount;
    const shipping =
      !basket.length || options.shipping === "collect" || afterDiscount >= FREE_DELIVERY ? 0 : DELIVERY_PRICE;
    const wrap = extras.giftWrap && basket.length ? GIFT_WRAP_PRICE : 0;
    return { subtotal, discount, shipping, wrap, afterDiscount, total: afterDiscount + shipping + wrap };
  }

  function totalsHTML(extras = {}, showRemaining = true) {
    const total = totals(extras);
    const remaining = Math.max(0, FREE_DELIVERY - total.afterDiscount);
    return `<dl class="space-y-3 text-sm">
      <div class="flex justify-between gap-4"><dt>Plants &amp; pots</dt><dd>${money(total.subtotal)}</dd></div>
      ${total.discount ? `<div class="flex justify-between gap-4"><dt>Welcome, 10% off</dt><dd>−${money(total.discount)}</dd></div>` : ""}
      ${total.wrap ? `<div class="flex justify-between gap-4"><dt>Gift wrapping</dt><dd>${money(total.wrap)}</dd></div>` : ""}
      <div class="flex justify-between gap-4"><dt>${options.shipping === "collect" ? "Store pickup" : "Local delivery"}</dt><dd>${total.shipping ? money(total.shipping) : "Free"}</dd></div>
      <div class="flex justify-between gap-4 border-t border-line pt-4 text-xl font-bold"><dt>Total</dt><dd data-grand-total>${money(total.total)}</dd></div>
      </dl><p class="mt-4 text-xs text-muted">Oregon has no sales tax, so none is added.</p>${showRemaining && basket.length && options.shipping === "standard" && remaining ? `<p class="mt-4 text-sm text-muted">${money(remaining)} away from free delivery after discounts.</p>` : ""}`;
  }

  function productCard(plant, extra = {}) {
    const { reason = "", grade = "" } = extra;
    return `<article class="min-w-0" data-product="${plant.id}">
      <a href="product.html?plant=${plant.id}" class="group relative block overflow-hidden rounded-[1.4rem] bg-cloud">
        <img src="assets/img/${plant.id}.svg" width="400" height="420" alt="${html(plant.name)}, shown in the optional ${html(plant.glaze)} ${html(plant.pot)} cover pot" loading="lazy" class="aspect-[.95] w-full object-cover transition duration-500 group-hover:scale-[1.035]"/>
        ${grade ? `<span class="absolute top-3 left-3 rounded-full bg-acid px-3 py-1 text-[11px] font-bold text-teal">${html(grade)}</span>` : plant.pets ? '<span class="absolute top-3 left-3 rounded-full bg-white px-3 py-1 text-[11px] font-bold text-teal">Pet-friendly</span>' : ""}
        <span class="absolute right-3 bottom-3 flex size-9 items-center justify-center rounded-full bg-white text-teal">${iconArrow}</span>
      </a><div class="pt-4"><div class="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1"><h3 class="font-display text-xl sm:text-2xl"><a href="product.html?plant=${plant.id}">${html(plant.name)}</a></h3><span class="text-sm font-bold">${money(plant.price * 100)}</span></div>
      <p class="mt-1 text-xs text-muted sm:text-sm">${botanicalHTML(plant)}</p>
      <p class="mt-3 text-xs text-muted">${LIGHTS[plant.light]} · ${CARE_LEVELS[plant.effort]}</p>
      ${reason ? `<p class="mt-3 text-sm leading-relaxed">${html(reason)}</p>` : ""}
      <button type="button" data-add="${plant.id}" class="mt-4 inline-flex min-h-10 items-center gap-2 text-sm font-bold text-teal">Add plant ${iconPlus}<span class="sr-only">: ${html(plant.name)}, standard nursery pot, ${money(plant.price * 100)}</span></button></div></article>`;
  }

  function setupQuickAdd() {
    document.addEventListener("click", (event) => {
      const button = event.target.closest("[data-add]");
      if (button) addPlant(button.dataset.add);
    });
  }

  function setupHeader() {
    const toggle = $("[data-menu-toggle]");
    const menu = $("#mobile-menu");
    function closeMenu(returnFocus = false) {
      if (!toggle || !menu) return;
      menu.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
      if (returnFocus) toggle.focus();
    }
    toggle?.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      menu.hidden = open;
      toggle.setAttribute("aria-expanded", String(!open));
      toggle.setAttribute("aria-label", open ? "Open menu" : "Close menu");
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && toggle?.getAttribute("aria-expanded") === "true") closeMenu(true);
    });
    document.addEventListener("click", (event) => {
      if (!event.target.closest("header")) closeMenu();
    });
    window.matchMedia("(min-width: 1024px)").addEventListener("change", (event) => {
      if (event.matches) closeMenu();
    });
    const year = shopNow().date.slice(0, 4);
    $$("[data-year]").forEach((node) => {
      node.textContent = year;
    });
    updateBadges();
  }

  function setupReveals() {
    document.documentElement.classList.add("js");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    document.documentElement.classList.add("motion");
    const sections = $$(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const position = sections.indexOf(entry.target);
          sections.slice(0, position + 1).forEach((node) => {
            node.classList.add("is-visible");
            observer.unobserve(node);
          });
        });
      },
      { threshold: 0.07 },
    );
    sections.forEach((section) => observer.observe(section));
  }

  // Lines that depend on today's date: [data-dispatch-line] on any page.
  function setupDates() {
    $$("[data-dispatch-line]").forEach((node) => {
      node.textContent = dispatchLine();
    });
    $$("[data-collect-date]").forEach((node) => {
      node.textContent = fmtDate(collectionDate());
    });
  }

  /* ------------------------------------------------------------------
   * Home, shop and product pages
   * ------------------------------------------------------------------ */
  // The hero already shows a monstera, a Chinese money plant and a palm, so the featured row and the
  // finder panel show other plants.
  const FEATURED = ["prince-of-orange", "pinstripe-calathea", "spider-plant", "ponytail-palm"];

  function setupHome() {
    const featured = $("[data-featured]");
    if (!featured) return;
    featured.innerHTML = FEATURED.filter((id) => own(PRODUCT_MAP, id))
      .map((id) => productCard(PRODUCT_MAP[id]))
      .join("");
  }

  function setupShop() {
    const form = $("#shop-filters");
    if (!form) return;
    const fields = {
      q: $("#plant-search"),
      light: $("#light-filter"),
      care: $("#care-filter"),
      pets: $("#pet-filter"),
      price: $("#price-filter"),
      sort: $("#sort-filter"),
    };
    const valid = {
      light: { all: 1, bright: 1, soft: 1, low: 1 },
      care: { all: 1, easy: 1, regular: 1 },
      pets: { all: 1, safe: 1 },
      price: { all: 1, 25: 1, 35: 1 },
      sort: { featured: 1, "price-asc": 1, "price-desc": 1, name: 1 },
    };
    const params = new URLSearchParams(window.location.search);
    fields.q.value = (params.get("q") || "").slice(0, 80);
    Object.keys(valid).forEach((key) => {
      const value = params.get(key);
      if (typeof value === "string" && own(valid[key], value)) fields[key].value = value;
    });
    let searchTimer;
    function render(updateURL = true) {
      const query = fields.q.value.trim().toLocaleLowerCase("en-US");
      let matches = PRODUCTS.filter((plant) => {
        const text =
          `${plant.name} ${botanicalText(plant)} ${plant.aka || ""} ${plant.blurb} ${plant.room}`.toLocaleLowerCase(
            "en-US",
          );
        return (
          (!query || text.includes(query)) &&
          (fields.light.value === "all" || fields.light.value === plant.light) &&
          (fields.care.value === "all" || fields.care.value === plant.effort) &&
          (fields.pets.value !== "safe" || plant.pets) &&
          (fields.price.value === "all" || plant.price < Number(fields.price.value))
        );
      });
      if (fields.sort.value === "price-asc") matches.sort((a, b) => a.price - b.price);
      if (fields.sort.value === "price-desc") matches.sort((a, b) => b.price - a.price);
      if (fields.sort.value === "name") matches.sort((a, b) => a.name.localeCompare(b.name, "en-US"));
      $("#shop-grid").innerHTML = matches.map((plant) => productCard(plant)).join("");
      $("#shop-empty").hidden = matches.length > 0;
      $("#result-count").textContent =
        `${matches.length} ${plural(matches.length, "plant")} to make yourself at home with`;
      if (updateURL) {
        const next = new URLSearchParams();
        Object.entries(fields).forEach(([key, field]) => {
          const value = field.value.trim();
          if (value && value !== "all" && value !== "featured") next.set(key, value);
        });
        try {
          window.history.replaceState(null, "", `${window.location.pathname}${next.size ? `?${next}` : ""}`);
        } catch (_) {
          /* file-system previews may restrict history updates. */
        }
      }
    }
    function reset() {
      form.reset();
      fields.sort.value = "featured";
      render();
      fields.q.focus();
    }
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      render();
    });
    form.addEventListener("input", (event) => {
      if (event.target === fields.q) {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(render, 120);
      } else render();
    });
    form.addEventListener("change", () => render());
    fields.sort.addEventListener("change", () => render());
    $("#reset-filters").addEventListener("click", reset);
    $("[data-reset-filters]").addEventListener("click", reset);
    render(false);
  }

  function setupProduct() {
    const detail = $("#product-detail");
    if (!detail) return;
    const params = new URLSearchParams(window.location.search);
    const requested = params.get("plant");
    const validRequest = typeof requested === "string" && own(PRODUCT_MAP, requested);
    const plant = validRequest ? PRODUCT_MAP[requested] : PRODUCTS[0];
    const requestedSize = params.get("size");
    let selectedSize =
      typeof requestedSize === "string" && own(SIZES, requestedSize) && stock(plant, requestedSize)
        ? requestedSize
        : "standard";
    const requestedPot = params.get("pot");
    const selectedPot = typeof requestedPot === "string" && own(POTS, requestedPot) ? requestedPot : "growing";
    $("#product-crumb").textContent = plant.name;
    document.title = `${plant.name}, ${botanicalText(plant)} — Frond`;
    detail.innerHTML = `<div class="grid items-start gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
      <div class="relative overflow-hidden rounded-[2rem] bg-cloud"><img src="assets/img/${plant.id}.svg" width="400" height="420" alt="${html(plant.name)}, shown in the optional ${html(plant.glaze)} ${html(plant.pot)} cover pot" class="w-full object-cover" fetchpriority="high"/><span class="absolute bottom-5 left-5 rounded-full bg-white px-4 py-2 text-xs font-bold">Cover pot shown is an optional extra</span></div>
      <div class="lg:pt-4"><p class="text-lg text-teal">${botanicalHTML(plant)}</p><h1 class="display mt-4 text-5xl sm:text-6xl">${html(plant.name)}</h1><p class="mt-5 max-w-lg text-lg leading-relaxed text-muted">${html(plant.blurb)}</p>
      ${requested && !validRequest ? `<p class="mt-4 rounded-xl bg-cloud p-4 text-sm" role="status">That plant isn’t on our shelves. Meet our ${html(plant.name.toLowerCase())} instead.</p>` : ""}
      <div class="mt-5 flex flex-wrap gap-2"><span class="pill">${LIGHTS[plant.light]}</span><span class="pill">${CARE_LEVELS[plant.effort]}</span><span class="pill">${plant.pets ? "Pet-friendly" : "Keep away from pets"}</span></div>
      <p class="mt-6 font-display text-4xl" id="product-price" aria-live="polite"></p>
      <form id="product-options" class="mt-7 space-y-5"><div><label class="label" for="product-size">A size for your space</label><select id="product-size" class="field" name="size"><option value="standard">Standard · approx. ${plant.height} in. tall</option><option value="large" ${!plant.largeStock ? "disabled" : ""}>Large · approx. ${Math.round(plant.height * 1.4)} in. tall${!plant.largeStock ? " · not available" : ""}</option></select></div>
      <div><label class="label" for="product-pot">Make a pair</label><select id="product-pot" class="field" name="pot"><option value="growing">Nursery pot only · included</option><option value="ceramic">Add the ${html(plant.pot)} cover pot, ${html(plant.glaze)} glaze</option></select><p class="mt-2 text-sm text-muted">Cover pot is sized to fit your chosen plant, with room to lift it out for watering.</p></div>
      <div class="flex flex-wrap items-end gap-3"><div class="w-24"><label class="label" for="product-quantity">Quantity</label><input id="product-quantity" class="field" type="number" name="qty" min="1" max="${plant.stock}" value="1" inputmode="numeric"/></div><button id="product-add" class="btn min-w-0 flex-1" type="submit">Add to cart ${iconPlus}</button></div><p id="product-stock" class="text-sm text-muted" role="status"></p>
      <p class="flex gap-3 rounded-2xl bg-cloud p-4 text-sm">${iconVan}<span><strong data-dispatch-line></strong> Tracked delivery takes ${DISPATCH.transit}; pickup orders are ready from <span data-collect-date></span>.</span></p>
      <p class="text-xs text-muted">Care card included. Free local delivery from $75 after discounts.</p></form></div></div>`;
    const form = $("#product-options");
    const size = $("#product-size");
    const pot = $("#product-pot");
    const quantity = $("#product-quantity");
    size.value = selectedSize;
    pot.value = selectedPot;
    function updateOptions() {
      selectedSize = own(SIZES, size.value) ? size.value : "standard";
      const cover = own(POTS, pot.value) ? pot.value : "growing";
      const available = availableToAdd(plant.id, selectedSize);
      quantity.max = String(Math.max(1, available));
      quantity.value = String(integer(quantity.value, 1, Math.max(1, available)));
      $("#product-price").textContent = money(price(plant, selectedSize, cover));
      $("#product-stock").textContent = available
        ? `${available} ${plural(available, "plant")} available in this size. ${cover === "ceramic" ? `Cover pot adds ${money(coverPrice(selectedSize))}.` : "Nursery pot included."}`
        : "You have all available plants in this size in your cart.";
      $("#product-add").disabled = !available;
      const next = new URLSearchParams({ plant: plant.id, size: selectedSize, pot: cover });
      if (PREVIEW) next.set("now", new URLSearchParams(window.location.search).get("now"));
      try {
        window.history.replaceState(null, "", `${window.location.pathname}?${next}`);
      } catch (_) {
        /* file-system preview */
      }
    }
    size.addEventListener("change", updateOptions);
    pot.addEventListener("change", updateOptions);
    quantity.addEventListener("change", updateOptions);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      addPlant(plant.id, selectedSize, pot.value, quantity.value);
      updateOptions();
    });
    updateOptions();
    $("#panel-care").innerHTML =
      `<article class="rounded-2xl bg-cloud p-6"><h2 class="font-display text-2xl">Light</h2><p class="mt-3 font-bold">${LIGHTS[plant.light]}</p><p class="mt-2 leading-relaxed text-muted">${html(plant.lightNote)}</p></article>
      <article class="rounded-2xl bg-cloud p-6"><h2 class="font-display text-2xl">Water &amp; fertilizer</h2><p class="mt-3 leading-relaxed text-muted">${html(plant.water)}</p><p class="mt-3 leading-relaxed text-muted">${html(plant.feed)}</p></article>
      <article class="rounded-2xl bg-cloud p-6"><h2 class="font-display text-2xl">Good to know</h2><p class="mt-3 leading-relaxed text-muted">${html(plant.extra)}</p><p class="mt-3 text-sm text-muted">${html(plant.petNote)}${plant.pets ? " Any plant can upset a stomach if eaten in quantity." : ""}</p></article>`;
    $("#panel-size").innerHTML =
      `<h2 class="font-display text-2xl">A living thing, with a little variation.</h2><p class="mt-4 leading-relaxed text-muted">Standard: approximately ${plant.height} in. tall in a nursery pot about ${plant.diameter} in. wide. Large: approximately ${Math.round(plant.height * 1.4)} in. tall in a nursery pot about ${plant.diameter + 2} in. wide. Height includes the nursery pot. Markings and leaf counts vary.</p><p class="mt-4 leading-relaxed text-muted">The optional ${html(plant.pot)} cover pot (${html(plant.glaze)} glaze) adds about an inch of internal clearance and has no drainage hole. Lift the nursery pot out to water, allow it to drain fully, then return it. Never leave the roots standing in water.</p>`;
    $("#related-plants").innerHTML = PRODUCTS.filter((item) => item.id !== plant.id)
      .sort((a, b) => Number(b.light === plant.light) - Number(a.light === plant.light))
      .slice(0, 4)
      .map((item) => productCard(item))
      .join("");
    setupTabs();
  }

  function setupTabs() {
    const tabs = $$("[data-tab]");
    function activate(tab, focus = false) {
      tabs.forEach((button) => {
        const active = button === tab;
        button.setAttribute("aria-selected", String(active));
        button.tabIndex = active ? 0 : -1;
        const panel = document.getElementById(button.getAttribute("aria-controls"));
        if (panel) panel.hidden = !active;
      });
      if (focus) tab.focus();
    }
    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => activate(tab));
      tab.addEventListener("keydown", (event) => {
        let next;
        if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
        if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
        if (event.key === "Home") next = 0;
        if (event.key === "End") next = tabs.length - 1;
        if (next !== undefined) {
          event.preventDefault();
          activate(tabs[next], true);
        }
      });
    });
  }

  /* ------------------------------------------------------------------
   * Cart and ZIP codes
   * ------------------------------------------------------------------ */
  function postcodeResult(raw) {
    const match = String(raw)
      .replace(/\s+/g, "")
      .match(/^(\d{5})(?:-(\d{4}))?$/);
    if (!match) return { valid: false, text: "Enter a 5-digit ZIP code, for example 97401." };
    const zip = match[1];
    if (!DELIVERY_ZIPS.includes(zip))
      return {
        valid: false,
        text: `We can’t send plants to ${zip}: our courier covers ZIP codes around Eugene only. Choose pickup, or call us at (541) 555-0137.`,
      };
    return {
      valid: true,
      text: `We deliver to ${zip}. Tracked, ${DISPATCH.transit} after shipping.`,
      postcode: match[2] ? `${zip}-${match[2]}` : zip,
    };
  }

  function setupBasket() {
    const container = $("#basket-items");
    if (!container) return;
    const optionForm = $("#basket-options");
    const postcode = $("#basket-postcode");
    const coupon = $("#coupon");
    const shippingInputs = $$('input[name="shipping"]', optionForm);
    shippingInputs.forEach((input) => {
      input.checked = input.value === options.shipping;
    });
    postcode.value = options.postcode;
    coupon.value = options.coupon;
    function drawTotals() {
      $("#basket-totals").innerHTML = totalsHTML();
      $("#checkout-link").hidden = !basket.length;
      const total = totals();
      const deliveryFree = total.afterDiscount >= FREE_DELIVERY;
      $("[data-delivery-price]").textContent = deliveryFree ? "free" : money(DELIVERY_PRICE);
      const collection = options.shipping === "collect";
      postcode.closest("div").hidden = collection;
      if (!collection && postcode.value.trim()) {
        const result = postcodeResult(postcode.value);
        $("#postcode-status").textContent = result.text;
        $("#postcode-status").className = `mt-2 text-sm ${result.valid ? "text-teal" : "text-rust"}`;
      } else $("#postcode-status").textContent = "";
      if (options.coupon === COUPON)
        $("#coupon-status").textContent =
          "GROW10 applied: 10% off plants and pots. Delivery is calculated after the discount.";
    }
    function drawItems(focusIndex = null) {
      container.innerHTML = basket
        .map((item, index) => {
          const plant = PRODUCT_MAP[item.id];
          return `<article class="grid grid-cols-[90px_1fr] gap-4 py-6 sm:grid-cols-[130px_1fr]" data-line="${index}">
          <a href="product.html?plant=${plant.id}&amp;size=${item.size}&amp;pot=${item.pot}"><img src="assets/img/${plant.id}.svg" alt="${html(plant.name)}" width="400" height="420" class="w-full rounded-2xl"/></a><div class="min-w-0"><div class="flex flex-wrap justify-between gap-2"><h2 class="font-display text-2xl"><a href="product.html?plant=${plant.id}">${html(plant.name)}</a></h2><p class="font-bold">${money(price(plant, item.size, item.pot) * item.qty)}</p></div><p class="mt-2 text-sm text-muted">${SIZES[item.size]} · ${item.pot === "ceramic" ? `${html(plant.pot)} cover pot, ${html(plant.glaze)}` : "Nursery pot only"}</p><p class="mt-1 text-xs text-muted">${money(price(plant, item.size, item.pot))} each</p><div class="mt-4 flex flex-wrap items-center justify-between gap-3"><div class="inline-flex items-center rounded-full border border-line"><button type="button" class="flex size-10 items-center justify-center rounded-full hover:bg-cloud" data-quantity="${index}" data-delta="-1" aria-label="Decrease ${html(plant.name)} quantity" ${item.qty <= 1 ? "disabled" : ""}>${iconMinus}</button><span class="w-7 text-center text-sm" aria-label="Quantity ${item.qty}">${item.qty}</span><button type="button" class="flex size-10 items-center justify-center rounded-full hover:bg-cloud" data-quantity="${index}" data-delta="1" aria-label="Increase ${html(plant.name)} quantity" ${!availableToAdd(item.id, item.size) ? "disabled" : ""}>${iconPlus}</button></div><button type="button" class="link text-sm" data-remove="${index}" aria-label="Remove ${html(plant.name)} ${SIZES[item.size].toLowerCase()} with ${item.pot === "ceramic" ? "cover" : "growing"} pot">Remove</button></div></div></article>`;
        })
        .join("");
      $("#basket-empty").hidden = basket.length > 0;
      $("#basket-last-order").innerHTML = basket.length ? "" : lastOrderHTML();
      drawTotals();
      if (focusIndex !== null) {
        const target = $(`[data-remove="${Math.min(focusIndex, basket.length - 1)}"]`);
        if (target) target.focus();
        else $("#basket-empty a").focus();
      }
    }
    container.addEventListener("click", (event) => {
      const remove = event.target.closest("[data-remove]");
      if (remove) {
        const index = integer(remove.dataset.remove, 0, basket.length - 1);
        const plant = PRODUCT_MAP[basket[index].id];
        basket.splice(index, 1);
        persist();
        drawItems(index);
        announce(
          `${plant.name} removed. ${countBasket()} ${plural(countBasket(), "item")} in your cart. Total ${money(totals().total)}.`,
        );
      }
      const stepper = event.target.closest("[data-quantity]");
      if (stepper) {
        const index = integer(stepper.dataset.quantity, 0, basket.length - 1);
        const item = basket[index];
        const delta = Number(stepper.dataset.delta);
        if (delta > 0 && !availableToAdd(item.id, item.size)) return;
        item.qty = Math.max(1, item.qty + delta);
        persist();
        drawItems();
        const replacement = $(`[data-quantity="${index}"][data-delta="${delta}"]`);
        if (replacement && !replacement.disabled) replacement.focus();
        else $(`[data-remove="${index}"]`)?.focus();
        announce(`${PRODUCT_MAP[item.id].name}: ${item.qty}. Cart total ${money(totals().total)}.`);
      }
    });
    shippingInputs.forEach((input) =>
      input.addEventListener("change", () => {
        options.shipping = input.value === "collect" ? "collect" : "standard";
        persist();
        drawTotals();
        announce(
          `Cart total ${money(totals().total)} with ${options.shipping === "collect" ? "store pickup" : "local delivery"}.`,
        );
      }),
    );
    postcode.addEventListener("input", () => {
      options.postcode = postcode.value.trim().toUpperCase().slice(0, 10);
      postcode.removeAttribute("aria-invalid");
      persist();
      drawTotals();
    });
    $("#apply-coupon").addEventListener("click", () => {
      const value = coupon.value.trim().toUpperCase();
      options.coupon = value === COUPON ? COUPON : "";
      persist();
      drawTotals();
      if (value && value !== COUPON)
        $("#coupon-status").textContent = "That code is not recognized. Try GROW10 for your first visit.";
      if (!value) $("#coupon-status").textContent = "Welcome code removed. Use GROW10 for 10% off plants and pots.";
      announce(`Discount ${options.coupon ? "applied" : "not applied"}. Cart total ${money(totals().total)}.`);
      });
    optionForm.addEventListener("submit", (event) => {
      event.preventDefault();
      $("#apply-coupon").click();
    });
    $("#checkout-link").addEventListener("click", (event) => {
      if (options.shipping !== "standard" || !basket.length) return;
      const result = postcodeResult(postcode.value);
      if (!result.valid) {
        event.preventDefault();
        $("#postcode-status").textContent = result.text;
        $("#postcode-status").className = "mt-2 text-sm text-rust";
        postcode.setAttribute("aria-invalid", "true");
        postcode.focus();
      } else {
        postcode.removeAttribute("aria-invalid");
        options.postcode = result.postcode;
        persist();
      }
    });
    $("#basket-recommendations").innerHTML = ["baby-rubber-plant", "spider-plant", "string-of-hearts", "zz-plant"]
      .map((id) => productCard(PRODUCT_MAP[id]))
      .join("");
    document.addEventListener("frond:basket-change", () => drawItems());
    drawItems();
  }

  /* ------------------------------------------------------------------
   * Form helpers
   * ------------------------------------------------------------------ */
  function fieldError(input, message) {
    const error = document.getElementById(`${input.id}-error`);
    if (error) error.textContent = message;
    if (message) input.setAttribute("aria-invalid", "true");
    else input.removeAttribute("aria-invalid");
    return !message;
  }

  function validEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value) && value.length <= 120;
  }

  function validateFields(form, rules) {
    let firstInvalid = null;
    rules.forEach(([name, validate]) => {
      const input = form.elements.namedItem(name);
      if (!(input instanceof HTMLElement)) return;
      const message = validate(input.value.trim());
      fieldError(input, message);
      if (message && !firstInvalid) firstInvalid = input;
    });
    firstInvalid?.focus();
    return !firstInvalid;
  }

  function luhn(digits) {
    let sum = 0;
    for (let i = 0; i < digits.length; i += 1) {
      let d = Number(digits[digits.length - 1 - i]);
      if (i % 2) {
        d *= 2;
        if (d > 9) d -= 9;
      }
      sum += d;
    }
    return sum % 10 === 0;
  }

  /* ------------------------------------------------------------------
   * Checkout: details, delivery (with gift options), payment, confirmation
   * ------------------------------------------------------------------ */
  function setupCheckout() {
    const form = $("#checkout-form");
    if (!form) return;
    if (!basket.length) {
      $("#checkout-empty").hidden = false;
      $("#checkout-content").hidden = true;
      $("#checkout-last-order").innerHTML = lastOrderHTML();
      return;
    }
    const controls = (name) => form.elements.namedItem(name);
    const shippingInputs = $$('input[name="shipping"]', form);
    shippingInputs.forEach((input) => {
      input.checked = input.value === options.shipping;
    });
    controls("postcode").value = options.postcode;
    let step = 1;
    let completed = false;
    const gift = () => controls("gift").checked;
    const extras = () => ({ giftWrap: gift() && controls("wrap").checked });
    const identityRules = [
      [
        "name",
        (value) =>
          value.length >= 2 && value.length <= 80 ? "" : "Please enter your full name, at least 2 characters.",
      ],
      ["email", (value) => (validEmail(value) ? "" : "Please enter an email address like name@example.com.")],
      [
        "phone",
        (value) =>
          !value || (/^[+()\d\s-]{7,25}$/.test(value) && value.replace(/\D/g, "").length >= 10)
            ? ""
            : "Enter a phone number like (541) 555-0164, or leave it blank.",
      ],
    ];
    const addressRules = [
      ["address", (value) => (value.length >= 5 ? "" : "Please enter a street address, at least 5 characters.")],
      ["town", (value) => (value.length >= 2 ? "" : "Please enter your city.")],
      ["postcode", (value) => (postcodeResult(value).valid ? "" : postcodeResult(value).text)],
    ];
    const giftRules = [
      [
        "gift-message",
        (value) =>
          !gift() || value.length <= GIFT_MESSAGE_MAX ? "" : `Keep the card message to ${GIFT_MESSAGE_MAX} characters.`,
      ],
    ];
    // Card fields have ids but no name attributes, and nothing reads them after validation: on a real
    // site, replace them with your payment provider's hosted fields (Stripe Elements, Square, PayPal).
    const paymentRules = [
      ["card-name", (value) => (value.length >= 2 ? "" : "Enter the name as it appears on the card.")],
      [
        "card-number",
        (value) => {
          const digits = value.replace(/\s/g, "");
          if (!/^\d{13,19}$/.test(digits)) return "Enter the long number on the front of the card.";
          return luhn(digits) ? "" : "That card number doesn’t look right. Check each digit.";
        },
      ],
      [
        "card-expiry",
        (value) => {
          const match = value.match(/^(\d{2})\s*\/\s*(\d{2})$/);
          if (!match || +match[1] < 1 || +match[1] > 12) return "Use the format MM / YY.";
          const today = shopNow().date;
          const year = 2000 + Number(match[2]);
          const nowYear = Number(today.slice(0, 4));
          const nowMonth = Number(today.slice(5, 7));
          if (year < nowYear || (year === nowYear && Number(match[1]) < nowMonth)) return "This card has expired.";
          return year > nowYear + 20 ? "Check the expiration year." : "";
        },
      ],
      ["card-cvc", (value) => (/^\d{3,4}$/.test(value) ? "" : "Enter the 3 or 4 digit security code.")],
    ];

    function whenText() {
      return options.shipping === "collect"
        ? `Ready for pickup from ${fmtDate(collectionDate())}`
        : `Ships ${relativeDay(dispatchDate())}`;
    }

    function updateSummary() {
      $("#checkout-lines").innerHTML = basket
        .map((item) => {
          const plant = PRODUCT_MAP[item.id];
          return `<div class="flex items-center gap-3"><img src="assets/img/${plant.id}.svg" width="54" height="58" alt="" class="rounded-xl"/><div class="min-w-0 flex-1"><p class="text-sm font-bold">${html(plant.name)} × ${item.qty}</p><p class="mt-1 text-xs text-muted">${SIZES[item.size]} · ${POTS[item.pot]}</p></div><span class="text-sm">${money(price(plant, item.size, item.pot) * item.qty)}</span></div>`;
        })
        .join("");
      $("#checkout-totals").innerHTML = totalsHTML(extras());
      $("#checkout-when").textContent =
        options.shipping === "collect"
          ? `Ready for pickup from ${fmtDate(collectionDate())}.`
          : `${dispatchLine()} Tracked delivery, ${DISPATCH.transit}.`;
      const collection = options.shipping === "collect";
      $("#delivery-fields").hidden = collection;
      $("#collection-info").hidden = !collection;
      ["address", "town", "postcode"].forEach((name) => {
        controls(name).disabled = collection;
      });
      $("#gift-fields").hidden = !gift();
      $("[data-pay-total]").textContent = money(totals(extras()).total);
    }
    function reviewHTML() {
      const name = html(controls("name").value.trim());
      const email = html(controls("email").value.trim());
      const phone = html(controls("phone").value.trim());
      const note = html(controls("note").value.trim());
      const destination =
        options.shipping === "collect"
          ? `Pick up at ${html(SHOP_ADDRESS)}, from ${fmtDate(collectionDate())}.`
          : `${html(controls("address").value.trim())}, ${html(controls("town").value.trim())}, OR ${html(controls("postcode").value.trim())}. ${html(whenText())}.`;
      const giftLine = gift()
        ? `<div><h3 class="text-sm font-bold">Gift</h3><p class="mt-2 break-words">${controls("wrap").checked ? "Gift wrapped, " : ""}no prices in the package.${controls("gift-message").value.trim() ? ` Card: “${html(controls("gift-message").value.trim())}”` : ""}</p></div>`
        : "";
      return `<div><h3 class="text-sm font-bold">Your details</h3><p class="mt-2 break-words">${name}<br>${email}${phone ? `<br>${phone}` : ""}</p></div><div><h3 class="text-sm font-bold">${options.shipping === "collect" ? "Pickup" : "Delivery"}</h3><p class="mt-2">${destination}</p></div>${giftLine}${note ? `<div><h3 class="text-sm font-bold">Your note</h3><p class="mt-2 whitespace-pre-wrap break-words">${note}</p></div>` : ""}`;
    }
    function goToStep(next) {
      step = next;
      $$("[data-checkout-step]").forEach((panel) => {
        panel.hidden = Number(panel.dataset.checkoutStep) !== step;
      });
      $$("[data-progress]").forEach((item) => {
        const current = Number(item.dataset.progress) === step;
        if (current) item.setAttribute("aria-current", "step");
        else item.removeAttribute("aria-current");
        item.classList.toggle("text-muted", !current);
      });
      if (step === 3) $("#checkout-review").innerHTML = reviewHTML();
      const heading = $(`[data-checkout-step="${step}"] h2`);
      heading.tabIndex = -1;
      heading.focus();
    }
    function stepValid(which) {
      if (which === 1) return validateFields(form, identityRules);
      if (which === 2) {
        if (options.shipping !== "collect" && !validateFields(form, addressRules)) return false;
        if (!validateFields(form, giftRules)) return false;
        if (options.shipping !== "collect") {
          options.postcode = postcodeResult(controls("postcode").value).postcode;
          controls("postcode").value = options.postcode;
          persist();
        }
        return true;
      }
      return validateFields(form, paymentRules);
    }
    $$("[data-next]", form).forEach((button) =>
      button.addEventListener("click", () => {
        if (!stepValid(step)) return;
        goToStep(Number(button.dataset.next));
      }),
    );
    $$("[data-back]", form).forEach((button) =>
      button.addEventListener("click", () => goToStep(Number(button.dataset.back))),
    );
    shippingInputs.forEach((input) =>
      input.addEventListener("change", () => {
        options.shipping = input.value === "collect" ? "collect" : "standard";
        persist();
        updateSummary();
      }),
    );
    controls("gift").addEventListener("change", updateSummary);
    controls("wrap").addEventListener("change", updateSummary);
    controls("note").addEventListener("input", () => {
      $("#note-count").textContent = `${controls("note").value.length} / 250 characters`;
    });
    controls("gift-message").addEventListener("input", () => {
      const left = GIFT_MESSAGE_MAX - controls("gift-message").value.length;
      $("#gift-message-count").textContent = `${left} ${plural(left, "character")} left`;
    });
    // Card number in groups of four; expiry as MM / YY.
    const card = controls("card-number");
    card.addEventListener("input", () => {
      const digits = card.value.replace(/\D/g, "").slice(0, 19);
      const formatted = digits.replace(/(\d{4})(?=\d)/g, "$1 ");
      if (formatted !== card.value) card.value = formatted;
    });
    const expiry = controls("card-expiry");
    expiry.addEventListener("input", (event) => {
      const digits = expiry.value.replace(/\D/g, "").slice(0, 4);
      const value = digits.length > 2 ? `${digits.slice(0, 2)} / ${digits.slice(2)}` : digits;
      if (event.inputType !== "deleteContentBackward" && value !== expiry.value) expiry.value = value;
    });
    form.addEventListener("input", (event) => {
      if (event.target.getAttribute("aria-invalid") === "true") fieldError(event.target, "");
    });
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (completed) return;
      if (step < 3) {
        $(`[data-checkout-step="${step}"] [data-next]`)?.click();
        return;
      }
      if (!stepValid(1)) {
        goToStep(1);
        return;
      }
      if (!stepValid(2)) {
        goToStep(2);
        return;
      }
      if (!stepValid(3)) return;
      // A real shop sends the order to its server here, recalculates stock, prices and delivery there,
      // and takes payment through its provider before showing this confirmation.
      completed = true;
      const finalTotals = totals(extras());
      const number = `FR-${String(Math.floor(10000 + Math.random() * 90000))}`;
      const first = controls("name").value.trim().split(/\s+/)[0];
      const when = whenText();
      const items = countBasket();
      const lines = basket
        .map(
          (item) =>
            `<li class="flex justify-between gap-4"><span>${html(PRODUCT_MAP[item.id].name)} × ${item.qty}<span class="block text-xs text-ink/70">${SIZES[item.size]} · ${POTS[item.pot]}</span></span><span>${money(price(PRODUCT_MAP[item.id], item.size, item.pot) * item.qty)}</span></li>`,
        )
        .join("");
      const where =
        options.shipping === "collect"
          ? `Pick it up at ${html(SHOP_ADDRESS)} from ${fmtDate(collectionDate())}, during opening hours.`
          : `We’ll ship it ${relativeDay(dispatchDate())}. It travels by tracked courier to ${html(options.postcode)} and arrives ${DISPATCH.transit} later.`;
      $("#order-number").textContent = number;
      $("#order-heading").textContent = `Thank you, ${first}.`;
      $("#order-when").innerHTML = where;
      $("#purchase-summary").innerHTML =
        `<ul class="space-y-3 text-sm">${lines}</ul><div class="border-t border-teal/20 pt-4">${totalsHTML(extras(), false)}</div>`;
      safeStorage.set(LAST_ORDER_KEY, JSON.stringify({ number, total: finalTotals.total, items, when: `${when}.` }));
      basket = [];
      persist();
      form.hidden = true;
      $("#checkout-progress").hidden = true;
      $("#checkout-aside").hidden = true;
      $("#checkout-content").classList.remove("lg:grid-cols-[1.4fr_1fr]");
      $("#checkout-done").hidden = false;
      $("#checkout-done").focus();
      announce(`Order ${number} confirmed.`);
    });
    $("#print-summary").addEventListener("click", () => window.print());
    updateSummary();
  }

  /* ------------------------------------------------------------------
   * Plant finder: graded, nearest-match results with a reason per plant
   * ------------------------------------------------------------------ */
  const FINDER_ALLOWED = {
    light: { bright: 1, soft: 1, low: 1 },
    care: { easy: 1, regular: 1 },
    pets: { safe: 1, all: 1 },
    space: { desk: 1, shelf: 1, statement: 1, any: 1 },
  };
  // Score out of 9: light (4 exact, 2 one step away), care (3, or 2 when a regular-care home gets an
  // easy plant, 0 when an easy-going home gets a fussier one), space (2 match, 1 for "any").
  // A pet-friendly request is a hard rule: plants not listed as non-toxic are never suggested.
  function finderScore(plant, answers) {
    if (answers.pets === "safe" && !plant.pets) return null;
    const distance = Math.abs(LIGHT_ORDER[plant.light] - LIGHT_ORDER[answers.light]);
    if (distance > 1) return null;
    const light = distance === 0 ? 4 : 2;
    const care = plant.effort === answers.care ? 3 : answers.care === "regular" ? 2 : 0;
    const space = answers.space === "any" ? 1 : ROOMS[answers.space] === plant.room ? 2 : 0;
    return light + care + space;
  }
  function finderGrade(score) {
    if (score >= 8) return "Best match";
    if (score >= 6) return "Good match";
    return "Worth a try";
  }
  function finderReason(plant, answers) {
    const parts = [];
    const diff = LIGHT_ORDER[plant.light] - LIGHT_ORDER[answers.light];
    if (diff === 0) parts.push(`Made for ${LIGHTS[plant.light].toLowerCase()}.`);
    else if (diff > 0) parts.push("Likes a little more light: give it the brightest spot you have.");
    else parts.push("Prefers softer light: keep it a step back from the window.");
    if (answers.care === "easy" && plant.effort === "regular")
      parts.push("It needs a weekly check, a little more than you asked for.");
    else parts.push(plant.strength);
    if (answers.space !== "any" && ROOMS[answers.space] !== plant.room)
      parts.push(`We sell it as ${ROOM_TEXT[plant.room]}.`);
    if (answers.pets === "safe") parts.push("Commonly listed as non-toxic to cats and dogs.");
    return parts.join(" ");
  }

  function setupFinder() {
    const form = $("#plant-finder");
    if (!form) return;
    const params = new URLSearchParams(window.location.search);
    let fromURL = false;
    for (const name of Object.keys(FINDER_ALLOWED)) {
      const requested = params.get(name);
      if (typeof requested === "string" && own(FINDER_ALLOWED[name], requested)) {
        fromURL = true;
        $$(`input[name="${name}"]`, form).forEach((input) => {
          input.checked = input.value === requested;
        });
      }
    }
    function answers() {
      const out = {};
      for (const name of Object.keys(FINDER_ALLOWED)) {
        const value = form.elements.namedItem(name).value;
        out[name] = own(FINDER_ALLOWED[name], value) ? value : Object.keys(FINDER_ALLOWED[name])[0];
      }
      return out;
    }
    function render(focus) {
      const chosen = answers();
      const ranked = PRODUCTS.map((plant) => ({ plant, score: finderScore(plant, chosen) }))
        .filter((entry) => entry.score !== null)
        .sort((a, b) => b.score - a.score || a.plant.price - b.plant.price)
        .slice(0, 6);
      const best = ranked.filter((entry) => entry.score >= 8).length;
      $("#finder-intro").hidden = true;
      $("#finder-results").hidden = false;
      $("#finder-status").textContent = ranked.length
        ? `${best ? `${best} best ${plural(best, "match", "matches")}` : "No perfect fit, so here are the nearest"} for ${LIGHTS[chosen.light].toLowerCase()}, ${chosen.care === "easy" ? "a forgiving routine" : "regular care"}${chosen.pets === "safe" ? ", a home with pets" : ""}${chosen.space === "any" ? "" : ` and ${ROOM_TEXT[ROOMS[chosen.space]]}`}. ${ranked.length} ${plural(ranked.length, "plant")} in order.`
        : "";
      $("#finder-grid").innerHTML = ranked
        .map(({ plant, score }) =>
          productCard(plant, { reason: finderReason(plant, chosen), grade: finderGrade(score) }),
        )
        .join("");
      $("#finder-no-match").hidden = ranked.length > 0;
      if (focus) $("#finder-results").focus();
      const next = new URLSearchParams(chosen);
      if (PREVIEW) next.set("now", params.get("now"));
      try {
        window.history.replaceState(null, "", `${window.location.pathname}?${next}`);
      } catch (_) {
        /* file-system preview */
      }
    }
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      render(true);
    });
    form.addEventListener("reset", () => {
      $("#finder-intro").hidden = false;
      $("#finder-results").hidden = true;
      $("#finder-grid").innerHTML = "";
      try {
        window.history.replaceState(null, "", window.location.pathname);
      } catch (_) {
        /* file-system preview */
      }
    });
    if (fromURL) render(false);
  }

  function setupCare() {
    const select = $("#care-plant");
    if (!select) return;
    select.innerHTML = PRODUCTS.map(
      (plant) => `<option value="${plant.id}">${html(plant.name)} · ${html(botanicalText(plant))}</option>`,
    ).join("");
    const params = new URLSearchParams(window.location.search);
    const requested = params.get("plant");
    if (typeof requested === "string" && own(PRODUCT_MAP, requested)) select.value = requested;
    function drawPlantCare() {
      if (!own(PRODUCT_MAP, select.value)) select.value = PRODUCTS[0].id;
      const plant = PRODUCT_MAP[select.value];
      $("#plant-care").innerHTML =
        `<div class="flex items-center gap-5"><img src="assets/img/${plant.id}.svg" alt="" width="96" height="101" class="rounded-2xl"/><div><h3 class="font-display text-2xl">${html(plant.name)}</h3><p class="mt-2 text-sm text-muted">${botanicalHTML(plant)}</p></div></div><div><h3 class="text-sm font-bold">Find the light</h3><p class="mt-2 leading-relaxed text-muted">${LIGHTS[plant.light]}. ${html(plant.lightNote)}</p></div><div><h3 class="text-sm font-bold">Water with a little thought</h3><p class="mt-2 leading-relaxed text-muted">${html(plant.water)}</p></div><div><h3 class="text-sm font-bold">Food for growing</h3><p class="mt-2 leading-relaxed text-muted">${html(plant.feed)}</p></div><div><h3 class="text-sm font-bold">Good to know</h3><p class="mt-2 leading-relaxed text-muted">${html(plant.extra)} ${html(plant.petNote)}</p></div><a class="link inline-block" href="product.html?plant=${plant.id}">Meet the ${html(plant.name.toLowerCase())}</a>`;
    }
    select.addEventListener("change", drawPlantCare);
    const symptom = $("#symptom");
    function drawSymptom() {
      const key = own(SYMPTOMS, symptom.value) ? symptom.value : "yellow";
      const advice = SYMPTOMS[key];
      $("#symptom-result").innerHTML =
        `<h3 class="font-display text-2xl">${advice.title}</h3><p class="leading-relaxed">${advice.copy}</p><p class="leading-relaxed">${advice.action}</p><p class="pt-3 text-xs">General growing guidance, not a diagnosis. If unsure, email clear photos of the whole plant, leaves and soil.</p>`;
    }
    symptom.addEventListener("change", drawSymptom);
    drawPlantCare();
    drawSymptom();
  }

  /* ------------------------------------------------------------------
   * Visit page: today's hours and the next federal holiday
   * ------------------------------------------------------------------ */
  function setupVisit() {
    const today = $("[data-today-hours]");
    if (!today) return;
    const now = shopNow();
    const hours = hoursOn(now.date);
    const holiday = bankHolidays(Number(now.date.slice(0, 4)))[now.date];
    if (!hours) today.textContent = `Closed today${holiday ? ` (${holiday})` : ""}. ${nextOpenText(now)}`;
    else if (now.mins < toMins(hours[0]))
      today.textContent = `Open today from ${clock(toMins(hours[0]))} to ${clock(toMins(hours[1]))}.`;
    else if (now.mins < toMins(hours[1])) today.textContent = `Open now, until ${clock(toMins(hours[1]))}.`;
    else today.textContent = `Closed for today. ${nextOpenText(now)}`;
    let k = now.date;
    let next = null;
    for (let i = 0; i < 400 && !next; i += 1) {
      k = addDays(k, 1);
      const name = bankHolidays(Number(k.slice(0, 4)))[k];
      if (name && hoursOn(k)) next = { key: k, name };
    }
    const nextHoliday = $("[data-next-holiday]");
    if (next && nextHoliday) {
      const nextHours = hoursOn(next.key);
      nextHoliday.textContent = `Next holiday hours: ${next.name}, ${fmtDate(next.key)}, ${clock(toMins(nextHours[0]))}–${clock(toMins(nextHours[1]))}.`;
    }
  }
  function nextOpenText(now) {
    let k = now.date;
    for (let i = 0; i < 14; i += 1) {
      k = addDays(k, 1);
      const hours = hoursOn(k);
      if (hours) return `We open again ${relativeDay(k, now)} at ${clock(toMins(hours[0]))}.`;
    }
    return "";
  }

  /* ------------------------------------------------------------------
   * Contact form
   * ------------------------------------------------------------------ */
  // To receive inquiries, create a form at https://formspree.io, then in the submit handler below
  // replace showThanks() with:
  //   fetch("https://formspree.io/f/your-form-id", {
  //     method: "POST",
  //     body: new FormData(form),
  //     headers: { Accept: "application/json" },
  //   }).then((response) => (response.ok ? showThanks() : showSendError()));
  // and only show the thank-you message once the response is OK.
  function setupContact() {
    const form = $("#contact-form");
    if (!form) return;
    const controls = (name) => form.elements.namedItem(name);
    const rules = [
      ["name", (value) => (value.length >= 2 ? "" : "Please enter your name, at least 2 characters.")],
      ["email", (value) => (validEmail(value) ? "" : "Please enter an email address like name@example.com.")],
      ["message", (value) => (value.length >= 20 ? "" : "Tell us a little more, at least 20 characters.")],
    ];
    controls("message").addEventListener("input", () => {
      $("#contact-count").textContent =
        `${controls("message").value.length.toLocaleString("en-US")} / 1,200 characters`;
    });
    form.addEventListener("input", (event) => {
      if (event.target.getAttribute("aria-invalid") === "true") fieldError(event.target, "");
    });
    function showThanks() {
      const first = controls("name").value.trim().split(/\s+/)[0];
      $("#contact-thanks-name").textContent = `Thanks, ${first}.`;
      form.hidden = true;
      $("#contact-result").hidden = false;
      $("#contact-result").focus();
    }
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!validateFields(form, rules)) return;
      showThanks();
    });
    $("#contact-again").addEventListener("click", () => {
      form.reset();
      $("#contact-count").textContent = "0 / 1,200 characters";
      $("#contact-result").hidden = true;
      form.hidden = false;
      controls("name").focus();
    });
  }

  setupHeader();
  setupQuickAdd();
  setupHome();
  setupShop();
  setupProduct();
  setupBasket();
  setupCheckout();
  setupFinder();
  setupCare();
  setupVisit();
  setupContact();
  setupDates();
  setupReveals();
})();
