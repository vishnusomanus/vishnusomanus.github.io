const CATALOG = {
  lamp: { name: "Arc floor lamp", price: 186, href: "lamp.html", image: "images/lamp.jpg" },
  cups: { name: "Speckled cup set", price: 48, href: "cups.html", image: "images/bowl.jpg" },
  vases: { name: "Speckled bottle vases", price: 72, href: "vases.html", image: "images/bowl-2.jpg" },
  linen: { name: "Washed linen duvet", price: 140, href: "linen.html", image: "images/throw-2.jpg" },
  amber: { name: "Amber glass vase", price: 58, href: "amber.html", image: "images/vase.jpg" },
  candle: { name: "Evening candle", price: 32, href: "candle.html", image: "images/candle.jpg" },
  bottle: { name: "Forest bottle", price: 36, href: "bottle.html", image: "images/vase-2.jpg" },
  pendants: { name: "Brass dome pendants", price: 240, href: "pendants.html", image: "images/lamp-2.jpg" },
};

const KEY = "lumen-bag";
const ORDER_KEY = "lumen-order";

function loadBag() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY) || "{}");
    return data && typeof data === "object" ? data : {};
  } catch {
    return {};
  }
}

function saveBag(bag) {
  localStorage.setItem(KEY, JSON.stringify(bag));
  paintCount();
}

function bagCount(bag = loadBag()) {
  return Object.values(bag).reduce((sum, qty) => sum + qty, 0);
}

function bagTotal(bag = loadBag()) {
  return Object.entries(bag).reduce((sum, [id, qty]) => sum + (CATALOG[id]?.price || 0) * qty, 0);
}

function money(value) {
  return `$${value}`;
}

function shippingFor(total) {
  if (total === 0) return 0;
  return total >= 80 ? 0 : 8;
}

function paintCount() {
  const count = bagCount();
  document.querySelectorAll("[data-bag-count]").forEach((node) => {
    node.textContent = String(count);
  });
}

function changeQty(id, delta) {
  const bag = loadBag();
  const next = (bag[id] || 0) + delta;
  if (next <= 0) delete bag[id];
  else bag[id] = next;
  saveBag(bag);
  return bag;
}

function renderLines(target, bag, { editable }) {
  const rows = Object.entries(bag).filter(([id]) => CATALOG[id]);
  if (!rows.length) {
    target.innerHTML = `<p class="text-[#7a5564]">Your bag is empty. The pieces currently in the shop are on the <a class="underline underline-offset-4" href="index.html">front page</a>.</p>`;
    return;
  }
  target.innerHTML = rows.map(([id, qty]) => {
    const item = CATALOG[id];
    const controls = editable
      ? `<div class="flex items-center gap-2">
          <button type="button" data-dec="${id}" class="h-8 w-8 rounded-full border border-[#ead9cf]" aria-label="Decrease ${item.name}">−</button>
          <span>${qty}</span>
          <button type="button" data-inc="${id}" class="h-8 w-8 rounded-full border border-[#ead9cf]" aria-label="Increase ${item.name}">+</button>
        </div>`
      : `<span class="text-[#7a5564]">Qty ${qty}</span>`;
    return `<li class="flex gap-4 border-b border-[#ead9cf] py-4">
      <a href="${item.href}" class="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-[#f3e6dc]"><img src="${item.image}" alt="" class="h-full w-full object-cover" /></a>
      <div class="flex flex-1 items-start justify-between gap-3">
        <div>
          <a href="${item.href}" class="font-display text-2xl leading-none">${item.name}</a>
          <p class="mt-1 text-sm text-[#7a5564]">${money(item.price)}</p>
        </div>
        ${controls}
      </div>
    </li>`;
  }).join("");
}

function renderBag() {
  const list = document.getElementById("bagLines");
  const summary = document.getElementById("bagSummary");
  if (!list || !summary) return;
  const bag = loadBag();
  renderLines(list, bag, { editable: true });
  const total = bagTotal(bag);
  const shipping = shippingFor(total);
  summary.hidden = total === 0;
  if (!total) return;
  summary.innerHTML = `
    <div class="flex justify-between"><span>Subtotal</span><span>${money(total)}</span></div>
    <div class="mt-2 flex justify-between"><span>Shipping</span><span>${shipping === 0 ? "Free" : money(shipping)}</span></div>
    <div class="mt-3 flex justify-between text-lg"><span>Total</span><span>${money(total + shipping)}</span></div>
    <a href="checkout.html" class="mt-5 block rounded-full bg-[#5c1a3a] py-3 text-center text-sm text-[#fff6ef]">Checkout</a>
    <p class="mt-3 text-center text-sm text-[#7a5564]">Free shipping from $80. Packed in Hudson and sent within three days.</p>`;
}

