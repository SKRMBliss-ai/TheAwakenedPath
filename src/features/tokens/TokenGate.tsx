import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTokens } from './useTokens';
import { useAuth } from '../auth/AuthContext';
import { PaymentWall } from './PaymentWall';
import type { FeatureName } from './tokenService';
import { useTheme } from '../../theme/ThemeSystem';

interface TokenGateProps {
  cost: number;
  featureName: FeatureName;
  /** Called after successful deduction so the parent can proceed */
  onActivate: () => void;
  /** Rendered as the trigger button/element. Receives gated onClick handler. */
  children: (props: { onClick: () => void; disabled: boolean }) => React.ReactNode;
  onNavigateToPlans?: () => void;
}

/**
 * Wraps any feature trigger. On click:
 *  - If tokens sufficient  → deduct then call onActivate
 *  - If tokens low (≤50)   → show inline warning banner, still allow
 *  - If tokens empty        → show PaymentWall
 */
export function TokenGate({
  cost,
  featureName,
  onActivate,
  children,
  onNavigateToPlans,
}: TokenGateProps) {
  const { isEmpty, isLow, tokensRemaining, deductTokens } = useTokens();
  const { isAccessValid } = useAuth();
  const { theme } = useTheme();
  const [showWall, setShowWall] = useState(false);
  const [deducting, setDeducting] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  // Paid subscribers bypass token checks entirely
  const bypassed = isAccessValid && !isEmpty;

  const handleClick = async () => {
    if (bypassed) {
      onActivate();
      return;
    }

    if (isEmpty) {
      setShowWall(true);
      return;
    }

    if (isLow) {
      setShowWarning(true);
    }

    setDeducting(true);
    const result = await deductTokens(cost, featureName);
    setDeducting(false);

    if (result.success) {
      onActivate();
    } else if (result.error === 'INSUFFICIENT_TOKENS') {
      setShowWall(true);
    } else {
      console.error('Token deduction failed:', result.error);
      // Don't block the user on a technical failure — let them through
      onActivate();
    }
  };

  return (
    <>
      {/* Low-token inline banner */}
      <AnimatePresence>
        {showWarning && !isEmpty && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full mb-3 px-4 py-2.5 rounded-xl flex items-center justify-between gap-3"
            style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)' }}
          >
            <p className="text-[11px] font-bold" style={{ color: '#F59E0B' }}>
              ⚠️ {tokensRemaining} tokens remaining
            </p>
            <button
              onClick={() => setShowWall(true)}
              className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg"
              style={{ background: '#F59E0B', color: '#fff' }}
            >
              Top Up
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cost hint */}
      {!bypassed && !isEmpty && (
        <div className="flex items-center gap-1 mb-1">
          <span className="text-[9px] opacity-30 font-bold" style={{ color: theme.textSecondary }}>
            {cost} tokens
          </span>
        </div>
      )}

      {children({ onClick: handleClick, disabled: deducting })}

      {/* Payment wall overlay */}
      <AnimatePresence>
        {showWall && (
          <PaymentWall
            onClose={() => setShowWall(false)}
            onNavigateToPlans={() => {
              setShowWall(false);
              onNavigateToPlans?.();
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
