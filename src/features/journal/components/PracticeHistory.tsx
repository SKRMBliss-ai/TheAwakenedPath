import { useState, useEffect, useMemo } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase';
import { useAuth } from '../../auth/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export interface UnifiedEntry {
    id: string;
    type: 'journal' | 'situational';
    title: string;           
    subtitle: string;        
    date: Date;
    color: string;           
    thoughts?: string;
    emotions?: string;
    bodyArea?: string;
    cognitiveDistortion?: string;
    reflections?: string;
    situationId?: string;
    situationTitle?: string;
    responses?: Record<string, string>;
}

async function fetchUnifiedHistory(uid: string, limitCount = 50): Promise<UnifiedEntry[]> {
    const [journalSnap, situationalSnap] = await Promise.all([
        getDocs(query(
            collection(db, 'users', uid, 'journal'),
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        )),
        getDocs(query(
            collection(db, 'users', uid, 'situational-logs'),
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        )),
    ]);

    const journalEntries: UnifiedEntry[] = journalSnap.docs.map(doc => {
        const d = doc.data();
        let subtitleParts = [];
        if (d.thoughts) subtitleParts.push(d.thoughts);
        if (d.emotions) subtitleParts.push(d.emotions);
        
        let subtitle = subtitleParts.join(' · ');
        if (!subtitle) subtitle = 'No reflections recorded';
        
        return {
            id: doc.id,
            type: 'journal',
            title: 'Journal Entry',
            subtitle: subtitle.length > 80 ? subtitle.slice(0, 80) + '...' : subtitle,
            date: d.createdAt?.toDate?.() || new Date(d.date || Date.now()),
            color: '#C65F9D', 
            thoughts: d.thoughts,
            emotions: d.emotions,
            bodyArea: d.bodyArea,
            cognitiveDistortion: d.cognitiveDistortion,
            reflections: d.reflections,
        };
    });

    const situationalEntries: UnifiedEntry[] = situationalSnap.docs.map(doc => {
        const d = doc.data();
        const responseValues = Object.values(d.responses || {}).filter(Boolean);
        let summary = responseValues.length > 0 
            ? (responseValues[0] as string).slice(0, 80) + ((responseValues[0] as string).length > 80 ? '...' : '')
            : 'No reflection written';
            
        return {
            id: doc.id,
            type: 'situational',
            title: d.situationTitle || 'Practice',
            subtitle: summary,
            date: d.createdAt?.toDate?.() || new Date(d.date || Date.now()),
            color: '#ABCEC9', 
            situationId: d.situationId,
            situationTitle: d.situationTitle,
            responses: d.responses,
        };
    });

    return [...journalEntries, ...situationalEntries]
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, limitCount);
}

function isSameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() 
        && a.getMonth() === b.getMonth() 
        && a.getDate() === b.getDate();
}

function isThisWeek(d: Date): boolean {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    return d >= weekAgo;
}

function groupByDate(entries: UnifiedEntry[]): Map<string, UnifiedEntry[]> {
    const groups = new Map<string, UnifiedEntry[]>();
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    for (const entry of entries) {
        let label: string;
        const d = entry.date;
        
        if (isSameDay(d, today)) {
            label = 'Today';
        } else if (isSameDay(d, yesterday)) {
            label = 'Yesterday';
        } else if (isThisWeek(d)) {
            label = d.toLocaleDateString('en-US', { weekday: 'long' });
        } else {
            label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }

        if (!groups.has(label)) groups.set(label, []);
        groups.get(label)!.push(entry);
    }
    return groups;
}

