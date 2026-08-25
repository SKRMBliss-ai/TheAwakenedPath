import { hashStr, weekBounds, formatWeekRange } from './practiceOfWeek';

/**
 * Technique of the Week — the meditation METHOD, which rotates on its own
 * cycle and is deliberately independent of the Practice of the Week.
 *
 * The practice is what you carry into the day; the technique is what you
 * actually do on the cushion. Collapsing the two (showing the practice title
 * where the technique belongs) would leave nobody told how to sit.
 *
 * Ported from Inner Journey. Each technique carries seven daily "angles" so
 * the same method is met from a new side each day of its week.
 */

export interface Technique {
  techId: string;
  name: string;
  /** Why this method, in plain terms. */
  why: string;
  /** Seven angles — one per day of the technique week. */
  angles: string[];
}

export const TECHNIQUE_LIBRARY: Technique[] = [
  {
    techId: 't1',
    name: 'So-Hum',
    why: "So-Hum rides the breath itself — 'So' on the in-breath, 'Hum' on the out. It needs no props and no counting, which makes it the steadiest doorway back whenever the mind has scattered.",
    angles: [
      "Understand the technique: silently sound 'So' as the breath enters, 'Hum' as it leaves. Nothing more.",
      'Notice the experience: where in the body do you actually feel the breath turning around?',
      'Refine the practice: let the syllables get quieter than the breath, not louder.',
      "Explore subtlety: is there a gap between 'So' and 'Hum'? Rest there.",
      'Practise with greater steadiness: when the mantra drops away, simply pick it up again without comment.',
      'Notice obstacles: what pulls you off it most reliably — sound, thought, discomfort?',
      'Reflect: has So-Hum begun to continue on its own outside the sit?',
    ],
  },
  {
    techId: 't2',
    name: '21 repetitions of OM',
    why: 'Chanting OM twenty-one times before sitting settles the nervous system through vibration rather than instruction. The body quietens first, and the mind follows it.',
    angles: [
      'Understand the technique: twenty-one slow OMs, each one complete before the next begins.',
      'Notice the experience: where does the vibration land — chest, throat, skull?',
      'Refine the practice: let the tail of each OM fade fully into silence before starting again.',
      'Explore subtlety: the silence between two OMs is part of the practice, not a pause in it.',
      'Practise with greater steadiness: keep the pitch and length even from the first to the twenty-first.',
      'Notice obstacles: does the counting itself become a distraction? Let it be loose.',
      'Reflect: what is the quality of the silence after the twenty-first?',
    ],
  },
  {
    techId: 't3',
    name: 'Nadi Shodhana',
    why: 'Alternate-nostril breathing balances the two sides before stillness is attempted. It is preparation as much as practice — the mind arrives already evened out.',
    angles: [
      'Understand the technique: alternate the nostrils, slow and unforced, for five to ten minutes.',
      'Notice the experience: one nostril is usually more open. Which, today?',
      'Refine the practice: let the out-breath be a little longer than the in-breath.',
      'Explore subtlety: notice the moment of change-over — that is where the balancing happens.',
      'Practise with greater steadiness: no strain, no retention beyond what is comfortable.',
      'Notice obstacles: watch for the breath becoming effortful; ease off immediately if so.',
      'Reflect: does the mind settle faster on days you do this first?',
    ],
  },
  {
    techId: 't4',
    name: 'Trataka',
    why: 'Steady gazing trains single-pointed attention through the eyes, which is often easier than training it directly through thought. The stillness of the gaze becomes the stillness of the mind.',
    angles: [
      'Understand the technique: soft, steady gaze at a flame or fixed point — looking, not staring.',
      'Notice the experience: how long before the urge to blink or glance away arrives?',
      'Refine the practice: relax the forehead and jaw while the eyes stay steady.',
      'Explore subtlety: when you close the eyes, the after-image is part of the practice.',
      'Practise with greater steadiness: return the gaze gently each time it wanders.',
      'Notice obstacles: strain is the enemy here. Soft is stronger than hard.',
      'Reflect: has the steadiness of the gaze carried into the sit itself?',
    ],
  },
];

/** The label for each of the seven daily angles. */
export const TECH_ANGLE_LABELS = [
  'Understand the technique',
  'Notice the experience',
  'Refine the practice',
  'Explore subtlety',
  'Practise with greater steadiness',
  'Notice obstacles',
  'Reflect',
];

/**
 * Which technique a given week gets.
 *
 * Inner Journey stored each week's pick in localStorage and read it back.
 * Here the whole sequence is REPLAYED from week 1 instead, so the answer is a
 * pure function of the week number: every member sees the same technique in
 * the same week (as they already do for the virtue and the practice), and
 * there is no stored assignment that can drift, be cleared, or disagree
 * between two devices.
 *
 * The selection rule is Inner Journey's: prefer whatever has been unused
 * longest, penalise how often it has already appeared, never repeat last
 * week's, and break ties with a stable hash so the order is not mechanical.
 */
export function techniqueForWeek(weekNumber: number): Technique {
  const target = Math.max(1, weekNumber);
  const picks: string[] = [];

  for (let wk = 1; wk <= target; wk++) {
    const bounds = weekBounds(wk);
    const lastId = picks.length ? picks[picks.length - 1] : null;
    const pool = TECHNIQUE_LIBRARY.filter((t) => t.techId !== lastId);
    const candidates = pool.length ? pool : TECHNIQUE_LIBRARY;

    let best = candidates[0];
    let bestScore = -Infinity;
    candidates.forEach((t) => {
      const appearances = picks.filter((id) => id === t.techId);
      const lastWeek = picks.reduce((acc, id, i) => (id === t.techId ? i + 1 : acc), 0);
      const since = wk - lastWeek;
      const jitter = (hashStr(bounds.start + t.techId) % 100) / 1000;
      const score = since * 3 - appearances.length * 2 + jitter;
      if (score > bestScore) { bestScore = score; best = t; }
    });
    picks.push(best.techId);
  }

  const id = picks[picks.length - 1];
  return TECHNIQUE_LIBRARY.find((t) => t.techId === id) ?? TECHNIQUE_LIBRARY[0];
}

/** "This week's technique · 24–30 Aug" */
export function techniqueWeekLabel(weekNumber: number): string {
  if (weekNumber < 1) return "This week's technique";
  const b = weekBounds(weekNumber);
  return `This week's technique · ${formatWeekRange(b.start, b.end)}`;
}
