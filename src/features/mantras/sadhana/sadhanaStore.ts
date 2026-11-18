// ─────────────────────────────────────────────────────────────────────────────
// Sadhana store — the practice record behind the mala counter and the sankalp
// tracker in the in-app Mantras library.
//
// What is stored (on this device only, in localStorage, per signed-in account):
//   reps[YYYY-MM-DD][mantraSlug] = repetitions chanted that day
//   malaTarget                   = repetitions in one mala (11, 21, 27, 54, 108)
//   sankalp                      = one active vow: a mantra, a number of days,
//                                  a daily target and a start date
//   lastSlug                     = the mantra the counter is showing
//
// Everything about a sankalp is derived from `reps`, so there is no second copy
// to drift out of sync: a day counts as done when that day's reps for the vow's
// mantra reach the vow's daily target.
//
// Dates are LOCAL calendar days, because "today's practice" means the person's
// own day, not UTC's.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useMemo, useState } from 'react';

export const MALA_OPTIONS = [11, 21, 27, 54, 108] as const;
export const SANKALP_LENGTHS = [21, 40] as const;

/** Whole songs (aartis), not repeated mantras: they are listed together and never counted. */
const AARTI_SLUGS = new Set(['ganesha-aarti', 'tulsi-aarti', 'saraswati-mantra']);
export const isAarti = (slug: string) => AARTI_SLUGS.has(slug);

export interface Sankalp {
  slug: string;
  days: number;
  /** Repetitions needed on a day for that day to count. */
  daily: number;
  /** Local date the vow began (YYYY-MM-DD). */
  start: string;
}

export interface SadhanaState {
  v: 1;
  reps: Record<string, Record<string, number>>;
  malaTarget: number;
  sankalp: Sankalp | null;
  lastSlug: string | null;
}

const EMPTY: SadhanaState = { v: 1, reps: {}, malaTarget: 108, sankalp: null, lastSlug: null };

