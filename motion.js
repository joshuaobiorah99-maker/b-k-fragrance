// Shared motion layer: hero facets, cursor glow, scroll reveals and product tilt.
document.addEventListener("DOMContentLoaded", () => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Floating faceted gems behind the hero (home page only).
  const hero = document.querySelector(".hero");
  if (hero && !reduceMotion) {
    hero.insertAdjacentHTML(
      "afterbegin",
      '<div class="facets" aria-hidden="true"><span></span><span></span><span></span><span></span></div>'
    );

    // Gold spotlight that follows the cursor across the hero.
    hero.addEventListener("pointermove", (e) => {
      const r = hero.getBoundingClientRect();
      hero.style.setProperty("--mx", `${e.clientX - r.left}px`);
      hero.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  }

  // Selectors that fade and rise into view on scroll.
  const revealTargets = [
    ".page-intro h1",
    ".page-intro p",
    ".featured h2",
    ".center-link",
    ".about-statement .lead",
    ".process-card",
    ".family-card",
    ".steps li",
    ".split-copy > *",
    ".quote-band blockquote",
    ".footer-brand",
    ".footer-col",
    ".contact-aside > *",
    ".form-step",
    ".summary",
    ".submit-btn",
    ".field",
    ".product-card"
  ];

  function revealAll(root = document) {
    revealTargets.forEach((selector) => {
      root.querySelectorAll(selector).forEach((el, i) => {
        if (el.classList.contains("reveal")) return;
        el.classList.add("reveal");
        el.style.setProperty("--d", `${Math.min(i, 6) * 0.08}s`);
        if (reduceMotion || !("IntersectionObserver" in window)) {
          el.classList.add("in");
        } else {
          observer.observe(el);
        }
      });
    });
  }

  const observer =
    "IntersectionObserver" in window
      ? new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add("in");
                observer.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.15 }
        )
      : null;

  revealAll();

  // Cards rendered later (e.g. when filtering) animate in too.
  document.addEventListener("products:rendered", () => {
    document.querySelectorAll(".product-card").forEach((el, i) => {
      el.classList.remove("reveal", "in");
      el.style.setProperty("--d", `${Math.min(i, 6) * 0.06}s`);
      void el.offsetWidth; // restart the transition
      el.classList.add("reveal");
      requestAnimationFrame(() => el.classList.add("in"));
    });
  });

  // 3D tilt and light sheen on product cards (desktop pointers only).
  if (!reduceMotion && window.matchMedia("(hover: hover)").matches) {
    document.addEventListener("mousemove", (e) => {
      const card = e.target.closest(".product-card");
      if (!card) return;
      const r = card.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      card.style.setProperty("--rx", `${(y / r.height - 0.5) * -10}deg`);
      card.style.setProperty("--ry", `${(x / r.width - 0.5) * 10}deg`);
      card.style.setProperty("--gx", `${x}px`);
      card.style.setProperty("--gy", `${y}px`);
    });

    document.addEventListener("mouseout", (e) => {
      const card = e.target.closest(".product-card");
      if (card && !card.contains(e.relatedTarget)) {
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
      }
    });
  }
});