import { useState } from 'react';
import { motion } from 'framer-motion';
import { useMotion } from './quiet';
import * as sound from '../kit/sound';

/**
 * THE DOOR HANDLES — the Mind Gym's navigation, and not a button.
 *
 * A child leaving a room should feel they touched something in the world and
 * the world answered, not that they pressed Back. So the two controls on
 * every screen are physical fittings on the architecture: a brass lever at
 * each edge, left to go back, right to go on.
 *
 * WHY THE ROOM STAYS THE HERO. At rest the child sees almost nothing — a
 * seam of warm light at the very edge of the screen, the kind that leaks
 * around a closed door. The handle itself is nearly transparent and breathes
 * once every few seconds. Only when a finger comes near does it resolve out
 * of that light, brighten, and gather motes. The room is never dimmed to
 * make the controls legible (which is the usual, lazy fix); the controls
 * simply get out of the way until they are wanted.
 *
 * ONE ASSET, TWO MEANINGS. The right handle is drawn; the left is the same
 * drawing mirrored, a touch cooler and dimmer. They are identical by
 * construction rather than by discipline, so they cannot drift apart.
 *
 * THE QUIET STATE OPTS OUT ENTIRELY. A distressed child does not hunt for a
 * hidden control and is not soothed by particles. When quiet, the handle is
 * simply visible, still, and 64px — no breathing, no motes, no resolve-on-
 * approach. This is the one place the magic yields, and it is not optional.
 */

/** The lever swings this far when pressed. Small: it reads as weight, not spin. */
const PRESS_DEG = 9;

export function DoorHandle({
  side,
  label,
  onClick,
  /** The room's own accent, so the light belongs to the room it's in. */
  accent = '#FFD98A',
}: {
  side: 'left' | 'right';
  label: string;
  onClick: () => void;
  accent?: string;
}) {
  const m = useMotion();
  const [awake, setAwake] = useState(false);
  const [pressed, setPressed] = useState(false);

  // Forward is the brighter way; back is the same fitting, a little colder
  // and a little dimmer, the way the lit end of a corridor differs from the
  // end you came in by. No arrows, no words — just which way the light goes.
  const forward = side === 'right';
  const lit = m.quiet ? 0.85 : awake ? 1 : 0.42;
  const warmth = forward ? 1 : 0.82;

  function press() {
    if (pressed) return;
    setPressed(true);
    sound.play(forward ? 'enterRoom' : 'exitRoom');
    // The handle finishes its travel before the room changes — the world
    // acknowledging the touch is the point, and it takes a moment.
    window.setTimeout(onClick, m.quiet ? 420 : 300);
  }

  return (
    <div
      className="pointer-events-none absolute inset-y-0 z-20 flex items-center"
      style={{ [side]: 0 } as React.CSSProperties}
    >
      {/* The seam. Always there, doing the whole job on its own at rest —
          light leaking around a door that is definitely a door. */}
      <div
        aria-hidden
        className="absolute inset-y-0"
        style={{
          [side]: 0,
          width: 74,
          background: `linear-gradient(to ${side === 'left' ? 'right' : 'left'}, ${accent}${awake ? '3D' : '1F'} 0%, transparent 78%)`,
          transition: 'background 620ms ease-out',
        } as React.CSSProperties}
      />

      <motion.button
        onClick={press}
        onPointerEnter={() => setAwake(true)}
        onPointerLeave={() => setAwake(false)}
        onFocus={() => setAwake(true)}
        onBlur={() => setAwake(false)}
        aria-label={label}
        className="pointer-events-auto relative grid place-items-center"
        style={{
          [side]: 0,
          minWidth: m.target,
          minHeight: m.target,
          padding: '10px 2px',
          background: 'none',
          border: 'none',
        } as React.CSSProperties}
        animate={
          m.quiet
            ? { opacity: 0.85, x: 0 }
            : {
                opacity: [lit, lit * 0.86, lit],
                // Breathes out of the wall a hair when awake, so it reads as
                // an object with depth rather than a decal.
                x: awake ? (forward ? -3 : 3) : 0,
              }
        }
        transition={
          m.quiet
            ? { duration: 0.4 }
            : { opacity: { repeat: Infinity, duration: 4.2, ease: 'easeInOut' }, x: { duration: 0.5 } }
        }
      >
        <motion.div
          animate={{ rotate: pressed ? (forward ? PRESS_DEG : -PRESS_DEG) : 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 16 }}
          style={{
            // Turn about the rose, where a real lever pivots — not the
            // middle of the picture, which would look like it fell off.
            transformOrigin: forward ? '26% 50%' : '74% 50%',
            transform: forward ? undefined : 'scaleX(-1)',
            filter: `drop-shadow(0 0 ${awake ? 16 : 5}px ${accent}${awake ? 'AA' : '55'})`,
            transition: 'filter 520ms ease-out',
          }}
        >
          <HandleArt glow={m.quiet ? 0.6 : awake ? 1 : 0.3} warmth={warmth} accent={accent} />
        </motion.div>

        {/* Motes gather when a hand nears, and spiral away on the press.
            Never when quiet — a child who is upset is not charmed by these. */}
        {!m.quiet && (awake || pressed) && <Motes out={pressed} accent={accent} forward={forward} />}
      </motion.button>
    </div>
  );
}

