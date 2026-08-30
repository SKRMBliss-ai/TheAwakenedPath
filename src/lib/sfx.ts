/**
 * Tiny Web-Audio sound engine — pleasant, synthesized chimes. No audio files, so
 * nothing to license and nothing to download. Respects a per-device mute toggle
 * and never throws if audio isn't available (SSR, autoplay policy, etc.).
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

/** One soft note. */
function note(freq: number, start: number, dur: number, gain = 0.14, type: OscillatorType = 'sine') {
  const a = ac(); if (!a) return;
  const t = a.currentTime + start;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g); g.connect(a.destination);
  osc.start(t); osc.stop(t + dur + 0.02);
}

function play(fn: () => void) { if (!isMuted()) fn(); }

// Notes (Hz)
const N = { C5: 523.25, E5: 659.25, G5: 783.99, C6: 1046.5, A5: 880, D5: 587.33, F5: 698.46, B5: 987.77 };

export const sfx = {
  /** A light tap for chips/toggles. */
  tap: () => play(() => note(N.E5, 0, 0.09, 0.08, 'triangle')),
  /** A soft pop / flip. */
  flip: () => play(() => { note(N.G5, 0, 0.07, 0.06, 'sine'); note(N.C6, 0.04, 0.09, 0.05, 'sine'); }),
  /** A happy little success — rising third. */
  success: () => play(() => { note(N.C5, 0, 0.12); note(N.E5, 0.09, 0.12); note(N.G5, 0.18, 0.18); }),
  /** A bigger celebration arpeggio. */
  celebrate: () => play(() => {
    [N.C5, N.E5, N.G5, N.C6, N.E5, N.G5].forEach((f, i) => note(f, i * 0.08, 0.2, 0.13, 'triangle'));
    note(N.C6, 0.5, 0.5, 0.1, 'sine');
  }),
  /** Level up — brighter and longer. */
  levelup: () => play(() => {
    [N.C5, N.D5, N.E5, N.F5, N.G5, N.A5, N.B5, N.C6].forEach((f, i) => note(f, i * 0.06, 0.22, 0.12, 'triangle'));
  }),
  /** A gentle chime for the adult side — calm, unobtrusive. */
  chime: () => play(() => { note(N.A5, 0, 0.5, 0.06, 'sine'); note(N.E5, 0.02, 0.7, 0.05, 'sine'); }),
};
