import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { useTheme } from '../../../theme/ThemeSystem';
import { Download } from 'lucide-react';

interface JournalEntry {
  id: string; 
  date: string; 
  thoughts?: string; 
  emotions?: string; 
  bodySensations?: string;
  distortion?: string;
  createdAt?: any;
}

interface JournalDashboardProps {
  entries: JournalEntry[]; 
  isLoadingScript: boolean;
  onBegin: () => void; 
  onSkipToWrite: () => void;
}

const EMOTION_COLORS: Record<string, string> = {
  ANXIETY: '#FF7043', SADNESS: '#5C6BC0', INSECURITY: '#5EC4B0',
  ANGER: '#E53935', PEACE: '#ABCEC9', JOY: '#FFD54F', GUILT: '#9575CD', SHAME: '#7986CB',
};

function emotionColor(str?: string) {
  if (!str) return '#B8973A';
  return EMOTION_COLORS[str.split(',')[0].trim().toUpperCase()] ?? '#B8973A';
}

function entryDate(e: JournalEntry): Date {
  if (e.createdAt?.toDate) return e.createdAt.toDate();
  return new Date(e.date || Date.now());
}

export function JournalDashboard({ entries, isLoadingScript, onBegin, onSkipToWrite }: JournalDashboardProps) {
    const { mode: _mode } = useTheme();

    const entryDays = new Set(entries.map(e => {
        const d = new Date(entryDate(e));
        d.setHours(0, 0, 0, 0);
        return d.getTime();
    }));

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let streak = 0;
    let check = new Date(today);
    const handleExport = () => {
        if (entries.length === 0) return;
        
        // Define CSV Headers
        const headers = ['Date', 'Time', 'Emotions', 'Primary Thoughts', 'Physical Sensations', 'Inner Truth'];
        
        // Map Entries to Rows
        const rows = entries.map(e => {
            const d = entryDate(e);
            return [
                d.toLocaleDateString(),
                d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                (e.emotions || '').replace(/,/g, ' | '),
                (e.thoughts || '').replace(/"/g, '""').replace(/\n/g, ' '),
                (e.bodySensations || '').replace(/"/g, '""').replace(/\n/g, ' '),
                (e.distortion || '')
            ];
        });
        
        // Construct CSV String
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');
        
        // Create Download Link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `Awakened_Path_Reflections_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    while (entryDays.has(check.getTime())) {
        streak++;
        check.setDate(check.getDate() - 1);
    }

    return (
        <div className="w-full max-w-5xl mx-auto space-y-12">

            {/* ── Daily Integration ── */}
            <section className="space-y-4">
                {/* ── CTA: left gold strip + mini orb + text + arrow ── */}
                <motion.button
                    whileTap={{ scale: 0.985 }}
                    onClick={onBegin}
                    disabled={isLoadingScript}
                    className="w-full flex items-stretch rounded-[24px] overflow-hidden text-left shadow-lg transition-all"
                    style={{
                        background: 'rgba(184,151,58,.06)',
                        border: '1px solid rgba(184,151,58,.22)',
                        cursor: isLoadingScript ? 'wait' : 'pointer',
                    }}
                >
                    {/* Gold left bar */}
                    <div className="w-1.5 flex-shrink-0" style={{
                        background: 'linear-gradient(180deg, rgba(201,168,76,.9), rgba(122,90,16,.6))'
                    }} />

                    {/* Body */}
                    <div className="flex items-center gap-5 px-6 py-6 flex-1">
                        {/* Mini orb */}
                        <motion.div
                            animate={{ 
                                boxShadow: [
                                    '0 0 16px rgba(184,151,58,.15)', 
                                    '0 0 28px rgba(184,151,58,.28)', 
                                    '0 0 16px rgba(184,151,58,.15)'
                                ] 
                            }}
                            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                            className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 relative overflow-hidden"
                            style={{
                                background: 'radial-gradient(ellipse at 38% 32%, #3D2640, #0E0818)',
                                border: '1px solid rgba(184,151,58,.28)',
                            }}
                        >
                            <div className="absolute" style={{ 
                                top:'8%', left:'12%', width:'40%', height:'28%',
                                background:'radial-gradient(ellipse,rgba(255,248,255,.07),transparent)', borderRadius:'50%' 
                            }} />
                            <span className="font-serif text-[9px] font-black tracking-[0.2em] relative z-10"
                                style={{ color: 'rgba(225,205,215,.65)' }}>AWAKEN</span>
                        </motion.div>

                        <div className="flex-1">
                            <h2 className="font-serif text-[24px] font-light leading-tight mb-1"
                                style={{ color: 'var(--text-main)' }}>
                                {isLoadingScript ? 'Preparing your meditation…' : 'Settle into the Now'}
                            </h2>
                            <p className="font-sans text-[11px] font-bold uppercase tracking-[0.05em]" 
                                style={{ color: '#B8973A', opacity: 0.8 }}>
                                Guided meditation · then journal
                            </p>
                        </div>

                        {/* Arrow */}
                        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-transform"
                            style={{ background: isLoadingScript ? 'rgba(184,151,58,.3)' : '#B8973A' }}>
                            {isLoadingScript ? (
                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                            ) : (
                                <svg width="14" height="14" fill="none" stroke="white" strokeWidth="3"
                                    strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                    <polyline points="9 18 15 12 9 6"/>
                                </svg>
                            )}
                        </div>
                    </div>
                </motion.button>

                {/* Skip */}
                <div className="text-center">
                    <button onClick={onSkipToWrite}
                        className="font-sans text-[12px] font-bold px-4 py-2 opacity-40 hover:opacity-100 transition-opacity tracking-widest uppercase cursor-pointer"
                        style={{ background: 'none', border: 'none', color: 'var(--text-main)' }}
                    >
                        Write directly →
                    </button>
                </div>
            </section>

            {/* ── 7-Day Consistency ── */}
            <div className="space-y-6">
                <div className="flex items-end justify-between px-2">
                    <h2 className="text-2xl font-serif text-[var(--text-main)]">Your Awareness Week</h2>
                    <p className="text-sm font-bold text-[var(--accent-primary)] uppercase tracking-widest">
                        {streak} Day Streak
                    </p>
                </div>
                <WeekStrip entries={entries} />
            </div>

            {/* ── Expanded Entry Feed ── */}
            <div className="space-y-6">
                <div className="flex items-end justify-between px-2">
                    <div className="flex flex-col">
                        <h2 className="text-2xl font-serif text-[var(--text-main)]">Daily Log</h2>
                        <p className="text-[10px] font-black uppercase tracking-[0.1em] text-[var(--text-muted)] opacity-60">
                            {entries.length} {entries.length === 1 ? 'reflection' : 'reflections'}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <a 
                            href="/Journal/Journal.pdf" 
                            download="Journal_Guide.pdf"
                            className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)] opacity-60 hover:opacity-100 transition-opacity flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)]"
                        >
                            <Download size={11} /> Journal Guide
                        </a>
                        <button 
                            onClick={handleExport}
                            className="text-[9px] font-bold uppercase tracking-widest text-[var(--accent-primary)] opacity-60 hover:opacity-100 transition-opacity flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--accent-primary)]/20 bg-[var(--accent-primary)]/5"
                        >
                            <Download size={11} /> CSV Data
                        </button>
                    </div>
                </div>
                
                <div className="grid gap-4">
                    {entries.length === 0 ? (
                        <div className="p-16 text-center border-2 border-dashed border-[var(--border-subtle)] rounded-[32px] opacity-40">
                            <p className="text-lg font-serif italic text-[var(--text-muted)]">Your journey begins with the first word...</p>
                        </div>
                    ) : (
                        entries.slice(0, 5).map(e => <EntryRow key={e.id} entry={e} />)
                    )}
                </div>

                {entries.length > 5 && (
                    <div className="text-center pt-10">
                        <button className="px-8 py-3 rounded-full border border-[var(--border-subtle)] text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:border-[var(--accent-primary-border)] hover:text-[var(--accent-primary)] transition-all">
                            View all {entries.length} reflections →
                        </button>
                    </div>
                )}
            </div>

        </div>
    );
}

