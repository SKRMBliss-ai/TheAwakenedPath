import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RefreshCw, Mail, Monitor, Eye, Megaphone, Send } from 'lucide-react';
import { db, functions } from '../../firebase';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { WhisperInput, AnchorButton, SacredToast } from '../../components/ui/SacredUI';
import { isMonitoredEmail } from '../../config/admin';
import { cn } from '../../lib/utils';

interface ActivityLog {
    id: string;
    userId: string;
    userEmail: string;
    activityType: string;
    details: string;
    location?: string;
    timestamp: any;
}

interface EngagementReportProps {
    isOpen: boolean;
    onClose: () => void;
}

const EngagementReport: React.FC<EngagementReportProps> = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState<'logs' | 'users' | 'blast' | 'history'>('logs');
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // Blast Form State
    const [blastTitle, setBlastTitle] = useState('');
    const [blastSubtitle, setBlastSubtitle] = useState('');
    const [isBlasting, setIsBlasting] = useState(false);
    const [toast, setToast] = useState('');

    // Blast History State
    const [blasts, setBlasts] = useState<any[]>([]);

    const fetchHistory = async () => {
        setIsLoading(true);
        try {
            const blastsRef = collection(db, 'email_blasts');
            const q = query(blastsRef, orderBy('sentAt', 'desc'), limit(20));
            const snapshot = await getDocs(q);
            
            const fetchedBlasts = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // For each blast, get open counts
            const enrichedBlasts = await Promise.all(fetchedBlasts.map(async (blast) => {
                const opensRef = collection(db, 'email_opens');
                const opensQuery = query(opensRef, where('blastId', '==', blast.id));
                const opensSnap = await getDocs(opensQuery);
                return { ...blast, opens: opensSnap.size };
            }));

            setBlasts(enrichedBlasts);
        } catch (error) {
            console.error("Error fetching blast history:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const usersRef = collection(db, 'users');
            const q = query(usersRef, orderBy('lastLogin', 'desc'), limit(100));
            const snapshot = await getDocs(q);
            
            const fetchedUsers = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setUsers(fetchedUsers);
        } catch (error) {
            console.error("Error fetching admin users:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchLogs = async () => {
        setIsLoading(true);
        try {
            const logsRef = collection(db, 'activity_logs');
            const q = query(logsRef, orderBy('timestamp', 'desc'), limit(150));
            const snapshot = await getDocs(q);
            
            const fetchedLogs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as ActivityLog[];

            const filteredLogs = fetchedLogs
                .filter(log => isMonitoredEmail(log.userEmail))
                .slice(0, 100);

            setLogs(filteredLogs);
        } catch (error) {
            console.error("Error fetching admin logs:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBlastUpdate = async () => {
        if (!blastTitle || !blastSubtitle) return;
        setIsBlasting(true);
        try {
            const blastFn = httpsCallable(functions, 'blastUpdateEmail');
            await blastFn({
                chapterTitle: blastTitle,
                chapterSubtitle: blastSubtitle
            });
            setToast('Course update email sent successfully.');
            setBlastTitle('');
            setBlastSubtitle('');
            setTimeout(() => setToast(''), 4000);
        } catch (error) {
            console.error("Blast failed:", error);
            setToast('Failed to send update email.');
            setTimeout(() => setToast(''), 4000);
        } finally {
            setIsBlasting(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            if (activeTab === 'logs') fetchLogs();
            if (activeTab === 'users') fetchUsers();
            if (activeTab === 'history') fetchHistory();
        }
    }, [isOpen, activeTab]);

    const formatTimestamp = (ts: any) => {
        if (!ts) return { date: '---', time: '---' };
        const dateObj = ts.toDate ? ts.toDate() : new Date(ts);

        return {
            date: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            time: dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        };
    };

    const getSourceIcon = (type: string) => {
        if (type === 'LOGIN' || type === 'SESSION_START') return <Monitor className="w-4 h-4 text-[var(--accent-primary)]" />;
        if (type === 'EMAIL_OPEN') return <Eye className="w-4 h-4 text-[var(--accent-primary)]" />;
        return <Mail className="w-4 h-4 text-[#E67E22]" />;
    };

    const getSourceLabel = (type: string) => {
        if (type === 'LOGIN') return 'SIGN IN';
        if (type === 'SESSION_START') return 'PRESENCE';
        if (type === 'EMAIL_OPEN') return 'OPENED';
        return 'EMAIL';
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="relative w-full max-w-3xl max-h-[90vh] bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[24px] shadow-[0_32px_128px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-[#2A2A2A] flex justify-between items-start">
                            <div className="flex gap-4">
                                <div className="p-3 rounded-xl bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] shadow-inner">
                                    {activeTab === 'logs' ? <Mail className="w-6 h-6 text-[var(--accent-primary)]" /> : <Megaphone className="w-6 h-6 text-[var(--accent-primary)]" />}
                                </div>
                                <div>
                                    <h2 className="text-[22px] font-bold text-[var(--accent-primary)] tracking-wider uppercase">
                                        {activeTab === 'logs' ? 'Engagement Report' : activeTab === 'blast' ? 'Send Course Update' : 'Email History'}
                                    </h2>
                                    <p className="text-[11px] text-[var(--text-muted)] tracking-[0.2em] font-bold uppercase mt-1">
                                        {activeTab === 'logs' ? 'Tracking User Activity' : activeTab === 'blast' ? 'Send an email update to all registered users' : 'History of all course update emails sent'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex gap-2 bg-[var(--bg-surface-hover)] p-1 rounded-full border border-[var(--border-subtle)]">
                                    <button 
                                        onClick={() => setActiveTab('logs')}
                                        className={cn(
                                            "px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all",
                                            activeTab === 'logs' ? "bg-[var(--accent-primary)] text-black" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                                        )}
                                    >
                                        Activity
                                    </button>
                                    <button 
                                        onClick={() => setActiveTab('users')}
                                        className={cn(
                                            "px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all",
                                            activeTab === 'users' ? "bg-[var(--accent-primary)] text-black" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                                        )}
                                    >
                                        Users
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('blast')}
                                        className={cn(
                                            "px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all",
                                            activeTab === 'blast' ? "bg-[var(--accent-primary)] text-black" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                                        )}
                                    >
                                        Broadcast
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('history')}
                                        className={cn(
                                            "px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all",
                                            activeTab === 'history' ? "bg-[var(--accent-primary)] text-black" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                                        )}
                                    >
                                        History
                                    </button>
                                </div>

                                <button
                                    onClick={onClose}
                                    className="p-3 rounded-full hover:bg-[var(--bg-surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all border border-transparent hover:border-[var(--border-subtle)]"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {activeTab === 'logs' ? (
                            <>
                                {activeTab === 'logs' && (
                                    <div className="px-10 py-4 bg-[var(--bg-surface-hover)] border-b border-[var(--border-subtle)]/50">
                                        <div className="relative">
                                            <input 
                                                type="text"
                                                placeholder="Search by email, action, or location..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl py-2.5 pl-10 pr-4 text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]/50 transition-colors"
                                            />
                                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                                                <Eye className="w-4 h-4" />
                                            </div>
                                            {searchTerm && (
                                                <button 
                                                    onClick={() => setSearchTerm('')}
                                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Table Header */}
                                <div className="px-10 py-6 grid grid-cols-[1.5fr_1fr_1.5fr_0.8fr_0.8fr_0.4fr] text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] items-center border-b border-[var(--border-subtle)]/50">
                                    <div>User</div>
                                    <div>Action</div>
                                    <div>Location</div>
                                    <div>Date</div>
                                    <div>Time</div>
                                    <div className="text-right">
                                        <button onClick={fetchLogs} disabled={isLoading} className="hover:text-[var(--accent-primary)] transition-colors">
                                            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                                        </button>
                                    </div>
                                </div>

                                {/* Scrollable Body */}
                                <div className="flex-1 overflow-y-auto px-6 pb-8 custom-scrollbar">
                                    <div className="space-y-1">
                                        {logs
                                            .filter(log => {
                                                if (!searchTerm) return true;
                                                const s = searchTerm.toLowerCase();
                                                return (
                                                    log.userEmail?.toLowerCase().includes(s) ||
                                                    log.activityType?.toLowerCase().includes(s) ||
                                                    log.location?.toLowerCase().includes(s) ||
                                                    getSourceLabel(log.activityType).toLowerCase().includes(s)
                                                );
                                            })
                                            .map((log) => {
                                            const { date, time } = formatTimestamp(log.timestamp);
                                            const userName = log.userEmail ? log.userEmail.split('@')[0] : 'User';
                                            const displayName = userName.charAt(0).toUpperCase() + userName.slice(1);

                                            return (
                                                <motion.div
                                                    key={log.id}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    className="grid grid-cols-[1.5fr_1fr_1.5fr_0.8fr_0.8fr_0.4fr] items-center px-4 py-4 rounded-xl hover:bg-[var(--bg-surface)]/50 transition-colors border-b border-[var(--border-subtle)]/30 last:border-0 group"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--bg-surface)] to-[var(--bg-primary)] border border-[var(--border-default)] flex items-center justify-center overflow-hidden shrink-0">
                                                            <span className="text-[12px] font-bold text-[var(--text-muted)]">{displayName.charAt(0)}</span>
                                                        </div>
                                                        <div className="flex flex-col min-w-0">
                                                            <span className="text-[13px] font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors truncate">{displayName}</span>
                                                            <span className="text-[8px] text-[var(--text-muted)] font-bold uppercase tracking-widest truncate">{log.userEmail}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        {getSourceIcon(log.activityType)}
                                                        <span className="text-[11px] font-bold text-[var(--text-secondary)] tracking-tight">{getSourceLabel(log.activityType)}</span>
                                                    </div>

                                                    <div className="text-[12px] text-[var(--text-muted)] italic pr-2 truncate" title={log.location || 'Unknown'}>
                                                        {log.location || 'Unknown'}
                                                    </div>

                                                    <div className="text-[12px] text-[var(--text-secondary)]">{date}</div>

                                                    <div className="text-[12px] font-bold text-[var(--accent-primary)]">{time}</div>

                                                    <div className="flex justify-end">
                                                        <button className="p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[var(--bg-surface-hover)] text-[var(--text-muted)] hover:text-[var(--accent-primary)]">
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}

                                        {logs.length === 0 && !isLoading && (
                                            <div className="py-20 text-center">
                                                <p className="text-[var(--text-muted)] italic">No activity found yet...</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : activeTab === 'users' ? (
                            <>
                                <div className="px-10 py-4 bg-[var(--bg-surface-hover)] border-b border-[var(--border-subtle)]/50">
                                    <div className="relative">
                                        <input 
                                            type="text"
                                            placeholder="Search by name or email..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl py-2.5 pl-10 pr-4 text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]/50 transition-colors"
                                        />
                                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                                            <Eye className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>

                                <div className="px-10 py-6 grid grid-cols-[1.5fr_1.5fr_1fr_1fr_0.4fr] text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] items-center border-b border-[var(--border-subtle)]/50">
                                    <div>User</div>
                                    <div>Email</div>
                                    <div>Joined</div>
                                    <div>Last Presence / Login</div>
                                    <div className="text-right">
                                        <button onClick={fetchUsers} disabled={isLoading} className="hover:text-[var(--accent-primary)] transition-colors">
                                            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto px-6 pb-8 custom-scrollbar">
                                    <div className="space-y-1">
                                        {users
                                            .filter(u => {
                                                if (!searchTerm) return true;
                                                const s = searchTerm.toLowerCase();
                                                return (
                                                    u.email?.toLowerCase().includes(s) ||
                                                    u.displayName?.toLowerCase().includes(s)
                                                );
                                            })
                                            .map((u) => {
                                                const { date: joinedDate } = formatTimestamp(u.createdAt);
                                                const { date: loginDate, time: loginTime } = formatTimestamp(u.lastLogin);
                                                const displayName = u.displayName || u.email?.split('@')[0] || 'Unknown';

                                                return (
                                                    <motion.div
                                                        key={u.id}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        className="grid grid-cols-[1.5fr_1.5fr_1fr_1fr_0.4fr] items-center px-4 py-4 rounded-xl hover:bg-[var(--bg-surface)]/50 transition-colors border-b border-[var(--border-subtle)]/30 last:border-0 group"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--bg-surface)] to-[var(--bg-primary)] border border-[var(--border-default)] flex items-center justify-center overflow-hidden shrink-0">
                                                                <span className="text-[12px] font-bold text-[var(--text-muted)]">{displayName.charAt(0).toUpperCase()}</span>
                                                            </div>
                                                            <span className="text-[13px] font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors truncate">{displayName}</span>
                                                        </div>

                                                        <div className="text-[12px] text-[var(--text-secondary)] truncate">{u.email}</div>
                                                        <div className="text-[12px] text-[var(--text-muted)]">{joinedDate}</div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[12px] text-[var(--text-secondary)]">{loginDate || 'Never'}</span>
                                                            <span className="text-[10px] font-bold text-[var(--accent-primary)]">{loginTime}</span>
                                                        </div>

                                                        <div className="flex justify-end items-center gap-2">
                                                            {u.lastLogin && (
                                                                <span className="text-[8px] font-black tracking-tighter text-[var(--accent-primary)] opacity-40 uppercase">Logged</span>
                                                            )}
                                                            <div className={cn(
                                                                "w-2 h-2 rounded-full",
                                                                u.lastLogin ? "bg-[var(--accent-primary)] shadow-[0_0_8px_var(--accent-primary)]" : "bg-neutral-800"
                                                            )} />
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                    </div>
                                </div>
                            </>
                        ) : activeTab === 'blast' ? (
                            <div className="flex-1 p-12 overflow-y-auto custom-scrollbar">
                                <div className="max-w-2xl mx-auto space-y-10">
                                    {/* Instructional Guide */}
                                    <div className="p-6 rounded-2xl bg-[var(--accent-primary)]/5 border border-[var(--accent-primary)]/20 space-y-3 shadow-sm">
                                        <h3 className="text-[12px] font-bold text-[var(--accent-primary)] uppercase tracking-widest">How to send an update:</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] text-[var(--text-muted)] font-bold">STEP 1</span>
                                                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">Enter the chapter title or email subject below.</p>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] text-[var(--text-muted)] font-bold">STEP 2</span>
                                                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">Describe the update or write your guidance details.</p>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] text-[var(--text-muted)] font-bold">STEP 3</span>
                                                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">Review the preview and click "Send Update".</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-12 py-4">
                                        <div className="relative p-6 rounded-2xl bg-[var(--bg-surface)]/30 border border-[var(--border-subtle)] focus-within:border-[var(--accent-primary)]/40 transition-colors">
                                            <WhisperInput 
                                                label="1. Email Subject / Chapter Title"
                                                placeholder="Example: New Lesson added: The Observer"
                                                value={blastTitle}
                                                onChange={setBlastTitle}
                                            />
                                        </div>
                                        <div className="relative p-6 rounded-2xl bg-[var(--bg-surface)]/30 border border-[var(--border-subtle)] focus-within:border-[var(--accent-primary)]/40 transition-colors">
                                            <WhisperInput 
                                                label="2. Description / Details"
                                                placeholder="Example: We have added a new deep-dive lesson on the Witnessing Presence."
                                                multiline
                                                value={blastSubtitle}
                                                onChange={setBlastSubtitle}
                                            />
                                        </div>
                                    </div>

                                    <div className="p-8 rounded-[32px] bg-[var(--bg-surface)]/50 border border-[var(--border-default)] space-y-4 shadow-sm">
                                        <div className="flex justify-between items-center">
                                            <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-[0.3em]">Live Email Preview</p>
                                            <div className="px-3 py-1 rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] text-[9px] font-bold uppercase tracking-widest border border-[var(--accent-primary)]/20">Sent to all users</div>
                                        </div>
                                        <div className="border border-[var(--border-subtle)] rounded-2xl p-8 bg-[var(--bg-primary)] font-sans shadow-inner">
                                            <p className="text-[var(--accent-primary)] text-xl font-bold mb-3 uppercase tracking-tight">{blastTitle || "New Chapter: [Title will appear here]"}</p>
                                            <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{blastSubtitle || "The detailed information you type above will be shown here..."}</p>
                                        </div>
                                    </div>

                                    <div className="flex justify-center pt-6 pb-12">
                                        <AnchorButton 
                                            variant="solid" 
                                            onClick={handleBlastUpdate}
                                            loading={isBlasting}
                                            disabled={!blastTitle || !blastSubtitle}
                                            className="min-w-[280px] shadow-[0_10px_30px_rgba(0,0,0,0.1)]"
                                        >
                                            <div className="flex items-center justify-center gap-3 py-2">
                                                <Send className="w-5 h-5" />
                                                <span className="text-[13px] font-bold tracking-widest uppercase">Send Update to All Users</span>
                                            </div>
                                        </AnchorButton>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* History View */}
                                <div className="px-10 py-6 grid grid-cols-[2fr_1fr_0.8fr_0.8fr_0.5fr] text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] items-center border-b border-[var(--border-subtle)]/50">
                                    <div>Subject / Guidance</div>
                                    <div>Date Sent</div>
                                    <div className="text-center">Sent To</div>
                                    <div className="text-center">Opened</div>
                                    <div className="text-right">
                                        <button onClick={fetchHistory} disabled={isLoading} className="hover:text-[var(--accent-primary)] transition-colors">
                                            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto px-6 pb-8 custom-scrollbar">
                                    <div className="space-y-1">
                                        {blasts.map((blast) => {
                                            const { date, time } = formatTimestamp(blast.sentAt);
                                            const openRate = blast.totalRecipients > 0 ? Math.round((blast.opens / blast.totalRecipients) * 100) : 0;

                                            return (
                                                <motion.div
                                                    key={blast.id}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    className="grid grid-cols-[2fr_1fr_0.8fr_0.8fr_0.5fr] items-center px-4 py-6 rounded-xl hover:bg-[var(--bg-surface)] transition-colors border-b border-[var(--border-subtle)]/30 last:border-0 group"
                                                >
                                                    <div className="flex flex-col gap-1 pr-4">
                                                        <span className="text-[14px] font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors">{blast.chapterTitle}</span>
                                                        <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest truncate">{blast.subject}</span>
                                                    </div>

                                                    <div className="flex flex-col">
                                                        <span className="text-[12px] text-[var(--text-secondary)]">{date}</span>
                                                        <span className="text-[10px] text-[var(--text-muted)] font-bold">{time}</span>
                                                    </div>

                                                    <div className="text-center font-mono text-[13px] text-[var(--text-muted)]">
                                                        {blast.totalRecipients}
                                                    </div>

                                                    <div className="flex flex-col items-center">
                                                        <span className="text-[13px] font-bold text-[var(--accent-primary)]">{blast.opens}</span>
                                                        <span className="text-[8px] text-[var(--text-muted)] font-bold uppercase tracking-widest">{openRate}% rate</span>
                                                    </div>

                                                    <div className="flex justify-end">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] shadow-[0_0_8px_var(--accent-primary)]" />
                                                    </div>
                                                </motion.div>
                                            );
                                        })}

                                        {blasts.length === 0 && !isLoading && (
                                            <div className="py-20 text-center">
                                                <p className="text-[var(--text-muted)] italic">No email history found.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}

                        <SacredToast message={toast} visible={!!toast} />

                        <style dangerouslySetInnerHTML={{
                            __html: `
                            .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                            .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--border-subtle); border-radius: 10px; }
                            .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--border-default); }
                        ` }} />
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default EngagementReport;
