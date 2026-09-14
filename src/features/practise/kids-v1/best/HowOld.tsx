import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CHROME, FONT } from '../ui/chrome';
import { useMotion } from '../ui/quiet';
import { useSpoken } from '../ui/useSpoken';
import { AGES, declineAge, setAge } from '../kit/band';
import * as sound from '../kit/sound';

/**
 * Chirpy asking how old you are. Once, ever.
 *
 * WHY HE HAS TO ASK. The founder's teaching-moves document bands nearly every
 * section — 3–8, 9–14, or both — and gives two separate moves for the same
 * idea in three places precisely so there is one to pick for each age. Without
 * knowing which band a child is in, half that library has to be held back
 * (see kit/teachings), so a nine-year-old never meets the purple elephant and
 * a five-year-old never meets the scared dog. Asking buys back ten moves.
 *
 * WHY IT IS CHIRPY AND NOT A FORM. This could have been a field in the
 * onboarding, next to the name. It isn't, for two reasons. Every install that
 * already exists has been through onboarding and would never be asked. And
 * more importantly, a question in a form is an app collecting data, whereas a
 * bird asking how old you are is a conversation — children are generally
 * delighted to be asked their age, it is a thing they are proud of, and the
 * difference in how it feels is entirely in who is asking and why.
 *
 * SO HE SAYS WHY. "Some of my games are better for different ages" is the
 * actual reason, it is true, and a child can evaluate it. An app that asks a
 * personal question without saying what it wants it for has taught the child
 * something worse than whatever the question was for.
 *
 * AND NOT SAYING IS A REAL ANSWER. It is on the card, it is not buried, and
 * choosing it is final — he never asks again, and the app carries on with the
 * eight universal moves. Nothing in here is withheld as leverage.
 */
export function HowOld({ onDone }: { onDone: () => void }) {
  const m = useMotion();
  const [said, setSaid] = useState<string | null>(null);

  useSpoken(said ?? 'How old are you? Some of my games are better for different ages.');

  const pick = (years: number) => {
    sound.play('miniWin');
    setAge(years);
    setSaid(
      years >= 9
        ? `${years}. Right — I’ve got some good ones for ${years}.`
        : `${years}! Brilliant. I know exactly which games to bring you.`,
    );
  };

  const decline = () => {
    sound.play('tap');
    declineAge();
    setSaid('No bother. I’ll bring the ones that work for everybody.');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: m.quiet ? 0.6 : 0.45 }}
      className="mt-4 rounded-[24px] px-4 py-4 backdrop-blur-md"
      style={{ background: CHROME.pill, border: '1px solid #E8A2D055', fontFamily: FONT }}
    >
      <p className="text-[11px] font-extrabold uppercase tracking-[0.12em]" style={{ color: '#E8A2D0' }}>
        Chirpy
      </p>

      <AnimatePresence mode="wait">
        {said === null ? (
          <motion.div key="ask" exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <p className="mt-1.5 text-[14.5px] font-bold leading-snug" style={{ color: CHROME.text }}>
              How old are you?
            </p>
            <p className="mt-1 text-[13px] font-semibold leading-snug" style={{ color: CHROME.textSoft }}>
              Some of my games are better for different ages, that’s all.
            </p>

            {/* A row of numbers to tap rather than a field to fill in. The
                targets are the full quiet-state size in both states — this is
                the one card in the app a child might well be tapping at
                speed, pleased to be asked. */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {AGES.map((a) => (
                <button
                  key={a}
                  onClick={() => pick(a)}
                  aria-label={`I am ${a}`}
                  className="grid place-items-center rounded-full text-[14px] font-extrabold"
                  style={{
                    minWidth: m.target,
                    minHeight: m.target,
                    background: CHROME.pillSelected,
                    border: `1px solid ${CHROME.pillBorder}`,
                    color: CHROME.text,
                  }}
                >
                  {a}
                </button>
              ))}
            </div>

            <button
              onClick={decline}
              className="mt-2.5 text-[12.5px] font-bold"
              style={{ color: CHROME.textSoft, minHeight: 36 }}
            >
              I’d rather not say
            </button>
          </motion.div>
        ) : (
          <motion.div key="said" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p
              className="mt-1.5 text-[14.5px] font-bold leading-snug"
              style={{ color: CHROME.text, textWrap: 'balance' }}
            >
              {said}
            </p>
            <button
              onClick={() => { sound.play('resolve'); onDone(); }}
              className="mt-2.5 text-[12.5px] font-bold"
              style={{ color: CHROME.textSoft, minHeight: 36 }}
            >
              Okay
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
