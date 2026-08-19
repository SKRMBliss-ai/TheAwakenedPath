import { VIRTUES, type Virtue } from './virtues';

/**
 * The daily rhythm — what Mind Gym shows on a given day.
 *
 * Everything here is derived from the DATE, not from storage. That means the
 * invocation, the teaching and the virtue's prayer are identical for every
 * member on the same day, with no backend call and nothing to keep in sync —
 * and they stay stable if you reload at 3pm. Shared content is what makes a
 * community able to talk about "today".
 */

/** FNV-1a. Small, fast, and gives a well-spread integer from a date string. */
function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/** Local calendar day as YYYY-MM-DD. Local, not UTC: "today" must mean the
 *  user's today, or someone in Australia gets tomorrow's practice at 9am. */
export function todayKey(d: Date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** ISO-8601 week number. Drives the GLOBAL virtue rotation so the whole
 *  community is on one virtue per week. */
export function isoWeek(date: Date = new Date()): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  // Thursday decides the year the week belongs to.
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/** Which virtue the whole community is practising this week. */
export function virtueOfWeek(date: Date = new Date()): Virtue {
  return VIRTUES[isoWeek(date) % VIRTUES.length];
}

/** Day within the virtue week, 0–6 (Monday = 0, matching the ISO week). */
export function dayOfVirtueWeek(date: Date = new Date()): number {
  return (date.getDay() + 6) % 7;
}

/** Today's prayer for the active virtue. `shuffle` lets the member draw
 *  another without changing what tomorrow shows. */
export function prayerOfDay(v: Virtue, date = new Date(), shuffle = 0): string {
  return v.prayers[(dayOfVirtueWeek(date) + shuffle) % v.prayers.length];
}

/** Three of the seven situational practices, chosen deterministically for
 *  the day so a member sees the same three all day. */
export function ideasOfDay(v: Virtue, date = new Date(), shuffle = 0) {
  const base = hashStr(todayKey(date) + 'V') + shuffle;
  const picked: number[] = [];
  for (let i = 0; picked.length < 3 && i < v.ideas.length * 2; i++) {
    const idx = (base + i) % v.ideas.length;
    if (!picked.includes(idx)) picked.push(idx);
  }
  return picked.map((i) => v.ideas[i]);
}

// ── The opening invocation ───────────────────────────────────────────────────
// Three attitudes, spoken aloud before the sit: Love, Focus, Surrender.

export interface Invocation {
  love: string;
  focus: string;
  surrender: string;
  close: string;
}

export const INVOCATIONS: Invocation[] = [
  {
    love: 'May I move through this day with an untethered heart. I choose to put my racing thoughts to sleep and drown them in the sea of love. Let compassion flow freely, without condition, toward myself and all living things.',
    focus: 'May my mind remain clear, anchored, and deeply present. When the noise of the world or the wandering of my own mind pulls at my attention, let me gently return my focus to the breath, resting in the pure, quiet awareness of this exact moment.',
    surrender: 'May I release my grip on how I think life should be, and yield completely to the flow of what is. I surrender the need for control, trusting the silence within and allowing life to unfold organically.',
    close: 'With a heart full of love, a mind perfectly focused, and a spirit entirely surrendered to the present, I step into my day.',
  },
  {
    love: 'Let my heart soften before the day can harden it. I release yesterday\'s grievances and tomorrow\'s worries into the warmth of love, holding myself and every being I meet with the same unhurried tenderness.',
    focus: 'Let my attention be single and clear, like a candle flame in a still room. Each time the mind scatters, I bring it home to the breath — needing no perfect stillness, only the willingness to return.',
    surrender: 'Let me stop rehearsing how life must go. I open my hands and give the outcome away, trusting that what unfolds is already held by something far wiser than my worry.',
    close: 'Loved, focused, and surrendered, I meet this day exactly as it is — and that is enough.',
  },
  {
    love: 'May love be the water I move through today, not the wall I build against the world. I let compassion run without condition — first toward my own tired heart, then outward to all that lives.',
    focus: 'May my awareness rest lightly and completely in this moment. When thought pulls me into past or future, I return, patient as a gardener, to the simple ground of the breath.',
    surrender: 'May I loosen my grip on control and let life carry me as a river carries a leaf. I trust the current, trust the silence beneath the noise, and stop fighting the shape of what is.',
    close: 'Heart open, mind clear, hands unclenched — I step forward and let the day arrive.',
  },
  {
    love: 'Let me begin in love rather than in fear. I lay my anxious, racing thoughts down to sleep in a sea of kindness, wishing wellness to myself and to everyone whose path I cross.',
    focus: 'Let me be here, fully, for the small and ordinary things. When my mind wanders off, I lead it gently back to the breath, resting in the quiet awareness that asks nothing and lacks nothing.',
    surrender: 'Let me release the story of how it all should be. I yield to the flow of what is, trusting the stillness within me more than the striving, and letting life unfold in its own time.',
    close: 'With a heart full of love, a mind at rest in focus, and a spirit surrendered, I begin.',
  },
  {
    love: 'May I carry an untethered heart today, bound to no resentment. I drown my restless thoughts in love and let compassion move through me freely, sparing no one — least of all myself.',
    focus: 'May my mind stay anchored and awake. Whenever the world\'s noise or my own wandering tugs at me, I return to the breath and to the pure awareness of this single moment.',
    surrender: 'May I release my need to arrange the future. I give myself to the flow of what is, trusting the silence within and letting life open like a flower that needs no instruction.',
    close: 'Loving, present, and surrendered, I walk gently into whatever comes.',
  },
  {
    love: 'Let love be wider than my thoughts today. I set down the endless commentary of the mind and rest in warmth, holding every living thing — including this fragile self — with unconditional care.',
    focus: 'Let my focus be a still lamp the wind cannot trouble. Each distraction is only an invitation to begin again, so I return to the breath without judgement, again and again.',
    surrender: 'Let me unclench. I release the illusion that I must control the day, trusting the deeper order beneath appearances and allowing life to move as it will.',
    close: 'Softened, steadied, and surrendered, I offer this day to what is.',
  },
  {
    love: 'May my heart be a sanctuary, not a courtroom. I forgive quickly, love freely, and let kindness pour out without waiting to be deserved — beginning with the one who most forgets to receive it: me.',
    focus: 'May I stay rooted in the now like a tree in the earth. When storms of thought pass through, I do not chase them; I return to the breath and let awareness hold the moment whole.',
    surrender: 'May I trust more than I grasp. I hand over my plans and my fears to the flow of what is, resting in the quiet certainty that I am carried.',
    close: 'Rooted in love, clear in focus, light in surrender — I begin the day.',
  },
  {
    love: 'Let me meet this morning with a heart that asks for nothing and gives much. I quiet the racing mind and let it dissolve in love, wishing peace to myself and to all beings, near and far.',
    focus: 'Let my attention settle like sediment in still water, leaving the moment clear. Each time it clouds with thought, I wait, breathe, and return — patient, gentle, unhurried.',
    surrender: 'Let me release the reins I was never meant to hold. I yield to what is, trusting silence over strategy, and allow the day to unfold without my anxious editing.',
    close: 'Clear-hearted and open-handed, I step into the unknown with trust.',
  },
  {
    love: 'May love be my first language today, spoken even in silence. I lay my restless thoughts to rest and let compassion flow — unconditional, unhurried — toward every living thing I touch.',
    focus: 'May I return, always, to the breath. When attention frays, I gather it without scolding, and rest in the plain, luminous awareness of exactly this.',
    surrender: 'May I stop insisting and start trusting. I release control into the flow of what is, letting the silence within guide me and life arrange itself as it knows how.',
    close: 'In love, in focus, in surrender — I say yes to this day.',
  },
  {
    love: 'Let me hold today loosely and lovingly. I drown my anxious thoughts in a sea of tenderness and let compassion move outward, sparing no living thing and forgetting no forgotten corner of my own heart.',
    focus: 'Let my mind be a clear sky through which thoughts pass like weather. I need not stop them; I return to the breath and rest, present and awake, in this exact moment.',
    surrender: 'Let me give the day away before I try to run it. I release my grip on outcomes and trust the current, allowing what is to simply be what is.',
    close: 'Whole-hearted, clear-minded, and surrendered, I begin again.',
  },
  {
    love: 'May I begin untethered from grievance, free to love. I put the racing mind to sleep in the sea of the heart and let compassion flow — first inward to soothe myself, then outward to all who suffer.',
    focus: 'May my focus rest where my feet are. When the mind runs ahead, I call it back to the breath, resting in awareness so simple it cannot be improved, only inhabited.',
    surrender: 'May I trust what I cannot see. I loosen my hold on how things should be and surrender to the flow, letting the silence within carry what my effort cannot.',
    close: 'Loved and loving, present and clear, surrendered and free — I step into the day.',
  },
  {
    love: 'Let compassion be my default and not my afterthought. I quiet the noise of judgement and let love flow without condition, holding all beings — and my own weary heart — in kindness.',
    focus: 'Let me be here for this breath, and then the next. I release the grip of past and future and return to the still, waking awareness of now, needing nothing more.',
    surrender: 'Let me yield. I stop bracing against life and lean into its flow, trusting that what is unfolding is held by a wisdom larger than my fear.',
    close: 'Tender, attentive, and at ease, I give this day to what is.',
  },
  {
    love: 'May my heart stay open even where the world is sharp. I lay my restless thoughts to sleep in love and let kindness pour freely toward every living thing — beginning with the person I am hardest on: myself.',
    focus: 'May I anchor in the breath as in a home I can always return to. Each wandering is forgiven the moment I notice it, and I rest again in the clear awareness of now.',
    surrender: 'May I release the exhausting work of control. I surrender to the flow of what is, trusting the quiet within and letting the day become itself without my interference.',
    close: 'Loving, focused, surrendered — I meet the day with open hands.',
  },
  {
    love: 'Let me move through today with an untethered heart, owing nothing to old wounds. I dissolve my racing thoughts in a sea of love and let compassion flow, without condition, to all that breathes.',
    focus: 'Let my mind stay clear, anchored, and present. When noise or wandering pulls me away, I gently return to the breath, resting in the pure awareness of this exact moment.',
    surrender: 'Let me release my grip on how life should be and yield to the flow of what is. I surrender the need for control, trusting the silence within and letting life unfold organically.',
    close: 'Heart full of love, mind perfectly focused, spirit surrendered to the present — I step into my day.',
  },
];

export function invocationOfDay(date = new Date(), shuffle = 0): Invocation {
  return INVOCATIONS[(hashStr(todayKey(date)) + shuffle) % INVOCATIONS.length];
}

// ── Today's teaching ─────────────────────────────────────────────────────────

export const TEACHINGS: string[] = [
  'Meditation is a tool that takes us closer to truth, mainly by purifying the mind — loosening the grip of ego and of not-knowing. The path has its difficulties, and consciousness rises slowly and surely through them.',
  'The mind is like a lake. When the surface is disturbed, we cannot see the bottom. Meditation stills the surface so that truth may be seen clearly beneath.',
  'It is not the length of your sit that matters most, but the quality of your presence within it. Even ten minutes of genuine attention is worth more than an hour of restless wandering.',
  'The ego is not the enemy — it is simply a case of mistaken identity. We have taken ourselves to be the wave, when all along we are the ocean.',
  'Purification is not punishment. Every time we sit, we are gently washing away the residue of habit, reaction, and unconscious conditioning — layer by layer, day by day.',
  'We do not meditate to become something we are not. We meditate to become what we already are — beneath the noise, beneath the thoughts, beneath the story of self.',
  'Distractions are not failures. They are the very material of the practice. Each time you return your attention, you are building the muscle of awareness.',
  'Consciousness rises the way the sun rises — gradually, inexorably, even on cloudy days. You cannot force the sunrise, but you can be awake when it comes.',
  'The sacred space you create outwardly is a reflection of the sacred space you are cultivating inwardly. Treat both with the same care.',
  'With every breath, something in you is already saying "I am That." Meditation is learning to hear it.',
  'A sacred sound is not merely a sound. It is a vibration you can rest your attention on until the noise around it falls quiet.',
  'The breath is the bridge between the body and the mind. When the breath is steady, the mind grows quiet. When the mind grows quiet, truth draws near.',
  'The Higher Self does not need to be sought in extraordinary places. It is here — in this breath, in this moment, behind every thought that arises.',
  'Surrender is not weakness. It is the most courageous act there is — to release the grip of the small self and trust the deeper current of what is.',
  'The nature of open awareness is that it has no centre and no edge. It is not focused on anything, yet it misses nothing. This is your natural state.',
  'Every teacher, every teaching, every moment of genuine clarity removes a little darkness — if you are willing to receive it.',
  'Whatever form you choose to hold in meditation is a door, not a destination. What matters is not the form itself, but the love and attention you bring to it.',
  'A practitioner who is sincere but imperfect is further along the path than one who is perfect but insincere. Show up honestly, every day.',
  'Inner communion is not a performance. It is a conversation between your deepest self and the source from which it comes.',
  'Open awareness is the sky. Thoughts, feelings, sensations are weather passing through. You are not the weather. You are the sky.',
];

export function teachingOfDay(date = new Date(), shuffle = 0): string {
  return TEACHINGS[(hashStr(todayKey(date) + 'T') + shuffle) % TEACHINGS.length];
}
