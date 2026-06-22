import { useState, useEffect } from 'react';
import { ArrowRight, Loader2, Share2, Check, Mail, Battery, Moon, Brain, Users, Flame, Heart, Bone, Activity, Utensils, Eye, Compass, Sprout } from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';

// ─── Activity Tracker (fire-and-forget, mirrors AboutJournal) ─────────────────
const LOG_URL = 'https://us-central1-awakened-path-2026.cloudfunctions.net/logWebActivity';
const SHARE_URL = 'https://www.skrmblissai.in/knowyouremotionalhealth';
const SITE_LABEL = 'www.skrmblissai.in';
const WHATSAPP_URL = 'https://wa.me/918217581238';
const CONTACT_EMAIL = 'connect@skrmblissai.in';

function trackActivity(action: string, details = '', emailOverride?: string) {
    try {
        const params = new URLSearchParams(window.location.search);
        const email =
            emailOverride ||
            params.get('utm_email') ||
            localStorage.getItem('journal_access_email') ||
            'anonymous';
        fetch(LOG_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email,
                action,
                page: typeof window !== 'undefined' ? window.location.pathname : '/knowyouremotionalhealth',
                details,
                source: typeof document !== 'undefined' ? document.referrer || 'direct' : 'direct',
            }),
        }).catch(() => {});
    } catch (_) { /* silent */ }
}

const APP_URL = '/';

// ─── Types ────────────────────────────────────────────────────────────────────
type Opt = [string, number];                                  // [label, hidden score 0-3]
type Q = { q: string; opts: Opt[]; emotions: string[]; signs: string[] };
type Variant = { q: string; opts: Opt[] };
type Theme = {
    key: string;
    name: string;
    hook: string;            // short gate teaser
    archetype: string;       // archetype this theme nudges toward
    q1: Q;                   // theme-specific opening question
    insight: string;         // the daily insight
    edu: { title: string; body: string };
    share: string;           // viral one-liner
};

