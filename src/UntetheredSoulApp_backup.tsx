import { useState } from 'react';

import { Flame, Sun, BookOpen, BarChart2, Menu, X, Lock, MessageCircle, Target, Sparkles, Heart, Volume2, Youtube, User, LogOut, Clock, Eye, Wind } from 'lucide-react';
import { TodayPath } from './features/practices/TodayPath';
import LivingBlobs from './components/ui/LivingBlobs';
import { CoursesHub } from './features/courses/CoursesHub';
import { WisdomUntetheredCourse } from './features/courses/WisdomUntetheredCourse';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from './lib/utils';
import Journal from './features/journal/components/Journal';
import StatsDashboard from './features/stats/StatsDashboard';
import { SituationalPractices } from './features/practices/SituationalPractices';
import { useAuth } from './features/auth/AuthContext';
import { AwakenStage } from './components/ui/SacredCircle';
import { SignInScreen } from './features/auth/SignInScreen';
import { NoiseOverlay } from './components/ui/SacredUI';
import { GlobalSparkles } from './components/ui/GlobalSparkles';
import { ThemeToggle } from './theme/ThemeSystem';
import { isAdminEmail } from './config/admin';
import { useAchievements } from './features/achievements/useAchievements';

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
    onNavigate: (tab: string, questionId?: string, view?: string) => void;
}) => {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    return (
        <div className="max-w-4xl mx-auto space-y-12 pb-20 px-6">
            {/* TOP EXPERIENCE: Branding + Sacred Circle + Status Bar */}
            <div className="flex flex-col items-center justify-center pt-12 text-center space-y-10">
                <div className="space-y-4">
                    <h2 className="text-[12px] font-medium uppercase tracking-[0.6em] text-[var(--text-muted)] animate-fade-in opacity-80">
                        {greeting},
                    </h2>
                    <h1 className="text-[28px] font-light tracking-[0.4em] text-[var(--text-primary)] uppercase">
                        skrmbliss <span className="text-[var(--accent-primary)] font-bold">ai</span>
                    </h1>
                </div>

                <div className="relative">
                    <AwakenStage size="xl" variant="A" isAnimating />
                </div>

                {/* Status Bar: Flow & Streak */}
                <div className="flex items-center gap-0 px-8 py-3.5 rounded-full bg-[var(--bg-surface)]/30 border border-[var(--border-subtle)] backdrop-blur-2xl transition-all hover:bg-[var(--bg-surface)]/50">
                    <div className="flex items-center gap-3 pr-8 border-r border-[var(--border-subtle)]">
                        <Heart size={16} className="text-[#C65F9D] fill-[#C65F9D]/20 animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--text-primary)]">
                            Presence
                        </span>
                    </div>
                    <div className="flex items-center gap-3 px-8 border-r border-[var(--border-subtle)]">
                        <Flame size={16} className="text-amber-400 fill-amber-400/20" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--text-primary)]">
                            {stats.streak} {stats.streak === 1 ? 'Day' : 'Days'}
                        </span>
                    </div>
                    <div className="flex items-center gap-3 pl-8">
                        <Sparkles size={16} className="text-[#ABCEC9] fill-[#ABCEC9]/20" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--text-primary)]">
                            {stats.points} Points
                        </span>
                    </div>
                </div>

            </div>

            {/* YOUR PATH TODAY */}
            <div className="max-w-2xl mx-auto w-full">
                <TodayPath
                    userId={user?.uid}
                    onNavigate={(tab, questionId, view) => {
                        onNavigate(tab, questionId, view);
                    }}
                />
            </div>

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

