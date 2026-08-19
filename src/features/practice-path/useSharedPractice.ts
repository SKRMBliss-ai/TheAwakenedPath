import { useCallback, useEffect, useState } from 'react';
import {
  addDoc, collection, deleteDoc, doc, limit as qLimit, onSnapshot, orderBy,
  query, serverTimestamp, updateDoc,
} from 'firebase/firestore';
import { db } from '../../firebase';
import { virtueOfWeek } from './dailyRhythm';

/**
 * Insights and questions — the shared layer.
 *
 * These are the community feed. Deliberately NOT a blank "write something"
 * box: the feed fills itself from practice, so it is never empty on day one,
 * which is the usual way a community launch dies.
 *
 * ── Privacy by storage location, not by a flag ──────────────────────────────
 * A shared entry goes to the top-level `practice_entries` collection, which any
 * signed-in member can read. A private entry goes to `users/{uid}/practiceEntries`,
 * which the existing owner-only rule already protects.
 *
 * They are kept in separate collections rather than one collection with a
 * `shared` boolean because a flag filtered in the client is not privacy — the
 * document would still be readable by anyone who queried the collection
 * directly. Members will trust the "Private to me" toggle, so it has to be
 * true at the storage layer.
 *
 * Entries carry a display name only, never an email, and record the virtue
 * that was active when written so the feed can be read a week at a time.
 */

export type PracticeEntryKind = 'insight' | 'question';

export interface PracticeEntry {
  id: string;
  uid: string;
  displayName: string;
  kind: PracticeEntryKind;
  text: string;
  /** Questions only. */
  status?: 'open' | 'answered';
  answer?: string;
  virtueKey?: string;
  shared: boolean;
  createdAt?: unknown;
}

const SHARED_COLL = 'practice_entries';
const privateColl = (uid: string) => collection(db, 'users', uid, 'practiceEntries');

/** Live feed: everything shared, plus this member's own private entries. */
export function usePracticeEntries(
  kind: PracticeEntryKind | 'all',
  uid?: string | null,
  max = 60,
) {
  const [shared, setShared] = useState<PracticeEntry[]>([]);
  const [mine, setMine] = useState<PracticeEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!uid) { setShared([]); setLoaded(false); return; }
    const q = query(collection(db, SHARED_COLL), orderBy('createdAt', 'desc'), qLimit(max));
    return onSnapshot(
      q,
      (snap) => {
        setShared(snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) } as PracticeEntry)));
        setLoaded(true);
      },
      () => setLoaded(true),
    );
  }, [uid, max]);

  useEffect(() => {
    if (!uid) { setMine([]); return; }
    const q = query(privateColl(uid), orderBy('createdAt', 'desc'), qLimit(max));
    return onSnapshot(
      q,
      (snap) => setMine(snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) } as PracticeEntry))),
      () => setMine([]),
    );
  }, [uid, max]);

  const toMillis = (v: unknown) =>
    v && typeof (v as any)?.toMillis === 'function' ? (v as any).toMillis() : Date.now();

  const entries = [...shared, ...mine]
    .filter((e) => kind === 'all' || e.kind === kind)
    .sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));

  return { entries, loaded };
}

export function usePracticeEntryActions(
  uid: string | null | undefined,
  displayName: string | null | undefined,
) {
  const add = useCallback(
    async (kind: PracticeEntryKind, text: string, share: boolean) => {
      if (!uid || !text.trim()) return;
      const payload = {
        uid,
        displayName: displayName || 'A quiet presence',
        kind,
        text: text.trim().slice(0, 2000),
        shared: share,
        virtueKey: virtueOfWeek().key,
        ...(kind === 'question' ? { status: 'open' as const } : {}),
        createdAt: serverTimestamp(),
      };
      await addDoc(share ? collection(db, SHARED_COLL) : privateColl(uid), payload);
    },
    [uid, displayName],
  );

  /** Private entries live under the user, so edits need to know which store. */
  const refFor = useCallback(
    (entry: PracticeEntry) =>
      entry.shared
        ? doc(db, SHARED_COLL, entry.id)
        : doc(db, 'users', uid!, 'practiceEntries', entry.id),
    [uid],
  );

  const answer = useCallback(
    async (entry: PracticeEntry, text: string) => {
      await updateDoc(refFor(entry), { status: 'answered', answer: text.slice(0, 2000) });
    },
    [refFor],
  );

  const reopen = useCallback(
    async (entry: PracticeEntry) => { await updateDoc(refFor(entry), { status: 'open' }); },
    [refFor],
  );

  const remove = useCallback(
    async (entry: PracticeEntry) => { await deleteDoc(refFor(entry)); },
    [refFor],
  );

  return { add, answer, reopen, remove };
}
