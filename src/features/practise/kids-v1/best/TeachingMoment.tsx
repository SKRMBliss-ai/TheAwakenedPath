import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CHROME, FONT } from '../ui/chrome';
import { useMotion } from '../ui/quiet';
import { teachingShown, type Teaching } from '../kit/teachings';
import * as sound from '../kit/sound';
import { useSpoken } from '../ui/useSpoken';

/**
 * Chirpy running one of the teaching moves. See kit/teachings for the
 * sixteen of them and for the founder's rule they all follow.
 *
 * THE HOLD IS THE WHOLE THING. Most of these are instructions that cannot be
 * followed — try not to laugh, don't think about a purple elephant, go quiet
 * inside your head — and they only work if the child is actually left alone
 * to fail at them. So the middle of this card is a timer with nothing on it
 * but the instruction, and no way to skip: ten seconds of a screen that has
 * stopped talking is what makes the payoff land. Give a child a Next button
 * there and they will press it, and then Chirpy is telling them what would
 * have happened rather than asking what did.
 *
 * THE PAYOFF ARRIVES A LINE AT A TIME, at reading pace. All of it at once is
 * a paragraph, and a paragraph is the thing a child's eye slides off. Staged,
 * it reads as somebody talking.
 *
 * BORROWED IMAGES SKIP THE MIDDLE. Nothing is being tested — he is just
 * saying a thing about smoke alarms — so they go straight from the opening to
 * the payoff on a tap.
 */

/**
 * A different colour for each shape of move, so the fourth one a child meets
 * does not look like a re-run of the first. It is the only thing on the card
 * that says anything about what kind of thing is about to happen, which is
 * roughly the right amount: enough that the screen has variety in it, not so
 * much that the trapdoors announce themselves and stop working.
 */
const ACCENT: Record<Teaching['kind'], string> = {
  trapdoor: '#FFC65C',
  experiment: '#6FD3E8',
  image: '#C48BE8',
};

