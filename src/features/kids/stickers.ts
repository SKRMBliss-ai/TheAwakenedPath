/**
 * THE STICKER BOOK — what a child can collect in the Games Room, and what it
 * takes to earn each one.
 *
 * Every sticker is a count of something the child has already done, so what
 * they own is always worked out from their own numbers and can only grow. None
 * is ever taken back, none is lost to a missed day, and none is for getting a
 * choice "right" — a sticker is for having a go, again and again, which is
 * what the room is for.
 *
 * The first ones come fast (a choice, three choices, five) so that the very
 * first visit ends with something in the book, and the later ones spread out
 * so there is always one a few choices away.
 */

export type StickerGroup =
  | 'ladder' | 'kind' | 'truth' | 'choices' | 'include' | 'body' | 'help'
  | 'runs' | 'explore' | 'stars' | 'egg';

export type StickerShape = 'circle' | 'squircle' | 'star' | 'heart' | 'shield' | 'flower' | 'cloud' | 'badge';

/** Everything the book counts. `byRoom` is keyed by the room ids behind the six Games Room themes. */
export interface StickerStats {
  points: number;
  practised: number;
  byRoom: Record<string, number>;
  runs: number;
  days: number;
  /** Rare stickers found inside surprise eggs. */
  eggStickers: readonly string[];
}

export interface StickerDef {
  id: string;
  group: StickerGroup;
  name: string;
  glyph: string;
  shape: StickerShape;
  /** Top and bottom of the sticker's colour. */
  colors: [string, string];
  need: number;
  unit: 'choice' | 'star' | 'run' | 'day' | 'theme' | 'egg';
  /** What to do to get it, in words a six-year-old can read. */
  how: string;
  have: (s: StickerStats) => number;
  /** The later ones in a set catch the light. */
  rare?: boolean;
}

export interface StickerGroupInfo { id: StickerGroup; title: string; colors: [string, string] }

export const STICKER_GROUPS: StickerGroupInfo[] = [
  { id: 'ladder', title: 'Good choices', colors: ['#ffd86b', '#f0a12c'] },
  { id: 'kind', title: 'Be Kind', colors: ['#ff9ccf', '#e0559d'] },
  { id: 'truth', title: 'Tell the Truth', colors: ['#8ec8ff', '#4a86e8'] },
  { id: 'choices', title: 'Make Good Choices', colors: ['#8fe3a3', '#36b36a'] },
  { id: 'include', title: 'Include Everyone', colors: ['#c9a6ff', '#8a5bdc'] },
  { id: 'body', title: 'Take Care of My Body', colors: ['#ffb48a', '#f0703a'] },
  { id: 'help', title: 'Help Others', colors: ['#7fe3e0', '#25a9a6'] },
  { id: 'runs', title: 'Runs of five', colors: ['#ff9a8a', '#e0504a'] },
  { id: 'explore', title: 'Explorer', colors: ['#e9f58a', '#a9c424'] },
  { id: 'stars', title: 'Mind Stars', colors: ['#a7a0ff', '#5a4fd6'] },
  { id: 'egg', title: 'Surprise Eggs', colors: ['#fff3b8', '#f2b52c'] },
];

const colorsOf = (group: StickerGroup) => STICKER_GROUPS.find((g) => g.id === group)!.colors;

const SHAPE_CYCLE: StickerShape[] = ['circle', 'flower', 'badge', 'squircle', 'cloud', 'shield'];

const LADDER: Array<[number, string, string]> = [
  [1, '🌱', 'First Try'],
  [3, '🍀', 'Lucky Three'],
  [5, '✋', 'High Five'],
  [8, '🐙', 'Super Eight'],
  [10, '🔟', 'Perfect Ten'],
  [15, '🦁', 'Brave Heart'],
  [20, '🎈', 'Twenty Up'],
  [30, '😄', 'Big Smile'],
  [40, '🏅', 'Choice Champ'],
  [50, '🦄', 'Magic Fifty'],
  [75, '🦉', 'Wise Owl'],
  [100, '💯', 'Hundred Hero'],
];

