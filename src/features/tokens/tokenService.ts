import {
  runTransaction,
  doc,
  serverTimestamp,
  collection,
  addDoc,
  getDoc,
} from 'firebase/firestore';
import { db } from '../../firebase';

export interface TokenBalance {
  tokensTotal: number;
  tokensUsed: number;
  tokensRemaining: number;
}

export interface DeductResult {
  success: boolean;
  newBalance: number;
  error?: 'INSUFFICIENT_TOKENS' | 'TRANSACTION_FAILED' | 'USER_NOT_FOUND';
}

// ─── Feature token costs ──────────────────────────────────────────────────────
export const TOKEN_COSTS = {
  voice_guidance: 15,
  daily_journal: 10,
  freestyle_journal: 2,
  situational_practice: 5,
  daily_practice: 5,
  wisdom_chapter: 10,
  pow_chapter: 10,
} as const;

export type FeatureName = keyof typeof TOKEN_COSTS;

// ─── Read balance ─────────────────────────────────────────────────────────────
export async function getTokenBalance(uid: string): Promise<TokenBalance> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return { tokensTotal: 0, tokensUsed: 0, tokensRemaining: 0 };
  const d = snap.data();
  return {
    tokensTotal: d.tokensTotal ?? 300,
    tokensUsed: d.tokensUsed ?? 0,
    tokensRemaining: d.tokensRemaining ?? 300,
  };
}

// ─── Check without deducting ──────────────────────────────────────────────────
export async function checkTokens(uid: string, cost: number): Promise<boolean> {
  const balance = await getTokenBalance(uid);
  return balance.tokensRemaining >= cost;
}

// ─── Atomic deduction ─────────────────────────────────────────────────────────
export async function deductTokens(
  uid: string,
  cost: number,
  featureName: FeatureName,
): Promise<DeductResult> {
  const userRef = doc(db, 'users', uid);

  try {
    const newBalance = await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(userRef);
      if (!snap.exists()) throw new Error('USER_NOT_FOUND');

      const data = snap.data();
      const remaining: number = data.tokensRemaining ?? 0;

      if (remaining < cost) throw new Error('INSUFFICIENT_TOKENS');

      const newRemaining = remaining - cost;
      const newUsed = (data.tokensUsed ?? 0) + cost;

      transaction.update(userRef, {
        tokensRemaining: newRemaining,
        tokensUsed: newUsed,
      });

      return newRemaining;
    });

    // Fire-and-forget ledger entry — never blocks the user
    addDoc(collection(db, 'users', uid, 'token_ledger'), {
      feature: featureName,
      cost,
      balanceAfter: newBalance,
      timestamp: serverTimestamp(),
    }).catch(console.warn);

    return { success: true, newBalance };
  } catch (err: any) {
    const knownError =
      err.message === 'INSUFFICIENT_TOKENS' || err.message === 'USER_NOT_FOUND'
        ? err.message
        : 'TRANSACTION_FAILED';
    return { success: false, newBalance: -1, error: knownError };
  }
}

// ─── Initialise token grant (called once at account creation) ─────────────────
export function buildInitialTokenFields(trialDays = 7) {
  const now = new Date();
  const trialExpiry = new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000);
  return {
    tokensTotal: 300,
    tokensUsed: 0,
    tokensRemaining: 300,
    trialDays,
    trialActivatedAt: now,
    trialExpiresAt: trialExpiry,
  };
}
