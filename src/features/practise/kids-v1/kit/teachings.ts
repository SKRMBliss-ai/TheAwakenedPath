/**
 * THE TEACHING MOVES.
 *
 * Eighteen of them, lifted from the founder's own teaching-moves document —
 * it is in the repo twice, as docs/source-material/kidstech.md and as
 * …/kit/reference/MIND_GYM_TEACHING_MOVES.md, and the two are the same
 * eighteen sections. That document is the reason this file reads the way it
 * does. Its rule: never explain an inner experience to a child, build a
 * moment where they catch it happening. So almost nothing in here is a
 * statement. Most of it is an instruction that fails on purpose.
 *
 * WHY THIS EXISTS AT ALL. The hub had one thing to say on an ordinary evening
 * and it said it every single time the screen mounted — the same clue, all
 * night, because the clue was only recorded when a child pressed Okay and
 * children do not press Okay. A line written to be quietly unsettling turned
 * into the app's catchphrase. That bug is fixed in ChirpyArc; this is the
 * other half of it, which is that one line was never enough material for a
 * screen a child lands on several times a day.
 *
 * THE THREE SHAPES, from the document:
 *
 *   trapdoor    An instruction that cannot be followed. Try not to laugh.
 *               Don't think about a purple elephant. The failure is the
 *               lesson, and children love being caught out by something true.
 *   experiment  Something the child does that proves the point by what
 *               happens. They are the evidence, so there is nothing to take
 *               on trust.
 *   image       A thing already in their life that has the right shape. No
 *               new understanding needed — just recognition.
 *
 * WHAT IS DELIBERATELY MISSING: the moral. Every one of these stops before
 * "and that shows us that…", because the instant you add it you have turned a
 * discovery into a lesson and lost them. Several of these lines will read as
 * unfinished to an adult. They are meant to.
 *
 * NONE OF IT RUNS WHEN A CHILD IS STRUGGLING. hubMoment returns before it
 * reaches this in the quiet state, which is the document's §18: teaching needs
 * a settled child, and an upset one needs company rather than curriculum.
 */

const KEY = 'mindgym.kidsv1.teachings';

import { band, type Band } from './band';

export type TeachingKind = 'trapdoor' | 'experiment' | 'image';

export interface Teaching {
  id: string;
  kind: TeachingKind;
  /**
   * Which band the document wrote this one for. Absent means it says "both
   * bands", or says nothing, and it goes to everybody.
   *
   * This is not a suggestion. §16 needs several years of remembering other
   * people's lives to work at all, and §7's blue cup is addressed to somebody
   * who has recently stopped being a toddler — handed to the wrong child,
   * each of them simply fails. See kit/band.
   */
  band?: Band;
  /** How he opens it. One or two lines, his own voice. */
  open: string[];
  /**
   * The thing to actually do, held on screen while they do it. Absent on a
   * borrowed image, which asks for nothing and is just a thing he says.
   */
  dare?: string;
  /** What the button says before they start. */
  go?: string;
  /** Seconds of quiet while it happens. */
  hold?: number;
  /**
   * A trapdoor that needs the child's own answer before it opens.
   *
   * Only one move works this way and it is the one the document rates
   * highest: a child is asked what they'd say to a friend who called
   * themselves stupid, gives their kindest answer, and is then told the
   * thought was theirs. It only lands because the answer was given BEFORE
   * they knew who it was about — which is also why the replies here are all
   * warm. There is no unkind option to pick, because the point is not what
   * the child chooses, it is that they are already kind and have never once
   * aimed it at themselves.
   */
  pick?: { ask: string; replies: string[] };
  /** The payoff, a line at a time. */
  land: string[];
}

/**
 * The library.
 *
 * ORDER IS NOT IMPORTANCE — it's roughly the document's order, and the
 * rotation below ignores it anyway. What order does control is which move a
 * child meets first, and that is deliberately `notlaugh`: it is the funniest,
 * the fastest, and the one absolutely nobody fails to feel.
 */
