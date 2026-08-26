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

// ── Morning gratitude ────────────────────────────────────────────────────────
// Shown in the first half of the day, in place of a "good morning". Universal:
// addressed to "You" / Life / the Divine, usable by anyone.
export interface Gratitude {
  lead: string;   // the greeting line, always shown
  body: string;   // the fuller prayer, revealed on "open"
}

export const MORNING_GRATITUDES: Gratitude[] = [
  {
    lead: 'Thank you for the grace of waking this morning — I do not take this breath for granted.',
    body: 'The breath I breathe and the very life in my body come as a gift. Thank you for the "mundane" miracles of my day: for clean water that flows from my tap while others walk miles for it; for the food on my table and a seat to sit on; for fresh air, and light at the touch of a switch; for this body — the legs that swing me out of bed, the hands that let me touch the world. May my gratitude clear the fog of ego, so that Life itself can taste the beauty of this world through me. May my whole day be one long, quiet "thank you".',
  },
  {
    lead: 'Before anything is asked of the day, let me first be grateful it began.',
    body: 'For rest that came, for a heart that kept beating while I slept, for the ordinary safety I forget to notice — thank you. Let me not rush past the small mercies: warmth, a familiar face, the ability to stand and walk and begin again. May I carry this noticing into the hours ahead, and meet whatever comes with the steadiness of someone who has already been given enough.',
  },
  {
    lead: 'This morning is a gift I did nothing to earn — let me receive it fully.',
    body: 'A new day has been handed to me, unspent. May I not waste it in worry about what is not here yet. Thank you for another chance to be kind, to be honest, to begin again where I fell short. Let the first movement of my mind be gratitude, and the second be care for someone other than myself.',
  },
];

// ── The daily prayer — a longer, sectioned prayer, one each day ──────────────
// The come-back-daily heart of the ribbon: newness and inspiration. Collapsed to
// a title and opening line; "open the prayer" reveals the full sectioned text.
export interface DailyPrayer {
  title: string;
  opening: string;
  sections: { heading: string; body: string }[];
}

