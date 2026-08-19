/**
 * A struck-bowl bell, synthesised — no audio files, no network, works offline.
 *
 * A single sine wave reads as a beep, which is exactly wrong for a meditation
 * bell. A struck bowl is a fundamental plus inharmonic partials that decay at
 * different rates, so the partials are layered at roughly 2× and 3× with
 * shorter lives and lower gain, and every voice decays exponentially rather
 * than linearly — a linear fade sounds switched off, an exponential one sounds
 * like it is ringing out.
 */

type AC = AudioContext;

let ctx: AC | null = null;

function audio(): AC | null {
  try {
    const Ctor = window.AudioContext || (window as any).webkitAudioContext;
    if (!Ctor) return null;
    if (!ctx) ctx = new Ctor();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function strike(a: AC, freq: number, delay: number, dur: number, vol: number) {
  const osc = a.createOscillator();
  const gain = a.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  osc.connect(gain);
  gain.connect(a.destination);

  const t = a.currentTime + delay;
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.linearRampToValueAtTime(vol, t + 0.012);   // fast attack — a strike
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur); // long ring-out
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

/** Ring the bowl. `end` is lower and struck twice, so the close of a sit
 *  feels different from its opening without needing to be louder. */
export function ringBell(kind: 'start' | 'end' = 'start') {
  const a = audio();
  if (!a) return;
  const base = kind === 'end' ? 396 : 528;

  strike(a, base, 0, 3.6, 0.30);
  strike(a, base * 2.01, 0, 2.4, 0.10);  // slightly detuned — inharmonic, like metal
  strike(a, base * 2.98, 0, 1.6, 0.05);

  if (kind === 'end') {
    strike(a, base, 1.5, 3.4, 0.22);
    strike(a, base * 2.01, 1.5, 2.2, 0.08);
  }
}

/** Browsers block audio until a gesture — call this from the first tap. */
export function primeAudio() {
  audio();
}
