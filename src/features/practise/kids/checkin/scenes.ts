/** Scene backgrounds — ported from the prototype's .sc-* gradients. */
export type SceneId = 'night' | 'look' | 'still' | 'dark' | 'den' | 'dawn';

export const SCENE_GRADIENT: Record<SceneId, string> = {
  night: 'radial-gradient(120% 80% at 50% 8%, #2c3566, #171c3d 42%, #0d1026)',
  look: 'radial-gradient(120% 80% at 50% 30%, #1c4453, #122c39 46%, #0a1720)',
  still: 'radial-gradient(130% 90% at 50% 50%, #2a2740, #191a2e 55%, #101120)',
  dark: '#07070d',
  den: 'radial-gradient(110% 70% at 50% 88%, #6b3a24, #38201d 45%, #1b1013)',
  dawn: 'radial-gradient(120% 90% at 50% 96%, #ffa76b, #7a4a63 40%, #2e2140 78%, #1c1730)',
};
