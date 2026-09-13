/**
 * GUESS WHAT YOU DID TODAY. NO — MY GO. GUESS WHAT *I* DID.
 *
 * Everything else Chirpy does is one-way. He says a clue and the child reads
 * it; he half-remembers a case and the child corrects one word of it; he asks
 * for help and the child picks a reply. All of that is him talking and the
 * child responding. None of it is PLAY, because play needs both people to
 * take a turn and needs one of them, at least occasionally, to be wrong.
 *
 * So: he guesses about their day, they answer, and then he hands the turn
 * over and they guess about his. That second half is the whole reason this
 * exists — a friend who only ever asks about you is conducting an interview.
 *
 * ────────────────────────────────────────────────────────────────────────
 * THE RULE THIS IS BUILT AROUND, AND IT IS THE ONLY ONE THAT MATTERS:
 *
 *   NOTHING IN HERE EVER WRITES A TICK.
 *
 * The first version of this idea was obvious and wrong: Chirpy looks at the
 * pattern, guesses "I think you helped somebody today", and if the child says
 * yes, the tick goes in. It would have taken twenty minutes to build and it
 * would have quietly wrecked the app.
 *
 * A six-year-old asked a leading question by a friend they like says yes.
 * Not to cheat — to agree, because agreeing is nice and because Chirpy
 * obviously wants it to be true. The entire app rests on one mechanic: the
 * child reports their own day and the report means something. The moment a
 * character starts suggesting the answers, every number downstream of the
 * tick is a record of how agreeable the child was feeling, and the case
 * shelf, the jar, the seasons and the Observatory's one true sentence are all
 * quietly describing somebody who doesn't exist.
 *
 * So this beat records nothing, unlocks nothing, scores nothing, and leads
 * nowhere. It is a conversation. The ticks still happen where they always
 * happened: in the room, by the child's own hand, with nobody's thumb on the
 * scale.
 * ────────────────────────────────────────────────────────────────────────
 *
 * WHY HE IS WRONG ON PURPOSE. The first two guesses are absurd, and they are
 * meant to be. Being confidently wrong and then corrected by a child is the
 * oldest move in children's television, and it works because it inverts the
 * usual arrangement: for once the small person is the one who knows. A child
 * correcting Chirpy volunteers the truth for the pleasure of putting him
 * right, which is the opposite of a leading question — the content comes from
 * them, unprompted, and no button offered it to them.
 *
 * WHY "YES" TO THE BEAR IS BELIEVED. A child who says they did fight a bear
 * is playing, and Chirpy believing them absolutely is the best thing in this
 * whole feature. An app that says "no you didn't" to that is a spoilsport
 * with a database. He takes it completely at face value, every time.
 *
 * WHY THE LAST GUESS IS ABOUT WHO THEY ARE, not what they did. It is the one
 * drawn from real data — the room they have actually put the most into — and
 * it is deliberately phrased as a character observation rather than a
 * question about today, because a question about today is a tick in
 * disguise. "I think you're one of the kind ones" cannot be answered by
 * pressing a button that fills in a grid. It is just somebody who has been
 * paying attention, saying so.
 *
 * AND HE NEVER PRODUCES THE RECEIPT. A child who answers "not really" is
 * taken at their word, and the app does not reply "but you ticked kind nine
 * times this month" — same rule as kit/chirpyMemory, for the same reason.
 * They are allowed to not feel like the person the data says they are. Being
 * argued with by software about your own character is a horrible experience
 * at any age and a formative one at six.
 */

const KEY = 'mindgym.kidsv1.guessingGame';

/**
 * Days between games. Shorter than anything else Chirpy does, because this
 * is the light one — it costs the child nothing, asks nothing, and remembers
 * nothing, so it can afford to come round often. It is also last in the hub's
 * order (see kit/hubMoment), which means in practice it is what Chirpy does
 * on the ordinary evenings when none of the rarer things are due. That is the
 * right default: most evenings with a friend are not significant.
 */
const REST_DAYS = 2;

export interface Guess {
  /** What he says. */
  line: string;
  /** How he takes it when they say no. Never sulks, never insists. */
  onNo: string;
  /** How he takes it when they say yes. Believes them, completely. */
  onYes: string;
  /**
   * The real one — the observation about who they are, drawn from the room
   * they've actually put the most into.
   *
   * Flagged rather than inferred from its position, because "it's the third
   * one, unless there are only two" is exactly the kind of rule that survives
   * until somebody adds a fourth silly guess and then quietly shows a
   * six-year-old a yes/no button under a sentence about their character.
   */
  self?: boolean;
}

