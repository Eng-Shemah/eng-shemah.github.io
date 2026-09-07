// Footer year
document.getElementById("year").textContent = new Date().getFullYear();

// Mobile nav toggle
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");
navToggle.addEventListener("click", () => {
  navLinks.classList.toggle("open");
});
navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => navLinks.classList.remove("open"));
});

// Theme toggle (persisted per-browser via localStorage)
const root = document.documentElement;
const themeToggle = document.getElementById("themeToggle");
const iconMoon = document.getElementById("themeIconMoon");
const iconSun = document.getElementById("themeIconSun");

function applyTheme(theme) {
  root.setAttribute("data-theme", theme);
  iconMoon.style.display = theme === "dark" ? "none" : "block";
  iconSun.style.display = theme === "dark" ? "block" : "none";
}

let stored = null;
try {
  stored = localStorage.getItem("bb-portfolio-theme");
} catch {
  // localStorage unavailable (private browsing, etc.) — fall back to system preference
}
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
applyTheme(stored || (prefersDark ? "dark" : "light"));

themeToggle.addEventListener("click", () => {
  const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
  applyTheme(next);
  try {
    localStorage.setItem("bb-portfolio-theme", next);
  } catch {
    // ignore write failures
  }
});

// Fade-in on scroll
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1 }
);
document.querySelectorAll(".fade-in").forEach((el) => observer.observe(el));

// Highlight active nav link while scrolling
const sections = document.querySelectorAll("main section[id]");
const navAnchors = document.querySelectorAll(".nav-links a");
const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navAnchors.forEach((a) => {
          a.style.color = a.getAttribute("href") === `#${entry.target.id}` ? "var(--accent)" : "";
        });
      }
    });
  },
  { rootMargin: "-40% 0px -55% 0px" }
);
sections.forEach((s) => sectionObserver.observe(s));
