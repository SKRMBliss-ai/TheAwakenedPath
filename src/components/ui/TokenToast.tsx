import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';
import { useTokenToastStore } from '../../stores/tokenToastStore';
import { FEATURE_LABELS } from '../../features/tokens/tokenService';
import { LOW_TOKEN_THRESHOLD } from '../../features/tokens/useTokens';

/**
 * TokenToast — fires automatically whenever AuthContext.deductTokens succeeds
 * (for non-premium users). Shows what was spent and what's left, the same way
 * AchievementToast celebrates a badge. Positioned bottom-left so it never
 * collides with AchievementToast (top) or the floating voice/headphone stack
 * and mobile nav bar (bottom-right / bottom).
 */
export function TokenToast() {
  const current = useTokenToastStore((s) => s.current);
  const dismiss = useTokenToastStore((s) => s.dismiss);

  useEffect(() => {
    if (!current) return;
    const t = setTimeout(dismiss, 4000);
    return () => clearTimeout(t);
  }, [current, dismiss]);

  return (
    <AnimatePresence>
      {current && (
        <motion.div
          key={current.key}
          initial={{ opacity: 0, x: -30, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 26 }}
          onClick={dismiss}
          className="fixed z-[9999] cursor-pointer bottom-20 sm:bottom-8 left-3 sm:left-6"
        >
          <div
            className="flex items-center gap-3 px-4 py-2.5 rounded-2xl border shadow-xl backdrop-blur-xl bg-[var(--bg-surface)]"
            style={{ borderColor: 'var(--border-default)' }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--accent-primary-dim)', color: 'var(--accent-primary)' }}
            >
              <Zap size={14} fill="currentColor" />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--accent-primary)' }}>
                −{current.cost} tokens · {FEATURE_LABELS[current.feature] ?? current.feature}
              </p>
              <p
                className="text-[12px] font-semibold"
                style={{ color: current.newBalance <= LOW_TOKEN_THRESHOLD ? '#A98A67' : 'var(--text-primary)' }}
              >
                {current.newBalance} token{current.newBalance === 1 ? '' : 's'} left
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default TokenToast;
