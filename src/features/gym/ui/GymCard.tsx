import type { ReactNode } from 'react';
import { cn } from '../../../lib/utils';

/**
 * The gym's card — the dominant unit in every mockup.
 *
 * Three things define it and are why this exists rather than another ad-hoc
 * `rounded-3xl border` (card styling is currently re-rolled in DashboardGrid,
 * DailyRibbon, SituationalPractices and features/kids independently):
 *   1. a ground that is a TINT OF THE CARD'S OWN COLOUR, not neutral grey
 *   2. a 1px hairline border in that same tint
 *   3. a soft lift shadow, not a glow
 *
 * `padding="roomy"` steps up at `sm:` so an iPad doesn't render phone-sized
 * padding inside a much larger card.
 */
export function GymCard({
  tone = 'plain',
  padding = 'roomy',
  radius = 'card',
  className,
  children,
}: {
  tone?: 'plain' | 'accent' | 'accent2';
  padding?: 'roomy' | 'tight' | 'none';
  radius?: 'card' | 'panel';
  className?: string;
  children: ReactNode;
}) {
  const ground =
    tone === 'accent'
      ? 'var(--gym-accent-surface)'
      : tone === 'accent2'
        ? 'var(--gym-accent-2-surface)'
        : 'var(--gym-surface)';
  const line =
    tone === 'accent'
      ? 'var(--gym-accent-border)'
      : tone === 'accent2'
        ? 'var(--gym-accent-2-border)'
        : 'var(--gym-line)';

  return (
    <div
      className={cn(
        padding === 'roomy' && 'p-5 sm:p-6',
        padding === 'tight' && 'p-4 sm:p-5',
        className,
      )}
      style={{
        background: ground,
        border: `1px solid ${line}`,
        borderRadius: radius === 'panel' ? 'var(--gym-radius-panel)' : 'var(--gym-radius-card)',
        boxShadow: 'var(--gym-shadow-soft)',
      }}
    >
      {children}
    </div>
  );
}
