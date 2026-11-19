import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Play, Pause, RotateCcw, ChevronDown, Moon, Sun, Square, Bell } from 'lucide-react';
import { MALA_OPTIONS } from './sadhanaStore';

export interface MinimalistChantingViewProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  deity?: string;
  todayReps: number;
  malaTarget: number;
  playing: boolean;
  onTogglePlay: () => void;
  onStop?: () => void;
  onCountOne: () => void;
  onReset: () => void;
  onSelectTarget: (target: number) => void;
  isDark?: boolean;
  isAarti?: boolean;
  currentTime?: number;
  duration?: number;
}

const OM_MEDALLION_IMAGE = '/marketing/mantras/exec-ce641b41-377a-428e-9ae9-53d82af4accf.png';

function fmtTime(sec?: number) {
  if (!sec || isNaN(sec) || sec <= 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

/**
 * Sacred Aarti sanctuary view — shown when an Aarti song is playing.
 * An Aarti is an offering of light and devotion, not a counted repetition.
 */
function AartiPlayerView({
  isDark,
  currentTime = 0,
  duration = 0,
}: {
  isDark: boolean;
  currentTime?: number;
  duration?: number;
}) {
  const pct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div className="relative flex flex-col items-center justify-center my-auto py-6 px-6 max-w-sm w-full mx-auto select-none">
      {/* Sacred Diya / Flame Offering Aura */}
      <div className="relative w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center mb-6">
        {/* Soft glowing concentric rings */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: isDark
              ? 'radial-gradient(circle, rgba(255, 209, 71, 0.22) 0%, rgba(255, 160, 0, 0.08) 45%, transparent 70%)'
              : 'radial-gradient(circle, rgba(212, 175, 55, 0.2) 0%, rgba(196, 151, 70, 0.06) 50%, transparent 70%)',
            filter: 'blur(12px)',
          }}
        />

        {/* Outer decorative ring */}
        <div
          className="w-full h-full rounded-full border flex items-center justify-center transition-all duration-700"
          style={{
            borderColor: isDark ? 'rgba(255, 209, 71, 0.25)' : 'rgba(196, 151, 70, 0.3)',
            boxShadow: isDark
              ? '0 0 32px rgba(255, 209, 71, 0.15), inset 0 0 24px rgba(255, 209, 71, 0.1)'
              : '0 0 24px rgba(196, 151, 70, 0.12), inset 0 0 16px rgba(196, 151, 70, 0.08)',
          }}
        >
          {/* Inner ring */}
          <div
            className="w-32 h-32 sm:w-36 sm:h-36 rounded-full border flex flex-col items-center justify-center text-center p-3"
            style={{
              borderColor: isDark ? 'rgba(255, 209, 71, 0.35)' : 'rgba(196, 151, 70, 0.4)',
              background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.5)',
            }}
          >
            {/* Sacred Diya lamp */}
            <span className="text-4xl sm:text-5xl select-none" role="img" aria-label="Diya flame">🪔</span>
          </div>
        </div>
      </div>

      {/* Progress bar and time */}
      <div className="w-full max-w-xs space-y-1.5">
        <div
          className="w-full h-1.5 rounded-full overflow-hidden"
          style={{
            background: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
          }}
        >
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${pct}%`,
              background: 'linear-gradient(90deg, #F5C769 0%, #D4982A 100%)',
              boxShadow: isDark ? '0 0 8px rgba(255, 209, 71, 0.6)' : 'none',
            }}
          />
        </div>

        <div
          className="flex items-center justify-between text-xs font-semibold tabular-nums px-0.5"
          style={{ color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(58, 39, 24, 0.82)' }}
        >
          <span>{fmtTime(currentTime)}</span>
          <span>{duration > 0 ? fmtTime(duration) : ''}</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Top Radiant Om (ॐ) Mandala.
 * Renders the new sacred 3D golden pearl Om medallion.
 */
function SacredOmHeader({ isDark, deity, title }: { isDark: boolean; deity?: string; title: string }) {
  const glow = isDark ? 'rgba(255, 209, 71, 0.45)' : 'rgba(184, 134, 11, 0.2)';

  return (
    <div className="flex flex-col items-center text-center pt-1 px-6 select-none">
      {/* Sacred Om Medallion */}
      <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center my-1">
        {/* Ambient radial aura behind Om */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${glow} 0%, transparent 70%)`,
            filter: 'blur(10px)',
            transform: 'scale(1.15)',
          }}
        />

        <img
          src={OM_MEDALLION_IMAGE}
          alt="Sacred Om (ॐ)"
          width={112}
          height={112}
          className="relative z-10 w-full h-full object-contain select-none pointer-events-none"
          style={{
            filter: isDark
              ? 'drop-shadow(0 0 16px rgba(255, 209, 71, 0.5)) drop-shadow(0 4px 12px rgba(0,0,0,0.65))'
              : 'drop-shadow(0 4px 14px rgba(184, 134, 11, 0.22)) drop-shadow(0 1px 3px rgba(0,0,0,0.08))',
          }}
        />
      </div>

      {/* Mantra Title & Deity */}
      <h2
        className="font-serif tracking-wide text-center mt-1 px-4 truncate max-w-xs"
        style={{
          fontSize: 'clamp(20px, 5.5vw, 25px)',
          fontWeight: 600,
          color: isDark ? '#FFFFFF' : '#2A1C12',
          letterSpacing: '-0.01em',
        }}
      >
        {title}
      </h2>
      {deity && (
        <p
          className="text-xs uppercase tracking-[0.2em] font-medium mt-0.5"
          style={{ color: isDark ? 'rgba(255, 209, 71, 0.95)' : '#705426' }}
        >
          {deity}
        </p>
      )}
    </div>
  );
}

