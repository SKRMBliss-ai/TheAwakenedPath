// useDailyPractice.ts
// Firestore hook that reads and writes daily practice completion
// for a specific Wisdom Untethered question.
//
// Firestore path:
//   users/{uid}/dailyPractices/{YYYY-MM-DD}
//   Document fields: { [questionId]: PracticeRecord }
//
// Usage:
//   const { record, markDone, markTrigger, isLoading } = useDailyPractice(uid, 'question3');

import { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface PracticeRecord {
  completed: boolean;           // specifically for the 'Practice' step
  completedAt?: any;           // Firestore Timestamp
  triggersCompleted?: number;  // for Q3's three-pause system
  note?: string;
  learnCompleted?: boolean;    // for the 'Learn' step
  reflectCompleted?: boolean;  // for the 'Reflect' step
  integrateCompleted?: boolean; // for the 'Integrate' step
}

export interface UseDailyPracticeReturn {
  record: PracticeRecord | null;
  isLoading: boolean;
  isCompleted: boolean;
  triggersCompleted: number;
  // Mark the whole practice as done (Q1, Q2, Q4)
  markDone: () => Promise<void>;
  // Increment trigger count (Q3 — called once per pause moment)
  markTrigger: () => Promise<void>;
  // Unmark — allows toggling off if user tapped by mistake
  markUndone: () => Promise<void>;
  // Save a journal note alongside the practice
  saveNote: (note: string) => Promise<void>;
  // Mark the Learn, Reflect, or Integrate pillars
  markLearn: () => Promise<void>;
  markReflect: () => Promise<void>;
  markIntegrate: () => Promise<void>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────────────────────────────────────

function todayString(): string {
  return new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useDailyPractice(
  userId: string | undefined | null,
  questionId: string,
  requiredTriggers = 1   // set to 3 for Q3
): UseDailyPracticeReturn {
  const [record, setRecord] = useState<PracticeRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const dateStr = todayString();

  // ── Real-time listener ────────────────────────────────────────────────────
  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const docRef = doc(db, 'users', userId, 'dailyPractices', dateStr);

    const unsub = onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          // Each questionId is a field on the date document
          const qRecord = data[questionId] as PracticeRecord | undefined;
          setRecord(qRecord ?? null);
        } else {
          setRecord(null);
        }
        setIsLoading(false);
      },
      (err) => {
        console.error('[useDailyPractice] snapshot error:', err);
        setIsLoading(false);
      }
    );

    return () => unsub();
  }, [userId, questionId, dateStr]);

  // ── Write helper ──────────────────────────────────────────────────────────
  const write = useCallback(
    async (partial: Partial<PracticeRecord>) => {
      if (!userId) return;
      const docRef = doc(db, 'users', userId, 'dailyPractices', dateStr);
      await setDoc(
        docRef,
        { [questionId]: { ...(record ?? {}), ...partial } },
        { merge: true }
      );
    },
    [userId, questionId, dateStr, record]
  );

  // ── Actions ───────────────────────────────────────────────────────────────

  const markDone = useCallback(async () => {
    await write({ completed: true, completedAt: Timestamp.now() });
  }, [write]);

  const markTrigger = useCallback(async () => {
    const current = record?.triggersCompleted ?? 0;
    const next = Math.min(current + 1, requiredTriggers);
    const nowDone = next >= requiredTriggers;
    await write({
      triggersCompleted: next,
      completed: nowDone,
      ...(nowDone ? { completedAt: Timestamp.now() } : {}),
    });
  }, [write, record, requiredTriggers]);

  const markUndone = useCallback(async () => {
    await write({ completed: false, completedAt: undefined, triggersCompleted: 0 });
  }, [write]);

  const saveNote = useCallback(async (note: string) => {
    await write({ note });
  }, [write]);

  const markLearn = useCallback(async () => {
    await write({ learnCompleted: true });
  }, [write]);

  const markReflect = useCallback(async () => {
    await write({ reflectCompleted: true });
  }, [write]);

  const markIntegrate = useCallback(async () => {
    await write({ integrateCompleted: true });
  }, [write]);

  // ── Derived ───────────────────────────────────────────────────────────────

  const isCompleted = record?.completed === true;
  const triggersCompleted = record?.triggersCompleted ?? 0;

  return {
    record,
    isLoading,
    isCompleted,
    triggersCompleted,
    markDone,
    markTrigger,
    markUndone,
    saveNote,
    markLearn,
    markReflect,
    markIntegrate,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Aggregate hook — get completion status for ALL questions for today
// Useful for the dashboard streak/progress display
// ─────────────────────────────────────────────────────────────────────────────

export interface DailyOverview {
  [questionId: string]: PracticeRecord | null;
}

export function useDailyOverview(userId: string | undefined | null) {
  const [overview, setOverview] = useState<DailyOverview>({});
  const [isLoading, setIsLoading] = useState(true);

  const dateStr = todayString();

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const docRef = doc(db, 'users', userId, 'dailyPractices', dateStr);

    const unsub = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        setOverview(snap.data() as DailyOverview);
      } else {
        setOverview({});
      }
      setIsLoading(false);
    });

    return () => unsub();
  }, [userId, dateStr]);

  const completedCount = Object.values(overview).filter(
    (r) => r?.completed === true
  ).length;

  return { overview, isLoading, completedCount };
}
