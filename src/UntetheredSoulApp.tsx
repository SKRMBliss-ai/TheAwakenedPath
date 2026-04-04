import { useState } from 'react';

import { Flame, Sun, BookOpen, BarChart2, X, Lock, MessageCircle, Target, Sparkles, Heart, Volume2, Youtube, User, LogOut, Clock, Eye, Wind, ArrowLeft } from 'lucide-react';
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
import { isAdminEmail, hasWisdomAccess } from './config/admin';
import { useAchievements } from './features/achievements/useAchievements';
import { GlassShape } from './components/ui/GlassShape';
import { VoiceService } from './services/voiceService';
import { useEffect } from 'react';
import { AwakenedPathLogo } from './components/ui/AwakenedPathLogo';

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

            {/* SACRED PATHS GRID */}
            <div className="grid grid-cols-3 gap-4 mb-12">
                {[
                    { id: 'learn', label: 'Learn', sub: 'WISDOM', icon: Sparkles, color: '#ABCEC9', delay: 0, variant: 'orb' },
                    { id: 'practice', label: 'Practice', sub: 'PRESENCE', icon: Flame, color: '#C65F9D', delay: 0.1, variant: 'pulse' },
                    { id: 'progress', label: 'Progress', sub: 'GROWTH', icon: BarChart2, color: '#9575CD', delay: 0.2, variant: 'chart' }
                ].map((item: any) => (
                    <motion.button
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: item.delay, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        onClick={() => onNavigate(item.id)}
                        className="group relative flex flex-col items-center gap-3 p-5 rounded-[2.5rem] bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--accent-primary)]/30 transition-all duration-700 hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)] overflow-hidden active:scale-[0.98]"
                    >
                        {/* Animated Glow Backdrop */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-1000 bg-gradient-to-br from-[var(--accent-primary)] via-transparent to-transparent" />
                        
                        <div className="relative w-16 h-16 flex-shrink-0">
                            <GlassShape
                                variant={item.variant as any}
                                icon={item.icon}
                                color={item.color}
                                className="w-full h-full transform transition-transform duration-700 group-hover:scale-110 group-hover:rotate-6"
                            />
                        </div>

                        <div className="text-center">
                            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-[var(--accent-primary)] opacity-60 mb-1 block">
                                {item.sub}
                            </span>
                            <h3 className="text-lg font-serif font-light text-[var(--text-primary)] transition-transform duration-500">
                                {item.label}
                            </h3>
                        </div>
                    </motion.button>
                ))}
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
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[var(--accent-primary)] to-[#ABCEC9] p-[1px] shadow-[0_0_30px_rgba(171,206,201,0.2)]">
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
                            className="h-full rounded-full bg-gradient-to-r from-[var(--accent-primary)] to-[#ABCEC9] relative"
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
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-[#ABCEC9]">
                        <span>Aligned Resonance</span>
                        <span>72%</span>
                    </div>
                    <div className="h-2 bg-[#ABCEC9]/5 rounded-full overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: "72%" }}
                            className="h-full bg-gradient-to-r from-[#ABCEC9]/40 to-[#ABCEC9] shadow-[0_0_15px_rgba(171,206,201,0.3)]"
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
        streak: 3, 
        points: points || 0
    };
    const lastEntry = null;

    useEffect(() => {
        VoiceService.init();
    }, []);

    const onNavigate = (id: string, questionId?: string, view?: string) => {
        if (id === 'learn') {
             setActiveTab('learn');
             setActiveCourseId(null);
             return;
        }
        if (id === 'journey' || id === 'stats' || id === 'progress') {
            setActiveTab('journey');
            return;
        }
        if (id === 'situations' || id === 'practice') {
            setActiveTab('practice');
            return;
        }
        if (id === 'reflect' || id === 'journal') {
            setActiveTab('journal');
            return;
        }
        setActiveTab(id);
        if (questionId) setActiveQuestionId(questionId);
        if (view) setViewMode(view as any);
        if (window.innerWidth < 1024) setIsSidebarOpen(false);
    };

    const [expandedChapter1, setExpandedChapter1] = useState(true);

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
                {isAdmin && (
                    <button className="flex items-center gap-2.5 px-6 py-2 rounded-full border border-red-500/50 bg-red-500/5 text-red-500 transition-all hover:bg-red-500/10">
                        <Youtube size={14} className="fill-current" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] mt-[1px]">Studio</span>
                    </button>
                )}

                {/* Theme Toggle */}
                <ThemeToggle />

                {/* Voice Guidance Icon */}
                <button className="w-10 h-10 rounded-full border border-[var(--border-default)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--text-secondary)] transition-all">
                    <Volume2 size={18} />
                </button>
            </div>
            
            <ThemeToggle className="lg:hidden fixed top-6 right-6 z-[60]" />
            
            {/* SIDEBAR */}
            <aside className={cn(
                "fixed left-0 top-0 bottom-0 w-[280px] flex-col z-[60] bg-[var(--bg-secondary)] backdrop-blur-3xl border-r border-[var(--border-default)] p-8 pt-10 transition-transform duration-500 ease-fluid",
                "lg:flex lg:translate-x-0",
                isSidebarOpen ? "translate-x-0 flex" : "-translate-x-full lg:flex"
            )}>
                <div className="flex items-center justify-between mb-8 px-2">
                    <AwakenedPathLogo
                        variant="full"
                        size="sm"
                        animated={true}
                        onClick={() => { setActiveTab('today'); setActiveCourseId(null); }}
                        className="group"
                    />
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-[var(--text-muted)]">
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex flex-col gap-0.5">
                    {[
                        { id: 'today', icon: Sun, label: 'Dashboard' },
                        { id: 'courses_group', icon: Sparkles, label: 'Courses', isGroup: true, subItems: [
                            { id: 'learn', label: 'THE POWER OF NOW', courseId: null },
                            { id: 'learn', label: 'WISDOM UNTETHERED', courseId: 'wisdom_untethered', locked: !hasWisdomAccess(user?.email) },
                        ]},
                        { id: 'journal', icon: BookOpen, label: 'Journal' },
                        { id: 'practice', icon: Flame, label: 'Situations' },
                        { id: 'journey', icon: BarChart2, label: 'Progress' },
                        { id: 'profile', icon: User, label: 'Profile' },
                    ].map((item: any) => {
                        if (item.isGroup) {
                            const Icon = item.icon;
                            return (
                                <div key={item.id} className="flex flex-col gap-0.5 my-0.5">
                                    <div className="flex items-center gap-3 px-5 py-1.5 opacity-60">
                                        <Icon size={14} className="text-[var(--text-muted)]" />
                                        <span className="text-[9px] uppercase tracking-[0.4em] font-bold text-[var(--text-muted)]">
                                            {item.label}
                                        </span>
                                    </div>
                                    <div className="flex flex-col ml-[2.75rem] gap-0 relative before:content-[''] before:absolute before:left-[-1.25rem] before:top-2 before:bottom-2 before:w-px before:bg-[var(--border-subtle)]/30">
                                        {item.subItems.map((sub: any) => {
                                            const isActive = activeTab === sub.id && activeCourseId === sub.courseId;
                                            return (
                                                <div key={sub.label} className="flex flex-col">
                                                    <button
                                                        onClick={() => {
                                                            if (sub.locked) return;
                                                            setActiveTab(sub.id);
                                                            setActiveCourseId(sub.courseId);
                                                            if (window.innerWidth < 1024) setIsSidebarOpen(false);
                                                        }}
                                                        className={cn(
                                                            "w-full flex items-center gap-3 px-3 py-1 transition-all duration-300 relative group rounded-l-xl text-left",
                                                        )}
                                                    >
                                                        {isActive && (
                                                            <motion.div
                                                                layoutId="sidebar-accent"
                                                                className="absolute inset-0 bg-gradient-to-r from-[var(--accent-primary)]/10 to-transparent pointer-events-none rounded-l-xl"
                                                            />
                                                        )}
                                                        <span className={cn(
                                                            "text-[9px] uppercase tracking-[0.25em] transition-colors duration-300 font-sans font-bold relative z-10 w-full",
                                                            isActive ? "text-[var(--text-primary)]" : "text-[var(--text-muted)] group-hover:text-[var(--text-primary)]"
                                                        )}>
                                                            {sub.label}
                                                            {sub.locked && <Lock size={8} className="inline-block ml-2 opacity-50" />}
                                                        </span>
                                                    </button>

                                                    {/* Wisdom Untethered Questions */}
                                                    {isActive && sub.courseId === 'wisdom_untethered' && (
                                                        <div className="flex flex-col mt-0 ml-1 border-l border-[var(--border-subtle)]/30 overflow-hidden">
                                                            <button
                                                                onClick={() => setExpandedChapter1(!expandedChapter1)}
                                                                className="flex justify-between items-center w-full px-4 py-0.5 text-[8px] uppercase tracking-widest text-[var(--text-primary)] font-bold transition-all"
                                                            >
                                                                <span>Chapter 1: The Mind</span>
                                                                <span className={cn(
                                                                    "text-[8px] text-[var(--accent-primary)] transition-transform duration-300 mr-2",
                                                                    expandedChapter1 ? "rotate-90" : "rotate-0"
                                                                )}>▶</span>
                                                            </button>

                                                            <AnimatePresence>
                                                                {expandedChapter1 && (
                                                                    <motion.div
                                                                        initial={{ height: 0, opacity: 0 }}
                                                                        animate={{ height: 'auto', opacity: 1 }}
                                                                        exit={{ height: 0, opacity: 0 }}
                                                                        className="flex flex-col overflow-hidden"
                                                                    >
                                                                        {[
                                                                            { id: 'question1', label: '1. Mind as tool' },
                                                                            { id: 'question2', label: '2. Narration' },
                                                                            { id: 'question3', label: '3. Cosmic pause' },
                                                                            { id: 'question4', label: '4. Clarity' }
                                                                        ].map((q) => (
                                                                            <button
                                                                                key={q.id}
                                                                                onClick={() => setActiveQuestionId(q.id)}
                                                                                className={cn(
                                                                                    "flex items-center gap-2 pl-6 pr-4 py-1.5 text-[8px] uppercase tracking-widest transition-all text-left",
                                                                                    activeQuestionId === q.id
                                                                                        ? "text-[var(--accent-primary)] font-bold"
                                                                                        : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                                                                                )}
                                                                            >
                                                                                <div className={cn(
                                                                                    "w-1 h-1 rounded-full",
                                                                                    activeQuestionId === q.id ? "bg-[var(--accent-primary)] shadow-[0_0_8px_var(--accent-primary)]" : "bg-transparent"
                                                                                )} />
                                                                                <span className="flex-1">{q.label}</span>
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

                        const isActive = (activeTab === item.id && (item.id !== 'learn' || !activeCourseId));
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActiveTab(item.id);
                                    setActiveCourseId(null);
                                    if (window.innerWidth < 1024) setIsSidebarOpen(false);
                                }}
                                className={cn(
                                    "w-full flex items-center gap-4 px-5 py-2.5 transition-all duration-300 relative group rounded-xl",
                                    isActive ? "bg-[var(--accent-primary)]/5" : "hover:bg-[var(--bg-surface-hover)]"
                                )}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="nav-active-pill"
                                        className="absolute inset-0 bg-[var(--accent-primary)]/5 rounded-xl border border-[var(--accent-primary)]/20"
                                    />
                                )}
                                <Icon
                                    size={16}
                                    className={cn(
                                        "transition-all duration-300 relative z-10",
                                        isActive ? "text-[var(--accent-primary)] fill-[var(--accent-primary)]/20" : "text-[var(--text-muted)] group-hover:text-[var(--text-primary)]"
                                    )}
                                />
                                <span className={cn(
                                    "text-[10px] uppercase tracking-[0.3em] transition-colors duration-300 font-bold relative z-10 mt-0.5",
                                    isActive ? "text-[var(--text-primary)]" : "text-[var(--text-muted)] group-hover:text-[var(--text-primary)]"
                                )}>
                                    {item.label}
                                </span>
                                {isActive && (
                                    <motion.div
                                        layoutId="nav-active-dot-main"
                                        className="absolute right-4 w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] shadow-[0_0_8px_var(--accent-primary)] z-10"
                                    />
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* Sidebar Footer */}
                <div className="mt-auto pt-8 border-t border-[var(--border-subtle)] space-y-4">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]/50">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] animate-pulse shadow-[0_0_8px_var(--accent-primary)]" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] truncate">{user?.email}</span>
                    </div>
                    <button onClick={() => signOut()} className="flex items-center gap-4 px-5 py-3 text-[var(--text-muted)] hover:text-red-400 transition-all w-full group rounded-xl hover:bg-red-400/5">
                        <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Sign Out</span>
                    </button>
                </div>
            </aside>

            <main className="lg:ml-64 pt-24 pb-32 min-h-screen">
                <AnimatePresence mode="wait">
                    {activeTab === 'today' && (
                        <motion.div key="today" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}}>
                            <TodayScreen user={user} stats={stats} lastEntry={lastEntry} onNavigate={onNavigate} />
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
            {/* Floating WhatsApp Widget */}
            <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3">
                <a 
                    href="https://wa.me/+918217581238?text=I+would+like+to+request+a+feature+or+report+a+technical+issue." 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group flex items-center justify-center w-14 h-14 bg-green-600 text-white rounded-full shadow-lg hover:shadow-[0_4px_20px_rgba(22,163,74,0.4)] transition-all duration-300 hover:scale-110"
                >
                    <span className="absolute right-full mr-4 text-[11px] font-bold text-white bg-black/80 backdrop-blur-md px-4 py-2 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl border border-white/10">
                        Request a feature / Report technical issue
                    </span>
                    <MessageCircle className="w-6 h-6" />
                </a>
            </div>
        </div>
    );
};

export default UntetheredApp;
