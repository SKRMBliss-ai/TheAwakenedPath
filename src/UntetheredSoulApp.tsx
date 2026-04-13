import { useState, useEffect, useMemo } from 'react';
import { Flame, Sparkles, Sun, BookOpen, User, BarChart2, ArrowLeft, Clock, Menu, Heart, X, Lock, Headphones, LogOut, Mail, Youtube, Medal } from 'lucide-react';
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
import { isAdminEmail, isUnlockedUser } from './config/admin';
import { TodayPath } from './features/practices/TodayPath';
import { useCourseTracking } from './hooks/useCourseTracking';
import { useWeeklyAssignment } from './hooks/useWeeklyAssignment';
import { InfoTooltip } from './components/ui/InfoTooltip';
import { WhatsAppButton } from './components/ui/WhatsAppButton';
import { VoiceGuidance } from './components/ui/VoiceGuidance';
import { VoiceService } from './services/voiceService';
import { usePersistedState } from './hooks/usePersistedState';
import { useRazorpay } from './hooks/useRazorpay';
import { MusicHub } from './features/music/MusicHub';

const DashboardActions = ({ user, isAccessValid, progress, weeklyAssignment, onNavigate, onViewProgress }: any) => {
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
        isAccessValid={isAccessValid}
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

const MobileDashboard = ({ user, isAccessValid, onOpenSidebar, rotateX, rotateY, progress, weeklyAssignment, onNavigate }: any) => {
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

          <div className="text-center space-y-4 px-6 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-px bg-gradient-to-r from-transparent via-[var(--accent-primary)] to-transparent opacity-20" />
            <h3 className="text-2xl font-serif font-medium text-[var(--text-primary)] tracking-wide">
              Presence <span className="opacity-60 italic mx-1 font-light text-[0.8em]">Over</span> Progress
            </h3>
            <p className="text-[14px] font-serif italic text-[var(--text-primary)] leading-relaxed max-w-[280px] mx-auto">
              "Yesterday is history, tomorrow is a mystery, today is a gift."
            </p>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-px bg-gradient-to-r from-transparent via-[var(--accent-primary)] to-transparent opacity-20" />
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
          isAccessValid={isAccessValid}
          progress={progress}
          weeklyAssignment={weeklyAssignment}
          onNavigate={onNavigate}
          onViewProgress={() => onNavigate('stats')}
        />
      </div>
    </motion.div>
  );
};

const BreadthDesktop = ({ user, isAccessValid, rotateX, rotateY, progress, weeklyAssignment, onNavigate }: any) => {
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
        <div className="flex flex-col items-end">
          <span className="text-[12px] font-serif italic tracking-[0.3em] uppercase text-[var(--accent-primary)] font-bold">Journey to Inner Freedom</span>
          <span className="text-[9px] font-sans uppercase tracking-[0.2em] text-[var(--text-muted)] mt-1 opacity-70">Presence Repository</span>
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

          <div className="py-12 text-center space-y-6 max-w-3xl mx-auto relative px-4">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-px bg-gradient-to-r from-transparent via-[var(--accent-primary)] to-transparent opacity-30" />
            <h3 className="text-4xl sm:text-5xl font-serif font-medium text-[var(--text-primary)] tracking-wide leading-tight">
              Presence <span className="opacity-60 italic mx-1 font-light text-[0.8em]">Over</span> Progress
            </h3>
            <p className="text-[18px] sm:text-[20px] font-serif italic text-[var(--text-primary)] leading-relaxed max-w-xl mx-auto">
              "Yesterday is history, tomorrow is a mystery, today is a gift. That's why it's called the present."
            </p>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-px bg-gradient-to-r from-transparent via-[var(--accent-primary)] to-transparent opacity-30" />
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
          isAccessValid={isAccessValid}
          progress={progress}
          weeklyAssignment={weeklyAssignment}
          onNavigate={onNavigate}
          onViewProgress={() => onNavigate('stats')}
        />
      </div>
    </motion.div>
  );
};

