/**
 * THE SKY — what replaced the streak.
 *
 * A streak punishes a child for the days they were too sad to open the app,
 * which are the exact days the app exists for. Miss one and something you
 * built gets taken away; that is a guilt mechanic wearing a friendly hat,
 * and it contradicts the rule this whole feature is built on (§2.4: nothing
 * is ever marked right or wrong).
 *
 * So: one star per day the child comes. It only ever grows. Come every day
 * for a month and the sky fills; come once a fortnight and it still fills,
 * slower, and nothing is ever removed or reset. Same warmth, no shame, and
 * no number telling a child how they are doing at having feelings.
 *
 * Days rather than visits, deliberately — otherwise a child learns they can
 * farm stars by leaving and coming back, which turns the sky into the
 * scoreboard it was meant to replace.
 */

const KEY = 'mindgym.kidsv1.sky';

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function read(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const v = JSON.parse(raw);
    return Array.isArray(v) ? (v as string[]) : [];
  } catch { return []; }
}

/** Records that the child came today. Returns the number of stars they have. */
export function markVisit(): number {
  const days = read();
  const t = today();
  if (!days.includes(t)) {
    days.push(t);
    try { localStorage.setItem(KEY, JSON.stringify(days)); } catch { /* ignore */ }
  }
  return days.length;
}

export function starCount(): number {
  return read().length;
}

/** True the first time a given day is recorded — the star arrives once. */
export function isNewStarToday(): boolean {
  return !read().includes(today());
}
