import { useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { feelingsForAge } from '../kit/checkinContent';
import { childAge } from '../kit/band';
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

/*
  Three down the left, three down the right, and each column anchored to its
  OWN edge rather than both being measured from the left. That is what lets
  the balls grow: from the left, the right-hand column's x had to be small
  enough that x + diameter still cleared the column's right edge, so every
  pixel a ball gained had to be paid for twice. Anchored to the edge it is
  standing against, a ball only has to clear the middle — which is where the
  child in the room art is sitting, and which is meant to stay clear anyway.
*/
type Spot = { left?: string; right?: string; top: string };

const SIDES: Spot[] = [
  { left: '0%', top: '1%' },
  { left: '4%', top: '36%' },
  { left: '0%', top: '71%' },
  { right: '0%', top: '0%' },
  { right: '4%', top: '35%' },
  { right: '0%', top: '70%' },
];

/*
  HOW BIG A BALL IS, and why it is not one number any more.

  86px was a dot. The label inside had to come down to 10px to fit, which is
  the wrong way round — the words are the thing being chosen, and a six-year-old
  reads them slowly. So a ball is a fraction of the layer it sits in, clamped at
  both ends: big enough to aim a whole hand at, and never so big that the two
  columns close over the middle of the picture.
*/
const BALL_MAX = 132;
const BALL_MIN = 84;
const MANY_MAX = 106;
const MANY_MIN = 68;

const clamp = (min: number, value: number, max: number) => Math.round(Math.min(max, Math.max(min, value)));

/** The layer's own width, so the balls can be sized against it. */
function useLayerWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    const measure = () => setWidth(node.clientWidth);
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return { ref, width };
}

/** Older children get more feelings. Past six the balls come down a little and
    zigzag down each side so they still stay clear of the child in the middle. */
function layout(count: number, width: number) {
  /* Before the first measurement lands, size against a typical column rather
     than against zero — otherwise the balls spend a frame at their smallest. */
  const w = width || 430;
  if (count <= 6) {
    const size = clamp(BALL_MIN, w * 0.29, BALL_MAX);
    return { size, height: Math.round(size * 3.6), spots: SIDES };
  }
  const size = clamp(MANY_MIN, w * 0.22, MANY_MAX);
  const height = Math.round(size * 5.6);
  const perSide = Math.ceil(count / 2);
  const step = (height - size) / Math.max(perSide - 1, 1);
  const spots: Spot[] = Array.from({ length: count }, (_, i) => {
    const right = i >= perSide;
    const j = right ? i - perSide : i;
    const inset = j % 2 === 1 ? '13%' : '0%';
    return right ? { right: inset, top: `${j * step}px` } : { left: inset, top: `${j * step}px` };
  });
  return { size, height, spots };
}

export function FeelingBalls({
  onPick,
  onBurst,
}: {
  onPick: (feelingId: string, label: string) => void;
  /** Fired the instant a ball is tapped, so the room can bloom with it. */
  onBurst?: () => void;
}) {
  const [popped, setPopped] = useState<string | null>(null);
  const feelings = feelingsForAge(childAge());
  const { ref, width } = useLayerWidth();
  const { size, height, spots } = layout(feelings.length, width);

  const burst = (id: string, label: string) => {
    if (popped) return;
    sound.play('balloonPop');
    setPopped(id);
    onBurst?.();
    window.setTimeout(() => onPick(id, label), 560);
  };

  return (
    <div ref={ref} className="relative w-full" style={{ height }}>
      {feelings.map((f, i) => {
        const pos = spots[i];
        const isPopped = popped === f.id;
        // When one goes, they all go. The tapped one leads by a beat and the
        // rest follow in a quick ripple outwards, so the child's ball is
        // clearly the one that started it — but the room ends up empty, which
        // is far more satisfying than five survivors sitting there dimmed.
        const alsoPopping = popped !== null && !isPopped;
        return (
          <motion.button
            key={f.id}
            onClick={() => burst(f.id, f.label)}
            disabled={popped !== null}
            aria-label={f.label}
            className="absolute grid place-items-center rounded-full text-center font-extrabold leading-tight"
            style={{
              left: pos.left,
              right: pos.right,
              top: pos.top,
              width: size,
              height: size,
              color: '#FFFFFF',
              fontSize: Math.round(size * (f.label.length > 9 ? 0.125 : 0.16)),
              textShadow: '0 1px 6px rgba(0,0,0,0.5)',
              background: `radial-gradient(circle at 34% 26%, hsl(${f.hue} 92% 76%), hsl(${f.hue} 76% 46%) 72%)`,
              border: '1px solid rgba(255,255,255,0.42)',
              boxShadow: '0 10px 24px -8px rgba(0,0,0,0.55), inset 0 -8px 18px -8px rgba(0,0,0,0.5)',
            }}
            animate={
              isPopped || alsoPopping
                ? { scale: [1, 1.32, 0.1], opacity: [1, 1, 0] }
                : {
                    scale: 1,
                    opacity: 1,
                    // Each one bounces to its own rhythm, so they never look
                    // like a row of things doing the same thing.
                    y: [0, -14, 0],
                    x: [0, i % 2 ? 6 : -6, 0],
                  }
            }
            transition={
              isPopped || alsoPopping
                ? {
                    duration: 0.42,
                    times: [0, 0.45, 1],
                    // The ripple: the tapped one first, the others a beat behind.
                    delay: isPopped ? 0 : 0.09 + (i % 3) * 0.05,
                  }
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
            {(isPopped || alsoPopping) && <Burst reach={size * 0.6} />}
          </motion.button>
        );
      })}
    </div>
  );
}

/** The bits of a popped ball, flying outwards. Purely decorative. */
function Burst({ reach }: { reach: number }) {
  return (
    <span className="pointer-events-none absolute inset-0">
      {Array.from({ length: 9 }).map((_, i) => {
        const a = (i / 9) * Math.PI * 2;
        return (
          <motion.span
            key={i}
            className="absolute left-1/2 top-1/2 block h-2 w-2 rounded-full bg-white"
            initial={{ x: 0, y: 0, opacity: 0.95, scale: 1 }}
            animate={{ x: Math.cos(a) * reach, y: Math.sin(a) * reach, opacity: 0, scale: 0.4 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        );
      })}
    </span>
  );
}
