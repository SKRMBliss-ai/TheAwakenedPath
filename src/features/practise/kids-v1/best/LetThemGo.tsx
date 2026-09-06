import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CHROME, FONT } from '../ui/chrome';
import { useMotion } from '../ui/quiet';
import { release, releasedCount } from '../kit/sky';
import * as sound from '../kit/sound';

/**
 * "LET SOME GO."
 *
 * The Observatory's jar holds every firefly the child has ever caught, and
 * until now the only thing they could do with it was watch it get bigger.
 * This is the other verb: open the lid, and some of them go up into the gym's
 * sky and stay there.
 *
 * SEPARATE FROM THE JAR ON PURPOSE. Tapping the jar already glitters and
 * flies the count out, and hanging a second, irreversible gesture off the
 * same object is how a child lets go of forty fireflies while trying to see
 * how many they have. This is its own small card, with its own words.
 *
 * IT IS NOT A COST AND IT IS NOT A PURCHASE. The lifetime total doesn't move;
 * see kit/sky's note. Nothing is unlocked, no threshold is approached, and the
 * card never says how many are left to go as though that were a target — it
 * says how many they still hold, which is a fact about them rather than a
 * gap to close.
 *
 * A FEW AT A TIME. Letting the whole jar go on one tap makes the gesture a
 * button press; five at a time makes it something a child does deliberately,
 * more than once, on the evenings they feel like it.
 */

/** How many leave on one tap. */
const BATCH = 5;

export function LetThemGo({ lifetimeTotal }: { lifetimeTotal: number }) {
  const m = useMotion();
  const [released, setReleased] = useState(() => releasedCount());
  /** The batch currently in flight, so the animation shows what actually left. */
  const [flying, setFlying] = useState(0);

  const held = Math.max(0, lifetimeTotal - released);

  // Nothing caught yet, or everything already up there. Either way there is
  // no offer to make, and an empty card saying so would be the app talking
  // about itself.
  if (held <= 0) {
    return released > 0 ? (
      <p
        className="mx-auto mt-4 max-w-md text-center text-[13px] font-semibold"
        style={{ color: CHROME.textSoft, fontFamily: FONT }}
      >
        Every one you’ve caught is up in the sky now.
      </p>
    ) : null;
  }

  const letGo = () => {
    const going = Math.min(BATCH, held);
    sound.play('resolve');
    setReleased(release(going, lifetimeTotal));
    setFlying(going);
    window.setTimeout(() => setFlying(0), 1800);
  };

  return (
    <div
      className="relative mx-auto mt-4 max-w-md overflow-visible rounded-[22px] px-4 py-3.5 text-center backdrop-blur-md"
      style={{
        background: 'rgba(10,8,24,0.5)',
        border: `1px solid ${CHROME.pillBorder}`,
        fontFamily: FONT,
      }}
    >
      <p className="text-[13.5px] font-bold" style={{ color: CHROME.text }}>
        You’re holding {held} {held === 1 ? 'firefly' : 'fireflies'}.
      </p>
      <p className="mt-0.5 text-[12.5px] font-semibold" style={{ color: CHROME.textSoft }}>
        {released > 0
          ? `${released} of them are already up in the sky.`
          : 'You can let some go, if you like. They go up into the sky and stay there.'}
      </p>

      <button
        onClick={letGo}
        className="mt-3 rounded-full px-5 text-[13px] font-extrabold"
        style={{
          minHeight: m.target,
          background: CHROME.pillSelected,
          border: `1px solid ${CHROME.pillBorder}`,
          color: CHROME.text,
        }}
      >
        Let some go
      </button>

      {/* The ones leaving, drifting up and out of the card. Never in the
          quiet state — see §7; the release still happens, silently. */}
      <AnimatePresence>
        {flying > 0 && !m.quiet && (
          <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-6 block">
            {Array.from({ length: flying }).map((_, i) => (
              <motion.span
                key={i}
                className="absolute left-1/2 block h-[5px] w-[5px] rounded-full"
                style={{ background: '#FFE7B4', boxShadow: '0 0 10px #FFC65C' }}
                initial={{ y: 0, x: 0, opacity: 0 }}
                animate={{
                  y: -150 - i * 16,
                  x: (i % 2 ? 1 : -1) * (14 + i * 11),
                  opacity: [0, 1, 1, 0],
                }}
                transition={{ duration: 1.7, delay: i * 0.11, ease: 'easeOut' }}
              />
            ))}
          </span>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * THE SKY THEY FILLED, on the hub.
 *
 * Every light here is one the child deliberately let go of — which is the
 * only reason it's worth looking at. Drawn behind everything, drifting
 * slowly, and never counted on screen: the moment there's a number next to
 * it, letting go becomes scoring.
 *
 * Draws at most `MAX` of them however many were released. A hundred lights is
 * not a fuller sky, it's a noisier one, and past a point the child is looking
 * at texture rather than at their own fireflies.
 */
const MAX = 28;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

/** Fixed positions, so a light never moves once it is in the sky. */
const SPOTS = Array.from({ length: MAX }, (_, i) => {
  const t = (i + 0.5) / MAX;
  const a = i * GOLDEN_ANGLE;
  return {
    left: `${8 + ((Math.cos(a) * Math.sqrt(t) + 1) / 2) * 84}%`,
    top: `${4 + ((Math.sin(a) * Math.sqrt(t) + 1) / 2) * 42}%`,
    size: 2 + (i % 3),
    delay: (i % 7) * 0.6,
    duration: 3.4 + (i % 4) * 0.7,
  };
});

export function ReleasedSky({ count }: { count: number }) {
  const m = useMotion();
  const shown = Math.min(count, MAX);
  if (shown <= 0) return null;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {SPOTS.slice(0, shown).map((s, i) => (
        <motion.span
          key={i}
          className="absolute block rounded-full"
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            background: '#FFE7B4',
            boxShadow: `0 0 ${4 + s.size}px #FFC65C`,
          }}
          animate={m.quiet ? { opacity: 0.5 } : { opacity: [0.25, 0.9, 0.25] }}
          transition={m.quiet ? { duration: 0.4 } : { repeat: Infinity, duration: s.duration, delay: s.delay, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}
