import { useState, useEffect } from 'react';
import { Play, X, Pause, Square } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { VoiceService, useVoiceStatus } from '../../services/voiceService';

import { cn } from '../../lib/utils';

import { QUESTION_META } from '../../features/practices/TodayPath';

const getPricing = (timezone: string) => {
  if (timezone === 'Asia/Calcutta' || timezone === 'Asia/Kolkata') {
    return {
      monthly: 'seven hundred and ninety-nine rupees',
      annual: 'seven thousand nine hundred and ninety-nine rupees',
      lifetime: 'fourteen thousand nine hundred and ninety-nine rupees'
    };
  }
  if (timezone === 'Europe/London') {
    return {
      monthly: 'eight pounds ninety-nine',
      annual: 'eighty-nine pounds ninety-nine',
      lifetime: 'one hundred and sixty-nine pounds ninety-nine'
    };
  }
  if (timezone.startsWith('Europe/')) {
    return {
      monthly: 'nine euros ninety-nine',
      annual: 'ninety-nine euros ninety-nine',
      lifetime: 'one hundred and eighty-nine euros ninety-nine'
    };
  }
  if (timezone.startsWith('Australia/')) {
    return {
      monthly: 'fourteen dollars ninety-nine Australian',
      annual: 'one hundred and forty-nine dollars ninety-nine Australian',
      lifetime: 'two hundred and ninety-nine dollars ninety-nine Australian'
    };
  }
  return {
    monthly: 'nine ninety-nine',
    annual: 'ninety-nine ninety-nine',
    lifetime: 'one hundred and ninety-nine ninety-nine'
  };
};

const getScript = (tab: string, isAccessValid: boolean, assignment: any, timezone: string) => {
  const pricing = getPricing(timezone);
  const qId = assignment?.questionId || 'question1';
  const meta = QUESTION_META[qId] || QUESTION_META['question1'];

  // Higher Priority: Dashboard script (even for trial/sample users)
  if (tab === 'home') {
    const fullTitle = meta.shortTitle.replace(/^Q(\d+)/, 'Wisdom Untethered Question $1');
    return `
      Welcome to your Dashboard. Your presence is the greatest gift you can give yourself.
      Today, your journey leads you to ${fullTitle}. 
      Your sacred intention for today is: ${meta.dailyIntent}.
      By practicing this awareness, you will learn to sit comfortably behind the mental noise, achieving a state of witness consciousness that remains undisturbed by the world.
      May your practice bring you peace.
    `;
  }

  // Power of Now
  if (tab === 'intelligence' || tab === 'journey') {
    return `
      Welcome to the Power of Now. Here, you can immerse yourself in the profound teachings of presence. 
      You can view the video chapters one by one, and your progress will be automatically stored as you journey through. 
      Each session you complete also grants you points towards your expansion. 
      Listen with your heart, and let these insights guide you into the stillness of the eternal present.
    `;
  }

  // Wisdom Untethered
  if (tab === 'wisdom_untethered') {
    return `
      Welcome to Wisdom Untethered. This journey invites you to explore the depth of your awareness. 
      You can go through the spiritual explanations, watch the guided videos, and enter the Practice Room for specific chapter-based practices. 
      To deepen your transformation, we recommend completing at least one featured practice from your dashboard each day. 
      You are always welcome to do more if you feel called to explore further.
    `;
  }

  // Journal / Chapters
  if (tab === 'chapters' || tab === 'journal') {
    return `
      Welcome to your Journal. This is your intimate repository of self-discovery. 
      Here, your reflections transform into stepping stones towards liberation. 
      You can use the Daily Log to capture your current state, and revisit the History section or your Presence Calendar to witness the beautiful arc of your growth over time. 
      Each entry you write grants you fifteen points towards your expansion. 
      We recommend a minimum of one entry per day to maintain your consistency, though you are welcome to reflect as often as your heart requires. 
      Let your words illuminate your path forward.
    `;
  }

  // Practice Room / Situations
  if (tab === 'situations' || tab === 'practices') {
    return `
      You are in the Practice Room. Here, we translate wisdom into living experience. 
      You can choose to follow chapter-wise practices from Wisdom Untethered, or explore our complete library to find a practice that perfectly matches your mood and situation today. 
      Whether it’s a body scan to ground your awareness or a guided meditation to quiet the mind, these tools are here to help you maintain presence in the midst of life's daily dance. 
      Each practice you complete grants you thirty points towards your expansion, and stay tuned—we will soon introduce Progressive Challenges to further deepen your journey.
    `;
  }

  // Progress / Stats / Dashboard
  if (tab === 'stats' || tab === 'progress') {
    return `
      Welcome to your Journey Reflection. Here, you can witness the expansion of your awareness through the metrics of consistency. 
      At the top, your Course Progress cards show how much of the internal curriculum you have explored—from the Power of Now to the Wisdom of the Untethered Soul.
      
      The Practice Consistency grid represents your last 28 days. Each glowing box is a moment you chose presence over distraction. 
      As you engage, you will earn Medals—sacred milestones that honor your dedication. These are found in the Achievement section, representing the growth of your inner fire.
      
      To revisit your past insights, scroll to the bottom of this screen. There, in the Practice Ledger and Past Reflections, you can witness the evolution of your own consciousness through your previous journal entries. 
      Every step is a victory. Let these charts remind you that while the destination is here and now, the path is a beautiful unfolding.
    `;
  }

  // Music Hub
  if (tab === 'music') {
    return `
      Welcome to Sacred Soundscapes. Please note that these individual journeys are not included in the standard membership. 
      Each track can be purchased separately to become part of your permanent collection.
      If you require a continuous experience—such as one hour, three hours, or even ten hours for deep meditation or sleep—simply reach out to us via the WhatsApp link at the bottom of the screen. 
      Let these sacred vibrations guide you into the depth of your soul.
    `;
  }

  // Fallback to Paywall/Upgrade script if not premium OR on paywall tab
  if (!isAccessValid || tab === 'paywall') {
    return `
      Welcome to your Journey to Inner Freedom. I am your guide, here to help you navigate our sacred space and choose the right path for your evolution.
      Currently, you are experiencing our limited portals. The true transformation lies within our full library of wisdom.
      We offer three distinct tiers:
      First, our Monthly Flow at ${pricing.monthly}.
      Second, our annual Sacred Commitment at ${pricing.annual}.
      Finally, we have the Eternal Traveler Lifetime pass at ${pricing.lifetime}.
      Choose the path that resonates with your current depth. We are honored to walk beside you.
    `;
  }

  return "Welcome to your sacred space. I am here to guide your journey to inner freedom. Wherever you are, simply be here now.";
};

