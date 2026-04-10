import { useState, useEffect } from 'react';
import { Play, X, Headphones, Pause, Square } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { VoiceService, useVoiceStatus } from '../../services/voiceService';

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

export const VoiceGuidance = ({ preferredVoice = 'en-US-Chirp3-HD-Despina' }: { preferredVoice?: string }) => {
  const status = useVoiceStatus();
  const isSpeaking = status === 'playing';
  const isPaused = status === 'paused';
  const [showFull, setShowFull] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);

  // Auto-show nudge after a delay and Preload Voice
  useEffect(() => {
    // Preload segments in parallel to reduce initial delay
    const segments = GUIDANCE_SCRIPT.split(/\n\n+/).filter(s => s.trim().length > 0);
    segments.forEach(segment => {
      VoiceService.preloadText(segment, {
        voice: preferredVoice,
        gender: preferredVoice.includes('-D') ? 'MALE' : 'FEMALE'
      });
    });

    const timer = setTimeout(() => {
      setShowFull(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, [preferredVoice]);

  // Sync isPreparing with service status
  useEffect(() => {
    if (status === 'idle') {
      setIsPreparing(false);
    }
  }, [status]);

  const toggleGuidance = async () => {
    if (isSpeaking) {
      VoiceService.stop();
    } else {
      setIsPreparing(true);
      console.log(`[VoiceGuidance] UI triggered speak with persona: ${preferredVoice}`);
      try {
        await VoiceService.speak(GUIDANCE_SCRIPT, {
          gender: preferredVoice.includes('-D') ? 'MALE' : 'FEMALE',
          voice: preferredVoice,
          promptContext: 'Spiritual, calming, encouraging guide'
        });
      } catch (err) {
        console.error(`[VoiceGuidance] Speak failure:`, err);
      } finally {
        setIsPreparing(false);
      }
    }
  };

  return (
    <div className="fixed bottom-[108px] right-6 z-[100] flex flex-col items-end gap-3 pointer-events-none">
      <AnimatePresence>
        {showFull && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="pointer-events-auto w-[320px] bg-[var(--bg-surface)] border border-[var(--accent-primary)]/20 backdrop-blur-3xl rounded-[32px] shadow-2xl p-6 relative overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={() => setShowFull(false)}
              className="absolute top-4 right-4 p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors z-20"
            >
              <X size={18} />
            </button>

            <div className="flex items-start gap-4 mb-6">
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[var(--accent-primary)]/30 relative z-10 shadow-lg bg-[var(--bg-surface-hover)] flex items-center justify-center">
                  <Headphones className="w-5 h-5 text-[var(--accent-primary)]" />
                </div>
                {isSpeaking && (
                  <motion.div
                    animate={{ scale: [1, 1.4], opacity: [0.4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute inset-0 rounded-full bg-[var(--accent-primary)]/30 z-0"
                  />
                )}
              </div>
              <div className="pt-1">
                <h3 className="text-lg font-serif font-light text-[var(--text-primary)] mb-1 tracking-wide">
                  {isSpeaking ? "Voice Presence" : "Voice Guide"}
                </h3>
                <p className="text-[11px] text-[var(--text-secondary)] leading-tight italic font-serif">
                  {isSpeaking
                    ? "Listen with your heart."
                    : "Guidance for your journey."}
                </p>
              </div>
            </div>

            <div className="min-h-[70px] flex items-center mb-4">
              <AnimatePresence mode="wait">
                {status === 'idle' ? (
                  <motion.button
                    key="listen"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={toggleGuidance}
                    disabled={isPreparing}
                    className={cn(
                      "w-full py-3.5 px-6 rounded-[16px] flex items-center justify-center gap-3 transition-all duration-500 font-bold text-[12px] uppercase tracking-widest relative overflow-hidden bg-[var(--accent-primary)] text-black shadow-lg hover:scale-[1.02] active:scale-[0.98]",
                      isPreparing && "opacity-80"
                    )}
                  >
                    {isPreparing && (
                      <motion.div 
                        initial={{ left: '-100%' }}
                        animate={{ left: '100%' }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                        className="absolute inset-0 bg-white/20 z-0"
                      />
                    )}
                    {isPreparing ? (
                      <div className="flex gap-2 items-center relative z-10">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                          className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full"
                        />
                        <span>Preparing...</span>
                      </div>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-current relative z-10" />
                        <span className="relative z-10">Listen</span>
                      </>
                    )}
                  </motion.button>
                ) : (
                  <motion.div 
                    key="controls"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col gap-3 w-full"
                  >
                    <div className="flex gap-2">
                      <button
                        onClick={() => isPaused ? VoiceService.resume() : VoiceService.pause()}
                        className="flex-1 py-3 px-4 rounded-xl bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/30 text-[var(--accent-primary)] font-bold text-[11px] uppercase tracking-[0.1em] flex items-center justify-center gap-2 transition-all hover:bg-[var(--accent-primary)]/20 shadow-lg shadow-[var(--accent-primary)]/10"
                      >
                        {isPaused ? <Play size={14} fill="currentColor" /> : <Pause size={14} fill="currentColor" />}
                        {isPaused ? 'Resume' : 'Pause'}
                      </button>
                      <button
                        onClick={() => {
                          VoiceService.stop();
                          setIsPreparing(false);
                        }}
                        className="py-3 px-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 font-bold text-[11px] uppercase tracking-[0.1em] flex items-center justify-center gap-2 transition-all hover:bg-rose-500/20"
                      >
                        <Square size={12} fill="currentColor" />
                        Stop
                      </button>
                    </div>
                    
                    {(isSpeaking || isPaused) && (
                      <div className="flex gap-1 justify-center h-3">
                        {[1, 2, 3, 4, 5].map(i => (
                          <motion.div
                            key={i}
                            animate={isSpeaking ? { 
                              height: [3, 10, 3],
                              opacity: [0.3, 0.8, 0.3]
                            } : { 
                              height: 3,
                              opacity: 0.3
                            }}
                            transition={{ 
                              duration: 0.6, 
                              repeat: Infinity, 
                              delay: i * 0.1,
                              ease: "easeInOut"
                            }}
                            className="w-1 bg-[var(--accent-primary)] rounded-full"
                          />
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Removed redundant explore button */}
          </motion.div>
        )}

        {!showFull && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setShowFull(true)}
            className="pointer-events-auto w-16 h-16 rounded-full bg-[var(--bg-surface)] border border-[var(--accent-primary)]/30 shadow-xl overflow-hidden hover:scale-110 active:scale-95 transition-all relative group p-0"
          >
            <div className="absolute inset-0 rounded-full animate-pulse bg-[var(--accent-primary)]/10 z-0" />
            <Headphones size={28} className="relative z-10 text-[var(--accent-primary)]" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};
