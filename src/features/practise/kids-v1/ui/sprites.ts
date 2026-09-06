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
