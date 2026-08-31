import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { sfx } from '../../lib/sfx';
import type { PracticeRoom } from './types';
import { usePractiseStore } from './store';
import { KIDS_ROOMS, type KidsRoom } from './content';
import { Session } from './Session';
import { Fade, LevelBadge, PractiseShell, RingAvatar, TopBar } from './ui';

/**
 * Kids Gym — a small, bright world of rooms to explore. Playful and safe; the
 * child feels "I'm learning how my mind works." Every room runs through the same
 * shared Session engine (variant="kids"). Styled after the panda / feelings
 * mockups: warm cream background, ring-avatar mood picker, gamified badge.
 */

const MOODS: { id: string; glyph: string; label: string; color: string }[] = [
  { id: 'excited', glyph: '🤩', label: 'Excited', color: '#FF9640' },
  { id: 'happy', glyph: '😄', label: 'Happy', color: '#3FB37F' },
  { id: 'calm', glyph: '😌', label: 'Calm', color: '#5FA8E8' },
  { id: 'scared', glyph: '😟', label: 'Scared', color: '#E85F7A' },
];

export function KidsGym({ onExitGym }: { onExitGym: () => void }) {
  const { streak, practiceCount } = usePractiseStore();
  const [room, setRoom] = useState<PracticeRoom | null>(null);
  const [mood, setMood] = useState<string | null>(null);

  // Today's adventure rotates so it feels fresh each visit.
  const adventure = useMemo<KidsRoom>(() => {
    const day = Math.floor(Date.now() / 864e5);
    return KIDS_ROOMS[day % KIDS_ROOMS.length];
  }, []);

  if (room) {
    return <Session room={room} variant="kids" onExit={() => setRoom(null)} onComplete={() => {}} />;
  }

  const open = (r: KidsRoom) => { sfx.flip(); setRoom(r); };
  const pickMood = (id: string) => { sfx.bell(); setMood(id); };

  return (
    <PractiseShell variant="kids">
      <TopBar title="Kids Gym" onBack={onExitGym} right={<LevelBadge level={Math.max(1, Math.floor(practiceCount / 5) + 1)} points={practiceCount * 5} />} />
      <Fade keyId="kids-home">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold" style={{ color: 'var(--p-ink)' }}>Explore your Mind World 🌈</h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--p-muted)' }}>
              {practiceCount > 0 ? `You’ve practised ${practiceCount} times. Amazing!` : 'Pick a room, or start today’s adventure.'}
            </p>
          </div>
        </div>

        {/* How are you feeling right now? — ring-avatar mood picker */}
        <div
          className="relative mt-5 overflow-hidden rounded-3xl px-4 py-5"
          style={{ background: 'var(--p-surface)', border: '1px solid var(--p-line)' }}
        >
          <div
            className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full opacity-40"
            style={{ background: 'radial-gradient(circle, var(--p-accent-soft), transparent 70%)' }}
          />
          <div className="mb-3 text-[13px] font-bold" style={{ color: 'var(--p-ink)' }}>How are you feeling right now?</div>
          <div className="flex items-center justify-between gap-2">
            {MOODS.map((m) => (
              <RingAvatar key={m.id} glyph={m.glyph} label={m.label} ringColor={m.color} selected={mood === m.id} onClick={() => pickMood(m.id)} size={56} />
            ))}
          </div>
          {mood && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 text-center text-[12px] font-semibold"
              style={{ color: 'var(--p-accent)' }}
            >
              Thanks for sharing! Let’s find a room for that. 💛
            </motion.p>
          )}
        </div>

        {/* Today's adventure — the one big call to action */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => open(adventure)}
          className="relative mt-4 w-full overflow-hidden rounded-3xl p-5 text-left"
          style={{ background: `linear-gradient(135deg, ${adventure.tint}, var(--p-surface))`, border: '1px solid var(--p-line)' }}
        >
          <div
            className="pointer-events-none absolute -right-5 -bottom-8 h-28 w-28 rounded-full opacity-50"
            style={{ background: 'radial-gradient(circle, var(--p-accent-soft), transparent 70%)' }}
          />
          <div className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: 'var(--p-accent)' }}>Today’s adventure</div>
          <div className="mt-1 flex items-center gap-3">
            <span className="grid h-14 w-14 flex-shrink-0 place-items-center rounded-2xl text-3xl" style={{ background: 'var(--p-surface)' }}>
              {adventure.glyph}
            </span>
            <div>
              <div className="text-lg font-extrabold" style={{ color: 'var(--p-ink)' }}>{adventure.title}</div>
              <div className="text-[13px]" style={{ color: 'var(--p-muted)' }}>{adventure.whatPractising}</div>
            </div>
          </div>
        </motion.button>

        {/* Explore rooms grid — big circular icon buttons */}
        <div className="mt-7 mb-2 text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: 'var(--p-muted)' }}>
          Explore rooms
        </div>
        <div className="grid grid-cols-3 gap-3">
          {KIDS_ROOMS.map((r) => (
            <motion.button
              key={r.id}
              whileTap={{ scale: 0.94 }}
              whileHover={{ y: -2 }}
              onClick={() => open(r)}
              className="flex flex-col items-center gap-2 rounded-3xl px-2 py-4"
              style={{ background: 'var(--p-surface)', border: '1px solid var(--p-line)' }}
            >
              <span
                className="grid h-14 w-14 place-items-center rounded-full text-2xl"
                style={{ background: r.tint }}
              >
                {r.glyph}
              </span>
              <span className="text-center text-[12px] font-bold leading-tight" style={{ color: 'var(--p-ink)' }}>{r.title}</span>
            </motion.button>
          ))}
        </div>

        <div className="mt-7 flex items-center justify-center gap-1.5 text-[12px] font-bold" style={{ color: 'var(--p-muted)' }}>
          🔥 <span style={{ color: 'var(--p-accent)' }}>{streak}-day streak</span> — keep it glowing!
        </div>
      </Fade>
    </PractiseShell>
  );
}
