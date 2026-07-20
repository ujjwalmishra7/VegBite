const DELIVERY_FEE = 40;
const PACKAGING_FEE = 15;
const FREE_DELIVERY_THRESHOLD = 499;
const COUPON_STORAGE_KEY = "vegbite_coupon";

const COUPONS = {
  WELCOME50: { type: "percent", value: 50, maxDiscount: 100, minOrder: 149, label: "50% off up to Rs. 100" },
  VEG20: { type: "percent", value: 20, maxDiscount: 150, minOrder: 199, label: "20% off up to Rs. 150" },
  FLAT75: { type: "flat", value: 75, minOrder: 399, label: "Flat Rs. 75 off" },
  FREESHIP: { type: "shipping", value: 0, minOrder: 0, label: "Free delivery on your order" },
};

const Coupon = {
  read() {
    try {
      return JSON.parse(sessionStorage.getItem(COUPON_STORAGE_KEY) || "null");
    } catch (e) {
      return null;
    }
  },
  save(code) {
    sessionStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(code));
  },
  clear() {
    sessionStorage.removeItem(COUPON_STORAGE_KEY);
  },
};

function generateOrderNumber() {
  const now = new Date();
  const y = String(now.getFullYear()).slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `VB-${y}${m}-${rand}`;
}

function cartLineItems() {
  return Cart.read()
    .map((line) => {
      const dish = DISHES.find((d) => d.id === line.id);
      return dish ? { ...dish, qty: line.qty } : null;
    })
    .filter(Boolean);
}

function cartTotals() {
  const items = cartLineItems();
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  let delivery = subtotal === 0 || subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const packaging = subtotal === 0 ? 0 : PACKAGING_FEE;

  let discount = 0;
  let couponCode = null;
  let couponLabel = null;
  const applied = subtotal > 0 ? Coupon.read() : null;

  if (applied && COUPONS[applied]) {
    const coupon = COUPONS[applied];
    if (subtotal >= coupon.minOrder) {
      couponCode = applied;
      couponLabel = coupon.label;
      if (coupon.type === "percent") {
        discount = Math.min(Math.round((subtotal * coupon.value) / 100), coupon.maxDiscount);
      } else if (coupon.type === "flat") {
        discount = Math.min(coupon.value, subtotal);
      } else if (coupon.type === "shipping") {
        discount = delivery;
        delivery = 0;
      }
    } else {
      Coupon.clear();
    }
  }

  const total = Math.max(subtotal + delivery + packaging - discount, 0);
  return {
    subtotal,
    delivery,
    packaging,
    discount,
    couponCode,
    couponLabel,
    total,
    itemCount: items.reduce((n, item) => n + item.qty, 0),
  };
}

function couponBoxHTML(totals) {
  if (totals.couponCode) {
    return `
      <div class="coupon-box coupon-box--applied">
        <div class="coupon-box__applied-row">
          <span><i class="fa-solid fa-tag"></i> <strong>${totals.couponCode}</strong> applied</span>
          <button type="button" class="coupon-box__remove" data-coupon-remove>Remove</button>
        </div>
        <p class="coupon-box__note">${totals.couponLabel} - you saved Rs. ${totals.discount}</p>
      </div>`;
  }
  return `
    <div class="coupon-box">
      <div class="coupon-box__input-row">
        <input type="text" class="coupon-box__input" id="coupon-input" placeholder="Enter coupon code" autocomplete="off" />
        <button type="button" class="btn btn--ghost coupon-box__apply" data-coupon-apply>Apply</button>
      </div>
      <div class="coupon-box__error" id="coupon-error"></div>
      <div class="coupon-box__chips">
        ${Object.entries(COUPONS).map(([code, c]) => `<button type="button" class="coupon-chip" data-coupon-chip="${code}">${code}</button>`).join("")}
      </div>
    </div>`;
}

function applyCouponCode(rawCode, summaryRenderFn) {
  const errorEl = document.querySelector("#coupon-error");
  const code = (rawCode || "").trim().toUpperCase();
  if (errorEl) errorEl.textContent = "";

  if (!code) {
    if (errorEl) errorEl.textContent = "Please enter a coupon code.";
    return;
  }
  if (!COUPONS[code]) {
    if (errorEl) errorEl.textContent = "Invalid coupon code.";
    return;
  }
  const subtotal = cartTotals().subtotal;
  if (subtotal < COUPONS[code].minOrder) {
    if (errorEl) errorEl.textContent = `Add items worth Rs. ${COUPONS[code].minOrder}+ to use ${code}.`;
    return;
  }
  Coupon.save(code);
  showToast(`Coupon ${code} applied`, "OK");
  summaryRenderFn();
}

