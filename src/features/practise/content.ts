import type { PracticeRoom, Pattern, SessionStep, StrengthId } from './types';

/**
 * Content = configuration on the shared engine. Adding a room means adding data
 * here, never a new screen. (PRODUCT_VISION §5–7, PRODUCT_PRINCIPLES.)
 */

/* ── Strengths (framed as "areas you've practised") ─────────────────────── */

export const STRENGTHS: { id: StrengthId; label: string; glyph: string }[] = [
  { id: 'awareness', label: 'Awareness', glyph: '👀' },
  { id: 'pausing', label: 'Pausing', glyph: '🌬️' },
  { id: 'perspective', label: 'Perspective', glyph: '🧭' },
  { id: 'letting-go', label: 'Letting Go', glyph: '🌱' },
  { id: 'self-compassion', label: 'Self-Compassion', glyph: '❤️' },
];

/* ── Shared step builders ───────────────────────────────────────────────── */

/** A guided-breath "create space" step (Breathe in 4 · hold 2 · out 6). */
export const spaceStep = (prompt = 'Take a slow breath in… and out.'): SessionStep => ({
  kind: 'space',
  title: 'Create space',
  prompt,
});

/** The reflect-and-learn closing step. */
export const reflectStep = (prompt = 'What did you discover?'): SessionStep => ({
  kind: 'reflect',
  title: 'Reflect & learn',
  prompt,
});

/* ── ADULT · Today's Practice rotation (the "I want to grow" path) ───────── */

export const TODAYS_PRACTICES: PracticeRoom[] = [
  {
    id: 'today-pausing',
    gym: 'adult',
    title: 'Pausing Before Reacting',
    whatPractising: 'Creating a little space between what happens and what you do.',
    glyph: '🌬️',
    strengths: ['pausing', 'awareness'],
    steps: [
      {
        kind: 'observe',
        title: 'Notice the pull',
        prompt: 'Bring to mind a moment today you reacted quickly. Notice the pull to react.',
        floatingThought: 'I have to respond right now.',
      },
      spaceStep('Before responding, breathe in for 4, hold for 2, out for 6.'),
      reflectStep('What became possible in the space you made?'),
    ],
  },
  {
    id: 'today-noticing',
    gym: 'adult',
    title: 'Noticing Thoughts',
    whatPractising: 'Seeing a thought as a thought — without automatically becoming it.',
    glyph: '👀',
    strengths: ['awareness'],
    steps: [
      {
        kind: 'observe',
        title: 'Notice the thought',
        prompt: 'Let a busy thought arrive. Can you notice it without believing or acting on it?',
        floatingThought: 'This has to be sorted out now.',
      },
      spaceStep(),
      reflectStep('What did you notice about the thought when you watched it?'),
    ],
  },
  {
    id: 'today-perspective',
    gym: 'adult',
    title: 'Seeing Another Perspective',
    whatPractising: 'Widening the view to include what someone else might be experiencing.',
    glyph: '🧭',
    strengths: ['perspective', 'self-compassion'],
    steps: [
      {
        kind: 'choices',
        title: 'Widen the view',
        prompt: 'Think of someone you found difficult recently. What might they have been feeling?',
        options: ['Worried', 'Under pressure', 'Unseen', 'Tired', 'Afraid', 'Just having a hard day'],
      },
      spaceStep(),
      reflectStep('Did anything soften when you widened the view?'),
    ],
  },
  {
    id: 'today-letting-go',
    gym: 'adult',
    title: 'Letting Go of the Replay',
    whatPractising: 'Noticing what you are still holding — and loosening your grip a little.',
    glyph: '🌱',
    strengths: ['letting-go', 'awareness'],
    steps: [
      {
        kind: 'observe',
        title: 'What are you holding?',
        prompt: 'Something your mind keeps replaying. Notice it without pushing it away.',
        floatingThought: 'I keep going over this.',
      },
      spaceStep('Breathe out slowly, as if setting something down for a moment.'),
      reflectStep('What would it feel like to hold this a little more lightly?'),
    ],
  },
];

/* ── ADULT · a bespoke room built from a real situation ─────────────────── */

/**
 * Turn a described situation into a Practice Room. This is the "killer feature":
 * the same six-step training environment shown in the product mockups —
 * Pattern → Replay → Notice the Thought → Create Space → Explore Choices →
 * Reflect & Learn — generated from the user's own words.
 *
 * The pattern here is a gentle first draft the user confirms/adjusts on the
 * Pattern Mirror; the engine never claims to have diagnosed anything.
 */
