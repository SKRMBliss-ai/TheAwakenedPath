import { useState, useEffect } from 'react';
import { Flame, Sparkles, Sun, Search, Play, BookOpen, User, Target, AlertCircle, BarChart2, ArrowLeft, Clock, Menu, Heart, X, Lock } from 'lucide-react';
import LivingBlobs from './components/ui/LivingBlobs';
import { PowerOfNow } from './features/soul-intelligence/components/PowerOfNow';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from './lib/utils';
import Journal from './features/journal/components/Journal';
import { BreathPractice } from './features/breath/components/BreathPractice';
import StatsDashboard from './features/stats/StatsDashboard';
import { SituationalPractices } from './features/practices/SituationalPractices';
import { useAuth } from './features/auth/AuthContext';
import { MeditationPortal } from './components/ui/MeditationPortal';
import { SacredCircle } from './components/ui/SacredCircle';
import { GlassShape } from './components/ui/GlassShape';
import { SignInScreen } from './features/auth/SignInScreen';

interface PracticeStep {
  title: string;
  instruction: string;
  duration: number;
  visual: string;
  guidance: string;
}

interface Practice {
  id: number;
  title: string;
  icon: string;
  xp: number;
  duration: number;
  type: string;
  book: string;
  level: string;
  breathPattern?: number[];
  steps: PracticeStep[];
}

interface Reward {
  xp: number;
  title: string;
}

const themeColors: any = {
  inhale: { text: 'INHALE', scale: 1.3, glow: '0 0 100px rgba(171, 206, 201, 0.4)', duration: 4 },
  hold: { text: 'HOLD', scale: 1.0, glow: '0 0 60px rgba(198, 95, 157, 0.3)', duration: 2 },
  exhale: { text: 'EXHALE', scale: 0.6, glow: '0 0 40px rgba(171, 206, 201, 0.2)', duration: 4 },
  rest: { text: 'REST', scale: 0.5, glow: 'none', duration: 2 }
};

// --- Sub-components moved outside for stability ---

