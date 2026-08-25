import { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { Flame, Sparkles, Sun, BookOpen, User, BarChart2, ArrowLeft, Clock, Menu, X, Lock, Headphones, LogOut, LogIn, Mail, Youtube, Eye, CheckSquare, Wind, ChevronLeft, ChevronRight, Download, Home, Trophy, Users, CalendarDays, GraduationCap, Lightbulb, HelpCircle, Database } from 'lucide-react';
import { usePageSeo } from './lib/seo';
import { MeditationHomeCard } from './features/meditation/MeditationHomeCard';
import { db } from './firebase';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from './lib/utils';
import { useAuth } from './features/auth/AuthContext';
import { MeditationPortal } from './components/ui/MeditationPortal';
import { SacredCircle } from './components/ui/SacredCircle';
import { SignInScreen } from './features/auth/SignInScreen';
import { EmailCaptureScreen } from './features/auth/EmailCaptureScreen';
import { TrialBadge } from './components/ui/TrialBadge';
import { AnchorButton, NoiseOverlay } from './components/ui/SacredUI';
import { useGenerativeAudio } from './features/audio/useGenerativeAudio';
import { ThemeToggle, useTheme } from './theme/ThemeSystem';
import { collection, query, orderBy, limit, onSnapshot, getDocs, doc } from 'firebase/firestore';
import { MindGymLogo } from './components/ui/MindGymLogo';
import SILogoMark from './components/ui/SILogoMark';
import { useAchievements } from './features/achievements/useAchievements';
import { MusicMiniPlayer } from './components/ui/MusicMiniPlayer';
import { AchievementToast } from './features/achievements/AchievementsPanel';
import { AchievementsDrawer } from './features/achievements/AchievementsDrawer';
import { TokenToast } from './components/ui/TokenToast';
import { isAdminEmail, shouldBlockAnalytics, canViewEngagementReport } from './config/admin';
import { usePresenceHeartbeat, usePresentMembers } from './features/community/usePresence';
import { useCourseTracking } from './hooks/useCourseTracking';
import { useWeeklyAssignment } from './hooks/useWeeklyAssignment';
import { InfoTooltip } from './components/ui/InfoTooltip';
import { VoiceGuidance } from './components/ui/VoiceGuidance';
import { VoiceService, useVoiceStatus } from './services/voiceService';
import { usePersistedState } from './hooks/usePersistedState';
import { useRazorpay } from './hooks/useRazorpay';
import { PhonePromptModal } from './components/domain/PhonePromptModal';
import SacredWelcomeModal from './components/ui/SacredWelcomeModal';
import { LeaveMindGymModal } from './components/ui/LeaveMindGymModal';
import { PresenceBreath } from './components/ui/PresenceBreath';
import { FirstRunWelcome } from './components/ui/FirstRunWelcome';
import { DashboardGrid } from './features/practices/DashboardGrid';
import PriceSlider from './components/ui/PriceSlider';
import { useActivityTracker } from './hooks/useActivityTracker';

// ─── Lazy-loaded feature tabs ───────────────────────────────────────────────
// None of these are needed for the first paint of the home screen, so they are
// split into separate chunks and fetched only when their tab is opened. This
// keeps the initial mobile payload small on slow networks.
const MeditationFeature = lazy(() => import('./features/meditation/MeditationFeature').then(m => ({ default: m.MeditationFeature })));
const CoursesHub = lazy(() => import('./features/courses/CoursesHub').then(m => ({ default: m.CoursesHub })));
const WisdomUntetheredCourse = lazy(() => import('./features/courses/WisdomUntetheredCourse').then(m => ({ default: m.WisdomUntetheredCourse })));
const EmotionFeelingsCourseView = lazy(() => import('./features/courses/EmotionFeelingsCourseView').then(m => ({ default: m.EmotionFeelingsCourseView })));
const Journal = lazy(() => import('./features/journal/components/Journal'));
const BreathPractice = lazy(() => import('./features/breath/components/BreathPractice').then(m => ({ default: m.BreathPractice })));
const MasterPranayamApp = lazy(() => import('./components/domain/pranayam/MasterPranayamApp').then(m => ({ default: m.MasterPranayamApp })));
const StatsDashboard = lazy(() => import('./features/stats/StatsDashboard'));
const SituationalPractices = lazy(() => import('./features/practices/SituationalPractices').then(m => ({ default: m.SituationalPractices })));
const MusicHub = lazy(() => import('./features/music/MusicHub').then(m => ({ default: m.MusicHub })));
const VideosHub = lazy(() => import('./features/videos/VideosHub').then(m => ({ default: m.VideosHub })));
const EngagementReport = lazy(() => import('./features/admin/EngagementReport'));
const MembersView = lazy(() => import('./features/community/MembersView').then(m => ({ default: m.MembersView })));
const CalendarView = lazy(() => import('./features/community/CalendarView').then(m => ({ default: m.CalendarView })));
const PracticePathView = lazy(() => import('./features/practice-path/PracticePathView').then(m => ({ default: m.PracticePathView })));
const VirtuesView = lazy(() => import('./features/practice-path/VirtuesView').then(m => ({ default: m.VirtuesView })));
const CircleView = lazy(() => import('./features/practice-path/CircleView').then(m => ({ default: m.CircleView })));
const PracticesTab = lazy(() => import('./features/practice-path/PracticesTab').then(m => ({ default: m.PracticesTab })));
const YearPanel = lazy(() => import('./features/practice-path/YearPanel').then(m => ({ default: m.YearPanel })));
const BackupView = lazy(() => import('./features/practice-path/BackupView').then(m => ({ default: m.BackupView })));

// Lightweight centered fallback shown while a feature chunk loads.
const TabFallback = () => (
  <div className="w-full flex items-center justify-center py-24">
    <div className="w-9 h-9 rounded-full border-2 border-[var(--brand-primary)] border-t-transparent animate-spin" />
  </div>
);

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
  inhale: { text: 'INHALE', scale: 1.3, glow: '0 0 100px rgba(207,194,205, 0.4)', duration: 4 },
  hold: { text: 'HOLD', scale: 1.0, glow: '0 0 60px rgba(198, 95, 157, 0.3)', duration: 2 },
  exhale: { text: 'EXHALE', scale: 0.6, glow: '0 0 40px rgba(207,194,205, 0.2)', duration: 4 },
  rest: { text: 'REST', scale: 0.5, glow: 'none', duration: 2 }
};

const EMOTION_MAP: Record<string, string> = {
  ANXIETY: '#FF7043',
  SADNESS: '#5C6BC0',
  INSECURITY: '#8C7B8A',
  ANGER: '#E53935',
  PEACE: '#CFC2CD',
  JOY: '#C9AE8E',
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

const MobileDashboard = ({ user }: any) => {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning'
    : hour < 17 ? 'Good afternoon'
      : 'Good evening';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-4"
    >
      {/* ── Breathing hero — first thing under the fixed nav bar ── */}
      <div className="flex flex-col items-center gap-2 px-3 sm:px-4 pt-1">
        <PresenceBreath size={190} showCaption={false} />
      </div>

      {/* ── Greeting — centered, just beneath the hero ── */}
      <div className="text-center px-4">
        <span
          className="font-sans text-[10px] font-bold tracking-[.28em] uppercase"
          style={{ color: 'var(--accent-primary)' }}
        >
          {greeting},
        </span>
        <p className="font-serif text-[18px] font-normal mt-0.5 truncate" style={{ color: 'var(--text-primary)' }}>
          {user.displayName || 'Friend'}
        </p>
      </div>
    </motion.div>
  );
};

const BreadthDesktop = ({ user }: any) => {
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
      {/* ── Desktop hero: centered greeting + diamond ── */}
      <div className="pt-6 lg:pt-8 pb-2 px-4 lg:px-8 max-w-4xl mx-auto">
        {/* Centered hero column */}
        <div className="flex flex-col items-center text-center">
          <p className="font-sans text-[11px] font-bold tracking-[.28em] uppercase mb-1" style={{ color: 'var(--accent-primary)' }}>
            {greeting},
          </p>
          <h1 className="font-serif text-3xl lg:text-4xl font-light mb-1" style={{ color: 'var(--text-primary)' }}>
            {user.displayName}
          </h1>
          <PresenceBreath size={220} showCaption={false} />
        </div>
      </div>
    </motion.div>
  );
};

// --- Watcher's Pause Audio Component ---
const WatcherPauseButton = () => {
  const { status, category, trackId } = useVoiceStatus();
  const isActive = trackId === 'WatchersPause';
  const isPlaying = isActive && status === 'playing' && category === 'music';
  const [isInitializing, setIsInitializing] = useState(false);

  const toggle = async () => {
    if (isPlaying) {
      VoiceService.pause();
    } else if (isActive && status === 'paused') {
      VoiceService.resume('music');
    } else {
      setIsInitializing(true);
      try {
        const url = await VoiceService.getCloakedUrl('WatchersPause', 'Soundscapes/WatchersPause.mp3');
        await VoiceService.playAudioURL(url, { loop: true, trackId: 'WatchersPause' });
      } catch (err) {
        console.error("[WatcherPause] Failed to manifest audio:", err);
      } finally {
        setIsInitializing(false);
      }
    }
  };

  return (
    <button
      onClick={toggle}
      className={cn(
        "p-3 rounded-full backdrop-blur-3xl border transition-all flex items-center justify-center group overflow-hidden shadow-2xl relative",
        isPlaying
          ? "bg-[var(--accent-secondary)]/10 border-[var(--accent-secondary)]/30 text-[var(--accent-secondary)] shadow-[0_0_20px_var(--accent-secondary-dim)]"
          : "bg-[var(--bg-surface)] border-[var(--border-default)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
      )}
      title="Watcher's Pause (Loop)"
    >
      {isPlaying && (
        <motion.div
          animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-[var(--accent-secondary)]/20 blur-xl"
        />
      )}
      {isInitializing ? (
        <div className="w-4 h-4 border-2 border-[var(--accent-secondary)] border-t-transparent animate-spin rounded-full" />
      ) : (
        <Eye className={cn("w-4 h-4 relative z-10 transition-transform", isPlaying ? "animate-pulse" : "group-hover:scale-110")} />
      )}
    </button>
  );
};

// --- Sacred Welcome Modal ---

