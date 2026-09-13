/**
 * THE FEELING COMPANIONS.
 *
 * Once a child has said what they're feeling, that feeling turns up in the
 * room with them — the boy and Chirpy, wearing it. It drifts about, minding
 * its own business, and if the child taps it, it says one small thing about
 * what that feeling is like.
 *
 * WHAT THE GUIDANCE IS ALLOWED TO BE. An observation about the feeling, and
 * nothing else. Never an instruction (§2.4 — nothing is ever marked right),
 * never a way out of it, never "try to...", never a moral. "Angry turns up
 * fast and leaves slowly" is a fact about anger that a child can check
 * against their own experience. "Try to calm down" is a grown-up telling
 * them their feeling is inconvenient, and it teaches them to hide it, which
 * costs everything upstream.
 *
 * The lines cycle rather than repeat, so a child who taps four times gets
 * four different things rather than the same sentence shouted louder.
 *
 * SIX OF THESE MATCH THE BALLS a child can pop in the Feelings Room; the
 * rest are here because they turn up all over the game library (jealous in
 * Friendship Park, ashamed in Truth Lab) and the art existed.
 *
 * TWO OF THE SIX BALLS HAVE NO COMPANION. `excited` never had art. `angry`
 * did, and it's been pulled — see public/feelings/angry.webp, still on
 * disk, unreferenced. Popping ANGRY is unaffected either way: it's still
 * one of the six balls, it still gets recorded as today's feeling, it is
 * never treated as less valid than the others (§2.4's whole point). All
 * that changes is that nothing floats around the room wearing it
 * afterward. Falling back to a different plate — happy's, say — would put
 * the wrong face on a real answer, which is worse than showing nothing.
 */

/**
 * HOW A FEELING MOVES.
 *
 * Every one of these used to share a single animation: a cheerful hop with a
 * squash on the landing, 2.4 seconds, on a loop. It was written for a boy
 * with nothing in particular going on, and then it played identically under
 * the grieving plate, the frightened one and the ashamed one — a child who
 * had just told the app their nan died got a bouncing cartoon for their
 * trouble. The art was doing careful work and the motion was talking over it.
 *
 * So the feeling picks its own idle. The names are what the movement IS, not
 * what it means, and the keyframes live in ui/FloatingFeeling — this module
 * stays data, and nothing in it has to know framer-motion exists.
 *
 * THE AMPLITUDES ARE ALL SMALL, and the difficult ones are the smallest.
 * Scared trembles by a pixel and a half; grief barely breathes. This is a
 * companion sitting in the corner of the room being recognisable, not a
 * performance of distress at a child who is already feeling it. The quiet
 * state stops all of it dead, as everywhere else.
 */
export type FeelingIdle =
  | 'hop' | 'float' | 'heavy' | 'tremble' | 'sway'
  | 'jitter' | 'slump' | 'lean' | 'shrink' | 'flush' | 'breathe';

export interface FeelingCompanion {
  /** Served from public/feelings — see that folder for how they were cut. */
  src: string;
  /** What this feeling is like. Observations, never instructions. */
  guidance: string[];
  /** How he sits with it. See FeelingIdle, and ui/FloatingFeeling for shapes. */
  idle: FeelingIdle;
}

