import type { Perch } from './todaysFeeling';

/**
 * WHERE THE CHILD PUT A JAR — there are two now: today's, floating in the
 * hub, and the lifetime one in the Observatory. Keyed by an id per jar
 * rather than shared, because they are two different objects a child can
 * pick up and won't want landing in the same corner — and NOT scoped to
 * the day, for either of them: a jar moved to the bottom-left is a
 * decision about where that jar lives, and re-making it every morning
 * would be the app forgetting something they bothered to tell it.
 */
const PREFIX = 'mindgym.kidsv1.jarPerch';

export function saveJarPerch(id: string, p: Perch) {
  try { localStorage.setItem(`${PREFIX}.${id}`, JSON.stringify(p)); } catch { /* storage off — it just goes home each visit */ }
}

export function loadJarPerch(id: string): Perch | null {
  try {
    const raw = localStorage.getItem(`${PREFIX}.${id}`);
    if (!raw) return null;
    const v = JSON.parse(raw) as Perch;
    return typeof v?.x === 'number' && typeof v?.y === 'number' ? v : null;
  } catch { return null; }
}
