// ─────────────────────────────────────────────────────────────────────────────
// Puja sequences — a set of mantras chanted in the traditional order, each a
// chosen number of times, played back to back so the person presses play once.
//
// Only mantras that exist in the library can appear here (see resolveSequence).
// The order follows the usual flow of each puja: Ganesha first, then the main
// deity, then the closing prayers.
// ─────────────────────────────────────────────────────────────────────────────

export interface PujaSequence {
  id: string;
  name: string;
  /** When it is used. */
  occasion: string;
  blurb: string;
  /** Mantra slugs, in the order they are chanted. */
  steps: string[];
}

export const PUJA_SEQUENCES: PujaSequence[] = [
  {
    id: 'diwali-lakshmi',
    name: 'Diwali Lakshmi puja',
    occasion: 'Diwali evening',
    blurb: 'Begin with Ganesha, invite Lakshmi, then Kubera, and close with the Ganesha aarti.',
    steps: ['om-gan-ganapataye-namah', 'mahalakshmi-mantra', 'kubera-ashtalakshmi-mantra', 'kubera-mantra', 'ganesha-aarti'],
  },
  {
    id: 'dhanteras',
    name: 'Dhanteras puja',
    occasion: 'Dhanteras evening',
    blurb: 'Dhanvantari for health, Kubera and Lakshmi for prosperity, with Ganesha first.',
    steps: ['om-gan-ganapataye-namah', 'dhanvantari-mantra', 'kubera-mantra', 'kubera-ashtalakshmi-mantra'],
  },
  {
    id: 'chhath',
    name: 'Chhath arghya',
    occasion: 'Sunrise or sunset',
    blurb: 'The offering verse to the Sun, then the two Surya chants.',
    steps: ['surya-arghya-mantra', 'om-adityaya-namah', 'om-suryaya-namah'],
  },
  {
    id: 'morning-prayer',
    name: 'Morning prayer',
    occasion: 'On waking',
    blurb: 'A short start to the day: the palm prayer, Ganesha, then Saraswati.',
    steps: ['karagre-vasate-lakshmi', 'om-gan-ganapataye-namah', 'saraswati-mantra'],
  },
  {
    id: 'tulsi-evening',
    name: 'Tulsi evening',
    occasion: 'Kartik evenings and Tulsi Vivah',
    blurb: 'The Tulsi mantra and the Tulsi aarti, as the evening diya is lit.',
    steps: ['tulsi-mantra', 'tulsi-aarti'],
  },
];

/** Keep only steps whose mantra exists in the library, in order. */
export function resolveSequence(seq: PujaSequence, available: Set<string>): string[] {
  return seq.steps.filter((slug) => available.has(slug));
}

/** Repetitions offered per mantra in a sequence. */
export const PUJA_REPEATS = [1, 3, 11, 27, 108] as const;
