/**
 * Cinematic scroll-scrubbed hero: preloads a photo sequence and draws the
 * current frame to a <canvas> as the visitor scrolls, cross-fading a few
 * taglines on top. Mirrors the scroll-progress pattern already proven in
 * BloodBridge's hero (useScrollProgress + mapRange + bandOpacity/fadeOutOnly),
 * ported to plain JS for this static site.
 */
(function () {
  "use strict";

  const FRAME_COUNT = 300;
  const FRAME_PATH = (i) =>
    `assets/intro-sequence/ezgif-frame-${String(i).padStart(3, "0")}.jpg`;

  const track = document.getElementById("introTrack");
  const canvas = document.getElementById("introCanvas");
  const loadingEl = document.getElementById("introLoading");
  const loadingFill = document.getElementById("introLoadingFill");
  const loadingLabel = document.getElementById("introLoadingLabel");
  const taglineEls = document.querySelectorAll(".cinematic-taglines .tagline");
  const footerEl = document.querySelector(".cinematic-footer");
  const scrollHint = document.querySelector(".cinematic-scroll-hint");

  if (!track || !canvas) return;

  const ctx = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function mapRange(value, inMin, inMax, outMin, outMax) {
    if (inMax === inMin) return outMin;
    const t = (value - inMin) / (inMax - inMin);
    const clamped = Math.min(1, Math.max(0, t));
    return outMin + clamped * (outMax - outMin);
  }

  function bandOpacity(p, inStart, inEnd, outStart, outEnd) {
    const fadeIn = mapRange(p, inStart, inEnd, 0, 1);
    const fadeOut = 1 - mapRange(p, outStart, outEnd, 0, 1);
    return Math.min(fadeIn, fadeOut);
  }

  // First-visible content must start fully opaque and only fade out later,
  // or the page opens blank before any scrolling happens.
  function fadeOutOnly(p, outStart, outEnd) {
    return 1 - mapRange(p, outStart, outEnd, 0, 1);
  }

  // ---------- Frame preloading ----------
  const images = new Array(FRAME_COUNT);
  let loadedCount = 0;
  let readyEnough = false;

  function updateLoadingUI() {
    const pct = Math.round((loadedCount / FRAME_COUNT) * 100);
    if (loadingFill) loadingFill.style.width = pct + "%";
    if (loadingLabel) loadingLabel.textContent = `Loading ${pct}%`;
    if (!readyEnough && loadedCount >= Math.min(24, FRAME_COUNT)) {
      readyEnough = true;
      if (loadingEl) loadingEl.classList.add("is-hidden");
      requestAnimationFrame(render);
    }
    if (loadedCount >= FRAME_COUNT && loadingEl) {
      loadingEl.classList.add("is-hidden");
    }
  }

  function loadFrames() {
    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image();
      img.decoding = "async";
      img.onload = img.onerror = () => {
        loadedCount++;
        updateLoadingUI();
      };
      img.src = FRAME_PATH(i);
      images[i - 1] = img;
    }
  }

  // ---------- Canvas sizing (cover-fit, device-pixel aware) ----------
  let cw = 0;
  let ch = 0;

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cw = canvas.clientWidth;
    ch = canvas.clientHeight;
    canvas.width = Math.round(cw * dpr);
    canvas.height = Math.round(ch * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawCurrentFrame();
  }

  function drawImageCover(img) {
    if (!img || !img.naturalWidth) return;
    const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
    const w = img.naturalWidth * scale;
    const h = img.naturalHeight * scale;
    const x = (cw - w) / 2;
    const y = (ch - h) / 2;
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, x, y, w, h);
  }

  let currentFrameIndex = -1;

  function drawCurrentFrame() {
    const idx = Math.max(0, currentFrameIndex);
    const img = images[idx];
    if (img && img.complete && img.naturalWidth) {
      drawImageCover(img);
    } else {
      // Nearest previously-loaded frame, so the canvas is never left blank.
      for (let d = 1; d < FRAME_COUNT; d++) {
        const back = images[idx - d];
        if (back && back.complete && back.naturalWidth) {
          drawImageCover(back);
          return;
        }
      }
    }
  }

  // ---------- Scroll progress ----------
  let progress = 0;
  let ticking = false;

  function computeProgress() {
    const rect = track.getBoundingClientRect();
    const trackHeight = track.offsetHeight - window.innerHeight;
    if (trackHeight <= 0) return 0;
    return Math.min(1, Math.max(0, -rect.top / trackHeight));
  }

  function render() {
    progress = computeProgress();

    const frameIdx = Math.min(
      FRAME_COUNT - 1,
      Math.round(mapRange(progress, 0, 0.92, 0, FRAME_COUNT - 1)),
    );
    if (frameIdx !== currentFrameIndex) {
      currentFrameIndex = frameIdx;
      drawCurrentFrame();
    }

    // Taglines cross-fade in three evenly spaced bands; the first is
    // visible immediately (fadeOutOnly) so there's no blank opening frame.
    if (taglineEls.length >= 3) {
      taglineEls[0].style.opacity = fadeOutOnly(progress, 0.1, 0.2);
      taglineEls[1].style.opacity = bandOpacity(progress, 0.16, 0.26, 0.42, 0.52);
      taglineEls[2].style.opacity = bandOpacity(progress, 0.48, 0.58, 0.74, 0.84);
    }

    if (footerEl) {
      // Fades in during the last band and then holds fully visible. Only
      // becomes clickable once mostly visible, so it doesn't eat scroll/
      // pointer input over the canvas earlier in the sequence.
      const footerOpacity = mapRange(progress, 0.78, 0.94, 0, 1);
      footerEl.style.opacity = String(footerOpacity);
      footerEl.classList.toggle("is-interactive", footerOpacity > 0.6);
    }

    if (scrollHint) {
      scrollHint.style.opacity = String(fadeOutOnly(progress, 0.02, 0.1));
    }

    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(render);
    }
  }

  // ---------- Reduced motion: show a static final frame, no scrubbing ----------
  function setupReducedMotion() {
    if (loadingEl) loadingEl.classList.add("is-hidden");
    const img = new Image();
    img.onload = () => {
      currentFrameIndex = FRAME_COUNT - 1;
      images[FRAME_COUNT - 1] = img;
      drawCurrentFrame();
    };
    img.src = FRAME_PATH(FRAME_COUNT);
    taglineEls.forEach((el, i) => {
      el.style.opacity = i === 0 ? "1" : "0";
    });
    if (footerEl) {
      footerEl.style.opacity = "1";
      footerEl.classList.add("is-interactive");
    }
    if (scrollHint) scrollHint.style.display = "none";
  }

  window.addEventListener("resize", resizeCanvas, { passive: true });

  if (reduceMotion) {
    resizeCanvas();
    setupReducedMotion();
  } else {
    window.addEventListener("scroll", onScroll, { passive: true });
    resizeCanvas();
    loadFrames();
    render();
  }
})();
