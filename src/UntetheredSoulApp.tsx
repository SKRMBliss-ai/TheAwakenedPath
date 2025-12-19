import { useState, useEffect } from 'react';
import { Flame, Sparkles, Clock, Star, Zap, Sun, Moon, Search, Bell } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import LivingBlobs from './components/ui/LivingBlobs';
import FloatingIsland from './components/ui/FloatingIsland';

// Utility for merging tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function UntetheredApp() {
  const [activeTab, setActiveTab] = useState('home');
  const [darkMode] = useState(true);
  const [activePractice, setActivePractice] = useState<any>(null);
  const [practiceState, setPracticeState] = useState('intro');
  const [currentStep, setCurrentStep] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [breathPhase, setBreathPhase] = useState('inhale');
  const [breathCount, setBreathCount] = useState(0);
  const [showReward, setShowReward] = useState<any>(null);

  useEffect(() => {
    if (activePractice) {
      setCurrentStep(0);
      setPracticeState('intro');
      setIsTimerRunning(false);
      setBreathCount(0);
      setBreathPhase('inhale');
      const firstStep = activePractice.steps?.[0];
      if (firstStep?.duration) setTimer(firstStep.duration);
      else setTimer(0);
    }
  }, [activePractice]);

  useEffect(() => {
    let interval: any;
    if (isTimerRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => {
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

  // Handle breathing phase transitions
  useEffect(() => {
    if (activePractice?.type === 'breath' && practiceState === 'active') {
      const pattern = activePractice.breathPattern || [4, 4, 4, 4];
      const phases = ['inhale', 'hold', 'exhale', 'rest'];

      const phaseDurations = phases.reduce((acc: any, phase, i) => {
        acc[phase] = pattern[i] * 1000;
        return acc;
      }, {});

      let timeout: any;
      const nextPhase = (current: string) => {
        const nextIdx = (phases.indexOf(current) + 1) % 4;
        const next = phases[nextIdx];
        if (next === 'inhale') setBreathCount(c => c + 1);
        setBreathPhase(next);
        timeout = setTimeout(() => nextPhase(next), phaseDurations[next]);
      };

      timeout = setTimeout(() => nextPhase('inhale'), phaseDurations['inhale']);
      return () => clearTimeout(timeout);
    }
  }, [activePractice, practiceState]);

  const practices = [
    {
      id: 1,
      title: "Natural Breath",
      icon: "🌬️",
      xp: 25,
      duration: 300,
      type: "breath",
      book: "soul",
      level: "beginner",
      breathPattern: [4, 4, 4, 4],
      steps: [
        { title: "Intro", instruction: "Experience your breath.", duration: 0, visual: "info", guidance: "One breath is enough." },
        { title: "Breath", instruction: "Follow the circle.", duration: 300, visual: "breath", guidance: "Stay present." }
      ]
    },
    {
      id: 2,
      title: "The Witness",
      icon: "👁️",
      xp: 30,
      duration: 300,
      type: "witness",
      book: "soul",
      level: "beginner",
      steps: [
        { title: "Watch", instruction: "Observe your mind.", duration: 300, visual: "info", guidance: "You are the observer." }
      ]
    }
  ];

  const user = {
    level: 5,
    xp: 920,
    xpToNext: 1000,
    streak: 7,
    energy: 72,
    witnessPoints: 145,
    zenPoints: 87,
    nowMoments: 42
  };

  const nextStep = () => {
    if (currentStep < activePractice.steps.length - 1) {
      setCurrentStep(s => s + 1);
      setPracticeState('intro');
    } else {
      setShowReward({ xp: activePractice.xp, title: activePractice.title });
      setTimeout(() => { setShowReward(null); setActivePractice(null); }, 3000);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderBreathVisual = () => {
    const themeColors: any = {
      inhale: { main: '#ABCEC9', text: 'Expand' },
      hold: { main: '#C3B8D5', text: 'Suspend' },
      exhale: { main: '#59445C', text: 'Release' },
      rest: { main: '#3a2a3c', text: 'Be' }
    };
    const current = themeColors[breathPhase] || themeColors.rest;
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="relative w-48 h-48 rounded-full border-2 border-white/20 flex items-center justify-center transition-all duration-1000" style={{ background: current.main, transform: `scale(${breathPhase === 'inhale' ? 1.4 : 1})`, transitionTimingFunction: 'var(--ease-fluid)' }}>
          <span className="text-black font-bold uppercase tracking-widest">{current.text}</span>
        </div>
        <div className="mt-8 text-4xl font-serif font-bold text-[#ABCEC9]">{breathCount} Cycles</div>
      </div>
    );
  };

  const renderPracticeModal = () => {
    if (!activePractice) return null;
    const step = activePractice.steps[currentStep];
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
        <div className="w-full max-w-lg bg-[#1e1e23] border border-white/10 rounded-[32px] p-8 relative shadow-2xl">
          <button onClick={() => setActivePractice(null)} className="absolute top-6 right-6 text-white/40 hover:text-white">✕</button>
          <div className="mb-8">
            <h2 className="text-2xl font-bold">{activePractice.title}</h2>
            <div className="flex gap-4 mt-2 text-xs opacity-60">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatTime(timer || activePractice.duration)}</span>
              <span className="flex items-center gap-1"><Star className="w-3 h-3" /> +{activePractice.xp} XP</span>
            </div>
          </div>
          <div className="mb-8">
            {activePractice.type === 'breath' ? renderBreathVisual() : <div className="h-40 flex items-center justify-center bg-white/5 rounded-2xl"><Sparkles className="w-12 h-12 text-[#ABCEC9]" /></div>}
          </div>
          <p className="text-lg text-center mb-8">{step.instruction}</p>
          <button onClick={practiceState === 'intro' ? () => setPracticeState('active') : nextStep} className="w-full py-4 rounded-2xl bg-white text-black font-bold uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 duration-500" style={{ transitionTimingFunction: 'var(--ease-fluid)' }}>
            {practiceState === 'intro' ? 'Begin' : 'Next'}
          </button>
        </div>
      </div>
    );
  };

  if (showReward) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95">
        <div className="p-12 rounded-3xl bg-gradient-to-br from-[#ABCEC9] to-[#C3B8D5] text-center text-black shadow-[0_0_50px_rgba(171,206,201,0.5)]">
          <Sparkles className="w-20 h-20 mx-auto mb-4" />
          <h2 className="text-3xl font-bold">+{showReward.xp} XP</h2>
          <p className="opacity-60">{showReward.title}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden transition-all duration-700" style={{ background: darkMode ? 'var(--bg-body)' : 'white' }}>
      <LivingBlobs />
      {renderPracticeModal()}

      <div className="max-w-md mx-auto min-h-screen relative z-10 p-6 pb-32">
        {activeTab === 'home' && (
          <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
            <div className="flex justify-between items-center kinetic-text">
              <div>
                <h1 className="text-4xl font-serif font-bold tracking-tight mb-1" style={{ color: 'var(--text-main)' }}>Peace, Soul</h1>
                <p className="text-xs uppercase tracking-widest opacity-60">The universe is within you.</p>
              </div>
              <div className="flex gap-4 opacity-40">
                <Search className="w-5 h-5" />
                <Bell className="w-5 h-5" />
              </div>
            </div>

            <div className="p-8 relative overflow-hidden group transition-all duration-1000 card-glow h-[420px] flex flex-col justify-between" style={{ borderRadius: '40px' }}>
              {/* Large Background Graphic */}
              <Sun className="card-graphic text-[#ABCEC9]" style={{ width: '300px', height: '300px', top: '5%', right: '-10%' }} />

              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-[#ABCEC9]/10 border border-[#ABCEC9]/20 flex items-center justify-center">
                    <Sun className="w-6 h-6 text-[#ABCEC9]" />
                  </div>
                  <h2 className="text-3xl font-serif font-bold tracking-tight" style={{ color: 'var(--text-main)' }}>Inner Stillness</h2>
                </div>
                <p className="text-lg opacity-70 leading-relaxed font-light">
                  When you settle into the seat of awareness, the world becomes a witness to your peace.
                </p>
              </div>

              <div className="relative z-10 pt-4 border-t border-white/5 mt-auto flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-40">01 JOURNEY</span>
                <div className="light-dot" />
              </div>

              <button onClick={() => setActivePractice(practices[0])} className="absolute inset-0 z-20 opacity-0 cursor-pointer" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setActivePractice(practices[0])} className="p-6 text-left card-glow h-56 flex flex-col justify-between group transition-all duration-500 hover:scale-[1.02] relative overflow-hidden">
                <Zap className="card-graphic text-[#ABCEC9]" style={{ width: '150px', height: '150px', top: '10%', right: '-20%' }} />
                <div className="w-10 h-10 rounded-xl bg-[#ABCEC9]/10 border border-[#ABCEC9]/20 flex items-center justify-center relative z-10">
                  <Zap className="w-5 h-5 text-[#ABCEC9]" />
                </div>
                <div className="relative z-10">
                  <h3 className="font-serif font-bold text-xl mb-1">Focus</h3>
                  <div className="h-px bg-white/5 w-full my-3" />
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] font-bold uppercase tracking-widest opacity-40">ENERGY</span>
                    <div className="light-dot" />
                  </div>
                </div>
              </button>

              <button onClick={() => setActivePractice(practices[1])} className="p-6 text-left card-glow h-56 flex flex-col justify-between group transition-all duration-500 hover:scale-[1.02] relative overflow-hidden">
                <Moon className="card-graphic text-indigo-400" style={{ width: '150px', height: '150px', top: '10%', right: '-20%' }} />
                <div className="w-10 h-10 rounded-xl bg-indigo-400/10 border border-indigo-400/20 flex items-center justify-center relative z-10">
                  <Moon className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="relative z-10">
                  <h3 className="font-serif font-bold text-xl mb-1">Rest</h3>
                  <div className="h-px bg-white/5 w-full my-3" />
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] font-bold uppercase tracking-widest opacity-40">CALM</span>
                    <div className="light-dot" />
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'journey' && (
          <div className="space-y-8">
            <h2 className="text-4xl font-serif font-bold tracking-tight kinetic-text">Journey</h2>
            <div className="space-y-4">
              {practices.map(p => (
                <button key={p.id} onClick={() => setActivePractice(p)} className="w-full p-6 text-left card-glow flex flex-col justify-between group transition-transform active:scale-95 duration-500 relative overflow-hidden h-40">
                  <Flame className="card-graphic text-[#ABCEC9]" style={{ width: '120px', height: '120px', top: '10%', right: '-10%', opacity: 0.03 }} />
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-[#ABCEC9]/10 border border-[#ABCEC9]/20 flex items-center justify-center text-xl">
                      {p.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{p.title}</h3>
                      <p className="text-[10px] uppercase tracking-widest opacity-40">+{p.xp} XP • {p.level}</p>
                    </div>
                  </div>
                  <div className="relative z-10 pt-3 border-t border-white/5 mt-auto flex justify-between items-center">
                    <span className="text-[8px] font-bold uppercase tracking-widest opacity-30">UNDERSTANDING</span>
                    <div className="light-dot" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'chapters' && (
          <div className="space-y-8">
            <h2 className="text-4xl font-serif font-bold tracking-tight kinetic-text">Chapters</h2>
            <div className="p-12 text-center card-glow rounded-3xl opacity-60 italic relative overflow-hidden group">
              <div className="light-dot" />
              The path unfolds as you walk it.
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="p-8 rounded-[32px] bg-gradient-to-br from-[#ABCEC9] to-[#C3B8D5] text-black">
              <h2 className="text-2xl font-bold">Level {user.level}</h2>
              <p className="opacity-60 uppercase tracking-widest text-[10px] font-bold">Awareness Score: {user.xp}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="card-glow p-6 text-left h-48 flex flex-col justify-between group relative overflow-hidden">
                <Clock className="card-graphic text-[#ABCEC9]" style={{ width: '150px', height: '150px', top: '10%', right: '-20%' }} />
                <div className="w-10 h-10 rounded-xl bg-[#ABCEC9]/10 border border-[#ABCEC9]/20 flex items-center justify-center relative z-10">
                  <Clock className="w-5 h-5 text-[#ABCEC9]" />
                </div>
                <div className="relative z-10">
                  <div className="text-2xl font-bold">{user.nowMoments}</div>
                  <div className="h-px bg-white/5 w-full my-3" />
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] font-bold uppercase tracking-widest opacity-40">MOMENTS</span>
                    <div className="light-dot" />
                  </div>
                </div>
              </div>
              <div className="card-glow p-6 text-left h-48 flex flex-col justify-between group relative overflow-hidden">
                <Flame className="card-graphic text-orange-400" style={{ width: '150px', height: '150px', top: '10%', right: '-20%' }} />
                <div className="w-10 h-10 rounded-xl bg-orange-400/10 border border-orange-400/20 flex items-center justify-center relative z-10">
                  <Flame className="w-5 h-5 text-orange-400" />
                </div>
                <div className="relative z-10">
                  <div className="text-2xl font-bold">{user.streak}</div>
                  <div className="h-px bg-white/5 w-full my-3" />
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] font-bold uppercase tracking-widest opacity-40">DAY STREAK</span>
                    <div className="light-dot" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <FloatingIsland activeTab={activeTab} setActiveTab={setActiveTab} onNavigate={() => setActivePractice(null)} />
    </div>
  );
}
