import { BEHAVIOURS } from '../../../kids/data';

/**
 * SEASONS — the only thing in this app that ever ends.
 *
 * Everything here is infinite. The same seven rooms, the same question, for
 * as many years as a child keeps opening it. Which is right for the core loop
 * and wrong for everything around it: a story with no third act is not a story,
 * it's a treadmill, and the reason children re-read books and re-watch films
 * is that things CONCLUDE. The month review was the nearest thing to a curtain
 * and it is a form with four textareas.
 *
 * So roughly every three months, a season closes. The child gets one screen
 * that says so, in a light the app never otherwise uses, with a handful of
 * true facts about the season just gone. Chirpy says a thing he only says
 * then. And then the next one starts.
 *
 * NOTHING RESETS AT A SEASON BOUNDARY, and this is the part that has to be
 * got right. Not the fireflies, not the sky, not the shelf, not the drawings
 * on the walls, not the points. A season is a bookmark, not a wipe — the
 * instant a child suspects that turning a page costs them something, the
 * ending becomes a threat and they will dread it instead of enjoying it.
 *
 * IT IS NOT A REWARD AND HAS NO GRADE. There is no "you did well this
 * season", no comparison to the last one, nothing unlocked. It says what
 * happened and closes. An ending that hands out a mark is a report card with
 * bunting on it.
 *
 * THE FACTS ARE COUNTED FROM THE REAL RECORD each time rather than tallied as
 * they happen, so a keepsake can never drift from what the grid actually says
 * — and a child who fills in a past day weeks later gets a season that
 * quietly agrees with itself.
 */

const KEY = 'mindgym.kidsv1.seasons';

/** About three months. Long enough that an ending means something, short
 *  enough that a seven-year-old reaches one while still caring. */
const SEASON_DAYS = 90;

export interface Keepsake {
  /** 1, 2, 3… so a child can say "in my second one". */
  n: number;
  /** ISO days, inclusive. */
  from: string;
  to: string;
  /** Fireflies caught across it — one per virtue per day ticked. */
  fireflies: number;
  /** Days they came at all. */
  days: number;
  /** The virtue done on the most days, only when one is genuinely ahead. */
  mostDone?: string;
}

interface Seasons {
  /** ISO day the current season began. */
  startedOn?: string;
  /** Every season already closed, oldest first. */
  past?: Keepsake[];
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string): number {
  return Math.round(
    (new Date(b + 'T00:00:00').getTime() - new Date(a + 'T00:00:00').getTime()) / 86400000,
  );
}

function read(): Seasons {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Seasons) : {};
  } catch { return {}; }
}

function write(s: Seasons): void {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* storage off — no seasons, no harm */ }
}

export function pastSeasons(): Keepsake[] {
  return read().past ?? [];
}

/**
 * Counts what actually happened between two days, from the completions record
 * itself. See the note above on why this is recounted rather than accumulated.
 */
function tally(
  completions: Record<string, Record<string, boolean>>,
  from: string,
  to: string,
): Omit<Keepsake, 'n' | 'from' | 'to'> {
  const inRange = Object.keys(completions).filter((d) => d >= from && d <= to);
  const days = inRange.filter((d) => Object.values(completions[d] ?? {}).some(Boolean)).length;

  const per = BEHAVIOURS.map((b) => ({
    id: b.id,
    title: b.title,
    n: inRange.filter((d) => completions[d]?.[b.id]).length,
  })).sort((a, b) => b.n - a.n);

  const fireflies = per.reduce((n, v) => n + v.n, 0);

  // Same rule as the Observatory's one sentence: only claim a favourite when
  // one is genuinely clear, never on a single day's margin.
  const [first, second] = per;
  const mostDone = first && second && first.n - second.n >= 3 && first.n > 0 ? first.title : undefined;

  return { fireflies, days, mostDone };
}

/**
 * The season that just ended, or null — which is almost always.
 *
 * READ-ONLY: the season isn't actually turned over until the child has seen
 * the closing screen, so an app opened and closed in the hallway can't skip
 * the one moment the whole feature exists for. See `closeSeason`.
 */
export function seasonJustEnded(
  completions: Record<string, Record<string, boolean>>,
): Keepsake | null {
  const s = read();
  const t = today();

  // First ever run — start the clock, show nothing.
  if (!s.startedOn) { write({ ...s, startedOn: t }); return null; }
  if (daysBetween(s.startedOn, t) < SEASON_DAYS) return null;

  const to = t;
  const n = (s.past?.length ?? 0) + 1;
  return { n, from: s.startedOn, to, ...tally(completions, s.startedOn, to) };
}

/** The child has seen it. Files the keepsake and starts the next season. */
export function closeSeason(k: Keepsake): void {
  const s = read();
  write({ startedOn: today(), past: [...(s.past ?? []), k] });
}
