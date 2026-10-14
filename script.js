const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

const reveals = document.querySelectorAll(".reveal");
if (!prefersReducedMotion && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.style.transition = "opacity 700ms ease, transform 700ms ease";
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12 }
  );
  reveals.forEach((node) => observer.observe(node));
} else {
  reveals.forEach((node) => {
    node.style.opacity = "1";
    node.style.transform = "none";
  });
}

const stats = document.querySelectorAll(".stat-value[data-count]");
if (!prefersReducedMotion && stats.length && "IntersectionObserver" in window) {
  const countObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = Number(el.dataset.count);
        const suffix = el.dataset.suffix || "";
        const start = performance.now();
        const duration = 900;
        const tick = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const value = Math.round(target * (1 - Math.pow(1 - progress, 3)));
          el.textContent = `${value}${suffix}`;
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        countObserver.unobserve(el);
      });
    },
    { threshold: 0.6 }
  );
  stats.forEach((el) => countObserver.observe(el));
}

const nav = document.getElementById("primary-nav");
const navToggle = document.querySelector(".nav-toggle");

function setNavOpen(open) {
  if (!nav || !navToggle) return;
  nav.classList.toggle("is-open", open);
  navToggle.setAttribute("aria-expanded", String(open));
  navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
}

if (nav && navToggle) {
  navToggle.addEventListener("click", () => setNavOpen(!nav.classList.contains("is-open")));
  nav.addEventListener("click", (event) => {
    if (event.target?.closest?.('a[href^="#"]')) setNavOpen(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setNavOpen(false);
  });
  document.addEventListener("click", (event) => {
    if (!nav.classList.contains("is-open")) return;
    const target = event.target;
    if (target instanceof Node && (nav.contains(target) || navToggle.contains(target))) return;
    setNavOpen(false);
  });
}

const header = document.querySelector(".topbar");
const headerOffset = () => (header ? header.getBoundingClientRect().height + 8 : 8);

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const id = link.getAttribute("href");
    if (!id || id === "#") return;
    const target = document.querySelector(id);
    if (!target) return;
    event.preventDefault();
    const top = window.scrollY + target.getBoundingClientRect().top - headerOffset();
    window.scrollTo({ top, behavior: prefersReducedMotion ? "auto" : "smooth" });
    history.replaceState(null, "", id);
  });
});

const navLinks = nav ? Array.from(nav.querySelectorAll('a[href^="#"]')) : [];
const sectionById = new Map();
navLinks.forEach((link) => {
  const id = link.getAttribute("href");
  const section = id ? document.querySelector(id) : null;
  if (section) sectionById.set(id, section);
});

function setActiveLink(hash) {
  navLinks.forEach((link) => {
    if (link.getAttribute("href") === hash) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
}

setActiveLink(sectionById.has(window.location.hash) ? window.location.hash : "#home");

if ("IntersectionObserver" in window && sectionById.size) {
  const activeObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const hash = `#${visible.target.id}`;
      if (sectionById.has(hash)) setActiveLink(hash);
    },
    { rootMargin: "-30% 0px -55% 0px", threshold: [0.15, 0.35, 0.6] }
  );
  sectionById.forEach((section) => activeObserver.observe(section));
}

const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = String(new Date().getFullYear());