const MobileDashboard = ({ user, setActiveTab, onOpenSidebar, signOut, isAdmin }: any) => {
  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      await signOut();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-10"
    >
      {/* Hero Card Container - Dep Plum Shape */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#59445C] to-[#2d2430] rounded-[48px] p-6 pb-12 shadow-2xl border border-white/5 mx-2 mt-2">

        {/* Decorative background glow inside the card */}
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(198,95,157,0.15),transparent_60%)] pointer-events-none" />

        {/* Header inside the card */}
        <header className="relative flex justify-between items-center z-10 mb-8">
          <button
            onClick={onOpenSidebar}
            className="w-12 h-12 rounded-full bg-white/10 border border-white/10 flex items-center justify-center active:scale-90 transition-all shadow-lg backdrop-blur-md"
          >
            <Menu className="w-5 h-5 text-white/90" />
          </button>

          <div className="flex flex-col items-center">
            <h1 className="text-[12px] font-serif font-bold uppercase tracking-[0.25em] text-white Drop-shadow-md">The Awakened Path</h1>
            <span className="text-[8px] font-bold text-white/50 tracking-widest uppercase mt-1">The Presence Study</span>
          </div>

          <button
            onClick={handleLogout}
            className="w-12 h-12 rounded-full bg-[#D4A574]/20 border border-[#D4A574]/30 flex items-center justify-center text-[#D4A574] text-[12px] font-bold shadow-lg hover:bg-[#D4A574]/30 transition-colors backdrop-blur-md"
          >
            {user.displayName ? user.displayName.substring(0, 2).toUpperCase() : 'AB'}
          </button>
        </header>

        {/* Hero Content Area inside the card */}
        <section className="relative flex flex-col items-center justify-center space-y-8 z-10">
          <div className="transform scale-90 sm:scale-100">
            <SacredCircle
              text="PRESENCE"
              isAnimating={true}
              size="md"
            />
          </div>

          <div className="text-center space-y-6">
            {/* Pill Style Metrics */}
            <div className="inline-flex items-center gap-6 px-6 py-3 rounded-full bg-black/20 border border-white/5 backdrop-blur-md shadow-xl">
              <div className="flex items-center gap-2.5">
                <Heart className="w-3.5 h-3.5 text-rose-300 opacity-80" />
                <span className="text-[10px] font-bold text-white/60 uppercase tracking-[0.2em] leading-none">Gratitude</span>
              </div>
              <div className="w-px h-4 bg-white/10" />
              <div className="flex items-center gap-2.5">
                <Flame className="w-3.5 h-3.5 text-orange-300 opacity-80" />
                <span className="text-[10px] font-bold text-white/60 uppercase tracking-[0.2em] leading-none">{user.streak} Day Streak</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Primary Action Card - Situational Practice */}
      <section>
        <button
          onClick={() => isAdmin ? setActiveTab('situations') : null}
          className={cn(
            "w-full group relative overflow-hidden rounded-[40px] bg-white text-[#1a151b] p-8 flex items-center justify-between transition-all shadow-xl",
            isAdmin ? "hover:scale-[1.02] active:scale-98" : "opacity-50 cursor-not-allowed grayscale"
          )}
        >
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-[#1a151b]/5 flex items-center justify-center shadow-inner">
              {isAdmin ? <Flame className="w-8 h-8 text-[#C65F9D]" /> : <Lock className="w-8 h-8 text-[#1a151b]/50" />}
            </div>
            <div className="text-left">
              <h3 className="text-xl font-serif font-bold text-[#1a151b]">Transform a Situation</h3>
              <p className="text-[10px] text-[#1a151b]/40 font-bold uppercase tracking-widest mt-1">Shift from challenge to peace</p>
            </div>
          </div>

          <div className="w-12 h-12 rounded-full bg-[#1a151b] text-white flex items-center justify-center shadow-lg group-hover:bg-[#3a2a3c] transition-colors duration-300">
            {isAdmin ? <Play className="w-5 h-5 fill-current ml-1" /> : <Lock className="w-5 h-5" />}
          </div>
        </button>
      </section>

      {/* Main Practices Grid */}
      <section className="space-y-6 pb-20">
        <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/20 pl-4">Sacred Sessions</h4>
        <div className="grid grid-cols-2 gap-4">
          {[
            { id: 'intelligence', label: 'Presence', sub: 'EXPLORE', icon: Sparkles, color: '#ABCEC9', variant: 'orb' },
            { id: 'chapters', label: 'Journal', sub: 'GUIDED', icon: BookOpen, color: '#C65F9D', variant: 'book' },
            { id: 'panic', label: 'Awareness', sub: 'EMERGENCY', icon: AlertCircle, color: '#FF7043', variant: 'pulse' },
            { id: 'stats', label: 'Journey', sub: 'HISTORY', icon: BarChart2, color: '#9575CD', variant: 'chart' }
          ].map((item: any) => {
            const isLocked = !isAdmin && item.id !== 'chapters';
            return (
              <button
                key={item.id}
                onClick={() => !isLocked && setActiveTab(item.id)}
                disabled={isLocked}
                className={cn(
                  "group relative overflow-hidden aspect-square bg-white/[0.03] border border-white/5 rounded-[32px] p-4 flex flex-col items-center justify-center gap-4 transition-all",
                  !isLocked ? "hover:border-white/20 hover:bg-white/[0.05] active:scale-95" : "opacity-40 cursor-not-allowed"
                )}
              >
                {!isLocked && <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-[radial-gradient(circle_at_center,var(--item-color),transparent_70%)]" style={{ '--item-color': `${item.color}15` } as any} />}

                <div className="relative w-24 h-24 flex items-center justify-center -mt-2">
                  {isLocked ? (
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Lock className="w-8 h-8 text-white/30" />
                      <div className="w-full h-full absolute inset-0 bg-black/20 backdrop-blur-[2px] rounded-full" />
                    </div>
                  ) : (
                    <GlassShape icon={item.icon} color={item.color} variant={item.variant} className="w-full h-full" />
                  )}
                </div>

                <div className="text-center relative z-10">
                  <div className="text-lg font-serif font-bold text-white mb-0.5">{item.label}</div>
                  <div className="text-[8px] font-bold text-white/30 tracking-[0.2em]">
                    {isLocked ? 'COMING SOON' : item.sub}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </section>
    </motion.div>
  );
};

const BreadthDesktop = ({ user, setActiveTab, signOut, isAdmin }: any) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-12 max-w-5xl mx-auto"
    >
      {/* Desktop Optimized Header */}
      <header className="flex justify-between items-center bg-white/[0.02] border border-white/5 p-6 rounded-[32px] backdrop-blur-xl">
        <div className="flex items-center gap-6">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <Search className="w-5 h-5 text-white/40" />
          </div>
          <div>
            <h1 className="text-xl font-serif font-bold text-white tracking-tight">The Awakened Path</h1>
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 font-bold">The Presence Study</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-4 hover:bg-white/5 p-2 rounded-xl transition-colors text-left"
        >
          <div className="text-right">
            <div className="text-sm font-bold text-white/90">Soul Guide</div>
            <div className="text-[10px] text-[#ABCEC9] font-bold tracking-widest uppercase">Level {user.level}</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#C65F9D]/20 border border-[#C65F9D]/40 flex items-center justify-center text-[#C65F9D] text-sm font-bold shadow-lg shadow-[#C65F9D]/10">
            {user.displayName ? user.displayName.substring(0, 2).toUpperCase() : 'AB'}
          </div>
        </button>
      </header>

      {/* Hero Guided Area - Minimalist Desktop */}
      <section className="relative py-16 flex flex-col items-center justify-center min-h-[500px]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(171,206,201,0.03)_0%,transparent_70%)]" />

        <div className="relative z-10 flex flex-col items-center text-center space-y-16">
          <div className="relative group">
            {/* Ambient Background Glow behind the circle */}
            <div className="absolute inset-0 -m-20 bg-[radial-gradient(circle_at_center,var(--glow-cyan),var(--glow-gold),transparent_70%)] opacity-20 blur-[80px] group-hover:opacity-40 transition-opacity duration-1000" />
            <SacredCircle
              text="AWAKEN"
              isAnimating={true}
              size="lg"
            />
          </div>

          <div className="flex gap-20">
            <div className="flex flex-col items-center gap-3">
              <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.5em]">GRATITUDE FLOW</span>
              <div className="w-1.5 h-1.5 rounded-full bg-rose-400 opacity-50 shadow-[0_0_10px_#fb7185]" />
            </div>
            <div className="flex flex-col items-center gap-3">
              <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.5em]">{user.streak} DAY STREAK</span>
              <div className="w-1.5 h-1.5 rounded-full bg-[#ABCEC9] opacity-50 shadow-[0_0_10px_#ABCEC9]" />
            </div>
          </div>
        </div>
      </section>

      {/* Main Action Call - Situational Practice */}
      {/* Main Action Call - Situational Practice */}
      <section>
        <button
          onClick={() => isAdmin ? setActiveTab('situations') : null}
          className={cn(
            "w-full group relative overflow-hidden rounded-[40px] bg-white p-8 flex items-center justify-between transition-all shadow-2xl shadow-black/20",
            isAdmin ? "hover:bg-[#f8f5f8] hover:scale-[1.01] active:scale-[0.99]" : "opacity-50 cursor-not-allowed grayscale"
          )}
        >
          <div className="flex items-center gap-10">
            <div className="w-20 h-20 rounded-[28px] bg-[#1a151b] flex items-center justify-center shadow-xl transition-transform duration-500">
              {isAdmin ? <Flame className="w-10 h-10 text-[#C65F9D]" /> : <Lock className="w-10 h-10 text-white/50" />}
            </div>
            <div className="text-left">
              <h3 className="text-3xl font-serif font-bold text-[#1a151b]">Transform a Situation</h3>
              <p className="text-sm text-[#1a151b]/40 font-bold uppercase tracking-[0.2em] mt-1">Shift from challenge to peace</p>
            </div>
          </div>
          <div className="w-16 h-16 rounded-full bg-[#3a2a3c] flex items-center justify-center text-white shadow-lg transition-all duration-500">
            {isAdmin ? <Play className="w-6 h-6 fill-current ml-1 group-hover:rotate-90" /> : <Lock className="w-6 h-6" />}
          </div>
        </button>
      </section>

      {/* Practices Grid - Desktop Balanced */}
      <section className="space-y-8">
        <div className="flex items-center justify-between px-4">
          <h4 className="text-[12px] font-bold uppercase tracking-[0.5em] text-white/20">Sacred Practices</h4>
          <div className="h-px flex-1 bg-white/5 mx-8" />
        </div>
        <div className="grid grid-cols-4 gap-6">
          {[
            { id: 'intelligence', label: 'Presence', sub: 'EXPLORE THE NOW', icon: Sparkles, color: '#ABCEC9', delay: 0, variant: 'orb' },
            { id: 'chapters', label: 'Journal', sub: 'SOUL JOURNEY', icon: BookOpen, color: '#C65F9D', delay: 0.1, variant: 'book' },
            { id: 'panic', label: 'Awareness', sub: 'SURGE TOOLS', icon: AlertCircle, color: '#FF7043', delay: 0.2, variant: 'pulse' },
            { id: 'stats', label: 'Evolution', sub: 'SPIRIT STATS', icon: BarChart2, color: '#9575CD', delay: 0.3, variant: 'chart' }
          ].map((item: any) => {
            const isLocked = !isAdmin && item.id !== 'chapters';
            return (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: item.delay }}
                onClick={() => !isLocked && setActiveTab(item.id)}
                disabled={isLocked}
                className={cn(
                  "group relative overflow-hidden bg-white/[0.03] border border-white/5 rounded-[40px] p-8 flex flex-col items-center justify-center gap-6 transition-all",
                  !isLocked ? "hover:border-white/20 hover:bg-white/[0.05] active:scale-95" : "opacity-40 cursor-not-allowed"
                )}
              >
                {!isLocked && <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-[radial-gradient(circle_at_center,var(--item-color),transparent_70%)]" style={{ '--item-color': `${item.color}15` } as any} />}

                <div className="relative w-32 h-32 flex items-center justify-center">
                  {isLocked ? (
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Lock className="w-12 h-12 text-white/30" />
                      <div className="w-full h-full absolute inset-0 bg-black/20 backdrop-blur-[2px] rounded-full" />
                    </div>
                  ) : (
                    <GlassShape icon={item.icon} color={item.color} variant={item.variant} className="w-full h-full" />
                  )}
                </div>

                <div className="text-center relative z-10">
                  <div className="text-2xl font-serif font-bold text-white mb-1">{item.label}</div>
                  <div className="text-[9px] font-bold text-white/30 tracking-[0.3em] uppercase">
                    {isLocked ? 'COMING SOON' : item.sub}
                  </div>
                </div>
              </motion.button>
            )
          })}
        </div>
      </section>
    </motion.div>
  );
};

