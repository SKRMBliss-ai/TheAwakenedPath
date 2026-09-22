/**
 * WHAT THE STORY LAB OFFERS A CHILD TO TAP, AND WHY IT IS SORTED BY FEELING.
 *
 * The walk already asked "how are you feeling right now?" one room earlier, so
 * by the time the child reaches the Thought panel the app knows something real
 * about them. Showing the same six generic clouds to a child who said "angry"
 * and a child who said "scared" throws that away — and a thought that doesn't
 * fit is worse than no thought at all, because the child concludes the app
 * isn't talking to them and taps whatever is nearest.
 *
 * So the clouds are drawn from the feeling they brought in. Twelve per feeling,
 * which is enough that the child scans rather than picks the first one, and
 * shuffled on arrival so it isn't the same three every time.
 *
 * EVENTS FOLLOW THE THOUGHT, NOT THE FEELING. "What actually happened?" is a
 * different question, and the honest answer depends on what the mind was
 * saying, not on the mood. A child whose thought was "nobody likes me" needs
 * playground events; a child whose thought was "I'm going to get in trouble"
 * needs a different set. Each thought carries a theme and the themes carry the
 * events, so this stays a dozen lists rather than ninety-six.
 */

export type Option = { text: string; icon: string; own?: boolean };

/** The situation behind a thought — what the camera would have been pointed at. */
type Theme =
  | 'rejection' | 'failure' | 'unfairness' | 'uncertainty'
  | 'loss' | 'conflict' | 'pressure' | 'comparison' | 'bright';

type Thought = Option & { theme: Theme };

/** The six the check-in offers, plus the two the founder asked for. */
export type FeelingKey =
  | 'happy' | 'excited' | 'calm' | 'sad'
  | 'angry' | 'scared' | 'worried' | 'jealous' | 'other';

const CLOUD = '☁';

