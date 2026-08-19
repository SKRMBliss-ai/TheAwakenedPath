import { useEffect, useId, useState, type ReactNode } from 'react';
import styles from './FlipCard.module.css';
import { cn } from '../../lib/utils';

interface FlipCardProps {
  front: (flip: () => void) => ReactNode;
  back: (flip: () => void) => ReactNode;
  /** Background gradient for both faces. */
  faceStyle?: React.CSSProperties;
  className?: string;
}

/**
 * Two-sided card: essentials on the front, depth one interaction away.
 *
 * Flipping is driven by a real button on each face, never by hover — on a
 * touch device hover does not exist, so anything hidden behind it would be
 * unreachable. Escape closes, and the hidden face is marked aria-hidden so a
 * screen reader is never offered both sides at once.
 */
export function FlipCard({ front, back, faceStyle, className }: FlipCardProps) {
  const [flipped, setFlipped] = useState(false);
  const id = useId();

  useEffect(() => {
    if (!flipped) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setFlipped(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [flipped]);

  const flip = () => setFlipped((f) => !f);

  return (
    <div className={cn(styles.wrap, className)}>
      <div className={cn(styles.flipper, flipped && styles.flipped)}>
        <div
          className={cn(styles.face, styles.front)}
          style={faceStyle}
          aria-hidden={flipped}
          id={`${id}-front`}
        >
          {front(flip)}
        </div>
        <div
          className={cn(styles.face, styles.back)}
          style={faceStyle}
          aria-hidden={!flipped}
          id={`${id}-back`}
        >
          {back(flip)}
        </div>
      </div>
    </div>
  );
}

/** Shared scroll container for the dense back face. */
export function FlipBackScroll({ children }: { children: ReactNode }) {
  return <div className={styles.backScroll}>{children}</div>;
}
