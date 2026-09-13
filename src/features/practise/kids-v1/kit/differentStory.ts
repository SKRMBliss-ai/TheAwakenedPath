/**
 * WHAT HAPPENED, AND WHAT YOUR MIND ADDED.
 *
 * The material for the Different Story Room. Two teaching moves from the
 * founder's document live in here, and they are deliberately the same six
 * situations seen twice:
 *
 *   §10  The camera test. "Sam took the red car" — click, the camera got
 *        that. "Sam doesn't like me any more" — point the camera at that.
 *        You can't, can you. Both bits are allowed. They're different kinds
 *        of bit.
 *   §11  More than one story fits. The mind picked one in about a tenth of
 *        a second and stopped looking. Find others that fit everything the
 *        camera actually saw — not nicer ones, just ones that also fit.
 *
 * THE SITUATIONS ARE SMALL ON PURPOSE. A corridor, a lunch table, a reply
 * that just says ok. None of them is a crisis, because the room is teaching a
 * move rather than handling an emergency, and a child practises a move on
 * something that doesn't hurt much. The big ones are what the move is FOR,
 * later, on their own, with nobody watching.
 *
 * THE ALTERNATIVES ARE NOT NICER, THEY ARE JUST OTHER. This is the rule that
 * took the most care. "They were rushing" is not a happier ending, it is a
 * different explanation that fits the same facts. If the room hands a child
 * the cheerful version it has told them how to feel, and it has also taught
 * them that the exercise has a right answer, which kills the whole thing. The
 * room lands on *we don't know*, and means it.
 *
 * NOTHING HERE IS EVER WRONG. A child who says the camera saw "they're cross
 * with me" gets asked where they'd point it, not marked incorrect. See the
 * room itself for how that reply is worded.
 */

const KEY = 'mindgym.kidsv1.differentStory';

export interface StoryBit {
  text: string;
  /** True if a camera in the room would have recorded it. */
  camera: boolean;
}

export interface StoryCase {
  id: string;
  /** The situation, as it would look from outside. */
  scene: string;
  /** The things a child might say about it, cameras and additions mixed. */
  bits: StoryBit[];
  /** The one the mind reaches for first. Never labelled as the wrong one. */
  minds: string;
  /** Other accounts that fit every camera fact above just as well. */
  others: string[];
}

export const STORY_CASES: StoryCase[] = [
  {
    id: 'corridor',
    scene: 'You said hi to someone in the corridor. They went straight past.',
    bits: [
      { text: 'They walked past me.', camera: true },
      { text: 'They didn’t say anything back.', camera: true },
      { text: 'They’re cross with me.', camera: false },
      { text: 'They’ve gone off me.', camera: false },
    ],
    minds: 'They’re cross with me.',
    others: [
      'They didn’t see me.',
      'They were late for something.',
      'They were thinking about something else entirely.',
      'They were having a rotten morning.',
    ],
  },
  {
    id: 'whisper',
    scene: 'Two people were talking. You walked over and they stopped.',
    bits: [
      { text: 'They were talking.', camera: true },
      { text: 'They stopped when I got there.', camera: true },
      { text: 'They were talking about me.', camera: false },
      { text: 'They don’t want me there.', camera: false },
    ],
    minds: 'They were talking about me.',
    others: [
      'They’d got to the end of the sentence.',
      'It was a surprise for somebody.',
      'It was private and nothing to do with me.',
      'One of them forgot what they were saying.',
    ],
  },
  {
    id: 'teams',
    scene: 'Teams got picked. Your name came near the end.',
    bits: [
      { text: 'My name came near the end.', camera: true },
      { text: 'I’m on a team.', camera: true },
      { text: 'Nobody wanted me.', camera: false },
      { text: 'I’m rubbish at this.', camera: false },
    ],
    minds: 'Nobody wanted me.',
    others: [
      'They picked their mates first, like everyone does.',
      'They were splitting the quick ones between both sides.',
      'They picked in the order they could see people.',
      'They weren’t really thinking about it at all.',
    ],
  },
  {
    id: 'okreply',
    scene: 'You sent a long message. They wrote back “ok”.',
    bits: [
      { text: 'I sent a long message.', camera: true },
      { text: 'They wrote ok.', camera: true },
      { text: 'They’re annoyed with me.', camera: false },
      { text: 'They think I go on too much.', camera: false },
    ],
    minds: 'They’re annoyed with me.',
    others: [
      'They were on their way out of the door.',
      'They’re not much of a typer.',
      'Somebody was talking to them while they read it.',
      'Their phone was about to die.',
    ],
  },
  {
    id: 'afterclass',
    scene: 'Your teacher said “can I see you after the lesson”.',
    bits: [
      { text: 'She asked to see me after.', camera: true },
      { text: 'She said it in her normal voice.', camera: true },
      { text: 'I’m in trouble.', camera: false },
      { text: 'I’ve done something wrong.', camera: false },
    ],
    minds: 'I’m in trouble.',
    others: [
      'She wants a hand with something.',
      'It’s about the trip.',
      'She’s working through the whole class in turn.',
      'She noticed something and wants to say so.',
    ],
  },
  {
    id: 'lunch',
    scene: 'Your friend sat at a different table at lunch.',
    bits: [
      { text: 'They sat somewhere else.', camera: true },
      { text: 'I sat where I always sit.', camera: true },
      { text: 'They don’t like me any more.', camera: false },
      { text: 'I’ve been swapped for somebody better.', camera: false },
    ],
    minds: 'They don’t like me any more.',
    others: [
      'They got there first and our table was full.',
      'They wanted to talk to somebody about something.',
      'They didn’t see me come in.',
      'They just fancied sitting somewhere else.',
    ],
  },
];

interface Store { seen?: string[] }

function read(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Store) : {};
  } catch { return {}; }
}

/**
 * A situation the child hasn't done yet, or the first one again once they
 * have done all six.
 *
 * NOT ONE A DAY, unlike the hub's teaching moves. A child who walks into this
 * room twice in an evening has chosen to do the exercise twice, and handing
 * them the corridor a second time would teach them the room has one thing in
 * it. The hub is somewhere you land; this is somewhere you went on purpose.
 */
export function nextStoryCase(): StoryCase {
  const seen = read().seen ?? [];
  const unseen = STORY_CASES.filter((c) => !seen.includes(c.id));
  return (unseen.length ? unseen : STORY_CASES)[0];
}

/** They worked one through to the end. */
export function storyCaseDone(id: string): void {
  const seen = read().seen ?? [];
  const next = seen.includes(id) ? seen : [...seen, id];
  try {
    localStorage.setItem(
      KEY,
      /* Six in and it starts again — there is no seventh situation, and a
         room that empties out and says "nothing left" would be worse than
         one that comes round again. The move is worth practising twice. */
      JSON.stringify({ seen: next.length >= STORY_CASES.length ? [] : next }),
    );
  } catch { /* storage off — every visit is the corridor, and that's survivable */ }
}
