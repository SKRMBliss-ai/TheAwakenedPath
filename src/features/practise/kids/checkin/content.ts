/**
 * Check-in content — ported from the working prototype
 * (docs/source-material/mind-gym-claude-code-kit/kit/reference/mind-gym-prototype.html).
 *
 * Kept as plain data, same as rooms.ts, so a wording change never touches
 * the screens that render it.
 */

export interface FeelingDef {
  id: string;
  label: string;
  /** A pleasant feeling skips the reflection path and goes straight to "what made it good". */
  ok: boolean;
  hue: number;
  face: 'happy' | 'excited' | 'sad' | 'angry' | 'scared' | 'worried';
}

export const FEELINGS: FeelingDef[] = [
  { id: 'happy', label: 'Happy', ok: true, hue: 44, face: 'happy' },
  { id: 'excited', label: 'Excited', ok: true, hue: 22, face: 'excited' },
  { id: 'sad', label: 'Sad', ok: false, hue: 212, face: 'sad' },
  { id: 'angry', label: 'Angry', ok: false, hue: 8, face: 'angry' },
  { id: 'scared', label: 'Scared', ok: false, hue: 268, face: 'scared' },
  { id: 'worried', label: 'Worried', ok: false, hue: 180, face: 'worried' },
];

export type IntensityId = 'bit' | 'quite' | 'really';

export const SIZES: { id: IntensityId; label: string; blob: number }[] = [
  { id: 'bit', label: 'A bit', blob: 26 },
  { id: 'quite', label: 'Quite big', blob: 48 },
  { id: 'really', label: 'REALLY big', blob: 74 },
];

export type BodyZoneId = 'head' | 'heart' | 'tummy' | 'hands' | 'cant';

export type ChirpyPose =
  | 'idle' | 'curious' | 'worried' | 'excited' | 'jumping' | 'hopeful'
  | 'said1' | 'said2' | 'said3';

export const chirpySprite = (pose: ChirpyPose) => `/chirpy/chirpy-${pose}.webp`;

export const GOODBITS = [
  'Someone was kind to me',
  'I did something I like',
  'Something worked!',
  'I was with someone I love',
  'It was just a good day',
];

/** What the chatterbox guesses — the child picks which one it said, or names their own. */
export const THOUGHTS = [
  'Nobody wants to play with me.',
  "I'm going to get in trouble.",
  "That's not fair!",
  "I'm rubbish at this.",
  'Something bad is going to happen.',
];

export interface SituationDef {
  id: string;
  emoji: string;
  label: string;
  /** Past-tense form, dropped into the story screen: "{past}." */
  past: string;
}

export const SITUATIONS: SituationDef[] = [
  { id: 'said', emoji: '💬', label: 'Someone said something mean', past: 'someone said something to you' },
  { id: 'turn', emoji: '🎲', label: "I didn't get a turn", past: "you didn't get a turn" },
  { id: 'toldoff', emoji: '🙅', label: 'I got told off', past: 'you got told off' },
  { id: 'broke', emoji: '🧩', label: "Something wouldn't work", past: "something wouldn't work" },
  { id: 'left', emoji: '🚪', label: 'Someone went away', past: 'someone went away' },
  { id: 'changed', emoji: '📅', label: 'We had to do something else', past: 'the plan changed' },
];

export const BODY_ZONE_WORDS: Record<BodyZoneId, string> = {
  head: 'head',
  heart: 'chest',
  tummy: 'tummy',
  hands: 'hands',
  cant: 'somewhere',
};
