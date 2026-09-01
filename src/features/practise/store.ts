import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PracticeRoom, Reflection, SavedPractice, StrengthId } from './types';
import { getLocalDayString } from '../../lib/utils';

/**
 * Practise progress lives on THIS DEVICE only (localStorage), never on a server
 * — the same privacy-first default the Kids gym uses. Progress measures PRACTICE
 * DONE, never a moral or clinical score (PRODUCT_VISION §15).
 */

interface PractiseState {
  /** Preferred gym, remembered so returning users skip the picker. */
  lastGym: 'adult' | 'kids' | null;
  /** Total sessions completed — the rep count. */
  practiceCount: number;
  /** Consecutive-day streak. */
  streak: number;
  /** Last day a practice was completed ('YYYY-MM-DD'). */
  lastPractisedDay: string | null;
  /** Total practice minutes (rough, from session completions). */
  minutes: number;
  /** Star level per strength (0–5), framed as "areas you've practised". */
  strengths: Record<StrengthId, number>;
  /** Saved rooms + challenges ("My Practices"). */
  saved: SavedPractice[];
  /** Reflections, newest first. */
  reflections: Reflection[];

  setGym: (g: 'adult' | 'kids') => void;
  /** Record a completed session: bumps count/streak/minutes and the strengths trained. */
  completeSession: (room: PracticeRoom, minutes?: number) => void;
  addReflection: (r: Reflection) => void;
  savePractice: (room: PracticeRoom) => void;
  removePractice: (roomId: string) => void;
  makeChallenge: (roomId: string) => void;
  advanceChallenge: (roomId: string) => void;
}

const ZERO_STRENGTHS: Record<StrengthId, number> = {
  awareness: 0,
  pausing: 0,
  perspective: 0,
  'letting-go': 0,
  'self-compassion': 0,
};

/** Nudge a strength up, capped at 5 stars. */
function bump(map: Record<StrengthId, number>, ids: StrengthId[]): Record<StrengthId, number> {
  const next = { ...map };
  for (const id of ids) next[id] = Math.min(5, (next[id] ?? 0) + 1);
  return next;
}

export const usePractiseStore = create<PractiseState>()(
  persist(
    (set) => ({
      lastGym: null,
      practiceCount: 0,
      streak: 0,
      lastPractisedDay: null,
      minutes: 0,
      strengths: { ...ZERO_STRENGTHS },
      saved: [],
      reflections: [],

      setGym: (g) => set({ lastGym: g }),

      completeSession: (room, minutes = 5) =>
        set((s) => {
          const today = getLocalDayString();
          const yesterday = getLocalDayString(new Date(Date.now() - 864e5));
          let streak = s.streak;
          if (s.lastPractisedDay === today) {
            // already practised today — streak unchanged
          } else if (s.lastPractisedDay === yesterday) {
            streak = s.streak + 1;
          } else {
            streak = 1;
          }
          return {
            practiceCount: s.practiceCount + 1,
            minutes: s.minutes + minutes,
            streak,
            lastPractisedDay: today,
            strengths: bump(s.strengths, room.strengths),
            saved: s.saved.map((sp) =>
              sp.room.id === room.id ? { ...sp, lastPractisedAt: Date.now() } : sp,
            ),
          };
        }),

      addReflection: (r) =>
        set((s) => ({ reflections: [r, ...s.reflections].slice(0, 200) })),

      savePractice: (room) =>
        set((s) =>
          s.saved.some((sp) => sp.room.id === room.id)
            ? s
            : { saved: [{ room, savedAt: Date.now() }, ...s.saved] },
        ),

      removePractice: (roomId) =>
        set((s) => ({ saved: s.saved.filter((sp) => sp.room.id !== roomId) })),

      makeChallenge: (roomId) =>
        set((s) => ({
          saved: s.saved.map((sp) =>
            sp.room.id === roomId ? { ...sp, challengeDay: sp.challengeDay ?? 1 } : sp,
          ),
        })),

      advanceChallenge: (roomId) =>
        set((s) => ({
          saved: s.saved.map((sp) =>
            sp.room.id === roomId && sp.challengeDay
              ? { ...sp, challengeDay: Math.min(10, sp.challengeDay + 1) }
              : sp,
          ),
        })),
    }),
    {
      name: 'mbed-practise',
      // Migrate gracefully if the strengths shape ever changes.
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<PractiseState>;
        return {
          ...current,
          ...p,
          strengths: { ...ZERO_STRENGTHS, ...(p.strengths ?? {}) },
        };
      },
    },
  ),
);
