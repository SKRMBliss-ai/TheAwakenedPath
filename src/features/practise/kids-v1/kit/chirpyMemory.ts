import { loadCases, type Case } from './cases';

/**
 * CHIRPY REMEMBERS, BADLY, AND THE CHILD PUTS HIM RIGHT.
 *
 * Every other thing this app knows about a child is shown back to them as a
 * record: a grid, a jar, a shelf of cases. Records are for looking at. This is
 * the one place the material comes back as a CONVERSATION, and it does the one
 * thing a record can't — it makes the child the authority.
 *
 * Chirpy quotes what they actually said, word for word, weeks later. Then he
 * gets the feeling wrong and asks. Correcting a friend who has most of your
 * story right and one bit wrong is a warm thing to do rather than a test to
 * pass, and it proves something no badge can: he kept it. A six-year-old who
 * finds out the app remembered what they said in August will tell you about it.
 *
 * WHY THE SLIP IS ALWAYS THE FEELING, never their own sentence. Their words
 * come back verbatim or not at all — garbling a child's account of something
 * that upset them is a machine mangling the most private thing it holds, and
 * "worried" mis-recalled as "scared" is a friend half-remembering, while their
 * story played back wrong is unsettling. Feelings are also a closed list of
 * six, so a wrong guess is always a real feeling and never nonsense.
 *
 * WHY THE SLIP IS ALWAYS PLAUSIBLE. He guesses a NEIGHBOUR of the true
 * feeling — worried for scared, sad for angry — not a random one. Chirpy
 * cheerfully asking whether a child was "Happy" about the day something
 * frightened them isn't endearing, it's careless, and it reads as not having
 * listened at all.
 *
 * NOTHING IS EVER CORRECTED BACK AT THE CHILD. If they answer with a feeling
 * that isn't the one on the case, that is now the answer; the app does not
 * produce the receipt. They are allowed to have changed their mind about their
 * own afternoon, and the case is never rewritten either — see `caseFeeling`'s
 * note.
 */

/** The six on the feeling balls, by id. Kept here as labels because that is
 *  what a case stores — see DeepDive's `answer('feeling', label)`. */
const FEELING_LABELS = ['Happy', 'Excited', 'Sad', 'Angry', 'Scared', 'Worried'] as const;

/**
 * Who each feeling could be mistaken FOR by someone half-remembering. Not
 * symmetric by accident — it reads as a friend reaching for the word and
 * landing one along.
 */
const NEAR: Record<string, string[]> = {
  Happy: ['Excited'],
  Excited: ['Happy'],
  Sad: ['Worried', 'Angry'],
  Angry: ['Sad'],
  Scared: ['Worried'],
  Worried: ['Scared', 'Sad'],
};

const KEY = 'mindgym.kidsv1.chirpyMemory';

/**
 * A case has to have properly settled before he brings it back. Ten days is
 * long enough that the child has to actually reach for it — which is the
 * point, because remembering it themselves is the good bit — and short enough
 * that they still can.
 */
const MIN_AGE_DAYS = 10;

/** And he does not do this often. A friend who quizzes you about your old
 *  afternoons every single evening is not remembering, he's interrogating. */
const REST_DAYS = 6;

interface Memory {
  /** ISO day he last asked about anything. */
  last?: string;
  /** Case days already used, so the same afternoon never comes round twice. */
  used?: string[];
}

function read(): Memory {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Memory) : {};
  } catch { return {}; }
}

function write(m: Memory): void {
  try { localStorage.setItem(KEY, JSON.stringify(m)); } catch { /* storage off — he just asks again another day */ }
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string): number {
  return Math.round(
    (new Date(b + 'T00:00:00').getTime() - new Date(a + 'T00:00:00').getTime()) / 86400000,
  );
}

/**
 * The feeling on a case, if it is one of the six he could mis-recall.
 *
 * A case stores whatever label the feeling ball carried, so this also quietly
 * guards against a case written by an older version of the app, or one whose
 * feeling was never filled in.
 */
function caseFeeling(c: Case): string | null {
  const f = c.feeling?.trim();
  if (!f) return null;
  const match = FEELING_LABELS.find((l) => l.toLowerCase() === f.toLowerCase());
  return match ?? null;
}

/** The line of their own he quotes back. Their sentence, untouched. */
function quotableLine(c: Case): string | null {
  const line = c.other?.trim() || c.story?.trim();
  if (!line) return null;
  // A quote he can't say in one breath isn't a quote, it's a reading. Long
  // answers are the good ones though, so this takes the opening rather than
  // dropping the case: a child recognises their own first clause instantly.
  if (line.length <= 120) return line;
  const cut = line.slice(0, 118);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 60 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

export interface ChirpyRecollection {
  /** The case's day, for `agoLabel` and for marking it used. */
  day: string;
  /** Their own words, verbatim. */
  quote: string;
  /** What they actually said they felt. */
  trueFeeling: string;
  /** What Chirpy thinks they said — always a neighbour, never the truth. */
  guess: string;
  /** The buttons to offer, true feeling and guess among them, in a fixed order. */
  options: string[];
}

/**
 * The one he'd bring up today, or null on the great majority of days.
 *
 * Deterministic within a day: the same case comes back if the hub re-renders
 * or the child navigates away and returns, because a memory that changed
 * every time you looked at it would be the opposite of the point.
 */
export function recollectionForToday(): ChirpyRecollection | null {
  const t = today();
  const mem = read();

  if (mem.last && daysBetween(mem.last, t) < REST_DAYS) return null;

  const used = new Set(mem.used ?? []);
  const eligible = loadCases().filter(
    (c) => !used.has(c.day) && daysBetween(c.day, t) >= MIN_AGE_DAYS && caseFeeling(c) && quotableLine(c),
  );
  if (!eligible.length) return null;

  // The oldest first — the further back it goes, the more it means that he
  // still has it.
  const c = eligible[eligible.length - 1];
  const trueFeeling = caseFeeling(c)!;
  const quote = quotableLine(c)!;

  const near = NEAR[trueFeeling] ?? [];
  // Same case, same day, same guess: seeded off the case's own date rather
  // than a random, so nothing shifts under the child mid-conversation.
  const seed = c.day.split('-').reduce((n, part) => n + Number(part), 0);
  const guess = near[seed % near.length];

  // The true one and the guess, plus one more so the answer isn't a coin
  // toss between two. Ordered by the canonical list so the buttons don't
  // shuffle themselves between renders.
  const extra = FEELING_LABELS.find((l) => l !== trueFeeling && l !== guess)!;
  const options = FEELING_LABELS.filter((l) => l === trueFeeling || l === guess || l === extra);

  return { day: c.day, quote, trueFeeling, guess, options: [...options] };
}

/** He asked. Whatever the child answered, this afternoon is spent. */
export function markAsked(day: string): void {
  const mem = read();
  const used = mem.used ?? [];
  if (!used.includes(day)) used.push(day);
  // Only ever as many as the case shelf itself keeps.
  write({ last: today(), used: used.slice(-40) });
}
