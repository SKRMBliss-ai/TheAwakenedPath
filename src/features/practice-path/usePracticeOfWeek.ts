import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  addDoc, collection, doc, getDoc, getDocs, onSnapshot, orderBy, query, setDoc,
} from 'firebase/firestore';
import { db } from '../../firebase';
import {
  chooseAssignment, practiceWeekNumber, weekBounds,
  type Practice, type PracticeAssignment,
} from './practiceOfWeek';

/**
 * Firestore layer for the Practice of the Week.
 *
 *   practice_library/{practiceId}      — permanent, shared, never overwritten
 *   practice_assignments/{weekNumber}  — ONE doc per week, shared by everyone
 *   users/{uid}/practiceWeeks/{week}   — the member's day-7 review + carry-forward
 *
 * Assignments are global rather than per-user. That is the whole point of the
 * fixed anchor: if each member computed their own, they would drift apart and
 * there would be nothing to talk about in the Circle or the Friday session.
 */

const LIBRARY = 'practice_library';
const ASSIGNMENTS = 'practice_assignments';

/** The permanent library, newest first. */
export function usePracticeLibrary() {
  const [practices, setPractices] = useState<Practice[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const q = query(collection(db, LIBRARY), orderBy('originalWeek', 'asc'));
    return onSnapshot(
      q,
      (snap) => {
        setPractices(snap.docs.map((d) => ({ practiceId: d.id, ...(d.data() as object) } as Practice)));
        setLoaded(true);
      },
      () => setLoaded(true),
    );
  }, []);

  return { practices, loaded };
}

/** Every assignment ever made — needed to score resurfacing. */
export function useAssignments() {
  const [assignments, setAssignments] = useState<PracticeAssignment[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const q = query(collection(db, ASSIGNMENTS), orderBy('weekNumber', 'asc'));
    return onSnapshot(
      q,
      (snap) => {
        setAssignments(snap.docs.map((d) => d.data() as PracticeAssignment));
        setLoaded(true);
      },
      () => setLoaded(true),
    );
  }, []);

  return { assignments, loaded };
}

/**
 * The assignment for a given week, computing and persisting it once if absent.
 *
 * Writes with a transaction-free "check then create" because the doc id IS the
 * week number: two clients racing both compute the SAME answer (the choice is
 * deterministic), so a duplicate write is harmless rather than a conflict.
 */
export function useWeekAssignment(weekNumber: number) {
  const { practices, loaded: libLoaded } = usePracticeLibrary();
  const { assignments, loaded: asgLoaded } = useAssignments();
  const [resolving, setResolving] = useState(false);

  const existing = assignments.find((a) => a.weekNumber === weekNumber);

  useEffect(() => {
    if (!libLoaded || !asgLoaded || resolving) return;
    if (weekNumber < 1 || existing || !practices.length) return;

    setResolving(true);
    (async () => {
      try {
        const ref = doc(db, ASSIGNMENTS, String(weekNumber));
        const snap = await getDoc(ref);
        if (snap.exists()) return; // another client got there first

        const chosen = chooseAssignment(weekNumber, practices, assignments);
        if (!chosen) return;
        const b = weekBounds(weekNumber);
        await setDoc(ref, {
          weekNumber,
          weekStart: b.start,
          weekEnd: b.end,
          practiceId: chosen.practiceId,
          assignmentType: chosen.assignmentType,
          assignedAt: new Date().toISOString(),
        } satisfies PracticeAssignment);
      } catch {
        // Read-only members simply see no practice rather than an error.
      } finally {
        setResolving(false);
      }
    })();
  }, [libLoaded, asgLoaded, weekNumber, existing, practices, assignments, resolving]);

  const practice = useMemo(
    () => (existing ? practices.find((p) => p.practiceId === existing.practiceId) ?? null : null),
    [existing, practices],
  );

  return { assignment: existing ?? null, practice, practices, assignments, loaded: libLoaded && asgLoaded };
}

