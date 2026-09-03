import { motion, AnimatePresence } from 'framer-motion';
import { chirpySprite, type ChirpyPose } from './content';

/**
 * Chirpy — the shoulder-bar character, present on nearly every check-in
 * screen (see BUILD_BRIEF.md §0). Absent in the quiet state and on the
 * trusted-adult screens; callers simply don't render <ChirpyBar> there
 * rather than this component hiding itself, so its absence is always an
 * explicit choice at the call site.
 *
 * Sprites are the founder's real character art (docs/.../reference/sprites),
 * copied into /public/chirpy — nothing else in the check-in has real art yet.
 */

export function ChirpyBar({
  pose,
  line,
  name = 'Chirpy',
  size = 'md',
  waiting = false,
}: {
  pose: ChirpyPose;
  /** The speech-bubble text. Omit for a silent beat (Chirpy just fidgets). */
  line?: string | null;
  name?: string;
  size?: 'sm' | 'md' | 'big';
  /** Shows the bubble in a muted "still thinking" style. */
  waiting?: boolean;
}) {
  const height = size === 'sm' ? 62 : size === 'big' ? 180 : 84;

  return (
    <div className="mb-2.5 flex items-end gap-2.5" style={{ minHeight: height }}>
      <AnimatePresence mode="wait">
        {line !== undefined && line !== null && (
          <motion.div
            key={line}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="relative flex-1 rounded-[20px] px-4 py-3 text-[15px] font-extrabold leading-tight shadow-lg"
            style={{ background: 'rgba(255,255,255,0.95)', color: waiting ? '#9B93B4' : '#241D3D' }}
          >
            {line}
          </motion.div>
        )}
        {(line === undefined || line === null) && <div className="flex-1" />}
      </AnimatePresence>
      <motion.img
        src={chirpySprite(pose)}
        alt={name}
        style={{ height, width: 'auto', filter: 'drop-shadow(0 10px 24px rgba(0,0,0,0.5))' }}
        animate={{ y: [0, -5, 2, -2, 0], rotate: [0, -2, 1.4, -0.7, 0] }}
        transition={{ repeat: Infinity, duration: 3.6, ease: 'easeInOut' }}
        draggable={false}
      />
    </div>
  );
}
