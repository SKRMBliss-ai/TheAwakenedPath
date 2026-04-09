import { useState, useEffect } from 'react';
import { Play, X, Headphones, Sparkles, Volume2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { VoiceService, useVoiceActive } from '../../services/voiceService';
import { useAuth } from '../../features/auth/AuthContext';
import { cn } from '../../lib/utils';

const GUIDANCE_SCRIPT = `
Welcome to the Awakened Path environment. I am your guide, here to help you navigate our sacred space and choose the right path for your evolution.

Currently, you are in the base experience. Here you can sample our daily meditation portals and presence tools. However, the true transformation lies within our full wisdom library.

We offer three distinct tiers for your journey:

First, our Monthly Flow. At forty-nine ninety-nine per month, it provides an accessible entry point with full access to all courses, including 'Wisdom Untethered' and 'The Power of Now'. It is ideal if you are just beginning to explore and want to see if this resonance matches your spirit.

Second, our annual Sacred Commitment. Most travelers choose this path. At three hundred and ninety-nine dollars, you save thirty-three percent compared to monthly billing. It represents a deeper dedication to your self-realization, ensuring you have the time needed to truly integrate these life-changing realizations.

Finally, we have the Eternal Traveler Lifetime pass. For a one-time investment of nine hundred and ninety-nine dollars, you gain permanent access to everything we have now, and everything we will ever create. It is a one-time choice for a lifetime of awakening.

Why buy? Because the noise of the mind never stops on its own. These curated courses and direct practices provide the architecture for you to finally step back as the witness. Every plan comes with our fifteen-day, one hundred percent refund guarantee—a risk-free bridge to your inner peace.

Choose the path that resonates with your current depth. We are honored to walk beside you.
`;

export const VoiceGuidance = () => {
  const { isAccessValid, loading } = useAuth();
  const isSpeaking = useVoiceActive();
  const [showFull, setShowFull] = useState(false);
  const [hasDismissed, setHasDismissed] = useState(false);

  // Auto-show nudge for basic users after a short delay
  useEffect(() => {
    if (!loading && !isAccessValid && !hasDismissed) {
      const timer = setTimeout(() => {
        setShowFull(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isAccessValid, loading, hasDismissed]);

  if (loading || isAccessValid || hasDismissed) return null;

  const toggleGuidance = () => {
    if (isSpeaking) {
      VoiceService.stop();
    } else {
      VoiceService.speak(GUIDANCE_SCRIPT, {
        gender: 'FEMALE',
        voice: 'en-US-Neural2-F', // Premium Google voice
        promptContext: 'Spiritual, calming, encouraging guide'
      });
    }
  };

  return (
    <div className="fixed bottom-24 right-6 z-[60] flex flex-col items-end gap-3 pointer-events-none">
      <AnimatePresence>
        {showFull && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="pointer-events-auto w-[320px] bg-[var(--bg-surface)] backdrop-blur-xl border border-[var(--border-subtle)] rounded-2xl shadow-2xl p-5 relative overflow-hidden group"
          >
            {/* Animated Glow Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-primary-dim)] to-transparent opacity-30 pointer-events-none" />
            
            <button 
              onClick={() => {
                setShowFull(false);
                VoiceService.stop();
              }}
              className="absolute top-3 right-3 p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-[var(--accent-primary-dim)] flex items-center justify-center flex-shrink-0 border border-[var(--accent-primary)]/20">
                <Headphones className="w-5 h-5 text-[var(--accent-primary)]" />
              </div>
              <div>
                <h3 className="text-sm font-serif font-bold text-[var(--text-primary)] mb-1">Audio Guide Available</h3>
                <p className="text-[12px] text-[var(--text-muted)] leading-relaxed italic">
                  Let me help you navigate your journey and choose the right path.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={toggleGuidance}
                className={cn(
                  "w-full py-3 px-4 rounded-xl flex items-center justify-center gap-3 transition-all duration-500 font-medium text-sm",
                  isSpeaking 
                    ? "bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/30"
                    : "bg-[var(--accent-primary)] text-white shadow-[0_0_20px_var(--card-glow-base)] hover:scale-[1.02] active:scale-[0.98]"
                )}
              >
                {isSpeaking ? (
                  <>
                    <div className="flex gap-1 items-center h-4">
                      {[1, 2, 3].map(i => (
                        <motion.div
                          key={i}
                          animate={{ height: [4, 12, 4] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                          className="w-0.5 bg-[var(--accent-primary)] rounded-full"
                        />
                      ))}
                    </div>
                    <span>Guiding Now...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Listen to Voice Guide</span>
                  </>
                )}
              </button>

              {!isSpeaking && (
                <button 
                  onClick={() => setHasDismissed(true)}
                  className="w-full py-2 text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors uppercase tracking-[0.1em] font-medium"
                >
                  I'll explore myself
                </button>
              )}
            </div>

            {/* Micro-info about benefits */}
            {isSpeaking && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 pt-4 border-t border-[var(--border-subtle)]/30"
              >
                <div className="grid grid-cols-2 gap-2 text-[10px] text-[var(--text-muted)]">
                  <div className="flex items-center gap-1.5 uppercase tracking-tighter">
                    <Sparkles className="w-3 h-3 text-[var(--accent-primary)]" />
                    <span>Full Courses</span>
                  </div>
                  <div className="flex items-center gap-1.5 uppercase tracking-tighter">
                    <Volume2 className="w-3 h-3 text-[var(--accent-primary)]" />
                    <span>Premium Audio</span>
                  </div>
                  <div className="flex items-center gap-1.5 uppercase tracking-tighter">
                    <Info className="w-3 h-3 text-[var(--accent-primary)]" />
                    <span>15-Day Refund</span>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {!showFull && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setShowFull(true)}
            className="pointer-events-auto p-4 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xl text-[var(--accent-primary)] hover:scale-110 active:scale-95 transition-all group relative"
          >
            <div className="absolute inset-0 rounded-full animate-ping bg-[var(--accent-primary)]/10" />
            <Headphones className="w-6 h-6 relative z-10" />
            <motion.div 
              className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full border-2 border-[var(--bg-surface)]"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};
