/**
 * Gwiza Robert SHEMA — Futuristic Portfolio Main Controller
 * Handles Theme, Audio FX, 3D Tilt, Cyber Typewriter, Project Filtering.
 */

// Footer year
const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

// -------------------------------------------------------------
// 1. CONTACT FORM (Mailto handler)
// -------------------------------------------------------------
const contactForm = document.getElementById("contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (window.CyberAudio) window.CyberAudio.playClick();
    const name = contactForm.name.value.trim();
    const email = contactForm.email.value.trim();
    const message = contactForm.message.value.trim();

    const subject = `Portfolio message from ${name || "your site"}`;
    const body = `${message}\n\n— ${name}${email ? ` (${email})` : ""}`;
    const mailto = `mailto:sgwizarobert@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.location.href = mailto;
  });
}

// -------------------------------------------------------------
// 3. MOBILE NAV TOGGLE
// -------------------------------------------------------------
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");
if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    if (window.CyberAudio) window.CyberAudio.playClick();
    navLinks.classList.toggle("open");
  });
  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => navLinks.classList.remove("open"));
  });
}

// -------------------------------------------------------------
// 4. THEME TOGGLE (Dark / Light + Three.js Sync)
// -------------------------------------------------------------
const root = document.documentElement;
const themeToggle = document.getElementById("themeToggle");
const iconMoon = document.getElementById("themeIconMoon");
const iconSun = document.getElementById("themeIconSun");

function applyTheme(theme) {
  root.setAttribute("data-theme", theme);
  if (iconMoon) iconMoon.style.display = theme === "dark" ? "none" : "block";
  if (iconSun) iconSun.style.display = theme === "dark" ? "block" : "none";

  // Notify Three.js scene of theme change
  if (window.updateThreeTheme) {
    window.updateThreeTheme(theme);
  }
}

let storedTheme = null;
try {
  storedTheme = localStorage.getItem("bb-portfolio-theme");
} catch (e) {}

const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
applyTheme(storedTheme || (prefersDark ? "dark" : "light"));

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
    if (window.CyberAudio) window.CyberAudio.playModeToggle();
    try {
      localStorage.setItem("bb-portfolio-theme", next);
    } catch (e) {}
  });
}

// -------------------------------------------------------------
// 5. CYBER AUDIO CONTROLLER & SFX HOOKS
// -------------------------------------------------------------
const audioToggle = document.getElementById("audioToggle");
const audioIconMuted = document.getElementById("audioIconMuted");
const audioIconActive = document.getElementById("audioIconActive");

function syncAudioUI() {
  if (!window.CyberAudio || !audioToggle) return;
  const muted = window.CyberAudio.isMuted();
  if (audioIconMuted) audioIconMuted.style.display = muted ? "block" : "none";
  if (audioIconActive) audioIconActive.style.display = muted ? "none" : "block";
  audioToggle.classList.toggle("audio-active", !muted);
  audioToggle.setAttribute(
    "title",
    muted ? "Enable Sci-Fi Audio SFX" : "Mute Sci-Fi Audio SFX"
  );
}

if (audioToggle) {
  syncAudioUI();
  audioToggle.addEventListener("click", () => {
    if (window.CyberAudio) {
      window.CyberAudio.toggleMute();
      syncAudioUI();
    }
  });
}

// Attach subtle hover & click sounds to interactive items
function attachSoundEffects() {
  const clickables = document.querySelectorAll(
    "a, button, .btn, .filter-btn, .project-card, .skill-card, .contact-card"
  );
  clickables.forEach((el) => {
    el.addEventListener(
      "mouseenter",
      () => {
        if (window.CyberAudio) window.CyberAudio.playHover();
      },
      { passive: true }
    );
    el.addEventListener(
      "click",
      () => {
        if (window.CyberAudio) window.CyberAudio.playClick();
      },
      { passive: true }
    );
  });
}
attachSoundEffects();

// -------------------------------------------------------------
// 6. CYBER TYPEWRITER & ROLE DECODER
// -------------------------------------------------------------
const typewriterEl = document.getElementById("typewriterRole");
if (typewriterEl) {
  const roles = [
    "Flutter & Mobile Developer",
    "Full-Stack Web Architect",
    "Oracle PL/SQL & Data Systems",
    "Software QA & Security Enthusiast"
  ];
  const glitchChars = "!<>-_\\/[]{}—=+*^?#________";
  let roleIndex = 0;
  let isDeleting = false;
  let currentText = "";
  let charIndex = 0;

  function typeEffect() {
    const fullText = roles[roleIndex];

    if (!isDeleting) {
      // Typing forward with occasional cyber glitch char
      currentText = fullText.substring(0, charIndex + 1);
      charIndex++;

      // Decode flash
      if (charIndex < fullText.length && Math.random() < 0.25) {
        const randomChar = glitchChars[Math.floor(Math.random() * glitchChars.length)];
        typewriterEl.textContent = currentText.slice(0, -1) + randomChar;
      } else {
        typewriterEl.textContent = currentText;
      }

      if (charIndex === fullText.length) {
        // Pause at full word
        isDeleting = true;
        setTimeout(typeEffect, 2400);
        return;
      }
      setTimeout(typeEffect, 60 + Math.random() * 40);
    } else {
      // Deleting backwards
      currentText = fullText.substring(0, charIndex - 1);
      charIndex--;
      typewriterEl.textContent = currentText;

      if (charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        setTimeout(typeEffect, 400);
        return;
      }
      setTimeout(typeEffect, 30);
    }
  }

  typeEffect();
}

// -------------------------------------------------------------
// 7. PROJECT CATEGORY FILTER ENGINE
// -------------------------------------------------------------
const filterContainer = document.getElementById("projectFilters");
if (filterContainer) {
  const filterBtns = filterContainer.querySelectorAll(".filter-btn");
  const projectItems = document.querySelectorAll(
    ".projects-grid .project-card, .featured-app"
  );

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const filter = btn.getAttribute("data-filter");

      projectItems.forEach((card) => {
        const cat = card.getAttribute("data-category");
        if (filter === "all" || cat === filter) {
          card.classList.remove("filter-hidden");
        } else {
          card.classList.add("filter-hidden");
        }
      });
    });
  });
}

// -------------------------------------------------------------
// 8. FADE-IN OBSERVER ON SCROLL
// -------------------------------------------------------------
const groups = document.querySelectorAll(
  ".skills-grid, .projects-grid, .contact-grid, .timeline"
);
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

// -------------------------------------------------------------
// 9. ACTIVE NAV LINK TRACKER
// -------------------------------------------------------------
const sections = document.querySelectorAll("main section[id]");
const navAnchors = document.querySelectorAll(".nav-links a");
const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navAnchors.forEach((a) => {
          a.style.color =
            a.getAttribute("href") === `#${entry.target.id}` ? "var(--accent)" : "";
        });
      }
    });
  },
  { rootMargin: "-40% 0px -55% 0px" }
);
sections.forEach((s) => sectionObserver.observe(s));

// -------------------------------------------------------------
// 10. ADVANCED 3D TILT WITH LIGHT GLARE
// -------------------------------------------------------------
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isTouch = window.matchMedia("(hover: none)").matches;

if (!prefersReducedMotion && !isTouch) {
  document.querySelectorAll(".tilt").forEach((card) => {
    const maxTilt = 7; // degrees

    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const rotateY = (px - 0.5) * maxTilt * 2;
      const rotateX = (0.5 - py) * maxTilt * 2;

      card.style.transform = `perspective(850px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
      card.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
      card.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "perspective(850px) rotateX(0deg) rotateY(0deg) translateY(0px)";
    });
  });
}
