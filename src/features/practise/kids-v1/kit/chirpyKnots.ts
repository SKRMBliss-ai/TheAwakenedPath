/**
 * CHIRPY'S OWN KNOTS.
 *
 * Sometimes he is the one who is stuck, and the child is the one who works
 * it out.
 *
 * WHY THIS EXISTS. Everywhere else in this app the child is the patient:
 * asked how they feel, asked where it sits, asked what their mind said. It
 * is the right shape for the skill and the wrong shape for a seven-year-old
 * to live in every single day. Helping is a stronger motivation than being
 * helped — and a child who cannot yet say "I felt left out" about themselves
 * will say it about a small purple monster all afternoon. The distance is
 * the point: it is the same skill, practised where it costs nothing.
 *
 * It also fixes the thing a child would put worst and feel most: that the
 * app only ever talks AT them. Here they are the one who knows something.
 *
 * WHAT HE IS NEVER ALLOWED TO BE. Not sadder than the child, not in danger,
 * not asking to be rescued from anything real. His troubles are small,
 * ordinary and solvable-ish — a spilled thing, a friend who was busy, a turn
 * he did not get. A child who feels responsible for a distressed adult (or
 * a distressed monster standing in for one) is being handed something that
 * is not theirs, which is the exact opposite of what this app is for.
 *
 * And the child is never marked right. Every option they can offer him is
 * one he is glad of; he thanks them for the thinking, not the answer.
 */

export interface ChirpyKnot {
  id: string;
  /** How he opens. Small, ordinary, no crisis. */
  opener: string;
  /** What he says the feeling is, once the child asks. */
  feeling: string;
  /** Where he says it sits — he is learning the same vocabulary. */
  body: string;
  /** The story HIS mind wrote. Always a leap, the way minds make them. */
  story: string;
  /** What actually happened, which he has not connected to the story. */
  eyes: string;
  /** Other stories a child might offer him. None is the right one. */
  maybes: string[];
  /** What he says when the child gives him one. Gratitude, never a mark. */
  thanks: string;
}

export const CHIRPY_KNOTS: ChirpyKnot[] = [
  {
    id: 'wave',
    opener: 'Can I ask you something? I’ve got a funny feeling and I can’t work out what it is.',
    feeling: 'Sad, I think. Or maybe left out. Is left out a feeling?',
    body: 'Right here. In my chest. Like something heavy sat on it.',
    story: 'My friend Bo didn’t wave at me today. I think Bo has gone off me.',
    eyes: 'Bo walked past. Bo was carrying a big stack of books with both arms.',
    maybes: [
      'Maybe Bo didn’t see you',
      'Maybe Bo’s hands were full',
      'Maybe Bo was thinking about something else',
      'Maybe Bo was having a bad day',
    ],
    thanks: 'Oh. OH. I didn’t think of that at all. I just went straight to “gone off me”. How did you SEE that?',
  },
  {
    id: 'last',
    opener: 'I’m in a bit of a mood and I don’t like it. Can you help me sort it out?',
    feeling: 'Cross. Properly cross. And a bit hot.',
    body: 'My whole face. And my hands went tight.',
    story: 'I was last in the line. I’m ALWAYS last. Everyone puts me last on purpose.',
    eyes: 'I got to the line after everybody else did.',
    maybes: [
      'Maybe you just got there last that time',
      'Maybe nobody was thinking about it',
      'Maybe someone would swap if you asked',
      'Maybe last isn’t as bad as it feels',
    ],
    thanks: 'Hmm. I did say ALWAYS, didn’t I. My mind does like the word always. Thank you for noticing that.',
  },
  {
    id: 'quiet',
    opener: 'Something happened and I’ve been chewing on it all day. Would you have a look with me?',
    feeling: 'Worried. The wobbly kind.',
    body: 'My tummy. It keeps doing a little flip.',
    story: 'Nobody talked to me at snack time. I think I did something wrong and nobody will say what.',
    eyes: 'Everyone was eating. It was quite quiet. Then it was over.',
    maybes: [
      'Maybe everyone was just hungry',
      'Maybe it was a quiet day for everybody',
      'Maybe nobody noticed it was quiet',
      'Maybe you could say hello first next time',
    ],
    thanks: 'You know what, I never once thought it might have been quiet for THEM too. You’re good at this.',
  },
];

/**
 * One knot a day, chosen by the date rather than at random.
 *
 * A child who reopens the app should find Chirpy still stuck on the same
 * thing, not a fresh crisis every time they look at him — he would stop
 * being a friend with a problem and become a machine that generates
 * problems, which is a different and much worse character.
 */
export function knotForToday(): ChirpyKnot {
  const day = Math.floor(Date.now() / 86400000);
  return CHIRPY_KNOTS[day % CHIRPY_KNOTS.length];
}