// --- Premium Paywall Component ---
const PremiumPaywall = ({ user, checkOut, isProcessing, onSuccess }: any) => {
  const { mode } = useTheme();
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Everything below is pay-what-you-want — these fixed reference prices are
  // no longer charged (kept only so pricingConfig's shape/detection logic is
  // untouched); the actual charge comes from the sliders further down.
  const DISCOUNT = 0.70;
  const disc = (n: number) => Math.round(n * (1 - DISCOUNT));

  const pricingConfig = useMemo(() => {
    if (timezone === 'Asia/Calcutta' || timezone === 'Asia/Kolkata') {
      return { symbol: '₹', monthly: '799', annual: '7,999', lifetime: '14,999', currency: 'INR', strike: '9,588',
        dMonthly: disc(799), dAnnual: disc(7999), dLifetime: disc(14999) };
    }
    if (timezone === 'Europe/London') {
      return { symbol: '£', monthly: '8.99', annual: '89.99', lifetime: '169.99', currency: 'GBP', strike: '107.88',
        dMonthly: disc(899)/100, dAnnual: disc(8999)/100, dLifetime: disc(16999)/100 };
    }
    if (timezone.startsWith('Europe/')) {
      return { symbol: '€', monthly: '9.99', annual: '99.99', lifetime: '189.99', currency: 'EUR', strike: '119.88',
        dMonthly: disc(999)/100, dAnnual: disc(9999)/100, dLifetime: disc(18999)/100 };
    }
    if (timezone.startsWith('Australia/')) {
      return { symbol: 'A$', monthly: '14.99', annual: '149.99', lifetime: '299.99', currency: 'AUD', strike: '179.88',
        dMonthly: disc(1499)/100, dAnnual: disc(14999)/100, dLifetime: disc(29999)/100 };
    }
    if (timezone.startsWith('America/Toronto') || timezone.startsWith('America/Vancouver') || timezone.startsWith('Canada/')) {
      return { symbol: 'C$', monthly: '13.99', annual: '139.99', lifetime: '259.99', currency: 'CAD', strike: '167.88',
        dMonthly: disc(1399)/100, dAnnual: disc(13999)/100, dLifetime: disc(25999)/100 };
    }
    return { symbol: '$', monthly: '9.99', annual: '99.99', lifetime: '199.99', currency: 'USD', strike: '119.88',
      dMonthly: disc(999)/100, dAnnual: disc(9999)/100, dLifetime: disc(19999)/100 };
  }, [timezone]);

  const currency = pricingConfig.currency;

  // ── Pay-what-you-want pricing — floors + suggested amounts, one slider each
  // for the standalone course and for monthly/yearly Mind Gym membership.
  // Keep in sync with functions/index.js PWYW_PRODUCTS (the server re-clamps
  // regardless, but these should match what the slider promises the buyer).
  const COURSE_MIN: Record<string, number> = { INR: 99, USD: 2, EUR: 2, GBP: 2, CAD: 3, AUD: 3, AED: 8, SGD: 3 };
  const COURSE_SUGGESTED: Record<string, number> = { INR: 415, USD: 4.99, EUR: 4.99, GBP: 3.99, CAD: 6.99, AUD: 7.99, AED: 18, SGD: 6.99 };
  const MEMBERSHIP_MIN: Record<string, { monthly: number; yearly: number }> = {
    INR: { monthly: 99, yearly: 999 }, USD: { monthly: 2, yearly: 12 }, EUR: { monthly: 2, yearly: 12 },
    GBP: { monthly: 2, yearly: 10 }, CAD: { monthly: 3, yearly: 16 }, AUD: { monthly: 3, yearly: 18 },
    AED: { monthly: 8, yearly: 44 }, SGD: { monthly: 3, yearly: 16 },
  };
  const MEMBERSHIP_SUGGESTED: Record<string, { monthly: number; yearly: number }> = {
    INR: { monthly: 240, yearly: 2400 }, USD: { monthly: 3, yearly: 30 }, EUR: { monthly: 3, yearly: 30 },
    GBP: { monthly: 3, yearly: 25 }, CAD: { monthly: 4, yearly: 40 }, AUD: { monthly: 4, yearly: 45 },
    AED: { monthly: 12, yearly: 110 }, SGD: { monthly: 4, yearly: 40 },
  };
  const [courseAmt, setCourseAmt] = useState(() => COURSE_SUGGESTED[currency] ?? COURSE_SUGGESTED.USD);
  const [monthlyAmt, setMonthlyAmt] = useState(() => MEMBERSHIP_SUGGESTED[currency]?.monthly ?? MEMBERSHIP_SUGGESTED.USD.monthly);
  const [yearlyAmt, setYearlyAmt] = useState(() => MEMBERSHIP_SUGGESTED[currency]?.yearly ?? MEMBERSHIP_SUGGESTED.USD.yearly);

  // ── Dynamic monthly promo — the awareness theme + month rotate automatically
  // each month, so the banner never reads as a stale "May 2026" offer. ──
  const promo = useMemo(() => {
    const AWARENESS = [
      { emoji: '🌱', label: 'New Beginnings Month' },        // Jan
      { emoji: '💛', label: 'Self-Compassion Month' },       // Feb
      { emoji: '🧠', label: 'Brain & Mind Awareness Month' },// Mar
      { emoji: '🌤️', label: 'Stress Awareness Month' },      // Apr
      { emoji: '🌿', label: 'Mental Health Awareness Month' },// May
      { emoji: '🧘', label: 'Mindfulness Month' },           // Jun
      { emoji: '☀️', label: 'Self-Care Month' },             // Jul
      { emoji: '🌊', label: 'Inner Calm Month' },            // Aug
      { emoji: '🕊️', label: 'Emotional Wellness Month' },    // Sep
      { emoji: '🍂', label: 'World Mental Health Month' },    // Oct
      { emoji: '🙏', label: 'Gratitude Month' },             // Nov
      { emoji: '❄️', label: 'Rest & Reflection Month' },     // Dec
    ];
    const now = new Date();
    const m = now.getMonth();
    const monthName = now.toLocaleString('en-US', { month: 'long' });
    const year = now.getFullYear();
    const lastDay = new Date(year, m + 1, 0).getDate();
    const t = AWARENESS[m];
    return { emoji: t.emoji, label: t.label, monthName, year, lastDay };
  }, []);

  const features = [
    { name: "Deep Wisdom Courses", basic: "All lessons free for 3 days", premium: "All Chapters & Content", icon: BookOpen },
    { name: "The Practice Room", basic: "All features free for 3 days", premium: "Entire Practice Library", icon: Flame },
    { name: "Journal", basic: "Free for 3 days", premium: "Full Access", icon: BookOpen },
    { name: "Personal Consultations", basic: "-", premium: "2 Free Sessions", icon: User },
    { name: "Progress Tracking", basic: "Basic", premium: "In-Depth Analytics", icon: BarChart2 },
    { name: "Weekly Assignments", basic: "Delayed", premium: "Instant Access", icon: Clock },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] h-full text-center p-4 pt-24 md:p-8 md:pt-8">
      <div className="max-w-6xl w-full flex flex-col items-center space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-2xl px-4 mt-8 md:mt-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h2 className="text-4xl md:text-6xl font-sans font-medium text-[var(--text-primary)] tracking-tight">Expand Your Journey</h2>
            <p className="text-[15px] md:text-[17px] font-sans font-medium text-[var(--text-secondary)] leading-relaxed">
              Step beyond the gateway to unlock full access to the Mind Gym universe.
            </p>
          </motion.div>
        </div>

        {/* Comparison Table */}
        <div className="w-full max-w-4xl space-y-8 px-4">
          <div className="overflow-x-auto rounded-[24px] border border-[var(--border-default)] bg-[var(--bg-surface)]/30 backdrop-blur-sm">
            <table className="w-full text-left border-collapse min-w-[320px] sm:min-w-[500px]">
              <thead>
                <tr className="border-b border-[var(--border-default)] bg-[var(--bg-surface)]/50">
                  <th className="p-3 sm:p-5 text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Feature</th>
                  <th className="p-3 sm:p-5 text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Traveler</th>
                  <th className="p-3 sm:p-5 text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-[var(--accent-primary)]">Seeker</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-default)]">
                {features.map((f, i) => (
                  <tr key={i} className="hover:bg-white/[0.04] transition-colors bg-[var(--bg-surface)]/20">
                    <td className="p-4 sm:p-5 border-r border-[var(--border-default)]">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <f.icon size={14} className="text-[var(--accent-primary)] sm:size-[16px]" />
                        <span className="text-[12px] sm:text-[14px] font-sans font-semibold text-[var(--text-primary)]">{f.name}</span>
                      </div>
                    </td>
                    <td className="p-4 sm:p-5 text-[11px] sm:text-[13px] text-[var(--text-secondary)] border-r border-[var(--border-default)]">{f.basic}</td>
                    <td className="p-4 sm:p-5 text-[11px] sm:text-[13px] text-[var(--accent-primary)] font-bold">{f.premium}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-3 text-center bg-[var(--bg-base)]/50 border-t border-[var(--border-subtle)]/30 rounded-b-[24px]">
              <p className="text-[12px] font-sans font-medium text-[var(--accent-primary)]">
                * Note: Free users have access to all Premium features for 3 days completely free of cost.
              </p>
            </div>
          </div>

          {/* Sacred Promise */}
          <div className="flex flex-col items-center gap-6 py-10 px-8 rounded-[40px] bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 text-center shadow-[0_0_50px_rgba(140,123,138,0.05)]">
            <div className="flex items-center justify-center gap-4 text-[var(--accent-primary)]">
              <Sparkles size={20} className="filter drop-shadow-[0_0_8px_var(--glow-primary)]" />
              <h5 className="text-[14px] font-bold uppercase tracking-[0.4em] text-[var(--accent-primary)] drop-shadow-sm">Our Sacred Promise</h5>
            </div>
            <p className="text-[15px] text-[var(--text-primary)] font-sans font-medium leading-relaxed text-center max-w-xl">
              "If these teachings do not resonate with your spirit, we offer a <span className="text-[var(--accent-primary)] font-bold underline underline-offset-4 decoration-1">Full 100% Refund</span> within 15 days."
            </p>
            <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-widest font-bold opacity-60">Your journey is ours to protect</p>
          </div>
        </div>

        {/* Name Your Own Price — pay-what-you-want, no fixed tiers */}
        <div className="text-center space-y-3">
          <h3 className="text-2xl font-sans font-medium text-[var(--text-primary)]">Name Your Own Price</h3>
          <p className="text-sm text-[var(--text-secondary)] font-sans font-medium max-w-md mx-auto">
            {promo.emoji} {promo.label} — give what feels right this {promo.monthName}. No fixed tiers, no pressure.
          </p>
        </div>

        {/* Pricing Grid — 3 pay-what-you-want options (trial is automatic on sign-up) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl items-stretch">

          {/* 1. Course only */}
          <div className="p-6 rounded-[32px] border border-[var(--border-default)] bg-[var(--bg-surface)] hover:border-[var(--accent-primary)]/40 transition-all shadow-lg flex flex-col">
            <div className="text-left mb-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--text-muted)] mb-2">Just One Course</p>
              <h4 className="text-[20px] font-bold text-[var(--text-primary)]">Feelings &amp; Emotions</h4>
              <p className="text-[11px] text-[var(--text-secondary)] font-sans font-medium mb-4">One-time · lifetime access</p>
            </div>
            <div className="flex-1 flex flex-col justify-center py-2">
              <PriceSlider
                currency={currency}
                min={COURSE_MIN[currency] ?? COURSE_MIN.USD}
                suggested={COURSE_SUGGESTED[currency] ?? COURSE_SUGGESTED.USD}
                value={courseAmt}
                onChange={setCourseAmt}
                accent="#7A5F44"
                dark={mode === 'dark'}
              />
            </div>
            <AnchorButton
              variant="ghost"
              onClick={() => {
                if (user?.uid) {
                  checkOut?.(user.uid, user.email || '', user.displayName || 'Traveler', 'emotion_feelings_course', currency, () => {
                    localStorage.setItem('show-welcome-modal', 'Feelings & Emotions Course');
                    onSuccess?.();
                  }, undefined, courseAmt);
                }
              }}
              disabled={isProcessing}
              className="w-full mt-4"
            >
              {isProcessing ? 'Opening Portal...' : 'Enroll Now'}
            </AnchorButton>
          </div>

          {/* 2. Monthly membership */}
          <div className="p-6 rounded-[32px] border border-[var(--border-default)] bg-[var(--bg-surface)] hover:border-[var(--accent-primary)]/40 transition-all shadow-lg flex flex-col">
            <div className="text-left mb-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--text-muted)] mb-2">Step by Step</p>
              <h4 className="text-[20px] font-bold text-[var(--text-primary)]">Monthly Membership</h4>
              <p className="text-[11px] text-[var(--text-secondary)] font-sans font-medium mb-4">Full access for 30 days</p>
            </div>
            <div className="flex-1 flex flex-col justify-center py-2">
              <PriceSlider
                currency={currency}
                min={MEMBERSHIP_MIN[currency]?.monthly ?? MEMBERSHIP_MIN.USD.monthly}
                suggested={MEMBERSHIP_SUGGESTED[currency]?.monthly ?? MEMBERSHIP_SUGGESTED.USD.monthly}
                value={monthlyAmt}
                onChange={setMonthlyAmt}
                accent="#8C7B8A"
                dark={mode === 'dark'}
              />
            </div>
            <AnchorButton
              variant="ghost"
              onClick={() => {
                if (user?.uid) {
                  checkOut?.(user.uid, user.email || '', user.displayName || 'Traveler', 'membership_monthly', currency, () => {
                    localStorage.setItem('show-welcome-modal', 'Monthly Membership');
                    onSuccess?.();
                  }, undefined, monthlyAmt);
                }
              }}
              disabled={isProcessing}
              className="w-full mt-4"
            >
              {isProcessing ? 'Opening Portal...' : 'Unlock Monthly'}
            </AnchorButton>
          </div>

          {/* 3. Yearly membership */}
          <div className="relative p-6 rounded-[32px] border-2 border-[var(--accent-primary)] bg-[var(--bg-surface)] shadow-[0_0_40px_rgba(140,123,138,0.15)] flex flex-col transform lg:scale-105 z-10">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-[var(--accent-primary)] rounded-full text-[10px] font-bold uppercase tracking-widest text-black whitespace-nowrap shadow-xl">
              Most Devoted Path
            </div>
            <div className="text-left mt-2 mb-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--accent-primary)] mb-2">Annual Immersion</p>
              <h4 className="text-[20px] font-bold text-[var(--text-primary)]">Yearly Membership</h4>
              <p className="text-[11px] text-[var(--text-secondary)] font-sans font-medium mb-4">Full access for 12 months</p>
            </div>
            <div className="flex-1 flex flex-col justify-center py-2">
              <PriceSlider
                currency={currency}
                min={MEMBERSHIP_MIN[currency]?.yearly ?? MEMBERSHIP_MIN.USD.yearly}
                suggested={MEMBERSHIP_SUGGESTED[currency]?.yearly ?? MEMBERSHIP_SUGGESTED.USD.yearly}
                value={yearlyAmt}
                onChange={setYearlyAmt}
                accent="#7A5F44"
                dark={mode === 'dark'}
              />
            </div>
            <AnchorButton
              variant="solid"
              onClick={() => {
                if (user?.uid) {
                  checkOut?.(user.uid, user.email || '', user.displayName || 'Traveler', 'membership_yearly', currency, () => {
                    localStorage.setItem('show-welcome-modal', 'Yearly Membership');
                    onSuccess?.();
                  }, undefined, yearlyAmt);
                }
              }}
              disabled={isProcessing}
              className="w-full mt-4 shadow-[0_4px_20px_var(--glow-primary)]"
            >
              {isProcessing ? 'Opening Portal...' : 'Unlock Yearly'}
            </AnchorButton>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---

export default function UntetheredApp() {
  const { user: currentUser, profile, loading, signOut, isAccessValid, isPremiumUser, tokenBalance, activateTrial, deductTokens } = useAuth();
  const { theme } = useTheme();
  const { musicUrl } = useVoiceStatus();

  usePageSeo({
    title: 'Mind Gym — Daily Meditation, Breathwork & Witness Journaling | SKRM Bliss AI',
    description: 'A daily practice space for mindfulness, presence, guided breathwork, and witness reflection journaling. Train your mind in 5 minutes a day.',
    url: 'https://www.skrmblissai.in/mindgym',
    image: 'https://www.skrmblissai.in/og/mindgym.png',
  });

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
  const [showSignIn, setShowSignIn] = useState(false);

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

  const { logEvent } = useActivityTracker(activeTab, {
    questionId: activeQuestionId,
    viewMode
  });

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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showLeaveMindGymModal, setShowLeaveMindGymModal] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 1024 : true);
  const { unlocked, points, toastQueue, dismissToast, checkAndUnlock, awardEvent } = useAchievements();
  const [achievementsOpen, setAchievementsOpen] = useState(false);
  // The floating tools collapse into one button — see the Floating Dock below.
  const [dockOpen, setDockOpen] = useState(false);
  const { isAudioEnabled, toggleAudio, setVibrationalState } = useGenerativeAudio();
  const [lastEntry, setLastEntry] = useState<any>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const { progress } = useCourseTracking(currentUser?.uid);
  const [watchedParts, setWatchedParts] = useState<string[]>([]);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const { subscribe, checkOut, isProcessing: isRazorpayProcessing } = useRazorpay();
  const [welcomeModal, setWelcomeModal] = useState<{ isOpen: boolean; plan: string }>({ isOpen: false, plan: '' });

  useEffect(() => {
    const pendingPlan = localStorage.getItem('show-welcome-modal');
    if (pendingPlan) {
      setWelcomeModal({ isOpen: true, plan: pendingPlan });
      localStorage.removeItem('show-welcome-modal');
    }
  }, []);

  // ── Responsive Layout Safeguard ───────────────────────────────────────────
  // Ensures sidebar behaves correctly across all device sizes by:
  // 1. Tracking mobile/desktop breakpoint changes
  // 2. Auto-closing sidebar when resizing to mobile
  // 3. Resetting sidebar state on orientation changes
  useEffect(() => {
    const handleResize = () => {
      const wasDesktop = !isMobile;
      const isNowMobile = window.innerWidth < 1024;
      const isSwitchingToMobile = wasDesktop && isNowMobile;

      // Update mobile state
      setIsMobile(isNowMobile);

      // Close sidebar when switching from desktop to mobile
      if (isSwitchingToMobile && isSidebarOpen) {
        setIsSidebarOpen(false);
        console.log('[ResponsiveLayout] Closed sidebar on desktop→mobile transition');
      }

      // Reset collapsed state on mobile
      if (isNowMobile && isSidebarCollapsed) {
        setIsSidebarCollapsed(false);
      }

      // Safety check: ensure sidebar is always closed on mobile load
      if (isNowMobile) {
        setIsSidebarOpen(false);
      }
    };

    // Handle orientation change
    const handleOrientationChange = () => {
      setTimeout(() => {
        if (window.innerWidth < 1024) {
          setIsSidebarOpen(false);
          setIsSidebarCollapsed(false);
          console.log('[ResponsiveLayout] Reset sidebar on orientation change');
        }
      }, 100);
    };

    // Add listeners with passive flag for better scrolling performance
    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleOrientationChange, { passive: true });

    // Initial check on mount
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [isMobile, isSidebarOpen, isSidebarCollapsed]);

  // ── Deep-link from email CTA ───────────────────────────────────────────────
  // Handles ?practice=questionX&source=email — navigates directly into the
  // specific practice once auth resolves and access is confirmed.
  useEffect(() => {
    if (loading) return; // wait for auth to resolve
    
    // Use a small delay to ensure isAccessValid has settled (firestore check)
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const practiceParam = params.get('practice');
      const validQuestions = [
        'question1', 'question2', 'question3', 'question4', 'question5', 'question6', 'question7', 'question8', 'question9',
        'ch2q1', 'ch2q2', 'ch2q3', 'ch2q4', 'ch2q5', 'ch2q6', 'ch2q7', 'ch2q8', 'ch2q9',
      ];
      
      if (practiceParam && validQuestions.includes(practiceParam)) {
        if (!isAccessValid && currentUser) {
          // If logged in but no access, send to paywall but KEEP params so they can try again after paying
          setActiveTab('paywall');
        } else if (isAccessValid) {
          console.log('[DeepLink] Success! Routing to:', practiceParam);
          setActiveTab('situations');
          setActiveQuestionId(practiceParam);
          // ONLY clear params on SUCCESSFUL routing
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [loading, isAccessValid, currentUser]);

  const onNavigate = (id: string, questionId?: string, view?: string) => {
    // Engagement Report renders as a full-screen overlay controlled by its own
    // isReportOpen flag, separate from activeTab. Without this, clicking any
    // other left-menu item changed activeTab underneath but left the overlay
    // (and its "hidden" main content) on screen until Return was clicked.
    setIsReportOpen(false);

    // If not unlocked, lock everything except home, profile, paywall, music, the learning tabs, journal, situations, and meditation
    // Meditation is FREE for everyone — no paywall.
    // Community (members/calendar) is free for everyone, like meditation — a
    // paywall in front of "who else is here" would defeat the point of it.
    // The practice suite is PAID apart from Today: Insights, Questions,
    // Practices, Path, Progress, Everyone and Backup all require access.
    // Today stays open because it is the daily ritual and the reason to
    // come back — the paywall sits behind it, not in front of it.
    const allowedTabs = ['home', 'profile', 'paywall', 'music', 'breathe', 'wisdom_untethered', 'intelligence', 'learn', 'chapters', 'situations', 'meditation', 'members', 'calendar', 'today'];
    if (!isAccessValid && !allowedTabs.includes(id)) {
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
      if (questionId && questionId !== activeQuestionId) {
        // Deduct token when user opens a new chapter
        deductTokens(10, 'wisdom_chapter').catch(console.warn);
      }
      if (questionId) setActiveQuestionId(questionId);
      if (view) setViewMode(view as any);
      logEvent('COURSE_SELECT', { course: 'wisdom_untethered', questionId: questionId || activeQuestionId });
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
    localStorage.setItem('mind-gym-active-course', activeCourseId || '');
  }, [activeCourseId]);
  const [expandedChapter1, setExpandedChapter1] = useState(true);
  const [expandedChapter2, setExpandedChapter2] = useState(false);
  // ── Community presence ──
  // Heartbeat while the app is open; the roster drives the Members badge so the
  // sidebar itself shows the community is alive without opening anything.
  usePresenceHeartbeat(
    currentUser?.uid,
    currentUser?.displayName ?? profile?.displayName ?? null,
    currentUser?.photoURL ?? profile?.photoURL ?? null,
    activeTab,
  );
  const { members: presentMembers } = usePresentMembers(currentUser?.uid);
  const onlineCount = presentMembers.length;

  // ── Sidebar groups: Practice · Courses · Community ──
  // Each opens automatically when one of its own tabs is already active, so a
  // deep link or a restored session never lands the user in a collapsed group.
  const [practiceOpen, setPracticeOpen] = useState(
    () => ['today', 'insights', 'questions', 'virtues', 'practices', 'stats', 'circle', 'backup', 'chapters', 'situations', 'breathe', 'music'].includes(activeTab));
  const [learnOpen, setLearnOpen] = useState(
    () => ['intelligence', 'wisdom_untethered', 'emotion-course', 'videos'].includes(activeTab));
  const [communityOpen, setCommunityOpen] = useState(
    () => ['meditation', 'members', 'calendar', 'circle'].includes(activeTab));

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

  // Global Access Control — on load, always start at home if the persisted tab is locked
  useEffect(() => {
    if (!loading && !isAccessValid && !['home', 'profile', 'paywall', 'music', 'wisdom_untethered', 'intelligence', 'learn', 'chapters', 'situations', 'meditation', 'members', 'calendar', 'today'].includes(activeTab)) {
      setActiveTab('home');
    }
  }, [isAccessValid, loading]); // intentionally exclude activeTab — only run on auth state change

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

  // Load Question 8 and 9 components for the main course view
  // (Assuming they will be imported or rendered in the course page)

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
    document.title = "Mind Gym · Train your mind daily";
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

  // Owns the Feelings & Emotions course. Unlocks for:
  //  • a direct course purchase (the course-only buyer, who is NOT premium), or
  //  • any premium tier — active membership, subscription, or all-access
  //    (isPremiumUser), so members get courses included, or
  //  • admin.
  // Note the one-way split: a course-only purchase unlocks the course but never
  // the full app (isPremiumUser stays false for it) — course and app pricing
  // remain separate.
  const ownsEmotionCourse = !!(
    profile?.purchasedCourses?.includes('emotion_feelings_course') ||
    profile?.purchasedCourses?.includes('all_access') ||
    isPremiumUser ||
    isAdmin
  );

  // New-course announcement bar — dismissible, remembered across sessions.
  const [courseAnnounceDismissed, setCourseAnnounceDismissed] = useState(() => {
    try { return localStorage.getItem('emotion_announce_dismissed') === '1'; } catch { return false; }
  });
  const dismissCourseAnnounce = () => {
    try { localStorage.setItem('emotion_announce_dismissed', '1'); } catch { /* ignore */ }
    setCourseAnnounceDismissed(true);
  };
  // Shown to non-owners on the standard padded tabs — hidden on the immersive
  // full-frame views (meditation room, wisdom course) which manage their own chrome.
  const showCourseAnnounce =
    !ownsEmotionCourse && !courseAnnounceDismissed &&
    !['meditation', 'wisdom_untethered'].includes(activeTab);

  // ── Auto-block Clarity for owner/internal emails ──────────────────────────
  // Runs once when auth resolves. Sets BLOCK_CLARITY in localStorage so Clarity
  // stops recording sessions from internal team members on any device.
  useEffect(() => {
    if (currentUser?.email && shouldBlockAnalytics(currentUser.email)) {
      try {
        localStorage.setItem('BLOCK_CLARITY', 'true');
      } catch (_) { /* storage unavailable */ }
    }
  }, [currentUser?.email]);


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

  // If loading for too long (>5s), show auth screen instead of hanging on awakening
  useEffect(() => {
    if (!loading) {
      setLoadingTimeout(false);
      return;
    }
    const timer = setTimeout(() => setLoadingTimeout(true), 5000);
    return () => clearTimeout(timer);
  }, [loading]);

  if (loading && !loadingTimeout) {
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
    if (showSignIn) {
      return <SignInScreen />;
    }
    return <EmailCaptureScreen onShowSignIn={() => setShowSignIn(true)} />;
  }

  // ── Full-app lock: once the 300 free tokens are used up, the entire app is
  // replaced by the upgrade screen — this overrides any trial days still
  // remaining. Genuinely paid/admin users (isPremiumUser) are always exempt.
  // Requires `profile` to have actually loaded: `loading` flips false as soon
  // as auth resolves, but the Firestore profile snapshot (which carries
  // tokensRemaining) arrives slightly later — without this guard, tokenBalance
  // briefly reads as 0 for EVERY user on EVERY load, flashing this lock
  // screen before their real balance is known.
  if (profile && tokenBalance <= 0 && !isPremiumUser) {
    return (
      <div className="min-h-screen w-full bg-[var(--bg-primary)] overflow-y-auto">
        <div className="max-w-md mx-auto text-center pt-12 px-6">
          <div
            className="w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-4"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
          >
            <Lock className="w-6 h-6 text-red-500" />
          </div>
          <h1 className="text-2xl font-serif text-[var(--text-primary)] mb-1">Your 300 free tokens are used up</h1>
          <p className="text-sm text-[var(--text-secondary)]">Upgrade for unlimited access, or sign out below.</p>
        </div>
        <PremiumPaywall
          user={currentUser}
          subscribe={subscribe}
          checkOut={checkOut}
          isProcessing={isRazorpayProcessing}
          activateTrial={activateTrial}
          hasUsedTrial={!!profile?.trialUntil}
          onSuccess={() => {
            localStorage.setItem('awakened-tab', JSON.stringify('home'));
            localStorage.setItem('mind-gym-active-tab', 'home');
            setActiveTab('home');
          }}
        />
        <div className="text-center pb-10">
          <button
            onClick={async () => { if (window.confirm('Sign out?')) await signOut(); }}
            className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)] hover:text-rose-400 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
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
        <div className="p-12 rounded-3xl bg-gradient-to-br from-[#CFC2CD] to-[#C3B8D5] text-center text-black shadow-[0_0_50px_rgba(207,194,205,0.5)]">
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
      <NoiseOverlay />
      <div
        style={{
          position: "fixed", inset: 0,
          background: `radial-gradient(ellipse 80% 50% at 50% -20%, var(--accent-secondary-dim), transparent), radial-gradient(ellipse 60% 40% at 80% 80%, var(--accent-primary-dim), transparent)`,
          pointerEvents: "none"
        }}
      />
      {renderPracticeModal()}

      {/* MOBILE SIDEBAR OVERLAY — Safeguard: only show on mobile, closes sidebar on click/touch */}
      <AnimatePresence>
        {isSidebarOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setIsSidebarOpen(false);
              console.log('[Overlay] Closed sidebar via backdrop click');
            }}
            onTouchStart={() => {
              // Ensure touch events also close sidebar on mobile
              setIsSidebarOpen(false);
            }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm lg:hidden"
            style={{ pointerEvents: 'auto', cursor: 'pointer' }}
          />
        )}
      </AnimatePresence>

      {/* SIDEBAR */}
      {/* Floating sidebar expand button — only visible on desktop when sidebar is collapsed */}
      {isSidebarCollapsed && (
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          onClick={() => setIsSidebarCollapsed(false)}
          aria-label="Open sidebar"
          className="hidden lg:flex fixed left-0 top-1/2 -translate-y-1/2 z-[75] w-8 h-14 items-center justify-center rounded-r-2xl transition-all hover:w-10 group"
          style={{
            background: 'var(--bg-surface)',
            border: '1.5px solid var(--border-default)',
            borderLeft: 'none',
            boxShadow: '4px 0 20px rgba(0,0,0,0.15)',
          }}
          title="Expand sidebar"
        >
          <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} className="group-hover:scale-110 transition-transform" />
        </motion.button>
      )}

      {/* Floating sidebar collapse button — the mirror of the expand tab
          above, on the sidebar's outer edge rather than crammed into the
          logo row (where it used to sit directly against the wordmark). */}
      {!isSidebarCollapsed && (
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          onClick={() => setIsSidebarCollapsed(true)}
          aria-label="Collapse sidebar"
          className="hidden lg:flex fixed left-[280px] top-1/2 -translate-y-1/2 z-[75] w-8 h-14 items-center justify-center rounded-r-2xl transition-all hover:w-10 group"
          style={{
            background: 'var(--bg-surface)',
            border: '1.5px solid var(--border-default)',
            borderLeft: 'none',
            boxShadow: '4px 0 20px rgba(0,0,0,0.15)',
          }}
          title="Collapse sidebar"
        >
          <ChevronLeft size={16} style={{ color: 'var(--text-muted)' }} className="group-hover:scale-110 transition-transform" />
        </motion.button>
      )}

      <aside className={cn(
        "fixed left-0 top-0 bottom-0 w-[280px] flex flex-col z-[70]",
        "border-r border-[var(--border-default)]",
        "backdrop-blur-2xl px-2",
        "transition-transform duration-500",
        // Safety: always hide sidebar on mobile unless explicitly opened
        isMobile && !isSidebarOpen ? "-translate-x-full" : "",
        // Desktop: collapse based on isSidebarCollapsed
        !isMobile && isSidebarCollapsed ? "lg:-translate-x-full" : "",
        !isMobile && !isSidebarCollapsed ? "lg:translate-x-0" : "",
        // Mobile: show/hide based on isSidebarOpen
        isMobile && isSidebarOpen ? "translate-x-0" : ""
      )}
      style={{
        // Solid bg first — backdrop-filter is unreliable on some GPU/driver combos
        // (seen in Edge on PC). Without a solid base, the sidebar is invisible
        // when blur fails, causing nav items to float over main content (Clarity bug).
        background: 'var(--bg-primary, #0c0910)',
        // Ensure sidebar never exceeds viewport width on ultra-narrow screens
        maxWidth: '90vw',
      }}>

        {/* ── Logo ── */}
        <div className="flex items-center justify-between px-3 py-[1.5vh] flex-shrink-0 w-full">
          <MindGymLogo
            variant="full"
            size="sm"
            animated={true}
            onClick={() => {
              // The logo now leaves the app entirely (Soulful Intelligence's
              // own homepage) rather than navigating internally — "Dashboard"
              // in the nav list right below handles the internal case. Since
              // leaving is a one-way trip out of the SPA, warn first via the
              // styled modal rather than surprising someone expecting "home".
              setShowLeaveMindGymModal(true);
            }}
            className="group min-w-0"
            // The drawn sacred-geometry mark is replaced with the real
            // Soulful Intelligence photo mark, since the icon's own click now
            // leads there — the icon should look like where it's going.
            icon={<SILogoMark size={28} />}
          />
          {/* Mobile close button */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-all flex-shrink-0 ml-1"
            aria-label="Close menu"
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
                  "text-[12px] uppercase tracking-[0.18em] font-sans transition-colors flex-1 text-left",
                  isActive ? "text-[var(--text-primary)] font-bold" : "text-[var(--text-secondary)] font-medium group-hover:text-[var(--text-primary)]"
                )}>
                  Dashboard
                </span>
                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] shadow-[0_0_8px_var(--accent-primary)]" />}
              </button>
            );
          })()}

          {/* ── Practice group — the daily, self-directed side of Mind Gym ── */}
          <div className="pt-1 pb-0.5">
            <button
              onClick={() => setPracticeOpen(o => !o)}
              className="w-full flex items-center gap-3 px-4 py-[0.5vh] mb-0"
            >
              <Flame
                size={14}
                strokeWidth={1.5}
                className={cn(
                  "transition-colors flex-shrink-0",
                  ['today', 'insights', 'questions', 'virtues', 'practices', 'stats', 'circle', 'backup', 'chapters', 'situations', 'breathe', 'music'].includes(activeTab)
                    ? "text-[var(--accent-primary)]"
                    : "text-[var(--text-muted)]"
                )}
              />
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--text-muted)] flex-1 text-left">
                Practice
              </span>
              <ChevronRight
                size={13}
                className="text-[var(--text-muted)] transition-transform duration-300 flex-shrink-0"
                style={{ transform: practiceOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
              />
            </button>

            {practiceOpen && (
              <div className="space-y-0.5 ml-2 pl-5 border-l border-[var(--border-subtle)]/40 mt-0.5">
                {[
                  // Inner Journey's eight, in its order and with its labels.
                  { id: 'today', icon: Sun, label: 'Today', locked: false },
                  { id: 'insights', icon: Lightbulb, label: 'Insights', locked: !isAccessValid },
                  { id: 'questions', icon: HelpCircle, label: 'Questions', locked: !isAccessValid },
                  { id: 'practices', icon: Flame, label: 'Practices', locked: !isAccessValid },
                  { id: 'virtues', icon: Sparkles, label: 'Path', locked: !isAccessValid },
                  { id: 'stats', icon: BarChart2, label: 'Progress', locked: !isAccessValid },
                  { id: 'circle', icon: Users, label: 'Everyone', locked: !isAccessValid },
                  { id: 'backup', icon: Database, label: 'Backup', locked: !isAccessValid },
                  // Mind Gym's own, which Inner Journey has no equivalent for.
                  { id: 'chapters', icon: BookOpen, label: 'Journal', locked: !isAccessValid },
                  { id: 'situations', icon: Flame, label: 'Practice Room', locked: !isAccessValid },
                  { id: 'breathe', icon: Wind, label: 'Breathe', locked: false },
                  { id: 'music', icon: Headphones, label: 'Sacred Sounds', locked: false },
                ].map(item => {
                  const isActive = activeTab === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onNavigate(item.id)}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-[min(6px,0.8vh)] rounded-xl transition-all duration-300 group relative text-left",
                        isActive ? "bg-[var(--bg-surface)]" : "hover:bg-[var(--bg-surface)]/40"
                      )}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-[var(--accent-primary)]" />
                      )}
                      <Icon
                        size={14}
                        strokeWidth={isActive ? 2.5 : 1.5}
                        className={cn("flex-shrink-0", isActive ? "text-[var(--accent-primary)]" : "text-[var(--text-muted)]")}
                      />
                      <span className={cn(
                        "text-[12px] tracking-[0.12em] font-sans transition-colors flex-1 whitespace-nowrap",
                        isActive ? "text-[var(--text-primary)] font-bold" : "text-[var(--text-secondary)] font-medium group-hover:text-[var(--text-primary)]"
                      )}>
                        {item.label}
                      </span>
                      {item.locked && <Lock size={9} className="text-[var(--text-muted)] opacity-50 flex-shrink-0" />}
                      {isActive && <div className="w-1 h-1 rounded-full bg-[var(--accent-primary)] flex-shrink-0" />}
                    </button>
                  );
                })}

                {/* Habit Tracker lives on its own site, so it stays an external link */}
                <a
                  href="https://www.skrmblissai.in/habitquest2026"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center gap-2 px-3 py-[min(6px,0.8vh)] rounded-xl transition-all hover:bg-[var(--bg-surface)]/40 text-teal-400 hover:text-teal-300 group"
                >
                  <CheckSquare size={14} className="flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="text-[12px] tracking-[0.12em] font-sans font-medium flex-1 text-left whitespace-nowrap">
                    Habit Tracker
                  </span>
                  <span className="text-[8px] font-black uppercase tracking-widest text-teal-400 flex-shrink-0">New</span>
                </a>
              </div>
            )}
          </div>

          {/* ── Courses group — guided courses and teaching ── */}
          <div className="pt-1 pb-0.5">
            {/* Group label — tap to expand / collapse */}
            <button
              onClick={() => setLearnOpen(o => !o)}
              className="w-full flex items-center gap-3 px-4 py-[0.5vh] mb-0"
            >
              <GraduationCap
                size={14}
                strokeWidth={1.5}
                className={cn(
                  "transition-colors flex-shrink-0",
                  ['intelligence', 'wisdom_untethered', 'emotion-course', 'videos'].includes(activeTab)
                    ? "text-[var(--accent-primary)]"
                    : "text-[var(--text-muted)]"
                )}
              />
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--text-muted)] flex-1 text-left">
                Courses
              </span>
              <ChevronRight
                size={13}
                className="text-[var(--text-muted)] transition-transform duration-300 flex-shrink-0"
                style={{ transform: learnOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
              />
            </button>

            {/* Course items */}
            {learnOpen && (
            <div className="space-y-0.5 ml-2 pl-5 border-l border-[var(--border-subtle)]/40 mt-0.5">
              {[
                { id: 'intelligence', label: 'The Power of Now', locked: !isAccessValid, badge: 'Free' as const },
                { id: 'wisdom_untethered', label: 'Wisdom Untethered', locked: false, badge: 'Free' as const },
                { id: 'emotion-course', label: 'Feelings & Emotions', locked: false, badge: 'Paid' as const },
                { id: 'videos', label: 'Videos', locked: false, badge: undefined },
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
                        {sub.badge && (
                          <span
                            className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full leading-none"
                            style={sub.badge === 'Paid'
                              ? { color: '#A98A67', background: 'rgba(169,138,103,0.15)', border: '1px solid rgba(169,138,103,0.35)' }
                              : { color: 'var(--text-muted)', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
                          >
                            {sub.badge}
                          </span>
                        )}
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
                                  { num: 1, label: 'Using the mind as a tool', id: 'question1', locked: false },
                                  { num: 2, label: 'Handling doubt and fear', id: 'question2', locked: !isAccessValid },
                                  { num: 3, label: 'Personal to impersonal', id: 'question3', locked: !isAccessValid },
                                  { num: 4, label: 'Which part to listen to', id: 'question4', locked: !isAccessValid },
                                  { num: 5, label: 'The Observer Discovery', id: 'question5', locked: !isAccessValid },
                                  { num: 6, label: 'Letting Go of the Past', id: 'question6', locked: !isAccessValid },
                                  { num: 7, label: 'Removing the Thorns', id: 'question7', locked: !isAccessValid },
                                  { num: 8, label: 'Let Go Now or Fall', id: 'question8', locked: !isAccessValid },
                                  { num: 9, label: 'The Secret of the Middle Way', id: 'question9', locked: !isAccessValid },
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

                        {/* Chapter 2 toggle */}
                        <button
                          onClick={() => setExpandedChapter2(!expandedChapter2)}
                          className="w-full flex items-center justify-between px-2 py-[0.8vh] rounded-lg group mt-1"
                        >
                          <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors">
                            Chapter 2
                          </span>
                          <span
                            className="text-[var(--accent-primary)] transition-transform duration-300 text-[9px]"
                            style={{ transform: expandedChapter2 ? 'rotate(90deg)' : 'rotate(0deg)', display: 'inline-block' }}
                          >
                            ▶
                          </span>
                        </button>

                        {/* Chapter 2 questions list */}
                        <AnimatePresence>
                          {expandedChapter2 && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25 }}
                              className="overflow-hidden"
                            >
                              <div className="grid grid-cols-4 gap-2 px-1 py-2">
                                {[
                                  { num: 1, label: 'Question 1', id: 'ch2q1', locked: false },
                                  { num: 2, label: 'Question 2', id: 'ch2q2', locked: !isAccessValid },
                                  { num: 3, label: 'Question 3', id: 'ch2q3', locked: !isAccessValid },
                                  { num: 4, label: 'Question 4', id: 'ch2q4', locked: !isAccessValid },
                                  { num: 5, label: 'Question 5', id: 'ch2q5', locked: !isAccessValid },
                                  { num: 6, label: 'Question 6', id: 'ch2q6', locked: !isAccessValid },
                                  { num: 7, label: 'Question 7', id: 'ch2q7', locked: !isAccessValid },
                                  { num: 8, label: 'Question 8', id: 'ch2q8', locked: !isAccessValid },
                                  { num: 9, label: 'Question 9', id: 'ch2q9', locked: !isAccessValid },
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
            )}
          </div>

          {/* ── Community group — the shared, live side ── */}
          <div className="pt-1 pb-0.5">
            <button
              onClick={() => setCommunityOpen(o => !o)}
              className="w-full flex items-center gap-3 px-4 py-[0.5vh] mb-0"
            >
              <Users
                size={14}
                strokeWidth={1.5}
                className={cn(
                  "transition-colors flex-shrink-0",
                  ['meditation', 'members', 'calendar', 'circle'].includes(activeTab)
                    ? "text-[var(--accent-primary)]"
                    : "text-[var(--text-muted)]"
                )}
              />
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--text-muted)] flex-1 text-left">
                Community
              </span>
              <ChevronRight
                size={13}
                className="text-[var(--text-muted)] transition-transform duration-300 flex-shrink-0"
                style={{ transform: communityOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
              />
            </button>

            {communityOpen && (
              <div className="space-y-0.5 ml-2 pl-5 border-l border-[var(--border-subtle)]/40 mt-0.5">
                {/* Live session first — it is the reason to come back at a set time */}
                <button
                  onClick={() => { onNavigate('meditation'); setIsSidebarOpen(false); }}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-[min(6px,0.8vh)] rounded-xl transition-all group relative text-left",
                    activeTab === 'meditation' ? "bg-amber-500/15" : "hover:bg-[var(--bg-surface)]/40"
                  )}
                >
                  {activeTab === 'meditation' && (
                    <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-amber-400" />
                  )}
                  <Wind size={14} className={cn("flex-shrink-0 transition-transform group-hover:scale-110", activeTab === 'meditation' ? 'text-amber-400' : 'text-[var(--text-muted)]')} />
                  <span className={cn(
                    "text-[12px] tracking-[0.12em] font-sans flex-1 whitespace-nowrap",
                    activeTab === 'meditation' ? "text-amber-400 font-bold" : "text-[var(--text-secondary)] font-medium group-hover:text-[var(--text-primary)]"
                  )}>
                    Wellness Session
                  </span>
                  {activeTab !== 'meditation' && (
                    <span className="relative flex h-2 w-2 flex-shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
                    </span>
                  )}
                </button>

                {[
                  { id: 'members', icon: Users, label: 'Members' },
                  { id: 'calendar', icon: CalendarDays, label: 'Calendar' },
                ].map(item => {
                  const isActive = activeTab === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onNavigate(item.id)}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-[min(6px,0.8vh)] rounded-xl transition-all duration-300 group relative text-left",
                        isActive ? "bg-[var(--bg-surface)]" : "hover:bg-[var(--bg-surface)]/40"
                      )}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-[var(--accent-primary)]" />
                      )}
                      <Icon
                        size={14}
                        strokeWidth={isActive ? 2.5 : 1.5}
                        className={cn("flex-shrink-0", isActive ? "text-[var(--accent-primary)]" : "text-[var(--text-muted)]")}
                      />
                      <span className={cn(
                        "text-[12px] tracking-[0.12em] font-sans transition-colors flex-1 whitespace-nowrap",
                        isActive ? "text-[var(--text-primary)] font-bold" : "text-[var(--text-secondary)] font-medium group-hover:text-[var(--text-primary)]"
                      )}>
                        {item.label}
                      </span>
                      {item.id === 'members' && onlineCount > 0 && (
                        <span className="text-[9px] font-bold text-emerald-400 tabular-nums flex-shrink-0">
                          {onlineCount}
                        </span>
                      )}
                      {isActive && <div className="w-1 h-1 rounded-full bg-[var(--accent-primary)] flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Insights & Studio ── */}
          <div className="mt-8 pt-4 border-t border-[var(--border-subtle)]/40 space-y-2">
            <div className="flex items-center gap-3 px-4 py-1">
              <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[var(--text-muted)] opacity-60">
                Insights & Studio
              </span>
            </div>

            <a
              href="https://www.youtube.com/@SoulfulIntelligenceStudio?sub_confirmation=1"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-3 px-4 py-2 rounded-xl transition-all hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[#FF0000] group"
            >
              <Youtube size={16} className="group-hover:scale-110 transition-transform" />
              <span className="text-[12px] font-sans tracking-[0.1em] font-medium">Soulful Studio</span>
            </a>

            {canViewEngagementReport(currentUser?.email ?? profile?.email) && (
              <button
                onClick={() => {
                  setIsReportOpen(true);
                  if (window.innerWidth < 1024) setIsSidebarOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2 rounded-xl transition-all hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--accent-primary)] group"
              >
                <Mail size={16} className="group-hover:scale-110 transition-transform" />
                <span className="text-[12px] font-sans tracking-[0.1em] font-medium">Engagement Report</span>
              </button>
            )}
          </div>
        </nav>

        {/* --- Sidebar Footer --- */}
        <div className="flex-shrink-0 px-4 pt-2 pb-4 border-t border-[var(--border-subtle)]/50 space-y-1">
          {/* Email */}
          {(currentUser?.email ?? profile?.email) && (
            <div className="flex items-center gap-2 px-4 py-[0.5vh] opacity-70">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-secondary)] flex-shrink-0" />
              <span className="text-[10px] text-[var(--text-secondary)] truncate tracking-wider">
                {currentUser?.email ?? profile?.email}
              </span>
            </div>
          )}
          {/* Membership Status — compact */}
          {membershipInfo && (
            <div className="mx-2 mb-1 p-2.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2">
              {/* One-line header: status · plan · days left */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={cn(
                    "w-2 h-2 rounded-full flex-shrink-0",
                    membershipInfo.type === 'Premium' ? "bg-[var(--accent-primary)]" :
                      membershipInfo.type === 'Trial' ? "bg-orange-400" : "bg-[var(--text-muted)]"
                  )} />
                  <span className="text-[10px] uppercase tracking-[0.16em] font-bold text-[var(--text-primary)] truncate">
                    {membershipInfo.type}{membershipInfo.plan ? ` · ${membershipInfo.plan}` : ''}
                  </span>
                </div>
                {membershipInfo.type === 'Trial' && (
                  <span className="text-[9px] font-bold text-orange-400 uppercase tracking-widest bg-orange-400/10 px-2 py-0.5 rounded-full flex-shrink-0">
                    {membershipInfo.daysLeft}d left
                  </span>
                )}
              </div>

              {/* Compact token pill + upgrade */}
              <div className="flex items-center justify-between gap-2">
                <TrialBadge compact onUpgrade={() => onNavigate('paywall')} />
                {membershipInfo.type !== 'Premium' && (
                  <button
                    onClick={() => onNavigate('paywall')}
                    className="px-3 py-1 rounded-lg border border-[var(--accent-primary)] text-[var(--accent-primary)] text-[9px] font-bold uppercase tracking-[0.16em] hover:bg-[var(--accent-primary)]/10 active:scale-95 transition-all flex-shrink-0"
                  >
                    Upgrade
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Log out / Sign in */}
          {currentUser?.isAnonymous ? (
            <button
              onClick={async () => {
                if (window.confirm('Sign in with Google to save your progress and unlock your full account?')) await signOut();
              }}
              className="w-full flex items-center gap-3 px-4 py-[0.8vh] rounded-xl group hover:bg-[var(--bg-surface)] transition-all"
            >
              <LogIn size={14} className="text-[var(--accent-primary)] group-hover:text-[var(--accent-secondary)] transition-colors flex-shrink-0" />
              <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--accent-primary)] group-hover:text-[var(--text-primary)] font-bold transition-colors font-sans">
                Sign In
              </span>
            </button>
          ) : (
            <button
              onClick={async () => {
                if (window.confirm('Sign out?')) await signOut();
              }}
              className="w-full flex items-center gap-3 px-4 py-[0.8vh] rounded-xl group hover:bg-[var(--bg-surface)] transition-all"
            >
              <LogOut size={14} className="text-[var(--text-secondary)] group-hover:text-rose-400 transition-colors flex-shrink-0" />
              <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] font-bold transition-colors font-sans">
                Log Out
              </span>
            </button>
          )}

          {/* Brand credit — subtle */}
          <div className="px-4 pt-0.5">
            <p className="text-[8px] font-sans not-italic text-[var(--text-muted)] opacity-50 leading-relaxed">
              Designed by{' '}
              <a
                href="https://www.skrmblissai.in/twinsouls"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-90 transition-opacity underline underline-offset-2"
              >
                skrmblissai.in
              </a>
            </p>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className={cn(
        "relative z-10 min-h-screen transition-all duration-500",
        // Mobile: don't shift content when sidebar is open (overlay instead)
        // Desktop: shift content based on collapsed state
        isSidebarCollapsed ? "lg:pl-0" : "lg:pl-[280px]"
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

        {/* ── New-course announcement bar — fixed, full-width, dismissible ── */}
        {showCourseAnnounce && (
          <div
            className={cn(
              "fixed top-0 right-0 z-[120] h-10 flex items-center overflow-hidden transition-all duration-500",
              isSidebarCollapsed ? "left-0" : "left-0 lg:left-[280px]"
            )}
            style={{ background: 'linear-gradient(90deg, #1b1508 0%, #3a2e12 45%, #7a611f 100%)', boxShadow: '0 1px 12px rgba(0,0,0,0.25)' }}
          >
            {/* shimmer sweep (self-contained keyframe) */}
            <style>{`@keyframes annShimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
            <span className="pointer-events-none absolute inset-0 opacity-40" style={{ background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.18) 50%, transparent 70%)', backgroundSize: '200% 100%', animation: 'annShimmer 3.5s linear infinite' }} />
            <a
              href="/feelingsandemotioncourse"
              className="relative flex-1 min-w-0 h-full flex items-center justify-center gap-2 sm:gap-3 px-3 group"
            >
              <span className="hidden sm:inline text-[9px] font-black uppercase tracking-[0.28em] flex items-center gap-1.5 flex-shrink-0" style={{ color: '#C9AE8E' }}>
                <span className="inline-block w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#C9AE8E' }} />
                New Course
              </span>
              <span className="text-[12px] sm:text-[13px] font-semibold truncate" style={{ color: '#F5ECD2' }}>
                <span className="font-bold text-white">Understanding Feelings &amp; Emotions</span>
                <span className="hidden sm:inline" style={{ color: 'rgba(245,236,210,0.7)' }}> — watch the first lessons free</span>
              </span>
              <span
                className="flex items-center gap-1 px-3 sm:px-4 py-1 rounded-full text-[11px] sm:text-[12px] font-black flex-shrink-0 group-hover:brightness-105 transition-all"
                style={{ background: 'linear-gradient(to right, #C9AE8E, #A98A67)', color: '#241C14' }}
              >
                Enroll <span aria-hidden>→</span>
              </span>
            </a>
            <button
              onClick={dismissCourseAnnounce}
              aria-label="Dismiss announcement"
              className="relative flex-shrink-0 w-10 h-full flex items-center justify-center text-white/50 hover:text-white/90 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Premium Ribbon Header Overlay */}
        <header className={cn(
          "fixed left-0 right-0 z-[110] px-6 py-4 flex items-center justify-between bg-white/10 dark:bg-black/20 backdrop-blur-md border-b border-black/5 dark:border-white/5 transition-all duration-500",
          showCourseAnnounce ? "top-10" : "top-0",
          isSidebarCollapsed ? "lg:left-0" : "lg:left-[280px]"
        )}>
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Menu button — only functional on mobile */}
            {isMobile && (
              <button
                onClick={() => {
                  setIsSidebarOpen(true);
                  console.log('[MenuButton] Opened sidebar on mobile');
                }}
                onKeyDown={(e) => {
                  // Ensure keyboard accessibility — close on Escape
                  if (e.key === 'Escape') {
                    setIsSidebarOpen(false);
                  }
                }}
                aria-label="Open navigation menu"
                aria-expanded={isSidebarOpen}
                className="lg:hidden w-10 h-10 rounded-full border border-[var(--border-default)] bg-[var(--bg-surface)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all shadow-xl active:scale-95"
                disabled={!isMobile}
              >
                <Menu size={16} />
              </button>
            )}
            
            {/* Internal Return to Dashboard Button */}
            {activeTab !== 'home' && (
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => { setActiveTab('home'); setActivePractice(null); setIsSidebarOpen(false); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 dark:bg-white/10 border border-black/10 dark:border-white/10 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all hover:bg-[var(--accent-primary)]/10 group"
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                <span className="text-[10px] font-black uppercase tracking-widest">Return</span>
              </motion.button>
            )}
          </div>

          <div className="flex items-center gap-3 sm:gap-5 md:gap-6">
              {/* Achievements — trophy opens the slide-out drawer */}
              <button
                  onClick={() => setAchievementsOpen(true)}
                  aria-label="Achievements"
                  className="relative w-9 h-9 rounded-full flex items-center justify-center bg-[var(--bg-surface)] border border-[var(--border-default)] text-[var(--text-muted)] hover:text-[var(--accent-primary)] hover:border-[var(--accent-primary)]/40 transition-all active:scale-95"
              >
                  <Trophy className="w-4 h-4" />
                  {unlocked.length > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-[var(--accent-primary)] text-black text-[8px] font-black flex items-center justify-center rounded-full border border-[var(--bg-base)]">
                      {unlocked.length}
                    </span>
                  )}
              </button>

              <ThemeToggle />

              <button
                  onClick={() => setActiveTab('profile')}
                  aria-label="Your profile"
                  className={cn(
                      "flex items-center gap-3 px-4 py-2 rounded-xl transition-all relative overflow-hidden",
                      activeTab === 'profile'
                          ? "bg-[var(--accent-primary)] text-black font-bold shadow-lg"
                          : "bg-[var(--bg-surface)] border border-[var(--border-default)] text-[var(--text-muted)] hover:bg-[var(--accent-primary)]/10 hover:text-[var(--text-primary)]"
                  )}
              >
                  <User className={cn("w-4 h-4", activeTab === 'profile' ? "fill-current" : "")} />
                  <span className="text-[10px] font-black tracking-widest uppercase hidden xs:block">Your Journey</span>
              </button>
          </div>
        </header>

        {/* Engagement Report — renders inline, replacing main content */}
        {isReportOpen && (
          <Suspense fallback={<TabFallback />}>
            <EngagementReport isOpen={true} onClose={() => setIsReportOpen(false)} />
          </Suspense>
        )}

        <div className={cn(
          "max-w-7xl mx-auto px-2 pb-28 sm:px-4 md:px-6 lg:pb-8 space-y-6 sm:space-y-8",
          showCourseAnnounce ? "pt-[128px] sm:pt-[136px] md:pt-[144px]" : "pt-[88px] sm:pt-[96px] md:pt-[104px]",
          isReportOpen && "hidden"
        )}>
          <SacredWelcomeModal
            isOpen={welcomeModal.isOpen}
            onClose={() => {
              setWelcomeModal({ isOpen: false, plan: '' });
              window.location.reload();
            }}
            planName={welcomeModal.plan}
            userEmail={currentUser?.email}
          />

          <LeaveMindGymModal
            isOpen={showLeaveMindGymModal}
            onCancel={() => setShowLeaveMindGymModal(false)}
            onConfirm={() => { window.location.href = 'https://www.skrmblissai.in'; }}
          />

          {/* First-run orientation — shows once for new users */}
          <FirstRunWelcome />

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
                    localStorage.setItem('mind-gym-active-tab', 'home');
                    setActiveTab('home');
                  }}
                />
              </motion.div>
            )}

            {activeTab === 'breathe' && (
              <motion.div key="breathe-screen" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <Suspense fallback={<TabFallback />}>
                  <MasterPranayamApp
                    onBack={() => setActiveTab('home')}
                    onComplete={() => setActiveTab('home')}
                  />
                </Suspense>
              </motion.div>
            )}

            {activeTab === 'home' && (
              <>
                {/* ── Greeting + breathing hero — the calm welcome comes first ── */}
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

                {/* ── Daily Meditation Room entry card — aligned with the journey column ── */}
                <div className="mt-4 max-w-2xl mx-auto w-full">
                  <MeditationHomeCard
                    onEnter={() => onNavigate('meditation')}
                    adminOverride={['skrmblissai@gmail.com','shrutikhungar@gmail.com','simkatyal1@gmail.com'].includes(currentUser?.email ?? '')}
                  />
                </div>

                {/* ── Feelings & Emotions — owner's continue-course card ── */}
                {ownsEmotionCourse && (
                  <div className="mt-4 max-w-2xl mx-auto w-full">
                    <button
                      onClick={() => setActiveTab('emotion-course')}
                      className="group relative w-full flex items-center gap-3 sm:gap-4 p-4 sm:p-5 rounded-3xl border text-left overflow-hidden transition-all active:scale-[0.99]"
                      style={{ borderColor: 'rgba(169,138,103,0.45)', background: 'linear-gradient(105deg, rgba(169,138,103,0.12), rgba(169,138,103,0.04))' }}
                    >
                      {/* soft glow */}
                      <div className="absolute -top-14 -right-10 w-40 h-40 rounded-full blur-[60px] pointer-events-none" style={{ background: 'rgba(169,138,103,0.20)' }} />
                      <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center flex-shrink-0 border" style={{ background: 'rgba(169,138,103,0.18)', borderColor: 'rgba(169,138,103,0.4)' }}>
                        <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 dark:text-amber-300" />
                      </div>
                      <div className="relative min-w-0 flex-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-700 dark:text-amber-300">Your Course</p>
                        <p className="text-[15px] sm:text-lg font-bold text-[var(--text-primary)] truncate">Feelings &amp; Emotions</p>
                        <p className="text-[11px] sm:text-xs text-[var(--text-muted)] mt-0.5">Pick up where you left off</p>
                      </div>
                      <span
                        className="relative inline-flex items-center gap-1 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-[11px] sm:text-[12px] font-black flex-shrink-0 shadow group-hover:brightness-105 group-hover:gap-1.5 transition-all"
                        style={{ background: 'linear-gradient(to right, #C9AE8E, #A98A67)', color: '#241C14' }}
                      >
                        Continue <span aria-hidden>→</span>
                      </span>
                    </button>
                  </div>
                )}

                {/* ── Today's Journey — full step cards with artwork ── */}
                <div className="mt-4 max-w-2xl mx-auto w-full">
                  <DashboardGrid
                    userId={currentUser?.uid}
                    progress={progress}
                    weeklyAssignment={weeklyAssignment}
                    onNavigate={onNavigate}
                    isAccessValid={isAccessValid}
                  />
                </div>
              </>
            )}

            {activeTab === 'journey' && (
              <motion.div key="journey" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                <Suspense fallback={<TabFallback />}>
                  <BreathPractice practices={practices} setActivePractice={setActivePractice} />
                </Suspense>
              </motion.div>
            )}

            {activeTab === 'situations' && (
              <motion.div key="situations" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                <Suspense fallback={<TabFallback />}>
                  <SituationalPractices
                    onBack={() => setActiveTab('home')}
                    isAdmin={isAdmin}
                    activeQuestionId={activeQuestionId}
                    onQuestionSelect={setActiveQuestionId}
                    isAccessValid={isAccessValid}
                    onUpgrade={() => setActiveTab('paywall')}
                  />
                </Suspense>
              </motion.div>
            )}

            {activeTab === 'intelligence' && (
              <motion.div key="intelligence" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }}>
                <Suspense fallback={<TabFallback />}>
                  <CoursesHub onCourseSelect={(id) => { if (id) setActiveTab(id); }} />
                </Suspense>
              </motion.div>
            )}

            {activeTab === 'emotion-course' && (
              <motion.div key="emotion-course" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}>
                <Suspense fallback={<TabFallback />}>
                  <EmotionFeelingsCourseView owns={ownsEmotionCourse} adminPreview={isAdmin} onReturn={() => setActiveTab('home')} />
                </Suspense>
              </motion.div>
            )}

            {activeTab === 'music' && (
              <motion.div key="music" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}>
                <Suspense fallback={<TabFallback />}>
                  <MusicHub />
                </Suspense>
              </motion.div>
            )}

            {activeTab === 'videos' && (
              <motion.div key="videos" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}>
                <Suspense fallback={<TabFallback />}>
                  <VideosHub
                    isAccessValid={isAccessValid}
                    isPremiumUser={isPremiumUser}
                    deductTokens={deductTokens}
                    onUpgrade={() => setActiveTab('paywall')}
                  />
                </Suspense>
              </motion.div>
            )}

            {/* ── PRACTICE · TODAY (the daily ritual) ── */}
            {activeTab === 'today' && (
              <motion.div key="today" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <Suspense fallback={<TabFallback />}>
                  <PracticePathView
                    onOpenVirtues={() => onNavigate('virtues')}
                    onOpenPractices={() => onNavigate('practices')}
                    onOpenSixfold={() => onNavigate('virtues')}
                    onOpenJournal={() => onNavigate('chapters')}
                    onOpenTab={(tab, qid) => onNavigate(tab, qid, qid ? 'explanation' : undefined)}
                    weeklyQuestionId={weeklyAssignment?.questionId}
                    weeklyLabel={weeklyAssignment?.weekLabel}
                    onOpenQuestion={(qid) => onNavigate('wisdom_untethered', qid, 'explanation')}
                  />
                </Suspense>
              </motion.div>
            )}

            {/* ── PRACTICE · PRACTICE LIBRARY ── */}
            {activeTab === 'practices' && (
              <motion.div key="practices" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <Suspense fallback={<TabFallback />}>
                  <PracticesTab />
                </Suspense>
              </motion.div>
            )}

            {/* ── PRACTICE · VIRTUES ── */}
            {activeTab === 'virtues' && (
              <motion.div key="virtues" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <Suspense fallback={<TabFallback />}>
                  <VirtuesView />
                </Suspense>
              </motion.div>
            )}

            {/* ── PRACTICE · INSIGHTS ── */}
            {activeTab === 'insights' && (
              <motion.div key="insights" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <Suspense fallback={<TabFallback />}>
                  <CircleView mode="insight" />
                </Suspense>
              </motion.div>
            )}

            {/* ── PRACTICE · QUESTIONS ── */}
            {activeTab === 'questions' && (
              <motion.div key="questions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <Suspense fallback={<TabFallback />}>
                  <CircleView mode="question" />
                </Suspense>
              </motion.div>
            )}

            {/* ── PRACTICE · BACKUP ── */}
            {activeTab === 'backup' && (
              <motion.div key="backup" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <Suspense fallback={<TabFallback />}>
                  <BackupView />
                </Suspense>
              </motion.div>
            )}

            {/* ── COMMUNITY · THE CIRCLE (Everyone) ── */}
            {activeTab === 'circle' && (
              <motion.div key="circle" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <Suspense fallback={<TabFallback />}>
                  <CircleView />
                </Suspense>
              </motion.div>
            )}

            {/* ── COMMUNITY · MEMBERS ── */}
            {activeTab === 'members' && (
              <motion.div key="members" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <Suspense fallback={<TabFallback />}>
                  <MembersView />
                </Suspense>
              </motion.div>
            )}

            {/* ── COMMUNITY · CALENDAR ── */}
            {activeTab === 'calendar' && (
              <motion.div key="calendar" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <Suspense fallback={<TabFallback />}>
                  <CalendarView
                    userEmail={currentUser?.email ?? undefined}
                    onEnterSession={() => onNavigate('meditation')}
                  />
                </Suspense>
              </motion.div>
            )}

            {/* ── DAILY MEDITATION ROOM ── */}
            {activeTab === 'meditation' && currentUser && (
              <motion.div key="meditation" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="h-full overflow-y-auto">
                <Suspense fallback={<TabFallback />}>
                  <MeditationFeature
                    user={currentUser}
                    adminOverride={['skrmblissai@gmail.com','shrutikhungar@gmail.com','simkatyal1@gmail.com'].includes(currentUser?.email ?? '')}
                    onRoomStateChange={(inRoom) => setIsSidebarCollapsed(inRoom)}
                  />
                </Suspense>
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
              <Suspense fallback={<TabFallback />}>
                <WisdomUntetheredCourse
                  activeQuestionId={activeQuestionId}
                  viewMode={viewMode}
                  setViewMode={setViewMode}
                  onOpenJournal={() => setActiveTab('chapters')}
                  onNavigateToPractice={() => setActiveTab('situations')}
                  onReturn={() => setActiveTab('dashboard')}
                  onNavigateToQuestion={(id) => setActiveQuestionId(id)}
                />
              </Suspense>
            </motion.div>
          )}
        </AnimatePresence>


        <div className="max-w-7xl mx-auto p-6 md:p-12 space-y-12">
          <AnimatePresence mode="wait">
            {activeTab === 'chapters' && (
              <motion.div key="chapters" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <Suspense fallback={<TabFallback />}>
                  <Journal
                    isAccessValid={isAccessValid}
                    onUpgrade={() => setActiveTab('paywall')}
                  />
                </Suspense>
              </motion.div>
            )}

            {activeTab === 'stats' && (
              <motion.div key="stats" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }}>
                <Suspense fallback={<TabFallback />}>
                  <div className="space-y-6">
                    <YearPanel />
                    <StatsDashboard
                      onNavigate={onNavigate}
                    />
                  </div>
                </Suspense>
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
                          <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-[var(--accent-primary)]">Level {user.level} · {points} Points</p>
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

                    {currentUser?.isAnonymous ? (
                      <AnchorButton variant="ghost" onClick={async () => {
                        if (window.confirm('Sign in with Google to save your progress and unlock your full account?')) await signOut();
                      }} className="!w-auto !px-10 text-[var(--accent-primary)] hover:text-[var(--accent-secondary)] transition-colors">
                        <LogIn className="w-4 h-4 mr-2" /> Sign In
                      </AnchorButton>
                    ) : (
                      <AnchorButton variant="ghost" onClick={signOut} className="!w-auto !px-10 text-[var(--text-muted)] hover:text-rose-400 transition-colors">
                        <LogOut className="w-4 h-4 mr-2" /> Sign Out
                      </AnchorButton>
                    )}
                  </div>
                </header>

                {/* Stats & badges live on the Progress tab to avoid duplication.
                    Profile is your account + settings only. */}

                {/* Account Settings */}
                <div className="p-6 sm:p-8 rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-surface)] space-y-8">
                  <h3 className="text-xl font-serif font-light text-[var(--text-primary)] border-b border-[var(--border-subtle)] pb-4">Settings</h3>

                  <div className="pt-2">
                    <div className="space-y-4 max-w-sm">
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
                            a.download = `mind-gym-journal-${new Date().toISOString().split('T')[0]}.json`;
                            a.click();
                          }}
                          className="w-full px-6 py-4 rounded-xl bg-[var(--bg-surface-hover)] border border-[var(--border-default)] text-[11px] font-bold uppercase tracking-widest text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all flex items-center justify-center gap-3"
                        >
                          <Download size={14} /> Download Journal Export
                        </button>
                      </div>
                      <p className="text-[10px] text-[var(--text-muted)] italic leading-relaxed">
                        Your entries export as a JSON file you can keep. Your data stays safely backed up in the cloud.
                      </p>
                    </div>
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      {/* EngagementReport is now rendered inline in the main content area above */}
      <AchievementToast
        achievement={toastQueue[0] || null}
        onDismiss={dismissToast}
      />
      <TokenToast />
      <AchievementsDrawer
        open={achievementsOpen}
        onClose={() => setAchievementsOpen(false)}
        unlocked={unlocked}
        points={points}
      />
      {/* Floating Dock
          These three tools — the guide, the Watcher's Pause and the sound
          toggle — used to sit on screen as three permanent circles. Stacked
          with the chat launcher and the social FAB that made five floating
          buttons down the right edge, which read as clutter rather than as
          tools. They collapse into ONE button now and expand on tap; the
          dock stays open until it is dismissed, so using two in a row does
          not mean opening it twice.                                        */}
      <div className={cn(
        "fixed right-3 sm:right-6 z-[100] flex flex-col items-center gap-3 sm:gap-4 transition-all duration-500",
        // Hide these floating actions completely when inside the full-screen Meditation Room
        (activeTab === 'meditation' && isSidebarCollapsed) ? "opacity-0 pointer-events-none scale-90 translate-x-10" : "opacity-100 scale-100 translate-x-0",
        // On mobile: bottom-20 so stack clears the sticky 64px nav bar; on desktop keep existing offsets
        musicUrl
          ? "bottom-28 sm:bottom-24"
          : "bottom-20 sm:bottom-12"
      )}>
        {/* Voice Guidance Avatar */}
        {dockOpen && voiceGuidanceEnabled && (
          <VoiceGuidance
            preferredVoice={preferredVoice}
            activeTab={activeTab}
            isAccessValid={isAccessValid}
            assignment={weeklyAssignment}
            bottomOffset={0}
            isInline
          />
        )}

        {/* Presence Hub — hide on mobile to reduce clutter */}
        {dockOpen && (
        <div className="hidden sm:flex flex-col gap-3 sm:gap-4">
          <WatcherPauseButton />
        </div>
        )}
        {dockOpen && (
        <button
            onClick={toggleAudio}
            className={cn(
              "p-4 rounded-full backdrop-blur-3xl border transition-all flex items-center justify-center group overflow-hidden shadow-2xl relative",
              isAudioEnabled
                ? "bg-[var(--accent-primary)]/10 border-[var(--accent-primary)]/30 text-[var(--accent-primary)] shadow-[0_0_30px_var(--glow-primary)]"
                : "bg-[var(--bg-surface)] border-[var(--border-default)]/60 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--text-primary)]/20 hover:shadow-[0_0_20px_rgba(184,151,58,0.15)]"
            )}
            title={isAudioEnabled ? "Voice Guidance Active" : "Enable Voice Guidance"}
          >
            {isAudioEnabled ? (
              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 bg-[var(--accent-primary)]/20 blur-xl"
              />
            ) : (
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
            <Headphones className={cn("w-5 h-5 relative z-10 transition-transform", isAudioEnabled ? "animate-pulse" : "group-hover:scale-110")} />
          </button>
        )}

        {/* The one button that is always there. It reports activity while
            collapsed, so nothing running out of sight goes unnoticed. */}
        <button
          onClick={() => setDockOpen((o) => !o)}
          aria-expanded={dockOpen}
          aria-label={dockOpen ? 'Hide tools' : 'Show tools'}
          className={cn(
            "p-3.5 rounded-full backdrop-blur-3xl border transition-all flex items-center justify-center shadow-2xl relative",
            dockOpen
              ? "bg-[var(--bg-surface)] border-[var(--border-default)] text-[var(--text-primary)] rotate-90"
              : "bg-[var(--accent-primary)]/10 border-[var(--accent-primary)]/30 text-[var(--accent-primary)]"
          )}
        >
          {!dockOpen && isAudioEnabled && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[var(--accent-primary)] ring-2 ring-[var(--bg-primary)]" />
          )}
          {dockOpen
            ? <X className="w-5 h-5" />
            : <Sparkles className="w-5 h-5" />}
        </button>
      </div>
      <PhonePromptModal />
      <MusicMiniPlayer />

      {/* ── Mobile bottom navigation — thumb-reachable core tabs (hidden on desktop) ── */}
      {!(activeTab === 'meditation' && isSidebarCollapsed) && activeTab !== 'wisdom_untethered' && (
        <nav
          className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex items-stretch justify-around border-t border-[var(--border-subtle)] bg-[var(--bg-primary)]/95 backdrop-blur-xl"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          {[
            { id: 'home', icon: Home, label: 'Home' },
            { id: 'situations', icon: Flame, label: 'Practice' },
            { id: 'chapters', icon: BookOpen, label: 'Journal' },
            { id: 'stats', icon: BarChart2, label: 'Progress' },
            { id: 'profile', icon: User, label: 'You' },
          ].map(({ id, icon: Icon, label }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => onNavigate(id)}
                className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 active:scale-95 transition-transform"
                style={{ color: active ? 'var(--accent-primary)' : 'var(--text-muted)' }}
                aria-label={label}
                aria-current={active ? 'page' : undefined}
              >
                <Icon size={20} strokeWidth={active ? 2.4 : 1.8} />
                <span className="text-[9px] font-bold uppercase tracking-wider">{label}</span>
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
}
