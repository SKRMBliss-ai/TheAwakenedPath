import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * Shared Practise UI primitives. Palette + components are built to match the
 * product wireframes: a cosmic, glowing-orb aesthetic for the Adult gym
 * (deep indigo -> violet -> magenta, mirroring the meditation-player mockups)
 * and a warm, playful, character-driven aesthetic for the Kids gym (cream /
 * peach with orange + green + purple accents, mirroring the panda / feelings
 * mockups). Everything is scoped via CSS variables so it never leaks into the
 * app's own dark shell.
 */

export type Variant = 'adult' | 'kids';

/** Palette per gym. */
const THEME: Record<Variant, Record<string, string>> = {
  adult: {
    '--p-bg': '#F6F3FD',
    '--p-bg2': '#EEE7FA',
    '--p-surface': '#FFFFFF',
    '--p-ink': '#241B3D',
    '--p-muted': '#7C7295',
    '--p-accent': '#6E4FE8',
    '--p-accent-soft': '#EDE6FF',
    '--p-line': '#E7E0F5',
    // cosmic gradient stops for immersive (hero / session-player) screens
    '--p-cos-1': '#140B30',
    '--p-cos-2': '#3B2179',
    '--p-cos-3': '#7C3FC0',
    '--p-cos-4': '#C85AA6',
    '--p-cta-1': '#33E5A5',
    '--p-cta-2': '#17A987',
  },
  kids: {
    '--p-bg': '#FFF6EA',
    '--p-bg2': '#FFEAD2',
    '--p-surface': '#FFFFFF',
    '--p-ink': '#3A2E22',
    '--p-muted': '#96816A',
    '--p-accent': '#FF9640',
    '--p-accent-soft': '#FFE9D2',
    '--p-line': '#F5E2C8',
    '--p-green': '#3FB37F',
    '--p-green-soft': '#DFF5E9',
    '--p-purple': '#8C6FE8',
    '--p-purple-soft': '#EEE8FC',
  },
};


/** Full-bleed themed container for a Practise screen.
 *  mode="light" (default) = clean card-based background, matches the
 *  wireframes' list/home screens.
 *  mode="cosmic" = deep glowing gradient with soft blob light + stars,
 *  matches the wireframes' hero / meditation-session screens. Only used by
 *  the Adult gym; Kids stays warm regardless of mode.
 */
export function PractiseShell({
  variant,
  children,
  className,
  mode = 'light',
  theme,
}: {
  variant: Variant;
  children: ReactNode;
  className?: string;
  mode?: 'light' | 'cosmic';
  /** Overrides THEME[variant]'s values without changing the shared default —
   *  see GYM_ADULT_THEME below for why this exists rather than editing
   *  THEME.adult directly. */
  theme?: Record<string, string>;
}) {
  const cosmic = mode === 'cosmic' && variant === 'adult';
  const palette = theme ? { ...THEME[variant], ...theme } : THEME[variant];
  return (
    <div style={palette as React.CSSProperties} className={cn('min-h-full w-full', className)}>
      <div
        className="relative min-h-full w-full overflow-hidden"
        style={
          cosmic
            ? {
                background:
                  'radial-gradient(120% 80% at 20% 0%, var(--p-cos-3) 0%, transparent 55%), radial-gradient(100% 70% at 90% 15%, var(--p-cos-4) 0%, transparent 50%), linear-gradient(160deg, var(--p-cos-1) 0%, var(--p-cos-2) 55%, var(--p-cos-1) 100%)',
                color: '#F5F0FF',
              }
            : { background: 'linear-gradient(180deg, var(--p-bg) 0%, var(--p-bg2) 100%)', color: 'var(--p-ink)' }
        }
      >
        {cosmic && <Stars />}
        <div className="relative mx-auto w-full max-w-2xl px-5 py-6 sm:py-8">{children}</div>
      </div>
    </div>
  );
}

