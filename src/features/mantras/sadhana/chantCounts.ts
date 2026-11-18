// How many times the mantra is chanted in each library recording.
//
// The mala counter adds this many repetitions every time a recording plays all
// the way through, so a 108 mala with a 14-chant recording takes about 8 plays.
// (Counted by listening, matched to the library files by length.)
// Aartis are whole songs and are not counted, so they are absent here.

export const CHANTS_PER_RECORDING: Record<string, number> = {
  'karagre-vasate-lakshmi': 1,
  'om-gan-ganapataye-namah': 7,
  'mahalakshmi-mantra': 2,
  'kubera-mantra': 1,
  'kubera-ashtalakshmi-mantra': 1,
  'dhanvantari-mantra': 2,
  'surya-arghya-mantra': 3,
  'om-adityaya-namah': 1,
  'tulsi-mantra': 2,
  'shiva-mantra': 11,
  'uma-maheshwara-mantra': 14,
  'maha-sudarshana-mantra': 1,
  'shailaputri-mantra': 12,
  'navratri-day2-brahmacharini': 11,
  'navratri-day5-skandamata': 16,
  'navratri-day6-katyayani': 12,
  'navratri-day7-kalaratri': 10,
  'navratri-day8-mahagauri': 8,
  'navratri-day9-siddhidatri': 10,
  'durga-yam-devi-sarvabhuteshu': 1,
  'durga-sarvamangala-mangalye': 1,
  'lokah-samastah-sukhino': 7,
  'jai-ram-shiv-ram-guru-ram': 6,
  'mahalakshmi-mantra-v2': 3,
  'uma-maheshwara-mantra-v2': 13,
  'kubera-mantra-female': 1,
};

/** Chants in one playthrough of this recording (1 when not known). */
export const chantsPer = (slug: string) => CHANTS_PER_RECORDING[slug] ?? 1;
