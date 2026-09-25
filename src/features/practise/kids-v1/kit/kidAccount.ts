import { useEffect } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../../../firebase';
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
}

export function saveKidToAccount(uid: string, kid: { name?: string; age?: number }) {
  return setDoc(doc(db, 'users', uid), { kid }, { merge: true }).catch(() => { /* offline: the device copy stands */ });
}
