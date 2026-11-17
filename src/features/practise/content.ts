import type { PracticeRoom, Pattern, SessionStep, StrengthId } from './types';

/**
 * Content = configuration on the shared engine. Adding a room means adding data
 * here, never a new screen. (PRODUCT_VISION §5–7, PRODUCT_PRINCIPLES.)
 */

/* ── Strengths (framed as "areas you've practised") ─────────────────────── */

/** Icons live in ui.tsx (StrengthIcon) — content stays plain data. */
export const STRENGTHS: { id: StrengthId; label: string }[] = [
  { id: 'awareness', label: 'Awareness' },
  { id: 'pausing', label: 'Pausing' },
  { id: 'perspective', label: 'Perspective' },
  { id: 'letting-go', label: 'Letting Go' },
  { id: 'self-compassion', label: 'Self-Compassion' },
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
    icon: 'wind',
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
    icon: 'eye',
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
    icon: 'compass',
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
    icon: 'leaf',
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
  {
    id: 'today-kind-words',
    gym: 'adult',
    title: 'Kind Words to Yourself',
    whatPractising: 'Speaking to yourself the way you would speak to someone you care about.',
    glyph: '❤️',
    icon: 'heart',
    strengths: ['self-compassion', 'awareness'],
    steps: [
      {
        kind: 'observe',
        title: 'Hear the inner critic',
        prompt: 'Recall a moment you were hard on yourself. Notice the tone of the voice.',
        floatingThought: 'I should have done better.',
      },
      {
        kind: 'choices',
        title: 'A kinder voice',
        prompt: 'If a close friend were in your place, what would you say to them?',
        options: [
          'You did what you could with what you knew',
          'Anyone would find this hard',
          'One moment doesn’t define you',
          'It’s okay to rest',
          'You can try again tomorrow',
        ],
      },
      spaceStep('Breathe in slowly, and let the kinder words land.'),
      reflectStep('How did it feel to offer yourself those words?'),
    ],
  },
  {
    id: 'today-body',
    gym: 'adult',
    title: 'Feeling It in the Body',
    whatPractising: 'Noticing where a feeling lives in the body, before the mind explains it.',
    glyph: '🧍',
    icon: 'body',
    strengths: ['awareness', 'pausing'],
    steps: [
      {
        kind: 'choices',
        title: 'Find the feeling',
        prompt: 'Bring to mind something that stirred you today. Where do you feel it?',
        options: ['Chest', 'Stomach', 'Throat', 'Shoulders or neck', 'Jaw', 'Hands', 'Not sure yet'],
      },
      spaceStep('Rest your attention there and breathe: in for 4, hold for 2, out for 6.'),
      reflectStep('What happened to the sensation when you simply stayed with it?'),
    ],
  },
  {
    id: 'today-naming',
    gym: 'adult',
    title: 'Naming the Feeling',
    whatPractising: 'Finding the word for what you feel — naming it often loosens it.',
    glyph: '🏷️',
    icon: 'tag',
    strengths: ['awareness', 'self-compassion'],
    steps: [
      {
        kind: 'choices',
        title: 'Name it',
        prompt: 'Check in right now. Which words come closest? Choose all that fit.',
        options: ['Tense', 'Tired', 'Irritated', 'Sad', 'Worried', 'Flat', 'Content', 'Hopeful'],
      },
      spaceStep('Breathe, and silently say: “This is how it is right now.”'),
      reflectStep('What changed, if anything, once the feeling had a name?'),
    ],
  },
  {
    id: 'today-worry',
    gym: 'adult',
    title: 'Meeting Worry About Tomorrow',
    whatPractising: 'Letting a “what if” be a thought about the future, not a fact about it.',
    glyph: '☁️',
    icon: 'cloud',
    strengths: ['letting-go', 'awareness'],
    steps: [
      {
        kind: 'observe',
        title: 'Notice the “what if”',
        prompt: 'Let a worry about tomorrow arrive. Watch it without solving it.',
        floatingThought: 'What if it goes wrong?',
      },
      spaceStep('Come back to this breath — the only one happening now.'),
      {
        kind: 'choices',
        title: 'What is yours to do?',
        prompt: 'Which of these is true of this worry? Choose all that apply.',
        options: [
          'There is one small step I can take',
          'It is outside my control',
          'It can wait until tomorrow',
          'I could ask someone for help',
          'I don’t know yet — and that’s okay',
        ],
      },
      reflectStep('What is the worry asking of you — and what can you set down?'),
    ],
  },
  {
    id: 'today-listening',
    gym: 'adult',
    title: 'Listening Fully',
    whatPractising: 'Staying with what someone is saying instead of preparing your reply.',
    glyph: '👂',
    icon: 'ear',
    strengths: ['perspective', 'pausing'],
    steps: [
      {
        kind: 'observe',
        title: 'Notice the urge to reply',
        prompt: 'Recall a recent conversation. Notice the moment your mind left to prepare an answer.',
        floatingThought: 'I already know what they’re going to say.',
      },
      spaceStep('One slow breath is enough room to keep listening.'),
      {
        kind: 'choices',
        title: 'Ways to listen',
        prompt: 'In your next conversation, what could you try? Select all that feel possible.',
        options: [
          'Let them finish',
          'Ask one question before giving my view',
          'Say back what I heard',
          'Notice their face and tone',
          'Leave a pause before I answer',
        ],
      },
      reflectStep('Who would you like to listen to more fully this week?'),
    ],
  },
  {
    id: 'today-should',
    gym: 'adult',
    title: 'Easing Off “Should”',
    whatPractising: 'Noticing the pressure inside a “should” and holding it more gently.',
    glyph: '🪶',
    icon: 'feather',
    strengths: ['self-compassion', 'letting-go'],
    steps: [
      {
        kind: 'observe',
        title: 'Catch the “should”',
        prompt: 'Find a “should” that has been following you around. Notice its weight.',
        floatingThought: 'I should be further along by now.',
      },
      spaceStep('Breathe out, and let your shoulders drop a little.'),
      reflectStep('If you swapped “I should” for “I’d like to”, what would stay — and what would fall away?'),
    ],
  },
  {
    id: 'today-criticism',
    gym: 'adult',
    title: 'Receiving Criticism',
    whatPractising: 'Staying steady when someone points out a mistake.',
    glyph: '🛡️',
    icon: 'shield',
    strengths: ['pausing', 'perspective'],
    steps: [
      {
        kind: 'replay',
        title: 'Replay the moment',
        prompt: 'What happens inside you? Choose all that apply.',
        trigger: 'Someone tells you there is a problem with something you did.',
        options: ['Defensiveness', 'Embarrassment', 'Anger', 'Hurt', 'Wanting to explain', 'Going quiet'],
      },
      spaceStep('Before you answer, breathe in for 4, hold for 2, out for 6.'),
      {
        kind: 'choices',
        title: 'Explore choices',
        prompt: 'What could you do next? Select all that feel possible.',
        options: [
          'Hear the whole point first',
          'Ask what they would like to see instead',
          'Say “let me think about that”',
          'Separate the work from my worth',
          'Take what is useful and leave the rest',
        ],
      },
      reflectStep('What part of the criticism, if any, was useful — and what was just sting?'),
    ],
  },
  {
    id: 'today-evening',
    gym: 'adult',
    title: 'Ending the Day Lightly',
    whatPractising: 'Setting the day down so it doesn’t follow you into the night.',
    glyph: '🌙',
    icon: 'moon',
    strengths: ['letting-go', 'self-compassion'],
    steps: [
      {
        kind: 'choices',
        title: 'What is still open?',
        prompt: 'What from today is still with you? Choose all that apply.',
        options: [
          'An unfinished task',
          'A conversation',
          'A mistake',
          'A worry about tomorrow',
          'Something that went well',
          'Nothing much',
        ],
      },
      spaceStep('With each breath out, set one thing down until morning.'),
      reflectStep('What is one thing from today you can thank yourself for?'),
    ],
  },
];

