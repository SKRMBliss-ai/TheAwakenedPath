/**
 * THE SECRET GAMES — the teaching that leaves the building.
 *
 * Everything else Chirpy does happens on a screen and is over when the screen
 * is. A child reads the purple elephant, feels the thing, taps Okay, and the
 * app has had its moment. That is not nothing — the founder's document is
 * built on those moments — but it is only half of what the document asks for.
 * Its first writing rule is "let them run it", and three of its eighteen
 * sections are explicitly written to land somewhere the app cannot follow:
 *
 *   §1   hold a ball under the bath water, and let go
 *   §13  keep score for a week of what your mind predicts
 *   §17  next time you are waiting, can you feel your feet
 *
 * §17 also says the thing that makes all of them work: "Secrecy is the hook.
 * Children have very little that is private and entirely theirs, and a game
 * adults can't detect is genuinely appealing in a way that 'practise
 * mindfulness' never is."
 *
 * So this is a mission a child carries OUT. Chirpy hands over one thing to go
 * and do in the world. Nobody can see them doing it — not a parent, not a
 * teacher, and not the app, which is the point and is stated plainly to the
 * child. Then, on a later day, he asks how it went. That second half is the
 * half that makes it real: a thing you were asked to do and never asked about
 * again was not a mission, it was a suggestion.
 *
 * WHAT IS DELIBERATELY ABSENT, and this is the whole design:
 *
 *   NO SCORE. Nothing here awards a point, and nothing counts how many were
 *   completed. The instant a secret game is worth points it stops being a
 *   secret game and becomes homework, and a child who wants the point will
 *   say they did it. The app would then be collecting fiction and calling it
 *   progress.
 *
 *   NO STREAK. Same reason, with teeth: a streak punishes the honest answer.
 *
 *   "I DIDN'T GET A GO" IS A COMPLETE ANSWER. §17 says it outright — "for
 *   some children body attention isn't neutral; 'I didn't feel like it today'
 *   is a complete answer, every time." So it is one of the replies, it is
 *   never the last one in the list, and it has a warm landing of its own
 *   rather than a consolation. See `replies` below.
 *
 *   NO RIGHT FINDING. Where a mission asks what happened, every answer gets a
 *   real response. The child is reporting weather, not sitting an exam.
 */

const KEY = 'mindgym.kidsv1.missions';

/** How many days must pass after one comes back before another is offered. */
const REST_DAYS = 2;

export interface MissionReply {
  /** What the child taps. */
  text: string;
  /** What Chirpy says to that particular answer. A line or two, no moral. */
  land: string[];
}

export interface Mission {
  id: string;
  /** Which section of the founder's document this carries out. */
  from: string;
  /** How he hands it over. */
  give: string[];
  /**
   * The mission itself, in one line — the thing the child is actually
   * carrying. Short enough to remember without writing down, because writing
   * it down is how a parent finds out about it.
   */
  secret: string;
  /** How he opens the conversation when they come back. */
  ask: string;
  /**
   * The honest answers. Three or four, one of which is always some form of
   * "no" — and never in last place, where it would read as the afterthought.
   */
  replies: MissionReply[];
}

