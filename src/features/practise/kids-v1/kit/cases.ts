/**
 * THE CASES A CHILD HAS WORKED.
 *
 * The deep dive used to end `onFinish={back}` — five answers, the hardest
 * thinking in the app, thrown away the moment the child stood up. The
 * Observatory counted how many times they had done it and never once showed
 * them a word they had said.
 *
 * That is backwards. A single walk teaches a child to catch one story; it is
 * seeing three of their own, weeks apart, that teaches them they HAVE a
 * pattern — and no single session can deliver that. The material has to
 * survive.
 *
 * Kept on the device and nowhere else. It is the most private thing this app
 * touches, and it does not leave: no server, no account, no sync. Emptied by
 * clearing site data, like everything else here.
 */

export interface Case {
  /** Story Lab keeps the initial thought separately from the child's story. */
  thought?: string;
  sessionId?: string;
  /**
   * Stable across deletions, unlike a position in this array.
   *
   * Added when the child gained the ability to SHOW one of these to a
   * grown-up (see kit/shown): a share pinned to "the third case" silently
   * becomes a share of somebody else's afternoon the moment an earlier one
   * is deleted, which is the worst bug this feature could have. Optional
   * only because cases written before it existed have none; loadCases
   * backfills them.
   */
  id?: string;
  /** ISO day, so the shelf can say "three weeks ago" without storing a clock. */
  day: string;
  feeling?: string;
  body?: string[];
  /** What their mind said. */
  story?: string;
  /** What their eyes actually saw. */
  eyes?: string;
  /** The other story they found. This is the one worth coming back for. */
  other?: string;
  /** Their drawing of it, as a data URL, when they made one. */
  drawing?: string;
}

const KEY = 'mindgym.kidsv1.cases';
/** Enough to see a pattern, few enough not to bloat storage. */
const KEEP = 40;

/**
 * Above this many characters, a drawing is dropped rather than risking the
 * case that holds it — roughly 165KB decoded, well above what the drawing
 * canvas ordinarily produces (a modest, dpr-capped PNG of simple line art).
 * The case's WORDS are the precious thing here; losing an oversized drawing
 * to stay under quota costs far less than losing everything, which is what
 * a failed localStorage write would otherwise do.
 */
const MAX_DRAWING_CHARS = 220_000;

export function saveCase(c: Omit<Case, 'day'>): boolean {
  // A walk where nothing was said is not a case. Half-finished ones are
  // dropped rather than shelved: a child looking back should find things
  // they actually worked out, not a list of times they wandered off.
  if (!c.feeling && !c.story) return false;

  const existing = loadCases();
  const previous = c.sessionId ? existing.find(old => old.sessionId === c.sessionId) : undefined;
  // Revising a journey must preserve its identity for pinned grown-up shares.
  const entry: Case = { ...c, id: previous?.id ?? newCaseId(), day: previous?.day ?? new Date().toISOString().slice(0, 10) };
  if (entry.drawing && entry.drawing.length > MAX_DRAWING_CHARS) {
    delete entry.drawing;
  }

  const all = [entry, ...existing.filter(old => !c.sessionId || old.sessionId !== c.sessionId)].slice(0, KEEP);
  if (writeCases(all)) return true;

  // The write failed even after capping this drawing — most likely because
  // older cases' own drawings have accumulated toward the quota over weeks
  // of use. Strip every drawing but the one just made and try once more: a
  // child would miss TODAY's words and picture first, so those are what
  // survive if anything has to give.
  return writeCases(all.map((x, i) => (i === 0 ? x : { ...x, drawing: undefined })));
}

function writeCases(all: Case[]): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
    return true;
  } catch { return false; } // storage off, or full even after stripping — the walk still happened
}

/**
 * Removes just the DRAWING from one case, by its position in loadCases()'s
 * newest-first order — not the case itself. The Observatory's doodle wall
 * is a gallery of pictures, and clearing one out of it is a tidying-up
 * action, not a "this never happened" one; the words that case holds (what
 * their mind said, what they found instead) are the point of the whole
 * feature and stay exactly where they are, in the case shelf, whether or
 * not a picture ever sat next to them.
 *
 * Returns the updated list so the caller can put it straight into state
 * without a second read of localStorage.
 */
export function deleteDrawingAt(index: number): Case[] {
  const all = loadCases();
  if (all[index]?.drawing) delete all[index].drawing;
  writeCases(all);
  return all;
}

/**
 * Removes one whole case — the words as well as the picture.
 *
 * A child is allowed to throw their own thinking away. This shelf is the
 * most private thing the app keeps, and a private record you cannot delete
 * is not really yours; the alternative (keep everything forever, hide the
 * old ones) is the app deciding what a child is allowed to have finished
 * with. The two-tap arming on the button is what stops it happening by
 * accident, since unlike every other action here this one cannot be undone
 * by tapping again.
 */
export function deleteCaseAt(index: number): Case[] {
  const all = loadCases();
  if (index < 0 || index >= all.length) return all;
  all.splice(index, 1);
  writeCases(all);
  return all;
}

function newCaseId(): string {
  return `c-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function loadCases(): Case[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const v = JSON.parse(raw);
    if (!Array.isArray(v)) return [];
    const all = v as Case[];

    // Backfill ids for cases written before they existed, once, and keep
    // them — an id that regenerated on every read would be no more stable
    // than the array position it replaced.
    if (all.some((c) => !c.id)) {
      for (const c of all) if (!c.id) c.id = newCaseId();
      writeCases(all);
    }
    return all;
  } catch { return []; }
}

/**
 * "Three weeks ago." Children do not read dates, and "2026-08-15" tells them
 * nothing at all — the distance is the part that means something.
 */
export function agoLabel(day: string): string {
  const then = new Date(day + 'T00:00:00');
  const now = new Date(new Date().toISOString().slice(0, 10) + 'T00:00:00');
  const days = Math.round((now.getTime() - then.getTime()) / 86400000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  const weeks = Math.round(days / 7);
  if (weeks === 1) return 'a week ago';
  if (weeks < 5) return `${weeks} weeks ago`;
  const months = Math.round(days / 30);
  return months === 1 ? 'a month ago' : `${months} months ago`;
}
