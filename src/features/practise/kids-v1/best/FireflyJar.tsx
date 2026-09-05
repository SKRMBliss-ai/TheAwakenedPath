import { motion } from 'framer-motion';
import { VIRTUE_ROOMS } from './rooms';
import { BEHAVIOURS } from '../../../kids/data';

/**
 * THE JAR.
 *
 * Seven virtues, seven fireflies. Every one a child catches today is a light
 * in the jar, in that virtue's own colour, drifting about on its own.
 *
 * WHY A JAR AND NOT A PROGRESS BAR. A bar that fills to seven says the target
 * is seven and anything less is a shortfall. A jar with two fireflies in it
 * is just a jar with two fireflies in it — pretty, worth looking at, and not
 * obviously missing five. The empty space stays unmarked: no ghosts, no
 * dotted outlines of the ones not caught, nothing that counts what isn't
 * there. That is the whole reason this shape was chosen over the obvious one.
 *
 * Used at two sizes: small on the hub card, large on the catch screen.
 */

/**
 * Warm white, not white. The jar is always drawn over a warm dark ground
 * (the amber portal door, the catch screen's night), and a neutral white at
 * this opacity goes grey against that — it reads as grey plastic rather
 * than glass with a lamp behind it.
 */
const JAR_COLOR = 'rgba(255,238,206,0.44)';

export function FireflyJar({
  caught,
  size = 96,
  /** The one just caught — flares brighter for a moment. */
  newest,
}: {
  /** Behaviour ids ticked today. Order doesn't matter; colour does. */
  caught: string[];
  size?: number;
  newest?: string | null;
}) {
  const w = size;
  const h = size * 1.28;

  // Fireflies sit in a lazy scatter inside the glass, seeded per virtue so a
  // child's jar looks the same each time they open it rather than reshuffling.
  const lights = caught
    .map((id) => {
      const beh = BEHAVIOURS.find((b) => b.id === id);
      const idx = VIRTUE_ROOMS.findIndex((r) => r.id === id);
      if (!beh || idx < 0) return null;
      const col = idx % 3;
      const row = Math.floor(idx / 3);
      return {
        id,
        color: beh.color,
        x: 26 + col * 24 + (idx % 2 ? 5 : -4),
        y: 58 + row * 22 + (idx % 3 === 1 ? 6 : 0),
        delay: idx * 0.43,
        dur: 3.4 + (idx % 4) * 0.6,
      };
    })
    .filter((l): l is NonNullable<typeof l> => l !== null);

  return (
    <svg width={w} height={h} viewBox="0 0 100 128" aria-hidden style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id="jarGlow" cx="50%" cy="62%" r="52%">
          <stop offset="0%" stopColor="#FFD98A" stopOpacity={caught.length ? 0.3 : 0.05} />
          <stop offset="100%" stopColor="#FFD98A" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* The warm pool the jar throws, if there's anything in it. */}
      <ellipse cx="50" cy="78" rx="46" ry="42" fill="url(#jarGlow)" />

      {/* Lid and glass — thin, empty, unfussy. */}
      <rect x="34" y="10" width="32" height="10" rx="4" fill="none" stroke={JAR_COLOR} strokeWidth="2.4" />
      <path
        d="M38 20 L38 30 Q22 40 22 60 L22 104 Q22 116 34 116 L66 116 Q78 116 78 104 L78 60 Q78 40 62 30 L62 20"
        fill="rgba(255,255,255,0.05)"
        stroke={JAR_COLOR}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* A highlight down the glass, so it reads as glass. */}
      <path d="M31 52 Q28 62 28 78 L28 100" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="3" strokeLinecap="round" />

      {lights.map((l) => (
        <motion.g
          key={l.id}
          animate={{ x: [0, 5, -3, 2, 0], y: [0, -6, 3, -4, 0] }}
          transition={{ repeat: Infinity, duration: l.dur, delay: l.delay, ease: 'easeInOut' }}
        >
          <motion.circle
            cx={l.x}
            cy={l.y}
            r={l.id === newest ? 5.5 : 4}
            fill={l.color}
            animate={{ opacity: l.id === newest ? [1, 0.75, 1] : [0.62, 1, 0.62] }}
            transition={{ repeat: Infinity, duration: 2.1, delay: l.delay * 0.6, ease: 'easeInOut' }}
            style={{ filter: `drop-shadow(0 0 ${l.id === newest ? 12 : 7}px ${l.color})` }}
          />
        </motion.g>
      ))}
    </svg>
  );
}

/** The knot, for the other journey. Two threads, one snagged, one loose. */
export function KnotMark({ size = 96, untangled = false }: { size?: number; untangled?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden>
      <motion.path
        d={untangled
          ? 'M24 30 Q50 26 76 30'
          : 'M24 26 Q46 30 40 46 Q34 62 54 62 Q74 62 66 44'}
        fill="none"
        stroke="#B98CE0"
        strokeWidth="6"
        strokeLinecap="round"
        animate={{ pathLength: [0.92, 1, 0.92] }}
        transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut' }}
      />
      <motion.path
        d={untangled
          ? 'M24 62 Q50 66 76 62'
          : 'M30 74 Q52 78 62 66 Q72 54 56 48 Q42 43 48 32'}
        fill="none"
        stroke="#FFD98A"
        strokeWidth="6"
        strokeLinecap="round"
        animate={{ pathLength: [1, 0.94, 1] }}
        transition={{ repeat: Infinity, duration: 5.2, ease: 'easeInOut' }}
      />
    </svg>
  );
}
