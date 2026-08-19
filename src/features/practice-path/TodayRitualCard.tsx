import { useMemo } from 'react';
import { ChevronRight, Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import { virtueOfWeek, prayerOfDay, todayKey } from './dailyRhythm';
import { usePracticeDay, usePracticeHistory, computeStreak, useVirtueWeekProgress } from './usePracticeDay';

interface TodayRitualCardProps {
  userId: string | null | undefined;
  onOpen: () => void;
}

/**
 * Compact form of the Practice → Today ritual, for the Dashboard.
 *
 * Shows state, not content: the streak, this week's virtue with its ring, and
 * which of the three anchor steps are done. The full sequence — invocation,
 * teaching, practice ideas, sit log — stays on the Practice tab, so this is a
 * summary and a way in rather than a second place to do the practice.
 */
export function TodayRitualCard({ userId, onOpen }: TodayRitualCardProps) {
  const date = todayKey();
  const { day } = usePracticeDay(userId, date);
  const history = usePracticeHistory(userId);
  const streak = useMemo(() => computeStreak(history), [history]);
  const { done: virtueDays } = useVirtueWeekProgress(history);
  const virtue = virtueOfWeek();

  const virtueDoneToday = !!day?.virtuePractised && day?.virtueKey === virtue.key;
  const virtueCount = Math.min(
    virtueDays + (virtueDoneToday && !history.some((h) => h.date === date && h.virtuePractised) ? 1 : 0),
    7,
  );

  const steps = [
    { label: 'Invocation', done: !!day?.invocationRead },
    { label: virtue.name, done: virtueDoneToday },
    { label: 'Sat', done: !!day?.sat },
  ];
  const doneCount = steps.filter((s) => s.done).length;

  return (
    <button
      onClick={onOpen}
      className="w-full text-left rounded-2xl border p-4 sm:p-5 transition-colors group"
      style={{
        borderColor: 'var(--border-subtle)',
        background: 'linear-gradient(145deg, var(--practice-accent-soft), rgba(217,138,166,.04))',
      }}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="font-sans text-[10px] font-bold tracking-[0.28em] uppercase" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>
          Today's practice
        </span>
        <span className="flex items-center gap-1.5 text-[11px] font-bold" style={{ color: 'var(--text-muted)' }}>
          {doneCount}<span className="opacity-40">/3</span>
          <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Virtue ring */}
        <div className="relative w-12 h-12 flex-shrink-0 grid place-items-center">
          <svg viewBox="0 0 44 44" className="absolute inset-0 w-12 h-12 -rotate-90">
            <circle cx="22" cy="22" r="18" fill="none" strokeWidth="4" className="stroke-[var(--border-subtle)]" />
            <circle
              cx="22" cy="22" r="18" fill="none" strokeWidth="4" strokeLinecap="round"
              stroke={virtueCount >= 7 ? 'var(--done-accent)' : 'var(--accent-primary)'}
              strokeDasharray={113}
              strokeDashoffset={113 - (virtueCount / 7) * 113}
            />
          </svg>
          <span className="text-[10px] font-bold" style={{ color: 'var(--accent-primary)' }}>{virtueCount}/7</span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-[16px] font-serif text-[var(--text-primary)] leading-tight">{virtue.name}</div>
          <p className="text-[12px] text-[var(--text-secondary)] italic mt-1 line-clamp-2 leading-snug">
            {prayerOfDay(virtue)}
          </p>
        </div>

        {streak > 0 && (
          <div className="text-right flex-shrink-0 hidden sm:block">
            <div className="text-[20px] font-serif font-semibold leading-none" style={{ color: 'var(--accent-primary)' }}>
              {streak}
            </div>
            <div className="text-[10px] text-[var(--text-muted)] mt-1">day streak</div>
          </div>
        )}
      </div>

      {/* Three anchor steps */}
      <div className="flex items-center gap-2 mt-3.5 flex-wrap">
        {steps.map((s) => (
          <span
            key={s.label}
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] border',
              s.done
                ? 'border-[var(--done-accent-line)] bg-[var(--done-accent-soft)] text-[var(--done-accent)]'
                : 'border-[var(--border-subtle)] text-[var(--text-muted)]',
            )}
          >
            <span className={cn(
              'w-3 h-3 rounded-full grid place-items-center border',
              s.done ? 'bg-[var(--done-accent)] border-[var(--done-accent)]' : 'border-[var(--text-muted)]',
            )}>
              {s.done && <Check size={8} className="text-[var(--on-accent)]" strokeWidth={3.5} />}
            </span>
            {s.label}
          </span>
        ))}
      </div>
    </button>
  );
}