const THOUGHTS: Record<FeelingKey, Thought[]> = {
  sad: [
    { text: "Nobody wants me around.", icon: CLOUD, theme: 'rejection' },
    { text: "I don't belong here.", icon: CLOUD, theme: 'rejection' },
    { text: "Nobody understands me.", icon: CLOUD, theme: 'rejection' },
    { text: "I'm all on my own.", icon: CLOUD, theme: 'loss' },
    { text: "I miss how things used to be.", icon: CLOUD, theme: 'loss' },
    { text: "It's never going to get better.", icon: CLOUD, theme: 'loss' },
    { text: "I'm not good enough.", icon: CLOUD, theme: 'failure' },
    { text: "I can't do anything right.", icon: CLOUD, theme: 'failure' },
    { text: "I ruined everything.", icon: CLOUD, theme: 'failure' },
    { text: "Everything is going wrong.", icon: CLOUD, theme: 'failure' },
    { text: "It's not fair.", icon: CLOUD, theme: 'unfairness' },
    { text: "I wish today hadn't happened.", icon: CLOUD, theme: 'loss' },
  ],
  angry: [
    { text: "It's not fair.", icon: CLOUD, theme: 'unfairness' },
    { text: "They did that on purpose.", icon: CLOUD, theme: 'conflict' },
    { text: "Nobody ever listens to me.", icon: CLOUD, theme: 'unfairness' },
    { text: "They started it.", icon: CLOUD, theme: 'conflict' },
    { text: "I always get the blame.", icon: CLOUD, theme: 'unfairness' },
    { text: "They should have known better.", icon: CLOUD, theme: 'conflict' },
    { text: "I want to shout at someone.", icon: CLOUD, theme: 'conflict' },
    { text: "Everyone else gets what they want.", icon: CLOUD, theme: 'comparison' },
    { text: "They're being mean to me.", icon: CLOUD, theme: 'conflict' },
    { text: "Why does this always happen to me?", icon: CLOUD, theme: 'unfairness' },
    { text: "I hate this.", icon: CLOUD, theme: 'conflict' },
    { text: "Nobody is on my side.", icon: CLOUD, theme: 'rejection' },
  ],
  scared: [
    { text: "Something bad is going to happen.", icon: CLOUD, theme: 'uncertainty' },
    { text: "I'm going to get in trouble.", icon: CLOUD, theme: 'pressure' },
    { text: "I can't do it.", icon: CLOUD, theme: 'failure' },
    { text: "Everyone will be looking at me.", icon: CLOUD, theme: 'pressure' },
    { text: "I'll get it wrong in front of everyone.", icon: CLOUD, theme: 'pressure' },
    { text: "I want to run away from this.", icon: CLOUD, theme: 'uncertainty' },
    { text: "I don't feel safe.", icon: CLOUD, theme: 'uncertainty' },
    { text: "What if nobody helps me?", icon: CLOUD, theme: 'uncertainty' },
    { text: "It's too big for me.", icon: CLOUD, theme: 'pressure' },
    { text: "I don't know what's coming.", icon: CLOUD, theme: 'uncertainty' },
    { text: "They'll laugh at me.", icon: CLOUD, theme: 'rejection' },
    { text: "I can't tell anyone.", icon: CLOUD, theme: 'uncertainty' },
  ],
  worried: [
    { text: "What if it all goes wrong?", icon: CLOUD, theme: 'uncertainty' },
    { text: "I keep thinking about it.", icon: CLOUD, theme: 'uncertainty' },
    { text: "I'm going to forget something important.", icon: CLOUD, theme: 'pressure' },
    { text: "I should have done it differently.", icon: CLOUD, theme: 'failure' },
    { text: "Everyone is expecting a lot from me.", icon: CLOUD, theme: 'pressure' },
    { text: "What if they're upset with me?", icon: CLOUD, theme: 'rejection' },
    { text: "There isn't enough time.", icon: CLOUD, theme: 'pressure' },
    { text: "I'm not ready.", icon: CLOUD, theme: 'pressure' },
    { text: "Something feels off and I don't know why.", icon: CLOUD, theme: 'uncertainty' },
    { text: "What if I let someone down?", icon: CLOUD, theme: 'pressure' },
    { text: "I can't stop my brain.", icon: CLOUD, theme: 'uncertainty' },
    { text: "What if I made it worse?", icon: CLOUD, theme: 'failure' },
  ],
  jealous: [
    { text: "They have what I want.", icon: CLOUD, theme: 'comparison' },
    { text: "Why not me?", icon: CLOUD, theme: 'comparison' },
    { text: "Everyone likes them more.", icon: CLOUD, theme: 'comparison' },
    { text: "They're better at it than me.", icon: CLOUD, theme: 'comparison' },
    { text: "I got left out again.", icon: CLOUD, theme: 'rejection' },
    { text: "It should have been my turn.", icon: CLOUD, theme: 'unfairness' },
    { text: "They didn't even have to try.", icon: CLOUD, theme: 'unfairness' },
    { text: "I'll never catch up.", icon: CLOUD, theme: 'comparison' },
    { text: "They took my friend away.", icon: CLOUD, theme: 'rejection' },
    { text: "Nobody notices what I do.", icon: CLOUD, theme: 'rejection' },
    { text: "It's not fair that they got it.", icon: CLOUD, theme: 'unfairness' },
    { text: "I wish I was more like them.", icon: CLOUD, theme: 'comparison' },
  ],
  happy: [
    { text: "Today went well.", icon: CLOUD, theme: 'bright' },
    { text: "Someone was kind to me.", icon: CLOUD, theme: 'bright' },
    { text: "I did something I was proud of.", icon: CLOUD, theme: 'bright' },
    { text: "I felt like I belonged.", icon: CLOUD, theme: 'bright' },
    { text: "I made someone else smile.", icon: CLOUD, theme: 'bright' },
    { text: "I'm lucky to have my people.", icon: CLOUD, theme: 'bright' },
    { text: "Something good happened for once.", icon: CLOUD, theme: 'bright' },
    { text: "I hope it stays like this.", icon: CLOUD, theme: 'uncertainty' },
    { text: "I wonder if it will last.", icon: CLOUD, theme: 'uncertainty' },
    { text: "I want to tell someone about it.", icon: CLOUD, theme: 'bright' },
    { text: "I felt properly myself today.", icon: CLOUD, theme: 'bright' },
    { text: "That was worth it.", icon: CLOUD, theme: 'bright' },
  ],
  excited: [
    { text: "I can't wait for it.", icon: CLOUD, theme: 'bright' },
    { text: "Something great is coming.", icon: CLOUD, theme: 'bright' },
    { text: "I want to tell everyone.", icon: CLOUD, theme: 'bright' },
    { text: "I hope it's as good as I imagine.", icon: CLOUD, theme: 'uncertainty' },
    { text: "What if it doesn't happen?", icon: CLOUD, theme: 'uncertainty' },
    { text: "I've been waiting ages for this.", icon: CLOUD, theme: 'bright' },
    { text: "I can't sit still.", icon: CLOUD, theme: 'bright' },
    { text: "This is going to be brilliant.", icon: CLOUD, theme: 'bright' },
    { text: "What if I mess it up?", icon: CLOUD, theme: 'pressure' },
    { text: "I want to be really good at it.", icon: CLOUD, theme: 'pressure' },
    { text: "Finally something for me.", icon: CLOUD, theme: 'bright' },
    { text: "I keep thinking about it.", icon: CLOUD, theme: 'uncertainty' },
  ],
  calm: [
    { text: "Things are alright just now.", icon: CLOUD, theme: 'bright' },
    { text: "I don't need to rush.", icon: CLOUD, theme: 'bright' },
    { text: "I can handle what comes.", icon: CLOUD, theme: 'bright' },
    { text: "It's quiet in my head.", icon: CLOUD, theme: 'bright' },
    { text: "I feel safe here.", icon: CLOUD, theme: 'bright' },
    { text: "I'm glad I have this moment.", icon: CLOUD, theme: 'bright' },
    { text: "Nothing needs fixing right now.", icon: CLOUD, theme: 'bright' },
    { text: "I did what I could today.", icon: CLOUD, theme: 'bright' },
    { text: "I wonder how long this will last.", icon: CLOUD, theme: 'uncertainty' },
    { text: "I'd like to feel like this more often.", icon: CLOUD, theme: 'bright' },
    { text: "I'm okay with not knowing yet.", icon: CLOUD, theme: 'uncertainty' },
    { text: "I can breathe properly.", icon: CLOUD, theme: 'bright' },
  ],
  other: [
    { text: "I can't do it.", icon: CLOUD, theme: 'failure' },
    { text: "They don't like me.", icon: CLOUD, theme: 'rejection' },
    { text: "It's not fair.", icon: CLOUD, theme: 'unfairness' },
    { text: "What if something goes wrong?", icon: CLOUD, theme: 'uncertainty' },
    { text: "I'm going to get in trouble.", icon: CLOUD, theme: 'pressure' },
    { text: "I always mess things up.", icon: CLOUD, theme: 'failure' },
    { text: "Nobody understands me.", icon: CLOUD, theme: 'rejection' },
    { text: "I got left out.", icon: CLOUD, theme: 'rejection' },
    { text: "I should have done better.", icon: CLOUD, theme: 'failure' },
    { text: "Everyone else finds it easy.", icon: CLOUD, theme: 'comparison' },
    { text: "I don't know what to do.", icon: CLOUD, theme: 'uncertainty' },
    { text: "Something good happened.", icon: CLOUD, theme: 'bright' },
  ],
};