function renderCheckout() {
  const list = document.getElementById("checkoutLines");
  const summary = document.getElementById("checkoutSummary");
  const form = document.getElementById("checkoutForm");
  const empty = document.getElementById("checkoutEmpty");
  if (!list || !form) return;
  const bag = loadBag();
  const total = bagTotal(bag);
  if (!total) {
    form.hidden = true;
    if (summary) summary.hidden = true;
    if (empty) empty.hidden = false;
    return;
  }
  renderLines(list, bag, { editable: false });
  const shipping = shippingFor(total);
  if (summary) {
    summary.innerHTML = `<div class="flex justify-between"><span>Subtotal</span><span>${money(total)}</span></div>
      <div class="mt-2 flex justify-between"><span>Shipping</span><span>${shipping === 0 ? "Free" : money(shipping)}</span></div>
      <div class="mt-3 flex justify-between text-lg"><span>Due today</span><span>${money(total + shipping)}</span></div>`;
  }
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    const order = {
      number: `LM-${Math.floor(1000 + Math.random() * 9000)}`,
      name: data.name,
      email: data.email,
      address: `${data.street}, ${data.city} ${data.postcode}`,
      total: total + shipping,
      items: Object.entries(bag).map(([id, qty]) => ({ id, qty, name: CATALOG[id].name, price: CATALOG[id].price })),
    };
    sessionStorage.setItem(ORDER_KEY, JSON.stringify(order));
    localStorage.removeItem(KEY);
    location.href = "confirmed.html";
  });
}

function renderConfirmed() {
  const root = document.getElementById("confirmation");
  if (!root) return;
  const raw = sessionStorage.getItem(ORDER_KEY);
  if (!raw) {
    root.innerHTML = `<p>No order is waiting on this browser. You can return to the <a class="underline underline-offset-4" href="index.html">shop</a>.</p>`;
    return;
  }
  const order = JSON.parse(raw);
  root.innerHTML = `
    <p class="text-xs uppercase tracking-[0.2em] text-[#a15b78]">Order ${order.number}</p>
    <h1 class="mt-3 font-display text-5xl">Thank you, ${order.name.split(" ")[0]}.</h1>
    <p class="mt-4 max-w-xl text-[#5c3b48]">A receipt is addressed to ${order.email}. We pack in Hudson and hand the parcel to the carrier within three working days. It ships to ${order.address}.</p>
    <ul class="mt-8 divide-y divide-[#ead9cf] border-y border-[#ead9cf]">
      ${order.items.map((item) => `<li class="flex justify-between py-3"><span>${item.name} × ${item.qty}</span><span>${money(item.price * item.qty)}</span></li>`).join("")}
    </ul>
    <p class="mt-4 text-lg">Total ${money(order.total)}</p>`;
}

document.addEventListener("click", (event) => {
  const add = event.target.closest("[data-add]");
  const inc = event.target.closest("[data-inc]");
  const dec = event.target.closest("[data-dec]");
  if (add) {
    const id = add.dataset.add;
    const qtyInput = document.getElementById(add.dataset.qty || "");
    const qty = qtyInput ? Math.max(1, parseInt(qtyInput.value, 10) || 1) : 1;
    const bag = loadBag();
    bag[id] = (bag[id] || 0) + qty;
    saveBag(bag);
    add.textContent = "Added to bag";
    const note = document.getElementById("addedNote");
    if (note) {
      note.hidden = false;
      note.textContent = `${CATALOG[id].name} is in your bag.`;
    }
  }
  if (inc || dec) {
    changeQty((inc || dec).dataset.inc || (inc || dec).dataset.dec, inc ? 1 : -1);
    renderBag();
  }
});

paintCount();
renderBag();
renderCheckout();
renderConfirmed();
