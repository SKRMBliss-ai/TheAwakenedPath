import type { ReflectionTag } from '../../../kids/store';

/**
 * THE LINE A CHILD TAKES AWAY, AND WHY IT IS WRITTEN RATHER THAN GENERATED.
 *
 * The Story Lab ends with another way of reading what happened — "maybe they
 * were busy" — and that is a re-reading of the EVENT. An affirmation is a
 * different kind of sentence: it is about the child, not the incident, and it
 * is the one they are asked to say out loud in the Reflection Room. Until now
 * there was no such sentence; `pathLabel` (the other way, cut to 60
 * characters) was being labelled "My affirmation", which it is not.
 *
 * These are written and reviewed rather than generated per situation. A model
 * asked to invent, live, a sentence about a distressed child's worth will
 * usually do fine and occasionally will not, and there is no reviewer standing
 * between it and the child. A fixed set can be read by the people responsible
 * for this app before it ever reaches one.
 *
 * WHAT THEY ARE ALLOWED TO SAY, and what they are not:
 *
 *   - They never deny the feeling. "I'm fine" is not on this list; "I can be
 *     scared and still do the thing" is. A child who is told they are not
 *     feeling what they are feeling learns the app is not listening.
 *   - They never promise an outcome. Nothing here says the friends will come
 *     back or the test will go well, because the app cannot know and a child
 *     will remember it promised.
 *   - They are about worth and agency, never performance. Being enough is not
 *     conditional on doing well.
 *   - They are short enough to sit on a brick and plain enough to read at six.
 *
 * The tags come from kit/reflectionUtils' deriveTag, which reads them off the
 * FEELING the child named — so the sets are written for that feeling rather
 * than for the tag's name: `brave` is what a furious child gets, `kind` is
 * what a proud one gets.
 */

/** Worry, fear, nerves — the feeling deriveTag maps to `calm`. */
const CALM = [
  'My worry is trying to keep me safe. I can thank it and carry on.',
  'I can be scared and still do the thing.',
  'This feeling is big, and it is not forever.',
  'I can slow my breath, and my breath can slow me.',
  'Not every thought that visits me is true.',
  'I have been nervous before, and I got through it.',
  'My body is allowed to feel jumpy while I stay safe.',
  'I can take one small step and see what happens.',
  'Worry is a question, not an answer.',
  'I don’t have to know everything to be okay.',
  'I can ask for help, and asking is a brave thing.',
  'The what-ifs are guesses, not news.',
  'My feet are on the floor. I am here.',
  'I can wait and see instead of deciding the worst.',
  'Quiet is something I can make for myself.',
  'I am safe enough, right now, in this moment.',
  'I can let a worry sit beside me without holding it.',
  'Being unsure is not the same as being in danger.',
  'There are people who help me when things feel big.',
  'My mind runs ahead sometimes. I can call it back.',
  'I can do hard things slowly.',
  'One breath. Then another. That is enough for now.',
  'I am learning what helps me settle.',
  'A scary thought is not a scary fact.',
  'I can be gentle with myself while I am worried.',
  'My courage is quiet, and it is still courage.',
  'I don’t have to be brave all at once.',
  'Tomorrow knows more than tonight’s worry does.',
  'I can put the worry down while I sleep.',
  'I am bigger than the feeling in my tummy.',
];

/** Anger, frustration, being cross — the feeling deriveTag maps to `brave`. */
const BRAVE = [
  'My anger tells me something matters to me.',
  'I can feel furious and still choose what I do.',
  'Big feelings are allowed. Hurting is not.',
  'I can be angry and still be kind to myself.',
  'I can walk away and come back when I am ready.',
  'My anger is a wave, and waves pass.',
  'I can say "I don’t like that" without shouting it.',
  'Something wasn’t fair, and I am allowed to notice.',
  'I can be strong without being loud.',
  'My feelings don’t make me a bad person.',
  'I can press pause before I say the thing.',
  'It is okay to need a minute.',
  'Underneath my anger there is something that got hurt.',
  'I can tell someone how it felt.',
  'I don’t have to win to be okay.',
  'My fists can unclench. So can my thoughts.',
  'I can stand up for myself and still be gentle.',
  'Frustration means I am trying something hard.',
  'I can be upset without deciding who to blame.',
  'My voice matters, even quietly.',
  'I am allowed to say no.',
  'I can let this go when I am ready, not before.',
  'Being angry doesn’t mean I was wrong to care.',
  'I can mend what I broke.',
  'I can be honest about being cross.',
  'I don’t have to hold this on my own.',
  'Letting it out beats swallowing it down.',
  'I can change my mind about how big this is.',
  'I am learning what to do with a hot feeling.',
  'I am still me underneath the angry bit.',
];

