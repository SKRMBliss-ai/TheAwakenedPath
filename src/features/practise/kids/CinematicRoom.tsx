import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { RoomExercise } from './exercises';
import { roomArt, type KidsRoomConfig } from './rooms';
import { AmbientLife, ChirpyInWorld } from './AmbientLife';
import * as sound from './sound';

/**
 * The cinematic room shell. Every world is entered the same way, so the
 * sequence itself becomes something the child learns to expect:
 *
 *   APPROACH   the camera pushes into the painting, blurred and dark
 *   REVEAL     the world settles into focus
 *   TITLE      the room names itself, one line of story
 *   READY      a single invitation — the child takes control
 *
 * The exercise then plays inside the same painting, never on a card stacked
 * on top of it. The world stays the interface.
 */

type Phase = 'approach' | 'reveal' | 'title' | 'ready' | 'exercise';

const FONT = "'Outfit', system-ui, -apple-system, sans-serif";

export function CinematicRoom({
  room,
  onExit,
  onComplete,
}: {
  room: KidsRoomConfig;
  onExit: () => void;
  onComplete: () => void;
}) {
  const [phase, setPhase] = useState<Phase>('approach');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    sound.play('enterRoom');
    const t1 = setTimeout(() => setPhase('reveal'), 1100);
    const t2 = setTimeout(() => setPhase('title'), 1900);
    const t3 = setTimeout(() => setPhase('ready'), 2700);
    return () => { [t1, t2, t3].forEach(clearTimeout); sound.stopAll(); };
  }, []);

  const soft = room.art === 'upscaled';
  const cinematic = phase === 'approach';
  const showTitle = phase === 'title' || phase === 'ready';
  const showInvite = phase === 'ready';
  const inExercise = phase === 'exercise';

  const leave = () => { sound.play('exitRoom'); onExit(); };
  const finish = () => { onComplete(); leave(); };

  return (
    <div
      className="relative min-h-[100svh] w-full overflow-hidden"
      style={{ background: room.palette.scrim, fontFamily: FONT }}
    >
      {/* ── The painted world. The camera pushes in, then it breathes. ──── */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.3, filter: 'blur(16px)' }}
        animate={{
          scale: cinematic ? 1.3 : inExercise ? 1.06 : 1.02,
          // Rooms whose still was derived from the card art get a touch of
          // softness at rest, so the upscale reads as depth of field.
          filter: cinematic ? 'blur(16px)' : inExercise ? 'blur(3px)' : soft ? 'blur(1.2px)' : 'blur(0px)',
        }}
        transition={{ duration: 1.7, ease: [0.22, 0.9, 0.28, 1] }}
      >
        <img
          src={roomArt(room.id)}
          alt=""
          className="h-full w-full object-cover"
          draggable={false}
        />
      </motion.div>

      {/* The world dims a little while the child is working — words first —
          then brightens back as they get through it. */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        animate={{ opacity: (inExercise ? 0.52 : 0.34) - progress * 0.22 }}
        transition={{ duration: 1.2 }}
        style={{ background: room.palette.scrim }}
      />

      {/* arrival vignette, and a scrim so words always sit on something */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        animate={{ opacity: cinematic ? 0.95 : 1 }}
        transition={{ duration: 1.7, ease: 'easeOut' }}
        style={{
          background: cinematic
            ? `radial-gradient(120% 90% at 50% 55%, transparent 20%, ${room.palette.scrim} 100%)`
            : `linear-gradient(180deg, ${room.palette.scrim}B3 0%, transparent 26%, transparent 42%, ${room.palette.scrim}E6 88%)`,
        }}
      />

      {/* ── Immersive-style trial (rooms.ts's `immersive` flag only) ────── */}
      {room.immersive && !cinematic && (
        <>
          <AmbientLife accent={room.palette.accent} />
          <ChirpyInWorld visible={!inExercise} pose={room.chirpyPose} />
        </>
      )}

      {/* ── Chrome ─────────────────────────────────────────────────────── */}
      <div className="relative flex min-h-[100svh] flex-col px-5 pb-8 pt-5">
        <button
          onClick={leave}
          aria-label="Leave room"
          className="grid h-10 w-10 place-items-center rounded-full backdrop-blur-sm transition hover:bg-white/10"
          style={{ background: 'rgba(0,0,0,0.28)', color: room.palette.ink }}
        >
          <ChevronLeft size={22} />
        </button>

        <div className={`flex flex-1 flex-col items-center text-center ${inExercise ? 'justify-center' : 'justify-end pb-6'}`}>
          {/* Title moment */}
          <AnimatePresence>
            {showTitle && !inExercise && (
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
              >
                <h1
                  className="text-[30px] font-extrabold tracking-tight"
                  style={{ color: room.palette.ink, fontFamily: FONT, textShadow: `0 2px 26px ${room.palette.scrim}, 0 1px 6px ${room.palette.scrim}` }}
                >
                  {room.name}
                </h1>
                <p
                  className="mx-auto mt-2 max-w-[19rem] text-[15px] leading-relaxed"
                  style={{ color: room.palette.ink, opacity: 0.88, textShadow: `0 1px 14px ${room.palette.scrim}` }}
                >
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
          {inExercise && (
            <RoomExercise room={room} onProgress={setProgress} onFinish={finish} />
          )}
        </div>
      </div>
    </div>
  );
}
