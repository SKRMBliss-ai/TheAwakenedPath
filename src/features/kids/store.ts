import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BEHAVIOURS, BADGES, REWARDS, todayKey } from './data';

/**
 * Kid progress lives on THIS DEVICE only (localStorage), never on a server —
 * the safest default for a children's app: no personal data collected, nothing
 * to leak. A parent/teacher can later opt into cloud sync; the prototype does
 * not need it, and not collecting children's data by default is the right call.
 */

type DayCompletions = Record<string, boolean>; // behaviourId -> done
type Reflection = { proud?: string; feeling?: string };

interface KidState {
  onboarded: boolean;
  name: string;
  avatarId: string;
  points: number;
  pointsByBehaviour: Record<string, number>;
  completions: Record<string, DayCompletions>;   // dateKey -> {behaviourId: true}
  missionsDone: Record<string, string[]>;         // dateKey -> [mission text]
  reflections: Record<string, Reflection>;
  monthReviews: Record<string, Record<string, string>>; // "YYYY-MM" -> {q1..q4}
  streak: number;
  badges: string[];
  rewards: string[];

  completeOnboarding: (name: string, avatarId: string) => void;
  toggleBehaviour: (behaviourId: string) => void;
  setBehaviourOn: (dateKey: string, behaviourId: string, done: boolean) => void;
  awardPoints: (points: number, behaviourId?: string) => void;
  completeMission: (text: string, points: number) => void;
  setReflection: (r: Reflection) => void;
  setMonthReview: (month: string, key: string, value: string) => void;
  reset: () => void;
}

function computeStreak(completions: Record<string, DayCompletions>): number {
  const has = (d: Date) => {
    const c = completions[todayKey(d)];
    return !!c && Object.values(c).some(Boolean);
  };
  const cur = new Date();
  if (!has(cur)) cur.setDate(cur.getDate() - 1); // today not done yet doesn't break it
  let streak = 0;
  while (has(cur)) { streak++; cur.setDate(cur.getDate() - 1); }
  return streak;
}

function recomputeBadges(s: Pick<KidState, 'completions' | 'streak' | 'badges'>): string[] {
  const earned = new Set(s.badges);
  const days = Object.values(s.completions);
  const countBehaviour = (id: string) => days.filter((d) => d[id]).length;
  const anyDone = days.some((d) => Object.values(d).some(Boolean));
  const check = (id: string, cond: boolean) => { if (cond) earned.add(id); };

  check('firstStep', anyDone);
  check('kindHeart', countBehaviour('kind') >= 3);
  check('truthTeller', countBehaviour('truth') >= 3);
  check('helper', countBehaviour('help') >= 5);
  check('streak3', s.streak >= 3);
  check('streak7', s.streak >= 7);
  check('allSeven', days.some((d) => BEHAVIOURS.every((b) => d[b.id])));
  void BADGES;
  return Array.from(earned);
}

function recomputeRewards(points: number, current: string[]): string[] {
  const set = new Set(current);
  for (const r of REWARDS) if (points >= r.at) set.add(r.id);
  return Array.from(set);
}

export const useKidStore = create<KidState>()(
  persist(
    (set) => ({
      onboarded: false,
      name: '',
      avatarId: 'sunny',
      points: 0,
      pointsByBehaviour: {},
      completions: {},
      missionsDone: {},
      reflections: {},
      monthReviews: {},
      streak: 0,
      badges: [],
      rewards: [],

      completeOnboarding: (name, avatarId) => set({ onboarded: true, name: name.trim() || 'Explorer', avatarId }),

      toggleBehaviour: (behaviourId) => set((s) => {
        const key = todayKey();
        const beh = BEHAVIOURS.find((b) => b.id === behaviourId);
        if (!beh) return s;
        const day = { ...(s.completions[key] ?? {}) };
        const wasDone = !!day[behaviourId];
        const delta = wasDone ? -beh.points : beh.points;
        if (wasDone) delete day[behaviourId]; else day[behaviourId] = true;

        const completions = { ...s.completions, [key]: day };
        const points = Math.max(0, s.points + delta);
        const pointsByBehaviour = {
          ...s.pointsByBehaviour,
          [behaviourId]: Math.max(0, (s.pointsByBehaviour[behaviourId] ?? 0) + delta),
        };
        const streak = computeStreak(completions);
        return {
          completions, points, pointsByBehaviour, streak,
          badges: recomputeBadges({ completions, streak, badges: s.badges }),
          rewards: recomputeRewards(points, s.rewards),
        };
      }),

      setBehaviourOn: (dateKey, behaviourId, done) => set((s) => {
        const beh = BEHAVIOURS.find((b) => b.id === behaviourId);
        if (!beh) return s;
        const day = { ...(s.completions[dateKey] ?? {}) };
        const wasDone = !!day[behaviourId];
        if (wasDone === done) return s;
        if (done) day[behaviourId] = true; else delete day[behaviourId];
        const delta = done ? beh.points : -beh.points;
        const completions = { ...s.completions, [dateKey]: day };
        const points = Math.max(0, s.points + delta);
        const pointsByBehaviour = {
          ...s.pointsByBehaviour,
          [behaviourId]: Math.max(0, (s.pointsByBehaviour[behaviourId] ?? 0) + delta),
        };
        const streak = computeStreak(completions);
        return {
          completions, points, pointsByBehaviour, streak,
          badges: recomputeBadges({ completions, streak, badges: s.badges }),
          rewards: recomputeRewards(points, s.rewards),
        };
      }),

      setMonthReview: (month, key, value) => set((s) => ({
        monthReviews: { ...s.monthReviews, [month]: { ...s.monthReviews[month], [key]: value } },
      })),

      awardPoints: (pts, behaviourId) => set((s) => {
        const points = s.points + pts;
        return {
          points,
          pointsByBehaviour: behaviourId
            ? { ...s.pointsByBehaviour, [behaviourId]: (s.pointsByBehaviour[behaviourId] ?? 0) + pts }
            : s.pointsByBehaviour,
          rewards: recomputeRewards(points, s.rewards),
        };
      }),

      completeMission: (text, missionPoints) => set((s) => {
        const key = todayKey();
        const done = s.missionsDone[key] ?? [];
        if (done.includes(text)) return s;
        const points = s.points + missionPoints;
        return {
          missionsDone: { ...s.missionsDone, [key]: [...done, text] },
          points,
          rewards: recomputeRewards(points, s.rewards),
        };
      }),

      setReflection: (r) => set((s) => ({ reflections: { ...s.reflections, [todayKey()]: { ...s.reflections[todayKey()], ...r } } })),

      reset: () => set({
        onboarded: false, name: '', avatarId: 'sunny', points: 0, pointsByBehaviour: {},
        completions: {}, missionsDone: {}, reflections: {}, streak: 0, badges: [], rewards: [],
      }),
    }),
    { name: 'my-best-every-day' },
  ),
);
