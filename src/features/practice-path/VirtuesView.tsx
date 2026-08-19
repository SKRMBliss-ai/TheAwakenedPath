import { useState } from 'react';
import { cn } from '../../lib/utils';
import { useAuth } from '../auth/AuthContext';
import { VIRTUES, type Virtue } from './virtues';
import { virtueOfWeek, dayOfVirtueWeek } from './dailyRhythm';
import { usePracticeHistory } from './usePracticeDay';

/** Days this member has ever logged for a given virtue. */
function daysFor(history: { virtueKey?: string; virtuePractised?: boolean }[], key: string) {
  return history.filter((d) => d.virtuePractised && d.virtueKey === key).length;
}

function Ring({ done, size = 42 }: { done: number; size?: number }) {
  const embedded = done >= 7;
  const circ = 88;
  return (
    <div className="relative flex-shrink-0 grid place-items-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 44 44" className="absolute inset-0 -rotate-90" style={{ width: size, height: size }}>
        <circle cx="22" cy="22" r="14" fill="none" strokeWidth="3" className="stroke-[var(--border-subtle)]" />
        <circle
          cx="22" cy="22" r="14" fill="none" strokeWidth="3" strokeLinecap="round"
          stroke={embedded ? 'var(--done-accent)' : 'var(--accent-primary)'}
          strokeDasharray={circ}
          strokeDashoffset={circ - (Math.min(done, 7) / 7) * circ}
        />
      </svg>
      <span className={cn('text-[10px] font-bold', embedded ? 'text-[var(--done-accent)]' : 'text-[var(--accent-primary)]')}>
        {Math.min(done, 7)}/7
      </span>
    </div>
  );
}

export function VirtuesView() {
  const { user } = useAuth();
  const history = usePracticeHistory(user?.uid, 400);
  const active = virtueOfWeek();
  const [open, setOpen] = useState<Virtue | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[var(--text-muted)]">
          The Nine Virtues
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-light text-[var(--text-primary)] mt-1">
          One virtue a week
        </h1>
        <p className="text-[13px] text-[var(--text-secondary)] mt-2 max-w-xl leading-relaxed">
          The whole community practises the same virtue in the same week — nine weeks, then the
          cycle begins again a little deeper. Seven days embeds a quality; the ring tracks yours.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {VIRTUES.map((v) => {
          const done = daysFor(history, v.key);
          const embedded = done >= 7;
          const isActive = v.key === active.key;
          return (
            <button
              key={v.key}
              onClick={() => setOpen(open?.key === v.key ? null : v)}
              className={cn(
                'text-left rounded-2xl border p-4 transition-colors',
                isActive
                  ? 'border-[var(--accent-primary)]/50 bg-[var(--accent-primary)]/8'
                  : embedded
                    ? 'border-[var(--done-accent-line)] bg-[var(--done-accent-soft)]'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-surface)]/50 hover:border-[var(--border-default)]',
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[17px] font-serif text-[var(--text-primary)]">{v.name}</div>
                  <div className="text-[11px] text-[var(--text-muted)] mt-0.5">Week {v.week}</div>
                </div>
                <Ring done={done} />
              </div>
              <div className="text-[11.5px] mt-3">
                {isActive
                  ? <span className="text-[var(--accent-primary)]">● This week</span>
                  : embedded
                    ? <span className="text-[var(--done-accent)]">✓ Embedded</span>
                    : <span className="text-[var(--text-muted)]">{done} of 7 days</span>}
              </div>
            </button>
          );
        })}
      </div>

      {open && (
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]/50 p-5 sm:p-6 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-serif font-light text-[var(--text-primary)]">{open.name}</h2>
              <p className="text-[13.5px] text-[var(--text-secondary)] italic mt-2 border-l-2 border-[var(--border-default)] pl-3 max-w-xl leading-relaxed">
                {open.desc}
              </p>
            </div>
            <button onClick={() => setOpen(null)} className="text-[12px] text-[var(--text-muted)] hover:text-[var(--text-primary)]">
              close
            </button>
          </div>

          <div>
            <h3 className="text-[9px] font-bold uppercase tracking-[0.28em] text-[var(--text-muted)] mb-2">
              The seven daily prayers
            </h3>
            <div className="space-y-1.5">
              {open.prayers.map((p, i) => (
                <p
                  key={i}
                  className={cn(
                    'rounded-xl border px-3.5 py-2.5 font-serif italic text-[14px] leading-relaxed',
                    open.key === active.key && i === dayOfVirtueWeek()
                      ? 'border-[var(--accent-primary)]/45 bg-[var(--accent-primary)]/10 text-[var(--text-primary)]'
                      : 'border-[var(--border-subtle)] bg-[var(--bg-surface)]/60 text-[var(--text-secondary)]',
                  )}
                >
                  {p}
                </p>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[9px] font-bold uppercase tracking-[0.28em] text-[var(--text-muted)] mb-2">
              Seven ways to practise {open.name}
            </h3>
            <div className="space-y-2">
              {open.ideas.map((idea) => (
                <div key={idea.place} className="flex gap-3 items-start rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]/60 p-3">
                  <span className="text-[17px] leading-none mt-0.5">{idea.icon}</span>
                  <div>
                    <div className="text-[13.5px] font-semibold text-[var(--text-primary)]">{idea.place}</div>
                    <div className="text-[12.5px] text-[var(--text-secondary)] mt-0.5 leading-relaxed">{idea.how}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
