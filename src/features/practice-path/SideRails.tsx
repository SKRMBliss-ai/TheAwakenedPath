import { useCallback, useRef, useState } from 'react';
import { cn } from '../../lib/utils';
import styles from './Triptych.module.css';
import { VIRTUES } from './virtues';
import { SIXFOLD, sixfoldOfWeek } from './sixfold';
import { virtueOfWeek, isoWeek } from './dailyRhythm';

/**
 * The two frameworks as the rails flanking the Today column.
 *
 * Placement follows Inner Journey exactly: they are grid cells inside the
 * triptych rather than viewport-pinned dot columns, so they scroll with the
 * page, collapse with a <details>, and stack BELOW the centre on narrow
 * screens. Everything reachable here is also reachable from the pillars and
 * the Path tab — a rail that disappears on a phone must never be the only
 * route to anything.
 */

interface TipState {
  title: string;
  def: string;
  extraLabel?: string;
  extra?: string;
  top: number;
  left: number;
}

/** Shared hover/focus tooltip behaviour for both rails. */
function useRailTip(side: 'left' | 'right') {
  const [tip, setTip] = useState<TipState | null>(null);
  const railRef = useRef<HTMLElement>(null);

  const show = useCallback(
    (el: HTMLElement, data: Omit<TipState, 'top' | 'left'>) => {
      const r = el.getBoundingClientRect();
      // Clamped so a lamp near the bottom of a nine-item rail does not push
      // its own tooltip off the fold.
      const top = Math.min(Math.max(r.top - 8, 12), window.innerHeight - 190);
      const left = side === 'left'
        ? Math.min(r.right + 12, window.innerWidth - 290)
        : Math.max(r.left - 282, 12);
      setTip({ ...data, top, left });
    },
    [side],
  );

  const hide = useCallback(() => setTip(null), []);

  const node = (
    <div
      className={cn(styles.railtip, tip && styles.on, side === 'left' && styles.six)}
      role="tooltip"
      aria-hidden={!tip}
      style={tip ? { top: tip.top, left: tip.left } : { top: -9999, left: -9999 }}
    >
      {tip && (
        <>
          <div className={styles.rtTitle}>{tip.title}</div>
          <div className={styles.rtDef}>{tip.def}</div>
          {tip.extra && (
            <div className={styles.rtExtra}>
              {tip.extraLabel && <b>{tip.extraLabel}</b>}
              {tip.extra}
            </div>
          )}
        </>
      )}
    </div>
  );

  return { railRef, show, hide, node };
}

/* ── ◀ LEFT RAIL — the Sixfold Path ─────────────────────────────────── */

export function SixfoldRail({ onOpen }: { onOpen: (key: string) => void }) {
  const active = sixfoldOfWeek(isoWeek());
  const { show, hide, node } = useRailTip('left');

  return (
    <aside className={cn(styles.siderail, styles.railSix)} aria-label="The Sixfold Path">
      <details className={styles.railFold} open>
        <summary><span className={styles.srCap}>Sixfold Path</span></summary>
        <div className={styles.srItems}>
          {SIXFOLD.map((s) => {
            const lit = s.key === active.key;
            return (
              <button
                key={s.key}
                className={cn(styles.srItem, lit && styles.lit)}
                onClick={() => onOpen(s.key)}
                onMouseEnter={(e) => show(e.currentTarget, {
                  title: s.name, def: s.essence, extraLabel: 'Try this', extra: s.invite,
                })}
                onFocus={(e) => show(e.currentTarget, {
                  title: s.name, def: s.essence, extraLabel: 'Try this', extra: s.invite,
                })}
                onMouseLeave={hide}
                onBlur={hide}
              >
                <span className={styles.srLamp} />
                <span className={styles.srNum}>0{s.num}</span>
                <span className={styles.srName}>
                  {s.name}
                  {lit && <span className={styles.srNow}>In focus</span>}
                </span>
              </button>
            );
          })}
        </div>
        <div className={styles.srNote}>The wider framework. Not something to complete.</div>
      </details>
      {node}
    </aside>
  );
}

/* ── ▶ RIGHT RAIL — the nine virtues ────────────────────────────────── */

interface VirtuesRailProps {
  /** virtueKey → days practised, for the "embedded" lamp. */
  virtueProgress: Record<string, number>;
  onOpen: (key: string) => void;
}

export function VirtuesRail({ virtueProgress, onOpen }: VirtuesRailProps) {
  const active = virtueOfWeek();
  const { show, hide, node } = useRailTip('right');

  return (
    <aside className={cn(styles.siderail, styles.railVirtue)} aria-label="The nine virtues">
      <details className={styles.railFold} open>
        <summary><span className={styles.srCap}>The nine virtues</span></summary>
        <div className={styles.srItems}>
          {VIRTUES.map((v) => {
            const days = virtueProgress[v.key] ?? 0;
            const lit = v.key === active.key;
            const embedded = !lit && days >= 7;
            const idea = v.ideas[0];
            return (
              <button
                key={v.key}
                className={cn(styles.srItem, lit && styles.lit, embedded && styles.embedded)}
                onClick={() => onOpen(v.key)}
                onMouseEnter={(e) => show(e.currentTarget, {
                  title: v.name,
                  def: v.desc,
                  extraLabel: idea ? idea.place : undefined,
                  extra: idea ? `${idea.icon} ${idea.how}` : undefined,
                })}
                onFocus={(e) => show(e.currentTarget, {
                  title: v.name,
                  def: v.desc,
                  extraLabel: idea ? idea.place : undefined,
                  extra: idea ? `${idea.icon} ${idea.how}` : undefined,
                })}
                onMouseLeave={hide}
                onBlur={hide}
              >
                <span className={styles.srLamp} />
                <span className={styles.srNum}>{v.week}</span>
                <span className={styles.srName}>
                  {v.name}{embedded ? ' ✓' : ''}
                  {lit && <span className={styles.srNow}>This week</span>}
                </span>
              </button>
            );
          })}
        </div>
        <div className={styles.srNote}>Qualities to cultivate, one each week.</div>
      </details>
      {node}
    </aside>
  );
}