/** The three answers to the last guess. None of them is the right one. */
export const SELF_REPLIES = ['That’s me', 'Sometimes', 'Not really'] as const;
export type SelfReply = (typeof SELF_REPLIES)[number];

export interface HisDay {
  /** Three things he might have done today. Exactly one is true. */
  options: string[];
  /** Which one. */
  truth: string;
  /** What he says when they get it. */
  onRight: string;
  /** What he says when they don't. Never "wrong" — he just tells them. */
  onWrong: string;
  /** The whole of it, told either way. The guess was only the doorway. */
  story: string;
}

export interface GuessingGame {
  /** His goes, in order: two silly, then — if he knows them — one real. */
  guesses: Guess[];
  /** The line where he hands the turn over. */
  handover: string;
  /** And his day, for them to guess at. */
  his: HisDay;
}

/* ── His first go. Enormous, confident, wrong. ────────────────────────── */

const WILD: Guess[] = [
  {
    line: 'Right. My go. I’m going to guess your whole day. I think… you fought a bear.',
    onNo: 'No? Are you sure? You’ve got a bit of a bear-fighting look about you today.',
    onYes: 'I KNEW it. I could tell the moment you walked in.',
  },
  {
    line: 'Let me guess your day. I think… you ate an entire cake. The whole thing. On your own.',
    onNo: 'Really? Not even a slice? I was so sure about the cake.',
    onYes: 'The whole cake. Good. Somebody had to.',
  },
  {
    line: 'My turn to guess. I think… you went to the moon. Quickly. Before tea.',
    onNo: 'Hm. I had you down as a moon person. I’ll have another think.',
    onYes: 'Before TEA? That’s the impressive bit. Anyone can go on a weekend.',
  },
  {
    line: 'Guessing your day now. I reckon… you learned to fly and you haven’t told anybody.',
    onNo: 'Fine, fine. It was a long shot. Most things are, with me.',
    onYes: 'I won’t tell a soul. Not one. I’m extremely good at this.',
  },
  {
    line: 'Here we go. I think… you were secretly a lion for about an hour.',
    onNo: 'Not even a small lion? Alright. I’ll lower my sights.',
    onYes: 'An hour’s a good stretch of lion. I can usually manage four minutes.',
  },
  {
    line: 'Let me have a go at your day. I think… you got a proper job. With a hat and everything.',
    onNo: 'No job. Noted. You’re still very employable, for what it’s worth.',
    onYes: 'With the HAT? Then it’s a serious job. Congratulations.',
  },
  {
    line: 'Right then. I think… you had an argument with the sea and won.',
    onNo: 'Didn’t think so, actually. The sea usually wins. Let me try again.',
    onYes: 'Beat the sea. On a Tuesday. That’s going straight in my list.',
  },
];

/* ── His second go. Smaller, closer, still wrong. ─────────────────────── */

const NEARER: Guess[] = [
  {
    line: 'Second go, then. You found some money. In the garden. Quite a lot of it.',
    onNo: 'Worth checking the garden though. I check mine.',
    onYes: 'In the GARDEN. That’s the best place to find it. Nobody expects it there.',
  },
  {
    line: 'Alright, second go. Somebody let you stay up late, and you didn’t even have to ask.',
    onNo: 'Ah well. It was a nice thought. You deserved it either way.',
    onYes: 'Without asking! That’s the good kind. The asked-for kind is never as good.',
  },
  {
    line: 'Right, try two. I think you had chips. I’m fairly confident about the chips.',
    onNo: 'No chips? I’m never confident about anything again.',
    onYes: 'Chips. Knew it. That’s the one thing I ever get right.',
  },
  {
    line: 'Next guess. You laughed so much that you couldn’t breathe properly for a bit.',
    onNo: 'Hm. Well, there’s still some of today left.',
    onYes: 'The not-breathing kind. Those are the best ones. Awful at the time.',
  },
  {
    line: 'Second go. Somebody said something that annoyed you, and you didn’t say anything back.',
    onNo: 'Good. Some days nobody’s annoying, and that’s a nice sort of day.',
    onYes: 'That takes more than people think. I’d have said something. I always do.',
  },
  {
    line: 'Alright — you got told off for something you did actually do.',
    onNo: 'Fair enough. Not every day has a telling-off in it.',
    onYes: 'Those are the hard ones, aren’t they. Can’t even be cross about it properly.',
  },
];

