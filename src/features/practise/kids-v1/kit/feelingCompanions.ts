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
 * Friendship Park, ashamed in Truth Lab) and the art existed. `excited` has
 * no companion yet — there is no artwork for it, and falling back to the
 * calm-happy plate would put the wrong face on a real answer.
 */

export interface FeelingCompanion {
  /** Served from public/feelings — see that folder for how they were cut. */
  src: string;
  /** What this feeling is like. Observations, never instructions. */
  guidance: string[];
}

export const FEELING_COMPANIONS: Record<string, FeelingCompanion> = {
  happy: {
    src: '/feelings/happy.webp',
    guidance: [
      'This one’s easy to miss. It doesn’t shout like the others.',
      'Nothing to do about it. It’s just good that it’s here.',
      'Happy comes and goes on its own. It always has.',
    ],
  },
  sad: {
    src: '/feelings/sad.webp',
    guidance: [
      'Sad is slow. It doesn’t like being hurried along.',
      'It gets lighter by being noticed, not by being argued with.',
      'Sad usually means something mattered to you.',
    ],
  },
  angry: {
    src: '/feelings/angry.webp',
    guidance: [
      'Angry turns up fast and leaves slowly.',
      'It’s often standing in front of something else. Sometimes hurt.',
      'Being angry and being unkind are two different things.',
    ],
  },
  scared: {
    src: '/feelings/scared.webp',
    guidance: [
      'Scared is doing its job — it’s trying to keep you safe.',
      'It doesn’t always know how big the thing really is.',
      'Brave isn’t the opposite of scared. They turn up together.',
    ],
  },
  worried: {
    src: '/feelings/worried.webp',
    guidance: [
      'Worry is your mind rehearsing something. Over and over.',
      'Most of what it rehearses never happens.',
      'Worry feels like planning. It usually isn’t.',
    ],
  },
  anxious: {
    src: '/feelings/anxious.webp',
    guidance: [
      'Lots of thoughts at once, all talking over each other.',
      'None of them have to be answered right now.',
      'It’s loud, but loud isn’t the same as true.',
    ],
  },
  bored: {
    src: '/feelings/bored.webp',
    guidance: [
      'Bored is a room with nothing in it yet.',
      'Some of the best ideas start right here.',
      'It’s uncomfortable, and it isn’t a problem.',
    ],
  },
  jealous: {
    src: '/feelings/jealous.webp',
    guidance: [
      'Wanting what someone else has. Everybody does it.',
      'It says more about what you want than about them.',
      'You can be pleased for someone and jealous at once.',
    ],
  },
  ashamed: {
    src: '/feelings/ashamed.webp',
    guidance: [
      'Shame says you ARE bad, not that you did something.',
      'It’s lying about that bit.',
      'The doing can be fixed. That’s the useful part.',
    ],
  },
  embarrassed: {
    src: '/feelings/embarrassed.webp',
    guidance: [
      'Everyone remembers their own. Almost nobody remembers yours.',
      'It burns hot and goes out fast.',
      'It usually means you cared how it went.',
    ],
  },
  grief: {
    src: '/feelings/grief.webp',
    guidance: [
      'Missing someone is love with nowhere to go.',
      'It doesn’t need fixing.',
      'It comes in waves, not in a straight line.',
    ],
  },
};

export function companionFor(feeling: string | undefined | null): FeelingCompanion | null {
  if (!feeling) return null;
  return FEELING_COMPANIONS[feeling.trim().toLowerCase()] ?? null;
}
