import { useState, useEffect, useMemo } from 'react';
import { Flame, Sparkles, Sun, BookOpen, User, BarChart2, ArrowLeft, Clock, Menu, Heart, X, Lock, Headphones, LogOut, Mail, Youtube } from 'lucide-react';
import { db } from './firebase';
import LivingBlobs from './components/ui/LivingBlobs';
import { CoursesHub } from './features/courses/CoursesHub';
import { WisdomUntetheredCourse } from './features/courses/WisdomUntetheredCourse';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from './lib/utils';
import Journal from './features/journal/components/Journal';
import { BreathPractice } from './features/breath/components/BreathPractice';
import StatsDashboard from './features/stats/StatsDashboard';
import { SituationalPractices } from './features/practices/SituationalPractices';
import { useAuth } from './features/auth/AuthContext';
import { MeditationPortal } from './components/ui/MeditationPortal';
import { AwakenStage, SacredCircle } from './components/ui/SacredCircle';
import { SignInScreen } from './features/auth/SignInScreen';
import { AnchorButton, NoiseOverlay } from './components/ui/SacredUI';
import { GlobalSparkles } from './components/ui/GlobalSparkles';
import { useGenerativeAudio } from './features/audio/useGenerativeAudio';
import { ThemeToggle, useTheme } from './theme/ThemeSystem';
import { collection, query, orderBy, limit, onSnapshot, getDocs, doc } from 'firebase/firestore';
import { AwakenedPathLogo } from './components/ui/AwakenedPathLogo';
import EngagementReport from './features/admin/EngagementReport';
import { useAchievements } from './features/achievements/useAchievements';
import { AchievementToast } from './features/achievements/AchievementsPanel';
import { MedalGrid } from './components/domain/MedalGrid';
import { isAdminEmail, hasWisdomAccess, isUnlockedUser } from './config/admin';
import { TodayPath } from './features/practices/TodayPath';
import { useCourseTracking } from './hooks/useCourseTracking';
import { useWeeklyAssignment } from './hooks/useWeeklyAssignment';
import { InfoTooltip } from './components/ui/InfoTooltip';
import { WhatsAppButton } from './components/ui/WhatsAppButton';
import { usePersistedState } from './hooks/usePersistedState';

const DashboardActions = ({ user, progress, weeklyAssignment, onNavigate, onViewProgress }: any) => {
  return (
    <div className="max-w-2xl mx-auto w-full px-4 mb-4">
      <TodayPath
        userId={user?.uid}
        progress={progress}
        weeklyAssignment={weeklyAssignment}
        onNavigate={(tab, qId, view) => {
          if (tab === 'wisdom_untethered') {
            onNavigate('wisdom_untethered', qId, view);
          } else {
            onNavigate(tab);
          }
        }}
        onViewProgress={onViewProgress}
      />
    </div>
  );
};

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

const EMOTION_MAP: Record<string, string> = {
  ANXIETY: '#FF7043',
  SADNESS: '#5C6BC0',
  INSECURITY: '#5EC4B0',
  ANGER: '#E53935',
  PEACE: '#ABCEC9',
  JOY: '#FFD54F',
  GUILT: '#9575CD',
  SHAME: '#7986CB',
};

const TIME_GRADIENTS: Record<string, string> = {
  morning: 'linear-gradient(135deg, rgba(255, 214, 112, 0.08) 0%, transparent 40%)',
  afternoon: 'linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, transparent 40%)',
  evening: 'linear-gradient(135deg, rgba(255, 112, 67, 0.08) 0%, transparent 40%)',
  night: 'linear-gradient(135deg, rgba(92, 107, 192, 0.08) 0%, transparent 40%)',
};

function getDominantEmotionColor(emotionsStr?: string) {
  if (!emotionsStr) return null;
  const emotions = emotionsStr.split(', ').map(e => e.trim().toUpperCase());
  for (const e of emotions) {
    if (EMOTION_MAP[e]) return EMOTION_MAP[e];
  }
  return null;
}

// --- Sub-components moved outside for stability ---

const MobileDashboard = ({ user, onOpenSidebar, rotateX, rotateY, progress, weeklyAssignment, onNavigate }: any) => {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning'
    : hour < 17 ? 'Good afternoon'
      : 'Good evening';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-10"
    >
      {/* Hero Container — Floating, no card box */}
      <div className="relative pt-6 pb-12 mx-2 mt-2">
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(94,196,176,0.07),transparent_60%)] pointer-events-none" />

        <header className="relative flex justify-between items-center z-10 mb-8 px-4">
          <button
            onClick={onOpenSidebar}
            className="w-12 h-12 rounded-full bg-[var(--bg-surface)] border border-[var(--border-default)] flex items-center justify-center active:scale-90 transition-all backdrop-blur-md"
          >
            <Menu className="w-5 h-5 text-[var(--text-muted)]" />
          </button>

          <div className="flex flex-col items-center">
            <AwakenedPathLogo variant="icon" size="sm" animated={false} className="mb-1 opacity-80" />
            <p className="text-[11px] font-serif italic text-[var(--accent-primary)] tracking-[0.3em] uppercase mb-0.5">{greeting},</p>
            <h1 className="text-[14px] font-serif font-bold text-[var(--text-primary)] uppercase tracking-widest">{user.displayName || 'Traveler'}</h1>
          </div>

          <div className="w-12 h-12 flex-shrink-0"></div>
        </header>

        <section className="relative flex flex-col items-center justify-center space-y-12 mt-12 z-10">
          <div className="transform scale-90 sm:scale-100">
            <AwakenStage
              isAnimating={false}
              size="md"
              mouseX={rotateX}
              mouseY={rotateY}
            />
          </div>

          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-6 px-6 py-2.5 rounded-full bg-[var(--bg-surface)]/50 border border-[var(--border-subtle)]/50 backdrop-blur-md shadow-lg">
              <div className="flex items-center gap-2">
                <Heart className="w-3 h-3 text-rose-300" />
                <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em]">Flow</span>
              </div>
              <div className="w-px h-3 bg-[var(--border-subtle)]/30" />
              <div className="flex items-center gap-2">
                <Flame className="w-3 h-3 text-orange-300" />
                <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em]">{user.streak} Days</span>
              </div>
            </div>
          </div>
        </section>
      </div>
      <div className="px-4">
        <DashboardActions
          user={user}
          progress={progress}
          weeklyAssignment={weeklyAssignment}
          onNavigate={onNavigate}
          onViewProgress={() => onNavigate('stats')}
        />
      </div>
    </motion.div>
  );
};

