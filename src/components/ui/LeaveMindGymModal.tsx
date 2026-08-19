import { motion, AnimatePresence } from 'framer-motion';
import { AnchorButton } from './SacredUI';

interface LeaveMindGymModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

/**
 * Warns before the logo click takes someone out of the SPA entirely, onto
 * Soulful Intelligence's own site. Styled to match SacredWelcomeModal — same
 * backdrop, card shape and accent bar — so a confirmation dialog doesn't look
 * like a foreign browser popup dropped into the app.
 */
export function LeaveMindGymModal({ isOpen, onCancel, onConfirm }: LeaveMindGymModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="leave-mindgym-title"
            className="relative w-full max-w-sm bg-[var(--bg-surface)] rounded-[28px] overflow-hidden shadow-2xl border border-[var(--border-default)] backdrop-blur-xl"
          >
            {/* Top accent bar — same device SacredWelcomeModal uses */}
            <div className="h-1.5 bg-[var(--accent-primary)] w-full" />

            <div className="p-7 md:p-9 text-center space-y-5">
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--accent-primary)]">
                  Leaving Mind Gym
                </p>
                <h2 id="leave-mindgym-title" className="text-2xl font-serif font-semibold text-[var(--text-primary)] leading-tight">
                  You're about to<br />step outside.
                </h2>
              </div>

              <div className="w-10 h-px bg-[var(--accent-primary)] mx-auto opacity-30" />

              <p className="text-[13.5px] text-[var(--text-secondary)] font-sans leading-relaxed">
                This takes you out of Mind Gym to <b>Soulful Intelligence Studio</b>'s
                own website. Your practice and progress here stay exactly as they are.
              </p>

              <div className="flex flex-col gap-2.5 pt-2">
                <AnchorButton variant="solid" onClick={onConfirm} className="w-full">
                  Continue to Soulful Intelligence
                </AnchorButton>
                <AnchorButton variant="ghost" onClick={onCancel} className="w-full">
                  Stay in Mind Gym
                </AnchorButton>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
