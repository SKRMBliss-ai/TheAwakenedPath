import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, RotateCcw, SkipForward, Volume2, VolumeX,
  Sparkles, CheckCircle2, Award, ChevronRight,
  Flame, Heart, Info, X
} from 'lucide-react';

// --- Type Definitions ---
export type BreathPhase = 'inhale' | 'hold' | 'exhale' | 'rest' | 'prep';

export interface PhaseConfig {
  phase: BreathPhase;
  label: string;
  duration: number; // in seconds
  instruction: string;
  subText?: string;
}

export interface TechniqueSpec {
  id: string;
  name: string;
  sanskritName: string;
  durationSec: number;
  description: string;
  benefits: string[];
  mudra: string;
  phases: PhaseConfig[];
  accentColor: string;
  glowGradient: string;
}

// --- Beginner 5-Technique Specifications ---
export const BEGINNER_PRANAYAM_TECHNIQUES: TechniqueSpec[] = [
  {
    id: 'anulom-vilom',
    name: 'Alternate Nostril Breathing',
    sanskritName: 'Anulom Vilom Pranayam',
    durationSec: 300,
    description: 'Rhythmic breath alternating between nostrils to balance brain hemispheres and calm the nervous system.',
    benefits: ['Balances Left & Right Hemispheres', 'Lowers Stress & Cortisol', 'Improves Sleep Quality'],
    mudra: 'Vishnu Mudra: Right thumb closes right nostril, ring finger closes left nostril.',
    accentColor: '#38bdf8',
    glowGradient: 'from-sky-500/30 via-cyan-400/20 to-transparent',
    phases: [
      { phase: 'inhale', label: 'Inhale Left', duration: 4, instruction: 'Close right nostril with thumb. Inhale deeply through left.' },
      { phase: 'hold', label: 'Hold Air', duration: 4, instruction: 'Close both nostrils. Hold gently with peaceful mind.' },
      { phase: 'exhale', label: 'Exhale Right', duration: 4, instruction: 'Release right nostril. Exhale completely.' },
      { phase: 'rest', label: 'Pause', duration: 2, instruction: 'Pause briefly before reversing.' },
      { phase: 'inhale', label: 'Inhale Right', duration: 4, instruction: 'Inhale deeply through right nostril.' },
      { phase: 'hold', label: 'Hold Air', duration: 4, instruction: 'Close both nostrils gently.' },
      { phase: 'exhale', label: 'Exhale Left', duration: 4, instruction: 'Release left nostril. Exhale fully.' },
      { phase: 'rest', label: 'Pause', duration: 2, instruction: 'Complete one full cycle.' }
    ]
  },
  {
    id: 'kapalbhati',
    name: 'Skull Shining Breath',
    sanskritName: 'Kapalbhati Pranayam',
    durationSec: 300,
    description: 'Active, rhythmic abdominal exhalations paired with passive inhales to purify and energize.',
    benefits: ['Purifies Frontal Brain', 'Energizes Body & Metabolism', 'Strengthens Core Muscles'],
    mudra: 'Gyan Mudra: Rest hands on knees, palm up, index finger touching thumb.',
    accentColor: '#f59e0b',
    glowGradient: 'from-amber-500/30 via-orange-400/20 to-transparent',
    phases: [
      { phase: 'exhale', label: 'Pumping Exhale', duration: 1, instruction: 'Contract abdomen inward sharply. Exhale through nose.' },
      { phase: 'inhale', label: 'Passive Inhale', duration: 1, instruction: 'Relax belly. Allow natural air inflow.' }
    ]
  },
  {
    id: 'bhastrika',
    name: 'Bellows Breath',
    sanskritName: 'Bhastrika Pranayam',
    durationSec: 300,
    description: 'Equal, vigorous inhaling and exhaling to boost oxygenation and clear respiratory channels.',
    benefits: ['Increases Oxygen Flow', 'Clears Sinuses & Lungs', 'Awakens Mental Alertness'],
    mudra: 'Fists at shoulders during inhale, extend hands upward during exhale.',
    accentColor: '#ef4444',
    glowGradient: 'from-red-500/30 via-rose-400/20 to-transparent',
    phases: [
      { phase: 'inhale', label: 'Vigorous Inhale', duration: 2, instruction: 'Inhale fully expanding chest & lungs.' },
      { phase: 'exhale', label: 'Powerful Exhale', duration: 2, instruction: 'Exhale completely with quick abdominal pulse.' }
    ]
  },
  {
    id: 'bhramari',
    name: 'Humming Bee Breath',
    sanskritName: 'Bhramari Pranayam',
    durationSec: 300,
    description: 'Creating a resonant humming sound on exhale to soothe the auditory nerve and quiet thoughts.',
    benefits: ['Soothes Vagus Nerve', 'Relieves Anger & Anxiety', 'Stimulates Nitric Oxide'],
    mudra: 'Shanmukhi Mudra: Thumbs gently close ears, index fingers over eyelids.',
    accentColor: '#a855f7',
    glowGradient: 'from-purple-500/30 via-indigo-400/20 to-transparent',
    phases: [
      { phase: 'inhale', label: 'Deep Inhale', duration: 4, instruction: 'Fill chest with deep, soft breath.' },
      { phase: 'hold', label: 'Gentle Hold', duration: 2, instruction: 'Place thumbs on ears gently.' },
      { phase: 'exhale', label: 'Humming Exhale', duration: 6, instruction: 'Make a steady humming sound "Mmm..." like a bee.' },
      { phase: 'rest', label: 'Pause', duration: 2, instruction: 'Feel internal acoustic vibrations.' }
    ]
  },
  {
    id: 'udgeeth',
    name: 'Om Chanting Breath',
    sanskritName: 'Udgeeth Pranayam',
    durationSec: 300,
    description: 'Deep inhalation followed by a slow, resonant vocalized Om chant on exhale for deep spiritual peace.',
    benefits: ['Deep Vagal Regulation', 'Centers Consciousness', 'Settles Mental Fluctuations'],
    mudra: 'Dhyana Mudra: Right hand resting inside left hand in lap.',
    accentColor: '#10b981',
    glowGradient: 'from-emerald-500/30 via-teal-400/20 to-transparent',
    phases: [
      { phase: 'inhale', label: 'Deep Inhale', duration: 4, instruction: 'Inhale slowly and deeply into lower abdomen.' },
      { phase: 'exhale', label: 'Chant OM...', duration: 8, instruction: 'Exhale with long, resonant chant of "OM..."' },
      { phase: 'rest', label: 'Silence', duration: 3, instruction: 'Absorb the stillness in the heart center.' }
    ]
  }
];

