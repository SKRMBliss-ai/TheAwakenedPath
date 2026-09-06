import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import { FireflyJar } from './FireflyJar';
import { Sparkle } from '../ui/FloatingFeeling';
import { useMotion } from '../ui/quiet';
import { loadJarPerch, saveJarPerch } from '../kit/jarPerch';
import * as sound from '../kit/sound';

/**
 * THE JAR, OUT OF THE SCREEN AND INTO THE ROOM.
 *
 * It only ever existed inside the catch beat — a child saw their lights for
 * half a second after ticking a room and then the jar was gone until the
 * next tick. So the one object in the app that holds the whole evening was
 * the one thing they could never just go and look at.
 *
 * Now it stands in the hub. It drifts, it can be picked up and put down
 * anywhere, and where it lands is where it lives — the same bargain the
 * companion strikes (ui/FloatingFeeling): a thing that can be moved is
 * allowed to be on top of everything, because if it is ever in the way the
 * child can move it rather than being stuck with it.
 *
 * IT GOES HOME TO ITS OWN DOOR. Unmoved, it sits at the foot of the
 * fireflies handle on the right wall, so the jar and the door that fills it
 * read as one thing rather than two unrelated bits of furniture. A child
 * who drags it to the middle of the floor has said otherwise, and that
 * sticks — across rooms, and across days.
 *
 * FIXED, not absolute, for the reason the door handles are (ui/DoorHandle):
 * the hub scrolls, and an absolutely-positioned jar ends up parked
 * three-quarters of the way down a very long page, which is nowhere.
 */

/** Small. It is furniture on the wall, not the subject of the screen. */
const SIZE = 60;
/** FireflyJar draws at 1.28× its width. */
const JAR_H = SIZE * 1.28;

/**
 * Where the fireflies door hangs, in vh — must match the `bottomVh` on the
 * first DoorHandle in BestApp's DoorWall. The jar parks below it.
 */
const DOOR_VH = 20;

/**
 * Directly UNDER the fireflies handle, in the right-hand gutter the room
 * cards already leave clear (the hub pads itself to 74px for exactly this).
 * The handle's own bottom edge is DOOR_VH up the wall, so the jar's TOP
 * starts there and it hangs below — level with it put the two objects on
 * top of each other, which is how the first version of this went.
 */
function homePerch(room: { w: number; h: number }) {
  return {
    x: Math.max(0, room.w - SIZE - 8) / room.w,
    y: Math.min(room.h - JAR_H - 4, room.h - (room.h * DOOR_VH) / 100 + 6) / room.h,
  };
}

export function FloatingJar({ caught }: { caught: string[] }) {
  const m = useMotion();
  const [perch, setPerch] = useState(() => loadJarPerch());
  const [room, setRoom] = useState<{ w: number; h: number } | null>(null);
  const [burst, setBurst] = useState(0);
  const [held, setHeld] = useState(false);
  const dragged = useRef(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  useEffect(() => {
    const measure = () => setRoom({ w: window.innerWidth, h: window.innerHeight });
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  if (!room) return null;

  const spot = perch ?? homePerch(room);
  const left = spot.x * room.w;
  const top = spot.y * room.h;
  const bounds = {
    left: -left + 4,
    right: room.w - left - SIZE - 4,
    top: -top + 8,
    bottom: room.h - top - JAR_H - 4,
  };

  function open() {
    // A drag finishes with a click too, and that was a move, not a question.
    if (dragged.current) { dragged.current = false; return; }
    sound.play('discovery');
    setBurst((n) => n + 1);
  }

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
        saveJarPerch(next);
      }}
    >
      <motion.button
        onClick={open}
        aria-label={caught.length
          ? `Your firefly jar, holding ${caught.length}. Tap it. Drag to move it.`
          : 'Your firefly jar. Tap it. Drag to move it.'}
        className="relative block border-0 bg-transparent p-0"
        whileTap={{ scale: 0.94 }}
        /* Floats. Slower and shallower than the companion's hop — a jar of
           light drifting, not a boy bouncing. */
        animate={m.quiet || held ? { y: 0 } : { y: [0, -9, 0] }}
        transition={m.quiet || held
          ? { duration: 0.3 }
          : { repeat: Infinity, duration: 4.6, ease: 'easeInOut' }}
        style={{ filter: held ? 'brightness(1.12)' : undefined }}
      >
        {/* The glitter, in firefly colours and sized to the jar rather than
            to the boy the effect was built for. Never when quiet, where a
            burst of light at an upset child is the opposite of help. */}
        {!m.quiet && burst > 0 && (
          <Sparkle key={burst} bloom={104} spread={0.62} hues={['#FFE7B4', '#FFC65C', '#FFFFFF']} />
        )}

        {/*
          HOW MANY ARE IN THERE, said only when there is something to say.

          The catch screen refuses to count out loud ("no score, no tally, no
          3 of 7") and this does not break that rule: there is no
          denominator, so there is no shortfall to read off it — just the
          number of lights the child is already looking at. At zero it says
          nothing at all rather than flying a 0 out of an empty jar, which
          would be the app announcing a nought to a child who has had a hard
          day. The glitter still fires, so the tap is never dead.
        */}
        {burst > 0 && caught.length > 0 && <FlyingCount key={`n${burst}`} n={caught.length} />}

        <FireflyJar caught={caught} size={SIZE} />
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
