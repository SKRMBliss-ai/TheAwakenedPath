/**
 * SOMEONE ELSE IS IN THE GYM TONIGHT.
 *
 * The brief was "rare magic, one time in twenty". The obvious build is an
 * effect — extra sparkles, a shinier jar, a burst of confetti on a lucky roll.
 * That is a slot machine, and children work out slot machines fast: once a
 * child knows that tapping enough times produces the sparkle, the sparkle is
 * the thing they are playing for and the app has taught them to farm it.
 *
 * So the rare thing is not an effect. It is a VISITOR. Somebody who is not
 * Chirpy is here, once, standing about in the gym. They say one thing. Then
 * they go, and they might not be back for a month. Nothing is awarded, nothing
 * is unlocked, nothing is collected, and there is no set of them to complete —
 * a child who realises there is a set will start hunting the set.
 *
 * NOTHING EVER SAYS IT IS RARE. No "rare!", no badge, no shimmer announcing
 * it, and no count of how many times it has happened. The rarity has to be
 * genuinely experienced rather than declared: the whole value is a six-year-old
 * telling you, unprompted, that there was a moth in the gym on Tuesday. Label
 * it and it becomes a reward; leave it alone and it becomes a memory.
 *
 * THEIR LINES HAVE NOTHING TO TEACH. Not one of them is about feelings, or
 * effort, or trying your best. They are passing through and thinking about
 * their own business, which is exactly why meeting one feels like the world
 * being bigger than the app rather than the app doing another exercise.
 */

export interface Visitor {
  id: string;
  /** What they are, for the accessible name. */
  name: string;
  /** The single thing they say. */
  line: string;
  /** Their colour, for the small drawing. */
  hue: string;
  shape: 'moth' | 'tortoise' | 'fox' | 'firefly' | 'beetle';
}

export const VISITORS: Visitor[] = [
  {
    id: 'moth',
    name: 'A moth',
    line: 'Don’t mind me. I’m only in for the light.',
    hue: '#D9C9F0',
    shape: 'moth',
  },
  {
    id: 'tortoise',
    name: 'An old tortoise',
    line: 'I used to come here. It’s had a paint since then.',
    hue: '#8FB98F',
    shape: 'tortoise',
  },
  {
    id: 'fox',
    name: 'A fox',
    line: 'You’re up late. So am I. We won’t tell anyone.',
    hue: '#E8A25C',
    shape: 'fox',
  },
  {
    id: 'wildfirefly',
    name: 'A wild firefly',
    line: 'I’m not one of yours. I just liked the look of the jar.',
    hue: '#FFD98A',
    shape: 'firefly',
  },
  {
    id: 'beetle',
    name: 'A beetle',
    line: 'Chirpy owes me a button. He knows the one.',
    hue: '#7FC7D9',
    shape: 'beetle',
  },
];

const KEY = 'mindgym.kidsv1.visitor';

/** Roughly one arrival in twenty. */
const ODDS = 20;

/**
 * And never twice inside this many days, whatever the dice say. One in twenty
 * is only rare on average: over a fortnight of a child opening the app three
 * times an evening it would land twice in a week often enough to stop being an
 * event at all. The floor is what actually makes it rare.
 */
const REST_DAYS = 12;

interface Seen {
  /** ISO day of the last visit. */
  last?: string;
  /** Which visitor came that day, so the same one doesn't come twice running. */
  lastId?: string;
  /** The day already rolled for, so a re-render can't re-roll it. */
  rolled?: string;
  /** What that roll produced — a visitor id, or '' for nobody. */
  rolledId?: string;
}

function read(): Seen {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Seen) : {};
  } catch { return {}; }
}

function write(s: Seen): void {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* storage off — nobody comes, which is the common case anyway */ }
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string): number {
  return Math.round(
    (new Date(b + 'T00:00:00').getTime() - new Date(a + 'T00:00:00').getTime()) / 86400000,
  );
}

/**
 * Whoever is here today, or null — which is almost every day.
 *
 * THE ROLL HAPPENS ONCE PER DAY and is then written down, so navigating back
 * to the hub doesn't roll again. Without that, a child who goes in and out of
 * five rooms has rolled six times and the odds are not one in twenty any more;
 * worse, a visitor who appeared once would vanish on the next visit to the hub
 * and reappear on the one after, which reads as a glitch rather than a guest.
 */
export function visitorForToday(): Visitor | null {
  const t = today();
  const seen = read();

  // Already decided today, either way.
  if (seen.rolled === t) {
    return seen.rolledId ? VISITORS.find((v) => v.id === seen.rolledId) ?? null : null;
  }

  const tooSoon = seen.last ? daysBetween(seen.last, t) < REST_DAYS : false;
  const lucky = !tooSoon && Math.floor(Math.random() * ODDS) === 0;

  if (!lucky) {
    write({ ...seen, rolled: t, rolledId: '' });
    return null;
  }

  // Not the one who came last time — two visits a month apart being the same
  // moth makes the world smaller rather than bigger.
  const pool = VISITORS.filter((v) => v.id !== seen.lastId);
  const who = pool[Math.floor(Math.random() * pool.length)];

  write({ last: t, lastId: who.id, rolled: t, rolledId: who.id });
  return who;
}
