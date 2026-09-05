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

export function saveCase(c: Omit<Case, 'day'>): void {
  // A walk where nothing was said is not a case. Half-finished ones are
  // dropped rather than shelved: a child looking back should find things
  // they actually worked out, not a list of times they wandered off.
  if (!c.feeling && !c.story) return;
  try {
    const all = loadCases();
    all.unshift({ ...c, day: new Date().toISOString().slice(0, 10) });
    localStorage.setItem(KEY, JSON.stringify(all.slice(0, KEEP)));
  } catch { /* storage off — the walk still happened, it just isn't kept */ }
}

export function loadCases(): Case[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const v = JSON.parse(raw);
    return Array.isArray(v) ? (v as Case[]) : [];
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
