import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RefreshCw, Mail, Monitor, Eye, Megaphone, Send } from 'lucide-react';
import { db, functions } from '../../firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { WhisperInput, AnchorButton, SacredToast } from '../../components/ui/SacredUI';

interface ActivityLog {
    id: string;
    userId: string;
    userEmail: string;
    activityType: string;
    details: string;
    timestamp: any;
}

interface EngagementReportProps {
    isOpen: boolean;
    onClose: () => void;
}

const EngagementReport: React.FC<EngagementReportProps> = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState<'logs' | 'blast'>('logs');
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    
    // Blast Form State
    const [blastTitle, setBlastTitle] = useState('');
    const [blastSubtitle, setBlastSubtitle] = useState('');
    const [isBlasting, setIsBlasting] = useState(false);
    const [toast, setToast] = useState('');

    const fetchLogs = async () => {
        setIsLoading(true);
        try {
            const logsRef = collection(db, 'activity_logs');
            const q = query(logsRef, orderBy('timestamp', 'desc'), limit(50));
            const snapshot = await getDocs(q);
            const fetchedLogs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as ActivityLog[];
            setLogs(fetchedLogs);
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
            setToast('Spiritual update sent to all souls.');
            setBlastTitle('');
            setBlastSubtitle('');
            setTimeout(() => setToast(''), 4000);
        } catch (error) {
            console.error("Blast failed:", error);
            setToast('The transmission failed.');
            setTimeout(() => setToast(''), 4000);
        } finally {
            setIsBlasting(false);
        }
    };

    useEffect(() => {
        if (isOpen && activeTab === 'logs') {
            fetchLogs();
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
        if (type === 'LOGIN') return <Monitor className="w-4 h-4 text-[#A0A0A0]" />;
        return <Mail className="w-4 h-4 text-[#E67E22]" />;
    };

    const getSourceLabel = (type: string) => {
        if (type === 'LOGIN') return 'VISITOR';
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
                        className="relative w-full max-w-4xl max-h-[90vh] bg-[#121212] border border-[#2A2A2A] rounded-[24px] shadow-[0_32px_128px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-[#2A2A2A] flex justify-between items-start">
                            <div className="flex gap-4">
                                <div className="p-3 rounded-xl bg-[#1A1A1A] border border-[#333] shadow-inner">
                                    {activeTab === 'logs' ? <Mail className="w-6 h-6 text-[#D4AF37]" /> : <Megaphone className="w-6 h-6 text-[#D4AF37]" />}
                                </div>
                                <div>
                                    <h2 className="text-[22px] font-bold text-[#D4AF37] tracking-wider uppercase">
                                        {activeTab === 'logs' ? 'Engagement Report' : 'Course Update Blast'}
                                    </h2>
                                    <p className="text-[11px] text-[#A0A0A0] tracking-[0.2em] font-bold uppercase mt-1">
                                        {activeTab === 'logs' ? 'Tracking Daily Pulse & Visits' : 'Initiate Transmission to All Souls'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex gap-2 bg-[#1A1A1A] p-1 rounded-full border border-[#2A2A2A]">
                                    <button 
                                        onClick={() => setActiveTab('logs')}
                                        className={`px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all ${activeTab === 'logs' ? 'bg-[#D4AF37] text-black' : 'text-[#666] hover:text-white'}`}
                                    >Logs</button>
                                    <button 
                                        onClick={() => setActiveTab('blast')}
                                        className={`px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all ${activeTab === 'blast' ? 'bg-[#D4AF37] text-black' : 'text-[#666] hover:text-white'}`}
                                    >Broadcast</button>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2.5 rounded-full hover:bg-[#1A1A1A] text-[#666] transition-all hover:text-white"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {activeTab === 'logs' ? (
                            <>
                                {/* Table Header */}
                                <div className="px-10 py-6 grid grid-cols-[2fr_1.5fr_1fr_1fr_0.5fr] text-[11px] font-bold text-[#666] uppercase tracking-[0.2em]">
                                    <div>User</div>
                                    <div>Source</div>
                                    <div>Date</div>
                                    <div>Time</div>
                                    <div className="text-right">
                                        <button onClick={fetchLogs} disabled={isLoading} className="hover:text-[#D4AF37] transition-colors">
                                            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                                        </button>
                                    </div>
                                </div>

                                {/* Scrollable Body */}
                                <div className="flex-1 overflow-y-auto px-6 pb-8 custom-scrollbar">
                                    <div className="space-y-1">
                                        {logs.map((log) => {
                                            const { date, time } = formatTimestamp(log.timestamp);
                                            const userName = log.userEmail ? log.userEmail.split('@')[0] : 'Soul';
                                            const displayName = userName.charAt(0).toUpperCase() + userName.slice(1);

                                            return (
                                                <motion.div
                                                    key={log.id}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    className="grid grid-cols-[2fr_1.5fr_1fr_1fr_0.5fr] items-center px-4 py-4 rounded-xl hover:bg-[#1A1A1A] transition-colors border-b border-[#1A1A1A] last:border-0 group"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2A2A2A] to-[#1A1A1A] border border-[#333] flex items-center justify-center overflow-hidden">
                                                            <span className="text-[14px] font-bold text-[#888]">{displayName.charAt(0)}</span>
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[14px] font-medium text-[#D0D0D0] group-hover:text-white transition-colors">{displayName}</span>
                                                            <span className="text-[9px] text-[#555] font-bold uppercase tracking-widest">{log.userEmail}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        {getSourceIcon(log.activityType)}
                                                        <span className="text-[12px] font-bold text-[#A0A0A0] tracking-tight">{getSourceLabel(log.activityType)}</span>
                                                    </div>

                                                    <div className="text-[13px] text-[#A0A0A0]">{date}</div>

                                                    <div className="text-[13px] font-bold text-[#D4AF37]">{time}</div>

                                                    <div className="flex justify-end">
                                                        <button className="p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#2A2A2A] text-[#666] hover:text-[#D4AF37]">
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}

                                        {logs.length === 0 && !isLoading && (
                                            <div className="py-20 text-center">
                                                <p className="text-[#444] italic">No echoes captured yet...</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 p-12 overflow-y-auto custom-scrollbar">
                                <div className="max-w-2xl mx-auto space-y-12">
                                    <div className="space-y-8">
                                        <WhisperInput 
                                            label="Chapter Title"
                                            placeholder="The Witness Consciousness"
                                            value={blastTitle}
                                            onChange={setBlastTitle}
                                        />
                                        <WhisperInput 
                                            label="Detailed Guidance / Subtitle"
                                            placeholder="Explore the depth of the untethered soul..."
                                            multiline
                                            value={blastSubtitle}
                                            onChange={setBlastSubtitle}
                                        />
                                    </div>

                                    <div className="p-8 rounded-[32px] bg-[#1A1A1A] border border-[#2A2A2A] space-y-4">
                                        <p className="text-[10px] text-[#666] font-bold uppercase tracking-[0.3em]">Email Preview</p>
                                        <div className="border border-[#333] rounded-2xl p-6 bg-[#0C0910] font-serif italic text-white/60">
                                            <p className="text-[#D4AF37] text-lg not-italic font-bold mb-2">{blastTitle || "The Journey Continues."}</p>
                                            <p>{blastSubtitle || "New sacred guidance has been revealed..."}</p>
                                        </div>
                                    </div>

                                    <div className="flex justify-center pt-4">
                                        <AnchorButton 
                                            variant="solid" 
                                            onClick={handleBlastUpdate}
                                            loading={isBlasting}
                                            disabled={!blastTitle}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Send className="w-4 h-4" />
                                                <span>Initiate Update Blast</span>
                                            </div>
                                        </AnchorButton>
                                    </div>
                                </div>
                            </div>
                        )}

                        <SacredToast message={toast} visible={!!toast} />

                        <style dangerouslySetInnerHTML={{
                            __html: `
                            .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                            .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
                            .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #444; }
                        ` }} />
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default EngagementReport;
