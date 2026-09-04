/**
 * What this device remembers.
 *
 * ON-DEVICE ONLY, and deliberately so. BUILD_BRIEF §4 puts a hold on cloud
 * sync of session content until the founder settles the two blocking open
 * decisions in master plan §14 (privacy stance, safeguarding escalation), so
 * nothing here talks to Firebase, nothing is sent anywhere, and there is no
 * network call in this module at all. That hold is unchanged.
 *
 * What is stored is otherwise still deliberately thin: WHICH games have been
 * finished, which were most recent per room, and — as of the check-in
 * pyramid's "where you usually are" marker — a plain tally of how many times
 * each feeling has been picked at check-in. No intensity, no body region, no
 * thought, no situation, no free text, and no timestamps: `feelingCounts` is
 * six numbers at most, incremented on pick, never a log of individual
 * check-ins. That is enough to say "you often feel worried" and nowhere near
 * enough to reconstruct what a child said on any particular day.
 *
 * If a future version needs real session history for the journal (SUP-02),
 * that is still the point to revisit §14 — this tally is a narrow, explicit
 * exception for one on-device feature, not a reopening of that question.
 */

const KEY = 'mindgym.kidsv1.progress.v1';

export interface Progress {
  /** Game ids finished at least once. */
  played: string[];
  /** Last few game ids per room, newest last. */
  recent: Record<string, string[]>;
  /** How many times each feeling id has been picked at check-in. */
  feelingCounts: Record<string, number>;
}

const EMPTY: Progress = { played: [], recent: {}, feelingCounts: {} };

export function loadProgress(): Progress {
  if (typeof window === 'undefined') return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<Progress>;
    return {
      played: Array.isArray(parsed.played) ? parsed.played : [],
      recent: parsed.recent && typeof parsed.recent === 'object' ? parsed.recent : {},
      feelingCounts: parsed.feelingCounts && typeof parsed.feelingCounts === 'object' ? parsed.feelingCounts : {},
    };
  } catch {
    // A private window, cleared site data, or a browser blocking storage.
    // None of those are errors worth surfacing to a child — start fresh.
    return EMPTY;
  }
}

export function recordPlayed(prev: Progress, roomId: string, gameId: string): Progress {
  const next: Progress = {
    ...prev,
    played: prev.played.includes(gameId) ? prev.played : [...prev.played, gameId],
    recent: { ...prev.recent, [roomId]: [...(prev.recent[roomId] ?? []), gameId].slice(-3) },
  };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch { /* storage unavailable — the session still works, it just forgets */ }
  return next;
}

/** Tallies one more pick of `feelingId`. Called once per real feeling picked
 *  at check-in — never for "I don't know", which isn't a feeling to count. */
export function recordFeeling(prev: Progress, feelingId: string): Progress {
  const next: Progress = {
    ...prev,
    feelingCounts: { ...prev.feelingCounts, [feelingId]: (prev.feelingCounts[feelingId] ?? 0) + 1 },
  };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch { /* storage unavailable — the session still works, it just forgets */ }
  return next;
}

/**
 * The feeling this child picks most often, or null if there isn't a clear
 * one yet. Requires at least two picks of the same feeling before it's
 * called "usual" — one check-in is a data point, not a pattern, and a child
 * shouldn't see a "you often feel this" label after their very first visit.
 */
export function mostFrequentFeeling(progress: Progress): string | null {
  let bestId: string | null = null;
  let bestCount = 0;
  for (const [id, count] of Object.entries(progress.feelingCounts)) {
    if (count > bestCount) {
      bestId = id;
      bestCount = count;
    }
  }
  return bestCount >= 2 ? bestId : null;
}
