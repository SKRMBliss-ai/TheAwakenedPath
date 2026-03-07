import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Wind, ChevronDown, Loader2, Inbox, type LucideIcon } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { db } from '../../firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface JournalEntry {
    id: string;
    emotion?: string;
    emotions?: string | string[];
    thoughtContent?: string;
    bodyArea?: string;
    wisdomResponse?: string;
    cognitiveDistortion?: string;
    date?: string;
    createdAt?: any;
}

interface SituationalLog {
    id: string;
    situationId: string;
    situationTitle: string;
    responses: Record<string, string>;
    date?: string;
    createdAt?: any;
}

type ActiveTab = 'journal' | 'situational';

function formatDate(entry: JournalEntry | SituationalLog): string {
    if (entry.createdAt?.toDate) {
        const d = entry.createdAt.toDate() as Date;
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    }
    if (entry.date) return entry.date;
    return '—';
}

// ─── Journal Card ─────────────────────────────────────────────────────────────
const JournalCard: React.FC<{ entry: JournalEntry; index: number }> = ({ entry, index }) => {
    const [expanded, setExpanded] = useState(false);

    const emotions = (() => {
        const raw = entry.emotions || entry.emotion || '';
        if (!raw) return [] as string[];
        if (Array.isArray(raw)) return raw as string[];
        return (raw as string).split(',').map((s: string) => s.trim()).filter(Boolean);
    })();

    const hasDetails = entry.thoughtContent || entry.wisdomResponse || entry.cognitiveDistortion;

    return (
        <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.035 }}
            className="rounded-[16px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden"
        >
            <button className="w-full text-left px-3.5 py-3 flex items-center gap-3 group" onClick={() => setExpanded(!expanded)}>
                <div className="w-7 h-7 flex-shrink-0 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent-primary-muted)' }}>
                    <BookOpen size={12} style={{ color: 'var(--accent-primary)' }} />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        {emotions.length > 0 ? emotions.slice(0, 3).map((em: string) => (
                            <span key={em} className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                                style={{ background: 'var(--accent-primary-muted)', color: 'var(--accent-primary)' }}>
                                {em}
                            </span>
                        )) : (
                            <span className="text-[10px] font-serif italic text-[var(--text-muted)]">Journal Entry</span>
                        )}
                    </div>
                    {entry.thoughtContent && (
                        <p className="text-[10px] font-serif italic text-[var(--text-secondary)] mt-0.5 truncate opacity-60">
                            "{entry.thoughtContent}"
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[8px] text-[var(--text-muted)] opacity-40">{formatDate(entry)}</span>
                    {hasDetails && (
                        <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                            <ChevronDown size={12} className="text-[var(--text-muted)] opacity-40" />
                        </motion.div>
                    )}
                </div>
            </button>

            <AnimatePresence>
                {expanded && hasDetails && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
                        <div className="px-3.5 pb-3.5 space-y-2.5 border-t border-[var(--border-subtle)] pt-2.5">
                            {entry.thoughtContent && (
                                <div>
                                    <p className="text-[7px] uppercase tracking-widest font-bold text-[var(--text-muted)] mb-0.5 opacity-40">Witnessed Thought</p>
                                    <p className="text-[11px] font-serif italic text-[var(--text-secondary)] leading-relaxed">"{entry.thoughtContent}"</p>
                                </div>
                            )}
                            {entry.wisdomResponse && (
                                <div className="p-2.5 rounded-xl" style={{ background: 'var(--accent-secondary-dim)' }}>
                                    <p className="text-[7px] uppercase tracking-widest font-bold mb-0.5 opacity-50" style={{ color: 'var(--accent-secondary)' }}>Soul Wisdom</p>
                                    <p className="text-[10px] font-serif italic leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{entry.wisdomResponse}</p>
                                </div>
                            )}
                            {entry.cognitiveDistortion && (
                                <div>
                                    <p className="text-[7px] uppercase tracking-widest font-bold text-[var(--text-muted)] mb-0.5 opacity-40">Mind Pattern</p>
                                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'var(--accent-primary-muted)', color: 'var(--accent-primary)' }}>
                                        {entry.cognitiveDistortion}
                                    </span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// ─── Situational Log Card ─────────────────────────────────────────────────────
const SituationalCard: React.FC<{ log: SituationalLog; index: number }> = ({ log, index }) => {
    const [expanded, setExpanded] = useState(false);
    const prompts = Object.entries(log.responses || {}).filter(([, v]) => v?.trim());

    return (
        <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.035 }}
            className="rounded-[16px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden"
        >
            <button className="w-full text-left px-3.5 py-3 flex items-center gap-3 group" onClick={() => setExpanded(!expanded)}>
                <div className="w-7 h-7 flex-shrink-0 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent-secondary-dim)' }}>
                    <Wind size={12} style={{ color: 'var(--accent-secondary)' }} />
                </div>

                <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-serif text-[var(--text-primary)] truncate">{log.situationTitle}</p>
                    <p className="text-[9px] text-[var(--text-muted)] opacity-50 mt-0.5">
                        {prompts.length} reflection{prompts.length !== 1 ? 's' : ''} sealed
                    </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[8px] text-[var(--text-muted)] opacity-40">{formatDate(log)}</span>
                    {prompts.length > 0 && (
                        <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                            <ChevronDown size={12} className="text-[var(--text-muted)] opacity-40" />
                        </motion.div>
                    )}
                </div>
            </button>

            <AnimatePresence>
                {expanded && prompts.length > 0 && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
                        <div className="px-3.5 pb-3.5 space-y-2.5 border-t border-[var(--border-subtle)] pt-2.5">
                            {prompts.map(([label, value], i) => (
                                <div key={i} className="space-y-0.5">
                                    <p className="text-[7px] uppercase tracking-widest font-bold text-[var(--text-muted)] opacity-40">{label}</p>
                                    <p className="text-[11px] font-serif italic text-[var(--text-secondary)] leading-relaxed">"{value}"</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyState: React.FC<{ type: ActiveTab }> = ({ type }) => (
    <div className="py-10 flex flex-col items-center gap-3 text-center">
        <Inbox size={20} className="text-[var(--text-muted)] opacity-30" />
        <div>
            <p className="text-sm font-serif italic text-[var(--text-muted)]">
                {type === 'journal' ? 'No journal entries yet.' : 'No practice reflections yet.'}
            </p>
            <p className="text-[9px] text-[var(--text-muted)] opacity-40 uppercase tracking-widest mt-0.5">
                {type === 'journal' ? 'Begin a journal session to see your reflections here.' : 'Complete a situational practice to see it here.'}
            </p>
        </div>
    </div>
);

// ─── Main Component ────────────────────────────────────────────────────────────
const PastReflections: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<ActiveTab>('situational');
    const [journalLogs, setJournalLogs] = useState<JournalEntry[]>([]);
    const [situationalLogs, setSituationalLogs] = useState<SituationalLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        setIsLoading(true);
        const fetchAll = async () => {
            try {
                const [jSnap, sSnap] = await Promise.all([
                    getDocs(query(collection(db, 'users', user.uid, 'journal'), orderBy('createdAt', 'desc'))),
                    getDocs(query(collection(db, 'users', user.uid, 'situational-logs'), orderBy('createdAt', 'desc'))),
                ]);
                setJournalLogs(jSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
                setSituationalLogs(sSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAll();
    }, [user]);

    const TABS: { id: ActiveTab; label: string; shortLabel: string; icon: LucideIcon; count: number; color: string }[] = [
        { id: 'situational', label: 'Practice Reflections', shortLabel: 'Practices', icon: Wind, count: situationalLogs.length, color: 'var(--accent-secondary)' },
        { id: 'journal', label: 'Daily Journal', shortLabel: 'Journal', icon: BookOpen, count: journalLogs.length, color: 'var(--accent-primary)' },
    ];

    return (
        <div className="space-y-4 pt-6">
            {/* Header - compact */}
            <div className="flex items-end justify-between border-b border-[var(--border-subtle)] pb-4">
                <div>
                    <p className="text-[8px] uppercase tracking-[0.4em] text-[var(--accent-primary)] font-bold mb-0.5">Your Path</p>
                    <h2 className="text-xl font-serif font-light text-[var(--text-primary)]">Past Reflections</h2>
                </div>
                <p className="text-[9px] font-serif italic text-[var(--text-muted)] opacity-50 pb-0.5">
                    {journalLogs.length + situationalLogs.length} total
                </p>
            </div>

            {/* Tab Switcher - compact pill style */}
            <div className="flex gap-2 p-1 rounded-[14px] bg-[var(--bg-secondary)] border border-[var(--border-subtle)] w-full">
                {TABS.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-[10px] transition-all duration-300"
                            style={{
                                background: isActive ? 'var(--bg-surface)' : 'transparent',
                                boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.07)' : 'none',
                                border: isActive ? '1px solid var(--border-default)' : '1px solid transparent',
                            }}
                        >
                            <div style={{ opacity: isActive ? 1 : 0.45 }}>
                                <Icon size={12} style={{ color: isActive ? tab.color : 'var(--text-muted)' }} />
                            </div>
                            <span className="text-[9px] font-bold uppercase tracking-wider hidden xs:inline"
                                style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                                <span className="sm:hidden">{tab.shortLabel}</span>
                                <span className="hidden sm:inline">{tab.label}</span>
                            </span>
                            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full"
                                style={{ background: isActive ? `${tab.color}20` : 'transparent', color: isActive ? tab.color : 'var(--text-muted)', opacity: isActive ? 1 : 0.5 }}>
                                {tab.count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="flex items-center justify-center py-10">
                    <Loader2 size={18} className="animate-spin text-[var(--text-muted)] opacity-40" />
                </div>
            ) : (
                <AnimatePresence mode="wait">
                    <motion.div key={activeTab} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.18 }} className="space-y-2">
                        {activeTab === 'journal' && (
                            journalLogs.length === 0
                                ? <EmptyState type="journal" />
                                : journalLogs.map((e, i) => <JournalCard key={e.id} entry={e} index={i} />)
                        )}
                        {activeTab === 'situational' && (
                            situationalLogs.length === 0
                                ? <EmptyState type="situational" />
                                : situationalLogs.map((l, i) => <SituationalCard key={l.id} log={l} index={i} />)
                        )}
                    </motion.div>
                </AnimatePresence>
            )}
        </div>
    );
};

export default PastReflections;
