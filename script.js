const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

// Intersection reveal (kept subtle + disabled for reduced-motion)
const sections = document.querySelectorAll(".section:not(.hero)");
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

// Mobile nav toggle + close handlers
const nav = document.getElementById("primary-nav");
const navToggle = document.querySelector(".nav-toggle");

function setNavOpen(open) {
  if (!nav || !navToggle) return;
  nav.classList.toggle("is-open", open);
  navToggle.setAttribute("aria-expanded", String(open));
  navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
}

if (nav && navToggle) {
  navToggle.addEventListener("click", () => {
    const open = !nav.classList.contains("is-open");
    setNavOpen(open);
  });

  nav.addEventListener("click", (e) => {
    const a = e.target?.closest?.('a[href^="#"]');
    if (!a) return;
    setNavOpen(false);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    setNavOpen(false);
  });

  document.addEventListener("click", (e) => {
    if (!nav.classList.contains("is-open")) return;
    const target = e.target;
    if (target instanceof Node && (nav.contains(target) || navToggle.contains(target))) return;
    setNavOpen(false);
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

// Active nav highlighting
const navLinks = nav ? Array.from(nav.querySelectorAll('a[href^="#"]')) : [];
const sectionById = new Map();
navLinks.forEach((a) => {
  const id = a.getAttribute("href");
  if (!id || id === "#") return;
  const section = document.querySelector(id);
  if (section) sectionById.set(id, section);
});

function setActiveLink(hash) {
  navLinks.forEach((a) => {
    const isActive = a.getAttribute("href") === hash;
    if (isActive) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
}

const initialHash = window.location.hash && sectionById.has(window.location.hash) ? window.location.hash : "#home";
setActiveLink(initialHash);

if ("IntersectionObserver" in window && sectionById.size) {
  const activeObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const hash = `#${visible.target.id}`;
      if (sectionById.has(hash)) setActiveLink(hash);
    },
    { rootMargin: "-30% 0px -60% 0px", threshold: [0.1, 0.2, 0.35, 0.5, 0.65] }
  );

  sectionById.forEach((section) => activeObserver.observe(section));
}

// Footer year
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = String(new Date().getFullYear());
