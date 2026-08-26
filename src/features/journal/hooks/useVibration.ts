import { useEffect, useState } from 'react';
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { db } from '../../../firebase';
import { vibrationOf, type Polarity, type VibrationBalance } from '../loveFear';

/**
 * Reads the person's recent journal entries and returns where their thoughts have
 * been living on the love↔fear spectrum. Private and personal — a mirror, never
 * a score compared to anyone else. Used by the sidebar aura, where the entries
 * are not already in hand.
 */
export function useVibration(uid: string | null | undefined, count = 30): VibrationBalance {
  const [balance, setBalance] = useState<VibrationBalance>({ love: 0, fear: 0, neutral: 0, total: 0, balance: 0 });
  useEffect(() => {
    if (!uid) return;
    let cancelled = false;
    (async () => {
      try {
        const q = query(collection(db, 'users', uid, 'journal'), orderBy('createdAt', 'desc'), limit(count));
        const snap = await getDocs(q);
        const pols = snap.docs.map((d) => (d.data().polarity as Polarity | undefined) ?? null);
        if (!cancelled) setBalance(vibrationOf(pols));
      } catch { /* leave the empty balance */ }
    })();
    return () => { cancelled = true; };
  }, [uid, count]);
  return balance;
}
