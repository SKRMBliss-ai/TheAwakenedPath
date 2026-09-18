import { useState } from 'react';
import { motion } from 'framer-motion';
import { SIZES } from '../kit/checkinContent';
import * as sound from '../kit/sound';

/**
 * HOW BIG IS IT — asked as three balloons, not three buttons in a list.
 *
 * The question one step earlier is answered by popping a balloon; this one was
 * answered by reading three pills and picking a line of text. Same walk, two
 * different grammars, and the second one is the duller of the two — a child
 * who has just burst something is being handed a form.
 *
 * SO THE ANSWER IS THE SIZE. The three balloons are drawn at the sizes the
 * content file already carries (kit/checkinContent's `blob`: 26, 48, 74), so
 * "a bit" is a small balloon and "REALLY big" is a big one, and a child who
 * cannot yet read the labels can still answer honestly by pointing at the one
 * that looks right. That is the whole reason this is worth doing: it takes
 * reading out of a question about feeling.
 *
 * THEY ALL GO WHEN ONE GOES, the same ripple the feeling balls use — the
 * tapped one leads and the others follow a beat behind, so the child's is
 * clearly the one that started it and the room ends up empty rather than
 * holding two survivors.
 *
 * NO BALLOON IS THE RIGHT ONE. Same colour, same shine, same pop. A "REALLY
 * big" that burst more dramatically than "a bit" would be the app having an
 * opinion about how much a child is allowed to be feeling.
 */
export function SizeBalloons({ hue, onPick }: {
  /** The feeling's own colour, so its size is asked in its own light. */
  hue: number;
  onPick: (sizeId: string) => void;
}) {
  const [popped, setPopped] = useState<string | null>(null);
  const burst = (id: string) => {
    if (popped) return;
    sound.play('balloonPop');
    setPopped(id);
    window.setTimeout(() => onPick(id), 560);
  };

  return (
    <div className="flex w-full items-end justify-center gap-4 pt-2" style={{ minHeight: 178 }}>
      {SIZES.map((size, i) => {
        const diameter = 58 + size.blob;
        const isPopped = popped === size.id;
        const alsoPopping = popped !== null && !isPopped;
        return (
          <motion.button
            key={size.id}
            onClick={() => burst(size.id)}
            disabled={popped !== null}
            aria-label={`${size.label}`}
            className="grid shrink-0 place-items-center rounded-full text-center font-extrabold leading-tight"
            style={{
              width: diameter,
              height: diameter,
              minHeight: diameter,
              fontSize: diameter < 90 ? 12 : 14,
              color: '#FFFFFF',
              textShadow: '0 1px 6px rgba(0,0,0,0.5)',
              background: `radial-gradient(circle at 34% 26%, hsl(${hue} 92% 78%), hsl(${hue} 76% 46%) 72%)`,
              border: '1px solid rgba(255,255,255,0.42)',
              boxShadow: '0 10px 24px -8px rgba(0,0,0,0.55), inset 0 -8px 18px -8px rgba(0,0,0,0.5)',
            }}
            animate={
              isPopped || alsoPopping
                ? { scale: [1, 1.32, 0.1], opacity: [1, 1, 0] }
                : { scale: 1, opacity: 1, y: [0, -11, 0] }
            }
            transition={
              isPopped || alsoPopping
                ? { duration: 0.42, times: [0, 0.45, 1], delay: isPopped ? 0 : 0.09 + i * 0.05 }
                : { repeat: Infinity, repeatType: 'loop', duration: 3 + i * 0.45, ease: 'easeInOut' }
            }
          >
            {size.label}
          </motion.button>
        );
      })}
    </div>
  );
}
