import { useState, useEffect } from 'react';
import { Heart, Award, Flame, Book, Target, Clock, Eye, Wind, Sun, Moon, Play, Pause, ChevronRight, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

// Types for our app
type PracticeType = 'breath' | 'witness' | 'presence' | 'energy';
type Step = {
  title: string;
  instruction: string;
  guidance: string;
  visual: string;
  duration?: number;
};
type Practice = {
  id: number;
  title: string;
  icon: string;
  xp: number;
  duration: number;
  type: PracticeType;
  book?: string;
  level?: string;
  breathPattern?: number[];
  steps: Step[];
};

export default function UntetheredApp() {
  const [activeTab, setActiveTab] = useState('journey');
  const [darkMode, setDarkMode] = useState(true);
  const [activePractice, setActivePractice] = useState<Practice | null>(null);
  const [practiceState, setPracticeState] = useState<'intro' | 'active'>('intro');
  const [currentStep, setCurrentStep] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [breathPhase, setBreathPhase] = useState('inhale');
  const [breathCount, setBreathCount] = useState(0);
  const [showReward, setShowReward] = useState<{ xp: number; title: string; icon: string } | null>(null);
  const [thoughts, setThoughts] = useState<{ id: number; text: string; x: number; y: number }[]>([]);

  // User Stats (Mock Data)
  const user = {
    level: 5,
    xp: 920,
    xpToNext: 1000,
    streak: 7,
    energy: 72,
    witnessPoints: 145,
    presencePoints: 128,
    zenPoints: 87,
    nowMoments: 42,
    breathSessions: 18
  };

  // Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timer]);

  // Breathing Logic
  useEffect(() => {
    if (activePractice?.type === 'breath' && practiceState === 'active') {
      const pattern = activePractice.breathPattern || [4, 4, 4, 4];
      const phases = ['inhale', 'hold', 'exhale', 'rest'];
      let phaseIndex = 0;

      const interval = setInterval(() => {
        setBreathPhase(phases[phaseIndex]);
        phaseIndex = (phaseIndex + 1) % phases.length;
        if (phaseIndex === 0) setBreathCount((prev) => prev + 1);
      }, pattern[phaseIndex % pattern.length] * 1000);

      return () => clearInterval(interval);
    }
  }, [activePractice, practiceState]);

  // Thought Generation (Witness Practice)
  useEffect(() => {
    if (activePractice?.type === 'witness' && practiceState === 'active') {
      const thoughtsList = [
        "What if I fail?", "I should have...", "They think I'm...",
        "I need to...", "Why did I...", "Tomorrow I must..."
      ];

      const interval = setInterval(() => {
        const randomThought = thoughtsList[Math.floor(Math.random() * thoughtsList.length)];
        const newThought = {
          id: Date.now(),
          text: randomThought,
          x: Math.random() * 70 + 10,
          y: Math.random() * 60 + 10
        };
        setThoughts((prev) => [...prev.slice(-4), newThought]);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [activePractice, practiceState]);

  const practices: Practice[] = [
    {
      id: 1,
      title: "3-Step Rhythmic Breathing",
      icon: "🌬️",
      xp: 35,
      duration: 300,
      type: "breath",
      book: "zen",
      level: "beginner",
      breathPattern: [3, 3, 3, 3],
      steps: [
        {
          title: "Understanding",
          instruction: "Breathe in 3-3-3-3 pattern",
          guidance: "This calms your nervous system",
          visual: "info"
        },
        {
          title: "Begin Breathing",
          instruction: "Follow the visual guide",
          guidance: "Complete 10 full cycles",
          duration: 180,
          visual: "breath"
        }
      ]
    },
    {
      id: 2,
      title: "Witness Consciousness",
      icon: "👁️",
      xp: 40,
      duration: 420,
      type: "witness",
      book: "soul",
      level: "intermediate",
      steps: [
        {
          title: "The Core Teaching",
          instruction: "You are not the voice in your head",
          guidance: "You are the one who hears it",
          visual: "info"
        },
        {
          title: "Step Back as Observer",
          instruction: "Watch thoughts like clouds passing",
          guidance: "Practice detachment for 5 minutes",
          duration: 300,
          visual: "witness"
        }
      ]
    },
    {
      id: 3,
      title: "Inner Body Awareness",
      icon: "⚡",
      xp: 30,
      duration: 300,
      type: "presence",
      book: "now",
      level: "beginner",
      steps: [
        {
          title: "Gateway to NOW",
          instruction: "Feel the aliveness inside your body",
          guidance: "This is your portal to presence",
          visual: "info"
        },
        {
          title: "Feel Your Hands",
          instruction: "Focus on hands, feel the energy",
          guidance: "Don't think, just FEEL",
          duration: 180,
          visual: "presence"
        }
      ]
    }
  ];

  const quickPractices: Practice[] = [
    {
      id: 11,
      title: "3-Breath Reset",
      icon: "🌬️",
      xp: 10,
      duration: 30,
      type: "breath",
      breathPattern: [4, 4, 4, 4],
      steps: [{ title: "Quick Reset", instruction: "Take 3 deep belly breaths", guidance: "Calms instantly", duration: 30, visual: "breath" }]
    },
    {
      id: 12,
      title: "Witness Check",
      icon: "👁️",
      xp: 15,
      duration: 60,
      type: "witness",
      steps: [{ title: "Quick Witness", instruction: "Who is aware of thoughts?", guidance: "That's your true self", duration: 60, visual: "witness" }]
    },
    {
      id: 13,
      title: "Now Moment",
      icon: "⚡",
      xp: 12,
      duration: 45,
      type: "presence",
      steps: [{ title: "Present Moment", instruction: "Name 5 things you see", guidance: "Senses are in the now", duration: 45, visual: "presence" }]
    },
    {
      id: 14,
      title: "Heart Opening",
      icon: "💚",
      xp: 15,
      duration: 60,
      type: "energy",
      steps: [{ title: "Open Heart", instruction: "Hand on heart, breathe deeply", guidance: "Feel the warmth", duration: 60, visual: "energy" }]
    }
  ];

  const handleComplete = (practice: Practice) => {
    setShowReward({ xp: practice.xp, title: practice.title, icon: practice.icon });
    setTimeout(() => {
      setShowReward(null);
      setActivePractice(null);
      setPracticeState('intro');
      setCurrentStep(0);
    }, 3000);
  };

  const startPractice = () => {
    if (!activePractice) return;
    setPracticeState('active');
    if (activePractice.steps[currentStep].duration) {
      setTimer(activePractice.steps[currentStep].duration || 0);
      setIsTimerRunning(true);
    }
  };

  const nextStep = () => {
    if (!activePractice) return;
    if (currentStep < activePractice.steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
      setIsTimerRunning(false);
      setTimer(0);
      setPracticeState('intro');
    } else {
      handleComplete(activePractice);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // --- Visual Components ---

  const BreathVisual = () => {
    const isExpanding = breathPhase === 'inhale' || breathPhase === 'hold';
    return (
      <div className="flex flex-col items-center justify-center py-12 relative">
        <motion.div
          animate={{ scale: isExpanding ? 1.5 : 1, opacity: isExpanding ? 0.8 : 0.4 }}
          transition={{ duration: 4, ease: "easeInOut" }}
          className="absolute inset-0 bg-cyan-500/20 blur-3xl rounded-full"
        />
        <motion.div
          animate={{
            scale: breathPhase === 'inhale' ? 1.8 : breathPhase === 'hold' ? 1.8 : breathPhase === 'exhale' ? 1 : 1,
          }}
          transition={{ duration: 4, ease: "easeInOut" }}
          className="w-40 h-40 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 shadow-[0_0_60px_rgba(34,211,238,0.5)] flex items-center justify-center relative z-10"
        >
          <div className="text-white text-2xl font-bold capitalize drop-shadow-md">{breathPhase}</div>
        </motion.div>

        <div className="mt-8 text-center relative z-10">
          <div className="text-6xl font-bold text-cyan-200/90">{breathCount}</div>
          <div className={cn("text-sm mt-1 uppercase tracking-widest font-medium", darkMode ? 'text-slate-400' : 'text-slate-500')}>Breath Cycles</div>
        </div>
      </div>
    );
  };

  const WitnessVisual = () => (
    <div className={cn(
      "relative h-80 w-full rounded-3xl overflow-hidden flex items-center justify-center border",
      darkMode ? 'bg-slate-900/50 border-white/10' : 'bg-white/50 border-black/10'
    )}>
      {/* Central Eye (Observer) */}
      <div className="relative z-10 w-24 h-24 rounded-full bg-gradient-to-br from-indigo-300 to-violet-400 shadow-[0_0_50px_rgba(165,180,252,0.4)] flex items-center justify-center">
        <Eye className="w-12 h-12 text-white/90" />
      </div>

      {/* Floating Thoughts */}
      <AnimatePresence>
        {thoughts.map((thought) => (
          <motion.div
            key={thought.id}
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute px-4 py-2 rounded-full text-xs font-medium shadow-lg backdrop-blur-md"
            style={{
              left: `${thought.x}%`,
              top: `${thought.y}%`,
              backgroundColor: darkMode ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.95)',
              color: '#1e293b'
            }}
          >
            {thought.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );

  const PracticeModal = () => {
    if (!activePractice) return null;
    const currentStepData = activePractice.steps[currentStep];

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cn(
            "w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]",
            darkMode ? 'bg-slate-900 border border-slate-700' : 'bg-white'
          )}
        >
          {/* Header */}
          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 text-white relative shrink-0">
            <button
              onClick={() => { setActivePractice(null); setPracticeState('intro'); setCurrentStep(0); }}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <span className="text-lg leading-none">&times;</span>
            </button>
            <div className="flex items-center gap-4">
              <div className="text-5xl">{activePractice.icon}</div>
              <div>
                <h2 className="text-2xl font-bold">{activePractice.title}</h2>
                <div className="flex items-center gap-2 mt-1 opacity-80 text-sm font-medium">
                  <span className="bg-white/20 px-2 py-0.5 rounded text-xs uppercase tracking-wide">Step {currentStep + 1}/{activePractice.steps.length}</span>
                  <span>•</span>
                  <span>{currentStepData.title}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto flex-1 flex flex-col">
            {practiceState === 'intro' ? (
              <div className="space-y-8 my-auto">
                <div className="text-center space-y-4">
                  <h3 className={cn("text-3xl font-bold", darkMode ? 'text-indigo-200' : 'text-indigo-900')}>{currentStepData.title}</h3>
                  <p className={cn("text-xl leading-relaxed", darkMode ? 'text-slate-300' : 'text-slate-600')}>{currentStepData.instruction}</p>
                  <div className={cn("text-sm uppercase tracking-widest font-bold opacity-60", darkMode ? 'text-slate-500' : 'text-slate-400')}>Guidance</div>
                  <p className={cn("italic", darkMode ? 'text-slate-400' : 'text-slate-500')}>{currentStepData.guidance}</p>
                </div>

                <button
                  onClick={startPractice}
                  className="w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white shadow-lg shadow-indigo-500/30 transition-all transform hover:scale-[1.02]"
                >
                  <Play className="w-5 h-5 fill-current" />
                  {currentStepData.duration ? 'Begin Practice' : 'Continue'}
                </button>
              </div>
            ) : (
              <div className="space-y-6 flex-1 flex flex-col">
                {/* Timer Display */}
                {timer > 0 && (
                  <div className="text-center mb-4">
                    <div className={cn("text-5xl font-mono font-bold tracking-tight", darkMode ? 'text-slate-200' : 'text-slate-800')}>
                      {formatTime(timer)}
                    </div>
                    <div className="flex justify-center mt-4">
                      <button
                        onClick={() => setIsTimerRunning(!isTimerRunning)}
                        className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center transition-all",
                          isTimerRunning ? "bg-amber-500/20 text-amber-500" : "bg-emerald-500/20 text-emerald-500"
                        )}
                      >
                        {isTimerRunning ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Visuals */}
                <div className="flex-1 flex items-center justify-center min-h-[300px]">
                  {activePractice.type === 'breath' && <BreathVisual />}
                  {activePractice.type === 'witness' && <WitnessVisual />}
                  {activePractice.type === 'presence' && (
                    <div className="flex flex-col items-center justify-center animate-pulse">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-[0_0_50px_rgba(251,146,60,0.6)]"
                      >
                        <Clock className="w-12 h-12 text-white" />
                      </motion.div>
                      <div className="text-center mt-8">
                        <h3 className="text-2xl font-bold text-amber-200">NOW</h3>
                        <p className="text-slate-400">This moment is all there is.</p>
                      </div>
                    </div>
                  )}
                  {activePractice.type === 'energy' && (
                    <div className="flex flex-col items-center justify-center">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        className="w-32 h-32 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-[0_0_50px_rgba(244,63,94,0.6)]"
                      >
                        <Heart className="w-12 h-12 text-white fill-current" />
                      </motion.div>
                      <p className="text-xl font-bold mt-8 text-rose-200">Breathe into your heart</p>
                    </div>
                  )}
                </div>

                {/* Complete Button */}
                {timer === 0 && (
                  <button
                    onClick={nextStep}
                    className="w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 transition-all"
                  >
                    <span>{currentStep < activePractice.steps.length - 1 ? 'Next Step' : 'Complete Session'}</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    );
  };

  // --- Main Render ---

  if (showReward) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="text-8xl mb-6 animate-bounce">{showReward.icon}</div>
          <h2 className="text-4xl font-bold text-white mb-2">{showReward.title}</h2>
          <div className="text-6xl font-black text-amber-400 drop-shadow-[0_0_30px_rgba(251,191,36,0.8)] my-6">+{showReward.xp} XP</div>
          <div className="flex gap-2 justify-center">
            {[1, 2, 3].map(i => (
              <motion.div
                key={i}
                animate={{ y: [0, -20, 0], rotate: [0, 10, -10, 0] }}
                transition={{ delay: i * 0.1, duration: 1, repeat: Infinity }}
                className="text-4xl"
              >⭐</motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={cn(
      "min-h-screen font-sans transition-colors duration-500 pb-20",
      darkMode ? 'bg-[#0f172a] text-slate-100' : 'bg-slate-50 text-slate-900'
    )}>
      <PracticeModal />

      {/* Top Bar */}
      <div className={cn(
        "p-6 pb-12 rounded-b-[2.5rem] shadow-lg relative overflow-hidden",
        darkMode ? 'bg-gradient-to-br from-indigo-900 to-slate-900' : 'bg-gradient-to-br from-indigo-500 to-violet-600'
      )}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

        <div className="relative z-10 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Awakened Path</h1>
            <p className="text-indigo-200 text-sm font-medium">Soul • Now • Zen</p>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-sm"
          >
            {darkMode ? <Sun className="w-5 h-5 text-amber-300" /> : <Moon className="w-5 h-5 text-indigo-100" />}
          </button>
        </div>

        {/* Level Card */}
        <div className="mt-8 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
          <div className="flex justify-between items-center mb-3">
            <div>
              <div className="text-xs text-indigo-200 uppercase tracking-widest font-bold">Level {user.level}</div>
              <div className="text-lg font-bold text-white">Awakener</div>
            </div>
            <div className="flex items-center gap-1.5 bg-orange-500/20 px-3 py-1 rounded-full border border-orange-500/30">
              <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />
              <span className="font-bold text-orange-100">{user.streak}</span>
            </div>
          </div>
          {/* XP Bar */}
          <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-300 to-orange-400"
              style={{ width: `${(user.xp / user.xpToNext) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-indigo-200/80 font-medium">
            <span>{user.xp} XP</span>
            <span>{user.xpToNext} XP</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="px-4 -mt-6 relative z-20">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Now", val: user.nowMoments, icon: Clock, color: "text-amber-400", bg: "bg-amber-400/10" },
            { label: "Witness", val: user.witnessPoints, icon: Eye, color: "text-indigo-400", bg: "bg-indigo-400/10" },
            { label: "Zen", val: user.zenPoints, icon: Wind, color: "text-emerald-400", bg: "bg-emerald-400/10" },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              whileHover={{ y: -2 }}
              className={cn(
                "rounded-2xl p-3 flex flex-col items-center justify-center gap-1 shadow-sm border",
                darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'
              )}
            >
              <div className={cn("p-2 rounded-full mb-1", stat.bg)}>
                <stat.icon className={cn("w-5 h-5", stat.color)} />
              </div>
              <span className={cn("text-2xl font-bold", darkMode ? 'text-white' : 'text-slate-800')}>{stat.val}</span>
              <span className="text-xs font-medium opacity-60 uppercase tracking-wide">{stat.label}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 mt-8 space-y-8">

        {/* Quick Practices */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
            <h3 className={cn("text-lg font-bold", darkMode ? 'text-white' : 'text-slate-800')}>Quick Shifts</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {quickPractices.map((p) => (
              <button
                key={p.id}
                onClick={() => setActivePractice(p)}
                className={cn(
                  "p-4 rounded-2xl text-left transition-all border shadow-sm hover:shadow-md active:scale-95 group",
                  darkMode
                    ? 'bg-slate-800 border-slate-700 hover:bg-slate-700'
                    : 'bg-white border-slate-100 hover:bg-indigo-50/50'
                )}
              >
                <span className="text-3xl mb-3 block group-hover:scale-110 transition-transform origin-left">{p.icon}</span>
                <div className="font-bold text-sm leading-tight mb-1">{p.title}</div>
                <div className="text-xs font-medium opacity-60">+{p.xp} XP</div>
              </button>
            ))}
          </div>
        </section>

        {/* Deep Practices */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-emerald-400" />
            <h3 className={cn("text-lg font-bold", darkMode ? 'text-white' : 'text-slate-800')}>Deep Dives</h3>
          </div>
          <div className="space-y-3">
            {practices.map((p) => (
              <button
                key={p.id}
                onClick={() => setActivePractice(p)}
                className={cn(
                  "w-full p-4 rounded-2xl flex items-center gap-4 transition-all border shadow-sm hover:shadow-md active:scale-[0.98]",
                  darkMode
                    ? 'bg-slate-800 border-slate-700 hover:bg-slate-700'
                    : 'bg-white border-slate-100 hover:bg-indigo-50/50'
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center text-2xl",
                  darkMode ? 'bg-slate-900' : 'bg-slate-100'
                )}>
                  {p.icon}
                </div>
                <div className="text-left flex-1">
                  <div className="font-bold">{p.title}</div>
                  <div className="text-xs opacity-60 mt-0.5 flex gap-2">
                    <span>{Math.floor(p.duration / 60)} min</span>
                    <span>•</span>
                    <span>{p.level}</span>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-500">
                  +{p.xp} XP
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Quote of the day (Filler) */}
        <div className={cn(
          "p-6 rounded-2xl text-center italic opacity-80 border border-dashed",
          darkMode ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'
        )}>
          "You are the sky. Everything else – it's just the weather." <br /> <span className="text-xs font-bold mt-2 block not-italic opacity-60">— Pema Chödrön</span>
        </div>

      </div>

    </div>
  );
}