// --- Web Audio Synthesizer helper for bell chime ---
function playBellSound(frequency = 432, durationSec = 2) {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durationSec);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + durationSec);
  } catch {
    // Graceful fallback if audio context blocked by browser policy
  }
}

// --- Component Props ---
interface BeginnerPranayamPracticeProps {
  onBack?: () => void;
  onCompleteSession?: (totalSec: number, xpEarned: number) => void;
}

export const BeginnerPranayamPractice: React.FC<BeginnerPranayamPracticeProps> = ({
  onBack,
  onCompleteSession
}) => {
  // State
  const [techIndex, setTechIndex] = useState(0);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [techniqueTimeLeft, setTechniqueTimeLeft] = useState(BEGINNER_PRANAYAM_TECHNIQUES[0].durationSec);
  const [phaseTimeLeft, setPhaseTimeLeft] = useState(BEGINNER_PRANAYAM_TECHNIQUES[0].phases[0].duration);
  const [completedTechniques, setCompletedTechniques] = useState<string[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [showMudraModal, setShowMudraModal] = useState(false);

  const activeTechnique = BEGINNER_PRANAYAM_TECHNIQUES[techIndex];
  const activePhase = activeTechnique.phases[phaseIndex % activeTechnique.phases.length];

  // Ref for timer
  const timerRef = useRef<number | null>(null);

  // Switch technique
  const handleSelectTechnique = (index: number) => {
    setTechIndex(index);
    setPhaseIndex(0);
    setTechniqueTimeLeft(BEGINNER_PRANAYAM_TECHNIQUES[index].durationSec);
    setPhaseTimeLeft(BEGINNER_PRANAYAM_TECHNIQUES[index].phases[0].duration);
    setIsPlaying(false);
  };

  // Play / Pause toggle
  const togglePlay = () => {
    if (!isPlaying && soundEnabled) {
      playBellSound(432, 1.5);
    }
    setIsPlaying(!isPlaying);
  };

  // Skip to next technique
  const handleNextTechnique = useCallback(() => {
    if (!completedTechniques.includes(activeTechnique.id)) {
      setCompletedTechniques((prev) => [...prev, activeTechnique.id]);
    }

    if (techIndex < BEGINNER_PRANAYAM_TECHNIQUES.length - 1) {
      handleSelectTechnique(techIndex + 1);
    } else {
      setIsPlaying(false);
      setShowSummary(true);
      if (soundEnabled) playBellSound(528, 3);
      if (onCompleteSession) {
        onCompleteSession(1500, 250);
      }
    }
  }, [activeTechnique.id, completedTechniques, onCompleteSession, soundEnabled, techIndex]);

  // Timer Tick
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = window.setInterval(() => {
        // Decrement phase time
        setPhaseTimeLeft((prevPhaseTime) => {
          if (prevPhaseTime <= 1) {
            // Move to next phase
            setPhaseIndex((prevPhaseIdx) => {
              const nextIdx = (prevPhaseIdx + 1) % activeTechnique.phases.length;
              const nextPhase = activeTechnique.phases[nextIdx];
              setPhaseTimeLeft(nextPhase.duration);

              // Sound cue on phase transition
              if (soundEnabled) {
                if (nextPhase.phase === 'inhale') playBellSound(396, 1);
                else if (nextPhase.phase === 'exhale') playBellSound(432, 1);
                else if (nextPhase.phase === 'hold') playBellSound(528, 1);
              }

              return nextIdx;
            });
            return 1;
          }
          return prevPhaseTime - 1;
        });

        // Decrement overall technique time
        setTechniqueTimeLeft((prevTechTime) => {
          if (prevTechTime <= 1) {
            handleNextTechnique();
            return activeTechnique.durationSec;
          }
          return prevTechTime - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeTechnique, handleNextTechnique, isPlaying, soundEnabled]);

  // Overall session progress percent
  const totalCompletedSec = completedTechniques.length * 300 + (300 - techniqueTimeLeft);
  const overallProgressPercent = Math.min(100, Math.round((totalCompletedSec / 1500) * 100));

  // Orb scale animation mapping for breath phases
  const getOrbScale = () => {
    switch (activePhase.phase) {
      case 'inhale':
        return 1.45;
      case 'hold':
        return 1.45;
      case 'exhale':
        return 0.85;
      case 'rest':
        return 0.85;
      default:
        return 1;
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col items-center justify-between p-4 md:p-8 overflow-hidden select-none">
      {/* Background Ambient Glow */}
      <div
        className={`absolute inset-0 bg-gradient-to-b ${activeTechnique.glowGradient} opacity-50 blur-3xl pointer-events-none transition-all duration-1000`}
      />

      {/* Top Header Navigation & Session Stats */}
      <header className="relative z-10 w-full max-w-4xl flex items-center justify-between gap-4 py-2">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all text-sm font-medium"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span className="font-serif text-lg font-semibold tracking-wide text-slate-100">
            Daily 5 Beginner Pranayama
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-full bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white transition-all"
            title={soundEnabled ? 'Mute Audio Cues' : 'Unmute Audio Cues'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>
        </div>
      </header>

      {/* Technique Navigation Tabs */}
      <nav className="relative z-10 w-full max-w-4xl mt-4">
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2 scrollbar-none">
          {BEGINNER_PRANAYAM_TECHNIQUES.map((tech, idx) => {
            const isActive = idx === techIndex;
            const isDone = completedTechniques.includes(tech.id);
            return (
              <button
                key={tech.id}
                onClick={() => handleSelectTechnique(idx)}
                className={`flex-1 min-w-[130px] p-2.5 rounded-xl border transition-all text-left flex flex-col gap-1 ${
                  isActive
                    ? 'bg-slate-900 border-cyan-500/60 shadow-[0_0_20px_rgba(56,189,248,0.2)]'
                    : isDone
                    ? 'bg-slate-900/40 border-emerald-500/40 text-slate-400'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                    Step {idx + 1}
                  </span>
                  {isDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tech.accentColor }} />
                  )}
                </div>
                <span className={`text-xs font-semibold truncate ${isActive ? 'text-white' : 'text-slate-300'}`}>
                  {tech.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Overall Progress Line */}
        <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-2 border border-slate-800">
          <motion.div
            className="bg-gradient-to-r from-sky-400 via-cyan-400 to-emerald-400 h-full"
            animate={{ width: `${overallProgressPercent}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </nav>

      {/* Main Breathing Visual Circle & Active Guidance */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center my-6 text-center max-w-2xl w-full">
        {/* Technique Title & Sanskrit Badge */}
        <motion.div
          key={activeTechnique.id}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex flex-col items-center"
        >
          <span className="text-xs font-mono tracking-widest text-cyan-400 uppercase bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-800/50 mb-2">
            {activeTechnique.sanskritName}
          </span>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-white tracking-wide">
            {activeTechnique.name}
          </h2>
        </motion.div>

        {/* Animated Sacred Orb Visual */}
        <div className="relative flex items-center justify-center w-72 h-72 md:w-80 md:h-80 my-4">
          {/* Outer Ripple Rings */}
          <motion.div
            animate={{ scale: isPlaying ? [1, 1.25, 1] : 1, opacity: isPlaying ? [0.2, 0.5, 0.2] : 0.2 }}
            transition={{ duration: activePhase.duration, ease: 'easeInOut', repeat: Infinity }}
            className="absolute inset-0 rounded-full border border-cyan-500/30"
          />
          <motion.div
            animate={{ scale: isPlaying ? [1, 1.12, 1] : 1 }}
            transition={{ duration: activePhase.duration, ease: 'easeInOut', repeat: Infinity }}
            className="absolute inset-4 rounded-full border border-cyan-400/20"
          />

          {/* Central Breath Orb */}
          <motion.div
            animate={{ scale: isPlaying ? getOrbScale() : 1 }}
            transition={{ duration: activePhase.duration, ease: 'easeInOut' }}
            className="w-44 h-44 rounded-full bg-gradient-to-br from-sky-400 via-cyan-500 to-blue-600 shadow-[0_0_60px_rgba(56,189,248,0.5)] flex flex-col items-center justify-center z-10 cursor-pointer"
            onClick={togglePlay}
          >
            <span className="text-sm font-mono tracking-widest uppercase text-sky-100 font-semibold drop-shadow-md">
              {activePhase.label}
            </span>
            <span className="text-4xl font-serif font-bold text-white mt-1 drop-shadow-md">
              {phaseTimeLeft}s
            </span>
          </motion.div>
        </div>

        {/* Dynamic Phase Instruction Banner */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeTechnique.id}-${activePhase.phase}-${phaseIndex}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-6 p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-xl max-w-lg w-full backdrop-blur-md"
          >
            <p className="text-base md:text-lg font-medium text-slate-100">
              {activePhase.instruction}
            </p>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Practice Controls & Mudra Info */}
      <footer className="relative z-10 w-full max-w-xl flex flex-col items-center gap-4">
        {/* Playback Button Bar */}
        <div className="flex items-center gap-6 bg-slate-900/90 border border-slate-800 px-6 py-3 rounded-full backdrop-blur-md shadow-2xl">
          <button
            onClick={() => {
              setPhaseIndex(0);
              setTechniqueTimeLeft(activeTechnique.durationSec);
              setPhaseTimeLeft(activeTechnique.phases[0].duration);
            }}
            className="p-2.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            title="Restart Technique"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={togglePlay}
            className="p-4 rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 text-slate-950 hover:scale-105 shadow-[0_0_25px_rgba(56,189,248,0.4)] transition-all font-bold"
          >
            {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
          </button>

          <button
            onClick={handleNextTechnique}
            className="p-2.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            title="Next Technique"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Technique Mudra Info Trigger */}
        <button
          onClick={() => setShowMudraModal(true)}
          className="flex items-center gap-2 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          <Info className="w-3.5 h-3.5" />
          <span>View Hand Position & Mudra</span>
        </button>
      </footer>

      {/* Mudra Info Modal */}
      <AnimatePresence>
        {showMudraModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-md w-full shadow-2xl relative"
            >
              <button
                onClick={() => setShowMudraModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-serif font-bold text-white mb-2">
                {activeTechnique.name} Mudra & Position
              </h3>
              <p className="text-sm text-cyan-400 font-mono mb-4">
                {activeTechnique.sanskritName}
              </p>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-4 text-sm text-slate-300 leading-relaxed">
                {activeTechnique.mudra}
              </div>

              <div className="space-y-2">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  Key Benefits:
                </span>
                <ul className="space-y-1">
                  {activeTechnique.benefits.map((b, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-200">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Session Completion Modal */}
      <AnimatePresence>
        {showSummary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-lg flex items-center justify-center p-4 text-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-slate-900 border border-cyan-500/40 p-8 rounded-3xl max-w-lg w-full shadow-[0_0_50px_rgba(56,189,248,0.3)] flex flex-col items-center gap-6"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg">
                <Award className="w-8 h-8 text-slate-950" />
              </div>

              <div>
                <h3 className="text-3xl font-serif font-bold text-white mb-1">
                  Pranayama Practice Complete!
                </h3>
                <p className="text-sm text-slate-400">
                  You completed all 5 beginner breathwork techniques (25 mins).
                </p>
              </div>

              <div className="flex gap-4 w-full">
                <div className="flex-1 bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col items-center">
                  <Flame className="w-5 h-5 text-amber-400 mb-1" />
                  <span className="text-2xl font-bold text-white">+250 XP</span>
                  <span className="text-xs text-slate-400 font-mono">MindGym Earned</span>
                </div>
                <div className="flex-1 bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col items-center">
                  <Heart className="w-5 h-5 text-rose-400 mb-1" />
                  <span className="text-2xl font-bold text-white">100%</span>
                  <span className="text-xs text-slate-400 font-mono">Vagal Tone Resonance</span>
                </div>
              </div>

              <button
                onClick={onBack}
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 text-slate-950 font-bold hover:scale-105 transition-all shadow-lg"
              >
                Return to MindGym Dashboard
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BeginnerPranayamPractice;
