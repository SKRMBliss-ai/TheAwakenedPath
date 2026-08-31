import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { RoomPalette } from './rooms';

/**
 * Room environments. Each is a layered SVG scene — far silhouettes, a middle
 * feature, a near foreground, and drifting light — so the room reads as a
 * place with depth rather than a background image.
 *
 * Every environment takes a 0→1 `progress`, and the world itself answers the
 * exercise: the Worry storm clears, the Kindness garden grows, the Pause
 * forest brightens. That is the whole design idea — the world is the UI, so
 * the child sees their practice happening in the room around them.
 */

/** Deterministic pseudo-random so particles never jump between renders. */
function useSeeded(n: number, seed: number) {
  return useMemo(
    () => Array.from({ length: n }, (_, i) => {
      const r = Math.sin(seed + i * 12.9898) * 43758.5453;
      const r2 = Math.sin(seed + i * 78.233) * 43758.5453;
      return { x: Math.abs(r % 1), y: Math.abs(r2 % 1), d: 3 + Math.abs((r * 7) % 5), i };
    }),
    [n, seed],
  );
}

/** The room's sky. Each environment defines its own `sky-grad` from its palette. */
function Sky() {
  return <rect x="0" y="0" width="400" height="700" fill="url(#sky-grad)" />;
}

/* ────────────────────────────────────────────────────────────────────────
   PAUSE ROOM — an enchanted forest with a waterfall and fireflies.
   The quietest world. Progress brightens the light and settles the water.
   ──────────────────────────────────────────────────────────────────────── */
