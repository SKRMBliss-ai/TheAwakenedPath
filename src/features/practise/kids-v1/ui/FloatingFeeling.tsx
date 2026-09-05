import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue } from 'framer-motion';
import { CHROME, FONT } from './chrome';
import { useMotion } from './quiet';
import { companionFor } from '../kit/feelingCompanions';
import { loadPerch, savePerch, todaysFeeling } from '../kit/todaysFeeling';
import * as sound from '../kit/sound';

/**
 * THE FEELING, IN THE ROOM — and wherever the child decides to put it.
 *
 * Once a child has named what they're feeling, that feeling comes with them
 * into every room: the boy and Chirpy wearing it, bouncing along, minding
 * their own business. Tapping gets one small true thing about what that
 * feeling is like. Dragging moves him, and where he is dropped is where he
 * stays — on this screen and every other one, today and tomorrow.
 *
 * WHY HE WANDERS UNTIL HE IS PARKED. A feeling pinned in a corner from the
 * start is a label the app applied. One drifting about the room is company.
 * But a child who moves him has said something — "you go there" — and the
 * app not remembering that would be worse than never having let them. So:
 * he drifts until he is picked up, and after that he lives where he was put.
 *
 * WHERE HE PARKS BY DEFAULT: low and to the left. The questions live in the
 * upper third, the door handles hang at three-quarters height on both walls,
 * and the bottom bar owns the last 90px. Low-left is the biggest piece of
 * the screen that is nobody else's, and it is inside a right-handed child's
 * thumb arc, which matters because tapping him is the point.
 *
 * HE HAS TO BE ON TOP TO BE TOUCHED. He used to sit behind the content so
 * he could never cover the question — which looked right and was broken:
 * the content container is a full-screen block with default pointer-events,
 * so it swallowed every tap and drag aimed at him. He was decoration. (The
 * test that "proved" tapping worked called .click() in script, which skips
 * hit-testing entirely and hid it.)
 *
 * So he sits above the page now, and the tension that put him underneath is
 * answered differently: he parks somewhere nobody else is using, he is
 * translucent, and if he is ever in the way the child can simply pick him up
 * and move him. Being movable is what makes being on top acceptable.
 *
 * THE QUIET STATE keeps him and stops him. Chirpy goes, because Chirpy is a
 * performer; this is the child's own answer made visible, and taking it away
 * at the moment it matters most would be the app flinching. He holds still,
 * and still answers a tap.
 */

/** Fractions of the viewport. Low and left — see the note above. */
const DEFAULT_PERCH = { x: 0.04, y: 0.56 };