export function buildBespokeRoom(pattern: Pattern, title?: string): PracticeRoom {
  const roomTitle = title?.trim() || 'Your Practice Room';
  const steps: SessionStep[] = [
    {
      kind: 'pattern',
      title: 'Your pattern',
      prompt: 'Here is what we noticed together. Does this feel right?',
    },
    {
      kind: 'replay',
      title: 'Replay the situation',
      prompt: 'What happens inside you? Choose all that apply.',
      trigger: pattern.event,
      options: ['Anger', 'Fear', 'Hurt', 'Defensiveness', 'Shame', 'Something else'],
    },
    {
      kind: 'observe',
      title: 'Notice the thought',
      prompt: 'Can you notice this thought without immediately believing or acting on it?',
      floatingThought: pattern.thought,
    },
    spaceStep('Take a slow breath in for 4, hold for 2, and out for 6.'),
    {
      kind: 'choices',
      title: 'Explore choices',
      prompt: 'What choices do you have in this moment? Select all that feel possible.',
      options: [
        'Listen without interrupting',
        'Ask for clarification',
        'Take a breath before responding',
        'Name what I feel',
        'Explain my point of view',
        'Something else',
      ],
    },
    reflectStep('What did you discover? And one small thing to practise in real life?'),
  ];
  return {
    id: `bespoke-${Date.now()}`,
    gym: 'adult',
    title: roomTitle,
    whatPractising: `Meeting "${pattern.event}" with a little more space and choice.`,
    glyph: '🧠',
    pattern,
    steps,
    strengths: ['awareness', 'pausing', 'perspective'],
    bespoke: true,
  };
}

/** Starter pattern used to prefill the Pattern Mirror from raw intake text. */
export function draftPattern(situationText: string): Pattern {
  const trimmed = situationText.trim();
  return {
    event: trimmed || 'Something that happened today',
    thought: 'My mind keeps telling me a story about it.',
    feeling: 'Unsettled',
    urge: 'Replay it / react / fix it right away',
  };
}

/* ── KIDS · explore rooms (config, not code) ────────────────────────────── */

export interface KidsRoom extends PracticeRoom {
  /** Soft pastel colour for the room card. */
  tint: string;
  scenario: string;
}

const kidsReflect: SessionStep = {
  kind: 'reflect',
  title: 'What did you learn?',
  prompt: 'What did you discover today?',
};

