/**
 * The Sixfold Path — the wider framework holding the two pillars.
 *
 * Lighter than the virtue system on purpose: one flow in focus per week on its
 * own six-week rotation, seven daily insights, one practical invitation. It is
 * a supporting rail, not a second weekly commitment — there is no checkbox and
 * nothing to complete, because asking for three daily completions would make
 * the whole thing feel like a chore rather than a frame.
 */

export interface SixfoldFlow {
  key: string;
  name: string;
  num: number;
  glyph: string;
  essence: string;
  /** Seven distinct daily insights, so something new appears each day. */
  daily: string[];
  invite: string;
}

export const SIXFOLD: SixfoldFlow[] = [
  {
    key: 'vision', name: 'Right Vision', num: 1, glyph: '👁',
    essence: 'Looking beneath external appearances to what is truly happening.',
    daily: [
      "Right Vision begins with admitting how much you assume. Most of what you 'see' today will be memory, not perception.",
      'The surface of an event and its meaning are rarely the same. Ask of one situation: what is actually happening beneath this?',
      'People rarely act from the motive we assign them. Today, consider that the person who irritated you may be afraid rather than hostile.',
      'Right Vision is not optimism. It does not paint things better than they are — it simply refuses to paint them at all.',
      'What you look for, you will find. Notice how your expectation shapes what appears in front of you today.',
      'Clear seeing includes seeing yourself. The hardest thing to look at without distortion is your own behaviour.',
      'By the end of the week: has anything you were certain about turned out to be a story you were telling?',
    ],
    invite: 'Look beneath one appearance today and ask what is truly happening.',
  },
  {
    key: 'intention', name: 'Right Intention', num: 2, glyph: '🧭',
    essence: 'Aligning thoughts, words and actions with clarity and kindness.',
    daily: [
      'Right Intention is a direction, not a destination. You will face away from it many times today; each turning back is the practice.',
      'Before the action comes the motive. Catch one motive today before it becomes a word.',
      'Notice the difference between wanting to be good and wanting to be seen as good. They produce very different actions.',
      'Intention without action is only preference. What would today look like if your intention were visible to others?',
      'Resentment is an intention too. Notice it without judgment — you cannot realign with what you refuse to see.',
      'The vow: may my thoughts, words and actions serve clarity and kindness to all others today. Say it as if you meant it.',
      'Review: where did intention hold today, and where did it quietly slip?',
    ],
    invite: 'Open the day with the vow, and check your motive once before acting.',
  },
  {
    key: 'speech', name: 'Right Speech', num: 3, glyph: '💬',
    essence: 'Asking before speaking: is it true, is it kind, is it necessary?',
    daily: [
      'Three gates before speaking: is it true, is it kind, is it necessary? Most speech fails at least one.',
      'Silence is also speech. Notice what your not-saying communicates today.',
      'The tone carries more than the words. You can say something true in a way that makes it unhearable.',
      'Notice the urge to interrupt — that urge is almost always about you, not about what is being said.',
      'Honesty without kindness is cruelty; kindness without honesty is cowardice. Right Speech needs both.',
      'What you say about someone absent tells more about you than about them.',
      "Review the week's speech: which single sentence would you take back?",
    ],
    invite: 'Pass one sentence today through all three gates before you say it.',
  },
  {
    key: 'action', name: 'Right Action', num: 4, glyph: '🤲',
    essence: 'Choosing what creates harmony rather than division.',
    daily: [
      'Every choice either gathers or divides. Ask of one decision today: which is this doing?',
      'Right Action is usually unremarkable. It looks like the small thing done properly when nobody checks.',
      'Inaction is a choice too. What are you not doing that harmony would require?',
      'The right action is often the inconvenient one. Notice where convenience is making your decisions.',
      'Doing good loudly and doing good quietly are different practices. Try the quiet one today.',
      'Harmony is not agreement. You can act rightly in a disagreement.',
      'Review: which action this week created harmony you can actually point to?',
    ],
    invite: 'Ask of one choice today: does this create harmony or division?',
  },
  {
    key: 'presence', name: 'Right Presence', num: 5, glyph: '🪷',
    essence: 'Letting an ordinary task become the meditation.',
    daily: [
      'The meditation does not end when you stand up. Let one ordinary task today be done with full attention.',
      'Presence is not intensity. It is simply not being somewhere else.',
      'Washing up, walking, waiting — these are not interruptions to practice. They are where practice lives.',
      'Notice how often you rush through the present to reach a future that arrives as another present you also rush through.',
      'You cannot be present and be performing at the same time. Notice which one you are doing.',
      'Presence includes the body. Where are your shoulders right now?',
      'Review: which ordinary moment this week became unexpectedly whole?',
    ],
    invite: 'Let one ordinary task today become the meditation.',
  },
  {
    key: 'devotion', name: 'Right Devotion', num: 6, glyph: '🙏',
    essence: 'A moment of gratitude; bowing inwardly.',
    daily: [
      'Devotion begins with one honest moment of gratitude. Not a list — one thing, actually felt.',
      'Bowing inwardly costs nothing and changes the posture of the whole day.',
      'Devotion is not belief. It is the willingness to be small before something larger.',
      'Offer one ordinary action today — an email, a meal, a chore. Nothing needs to change but the dedication.',
      'Gratitude for what is difficult is the advanced practice. Try it once, gently.',
      'Devotion completes the other five. Vision, intention, speech, action and presence all soften when offered rather than achieved.',
      'Review: where did the week feel like an offering rather than a task?',
    ],
    invite: 'Offer one ordinary action today, as a gift rather than a task.',
  },
];

export const SIXFOLD_BY_KEY: Record<string, SixfoldFlow> = Object.fromEntries(
  SIXFOLD.map((s) => [s.key, s]),
);

/** ISO-week rotation, like the virtues — global, so everyone shares the frame.
 *  Six flows against nine virtues means the pairing shifts each cycle, which
 *  keeps the combination fresh rather than locking one flow to one virtue. */
export function sixfoldOfWeek(isoWeekNum: number): SixfoldFlow {
  return SIXFOLD[isoWeekNum % SIXFOLD.length];
}

/** Which of the seven daily insights to show (0–6). */
export function sixfoldDayIndex(date: Date = new Date()): number {
  return (date.getDay() + 6) % 7;
}
