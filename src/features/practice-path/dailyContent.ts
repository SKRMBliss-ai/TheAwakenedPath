/**
 * The rotating content for the Daily Practice ribbon — one teaching and a bank
 * of go-deeper prompts, surfaced deterministically by day so everyone opening
 * the app on the same date meets the same teaching (a shared daily anchor), and
 * the same person never sees the same one two days running.
 *
 * Deterministic, never Math.random(): the ribbon must show the same teaching all
 * day and the same prompt until it is answered or reshuffled.
 */

export interface DailyTeaching {
  id: string;
  quote: string;
  source: string;
}

/** Eckhart Tolle — The Power of Now / A New Earth. Short enough to read in a
 *  breath; each is a doorway into presence, not a concept to study. */
export const TEACHINGS: DailyTeaching[] = [
  { id: 'not-your-mind', quote: 'You are not your mind.', source: 'The Power of Now' },
  { id: 'this-moment', quote: 'Realize deeply that the present moment is all you ever have.', source: 'The Power of Now' },
  { id: 'watcher', quote: 'The moment you start watching the thinker, a higher level of consciousness becomes activated.', source: 'The Power of Now' },
  { id: 'surrender', quote: 'Accept — then act. Whatever the present moment contains, accept it as if you had chosen it.', source: 'The Power of Now' },
  { id: 'no-problems', quote: 'You have no problems, only situations to be dealt with now, or to be left alone.', source: 'The Power of Now' },
  { id: 'presence', quote: 'Wherever you are, be there totally.', source: 'The Power of Now' },
  { id: 'inner-body', quote: 'Feel the inner body. Suddenly your attention is drawn away from thinking.', source: 'The Power of Now' },
  { id: 'pain-body', quote: 'The pain that you create now is always some form of nonacceptance of what is.', source: 'The Power of Now' },
  { id: 'stillness', quote: 'When you lose touch with inner stillness, you lose touch with yourself.', source: 'A New Earth' },
  { id: 'awareness', quote: 'Awareness is the greatest agent for change.', source: 'A New Earth' },
  { id: 'space', quote: 'Between the thought and the next thought there is a gap — that gap is who you are.', source: 'The Power of Now' },
  { id: 'complaining', quote: 'See if you can catch the voice in the head, perhaps in the very moment it complains.', source: 'The Power of Now' },
  { id: 'now-only', quote: 'Time isn’t precious at all, because it is an illusion. The Now is all there is.', source: 'The Power of Now' },
  { id: 'resistance', quote: 'Whatever you fight, you strengthen, and what you resist, persists.', source: 'A New Earth' },
];

/** How the person can say the teaching landed — three warm, non-judgmental taps. */
export const LANDED_OPTIONS = [
  { key: 'clarity', label: 'Clarity', emoji: '💡' },
  { key: 'comfort', label: 'Comfort', emoji: '🫶' },
  { key: 'challenge', label: 'Challenge', emoji: '🌱' },
] as const;

/** Meditation techniques offered as chips. `custom` lets a member name their own
 *  so the ribbon fits any lineage rather than prescribing one. */
export const TECHNIQUES = [
  { key: 'witnessing', label: 'Witnessing', emoji: '👁' },
  { key: 'breath', label: 'Breath', emoji: '🌬️' },
  { key: 'simran', label: 'Simran', emoji: '📿' },
  { key: 'sound', label: 'Inner Sound', emoji: '🔔' },
  { key: 'stillness', label: 'Stillness', emoji: '🪷' },
] as const;

/** Quick duration presets, in minutes. */
export const DURATIONS = [5, 10, 20, 30] as const;

// ── The go-deeper prompt bank ────────────────────────────────────────────────
// Prompts are grouped so the ribbon can pick a RELEVANT one from what was just
// logged — a restless sit draws a restlessness prompt, a flagged lapse draws a
// gentle prompt toward it. Each is answerable in a single line.

export const PROMPTS = {
  restless: [
    'Your sit was restless. In one line: where did the restlessness want to take you?',
    'When the mind wandered today, what was it reaching for?',
    'Name the one thought that pulled hardest at your attention today.',
  ],
  settled: [
    'Your sit felt settled. What let you arrive so fully today?',
    'In a line: what did the stillness show you that thinking never does?',
    'You found presence today. Where in your day could you return to it?',
  ],
  lapse: [
    'Something slipped today. Meet it kindly — in one line, what was underneath it?',
    'Where did you lose presence today, and what one thing would bring you back?',
    'Name the moment you reacted from the mind rather than from stillness.',
  ],
  presence: [
    'Where did you lose the Now today? Name the moment.',
    'One thing you resisted today — what if you had accepted it instead?',
    'When did you feel most awake today? Stay with it for a line.',
    'What story is your mind telling right now? Is it fact, or forecast?',
    'Feel your hands this moment. What is here, when you stop thinking?',
    'What did you complain about today — aloud or silently? Could it simply be?',
  ],
} as const;

// ── Deterministic day maths ──────────────────────────────────────────────────

function dayIndex(dateStr: string): number {
  // Days since epoch — a stable per-date integer, timezone-safe at day scale.
  return Math.floor(new Date(dateStr + 'T00:00:00').getTime() / 86400000);
}

/** The teaching for a given day — rotates through the bank, one per day. */
export function teachingForDay(dateStr: string): DailyTeaching {
  const i = ((dayIndex(dateStr) % TEACHINGS.length) + TEACHINGS.length) % TEACHINGS.length;
  return TEACHINGS[i];
}

/**
 * Pick the day's go-deeper prompt, reactive to what was logged.
 *   - a flagged diary lapse → a gentle prompt toward it
 *   - a restless sit (settled ≤ 2) → a restlessness prompt
 *   - a settled sit (settled ≥ 4) → a settled prompt
 *   - otherwise → a general presence prompt
 * `shuffle` advances within the chosen group without changing the group, so
 * "another prompt" stays on-theme.
 */
export function promptForDay(
  dateStr: string,
  opts: { settled?: number; hasLapse?: boolean; shuffle?: number } = {},
): string {
  const { settled, hasLapse, shuffle = 0 } = opts;
  const group: readonly string[] =
    hasLapse ? PROMPTS.lapse
    : settled != null && settled <= 2 ? PROMPTS.restless
    : settled != null && settled >= 4 ? PROMPTS.settled
    : PROMPTS.presence;
  const base = dayIndex(dateStr);
  const i = (((base + shuffle) % group.length) + group.length) % group.length;
  return group[i];
}
