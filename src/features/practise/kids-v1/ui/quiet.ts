import { createContext, useContext, useMemo } from 'react';

/**
 * THE QUIET STATE — UI design §7, master plan §13.3.
 *
 * "The interface calms down when the child doesn't." When the check-in comes
 * back high-intensity and unpleasant, motion stops, choices shrink in number,
 * targets grow, transitions slow, language plainens, and Chirpy disappears.
 *
 * **None of this is announced to the child.** There is no "I can see you're
 * upset" banner anywhere in this feature, and there must never be one: a
 * child who is told the app noticed starts performing for it.
 *
 * It is a context rather than a prop because every leaf — every pill, every
 * transition, every Chirpy — needs it, and threading a boolean through six
 * engines is exactly how a screen ends up cheerfully animating at a
 * distressed child eighteen months from now.
 *
 * Lives in its own hooks-only module (no components) so the whole feature can
 * import these without tripping react-refresh's one-kind-of-export rule. The
 * provider itself is a component and lives next door in chrome.tsx.
 */
export const QuietContext = createContext(false);

export function useQuiet() {
  return useContext(QuietContext);
}

/**
 * Every timing and sizing number that the quiet state changes, in one place.
 * Components read these rather than branching on `quiet` themselves — which
 * is what stops the adaptive behaviour drifting apart screen by screen.
 */
export function useMotion() {
  const quiet = useQuiet();
  return useMemo(
    () => ({
      quiet,
      /** Screen-to-screen. */
      transition: { duration: quiet ? 0.75 : 0.38, ease: 'easeOut' as const },
      /** Ambient loops — switched off entirely when quiet. */
      loop: quiet ? undefined : { repeat: Infinity, duration: 4, ease: 'easeInOut' as const },
      /** How long an auto-advance waits after a tap, so the child sees it register. */
      advanceMs: quiet ? 1100 : 620,
      /** Minimum target size (§2.6: 44px normally, 64px in the quiet state). */
      target: quiet ? 64 : 48,
      gap: quiet ? 16 : 10,
    }),
    [quiet],
  );
}
