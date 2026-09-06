/**
 * WHAT THE CHILD HAS DECIDED TO SHOW SOMEBODY.
 *
 * A grown-up can now leave a note (kit/notes), and that traffic only went one
 * way. This is the return direction, and it is the more important half.
 *
 * The obvious build is a parent dashboard: let the adult see the cases, the
 * feelings, the month. This app deliberately doesn't have one, and shouldn't —
 * a child who suspects their answers are being read will start writing answers
 * to be read, and the whole thing becomes theatre. But the alternative on
 * offer until now was nothing at all, which is its own loss: a six-year-old
 * who has worked out something true about a bad afternoon often WANTS to tell
 * someone, and had no way to.
 *
 * So the child does the showing. One item at a time, chosen on purpose, and
 * takeable back — the grown-up's view contains exactly what was handed to
 * them and nothing else, ever.
 *
 * WHY IT'S WORTH MORE THAN THE FEATURE IT REPLACES: a dashboard teaches a
 * child that the inside of their head is available to adults by default. This
 * teaches them it is theirs, and that handing someone a piece of it is a
 * thing they choose and can stop choosing. That is a better lesson than any
 * exercise in the app, and they learn it by using the app rather than by
 * being told.
 *
 * TAKING IT BACK IS SILENT AND COMPLETE. No "Shaarav has withdrawn this", no
 * trace left in the grown-up's view, no notification. A right to un-share
 * that leaves a mark isn't one, and a child who finds out it left a mark will
 * never share anything again.
 */

const KEY = 'mindgym.kidsv1.shown';

function read(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    const v = raw ? JSON.parse(raw) : [];
    return Array.isArray(v) ? (v as string[]) : [];
  } catch { return []; }
}

function write(ids: string[]): void {
  try { localStorage.setItem(KEY, JSON.stringify(ids)); } catch { /* storage off */ }
}

export function shownIds(): Set<string> {
  return new Set(read());
}

export function isShown(id: string): boolean {
  return read().includes(id);
}

/** Hands one over, or takes it back. Returns where it ended up. */
export function toggleShown(id: string): boolean {
  const ids = read();
  const at = ids.indexOf(id);
  if (at >= 0) {
    ids.splice(at, 1);
    write(ids);
    return false;
  }
  ids.push(id);
  write(ids);
  return true;
}
