import { useState } from 'react';
import { motion } from 'framer-motion';
import { FEELINGS } from '../kit/checkinContent';
import * as sound from '../kit/sound';

/**
 * The six feeling balls, three down each side of the Feelings Room.
 *
 * They sit where the painted orbs in the room art already are, so the room
 * looks like it always did — except now the orbs are the thing you touch.
 * Each carries its feeling's name, bounces on its own, and bursts when
 * tapped.
 *
 * Every ball bursts identically. No feeling pops more happily than any other,
 * because none of them is the right answer to how a child's day went.
 *
 * The middle stays empty on purpose: in the room art that's where the child
 * is sitting with the lantern, and covering the warmest part of the picture
 * to fit two more buttons would be a poor trade.
 */

/** Three down the left, three down the right. Percentages of the layer. */
const SIDES = [
  { left: '2%', top: '4%' },
  { left: '0%', top: '38%' },
  { left: '4%', top: '71%' },
  { left: '72%', top: '2%' },
  { left: '76%', top: '36%' },
  { left: '70%', top: '70%' },
];

const SIZE = 86;

export function FeelingBalls({ onPick }: { onPick: (feelingId: string, label: string) => void }) {
  const [popped, setPopped] = useState<string | null>(null);

  const burst = (id: string, label: string) => {
    if (popped) return;
    sound.play('balloonPop');
    setPopped(id);
    window.setTimeout(() => onPick(id, label), 430);
  };

  return (
    <div className="relative w-full" style={{ height: 340 }}>
      {FEELINGS.map((f, i) => {
        const pos = SIDES[i % SIDES.length];
        const isPopped = popped === f.id;
        const dimmed = popped !== null && !isPopped;
        return (
          <motion.button
            key={f.id}
            onClick={() => burst(f.id, f.label)}
            disabled={popped !== null}
            aria-label={f.label}
            className="absolute grid place-items-center rounded-full text-center text-[13.5px] font-extrabold leading-tight"
            style={{
              left: pos.left,
              top: pos.top,
              width: SIZE,
              height: SIZE,
              color: '#FFFFFF',
              textShadow: '0 1px 6px rgba(0,0,0,0.5)',
              background: `radial-gradient(circle at 34% 26%, hsl(${f.hue} 92% 76%), hsl(${f.hue} 76% 46%) 72%)`,
              border: '1px solid rgba(255,255,255,0.42)',
              boxShadow: '0 10px 24px -8px rgba(0,0,0,0.55), inset 0 -8px 18px -8px rgba(0,0,0,0.5)',
            }}
            animate={
              isPopped
                ? { scale: [1, 1.32, 0.1], opacity: [1, 1, 0] }
                : {
                    scale: dimmed ? 0.86 : 1,
                    opacity: dimmed ? 0.3 : 1,
                    // Each one bounces to its own rhythm, so they never look
                    // like a row of things doing the same thing.
                    y: [0, -14, 0],
                    x: [0, i % 2 ? 6 : -6, 0],
                  }
            }
            transition={
              isPopped
                ? { duration: 0.42, times: [0, 0.45, 1] }
                : {
                    scale: { duration: 0.25 },
                    opacity: { duration: 0.25 },
                    y: { repeat: Infinity, duration: 2.6 + (i % 3) * 0.5, ease: 'easeInOut', delay: i * 0.22 },
                    x: { repeat: Infinity, duration: 4.4 + (i % 2) * 0.7, ease: 'easeInOut', delay: i * 0.18 },
                  }
            }
            whileTap={{ scale: 0.94 }}
          >
            {f.label}
            {isPopped && <Burst />}
          </motion.button>
        );
      })}
    </div>
  );
}

/** The bits of a popped ball, flying outwards. Purely decorative. */
function Burst() {
  return (
    <span className="pointer-events-none absolute inset-0">
      {Array.from({ length: 9 }).map((_, i) => {
        const a = (i / 9) * Math.PI * 2;
        return (
          <motion.span
            key={i}
            className="absolute left-1/2 top-1/2 block h-2 w-2 rounded-full bg-white"
            initial={{ x: 0, y: 0, opacity: 0.95, scale: 1 }}
            animate={{ x: Math.cos(a) * 52, y: Math.sin(a) * 52, opacity: 0, scale: 0.4 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        );
      })}
    </span>
  );
}
