/**
 * The Nine Virtues — a 63-day arc, one virtue per week.
 *
 * Rotation is GLOBAL (by ISO week), not per-user. Everyone in Mind Gym is on
 * the same virtue in the same week, so the community has something shared to
 * talk about — the live session, the members list and the feed all key off it.
 * Per-user progress lives inside the shared week (0–7 days practised).
 */

export interface VirtueIdea {
  /** Emoji marker — kept short so the idea reads as one line. */
  icon: string;
  /** WHERE the practice happens — a concrete moment in an ordinary day. */
  place: string;
  /** HOW to practise it there. */
  how: string;
}

export interface Virtue {
  key: string;
  name: string;
  /** Position in the arc, 1–9. */
  week: number;
  /** One-line definition. */
  desc: string;
  /** Seven prayers — one surfaces per day of the week. */
  prayers: string[];
  /** Seven situational practices — three surface per day. */
  ideas: VirtueIdea[];
}

export const VIRTUES: Virtue[] = [
  {
    key: 'sincerity',
    name: 'Sincerity',
    week: 1,
    desc: 'Sincerity is the alignment of your inner state with your outer expression — saying what you mean, meaning what you say, and living without the gap between the two.',
    prayers: [
      'May I speak only what I truly feel today, without the mask of what seems acceptable.',
      'Let me meet this day as I actually am — not as I wish to appear.',
      'May sincerity be the ground beneath every word and action, whether anyone is watching or not.',
      'Let me close the gap between my inner life and what I show the world, even by one honest inch.',
      'May I be real with myself first, so I can be real with others.',
      'Where I am tempted to perform, may I pause and choose honesty instead.',
      'Let sincerity be the quiet thread that runs through everything I do today — seen or unseen.',
    ],
    ideas: [
      { icon: '🪞', place: 'Morning mirror', how: 'Before you leave the bathroom, say one true thing to yourself — not affirmation, not criticism. Something you actually know. "I am nervous about the meeting." "I did not sleep enough." Simple truth.' },
      { icon: '📱', place: 'Next message you type', how: 'Before sending any text or email, ask: does this say what I actually mean? Rewrite the first one that doesn\'t.' },
      { icon: '🍽️', place: 'Family meal', how: 'When asked "how was your day?" — resist the default "fine". Give one real answer, even briefly.' },
      { icon: '🧘', place: 'Start of your sit', how: 'Spend the first 60 seconds of meditation just checking in: how are you actually? Drop the spiritual pretence. Begin from truth.' },
      { icon: '🏢', place: 'Work meeting', how: 'Notice once today where you say something to smooth the room rather than because it\'s true. Note it privately — no need to correct, just see it.' },
      { icon: '🚶', place: 'A walk', how: 'Walk without your phone. Notice what you actually think about when there is nothing performing to. That stream of thought is the sincere you.' },
      { icon: '📓', place: 'Evening journal', how: 'Write one sentence that begins: "What I didn\'t say today but meant was…"' },
    ],
  },
  {
    key: 'commitment',
    name: 'Commitment',
    week: 2,
    desc: 'Commitment is continuing to do what you said you would do, long after the mood that made the vow has passed.',
    prayers: [
      'May I show up today not because I feel like it, but because I said I would.',
      'Let commitment be less about willpower and more about love for what matters.',
      'May I treat my practice as a promise I keep to the deepest part of myself.',
      'Where the mood is low, may commitment be the floor I stand on anyway.',
      'Let me notice what I abandon when it gets difficult — and gently return.',
      'May I see each act of follow-through, however small, as an offering.',
      'Let today\'s sit be the proof that my word to myself means something.',
    ],
    ideas: [
      { icon: '⏰', place: 'Before bed', how: 'Set your alarm for the same time tomorrow as you sat today. Commitment lives in the preparation, not just the act.' },
      { icon: '📋', place: 'One task you\'ve been avoiding', how: 'Give it five minutes. Not to finish it — just to begin. Commitment is the act of starting, again and again.' },
      { icon: '🤝', place: 'A promise to someone else', how: 'Follow through on one small thing you said you\'d do — a reply, a call, an errand — without being reminded.' },
      { icon: '🧘', place: 'When you want to end the sit early', how: 'Stay for two more minutes past the point you want to leave. That extra two minutes is where commitment is actually built.' },
      { icon: '🌧️', place: 'On a difficult morning', how: 'Sit anyway. Even five minutes. Note in your log: "difficult day, sat anyway." That entry is worth ten easy sits.' },
      { icon: '📖', place: 'Your daily reading', how: 'Read it on the one morning you least feel like it. Let commitment carry you when inspiration does not.' },
      { icon: '🌱', place: 'Something you planted but forgot', how: 'Water a plant, tend a relationship, return to a project — something living that needs your consistent attention to survive.' },
    ],
  },
  {
    key: 'patience',
    name: 'Patience',
    week: 3,
    desc: 'Patience is remaining steady while life unfolds on its own timeline, without forcing it onto yours.',
    prayers: [
      'May I stop rushing the river today — it knows its own way to the sea.',
      'Let me hold what is unresolved without trying to resolve it before its time.',
      'May patience make me wider, not smaller — large enough to wait without anxiety.',
      'Let me remember: the lotus does not hurry. It rises at exactly the right moment.',
      'May I breathe into every delay, queue, and waiting room as an opportunity, not an obstacle.',
      'Let me notice where impatience lives in my body today — jaw, chest, hands — and soften there.',
      'May I trust that what is growing beneath the surface does not need my interference to bloom.',
    ],
    ideas: [
      { icon: '☕', place: 'Making tea or coffee', how: 'Do it slowly. Don\'t multitask. Watch the water boil. Patience begins with the smallest things.' },
      { icon: '🚦', place: 'Any queue or traffic', how: 'Instead of checking your phone, breathe. Use the wait as a 5-breath practice. The queue becomes a meditation bell.' },
      { icon: '👂', place: 'A conversation', how: 'Let the other person finish completely before you begin to form your response. True patience is listening without the next sentence already loaded.' },
      { icon: '🌱', place: 'Your own progress', how: 'Look back at where you were six weeks ago, not where you think you should be today. Growth is rarely visible in the present tense.' },
      { icon: '😤', place: 'When something irritates you', how: 'Count to seven before responding. Not to suppress — to create a space where choice lives instead of reaction.' },
      { icon: '📵', place: 'First 30 minutes of the day', how: 'No phone. Let the morning arrive at its own pace. Patience with the morning trains patience with everything else.' },
      { icon: '🎨', place: 'An unfinished project', how: 'Work on something you cannot finish today — a sketch, a plan, a piece of writing. Practice beginning without demanding completion.' },
    ],
  },
  {
    key: 'acceptance',
    name: 'Acceptance',
    week: 4,
    desc: 'Acceptance is meeting what is actually here — not what should be here — without immediate resistance or the need to change it.',
    prayers: [
      'May I stop arguing with what is already true, and begin from there.',
      'Let me accept this day as it arrives, not as I ordered it.',
      'May acceptance soften what resistance has made rigid in me.',
      'Let me hold even the difficult parts of today with an open hand, not a clenched fist.',
      'May I stop waiting for circumstances to be better before I allow myself to be at peace.',
      'Let me practise saying "this is what is" — and feel how much energy that frees.',
      'May I accept myself exactly as I am today, as the starting point, not the problem.',
    ],
    ideas: [
      { icon: '🌦️', place: 'The weather', how: 'Whatever it is — accept it physically. Go outside in it for five minutes without complaint. Acceptance is a bodily practice before it is a mental one.' },
      { icon: '😔', place: 'An emotion you don\'t like', how: 'Name it: "I am feeling frustrated." Don\'t try to fix or suppress it. Sit with it for 60 seconds the way you\'d sit with a guest.' },
      { icon: '📰', place: 'A news story that upsets you', how: 'Read it, feel it — then notice the moment you start resisting reality. "This shouldn\'t be." Acceptance doesn\'t mean approval; it means acknowledging what is.' },
      { icon: '🪟', place: 'Someone else\'s behaviour', how: 'Notice one moment today where you want someone to be different. Instead of pushing against it, ask: "what if this is exactly who they are right now?"' },
      { icon: '🧘', place: 'A distracted sit', how: 'When the meditation is scattered, accept it as the meditation you are actually having, not the one you planned. The acceptance itself is the practice.' },
      { icon: '🔲', place: 'An unmet expectation', how: 'When something doesn\'t go as planned, say quietly: "This is the new starting point." Write that down if it helps.' },
      { icon: '💬', place: 'Feedback or criticism', how: 'Receive one piece of feedback today without defending yourself. Let it land, even if just for a moment.' },
    ],
  },
  {
    key: 'tolerance',
    name: 'Tolerance',
    week: 5,
    desc: 'Tolerance is the ability to remain open and non-reactive in the presence of what is different, difficult, or disagreeable.',
    prayers: [
      'May I hold difference today without needing to make it wrong.',
      'Let me be large enough that contrast does not disturb me.',
      'May I remember that what irritates me most in others often lives quietly in me too.',
      'Let tolerance make me curious today, where I would otherwise be dismissive.',
      'May I stay in the room — literally and figuratively — when I want to leave.',
      'Let me practise the pause between trigger and response as my daily sadhana.',
      'May I find one thing to appreciate in the person I find most difficult today.',
    ],
    ideas: [
      { icon: '🗣️', place: 'A disagreement', how: 'Let someone hold a view you don\'t share without trying to change them. Ask one genuine question instead. Tolerance is curiosity about the other.' },
      { icon: '🍲', place: 'A food you dislike', how: 'Eat one bite of something you normally avoid. Physical tolerance trains the same muscle as emotional tolerance.' },
      { icon: '📺', place: 'Media you disagree with', how: 'Read or watch five minutes of something from a perspective you usually dismiss. Notice the discomfort — that is exactly where tolerance grows.' },
      { icon: '🚇', place: 'Public transport or a crowd', how: 'Be present in a noisy, chaotic space without withdrawing into your phone. Let the world be as it is for ten minutes.' },
      { icon: '🪞', place: 'Your own flaws', how: 'Name one personal flaw you\'re impatient with. "I am still quick to judge." Be tolerant of that — self-tolerance comes first.' },
      { icon: '👨‍👩‍👧', place: 'A family interaction', how: 'Let a family member be exactly who they are — with their habits, their repetitions, their quirks — without correcting or withdrawing.' },
      { icon: '🧘', place: 'An uncomfortable sensation in the sit', how: 'When the knee aches or the back tightens, stay. Don\'t move for two more minutes. Physical tolerance in practice trains it everywhere.' },
    ],
  },
  {
    key: 'caring',
    name: 'Caring',
    week: 6,
    desc: 'Caring is giving your genuine attention and warmth to another without the need for them to deserve it first.',
    prayers: [
      'May I do one thing today not for recognition, but purely because someone needs it.',
      'Let me notice what needs tending around me — and tend it.',
      'May caring flow from me naturally today, as breathing flows, without effort or expectation.',
      'Let me give the warmth I would wish to receive, freely and without account.',
      'May I be the person today who asks "are you alright?" and actually waits for the answer.',
      'Let caring begin with my own body and heart, so I can offer it outward from fullness, not depletion.',
      'May I remember that small acts of care — a look, a word, a moment of attention — are never small to the one who receives them.',
    ],
    ideas: [
      { icon: '📞', place: 'Your phone', how: 'Call or message one person you haven\'t spoken to in a while — not to catch up, but simply to say you thought of them.' },
      { icon: '🍵', place: 'Someone else\'s cup', how: 'Make tea or coffee for someone without being asked. Caring begins with the small, physical, unremarkable acts.' },
      { icon: '👀', place: 'A stranger', how: 'Make eye contact and offer a genuine smile. Not a performance — a moment of real acknowledgement that another person exists.' },
      { icon: '🧹', place: 'Shared space', how: 'Tidy something in a shared space that isn\'t "your" mess. Caring for the shared world is caring for others.' },
      { icon: '❓', place: 'A check-in', how: 'Ask someone "how are you actually doing?" — and when they answer, listen fully. Don\'t offer a solution; just receive.' },
      { icon: '🌿', place: 'Something living', how: 'Water a plant, feed a bird, tend an animal. Caring for non-human life extends and softens the caring impulse.' },
      { icon: '📝', place: 'A note', how: 'Leave a handwritten note of appreciation for someone in your home or workplace. Unexpected, specific, and sincere.' },
    ],
  },
  {
    key: 'gentleness',
    name: 'Gentleness',
    week: 7,
    desc: 'Gentleness is handling what is fragile — including people, including yourself — with care and without force.',
    prayers: [
      'May I speak today as if my words were hands, and use them gently.',
      'Let me notice where I am harsh with myself, and soften there first.',
      'May I move through today without hurrying, without forcing, without hardness.',
      'Let gentleness be my response where impatience would be my habit.',
      'May I handle this moment — and this person — as if they were precious. Because they are.',
      'Let me practise the quiet strength that does not need to be forceful to be effective.',
      'May I end this day having touched at least one thing — a word, a task, an interaction — more gently than I normally would.',
    ],
    ideas: [
      { icon: '🤲', place: 'Physical handling', how: 'Pick things up gently today — your cup, your phone, a door handle. Gentleness in the body trains gentleness in the mind.' },
      { icon: '📢', place: 'Your voice', how: 'Speak five decibels softer than your usual volume in one conversation. Notice what happens to the exchange.' },
      { icon: '💭', place: 'Your self-talk', how: 'When you make a mistake today, say to yourself what you would say to a friend who made the same mistake. That is gentleness turned inward.' },
      { icon: '🧸', place: 'With a child or animal', how: 'Spend five minutes at their pace, in their world, without agenda. Gentleness is matching the pace of what is tender.' },
      { icon: '🖊️', place: 'Your writing', how: 'Write slowly today — a message, a note, even a shopping list. Hasty strokes are rarely gentle. Precision and care in small things.' },
      { icon: '🌙', place: 'Your evening', how: 'End the day without screens for 20 minutes. Let the transition to sleep be gentle — a practice in handling yourself with care.' },
      { icon: '🧘', place: 'The breath', how: 'In your sit, breathe so gently that a feather in front of your nose would barely stir. The subtlety trains the quality.' },
    ],
  },
  {
    key: 'graciousness',
    name: 'Graciousness',
    week: 8,
    desc: 'Graciousness is receiving and giving with openness, warmth, and ease — without awkwardness, resentment, or keeping score.',
    prayers: [
      'May I receive a compliment today without deflecting it, and a difficulty without resenting it.',
      'Let me give and receive today as if both are gifts.',
      'May graciousness make me generous in spirit where smallness would be the easier default.',
      'Let me remember: how I treat people when I gain nothing from it — that is the measure.',
      'May I hold success and failure with the same open, unhurried grace.',
      'Let me be the person in the room who makes others feel welcome, simply by how I am.',
      'May I notice when I am ungracious — in thought, in word — and gently return to openness.',
    ],
    ideas: [
      { icon: '🎁', place: 'Receiving help', how: 'Let someone help you today without minimising it: "thank you" — full stop, no "but you didn\'t have to". Receive the gift graciously.' },
      { icon: '🏆', place: 'Someone else\'s success', how: 'Celebrate one person\'s achievement today with genuine warmth — not performatively, not with a "but" — just joy for them.' },
      { icon: '🚪', place: 'An entrance or exit', how: 'Hold a door. Let someone go first. These small rituals of graciousness are the physical vocabulary of the quality.' },
      { icon: '🍴', place: 'A shared meal', how: 'Be the last to serve yourself. Attend to others first. Graciousness at the table is graciousness in miniature.' },
      { icon: '🤐', place: 'When you disagree', how: 'Disagree graciously: acknowledge what is right in the other view before offering yours. "You\'re right that… and I also think…"' },
      { icon: '📧', place: 'A difficult email or message', how: 'Reply to one challenging message more warmly than it deserves. Graciousness doesn\'t wait for the other person to go first.' },
      { icon: '🌟', place: 'The close of the day', how: 'Name three people who made your day easier — acknowledge them inwardly, or in writing. Graciousness is noticing what you receive.' },
    ],
  },
  {
    key: 'detachment',
    name: 'Detachment',
    week: 9,
    desc: 'Detachment is engaging fully with life while remaining free from the compulsion to control its outcome or possess its fruits.',
    prayers: [
      'May I act today with full effort and hold the result with open hands.',
      'Let me love what I love without clinging to it — love freely given, freely held.',
      'May I remember: I am the sky, not the weather passing through it.',
      'Let me do my part completely, and release what is not mine to determine.',
      'May detachment bring lightness today, not distance — freedom, not indifference.',
      'Let me notice where I am grasping — at outcomes, at approval, at certainty — and gently open the hand.',
      'May I end this day without checking the result of everything I gave today. Give, act, release.',
    ],
    ideas: [
      { icon: '📤', place: 'After sending important work', how: 'Once sent, do not check for a response for one hour. Practice releasing the outcome the moment it leaves your hands.' },
      { icon: '🧹', place: 'Clearing something out', how: 'Give away one object you have been keeping "just in case". Detachment begins with things before it reaches thoughts.' },
      { icon: '🌊', place: 'A result you care about', how: 'Notice one area of life where you are outcome-obsessed. Write: "I will do my part fully and release the rest." Then do it.' },
      { icon: '👁️', place: 'Your meditation', how: 'Sit without wanting the meditation to be deep, clear, or peaceful. Let it be whatever it is. Detachment from the quality of the sit trains detachment from everything.' },
      { icon: '💬', place: 'A conversation', how: 'Say something true without needing the other person to agree with it. Let your words land without controlling how they are received.' },
      { icon: '📵', place: 'Social media or messages', how: 'Post or send something without checking back for reactions for three hours. Count the urge to check — that urge is what detachment dissolves.' },
      { icon: '🎭', place: 'A role you play', how: 'Notice one role — parent, professional, practitioner — that you are gripping tightly. For one hour, hold it more lightly. You are more than any role.' },
    ],
  },
];

export const VIRTUE_BY_KEY: Record<string, Virtue> = Object.fromEntries(
  VIRTUES.map((v) => [v.key, v]),
);
