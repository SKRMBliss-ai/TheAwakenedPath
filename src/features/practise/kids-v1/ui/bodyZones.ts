/** The body map's zone ids and labels — split from bodyMap.tsx so that file
 *  can stay component-only (react-refresh's one-kind-of-export rule). */

export type BodyZoneId = 'head' | 'chest' | 'tummy' | 'hands';

export const BODY_ZONE_LABEL: Record<BodyZoneId, string> = {
  head: 'head',
  chest: 'chest',
  tummy: 'tummy',
  hands: 'hands',
};
