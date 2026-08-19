import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  collection, doc, getDocs, onSnapshot, orderBy, query, setDoc, limit as qLimit,
} from 'firebase/firestore';
import { db } from '../../firebase';
import { todayKey, virtueOfWeek } from './dailyRhythm';

/**
 * One document per member per day: users/{uid}/practiceDays/{YYYY-MM-DD}.
 *
 * This is the SINGLE record of a day's practice. The ritual steps (invocation,
 * virtue, pre-sit checks) and the sit itself live in one doc rather than two
 * competing logs, so "did I practise today" has exactly one answer.
 */
export interface PracticeDay {
  date: string;
  /** Opening invocation spoken aloud. */
  invocationRead?: boolean;
  /** Virtue practised — stored with the key so a week's rotation is auditable. */
  virtueKey?: string;
  virtuePractised?: boolean;
  /** Pre-sit checks. */
  breath?: boolean;
  posture?: boolean;
  connect?: boolean;
  /** The sit. */
  sat?: boolean;
  minutes?: number;
  /** How settled the sit was, 1–5. */
  settled?: number;
  reflection?: string;
  /** Practice of the Week. `engaged` (opened the day's content) and
   *  `practised` (said so explicitly) are tracked SEPARATELY — a day where
   *  someone read the practice but did not tick it is not a failure, and
   *  collapsing the two would quietly turn it into one. */
  practiceId?: string;
  practiceEngaged?: boolean;
  practicePractised?: boolean;
  practiceReflection?: string;
  updatedAt?: number;
}

export function usePracticeDay(uid: string | null | undefined, date = todayKey()) {
  const [day, setDay] = useState<PracticeDay | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) { setLoading(false); return; }
    const ref = doc(db, 'users', uid, 'practiceDays', date);
    return onSnapshot(
      ref,
      (snap) => {
        setDay(snap.exists() ? (snap.data() as PracticeDay) : { date });
        setLoading(false);
      },
      () => setLoading(false),
    );
  }, [uid, date]);

  const patch = useCallback(
    async (fields: Partial<PracticeDay>) => {
      if (!uid) return;
      // Optimistic: the ritual is a series of taps, and waiting for a round
      // trip before the tick appears makes the whole stack feel broken.
      setDay((d) => ({ ...(d ?? { date }), ...fields }));
      await setDoc(
        doc(db, 'users', uid, 'practiceDays', date),
        { date, ...fields, updatedAt: Date.now() },
        { merge: true },
      );
    },
    [uid, date],
  );

  return { day, loading, patch };
}

/** Recent days, newest first — for the "your recent days" list and the streak. */
export function usePracticeHistory(uid: string | null | undefined, days = 60) {
  const [history, setHistory] = useState<PracticeDay[]>([]);

  useEffect(() => {
    if (!uid) return;
    let cancelled = false;
    (async () => {
      try {
        const q = query(
          collection(db, 'users', uid, 'practiceDays'),
          orderBy('date', 'desc'),
          qLimit(days),
        );
        const snap = await getDocs(q);
        if (!cancelled) setHistory(snap.docs.map((d) => d.data() as PracticeDay));
      } catch {
        if (!cancelled) setHistory([]);
      }
    })();
    return () => { cancelled = true; };
  }, [uid, days]);

  return history;
}

/**
 * Streak of consecutive days with a completed sit.
 *
 * Counts back from today, but allows a streak to still stand if today has not
 * happened yet — a streak should not appear broken at 8am simply because the
 * member has not sat yet. It only breaks once a whole day is skipped.
 */
export function computeStreak(history: PracticeDay[]): number {
  const sat = new Set(history.filter((d) => d.sat).map((d) => d.date));
  const cursor = new Date();
  if (!sat.has(todayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (sat.has(todayKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/** How many days of THIS week's virtue the member has practised (0–7). */
export function useVirtueWeekProgress(history: PracticeDay[]) {
  return useMemo(() => {
    const v = virtueOfWeek();
    // Monday of the current ISO week.
    const monday = new Date();
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
    monday.setHours(0, 0, 0, 0);

    const done = history.filter((d) => {
      if (!d.virtuePractised || d.virtueKey !== v.key) return false;
      const dd = new Date(d.date + 'T00:00:00');
      return dd >= monday;
    }).length;

    return { virtue: v, done: Math.min(done, 7) };
  }, [history]);
}
