/**
 * THE SCENE'S LITTLE FRIENDS.
 *
 * Every thing in the treehouse can be tapped, and each one has a feeling of its own
 * and one small, kind idea to share. They are written to the same rules as the rest
 * of Mind Gym: the first line says how the friend feels (so a child sees a feeling
 * named without being told to have it), the lesson is invitational — "you can" and
 * "what if", never "you should" — and nothing asks for a confession or a score.
 *
 * COPY LIVES HERE, NOT IN THE SCREEN, so it can be reviewed and changed without
 * touching layout. It needs a read-through by the founder before it is final.
 */
export type Friend = {
  id: string;
  /** What the child sees on the label. */
  name: string;
  /** The thing it is: "the lantern". */
  thing: string;
  /** One feeling word, shown as a chip. */
  feeling: string;
  /** What the friend says, in first person, in a sentence or two. */
  line: string;
  /** The idea underneath it, as a gentle invitation. */
  lesson: string;
};

export const FRIENDS: Record<string, Friend> = {
  glow: { id: 'glow', name: 'Glow', thing: 'the big lantern', feeling: 'Calm',
    line: 'I don’t chase the dark away. I just glow, and the dark gets softer.',
    lesson: 'You can be gentle with yourself the same way.' },
  spark: { id: 'spark', name: 'Spark', thing: 'the little lantern', feeling: 'Excited',
    line: 'Ooh, someone’s here! I get so bright when I’m with a friend.',
    lesson: 'Sharing your light with someone can make it grow.' },
  flicker: { id: 'flicker', name: 'Flicker', thing: 'the wobbly lantern', feeling: 'Nervous',
    line: 'Sometimes I wobble. But I’m still a light, even when I flicker.',
    lesson: 'It’s okay to feel unsteady. You’re still you.' },
  hush: { id: 'hush', name: 'Hush', thing: 'the sleepy lantern', feeling: 'Sleepy',
    line: 'I’m a little tired today, and that’s okay. I’ll rest and shine again soon.',
    lesson: 'Resting is part of being strong.' },
  drift: { id: 'drift', name: 'Drift', thing: 'the cloud', feeling: 'Passing',
    line: 'I float by. I never stay in one place for long.',
    lesson: 'Feelings are like clouds. They come, and they go.' },
  puff: { id: 'puff', name: 'Puff', thing: 'the little cloud', feeling: 'Shy',
    line: 'I’m small, and I feel a bit shy up here. But I like being seen.',
    lesson: 'Big feelings get smaller when you say them out loud.' },
  wish: { id: 'wish', name: 'Wish', thing: 'the evening star', feeling: 'Hopeful',
    line: 'I’m always twinkling, even when it’s still light out.',
    lesson: 'Hope is something you can hold, even before it comes true. What are you hoping for?' },
  rooty: { id: 'rooty', name: 'Rooty', thing: 'the old tree', feeling: 'Steady',
    line: 'My roots go deep, so the wind can move my leaves and I still stand tall.',
    lesson: 'When things feel wobbly, take a slow breath and feel your feet on the ground.' },
  bloom: { id: 'bloom', name: 'Bloom', thing: 'the flowers', feeling: 'Patient',
    line: 'I didn’t open in one day. I grew a tiny bit at a time.',
    lesson: 'Small steps count. You’re growing, too.' },
  luna: { id: 'luna', name: 'Luna', thing: 'the full moon', feeling: 'Peaceful',
    line: 'I look different every night, but I’m always still the moon.',
    lesson: 'You can change and grow and still be you.' },
  snug: { id: 'snug', name: 'Snug', thing: 'the rug', feeling: 'Cosy',
    line: 'Everyone is welcome on me. There’s room for every feeling.',
    lesson: 'No feeling is a wrong feeling.' },
};
