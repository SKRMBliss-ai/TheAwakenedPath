import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CHROME, FONT } from './chrome';
import { useMotion } from './quiet';
import * as sound from '../kit/sound';

/**
 * THE DOOR HANDLES — the Mind Gym's navigation, and not a button.
 *
 * A child leaving a room should feel they touched something in the world and
 * the world answered, not that they pressed Back. So the two controls are
 * physical fittings on the architecture: a brass lever at each edge, left to
 * go back, right to go on.
 *
 * WHY THE ROOM STAYS THE HERO. At rest the child sees almost nothing — a
 * seam of warm light at the very edge of the screen, the kind that leaks
 * around a closed door, and a handle at 40% breathing once every four
 * seconds. Only when a finger comes near does it brighten, lift out of the
 * wall, and gather motes. The room is never dimmed to make the controls
 * readable, which is the usual lazy fix; the controls get out of the way
 * until they are wanted.
 *
 * ONE PLATE, TWO MEANINGS. There is a single rendered handle. The left is
 * the plate as drawn (its lever sweeps inward, into the room); the right is
 * the same file mirrored, slightly warmer and brighter. Identical by
 * construction rather than by discipline, so they cannot drift apart.
 *
 * ONE PLATE, TWO STATES. The awake look is the SAME pixels under a CSS
 * filter, not a second render. The generated "awake" plate came back with a
 * wooden door baked into it and no alpha, so cross-fading the two would have
 * jumped; driving brightness from the resting plate keeps the geometry
 * identical for free and halves what has to load.
 *
 * THE QUIET STATE OPTS OUT ENTIRELY. No breathing, no motes, no waking on
 * approach, no hunting for a control that is hiding. When quiet the handle
 * is simply visible, still, and at full size. This is the one place the
 * magic yields, and it is not negotiable.
 */

/**
 * THE BRASS WAS TOO DARK TO FIND.
 *
 * The old plate was a photographic antique lever — dull, unlit, browner than
 * the walls it hung on. In a room that is deliberately dim it disappeared,
 * and the fix kept being to describe it better in a comment. The founder's
 * own handle sheet has the answer on it: a lit gold rose with a star in the
 * middle and a coloured swirl for the lever, drawn for exactly this app and
 * bright enough to read against a dark wall without anything being dimmed to
 * make room for it.
 *
 * Cut from assets/gym/rooms/door handles.png, top-left of the nine. Same
 * orientation as the plate it replaces — rose on the left, lever sweeping
 * right — so the mirroring below is unchanged.
 */
const PLATE = '/ui/handles/star@440.webp';
const PLATE_SRCSET = '/ui/handles/star@220.webp 220w, /ui/handles/star@440.webp 440w';
const SEAM = '/ui/handles/seam.webp';

/**
 * HOW BIG THE FITTING IS.
 *
 * 88px, which is what this was, is a thumbnail. It came from the old dark
 * plate, where making it bigger only made a bigger brown smudge — so the
 * size was chosen to keep it out of the way rather than to make it usable,
 * and then the room complained it could not be seen. A door handle is
 * something a child aims a whole hand at.
 *
 * Two sizes rather than one: a phone has no room for a wide fitting beside a
 * column of text, and a desktop has nothing but room. Keep this in step with
 * the `sm:` width on the plate below — it is the `sizes` hint that decides
 * which file the browser fetches, and a stale one quietly ships the small
 * plate to a screen drawing it at 210px.
 */
const PLATE_W_WIDE = 210;

/** The `big` fitting at `lg` and up — see the prop's note for why only there. */
const PLATE_W_BIG = 268;

/** The lever swings this far when pressed. Small: it reads as weight, not spin. */
const PRESS_DEG = 8;

/** Where the rose sits in the plate — the point a real lever pivots about. */
const PIVOT = '24% 50%';

/** How long the name hangs there on arrival before it fades back. */
const TIP_MS = 2800;