/**
 * The fitting itself: an ornate backplate in aged brass over violet enamel,
 * gold filigree threaded with light, and an S-curved lever ending in a
 * scroll. Drawn rather than photographed so it takes the room's accent and
 * stays sharp at any size — the founder's rendered plate can replace the
 * <HandleArt> body later without touching a line of the behaviour above.
 */
function HandleArt({ glow, warmth, accent }: { glow: number; warmth: number; accent: string }) {
  const uid = `dh${Math.round(warmth * 100)}`;
  // Brass is brass in every room. Only the LIGHT inside it takes the room's
  // accent — tinting the metal itself made the fitting look like a different
  // object per room, which is exactly what the continuity note forbids.
  return (
    <svg width={72} height={118} viewBox="0 0 104 168" aria-hidden>
      <defs>
        <linearGradient id={`${uid}plate`} x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor="#F6DFA8" />
          <stop offset="26%" stopColor="#D8AC5C" />
          <stop offset="58%" stopColor="#A2762F" />
          <stop offset="100%" stopColor="#6A4A1B" />
        </linearGradient>
        <linearGradient id={`${uid}lever`} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#FBEDC6" />
          <stop offset="38%" stopColor="#DDB061" />
          <stop offset="100%" stopColor="#8C6224" />
        </linearGradient>
        <radialGradient id={`${uid}rose`} cx="38%" cy="34%" r="72%">
          <stop offset="0%" stopColor="#F8E3B2" />
          <stop offset="55%" stopColor="#C0913F" />
          <stop offset="100%" stopColor="#75521C" />
        </radialGradient>
      </defs>

      {/* Backplate — ogee top and bottom, stepped brass border. */}
      <path
        d="M32 3 Q13 22 13 46 L13 122 Q13 146 32 165 L52 165 Q71 146 71 122 L71 46 Q71 22 52 3 Z"
        fill={`url(#${uid}plate)`}
        stroke="#3E2C10"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M34 11 Q19 27 19 48 L19 120 Q19 141 34 157 L50 157 Q65 141 65 120 L65 48 Q65 27 50 11 Z"
        fill="none"
        stroke="#F3DCA6"
        strokeWidth="1.4"
        opacity="0.55"
      />
      {/* Violet enamel field. */}
      <path
        d="M36 17 Q24 31 24 50 L24 118 Q24 137 36 151 L48 151 Q60 137 60 118 L60 50 Q60 31 48 17 Z"
        fill="#33204F"
      />

      {/* Filigree — gold metal, with the room's light living in the channels. */}
      <g fill="none" strokeLinecap="round">
        <g stroke="#E8C07A" strokeWidth="2.4" opacity="0.9">
          <path d="M32 40 Q44 31 50 42 Q54 52 42 55 Q33 56 35 46" />
          <path d="M42 30 Q47 36 45 42" />
          <path d="M32 128 Q44 137 50 126 Q54 116 42 113 Q33 112 35 122" />
          <path d="M42 138 Q47 132 45 126" />
        </g>
        <g
          stroke={accent}
          strokeWidth="1.3"
          opacity={0.25 + glow * 0.75}
          style={{ transition: 'opacity 520ms ease-out' }}
        >
          <path d="M32 40 Q44 31 50 42 Q54 52 42 55 Q33 56 35 46" />
          <path d="M32 128 Q44 137 50 126 Q54 116 42 113 Q33 112 35 122" />
        </g>
      </g>

      {/* Bosses. */}
      <circle cx="42" cy="14" r="5" fill={`url(#${uid}rose)`} stroke="#3E2C10" strokeWidth="1.3" />
      <circle cx="42" cy="154" r="5" fill={`url(#${uid}rose)`} stroke="#3E2C10" strokeWidth="1.3" />

      {/* The rose the lever turns on. */}
      <circle cx="42" cy="84" r="22" fill={`url(#${uid}rose)`} stroke="#3E2C10" strokeWidth="2" />
      <circle cx="42" cy="84" r="15" fill="none" stroke="#7A5620" strokeWidth="1.4" opacity="0.8" />
      <circle
        cx="42"
        cy="84"
        r="8"
        fill={accent}
        opacity={0.2 + glow * 0.65}
        style={{ transition: 'opacity 520ms ease-out' }}
      />

      {/* The lever. Built from strokes rather than one filled outline: a
          round-capped stroke gives the swelling organic shaft and the scroll
          terminal cleanly, where a hand-written path kept reading spindly. */}
      <path
        d="M54 80 Q76 72 90 84 Q100 93 92 100 Q85 105 80 98"
        fill="none"
        stroke="#3E2C10"
        strokeWidth="19"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M54 80 Q76 72 90 84 Q100 93 92 100 Q85 105 80 98"
        fill="none"
        stroke={`url(#${uid}lever)`}
        strokeWidth="15.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Highlight along the lever's upper edge, so it reads as round metal. */}
      <path
        d="M58 75 Q76 69 88 80"
        fill="none"
        stroke="#FBEDC6"
        strokeWidth="3.4"
        strokeLinecap="round"
        opacity="0.72"
      />
      {/* The vine on the shaft, carrying the same light as the plate. */}
      <path
        d="M62 82 Q74 78 84 86"
        fill="none"
        stroke={accent}
        strokeWidth="1.7"
        strokeLinecap="round"
        opacity={0.25 + glow * 0.7}
        style={{ transition: 'opacity 520ms ease-out' }}
      />
    </svg>
  );
}