/** A handful of softly twinkling stars for cosmic screens. */
function Stars() {
  const stars = [
    { x: '12%', y: '14%', s: 2, d: 3.2 }, { x: '82%', y: '10%', s: 3, d: 4 },
    { x: '70%', y: '28%', s: 2, d: 2.6 }, { x: '25%', y: '32%', s: 2, d: 3.8 },
    { x: '90%', y: '45%', s: 2, d: 3 }, { x: '8%', y: '55%', s: 3, d: 4.4 },
    { x: '55%', y: '8%', s: 2, d: 2.8 }, { x: '38%', y: '22%', s: 2, d: 3.4 },
  ];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {stars.map((st, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-white"
          style={{ left: st.x, top: st.y, width: st.s, height: st.s }}
          animate={{ opacity: [0.15, 0.9, 0.15] }}
          transition={{ repeat: Infinity, duration: st.d, ease: 'easeInOut', delay: i * 0.3 }}
        />
      ))}
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
  light,
}: {
  title?: string;
  onBack?: () => void;
  step?: number;
  total?: number;
  right?: ReactNode;
  /** Force light (white-on-dark) chrome, for use on cosmic backgrounds. */
  light?: boolean;
}) {
  const ink = light ? '#FFFFFF' : 'var(--p-ink)';
  const muted = light ? 'rgba(255,255,255,0.7)' : 'var(--p-muted)';
  return (
    <div className="mb-6 flex items-center gap-2">
      {onBack ? (
        <button
          onClick={onBack}
          aria-label="Back"
          className={cn('grid h-9 w-9 place-items-center rounded-full transition', light ? 'hover:bg-white/10' : 'hover:bg-black/5')}
          style={{ color: muted }}
        >
          <ChevronLeft size={20} />
        </button>
      ) : (
        <div className="h-9 w-9" />
      )}
      <div className="min-w-0 flex-1 text-center">
        {title && (
          <div className="truncate text-sm font-semibold" style={{ color: ink }}>
            {title}
          </div>
        )}
        {step != null && total != null && (
          <div className="text-[11px]" style={{ color: muted }}>
            {step} / {total}
          </div>
        )}
      </div>
      <div className="flex h-9 w-9 items-center justify-end">{right}</div>
    </div>
  );
}

/** Slim progress dots for a session. */
export function StepDots({ total, current, light }: { total: number; current: number; light?: boolean }) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className="h-1.5 rounded-full transition-all duration-300"
          style={{
            width: i === current ? 18 : 6,
            background: i <= current ? (light ? '#FFFFFF' : 'var(--p-accent)') : light ? 'rgba(255,255,255,0.25)' : 'var(--p-line)',
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
  gradient,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  /** 'cta' = bright green gradient pill (matches the "Get Started" mockup). */
  gradient?: 'cta';
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full rounded-2xl px-5 py-3.5 text-sm font-semibold text-white shadow-lg transition active:scale-[0.99] disabled:opacity-40',
        className,
      )}
      style={{
        background: gradient === 'cta' ? 'linear-gradient(135deg, var(--p-cta-1), var(--p-cta-2))' : 'var(--p-accent)',
        boxShadow: gradient === 'cta' ? '0 8px 24px rgba(23,169,135,0.35)' : '0 6px 18px rgba(110,79,232,0.25)',
      }}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  onClick,
  className,
  light,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  light?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full rounded-2xl px-5 py-3.5 text-sm font-semibold transition active:scale-[0.99]',
        className,
      )}
      style={{
        background: light ? 'rgba(255,255,255,0.08)' : 'transparent',
        color: light ? '#FFFFFF' : 'var(--p-accent)',
        border: light ? '1px solid rgba(255,255,255,0.25)' : '1px solid var(--p-line)',
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
  tone = 'accent',
}: {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  big?: boolean;
  /** Selected-state color, to match the mockups' teal/green pill tags. */
  tone?: 'accent' | 'green';
}) {
  const selBg = tone === 'green' ? 'var(--p-green-soft)' : 'var(--p-accent-soft)';
  const selBorder = tone === 'green' ? 'var(--p-green)' : 'var(--p-accent)';
  const selText = tone === 'green' ? 'var(--p-green)' : 'var(--p-accent)';
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-full border text-left font-medium transition active:scale-[0.98]',
        big ? 'px-4 py-3 text-sm' : 'px-3.5 py-2 text-[13px]',
      )}
      style={{
        background: selected ? selBg : 'var(--p-surface)',
        borderColor: selected ? selBorder : 'var(--p-line)',
        color: selected ? selText : 'var(--p-ink)',
      }}
    >
      {selected && <span className="mr-1">✓</span>}
      {label}
    </button>
  );
}

