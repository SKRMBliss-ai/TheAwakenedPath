import { useState, useEffect, useMemo, useCallback } from 'react';
import { Flame, Sparkles, Sun, Play, BookOpen, User, BarChart2, ArrowLeft, Clock, Menu, Heart, X, Lock, Headphones, LogOut, Mail, MessageCircle, Youtube, Moon, Zap, Target } from 'lucide-react';
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

function getDominantEmotionColor(emotionsStr?: string) {
  if (!emotionsStr) return null;
  const emotions = emotionsStr.split(', ').map(e => e.trim().toUpperCase());
  for (const e of emotions) {
    if (EMOTION_MAP[e]) return EMOTION_MAP[e];
  }
  return null;
}

// --- Screens ---

const TodayScreen = ({ user, stats, lastEntry, onNavigate }: {
    user: any;
    stats: any;
    lastEntry: any;
    onNavigate: (tab: string) => void;
}) => {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    return (
        <div className="max-w-2xl mx-auto space-y-8 pb-20">
            {/* Compact greeting + streak */}
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-serif italic text-[var(--text-muted)]">
                        {greeting},
                    </p>
                    <h1 className="text-2xl font-serif font-light text-[var(--text-primary)]">
                        {user.displayName}
                    </h1>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                    <Flame size={14} className="text-amber-400" />
                    <span className="text-[11px] font-bold text-[var(--text-secondary)]">
                        {stats.streak} days
                    </span>
                </div>
            </div>

            {/* DAILY PRACTICE */}
            <DailyPresenceCheck 
                userId={user.uid} 
                onNavigateToCourse={() => onNavigate('learn')} 
            />

            {/* QUICK ACTIONS ROW */}
            <div className="grid grid-cols-3 gap-3">
                <button onClick={() => onNavigate('learn')}
                    className="p-4 rounded-xl text-center transition-all hover:scale-[1.02] bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                    <BookOpen size={20} className="mx-auto mb-2 text-[#ABCEC9]" />
                    <p className="text-[11px] font-bold text-[var(--text-primary)]">Learn</p>
                    <p className="text-[8px] uppercase tracking-wider mt-0.5 text-[var(--text-muted)]">Courses</p>
                </button>
                <button onClick={() => onNavigate('practice')}
                    className="p-4 rounded-xl text-center transition-all hover:scale-[1.02] bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                    <Flame size={20} className="mx-auto mb-2 text-[#C65F9D]" />
                    <p className="text-[11px] font-bold text-[var(--text-primary)]">Practice</p>
                    <p className="text-[8px] uppercase tracking-wider mt-0.5 text-[var(--text-muted)]">Meditate</p>
                </button>
                <button onClick={() => onNavigate('journey')}
                    className="p-4 rounded-xl text-center transition-all hover:scale-[1.02] bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                    <BarChart2 size={20} className="mx-auto mb-2 text-[#9575CD]" />
                    <p className="text-[11px] font-bold text-[var(--text-primary)]">Progress</p>
                    <p className="text-[8px] uppercase tracking-wider mt-0.5 text-[var(--text-muted)]">History</p>
                </button>
            </div>

            {/* LAST REFLECTION */}
            {lastEntry && (
                <button onClick={() => onNavigate('practice')}
                    className="w-full flex items-center gap-3 p-3.5 rounded-xl text-left transition-all bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-[0_0_8px_rgba(var(--app-emotion-color-rgb),0.4)]"
                        style={{ 
                            background: getDominantEmotionColor(lastEntry.emotions) || 'var(--accent-primary)',
                        }} />
                    <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-serif italic truncate text-[var(--text-secondary)]">
                            \"{lastEntry.thoughts}\"
                        </p>
                        <p className="text-[9px] uppercase tracking-wider font-bold mt-0.5 text-[var(--text-muted)]">
                            {lastEntry.emotions}
                        </p>
                    </div>
                    <X size={14} className="text-[var(--text-muted)]" />
                </button>
            )}
        </div>
    );
};

const PracticeScreen = () => {
    const [tab, setTab] = useState<'meditations' | 'journal'>('meditations');
    return (
        <div className="max-w-5xl mx-auto px-6">
            <div className="flex gap-2 mb-6">
                {(['meditations', 'journal'] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)}
                        className="px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all"
                        style={{
                            background: tab === t ? 'var(--accent-primary)' : 'var(--bg-surface)',
                            color: tab === t ? 'white' : 'var(--text-muted)',
                            border: tab === t ? 'none' : '1px solid var(--border-subtle)',
                        }}>
                        {t === 'meditations' ? 'Meditations' : 'Journal'}
                    </button>
                ))}
            </div>
            {tab === 'meditations' ? (
                <SituationalPractices onBack={() => {}} isAdmin={true} />
            ) : (
                <Journal />
            )}
        </div>
    );
};

