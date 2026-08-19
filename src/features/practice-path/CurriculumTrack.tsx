import { useState } from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import { CURRICULUM, curriculumStanding, stageBadge } from './curriculum';

interface CurriculumTrackProps {
  /** Ids of lessons recorded as complete. */
  completed: Set<string>;
  onToggleLesson?: (lessonId: string, done: boolean) => void;
  onOpenLesson?: (tab: string, questionId?: string) => void;
}

/**
 * The persistent curriculum track: three segments, one per course, with a
 * lesson drawer beneath.
 *
 * Stage is derived from the completed set every render rather than stored, so
 * the badge and the bars can never disagree with the underlying records.
 */
export function CurriculumTrack({ completed, onToggleLesson, onOpenLesson }: CurriculumTrackProps) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const { stages, activeKey, allComplete } = curriculumStanding(completed);

  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]/50 p-4">
      <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
        <span className="text-[9px] font-bold uppercase tracking-[0.28em] text-[var(--text-muted)]">
          Your path
        </span>
        <span className="text-[11px] font-semibold text-[var(--accent-primary)]">
          {stageBadge(activeKey, allComplete)}
        </span>
      </div>

      <div className="flex items-stretch">
        {stages.map((s, i) => {
          const pct = s.total ? Math.round((s.done / s.total) * 100) : 0;
          return (
            <button
              key={s.stage.key}
              onClick={() => setOpenKey(openKey === s.stage.key ? null : s.stage.key)}
              className={cn(
                'flex-1 text-left px-2.5 py-2 rounded-xl transition-colors relative',
                i > 0 && 'border-l border-[var(--border-subtle)]',
                s.active && 'bg-[var(--accent-primary)]/10',
                s.complete && 'bg-[var(--done-accent-soft)]',
              )}
            >
              <div className={cn(
                'text-[10.5px] uppercase tracking-wider mb-1.5 truncate',
                s.complete ? 'text-[var(--done-accent)]' : s.active ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)]',
              )}>
                {s.complete && '✓ '}{s.stage.label}
              </div>
              <div className="h-1.5 rounded-full bg-[var(--border-subtle)] overflow-hidden">
                <span
                  className="block h-full rounded-full transition-[width] duration-500"
                  style={{
                    width: `${pct}%`,
                    background: s.complete
                      ? 'linear-gradient(90deg,var(--done-accent),var(--done-accent))'
                      : 'linear-gradient(90deg,var(--accent-primary),var(--virtue-accent))',
                  }}
                />
              </div>
              <div className={cn(
                'text-[11px] mt-1',
                s.complete ? 'text-[var(--done-accent)]' : s.active ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)]',
              )}>
                {s.done}/{s.total}
              </div>
            </button>
          );
        })}
      </div>

      {/* Lesson drawer */}
      {openKey && (() => {
        const stage = CURRICULUM.find((s) => s.key === openKey);
        if (!stage) return null;
        return (
          <div className="mt-3 pt-3 border-t border-[var(--border-subtle)]">
            <div className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] mb-2">
              {stage.title}
            </div>
            <div className="grid gap-1.5 sm:grid-cols-2">
              {stage.lessons.map((l) => {
                const done = completed.has(l.id);
                return (
                  <div
                    key={l.id}
                    className={cn(
                      'flex items-start gap-2 rounded-xl border px-2.5 py-2 text-[12.5px] leading-snug',
                      done
                        ? 'border-[var(--done-accent-line)] bg-[var(--done-accent-soft)] text-[var(--text-primary)]'
                        : 'border-[var(--border-subtle)] bg-[var(--bg-surface)]/60 text-[var(--text-secondary)]',
                    )}
                  >
                    <button
                      onClick={() => onToggleLesson?.(l.id, !done)}
                      aria-label={done ? `Mark ${l.title} not done` : `Mark ${l.title} done`}
                      className={cn(
                        'w-4 h-4 mt-0.5 rounded grid place-items-center border flex-shrink-0',
                        done ? 'bg-[var(--done-accent)] border-[var(--done-accent)]' : 'border-[var(--text-muted)]',
                      )}
                    >
                      {done && <Check size={10} className="text-[var(--on-accent)]" strokeWidth={3} />}
                    </button>
                    <button
                      onClick={() => onOpenLesson?.(l.tab, l.questionId)}
                      className="text-left flex-1 hover:text-[var(--text-primary)]"
                    >
                      {l.title}
                    </button>
                  </div>
                );
              })}
            </div>
            <button
              onClick={() => setOpenKey(null)}
              className="mt-3 text-[12px] text-[var(--text-muted)] hover:text-[var(--accent-primary)]"
            >
              ▲ close
            </button>
          </div>
        );
      })()}
    </div>
  );
}
