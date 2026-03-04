// @ts-nocheck
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles, Sun, Wind, Brain, ArrowLeft, Clock, Flame,
    PenTool, Save, MessageSquare, Zap, Anchor, Moon,
    Coffee, Lightbulb, X, Trophy, Target, Timer, Droplet,
    Search, Play, ChevronRight, CheckCircle2, ChevronDown, Info
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { ThemeToggle, useTheme } from '../../theme/ThemeSystem';
import { MeditationPortal } from '../../components/ui/MeditationPortal';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { VoiceService } from '../../services/voiceService';
import { createPortal } from 'react-dom';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Situation {
    id: string;
    title: string;
    whenToUse: string;
    description: string;
    duration: string;
    durationNum: number; // minutes
    category: 'Morning' | 'Work' | 'Emotions' | 'Sleep' | 'Quick';
    tags: string[];
    icon: React.ElementType;
    imageLight?: string;
    imageDark?: string;
    color: string;
    intro: string;
    steps: { title: string; instruction: string; audioScript: string }[];
    realLifeExample: string;
    journalPrompts: { label: string; placeholder: string }[];
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const SITUATIONS: Situation[] = [
    {
        id: 'morning-scan', title: 'Morning Energy Scan', duration: '3 min',
        durationNum: 3, category: 'Morning', tags: ['wake up', 'body scan', 'energy', 'morning'],
        whenToUse: 'First thing in the morning, before checking your phone',
        description: 'Set your emotional state for the day by connecting with your inner body.',
        icon: Sun, color: '#ABCEC9',
        intro: "Good morning. Before the world rushes in, let's check in with your inner aliveness.",
        steps: [
            { title: 'Foundational Breath', instruction: 'While still in bed, lie on your back. Take three deep breaths.', audioScript: 'While still in bed, lie on your back. Take three slow, deep breaths. Feel the air filling your lungs and the gentle release as you exhale. Arrive fully in this moment.' },
            { title: 'The Scan', instruction: 'Starting at your toes, slowly scan up through your body.', audioScript: 'Starting at your toes, slowly draw your attention upward. Move through your feet, your legs... slowly scanning through your torso, your arms, all the way to the top of your head.' },
            { title: 'Internal Inquiry', instruction: "Ask at each part: 'How does this feel from the inside?'", audioScript: "As your awareness passes through each part of your body, ask silently: How does this feel from the inside? Don't visualize it. FEEL it." }
        ],
        realLifeExample: 'Sarah practiced this for a week. She discovered that on mornings when her chest felt tight and heavy, she was actually anxious about work—even though her mind was saying "I\'m fine."',
        journalPrompts: [
            { label: 'What parts of my body felt most alive?', placeholder: 'e.g., fingertips, chest...' },
            { label: 'What parts felt numb or disconnected?', placeholder: 'e.g., lower back, feet...' },
            { label: 'What is my body telling me about my emotional state today?', placeholder: 'Listen to the inner signal...' }
        ]
    },
    {
        id: 'traffic-light', title: 'Traffic Light Check-In', duration: '30 sec',
        durationNum: 0.5, category: 'Quick', tags: ['pause', 'commute', 'micro-practice', 'quick'],
        whenToUse: "Throughout the day at 'traffic lights' — moments when you naturally pause",
        description: 'Turn waiting time into presence time. Perfect for red lights or elevators.',
        icon: Wind, color: '#ABCEC9',
        intro: 'Let\'s use this pause to reconnect.',
        steps: [
            { title: 'Pause & Breathe', instruction: "Pause whatever you're doing. Take one deep breath.", audioScript: 'Stop for a moment. Take one conscious, deep breath. Feel the pause.' },
            { title: 'Quick Interior Scan', instruction: 'Feel your body from within - quick scan.', audioScript: 'Quickly scan your body from within. What\'s the dominant sensation? Tension? Ease? Heaviness? Just notice it.' },
            { title: 'Acknowledge the Emotion', instruction: 'Notice the sensation and acknowledge the connected emotion.', audioScript: 'That sensation is connected to an emotion. Just acknowledge it without judgment. Witness it, and stay present.' }
        ],
        realLifeExample: 'Marcus started doing this every time he stopped at a red light. He discovered he was carrying massive shoulder tension. Just noticing it helped the tension release.',
        journalPrompts: [
            { label: "What 'traffic lights' did I use today?", placeholder: 'e.g., elevator, boiling water...' },
            { label: 'What did I notice in my body?', placeholder: 'e.g., shoulders tight, stomach relaxed...' },
            { label: 'Were there patterns?', placeholder: 'Notice the cycle...' }
        ]
    },
    {
        id: 'emotional-detective', title: 'Emotional Detective', duration: '5 min',
        durationNum: 5, category: 'Emotions', tags: ['mood', 'identify', 'sensation', 'feelings'],
        whenToUse: "When you notice you're in a 'mood' but can't identify the emotion",
        description: 'Trace sensations back to their emotional roots.',
        icon: Brain, color: '#C65F9D',
        intro: "You're feeling something, but you don't know what. Let's find out together.",
        steps: [
            { title: 'Go Within', instruction: "Sit quietly and close your eyes. Say: 'I'm feeling something, but I don't know what'", audioScript: "Sit quietly. Close your eyes. Say to yourself: I am feeling something... but I don't know what it is yet. That's okay. We are just going to look." },
            { title: 'Sensation Search', instruction: 'Scan slowly: chest, stomach, throat, shoulders, jaw, face.', audioScript: 'Bring your attention to your body. Scan slowly... your chest, your stomach, your throat...' },
            { title: 'Feel the Quality', instruction: 'Stay with the sensation. Is it tight? Fluttery? Heavy? Hot? Cold?', audioScript: "Stay with that sensation. Don't try to name it yet. Just feel its quality." },
            { title: 'The Reveal', instruction: 'In time, the emotion will reveal itself through the sensation.', audioScript: 'Rest here. Often, the emotion will reveal itself through the sensation. You aren\'t forcing it.' }
        ],
        realLifeExample: "Jennifer felt 'off' all day. She did this practice and noticed a heavy, sinking feeling revealing grief she'd been too busy to acknowledge.",
        journalPrompts: [
            { label: 'Where in my body was the sensation strongest?', placeholder: 'e.g., solar plexus, throat...' },
            { label: 'How would I describe the sensation?', placeholder: 'e.g., tight, fluttery, heavy...' },
            { label: 'What emotion did it turn out to be?', placeholder: 'The name of the feeling...' },
            { label: 'How did I feel after acknowledging it?', placeholder: 'The shift in your state...' }
        ]
    },
    {
        id: 'difficult-conversation', title: 'Difficult Conversation Prep', duration: '3 min',
        durationNum: 3, category: 'Work', tags: ['presentation', 'grounding', 'anxiety', 'focus'],
        whenToUse: 'Before a challenging conversation, presentation, or difficult task',
        description: 'Ground your energy so you can speak from presence rather than reactivity.',
        icon: MessageSquare, color: '#F4E3DA',
        intro: 'You are about to enter a challenging space. Let\'s find your center first.',
        steps: [
            { title: 'Physical Grounding', instruction: 'Sit or stand with feet firmly on the ground. Close your eyes.', audioScript: "Sit or stand with your feet firmly on the ground. Feel the solid earth beneath you. Close your eyes and bring your awareness into this moment." },
            { title: 'Feeling the Foundation', instruction: 'Feel your feet on the floor - really feel the contact.', audioScript: 'Really feel the contact of your feet on the floor. The weight, the pressure. You are supported. You are here.' },
            { title: 'Internal Aliveness', instruction: 'Feel your whole body - the aliveness throughout.', audioScript: 'Now expand your awareness to your whole body. Feel the subtle aliveness, the vibration of life throughout your entire frame.' },
            { title: 'The Shift', instruction: 'Notice fear or anxiety. Breathe into them.', audioScript: "Notice any fear or nervousness. Don't fight it. Breathe into those sensations. Say silently: This energy is here to help me be alert and present." }
        ],
        realLifeExample: 'David always got terrible anxiety before presentations. By feeling the anxiety instead of fighting it, the intensity reduced by half.',
        journalPrompts: [
            { label: 'What sensations did I notice before?', placeholder: 'e.g., butterflies, tight throat...' },
            { label: 'How did feeling my body help?', placeholder: 'Did it ground you?' },
            { label: 'Did the situation go differently than usual?', placeholder: 'Notice the change...' }
        ]
    },
    {
        id: 'anger-release', title: 'Anger Release', duration: '10 min',
        durationNum: 10, category: 'Emotions', tags: ['anger', 'frustration', 'release', 'fire'],
        whenToUse: "When you're angry but can't express it appropriately",
        description: "Witness the fire of anger without letting it burn you or others.",
        icon: Zap, color: '#C65F9D',
        intro: 'There is fire in the system. Let\'s give it space to transform.',
        steps: [
            { title: 'Find Privacy', instruction: 'Find privacy and sit comfortably.', audioScript: "Find a private space. Sit comfortably. This is your time to be with this energy without judgment." },
            { title: 'Locate the Fire', instruction: 'Where do you feel anger? (jaw, fists, chest)', audioScript: "Where do you feel this anger? Is it in your jaw? Your fists? Your chest or stomach? Just locate the heat." },
            { title: 'Full Immersion', instruction: "Feel the energy - hot, tight, buzzing. Don't make it go away.", audioScript: "Feel the energy of the anger fully. Is it hot? Buzzing? Tight? It's just energy. Don't push it away." },
            { title: 'Vocal Release', instruction: 'Breathe into those areas. Make a sound (growl, sigh, hum).', audioScript: "Breathe directly into the heat. If it helps, make a low sound... a growl, a deep sigh, or a hum." }
        ],
        realLifeExample: "Lisa's boss criticized her unfairly. She sat in her car and did this practice. After 10 minutes, the rage transformed into calm clarity.",
        journalPrompts: [
            { label: 'Where did I feel the anger in my body?', placeholder: 'Describe the physical location...' },
            { label: 'What did it feel like?', placeholder: 'The texture of the anger...' },
            { label: 'What happened as I stayed with the sensation?', placeholder: 'How did it change?' },
            { label: 'How do I feel now?', placeholder: 'Your current mental state...' }
        ]
    },
    {
        id: 'anxiety-grounding', title: 'Anxiety Grounding', duration: '5 min',
        durationNum: 5, category: 'Emotions', tags: ['anxiety', 'panic', 'grounding', '5-4-3-2-1'],
        whenToUse: 'During anxiety attacks or when feeling overwhelmed and panicky',
        description: 'The 5-4-3-2-1 technique to anchor yourself in the physical world.',
        icon: Anchor, color: '#ABCEC9',
        intro: 'The mind is racing, but the earth is stable. Let\'s come back to what is real.',
        steps: [
            { title: 'Physical Anchor', instruction: 'Sit or stand with feet firmly on the ground. Press them into the floor.', audioScript: 'Feet on the ground. Press them down. Feel the pressure. You are here. You are safe.' },
            { title: 'Outer Vision', instruction: 'Name 5 things you can see.', audioScript: 'Look around you. Name five things you can see right now. One... two... three... four... five.' },
            { title: 'Sensory Check', instruction: 'Name 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste.', audioScript: 'Now, touch four different surfaces... listen for three distinct sounds. Notice two things you can smell. And one thing you can taste.' },
            { title: 'Full Presence', instruction: 'Bring attention to your whole body. Feel yourself solid and present.', audioScript: 'Bring your attention back to your whole body. You are solid. You are present. You are more grounded than the anxiety.' }
        ],
        realLifeExample: "Tom suffered from panic attacks. By grounding in his body through the senses, he could ride out the panic without it escalating.",
        journalPrompts: [
            { label: 'What were my anxiety symptoms?', placeholder: 'e.g., racing heart, tight chest...' },
            { label: 'How did the 5-4-3-2-1 grounding help?', placeholder: 'What shifted in your focus?' },
            { label: 'How did my body feel before vs. after?', placeholder: 'Compare the states...' }
        ]
    },
    {
        id: 'sleep-body-scan', title: 'Sleep Body Scan', duration: '10 min',
        durationNum: 10, category: 'Sleep', tags: ['sleep', 'night', 'relax', 'insomnia', 'rest'],
        whenToUse: 'Every night before bed to process emotions and improve sleep',
        description: "Process the day's emotions and improve sleep by scanning your body.",
        icon: Moon, color: '#ABCEC9',
        intro: 'The day is over. Let\'s surrender the weight of it to the earth.',
        steps: [
            { title: 'The Breath Anchor', instruction: 'Feel the weight of your body on the mattress. Take 3 deep, slow breaths.', audioScript: 'Feel your weight on the bed. Give in to gravity. Take three slow, deep breaths... releasing the day with every exhale.' },
            { title: 'Melting Scan', instruction: 'Scan from toes to head. As you reach a body part, feel it "melting" into the bed.', audioScript: 'Scan slowly... toes, feet, ankles... letting them melt. Up through your legs, hips, torso... every muscle letting go. Up to your shoulders, arms, hands... melting into the mattress. Up to your neck, jaw, eyes... complete release.' },
            { title: 'The Silent Observer', instruction: 'Let go of any remaining thoughts. Just be the empty space for sleep to arise.', audioScript: 'Behind the sensations is awareness. Resting as that awareness. Sleep will come when it is ready. You are simply here.' }
        ],
        realLifeExample: "Emma struggled with insomnia for years. By releasing physical tension, the mental racing quieted. Within two weeks, she was falling asleep 30 minutes faster.",
        journalPrompts: [
            { label: 'What tension did I notice before releasing it?', placeholder: 'e.g., jaw, shoulders...' },
            { label: 'What emotions came up during the scan?', placeholder: 'e.g., worry about tomorrow...' }
        ]
    },
    {
        id: 'lunch-break-reset', title: 'Lunch Break Reset', duration: '5 min',
        durationNum: 5, category: 'Work', tags: ['midday', 'reset', 'work', 'recharge', 'burnout'],
        whenToUse: 'Midday when you need to reset and recharge',
        description: 'Reset your energy midday to avoid afternoon burnout.',
        icon: Coffee, color: '#F4E3DA',
        intro: 'Morning is done. Let\'s refresh your internal atmosphere.',
        steps: [
            { title: 'Sense Withdrawal', instruction: 'Close your laptop. Put away your phone. Close your eyes for 1 min.', audioScript: 'Close your eyes. Step away from the digital world for just one minute.' },
            { title: 'Taste Awareness', instruction: 'Eat your first 3 bites in complete silence, focusing only on the texture and flavour.', audioScript: 'Take your first bite slowly. Feel the texture. Experience the flavor fully. Just eating. Nothing else.' },
            { title: 'Inner Space', instruction: 'Feel the energy in your body. Let the "worker" identity dissolve for a few minutes.', audioScript: 'Feel the energy within. You are not "the worker" right now. You are simply life, experiencing life.' }
        ],
        realLifeExample: "Kevin would power through 10-hour workdays, exhausted and irritable. By acknowledging frustration midday and releasing it, he had more energy for the afternoon.",
        journalPrompts: [
            { label: 'What emotions had accumulated by lunchtime?', placeholder: 'e.g., frustration, rush...' },
            { label: 'How did I feel after the reset?', placeholder: 'More clear? Calmer?' }
        ]
    },
    {
        id: '10-second-check', title: '10-Second Body Check', duration: '10 sec',
        durationNum: 0.17, category: 'Quick', tags: ['micro', 'quick', 'anytime', 'breath'],
        whenToUse: 'Wherever you are, whatever you\'re doing',
        description: 'A micro-dose of presence. One breath. One sensation. Done.',
        icon: Timer, color: '#C65F9D',
        intro: 'Ten seconds to come back to life.',
        steps: [
            { title: 'Deep Breath', instruction: 'Take one deep breath.', audioScript: 'Stop. Take one deep breath. Inhale... and exhale.' },
            { title: 'Feel Body', instruction: 'Feel your body for 10 seconds.', audioScript: 'For the next ten seconds, just feel your body. Right here. Right now.' },
            { title: 'One Sensation', instruction: 'Notice one sensation. That\'s it! Counts as practice.', audioScript: "Notice just one physical sensation. A rebel feeling. A warm spot. Anything. That's it. You're done." }
        ],
        realLifeExample: "Mike was a busy executive who 'didn't have time' to meditate. He started doing this between emails. His baseline stress level dropped noticeably.",
        journalPrompts: [
            { label: 'What one sensation did I notice?', placeholder: 'e.g., cold hands...' },
            { label: 'How many times did I manage to do it today?', placeholder: 'Number...' },
            { label: 'Did it break my autopilot mode?', placeholder: 'Yes/No...' }
        ]
    },
    {
        id: 'bathroom-break', title: 'Bathroom Break Practice', duration: '30 sec',
        durationNum: 0.5, category: 'Quick', tags: ['quick', 'private', 'anytime', 'micro'],
        whenToUse: 'Every time you go to the bathroom',
        description: 'Use a natural biological break as a spiritual break.',
        icon: Droplet, color: '#ABCEC9',
        intro: 'A private moment to return to yourself.',
        steps: [
            { title: 'Pause', instruction: 'Before leaving, close your eyes.', audioScript: 'Before you leave this private space, pause. Close your eyes.' },
            { title: 'Feel', instruction: 'Feel your body for 30 seconds.', audioScript: 'Feel your body for just thirty seconds. Drop out of your mind and into your skin.' },
            { title: 'Notice Emotions', instruction: 'Notice any emotions present.', audioScript: "Is there an emotion here? Just notice it. You don't have to fix it." },
            { title: 'Return', instruction: 'Return to your day.', audioScript: 'Open your eyes. Return to your day refreshed.' }
        ],
        realLifeExample: "Sarah used the bathroom as an escape from her chaotic open office. By adding this 30-second practice, she turned 'hiding' into 'recharging'.",
        journalPrompts: [
            { label: 'What mood was I in during the break?', placeholder: 'e.g., rushed, bored...' },
            { label: 'Did the pause change my re-entry to work?', placeholder: 'Describe...' }
        ]
    },
    {
        id: 'morning-coffee-ritual', title: 'Morning Coffee Ritual', duration: '2 min',
        durationNum: 2, category: 'Morning', tags: ['morning', 'ritual', 'coffee', 'intention'],
        whenToUse: 'While your coffee/tea is brewing',
        description: 'Turn waiting for caffeine into waiting for presence.',
        icon: Coffee, color: '#F4E3DA',
        intro: 'The brewing is happening. Let presence happen too.',
        steps: [
            { title: 'Stand Still', instruction: "Stand still while it brews.", audioScript: "Don't check your phone. Just stand still. Let the coffee brew." },
            { title: 'Feel Body', instruction: 'Feel your body standing there.', audioScript: 'Feel your feet on the floor. Feel your body standing here, waiting.' },
            { title: 'Set Intention', instruction: "Set an intention: 'Today I will notice my body'", audioScript: "Set a silent intention: Today, I will notice my body. Today, I will come back to myself." }
        ],
        realLifeExample: "John used to check news while his coffee brewed, starting his day with anxiety. Switching to this simple standing practice changed the tone of his entire morning.",
        journalPrompts: [
            { label: 'How hard was it not to check my phone?', placeholder: 'Scale 1-10...' },
            { label: 'Did I remember my intention later in the day?', placeholder: 'Yes/No...' }
        ]
    }
];

const FAQ_ITEMS = [
    { q: "What if I can't feel my body?", a: "That's perfectly normal. Just notice the 'numbness' or 'lack of sensation'. That is your sensation for now." },
    { q: "I keep getting distracted by thoughts.", a: "Expect thoughts to come. When you notice them, gently return to the physical sensation in your body." },
    { q: "How often should I practice?", a: "Frequency matters more than duration. Three 30-second checks are better than one long session." },
    { q: "Can I do these while driving?", a: "Only the 'Quick' practices that don't require closing your eyes. Always prioritize safety." },
];

const CHALLENGES = [
    { id: 'week-2', title: 'Week 2: Throughout the Day Awareness', description: 'Set an alarm every 2 hours. When it goes off, pause for 10 seconds and feel your body. Track how your body state changes throughout the day.', xpRequired: 500, week: 2 },
    { id: 'week-3', title: 'Week 3: Difficult Emotion Deep Dive', description: 'Next time a difficult emotion arises, instead of avoiding it, sit with it for 5 full minutes. Feel it completely in your body. Journal what happens.', xpRequired: 1000, week: 3 },
    { id: 'week-4', title: 'Week 4: Bring Awareness to Movement', description: 'During routine activities (showering, walking, eating), feel your body from within while moving.', xpRequired: 1500, week: 4 },
    { id: 'week-5', title: 'Week 5: The Silent Body Walk', description: 'Go for a 20-minute walk with no phone, no music, no podcast. Just walk and feel your body moving.', xpRequired: 2000, week: 5 },
    { id: 'week-6', title: 'Week 6: Body Wisdom Decision Making', description: 'Next time you have a decision to make, feel into your body with each option. Notice which creates expansion and which creates contraction.', xpRequired: 3000, week: 6 },
];

const COLLECTIONS = [
    { id: 'start-here', label: 'Start Here', desc: 'Best for beginners', ids: ['10-second-check', 'traffic-light', 'morning-scan'] },
    { id: 'emotional-toolkit', label: 'Emotional Toolkit', desc: 'For difficult feelings', ids: ['emotional-detective', 'anger-release', 'anxiety-grounding'] },
    { id: 'daily-anchors', label: 'Daily Anchors', desc: 'Build a daily practice', ids: ['morning-coffee-ritual', 'lunch-break-reset', 'sleep-body-scan'] },
];

const CATEGORIES = ['All', 'Morning', 'Work', 'Emotions', 'Sleep', 'Quick'] as const;
const DURATION_TABS = [
    { label: 'Any', fn: () => true },
    { label: '< 1 min', fn: (d: number) => d < 1 },
    { label: '1–5 min', fn: (d: number) => d >= 1 && d <= 5 },
    { label: '5–10 min', fn: (d: number) => d > 5 && d <= 10 },
    { label: '10+ min', fn: (d: number) => d > 10 },
];

// ─── SVG Illustrations ────────────────────────────────────────────────────────
const CollectionIcon = ({ type, color }: { type: string; color: string }) => {
    if (type === 'start-here') return (
        <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M28 44V34M28 34C24 34 20 31 20 27C20 23 23 20 28 20C33 20 36 23 36 27C36 31 32 34 28 34Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
            <path d="M28 20C28 14 34 10 34 10C34 10 32 16 28 20Z" fill={color} fillOpacity="0.2" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
            <circle cx="28" cy="28" r="24" stroke={color} strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />
        </svg>
    );
    if (type === 'emotional-toolkit') return (
        <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="22" cy="28" r="14" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.1" />
            <circle cx="34" cy="28" r="14" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.1" />
            <circle cx="28" cy="28" r="6" fill={color} />
        </svg>
    );
    return ( // daily-anchors / fallback
        <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M28 12V44M16 24C16 24 20 38 28 38C36 38 40 24 40 24" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <circle cx="28" cy="12" r="4" stroke={color} strokeWidth="2" />
        </svg>
    );
};

const EmptyStateIllustration = () => (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="60" r="40" stroke="var(--accent-primary)" strokeWidth="0.5" strokeDasharray="4 8" opacity="0.3">
            <animateTransform attributeName="transform" type="rotate" from="0 60 60" to="360 60 60" dur="20s" repeatCount="Infinity" />
        </circle>
        <circle cx="60" cy="60" r="25" stroke="var(--accent-primary)" strokeWidth="0.5" strokeDasharray="2 4" opacity="0.2">
            <animateTransform attributeName="transform" type="rotate" from="360 60 60" to="0 60 60" dur="15s" repeatCount="Infinity" />
        </circle>
        <path d="M50 60C50 54.4772 54.4772 50 60 50C65.5228 50 70 54.4772 70 60" stroke="var(--accent-primary)" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    </svg>
);

// ─── Sub-components ───────────────────────────────────────────────────────────
const DurationPill = ({ dur }: { dur: string }) => (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider"
        style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>
        <Clock size={12} />
        {dur}
    </span>
);

const CategoryPill = ({ cat }: { cat: string }) => {
    const colors: Record<string, string> = { Morning: '#ABCEC9', Work: '#9575CD', Emotions: '#FF7043', Sleep: '#5C6BC0', Quick: '#C65F9D' };
    const c = colors[cat] || 'var(--text-muted)';
    return (
        <span className="inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest"
            style={{ background: c + '15', color: c, border: `1px solid ${c}30` }}>
            {cat}
        </span>
    );
};

const SituationalPracticeCard = ({ situation, onClick, mode }: { situation: Situation; onClick: () => void; mode: 'light' | 'dark' }) => {
    const Icon = situation.icon;
    const accent = situation.color;
    const isLight = mode === 'light';

    const categoryStyles: Record<string, { gradient: string; tint: string; pattern?: string }> = {
        Morning: {
            gradient: isLight
                ? `linear-gradient(135deg, rgba(255,183,77,0.15) 0%, rgba(255,243,224,0.1) 100%)`
                : `linear-gradient(135deg, rgba(255,183,77,0.1) 0%, rgba(255,183,77,0.02) 100%)`,
            tint: '#FFB74D'
        },
        Sleep: {
            gradient: isLight
                ? `linear-gradient(135deg, rgba(92,107,192,0.15) 0%, rgba(232,234,246,0.1) 100%)`
                : `linear-gradient(135deg, rgba(92,107,192,0.1) 0%, rgba(92,107,192,0.02) 100%)`,
            tint: '#5C6BC0'
        },
        Emotions: {
            gradient: isLight
                ? `linear-gradient(135deg, rgba(255,112,67,0.15) 0%, rgba(255,243,224,0.1) 100%)`
                : `linear-gradient(135deg, rgba(255,112,67,0.1) 0%, rgba(255,112,67,0.02) 100%)`,
            tint: '#FF7043'
        },
        Quick: {
            gradient: isLight
                ? `linear-gradient(135deg, rgba(198,95,157,0.1) 0%, rgba(252,228,236,0.05) 100%)`
                : `linear-gradient(135deg, rgba(198,95,157,0.08) 0%, rgba(198,95,157,0.01) 100%)`,
            tint: '#C65F9D'
        },
        Work: {
            gradient: 'transparent',
            tint: '#9575CD',
            pattern: 'geometric'
        }
    };

    const style = categoryStyles[situation.category] || categoryStyles.Morning;

    return (
        <motion.button
            whileHover={{ y: -6, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className="flex-shrink-0 w-64 rounded-[32px] overflow-hidden text-left transition-all group relative border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.4)]"
            style={{ isolation: 'isolate' }}
        >
            {/* Category Ambient Wash */}
            <div
                className="absolute inset-0 z-0 pointer-events-none opacity-40 group-hover:opacity-80 transition-opacity duration-700"
                style={{ background: style.gradient }}
            />

            {/* Header Visual Area */}
            <div className="h-36 w-full relative overflow-hidden bg-gradient-to-b from-transparent to-[var(--bg-surface)]/20">
                {/* Dynamic Glow Orbs */}
                <div
                    className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-1000"
                    style={{
                        background: `radial-gradient(circle at 10% 20%, ${accent}40 0%, transparent 60%), 
                                     radial-gradient(circle at 90% 80%, ${accent}20 0%, transparent 50%)`,
                        filter: 'blur(25px)'
                    }}
                />

                {/* Grid/Pattern overlay */}
                {situation.category === 'Work' && (
                    <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.03] pointer-events-none"
                        style={{
                            backgroundImage: `linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)`,
                            backgroundSize: '16px 16px'
                        }}
                    />
                )}

                {/* Subtle Grain Texture for premium feel */}
                <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
                />

                {/* Massive Watermark Icon (Abstracted Background) */}
                <div className="absolute -right-8 -top-8 opacity-[0.03] dark:opacity-[0.05] group-hover:opacity-[0.07] transition-all duration-1000 rotate-[-12deg] group-hover:rotate-0 scale-110">
                    <Icon size={160} strokeWidth={0.5} style={{ color: accent }} />
                </div>

                {/* Floating Icon with Pulse for Quick category */}
                <div className="absolute top-6 left-6 z-20">
                    <div className="relative">
                        {situation.category === 'Quick' && (
                            <motion.div
                                animate={{
                                    scale: [1, 1.4, 1.8],
                                    opacity: [0.3, 0.1, 0]
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "easeOut"
                                }}
                                className="absolute inset-[-12px] rounded-full"
                                style={{ border: `2px solid ${accent}` }}
                            />
                        )}
                        <div className="p-3.5 rounded-2xl backdrop-blur-md bg-white/40 dark:bg-black/20 border border-white/40 dark:border-white/10 shadow-[0_8px_16px_-4px_rgba(0,0,0,0.1)] relative z-10 transition-transform duration-500 group-hover:scale-110">
                            <Icon size={22} style={{ color: isLight ? accent : 'white' }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="p-6 pt-2 space-y-4 relative z-10">
                <div className="space-y-1.5">
                    <h4 className="text-lg font-serif leading-tight group-hover:text-[var(--accent-primary)] transition-colors" style={{ color: 'var(--text-primary)' }}>
                        {situation.title}
                    </h4>
                    <p className="text-[13px] leading-relaxed line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                        {situation.description}
                    </p>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                    <DurationPill dur={situation.duration} />
                </div>
            </div>
        </motion.button>
    );
};


// ─── Main Component ───────────────────────────────────────────────────────────
export const SituationalPractices: React.FC<{ onBack: () => void; isAdmin?: boolean }> = ({ onBack, isAdmin }) => {
    const { mode } = useTheme();
    const { user } = useAuth();
    const [selectedSituation, setSelectedSituation] = useState<Situation | null>(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [isPracticing, setIsPracticing] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [showLogEntry, setShowLogEntry] = useState(false);
    const [journalData, setJournalData] = useState<Record<string, string>>({});

    // Browse state
    const [query, setQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<typeof CATEGORIES[number]>('All');
    const [activeDuration, setActiveDuration] = useState(0);
    const [showFAQ, setShowFAQ] = useState(false);
    const [showChallenges, setShowChallenges] = useState(false);

    const filtered = useMemo(() => {
        return SITUATIONS.filter(s => {
            const matchCat = activeCategory === 'All' || s.category === activeCategory;
            const matchDur = DURATION_TABS[activeDuration].fn(s.durationNum);
            const q = query.toLowerCase();
            const matchQ = !q || s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q) || s.tags.some(t => t.includes(q));
            return matchCat && matchDur && matchQ;
        });
    }, [query, activeCategory, activeDuration]);

    const speak = useCallback((text: string, onEnd?: () => void) => {
        if (isPaused) return;
        VoiceService.speak(text, { onEnd });
    }, [isPaused]);

    const handleReset = useCallback(() => { VoiceService.stop(); setCurrentStep(0); }, []);

    const handleNextStep = useCallback(() => {
        if (!selectedSituation) return;
        if (currentStep < selectedSituation.steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            setIsPracticing(false);
            setShowLogEntry(true);
        }
    }, [currentStep, selectedSituation]);

    useEffect(() => {
        if (isPracticing && selectedSituation && !isPaused) {
            speak(selectedSituation.steps[currentStep].audioScript, handleNextStep);
        } else {
            VoiceService.stop();
        }
    }, [currentStep, isPracticing, selectedSituation, speak, handleNextStep, isPaused]);

    const handleSaveJournal = async () => {
        if (!user || !selectedSituation) return;
        try {
            await addDoc(collection(db, 'users', user.uid, 'situational-logs'), {
                situationId: selectedSituation.id,
                situationTitle: selectedSituation.title,
                responses: journalData,
                type: 'situational',
                date: new Date().toLocaleDateString(),
                createdAt: serverTimestamp()
            });
            onBack();
        } catch (error) {
            console.error('Error saving log:', error);
        }
    };

    // ── Practice mode ──
    if (isPracticing && selectedSituation) {
        return createPortal(
            <MeditationPortal
                title={selectedSituation.title}
                currentStepTitle={selectedSituation.steps[currentStep]?.title || "Preparing..."}
                currentStepInstruction={selectedSituation.steps[currentStep]?.instruction || "Arriving in the present moment..."}
                onNext={handleNextStep}
                onReset={handleReset}
                onTogglePlay={() => setIsPaused(!isPaused)}
                isPlaying={!isPaused}
                progress={selectedSituation.steps.length > 0 ? (currentStep + 1) / selectedSituation.steps.length : 0}
            />,
            document.body
        );
    }

    // ── Journal mode ──
    if (showLogEntry && selectedSituation) {
        return (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto pb-32 relative">
                {/* Completion Header Gradient */}
                <div className="fixed top-0 left-0 right-0 h-40 pointer-events-none -z-10 opacity-30"
                    style={{ background: `linear-gradient(to bottom, ${selectedSituation.color}40, transparent)` }} />

                <div className="space-y-10">
                    <button onClick={() => setShowLogEntry(false)}
                        className="flex items-center gap-2 transition-all group"
                        style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Back</span>
                    </button>

                    <header className="space-y-6 text-center">
                        <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center shadow-lg mb-4"
                            style={{ background: selectedSituation.color, color: 'white' }}>
                            <CheckCircle2 size={32} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.4em]" style={{ color: selectedSituation.color }}>Practice Complete</h3>
                            <div className="flex items-center justify-center gap-4">
                                {React.createElement(selectedSituation.icon, { size: 24, style: { color: selectedSituation.color }, opacity: 0.6 })}
                                <h1 className="text-4xl font-serif font-light" style={{ color: 'var(--text-primary)' }}>Reflect</h1>
                            </div>
                        </div>
                    </header>

                    <div className="space-y-7 bg-[var(--bg-surface)] p-8 rounded-[40px] border border-[var(--border-subtle)] shadow-sm">
                        {selectedSituation.journalPrompts.map((prompt, i) => (
                            <div key={i} className="space-y-3">
                                <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>{prompt.label}</label>
                                <textarea
                                    value={journalData[prompt.label] || ''}
                                    onChange={e => setJournalData({ ...journalData, [prompt.label]: e.target.value })}
                                    placeholder={prompt.placeholder}
                                    className="w-full rounded-2xl p-6 text-lg font-serif outline-none resize-none min-h-[140px] transition-all focus:border-[var(--accent-primary)]"
                                    style={{
                                        background: 'var(--bg-secondary)',
                                        border: '1px solid var(--border-default)',
                                        color: 'var(--text-primary)',
                                    }}
                                />
                            </div>
                        ))}

                        <button onClick={handleSaveJournal}
                            className="w-full py-5 rounded-3xl font-bold uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 transition-all hover:brightness-110 active:scale-95 shadow-xl"
                            style={{ background: selectedSituation.color, color: 'white' }}>
                            <Save className="w-4 h-4" /> Seal Reflection
                        </button>
                    </div>
                </div>
            </motion.div>
        );
    }

    // ── Main browse view ──
    const timeOfDayTint = useMemo(() => {
        const hour = new Date().getHours();
        if (hour >= 6 && hour < 12) return 'radial-gradient(circle at top right, rgba(255,183,77,0.06), transparent 50%)';
        if (hour >= 17 && hour < 21) return 'radial-gradient(circle at top right, rgba(255,112,67,0.06), transparent 50%)';
        if (hour >= 21 || hour < 6) return 'radial-gradient(circle at top right, rgba(92,107,192,0.1), transparent 50%)';
        return 'none';
    }, []);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10 pb-32 relative">
            {/* Ambient Time of Day Tint */}
            <div className="fixed inset-0 pointer-events-none -z-10" style={{ background: timeOfDayTint }} />

            {/* Header */}
            <header className="relative py-8 md:py-12 px-6 md:px-8 rounded-[32px] overflow-hidden group">
                <Search size={14} className="absolute left-5 top-1/2 -translate-y-1/2 opacity-40 text-[var(--text-primary)]" />
                {/* Ambient Aura */}
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[400px] h-[400px] rounded-full blur-[100px] opacity-10 pointer-events-none"
                    style={{ background: 'var(--accent-primary)' }} />

                <div className="relative z-10 space-y-4">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <p className="text-[10px] uppercase tracking-[0.4em] font-bold opacity-60" style={{ color: 'var(--text-muted)' }}>Sacred Realm</p>
                            <h1 className="text-4xl md:text-6xl font-serif font-light tracking-tight" style={{ color: 'var(--text-primary)' }}>
                                The Practice Room
                            </h1>
                        </div>
                        <button onClick={() => setShowFAQ(!showFAQ)}
                            className="p-3 rounded-2xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2 group/faq"
                            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                            <Info size={16} className="opacity-60 group-hover/faq:opacity-100 transition-opacity" />
                            <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">How to Practice</span>
                            <ChevronDown size={14} className={`transition-transform duration-300 ${showFAQ ? 'rotate-180' : ''}`} />
                        </button>
                    </div>

                    <p className="max-w-xl text-base md:text-lg font-serif italic leading-relaxed opacity-80" style={{ color: 'var(--text-secondary)' }}>
                        Turn the friction of daily life into the fuel of presence. Select a state to begin.
                    </p>

                    {/* Inline FAQ */}
                    <AnimatePresence>
                        {showFAQ && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-dashed border-border-default mt-6">
                                    {FAQ_ITEMS.map((item, i) => (
                                        <div key={i} className="p-4 rounded-2xl space-y-1" style={{ background: 'var(--bg-secondary)' }}>
                                            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--accent-primary)' }}>{item.q}</p>
                                            <p className="text-xs leading-relaxed opacity-70" style={{ color: 'var(--text-secondary)' }}>{item.a}</p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </header>

            {/* Search + Filters Sticky Bar */}
            <div className="sticky top-0 z-20 py-4 -mx-4 px-4 bg-base/80 backdrop-blur-md space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search size={14} className="absolute left-5 top-1/2 -translate-y-1/2 opacity-40" />
                        <input
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="Find a practice by mood, tag, or duration..."
                            className="w-full pl-12 pr-6 py-4 rounded-2xl text-sm outline-none transition-all focus:ring-2 focus:ring-accent-primary/20"
                            style={{
                                background: 'var(--bg-surface)',
                                border: '1px solid var(--border-default)',
                                color: 'var(--text-primary)',
                            }}
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                        {CATEGORIES.map(cat => (
                            <button key={cat} onClick={() => setActiveCategory(cat)}
                                className="whitespace-nowrap px-6 py-3.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all"
                                style={{
                                    background: activeCategory === cat ? 'var(--accent-primary)' : 'var(--bg-surface)',
                                    color: activeCategory === cat ? 'var(--bg-base)' : 'var(--text-secondary)',
                                    border: activeCategory === cat ? 'none' : '1px solid var(--border-default)',
                                    boxShadow: activeCategory === cat ? '0 8px 16px -4px var(--accent-primary-muted)' : 'none'
                                }}>
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1">
                    {DURATION_TABS.map((tab, i) => (
                        <button key={tab.label} onClick={() => setActiveDuration(i)}
                            className="whitespace-nowrap flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all"
                            style={{
                                color: activeDuration === i ? 'var(--text-primary)' : 'var(--text-muted)',
                                background: activeDuration === i ? 'var(--bg-secondary)' : 'transparent',
                            }}>
                            <Clock size={10} className={activeDuration === i ? 'text-accent-primary' : 'opacity-40'} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Curated Collections — only when unfiltered */}
            {activeCategory === 'All' && activeDuration === 0 && !query && (
                <div className="space-y-12">
                    {COLLECTIONS.map(col => {
                        const colItems = col.ids.map(id => SITUATIONS.find(s => s.id === id)!).filter(Boolean);
                        const colColors: Record<string, string> = { 'start-here': '#ABCEC9', 'emotional-toolkit': '#FF7043', 'daily-anchors': '#9575CD' };
                        const accent = colColors[col.id];

                        return (
                            <section key={col.id} className="space-y-6">
                                <div className="flex items-center gap-5">
                                    <div className="p-1 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm">
                                        <CollectionIcon type={col.id} color={accent} />
                                    </div>
                                    <div className="space-y-0.5">
                                        <h3 className="text-2xl font-serif font-light" style={{ color: 'var(--text-primary)' }}>{col.label}</h3>
                                        <p className="text-[10px] uppercase tracking-widest font-bold opacity-50" style={{ color: 'var(--text-muted)' }}>{col.desc}</p>
                                    </div>
                                </div>
                                <div className="flex gap-6 overflow-x-auto pb-8 -mx-4 px-4 no-scrollbar scroll-smooth">
                                    {colItems.map(sit => (
                                        <SituationalPracticeCard
                                            key={sit.id}
                                            situation={sit}
                                            onClick={() => setSelectedSituation(sit)}
                                            mode={mode}
                                        />
                                    ))}
                                </div>
                            </section>
                        );
                    })}
                    <div className="pt-8 border-t border-dashed border-border-default">
                        <h3 className="text-[11px] uppercase tracking-[0.4em] font-bold opacity-40" style={{ color: 'var(--text-muted)' }}>Discovery Library</h3>
                    </div>
                </div>
            )}

            {/* Compact list of filtered results */}
            <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                    {filtered.length === 0 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="py-16 text-center space-y-6">
                            <div className="flex justify-center">
                                <EmptyStateIllustration />
                            </div>
                            <div className="space-y-2">
                                <p className="text-xl font-serif italic text-[var(--text-muted)]">
                                    The path is clear, but no practices match...
                                </p>
                                <button onClick={() => { setQuery(''); setActiveCategory('All'); setActiveDuration(0); }}
                                    className="px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-[var(--accent-primary-border)] text-[var(--accent-primary)] hover:bg-[var(--accent-primary-muted)]/10 transition-all">
                                    Clear all filters
                                </button>
                            </div>
                        </motion.div>
                    )}
                    {filtered.map((sit, i) => {
                        const Icon = sit.icon;
                        return (
                            <motion.button
                                key={sit.id}
                                layout
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ delay: i * 0.02 }}
                                whileTap={{ scale: 0.99 }}
                                onClick={() => {
                                    setCurrentStep(0);
                                    setIsPaused(false);
                                    setShowLogEntry(false);
                                    setSelectedSituation(sit);
                                }}
                                className="w-full flex items-center gap-5 p-3 rounded-[24px] text-left group transition-all duration-300"
                                style={{
                                    background: 'var(--bg-surface)',
                                    border: '1px solid var(--border-subtle)',
                                }}
                            >
                                <div className="w-16 h-16 flex-shrink-0 rounded-2xl overflow-hidden relative bg-secondary">
                                    {(mode === 'dark' ? sit.imageDark : sit.imageLight) ? (
                                        <img src={mode === 'dark' ? sit.imageDark : sit.imageLight} alt="" className="w-full h-full object-cover opacity-80" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center opacity-20">
                                            <Icon size={24} />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 py-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="text-[15px] font-serif font-medium" style={{ color: 'var(--text-primary)' }}>{sit.title}</span>
                                        {/* Category pill only shown if filtered results are mixed */}
                                        {activeCategory === 'All' && <CategoryPill cat={sit.category} />}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <DurationPill dur={sit.duration} />
                                        <div className="w-1 h-1 rounded-full bg-border-default md:block hidden" />
                                        <p className="text-xs truncate opacity-60 md:block hidden" style={{ color: 'var(--text-secondary)' }}>{sit.description}</p>
                                    </div>
                                </div>
                                <div className="pr-2 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-4 group-hover:translate-x-0 group-focus:opacity-100 group-focus:translate-x-0">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg transform transition-transform active:scale-90"
                                        style={{ background: sit.color, color: 'white' }}>
                                        <Play size={14} fill="currentColor" />
                                    </div>
                                </div>
                            </motion.button>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Progressive Challenges */}
            <section className="pt-16">
                <div className="bg-secondary/30 rounded-[32px] p-8 border border-border-subtle">
                    <div className="flex items-center justify-between cursor-pointer group/chal" onClick={() => setShowChallenges(!showChallenges)}>
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                                <Trophy size={20} className="text-accent-primary" />
                            </div>
                            <div>
                                <h2 className="text-xl font-serif font-light" style={{ color: 'var(--text-primary)' }}>Progressive Challenges</h2>
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">Expand your horizon</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 opacity-40 group-hover/chal:opacity-100 transition-opacity">
                            <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:block">View 5 Challenges</span>
                            <ChevronDown size={18} />
                        </div>
                    </div>
                </div>
            </section>

            {/* Progressive Challenges Content */}
            <AnimatePresence>
                {showChallenges && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-12">
                            {CHALLENGES.map(challenge => {
                                const isUnlocked = false;
                                return (
                                    <div key={challenge.id}
                                        className="p-7 rounded-[32px] border transition-all relative overflow-hidden group/card"
                                        style={{
                                            background: isUnlocked ? 'var(--bg-surface)' : 'var(--bg-secondary)',
                                            borderColor: isUnlocked ? 'var(--border-default)' : 'var(--border-subtle)',
                                        }}>
                                        {!isUnlocked && (
                                            <div className="absolute top-6 right-6 opacity-30 group-hover/card:opacity-60 transition-opacity">
                                                <Target size={18} />
                                            </div>
                                        )}
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full"
                                                style={{
                                                    background: isUnlocked ? 'var(--accent-primary-muted)' : 'var(--bg-surface)',
                                                    color: isUnlocked ? 'var(--accent-primary)' : 'var(--text-muted)',
                                                    border: '1px solid var(--border-subtle)'
                                                }}>
                                                Phase {challenge.week}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-serif font-light mb-3" style={{ color: 'var(--text-primary)' }}>{challenge.title}</h3>
                                        <p className="text-sm leading-relaxed text-[var(--text-secondary)] opacity-70 mb-6">
                                            {challenge.description}
                                        </p>
                                        {!isUnlocked && (
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-[8px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                                                    <span>Unlock at {challenge.xpRequired} pts</span>
                                                    <span>120 / {challenge.xpRequired} XP</span>
                                                </div>
                                                <div className="h-1 w-full bg-[var(--border-subtle)] rounded-full overflow-hidden">
                                                    <div className="h-full bg-[var(--accent-primary)] rounded-full opacity-30" style={{ width: `${(120 / challenge.xpRequired) * 100}%` }} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Detail Modal Portal */}
            {selectedSituation && !isPracticing && !showLogEntry && createPortal(
                <AnimatePresence>
                    <div className="fixed inset-0 z-[110] flex items-end md:items-center justify-center p-0 md:p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setSelectedSituation(null)}
                        />
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="relative w-full md:max-w-xl max-h-[90vh] md:max-h-[80vh] overflow-y-auto rounded-t-[40px] md:rounded-[40px] shadow-2xl no-scrollbar"
                            style={{ background: 'var(--bg-base)', border: '1px solid var(--border-default)' }}
                        >
                            {/* Hero Gradient Zone */}
                            <div className="h-24 rounded-t-[40px] relative overflow-hidden flex flex-col items-center justify-center gap-1.5">
                                <div className="absolute inset-0 opacity-20" style={{ background: `linear-gradient(135deg, ${selectedSituation.color}, #ffffff00)` }} />
                                <button onClick={() => setSelectedSituation(null)}
                                    className="absolute top-3 right-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-all backdrop-blur-md">
                                    <X size={16} className="text-[var(--text-primary)]" />
                                </button>

                                <div className="relative">
                                    <div className="absolute inset-0 blur-xl opacity-40" style={{ background: selectedSituation.color }} />
                                    <div className="relative w-9 h-9 rounded-xl bg-white/80 dark:bg-black/40 flex items-center justify-center shadow-lg backdrop-blur-xl border border-white/20">
                                        {React.createElement(selectedSituation.icon, { size: 18, style: { color: selectedSituation.color }, strokeWidth: 1.5 })}
                                    </div>
                                </div>
                                <div className="flex gap-1.5 opacity-60 scale-90">
                                    <span className="text-[7px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                                        {selectedSituation.category}
                                    </span>
                                    <span className="text-[7px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                                        {selectedSituation.duration}
                                    </span>
                                </div>
                            </div>

                            <div className="px-5 pb-6 space-y-4">
                                <div className="text-center space-y-0.5">
                                    <h2 className="text-xl font-serif font-light leading-tight" style={{ color: 'var(--text-primary)' }}>{selectedSituation.title}</h2>
                                    <p className="text-[11px] font-serif italic text-[var(--text-secondary)] opacity-40">{selectedSituation.description}</p>
                                </div>

                                <div className="space-y-3">
                                    <div className="p-3 rounded-xl space-y-0.5" style={{ background: 'var(--bg-secondary)', borderLeft: `2px solid ${selectedSituation.color}50` }}>
                                        <p className="text-[7px] font-bold uppercase tracking-widest opacity-30">Ideal Guidance For</p>
                                        <p className="text-xs font-serif italic" style={{ color: 'var(--text-secondary)' }}>{selectedSituation.whenToUse}</p>
                                    </div>

                                    <div className="space-y-3">
                                        <p className="text-[7px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] text-center opacity-40">Pathway Journey</p>
                                        <div className="relative px-2">
                                            {/* Timeline Line */}
                                            <div className="absolute top-[12px] left-[30px] right-[30px] h-[1px] bg-[var(--border-default)] -z-0 opacity-50" />

                                            <div className="flex justify-between relative z-10">
                                                {selectedSituation.steps.map((step, i) => (
                                                    <div key={i} className="flex flex-col items-center gap-1.5 group/step max-w-[60px]">
                                                        <div className="w-6 h-6 rounded-full bg-[var(--bg-surface)] border-[1.5px] border-[var(--border-default)] flex items-center justify-center text-[8px] font-bold transition-all group-hover/step:border-[var(--accent-primary)]"
                                                            style={{ color: 'var(--text-primary)' }}>
                                                            {i + 1}
                                                        </div>
                                                        <div className="text-[7px] font-bold text-center leading-tight opacity-30 group-hover/step:opacity-80 transition-opacity uppercase tracking-widest">
                                                            {step.title.split(' ')[0]}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Detailed Step Content (current/interactive) */}
                                        <div className="grid gap-1.5 pt-1">
                                            {selectedSituation.steps.map((step, i) => (
                                                <div key={i} className="flex gap-2.5 p-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:border-[var(--accent-primary-border)] transition-all">
                                                    <div className="w-4 h-4 rounded-md bg-[var(--bg-surface)] flex items-center justify-center text-[8px] font-bold flex-shrink-0" style={{ color: selectedSituation.color }}>{i + 1}</div>
                                                    <div className="space-y-0">
                                                        <p className="text-[11px] font-bold" style={{ color: 'var(--text-primary)' }}>{step.title}</p>
                                                        <p className="text-[10px] leading-relaxed opacity-50" style={{ color: 'var(--text-secondary)' }}>{step.instruction}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="p-3 rounded-xl" style={{ background: 'var(--accent-primary-muted)', border: '1px solid var(--accent-primary)10' }}>
                                        <p className="text-[7px] font-bold uppercase tracking-widest mb-0.5 opacity-40" style={{ color: 'var(--accent-primary)' }}>Witness Account</p>
                                        <p className="text-[10px] font-serif italic leading-snug opacity-60">{selectedSituation.realLifeExample}</p>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center gap-2 pt-1">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => {
                                            setCurrentStep(0);
                                            setIsPaused(false);
                                            setShowLogEntry(false);
                                            setIsPracticing(true);
                                        }}
                                        className="relative w-12 h-12 rounded-full flex items-center justify-center shadow-xl group/portal"
                                    >
                                        <motion.div
                                            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.1, 0.3] }}
                                            transition={{ duration: selectedSituation.durationNum > 5 ? 6 : 3, repeat: Infinity, ease: "easeInOut" }}
                                            className="absolute inset-[-4px] rounded-full"
                                            style={{ background: selectedSituation.color }}
                                        />
                                        <div className="absolute inset-0 rounded-full shadow-[inset_0_0_10px_rgba(255,255,255,0.3)] bg-gradient-to-br from-white/20 to-transparent" />
                                        <div className="w-full h-full rounded-full flex items-center justify-center backdrop-blur-md border border-white/20"
                                            style={{ background: selectedSituation.color }}>
                                            <Play size={16} fill="white" className="text-white ml-0.5" />
                                        </div>
                                    </motion.button>
                                    <div className="text-center">
                                        <p className="text-[9px] font-bold uppercase tracking-[0.25em]" style={{ color: 'var(--text-primary)' }}>Begin Journey</p>
                                        <p className="text-[7px] font-bold uppercase tracking-widest opacity-20" style={{ color: 'var(--text-muted)' }}>Guided Voice Session</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </AnimatePresence>,
                document.body
            )}
        </motion.div>
    );
};
