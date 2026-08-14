import { collection, doc, getDoc, getDocs, setDoc, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase';
import { practiceDateKey } from './practiceContent';

/**
 * A single day of the practice, keyed by the local calendar date.
 *
 * Stored under users/{uid}/practice_log/{YYYY-MM-DD} — the existing
 * users/{userId}/{coll}/{doc=**} rule already grants the owner full access
 * there, so this needs no new Firestore rule and no new top-level collection.
 * One document per day (rather than append-only entries) means a re-save simply
 * corrects the day instead of leaving duplicates to reconcile.
 */
export interface PracticeLog {
  date: string;
  /** The invocation was spoken aloud. */
  invocationSpoken: boolean;
  /** This week's virtue was practised. */
  virtuePractised: boolean;
  /** Which virtue the day belonged to — kept so a streak survives a content edit. */
  virtueKey: string;
  /** Keys of the completed pre-sit checks. */
  presit: string[];
  /** The formal sit happened. */
  sat: boolean;
  minutes: number | null;
  /** 1–5, or null when not rated. */
  settled: number | null;
  reflection: string;
  updatedAt: string;
}

export const emptyLog = (date: string, virtueKey: string): PracticeLog => ({
  date,
  invocationSpoken: false,
  virtuePractised: false,
  virtueKey,
  presit: [],
  sat: false,
  minutes: null,
  settled: null,
  reflection: '',
  updatedAt: new Date().toISOString(),
});

const logCollection = (uid: string) => collection(db, 'users', uid, 'practice_log');

export async function loadDay(uid: string, date: string): Promise<PracticeLog | null> {
  const snap = await getDoc(doc(logCollection(uid), date));
  return snap.exists() ? (snap.data() as PracticeLog) : null;
}

export async function saveDay(uid: string, log: PracticeLog): Promise<void> {
  await setDoc(
    doc(logCollection(uid), log.date),
    { ...log, updatedAt: new Date().toISOString() },
    { merge: true },
  );
}

/** Most recent days first. Used for the history strip and the streak. */
export async function loadRecent(uid: string, days = 60): Promise<PracticeLog[]> {
  const snap = await getDocs(query(logCollection(uid), orderBy('date', 'desc'), limit(days)));
  return snap.docs.map(d => d.data() as PracticeLog);
}

/**
 * Consecutive days ending today or yesterday.
 *
 * Yesterday still counts as an anchor so the streak does not visibly break
 * during the hours before someone has sat — it only ends once a whole day has
 * passed untouched. A day counts if anything real happened: the invocation was
 * spoken, the virtue was practised, or the sit was completed.
 */
export function calcStreak(logs: PracticeLog[], today = new Date()): number {
  const active = new Set(
    logs.filter(l => l.invocationSpoken || l.virtuePractised || l.sat).map(l => l.date),
  );
  const cursor = new Date(today);
  if (!active.has(practiceDateKey(cursor))) cursor.setDate(cursor.getDate() - 1);

  let streak = 0;
  while (active.has(practiceDateKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
