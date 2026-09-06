/**
 * THE OTHER CHILDREN, SENSED AND NEVER MET.
 *
 * This app is on-device and solitary by design, and mostly that is right —
 * nothing a child says here leaves the phone. But a six-year-old ticking a
 * firefly alone every night for a year is missing something real, and the
 * model that solves it without ever putting children in contact is the one
 * Journey and Sky use: you feel that others are out there, and you never meet
 * one. "Four hundred other children caught one tonight." No names, no
 * comparison, no leaderboard, nothing to beat, nobody to be behind.
 *
 * THIS FILE IS INERT UNTIL A SERVER EXISTS, and that is deliberate.
 *
 * The app has no backend. Making the number up would be trivial and is the
 * one thing this must never do: a fabricated "437 children" shown to a child
 * is a lie told to a six-year-old about not being alone, and it would be a
 * lie every single night. There is no version of that which is acceptable, so
 * with no endpoint configured this reports nothing and the hub shows nothing.
 *
 * TO TURN IT ON: set VITE_OTHERS_ENDPOINT to a URL returning
 * `{ "count": <number> }` — the count of children who caught at least one
 * firefly today. The endpoint should receive NOTHING identifying: no id, no
 * name, no payload at all beyond the fact of a request. A count is the whole
 * contract, and it is deliberately the least data that could possibly make
 * the feature work.
 *
 * The number is also floored before it is shown, so a quiet night can never
 * tell a child that almost nobody else came.
 */

const ENDPOINT = import.meta.env.VITE_OTHERS_ENDPOINT as string | undefined;

/**
 * Below this, say nothing at all rather than a small number. "Three other
 * children were here tonight" is a lonelier sentence than silence, and on a
 * new or quiet install it would be the usual one.
 */
const FLOOR = 25;

const KEY = 'mindgym.kidsv1.others';

interface Cached {
  day: string;
  count: number;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * How many other children caught one today, or null — which is what it
 * returns whenever there is no endpoint, the request fails, the shape is
 * wrong, or the number is below the floor.
 *
 * Cached per day so the hub asks once rather than on every mount, and so a
 * child who loses signal mid-evening keeps the number they already saw
 * instead of watching it vanish.
 */
export async function othersToday(): Promise<number | null> {
  if (!ENDPOINT) return null;

  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const c = JSON.parse(raw) as Cached;
      if (c.day === today() && typeof c.count === 'number') {
        return c.count >= FLOOR ? c.count : null;
      }
    }
  } catch { /* fall through and ask */ }

  try {
    const res = await fetch(ENDPOINT, { method: 'GET' });
    if (!res.ok) return null;
    const body: unknown = await res.json();
    const count = (body as { count?: unknown })?.count;
    if (typeof count !== 'number' || !Number.isFinite(count) || count < 0) return null;

    try { localStorage.setItem(KEY, JSON.stringify({ day: today(), count } satisfies Cached)); } catch { /* ignore */ }
    return count >= FLOOR ? count : null;
  } catch {
    // Offline, blocked, timed out. The gym is simply quiet, which is exactly
    // what it was before this feature existed.
    return null;
  }
}
