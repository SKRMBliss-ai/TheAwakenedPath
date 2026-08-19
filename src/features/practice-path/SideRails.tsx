import { cn } from '../../lib/utils';
import styles from './SideRails.module.css';
import { VIRTUES } from './virtues';
import { SIXFOLD, sixfoldOfWeek } from './sixfold';
import { virtueOfWeek, isoWeek } from './dailyRhythm';

interface SideRailsProps {
  /** virtueKey → days practised, for the "embedded" marker. */
  virtueProgress: Record<string, number>;
  onOpenVirtue: (key: string) => void;
  onOpenSixfold: (key: string) => void;
}

/**
 * The two frameworks as fixed rails flanking the content.
 *
 * Purely a shortcut layer — everything reachable here is also reachable from
 * the pillars and the Path tab, because a rail that hides on narrow screens
 * must never be the only route to anything.
 */
export function SideRails({ virtueProgress, onOpenVirtue, onOpenSixfold }: SideRailsProps) {
  const activeVirtue = virtueOfWeek();
  const activeFlow = sixfoldOfWeek(isoWeek());

  return (
    <>
      <aside className={cn(styles.rail, styles.left)} aria-label="The nine virtues">
        <span className={styles.cap}>The nine virtues</span>
        {VIRTUES.map((v) => {
          const days = virtueProgress[v.key] ?? 0;
          const isNow = v.key === activeVirtue.key;
          return (
            <button
              key={v.key}
              className={cn(styles.node, isNow && styles.now, !isNow && days >= 7 && styles.done)}
              onClick={() => onOpenVirtue(v.key)}
              aria-label={`${v.name}${isNow ? ' — this week' : ''}${days >= 7 ? ' — embedded' : ''}`}
            >
              <span className={styles.dot} />
              <span className={styles.label}>{v.name}{days >= 7 ? ' ✓' : ''}</span>
            </button>
          );
        })}
      </aside>

      <aside className={cn(styles.rail, styles.right)} aria-label="The Sixfold Path">
        <span className={styles.cap}>The Sixfold Path</span>
        {SIXFOLD.map((s) => {
          const isNow = s.key === activeFlow.key;
          return (
            <button
              key={s.key}
              className={cn(styles.node, isNow && styles.now)}
              onClick={() => onOpenSixfold(s.key)}
              aria-label={`${s.name}${isNow ? ' — in focus this week' : ''}`}
            >
              <span className={styles.dot} />
              <span className={styles.label}>{s.glyph} {s.name}</span>
            </button>
          );
        })}
      </aside>
    </>
  );
}