export function DoorHandle({
  side,
  label,
  onClick,
  /** The room's own accent, so the light belongs to the room it's in. */
  accent = '#FFD98A',
  bottomVh = 26,
  nudge = null,
  big = false,
}: {
  side: 'left' | 'right';
  /** Both the accessible name and the words on the tooltip. */
  label: string;
  onClick: () => void;
  accent?: string;
  /**
   * A fitting the size the founder's own room sheet draws it — brass that
   * takes up a third of the wall rather than a thumbnail at the edge.
   *
   * ONLY GROWS ON A WIDE SCREEN. A room's content column is centred with
   * hundreds of pixels spare either side once there is a desktop to spare
   * them, and that space is where this goes. A phone has no such space: the
   * column runs the full width, the fitting is pinned to the same edge at
   * the same height, and a big plate there is a plate on top of the words.
   * So the phone and tablet sizes are untouched and only `lg` gets the
   * handle the sheet drew.
   */
  big?: boolean;
  /**
   * How far up the wall this fitting hangs, in vh. A wall can carry more
   * than one door: the hub stacks three, and they need to not sit on top of
   * each other.
   */
  bottomVh?: number;
  /**
   * A different way of saying what's behind this door, shown during the
   * attention beat instead of `label`. Picked by the caller (see
   * best/BestApp's DoorWall) rather than in here — this component has no
   * state of its own to decide when to speak, only how to show it, so the
   * words come in already chosen.
   */
  nudge?: string | null;
}) {
  const m = useMotion();
  const [awake, setAwake] = useState(false);
  const [pressed, setPressed] = useState(false);

  /**
   * The name shows itself once, unprompted, then fades.
   *
   * Hover is not available to most of the children using this. A tooltip
   * that only appears on hover is a tooltip that never appears on a phone,
   * so the handle says what it is on arrival — long enough to read, short
   * enough not to nag — and after that on hover or focus for anyone with a
   * pointer or a keyboard.
   */
  const [introTip, setIntroTip] = useState(true);
  useEffect(() => {
    const t = window.setTimeout(() => setIntroTip(false), TIP_MS);
    return () => clearTimeout(t);
  }, []);

  // THE ATTENTION BEAT.
  //
  // The handles rest at the very edge of the screen on purpose, and the
  // cost of that is real: they are easy to miss entirely. So every so often
  // one of them says what it is, unprompted — the same tooltip the handle
  // shows on arrival, just in different words, and it's the caller (see
  // best/BestApp's DoorWall) that decides which door and which words, one
  // at a time. This component only has to show whatever it's handed.

  // The plate is drawn for the LEFT wall: its rose is at the left and the
  // lever sweeps inward, into the room. The right-hand fitting is the same
  // file mirrored, so both levers point into the room the child is in.
  const forward = side === 'right';
  const live = awake || pressed;
  const tip = introTip || awake || pressed || nudge !== null;
  const tipText = awake || pressed ? label : (nudge ?? label);

  function press() {
    if (pressed) return;
    setPressed(true);
    sound.play(forward ? 'enterRoom' : 'exitRoom');
    // The handle finishes travelling before the room changes — the world
    // acknowledging the touch is the point, and it takes a moment.
    window.setTimeout(onClick, m.quiet ? 420 : 320);
  }

  const handle = (
    <div
      /*
        FIXED, not absolute. Absolute made the handle span the whole
        document, which is fine on a screen that fits and useless on the hub,
        where the page scrolls: the fitting ended up pinned three-quarters of
        the way down a very long page, i.e. nowhere a child would ever see
        it. Fixed keeps it on the wall of the room rather than on the wall of
        the document, so it is reachable at every scroll position.

        AND IT IS PORTALLED OUT TO <body>, which is the other half of that
        same fight — see the note on the return below.
      */
      className="pointer-events-none fixed inset-y-0 z-20 flex items-end"
      style={{ [side]: 0, paddingBottom: `${bottomVh}vh` } as React.CSSProperties}
    >
      {/* The seam. Always there, and at rest doing the whole job on its own —
          light leaking around a door that is definitely a door. */}
      <img
        src={SEAM}
        alt=""
        aria-hidden
        draggable={false}
        className="absolute select-none"
        style={{
          // Pulled mostly off the edge and blurred, so what shows is the
          // outer falloff rather than the bright core. Straight, sharp and
          // full-strength it read as a laser down the side of the screen —
          // the opposite of light escaping around a door.
          [side]: big ? -78 : -52,
          width: big ? 174 : 116,
          // Was inset-y-0/h-full, which is right for one door on a wall and
          // wrong for three: the seams stacked into one continuous strip of
          // light down the whole edge, so no door had an edge of its own.
          // Now each is a panel of light around its own fitting.
          top: '50%',
          height: big ? 390 : 260,
          transform: 'translateY(-50%)',
          opacity: m.quiet ? 0.3 : live ? 0.62 : 0.28,
          filter: `blur(3px) drop-shadow(0 0 26px ${accent}55)`,
          transition: 'opacity 620ms ease-out',
        } as React.CSSProperties}
      />

      <motion.button
        onClick={press}
        onPointerEnter={() => setAwake(true)}
        onPointerLeave={() => setAwake(false)}
        onFocus={() => setAwake(true)}
        onBlur={() => setAwake(false)}
        aria-label={label}
        className="pointer-events-auto relative grid place-items-center border-0 bg-transparent p-0"
        style={{ minWidth: m.target, minHeight: m.target }}
        animate={
          m.quiet
            ? { opacity: 0.9, x: 0 }
            : {
                // Breathes. Lifts a little out of the wall when awake, so it
                // reads as an object with depth rather than a decal.
                // Rests brighter than the brief's "almost invisible", and
                // deliberately. On a phone there is no hover, so a handle
                // that only wakes on approach never wakes at all — the child
                // would be hunting for a control that is hiding from them.
                // Waking is still a clear event: full opacity, a warm bloom
                // and motes, none of which the resting state has.
                opacity: live ? 1 : [0.85, 0.66, 0.85],
                x: live ? (forward ? -5 : 5) : 0,
              }
        }
        transition={
          m.quiet
            ? { duration: 0.4 }
            : {
                opacity: live
                  ? { duration: 0.45 }
                  : { repeat: Infinity, duration: 4.2, ease: 'easeInOut' },
                x: { duration: 0.5 },
              }
        }
      >
        {/*
          A slow ring of light behind the fitting. Nothing else on these
          screens pulses, so a child reads it as "this one does something"
          without being told — which is the whole job, since a handle that
          looks like scenery gets treated as scenery.
        */}
        {!m.quiet && (
          <motion.span
            aria-hidden
            className={
              big
                ? 'pointer-events-none absolute h-[86px] w-[86px] rounded-full sm:h-[136px] sm:w-[136px] lg:h-[236px] lg:w-[236px]'
                : 'pointer-events-none absolute h-[86px] w-[86px] rounded-full sm:h-[136px] sm:w-[136px]'
            }
            style={{ background: `radial-gradient(circle, ${accent}77 0%, ${accent}22 42%, transparent 70%)` }}
            animate={{ scale: [1, 1.4, 1], opacity: [0.85, 0.25, 0.85] }}
            transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
          />
        )}

        {/*
          Mirroring and rotation are separated on purpose. A CSS `transform`
          in style silently replaces the one framer-motion builds for
          `rotate`, so doing both on one element means one of them quietly
          stops working. The wrapper mirrors; the image inside only ever
          turns, always as the left-hand fitting does — which, seen through
          the mirror, is exactly right for the other wall.
        */}
        <div
          /*
            Just past the edge, and no further.

            The old plate was pulled a quarter of its width off-screen, on the
            principle that a real fitting runs on past the door frame. That
            was free when the plate was a featureless brass oval. It is not
            free now: the rose on this one carries a lit star, the star sits
            about a quarter of the way in, and pulling a quarter of the plate
            off the edge hid exactly the part that says "this is a thing, take
            hold of it" — leaving a gold squiggle that reads as decoration.

            So barely any of it goes. Enough that it is still attached to the
            wall rather than floating beside it.
          */
          className={forward ? '-mr-[10px]' : '-ml-[10px]'}
          style={{
            transform: forward ? 'scaleX(-1)' : undefined,
            lineHeight: 0,
          }}
        >
          <motion.img
            src={PLATE}
            srcSet={PLATE_SRCSET}
            sizes={`${big ? PLATE_W_BIG : PLATE_W_WIDE}px`}
            alt=""
            aria-hidden
            draggable={false}
            /* Intrinsic size on the attributes, drawn size in the class, so
               the browser reserves the right box before the file lands. */
            width={440}
            height={251}
            /*
              Written out rather than built from a constant: Tailwind reads
              this file as text and never sees a class name it has to
              assemble.

              THE PHONE SIZE IS THE CONSTRAINED ONE. A room's content column
              on a 420px screen runs from about 74px to about 346px, and this
              fitting is pinned to the left edge at the same height as some of
              it. That column is what caps the phone width — go much past this
              and the brass starts eating taps meant for the answers.

              BOTH SIZES WENT UP, because "can a child find it" beat "is it
              tidy". At 92/152 the fitting read as a gold squiggle in the
              corner of a dark room: present, but not obviously a thing you
              take hold of, and the one control every screen depends on. The
              hub gets away with smaller because its doors are painted into
              the art at full size; a room has only this.
            */
            className={
              big
                ? 'h-auto w-[124px] max-w-none select-none sm:w-[210px] lg:w-[300px]'
                : 'h-auto w-[124px] max-w-none select-none sm:w-[210px]'
            }
            animate={{ rotate: pressed ? PRESS_DEG : 0 }}
            transition={{ type: 'spring', stiffness: 240, damping: 15 }}
            style={{
              transformOrigin: PIVOT,
              // The awake state, from the same pixels: brighter, and throwing
              // more light onto the wall around it.
              //
              // THE RESTING STATE IS NO LONGER NEARLY-OFF. The old plate was
              // dark brass and had to be dimmed further to stay out of the
              // way; this one is lit gold and can simply sit there at full
              // strength. A control a child cannot find is not subtle.
              filter: live
                ? `brightness(1.18) saturate(1.14) drop-shadow(0 0 26px ${accent}EE)`
                : `drop-shadow(0 0 18px ${accent}AA) drop-shadow(0 4px 12px rgba(0,0,0,0.55))`,
              transition: 'filter 520ms ease-out',
            }}
          />
        </div>

        {/*
          The name, horizontal and readable. Never rotated down the edge of
          the screen: a six-year-old cannot read sideways text, and a label
          they cannot read is not a label.
        */}
        <AnimatePresence>
          {tip && (
            <motion.span
              aria-hidden
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.28 }}
              className="pointer-events-none absolute bottom-full mb-1 whitespace-nowrap rounded-full px-3 py-1.5 text-[11.5px] font-extrabold"
              style={{
                // ABOVE the fitting, not beside it. Beside it put the words
                // straight over whatever the screen was already showing —
                // on the hub, exactly on top of a room's name. Above, they
                // sit in the gap and read against the dark.
                [forward ? 'right' : 'left']: 2,
                background: '#0B0818',
                border: `1.5px solid ${accent}`,
                boxShadow: `0 4px 18px rgba(0,0,0,0.7), 0 0 18px -4px ${accent}`,
                color: CHROME.text,
                fontFamily: FONT,
              } as React.CSSProperties}
            >
              {tipText}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Motes gather when a hand nears and spiral away on the press.
            Never when quiet — a child who is upset is not charmed by these. */}
        {!m.quiet && live && <Motes out={pressed} accent={accent} forward={forward} />}

      </motion.button>
    </div>
  );

  /*
    AND OUT TO <body>, WHICH IS THE OTHER HALF OF THE FIXED-POSITIONING FIGHT.

    `position: fixed` means "against the viewport" only while no ancestor has
    a transform, a filter or a clip-path on it. BestApp wraps every screen in
    a framer-motion div that has all three at various points — it is the arch
    wipe between rooms — and a transformed ancestor silently becomes the
    containing block for anything fixed inside it.

    On a desktop that is invisible: the wrapper happens to fill the viewport,
    so "the bottom of the wrapper" and "the bottom of the screen" are the same
    place. On a phone, or on half a screen, the room's content column is
    taller than the viewport and the wrapper grows with it — so `items-end`
    plus 26vh of padding put the handle 26vh above the bottom of a page that
    scrolls, i.e. a long way below the fold. The handles were not missing on
    narrow screens; they were rendered, correctly, somewhere nobody could see.

    A portal is the fix rather than hunting transforms out of the ancestors:
    the wipe is worth having, and this way the fitting is fixed to the actual
    window no matter what any screen above it decides to animate later.
  */
  return typeof document === 'undefined' ? handle : createPortal(handle, document.body);
}

