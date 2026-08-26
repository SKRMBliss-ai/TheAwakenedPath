/**
 * Daily prayer and reflection — the opening and closing of the ribbon.
 *
 * Both are UNIVERSAL by design: a person with no particular master, lineage, or
 * idea of God can use them fully. The prayer is addressed to "the universe, your
 * higher self, or simply your own deepest intention", so it asks for strength
 * without requiring belief. Deterministic daily rotation, with a reshuffle.
 */

/** A quiet asking — for strength to stay on the ethical path and slip less. */
export const PRAYERS: string[] = [
  'May my strength of choice grow each time I choose what is true for me and my higher self — let me make good use of my free will today.',
  'Show me how to be true to myself, so that my mind, my heart and my tongue desire and speak the same thing.',
  'Let me not be consumed by my own problems — give me the strength to help others out of theirs.',
  'May I stay on the path of what is good and true today, and make one less mistake than yesterday.',
  'May I meet everyone I cross today with patience, honesty and an open heart.',
  'Let me see the good in others before I see the fault, and answer unkindness with steadiness.',
  'May I hold my energy quietly today, act from my deepest intention, and leave each person a little lighter than I found them.',
];

/** A longer thought to carry — on the toxins of the mind and the peace beneath them. */
export interface Reflection {
  lead: string;   // the one line shown collapsed
  body: string;   // the full passage, revealed on "read"
}

export const REFLECTIONS: Reflection[] = [
  {
    lead: 'Prejudice pollutes the mind before it ever reaches another person.',
    body: 'Consider what intolerance, prejudice and bigotry do to our own emotional and mental state. We become filled with disdain for people who are different — in how they look, act, or speak. Prejudice leads us to act negatively toward those who are not like us, building barriers and ruining relationships. The mind then pigeonholes people into stereotypes, and we enter a cycle of avoiding or lashing out. When we meet many different people each day, it becomes hard to get through a day peacefully. The toxins of prejudice pollute our own mind first.',
  },
  {
    lead: 'Every toxin of the mind can be traced to an emotional or mental pain.',
    body: 'Greed, ego, envy, jealousy, attachment, possessiveness, selfishness, desire — take any of these and you can trace its effect straight to an emotional or mental pain. The toxin never stays outside us; it does its damage first within.',
  },
  {
    lead: 'Greed turns people into supplies instead of souls to cherish.',
    body: 'When flooded with greed, the mind is busy scheming how to get more, or how to take from others. It quietly changes how we see the people around us — as sources of supply for our wanting, rather than human beings to love and cherish. The relationship suffers, and with it our own peace.',
  },
  {
    lead: 'Ego spends the day trying to stand higher than everyone else.',
    body: 'When filled with ego, our thoughts, words and deeds are consumed with lifting ourselves above others. It wounds the people we treat as inferior, and those wounds come back as conflict. The relationships fray, and our own emotional and mental state frays with them.',
  },
  {
    lead: 'Which is worth more — proving you are right, or the bliss within?',
    body: 'What do we actually gain by proving we are right and others wrong? A momentary victory for the ego. But if we learn to discuss differences calmly, taking the time to understand another’s point of view, we become the real winners — what we gain is a harmonious relationship, and the quiet joy that comes with it.',
  },
];

// ── Deterministic day maths (shared shape with dailyContent) ─────────────────
function dayIndex(dateStr: string): number {
  return Math.floor(new Date(dateStr + 'T00:00:00').getTime() / 86400000);
}

export function prayerForDay(dateStr: string, shuffle = 0): string {
  const i = (((dayIndex(dateStr) + shuffle) % PRAYERS.length) + PRAYERS.length) % PRAYERS.length;
  return PRAYERS[i];
}

export function reflectionForDay(dateStr: string, shuffle = 0): Reflection {
  const i = (((dayIndex(dateStr) + shuffle) % REFLECTIONS.length) + REFLECTIONS.length) % REFLECTIONS.length;
  return REFLECTIONS[i];
}
