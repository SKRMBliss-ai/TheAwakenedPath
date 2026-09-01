import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { sfx } from '../../lib/sfx';
import type { Variant } from './ui';

/**
 * A calm guided-breath orb — inhale 4 · hold 2 · exhale 6. Used by the
 * "create space" step in both gyms (PRODUCT_VISION §6 — space before
 * reacting). Adult renders as the cosmic glowing orb from the meditation
 * mockups; Kids renders as a warm, smiling bubble.
 */

type Phase = { label: string; secs: number; scale: number };
const CYCLE: Phase[] = [
  { label: 'Breathe in', secs: 4, scale: 1 },
  { label: 'Hold', secs: 2, scale: 1 },
  { label: 'Breathe out', secs: 6, scale: 0.55 },
];

export function BreathOrb({ onDone, variant = 'adult' }: { onDone?: () => void; variant?: Variant }) {
  const [i, setI] = useState(0);
  const [rounds, setRounds] = useState(0);
  const phase = CYCLE[i];
  const kids = variant === 'kids';

  useEffect(() => {
    const t = setTimeout(() => {
      const next = (i + 1) % CYCLE.length;
      if (next === 0) { setRounds((r) => r + 1); sfx.twinkle(); }
      else sfx.tap();
      setI(next);
    }, phase.secs * 1000);
    return () => clearTimeout(t);
  }, [i, phase.secs]);

  const outerBg = kids
    ? 'radial-gradient(circle at 38% 32%, #FFE3B0, #FF9640 60%, #E8763A 100%)'
    : 'radial-gradient(circle at 32% 28%, #E9D6FF 0%, #B47CF0 24%, #7C4FE0 52%, #4A2E9E 78%, #2A1B5E 100%)';
  const innerBg = kids ? '#FF9640' : '#5F35C9';
  const glow = kids ? '0 0 50px rgba(255,150,64,0.45)' : '0 0 60px rgba(140,90,230,0.5)';

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <div className="relative grid h-56 w-56 place-items-center">
        <motion.div
          className="absolute rounded-full"
          animate={{ scale: phase.scale, opacity: i === 2 ? 0.4 : 0.7 }}
          transition={{ duration: phase.secs, ease: 'easeInOut' }}
          style={{ width: 208, height: 208, background: outerBg, boxShadow: glow }}
        />
        <motion.div
          className="absolute rounded-full"
          animate={{ scale: phase.scale * 0.7 }}
          transition={{ duration: phase.secs, ease: 'easeInOut' }}
          style={{ width: 150, height: 150, background: innerBg, opacity: 0.85 }}
        />
        <div className="relative z-10 text-center text-white">
          {kids && <div className="mb-1 text-2xl">{i === 2 ? '😌' : '😊'}</div>}
          <div className="text-lg font-semibold drop-shadow">{phase.label}</div>
          <div className="text-sm opacity-90">{phase.secs}s</div>
        </div>
      </div>
      <div className="text-center text-[13px]" style={{ color: 'var(--p-muted)' }}>
        {rounds < 2 ? (kids ? 'Breathe with the bubble a couple of times…' : 'Follow the orb for a couple of rounds…') : (kids ? 'Great breathing! Whenever you’re ready.' : 'Lovely. Whenever you’re ready.')}
      </div>
      {onDone && (
        <button
          onClick={onDone}
          className="rounded-full px-5 py-2 text-sm font-semibold text-white transition active:scale-95"
          style={{ background: kids ? 'var(--p-accent)' : 'var(--p-accent)', opacity: rounds < 1 ? 0.5 : 1 }}
        >
          {rounds < 1 ? 'Keep breathing…' : 'Continue'}
        </button>
      )}
    </div>
  );
}
