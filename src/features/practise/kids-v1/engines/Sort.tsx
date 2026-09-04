import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { RoomConfig } from '../rooms';
import type { SortGame } from '../games/types';
import { CHROME, FONT, Question } from '../ui/chrome';
import { useMotion, useQuiet } from '../ui/quiet';
import * as sound from '../kit/sound';

/**
 * E3 · Sort — cards into two or three labelled bins. 9 games, including
 * Camera or Brain, which is the most important game in the library.
 *
 * TWO RULES THAT LOOK LIKE STYLING AND ARE NOT:
 *
 * 1. **Both bins light identically** (UI design §8.2). The instant one bin
 *    glows warmer than the other, sorting becomes a test with a right answer
 *    and a child starts guessing what the app wants instead of what they
 *    think. So `bin` in the data is used ONLY to choose which line to say
 *    after a card lands — never to accept, reject, colour, score or re-place
 *    it. A card goes wherever the child puts it and stays there.
 *
 * 2. **Ambiguous placements are accepted gracefully.** `bin: -1` marks a card
 *    that genuinely fits either side; it gets its `note` wherever it lands.
 *    Those cards are the point of several of these games — "the whole class
 *    was staring" is half camera and half brain, and saying so is worth more
 *    than a clean sort.
 *
 * Interaction is tap-to-place, not drag. Drag reads nicer on a designer's
 * screen and fails on the actual hardware this runs on: a child on a phone,
 * one-handed, possibly upset, where a dragged card that snaps back looks
 * exactly like being told no.
 */

export function SortEngine({
  game,
  room,
  onDone,
}: {
  game: SortGame;
  room: RoomConfig;
  onDone: () => void;
}) {
  const [i, setI] = useState(0);
  const [c, setC] = useState(0);
  const [landed, setLanded] = useState<{ bin: number; note?: string } | null>(null);
  const m = useMotion();
  const quiet = useQuiet();
  const timers = useRef<number[]>([]);

  useEffect(() => () => { timers.current.forEach(clearTimeout); }, []);

  const round = game.rounds[i];
  const card = round.cards[c];
  const done = !card;

  useEffect(() => {
    if (!done) return;
    const t = window.setTimeout(() => {
      if (i + 1 < game.rounds.length) { setI(i + 1); setC(0); }
      else onDone();
    }, m.advanceMs);
    return () => clearTimeout(t);
  }, [done, i, game.rounds.length, onDone, m.advanceMs]);

  const place = (bin: number) => {
    if (landed || !card) return;
    sound.play('tapHit');
    // The note is said whatever the child chose. `card.bin` never gates it.
    setLanded({ bin, note: card.note });
    timers.current.push(
      window.setTimeout(
        () => { setLanded(null); setC((n) => n + 1); },
        card.note ? (quiet ? 3000 : 2300) : m.advanceMs,
      ),
    );
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <AnimatePresence mode="wait">
        <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={m.transition}>
          <Question room={room}>{round.prompt}</Question>
        </motion.div>
      </AnimatePresence>

      {/* The card on the table. */}
      <div className="grid min-h-[112px] place-items-center">
        <AnimatePresence mode="wait">
          {card && (
            <motion.div
              key={`${i}-${c}`}
              initial={{ opacity: 0, y: 18, rotate: -1.5 }}
              animate={
                landed
                  ? { opacity: 0, y: -26, scale: 0.9, transition: { duration: 0.35 } }
                  : { opacity: 1, y: 0, rotate: 0 }
              }
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 240, damping: 22 }}
              className="w-full rounded-[22px] px-5 py-5 text-center shadow-2xl"
              style={{
                background: 'rgba(255,255,255,0.94)',
                color: '#1B1630',
                fontFamily: FONT,
                border: '1px solid rgba(255,255,255,0.6)',
              }}
            >
              <p className="text-[17px] font-extrabold leading-snug">{card.text}</p>
            </motion.div>
          )}
          {done && (
            <motion.p
              key="through"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[15px] font-bold"
              style={{ color: CHROME.textSoft }}
            >
              That’s the lot.
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* The bins. Identical treatment, always. */}
      <div
        className="grid gap-2.5"
        style={{ gridTemplateColumns: `repeat(${game.bins.length}, minmax(0, 1fr))` }}
      >
        {game.bins.map((bin, idx) => (
          <motion.button
            key={bin}
            whileTap={{ scale: 0.97 }}
            onClick={() => place(idx)}
            disabled={!card || !!landed}
            className="rounded-[20px] px-3 py-4 text-center backdrop-blur-md transition"
            style={{
              minHeight: m.target + 22,
              color: CHROME.text,
              fontFamily: FONT,
              background: CHROME.pill,
              border: `1px solid ${CHROME.pillBorder}`,
              opacity: !card || landed ? 0.5 : 1,
            }}
          >
            <span className="block text-[14.5px] font-extrabold leading-tight">{bin}</span>
            {game.binHints?.[idx] && (
              <span className="mt-1 block text-[11.5px] font-semibold leading-tight" style={{ color: CHROME.textSoft }}>
                {game.binHints[idx]}
              </span>
            )}
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {landed?.note && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={m.transition}
            className="text-[15px] font-bold leading-snug"
            style={{ color: CHROME.textSoft }}
          >
            {landed.note}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