export const FEELING_COMPANIONS: Record<string, FeelingCompanion> = {
  happy: {
    src: '/feelings/happy.webp',
    guidance: [
      'This one’s easy to miss. It doesn’t shout like the others.',
      'Nothing to do about it. It’s just good that it’s here.',
      'Happy comes and goes on its own. It always has.',
    ],
    /** Unhurried. He is sitting with his eyes shut and there is nowhere to be. */
    idle: 'float',
  },
  sad: {
    src: '/feelings/sad.webp',
    guidance: [
      'Sad is slow. It doesn’t like being hurried along.',
      'It gets lighter by being noticed, not by being argued with.',
      'Sad usually means something mattered to you.',
    ],
    /** Slow and shallow. Sad does not like being hurried along, and neither does this. */
    idle: 'heavy',
  },
  scared: {
    src: '/feelings/scared.webp',
    guidance: [
      'Scared is doing its job — it’s trying to keep you safe.',
      'It doesn’t always know how big the thing really is.',
      'Brave isn’t the opposite of scared. They turn up together.',
    ],
    /** A pixel and a half, quickly. Enough to recognise, nowhere near enough to alarm. */
    idle: 'tremble',
  },
  worried: {
    src: '/feelings/worried.webp',
    guidance: [
      'Worry is your mind rehearsing something. Over and over.',
      'Most of what it rehearses never happens.',
      'Worry feels like planning. It usually isn’t.',
    ],
    /** Side to side, the way you do while rehearsing something for the ninth time. */
    idle: 'sway',
  },
  anxious: {
    src: '/feelings/anxious.webp',
    guidance: [
      'Lots of thoughts at once, all talking over each other.',
      'None of them have to be answered right now.',
      'It’s loud, but loud isn’t the same as true.',
    ],
    /** Restless and slightly irregular — several things at once, none of them finishing. */
    idle: 'jitter',
  },
  bored: {
    src: '/feelings/bored.webp',
    guidance: [
      'Bored is a room with nothing in it yet.',
      'Some of the best ideas start right here.',
      'It’s uncomfortable, and it isn’t a problem.',
    ],
    /** Almost nothing, very slowly. The whole point of bored is that nothing is happening. */
    idle: 'slump',
  },
  jealous: {
    src: '/feelings/jealous.webp',
    guidance: [
      'Wanting what someone else has. Everybody does it.',
      'It says more about what you want than about them.',
      'You can be pleased for someone and jealous at once.',
    ],
    /** A slow tilt away and back. Looking at something that is not his. */
    idle: 'lean',
  },
  ashamed: {
    src: '/feelings/ashamed.webp',
    guidance: [
      'Shame says you ARE bad, not that you did something.',
      'It’s lying about that bit.',
      'The doing can be fixed. That’s the useful part.',
    ],
    /** Sinks a little and stays there. Shame makes people smaller; it should not make them bounce. */
    idle: 'shrink',
  },
  embarrassed: {
    src: '/feelings/embarrassed.webp',
    guidance: [
      'Everyone remembers their own. Almost nobody remembers yours.',
      'It burns hot and goes out fast.',
      'It usually means you cared how it went.',
    ],
    /** A quick warm pulse that passes. It burns hot and goes out fast — so does this. */
    idle: 'flush',
  },
  grief: {
    src: '/feelings/grief.webp',
    guidance: [
      'Missing someone is love with nowhere to go.',
      'It doesn’t need fixing.',
      'It comes in waves, not in a straight line.',
    ],
    /** Barely moves at all. One very long breath. Grief does not need animating at. */
    idle: 'breathe',
  },
};

export function companionFor(feeling: string | undefined | null): FeelingCompanion | null {
  if (!feeling) return null;
  return FEELING_COMPANIONS[feeling.trim().toLowerCase()] ?? null;
}

/**
 * WHO TURNS UP WHEN NOTHING HAS BEEN NAMED — the calm plate, and no claim
 * about how the child feels.
 *
 * Most visits never go through the Feelings Room at all: a child comes in,
 * ticks two rooms and leaves. Every one of those visits had an empty room,
 * because the companion only ever existed to carry a named feeling. That is
 * a lot of nobody-there for the sake of a rule that was really about
 * something narrower.
 *
 * The rule it was about still holds: never put the WRONG face on a real
 * answer. A child who said "excited" or "angry" and got this serene one
 * back would have been contradicted by the app, so a named feeling with no
 * art still shows nobody (see the note at the top of this file). Nothing
 * named is a different case entirely — there is no answer here to
 * misrepresent, and a boy sitting quietly in the corner with Chirpy asleep
 * on his shoulder claims nothing about anybody's day.
 *
 * WHICH IS WHY HE SAYS NOTHING ABOUT FEELINGS. The other ten are
 * observations about the feeling they're wearing. This one isn't wearing
 * one, so his lines are just company — and never a question, because "how
 * are you feeling?" from a character the child didn't ask for is the
 * Feelings Room ambushing them in a corridor.
 */
export const COMPANY: FeelingCompanion = {
  src: '/feelings/happy.webp',
  guidance: [
    'I’m not here for anything. Just here.',
    'Chirpy fell asleep on my shoulder ages ago.',
    'You can put me wherever you like. I don’t mind.',
    'Some rooms are better with somebody in them.',
    'No questions from me today.',
  ],
  /** The original bounce, kept for the one companion who isn't carrying a
   *  feeling. Nothing is being said about anybody's day here, so a cheerful
   *  hop misrepresents nothing — which is exactly what it did everywhere
   *  else. */
  idle: 'hop',
};
