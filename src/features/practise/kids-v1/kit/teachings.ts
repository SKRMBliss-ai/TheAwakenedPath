/**
 * THE TEACHING MOVES.
 *
 * Eighteen of them, lifted from the founder's own teaching-moves document —
 * it is in the repo twice, as docs/source-material/kidstech.md and as
 * …/kit/reference/MIND_GYM_TEACHING_MOVES.md, and the two are the same
 * eighteen sections. That document is the reason this file reads the way it
 * does. Its rule: never explain an inner experience to a child, build a
 * moment where they catch it happening. So almost nothing in here is a
 * statement. Most of it is an instruction that fails on purpose.
 *
 * WHY THIS EXISTS AT ALL. The hub had one thing to say on an ordinary evening
 * and it said it every single time the screen mounted — the same clue, all
 * night, because the clue was only recorded when a child pressed Okay and
 * children do not press Okay. A line written to be quietly unsettling turned
 * into the app's catchphrase. That bug is fixed in ChirpyArc; this is the
 * other half of it, which is that one line was never enough material for a
 * screen a child lands on several times a day.
 *
 * THE THREE SHAPES, from the document:
 *
 *   trapdoor    An instruction that cannot be followed. Try not to laugh.
 *               Don't think about a purple elephant. The failure is the
 *               lesson, and children love being caught out by something true.
 *   experiment  Something the child does that proves the point by what
 *               happens. They are the evidence, so there is nothing to take
 *               on trust.
 *   image       A thing already in their life that has the right shape. No
 *               new understanding needed — just recognition.
 *
 * WHAT IS DELIBERATELY MISSING: the moral. Every one of these stops before
 * "and that shows us that…", because the instant you add it you have turned a
 * discovery into a lesson and lost them. Several of these lines will read as
 * unfinished to an adult. They are meant to.
 *
 * NONE OF IT RUNS WHEN A CHILD IS STRUGGLING. hubMoment returns before it
 * reaches this in the quiet state, which is the document's §18: teaching needs
 * a settled child, and an upset one needs company rather than curriculum.
 */

const KEY = 'mindgym.kidsv1.teachings';

import { band, type Band } from './band';
// Parsed from MIND_GYM_TEACHING_MOVES.md at build time — see vite.config.ts.
import { TEACHINGS as DOC_TEACHINGS, ASIDES as DOC_ASIDES } from 'virtual:teaching-moves';

export type TeachingKind = 'trapdoor' | 'experiment' | 'image';

export interface Teaching {
  id: string;
  kind: TeachingKind;
  /**
   * Which band the document wrote this one for. Absent means it says "both
   * bands", or says nothing, and it goes to everybody.
   *
   * This is not a suggestion. §16 needs several years of remembering other
   * people's lives to work at all, and §7's blue cup is addressed to somebody
   * who has recently stopped being a toddler — handed to the wrong child,
   * each of them simply fails. See kit/band.
   */
  band?: Band;
  /** How he opens it. One or two lines, his own voice. */
  open: string[];
  /**
   * The thing to actually do, held on screen while they do it. Absent on a
   * borrowed image, which asks for nothing and is just a thing he says.
   */
  dare?: string;
  /** What the button says before they start. */
  go?: string;
  /** Seconds of quiet while it happens. */
  hold?: number;
  /**
   * A trapdoor that needs the child's own answer before it opens.
   *
   * Only one move works this way and it is the one the document rates
   * highest: a child is asked what they'd say to a friend who called
   * themselves stupid, gives their kindest answer, and is then told the
   * thought was theirs. It only lands because the answer was given BEFORE
   * they knew who it was about — which is also why the replies here are all
   * warm. There is no unkind option to pick, because the point is not what
   * the child chooses, it is that they are already kind and have never once
   * aimed it at themselves.
   */
  pick?: { ask: string; replies: string[] };
  /** The payoff, a line at a time. */
  land: string[];
}

