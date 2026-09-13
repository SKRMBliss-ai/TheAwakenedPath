import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import { FireflyJar } from './FireflyJar';
import { Sparkle } from '../ui/FloatingFeeling';
import { useMotion } from '../ui/quiet';
import { loadJarPerch, saveJarPerch } from '../kit/jarPerch';
import * as sound from '../kit/sound';

/**
 * THE MECHANIC BEHIND BOTH JARS — today's, floating in the hub
 * (FloatingJar), and the lifetime one in the Observatory (LifetimeJar).
 *
 * Same object in two places: it drifts, it can be dragged anywhere, it
 * glitters and throws its count out on a tap, and wherever it's dropped is
 * where it stays. That's the same bargain FloatingFeeling's companion
 * strikes, and for the same reason — a thing that can be moved earns the
 * right to float on top of everything else, because a child it's in the
 * way of can move it rather than being stuck with it.
 *
 * What differs between the two callers is only where each one calls home
 * and what it says about itself, both handed in as props — so this file
 * has no idea whether it's showing tonight or a whole childhood.
 *
 * FIXED, not absolute, for the reason the door handles are (ui/DoorHandle):
 * both rooms this appears in scroll, and an absolutely-positioned jar ends
 * up parked wherever the page happened to be tall, which is nowhere a
 * child would think to look for it.
 */
