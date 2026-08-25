/**
 * The granular self-introspection diary — Sant Kirpal Singh Ji Maharaj's five
 * ethical observations, each broken into its own sub-lines, plus diet and
 * selfless service. Faithful to the paper diary's structure, but recorded as
 * quick taps rather than a month-wide grid.
 *
 * Design: granular but never heavy. Each category collapses to a single
 * held/slipped line; a tap opens its sub-lines for those who want the depth.
 * Nothing is required — a category left untouched is simply "held".
 */

/** Per-category sub-line marks: sub-line key → slipped today (true = noted). */
export type DiaryCategoryMarks = Record<string, boolean>;

export interface DiaryDay {
  ahimsa?: DiaryCategoryMarks;
  truthfulness?: DiaryCategoryMarks;
  chastity?: DiaryCategoryMarks;
  humility?: DiaryCategoryMarks;
  love?: DiaryCategoryMarks;
  /** Diet kept today? true = slipped. Single line, no sub-lines. */
  diet?: boolean;
  servicePhysical?: boolean;
  serviceGiving?: boolean;
}

export interface DiaryCategory {
  key: 'ahimsa' | 'truthfulness' | 'chastity' | 'humility' | 'love';
  label: string;
  tradition: string;
  /** The Sixfold-Path flow this ethical virtue is tested by. */
  sixfold: string;
  /** Why the virtue and the flow connect — shown on hover / tap. */
  why: string;
  /** Sub-lines: [storageKey, plain label]. Plain-language first, for reach. */
  sublines: [string, string][];
}

export const DIARY_CATEGORIES: DiaryCategory[] = [
  {
    key: 'ahimsa', label: 'Non-harming', tradition: 'Ahimsa', sixfold: 'Right Action',
    why: 'Non-harming is Right Action lived — and Right Intention beneath it, since harm begins as a motive before it becomes a deed.',
    sublines: [['thought', 'In thought'], ['word', 'In word'], ['deed', 'In deed']],
  },
  {
    key: 'truthfulness', label: 'Truthful', tradition: 'Truthfulness', sixfold: 'Right Speech',
    why: 'Truthfulness is Right Speech in practice — and Right Vision, the clear seeing that truthful words depend on.',
    sublines: [
      ['falsehood', 'Falsehood'], ['deceit', 'Deceit'], ['hypocrisy', 'Hypocrisy'],
      ['fraud', 'Fraud'], ['illegalGain', 'Unfair gain'],
    ],
  },
  {
    key: 'chastity', label: 'Restraint', tradition: 'Chastity', sixfold: 'Right Presence',
    why: 'Restraint holds energy in the body rather than spending it outward — the ground of Right Presence.',
    sublines: [['thought', 'In thought'], ['word', 'In word'], ['deed', 'In deed']],
  },
  {
    key: 'humility', label: 'Humility', tradition: 'Humility', sixfold: 'Right Vision',
    why: 'Humility is Right Vision turned on yourself — seeing your own behaviour without the distortion of pride.',
    sublines: [
      ['knowledge', 'Pride of knowledge'], ['wealth', 'Pride of wealth'], ['power', 'Pride of power'],
    ],
  },
  {
    key: 'love', label: 'Love for all', tradition: 'Love for all, hatred for none', sixfold: 'Right Intention',
    why: 'Love for all is Right Intention at its widest — the vow that thoughts, words and actions serve everyone, not just your own.',
    sublines: [['thought', 'In thought'], ['word', 'In word'], ['deed', 'In deed']],
  },
];

/** How many sub-lines slipped in a category today. */
export function categoryLapses(marks?: DiaryCategoryMarks): number {
  return marks ? Object.values(marks).filter(Boolean).length : 0;
}

/** Did anything slip today, across the whole diary? */
export function anyLapse(d?: DiaryDay): boolean {
  if (!d) return false;
  if (d.diet) return true;
  return DIARY_CATEGORIES.some((c) => categoryLapses(d[c.key]) > 0);
}

/** Was the diary touched at all today (any field set)? */
export function diaryTouched(d?: DiaryDay): boolean {
  return !!d && Object.keys(d).length > 0;
}
