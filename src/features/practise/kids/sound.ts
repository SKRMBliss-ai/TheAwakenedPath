import { isMuted } from '../../../lib/sfx';

// Real files from src/assets — nothing here is invented. Where no suitable
// asset exists (there are no ambient loops in the folder: no wind, water,
// forest or room-tone beds), the cue is deliberately left silent rather than
// pointing at a file that does not exist.
import sharpPop from '../../../assets/creatorshome-sharp-pop-328170.mp3';
import bubblePop from '../../../assets/soundreality-bubble-pop-424583.mp3';
import dramaticWhoosh from '../../../assets/dragon-studio-dramatic-whoosh-swing-487667.mp3';
import softWhoosh from '../../../assets/dragon-studio-whoosh-effect-405447.mp3';
import brightNotify from '../../../assets/universfield-bright-notification-352449.mp3';
import calmPiano from '../../../assets/alexzavesa-calm-inspiring-piano-logo-short-version-518990.mp3';
import notify09 from '../../../assets/universfield-new-notification-09-352705.mp3';
import breathIn from '../../../assets/breath-in.mp3';
import breathOut from '../../../assets/breath-out.mp3';

/**
 * The Kids Gym sound design table, as code.
 *
 * Every cue names a real asset, a volume, and whether it may interrupt the
 * cue already playing. Re-pointing a cue at a different file is a one-line
 * change here — which matters, because the `universfield-new-notification-*`
 * clips are near-identical by filename and were chosen by role, not by ear.
 * Swap them freely once you've listened.
 *
 * Design principle from the brief: sound says "you discovered something",
 * never "you won". There are no reward jingles in this table.
 */

export type Cue =
  | 'tap' | 'roomCard' | 'enterRoom' | 'exitRoom' | 'discovery' | 'resolve'
  | 'breathComplete' | 'tapHit' | 'breatheIn' | 'breatheOut';

interface CueDef { src: string; volume: number; interruptible?: boolean }

const TABLE: Record<Cue, CueDef> = {
  // ── Global ────────────────────────────────────────────────────────────
  tap:        { src: sharpPop,       volume: 0.40 },
  roomCard:   { src: bubblePop,      volume: 0.45 },
  enterRoom:  { src: dramaticWhoosh, volume: 0.50 },
  exitRoom:   { src: softWhoosh,     volume: 0.35 },
  discovery:  { src: brightNotify,   volume: 0.45 },
  resolve:    { src: calmPiano,      volume: 0.42 },

  // ── Exercise beats ────────────────────────────────────────────────────
  // The two breath voices lead the box-breathing exercise in the Pause Room.
  // They run 2.2s and 3.3s, so each sits comfortably inside its 4s side of
  // the box without bleeding into the next phase.
  breatheIn:  { src: breathIn,  volume: 0.65 },
  breatheOut: { src: breathOut, volume: 0.65 },
  // Marks the end of a full round. The Pause Room is the quietest world, so
  // this sits well below the breath voices.
  breathComplete: { src: notify09,  volume: 0.18 },
  // Each hit on a tap target: a worry shrinking, a seed going in, fire
  // breathing down.
  tapHit:         { src: bubblePop, volume: 0.30 },
};

let current: HTMLAudioElement | null = null;

/** Play a cue. Honours the same device mute toggle as the rest of the app. */
export function play(cue: Cue, opts?: { stopOthers?: boolean }) {
  if (isMuted() || typeof window === 'undefined') return;
  const def = TABLE[cue];
  if (!def) return;
  try {
    if (opts?.stopOthers && current) { current.pause(); current = null; }
    const a = new Audio(def.src);
    a.volume = def.volume;
    void a.play().catch(() => { /* autoplay policy — stay silent */ });
    current = a;
  } catch { /* ignore */ }
}

/** Stop whatever long cue is playing (used when leaving a room mid-sound). */
export function stopAll() {
  try { current?.pause(); } catch { /* ignore */ }
  current = null;
}