/** Add a practice to the permanent library and make it this week's practice. */
export function useAddPractice(uid: string | null | undefined) {
  return useCallback(
    async (fields: {
      title: string; core: string; purpose?: string;
      instructions: string[]; dailyLife: string[];
      source?: string; tags?: string[]; ownWords?: string;
      alignVirtue?: string; alignSixfold?: string;
    }) => {
      if (!uid || !fields.title.trim()) return null;
      const week = practiceWeekNumber();
      const today = new Date().toISOString().slice(0, 10);

      const ref = await addDoc(collection(db, LIBRARY), {
        ...fields,
        title: fields.title.trim(),
        core: (fields.core || '').trim(),
        dateIntroduced: today,
        originalWeek: week,
        createdBy: uid,
      });

      // A newly introduced practice always wins its own week.
      const b = weekBounds(week);
      await setDoc(doc(db, ASSIGNMENTS, String(week)), {
        weekNumber: week,
        weekStart: b.start,
        weekEnd: b.end,
        practiceId: ref.id,
        assignmentType: 'new' as const,
        assignedAt: new Date().toISOString(),
      });

      return ref.id;
    },
    [uid],
  );
}

/** Bring an older practice back to the current week. */
export function useAssignPractice() {
  return useCallback(async (practiceId: string) => {
    const week = practiceWeekNumber();
    if (week < 1) return;
    const b = weekBounds(week);
    await setDoc(doc(db, ASSIGNMENTS, String(week)), {
      weekNumber: week,
      weekStart: b.start,
      weekEnd: b.end,
      practiceId,
      assignmentType: 'manual' as const,
      assignedAt: new Date().toISOString(),
    });
  }, []);
}

// ── Week review + the carry-forward thread ───────────────────────────────────

export interface WeekReview {
  weekNumber: number;
  practiceId?: string;
  real?: string;
  hard?: string;
  surprise?: string;
  /** The one line that greets the member at the start of next week. */
  carry?: string;
  updatedAt?: number;
}

export function useWeekReview(uid: string | null | undefined, weekNumber: number) {
  const [review, setReview] = useState<WeekReview | null>(null);

  useEffect(() => {
    if (!uid || weekNumber < 1) return;
    const ref = doc(db, 'users', uid, 'practiceWeeks', String(weekNumber));
    return onSnapshot(
      ref,
      (snap) => setReview(snap.exists() ? (snap.data() as WeekReview) : null),
      () => setReview(null),
    );
  }, [uid, weekNumber]);

  const save = useCallback(
    async (fields: Partial<WeekReview>) => {
      if (!uid || weekNumber < 1) return;
      setReview((r) => ({ ...(r ?? { weekNumber }), ...fields }));
      await setDoc(
        doc(db, 'users', uid, 'practiceWeeks', String(weekNumber)),
        { weekNumber, ...fields, updatedAt: Date.now() },
        { merge: true },
      );
    },
    [uid, weekNumber],
  );

  return { review, save };
}

/** Every carry-forward the member has written, oldest first — the thread. */
export function useCarryThread(uid: string | null | undefined) {
  const [thread, setThread] = useState<WeekReview[]>([]);

  useEffect(() => {
    if (!uid) { setThread([]); return; }
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDocs(
          query(collection(db, 'users', uid, 'practiceWeeks'), orderBy('weekNumber', 'asc')),
        );
        if (cancelled) return;
        setThread(
          snap.docs
            .map((d) => d.data() as WeekReview)
            .filter((r) => (r.carry || '').trim().length > 0),
        );
      } catch {
        if (!cancelled) setThread([]);
      }
    })();
    return () => { cancelled = true; };
  }, [uid]);

  return thread;
}

/**
 * The most recent non-empty carry-forward before a given week.
 * Walks backward, skipping empty weeks, so a missed week doesn't break
 * the thread — the line simply carries further.
 */
export function lastCarryForward(thread: WeekReview[], beforeWeek: number) {
  const prior = thread
    .filter((r) => r.weekNumber < beforeWeek && (r.carry || '').trim())
    .sort((a, b) => b.weekNumber - a.weekNumber);
  if (!prior.length) return null;
  const r = prior[0];
  return { week: r.weekNumber, text: (r.carry || '').trim(), gap: beforeWeek - r.weekNumber, practiceId: r.practiceId };
}
