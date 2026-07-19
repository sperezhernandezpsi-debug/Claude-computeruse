// Sonidos generados con Web Audio API — sin archivos externos.
const SoundFX = (() => {
  let ctx = null;
  let muted = false;

  function getCtx() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, start, duration, type = 'sine', gain = 0.18) {
    if (muted) return;
    try {
      const c = getCtx();
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      g.gain.value = gain;
      osc.connect(g);
      g.connect(c.destination);
      const t0 = c.currentTime + start;
      g.gain.setValueAtTime(gain, t0);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
      osc.start(t0);
      osc.stop(t0 + duration + 0.02);
    } catch (e) { /* audio not available, ignore */ }
  }

  return {
    setMuted(v) { muted = v; },
    isMuted() { return muted; },
    playCorrect() {
      tone(523.25, 0, 0.12, 'triangle');
      tone(659.25, 0.1, 0.12, 'triangle');
      tone(783.99, 0.2, 0.18, 'triangle');
    },
    playWrong() {
      tone(220, 0, 0.18, 'sawtooth', 0.12);
      tone(180, 0.12, 0.22, 'sawtooth', 0.12);
    },
    playFanfare() {
      const notes = [523.25, 587.33, 659.25, 783.99, 987.77];
      notes.forEach((f, i) => tone(f, i * 0.11, 0.22, 'triangle'));
    },
    playClick() {
      tone(400, 0, 0.06, 'square', 0.08);
    },
    playTap() {
      tone(300, 0, 0.05, 'sine', 0.1);
    }
  };
})();
