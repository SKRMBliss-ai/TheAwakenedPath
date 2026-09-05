/**
 * WHAT THE CHILD SAID THEY WERE FEELING TODAY.
 *
 * Named once, in the Feelings Room, and then it comes with them: into the
 * virtue rooms, into the games, into the reflection. A feeling that only
 * exists on the screen where you named it is a form to fill in. One that
 * follows you around the building is a companion.
 *
 * Scoped to the day on purpose. Yesterday's sad does not get to walk into
 * today — a child who arrives cheerful should not be met by the version of
 * themselves that arrived upset, which is exactly the kind of quiet label
 * this app exists not to apply.
 *
 * Where he stands is remembered separately and NOT scoped to the day: a
 * child who parks him in the bottom-left corner means it, and having to
 * move him again every morning would be the app forgetting something they
 * bothered to tell it.
 */

const FEELING_KEY = 'mindgym.kidsv1.feelingToday';
const PERCH_KEY = 'mindgym.kidsv1.feelingPerch';

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function setTodaysFeeling(id: string) {
  try {
    localStorage.setItem(FEELING_KEY, JSON.stringify({ day: today(), id }));
  } catch { /* private browsing, storage off — the companion just won't follow */ }
}

export function todaysFeeling(): string | null {
  try {
    const raw = localStorage.getItem(FEELING_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as { day?: string; id?: string };
    return v.day === today() && v.id ? v.id : null;
  } catch { return null; }
}

/** Where the child last put him, as a fraction of the viewport. */
export interface Perch { x: number; y: number }

export function savePerch(p: Perch) {
  try { localStorage.setItem(PERCH_KEY, JSON.stringify(p)); } catch { /* ignore */ }
}

export function loadPerch(): Perch | null {
  try {
    const raw = localStorage.getItem(PERCH_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as Perch;
    return typeof v?.x === 'number' && typeof v?.y === 'number' ? v : null;
  } catch { return null; }
}