function initCouponBox(host, summaryRenderFn) {
  if (!host) return;
  const applyBtn = host.querySelector("[data-coupon-apply]");
  const input = host.querySelector("#coupon-input");
  if (applyBtn && input) {
    applyBtn.addEventListener("click", () => applyCouponCode(input.value, summaryRenderFn));
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        applyCouponCode(input.value, summaryRenderFn);
      }
    });
  }
  host.querySelectorAll("[data-coupon-chip]").forEach((chip) => {
    chip.addEventListener("click", () => applyCouponCode(chip.dataset.couponChip, summaryRenderFn));
  });
  const removeBtn = host.querySelector("[data-coupon-remove]");
  if (removeBtn) {
    removeBtn.addEventListener("click", () => {
      Coupon.clear();
      showToast("Coupon removed", "x");
      summaryRenderFn();
    });
  }
}

function cartImage(src, alt, className) {
  return `<img class="${className}" src="${src}" alt="${alt}" loading="lazy" onerror="this.src='images/placeholder-food.svg';" />`;
}

function cartLineHTML(item) {
  return `
    <div class="cart-line" data-reveal data-id="${item.id}">
      <div class="cart-line__media">${cartImage(item.image, item.name, "cart-line__image")}</div>
      <div class="cart-line__info">
        <h3>${item.name}</h3>
        <span class="cart-line__unit">Rs. ${item.price} each</span>
      </div>
      <div class="qty-stepper" data-qty="${item.id}">
        <button class="qty-stepper__btn" data-action="minus" aria-label="Decrease quantity">-</button>
        <span class="qty-stepper__value">${item.qty}</span>
        <button class="qty-stepper__btn" data-action="plus" aria-label="Increase quantity">+</button>
      </div>
      <div class="cart-line__total">Rs. ${item.price * item.qty}</div>
      <button class="cart-line__remove" data-remove="${item.id}" aria-label="Remove item">x</button>
    </div>`;
}

function renderCartPage() {
  const host = document.querySelector("#cart-list");
  if (!host) return;

  const emptyState = document.querySelector("#cart-empty");
  const summaryHost = document.querySelector("#cart-summary");
  const items = cartLineItems();

  if (items.length === 0) {
    host.innerHTML = "";
    host.classList.add("is-hidden");
    if (emptyState) emptyState.classList.add("is-visible");
    if (summaryHost) summaryHost.classList.add("is-hidden");
    return;
  }

  host.classList.remove("is-hidden");
  if (emptyState) emptyState.classList.remove("is-visible");
  if (summaryHost) summaryHost.classList.remove("is-hidden");

  host.innerHTML = items.map(cartLineHTML).join("");
  renderSummary();
  if (typeof initRevealOnScroll === "function") initRevealOnScroll();

  host.querySelectorAll(".qty-stepper__btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const wrap = btn.closest(".qty-stepper");
      const current = Cart.read().find((item) => item.id === wrap.dataset.qty);
      const qty = current ? current.qty : 0;
      Cart.updateQty(wrap.dataset.qty, btn.dataset.action === "plus" ? qty + 1 : qty - 1);
      renderCartPage();
    });
  });

  host.querySelectorAll("[data-remove]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const dish = DISHES.find((d) => d.id === btn.dataset.remove);
      Cart.remove(btn.dataset.remove);
      if (dish) showToast(`${dish.name} removed`, "x");
      renderCartPage();
    });
  });
}

