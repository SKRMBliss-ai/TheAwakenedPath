import { isMuted } from '../../../../lib/sfx';
import type { SceneMood } from '../rooms';

/**
 * ROOM TONE — the sound a place makes when nothing is happening.
 *
 * The app had thirteen sound cues and every one of them was an EVENT: a pop,
 * a whoosh, a notification, a piano sting. Which means the gym was completely
 * silent except in the half-second after the child touched something. Silence
 * is what a menu sounds like. Every place a child has ever loved has a sound
 * underneath it, and that bed is doing more work for "this is somewhere real"
 * than any single effect on top of it.
 *
 * SYNTHESISED, NOT SAMPLED, and that isn't a compromise. The sound table's own
 * comment records that there are no ambient loops in the asset folder — no
 * wind, water, forest or room tone — so the honest options were to ship
 * several megabytes of new loops or to make the noise ourselves. Filtered
 * noise IS room tone; it's what a recording of an empty room mostly contains.
 * A few hundred bytes of code gives every room its own, changes it per mood,
 * and adds nothing to the download.
 *
 * IT BREATHES. A static filtered hiss reads as broken audio within about ten
 * seconds. A very slow drift on the filter — one cycle every half-minute or
 * so — is the difference between "noise" and "air in a room", and it is the
 * single most important line in this file.
 *
 * IT IS ALMOST TOO QUIET. Room tone is working when you would only notice it
 * by its absence. The gains here look implausibly small and are correct;
 * anything louder becomes a thing the child is listening TO rather than a
 * room they are in.
 *
 * TWO ESCAPE HATCHES, BOTH ALREADY EXISTING. It honours the same mute toggle
 * as every other sound (lib/sfx's isMuted), and the caller stops it entirely
 * in the quiet state — a distressed child gets silence, like they get no
 * motion and no Chirpy.
 */

interface Bed {
  /** Lowpass corner, in Hz. Lower is further away and more muffled. */
  cutoff: number;
  /** How far the slow drift moves that corner, as a fraction of it. */
  drift: number;
  /** Seconds for one full breath of that drift. */
  period: number;
  /** Overall level. Tiny on purpose — see the note above. */
  gain: number;
  /** An optional drone under the noise, in Hz, for rooms with machinery. */
  drone?: number;
  /** How loud that drone is relative to the bed. */
  droneGain?: number;
}

/**
 * One bed per scene mood, so a room's sound and its look come from the same
 * decision. The Truth Lab hums because it's a laboratory; the Observatory is
 * nearly silent because the whole point of it is that it's high up and far
 * from everything.
 */
const BEDS: Record<SceneMood, Bed> = {
  // Wide, soft, and far away. The default the hub sits in.
  night:         { cutoff: 420, drift: 0.35, period: 34, gain: 0.020 },
  // Closer and warmer, like a small room with something burning in it.
  den:           { cutoff: 700, drift: 0.28, period: 26, gain: 0.026 },
  // A laboratory: quieter air, and a mains hum underneath it.
  investigation: { cutoff: 340, drift: 0.22, period: 40, gain: 0.014, drone: 58, droneGain: 0.5 },
  // Brighter and more open — morning air rather than night air.
  dawn:          { cutoff: 980, drift: 0.40, period: 22, gain: 0.022 },
  // More movement and more of it, without ever becoming weather you notice.
  storm:         { cutoff: 560, drift: 0.55, period: 16, gain: 0.030 },
};

/** How long a room's tone takes to arrive or leave. Slow enough to be a
 *  crossfade rather than a cut, short enough not to lag the room change. */
const FADE = 1.6;

interface Playing {
  mood: SceneMood;
  ctx: AudioContext;
  out: GainNode;
  nodes: AudioScheduledSourceNode[];
}

let playing: Playing | null = null;
let ctx: AudioContext | null = null;

function audioCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx ??= new Ctor();
    // Mobile suspends the context until a gesture. By the time a child is in
    // a room they have tapped several things, so this virtually always
    // succeeds — and when it doesn't, the room is simply quiet.
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch { return null; }
}

/** Two seconds of white noise, looped. Long enough that the loop point is
 *  inaudible, short enough to be cheap to generate. */
function noiseBuffer(c: AudioContext): AudioBuffer {
  const frames = c.sampleRate * 2;
  const buf = c.createBuffer(1, frames, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

/**
 * Starts (or crosses to) the tone for a mood. Calling it with the mood
 * already playing does nothing, so a re-render can't stack a second bed on
 * top of the first — which is the classic way ambient audio turns into a roar.
 */
export function startAmbience(mood: SceneMood): void {
  if (isMuted()) { stopAmbience(); return; }
  if (playing?.mood === mood) return;

  const c = audioCtx();
  if (!c) return;

  stopAmbience();

  const bed = BEDS[mood];
  const now = c.currentTime;

  const out = c.createGain();
  out.gain.setValueAtTime(0, now);
  out.gain.linearRampToValueAtTime(bed.gain, now + FADE);
  out.connect(c.destination);

  const nodes: AudioScheduledSourceNode[] = [];

  // The air.
  const noise = c.createBufferSource();
  noise.buffer = noiseBuffer(c);
  noise.loop = true;

  const filter = c.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(bed.cutoff, now);
  filter.Q.setValueAtTime(0.4, now);

  // THE BREATH. Without this it is a hiss and a child hears it as a fault.
  const lfo = c.createOscillator();
  lfo.frequency.setValueAtTime(1 / bed.period, now);
  const lfoDepth = c.createGain();
  lfoDepth.gain.setValueAtTime(bed.cutoff * bed.drift, now);
  lfo.connect(lfoDepth).connect(filter.frequency);

  noise.connect(filter).connect(out);
  noise.start();
  lfo.start();
  nodes.push(noise, lfo);

  // The machinery, where a room has any.
  if (bed.drone) {
    const osc = c.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(bed.drone, now);
    const g = c.createGain();
    g.gain.setValueAtTime(bed.droneGain ?? 0.4, now);
    osc.connect(g).connect(out);
    osc.start();
    nodes.push(osc);
  }

  playing = { mood, ctx: c, out, nodes };
}

/** Fades the current tone out and tears it down. Safe to call at any time,
 *  including when nothing is playing. */
export function stopAmbience(): void {
  const p = playing;
  playing = null;
  if (!p) return;

  const now = p.ctx.currentTime;
  try {
    p.out.gain.cancelScheduledValues(now);
    p.out.gain.setValueAtTime(p.out.gain.value, now);
    p.out.gain.linearRampToValueAtTime(0, now + FADE * 0.5);
  } catch { /* context already gone */ }

  // Stopped AFTER the fade, not with it — killing the sources immediately
  // produces a click, which is the one sound this whole file exists to avoid.
  window.setTimeout(() => {
    for (const n of p.nodes) { try { n.stop(); } catch { /* already stopped */ } }
    try { p.out.disconnect(); } catch { /* already disconnected */ }
  }, FADE * 500 + 120);
}