/**
 * Eight motes. They hang close and drift while a hand is near; on the press
 * they spiral outward through the frame. Deterministic offsets — random
 * numbers during render are a purity error, and a handle that sparkles
 * differently every paint reads as noise anyway.
 */
const MOTE = Array.from({ length: 8 }, (_, i) => ({
  a: (i / 8) * Math.PI * 2,
  d: 26 + ((i * 17) % 22),
  s: 3 + ((i * 7) % 3),
  delay: (i % 4) * 0.06,
}));

function Motes({ out, accent, forward }: { out: boolean; accent: string; forward: boolean }) {
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center">
      {MOTE.map((p, i) => (
        <motion.span
          key={i}
          className="absolute block rounded-full"
          style={{ width: p.s, height: p.s, background: accent, boxShadow: `0 0 9px ${accent}` }}
          initial={{ x: 0, y: 0, opacity: 0 }}
          animate={
            out
              ? {
                  x: Math.cos(p.a) * p.d * 2.4 * (forward ? 1 : -1),
                  y: Math.sin(p.a) * p.d * 1.7,
                  opacity: [0.9, 0],
                  scale: [1, 0.3],
                }
              : {
                  x: [0, Math.cos(p.a) * p.d * 0.5, 0],
                  y: [0, Math.sin(p.a) * p.d * 0.4, 0],
                  opacity: [0, 0.75, 0],
                }
          }
          transition={
            out
              ? { duration: 0.75, ease: 'easeOut', delay: p.delay }
              : { repeat: Infinity, duration: 3 + (i % 3) * 0.5, delay: p.delay, ease: 'easeInOut' }
          }
        />
      ))}
    </span>
  );
}
