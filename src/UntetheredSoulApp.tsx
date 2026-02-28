import { useState, useEffect } from 'react';
import { Flame, Sparkles, Sun, Search, Play, BookOpen, User, Target, AlertCircle, BarChart2, ArrowLeft, Clock, Menu, Heart, X, Lock, Headphones } from 'lucide-react';
import LivingBlobs from './components/ui/LivingBlobs';
import { PowerOfNow } from './features/soul-intelligence/components/PowerOfNow';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from './lib/utils';
import Journal from './features/journal/components/Journal';
import { BreathPractice } from './features/breath/components/BreathPractice';
import StatsDashboard from './features/stats/StatsDashboard';
import { SituationalPractices } from './features/practices/SituationalPractices';
import { useAuth } from './features/auth/AuthContext';
import { MeditationPortal } from './components/ui/MeditationPortal';
import { AwakenStage } from './components/ui/SacredCircle';
import { GlassShape } from './components/ui/GlassShape';
import { SignInScreen } from './features/auth/SignInScreen';
import { AnchorButton, NoiseOverlay, tokens, ProgressFilament } from './components/ui/SacredUI';
import { GlobalSparkles } from './components/ui/GlobalSparkles';
import { useGenerativeAudio } from './features/audio/useGenerativeAudio';

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

