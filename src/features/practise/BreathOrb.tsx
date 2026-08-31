import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * A calm guided-breath orb — inhale 4 · hold 2 · exhale 6. No audio, no
 * dependencies; the orb simply breathes with the user. Used by the "create
 * space" step in both gyms (PRODUCT_VISION §6 — space before reacting).
 */

type Phase = { label: string; secs: number; scale: number };
const CYCLE: Phase[] = [
  { label: 'Breathe in', secs: 4, scale: 1 },
  { label: 'Hold', secs: 2, scale: 1 },
  { label: 'Breathe out', secs: 6, scale: 0.55 },
];

export function BreathOrb({ onDone }: { onDone?: () => void }) {
  const [i, setI] = useState(0);
  const [rounds, setRounds] = useState(0);
  const phase = CYCLE[i];

  useEffect(() => {
    const t = setTimeout(() => {
      const next = (i + 1) % CYCLE.length;
      if (next === 0) setRounds((r) => r + 1);
      setI(next);
    }, phase.secs * 1000);
    return () => clearTimeout(t);
  }, [i, phase.secs]);

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <div className="relative grid h-56 w-56 place-items-center">
        <motion.div
          className="absolute rounded-full"
          animate={{ scale: phase.scale, opacity: i === 2 ? 0.35 : 0.6 }}
          transition={{ duration: phase.secs, ease: 'easeInOut' }}
          style={{
            width: 208,
            height: 208,
            background:
              'radial-gradient(circle at 50% 40%, var(--p-accent-soft), var(--p-accent))',
          }}
        />
        <motion.div
          className="absolute rounded-full"
          animate={{ scale: phase.scale * 0.7 }}
          transition={{ duration: phase.secs, ease: 'easeInOut' }}
          style={{ width: 150, height: 150, background: 'var(--p-accent)', opacity: 0.9 }}
        />
        <div className="relative z-10 text-center text-white">
          <div className="text-lg font-semibold drop-shadow">{phase.label}</div>
          <div className="text-sm opacity-90">{phase.secs}s</div>
        </div>
      </div>
      <div className="text-center text-[13px]" style={{ color: 'var(--p-muted)' }}>
        {rounds < 2 ? 'Follow the orb for a couple of rounds…' : 'Lovely. Whenever you’re ready.'}
      </div>
      {onDone && (
        <button
          onClick={onDone}
          className="rounded-full px-5 py-2 text-sm font-semibold text-white transition active:scale-95"
          style={{ background: 'var(--p-accent)', opacity: rounds < 1 ? 0.5 : 1 }}
        >
          {rounds < 1 ? 'Keep breathing…' : 'Continue'}
        </button>
      )}
    </div>
  );
}