export function DraggableJar({
  id,
  caught,
  size,
  dense = false,
  home,
  ariaLabel,
  sparkleBloom = 104,
  sparkleSpread = 0.62,
}: {
  /** Which saved position this jar remembers — see kit/jarPerch. */
  id: string;
  caught: string[];
  size: number;
  dense?: boolean;
  /** Where it hangs unmoved. Given the viewport, since perches are stored
      as a fraction of it (see kit/todaysFeeling's Perch) rather than pixels. */
  home: (room: { w: number; h: number }) => { x: number; y: number };
  ariaLabel: (count: number) => string;
  sparkleBloom?: number;
  sparkleSpread?: number;
}) {
  const m = useMotion();
  const [perch, setPerch] = useState(() => loadJarPerch(id));
  const [room, setRoom] = useState<{ w: number; h: number } | null>(null);
  const [burst, setBurst] = useState(0);
  const [held, setHeld] = useState(false);
  const dragged = useRef(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const jarH = size * 1.28;

  useEffect(() => {
    const measure = () => setRoom({ w: window.innerWidth, h: window.innerHeight });
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  if (!room) return null;

  const spot = perch ?? home(room);
  const left = spot.x * room.w;
  const top = spot.y * room.h;
  const bounds = {
    left: -left + 4,
    right: room.w - left - size - 4,
    top: -top + 8,
    bottom: room.h - top - jarH - 4,
  };

  function open() {
    // A drag ends with a click too, and that was a move, not a question.
    if (dragged.current) { dragged.current = false; return; }
    sound.play('discovery');
    setBurst((n) => n + 1);
  }

  /**
   * HOW MUCH LIGHT THE JAR THROWS — from what is actually in it.
   *
   * A fixed halo made an EMPTY jar glow, which is both a small lie and the
   * wrong emphasis: the thing worth seeing is the jar filling up. The glass
   * itself was brightened instead (see FireflyJar's JAR_COLOR) so an empty
   * one is still findable on the night sky, and this is the reward on top.
   *
   * Climbs fast at the start and then flattens: the difference between none
   * and three should be obvious, and between forty and fifty should not,
   * because by then the jar is a hoard rather than a tally.
   */
  const halo = Math.min(0.40, 0.13 + Math.sqrt(caught.length) * 0.075);

  return (
    <motion.div
      className="fixed z-50"
      style={{ left, top, x, y, touchAction: 'none' }}
      drag={!m.quiet}
      dragConstraints={bounds}
      dragElastic={0.08}
      dragMomentum={false}
      onDragStart={() => { dragged.current = true; setHeld(true); }}
      onDragEnd={() => {
        setHeld(false);
        sound.play('tap');
        // Fold the drag offset into the perch and zero the transform, so the
        // next drag starts from where it actually is rather than from where
        // it first appeared.
        const next = { x: (left + x.get()) / room.w, y: (top + y.get()) / room.h };
        x.set(0); y.set(0);
        setPerch(next);
        saveJarPerch(id, next);
      }}
    >
      <motion.button
        onClick={open}
        aria-label={ariaLabel(caught.length)}
        className="relative block border-0 bg-transparent p-0"
        whileTap={{ scale: 0.94 }}
        /* Floats. Slower and shallower than the companion's hop — a jar of
           light drifting, not a boy bouncing. */
        animate={m.quiet || held ? { y: 0 } : { y: [0, -9, 0] }}
        transition={m.quiet || held
          ? { duration: 0.3 }
          : { repeat: Infinity, duration: 4.6, ease: 'easeInOut' }}
        style={{
          /*
            IT HAS TO BE FINDABLE FIRST.

            The jar is a thin glass outline on a dark night sky, which was
            beautiful and very nearly invisible — a child who cannot see the
            thing holding their whole evening does not tap it. So the glass
            now carries its own light: a warm drop-shadow at all times, which
            is what a jar full of fireflies would actually do to the air
            around it, and which costs the design nothing because the colour
            is the fireflies' own.

            It brightens rather than changes when picked up, so being held
            still reads as a separate state.
          */
          filter: held
            ? 'brightness(1.2) drop-shadow(0 0 14px rgba(255,198,92,0.85)) drop-shadow(0 0 30px rgba(255,198,92,0.4))'
            : 'drop-shadow(0 0 10px rgba(255,198,92,0.6)) drop-shadow(0 0 24px rgba(255,198,92,0.28))',
        }}
      >
        {/*
          AND A HALO BEHIND IT, so the jar sits in a pool of its own light
          rather than floating on top of the room. Breathes very slowly —
          slower than the jar's own drift, so the two motions don't beat
          against each other and produce a flicker.
        */}
        {!m.quiet && caught.length > 0 && (
          <motion.span
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 -z-10 block rounded-full"
            style={{
              width: size * 2.1,
              height: size * 2.1,
              marginLeft: -size * 1.05,
              marginTop: -size * 1.05,
              background: `radial-gradient(circle, rgba(255,198,92,${halo}) 0%, rgba(255,198,92,${halo * 0.34}) 42%, transparent 70%)`,
            }}
            animate={{ opacity: [0.62, 1, 0.62], scale: [0.94, 1.07, 0.94] }}
            transition={{ repeat: Infinity, duration: 5.8, ease: 'easeInOut' }}
          />
        )}
        {/* The glitter, in firefly colours. Never when quiet, where a burst
            of light at an upset child is the opposite of help. */}
        {!m.quiet && burst > 0 && (
          <Sparkle key={burst} bloom={sparkleBloom} spread={sparkleSpread} hues={['#FFE7B4', '#FFC65C', '#FFFFFF']} />
        )}

        {/*
          HOW MANY, said only when there is something to say.

          Neither jar counts out loud on its own — "no score, no tally, no
          3 of 7" (CaughtFirefly) — and a tap doesn't reopen that: there's
          no denominator here, so there's no shortfall to read off it, just
          the number of lights already glowing in the jar. At zero it stays
          silent rather than flying a nought at a child who's had a quiet
          spell; the glitter still fires, so the tap is never dead.
        */}
        {burst > 0 && caught.length > 0 && <FlyingCount key={`n${burst}`} n={caught.length} />}

        <FireflyJar caught={caught} size={size} dense={dense} />
      </motion.button>
    </motion.div>
  );
}

/** The count, thrown up out of the neck of the jar and gone. */
function FlyingCount({ n }: { n: number }) {
  return (
    <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-10 grid place-items-center">
      <motion.span
        className="text-[36px] font-extrabold leading-none"
        style={{ color: '#FFE7B4', textShadow: '0 0 20px rgba(255,198,92,0.95), 0 2px 10px rgba(0,0,0,0.6)' }}
        initial={{ y: 6, opacity: 0, scale: 0.45 }}
        animate={{ y: -74, opacity: [0, 1, 1, 0], scale: [0.45, 1.3, 1.2, 1.05] }}
        transition={{ duration: 1.5, ease: 'easeOut', times: [0, 0.16, 0.68, 1] }}
      >
        {n}
      </motion.span>
    </span>
  );
}
