async function loadOrders() {
  const client = getSupabaseClient();
  if (!client) return JSON.parse(localStorage.getItem("vegbite_demo_orders") || "[]");

  const { data, error } = await client
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

async function loadProfile() {
  await requireLogin("profile.html");
  const user = AppState.user;
  const form = document.querySelector("#profile-form");
  const header = document.querySelector("#profile-title");
  if (!form || !user) return;

  let profile = {
    full_name: user.user_metadata?.full_name || "VegBite User",
    phone: user.user_metadata?.phone || "",
    email: user.email || "",
  };

  const client = getSupabaseClient();
  if (client) {
    const { data } = await client.from("profiles").select("*").eq("id", user.id).maybeSingle();
    if (data) profile = { ...profile, ...data };
  }

  if (header) header.textContent = `Hi, ${profile.full_name}`;
  form.querySelector("#profile-name").value = profile.full_name || "";
  form.querySelector("#profile-email").value = profile.email || "";
  form.querySelector("#profile-phone").value = profile.phone || "";
}

function orderPaymentLabel(method) {
  const labels = { cod: "Cash on Delivery", upi: "UPI", card: "Card", wallet: "Wallet" };
  return labels[method] || "Cash on Delivery";
}

function orderItemsHTML(order) {
  const items = order.items || [];
  if (!items.length) return `<p class="summary__note">No item details available.</p>`;
  return `
    <div class="checkout-items" style="margin-top:14px; padding-top:14px; border-top:1px solid var(--border);">
      ${items.map((item) => `
        <div class="checkout-item">
          <img class="checkout-item__image" src="${item.image}" alt="${item.name}" loading="lazy" onerror="this.src='images/placeholder-food.svg';" />
          <span class="checkout-item__name">${item.name} <em>x ${item.qty}</em></span>
          <span class="checkout-item__price">Rs. ${item.price * item.qty}</span>
        </div>`).join("")}
      ${order.totals?.discount ? `<div class="summary__row summary__row--discount"><span>Coupon (${order.coupon_code || order.totals.couponCode || ""})</span><span>- Rs. ${order.totals.discount}</span></div>` : ""}
      <div class="summary__row"><span>Delivery</span><span>${order.address?.address || ""}, ${order.address?.city || ""}</span></div>
      <div class="summary__row"><span>Payment</span><span>${orderPaymentLabel(order.payment_method)}</span></div>
    </div>`;
}

async function renderOrders() {
  const host = document.querySelector("#profile-orders");
  if (!host) return;
  try {
    const orders = await loadOrders();
    if (!orders.length) {
      host.innerHTML = `<p class="summary__note">No orders yet. Your new orders will appear here.</p>`;
      return;
    }
    host.innerHTML = orders.map((order, idx) => `
      <div class="order-row order-row--expandable" data-order-toggle="${idx}">
        <div>
          <strong>${order.order_number || "Order #" + (idx + 1)}</strong>
          <span>${new Date(order.created_at || Date.now()).toLocaleString()} - ${(order.items || []).length} item(s) - ${order.payment_status || "saved"}</span>
        </div>
        <b>Rs. ${order.totals?.total || 0} <i class="fa-solid fa-chevron-down"></i></b>
      </div>
      <div class="order-details is-hidden" id="order-details-${idx}">
        ${orderItemsHTML(order)}
      </div>
    `).join("");

    host.querySelectorAll("[data-order-toggle]").forEach((row) => {
      row.addEventListener("click", () => {
        const details = document.querySelector(`#order-details-${row.dataset.orderToggle}`);
        if (details) details.classList.toggle("is-hidden");
      });
    });
  } catch (error) {
    host.innerHTML = `<p class="summary__note">${error.message}</p>`;
  }
}

function initProfileForm() {
  const form = document.querySelector("#profile-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const profile = {
      full_name: form.querySelector("#profile-name").value.trim(),
      email: form.querySelector("#profile-email").value.trim(),
      phone: form.querySelector("#profile-phone").value.trim(),
    };
    try {
      const client = getSupabaseClient();
      if (client) {
        await client.from("profiles").upsert({ id: AppState.user.id, ...profile });
      } else {
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify({
          ...AppState.user,
          email: profile.email,
          user_metadata: { full_name: profile.full_name, phone: profile.phone },
        }));
      }
      showToast("Profile saved", "OK");
      await getCurrentUser();
      await loadProfile();
    } catch (error) {
      showToast(error.message || "Could not save profile", "!");
    }
  });

  const logout = document.querySelector("#logout-btn");
  if (logout) {
    logout.addEventListener("click", async () => {
      const client = getSupabaseClient();
      if (client) await client.auth.signOut();
      localStorage.removeItem(LOCAL_USER_KEY);
      window.location.href = "login.html";
    });
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadProfile();
  await renderOrders();
  initProfileForm();
});
