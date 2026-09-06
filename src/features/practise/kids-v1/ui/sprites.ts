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

/**
 * Get the boy sprite path for a specific emotion. Falls back to the default
 * (calm/neutral) sprite if the emotion version doesn't exist yet.
 * Emotions: calm (default), worry, scared, sad.
 */
export const boySpriteForEmotion = (emotion: 'calm' | 'worry' | 'scared' | 'sad' = 'calm') => {
  // When emotion-specific sprites are added, they'll be returned here.
  // For now, all emotions use the neutral sprite.
  return '/assets/gym/kids-character@320.webp';
};

export const boySpritesetForEmotion = (emotion: 'calm' | 'worry' | 'scared' | 'sad' = 'calm') => {
  return '/assets/gym/kids-character@160.webp 160w, /assets/gym/kids-character@320.webp 320w';
};
