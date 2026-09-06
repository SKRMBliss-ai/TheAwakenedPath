import type { Perch } from './todaysFeeling';

/**
 * WHERE THE CHILD PUT THE JAR.
 *
 * Its own key rather than a share of the companion's (kit/todaysFeeling),
 * because they are two different objects a child can pick up and they will
 * not want them in the same corner — and because this one is NOT scoped to
 * the day. A jar moved to the bottom-left is a decision about where the jar
 * lives, and re-making it every morning would be the app forgetting
 * something they bothered to tell it.
 */
const KEY = 'mindgym.kidsv1.jarPerch';

export function saveJarPerch(p: Perch) {
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* storage off — it just goes home each visit */ }
}

export function loadJarPerch(): Perch | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as Perch;
    return typeof v?.x === 'number' && typeof v?.y === 'number' ? v : null;
  } catch { return null; }
}
