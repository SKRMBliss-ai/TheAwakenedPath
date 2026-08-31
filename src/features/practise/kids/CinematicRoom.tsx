import { useEffect, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { Mascot } from './Mascot';
import type { KidsRoomConfig } from './rooms';
import * as sound from './sound';

/**
 * The cinematic room shell. Every world is entered the same way, so the
 * sequence itself becomes a product feature the child learns to expect:
 *
 *   APPROACH   camera pushes forward, the world is blurred and dark
 *   REVEAL     the world settles into focus, Pip walks in
 *   TITLE      the room names itself, one line of story
 *   READY      a single invitation — the child takes control
 *
 * The exercise then plays inside the same environment, never on a card
 * stacked on top of it. The world stays the interface.
 */

type Phase = 'approach' | 'reveal' | 'title' | 'ready' | 'exercise';

export function CinematicRoom({
  room,
  environment,
  children,
  onExit,
  progress = 0,
}: {
  room: KidsRoomConfig;
  /** The room's world, given the live exercise progress. */
  environment: (progress: number) => ReactNode;
  /** The exercise — rendered once the child accepts the invitation. */
  children: (api: { finish: () => void }) => ReactNode;
  onExit: () => void;
  /** 0→1, drives how the world transforms as the child practises. */
  progress?: number;
}) {
  const [phase, setPhase] = useState<Phase>('approach');

  useEffect(() => {
    sound.play('enterRoom');
    const t1 = setTimeout(() => setPhase('reveal'), 1100);
    const t2 = setTimeout(() => setPhase('title'), 1900);
    const t3 = setTimeout(() => setPhase('ready'), 2700);
    return () => { [t1, t2, t3].forEach(clearTimeout); sound.stopAll(); };
  }, []);

  const cinematic = phase === 'approach';
  const showMascot = phase !== 'approach';
  const showTitle = phase === 'title' || phase === 'ready';
  const showInvite = phase === 'ready';
  const inExercise = phase === 'exercise';

  const leave = () => { sound.play('exitRoom'); onExit(); };

  return (
    <div
      className="relative min-h-[100svh] w-full overflow-hidden"
      style={{ background: room.palette.sky[0], fontFamily: "'Outfit', system-ui, -apple-system, sans-serif" }}
    >
      {/* ── The world ──────────────────────────────────────────────────── */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.35, filter: 'blur(14px)' }}
        animate={{ scale: cinematic ? 1.35 : 1, filter: cinematic ? 'blur(14px)' : 'blur(0px)' }}
        transition={{ duration: 1.7, ease: [0.22, 0.9, 0.28, 1] }}
      >
        {environment(progress)}
      </motion.div>

      {/* arrival vignette — deepest during the approach, then lifts */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        animate={{ opacity: cinematic ? 0.92 : 0.30 }}
        transition={{ duration: 1.7, ease: 'easeOut' }}
        style={{ background: `radial-gradient(120% 90% at 50% 55%, transparent 25%, ${room.palette.sky[0]} 100%)` }}
      />

      {/* ── Chrome ─────────────────────────────────────────────────────── */}
      <div className="relative flex min-h-[100svh] flex-col px-5 pb-8 pt-5">
        <button
          onClick={leave}
          aria-label="Leave room"
          className="grid h-10 w-10 place-items-center rounded-full backdrop-blur-sm transition hover:bg-white/10"
          style={{ background: 'rgba(255,255,255,0.10)', color: room.palette.ink }}
        >
          <ChevronLeft size={22} />
        </button>

        {/* The intro sits low, like a title card. The exercise centres itself
            so nothing gets clipped against the bottom of the screen. */}
        <div className={`flex flex-1 flex-col items-center text-center ${inExercise ? 'justify-center' : 'justify-end pb-4'}`}>
          {/* Pip arrives in the world */}
          <AnimatePresence>
            {showMascot && !inExercise && (
              <motion.div
                initial={{ opacity: 0, y: 28, scale: 0.7 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 70, damping: 14 }}
              >
                <Mascot
                  mood={room.mood}
                  size={132}
                  accessory={room.id === 'worry' ? 'lantern' : room.id === 'kindness' ? 'seed' : 'none'}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Title moment */}
          <AnimatePresence>
            {showTitle && !inExercise && (
              <motion.div
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className="mt-4"
              >
                <h1
                  className="text-[28px] font-extrabold tracking-tight"
                  style={{
                    color: room.palette.ink,
                    textShadow: `0 2px 24px ${room.palette.sky[0]}`,
                    fontFamily: "'Outfit', system-ui, -apple-system, sans-serif",
                  }}
                >
                  {room.name}
                </h1>
                <p className="mx-auto mt-2 max-w-[19rem] text-[15px] leading-relaxed" style={{ color: room.palette.ink, opacity: 0.82 }}>
                  {room.tagline}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* The single invitation */}
          <AnimatePresence>
            {showInvite && (
              <motion.button
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => { sound.play('tap'); setPhase('exercise'); }}
                className="mt-7 rounded-full px-8 py-4 text-[15px] font-bold text-white shadow-xl"
                style={{ background: room.palette.accent, boxShadow: `0 10px 34px ${room.palette.accent}66` }}
              >
                {room.invitation}
              </motion.button>
            )}
          </AnimatePresence>

          {/* The exercise plays inside the world */}
          <AnimatePresence mode="wait">
            {inExercise && (
              <motion.div
                key="exercise"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full"
              >
                {children({ finish: leave })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
