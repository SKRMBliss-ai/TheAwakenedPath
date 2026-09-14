import type { BoyEmotion } from '../ui/sprites';

/**
 * THE TRUTH LAB'S MATERIAL.
 *
 * Six situations, each walked through the same five steps: what happened,
 * how it felt, what the mind said about it, what else would fit the same
 * facts, and what the child decides to carry out of the room.
 *
 * WHY IT IS NOT THE DIFFERENT STORY ROOM'S SIX. Those two rooms teach
 * neighbouring things and a child who does both in one evening must not be
 * handed the same corridor twice — the second time it is a quiz they already
 * know the answer to, and the whole point is that there is no answer to know.
 * So these are their own situations, and they are deliberately more personal:
 * the Different Story room works on things other people did, and this one
 * works on things the child did, which is harder and is why it comes with
 * more scaffolding.
 *
 * EVERY STEP IS THE CHILD'S OWN CHOICE. Nothing here is scored, nothing is
 * marked, and no option is the right one. The feelings are four real
 * feelings, the alternatives all fit the facts, and the truths at the end are
 * four honest places to land rather than one correct one with three
 * distractors. A child who picks "I still don't know" at the end has done the
 * exercise properly.
 *
 * THE ALTERNATIVES ARE NOT CHEERFUL VERSIONS. Same rule as the Different
 * Story room, and it is the one that takes the most care to hold: "they were
 * busy" is not a happier ending, it is a different explanation that fits
 * everything that actually happened. Hand a child the nice version and you
 * have told them how to feel and taught them the exercise has a right answer.
 */

export interface TruthFeeling {
  /** What the child would call it. */
  word: string;
  /** Which plate of themselves goes on the card. */
  face: BoyEmotion;
  /** Where it sat, in their own words. Step two of the trail. */
  body: string;
}

export interface TruthCase {
  id: string;
  /** The situation, told as something that happened to the child. */
  scene: string;
  /** Four real feelings. None is the expected one. */
  feelings: TruthFeeling[];
  /**
   * What the mind said about it, and the word in that sentence doing the
   * most damage — usually `always`, `never`, `everyone` or `nobody`.
   *
   * The word is called out rather than argued with. A mind that says ALWAYS
   * has stopped describing what happened and started describing a rule, and
   * a child can learn to hear that one word long before they can learn to
   * argue with the sentence around it.
   */
  mind: { said: string; word: string };
  /** Other accounts that fit every fact in `scene` just as well. */
  others: string[];
  /** Honest places to land. One of them is "I don't know", on purpose. */
  truths: string[];
}

