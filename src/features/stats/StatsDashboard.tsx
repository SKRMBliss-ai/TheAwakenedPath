import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart2, Activity, Shield, MapPin, TrendingUp, Info, Volume2, Loader2, Square } from 'lucide-react';
import { useJournalVoice } from '../journal/hooks/useJournalVoice';
import { useAuth } from '../auth/AuthContext';
import { db } from '../../firebase';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';

interface ActivityLog {
    id: string;
    userEmail: string;
    activityType: string;
    details: string;
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
        <div className="h-1 flex-1 rounded-full bg-[var(--border-subtle)] overflow-hidden">
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ background: color || 'var(--accent-secondary)' }}
            />
        </div>
    );
};

const StreakGrid = ({ days }: { days: number[] }) => {
    return (
        <div className="flex gap-1.5 flex-wrap">
            {days.map((active, i) => (
                <div
                    key={i}
                    className={`w-3.5 h-3.5 rounded-sm transition-all duration-500`}
                    style={{
                        background: active
                            ? 'var(--accent-secondary-dim)'
                            : 'var(--bg-surface)',
                        border: active
                            ? '1px solid var(--accent-secondary-border)'
                            : '1px solid var(--border-subtle)',
                        opacity: active ? 1 : 0.6
                    }}
                    title={`Day ${i + 1}: ${active ? "Active" : "Rest"}`}
                />
            ))}
        </div>
    );
};

