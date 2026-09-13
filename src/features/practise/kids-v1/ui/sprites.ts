/**
 * Chirpy's sprite frames — the founder's real character art, cut from the
 * character sheet and already living in /public/chirpy.
 *
 * A plain data module rather than part of scene.tsx, so the path helper can
 * be imported anywhere (including by non-component code) without dragging in
 * framer-motion or tripping react-refresh's one-kind-of-export rule.
 *
 * Nine frames. There is no tenth: if a screen wants an expression that isn't
 * here, it uses the nearest one rather than inventing art, because every
 * other picture in this app is generated and these are not.
 */

export type ChirpyPose =
  | 'idle' | 'curious' | 'worried' | 'excited' | 'jumping' | 'hopeful'
  | 'said1' | 'said2' | 'said3';

export const chirpySprite = (pose: ChirpyPose) => `/chirpy/chirpy-${pose}.webp`;

/** The boy from the character sheet — Chirpy's person. Two sizes shipped. */
export const BOY_SRC = '/assets/home/boy.png';
export const BOY_SRCSET = '';

export type BoyEmotion =
  | 'calm'
  | 'happy' | 'excited'
  | 'worried' | 'angry' | 'scared' | 'sad'
  | 'anxious' | 'ashamed' | 'bored' | 'embarrassed' | 'grief' | 'jealous';

/**
 * WHICH PLATE OF THE BOY TO DRAW.
 *
 * This map used to point all four emotions at the calm plate, with a note
 * saying the others had never been drawn. That note was wrong, and had been
 * for as long as it existed: the worried, frightened and sad plates were
 * sitting in /public/feelings the whole time — the same boy, same pink cap,
 * same Chirpy on the shoulder, cut for the feeling companion (see
 * kit/feelingCompanions) and never connected to this map. Nobody had looked
 * in both folders at once.
 *
 * THE FRAMING DIFFERS AND THAT IS THE ONE THING TO WATCH. The calm plate is a
 * full-length standing boy at 320x558; the feeling plates are chest-up at
 * 420x504. Every caller sizes by height with width:auto, so they don't break
 * — but a screen that flips between calm and sad shows a figure that changes
 * crop as well as expression. Calm stays the standing plate deliberately: the
 * hub greeting dances, and you need legs to dance.
 *
 * A missing plate must never 404: a broken image where a child expects to see
 * themselves is worse than the wrong expression, so an emotion is only
 * repointed here once its file is actually in /public.
 */
const BOY_PLATE: Record<BoyEmotion, { src: string; srcset: string }> = {
  calm:   { src: BOY_SRC, srcset: BOY_SRCSET },
  // No srcset: one size shipped for each of these, and pointing a `160w`
  // candidate at a 420px file would hand the browser a lie to pick from.
  happy:      { src: '/feelings/happy.webp', srcset: '' },
  excited:    { src: '/feelings/happy.webp', srcset: '' }, // excited maps to happy plate
  worried:    { src: '/feelings/worried.webp', srcset: '' },
  angry:      { src: '/feelings/angry.webp', srcset: '' },
  scared:     { src: '/feelings/scared.webp', srcset: '' },
  sad:        { src: '/feelings/sad.webp', srcset: '' },
  anxious:    { src: '/feelings/anxious.webp', srcset: '' },
  ashamed:    { src: '/feelings/ashamed.webp', srcset: '' },
  bored:      { src: '/feelings/bored.webp', srcset: '' },
  embarrassed: { src: '/feelings/embarrassed.webp', srcset: '' },
  grief:      { src: '/feelings/grief.webp', srcset: '' },
  jealous:    { src: '/feelings/jealous.webp', srcset: '' },
};

export const boySpriteForEmotion = (emotion: BoyEmotion = 'calm') => BOY_PLATE[emotion].src;

export const boySpritesetForEmotion = (emotion: BoyEmotion = 'calm') => BOY_PLATE[emotion].srcset;

/* ── A DIFFERENT BOY IN EVERY ROOM ──────────────────────────────────────── *
 *
 * WHAT ACTUALLY SHIPS TODAY: one plate. There is exactly one drawing of this
 * child in the repository — kids-character@160/@320.webp — and no amount of
 * code turns one picture into seven. Anything that claimed otherwise would be
 * tinting or flipping the same boy and calling it a costume, which a
 * six-year-old spots instantly and which is worse than not varying him at all.
 *
 * SO THIS IS THE SOCKET RATHER THAN THE FEATURE. Each room can wear its own
 * plate, and every one of them currently falls back to the plate that exists.
 * Drop a file into /public/assets/gym/rooms, name the room in
 * ROOM_PLATES_READY below, and that room's boy changes:
 *
 *     /public/assets/gym/rooms/kids-character-kind@320.webp
 *     /public/assets/gym/rooms/kids-character-kind@160.webp   (optional)
 *
 * …and the same for truth, choices, include, body, help and mindheart — the
 * virtue-room ids from best/rooms.ts, which are also the behaviour ids from My
 * Best Every Day and must not be renumbered.
 *
 * A MISSING PLATE MUST NEVER 404 VISIBLY. `onError` on the <img> is what
 * makes the socket safe: the browser asks for the room's plate, doesn't find
 * it, and silently swaps in the one that exists. That is why this returns a
 * candidate plus its fallback rather than a single string — the caller needs
 * both to wire that up. See ui/scene's TheBoy.
 */
const ROOM_PLATES = '/assets/gym/rooms';

/**
 * WHICH ROOMS ACTUALLY HAVE THEIR OWN BOY YET.
 *
 * Empty, today, because no per-room plate has been drawn. This exists so that
 * asking for art that isn't there costs nothing at all: without it every room
 * a child walks into fires a request for a file that returns 404, seven times
 * a night, on a phone, and relies on an error handler to paper over it. A
 * failed request you always expect to fail is not a fallback, it's litter.
 *
 * TO TURN A ROOM ON — two steps, and the second is one word:
 *   1. put kids-character-<roomId>@320.webp (and optionally @160) in
 *      /public/assets/gym/rooms
 *   2. add '<roomId>' to this set
 *
 * The ids are the virtue-room ids from best/rooms.ts: kind, truth, choices,
 * include, body, help, mindheart. The onError fallback in ui/scene's TheBoy
 * stays regardless, as the belt to this set's braces — a typo'd filename then
 * shows the boy who exists rather than a broken-image icon.
 */
const ROOM_PLATES_READY = new Set<string>([]);

export interface BoyPlate {
  /** What to try first — the room's own drawing, if somebody has made one. */
  src: string;
  srcset: string;
  /** What to show when they haven't. Always a file that is really there. */
  fallbackSrc: string;
  fallbackSrcset: string;
}

export function boyPlateForRoom(roomId: string | null | undefined, emotion: BoyEmotion = 'calm'): BoyPlate {
  const base = BOY_PLATE[emotion];
  if (!roomId || !ROOM_PLATES_READY.has(roomId)) {
    return { src: base.src, srcset: base.srcset, fallbackSrc: base.src, fallbackSrcset: base.srcset };
  }
  return {
    src: `${ROOM_PLATES}/kids-character-${roomId}@320.webp`,
    srcset:
      `${ROOM_PLATES}/kids-character-${roomId}@160.webp 160w, ` +
      `${ROOM_PLATES}/kids-character-${roomId}@320.webp 320w`,
    fallbackSrc: base.src,
    fallbackSrcset: base.srcset,
  };
}
