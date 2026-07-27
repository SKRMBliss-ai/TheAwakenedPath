import { create } from 'zustand';
import type { FeatureName } from '../features/tokens/tokenService';

export interface TokenToastEntry {
  feature: FeatureName;
  cost: number;
  newBalance: number;
  key: number;
}

interface TokenToastState {
  current: TokenToastEntry | null;
  show: (feature: FeatureName, cost: number, newBalance: number) => void;
  dismiss: () => void;
}

let counter = 0;

/**
 * Global toast queue for token spends. Populated centrally from
 * AuthContext.deductTokens so every feature that spends tokens (voice
 * guidance, journal, practices, chapters, videos, …) gets the notification
 * automatically without each call site wiring its own UI.
 */
export const useTokenToastStore = create<TokenToastState>((set) => ({
  current: null,
  show: (feature, cost, newBalance) => set({ current: { feature, cost, newBalance, key: ++counter } }),
  dismiss: () => set({ current: null }),
}));
