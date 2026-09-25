import { useEffect } from 'react';
import { addDoc, collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '../../../../firebase';
import { useAuth } from '../../../auth/AuthContext';
import { useKidStore } from '../../../kids/store';
import { childAge, setAge } from './band';

/**
 * The child's name and age follow the signed-in account, so a child greeted
 * as "Aarav, 7" on the tablet is greeted the same way on the laptop. The
 * account wins when it has a value; this device fills in whatever it lacks.
 */
export function useKidAccountSync() {
  const { user, profile } = useAuth();
  const name = useKidStore((s) => s.name);
  const setName = useKidStore((s) => s.setName);

  useEffect(() => {
    if (!user || !profile) return;
    const saved = profile.kid ?? {};
    if (saved.name && saved.name !== name) setName(saved.name);
    if (typeof saved.age === 'number' && childAge() === undefined) setAge(saved.age);

    const localName = name && name !== 'Explorer' ? name : undefined;
    const patch: { name?: string; age?: number } = {};
    if (!saved.name && localName) patch.name = localName;
    const age = childAge();
    if (typeof saved.age !== 'number' && age !== undefined) patch.age = age;
    if (Object.keys(patch).length) void saveKidToAccount(user.uid, patch);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs when the account's copy changes
  }, [user?.uid, profile?.kid?.name, profile?.kid?.age]);

  useEffect(() => {
    if (!user) return;
    return mirrorKidStore(user.uid);
  }, [user]);
}

/** Firestore refuses `undefined`; a JSON round trip drops those keys. */
const clean = <T,>(v: T): T => JSON.parse(JSON.stringify(v ?? null));

/**
 * Everything the kids app keeps on the device is mirrored under the account:
 *   users/{uid}/kidJourneys/{id}  one per saved Story Lab journey
 *   users/{uid}/kidDays/{date}    good choices, missions, scenarios, reflection
 *   users/{uid}/kidMonths/{month} the month's diary answers
 * Each write replaces a whole document, so re-sending is harmless; only the
 * pieces that changed are sent, a couple of seconds after the last change.
 */
function mirrorKidStore(uid: string): () => void {
  const sent = new Map<string, string>();
  let timer: number | undefined;

  const push = () => {
    const s = useKidStore.getState();
    const docs: [string, string, unknown][] = [];
    for (const r of s.savedReflections) docs.push(['kidJourneys', r.id, r]);
    const days = new Set([
      ...Object.keys(s.completions), ...Object.keys(s.missionsDone),
      ...Object.keys(s.scenariosDone), ...Object.keys(s.reflections),
    ]);
    for (const d of days) docs.push(['kidDays', d, {
      date: d,
      completions: s.completions[d] ?? {},
      missions: s.missionsDone[d] ?? [],
      scenarios: s.scenariosDone[d] ?? [],
      reflection: s.reflections[d] ?? null,
    }]);
    for (const [m, review] of Object.entries(s.monthReviews)) docs.push(['kidMonths', m, { month: m, ...review }]);

    for (const [coll, id, data] of docs) {
      const body = JSON.stringify(data);
      const key = `${coll}/${id}`;
      if (sent.get(key) === body) continue;
      sent.set(key, body);
      setDoc(doc(db, 'users', uid, coll, id), { ...clean(data as object), childAge: childAge() ?? null, updatedAt: serverTimestamp() })
        .catch(() => sent.delete(key));
    }
  };

  push();
  const unsub = useKidStore.subscribe(() => {
    window.clearTimeout(timer);
    timer = window.setTimeout(push, 2000);
  });
  return () => { unsub(); window.clearTimeout(timer); };
}

/**
 * One timestamped row per moment worth charting later, e.g. every feeling a
 * child picks: users/{uid}/kidEvents/{auto}. Silent when nobody is signed in.
 */
export function logKidEvent(type: string, data: Record<string, unknown>) {
  const uid = auth.currentUser?.uid;
  if (!uid) return;
  void addDoc(collection(db, 'users', uid, 'kidEvents'), {
    type, ...clean(data), childAge: childAge() ?? null, at: serverTimestamp(),
  }).catch(() => { /* offline: nothing to retry against */ });
}

export function saveKidToAccount(uid: string, kid: { name?: string; age?: number }) {
  return setDoc(doc(db, 'users', uid), { kid }, { merge: true }).catch(() => { /* offline: the device copy stands */ });
}
