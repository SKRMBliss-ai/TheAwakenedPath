/**
 * A tiny Web-Audio sound engine — pleasant, synthesized tones layered into
 * small chords, sparkles and sweeps. No audio files, so nothing to license
 * and nothing to download. Respects a per-device mute toggle and never
 * throws if audio isn't available (SSR, autoplay policy, etc.).
 */

let ctx: AudioContext | null = null;
function ac(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!ctx) ctx = new Ctor();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  } catch { return null; }
}

const KEY = 'sfx-muted';
export function isMuted(): boolean {
  try { return localStorage.getItem(KEY) === '1'; } catch { return false; }
}
export function setMuted(m: boolean) {
  try { localStorage.setItem(KEY, m ? '1' : '0'); } catch { /* ignore */ }
}

/** One soft note, optionally routed through a lowpass for warmth. */
function note(freq: number, start: number, dur: number, gain = 0.14, type: OscillatorType = 'sine', lp?: number) {
  const a = ac(); if (!a) return;
  const t = a.currentTime + start;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.014);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  let last: AudioNode = osc;
  if (lp) {
    const f = a.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = lp;
    osc.connect(f);
    last = f;
  }
  last.connect(g);
  g.connect(a.destination);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

/** A note doubled with a slightly detuned partner, for a warmer "choir" feel. */
function warmNote(freq: number, start: number, dur: number, gain = 0.1) {
  note(freq, start, dur, gain, 'sine');
  note(freq * 1.004, start, dur, gain * 0.7, 'sine');
  note(freq * 0.5, start, dur * 0.9, gain * 0.35, 'triangle', 1200);
}

/** Short filtered-noise sweep — a soft "whoosh" for screen/scene transitions. */
function whooshBurst(start: number, dur: number, rising: boolean, gain = 0.09) {
  const a = ac(); if (!a) return;
  const t = a.currentTime + start;
  const len = Math.max(1, Math.floor(a.sampleRate * dur));
  const buf = a.createBuffer(1, len, a.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  const src = a.createBufferSource();
  src.buffer = buf;
  const f = a.createBiquadFilter();
  f.type = 'bandpass';
  f.Q.value = 0.9;
  f.frequency.setValueAtTime(rising ? 300 : 2600, t);
  f.frequency.exponentialRampToValueAtTime(rising ? 2600 : 300, t + dur);
  const g = a.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + dur * 0.35);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f); f.connect(g); g.connect(a.destination);
  src.start(t); src.stop(t + dur + 0.05);
}

function play(fn: () => void) { if (!isMuted()) fn(); }

// Notes (Hz) — a couple of octaves of a pentatonic-friendly scale.
const N = {
  C4: 261.63, D4: 293.66, E4: 329.63, G4: 392, A4: 440,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880, B5: 987.77,
  C6: 1046.5, D6: 1174.66, E6: 1318.51, G6: 1567.98,
};

export const sfx = {
  /** A light tap for chips/toggles. */
  tap: () => play(() => note(N.E5, 0, 0.09, 0.08, 'triangle')),
  /** A soft pop / flip, for opening a room or flipping a card. */
  flip: () => play(() => { note(N.G5, 0, 0.07, 0.06, 'sine'); note(N.C6, 0.04, 0.09, 0.05, 'sine'); }),
  /** A happy little success — rising third. */
  success: () => play(() => { note(N.C5, 0, 0.12); note(N.E5, 0.09, 0.12); note(N.G5, 0.18, 0.18); }),
  /** A bigger celebration arpeggio with a sparkle tail — course/room complete. */
  celebrate: () => play(() => {
    [N.C5, N.E5, N.G5, N.C6, N.E5, N.G5].forEach((f, i) => note(f, i * 0.08, 0.2, 0.13, 'triangle'));
    note(N.C6, 0.5, 0.6, 0.09, 'sine');
    [N.G6, N.E6, N.C6].forEach((f, i) => note(f, 0.55 + i * 0.05, 0.35, 0.05, 'sine', 4000));
  }),
  /** Level up — brighter, longer, with a shimmering top layer. */
  levelup: () => play(() => {
    [N.C5, N.D5, N.E5, N.F5, N.G5, N.A5, N.B5, N.C6].forEach((f, i) => note(f, i * 0.06, 0.22, 0.12, 'triangle'));
    [N.C6, N.E6, N.G6].forEach((f, i) => note(f, 0.5 + i * 0.06, 0.4, 0.06, 'sine', 5000));
  }),
  /** A gentle warm chime for the adult side — calm, unobtrusive. */
  chime: () => play(() => { warmNote(N.A4, 0, 0.9, 0.07); warmNote(N.E5, 0.03, 1.1, 0.055); }),
  /** A slow, spacious swell for entering the cosmic meditation player. */
  swell: () => play(() => {
    warmNote(N.C4, 0, 2.4, 0.05);
    warmNote(N.G4, 0.15, 2.2, 0.045);
    warmNote(N.E5, 0.35, 1.9, 0.035);
    whooshBurst(0, 1.6, true, 0.05);
  }),
  /** A sparkling high-register twinkle — for stars / cosmic accents, saves. */
  twinkle: () => play(() => {
    [N.C6, N.E6, N.G6, N.D6].forEach((f, i) => note(f + (Math.random() * 6 - 3), i * 0.05 + Math.random() * 0.02, 0.35, 0.045, 'sine', 6000));
  }),
  /** A bright, harmonic-rich bell — kids' "yes! correct / lovely" moment. */
  bell: () => play(() => {
    note(N.G5, 0, 0.7, 0.12, 'triangle');
    note(N.G5 * 2, 0, 0.5, 0.05, 'sine');
    note(N.G5 * 3, 0, 0.35, 0.025, 'sine');
    note(N.C6, 0.1, 0.6, 0.07, 'sine');
  }),
  /** Soft whoosh for moving between screens / steps. */
  whoosh: () => play(() => whooshBurst(0, 0.5, true, 0.07)),
};