// ─── Daily themes ─────────────────────────────────────────────────────────────
// One becomes "today's theme" — driving Q1, the daily insight, the lesson and
// the shareable line. Add more over time; the rotation handles any length.
const THEMES: Theme[] = [
    {
        key: 'burnout', name: 'Burnout', archetype: 'fighter',
        hook: 'Tired even after resting? Let’s look at why.',
        q1: { q: 'Do you feel tired even after resting?', opts: [['Never', 0], ['Sometimes', 1], ['Often', 2], ['Almost always', 3]], emotions: ['Emotional exhaustion'], signs: ['Energy', 'Sleep'] },
        insight: 'You may not be tired because you’re doing too much today. You may be tired because you’ve been carrying too much, for too long.',
        edu: { title: 'Why rest doesn’t always fix tiredness', body: 'When stress stays quietly switched on in the background, the body never fully powers down — so sleep restores less than it should. The answer isn’t only more rest; it’s lowering the load you’ve been carrying without noticing.' },
        share: 'I finally understand why I’m always tired.',
    },
    {
        key: 'overthinking', name: 'Overthinking', archetype: 'overthinker',
        hook: 'Mind that won’t switch off? There may be a reason.',
        q1: { q: 'How often do conversations replay in your head after they’re over?', opts: [['Rarely', 0], ['Sometimes', 1], ['Often', 2], ['All the time', 3]], emotions: ['Worry'], signs: ['Focus', 'Sleep'] },
        insight: 'The problem may not be your thoughts. The problem may be the things your mind never got closure on.',
        edu: { title: 'Why your mind won’t switch off', body: 'An open loop — something unresolved or left unsaid — keeps the mind circling, because part of you is still trying to finish it. Closure, even quietly within yourself, is what finally lets a thought rest.' },
        share: 'My overthinking isn’t a flaw — it’s unfinished business.',
    },
    {
        key: 'peoplepleasing', name: 'People-pleasing', archetype: 'giver',
        hook: 'Always saying yes? See what it may be costing you.',
        q1: { q: 'How often do you say yes when you really want to say no?', opts: [['Rarely', 0], ['Sometimes', 1], ['Often', 2], ['Almost always', 3]], emotions: ['Frustration', 'Emotional exhaustion'], signs: ['Energy'] },
        insight: 'Some of your stress may come from carrying responsibilities that were never meant to be yours.',
        edu: { title: 'Why pleasing everyone is exhausting', body: 'Every yes you don’t mean is a small withdrawal from your own energy. Over time, putting everyone else first leaves the one person who needs you most — you — running on empty.' },
        share: 'My biggest source of stress isn’t work — it’s saying yes too often.',
    },
    {
        key: 'loneliness', name: 'Loneliness', archetype: 'silent',
        hook: 'Feeling unseen, even around others? Let’s look gently.',
        q1: { q: 'How often do you feel alone, even when you’re around other people?', opts: [['Rarely', 0], ['Sometimes', 1], ['Often', 2], ['Almost always', 3]], emotions: ['Loneliness'], signs: ['Motivation', 'Relationships'] },
        insight: 'You can be surrounded by people and still feel unseen.',
        edu: { title: 'Why loneliness affects more than mood', body: 'Feeling unseen registers in the body as a kind of stress — touching sleep, focus and motivation. It isn’t about how many people are around you, but whether you feel truly known by any of them.' },
        share: 'You can be surrounded by people and still feel unseen.',
    },
    {
        key: 'grief', name: 'Grief', archetype: 'griever',
        hook: 'Some things stay with us longer than we admit.',
        q1: { q: 'Is there a loss or ending that still quietly affects you?', opts: [['Not really', 0], ['A little', 1], ['Yes, often', 2], ['Yes, deeply', 3]], emotions: ['Grief'], signs: ['Chest tension', 'Energy'] },
        insight: 'Not everything painful leaves when the event ends. Sometimes the body keeps holding what the mind has learned to live around.',
        edu: { title: 'Why grief lingers in the body', body: 'Grief doesn’t follow a schedule. Long after the mind has “moved on,” the body can keep holding the weight — surfacing as heaviness, fatigue, or a tightness in the chest you can’t quite explain.' },
        share: 'Not everything painful leaves when the event ends.',
    },
    {
        key: 'resentment', name: 'Unspoken anger', archetype: 'silent',
        hook: 'Keeping the peace by staying quiet? Let’s check in.',
        q1: { q: 'How often do you swallow how you really feel to keep the peace?', opts: [['Rarely', 0], ['Sometimes', 1], ['Often', 2], ['Almost always', 3]], emotions: ['Frustration'], signs: ['Jaw tension', 'Neck and shoulders'] },
        insight: 'The things we never say don’t disappear. They settle into the body and quietly wait.',
        edu: { title: 'Why holding it in costs you', body: 'Unspoken frustration doesn’t vanish — it tightens the jaw, the shoulders, the gut. Naming what bothers you, even privately, releases some of what the body has been bracing against.' },
        share: 'The things I never said didn’t disappear — they just went quiet.',
    },
    {
        key: 'numbness', name: 'Emotional numbness', archetype: 'numb',
        hook: 'Feeling a bit flat or numb lately? Let’s look gently.',
        q1: { q: 'How connected do you feel to your own emotions lately?', opts: [['Very connected', 0], ['Mostly', 1], ['Not very', 2], ['I feel numb', 3]], emotions: ['Emotional exhaustion'], signs: ['Motivation'] },
        insight: 'Numbness isn’t the absence of feeling. It’s often what happens when we’ve felt too much, for too long.',
        edu: { title: 'Why you might feel flat or numb', body: 'When emotions become overwhelming, the mind sometimes turns the volume down on all of them to cope. Numbness is protection — and it softens again once it feels safe to feel.' },
        share: 'Feeling numb isn’t broken — it’s how I learned to cope.',
    },
    {
        key: 'anxiety', name: 'Anxiety', archetype: 'overthinker',
        hook: 'That low hum of worry — where does it come from?',
        q1: { q: 'How often does a low hum of worry follow you through the day?', opts: [['Rarely', 0], ['Sometimes', 1], ['Most days', 2], ['Almost always', 3]], emotions: ['Fear', 'Worry'], signs: ['Chest tension', 'Sleep'] },
        insight: 'Anxiety is often not about the present. It’s the body bracing for something that already happened.',
        edu: { title: 'Why worry shows up in the body', body: 'Worry isn’t only in the mind — it quickens the heart, tightens the chest, disturbs sleep. Often it’s the body trying to protect you from an old hurt by staying on guard against the future.' },
        share: 'My anxiety isn’t weakness — it’s my body trying to protect me.',
    },
    {
        key: 'stuck', name: 'Feeling stuck', archetype: 'numb',
        hook: 'Going through the motions? Something may be draining you.',
        q1: { q: 'How often do you feel like you’re just going through the motions?', opts: [['Rarely', 0], ['Sometimes', 1], ['Often', 2], ['Almost always', 3]], emotions: ['Disappointment'], signs: ['Motivation', 'Focus'] },
        insight: 'Feeling stuck is rarely about a lack of effort. It’s often about carrying something that quietly drains the fuel you’d use to move.',
        edu: { title: 'Why you can feel stuck even while trying', body: 'Unprocessed stress takes up bandwidth in the background, leaving less for change. Lightening the load you’ve been carrying often frees the momentum that felt impossible to find.' },
        share: 'I’m not lazy or stuck — I’ve just been carrying a lot.',
    },
    {
        key: 'shame', name: 'Self-worth', archetype: 'silent',
        hook: 'Harder on yourself than anyone else? Let’s look at why.',
        q1: { q: 'How often are you harder on yourself than you’d ever be on a friend?', opts: [['Rarely', 0], ['Sometimes', 1], ['Often', 2], ['Almost always', 3]], emotions: ['Shame'], signs: ['Motivation'] },
        insight: 'The voice that criticizes you most was usually learned, not chosen. And what’s learned can be unlearned.',
        edu: { title: 'Why self-criticism backfires', body: 'Harsh self-talk feels like motivation but acts like stress — draining confidence and energy. Speaking to yourself the way you’d speak to someone you love isn’t soft; it’s how change becomes sustainable.' },
        share: 'I’ve been speaking to myself in a way I’d never speak to a friend.',
    },
    {
        key: 'chronicstress', name: 'Chronic stress', archetype: 'fighter',
        hook: 'Always switched on? Your body may be asking for rest.',
        q1: { q: 'How often does your body feel tense or “switched on”?', opts: [['Rarely', 0], ['Sometimes', 1], ['Most days', 2], ['Almost always', 3]], emotions: ['Stress'], signs: ['Neck and shoulders', 'Sleep'] },
        insight: 'Stress was meant to be a moment, not a lifestyle. The body was never designed to stay on guard this long.',
        edu: { title: 'Why constant stress wears you down', body: 'Short bursts of stress are healthy. But when the “on” switch never flips off, it quietly erodes sleep, digestion and patience. Real rest isn’t lazy — it’s maintenance the body depends on.' },
        share: 'Stress was meant to be a moment, not my whole life.',
    },
    {
        key: 'avoidance', name: 'Avoidance', archetype: 'fighter',
        hook: 'Staying busy to avoid something? Let’s slow down a moment.',
        q1: { q: 'When something’s bothering you, how often do you stay busy to avoid it?', opts: [['Rarely', 0], ['Sometimes', 1], ['Often', 2], ['Almost always', 3]], emotions: ['Worry'], signs: ['Energy'] },
        insight: 'Sometimes constant busyness isn’t productivity. It’s a way of outrunning what we don’t want to feel.',
        edu: { title: 'Why being busy can be avoidance', body: 'Staying busy can quiet uncomfortable feelings for a while — but they wait for the silence to return. Facing them in small doses is what finally lets you slow down without dread.' },
        share: 'My busyness was never productivity — it was avoidance.',
    },
    {
        key: 'perfectionism', name: 'Perfectionism', archetype: 'fighter',
        hook: 'Never quite good enough? Let’s look at why.',
        q1: { q: 'How often is your best still not good enough in your own eyes?', opts: [['Rarely', 0], ['Sometimes', 1], ['Often', 2], ['Almost always', 3]], emotions: ['Shame', 'Stress'], signs: ['Focus', 'Energy'] },
        insight: 'Perfectionism isn’t really about high standards. It’s often about feeling you’re only as worthy as your last achievement.',
        edu: { title: 'Why perfectionism is exhausting', body: 'Chasing flawless keeps moving the finish line, so rest never feels earned. The relief isn’t lower standards — it’s letting “good enough” actually be enough, sometimes.' },
        share: 'My perfectionism was never about standards — it was about worth.',
    },
    {
        key: 'trustissues', name: 'Trust', archetype: 'silent',
        hook: 'Hard to fully let people in? There may be a reason.',
        q1: { q: 'How easy is it for you to fully trust people?', opts: [['Easy', 0], ['Mostly', 1], ['Hard', 2], ['Almost impossible', 3]], emotions: ['Fear', 'Loneliness'], signs: ['Relationships'] },
        insight: 'Guardedness isn’t a flaw. It’s usually proof that, at some point, trusting someone cost you.',
        edu: { title: 'Why trust can feel risky', body: 'When trust has been broken before, the mind learns to brace for it happening again. The walls that once protected you can quietly keep out the closeness you also want.' },
        share: 'My walls aren’t coldness — they’re old protection.',
    },
    {
        key: 'guilt', name: 'Guilt', archetype: 'silent',
        hook: 'Carrying a quiet “I should have…”? Let’s check in.',
        q1: { q: 'How often do you replay things you feel you should have done differently?', opts: [['Rarely', 0], ['Sometimes', 1], ['Often', 2], ['All the time', 3]], emotions: ['Guilt', 'Shame'], signs: ['Sleep', 'Focus'] },
        insight: 'Guilt can be a sign of a caring heart. But carried too long, it stops teaching and just starts weighing.',
        edu: { title: 'Why guilt lingers', body: 'Healthy guilt points us toward repair, then fades. When there’s nothing left to repair, replaying it only punishes — and self-forgiveness, not more guilt, is what finally lets it settle.' },
        share: 'Some of what I carry is guilt I was never meant to keep.',
    },
    {
        key: 'relationshipstress', name: 'Relationship stress', archetype: 'giver',
        hook: 'Love that feels heavy lately? Let’s look gently.',
        q1: { q: 'How often do your closest relationships leave you drained rather than filled?', opts: [['Rarely', 0], ['Sometimes', 1], ['Often', 2], ['Almost always', 3]], emotions: ['Frustration', 'Emotional exhaustion'], signs: ['Relationships', 'Chest tension'] },
        insight: 'Sometimes the stress isn’t the relationship itself — it’s everything that’s gone unspoken inside it.',
        edu: { title: 'Why closeness can feel heavy', body: 'The people closest to us hold the most of our unspoken needs and old hurts. Naming what you actually feel, kindly, often lightens a bond that had quietly grown heavy.' },
        share: 'The weight wasn’t the relationship — it was what went unsaid.',
    },
    {
        key: 'purpose', name: 'Purpose & meaning', archetype: 'numb',
        hook: 'Going through the motions, unsure why? Let’s look.',
        q1: { q: 'How often do you quietly wonder what it’s all for?', opts: [['Rarely', 0], ['Sometimes', 1], ['Often', 2], ['Almost always', 3]], emotions: ['Disappointment', 'Loneliness'], signs: ['Motivation', 'Energy'] },
        insight: 'A loss of meaning isn’t a character flaw. It’s often a quiet ask for something truer than the routine you’re in.',
        edu: { title: 'Why meaning matters for wellbeing', body: 'A sense of purpose steadies us through hard days. When it fades, even good things can feel grey — and reconnecting to what genuinely matters to you is what brings the colour back.' },
        share: 'Feeling lost isn’t failing — it’s asking for something truer.',
    },
];

