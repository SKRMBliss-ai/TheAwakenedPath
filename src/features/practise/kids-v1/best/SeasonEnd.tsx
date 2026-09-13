import { motion } from 'framer-motion';
import { FONT } from '../ui/chrome';
import { useMotion } from '../ui/quiet';
import { chirpySprite } from '../ui/sprites';
import { closeSeason, type Keepsake } from '../kit/seasons';
import * as sound from '../kit/sound';
import { useSpoken } from '../ui/useSpoken';

/**
 * THE CURTAIN. Roughly every three months — see kit/seasons.
 *
 * A LIGHT THE APP NEVER OTHERWISE USES. Every other screen in the gym is a
 * dark room with a warm lamp somewhere in it. This one is dawn, and it is the
 * only place that colour appears: a child who has been coming here for three
 * months has never seen this, which is most of how they know something has
 * happened without being told so.
 *
 * NOTHING IS GRADED AND NOTHING IS COMPARED. The facts are stated and that is
 * all — no "better than last time", no total to beat, no stars. An ending
 * that hands out a mark is a school report with bunting on it, and this is
 * supposed to feel like the last page of something you enjoyed.
 *
 * IT CANNOT BE MISSED BY ACCIDENT. There is one button, it says the season is
 * over, and the season doesn't actually turn until it's pressed — an app
 * opened and shut in a hallway can't cost a child the one moment this whole
 * feature was built for.
 */
export function SeasonEnd({ keepsake, onDone }: { keepsake: Keepsake; onDone: () => void }) {
  const m = useMotion();

  const finish = () => {
    closeSeason(keepsake);
    sound.play('resolve');
    onDone();
  };

  const ordinal = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth'][keepsake.n - 1] ?? `${keepsake.n}th`;

  /* Said out loud, because a curtain nobody can read is just a coloured
     screen. The facts are spoken too — they are the whole content. */
  useSpoken(
    `That\u2019s a whole season. ${keepsake.fireflies} fireflies caught. ` +
    `${keepsake.days} days you came.` +
    (keepsake.mostDone ? ` Mostly ${keepsake.mostDone.toLowerCase()}.` : '') +
    ' Nothing goes away. It\u2019s all still there.',
  );

  return (
    <div
      className="relative min-h-[100svh] w-full overflow-hidden"
      style={{
        fontFamily: FONT,
        // Dawn. Nowhere else in the app looks like this.
        background: 'linear-gradient(172deg, #6B4A63 0%, #C97E77 42%, #F0A389 72%, #F6C98A 100%)',
      }}
    >
      <div className="relative grid min-h-[100svh] place-items-center px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: m.quiet ? 1.1 : 0.85 }}
          className="flex w-full max-w-sm flex-col items-center gap-5 text-center"
        >
          <img
            src={chirpySprite('hopeful')}
            alt=""
            aria-hidden
            draggable={false}
            className="select-none"
            style={{ height: 94, width: 'auto', filter: 'drop-shadow(0 10px 22px rgba(80,40,30,0.4))' }}
          />

          <p
            className="text-[26px] font-extrabold leading-tight"
            style={{ color: '#3B2016', textWrap: 'balance' }}
          >
            That’s a whole season.
          </p>

          {/* The facts, plainly, with nothing to beat. */}
          <div
            className="flex w-full flex-col gap-2 rounded-[22px] px-5 py-4"
            style={{ background: 'rgba(255,255,255,0.42)', border: '1px solid rgba(255,255,255,0.6)' }}
          >
            <Fact value={`${keepsake.fireflies}`} label={keepsake.fireflies === 1 ? 'firefly caught' : 'fireflies caught'} />
            <Fact value={`${keepsake.days}`} label={keepsake.days === 1 ? 'day you came' : 'days you came'} />
            {keepsake.mostDone && <Fact value={keepsake.mostDone} label="the one you did most" />}
          </div>

          {/* The thing he only says now. */}
          <p
            className="text-[15px] font-bold leading-relaxed"
            style={{ color: '#5A3123', textWrap: 'balance' }}
          >
            {keepsake.n === 1
              ? '“I didn’t know if you’d still be here by now. I’m really glad you are.”'
              : `“Your ${ordinal} one. I keep every single one of these, you know.”`}
          </p>

          <p className="text-[13px] font-semibold" style={{ color: 'rgba(59,32,22,0.72)' }}>
            Nothing goes away. It’s all still there — this just closes the book on
            these three months.
          </p>

          <button
            onClick={finish}
            className="mt-1 rounded-full px-7 text-[15px] font-extrabold"
            style={{ minHeight: m.target, background: '#3B2016', color: '#F6C98A' }}
          >
            Start the next one
          </button>
        </motion.div>
      </div>
    </div>
  );
}

function Fact({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-[19px] font-extrabold" style={{ color: '#3B2016' }}>{value}</span>
      <span className="text-[12.5px] font-bold" style={{ color: 'rgba(59,32,22,0.7)' }}>{label}</span>
    </div>
  );
}
