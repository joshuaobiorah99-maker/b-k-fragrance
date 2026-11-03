const products = [
  {
    name: "B&K Noir",
    family: "Woody",
    top: "Black Pepper",
    heart: "Oud",
    base: "Amber",
    size: "100ml",
    price: "₦45,000",
    image: "noir.png"
  },
  {
    name: "B&K Golden Hour",
    family: "Floral",
    top: "Bergamot",
    heart: "Jasmine",
    base: "Vanilla",
    size: "100ml",
    price: "₦38,000",
    image: "golden-hour.png"
  },
  {
    name: "B&K Midnight Rose",
    family: "Floral",
    top: "Rose",
    heart: "Musk",
    base: "Sandalwood",
    size: "100ml",
    price: "₦42,000",
    image: "midnight-rose.png"
  },
  {
    name: "B&K Ocean Breeze",
    family: "Fresh",
    top: "Citrus",
    heart: "Sea Salt",
    base: "Cedar",
    size: "100ml",
    price: "₦35,000",
    image: "ocean-breeze.png"
  }
];

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

function cardHTML(p) {
  const visual = p.image
    ? `<img class="product-photo" src="${p.image}" alt="${p.name} perfume bottle">`
    : bottleHTML();

  return `
    <div class="product-card">
      <span class="family-tag">${p.family}</span>
      ${visual}
      <h3>${p.name}</h3>
      <p class="size">${p.size}</p>
      <div class="pyramid">
        <div><small>Top</small>${p.top}</div>
        <div><small>Heart</small>${p.heart}</div>
        <div><small>Base</small>${p.base}</div>
      </div>
      <p class="price">${p.price}</p>
      <button>Add to cart</button>
    </div>
  `;
}

function renderProducts(gridId, list) {
  const grid = document.getElementById(gridId);
  if (!grid) return;
  grid.innerHTML = list.map(cardHTML).join("");

  // If a photo is missing, show the drawn bottle in its place.
  grid.querySelectorAll("img.product-photo").forEach((img) => {
    img.addEventListener("error", () => {
      const holder = document.createElement("div");
      holder.innerHTML = bottleHTML().trim();
      img.replaceWith(holder.firstElementChild);
    });
  });
}

// Home page: first two scents as featured.
renderProducts("featuredGrid", products.slice(0, 2));

// Collection page: full list with filters, optionally preset from ?family=
const collectionGrid = document.getElementById("productGrid");
if (collectionGrid) {
  const filterButtons = document.querySelectorAll(".filter-btn");
  const params = new URLSearchParams(window.location.search);
  const requested = params.get("family");

  function applyFilter(family) {
    const list = family === "All" ? products : products.filter((p) => p.family === family);
    renderProducts("productGrid", list);

    filterButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.filter === family);
    });

    document.dispatchEvent(new CustomEvent("products:rendered"));
  }

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => applyFilter(btn.dataset.filter));
  });

  const startFamily = ["Woody", "Floral", "Fresh"].includes(requested) ? requested : "All";
  applyFilter(startFamily);
}