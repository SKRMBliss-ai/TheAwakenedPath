import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Volume2, VolumeX } from 'lucide-react';
import { isMuted, setMuted } from '../../../lib/sfx';
import { usePractiseStore } from '../store';
import type { PracticeRoom, StrengthId } from '../types';
import { Mascot } from './Mascot';
import { CinematicRoom } from './CinematicRoom';
import { KIDS_WORLD, roomCard, roomFull, type KidsRoomConfig, type RoomId } from './rooms';
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
  const [hoveredId, setHoveredId] = useState<RoomId | null>(null);

  // Pip's greeting has done its job after a couple of seconds — shrink it
  // to a slim strip so the rooms sit higher and there's less to scroll past.
  const [greetingCollapsed, setGreetingCollapsed] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setGreetingCollapsed(true), 2600);
    return () => clearTimeout(t);
  }, []);

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

        {/* Pip greets the child, then steps back to make room for the rooms */}
        <motion.div
          layout
          className="flex flex-col items-center overflow-hidden text-center"
          animate={{ paddingTop: greetingCollapsed ? 4 : 8, paddingBottom: greetingCollapsed ? 2 : 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          <motion.div layout="position" animate={{ scale: greetingCollapsed ? 0 : 1, height: greetingCollapsed ? 0 : 'auto' }} transition={{ duration: 0.5, ease: 'easeInOut' }}>
            <Mascot mood="curious" size={120} />
          </motion.div>
          <motion.h1
            layout="position"
            animate={{ fontSize: greetingCollapsed ? 17 : 30, marginTop: greetingCollapsed ? 0 : 12 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="font-extrabold leading-tight text-white"
            style={{ fontFamily: FONT }}
          >
            Kids Gym
          </motion.h1>
          <AnimatePresence>
            {!greetingCollapsed && (
              <motion.p
                initial={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.4 }}
                className="mt-1.5 max-w-xs overflow-hidden text-[14px] leading-relaxed text-white/70"
              >
                A magical place to explore your mind. Pick a room — each one is a different world.
              </motion.p>
            )}
          </AnimatePresence>
          {store.practiceCount > 0 && (
            <motion.p layout="position" className="mt-1.5 text-[12px] font-bold" style={{ color: '#FFD98A' }}>
              You’ve visited {store.practiceCount} {store.practiceCount === 1 ? 'room' : 'rooms'} ✨
            </motion.p>
          )}
        </motion.div>

        {/* Room cards — static art at rest; hover brings each world to life */}
        <div className="mt-4 grid grid-cols-3 gap-2.5">
          {KIDS_WORLD.map((room, i) => (
            <motion.button
              key={room.id}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              whileHover={{ y: -4, scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onHoverStart={() => setHoveredId(room.id)}
              onHoverEnd={() => setHoveredId(null)}
              onClick={() => { sound.play('roomCard'); setActive(room); }}
              aria-label={`${room.name} — ${room.practising}`}
              className="overflow-hidden rounded-[16px] text-left shadow-lg"
              style={{ border: '1px solid rgba(255,255,255,0.16)', background: room.palette.scrim }}
            >
              <div className="w-full" style={{ aspectRatio: '205 / 768' }}>
                <img
                  src={hoveredId === room.id ? roomCard(room.id) : roomFull(room.id)}
                  alt={`${room.name} — ${room.practising}`}
                  loading="lazy"
                  width={205}
                  height={768}
                  className="block h-full w-full object-contain"
                  draggable={false}
                />
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
