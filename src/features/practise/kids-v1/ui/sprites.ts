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
export const BOY_SRC = '/assets/gym/kids-character@320.webp';
export const BOY_SRCSET =
  '/assets/gym/kids-character@160.webp 160w, /assets/gym/kids-character@320.webp 320w';

export type BoyEmotion = 'calm' | 'worry' | 'scared' | 'sad';

/**
 * WHICH PLATE OF THE BOY TO DRAW.
 *
 * Only the calm one has actually been drawn, so every emotion currently
 * resolves to it. This is a real map rather than a function that ignores its
 * argument, so that adding `worry.webp` is a one-line change here and not a
 * hunt through the call sites — and so the map itself is the honest record of
 * what art exists, rather than a comment claiming art that doesn't.
 *
 * A missing plate must never 404: a broken image where a child expects to see
 * themselves is worse than the wrong expression, so an emotion is only
 * repointed here once its file is actually in /public.
 */
const BOY_PLATE: Record<BoyEmotion, { src: string; srcset: string }> = {
  calm:   { src: BOY_SRC, srcset: BOY_SRCSET },
  worry:  { src: BOY_SRC, srcset: BOY_SRCSET },
  scared: { src: BOY_SRC, srcset: BOY_SRCSET },
  sad:    { src: BOY_SRC, srcset: BOY_SRCSET },
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
