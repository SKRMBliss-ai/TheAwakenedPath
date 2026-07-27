import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Compass, History } from 'lucide-react';
import PracticeLedger from './PracticeLedger';
import PastReflections from './PastReflections';
import { useAuth } from '../auth/AuthContext';
import { db } from '../../firebase';
import { collection, query, getDocs, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { useAchievements } from '../achievements/useAchievements';
import { isAdminEmail, isMonitoredEmail } from '../../config/admin';
import { QUESTION_IDS } from '../practices/practiceLibrary';


interface ActivityLog {
    id: string;
    userEmail: string;
    activityType: string;
    details: string;
    location?: string;
    timestamp: any;
}

// ─── Small building blocks ───

const BigStat = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center justify-center text-center p-4 rounded-[20px] border border-[var(--border-default)] bg-[var(--bg-surface)]">
        <span className="text-3xl sm:text-4xl font-serif font-light text-[var(--text-primary)] leading-none">{value}</span>
        <span className="text-[11px] text-[var(--text-muted)] mt-2 leading-tight">{label}</span>
    </div>
);

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
                    <div key={widx} className="flex items-center gap-2 sm:gap-4">
                        <span className="w-16 sm:w-24 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] text-right opacity-60">
                            {rangeLabel}
                        </span>
                        <div className="flex gap-1.5 sm:gap-2.5">
                            {week.map((active, i) => {
                                const cellDate = new Date(currentMonday);
                                cellDate.setDate(currentMonday.getDate() - ((3 - widx) * 7) + i);
                                const isToday = cellDate.getTime() === startOfToday.getTime();

                                return (
                                    <div
                                        key={i}
                                        className="w-3.5 h-3.5 sm:w-[18px] sm:h-[18px] rounded-sm transition-all duration-500 relative"
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
                                        title={`${isToday ? "Today" : cellDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: ${active ? "Showed up" : "Rest day"}`}
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
    const [streakDays, setStreakDays] = useState<number[]>(new Array(28).fill(0));

    const [adminLogs, setAdminLogs] = useState<ActivityLog[]>([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { awardEvent, checkAndUnlock } = useAchievements();

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

                        const isLiveId = qid === 'question1' || qid === 'question3' || qid === 'question6' || qid === 'question7';

                        if (rec.learnCompleted) entries.push({ source: 'practice', date, milestone: 'learn', questionId: qid, title: 'Quest Lesson' });
                        if (rec.reflectCompleted) entries.push({ source: 'practice', date, milestone: 'reflect', questionId: qid, title: 'Reflection' });
                        if (rec.completed) entries.push({ source: 'practice', date, milestone: isLiveId ? 'live' : 'practice', questionId: qid, title: isLiveId ? 'Live Practice' : 'Daily Practice' });
                        if (rec.integrateCompleted) entries.push({ source: 'practice', date, milestone: 'integrate', questionId: qid, title: 'Integration' });
                    });

                    if (data.anySituationalDone === true) {
                        entries.push({ source: 'practice', date, milestone: 'live', type: 'situational', title: 'Life Practice' });
                    }
                    return entries;
                })
            ];

            const now = new Date();
            const oneDay = 24 * 60 * 60 * 1000;

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

            allActivityDocs.forEach(item => {
                let date: Date;
                if (item.createdAt?.toDate) date = item.createdAt.toDate();
                else if (item.timestamp?.toDate) date = item.timestamp.toDate();
                else if (item.date) date = new Date(item.date);
                else return;

                const dayIndex = (date.getDay() + 6) % 7;

                // Weekly activity (current calendar week only)
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
                            dayData.live.push(item.title || 'Life Practice');
                            dayData.total++;
                        } else if (item.source === 'journey') {
                            dayData.total++;
                            dayData.practice.push(item.title || 'Journey Engagement');
                        }
                    }
                }

                // 28-day calendar-aligned grid
                const startOfTodayGrid = new Date(now);
                startOfTodayGrid.setHours(0, 0, 0, 0);
                const gridDayOffset = (startOfTodayGrid.getDay() + 6) % 7;
                const gridMonday = new Date(startOfTodayGrid);
                gridMonday.setDate(startOfTodayGrid.getDate() - gridDayOffset);
                const gridStart = new Date(gridMonday);
                gridStart.setDate(gridMonday.getDate() - 21);

                const entryDay = new Date(date);
                entryDay.setHours(0, 0, 0, 0);
                const gridDiffDays = Math.floor((entryDay.getTime() - gridStart.getTime()) / oneDay);

                if (gridDiffDays >= 0 && gridDiffDays < 28) {
                    streakArr[gridDiffDays] = 1;
                }
            });

            setWeeklyActivity(activity);
            setStreakDays(streakArr);

            let currentPowerWatched = 0;
            const powerSnap = await getDoc(doc(db, 'users', user.uid, 'progress', 'powerOfNow'));
            if (powerSnap.exists()) {
                currentPowerWatched = powerSnap.data().watched?.length || 0;
            }
            setPonProgress({ watched: currentPowerWatched, total: 30 });

            const wuSnap = await getDoc(doc(db, 'users', user.uid, 'courseProgress', 'wisdom-untethered'));
            if (wuSnap.exists()) {
                const data = wuSnap.data();
                const exploredCount = QUESTION_IDS.filter(qId => {
                    const qp = data[qId];
                    return qp?.read || qp?.video || qp?.practice;
                }).length;
                setWuProgress({ explored: exploredCount, total: QUESTION_IDS.length });
            }

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
                chaptersComplete: 0,
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

    // ── Simple derived numbers ──
    const currentStreak = (() => {
        let s = 0;
        for (let i = streakDays.length - 1; i >= 0; i--) {
            if (streakDays[i]) s++;
            else if (i < streakDays.length - 1) break;
        }
        return s;
    })();
    const daysThisWeek = weeklyActivity.filter(d => d.total > 0).length;
    const daysThisMonth = streakDays.filter(Boolean).length;
    const weekDayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

    const ponPct = Math.round((ponProgress.watched / ponProgress.total) * 100);
    const wuPct = Math.round((wuProgress.explored / wuProgress.total) * 100);

    if (isLoading) {
        return (
            <div className="w-full h-64 flex items-center justify-center">
                <p className="text-[var(--text-muted)] italic animate-pulse">Loading your progress…</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-700 max-w-3xl mx-auto">
            {/* ── Title ── */}
            <div>
                <h2 className="text-3xl sm:text-4xl font-serif font-light text-[var(--text-primary)]">Your Progress</h2>
                <p className="text-sm text-[var(--text-muted)] mt-1">A simple look at how you're showing up.</p>
            </div>

            {/* ── Three friendly numbers ── */}
            <div className="grid grid-cols-3 gap-3">
                <BigStat value={currentStreak} label="day streak" />
                <BigStat value={daysThisWeek} label="days this week" />
                <BigStat value={daysThisMonth} label="days this month" />
            </div>

            {/* ── This week ── */}
            <div className="p-5 sm:p-6 rounded-[24px] border border-[var(--border-default)] bg-[var(--bg-surface)]">
                <h3 className="text-base font-serif text-[var(--text-primary)] mb-4">This week</h3>
                <div className="flex justify-between gap-2">
                    {weeklyActivity.map((d, i) => {
                        const active = d.total > 0;
                        return (
                            <div key={i} className="flex flex-col items-center gap-2 flex-1">
                                <div
                                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-[12px] font-bold transition-all"
                                    style={{
                                        background: active ? 'var(--accent-secondary-dim)' : 'transparent',
                                        border: `1.5px solid ${active ? 'var(--accent-secondary)' : 'var(--border-default)'}`,
                                        color: active ? 'var(--accent-secondary)' : 'var(--text-muted)',
                                    }}
                                >
                                    {active ? '✓' : ''}
                                </div>
                                <span className="text-[10px] font-bold uppercase text-[var(--text-muted)]">{weekDayLabels[i]}</span>
                            </div>
                        );
                    })}
                </div>
                <p className="text-sm text-[var(--text-secondary)] mt-4 text-center">
                    {daysThisWeek === 0
                        ? "A fresh week — show up when you can."
                        : `You showed up ${daysThisWeek} ${daysThisWeek === 1 ? 'day' : 'days'} this week. Nice.`}
                </p>
            </div>

            {/* ── Last 4 weeks ── */}
            <div className="p-5 sm:p-6 rounded-[24px] border border-[var(--border-default)] bg-[var(--bg-surface)]">
                <h3 className="text-base font-serif text-[var(--text-primary)] mb-5">Last 4 weeks</h3>
                <StreakGrid days={streakDays} />
                <div className="flex gap-5 mt-5 text-[12px] text-[var(--text-secondary)]">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm bg-[var(--accent-secondary-dim)] border border-[var(--accent-secondary)]" />
                        <span>Showed up</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm bg-[var(--border-subtle)] border border-[var(--border-default)]" />
                        <span>Rest day</span>
                    </div>
                </div>
            </div>

            {/* ── Keep going (courses) ── */}
            <div className="p-5 sm:p-6 rounded-[24px] border border-[var(--border-default)] bg-[var(--bg-surface)] space-y-6">
                <h3 className="text-base font-serif text-[var(--text-primary)]">Keep going</h3>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <BookOpen className="w-4 h-4 text-indigo-400" />
                            <span className="text-sm text-[var(--text-primary)]">The Power of Now</span>
                        </div>
                        <span className="text-sm text-[var(--text-muted)]">{ponProgress.watched} of {ponProgress.total}</span>
                    </div>
                    <div className="h-2 w-full bg-[var(--border-subtle)] rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${ponPct}%` }} transition={{ duration: 0.8 }} className="h-full bg-indigo-500 rounded-full" />
                    </div>
                    <button
                        onClick={() => onNavigate?.('power_of_now')}
                        className="text-[12px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                        Keep watching →
                    </button>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <Compass className="w-4 h-4 text-amber-400" />
                            <span className="text-sm text-[var(--text-primary)]">Wisdom Untethered</span>
                        </div>
                        <span className="text-sm text-[var(--text-muted)]">{wuProgress.explored} of {wuProgress.total}</span>
                    </div>
                    <div className="h-2 w-full bg-[var(--border-subtle)] rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${wuPct}%` }} transition={{ duration: 0.8 }} className="h-full bg-amber-500 rounded-full" />
                    </div>
                    <button
                        onClick={() => onNavigate?.('wisdom_untethered')}
                        className="text-[12px] font-bold text-amber-400 hover:text-amber-300 transition-colors"
                    >
                        Keep exploring →
                    </button>
                </div>
            </div>


            {/* ── Looking back ── */}
            <section className="space-y-6 pt-4 border-t border-[var(--border-subtle)]">
                <div className="flex items-center gap-3">
                    <History className="w-5 h-5 text-[var(--accent-secondary)]" />
                    <h3 className="text-base font-serif text-[var(--text-primary)]">Looking back</h3>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <PracticeLedger />
                    <PastReflections />
                </div>
            </section>

            {/* ── Admin logs (admin only) ── */}
            {isAdmin && (
                <div className="space-y-6 pt-8 border-t border-[var(--border-subtle)]">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-[var(--accent-primary)] shadow-[0_0_10px_var(--accent-primary)]" />
                        <h3 className="text-[12px] font-bold uppercase tracking-[0.3em] text-[var(--text-muted)]">User Activity Logs (Admin)</h3>
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
            )}
        </div>
    );
};

export default StatsDashboard;