/** Three stickers per theme: 3, 10 and 25 choices practised in that room. */
const THEMES: Array<{ room: string; group: StickerGroup; title: string; names: [string, string][] }> = [
  { room: 'kind', group: 'kind', title: 'Be Kind', names: [['🤗', 'Kind Friend'], ['💖', 'Kind Heart'], ['🌈', 'Kindness Star']] },
  { room: 'truth', group: 'truth', title: 'Tell the Truth', names: [['🔑', 'Honest Key'], ['🔔', 'Truth Bell'], ['🦅', 'Honest Eagle']] },
  { room: 'choices', group: 'choices', title: 'Make Good Choices', names: [['🧭', 'Good Compass'], ['🚦', 'Green Light'], ['🧠', 'Wise Chooser']] },
  { room: 'include', group: 'include', title: 'Include Everyone', names: [['🤝', 'Open Circle'], ['🎉', 'Everyone Welcome'], ['🌍', 'Friend to All']] },
  { room: 'body', group: 'body', title: 'Take Care of My Body', names: [['💧', 'Water Wizard'], ['🍎', 'Strong Body'], ['💪', 'Body Boss']] },
  { room: 'help', group: 'help', title: 'Help Others', names: [['🤲', 'Helping Hands'], ['🦸', 'Super Helper'], ['🏆', 'Helper Legend']] },
];
const TIERS: Array<{ need: number; shape: StickerShape; rare?: boolean }> = [
  { need: 3, shape: 'circle' },
  { need: 10, shape: 'flower' },
  { need: 25, shape: 'star', rare: true },
];

const RUNS: Array<[number, string, string, StickerShape]> = [
  [1, '🚀', 'Star Run', 'badge'],
  [3, '🎢', 'Triple Run', 'flower'],
  [5, '🏃', 'Running Star', 'shield'],
  [10, '🏁', 'Marathon Mind', 'star'],
];

const STARS: Array<[number, string, string, StickerShape]> = [
  [30, '✨', 'Star Spark', 'circle'],
  [75, '🌠', 'Shooting Star', 'cloud'],
  [180, '💫', 'Shining Star', 'flower'],
  [300, '☄️', 'Star Shower', 'badge'],
  [600, '🌌', 'Galaxy Mind', 'shield'],
  [1000, '👑', 'Star Crown', 'star'],
];

/** Only ever found inside Chirpy's surprise eggs (see delight.ts), never counted towards. */
const EGGS: Array<[string, string, string, StickerShape, [string, string]]> = [
  ['egg-golden', '🥚', 'Golden Egg', 'badge', ['#fff3b8', '#f2b52c']],
  ['egg-rainbow', '🌈', 'Rainbow Shell', 'cloud', ['#ffd1f0', '#8ec8ff']],
  ['egg-moon', '🌙', 'Moon Hatchling', 'circle', ['#d9ccff', '#5a4fd6']],
  ['egg-dragon', '🐉', 'Tiny Dragon', 'shield', ['#b6f5c8', '#2f9c6a']],
  ['egg-crystal', '💎', 'Crystal Egg', 'star', ['#c7f4ff', '#3aa8d8']],
  ['egg-unicorn', '🦄', 'Unicorn Wish', 'heart', ['#ffd6f2', '#c04fd9']],
];

export const EGG_STICKER_IDS: string[] = EGGS.map(([id]) => id);

const plural = (n: number, one: string, many: string) => (n === 1 ? one : many);