const StatsDashboard: React.FC = () => {
    const { user } = useAuth();
    const [weeklyActivity, setWeeklyActivity] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
    const [totalEntries, setTotalEntries] = useState(0);
    const [emotionFreq, setEmotionFreq] = useState<StatMetric[]>([]);
    const [distortionFreq, setDistortionFreq] = useState<StatMetric[]>([]);
    const [bodyFreq, setBodyFreq] = useState<StatMetric[]>([]);
    const [streakDays, setStreakDays] = useState<number[]>(new Array(28).fill(0));
    const [adminLogs, setAdminLogs] = useState<ActivityLog[]>([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { speak, stop, isPlaying, isLoading: isVoiceLoading } = useJournalVoice();

    useEffect(() => {
        const admins = ['shrutikhungar@gmail.com', 'smriti.duggal@gmail.com', 'test@example.com'];
        if (user?.email && admins.includes(user.email)) {
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
            const journalSnap = await getDocs(journalRef);

            const now = new Date();
            const oneDay = 24 * 60 * 60 * 1000;

            const activity = [0, 0, 0, 0, 0, 0, 0];
            const emMap: Record<string, number> = {};
            const distMap: Record<string, number> = {};
            const bodyMap: Record<string, number> = {};
            const streakArr = new Array(28).fill(0);

            journalSnap.forEach(doc => {
                const data = doc.data();
                let date: Date;

                if (data.createdAt?.toDate) {
                    date = data.createdAt.toDate();
                } else if (data.date) {
                    date = new Date(data.date);
                } else {
                    return;
                }

                const diffTime = now.getTime() - date.getTime();
                const diffDays = Math.floor(diffTime / oneDay);

                // Weekly activity
                if (diffDays >= 0 && diffDays < 7) {
                    const dayIndex = (date.getDay() + 6) % 7; // M-S
                    activity[dayIndex] += 1;
                }

                // 28-day streak
                if (diffDays >= 0 && diffDays < 28) {
                    streakArr[27 - diffDays] = 1;
                }

                // Analytics
                if (data.emotions) {
                    data.emotions.split(', ').forEach((e: string) => {
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

            setTotalEntries(journalSnap.size);
            setWeeklyActivity(activity);
            setStreakDays(streakArr);

            // Sort and set analytics
            const sortMap = (map: Record<string, number>) =>
                Object.entries(map)
                    .map(([name, count]) => ({ name, count }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5);

            setEmotionFreq(sortMap(emMap));
            setDistortionFreq(sortMap(distMap));
            setBodyFreq(sortMap(bodyMap));
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
            Your total reflections have reached ${totalEntries}.
            Lately, your most frequent resonance has been ${topEmotion}.
            The witness has observed that your mind often wanders into ${topTrap}.
            Continue to watch these patterns with gentle curiosity. You are doing beautiful work.
        `;

        speak(script, "This is a spiritual summary of the user's progress stats.", true);
    };

    if (isLoading && totalEntries === 0) {
        return (
            <div className="w-full h-64 flex items-center justify-center">
                <p className="text-[var(--text-muted)] italic animate-pulse">Gathering your resonance...</p>
            </div>
        );
    }

    return (
        <div className="w-full space-y-10 pt-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Header */}
            <div className="border-b border-[var(--border-subtle)] pb-8">
                <div className="flex justify-between items-end">
                    <div className="space-y-2">
                        <p className="text-[10px] uppercase tracking-[0.4em] text-[var(--accent-secondary)] font-bold">Essence Report</p>
                        <h2 className="text-4xl font-serif font-light text-[var(--text-primary)]">Soul Stats</h2>
                    </div>
                    <button
                        onClick={handleListen}
                        disabled={isVoiceLoading}
                        className="flex items-center gap-3 px-6 py-2.5 rounded-full bg-[var(--accent-secondary)]/10 border border-[var(--accent-secondary)]/20 text-[var(--accent-secondary)] hover:bg-[var(--accent-secondary)]/20 transition-all group"
                    >
                        {isVoiceLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : isPlaying ? (
                            <Square className="w-4 h-4 fill-current" />
                        ) : (
                            <Volume2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        )}
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                            {isPlaying ? "Pause Guidance" : "Listen to Insights"}
                        </span>
                    </button>
                </div>
            </div>

            {/* Quick Metrics Row - Moved out of header to avoid overlap with fixed toggles */}
            <div className="flex flex-wrap gap-8">
                <div className="text-left py-4 px-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                    <p className="text-[9px] uppercase tracking-[0.2em] text-[var(--text-muted)] mb-1">Total Witnessed</p>
                    <span className="text-3xl font-serif text-[var(--text-primary)]">{totalEntries}</span>
                </div>
                <div className="text-left py-4 px-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                    <p className="text-[9px] uppercase tracking-[0.2em] text-[var(--accent-primary)] mb-1">Active Streak</p>
                    <span className="text-3xl font-serif text-[var(--text-primary)]">🔥 {currentStreak} Days</span>
                </div>
            </div>

            {/* Top Row: Chart & Streak */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Weekly Chart */}
                <div className="p-8 rounded-[24px] border border-[var(--border-subtle)] bg-[var(--bg-card)] backdrop-blur-sm space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <BarChart2 className="w-4 h-4 text-[var(--accent-secondary)]" />
                            <h4 className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em]">Weekly Resonance</h4>
                        </div>
                    </div>

                    <div className="h-44 flex items-end justify-between px-2 gap-4">
                        {weeklyActivity.map((val, i) => {
                            const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
                            const h = (val / maxWeekly) * 100;
                            return (
                                <div key={i} className="flex-1 flex flex-col items-center gap-3 h-full justify-end group">
                                    <span className={`text-[11px] font-serif transition-opacity duration-300 ${val > 0 ? 'opacity-100' : 'opacity-0'}`}>
                                        {val}
                                    </span>
                                    <div className="relative w-full max-w-[32px] h-full bg-[var(--bg-surface)] rounded-md overflow-hidden border border-[var(--border-subtle)]">
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${Math.max(h, 4)}%` }}
                                            transition={{ duration: 1, ease: "easeOut", delay: i * 0.05 }}
                                            className={`absolute bottom-0 left-0 right-0 ${val > 0 ? 'bg-gradient-to-t from-[var(--accent-primary)] to-[var(--accent-secondary)]' : 'bg-[var(--text-muted)] opacity-5'} rounded-t-sm shadow-sm`}
                                        />
                                    </div>
                                    <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">{days[i]}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Streak Grid Card */}
                <div className="p-8 rounded-[24px] border border-[var(--border-subtle)] bg-[var(--bg-card)] space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <TrendingUp className="w-4 h-4 text-[var(--accent-primary)]" />
                            <h4 className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.15em]">Presence History (28d)</h4>
                        </div>
                        <span className="text-[10px] text-[var(--accent-secondary)] font-bold">{currentStreak} Day Streak</span>
                    </div>

                    <div className="flex flex-col h-44 justify-center">
                        <StreakGrid days={streakDays} />
                        <div className="flex gap-4 mt-6 text-[9px] text-[var(--text-muted)] uppercase tracking-wider">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-sm bg-[var(--accent-secondary-dim)] border border-[var(--accent-secondary-border)]" />
                                <span>Active Practice</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-2 h-2 rounded-sm bg-[var(--bg-surface)] border border-[var(--border-subtle)]"
                                    style={{ opacity: 0.6 }}
                                />
                                <span>Stillness</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Emotions */}
                <div className="p-6 rounded-[24px] border border-[var(--border-subtle)] bg-[var(--bg-card)] space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Activity className="w-4 h-4 text-[var(--accent-secondary)]" />
                        <h4 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Emotion Map</h4>
                    </div>
                    <div className="space-y-4">
                        {emotionFreq.length > 0 ? emotionFreq.map((e, i) => (
                            <div key={i} className="space-y-1.5">
                                <div className="flex justify-between items-end">
                                    <span className="text-[13px] text-[var(--text-primary)] font-serif">{e.name}</span>
                                    <span className="text-[10px] text-[var(--text-muted)]">{e.count}×</span>
                                </div>
                                <MiniBar value={e.count} max={maxEmotion} />
                            </div>
                        )) : <p className="text-[11px] text-[var(--text-disabled)] italic">No entries recorded yet.</p>}
                    </div>
                </div>

                {/* Mind Traps (Distortions) */}
                <div className="p-6 rounded-[24px] border border-[var(--border-subtle)] bg-[var(--bg-card)] space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Shield className="w-4 h-4 text-[var(--accent-primary)]" />
                        <h4 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Mind Traps</h4>
                    </div>
                    <div className="space-y-3">
                        {distortionFreq.length > 0 ? distortionFreq.map((d, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                                <span className="text-[11px] font-bold text-[var(--accent-primary)]">#{i + 1}</span>
                                <span className="text-[13px] text-[var(--text-primary)] flex-1 truncate">{d.name}</span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--accent-primary-dim)] text-[var(--accent-primary)]">{d.count}×</span>
                            </div>
                        )) : <p className="text-[11px] text-[var(--text-disabled)] italic">No patterns detected.</p>}
                        {distortionFreq.length > 0 && (
                            <div className="pt-2 flex items-start gap-2">
                                <Info className="w-3 h-3 text-[var(--text-muted)] mt-0.5 shrink-0" />
                                <p className="text-[11px] text-[var(--text-muted)] italic leading-relaxed">
                                    Your most common pattern is <span className="text-[var(--accent-primary)] font-medium">{distortionFreq[0].name}</span>.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Body Areas */}
                <div className="p-6 rounded-[24px] border border-[var(--border-subtle)] bg-[var(--bg-card)] space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <MapPin className="w-4 h-4 text-[var(--accent-secondary)]" />
                        <h4 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Somatic Heatmap</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {bodyFreq.length > 0 ? bodyFreq.map((b, i) => (
                            <div
                                key={i}
                                className="px-3 py-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] transition-all hover:border-[var(--accent-secondary-border)]"
                                style={{
                                    borderColor: i === 0 ? 'var(--accent-secondary-border)' : 'var(--border-subtle)',
                                    background: i === 0 ? 'var(--accent-secondary-dim)' : 'var(--bg-surface)'
                                }}
                            >
                                <span className="text-[12px] text-[var(--text-primary)]">{b.name}</span>
                                <span className="ml-2 text-[10px] font-bold text-[var(--accent-secondary)]">{b.count}×</span>
                            </div>
                        )) : <p className="text-[11px] text-[var(--text-disabled)] italic">No somatic data yet.</p>}
                    </div>
                </div>
            </div>

            {/* Admin Logs Section */}
            {isAdmin && (
                <div className="space-y-8 pt-10 border-t border-[var(--border-subtle)]">
                    <div className="flex items-center gap-4">
                        <div className="w-2 h-2 rounded-full bg-[var(--accent-primary)] shadow-[0_0_10px_var(--accent-primary)]" />
                        <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-[var(--text-muted)] text-center">System Echoes (Admin)</h3>
                    </div>

                    <div className="rounded-[24px] border border-[var(--border-subtle)] bg-[var(--bg-card)] overflow-hidden">
                        <table className="w-full text-left text-[12px]">
                            <thead className="bg-[var(--bg-surface)] border-b border-[var(--border-subtle)]">
                                <tr>
                                    <th className="px-6 py-4 font-bold text-[var(--text-muted)] uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-4 font-bold text-[var(--text-muted)] uppercase tracking-wider">User</th>
                                    <th className="px-6 py-4 font-bold text-[var(--text-muted)] uppercase tracking-wider">Details</th>
                                    <th className="px-6 py-4 font-bold text-[var(--text-muted)] uppercase tracking-wider text-right">Moment</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-subtle)]">
                                {adminLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-[var(--bg-surface)] transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-0.5 rounded-full bg-[var(--accent-secondary-dim)] text-[var(--accent-secondary)] text-[10px] font-bold">
                                                {log.activityType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-[var(--text-secondary)]">{log.userEmail.split('@')[0]}</td>
                                        <td className="px-6 py-4 text-[var(--text-primary)]">{log.details}</td>
                                        <td className="px-6 py-4 text-right text-[var(--text-muted)]">
                                            {log.timestamp?.toDate ? log.timestamp.toDate().toLocaleDateString() : 'Now'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StatsDashboard;
