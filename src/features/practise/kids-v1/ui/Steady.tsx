import { motion } from 'framer-motion';
import { CHROME, FONT } from './chrome';
import { useQuiet } from './quiet';

/**
 * SOMEBODY IS STILL HERE.
 *
 * The presence a distressed child gets instead of Chirpy — see kit/steady for
 * §18 and for why these lines belong to nobody in particular.
 *
 * THIS IS THE PLAINEST COMPONENT IN THE APP AND THAT IS THE ENTIRE DESIGN.
 * No sprite. No speech bubble with a tail. No entrance spring, no bob, no
 * shimmer, no accent colour borrowed from the room. Every one of those is a
 * thing the app does to be charming, and charm is what §18 switches off: "no
 * experiments, no images, nothing clever."
 *
 * What is left is a sentence, at a comfortable size, with air around it, in
 * the same soft white as the rest of the quiet state. It fades in slowly
 * enough not to be an event. A child who is upset should be able to read it
 * without anything happening to them.
 *
 * IT RENDERS NOTHING WHEN THE APP IS NOT QUIET. Callers do not have to check.
 * The reverse of the rule Chirpy keeps, enforced in one place for the same
 * reason: a line meant for the worst evening of somebody's month must never
 * turn up on an ordinary Tuesday, and that guarantee should not depend on
 * nine call sites remembering it.
 */
export function Steady({ line }: { line: string | null }) {
  const quiet = useQuiet();
  if (!quiet || !line) return null;

  return (
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      /* Slow, and no movement at all. Something that slides or springs is an
         event, and this is meant to be the opposite of an event. */
      transition={{ duration: 1.1, ease: 'easeOut' }}
      className="text-[16px] font-semibold leading-relaxed"
      style={{ color: CHROME.text, fontFamily: FONT, textWrap: 'balance' }}
    >
      {line}
    </motion.p>
  );
}