// ─── Evergreen questions 2–10 (with daily-rotating wordings) ──────────────────
const EVERGREEN: Q[] = [
    { q: 'How often do you find yourself replaying things in your head?', opts: [['Rarely', 0], ['Sometimes', 1], ['Often', 2], ['All the time', 3]], emotions: ['Worry'], signs: ['Focus', 'Sleep'] },
    { q: 'How often does stress show up in your body?', opts: [['Hardly ever', 0], ['Every now and then', 1], ['Most weeks', 2], ['Almost every day', 3]], emotions: ['Stress'], signs: ['Neck and shoulders', 'Energy'] },
    { q: 'How hard is it to switch off at the end of the day?', opts: [['Easy', 0], ['Takes a bit', 1], ['Hard', 2], ['Almost impossible', 3]], emotions: ['Worry'], signs: ['Focus', 'Jaw tension'] },
    { q: 'When someone upsets you, what usually happens?', opts: [['We talk it through', 0], ['It bothers me for a while', 1], ['I keep it to myself', 2], ['I avoid dealing with it completely', 3]], emotions: ['Frustration'], signs: ['Relationships'] },
    { q: 'How do you usually feel when you wake up?', opts: [['Rested and ready', 0], ['A little tired', 1], ['Drained before the day starts', 2], ['Exhausted no matter how much I sleep', 3]], emotions: ['Emotional exhaustion'], signs: ['Sleep', 'Energy'] },
    { q: 'In the last few years, how much have you been through?', opts: [['Nothing major', 0], ['One difficult period', 1], ['Several difficult things', 2], ['More than I feel I’ve recovered from', 3]], emotions: ['Grief', 'Unprocessed life events'], signs: [] },
    { q: 'When life gets overwhelming, what do you usually do?', opts: [['Something healthy', 0], ['Talk to someone', 1], ['Keep busy or distract myself', 2], ['I don’t really know how to cope', 3]], emotions: ['Stress', 'Emotional exhaustion'], signs: ['Digestion'] },
    { q: 'How often do you feel genuinely happy or at peace?', opts: [['Most days', 0], ['Some days', 1], ['Rarely', 2], ['Almost never', 3]], emotions: ['Disappointment', 'Loneliness'], signs: ['Motivation'] },
    { q: 'Which feels most true right now?', opts: [['I feel good emotionally', 0], ['I’m carrying a few things', 1], ['I’m carrying more than people realize', 2], ['I’m just trying to get through each day', 3]], emotions: ['Stress', 'Emotional exhaustion'], signs: [] },
];
const EVERGREEN_ALT1: Variant[] = [
    { q: 'When your head hits the pillow, what’s your mind doing?', opts: [['Winding down', 0], ['Drifting a bit', 1], ['Replaying the day', 2], ['Racing and won’t stop', 3]] },
    { q: 'How does your body feel at the end of a normal day?', opts: [['Relaxed', 0], ['A bit tight', 1], ['Tense in my neck, jaw or shoulders', 2], ['Wound up and aching', 3]] },
    { q: 'How easy is it for you to truly relax?', opts: [['Easy — I switch off fine', 0], ['Usually okay', 1], ['Hard — I’m always half-on', 2], ['I can’t remember the last time', 3]] },
    { q: 'When you’re hurt by someone close, you tend to…', opts: [['Say something honestly', 0], ['Stew on it, then let it go', 1], ['Say nothing and move on', 2], ['Pull away quietly', 3]] },
    { q: 'How are you sleeping these days?', opts: [['Deep and restful', 0], ['Mostly okay', 1], ['Restless or broken', 2], ['Barely — and never enough', 3]] },
    { q: 'When you think about the past few years, how do they sit with you?', opts: [['Mostly at peace', 0], ['A few hard patches, settled', 1], ['Several things still unfinished', 2], ['A lot I haven’t worked through', 3]] },
    { q: 'What do you reach for when it all gets too much?', opts: [['Movement, fresh air, something grounding', 0], ['A good talk with someone', 1], ['Scrolling, snacks, or more work', 2], ['Nothing really helps anymore', 3]] },
    { q: 'When did you last feel really light or carefree?', opts: [['Recently — it’s fairly normal for me', 0], ['A little while ago', 1], ['I can’t quite remember', 2], ['Honestly, it’s been a long time', 3]] },
    { q: 'If a close friend asked how you’re really doing, you’d say…', opts: [['I’m genuinely good', 0], ['I’m okay, a few things on my plate', 1], ['I’m holding more than I show', 2], ['I’m running on empty', 3]] },
];
const EVERGREEN_ALT2: Variant[] = [
    { q: 'How easy is it for you to let things go?', opts: [['Pretty easy', 0], ['Usually, after a bit', 1], ['I struggle to', 2], ['I hold onto things for ages', 3]] },
    { q: 'Tension, headaches, a clenched jaw — how familiar?', opts: [['Not really', 0], ['Occasionally', 1], ['Most weeks', 2], ['Pretty much daily', 3]] },
    { q: 'How often do you feel on edge for no clear reason?', opts: [['Rarely', 0], ['Now and then', 1], ['Most days', 2], ['Almost constantly', 3]] },
    { q: 'How often do you put other people’s needs ahead of your own?', opts: [['Rarely — I keep a balance', 0], ['Sometimes', 1], ['Often', 2], ['Almost always', 3]] },
    { q: 'By mid-afternoon, your energy is usually…', opts: [['Still going strong', 0], ['Dipping a little', 1], ['Running low', 2], ['Completely gone', 3]] },
    { q: 'Is there something you’ve been through that still weighs on you?', opts: [['Not really', 0], ['A little, now and then', 1], ['Yes, more than I’d like', 2], ['Yes — it still feels heavy', 3]] },
    { q: 'When stress builds up, how well do your usual go-tos work?', opts: [['They reset me', 0], ['They help a bit', 1], ['They just take the edge off', 2], ['Nothing’s really working', 3]] },
    { q: 'How much of your week feels genuinely good?', opts: [['Most of it', 0], ['A fair bit', 1], ['Not much', 2], ['Almost none', 3]] },
    { q: 'Right now, life feels mostly…', opts: [['Light and manageable', 0], ['Busy but fine', 1], ['Heavier than it looks', 2], ['Like a lot to get through', 3]] },
];

// ─── Daily selection (deterministic per UTC day) ──────────────────────────────
const DAY_INDEX = Math.floor(Date.now() / 86_400_000);
const THEME = THEMES[DAY_INDEX % THEMES.length];
const EVERGREEN_TODAY: Q[] = EVERGREEN.map((base, d) => {
    const variants: Q[] = [base, { ...base, ...EVERGREEN_ALT1[d] }, { ...base, ...EVERGREEN_ALT2[d] }];
    return variants[(DAY_INDEX + d) % variants.length];
});
const QUESTIONS: Q[] = [THEME.q1, ...EVERGREEN_TODAY]; // theme opener + 9 evergreen = 10
const MAX = QUESTIONS.length * 3;

// ─── Emotional load tiers ─────────────────────────────────────────────────────
type Tier = { weight: string; body: string; headline: string; summary: string[]; color: string; fill: string };
function tierFor(score: number): Tier {
    if (score <= 25) return {
        weight: 'Light', body: 'Low', color: '#5E7D2E', fill: '#7A9A4E',
        headline: 'You’re Carrying This Pretty Well',
        summary: [
            'Whatever you’ve been through, you’ve found ways to keep yourself steady. Most of the time you can feel something, deal with it, and move on.',
            'That’s a real strength — and worth protecting as life asks more of you.',
        ],
    };
    if (score <= 50) return {
        weight: 'Moderate', body: 'Moderate', color: '#9A7A2E', fill: '#B89A4E',
        headline: 'You’re Carrying a Few Things',
        summary: [
            'On the outside you’re managing — probably better than most people would guess. But a few things have started to pile up quietly: stuff half-dealt-with, a tension you’ve gotten used to.',
            'It’s not alarming. It’s just more than you should have to carry without a little space to set it down.',
        ],
    };
    if (score <= 75) return {
        weight: 'Heavy', body: 'High', color: '#9A6433', fill: '#C08A4E',
        headline: 'You’re Carrying More Than People Realize',
        summary: [
            'You’ve been holding more than you let on. You keep going, you keep it together — but some part of you already knows it’s costing you.',
            'What we carry doesn’t just disappear; it leaks into your sleep, your patience, your energy. None of this means something is wrong with you. It means you’ve been strong without much room to rest.',
        ],
    };
    return {
        weight: 'Very Heavy', body: 'Very High', color: '#9C3A36', fill: '#B0413C',
        headline: 'You’ve Been Carrying a Lot, For a While',
        summary: [
            'You’ve been carrying a lot, and you’ve been carrying it for a long time. The tiredness, the tension, the feeling that you’re always “on” — that’s not random, and it’s not weakness.',
            'It’s what happens when you’ve had to stay strong without enough space to put anything down. You don’t have to keep doing it alone.',
        ],
    };
}

// ─── Emotional pattern (archetype) detection ──────────────────────────────────
type Archetype = { key: string; name: string; blurb: string };
const ARCHETYPES: Record<string, Archetype> = {
    silent:      { key: 'silent', name: 'The Silent Carrier', blurb: 'You keep things inside and appear fine to everyone around you — but you carry a great deal alone.' },
    overthinker: { key: 'overthinker', name: 'The Overthinker', blurb: 'Your mind replays the past and rehearses the future, and finds it hard to ever fully switch off.' },
    giver:       { key: 'giver', name: 'The Exhausted Giver', blurb: 'You put everyone else first and quietly run on empty, rarely leaving anything for yourself.' },
    numb:        { key: 'numb', name: 'The Numb Survivor', blurb: 'You’ve adapted to stress for so long that you feel a little disconnected from what you actually feel.' },
    griever:     { key: 'griever', name: 'The Buried Griever', blurb: 'You function well day to day, but past experiences still carry real weight underneath.' },
    fighter:     { key: 'fighter', name: 'The Perpetual Fighter', blurb: 'You’re always pushing, always coping, always doing — and very rarely resting.' },
    steady:      { key: 'steady', name: 'The Steady One', blurb: 'Right now you’re carrying things fairly lightly, and your ways of coping are working for you.' },
};

