/**
 * The Emotional Granularity Matrix — every emotion placed on two body-level
 * axes: ENERGY (arousal) and PLEASANTNESS (valence). This is the circumplex /
 * Mood-Meter model (Russell; Brackett), and it is the accessibility key: a user
 * who can't scan 120 words CAN answer two felt questions — "how much energy?"
 * and "how pleasant?" — which narrows the field to a short, precise list.
 *
 * Naming an emotion specifically ("overwhelmed", not "bad") is itself
 * regulating (affect labelling; Lieberman) and builds granularity over time
 * (Feldman Barrett). The picker teaches that as a side effect of use.
 *
 * SWAPPABLE: this is a clean, evidence-based default set. Replace the `word`
 * rows with the studio's corrected & expanded feeling→emotion table when ready
 * — the two-axis shape and the picker stay the same.
 */

export type Axis = 1 | 2 | 3 | 4 | 5; // 1 = very low/unpleasant … 5 = very high/pleasant

export interface EmotionCell {
  word: string;
  /** 1 very low … 5 very high */
  energy: Axis;
  /** 1 very unpleasant … 5 very pleasant */
  pleasantness: Axis;
}

/** The four Mood-Meter quadrants, by axis position. Neutral middle → 'neutral'. */
export type Quadrant = 'red' | 'blue' | 'yellow' | 'green' | 'neutral';

export function quadrantOf(e: { energy: Axis; pleasantness: Axis }): Quadrant {
  if (e.energy === 3 && e.pleasantness === 3) return 'neutral';
  const high = e.energy >= 3;
  const pleasant = e.pleasantness >= 3;
  if (high && !pleasant) return 'red';     // high energy, unpleasant — anger/fear/anxiety
  if (!high && !pleasant) return 'blue';   // low energy, unpleasant — sad/tired/down
  if (high && pleasant) return 'yellow';   // high energy, pleasant — excited/joyful
  return 'green';                          // low energy, pleasant — calm/content
}

/** Quadrant → colour, for chips and the body-map link. Tuned to read in both themes. */
export const QUADRANT_COLOR: Record<Quadrant, string> = {
  red: '#E57373',
  blue: '#7EA6E0',
  yellow: '#F2C879',
  green: '#8FB9A3',
  neutral: '#B9A5B7',
};

export const QUADRANT_LABEL: Record<Quadrant, string> = {
  red: 'High energy · unpleasant',
  blue: 'Low energy · unpleasant',
  yellow: 'High energy · pleasant',
  green: 'Low energy · pleasant',
  neutral: 'Neutral',
};

export const ENERGY_LABELS = ['Very low', 'Low', 'Neutral', 'High', 'Very high'];
export const PLEASANT_LABELS = ['Very unpleasant', 'Unpleasant', 'Neutral', 'Pleasant', 'Very pleasant'];

// ── The words, spread across the grid ────────────────────────────────────────
export const EMOTION_MATRIX: EmotionCell[] = [
  // RED — high energy, unpleasant
  { word: 'Enraged', energy: 5, pleasantness: 1 },
  { word: 'Panicked', energy: 5, pleasantness: 1 },
  { word: 'Terrified', energy: 5, pleasantness: 1 },
  { word: 'Furious', energy: 5, pleasantness: 2 },
  { word: 'Anxious', energy: 4, pleasantness: 2 },
  { word: 'Overwhelmed', energy: 4, pleasantness: 1 },
  { word: 'Stressed', energy: 4, pleasantness: 2 },
  { word: 'Frustrated', energy: 4, pleasantness: 2 },
  { word: 'Angry', energy: 4, pleasantness: 1 },
  { word: 'Restless', energy: 4, pleasantness: 2 },
  { word: 'Irritated', energy: 3, pleasantness: 2 },
  { word: 'Worried', energy: 3, pleasantness: 2 },
  { word: 'Tense', energy: 3, pleasantness: 2 },
  { word: 'Jealous', energy: 3, pleasantness: 1 },

  // BLUE — low energy, unpleasant
  { word: 'Despairing', energy: 1, pleasantness: 1 },
  { word: 'Hopeless', energy: 1, pleasantness: 1 },
  { word: 'Drained', energy: 1, pleasantness: 2 },
  { word: 'Exhausted', energy: 1, pleasantness: 2 },
  { word: 'Lonely', energy: 2, pleasantness: 1 },
  { word: 'Sad', energy: 2, pleasantness: 2 },
  { word: 'Down', energy: 2, pleasantness: 2 },
  { word: 'Discouraged', energy: 2, pleasantness: 2 },
  { word: 'Ashamed', energy: 2, pleasantness: 1 },
  { word: 'Guilty', energy: 2, pleasantness: 2 },
  { word: 'Numb', energy: 1, pleasantness: 2 },
  { word: 'Flat', energy: 2, pleasantness: 3 },
  { word: 'Tired', energy: 1, pleasantness: 3 },
  { word: 'Insecure', energy: 3, pleasantness: 2 },

  // YELLOW — high energy, pleasant
  { word: 'Excited', energy: 5, pleasantness: 5 },
  { word: 'Joyful', energy: 5, pleasantness: 5 },
  { word: 'Inspired', energy: 5, pleasantness: 4 },
  { word: 'Energized', energy: 5, pleasantness: 4 },
  { word: 'Hopeful', energy: 4, pleasantness: 4 },
  { word: 'Motivated', energy: 4, pleasantness: 4 },
  { word: 'Curious', energy: 4, pleasantness: 4 },
  { word: 'Playful', energy: 4, pleasantness: 5 },
  { word: 'Confident', energy: 4, pleasantness: 4 },
  { word: 'Proud', energy: 3, pleasantness: 4 },
  { word: 'Alive', energy: 4, pleasantness: 5 },
  { word: 'Grateful', energy: 3, pleasantness: 5 },

  // GREEN — low energy, pleasant
  { word: 'Calm', energy: 2, pleasantness: 4 },
  { word: 'Peaceful', energy: 1, pleasantness: 4 },
  { word: 'Content', energy: 2, pleasantness: 4 },
  { word: 'Relaxed', energy: 1, pleasantness: 4 },
  { word: 'Serene', energy: 1, pleasantness: 5 },
  { word: 'Relieved', energy: 2, pleasantness: 4 },
  { word: 'Safe', energy: 2, pleasantness: 4 },
  { word: 'Loved', energy: 2, pleasantness: 5 },
  { word: 'Present', energy: 3, pleasantness: 4 },
  { word: 'Settled', energy: 2, pleasantness: 4 },
  { word: 'Rested', energy: 2, pleasantness: 5 },

  // NEUTRAL centre
  { word: 'Okay', energy: 3, pleasantness: 3 },
  { word: 'Thoughtful', energy: 3, pleasantness: 3 },
  { word: 'Observant', energy: 3, pleasantness: 3 },
];

/** Words near a chosen cell — the exact cell plus its immediate neighbours, so a
 *  two-tap answer lands on a short, precise list rather than one rigid word. */
export function emotionsNear(energy: Axis, pleasantness: Axis): EmotionCell[] {
  return EMOTION_MATRIX
    .map((e) => ({ e, d: Math.abs(e.energy - energy) + Math.abs(e.pleasantness - pleasantness) }))
    .filter((x) => x.d <= 2)
    .sort((a, b) => a.d - b.d)
    .slice(0, 9)
    .map((x) => x.e);
}

/** Look up a stored word's placement (for colouring history, the body-map link). */
export function cellForWord(word: string): EmotionCell | undefined {
  return EMOTION_MATRIX.find((e) => e.word.toLowerCase() === word.toLowerCase());
}
