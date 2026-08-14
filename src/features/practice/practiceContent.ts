/**
 * Daily Practice — the shared content spine.
 *
 * Everything here is chosen from the calendar date alone. That is deliberate:
 * the practice is meant to be walked through together in the live room, so the
 * guide reading it aloud and everyone sitting with them must land on the same
 * invocation, the same virtue and the same prayer on the same morning. The
 * original practice log anchored its virtue week to a per-device localStorage
 * date, which would have put every member on a different virtue — fine for a
 * solitary journal, wrong for a shared sit.
 *
 * The weekly email computes the same week from the same epoch (see
 * functions/practiceContent.js), so what the letter names on Friday is what the
 * room is sitting with.
 */

export interface Invocation {
  love: string;
  focus: string;
  surrender: string;
  close: string;
}

export interface VirtueIdea {
  icon: string;
  place: string;
  how: string;
}

export interface Virtue {
  key: string;
  name: string;
  week: number;
  desc: string;
  prayers: string[];
  ideas: VirtueIdea[];
}

/**
 * Week 1 of the virtue cycle opens on this Monday, UTC.
 *
 * A Monday keeps a virtue week inside a calendar week, so "this week's virtue"
 * means the same thing in the room, in the app and in Friday's letter. Moving
 * this date reshuffles which virtue everyone is on — it is a content decision,
 * not a config knob, so change it only between cycles.
 */
export const PRACTICE_EPOCH = Date.UTC(2026, 7, 17); // Mon 17 Aug 2026

/** Days elapsed since the epoch, floored at 0 so a pre-launch clock is harmless. */
export function practiceDayNumber(date: Date = new Date()): number {
  const d = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.max(0, Math.round((d - PRACTICE_EPOCH) / 86400000));
}

