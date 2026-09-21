import type { ReflectionTag } from '../../../kids/store';

type Affirmations = Record<ReflectionTag, string[]>;

export const AFFIRMATIONS: Affirmations = {
  brave: [
    "I am brave, even when I'm scared.",
    'I can do hard things.',
    'My courage grows every day.',
    'I am stronger than my fears.',
    'I choose to be brave, step by step.',
    "Fear doesn't stop me from trying.",
    'I believe in my own strength.',
    'I can face anything with courage.',
    'My brave heart leads the way.',
    'I am brave, and I keep going.',
  ],
  calm: [
    'I can find peace inside myself.',
    'My breath brings me calm.',
    'I am safe, and I can relax.',
    'Peace lives in me right now.',
    'I choose calm over worry.',
    'My mind is clear and peaceful.',
    'I take one slow breath at a time.',
    'Calm is my natural state.',
    'I let worries float away gently.',
    'Peace is always within reach.',
  ],
  kind: [
    'Kindness starts with me.',
    'I am kind to others and myself.',
    'My kindness makes a difference.',
    'I choose love and gentleness today.',
    'Kindness grows when I share it.',
    'I am kinder every single day.',
    'My words and actions are kind.',
    'Kindness is my superpower.',
    'I spread warmth wherever I go.',
    'My kind heart changes the world.',
  ],
  belonging: [
    'I belong right here, right now.',
    'I am worthy of love and friendship.',
    "I belong, even when I'm different.",
    'My voice matters in this world.',
    'I am exactly where I need to be.',
    'People care about me, truly.',
    'I belong to a community that loves me.',
    'My place in this world is real.',
    'I am accepted, just as I am.',
    'Belonging is my birthright.',
  ],
  try_again: [
    'I can try again and do better.',
    'Mistakes help me learn and grow.',
    'Every new day brings a fresh start.',
    'I am getting better every time.',
    'I choose to try once more.',
    'My effort matters, even when I stumble.',
    'I learn something new each time I try.',
    'I am resilient and I bounce back.',
    'Tomorrow is a new chance for me.',
    'I grow stronger with every try.',
  ],
  other: [
    'I am enough, just as I am.',
    'Good things are coming my way.',
    'I am grateful for this moment.',
    'My future is bright and full.',
    'I choose happiness today.',
    'I am learning and growing.',
    'My feelings matter and are valid.',
    'I can create the life I want.',
    'Every moment is a new beginning.',
    'I am becoming who I want to be.',
  ],
};

export function getAffirmationsForTag(tag: ReflectionTag): string[] {
  return AFFIRMATIONS[tag] ?? AFFIRMATIONS.other;
}

export function pickThreeAffirmations(tag: ReflectionTag): string[] {
  const all = getAffirmationsForTag(tag);
  if (all.length <= 3) return all;

  const shuffled = [...all].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}
