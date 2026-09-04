import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useMotion } from './quiet';
import type { BodyZoneId } from './bodyZones';

/**
 * The body map — Body Detective room, P-02.
 *
 * A warm, rounded, entirely non-anatomical figure (a head, a torso capsule,
 * two soft "hand" shapes) rather than any medical or realistic body outline —
 * this is a feelings tool for a child, not a diagram. Tapping a zone lights
 * it with a warm glow and sends out a soft ripple; multiple zones can be lit
 * at once, because a feeling doesn't always live in just one place.
 *
 * The dashed pulsing ring is a SUGGESTION, never an answer: it marks where
 * other children sometimes notice this particular feeling, and the child is
 * exactly as free to tap somewhere else, tap nowhere, or tap everywhere.
 */

interface Ripple { id: number; cx: number; cy: number }
let rippleSeq = 0;

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

  const glow = (on: boolean) => (on ? 'url(#bodyGlow)' : 'rgba(255,255,255,0.15)');
  const suggestedPos =
    suggested === 'head' ? { cx: 100, cy: 46 } :
    suggested === 'chest' ? { cx: 100, cy: 108 } :
    suggested === 'tummy' ? { cx: 100, cy: 172 } :
    suggested === 'hands' ? { cx: 100, cy: 152 } : null;

  return (
    <div className="relative mx-auto" style={{ width: 210, height: 250 }}>
      <motion.svg
        viewBox="0 0 200 250"
        className="absolute inset-0 h-full w-full"
        aria-hidden
        // The whole figure breathes, slowly — "magical energy", not a
        // diagram. Off entirely in the quiet state, like every other loop.
        animate={m.loop ? { scale: [1, 1.018, 1] } : undefined}
        transition={m.loop ? { ...m.loop, duration: 5.2 } : undefined}
      >
        <defs>
          <radialGradient id="bodyGlow" cx="50%" cy="42%" r="65%">
            <stop offset="0%" stopColor={accent} stopOpacity="0.65" />
            <stop offset="100%" stopColor={accent} stopOpacity="0.05" />
          </radialGradient>
        </defs>

        {/* the figure itself — soft shapes, no anatomy */}
        <ellipse cx="46" cy="150" rx="22" ry="34" fill="rgba(255,255,255,0.12)" />
        <ellipse cx="154" cy="150" rx="22" ry="34" fill="rgba(255,255,255,0.12)" />
        <rect x="56" y="76" width="88" height="150" rx="44" fill="rgba(255,255,255,0.14)" />
        <circle cx="100" cy="44" r="32" fill="rgba(255,255,255,0.16)" />

        {suggestedPos && (
          <motion.circle
            cx={suggestedPos.cx}
            cy={suggestedPos.cy}
            r={36}
            fill="none"
            stroke={accent}
            strokeWidth={2}
            strokeDasharray="5 7"
            animate={{ opacity: [0.22, 0.6, 0.22] }}
            transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
          />
        )}

        {/* tap targets */}
        <circle
          cx="100" cy="44" r="34"
          fill={glow(selected.has('head'))}
          onClick={() => tap('head', 100, 44)}
          style={{ cursor: 'pointer' }}
          role="button"
          aria-label="Head"
        />
        <circle
          cx="100" cy="108" r="40"
          fill={glow(selected.has('chest'))}
          onClick={() => tap('chest', 100, 108)}
          style={{ cursor: 'pointer' }}
          role="button"
          aria-label="Chest"
        />
        <circle
          cx="100" cy="172" r="38"
          fill={glow(selected.has('tummy'))}
          onClick={() => tap('tummy', 100, 172)}
          style={{ cursor: 'pointer' }}
          role="button"
          aria-label="Tummy"
        />
        <ellipse
          cx="46" cy="150" rx="26" ry="38"
          fill={glow(selected.has('hands'))}
          onClick={() => tap('hands', 46, 150)}
          style={{ cursor: 'pointer' }}
          role="button"
          aria-label="Hands"
        />
        <ellipse
          cx="154" cy="150" rx="26" ry="38"
          fill={glow(selected.has('hands'))}
          onClick={() => tap('hands', 154, 150)}
          style={{ cursor: 'pointer' }}
          role="button"
          aria-label="Hands"
        />

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
