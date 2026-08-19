import { useMemo } from 'react';
import { useAuth } from '../auth/AuthContext';
import { YearView } from './YearView';
import { usePracticeHistory } from './usePracticeDay';
import { usePracticeLibrary, useAssignments } from './usePracticeOfWeek';
import { practiceWeekNumber } from './practiceOfWeek';

/**
 * Wires the year grid to real data. Kept separate from YearView so that
 * component stays pure and easy to look at in isolation.
 */
export function YearPanel() {
  const { user } = useAuth();
  const history = usePracticeHistory(user?.uid, 400);
  const { practices } = usePracticeLibrary();
  const { assignments } = useAssignments();

  // Bucket each day record into its practice week.
  const { practisedByWeek, engagedByWeek } = useMemo(() => {
    const practised: Record<number, number> = {};
    const engaged: Record<number, number> = {};
    history.forEach((h) => {
      const w = practiceWeekNumber(h.date);
      if (w < 1) return;
      if (h.practicePractised) practised[w] = (practised[w] ?? 0) + 1;
      if (h.practiceEngaged || h.practicePractised) engaged[w] = (engaged[w] ?? 0) + 1;
    });
    return { practisedByWeek: practised, engagedByWeek: engaged };
  }, [history]);

  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]/50 p-5">
      <h2 className="text-[9px] font-bold uppercase tracking-[0.28em] text-[var(--text-muted)]">
        The year
      </h2>
      <p className="text-[12.5px] text-[var(--text-secondary)] mt-1 mb-4 max-w-xl leading-relaxed">
        Fifty-two weeks of inner work. Each square is a week, coloured by the practice that held
        it and deeper where you practised more.
      </p>
      <YearView
        assignments={assignments}
        practices={practices}
        practisedByWeek={practisedByWeek}
        engagedByWeek={engagedByWeek}
      />
    </div>
  );
}
