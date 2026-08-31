import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Volume2, VolumeX } from 'lucide-react';
import { isMuted, setMuted } from '../../../lib/sfx';
import { usePractiseStore } from '../store';
import type { PracticeRoom, StrengthId } from '../types';
import { Mascot } from './Mascot';
import { CinematicRoom } from './CinematicRoom';
import { KIDS_WORLD, roomCard, type KidsRoomConfig, type RoomId } from './rooms';
import * as sound from './sound';

/**
 * Kids Gym — a world the child enters, not a dashboard they read.
 *
 * The hub is a night sky of room cards; each opens into its painted world
 * through the shared cinematic entrance. Pip greets the child here and then
 * steps aside, because every room's artwork has a child of its own inside it.
 */

const FONT = "'Outfit', system-ui, -apple-system, sans-serif";

const STRENGTHS_BY_ROOM: Record<RoomId, StrengthId[]> = {
  feelings: ['awareness'],
  thought: ['awareness', 'perspective'],
  body: ['awareness'],
  pause: ['pausing', 'awareness'],
  story: ['perspective'],
  friendship: ['perspective', 'self-compassion'],
  anger: ['pausing', 'letting-go'],
  worry: ['letting-go', 'awareness'],
  kindness: ['self-compassion', 'perspective'],
  reflection: ['awareness', 'perspective'],
};

/** Adapts a world to the shape the practice journey records. */
function asPracticeRoom(room: KidsRoomConfig): PracticeRoom {
  return {
    id: `kids-${room.id}`,
    gym: 'kids',
    title: room.name,
    whatPractising: room.practising,
    glyph: '✨',
    steps: [],
    strengths: STRENGTHS_BY_ROOM[room.id],
  };
}

export function KidsWorld({ onExitGym }: { onExitGym: () => void }) {
  const store = usePractiseStore();
  const [active, setActive] = useState<KidsRoomConfig | null>(null);
  const [muted, setMutedState] = useState(isMuted());

  const toggleSound = () => {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
    if (!next) sound.play('tap');
  };

  if (active) {
    return (
      <CinematicRoom
        room={active}
        onExit={() => setActive(null)}
        onComplete={() => store.completeSession(asPracticeRoom(active), 4)}
      />
    );
  }

  return (
    <div
      className="relative min-h-[100svh] w-full overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #1A1040 0%, #2E1B62 45%, #4A2A7A 100%)', fontFamily: FONT }}
    >
      {/* drifting stars */}
      {Array.from({ length: 22 }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-white"
          style={{ left: `${(i * 37) % 96}%`, top: `${(i * 53) % 70}%`, width: i % 4 === 0 ? 3 : 2, height: i % 4 === 0 ? 3 : 2 }}
          animate={{ opacity: [0.15, 0.85, 0.15] }}
          transition={{ repeat: Infinity, duration: 3 + (i % 5), delay: i * 0.25 }}
        />
      ))}

      <div className="relative mx-auto w-full max-w-2xl px-5 pb-10 pt-5">
        <div className="flex items-center justify-between">
          <button
            onClick={onExitGym}
            aria-label="Back"
            className="grid h-10 w-10 place-items-center rounded-full text-white/80 transition hover:bg-white/10"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            onClick={toggleSound}
            className="flex items-center gap-2 rounded-full px-3.5 py-2 text-[12px] font-bold text-white/85 transition hover:bg-white/10"
            style={{ background: 'rgba(255,255,255,0.10)' }}
          >
            {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            {muted ? 'Sounds off' : 'Sounds on'}
          </button>
        </div>

        {/* Pip greets the child */}
        <div className="flex flex-col items-center pt-2 text-center">
          <Mascot mood="curious" size={120} />
          <h1 className="mt-3 text-[30px] font-extrabold leading-tight text-white" style={{ fontFamily: FONT }}>
            Kids Gym
          </h1>
          <p className="mt-1.5 max-w-xs text-[14px] leading-relaxed text-white/70">
            A magical place to explore your mind. Pick a room — each one is a different world.
          </p>
          {store.practiceCount > 0 && (
            <p className="mt-2 text-[12px] font-bold" style={{ color: '#FFD98A' }}>
              You’ve visited {store.practiceCount} {store.practiceCount === 1 ? 'room' : 'rooms'} ✨
            </p>
          )}
        </div>

        {/* Room cards — each is a little animated window into its world */}
        <div className="mt-7 grid grid-cols-3 gap-2.5">
          {KIDS_WORLD.map((room, i) => (
            <motion.button
              key={room.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { sound.play('roomCard'); setActive(room); }}
              aria-label={`${room.name} — ${room.practising}`}
              className="overflow-hidden rounded-[16px] text-left shadow-lg"
              style={{ border: '1px solid rgba(255,255,255,0.16)', background: room.palette.scrim }}
            >
              <div className="aspect-square w-full overflow-hidden">
                <img
                  src={roomCard(room.id)}
                  alt=""
                  loading="lazy"
                  width={195}
                  height={195}
                  className="block h-full w-full object-cover object-top"
                  draggable={false}
                />
              </div>
              <div className="px-2 pb-2.5 pt-1.5">
                <div className="text-[11.5px] font-extrabold leading-tight" style={{ color: room.palette.ink }}>
                  {room.name}
                </div>
                <div className="mt-0.5 text-[9.5px] leading-snug" style={{ color: room.palette.ink, opacity: 0.68 }}>
                  {room.practising}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
