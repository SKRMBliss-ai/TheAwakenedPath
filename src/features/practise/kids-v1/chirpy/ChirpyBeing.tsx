import { motion, type Transition } from 'framer-motion';
import { useMotion } from '../ui/quiet';
import { chirpySprite } from '../ui/sprites';
import type { ChirpyMotion, ChirpyState } from './states';

/**
 * One Chirpy, in one state, rendered from data.
 *
 * This is the only component in the app that draws a Chirpy being. Every
 * emotional state — the six a child can point at, the companion ones, and
 * whatever gets added later — comes through here as a `ChirpyState` row. If
 * you find yourself writing a second component for a particular Chirpy, the
 * thing that actually needs adding is a field on ChirpyState.
 *
 * Motion is looked up from the state rather than passed in, so a Chirpy moves
 * the same way everywhere it appears, and every loop switches off in the
 * quiet state (§7) without any call site having to remember to do that.
 */

/** The movement vocabulary, one entry per ChirpyMotion. */
const MOTION: Record<ChirpyMotion, { y?: number[]; x?: number[]; rotate?: number[]; duration: number }> = {
  breathe: { y: [0, -2, 0], duration: 5.4 },
  bob:     { y: [0, -8, 0], duration: 4.2 },
  bounce:  { y: [0, -15, 0], rotate: [0, -3, 2, 0], duration: 1.9 },
  drift:   { y: [0, -7, 0], x: [0, 9, 0], duration: 7.5 },
  fidget:  { y: [0, -3, 1, -2, 0], rotate: [0, -2, 2, -1, 0], duration: 2.6 },
  dart:    { x: [0, 7, -6, 4, 0], rotate: [0, 4, -5, 2, 0], duration: 3.1 },
};

export function ChirpyBeing({
  state,
  size = 92,
  depth = 0,
  selected = false,
  familiar = false,
  accent,
  onSelect,
  className = '',
  style,
}: {
  state: ChirpyState;
  /** Base size in px, before the state's own scale and any depth shrink. */
  size?: number;
  /** 0 = right beside the child, 1 = far back in the room. */
  depth?: number;
  selected?: boolean;
  /**
   * This device has been here often. Renders as a slightly warmer pool of
   * ambient light and NOTHING else — no caption, no badge, no arrow. A child
   * may notice the room is warmer around one of them without ever being told
   * "you are usually this", which is a claim the app has no business making.
   */
  familiar?: boolean;
  accent: string;
  /** Omit to render a Chirpy that is simply present rather than pickable. */
  onSelect?: () => void;
  className?: string;
  style?: React.CSSProperties;
}) {
  const m = useMotion();
  const move = MOTION[state.motion];

  // Further back = smaller, softer, slightly hazier. Cheap depth, but it
  // stops the room reading as a flat row of stickers.
  const px = size * state.scale * (1 - depth * 0.34);
  const haze = depth * 0.28;

  const loop: Transition | undefined = m.loop
    ? { repeat: Infinity, duration: move.duration, ease: 'easeInOut' }
    : undefined;

  const sprite = (
    <motion.img
      src={chirpySprite(state.pose)}
      alt=""
      draggable={false}
      style={{
        height: px,
        width: 'auto',
        // Selected lifts out of the haze and warms up; nothing else changes,
        // because nothing here is more correct than anything else.
        opacity: selected ? 1 : 1 - haze,
        filter: selected
          ? `drop-shadow(0 0 18px ${accent}) drop-shadow(0 10px 20px rgba(0,0,0,0.5))`
          : `drop-shadow(0 10px 20px rgba(0,0,0,0.45)) saturate(${1 - depth * 0.25})`,
      }}
      animate={m.loop ? { y: move.y, x: move.x, rotate: move.rotate } : undefined}
      transition={loop}
    />
  );

  if (!onSelect) {
    return <div className={className} style={style}>{sprite}</div>;
  }

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      aria-label={state.description}
      aria-pressed={selected}
      whileTap={{ scale: 0.94 }}
      whileHover={m.quiet ? undefined : { scale: 1.06 }}
      className={`relative grid place-items-center ${className}`}
      style={style}
    >
      {/* The room being a bit warmer where this child has often been. Slow,
          faint, wordless — set well below the selected glow so it reads as
          weather rather than as a recommendation. */}
      {familiar && !selected && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute rounded-full"
          animate={{ opacity: [0.35, 0.6, 0.35] }}
          transition={m.loop ? { repeat: Infinity, duration: 6, ease: 'easeInOut' } : undefined}
          style={{
            width: px * 1.7,
            height: px * 1.7,
            background: `radial-gradient(circle, ${accent}2E 0%, ${accent}00 70%)`,
          }}
        />
      )}

      {/* A warm pool of light under the chosen one — the room noticing the
          child's choice, rather than a tick confirming a right answer. */}
      {selected && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute rounded-full"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          style={{
            width: px * 1.5,
            height: px * 1.5,
            background: `radial-gradient(circle, ${accent}55 0%, ${accent}00 68%)`,
          }}
        />
      )}
      {sprite}
    </motion.button>
  );
}