/** Circular avatar in a selectable colour ring — matches the "How are you
 *  feeling" mockups (kid photo / panda avatar ringed in colour when picked). */
export function RingAvatar({
  glyph,
  label,
  selected,
  ringColor,
  onClick,
  size = 64,
}: {
  glyph: string;
  label: string;
  selected?: boolean;
  ringColor: string;
  onClick?: () => void;
  size?: number;
}) {
  return (
    <motion.button whileTap={{ scale: 0.94 }} onClick={onClick} className="flex flex-col items-center gap-1.5">
      <div
        className="grid place-items-center rounded-full transition-all"
        style={{
          width: size,
          height: size,
          border: `3px solid ${selected ? ringColor : 'var(--p-line)'}`,
          background: selected ? `${ringColor}1A` : 'var(--p-surface)',
          boxShadow: selected ? `0 0 0 4px ${ringColor}22` : 'none',
        }}
      >
        <span style={{ fontSize: size * 0.42 }}>{glyph}</span>
      </div>
      <span
        className="text-[11px] font-bold"
        style={{ color: selected ? ringColor : 'var(--p-muted)' }}
      >
        {label}
      </span>
    </motion.button>
  );
}

/** The glowing gradient orb used across the meditation mockups: a soft
 *  radial "planet" blob, optionally with a crescent moon and a gentle
 *  breathing pulse. Pure CSS/SVG, no images. */
export function GlowOrb({
  size = 176,
  moon = true,
  pulse = true,
  face,
}: {
  size?: number;
  moon?: boolean;
  pulse?: boolean;
  face?: 'sleepy' | 'none';
}) {
  return (
    <motion.div
      className="relative grid place-items-center rounded-full"
      style={{
        width: size,
        height: size,
        background:
          'radial-gradient(circle at 32% 28%, #E9D6FF 0%, #B47CF0 24%, #7C4FE0 52%, #4A2E9E 78%, #2A1B5E 100%)',
        boxShadow: '0 0 60px rgba(140,90,230,0.55), 0 0 120px rgba(200,90,166,0.25)',
      }}
      animate={pulse ? { scale: [1, 1.045, 1] } : undefined}
      transition={pulse ? { repeat: Infinity, duration: 5.5, ease: 'easeInOut' } : undefined}
    >
      {/* soft inner blobs */}
      <div
        className="absolute rounded-full opacity-70"
        style={{ width: size * 0.5, height: size * 0.5, left: '14%', top: '18%', background: 'radial-gradient(circle, #FFD1EC, transparent 70%)', filter: 'blur(2px)' }}
      />
      <div
        className="absolute rounded-full opacity-50"
        style={{ width: size * 0.4, height: size * 0.4, right: '10%', bottom: '16%', background: 'radial-gradient(circle, #7EE8D8, transparent 70%)', filter: 'blur(3px)' }}
      />
      {moon && (
        <div
          className="relative z-10"
          style={{
            width: size * 0.34,
            height: size * 0.34,
            borderRadius: '9999px',
            background: 'linear-gradient(135deg, #FFE9A8, #FFC65C)',
            boxShadow: 'inset 8px -4px 0 0 rgba(0,0,0,0.18), 0 0 24px rgba(255,206,110,0.65)',
          }}
        />
      )}
      {face === 'sleepy' && (
        <div className="absolute bottom-[28%] z-10 text-[10px] tracking-widest text-white/80">◡ ◡</div>
      )}
    </motion.div>
  );
}

/** Level + points gamification badge (mirrors the "Daniel · Level 4 · 35
 *  Points" mockup) for Kids gym chrome. */
export function LevelBadge({ level, points }: { level: number; points: number }) {
  return (
    <div
      className="flex items-center gap-1.5 rounded-full py-1 pl-1 pr-3 text-[12px] font-bold"
      style={{ background: 'var(--p-purple-soft)', color: 'var(--p-purple)' }}
    >
      <span
        className="grid h-6 w-6 place-items-center rounded-full text-[11px] text-white"
        style={{ background: 'var(--p-purple)' }}
      >
        {level}
      </span>
      ⭐ {points}
    </div>
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