// --- Sacred Welcome Modal ---
const SacredWelcomeModal = ({ isOpen, onClose, planName, userEmail }: any) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-[#FDFAF4] rounded-[32px] overflow-hidden shadow-2xl border border-[#E6C57D]"
          >
            {/* Top gold bar */}
            <div className="h-1.5 bg-[#B8973A] w-full" />

            <div className="p-8 md:p-12 text-center space-y-6">
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#B8973A]">Access Granted</p>
                <h2 className="text-3xl font-serif italic text-[#1C1814] leading-tight">Welcome to the<br />Deepest Journey.</h2>
              </div>

              <div className="w-12 h-px bg-[#B8973A] mx-auto opacity-30" />

              <div className="space-y-4 text-[#3A342C] font-serif leading-relaxed">
                <p className="text-sm">Your gateway for <b>{planName}</b> was successful.</p>
                <div className="text-[13px] space-y-3 opacity-90">
                  <p>Step beyond the noise. You now possess full access to the intelligence course, the practice room, and interactive journaling.</p>
                  <p>As a premium member, remember that you also hold the key to <b>2 complimentary personal consultations</b>. Email us whenever you are ready.</p>
                </div>
              </div>

              <div className="pt-4">
                <p className="text-[10px] uppercase tracking-widest text-[#B8973A] font-bold mb-4">A confirmation email has been sent to</p>
                <div className="px-4 py-2 rounded-full bg-[#B8973A]/5 border border-[#B8973A]/20 inline-block">
                  <span className="text-xs font-medium text-[#1C1814]">{userEmail}</span>
                </div>
              </div>

              <AnchorButton
                variant="solid"
                onClick={onClose}
                className="w-full bg-[#1C1814] text-[#E6C57D] hover:bg-[#2C2824] uppercase tracking-widest font-bold mt-4"
              >
                Begin Your Journey
              </AnchorButton>

              <p className="text-[10px] italic text-[#B0A090]">Peace is the way.</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// --- Premium Paywall Component ---
const PremiumPaywall = ({ user, subscribe, checkOut, isProcessing, activateTrial, hasUsedTrial, onSuccess }: any) => {
  const [isTrialLoading, setIsTrialLoading] = useState(false);
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const pricingConfig = useMemo(() => {
    if (timezone === 'Asia/Calcutta' || timezone === 'Asia/Kolkata') {
      return { symbol: '₹', monthly: '799', annual: '7,999', lifetime: '14,999', currency: 'INR', strike: '9,588' };
    }
    if (timezone === 'Europe/London') {
      return { symbol: '£', monthly: '8.99', annual: '89.99', lifetime: '169.99', currency: 'GBP', strike: '107.88' };
    }
    if (timezone.startsWith('Europe/')) {
      return { symbol: '€', monthly: '9.99', annual: '99.99', lifetime: '189.99', currency: 'EUR', strike: '119.88' };
    }
    if (timezone.startsWith('Australia/')) {
      return { symbol: 'A$', monthly: '14.99', annual: '149.99', lifetime: '299.99', currency: 'AUD', strike: '179.88' };
    }
    if (timezone.startsWith('America/Toronto') || timezone.startsWith('America/Vancouver') || timezone.startsWith('Canada/')) {
      return { symbol: 'C$', monthly: '13.99', annual: '139.99', lifetime: '259.99', currency: 'CAD', strike: '167.88' };
    }
    return { symbol: '$', monthly: '9.99', annual: '99.99', lifetime: '199.99', currency: 'USD', strike: '119.88' };
  }, [timezone]);

  const currency = pricingConfig.currency;
  const prices = {
    monthly: `${pricingConfig.symbol}${pricingConfig.monthly}`,
    annuallyStrikethrough: `${pricingConfig.symbol}${pricingConfig.strike}`,
    annually: `${pricingConfig.symbol}${pricingConfig.annual}`,
    lifetime: `${pricingConfig.symbol}${pricingConfig.lifetime}`,
  };

  const features = [
    { name: "Deep Wisdom Courses", basic: "First 2 Lessons", premium: "All Chapters & Content", icon: BookOpen },
    { name: "Daily Presence Practices", basic: "Trial Portal Only", premium: "Entire Practice Library", icon: Heart },
    { name: "Interactive Insight Journal", basic: "Locked", premium: "Full Access", icon: Sparkles },
    { name: "Personal Consultations", basic: "-", premium: "2 Free Sessions", icon: User },
    { name: "Progress Tracking", basic: "Basic", premium: "In-Depth Analytics", icon: BarChart2 },
    { name: "Weekly Assignments", basic: "Delayed", premium: "Instant Access", icon: Clock },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] h-full text-center p-4 md:p-8 bg-[var(--bg-base)]">
      <div className="max-w-6xl w-full flex flex-col items-center space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-2xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h2 className="text-4xl md:text-6xl font-serif font-light text-[var(--text-primary)] tracking-tight">Expand Your Journey</h2>
            <p className="text-[15px] md:text-[17px] font-serif italic text-[var(--text-secondary)] leading-relaxed opacity-80">
              Step beyond the gateway to unlock full access to The Awakened Path universe.
            </p>
          </motion.div>
        </div>

        {/* Comparison Table */}
        <div className="w-full max-w-4xl space-y-8 px-4">
          <div className="overflow-x-auto rounded-[24px] border border-[var(--border-subtle)] bg-[var(--bg-surface)]/30 backdrop-blur-sm">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/50">
                  <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Feature</th>
                  <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Traveler (Free)</th>
                  <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-[var(--accent-primary)]">Seeker (Premium)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]/30">
                {features.map((f, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <f.icon size={14} className="text-[var(--accent-primary)] opacity-60" />
                        <span className="text-[13px] font-medium text-[var(--text-primary)]">{f.name}</span>
                      </div>
                    </td>
                    <td className="p-5 text-[12px] text-[var(--text-muted)]">{f.basic}</td>
                    <td className="p-5 text-[12px] text-[var(--text-primary)] font-bold">{f.premium}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Sacred Promise */}
          <div className="flex flex-col items-center gap-6 py-10 px-8 rounded-[40px] bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 text-center shadow-[0_0_50px_rgba(94,196,176,0.05)]">
            <div className="flex items-center justify-center gap-4 text-[var(--accent-primary)]">
              <Sparkles size={20} className="filter drop-shadow-[0_0_8px_var(--glow-primary)]" />
              <h5 className="text-[14px] font-bold uppercase tracking-[0.4em] text-[var(--accent-primary)] drop-shadow-sm">Our Sacred Promise</h5>
            </div>
            <p className="text-[15px] text-[var(--text-primary)] font-serif italic leading-relaxed text-center max-w-xl">
              "If these teachings do not resonate with your spirit, we offer a <span className="text-[var(--accent-primary)] font-bold not-italic underline underline-offset-4 decoration-1">Full 100% Refund</span> within 15 days."
            </p>
            <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-widest font-bold opacity-60">Your journey is ours to protect</p>
          </div>
        </div>

        {/* Choose Your Commitment */}
        <div className="text-center space-y-4">
          <h3 className="text-2xl font-serif font-light text-[var(--text-primary)]">Choose Your Commmitment</h3>
          <p className="text-sm text-[var(--text-secondary)] italic font-serif opacity-70">The path that resonates with your current depth.</p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full items-stretch">
          {/* 1. Trial Option Card (First Now) */}
          <div className={cn(
            "p-6 rounded-[32px] border transition-all shadow-xl flex flex-col justify-between items-center group relative overflow-hidden",
            hasUsedTrial
              ? "border-[var(--border-subtle)] bg-[var(--bg-surface)]/20 opacity-60 grayscale-[0.5]"
              : "border-dashed border-[var(--accent-primary)] bg-[var(--accent-primary)]/5"
          )}>
            <div className="absolute top-0 right-0 p-3 opacity-20 transform rotate-12">
              <Flame size={48} className={hasUsedTrial ? "text-[var(--text-muted)]" : "text-[var(--accent-primary)]"} />
            </div>
            <div className="text-center relative z-10">
              <p className={cn("text-[10px] font-bold uppercase tracking-[0.3em] mb-1", hasUsedTrial ? "text-[var(--text-muted)]" : "text-[var(--accent-primary)]")}>Taste Awareness</p>
              <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-widest mb-3 opacity-70">Experience full potential</p>
              <h4 className="text-[20px] font-bold text-[var(--text-primary)] mb-1">Begin Trial</h4>
              <p className="text-[11px] text-[var(--text-secondary)] font-serif italic mb-6">
                {hasUsedTrial ? "Trial already used" : "Full Access • No Card Needed"}
              </p>
            </div>
            <div className="w-full space-y-4 relative z-10">
              <p className={cn("text-[28px] font-bold", hasUsedTrial ? "text-[var(--text-muted)]" : "text-[var(--accent-primary)]")}>Free</p>
              <AnchorButton
                variant={hasUsedTrial ? "ghost" : "solid"}
                onClick={async () => {
                  if (hasUsedTrial) return;
                  setIsTrialLoading(true);
                  try {
                    await activateTrial();
                    localStorage.setItem('show-welcome-modal', '3-Day Trial');
                    onSuccess?.();
                  } catch (e) {
                    console.error(e);
                  } finally {
                    setIsTrialLoading(false);
                  }
                }}
                disabled={isTrialLoading || isProcessing || hasUsedTrial}
                className={cn(
                  "w-full font-bold uppercase tracking-widest",
                  !hasUsedTrial && "bg-[var(--accent-primary)] text-black"
                )}
              >
                {isTrialLoading ? 'Initiating...' : (hasUsedTrial ? 'Trial Used' : 'Start 3-Day Trial')}
              </AnchorButton>
            </div>
          </div>

          {/* 2. Monthly */}
          <div className="p-6 rounded-[32px] border border-[var(--border-default)] bg-[var(--bg-surface)] hover:border-[var(--accent-primary)]/40 transition-all shadow-lg flex flex-col justify-between">
            <div className="text-left">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--text-muted)] mb-2">Step by Step</p>
              <h4 className="text-[20px] font-bold text-[var(--text-primary)]">Monthly Flow</h4>
              <p className="text-[11px] text-[var(--text-secondary)] font-serif italic mb-6">Recurring Journey</p>
            </div>
            <div className="w-full space-y-4">
              <div className="flex items-baseline gap-1">
                <span className="text-[28px] font-bold text-[var(--text-primary)]">{prices.monthly}</span>
                <span className="text-xs text-[var(--text-muted)]">/ month</span>
              </div>
              <AnchorButton
                variant="ghost"
                onClick={() => {
                  if (user?.uid) {
                    subscribe(user.uid, user.email || '', user.displayName || 'Traveler', 'premium_monthly', currency, () => {
                      localStorage.setItem('show-welcome-modal', 'Monthly Flow');
                      onSuccess?.();
                    });
                  }
                }}
                disabled={isProcessing}
                className="w-full"
              >
                {isProcessing ? 'Opening Portal...' : 'Unlock Monthly'}
              </AnchorButton>
            </div>
          </div>

          {/* 3. Yearly */}
          <div className="relative p-6 rounded-[32px] border-2 border-[var(--accent-primary)] bg-[var(--bg-surface)] shadow-[0_0_40px_rgba(94,196,176,0.15)] flex flex-col justify-between transform lg:scale-105 z-10">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-[var(--accent-primary)] rounded-full text-[10px] font-bold uppercase tracking-widest text-black whitespace-nowrap shadow-xl">
              Most Devoted Path
            </div>
            <div className="text-left mt-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--accent-primary)] mb-2">Annual Immersion</p>
              <h4 className="text-[20px] font-bold text-[var(--text-primary)]">Sacred Commitment</h4>
              <p className="text-[11px] text-[var(--text-secondary)] font-serif italic mb-6">2 Months Free Included</p>
            </div>
            <div className="w-full space-y-4">
              <div className="space-y-0">
                <p className="text-[11px] font-sans text-[var(--text-muted)] line-through opacity-60 ml-0.5">{prices.annuallyStrikethrough}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-[32px] font-bold text-[var(--accent-primary)]">{prices.annually}</span>
                  <span className="text-xs text-[var(--accent-primary)]/70">/ year</span>
                </div>
              </div>
              <AnchorButton
                variant="solid"
                onClick={() => {
                  if (user?.uid) {
                    subscribe(user.uid, user.email || '', user.displayName || 'Traveler', 'premium_yearly', currency, () => {
                      localStorage.setItem('show-welcome-modal', 'Sacred Commitment (Annual)');
                      onSuccess?.();
                    });
                  }
                }}
                disabled={isProcessing}
                className="w-full shadow-[0_4px_20px_var(--glow-primary)]"
              >
                {isProcessing ? 'Opening Portal...' : 'Unlock Annually'}
              </AnchorButton>
            </div>
          </div>

          {/* 4. Lifetime */}
          <div className="p-6 rounded-[32px] border border-[var(--border-default)] bg-[var(--bg-surface)] hover:border-[var(--accent-primary)]/40 transition-all shadow-lg flex flex-col justify-between">
            <div className="text-left">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--text-muted)] mb-2">Everlasting</p>
              <h4 className="text-[20px] font-bold text-[var(--text-primary)]">Eternal Traveler</h4>
              <p className="text-[11px] text-[var(--text-secondary)] font-serif italic mb-6">One-Time Offering</p>
            </div>
            <div className="w-full space-y-4">
              <div className="flex items-baseline gap-1">
                <span className="text-[28px] font-bold text-[var(--text-primary)]">{prices.lifetime}</span>
                <span className="text-xs text-[var(--text-muted)]">/ forever</span>
              </div>
              <AnchorButton
                variant="ghost"
                onClick={() => {
                  if (user?.uid) {
                    checkOut?.(user.uid, user.email || '', user.displayName || 'Traveler', 'all_access', currency, () => {
                      localStorage.setItem('show-welcome-modal', 'Eternal Traveler (Lifetime)');
                      onSuccess?.();
                    });
                  }
                }}
                disabled={isProcessing}
                className="w-full"
              >
                {isProcessing ? 'Opening Portal...' : 'Unlock Forever'}
              </AnchorButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---