export const TEACHINGS: Teaching[] = [
  {
    id: 'notlaugh',
    kind: 'trapdoor',
    open: ['Quick. Try not to laugh.', 'No smiling either. Off you go.'],
    dare: 'Absolutely no laughing.',
    go: 'I’m ready',
    hold: 7,
    land: [
      'How did that go?',
      'Funny thing about feelings. The harder you hold one down, the harder it pushes back up.',
      'Same as trying not to laugh in assembly. Same as trying not to cry when someone asks if you’re alright.',
    ],
  },
  {
    id: 'quiethead',
    kind: 'trapdoor',
    open: ['Go quiet inside your head.', 'Completely quiet. No thoughts at all. Ten seconds.'],
    dare: 'Nothing. Not one thought.',
    go: 'Starting now',
    hold: 10,
    land: [
      'So. Did it stay quiet?',
      'Something started talking, didn’t it. Probably about how this was a weird thing to ask you to do.',
      'That’s the thing we’re looking for. It never stops. It’s talking right now, about this.',
    ],
  },
  {
    id: 'elephant',
    band: 'older',
    kind: 'trapdoor',
    open: ['For the next ten seconds, do not think about a purple elephant.', 'Whatever you do. No purple elephant.'],
    dare: 'No purple elephant.',
    go: 'Fine',
    hold: 10,
    land: [
      'Yeah.',
      'Telling yourself not to think about something is a really good way to think about it.',
    ],
  },
  {
    id: 'hopping',
    kind: 'experiment',
    open: ['Right now, think about hopping.', 'Really picture it. Hopping on one leg.'],
    dare: 'Picture the hopping.',
    go: 'Thinking about it',
    hold: 5,
    land: [
      '…Are you hopping?',
      'No. Thinking and doing are two different machines.',
      'Your brain can say anything it likes. Your legs are yours.',
    ],
  },
  {
    id: 'itch',
    kind: 'experiment',
    open: ['Find an itch. Anywhere — your arm, your nose, your ankle.', 'Now don’t scratch it. Just watch it.'],
    dare: 'Don’t fight it. Don’t scratch it. Watch what it does.',
    go: 'Found one',
    hold: 15,
    land: [
      'It got worse. Then it got weird. Then it went, without you doing anything.',
      'Wanting to shout does that. So does wanting to hit something, or run away, or say the mean thing.',
      'It gets huge, and then it goes, all by itself, if you can stay there while it does.',
    ],
  },
  {
    id: 'twoofyou',
    kind: 'experiment',
    open: ['Say this out loud: “I am cross.”', 'Now say this one: “I notice I am cross.”'],
    dare: 'Say them again. Both of them.',
    go: 'Said it',
    hold: 6,
    land: [
      'Feel the difference?',
      'In the second one there are two of you. The cross one — and the one who noticed.',
    ],
  },
  {
    id: 'jump',
    band: 'young',
    kind: 'experiment',
    open: ['Jump up and down. Ten times.', 'Go on, properly.'],
    dare: 'Ten jumps. I’ll wait.',
    go: 'Jumping',
    hold: 12,
    land: [
      'Now stop. Stand still. What’s your heart doing?',
      'You can feel it, can’t you. You just found something happening inside you.',
      'That’s the game. Feelings do that too — they show up somewhere in there.',
    ],
  },
  {
    id: 'spotlight',
    band: 'older',
    kind: 'trapdoor',
    open: [
      'Think of something embarrassing you did. Not the worst one. A medium one.',
      'Got it? Now think of something embarrassing somebody else did, in front of you, this year.',
    ],
    dare: 'Anyone. Any embarrassing thing. This year.',
    go: 'Looking',
    hold: 10,
    land: [
      'Struggling?',
      'Everyone is. Everyone remembers their own and almost none of anyone else’s.',
      'Which means the thing you’re still cringing about — they’ve forgotten it. They were busy cringing about theirs.',
    ],
  },
  {
    id: 'bestfriend',
    band: 'older',
    kind: 'trapdoor',
    open: [
      'Your best mate comes to you and says: “I’m so stupid. I ruined everything. Everyone thinks I’m pathetic.”',
    ],
    pick: {
      ask: 'What do you say to them?',
      replies: [
        'You’re not stupid. You had a bad day.',
        'That’s not true, and I’d know.',
        'Everyone messes things up. It’s not the end.',
        'I’m still here. That hasn’t changed.',
      ],
    },
    land: [
      'Nice. Really nice, actually.',
      'Now — that thought was yours. You said it about yourself, earlier.',
      'So why is what you just said good enough for them and not for you?',
    ],
  },
  {
    /*
      §7 · FEELINGS PASS, for 9–14. The blue cup below is the same section's
      move for 3–8, and this is the one the document wrote for everybody
      older — it had never been built, so half of §7 was missing.

      IT IS A TRAPDOOR, which is easy to miss reading it. The child is asked a
      question they cannot answer, and the failure to answer IS the finding:
      three weeks ago something was the whole world and it is now completely
      gone, and they have just proved that to themselves rather than been told.

      THE SAFETY NOTE FROM THAT SECTION APPLIES AND IS ENFORCED ELSEWHERE:
      "never deployed while a child is in the middle of something. 'This will
      pass' said too early is dismissal." No teaching move runs in the quiet
      state at all — see hubMoment — which is what keeps this one honest.
    */
    id: 'tuesdays',
    band: 'older',
    kind: 'trapdoor',
    open: [
      'Right — what were you upset about three Tuesdays ago?',
      'Not a big one necessarily. Any one. Three Tuesdays.',
    ],
    dare: 'Three Tuesdays ago. Have a proper go.',
    go: 'Thinking',
    hold: 10,
    land: [
      'No. Me neither.',
      'At the time it was the whole world. Now you can’t even find it.',
      'I’m not saying it didn’t matter. It did. It’s just not where it was.',
    ],
  },
  {
    /*
      §9 · TWO FEELINGS AT ONCE, for 3–8. The holiday below is the 9–14 move
      for the same section; this one had never been built.

      THE WOBBLY TOOTH IS DOING A DIFFERENT JOB HERE than it does in §5, which
      is why the same object appears twice in this library and why that is not
      a duplication to tidy up. In §5 it is a thing your tongue keeps going
      back to — a sticky thought. Here it is a thing you want gone and want to
      keep at the same instant, which is the cleanest example of genuinely
      mixed feeling a small child has actually lived through.
    */
    id: 'wobblyboth',
    band: 'young',
    kind: 'image',
    open: ['A wobbly tooth again. But a different bit of it this time.'],
    land: [
      'You want it out. And you don’t want it out.',
      'At the exact same time. Both of those are true and neither one is winning.',
      'Feelings do that. They come in pairs sometimes.',
    ],
  },
  {
    /*
      §8 · YOUR MIND WRITES TO PROTECT YOU, for 9–14. The smoke alarm below is
      the same section for 3–8.

      THE DOCUMENT SAYS THIS SECTION "MATTERS MORE THAN ANY OTHER MOVE HERE",
      and the reason is worth restating: it is the screen where a child
      decides whether to keep being honest with the app. If the fear story
      ever lands as "you thought the wrong thing", they start giving safe
      answers and the whole path becomes theatre. So nothing in here is a
      correction. The mind is not wrong, it is not negative, and it is not
      broken — it went for the worst version on purpose, because the worst
      version is the one that would hurt if it arrived unannounced.
    */
    id: 'dangerjob',
    band: 'older',
    kind: 'image',
    open: [
      'That story your mind wrote earlier — the bad one.',
      'It came from the part of you whose entire job is spotting trouble early.',
    ],
    land: [
      'It went for the worst version. It always does.',
      'Not because it’s miserable. Because the worst version is the one that would really hurt if it turned up and you hadn’t thought about it.',
      'That’s not you being negative. That’s a smoke alarm doing exactly what it’s for.',
    ],
  },
  {
    id: 'guarddog',
    kind: 'image',
    open: ['Your brain has a guard dog.', 'Its whole job is to bark if something’s coming.'],
    land: [
      'Sometimes it’s right. Mostly it’s the postman.',
      'You wouldn’t get rid of the dog. It’s trying to look after you.',
      'You just learn to check. Postman, or actually something?',
    ],
  },
  {
    id: 'smokealarm',
    band: 'young',
    kind: 'image',
    open: ['Have you ever burnt toast and set the smoke alarm off?'],
    land: [
      'Screaming. The whole house. For toast.',
      'Was the alarm being naughty? No. It was doing its job. It just can’t tell toast from a fire.',
      'Your brain’s got one of those. It goes off loud, about things that turn out to be toast.',
      'It’s not broken. It’s just very keen.',
    ],
  },
  {
    id: 'sofa',
    band: 'young',
    kind: 'image',
    open: ['When you watch a scary bit in a film, you get scared. Properly scared.'],
    land: [
      'But you also know you’re sitting on the sofa.',
      'Both at once. The scared you, and the you that knows where the sofa is.',
      'That second one is always there, even when a feeling is really big.',
    ],
  },
  {
    id: 'wobblytooth',
    band: 'young',
    kind: 'image',
    open: ['You know when you’ve got a wobbly tooth?'],
    land: [
      'And your tongue keeps going back to it. Poke. Poke.',
      'Even when you’ve decided to stop.',
      'Some thoughts are wobbly teeth.',
    ],
  },
  {
    id: 'bluecup',
    band: 'young',
    kind: 'image',
    open: ['When you were little — really little — you used to cry about the blue cup.'],
    land: [
      'Someone gave you the red cup, and it was the worst thing that had ever happened.',
      'It really was, at the time. I’m not being funny about it.',
      'Do you still mind about the blue cup?',
    ],
  },
  {
    id: 'holiday',
    band: 'older',
    kind: 'image',
    open: ['The last day of a holiday.'],
    land: [
      'You’re not happy, and you’re not sad. You’re both, fully, at once.',
      'And neither one cancels the other out.',
      'That’s not you being confused. That’s just how people are built.',
    ],
  },
  {
    id: 'loudshop',
    kind: 'image',
    open: ['In a shop, the loudest person is not usually the one who knows the most.'],
    land: [
      'Same in your head.',
      'The thought that keeps hammering at you — the one that’s practically shouting — that’s not the reliable one. It’s the loudest one.',
      'Loud and right are different things.',
    ],
  },
  {
    id: 'scareddog',
    band: 'young',
    kind: 'image',
    open: ['When a dog is scared, what does it do?'],
    land: [
      'It barks. Big and loud and fierce. So you think it’s angry.',
      'It’s not angry. It’s scared, standing in front of the scared with something loud.',
      'People do that too. Sometimes the shouty feeling has a smaller, softer one hiding behind it.',
    ],
  },
  {
    id: 'feet',
    kind: 'image',
    open: ['Here’s a game nobody can see you playing.'],
    land: [
      'Next time you’re waiting — in a queue, in the car, in assembly, waiting for someone to stop talking —',
      'can you feel your feet? Inside your shoes. Right now.',
      'You can wiggle your toes and nobody will know. That’s it. That’s the whole game.',
      'Your head can be miles away. Your feet are always right here.',
    ],
  },
];

