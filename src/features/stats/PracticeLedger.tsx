import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Calendar, Loader2, ChevronDown } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { PRACTICE_LIBRARY } from '../practices/practiceLibrary';

interface PracticeEntry {
    date: string;
    questionId: string;
    completed: boolean;
    completedAt?: any;
    note?: string;
    triggersCompleted?: number;
}

const QUESTION_LABELS: Record<string, string> = {
    question1: 'Q1 · Redirection',
    question2: 'Q2 · Radio Check',
    question3: 'Q3 · Cosmic Pause',
    question4: 'Q4 · Clarity Sit',
};

export default function PracticeLedger() {
    const { user } = useAuth();
    const [entries, setEntries] = useState<PracticeEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedDate, setExpandedDate] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;
        
        const fetchPractices = async () => {
            setIsLoading(true);
            try {
                const practicesRef = collection(db, 'users', user.uid, 'dailyPractices');
                // We can't easily order by the document ID in Firestore query, 
                // but we can sort locally since the volume is small for now
                const snap = await getDocs(practicesRef);
                
                const allEntries: PracticeEntry[] = [];
                snap.docs.forEach(doc => {
                    const date = doc.id;
                    const data = doc.data();
                    Object.entries(data).forEach(([qid, record]: [string, any]) => {
                        if (record.completed) {
                            allEntries.push({
                                date,
                                questionId: qid,
                                ...record
                            });
                        }
                    });
                });

                // Sort by date desc
                allEntries.sort((a, b) => b.date.localeCompare(a.date));
                setEntries(allEntries);
            } catch (err) {
                console.error('[PracticeLedger] Fetch error:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPractices();
    }, [user]);

    // Group entries by date
    const grouped = entries.reduce((acc, entry) => {
        if (!acc[entry.date]) acc[entry.date] = [];
        acc[entry.date].push(entry);
        return acc;
    }, {} as Record<string, PracticeEntry[]>);

    const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 size={20} className="animate-spin text-[var(--text-muted)] opacity-40" />
            </div>
        );
    }

    if (dates.length === 0) {
        return (
            <div className="py-12 text-center rounded-[24px] border border-dashed border-[var(--border-subtle)] bg-[var(--bg-surface)]/30">
                <Calendar size={24} className="mx-auto text-[var(--text-muted)] opacity-20 mb-3" />
                <p className="text-sm font-serif italic text-[var(--text-muted)]">Your practice ledger is empty.</p>
                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mt-1 opacity-40">Complete a daily practice to see your history here.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-end justify-between border-b border-[var(--border-subtle)] pb-4">
                <div>
                    <p className="text-[8px] uppercase tracking-[0.4em] text-[var(--accent-secondary)] font-bold mb-0.5">Spiritual History</p>
                    <h2 className="text-xl font-serif font-light text-[var(--text-primary)]">Practice Ledger</h2>
                </div>
                <p className="text-[9px] font-serif italic text-[var(--text-muted)] opacity-50 pb-0.5">
                    {entries.length} sessions recorded
                </p>
            </div>

            <div className="space-y-3">
                {dates.map((date) => {
                    const dayEntries = grouped[date];
                    const isExpanded = expandedDate === date;
                    const displayDate = new Date(date).toLocaleDateString('en-IN', { 
                        weekday: 'short', 
                        day: 'numeric', 
                        month: 'short' 
                    });

                    return (
                        <div 
                            key={date}
                            className="rounded-[20px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden shadow-sm"
                        >
                            <button 
                                onClick={() => setExpandedDate(isExpanded ? null : date)}
                                className="w-full flex items-center justify-between p-4 group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center justify-center">
                                        <Calendar size={14} className="text-[var(--text-muted)]" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[12px] font-serif text-[var(--text-primary)]">{displayDate}</p>
                                        <div className="flex gap-1.5 mt-1">
                                            {dayEntries.map(e => (
                                                <div 
                                                    key={e.questionId}
                                                    className="w-1.5 h-1.5 rounded-full"
                                                    style={{ background: PRACTICE_LIBRARY[e.questionId]?.color || 'var(--accent-secondary)' }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)] opacity-60">
                                        {dayEntries.length} Practice{dayEntries.length !== 1 ? 's' : ''}
                                    </p>
                                    <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
                                        <ChevronDown size={14} className="text-[var(--text-muted)] opacity-40" />
                                    </motion.div>
                                </div>
                            </button>

                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                    >
                                        <div className="px-4 pb-4 space-y-2 border-t border-[var(--border-subtle)]/50 pt-3 bg-[var(--bg-secondary)]/30">
                                            {dayEntries.map((e, i) => {
                                                const practice = PRACTICE_LIBRARY[e.questionId];
                                                const color = practice?.color || 'var(--accent-secondary)';
                                                return (
                                                    <motion.div 
                                                        key={e.questionId}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: i * 0.1 }}
                                                        className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]/50"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div 
                                                                className="w-7 h-7 rounded-lg flex items-center justify-center"
                                                                style={{ background: color + '15', border: `1.5px solid ${color}30` }}
                                                            >
                                                                <CheckCircle2 size={14} style={{ color }} />
                                                            </div>
                                                            <div>
                                                                <p className="text-[11px] font-serif text-[var(--text-primary)]">{practice?.name || QUESTION_LABELS[e.questionId]}</p>
                                                                <p className="text-[8px] uppercase tracking-widest font-bold opacity-50" style={{ color }}>{QUESTION_LABELS[e.questionId]}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-wider">
                                                                {e.completedAt?.toDate ? e.completedAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Done'}
                                                            </p>
                                                            {e.triggersCompleted && (
                                                                <p className="text-[8px] text-[var(--text-muted)] opacity-60">
                                                                    {e.triggersCompleted} cycles
                                                                </p>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
