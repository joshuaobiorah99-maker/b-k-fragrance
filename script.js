
"use strict";

// =====================================
// B&K FRAGRANCE — PRODUCT CATALOGUE
// =====================================

const products = [
  {
    name: "B&K Noir",
    family: "Woody",
    top: "Black Pepper",
    heart: "Oud",
    base: "Amber",
    size: "100ml",
    price: "₦45,000",
    image: "noir.png",
  },
  {
    name: "B&K Golden Hour",
    family: "Floral",
    top: "Bergamot",
    heart: "Jasmine",
    base: "Vanilla",
    size: "100ml",
    price: "₦38,000",
    image: "golden-hour.png",
  },
  {
    name: "B&K Midnight Rose",
    family: "Floral",
    top: "Rose",
    heart: "Musk",
    base: "Sandalwood",
    size: "100ml",
    price: "₦42,000",
    image: "midnight-rose.png",
  },
  {
    name: "B&K Ocean Breeze",
    family: "Fresh",
    top: "Citrus",
    heart: "Sea Salt",
    base: "Cedar",
    size: "100ml",
    price: "₦35,000",
    image: "ocean-breeze.png",
  },
];

// =====================================
// IMAGE PATH HELPERS
// =====================================

// Use paths relative to the HTML page.
// This works on Live Server and GitHub Pages.

function getImageCandidates(filename) {
  if (!filename) return [];

  const cleanName = String(filename)
    .replace(/^\/+/, "")
    .replace(/^images\//, "");

  return [
    cleanName,
    "images/" + cleanName,
  ];
}

// =====================================
// DRAWN BOTTLE FALLBACK
// =====================================

function bottleHTML() {
  return `
    <div class="bottle">
      <div class="bottle-cap"></div>
      <div class="bottle-neck"></div>
      <div class="bottle-body">
        <div class="bottle-label">
          B&amp;K
          <small>FRAGRANCE</small>
        </div>
      </div>
    </div>
  `;
}

// =====================================
// PRODUCT CARD
// =====================================

function cardHTML(p) {
  const candidates = getImageCandidates(p.image);

  const visual = candidates.length
    ? `
      <img
        class="product-photo"
        src="${candidates[0]}"
        data-image-name="${p.image}"
        alt="${p.name} perfume bottle"
        loading="lazy"
        decoding="async"
      >
    `
    : bottleHTML();

  return `
    <div class="product-card">
      <span class="family-tag">${p.family}</span>

      ${visual}

      <h3>${p.name}</h3>

      <p class="size">${p.size}</p>

      <div class="pyramid">
        <div>
          <small>Top</small>
          ${p.top}
        </div>
        <div>
          <small>Heart</small>
          ${p.heart}
        </div>
        <div>
          <small>Base</small>
          ${p.base}
        </div>
      </div>

      <p class="price">${p.price}</p>

      <button type="button">Add to cart</button>
    </div>
  `;
}

// =====================================
// IMAGE ERROR HANDLING
// =====================================

function setupProductImages(grid) {
  const images = grid.querySelectorAll(
    "img.product-photo"
  );

  images.forEach((img) => {
    const filename = img.dataset.imageName;
    const candidates = getImageCandidates(filename);

    let currentIndex = 0;

    function tryNextImage() {
      currentIndex++;

      if (currentIndex < candidates.length) {
        img.src = candidates[currentIndex];
        return;
      }

      console.error(
        "B&K Fragrance: Image not found:",
        filename,
        "Tried:",
        candidates
      );

      // Show the existing drawn bottle when
      // neither image location works.
      const holder = document.createElement("div");
      holder.innerHTML = bottleHTML().trim();

      const fallback = holder.firstElementChild;

      if (fallback) {
        img.replaceWith(fallback);
      }
    }

    img.addEventListener("error", tryNextImage);

    // Handle images that failed before
    // the error listener was attached.
    if (img.complete && img.naturalWidth === 0) {
      tryNextImage();
    }
  });
}

// =====================================
// RENDER PRODUCTS
// =====================================

function renderProducts(gridId, list) {
  const grid = document.getElementById(gridId);

  if (!grid) return;

  if (!Array.isArray(list) || list.length === 0) {
    grid.innerHTML = `
      <p class="empty-products">
        No fragrances found in this category.
      </p>
    `;
    return;
  }

  grid.innerHTML = list.map(cardHTML).join("");

  setupProductImages(grid);
}

// =====================================
// HOME PAGE FEATURED PRODUCTS
// =====================================

// Keep the original homepage behavior:
// show the first two featured fragrances.

renderProducts(
  "featuredGrid",
  products.slice(0, 2)
);

// =====================================
// COLLECTION PAGE FILTERS
// =====================================

const collectionGrid = document.getElementById(
  "productGrid"
);

if (collectionGrid) {
  const filterButtons = document.querySelectorAll(
    ".filter-btn"
  );

  const params = new URLSearchParams(
    window.location.search
  );

  const requested = params.get("family");

  function applyFilter(family) {
    const list =
      family === "All"
        ? products
        : products.filter(
            (product) => product.family === family
          );

    renderProducts("productGrid", list);

    filterButtons.forEach((btn) => {
      const isActive = btn.dataset.filter === family;

      btn.classList.toggle("active", isActive);

      btn.setAttribute(
        "aria-pressed",
        String(isActive)
      );
    });

    // Notify other scripts that cards were rendered.
    document.dispatchEvent(
      new CustomEvent("products:rendered")
    );
  }

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      applyFilter(btn.dataset.filter);
    });
  });

  const validFamilies = [
    "Woody",
    "Floral",
    "Fresh",
  ];

  const startFamily = validFamilies.includes(requested)
    ? requested
    : "All";

  applyFilter(startFamily);
}