function archetypeFor(answers: number[], score: number): Archetype {
    if (score <= 25) return ARCHETYPES.steady;
    const e = (i: number) => answers[i + 1] ?? 0; // evergreen index → answers index (Q1 is theme)
    const scores: Record<string, number> = {
        overthinker: e(0) + e(2),
        silent: e(3) + e(8),
        giver: e(4) + e(6),
        numb: e(7) + e(6),
        griever: e(5) * 2,
        fighter: e(1) + e(2) + e(6),
    };
    scores[THEME.archetype] = (scores[THEME.archetype] ?? 0) + 2; // today's theme nudges the pattern
    const top = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
    return ARCHETYPES[top] ?? ARCHETYPES.silent;
}

function computeResult(answers: number[]) {
    const total = answers.reduce((s, a, i) => s + QUESTIONS[i].opts[a][1], 0);
    const score = Math.round((total / MAX) * 100);
    const tier = tierFor(score);

    // Rank emotions and body signs by weighted hit count, so the top two
    // surface as "what's weighing most" — more personal than a flat set.
    const eWeight: Record<string, number> = {};
    const sWeight: Record<string, number> = {};
    answers.forEach((a, i) => {
        const w = QUESTIONS[i].opts[a][1]; // 0–3
        if (w >= 2) {
            QUESTIONS[i].emotions.forEach(x => { eWeight[x] = (eWeight[x] || 0) + w; });
            QUESTIONS[i].signs.forEach(x => { sWeight[x] = (sWeight[x] || 0) + w; });
        }
    });
    const emotionsRanked = Object.entries(eWeight).sort((a, b) => b[1] - a[1]).map(([name, weight]) => ({ name, weight }));
    const emotions = emotionsRanked.map(e => e.name);
    const signs = Object.entries(sWeight).sort((a, b) => b[1] - a[1]).map(([k]) => k);
    if (emotions.length === 0) emotions.push('Mostly at ease');
    if (signs.length === 0) signs.push('No strong signs right now');
    const topTwo = emotions.slice(0, 2);

    return {
        score, tier,
        emotions,
        emotionsRanked,
        signs,
        topTwo,
        archetype: archetypeFor(answers, score),
    };
}

// Maps each body/life sign to an icon so "where it shows up" reads at a glance.
const SIGN_ICONS: Record<string, any> = {
    'Energy': Battery, 'Sleep': Moon, 'Focus': Brain, 'Relationships': Users,
    'Motivation': Flame, 'Chest tension': Heart, 'Neck and shoulders': Bone,
    'Jaw tension': Activity, 'Digestion': Utensils,
};

// ─── Micro-practice — one tiny thing to do today, per theme ──────────────────
const PRACTICES: Record<string, string> = {
    burnout: 'Put one thing down today — actually take it off your list. Notice the small relief.',
    overthinking: 'Write the looping thought on paper, then physically close the notebook. The loop needs somewhere to land.',
    peoplepleasing: 'Say one small, honest “no” today. Just one. Notice that the world stays standing.',
    loneliness: 'Send one message to someone you miss — no agenda, just “thinking of you.”',
    grief: 'Place a hand on your chest and let yourself feel the weight for 60 seconds. You don’t have to fix it — only acknowledge it.',
    resentment: 'Finish this sentence on paper: “What I never got to say is…” No one else has to read it.',
    numbness: 'Name one thing you can feel right now — warm, tired, restless. Start there.',
    anxiety: 'Breathe out slowly, longer than you breathe in, for one minute. It tells your body the danger has passed.',
    stuck: 'Pick the smallest possible next step and do only that one thing. Momentum starts tiny.',
    shame: 'Say the kind thing you’d tell a friend in your situation — out loud, to yourself.',
    chronicstress: 'Take two minutes to do absolutely nothing. No phone. Let your shoulders drop.',
    avoidance: 'Name the thing you’re avoiding, out loud. Naming it takes away half its size.',
    perfectionism: 'Leave one small thing today deliberately good-enough, not perfect. Notice you’re still okay.',
    trustissues: 'Share one small, true thing with someone safe today. Trust rebuilds in steps, not leaps.',
    guilt: 'Name one thing you’ve been blaming yourself for — and say, “I did the best I could with what I knew then.”',
    relationshipstress: 'Tell one person something true and kind you’ve been holding back. Connection grows where honesty does.',
    purpose: 'Name one thing that felt meaningful today, however small. Meaning is rebuilt one noticing at a time.',
};

// ─── 7-day trend (stored locally, no account needed) ──────────────────────────
type Entry = { d: number; score: number };
const HISTORY_KEY = 'ehc_history';
function loadHistory(): Entry[] {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); } catch { return []; }
}
function recordToday(score: number): Entry[] {
    let h = loadHistory().filter(x => x.d !== DAY_INDEX);
    h.push({ d: DAY_INDEX, score });
    h = h.sort((a, b) => a.d - b.d).slice(-14);
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(h)); } catch { /* ignore */ }
    return h;
}

// ─── Share card (renders the daily insight as an image for social) ────────────
function wrapCanvasText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lh: number) {
    const words = text.split(' ');
    let line = '';
    for (const w of words) {
        const test = line ? `${line} ${w}` : w;
        if (ctx.measureText(test).width > maxW && line) {
            ctx.fillText(line, x, y);
            line = w; y += lh;
        } else { line = test; }
    }
    if (line) ctx.fillText(line, x, y);
    return y;
}

