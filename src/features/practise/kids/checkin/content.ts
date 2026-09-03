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

/** One line of a "teach" screen — stepped through one at a time, tap to advance. */
export interface TeachSequence {
  scene: 'night' | 'look' | 'still' | 'dark' | 'den' | 'dawn';
  pose: ChirpyPose;
  lines: string[];
  /** Label on the final line's button — the sequence's own name for "done". */
  endLabel: string;
}

/** Explains what the eyes/camera test just showed — ported from camera()'s two S.teach branches. */
export function cameraTeach(step: 0 | 1, choice: 'cam' | 'brain'): TeachSequence {
  if (step === 0) {
    return choice === 'cam'
      ? { scene: 'look', pose: 'excited', endLabel: 'Next one', lines: [
        'Yes! Your eyes saw that one.',
        'It happened out there, in the room.',
        'Anyone standing next to you would have seen it too.',
      ] }
      : { scene: 'look', pose: 'curious', endLabel: 'Next one', lines: [
        'Have a look again.',
        'Could you point at it? With your finger?',
        "You could, couldn't you. It happened out there, in the room.",
        'Anyone standing next to you would have seen it too.',
      ] };
  }
  return choice === 'brain'
    ? { scene: 'look', pose: 'hopeful', endLabel: 'Okay!', lines: [
      "That's it. Nobody's eyes saw that one.",
      'It happened in here.',
      'Nobody standing next to you heard it. Not one person.',
      'Only you.',
      'Both bits are allowed. They\'re just different kinds of bits.',
    ] }
    : { scene: 'look', pose: 'worried', endLabel: 'Okay!', lines: [
      'Try pointing at this one. Go on, with your finger.',
      "You can't, can you.",
      "There's nothing out there to point at.",
      'That one happened in here, where only you can hear it.',
      'Both bits are allowed. They\'re just different kinds of bits.',
    ] };
}

/** Other stories Chirpy never thought of — keyed by situation id (content.ts's SITUATIONS). */
export const MAYBES: Record<string, string[]> = {
  said: ['Maybe they were having a rotten day', 'Maybe it came out wrong', 'Maybe they felt bad after', 'Maybe they were cross about something else'],
  turn: ["Maybe they forgot whose go it was", "Maybe they didn't see you waiting", 'Maybe they got too excited', "Maybe there wasn't time"],
  toldoff: ['Maybe the grown-up was tired', 'Maybe they only saw the end bit', 'Maybe they got a fright', "Maybe they'd said it lots already"],
  broke: ['Maybe it was already broken', "Maybe it's a really tricky one", 'Maybe it needs a different way', 'Maybe nobody could do it'],
  left: ['Maybe they had to go somewhere', "Maybe they're coming back", "Maybe they didn't know you wanted them", 'Maybe they were sad to go too'],
  changed: ['Maybe something happened nobody planned', 'Maybe a grown-up had to change it', 'Maybe it can happen another day', 'Maybe nobody knew till the end'],
  other: ["Maybe there's a bit you couldn't see", "Maybe it wasn't about you", 'Maybe someone was having a hard day', 'Maybe nobody meant it'],
};