const BreadthDesktop = ({ user, rotateX, rotateY, progress, weeklyAssignment, onNavigate }: any) => {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning'
    : hour < 17 ? 'Good afternoon'
      : 'Good evening';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 max-w-5xl mx-auto"
    >
      <header className="flex justify-between items-center p-8 border-b border-[var(--border-default)]/30 bg-[var(--bg-surface)]/10 backdrop-blur-sm">
        <div className="flex items-center gap-6">
          <AwakenedPathLogo variant="icon" size="md" animated={true} />
          <div className="text-left">
            <p className="text-xs text-[var(--accent-primary)] font-serif italic mb-1 uppercase tracking-widest">
              {greeting},
            </p>
            <h1 className="text-3xl font-serif font-light text-[var(--text-primary)] tracking-tight">
              {user.displayName}
            </h1>
          </div>
        </div>
        <div className="flex flex-col items-end opacity-90">
          <span className="text-[11px] font-serif italic text-[var(--text-secondary)] tracking-[0.3em] uppercase">The Presence Study</span>
        </div>
      </header>

      <section className="relative py-8 flex flex-col items-center justify-center min-h-[360px]">
        <div className="relative z-10 flex flex-col items-center text-center space-y-8">
          <div className="relative group">
            <AwakenStage
              isAnimating={false}
              size="md"
              mouseX={rotateX}
              mouseY={rotateY}
            />
          </div>

          <div className="inline-flex items-center gap-10 px-10 py-4 rounded-full bg-[var(--bg-surface)]/40 border border-[var(--border-subtle)]/30 backdrop-blur-2xl shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

            <div className="flex items-center gap-3">
              <Heart size={16} className="text-rose-400" />
              <span className="text-[12px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.25em]">Flow</span>
            </div>
            <div className="w-px h-5 bg-[var(--border-subtle)]/40" />
            <div className="flex items-center gap-3">
              <Flame size={16} className="text-amber-400" style={{ filter: `drop-shadow(0 0 ${Math.min(user.streak, 10) * 2}px #fbbf24)` }} />
              <span className="text-[12px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.25em]">{user.streak} Days</span>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto w-full">
        <DashboardActions
          user={user}
          progress={progress}
          weeklyAssignment={weeklyAssignment}
          onNavigate={onNavigate}
          onViewProgress={() => onNavigate('stats')}
        />
      </div>
    </motion.div>
  );
};

// --- Main App Component ---