/*
  THE PEEPHOLES ARE GONE.

  Each door carried a small circular window with a looping glimpse of what
  was behind it — fireflies drifting, a loose thread, a figure pacing. The
  idea was that a child reads a door by what they can see through it.

  On the actual screen they read as three black discs with coloured rims
  stuck to the wall. The problem is the room behind a door in this app is
  DARK, so an honest window onto it is a dark hole — and at 52px a hole is
  what the eye gets, with the two or three moving dots inside far too small
  to register as life. A brighter window would have been a lie about the
  room, and a bigger one would have swallowed the brass fitting that is the
  actual control.

  Kept in git rather than reworked: the seam of warm light around each door
  was already doing this job, and doing it better.
*/

/**
 * Eight motes, deterministic. Random numbers during render are a purity
 * error, and a handle that sparkles differently every paint reads as noise.
 */
const MOTE = Array.from({ length: 8 }, (_, i) => ({
  a: (i / 8) * Math.PI * 2,
  d: 24 + ((i * 17) % 22),
  s: 3 + ((i * 7) % 3),
  delay: (i % 4) * 0.06,
}));

function Motes({ out, accent, forward }: { out: boolean; accent: string; forward: boolean }) {
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center">
      {MOTE.map((p, i) => (
        <motion.span
          key={i}
          className="absolute block rounded-full"
          style={{ width: p.s, height: p.s, background: accent, boxShadow: `0 0 9px ${accent}` }}
          initial={{ x: 0, y: 0, opacity: 0 }}
          animate={
            out
              ? {
                  x: Math.cos(p.a) * p.d * 2.4 * (forward ? -1 : 1),
                  y: Math.sin(p.a) * p.d * 1.7,
                  opacity: [0.9, 0],
                  scale: [1, 0.3],
                }
              : {
                  x: [0, Math.cos(p.a) * p.d * 0.5, 0],
                  y: [0, Math.sin(p.a) * p.d * 0.4, 0],
                  opacity: [0, 0.75, 0],
                }
          }
          transition={
            out
              ? { duration: 0.75, ease: 'easeOut', delay: p.delay }
              : { repeat: Infinity, duration: 3 + (i % 3) * 0.5, delay: p.delay, ease: 'easeInOut' }
          }
        />
      ))}
    </span>
  );
}
