/**
 * Chirpy's sprite frames — the founder's real character art, cut from the
 * uploads in /public/assets/gym/chirpy and served from /public/chirpy.
 *
 * THESE ARE NOT THE OLD NINE. The originals were deleted from /public/chirpy
 * in "update images" while every call site still pointed at them, so for a
 * while Chirpy was a broken-image icon in all seven places he appears. The
 * replacements are the newer, larger drawings — one emotion per file, cut
 * from their alpha and shipped at two heights instead of one.
 *
 * TWO SIZES, AND THAT IS THE POINT OF THE HELPERS BELOW. The sources are
 * 1254x1254 PNGs of a megabyte and a half each; a phone drawing a 76px bird
 * must never download one. `chirpySprite` gives the src and
 * `chirpySrcSet` the candidates, so a caller that sets `sizes` gets the
 * 160 on a phone and the 320 on a desktop.
 */

export type ChirpyPose =
  /** Settled. The default, and what he does when nothing is happening. */
  | 'idle' | 'calm'
  /** Head tilted, asking. */
  | 'curious' | 'wondering' | 'hopeful'
  /** Working something out — the one with the thought bubble. */
  | 'thinking'
  /** Doesn't follow, and says so. */
  | 'confused'
  /** Delighted, beak open, arms up. */
  | 'excited' | 'jumping'
  /** Frightened. Braced, eyes wide. */
  | 'worried' | 'scared'
  /** Downcast, hands together. */
  | 'sad'
  /** Mid-sentence, in three intensities — a gasp, a shout, an alarm. */
  | 'said1' | 'said2' | 'said3'
  | 'gasp' | 'shouting' | 'alarmed';

/**
 * Which drawing each pose actually resolves to.
 *
 * Ten files, more than ten poses: the aliases exist so no call site has to
 * change when a new drawing lands, and so a pose that has no art of its own
 * lands on the nearest real expression rather than on a 404. `jumping` is
 * `excited` because the excited plate already has him off the ground.
 */
const CHIRPY_PLATE: Record<ChirpyPose, string> = {
  idle: 'calm',
  calm: 'calm',
  curious: 'wondering',
  wondering: 'wondering',
  hopeful: 'wondering',
  thinking: 'thinking',
  confused: 'confused',
  excited: 'excited',
  jumping: 'excited',
  worried: 'scared',
  scared: 'scared',
  sad: 'sad',
  said1: 'gasp',
  said2: 'shouting',
  said3: 'alarmed',
  gasp: 'gasp',
  shouting: 'shouting',
  alarmed: 'alarmed',
};

export const chirpySprite = (pose: ChirpyPose) => `/chirpy/chirpy-${CHIRPY_PLATE[pose]}@320.webp`;

/** The candidates, for any caller that also sets `sizes`. */
export const chirpySrcSet = (pose: ChirpyPose) =>
  `/chirpy/chirpy-${CHIRPY_PLATE[pose]}@160.webp 160w, /chirpy/chirpy-${CHIRPY_PLATE[pose]}@320.webp 320w`;

/** The boy from the character sheet — Chirpy's person. Two sizes shipped.
 *  Resized from assets/home/boy.png, which is a 1024x1536 design source and
 *  must never be the thing a phone downloads to draw a 240px sprite. */
export const BOY_SRC = '/assets/home/boy@640.webp';
export const BOY_SRCSET =
  '/assets/home/boy@320.webp 320w, /assets/home/boy@640.webp 640w';

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
  excited:    { src: '/feelings/excited.webp', srcset: '' },
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