export const VoiceGuidance = ({
  preferredVoice = 'en-GB-Chirp3-HD-Despina',
  activeTab = 'home',
  isAccessValid = false,
  assignment = null,
  bottomOffset = 108,
  isInline = false
}: {
  preferredVoice?: string;
  activeTab?: string;
  isAccessValid?: boolean;
  assignment?: any;
  bottomOffset?: number;
  isInline?: boolean;
}) => {
  const { status, category } = useVoiceStatus();
  const isSpeaking = status === 'playing' && category === 'tts';
  const isPaused = status === 'paused' && category === 'tts';
  const [showFull, setShowFull] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [isPulsating, setIsPulsating] = useState(false);
  const [isNewUser, setIsNewUser] = useState(() => {
    return !localStorage.getItem('awakened_path_guide_familiar');
  });

  // Detect location for pricing
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const currentScript = getScript(activeTab, isAccessValid, assignment, timezone);

  // Manage Pulse andfamiliarity state
  useEffect(() => {
    // Stop any existing pulse
    setIsPulsating(false);

    // If they are familiar, do nothing
    if (!isNewUser) return;

    // Trigger pulse on screen switch for new users
    setIsPulsating(true);
    const pulseTimer = setTimeout(() => {
      setIsPulsating(false);
    }, 5000);

    return () => clearTimeout(pulseTimer);
  }, [activeTab, isNewUser]);

  // Preload Voice
  useEffect(() => {
    const segments = currentScript.split(/\n\n+/).filter(s => s.trim().length > 0);
    segments.forEach(segment => {
      VoiceService.preloadText(segment, {
        voice: preferredVoice,
        gender: preferredVoice.includes('-D') ? 'MALE' : 'FEMALE'
      });
    });
  }, [preferredVoice, currentScript]);

  // Sync isPreparing with service status
  useEffect(() => {
    if (status === 'idle') {
      setIsPreparing(false);
    }
  }, [status]);

  const toggleGuidance = async () => {
    // Mark user as familiar
    if (isNewUser) {
      localStorage.setItem('awakened_path_guide_familiar', 'true');
      setIsNewUser(false);
    }

    if (isSpeaking) {
      VoiceService.stop();
    } else {
      setIsPreparing(true);
      console.log(`[VoiceGuidance] UI triggered speak on tab '${activeTab}' with persona: ${preferredVoice}`);
      try {
        await VoiceService.speak(currentScript, {
          gender: preferredVoice.includes('-D') ? 'MALE' : 'FEMALE',
          voice: preferredVoice,
          promptContext: `Spiritual, calming, encouraging guide for ${activeTab} context`
        });
      } catch (err) {
        console.error(`[VoiceGuidance] Speak failure:`, err);
      } finally {
        setIsPreparing(false);
      }
    }
  };

  return (
    <div 
      className={cn(
        "z-[100] flex flex-col items-end gap-3 pointer-events-none",
        !isInline && "fixed right-6"
      )}
      style={!isInline ? { bottom: bottomOffset } : {}}
    >
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
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[var(--accent-primary)]/30 relative z-10 shadow-lg">
                  <img
                    src="/guide-avatar.webp"
                    alt="Voice Presence"
                    className="w-full h-full object-cover object-[center_30%]"
                  />
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
                <h3 className="text-lg font-serif font-medium text-[var(--text-primary)] mb-1 tracking-wide">
                  {isSpeaking ? "Voice Presence" : "Voice Guide"}
                </h3>
                <p className="text-[12px] text-[var(--text-primary)] leading-tight font-serif">
                  {isSpeaking
                    ? "Listen with your heart."
                    : "Guidance for your journey."}
                </p>
              </div>
            </div>

            <div className="min-h-[70px] flex items-center mb-4">
              <AnimatePresence mode="wait">
                {(status === 'idle' || category !== 'tts') ? (
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
                        onClick={() => isPaused ? VoiceService.resume('tts') : VoiceService.pause()}
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
          </motion.div>
        )}

        {!showFull && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setShowFull(true)}
            className="pointer-events-auto w-16 h-16 rounded-full bg-[var(--bg-surface)] border border-[var(--accent-primary)]/45 shadow-xl overflow-hidden hover:scale-110 active:scale-95 transition-all relative group p-0"
          >
            <img
              src="/guide-avatar.webp"
              alt="Voice Presence"
              className="w-full h-full object-cover object-[center_30%]"
            />
            {isPulsating && (
              <motion.div
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 rounded-full bg-[var(--accent-primary)] z-0"
              />
            )}
            {/* Hover indicator for familiar users */}
            {!isPulsating && !isNewUser && (
              <div className="absolute inset-0 bg-[var(--accent-primary)]/0 group-hover:bg-[var(--accent-primary)]/10 transition-colors" />
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};
