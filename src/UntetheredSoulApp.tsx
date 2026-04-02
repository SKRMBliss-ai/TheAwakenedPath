import { useState, useEffect, useMemo } from 'react';
import { Flame, Sparkles, Sun, Play, BookOpen, User, BarChart2, ArrowLeft, Clock, Menu, Heart, X, Lock, Headphones, LogOut, Mail, MessageCircle } from 'lucide-react';
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
import { GlassShape } from './components/ui/GlassShape';
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
import { DailyPresenceCheck } from './features/practices/DailyPresenceCheck';

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
  INSECURITY: '#C65F9D',
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

const MobileDashboard = ({ user, setActiveTab, onOpenSidebar, isAdmin, rotateX, rotateY, lastEntry }: any) => {
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
        {/* Decorative background glow — subtle, no box edge */}
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(198,95,157,0.08),transparent_60%)] pointer-events-none" />

        {/* Header — minimal, floating */}
        <header className="relative flex justify-between items-center z-10 mb-8 px-4">
          <button
            onClick={onOpenSidebar}
            className="w-12 h-12 rounded-full bg-[var(--bg-surface)] border border-[var(--border-default)] flex items-center justify-center active:scale-90 transition-all backdrop-blur-md"
          >
            <Menu className="w-5 h-5 text-[var(--text-muted)]" />
          </button>

          <div className="flex flex-col items-center">
            <AwakenedPathLogo variant="icon" size="sm" animated={false} className="mb-1 opacity-80" />
            <p className="text-[7px] font-serif italic text-[var(--accent-primary)] tracking-[0.3em] uppercase mb-0.5">{greeting},</p>
            <h1 className="text-[12px] font-serif font-bold text-[var(--text-primary)] uppercase tracking-widest">{user.displayName || 'Traveler'}</h1>
          </div>

          {/* Empty div for flex-between balance */}
          <div className="w-12 h-12 flex-shrink-0"></div>
        </header>


        {/* Hero Content Area — pure transparency */}
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
            {/* Minimal Metrics Row — no pill container needed if we want full float */}
            <div className="inline-flex items-center gap-6 px-6 py-2.5 rounded-full bg-[var(--bg-surface)]/50 border border-[var(--border-subtle)]/50 backdrop-blur-md shadow-lg">
              <div className="flex items-center gap-2">
                <Heart className="w-3 h-3 text-rose-300" />
                <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em]">Flow</span>
              </div>
              <div className="w-px h-3 bg-[var(--border-subtle)]/30" />
              <div className="flex items-center gap-2">
                <Flame className="w-3 h-3 text-orange-300" />
                <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em]">{user.streak} Days</span>
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
            "w-full group relative overflow-hidden rounded-[40px] bg-[var(--bg-surface)] text-[var(--text-primary)] p-8 flex items-center justify-between transition-all shadow-xl border border-[var(--border-default)]",
            isAdmin ? "hover:scale-[1.02] active:scale-98" : "opacity-50 cursor-not-allowed grayscale"
          )}
        >
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-[var(--accent-primary)]/10 flex items-center justify-center shadow-inner">
              {isAdmin ? <Flame className="w-8 h-8 text-[var(--accent-primary)]" /> : <Lock className="w-8 h-8 text-[var(--text-muted)]" />}
            </div>
            <div className="text-left">
              <h3 className="text-xl font-serif font-bold text-[var(--text-primary)]">Transform a Situation</h3>
              <p className="text-[11px] text-[var(--text-secondary)] font-bold uppercase tracking-widest mt-1">Shift from challenge to peace</p>
            </div>
          </div>

          <div className="w-12 h-12 rounded-full bg-[var(--accent-primary)] text-[var(--bg-primary)] flex items-center justify-center shadow-lg">
            {isAdmin ? <Play className="w-5 h-5 fill-current ml-1" /> : <Lock className="w-5 h-5" />}
          </div>
        </button>
      </section>

      {/* Last Reflection One-Liner */}
      {lastEntry && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-6 py-6 border-b border-[var(--border-subtle)]/30 mb-4"
        >
          <div className="flex items-center gap-5">
            <div className="w-2.5 h-2.5 rounded-full"
              style={{
                backgroundColor: getDominantEmotionColor(lastEntry.emotions) || 'var(--accent-primary)',
                boxShadow: `0 0 12px ${getDominantEmotionColor(lastEntry.emotions) || 'var(--accent-primary)'}80`
              }}
            />
            <div className="flex-1">
              <p className="text-sm font-serif italic text-[var(--text-secondary)] line-clamp-1 opacity-90">
                "{lastEntry.thoughts}"
              </p>
              <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-widest mt-1 font-bold">
                Latest Reflection · {lastEntry.emotions}
              </p>
            </div>
            <button onClick={() => setActiveTab('chapters')} className="text-[10px] uppercase tracking-[0.2em] text-[var(--accent-primary)] font-bold">
              View →
            </button>
          </div>
        </motion.div>
      )}

      {/* Daily Practice Checklist */}
      <section className="px-2">
        <DailyPresenceCheck userId={user?.uid} />
      </section>

      {/* Main Practices Grid */}
      <section className="space-y-6 pb-20">
        <h4 className="text-[12px] font-bold uppercase tracking-[0.4em] text-[var(--text-primary)] pl-4">Sacred Practices</h4>
        <div className="grid grid-cols-2 gap-4">
          {[
            { id: 'intelligence', label: 'Courses', sub: 'VIDEOS', icon: Sparkles, color: '#ABCEC9', variant: 'orb' },
            { id: 'chapters', label: 'Journal', sub: 'GUIDED', icon: BookOpen, color: '#C65F9D', variant: 'book' },
            { id: 'stats', label: 'Progress', sub: 'HISTORY', icon: BarChart2, color: '#9575CD', variant: 'chart' }
          ].map((item: any) => {
            const isLocked = !isAdmin && ['panic'].includes(item.id);
            return (
              <div key={item.id} className="relative group/card">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => !isLocked && setActiveTab(item.id)}
                  disabled={isLocked}
                  className={cn(
                    "w-full aspect-square relative overflow-hidden rounded-[32px] bg-[var(--bg-surface)] border border-[var(--border-default)] flex flex-col items-center justify-center gap-3 transition-all",
                    !isLocked ? "hover:scale-[1.02] hover:bg-[var(--bg-surface-hover)] shadow-md" : "opacity-35 cursor-not-allowed"
                  )}
                >
                  {/* Category-specific Ambient Gradient */}
                  {!isLocked && (
                    <div className="absolute inset-0 opacity-15 pointer-events-none"
                      style={{ background: `radial-gradient(circle at 30% 30%, ${item.color}35, transparent 70%)` }} />
                  )}

                  <div className="relative w-12 h-12 flex items-center justify-center">
                    <GlassShape icon={item.icon} color={item.color} variant={item.variant} className="w-full h-full" />
                  </div>
                  <div className="text-center px-2">
                    <p className="text-xs font-serif font-bold text-[var(--text-primary)]">{item.label}</p>
                    <p className="text-[7px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-0.5">{item.sub}</p>
                  </div>
                </motion.button>
              </div>
            );
          })}
        </div>
      </section>
    </motion.div>
  );
};

