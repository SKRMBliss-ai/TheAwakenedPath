import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../../lib/utils';

type Tone = 'accent' | 'accent2';
type Variant = 'solid' | 'outline';

/**
 * The gym's button. Solid filled pill (primary) or outlined pill (secondary),
 * exactly as the mockups use them — never two solid buttons competing on one
 * screen.
 *
 * Deliberately NOT a fork of `components/ui/SacredUI.tsx#AnchorButton`: that one
 * is `any`-typed and carries the app's glow treatment. This is typed, flat-calm,
 * and scoped to the gym. If the two converge later, AnchorButton is the one to
 * grow a variant — not this one to spread.
 *
 * Responsive: height comes from `--gym-control-lg/md` (52/44px), both clearing
 * the 44px touch minimum on every device; the label scales one step up from
 * `sm:` so it doesn't look undersized on an iPad.
 */
export function GymButton({
  tone = 'accent',
  variant = 'solid',
  size = 'lg',
  fullWidth = true,
  trailing,
  className,
  children,
  ...rest
}: {
  tone?: Tone;
  variant?: Variant;
  size?: 'lg' | 'md';
  fullWidth?: boolean;
  trailing?: ReactNode;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const fill = tone === 'accent' ? 'var(--gym-accent)' : 'var(--gym-accent-2)';
  const border = tone === 'accent' ? 'var(--gym-accent-border)' : 'var(--gym-accent-2-border)';

  return (
    <button
      {...rest}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-[var(--gym-radius-pill)]',
        'font-semibold leading-none transition-[transform,background-color,box-shadow] duration-150',
        'active:scale-[0.985] focus-visible:outline-2 focus-visible:outline-offset-2',
        'text-[15px] sm:text-[16px]',
        fullWidth ? 'w-full' : 'px-6 sm:px-7',
        className,
      )}
      style={{
        minHeight: size === 'lg' ? 'var(--gym-control-lg)' : 'var(--gym-control-md)',
        background: variant === 'solid' ? fill : 'transparent',
        color: variant === 'solid' ? 'var(--gym-ink-on-accent)' : fill,
        border: `1px solid ${variant === 'solid' ? 'transparent' : border}`,
        boxShadow: variant === 'solid' ? 'var(--gym-shadow-soft)' : 'none',
        outlineColor: fill,
        fontFamily: 'var(--gym-font-ui)',
      }}
    >
      {children}
      {trailing}
    </button>
  );
}
