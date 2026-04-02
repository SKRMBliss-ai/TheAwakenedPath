// AwakenedPathLogo.tsx
// Drop-in replacement for the sidebar logo in UntetheredApp.tsx
// Three variants:
//   <AwakenedPathLogo variant="full" />     — icon + wordmark (sidebar header)
//   <AwakenedPathLogo variant="icon" />     — icon only (mobile header, favicon)
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
// Icon Mark — Sacred geometry: open circle + path + gold dot
// Concept: A seeker on a path, watched over by an open eye/awareness circle
// ─────────────────────────────────────────────
function LogoMark({ size, animated }: { size: number; animated: boolean }) {
  const s = size;
  const cx = s / 2;
  const cy = s / 2;
  const r = s * 0.38;           // outer circle radius
  const dotR = s * 0.07;        // gold centre dot
  const pathY = cy + s * 0.04;  // horizontal path line y

  return (
    <motion.div
      whileHover={animated ? { scale: 1.06 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="relative flex-shrink-0"
      style={{ width: size, height: size }}
    >
      <svg
        viewBox={`0 0 ${s} ${s}`}
        width={s}
        height={s}
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* Subtle gold radial glow behind the mark */}
          <radialGradient id="logo-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%"  stopColor="#B8973A" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#B8973A" stopOpacity="0" />
          </radialGradient>

          {/* Gold gradient for the centre dot */}
          <radialGradient id="logo-dot-grad" cx="40%" cy="35%" r="60%">
            <stop offset="0%"  stopColor="#E8C97A" />
            <stop offset="100%" stopColor="#8B6914" />
          </radialGradient>

          {/* Gradient for the outer circle stroke — fades at bottom */}
          <linearGradient id="logo-ring-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#B8973A" stopOpacity="0.9" />
            <stop offset="60%"  stopColor="#B8973A" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#B8973A" stopOpacity="0.1" />
          </linearGradient>

          {/* Clip to keep things tidy */}
          <clipPath id="logo-clip">
            <rect x="0" y="0" width={s} height={s} />
          </clipPath>
        </defs>

        {/* Background glow disc */}
        <circle cx={cx} cy={cy} r={r * 1.55} fill="url(#logo-glow)" />

        {/* ── Outer open circle (enso-style, hand-drawn feel) ── */}
        {/* Main ring — slightly broken at bottom to give enso quality */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke="url(#logo-ring-grad)"
          strokeWidth={s * 0.038}
          strokeLinecap="round"
          strokeDasharray={`${2 * Math.PI * r * 0.88} ${2 * Math.PI * r * 0.12}`}
          strokeDashoffset={`${2 * Math.PI * r * 0.06}`}
          transform={`rotate(-100 ${cx} ${cy})`}
        />

        {/* Secondary thin ring — inset, very faint — depth */}
        <circle
          cx={cx} cy={cy} r={r * 0.78}
          fill="none"
          stroke="#B8973A"
          strokeWidth={s * 0.008}
          strokeOpacity="0.2"
          strokeDasharray={`${2 * Math.PI * r * 0.78 * 0.6} ${2 * Math.PI * r * 0.78 * 0.4}`}
          transform={`rotate(45 ${cx} ${cy})`}
        />

        {/* ── The Path — horizontal line through circle ── */}
        {/* Left segment (outside circle) */}
        <line
          x1={s * 0.04} y1={pathY}
          x2={cx - r * 0.88} y2={pathY}
          stroke="#B8973A" strokeWidth={s * 0.022}
          strokeLinecap="round" strokeOpacity="0.35"
        />
        {/* Right segment (outside circle) */}
        <line
          x1={cx + r * 0.88} y1={pathY}
          x2={s * 0.96} y2={pathY}
          stroke="#B8973A" strokeWidth={s * 0.022}
          strokeLinecap="round" strokeOpacity="0.35"
        />
        {/* Through circle — full width inner */}
        <line
          x1={cx - r * 0.88} y1={pathY}
          x2={cx + r * 0.88} y2={pathY}
          stroke="#B8973A" strokeWidth={s * 0.018}
          strokeLinecap="round" strokeOpacity="0.55"
        />

        {/* ── Centre Dot — the awakened point of awareness ── */}
        {animated ? (
          <>
            {/* Outer pulse ring */}
            <motion.circle
              cx={cx} cy={pathY} r={dotR * 2.2}
              fill="none"
              stroke="#B8973A"
              strokeWidth={s * 0.008}
              animate={{ r: [dotR * 2.2, dotR * 3.2, dotR * 2.2], opacity: [0.35, 0.0, 0.35] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* Solid gold dot */}
            <motion.circle
              cx={cx} cy={pathY} r={dotR}
              fill="url(#logo-dot-grad)"
              animate={{ r: [dotR, dotR * 1.08, dotR] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
          </>
        ) : (
          <circle cx={cx} cy={pathY} r={dotR} fill="url(#logo-dot-grad)" />
        )}

        {/* ── Tiny upward spark above dot — consciousness rising ── */}
        <line
          x1={cx} y1={pathY - dotR * 1.4}
          x2={cx} y2={pathY - r * 0.52}
          stroke="#B8973A" strokeWidth={s * 0.014}
          strokeLinecap="round" strokeOpacity="0.5"
        />
        {/* Small horizontal crossbar on spark */}
        <line
          x1={cx - s * 0.04} y1={pathY - r * 0.35}
          x2={cx + s * 0.04} y2={pathY - r * 0.35}
          stroke="#B8973A" strokeWidth={s * 0.01}
          strokeLinecap="round" strokeOpacity="0.35"
        />
      </svg>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Wordmark — "Awakened Path" with sub-label
// ─────────────────────────────────────────────
function Wordmark({ size }: { size: 'sm' | 'md' | 'lg' }) {
  const titleSize = { sm: 'text-sm', md: 'text-base', lg: 'text-xl' }[size];
  const subSize   = { sm: 'text-[6px]', md: 'text-[7px]', lg: 'text-[9px]' }[size];

  return (
    <div className="flex flex-col leading-none gap-0.5">
      {/* Pre-label */}
      <span
        className={cn(subSize, 'font-serif italic text-[var(--accent-primary)] tracking-[0.35em] uppercase opacity-75')}
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
        Awakened Path
      </h1>

      {/* Sub-label */}
      <span
        className={cn(subSize, 'font-sans font-bold text-[var(--text-muted)] uppercase tracking-[0.38em] opacity-55 mt-0.5')}
      >
        The Presence Study
      </span>
    </div>
  );
}