/**
 * What a little camera would have seen, grouped by the kind of situation the
 * thought came out of. Ten or so each, so step 4 is a real choice too.
 */
const EVENTS: Record<Theme, Option[]> = {
  rejection: [
    { text: 'Someone said no to me', icon: '☏' },
    { text: "I wasn't invited to something", icon: '♧' },
    { text: 'Nobody sat with me', icon: '♧' },
    { text: 'They walked off without me', icon: '↝' },
    { text: 'I asked to join and they said no', icon: '♧' },
    { text: 'Someone ignored me', icon: '☏' },
    { text: 'They were talking and stopped when I came', icon: '☏' },
    { text: 'I got picked last', icon: '◷' },
    { text: 'My friend played with someone else', icon: '↝' },
    { text: 'Someone laughed at what I said', icon: '☏' },
    { text: 'Nobody answered my message', icon: '◷' },
  ],
  failure: [
    { text: 'I got an answer wrong', icon: '✧' },
    { text: "I couldn't finish it in time", icon: '◷' },
    { text: 'I forgot something I needed', icon: '✧' },
    { text: 'I dropped or broke something', icon: '✧' },
    { text: 'I lost a game', icon: '◷' },
    { text: "I tried and it didn't work", icon: '✧' },
    { text: 'Someone corrected me', icon: '☏' },
    { text: 'I got a mark I was unhappy with', icon: '✧' },
    { text: 'I had to start again', icon: '↝' },
    { text: 'I said the wrong thing', icon: '☏' },
    { text: 'I needed help and had to ask', icon: '◷' },
  ],
  unfairness: [
    { text: 'Someone else got picked instead of me', icon: '♧' },
    { text: 'I got told off for something I did not do', icon: '☏' },
    { text: 'The rule changed partway through', icon: '↝' },
    { text: 'Someone took my turn', icon: '◷' },
    { text: 'They got away with it and I did not', icon: '♧' },
    { text: 'Nobody asked what I thought', icon: '☏' },
    { text: 'I did the work and someone else got the credit', icon: '✧' },
    { text: 'I had to share when they did not', icon: '◷' },
    { text: 'I was blamed for the whole thing', icon: '☏' },
    { text: 'Someone broke a promise to me', icon: '↝' },
    { text: 'I waited and never got my go', icon: '◷' },
  ],
  uncertainty: [
    { text: 'I was told something is changing', icon: '↝' },
    { text: 'I have something coming up', icon: '◷' },
    { text: 'Somebody said we need to talk', icon: '☏' },
    { text: 'I overheard part of a conversation', icon: '☏' },
    { text: 'Plans changed without warning', icon: '↝' },
    { text: 'I am going somewhere new', icon: '↝' },
    { text: 'I do not know what happens next', icon: '◷' },
    { text: 'Something felt different at home', icon: '↝' },
    { text: 'I am waiting to find out', icon: '◷' },
    { text: 'Someone would not tell me what was wrong', icon: '☏' },
    { text: 'I saw something that worried me', icon: '✧' },
  ],
  loss: [
    { text: 'Somebody I like went away', icon: '↝' },
    { text: 'Something I had has gone', icon: '✧' },
    { text: 'A friendship changed', icon: '↝' },
    { text: 'I had to say goodbye', icon: '♧' },
    { text: 'Something I looked forward to was cancelled', icon: '◷' },
    { text: 'We moved or something moved', icon: '↝' },
    { text: 'Someone at home was sad', icon: '☏' },
    { text: 'A pet or a person is not well', icon: '✧' },
    { text: 'I remembered something from before', icon: '◷' },
    { text: 'Things are not the way they were', icon: '↝' },
    { text: 'I was on my own for a while', icon: '♧' },
  ],
  conflict: [
    { text: 'Someone said something mean to me', icon: '☏' },
    { text: 'We had an argument', icon: '☏' },
    { text: 'Somebody took something of mine', icon: '✧' },
    { text: 'Someone pushed or grabbed me', icon: '✧' },
    { text: 'They would not stop when I asked', icon: '◷' },
    { text: 'Someone told on me', icon: '☏' },
    { text: 'We disagreed about the rules', icon: '↝' },
    { text: 'Somebody shouted', icon: '☏' },
    { text: 'They said something about me to others', icon: '☏' },
    { text: 'I was interrupted again and again', icon: '◷' },
    { text: 'Someone would not let me explain', icon: '♧' },
  ],
  pressure: [
    { text: 'I have a test or a performance coming', icon: '◷' },
    { text: 'Someone is expecting something from me', icon: '☏' },
    { text: 'I have a lot to get done', icon: '◷' },
    { text: 'I had to speak in front of people', icon: '☏' },
    { text: 'There is a deadline', icon: '◷' },
    { text: 'I was asked to do something hard', icon: '✧' },
    { text: 'Everyone was watching me', icon: '♧' },
    { text: 'I promised I would do it', icon: '☏' },
    { text: 'I was being timed or scored', icon: '◷' },
    { text: 'I had to make a decision', icon: '↝' },
    { text: 'Someone said they were counting on me', icon: '☏' },
  ],
  comparison: [
    { text: 'Someone did better than me', icon: '✧' },
    { text: 'They got something I wanted', icon: '♧' },
    { text: 'Somebody was praised and I was not', icon: '☏' },
    { text: 'I saw what other people have', icon: '↝' },
    { text: 'They found it easy and I did not', icon: '✧' },
    { text: 'Someone else was chosen', icon: '♧' },
    { text: 'My friend has a new friend', icon: '↝' },
    { text: 'They were ahead of me', icon: '◷' },
    { text: 'Somebody said I should be more like them', icon: '☏' },
    { text: 'I saw their work next to mine', icon: '✧' },
    { text: 'They got more attention', icon: '♧' },
  ],
  bright: [
    { text: 'Somebody was kind to me', icon: '☏' },
    { text: 'I finished something I was working on', icon: '✧' },
    { text: 'I was asked to join in', icon: '♧' },
    { text: 'Someone noticed what I did', icon: '☏' },
    { text: 'I had a laugh with someone', icon: '↝' },
    { text: 'Something I hoped for happened', icon: '✳' },
    { text: 'I got somewhere I had been trying to get', icon: '✧' },
    { text: 'I spent time with someone I like', icon: '♧' },
    { text: 'I had a quiet bit of the day', icon: '◷' },
    { text: 'I helped somebody out', icon: '☏' },
    { text: 'Nothing much went wrong', icon: '✳' },
  ],
};

/** Normalise whatever the check-in stored ("Worried", "worried") to a key. */
function toKey(feeling: string | undefined): FeelingKey {
  const k = (feeling ?? '').trim().toLowerCase();
  return k in THOUGHTS ? (k as FeelingKey) : 'other';
}

function shuffled<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** The clouds for this child's feeling, in a fresh order each visit. */
export function thoughtsFor(feeling: string | undefined): Option[] {
  return shuffled(THOUGHTS[toKey(feeling)]).map(({ text, icon }) => ({ text, icon }));
}

/**
 * What could have happened behind the thought they picked.
 *
 * Falls back to the feeling's own first theme when the thought was typed or
 * spoken rather than tapped, so the child's own words still get a sensible set
 * rather than an empty panel.
 */
export function eventsFor(thought: string, feeling: string | undefined): Option[] {
  const key = toKey(feeling);
  const match = THOUGHTS[key].find((t) => t.text === thought)
    ?? Object.values(THOUGHTS).flat().find((t) => t.text === thought);
  const theme: Theme = match?.theme ?? THOUGHTS[key][0].theme;
  return shuffled(EVENTS[theme]);
}
