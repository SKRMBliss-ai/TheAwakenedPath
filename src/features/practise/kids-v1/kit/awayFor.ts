/**
 * COMING BACK.
 *
 * Killing the streak was right: a counter that resets when a child is too sad
 * to open the app punishes them for the exact days the app exists for. But
 * removing it left nothing in its place, and "nothing" turns out to have its
 * own cost — a child who has been away three weeks opens the gym and gets a
 * byte-identical hub. No acknowledgement at all reads as a machine that
 * didn't notice they were gone, which is a different unkindness from the one
 * the streak was doing.
 *
 * So: after a real absence, Chirpy is pleased to see them, and says
 * absolutely nothing about the gap.
 *
 * THE RULES THIS KEEPS, WHICH ARE MOSTLY ABOUT WHAT IT NEVER SAYS:
 *
 *   · It never names the length of the absence. No "three weeks!", no "where
 *     have you been?", no "we missed you" — every one of those is an
 *     invoice, and a six-year-old hears the bill in it.
 *   · It never implies anything was lost, because nothing was. The sky, the
 *     jars and the shelf are exactly as they were left; that is the whole
 *     design of them.
 *   · It never asks why. A child who stopped coming because things were bad
 *     is the likeliest returner, and "where did you get to?" is the one
 *     question guaranteed to make coming back cost something.
 *
 * WHAT IT DOES INSTEAD: Chirpy has been getting on with his own week. He
 * mentions what he's been up to, the way a friend does when they see you
 * again — which quietly says both "you weren't being waited on" and "I'm
 * glad you're here", without a word of either.
 */

const KEY = 'mindgym.kidsv1.away';

/**
 * Under this, coming back isn't coming back — it's just Tuesday. Ten days is
 * long enough that a child notices they've been gone, and short enough to
 * catch the fortnight-off case rather than only the disappeared-for-a-season
 * one.
 */
const AWAY_DAYS = 10;

/**
 * The line is Chirpy's own news, deliberately about HIS week rather than
 * theirs. Nothing here is a lesson, an encouragement, or a hint that they
 * should come more often — he is a friend with his own business, not a
 * retention mechanic with a face.
 */
const NEWS = [
  'Oh — you’re here. I’ve been mostly asleep, if I’m honest.',
  'You’re here! I found a really good stick. I kept it, obviously.',
  'There you are. I’ve been counting the ceiling. There’s a lot of it.',
  'Oh good, it’s you. I taught myself a new noise. I’ll do it later.',
  'You’re back. I moved a chair about four inches. Big week.',
];

interface Away {
  /** The last day the child was seen, so a gap can be measured. */
  seen?: string;
  /** The day a welcome was last shown, so it happens once per return. */
  greeted?: string;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string): number {
  return Math.round(
    (new Date(b + 'T00:00:00').getTime() - new Date(a + 'T00:00:00').getTime()) / 86400000,
  );
}

function read(): Away {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Away) : {};
  } catch { return {}; }
}

function write(a: Away): void {
  try { localStorage.setItem(KEY, JSON.stringify(a)); } catch { /* storage off — no welcome, no harm */ }
}

/**
 * Chirpy's line if this is a return, or null — WITHOUT committing to having
 * said it.
 *
 * Split from the commit because the hub now shows one thing a night and has
 * to compare candidates before choosing (see kit/hubMoment). The old single
 * function stamped "greeted" simply for being asked, so merely considering
 * the welcome burned it: a child who was shown a note from home instead would
 * have silently lost the welcome they were owed, and nothing on any screen
 * would ever have revealed it.
 *
 * Stamping TODAY AS SEEN still happens on every call, and must — that is how
 * the gap gets measured at all, and it is true whether or not anything is
 * shown.
 *
 * Which line they get is fixed by the date, so it can't reshuffle itself
 * while they're reading it.
 */
export function peekWelcomeBack(): string | null {
  const t = today();
  const a = read();

  const gap = a.seen ? daysBetween(a.seen, t) : 0;
  const returning = gap >= AWAY_DAYS && a.greeted !== t;

  write({ ...a, seen: t });
  if (!returning) return null;

  const seed = t.split('-').reduce((n, part) => n + Number(part), 0);
  return NEWS[seed % NEWS.length];
}

/** It was actually shown. Spends the welcome for today. */
export function welcomeBackShown(): void {
  write({ ...read(), greeted: today() });
}
