import { motion } from 'framer-motion';
import { CHROME, Cta, FONT } from '../ui/chrome';
import { Chirpy } from '../ui/scene';
import { FireflyJar } from './FireflyJar';
import { accentFor, type VirtueRoom } from './rooms';

/**
 * The beat right after a firefly goes in the jar.
 *
 * It exists for one reason: to be the nicest half-second in the app, and to
 * happen the instant a child says something true about their day. Everything
 * else here is arranged around making that tick worth doing again tomorrow.
 *
 * NO SCORE, NO TALLY, NO "3 OF 7". The jar is the only feedback. A child sees
 * their lights and how many is however many there are — the app never counts
 * out loud, because the moment it does, six is a disappointment.
 *
 * Two ways on, both real: straight to the next room, or stay and play
 * something here. Staying is not a detour from the journey; it IS the
 * journey, and the wording says so.
 */
export function CaughtFirefly({
  room,
  caught,
  onNext,
  onStay,
  isLast,
}: {
  room: VirtueRoom;
  /** Behaviour ids ticked today, including the one just caught. */
  caught: string[];
  onNext: () => void;
  onStay: () => void;
  isLast: boolean;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-50 grid place-items-center px-6"
      style={{
        fontFamily: FONT,
        background: 'radial-gradient(60% 40% at 50% 42%, rgba(60,40,90,0.85) 0%, rgba(9,6,20,0.97) 72%)',
        backdropFilter: 'blur(6px)',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex w-full max-w-sm flex-col items-center gap-5 text-center">
        <motion.div
          initial={{ scale: 0.82, y: 14 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 160, damping: 16 }}
        >
          <FireflyJar caught={caught} newest={room.id} size={132} />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="text-[24px] font-extrabold leading-snug"
          style={{ color: CHROME.text, textShadow: '0 2px 22px rgba(0,0,0,0.7)' }}
        >
          There it is. Straight in the jar.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="flex w-full flex-col gap-2.5"
        >
          <Cta
            label={isLast ? 'That’s the lot — let’s look back' : 'Next one'}
            onClick={onNext}
            accent={accentFor(room)}
          />
          <button
            onClick={onStay}
            className="w-full rounded-full px-5 py-3.5 text-[14px] font-bold backdrop-blur-md"
            style={{ background: CHROME.pill, border: `1px solid ${CHROME.pillBorder}`, color: CHROME.text }}
          >
            Play something in the {room.name}
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Chirpy pose="excited" line={room.caughtLine} align="left" />
        </motion.div>
      </div>
    </motion.div>
  );
}
