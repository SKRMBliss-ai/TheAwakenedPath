import { motion } from 'framer-motion';
import { chirpySprite } from './checkin/content';

/**
 * The "immersive" room treatment — opt-in via a room's `immersive: true`
 * flag (see rooms.ts), never applied to the original ten rooms. Two pieces:
 *
 *   AmbientLife    slow-drifting depth-layered light motes, so the painting
 *                  feels like a place with weather rather than a static
 *                  backdrop — distinct from the hub's four-pointed hover
 *                  sparkles (KidsWorld.tsx's CardSparklesOverlay), which are
 *                  a UI affordance, not world atmosphere.
 *   ChirpyInWorld   Chirpy as a small character living IN the scene, not
 *                   pinned to a UI bar — reuses his existing real sprite
 *                   frames, no new art.
 *
 * This is a visual-language trial for the Tier-1 immersion work, staged on
 * duplicate rooms (pause-lab, worry-lab) precisely so it can be judged
 * without touching anything already shipped.
 */

interface Mote {
  left: string;
  size: number;
  depth: number; // 0 = far/small/slow, 1 = near/large/fast
  delay: number;
  duration: number;
}

const MOTES: Mote[] = [
  { left: '12%', size: 5, depth: 0.2, delay: 0, duration: 9 },
  { left: '28%', size: 9, depth: 0.6, delay: 1.2, duration: 6.5 },
  { left: '46%', size: 4, depth: 0.15, delay: 2.4, duration: 10 },
  { left: '61%', size: 11, depth: 0.8, delay: 0.6, duration: 5.5 },
  { left: '74%', size: 6, depth: 0.4, delay: 3.1, duration: 8 },
  { left: '85%', size: 8, depth: 0.55, delay: 1.8, duration: 7 },
  { left: '19%', size: 7, depth: 0.5, delay: 4, duration: 7.5 },
  { left: '55%', size: 5, depth: 0.25, delay: 2.9, duration: 9.5 },
];

export function AmbientLife({ accent }: { accent: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {MOTES.map((m, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            left: m.left,
            bottom: '-5%',
            width: m.size,
            height: m.size,
            background: accent,
            opacity: 0.2 + m.depth * 0.35,
            filter: `blur(${(1 - m.depth) * 2}px)`,
          }}
          animate={{
            y: [0, -420 - m.depth * 260],
            x: [0, (i % 2 === 0 ? 1 : -1) * (14 + m.depth * 22), 0],
            opacity: [0, 0.2 + m.depth * 0.35, 0],
          }}
          transition={{ duration: m.duration, delay: m.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

export function ChirpyInWorld({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <motion.img
      src={chirpySprite('curious')}
      alt=""
      aria-hidden
      className="pointer-events-none absolute"
      style={{ left: '9%', bottom: '14%', width: 58, filter: 'drop-shadow(0 8px 18px rgba(0,0,0,0.45))' }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: [0, -6, 2, -3, 0], rotate: [0, -3, 2, -1, 0] }}
      transition={{
        opacity: { duration: 0.6 },
        y: { repeat: Infinity, duration: 4, ease: 'easeInOut', delay: 0.6 },
        rotate: { repeat: Infinity, duration: 4, ease: 'easeInOut', delay: 0.6 },
      }}
      draggable={false}
    />
  );
}
