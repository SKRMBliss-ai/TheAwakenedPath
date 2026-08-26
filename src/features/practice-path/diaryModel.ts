/**
 * The self-introspection diary — Sant Kirpal Singh Ji Maharaj's ethical
 * observations, opened out into concrete, everyday prompts so the practitioner
 * knows exactly what to look for, and recorded as quick taps.
 *
 * Two design commitments:
 *  1. GRANULAR BUT LIGHT. Each virtue collapses to one line; a tap opens its
 *     prompts. Nothing is required — an untouched virtue is simply "held".
 *  2. UNIVERSAL LANGUAGE. The prompts are phrased so someone with no particular
 *     master, lineage, or idea of God can use them fully — "took sole credit,
 *     forgetting what I did not control" rather than "forgot He is the doer".
 */

/** Per-category marks: prompt key → recorded today (true). For lapse categories
 *  a mark is a slip noticed; for good categories it is a kindness done. */
export type DiaryCategoryMarks = Record<string, boolean>;

export interface DiaryDay {
  ahimsa?: DiaryCategoryMarks;
  truthfulness?: DiaryCategoryMarks;
  purity?: DiaryCategoryMarks;
  humility?: DiaryCategoryMarks;
  love?: DiaryCategoryMarks;
  service?: DiaryCategoryMarks;
}

export interface DiaryCategory {
  key: 'ahimsa' | 'truthfulness' | 'purity' | 'humility' | 'love' | 'service';
  label: string;
  tradition: string;
  /** 'lapse' = something to notice and release; 'good' = a kindness to affirm. */
  polarity: 'lapse' | 'good';
  /** The Sixfold-Path flow this virtue is tested by. */
  sixfold: string;
  why: string;
  /** The Nine Virtue(s) this observation cultivates. */
  virtues: string[];
  virtueWhy: string;
  /** Prompts: [storageKey, everyday prompt]. Concrete, so there is no guesswork. */
  sublines: [string, string][];
}

export const DIARY_CATEGORIES: DiaryCategory[] = [
  {
    key: 'ahimsa', label: 'Non-harming', tradition: 'Ahimsa', polarity: 'lapse', sixfold: 'Right Action',
    why: 'Non-harming is Right Action lived — and Right Intention beneath it, since harm begins as a motive before it becomes a deed.',
    virtues: ['Gentleness', 'Caring', 'Tolerance'],
    virtueWhy: 'Watching for harm is how Gentleness, Caring and Tolerance become real rather than merely intended.',
    sublines: [
      ['judged', 'Criticised or judged someone'],
      ['hurt', "Hurt someone's feelings or disrespected them"],
      ['grievance', 'Carried a thought of being wronged or treated unfairly'],
      ['missedGood', 'Failed to notice the good, or an act of kindness, in others'],
      ['passiveAggressive', 'Was passive-aggressive'],
    ],
  },
  {
    key: 'truthfulness', label: 'Truthful', tradition: 'Truthfulness', polarity: 'lapse', sixfold: 'Right Speech',
    why: 'Truthfulness is Right Speech in practice — and Right Vision, the clear seeing that truthful words depend on.',
    virtues: ['Sincerity', 'Commitment'],
    virtueWhy: 'Truthfulness is Sincerity tested — the gap between what you feel and what you show, closed one honest inch a day.',
    sublines: [
      ['lied', 'Lied, distorted the truth, or made a false promise'],
      ['posed', 'Made myself seem better than I really am'],
      ['preached', "Preached what I don't follow"],
      ['jealous', 'Felt jealousy'],
      ['validation', 'Kept seeking approval or validation from others'],
    ],
  },
  {
    key: 'purity', label: 'Purity', tradition: 'Chastity', polarity: 'lapse', sixfold: 'Right Presence',
    why: 'Purity holds energy in the body rather than spending it outward — the ground of Right Presence.',
    virtues: ['Detachment', 'Commitment'],
    virtueWhy: 'Purity is Detachment in the body — energy kept rather than leaked toward every passing wanting.',
    sublines: [
      ['language', 'Used impure or foul language'],
      ['thoughts', 'Held impure thoughts, or acted on them'],
      ['junkFood', 'Ate junk food'],
    ],
  },
  {
    key: 'humility', label: 'Humility', tradition: 'Humility', polarity: 'lapse', sixfold: 'Right Vision',
    why: 'Humility is Right Vision turned on yourself — seeing your own behaviour without the distortion of pride.',
    virtues: ['Graciousness', 'Acceptance'],
    virtueWhy: 'Noticing pride of knowledge, wealth or power is how Graciousness and Acceptance grow in place of it.',
    sublines: [
      ['superior', 'Felt superior for status, money, or being right'],
      ['tookCredit', 'Took sole credit, forgetting what I did not control'],
      ['putDown', 'Put someone down, or felt powerful for knowing more'],
      ['compared', 'Compared myself to others'],
      ['advice', 'Offered advice no one asked for'],
      ['dominated', 'Interrupted or dominated a conversation'],
    ],
  },
  {
    key: 'love', label: 'Love for all', tradition: 'Love for all, hatred for none', polarity: 'lapse', sixfold: 'Right Intention',
    why: 'Love for all is Right Intention at its widest — the vow that thoughts, words and actions serve everyone, not just your own.',
    virtues: ['Caring', 'Tolerance', 'Gentleness'],
    virtueWhy: 'Holding no one in ill will is Caring, Tolerance and Gentleness extended past the people who are easy to love.',
    sublines: [
      ['illWill', 'Held ill will, or worried what others think of me'],
      ['excluded', 'Judged or shut someone out for being different'],
      ['unaccepting', "Refused to accept a person or a moment as it was"],
    ],
  },
  {
    key: 'service', label: 'Selfless service', tradition: 'Seva', polarity: 'good', sixfold: 'Right Action',
    why: 'Service is Right Action given freely — the day’s good made visible to someone else.',
    virtues: ['Caring', 'Gentleness'],
    virtueWhy: 'Small acts of service are where Caring and Gentleness leave the mind and reach a real person.',
    sublines: [
      ['smile', 'Smiled to make someone happy'],
      ['helped', 'Offered help when someone needed it'],
      ['joy', 'Brought joy or laughter to those around me'],
      ['shared', "Gave of myself, or shared in someone's pain"],
      ['goodness', 'Helped someone see the goodness in themselves'],
    ],
  },
];

/** How many prompts were recorded in a category today. */
export function categoryCount(marks?: DiaryCategoryMarks): number {
  return marks ? Object.values(marks).filter(Boolean).length : 0;
}

/** Back-compat alias — reads as "lapses" on a lapse category. */
export const categoryLapses = categoryCount;

/** Did anything slip today, across the lapse categories only? */
export function anyLapse(d?: DiaryDay): boolean {
  if (!d) return false;
  return DIARY_CATEGORIES.some((c) => c.polarity === 'lapse' && categoryCount(d[c.key]) > 0);
}

/** Was the diary touched at all today (any field set)? */
export function diaryTouched(d?: DiaryDay): boolean {
  return !!d && Object.keys(d).length > 0;
}
