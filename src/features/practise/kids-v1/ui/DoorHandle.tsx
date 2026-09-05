import { useEffect, useState } from 'react';
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

const PLATE = '/ui/handles/handle.webp';
const SEAM = '/ui/handles/seam.webp';

/** The lever swings this far when pressed. Small: it reads as weight, not spin. */
const PRESS_DEG = 8;

/** Where the rose sits in the plate — the point a real lever pivots about. */
const PIVOT = '19% 50%';

/** How long the name hangs there on arrival before it fades back. */
const TIP_MS = 2800;

export function DoorHandle({
  side,
  label,
  onClick,
  /** The room's own accent, so the light belongs to the room it's in. */
  accent = '#FFD98A',
}: {
  side: 'left' | 'right';
  /** Both the accessible name and the words on the tooltip. */
  label: string;
  onClick: () => void;
  accent?: string;
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

  // The plate is drawn for the LEFT wall: its rose is at the left and the
  // lever sweeps inward, into the room. The right-hand fitting is the same
  // file mirrored, so both levers point into the room the child is in.
  const forward = side === 'right';
  const live = awake || pressed;
  const tip = introTip || awake || pressed;

  function press() {
    if (pressed) return;
    setPressed(true);
    sound.play(forward ? 'enterRoom' : 'exitRoom');
    // The handle finishes travelling before the room changes — the world
    // acknowledging the touch is the point, and it takes a moment.
    window.setTimeout(onClick, m.quiet ? 420 : 320);
  }

  return (
    <div
      /*
        FIXED, not absolute. Absolute made the handle span the whole
        document, which is fine on a screen that fits and useless on the hub,
        where the page scrolls: the fitting ended up pinned three-quarters of
        the way down a very long page, i.e. nowhere a child would ever see
        it. Fixed keeps it on the wall of the room rather than on the wall of
        the document, so it is reachable at every scroll position.
      */
      className="pointer-events-none fixed inset-y-0 z-20 flex items-end"
      style={{ [side]: 0, paddingBottom: '26vh' } as React.CSSProperties}
    >
      {/* The seam. Always there, and at rest doing the whole job on its own —
          light leaking around a door that is definitely a door. */}
      <img
        src={SEAM}
        alt=""
        aria-hidden
        draggable={false}
        className="absolute inset-y-0 h-full select-none"
        style={{
          // Pulled mostly off the edge and blurred, so what shows is the
          // outer falloff rather than the bright core. Straight, sharp and
          // full-strength it read as a laser down the side of the screen —
          // the opposite of light escaping around a door.
          [side]: -46,
          width: 92,
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
            className="pointer-events-none absolute rounded-full"
            style={{ width: 86, height: 86, background: `radial-gradient(circle, ${accent}77 0%, ${accent}22 42%, transparent 70%)` }}
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
          style={{
            transform: forward ? 'scaleX(-1)' : undefined,
            // Runs off the edge of the screen the way a real fitting runs
            // on past the door frame — and keeps the lever clear of content.
            marginLeft: forward ? 0 : -22,
            marginRight: forward ? -22 : 0,
            lineHeight: 0,
          }}
        >
          <motion.img
            src={PLATE}
            alt=""
            aria-hidden
            draggable={false}
            className="max-w-none select-none"
            width={88}
            animate={{ rotate: pressed ? PRESS_DEG : 0 }}
            transition={{ type: 'spring', stiffness: 240, damping: 15 }}
            style={{
              transformOrigin: PIVOT,
              // The awake state, from the same pixels: warmer, brighter, and
              // throwing light onto the wall around it.
              filter: live
                ? `brightness(1.34) saturate(1.28) drop-shadow(0 0 20px ${accent}CC)`
                : `brightness(${forward ? 1.12 : 1}) saturate(${forward ? 1.05 : 0.94}) drop-shadow(0 0 13px ${accent}88)`,
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
              {label}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Motes gather when a hand nears and spiral away on the press.
            Never when quiet — a child who is upset is not charmed by these. */}
        {!m.quiet && live && <Motes out={pressed} accent={accent} forward={forward} />}
      </motion.button>
    </div>
  );
}

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
