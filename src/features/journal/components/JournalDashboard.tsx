import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';
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
  onViewLogs: () => void;
}

const EMOTION_COLORS: Record<string, string> = {
  ANXIETY: '#FF7043', 
  SADNESS: '#5C6BC0', 
  INSECURITY: '#5EC4B0',
  ANGER: '#E53935', 
  PEACE: '#ABCEC9', 
  JOY: '#FFD54F', 
  GUILT: '#9575CD', 
  SHAME: '#7986CB',
};

function emotionColor(str?: string) {
  if (!str) return '#B8973A';
  return EMOTION_COLORS[str.split(',')[0].trim().toUpperCase()] ?? '#B8973A';
}

function entryDate(e: JournalEntry): Date {
  if (e.createdAt?.toDate) return e.createdAt.toDate();
  return new Date(e.date || Date.now());
}

// ── Week strip ──────────────────────────────────────────────────────────────
function WeekStrip({ entries }: { entries: JournalEntry[] }) {
  const today = new Date(); 
  today.setHours(0,0,0,0);
  
  const entryDays = new Set(entries.map(e => {
    const d = new Date(entryDate(e)); 
    d.setHours(0,0,0,0); 
    return d.getTime();
  }));
  
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today); 
    d.setDate(today.getDate() - (6 - i)); 
    return d;
  });
  const lbls = ['M','T','W','T','F','S','S'];

  // Streak count
  let streak = 0;
  let check = new Date(today);
  while (entryDays.has(check.getTime())) {
    streak++;
    check = new Date(check); 
    check.setDate(check.getDate() - 1);
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4 px-1">
        <span className="font-sans text-[10px] font-bold uppercase tracking-[.25em] text-[var(--text-muted)]">
          This week
        </span>
        {streak > 1 && (
          <span className="font-sans text-[10px] font-bold text-[var(--accent-primary)] flex items-center gap-1">
            {streak} day streak <span className="text-[12px]">🔥</span>
          </span>
        )}
      </div>

      <div className="relative flex justify-between">
        {/* Track line */}
        <div className="absolute top-[19px] left-[19px] right-[19px] h-[1px]"
          style={{ background: 'var(--border-subtle)', opacity: 0.5 }} />

        {days.map((d, i) => {
          const isToday  = d.getTime() === today.getTime();
          const hasEntry = entryDays.has(d.getTime());
          const lbl = lbls[d.getDay() === 0 ? 6 : d.getDay() - 1];
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 relative z-10">
              <span className={cn(
                "font-sans text-[10px] font-bold uppercase tracking-widest",
                isToday ? "text-[var(--accent-primary)]" : "text-[var(--text-muted)] opacity-60"
              )}>
                {lbl}
              </span>
              <div className="w-[38px] h-[38px] rounded-full flex items-center justify-center font-sans text-[13px] font-semibold transition-all duration-300"
                style={{
                  background: hasEntry ? 'var(--accent-primary)' : isToday ? 'var(--bg-surface)' : 'transparent',
                  border: isToday 
                    ? `1.5px solid var(--accent-primary)` 
                    : hasEntry 
                      ? `1.5px solid var(--accent-primary)` 
                      : '1.5px solid var(--border-subtle)',
                  color: hasEntry ? '#fff' : isToday ? 'var(--accent-primary)' : 'var(--text-muted)',
                  boxShadow: hasEntry ? '0 4px 12px var(--accent-primary-hover)30' : 'none',
                }}>
                {hasEntry ? '✓' : d.getDate()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Entry row ───────────────────────────────────────────────────────────────
function EntryRow({ entry }: { entry: JournalEntry }) {
  const color   = emotionColor(entry.emotions);
  const preview = entry.thoughts?.trim().slice(0, 68) || 'No text recorded';
  const diff    = Date.now() - entryDate(entry).getTime();
  const days    = Math.floor(diff / 86400000);
  const ago     = days === 0 ? 'Today' : days === 1 ? 'Yesterday' : `${days} days ago`;

  return (
    <motion.div 
      whileHover={{ scale: 1.01, x: 4 }}
      className="flex items-center gap-4 px-5 py-4 rounded-[20px] mb-3 cursor-pointer group transition-all duration-300 shadow-sm"
      style={{ 
        background: 'var(--bg-surface)', 
        border: '1.5px solid var(--border-subtle)' 
      }}
    >
      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
        style={{ background: color, boxShadow: `0 0 10px ${color}60` }} />
      <div className="flex-1 min-w-0">
        <p className="font-serif text-[15px] font-medium leading-relaxed truncate text-[var(--text-main)]">
          "{preview}"
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] opacity-60">
            {ago}
          </span>
          {entry.emotions && (
            <>
              <span className="w-1 h-1 rounded-full bg-[var(--border-subtle)]" />
              <span className="font-sans text-[10px] font-bold uppercase tracking-wider" style={{ color: color }}>
                {entry.emotions.split(',')[0].trim()}
              </span>
            </>
          )}
        </div>
      </div>
      <svg width="7" height="12" viewBox="0 0 6 11" fill="none" className="flex-shrink-0 text-[var(--text-muted)] opacity-30 group-hover:opacity-100 transition-opacity">
        <path d="M1 1l4 4.5L1 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </motion.div>
  );
}

// ── Main ────────────────────────────────────────────────────────────────────
export function JournalDashboard({ entries, isLoadingScript, onBegin, onSkipToWrite, onViewLogs }: JournalDashboardProps) {
  const recent = entries.slice(0, 4);

  const handleExport = () => {
    if (entries.length === 0) return;
    const headers = ['Date', 'Time', 'Emotions', 'Primary Thoughts', 'Physical Sensations', 'Inner Truth'];
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
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 0 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-2xl mx-auto"
    >
      {/* Choice Header */}
      <div className="text-center mb-10 pt-4">
        <h1 className="font-serif text-[42px] sm:text-[56px] font-black uppercase tracking-[0.15em] leading-none mb-4" 
            style={{ 
              background: 'linear-gradient(180deg, var(--text-main) 0%, var(--text-muted) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              opacity: 0.9
            }}>
          AWAKEN
        </h1>
        <p className="font-serif text-xl sm:text-2xl text-[var(--accent-primary)] mb-1 font-medium italic">Settle into the Now</p>
        <p className="font-sans text-[10px] font-black uppercase tracking-[0.25em] text-[var(--text-muted)] opacity-50">Guided meditation · then journal</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
        {/* ── PATH 1: Guided ── */}
        <motion.button
          whileHover={{ scale: 1.01, translateY: -2 }}
          whileTap={{ scale: 0.985 }}
          onClick={onBegin}
          disabled={isLoadingScript}
          className="relative flex flex-col rounded-[24px] overflow-hidden text-left transition-all shadow-lg group border-[1.5px] border-[var(--accent-primary)] bg-[var(--bg-surface)] p-6 pt-7 min-h-[180px]"
          style={{ cursor: isLoadingScript ? 'wait' : 'pointer' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-[var(--bg-card)] border border-[var(--accent-primary)]/30">
              <span className="font-serif text-[9px] font-black tracking-[.1em] text-[var(--accent-primary)]">PATH 1</span>
            </div>
            <h2 className="font-serif text-[20px] font-bold text-[var(--text-main)]">The Guided Path</h2>
          </div>
          <p className="font-sans text-[13px] leading-relaxed text-[var(--text-secondary)] mb-6 flex-1 opacity-80">
            Settle into the Now with a short, calming meditation before you record.
          </p>
          <div className="h-11 rounded-xl flex items-center justify-center bg-[var(--accent-primary)] text-white text-[12px] font-black uppercase tracking-[0.2em] shadow-lg group-hover:brightness-110 transition-all">
            {isLoadingScript ? 'Preparing…' : 'Begin Journey'}
          </div>
        </motion.button>

        {/* ── PATH 2: Silent ── */}
        <motion.button
          whileHover={{ scale: 1.01, translateY: -2 }}
          whileTap={{ scale: 0.985 }}
          onClick={onSkipToWrite}
          className="relative flex flex-col rounded-[24px] overflow-hidden text-left transition-all border-[1.5px] border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 pt-7 min-h-[180px] shadow-sm group hover:border-[var(--accent-primary)]/40"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-[var(--bg-card)] border border-[var(--border-subtle)]">
               <span className="font-serif text-[9px] font-black tracking-[.1em] text-[var(--text-muted)]">PATH 2</span>
            </div>
            <h2 className="font-serif text-[20px] font-bold text-[var(--text-main)]">Reflect in Silence</h2>
          </div>
          <p className="font-sans text-[13px] leading-relaxed text-[var(--text-secondary)] mb-6 flex-1 opacity-80">
            Ready to share right away? Record your thoughts directly.
          </p>
          <div className="h-11 rounded-xl flex items-center justify-center border-2 border-[var(--text-main)] bg-[var(--text-main)] text-[var(--bg-color)] text-[12px] font-black uppercase tracking-[0.2em] transition-all group-hover:scale-[1.02] shadow-md">
            Write directly →
          </div>
        </motion.button>
      </div>

      {/* Week strip */}
      <WeekStrip entries={entries} />

      {/* Recent entries */}
      {recent.length > 0 ? (
        <>
          <div className="flex items-center justify-between mb-4 px-1 mt-2">
            <p className="font-sans text-[11px] font-bold uppercase tracking-[.25em] text-[var(--text-muted)]">
              Recent reflections
            </p>
            <button 
              onClick={handleExport}
              className="flex items-center gap-1.5 font-sans text-[11px] font-bold uppercase tracking-widest text-[var(--accent-primary)] hover:opacity-80 transition-opacity"
            >
              <Download size={12} /> Export CSV
            </button>
          </div>
          {recent.map((e) => <EntryRow key={e.id} entry={e} />)}
          {entries.length > 4 && (
            <div className="text-center mt-10">
            <button 
              onClick={onViewLogs}
              className="font-sans text-[12px] font-bold uppercase tracking-widest px-10 py-4 rounded-full transition-all border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-main)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] shadow-sm cursor-pointer"
            >
              View all {entries.length} reflections →
            </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full mx-auto mb-6 shadow-inner flex items-center justify-center"
            style={{ 
              background: 'var(--bg-surface)', 
              border: '1.5px solid var(--border-subtle)' 
            }}>
            <div className="w-2 h-2 rounded-full bg-[var(--accent-primary)] opacity-20" />
          </div>
          <p className="font-serif text-[18px] italic mb-2 text-[var(--text-main)] opacity-40">
            Your first reflection is waiting.
          </p>
          <p className="font-sans text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)] opacity-30">
            Tap the button above to begin.
          </p>
        </div>
      )}
    </motion.div>
  );
}