function EntryRow({ entry }: { entry: JournalEntry }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const date = entryDate(entry);
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    const color = emotionColor(entry.emotions);
    const emotions = entry.emotions?.split(',').map(e => e.trim()).filter(Boolean) || [];

    return (
        <motion.div 
            layout
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
                "group relative overflow-hidden rounded-[28px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] transition-all cursor-pointer",
                isExpanded ? "p-8" : "p-5 sm:p-6"
            )}
        >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="flex flex-row sm:flex-col items-baseline sm:items-center justify-center gap-2 sm:gap-0 sm:w-20 flex-shrink-0">
                    <span className="text-xl sm:text-2xl font-serif text-[var(--text-primary)]">{dateStr}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] opacity-60">{timeStr}</span>
                </div>

                <div className="flex-1 min-w-0 space-y-2">
                    {!isExpanded ? (
                        <div className="flex items-center gap-3">
                            <div className="flex-1 truncate">
                                <p className="text-lg text-[var(--text-primary)] opacity-80 italic font-serif truncate">
                                    "{entry.thoughts || entry.bodySensations || 'Presence observed...'}"
                                </p>
                            </div>
                            {emotions.length > 0 && (
                                <span className="flex-shrink-0 px-2 py-1 rounded-lg bg-[var(--bg-input)] border border-[var(--border-subtle)] text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                                    {emotions.length} {emotions.length === 1 ? 'Feeling' : 'Feelings'}
                                </span>
                            )}
                        </div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }}
                            className="space-y-6"
                        >
                             <div className="flex flex-wrap gap-2">
                                {emotions.map(em => (
                                    <span 
                                        key={em} 
                                        className="px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest"
                                        style={{ background: color + '15', color: color, border: `1px solid ${color}40` }}
                                    >
                                        {em}
                                    </span>
                                ))}
                                {entry.distortion && (
                                    <span className="px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20">
                                        ✦ {entry.distortion}
                                    </span>
                                )}
                            </div>
                            <p className="text-xl sm:text-2xl text-[var(--text-primary)] leading-relaxed italic font-serif">
                                "{entry.thoughts || entry.bodySensations || 'Presence observed...'}"
                            </p>
                        </motion.div>
                    )}
                </div>

                <div className="flex-shrink-0">
                    <motion.div 
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        className="w-10 h-10 rounded-full border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)] group-hover:text-[var(--accent-primary)] group-hover:border-[var(--accent-primary-border)] transition-all"
                    >
                        {isExpanded ? '↑' : '↓'}
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}

