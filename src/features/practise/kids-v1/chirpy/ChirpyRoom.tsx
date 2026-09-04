import { AnimatePresence, motion } from 'framer-motion';
import { ChirpyBeing } from './ChirpyBeing';
import { CHIRPY_ROOM_SLOTS, getChirpyState } from './states';
import { useMotion } from '../ui/quiet';

/**
 * The feeling beat: a room with Chirpys in it.
 *
 * This replaces the emotion balloons entirely. The question a child answers
 * here is not "which emotion are you" — it is "is one of these familiar",
 * which is a much smaller, much safer thing to ask, and one they can answer
 * by looking rather than by naming.
 *
 * NOTHING IS LABELLED. There is no word next to any Chirpy. A child reads
 * them off posture and movement, which is the whole point: the moment one
 * carries the caption "Worried", the screen becomes a quiz about vocabulary
 * and the child starts answering the label instead of themselves. The state
 * descriptions ride along as aria-labels for screen readers only.
 *
 * MORE THAN ONE IS FINE, AND SO IS NONE. Selection is a toggle, any number
 * can be lit at once, and the way forward is available whether or not
 * anything is chosen. "Not sure" is a Chirpy sitting quietly in the room
 * rather than a get-out button under it, because not knowing is a way to
 * feel, not a failure to answer.
 */

export function ChirpyRoom({
  selected,
  familiarFeeling,
  accent,
  onToggle,
}: {
  selected: Set<string>;
  /**
   * The feeling id this device has picked most often, or null. The Chirpy
   * that maps to it gets a slightly warmer patch of room and no words —
   * see ChirpyBeing's `familiar`.
   */
  familiarFeeling: string | null;
  accent: string;
  onToggle: (stateId: string) => void;
}) {
  const m = useMotion();

  return (
    <div className="relative w-full" style={{ height: 380 }}>
      {CHIRPY_ROOM_SLOTS.map((slot, i) => {
        const state = getChirpyState(slot.id);
        if (!state) return null;
        return (
          <motion.div
            key={slot.id}
            className="absolute"
            style={{ left: slot.left, top: slot.top, zIndex: Math.round((1 - slot.depth) * 10) }}
            // They arrive one at a time, further-away ones first, as though
            // the room were being noticed rather than switched on.
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: m.quiet ? 0 : (1 - slot.depth) * 0.5 + i * 0.09 }}
          >
            <ChirpyBeing
              state={state}
              depth={slot.depth}
              selected={selected.has(slot.id)}
              familiar={familiarFeeling !== null && state.feeling === familiarFeeling}
              accent={accent}
              onSelect={() => onToggle(slot.id)}
            />
          </motion.div>
        );
      })}
    </div>
  );
}

/**
 * Chirpy's own aside about whichever one was picked most recently. He wonders
 * out loud; he never concludes. If several are picked he speaks to the last
 * one touched, because a running commentary on all of them would turn a quiet
 * noticing into a summary of the child.
 */
export function ChirpyAside({ stateId, accent }: { stateId: string | null; accent: string }) {
  const state = stateId ? getChirpyState(stateId) : undefined;

  return (
    <div className="min-h-[34px]">
      <AnimatePresence mode="wait">
        {state?.aside && (
          <motion.p
            key={state.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.3 }}
            className="text-[13.5px] font-semibold leading-snug"
            style={{ color: accent, textShadow: '0 1px 8px rgba(0,0,0,0.6)' }}
          >
            {state.aside}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
