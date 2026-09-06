/**
 * THE ONE SENTENCE THE OBSERVATORY OWES A SIX-YEAR-OLD.
 *
 * That room's centrepiece is a month grid: seven virtues down, thirty-one
 * days across, a dot in every cell that got ticked. It is a genuinely good
 * object and a child of six cannot read it. Heat maps are an adult's way of
 * seeing a shape in a lot of numbers at once; a young child reads a grid as
 * wallpaper, or worse, as a chart of the gaps.
 *
 * So the grid stays — for the grown-up, and for the child at nine — and
 * underneath it the room now says one thing out loud. One sentence, always
 * true, always about them, and never a ranking of the seven against each
 * other.
 *
 * THE RULES THE SENTENCE OBEYS:
 *
 *   · It is never a target. Nothing here says "two more and you'll have…",
 *     because the moment the room sets a goal, the tick stops describing the
 *     day and starts chasing the sentence.
 *   · It never names a virtue they do LEAST. The same fact stated the other
 *     way round is a report card, and this app does not issue one.
 *   · It only claims a favourite when there genuinely is one. A leader that
 *     is tied, or ahead by a single day, is noise — telling a child that
 *     kindness is "the one they do most" on the strength of one extra
 *     Tuesday is the app making something up about them.
 *   · With almost no history it says something true about having started,
 *     rather than manufacturing a pattern out of four data points.
 */

import { BEHAVIOURS } from '../../../kids/data';

/**
 * How each virtue is named inside a sentence. The behaviour titles are
 * imperatives ("Be Kind", "Tell the Truth") because they're written to sit on
 * a button; dropped into prose they read as instructions being given to the
 * child, which is the one tone this room must not take.
 */
const AS_PHRASE: Record<string, string> = {
  kind: 'Being kind',
  truth: 'Telling the truth',
  choices: 'Making good choices',
  include: 'Including everyone',
  body: 'Looking after your body',
  help: 'Helping people',
  mindheart: 'Quiet thinking time',
};

/** Below this, there is no pattern yet — only a beginning. */
const ENOUGH_FOR_A_PATTERN = 12;

/** A favourite has to be clear of the runner-up by this much to be one. */
const CLEAR_BY = 3;

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function oneTrueLine(completions: Record<string, Record<string, boolean>>): string {
  const days = Object.keys(completions).filter((d) =>
    Object.values(completions[d] ?? {}).some(Boolean),
  );

  if (!days.length) {
    // No cheer, no encouragement, no "let's get started!" — the room simply
    // says what it is and waits. A child who has just arrived is not behind.
    return 'This is where everything you do adds up.';
  }

  const perVirtue = BEHAVIOURS.map((b) => ({
    id: b.id,
    n: days.filter((d) => completions[d]?.[b.id]).length,
  })).sort((a, b) => b.n - a.n);

  const total = perVirtue.reduce((n, v) => n + v.n, 0);

  if (total < ENOUGH_FOR_A_PATTERN) {
    return days.length === 1
      ? 'You started. That’s the bit most people never do.'
      : `You’ve been here on ${days.length} different days now.`;
  }

  const [first, second] = perVirtue;
  if (first && second && first.n - second.n >= CLEAR_BY && AS_PHRASE[first.id]) {
    return `${AS_PHRASE[first.id]} is the one you do most.`;
  }

  // No clear favourite — which is itself worth saying, and is a nicer fact
  // than any of the seven winning would have been.
  const earliest = days.slice().sort()[0];
  const d = new Date(earliest + 'T00:00:00');
  if (!Number.isNaN(d.getTime())) {
    const sameYear = d.getFullYear() === new Date().getFullYear();
    const since = sameYear ? MONTHS[d.getMonth()] : `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
    return `You’ve been coming here since ${since}, and you do a bit of all of them.`;
  }
  return 'You do a bit of all of them.';
}
