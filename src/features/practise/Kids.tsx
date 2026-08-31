import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { sfx } from '../../lib/sfx';
import type { PracticeRoom } from './types';
import { usePractiseStore } from './store';
import { KIDS_ROOMS, type KidsRoom } from './content';
import { Session } from './Session';
import { Fade, PractiseShell, TopBar } from './ui';

/**
 * Kids Gym — a small, bright world of rooms to explore. Playful and safe; the
 * child feels "I'm learning how my mind works." Every room runs through the same
 * shared Session engine (variant="kids").
 */
export function KidsGym({ onExitGym }: { onExitGym: () => void }) {
  const { streak, practiceCount } = usePractiseStore();
  const [room, setRoom] = useState<PracticeRoom | null>(null);

  // Today's adventure rotates so it feels fresh each visit.
  const adventure = useMemo<KidsRoom>(() => {
    const day = Math.floor(Date.now() / 864e5);
    return KIDS_ROOMS[day % KIDS_ROOMS.length];
  }, []);

  if (room) {
    return <Session room={room} variant="kids" onExit={() => setRoom(null)} onComplete={() => {}} />;
  }

  const open = (r: KidsRoom) => { sfx.flip(); setRoom(r); };

  return (
    <PractiseShell variant="kids">
      <TopBar title="Kids Gym" onBack={onExitGym} right={
        <div className="flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold" style={{ background: 'var(--p-accent-soft)', color: 'var(--p-accent)' }}>
          🔥 {streak}
        </div>
      } />
      <Fade keyId="kids-home">
        <h1 className="text-2xl font-extrabold" style={{ color: 'var(--p-ink)' }}>Explore your Mind World 🌈</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--p-muted)' }}>
          {practiceCount > 0 ? `You’ve practised ${practiceCount} times. Amazing!` : 'Pick a room, or start today’s adventure.'}
        </p>

        {/* Today's adventure — the one big call to action */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => open(adventure)}
          className="mt-5 w-full overflow-hidden rounded-3xl p-5 text-left"
          style={{ background: `linear-gradient(135deg, ${adventure.tint}, var(--p-surface))`, border: '1px solid var(--p-line)' }}
        >
          <div className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: 'var(--p-accent)' }}>Today’s adventure</div>
          <div className="mt-1 flex items-center gap-3">
            <span className="text-4xl">{adventure.glyph}</span>
            <div>
              <div className="text-lg font-extrabold" style={{ color: 'var(--p-ink)' }}>{adventure.title}</div>
              <div className="text-[13px]" style={{ color: 'var(--p-muted)' }}>{adventure.whatPractising}</div>
            </div>
          </div>
        </motion.button>

        {/* Explore rooms grid */}
        <div className="mt-7 mb-2 text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: 'var(--p-muted)' }}>
          Explore rooms
        </div>
        <div className="grid grid-cols-3 gap-3">
          {KIDS_ROOMS.map((r) => (
            <motion.button
              key={r.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => open(r)}
              className="flex flex-col items-center gap-2 rounded-3xl px-2 py-4"
              style={{ background: r.tint, border: '1px solid var(--p-line)' }}
            >
              <span className="text-3xl">{r.glyph}</span>
              <span className="text-center text-[12px] font-bold leading-tight" style={{ color: 'var(--p-ink)' }}>{r.title}</span>
            </motion.button>
          ))}
        </div>
      </Fade>
    </PractiseShell>
  );
}
