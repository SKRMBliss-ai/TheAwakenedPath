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

/* ── Fireflies let go ────────────────────────────────────────────────────
 *
 * THE ONE THING IN THIS APP A CHILD GIVES AWAY.
 *
 * Both jars only ever fill. That is right — nothing here is ever taken back —
 * but it does mean the only verb a child has for their own collection is
 * "get more of", and a hoard you can only add to teaches hoarding. So: at the
 * Observatory they can open the lid and let some go, and the ones they let go
 * become lights in the gym's own sky, permanently.
 *
 * NOTHING IS LOST BY DOING IT, and that is not a softening — it is the whole
 * design. The lifetime total does not go down; letting go costs nothing and
 * buys nothing. What changes is the sky, which is the shared part of the
 * place rather than the private hoard, and which now has something in it that
 * the child chose to put there. Generosity that costs you something is a
 * trade; this is a gift, which is a different lesson and the one worth
 * teaching at six.
 *
 * The count can never exceed the lifetime total — you can only let go of a
 * firefly you actually caught — so the sky fills at exactly the pace the jar
 * does, but only as far as the child decides to carry it.
 */

const RELEASED_KEY = 'mindgym.kidsv1.released';

export function releasedCount(): number {
  try {
    const n = Number(localStorage.getItem(RELEASED_KEY));
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
  } catch { return 0; }
}

/** How many are still in the jar, unreleased. Never negative, even if a
 *  stored count somehow outruns the total (a cleared history, say). */
export function stillHeld(lifetimeTotal: number): number {
  return Math.max(0, lifetimeTotal - releasedCount());
}

/**
 * Lets `n` go, never more than are actually held. Returns the new released
 * total so the caller can animate exactly the number that left.
 */
export function release(n: number, lifetimeTotal: number): number {
  const going = Math.max(0, Math.min(n, stillHeld(lifetimeTotal)));
  const next = releasedCount() + going;
  try { localStorage.setItem(RELEASED_KEY, String(next)); } catch { /* storage off — the gesture still happened */ }
  return next;
}
