import { motion } from 'framer-motion';
import { useMotion } from '../ui/quiet';
import { loadCases } from '../kit/cases';
import { hungIn } from '../kit/hung';

/**
 * THEIR PICTURE, ON THE WALL OF THIS ROOM.
 *
 * See kit/hung for why this exists. Scenery rather than content: it hangs
 * behind everything the room is saying, the way a picture in a real room is
 * behind the conversation happening in front of it. There is nothing to tap
 * and nothing to read — a frame that opened a menu would turn the one thing
 * the child owns in here back into a piece of interface.
 *
 * IT IS DRAWN AS A FRAME, not as an image floating on the wall. A child's
 * drawing dropped straight onto a painted room reads as a bug; the same
 * drawing with a mount and a bit of shadow reads as something somebody put
 * up on purpose, which is exactly what happened.
 *
 * It leans a degree or two off square, and always by the same amount for the
 * same room — a picture hung by a six-year-old is not level, and one that
 * re-levelled itself on every render would be the app tidying up after him.
 */
export function HungDrawing({ roomId }: { roomId: string }) {
  const m = useMotion();
  const caseId = hungIn(roomId);
  if (!caseId) return null;

  // The drawing goes when the case does — a picture the child threw away
  // must not survive in a frame. See kit/hung.
  const drawing = loadCases().find((c) => c.id === caseId)?.drawing;
  if (!drawing) return null;

  const tilt = ((roomId.charCodeAt(0) % 5) - 2) * 0.9;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute left-3 top-24 z-0 sm:left-7"
      /*
        THE TILT IS A MOTION VALUE, not a CSS transform in `style`.

        Written as `style={{ transform: 'rotate(...)' }}` it silently did
        nothing: framer-motion builds its own transform for the `y` in these
        keyframes and that replaces the one in style wholesale, so the picture
        hung perfectly level while the code claimed otherwise. Same trap
        DoorHandle documents from the other direction. Handing `rotate` to
        framer-motion lets it compose both into one transform.
      */
      initial={{ opacity: 0, y: -6, rotate: tilt }}
      animate={{ opacity: 0.94, y: 0, rotate: tilt }}
      transition={{ duration: m.quiet ? 0.8 : 0.6, delay: 0.3 }}
    >
      {/* The nail, and the wire it hangs off. Two divs, and they do more for
          "somebody hung this" than the frame itself does. */}
      <span
        className="absolute left-1/2 top-[-9px] block h-1.5 w-1.5 rounded-full"
        style={{ background: 'rgba(0,0,0,0.55)', transform: 'translateX(-50%)' }}
      />
      <span
        className="absolute left-1/2 top-[-7px] block h-[7px] w-10"
        style={{
          transform: 'translateX(-50%)',
          borderTop: '1px solid rgba(0,0,0,0.4)',
          borderRadius: '50% 50% 0 0 / 100% 100% 0 0',
        }}
      />

      <div
        className="rounded-[6px] p-1.5"
        style={{
          background: 'linear-gradient(160deg,#6B4A28,#3E2A15)',
          boxShadow: '0 10px 22px rgba(0,0,0,0.55)',
        }}
      >
        <img
          src={drawing}
          alt=""
          draggable={false}
          className="block h-auto w-[74px] rounded-[2px] sm:w-[92px]"
          style={{ background: '#F6EEDC' }}
        />
      </div>
    </motion.div>
  );
}
