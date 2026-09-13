import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CHROME, FONT } from '../ui/chrome';
import { useMotion } from '../ui/quiet';
import { answerReveal, beatShown, REPLIES, type ArcBeat } from '../kit/chirpyArc';
import * as sound from '../kit/sound';
import { useSpoken } from '../ui/useSpoken';

/**
 * Chirpy, mentioning something. See kit/chirpyArc for what he's circling and
 * why it takes months.
 *
 * A CLUE IS NOT AN EVENT. It shows up looking like every other thing he says,
 * with no marker, no chime, no "Chirpy has something to tell you" — the whole
 * design depends on the child noticing the pattern themselves, in their own
 * time, and a badge on it would do the noticing for them.
 *
 * THE REVEAL IS THE ONE MOMENT THIS ARC EXISTS FOR, so it is the only beat
 * that waits for an answer, and it does not count as delivered until the
 * child gives one. Closing the app halfway through it loses nothing.
 */
export function ChirpyArc({ beat, onDone }: { beat: ArcBeat; onDone: () => void }) {
  const m = useMotion();
  const [took, setTook] = useState<string | null>(null);

  const accent = '#8FD9C4';
  const isReveal = beat.kind === 'reveal';

  /* He is speaking, so he is heard. His line first; once the child has
     answered, what he says back. */
  useSpoken(took ?? beat.line);

  const dismiss = () => {
    beatShown(beat.kind);
    onDone();
  };

  const reply = (r: string) => {
    if (took) return;
    sound.play('resolve');
    setTook(answerReveal(r));
    window.setTimeout(onDone, m.quiet ? 4200 : 3200);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: m.quiet ? 0.6 : 0.45 }}
      className="mt-4 rounded-[24px] px-4 py-4 backdrop-blur-md"
      style={{
        background: CHROME.pill,
        border: `1px solid ${accent}55`,
        fontFamily: FONT,
      }}
    >
      <div>
        {/* No 44px sprite here any more — see ChirpyRemembers for why the
            small ones had to go. His name in his own colour is enough, and
            on the reveal it's arguably better: a cartoon face pulling a
            worried expression undercuts the one moment in the arc where he
            says something true about himself. */}
        <p className="text-[11px] font-extrabold uppercase tracking-[0.12em]" style={{ color: accent }}>
          Chirpy
        </p>

        <div className="mt-1.5 min-w-0 flex-1">
          <AnimatePresence mode="wait">
            {took ? (
              <motion.p
                key="took"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="text-[14.5px] font-bold leading-snug"
                style={{ color: CHROME.text }}
              >
                {took}
              </motion.p>
            ) : (
              <motion.div key="saying" exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <p
                  className="text-[14.5px] font-bold leading-snug"
                  style={{ color: CHROME.text, textWrap: 'balance' }}
                >
                  {beat.line}
                </p>

                {isReveal ? (
                  <div className="mt-3 flex flex-col items-start gap-2">
                    {REPLIES.map((r) => (
                      <button
                        key={r}
                        onClick={() => reply(r)}
                        className="rounded-full px-3.5 text-left text-[13px] font-extrabold"
                        style={{
                          minHeight: m.target,
                          background: CHROME.pillSelected,
                          border: `1px solid ${CHROME.pillBorder}`,
                          color: CHROME.text,
                        }}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                ) : (
                  // A clue needs no reply at all — it's a friend saying
                  // something on the way past. Tapping just moves on.
                  <button
                    onClick={dismiss}
                    className="mt-2.5 text-[12.5px] font-bold"
                    style={{ color: CHROME.textSoft, minHeight: 36 }}
                  >
                    Okay
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