export function TeachingMoment({ teaching, onDone }: { teaching: Teaching; onDone: () => void }) {
  const m = useMotion();
  const accent = ACCENT[teaching.kind];

  const [phase, setPhase] = useState<'open' | 'hold' | 'land'>('open');
  const [left, setLeft] = useState(teaching.hold ?? 0);
  /** How many payoff lines have arrived. */
  const [said, setSaid] = useState(0);

  /* Whatever is currently on screen is what gets read out. During the hold
     that is the instruction, which is the one moment a child may well not be
     looking at the screen at all. */
  useSpoken(
    phase === 'open' ? teaching.open.join(' ')
    : phase === 'hold' ? (teaching.dare ?? '')
    : teaching.land.slice(0, said).join(' '),
  );

  /* The countdown. One tick a second, and it is the only way out of the hold.
     Both the tick and the handover to the payoff happen inside the timeout
     rather than in the body of the effect, so the last second doesn't land as
     a synchronous re-render on top of the one that scheduled it. */
  useEffect(() => {
    if (phase !== 'hold') return;
    const t = window.setTimeout(() => {
      if (left <= 1) { setLeft(0); setPhase('land'); } else { setLeft(left - 1); }
    }, 1000);
    return () => window.clearTimeout(t);
  }, [phase, left]);

  /* The payoff, a line at a time. Slower in the quiet state, like everything
     else that has words in it. */
  useEffect(() => {
    if (phase !== 'land') return;
    if (said >= teaching.land.length) return;
    const t = window.setTimeout(() => setSaid((n) => n + 1), said === 0 ? 260 : (m.quiet ? 2600 : 1900));
    return () => window.clearTimeout(t);
  }, [phase, said, teaching.land.length, m.quiet]);

  /* Reaching the payoff is what counts as having met this one. Recorded here
     rather than on the way out, because a child who reads the punchline and
     walks off has had the moment — see kit/teachings, and the bug in
     ChirpyArc that this is deliberately not repeating. */
  useEffect(() => {
    if (phase === 'land') teachingShown(teaching.id);
  }, [phase, teaching.id]);

  const begin = () => {
    sound.play('tap');
    if (teaching.hold) { setPhase('hold'); return; }
    setPhase('land');
  };

  const done = () => { sound.play('resolve'); onDone(); };

  const allSaid = said >= teaching.land.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: m.quiet ? 0.6 : 0.45 }}
      className="mt-4 rounded-[24px] px-4 py-4 backdrop-blur-md"
      style={{ background: CHROME.pill, border: `1px solid ${accent}55`, fontFamily: FONT }}
    >
      <p className="text-[11px] font-extrabold uppercase tracking-[0.12em]" style={{ color: accent }}>
        Chirpy
      </p>

      <AnimatePresence mode="wait">
        {phase === 'open' && (
          <motion.div key="open" exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="mt-1.5">
            {teaching.open.map((line) => (
              <p
                key={line}
                className="mt-1 text-[14.5px] font-bold leading-snug"
                style={{ color: CHROME.text, textWrap: 'balance' }}
              >
                {line}
              </p>
            ))}
            <button
              onClick={begin}
              className="mt-3 rounded-full px-4 text-[13px] font-extrabold"
              style={{
                minHeight: m.target,
                background: `${accent}22`,
                border: `1px solid ${accent}`,
                color: CHROME.text,
              }}
            >
              {teaching.go ?? 'Go on then'}
            </button>
          </motion.div>
        )}

        {phase === 'hold' && (
          <motion.div
            key="hold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="mt-2 flex items-center gap-3.5"
          >
            <Ring seconds={teaching.hold ?? 0} left={left} accent={accent} still={m.quiet} />
            <p
              className="min-w-0 flex-1 text-[14.5px] font-bold leading-snug"
              style={{ color: CHROME.text, textWrap: 'balance' }}
            >
              {teaching.dare}
            </p>
          </motion.div>
        )}

        {phase === 'land' && (
          <motion.div key="land" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-1.5">
            {teaching.land.slice(0, said).map((line, i) => (
              <motion.p
                key={line}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.34 }}
                className="mt-1.5 text-[14.5px] font-bold leading-snug"
                style={{
                  color: i === 0 ? CHROME.text : CHROME.textSoft,
                  textWrap: 'balance',
                }}
              >
                {line}
              </motion.p>
            ))}

            {/* Only once he has finished talking. A dismiss button sitting
                there while lines are still arriving is an invitation to cut
                him off mid-sentence. */}
            {allSaid && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                onClick={done}
                className="mt-2.5 text-[12.5px] font-bold"
                style={{ color: CHROME.textSoft, minHeight: 36 }}
              >
                Okay
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/**
 * The wait, as a ring that empties.
 *
 * A bare number counting down turns ten seconds of noticing into ten seconds
 * of watching a number, which is the opposite of the exercise. The ring
 * carries the same information without asking to be read, and the digit in
 * the middle is there for the child who does want to know how long is left.
 *
 * It does not animate in the quiet state; the ring still empties, one step
 * per second, with nothing sweeping.
 */
function Ring({
  seconds, left, accent, still,
}: {
  seconds: number; left: number; accent: string; still: boolean;
}) {
  const R = 20;
  const C = 2 * Math.PI * R;
  const gone = seconds > 0 ? (seconds - left) / seconds : 1;

  return (
    <span className="relative grid h-[52px] w-[52px] shrink-0 place-items-center">
      <svg viewBox="0 0 48 48" className="absolute inset-0 h-full w-full -rotate-90">
        <circle cx="24" cy="24" r={R} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="3" />
        <motion.circle
          cx="24" cy="24" r={R}
          fill="none" stroke={accent} strokeWidth="3" strokeLinecap="round"
          strokeDasharray={C}
          animate={{ strokeDashoffset: C * gone }}
          transition={{ duration: still ? 0 : 0.9, ease: 'linear' }}
        />
      </svg>
      <span className="relative text-[15px] font-extrabold" style={{ color: accent }}>
        {left}
      </span>
    </span>
  );
}
