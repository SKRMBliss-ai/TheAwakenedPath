/** The body map's zone ids and labels — split from bodyMap.tsx so that file
 *  can stay component-only (react-refresh's one-kind-of-export rule).
 *
 *  Seven places rather than the original four. The extra ones (throat,
 *  shoulders, legs) exist because children do report feelings there and a map
 *  that can't represent where you actually notice something quietly teaches
 *  you that you noticed it wrong. None of these belongs to any particular
 *  feeling — see `suggestedBodyZone` in CheckIn.tsx, which offers one as a
 *  possibility and never as an answer. */

export type BodyZoneId =
  | 'head' | 'throat' | 'chest' | 'tummy'
  | 'shoulders' | 'hands' | 'legs';

export const BODY_ZONE_LABEL: Record<BodyZoneId, string> = {
  head: 'head',
  throat: 'throat',
  chest: 'chest',
  tummy: 'tummy',
  shoulders: 'shoulders',
  hands: 'hands',
  legs: 'legs',
};
