import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Zap, PenLine, Heart } from 'lucide-react';
import { useTheme } from '../../theme/ThemeSystem';

const STORAGE_KEY = 'mind-gym-welcomed-v1';

const STEPS = [
  { icon: BookOpen, title: 'Learn', text: 'A short teaching for the day.' },
  { icon: Zap, title: 'Practice', text: 'One small practice to try.' },
  { icon: PenLine, title: 'Reflect', text: 'Write a line in your journal.' },
  { icon: Heart, title: 'Live it', text: 'Carry it into your day.' },
];

/**
 * FirstRunWelcome — a calm, one-screen orientation shown once to new users.
 * Self-contained: it gates itself on a localStorage flag, so it can simply be
 * rendered inside the authenticated app without parent state.
 */
export function FirstRunWelcome() {
  const { mode } = useTheme();
  const [open, setOpen] = useState(() => {
    try { return !localStorage.getItem(STORAGE_KEY); } catch { return false; }
  });

  // Accent is light in dark-mode and dark in light-mode, so text/icons sitting
  // ON the accent need the opposite tone to stay crisp.
  const onAccent = mode === 'dark' ? '#15302F' : '#FFFFFF';

  const close = () => {
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch { /* ignore */ }
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="absolute inset-0 bg-black/55 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 18 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            className="relative w-full max-w-md rounded-[28px] overflow-hidden border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-2xl"
          >
            <div className="h-1 w-full" style={{ background: 'var(--accent-primary)' }} />

            <div className="p-7 sm:p-9 text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.35em]" style={{ color: 'var(--accent-primary)' }}>
                Welcome
              </p>
              <h2 className="mt-2 text-[26px] font-serif font-light" style={{ color: 'var(--text-primary)' }}>
                A calmer mind, daily.
              </h2>
              <p className="mt-2 text-[14px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Four small steps each day. A few quiet minutes is all it takes.
              </p>

              <div className="mt-6 space-y-2.5 text-left">
                {STEPS.map(({ icon: Icon, title, text }, i) => (
                  <div
                    key={title}
                    className="flex items-center gap-3 rounded-2xl px-3.5 py-3 border border-[var(--border-subtle)] bg-[var(--bg-base)]"
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'var(--accent-primary)', color: onAccent }}
                    >
                      <Icon size={16} />
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {i + 1}. {title}
                      </p>
                      <p className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>
                        {text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={close}
                className="mt-7 w-full py-3.5 rounded-2xl font-bold text-[13px] uppercase tracking-[0.15em] transition-all active:scale-[0.98]"
                style={{ background: 'var(--accent-primary)', color: onAccent }}
              >
                Begin
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default FirstRunWelcome;