const MobileDashboard = ({ user, setActiveTab, onOpenSidebar, signOut, isAdmin, rotateX, rotateY }: any) => {
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
      {/* Hero Container — Floating, no card box */}
      <div className="relative pt-6 pb-12 mx-2 mt-2">
        {/* Decorative background glow — subtle, no box edge */}
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(198,95,157,0.08),transparent_60%)] pointer-events-none" />

        {/* Header — minimal, floating */}
        <header className="relative flex justify-between items-center z-10 mb-8 px-4">
          <button
            onClick={onOpenSidebar}
            className="w-12 h-12 rounded-full bg-white/5 border border-white/5 flex items-center justify-center active:scale-90 transition-all backdrop-blur-md"
          >
            <Menu className="w-5 h-5 text-white/70" />
          </button>

          <div className="flex flex-col items-center">
            <h1 className="text-[12px] font-serif font-bold uppercase tracking-[0.25em] text-white/90">The Awakened Path</h1>
            <span className="text-[8px] font-bold text-white/70 tracking-widest uppercase mt-1">The Presence Study</span>
          </div>

          <button
            onClick={handleLogout}
            className="w-12 h-12 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-white/90 text-[12px] font-bold transition-colors backdrop-blur-md"
          >
            {user.displayName ? user.displayName.substring(0, 2).toUpperCase() : 'AB'}
          </button>
        </header>

        {/* Hero Content Area — pure transparency */}
        <section className="relative flex flex-col items-center justify-center space-y-8 z-10">
          <div className="transform scale-90 sm:scale-100">
            <AwakenStage
              isAnimating={false}
              size="md"
              mouseX={rotateX}
              mouseY={rotateY}
            />
          </div>

          <div className="text-center space-y-6">
            {/* Minimal Metrics Row — no pill container needed if we want full float */}
            <div className="flex items-center gap-8 justify-center opacity-60">
              <div className="flex flex-col items-center gap-1.5">
                <Heart className="w-3 h-3 text-rose-300" />
                <span className="text-[8px] font-bold text-white/70 uppercase tracking-[0.2em]">Gratitude</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <Flame className="w-3 h-3 text-orange-300" />
                <span className="text-[8px] font-bold text-white/70 uppercase tracking-[0.2em]">{user.streak} Days</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Primary Action Card - Situational Practice */}
      <section className="relative px-2">
        {/* Backlit Magenta Glow - Matching Soul Stats */}
        {isAdmin && (
          <motion.div
            animate={{
              scale: [1, 1.02, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-[-15px] rounded-[40px] blur-[35px] bg-[#D16BA5] pointer-events-none mix-blend-plus-lighter"
          />
        )}
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
        <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/70 pl-4">Sacred Sessions</h4>
        <div className="grid grid-cols-2 gap-4">
          {[
            { id: 'intelligence', label: 'Presence', sub: 'EXPLORE', icon: Sparkles, color: '#ABCEC9', variant: 'orb' },
            { id: 'chapters', label: 'Journal', sub: 'GUIDED', icon: BookOpen, color: '#C65F9D', variant: 'book' },
            { id: 'panic', label: 'Awareness', sub: 'EMERGENCY', icon: AlertCircle, color: '#FF7043', variant: 'pulse' },
            { id: 'stats', label: 'Journey', sub: 'HISTORY', icon: BarChart2, color: '#9575CD', variant: 'chart' }
          ].map((item: any) => {
            const isLocked = !isAdmin && item.id !== 'chapters';
            return (
              <div key={item.id} className="relative group/card">
                {/* Backlit Magenta Glow - Matching Soul Stats */}
                {!isLocked && (
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.3, 0.5, 0.3]
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-[-10px] rounded-[32px] blur-[30px] bg-[#D16BA5] pointer-events-none mix-blend-plus-lighter"
                  />
                )}
                <button
                  onClick={() => !isLocked && setActiveTab(item.id)}
                  disabled={isLocked}
                  className={cn(
                    "w-full relative overflow-hidden aspect-square bg-white/[0.03] border border-white/5 rounded-[32px] p-4 flex flex-col items-center justify-center gap-4 transition-all",
                    !isLocked ? "hover:border-white/20 hover:bg-white/[0.05] active:scale-95 shadow-2xl" : "opacity-40 cursor-not-allowed"
                  )}
                >
                  {!isLocked && <div className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 bg-[radial-gradient(circle_at_center,var(--item-color),transparent_70%)]" style={{ '--item-color': `${item.color}15` } as any} />}

                  <div className="relative w-24 h-24 flex items-center justify-center -mt-2">
                    {isLocked ? (
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Lock className="w-8 h-8 text-white/70" />
                        <div className="w-full h-full absolute inset-0 bg-black/20 backdrop-blur-[2px] rounded-full" />
                      </div>
                    ) : (
                      <GlassShape icon={item.icon} color={item.color} variant={item.variant} className="w-full h-full" />
                    )}
                  </div>

                  <div className="text-center relative z-10">
                    <div className="text-lg font-serif font-bold text-white mb-0.5">{item.label}</div>
                    <div className="text-[8px] font-bold text-white/70 tracking-[0.2em]">
                      {isLocked ? 'COMING SOON' : item.sub}
                    </div>
                  </div>
                </button>
              </div>
            )
          })}
        </div>
      </section>
    </motion.div>
  );
};

const BreadthDesktop = ({ user, setActiveTab, signOut, isAdmin, rotateX, rotateY }: any) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-12 max-w-5xl mx-auto"
    >
      {/* Desktop Optimized Header — Floating */}
      <header className="flex justify-between items-center p-6 border-b border-white/5">
        <div className="flex items-center gap-6">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
            <Search className="w-5 h-5 text-white/70" />
          </div>
          <div>
            <h1 className="text-xl font-serif font-light text-white tracking-tight">The Awakened Path</h1>
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/70 font-bold">The Presence Study</p>
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
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/80 text-sm font-bold">
            {user.displayName ? user.displayName.substring(0, 2).toUpperCase() : 'AB'}
          </div>
        </button>
      </header>

      {/* Hero Guided Area - Minimalist Desktop */}
      <section className="relative py-16 flex flex-col items-center justify-center min-h-[500px]">
        <div className="relative z-10 flex flex-col items-center text-center space-y-16">
          <div className="relative group">
            <AwakenStage
              isAnimating={false}
              size="lg"
              mouseX={rotateX}
              mouseY={rotateY}
            />
          </div>

          <div className="flex gap-20">
            <div className="flex flex-col items-center gap-3">
              <span className="text-[10px] font-bold text-white/70 uppercase tracking-[0.5em]">GRATITUDE FLOW</span>
              <div className="w-1.5 h-1.5 rounded-full bg-rose-400 opacity-50 shadow-[0_0_10px_#fb7185]" />
            </div>
            <div className="flex flex-col items-center gap-3">
              <span className="text-[10px] font-bold text-white/70 uppercase tracking-[0.5em]">{user.streak} DAY STREAK</span>
              <div className="w-1.5 h-1.5 rounded-full bg-[#ABCEC9] opacity-50 shadow-[0_0_10px_#ABCEC9]" />
            </div>
          </div>
        </div>
      </section>

      {/* Main Action Call - Situational Practice */}
      <section className="relative">
        {/* Backlit Magenta Glow - Matching Soul Stats */}
        {isAdmin && (
          <motion.div
            animate={{
              scale: [1, 1.02, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-[-20px] rounded-[40px] blur-[50px] bg-[#D16BA5] pointer-events-none mix-blend-plus-lighter"
          />
        )}
        <button
          onClick={() => isAdmin ? setActiveTab('situations') : null}
          className={cn(
            "w-full group relative overflow-hidden rounded-[40px] bg-white p-8 flex items-center justify-between transition-all shadow-2xl shadow-black/20",
            isAdmin ? "hover:bg-[#f8f5f8] hover:scale-[1.01] active:scale-[0.99]" : "opacity-50 cursor-not-allowed grayscale"
          )}
        >
          <div className="flex items-center gap-10">
            <div className="w-20 h-20 rounded-[28px] bg-[#1a151b] flex items-center justify-center shadow-xl transition-transform duration-500">
              {isAdmin ? <Flame className="w-10 h-10 text-[#C65F9D]" /> : <Lock className="w-10 h-10 text-white/70" />}
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
          <h4 className="text-[12px] font-bold uppercase tracking-[0.5em] text-white/70">Sacred Practices</h4>
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
              <div key={item.id} className="relative group/card">
                {/* Backlit Magenta Glow - Matching Soul Stats */}
                {!isLocked && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{
                      opacity: [0.2, 0.4, 0.2],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: item.delay }}
                    className="absolute inset-[-15px] rounded-[40px] blur-[40px] bg-[#D16BA5] pointer-events-none mix-blend-plus-lighter"
                  />
                )}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: item.delay }}
                  onClick={() => !isLocked && setActiveTab(item.id)}
                  disabled={isLocked}
                  className={cn(
                    "w-full h-full group relative overflow-hidden bg-white/[0.03] border border-white/5 rounded-[40px] p-8 flex flex-col items-center justify-center gap-6 transition-all",
                    !isLocked ? "hover:border-white/20 hover:bg-white/[0.05] active:scale-95 shadow-2xl" : "opacity-40 cursor-not-allowed"
                  )}
                >
                  {!isLocked && <div className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 bg-[radial-gradient(circle_at_center,var(--item-color),transparent_70%)]" style={{ '--item-color': `${item.color}15` } as any} />}

                  <div className="relative w-32 h-32 flex items-center justify-center">
                    {isLocked ? (
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Lock className="w-12 h-12 text-white/70" />
                        <div className="w-full h-full absolute inset-0 bg-black/20 backdrop-blur-[2px] rounded-full" />
                      </div>
                    ) : (
                      <GlassShape icon={item.icon} color={item.color} variant={item.variant} className="w-full h-full" />
                    )}
                  </div>

                  <div className="text-center relative z-10">
                    <div className="text-2xl font-serif font-bold text-white mb-1">{item.label}</div>
                    <div className="text-[9px] font-bold text-white/70 tracking-[0.3em] uppercase">
                      {isLocked ? 'COMING SOON' : item.sub}
                    </div>
                  </div>
                </motion.button>
              </div>
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
  const [activePractice, setActivePractice] = useState<Practice | null>(null);
  const [practiceState, setPracticeState] = useState('active');
  const [currentStep, setCurrentStep] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [breathPhase, setBreathPhase] = useState('inhale');
  const [, setBreathCount] = useState(0);
  const [showReward, setShowReward] = useState<Reward | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { isAudioEnabled, toggleAudio, setVibrationalState } = useGenerativeAudio();

  // Map active tab to binaural frequencies
  useEffect(() => {
    if (activeTab === 'home' || activeTab === 'chapters') {
      setVibrationalState('calm'); // 432Hz + 4Hz
    } else if (activeTab === 'intelligence') {
      setVibrationalState('focus'); // 528Hz + 14Hz
    } else if (activeTab === 'panic' || activeTab === 'situations') {
      setVibrationalState('energy'); // 639Hz + 40Hz
    } else {
      setVibrationalState('calm');
    }
  }, [activeTab, setVibrationalState]);

  // Magnetic orb tilt for the entire app (dashboard)
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-400, 400], [8, -8]), { stiffness: 25, damping: 20 });
  const rotateY = useSpring(useTransform(mx, [-400, 400], [-8, 8]), { stiffness: 25, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (activeTab === 'home') {
      mx.set(e.clientX - window.innerWidth / 2);
      my.set(e.clientY - window.innerHeight / 2);
    }
  };

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
    <div
      onMouseMove={handleMouseMove}
      className="min-h-screen relative overflow-hidden transition-all duration-700 font-sans"
      style={{ background: tokens.plum }}
    >
      <LivingBlobs />
      <GlobalSparkles />
      <NoiseOverlay />
      <div
        style={{
          position: "fixed", inset: 0,
          background: `radial-gradient(ellipse 80% 50% at 50% -20%, #2D104060, transparent), radial-gradient(ellipse 60% 40% at 80% 80%, #D16BA508, transparent)`,
          pointerEvents: "none"
        }}
      />
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
              <span className="text-[9px] text-white/70 font-bold uppercase tracking-widest">The Presence Study</span>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-white/70">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 space-y-3">
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
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 16px', borderRadius: 0, background: 'none', border: 'none',
                  cursor: 'pointer', position: 'relative',
                  borderLeft: `2px solid ${isActive ? '#ABCEC9' : 'transparent'}`,
                  paddingLeft: isActive ? 14 : 16,
                  transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
                }}
              >
                <Icon
                  size={15} strokeWidth={isActive ? 1.5 : 1}
                  style={{
                    color: isActive ? '#ABCEC9' : 'rgba(255,255,255,0.25)',
                    transition: 'all 0.4s',
                  }}
                />
                <span style={{
                  fontSize: 9, letterSpacing: '0.4em', textTransform: 'uppercase',
                  fontFamily: 'system-ui, sans-serif', fontWeight: 700,
                  color: isActive ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.25)',
                  transition: 'color 0.4s',
                }}>
                  {item.label}
                </span>
                {/* Active dot — slides smoothly */}
                {isActive && (
                  <motion.div
                    layoutId="nav-active-dot"
                    style={{
                      marginLeft: 'auto', width: 4, height: 4, borderRadius: '50%',
                      background: '#ABCEC9',
                      boxShadow: `0 0 8px #ABCEC9`,
                    }}
                  />
                )}
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
              className="fixed top-8 left-8 lg:left-80 z-[60] p-4 rounded-2xl bg-white/5 backdrop-blur-3xl border border-white/10 text-white/70 hover:text-white transition-all group flex items-center gap-3"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] pr-2">Return Home</span>
            </motion.button>
          )}
        </AnimatePresence>

        {/* SPATIAL AUDIO TOGGLE */}
        <button
          onClick={toggleAudio}
          className={cn(
            "fixed top-8 right-8 z-[60] p-4 rounded-full backdrop-blur-3xl border transition-all flex items-center justify-center group overflow-hidden shadow-2xl",
            isAudioEnabled
              ? "bg-[#D16BA5]/10 border-[#D16BA5]/30 text-[#D16BA5] shadow-[0_0_20px_rgba(209,107,165,0.2)]"
              : "bg-white/5 border-white/10 text-white/40 hover:text-white"
          )}
        >
          {isAudioEnabled && (
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-[#D16BA5]/20 blur-xl"
            />
          )}
          <Headphones className={cn("w-5 h-5 relative z-10 transition-transform", isAudioEnabled ? "animate-pulse" : "group-hover:scale-110")} />
        </button>

        <div className="max-w-7xl mx-auto p-6 md:p-12 space-y-12">
          <AnimatePresence mode="wait">
            {activeTab === 'home' && (
              <>
                <div className="lg:hidden">
                  <MobileDashboard
                    user={user}
                    setActiveTab={setActiveTab}
                    onOpenSidebar={() => setIsSidebarOpen(true)}
                    signOut={signOut}
                    isAdmin={isAdmin}
                    rotateX={rotateX}
                    rotateY={rotateY}
                  />
                </div>
                <div className="hidden lg:block">
                  <BreadthDesktop
                    user={user}
                    setActiveTab={setActiveTab}
                    signOut={signOut}
                    isAdmin={isAdmin}
                    rotateX={rotateX}
                    rotateY={rotateY}
                  />
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

            {activeTab === 'profile' && user && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-16 max-w-4xl mx-auto"
              >
                {/* Sacred Profile Header */}
                <header className="relative p-16 rounded-[60px] border border-white/5 bg-white/[0.02] overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#D16BA5]/10 to-transparent pointer-events-none" />
                  <div className="absolute top-[-20%] right-[-10%] w-80 h-80 bg-[#D16BA5]/5 blur-[100px] rounded-full" />

                  <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left">
                    <div className="space-y-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.8em] text-white/70">Level {user.level} · Presence Anchor</p>
                      <h2 className="text-7xl font-serif font-light text-white tracking-tight">The Witness</h2>
                      <div className="pt-4 flex items-center gap-4 justify-center md:justify-start">
                        <div className="px-5 py-1.5 rounded-full border border-[#ABCEC9]/20 bg-[#ABCEC9]/5 text-[10px] uppercase font-bold tracking-[0.3em] text-[#ABCEC9]">
                          {user.xp} Total XP
                        </div>
                      </div>
                    </div>

                    <AnchorButton variant="ghost" onClick={signOut} className="!w-auto !px-12 text-white/70 hover:text-white">
                      ✦ Unseal Session
                    </AnchorButton>
                  </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Moments of Now */}
                  <div className="p-12 rounded-[48px] border border-white/5 bg-white/[0.02] flex flex-col justify-between h-72 group hover:bg-white/[0.04] transition-all duration-700">
                    <div className="w-12 h-12 rounded-2xl bg-[#ABCEC9]/5 border border-[#ABCEC9]/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
                      <Clock className="w-6 h-6 text-[#ABCEC9]" />
                    </div>
                    <div>
                      <div className="text-6xl font-serif font-light text-white mb-3 tracking-tight">{user.nowMoments}</div>
                      <span className="text-[9px] font-bold uppercase tracking-[0.6em] text-white/70">NOW MOMENTS</span>
                    </div>
                  </div>

                  {/* Day Streak */}
                  <div className="p-12 rounded-[48px] border border-white/5 bg-white/[0.02] flex flex-col justify-between h-72 group hover:bg-white/[0.04] transition-all duration-700">
                    <div className="w-12 h-12 rounded-2xl bg-orange-400/5 border border-orange-400/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
                      <Flame className="w-6 h-6 text-orange-400/50" />
                    </div>
                    <div>
                      <div className="text-6xl font-serif font-light text-white mb-3 tracking-tight">{user.streak}</div>
                      <span className="text-[9px] font-bold uppercase tracking-[0.6em] text-white/70">DAY STREAK</span>
                    </div>
                  </div>
                </div>

                {/* Evolution Progress */}
                <div className="p-16 rounded-[60px] border border-white/5 bg-white/[0.02] space-y-12">
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-2xl font-serif font-light text-white/60">Consciousness Expansion</h3>
                    <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#D16BA5]">Next Level: {user.level + 1}</span>
                  </div>
                  <div className="relative h-20 w-full flex items-center">
                    <ProgressFilament progress={0.65} />
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