export function PracticeHistory() {
    const { user } = useAuth();
    const [entries, setEntries] = useState<UnifiedEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'journal' | 'situational'>('all');
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;
        setLoading(true);
        fetchUnifiedHistory(user.uid, 50)
            .then(setEntries)
            .finally(() => setLoading(false));
    }, [user]);

    const filtered = useMemo(() => entries.filter(e => filter === 'all' || e.type === filter), [entries, filter]);
    const grouped = useMemo(() => groupByDate(filtered), [filtered]);

    return (
        <div className="max-w-xl mx-auto pb-20 px-4">
            <div className="flex items-center justify-between py-4 mb-2">
                <div>
                    <h1 className="text-xl md:text-2xl font-serif font-light tracking-tight" 
                        style={{ color: 'var(--text-primary)' }}>
                        Practice History
                    </h1>
                    <p className="text-[12px] font-serif italic mt-0.5"
                        style={{ color: 'var(--text-muted)' }}>
                        {filtered.length} moment{filtered.length !== 1 ? 's' : ''} of awareness
                    </p>
                </div>
                <div className="flex gap-1.5 flex-wrap justify-end">
                    {(['all', 'journal', 'situational'] as const).map(f => (
                        <button key={f} onClick={() => setFilter(f)}
                            className="px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-wider transition-all"
                            style={{
                                background: filter === f ? 'var(--accent-primary)' : 'var(--bg-surface)',
                                color: filter === f ? 'white' : 'var(--text-muted)',
                                border: filter === f ? 'none' : '1px solid var(--border-subtle)',
                            }}>
                            {f === 'all' ? 'All' : f === 'journal' ? 'Journal' : 'Practices'}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="py-20 text-center">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" 
                        style={{ color: 'var(--text-muted)' }} />
                    <p className="text-[12px] text-[var(--text-muted)] font-serif italic">
                        Loading your journey...
                    </p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="py-20 text-center">
                    <p className="text-[15px] font-serif italic leading-relaxed" 
                        style={{ color: 'var(--text-muted)' }}>
                        Your practice history will appear here.<br/>
                        <span className="text-[13px] opacity-70">Start with a journal entry or a guided practice.</span>
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {Array.from(grouped.entries()).map(([dateLabel, dayEntries]) => (
                        <div key={dateLabel}>
                            <p className="text-[9px] font-bold uppercase tracking-[0.2em] mb-2 pl-1"
                                style={{ color: 'var(--text-muted)' }}>
                                {dateLabel}
                            </p>
                            
                            <div className="space-y-2">
                                {dayEntries.map(entry => (
                                    <EntryCard 
                                        key={entry.id} 
                                        entry={entry}
                                        isExpanded={expandedId === entry.id}
                                        onToggle={() => setExpandedId(
                                            expandedId === entry.id ? null : entry.id
                                        )}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function EntryCard({ entry, isExpanded, onToggle }: { 
    entry: UnifiedEntry; isExpanded: boolean; onToggle: () => void 
}) {
    const isJournal = entry.type === 'journal';
    const time = entry.date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    
    return (
        <button onClick={onToggle} className="w-full text-left outline-none">
            <div className="p-3.5 rounded-xl transition-all"
                style={{
                    background: isExpanded ? 'var(--bg-surface-hover)' : 'var(--bg-surface)',
                    border: `1px solid ${isExpanded ? 'var(--border-default)' : 'var(--border-subtle)'}`,
                }}>
                <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 max-w-[80%]">
                        <div className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ background: entry.color }} />
                        <span className="text-[13px] font-serif font-medium truncate"
                            style={{ color: 'var(--text-primary)' }}>
                            {entry.title}
                        </span>
                        <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded flex-shrink-0 hidden sm:inline-block"
                            style={{ 
                                background: entry.color + '15', 
                                color: entry.color,
                            }}>
                            {isJournal ? 'Journal' : 'Practice'}
                        </span>
                    </div>
                    <span className="text-[10px] flex-shrink-0"
                        style={{ color: 'var(--text-muted)' }}>
                        {time}
                    </span>
                </div>

                <p className="text-[12px] leading-relaxed truncate pl-4"
                    style={{ color: 'var(--text-secondary)' }}>
                    {entry.subtitle}
                </p>

                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="pt-3 mt-3 pl-4 space-y-3"
                                style={{ borderTop: '1px solid var(--border-subtle)' }}>
                                {isJournal ? (
                                    <>
                                        {entry.thoughts && (
                                            <DetailRow label="Thoughts" value={entry.thoughts} />
                                        )}
                                        {entry.emotions && (
                                            <DetailRow label="Emotions" value={entry.emotions} />
                                        )}
                                        {entry.bodyArea && (
                                            <DetailRow label="Body" value={entry.bodyArea} />
                                        )}
                                        {entry.cognitiveDistortion && (
                                            <DetailRow label="Pattern" value={entry.cognitiveDistortion} />
                                        )}
                                        {entry.reflections && (
                                            <DetailRow label="Reflection" value={entry.reflections} />
                                        )}
                                    </>
                                ) : (
                                    <>
                                        {entry.responses && Object.entries(entry.responses).map(([key, val]) => (
                                            val && <DetailRow key={key} label={key} value={val as string} />
                                        ))}
                                    </>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </button>
    );
}

function DetailRow({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-[9px] font-bold uppercase tracking-wider mb-1"
                style={{ color: 'var(--text-muted)' }}>
                {label}
            </p>
            <p className="text-[12px] font-serif leading-relaxed whitespace-pre-wrap"
                style={{ color: 'var(--text-primary)' }}>
                {value}
            </p>
        </div>
    );
}