export const KIDS_ROOMS: KidsRoom[] = [
  {
    id: 'kids-feelings', gym: 'kids', title: 'Feelings Room', glyph: '🌈', tint: '#FFE3EC',
    whatPractising: 'Learn to recognise your feelings.',
    scenario: 'You wanted to play but your friend said no.',
    strengths: ['awareness'],
    steps: [
      { kind: 'replay', title: 'What happened', prompt: 'How do you feel right now?',
        trigger: 'Your friend said “not now” when you asked to play.',
        options: ['😔 Sad', '😡 Cross', '😟 Worried', '😐 Okay'] },
      { kind: 'space', title: 'Big breath', prompt: 'Let’s take one big balloon breath together.' },
      kidsReflect,
    ],
  },
  {
    id: 'kids-thought', gym: 'kids', title: 'Thought Room', glyph: '💭', tint: '#E3F0FF',
    whatPractising: 'Discover what your mind is saying.',
    scenario: 'Your mind says “I’m not good at this.”',
    strengths: ['awareness'],
    steps: [
      { kind: 'observe', title: 'Catch the thought', prompt: 'Can you notice the thought like a cloud floating by?',
        floatingThought: 'I’m not good at this.' },
      { kind: 'space', title: 'Balloon breath', prompt: 'Breathe in slowly… and out.' },
      kidsReflect,
    ],
  },
  {
    id: 'kids-body', gym: 'kids', title: 'Body Detective', glyph: '🔎', tint: '#E7F9EC',
    whatPractising: 'Notice where feelings show up in your body.',
    scenario: 'You feel butterflies before show-and-tell.',
    strengths: ['awareness'],
    steps: [
      { kind: 'choices', title: 'Find the feeling', prompt: 'Where do you feel it in your body?',
        options: ['🦋 Tummy', '💗 Chest', '🤲 Hands', '🧠 Head'] },
      { kind: 'space', title: 'Calm it', prompt: 'Put a hand there and take a slow breath.' },
      kidsReflect,
    ],
  },
  {
    id: 'kids-pause', gym: 'kids', title: 'Pause Room', glyph: '🌬️', tint: '#E3F0FF',
    whatPractising: 'Practise making space before you react.',
    scenario: 'Someone knocked over your tower.',
    strengths: ['pausing'],
    steps: [
      { kind: 'replay', title: 'Uh oh!', prompt: 'What do you want to do?',
        trigger: 'Crash! Your block tower falls down.',
        options: ['😡 Shout', '😢 Cry', '🌬️ Pause first', '🙋 Ask for help'] },
      { kind: 'space', title: 'Pause power', prompt: 'Let’s pause and take three big breaths.' },
      kidsReflect,
    ],
  },
  {
    id: 'kids-story', gym: 'kids', title: 'Different Story', glyph: '🎭', tint: '#FFF3D6',
    whatPractising: 'The same thing can feel different depending on the story.',
    scenario: 'A friend didn’t wave back at you.',
    strengths: ['perspective'],
    steps: [
      { kind: 'choices', title: 'What might be true?', prompt: 'Maybe your friend…',
        options: ['Didn’t see you', 'Was in a hurry', 'Felt shy', 'Was thinking'] },
      { kind: 'space', title: 'Breathe', prompt: 'Take a gentle breath.' },
      kidsReflect,
    ],
  },
  {
    id: 'kids-friendship', gym: 'kids', title: 'Friendship Room', glyph: '🤝', tint: '#E7F9EC',
    whatPractising: 'Practise tricky friendship moments.',
    scenario: 'Two friends both want to go first.',
    strengths: ['perspective', 'self-compassion'],
    steps: [
      { kind: 'choices', title: 'What could you do?', prompt: 'Choose a kind idea.',
        options: ['Take turns', 'Play together', 'Ask a grown-up', 'Say sorry'] },
      { kind: 'space', title: 'Kind breath', prompt: 'Breathe in kindness, breathe out calm.' },
      kidsReflect,
    ],
  },
  {
    id: 'kids-anger', gym: 'kids', title: 'Anger Room', glyph: '🔥', tint: '#FFE3E3',
    whatPractising: 'What to do when anger gets big.',
    scenario: 'Your game turned off before you saved it.',
    strengths: ['pausing'],
    steps: [
      { kind: 'replay', title: 'Grrr!', prompt: 'How big is your anger?',
        trigger: 'The screen went off and your game wasn’t saved.',
        options: ['🌋 Huge', '🔥 Big', '🌤️ Medium', '🌱 Small'] },
      { kind: 'space', title: 'Cool the volcano', prompt: 'Blow out the volcano with long breaths.' },
      kidsReflect,
    ],
  },
  {
    id: 'kids-worry', gym: 'kids', title: 'Worry Room', glyph: '😰', tint: '#EDE7FF',
    whatPractising: 'Meet worry without letting it run everything.',
    scenario: 'You’re nervous about a test tomorrow.',
    strengths: ['awareness', 'letting-go'],
    steps: [
      { kind: 'observe', title: 'Notice the worry', prompt: 'Can you notice the worry thought floating by?',
        floatingThought: 'What if it goes wrong?' },
      { kind: 'space', title: 'Settle', prompt: 'Take three slow, settling breaths.' },
      kidsReflect,
    ],
  },
  {
    id: 'kids-kindness', gym: 'kids', title: 'Kindness Room', glyph: '❤️', tint: '#FFE3EC',
    whatPractising: 'Practise kind words and actions.',
    scenario: 'A classmate is sitting alone.',
    strengths: ['self-compassion', 'perspective'],
    steps: [
      { kind: 'choices', title: 'A kind idea', prompt: 'What kind thing could you do?',
        options: ['Say hello', 'Ask them to play', 'Share', 'Give a smile'] },
      { kind: 'space', title: 'Warm breath', prompt: 'Breathe in, and send someone a kind wish.' },
      kidsReflect,
    ],
  },
  {
    id: 'kids-calm', gym: 'kids', title: 'Calm Room', glyph: '🪷', tint: '#E3F5F5',
    whatPractising: 'Find your calm, any time.',
    scenario: 'Everything feels fast and loud.',
    strengths: ['pausing', 'letting-go'],
    steps: [
      { kind: 'space', title: 'Balloon breath', prompt: 'Breathe in for 4… hold for 2… out for 6.' },
      kidsReflect,
    ],
  },
  {
    id: 'kids-courage', gym: 'kids', title: 'Courage Room', glyph: '🦁', tint: '#FFF3D6',
    whatPractising: 'Do the brave thing, one small step.',
    scenario: 'You want to try but feel unsure.',
    strengths: ['self-compassion'],
    steps: [
      { kind: 'choices', title: 'A brave step', prompt: 'What’s one small brave step?',
        options: ['Put my hand up', 'Try once', 'Ask for help', 'Say “I can try”'] },
      { kind: 'space', title: 'Lion breath', prompt: 'Take a big, strong lion breath.' },
      kidsReflect,
    ],
  },
  {
    id: 'kids-reflection', gym: 'kids', title: 'Reflection Room', glyph: '⭐', tint: '#EDE7FF',
    whatPractising: 'Look back and see what you learned.',
    scenario: 'Let’s look back at your day.',
    strengths: ['awareness'],
    steps: [
      { kind: 'choices', title: 'Today I felt…', prompt: 'Pick what fits today.',
        options: ['😀 Great', '🙂 Good', '😐 Okay', '😔 Tricky'] },
      kidsReflect,
    ],
  },
];
