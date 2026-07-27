import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X, Lock, Check } from 'lucide-react';
import { ACHIEVEMENTS } from './achievementsDefs';

interface Props {
  open: boolean;
  onClose: () => void;
  unlocked: string[];
  points: number;
}

/**
 * AchievementsDrawer — a vidIQ-style slide-out panel of badges, opened from the
 * trophy icon in the top bar. Earned badges sit at the top (in colour); locked
 * ones are greyed with their unlock criteria. Keeps Profile & Progress clean.
 */
export function AchievementsDrawer({ open, onClose, unlocked, points }: Props) {
  const total = ACHIEVEMENTS.length;
  const earned = unlocked.length;

  // Earned first, then locked — feels rewarding.
  const sorted = [...ACHIEVEMENTS].sort((a, b) => {
    const au = unlocked.includes(a.id) ? 0 : 1;
    const bu = unlocked.includes(b.id) ? 0 : 1;
    return au - bu;
  });

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[130]">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            className="absolute top-0 right-0 bottom-0 w-[88%] max-w-sm flex flex-col bg-[var(--bg-primary)] border-l border-[var(--border-default)] shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)] flex-shrink-0">
              <div className="flex items-center gap-2">
                <Trophy size={18} className="text-[var(--accent-primary)]" />
                <h2 className="text-lg font-serif font-medium text-[var(--text-primary)]">Achievements</h2>
              </div>
              <button
                onClick={onClose}
                aria-label="Close achievements"
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Summary */}
            <div className="px-5 py-3 flex items-center justify-between border-b border-[var(--border-subtle)] flex-shrink-0">
              <span className="text-[12px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                {earned} of {total} earned
              </span>
              <span className="text-[13px] font-serif text-[var(--accent-primary)]">
                ✦ {points.toLocaleString()} points
              </span>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
              {sorted.map((a) => {
                const got = unlocked.includes(a.id);
                const Icon = a.icon;
                return (
                  <div
                    key={a.id}
                    className="flex items-center gap-3 p-3 rounded-2xl border transition-all"
                    style={{
                      borderColor: got ? a.color + '50' : 'var(--border-subtle)',
                      background: got ? a.color + '12' : 'var(--bg-surface)',
                      opacity: got ? 1 : 0.6,
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: got ? a.color + '22' : 'var(--bg-base)',
                        border: `1px solid ${got ? a.color + '55' : 'var(--border-default)'}`,
                      }}
                    >
                      {got ? <Icon size={18} style={{ color: a.color }} /> : <Lock size={15} className="text-[var(--text-muted)]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-[14px] font-semibold text-[var(--text-primary)] truncate">{a.name}</p>
                        {got && <Check size={13} style={{ color: a.color }} className="flex-shrink-0" />}
                      </div>
                      <p className="text-[12px] text-[var(--text-secondary)] truncate">
                        {got ? a.desc : a.criteria}
                      </p>
                    </div>
                    <span
                      className="text-[11px] font-bold flex-shrink-0"
                      style={{ color: got ? a.color : 'var(--text-muted)' }}
                    >
                      +{a.points}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default AchievementsDrawer;
