import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CHROME, FONT } from '../ui/chrome';
import { useMotion } from '../ui/quiet';
import { chirpySprite } from '../ui/sprites';
import { agoLabel } from '../kit/cases';
import { markAsked, type ChirpyRecollection } from '../kit/chirpyMemory';
import * as sound from '../kit/sound';

/**
 * "YOU TOLD ME ABOUT THIS. IT WAS AGES AGO."
 *
 * The one moment in the app where what a child said comes back as talk rather
 * than as a record — see kit/chirpyMemory for why the slip is always the
 * feeling and never their own words.
 *
 * WHAT THIS IS NOT: a quiz. There is no right answer, no score, no "correct!",
 * and crucially no receipt — if the child answers with a feeling that isn't
 * the one on the case, Chirpy takes it and thanks them. The app has the old
 * answer written down and will never once produce it to win an argument with a
 * six-year-old about their own afternoon. They are allowed to have changed
 * their mind, or to have been wrong then, or to be wrong now.
 *
 * IT CAN ALWAYS BE WAVED AWAY. "Not now" costs nothing and spends the case
 * anyway, so a child who doesn't want to think about that day is not asked
 * about it again next week. The whole point is that this is a nice thing that
 * happens to them, and a nice thing you can't decline isn't one.
 */
export function ChirpyRemembers({
  recollection,
  onDone,
}: {
  recollection: ChirpyRecollection;
  onDone: () => void;
}) {
  const m = useMotion();
  const [answered, setAnswered] = useState<string | null>(null);

  const accent = '#8FD9C4';

  const answer = (feeling: string) => {
    if (answered) return;
    sound.play('discovery');
    setAnswered(feeling);
    markAsked(recollection.day);
    // Long enough to read what he says back, then it folds away by itself —
    // nothing here needs a second tap to dismiss.
    window.setTimeout(onDone, m.quiet ? 3400 : 2600);
  };

  const dismiss = () => {
    markAsked(recollection.day);
    onDone();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: m.quiet ? 0.6 : 0.42 }}
      className="mt-4 rounded-[24px] px-4 py-4 backdrop-blur-md"
      style={{
        background: CHROME.pill,
        border: `1px solid ${accent}66`,
        boxShadow: `0 0 30px -12px ${accent}`,
        fontFamily: FONT,
      }}
    >
      <div className="flex items-start gap-3">
        <img
          src={chirpySprite(answered ? 'hopeful' : 'curious')}
          alt=""
          aria-hidden
          draggable={false}
          className="mt-0.5 h-11 w-11 shrink-0 select-none"
          style={{ filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.5))' }}
        />

        <div className="min-w-0 flex-1">
          <AnimatePresence mode="wait">
            {!answered ? (
              <motion.div key="asking" exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <p className="text-[14px] font-bold leading-snug" style={{ color: CHROME.text }}>
                  You told me about this, {agoLabel(recollection.day)}.
                </p>

                {/* THEIR OWN WORDS, EXACTLY. The whole thing rests on this
                    being what they actually said, so it is set apart as a
                    quotation rather than folded into Chirpy's line. */}
                <p
                  className="mt-2 border-l-2 pl-3 text-[14.5px] font-semibold italic leading-snug"
                  style={{ color: CHROME.text, borderColor: accent }}
                >
                  “{recollection.quote}”
                </p>

                <p className="mt-2.5 text-[13.5px] font-semibold leading-snug" style={{ color: CHROME.textSoft }}>
                  You were {recollection.guess.toLowerCase()} about it, weren’t you? I think that was it.
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {recollection.options.map((f) => (
                    <button
                      key={f}
                      onClick={() => answer(f)}
                      className="rounded-full px-3.5 text-[13px] font-extrabold"
                      style={{
                        minHeight: m.target,
                        background: CHROME.pillSelected,
                        border: `1px solid ${CHROME.pillBorder}`,
                        color: CHROME.text,
                      }}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                <button
                  onClick={dismiss}
                  className="mt-2.5 text-[12px] font-bold"
                  style={{ color: CHROME.textSoft, minHeight: 32 }}
                >
                  Not now
                </button>
              </motion.div>
            ) : (
              <motion.p
                key="answered"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="text-[14px] font-bold leading-snug"
                style={{ color: CHROME.text }}
              >
                {answered === recollection.guess
                  ? `${answered}. I did remember, then. I don’t always.`
                  : `${answered}. Not ${recollection.guess.toLowerCase()} — ${answered.toLowerCase()}. I’ll keep it right this time.`}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
