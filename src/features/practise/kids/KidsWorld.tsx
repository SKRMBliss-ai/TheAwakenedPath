import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Volume2, VolumeX } from 'lucide-react';
import { isMuted, setMuted } from '../../../lib/sfx';
import { usePractiseStore } from '../store';
import type { PracticeRoom, StrengthId } from '../types';
import { Mascot } from './Mascot';
import { CinematicRoom } from './CinematicRoom';
import { KindnessEnvironment, PauseEnvironment, WorryEnvironment } from './environments';
import { KindnessExercise, PauseExercise, WorryExercise } from './exercises';
import { KIDS_WORLD, type KidsRoomConfig, type RoomId } from './rooms';
import * as sound from './sound';

/**
 * Kids Gym — a world the child enters, not a dashboard they read.
 *
 * The hub is a night sky of portals; each portal opens into its own world
 * through the shared cinematic entrance. Three worlds are fully built
 * (Pause, Worry, Kindness); the rest announce themselves as coming soon
 * rather than pretending to be ready.
 */

const STRENGTHS_BY_ROOM: Partial<Record<RoomId, StrengthId[]>> = {
  pause: ['pausing', 'awareness'],
  worry: ['letting-go', 'awareness'],
  kindness: ['self-compassion', 'perspective'],
};

/** Adapts a world to the shape the practice journey records. */
function asPracticeRoom(room: KidsRoomConfig): PracticeRoom {
  return {
    id: `kids-${room.id}`,
    gym: 'kids',
    title: room.name,
    whatPractising: room.practising,
    glyph: room.glyph,
    steps: [],
    strengths: STRENGTHS_BY_ROOM[room.id] ?? ['awareness'],
  };
}

export function KidsWorld({ onExitGym }: { onExitGym: () => void }) {
  const store = usePractiseStore();
  const [active, setActive] = useState<KidsRoomConfig | null>(null);
  const [progress, setProgress] = useState(0);
  const [muted, setMutedState] = useState(isMuted());

  const enter = (room: KidsRoomConfig) => {
    if (room.status !== 'ready') { sound.play('tap'); return; }
    sound.play('roomCard');
    setProgress(0);
    setActive(room);
  };

  const leave = (room: KidsRoomConfig, completed: boolean) => {
    if (completed) store.completeSession(asPracticeRoom(room), 4);
    setActive(null);
    setProgress(0);
  };

  const toggleSound = () => {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
    if (!next) sound.play('tap');
  };

  /* ── Inside a world ───────────────────────────────────────────────────── */
  if (active) {
    const env = (p: number) => {
      if (active.id === 'pause') return <PauseEnvironment palette={active.palette} progress={p} />;
      if (active.id === 'worry') return <WorryEnvironment palette={active.palette} progress={p} />;
      return <KindnessEnvironment palette={active.palette} progress={p} />;
    };

    return (
      <CinematicRoom
        room={active}
        progress={progress}
        environment={env}
        onExit={() => leave(active, progress >= 1)}
      >
        {({ finish }) => {
          const props = { room: active, onProgress: setProgress, onFinish: finish };
          if (active.id === 'pause') return <PauseExercise {...props} />;
          if (active.id === 'worry') return <WorryExercise {...props} />;
          return <KindnessExercise {...props} />;
        }}
      </CinematicRoom>
    );
  }

  /* ── The hub ──────────────────────────────────────────────────────────── */
  return (
    <div
      className="relative min-h-[100svh] w-full overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #1A1040 0%, #2E1B62 45%, #4A2A7A 100%)',
        fontFamily: "'Outfit', system-ui, -apple-system, sans-serif",
      }}
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
          <Mascot mood="curious" size={128} />
          <h1
            className="mt-3 text-[30px] font-extrabold leading-tight text-white"
            style={{ fontFamily: "'Outfit', system-ui, -apple-system, sans-serif" }}
          >
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

        {/* Portals */}
        <div className="mt-7 grid grid-cols-2 gap-3.5">
          {KIDS_WORLD.map((room, i) => {
            const ready = room.status === 'ready';
            return (
              <motion.button
                key={room.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                whileHover={ready ? { y: -4 } : undefined}
                whileTap={ready ? { scale: 0.97 } : undefined}
                onClick={() => enter(room)}
                className="relative overflow-hidden rounded-[26px] p-4 text-left"
                style={{
                  background: `linear-gradient(160deg, ${room.palette.sky[2]}, ${room.palette.sky[0]})`,
                  border: '1px solid rgba(255,255,255,0.14)',
                  minHeight: 152,
                  opacity: ready ? 1 : 0.55,
                }}
              >
                {/* the room's light, leaking out of the portal */}
                <div
                  className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full"
                  style={{ background: `radial-gradient(circle, ${room.palette.glow}66, transparent 70%)` }}
                />
                <span className="text-[26px]">{room.glyph}</span>
                <div className="mt-5 text-[15px] font-extrabold leading-tight" style={{ color: room.palette.ink }}>
                  {room.name}
                </div>
                <div className="mt-1 text-[11.5px] leading-snug" style={{ color: room.palette.ink, opacity: 0.72 }}>
                  {room.practising}
                </div>
                {!ready && (
                  <span
                    className="absolute right-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-bold"
                    style={{ background: 'rgba(255,255,255,0.18)', color: room.palette.ink }}
                  >
                    Soon
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
