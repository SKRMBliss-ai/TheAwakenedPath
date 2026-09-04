import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { RoomConfig } from '../rooms';
import type { DialGame } from '../games/types';
import { CHROME, Cta, FONT, Question } from '../ui/chrome';
import { useMotion, useQuiet } from '../ui/quiet';
import * as sound from '../kit/sound';

/**
 * E4 · Dial — a stepped scale whose label changes as it moves. 6 games.
 *
 * "The scene responding live — light intensifying, colour warming... The art
 * *is* the feedback" (UI design §8.2). Here that's the warm bloom behind the
 * dial, which grows with the value: turning a feeling up literally makes the
 * room warmer, so the child sees the size of the thing they just named.
 *
 * `dual` is the load-bearing case and the reason this isn't a slider. Feeling
 * Mix and Jealousy: Two True Things put up TWO dials at once, and neither one
 * moves when the other does. That is the entire teaching move — two feelings,
 * full size, at the same time (TEACHING_MOVES §9) — and it only survives if
 * the interface physically refuses to trade one off against the other. A
 * single slider from "happy" to "sad" would teach the opposite lesson
 * perfectly.
 *
 * Stepped, not continuous, because the steps have WORDS. A child who moves
 * from "annoyed" to "cross" to "furious" is learning vocabulary; a child
 * dragging a nameless handle to 63% is learning nothing.
 */

export function DialEngine({
  game,
  room,
  onDone,
}: {
  game: DialGame;
  room: RoomConfig;
  onDone: () => void;
}) {
  const [i, setI] = useState(0);
  const [a, setA] = useState<number | null>(null);
  const [b, setB] = useState<number | null>(null);
  const [affirming, setAffirming] = useState<string | null>(null);
  const m = useMotion();
  const quiet = useQuiet();
  const timers = useRef<number[]>([]);

  useEffect(() => () => { timers.current.forEach(clearTimeout); }, []);

  const round = game.rounds[i];
  const dual = game.dual;
  // Single-dial rounds advance on the tap itself; dual rounds can't, because
  // the child hasn't finished until both are set.
  const ready = dual ? a !== null && b !== null : a !== null;

  const advance = () => {
    setA(null); setB(null); setAffirming(null);
    if (i + 1 < game.rounds.length) setI(i + 1);
    else onDone();
  };

  const commit = () => {
    if (affirming) return;
    if (round.affirm) {
      setAffirming(round.affirm);
      timers.current.push(window.setTimeout(advance, quiet ? 2600 : 2000));
    } else {
      timers.current.push(window.setTimeout(advance, m.advanceMs));
    }
  };

  const set = (which: 'a' | 'b', v: number) => {
    if (affirming) return;
    sound.play('tap');
    if (which === 'a') setA(v); else setB(v);
    if (!dual) timers.current.push(window.setTimeout(commit, 420));
  };

  // Warmth of the room follows the dials — the higher they are, the more the
  // scene glows. With two dials it's the louder of the pair.
  const heat = Math.max(
    a === null ? 0 : (a + 1) / round.steps.length,
    dual && b !== null ? (b + 1) / round.steps.length : 0,
  );

  return (
    <div className="relative flex w-full flex-col gap-4">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -inset-x-8 -inset-y-6 -z-10 rounded-[40px]"
        animate={{ opacity: heat }}
        transition={{ duration: 0.6 }}
        style={{ background: `radial-gradient(60% 50% at 50% 55%, ${room.palette.accent}55 0%, transparent 75%)` }}
      />

      <AnimatePresence mode="wait">
        <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={m.transition}>
          <Question room={room}>{round.prompt}</Question>
        </motion.div>
      </AnimatePresence>

      <Scale
        label={dual?.a}
        steps={round.steps}
        value={a}
        onPick={(v) => set('a', v)}
        accent={room.palette.accent}
        disabled={!!affirming}
      />

      {dual && (
        <Scale
          label={dual.b}
          steps={round.steps}
          value={b}
          onPick={(v) => set('b', v)}
          accent={room.palette.accent}
          disabled={!!affirming}
        />
      )}

      {dual && !affirming && (
        <Cta label={ready ? 'That’s it' : 'Set them both'} onClick={ready ? commit : () => {}} accent={room.palette.accent} />
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

function Scale({
  label,
  steps,
  value,
  onPick,
  accent,
  disabled,
}: {
  label?: string;
  steps: string[];
  value: number | null;
  onPick: (v: number) => void;
  accent: string;
  disabled?: boolean;
}) {
  const m = useMotion();
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <p className="text-[14px] font-extrabold" style={{ color: CHROME.text, fontFamily: FONT }}>
          {label}
        </p>
      )}
      <div className="flex items-end gap-1.5">
        {steps.map((s, idx) => {
          const on = value !== null && idx <= value;
          const exact = value === idx;
          return (
            <button
              key={s}
              onClick={() => !disabled && onPick(idx)}
              aria-label={s}
              aria-pressed={exact}
              disabled={disabled}
              className="flex-1 rounded-[14px] transition-all"
              style={{
                // A rising staircase — the size of the step is part of the
                // reading, so a child sees "big" before they read it.
                height: m.target * (0.62 + (idx / Math.max(1, steps.length - 1)) * 0.62),
                background: on ? accent : CHROME.pill,
                border: exact ? `1.5px solid ${CHROME.pillSelectedBorder}` : `1px solid ${CHROME.pillBorder}`,
                boxShadow: exact ? `0 0 26px -6px ${accent}` : 'none',
                opacity: disabled ? 0.6 : 1,
              }}
            />
          );
        })}
      </div>
      <p className="min-h-[20px] text-[15px] font-extrabold" style={{ color: CHROME.text, fontFamily: FONT }}>
        {value === null ? '' : steps[value]}
      </p>
    </div>
  );
}
