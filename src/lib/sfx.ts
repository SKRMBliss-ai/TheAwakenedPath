/**
 * A small sound engine with two layers:
 *  1. Synthesized Web-Audio tones (no files, nothing to license) — used for
 *     the app's original, frequent micro-interactions so their character
 *     never changes underneath existing features.
 *  2. A handful of produced audio clips (src/assets) reserved for Practise's
 *     higher-ceremony moments — entering a meditation, a room opening, a
 *     session's finishing cheer — where a real recording reads as more
 *     "stunning" than an oscillator ever will.
 * Both respect the same per-device mute toggle and never throw if audio
 * isn't available (SSR, autoplay policy, etc.).
 */
import popUrl from '../assets/creatorshome-sharp-pop-328170.mp3';
import bubbleUrl from '../assets/soundreality-bubble-pop-424583.mp3';
import whooshUrl from '../assets/dragon-studio-whoosh-effect-405447.mp3';
import pianoSwellUrl from '../assets/alexzavesa-calm-inspiring-piano-logo-short-version-518990.mp3';
import brightNotifyUrl from '../assets/universfield-bright-notification-352449.mp3';
import cheerUrl from '../assets/driken5482-applause-cheer-236786.mp3';

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

function play(fn: () => void) { if (!isMuted()) fn(); }

/** Play a produced audio clip. A fresh element per call keeps rapid repeats
 *  (e.g. quick taps) from cutting each other off. */
function playFile(url: string, volume = 0.55) {
  if (isMuted() || typeof window === 'undefined') return;
  try {
    const a = new Audio(url);
    a.volume = volume;
    void a.play().catch(() => { /* autoplay policy — ignore */ });
  } catch { /* ignore */ }
}

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
  /** A slow, spacious swell for entering the cosmic meditation player —
   *  a real calm piano sting, layered over a soft synthesized pad. */
  swell: () => { play(() => { warmNote(N.C4, 0, 2.4, 0.04); warmNote(N.G4, 0.15, 2.2, 0.035); }); playFile(pianoSwellUrl, 0.5); },
  /** A sparkling high-register twinkle — for stars / cosmic accents, saves. */
  twinkle: () => play(() => {
    [N.C6, N.E6, N.G6, N.D6].forEach((f, i) => note(f + (Math.random() * 6 - 3), i * 0.05 + Math.random() * 0.02, 0.35, 0.045, 'sine', 6000));
  }),
  /** A bright notification ding — confirmations (mood picks, finishing early). */
  bell: () => playFile(brightNotifyUrl, 0.5),
  /** Soft whoosh for moving between screens / steps. */
  whoosh: () => playFile(whooshUrl, 0.45),
  /** A crisp produced pop — a more "finished" tap for primary confirmations. */
  pop: () => playFile(popUrl, 0.5),
  /** A playful bubble pop — opening a room / card in a bright, kid-facing UI. */
  bubble: () => playFile(bubbleUrl, 0.55),
  /** A real cheer + applause — the big "you did it!" flourish. */
  cheer: () => playFile(cheerUrl, 0.5),
};
