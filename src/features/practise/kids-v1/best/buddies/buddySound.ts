import { isMuted } from '../../../../../lib/sfx';
import type { WorldId } from '../../../../kids/buddies';

/*
  A buddy's own little noise when tapped, made on the spot with Web Audio so
  there is no file to fetch: a toy-sized "rawr" for a dinosaur, a twinkle for
  Unicorn Sky, a bubbly blip under the sea, a beep-boop in space. Quiet, short,
  and silent whenever the gym's sound is off.
*/

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === 'undefined' || isMuted()) return null;
  try {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx ??= new Ctor();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(a: AudioContext, { type, from, to, start, dur, vol, filter }: {
  type: OscillatorType; from: number; to: number; start: number; dur: number; vol: number; filter?: number;
}) {
  const osc = a.createOscillator();
  const gain = a.createGain();
  osc.type = type;
  const t0 = a.currentTime + start;
  osc.frequency.setValueAtTime(from, t0);
  osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), t0 + dur);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  let out: AudioNode = osc;
  if (filter) {
    const f = a.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = filter;
    osc.connect(f);
    out = f;
  }
  out.connect(gain);
  gain.connect(a.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

export function buddyNoise(world: WorldId) {
  const a = audio();
  if (!a) return;
  if (world === 'dino') {
    tone(a, { type: 'sawtooth', from: 330, to: 150, start: 0, dur: 0.42, vol: 0.12, filter: 900 });
    tone(a, { type: 'square', from: 220, to: 110, start: 0.02, dur: 0.38, vol: 0.05, filter: 600 });
  } else if (world === 'magic') {
    [988, 1319, 1568, 1976].forEach((f, i) => tone(a, { type: 'sine', from: f, to: f * 1.01, start: i * 0.07, dur: 0.32, vol: 0.07 }));
  } else if (world === 'ocean') {
    [0, 0.12, 0.22].forEach((t, i) => tone(a, { type: 'sine', from: 380 + i * 140, to: 760 + i * 200, start: t, dur: 0.14, vol: 0.09 }));
  } else {
    tone(a, { type: 'square', from: 880, to: 880, start: 0, dur: 0.12, vol: 0.05, filter: 2400 });
    tone(a, { type: 'square', from: 660, to: 660, start: 0.15, dur: 0.16, vol: 0.05, filter: 2400 });
  }
}

/** A rising sparkle for a star landing: short enough to play on every gain. */
export function starChime(count = 1) {
  const a = audio();
  if (!a) return;
  const notes = [1047, 1319, 1568, 2093];
  for (let i = 0; i < Math.min(4, count); i++) tone(a, { type: 'triangle', from: notes[i], to: notes[i] * 1.02, start: i * 0.06, dur: 0.22, vol: 0.06 });
}