/** Local calendar date as YYYY-MM-DD — the key everything is logged against. */
export function practiceDateKey(date: Date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`;
}

/** FNV-1a over the date string. Stable for everyone on a given day. */
function hashDate(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/* ── The Three Sacred Attitudes ────────────────────────────────────────────
   Spoken aloud to open the sit. One is drawn per day from the date. */
export const INVOCATIONS: Invocation[] = [
  {
    love: "May I move through this day with an untethered heart. I choose to put my racing thoughts to sleep and drown them in the sea of love. Let compassion flow freely, without condition, toward myself and all living things.",
    focus: "May my mind remain clear, anchored, and deeply present. When the noise of the world or the wandering of my own mind pulls at my attention, let me gently return my focus to the breath, resting in the pure, quiet awareness of this exact moment.",
    surrender: "May I release my grip on how I think life should be, and yield completely to the flow of what is. I surrender the need for control, trusting the silence within and allowing life to unfold organically.",
    close: "With a heart full of love, a mind perfectly focused, and a spirit entirely surrendered to the present, I step into my day.",
  },
  {
    love: "Let my heart soften before the day can harden it. I release yesterday's grievances and tomorrow's worries into the warmth of love, holding myself and every being I meet with the same unhurried tenderness.",
    focus: "Let my attention be single and clear, like a candle flame in a still room. Each time the mind scatters, I bring it home to the breath — needing no perfect stillness, only the willingness to return.",
    surrender: "Let me stop rehearsing how life must go. I open my hands and give the outcome to the Divine, trusting that what unfolds is already held by something far wiser than my worry.",
    close: "Loved, focused, and surrendered, I meet this day exactly as it is — and that is enough.",
  },
  {
    love: "May love be the water I move through today, not the wall I build against the world. I let compassion run without condition — first toward my own tired heart, then outward to all that lives.",
    focus: "May my awareness rest lightly and completely in this moment. When thought pulls me into past or future, I return, patient as a gardener, to the simple ground of the breath.",
    surrender: "May I loosen my grip on control and let life carry me as a river carries a leaf. I trust the current, trust the silence beneath the noise, and stop fighting the shape of what is.",
    close: "Heart open, mind clear, hands unclenched — I step forward and let the day arrive.",
  },
  {
    love: "Let me begin in love rather than in fear. I lay my anxious, racing thoughts down to sleep in a sea of kindness, wishing wellness to myself and to everyone whose path I cross.",
    focus: "Let me be here, fully, for the small and ordinary things. When my mind wanders off, I lead it gently back to the breath, resting in the quiet awareness that asks nothing and lacks nothing.",
    surrender: "Let me release the story of how it all should be. I yield to the flow of what is, trusting the stillness within me more than the striving, and letting life unfold in its own time.",
    close: "With a heart full of love, a mind at rest in focus, and a spirit surrendered, I begin.",
  },
  {
    love: "May I carry an untethered heart today, bound to no resentment. I drown my restless thoughts in love and let compassion move through me freely, sparing no one — least of all myself.",
    focus: "May my mind stay anchored and awake. Whenever the world's noise or my own wandering tugs at me, I return to the breath and to the pure awareness of this single moment.",
    surrender: "May I release my need to arrange the future. I give myself to the flow of what is, trusting the silence within and letting life open like a flower that needs no instruction.",
    close: "Loving, present, and surrendered, I walk gently into whatever comes.",
  },
  {
    love: "Let love be wider than my thoughts today. I set down the endless commentary of the mind and rest in warmth, holding every living thing — including this fragile self — with unconditional care.",
    focus: "Let my focus be a still lamp the wind cannot trouble. Each distraction is only an invitation to begin again, so I return to the breath without judgement, again and again.",
    surrender: "Let me unclench. I release the illusion that I must control the day, trusting the deeper order beneath appearances and allowing life to move as it will.",
    close: "Softened, steadied, and surrendered, I offer this day to the Divine.",
  },
  {
    love: "May my heart be a sanctuary, not a courtroom. I forgive quickly, love freely, and let kindness pour out without waiting to be deserved — beginning with the one who most forgets to receive it: me.",
    focus: "May I stay rooted in the now like a tree in the earth. When storms of thought pass through, I do not chase them; I return to the breath and let awareness hold the moment whole.",
    surrender: "May I trust more than I grasp. I hand over my plans and my fears to the flow of what is, resting in the quiet certainty that I am carried.",
    close: "Rooted in love, clear in focus, light in surrender — I begin the day.",
  },
  {
    love: "Let me meet this morning with a heart that asks for nothing and gives much. I quiet the racing mind and let it dissolve in love, wishing peace to myself and to all beings, near and far.",
    focus: "Let my attention settle like sediment in still water, leaving the moment clear. Each time it clouds with thought, I wait, breathe, and return — patient, gentle, unhurried.",
    surrender: "Let me release the reins I was never meant to hold. I yield to what is, trusting silence over strategy, and allow the day to unfold without my anxious editing.",
    close: "Clear-hearted and open-handed, I step into the unknown with trust.",
  },
  {
    love: "May love be my first language today, spoken even in silence. I lay my restless thoughts to rest and let compassion flow — unconditional, unhurried — toward every living thing I touch.",
    focus: "May I return, always, to the breath. When attention frays, I gather it without scolding, and rest in the plain, luminous awareness of exactly this.",
    surrender: "May I stop insisting and start trusting. I release control into the flow of what is, letting the silence within guide me and life arrange itself as it knows how.",
    close: "In love, in focus, in surrender — I say yes to this day.",
  },
  {
    love: "Let me hold today loosely and lovingly. I drown my anxious thoughts in a sea of tenderness and let compassion move outward, sparing no living thing and forgetting no forgotten corner of my own heart.",
    focus: "Let my mind be a clear sky through which thoughts pass like weather. I need not stop them; I return to the breath and rest, present and awake, in this exact moment.",
    surrender: "Let me give the day to the Divine before I try to run it. I release my grip on outcomes and trust the current, allowing what is to simply be what is.",
    close: "Whole-hearted, clear-minded, and surrendered, I begin again.",
  },
  {
    love: "May I begin untethered from grievance, free to love. I put the racing mind to sleep in the sea of the heart and let compassion flow — first inward to soothe myself, then outward to all who suffer.",
    focus: "May my focus rest where my feet are. When the mind runs ahead, I call it back to the breath, resting in awareness so simple it cannot be improved, only inhabited.",
    surrender: "May I trust what I cannot see. I loosen my hold on how things should be and surrender to the flow, letting the silence within carry what my effort cannot.",
    close: "Loved and loving, present and clear, surrendered and free — I step into the day.",
  },
  {
    love: "Let compassion be my default and not my afterthought. I quiet the noise of judgement and let love flow without condition, holding all beings — and my own weary heart — in kindness.",
    focus: "Let me be here for this breath, and then the next. I release the grip of past and future and return to the still, waking awareness of now, needing nothing more.",
    surrender: "Let me yield. I stop bracing against life and lean into its flow, trusting that what is unfolding is held by a wisdom larger than my fear.",
    close: "Tender, attentive, and at ease, I give this day to what is.",
  },
  {
    love: "May my heart stay open even where the world is sharp. I lay my restless thoughts to sleep in love and let kindness pour freely toward every living thing — beginning with the person I am hardest on: myself.",
    focus: "May I anchor in the breath as in a home I can always return to. Each wandering is forgiven the moment I notice it, and I rest again in the clear awareness of now.",
    surrender: "May I release the exhausting work of control. I surrender to the flow of what is, trusting the quiet within and letting the day become itself without my interference.",
    close: "Loving, focused, surrendered — I meet the day with open hands.",
  },
  {
    love: "Let me move through today with an untethered heart, owing nothing to old wounds. I dissolve my racing thoughts in a sea of love and let compassion flow, without condition, to all that breathes.",
    focus: "Let my mind stay clear, anchored, and present. When noise or wandering pulls me away, I gently return to the breath, resting in the pure awareness of this exact moment.",
    surrender: "Let me release my grip on how life should be and yield to the flow of what is. I surrender the need for control, trusting the silence within and letting life unfold organically.",
    close: "Heart full of love, mind perfectly focused, spirit surrendered to the present — I step into my day.",
  },
];

/* ── Today's teaching ─────────────────────────────────────────────────────── */
export const HIGHLIGHTS: string[] = [
  "Meditation is a tool to take us closer to truth primarily by purification of mind — to overcome ego and ignorance. With this journey we will overcome many challenges, and our consciousness will slowly and surely rise.",
  "The mind is like a lake. When the surface is disturbed, we cannot see the bottom. Meditation stills the surface so that truth may be seen clearly beneath.",
  "It is not the length of your sit that matters most, but the quality of your presence within it. Even ten minutes of genuine attention is worth more than an hour of restless wandering.",
  "The ego is not the enemy — it is simply a case of mistaken identity. We have taken ourselves to be the wave, when all along we are the ocean.",
  "Purification is not punishment. Every time we sit, we are gently washing away the residue of habit, reaction, and unconscious conditioning — layer by layer, day by day.",
  "We do not meditate to become something we are not. We meditate to become what we already are — beneath the noise, beneath the thoughts, beneath the story of self.",
  "Distractions are not failures. They are the very material of the practice. Each time you return your attention, you are building the muscle of awareness.",
  "Consciousness rises the way the sun rises — gradually, inexorably, even on cloudy days. You cannot force the sunrise, but you can be awake when it comes.",
  "The sacred space you create outwardly is a reflection of the sacred space you are cultivating inwardly. Treat both with the same care.",
  "So-Hum — 'I am That.' With every breath, this truth is already being spoken inside you. Meditation is learning to hear it.",
  "OM is not merely a sound. It is the vibration from which all form arises and into which all form returns. To chant it is to touch the beginning and end of everything.",
  "Pranayama is the bridge between the body and the mind. When the breath is steady, the mind grows quiet. When the mind grows quiet, truth draws near.",
  "The Higher Self does not need to be sought in extraordinary places. It is here — in this breath, in this moment, behind every thought that arises.",
  "Surrender is not weakness. It is the most courageous act there is — to release the grip of the small self and trust the deeper current of what is.",
  "The nature of open awareness is that it has no centre and no edge. It is not focused on anything, yet it misses nothing. This is your natural state.",
  "Guru means 'that which removes darkness.' Every teacher, every teaching, every moment of genuine clarity is a guru — if you are willing to receive.",
  "The Divine Form you choose for meditation is a door, not a destination. What matters is not the form itself, but the love and attention you bring to it.",
  "A practitioner who is sincere but imperfect is further along the path than one who is perfect but insincere. Show up honestly, every day.",
  "Inner communion through prayer is not a performance for the Divine. It is a conversation between your deepest self and the source from which it comes.",
  "Open awareness is the sky. Thoughts, feelings, sensations are weather passing through. You are not the weather. You are the sky.",
];

/* ── The Nine Virtues — one per week, seven days each ─────────────────────── */
export const VIRTUES: Virtue[] = [
  {
    key: 'sincerity', name: 'Sincerity', week: 1,
    desc: "Sincerity is the alignment of your inner state with your outer expression — saying what you mean, meaning what you say, and living without the gap between the two.",
    prayers: [
      "May I speak only what I truly feel today, without the mask of what seems acceptable.",
      "Let me meet this day as I actually am — not as I wish to appear.",
      "May sincerity be the ground beneath every word and action, whether anyone is watching or not.",
      "Let me close the gap between my inner life and what I show the world, even by one honest inch.",
      "May I be real with myself first, so I can be real with others.",
      "Where I am tempted to perform, may I pause and choose honesty instead.",
      "Let sincerity be the quiet thread that runs through everything I do today — seen or unseen.",
    ],
    ideas: [
      { icon: '🪞', place: 'Morning mirror', how: "Before you leave the bathroom, say one true thing to yourself — not affirmation, not criticism. Something you actually know. 'I am nervous about the meeting.' 'I did not sleep enough.' Simple truth." },
      { icon: '📱', place: 'Next message you type', how: "Before sending any text or email, ask: does this say what I actually mean? Rewrite the first one that doesn't." },
      { icon: '🍽️', place: 'Family meal', how: "When asked 'how was your day?' — resist the default 'fine'. Give one real answer, even briefly." },
      { icon: '🧘', place: 'Start of your sit', how: "Spend the first 60 seconds of meditation just checking in: how are you actually? Drop the spiritual pretence. Begin from truth." },
      { icon: '🏢', place: 'Work meeting', how: "Notice once today where you say something to smooth the room rather than because it's true. Note it privately — no need to correct, just see it." },
      { icon: '🚶', place: 'A walk', how: "Walk without your phone. Notice what you actually think about when there is nothing performing to. That stream of thought is the sincere you." },
      { icon: '📓', place: 'Evening journal', how: "Write one sentence that begins: 'What I didn't say today but meant was…'" },
    ],
  },
  {
    key: 'commitment', name: 'Commitment', week: 2,
    desc: "Commitment is continuing to do what you said you would do, long after the mood that made the vow has passed.",
    prayers: [
      "May I show up today not because I feel like it, but because I said I would.",
      "Let commitment be less about willpower and more about love for what matters.",
      "May I treat my practice as a promise I keep to the deepest part of myself.",
      "Where the mood is low, may commitment be the floor I stand on anyway.",
      "Let me notice what I abandon when it gets difficult — and gently return.",
      "May I see each act of follow-through, however small, as an offering.",
      "Let today's sit be the proof that my word to myself means something.",
    ],
    ideas: [
      { icon: '⏰', place: 'Before bed', how: "Set your alarm for the same time tomorrow as you sat today. Commitment lives in the preparation, not just the act." },
      { icon: '📋', place: "One task you've been avoiding", how: "Give it five minutes. Not to finish it — just to begin. Commitment is the act of starting, again and again." },
      { icon: '🤝', place: 'A promise to someone else', how: "Follow through on one small thing you said you'd do — a reply, a call, an errand — without being reminded." },
      { icon: '🧘', place: 'When you want to end the sit early', how: "Stay for two more minutes past the point you want to leave. That extra two minutes is where commitment is actually built." },
      { icon: '🌧️', place: 'On a difficult morning', how: "Sit anyway. Even five minutes. Note in your log: 'difficult day, sat anyway.' That entry is worth ten easy sits." },
      { icon: '📖', place: 'Your daily reading', how: "Read on the one morning you least feel like it. Let commitment carry you when inspiration does not." },
      { icon: '🌱', place: 'Something you planted but forgot', how: "Water a plant, tend a relationship, return to a project — something living that needs your consistent attention to survive." },
    ],
  },
  {
    key: 'patience', name: 'Patience', week: 3,
    desc: "Patience is remaining steady while life unfolds on its own timeline, without forcing it onto yours.",
    prayers: [
      "May I stop rushing the river today — it knows its own way to the sea.",
      "Let me hold what is unresolved without trying to resolve it before its time.",
      "May patience make me wider, not smaller — large enough to wait without anxiety.",
      "Let me remember: the lotus does not hurry. It rises at exactly the right moment.",
      "May I breathe into every delay, queue, and waiting room as an opportunity, not an obstacle.",
      "Let me notice where impatience lives in my body today — jaw, chest, hands — and soften there.",
      "May I trust that what is growing beneath the surface does not need my interference to bloom.",
    ],
    ideas: [
      { icon: '☕', place: 'Making tea or coffee', how: "Do it slowly. Don't multitask. Watch the water boil. Patience begins with the smallest things." },
      { icon: '🚦', place: 'Any queue or traffic', how: "Instead of checking your phone, breathe. Use the wait as a 5-breath practice. The queue becomes a meditation bell." },
      { icon: '👂', place: 'A conversation', how: "Let the other person finish completely before you begin to form your response. True patience is listening without the next sentence already loaded." },
      { icon: '🌱', place: 'Your own progress', how: "Look back at where you were six weeks ago, not where you think you should be today. Growth is rarely visible in the present tense." },
      { icon: '😤', place: 'When something irritates you', how: "Count to seven before responding. Not to suppress — to create a space where choice lives instead of reaction." },
      { icon: '📵', place: 'First 30 minutes of the day', how: "No phone. Let the morning arrive at its own pace. Patience with the morning trains patience with everything else." },
      { icon: '🎨', place: 'An unfinished project', how: "Work on something you cannot finish today — a sketch, a plan, a piece of writing. Practice beginning without demanding completion." },
    ],
  },
  {
    key: 'acceptance', name: 'Acceptance', week: 4,
    desc: "Acceptance is meeting what is actually here — not what should be here — without immediate resistance or the need to change it.",
    prayers: [
      "May I stop arguing with what is already true, and begin from there.",
      "Let me accept this day as it arrives, not as I ordered it.",
      "May acceptance soften what resistance has made rigid in me.",
      "Let me hold even the difficult parts of today with an open hand, not a clenched fist.",
      "May I stop waiting for circumstances to be better before I allow myself to be at peace.",
      "Let me practise saying 'this is what is' — and feel how much energy that frees.",
      "May I accept myself exactly as I am today, as the starting point, not the problem.",
    ],
    ideas: [
      { icon: '🌦️', place: 'The weather', how: "Whatever it is — accept it physically. Go outside in it for five minutes without complaint. Acceptance is a bodily practice before it is a mental one." },
      { icon: '😔', place: "An emotion you don't like", how: "Name it: 'I am feeling frustrated.' Don't try to fix or suppress it. Sit with it for 60 seconds the way you'd sit with a guest." },
      { icon: '📰', place: 'A news story that upsets you', how: "Read it, feel it — then notice the moment you start resisting reality. 'This shouldn't be.' Acceptance doesn't mean approval; it means acknowledging what is." },
      { icon: '🪟', place: "Someone else's behaviour", how: "Notice one moment today where you want someone to be different. Instead of pushing against it, ask: 'what if this is exactly who they are right now?'" },
      { icon: '🧘', place: 'A distracted sit', how: "When the meditation is scattered, accept it as the meditation you are actually having, not the one you planned. The acceptance itself is the practice." },
      { icon: '🔲', place: 'An unmet expectation', how: "When something doesn't go as planned, say quietly: 'This is the new starting point.' Write that down if it helps." },
      { icon: '💬', place: 'Feedback or criticism', how: "Receive one piece of feedback today without defending yourself. Let it land, even if just for a moment." },
    ],
  },
  {
    key: 'tolerance', name: 'Tolerance', week: 5,
    desc: "Tolerance is the ability to remain open and non-reactive in the presence of what is different, difficult, or disagreeable.",
    prayers: [
      "May I hold difference today without needing to make it wrong.",
      "Let me be large enough that contrast does not disturb me.",
      "May I remember that what irritates me most in others often lives quietly in me too.",
      "Let tolerance make me curious today, where I would otherwise be dismissive.",
      "May I stay in the room — literally and figuratively — when I want to leave.",
      "Let me practise the pause between trigger and response as my daily sadhana.",
      "May I find one thing to appreciate in the person I find most difficult today.",
    ],
    ideas: [
      { icon: '🗣️', place: 'A disagreement', how: "Let someone hold a view you don't share without trying to change them. Ask one genuine question instead. Tolerance is curiosity about the other." },
      { icon: '🍲', place: 'A food you dislike', how: "Eat one bite of something you normally avoid. Physical tolerance trains the same muscle as emotional tolerance." },
      { icon: '📺', place: 'Media you disagree with', how: "Read or watch five minutes of something from a perspective you usually dismiss. Notice the discomfort — that is exactly where tolerance grows." },
      { icon: '🚇', place: 'Public transport or a crowd', how: "Be present in a noisy, chaotic space without withdrawing into your phone. Let the world be as it is for ten minutes." },
      { icon: '🪞', place: 'Your own flaws', how: "Name one personal flaw you're impatient with. 'I am still quick to judge.' Be tolerant of that — self-tolerance comes first." },
      { icon: '👨‍👩‍👧', place: 'A family interaction', how: "Let a family member be exactly who they are — with their habits, their repetitions, their quirks — without correcting or withdrawing." },
      { icon: '🧘', place: 'An uncomfortable sensation in the sit', how: "When the knee aches or the back tightens, stay. Don't move for two more minutes. Physical tolerance in practice trains it everywhere." },
    ],
  },
  {
    key: 'caring', name: 'Caring', week: 6,
    desc: "Caring is giving your genuine attention and warmth to another without the need for them to deserve it first.",
    prayers: [
      "May I do one thing today not for recognition, but purely because someone needs it.",
      "Let me notice what needs tending around me — and tend it.",
      "May caring flow from me naturally today, as breathing flows, without effort or expectation.",
      "Let me give the warmth I would wish to receive, freely and without account.",
      "May I be the person today who asks 'are you alright?' and actually waits for the answer.",
      "Let caring begin with my own body and heart, so I can offer it outward from fullness, not depletion.",
      "May I remember that small acts of care — a look, a word, a moment of attention — are never small to the one who receives them.",
    ],
    ideas: [
      { icon: '📞', place: 'Your phone', how: "Call or message one person you haven't spoken to in a while — not to catch up, but simply to say you thought of them." },
      { icon: '🍵', place: "Someone else's cup", how: "Make tea or coffee for someone without being asked. Caring begins with the small, physical, unremarkable acts." },
      { icon: '👀', place: 'A stranger', how: "Make eye contact and offer a genuine smile. Not a performance — a moment of real acknowledgement that another person exists." },
      { icon: '🧹', place: 'Shared space', how: "Tidy something in a shared space that isn't 'your' mess. Caring for the shared world is caring for others." },
      { icon: '❓', place: 'A check-in', how: "Ask someone 'how are you actually doing?' — and when they answer, listen fully. Don't offer a solution; just receive." },
      { icon: '🌿', place: 'Something living', how: "Water a plant, feed a bird, tend an animal. Caring for non-human life extends and softens the caring impulse." },
      { icon: '📝', place: 'A note', how: "Leave a handwritten note of appreciation for someone in your home or workplace. Unexpected, specific, and sincere." },
    ],
  },
  {
    key: 'gentleness', name: 'Gentleness', week: 7,
    desc: "Gentleness is handling what is fragile — including people, including yourself — with care and without force.",
    prayers: [
      "May I speak today as if my words were hands, and use them gently.",
      "Let me notice where I am harsh with myself, and soften there first.",
      "May I move through today without hurrying, without forcing, without hardness.",
      "Let gentleness be my response where impatience would be my habit.",
      "May I handle this moment — and this person — as if they were precious. Because they are.",
      "Let me practise the quiet strength that does not need to be forceful to be effective.",
      "May I end this day having touched at least one thing — a word, a task, an interaction — more gently than I normally would.",
    ],
    ideas: [
      { icon: '🤲', place: 'Physical handling', how: "Pick things up gently today — your cup, your phone, a door handle. Gentleness in the body trains gentleness in the mind." },
      { icon: '📢', place: 'Your voice', how: "Speak five decibels softer than your usual volume in one conversation. Notice what happens to the exchange." },
      { icon: '💭', place: 'Your self-talk', how: "When you make a mistake today, say to yourself what you would say to a friend who made the same mistake. That is gentleness turned inward." },
      { icon: '🧸', place: 'With a child or animal', how: "Spend five minutes at their pace, in their world, without agenda. Gentleness is matching the pace of what is tender." },
      { icon: '🖊️', place: 'Your writing', how: "Write slowly today — a message, a note, even a shopping list. Hasty strokes are rarely gentle. Precision and care in small things." },
      { icon: '🌙', place: 'Your evening', how: "End the day without screens for 20 minutes. Let the transition to sleep be gentle — a practice in handling yourself with care." },
      { icon: '🧘', place: 'The breath', how: "In your sit, breathe so gently that a feather in front of your nose would barely stir. The subtlety trains the quality." },
    ],
  },
  {
    key: 'graciousness', name: 'Graciousness', week: 8,
    desc: "Graciousness is receiving and giving with openness, warmth, and ease — without awkwardness, resentment, or keeping score.",
    prayers: [
      "May I receive a compliment today without deflecting it, and a difficulty without resenting it.",
      "Let me give and receive today as if both are gifts.",
      "May graciousness make me generous in spirit where smallness would be the easier default.",
      "Let me remember: how I treat people when I gain nothing from it — that is the measure.",
      "May I hold success and failure with the same open, unhurried grace.",
      "Let me be the person in the room who makes others feel welcome, simply by how I am.",
      "May I notice when I am ungracious — in thought, in word — and gently return to openness.",
    ],
    ideas: [
      { icon: '🎁', place: 'Receiving help', how: "Let someone help you today without minimising it: 'thank you' — full stop, no 'but you didn't have to'. Receive the gift graciously." },
      { icon: '🏆', place: "Someone else's success", how: "Celebrate one person's achievement today with genuine warmth — not performatively, not with a 'but' — just joy for them." },
      { icon: '🚪', place: 'An entrance or exit', how: "Hold a door. Let someone go first. These small rituals of graciousness are the physical vocabulary of the quality." },
      { icon: '🍴', place: 'A shared meal', how: "Be the last to serve yourself. Attend to others first. Graciousness at the table is graciousness in miniature." },
      { icon: '🤐', place: 'When you disagree', how: "Disagree graciously: acknowledge what is right in the other view before offering yours. 'You're right that… and I also think…'" },
      { icon: '📧', place: 'A difficult email or message', how: "Reply to one challenging message more warmly than it deserves. Graciousness doesn't wait for the other person to go first." },
      { icon: '🌟', place: 'The close of the day', how: "Name three people who made your day easier — acknowledge them inwardly, or in writing. Graciousness is noticing what you receive." },
    ],
  },
  {
    key: 'detachment', name: 'Detachment', week: 9,
    desc: "Detachment is engaging fully with life while remaining free from the compulsion to control its outcome or possess its fruits.",
    prayers: [
      "May I act today with full effort and hold the result with open hands.",
      "Let me love what I love without clinging to it — love freely given, freely held.",
      "May I remember: I am the sky, not the weather passing through it.",
      "Let me do my part completely, and release what is not mine to determine.",
      "May detachment bring lightness today, not distance — freedom, not indifference.",
      "Let me notice where I am grasping — at outcomes, at approval, at certainty — and gently open the hand.",
      "May I end this day without checking the result of everything I gave today. Give, act, release.",
    ],
    ideas: [
      { icon: '📤', place: 'After sending important work', how: "Once sent, do not check for a response for one hour. Practice releasing the outcome the moment it leaves your hands." },
      { icon: '🧹', place: 'Clearing something out', how: "Give away one object you have been keeping 'just in case'. Detachment begins with things before it reaches thoughts." },
      { icon: '🌊', place: 'A result you care about', how: "Notice one area of life where you are outcome-obsessed. Write: 'I will do my part fully and release the rest.' Then do it." },
      { icon: '👁️', place: 'Your meditation', how: "Sit without wanting the meditation to be deep, clear, or peaceful. Let it be whatever it is. Detachment from the quality of the sit trains detachment from everything." },
      { icon: '💬', place: 'A conversation', how: "Say something true without needing the other person to agree with it. Let your words land without controlling how they are received." },
      { icon: '📵', place: 'Social media or messages', how: "Post or send something without checking back for reactions for three hours. Count the urge to check — that urge is what detachment dissolves." },
      { icon: '🎭', place: 'A role you play', how: "Notice one role — parent, professional, practitioner — that you are gripping tightly. For one hour, hold it more lightly. You are more than any role." },
    ],
  },
];

/* ── Before you sit ───────────────────────────────────────────────────────── */
export interface PresitCheck {
  key: string;
  text: string;
  sub: string;
}

export const PRESIT_CHECKS: PresitCheck[] = [
  {
    key: 'breath',
    text: 'Steady deep breathing for 2–5 minutes',
    sub: 'Breathe slowly and deeply to quieten the nervous system and prepare the mind.',
  },
  {
    key: 'mudra',
    text: 'Hand mudra held slightly above the legs',
    sub: 'Keep the mudra raised a little, not resting heavily on the thighs — sustain this for at least 10 minutes to drop into a deeper state.',
  },
  {
    key: 'divineform',
    text: 'Connect to your Divine Form',
    sub: 'Before closing the eyes, gaze softly at your chosen image — let the form enter the heart, not just the eyes. Then carry that living presence into the sit.',
  },
];

/* ── The day's selection ──────────────────────────────────────────────────── */
export interface PracticeDay {
  dateKey: string;
  dayNumber: number;
  /** 0–6 — which day of this virtue's week we are on. */
  dayInWeek: number;
  /** How many complete cycles of all nine virtues have passed. */
  cycle: number;
  virtue: Virtue;
  /** The virtue prayer for this specific day of the week. */
  prayer: string;
  /** Three of the seven ideas, rotated by date. */
  ideas: VirtueIdea[];
  invocation: Invocation;
  highlight: string;
}

/**
 * Everything today holds, derived from the date alone.
 *
 * `offset` nudges the invocation and teaching to the next one in the list
 * without moving the day — it backs the "another" control, which lets someone
 * draw a different prayer when the day's one does not land. The virtue and its
 * prayer deliberately do not move: the week is the practice.
 */
export function getPracticeDay(date: Date = new Date(), offset = 0): PracticeDay {
  const dayNumber = practiceDayNumber(date);
  const dateKey = practiceDateKey(date);
  const weekIndex = Math.floor(dayNumber / 7);

  const virtue = VIRTUES[weekIndex % VIRTUES.length];
  const dayInWeek = dayNumber % 7;

  const invoSeed = hashDate(dateKey) + offset;
  const hlSeed = hashDate(dateKey + 'H') + offset;
  const ideaSeed = hashDate(dateKey + 'V');

  // Three distinct ideas, walked from the seed so they never repeat within a day.
  const ideas = [0, 1, 2].map(i => virtue.ideas[(ideaSeed + i) % virtue.ideas.length]);

  return {
    dateKey,
    dayNumber,
    dayInWeek,
    cycle: Math.floor(weekIndex / VIRTUES.length),
    virtue,
    prayer: virtue.prayers[dayInWeek % virtue.prayers.length],
    ideas,
    invocation: INVOCATIONS[invoSeed % INVOCATIONS.length],
    highlight: HIGHLIGHTS[hlSeed % HIGHLIGHTS.length],
  };
}