interface Store {
  /** Ids already met, in the order they were met. */
  seen?: string[];
  /** ISO day of the last one, so it's one a day rather than one a landing. */
  last?: string;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function read(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Store) : {};
  } catch { return {}; }
}

function write(s: Store): void {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* storage off — he improvises */ }
}

/**
 * A small, stable number from a string.
 *
 * The pick has to be the SAME all day and different tomorrow, which rules out
 * Math.random: this is read on every mount of the hub, and a child who walks
 * into a room and comes back out would otherwise find Chirpy halfway through
 * a different experiment. Hashing the date gives a choice that is fixed for
 * the day, moves on its own overnight, and needs nothing written down.
 */
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/**
 * Today's move, or null.
 *
 * READ-ONLY, like arcBeatForToday and for the same reason — nothing is
 * recorded until a child has actually reached the end of one.
 *
 * ONE A DAY. Not one a landing: the whole complaint this file answers is a
 * hub that repeated itself every time it mounted, and a teaching library that
 * handed out a fresh experiment on every visit would be the same mistake
 * wearing better clothes. Come back four times tonight and Chirpy has nothing
 * new, which is correct — he already said his thing.
 *
 * WHEN THE LIBRARY RUNS DRY it starts again rather than going silent. A couple
 * of weeks of evenings is a long way from the last time a child met the purple elephant,
 * and every one of these is an experiment rather than a fact — running it
 * again is the point of it, not a repeat of it.
 */
