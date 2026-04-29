import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnchorButton } from './SacredUI';

interface SacredWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  userEmail?: string | null;
}

const SacredWelcomeModal: React.FC<SacredWelcomeModalProps> = ({ 
  isOpen, 
  onClose, 
  planName, 
  userEmail 
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-[var(--bg-surface)] rounded-[32px] overflow-hidden shadow-2xl border border-[var(--border-default)] backdrop-blur-xl"
          >
            {/* Top accent bar */}
            <div className="h-1.5 bg-[var(--accent-primary)] w-full" />

            <div className="p-8 md:p-12 text-center space-y-6">
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--accent-primary)]">
                  Access Granted
                </p>
                <h2 className="text-3xl font-serif font-semibold text-[var(--text-primary)] leading-tight">
                  Welcome to the<br />Deepest Journey.
                </h2>
              </div>

              <div className="w-12 h-px bg-[var(--accent-primary)] mx-auto opacity-30" />

              <div className="space-y-4 text-[var(--text-secondary)] font-sans leading-relaxed">
                <p className="text-sm">Your gateway for <b>{planName}</b> was successful.</p>
                <div className="text-[13px] space-y-3 opacity-90">
                  <p>Step beyond the noise. You now possess full access to the intelligence course, the practice room, and interactive journaling.</p>
                  <p>As a premium member, remember that you also hold the key to <b>2 complimentary personal consultations</b>. Email us whenever you are ready.</p>
                </div>
              </div>

              <div className="pt-4">
                <p className="text-[10px] uppercase tracking-widest text-[var(--accent-primary)] font-bold mb-4">
                  A confirmation email has been sent to
                </p>
                <div className="px-4 py-2 rounded-full bg-[var(--accent-primary)]/5 border border-[var(--accent-primary)]/20 inline-block">
                  <span className="text-xs font-medium text-[var(--text-primary)]">{userEmail}</span>
                </div>
              </div>

              <AnchorButton
                variant="solid"
                onClick={onClose}
                className="w-full mt-4"
              >
                Begin Your Journey
              </AnchorButton>

              <p className="text-[10px] italic text-[var(--text-muted)]">Peace is the way.</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SacredWelcomeModal;
