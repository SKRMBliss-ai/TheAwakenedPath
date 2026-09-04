import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useMotion } from './quiet';
import type { BodyZoneId } from './bodyZones';

/**
 * The body form — the second beat of the Reflection Room.
 *
 * A translucent, glowing, child-shaped presence rather than a body: rounded
 * head, soft torso, shoulders, arms and legs, all made of light. Nothing here
 * is anatomical and nothing should become so. A child noticing where a
 * feeling sits is doing something completely different from a patient
 * pointing at a diagram, and the picture has to make that obvious before it
 * has said a word.
 *
 * Tapping a place lights it and rings it with a soft ripple. Several places
 * can be lit at once, because a feeling doesn't politely stay in one spot.
 *
 * The dashed ring is a SUGGESTION and the copy that goes with it says so —
 * "some people notice this in their tummy". It never asserts that a feeling
 * belongs anywhere, because it doesn't.
 */

export type { BodyZoneId };

interface Zone {
  id: BodyZoneId;
  /** Where the glow, the ripple and the suggestion ring centre. */
  cx: number;
  cy: number;
  /** The tap target. Two entries where a zone has a left and a right. */
  targets: { cx: number; cy: number; rx: number; ry: number }[];
}

/**
 * The seven places, on a 200 × 300 stage. Targets are generous on purpose:
 * these are fingertips on a phone, and a near-miss that does nothing teaches
 * a child that they pointed at the wrong bit of themselves.
 */
const ZONES: Zone[] = [
  { id: 'head',      cx: 100, cy: 40,  targets: [{ cx: 100, cy: 40, rx: 32, ry: 32 }] },
  { id: 'throat',    cx: 100, cy: 78,  targets: [{ cx: 100, cy: 78, rx: 18, ry: 14 }] },
  { id: 'shoulders', cx: 100, cy: 100, targets: [
      { cx: 62, cy: 100, rx: 20, ry: 16 },
      { cx: 138, cy: 100, rx: 20, ry: 16 },
  ] },
  { id: 'chest',     cx: 100, cy: 132, targets: [{ cx: 100, cy: 132, rx: 36, ry: 28 }] },
  { id: 'tummy',     cx: 100, cy: 182, targets: [{ cx: 100, cy: 182, rx: 34, ry: 28 }] },
  { id: 'hands',     cx: 100, cy: 176, targets: [
      { cx: 44, cy: 176, rx: 20, ry: 26 },
      { cx: 156, cy: 176, rx: 20, ry: 26 },
  ] },
  { id: 'legs',      cx: 100, cy: 252, targets: [
      { cx: 80, cy: 252, rx: 20, ry: 42 },
      { cx: 120, cy: 252, rx: 20, ry: 42 },
  ] },
];

interface Ripple { id: number; cx: number; cy: number }
let rippleSeq = 0;

/** Motes drifting inside the form, so it reads as lit from within. */
const SPARKS = [
  { cx: 88, cy: 120, d: 5.5, delay: 0 },
  { cx: 116, cy: 168, d: 7, delay: 1.4 },
  { cx: 96, cy: 210, d: 6.2, delay: 2.6 },
  { cx: 108, cy: 62, d: 8, delay: 0.8 },
];