function renderSummary() {
  const el = document.querySelector("#cart-summary");
  if (!el) return;
  const totals = cartTotals();
  el.innerHTML = `
    <h2 class="summary__title">Order Summary</h2>
    <div class="summary__row"><span>Subtotal (${totals.itemCount} item${totals.itemCount === 1 ? "" : "s"})</span><span>Rs. ${totals.subtotal}</span></div>
    <div class="summary__row"><span>Delivery fee</span><span>${totals.delivery === 0 ? "FREE" : "Rs. " + totals.delivery}</span></div>
    <div class="summary__row"><span>Packaging</span><span>Rs. ${totals.packaging}</span></div>
    ${totals.discount > 0 ? `<div class="summary__row summary__row--discount"><span>Coupon discount (${totals.couponCode})</span><span>- Rs. ${totals.discount}</span></div>` : ""}
    ${totals.subtotal > 0 && totals.subtotal < FREE_DELIVERY_THRESHOLD ? `<p class="summary__note">Add Rs. ${FREE_DELIVERY_THRESHOLD - totals.subtotal} more for free delivery</p>` : ""}
    <div class="summary__row summary__row--total"><span>Total</span><span>Rs. ${totals.total}</span></div>
    ${couponBoxHTML(totals)}
    <a href="checkout.html" class="btn btn--primary btn--block">Proceed to Checkout</a>
  `;
  initCouponBox(el, renderSummary);
}

function renderCheckoutSummary() {
  const host = document.querySelector("#checkout-summary");
  if (!host) return;
  const items = cartLineItems();
  const totals = cartTotals();

  if (items.length === 0) {
    host.innerHTML = `<p class="summary__note">Your cart is empty. <a href="menu.html">Browse the menu</a> to add dishes.</p>`;
    return;
  }

  host.innerHTML = `
    <h2 class="summary__title">Order Summary</h2>
    <div class="checkout-items">
      ${items.map((item) => `
        <div class="checkout-item">
          ${cartImage(item.image, item.name, "checkout-item__image")}
          <span class="checkout-item__name">${item.name} <em>x ${item.qty}</em></span>
          <span class="checkout-item__price">Rs. ${item.price * item.qty}</span>
        </div>`).join("")}
    </div>
    <div class="summary__row"><span>Subtotal</span><span>Rs. ${totals.subtotal}</span></div>
    <div class="summary__row"><span>Delivery fee</span><span>${totals.delivery === 0 ? "FREE" : "Rs. " + totals.delivery}</span></div>
    <div class="summary__row"><span>Packaging</span><span>Rs. ${totals.packaging}</span></div>
    ${totals.discount > 0 ? `<div class="summary__row summary__row--discount"><span>Coupon discount (${totals.couponCode})</span><span>- Rs. ${totals.discount}</span></div>` : ""}
    <div class="summary__row summary__row--total"><span>Total</span><span>Rs. ${totals.total}</span></div>
    ${couponBoxHTML(totals)}
  `;
  initCouponBox(host, () => {
    renderCheckoutSummary();
  });
}

async function saveOrder(paymentId, address, method) {
  const totals = cartTotals();
  const order = {
    order_number: generateOrderNumber(),
    user_id: AppState.user?.id || null,
    items: cartLineItems(),
    totals,
    coupon_code: totals.couponCode || null,
    address,
    payment_method: method,
    payment_id: paymentId,
    payment_status: paymentId ? "paid" : "cash_on_delivery",
  };

  const client = getSupabaseClient();
  if (!client) {
    const localOrders = JSON.parse(localStorage.getItem("vegbite_demo_orders") || "[]");
    const saved = { ...order, id: crypto.randomUUID(), created_at: new Date().toISOString() };
    localOrders.unshift(saved);
    localStorage.setItem("vegbite_demo_orders", JSON.stringify(localOrders));
    return saved;
  }

  const { data, error } = await client.from("orders").insert(order).select().single();
  if (error) throw error;
  return data;
}

function runRazorpay(total, address) {
  return new Promise((resolve, reject) => {
    if (!isRazorpayConfigured() || !window.Razorpay) {
      reject(new Error("Razorpay is not configured yet."));
      return;
    }
    const checkout = new Razorpay({
      key: APP_CONFIG.razorpayKeyId,
      amount: total * 100,
      currency: APP_CONFIG.currency,
      name: "VegBite",
      description: "Pure veg food order",
      prefill: { name: address.name, contact: address.phone },
      handler(response) {
        resolve(response.razorpay_payment_id);
      },
      modal: { ondismiss: () => reject(new Error("Payment cancelled.")) },
    });
    checkout.open();
  });
}

