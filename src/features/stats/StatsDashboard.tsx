import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Activity, 
    Shield, 
    MapPin, 
    TrendingUp, 
    History,
    Zap,
    BarChart2, 
    Check, 
    BookOpen, 
    Compass, 
    ChevronDown 
} from 'lucide-react';
import PracticeLedger from './PracticeLedger';
import PastReflections from './PastReflections';
import { useAuth } from '../auth/AuthContext';
import { db } from '../../firebase';
import { collection, query, getDocs, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { useAchievements } from '../achievements/useAchievements';
import { AchievementsPanel } from '../achievements/AchievementsPanel';
import { isAdminEmail, isMonitoredEmail } from '../../config/admin';
import { InfoTooltip } from '../../components/ui/InfoTooltip';
import { QUESTION_IDS } from '../practices/practiceLibrary';


interface ActivityLog {
    id: string;
    userEmail: string;
    activityType: string;
    details: string;
    location?: string;
    timestamp: any;
}

interface StatMetric {
    name: string;
    count: number;
    color?: string;
}

// ─── Sub-components ───

const MiniBar = ({ value, max, color }: { value: number; max: number; color?: string }) => {
    const pct = max > 0 ? (value / max) * 100 : 0;
    return (
        <div className="h-2 flex-1 rounded-full bg-[var(--border-default)] overflow-hidden shadow-inner">
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full rounded-full shadow-sm"
                style={{
                    background: color || 'var(--accent-secondary)',
                    boxShadow: `0 0 10px ${color || 'var(--accent-secondary)'}40`
                }}
            />
        </div>
    );
};

const StreakGrid = ({ days }: { days: number[] }) => {
    // Group into 4 weeks of 7 days
    const columns = 7;
    const weeks = [];
    for (let i = 0; i < days.length; i += columns) {
        weeks.push(days.slice(i, i + columns));
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const dayOffset = (startOfToday.getDay() + 6) % 7;
    const currentMonday = new Date(startOfToday);
    currentMonday.setDate(startOfToday.getDate() - dayOffset);

    const getWeekRange = (widx: number) => {
        // widx 0 is 3 weeks ago Monday, widx 3 is current Monday
        const weekMonday = new Date(currentMonday);
        weekMonday.setDate(currentMonday.getDate() - ((3 - widx) * 7));
        const weekSunday = new Date(weekMonday);
        weekSunday.setDate(weekMonday.getDate() + 6);
        
        const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return `${fmt(weekMonday)} – ${fmt(weekSunday)}`;
    };

    return (
        <div className="flex flex-col gap-3.5">
            {weeks.map((week, widx) => {
                const rangeLabel = getWeekRange(widx);
                return (
                    <div key={widx} className="flex items-center gap-4">
                        <span className="w-24 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] text-right opacity-60">
                            {rangeLabel}
                        </span>
                        <div className="flex gap-2.5">
                            {week.map((active, i) => {
                                // Calculate the actual date for this cell to find "Today"
                                const cellDate = new Date(currentMonday);
                                cellDate.setDate(currentMonday.getDate() - ((3 - widx) * 7) + i);
                                const isToday = cellDate.getTime() === startOfToday.getTime();
                                
                                return (
                                    <div
                                        key={i}
                                        className={`w-[18px] h-[18px] rounded-sm transition-all duration-500 relative`}
                                        style={{
                                            background: active
                                                ? 'var(--accent-secondary-dim)'
                                                : isToday 
                                                    ? 'transparent'
                                                    : 'var(--border-subtle)',
                                            border: active
                                                ? '1.5px solid var(--accent-secondary)'
                                                : isToday
                                                    ? '1.5px dashed var(--accent-secondary)'
                                                    : '1.5px solid var(--border-default)',
                                            boxShadow: active ? '0 0 8px var(--accent-secondary)40' : 'none',
                                        }}
                                        title={`${isToday ? "Today" : cellDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: ${active ? "Aware" : "No Activity"}`}
                                    >
                                        {isToday && !active && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-1 h-1 rounded-full bg-[var(--accent-secondary)] animate-pulse" />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

interface StatsDashboardProps {
  onNavigate?: (tab: string, questionId?: string, view?: 'explanation' | 'video' | 'practice') => void;
  accountCreatedAt?: string | null;
}

const StatsDashboard: React.FC<StatsDashboardProps> = ({ onNavigate }) => {
    const { user } = useAuth();
    const [ponProgress, setPonProgress] = useState({ watched: 0, total: 30 });
    const [wuProgress, setWuProgress] = useState({ explored: 0, total: QUESTION_IDS.length });
    const [weeklyActivity, setWeeklyActivity] = useState<{ 
        total: number; 
        learn: string[]; 
        practice: string[]; 
        reflect: string[]; 
        live: string[]; 
    }[]>(Array.from({ length: 7 }, () => ({ total: 0, learn: [], practice: [], reflect: [], live: [] })));
    const [emotionFreq, setEmotionFreq] = useState<StatMetric[]>([]);
    const [distortionFreq, setDistortionFreq] = useState<StatMetric[]>([]);
    const [bodyFreq, setBodyFreq] = useState<StatMetric[]>([]);
    const [streakDays, setStreakDays] = useState<number[]>(new Array(28).fill(0));


    const [adminLogs, setAdminLogs] = useState<ActivityLog[]>([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { unlocked, points, awardEvent, checkAndUnlock } = useAchievements();

    useEffect(() => {
        awardEvent('stats_viewed');
    }, [awardEvent]);

    useEffect(() => {
        if (isAdminEmail(user?.email)) {
            setIsAdmin(true);
            fetchAdminLogs();
        }

        fetchUserStats();
    }, [user, checkAndUnlock]);

    const fetchUserStats = async () => {
        if (!user) return;
        setIsLoading(true);

        try {
            const journalRef = collection(db, 'users', user.uid, 'journal');
            const situationalRef = collection(db, 'users', user.uid, 'situational-logs');
            const journeyRef = collection(db, 'users', user.uid, 'journey');
            const practicesRef = collection(db, 'users', user.uid, 'dailyPractices');

            const [journalSnap, situationalSnap, journeySnap, practicesSnap] = await Promise.all([
                getDocs(journalRef),
                getDocs(situationalRef),
                getDocs(journeyRef),
                getDocs(practicesRef)
            ]);

            interface ActivityData {
                source: string;
                createdAt?: { toDate: () => Date };
                timestamp?: { toDate: () => Date };
                date?: string;
                emotions?: string | string[];
                cognitiveDistortion?: string;
                bodyArea?: string;
                [key: string]: any;
            }

            const allActivityDocs: ActivityData[] = [
                ...journalSnap.docs.map(d => ({ ...(d.data() as any), source: 'journal' })),
                ...situationalSnap.docs.map(d => ({ ...(d.data() as any), source: 'situational' })),
                ...journeySnap.docs.map(d => ({ ...(d.data() as any), source: 'journey' })),
                ...practicesSnap.docs.flatMap(d => {
                    const data = d.data();
                    const date = d.id; // YYYY-MM-DD
                    const entries: any[] = [];
                    
                    Object.entries(data).forEach(([qid, rec]: [string, any]) => {
                        if (qid === 'anySituationalDone') return;

                        // Granular grouping for Singer's categories
                        const isLiveId = qid === 'question1' || qid === 'question3' || qid === 'question6' || qid === 'question7';

                        if (rec.learnCompleted) entries.push({ source: 'practice', date, milestone: 'learn', questionId: qid, title: 'Quest Lesson' });
                        if (rec.reflectCompleted) entries.push({ source: 'practice', date, milestone: 'reflect', questionId: qid, title: 'Reflection' });
                        if (rec.completed) entries.push({ source: 'practice', date, milestone: isLiveId ? 'live' : 'practice', questionId: qid, title: isLiveId ? 'Live Practice' : 'Daily Practice' });
                        if (rec.integrateCompleted) entries.push({ source: 'practice', date, milestone: 'integrate', questionId: qid, title: 'Integration' });
                    });
                    
                    // Record situational engagements from the summary flag
                    if (data.anySituationalDone === true) {
                        entries.push({ source: 'practice', date, milestone: 'live', type: 'situational', title: 'Life Practice' });
                    }
                    return entries;
                })
            ];

            const now = new Date();
            const oneDay = 24 * 60 * 60 * 1000;

            // Calculate start of current week (Monday)
            const startOfToday = new Date(now);
            startOfToday.setHours(0, 0, 0, 0);
            const dayOffset = (now.getDay() + 6) % 7; // 0 for Mon, 6 for Sun
            const startOfWeek = new Date(startOfToday);
            startOfWeek.setDate(startOfToday.getDate() - dayOffset);

            const activity = Array.from({ length: 7 }, () => ({ 
                total: 0, 
                learn: [] as string[], 
                practice: [] as string[], 
                reflect: [] as string[], 
                live: [] as string[] 
            }));
            const streakArr = new Array(28).fill(0);
            const emMap: Record<string, number> = {};
            const distMap: Record<string, number> = {};
            const bodyMap: Record<string, number> = {};

            allActivityDocs.forEach(item => {
                let date: Date;
                if (item.createdAt?.toDate) date = item.createdAt.toDate();
                else if (item.timestamp?.toDate) date = item.timestamp.toDate();
                else if (item.date) date = new Date(item.date);
                else return;

                const dayIndex = (date.getDay() + 6) % 7;

                // Weekly activity (Current Calendar Week only)
                const todayIndex = (now.getDay() + 6) % 7;
                if (date >= startOfWeek && date <= now) {
                    if (dayIndex >= 0 && dayIndex <= todayIndex) {
                        const dayData = activity[dayIndex];
                        const title = item.title || (item.activityId ? item.activityId.split('-').pop() : (item.questionId ? `Q${item.questionId.split('q').pop()}` : null)) || 'Untitled';
                        
                        if (item.source === 'practice') {
                            if (item.type === 'situational' || item.milestone === 'live') {
                                dayData.live.push(title);
                                dayData.total++;
                            } else if (item.milestone === 'learn') {
                                dayData.learn.push(title);
                                dayData.total++;
                            } else if (item.milestone === 'practice' || item.milestone === 'integrate') {
                                dayData.practice.push(title);
                                dayData.total++;
                            } else if (item.milestone === 'reflect') {
                                dayData.reflect.push(title);
                                dayData.total++;
                            }
                        } else if (item.source === 'journal') {
                            dayData.reflect.push(item.title || 'Journal Entry');
                            dayData.total++;
                        } else if (item.source === 'situational' || item.type === 'situational') {
                            dayData.live.push(item.title || 'Live Resonance');
                            dayData.total++;
                        } else if (item.source === 'journey') {
                            // If it's a generic journey activity, count it based on how we want to group it
                            dayData.total++;
                            dayData.practice.push(item.title || 'Journey Engagement');
                        }
                    }
                }

                // 28-day calendar-aligned streak
                const startOfTodayGrid = new Date(now);
                startOfTodayGrid.setHours(0, 0, 0, 0);
                const gridDayOffset = (startOfTodayGrid.getDay() + 6) % 7;
                const gridMonday = new Date(startOfTodayGrid);
                gridMonday.setDate(startOfTodayGrid.getDate() - gridDayOffset);
                const gridStart = new Date(gridMonday);
                gridStart.setDate(gridMonday.getDate() - 21);

                const entryDay = new Date(date);
                entryDay.setHours(0, 0, 0, 0);
                const gridDiffTime = entryDay.getTime() - gridStart.getTime();
                const gridDiffDays = Math.floor(gridDiffTime / oneDay);

                if (gridDiffDays >= 0 && gridDiffDays < 28) {
                    streakArr[gridDiffDays] = 1;
                }

                // Analytics
                if (item.emotions) {
                    const ems = typeof item.emotions === 'string' ? item.emotions.split(', ') : Array.isArray(item.emotions) ? item.emotions : [];
                    ems.forEach((e: string) => { if (e) emMap[e] = (emMap[e] || 0) + 1; });
                }
                if (item.cognitiveDistortion) distMap[item.cognitiveDistortion] = (distMap[item.cognitiveDistortion] || 0) + 1;
                if (item.bodyArea) bodyMap[item.bodyArea] = (bodyMap[item.bodyArea] || 0) + 1;
            });

            setWeeklyActivity(activity);
            setStreakDays(streakArr);

            let currentPowerWatched = 0;
            const powerSnap = await getDoc(doc(db, 'users', user.uid, 'progress', 'powerOfNow'));
            if (powerSnap.exists()) {
                currentPowerWatched = powerSnap.data().watched?.length || 0;
            }
            setPonProgress({ watched: currentPowerWatched, total: 30 });

            // Fetch Wisdom Untethered Progress
            const wuSnap = await getDoc(doc(db, 'users', user.uid, 'courseProgress', 'wisdom-untethered'));
            if (wuSnap.exists()) {
                const data = wuSnap.data();
                const exploredCount = QUESTION_IDS.filter(qId => {
                    const qp = data[qId];
                    return qp?.read || qp?.video || qp?.practice;
                }).length;
                setWuProgress({ explored: exploredCount, total: QUESTION_IDS.length });
            }

            // Sort and set analytics
            const sortMap = (map: Record<string, number>) =>
                Object.entries(map)
                    .map(([name, count]) => ({ name, count }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5);

            setEmotionFreq(sortMap(emMap));
            setDistortionFreq(sortMap(distMap));
            setBodyFreq(sortMap(bodyMap));

            // Check for new achievements
            const streakCount = (() => {
                let s = 0;
                for (let i = streakArr.length - 1; i >= 0; i--) {
                    if (streakArr[i]) s++;
                    else if (i < streakArr.length - 1) break;
                }
                return s;
            })();

            checkAndUnlock({
                journalEntries: journalSnap.size,
                situationalPractices: situationalSnap.size,
                journeyActivities: journeySnap.size,
                videosWatched: currentPowerWatched,
                chaptersComplete: 0, // Should calculate this properly if needed
                currentStreak: streakCount,
                maxStreak: streakCount,
                panicUsed: 0,
                bodyTruthTests: 0,
                voiceWitnessed: 0,
                remindersEnabled: false,
                statsViewed: 1,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAdminLogs = async () => {
        const logsRef = collection(db, 'activity_logs');
        const q = query(logsRef, orderBy('timestamp', 'desc'), limit(15));
        const snapshot = await getDocs(q);
        const logs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as ActivityLog[];

        const filteredLogs = logs.filter((log: ActivityLog) => isMonitoredEmail(log.userEmail));

        setAdminLogs(filteredLogs);
    };



    const maxEmotion = Math.max(...emotionFreq.map(e => e.count), 1);
    const maxDistortion = Math.max(...distortionFreq.map(d => d.count), 1);
    const maxBody = Math.max(...bodyFreq.map(b => b.count), 1);


    if (isLoading) {
        return (
            <div className="w-full h-64 flex items-center justify-center">
                <p className="text-[var(--text-muted)] italic animate-pulse">Gathering your resonance...</p>
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            <div className="flex flex-col gap-4 border-b border-[var(--border-subtle)] pb-8">
                <div className="space-y-1.5">
                    <h2 className="text-[48px] font-sans font-bold text-[var(--text-primary)] tracking-tighter leading-tight">
                        {ponProgress.watched}/{ponProgress.total} Chapters
                    </h2>
                    <p className="text-[13px] font-sans font-bold text-[var(--text-muted)] opacity-40 uppercase tracking-[0.3em]">
                        Your Collective Awakening Journey
                    </p>
                </div>
            </div>

            <div className="space-y-16">
                {/* ── Intelligence / Analytics Section ── */}
                <section className="space-y-12">
                    <div className="flex items-center gap-3">
                        <Zap className="w-5 h-5 text-[var(--accent-primary)]" />
                        <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-[var(--text-muted)]">Intelligence & Momentum</h3>
                    </div>


            {/* ── Compact Mastery Overview (Expandable on Hover) ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* PON Mastery */}
                <motion.div 
                    whileHover={{ scale: 1.01 }}
                    className="group relative p-4 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-elevated)] transition-all duration-300 cursor-default overflow-hidden"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                                <BookOpen className="w-5 h-5 text-indigo-400" />
                            </div>
                            <div>
                                <h4 className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Power of Now</h4>
                                <p className="text-lg font-serif text-[var(--text-primary)]">{ponProgress.watched}/{ponProgress.total} <span className="text-xs text-[var(--text-secondary)] font-sans">Chapters</span></p>
                            </div>
                        </div>
                        <ChevronDown className="w-4 h-4 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    
                    {/* Hover Expansion Area */}
                    <div className="max-h-0 group-hover:max-h-40 transition-all duration-500 ease-in-out opacity-0 group-hover:opacity-100 pt-0 group-hover:pt-4 overflow-hidden">
                        <div className="space-y-3 border-t border-[var(--border-subtle)] pt-4">
                            <div className="flex justify-between items-end text-[11px]">
                                <span className="text-[var(--text-muted)]">Living Study Mastery</span>
                                <span className="text-indigo-400 font-bold">{Math.round((ponProgress.watched / ponProgress.total) * 100)}% Complete</span>
                            </div>
                            <div className="h-1.5 w-full bg-[var(--border-subtle)] rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    whileInView={{ width: `${(ponProgress.watched / ponProgress.total) * 100}%` }}
                                    className="h-full bg-indigo-500"
                                />
                            </div>
                            <button 
                                onClick={() => onNavigate?.('power_of_now')}
                                className="w-full py-2 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-[10px] font-bold uppercase tracking-wider text-indigo-400 transition-colors"
                            >
                                Continue Study
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* WU Mastery */}
                <motion.div 
                    whileHover={{ scale: 1.01 }}
                    className="group relative p-4 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-elevated)] transition-all duration-300 cursor-default overflow-hidden"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                                <Compass className="w-5 h-5 text-amber-400" />
                            </div>
                            <div>
                                <h4 className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Wisdom Untethered</h4>
                                <p className="text-lg font-serif text-[var(--text-primary)]">{wuProgress.explored}/{wuProgress.total} <span className="text-xs text-[var(--text-secondary)] font-sans">Questions</span></p>
                            </div>
                        </div>
                        <ChevronDown className="w-4 h-4 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    {/* Hover Expansion Area */}
                    <div className="max-h-0 group-hover:max-h-40 transition-all duration-500 ease-in-out opacity-0 group-hover:opacity-100 pt-0 group-hover:pt-4 overflow-hidden">
                        <div className="space-y-3 border-t border-[var(--border-subtle)] pt-4">
                            <div className="flex justify-between items-end text-[11px]">
                                <span className="text-[var(--text-muted)]">Singer Study Mastery</span>
                                <span className="text-amber-400 font-bold">{Math.round((wuProgress.explored / wuProgress.total) * 100)}% Complete</span>
                            </div>
                            <div className="h-1.5 w-full bg-[var(--border-subtle)] rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    whileInView={{ width: `${(wuProgress.explored / wuProgress.total) * 100}%` }}
                                    className="h-full bg-amber-500"
                                />
                            </div>
                            <button 
                                onClick={() => onNavigate?.('wisdom_untethered')}
                                className="w-full py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-[10px] font-bold uppercase tracking-wider text-amber-400 transition-colors"
                            >
                                Resume Inquiry
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
            <div className="border-b border-[var(--border-subtle)] pb-6">
                <div className="flex justify-between items-center">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-serif font-light text-[var(--text-primary)]">Your Journey Report</h2>
                    </div>
                </div>
            </div>

            {/* Activity Summary Card */}
            <div className="p-7 rounded-[24px] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-lg" >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Weekly Chart */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <BarChart2 className="w-4 h-4 text-[var(--accent-secondary)]" />
                                <h4 className="text-[12px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.15em]">Weekly Momentum</h4>
                                <InfoTooltip 
                                    title="Weekly Momentum" 
                                    description="Each bar represents your total engagements per day. Reach 4 for a full bar; go beyond for 'Surge' energy." 
                                />
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-0.5 bg-[var(--accent-primary)] opacity-50 border-t border-dashed" />
                                    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tighter">Target (4)</span>
                                </div>
                                <span className="text-[12px] text-[var(--text-secondary)] font-medium">
                                    {(() => {
                                        const now = new Date();
                                        const day = now.getDay();
                                        const monday = new Date(now);
                                        monday.setDate(now.getDate() - ((day + 6) % 7));
                                        const sunday = new Date(monday);
                                        sunday.setDate(monday.getDate() + 6);
                                        const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                        return `${fmt(monday)} – ${fmt(sunday)}`;
                                    })()}
                                </span>
                            </div>
                        </div>

                        <div className="relative h-48 flex items-end justify-between px-2 gap-2 pt-8">
                            {/* Daily Target Goal Line (4 Practices) */}
                            <div className="absolute inset-x-0 border-b border-dashed border-white/20 z-0 pointer-events-none" 
                                 style={{ bottom: `${(4 / Math.max(4.5, ...weeklyActivity.map(a => a.total))) * 100}%` }}>
                                <span className="absolute right-0 -top-3.5 text-[7px] font-bold text-white/30 uppercase tracking-widest bg-[var(--bg-surface-default)] px-1">Goal: 4</span>
                            </div>

                            {weeklyActivity.map((data, i) => {
                                const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
                                const { total, learn, practice, reflect, live } = data;
                                const chartMax = Math.max(4.5, ...weeklyActivity.map(a => a.total));

                                // Category Colors & Heights
                                const learnH = (learn.length / chartMax) * 100;
                                const practiceH = (practice.length / chartMax) * 100;
                                const reflectH = (reflect.length / chartMax) * 100;
                                const liveH = (live.length / chartMax) * 100;
                                
                                return (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-2.5 h-full justify-end group z-10 relative">
                                        {/* Target Reached Badge - Glowing Check */}
                                        {total >= 4 && (
                                            <motion.div 
                                                initial={{ scale: 0, opacity: 0 }}
                                                animate={{ 
                                                    scale: [1, 1.15, 1],
                                                    opacity: 1 
                                                }}
                                                transition={{ 
                                                    scale: { repeat: Infinity, duration: 2.5, ease: "easeInOut" }
                                                }}
                                                className="absolute -top-7 left-1/2 -translate-x-1/2 z-20"
                                            >
                                                <div className="bg-[#f59e0b] rounded-full p-0.5 shadow-[0_0_15px_#f59e0b] border border-black/20">
                                                    <Check className="w-2.5 h-2.5 text-black" strokeWidth={5} />
                                                </div>
                                            </motion.div>
                                        )}
                                        {/* Hover Tooltip (Detailed Activity List) */}
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            whileHover={{ opacity: 1, y: 0, scale: 1 }}
                                            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-40 p-2 bg-[var(--bg-surface-elevated)] border border-[var(--border-default)] rounded-lg shadow-xl pointer-events-none z-50 opacity-0 group-hover:opacity-100 transition-all duration-200"
                                        >
                                            <div className="text-[10px] space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar">
                                                <div className="flex justify-between text-[var(--text-muted)] border-b border-[var(--border-subtle)] pb-1 mb-1">
                                                    <span className="font-bold uppercase tracking-widest">{days[i]} Journey</span>
                                                    <span className="font-mono">{total} Total</span>
                                                </div>
                                                
                                                {learn.length > 0 && (
                                                    <div className="space-y-0.5">
                                                        <div className="text-[#6366f1] font-bold text-[8px] uppercase tracking-tighter">Learn</div>
                                                        {learn.map((t, idx) => <div key={idx} className="truncate text-white/90 pl-1.5 border-l border-[#6366f1]/30">• {t}</div>)}
                                                    </div>
                                                )}
                                                {practice.length > 0 && (
                                                    <div className="space-y-0.5">
                                                        <div className="text-[#10b981] font-bold text-[8px] uppercase tracking-tighter">Practice</div>
                                                        {practice.map((t, idx) => <div key={idx} className="truncate text-white/90 pl-1.5 border-l border-[#10b981]/30">• {t}</div>)}
                                                    </div>
                                                )}
                                                {reflect.length > 0 && (
                                                    <div className="space-y-0.5">
                                                        <div className="text-[#fb7185] font-bold text-[8px] uppercase tracking-tighter">Reflect</div>
                                                        {reflect.map((t, idx) => <div key={idx} className="truncate text-white/90 pl-1.5 border-l border-[#fb7185]/30">• {t}</div>)}
                                                    </div>
                                                )}
                                                {live.length > 0 && (
                                                    <div className="space-y-0.5">
                                                        <div className="text-[#f59e0b] font-bold text-[8px] uppercase tracking-tighter">Live</div>
                                                        {live.map((t, idx) => <div key={idx} className="truncate text-white/90 pl-1.5 border-l border-[#f59e0b]/30">• {t}</div>)}
                                                    </div>
                                                )}
                                                
                                                {total === 0 && <div className="text-center italic opacity-60 py-2 text-[11px]">Resting in Stillness</div>}
                                            </div>
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-[var(--bg-surface-elevated)] border-b border-r border-[var(--border-default)] rotate-45 -mt-1" />
                                        </motion.div>

                                        <span className={`text-[12px] font-bold transition-all duration-300 ${total >= 4 ? 'text-[#f59e0b] scale-125 drop-shadow-[0_0_10px_rgba(245,158,11,0.6)]' : 'text-[var(--text-secondary)]'}`}>
                                            {total}
                                        </span>

                                        <div className={`relative w-full max-w-[32px] h-full bg-[var(--border-subtle)] bg-opacity-10 rounded-t-sm overflow-hidden flex flex-col justify-end transition-all duration-500 ${total >= 4 ? 'ring-2 ring-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.2)]' : ''}`}>
                                            {/* Live Stack */}
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: `${liveH}%` }}
                                                className="w-full bg-[#f59e0b]"
                                            />
                                            {/* Reflect Stack */}
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: `${reflectH}%` }}
                                                className="w-full bg-[#fb7185]"
                                            />
                                            {/* Practice Stack */}
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: `${practiceH}%` }}
                                                className="w-full bg-[#10b981]"
                                            />
                                            {/* Learn Stack */}
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: `${learnH}%` }}
                                                className="w-full bg-[#6366f1]"
                                            />
                                        </div>
                                        <span className="text-[11px] uppercase font-bold text-[var(--text-secondary)]">{days[i]}</span>
                                    </div>
                                );
                            })}
                        </div>
                        
                        {/* ── Color Legend ── */}
                        <div className="flex flex-wrap gap-4 pt-4 border-t border-[var(--border-subtle)]">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-sm bg-[#6366f1]" />
                                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Learn</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-sm bg-[#10b981]" />
                                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Practice</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-sm bg-[#fb7185]" />
                                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Reflect</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-sm bg-[#f59e0b]" />
                                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Live</span>
                            </div>
                        </div>
                    </div>

                    {/* Streak Grid */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <TrendingUp className="w-4 h-4 text-[var(--accent-primary)]" />
                                <h4 className="text-[12px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.15em]">Practice Consistency</h4>
                                <InfoTooltip 
                                    title="Practice Consistency" 
                                    description="A visual look at your presence over the last 28 days. Each glowing box represents a day you checked in." 
                                />
                            </div>
                            <span className="text-[12px] font-bold text-[var(--accent-secondary)]">
                                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </span>
                        </div>

                        <div className="flex flex-col h-40 justify-center">
                            <StreakGrid days={streakDays} />
                            <div className="flex gap-4 mt-6 text-[12px] font-serif text-[var(--text-secondary)] italic">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-sm bg-[var(--accent-secondary-dim)] border border-[var(--accent-secondary-border)]" />
                                    <span>Practiced</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-sm bg-[var(--border-subtle)]" />
                                    <span>Rest / Stillness</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Achievements Panel */}
            <AchievementsPanel unlocked={unlocked} points={points} />



            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6" >
                {/* Emotions */}
                <div className="p-5 rounded-[24px] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-lg space-y-5" >
                    <div className="flex items-center gap-3 mb-1">
                        <Activity className="w-4 h-4 text-[var(--accent-secondary)]" />
                        <h4 className="text-[12px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Emotional Resonance</h4>
                        <InfoTooltip 
                            title="Emotional Resonance" 
                            description="Shows which feelings you've observed most often during your journals and reflections."
                        />
                    </div>
                    <div className="space-y-3.5">
                        {emotionFreq.length > 0 ? emotionFreq.map((e, i) => (
                            <div key={i} className="space-y-1">
                                <div className="flex justify-between items-end">
                                    <span className="text-[14px] text-[var(--text-primary)] font-serif">{e.name}</span>
                                    <span className="text-[12px] text-[var(--text-secondary)]">{e.count}×</span>
                                </div>
                                <MiniBar value={e.count} max={maxEmotion} />
                            </div>
                        )) : <p className="text-[12px] text-[var(--text-disabled)] italic">No entries yet.</p>}
                    </div>
                </div>

                {/* Mind Traps */}
                <div className="p-5 rounded-[24px] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-lg space-y-5" >
                    <div className="flex items-center gap-3 mb-1">
                        <Shield className="w-4 h-4 text-[var(--accent-primary)]" />
                        <h4 className="text-[12px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Typical Mind Traps</h4>
                        <InfoTooltip 
                            title="Mind Traps" 
                            description="Patterns the mind uses to create unnecessary noise. Identifying them is the first step to letting go."
                            howCalculated="Identified through your answers in Situational Practices."
                        />
                    </div>
                    <div className="space-y-3.5">
                        {distortionFreq.length > 0 ? distortionFreq.map((d, i) => (
                            <div key={i} className="space-y-1">
                                <div className="flex justify-between items-end">
                                    <span className="text-[14px] text-[var(--text-primary)] font-serif">{d.name}</span>
                                    <span className="text-[12px] text-[var(--text-secondary)]">{d.count}×</span>
                                </div>
                                <MiniBar value={d.count} max={maxDistortion} color="var(--accent-primary)" />
                            </div>
                        )) : <p className="text-[12px] text-[var(--text-disabled)] italic">No patterns yet.</p>}
                    </div>
                </div>

                {/* Somatic Heatmap */}
                <div className="p-5 rounded-[24px] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-lg space-y-5" >
                    <div className="flex items-center gap-3 mb-1">
                        <MapPin className="w-4 h-4 text-[var(--accent-secondary)]" />
                        <h4 className="text-[12px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Mind-Body Balance</h4>
                        <InfoTooltip 
                            title="Mind-Body Balance" 
                            description="Visualizes where you store your energy or tension. Awareness of the body brings you into the Now."
                        />
                    </div>
                    <div className="space-y-3.5">
                        {bodyFreq.length > 0 ? bodyFreq.map((b, i) => (
                            <div key={i} className="space-y-1">
                                <div className="flex justify-between items-end">
                                    <span className="text-[14px] text-[var(--text-primary)] font-serif">{b.name}</span>
                                    <span className="text-[12px] text-[var(--text-secondary)]">{b.count}×</span>
                                </div>
                                <MiniBar value={b.count} max={maxBody} />
                            </div>
                        )) : <p className="text-[12px] text-[var(--text-disabled)] italic">No somatic data.</p>}
                    </div>
                </div>
            </div>

            {/* Admin Logs Section */}
            {
                isAdmin && (
                    <div className="space-y-8 pt-10 border-t border-[var(--border-subtle)]">
                        <div className="flex items-center gap-4">
                            <div className="w-2 h-2 rounded-full bg-[var(--accent-primary)] shadow-[0_0_10px_var(--accent-primary)]" />
                            <h3 className="text-[12px] font-bold uppercase tracking-[0.3em] text-[var(--text-muted)] text-center">User Activity Logs (Admin)</h3>
                        </div>

                        <div className="rounded-[24px] border border-[var(--border-subtle)] bg-[var(--bg-card)] overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-[12px] min-w-[600px]">
                                    <thead className="bg-[var(--bg-surface)] border-b border-[var(--border-subtle)]">
                                        <tr>
                                            <th className="px-6 py-4 font-bold text-[var(--text-muted)] uppercase tracking-wider">Type</th>
                                            <th className="px-6 py-4 font-bold text-[var(--text-muted)] uppercase tracking-wider">User</th>
                                            <th className="px-6 py-4 font-bold text-[var(--text-muted)] uppercase tracking-wider">Location</th>
                                            <th className="px-6 py-4 font-bold text-[var(--text-muted)] uppercase tracking-wider text-right">Moment</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--border-subtle)]">
                                        {adminLogs.map((log) => (
                                            <tr key={log.id} className="hover:bg-[var(--bg-surface)] transition-colors">
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                                        log.activityType === 'SESSION_START' 
                                                            ? 'bg-[var(--accent-primary-dim)] text-[var(--accent-primary)]'
                                                            : 'bg-[var(--accent-secondary-dim)] text-[var(--accent-secondary)]'
                                                    }`}>
                                                        {log.activityType === 'SESSION_START' ? 'PRESENCE' : log.activityType}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-[var(--text-secondary)]">{log.userEmail.split('@')[0]}</td>
                                                <td className="px-6 py-4 text-[var(--text-primary)] italic text-[11px]">{log.location || 'Unknown'}</td>
                                                <td className="px-6 py-4 text-right text-[var(--text-muted)]">
                                                    {log.timestamp?.toDate ? log.timestamp.toDate().toLocaleDateString() : 'Now'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )
            }
                </section>

                {/* ── Sacred History Section ── */}
                <section className="space-y-10 pt-10 border-t border-[var(--border-subtle)]">
                    <div className="flex items-center gap-3">
                        <History className="w-5 h-5 text-[var(--accent-secondary)]" />
                        <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-[var(--text-muted)]">Sacred History</h3>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <div className="space-y-6">
                            <PracticeLedger />
                        </div>
                        <div className="space-y-6">
                            <PastReflections />
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default StatsDashboard;