export const STICKERS: StickerDef[] = [
  ...LADDER.map(([need, glyph, name], i): StickerDef => ({
    id: `ladder-${need}`, group: 'ladder', name, glyph, need, unit: 'choice',
    shape: SHAPE_CYCLE[i % SHAPE_CYCLE.length], colors: colorsOf('ladder'),
    how: `Make ${need} good ${plural(need, 'choice', 'choices')}.`,
    have: (s) => s.practised,
    rare: need >= 50,
  })),

  ...THEMES.flatMap((theme) => TIERS.map((tier, i): StickerDef => ({
    id: `${theme.room}-${tier.need}`, group: theme.group, name: theme.names[i][1], glyph: theme.names[i][0],
    need: tier.need, unit: 'choice', shape: tier.shape, rare: tier.rare, colors: colorsOf(theme.group),
    how: `Practise ${theme.title} ${tier.need} times.`,
    have: (s) => s.byRoom[theme.room] ?? 0,
  }))),

  ...RUNS.map(([need, glyph, name, shape]): StickerDef => ({
    id: `run-${need}`, group: 'runs', name, glyph, need, shape, unit: 'run', colors: colorsOf('runs'),
    how: `Finish ${need} ${plural(need, 'run', 'runs')} of five choices.`,
    have: (s) => s.runs,
    rare: need >= 10,
  })),

  {
    id: 'explore-themes', group: 'explore', name: 'Room Explorer', glyph: '🗺️', shape: 'squircle',
    colors: colorsOf('explore'), need: 6, unit: 'theme', how: 'Practise all six themes.',
    have: (s) => Object.values(s.byRoom).filter((n) => n > 0).length,
  },
  {
    id: 'explore-back-2', group: 'explore', name: 'Welcome Back', glyph: '👋', shape: 'heart',
    colors: colorsOf('explore'), need: 2, unit: 'day', how: 'Come back on 2 different days.',
    have: (s) => s.days,
  },
  {
    id: 'explore-back-5', group: 'explore', name: 'Regular Explorer', glyph: '🎒', shape: 'shield',
    colors: colorsOf('explore'), need: 5, unit: 'day', how: 'Come back on 5 different days.',
    have: (s) => s.days, rare: true,
  },

  ...STARS.map(([need, glyph, name, shape]): StickerDef => ({
    id: `stars-${need}`, group: 'stars', name, glyph, need, shape, unit: 'star', colors: colorsOf('stars'),
    how: `Collect ${need} Mind Stars.`,
    have: (s) => s.points,
    rare: need >= 300,
  })),

  ...EGGS.map(([id, glyph, name, shape, colors]): StickerDef => ({
    id, group: 'egg', name, glyph, shape, colors, need: 1, unit: 'egg', rare: true,
    how: 'Found inside a surprise egg.',
    have: (s) => (s.eggStickers.includes(id) ? 1 : 0),
  })),
];

export const STICKER_BY_ID: Record<string, StickerDef> =
  Object.fromEntries(STICKERS.map((s) => [s.id, s]));

/** Every sticker these numbers have earned. */
export function earnedStickers(stats: StickerStats): string[] {
  return STICKERS.filter((s) => s.have(stats) >= s.need).map((s) => s.id);
}

export interface NextSticker { sticker: StickerDef; have: number; left: number }

/** A correct choice is worth 11 to 15 stars; 12 keeps the guess from promising too much. */
const LEAST_STARS_PER_CHOICE = 12;
const RUN_LENGTH = 5;

/**
 * About how many choices it takes to earn this one — the only distance a child
 * can do anything about. Stickers that only move when they come back on another
 * day, or by trying a new theme, have no such distance and come back as Infinity.
 */
function choicesAway(sticker: StickerDef, stats: StickerStats): number {
  const left = Math.max(0, sticker.need - sticker.have(stats));
  switch (sticker.unit) {
    case 'choice': return left;
    case 'star': return Math.ceil(left / LEAST_STARS_PER_CHOICE);
    case 'run': return left * RUN_LENGTH - (stats.practised % RUN_LENGTH);
    default: return Infinity;
  }
}

/**
 * The one to point at: whichever unearned sticker is fewest choices away, and
 * the furthest along of those. "1 more choice" is a reason to tap again;
 * "2 more days" cannot be played towards, so those only come up when nothing
 * else is left.
 */
export function nextSticker(stats: StickerStats, earned: readonly string[]): NextSticker | null {
  const open = STICKERS.filter((s) => !earned.includes(s.id));
  const playable = open.filter((s) => Number.isFinite(choicesAway(s, stats)));
  const pool = playable.length ? playable : open;
  let best: NextSticker | null = null;
  let bestAway = Infinity;
  let bestFraction = -1;
  for (const sticker of pool) {
    const have = Math.min(sticker.have(stats), sticker.need);
    const away = choicesAway(sticker, stats);
    const fraction = have / sticker.need;
    if (!best || away < bestAway || (away === bestAway && fraction > bestFraction)) {
      best = { sticker, have, left: sticker.need - have };
      bestAway = away;
      bestFraction = fraction;
    }
  }
  return best;
}

/** "2 more choices", "1 more run", "15 more Mind Stars". */
export function leftLabel(next: NextSticker): string {
  const { left, sticker } = next;
  switch (sticker.unit) {
    case 'choice': return `${left} more ${plural(left, 'choice', 'choices')}`;
    case 'star': return `${left} more Mind ${plural(left, 'Star', 'Stars')}`;
    case 'run': return `${left} more ${plural(left, 'run', 'runs')}`;
    case 'day': return `${left} more ${plural(left, 'day', 'days')}`;
    case 'theme': return `${left} more ${plural(left, 'theme', 'themes')}`;
    case 'egg': return 'One lucky egg';
  }
}
