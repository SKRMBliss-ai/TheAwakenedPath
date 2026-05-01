// AwakenedPathLogo.tsx
// Drop-in replacement for the sidebar logo in UntetheredApp.tsx
// Three variants:
//   <AwakenedPathLogo variant="full" />     — icon + wordmark (sidebar header)
//   <AwakenedPathLogo variant="icon" />     — icon only (mobile header)
//   <AwakenedPathLogo variant="wordmark" /> — text only

import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface AwakenedPathLogoProps {
  variant?: 'full' | 'icon' | 'wordmark';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
  onClick?: () => void;
}

export function AwakenedPathLogo({
  variant = 'full',
  size = 'md',
  animated = true,
  className,
  onClick,
}: AwakenedPathLogoProps) {
  const iconSizes = { sm: 28, md: 36, lg: 52 };
  const iconPx = iconSizes[size];

  return (
    <div
      className={cn('flex items-center gap-3 cursor-pointer select-none', className)}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      {/* ── Icon Mark ── */}
      {(variant === 'full' || variant === 'icon') && (
        <LogoMark size={iconPx} animated={animated} />
      )}

      {/* ── Wordmark ── */}
      {(variant === 'full' || variant === 'wordmark') && (
        <Wordmark size={size} />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Icon Mark — uses the official app logo image
// ─────────────────────────────────────────────
function LogoMark({ size, animated }: { size: number; animated: boolean }) {
  return (
    <motion.div
      whileHover={animated ? { scale: 1.06 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="relative flex-shrink-0"
      style={{ width: size, height: size }}
    >
      <img
        src="/AwakenedPathAppLogo.webp"
        alt="The Awakened Path"
        width={size}
        height={size}
        style={{
          width: size,
          height: size,
          objectFit: 'contain',
          borderRadius: size * 0.2,
          display: 'block',
        }}
        draggable={false}
      />
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Wordmark — "Awakened Path" with sub-label
// ─────────────────────────────────────────────
function Wordmark({ size }: { size: 'sm' | 'md' | 'lg' }) {
  const titleSize = { sm: 'text-[10px]', md: 'text-base', lg: 'text-xl' }[size];
  const subSize   = { sm: 'text-[5px]', md: 'text-[7px]', lg: 'text-[9px]' }[size];

  return (
    <div className="flex flex-col leading-none gap-0.5">
      {/* Pre-label */}
      <span
        className={cn(subSize, 'font-serif italic text-[var(--accent-primary)] tracking-[0.35em] uppercase opacity-90')}
      >
        the
      </span>

      {/* Main wordmark */}
      <h1
        className={cn(
          titleSize,
          'font-serif font-light text-[var(--text-primary)] tracking-tight leading-none',
          'group-hover:text-[var(--accent-primary)] transition-colors duration-300'
        )}
      >
        Inner Freedom
      </h1>

      {/* Sub-label */}
      <span
        className={cn(subSize, 'font-sans font-bold text-[var(--accent-primary)] uppercase tracking-[0.3em] opacity-100 mt-1')}
        style={{ fontSize: size === 'sm' ? '6.5px' : size === 'md' ? '9px' : '11px' }}
      >
        The Awakened Path
      </span>
    </div>
  );
}
