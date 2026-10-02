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

import { feelingsForAge as builtInFeelingsForAge, type FeelingDef } from '../../kids/checkin/content';
import { useLiveContent } from './liveContent';

/** The feeling balls a child of this age is offered, with any feelings added on the admin page after them. */
export function feelingsForAge(age: number | undefined): FeelingDef[] {
  const builtIn = builtInFeelingsForAge(age);
  const added = useLiveContent.getState().feelings
    .filter((f) => !builtIn.some((b) => b.id === f.id))
    .filter((f) => f.minAge === undefined || (age !== undefined && age >= f.minAge))
    .map((f): FeelingDef => ({ id: f.id, label: f.label, ok: f.ok, hue: f.hue, face: f.ok ? 'happy' : 'worried', minAge: f.minAge }));
  return [...builtIn, ...added];
}
