/**
 * Check-in content, borrowed from the live Kids Gym.
 *
 * Same reasoning as kit/sound.ts: this is pure DATA — the feelings list, the
 * intensity words, Chirpy's thought guesses, the situation cards, the maybes
 * — already ported from the founder's prototype and already reviewed. Copying
 * it would create two wordings of the same screens, and the copy would be the
 * one that quietly drifts.
 *
 * v1 renders it completely differently (its own chrome, its own quiet state,
 * its own path); it just doesn't rewrite the words. If v1 ever needs its own
 * copy, this file is the seam to break.
 */

export {
  FEELINGS,
  SIZES,
  GOODBITS,
  THOUGHTS,
  SITUATIONS,
  MAYBES,
  BODY_ZONE_WORDS,
  type FeelingDef,
  type IntensityId,
  type SituationDef,
  type BodyZoneId,
} from '../../kids/checkin/content';
