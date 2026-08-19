// MindGymLogo.tsx
// Drop-in replacement for the sidebar logo in UntetheredApp.tsx
// Three variants:
//   <MindGymLogo variant="full" />     — icon + wordmark (sidebar header)
//   <MindGymLogo variant="icon" />     — icon only (mobile header, favicon)
//   <MindGymLogo variant="wordmark" /> — text only

import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface MindGymLogoProps {
  variant?: 'full' | 'icon' | 'wordmark';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
  onClick?: () => void;
  /** Small mark rendered as a corner badge on the icon (e.g. a sister-brand
   *  link). Positioned relative to the icon's own known box, so it never
   *  changes this component's outer width — unlike an inline sibling, which
   *  widens the row and can be pushed under whatever sits to the right of it. */
  badge?: React.ReactNode;
}

export function MindGymLogo({
  variant = 'full',
  size = 'md',
  animated = true,
  className,
  onClick,
  badge,
}: MindGymLogoProps) {
  const iconSizes = { sm: 28, md: 36, lg: 52 };
  const iconPx = iconSizes[size];
  const badgeSizes = { sm: 16, md: 18, lg: 22 };
  const badgePx = badgeSizes[size];

  return (
    <div
      className={cn('flex items-center gap-2 cursor-pointer select-none flex-shrink-0', className)}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      {/* ── Icon Mark ── */}
      {(variant === 'full' || variant === 'icon') && (
        <div className="relative flex-shrink-0" style={{ width: iconPx, height: iconPx }}>
          <LogoMark size={iconPx} animated={animated} />
          {badge && (
            <div
              className="absolute rounded-full overflow-hidden pointer-events-auto"
              style={{
                width: badgePx,
                height: badgePx,
                right: -badgePx * 0.28,
                bottom: -badgePx * 0.28,
              }}
              // Badge is its own click target (e.g. a link) — stop the click
              // reaching the icon's onClick (internal nav) underneath it.
              onClick={(e) => e.stopPropagation()}
            >
              {badge}
            </div>
          )}
        </div>
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
            <stop offset="0%"  stopColor="#7A5F44" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#7A5F44" stopOpacity="0" />
          </radialGradient>

          {/* Gold gradient for the centre dot */}
          <radialGradient id="logo-dot-grad" cx="40%" cy="35%" r="60%">
            <stop offset="0%"  stopColor="#E8C97A" />
            <stop offset="100%" stopColor="#6B5238" />
          </radialGradient>

          {/* Gradient for the outer circle stroke — fades at bottom */}
          <linearGradient id="logo-ring-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#7A5F44" stopOpacity="0.9" />
            <stop offset="60%"  stopColor="#7A5F44" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#7A5F44" stopOpacity="0.1" />
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
          stroke="#7A5F44"
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
          stroke="#7A5F44" strokeWidth={s * 0.022}
          strokeLinecap="round" strokeOpacity="0.35"
        />
        {/* Right segment (outside circle) */}
        <line
          x1={cx + r * 0.88} y1={pathY}
          x2={s * 0.96} y2={pathY}
          stroke="#7A5F44" strokeWidth={s * 0.022}
          strokeLinecap="round" strokeOpacity="0.35"
        />
        {/* Through circle — full width inner */}
        <line
          x1={cx - r * 0.88} y1={pathY}
          x2={cx + r * 0.88} y2={pathY}
          stroke="#7A5F44" strokeWidth={s * 0.018}
          strokeLinecap="round" strokeOpacity="0.55"
        />

        {/* ── Centre Dot — the awakened point of awareness ── */}
        {animated ? (
          <>
            {/* Outer pulse ring */}
            <motion.circle
              cx={cx} cy={pathY} r={dotR * 2.2}
              fill="none"
              stroke="#7A5F44"
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
          stroke="#7A5F44" strokeWidth={s * 0.014}
          strokeLinecap="round" strokeOpacity="0.5"
        />
        {/* Small horizontal crossbar on spark */}
        <line
          x1={cx - s * 0.04} y1={pathY - r * 0.35}
          x2={cx + s * 0.04} y2={pathY - r * 0.35}
          stroke="#7A5F44" strokeWidth={s * 0.01}
          strokeLinecap="round" strokeOpacity="0.35"
        />
      </svg>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Wordmark — "Mind Gym" with sub-label
// ─────────────────────────────────────────────
function Wordmark({ size }: { size: 'sm' | 'md' | 'lg' }) {
  const titleSize = {
    sm: 'text-[13px]',
    md: 'text-[17px] sm:text-[19px]',
    lg: 'text-[22px] sm:text-[24px]',
  }[size];

  const subFontSize = { sm: '7px', md: '8.5px', lg: '10px' }[size];

  return (
    <div className="flex flex-col gap-0.5 ml-1 flex-shrink-0 pr-1">
      {/* Main wordmark — clean, elegant serif, fitting perfectly without truncation */}
      <h1
        className={cn(
          titleSize,
          'font-serif font-medium text-[var(--text-primary)] leading-[1.1] whitespace-nowrap',
          'group-hover:text-[var(--accent-primary)] transition-colors duration-300'
        )}
        style={{ letterSpacing: '0.02em' }}
      >
        Mind Gym
      </h1>

      {/* Tagline — tight tracking to fit perfectly */}
      <span
        className="font-sans font-bold uppercase text-[var(--accent-primary)] whitespace-nowrap"
        style={{
          fontSize: subFontSize,
          letterSpacing: '0.12em',
          opacity: 0.85,
          lineHeight: 1.1,
        }}
      >
        Train your mind daily
      </span>
    </div>
  );
}
