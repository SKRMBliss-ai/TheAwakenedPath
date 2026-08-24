import { useState, useEffect } from 'react';
import { 
    collection, 
    query, 
    where, 
    getDocs, 
    Timestamp
} from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../auth/AuthContext';
import { 
    Activity, 
    Calendar, 
    TrendingUp, 
    Target,
    Heart,
    BookOpen,
    Zap,
    ChevronRight,
    Search,
    RefreshCw,
    AlertCircle,
    Info
} from 'lucide-react';

// Type definitions for activity tracking
interface ActivityData {
    id: string;
    type: 'LEARN' | 'PRACTICE' | 'REFLECT' | 'LIVE';
    timestamp: any;
    duration?: number;
    title: string;
    source?: string;
}

const StreakGrid = ({ streakArr }: { streakArr: number[] }) => {
    // We display 4 weeks (28 days)
    const weeks = [];
    for (let i = 0; i < 4; i++) {
        weeks.push(streakArr.slice(i * 7, (i + 1) * 7));
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Calculate current Monday
    const currentMonday = new Date(startOfToday);
    const day = currentMonday.getDay();
    const diff = currentMonday.getDate() - day + (day === 0 ? -6 : 1);
    currentMonday.setDate(diff);

    const getWeekRange = (weekIdx: number) => {
        const monday = new Date(currentMonday);
        monday.setDate(currentMonday.getDate() - ((3 - weekIdx) * 7));
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        
        const format = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
        return `${format(monday)} – ${format(sunday)}`;
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
                            {week.map((count, i) => {
                                // Calculate the actual date for this cell to find "Today"
                                const cellDate = new Date(currentMonday);
                                cellDate.setDate(currentMonday.getDate() - ((3 - widx) * 7) + i);
                                const isToday = cellDate.getTime() === startOfToday.getTime();
                                
                                // A day is "Practiced" (Solid) only if goal met
                                const goalMet = count >= 4;
                                const hasActivity = count > 0;

                                return (
                                    <div
                                        key={i}
                                        className={`w-[18px] h-[18px] rounded-sm transition-all duration-500 relative`}
                                        style={{
                                            background: goalMet
                                                ? 'var(--accent-secondary-dim)'
                                                : hasActivity
                                                    ? 'var(--accent-secondary)10' // More subtle for partial
                                                    : isToday 
                                                        ? 'transparent'
                                                        : 'var(--border-subtle)',
                                            border: goalMet
                                                ? '1.5px solid var(--accent-secondary)'
                                                : hasActivity
                                                    ? '1.5px solid var(--accent-secondary)25' // More subtle border
                                                    : isToday
                                                        ? '1.5px dashed var(--accent-secondary-dim)'
                                                        : '1.5px solid var(--border-default)',
                                            boxShadow: (goalMet && isToday) ? '0 0 12px var(--accent-secondary)40' : 'none',
                                        }}
                                        aria-label={`${isToday ? "Today" : cellDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: ${count} Activities`}
                                    >
                                        {isToday && !goalMet && (
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

const StatsDashboard = ({ onNavigate }: { onNavigate?: (id: string) => void }) => {
    const { user, profile, loading: authLoading } = useAuth();
    const [activities, setActivities] = useState<{LEARN: number, PRACTICE: number, REFLECT: number, LIVE: number, total: number}[]>(
        new Array(7).fill(null).map(() => ({ LEARN: 0, PRACTICE: 0, REFLECT: 0, LIVE: 0, total: 0 }))
    );
    const [streakData, setStreakData] = useState<number[]>(new Array(28).fill(0));
    const [activityLogs, setActivityLogs] = useState<ActivityData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserStats = async () => {
            if (!user || authLoading) return;
            setLoading(true);
            setError(null);

            try {
                console.log("Fetching stats for user:", user.uid);
                
                // Get activities from the last month for the streak grid
                const now = new Date();
                const oneMonthAgo = new Date();
                oneMonthAgo.setDate(now.getDate() - 31);
                
                const q = query(
                    collection(db, 'activity_logs'),
                    where('userId', '==', user.uid),
                    where('timestamp', '>=', Timestamp.fromDate(oneMonthAgo))
                );

                const snapshot = await getDocs(q);
                console.log("Fetched documents count:", snapshot.size);

                const activity = new Array(7).fill(null).map(() => ({ LEARN: 0, PRACTICE: 0, REFLECT: 0, LIVE: 0, total: 0 }));
                const streakArr = new Array(28).fill(0);
                const logs: ActivityData[] = [];

                // Weekly Momentum start
                const startOfWeek = new Date();
                const day = startOfWeek.getDay();
                const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
                startOfWeek.setDate(diff);
                startOfWeek.setHours(0, 0, 0, 0);

                // Grid start (4 weeks back from current Monday or Today)
                const gridStart = new Date(startOfWeek);
                gridStart.setDate(startOfWeek.getDate() - 21);

                snapshot.forEach(doc => {
                    const data = doc.data() as ActivityData;
                    const date = data.timestamp.toDate();
                    
                    logs.push({ ...data, id: doc.id });

                    const itemDate = new Date(date);
                    itemDate.setHours(0, 0, 0, 0);
                    const oneDay = 24 * 60 * 60 * 1000;
                    
                    const gridDiffTime = itemDate.getTime() - gridStart.getTime();
                    const gridDiffDays = Math.round(gridDiffTime / oneDay);

                    if (gridDiffDays >= 0 && gridDiffDays < 28) {
                        streakArr[gridDiffDays] += 1;
                    }

                    // Weekly activity (Current Calendar Week only)
                    const dayIndex = (date.getDay() + 6) % 7;
                    if (date >= startOfWeek && date <= now) {
                        const todayIndex = (now.getDay() + 6) % 7;
                        if (dayIndex >= 0 && dayIndex <= todayIndex) {
                            activity[dayIndex].total++;
                            if (data.type) {
                                const typeKey = data.type.toUpperCase();
                                if (['LEARN', 'PRACTICE', 'REFLECT', 'LIVE'].includes(typeKey)) {
                                    activity[dayIndex][typeKey as keyof typeof activity[0]]++;
                                } else {
                                    activity[dayIndex].PRACTICE++;
                                }
                            } else {
                                activity[dayIndex].PRACTICE++;
                            }
                        }
                    }
                });

                setActivities(activity);
                setStreakData(streakArr);
                setActivityLogs(logs.sort((a, b) => b.timestamp.toDate() - a.timestamp.toDate()));
            } catch (err) {
                console.error("Error fetching stats:", err);
                setError("Failed to load your journey data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchUserStats();
    }, [user]);

    if (loading) {
        return (
            <div className="min-h-screen pt-32 px-6 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <RefreshCw className="w-8 h-8 text-[var(--accent-secondary)] animate-spin" />
                    <p className="text-[var(--text-muted)] font-medium animate-pulse">Syncing your progress...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen pt-32 px-6 flex items-center justify-center">
                <div className="card-refined max-w-md w-full bg-red-500/5 border-red-500/20 text-center p-8">
                    <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <h2 className="text-xl font-medium text-white mb-2">Connection Issue</h2>
                    <p className="text-[var(--text-muted)] mb-6 text-sm">{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="px-6 py-2.5 bg-white/10 hover:bg-white/20 rounded-full text-sm font-semibold transition-all border border-white/10"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto space-y-12">
            {/* Header / Summary */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-[#ABCEC920] rounded-xl border border-[#ABCEC930]">
                            <TrendingUp className="w-5 h-5 text-[#ABCEC9]" />
                        </div>
                        <h1 className="text-4xl font-light tracking-tight text-white m-0">Journey <span className="opacity-40 italic">Insight</span></h1>
                    </div>
                </div>
                
                <div className="flex items-center gap-12">
                    <div className="text-right flex flex-col items-end">
                        <div className="flex items-center gap-2 mb-1">
                            <Zap className="w-4 h-4 text-orange-400 fill-orange-400" />
                            <span className="text-2xl font-medium tracking-tight text-white">{profile?.streak || 0}</span>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] opacity-60">Day Streak</span>
                    </div>
                    <div className="text-right flex flex-col items-end">
                        <div className="flex items-center gap-2 mb-1">
                            <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
                            <span className="text-2xl font-medium tracking-tight text-white">{profile?.xp || 0}</span>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] opacity-60">Insight XP</span>
                    </div>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 1. Weekly Momentum */}
                <div className="card-refined p-8 bg-[var(--bg-surface)] border-[var(--border-subtle)] overflow-hidden">
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <Activity className="w-5 h-5 text-blue-400" />
                            </div>
                            <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-white opacity-80 m-0">Weekly Momentum</h2>
                            <Info className="w-3.5 h-3.5 text-[var(--text-muted)] cursor-help opacity-40 ml-1" aria-label="Daily activity breakdown across different modalities." />
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                                <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-secondary)]" />
                                <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Target(4)</span>
                            </div>
                            <span className="text-[10px] font-semibold text-[var(--text-muted)]">
                                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {
                                    new Date(new Date().setDate(new Date().getDate() + (6 - (new Date().getDay() + 6) % 7))).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                }
                            </span>
                        </div>
                    </div>

                    <div className="h-64 flex items-end justify-between relative pt-8">
                        {/* Target Line */}
                        <div className="absolute left-0 right-0 top-[40%] border-t border-dashed border-white/10 z-0">
                            <span className="absolute -top-2.5 right-0 text-[8px] font-bold text-[var(--text-muted)] uppercase opacity-40 tracking-widest">Goal: 4</span>
                        </div>
                        
                        {activities.map((val, i) => {
                            const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
                            const isToday = i === (new Date().getDay() + 6) % 7;
                            const count = val.total;
                            const height = Math.min(count * 15, 100); // 15% height per activity, max 100%
                            const targetReached = count >= 4;

                            const learnPct = count > 0 ? (val.LEARN / count) * 100 : 0;
                            const practicePct = count > 0 ? (val.PRACTICE / count) * 100 : 0;
                            const reflectPct = count > 0 ? (val.REFLECT / count) * 100 : 0;
                            const livePct = count > 0 ? (val.LIVE / count) * 100 : 0;

                            return (
                                <div key={i} className="flex flex-col items-center gap-4 flex-1">
                                    <div className="relative w-full flex flex-col items-center group">
                                        {/* Value Indicator */}
                                        <div className={`text-[12px] font-bold mb-2 transition-all duration-300 ${targetReached ? 'text-orange-300 scale-125' : 'text-[var(--text-muted)]'}`}>
                                            {count}
                                        </div>
                                        
                                        {/* Activity Icon for reached target */}
                                        {targetReached && (
                                            <div className="absolute -top-8 bg-orange-500/20 border border-orange-500/30 rounded-full p-1 shadow-[0_0_15px_rgba(251,146,60,0.3)]">
                                                <Zap className="w-3 h-3 text-orange-400" />
                                            </div>
                                        )}

                                        {/* Bar Container */}
                                        <div className="w-10 h-48 bg-white/5 rounded-lg border border-white/10 flex flex-col justify-end overflow-hidden group-hover:bg-white/10 transition-colors">
                                            <div 
                                                className="w-full transition-all duration-1000 ease-out flex flex-col-reverse relative"
                                                style={{ height: `${height}%` }}
                                            >
                                                {/* Component layers Stacked based on real data */}
                                                {learnPct > 0 && <div className="w-full bg-blue-500/60 transition-all duration-500" style={{ height: `${learnPct}%` }} />}
                                                {practicePct > 0 && <div className="w-full bg-emerald-500/60 transition-all duration-500" style={{ height: `${practicePct}%` }} />}
                                                {reflectPct > 0 && <div className="w-full bg-rose-500/60 transition-all duration-500" style={{ height: `${reflectPct}%` }} />}
                                                {livePct > 0 && <div className="w-full bg-orange-500/60 transition-all duration-500" style={{ height: `${livePct}%` }} />}
                                                
                                                {/* Completed Mark */}
                                                {targetReached && (
                                                    <div className="absolute inset-0 bg-white/10 animate-pulse pointer-events-none" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <span className={`text-[11px] font-bold transition-colors ${isToday ? 'text-[#ABCEC9]' : 'text-[var(--text-muted)] opacity-60'}`}>
                                        {days[i]}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Legend */}
                    <div className="mt-12 pt-8 border-t border-white/5 flex flex-wrap gap-6">
                        {[
                            { label: 'Learn', color: 'bg-blue-500' },
                            { label: 'Practice', color: 'bg-emerald-500' },
                            { label: 'Reflect', color: 'bg-rose-500' },
                            { label: 'Live', color: 'bg-orange-500' }
                        ].map(item => (
                            <div key={item.label} className="flex items-center gap-2.5">
                                <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. Consistency Grid */}
                <div className="card-refined p-8 bg-[var(--bg-surface)] border-[var(--border-subtle)]">
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-500/10 rounded-lg">
                                <Calendar className="w-5 h-5 text-emerald-400" />
                            </div>
                            <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-white opacity-80 m-0">Practice Consistency</h2>
                            <Info className="w-3.5 h-3.5 text-[var(--text-muted)] cursor-help opacity-40 ml-1" aria-label="Consistency over the last 4 weeks. Solid boxes represent days where you met your practice depth goal." />
                        </div>
                    </div>

                    <StreakGrid streakArr={streakData} />

                    <div className="mt-10 pt-8 border-t border-white/5 flex items-center gap-8">
                        <div className="flex items-center gap-2.5">
                            <div className="w-3 h-3 rounded-sm bg-[var(--accent-secondary-dim)] border border-[var(--accent-secondary)]" />
                            <span className="text-[11px] italic text-[var(--text-muted)]">Practiced</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <div className="w-3 h-3 rounded-sm bg-[var(--border-subtle)] border border-[var(--border-default)]" />
                            <span className="text-[11px] italic text-[var(--text-muted)]">Rest / Stillness</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Section: Emotional Landscape & History */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8">
                {/* 3. Success Rate / Metrics */}
                <div className="card-refined p-8 flex flex-col justify-between">
                    <div>
                        <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-white opacity-40 mb-10">Integration Focus</h2>
                        <div className="space-y-8">
                            <div className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <span className="text-[11px] font-medium text-white/60">Practice Depth</span>
                                    <span className="text-[12px] font-bold text-white">82%</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500/40 rounded-full" style={{ width: '82%' }} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <span className="text-[11px] font-medium text-white/60">Mindful Awareness</span>
                                    <span className="text-[12px] font-bold text-white">65%</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500/40 rounded-full" style={{ width: '65%' }} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <span className="text-[11px] font-medium text-white/60">Journal Consistency</span>
                                    <span className="text-[12px] font-bold text-white">45%</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-rose-500/40 rounded-full" style={{ width: '45%' }} />
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => onNavigate?.('journey')}
                        className="mt-12 w-full py-3.5 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 rounded-xl transition-all flex items-center justify-center gap-3 group"
                    >
                        <span className="text-xs font-bold uppercase tracking-widest text-[#ABCEC9]">Full Journey Report</span>
                        <ChevronRight className="w-4 h-4 text-[#ABCEC9] transition-transform group-hover:translate-x-1" />
                    </button>
                </div>

                {/* 4. Activity Feed */}
                <div className="card-refined p-0 lg:col-span-2 flex flex-col overflow-hidden">
                    <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                        <div className="flex items-center gap-3">
                            <Search className="w-4 h-4 text-[var(--text-muted)] opacity-40" />
                            <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-white opacity-80 m-0">Recent Awareness Moments</h2>
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto max-h-[400px] custom-scrollbar">
                        {activityLogs.length > 0 ? (
                            <div className="divide-y divide-white/5">
                                {activityLogs.slice(0, 10).map((log, i) => (
                                    <div key={log.id || i} className="p-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2.5 rounded-xl border ${
                                                log.type === 'LEARN' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                                                log.type === 'PRACTICE' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                                log.type === 'REFLECT' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                                                'bg-orange-500/10 border-orange-500/20 text-orange-400'
                                            }`}>
                                                {log.type === 'LEARN' ? <BookOpen className="w-4 h-4" /> :
                                                 log.type === 'PRACTICE' ? <Target className="w-4 h-4" /> :
                                                 log.type === 'REFLECT' ? <Heart className="w-4 h-4" /> :
                                                 <Activity className="w-4 h-4" />}
                                            </div>
                                            <div>
                                                <h4 className="text-[13px] font-medium text-white mb-0.5 group-hover:text-[#ABCEC9] transition-colors">{log.title}</h4>
                                                <p className="text-[10px] text-[var(--text-muted)] font-medium uppercase tracking-wider opacity-40 m-0">{log.source || 'General Practice'}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[11px] text-white/50 mb-0.5 font-medium">
                                                {log.timestamp.toDate().toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                            </div>
                                            <div className="text-[9px] text-[var(--text-muted)] uppercase tracking-widest opacity-40">
                                                {log.timestamp.toDate().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center p-12 text-center opacity-40">
                                <Activity className="w-12 h-12 mb-4" />
                                <p className="text-sm italic">Begin your practice to see your awareness feed grow.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatsDashboard;
