import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { RoomConfig } from '../rooms';
import type { ChooseGame } from '../games/types';
import { CHROME, Cta, Pill, Question, SceneLine } from '../ui/chrome';
import { useMotion, useQuiet } from '../ui/quiet';
import * as sound from '../kit/sound';

/**
 * E1 · Choose — a scene or prompt, plus 2–6 tappable options. ~14 games.
 *
 * THE AUTO-ADVANCE RULE (BUILD_BRIEF §0, non-negotiable): every answer moves
 * to the next screen by itself. There is no "Next" button on a selection
 * screen anywhere in this app. A tap fills the pill, the app pauses just long
 * enough for the child to see it register, and then it goes.
 *
 * Multi-select is the one exception, and it is not really one: the child is
 * still choosing when they tap, so the screen can't know they've finished.
 * It gets a "That's my lot" button — which is a *completion*, not a
 * confirmation of a single answer.
 *
 * Affirmation is warmth, never correctness (§2.4). Any plausible pick gets
 * the same affirming line; no pick gets a tick, and nothing is ever scored.
 */

const QUIET_MAX_OPTIONS = 4; // fewer choices when the child is struggling (§7)

export function ChooseEngine({
  game,
  room,
  onDone,
}: {
  game: ChooseGame;
  room: RoomConfig;
  onDone: () => void;
}) {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);
  const [affirming, setAffirming] = useState<string | null>(null);
  const m = useMotion();
  const quiet = useQuiet();
  const timers = useRef<number[]>([]);

  useEffect(() => () => { timers.current.forEach(clearTimeout); }, []);

  const round = game.rounds[i];
  // The quiet state shows fewer options. It trims from the end rather than
  // sampling, so the first options — which are the plainest, by authoring
  // convention — are the ones that survive.
  const options = quiet ? round.options.slice(0, QUIET_MAX_OPTIONS) : round.options;

  const advance = () => {
    setPicked([]);
    setAffirming(null);
    if (i + 1 < game.rounds.length) setI(i + 1);
    else onDone();
  };

  const commit = () => {
    if (round.affirm) {
      setAffirming(round.affirm);
      timers.current.push(window.setTimeout(advance, quiet ? 2600 : 1900));
    } else {
      timers.current.push(window.setTimeout(advance, m.advanceMs));
    }
  };

  const tap = (opt: string) => {
    if (affirming) return;
    sound.play('tap');
    if (round.multi) {
      setPicked((p) => (p.includes(opt) ? p.filter((x) => x !== opt) : [...p, opt]));
      return;
    }
    setPicked([opt]);
    commit();
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={m.transition}
          className="flex flex-col gap-3"
        >
          {round.scene && <SceneLine>{round.scene}</SceneLine>}
          <Question room={room}>{round.prompt}</Question>
        </motion.div>
      </AnimatePresence>

      <div className="flex flex-col" style={{ gap: m.gap }}>
        {options.map((opt) => (
          <Pill
            key={opt}
            label={opt}
            selected={picked.includes(opt)}
            onClick={() => tap(opt)}
            accent={room.palette.accent}
            disabled={!!affirming}
          />
        ))}
      </div>

      {round.multi && !affirming && (
        <Cta
          label={picked.length ? 'That’s my lot' : 'None of these'}
          onClick={commit}
          accent={room.palette.accent}
        />
      )}

      <AnimatePresence>
        {affirming && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={m.transition}
            className="text-[15px] font-bold leading-snug"
            style={{ color: CHROME.textSoft }}
          >
            {affirming}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