async function buildShareImage(theme: Theme): Promise<Blob | null> {
    const S = 1080;
    const c = document.createElement('canvas');
    c.width = S; c.height = S;
    const ctx = c.getContext('2d');
    if (!ctx) return null;
    try { await (document as any).fonts?.load('500 60px "Cormorant Garamond"'); await (document as any).fonts?.load('italic 600 60px "Cormorant Garamond"'); } catch { /* fallback to serif */ }

    // Calming gradient base + soft drifting blobs
    const bg = ctx.createRadialGradient(S * 0.32, S * 0.24, 90, S * 0.5, S * 0.5, S * 0.95);
    bg.addColorStop(0, '#FBF7F0'); bg.addColorStop(1, '#ECE2D2');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, S, S);
    ctx.save();
    try { ctx.filter = 'blur(48px)'; } catch { /* older browsers */ }
    ctx.globalAlpha = 0.28; ctx.fillStyle = '#E2C9A6';
    ctx.beginPath(); ctx.arc(S * 0.86, S * 0.16, 150, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 0.22; ctx.fillStyle = '#D6C2A6';
    ctx.beginPath(); ctx.arc(S * 0.12, S * 0.9, 170, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    ctx.strokeStyle = 'rgba(176,137,95,0.45)'; ctx.lineWidth = 3; ctx.strokeRect(54, 54, S - 108, S - 108);
    ctx.textBaseline = 'middle';

    // brand
    ctx.fillStyle = '#B0895F'; ctx.beginPath(); ctx.arc(126, 150, 9, 0, Math.PI * 2); ctx.fill();
    ctx.font = '600 30px Inter, system-ui, sans-serif'; ctx.fillStyle = '#A99F8E';
    ctx.fillText('M I N D G Y M', 150, 152);

    // theme
    ctx.font = '600 28px Inter, system-ui, sans-serif'; ctx.fillStyle = '#B0895F';
    ctx.fillText(`TODAY’S REFLECTION · ${theme.name.toUpperCase()}`, 120, 248);

    // insight quote
    ctx.font = 'italic 600 64px "Cormorant Garamond", Georgia, serif'; ctx.fillStyle = '#403A30';
    wrapCanvasText(ctx, `“${theme.insight}”`, 120, 380, S - 240, 84);

    // footer
    ctx.font = '500 26px Inter, system-ui, sans-serif'; ctx.fillStyle = '#A99F8E';
    ctx.fillText('A 2-minute daily emotional check-in', 120, S - 184);
    ctx.fillStyle = '#8A6A40';
    ctx.font = '600 28px Inter, system-ui, sans-serif';
    ctx.fillText(SITE_LABEL, 120, S - 142);
    ctx.font = '400 22px Inter, system-ui, sans-serif'; ctx.fillStyle = '#A99F8E';
    ctx.fillText('Designed by SKRM Bliss AI', 120, S - 108);

    return await new Promise<Blob | null>(res => c.toBlob(res, 'image/png'));
}

// ─── Animated circular score gauge ────────────────────────────────────────────
function ScoreRing({ score, color, fill, label }: { score: number; color: string; fill: string; label: string }) {
    const [shown, setShown] = useState(0);   // count-up number
    const [armed, setArmed] = useState(false); // triggers the CSS ring sweep
    const R = 78, C = 2 * Math.PI * R;
    useEffect(() => {
        // Ring fill: CSS transition on dashoffset — reliable even if rAF is throttled.
        const armT = setTimeout(() => setArmed(true), 60);
        // Number count-up via rAF, with a guaranteed final-value fallback in case
        // rAF is paused (e.g. a backgrounded tab on mount).
        let raf = 0; const start = performance.now(); const dur = 1100;
        const tick = (t: number) => {
            const p = Math.min(1, (t - start) / dur);
            setShown(Math.round(score * (1 - Math.pow(1 - p, 3))));
            if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        const fallback = setTimeout(() => setShown(score), dur + 120);
        return () => { cancelAnimationFrame(raf); clearTimeout(armT); clearTimeout(fallback); };
    }, [score]);
    const offset = armed ? C * (1 - score / 100) : C; // C = empty, sweeps to filled
    return (
        <div style={{ position: 'relative', width: 184, height: 184, margin: '0 auto' }}>
            <svg viewBox="0 0 184 184" width="184" height="184" style={{ transform: 'rotate(-90deg)' }}>
                <defs>
                    <linearGradient id="ehc-ring-grad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0" stopColor={fill} />
                        <stop offset="1" stopColor={color} />
                    </linearGradient>
                </defs>
                <circle cx="92" cy="92" r={R} fill="none" stroke="#E2D8C5" strokeWidth="11" />
                <circle cx="92" cy="92" r={R} fill="none" stroke="url(#ehc-ring-grad)" strokeWidth="11"
                    strokeLinecap="round" strokeDasharray={C}
                    strokeDashoffset={offset}
                    style={{ transition: 'stroke-dashoffset 1.1s cubic-bezier(0.22,1,0.36,1)' }} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span className="serif" style={{ fontSize: 52, lineHeight: 1, color, fontWeight: 500 }}>{shown}</span>
                <span style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#A99F8E', marginTop: 6 }}>{label} load</span>
            </div>
        </div>
    );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function EmotionalHealthCheck() {
    const [stage, setStage] = useState<'intro' | 'quiz' | 'result'>('intro');
    const [email, setEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [saved, setSaved] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [cur, setCur] = useState(0);
    const [answers, setAnswers] = useState<(number | null)[]>(Array(QUESTIONS.length).fill(null));
    const [copied, setCopied] = useState(false);
    const [sharing, setSharing] = useState(false);
    const [locked, setLocked] = useState(false);
    const [history, setHistory] = useState<Entry[]>([]);

    useEffect(() => {
        trackActivity('PAGE_VISIT_EMOTIONAL_HEALTH', `Visited — theme ${THEME.name}`);
        // OG / Twitter meta for rich link previews when the share URL is sent.
        const og = [
            ['og:title', `Today's reflection · ${THEME.name} — MindGym`],
            ['og:description', `${THEME.hook} A 2-minute daily emotional check-in.`],
            ['og:url', SHARE_URL],
            ['og:type', 'website'],
            ['og:image', `${window.location.origin}/emotions/${THEME.key}.jpg`],
            ['twitter:card', 'summary_large_image'],
            ['twitter:title', `Today's reflection · ${THEME.name}`],
            ['twitter:description', THEME.hook],
            ['twitter:image', `${window.location.origin}/emotions/${THEME.key}.jpg`],
        ];
        const added: HTMLMetaElement[] = [];
        og.forEach(([property, content]) => {
            const m = document.createElement('meta');
            const attr = property.startsWith('og:') ? 'property' : 'name';
            m.setAttribute(attr, property);
            m.setAttribute('content', content);
            document.head.appendChild(m);
            added.push(m);
        });
        const prevTitle = document.title;
        document.title = `Today's reflection · ${THEME.name} — MindGym`;
        return () => { added.forEach(m => m.remove()); document.title = prevTitle; };
    }, []);

    // Swipe gestures on quiz — left = back. Forward swipes are intentionally
    // ignored: the user must tap an answer to move on.
    const touch = useState<{ x: number; y: number } | null>(null);
    const onTouchStart = (e: React.TouchEvent) => { touch[1]({ x: e.touches[0].clientX, y: e.touches[0].clientY }); };
    const onTouchEnd = (e: React.TouchEvent) => {
        const s = touch[0]; if (!s) return;
        const dx = e.changedTouches[0].clientX - s.x;
        const dy = e.changedTouches[0].clientY - s.y;
        if (Math.abs(dx) > 60 && Math.abs(dy) < 50 && dx > 0 && cur > 0 && !locked) setCur(cur - 1);
        touch[1](null);
    };

    // Tap-to-advance: pick an answer and move on automatically — no Next button.
    const pick = (i: number) => {
        if (locked) return;
        const next = [...answers];
        next[cur] = i;
        setAnswers(next);
        setLocked(true);
        setTimeout(() => {
            setLocked(false);
            if (cur === QUESTIONS.length - 1) {
                const r = computeResult(next as number[]);
                trackActivity('EMOTIONAL_HEALTH_COMPLETE', `Theme ${THEME.name} · load ${r.score} · ${r.archetype.name}`);
                setHistory(recordToday(r.score));
                setStage('result');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                setCur(cur + 1);
            }
        }, 320);
    };

    // Optional email capture — now AFTER results, to save them / send tomorrow's.
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = email.trim().toLowerCase();
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmed)) {
            setErrorMsg('Please enter a valid email address.');
            return;
        }
        setErrorMsg('');
        setSubmitting(true);
        try {
            await addDoc(collection(db, 'waitlist'), {
                email: trimmed,
                source: 'emotional_health_quiz',
                userAgent: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 200) : '',
                createdAt: serverTimestamp(),
            });
            localStorage.setItem('journal_access_email', trimmed);
            trackActivity('EMAIL_FORM_SUBMIT', `Email saved — theme ${THEME.name}`, trimmed);
            setSaved(true);
        } catch (err) {
            console.warn('Lead capture failed:', err);
            setErrorMsg('Something went wrong — please try again.');
        }
        setSubmitting(false);
    };

    const onShare = async () => {
        if (sharing) return;
        setSharing(true);
        const text = `${THEME.share} — a daily emotional check-in from MindGym`;
        const nav = navigator as any;
        const isAbort = (e: any) => e && (e.name === 'AbortError' || e.name === 'NotAllowedError' && /cancel/i.test(e.message || ''));

        // Desktop / universal fallback: download the card image + copy the line.
        const downloadFallback = async (blob: Blob | null) => {
            if (blob) {
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = 'mindgym-insight.png';
                document.body.appendChild(a); // Firefox needs it in the DOM
                a.click();
                a.remove();
                URL.revokeObjectURL(a.href);
            }
            try { if (navigator.clipboard) await navigator.clipboard.writeText(`${text} ${SHARE_URL}`); } catch { /* clipboard blocked */ }
            setCopied(true);
            setTimeout(() => setCopied(false), 2600);
            trackActivity('EMOTIONAL_HEALTH_SHARE', `download · ${THEME.key}`);
        };

        let blob: Blob | null = null;
        try { blob = await buildShareImage(THEME); } catch { /* canvas failed — share text only */ }
        const file = blob ? new File([blob], 'mindgym-insight.png', { type: 'image/png' }) : null;

        // 1. Native share with the image (mobile / supported desktops)
        if (file && nav.canShare && nav.canShare({ files: [file] })) {
            try {
                await nav.share({ files: [file], text, url: SHARE_URL });
                trackActivity('EMOTIONAL_HEALTH_SHARE', `image · ${THEME.key}`);
                setSharing(false);
                return;
            } catch (e) {
                if (isAbort(e)) { setSharing(false); return; }   // user cancelled — stop
                /* otherwise fall through to download */
            }
        }
        // 2. Native share, text + link only
        if (nav.share) {
            try {
                await nav.share({ text, url: SHARE_URL });
                trackActivity('EMOTIONAL_HEALTH_SHARE', `text · ${THEME.key}`);
                setSharing(false);
                return;
            } catch (e) {
                if (isAbort(e)) { setSharing(false); return; }
                /* fall through to download */
            }
        }
        // 3. Guaranteed fallback so the button always *does* something
        await downloadFallback(blob);
        setSharing(false);
    };

    const result = stage === 'result' ? computeResult(answers as number[]) : null;

    return (
        <div className="ehc min-h-screen antialiased" style={{ background: '#F4EFE6', color: '#2E2A24', position: 'relative', overflowX: 'clip' }}>
            <style>{`
                /* Global body has overflow-x:hidden which turns it into a scroll
                   container and breaks the sticky side panel. clip avoids that
                   while still preventing horizontal scroll. Scoped to this page. */
                body { overflow-x: clip !important; }
                .ehc { font-feature-settings: "liga" 1; }
                .ehc .serif { font-family: 'Cormorant Garamond', Georgia, 'Times New Roman', serif; }
                @keyframes ehc-breathe { 0%,100% { transform: scale(0.82); opacity: 0.55; } 50% { transform: scale(1.12); opacity: 0.9; } }
                @keyframes ehc-rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
                .ehc-rise { animation: ehc-rise 0.9s cubic-bezier(0.22,1,0.36,1) both; }
                .ehc-orb { width: 84px; height: 84px; border-radius: 50%;
                    background: radial-gradient(circle at 50% 45%, rgba(176,137,95,0.45), rgba(176,137,95,0.05) 70%);
                    animation: ehc-breathe 7s ease-in-out infinite; }
                .ehc input::placeholder { color: #B7AE9E; }
                .ehc-hero-wrap { position: relative; border-radius: 24px; overflow: hidden; margin-bottom: 28px;
                    box-shadow: 0 6px 20px rgba(120,90,50,0.10); }
                .ehc-hero-img { width: 100%; height: 230px; object-fit: cover; display: block; }
                .ehc-hero-grad { position: absolute; inset: 0; pointer-events: none;
                    background: linear-gradient(180deg, rgba(46,42,36,0) 38%, rgba(46,42,36,0.55) 100%); }
                .ehc-hero-tag { position: absolute; left: 18px; bottom: 16px; color: #F4EFE6;
                    font-size: 12px; letter-spacing: 0.22em; text-transform: uppercase; display: flex; align-items: center; gap: 8px; }
                .ehc-quote-mark { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 90px; line-height: 0.4;
                    color: rgba(176,137,95,0.32); display: block; height: 34px; }
                @keyframes ehc-bar { from { width: 0; } to { width: var(--w); } }
                .ehc-bar { width: var(--w); animation: ehc-bar 1s cubic-bezier(0.22,1,0.36,1) both; }
                @media (prefers-reduced-motion: reduce) { .ehc-bar { animation: none; } }
            `}</style>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&display=swap" />

            <header className="max-w-xl mx-auto px-6 pt-9 pb-2 flex items-center gap-2.5 relative z-10">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#B0895F' }} />
                <span className="text-[12px] tracking-[0.3em] uppercase" style={{ color: '#A99F8E' }}>MindGym</span>
            </header>

            <main className="px-6 pb-24 relative z-10">
                {/* ─── INTRO (no email — results come first) ─── */}
                {stage === 'intro' && (
                    <section className="pt-12 ehc-rise max-w-xl mx-auto">
                        {/* Calming theme image (nano-banana). Falls back to the breathing orb. */}
                        <div className="ehc-hero-wrap">
                            <img
                                src={`/emotions/${THEME.key}.jpg`}
                                alt=""
                                className="ehc-hero-img"
                                onError={(e) => {
                                    const img = e.currentTarget;
                                    const wrap = img.closest('.ehc-hero-wrap') as HTMLElement;
                                    if (wrap) wrap.style.display = 'none';
                                    (wrap?.nextElementSibling as HTMLElement)?.style.removeProperty('display');
                                }}
                            />
                            <div className="ehc-hero-grad" />
                            <div className="ehc-hero-tag"><span className="w-1.5 h-1.5 rounded-full" style={{ background: '#E2C9A6' }} />Today’s reflection</div>
                        </div>
                        <div className="ehc-orb mb-9" style={{ display: 'none' }} />
                        <p className="text-[12px] tracking-[0.24em] uppercase mb-6" style={{ color: '#B0895F' }}>
                            Today’s reflection · {THEME.name}
                        </p>
                        <h1 className="serif text-[clamp(36px,6vw,56px)] font-normal leading-[1.08]" style={{ color: '#2E2A24' }}>
                            How much are you<br className="hidden sm:block" /> really carrying?
                        </h1>
                        <p className="serif italic text-[20px] mt-6 leading-relaxed" style={{ color: '#8A7F6E' }}>
                            {THEME.hook}
                        </p>
                        <p className="mt-6 text-[16px] leading-relaxed" style={{ color: '#6B6357' }}>
                            A 2-minute check-in that reveals what may be sitting beneath the surface — with a fresh
                            insight and one small thing to try, each day.
                        </p>

                        <button
                            onClick={() => { trackActivity('EMOTIONAL_HEALTH_START', `Started — theme ${THEME.name}`); setStage('quiz'); }}
                            className="mt-10 inline-flex items-center justify-center gap-2 px-9 py-3.5 rounded-full text-[15px] tracking-wide transition active:scale-[0.99]"
                            style={{ background: '#2E2A24', color: '#F4EFE6' }}
                        >
                            Start today’s check <ArrowRight className="w-4 h-4" />
                        </button>
                        <p className="mt-6 text-[13px]" style={{ color: '#A99F8E' }}>
                            10 quick taps · a new theme every day · free · no email needed to see your results
                        </p>
                    </section>
                )}

                {/* ─── QUIZ ─── */}
                {stage === 'quiz' && (
                    <section className="pt-12 max-w-xl mx-auto" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
                        <div className="flex items-center gap-4 mb-12">
                            <div className="flex-1 h-px relative" style={{ background: '#E2D8C5' }}>
                                <div className="absolute left-0 top-0 h-px transition-all duration-700"
                                    style={{ width: `${((cur + 1) / QUESTIONS.length) * 100}%`, background: '#B0895F' }} />
                            </div>
                            <span className="text-[12px] tracking-wider tabular-nums" style={{ color: '#A99F8E' }}>
                                {cur + 1} / {QUESTIONS.length}
                            </span>
                        </div>

                        <p key={cur} className="serif ehc-rise text-[clamp(24px,4vw,30px)] font-normal leading-[1.3] mb-9" style={{ color: '#2E2A24' }}>
                            {QUESTIONS[cur].q}
                        </p>
                        <div className="space-y-2.5">
                            {QUESTIONS[cur].opts.map(([text], i) => {
                                const sel = answers[cur] === i;
                                return (
                                    <button key={i} onClick={() => pick(i)}
                                        className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl border text-left transition"
                                        style={{ borderColor: sel ? '#B0895F' : '#E2D8C5', background: sel ? 'rgba(176,137,95,0.07)' : 'transparent' }}>
                                        <span className="w-[18px] h-[18px] rounded-full border-2 flex-shrink-0 transition-colors"
                                            style={{ borderColor: sel ? '#B0895F' : '#D0C5B1', background: sel ? '#B0895F' : 'transparent' }} />
                                        <span className="text-[15px]" style={{ color: '#544D41' }}>{text}</span>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="flex items-center justify-between mt-9">
                            <button onClick={() => !locked && cur > 0 && setCur(cur - 1)}
                                className={`text-[14px] transition ${cur === 0 ? 'invisible' : ''}`} style={{ color: '#A99F8E' }}>
                                ← Back
                            </button>
                            <span className="text-[12px]" style={{ color: '#BDB3A2' }}>
                                {cur === QUESTIONS.length - 1 ? 'Tap to see your results'
                                    : cur === Math.floor(QUESTIONS.length / 2) ? 'Halfway — keep going'
                                    : 'Tap an answer to continue'}
                            </span>
                        </div>
                    </section>
                )}

                {/* ─── RESULT ─── */}
                {stage === 'result' && result && (
                    <section className="pt-12 ehc-rise max-w-5xl mx-auto flex flex-col lg:grid lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-10 lg:items-start">

                        {/* ── Pinned daily panel: insight, practice & actions ──
                            Sticky on the left for desktop; drops below the findings on mobile. */}
                        <aside className="order-2 lg:order-1 lg:sticky lg:top-6 space-y-4 mt-12 lg:mt-1">
                            {/* Daily insight */}
                            <div className="rounded-3xl px-6 py-7" style={{ background: 'linear-gradient(155deg, #EFE7D8 0%, #E6DAC6 100%)', boxShadow: '0 10px 28px rgba(120,90,50,0.10)' }}>
                                <span className="ehc-quote-mark" aria-hidden="true">“</span>
                                <p className="text-[11px] tracking-[0.16em] uppercase mb-3" style={{ color: '#B0895F' }}>Today’s insight</p>
                                <p className="serif italic text-[22px] leading-snug" style={{ color: '#403A30' }}>{THEME.insight}</p>
                            </div>

                            {/* Micro-practice — one tiny thing to try today */}
                            <div className="rounded-2xl px-5 py-5 border" style={{ borderColor: '#B0895F', background: 'rgba(176,137,95,0.06)' }}>
                                <p className="text-[11px] tracking-[0.16em] uppercase mb-2" style={{ color: '#B0895F' }}>Try this · 60 seconds</p>
                                <p className="text-[16px] leading-relaxed" style={{ color: '#403A30' }}>{PRACTICES[THEME.key]}</p>
                            </div>

                            {/* Save results / opt-in */}
                            <div className="rounded-2xl px-5 py-6 border" style={{ borderColor: '#D8CDBA', background: 'rgba(176,137,95,0.05)' }}>
                                {saved ? (
                                    <div className="text-center">
                                        <Check className="w-6 h-6 mx-auto mb-2" style={{ color: '#5E7D2E' }} />
                                        <p className="serif text-[20px]" style={{ color: '#2E2A24' }}>Saved.</p>
                                        <p className="text-[14px] mt-1" style={{ color: '#6B6357' }}>We’ll send tomorrow’s reflection your way.</p>
                                    </div>
                                ) : (
                                    <>
                                        <p className="serif text-[20px] leading-tight" style={{ color: '#2E2A24' }}>Keep this — and tomorrow’s</p>
                                        <p className="text-[14px] mt-1.5 leading-relaxed" style={{ color: '#6B6357' }}>
                                            Save your results and get tomorrow’s reflection by email. One quiet note a day. No spam — unsubscribe in one click.
                                        </p>
                                        <form onSubmit={handleSave} className="mt-4">
                                            <div className="flex flex-col gap-2.5">
                                                <input
                                                    type="text"
                                                    value={email}
                                                    onChange={(e) => { setEmail(e.target.value); setErrorMsg(''); }}
                                                    placeholder="you@example.com"
                                                    autoCapitalize="none"
                                                    spellCheck={false}
                                                    className="bg-transparent border-b pb-2.5 text-[16px] focus:outline-none transition-colors"
                                                    style={{ borderColor: errorMsg ? '#C2664C' : '#D8CDBA', color: '#2E2A24' }}
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={submitting}
                                                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-[14px] tracking-wide transition active:scale-[0.99] disabled:opacity-50"
                                                    style={{ background: '#2E2A24', color: '#F4EFE6' }}
                                                >
                                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save & subscribe'}
                                                </button>
                                            </div>
                                            {errorMsg && <p className="mt-2 text-[13px]" style={{ color: '#C2664C' }}>{errorMsg}</p>}
                                        </form>
                                    </>
                                )}
                            </div>

                            {/* Shareable insight */}
                            <div className="rounded-2xl px-5 py-5 text-center border" style={{ borderColor: '#D8CDBA' }}>
                                <p className="serif italic text-[18px] leading-snug" style={{ color: '#564E42' }}>“{THEME.share}”</p>
                                <button onClick={onShare} disabled={sharing}
                                    className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[14px] transition active:scale-[0.98] border disabled:opacity-60"
                                    style={{ borderColor: '#B0895F', color: '#8A6A40', background: 'transparent' }}>
                                    {sharing ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating card…</>
                                        : copied ? <><Check className="w-4 h-4" /> Card saved</>
                                        : <><Share2 className="w-4 h-4" /> Share insight card</>}
                                </button>
                                <p className="text-[11px] mt-3" style={{ color: '#BDB3A2' }}>A beautiful image of today’s insight</p>
                            </div>
                        </aside>

                        {/* ── Main findings column ── */}
                        <div className="order-1 lg:order-2 min-w-0">
                        <p className="text-[12px] tracking-[0.24em] uppercase mb-5" style={{ color: '#B0895F' }}>
                            What we found · {THEME.name}
                        </p>
                        <h1 className="serif text-[clamp(32px,5vw,46px)] font-normal leading-[1.1]" style={{ color: '#2E2A24' }}>
                            {result.tier.headline}
                        </h1>

                        {/* In short — a one-line, skimmable summary */}
                        <p className="mt-5 text-[15px] leading-relaxed" style={{ color: '#8A6A40' }}>
                            <span style={{ fontWeight: 500 }}>In short — </span>
                            you’re carrying a {result.tier.weight.toLowerCase()} load right now
                            {result.topTwo[0] && result.topTwo[0] !== 'Mostly at ease'
                                ? `, mostly around ${result.topTwo.join(' and ').toLowerCase()}.`
                                : '.'}
                        </p>

                        <p className="mt-5 text-[16px] leading-relaxed" style={{ color: '#564E42' }}>{result.tier.summary[0]}</p>

                        {/* Snapshot — animated gauge + dimensional cards */}
                        <div className="mt-10 rounded-3xl px-5 py-8" style={{ background: 'linear-gradient(160deg, #FBF7F0 0%, #EFE6D6 100%)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6), 0 12px 30px rgba(120,90,50,0.08)' }}>
                            <ScoreRing score={result.score} color={result.tier.color} fill={result.tier.fill} label={result.tier.weight} />
                            {/* Four-step load scale — the active band lights up */}
                            <div className="mt-7">
                                <div className="flex gap-1.5">
                                    {['Light', 'Moderate', 'Heavy', 'Very Heavy'].map((t, i) => {
                                        const active = t === result.tier.weight;
                                        return (
                                            <div key={i} className="flex-1 text-center">
                                                <div className="h-2 rounded-full" style={{ background: active ? result.tier.fill : 'rgba(176,137,95,0.18)' }} />
                                                <div className="text-[9px] mt-1.5 tracking-wide" style={{ color: active ? result.tier.color : '#BDB3A2', fontWeight: active ? 600 : 400 }}>{t}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <p className="text-center text-[11px] mt-3" style={{ color: '#A99F8E' }}>
                                    Your body is speaking at a <span style={{ color: result.tier.color, fontWeight: 600 }}>{result.tier.body.toLowerCase()}</span> level
                                </p>
                            </div>
                        </div>

                        {/* 7-day trend (stored locally) */}
                        <div className="mt-9">
                            <p className="text-[12px] tracking-[0.12em] uppercase mb-3" style={{ color: '#A99F8E' }}>Your recent check-ins</p>
                            {(() => {
                                const pts = history.slice(-7);
                                if (pts.length < 2) {
                                    return (
                                        <p className="text-[14px] leading-relaxed" style={{ color: '#8A7F6E' }}>
                                            This is your first check-in. Come back tomorrow and you’ll start to see how your load shifts over the week.
                                        </p>
                                    );
                                }
                                const w = 280, h = 56;
                                const xs = (i: number) => (i / (pts.length - 1)) * w;
                                const ys = (s: number) => h - (s / 100) * h;
                                const line = pts.map((p, i) => `${xs(i).toFixed(1)},${ys(p.score).toFixed(1)}`).join(' ');
                                const last = pts[pts.length - 1].score, prev = pts[pts.length - 2].score;
                                const dir = last < prev - 3 ? 'A little lighter than last time.'
                                    : last > prev + 3 ? 'A little heavier than last time.'
                                    : 'About the same as last time.';
                                return (
                                    <div>
                                        <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="56" preserveAspectRatio="none" aria-label="Trend of your recent emotional load scores">
                                            <polyline points={line} fill="none" stroke="#B0895F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            {pts.map((p, i) => (
                                                <circle key={i} cx={xs(i)} cy={ys(p.score)} r={i === pts.length - 1 ? 3.5 : 2.5} fill={i === pts.length - 1 ? '#8A6A40' : '#B0895F'} />
                                            ))}
                                        </svg>
                                        <p className="text-[13px] mt-2" style={{ color: '#8A7F6E' }}>{dir}</p>
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Pattern / archetype */}
                        <div className="mt-10 rounded-2xl px-5 py-5 border" style={{ borderColor: '#D8CDBA', background: 'rgba(176,137,95,0.05)' }}>
                            <p className="text-[11px] tracking-[0.16em] uppercase mb-2" style={{ color: '#B0895F' }}>Your pattern right now</p>
                            <p className="serif text-[24px] leading-tight" style={{ color: '#2E2A24' }}>{result.archetype.name}</p>
                            <p className="text-[15px] leading-relaxed mt-2" style={{ color: '#6B6357' }}>{result.archetype.blurb}</p>
                        </div>

                        {/* What you're carrying — ranked intensity bars (visual) */}
                        {result.emotionsRanked.length > 0 && (
                            <div className="mt-10">
                                <p className="text-[12px] tracking-[0.12em] uppercase mb-4" style={{ color: '#A99F8E' }}>What you’re carrying</p>
                                <div className="space-y-3.5">
                                    {result.emotionsRanked.map((e, i) => {
                                        const max = result.emotionsRanked[0].weight || 1;
                                        const pct = Math.max(14, Math.round((e.weight / max) * 100));
                                        return (
                                            <div key={i}>
                                                <div className="flex justify-between items-baseline mb-1.5">
                                                    <span className="text-[14px]" style={{ color: i === 0 ? '#2E2A24' : '#6B6357', fontWeight: i === 0 ? 600 : 400 }}>{e.name}</span>
                                                    {i === 0 && <span className="text-[10px] tracking-[0.14em] uppercase" style={{ color: '#B0895F' }}>Strongest</span>}
                                                </div>
                                                <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(176,137,95,0.12)' }}>
                                                    <div className="ehc-bar h-2.5 rounded-full" style={{ ['--w' as any]: `${pct}%`, background: `linear-gradient(90deg, ${result.tier.fill}, ${result.tier.color})`, animationDelay: `${i * 90}ms` }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Where it shows up — icon tiles (visual) */}
                        {result.signs[0] !== 'No strong signs right now' && (
                            <div className="mt-10">
                                <p className="text-[12px] tracking-[0.12em] uppercase mb-4" style={{ color: '#A99F8E' }}>Where it tends to show up</p>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                                    {result.signs.map((z, i) => {
                                        const Icon = SIGN_ICONS[z] || Activity;
                                        return (
                                            <div key={i} className="rounded-2xl px-2 py-4 flex flex-col items-center gap-2 text-center" style={{ background: 'rgba(176,137,95,0.05)', border: '0.5px solid rgba(176,137,95,0.16)' }}>
                                                <Icon className="w-5 h-5" style={{ color: '#B0895F' }} strokeWidth={1.6} />
                                                <span className="text-[11px] leading-tight" style={{ color: '#6B6357' }}>{z}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Educational section */}
                        <div className="mt-12 pt-8 border-t" style={{ borderColor: '#E2D8C5' }}>
                            <p className="text-[12px] tracking-[0.12em] uppercase mb-3" style={{ color: '#A99F8E' }}>Something worth knowing</p>
                            <p className="serif text-[22px] leading-tight mb-3" style={{ color: '#2E2A24' }}>{THEME.edu.title}</p>
                            <p className="text-[16px] leading-relaxed" style={{ color: '#564E42' }}>{THEME.edu.body}</p>
                        </div>

                        {/* Conversion */}
                        <div className="mt-14 rounded-3xl px-6 py-9 sm:px-9" style={{ background: '#EBE3D5' }}>
                            <h2 className="serif text-[clamp(26px,4vw,34px)] font-normal leading-[1.15]" style={{ color: '#2E2A24' }}>
                                Begin meeting what surfaced
                            </h2>
                            {/* 3-step journey — visual, not a wall of text */}
                            <div className="mt-7 space-y-3">
                                {[
                                    { Icon: Eye, t: 'Notice', d: 'You’ve just seen the pattern.' },
                                    { Icon: Sprout, t: 'Practise', d: 'A few quiet minutes a day.' },
                                    { Icon: Compass, t: 'Shift', d: 'What you carry slowly lightens.' },
                                ].map(({ Icon, t, d }, i) => (
                                    <div key={i} className="flex items-center gap-3.5 rounded-2xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.45)' }}>
                                        <div className="flex items-center justify-center rounded-full flex-shrink-0" style={{ width: 40, height: 40, background: '#2E2A24' }}>
                                            <Icon className="w-[18px] h-[18px]" style={{ color: '#F4EFE6' }} strokeWidth={1.7} />
                                        </div>
                                        <div>
                                            <p className="text-[15px] font-medium leading-tight" style={{ color: '#2E2A24' }}>{t}</p>
                                            <p className="text-[13px] leading-snug" style={{ color: '#6B6357' }}>{d}</p>
                                        </div>
                                        {i < 2 && <ArrowRight className="w-4 h-4 ml-auto" style={{ color: '#C9BCA5' }} />}
                                    </div>
                                ))}
                            </div>
                            <p className="serif italic text-[18px] leading-snug mt-5" style={{ color: '#8A7F6E' }}>
                                MindGym is emotional fitness. You don’t have to do it all at once — only begin.
                            </p>

                            <a href={APP_URL}
                                onClick={() => trackActivity('EMOTIONAL_HEALTH_CTA', `CTA — theme ${THEME.name} · load ${result.score}`)}
                                className="mt-8 flex items-center justify-center gap-2 px-6 py-4 rounded-full text-[16px] tracking-wide transition active:scale-[0.99]"
                                style={{ background: '#2E2A24', color: '#F4EFE6' }}>
                                Begin meeting what surfaced with MindGym <ArrowRight className="w-4 h-4" />
                            </a>
                            <p className="text-center text-[13px] mt-4" style={{ color: '#A99F8E' }}>
                                Guided sessions, daily check-ins, and a quiet community — free to join.
                            </p>
                        </div>

                        <p className="text-center text-[13px] mt-8" style={{ color: '#A99F8E' }}>
                            Come back tomorrow — a new theme, a new insight, a new reflection.
                        </p>
                        <p className="text-[12px] mt-6 leading-relaxed" style={{ color: '#B3AA99' }}>
                            This is a reflective check-in for wellbeing, not a medical diagnosis. If you have health
                            concerns, please speak with a doctor or licensed therapist.
                        </p>
                        </div>{/* /main findings column */}
                    </section>
                )}
            </main>

            {/* Footer */}
            <footer className="relative z-10 text-center px-6 pb-10 pt-2">
                <div className="max-w-xl mx-auto pt-8 border-t" style={{ borderColor: '#E2D8C5' }}>
                    <p className="text-[13px]" style={{ color: '#A99F8E' }}>
                        Designed by{' '}
                        <a href={`https://${SITE_LABEL}`} target="_blank" rel="noopener noreferrer" style={{ color: '#8A6A40' }}>{SITE_LABEL}</a>
                    </p>
                    <p className="text-[12px] mt-1.5" style={{ color: '#A99F8E' }}>
                        Need to connect?{' '}
                        <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: '#8A6A40' }}>{CONTACT_EMAIL}</a>
                    </p>
                </div>
            </footer>

            {/* Sticky mobile CTA on result — always-visible MindGym button */}
            {stage === 'result' && (
                <div className="sm:hidden" style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 40, padding: '10px 14px 14px', background: 'linear-gradient(180deg, rgba(244,239,230,0) 0%, rgba(244,239,230,0.96) 32%)' }}>
                    <a href={APP_URL}
                        onClick={() => trackActivity('EMOTIONAL_HEALTH_CTA', `Sticky CTA — theme ${THEME.name}`)}
                        className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-full text-[15px]"
                        style={{ background: '#2E2A24', color: '#F4EFE6', boxShadow: '0 8px 24px rgba(46,42,36,0.22)' }}>
                        Begin with MindGym <ArrowRight className="w-4 h-4" />
                    </a>
                </div>
            )}

            {/* Floating contact — WhatsApp + email */}
            <div style={{ position: 'fixed', right: '18px', bottom: '18px', zIndex: 50, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <a href={`mailto:${CONTACT_EMAIL}`} aria-label="Email us" title={CONTACT_EMAIL}
                    onClick={() => trackActivity('CONTACT_EMAIL_CLICK', 'floating')}
                    style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#2E2A24', color: '#F4EFE6', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(0,0,0,0.18)' }}>
                    <Mail className="w-5 h-5" />
                </a>
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" aria-label="Chat with us on WhatsApp" title="WhatsApp +91 82175 81238"
                    onClick={() => trackActivity('CONTACT_WHATSAPP_CLICK', 'floating')}
                    style={{ width: '54px', height: '54px', borderRadius: '50%', background: '#25D366', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.22)' }}>
                    <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" aria-hidden="true">
                        <path d="M17.5 14.38c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.49-.9-.8-1.5-1.78-1.67-2.08-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35zM12.05 2.92a9.05 9.05 0 00-7.7 13.84l-1.27 4.64 4.75-1.25a9.05 9.05 0 104.22-17.23z"/>
                    </svg>
                </a>
            </div>
        </div>
    );
}
