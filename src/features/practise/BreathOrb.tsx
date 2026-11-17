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
  const [left, setLeft] = useState(CYCLE[0].secs);

  useEffect(() => {
    const t = setTimeout(() => {
      const next = (i + 1) % CYCLE.length;
      if (next === 0) { setRounds((r) => r + 1); sfx.twinkle(); }
      else sfx.tap();
      setI(next);
    }, phase.secs * 1000);
    return () => clearTimeout(t);
  }, [i, phase.secs]);

  // Live countdown for the current phase.
  useEffect(() => {
    setLeft(phase.secs);
    const t = setInterval(() => setLeft((n) => Math.max(1, n - 1)), 1000);
    return () => clearInterval(t);
  }, [i, phase.secs]);

  const outerBg = kids
    ? 'radial-gradient(circle at 38% 32%, #FFE3B0, #FF9640 60%, #E8763A 100%)'
    : 'radial-gradient(circle at 34% 28%, #CFEBDD 0%, #7FC4A3 38%, #2E7D5B 78%, #1F5C42 100%)';
  const innerBg = kids ? '#FF9640' : 'rgba(255,255,255,0.18)';
  const glow = kids ? '0 0 50px rgba(255,150,64,0.45)' : '0 12px 50px rgba(46,125,91,0.35)';
  const scale = Math.max(phase.scale, 0.62);

  return (
    <div className="flex flex-col items-center gap-5 py-4">
      <div className="relative grid h-60 w-60 place-items-center">
        {/* faint ring = full size, so the shrink and swell read clearly */}
        <div className="absolute rounded-full" style={{ width: 224, height: 224, border: '1.5px dashed var(--p-line)' }} />
        <motion.div
          className="absolute rounded-full"
          animate={{ scale }}
          transition={{ duration: phase.secs, ease: 'easeInOut' }}
          style={{ width: 208, height: 208, background: outerBg, boxShadow: glow }}
        />
        <motion.div
          className="absolute rounded-full"
          animate={{ scale: scale * 0.62 }}
          transition={{ duration: phase.secs, ease: 'easeInOut' }}
          style={{ width: 150, height: 150, background: innerBg }}
        />
        {/* fixed-size countdown: never scales, so it can't overflow */}
        <div className="relative z-10 text-center text-white" aria-hidden>
          {kids && <div className="mb-1 text-2xl">{i === 2 ? '😌' : '😊'}</div>}
          <div className="text-4xl font-semibold tabular-nums drop-shadow">{left}</div>
        </div>
      </div>
      <div className="text-center" role="status" aria-live="polite">
        <div className="text-xl font-semibold" style={{ color: 'var(--p-ink)' }}>{phase.label}</div>
      </div>
      <div className="text-center text-[13px]" style={{ color: 'var(--p-muted)' }}>
        {rounds < 2 ? (kids ? 'Breathe with the bubble a couple of times…' : 'Follow the orb for a couple of rounds…') : (kids ? 'Great breathing! Whenever you’re ready.' : 'Lovely. Whenever you’re ready.')}
      </div>
      {onDone && (
        <button
          onClick={onDone}
          className="min-h-[44px] rounded-full px-5 py-2 text-sm font-semibold text-white transition active:scale-95"
          style={{ background: 'var(--p-accent-fill, var(--p-accent))', opacity: rounds < 1 ? 0.5 : 1 }}
        >
          {rounds < 1 ? 'Keep breathing…' : 'Continue'}
        </button>
      )}
    </div>
  );
}
