/**
 * ROOM GAMES — the new ones, written for these rooms specifically.
 *
 * The 67-game library from Kids Gym v1 still exists and every room draws on
 * it (see `gamesFrom` in rooms.ts). These are the extra ones designed for the
 * virtue rooms themselves, and they exist because a room about kindness wants
 * a game about the actual awkward bits of being kind, not a generic sorting
 * exercise with kindness words in it.
 *
 * Three rules they all follow:
 *
 * 1. NOBODY LOSES. There is no fail state anywhere in here. The worst
 *    outcome available is "hmm, have another look" — a game a child can lose
 *    at teaches them that virtue is a test they might fail, which is exactly
 *    the belief this whole app exists to dismantle.
 *
 * 2. THE ANSWER IS NEVER OBVIOUS. If a child can pick right without
 *    thinking, they learned nothing. Every option here is defensible; the
 *    interesting ones are the near-misses, which is where the reveal does
 *    its work.
 *
 * 3. THE REVEAL TEACHES, NOT THE SCORE. What a child reads after choosing is
 *    the whole lesson. It is written to be interesting rather than
 *    approving — "here's what's going on" beats "well done".
 */

export type RoomGameKind =
  /** Two options that both look fine. Pick one, read what actually happens. */
  | 'fork'
  /** A scene with several things in it; find the one that matters. */
  | 'spot'
  /** Put a jumbled set of moments back in the order they happened. */
  | 'order';

export interface RoomGameOption {
  label: string;
  /** What actually happens next. Never "correct" or "wrong". */
  reveal: string;
  /** The quietly better one, used only to order the reveals. Never shown as a score. */
  warmer?: boolean;
}

export interface RoomGame {
  id: string;
  /** Which virtue room it belongs to (rooms.ts ids). */
  room: string;
  kind: RoomGameKind;
  title: string;
  /** Sets the scene in two lines at most. */
  setup: string;
  options: RoomGameOption[];
  /** The bit worth remembering, shown after any choice. */
  afterword: string;
  points: number;
}

