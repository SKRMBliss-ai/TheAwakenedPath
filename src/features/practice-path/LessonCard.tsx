import { useMemo, useState } from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import styles from './Triptych.module.css';
import { CURRICULUM, curriculumStanding } from './curriculum';

interface LessonCardProps {
  completed: Set<string>;
  onOpenLesson: (tab: string, questionId?: string) => void;
  onToggleLesson?: (lessonId: string, done: boolean) => void;
}

/**
 * "Today's lesson" — the second centre card, in Inner Journey's position
 * between this week's pillars and the meditation.
 *
 * Which lesson is "today's" is DERIVED: the first unwatched lesson of the
 * first incomplete stage. Storing a pointer would drift out of step with the
 * three courses that each keep their own completion records, and then the
 * card would point at a lesson already watched.
 */
export function LessonCard({ completed, onOpenLesson, onToggleLesson }: LessonCardProps) {
  const [journeyOpen, setJourneyOpen] = useState(false);
  const { activeKey, allComplete } = curriculumStanding(completed);

  const next = useMemo(() => {
    const stage = CURRICULUM.find((s) => s.key === activeKey) ?? CURRICULUM[0];
    const lesson = stage.lessons.find((l) => !completed.has(l.id)) ?? stage.lessons[stage.lessons.length - 1];
    return lesson ? { stage, lesson } : null;
  }, [activeKey, completed]);

  if (!next) return null;

  const done = completed.has(next.lesson.id);

  return (
    <section className={styles.card}>
      <div className={styles.cap}>🎥 Today's lesson</div>
      <div className={styles.clStage}>{next.stage.title}</div>
      <div className={styles.clTitle}>{next.lesson.title}</div>
      <div className={styles.clSub}>
        {allComplete ? 'Every lesson watched — revisit any of them.' : 'Continue your journey'}
      </div>

      <div className={styles.clAct}>
        {/* School lessons live in the Skool classroom, so they open there. */}
        {next.lesson.href ? (
          <a className={styles.btn} href={next.lesson.href} target="_blank" rel="noopener noreferrer">
            Watch lesson ↗
          </a>
        ) : (
          <button
            className={styles.btn}
            onClick={() => onOpenLesson(next.lesson.tab, next.lesson.questionId)}
          >
            Watch lesson ↗
          </button>
        )}
        <button
          className={styles.ghostlink}
          onClick={() => setJourneyOpen((o) => !o)}
          aria-expanded={journeyOpen}
        >
          {journeyOpen ? 'Close ←' : 'Journey →'}
        </button>
      </div>

      {journeyOpen && (
        <div className="mt-4 pt-3.5 border-t border-[var(--border-subtle)] max-h-[340px] overflow-y-auto">
          {CURRICULUM.map((stage) => (
            <div key={stage.key} className="mb-3 last:mb-0">
              <div className={styles.clStage}>{stage.title}</div>
              {stage.lessons.map((l) => {
                const isDone = completed.has(l.id);
                const isCurrent = l.id === next.lesson.id;
                return (
                  <button
                    key={l.id}
                    onClick={() => (l.href
                      ? window.open(l.href, '_blank', 'noopener,noreferrer')
                      : onOpenLesson(l.tab, l.questionId))}
                    className={cn(
                      'w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-[12.5px] leading-snug transition-colors',
                      isCurrent
                        ? 'bg-[var(--practice-accent-soft)] text-[var(--text-primary)]'
                        : isDone
                          ? 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)]'
                          : 'text-[var(--text-muted)] hover:bg-[var(--bg-surface-hover)]',
                    )}
                  >
                    <span className={cn('w-3.5 flex-shrink-0 text-[11px]',
                      isDone ? 'text-[var(--done-accent)]' : 'text-[var(--practice-accent)]')}>
                      {isDone ? '✓' : isCurrent ? '›' : '·'}
                    </span>
                    {l.title}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {onToggleLesson && (
        <button
          onClick={() => onToggleLesson(next.lesson.id, !done)}
          className={cn(
            styles.inlineCheck,
            'flex items-center gap-2.5 w-full rounded-xl border px-3 py-2.5 text-[13.5px] transition-colors',
            done
              ? 'border-[var(--done-accent-line)] bg-[var(--done-accent-soft)] text-[var(--done-accent)]'
              : 'border-[var(--border-subtle)] bg-[var(--bg-input)] text-[var(--text-primary)]',
          )}
        >
          <span className={cn('w-4 h-4 rounded grid place-items-center border flex-shrink-0',
            done ? 'bg-[var(--done-accent)] border-[var(--done-accent)]' : 'border-[var(--text-muted)]')}>
            {done && <Check size={11} className="text-[var(--on-accent)]" strokeWidth={3} />}
          </span>
          I studied this lesson
        </button>
      )}
    </section>
  );
}
