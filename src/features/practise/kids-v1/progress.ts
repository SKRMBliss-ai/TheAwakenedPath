/**
 * What this device remembers.
 *
 * ON-DEVICE ONLY, and deliberately so. BUILD_BRIEF §4 puts a hold on cloud
 * sync of session content until the founder settles the two blocking open
 * decisions in master plan §14 (privacy stance, safeguarding escalation), so
 * nothing here talks to Firebase, nothing is sent anywhere, and there is no
 * network call in this module at all. That hold is unchanged, and everything
 * below stays behind it — this file has never made a network call and still
 * doesn't.
 *
 * What IS now stored, as of check-in history: which games have been
 * finished and most recent per room; a tally of how many times each feeling
 * has been picked (`feelingCounts`, backing the pyramid's "you often feel
 * this" marker); and — the wider addition — a capped log of each check-in's
 * answers (`checkIns`): the feeling, which body zones were tapped, the
 * thought picked, the situation (a preset or the child's own free text), and
 * the "what else could be true" chosen. Capped at the most recent 20 and
 * kept local to this device; still nothing this file sends anywhere, and
 * still not a decision about whether that content should ever leave the
 * device — that question is still master plan §14's to answer.
 */

const KEY = 'mindgym.kidsv1.progress.v1';

/** One completed check-in's answers. */
export interface CheckInEntry {
  at: number;
  /** The routing hint derived from what was noticed, or null. */
  feeling: string | null;
  /**
   * Which Chirpy states felt familiar in the room — any number, possibly
   * none. Kept as state ids rather than emotion names, because that is
   * genuinely what happened: the child recognised something, they did not
   * declare an emotion.
   */
  chirpys: string[];
  bodyZones: string[];
  thought: string;
  situation: string;
  maybe: string;
}

const CHECKIN_LOG_LIMIT = 20;

export interface Progress {
  /** Game ids finished at least once. */
  played: string[];
  /** Last few game ids per room, newest last. */
  recent: Record<string, string[]>;
  /** How many times each feeling id has been picked at check-in. */
  feelingCounts: Record<string, number>;
  /** The most recent check-ins, oldest first, capped at CHECKIN_LOG_LIMIT. */
  checkIns: CheckInEntry[];
}

const EMPTY: Progress = { played: [], recent: {}, feelingCounts: {}, checkIns: [] };

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
      checkIns: Array.isArray(parsed.checkIns) ? parsed.checkIns : [],
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

/** Appends one finished check-in to the log, capped to the most recent
 *  CHECKIN_LOG_LIMIT entries. */
export function recordCheckIn(prev: Progress, entry: CheckInEntry): Progress {
  const next: Progress = {
    ...prev,
    checkIns: [...prev.checkIns, entry].slice(-CHECKIN_LOG_LIMIT),
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
