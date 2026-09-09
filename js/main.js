// Footer year
document.getElementById("year").textContent = new Date().getFullYear();

// Top scroll-progress bar
const scrollProgressEl = document.getElementById("scrollProgress");
if (scrollProgressEl) {
  const updateScrollProgress = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;
    scrollProgressEl.style.width = pct + "%";
  };
  window.addEventListener("scroll", updateScrollProgress, { passive: true });
  window.addEventListener("resize", updateScrollProgress, { passive: true });
  updateScrollProgress();
}

// Contact form -> opens the visitor's own email client with the message
// pre-filled (no backend on GitHub Pages, so nothing is sent from here).
const contactForm = document.getElementById("contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = contactForm.name.value.trim();
    const email = contactForm.email.value.trim();
    const message = contactForm.message.value.trim();

    const subject = `Portfolio message from ${name || "your site"}`;
    const body = `${message}\n\n— ${name}${email ? ` (${email})` : ""}`;
    const mailto = `mailto:sgwizarobert@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.location.href = mailto;
  });
}

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

// Fade-in on scroll, staggered within each container
const groups = document.querySelectorAll(".skills-grid, .projects-grid, .contact-grid, .timeline");
groups.forEach((group) => {
  Array.from(group.children).forEach((child, i) => {
    child.style.transitionDelay = `${Math.min(i, 6) * 60}ms`;
  });
});

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

// 3D tilt + cursor spotlight on glass cards (skipped for touch devices and reduced-motion users)
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isTouch = window.matchMedia("(hover: none)").matches;

if (!prefersReducedMotion && !isTouch) {
  document.querySelectorAll(".tilt").forEach((card) => {
    const maxTilt = 8; // degrees

    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width; // 0..1
      const py = (e.clientY - rect.top) / rect.height;
      const rotateY = (px - 0.5) * maxTilt * 2;
      const rotateX = (0.5 - py) * maxTilt * 2;
      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
      card.style.setProperty("--mx", `${px * 100}%`);
      card.style.setProperty("--my", `${py * 100}%`);
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "perspective(800px) rotateX(0) rotateY(0) translateY(0)";
    });
  });
}
