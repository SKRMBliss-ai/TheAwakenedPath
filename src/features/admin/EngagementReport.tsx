import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, RefreshCw, Mail, Monitor, Eye, Megaphone, Send, Trash2, Search, ExternalLink, Target, Globe, Youtube, Download, PlayCircle, UserX } from 'lucide-react';
import { db, functions } from '../../firebase';
import { collection, query, orderBy, limit, getDocs, where, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { WhisperInput, AnchorButton, SacredToast } from '../../components/ui/SacredUI';
import { isMonitoredEmail } from '../../config/admin';
import { cn } from '../../lib/utils';

interface ActivityLog {
    id: string;
    userId: string;
    userEmail: string;
    entryEmail?: string;
    isAnonymous?: boolean;
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
    const [activeTab, setActiveTab] = useState<'logs' | 'users' | 'waitlist' | 'leads' | 'blast' | 'history'>('logs');
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showAnonymous, setShowAnonymous] = useState(false);
    
    // Blast Form State
    const [blastTitle, setBlastTitle] = useState('');
    const [blastSubtitle, setBlastSubtitle] = useState('');
    const [isBlasting, setIsBlasting] = useState(false);
    const [toast, setToast] = useState('');

    // Blast History State
    const [blasts, setBlasts] = useState<any[]>([]);

    // Leads State
    const [leads, setLeads] = useState<any[]>([]);
    const [leadKeywords, setLeadKeywords] = useState('spiritual awakening, untethered soul, presence meditation, anxiety meditation help');
    const [isScanning, setIsScanning] = useState(false);
    const [lastScan, setLastScan] = useState<any>(null);
    
    // Waitlist State
    const [waitlist, setWaitlist] = useState<any[]>([]);

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

            // For each blast, get open, click, and unsubscribe counts
            const enrichedBlasts = await Promise.all(fetchedBlasts.map(async (blast) => {
                try {
                    const [opensSnap, clicksSnap, unsubscribesSnap] = await Promise.all([
                        getDocs(query(collection(db, 'email_opens'), where('blastId', '==', blast.id))),
                        getDocs(query(collection(db, 'email_clicks'), where('blastId', '==', blast.id))),
                        getDocs(query(collection(db, 'email_unsubscribes'), where('blastId', '==', blast.id)))
                    ]);

                    const opens = opensSnap.docs.map(d => d.data());
                    const clicks = clicksSnap.docs.map(d => d.data());

                    // Calculate average "dwell" time (Open to Click)
                    let totalDwell = 0;
                    let dwellCount = 0;

                    const openTimes = new Map(opens.map(o => [o.userEmail, o.timestamp?.toMillis()]));
                    clicks.forEach(c => {
                        const email = c.userEmail;
                        const clickTime = c.timestamp?.toMillis();
                        const openTime = openTimes.get(email);
                        if (openTime && clickTime && clickTime > openTime) {
                            totalDwell += (clickTime - openTime);
                            dwellCount++;
                        }
                    });

                    const avgDwell = dwellCount > 0 ? totalDwell / dwellCount : 0;

                    const openedBy = opens.map(o => o.userEmail).filter(Boolean);
                    const clickedBy = clicks.map(c => c.userEmail).filter(Boolean);
                    const unsubscribedBy = unsubscribesSnap.docs.map(d => d.data().userEmail).filter(Boolean);

                    return { 
                        ...blast, 
                        opens: opensSnap.size,
                        openedBy: Array.from(new Set(openedBy)),
                        clicks: clicksSnap.size,
                        clickedBy: Array.from(new Set(clickedBy)),
                        unsubscribes: unsubscribesSnap.size,
                        unsubscribedBy: Array.from(new Set(unsubscribedBy)),
                        avgDwell: avgDwell // in ms
                    };
                } catch (e) {
                    console.error(`Error enriching blast ${blast.id}:`, e);
                    return { 
                        ...blast, 
                        opens: 0, 
                        openedBy: [], 
                        clicks: 0, 
                        clickedBy: [], 
                        unsubscribes: 0, 
                        unsubscribedBy: [], 
                        avgDwell: 0 
                    };
                }
            }));

            setBlasts(enrichedBlasts);
        } catch (error) {
            console.error("Error fetching blast history:", error);
            setToast("⚠️ Failed to load history. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const usersRef = collection(db, 'users');
            // Remove orderBy to ensure all users show up even if lastLogin is missing
            const q = query(usersRef, limit(100));
            const snapshot = await getDocs(q);
            
            const fetchedUsers = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Sort manually in memory to avoid index requirements/document exclusion
            const sorted = fetchedUsers.sort((a: any, b: any) => {
                const aTime = a.lastLogin?.toDate ? a.lastLogin.toDate().getTime() : (a.lastLogin ? new Date(a.lastLogin).getTime() : 0);
                const bTime = b.lastLogin?.toDate ? b.lastLogin.toDate().getTime() : (b.lastLogin ? new Date(b.lastLogin).getTime() : 0);
                return bTime - aTime;
            });

            setUsers(sorted);
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

    const handleDeleteLog = async (logId: string) => {
        try {
            await deleteDoc(doc(db, 'activity_logs', logId));
            setLogs(prev => prev.filter(l => l.id !== logId));
            setToast('Activity entry deleted.');
            setTimeout(() => setToast(''), 4000);
        } catch (error) {
            console.error("Failed to delete log:", error);
            setToast('Failed to delete log.');
            setTimeout(() => setToast(''), 4000);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        try {
            await deleteDoc(doc(db, 'users', userId));
            setUsers(prev => prev.filter(u => u.id !== userId));
            setToast('User deleted.');
            setTimeout(() => setToast(''), 4000);
        } catch (error) {
            console.error("Failed to delete user:", error);
            setToast('Failed to delete user. Check permissions.');
            setTimeout(() => setToast(''), 4000);
        }
    };

    const fetchLeads = async () => {
        setIsLoading(true);
        try {
            const leadsRef = collection(db, 'leads');
            const q = query(leadsRef, orderBy('foundAt', 'desc'), limit(200));
            const snap = await getDocs(q);
            setLeads(snap.docs.map(d => ({ id: d.id, ...d.data() })));

            const scansRef = collection(db, 'lead_scans');
            const sq = query(scansRef, orderBy('startedAt', 'desc'), limit(1));
            const sSnap = await getDocs(sq);
            setLastScan(sSnap.docs[0] ? { id: sSnap.docs[0].id, ...sSnap.docs[0].data() } : null);
        } catch (e) {
            console.error('Error fetching leads:', e);
            setToast('Failed to load leads.');
            setTimeout(() => setToast(''), 4000);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchWaitlist = async () => {
        setIsLoading(true);
        try {
            const waitlistRef = collection(db, 'waitlist');
            const q = query(waitlistRef, orderBy('createdAt', 'desc'), limit(200));
            const snap = await getDocs(q);
            setWaitlist(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (e) {
            console.error('Error fetching waitlist:', e);
            setToast('Failed to load waitlist.');
            setTimeout(() => setToast(''), 4000);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteWaitlist = async (id: string) => {
        try {
            await deleteDoc(doc(db, 'waitlist', id));
            setWaitlist(prev => prev.filter(w => w.id !== id));
            setToast('Waitlist entry removed.');
            setTimeout(() => setToast(''), 4000);
        } catch (error) {
            setToast('Failed to delete entry.');
            setTimeout(() => setToast(''), 4000);
        }
    };

    const handleRunScan = async () => {
        setIsScanning(true);
        try {
            const keywords = leadKeywords.split(',').map(k => k.trim()).filter(Boolean);
            const scanFn = httpsCallable(functions, 'scanLeads');
            const res: any = await scanFn({ keywords, sources: ['google', 'reddit'] });
            const data = res?.data || {};
            let msg: string;
            if (data.googleConfigured === false) {
                msg = `Found ${data.newLeadsCount} new leads from Reddit (Google API key not configured)`;
            } else if (data.budgetCapped) {
                msg = `Found ${data.newLeadsCount} new leads. Daily Google quota near limit — only ${data.googleCallsThisRun}/${data.keywordsScanned} keywords used Google. ${data.googleRemainingToday} queries left today.`;
            } else {
                msg = `Found ${data.newLeadsCount} new leads. Google quota: ${data.googleUsedToday}/${data.googleDailyCap} used today.`;
            }
            setToast(msg);
            setTimeout(() => setToast(''), 6500);
            await fetchLeads();
        } catch (e: any) {
            console.error('Lead scan failed:', e);
            setToast(`Scan failed: ${e?.message || 'unknown error'}`);
            setTimeout(() => setToast(''), 5000);
        } finally {
            setIsScanning(false);
        }
    };

    const handleUpdateLeadStatus = async (leadId: string, status: string) => {
        try {
            await updateDoc(doc(db, 'leads', leadId), { status });
            setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status } : l));
        } catch (e) {
            console.error('Failed to update lead status:', e);
            setToast('Failed to update lead.');
            setTimeout(() => setToast(''), 4000);
        }
    };

    const handleDeleteLead = async (leadId: string) => {
        try {
            await deleteDoc(doc(db, 'leads', leadId));
            setLeads(prev => prev.filter(l => l.id !== leadId));
        } catch (e) {
            console.error('Failed to delete lead:', e);
            setToast('Failed to delete lead.');
            setTimeout(() => setToast(''), 4000);
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
            if (activeTab === 'leads') fetchLeads();
            if (activeTab === 'waitlist') fetchWaitlist();
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
        if (type === 'EMAIL_UNSUBSCRIBED') return <Mail className="w-4 h-4 text-[#FF4B4B]" />;
        if (type === 'EMAIL_YOUTUBE_CLICK') return <Youtube className="w-4 h-4 text-red-500" />;
        if (type === 'EMAIL_CTA_CLICK') return <ExternalLink className="w-4 h-4 text-amber-400" />;
        if (type === 'PAGE_VISIT_ABOUT') return <Globe className="w-4 h-4 text-teal-400" />;
        if (type === 'PAGE_VISIT_APP') return <Monitor className="w-4 h-4 text-teal-400" />;
        if (type === 'VIDEO_PLAY') return <PlayCircle className="w-4 h-4 text-purple-400" />;
        if (type === 'YOUTUBE_BADGE_CLICK') return <Youtube className="w-4 h-4 text-red-400" />;
        if (type === 'JOURNAL_DOWNLOAD') return <Download className="w-4 h-4 text-green-400" />;
        if (type === 'EMAIL_FORM_SUBMIT') return <Mail className="w-4 h-4 text-teal-400" />;
        return <Mail className="w-4 h-4 text-[#E67E22]" />;
    };

    const getSourceLabel = (type: string) => {
        if (type === 'LOGIN') return 'SIGN IN';
        if (type === 'SESSION_START') return 'PRESENCE';
        if (type === 'EMAIL_OPEN') return 'OPENED';
        if (type === 'EMAIL_UNSUBSCRIBED') return 'UNSUBSCRIBED';
        if (type === 'EMAIL_YOUTUBE_CLICK') return 'YOUTUBE CLICK';
        if (type === 'EMAIL_CTA_CLICK') return 'CTA CLICK';
        if (type === 'PAGE_VISIT_ABOUT') return 'VISITED PAGE';
        if (type === 'PAGE_VISIT_APP') return 'ENTERED APP';
        if (type === 'VIDEO_PLAY') return 'VIDEO PLAY';
        if (type === 'YOUTUBE_BADGE_CLICK') return 'YOUTUBE ↗';
        if (type === 'JOURNAL_DOWNLOAD') return 'DOWNLOADED';
        if (type === 'EMAIL_FORM_SUBMIT') return 'EMAIL SUBMIT';
        return 'EMAIL';
    };

    // Helper: is this CTA click a journal download link?
    const isJournalCta = (l: ActivityLog) =>
        l.activityType === 'EMAIL_CTA_CLICK' &&
        (l.details?.toLowerCase().includes('aboutawakened') || (l as any).destination?.includes('aboutawakened'));

    // Derived stats from logs
    const logStats = useMemo(() => {
        const ytClicks    = logs.filter(l => l.activityType === 'EMAIL_YOUTUBE_CLICK').length;
        const appCtaClicks     = logs.filter(l => l.activityType === 'EMAIL_CTA_CLICK' && !isJournalCta(l)).length;
        const journalCtaClicks = logs.filter(l => isJournalCta(l)).length;
        const videoPlays  = logs.filter(l => l.activityType === 'VIDEO_PLAY' || l.activityType === 'YOUTUBE_BADGE_CLICK').length;
        const downloads   = logs.filter(l => l.activityType === 'JOURNAL_DOWNLOAD').length;
        const emailSubmits = logs.filter(l => l.activityType === 'EMAIL_FORM_SUBMIT').length;
        const pageVisits  = logs.filter(l => l.activityType === 'PAGE_VISIT_ABOUT' || l.activityType === 'PAGE_VISIT_APP').length;
        const anonymousCount = logs.filter(l => !l.userEmail || l.userEmail === 'anonymous').length;
        // Unique openers (all-time)
        const uniqueOpeners = new Set(logs.filter(l => l.activityType === 'EMAIL_OPEN' && l.userEmail && l.userEmail !== 'anonymous').map(l => l.userEmail)).size;
        // Interactions = any click beyond opening (YouTube + either CTA)
        const interactions = ytClicks + appCtaClicks + journalCtaClicks;
        return { ytClicks, appCtaClicks, journalCtaClicks, videoPlays, downloads, emailSubmits, pageVisits, anonymousCount, uniqueOpeners, interactions };
    }, [logs]);

    // Daily breakdown — last 14 days
    const dailyStats = useMemo(() => {
        const days: Record<string, {
            opens: number; uniqueOpeners: Set<string>;
            ytClicks: number; appCtaClicks: number; journalCtaClicks: number;
        }> = {};
        const toKey = (ts: any) => {
            if (!ts) return null;
            const d = ts.toDate ? ts.toDate() : new Date(ts);
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        };
        logs.forEach(l => {
            const key = toKey(l.timestamp);
            if (!key) return;
            if (!days[key]) days[key] = { opens: 0, uniqueOpeners: new Set(), ytClicks: 0, appCtaClicks: 0, journalCtaClicks: 0 };
            if (l.activityType === 'EMAIL_OPEN') {
                days[key].opens++;
                if (l.userEmail && l.userEmail !== 'anonymous') days[key].uniqueOpeners.add(l.userEmail);
            }
            if (l.activityType === 'EMAIL_YOUTUBE_CLICK') days[key].ytClicks++;
            if (l.activityType === 'EMAIL_CTA_CLICK') {
                if (isJournalCta(l)) days[key].journalCtaClicks++;
                else days[key].appCtaClicks++;
            }
        });
        return Object.entries(days)
            .map(([date, d]) => ({
                date,
                opens: d.opens,
                uniqueOpeners: d.uniqueOpeners.size,
                ytClicks: d.ytClicks,
                appCtaClicks: d.appCtaClicks,
                journalCtaClicks: d.journalCtaClicks,
                interactions: d.ytClicks + d.appCtaClicks + d.journalCtaClicks,
            }))
            .sort((a, b) => new Date(b.date + ' 2026').getTime() - new Date(a.date + ' 2026').getTime())
            .slice(0, 14);
    }, [logs]);

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.25 }}
            className="w-full min-h-screen flex flex-col bg-[var(--bg-base)]"
        >
                    {/* Inline Page Content */}
                    <div
                        className="w-full flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-4 sm:p-8 border-b border-[#2A2A2A] flex flex-col sm:flex-row justify-between items-start gap-6">
                            <div className="flex gap-4">
                                <div className="p-3 rounded-xl bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] shadow-inner flex-shrink-0">
                                    {activeTab === 'logs' ? <Mail className="w-6 h-6 text-[var(--accent-primary)]" /> : <Megaphone className="w-6 h-6 text-[var(--accent-primary)]" />}
                                </div>
                                <div>
                                    <h2 className="text-[18px] sm:text-[22px] font-bold text-[var(--accent-primary)] tracking-wider uppercase">
                                        {activeTab === 'logs' ? 'Engagement Report'
                                            : activeTab === 'users' ? 'Users'
                                            : activeTab === 'waitlist' ? 'Subscribers'
                                            : activeTab === 'leads' ? 'Lead Finder'
                                            : activeTab === 'blast' ? 'Send Course Update'
                                            : 'Email History'}
                                    </h2>
                                    <p className="text-[9px] sm:text-[11px] text-[var(--text-muted)] tracking-[0.2em] font-bold uppercase mt-1">
                                        {activeTab === 'logs' ? 'Tracking User Activity'
                                            : activeTab === 'users' ? 'All registered users'
                                            : activeTab === 'waitlist' ? 'App signups · Journal gate · Downloads'
                                            : activeTab === 'leads' ? 'Daily prospect scan from Google + Reddit'
                                            : activeTab === 'blast' ? 'Send an email update to all users'
                                            : 'History of all emails sent'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-row sm:flex-row gap-4 w-full sm:w-auto items-center">
                                <div className="flex gap-1 sm:gap-2 bg-[var(--bg-surface-hover)] p-1 rounded-full border border-[var(--border-subtle)] flex-1 sm:flex-none overflow-x-auto custom-scrollbar no-scrollbar">
                                    <button 
                                        onClick={() => setActiveTab('logs')}
                                        className={cn(
                                            "px-3 sm:px-6 py-2 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.1em] sm:tracking-[0.2em] transition-all whitespace-nowrap",
                                            activeTab === 'logs' ? "bg-[var(--accent-primary)] text-black" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                                        )}
                                    >
                                        Activity
                                    </button>
                                    <button 
                                        onClick={() => setActiveTab('users')}
                                        className={cn(
                                            "px-3 sm:px-6 py-2 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.1em] sm:tracking-[0.2em] transition-all whitespace-nowrap",
                                            activeTab === 'users' ? "bg-[var(--accent-primary)] text-black" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                                        )}
                                    >
                                        Users
                                    </button>
                                    <button 
                                        onClick={() => setActiveTab('waitlist')}
                                        className={cn(
                                            "px-3 sm:px-6 py-2 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.1em] sm:tracking-[0.2em] transition-all whitespace-nowrap",
                                            activeTab === 'waitlist' ? "bg-[var(--accent-primary)] text-black" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                                        )}
                                    >
                                        Subscribers
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('leads')}
                                        className={cn(
                                            "px-3 sm:px-6 py-2 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.1em] sm:tracking-[0.2em] transition-all whitespace-nowrap",
                                            activeTab === 'leads' ? "bg-[var(--accent-primary)] text-black" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                                        )}
                                    >
                                        Leads
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('blast')}
                                        className={cn(
                                            "px-3 sm:px-6 py-2 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.1em] sm:tracking-[0.2em] transition-all whitespace-nowrap",
                                            activeTab === 'blast' ? "bg-[var(--accent-primary)] text-black" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                                        )}
                                    >
                                        Broadcast
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('history')}
                                        className={cn(
                                            "px-3 sm:px-6 py-2 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.1em] sm:tracking-[0.2em] transition-all whitespace-nowrap",
                                            activeTab === 'history' ? "bg-[var(--accent-primary)] text-black" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                                        )}
                                    >
                                        History
                                    </button>
                                </div>

                                <button
                                    onClick={onClose}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-[var(--bg-surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all text-[13px] font-medium border border-[var(--border-subtle)]"
                                >
                                    <X className="w-4 h-4" /> Close
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

                                {/* ── Daily Breakdown Table ── */}
                                {dailyStats.length > 0 && (
                                    <div className="px-4 sm:px-10 py-4 border-b border-[var(--border-subtle)]/50">
                                        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--text-muted)] mb-3">Daily Email Engagement</p>
                                        <div className="overflow-x-auto rounded-xl border border-[var(--border-subtle)]/60">
                                            <table className="w-full text-[11px] border-collapse">
                                                <thead>
                                                    <tr className="bg-[var(--bg-surface-hover)] border-b border-[var(--border-subtle)]/50">
                                                        <th className="px-3 py-2 text-left font-bold text-[var(--text-muted)] uppercase tracking-wider whitespace-nowrap">Date</th>
                                                        <th className="px-3 py-2 text-center font-bold text-[var(--accent-primary)] uppercase tracking-wider whitespace-nowrap" title="Total email open events">Opens</th>
                                                        <th className="px-3 py-2 text-center font-bold text-[var(--accent-primary)] uppercase tracking-wider whitespace-nowrap" title="Distinct people who opened (no duplicates)">Unique</th>
                                                        <th className="px-3 py-2 text-center font-bold text-red-400 uppercase tracking-wider whitespace-nowrap" title="Clicked YouTube link in email">▶ YT</th>
                                                        <th className="px-3 py-2 text-center font-bold text-amber-400 uppercase tracking-wider whitespace-nowrap" title="Clicked 'Open Today's Practice' → app">📱 App</th>
                                                        <th className="px-3 py-2 text-center font-bold text-green-400 uppercase tracking-wider whitespace-nowrap" title="Clicked 'Get Free Journal' → /aboutmindgym">📓 Journal</th>
                                                        <th className="px-3 py-2 text-center font-bold text-purple-400 uppercase tracking-wider whitespace-nowrap" title="Total clicks (YouTube + App + Journal) — people who did more than just open">Interactions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-[var(--border-subtle)]/30">
                                                    {dailyStats.map((d, i) => (
                                                        <tr key={d.date} className={i % 2 === 0 ? 'bg-[var(--bg-base)]' : 'bg-[var(--bg-surface)]/40'}>
                                                            <td className="px-3 py-2 font-bold text-[var(--text-primary)] whitespace-nowrap">{d.date}</td>
                                                            <td className="px-3 py-2 text-center font-bold text-[var(--accent-primary)]">{d.opens}</td>
                                                            <td className="px-3 py-2 text-center text-[var(--text-secondary)]" title="Distinct people (no duplicates)">{d.uniqueOpeners}</td>
                                                            <td className="px-3 py-2 text-center font-bold text-red-400">{d.ytClicks || <span className="text-[var(--text-muted)]">—</span>}</td>
                                                            <td className="px-3 py-2 text-center font-bold text-amber-400">{d.appCtaClicks || <span className="text-[var(--text-muted)]">—</span>}</td>
                                                            <td className="px-3 py-2 text-center font-bold text-green-400">{d.journalCtaClicks || <span className="text-[var(--text-muted)]">—</span>}</td>
                                                            <td className="px-3 py-2 text-center">
                                                                {d.interactions > 0
                                                                    ? <span className="px-2 py-0.5 rounded-full bg-purple-400/15 text-purple-400 font-black">{d.interactions}</span>
                                                                    : <span className="text-[var(--text-muted)]">—</span>
                                                                }
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* ── Stats Bar ── */}
                                <div className="px-4 sm:px-10 py-3 border-b border-[var(--border-subtle)]/50 flex flex-wrap items-center gap-3">
                                    {[
                                        { icon: <Youtube className="w-3 h-3 text-red-500" />, label: 'YouTube (from email)', value: logStats.ytClicks, color: 'text-red-400', title: 'Clicked the YouTube video link in the email' },
                                        { icon: <Monitor className="w-3 h-3 text-amber-400" />, label: 'App clicks', value: logStats.appCtaClicks, color: 'text-amber-400', title: 'Clicked "Open Today\'s Practice" button → /awakenedpath' },
                                        { icon: <Download className="w-3 h-3 text-green-400" />, label: 'Journal CTA', value: logStats.journalCtaClicks, color: 'text-green-400', title: 'Clicked "Get Free Journal" button → /aboutmindgym' },
                                        { icon: <Eye className="w-3 h-3 text-[var(--accent-primary)]" />, label: 'Unique openers', value: logStats.uniqueOpeners, color: 'text-[var(--accent-primary)]', title: 'Distinct people who opened (regardless of how many times)' },
                                        { icon: <Target className="w-3 h-3 text-purple-400" />, label: 'Total interactions', value: logStats.interactions, color: 'text-purple-400', title: 'Any click (YouTube + App CTA + Journal CTA) — people who did more than just open' },
                                        { icon: <PlayCircle className="w-3 h-3 text-purple-300" />, label: 'Video plays (site)', value: logStats.videoPlays, color: 'text-purple-300', title: 'Played the walkthrough video on /aboutmindgym' },
                                        { icon: <Globe className="w-3 h-3 text-teal-300" />, label: 'Page visits', value: logStats.pageVisits, color: 'text-teal-300', title: 'Visited /awakenedpath or /aboutmindgym' },
                                    ].map(s => (
                                        <div key={s.label} title={s.title} className="flex items-center gap-1.5 bg-[var(--bg-surface)] rounded-lg px-2.5 py-1.5 border border-[var(--border-subtle)]/60 cursor-help">
                                            {s.icon}
                                            <span className={`text-[11px] font-black ${s.color}`}>{s.value}</span>
                                            <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider">{s.label}</span>
                                        </div>
                                    ))}
                                    {/* Anonymous toggle */}
                                    <button
                                        onClick={() => setShowAnonymous(v => !v)}
                                        className={`ml-auto flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-wider transition-all ${showAnonymous ? 'border-amber-400/50 text-amber-400 bg-amber-400/10' : 'border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                                    >
                                        <UserX className="w-3 h-3" />
                                        {showAnonymous ? 'Hide' : 'Show'} anonymous ({logStats.anonymousCount})
                                    </button>
                                </div>

                                {/* Table Header */}
                                <div className="px-4 sm:px-10 py-6 grid grid-cols-[1.5fr_1fr_0.1fr] md:grid-cols-[1.5fr_1fr_1.5fr_0.8fr_0.8fr_0.4fr] text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] items-center border-b border-[var(--border-subtle)]/50">
                                    <div>User</div>
                                    <div>Action</div>
                                    <div className="hidden md:block">Location</div>
                                    <div className="hidden md:block">Date</div>
                                    <div className="hidden md:block">Time</div>
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
                                                // Filter anonymous unless toggle is on
                                                const isAnon = !log.userEmail || log.userEmail === 'anonymous';
                                                if (isAnon && !showAnonymous) return false;
                                                if (!searchTerm) return true;
                                                const s = searchTerm.toLowerCase();
                                                return (
                                                    log.userEmail?.toLowerCase().includes(s) ||
                                                    log.entryEmail?.toLowerCase().includes(s) ||
                                                    log.activityType?.toLowerCase().includes(s) ||
                                                    log.location?.toLowerCase().includes(s) ||
                                                    getSourceLabel(log.activityType).toLowerCase().includes(s)
                                                );
                                            })
                                            .map((log) => {
                                            const { date, time } = formatTimestamp(log.timestamp);
                                            // Prefer real email; fall back to entryEmail for anonymous users
                                            const resolvedEmail = log.userEmail || log.entryEmail || null;
                                            const userName = resolvedEmail ? resolvedEmail.split('@')[0] : 'User';
                                            const displayName = userName.charAt(0).toUpperCase() + userName.slice(1);

                                            return (
                                                <motion.div
                                                    key={log.id}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    className="grid grid-cols-[1.5fr_1fr_0.1fr] md:grid-cols-[1.5fr_1fr_1.5fr_0.8fr_0.8fr_0.4fr] items-center px-4 py-4 rounded-xl hover:bg-[var(--bg-surface)]/50 transition-colors border-b border-[var(--border-subtle)]/30 last:border-0 group"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--bg-surface)] to-[var(--bg-primary)] border border-[var(--border-default)] flex items-center justify-center overflow-hidden shrink-0">
                                                            <span className="text-[12px] font-bold text-[var(--text-muted)]">{displayName.charAt(0)}</span>
                                                        </div>
                                                        <div className="flex flex-col min-w-0">
                                                            <span className="text-[13px] font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors truncate">{displayName}</span>
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-widest truncate">{resolvedEmail}</span>
                                                                {log.isAnonymous && (
                                                                    <span className="text-[8px] font-black tracking-widest text-amber-400/70 uppercase shrink-0">Anon ✦</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        {getSourceIcon(log.activityType)}
                                                        <span className="text-[11px] font-bold text-[var(--text-secondary)] tracking-tight">{getSourceLabel(log.activityType)}</span>
                                                    </div>

                                                    <div className="hidden md:block text-[12px] text-[var(--text-muted)] italic pr-2 truncate" title={log.location || 'Unknown'}>
                                                        {log.location || 'Unknown'}
                                                    </div>

                                                    <div className="hidden md:block text-[12px] text-[var(--text-secondary)]">{date}</div>

                                                    <div className="hidden md:block text-[12px] font-bold text-[var(--accent-primary)]">{time}</div>

                                                    <div className="flex justify-end gap-2">
                                                        <button 
                                                            onClick={() => handleDeleteLog(log.id)}
                                                            className="p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-400"
                                                            title="Delete Log"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
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

                                <div className="px-4 sm:px-10 py-6 grid grid-cols-[1.5fr_0.1fr] md:grid-cols-[1.5fr_1.5fr_1fr_1fr_0.4fr] text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] items-center border-b border-[var(--border-subtle)]/50">
                                    <div>User</div>
                                    <div className="hidden md:block">Email</div>
                                    <div className="hidden md:block">Joined</div>
                                    <div className="hidden md:block">Last Presence / Login</div>
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
                                                        className="grid grid-cols-[1.5fr_0.1fr] md:grid-cols-[1.5fr_1.5fr_1fr_1fr_0.4fr] items-center px-4 py-4 rounded-xl hover:bg-[var(--bg-surface)]/50 transition-colors border-b border-[var(--border-subtle)]/30 last:border-0 group"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--bg-surface)] to-[var(--bg-primary)] border border-[var(--border-default)] flex items-center justify-center overflow-hidden shrink-0">
                                                                <span className="text-[12px] font-bold text-[var(--text-muted)]">{displayName.charAt(0).toUpperCase()}</span>
                                                            </div>
                                                            <span className="text-[13px] font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors truncate">{displayName}</span>
                                                        </div>

                                                        <div className="hidden md:block text-[12px] text-[var(--text-secondary)] truncate">{u.email}</div>
                                                        <div className="hidden md:block text-[12px] text-[var(--text-muted)]">{joinedDate}</div>
                                                        <div className="hidden md:block flex flex-col">
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
                                                            <button 
                                                                onClick={() => handleDeleteUser(u.id)}
                                                                className="ml-2 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-400"
                                                                title="Delete User"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                    </div>
                                </div>
                            </>
                        ) : activeTab === 'waitlist' ? (
                            <>
                                <div className="px-4 sm:px-10 py-6 grid grid-cols-[1.5fr_0.1fr] md:grid-cols-[2fr_1fr_1.5fr_0.4fr] text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] items-center border-b border-[var(--border-subtle)]/50">
                                    <div>Email</div>
                                    <div className="hidden md:block">Source</div>
                                    <div className="hidden md:block">Joined</div>
                                    <div className="text-right">
                                        <button onClick={fetchWaitlist} disabled={isLoading} className="hover:text-[var(--accent-primary)] transition-colors">
                                            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto px-6 pb-8 custom-scrollbar">
                                    <div className="space-y-1">
                                        {waitlist.map((w) => {
                                            const { date, time } = formatTimestamp(w.createdAt);
                                            return (
                                                <motion.div
                                                    key={w.id}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    className="grid grid-cols-[1.5fr_0.1fr] md:grid-cols-[2fr_1fr_1.5fr_0.4fr] items-center px-4 py-4 rounded-xl hover:bg-[var(--bg-surface)]/50 transition-colors border-b border-[var(--border-subtle)]/30 last:border-0 group"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--bg-surface)] to-[var(--bg-primary)] border border-[var(--border-default)] flex items-center justify-center overflow-hidden shrink-0">
                                                            <Mail className="w-4 h-4 text-[var(--text-muted)]" />
                                                        </div>
                                                        <span className="text-[13px] font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors truncate">{w.email}</span>
                                                    </div>

                                                    <div className="hidden md:block text-[11px] font-bold uppercase tracking-tight" style={{
                                                        color: w.source === 'app_signup' ? 'var(--accent-primary)' : w.source === 'journal_download_clicked' ? '#818cf8' : 'var(--text-secondary)'
                                                    }}>
                                                        {w.source === 'app_signup' ? 'App Signup'
                                                            : w.source === 'journal_download_gate' ? 'Journal Gate'
                                                            : w.source === 'journal_download_clicked' ? '⬇ Downloaded'
                                                            : w.source || 'Journal Gate'}
                                                    </div>
                                                    
                                                    <div className="hidden md:block flex flex-col">
                                                        <span className="text-[12px] text-[var(--text-secondary)]">{date}</span>
                                                        <span className="text-[10px] font-bold text-[var(--accent-primary)]">{time}</span>
                                                    </div>

                                                    <div className="flex justify-end pr-2">
                                                        <button 
                                                            onClick={() => handleDeleteWaitlist(w.id)}
                                                            className="p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-400"
                                                            title="Remove Entry"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}

                                        {waitlist.length === 0 && !isLoading && (
                                            <div className="py-20 text-center">
                                                <p className="text-[var(--text-muted)] italic">Waitlist is currently empty.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : activeTab === 'leads' ? (
                            <>
                                {/* Scan controls */}
                                <div className="px-6 sm:px-10 py-5 bg-[var(--bg-surface-hover)] border-b border-[var(--border-subtle)]/50 space-y-4">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em]">
                                            Search keywords (comma-separated)
                                        </label>
                                        <textarea
                                            value={leadKeywords}
                                            onChange={(e) => setLeadKeywords(e.target.value)}
                                            rows={2}
                                            className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl py-2.5 px-4 text-[12px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]/50 transition-colors resize-none"
                                            placeholder="e.g. spiritual awakening, untethered soul, presence meditation"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between gap-4 flex-wrap">
                                        <div className="flex items-center gap-3 text-[10px] text-[var(--text-muted)] uppercase tracking-[0.18em] font-bold flex-wrap">
                                            <span className="flex items-center gap-1.5"><Globe className="w-3 h-3" /> Google</span>
                                            <span className="opacity-40">+</span>
                                            <span className="flex items-center gap-1.5"><Target className="w-3 h-3" /> Reddit</span>
                                            {lastScan?.budget && (
                                                <span
                                                    className={cn(
                                                        "px-2 py-0.5 rounded-full border",
                                                        lastScan.budget.googleRemainingToday <= 10
                                                            ? "border-red-400/40 text-red-400"
                                                            : lastScan.budget.googleRemainingToday <= 30
                                                            ? "border-amber-400/40 text-amber-400"
                                                            : "border-[var(--accent-primary)]/40 text-[var(--accent-primary)]"
                                                    )}
                                                    title="Google Custom Search free-tier daily quota (resets at UTC midnight)"
                                                >
                                                    Quota: {lastScan.budget.googleUsedToday}/{lastScan.budget.googleDailyCap}
                                                </span>
                                            )}
                                            {lastScan?.startedAt && (
                                                <>
                                                    <span className="opacity-40">·</span>
                                                    <span>
                                                        Last scan: {formatTimestamp(lastScan.startedAt).date} {formatTimestamp(lastScan.startedAt).time}
                                                        {typeof lastScan.newLeadsCount === 'number' && ` · +${lastScan.newLeadsCount} new`}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                        <button
                                            onClick={handleRunScan}
                                            disabled={isScanning || !leadKeywords.trim()}
                                            className={cn(
                                                "flex items-center gap-2 px-5 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] transition-all",
                                                "bg-[var(--accent-primary)] text-black hover:opacity-90",
                                                (isScanning || !leadKeywords.trim()) && "opacity-50 cursor-not-allowed"
                                            )}
                                        >
                                            {isScanning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                                            <span>{isScanning ? 'Scanning…' : 'Run Scan Now'}</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Table header */}
                                <div className="px-4 sm:px-10 py-5 grid grid-cols-[1.6fr_0.5fr_0.4fr] md:grid-cols-[2fr_0.6fr_0.6fr_0.6fr_0.4fr] text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] items-center border-b border-[var(--border-subtle)]/50">
                                    <div>Lead</div>
                                    <div className="hidden md:block">Source</div>
                                    <div>Status</div>
                                    <div className="hidden md:block">Found</div>
                                    <div className="text-right">
                                        <button onClick={fetchLeads} disabled={isLoading} className="hover:text-[var(--accent-primary)] transition-colors">
                                            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-8 custom-scrollbar">
                                    <div className="space-y-1">
                                        {leads.map((lead) => {
                                            const { date, time } = formatTimestamp(lead.foundAt);
                                            const status = lead.status || 'new';
                                            return (
                                                <motion.div
                                                    key={lead.id}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    className="grid grid-cols-[1.6fr_0.5fr_0.4fr] md:grid-cols-[2fr_0.6fr_0.6fr_0.6fr_0.4fr] items-center px-4 py-4 rounded-xl hover:bg-[var(--bg-surface)]/50 transition-colors border-b border-[var(--border-subtle)]/30 last:border-0 group"
                                                >
                                                    <div className="flex flex-col gap-1 min-w-0 pr-3">
                                                        <a
                                                            href={lead.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-[13px] font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors line-clamp-1 flex items-center gap-1.5"
                                                            title={lead.title}
                                                        >
                                                            {lead.title || '(untitled)'}
                                                            <ExternalLink className="w-3 h-3 opacity-50 shrink-0" />
                                                        </a>
                                                        {lead.snippet && (
                                                            <span className="text-[10px] text-[var(--text-muted)] line-clamp-2 italic">{lead.snippet}</span>
                                                        )}
                                                        <span className="text-[8px] text-[var(--text-muted)] font-bold uppercase tracking-widest truncate">
                                                            {lead.displayLink || lead.url}
                                                            {lead.keyword && <> · matched: <span className="text-[var(--accent-primary)]/70">{lead.keyword}</span></>}
                                                        </span>
                                                    </div>

                                                    <div className="hidden md:flex items-center gap-2">
                                                        {lead.source === 'google'
                                                            ? <Globe className="w-4 h-4 text-[var(--accent-primary)]" />
                                                            : <Target className="w-4 h-4 text-[#E67E22]" />
                                                        }
                                                        <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-tight">{lead.source}</span>
                                                    </div>

                                                    <div>
                                                        <select
                                                            value={status}
                                                            onChange={(e) => handleUpdateLeadStatus(lead.id, e.target.value)}
                                                            className={cn(
                                                                "text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border bg-transparent focus:outline-none cursor-pointer",
                                                                status === 'new' && "border-[var(--accent-primary)]/40 text-[var(--accent-primary)]",
                                                                status === 'reviewed' && "border-blue-400/40 text-blue-400",
                                                                status === 'contacted' && "border-purple-400/40 text-purple-400",
                                                                status === 'converted' && "border-green-400/40 text-green-400",
                                                                status === 'rejected' && "border-red-400/40 text-red-400"
                                                            )}
                                                        >
                                                            <option value="new">New</option>
                                                            <option value="reviewed">Reviewed</option>
                                                            <option value="contacted">Contacted</option>
                                                            <option value="converted">Converted</option>
                                                            <option value="rejected">Rejected</option>
                                                        </select>
                                                    </div>

                                                    <div className="hidden md:flex flex-col">
                                                        <span className="text-[12px] text-[var(--text-secondary)]">{date}</span>
                                                        <span className="text-[10px] font-bold text-[var(--accent-primary)]">{time}</span>
                                                    </div>

                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => handleDeleteLead(lead.id)}
                                                            className="p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-400"
                                                            title="Delete Lead"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}

                                        {leads.length === 0 && !isLoading && (
                                            <div className="py-20 text-center space-y-2">
                                                <p className="text-[var(--text-muted)] italic">No leads yet.</p>
                                                <p className="text-[10px] text-[var(--text-muted)]/60 uppercase tracking-[0.2em] font-bold">
                                                    Click "Run Scan Now" to search Google + Reddit
                                                </p>
                                            </div>
                                        )}
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
                                <div className="px-10 py-6 grid grid-cols-[1.8fr_1fr_0.6fr_0.8fr_0.8fr_0.8fr_0.8fr_0.2fr] text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] items-center border-b border-[var(--border-subtle)]/50">
                                    <div>Subject / Guidance</div>
                                    <div>Date Sent</div>
                                    <div className="text-center">Sent</div>
                                    <div className="text-center">Opened</div>
                                    <div className="text-center">Clicked</div>
                                    <div className="text-center">Engage</div>
                                    <div className="text-center">Opt-Out</div>
                                    <div className="text-right">
                                        <button onClick={fetchHistory} disabled={isLoading} className="hover:text-[var(--accent-primary)] transition-colors">
                                            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto px-6 pb-8 custom-scrollbar">
                                    <div className="space-y-1 pt-20">
                                        {blasts.map((blast) => {
                                            const { date, time } = formatTimestamp(blast.sentAt);
                                            const openRate = blast.totalRecipients > 0 ? Math.round((blast.opens / blast.totalRecipients) * 100) : 0;

                                            return (
                                                <motion.div
                                                    key={blast.id}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    className="grid grid-cols-[1.8fr_1fr_0.6fr_0.8fr_0.8fr_0.8fr_0.8fr_0.2fr] items-center px-4 py-6 rounded-xl hover:bg-[var(--bg-surface)] transition-colors border-b border-[var(--border-subtle)]/30 last:border-0 group"
                                                >
                                                    <div className="flex flex-col gap-1 pr-4">
                                                        <span className="text-[14px] font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors line-clamp-1">{blast.chapterTitle}</span>
                                                        <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest truncate">{blast.subject}</span>
                                                    </div>

                                                    <div className="flex flex-col">
                                                        <span className="text-[12px] text-[var(--text-secondary)]">{date}</span>
                                                        <span className="text-[10px] text-[var(--text-muted)] font-bold">{time}</span>
                                                    </div>

                                                    <div className="text-center font-mono text-[13px] text-[var(--text-muted)] relative group/details">
                                                        {blast.totalRecipients}
                                                        
                                                        {blast.recipientEmails?.length > 0 && (
                                                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 p-3 rounded-xl bg-[#1C1814] border border-[var(--border-subtle)] shadow-2xl opacity-0 group-hover/details:opacity-100 transition-opacity pointer-events-none z-50">
                                                                <p className="text-[8px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2 border-b border-[var(--border-subtle)] pb-1 text-left flex justify-between">Sent To: <span>{blast.totalRecipients}</span></p>
                                                                <div className="max-h-32 overflow-y-auto custom-scrollbar text-left font-mono">
                                                                    {blast.recipientEmails.map((email: string) => (
                                                                        <div key={email} className="text-[9px] text-[var(--text-secondary)] py-0.5 truncate">{email}</div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Opened */}
                                                    <div className="flex flex-col items-center relative group/details">
                                                        <span className="text-[13px] font-bold text-[var(--accent-primary)]">{blast.opens}</span>
                                                        <span className="text-[8px] text-[var(--text-muted)] font-bold uppercase tracking-widest text-center">{openRate}%</span>
                                                        
                                                        {blast.openedBy?.length > 0 && (
                                                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 p-3 rounded-xl bg-[#1C1814] border border-[var(--border-subtle)] shadow-2xl opacity-0 group-hover/details:opacity-100 transition-opacity pointer-events-none z-50">
                                                                <p className="text-[8px] font-bold text-[var(--accent-primary)] uppercase tracking-widest mb-2 border-b border-[var(--border-subtle)] pb-1 text-left flex justify-between">Opened By: <span>{blast.opens}</span></p>
                                                                <div className="max-h-32 overflow-y-auto custom-scrollbar text-left font-mono">
                                                                    {blast.openedBy.map((email: string) => (
                                                                        <div key={email} className="text-[9px] text-[var(--text-secondary)] py-0.5 truncate">{email}</div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Clicked */}
                                                    <div className="flex flex-col items-center relative group/details">
                                                        <span className="text-[13px] font-bold text-[#E67E22]">{blast.clicks || 0}</span>
                                                        <span className="text-[8px] text-[var(--text-muted)] font-bold uppercase tracking-widest text-center">
                                                            {blast.totalRecipients > 0 ? Math.round(((blast.clicks || 0) / blast.totalRecipients) * 100) : 0}%
                                                        </span>
                                                        
                                                        {blast.clickedBy?.length > 0 && (
                                                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 p-3 rounded-xl bg-[#1C1814] border border-[var(--border-subtle)] shadow-2xl opacity-0 group-hover/details:opacity-100 transition-opacity pointer-events-none z-50">
                                                                <p className="text-[8px] font-bold text-[#E67E22] uppercase tracking-widest mb-2 border-b border-[var(--border-subtle)] pb-1 text-left flex justify-between">Clicked By: <span>{blast.clicks}</span></p>
                                                                <div className="max-h-32 overflow-y-auto custom-scrollbar text-left font-mono">
                                                                    {blast.clickedBy.map((email: string) => (
                                                                        <div key={email} className="text-[9px] text-[var(--text-secondary)] py-0.5 truncate">{email}</div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Engagement Time */}
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-[13px] font-bold text-[#9B59B6]">
                                                            {blast.avgDwell ? (blast.avgDwell > 60000 ? `${(blast.avgDwell / 60000).toFixed(1)}m` : `${Math.round(blast.avgDwell / 1000)}s`) : '--'}
                                                        </span>
                                                        <span className="text-[8px] text-[var(--text-muted)] font-bold uppercase tracking-widest text-center">Avg Read</span>
                                                    </div>

                                                    {/* Unsubscribed */}
                                                    <div className="flex flex-col items-center relative group/details">
                                                        <span className="text-[13px] font-bold text-[#FF4B4B]">{blast.unsubscribes || 0}</span>
                                                        <span className="text-[8px] text-[var(--text-muted)] font-bold uppercase tracking-widest text-center">
                                                            {blast.totalRecipients > 0 ? ((blast.unsubscribes || 0) / blast.totalRecipients * 100).toFixed(1) : 0}%
                                                        </span>
                                                        
                                                        {blast.unsubscribedBy?.length > 0 && (
                                                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 p-3 rounded-xl bg-[#1C1814] border border-[var(--border-subtle)] shadow-2xl opacity-0 group-hover/details:opacity-100 transition-opacity pointer-events-none z-50">
                                                                <p className="text-[8px] font-bold text-[#FF4B4B] uppercase tracking-widest mb-2 border-b border-[var(--border-subtle)] pb-1 text-left flex justify-between">Opted Out: <span>{blast.unsubscribes}</span></p>
                                                                <div className="max-h-32 overflow-y-auto custom-scrollbar text-left font-mono">
                                                                    {blast.unsubscribedBy.map((email: string) => (
                                                                        <div key={email} className="text-[9px] text-[var(--text-secondary)] py-0.5 truncate">{email}</div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
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
                    </div>
        </motion.div>
    );
};

export default EngagementReport;
