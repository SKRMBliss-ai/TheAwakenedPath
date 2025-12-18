import { useState, useEffect } from 'react';
import { Heart, Flame, Book, Target, Clock, Eye, Wind, Sun, Moon, Play, Zap, User, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { BreathingVisual } from './components/BreathingVisual';
import { ReframingVisual } from './components/domain/ReframingVisual';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
type PracticeType = 'breath' | 'witness' | 'presence' | 'energy' | 'reframing';
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
  icon: React.ReactNode;
  xp: number;
  duration: number;
  type: PracticeType;
  book?: string;
  level?: string;
  breathPattern?: number[];
  steps: Step[];
};

export default function UntetheredApp() {
  const [activeTab, setActiveTab] = useState<'journey' | 'library' | 'profile'>('journey');
  const [darkMode, setDarkMode] = useState(true);
  const [activePractice, setActivePractice] = useState<Practice | null>(null);
  const [practiceState, setPracticeState] = useState<'intro' | 'active'>('intro');
  const [currentStep, setCurrentStep] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showReward, setShowReward] = useState<{ xp: number; title: string; icon: React.ReactNode } | null>(null);
  const [thoughts, setThoughts] = useState<{ id: number; text: string; x: number; y: number }[]>([]);

  // --- Mock User Stats ---
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

  // --- Effects ---

  // Timer Logic
  useEffect(() => {
    let interval: any;
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

  // Witness Thought Generator
  useEffect(() => {
    if (activePractice?.type === 'witness' && practiceState === 'active') {
      const thoughtsList = ["What if I fail?", "I should have...", "They think I'm...", "I need to...", "Why did I..."];
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

  // --- Data ---

  const practices: Practice[] = [
    {
      id: 1, title: "3-Step Rhythmic Breathing", icon: <Wind className="w-12 h-12" />, xp: 35, duration: 300, type: "breath", level: "beginner", breathPattern: [3, 3, 3, 3],
      steps: [
        { title: "Understanding", instruction: "Breathe in 3-3-3-3 pattern", guidance: "Calms nervous system", visual: "info" },
        { title: "Begin Breathing", instruction: "Follow the visual guide", guidance: "Complete 10 cycles", duration: 180, visual: "breath" }
      ]
    },
    {
      id: 2, title: "Witness Consciousness", icon: <Eye className="w-12 h-12" />, xp: 40, duration: 420, type: "witness", level: "intermediate",
      steps: [
        { title: "The Core Teaching", instruction: "You are not the voice in your head", guidance: "You are the one who hears it", visual: "info" },
        { title: "Step Back", instruction: "Watch thoughts like clouds", guidance: "Practice detachment", duration: 300, visual: "witness" }
      ]
    }, // End of Witness
    {
      id: 3, title: "Positive Reframing", icon: <Brain className="w-12 h-12" />, xp: 50, duration: 300, type: "reframing", level: "advanced",
      steps: [
        { title: "Spot the Negative", instruction: "Notice when a negative thought arises", guidance: "Don't judge it, just see it", duration: 60, visual: "reframing" },
        { title: "Question It", instruction: "Ask: Is this absolutely true?", guidance: "Look for evidence against it", duration: 120, visual: "reframing" },
        { title: "Replace It", instruction: "Create a balanced, kinder thought", guidance: "How would you speak to a friend?", duration: 120, visual: "reframing" }
      ]
    }
  ];

  const quickPractices: Practice[] = [
    { id: 11, title: "3-Breath Reset", icon: <Wind className="w-8 h-8" />, xp: 10, duration: 30, type: "breath", breathPattern: [4, 4, 4, 4], steps: [{ title: "Quick Reset", instruction: "Take 3 deep belly breaths", guidance: "Calms instantly", duration: 30, visual: "breath" }] },
    { id: 12, title: "Witness Check", icon: <Eye className="w-8 h-8" />, xp: 15, duration: 60, type: "witness", steps: [{ title: "Quick Witness", instruction: "Who is aware?", guidance: "That's your true self", duration: 60, visual: "witness" }] },
    { id: 13, title: "Now Moment", icon: <Zap className="w-8 h-8" />, xp: 12, duration: 45, type: "presence", steps: [{ title: "Present Moment", instruction: "Name 5 things you see", guidance: "Senses are in the now", duration: 45, visual: "presence" }] },
    { id: 14, title: "Heart Opening", icon: <Heart className="w-8 h-8" />, xp: 15, duration: 60, type: "energy", steps: [{ title: "Open Heart", instruction: "Hand on heart", guidance: "Feel the warmth", duration: 60, visual: "energy" }] }
  ];

  // --- Handlers ---

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


  // --- Sub-Components ---

  const WitnessVisual = () => (
    <div className={cn("relative h-80 w-full rounded-3xl flex items-center justify-center border", darkMode ? 'bg-slate-900/50 border-white/10' : 'bg-white/50 border-black/10')}>
      <div className="relative z-10 w-24 h-24 rounded-full bg-indigo-500 shadow-[0_0_50px_rgba(99,102,241,0.4)] flex items-center justify-center">
        <Eye className="w-12 h-12 text-white" />
      </div>
      <AnimatePresence>
        {thoughts.map((thought) => (
          <motion.div
            key={thought.id}
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute px-4 py-2 rounded-full text-xs font-medium shadow-lg backdrop-blur-md bg-white/90 text-slate-900"
            style={{ left: `${thought.x}%`, top: `${thought.y}%` }}
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
          className={cn("w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]", darkMode ? 'bg-slate-900 border border-slate-700' : 'bg-white')}
        >
          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 text-white relative shrink-0">
            <button onClick={() => { setActivePractice(null); setPracticeState('intro'); }} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">&times;</button>
            <div className="flex items-center gap-4">
              <div className="text-5xl">{activePractice.icon}</div>
              <div>
                <h2 className="text-2xl font-bold">{activePractice.title}</h2>
                <div className="opacity-80 text-sm">Step {currentStep + 1}/{activePractice.steps.length}</div>
              </div>
            </div>
          </div>

          <div className="p-6 overflow-y-auto flex-1 flex flex-col">
            {practiceState === 'intro' ? (
              <div className="space-y-8 my-auto text-center">
                <h3 className={cn("text-3xl font-bold", darkMode ? 'text-indigo-200' : 'text-indigo-900')}>{currentStepData.title}</h3>
                <p className={cn("text-xl", darkMode ? 'text-slate-300' : 'text-slate-600')}>{currentStepData.instruction}</p>
                <button onClick={startPractice} className="w-full py-4 rounded-xl font-bold text-lg bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2">
                  <Play className="w-5 h-5 fill-current" /> {currentStepData.duration ? 'Begin Practice' : 'Continue'}
                </button>
              </div>
            ) : (
              <div className="space-y-6 flex-1 flex flex-col">
                {timer > 0 && <div className="text-center text-5xl font-mono font-bold">{formatTime(timer)}</div>}
                <div className="flex-1 flex items-center justify-center min-h-[300px]">
                  {activePractice.type === 'breath' && <BreathingVisual />}
                  {activePractice.type === 'witness' && <WitnessVisual />}
                  {activePractice.type === 'presence' && <div className="w-32 h-32 rounded-full bg-amber-500 animate-pulse flex items-center justify-center"><Clock className="w-12 h-12 text-white" /></div>}
                  {activePractice.type === 'energy' && <div className="w-32 h-32 rounded-full bg-rose-500 animate-pulse flex items-center justify-center"><Heart className="w-12 h-12 text-white" /></div>}
                  {activePractice.type === 'reframing' && <ReframingVisual />}
                </div>
                {timer === 0 && (
                  <button onClick={nextStep} className="w-full py-4 rounded-xl font-bold bg-emerald-500 text-white">
                    {currentStep < activePractice.steps.length - 1 ? 'Next Step' : 'Complete Session'}
                  </button>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    );
  };


  // --- SCREENS ---

  const HomeScreen = () => (
    <div className="h-full flex flex-col items-center justify-center text-center px-6 relative">
      {/* Ambient Bacgkround */}
      <motion.div
        animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className={cn("absolute w-[500px] h-[500px] rounded-full blur-[100px] -z-10", darkMode ? "bg-indigo-900/30" : "bg-cyan-100/60")}
      />

      <div className="mb-12">
        <h2 className={cn("text-3xl font-serif font-medium leading-relaxed mb-4", darkMode ? "text-slate-100" : "text-slate-800")}>
          "Quiet the mind, and the soul will speak."
        </h2>
        <p className="text-sm uppercase tracking-widest opacity-60">Today's Focus: Mindful Listening</p>
      </div>

      <button
        onClick={() => setActivePractice(practices[0])}
        className={cn("px-8 py-4 rounded-full text-lg font-medium backdrop-blur-md shadow-lg transition-transform active:scale-95", darkMode ? "bg-white/10 border border-white/20" : "bg-white border border-slate-200")}
      >
        Begin Today's Practice
      </button>
    </div>
  );

  const LibraryScreen = () => (
    <div className="pt-24 px-6 pb-24 space-y-8 h-full overflow-y-auto">
      <section>
        <h3 className="text-lg font-bold mb-4 flex gap-2 items-center"><Zap className="w-5 h-5 text-amber-500" /> Quick Shifts</h3>
        <div className="grid grid-cols-2 gap-3">
          {quickPractices.map(p => (
            <button key={p.id} onClick={() => setActivePractice(p)} className={cn("p-4 rounded-2xl text-left border transition-all hover:scale-[1.02]", darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100")}>
              <div className="text-3xl mb-2">{p.icon}</div>
              <div className="font-bold text-sm">{p.title}</div>
              <div className="text-xs opacity-60">+{p.xp} XP</div>
            </button>
          ))}
        </div>
      </section>
      <section>
        <h3 className="text-lg font-bold mb-4 flex gap-2 items-center"><Target className="w-5 h-5 text-emerald-500" /> Deep Dives</h3>
        <div className="space-y-3">
          {practices.map(p => (
            <button key={p.id} onClick={() => setActivePractice(p)} className={cn("w-full p-4 rounded-2xl flex items-center gap-4 border transition-all hover:scale-[1.01]", darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100")}>
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-2xl", darkMode ? 'bg-slate-900' : 'bg-slate-50')}>{p.icon}</div>
              <div className="text-left flex-1">
                <div className="font-bold">{p.title}</div>
                <div className="text-xs opacity-60">{Math.floor(p.duration / 60)} min • {p.level}</div>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );

  const ProfileScreen = () => (
    <div className="pt-24 px-6 pb-24 space-y-6 h-full overflow-y-auto">
      {/* Level Card */}
      <div className="rounded-3xl p-6 relative overflow-hidden bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold">Level {user.level}</h2>
            <div className="text-indigo-200">Awakener</div>
          </div>
          <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
            <Flame className="w-4 h-4 text-orange-300 fill-current" />
            <span className="font-bold">{user.streak}</span>
          </div>
        </div>

        {/* XP Bar */}
        <div className="relative h-4 bg-black/20 rounded-full overflow-hidden mb-2">
          <div className="absolute top-0 left-0 h-full bg-amber-400" style={{ width: `${(user.xp / user.xpToNext) * 100}%` }} />
        </div>
        <div className="text-sm opacity-80">{user.xp} / {user.xpToNext} XP</div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Now", val: user.nowMoments, icon: Clock },
          { label: "Witness", val: user.witnessPoints, icon: Eye },
          { label: "Zen", val: user.zenPoints, icon: Wind },
        ].map(stat => (
          <div key={stat.label} className={cn("p-4 rounded-2xl flex flex-col items-center justify-center gap-2 border", darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100")}>
            <stat.icon className="w-6 h-6 opacity-60" />
            <div className="text-2xl font-bold">{stat.val}</div>
            <div className="text-xs uppercase tracking-wide opacity-50">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Energy Card */}
      <div className={cn("p-6 rounded-3xl border relative overflow-hidden", darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100")}>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-500"><Heart className="w-6 h-6 fill-current" /></div>
          <div>
            <h3 className="font-bold text-lg">Energy Level</h3>
            <div className="text-xs opacity-60">Heart • Mind • Body</div>
          </div>
        </div>
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
          <div className="h-full bg-rose-400 w-[72%]" />
        </div>
        <div className="text-sm font-bold text-rose-400">72% Aligned</div>
      </div>
    </div>
  );

  // --- Main Layout ---

  if (showReward) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 text-white">
        <div className="text-center animate-bounce">
          <div className="text-8xl mb-4">{showReward.icon}</div>
          <h2 className="text-4xl font-bold">+{showReward.xp} XP</h2>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("h-screen w-full font-sans transition-colors duration-500 flex flex-col relative overflow-hidden", darkMode ? 'bg-[#0f172a] text-slate-100' : 'bg-slate-50 text-slate-900')}>
      <PracticeModal />

      {/* Minimal Header */}
      <div className="absolute top-0 w-full p-6 flex justify-between z-40 pointer-events-none">
        <div className="pointer-events-auto p-2"><div className="space-y-1"><div className="w-6 h-0.5 bg-current" /><div className="w-4 h-0.5 bg-current opacity-70" /></div></div>
        <button onClick={() => setDarkMode(!darkMode)} className="pointer-events-auto p-2 opacity-70 hover:opacity-100">{darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}</button>
      </div>

      {/* Dynamic Content */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {activeTab === 'journey' && <motion.div key="j" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full"><HomeScreen /></motion.div>}
          {activeTab === 'library' && <motion.div key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full"><LibraryScreen /></motion.div>}
          {activeTab === 'profile' && <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full"><ProfileScreen /></motion.div>}
        </AnimatePresence>
      </div>

      {/* Bottom Nav */}
      <div className={cn("h-20 border-t flex justify-around items-center z-50", darkMode ? "bg-[#0f172a] border-white/5" : "bg-white border-slate-100")}>
        {[{ id: 'journey', i: Moon, l: 'Journey' }, { id: 'library', i: Book, l: 'Library' }, { id: 'profile', i: User, l: 'Profile' }].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id as any)} className={cn("flex-1 py-1 flex flex-col items-center gap-1 transition-colors", activeTab === t.id ? "text-indigo-500" : "opacity-40")}>
            <t.i className={cn("w-6 h-6", activeTab === t.id && "fill-current")} />
            <span className="text-[10px] font-bold uppercase tracking-widest">{t.l}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
