import { useState, useEffect } from 'react';
import { Play, X, Headphones } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { VoiceService, useVoiceActive } from '../../services/voiceService';

import { cn } from '../../lib/utils';

const GUIDANCE_SCRIPT = `
Welcome to your Journey to Inner Freedom. I am your guide, here to help you navigate our sacred space and choose the right path for your evolution.

Currently, you are in the base experience. Here you can sample our daily meditation portals and presence tools. However, the true transformation lies within our full library of wisdom.

We offer three distinct tiers for your journey:

First, our Monthly Flow. At forty-nine ninety-nine per month, it provides an accessible entry point with full access to all courses, including 'Wisdom Untethered' and 'The Power of Now'. It is ideal if you are just beginning to explore and want to see if this resonance matches your spirit.

Second, our annual Sacred Commitment. Most travelers choose this path. At three hundred and ninety-nine dollars, you save thirty-three percent compared to monthly billing. It represents a deeper dedication to your self-realization, ensuring you have the time needed to truly integrate these life-changing realizations.

Finally, we have the Eternal Traveler Lifetime pass. For a one-time investment of nine hundred and ninety-nine dollars, you gain permanent access to everything we have now, and everything we will ever create. It is a one-time choice for a lifetime of awakening.

Why buy? Because the noise of the mind never stops on its own. These curated courses and direct practices provide the architecture for you to finally step back as the witness. Every plan comes with our fifteen-day, one hundred percent refund guarantee—a risk-free bridge to your inner peace.

Choose the path that resonates with your current depth. We are honored to walk beside you.
`;

export const VoiceGuidance = () => {
  const isSpeaking = useVoiceActive();
  const [showFull, setShowFull] = useState(false);
  const [hasDismissed, setHasDismissed] = useState(false);

  // Auto-show nudge after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasDismissed) setShowFull(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, [hasDismissed]);

  const toggleGuidance = () => {
    if (isSpeaking) {
      VoiceService.stop();
    } else {
      VoiceService.speak(GUIDANCE_SCRIPT, {
        gender: 'FEMALE',
        voice: 'en-US-Neural2-F',
        promptContext: 'Spiritual, calming, encouraging guide'
      });
    }
  };

  return (
    <div className="fixed bottom-32 right-6 z-[100] flex flex-col items-end gap-3 pointer-events-none">
      <AnimatePresence>
        {showFull && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="pointer-events-auto w-[360px] bg-[var(--bg-surface)] border border-[var(--border-default)] backdrop-blur-3xl rounded-[32px] shadow-2xl p-8 relative overflow-hidden"
          >
            {/* Close Button */}
            <button 
              onClick={() => setShowFull(false)}
              className="absolute top-6 right-6 p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-start gap-5 mb-8">
              <div className="w-14 h-14 rounded-full bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 flex items-center justify-center flex-shrink-0">
                <Headphones className="w-6 h-6 text-[var(--accent-primary)]" />
              </div>
              <div className="pt-1">
                <h3 className="text-xl font-serif font-light text-[var(--text-primary)] mb-2 tracking-wide">Audio Guide Available</h3>
                <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed italic font-serif">
                  Let me help you navigate your journey and choose the right path.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <button
                onClick={toggleGuidance}
                className={cn(
                  "w-full py-5 px-6 rounded-[20px] flex items-center justify-center gap-4 transition-all duration-500 font-bold text-[14px] uppercase tracking-widest",
                  isSpeaking 
                    ? "bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/30"
                    : "bg-[var(--accent-primary)] text-black shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                )}
              >
                {isSpeaking ? (
                  <div className="flex gap-2 items-center">
                    <div className="flex gap-1 items-center h-4">
                      {[1, 2, 3].map(i => (
                        <motion.div
                          key={i}
                          animate={{ height: [4, 12, 4] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                          className="w-1 bg-[var(--accent-primary)] rounded-full"
                        />
                      ))}
                    </div>
                    <span>GUIDING...</span>
                  </div>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-current" />
                    <span>Listen to Voice Guide</span>
                  </>
                )}
              </button>

              <button 
                onClick={() => {
                   setHasDismissed(true);
                   setShowFull(false);
                }}
                className="w-full text-center text-[10px] text-[var(--text-muted)] hover:text-[var(--text-primary)] font-bold uppercase tracking-[0.4em] transition-colors"
              >
                I'll explore myself
              </button>
            </div>
          </motion.div>
        )}

        {!showFull && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setShowFull(true)}
            className="pointer-events-auto p-4 rounded-full bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-2xl text-[var(--accent-primary)] hover:scale-110 active:scale-95 transition-all relative group"
          >
            <div className="absolute inset-0 rounded-full animate-ping bg-[var(--accent-primary)]/10" />
            <Headphones size={24} className="relative z-10" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};
