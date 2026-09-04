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

/**
 * What the room is doing right now.
 *
 * `pick` — the feeling beat. All of them are here, in their slots, tappable.
 * `witness` — a later beat. Only the ones the child recognised are still
 *   here, smaller, tucked around the edges, not tappable. They stay because
 *   the journey is one continuous place: the Chirpy you recognised does not
 *   evaporate the moment you look at where the feeling sits. It comes with
 *   you and keeps you company while you do.
 */
export type RoomMode = 'pick' | 'witness';

/**
 * Where a Chirpy goes once it has been recognised and the room has moved on.
 *
 * Hard into the corners, top and bottom, and never across the middle band —
 * that is where the beat's own words and buttons are, and a Chirpy sitting on
 * top of "Quite big" is charming for about one second and then it is a child
 * unable to answer the question.
 */
const PERCHES = [
  { left: '-2%', top: '-4%' },
  { left: '84%', top: '-2%' },
  { left: '-2%', top: '84%' },
  { left: '86%', top: '86%' },
  { left: '30%', top: '-6%' },
  { left: '58%', top: '90%' },
];

export function ChirpyRoom({
  mode = 'pick',
  selected,
  familiarFeeling,
  accent,
  onToggle,
}: {
  mode?: RoomMode;
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
  const witness = mode === 'witness';

  // Stable perch order, so a Chirpy doesn't hop to a different edge just
  // because the child changed their mind about a different one.
  const perchFor = (id: string) => {
    const order = CHIRPY_ROOM_SLOTS.filter((s) => selected.has(s.id)).map((s) => s.id);
    return PERCHES[order.indexOf(id) % PERCHES.length];
  };

  return (
    <div className="pointer-events-none relative h-full w-full">
      <AnimatePresence>
        {CHIRPY_ROOM_SLOTS.map((slot, i) => {
          const state = getChirpyState(slot.id);
          if (!state) return null;
          const isSelected = selected.has(slot.id);
          // Once the room moves on, the ones that weren't recognised drift
          // off. Nothing is said about it; they were never wrong answers.
          if (witness && !isSelected) return null;

          const perch = witness ? perchFor(slot.id) : null;

          return (
            <motion.div
              key={slot.id}
              // Only pickable Chirpys take pointer events. Once they're just
              // keeping the child company they must not sit in front of the
              // controls and swallow taps meant for the beat underneath.
              className={`absolute ${witness ? 'pointer-events-none' : 'pointer-events-auto'}`}
              style={{ zIndex: Math.round((1 - slot.depth) * 10) }}
              // They arrive one at a time, further-away ones first, as though
              // the room were being noticed rather than switched on.
              initial={{ opacity: 0, scale: 0.8, left: slot.left, top: slot.top }}
              animate={{
                opacity: 1,
                scale: witness ? 0.62 : 1,
                left: perch ? perch.left : slot.left,
                top: perch ? perch.top : slot.top,
              }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{
                duration: witness ? 0.9 : 0.5,
                ease: 'easeInOut',
                delay: witness || m.quiet ? 0 : (1 - slot.depth) * 0.5 + i * 0.09,
              }}
            >
              <ChirpyBeing
                state={state}
                depth={slot.depth}
                selected={!witness && isSelected}
                familiar={!witness && familiarFeeling !== null && state.feeling === familiarFeeling}
                accent={accent}
                // Not pickable once the room has moved on — they're company
                // at that point, not a question.
                onSelect={witness ? undefined : () => onToggle(slot.id)}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
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