export default function UntetheredApp() {
  const { user: currentUser, loading, signOut, isAccessValid } = useAuth();
  const { theme } = useTheme();
  // ── Persisted navigation state — app resumes exactly where user left off ──
  const [activeTab, setActiveTab] = usePersistedState<string>('awakened-tab', 'home');
  const [activeQuestionId, setActiveQuestionId] = usePersistedState<string>('awakened-question', 'question1');
  const [viewMode, setViewMode] = usePersistedState<'explanation' | 'practice' | 'video'>(
    'awakened-view-mode',
    'explanation',
    (v) => ['explanation', 'practice', 'video'].includes(v)
  );
  const [activeCourseId, setActiveCourseId] = usePersistedState<string | null>('awakened-course', null);

  // ── Weekly assignment — system assigns one question per week ──
  const weeklyAssignment = useWeeklyAssignment(
    currentUser?.metadata?.creationTime ?? null
  );

  // ── Other app state (non-persisted) ──
  const [activePractice, setActivePractice] = useState<Practice | null>(null);
  const [practiceState, setPracticeState] = useState('active');
  const [currentStep, setCurrentStep] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [breathPhase, setBreathPhase] = useState('inhale');
  const [, setBreathCount] = useState(0);
  const [showReward, setShowReward] = useState<Reward | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { unlocked, points, toastQueue, dismissToast, checkAndUnlock, awardEvent } = useAchievements();
  const { isAudioEnabled, toggleAudio, setVibrationalState } = useGenerativeAudio();
  const [lastEntry, setLastEntry] = useState<any>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const { progress } = useCourseTracking(currentUser?.uid);
  const [watchedParts, setWatchedParts] = useState<string[]>([]);

  const onNavigate = (id: string, questionId?: string, view?: string) => {
    if (id === 'learn') {
      setActiveTab('intelligence');
      if (questionId) setActiveQuestionId(questionId);
      if (view) setViewMode(view as any);
      return;
    }
    if (id === 'wisdom_untethered') {
      setActiveTab('wisdom_untethered');
      setActiveCourseId('wisdom_untethered');
      if (questionId) setActiveQuestionId(questionId);
      if (view) setViewMode(view as any);
      if (window.innerWidth < 1024) setIsSidebarOpen(false);
      return;
    }
    if (id === 'journal') {
      setActiveTab('chapters');
      return;
    }
    if (id === 'practice' || id === 'situations') {
      setActiveTab('situations');
      return;
    }
    setActiveTab(id);
    if (questionId) setActiveQuestionId(questionId);
    if (view) setViewMode(view as any);
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  useEffect(() => {
    localStorage.setItem('awakened-path-active-course', activeCourseId || '');
  }, [activeCourseId]);
  const [expandedChapter1, setExpandedChapter1] = useState(true);

  const timeOfDayGradient = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 11) return TIME_GRADIENTS.morning;
    if (hour < 16) return TIME_GRADIENTS.afternoon;
    if (hour < 21) return TIME_GRADIENTS.evening;
    return TIME_GRADIENTS.night;
  }, []);

  const emotionColor = useMemo(() => {
    return getDominantEmotionColor(lastEntry?.emotions);
  }, [lastEntry]);

  // Global Access Control Redirect
  useEffect(() => {
    if (!loading && !isAccessValid && activeTab !== 'home' && activeTab !== 'profile' && activeTab !== 'intelligence') {
      setActiveTab('intelligence');
    }
  }, [isAccessValid, activeTab, loading]);

  // Persist Navigation State
  useEffect(() => {
    localStorage.setItem('awakened-path-active-tab', activeTab);
    localStorage.setItem('awakened-path-active-question', activeQuestionId);
    localStorage.setItem('awakened-path-view-mode', viewMode);
  }, [activeTab, activeQuestionId, viewMode]);

  useEffect(() => {
    if (emotionColor) {
      document.documentElement.style.setProperty('--app-emotion-color', emotionColor);
      const event = new CustomEvent('emotional_resonance', {
        detail: {
          physics: {
            speed: 0.45,
            distort: 0.16
          }
        }
      });
      document.dispatchEvent(event);
    } else {
      document.documentElement.style.removeProperty('--app-emotion-color');
    }
  }, [emotionColor]);

  const [stats, setStats] = useState({
    totalEntries: 0,
    journalCount: 0,
    situationalCount: 0,
    journeyCount: 0,
    streak: 0,
    xp: 0,
    level: 1,
    joinedAt: currentUser?.metadata.creationTime ? new Date(currentUser.metadata.creationTime).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'March 2026'
  });

  // Sync Power of Now progress for achievement matching
  useEffect(() => {
    if (!currentUser) return;
    const unsub = onSnapshot(doc(db, 'users', currentUser.uid, 'progress', 'powerOfNow'), (snap: any) => {
      if (snap.exists()) {
        setWatchedParts(snap.data().watched || []);
      }
    });
    return unsub;
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    const fetchStats = async () => {
      const journalRef = collection(db, 'users', currentUser.uid, 'journal');
      const situationalRef = collection(db, 'users', currentUser.uid, 'situational-logs');
      const journeyRef = collection(db, 'users', currentUser.uid, 'journey');

      const [jSnap, sSnap, jySnap] = await Promise.all([
        getDocs(journalRef),
        getDocs(situationalRef),
        getDocs(journeyRef)
      ]);

      const allDocs = [
        ...jSnap.docs.map(d => ({ ...d.data(), source: 'journal' })),
        ...sSnap.docs.map(d => ({ ...d.data(), source: 'situational' })),
        ...jySnap.docs.map(d => ({ ...d.data(), source: 'journey' }))
      ];

      const entries = allDocs.map((d: any) => {
        if (d.createdAt?.toDate) return d.createdAt.toDate();
        if (d.timestamp?.toDate) return d.timestamp.toDate();
        return new Date(d.date || Date.now());
      }).sort((a: Date, b: Date) => b.getTime() - a.getTime());

      // Calculate streak
      let streak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let checkDate = new Date(today);
      const entryDates = new Set(entries.map((d: Date) => {
        const dd = new Date(d);
        dd.setHours(0, 0, 0, 0);
        return dd.getTime();
      }));

      // Check today or yesterday to start streak
      if (!entryDates.has(checkDate.getTime())) {
        checkDate.setDate(checkDate.getDate() - 1);
      }

      while (entryDates.has(checkDate.getTime())) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }

      const total = allDocs.length;
      const totalPoints = points; // Use points from useAchievements as canonical XP
      const currentLevel = Math.floor(totalPoints / 1000) + 1;

      setStats({
        totalEntries: total,
        journalCount: jSnap.size,
        situationalCount: sSnap.size,
        journeyCount: jySnap.size,
        streak,
        xp: totalPoints,
        level: currentLevel,
        joinedAt: stats.joinedAt
      });

      // Global check for unlocking new standard achievements on boot/refresh
      checkAndUnlock({
        journalEntries: jSnap.size,
        situationalPractices: sSnap.size,
        journeyActivities: jySnap.size,
        videosWatched: watchedParts.length,
        chaptersComplete: 0,
        currentStreak: streak,
        maxStreak: streak, // This ideally should be from a history field if we tracked it
        panicUsed: 0,
        bodyTruthTests: 0,
        voiceWitnessed: 0,
        remindersEnabled: false,
        statsViewed: 0,
      });
    };
    fetchStats();
  }, [currentUser, checkAndUnlock, points, watchedParts.length]);

  useEffect(() => {
    document.title = "Awakened Path";
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    const q = query(
      collection(db, 'users', currentUser.uid, 'journal'),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setLastEntry({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
      }
    });
    return () => unsubscribe();
  }, [currentUser]);

  // Map active tab to binaural frequencies
  useEffect(() => {
    if (activeTab === 'home' || activeTab === 'chapters') {
      setVibrationalState('calm'); // 432Hz + 4Hz
    } else if (activeTab === 'intelligence' || activeTab === 'wisdom_untethered') {
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

  const isAdmin = isAdminEmail(currentUser?.email);


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
      <div className="min-h-screen w-full bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-[var(--brand-primary)] border-t-transparent animate-spin" />
          <p className="text-[var(--brand-primary)] text-xs font-bold tracking-[0.3em] animate-pulse">AWAKENING...</p>
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
    displayName: currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Traveler',
    level: stats.level,
    xp: stats.xp,
    xpToNext: stats.level * 1000,
    streak: stats.streak,
    joinedAt: stats.joinedAt,
    nowMoments: stats.totalEntries,
    email: currentUser?.email
  };

  const nextStep = () => {
    if (!activePractice) return;
    if (currentStep < activePractice.steps.length - 1) {
      setCurrentStep(s => s + 1);
      setPracticeState('active');
    } else {
      awardEvent('practice_session');
      checkAndUnlock({
        journalEntries: stats.journalCount,
        situationalPractices: stats.situationalCount,
        journeyActivities: stats.journeyCount,
        videosWatched: watchedParts.length,
        chaptersComplete: 0,
        currentStreak: stats.streak,
        maxStreak: stats.streak,
        panicUsed: 0,
        bodyTruthTests: 0,
        voiceWitnessed: 0,
        remindersEnabled: false,
        statsViewed: 0,
      });

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
        onPrev={currentStep > 0 ? () => setCurrentStep(prev => prev - 1) : undefined}
        onReset={() => { setActivePractice(null); setPracticeState('active'); }}
        onTogglePlay={() => setIsTimerRunning(!isTimerRunning)}
        isPlaying={isTimerRunning}
        progress={(currentStep + 1) / activePractice.steps.length}
        totalSteps={activePractice.steps.length}
        currentStepIndex={currentStep}
        onClose={() => { setActivePractice(null); setIsTimerRunning(false); }}
      >
        {activePractice.type === 'breath' && (
          <div className="flex flex-col items-center justify-center py-12">
            <motion.div
              animate={{
                scale: themeColors[breathPhase]?.scale || 1,
              }}
              transition={{
                duration: themeColors[breathPhase]?.duration || 4,
                ease: "easeInOut"
              }}
              className="relative"
            >
              <SacredCircle
                variant="A"
                size="lg"
                isAnimating={true}
                text={themeColors[breathPhase]?.text || 'BREATH'}
              />
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
      style={{ background: theme.bgGradient, color: theme.textPrimary }}
    >
      <LivingBlobs />
      <GlobalSparkles />
      <NoiseOverlay />
      <div
        style={{
          position: "fixed", inset: 0,
          background: `radial-gradient(ellipse 80% 50% at 50% -20%, var(--accent-secondary-dim), transparent), radial-gradient(ellipse 60% 40% at 80% 80%, var(--accent-primary-dim), transparent)`,
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
        "fixed left-0 top-0 bottom-0 w-72 flex-col z-[70] bg-[var(--bg-secondary)] backdrop-blur-2xl border-r border-[var(--border-default)] p-8 transition-transform duration-500 ease-fluid",
        "lg:flex lg:translate-x-0",
        isSidebarOpen ? "translate-x-0 flex" : "-translate-x-full lg:flex"
      )}>
        <div className="flex items-center justify-between mb-10 px-2">
          <AwakenedPathLogo
            variant="full"
            size="md"
            animated={true}
            onClick={() => setActiveTab('home')}
            className="group"
          />
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-[var(--text-muted)]">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="space-y-0.5">
          {[
            { id: 'home', icon: Sun, label: 'Dashboard', locked: false },
            {
              id: 'courses_group', icon: Sparkles, label: 'Courses', locked: false, isGroup: true, subItems: [
                { id: 'intelligence', label: 'The Power of Now' },
                { id: 'wisdom_untethered', label: 'Wisdom Untethered', locked: !hasWisdomAccess(currentUser?.email) },
              ]
            },
            { id: 'chapters', icon: BookOpen, label: 'Journal', locked: false },
            { id: 'situations', icon: Flame, label: 'The Practice Room', fullLabel: 'Situational Practice', locked: false },
            { id: 'stats', icon: BarChart2, label: 'Progress', fullLabel: 'Your Progress', locked: false },
            { id: 'profile', icon: User, label: 'Profile', locked: false },
          ].map((item: any) => {
            if (item.isGroup) {
              const anySubActive = item.subItems.some((sub: any) => activeTab === sub.id);
              const Icon = item.icon;
              return (
                <div key={item.id} className="space-y-0.5 my-1">
                  <div className="flex items-center gap-3 px-6 py-2 mb-1">
                    <Icon size={18} strokeWidth={anySubActive ? 2 : 1} className={cn("transition-colors", anySubActive ? "text-[var(--accent-primary)]" : "text-[var(--text-muted)]")} />
                    <span className="text-[13px] font-bold uppercase tracking-[0.5em] text-[var(--text-muted)] font-sans">
                      {item.label}
                    </span>
                  </div>
                  <div className="flex flex-col ml-[2.75rem] space-y-0.5 relative before:content-[''] before:absolute before:left-[-1.25rem] before:top-2 before:bottom-2 before:w-px before:bg-[var(--border-subtle)]/50">
                    {item.subItems.map((sub: any) => {
                      const isActive = activeTab === sub.id;
                      return (
                        <div key={sub.id} className="flex flex-col">
                          <button
                            onClick={() => {
                              if (sub.locked) {
                                alert('This sacred path is currently undergoing refinement for a select group of travelers.');
                                return;
                              }
                              setActiveTab(sub.id);
                              if (sub.id !== 'wisdom_untethered') {
                                setIsSidebarOpen(false);
                              } else if (sub.id === 'wisdom_untethered' && !expandedChapter1) {
                                setExpandedChapter1(true);
                              }
                            }}
                            className={cn(
                              "w-full flex items-center gap-3 px-4 py-2 transition-all duration-400 relative group rounded-2xl text-left",
                            )}
                            style={{
                              background: isActive ? 'var(--accent-primary-muted)' : 'none',
                            }}
                          >
                            <span className={cn(
                              "text-[13px] uppercase transition-colors duration-400 font-sans relative z-10 w-full whitespace-nowrap",
                              sub.label.length > 10 ? "tracking-[0.1em]" : "tracking-[0.25em]",
                              isActive ? "text-[var(--text-primary)] font-bold" : "text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] font-medium"
                            )}>
                              {sub.label}
                              {sub.locked && <Lock size={10} className="inline-block ml-2 text-[var(--accent-secondary)]" />}
                            </span>
                            {isActive && (
                              <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] shadow-[0_0_8px_var(--accent-primary)] z-10" />
                            )}
                          </button>

                          {/* Render questions if Wisdom Untethered is active */}
                          {isActive && sub.id === 'wisdom_untethered' && (
                            <div className="flex flex-col mt-2 ml-1 border-l border-[var(--border-subtle)]/30 overflow-hidden">
                              <button
                                onClick={() => setExpandedChapter1(!expandedChapter1)}
                                className="flex justify-between items-center w-full px-4 py-2 text-[11px] uppercase tracking-widest text-[var(--text-primary)] font-bold transition-colors group"
                              >
                                <span>Chapter 1: The Mind</span>
                                <span className={cn(
                                  "text-[11px] text-[var(--accent-primary)] transition-transform duration-300",
                                  expandedChapter1 ? "rotate-90" : "rotate-0"
                                )}>▶</span>
                              </button>

                              <AnimatePresence>
                                {expandedChapter1 && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="flex flex-col overflow-hidden"
                                  >
                                    {[
                                      { id: 'question1', label: 'Question 1', locked: false },
                                      { id: 'question2', label: 'Question 2', locked: false },
                                      { id: 'question3', label: 'Question 3', locked: false },
                                      { id: 'question4', label: 'Question 4', locked: false },
                                      { id: 'question5', label: 'Question 5', locked: false },
                                    ].map((q) => (
                                      <button
                                        key={q.id}
                                        disabled={q.locked}
                                        onClick={() => {
                                          setActiveQuestionId(q.id);
                                          if (window.innerWidth < 1024) setIsSidebarOpen(false);
                                        }}
                                        className={cn(
                                          "flex items-center gap-3 pl-6 pr-4 py-2 text-[13px] uppercase tracking-widest transition-all text-left relative",
                                          activeQuestionId === q.id
                                            ? "text-[var(--accent-primary)] font-bold"
                                            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
                                          q.locked && "opacity-40 cursor-not-allowed"
                                        )}
                                      >
                                        {activeQuestionId === q.id && (
                                          <div className="absolute left-2 w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] shadow-[0_0_8px_var(--accent-primary)]" />
                                        )}
                                        <span className="flex-1">{q.label}</span>
                                        {q.locked && <Lock size={10} className="ml-2 text-[var(--accent-secondary)]" />}
                                      </button>
                                    ))}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            }

            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.locked) {
                    alert('Coming soon!');
                    return;
                  }
                  setActiveTab(item.id);
                  if (window.innerWidth < 1024) setIsSidebarOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-4 px-6 py-2.5 transition-all duration-400 relative group rounded-2xl mb-1",
                  isActive
                    ? "bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-accent"
                    className="absolute inset-0 bg-[var(--accent-primary)] opacity-10 rounded-2xl pointer-events-none"
                  />
                )}
                <Icon
                  size={16}
                  strokeWidth={isActive ? 2.5 : 1.5}
                  className={cn(
                    "transition-all duration-400 relative z-10",
                    isActive ? "text-[var(--accent-primary)] scale-110" : "text-[var(--text-muted)] group-hover:text-[var(--text-primary)]"
                  )}
                />
                <span className={cn(
                  "text-[13px] uppercase transition-all duration-400 relative z-10 font-['Outfit'] whitespace-nowrap",
                  item.label.length > 12 ? "tracking-[0.05em]" : "tracking-[0.3em]",
                  isActive ? "text-[var(--text-primary)] font-bold" : "text-[var(--text-muted)] group-hover:text-[var(--text-primary)] font-semibold"
                )}>
                  {item.label}
                </span>
                {/* Active glow dot */}
                {isActive && (
                  <motion.div
                    layoutId="nav-active-dot"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] shadow-[0_0_15px_var(--accent-primary)] relative z-10"
                  />
                )}
              </button>
            );
          })}

        </nav>

        {/* LOGOUT BUTTON */}
        <div className="mt-12 border-t border-[var(--border-default)] pt-4">
          {currentUser?.email && (
            <div className="px-4 mb-2 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-secondary)] animate-pulse" />
              <span className="text-[12px] text-[var(--text-muted)] font-medium tracking-wider lowercase opacity-70 truncate">
                {currentUser.email}
              </span>
            </div>
          )}
          <button
            onClick={async () => {
              if (window.confirm('Are you sure you want to sign out?')) {
                await signOut();
              }
            }}
            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-[var(--bg-surface)] rounded-xl transition-colors text-left group"
          >
            <LogOut size={15} className="text-[var(--text-secondary)] group-hover:text-rose-400 transition-colors" />
            <span className="text-[13px] uppercase tracking-[0.4em] text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] font-bold transition-colors font-sans">
              Log Out
            </span>
          </button>

          <div className="mt-4 pt-4 border-t border-[var(--border-default)]">
            <p className="text-[12px] font-serif italic text-[var(--text-muted)] tracking-widest leading-relaxed flex flex-col gap-2">
              <span className="opacity-100 font-medium">Journey Shared by</span>
              <span className="text-[var(--text-primary)] font-bold font-sans tracking-[0.1em] uppercase">Soulful Intelligence Studio</span>
            </p>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className={cn(
        "relative z-10 min-h-screen transition-all duration-700 overflow-hidden",
        "lg:pl-72"
      )}>
        {/* Time of Day Ambient Tint */}
        <div
          className="absolute inset-x-0 top-0 h-[600px] pointer-events-none transition-all duration-1000 z-0"
          style={{ background: timeOfDayGradient }}
        />
        <AnimatePresence>
          {/* Back Action - Integrated into the page flow */}
          {activeTab !== 'home' && (
            <div className="w-full px-6 md:px-12 pt-4 -mb-4 relative z-50 flex justify-start">
              <motion.button
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -14 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => { setActiveTab('home'); setActivePractice(null); setIsSidebarOpen(false); }}
                className="flex items-center gap-3 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all group pb-4"
              >
                <div className="p-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] backdrop-blur-3xl group-hover:scale-110 group-hover:bg-[var(--bg-surface-hover)] group-hover:border-[var(--border-default)] transition-all duration-300 shadow-sm">
                  <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-0.5 duration-300" />
                </div>
                <span className="text-[13px] font-bold uppercase tracking-[0.45em] opacity-60 group-hover:opacity-100 transition-opacity duration-300">Return</span>
              </motion.button>
            </div>
          )}
        </AnimatePresence>

        {/* SPATIAL AUDIO TOGGLE */}
        <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[60] flex items-center gap-2 sm:gap-3 scale-[0.8] sm:scale-90 origin-top-right">
          {isUnlockedUser(currentUser?.email) && (
            <button
              onClick={() => setIsReportOpen(true)}
              className="p-3 rounded-full backdrop-blur-3xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-white hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5 transition-all flex items-center justify-center group shadow-xl"
              title="Engagement Report"
            >
              <Mail className="w-4 h-4 transition-transform group-hover:scale-110 group-hover:text-[#D4AF37]" />
            </button>
          )}
          <a
            href="https://www.youtube.com/@SoulfulIntelligenceStudio"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-3xl border border-[#FF0000]/30 bg-[#FF0000]/5 text-[#FF0000] hover:bg-[#FF0000]/10 transition-all group shadow-[0_0_15px_rgba(255,0,0,0.1)] hover:shadow-[0_0_20px_rgba(255,0,0,0.2)]"
            title="YouTube Channel"
          >
            <Youtube size={16} className="fill-current" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold hidden sm:inline-block">Studio</span>
          </a>
          <ThemeToggle />
          <button
            onClick={toggleAudio}
            className={cn(
              "p-3 rounded-full backdrop-blur-3xl border transition-all flex items-center justify-center group overflow-hidden shadow-2xl",
              isAudioEnabled
                ? "bg-[var(--accent-primary)]/10 border-[var(--accent-primary)]/30 text-[var(--accent-primary)] shadow-[0_0_20px_var(--glow-primary)]"
                : "bg-[var(--bg-surface)] border-[var(--border-default)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            )}
          >
            {isAudioEnabled && (
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 bg-[#5EC4B0]/20 blur-xl"
              />
            )}
            <Headphones className={cn("w-4 h-4 relative z-10 transition-transform", isAudioEnabled ? "animate-pulse" : "group-hover:scale-110")} />
          </button>
        </div>

        <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-8">
          <AnimatePresence mode="wait">
            {activeTab === 'home' && (
              <>
                <div className="lg:hidden">
                  <MobileDashboard
                    user={user}
                    onOpenSidebar={() => setIsSidebarOpen(true)}
                    rotateX={rotateX}
                    rotateY={rotateY}
                    progress={progress}
                    weeklyAssignment={weeklyAssignment}
                    onNavigate={onNavigate}
                  />
                </div>
                <div className="hidden lg:block">
                  <BreadthDesktop
                    user={user}
                    setActiveTab={setActiveTab}
                    rotateX={rotateX}
                    rotateY={rotateY}
                    progress={progress}
                    weeklyAssignment={weeklyAssignment}
                    onNavigate={onNavigate}
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
                <SituationalPractices
                  onBack={() => setActiveTab('home')}
                  isAdmin={isAdmin}
                  activeQuestionId={activeQuestionId}
                  onQuestionSelect={setActiveQuestionId}
                />
              </motion.div>
            )}

            {activeTab === 'intelligence' && (
              <motion.div key="intelligence" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }}>
                <CoursesHub onCourseSelect={(id) => { if (id) setActiveTab(id); }} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Full-frame tabs (no padding/max-width wrapper) ── */}
        <AnimatePresence mode="wait">
          {activeTab === 'wisdom_untethered' && (
            <motion.div
              key="wisdom_untethered"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 min-h-0 h-[calc(100vh-5rem)] overflow-hidden"
            >
              {hasWisdomAccess(currentUser?.email) ? (
                <WisdomUntetheredCourse
                  activeQuestionId={activeQuestionId}
                  viewMode={viewMode}
                  setViewMode={setViewMode}
                  onOpenJournal={() => setActiveTab('chapters')}
                  onNavigateToPractice={() => setActiveTab('situations')}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-12 space-y-8 bg-[var(--bg-base)]">
                  <div className="relative group">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute inset-[-20px] bg-[var(--accent-primary)]/10 blur-[40px] rounded-full"
                    />
                    <div className="w-24 h-24 rounded-[32px] border border-[var(--border-default)] bg-[var(--bg-surface)] flex items-center justify-center relative z-10 shadow-2xl">
                      <Lock className="w-10 h-10 text-[var(--accent-primary)] opacity-60" />
                    </div>
                  </div>
                  <div className="space-y-4 max-w-sm">
                    <h2 className="text-4xl font-serif font-light text-[var(--text-primary)] tracking-tight">Access Restricted</h2>
                    <p className="text-[15px] font-serif italic text-[var(--text-secondary)] leading-relaxed opacity-80">
                      This sacred passage is currently undergoing final refinements for a select group of travelers.
                      Your patience is a form of presence.
                    </p>
                  </div>
                  <AnchorButton variant="secondary" onClick={() => setActiveTab('home')} className="mt-4">
                    Return to Sanctuary
                  </AnchorButton>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="max-w-7xl mx-auto p-6 md:p-12 space-y-12">
          <AnimatePresence mode="wait">
            {activeTab === 'chapters' && (
              <motion.div key="chapters" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <Journal />
              </motion.div>
            )}

            {activeTab === 'stats' && (
              <motion.div key="stats" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }}>
                <StatsDashboard
                  onNavigate={onNavigate}
                  accountCreatedAt={currentUser?.metadata?.creationTime ?? null}
                />
              </motion.div>
            )}

            {activeTab === 'profile' && user && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-12 max-w-7xl w-full mx-auto"
              >
                {/* Unified Header Card */}
                <header className="relative p-12 rounded-[40px] border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-primary)]/5 to-transparent pointer-events-none" />

                  <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                      <div className="relative w-24 h-24 flex-shrink-0">
                        {currentUser?.photoURL ? (
                          <img
                            src={currentUser.photoURL}
                            alt="Profile"
                            className="w-full h-full rounded-full border-2 border-[var(--accent-primary)]/20 shadow-xl object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.parentElement?.querySelector('.fallback')?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={cn(
                          "fallback w-full h-full rounded-full bg-gradient-to-br from-[var(--accent-primary)]/20 to-[var(--accent-secondary)]/20 flex items-center justify-center border-2 border-[var(--accent-primary)]/30",
                          currentUser?.photoURL ? "hidden absolute inset-0" : ""
                        )}>
                          <span className="text-3xl font-serif font-light text-[var(--accent-primary)]">
                            {user.displayName?.charAt(0).toUpperCase() || 'T'}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <p className="text-[12px] font-bold uppercase tracking-[0.5em] text-[var(--accent-primary)]">Level {user.level} · {points} Points</p>
                          <InfoTooltip 
                            title="Points & Level" 
                            description="Points (XP) are earned by engaging with the course, practices, and reflections. Accumulating points increases your level."
                            howCalculated="Every action adds value to your journey."
                          />
                        </div>
                        <h2 className="text-5xl font-serif font-light text-[var(--text-primary)] tracking-tight">{user.displayName}</h2>
                        <p className="text-[12px] text-[var(--text-muted)] tracking-widest font-medium uppercase">
                          Exploring since {user.joinedAt} · {user.nowMoments} reflections
                        </p>
                      </div>
                    </div>

                    <AnchorButton variant="ghost" onClick={signOut} className="!w-auto !px-10 text-[var(--text-muted)] hover:text-rose-400 transition-colors">
                      <LogOut className="w-4 h-4 mr-2" /> Sign Out
                    </AnchorButton>
                  </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Reflections Count */}
                  <div className="p-8 rounded-[32px] border border-[var(--border-default)] bg-[var(--bg-surface)] flex flex-col justify-between h-48 group hover:border-[var(--accent-secondary)]/30 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-[var(--accent-secondary)]/10 border border-[var(--accent-secondary)]/10 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-[var(--accent-secondary)]" />
                    </div>
                    <div>
                      <div className="text-4xl font-serif font-light text-[var(--text-primary)] mb-2">{user.nowMoments}</div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--text-secondary)]">Reflections</span>
                        <InfoTooltip
                          title="Reflections"
                          description="The total number of times you have journalled, completed a practice, or recorded a thought in this app."
                          howCalculated="Counts every journal entry, completed situational practice, and daily practice session."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Streak Stats */}
                  <div className="p-8 rounded-[32px] border border-[var(--border-default)] bg-[var(--bg-surface)] flex flex-col justify-between h-48 group hover:border-orange-400/30 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-orange-400/10 border border-orange-400/10 flex items-center justify-center">
                      <Flame className="w-5 h-5 text-orange-400/70" />
                    </div>
                    <div>
                      <div className="text-4xl font-serif font-light text-[var(--text-primary)] mb-2">{user.streak} Days</div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--text-secondary)]">Practice Streak</span>
                        <InfoTooltip
                          title="Practice Streak"
                          description="The number of days in a row that you have completed at least one practice or journal entry."
                          howCalculated="A streak continues as long as you complete something each day. Missing a day resets it to zero."
                        />
                      </div>
                    </div>
                  </div>

                  {/* XP Progress */}
                  <div className="p-8 rounded-[32px] border border-[var(--border-default)] bg-[var(--bg-surface)] flex flex-col justify-between h-48 md:col-span-2 lg:col-span-1 border-dashed">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--text-secondary)]">Your Journey</span>
                        <InfoTooltip
                          title="Your Journey (XP)"
                          description="Experience Points you've earned by practising, journalling, and completing courses. Each activity adds to your total."
                          howCalculated="Journal entries earn 10 XP. Completed practices earn 15 XP. Videos earn 20 XP. A full day earns bonus XP."
                        />
                      </div>
                      <span className="text-[11px] font-bold text-[var(--accent-primary)]">{stats.xp % 1000} / 1000 XP</span>
                    </div>
                    <div className="space-y-4">
                      <div className="h-1.5 w-full bg-[var(--border-subtle)] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(stats.xp % 1000) / 10}%` }}
                          className="h-full bg-[var(--accent-primary)] shadow-[0_0_10px_var(--glow-primary)]"
                        />
                      </div>
                      <p className="text-[11px] text-[var(--text-secondary)] italic">Keep going — each practice deepens your presence.</p>
                    </div>
                  </div>
                </div>

                {/* Ethereal Medals Rack */}
                <div className="p-10 rounded-[40px] border border-[var(--border-default)] bg-[var(--bg-surface)] space-y-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-serif font-light text-[var(--text-secondary)]">Soul Medals</h3>
                    <span className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{unlocked.length} of 16 Unlocked</span>
                  </div>

                  <MedalGrid unlocked={unlocked} />
                </div>

                {/* Account Settings */}
                <div className="p-10 rounded-[40px] border border-[var(--border-default)] bg-[var(--bg-surface)] space-y-10">
                  <h3 className="text-xl font-serif font-light text-[var(--text-secondary)] border-b border-[var(--border-subtle)] pb-4">Preferences</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-primary)]">Interface Theme</span>
                        <ThemeToggle />
                      </div>
                      <p className="text-[11px] text-[var(--text-secondary)] tracking-wide">Adjust the visual sanctuary to your resonance.</p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-primary)]">Voice Guidance</span>
                        <span className="text-[11px] font-serif italic text-[var(--accent-secondary)]">Serene Echo (Default)</span>
                      </div>
                      <p className="text-[11px] text-[var(--text-muted)] tracking-wide">Choose the frequency of guidance during meditation.</p>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-[var(--border-subtle)]/50 flex flex-wrap gap-4">
                    <button
                      onClick={async () => {
                        if (!currentUser) return;
                        const q = query(collection(db, 'users', currentUser.uid, 'journal'));
                        const snap = await getDocs(q);
                        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `awakened-path-journal-${new Date().toISOString().split('T')[0]}.json`;
                        a.click();
                      }}
                      className="px-6 py-2 rounded-xl bg-[var(--bg-surface-hover)] border border-[var(--border-default)] text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"
                    >
                      Download Journal Export
                    </button>
                    <button
                      onClick={() => alert("Archive functionality coming soon. Your data is safely persisted in the cloud.")}
                      className="px-6 py-2 rounded-xl bg-transparent border border-rose-400/20 text-[11px] font-bold uppercase tracking-widest text-rose-400/60 hover:bg-rose-400/5 transition-all"
                    >
                      Archive Session History
                    </button>
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <EngagementReport isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} />
      <AchievementToast
        achievement={toastQueue[0] || null}
        onDismiss={dismissToast}
      />
      <WhatsAppButton />

    </div>
  );
}
