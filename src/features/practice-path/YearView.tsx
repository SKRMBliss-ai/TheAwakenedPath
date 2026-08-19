import { cn } from '../../lib/utils';
import { practiceWeekNumber, type PracticeAssignment, type Practice } from './practiceOfWeek';

/**
 * Categorical palette for the year grid — the one place a fixed set of hues is
 * right, because many practices must be tellable apart at 12px and three
 * semantic tokens cannot do that. The first three ARE the theme tokens so the
 * common cases match the rest of the app; the extras are mid-tones chosen to
 * hold contrast on both cream and near-black.
 */
const PALETTE = [
  'var(--practice-accent)', 'var(--virtue-accent)', 'var(--done-accent)',
  '#9A7BA6', '#B0705F', '#5E86A3', '#8A8557',
];

interface YearViewProps {
  assignments: PracticeAssignment[];
  practices: Practice[];
  /** weekNumber → how many days were practised that week. */
  practisedByWeek: Record<number, number>;
  /** weekNumber → how many days were engaged (viewed) that week. */
  engagedByWeek: Record<number, number>;
}

/**
 * Fifty-two weeks at a glance — colour by which practice held the week,
 * opacity by how deeply it was engaged.
 *
 * Kept separate from curriculum progress on purpose: this is a record of what
 * happened, not a measure of how far along someone is. Future weeks are drawn
 * faintly rather than left blank so the year reads as a whole shape.
 */
export function YearView({ assignments, practices, practisedByWeek, engagedByWeek }: YearViewProps) {
  const thisWeek = practiceWeekNumber();
  const indexOf = (pid: string) => practices.findIndex((p) => p.practiceId === pid);

  const cells = Array.from({ length: 52 }, (_, i) => {
    const w = i + 1;
    const asg = assignments.find((a) => a.weekNumber === w);
    const practice = asg ? practices.find((p) => p.practiceId === asg.practiceId) : null;
    const practised = practisedByWeek[w] ?? 0;
    const engaged = engagedByWeek[w] ?? 0;

    let style: React.CSSProperties = {};
    let title = `Week ${w} — nothing recorded`;

    if (w > thisWeek) {
      style = { background: 'rgba(255,255,255,.03)' };
      title = `Week ${w} — ahead`;
    } else if (practice) {
      const colour = PALETTE[Math.max(0, indexOf(practice.practiceId)) % PALETTE.length];
      const depth = practised >= 5 ? 1 : practised >= 3 ? 0.72 : engaged > 0 ? 0.42 : 0.18;
      style = { background: colour, opacity: depth };
      title = `Week ${w} — ${practice.title} · ${practised}/7 practised`;
    } else {
      style = { background: 'rgba(255,255,255,.06)' };
    }

    return { w, style, title, isNow: w === thisWeek };
  });

  const used = practices.filter((p) => assignments.some((a) => a.practiceId === p.practiceId));

  return (
    <div className="space-y-3">
      <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(26, minmax(0, 1fr))' }}>
        {cells.map((c) => (
          <span
            key={c.w}
            title={c.title}
            style={c.style}
            className={cn(
              'aspect-square rounded-[3px] transition-transform hover:scale-[1.35] hover:z-10 relative',
              c.isNow && 'ring-2 ring-[var(--accent-primary)]',
            )}
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-3 text-[12px] text-[var(--text-secondary)]">
        {used.length ? used.map((p) => (
          <span key={p.practiceId} className="inline-flex items-center gap-1.5">
            <i
              className="w-2.5 h-2.5 rounded-[2px] inline-block"
              style={{ background: PALETTE[Math.max(0, indexOf(p.practiceId)) % PALETTE.length] }}
            />
            {p.title}
          </span>
        )) : (
          <span className="text-[var(--text-muted)]">Weeks fill in as you practise.</span>
        )}
      </div>
    </div>
  );
}