/* ── His third go: the real one. ──────────────────────────────────────── *
 *
 * Keyed by behaviour id — the same ids as My Best Every Day, which are the
 * same ids as the rooms. Deliberately written in the kit rather than pulled
 * from best/rooms, so this module stays a plain data-and-storage file with no
 * dependency on the room list or on anything that imports React.
 *
 * Every one of them is in the present tense and about the person, not the
 * afternoon. That is the whole difference between an observation and a tick.
 */
const SELF: Record<string, string> = {
  kind: 'Last go, and I’m being serious now. I think… you’re one of the kind ones. Not all the time — nobody is. But when it counts, you go kind.',
  truth: 'Last go, and this one’s serious. I think… you’d rather tell the truth than get away with it. Even when getting away with it was right there.',
  choices: 'Last go, and I mean this one. I think… you’re braver than you think you are. I’ve been keeping an eye.',
  include: 'Last go, properly this time. I think… you notice when somebody’s on their own. Usually before anybody else does.',
  body: 'Last go, and I’m serious. I think… you look after yourself better than most grown-ups manage.',
  help: 'Last go, and no jokes. I think… you help without being asked. That’s the rare one, you know. Most people wait.',
  mindheart: 'Last go, and this one I’ve thought about. I think… you’re a noticer. You watch what’s going on inside your own head.',
};

/**
 * How he takes each answer to it. Warm, brief, and — crucially — never an
 * argument. "Not really" is accepted whole. See the note at the top about the
 * receipt he is holding and will never produce.
 */
const SELF_TAKES: Record<SelfReply, string> = {
  'That’s me': 'Ha! I got one. I got one right. I’m having a very good evening.',
  'Sometimes': 'Sometimes is how everybody is. I’ll take sometimes.',
  'Not really': 'Fair enough. I’ll keep watching, then. I’m not very good at this bit.',
};

export function takeOnSelfReply(reply: string): string {
  return SELF_TAKES[reply as SelfReply] ?? 'Right. I’ll keep that in mind.';
}

/* ── And his day, for them to guess at. ───────────────────────────────── *
 *
 * All small. None of them is an adventure, and none of them is sad. He is a
 * bird who lives in a gym and has a lot of time; what he does with it should
 * be the sort of thing a child recognises from their own quiet afternoons.
 * One of them quietly touches the thing he is worried about (see
 * kit/chirpyArc) without ever naming it.
 */
const HIS_DAYS: HisDay[] = [
  {
    options: ['Counted cars from the roof', 'Had a long nap', 'Ate a worm'],
    truth: 'Counted cars from the roof',
    onRight: 'How did you— you actually got that. Nobody gets that.',
    onWrong: 'Nope. Better than that.',
    story: 'I sat on the roof and counted the cars. I got to sixty and then one went past twice and I had to start the whole thing again.',
  },
  {
    options: ['Learned to whistle', 'Built something', 'Hid from a bee'],
    truth: 'Hid from a bee',
    onRight: 'You got it. That’s embarrassing, actually, that you got it that fast.',
    onWrong: 'Not quite. It’s worse than that.',
    story: 'I hid from a bee. Behind a watering can. For a while. It wasn’t even looking at me — it was just going past.',
  },
  {
    options: ['Watched a cloud', 'Went swimming', 'Wrote a letter'],
    truth: 'Watched a cloud',
    onRight: 'Right first time. You know me far too well.',
    onWrong: 'No. Much duller than that.',
    story: 'I watched the same cloud all afternoon. And then I looked away for one second and it had turned into a different cloud, and I missed it. I was quite annoyed.',
  },
  {
    options: ['Moved a stone', 'Sang a song', 'Made a friend'],
    truth: 'Moved a stone',
    onRight: 'Yes! Why would you guess that? That’s exactly what I did.',
    onWrong: 'Nope. Even less than that.',
    story: 'I moved a small stone about four feet, from one side of the path to the other. I can’t tell you why. It seemed to want to be over there.',
  },
  {
    options: ['Practised something', 'Cleaned up', 'Read a book'],
    truth: 'Practised something',
    onRight: 'You got it. Bit close to the bone, that one, but you got it.',
    onWrong: 'Not that. I was practising.',
    story: 'I practised saying something nice, in case anybody needed one today. And then nobody did. So I said it to a wall. The wall took it quite well.',
  },
  {
    options: ['Tried to whistle', 'Flew somewhere new', 'Had a think'],
    truth: 'Tried to whistle',
    onRight: 'Correct. Two hours. Still can’t do it.',
    onWrong: 'No — whistling. I was trying to whistle.',
    story: 'I tried to whistle for about two hours. I still can’t whistle. I’m a bird, as well, which I feel makes it worse.',
  },
];

