import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue } from 'framer-motion';
import { CHROME, FONT } from './chrome';
import { useMotion } from './quiet';
import { COMPANY, companionFor, type FeelingIdle } from '../kit/feelingCompanions';
import { GAITS, gaitForRoom } from './scenery';
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
 * WHERE HE PARKS BY DEFAULT: bottom centre, on the floor of the screen.
 * Questions live in the upper third and the door handles hang on both walls
 * at three-quarters height, so the middle of the bottom edge is the one
 * piece of the screen nobody else wants — and it is the easiest place on a
 * phone for either thumb to reach, which matters because tapping him is the
 * point. Centred by measurement rather than a fixed percentage, so he is
 * actually centred on a tablet as well as a phone.
 *
 * HE HAS TO BE ON TOP TO BE TOUCHED. He used to sit behind the content so
 * he could never cover the question — which looked right and was broken:
 * the content container is a full-screen block with default pointer-events,
 * so it swallowed every tap and drag aimed at him. He was decoration. (The
 * test that "proved" tapping worked called .click() in script, which skips
 * hit-testing entirely and hid it.)
 *
 * So he sits above the page now — above the bottom bar too, which is z-40
 * and was swallowing him all over again once he moved to the floor. The
 * tension that put him underneath is answered differently: he parks
 * somewhere nobody is using for the answer itself, he is translucent, and
 * if he is ever in the way the child can pick him up and move him. Being
 * movable is what makes being on top acceptable.
 *
 * Standing on the floor rather than above the bar is the deliberate choice
 * between two overlaps: the room's main button ends about 60px above the
 * bar, which is not enough room for him, so he had to cover one or the
 * other. He covers the nav — secondary chrome, reachable from the hub, and
 * not what a child is reaching for mid-answer — rather than the one button
 * the screen is asking them to press.
 *
 * THE QUIET STATE keeps him and stops him. Chirpy goes, because Chirpy is a
 * performer; this is the child's own answer made visible, and taking it away
 * at the moment it matters most would be the app flinching. He holds still,
 * and still answers a tap.
 */

/**
 * How far his feet sit above the very bottom of the screen.
 *
 * This was 8, i.e. on the floor, on the reasoning that overlapping the bottom
 * nav is harmless and overlapping the room's main button is not. Both halves
 * of that are true and the conclusion was still wrong, because it assumed he
 * would be drawn OVER the nav. He isn't: the room arrives through a clip-path
 * wipe (see best/BestApp's archWipe), a clip-path opens a stacking context,
 * and so his z-50 is resolved inside the room rather than against the fixed
 * z-40 bar. The bar wins, and half a boy disappears behind it.
 *
 * Standing him on top of the bar instead of behind it costs nothing now that
 * he parks in the right-hand corner rather than on the centre line, which is
 * what made him collide with the main button before — see defaultPerch.
 */
const FLOOR = 84;

/**
 * Where he stands before anybody moves him: down in the right-hand corner.
 *
 * IT WAS BOTTOM CENTRE, AND CENTRE IS WHERE THE BUTTONS ARE. Every room lays
 * its content out in a single centred column that runs to the foot of the
 * screen, so parking him on the centre line put him — and, worse, his "Tap
 * me!" badge, which floats above his head — directly across the last button in
 * that column. In the Healthy Body Zone the badge sat on top of the words
 * "Something's still on my mind".
 *
 * The right-hand corner is the one part of a room nobody else is using: the
 * column is centred and capped, the back button is top-left, the grown-up exit
 * is top-right, the nav runs along the bottom-left. He still overlaps the foot
 * of the screen, which is chrome rather than an answer, and he is translucent
 * over it.
 *
 * Still only a DEFAULT. The moment a child drags him anywhere, that is where
 * he lives — see the note at the top of this file on why that has to outlast
 * the session.
 */
function defaultPerch(room: { w: number; h: number }, size: number) {
  /** Clear of the right edge, and never off a narrow screen. */
  const x = Math.max(0, Math.min(room.w - size - 10, room.w * 0.72));
  return {
    x: x / room.w,
    y: Math.max(0, room.h - FLOOR - size * 1.2) / room.h,
  };
}

/**
 * THE SHAPES OF THE IDLES — see kit/feelingCompanions for which feeling wears
 * which, and for why they stopped all sharing one.
 *
 * Each track's first and last frame are identical so the loop closes on
 * itself rather than snapping back. Where a movement needs uneven weighting
 * (the squash on a landing, the dwell at the bottom of a heavy one) it says
 * so with `times`, which framer requires to match the keyframe count — so
 * every array inside one idle is the same length on purpose.
 *
 * `transformOrigin: bottom center` on the element means scaleY reads as
 * weight settling onto the floor rather than the whole boy inflating.
 */
interface Idle {
  y: number[];
  x?: number[];
  rotate?: number[];
  scaleX?: number[];
  scaleY?: number[];
  seconds: number;
  times?: number[];
}

