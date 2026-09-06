import { AnimatePresence, motion } from 'framer-motion';
import { getChirpyState } from './states';

/**
 * The one line of text a chosen Chirpy leaves behind.
 *
 * This is what survives of the Chirpy Room. That screen used to hold half a
 * dozen small Chirpys drifting over the painting, any of which a child could
 * recognise as a bit like themselves. It was busy, and it asked a child to
 * chase a moving target to answer a question about how they feel — so the
 * still list took over and the drifting layer went. The aside stayed,
 * because it never moved and it is the part that actually says something.
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