/* ── ADULT · a bespoke room built from a real situation ─────────────────── */

/** Shorten for a one-line card label, on a word boundary. */
function shorten(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const at = cut.lastIndexOf(' ');
  return `${(at > max * 0.6 ? cut.slice(0, at) : cut).replace(/[\s,;:.]+$/, '')}…`;
}

/**
 * Turn a described situation into a Practice Room. This is the "killer feature":
 * the same six-step training environment shown in the product mockups —
 * Pattern → Replay → Notice the Thought → Create Space → Explore Choices →
 * Reflect & Learn — built around the user's own words.
 *
 * The pattern is whatever the user confirmed on the Pattern Mirror; parts they
 * left blank are simply not shown. The engine never claims to have analysed or
 * diagnosed anything.
 */
export function buildBespokeRoom(pattern: Pattern, title?: string): PracticeRoom {
  const roomTitle = title?.trim() || 'Your Practice Room';
  const event = pattern.event.trim() || 'Something that happened';
  const thought = pattern.thought.trim();
  const feeling = pattern.feeling.trim();
  const clean: Pattern = { event, thought, feeling, urge: pattern.urge.trim() };

  // Offer the person's own feeling word first, then the common ones.
  const feelings = ['Anger', 'Fear', 'Hurt', 'Defensiveness', 'Shame', 'Something else'];
  if (feeling && feeling.length <= 32 && !feelings.some((f) => f.toLowerCase() === feeling.toLowerCase())) {
    feelings.unshift(feeling);
  }

  const steps: SessionStep[] = [
    {
      kind: 'pattern',
      title: 'Your pattern',
      prompt: 'Here is the pattern, in your own words. Does this feel right?',
    },
    {
      kind: 'replay',
      title: 'Replay the situation',
      prompt: 'What happens inside you? Choose all that apply.',
      trigger: event,
      options: feelings,
    },
    thought
      ? {
          kind: 'observe',
          title: 'Notice the thought',
          prompt: 'Can you notice this thought without immediately believing or acting on it?',
          floatingThought: thought,
        }
      : {
          kind: 'observe',
          title: 'Notice the thought',
          prompt: 'What does your mind say about this? Let the thought arrive, and notice it without believing or acting on it.',
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
    whatPractising: `Meeting “${shorten(event, 90)}” with a little more space and choice.`,
    glyph: '🧠',
    icon: 'brain',
    pattern: clean,
    steps,
    strengths: ['awareness', 'pausing', 'perspective'],
    bespoke: true,
  };
}

/* ── ADULT · sorting the intake into a first-draft pattern ──────────────── */

/**
 * Feeling words we can recognise when the person uses them. This is a lookup,
 * not an inference: a word only appears in the draft if they wrote it.
 */
const FEELING_WORDS = [
  'angry', 'anger', 'annoyed', 'irritated', 'frustrated', 'furious', 'resentful', 'bitter', 'defensive',
  'hurt', 'sad', 'upset', 'lonely', 'rejected', 'ignored', 'unseen', 'unheard', 'unappreciated',
  'ashamed', 'shame', 'embarrassed', 'humiliated', 'guilty', 'guilt',
  'anxious', 'anxiety', 'worried', 'worry', 'nervous', 'scared', 'afraid', 'fear', 'panic', 'panicky', 'dread',
  'stressed', 'stress', 'overwhelmed', 'exhausted', 'drained', 'numb', 'helpless', 'hopeless', 'trapped',
  'insecure', 'jealous', 'envious', 'disappointed', 'confused', 'restless', 'tense', 'uneasy', 'unsettled',
  'worthless', 'inadequate', 'heartbroken', 'grief',
];
const FEELING_RE = new RegExp(`\\b(${FEELING_WORDS.join('|')})\\b`, 'gi');

/** Phrases that mark a clause as "what my mind said". */
const THOUGHT_CUE =
  /\b(i (keep |just |always )?(think|thought|believe|assume|wonder)|i('m| am) (sure|convinced)|i (tell|told) myself|what if|(they|he|she|everyone|people) (must|probably|will|would|might) (think|hate|judge|leave)|i should(n't| not)? have|i('m| am) not (good |smart |capable )?enough|i('m| am) (a failure|useless|stupid|the problem)|it('s| is) (all )?my fault|i (always|never) |why (do|did|can't|cant|am) i)/i;

/** Phrases that mark a clause as "what I wanted to do / ended up doing". */
const URGE_CUE =
  /(\bi (just |always )?|^)(want(ed)? to|feel like \w+ing|felt like \w+ing|end(ed)? up|spen[dt]\b|keep \w+ing|kept \w+ing|can(not|'t|t) stop|could(n't| not) stop|start(ed)? \w+ing|snap(ped)?\b|shout(ed)?\b|yell(ed)?\b|withdr[ae]w|shut down|avoid(ed)?\b|walk(ed)? away|storm(ed)? off|go quiet|went quiet|cry\b|cried\b|argue[d]?\b|lash(ed)? out|replay(ed)?\b)/i;

function tidy(clause: string): string {
  const t = clause.trim().replace(/^[\s,;:—–-]+|[\s,;:.—–-]+$/g, '');
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : '';
}

/**
 * Sort the person's own intake text into the four parts of a pattern for the
 * Pattern Mirror. It only ever re-arranges words they wrote:
 *   - a clause with an "I think / what if…" phrase goes under thought,
 *   - one with an "I want to / I end up…" phrase goes under urge,
 *   - feeling words they used go under feeling,
 *   - the first remaining clause is what happened.
 * Anything it can't find is left EMPTY for them to fill in — it never invents a
 * thought, feeling or urge on their behalf.
 */
export function draftPattern(situationText: string): Pattern {
  const text = situationText.replace(/[‘’]/g, "'").replace(/\s+/g, ' ').trim();
  if (!text) return { event: '', thought: '', feeling: '', urge: '' };

  const clauses = text
    .split(/(?<=[.!?])\s+/)
    .flatMap((sentence) => sentence.split(/\s*[,;]\s+|\s+(?:and then|and|but|so|then)\s+/i))
    .map((c) => c.trim())
    .filter(Boolean);

  const thoughts: string[] = [];
  const urges: string[] = [];
  const events: string[] = [];
  for (const clause of clauses) {
    if (THOUGHT_CUE.test(clause)) thoughts.push(clause);
    else if (URGE_CUE.test(clause)) urges.push(clause);
    else if (!clause.match(FEELING_RE)) events.push(clause);
  }

  const feelings: string[] = [];
  for (const m of text.matchAll(FEELING_RE)) {
    const word = m[1].toLowerCase();
    if (!feelings.includes(word)) feelings.push(word);
  }

  const firstSentence = text.split(/(?<=[.!?])\s+/)[0];
  return {
    event: shorten(tidy(events[0] ?? firstSentence), 200),
    thought: tidy(thoughts[0] ?? ''),
    feeling: tidy(feelings.join(', ')),
    urge: tidy(urges[0] ?? ''),
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
    id: 'kids-thought', gym: 'kids', title: 'Truth Lab', glyph: '💭', tint: '#E3F0FF',
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