export const MISSIONS: Mission[] = [
  {
    id: 'feet',
    from: '§17 · a thread of attention in your body',
    give: [
      'Here’s a game nobody can see you playing.',
      'Next time you’re waiting — a queue, the car, assembly, someone taking ages to stop talking — see if you can feel your feet. Inside your shoes.',
      'You can wiggle your toes and nobody will ever know.',
    ],
    secret: 'Waiting somewhere? Find your feet.',
    ask: 'That feet thing. Did you get a go at it?',
    replies: [
      {
        text: 'Yeah. I could feel them.',
        land: [
          'There you go. Your head was probably miles away at the time.',
          'Feet don’t go anywhere. That’s the useful bit about them.',
        ],
      },
      {
        text: 'I tried but I forgot about it',
        land: [
          'That’s most of it, honestly. Remembering is the hard half.',
          'It’ll turn up on its own eventually, usually in the most boring queue you’ve ever stood in.',
        ],
      },
      {
        text: 'I didn’t get a go',
        land: ['Fair enough. It’ll keep.'],
      },
      {
        text: 'I did it in front of someone and they had no idea',
        land: ['Ha. That’s the whole point of it, that.'],
      },
    ],
  },
  {
    id: 'bathball',
    from: '§1 · you cannot squash a feeling',
    give: [
      'Next time you’re in the bath, take something that floats down there with you.',
      'Hold it under the water. Right under. See how long you can keep it there.',
      'Then let go.',
    ],
    secret: 'In the bath: hold something under. Then let go.',
    ask: 'Did you get to do the thing in the bath?',
    replies: [
      {
        text: 'It shot up out of the water',
        land: [
          'Straight up, and probably further than you expected.',
          'That’s what holding a feeling down is like. All that effort, and it comes up anyway.',
        ],
      },
      {
        text: 'My arm got tired holding it',
        land: [
          'That’s the bit I’d remember, actually.',
          'Keeping it down there is the hard work. Not the letting go.',
        ],
      },
      { text: 'Not yet', land: ['No rush. Baths keep happening.'] },
    ],
  },
  {
    id: 'prediction',
    from: '§13 · loud isn’t true',
    give: [
      'This one’s a bit different. You’re collecting something.',
      'Next time your mind is completely certain something bad is about to happen — everyone will laugh, you’ll get told off, nobody will sit with you — hang on to exactly what it said.',
      'Then just… watch what actually happens.',
    ],
    secret: 'Mind sure something bad will happen? Remember what it said. Then watch.',
    ask: 'Did your mind make any predictions?',
    replies: [
      {
        text: 'It was wrong',
        land: [
          'Right. Worth knowing.',
          'It was completely certain, though, wasn’t it. That’s the thing about it — being sure and being right aren’t the same machine.',
        ],
      },
      {
        text: 'It was a bit right',
        land: [
          'Happens. It’s not making things up — it’s guessing, and sometimes it guesses well.',
          'Was it as bad as it said, though? That’s usually where the gap is.',
        ],
      },
      {
        text: 'It was right, actually',
        land: [
          'Then it was right. I’m not going to pretend otherwise.',
          'It does get things right sometimes. That’s why anyone listens to it at all.',
        ],
      },
      { text: 'It didn’t say anything this time', land: ['Quiet week. Those are good.'] },
    ],
  },
  {
    id: 'itchout',
    from: '§6 · urges rise and fall',
    give: [
      'Sometime today you’ll get an itch. Everyone does, loads of times.',
      'When you notice one — don’t scratch it. Don’t fight it either. Just watch what it does.',
      'See how long it takes to go on its own.',
    ],
    secret: 'Get an itch? Don’t scratch. Watch it.',
    ask: 'Did you catch an itch?',
    replies: [
      {
        text: 'It went away by itself',
        land: [
          'Without you doing anything at all.',
          'Wanting to shout does that too. And wanting to say the mean thing.',
        ],
      },
      {
        text: 'I scratched it',
        land: ['Course you did. They’re very persuasive.', 'There’ll be another one along in a minute.'],
      },
      { text: 'I didn’t get a go', land: ['It’ll keep.'] },
      {
        text: 'It got worse first, then went',
        land: [
          'That’s exactly it. Worse, then weird, then gone.',
          'Most things that feel enormous do that, if you can stay there while they do.',
        ],
      },
    ],
  },
  {
    id: 'behindit',
    from: '§15 · anger is often standing in front of something else',
    give: [
      'Next time you’re properly cross — not mildly annoyed, properly cross —',
      'have a quick look behind it. Just a look.',
      'You don’t have to do anything about what’s back there.',
    ],
    secret: 'Properly cross? Have a look behind it.',
    ask: 'Were you cross at all? Did you get a look behind it?',
    replies: [
      {
        text: 'There was something else back there',
        land: [
          'There usually is. Hurt, or embarrassed, or left out — something quieter.',
          'The cross bit isn’t lying to you. It just gets there first.',
        ],
      },
      {
        text: 'No, it was just cross',
        land: [
          'Then it was just cross. That happens too.',
          'Sometimes the answer is that somebody was genuinely out of order.',
        ],
      },
      { text: 'I was too cross to look', land: ['Yep. That’s when it’s hardest. Not a failure.'] },
      { text: 'I wasn’t cross this week', land: ['Good week!'] },
    ],
  },
  {
    id: 'whereitsits',
    from: '§12 · where a feeling sits in your body',
    give: [
      'Next time something big turns up — cross, nervous, whatever it is —',
      'before you do anything about it, find out where it’s sitting. Tummy? Chest? Face? Hands?',
      'That’s all. Just find it.',
    ],
    secret: 'Something big? Find where it’s sitting first.',
    ask: 'Did you find one? Where was it sitting?',
    replies: [
      { text: 'My tummy', land: ['That’s a popular one.', 'Now you know where yours lives.'] },
      { text: 'My chest', land: ['Right in there. A lot of people’s live there.'] },
      { text: 'My face or my head', land: ['Mine goes to my jaw. Everyone’s is somewhere different.'] },
      {
        text: 'I couldn’t find it anywhere',
        land: [
          'That happens, and it doesn’t mean anything’s wrong with your equipment.',
          'Some of them are quiet. Some days you’re just busy.',
        ],
      },
    ],
  },
  {
    id: 'theirs',
    from: '§16 · the spotlight isn’t on you',
    give: [
      'Tomorrow, keep half an eye out for somebody else doing something embarrassing.',
      'Anybody. Tripping, saying the wrong thing, calling the teacher Mum.',
      'Then at bedtime see how many you can still remember.',
    ],
    secret: 'Spot other people’s embarrassing moments. Count them at bedtime.',
    ask: 'How many of other people’s embarrassing bits did you remember?',
    replies: [
      {
        text: 'Hardly any',
        land: [
          'Nobody can. That’s the whole thing.',
          'Which means the one you’re still cringing about — they’ve forgotten it. They were busy with theirs.',
        ],
      },
      {
        text: 'One, maybe two',
        land: [
          'Out of a whole day of people being people.',
          'Yours is in someone else’s "maybe one", if it’s anywhere at all.',
        ],
      },
      { text: 'I forgot to look', land: ['Which is sort of the answer as well, isn’t it.'] },
    ],
  },
  {
    id: 'bluecup',
    from: '§7 · feelings pass',
    give: [
      'This one needs a grown-up, so it’s only half a secret.',
      'Ask someone at home what you used to get really upset about when you were little.',
      'Properly little. The daft ones.',
    ],
    secret: 'Ask at home: what did I cry about when I was little?',
    ask: 'Did you ask? What did they say?',
    replies: [
      {
        text: 'It was something really daft',
        land: [
          'And at the time it was genuinely the worst thing that had ever happened. I’m not being funny about it — it really was.',
          'Do you still mind about it?',
        ],
      },
      {
        text: 'They couldn’t remember',
        land: ['Neither can you, probably. That’s sort of the point of it.'],
      },
      { text: 'I didn’t ask', land: ['No bother. It’ll keep.'] },
      {
        text: 'I still sort of mind about it',
        land: [
          'Then it’s not finished, and that’s allowed.',
          'Some of them take longer. Nobody gets to tell you which ones.',
        ],
      },
    ],
  },
];

