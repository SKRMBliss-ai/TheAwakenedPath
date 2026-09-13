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
 *
 * TWO WAYS TO FILL IT. Sparse (the default) gives each virtue exactly one
 * fixed spot — right for "which of the seven did I catch today", where
 * there is never more than one light per virtue and losing that
 * one-to-one mapping would misrepresent the day. Dense scatters every
 * entry `caught` actually holds, which can run into the hundreds — right
 * for a LIFETIME tally (best/LifetimeJar), where the whole point is that
 * it holds more than seven.
 */

/**
 * Warm white, not white. The jar is always drawn over a warm dark ground
 * (the amber portal door, the catch screen's night), and a neutral white at
 * this opacity goes grey against that — it reads as grey plastic rather
 * than glass with a lamp behind it.
 */
/*
  Was 0.44, which on the catch screen's mid-tone background was fine and on
  the hub's night sky was a ghost. Lifted to 0.72 so the glass reads as glass
  at 60px against the darkest thing in the app — still translucent, still
  clearly empty when it's empty, but present.
*/
const JAR_COLOR = 'rgba(255,238,206,0.72)';

/**
 * How many lights DENSE MODE actually draws, whatever the true total is.
 * Not a limit on what's true — the number a tap flies out (best/DraggableJar)
 * is always the real count — only on how many circles a jar the size of a
 * thumb can show as individual fireflies before they stop reading as
 * fireflies and start reading as a smear. Past this it's honestly dense
 * rather than honestly counted, and the real number is one tap away.
 */
const SWARM_CAP = 40;

/** The angle that keeps a phyllotaxis scatter from ever looking gridded. */
const GOLDEN_ANGLE = 2.399963229728653;

export function FireflyJar({
  caught,
  size = 96,
  /** The one just caught — flares brighter for a moment. Sparse mode only. */
  newest,
  /** Scatter every entry in `caught` instead of one per virtue slot. */
  dense = false,
}: {
  /** Behaviour ids, one per light. Dense mode allows repeats; sparse doesn't. */
  caught: string[];
  size?: number;
  newest?: string | null;
  dense?: boolean;
}) {
  const w = size;
  const h = size * 1.28;

  const lights = dense ? denseLights(caught) : sparseLights(caught);

  /*
    Dense mode's glow warms up with the total, on top of the dot-for-dot
    fill — so months of use still read as "more" even once the dots
    themselves have capped out at SWARM_CAP. Sparse mode keeps the plain
    on/off glow it always had: a single day's jar isn't trying to say "a
    lot", just "lit".
  */
  const glow = dense
    ? Math.min(0.58, caught.length ? 0.16 + caught.length * 0.012 : 0.05)
    : (caught.length ? 0.3 : 0.05);

  return (
    <svg width={w} height={h} viewBox="0 0 100 128" aria-hidden style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id="jarGlow" cx="50%" cy="62%" r="52%">
          <stop offset="0%" stopColor="#FFD98A" stopOpacity={glow} />
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

/**
 * One light per virtue, at that virtue's own fixed spot in the glass.
 * Fireflies sit in a lazy scatter seeded per virtue so a child's jar looks
 * the same each time they open it rather than reshuffling.
 */
function sparseLights(caught: string[]) {
  return caught
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
}

/**
 * As many lights as `caught` holds, up to SWARM_CAP, scattered by a
 * phyllotaxis spiral — the sunflower-seed pattern, evenly spread with no
 * two circles born at the same radius and angle — rather than
 * Math.random(), which would reshuffle the whole jar on every re-render.
 *
 * Downsampled with a fixed stride rather than truncated from the front, so
 * a jar over the cap still shows a mix of every virtue that's actually in
 * it, in roughly its true proportion, instead of whichever virtue happens
 * to sit first in the array.
 */
function denseLights(caught: string[]) {
  if (!caught.length) return [];
  const n = Math.min(SWARM_CAP, caught.length);
  const stride = caught.length / n;
  return Array.from({ length: n }, (_, i) => {
    const id = caught[Math.floor(i * stride)];
    const beh = BEHAVIOURS.find((b) => b.id === id);
    if (!beh) return null;
    const t = (i + 0.5) / n;
    const r = Math.sqrt(t);
    const a = i * GOLDEN_ANGLE;
    return {
      id: `${id}-${i}`,
      color: beh.color,
      x: 50 + Math.cos(a) * r * 20,
      y: 78 + Math.sin(a) * r * 28,
      delay: (i % 9) * 0.24,
      dur: 3 + (i % 5) * 0.5,
    };
  }).filter((l): l is NonNullable<typeof l> => l !== null);
}