export const DAILY_PRAYERS: DailyPrayer[] = [
  {
    title: 'Prayer of Love, Truth & Surrender',
    opening: 'Beloved Presence — whether I call You God, the Conscious Light, the Supreme Self, or simply Love — I know You are already here.',
    sections: [
      { heading: 'The Call to Presence', body: 'Whether I call You God, the Conscious Light, the Supreme Self, the Inner Wisdom, or simply Love — I know You are already here. You have never been separate from me. Today I come with an open heart. Not to achieve, not to prove, not to become special. I simply come home.' },
      { heading: 'Remembering the True Self', body: 'Help me remember who I truly am — that beneath every thought, fear, desire, success and failure, I am created in Love. May this practice not be another task, but an act of love. Teach me to love Truth more than my opinions, awareness more than my habits, and serving others more than serving my ego.' },
      { heading: 'The Vow of Faith and Light', body: 'Today I choose faith. I believe in the possibility of the highest life. As the wise have taught: believe in what you intend to do, hold it strongly in mind, and it will come. May my intention today be pure; may every thought I nourish bring more light into this world; may every action become an expression of kindness. May my thoughts, senses, speech and actions be honest, be true, be filled with love.' },
      { heading: 'Healing and Harmony', body: 'I invite light into every part of my being. May every cell remember the intelligence with which it was made. May my body become a peaceful temple, my mind become clear, my heart become gentle, and my soul shine freely.' },
      { heading: 'Seeking Inner Wisdom', body: 'Guide me today. Remove what is false, every illusion, every fear that keeps me small. If I cling to what limits me, give me the courage to let it go. May I approve only those desires that lead to freedom, love, truth and service. Help me recognise the quiet guidance that is always present — and trust it, and follow it.' },
      { heading: 'The Path of Compassion', body: 'Today I choose love. Let me see the good in every person, even when it is hidden, even when my mind wants to judge. Every soul carries burdens I cannot see; let my first response be compassion. Teach me to smile at those who seem worried, to forgive quickly, to speak gently, to listen deeply. For no act of love is ever wasted — every kind thought, word and action becomes light. Make me an instrument of that Light.' },
      { heading: 'Entering the Silence', body: 'As I grow still, I release all expectations. I seek no visions, only Truth. If peace comes, I welcome it; if restlessness comes, I welcome it; if nothing seems to happen, I remain faithful — for every sincere moment spent in Presence transforms me, even when I cannot see it. Teach me patience, humility, perseverance, and to love the stillness for its own sake.' },
      { heading: 'Ultimate Surrender', body: 'Sit with me now. Breathe through me, see through my eyes, love through my heart, work through my hands, speak through my words. May my life become a prayer, my heart become a home for Presence. And may I never forget that You have always been here — loving me, waiting for me simply to become still. I surrender this day into Your hands. May only Truth remain. May only Love remain.' },
    ],
  },
  {
    title: 'Prayer of the Open Day',
    opening: 'This day is unwritten. Let me meet it awake, and leave it kinder than I found it.',
    sections: [
      { heading: 'Beginning', body: 'I do not know what this day holds, and I do not need to. Let me stop bracing against it and simply meet it — one moment, one breath, one person at a time. May I begin from stillness rather than from fear.' },
      { heading: 'Intention', body: 'Let my thoughts today serve clarity, my words serve kindness, my actions serve someone other than myself. When I am tempted to perform, let me choose honesty. When I am tempted to win, let me choose understanding.' },
      { heading: 'When I Slip', body: 'I will forget all of this many times before nightfall. Let the forgetting not become despair — let each returning be the practice. Give me the humility to begin again without punishing myself for having drifted.' },
      { heading: 'For Others', body: 'Everyone I meet today is carrying something I cannot see. Let my first response be gentleness. Let me leave each person a little lighter — a smile, a moment of real attention, one small kindness that costs me nothing and means everything.' },
      { heading: 'Release', body: 'At the day’s end, let me set down what I could not finish and what I could not fix. I did what I could. May that be enough, and may I rest.' },
    ],
  },
  {
    title: 'Prayer of the Quiet Heart',
    opening: 'Let me want less, notice more, and love the ordinary hours as they pass.',
    sections: [
      { heading: 'Quieting', body: 'So much of my noise is wanting — to have more, to be seen, to be right. For a moment, let me want nothing. Let me sit in what is already here and find it, somehow, enough.' },
      { heading: 'Seeing', body: 'Wake me to the miracles I walk past: the light, the breath, the face across the table, the fact of being alive at all. Let gratitude clear the fog so that life can be tasted fully, not merely used.' },
      { heading: 'Softening', body: 'Where I have hardened — into judgment, into grievance, into the need to prove — let me soften. Loosen my grip on being right. What I gain by proving others wrong is only a moment’s victory; what I lose is the peace I was made for.' },
      { heading: 'Serving', body: 'Show me one person today I can help without being asked, one burden I can lighten, one bit of goodness I can help someone see in themselves. Let me be, for a few small hours, an instrument of something larger than my own concerns.' },
      { heading: 'Resting', body: 'And when the day is done, let me trust that every sincere moment counted — the seen and the unseen alike. Let me lay it down, and be still, and be grateful.' },
    ],
  },
];

// ── Deterministic day maths (shared shape with dailyContent) ─────────────────
function dayIndex(dateStr: string): number {
  return Math.floor(new Date(dateStr + 'T00:00:00').getTime() / 86400000);
}

export function gratitudeForDay(dateStr: string, shuffle = 0): Gratitude {
  const i = (((dayIndex(dateStr) + shuffle) % MORNING_GRATITUDES.length) + MORNING_GRATITUDES.length) % MORNING_GRATITUDES.length;
  return MORNING_GRATITUDES[i];
}

export function dailyPrayerForDay(dateStr: string, shuffle = 0): DailyPrayer {
  const i = (((dayIndex(dateStr) + shuffle) % DAILY_PRAYERS.length) + DAILY_PRAYERS.length) % DAILY_PRAYERS.length;
  return DAILY_PRAYERS[i];
}

export function prayerForDay(dateStr: string, shuffle = 0): string {
  const i = (((dayIndex(dateStr) + shuffle) % PRAYERS.length) + PRAYERS.length) % PRAYERS.length;
  return PRAYERS[i];
}

export function reflectionForDay(dateStr: string, shuffle = 0): Reflection {
  const i = (((dayIndex(dateStr) + shuffle) % REFLECTIONS.length) + REFLECTIONS.length) % REFLECTIONS.length;
  return REFLECTIONS[i];
}
