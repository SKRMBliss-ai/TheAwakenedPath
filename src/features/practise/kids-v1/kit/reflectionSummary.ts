import type { SavedReflection } from '../../../kids/store';

/**
 * WHAT THE REFLECTION ROOM KNOWS ABOUT THE CHILD, and the line it will not cross.
 *
 * Everything in here is derived from `savedReflections` on the way out. Nothing
 * is stored twice: a count that lives in the store is a count that goes stale
 * the moment a reflection is edited or removed, and then the room is telling a
 * child something about themselves that is not true any more.
 *
 * THE RULE THAT SHAPES ALL OF IT: describe, never grade. There is no score in
 * this file and there must never be one. "You have been practising noticing
 * worried feelings" is an observation about what the child did. "Your anxiety
 * is improving" is a diagnosis, "3 of 5 stars" is a grade, and "you are an
 * anxious child" is a label that a seven-year-old will carry for years. A
 * feeling that shows up often is a feeling that showed up often; the room says
 * that much and stops.
 *
 * Nothing here ranks one child against another, and nothing here is a streak.
 */

export interface FeelingCount {
  label: string;
  count: number;
}

export interface ThoughtStar {
  label: string;
  count: number;
  reflectionIds: string[];
  /** `old` is a story the mind made; `other` is a possibility the child found.
   *  The constellation draws them differently and says neither is the true one. */
  kind: 'old' | 'other';
}

export interface FavouriteAffirmation {
  text: string;
  playCount: number;
}

export interface ReflectionRoomSummary {
  journeysThisMonth: number;
  reflectionCount: number;
  mostCommonFeelings: FeelingCount[];
  commonThoughts: ThoughtStar[];
  favouriteAffirmations: FavouriteAffirmation[];
  recentReflections: SavedReflection[];
  /** How many saved reflections the child has come back to at least once. */
  revisited: number;
  /** "September", for the month panel's own heading. */
  monthLabel: string;
  /**
   * One gentle sentence about what the child has been practising, or null when
   * there is not enough to say anything honest. Never a diagnosis; see above.
   */
  practiceLine: string | null;
}

