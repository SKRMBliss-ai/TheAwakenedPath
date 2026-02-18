import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart2, Activity, Users } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { db } from '../../firebase';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { cn } from '../../lib/utils';
import { tokens } from '../../components/ui/SacredUI';

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
    const [adminLogs, setAdminLogs] = useState<ActivityLog[]>([]);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        if (!user) return;

        if (user.email === 'shrutikhungar@gmail.com') {
            setIsAdmin(true);
            fetchAdminLogs();
        }

        fetchUserStats();
    }, [user]);

    const fetchUserStats = async () => {
        if (!user) return;

        const journalRef = collection(db, 'users', user.uid, 'journal');
        const journalSnap = await getDocs(journalRef);

        setTotalEntries(journalSnap.size);

        const activity = [0, 0, 0, 0, 0, 0, 0];
        const now = new Date();
        const oneDay = 24 * 60 * 60 * 1000;

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

            const diffDays = Math.round(Math.abs((now.getTime() - date.getTime()) / oneDay));
            if (diffDays < 7) {
                const dayIndex = (date.getDay() + 6) % 7;
                activity[dayIndex] += 1;
            }
        });

        setWeeklyActivity(activity);
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

    const maxActivity = Math.max(...weeklyActivity, 1);

    return (
        <div className="w-full space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-10">
                <div className="space-y-4">
                    <p className="text-[10px] uppercase tracking-[0.6em] text-white/20 font-bold">Activity Continuum</p>
                    <h2 className="text-6xl font-serif font-light text-white tracking-tight">Vibrational Metrics</h2>
                </div>
                <div className="text-right">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-[#ABCEC9] font-bold mb-2">Total Presence</p>
                    <span className="text-5xl font-serif text-white/90">{totalEntries}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Evolution Chart */}
                <div className="p-10 rounded-[48px] border border-white/5 bg-white/[0.01] backdrop-blur-sm space-y-12">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[#ABCEC9]/5 border border-[#ABCEC9]/10 flex items-center justify-center">
                            <BarChart2 className="w-5 h-5 text-[#ABCEC9]" />
                        </div>
                        <h4 className="text-xl font-serif font-light text-white/60 uppercase tracking-[0.2em]">Weekly Resonance</h4>
                    </div>

                    <div className="h-64 flex items-end justify-between px-4 pb-2">
                        {weeklyActivity.map((val, i) => {
                            const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
                            const height = (val / maxActivity) * 100;
                            return (
                                <div key={i} className="flex flex-col items-center gap-6 h-full justify-end group">
                                    <div className="relative w-2 h-full bg-white/[0.03] rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${height}%` }}
                                            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: i * 0.1 }}
                                            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#D16BA5] to-[#ABCEC9] rounded-full shadow-[0_0_15px_#ABCEC940]"
                                        />
                                    </div>
                                    <span className="text-[10px] font-bold text-white/10 group-hover:text-[#ABCEC9] transition-colors">{days[i]}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 gap-8">
                    <div className="p-12 rounded-[48px] border border-white/5 bg-white/[0.01] flex flex-col justify-between h-56 group hover:bg-white/[0.03] transition-all duration-700 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#ABCEC9]/5 blur-[60px] rounded-full pointer-events-none" />
                        <div className="w-12 h-12 rounded-2xl bg-[#ABCEC9]/5 border border-[#ABCEC9]/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
                            <Activity className="w-6 h-6 text-[#ABCEC9]" />
                        </div>
                        <div>
                            <div className="text-5xl font-serif font-light text-white mb-2 tracking-tight">High</div>
                            <span className="text-[9px] font-bold uppercase tracking-[0.6em] text-white/20">VIBRATIONAL FLOW</span>
                        </div>
                    </div>

                    <div className="p-12 rounded-[48px] border border-white/5 bg-white/[0.01] flex flex-col justify-between h-56 group hover:bg-white/[0.03] transition-all duration-700 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-[60px] rounded-full pointer-events-none" />
                        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
                            <Users className="w-6 h-6 text-white/30" />
                        </div>
                        <div>
                            <div className="text-5xl font-serif font-light text-white mb-2 tracking-tight">Active</div>
                            <span className="text-[9px] font-bold uppercase tracking-[0.6em] text-white/20">SACRED CONNECTION</span>
                        </div>
                    </div>
                </div>
            </div>

            {isAdmin && (
                <div className="space-y-10 pt-16 border-t border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#D16BA5] shadow-[0_0_10px_#D16BA5]" />
                        <h3 className="text-[11px] font-bold uppercase tracking-[0.8em] text-white/30">Ancestral Echoes (Admin Log)</h3>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {adminLogs.map((log) => (
                            <div key={log.id} className="p-8 rounded-[32px] border border-white/5 bg-white/[0.01] flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group hover:bg-white/[0.02] transition-all">
                                <div className="space-y-2">
                                    <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-[#ABCEC9]/40">{log.userEmail}</p>
                                    <h5 className="text-xl font-serif font-light text-white/70">{log.activityType}: <span className="text-white/40">{log.details}</span></h5>
                                </div>
                                <span className="text-[10px] font-bold text-white/10">{log.timestamp?.toDate ? log.timestamp.toDate().toLocaleDateString() : 'Present Moment'}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StatsDashboard;