const UntetheredApp = () => {
    const { user, loading } = useAuth();
    const [activeTab, setActiveTab] = useState('today');
    const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
    const [activeQuestionId, setActiveQuestionId] = useState('question1');
    const [viewMode, setViewMode] = useState<'explanation' | 'practice' | 'video' | 'progress'>('explanation');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const stats = { streak: 0 };
    const lastEntry = null;

    if (loading) return null;
    if (!user) return <SignInScreen />;

    const isAdmin = isAdminEmail(user.email);

    return (
        <div className="min-h-screen w-full bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans selection:bg-[var(--accent-primary)]/30">
            <GlobalSparkles />
            <NoiseOverlay />
            <LivingBlobs />
            <ThemeToggle className="fixed top-6 right-6 z-[60]" />
            
            {/* Sidebar toggle for courses */}
            {activeTab === 'learn' && activeCourseId === 'wisdom_untethered' && (
                <button 
                  onClick={() => setIsSidebarOpen(true)}
                  className="fixed top-6 left-6 z-[60] p-3 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xl hover:scale-105 transition-all text-[var(--text-primary)]"
                >
                  <Menu size={20} />
                </button>
            )}

            {/* Sidebar Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsSidebarOpen(false)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
                        />
                        <motion.aside
                            initial={{ x: -300 }}
                            animate={{ x: 0 }}
                            exit={{ x: -2300 }}
                            className="fixed top-0 left-0 h-full w-80 bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] z-[101] p-8 shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-12">
                                <span className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40">The Journey</span>
                                <button onClick={() => setIsSidebarOpen(false)}><X size={18} /></button>
                            </div>
                            
                            <div className="space-y-2">
                                {[
                                    { id: 'question1', label: '1. Mind as a Tool' },
                                    { id: 'question2', label: '2. The Witness' },
                                    { id: 'question3', label: '3. Cosmic Pause' },
                                    { id: 'question4', label: '4. Achieving Clarity' }
                                ].map((q) => {
                                    const isLocked = !isAdmin && q.id === 'question4'; // Explicitly check for admin for Q4 if needed
                                    return (
                                        <button 
                                            key={q.id}
                                            disabled={isLocked}
                                            onClick={() => { setActiveQuestionId(q.id); setViewMode('explanation'); setIsSidebarOpen(false); }}
                                            className={cn(
                                                "w-full p-4 rounded-2xl text-left border transition-all flex items-center justify-between",
                                                activeQuestionId === q.id 
                                                    ? "bg-[var(--accent-primary)]/10 border-[var(--accent-primary)]/40 text-[var(--accent-primary)]" 
                                                    : "bg-transparent border-transparent hover:bg-[var(--bg-surface-hover)] hover:border-[var(--border-subtle)] text-[var(--text-secondary)]",
                                                isLocked && "opacity-40 cursor-not-allowed"
                                            )}
                                        >
                                            <span className="text-[13px] font-medium">{q.label}</span>
                                            {isLocked && <Lock size={12} />}
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            <main className="pt-24 pb-32">
                <AnimatePresence mode="wait">
                    {activeTab === 'today' && (
                        <motion.div key="today" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}}>
                            <TodayScreen user={user} stats={stats} lastEntry={lastEntry} onNavigate={(t) => {
                                if (t === 'learn') setActiveTab('learn');
                                else if (t === 'practice') setActiveTab('practice');
                                else if (t === 'journey') setActiveTab('journey');
                                else if (t === 'journal') setActiveTab('journal');
                            }} />
                        </motion.div>
                    )}
                    {activeTab === 'learn' && (
                        <motion.div key="learn" initial={{opacity:0, scale:0.98}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:1.02}}>
                            {!activeCourseId ? (
                                <CoursesHub onCourseSelect={setActiveCourseId} />
                            ) : activeCourseId === 'wisdom_untethered' ? (
                                <WisdomUntetheredCourse 
                                    activeQuestionId={activeQuestionId}
                                    viewMode={viewMode}
                                    setViewMode={setViewMode}
                                    onOpenJournal={() => setActiveTab('journal')}
                                    onNavigateToPractice={() => setActiveTab('practice')}
                                />
                            ) : null}
                        </motion.div>
                    )}
                    {activeTab === 'practice' && (
                        <motion.div key="practice" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}}>
                            <PracticeScreen />
                        </motion.div>
                    )}
                    {activeTab === 'journal' && (
                        <motion.div key="journal" initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:1.1}}>
                            <div className="max-w-5xl mx-auto px-6">
                                <Journal />
                            </div>
                        </motion.div>
                    )}
                    {activeTab === 'journey' && (
                        <motion.div key="journey" initial={{opacity:0, filter:'blur(10px)'}} animate={{opacity:1, filter:'blur(0px)'}} exit={{opacity:0}}>
                            <StatsDashboard />
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Navigation Bar */}
            <nav className="fixed bottom-0 left-0 w-full h-20 bg-[var(--bg-surface)] backdrop-blur-2xl border-t border-[var(--border-subtle)] flex items-center justify-center p-2 z-50">
                <div className="flex w-full max-w-lg gap-1">
                    {[
                        { id: 'today', icon: Sun, label: 'Today' },
                        { id: 'learn', icon: BookOpen, label: 'Learn' },
                        { id: 'practice', icon: Flame, label: 'Practice' },
                        { id: 'journal', icon: MessageCircle, label: 'Journal' },
                        { id: 'journey', icon: Target, label: 'Journey' }
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => { setActiveTab(item.id); if (item.id !== 'learn') setActiveCourseId(null); }}
                            className={cn(
                                "flex-1 flex flex-col items-center justify-center gap-1.5 py-2 rounded-2xl transition-all duration-300",
                                activeTab === item.id ? "text-[var(--accent-primary)] bg-[var(--accent-primary)]/5" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                            )}
                        >
                            <item.icon size={20} className={activeTab === item.id ? "fill-[var(--accent-primary)]/20" : ""} />
                            <span className="text-[9px] uppercase tracking-[0.2em] font-bold font-sans">{item.label}</span>
                        </button>
                    ))}
                </div>
            </nav>
        </div>
    );
};

export default UntetheredApp;