export const ROOM_GAMES: RoomGame[] = [
  /* ── Kindness Garden ─────────────────────────────────────────────── */
  {
    id: 'kind-nobody-saw',
    room: 'kind',
    kind: 'fork',
    title: 'Nobody Saw',
    setup: 'You’re last out of the classroom. Someone’s coat has fallen off the peg and is on the floor. It isn’t yours. Nobody is watching, and nobody will ever know.',
    options: [
      {
        label: 'Pick it up and hang it back',
        reveal: 'You hang it up and leave. Nothing happens. Nobody thanks you, nobody saw, and the person whose coat it is will never know it was on the floor at all. That’s it — that’s the whole thing.',
        warmer: true,
      },
      {
        label: 'Leave it — someone else will',
        reveal: 'You walk past. Someone else probably does pick it up later. Genuinely, probably nothing bad happens at all. But you had the thought, and then you didn’t do it, and you’re the only one who knows that.',
      },
    ],
    afterword: 'The kindness nobody sees is the only kind that tells you anything about yourself. Everything else might just be you being watched.',
    points: 10,
  },
  {
    id: 'kind-wrong-help',
    room: 'kind',
    kind: 'fork',
    title: 'Helping Wrong',
    setup: 'Your friend is struggling with a maths question. You already know the answer. You want to help.',
    options: [
      {
        label: 'Tell them the answer',
        reveal: 'They write it down. They look relieved. Then the next question is the same kind, and they’re stuck again — because they got the answer but not the thing that finds answers.',
      },
      {
        label: 'Ask them what they’ve tried',
        reveal: 'It’s slower and slightly more annoying for both of you. But somewhere in explaining what they tried, they spot the bit they got stuck on, and they get it themselves. Now they can do the next one.',
        warmer: true,
      },
    ],
    afterword: 'Sometimes the kind-feeling thing and the actually-kind thing are different. Giving someone the answer feels generous. It’s just quicker.',
    points: 10,
  },

  /* ── Truth Lab ───────────────────────────────────────────────────── */
  {
    id: 'truth-technically',
    room: 'truth',
    kind: 'fork',
    title: 'Technically True',
    setup: 'You were meant to tidy your room. You shoved everything under the bed. A grown-up asks: “Is your room tidy?”',
    options: [
      {
        label: '“Yes.”',
        reveal: 'Look at the floor — it IS tidy. Every word you said was true. And you both know exactly what you did, which is how you can tell something went wrong even though you didn’t lie.',
      },
      {
        label: '“The floor is. Under the bed isn’t.”',
        reveal: 'Slightly painful. Possibly you now have to actually tidy it. But nothing is sitting in your stomach afterwards, and that turns out to be worth a surprising amount.',
        warmer: true,
      },
    ],
    afterword: 'You can tell the truth with every single word and still not be honest. That’s a real trick, and everybody figures it out eventually — including whoever you used it on.',
    points: 10,
  },

  /* ── Courage Castle ──────────────────────────────────────────────── */
  {
    id: 'courage-everyone-laughing',
    room: 'choices',
    kind: 'fork',
    title: 'Everyone’s Laughing',
    setup: 'Someone in your class says something mean about another kid. It’s a bit funny. Everyone laughs. You feel your face doing a laugh too.',
    options: [
      {
        label: 'Laugh along — it’s easier',
        reveal: 'Nothing happens to you. That’s the honest answer: laughing along is safe, and that’s exactly why it’s the easy one. The kid it was about counted the faces, though. Everybody does.',
      },
      {
        label: 'Don’t laugh. Just don’t.',
        reveal: 'You don’t say anything brave. You don’t make a speech. You just don’t laugh — and it is much harder than it sounds when everyone else is. The kid it was about noticed one face that wasn’t laughing.',
        warmer: true,
      },
    ],
    afterword: 'Brave usually isn’t standing up and announcing something. Mostly it’s a very small thing you don’t do, while everyone around you is doing it.',
    points: 15,
  },

  /* ── Healthy Body Zone ───────────────────────────────────────────── */
  {
    id: 'body-check-first',
    room: 'body',
    kind: 'spot',
    title: 'Check These First',
    setup: 'Everything is annoying today. Your brother is annoying, the homework is annoying, the sock is annoying. Before deciding the day is ruined — what haven’t you checked?',
    options: [
      { label: 'When did I last eat?', reveal: 'Very often this is it. A body running on nothing decides everything is terrible, and it is extremely convincing about it.', warmer: true },
      { label: 'How much did I sleep?', reveal: 'Tired and sad use almost the same signals. A tired brain genuinely cannot tell you which one it is having.', warmer: true },
      { label: 'Have I moved at all today?', reveal: 'A body that hasn’t moved gets restless and reads its own restlessness as something being wrong.', warmer: true },
      { label: 'Is everything actually terrible?', reveal: 'Maybe! Sometimes it really is a bad day and that’s allowed. Worth checking the other three first, though.' },
    ],
    afterword: 'None of this means your feelings aren’t real. It means bodies are loud, and sometimes the thing that fixes an unfixable day is a sandwich and a lie down.',
    points: 10,
  },

  /* ── Friendship Park ─────────────────────────────────────────────── */
  {
    id: 'include-the-third-kid',
    room: 'include',
    kind: 'fork',
    title: 'The Third Kid',
    setup: 'You and your best friend have a game going. It works because there are two of you. Another kid is standing nearby, watching, not saying anything.',
    options: [
      {
        label: 'Carry on — they haven’t asked',
        reveal: 'They wander off after a bit. They were never going to ask; standing nearby watching IS the asking, and it’s what you do when asking out loud feels too risky.',
      },
      {
        label: '“Do you want to play?”',
        reveal: 'It might wreck the game — three doesn’t always work where two did. It might be a bit awkward. But you asked, and being asked is the thing they’ll remember about today.',
        warmer: true,
      },
    ],
    afterword: 'Hovering nearby is what asking looks like when you’re scared of a no. Almost nobody walks up and asks. Almost everybody hovers.',
    points: 15,
  },

  /* ── Helping Hands Village ───────────────────────────────────────── */
  {
    id: 'help-unasked',
    room: 'help',
    kind: 'spot',
    title: 'Nobody Asked',
    setup: 'You walk into the kitchen. Which of these is the one where nobody is going to ask you?',
    options: [
      { label: 'A grown-up says “can you set the table?”', reveal: 'This is being asked. Doing it is good and it still counts — it’s just a different thing.' },
      { label: 'The bin is full and nobody has said anything', reveal: 'Nobody will ask. Someone will just do it eventually, quietly, probably slightly annoyed. That someone could be you.', warmer: true },
      { label: 'Your sibling can’t reach a cup', reveal: 'They might ask, or they might climb. Getting there first is the whole move.', warmer: true },
      { label: 'Homework is on the table, waiting', reveal: 'That one’s yours anyway. Doesn’t count as helping, sorry.' },
    ],
    afterword: 'Being asked and then doing it is fine. Noticing without being asked is a completely different skill, and it’s the one grown-ups quietly keep score of.',
    points: 15,
  },
];

export function roomGamesFor(roomId: string): RoomGame[] {
  return ROOM_GAMES.filter((g) => g.room === roomId);
}

export const ROOM_GAME_COUNT = ROOM_GAMES.length;
