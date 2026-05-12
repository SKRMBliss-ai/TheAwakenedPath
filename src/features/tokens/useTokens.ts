import { useAuth } from '../auth/AuthContext';
import type { FeatureName, DeductResult } from './tokenService';

export const LOW_TOKEN_THRESHOLD = 50;

export interface UseTokensReturn {
  tokensRemaining: number;
  tokensTotal: number;
  tokensUsed: number;
  trialExpiresAt: any;
  trialDays: number;
  isLow: boolean;     // ≤50 tokens remaining
  isEmpty: boolean;   // 0 tokens remaining
  isTrialExpired: boolean;
  deductTokens: (cost: number, featureName: FeatureName) => Promise<DeductResult>;
}

export function useTokens(): UseTokensReturn {
  const { profile, tokenBalance, deductTokens } = useAuth();

  const tokensRemaining = tokenBalance;
  const tokensTotal = profile?.tokensTotal ?? 300;
  const tokensUsed = profile?.tokensUsed ?? 0;
  const trialExpiresAt = profile?.trialExpiresAt ?? null;
  const trialDays = profile?.trialDays ?? 7;

  const isLow = tokensRemaining <= LOW_TOKEN_THRESHOLD && tokensRemaining > 0;
  const isEmpty = tokensRemaining <= 0;

  const isTrialExpired = trialExpiresAt
    ? (() => {
        const expiry =
          typeof trialExpiresAt.toDate === 'function'
            ? trialExpiresAt.toDate().getTime()
            : new Date(trialExpiresAt).getTime();
        return expiry < Date.now();
      })()
    : false;

  return {
    tokensRemaining,
    tokensTotal,
    tokensUsed,
    trialExpiresAt,
    trialDays,
    isLow,
    isEmpty,
    isTrialExpired,
    deductTokens,
  };
}
