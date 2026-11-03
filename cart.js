(function () {
  const KEY = "bk-cart";
  // Replace with your WhatsApp number: country code first, no + or spaces. Example: 2348012345678
  const WHATSAPP_NUMBER = "+2347070332678";

  let items = loadCart();

  function loadCart() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveCart() {
    localStorage.setItem(KEY, JSON.stringify(items));
  }

  function parsePrice(text) {
    return Number(String(text).replace(/[^\d]/g, "")) || 0;
  }

  function formatNaira(n) {
    return "₦" + n.toLocaleString("en-US");
  }

  function cartTotal() {
    return items.reduce((sum, i) => sum + i.price * i.qty, 0);
  }

  function cartCount() {
    return items.reduce((sum, i) => sum + i.qty, 0);
  }

  // Build the cart button in the header
  const header = document.querySelector(".site-header");
  const nav = header ? header.querySelector("nav") : null;

  const cartBtn = document.createElement("button");
  cartBtn.className = "cart-toggle";
  cartBtn.setAttribute("aria-label", "Open cart");
  cartBtn.innerHTML = 'Cart <span class="cart-count">0</span>';
  if (nav) nav.appendChild(cartBtn);

  // Build the cart panel and overlay
  const overlay = document.createElement("div");
  overlay.className = "cart-overlay";

  const drawer = document.createElement("aside");
  drawer.className = "cart-drawer";
  drawer.setAttribute("aria-label", "Shopping cart");
  drawer.innerHTML = `
    <div class="cart-head">
      <h3>Your cart</h3>
      <button class="cart-close" aria-label="Close cart">&times;</button>
    </div>
    <div class="cart-lines"></div>
    <div class="cart-foot">
      <p class="cart-total"></p>
      <a class="cart-checkout" href="#" target="_blank" rel="noopener">Order on WhatsApp</a>
    </div>
  `;

  const toast = document.createElement("div");
  toast.className = "cart-toast";

  document.body.append(overlay, drawer, toast);

  const linesEl = drawer.querySelector(".cart-lines");
  const totalEl = drawer.querySelector(".cart-total");
  const checkoutEl = drawer.querySelector(".cart-checkout");

  function render() {
    document.querySelectorAll(".cart-count").forEach((el) => {
      el.textContent = cartCount();
    });

    linesEl.innerHTML = "";

    if (items.length === 0) {
      const empty = document.createElement("p");
      empty.className = "cart-empty";
      empty.textContent = "Your cart is empty. Add a fragrance to get started.";
      linesEl.appendChild(empty);
      totalEl.textContent = "";
      checkoutEl.classList.add("disabled");
      checkoutEl.setAttribute("href", "#");
      return;
    }

    items.forEach((item) => {
      const row = document.createElement("div");
      row.className = "cart-line";
      row.innerHTML = `
        <div class="cart-line-info">
          <strong></strong>
          <span>${formatNaira(item.price)}</span>
        </div>
        <div class="cart-qty">
          <button data-action="dec" data-name="">−</button>
          <span>${item.qty}</span>
          <button data-action="inc" data-name="">+</button>
        </div>
        <button class="cart-remove" data-action="remove" data-name="">Remove</button>
      `;
      row.querySelector("strong").textContent = item.name;
      row.querySelectorAll("button").forEach((b) => (b.dataset.name = item.name));
      linesEl.appendChild(row);
    });

    totalEl.textContent = `Total: ${formatNaira(cartTotal())}`;

    checkoutEl.classList.remove("disabled");
    checkoutEl.setAttribute("href", buildWhatsAppLink());
  }

  function buildWhatsAppLink() {
    const lines = items.map(
      (i) => `- ${i.name} x${i.qty} (${formatNaira(i.price)} each)`
    );
    const message = [
      "Hello B&K Fragrance, I would like to order:",
      ...lines,
      `Total: ${formatNaira(cartTotal())}`
    ].join("\n");
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  }

  function openCart() {
    drawer.classList.add("open");
    overlay.classList.add("open");
  }

  function closeCart() {
    drawer.classList.remove("open");
    overlay.classList.remove("open");
  }

  function showToast(text) {
    toast.textContent = text;
    toast.classList.add("show");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove("show"), 2000);
  }

    // Add to cart buttons on product cards
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".product-card button");
    if (!btn) return;

    const card = btn.closest(".product-card");
    const name = card.querySelector("h3").textContent.trim();
    const price = parsePrice(card.querySelector(".price").textContent);

    const existing = items.find((i) => i.name === name);
    if (existing) {
      existing.qty += 1;
    } else {
      items.push({ name, price, qty: 1 });
    }

    saveCart();
    render();
    showToast(`${name} added to your cart`);

    // Pulse the Cart button and its count
    cartBtn.classList.remove("pulse");
    void cartBtn.offsetWidth; // restart the animation
    cartBtn.classList.add("pulse");
  });

  // Quantity and remove buttons inside the cart panel
  linesEl.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;

    const item = items.find((i) => i.name === btn.dataset.name);
    if (!item) return;

    if (btn.dataset.action === "inc") item.qty += 1;
    if (btn.dataset.action === "dec") item.qty -= 1;
    if (btn.dataset.action === "remove" || item.qty <= 0) {
      items = items.filter((i) => i !== item);
    }

    saveCart();
    render();
  });

  checkoutEl.addEventListener("click", (e) => {
    if (items.length === 0) e.preventDefault();
  });

  cartBtn.addEventListener("click", openCart);
  drawer.querySelector(".cart-close").addEventListener("click", closeCart);
  overlay.addEventListener("click", closeCart);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeCart();
  });

  render();
})();