/**
 * The library, READ OUT OF THE DOCUMENT.
 *
 * These eighteen used to be hand-transcribed objects sitting right here, which
 * made MIND_GYM_TEACHING_MOVES.md something somebody had copied FROM once. The
 * founder edits the document, the app carries on saying the old words, and
 * nothing anywhere reports the drift — and adding a nineteenth move meant
 * editing TypeScript, which is the wrong skill to need.
 *
 * So the document is the source now. `virtual:teaching-moves` is the Vite
 * plugin in vite.config.ts: it parses the markdown at load, hot-reloads the dev
 * server when the file is saved, and FAILS THE BUILD on a section it cannot
 * read — because a move the founder has written and believes is live, that no
 * child ever meets, is the one failure worth being loud about.
 *
 * Write a new `## 19 · …` with a `### The move` under it and Chirpy starts
 * saying it. Nothing here needs touching.
 *
 * ORDER IS NOT IMPORTANCE — it is the document's order, and the rotation below
 * ignores it anyway.
 */
export const TEACHINGS: Teaching[] = DOC_TEACHINGS;

/**
 * §18, which is not a move and must never be rotated in as one.
 *
 * "When a child arrives already upset, none of the above applies." The lines
 * under it are what to say INSTEAD of teaching — short, undemanding, and the
 * most important in the document. They are here so the file that owns the
 * teaching also owns the rule that switches it off.
 */
export const COMFORT_LINES: string[] =
  DOC_ASIDES.find((a) => a.number === 18)?.lines ?? [];

interface Store {
  /** Ids already met, in the order they were met. */
  seen?: string[];
  /** ISO day of the last one, so it's one a day rather than one a landing. */
  last?: string;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function read(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Store) : {};
  } catch { return {}; }
}

function write(s: Store): void {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* storage off — he improvises */ }
}

/**
 * A small, stable number from a string.
 *
 * The pick has to be the SAME all day and different tomorrow, which rules out
 * Math.random: this is read on every mount of the hub, and a child who walks
 * into a room and comes back out would otherwise find Chirpy halfway through
 * a different experiment. Hashing the date gives a choice that is fixed for
 * the day, moves on its own overnight, and needs nothing written down.
 */
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/**
 * Today's move, or null.
 *
 * READ-ONLY, like arcBeatForToday and for the same reason — nothing is
 * recorded until a child has actually reached the end of one.
 *
 * ONE A DAY. Not one a landing: the whole complaint this file answers is a
 * hub that repeated itself every time it mounted, and a teaching library that
 * handed out a fresh experiment on every visit would be the same mistake
 * wearing better clothes. Come back four times tonight and Chirpy has nothing
 * new, which is correct — he already said his thing.
 *
 * WHEN THE LIBRARY RUNS DRY it starts again rather than going silent. A couple
 * of weeks of evenings is a long way from the last time a child met the purple elephant,
 * and every one of these is an experiment rather than a fact — running it
 * again is the point of it, not a repeat of it.
 */
export function teachingForToday(): Teaching | null {
  const s = read();
  const t = today();
  if (s.last === t) return null;

  /*
    ONLY WHAT THIS CHILD'S BAND CAN ACTUALLY USE.

    An unbanded move goes to everybody; a banded one goes only to its own
    band. And when the age is unknown — a child declined to say, or storage is
    off — the banded moves are all held back rather than guessed at. That
    leaves eight genuinely universal ones, which is a smaller library but not
    a worse one: every single move in it is something the document marked as
    working at any age. Guessing would eventually hand a five-year-old §16.
  */
  const b = band();
  const forMe = TEACHINGS.filter((x) => !x.band || x.band === b);

  const seen = s.seen ?? [];
  const unseen = forMe.filter((x) => !seen.includes(x.id));
  const pool = unseen.length ? unseen : forMe;
  if (!pool.length) return null;
  return pool[hash(t) % pool.length];
}

/** They got to the end of one. He doesn't do it again. */
export function teachingShown(id: string): void {
  const s = read();
  const seen = s.seen ?? [];
  const next = seen.includes(id) ? seen : [...seen, id];

  /*
    A full pass empties the list rather than growing it forever — see the note
    above on why the library restarts instead of falling silent.

    MEASURED AGAINST THIS CHILD'S OWN POOL, not against all of TEACHINGS. A
    nine-year-old is never offered the ten moves written for the other band,
    so waiting for eighteen ids to accumulate would mean the list never resets
    and `unseen` is empty forever after the fourteenth — which still works,
    because of the fallback in teachingForToday, but grows a dead array in
    storage for the lifetime of the install.
  */
  const b = band();
  const mine = TEACHINGS.filter((x) => !x.band || x.band === b);
  write({ seen: next.length >= mine.length ? [] : next, last: today() });
}
