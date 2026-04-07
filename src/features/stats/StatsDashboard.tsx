import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart2, Activity, Shield, MapPin, TrendingUp, Volume2, Loader2, Square } from 'lucide-react';
import { useJournalVoice } from '../journal/hooks/useJournalVoice';
import { useAuth } from '../auth/AuthContext';
import { db } from '../../firebase';
import { collection, query, getDocs, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { useAchievements } from '../achievements/useAchievements';
import { AchievementsPanel } from '../achievements/AchievementsPanel';
import { MAIN_PARTS_COUNT } from '../soul-intelligence/teachingData';
import { isAdminEmail } from '../../config/admin';
import PastReflections from './PastReflections';
import PracticeLedger from './PracticeLedger';
import { JourneyProgress } from './JourneyProgress';
import { InfoTooltip } from '../../components/ui/InfoTooltip';

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
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
        weeks.push(days.slice(i, i + 7));
    }

    return (
        <div className="flex flex-col gap-2.5">
            {weeks.map((week, widx) => (
                <div key={widx} className="flex gap-2.5">
                    {week.map((active, i) => (
                        <div
                            key={i}
                            className={`w-[18px] h-[18px] rounded-sm transition-all duration-500`}
                            style={{
                                background: active
                                    ? 'var(--accent-secondary-dim)'
                                    : 'var(--border-subtle)',
                                border: active
                                    ? '1.5px solid var(--accent-secondary)'
                                    : '1.5px solid var(--border-default)',
                                opacity: 1,
                                boxShadow: active ? '0 0 6px var(--accent-secondary)' : 'none',
                            }}
                            title={`Day ${widx * 7 + i + 1}: ${active ? "Active" : "Rest"}`}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
};

interface StatsDashboardProps {
  onNavigate?: (tab: string, questionId?: string, view?: 'explanation' | 'video' | 'practice') => void;
  accountCreatedAt?: string | null;
}

    const StatsDashboard: React.FC<StatsDashboardProps> = ({ onNavigate, accountCreatedAt }) => {
    const { user } = useAuth();
    const [weeklyActivity, setWeeklyActivity] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
    const [emotionFreq, setEmotionFreq] = useState<StatMetric[]>([]);
    const [distortionFreq, setDistortionFreq] = useState<StatMetric[]>([]);
    const [bodyFreq, setBodyFreq] = useState<StatMetric[]>([]);
    const [streakDays, setStreakDays] = useState<number[]>(new Array(28).fill(0));
    const [powerWatched, setPowerWatched] = useState(0);
    const [adminLogs, setAdminLogs] = useState<ActivityLog[]>([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { speak, stop, isPlaying, isLoading: isVoiceLoading } = useJournalVoice();
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
    }, [user]);

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
                    return Object.entries(data).map(([qid, rec]: [string, any]) => ({
                        ...rec,
                        source: 'practice',
                        date,
                        questionId: qid
                    })).filter(r => r.completed);
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

            const activity = [0, 0, 0, 0, 0, 0, 0];
            const emMap: Record<string, number> = {};
            const distMap: Record<string, number> = {};
            const bodyMap: Record<string, number> = {};
            const streakArr = new Array(28).fill(0);

            allActivityDocs.forEach(data => {
                let date: Date;

                if (data.createdAt?.toDate) {
                    date = data.createdAt.toDate();
                } else if (data.timestamp?.toDate) {
                    date = data.timestamp.toDate();
                } else if (data.date) {
                    date = new Date(data.date);
                } else {
                    return;
                }

                const nowMidnight = new Date(now);
                nowMidnight.setHours(0, 0, 0, 0);
                const entryMidnight = new Date(date);
                entryMidnight.setHours(0, 0, 0, 0);

                const diffTime = nowMidnight.getTime() - entryMidnight.getTime();
                const diffDays = Math.round(diffTime / oneDay);

                // Weekly activity (Current Calendar Week only)
                const todayIndex = (now.getDay() + 6) % 7;
                if (date >= startOfWeek && date <= now) {
                    const dayIndex = (date.getDay() + 6) % 7; // M-S
                    if (dayIndex >= 0 && dayIndex <= todayIndex) {
                        activity[dayIndex] += 1;
                    }
                }

                // 28-day streak
                if (diffDays >= 0 && diffDays < 28) {
                    streakArr[27 - diffDays] = 1;
                }

                // Analytics (Primarily from journal, but could be extended)
                if (data.emotions) {
                    const ems = typeof data.emotions === 'string'
                        ? data.emotions.split(', ')
                        : Array.isArray(data.emotions) ? data.emotions : [];

                    ems.forEach((e: string) => {
                        if (e) emMap[e] = (emMap[e] || 0) + 1;
                    });
                }
                if (data.cognitiveDistortion) {
                    const d = data.cognitiveDistortion;
                    distMap[d] = (distMap[d] || 0) + 1;
                }
                if (data.bodyArea) {
                    const b = data.bodyArea;
                    bodyMap[b] = (bodyMap[b] || 0) + 1;
                }
            });

            setWeeklyActivity(activity);
            setStreakDays(streakArr);

            const powerSnap = await getDoc(doc(db, 'users', user.uid, 'progress', 'powerOfNow'));
            if (powerSnap.exists()) {
                setPowerWatched(powerSnap.data().watched?.length || 0);
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
                videosWatched: powerWatched,
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

        setAdminLogs(logs);
    };

    const currentStreak = (() => {
        let streak = 0;
        for (let i = streakDays.length - 1; i >= 0; i--) {
            if (streakDays[i]) streak++;
            else if (i < streakDays.length - 1) break; // Allow skip if today not reached yet, but actually we start from end
        }
        return streak;
    })();

    const maxWeekly = Math.max(...weeklyActivity, 1);
    const maxEmotion = Math.max(...emotionFreq.map(e => e.count), 1);
    const maxDistortion = Math.max(...distortionFreq.map(d => d.count), 1);
    const maxBody = Math.max(...bodyFreq.map(b => b.count), 1);

    const handleListen = () => {
        if (isPlaying) {
            stop();
            return;
        }

        const topEmotion = emotionFreq[0]?.name || "peace";
        const topTrap = distortionFreq[0]?.name || "none identified";

        const script = `
            Welcome back to your journey report. 
            You have maintained a powerful ${currentStreak} day streak of presence. 
            ${topEmotion !== "peace" ? `Lately, your most frequent resonance has been ${topEmotion}.` : ''}
            ${topTrap !== "none identified" ? `The witness has observed that your mind often wanders into ${topTrap}.` : ''}
            Continue to watch these patterns with gentle curiosity. You are doing beautiful work.
        `;

        speak(script, "This is a spiritual summary of the user's progress stats.", true);
    };

    if (isLoading) {
        return (
            <div className="w-full h-64 flex items-center justify-center">
                <p className="text-[var(--text-muted)] italic animate-pulse">Gathering your resonance...</p>
            </div>
        );
    }

    return (
        <div className="w-full space-y-6 pt-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">

            {/* ─ Consolidated Journey Progress (new) ─ */}
            <JourneyProgress
              onNavigate={onNavigate}
              accountCreatedAt={accountCreatedAt}
            />

            <div className="h-px bg-[var(--border-subtle)]" />

            {/* Header */}
            <div className="border-b border-[var(--border-subtle)] pb-6">
                <div className="flex justify-between items-start">
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <p className="text-[12px] uppercase tracking-[0.2em] text-[var(--accent-secondary)] font-bold">Insights & Progress</p>
                            <div className="flex items-center gap-4 mb-2">
                                <h2 className="text-3xl font-serif font-light text-[var(--text-primary)]">Your Journey Report</h2>
                            </div>
                        </div>

                        <div className="flex items-center gap-6 px-5 py-2.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm w-fit">
                            <div className="flex items-center gap-2">
                                <span className="text-[12px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Practice Streak</span>
                                <span className="text-sm font-serif text-[var(--text-primary)]">{currentStreak}D</span>
                            </div>
                            <div className="w-px h-3 bg-[var(--border-subtle)]" />
                            <div className="flex items-center gap-2">
                                <span className="text-[12px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Lessons Done</span>
                                <span className="text-sm font-serif text-[var(--text-primary)]">{powerWatched}/{MAIN_PARTS_COUNT}</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleListen}
                        disabled={isVoiceLoading}
                        className={`group relative h-9 px-3.5 rounded-full flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer border ${
                            isPlaying
                                ? "bg-[var(--accent-secondary-dim)] border-[var(--accent-secondary-border)] text-[var(--accent-secondary)]"
                                : "bg-[var(--bg-surface-hover)] border-[var(--border-default)] text-[var(--text-muted)] hover:border-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                        }`}
                        title="Listen to Insights"
                    >
                        {isVoiceLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-[11px] font-bold uppercase tracking-widest leading-none mt-[1px]">Preparing...</span>
                            </>
                        ) : isPlaying ? (
                            <>
                                <Square className="w-4 h-4 fill-current" />
                                <span className="text-[11px] font-bold uppercase tracking-widest leading-none mt-[1px]">Voice Guidance</span>
                            </>
                        ) : (
                            <>
                                <Volume2 className="w-4 h-4" />
                                <span className="text-[11px] font-bold uppercase tracking-widest leading-none mt-[1px]">Voice Guidance</span>
                            </>
                        )}
                    </button>
                </div>
            </div >

            {/* Activity Summary Card */}
            < div className="p-7 rounded-[24px] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-lg" >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Weekly Chart */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <BarChart2 className="w-4 h-4 text-[var(--accent-secondary)]" />
                                <h4 className="text-[12px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.15em]">Weekly Activity</h4>
                                <InfoTooltip 
                                    title="Weekly Activity" 
                                    description="This shows how many times you engaged with the app each day this week." 
                                />
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

                        <div className="h-40 flex items-end justify-between px-2 gap-4">
                            {weeklyActivity.map((val, i) => {
                                const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
                                const h = (val / maxWeekly) * 100;
                                return (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-2.5 h-full justify-end group">
                                        <span className="text-[12px] font-serif transition-opacity duration-300 text-[var(--text-secondary)]">
                                            {val}
                                        </span>
                                        <div className="relative w-full max-w-[28px] h-full bg-transparent rounded-md overflow-hidden">
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: `${Math.max(h, 4)}%` }}
                                                transition={{ duration: 1, ease: "easeOut", delay: i * 0.05 }}
                                                className={`absolute bottom-0 left-0 right-0 ${val > 0 ? 'bg-gradient-to-t from-[var(--accent-primary)] to-[var(--accent-secondary)]' : 'bg-[var(--border-subtle)] opacity-20'} rounded-t-sm`}
                                            />
                                        </div>
                                        <span className="text-[11px] uppercase font-bold text-[var(--text-secondary)]">{days[i]}</span>
                                    </div>
                                );
                            })}
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
            </div >

            {/* Achievements Panel */}
            <AchievementsPanel unlocked={unlocked} points={points} />

            {/* Past Reflections Log */}
            <PracticeLedger />
            <PastReflections />

            {/* Metrics Grid */}
            < div className="grid grid-cols-1 md:grid-cols-3 gap-6" >
                {/* Emotions */}
                < div className="p-5 rounded-[24px] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-lg space-y-5" >
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
                </div >

                {/* Mind Traps */}
                < div className="p-5 rounded-[24px] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-lg space-y-5" >
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
                </div >

                {/* Somatic Heatmap */}
                < div className="p-5 rounded-[24px] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-lg space-y-5" >
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
                </div >
            </div >

            {/* Admin Logs Section */}
            {
                isAdmin && (
                    <div className="space-y-8 pt-10 border-t border-[var(--border-subtle)]">
                        <div className="flex items-center gap-4">
                            <div className="w-2 h-2 rounded-full bg-[var(--accent-primary)] shadow-[0_0_10px_var(--accent-primary)]" />
                            <h3 className="text-[12px] font-bold uppercase tracking-[0.3em] text-[var(--text-muted)] text-center">System Echoes (Admin)</h3>
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
        </div >
    );
};

export default StatsDashboard;
