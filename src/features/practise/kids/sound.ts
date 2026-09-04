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
import breatheIn from '../../../assets/kids-pause-breathe-in.mp3';
import breatheOut from '../../../assets/kids-pause-breathe-out.mp3';

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
  | 'breathComplete' | 'tapHit' | 'breatheIn' | 'breatheOut' | 'storyTheme';

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
  // One soft breath marker; the Pause Room is the quietest world, so this
  // sits well below everything else.
  breathComplete: { src: notify09,  volume: 0.22 },
  // Each hit on a tap target: a worry shrinking, a seed going in, fire
  // breathing down.
  tapHit:         { src: bubblePop, volume: 0.30 },
  // Box breathing in the Pause Room — a spoken/breath cue for each half of
  // the cycle. Quiet, since it sits under the child's own breathing.
  breatheIn:      { src: breatheIn,  volume: 0.5 },
  breatheOut:     { src: breatheOut, volume: 0.5 },

  // Different Story Room's background bed while the story is on screen —
  // the same calm piano used for `resolve`, looped low under the text
  // rather than played once as a chime. See playMusic().
  storyTheme:     { src: calmPiano, volume: 0.22 },
};

let current: HTMLAudioElement | null = null;
/** Tracked separately from `current` — a background bed plays alongside
 *  one-shot taps and discovery chimes rather than being replaced by them. */
let music: HTMLAudioElement | null = null;

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

/**
 * Play a cue as a looping background bed rather than a one-shot — the Story
 * Room's music, say. There are no dedicated ambient loops in src/assets (see
 * the note above TABLE), so this loops one of the short "logo" pieces
 * instead of pointing at a file that doesn't exist. Replaces any music
 * already playing; does not touch one-shot cues from `play`.
 */
export function playMusic(cue: Cue) {
  if (isMuted() || typeof window === 'undefined') return;
  const def = TABLE[cue];
  if (!def) return;
  try {
    stopMusic();
    const a = new Audio(def.src);
    a.volume = def.volume;
    a.loop = true;
    void a.play().catch(() => { /* autoplay policy — stay silent */ });
    music = a;
  } catch { /* ignore */ }
}

/** Stop just the background bed, leaving any one-shot cue alone. */
export function stopMusic() {
  try { music?.pause(); } catch { /* ignore */ }
  music = null;
}

/** Stop whatever long cue is playing (used when leaving a room mid-sound). */
export function stopAll() {
  try { current?.pause(); } catch { /* ignore */ }
  current = null;
  stopMusic();
}
