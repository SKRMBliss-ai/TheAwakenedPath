import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { chirpySprite, type ChirpyPose } from '../ui/sprites';
import { useMotion } from '../ui/quiet';
import { FONT } from '../ui/chrome';

/**
 * CHIRPY, TALKING TO HIMSELF, WHILE THE CHILD LOOKS AT THEIR CARDS.
 *
 * He drifts from spot to spot around the room and says his piece line by
 * line, on his own clock. Nothing to tap, nothing to dismiss, no "next".
 *
 * WHY IT AUTO-PLAYS. Tapping through six lines makes them a task to get to
 * the end of, and a child tapping fast reads none of them. Left to run,
 * this is a small creature wandering about muttering while you look at
 * something else — which is much closer to how anyone actually takes in an
 * idea, and a child can ignore it entirely and lose nothing.
 *
 * He is never in the middle. He circles the edges, because the cards are the
 * thing being looked at and he is company beside them, not the subject.
 */

/**
 * Where he can be — percentages of the wander layer, which is the LOWER part
 * of the screen only (see the container below).
 *
 * He is kept out of the top because that is where the child's cards are, and
 * a speech bubble landing on top of "I felt … Worried" is worse than useless:
 * it covers the one thing the screen exists to show. Down here the room is
 * empty and he has it to himself.
 */
const SPOTS = [
  { left: '4%', top: '2%', align: 'left' as const },
  { left: '40%', top: '38%', align: 'right' as const },
  { left: '6%', top: '52%', align: 'left' as const },
  { left: '44%', top: '8%', align: 'right' as const },
  { left: '2%', top: '30%', align: 'left' as const },
  { left: '38%', top: '58%', align: 'right' as const },
];

export function WanderingChirpy({
  lines,
  poses,
  /** Milliseconds each line stays up. */
  dwell = 4200,
  onFinished,
}: {
  lines: string[];
  /** Optional pose per line; falls back to a gentle default. */
  poses?: ChirpyPose[];
  dwell?: number;
  /** Called once he's said the last line — the screen can move on. */
  onFinished?: () => void;
}) {
  const m = useMotion();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (i >= lines.length - 1) {
      // He's said it all. Tell the caller once, then stay put and quiet.
      const t = window.setTimeout(() => onFinished?.(), dwell);
      return () => clearTimeout(t);
    }
    const t = window.setTimeout(() => setI((n) => n + 1), dwell);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, lines.length, dwell]);

  // He never appears in the quiet state, same as everywhere else in the app:
  // a distressed child does not need a character talking at them.
  if (m.quiet) return null;

  const spot = SPOTS[i % SPOTS.length];
  const pose: ChirpyPose = poses?.[i] ?? 'curious';

  return (
    // Bottom 44% of the screen. The cards live above this line.
    <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 overflow-hidden" style={{ height: '44%' }}>
      <motion.div
        className="absolute"
        animate={{ left: spot.left, top: spot.top }}
        transition={{ type: 'spring', stiffness: 42, damping: 15, mass: 1.1 }}
        style={{ left: spot.left, top: spot.top, maxWidth: '58%' }}
      >
        <div className={`flex items-end gap-2 ${spot.align === 'right' ? 'flex-row-reverse' : 'flex-row'}`}>
          <motion.img
            src={chirpySprite(pose)}
            alt=""
            draggable={false}
            className="h-[62px] w-auto shrink-0"
            style={{ filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.55))' }}
            // A little bob as he goes, so he reads as walking rather than
            // being teleported from spot to spot.
            animate={{ y: [0, -6, 0], rotate: [0, -3, 2, 0] }}
            transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
          />
          <AnimatePresence mode="wait">
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 8, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.96 }}
              transition={{ duration: 0.35 }}
              className="rounded-[18px] px-4 py-2.5 text-[13.5px] font-extrabold leading-snug shadow-xl"
              style={{ background: 'rgba(255,255,255,0.95)', color: '#241D3D', fontFamily: FONT }}
            >
              {lines[i]}
            </motion.p>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
