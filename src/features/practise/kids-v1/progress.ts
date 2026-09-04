/**
 * What this device remembers.
 *
 * ON-DEVICE ONLY, and deliberately so. BUILD_BRIEF §4 puts a hold on cloud
 * sync of session content until the founder settles the two blocking open
 * decisions in master plan §14 (privacy stance, safeguarding escalation), so
 * nothing here talks to Firebase, nothing is sent anywhere, and there is no
 * network call in this module at all.
 *
 * What is stored is also deliberately thin: WHICH games have been finished,
 * and which were most recent per room. That is enough to mark a card "new"
 * and to stop "pick one for me" repeating itself — and it is not enough to
 * reconstruct anything a child said. No feeling, no intensity, no body
 * region, no thought, no situation, no free text. Those exist for the length
 * of the screen that asks for them and are then gone.
 *
 * If a future version needs session history for the journal (SUP-02), that
 * is the point to revisit §14 — not to quietly widen this file.
 */

const KEY = 'mindgym.kidsv1.progress.v1';

export interface Progress {
  /** Game ids finished at least once. */
  played: string[];
  /** Last few game ids per room, newest last. */
  recent: Record<string, string[]>;
}

const EMPTY: Progress = { played: [], recent: {} };

export function loadProgress(): Progress {
  if (typeof window === 'undefined') return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<Progress>;
    return {
      played: Array.isArray(parsed.played) ? parsed.played : [],
      recent: parsed.recent && typeof parsed.recent === 'object' ? parsed.recent : {},
    };
  } catch {
    // A private window, cleared site data, or a browser blocking storage.
    // None of those are errors worth surfacing to a child — start fresh.
    return EMPTY;
  }
}

export function recordPlayed(prev: Progress, roomId: string, gameId: string): Progress {
  const next: Progress = {
    played: prev.played.includes(gameId) ? prev.played : [...prev.played, gameId],
    recent: { ...prev.recent, [roomId]: [...(prev.recent[roomId] ?? []), gameId].slice(-3) },
  };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch { /* storage unavailable — the session still works, it just forgets */ }
  return next;
}
