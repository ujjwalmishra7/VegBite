const CART_KEY = "vegbite_cart";
const LOCAL_USER_KEY = "vegbite_demo_user";

const AppState = {
  client: null,
  user: null,
  profile: null,
};

function getSupabaseClient() {
  if (!isSupabaseConfigured() || !window.supabase) return null;
  if (!AppState.client) {
    AppState.client = window.supabase.createClient(
      APP_CONFIG.supabaseUrl,
      APP_CONFIG.supabaseAnonKey
    );
  }
  return AppState.client;
}

async function getCurrentUser() {
  const client = getSupabaseClient();
  if (client) {
    const { data } = await client.auth.getUser();
    AppState.user = data.user || null;
    return AppState.user;
  }

  try {
    AppState.user = JSON.parse(localStorage.getItem(LOCAL_USER_KEY));
  } catch (e) {
    AppState.user = null;
  }
  return AppState.user;
}

function isLoggedIn() {
  return Boolean(AppState.user);
}

async function requireLogin(next = location.pathname.split("/").pop() || "index.html") {
  await getCurrentUser();
  if (isLoggedIn()) return true;
  const target = encodeURIComponent(next + location.search);
  showToast("Please login before booking food", "!");
  window.location.href = `login.html?next=${target}`;
  return false;
}

const Cart = {
  read() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch (e) {
      return [];
    }
  },
  write(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    Cart.updateBadge();
  },
  add(dishId, qty = 1) {
    const items = Cart.read();
    const existing = items.find((i) => i.id === dishId);
    if (existing) existing.qty += qty;
    else items.push({ id: dishId, qty });
    Cart.write(items);
  },
  updateQty(dishId, qty) {
    let items = Cart.read();
    if (qty <= 0) items = items.filter((i) => i.id !== dishId);
    else {
      const existing = items.find((i) => i.id === dishId);
      if (existing) existing.qty = qty;
    }
    Cart.write(items);
  },
  remove(dishId) {
    Cart.write(Cart.read().filter((i) => i.id !== dishId));
  },
  clear() {
    Cart.write([]);
  },
  count() {
    return Cart.read().reduce((sum, item) => sum + item.qty, 0);
  },
  updateBadge() {
    document.querySelectorAll("[data-cart-count]").forEach((el) => {
      const count = Cart.count();
      el.textContent = count;
      el.classList.toggle("is-hidden", count === 0);
    });
  },
};

function showToast(message, icon = "i") {
  let host = document.querySelector(".toast-host");
  if (!host) {
    host = document.createElement("div");
    host.className = "toast-host";
    document.body.appendChild(host);
  }
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<span class="toast__icon">${icon}</span><span>${message}</span>`;
  host.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("is-visible"));
  setTimeout(() => {
    toast.classList.remove("is-visible");
    setTimeout(() => toast.remove(), 300);
  }, 2600);
}

function initNavbar() {
  const nav = document.querySelector(".navbar");
  if (!nav) return;

  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 12);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const toggle = document.querySelector(".nav-toggle");
  const menu = document.querySelector(".nav-menu");
  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      const open = menu.classList.toggle("is-open");
      toggle.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
    });
    menu.querySelectorAll("a").forEach((link) =>
      link.addEventListener("click", () => {
        menu.classList.remove("is-open");
        toggle.classList.remove("is-open");
      })
    );
  }

  const current = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-menu a").forEach((link) => {
    const href = link.getAttribute("href");
    if (href === current) link.classList.add("is-active");
  });
}

function updateAccountLinks() {
  const menus = document.querySelectorAll(".nav-menu");
  menus.forEach((menu) => {
    const loginLink = menu.querySelector('a[href="login.html"]');
    if (!loginLink) return;
    if (isLoggedIn()) {
      loginLink.href = "profile.html";
      loginLink.textContent = "Profile";
    } else {
      loginLink.href = "login.html";
      loginLink.textContent = "Login";
    }
  });
}

function initScrollTop() {
  const btn = document.querySelector(".scroll-top");
  if (!btn) return;
  window.addEventListener(
    "scroll",
    () => btn.classList.toggle("is-visible", window.scrollY > 480),
    { passive: true }
  );
  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

function initSmoothAnchors() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
}

function initRevealOnScroll() {
  const items = document.querySelectorAll("[data-reveal]:not(.is-revealed)");
  if (!items.length) return;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  items.forEach((el) => io.observe(el));
}

function initLoader() {
  const loader = document.querySelector(".loader");
  if (!loader) return;
  window.addEventListener("load", () => setTimeout(() => loader.classList.add("is-done"), 250));
}

async function bootstrapApp() {
  initNavbar();
  initScrollTop();
  initSmoothAnchors();
  initRevealOnScroll();
  initLoader();
  Cart.updateBadge();
  await getCurrentUser();
  updateAccountLinks();

  const page = location.pathname.split("/").pop();
  if (page === "checkout.html") await requireLogin("checkout.html");
}

document.addEventListener("DOMContentLoaded", bootstrapApp);
