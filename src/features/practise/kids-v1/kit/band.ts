/**
 * HOW OLD THE CHILD IS, AND WHY THE APP ASKS.
 *
 * The founder's teaching-moves document bands almost every one of its
 * eighteen sections — "ages 3–8", "ages 9–14", "both bands" — and three
 * sections (§5, §7, §9) give TWO DIFFERENT MOVES for the same idea precisely
 * so that there is one to pick for each. That banding was being thrown away:
 * the library shipped as one flat rotation, so a five-year-old could draw
 * "think of something embarrassing you did this year, and now think of
 * someone else's" (§16, explicitly 9–14 and resting on several years of
 * social memory), and a thirteen-year-old could draw "you used to cry about
 * the blue cup" (§7, explicitly 3–8), which at thirteen is being talked down
 * to by a bird.
 *
 * Neither of those is a small miss. A move aimed at the wrong band does not
 * land softly — it fails, and the child learns that this app's games are not
 * for them.
 *
 * WHY IT IS NOT IN THE ZUSTAND STORE. Every other thing the kids-v1 teaching
 * engine remembers — which moves have been seen, where the arc has got to,
 * which secret game is out — lives in its own localStorage key under this
 * kit, and the shared store belongs to My Best Every Day. This is the same
 * kind of thing as those, so it goes where those go.
 *
 * NOTHING LEAVES THE DEVICE, which is true of everything in here, and matters
 * more for this one than for "has this child seen the purple elephant yet".
 */

const KEY = 'mindgym.kidsv1.band';

/** The document's two bands, and its own numbers. */
export type Band = 'young' | 'older';

/** 3–8 gets the younger move, 9–14 the older one. */
const OLDER_FROM = 9;

interface Store {
  years?: number;
  /** They were asked and chose not to say. Asked once, then never again. */
  declined?: boolean;
}

function read(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Store) : {};
  } catch { return {}; }
}

function write(s: Store): void {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* storage off */ }
}

/**
 * Which band, or null if the app doesn't know.
 *
 * NULL IS A PROPER ANSWER and has to stay usable forever — a child can
 * decline, storage can be off, and nobody should be nagged into telling an
 * app their age to make it work. What null means for the library is "serve
 * only the moves the document didn't band", which is a smaller rotation of
 * genuinely universal material rather than a degraded one. See teachings.ts.
 */
export function band(): Band | null {
  const years = read().years;
  if (typeof years !== 'number') return null;
  return years >= OLDER_FROM ? 'older' : 'young';
}

/** Whether Chirpy should still be asking. */
export function bandUnknown(): boolean {
  const s = read();
  return typeof s.years !== 'number' && !s.declined;
}

export function setAge(years: number): void {
  write({ years });
}

/** Optional existing profile age; never ask again just to start practice. */
export function childAge(): number | undefined {
  const years = read().years;
  return typeof years === 'number' && Number.isFinite(years) ? years : undefined;
}

/** They'd rather not say. A complete answer, and he doesn't ask again. */
export function declineAge(): void {
  write({ declined: true });
}

/**
 * The ages offered.
 *
 * Starts at four rather than three because a three-year-old is not operating
 * this themselves, and stops at fourteen because that is where the document
 * stops. Children are generally delighted to be asked their age — it is a
 * thing they are proud of rather than a thing being extracted from them —
 * which is why this is a row of numbers to tap and not a form field.
 */
export const AGES = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] as const;
