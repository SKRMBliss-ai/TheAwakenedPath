import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CHROME, FONT } from './chrome';
import { useMotion } from './quiet';
import { companionFor } from '../kit/feelingCompanions';
import * as sound from '../kit/sound';

/**
 * THE FEELING, IN THE ROOM.
 *
 * Once a child has said what they're feeling, that feeling turns up with
 * them — the boy and Chirpy wearing it — and drifts slowly about the room
 * for the rest of the walk. Tapping it gets one small true thing about what
 * that feeling is like.
 *
 * WHY IT DRIFTS RATHER THAN SITS. A feeling that is pinned in a corner is a
 * label on the child. One that wanders around the room is company: present,
 * not the point, and impossible to mistake for a score. It also can't be
 * dismissed, because there is nothing to dismiss — it simply keeps them
 * company until they leave.
 *
 * WHAT IT NEVER DOES. It doesn't ask anything. It doesn't want a tap. It
 * never says the feeling is wrong, or offers a way out of it (see
 * kit/feelingCompanions for why that rule is absolute). And it never
 * changes on its own — the child said "sad", so it stays sad until the
 * child says otherwise.
 *
 * THE QUIET STATE keeps it and stops it. This is the one drifting thing in
 * the app that isn't removed when a child is distressed: Chirpy goes,
 * because Chirpy is a performer, but this is the child's own answer made
 * visible, and taking it away at the moment it matters most would be the
 * app flinching. It holds still instead, and still answers a tap.
 */

/**
 * Waypoints as viewport percentages — a long, lazy circuit of the lower
 * half of the room. It stays low on purpose: the question and its hint live
 * in the upper third, and a companion wandering through them makes both
 * harder to read even from behind.
 */
const DRIFT = {
  left: ['4%', '58%', '64%', '6%', '4%'],
  top: ['54%', '50%', '70%', '73%', '54%'],
};

export function FloatingFeeling({ feeling, size = 112 }: { feeling: string | null; size?: number }) {
  const m = useMotion();
  const [line, setLine] = useState<number | null>(null);
  const companion = companionFor(feeling);

  if (!companion) return null;

  function speak() {
    if (!companion) return;
    sound.play('discovery');
    // Cycles rather than repeats — four taps get four things, not the same
    // sentence four times.
    setLine((n) => (n === null ? 0 : (n + 1) % companion.guidance.length));
  }

  return (
    /* No z-index, deliberately. An absolutely-positioned box with z-auto
       makes no stacking context, so the sprite below can sit BEHIND the
       question (it comes first in the DOM) while the speech card can still
       lift above it. With z-10 here the whole thing painted over the text,
       which turned company into an obstruction. */
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute"
        style={{ left: DRIFT.left[0], top: DRIFT.top[0] }}
        animate={m.quiet ? undefined : { left: DRIFT.left, top: DRIFT.top }}
        transition={m.quiet ? undefined : { repeat: Infinity, duration: 48, ease: 'easeInOut', times: [0, 0.25, 0.5, 0.75, 1] }}
      >
        <motion.button
          onClick={speak}
          aria-label={`${feeling}. Tap to hear about this feeling.`}
          className="pointer-events-auto relative block border-0 bg-transparent p-0"
          whileTap={{ scale: 0.94 }}
          animate={m.quiet ? { y: 0 } : { y: [0, -9, 0] }}
          transition={m.quiet ? undefined : { repeat: Infinity, duration: 5.4, ease: 'easeInOut' }}
        >
          <img
            src={companion.src}
            alt=""
            draggable={false}
            width={size}
            className="max-w-none select-none"
            style={{
              // Sits back in the room. It is company, not the subject —
              // the question a child is answering has to stay the brightest
              // thing on the screen.
              opacity: 0.72,
              filter: 'drop-shadow(0 10px 26px rgba(0,0,0,0.55))',
            }}
          />
        </motion.button>

        {/* What it has to say, next to it rather than over the screen, so
            reading it never covers the question the child is answering. */}
        <AnimatePresence>
          {line !== null && (
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