function WeekStrip({ entries }: { entries: JournalEntry[] }) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() - (6 - i));
        return d;
    });

    const activeDays = new Set(entries.map(e => {
        const d = new Date(entryDate(e));
        d.setHours(0, 0, 0, 0);
        return d.getTime();
    }));

    return (
        <div className="relative">
            {/* End-to-end overlay fades for scroll hints */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[var(--bg-color)] to-transparent z-10 pointer-events-none opacity-50" />
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[var(--bg-color)] to-transparent z-10 pointer-events-none opacity-50" />
            
            <div className="flex justify-between gap-4 p-6 rounded-[32px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm overflow-x-auto no-scrollbar scroll-smooth">
                {days.map(d => {
                    const isToday = d.getTime() === today.getTime();
                    const hasEntry = activeDays.has(d.getTime());
                    const dayLabel = d.toLocaleDateString([], { weekday: 'short' });
                    
                    return (
                        <div key={d.toISOString()} className="flex flex-col items-center gap-3 min-w-[54px]">
                            <span className={cn(
                                "text-[10px] font-black uppercase tracking-[0.2em]",
                                isToday ? "text-[var(--accent-primary)]" : "text-[var(--text-muted)]"
                            )}>
                                {dayLabel}
                            </span>
                            <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all border-2",
                                hasEntry ? "bg-[var(--accent-primary)] border-[var(--accent-primary)] text-white shadow-lg" : 
                                isToday ? "border-[var(--accent-primary)] bg-[var(--accent-primary-muted)]/10 text-[var(--accent-primary)] font-bold" : 
                                "border-[var(--border-subtle)] bg-[var(--bg-input)] text-[var(--text-muted)]"
                            )}>
                                {hasEntry ? '✓' : d.getDate()}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
