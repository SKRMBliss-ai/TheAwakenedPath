import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { CHROME, FONT } from '../ui/chrome';
import { speak, stopSpeaking } from '../kit/chirpyVoice';
import { useQuiet } from '../ui/quiet';
import * as sound from '../kit/sound';

/**
 * A SIMPLE, GUIDED BREATHING SPACE — the Reflection Room's one place to just
 * sit rather than record, tap or read.
 *
 * Everything else in this room is a journal: a grid to mark, four questions
 * to answer, a shelf of things already worked out. This is the opposite of
 * that on purpose — nothing to fill in, nothing saved, nothing to get right.
 * A breathing circle, Chirpy's slow voice keeping time, and a door out
 * whenever the child is done.
 */

const LENGTHS = [
  { label: '1 minute', seconds: 60 },
  { label: '3 minutes', seconds: 180 },
  { label: '5 minutes', seconds: 300 },
];

/** One in, one out — four seconds each way reads as slow without dragging. */
const BREATH_MS = 4000;

const LINES = [
  "Let's just breathe together for a little while.",
  'Nothing to answer. Nowhere to be.',
  'Breathe in… and let it go.',
  "You're doing this exactly right.",
  'In through your nose, if that feels good.',
  "There's no hurry in here.",
  'Just you, breathing, for as long as you like.',
];

export function Meditate({ accent, onClose }: { accent: string; onClose: () => void }) {
  const quiet = useQuiet();
  const reduced = useReducedMotion();
  const still = quiet || !!reduced;

  const [phase, setPhase] = useState<'pick' | 'breathing' | 'done'>('pick');
  const [totalSeconds, setTotalSeconds] = useState(180);
  const [remaining, setRemaining] = useState(180);
  const [breathIn, setBreathIn] = useState(true);
  const lineIndex = useRef(0);

  // The countdown. One tick a second, stopping itself at zero rather than
  // trusting a caller to clear it — this outlives whichever line is on
  // screen and must not be tied to it.
  useEffect(() => {
    if (phase !== 'breathing') return;
    const id = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) { window.clearInterval(id); setPhase('done'); return 0; }
        return r - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [phase]);

  // The breathing circle itself, and a line spoken every other breath —
  // not every breath, or Chirpy's voice would be the thing being followed
  // rather than the child's own breathing.
  useEffect(() => {
    if (phase !== 'breathing' || still) return;
    const id = window.setInterval(() => {
      setBreathIn((v) => {
        const next = !v;
        if (next && !quiet) {
          const line = LINES[lineIndex.current % LINES.length];
          lineIndex.current += 1;
          speak(line, quiet);
        }
        return next;
      });
    }, BREATH_MS);
    return () => window.clearInterval(id);
  }, [phase, still, quiet]);

  useEffect(() => {
    if (phase === 'breathing' && !quiet) speak(LINES[0], quiet);
    if (phase === 'done' && !quiet) speak('There you go. However you feel now is fine.', quiet);
    return () => { stopSpeaking(); };
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const start = (seconds: number) => {
    if (!quiet) sound.play('enterRoom');
    lineIndex.current = 0;
    setTotalSeconds(seconds);
    setRemaining(seconds);
    setBreathIn(true);
    setPhase('breathing');
  };

  const stop = () => {
    stopSpeaking();
    onClose();
  };

  const mm = Math.floor(remaining / 60);
  const ss = String(remaining % 60).padStart(2, '0');

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Meditate"
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center px-6"
      initial={still ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: still ? 0 : 0.5 }}
      style={{
        fontFamily: FONT,
        background: 'radial-gradient(circle at 50% 40%, #241945 0%, #0c0818 78%)',
      }}
    >
      <button
        onClick={stop}
        aria-label="Close meditation"
        className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full text-[18px] font-extrabold"
        style={{ background: 'rgba(255,255,255,0.08)', border: `1px solid ${CHROME.pillBorder}`, color: CHROME.text }}
      >
        ✕
      </button>

      <AnimatePresence mode="wait">
        {phase === 'pick' && (
          <motion.div
            key="pick"
            initial={still ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-5 text-center"
          >
            <p className="text-[13px] font-extrabold uppercase tracking-[0.16em]" style={{ color: accent }}>
              A quiet moment
            </p>
            <h2 className="max-w-xs text-[22px] font-extrabold leading-snug" style={{ color: CHROME.text }}>
              How long would you like to breathe together?
            </h2>
            <div className="flex flex-col gap-3">
              {LENGTHS.map((l) => (
                <button
                  key={l.seconds}
                  onClick={() => start(l.seconds)}
                  className="min-w-[220px] rounded-full px-6 py-3 text-[15px] font-extrabold text-white transition-transform hover:scale-[1.03]"
                  style={{ background: `linear-gradient(100deg, ${accent}, #7f42dc)`, boxShadow: `0 6px 0 rgba(0,0,0,0.35)` }}
                >
                  {l.label}
                </button>
              ))}
            </div>
            <button onClick={stop} className="mt-2 text-[13px] font-bold" style={{ color: CHROME.textSoft }}>
              Not right now
            </button>
          </motion.div>
        )}

        {phase === 'breathing' && (
          <motion.div
            key="breathing"
            initial={still ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-8"
          >
            <motion.div
              aria-hidden="true"
              animate={still ? { scale: 1 } : { scale: breathIn ? 1.35 : 0.85 }}
              transition={{ duration: BREATH_MS / 1000, ease: 'easeInOut' }}
              className="grid h-44 w-44 place-items-center rounded-full sm:h-56 sm:w-56"
              style={{
                background: `radial-gradient(circle, ${accent}aa 0%, ${accent}33 55%, transparent 78%)`,
                boxShadow: `0 0 60px ${accent}55`,
              }}
            >
              <motion.div
                className="h-24 w-24 rounded-full sm:h-32 sm:w-32"
                style={{ background: `radial-gradient(circle at 35% 30%, #ffffffcc, ${accent}88)` }}
              />
            </motion.div>

            <p role="status" aria-live="polite" className="text-[19px] font-extrabold" style={{ color: CHROME.text }}>
              {breathIn ? 'Breathe in…' : 'Breathe out…'}
            </p>

            <p className="text-[13px] font-bold" style={{ color: CHROME.textSoft }}>
              {mm}:{ss} left
            </p>

            <button onClick={stop} className="mt-2 text-[13px] font-bold" style={{ color: CHROME.textSoft }}>
              I'm done for now
            </button>
          </motion.div>
        )}

        {phase === 'done' && (
          <motion.div
            key="done"
            initial={still ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-5 text-center"
          >
            <p className="text-[40px]" aria-hidden="true">✨</p>
            <h2 className="max-w-xs text-[22px] font-extrabold leading-snug" style={{ color: CHROME.text }}>
              However you feel right now is exactly right.
            </h2>
            <div className="flex gap-3">
              <button
                onClick={() => start(totalSeconds)}
                className="rounded-full px-5 py-2.5 text-[14px] font-extrabold text-white"
                style={{ background: `linear-gradient(100deg, ${accent}, #7f42dc)` }}
              >
                Breathe again
              </button>
              <button
                onClick={stop}
                className="rounded-full px-5 py-2.5 text-[14px] font-extrabold"
                style={{ background: 'rgba(255,255,255,0.08)', border: `1px solid ${CHROME.pillBorder}`, color: CHROME.text }}
              >
                Back to the room
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
