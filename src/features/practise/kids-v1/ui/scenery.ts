/**
 * THE NUMBERS ui/scene DRAWS WITH.
 *
 * A data-only module, and it exists for a mechanical reason as much as a tidy
 * one: scene.tsx exports components, and react-refresh's one-kind-of-export
 * rule means every constant or helper exported alongside them costs the whole
 * file its fast refresh. That rule had already been broken there by
 * `gaitForRoom`, and adding the gait table and the dimming scale beside it
 * would have made a component file that is mostly not components.
 *
 * Nothing in here imports React or framer-motion. It is keyframes and numbers.
 */

/* ── How far back a painting goes ────────────────────────────────────── */

/**
 * Three named amounts, because there are only three situations.
 *
 * Every screen used to pick its own — 0.12 here, 0.34 there, 0.5 in the game
 * shell — each guessed one screen at a time against one painting. The result
 * was that the Healthy Body Zone, whose art is a lit blue hologram of a child
 * at full contrast, ran its question and its tick card straight over the top
 * of it at dim 0.12. A six-year-old could not find the controls.
 *
 * These paintings are gorgeous and they are SCENERY. The moment a screen has
 * something on it to read or press, the art is behind that thing rather than
 * competing with it.
 */
export const DIM = {
  /** A beat of just the room, before anything is asked. */
  arrive: 0.28,
  /** A question, a card, a pill. The common case. */
  content: 0.46,
  /** A game, where the controls are the entire screen. */
  play: 0.58,
} as const;

/* ── How the boy passes the time ─────────────────────────────────────── */

/**
 * HOW HE MOVES.
 *
 * He used to do one thing everywhere: rise six pixels and sink back, every
 * five and a half seconds, in all seven rooms and on the hub. That is not a
 * character being alive, it is a sprite on a sine wave, and a child reads the
 * difference immediately — the boy was furniture that happened to bob.
 *
 * So each room gets a gait. The shapes are deliberately not interchangeable:
 * the Castle marches, the Park bounces, the Observatory barely moves at all,
 * and the hub dances, because the hub is the one place he is not waiting for
 * anybody. It is the cheapest possible characterisation and it is most of
 * what "alive" means on screen.
 *
 * EVERY LOOP CLOSES. The first and last frame of each track are identical, so
 * the cycle joins itself instead of snapping back to the start — a jump at
 * the seam is the thing that makes a loop look like a loop.
 *
 * NONE OF IT RUNS IN THE QUIET STATE. `useMotion().loop` is undefined when the
 * app has quietened itself or the device asked for less motion, and that is
 * the switch: he stands still. A distressed child does not get a dancing
 * cartoon.
 */
export type BoyGait = 'still' | 'sway' | 'walk' | 'march' | 'bounce' | 'drift' | 'dance';

export interface Gait {
  y: number[];
  x: number[];
  rotate: number[];
  seconds: number;
}

export const GAITS: Record<BoyGait, Gait> = {
  /** The old behaviour, kept for anywhere that genuinely wants stillness. */
  still:  { y: [0, -6, 0],          x: [0, 0, 0],             rotate: [0, 0, 0],            seconds: 5.5 },
  /** Weight shifting foot to foot. Somebody standing in a garden. */
  sway:   { y: [0, -5, 0, -5, 0],   x: [0, 7, 0, -7, 0],      rotate: [0, 1.6, 0, -1.6, 0], seconds: 6.4 },
  /** Actually crossing the floor and coming back. */
  walk:   { y: [0, -9, 0, -9, 0],   x: [-16, -5, 7, -5, -16], rotate: [0, -2, 0, 2, 0],     seconds: 5.2 },
  /** Knees up. Faster, squarer, pleased with itself. */
  march:  { y: [0, -14, 0, -14, 0], x: [0, 4, 0, -4, 0],      rotate: [0, -3, 0, 3, 0],     seconds: 3.4 },
  /** Two hops and a little one, the way children actually bounce. */
  bounce: { y: [0, -19, 0, -8, 0],  x: [0, 2, 0, -2, 0],      rotate: [0, 4, 0, -4, 0],     seconds: 2.7 },
  /** Barely there. For the room where the whole point is sitting still. */
  drift:  { y: [0, -10, 0],         x: [0, 9, 0],             rotate: [0, 1, 0],            seconds: 9 },
  /** The hub. Shoulders, hips, a shuffle each way. */
  dance:  { y: [0, -15, 0, -15, 0], x: [-11, 0, 11, 0, -11],  rotate: [-5, 0, 5, 0, -5],    seconds: 3.2 },
};

/**
 * Which gait belongs to which room.
 *
 * TWO SETS OF IDS, ON PURPOSE, because the app genuinely has two. The virtue
 * rooms in best/rooms.ts are keyed by behaviour (`kind`, `truth`, …, the ids
 * that must never renumber); the painted scene rooms in rooms.ts are keyed by
 * place (`feelings`, `thought`, …). A child walks through both, and this table
 * used to hold only the first — so every screen that handed it a scene id got
 * `still` back and the boy stood there, which looked like the gaits not
 * working rather than like a table with half its keys missing.
 *
 * `body` appears in both namespaces and means the same room in both, which is
 * why it can safely share one entry.
 */
const ROOM_GAIT: Record<string, BoyGait> = {
  // Virtue rooms — best/rooms.ts.
  kind: 'sway',
  truth: 'walk',
  choices: 'march',
  include: 'bounce',
  body: 'march',
  help: 'walk',
  mindheart: 'drift',

  // Painted scene rooms — rooms.ts.
  feelings: 'sway',
  thought: 'drift',
  pause: 'still',
  story: 'walk',
  friendship: 'bounce',
  anger: 'march',
  worry: 'sway',
  kindness: 'sway',
  reflection: 'drift',
  bigfeelings: 'walk',
  together: 'bounce',
};

export function gaitForRoom(roomId: string | null | undefined): BoyGait {
  return (roomId && ROOM_GAIT[roomId]) || 'still';
}