function paymentMethodLabel(method) {
  const labels = { cod: "Cash on Delivery", upi: "UPI", card: "Card", wallet: "Wallet" };
  return labels[method] || "Cash on Delivery";
}

function successMessage(order) {
  const host = document.querySelector("#checkout-app");
  if (!host) return;
  const items = order.items || [];
  const totals = order.totals || {};
  const address = order.address || {};

  host.innerHTML = `
    <div class="order-success order-success--detailed" data-reveal>
      <span class="veg-mark veg-mark--lg"></span>
      <h2>Order placed successfully!</h2>
      <p>Your pure veg meal is being prepared and will arrive within 35-40 minutes.</p>

      <div class="order-receipt">
        <div class="order-receipt__head">
          <div>
            <span class="order-receipt__label">Order Number</span>
            <strong class="order-receipt__number">${order.order_number || "N/A"}</strong>
          </div>
          <div>
            <span class="order-receipt__label">Placed On</span>
            <strong>${new Date(order.created_at || Date.now()).toLocaleString()}</strong>
          </div>
        </div>

        <div class="order-receipt__items">
          ${items.map((item) => `
            <div class="checkout-item">
              ${cartImage(item.image, item.name, "checkout-item__image")}
              <span class="checkout-item__name">${item.name} <em>x ${item.qty}</em></span>
              <span class="checkout-item__price">Rs. ${item.price * item.qty}</span>
            </div>`).join("")}
        </div>

        <div class="summary__row"><span>Subtotal</span><span>Rs. ${totals.subtotal || 0}</span></div>
        <div class="summary__row"><span>Delivery fee</span><span>${!totals.delivery ? "FREE" : "Rs. " + totals.delivery}</span></div>
        <div class="summary__row"><span>Packaging</span><span>Rs. ${totals.packaging || 0}</span></div>
        ${totals.discount ? `<div class="summary__row summary__row--discount"><span>Coupon discount (${totals.couponCode || order.coupon_code || ""})</span><span>- Rs. ${totals.discount}</span></div>` : ""}
        <div class="summary__row summary__row--total"><span>Total Paid</span><span>Rs. ${totals.total || 0}</span></div>

        <div class="order-receipt__meta">
          <div>
            <span class="order-receipt__label">Deliver To</span>
            <p>${address.name || ""}, ${address.phone || ""}<br>${address.address || ""}, ${address.city || ""}</p>
          </div>
          <div>
            <span class="order-receipt__label">Payment</span>
            <p>${paymentMethodLabel(order.payment_method)} ${order.payment_id ? `(ID: ${order.payment_id})` : "(Pay on delivery)"}</p>
          </div>
        </div>
      </div>

      <a href="profile.html" class="btn btn--primary">View Profile</a>
    </div>`;
}

function initCheckoutForm() {
  const form = document.querySelector("#checkout-form");
  if (!form) return;

  form.querySelectorAll(".payment-option").forEach((opt) => {
    opt.addEventListener("click", () => {
      form.querySelectorAll(".payment-option").forEach((o) => o.classList.remove("is-selected"));
      opt.classList.add("is-selected");
      opt.querySelector('input[type="radio"]').checked = true;
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const loggedIn = await requireLogin("checkout.html");
    if (!loggedIn) return;
    if (cartLineItems().length === 0) return showToast("Your cart is empty", "!");
    if (!form.checkValidity()) return form.reportValidity();

    const address = {
      name: form.querySelector("#co-name").value.trim(),
      phone: form.querySelector("#co-phone").value.trim(),
      address: form.querySelector("#co-address").value.trim(),
      city: form.querySelector("#co-city").value.trim(),
    };
    const method = form.querySelector('input[name="payment"]:checked')?.value || "cod";
    let paymentId = null;

    try {
      if (method !== "cod") paymentId = await runRazorpay(cartTotals().total, address);
      const savedOrder = await saveOrder(paymentId, address, method);
      Cart.clear();
      Coupon.clear();
      successMessage(savedOrder);
      if (typeof initRevealOnScroll === "function") initRevealOnScroll();
      showToast("Order saved successfully", "OK");
    } catch (error) {
      showToast(error.message || "Could not place order", "!");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderCartPage();
  renderCheckoutSummary();
  initCheckoutForm();
  if (typeof initRevealOnScroll === "function") initRevealOnScroll();
});
