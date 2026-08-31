import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * Shared Practise UI primitives. Practise paints its own calm, light palette via
 * scoped CSS variables (like the Kids gym) so it reads as an intentional,
 * unhurried "place" regardless of the app's dark shell.
 */

export type Variant = 'adult' | 'kids';

/** Palette per gym. Adult = warm, calm, private. Kids = bright, safe, playful. */
const THEME: Record<Variant, Record<string, string>> = {
  adult: {
    '--p-bg': '#F7F4EF',
    '--p-bg2': '#EFEAE1',
    '--p-surface': '#FFFFFF',
    '--p-ink': '#26302B',
    '--p-muted': '#6B7A72',
    '--p-accent': '#1F7A5A',
    '--p-accent-soft': '#E2F0EA',
    '--p-line': '#E4DED3',
  },
  kids: {
    '--p-bg': '#FFF7EE',
    '--p-bg2': '#FDEFE0',
    '--p-surface': '#FFFFFF',
    '--p-ink': '#3A2E4A',
    '--p-muted': '#8A7C97',
    '--p-accent': '#7C4DFF',
    '--p-accent-soft': '#EFE7FF',
    '--p-line': '#F0E6DC',
  },
};

/** Full-bleed themed container for a Practise screen. */
export function PractiseShell({
  variant,
  children,
  className,
}: {
  variant: Variant;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      style={THEME[variant] as React.CSSProperties}
      className={cn('min-h-full w-full', className)}
    >
      <div
        className="min-h-full w-full"
        style={{
          background: 'linear-gradient(180deg, var(--p-bg) 0%, var(--p-bg2) 100%)',
          color: 'var(--p-ink)',
        }}
      >
        <div className="mx-auto w-full max-w-2xl px-5 py-6 sm:py-8">{children}</div>
      </div>
    </div>
  );
}

/** Back chevron + centred title + optional step counter. */
export function TopBar({
  title,
  onBack,
  step,
  total,
  right,
}: {
  title?: string;
  onBack?: () => void;
  step?: number;
  total?: number;
  right?: ReactNode;
}) {
  return (
    <div className="mb-6 flex items-center gap-2">
      {onBack ? (
        <button
          onClick={onBack}
          aria-label="Back"
          className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-black/5"
          style={{ color: 'var(--p-muted)' }}
        >
          <ChevronLeft size={20} />
        </button>
      ) : (
        <div className="h-9 w-9" />
      )}
      <div className="min-w-0 flex-1 text-center">
        {title && (
          <div className="truncate text-sm font-semibold" style={{ color: 'var(--p-ink)' }}>
            {title}
          </div>
        )}
        {step != null && total != null && (
          <div className="text-[11px]" style={{ color: 'var(--p-muted)' }}>
            {step} / {total}
          </div>
        )}
      </div>
      <div className="flex h-9 w-9 items-center justify-end">{right}</div>
    </div>
  );
}

/** Slim progress dots for a session. */
export function StepDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className="h-1.5 rounded-full transition-all duration-300"
          style={{
            width: i === current ? 18 : 6,
            background: i <= current ? 'var(--p-accent)' : 'var(--p-line)',
          }}
        />
      ))}
    </div>
  );
}

export function Card({
  children,
  className,
  onClick,
  style,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-3xl p-5 shadow-[0_2px_20px_rgba(30,40,35,0.06)]',
        onClick && 'cursor-pointer transition hover:-translate-y-0.5 hover:shadow-[0_6px_28px_rgba(30,40,35,0.10)]',
        className,
      )}
      style={{ background: 'var(--p-surface)', border: '1px solid var(--p-line)', ...style }}
    >
      {children}
    </div>
  );
}

export function PrimaryButton({
  children,
  onClick,
  disabled,
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full rounded-2xl px-5 py-3.5 text-sm font-semibold text-white transition active:scale-[0.99] disabled:opacity-40',
        className,
      )}
      style={{ background: 'var(--p-accent)' }}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  onClick,
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full rounded-2xl px-5 py-3.5 text-sm font-semibold transition active:scale-[0.99]',
        className,
      )}
      style={{
        background: 'transparent',
        color: 'var(--p-accent)',
        border: '1px solid var(--p-line)',
      }}
    >
      {children}
    </button>
  );
}

/** A selectable pill/chip. */
export function Chip({
  label,
  selected,
  onClick,
  big,
}: {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  big?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-2xl border text-left font-medium transition active:scale-[0.98]',
        big ? 'px-4 py-3 text-sm' : 'px-3.5 py-2 text-[13px]',
      )}
      style={{
        background: selected ? 'var(--p-accent-soft)' : 'var(--p-surface)',
        borderColor: selected ? 'var(--p-accent)' : 'var(--p-line)',
        color: selected ? 'var(--p-accent)' : 'var(--p-ink)',
      }}
    >
      {selected && <span className="mr-1">✓</span>}
      {label}
    </button>
  );
}

/** Animated wrapper for step transitions. */
export function Fade({ children, keyId }: { children: ReactNode; keyId: string | number }) {
  return (
    <motion.div
      key={keyId}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.28 }}
    >
      {children}
    </motion.div>
  );
}

export { THEME };
