const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

// Intersection reveal (kept subtle + disabled for reduced-motion)
const sections = document.querySelectorAll(".section");
if (!prefersReducedMotion && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12 }
  );

  sections.forEach((section) => {
    section.style.opacity = "0";
    section.style.transform = "translateY(18px)";
    section.style.transition = "opacity 600ms ease, transform 600ms ease";
    observer.observe(section);
  });
}

// Smooth scroll with sticky header offset
const header = document.querySelector(".topbar");
const headerOffset = () => (header ? header.getBoundingClientRect().height + 10 : 10);

document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    if (!id || id === "#") return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const top = window.scrollY + target.getBoundingClientRect().top - headerOffset();
    window.scrollTo({ top, behavior: prefersReducedMotion ? "auto" : "smooth" });
    history.replaceState(null, "", id);
  });
});

// Footer year
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = String(new Date().getFullYear());