// ── Dates ────────────────────────────────────────────────────────────────────
const pad = (n: number) => String(n).padStart(2, '0');
export const dateKey = (d: Date = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export function addDays(key: string, n: number): string {
  const [y, m, d] = key.split('-').map(Number);
  const dt = new Date(y, m - 1, d + n);
  return dateKey(dt);
}

// ── Pure helpers (exported so they can be tested without React) ─────────────
export function repsOn(state: SadhanaState, key: string, slug: string): number {
  return state.reps[key]?.[slug] ?? 0;
}

/** Add `n` repetitions of `slug` on day `key`. Returns a new state. */
export function addReps(state: SadhanaState, slug: string, n: number, key: string = dateKey()): SadhanaState {
  if (n <= 0) return state;
  const day = { ...(state.reps[key] ?? {}) };
  day[slug] = (day[slug] ?? 0) + n;
  return { ...state, reps: { ...state.reps, [key]: day }, lastSlug: slug };
}

/** Remove today's count for one mantra (the "start this mala again" control). */
export function clearDay(state: SadhanaState, slug: string, key: string = dateKey()): SadhanaState {
  const day = { ...(state.reps[key] ?? {}) };
  delete day[slug];
  return { ...state, reps: { ...state.reps, [key]: day } };
}

export interface SankalpProgress {
  /** Days the vow's daily target was met, counted from the start date. */
  doneDays: number;
  /** One entry per calendar day since the start (capped at the vow's length). */
  cells: { key: string; state: 'done' | 'missed' | 'today' | 'upcoming'; reps: number }[];
  /** Consecutive completed days ending today, or yesterday if today is not done yet. */
  streak: number;
  todayReps: number;
  todayDone: boolean;
  complete: boolean;
}

export function sankalpProgress(state: SadhanaState, today: string = dateKey()): SankalpProgress | null {
  const s = state.sankalp;
  if (!s) return null;

  const dayDone = (key: string) => repsOn(state, key, s.slug) >= s.daily;

  // Cells: the vow's calendar window, one per day.
  const cells: SankalpProgress['cells'] = [];
  for (let i = 0; i < s.days; i++) {
    const key = addDays(s.start, i);
    const reps = repsOn(state, key, s.slug);
    let st: SankalpProgress['cells'][number]['state'];
    if (key === today) st = dayDone(key) ? 'done' : 'today';
    else if (key > today) st = 'upcoming';
    else st = dayDone(key) ? 'done' : 'missed';
    cells.push({ key, state: st, reps });
  }

  // Done days are counted across all days since the start, not just the window,
  // so a person who missed a day can still finish the count a little later.
  let doneDays = 0;
  for (let k = s.start; k <= today; k = addDays(k, 1)) if (dayDone(k)) doneDays++;

  // Streak: walk back from today (or yesterday when today is still open).
  let streak = 0;
  let k = dayDone(today) ? today : addDays(today, -1);
  while (k >= s.start && dayDone(k)) { streak++; k = addDays(k, -1); }

  const todayReps = repsOn(state, today, s.slug);
  return { doneDays, cells, streak, todayReps, todayDone: dayDone(today), complete: doneDays >= s.days };
}

export function startSankalp(state: SadhanaState, slug: string, days: number, daily: number, start: string = dateKey()): SadhanaState {
  return { ...state, sankalp: { slug, days, daily, start } };
}

export function endSankalp(state: SadhanaState): SadhanaState {
  return { ...state, sankalp: null };
}

// ── Storage ──────────────────────────────────────────────────────────────────
const storageKey = (uid: string) => `mantra-sadhana-v1:${uid || 'guest'}`;

export function loadState(uid: string): SadhanaState {
  try {
    const raw = localStorage.getItem(storageKey(uid));
    if (!raw) return EMPTY;
    const p = JSON.parse(raw) as Partial<SadhanaState>;
    if (p?.v !== 1 || typeof p.reps !== 'object') return EMPTY;
    return {
      v: 1,
      reps: p.reps ?? {},
      malaTarget: MALA_OPTIONS.includes(p.malaTarget as never) ? (p.malaTarget as number) : 108,
      sankalp: p.sankalp && p.sankalp.slug ? p.sankalp : null,
      lastSlug: p.lastSlug ?? null,
    };
  } catch {
    return EMPTY;
  }
}

function saveState(uid: string, state: SadhanaState) {
  try { localStorage.setItem(storageKey(uid), JSON.stringify(state)); } catch { /* private mode: keep going in memory */ }
}

/** One hook owns the state; callers get stable actions. */
export function useSadhana(uid: string) {
  const [slot, setSlot] = useState(() => ({ uid, state: loadState(uid) }));
  // A different account on the same device gets its own record (reset during render, not in an effect).
  if (slot.uid !== uid) setSlot({ uid, state: loadState(uid) });
  const state = slot.uid === uid ? slot.state : loadState(uid);

  const update = useCallback((fn: (s: SadhanaState) => SadhanaState) => {
    setSlot((prev) => {
      const base = prev.uid === uid ? prev.state : loadState(uid);
      const next = fn(base);
      if (next !== base) saveState(uid, next);
      return { uid, state: next };
    });
  }, [uid]);

  const actions = useMemo(() => ({
    addReps: (slug: string, n = 1) => update((s) => addReps(s, slug, n)),
    clearToday: (slug: string) => update((s) => clearDay(s, slug)),
    setMalaTarget: (n: number) => update((s) => ({ ...s, malaTarget: n })),
    setLastSlug: (slug: string) => update((s) => (s.lastSlug === slug ? s : { ...s, lastSlug: slug })),
    start: (slug: string, days: number, daily: number) => update((s) => startSankalp(s, slug, days, daily)),
    end: () => update((s) => endSankalp(s)),
  }), [update]);

  return { state, ...actions };
}