/** Same sentence, different punctuation or capitals, is the same thought. */
function normalise(text: string) {
  return text
    .toLowerCase()
    .replace(/[“”"'’.,!?;:]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function titleCase(text: string) {
  const t = text.trim();
  return t ? t[0].toUpperCase() + t.slice(1) : t;
}

/**
 * Groups by a normalised key but reports the spelling the child actually used
 * the most — so a thought they wrote themselves comes back in their own words
 * rather than in a flattened lowercase version of them.
 */
function tally(entries: Array<{ key: string; display: string; id: string }>) {
  const groups = new Map<string, { display: Map<string, number>; ids: string[] }>();
  for (const { key, display, id } of entries) {
    if (!key) continue;
    let group = groups.get(key);
    if (!group) { group = { display: new Map(), ids: [] }; groups.set(key, group); }
    group.display.set(display, (group.display.get(display) ?? 0) + 1);
    if (!group.ids.includes(id)) group.ids.push(id);
  }
  return [...groups.values()].map((group) => {
    let best = '';
    let bestCount = -1;
    for (const [text, n] of group.display) if (n > bestCount) { best = text; bestCount = n; }
    return { label: best, count: group.ids.length, reflectionIds: group.ids };
  });
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

/**
 * A line about what the child has been doing, built only from things that are
 * plainly true of the records. It needs two sightings of the same feeling
 * before it says anything at all — one is an event, not a practice — and it
 * always talks about the noticing rather than about the child.
 */
function buildPracticeLine(feelings: FeelingCount[], reframes: number, total: number): string | null {
  if (total < 2) return null;
  const top = feelings[0];
  if (top && top.count >= 2) {
    return `You have been practising noticing ${top.label.toLowerCase()} feelings.`;
  }
  if (reframes >= 2) {
    return 'You have been practising finding another way to see things.';
  }
  return 'You have been practising stopping to notice what you feel.';
}

export function summariseReflections(all: SavedReflection[], now = new Date()): ReflectionRoomSummary {
  const monthKey = `${now.getFullYear()}-${now.getMonth()}`;
  const inMonth = all.filter((r) => {
    const d = new Date(r.createdAt);
    return !Number.isNaN(d.getTime()) && `${d.getFullYear()}-${d.getMonth()}` === monthKey;
  });

  const mostCommonFeelings = tally(
    all.filter((r) => r.feeling).map((r) => ({
      key: normalise(r.feeling!),
      display: titleCase(r.feeling!.trim()),
      id: r.id,
    })),
  ).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .map(({ label, count }) => ({ label, count }));

  /*
    BOTH HALVES OF THE WALK BECOME STARS, and that is the whole point of the
    constellation. A room that only plotted the thoughts a child's mind handed
    them would be a sky made of worries. The alternatives they found go up
    beside them, so the picture is of a mind that has been doing both.
  */
  const oldThoughts = tally(
    all.map((r) => {
      const text = (r.originalStory ?? r.thought ?? '').trim();
      return { key: normalise(text), display: text, id: r.id };
    }),
  ).map((t): ThoughtStar => ({ ...t, kind: 'old' }));

  const otherThoughts = tally(
    all.map((r) => {
      const text = (r.anotherWay ?? '').trim();
      /* A reframe identical to the story it replaced is not a second thought. */
      const same = normalise(text) === normalise(r.originalStory ?? '');
      return { key: same ? '' : normalise(text), display: text, id: r.id };
    }),
  ).map((t): ThoughtStar => ({ ...t, kind: 'other' }));

  const commonThoughts = [...oldThoughts, ...otherThoughts]
    .filter((t) => t.label.length > 1)
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

  const favouriteAffirmations = tally(
    all.filter((r) => r.affirmation).map((r) => ({
      key: normalise(r.affirmation!),
      display: r.affirmation!.trim(),
      id: r.id,
    })),
  ).map(({ label, reflectionIds }) => ({
    text: label,
    playCount: reflectionIds.reduce(
      (sum, id) => sum + (all.find((r) => r.id === id)?.timesPlayed ?? 0), 0,
    ),
  })).sort((a, b) => b.playCount - a.playCount || a.text.localeCompare(b.text));

  const recentReflections = [...all].sort(
    (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
  );

  return {
    journeysThisMonth: inMonth.length,
    reflectionCount: all.length,
    mostCommonFeelings,
    commonThoughts,
    favouriteAffirmations,
    recentReflections,
    revisited: all.filter((r) => r.timesPlayed > 0).length,
    monthLabel: MONTHS[now.getMonth()],
    practiceLine: buildPracticeLine(
      mostCommonFeelings,
      otherThoughts.filter((t) => t.label).length,
      all.length,
    ),
  };
}

/**
 * WHERE EACH STAR HANGS, and why it is not random.
 *
 * A constellation that redrew itself on every render would be a different sky
 * every time the child opened it, and the one thing a sky is supposed to be is
 * the same sky. So a star's place comes from its own words: the same thought
 * always lands in the same spot, this visit and next month's.
 *
 * They sit on two rings — the mind's stories on the inner one, the other
 * possibilities further out — with a per-star wobble so it reads as a sky
 * rather than as two circles of dots.
 */
export function constellationLayout(stars: ThoughtStar[]) {
  return stars.map((star, i) => {
    let hash = 0;
    for (let c = 0; c < star.label.length; c++) hash = (hash * 31 + star.label.charCodeAt(c)) >>> 0;
    const ring = star.kind === 'old' ? 0.29 : 0.42;
    const angle = ((hash % 360) + i * 47) * (Math.PI / 180);
    const wobble = ((hash >>> 8) % 100) / 100;
    const radius = ring + wobble * 0.08;
    return {
      ...star,
      x: 50 + Math.cos(angle) * radius * 100,
      y: 50 + Math.sin(angle) * radius * 72,
      /* Frequency shows, but barely. A thought that turned up four times is
         not four times as true as one that turned up once, and a star that
         dwarfs its neighbours says it is. */
      scale: 1 + Math.min(star.count - 1, 4) * 0.13,
    };
  });
}