/** The line where he stops asking and hands it over. Varies a little. */
const HANDOVERS = [
  'Right — your go. I did something today as well. Guess what it was.',
  'Your turn. I had a whole day too, you know. Have a guess.',
  'Now you do me. Go on. What do you think I got up to?',
];

/* ── Storage ──────────────────────────────────────────────────────────── */

interface Played {
  /** ISO day he last brought this up — whether or not it was played out. */
  last?: string;
  /** How many he has actually finished. Drives which game comes next. */
  plays?: number;
}

function read(): Played {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Played) : {};
  } catch { return {}; }
}

function write(p: Played): void {
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* storage off — he just asks again */ }
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
 * The room the child has genuinely put the most into, or null if there isn't
 * one yet.
 *
 * NULL IS A PROPER ANSWER HERE, not a fallback to be papered over. A "real"
 * guess about a child the app knows nothing about is not a guess, it's a line
 * — and a brand-new child being told on day one that they're "one of the kind
 * ones" by something that has never seen them do anything is exactly the
 * hollow flattery this whole app is built to avoid. On those evenings he
 * plays the two silly rounds and hands over, which is a perfectly good game.
 */
function bestKnownRoom(pointsByBehaviour: Record<string, number>): string | null {
  let best: string | null = null;
  let most = 0;
  for (const id of Object.keys(SELF)) {
    const n = pointsByBehaviour[id] ?? 0;
    if (n > most) { most = n; best = id; }
  }
  return best;
}

/**
 * Tonight's game, or null.
 *
 * READ-ONLY, like every other hub candidate — see kit/awayFor for the bug
 * that made that rule. Nothing is spent by asking.
 *
 * Deterministic within a day: the choice is driven by how many games have
 * been FINISHED, which cannot change while one is on screen, so the hub can
 * mount and unmount all evening without the bear turning into a lion.
 */
export function guessingGameForToday(
  pointsByBehaviour: Record<string, number>,
): GuessingGame | null {
  const p = read();
  const t = today();
  if (p.last && daysBetween(p.last, t) < REST_DAYS) return null;

  const n = p.plays ?? 0;

  // Different-length pools, stepped at different offsets, so the three parts
  // don't march in lock-step — the same opening never pairs with the same
  // handover twice in a row, and the whole combination takes months to come
  // back round.
  const guesses: Guess[] = [
    WILD[n % WILD.length],
    NEARER[(n + 1) % NEARER.length],
  ];

  const known = bestKnownRoom(pointsByBehaviour);
  if (known) {
    guesses.push({
      self: true,
      line: SELF[known],
      // The two takes are unused for the last guess — it has its own three
      // answers (SELF_REPLIES) and its own takes. Filled with the honest
      // thing he'd say rather than left empty, so a caller that treats all
      // three guesses uniformly still gets sensible words.
      onNo: SELF_TAKES['Not really'],
      onYes: SELF_TAKES['That’s me'],
    });
  }

  const his = HIS_DAYS[n % HIS_DAYS.length];

  return {
    guesses,
    handover: HANDOVERS[n % HANDOVERS.length],
    // Rotate the options so the true one isn't always sitting in the same
    // slot — a child who works out that it's always the first button has
    // stopped playing the game and started playing the interface.
    his: { ...his, options: rotate(his.options, n % his.options.length) },
  };
}

function rotate<T>(xs: T[], by: number): T[] {
  return [...xs.slice(by), ...xs.slice(0, by)];
}

/**
 * They played it through. He waits a couple of days and brings a new one.
 */
export function gamePlayed(): void {
  const p = read();
  write({ last: today(), plays: (p.plays ?? 0) + 1 });
}

/**
 * They waved it away.
 *
 * THIS SPENDS THE EVENING BUT NOT THE GAME, and the difference is the point.
 * `last` is stamped, so he doesn't ask again tonight or tomorrow — a friend
 * who takes "not now" as a cue to try again in ten minutes is not taking it
 * at all. But `plays` is untouched, so the game they didn't see is still
 * waiting for them when he next comes round, rather than being silently
 * burned by a child who wasn't in the mood.
 */
export function notNow(): void {
  const p = read();
  write({ ...p, last: today() });
}