export const TRUTH_CASES: TruthCase[] = [
  {
    id: 'lastpicked',
    scene: 'You lined up last. Everyone else was already there.',
    feelings: [
      { word: 'Cross', face: 'angry', body: 'My whole face. And my hands went tight.' },
      { word: 'Small', face: 'sad', body: 'Sort of heavy, in my middle.' },
      { word: 'Embarrassed', face: 'embarrassed', body: 'Hot ears. Really hot ears.' },
      { word: 'Left out', face: 'grief', body: 'A sinking bit, right at the bottom of my chest.' },
    ],
    mind: { said: 'I’m ALWAYS last. Everyone puts me last on purpose.', word: 'ALWAYS' },
    others: [
      'I got there after everybody else did.',
      'The line filled up while I was still packing away.',
      'They lined up in the order they finished.',
      'Nobody was thinking about the order at all.',
    ],
    truths: [
      'I was last that time. That’s all that actually happened.',
      'I got there late. Next time I’ll pack up quicker.',
      'It felt like always. It wasn’t always.',
      'I still don’t know, and that’s alright.',
    ],
  },
  {
    id: 'wrongsum',
    scene: 'You got a sum wrong on the board, in front of everyone.',
    feelings: [
      { word: 'Embarrassed', face: 'embarrassed', body: 'My face went hot and I looked at my shoes.' },
      { word: 'Cross', face: 'angry', body: 'Tight jaw. I wanted to sit down.' },
      { word: 'Worried', face: 'worried', body: 'Fluttery, under my ribs.' },
      { word: 'Small', face: 'ashamed', body: 'Like I wanted to be much smaller than I am.' },
    ],
    mind: { said: 'EVERYONE saw. They all think I’m thick now.', word: 'EVERYONE' },
    others: [
      'Some of them were looking out of the window.',
      'Two people got the same one wrong after me.',
      'They were working out their own answer, not watching me.',
      'It was on the board for about nine seconds.',
    ],
    truths: [
      'I got one sum wrong. I got the other four right.',
      'People forget these much faster than I do.',
      'It was embarrassing. Embarrassing isn’t dangerous.',
      'I still don’t know, and that’s alright.',
    ],
  },
  {
    id: 'shouted',
    scene: 'You shouted at someone at home. Louder than you meant to.',
    feelings: [
      { word: 'Guilty', face: 'ashamed', body: 'A twisty feeling, like something folded over.' },
      { word: 'Still cross', face: 'angry', body: 'Hot. My hands were still in fists.' },
      { word: 'Sad', face: 'sad', body: 'Behind my eyes, and in my throat.' },
      { word: 'Scared', face: 'scared', body: 'Quick breaths. Like something was about to happen.' },
    ],
    mind: { said: 'I’m a horrible person. I ALWAYS ruin everything.', word: 'ALWAYS' },
    others: [
      'I shouted once, today, and I was already tired.',
      'I’d been holding something in since this morning.',
      'I did a thing. The thing isn’t all of me.',
      'I could go and say sorry, and that would be a different ending.',
    ],
    truths: [
      'I shouted. I can say sorry for that bit.',
      'I was tired and it came out loud.',
      'Doing a bad thing and being a bad person are different.',
      'I still don’t know, and that’s alright.',
    ],
  },
  {
    id: 'notinvited',
    scene: 'Some of your friends did something at the weekend. You weren’t there.',
    feelings: [
      { word: 'Left out', face: 'grief', body: 'Heavy, and a bit cold, in my chest.' },
      { word: 'Jealous', face: 'jealous', body: 'A tight, prickly feeling.' },
      { word: 'Cross', face: 'angry', body: 'Hot behind my eyes.' },
      { word: 'Sad', face: 'sad', body: 'Just tired, mostly. Like I wanted to lie down.' },
    ],
    mind: { said: 'NOBODY actually likes me. They only put up with me.', word: 'NOBODY' },
    others: [
      'It was three of them, not everyone.',
      'It was somebody’s cousin’s thing and they couldn’t pick.',
      'They thought I was busy, because last time I was.',
      'Nobody decided anything about me. It just happened without me.',
    ],
    truths: [
      'I wasn’t there that time. That’s the whole fact.',
      'It hurt. It can hurt and not mean what my mind said.',
      'I could ask them about it instead of guessing.',
      'I still don’t know, and that’s alright.',
    ],
  },
  {
    id: 'brokeit',
    scene: 'You broke something that wasn’t yours, and nobody knows yet.',
    feelings: [
      { word: 'Scared', face: 'scared', body: 'My heart went fast and my hands were cold.' },
      { word: 'Guilty', face: 'ashamed', body: 'A stone, in my stomach.' },
      { word: 'Worried', face: 'anxious', body: 'Couldn’t sit still. Kept checking.' },
      { word: 'Sad', face: 'sad', body: 'A lump in my throat.' },
    ],
    mind: { said: 'If I say, they’ll NEVER trust me again.', word: 'NEVER' },
    others: [
      'People have broken things here before and it was fine.',
      'They’ll mind more about not being told than about the thing.',
      'I don’t actually know what they’ll say. I’m guessing.',
      'The scared bit is about telling, not about them.',
    ],
    truths: [
      'I broke it. That’s the true bit.',
      'Telling it is the hard bit, and I could still do it.',
      'I’m guessing what they’ll say. Guessing isn’t knowing.',
      'I still don’t know, and that’s alright.',
    ],
  },
  {
    id: 'lostgame',
    scene: 'You lost a game you really wanted to win.',
    feelings: [
      { word: 'Cross', face: 'angry', body: 'Hot face. I nearly threw something.' },
      { word: 'Sad', face: 'sad', body: 'Behind my eyes. I didn’t want to talk.' },
      { word: 'Embarrassed', face: 'embarrassed', body: 'Wanted to leave. Quickly.' },
      { word: 'Flat', face: 'bored', body: 'Nothing, really. Just heavy and done.' },
    ],
    mind: { said: 'I’m rubbish at this. I should NEVER have tried.', word: 'NEVER' },
    others: [
      'They were better than me today.',
      'I lost one game, having won some before.',
      'I tried a thing that was hard and it didn’t come off.',
      'It was close, and close isn’t rubbish.',
    ],
    truths: [
      'I lost. Losing is a thing that happens in games.',
      'I minded a lot, which means I cared a lot.',
      'Being beaten and being rubbish are different things.',
      'I still don’t know, and that’s alright.',
    ],
  },
];

const KEY = 'mindgym.kidsv1.truthLab';

interface Store { seen?: string[] }

function read(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Store) : {};
  } catch { return {}; }
}

/**
 * A situation the child hasn't worked through yet, or the first one again
 * once they've done all six.
 *
 * Like the Different Story room and unlike the hub, this is not rationed to
 * one a day: a child standing in the Truth Lab came here on purpose, and
 * handing them the same situation twice in one visit would teach them the
 * room has one thing in it.
 */
export function nextTruthCase(): TruthCase {
  const seen = read().seen ?? [];
  const unseen = TRUTH_CASES.filter((c) => !seen.includes(c.id));
  return (unseen.length ? unseen : TRUTH_CASES)[0];
}

/** They walked one all the way to the end. */
export function truthCaseDone(id: string): void {
  const seen = read().seen ?? [];
  const next = seen.includes(id) ? seen : [...seen, id];
  try {
    localStorage.setItem(
      KEY,
      /* Six in and it starts again. There is no seventh, and a room that
         empties out and says "nothing left" is worse than one that comes
         round again — these are worth doing twice. */
      JSON.stringify({ seen: next.length >= TRUTH_CASES.length ? [] : next }),
    );
  } catch { /* storage off — every visit is the first situation, survivable */ }
}

/**
 * WHAT THIS ROOM IS CALLED TODAY.
 *
 * The sign over the door says TRUTH LAB and that is its name. But a lab is a
 * place you do experiments in, and half of what happens in here is closer to
 * just being honest with yourself — so Chirpy calls it the Honesty Room
 * sometimes, the way people have more than one name for the room they spend
 * most of their time in.
 *
 * Hashed off the date rather than random: it must not change while a child is
 * standing in it, and a room that renames itself mid-visit is unsettling in a
 * way nobody would be able to describe afterwards.
 */
export function roomNameToday(): string {
  const d = new Date().toISOString().slice(0, 10);
  let h = 0;
  for (let i = 0; i < d.length; i++) h = (h * 31 + d.charCodeAt(i)) | 0;
  /* Two evenings in three it is the Truth Lab, which is what the sign says
     and what a child should end up calling it. */
  return Math.abs(h) % 3 === 0 ? 'the Honesty Room' : 'the Truth Lab';
}