export default function UntetheredApp() {
  const { user: currentUser, profile, loading, signOut, isAccessValid, activateTrial } = useAuth();
  const { theme } = useTheme();

  const membershipInfo = useMemo(() => {
    if (!profile) return null;
    const isPremium = profile.purchasedCourses?.includes('all_access') ||
      profile.subscriptionStatus === 'ACTIVE' ||
      isAdminEmail(currentUser?.email);
    const trialDate = profile.trialUntil?.toDate ? profile.trialUntil.toDate() : (profile.trialUntil ? new Date(profile.trialUntil) : null);
    const isTrial = !!(trialDate && trialDate > new Date());

    let daysLeft = 0;
    if (isTrial && trialDate) {
      daysLeft = Math.ceil((trialDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    }

    const plan = profile.subscriptionId?.includes('yearly') ? 'Yearly' :
      profile.subscriptionId?.includes('monthly') ? 'Monthly' :
        (profile.purchasedCourses?.includes('all_access') ? 'Lifetime' :
          (isAdminEmail(currentUser?.email) ? 'All Access' : null));

    return {
      type: isPremium ? 'Premium' : (isTrial ? 'Trial' : 'Basic'),
      plan,
      isTrial,
      daysLeft,
      expiresAt: trialDate
    };
  }, [profile, currentUser?.email]);
  // ── Persisted navigation state — app resumes exactly where user left off ──
  const [activeTab, setActiveTab] = usePersistedState<string>('awakened-tab', 'home');
  const [activeQuestionId, setActiveQuestionId] = usePersistedState<string>('awakened-question', 'question1');
  const [viewMode, setViewMode] = usePersistedState<'explanation' | 'practice' | 'video'>(
    'awakened-view-mode',
    'explanation',
    (v) => ['explanation', 'practice', 'video'].includes(v)
  );
  const [activeCourseId, setActiveCourseId] = usePersistedState<string | null>('awakened-course', null);
  const [voiceGuidanceEnabled] = usePersistedState<boolean>('voice-guidance-enabled', true);
  const [preferredVoice, setPreferredVoice] = usePersistedState<string>('preferred-voice', 'en-GB-Chirp3-HD-Despina');

  // ── Force voice migration to Despina — Ensure consistent sacred experience ──
  useEffect(() => {
    const outdatedVoices = ['en-US-Neural2-F', 'en-GB-Chirp3-HD-Vindemiatrix', 'en-GB-Chirp3-HD-Zephyr'];
    if (outdatedVoices.includes(preferredVoice) || preferredVoice.startsWith('en-US')) {
      console.log(`[UntetheredSoulApp] Migrating voice from ${preferredVoice} to en-GB-Chirp3-HD-Despina`);
      setPreferredVoice('en-GB-Chirp3-HD-Despina');
    }
  }, [preferredVoice, setPreferredVoice]);

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
  const { subscribe, checkOut, isProcessing: isRazorpayProcessing } = useRazorpay();
  const [welcomeModal, setWelcomeModal] = useState<{ isOpen: boolean; plan: string }>({ isOpen: false, plan: '' });

  useEffect(() => {
    const pendingPlan = localStorage.getItem('show-welcome-modal');
    if (pendingPlan) {
      setWelcomeModal({ isOpen: true, plan: pendingPlan });
      localStorage.removeItem('show-welcome-modal');
    }
  }, []);

  const onNavigate = (id: string, questionId?: string, view?: string) => {
    // If not unlocked, lock everything except home and profile
    if (!isAccessValid && id !== 'home' && id !== 'profile' && id !== 'paywall' && id !== 'music') {
      setActiveTab('paywall');
      if (window.innerWidth < 1024) setIsSidebarOpen(false);
      return;
    }

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

  // Global Access Control Redirect for first load
  useEffect(() => {
    if (!loading && !isAccessValid && activeTab !== 'home' && activeTab !== 'profile' && activeTab !== 'paywall' && activeTab !== 'music') {
      setActiveTab('paywall');
    }
  }, [isAccessValid, activeTab, loading]);

  // Anti-Overlap Audio Guard: Stop generative drone if music or guidance starts
  const { stopAudio } = useGenerativeAudio();
  useEffect(() => {
    const unsub = VoiceService.subscribe((status) => {
      if (status === 'playing' || status === 'buffering') {
        stopAudio();
      }
    });
    return unsub;
  }, [stopAudio]);

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
    uid: currentUser?.uid,
    displayName: currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Traveler',
    level: stats.level,
    xp: stats.xp,
    xpToNext: stats.level * 1000,
    streak: stats.streak,
    joinedAt: stats.joinedAt,
    nowMoments: stats.totalEntries,
    email: currentUser?.email,
    isAccessValid
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
        "fixed left-0 top-0 bottom-0 w-[280px] flex flex-col z-[70] overflow-hidden",
        "border-r border-[var(--border-default)]",
        "bg-[var(--bg-surface)] backdrop-blur-2xl px-2",
        "transition-transform duration-500 ease-fluid",
        "lg:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>

        {/* ── Logo ── */}
        <div className="flex items-center justify-between px-6 py-[1.5vh] flex-shrink-0">
          <AwakenedPathLogo
            variant="full"
            size="sm"
            animated={true}
            onClick={() => setActiveTab('home')}
            className="group"
          />
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Thin divider under logo ── */}
        <div className="mx-6 mb-0.5 h-px bg-[var(--border-subtle)] opacity-50 flex-shrink-0" />

        {/* ── Scrollable nav ── */}
        <nav className="flex-1 overflow-y-auto px-4 pb-2 space-y-[0.5vh] no-scrollbar flex flex-col min-h-0">

          {/* Dashboard */}
          {(() => {
            const isActive = activeTab === 'home';
            return (
              <button
                key="home"
                onClick={() => onNavigate('home')}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-[min(8px,1vh)] rounded-2xl transition-all duration-300 group relative",
                  isActive ? "bg-[var(--bg-surface)]" : "hover:bg-[var(--bg-surface)]/50"
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-2.5 bottom-2.5 w-0.5 rounded-full bg-[var(--accent-primary)]" />
                )}
                <Sun
                  size={16}
                  strokeWidth={isActive ? 2.5 : 1.5}
                  className={isActive ? "text-[var(--accent-primary)]" : "text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]"}
                />
                <span className={cn(
                  "text-[12px] uppercase tracking-[0.25em] font-sans transition-colors flex-1 text-left",
                  isActive ? "text-[var(--text-primary)] font-bold" : "text-[var(--text-secondary)] font-medium group-hover:text-[var(--text-primary)]"
                )}>
                  Dashboard
                </span>
                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] shadow-[0_0_8px_var(--accent-primary)]" />}
              </button>
            );
          })()}

          {/* ── Courses group ── */}
          <div className="pt-1 pb-0.5">
            {/* Group label */}
            <div className="flex items-center gap-3 px-4 py-[0.5vh] mb-0">
              <Sparkles
                size={14}
                strokeWidth={1.5}
                className={cn(
                  "transition-colors flex-shrink-0",
                  ['intelligence', 'wisdom_untethered'].includes(activeTab)
                    ? "text-[var(--accent-primary)]"
                    : "text-[var(--text-muted)]"
                )}
              />
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--text-muted)]">
                Courses
              </span>
            </div>

            {/* Course items */}
            <div className="space-y-0.5 ml-2 pl-5 border-l border-[var(--border-subtle)]/40">
              {[
                { id: 'intelligence', label: 'The Power of Now', locked: !isAccessValid },
                { id: 'wisdom_untethered', label: 'Wisdom Untethered', locked: !isAccessValid },
              ].map(sub => {
                const isActive = activeTab === sub.id;
                return (
                  <div key={sub.id}>
                    <button
                      onClick={() => onNavigate(sub.id)}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-[min(6px,0.8vh)] rounded-xl transition-all duration-300 group relative text-left",
                        isActive ? "bg-[var(--bg-surface)]" : "hover:bg-[var(--bg-surface)]/40"
                      )}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-[var(--accent-primary)]" />
                      )}
                      <span className={cn(
                        "text-[12px] tracking-[0.12em] font-sans transition-colors flex-1 whitespace-nowrap",
                        isActive ? "text-[var(--text-primary)] font-bold" : "text-[var(--text-secondary)] font-medium group-hover:text-[var(--text-primary)]"
                      )}>
                        {sub.label}
                      </span>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {sub.locked && <Lock size={9} className="text-[var(--text-muted)] opacity-50" />}
                        {isActive && <div className="w-1 h-1 rounded-full bg-[var(--accent-primary)]" />}
                      </div>
                    </button>

                    {/* ── Wisdom Untethered: chapter/question drill-down ── */}
                    {isActive && sub.id === 'wisdom_untethered' && (
                      <div className="mt-0.5 mb-1 ml-3 pl-3 border-l border-[var(--border-subtle)]/30">
                        {/* Chapter toggle */}
                        <button
                          onClick={() => setExpandedChapter1(!expandedChapter1)}
                          className="w-full flex items-center justify-between px-2 py-[0.8vh] rounded-lg group"
                        >
                          <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors">
                            Chapter 1 · The Mind
                          </span>
                          <span
                            className="text-[var(--accent-primary)] transition-transform duration-300 text-[9px]"
                            style={{ transform: expandedChapter1 ? 'rotate(90deg)' : 'rotate(0deg)', display: 'inline-block' }}
                          >
                            ▶
                          </span>
                        </button>

                        {/* Questions list */}
                        <AnimatePresence>
                          {expandedChapter1 && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25 }}
                              className="overflow-hidden"
                            >
                              <div className="grid grid-cols-4 gap-2 px-1 py-2">
                                {[
                                  { num: 1, label: 'Using the mind as a tool', id: 'question1', locked: !isAccessValid },
                                  { num: 2, label: 'Handling doubt and fear', id: 'question2', locked: !isAccessValid },
                                  { num: 3, label: 'Personal to impersonal', id: 'question3', locked: !isAccessValid },
                                  { num: 4, label: 'Which part to listen to', id: 'question4', locked: !isAccessValid },
                                  { num: 5, label: 'The Observer Discovery', id: 'question5', locked: !isAccessValid },
                                  { num: 6, label: 'Letting Go of the Past', id: 'question6', locked: !isAccessValid },
                                  { num: 7, label: 'Back and Forth', id: 'question7', locked: !isAccessValid },
                                ].map(q => {
                                  const isQActive = activeQuestionId === q.id;
                                  return (
                                    <button
                                      key={q.id}
                                      disabled={q.locked}
                                      onClick={() => {
                                        setActiveQuestionId(q.id);
                                        setViewMode('explanation');
                                        if (window.innerWidth < 1024) setIsSidebarOpen(false);
                                      }}
                                      className={cn(
                                        "aspect-square flex items-center justify-center rounded-xl text-[11px] font-bold transition-all duration-300",
                                        isQActive 
                                          ? "bg-[var(--accent-primary)] text-white shadow-[0_0_15px_var(--accent-primary-dim)]" 
                                          : "bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]/30",
                                        q.locked && "opacity-30 cursor-not-allowed"
                                      )}
                                      title={q.label}
                                    >
                                      {q.num}
                                    </button>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* ── Sanctuary group ── */}
            <div className="pt-2 pb-0.5">
              <div className="flex items-center gap-3 px-4 py-[0.5vh] mb-0">
                <Sparkles
                  size={14}
                  className={activeTab === 'music' ? "text-[var(--accent-primary)]" : "text-[var(--text-muted)]"}
                />
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--text-muted)]">
                  Soundscapes
                </span>
              </div>
              <div className="space-y-0.5 ml-2 pl-5 border-l border-[var(--border-subtle)]/40">
                <button
                  onClick={() => onNavigate('music')}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-[min(6px,0.8vh)] rounded-xl transition-all duration-300 group relative text-left",
                    activeTab === 'music' ? "bg-[var(--bg-surface)]" : "hover:bg-[var(--bg-surface)]/40"
                  )}
                >
                  {activeTab === 'music' && (
                    <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-[var(--accent-primary)]" />
                  )}
                  <span className={cn(
                    "text-[12px] tracking-[0.12em] font-sans transition-colors flex-1 whitespace-nowrap",
                    activeTab === 'music' ? "text-[var(--text-primary)] font-bold" : "text-[var(--text-secondary)] font-medium group-hover:text-[var(--text-primary)]"
                  )}>
                    Sacred Sounds
                  </span>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <div className="text-[7px] border border-[var(--accent-primary)]/40 text-[var(--accent-primary)] px-1 rounded uppercase font-bold tracking-tighter">New</div>
                    {activeTab === 'music' && <div className="w-1 h-1 rounded-full bg-[var(--accent-primary)]" />}
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* ── Standalone nav items ── */}
          {[
            { id: 'chapters', icon: BookOpen, label: 'Journal', locked: !isAccessValid },
            { id: 'situations', icon: Flame, label: 'The Practice Room', locked: !isAccessValid },
            { id: 'stats', icon: BarChart2, label: 'Progress', locked: !isAccessValid },
          ].map(item => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-[min(8px,1vh)] rounded-xl transition-all duration-300 group relative",
                  isActive ? "bg-[var(--bg-surface)]" : "hover:bg-[var(--bg-surface)]/50"
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-2.5 bottom-2.5 w-0.5 rounded-full bg-[var(--accent-primary)]" />
                )}
                <Icon
                  size={16}
                  strokeWidth={isActive ? 2.5 : 1.5}
                  className={isActive ? "text-[var(--accent-primary)]" : "text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]"}
                />
                <span className={cn(
                  "text-[12px] uppercase tracking-[0.25em] font-sans transition-colors flex-1 text-left whitespace-nowrap",
                  isActive ? "text-[var(--text-primary)] font-bold" : "text-[var(--text-secondary)] font-medium group-hover:text-[var(--text-primary)]"
                )}>
                  {item.label}
                </span>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {item.locked && <Lock size={10} className="text-[var(--text-muted)] opacity-40" />}
                  {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] shadow-[0_0_8px_var(--accent-primary)]" />}
                </div>
              </button>
            );
          })}
        </nav>

        {/* ── Footer ── */}
        <div className="flex-shrink-0 px-4 pt-2 pb-4 border-t border-[var(--border-subtle)]/50 space-y-1">
          {/* Email */}
          {currentUser?.email && (
            <div className="flex items-center gap-2 px-4 py-[0.5vh] opacity-70">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-secondary)] flex-shrink-0" />
              <span className="text-[10px] text-[var(--text-secondary)] truncate tracking-wider">
                {currentUser.email}
              </span>
            </div>
          )}
          {/* Membership Status */}
          {membershipInfo && (
            <div className="mx-2 mb-1 p-2 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-1 shadow-lg overflow-hidden relative group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    membershipInfo.type === 'Premium' ? "bg-[var(--accent-primary)] shadow-[0_0_8px_var(--accent-primary)]" :
                      membershipInfo.type === 'Trial' ? "bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.8)]" : "bg-[var(--text-muted)]"
                  )} />
                  <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[var(--text-primary)]">
                    {membershipInfo.type} Tier
                  </span>
                </div>
                {membershipInfo.type === 'Trial' && (
                  <span className="text-[9px] font-bold text-orange-400 uppercase tracking-widest bg-orange-400/10 px-2 py-0.5 rounded-full">
                    {membershipInfo.daysLeft}d left
                  </span>
                )}
              </div>

              <div className="space-y-2 py-0.5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[var(--accent-primary)]/70">Plan Type</span>
                  <span className="text-[12px] font-bold text-[var(--text-primary)] tracking-tight">{membershipInfo.plan || 'Free Traveler'}</span>
                </div>
                {membershipInfo.expiresAt && (
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[var(--accent-secondary)]/70">Expires</span>
                    <span className="text-[11px] font-black text-[var(--accent-secondary)] px-2.5 py-1 rounded-lg bg-[var(--accent-secondary)]/10 border border-[var(--accent-secondary)]/20 shadow-sm">
                      {membershipInfo.expiresAt.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                )}
              </div>

              {membershipInfo.type !== 'Premium' && (
                <button
                  onClick={() => onNavigate('paywall')}
                  className="w-full mt-1.5 py-2 rounded-xl bg-[var(--accent-primary)] text-black text-[9px] font-bold uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl"
                >
                  Upgrade Journey
                </button>
              )}
            </div>
          )}

          {/* Log out */}
          <button
            onClick={async () => {
              if (window.confirm('Sign out?')) await signOut();
            }}
            className="w-full flex items-center gap-3 px-4 py-[0.8vh] rounded-xl group hover:bg-[var(--bg-surface)] transition-all"
          >
            <LogOut size={14} className="text-[var(--text-secondary)] group-hover:text-rose-400 transition-colors flex-shrink-0" />
            <span className="text-[10px] uppercase tracking-[0.35em] text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] font-bold transition-colors font-sans">
              Log Out
            </span>
          </button>

          {/* Brand credit */}
          <div className="px-4 pt-1">
            <p className="text-[10px] font-serif italic text-[var(--text-secondary)] opacity-90 leading-relaxed">
              Designed by{' '}
              <a
                href="https://www.skrmblissai.in/twinsouls"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity underline underline-offset-2 font-medium"
              >
                skrmblissai.in
              </a>
            </p>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className={cn(
        "relative z-10 min-h-screen transition-all duration-700 overflow-hidden",
        "lg:pl-[280px]"
      )}>
        {/* Time of Day Ambient Tint */}
        <div
          className="absolute inset-x-0 top-0 h-[600px] pointer-events-none transition-all duration-1000 z-0"
          style={{ background: timeOfDayGradient }}
        />
        <AnimatePresence>
          {/* Back Action - Integrated into the page flow */}
          {/* Moved back/medals into fixed header below to prevent overlap */}
        </AnimatePresence>

        {/* TOP CONTROLS: LEFT (BACK) AND RIGHT (TOOLS) */}
        {activeTab !== 'home' && activeTab !== 'paywall' && (
          <div className="fixed top-6 left-6 lg:left-[300px] z-[100]">
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => { setActiveTab('home'); setActivePractice(null); setIsSidebarOpen(false); }}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--text-primary)]/30 transition-all group shadow-xl"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Return</span>
            </motion.button>
          </div>
        )}

        <div className="fixed top-6 right-6 z-[100] flex items-center gap-2 sm:gap-3 scale-[0.85] sm:scale-100 origin-right whitespace-nowrap">

          <button
            onClick={() => setActiveTab('profile')}
            className={cn(
              "p-3 rounded-full backdrop-blur-3xl border border-[var(--border-default)] transition-all flex items-center justify-center group shadow-xl relative overflow-hidden",
              activeTab === 'profile' ? "bg-[var(--accent-primary)] text-black border-[var(--accent-primary)]" : "bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            )}
            title="Your Journey Profile"
          >
            <div className="absolute inset-0 bg-white/10 animate-pulse opacity-0 group-hover:opacity-30" />
            <Medal className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--accent-primary)] text-black text-[8px] font-bold flex items-center justify-center rounded-full border border-[var(--bg-surface)]">
              {unlocked.length}
            </span>
          </button>

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
            title="Awakened Path Studio"
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
                className="absolute inset-0 bg-[var(--accent-primary)]/20 blur-xl"
              />
            )}
            <Headphones className={cn("w-4 h-4 relative z-10 transition-transform", isAudioEnabled ? "animate-pulse" : "group-hover:scale-110")} />
          </button>
        </div>

        <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-8">
          <SacredWelcomeModal
            isOpen={welcomeModal.isOpen}
            onClose={() => {
              setWelcomeModal({ isOpen: false, plan: '' });
              window.location.reload();
            }}
            planName={welcomeModal.plan}
            userEmail={currentUser?.email}
          />
          <AnimatePresence mode="wait">
            {activeTab === 'paywall' && (
              <motion.div key="paywall-lock" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <PremiumPaywall
                  user={currentUser}
                  subscribe={subscribe}
                  checkOut={checkOut}
                  isProcessing={isRazorpayProcessing}
                  activateTrial={activateTrial}
                  hasUsedTrial={!!profile?.trialUntil}
                  onSuccess={() => {
                    localStorage.setItem('awakened-tab', JSON.stringify('home'));
                    localStorage.setItem('awakened-path-active-tab', 'home');
                    setActiveTab('home');
                  }}
                />
              </motion.div>
            )}

            {activeTab === 'home' && (
              <>
                <div className="lg:hidden">
                  <MobileDashboard
                    user={currentUser}
                    isAccessValid={isAccessValid}
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
                    user={currentUser}
                    isAccessValid={isAccessValid}
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
              <motion.div key="situations" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
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

            {activeTab === 'music' && (
              <motion.div key="music" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}>
                <MusicHub />
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
              <WisdomUntetheredCourse
                activeQuestionId={activeQuestionId}
                viewMode={viewMode}
                setViewMode={setViewMode}
                onOpenJournal={() => setActiveTab('chapters')}
                onNavigateToPractice={() => setActiveTab('situations')}
                onReturn={() => setActiveTab('dashboard')}
              />
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
                <header className="relative p-12 rounded-[40px] border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-visible group">
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
                        <div className="flex items-center gap-4">
                          <h2 className="text-4xl md:text-5xl font-serif font-light text-[var(--text-primary)] tracking-tight">{user.displayName}</h2>
                          <div className={cn(
                            "px-3 py-1 text-[10px] uppercase tracking-widest font-bold rounded-full border border-opacity-30",
                            isAccessValid
                              ? "bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border-[var(--accent-primary)]"
                              : "bg-[var(--text-muted)]/10 text-[var(--text-secondary)] border-[var(--text-muted)]"
                          )}>
                            {isAccessValid ? 'Premium' : 'Basic Tier'}
                          </div>
                        </div>
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
                    <h3 className="text-xl font-serif font-light text-[var(--text-secondary)]">Journey Milestones</h3>
                    <span className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{unlocked.length} of 16 Unlocked</span>
                  </div>

                  <MedalGrid unlocked={unlocked} />
                </div>

                {/* Account Settings */}
                <div className="p-10 rounded-[40px] border border-[var(--border-default)] bg-[var(--bg-surface)] space-y-10">
                  <h3 className="text-xl font-serif font-light text-[var(--text-secondary)] border-b border-[var(--border-subtle)] pb-4">Data & Support</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                    <div className="space-y-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--accent-primary)] mb-2">Guidance Voice</p>
                      <div className="grid grid-cols-1 gap-2">
                        {[
                          { id: 'en-US-Chirp3-HD-Despina', label: 'Despina (Ethereal Presence)', gender: 'FEMALE' },
                          { id: 'en-GB-Chirp3-HD-Vindemiatrix', label: 'Vindemiatrix (British Sophistication)', gender: 'FEMALE' },
                          { id: 'en-US-Chirp3-HD-Algenib', label: 'Algenib (Cosmic Presence)', gender: 'FEMALE' },
                          { id: 'en-US-Neural2-F', label: 'Gentle Presence (Female)', gender: 'FEMALE' },
                          { id: 'en-US-Neural2-D', label: 'Warm Wisdom (Male)', gender: 'MALE' },
                        ].map((v) => (
                          <button
                            key={v.id}
                            onClick={() => {
                              setPreferredVoice(v.id);
                              // Preview voice
                              VoiceService.speak("I am ready to guide you.", { voice: v.id, gender: v.gender as any });
                            }}
                            className={cn(
                              "flex items-center justify-between px-4 py-3 rounded-xl border transition-all",
                              preferredVoice === v.id
                                ? "bg-[var(--accent-primary)]/10 border-[var(--accent-primary)] text-[var(--text-primary)]"
                                : "bg-[var(--bg-surface-hover)] border-[var(--border-default)] text-[var(--text-muted)] hover:border-[var(--accent-primary)]/30"
                            )}
                          >
                            <span className="text-xs font-medium">{v.label}</span>
                            {preferredVoice === v.id && <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]" />}
                          </button>
                        ))}
                      </div>
                      <p className="text-[10px] text-[var(--text-muted)] italic leading-relaxed">
                        Our guidance is dynamically generated using high-fidelity AI. While you can't record your own voice yet, you can choose the presence that resonates most with your spirit.
                      </p>
                    </div>

                    <div className="space-y-6">
                      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--accent-primary)] mb-2">Data Portability</p>
                      <div className="flex flex-col gap-3">
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
                          className="w-full px-6 py-4 rounded-xl bg-[var(--bg-surface-hover)] border border-[var(--border-default)] text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all flex items-center justify-center gap-3"
                        >
                          <Mail size={14} /> Download Journal Export
                        </button>
                        <button
                          onClick={() => alert("Archive functionality coming soon. Your data is safely persisted in the cloud.")}
                          className="w-full px-6 py-4 rounded-xl bg-transparent border border-rose-400/20 text-[11px] font-bold uppercase tracking-widest text-rose-400/60 hover:bg-rose-400/5 transition-all"
                        >
                          Archive Session History
                        </button>
                      </div>
                    </div>
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
      {voiceGuidanceEnabled && (
        <VoiceGuidance
          preferredVoice={preferredVoice}
          activeTab={activeTab}
          isAccessValid={isAccessValid}
          assignment={weeklyAssignment}
        />
      )}

    </div>
  );
}
