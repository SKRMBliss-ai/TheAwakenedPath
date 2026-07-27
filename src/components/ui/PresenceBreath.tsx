import { motion, useReducedMotion } from 'framer-motion';
import { useTheme } from '../../theme/ThemeSystem';

interface Props {
  size?: number;
  /** Show the "Presence is your power · MIND GYM" caption beneath the orb. */
  showCaption?: boolean;
  /** Force light/dark appearance, for surfaces rendered outside the ThemeProvider. */
  forceMode?: 'dark' | 'light';
}

/**
 * PresenceBreath — a soft glowing orb that slowly expands and contracts at a
 * calm breath pace (inhale ~4s, gentle hold, exhale ~5s). Replaces the old
 * faceted diamond hero. Deliberately lightweight: it animates only `transform`
 * + `opacity` on a single layer (compositor-friendly), uses radial-gradient
 * glows instead of animated blur filters, and goes fully static when the user
 * prefers reduced motion — so it stays smooth on slow phones.
 */
export function PresenceBreath({ size = 220, showCaption = true, forceMode }: Props) {
  const { mode: ctxMode } = useTheme();
  const mode = forceMode ?? ctxMode;
  const isDark = mode === 'dark';
  const reduce = useReducedMotion();

  // teal-smoke as an "r,g,b" string so we can vary alpha inline
  const teal = isDark ? '180,205,205' : '62,111,109';
  const accent = isDark ? '#CFC2CD' : '#8C7B8A';

  const breathe = reduce
    ? undefined
    : { scale: [0.82, 1, 1, 0.82], opacity: [0.8, 1, 1, 0.8] };
  const breatheTransition = {
    duration: 10,
    times: [0, 0.4, 0.5, 1], // inhale → hold → exhale
    repeat: Infinity,
    ease: 'easeInOut' as const,
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className="flex items-center justify-center"
        style={{ width: size, height: size, position: 'relative' }}
      >
        {/* Ambient halo — static, cheap radial gradient */}
        <div
          aria-hidden
          style={{
            position: 'absolute', inset: '-6%', borderRadius: '50%', pointerEvents: 'none',
            background: `radial-gradient(circle, rgba(${teal},${isDark ? 0.22 : 0.17}) 0%, rgba(${teal},${isDark ? 0.07 : 0.06}) 42%, transparent 72%)`,
          }}
        />

        {/* Breathing group — only this layer animates (scale + opacity) */}
        <motion.div
          animate={breathe}
          transition={breatheTransition}
          style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            willChange: 'transform',
          }}
        >
          {/* Outer ring */}
          <div style={{
            position: 'absolute', width: '92%', height: '92%', borderRadius: '50%',
            border: `1.5px solid rgba(${teal},${isDark ? 0.45 : 0.52})`,
          }} />
          {/* Middle ring */}
          <div style={{
            position: 'absolute', width: '66%', height: '66%', borderRadius: '50%',
            border: `1.5px solid rgba(${teal},${isDark ? 0.58 : 0.64})`,
          }} />
          {/* Core orb */}
          <div style={{
            width: '46%', height: '46%', borderRadius: '50%',
            background: `radial-gradient(circle at 50% 44%, rgba(${teal},${isDark ? 0.72 : 0.55}) 0%, rgba(${teal},${isDark ? 0.3 : 0.26}) 52%, transparent 80%)`,
          }} />
        </motion.div>

        {/* Still center point — anchors the calm, with a soft glow */}
        <div style={{
          width: 8, height: 8, borderRadius: '50%', position: 'relative', zIndex: 2,
          background: isDark ? '#eafffb' : '#695E68',
          boxShadow: `0 0 14px 2px rgba(${teal},${isDark ? 0.75 : 0.5})`,
        }} />
      </div>

      {/* Tagline */}
      {showCaption && (
        <div className="text-center mt-3">
          <p className="font-serif text-[19px] font-light leading-snug" style={{ color: 'var(--text-primary)' }}>
            Presence is
          </p>
          <p className="font-serif text-[19px] italic font-light" style={{ color: accent }}>
            your power.
          </p>
          <p className="font-sans text-[8px] font-bold tracking-[.32em] uppercase mt-2" style={{ color: 'var(--text-muted)', opacity: 0.55 }}>
            MIND GYM
          </p>
        </div>
      )}
    </div>
  );
}