const ProfileScreen = ({ user, stats }: { user: any; stats: any }) => {
    return (
        <div className="max-w-4xl mx-auto pt-8 pb-24 space-y-8 px-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Identity & Level Header */}
            <div className="relative p-10 rounded-[3rem] overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-surface)] backdrop-blur-3xl shadow-2xl">
                <div className="absolute top-0 right-0 p-8">
                    <div className="px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center gap-2">
                        <Flame size={14} className="text-amber-500 fill-amber-500/20" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">{stats.streak} DAY STREAK</span>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[var(--accent-primary)] to-[#C65F9D] p-[1px] shadow-[0_0_30px_rgba(var(--app-accent-rgb),0.2)]">
                        <div className="w-full h-full rounded-full bg-[var(--bg-surface)] flex items-center justify-center overflow-hidden">
                             <User size={40} className="text-[var(--accent-primary)] opacity-40" />
                        </div>
                    </div>
                    
                    <div className="flex-1 text-center md:text-left space-y-2">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--accent-primary)] mb-2">Sacred Identity</h2>
                        <h1 className="text-4xl font-serif font-light text-[var(--text-primary)] leading-tight italic">
                            The Awakened {user?.displayName?.split(' ')[0] || 'Seeker'}
                        </h1>
                        <p className="text-[var(--text-muted)] text-sm font-medium opacity-60 tracking-wide">{user?.email}</p>
                    </div>
                </div>

                {/* Level Progress */}
                <div className="mt-12 space-y-4">
                    <div className="flex justify-between items-end">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)]">Journey Level</p>
                            <p className="text-2xl font-serif text-[var(--text-primary)]">Level 5 <span className="text-xs text-[var(--text-muted)] font-sans uppercase tracking-[0.2em] ml-2 opacity-50">/ Awakener</span></p>
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">{stats.points} / 1000 Presence XP</p>
                    </div>
                    <div className="h-3 bg-[var(--border-subtle)]/50 rounded-full overflow-hidden p-[1px]">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (stats.points / 1000) * 100)}%` }}
                            transition={{ duration: 1.5, ease: "circOut" }}
                            className="h-full rounded-full bg-gradient-to-r from-[var(--accent-primary)] to-[#C65F9D] relative"
                        >
                            <div className="absolute inset-0 bg-white/20 animate-pulse" />
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Core Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Moments in Now", val: 42, icon: Clock, color: "#ABCEC9" },
                    { label: "Seeing My Thoughts", val: 145, icon: Eye, color: "#C65F9D" },
                    { label: "Inner Stillness", val: 87, icon: Wind, color: "#9575CD" },
                ].map(stat => (
                    <div key={stat.label} className="p-8 rounded-[2rem] bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex flex-col items-center justify-center gap-4 group hover:border-[var(--accent-primary)]/30 transition-all duration-500">
                        <div className="w-12 h-12 rounded-2xl bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] flex items-center justify-center group-hover:scale-110 transition-transform duration-500" style={{ color: stat.color }}>
                            <stat.icon size={20} className="opacity-60 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-serif text-[var(--text-primary)] mb-1">{stat.val}</div>
                            <div className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)]">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Energy Alignment Card */}
            <div className="relative p-10 rounded-[3rem] overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
                <div className="flex items-center gap-6 mb-8">
                    <div className="w-14 h-14 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-500/20">
                        <Heart className="w-6 h-6 fill-rose-500/20" />
                    </div>
                    <div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] mb-1">Energy Alignment</h3>
                        <p className="text-xl font-serif text-[var(--text-primary)] italic">Heart • Mind • Body Balance</p>
                    </div>
                </div>
                
                <div className="space-y-4">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-rose-400">
                        <span>Aligned Resonance</span>
                        <span>72%</span>
                    </div>
                    <div className="h-2 bg-rose-500/5 rounded-full overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: "72%" }}
                            className="h-full bg-gradient-to-r from-rose-500/40 to-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.3)]"
                        />
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)] opacity-60 leading-relaxed font-medium">
                        Your inner energies are finding harmony. Continue your daily witnessing to deepen the alignment between your thoughts and the space of your heart.
                    </p>
                </div>
            </div>
        </div>
    );
};

const UntetheredApp = () => {
    const { user, loading, signOut } = useAuth();
    const { points } = useAchievements();
    const [activeTab, setActiveTab] = useState('today');
    const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
    const [activeQuestionId, setActiveQuestionId] = useState('question1');
    const [viewMode, setViewMode] = useState<'explanation' | 'video' | 'practice' | 'progress'>('explanation');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const stats = { 
        streak: 3, // Placeholder or fetch from daily overview
        points: points || 0
    };
    const lastEntry = null;

    if (loading) return null;
    if (!user) return <SignInScreen />;

    const isAdmin = isAdminEmail(user.email);

    return (
        <div className="min-h-screen w-full bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans selection:bg-[var(--accent-primary)]/30">
            <GlobalSparkles />
            <NoiseOverlay />
            <LivingBlobs />
            <div className="hidden lg:flex fixed top-0 right-0 left-64 h-20 items-center justify-end px-10 gap-6 z-[60] backdrop-blur-xl bg-[var(--bg-primary)]/50 border-b border-[var(--border-subtle)]">
                {/* Studio Button */}
                <button className="flex items-center gap-2.5 px-6 py-2 rounded-full border border-red-500/50 bg-red-500/5 text-red-500 transition-all hover:bg-red-500/10">
                    <Youtube size={14} className="fill-current" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] mt-[1px]">Studio</span>
                </button>

                {/* Theme Toggle */}
                <ThemeToggle />

                {/* Voice Guidance Icon */}
                <button className="w-10 h-10 rounded-full border border-[var(--border-default)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--text-secondary)] transition-all">
                    <Volume2 size={18} />
                </button>
            </div>
            
            <ThemeToggle className="lg:hidden fixed top-6 right-6 z-[60]" />
            
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
                                            onClick={() => { setActiveQuestionId(q.id); setIsSidebarOpen(false); }}
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


            {/* Desktop Navigation Sidebar (Left) */}
            <div className="hidden lg:flex fixed left-0 top-0 h-full w-64 flex-col py-10 bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] backdrop-blur-2xl z-[50] px-6">
                {/* Dashboard Button */}
                <button
                    onClick={() => { setActiveTab('today'); setActiveCourseId(null); }}
                    className={cn(
                        "group flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 relative group mb-4",
                        activeTab === 'today' ? "bg-[var(--accent-primary)]/10 text-[var(--text-primary)]" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)]"
                    )}
                >
                    <Sun size={18} className={cn("transition-transform group-hover:rotate-12", activeTab === 'today' ? "text-[var(--accent-primary)] fill-[var(--accent-primary)]/20 shadow-[0_0_10px_var(--accent-primary)]" : "")} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.25em] mt-0.5">Dashboard</span>
                    
                    {activeTab === 'today' && (
                        <>
                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] shadow-[0_0_8px_var(--accent-primary)]" />
                            <div className="absolute right-0 top-1.5 bottom-1.5 w-[2px] bg-[var(--accent-primary)] rounded-full" />
                        </>
                    )}
                </button>
                
                <div className="flex flex-col gap-10">
                    {/* Courses Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 px-4 text-[var(--text-muted)]">
                            <Sparkles size={16} className="opacity-70" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-70">Courses</span>
                        </div>
                        <div className="flex flex-col gap-1 pl-12 pr-4">
                            <button 
                                onClick={() => { setActiveTab('learn'); setActiveCourseId(null); }}
                                className={cn(
                                    "text-[10px] font-bold uppercase tracking-[0.25em] text-left py-2.5 transition-all whitespace-nowrap", 
                                    activeTab === 'learn' && !activeCourseId ? "text-[var(--accent-primary)]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                                )}
                            >
                                THE POWER OF NOW
                            </button>
                            <button 
                                onClick={() => { setActiveTab('learn'); setActiveCourseId('wisdom_untethered'); }}
                                className={cn(
                                    "text-[10px] font-bold uppercase tracking-[0.25em] text-left py-2.5 transition-all whitespace-nowrap", 
                                    activeCourseId === 'wisdom_untethered' ? "text-[var(--accent-primary)]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                                )}
                            >
                                WISDOM UNTETHERED
                            </button>
                            
                            {/* Wisdom Untethered Sub-navigation (Classic Look) */}
                            {activeCourseId === 'wisdom_untethered' && (
                                <div className="flex flex-col gap-1 mt-2 mb-4 border-l border-[var(--border-subtle)] pl-4">
                                     <div className="py-1">
                                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] opacity-50">Chapter 1</span>
                                     </div>
                                     {[
                                         { id: 'question1', label: 'Q1. Mind as a Tool' },
                                         { id: 'question2', label: 'Q2. The Witness' },
                                         { id: 'question3', label: 'Q3. Cosmic Pause' },
                                         { id: 'question4', label: 'Q4. Clarity' }
                                     ].map((q) => (
                                         <button
                                             key={q.id}
                                             onClick={() => setActiveQuestionId(q.id)}
                                             className={cn(
                                                 "text-[10px] font-medium tracking-wider text-left py-2 transition-all uppercase",
                                                 activeQuestionId === q.id 
                                                     ? "text-[var(--accent-primary)] font-bold" 
                                                     : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                                             )}
                                         >
                                             {q.label}
                                         </button>
                                     ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Main Actions */}
                    <div className="flex flex-col gap-5">
                        {[
                            { id: 'journal', icon: BookOpen, label: 'Journal' },
                            { id: 'practice', icon: Flame, label: 'Situations' },
                            { id: 'journey', icon: BarChart2, label: 'Progress' },
                            { id: 'profile', icon: User, label: 'Profile' }
                        ].map(item => (
                            <button
                                key={item.id}
                                onClick={() => { setActiveTab(item.id); if (item.id !== 'learn') setActiveCourseId(null); }}
                                className={cn(
                                    "group flex items-center gap-4 px-4 py-3.5 transition-all duration-300 relative",
                                    activeTab === item.id ? "text-[var(--text-primary)]" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                                )}
                            >
                                <item.icon size={18} className={cn(
                                    "transition-all duration-300",
                                    activeTab === item.id ? "scale-110 text-[var(--text-primary)]" : "group-hover:scale-105"
                                )} />
                                <span className={cn(
                                    "text-[10px] uppercase tracking-[0.25em] font-bold transition-colors",
                                    activeTab === item.id ? "text-[var(--text-primary)]" : ""
                                )}>{item.label}</span>
                                
                                {activeTab === item.id && (
                                    <>
                                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] shadow-[0_0_8px_var(--glow-primary)]" />
                                        <div className="absolute right-0 top-1.5 bottom-1.5 w-[2px] bg-[var(--accent-primary)] rounded-full" />
                                    </>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Sidebar Footer: User Info & Log Out */}
                <div className="mt-auto pt-8 border-t border-[var(--border-subtle)]/50">
                    <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-xl bg-[var(--accent-primary)]/5 border border-[var(--accent-primary)]/10">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] shadow-[0_0_8px_var(--accent-primary)]" />
                        <span className="text-[9px] font-bold text-[var(--text-muted)] truncate tracking-widest">{user?.email}</span>
                    </div>
                    
                    <button 
                        onClick={() => signOut()}
                        className="flex items-center gap-4 px-4 py-3 rounded-xl text-[var(--text-muted)] hover:text-red-400 hover:bg-red-400/5 transition-all w-full group"
                    >
                        <LogOut size={16} className="transition-transform group-hover:-translate-x-1" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Log Out</span>
                    </button>
                    
                    <div className="mt-8 px-2 pb-2 opacity-50">
                         <p className="text-[8px] font-medium text-[var(--text-muted)] italic mb-1 uppercase tracking-tighter">Journey Shared by</p>
                         <p className="text-[10px] font-black tracking-tighter text-[var(--text-secondary)] mb-4 italic uppercase">Soulful Intelligence Studio</p>
                         <div className="flex items-center gap-4">
                             <a href="https://www.youtube.com/@SoulfulIntelligenceStudio" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-widest hover:text-red-500 transition-colors">
                                 <Youtube size={10} /> YouTube
                             </a>
                             <a href="https://www.skrmblissai.in/twinsouls" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-widest hover:text-[var(--text-primary)] transition-colors">
                                 <Heart size={10} /> twin souls
                             </a>
                         </div>
                    </div>
                </div>
            </div>

            <main className="lg:ml-64 pt-24 pb-32 min-h-screen">
                <AnimatePresence mode="wait">
                    {activeTab === 'today' && (
                        <motion.div key="today" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}}>
                            <TodayScreen user={user} stats={stats} lastEntry={lastEntry} onNavigate={(tab, questionId) => {
                                if (questionId) setActiveQuestionId(questionId);
                                setActiveTab(tab);
                                setIsSidebarOpen(false);
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
                            <div className="max-w-5xl mx-auto px-6">
                                <PracticeScreen />
                            </div>
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
                            <div className="max-w-5xl mx-auto px-6">
                                <StatsDashboard />
                            </div>
                        </motion.div>
                    )}
                    {activeTab === 'profile' && (
                        <motion.div key="profile" initial={{opacity:0, scale:0.98}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:1.02}}>
                            <ProfileScreen user={user} stats={stats} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Mobile Navigation Bar */}
            <nav className="lg:hidden fixed bottom-0 left-0 w-full h-20 bg-[var(--bg-surface)] backdrop-blur-2xl border-t border-[var(--border-subtle)] flex items-center justify-center p-2 z-50">
                <div className="flex w-full max-w-lg gap-1">
                    {[
                        { id: 'today', icon: Sun, label: 'Dashboard' },
                        { id: 'learn', icon: BookOpen, label: 'Courses' },
                        { id: 'practice', icon: Flame, label: 'Situations' },
                        { id: 'journal', icon: MessageCircle, label: 'Journal' },
                        { id: 'journey', icon: Target, label: 'Progress' },
                        { id: 'profile', icon: User, label: 'Profile' }
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
