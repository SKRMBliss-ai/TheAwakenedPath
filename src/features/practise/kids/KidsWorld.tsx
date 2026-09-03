import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Volume2, VolumeX } from 'lucide-react';
import { isMuted, setMuted } from '../../../lib/sfx';
import { usePractiseStore } from '../store';
import type { PracticeRoom, StrengthId } from '../types';
import { Mascot } from './Mascot';
import { SkyBackdrop } from './SkyBackdrop';
import { CinematicRoom } from './CinematicRoom';
import { KIDS_WORLD, roomCard, roomFull, type KidsRoomConfig, type RoomId } from './rooms';
import * as sound from './sound';
import { CheckInFlow } from './checkin/CheckInFlow';

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

const SPARKLE_POSITIONS = [
  { top: '14%', left: '76%', size: 24, delay: 0 },
  { top: '38%', left: '82%', size: 18, delay: 0.35 },
  { top: '65%', left: '78%', size: 22, delay: 0.15 },
  { top: '22%', left: '18%', size: 16, delay: 0.5 },
  { top: '78%', left: '22%', size: 20, delay: 0.25 },
];

function CardSparklesOverlay({ active }: { active: boolean }) {
  if (!active) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
      {SPARKLE_POSITIONS.map((sp, idx) => (
        <motion.div
          key={idx}
          style={{ position: 'absolute', top: sp.top, left: sp.left }}
          initial={{ opacity: 0, scale: 0.3, rotate: -10 }}
          animate={{
            opacity: [0.2, 1, 0.3],
            scale: [0.6, 1.25, 0.7],
            rotate: [0, 25, -15],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
            delay: sp.delay,
          }}
        >
          <div
            className="relative flex items-center justify-center"
            style={{ width: sp.size, height: sp.size }}
          >
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,217,138,0.7) 45%, transparent 75%)',
                transform: 'scale(2.0)',
                filter: 'blur(2px)',
              }}
            />
            <svg viewBox="0 0 24 24" className="w-full h-full text-white drop-shadow-[0_0_10px_rgba(255,235,170,0.95)]">
              <path
                d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z"
                fill="currentColor"
              />
            </svg>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export function KidsWorld({ onExitGym }: { onExitGym: () => void }) {
  const store = usePractiseStore();
  const [active, setActive] = useState<KidsRoomConfig | null>(null);
  const [checkingIn, setCheckingIn] = useState(false);
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

  if (checkingIn) {
    return <CheckInFlow onExit={() => setCheckingIn(false)} />;
  }

  return (
    <div className="relative min-h-[100svh] w-full overflow-hidden" style={{ fontFamily: FONT }}>
      <SkyBackdrop />

      <div className="relative mx-auto w-full max-w-2xl sm:max-w-3xl md:max-w-5xl lg:max-w-[1400px] xl:max-w-[1680px] 2xl:max-w-[1780px] px-4 sm:px-6 md:px-10 lg:px-12 pb-16 pt-5">
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
            animate={{ fontSize: greetingCollapsed ? 22 : 36, marginTop: greetingCollapsed ? 0 : 12 }}
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

        {/* The check-in — how a child arrives here, per the Mind Gym build
            brief. Sits above the room grid, doesn't replace it: a child with
            nothing specific on their mind can still just pick a room. */}
        <motion.button
          layout="position"
          whileTap={{ scale: 0.98 }}
          onClick={() => setCheckingIn(true)}
          className="mt-5 flex w-full items-center justify-between gap-3 rounded-[20px] px-5 py-4 text-left shadow-lg transition"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)' }}
        >
          <div>
            <p className="text-[16px] font-extrabold text-white" style={{ fontFamily: FONT }}>How are you feeling right now?</p>
            <p className="mt-0.5 text-[12.5px] text-white/65">Check in with Chirpy before you pick a room</p>
          </div>
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-white/80" style={{ background: 'rgba(255,255,255,0.14)' }}>→</span>
        </motion.button>

        {/* Room cards — static art at rest; hover brings each world to life */}
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 lg:gap-7 xl:grid-cols-5 xl:gap-8">
          {KIDS_WORLD.map((room, i) => (
            <motion.button
              key={room.id}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              whileHover={{ y: -8, scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onHoverStart={() => setHoveredId(room.id)}
              onHoverEnd={() => setHoveredId(null)}
              onClick={() => { sound.play('roomCard'); setActive(room); }}
              aria-label={`${room.name} — ${room.practising}`}
              className="group relative overflow-hidden rounded-[24px] text-left shadow-2xl transition-all duration-300"
              style={{
                border: hoveredId === room.id ? '1px solid rgba(255,255,255,0.45)' : '1px solid rgba(255,255,255,0.18)',
                background: room.palette.scrim,
                boxShadow: hoveredId === room.id ? `0 16px 36px ${room.palette.scrim}AA` : '0 8px 24px rgba(0,0,0,0.35)',
              }}
            >
              <div className="relative w-full aspect-[1/1.85] sm:aspect-[1/2.1] lg:aspect-[1/2.35] overflow-hidden">
                <img
                  src={hoveredId === room.id ? roomCard(room.id) : roomFull(room.id)}
                  alt=""
                  loading="lazy"
                  className="block h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  draggable={false}
                  onError={(e) => {
                    const img = e.currentTarget;
                    if (!img.dataset.fallback) {
                      img.dataset.fallback = 'true';
                      img.src = hoveredId === room.id
                        ? `https://firebasestorage.googleapis.com/v0/b/awakened-path-2026.firebasestorage.app/o/rooms%2F${room.id}_card.webp?alt=media`
                        : `https://firebasestorage.googleapis.com/v0/b/awakened-path-2026.firebasestorage.app/o/rooms%2Ffull%2F${room.id}_full.webp?alt=media`;
                    }
                  }}
                />
                <CardSparklesOverlay active={hoveredId === room.id} />
                {/* Only 'hires' rooms need this: their art has no title baked
                    into the pixels (see rooms.ts's `art` doc comment), unlike
                    the 'painted'/'upscaled' rooms whose art already carries
                    the title — overlaying it there would show the name twice. */}
                {room.art === 'hires' && (
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 bottom-0 p-4 sm:p-5 pt-16 sm:pt-24 transition-opacity duration-300"
                    style={{
                      background: `linear-gradient(0deg, ${room.palette.scrim}FD 0%, ${room.palette.scrim}D0 50%, ${room.palette.scrim}00 100%)`,
                    }}
                  >
                    <p className="text-[15px] sm:text-[18px] font-extrabold leading-tight text-white" style={{ fontFamily: FONT }}>
                      {room.name}
                    </p>
                    <p className="mt-1 text-[12px] sm:text-[13.5px] font-medium leading-tight text-white/85">
                      {room.practising}
                    </p>
                  </div>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