// --- Main App Component ---

export default function UntetheredApp() {
  const { user: currentUser, loading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [darkMode] = useState(true);
  const [activePractice, setActivePractice] = useState<Practice | null>(null);
  const [practiceState, setPracticeState] = useState('active');
  const [currentStep, setCurrentStep] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [breathPhase, setBreathPhase] = useState('inhale');
  const [, setBreathCount] = useState(0);
  const [showReward, setShowReward] = useState<Reward | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const admins = ['shrutikhungar@gmail.com', 'smriti.duggal@gmail.com'];
  const isAdmin = !!(currentUser?.email && admins.includes(currentUser.email));


  useEffect(() => {
    if (activePractice) {
      setCurrentStep(0);
      setPracticeState('active');
      setIsTimerRunning(true);
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

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#0F1115] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-[#ABCEC9] border-t-transparent animate-spin" />
          <p className="text-[#ABCEC9] text-xs font-bold tracking-[0.3em] animate-pulse">AWAKENING...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <SignInScreen />;
  }

  const practices: Practice[] = [
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
    displayName: currentUser?.displayName || 'Traveler',
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
    if (!activePractice) return;
    if (currentStep < activePractice.steps.length - 1) {
      setCurrentStep(s => s + 1);
      setPracticeState('active');
    } else {
      setShowReward({ xp: activePractice.xp, title: activePractice.title });
      setTimeout(() => { setShowReward(null); setActivePractice(null); }, 3000);
    }
  };

  const renderPracticeModal = () => {
    if (!activePractice) return null;
    const step = activePractice.steps[currentStep];
    return (
      <MeditationPortal
        title={activePractice.title}
        currentStepTitle={activePractice.type === 'breath' ? (themeColors[breathPhase]?.text || 'BREATH') : step.title}
        currentStepInstruction={step.instruction}
        onNext={nextStep}
        onReset={() => { setActivePractice(null); setPracticeState('active'); }}
        onTogglePlay={() => setIsTimerRunning(!isTimerRunning)}
        isPlaying={isTimerRunning}
        progress={(currentStep + 1) / activePractice.steps.length}
      >
        {activePractice.type === 'breath' && (
          <div className="flex flex-col items-center justify-center">
            <motion.div
              animate={{ scale: themeColors[breathPhase]?.scale || 1, opacity: [1, 0.8, 1] }}
              transition={{ duration: themeColors[breathPhase]?.duration || 4, ease: "easeInOut" }}
              className="breath-sphere"
              style={{ boxShadow: themeColors[breathPhase]?.glow }}
            >
              <div className="w-12 h-12 rounded-full bg-white/10 blur-md" />
            </motion.div>
          </div>
        )}
      </MeditationPortal>
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
    <div className="min-h-screen relative overflow-hidden transition-all duration-700 font-sans" style={{ background: darkMode ? 'var(--bg-body)' : 'white' }}>
      <LivingBlobs />
      {renderPracticeModal()}

      {/* MOBILE SIDEBAR OVERLAY */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* SIDEBAR */}
      <aside className={cn(
        "fixed left-0 top-0 bottom-0 w-72 flex-col z-[70] bg-[#1a151b]/95 backdrop-blur-2xl border-r border-white/5 p-8 transition-transform duration-500 ease-fluid",
        "lg:flex lg:translate-x-0 lg:bg-[#1a151b]/40",
        isSidebarOpen ? "translate-x-0 flex" : "-translate-x-full lg:flex"
      )}>
        <div className="flex items-center justify-between mb-12 px-2">
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shadow-lg group-hover:shadow-[0_0_15px_#ABCEC9] transition-all duration-300">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6 text-white" strokeWidth="2">
                <path d="M4 21V10a8 8 0 0 1 16 0v11" />
                <path d="M8 21s1-4 4-4 4 4 4 4" />
              </svg>
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-serif font-bold text-white tracking-wide group-hover:text-[#ABCEC9] transition-colors">The Awakened Path</h1>
              <span className="text-[9px] text-white/30 font-bold uppercase tracking-widest">The Presence Study</span>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-white/40">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 space-y-2">
          {[
            { id: 'home', icon: Sun, label: 'Dashboard' },
            { id: 'intelligence', icon: Sparkles, label: 'Now', fullLabel: 'Power of Now' },
            { id: 'chapters', icon: BookOpen, label: 'Journal' },
            { id: 'stats', icon: BarChart2, label: 'Soul Stats', fullLabel: 'Your Journey' },
            { id: 'journey', icon: Target, label: 'Breath' },
            { id: 'panic', icon: AlertCircle, label: 'Panic', fullLabel: 'Emergency Awareness' },
            { id: 'profile', icon: User, label: 'Profile' },
          ].map((item: any) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                className={cn(
                  "w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 group",
                  isActive ? "bg-white/10 text-white shadow" : "text-white/40 hover:text-white/70"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-[#ABCEC9]" : "group-hover:text-white/60")} />
                <span className="text-sm font-bold uppercase tracking-widest leading-none">
                  {item.fullLabel ? (
                    <>
                      <span className="group-hover:hidden">{item.label}</span>
                      <span className="hidden group-hover:inline">{item.fullLabel}</span>
                    </>
                  ) : item.label}
                </span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#ABCEC9]" />}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className={cn(
        "relative z-10 min-h-screen transition-all duration-700 pb-12",
        "lg:pl-72"
      )}>
        <AnimatePresence>
          {activeTab !== 'home' && (
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onClick={() => { setActiveTab('home'); setActivePractice(null); setIsSidebarOpen(false); }}
              className="fixed top-8 left-8 lg:left-80 z-[60] p-4 rounded-2xl bg-white/5 backdrop-blur-3xl border border-white/10 text-white/40 hover:text-white transition-all group flex items-center gap-3"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] pr-2">Return Home</span>
            </motion.button>
          )}
        </AnimatePresence>

        <div className="max-w-7xl mx-auto p-6 md:p-12 space-y-12">
          <AnimatePresence mode="wait">
            {activeTab === 'home' && (
              <>
                <div className="lg:hidden">
                  <MobileDashboard user={user} setActiveTab={setActiveTab} onOpenSidebar={() => setIsSidebarOpen(true)} signOut={signOut} isAdmin={isAdmin} />
                </div>
                <div className="hidden lg:block">
                  <BreadthDesktop user={user} setActiveTab={setActiveTab} signOut={signOut} isAdmin={isAdmin} />
                </div>
              </>
            )}

            {activeTab === 'journey' && (
              <motion.div key="journey" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                <BreathPractice practices={practices} setActivePractice={setActivePractice} />
              </motion.div>
            )}

            {activeTab === 'situations' && (
              <motion.div key="situations" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: -10 }} exit={{ opacity: 0, x: -10 }}>
                <SituationalPractices onBack={() => setActiveTab('home')} isAdmin={isAdmin} />
              </motion.div>
            )}

            {(activeTab === 'intelligence' || activeTab === 'panic') && (
              <motion.div key={activeTab} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }}>
                <PowerOfNow initialChapter={activeTab === 'panic' ? 'panic' : undefined} />
              </motion.div>
            )}

            {activeTab === 'chapters' && (
              <motion.div key="chapters" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <Journal />
              </motion.div>
            )}

            {activeTab === 'stats' && (
              <motion.div key="stats" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }}>
                <StatsDashboard />
              </motion.div>
            )}

            {activeTab === 'profile' && (
              <motion.div key="profile" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-12">
                <header className="p-12 rounded-[48px] bg-gradient-to-br from-[#ABCEC9]/80 to-[#C65F9D]/80 backdrop-blur-3xl text-white shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-12 opacity-10"><User className="w-48 h-48" /></div>
                  <div className="relative z-10">
                    <h2 className="text-6xl font-serif font-bold mb-4">Level {user.level}</h2>
                    <p className="opacity-80 uppercase tracking-[0.3em] text-xs font-bold">Awareness Score: {user.xp}</p>
                  </div>
                </header>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-1">
                  <div className="card-glow p-10 flex flex-col justify-between rounded-[40px]">
                    <Clock className="w-7 h-7 text-[#ABCEC9] mb-4" />
                    <div>
                      <div className="text-5xl font-serif font-bold text-white mb-2">{user.nowMoments}</div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/30">NOW MOMENTS</span>
                    </div>
                  </div>
                  <div className="card-glow p-10 flex flex-col justify-between rounded-[40px]">
                    <Flame className="w-7 h-7 text-orange-400 mb-4" />
                    <div>
                      <div className="text-5xl font-serif font-bold text-white mb-2">{user.streak}</div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/30">DAY STREAK</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
