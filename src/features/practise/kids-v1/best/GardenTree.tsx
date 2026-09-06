import { motion } from 'framer-motion';
import { useQuiet } from '../ui/quiet';

/**
 * THE TREE IN THE KINDNESS GARDEN, WHICH IS ACTUALLY GROWING.
 *
 * best/LifetimeJar already holds the one true number this deserves — every
 * firefly this child has ever caught — and shows it as a count you can tap out
 * of a jar. This is the same arithmetic given a second, slower body: a tree in
 * the room the child stands in most, filling in leaf by leaf as that total
 * climbs, and eventually keeping fireflies in its branches.
 *
 * IT IS DELIBERATELY SLOW. Leaves come on the square root of the total, so the
 * first few days visibly change the tree and the hundredth barely does. A tree
 * that moved a measurable amount every single day would be a progress bar with
 * bark on it, and a child would start counting leaves instead of telling the
 * truth about their day. This one is a season: you notice it changed, you don't
 * catch it changing.
 *
 * IT ONLY EVER GAINS. The leaf positions are a fixed list and the total picks
 * how many of them are showing, so a leaf never moves once it has grown and the
 * tree cannot appear to lose one — including on a day the child ticks nothing.
 * Nothing in this app takes anything back.
 *
 * NOTHING IS WRITTEN ANYWHERE NEAR IT. No number, no label, no "12 more for the
 * next leaf". It is scenery that happens to be true.
 */

/** Where the canopy sits inside the 100×120 viewBox. */
const CANOPY = { cx: 50, cy: 42, rx: 33, ry: 28 };

/** Total leaf slots. The tree is full here and stops changing. */
const LEAF_SLOTS = 36;

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

/**
 * Leaf positions, once, at module load. A golden-angle spiral fills an ellipse
 * evenly without clumping and without a random call — the same trick
 * FireflyJar's dense mode uses, and for the same reason: a canopy that
 * rearranged itself every render would read as static, not foliage.
 */
const LEAVES = Array.from({ length: LEAF_SLOTS }, (_, i) => {
  const t = (i + 0.5) / LEAF_SLOTS;
  const r = Math.sqrt(t);
  const a = i * GOLDEN_ANGLE;
  return {
    x: CANOPY.cx + Math.cos(a) * r * CANOPY.rx,
    y: CANOPY.cy + Math.sin(a) * r * CANOPY.ry,
    /** Three sizes, cycling, so the canopy has texture rather than polka dots. */
    r: 5.5 + (i % 3) * 1.6,
    /** Two greens, so it doesn't read as one flat shape. */
    dark: i % 2 === 0,
  };
});

/** Fireflies only turn up once the tree is worth nesting in. */
const NEST_FROM = 150;
const NEST_EVERY = 150;
const NEST_SLOTS = 5;

const NESTS = Array.from({ length: NEST_SLOTS }, (_, i) => {
  const a = (i / NEST_SLOTS) * Math.PI * 2 + 0.6;
  return {
    x: CANOPY.cx + Math.cos(a) * CANOPY.rx * 0.62,
    y: CANOPY.cy + Math.sin(a) * CANOPY.ry * 0.62,
    delay: i * 0.7,
  };
});

/**
 * How many leaves a lifetime total is worth. Square root on purpose — see the
 * note above about seasons and progress bars. Four times the fireflies for
 * twice the tree.
 *
 * THE COEFFICIENT IS THE WHOLE DESIGN, and the first one was wrong: at 2.2 a
 * child three months in already had every leaf, and a tree that finished
 * growing in the child's first term is a tree that stops meaning anything for
 * the rest of the years they have it. At 1.15 the same child is at a third,
 * a year in is around two-thirds, and it fills at roughly two years of honest
 * daily use. Slow enough to still be arriving when they're eight.
 */
export function leavesFor(total: number) {
  if (total <= 0) return 0;
  return Math.min(LEAF_SLOTS, Math.max(1, Math.round(Math.sqrt(total) * 1.15)));
}

/** Fireflies arrive one at a time and much later — the tree has to be worth
 *  nesting in first, which is the whole reason they mean anything. */
export function nestsFor(total: number) {
  if (total < NEST_FROM) return 0;
  return Math.min(NEST_SLOTS, 1 + Math.floor((total - NEST_FROM) / NEST_EVERY));
}

export function GardenTree({ total, height = 132 }: { total: number; height?: number }) {
  const quiet = useQuiet();
  const grown = leavesFor(total);
  const nesting = nestsFor(total);

  return (
    <svg
      viewBox="0 0 100 120"
      aria-hidden
      style={{ height, width: 'auto', overflow: 'visible' }}
    >
      {/* Trunk and two boughs. Drawn once and never changed — the tree is the
          same tree on day one and day three hundred, which is the point; only
          what it is carrying changes. */}
      <path
        d="M48 118 L48 74 Q 47 62 44 54 M52 118 L52 74 Q 53 62 56 54 M49 82 Q 40 76 34 66 M51 78 Q 61 73 67 63"
        stroke="#5C4028"
        strokeWidth="3.4"
        strokeLinecap="round"
        fill="none"
      />

      {/* Leaves, in the order they grew. */}
      {LEAVES.slice(0, grown).map((leaf, i) => (
        <circle
          key={i}
          cx={leaf.x}
          cy={leaf.y}
          r={leaf.r}
          fill={leaf.dark ? '#3F7A4C' : '#57A265'}
          opacity={0.92}
        />
      ))}

      {/* Fireflies in the branches, once there are branches worth sitting in.
          Still when the app has quietened itself — a child who is upset is not
          charmed by twinkling (§7). */}
      {NESTS.slice(0, nesting).map((nest, i) =>
        quiet ? (
          <circle key={i} cx={nest.x} cy={nest.y} r={2.2} fill="#FFE7B4" opacity={0.7} />
        ) : (
          <motion.circle
            key={i}
            cx={nest.x}
            cy={nest.y}
            r={2.2}
            fill="#FFE7B4"
            style={{ filter: 'drop-shadow(0 0 4px #FFC65C)' }}
            animate={{ opacity: [0.35, 1, 0.35] }}
            transition={{ repeat: Infinity, duration: 2.6, delay: nest.delay, ease: 'easeInOut' }}
          />
        ),
      )}
    </svg>
  );
}