interface Store {
  /** The one being carried, if any. */
  carrying?: { id: string; givenOn: string };
  /** Ids already carried and reported back, in order. */
  done?: string[];
  /** ISO day the last one was reported, so a rest can be enforced. */
  lastBack?: string;
}

const today = (): string => new Date().toISOString().slice(0, 10);

function read(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Store) : {};
  } catch { return {}; }
}

function write(s: Store): void {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* storage off */ }
}

const daysBetween = (a: string, b: string): number =>
  Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);

const find = (id: string): Mission | undefined => MISSIONS.find((m) => m.id === id);

/**
 * The mission the child is carrying, if it was handed over on an EARLIER day.
 *
 * The day check is the whole function. A secret game is a thing you go and do
 * out in the world, and the world is mostly not available between opening the
 * app and closing it — so asking on the same evening would be asking a child
 * to report on something they have had no opportunity to do, which teaches
 * them that the question is rhetorical.
 *
 * READ-ONLY. Nothing is spent until the child actually answers; see
 * `missionReported`, and see awayFor's peekWelcomeBack for the bug that made
 * this rule necessary across the whole kit.
 */
export function missionToReport(): Mission | null {
  const s = read();
  if (!s.carrying) return null;
  if (daysBetween(s.carrying.givenOn, today()) < 1) return null;
  return find(s.carrying.id) ?? null;
}

/**
 * A new mission, if one is due.
 *
 * NOT WHILE ONE IS ALREADY OUT. A child carries one thing. Two secret games at
 * once is a list of chores, and the second one guarantees the first is
 * forgotten.
 *
 * AND NOT THE DAY AFTER THE LAST ONE CAME BACK. These ask for something out in
 * the world, which is a bigger thing to ask than reading a card, and a friend
 * who hands you a new job every single evening is not a friend with an idea,
 * he is a friend with a clipboard.
 */
export function missionToGive(): Mission | null {
  const s = read();
  if (s.carrying) return null;
  if (s.lastBack && daysBetween(s.lastBack, today()) < REST_DAYS) return null;

  const done = s.done ?? [];
  const unseen = MISSIONS.filter((m) => !done.includes(m.id));
  /* Round again rather than going quiet when all eight have been carried.
     These are practices, not levels — doing the feet one a second time three
     months later is the point of it, not a repeat of it. */
  const pool = unseen.length ? unseen : MISSIONS;
  return pool[0];
}

/** They took it. It's theirs now until they say how it went. */
export function missionGiven(id: string): void {
  const s = read();
  write({ ...s, carrying: { id, givenOn: today() } });
}

/**
 * They answered — with anything at all, including "I didn't get a go".
 *
 * There is no separate "failed" path and there is deliberately nowhere to
 * record whether they actually did it. What is stored is that the
 * conversation happened, which is the only thing the app has any business
 * knowing. See the note at the top on why scoring this would poison it.
 */
export function missionReported(id: string): void {
  const s = read();
  const done = s.done ?? [];
  const next = done.includes(id) ? done : [...done, id];
  write({
    done: next.length >= MISSIONS.length ? [] : next,
    lastBack: today(),
  });
}