export function FloatingFeeling({
  /** Omit to use whatever the child named today. */
  feeling,
  size = 112,
}: {
  feeling?: string | null;
  size?: number;
}) {
  const m = useMotion();
  const [line, setLine] = useState<number | null>(null);
  const [burst, setBurst] = useState(0);
  const [held, setHeld] = useState(false);
  const [perch, setPerch] = useState(() => loadPerch() ?? DEFAULT_PERCH);
  /** Null until measured; he can't drift sensibly without knowing the room. */
  const [room, setRoom] = useState<{ w: number; h: number } | null>(null);
  const dragged = useRef(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const id = feeling ?? todaysFeeling();
  const companion = companionFor(id);

  useEffect(() => {
    const measure = () => setRoom({ w: window.innerWidth, h: window.innerHeight });
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  if (!companion || !room) return null;

  const left = perch.x * room.w;
  const top = perch.y * room.h;
  /** Kept fully on screen whatever the child does with him. */
  const bounds = {
    left: -left + 4,
    right: room.w - left - size - 4,
    top: -top + 60,
    bottom: room.h - top - size * 1.2 - 8,
  };

  function speak() {
    // A drag ends with a click event too; that is a move, not a question.
    if (dragged.current) { dragged.current = false; return; }
    if (!companion) return;
    sound.play('discovery');
    setLine((n) => (n === null ? 0 : (n + 1) % companion.guidance.length));
    setBurst((n) => n + 1);
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-[15] overflow-hidden">
      <motion.div
        className="pointer-events-auto absolute"
        style={{ left, top, x, y, touchAction: 'none' }}
        drag={!m.quiet}
        dragConstraints={bounds}
        dragElastic={0.08}
        dragMomentum={false}
        onDragStart={() => { dragged.current = true; setHeld(true); }}
        onDragEnd={() => {
          setHeld(false);
          sound.play('tap');
          // Fold the drag offset into the perch and zero the transform, so
          // the next drag starts from where he actually is rather than from
          // where he first appeared.
          const nx = (left + x.get()) / room.w;
          const ny = (top + y.get()) / room.h;
          x.set(0); y.set(0);
          const next = { x: nx, y: ny };
          setPerch(next);
          savePerch(next);
        }}
      >
        <motion.button
          onClick={speak}
          aria-label={`${id}. Tap to hear about this feeling. Drag to move.`}
          className="relative block border-0 bg-transparent p-0"
          whileTap={{ scale: 0.94 }}
          /**
           * The bounce: a hop with squash on the landing, not a float. A
           * character that hovers reads as a hologram; one that lands and
           * gives a little reads as something with weight in the room, which
           * is what makes a child want to poke it.
           */
          animate={
            m.quiet || held
              ? { y: 0, scaleX: 1, scaleY: 1 }
              : { y: [0, -16, 0, -4, 0], scaleX: [1, 0.97, 1.05, 1, 1], scaleY: [1, 1.04, 0.94, 1.01, 1] }
          }
          transition={
            m.quiet || held
              ? { duration: 0.25 }
              : { repeat: Infinity, duration: 2.4, ease: 'easeInOut', times: [0, 0.3, 0.55, 0.72, 1] }
          }
          style={{ transformOrigin: 'bottom center' }}
        >
          {/* The magic. Light blooms out of him and a ring of motes throws
              itself outward — the room noticing that the child reached for
              their own feeling. Suppressed when quiet, where a burst of
              light at a distressed child would be the opposite of help. */}
          {!m.quiet && burst > 0 && <Sparkle key={burst} />}

          <img
            src={companion.src}
            alt=""
            draggable={false}
            width={size}
            className="max-w-none select-none"
            style={{
              // Sits back in the room. He is company, not the subject — the
              // question has to stay the brightest thing on the screen.
              opacity: held ? 0.95 : 0.72,
              filter: held
                ? 'drop-shadow(0 18px 30px rgba(0,0,0,0.6)) brightness(1.08)'
                : 'drop-shadow(0 10px 26px rgba(0,0,0,0.55))',
              transition: 'opacity 220ms ease-out, filter 220ms ease-out',
            }}
          />
        </motion.button>

        {/* What he has to say, under him rather than over the screen, so
            reading it never covers the question the child is answering. */}
        <AnimatePresence>
          {line !== null && !held && (
            <motion.div
              key={line}
              initial={{ opacity: 0, y: 8, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.96 }}
              transition={{ duration: m.quiet ? 0.5 : 0.32 }}
              className="pointer-events-auto absolute left-1/2 z-30 w-[188px] -translate-x-1/2 rounded-2xl px-3.5 py-2.5 backdrop-blur-md"
              style={{
                top: size - 6,
                background: 'rgba(14,10,30,0.86)',
                border: `1px solid ${CHROME.pillBorder}`,
                color: CHROME.text,
                fontFamily: FONT,
              }}
            >
              <p className="text-[12.5px] font-semibold leading-snug">{companion.guidance[line]}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

/**
 * One bloom of light and twelve motes thrown outward. Mounted fresh on each
 * tap (keyed on a counter) so it always plays from the start, and dropped as
 * soon as it has finished — nothing here loops, because a companion that
 * sparkles forever stops meaning "you touched me".
 */
const SPARK = Array.from({ length: 12 }, (_, i) => ({
  a: (i / 12) * Math.PI * 2 + (i % 3) * 0.18,
  d: 58 + ((i * 23) % 44),
  s: 4 + ((i * 11) % 4),
  hue: i % 3 === 0 ? '#FFD98A' : i % 3 === 1 ? '#C48BE8' : '#FFFFFF',
}));

function Sparkle() {
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center">
      <motion.span
        className="absolute rounded-full"
        style={{
          width: 150,
          height: 150,
          background: 'radial-gradient(circle, rgba(255,236,190,0.85) 0%, rgba(196,139,232,0.35) 44%, transparent 72%)',
        }}
        initial={{ opacity: 0, scale: 0.4 }}
        animate={{ opacity: [0, 0.9, 0], scale: [0.4, 1.35, 1.6] }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
      />
      {SPARK.map((p, i) => (
        <motion.span
          key={i}
          className="absolute block rounded-full"
          style={{ width: p.s, height: p.s, background: p.hue, boxShadow: `0 0 10px ${p.hue}` }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ x: Math.cos(p.a) * p.d, y: Math.sin(p.a) * p.d, opacity: 0, scale: 0.3 }}
          transition={{ duration: 1, ease: 'easeOut', delay: (i % 4) * 0.04 }}
        />
      ))}
    </span>
  );
}