export function teachingForToday(): Teaching | null {
  const s = read();
  const t = today();
  if (s.last === t) return null;

  /*
    ONLY WHAT THIS CHILD'S BAND CAN ACTUALLY USE.

    An unbanded move goes to everybody; a banded one goes only to its own
    band. And when the age is unknown — a child declined to say, or storage is
    off — the banded moves are all held back rather than guessed at. That
    leaves eight genuinely universal ones, which is a smaller library but not
    a worse one: every single move in it is something the document marked as
    working at any age. Guessing would eventually hand a five-year-old §16.
  */
  const b = band();
  const forMe = TEACHINGS.filter((x) => !x.band || x.band === b);

  const seen = s.seen ?? [];
  const unseen = forMe.filter((x) => !seen.includes(x.id));
  const pool = unseen.length ? unseen : forMe;
  if (!pool.length) return null;
  return pool[hash(t) % pool.length];
}

/** They got to the end of one. He doesn't do it again. */
export function teachingShown(id: string): void {
  const s = read();
  const seen = s.seen ?? [];
  const next = seen.includes(id) ? seen : [...seen, id];

  /*
    A full pass empties the list rather than growing it forever — see the note
    above on why the library restarts instead of falling silent.

    MEASURED AGAINST THIS CHILD'S OWN POOL, not against all of TEACHINGS. A
    nine-year-old is never offered the ten moves written for the other band,
    so waiting for eighteen ids to accumulate would mean the list never resets
    and `unseen` is empty forever after the fourteenth — which still works,
    because of the fallback in teachingForToday, but grows a dead array in
    storage for the lifetime of the install.
  */
  const b = band();
  const mine = TEACHINGS.filter((x) => !x.band || x.band === b);
  write({ seen: next.length >= mine.length ? [] : next, last: today() });
}