/**
 * Centerpiece Circular Mala Ring:
 * - In Dark Mode: Golden radiant ring with 27/54 beads and glowing marker.
 * - In Light Mode: Luminous pearl beads with golden silk tassel hanging at 6 o'clock.
 */
function getBeadMetrics(target: number) {
  if (target <= 11) return { baseR: 8.5, currentR: 10.5, strokeWidth: 1.2, shadowOffset: 2 };
  if (target <= 21) return { baseR: 6.5, currentR: 8.2, strokeWidth: 1.0, shadowOffset: 1.6 };
  if (target <= 27) return { baseR: 5.6, currentR: 7.2, strokeWidth: 0.9, shadowOffset: 1.4 };
  if (target <= 54) return { baseR: 4.2, currentR: 5.6, strokeWidth: 0.8, shadowOffset: 1.1 };
  return { baseR: 2.3, currentR: 3.5, strokeWidth: 0.6, shadowOffset: 0.8 }; // 108 beads
}

function MalaCircle({
  isDark,
  count,
  target,
  malasCompleted,
  onTapCount,
  reducedMotion,
}: {
  isDark: boolean;
  count: number;
  target: number;
  malasCompleted: number;
  onTapCount: () => void;
  reducedMotion: boolean;
}) {
  const [pulse, setPulse] = useState(false);
  const inMala = count % target;
  const isCompleteCycle = count > 0 && inMala === 0;
  const filledCount = isCompleteCycle ? target : inMala;
  const pct = Math.min(1, filledCount / target);

  // Exact bead count matching target (11 beads for 11, 21 for 21, etc.)
  const BEAD_COUNT = target;
  const metrics = useMemo(() => getBeadMetrics(target), [target]);

  const center = 140;
  const radius = 108;

  const beads = useMemo(() => {
    return Array.from({ length: BEAD_COUNT }, (_, i) => {
      // Start from 12 o'clock (-PI / 2) and go clockwise
      const angle = (i / BEAD_COUNT) * 2 * Math.PI - Math.PI / 2;
      const cx = center + radius * Math.cos(angle);
      const cy = center + radius * Math.sin(angle);
      const isFilled = filledCount > 0 && i < filledCount;
      const isCurrent = filledCount > 0 && i === filledCount - 1;
      return { i, cx, cy, isFilled, isCurrent };
    });
  }, [BEAD_COUNT, filledCount]);

  const handleTap = () => {
    setPulse(true);
    setTimeout(() => setPulse(false), 260);
    onTapCount();
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(22);
      }
    } catch {
      // ignore
    }
  };

  const gold = isDark ? '#FFD147' : '#C49746';

  return (
    <div className="relative flex flex-col items-center justify-center my-auto py-2">
      {/* Tap-to-count container */}
      <button
        type="button"
        onClick={handleTap}
        aria-label={`Count repetition: currently ${inMala} of ${target}. Tap to add one.`}
        className="relative group cursor-pointer focus:outline-none select-none transition-transform active:scale-95"
        style={{
          width: 'clamp(220px, min(72vw, 38dvh), 300px)',
          height: 'clamp(220px, min(72vw, 38dvh), 300px)',
        }}
      >
        <svg viewBox="0 0 280 280" className="w-full h-full overflow-visible">
          <defs>
            {/* Dark mode golden glow filter */}
            <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Pearl 3D gradient for light mode */}
            <radialGradient id="pearlShine" cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="45%" stopColor="#FFF7EC" />
              <stop offset="85%" stopColor="#E9D9C3" />
              <stop offset="100%" stopColor="#C4B196" />
            </radialGradient>

            {/* Active golden pearl */}
            <radialGradient id="goldBead" cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#FFF5B8" />
              <stop offset="45%" stopColor="#F5C769" />
              <stop offset="85%" stopColor="#D8982D" />
              <stop offset="100%" stopColor="#8A5A0A" />
            </radialGradient>
          </defs>

          {/* Background track circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={isDark ? 'rgba(255, 209, 71, 0.22)' : 'rgba(196, 151, 70, 0.25)'}
            strokeWidth={target <= 21 ? '4' : '3'}
          />

          {/* Active progress arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={gold}
            strokeWidth={target <= 21 ? '5' : '3.5'}
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * radius}
            strokeDashoffset={2 * Math.PI * radius * (1 - pct)}
            transform={`rotate(-90 ${center} ${center})`}
            style={{ transition: reducedMotion ? 'none' : 'stroke-dashoffset 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)' }}
            filter={isDark ? 'url(#goldGlow)' : undefined}
          />

          {/* Mala Beads along the track */}
          {beads.map(({ i, cx, cy, isFilled, isCurrent }) => {
            const beadR = isCurrent ? metrics.currentR : isFilled ? metrics.baseR * 1.05 : metrics.baseR;
            if (isDark) {
              // Dark mode: Radiant gold beads
              return (
                <circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r={beadR}
                  fill={isFilled ? 'url(#goldBead)' : 'rgba(255, 209, 71, 0.35)'}
                  stroke={isFilled ? '#FFE57F' : 'rgba(255, 209, 71, 0.4)'}
                  strokeWidth={isCurrent ? metrics.strokeWidth * 1.4 : metrics.strokeWidth}
                  filter={isCurrent ? 'url(#goldGlow)' : undefined}
                  style={{ transition: 'r 0.2s ease, fill 0.2s ease' }}
                />
              );
            }

            // Light mode: Luminous natural pearls
            return (
              <g key={i}>
                {/* Bead drop shadow */}
                <circle
                  cx={cx + metrics.shadowOffset * 0.4}
                  cy={cy + metrics.shadowOffset * 0.8}
                  r={beadR}
                  fill="rgba(80, 50, 20, 0.12)"
                />
                <circle
                  cx={cx}
                  cy={cy}
                  r={beadR}
                  fill={isFilled ? 'url(#goldBead)' : 'url(#pearlShine)'}
                  stroke={isFilled ? '#B8860B' : '#E2D3BE'}
                  strokeWidth={isCurrent ? metrics.strokeWidth * 1.4 : metrics.strokeWidth}
                  style={{ transition: 'r 0.2s ease, fill 0.2s ease' }}
                />
              </g>
            );
          })}

          {/* Light Mode Silk Tassel at bottom (6 o'clock) */}
          {!isDark && (
            <g transform={`translate(${center}, ${center + radius})`}>
              {/* Guru bead cap */}
              <circle cx="0" cy="5" r="4.5" fill="url(#goldBead)" stroke="#8A5A0A" strokeWidth="0.8" />
              <rect x="-3" y="9" width="6" height="3" rx="1.5" fill="#C49746" />
              {/* Silk tassel threads */}
              <path
                d="M -4 12 L -6 32 C -5 34, 5 34, 6 32 L 4 12 Z"
                fill="url(#goldBead)"
                stroke="#8A5A0A"
                strokeWidth="0.6"
              />
              <line x1="-2" y1="13" x2="-3.5" y2="32" stroke="#8A5A0A" strokeWidth="0.5" strokeOpacity="0.4" />
              <line x1="0" y1="13" x2="0" y2="33" stroke="#8A5A0A" strokeWidth="0.5" strokeOpacity="0.4" />
              <line x1="2" y1="13" x2="3.5" y2="32" stroke="#8A5A0A" strokeWidth="0.5" strokeOpacity="0.4" />
            </g>
          )}

          {/* Pulse Ripple Circle on Tap */}
          {pulse && !reducedMotion && (
            <circle
              cx={center}
              cy={center}
              r={radius - 12}
              fill="none"
              stroke={gold}
              strokeWidth="2"
              className="animate-ping opacity-60"
            />
          )}
        </svg>

        {/* Center content inside mala */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4">
          {/* Crisp, clean, modern numeral */}
          <motion.div
            key={inMala}
            initial={reducedMotion ? false : { scale: 0.94, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 350, damping: 25 }}
            className="tabular-nums font-bold tracking-tight"
            style={{
              fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              fontSize: 'clamp(62px, 16vw, 84px)',
              lineHeight: 1,
              color: isDark ? '#FFFFFF' : '#2A1C12',
              textShadow: isDark
                ? '0 0 24px rgba(255, 209, 71, 0.55), 0 2px 4px rgba(0,0,0,0.8)'
                : 'none',
            }}
          >
            {inMala === 0 && count > 0 ? target : inMala}
          </motion.div>

          {/* Clean, minimalist target indicator */}
          <div
            className="text-xs font-semibold tracking-widest uppercase mt-1.5"
            style={{ color: isDark ? 'rgba(255, 255, 255, 0.82)' : 'rgba(58, 39, 24, 0.82)' }}
          >
            {inMala === 0 && count > 0 ? 'Mala complete' : `/ ${target}`}
          </div>

          {malasCompleted > 0 && (
            <span
              className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide"
              style={{
                background: isDark ? 'rgba(255, 209, 71, 0.15)' : 'rgba(196, 151, 70, 0.18)',
                color: isDark ? '#FFE082' : '#7A521E',
                border: `1px solid ${isDark ? 'rgba(255, 209, 71, 0.3)' : 'rgba(196, 151, 70, 0.3)'}`,
              }}
            >
              <Bell size={13} aria-hidden="true" /> {malasCompleted} mala{malasCompleted > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </button>

      {/* Gentle Tap Hint */}
      <p
        className="mt-3 text-xs tracking-wide text-center"
        style={{ color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(58, 39, 24, 0.82)' }}
      >
        Tap circle to count · Audio counts automatically
      </p>
    </div>
  );
}

/**
 * Minimalist Chanting View — full-screen un-cluttered mobile sacred sanctuary.
 * Built to mirror the user's uploaded reference visuals (both dark gold & pearl ivory).
 */
export function MinimalistChantingView({
  isOpen,
  onClose,
  title,
  subtitle,
  deity,
  todayReps,
  malaTarget,
  playing,
  onTogglePlay,
  onStop,
  onCountOne,
  onReset,
  onSelectTarget,
  isDark: initialDark = true,
  isAarti,
  currentTime = 0,
  duration = 0,
}: MinimalistChantingViewProps) {
  const isAartiTrack = isAarti ?? (
    title.toLowerCase().includes('aarti') ||
    (subtitle && subtitle.toLowerCase().includes('aarti')) ||
    false
  );
  const queryTheme = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('theme') : null;
  const resolvedInitial = queryTheme === 'light' ? false : queryTheme === 'dark' ? true : initialDark;
  const prefersReducedMotion = useReducedMotion() ?? false;
  const [themeOverride, setThemeOverride] = useState<boolean | null>(null);
  const isDark = themeOverride ?? resolvedInitial;
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Keep screen awake while chanting if WakeLock API is supported
  useEffect(() => {
    if (!isOpen || typeof navigator === 'undefined' || !('wakeLock' in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    let cancelled = false;
    navigator.wakeLock.request('screen').then((requestedLock) => {
      if (cancelled) { void requestedLock.release().catch(() => {}); return; }
      lock = requestedLock;
    }).catch(() => {});
    return () => {
      cancelled = true;
      void lock?.release().catch(() => {});
    };
  }, [isOpen]);

  // Hide background docks and widgets when Zen Chanting is active
  useEffect(() => {
    if (!isOpen) return;
    document.body.classList.add('zen-chanting-open');
    return () => {
      document.body.classList.remove('zen-chanting-open');
    };
  }, [isOpen]);

  // Keep keyboard focus inside the full-screen dialog and restore it on close.
  useEffect(() => {
    if (!isOpen) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeButtonRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { onClose(); return; }
      if (event.key !== 'Tab') return;
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])');
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      previousFocus?.focus();
    };
  }, [isOpen, onClose]);

  const malas = Math.floor(todayReps / malaTarget);

  const handleManualCount = useCallback(() => onCountOne(), [onCountOne]);

  if (!isOpen) return null;

  const content = (
    <AnimatePresence>
      <motion.div
        key="minimalist-chanting-view"
        initial={prefersReducedMotion ? false : { opacity: 0, y: '100%' }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: '100%' }}
        transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', damping: 28, stiffness: 280 }}
        className="fixed inset-0 flex flex-col justify-between overflow-hidden select-none"
        role="dialog"
        aria-modal="true"
        aria-label={`${title} chanting view`}
        tabIndex={-1}
        ref={dialogRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100dvh',
          zIndex: 99999,
          boxSizing: 'border-box',
          background: isDark
            ? 'radial-gradient(circle at 50% 22%, #0E2930 0%, #08171C 48%, #030A0D 100%)'
            : 'radial-gradient(circle at 50% 18%, #FFFDF9 0%, #F8F1E5 52%, #EDE0CC 100%)',
          color: isDark ? '#FFFFFF' : '#2C1D13',
        }}
      >
        {/* Subtle background temple arch vignette in light mode */}
        {!isDark && (
          <div
            className="absolute inset-0 pointer-events-none opacity-40"
            style={{
              background: 'radial-gradient(ellipse at 50% 0%, rgba(212, 175, 55, 0.25) 0%, transparent 70%)',
            }}
          />
        )}

        {/* ── TOP BAR: Minimize, Mode toggle, Target ──────────────────────── */}
        <header
          className="relative z-10 flex items-center justify-between w-full"
          style={{
            paddingTop: 'max(14px, env(safe-area-inset-top, 14px))',
            paddingLeft: 'max(24px, env(safe-area-inset-left, 24px))',
            paddingRight: 'max(24px, env(safe-area-inset-right, 24px))',
            paddingBottom: '6px',
            boxSizing: 'border-box',
          }}
        >
          {/* Minimize / Close back to library */}
          <button
            type="button"
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Back to Library"
            className="flex items-center gap-2 min-h-11 px-4 rounded-full text-sm font-bold transition-all shadow-sm active:scale-95 cursor-pointer flex-shrink-0"
            style={{
              background: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.88)',
              color: isDark ? '#FFE57F' : '#5A3810',
              border: `1.5px solid ${isDark ? 'rgba(255, 209, 71, 0.35)' : 'rgba(196, 151, 70, 0.45)'}`,
              boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <ChevronDown size={18} strokeWidth={2.5} />
            <span className="font-semibold tracking-wide">Library</span>
          </button>

          {/* Target Pill: switch 108 / 54 / 27 / 21 / 11 (only for counted mantras, NEVER for aartis) */}
          {!isAartiTrack ? <span className="text-xs font-semibold" aria-live="polite">Mala: {malaTarget}</span> : <div className="w-16" aria-hidden="true" />}

          {/* Theme switcher (Sun / Moon) to easily view both Dark & Light themes */}
          <button
            type="button"
            onClick={() => setThemeOverride((d) => !(d ?? resolvedInitial))}
            aria-label={isDark ? 'Switch to Sacred Ivory mode' : 'Switch to Midnight Gold mode'}
            className="w-11 h-11 grid place-items-center rounded-full transition-colors"
            style={{
              background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
              color: isDark ? '#FFD147' : '#6A4518',
            }}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </header>

        {!isAartiTrack && (
          <div className="relative z-10 grid grid-cols-5 gap-2 w-full max-w-sm mx-auto px-4" role="group" aria-label="Mala size">
            {MALA_OPTIONS.map((target) => (
              <button
                key={target}
                type="button"
                aria-pressed={malaTarget === target}
                onClick={() => onSelectTarget(target)}
                className="min-h-11 rounded-full text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  background: malaTarget === target ? (isDark ? '#FFD147' : '#A798A5') : (isDark ? 'rgba(255,255,255,.08)' : 'rgba(255,255,255,.75)'),
                  color: malaTarget === target ? (isDark ? '#17130A' : '#211A22') : (isDark ? '#FFFFFF' : '#332C34'),
                  border: `1px solid ${isDark ? 'rgba(255,209,71,.35)' : 'rgba(80,65,82,.3)'}`,
                }}
              >
                {target}
              </button>
            ))}
          </div>
        )}

        {/* ── TOP SACRED HEADER (Om Mandala + Mantra Title) ─────────────────── */}
        <SacredOmHeader isDark={isDark} title={title} deity={deity || subtitle} />

        {/* ── CENTERPIECE: SACRED CIRCULAR MALA OR AARTI SANCTUARY ─────────── */}
        {!isAartiTrack ? (
          <MalaCircle
            isDark={isDark}
            count={todayReps}
            target={malaTarget}
            malasCompleted={malas}
            onTapCount={handleManualCount}
            reducedMotion={prefersReducedMotion}
          />
        ) : (
          <AartiPlayerView
            isDark={isDark}
            currentTime={currentTime}
            duration={duration}
          />
        )}

        {/* ── BOTTOM CONTROLS (Reset · Play · Stop) ───────────────────────── */}
        <footer
          className="relative z-10 flex flex-col items-center px-6"
          style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom, 24px))' }}
        >
          {/* Main 3 Controls */}
          <div className="flex items-center justify-center gap-6 w-full max-w-xs">
            {/* Left: Reset Mala (⟲) — only for counted mantras, not aartis */}
            {!isAartiTrack ? (
              <button
                type="button"
                onClick={onReset}
                aria-label="Reset this mala to zero"
                title="Reset count to 0"
                className="w-13 h-13 rounded-full flex items-center justify-center transition-all active:scale-90"
                style={{
                  width: '52px',
                  height: '52px',
                  background: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.65)',
                  border: `1.5px solid ${isDark ? 'rgba(255, 209, 71, 0.35)' : 'rgba(196, 151, 70, 0.4)'}`,
                  color: isDark ? '#FFE082' : '#6A4518',
                  boxShadow: isDark ? '0 4px 16px rgba(0,0,0,0.5)' : '0 2px 10px rgba(0,0,0,0.06)',
                }}
              >
                <RotateCcw size={20} strokeWidth={2.2} />
              </button>
            ) : (
              <div className="w-[52px]" aria-hidden="true" />
            )}

            {/* Center: BIG GOLDEN PLAY / PAUSE BUTTON */}
            {isDark ? (
              // Dark mode: Golden pill button (Image 1)
              <button
                type="button"
                onClick={onTogglePlay}
                aria-label={playing ? 'Pause chanting audio' : 'Play chanting audio on loop'}
                className="group relative flex items-center justify-center transition-all active:scale-95 shadow-xl"
                style={{
                  width: '110px',
                  height: '58px',
                  borderRadius: '999px',
                  background: 'linear-gradient(135deg, #F9D37A 0%, #E5A83E 50%, #C98822 100%)',
                  boxShadow: '0 0 28px rgba(249, 211, 122, 0.42), 0 6px 18px rgba(0,0,0,0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                }}
              >
                {playing ? (
                  <Pause size={26} fill="#141E22" color="#141E22" />
                ) : (
                  <Play size={28} fill="#141E22" color="#141E22" className="ml-1" />
                )}
              </button>
            ) : (
              // Light mode: Golden circle play button (Image 2)
              <button
                type="button"
                onClick={onTogglePlay}
                aria-label={playing ? 'Pause chanting audio' : 'Play chanting audio on loop'}
                className="group relative flex items-center justify-center transition-all active:scale-95 shadow-lg"
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #FFF6E0 0%, #F0D095 55%, #D4A855 100%)',
                  boxShadow: '0 4px 18px rgba(184, 134, 11, 0.25), 0 2px 6px rgba(0,0,0,0.08)',
                  border: '1.5px solid rgba(196, 151, 70, 0.6)',
                }}
              >
                {playing ? (
                  <Pause size={24} fill="#422915" color="#422915" />
                ) : (
                  <Play size={26} fill="#422915" color="#422915" className="ml-0.5" />
                )}
              </button>
            )}

            {/* Right: Stop Button (■) */}
            <button
              type="button"
              onClick={onStop || onTogglePlay}
              aria-label="Stop playback"
              title="Stop"
              className="w-13 h-13 rounded-full flex items-center justify-center transition-all active:scale-90"
              style={{
                width: '52px',
                height: '52px',
                background: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.65)',
                border: `1.5px solid ${isDark ? 'rgba(255, 209, 71, 0.35)' : 'rgba(196, 151, 70, 0.4)'}`,
                color: isDark ? '#FFE082' : '#6A4518',
                boxShadow: isDark ? '0 4px 16px rgba(0,0,0,0.5)' : '0 2px 10px rgba(0,0,0,0.06)',
              }}
            >
              <Square size={18} fill="currentColor" />
            </button>
          </div>
        </footer>
      </motion.div>
    </AnimatePresence>
  );

  if (typeof document !== 'undefined') {
    return createPortal(content, document.body);
  }
  return content;
}

export default MinimalistChantingView;