const BreadthDesktop = ({ user, setActiveTab, isAdmin, rotateX, rotateY, lastEntry }: any) => {
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
      {/* Desktop Optimized Header — Floating Greeting */}
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
        <div className="flex flex-col items-end opacity-40">
          <span className="text-[10px] font-serif italic text-[var(--text-muted)] tracking-[0.3em] uppercase">The Presence Study</span>
        </div>
      </header>

      {/* Hero Guided Area - Optimized height */}
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

          {/* Stats Glass Pill */}
          <div className="inline-flex items-center gap-10 px-10 py-4 rounded-full bg-[var(--bg-surface)]/40 border border-[var(--border-subtle)]/30 backdrop-blur-2xl shadow-2xl relative overflow-hidden group">
            {/* Inner Sheen */}
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

      {/* Main Action Call - Situational Practice */}
      <section className="relative">
        {/* Backlit Magenta Glow - Matching Soul Stats */}
        <motion.div
          animate={{
            scale: [1, 1.02, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-[-20px] rounded-[24px] blur-[50px] bg-[#D16BA5] pointer-events-none mix-blend-plus-lighter"
        />
        <button
          onClick={() => setActiveTab('situations')}
          className={cn(
            "w-full group relative overflow-hidden rounded-[24px] bg-[var(--bg-surface)] border border-[var(--border-default)] p-8 flex items-center justify-between transition-all shadow-2xl hover:bg-[var(--bg-surface-hover)] hover:scale-[1.01] active:scale-[0.99]"
          )}
        >
          <div className="flex items-center gap-10">
            <div className="w-16 h-16 rounded-[20px] bg-[var(--accent-primary)] flex items-center justify-center shadow-xl transition-transform duration-500">
              <Flame className="w-8 h-8 text-[var(--bg-primary)]" />
            </div>
            <div className="text-left">
              <h3 className="text-2xl font-serif font-bold text-[var(--text-primary)]">Transform a Situation</h3>
              <p className="text-[12px] text-[var(--text-secondary)] font-bold uppercase tracking-[0.2em] mt-1.5">Shift from challenge to peace</p>
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-primary)] shadow-lg transition-all duration-500">
            <Play className="w-5 h-5 fill-current ml-1 group-hover:rotate-90" />
          </div>
        </button>
      </section>

      {/* Last Reflection One-Liner */}
      {lastEntry && (
        <section className="px-4">
          <div className="flex items-center gap-6 py-8 border-b border-[var(--border-subtle)]/30 group/reflection">
            <div className="w-3 h-3 rounded-full transition-all duration-500 group-hover/reflection:scale-125"
              style={{
                backgroundColor: getDominantEmotionColor(lastEntry.emotions) || 'var(--accent-primary)',
                boxShadow: `0 0 20px ${getDominantEmotionColor(lastEntry.emotions) || 'var(--accent-primary)'}90`
              }}
            />
            <div className="flex-1">
              <p className="text-base font-serif italic text-[var(--text-secondary)] line-clamp-1 opacity-90 group-hover/reflection:opacity-100 transition-opacity">
                "{lastEntry.thoughts}"
              </p>
              <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mt-1.5 font-bold">
                Latest Reflection · {lastEntry.emotions}
              </p>
            </div>
            <button onClick={() => setActiveTab('chapters')} className="px-6 py-2 rounded-full border border-[var(--border-subtle)] text-[10px] uppercase tracking-[0.2em] text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:border-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/5 font-bold transition-all">
              Journal →
            </button>
          </div>
        </section>
      )}

      {/* Daily Practice Checklist */}
      <section className="px-4">
        <DailyPresenceCheck userId={user?.uid} />
      </section>

      {/* Practices Grid - Desktop Balanced */}
      <section className="space-y-8">
        <div className="flex items-center justify-between px-4">
          <h4 className="text-[13px] font-bold uppercase tracking-[0.4em] text-[var(--text-primary)]">Sacred Practices</h4>
          <div className="h-px flex-1 bg-[var(--border-subtle)]/70 mx-8" />
        </div>
        <div className="grid grid-cols-3 gap-6">
          {[
            { id: 'intelligence', label: 'Courses', sub: 'VIDEOS', icon: Sparkles, color: '#ABCEC9', delay: 0, variant: 'orb' },
            { id: 'chapters', label: 'Journal', sub: 'JOURNEY', icon: BookOpen, color: '#C65F9D', delay: 0.1, variant: 'book' },
            { id: 'stats', label: 'Progress', sub: 'STATS', icon: BarChart2, color: '#9575CD', delay: 0.2, variant: 'chart' }
          ].map((item: any) => {
            const isLocked = !isAdmin && ['panic'].includes(item.id);
            return (
              <div key={item.id} className="relative group/card">
                {/* Individual Glow Colors - Dark Mode Only */}
                {!isLocked && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{
                      opacity: [0.15, 0.3, 0.15],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: item.delay }}
                    className="absolute inset-[-10px] rounded-[24px] blur-[30px] pointer-events-none mix-blend-plus-lighter hidden dark:block"
                    style={{ backgroundColor: item.color }}
                  />
                )}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: item.delay }}
                  onClick={() => !isLocked && setActiveTab(item.id)}
                  disabled={isLocked}
                  className={cn(
                    "w-full h-full group relative overflow-hidden bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[24px] p-8 flex flex-col items-center justify-center gap-6 transition-all",
                    !isLocked ? "hover:border-[var(--border-glass)] hover:bg-[var(--bg-surface-hover)] shadow-lg hover:shadow-2xl" : "opacity-35 cursor-not-allowed grayscale"
                  )}
                >
                  {/* Category-specific Ambient Gradient */}
                  {!isLocked && (
                    <div className="absolute inset-0 opacity-20 pointer-events-none group-hover:opacity-30 transition-opacity duration-700"
                      style={{ background: `radial-gradient(circle at 30% 30%, ${item.color}25, transparent 75%)` }} />
                  )}

                  {!isLocked && <div className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 bg-[radial-gradient(circle_at_center,var(--item-color),transparent_70%)]" style={{ '--item-color': item.color + '15' } as any} />}

                  <div className="relative w-28 h-28 flex items-center justify-center">
                    <GlassShape icon={item.icon} color={item.color} variant={item.variant} className={cn("w-full h-full transition-transform duration-500", !isLocked && "group-hover:scale-110")} />
                  </div>

                  <div className="text-center relative z-10">
                    <div className="text-xl font-serif font-bold text-[var(--text-primary)] mb-1">{item.label}</div>
                    <div className="text-[8px] font-bold text-[var(--text-muted)] tracking-[0.3em] uppercase">
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
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('awakened-path-active-tab') || 'home');
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
  const [watchedParts, setWatchedParts] = useState<string[]>([]);

  const [activeQuestionId, setActiveQuestionId] = useState(() => localStorage.getItem('awakened-path-active-question') || 'question1');
  const [viewMode, setViewMode] = useState<'explanation' | 'video'>(() => {
    const saved = localStorage.getItem('awakened-path-view-mode');
    return (saved === 'explanation' || saved === 'video') ? saved : 'explanation';
  });
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
            { id: 'courses_group', icon: Sparkles, label: 'Courses', locked: false, isGroup: true, subItems: [
              { id: 'intelligence', label: 'The Power of Now' },
              { id: 'wisdom_untethered', label: 'Wisdom Untethered', locked: !hasWisdomAccess(currentUser?.email) },
            ]},
            { id: 'chapters', icon: BookOpen, label: 'Journal', locked: false },
            { id: 'situations', icon: Flame, label: 'Situations', fullLabel: 'Situational Practice', locked: false },
            { id: 'stats', icon: BarChart2, label: 'Progress', fullLabel: 'Your Progress', locked: false },
            { id: 'profile', icon: User, label: 'Profile', locked: false },
          ].map((item: any) => {
            if (item.isGroup) {
              const anySubActive = item.subItems.some((sub: any) => activeTab === sub.id);
              const Icon = item.icon;
              return (
                <div key={item.id} className="space-y-0.5 my-1">
                  <div className="flex items-center gap-3 px-6 py-1.5">
                    <Icon size={16} strokeWidth={anySubActive ? 2 : 1.2} className={cn("transition-colors", anySubActive ? "text-[var(--accent-primary)]" : "text-[var(--text-muted)]")} />
                    <span className="text-[9px] uppercase tracking-[0.4em] font-bold text-[var(--text-muted)] font-sans">
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
                              "w-full flex items-center gap-3 px-3 py-1.5 transition-all duration-400 relative group rounded-l-xl text-left",
                            )}
                            style={{
                              background: isActive ? 'var(--bg-surface-hover)' : 'none',
                            }}
                          >
                            {isActive && (
                              <motion.div
                                layoutId="sidebar-accent"
                                className="absolute inset-0 bg-gradient-to-r from-[var(--accent-primary)]/10 to-transparent pointer-events-none rounded-l-xl"
                              />
                            )}
                            <span className={cn(
                              "text-[9px] uppercase tracking-[0.25em] transition-colors duration-400 font-sans relative z-10 w-full",
                              isActive ? "text-[var(--text-primary)] font-bold" : "text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] font-medium"
                            )}>
                              {sub.label}
                              {sub.locked && <Lock size={8} className="inline-block ml-2 text-[var(--accent-secondary)]" />}
                            </span>
                            {isActive && (
                              <motion.div
                                layoutId="nav-active-dot"
                                className="absolute right-4 w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] shadow-[0_0_12px_var(--accent-primary)] z-10"
                              />
                            )}
                          </button>

                          {/* Render questions if Wisdom Untethered is active */}
                          {isActive && sub.id === 'wisdom_untethered' && (
                            <div className="flex flex-col mt-2 ml-1 border-l border-[var(--border-subtle)]/30 overflow-hidden">
                              <button
                                onClick={() => setExpandedChapter1(!expandedChapter1)}
                                className="flex justify-between items-center w-full px-4 py-2 text-[9px] uppercase tracking-widest text-[var(--text-primary)] font-bold transition-colors group"
                              >
                                <span>Chapter 1: The Mind</span>
                                <span className={cn(
                                  "text-[10px] text-[var(--accent-primary)] transition-transform duration-300",
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
                                      { id: 'question4', label: 'Question 4', locked: !isAdminEmail(currentUser?.email) },
                                    ].map((q) => (
                                      <button
                                        key={q.id}
                                        disabled={q.locked}
                                        onClick={() => {
                                          setActiveQuestionId(q.id);
                                          if (window.innerWidth < 1024) setIsSidebarOpen(false);
                                        }}
                                        className={cn(
                                          "flex items-center gap-2 pl-6 pr-4 py-1.5 text-[8px] uppercase tracking-widest transition-all text-left",
                                          activeQuestionId === q.id
                                            ? "text-[var(--accent-primary)] font-bold"
                                            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
                                          q.locked && "opacity-40 cursor-not-allowed"
                                        )}
                                      >
                                        <div className={cn(
                                          "w-1 h-1 rounded-full",
                                          activeQuestionId === q.id ? "bg-[var(--accent-primary)] shadow-[0_0_8px_var(--accent-primary)]" : "bg-transparent",
                                          q.locked && "bg-[var(--text-muted)]"
                                        )} />
                                        <span className="flex-1">{q.label}</span>
                                        {q.locked && <Lock size={8} className="ml-2 text-[var(--accent-secondary)]" />}
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
                  setIsSidebarOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-6 py-1.5 transition-all duration-400 relative group",
                )}
                style={{
                  background: isActive ? 'var(--bg-surface-hover)' : 'none',
                  borderRight: isActive ? '2px solid var(--accent-primary)' : '2px solid transparent',
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-accent"
                    className="absolute inset-0 bg-gradient-to-r from-[var(--accent-primary)]/5 to-transparent pointer-events-none"
                  />
                )}
                <Icon
                  size={16}
                  strokeWidth={isActive ? 2 : 1.2}
                  className={cn(
                    "transition-all duration-400 relative z-10",
                    isActive ? "text-[var(--accent-primary)]" : "text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]"
                  )}
                />
                <span className={cn(
                  "text-[10px] uppercase tracking-[0.35em] transition-colors duration-400 font-sans relative z-10",
                  isActive ? "text-[var(--text-primary)] font-bold" : "text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] font-medium"
                )}>
                  {item.label}
                </span>
                {/* Active glow dot */}
                {isActive && (
                  <motion.div
                    layoutId="nav-active-dot"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] shadow-[0_0_12px_var(--accent-primary)] relative z-10"
                  />
                )}
                {/* Locked Indicator */}
                {item.locked && (
                  <span className="ml-auto text-[7px] uppercase tracking-widest text-[var(--accent-secondary)] font-bold relative z-10">Soon</span>
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
              <span className="text-[10px] text-[var(--text-muted)] font-medium tracking-wider lowercase opacity-70 truncate">
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
            <span className="text-[9px] uppercase tracking-[0.4em] text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] font-bold transition-colors font-sans">
              Log Out
            </span>
          </button>

          <div className="mt-4 pt-4 border-t border-[var(--border-default)]">
            <p className="text-[9px] font-serif italic text-[var(--text-muted)] tracking-widest leading-relaxed flex items-center flex-wrap gap-1">
              Designed and thought by
              <a href="https://www.skrmblissai.in/twinsouls" target="_blank" rel="noopener noreferrer" className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] font-bold font-sans tracking-[0.2em] transition-colors group">
                www.skrmblissai.in/twinsouls
              </a>
            </p>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className={cn(
        "relative z-10 min-h-screen transition-all duration-700 pb-12 overflow-hidden",
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
            <div className="w-full px-6 md:px-12 pt-12 -mb-8 relative z-50 flex justify-start">
              <motion.button
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -14 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => { setActiveTab('home'); setActivePractice(null); setIsSidebarOpen(false); }}
                className="flex items-center gap-3 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all group"
              >
                <div className="p-2 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] backdrop-blur-3xl group-hover:scale-110 group-hover:bg-[var(--bg-surface-hover)] group-hover:border-[var(--border-default)] transition-all duration-300 shadow-sm">
                  <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5 duration-300" />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-[0.45em] opacity-60 group-hover:opacity-100 transition-opacity duration-300">Return</span>
              </motion.button>
            </div>
          )}
        </AnimatePresence>

        {/* SPATIAL AUDIO TOGGLE */}
        <div className="fixed top-6 right-4 sm:top-8 sm:right-8 z-[60] flex items-center gap-3 sm:gap-4 scale-[0.85] sm:scale-100 origin-top-right">
          {isUnlockedUser(currentUser?.email) && (
            <button
              onClick={() => setIsReportOpen(true)}
              className="p-4 rounded-full backdrop-blur-3xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-white hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5 transition-all flex items-center justify-center group shadow-xl"
              title="Engagement Report"
            >
              <Mail className="w-5 h-5 transition-transform group-hover:scale-110 group-hover:text-[#D4AF37]" />
            </button>
          )}
          <ThemeToggle />
          <button
            onClick={toggleAudio}
            className={cn(
              "p-4 rounded-full backdrop-blur-3xl border transition-all flex items-center justify-center group overflow-hidden shadow-2xl",
              isAudioEnabled
                ? "bg-[var(--accent-primary)]/10 border-[var(--accent-primary)]/30 text-[var(--accent-primary)] shadow-[0_0_20px_var(--glow-primary)]"
                : "bg-[var(--bg-surface)] border-[var(--border-default)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
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
        </div>

        <div className="max-w-7xl mx-auto p-6 md:p-12 space-y-12">
          <AnimatePresence mode="wait">
            {activeTab === 'home' && (
              <>
                <div className="lg:hidden">
                  <MobileDashboard
                    user={user}
                    setActiveTab={setActiveTab}
                    onOpenSidebar={() => setIsSidebarOpen(true)}
                    isAdmin={isAdmin}
                    rotateX={rotateX}
                    rotateY={rotateY}
                    lastEntry={lastEntry}
                  />
                </div>
                <div className="hidden lg:block">
                  <BreadthDesktop
                    user={user}
                    setActiveTab={setActiveTab}
                    isAdmin={isAdmin}
                    rotateX={rotateX}
                    rotateY={rotateY}
                    lastEntry={lastEntry}
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

            {activeTab === 'intelligence' && (
              <motion.div key="intelligence" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }}>
                <CoursesHub onCourseSelect={(id) => setActiveTab(id)} />
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
                <StatsDashboard />
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
                        <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-[var(--accent-primary)]">Level {user.level} · {points} Points</p>
                        <h2 className="text-5xl font-serif font-light text-[var(--text-primary)] tracking-tight">{user.displayName}</h2>
                        <p className="text-[11px] text-[var(--text-muted)] tracking-widest font-medium uppercase">
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
                  {/* Reflections Stats */}
                  <div className="p-8 rounded-[32px] border border-[var(--border-default)] bg-[var(--bg-surface)] flex flex-col justify-between h-48 group hover:border-[var(--accent-secondary)]/30 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-[var(--accent-secondary)]/10 border border-[var(--accent-secondary)]/10 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-[var(--accent-secondary)]" />
                    </div>
                    <div>
                      <div className="text-4xl font-serif font-light text-[var(--text-primary)] mb-1">{user.nowMoments}</div>
                      <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-[var(--text-muted)]">Now Moments</span>
                    </div>
                  </div>

                  {/* Streak Stats */}
                  <div className="p-8 rounded-[32px] border border-[var(--border-default)] bg-[var(--bg-surface)] flex flex-col justify-between h-48 group hover:border-orange-400/30 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-orange-400/10 border border-orange-400/10 flex items-center justify-center">
                      <Flame className="w-5 h-5 text-orange-400/70" />
                    </div>
                    <div>
                      <div className="text-4xl font-serif font-light text-[var(--text-primary)] mb-1">{user.streak} Days</div>
                      <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-[var(--text-muted)]">Current Streak</span>
                    </div>
                  </div>

                  {/* Consciousness Progress */}
                  <div className="p-8 rounded-[32px] border border-[var(--border-default)] bg-[var(--bg-surface)] flex flex-col justify-between h-48 md:col-span-2 lg:col-span-1 border-dashed">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[var(--text-muted)]">Evolution</span>
                      <span className="text-[10px] font-bold text-[var(--accent-primary)]">{stats.xp % 1000} / 1000 XP</span>
                    </div>
                    <div className="space-y-4">
                      <div className="h-1.5 w-full bg-[var(--border-subtle)] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(stats.xp % 1000) / 10}%` }}
                          className="h-full bg-[var(--accent-primary)] shadow-[0_0_10px_var(--glow-primary)]"
                        />
                      </div>
                      <p className="text-[9px] text-[var(--text-muted)] italic">Next layer: Consciousness Expansion</p>
                    </div>
                  </div>
                </div>

                {/* Ethereal Medals Rack */}
                <div className="p-10 rounded-[40px] border border-[var(--border-default)] bg-[var(--bg-surface)] space-y-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-serif font-light text-[var(--text-secondary)]">Soul Medals</h3>
                    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{unlocked.length} of 16 Unlocked</span>
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
                      <p className="text-[10px] text-[var(--text-secondary)] tracking-wide">Adjust the visual sanctuary to your resonance.</p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-primary)]">Voice Guidance</span>
                        <span className="text-[10px] font-serif italic text-[var(--accent-secondary)]">Serene Echo (Default)</span>
                      </div>
                      <p className="text-[10px] text-[var(--text-muted)] tracking-wide">Choose the frequency of guidance during meditation.</p>
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
                      className="px-6 py-2 rounded-xl bg-[var(--bg-surface-hover)] border border-[var(--border-default)] text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"
                    >
                      Download Journal Export
                    </button>
                    <button
                      onClick={() => alert("Archive functionality coming soon. Your data is safely persisted in the cloud.")}
                      className="px-6 py-2 rounded-xl bg-transparent border border-rose-400/20 text-[9px] font-bold uppercase tracking-widest text-rose-400/60 hover:bg-rose-400/5 transition-all"
                    >
                      Archive Session History
                    </button>
                  </div>
                </div>

                {/* Footer Credits */}
                <div className="w-full pt-4 pb-8 flex flex-col items-center justify-center text-center opacity-60 hover:opacity-100 transition-opacity">
                  <p className="text-[9px] font-serif tracking-[0.2em] text-[var(--text-muted)] uppercase mb-2 text-center">
                    Designed and thought by
                  </p>
                  <a 
                    href="https://www.skrmblissai.in/twinsouls" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-[10px] font-bold tracking-widest text-[var(--accent-secondary)] hover:text-[var(--accent-primary)] transition-colors"
                  >
                    www.skrmblissai.in/twinsouls
                  </a>
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

      {/* Floating WhatsApp Widget */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3">
        <a href="https://wa.me/+918217581238?text=I+would+like+to+request+a+feature+or+report+a+technical+issue." target="_blank" rel="noopener noreferrer"
          className="group flex items-center justify-center w-14 h-14 bg-green-500 text-white rounded-full shadow-lg hover:shadow-[0_4px_20px_rgba(34,197,94,0.4)] transition-all duration-300 hover:scale-110">
          <span className="absolute right-full mr-4 text-[11px] font-bold text-white bg-black/80 backdrop-blur-md px-4 py-2 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl border border-white/10">
            Request a feature / Report technical issue
          </span>
          <MessageCircle className="w-6 h-6" />
        </a>
      </div>
    </div>
  );
}
