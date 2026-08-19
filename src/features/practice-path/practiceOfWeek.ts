/**
 * Practice of the Week — the permanent practice library and its weekly rhythm.
 *
 * Three rules shape everything here:
 *
 * 1. A practice is NEVER overwritten or deleted. Whatever a teacher gave is kept
 *    verbatim, forever, and resurfaces later rather than being replaced.
 * 2. The week is measured from a FIXED calendar anchor, not from when a member
 *    first opened the app — so every member is on the same practice on the same
 *    day, which is what makes it possible to talk about it together.
 * 3. Assignment is deterministic and persisted. Never Math.random(); once a week
 *    has an assignment it never changes on refresh.
 */

/** The calendar the practice weeks are counted from. Changing this shifts every
 *  historical week number, so it must not move once members have data. */
export const PRACTICE_ANCHOR = '2026-08-18';

export interface Practice {
  practiceId: string;
  title: string;
  /** The single line to carry — the teacher's own words, kept verbatim. */
  core: string;
  purpose?: string;
  /** "The practice includes" — verbatim. */
  instructions: string[];
  /** "Daily-life practice" — verbatim. */
  dailyLife: string[];
  source?: string;
  tags?: string[];
  /** The member's own restatement. Restating it is half the practice. */
  ownWords?: string;
  /** Optional alignment — both independently settable. */
  alignVirtue?: string;
  alignSixfold?: string;
  dateIntroduced: string;
  /** The week this practice was introduced for; that week always uses it. */
  originalWeek: number;
  /** Hand-authored 7-day content. When absent the generic engine is used. */
  days?: PracticeDayContent[];
  createdBy?: string;
}

export interface PracticeDayContent {
  focus: string;
  invitation: string;
  explore: string;
  inspiration: string;
  /** Three contextual entry points; each may hold several alternatives that
   *  "try another way" cycles through without changing the practice itself. */
  ways: { morning: string[]; day: string[]; evening: string[] };
  generated?: boolean;
}

export type AssignmentType = 'new' | 'manual' | 'resurfaced';

export interface PracticeAssignment {
  weekNumber: number;
  weekStart: string;
  weekEnd: string;
  practiceId: string;
  assignmentType: AssignmentType;
  assignedAt: string;
}

// ── The seven angles ─────────────────────────────────────────────────────────

export const DAY_ANGLES = [
  { n: 1, key: 'ARRIVE', label: 'Arrive' },
  { n: 2, key: 'NOTICE', label: 'Notice' },
  { n: 3, key: 'APPLY', label: 'Apply' },
  { n: 4, key: 'GO DEEPER', label: 'Go Deeper' },
  { n: 5, key: 'EMBODY', label: 'Embody' },
  { n: 6, key: 'RETURN', label: 'Return' },
  { n: 7, key: 'REFLECT', label: 'Reflect' },
] as const;

export type AngleKey = (typeof DAY_ANGLES)[number]['key'];

// ── Week / day maths from the fixed anchor ───────────────────────────────────

