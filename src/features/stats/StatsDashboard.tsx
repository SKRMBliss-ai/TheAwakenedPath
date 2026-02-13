import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart2, Activity, Users } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { db } from '../../firebase';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { cn } from '../../lib/utils';

// Removed unused interface StatMetric

interface ActivityLog {
    id: string;
    userEmail: string;
    activityType: string;
    details: string;
    timestamp: any;
}

const StatsDashboard: React.FC = () => {
    const { user } = useAuth();
    const [weeklyActivity, setWeeklyActivity] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
    const [totalEntries, setTotalEntries] = useState(0);
    // Removed unused currentStreak/setCurrentStreak
    const [adminLogs, setAdminLogs] = useState<ActivityLog[]>([]);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        if (!user) return;

        // Check Admin Status
        if (user.email === 'shrutikhungar@gmail.com') {
            setIsAdmin(true);
            fetchAdminLogs();
        }

        fetchUserStats();
    }, [user]);

    const fetchUserStats = async () => {
        if (!user) return;

        // 1. Fetch Journal Entries for Total Count & Weekly Activity
        const journalRef = collection(db, 'users', user.uid, 'journal');
        const journalSnap = await getDocs(journalRef);

        setTotalEntries(journalSnap.size);

        // Calculate Weekly Activity (Last 7 Days)
        const activity = [0, 0, 0, 0, 0, 0, 0];
        const now = new Date();
        const oneDay = 24 * 60 * 60 * 1000;

        journalSnap.forEach(doc => {
            const data = doc.data();
            let date: Date;

            if (data.createdAt?.toDate) {
                date = data.createdAt.toDate();
            } else if (data.date) {
                // Fallback for string dates if timestamp is missing
                date = new Date(data.date);
            } else {
                return;
            }

            const diffDays = Math.round(Math.abs((now.getTime() - date.getTime()) / oneDay));
            if (diffDays < 7) {
                // Map to day index (0 is today, 6 is 6 days ago)
                // Actually, let's map to Mon-Sun index to be consistent
                const dayIndex = (date.getDay() + 6) % 7; // 0 = Mon, 6 = Sun
                activity[dayIndex] += 1;
            }
        });

        setWeeklyActivity(activity);

        // Mock Streak for now (real implementation would check consecutive days)
        // In a real app, you'd query the 'users' collection for the 'streak' field we updated in AuthContext
    };

    const fetchAdminLogs = async () => {
        const logsRef = collection(db, 'activity_logs');
        const q = query(logsRef, orderBy('timestamp', 'desc'), limit(20));
        const snapshot = await getDocs(q);

        const logs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as ActivityLog[];

        setAdminLogs(logs);
    };

    const maxActivity = Math.max(...weeklyActivity, 1); // Avoid div by zero

    return (
        <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
                <div>
                    <h2 className="text-4xl font-serif font-bold text-white tracking-tight mb-2">Soul Stats</h2>
                    <p className="text-white/60 uppercase tracking-[0.2em] text-xs">Your Journey in Numbers</p>
                </div>
                {isAdmin && (
                    <div className="px-4 py-2 bg-[#C65F9D]/20 border border-[#C65F9D]/40 rounded-full text-[#C65F9D] text-xs font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(198,95,157,0.2)]">
                        Admin View Active
                    </div>
                )}
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Entries Card */}
                <div className="card-glow p-8 rounded-3xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                        <BarChart2 className="w-24 h-24" />
                    </div>
                    <div className="relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-[#ABCEC9]/10 flex items-center justify-center mb-4">
                            <Activity className="w-6 h-6 text-[#ABCEC9]" />
                        </div>
                        <div className="text-4xl font-serif font-bold text-white mb-1">{totalEntries}</div>
                        <div className="text-[10px] uppercase tracking-widest text-white/40">Total Journal Entries</div>
                    </div>
                </div>

                {/* Weekly Activity Chart */}
                <div className="card-glow p-8 rounded-3xl md:col-span-2 flex flex-col justify-between">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-serif text-white">Weekly Rhythm</h3>
                        <Activity className="w-5 h-5 text-white/20" />
                    </div>

                    <div className="flex items-end justify-between h-32 gap-2">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                            <div key={day} className="flex flex-col items-center gap-2 flex-1">
                                <div className="w-full bg-white/5 rounded-t-lg relative h-full flex items-end overflow-hidden group">
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${(weeklyActivity[i] / maxActivity) * 100}%` }}
                                        className={cn(
                                            "w-full rounded-t-lg transition-all duration-500",
                                            weeklyActivity[i] > 0 ? "bg-[#ABCEC9]" : "bg-transparent"
                                        )}
                                    />
                                    {/* Hover Tooltip */}
                                    <div className="absolute inset-0 flex items-end justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-xs font-bold text-[#1a151b] mb-1">{weeklyActivity[i]}</span>
                                    </div>
                                </div>
                                <span className="text-[10px] uppercase font-bold text-white/30">{day}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Admin Section */}
            {isAdmin && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card-glow p-8 rounded-3xl space-y-6 mt-12 border-t-4 border-[#C65F9D]"
                >
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 rounded-xl bg-[#C65F9D]/20">
                            <Users className="w-6 h-6 text-[#C65F9D]" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-serif text-white">User Activity Stream</h3>
                            <p className="text-xs text-white/40 uppercase tracking-widest">Real-time Global Events</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        {adminLogs.length === 0 ? (
                            <div className="text-center py-8 text-white/30 italic">No recent activity found.</div>
                        ) : (
                            adminLogs.map(log => (
                                <div key={log.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-2 h-2 rounded-full bg-[#ABCEC9]" />
                                        <div>
                                            <div className="text-sm font-bold text-white">{log.userEmail}</div>
                                            <div className="text-xs text-white/50">{log.details}</div>
                                        </div>
                                    </div>
                                    <div className="text-xs text-white/30 mono">
                                        {log.timestamp?.toDate ? log.timestamp.toDate().toLocaleString() : 'Just now'}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default StatsDashboard;
