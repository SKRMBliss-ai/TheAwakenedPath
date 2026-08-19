import { virtueOfWeek, isoWeek } from './dailyRhythm';
import { sixfoldOfWeek } from './sixfold';

interface WeeklyLetterProps {
  weekNumber: number;
  practiceTitle?: string;
  sits: number;
  practisedDays: number;
  virtueDays: number;
  carriedIn?: string | null;
  longestReflection?: string | null;
}

/**
 * A short letter, not a dashboard.
 *
 * Written in prose because a row of numbers invites comparison and scoring,
 * and this is meant to be read once and let go. It closes by saying explicitly
 * that nothing here is a grade — otherwise a low week reads as failure, and
 * the people most likely to have a low week are the ones least helped by that.
 */
export function WeeklyLetter(p: WeeklyLetterProps) {
  const virtue = virtueOfWeek();
  const flow = sixfoldOfWeek(isoWeek());

  return (
    <div
      className="rounded-2xl border border-[var(--accent-primary)]/35 p-5"
      style={{ background: 'linear-gradient(160deg, var(--practice-accent-soft), transparent 65%)' }}
    >
      <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--accent-primary)] mb-2.5">
        Your week
      </div>
      <div className="font-serif text-[15.5px] text-[var(--text-primary)] leading-[1.8] space-y-3">
        <p>
          Week {p.weekNumber} is closing. You sat {p.sits} time{p.sits === 1 ? '' : 's'}
          {p.practisedDays > 0 && p.practiceTitle ? (
            <> and marked <em className="text-[var(--text-secondary)]">{p.practiceTitle}</em> practised
              on {p.practisedDays} day{p.practisedDays === 1 ? '' : 's'}.</>
          ) : '.'}
        </p>

        {p.carriedIn && (
          <p>You began the week carrying: <em className="text-[var(--text-secondary)]">“{p.carriedIn}”</em></p>
        )}

        {p.longestReflection && (
          <p>The thing you noticed most fully: <em className="text-[var(--text-secondary)]">“{p.longestReflection}”</em></p>
        )}

        <p>
          {virtue.name} stands at {Math.min(p.virtueDays, 7)} of 7 days
          {p.virtueDays >= 7 ? ' — embedded.' : '.'}{' '}
          The Sixfold Path held <em className="text-[var(--text-secondary)]">{flow.name}</em> this week.
        </p>
      </div>
      <p className="text-[12.5px] text-[var(--text-muted)] mt-3">
        Nothing here is a score. It is simply what happened.
      </p>
    </div>
  );
}
