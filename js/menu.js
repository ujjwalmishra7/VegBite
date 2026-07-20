function imageTag(src, alt, className) {
  return `<img class="${className}" src="${src}" alt="${alt}" loading="lazy" onerror="this.src='images/placeholder-food.svg';" />`;
}

function foodCardHTML(dish) {
  const badges = dish.tags
    .map((tag) => `<span class="chip chip--${tag}">${tag === "bestseller" ? "Bestseller" : tag === "special" ? "Today's Special" : "Popular"}</span>`)
    .join("");

  return `
    <article class="food-card" data-reveal data-id="${dish.id}" data-price="${dish.price}" data-name="${dish.name.toLowerCase()}">
      <div class="food-card__media">
        ${imageTag(dish.image, dish.name, "food-card__image")}
        <span class="veg-mark" title="100% Vegetarian" aria-label="Vegetarian"></span>
        ${badges ? `<div class="food-card__badges">${badges}</div>` : ""}
      </div>
      <div class="food-card__body">
        <div class="food-card__top">
          <h3 class="food-card__name">${dish.name}</h3>
          <span class="food-card__rating">Star ${dish.rating.toFixed(1)}</span>
        </div>
        <p class="food-card__desc">${dish.desc}</p>
        <div class="food-card__bottom">
          <span class="food-card__price">Rs. ${dish.price}</span>
          <button class="btn btn--add" data-add="${dish.id}">
            <span>Add</span><span class="btn__plus">+</span>
          </button>
        </div>
      </div>
    </article>`;
}

function attachAddToCartHandlers(scope = document) {
  scope.querySelectorAll("[data-add]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const loggedIn = await requireLogin("menu.html");
      if (!loggedIn) return;
      const dish = DISHES.find((d) => d.id === btn.dataset.add);
      if (!dish) return;
      Cart.add(dish.id, 1);
      showToast(`${dish.name} added to cart`, "+");
      btn.classList.remove("btn--pulse");
      void btn.offsetWidth;
      btn.classList.add("btn--pulse");
    });
  });
}

function renderHomeRails() {
  const popularHost = document.querySelector("#rail-popular");
  const bestHost = document.querySelector("#rail-bestsellers");
  const specialHost = document.querySelector("#rail-special");

  if (popularHost) {
    popularHost.innerHTML = DISHES.filter((d) => d.tags.includes("popular")).slice(0, 8).map(foodCardHTML).join("");
    attachAddToCartHandlers(popularHost);
  }
  if (bestHost) {
    bestHost.innerHTML = DISHES.filter((d) => d.tags.includes("bestseller")).slice(0, 8).map(foodCardHTML).join("");
    attachAddToCartHandlers(bestHost);
  }
  if (specialHost) {
    specialHost.innerHTML = DISHES.filter((d) => d.tags.includes("special")).map(foodCardHTML).join("");
    attachAddToCartHandlers(specialHost);
  }
}

function renderCategoryTiles() {
  const host = document.querySelector("#category-grid");
  if (!host) return;
  host.innerHTML = CATEGORIES.map(
    (category) => `
    <a class="category-tile" href="menu.html?category=${category.id}" data-reveal>
      ${imageTag(category.image, category.label, "category-tile__image")}
      <span class="category-tile__label">${category.label}</span>
    </a>`
  ).join("");
}

function renderReviews() {
  const host = document.querySelector("#reviews-track");
  if (!host) return;
  host.innerHTML = REVIEWS.map(
    (review) => `
    <blockquote class="review-card" data-reveal>
      <div class="review-card__stars">${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}</div>
      <p class="review-card__text">"${review.text}"</p>
      <footer class="review-card__meta">- ${review.name}, <span>${review.city}</span></footer>
    </blockquote>`
  ).join("");
}

function initMenuPage() {
  const grid = document.querySelector("#menu-grid");
  if (!grid) return;

  const searchInput = document.querySelector("#menu-search");
  const sortSelect = document.querySelector("#menu-sort");
  const chipButtons = document.querySelectorAll(".filter-chip");
  const emptyState = document.querySelector("#menu-empty");
  const resultCount = document.querySelector("#menu-result-count");
  const params = new URLSearchParams(location.search);

  let activeCategory = params.get("category") || "all";
  let sortMode = "default";
  let query = params.get("search") || "";
  if (searchInput) searchInput.value = query;

  function syncChips() {
    chipButtons.forEach((chip) => chip.classList.toggle("is-active", chip.dataset.category === activeCategory));
  }

  function render() {
    let list = DISHES.filter((dish) => activeCategory === "all" || dish.category === activeCategory);
    const q = query.trim().toLowerCase();
    if (q) list = list.filter((dish) => dish.name.toLowerCase().includes(q) || dish.category.includes(q));
    if (sortMode === "low-high") list = [...list].sort((a, b) => a.price - b.price);
    if (sortMode === "high-low") list = [...list].sort((a, b) => b.price - a.price);
    if (sortMode === "rating") list = [...list].sort((a, b) => b.rating - a.rating);

    grid.innerHTML = list.map(foodCardHTML).join("");
    attachAddToCartHandlers(grid);
    if (typeof initRevealOnScroll === "function") initRevealOnScroll();
    if (resultCount) resultCount.textContent = `${list.length} dish${list.length === 1 ? "" : "es"}`;
    if (emptyState) emptyState.classList.toggle("is-visible", list.length === 0);
  }

  chipButtons.forEach((chip) => chip.addEventListener("click", () => {
    activeCategory = chip.dataset.category;
    syncChips();
    render();
  }));
  if (searchInput) searchInput.addEventListener("input", (e) => {
    query = e.target.value;
    render();
  });
  if (sortSelect) sortSelect.addEventListener("change", (e) => {
    sortMode = e.target.value;
    render();
  });

  syncChips();
  render();
}

document.addEventListener("DOMContentLoaded", () => {
  renderCategoryTiles();
  renderHomeRails();
  renderReviews();
  initMenuPage();
  if (typeof initRevealOnScroll === "function") initRevealOnScroll();
});