const IDLES: Record<FeelingIdle, Idle> = {
  /* The original. A hop that lands and gives a little — something with weight
     in the room, which is what makes a child want to poke it. */
  hop: {
    y: [0, -16, 0, -4, 0],
    scaleX: [1, 0.97, 1.05, 1, 1],
    scaleY: [1, 1.04, 0.94, 1.01, 1],
    seconds: 2.4,
    times: [0, 0.3, 0.55, 0.72, 1],
  },
  /* Happy is the meditating plate — eyes shut, hands resting. He floats. */
  float:   { y: [0, -9, 0],  scaleY: [1, 1.008, 1], seconds: 4.6 },
  /* Shallow and slow, and it takes its time at the bottom. */
  heavy:   { y: [0, -5, 0, -1, 0], scaleY: [1, 1.004, 1, 1.002, 1], seconds: 6.4, times: [0, 0.34, 0.6, 0.8, 1] },
  /* Small, quick, and deliberately not frantic. */
  tremble: { y: [0, -1, 0, -1, 0], x: [0, -1.5, 1.5, -1, 0], seconds: 0.95 },
  /* Rehearsing something, over and over, the way worry does. */
  sway:    { y: [0, -2, 0, -2, 0], x: [0, 5, 0, -5, 0], rotate: [0, 1, 0, -1, 0], seconds: 5 },
  /* Several things at once and none of them finishing. */
  jitter:  { y: [0, -3, -1, -4, 0], x: [0, -2, 2, -1, 0], seconds: 1.5 },
  /* A room with nothing in it yet. Almost no movement, very slowly. */
  slump:   { y: [0, -2, 0], rotate: [0, -1.5, 0], seconds: 8 },
  /* A slow tilt away and back — looking at something that isn't his. */
  lean:    { y: [0, -3, 0], x: [0, -4, 0], rotate: [0, -2.5, 0], seconds: 5.4 },
  /* Downward, and it stays down. Shame makes people smaller. */
  shrink:  { y: [0, 2, 0], scaleY: [1, 0.985, 1], seconds: 5.8, times: [0, 0.55, 1] },
  /* Burns hot and goes out fast. */
  flush:   { y: [0, -2, 0, -1, 0], scaleX: [1, 1.015, 1, 1.008, 1], scaleY: [1, 1.015, 1, 1.008, 1], seconds: 2.2 },
  /* One very long breath, and that is all. */
  breathe: { y: [0, -3, 0], scaleY: [1, 1.012, 1], seconds: 7.5 },
  /* Anger, held in. Quick and tight, and it goes nowhere — arms are folded
     in this plate, and a companion that stamped around the room would be
     performing the feeling at a child who is already having it. */
  simmer:  { y: [0, -2, 0, -2, 0], scaleX: [1, 1.012, 1, 1.012, 1], scaleY: [1, 1.012, 1, 1.012, 1], seconds: 1.7 },
  /* The loud one. Two big hops and a fast little one — the only idle here
     allowed to be bigger than the old shared bounce, because excited is the
     single feeling on this list a child wants matched rather than met. */
  fizz:    { y: [0, -21, 0, -11, 0], x: [0, 3, 0, -3, 0], rotate: [0, -6, 0, 6, 0], scaleY: [1, 1.05, 0.93, 1.02, 1], seconds: 1.9, times: [0, 0.26, 0.52, 0.74, 1] },
};

const STILL = { y: 0, x: 0, rotate: 0, scaleX: 1, scaleY: 1 };