export function BodyMap({
  accent,
  selected,
  suggested,
  onToggle,
}: {
  accent: string;
  selected: Set<BodyZoneId>;
  suggested: BodyZoneId | null;
  onToggle: (zone: BodyZoneId) => void;
}) {
  const m = useMotion();
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const tap = (zone: BodyZoneId, cx: number, cy: number) => {
    onToggle(zone);
    const id = rippleSeq++;
    setRipples((r) => [...r, { id, cx, cy }]);
    window.setTimeout(() => setRipples((r) => r.filter((x) => x.id !== id)), 850);
  };

  const suggestedZone = suggested ? ZONES.find((z) => z.id === suggested) : null;

  return (
    <div className="relative mx-auto" style={{ width: 236, height: 320 }}>
      <motion.svg
        viewBox="0 0 200 300"
        className="absolute inset-0 h-full w-full"
        // The form breathes. Off in the quiet state, like every other loop.
        animate={m.loop ? { scale: [1, 1.02, 1] } : undefined}
        transition={m.loop ? { ...m.loop, duration: 5.6 } : undefined}
      >
        <defs>
          <radialGradient id="formFill" cx="50%" cy="34%" r="72%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.09" />
          </radialGradient>
          <radialGradient id="zoneGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={accent} stopOpacity="0.85" />
            <stop offset="70%" stopColor={accent} stopOpacity="0.28" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </radialGradient>
          <filter id="formBlur" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>

        {/* An aura, so the form sits in light rather than on a background. */}
        <g filter="url(#formBlur)" opacity="0.5">
          <ellipse cx="100" cy="150" rx="66" ry="130" fill={accent} opacity="0.22" />
        </g>

        {/* The child-shaped presence: head, throat, shoulders, torso, arms,
            legs. Soft joins, no anatomy, no outline of a real body. */}
        <g fill="url(#formFill)" stroke="rgba(255,255,255,0.34)" strokeWidth="1">
          <circle cx="100" cy="40" r="30" />
          <rect x="88" y="66" width="24" height="20" rx="11" />
          <rect x="52" y="86" width="96" height="34" rx="17" />
          <rect x="62" y="96" width="76" height="128" rx="36" />
          <rect x="30" y="104" width="26" height="86" rx="13" />
          <rect x="144" y="104" width="26" height="86" rx="13" />
          <ellipse cx="43" cy="196" rx="16" ry="19" />
          <ellipse cx="157" cy="196" rx="16" ry="19" />
          <rect x="66" y="212" width="28" height="82" rx="14" />
          <rect x="106" y="212" width="28" height="82" rx="14" />
        </g>

        {!m.quiet && SPARKS.map((s, i) => (
          <motion.circle
            key={i}
            cx={s.cx}
            r={2.2}
            fill="#FFF6DF"
            animate={{ cy: [s.cy, s.cy - 26, s.cy], opacity: [0, 0.8, 0] }}
            transition={{ repeat: Infinity, duration: s.d, delay: s.delay, ease: 'easeInOut' }}
          />
        ))}

        {/* Lit places. Drawn under the tap targets so a tap always lands. */}
        {ZONES.filter((z) => selected.has(z.id)).map((z) => (
          <g key={`glow-${z.id}`}>
            {z.targets.map((t, i) => (
              <motion.ellipse
                key={i}
                cx={t.cx}
                cy={t.cy}
                rx={t.rx * 1.15}
                ry={t.ry * 1.15}
                fill="url(#zoneGlow)"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                style={{ transformOrigin: `${t.cx}px ${t.cy}px` }}
              />
            ))}
          </g>
        ))}

        {suggestedZone && !selected.has(suggestedZone.id) && (
          <motion.circle
            cx={suggestedZone.cx}
            cy={suggestedZone.cy}
            r={34}
            fill="none"
            stroke={accent}
            strokeWidth={2}
            strokeDasharray="5 7"
            animate={{ opacity: [0.2, 0.55, 0.2] }}
            transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut' }}
          />
        )}

        {ZONES.map((z) =>
          z.targets.map((t, i) => (
            <ellipse
              key={`${z.id}-${i}`}
              cx={t.cx}
              cy={t.cy}
              rx={t.rx}
              ry={t.ry}
              fill="transparent"
              onClick={() => tap(z.id, t.cx, t.cy)}
              style={{ cursor: 'pointer' }}
              role="button"
              aria-label={z.id}
              aria-pressed={selected.has(z.id)}
            />
          )),
        )}

        <AnimatePresence>
          {ripples.map((r) => (
            <motion.circle
              key={r.id}
              cx={r.cx}
              cy={r.cy}
              r={8}
              fill="none"
              stroke={accent}
              strokeWidth={3}
              initial={{ opacity: 0.85, r: 8 }}
              animate={{ opacity: 0, r: 48 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          ))}
        </AnimatePresence>
      </motion.svg>
    </div>
  );
}
