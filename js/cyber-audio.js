/**
 * Cybernetic Web Audio API Synthesizer
 * Generates futuristic sci-fi sound effects in real-time.
 * Zero external audio assets, zero latency, lightweight, muted by default.
 */
(() => {
  let audioCtx = null;
  let isMuted = true;

  // Check saved audio preference (defaults to muted)
  try {
    const saved = localStorage.getItem("cyber-audio-enabled");
    if (saved === "true") {
      isMuted = false;
    }
  } catch (e) {
    // localStorage unavailable
  }

  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playTone(freqStart, freqEnd, type, duration, gainMax) {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type || "sine";
      const now = ctx.currentTime;

      osc.frequency.setValueAtTime(freqStart, now);
      if (freqEnd && freqEnd !== freqStart) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(freqEnd, 10), now + duration);
      }

      gain.gain.setValueAtTime(gainMax || 0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch (err) {
      // Audio context error or blocked
    }
  }

  const CyberAudio = {
    isMuted() {
      return isMuted;
    },
    toggleMute() {
      isMuted = !isMuted;
      try {
        localStorage.setItem("cyber-audio-enabled", !isMuted);
      } catch (e) {}

      if (!isMuted) {
        // Unlock audio context immediately
        getAudioContext();
        this.playModeToggle();
      }
      return isMuted;
    },
    playHover() {
      playTone(1100, 1600, "sine", 0.04, 0.018);
    },
    playClick() {
      playTone(650, 240, "triangle", 0.08, 0.04);
    },
    playGlitch() {
      playTone(280, 780, "sawtooth", 0.06, 0.02);
    },
    playModeToggle() {
      if (isMuted) return;
      playTone(520, 880, "sine", 0.12, 0.04);
      setTimeout(() => {
        playTone(880, 1320, "sine", 0.14, 0.04);
      }, 70);
    }
  };

  window.CyberAudio = CyberAudio;
})();