/** Sadness, loneliness, being left out — deriveTag maps this to `belonging`. */
const BELONGING = [
  'I still belong, even when I am not picked.',
  'Being left out hurts, and it does not mean I am less.',
  'I have a place, even on the days it is hard to feel it.',
  'One moment of being left out is not my whole story.',
  'I am worth knowing.',
  'There are people who are glad I exist.',
  'Feeling lonely does not mean I am alone.',
  'I can be sad and still be loved.',
  'I don’t have to change to be let in.',
  'Someone not choosing me says nothing about my worth.',
  'I can look for the people who look back.',
  'My sadness makes sense. I am allowed to have it.',
  'I belong to myself first.',
  'I can sit with this feeling and it will soften.',
  'Missing someone is love with nowhere to go.',
  'I can ask "can I join?" and see what happens.',
  'Some days are lonely. Some days are not.',
  'I matter on the quiet days too.',
  'I am allowed to take up space.',
  'I can be the one who notices someone else on their own.',
  'My name is worth saying.',
  'There is a seat for me somewhere.',
  'Being different is not being wrong.',
  'I can tell someone I felt left out.',
  'I am part of things even when I am quiet.',
  'Friendship can start again tomorrow.',
  'I don’t have to be everyone’s favourite to be enough.',
  'Sad does not last as long as it feels like it will.',
  'I am still here, and still me.',
  'I belong just as I am.',
];

/** Happy, proud, excited, hopeful — deriveTag maps this to `kind`. */
const KIND = [
  'I am allowed to feel proud of this.',
  'I did something good, and I can say so.',
  'This happy feeling is mine to keep.',
  'I can be glad for myself and glad for someone else.',
  'Good things are allowed to happen to me.',
  'I want to remember how this feels.',
  'My kindness made a difference today.',
  'I can share this feeling with someone.',
  'I noticed something lovely, and that is a skill.',
  'I can be excited without rushing it.',
  'I worked for this.',
  'I like who I was today.',
  'I can be soft with myself, not only with other people.',
  'This is worth telling someone about.',
  'Small good things count.',
  'I can enjoy this without waiting for it to end.',
  'I made someone’s day a bit lighter.',
  'I am growing, and I can feel it.',
  'Hope is allowed.',
  'I can be proud without being boastful.',
  'I did the kind thing even when it was awkward.',
  'I am learning to notice what goes well.',
  'I can say thank you to myself.',
  'There are more good days ahead of me.',
  'Being gentle is a strength.',
  'I can hold onto this on a harder day.',
  'I am glad I am me today.',
  'Joy does not need a reason.',
  'I can let myself be happy about this.',
  'I am someone who looks after people.',
];

/** Everything else, and mistakes especially — deriveTag's default, `try_again`. */
const TRY_AGAIN = [
  'I can try again.',
  'A mistake is information, not a verdict.',
  'I can do it differently next time.',
  'Getting it wrong is part of getting it right.',
  'I am allowed to be a beginner.',
  'I can ask for help and still be capable.',
  'This is hard, and hard is where I grow.',
  'I don’t have to be good at it yet.',
  'I can start again from here.',
  'One try is not the whole answer.',
  'I can put it down and come back to it.',
  'I learned something, even though it didn’t work.',
  'My best today is enough for today.',
  'I can mend it, or I can forgive it.',
  'Slow progress is still progress.',
  'I am braver than the last time I tried this.',
  'I can be patient with myself.',
  'The first go is allowed to be messy.',
  'I can say sorry and mean it.',
  'I am the kind of person who keeps going.',
  'It is okay that this took me longer.',
  'I can change my mind.',
  'What went wrong is not all of who I am.',
  'I can try a smaller step.',
  'I know more now than I did this morning.',
  'I am allowed to rest before I try again.',
  'Practice is supposed to feel awkward.',
  'I can be proud of trying, not only of winning.',
  'Next time is a real thing.',
  'I am still learning, and that is the point.',
];

/**
 * Thirty per tag.
 *
 * `other` is deliberately not its own set of thirty. deriveTag never returns
 * it — it exists on the type as a safety net — so writing thirty more lines
 * for a case nothing produces would be thirty lines nobody reviews. It shares
 * the `try_again` set, which is the one written for "a feeling we could not
 * place" anyway.
 */
export const AFFIRMATIONS: Record<ReflectionTag, string[]> = {
  calm: CALM,
  brave: BRAVE,
  belonging: BELONGING,
  kind: KIND,
  try_again: TRY_AGAIN,
  other: TRY_AGAIN,
};

/**
 * A few to choose between, stable for a given seed.
 *
 * The child picks one, so the same three must not reshuffle under their thumb
 * while they are reading them — hence the seed, which callers pass the
 * reflection's own id. A different reflection gets a different three.
 */
export function affirmationChoices(tag: ReflectionTag, seed: string, count = 3): string[] {
  const pool = AFFIRMATIONS[tag] ?? TRY_AGAIN;
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
  const picked: string[] = [];
  const used = new Set<number>();
  for (let i = 0; picked.length < Math.min(count, pool.length) && i < pool.length * 4; i++) {
    h = (Math.imul(h, 1664525) + 1013904223) | 0;
    const index = Math.abs(h) % pool.length;
    if (used.has(index)) continue;
    used.add(index);
    picked.push(pool[index]);
  }
  return picked;
}