export function PauseEnvironment({ palette, progress = 0 }: { palette: RoomPalette; progress?: number }) {
  const flies = useSeeded(14, 7);
  return (
    <svg viewBox="0 0 400 700" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
      <defs>
        <linearGradient id="sky-grad" x1="0" y1="0" x2="0" y2="1">
          {palette.sky.map((c, i) => (
            <stop key={i} offset={`${(i / (palette.sky.length - 1)) * 100}%`} stopColor={c} />
          ))}
        </linearGradient>
        <linearGradient id="fall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#DFFBF0" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#8FE9B8" stopOpacity="0.25" />
        </linearGradient>
        <radialGradient id="beam" cx="50%" cy="0%">
          <stop offset="0%" stopColor={palette.glow} stopOpacity={0.30 + progress * 0.22} />
          <stop offset="100%" stopColor={palette.glow} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="pond">
          <stop offset="0%" stopColor="#BFF5DC" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#1E5A46" stopOpacity="0.15" />
        </radialGradient>
      </defs>

      <Sky />

      {/* light shafts from the canopy */}
      <ellipse cx="200" cy="40" rx="240" ry="300" fill="url(#beam)" />

      {/* far canopy silhouettes */}
      <g opacity="0.5" fill="#08201A">
        <ellipse cx="60" cy="180" rx="90" ry="130" />
        <ellipse cx="330" cy="150" rx="100" ry="140" />
        <ellipse cx="200" cy="90" rx="130" ry="110" />
      </g>

      {/* waterfall */}
      <rect x="168" y="150" width="64" height="300" fill="url(#fall)" rx="30" />
      {[0, 1, 2].map((i) => (
        <motion.rect
          key={i}
          x={178 + i * 16} y={150} width="5" height="70" rx="3" fill="#FFFFFF" opacity="0.35"
          animate={{ y: [150, 430] }}
          transition={{ repeat: Infinity, duration: 2.4 - progress * 0.5, delay: i * 0.6, ease: 'linear' }}
        />
      ))}

      {/* mid trees */}
      <g fill="#0C3328">
        <ellipse cx="40" cy="330" rx="70" ry="150" />
        <ellipse cx="360" cy="310" rx="75" ry="160" />
      </g>

      {/* pond */}
      <ellipse cx="200" cy="500" rx="150" ry="52" fill="url(#pond)" />
      <motion.g
        style={{ transformOrigin: '200px 500px' }}
        animate={{ scale: [0.4, 1.5], opacity: [0.45, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: 'easeOut' }}
      >
        <ellipse cx="200" cy="500" rx="100" ry="34" fill="none" stroke={palette.glow} strokeWidth="1.5" />
      </motion.g>

      {/* stepping stones */}
      <g fill="#123F31">
        <ellipse cx="120" cy="545" rx="34" ry="13" />
        <ellipse cx="215" cy="570" rx="40" ry="15" />
        <ellipse cx="305" cy="540" rx="30" ry="12" />
      </g>

      {/* foreground moss bank */}
      <path d="M0 640 Q120 590 210 625 Q320 660 400 610 L400 700 L0 700 Z" fill="#0A2A21" />

      {/* fireflies */}
      {flies.map((f) => (
        <motion.circle
          key={f.i}
          cx={30 + f.x * 340}
          cy={220 + f.y * 380}
          r={1.8}
          fill="#FFE9A8"
          animate={{ opacity: [0.15, 0.9, 0.15], y: [0, -20, 0] }}
          transition={{ repeat: Infinity, duration: f.d, delay: f.i * 0.3, ease: 'easeInOut' }}
        />
      ))}
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   WORRY ROOM — a night mountain under storm cloud.
   progress 0 = storm, huge and loud. progress 1 = clear sky, stars, moon.
   ──────────────────────────────────────────────────────────────────────── */
export function WorryEnvironment({ palette, progress = 0 }: { palette: RoomPalette; progress?: number }) {
  const stars = useSeeded(26, 3);
  const clear = Math.min(1, Math.max(0, progress));
  return (
    <svg viewBox="0 0 400 700" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
      <defs>
        <linearGradient id="sky-grad" x1="0" y1="0" x2="0" y2="1">
          {palette.sky.map((c, i) => (
            <stop key={i} offset={`${(i / (palette.sky.length - 1)) * 100}%`} stopColor={c} />
          ))}
        </linearGradient>
        <radialGradient id="moonGlow">
          <stop offset="0%" stopColor="#FFF4D6" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#FFF4D6" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="lanternGlow">
          <stop offset="0%" stopColor="#FFD98A" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#FFD98A" stopOpacity="0" />
        </radialGradient>
      </defs>

      <Sky />

      {/* stars — fade in as the sky clears */}
      {stars.map((s) => (
        <motion.circle
          key={s.i}
          cx={10 + s.x * 380}
          cy={20 + s.y * 300}
          r={s.i % 5 === 0 ? 1.9 : 1.2}
          fill="#FFFFFF"
          animate={{ opacity: [0.1 * clear, 0.85 * clear, 0.1 * clear] }}
          transition={{ repeat: Infinity, duration: s.d, delay: s.i * 0.2 }}
        />
      ))}

      {/* moon — arrives with the calm */}
      <motion.g animate={{ opacity: clear }} transition={{ duration: 1.2 }}>
        <circle cx="305" cy="105" r="60" fill="url(#moonGlow)" />
        <circle cx="305" cy="105" r="26" fill="#FFF4D6" />
        <circle cx="292" cy="98" r="24" fill={palette.sky[0]} opacity="0.92" />
      </motion.g>

      {/* storm clouds — drift apart and thin out as the worry shrinks */}
      {[
        { cx: 90, cy: 130, rx: 120, ry: 55, dur: 22 },
        { cx: 300, cy: 90, rx: 140, ry: 60, dur: 28 },
        { cx: 200, cy: 175, rx: 165, ry: 62, dur: 25 },
      ].map((c, i) => (
        <motion.ellipse
          key={i}
          cx={c.cx} cy={c.cy} rx={c.rx} ry={c.ry}
          fill="#0D1638"
          animate={{
            opacity: 0.88 - clear * 0.8,
            x: [0, i % 2 ? 24 : -24, 0],
            scale: 1 - clear * 0.25,
          }}
          transition={{ opacity: { duration: 1.4 }, scale: { duration: 1.4 }, x: { repeat: Infinity, duration: c.dur, ease: 'easeInOut' } }}
        />
      ))}

      {/* lightning — only while the storm still holds */}
      {clear < 0.5 && (
        <motion.path
          d="M212 130 L196 186 L214 186 L192 246 L236 178 L216 178 L236 130 Z"
          fill="#DDE6FF"
          animate={{ opacity: [0, 0, 0.75, 0, 0] }}
          transition={{ repeat: Infinity, duration: 6, times: [0, 0.72, 0.76, 0.8, 1] }}
        />
      )}

      {/* mountain ranges */}
      <path d="M0 430 L80 300 L150 400 L215 285 L300 420 L360 340 L400 420 L400 700 L0 700 Z" fill="#101B44" />
      <path d="M0 500 L70 400 L160 490 L250 385 L330 470 L400 415 L400 700 L0 700 Z" fill="#1B2A5E" opacity="0.95" />
      <path d="M0 585 L90 505 L190 575 L290 500 L400 570 L400 700 L0 700 Z" fill="#25366F" />

      {/* the lantern Pip carries, glowing on the path */}
      <motion.circle
        cx="200" cy="620" r="70" fill="url(#lanternGlow)"
        animate={{ opacity: [0.55, 0.8, 0.55] }}
        transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
      />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   KINDNESS ROOM — a golden garden that literally grows with the child.
   progress 0 = a seed in bare earth. progress 1 = a blooming tree.
   ──────────────────────────────────────────────────────────────────────── */
export function KindnessEnvironment({ palette, progress = 0 }: { palette: RoomPalette; progress?: number }) {
  const motes = useSeeded(18, 11);
  const petals = useSeeded(12, 5);
  const g = Math.min(1, Math.max(0, progress));
  return (
    <svg viewBox="0 0 400 700" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
      <defs>
        <linearGradient id="sky-grad" x1="0" y1="0" x2="0" y2="1">
          {palette.sky.map((c, i) => (
            <stop key={i} offset={`${(i / (palette.sky.length - 1)) * 100}%`} stopColor={c} />
          ))}
        </linearGradient>
        <radialGradient id="sunGlow">
          <stop offset="0%" stopColor="#FFF3C4" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#FFF3C4" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="canopy">
          <stop offset="0%" stopColor="#9FE08A" />
          <stop offset="100%" stopColor="#3E8B45" />
        </radialGradient>
      </defs>

      <Sky />

      {/* warm sun */}
      <motion.circle
        cx="200" cy="120" r={130 + g * 40} fill="url(#sunGlow)"
        animate={{ opacity: [0.75, 0.95, 0.75] }}
        transition={{ repeat: Infinity, duration: 7, ease: 'easeInOut' }}
      />

      {/* rolling hills */}
      <path d="M0 520 Q110 460 220 515 Q320 560 400 505 L400 700 L0 700 Z" fill="#7A5218" />
      <path d="M0 570 Q120 520 230 565 Q330 605 400 560 L400 700 L0 700 Z" fill="#5E3E11" />

      {/* the tree — trunk and canopy scale with kindness shared. Sits left of
          centre so Pip, who stands centre-stage, is never behind it. */}
      <g style={{ transformOrigin: '118px 560px' }}>
        <motion.g animate={{ scale: 0.25 + g * 0.75, opacity: 0.35 + g * 0.65 }} transition={{ type: 'spring', stiffness: 40, damping: 14 }}>
          <path d="M111 560 L111 430 Q111 415 118 410 Q125 415 125 430 L125 560 Z" fill="#6B4A1E" />
          <path d="M118 470 L84 436" stroke="#6B4A1E" strokeWidth="7" strokeLinecap="round" />
          <path d="M118 452 L154 420" stroke="#6B4A1E" strokeWidth="7" strokeLinecap="round" />
          <circle cx="118" cy="392" r="76" fill="url(#canopy)" />
          <circle cx="70" cy="418" r="44" fill="url(#canopy)" />
          <circle cx="168" cy="416" r="46" fill="url(#canopy)" />
        </motion.g>
      </g>

      {/* flowers bloom along the hill as the garden grows */}
      {petals.map((p) => {
        const shown = g > (p.i + 1) / (petals.length + 2);
        return (
          <motion.g
            key={p.i}
            animate={{ opacity: shown ? 1 : 0, scale: shown ? 1 : 0.2 }}
            transition={{ type: 'spring', stiffness: 90, damping: 12, delay: shown ? p.i * 0.05 : 0 }}
            style={{ transformOrigin: `${30 + p.x * 340}px ${540 + p.y * 90}px` }}
          >
            <circle cx={30 + p.x * 340} cy={540 + p.y * 90} r="6" fill={p.i % 3 === 0 ? '#FF9EC4' : p.i % 3 === 1 ? '#FFD98A' : '#FFFFFF'} />
            <circle cx={30 + p.x * 340} cy={540 + p.y * 90} r="2.4" fill="#F0A93C" />
          </motion.g>
        );
      })}

      {/* golden motes drifting up */}
      {motes.map((m) => (
        <motion.circle
          key={m.i}
          cx={20 + m.x * 360}
          cy={640}
          r={1.6}
          fill="#FFE9A8"
          animate={{ y: [0, -380], opacity: [0, 0.85, 0] }}
          transition={{ repeat: Infinity, duration: 7 + m.d, delay: m.i * 0.55, ease: 'easeOut' }}
        />
      ))}

      {/* butterflies */}
      {[0, 1].map((i) => (
        <motion.g
          key={i}
          animate={{ x: [0, i ? -60 : 70, 0], y: [0, i ? 30 : -40, 0] }}
          transition={{ repeat: Infinity, duration: 12 + i * 4, ease: 'easeInOut' }}
        >
          <motion.path
            d={`M${i ? 300 : 110} ${i ? 340 : 300} q-11 -13 -20 -3 q9 10 20 3 q11 -13 20 -3 q-9 10 -20 3 Z`}
            fill={i ? '#FF9EC4' : '#FFD98A'}
            animate={{ scaleX: [1, 0.55, 1] }}
            transition={{ repeat: Infinity, duration: 0.5 }}
          />
        </motion.g>
      ))}
    </svg>
  );
}