function isoOf(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function daysBetween(a: string, b: string): number {
  return Math.floor(
    (new Date(b + 'T00:00:00').getTime() - new Date(a + 'T00:00:00').getTime()) / 86400000,
  );
}

/** 1-based week number since the anchor. 0 means the programme hasn't started. */
export function practiceWeekNumber(dateStr?: string): number {
  const d = daysBetween(PRACTICE_ANCHOR, dateStr || isoOf(new Date()));
  return d < 0 ? 0 : Math.floor(d / 7) + 1;
}

/** 1–7 within the practice week. */
export function practiceDayNumber(dateStr?: string): number {
  const d = daysBetween(PRACTICE_ANCHOR, dateStr || isoOf(new Date()));
  return d < 0 ? 0 : (d % 7) + 1;
}

export function weekBounds(weekNumber: number): { start: string; end: string } {
  const start = new Date(PRACTICE_ANCHOR + 'T00:00:00');
  start.setDate(start.getDate() + (weekNumber - 1) * 7);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return { start: isoOf(start), end: isoOf(end) };
}

export function formatWeekRange(start: string, end: string): string {
  const A = new Date(start + 'T00:00:00');
  const B = new Date(end + 'T00:00:00');
  const month = (x: Date) => x.toLocaleDateString(undefined, { month: 'short' });
  const sameMonth = month(A) === month(B);
  return `${A.getDate()}${sameMonth ? '' : ' ' + month(A)}–${B.getDate()} ${month(B)}`;
}

// ── Deterministic hash (FNV-1a) ──────────────────────────────────────────────

export function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

// ── The generic seven-angle engine ───────────────────────────────────────────
// Lets a practice work from nothing but the teacher's own words. Every line
// below REFRAMES material the practice already carries — the core instruction,
// the "includes" list, the daily-life list. Nothing is invented; if a practice
// says nothing about a thing, this engine will not either.

const lower = (s: string) => (s ? s.charAt(0).toLowerCase() + s.slice(1) : s);

const ANGLE_FRAMES: Record<AngleKey, {
  focus: (p: Practice) => string;
  invitation: (p: Practice) => string;
  explore: (p: Practice) => string;
}> = {
  ARRIVE: {
    focus: (p) => `Today you simply arrive at ${p.title}. Let the core instruction settle before anything else: “${p.core}”`,
    invitation: () => `Say the core instruction once, slowly, feeling its meaning rather than reciting it. Then choose one simple way to hold it today.`,
    explore: (p) => p.dailyLife[0] ? `Begin here: ${lower(p.dailyLife[0])}.` : `Carry the instruction into your first ordinary task today.`,
  },
  NOTICE: {
    focus: (p) => `Today you notice. ${p.title} usually becomes visible by its absence — the moment it slips. Watch without judgment.`,
    invitation: (p) => `Notice one moment today where ${p.title} was present, and one where it was not. Meet both with equal kindness.`,
    explore: (p) => p.dailyLife[1] ? `Try noticing as you ${lower(p.dailyLife[1])}.` : `Watch for the gap between what you intend and what you actually do.`,
  },
  APPLY: {
    focus: (p) => `Today you apply. ${p.title} moves from observation into deliberate use — one real situation, consciously chosen.`,
    invitation: (p) => `Pick one interaction or decision today and bring ${p.title} to it on purpose.`,
    explore: (p) => p.dailyLife[2] ? `A concrete way in: ${lower(p.dailyLife[2])}.` : `Choose one situation today and apply the practice deliberately.`,
  },
  'GO DEEPER': {
    focus: (p) => `Today you go deeper. Why is ${p.title} difficult to hold? Usually something quieter is running underneath, unexamined.`,
    invitation: () => `Look beneath the surface today and ask what is really driving you.`,
    explore: (p) => p.instructions[2] ? `Sit with this: ${lower(p.instructions[2])}.` : `Ask honestly what resists this practice in you.`,
  },
  EMBODY: {
    focus: (p) => `Today you embody. ${p.title} that stays in the mind is only half the practice — let it become something someone else can feel.`,
    invitation: (p) => `Take one concrete action today that expresses ${p.title}.`,
    explore: (p) => p.dailyLife[3] ? `For example: ${lower(p.dailyLife[3])}.` : `Do one thing that makes the practice visible in the world.`,
  },
  RETURN: {
    focus: (p) => `Today you return. By now you will have forgotten ${p.title} at some point. That forgetting is not the problem — returning is the practice.`,
    invitation: () => `Find where you lost alignment this week and begin again, without self-criticism.`,
    explore: (p) => p.dailyLife[4] ? `Practise this: ${lower(p.dailyLife[4])}.` : `Notice where you drifted, and simply come back.`,
  },
  REFLECT: {
    focus: (p) => `Today you reflect. The week closes. Look honestly at where ${p.title} became real, and what you want to keep.`,
    invitation: () => `Review the week as a whole and name one thing you want to carry forward.`,
    explore: (p) => p.dailyLife[5] ? `Close with this: ${lower(p.dailyLife[5])}.` : `Read back what you noticed this week and see what changed.`,
  },
};

/** A day's content — hand-authored when the practice carries it, generated
 *  from the practice's own material otherwise. */
export function dayContentFor(practice: Practice, dayNumber: number): PracticeDayContent {
  const authored = practice.days?.[dayNumber - 1];
  if (authored) return authored;

  const angle = DAY_ANGLES[dayNumber - 1] ?? DAY_ANGLES[0];
  const frame = ANGLE_FRAMES[angle.key];

  // Fall back to the core line if a list is empty, so the engine always has
  // the teacher's words to work from rather than inventing filler.
  const safe: Practice = {
    ...practice,
    instructions: practice.instructions?.length ? practice.instructions : [practice.core],
    dailyLife: practice.dailyLife?.length ? practice.dailyLife : [practice.core],
  };
  const pick = (arr: string[], i: number) => (arr.length ? arr[i % arr.length] : '');

  return {
    focus: frame.focus(safe),
    invitation: frame.invitation(safe),
    explore: frame.explore(safe),
    inspiration: practice.core || '',
    generated: true,
    ways: {
      morning: [
        `Set your intention around ${practice.title} before the day begins.`,
        pick(safe.instructions, 0),
        pick(safe.instructions, 1),
      ].filter(Boolean),
      day: [
        pick(safe.dailyLife, dayNumber - 1),
        pick(safe.dailyLife, dayNumber),
        `Bring ${practice.title} to one ordinary moment today.`,
      ].filter(Boolean),
      evening: [
        `Review where ${practice.title} was present today.`,
        pick(safe.dailyLife, safe.dailyLife.length - 1),
        `Ask: what did ${practice.title} show me today?`,
      ].filter(Boolean),
    },
  };
}

// ── Weekly assignment ────────────────────────────────────────────────────────

/**
 * Choose the practice for a week, in priority order:
 *   1. a practice explicitly introduced for that week
 *   2. (a manual assignment is written directly and short-circuits this)
 *   3. deterministic resurfacing of an older practice
 *
 * The resurfacing score uses ONLY globally-shared facts — when a practice was
 * introduced, and which weeks it has been assigned to. It deliberately does NOT
 * use how often the current member practised it: that is per-user data, and
 * feeding it in would give two members different practices in the same week,
 * breaking the shared rhythm the fixed anchor exists to create.
 */
export function chooseAssignment(
  weekNumber: number,
  practices: Practice[],
  priorAssignments: PracticeAssignment[],
): { practiceId: string; assignmentType: AssignmentType } | null {
  if (!practices.length) return null;

  // 1 — a practice introduced for exactly this week always wins
  const introduced = practices.find((p) => p.originalWeek === weekNumber);
  if (introduced) return { practiceId: introduced.practiceId, assignmentType: 'new' };

  // 2 — resurface deterministically
  const prior = priorAssignments
    .filter((a) => a.weekNumber < weekNumber)
    .sort((a, b) => b.weekNumber - a.weekNumber);
  const lastId = prior.length ? prior[0].practiceId : null;

  // Never repeat the immediately preceding week.
  const eligible = practices.filter((p) => p.practiceId !== lastId);
  const pool = eligible.length ? eligible : practices;

  let best: Practice | null = null;
  let bestScore = -Infinity;
  for (const p of pool) {
    const featured = priorAssignments.filter((a) => a.practiceId === p.practiceId);
    const lastWeek = featured.length
      ? Math.max(...featured.map((a) => a.weekNumber))
      : p.originalWeek;
    const weeksSince = weekNumber - lastWeek;        // longer gap → higher
    const ageWeeks = weekNumber - (p.originalWeek || 1); // older → slightly higher
    // Deterministic tiebreak — same input, same answer, on every device.
    const jitter = (hashStr(String(weekNumber) + p.practiceId) % 100) / 1000;

    const score = weeksSince * 3 + ageWeeks * 0.5 - featured.length * 2 + jitter;
    if (score > bestScore) { bestScore = score; best = p; }
  }

  return best
    ? { practiceId: best.practiceId, assignmentType: 'resurfaced' }
    : { practiceId: practices[0].practiceId, assignmentType: 'resurfaced' };
}

// ── Prayers, matched to the day's angle ──────────────────────────────────────

const ANGLE_PRAYERS: Record<AngleKey, string[]> = {
  ARRIVE: [
    'May I arrive at {P} today with an open, unhurried heart.',
    'Let me begin — not perfectly, only sincerely.',
    'May {P} become a direction I face, not a rule I obey.',
    "Let this week's practice find its way into my ordinary hours.",
    'May I hold {P} lightly enough to carry it all week.',
  ],
  NOTICE: [
    'May I see clearly where {P} lives in me — and where it does not.',
    'Let me notice without judging what I notice.',
    'May I catch the moment before the habit, just once today.',
    'Let my seeing be gentle, even when what I see is uncomfortable.',
    'May I notice the absence of {P} as kindly as its presence.',
  ],
  APPLY: [
    'May I bring {P} into one real moment today, however small.',
    'Let me act from the practice, not merely think about it.',
    'May the pause come before the word today.',
    'Let one ordinary situation become the ground of {P}.',
    'May I choose the practice once today, deliberately.',
  ],
  'GO DEEPER': [
    'May I look beneath the surface of {P} without flinching.',
    'Let me meet the part of me that resists this practice.',
    'May I find what is really moving underneath my motives.',
    'Let honesty go deeper than comfort today.',
    'May the difficulty in {P} become my teacher.',
  ],
  EMBODY: [
    'May {P} become something another person can actually feel.',
    'Let the practice live in my hands and my voice, not only my mind.',
    'May I do the thing, quietly, without needing it seen.',
    "Let one action today carry the whole week's teaching.",
    'May {P} take a form in the world today.',
  ],
  RETURN: [
    'May I return to {P} as many times as I forget it.',
    'Let beginning again be the practice, not the failure.',
    'May I meet my forgetting without self-reproach.',
    'Let me come back gently, as often as needed.',
    'May I remember: returning is arriving.',
  ],
  REFLECT: [
    'May I look back on this week with honesty and without harshness.',
    'Let me carry forward what was real, and release the rest.',
    'May I see how {P} has quietly changed me.',
    'Let this week close gently, and remain in me.',
    'May what I learned outlast the week that taught it.',
  ],
};

/** Today's prayer for the practice. Date-seeded so it is stable through the
 *  day; `shuffle` lets the member draw another without changing tomorrow. */
export function practicePrayer(angle: AngleKey, practice: Practice, dateKey: string, shuffle = 0): string {
  const pool = ANGLE_PRAYERS[angle] ?? ANGLE_PRAYERS.ARRIVE;
  const raw = pool[(hashStr(dateKey + angle) + shuffle) % pool.length];
  return raw.replace(/\{P\}/g, practice.title);
}
