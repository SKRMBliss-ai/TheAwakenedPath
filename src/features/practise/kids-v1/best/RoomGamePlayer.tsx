import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { RoomGame, RoomGameOption } from './roomGames';
import * as sound from '../kit/sound';

/**
 * Plays one room game.
 *
 * There is no score, no timer, no streak and no fail state. A child picks
 * something, reads what actually happens, then reads the bit worth
 * remembering. That is the entire loop, and it is deliberately short — the
 * teaching is in the reveal, so anything that delays getting to the reveal is
 * in the way.
 *
 * The options are all defensible on purpose. A game where the kind option is
 * obviously the kind one teaches a child to spot the shape of the right
 * answer, which is a test-passing skill, not an ethical one.
 */
export function RoomGamePlayer({
  game,
  accent,
  onDone,
}: {
  game: RoomGame;
  accent: string;
  onDone: (earned: number) => void;
}) {
  const [chosen, setChosen] = useState<RoomGameOption | null>(null);
  const [seen, setSeen] = useState<string[]>([]);

  // 'spot' games let a child open several before moving on — the point is to
  // look at all of them, not to find the one true answer among them.
  const multi = game.kind === 'spot';

  const pick = (o: RoomGameOption) => {
    sound.play('discovery');
    setChosen(o);
    setSeen((s) => (s.includes(o.label) ? s : [...s, o.label]));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.18em]" style={{ color: accent }}>
            {game.title}
          </p>
          <p className="mt-1 text-[14.5px] font-semibold leading-snug text-white/90">{game.setup}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        {game.options.map((o) => {
          const opened = seen.includes(o.label);
          return (
            <motion.button
              key={o.label}
              onClick={() => pick(o)}
              whileTap={{ scale: 0.98 }}
              className="rounded-[20px] px-4 py-3.5 text-left text-[14.5px] font-bold leading-snug transition-colors"
              style={{
                color: '#fff',
                background: opened ? `${accent}33` : 'rgba(255,255,255,0.10)',
                border: `1px solid ${opened ? accent : 'rgba(255,255,255,0.22)'}`,
              }}
            >
              {o.label}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {chosen && (
          <motion.div
            key={chosen.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
            className="rounded-[20px] px-4 py-4"
            style={{ background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.2)' }}
          >
            <p className="text-[14.5px] font-semibold leading-relaxed text-white/95">{chosen.reveal}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The afterword is the actual lesson, and it shows for every choice —
          there is no branch of this game where a child doesn't get it. */}
      {chosen && (!multi || seen.length >= 2) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="flex flex-col gap-3"
        >
          <div className="rounded-[20px] px-4 py-4" style={{ background: `${accent}1F`, border: `1px solid ${accent}66` }}>
            <p className="text-[14.5px] font-bold leading-relaxed" style={{ color: '#fff' }}>
              {game.afterword}
            </p>
          </div>
          <button
            onClick={() => onDone(game.points)}
            className="rounded-full px-5 py-3.5 text-[15px] font-extrabold"
            style={{ background: accent, color: '#1B1024' }}
          >
            Got it
          </button>
        </motion.div>
      )}

      {multi && chosen && seen.length < 2 && (
        <p className="text-center text-[12.5px] font-semibold text-white/60">
          Have a look at the others too.
        </p>
      )}
    </div>
  );
}