export function FloatingFeeling({
  /** Omit to use whatever the child named today. */
  feeling,
  size = 112,
  roomId = null,
}: {
  feeling?: string | null;
  size?: number;
  /**
   * Which room he is standing in, so that on the days nothing has been named
   * he passes the time the way this room's boy does. See the note on `tracks`
   * below for why a named feeling ignores it.
   */
  roomId?: string | null;
}) {
  const m = useMotion();
  const [line, setLine] = useState<number | null>(null);
  const [burst, setBurst] = useState(0);
  const [held, setHeld] = useState(false);
  /** Null until the child moves him; the default is measured, not stored. */
  const [perch, setPerch] = useState(() => loadPerch());
  /** Null until measured; he can't drift sensibly without knowing the room. */
  const [room, setRoom] = useState<{ w: number; h: number } | null>(null);
  const dragged = useRef(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  /*
    WHOSE ROOM THIS IS.

    Omitting the prop means "whatever today is" — every room in the app —
    and if nothing has been named today the calm pair turn up instead of
    nobody (kit/feelingCompanions' COMPANY). Passing null explicitly is a
    different statement: DeepDive does it while the child is still on their
    way to naming a feeling, and that screen wants nobody in it until they
    have. A named feeling with no art still shows nobody either way.
  */
  const id = feeling === undefined ? todaysFeeling() : feeling;
  const companion = id ? companionFor(id) : feeling === undefined ? COMPANY : null;

  useEffect(() => {
    const measure = () => setRoom({ w: window.innerWidth, h: window.innerHeight });
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  if (!companion || !room) return null;

  /*
    HOW HE PASSES THE TIME HERE — and the two cases are genuinely different.

    A NAMED FEELING WINS, ALWAYS. If the child has said they are sad, he moves
    the way sad moves, in the Kindness Garden and the Courage Castle alike. A
    room does not get to overrule what a child told the app about themselves,
    and a grieving boy marching because he happens to be standing in the castle
    would be exactly that.

    NOTHING NAMED IS THE ROOM'S TO FILL. On every visit that skips the Feelings
    Room — which is most of them — he is carrying no feeling at all, and that
    is the case the per-room gaits in ui/scene were written for: he walks in
    Truth Lab, marches in Courage Castle, barely moves in the Observatory. They
    had been wired only to the small bird-sized figure beside a speech bubble,
    where a 16px stride is invisible, so effectively they had never been seen.
    Here he is 112px and standing on the floor of the room.

    `seconds` and `times` drive the transition and must not leak into
    `animate` — framer would treat them as properties to animate towards
    undefined.
  */
  const roomGait = GAITS[gaitForRoom(roomId)];
  const idle = companion === COMPANY && roomId
    ? { ...roomGait, times: undefined }
    : (IDLES[companion.idle] ?? IDLES.hop);
  const { seconds, times, ...tracks } = idle;

  const spot = perch ?? defaultPerch(room, size);
  const left = spot.x * room.w;
  const top = spot.y * room.h;
  /**
   * Anything he says goes UNDER him normally and ABOVE his head once he is
   * low on the screen — where he parks by default. Under his feet at the
   * bottom edge means off the bottom of the screen, i.e. a label nobody
   * ever reads.
   */
  const speakAbove = top > room.h * 0.5;
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
    <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden">
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
          aria-label={id
            ? `${id}. Tap to hear about this feeling. Drag to move.`
            : 'Chirpy and the boy. Tap to hear from them. Drag to move.'}
          className="relative block border-0 bg-transparent p-0"
          whileTap={{ scale: 0.94 }}
          /**
           * The bounce: a hop with squash on the landing, not a float. A
           * character that hovers reads as a hologram; one that lands and
           * gives a little reads as something with weight in the room, which
           * is what makes a child want to poke it.
           */
          animate={m.quiet || held ? STILL : { ...STILL, ...tracks }}
          transition={
            m.quiet || held
              ? { duration: 0.25 }
              : { repeat: Infinity, duration: seconds, ease: 'easeInOut', times }
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

        {/*
          "Tap me!" — because a bouncing boy in the corner is scenery until
          somebody says otherwise, and a six-year-old should not have to
          guess. It goes the moment they tap him for the first time: it has
          done its job, and a hint that keeps hinting is nagging.
        */}
        <AnimatePresence>
          {line === null && !held && (
            <motion.span
              aria-hidden
              initial={{ opacity: 0, scale: 0.8 }}
              animate={m.quiet ? { opacity: 1, scale: 1, y: 0 } : { opacity: 1, scale: 1, y: [0, -3, 0] }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={m.quiet
                ? { duration: 0.3 }
                : { y: { repeat: Infinity, duration: 1.6, ease: 'easeInOut' }, duration: 0.3 }}
              className={`pointer-events-none absolute left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1 text-[12px] font-extrabold ${speakAbove ? 'bottom-full mb-2' : ''}`}
              style={{
                top: speakAbove ? undefined : size - 2,
                background: '#FFD98A',
                color: '#221A08',
                boxShadow: '0 4px 16px -2px rgba(255,217,138,0.8)',
                fontFamily: FONT,
              }}
            >
              Tap me!
            </motion.span>
          )}
        </AnimatePresence>

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
              className={`pointer-events-auto absolute left-1/2 z-30 w-[188px] -translate-x-1/2 rounded-2xl px-3.5 py-2.5 backdrop-blur-md ${speakAbove ? 'bottom-full mb-2' : ''}`}
              style={{
                top: speakAbove ? undefined : size - 6,
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

export function Sparkle({
  /** Width of the bloom behind it. Scale this to the thing being touched. */
  bloom = 150,
  /** Multiplier on how far the motes are thrown. */
  spread = 1,
  /** Three colours, cycled. Defaults to the companion's warm/violet/white. */
  hues,
}: {
  bloom?: number;
  spread?: number;
  hues?: [string, string, string];
} = {}) {
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center">
      <motion.span
        className="absolute rounded-full"
        style={{
          width: bloom,
          height: bloom,
          background: 'radial-gradient(circle, rgba(255,236,190,0.85) 0%, rgba(196,139,232,0.35) 44%, transparent 72%)',
        }}
        initial={{ opacity: 0, scale: 0.4 }}
        animate={{ opacity: [0, 0.9, 0], scale: [0.4, 1.35, 1.6] }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
      />
      {SPARK.map((p, i) => {
        const hue = hues ? hues[i % 3] : p.hue;
        return (
        <motion.span
          key={i}
          className="absolute block rounded-full"
          style={{ width: p.s, height: p.s, background: hue, boxShadow: `0 0 10px ${hue}` }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ x: Math.cos(p.a) * p.d * spread, y: Math.sin(p.a) * p.d * spread, opacity: 0, scale: 0.3 }}
          transition={{ duration: 1, ease: 'easeOut', delay: (i % 4) * 0.04 }}
        />
        );
      })}
    </span>
  );
}
