// @ts-nocheck
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles, Sun, Wind, Brain, ArrowLeft, Clock, Flame,
    PenTool, Save, MessageSquare, Zap, Anchor, Moon,
    Coffee, Lightbulb, X, Trophy, Target, Timer, Droplet,
    Search, Play, ChevronDown, Volume2, Heart, HelpCircle
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { MeditationPortal } from '../../components/ui/MeditationPortal.tsx';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { VoiceService } from '../../services/voiceService';

/* ═══════════════════════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════════════════════ */

interface Step { title: string; instruction: string; audioScript: string }
interface Prompt { label: string; placeholder: string }
interface Situation {
    id: string; title: string; duration: string; durationNum: number;
    category: string; tags: string[]; whenToUse: string; description: string;
    icon: React.ElementType; color: string; intro: string;
    steps: Step[]; realLifeExample: string; journalPrompts: Prompt[];
}

const SITUATIONS: Situation[] = [
    {
        id: 'morning-scan', title: 'Morning Energy Scan', duration: '3 min', durationNum: 3,
        category: 'Morning', tags: ['wake up', 'body scan', 'energy'],
        whenToUse: 'First thing in the morning, before checking your phone',
        description: 'Set your emotional state for the day by connecting with your inner body.',
        icon: Sun, color: '#ABCEC9',
        intro: "Good morning. Before the world rushes in, let's check in with your inner aliveness.",
        steps: [
            { title: 'Foundational Breath', instruction: 'While still in bed, lie on your back. Take three deep breaths.', audioScript: 'While still in bed, lie on your back. Take three slow, deep breaths. Feel the air filling your lungs and the gentle release as you exhale. Arrive fully in this moment.' },
            { title: 'The Scan', instruction: 'Starting at your toes, slowly scan up through your body.', audioScript: 'Starting at your toes, slowly draw your attention upward. Move through your feet, your legs... slowly scanning through your torso, your arms, all the way to the top of your head.' },
            { title: 'Internal Inquiry', instruction: "Ask at each part: 'How does this feel from the inside?'", audioScript: "As your awareness passes through each part of your body, ask silently: How does this feel from the inside? Don't visualize it. FEEL it." }
        ],
        realLifeExample: 'Sarah practiced this for a week. She discovered that on mornings when her chest felt tight, she was anxious about work — even though her mind said "I\'m fine."',
        journalPrompts: [
            { label: 'What parts felt most alive?', placeholder: 'e.g., fingertips, chest...' },
            { label: 'What felt numb or disconnected?', placeholder: 'e.g., lower back, feet...' },
            { label: 'What is my body telling me today?', placeholder: 'Listen to the inner signal...' }
        ]
    },
    {
        id: 'traffic-light', title: 'Traffic Light Check-In', duration: '30 sec', durationNum: 0.5,
        category: 'Quick', tags: ['pause', 'commute', 'micro'],
        whenToUse: "Throughout the day at 'traffic lights' — moments when you naturally pause",
        description: 'Turn waiting time into presence. Perfect for red lights or elevators.',
        icon: Wind, color: '#C65F9D',
        intro: "Let's use this pause to reconnect.",
        steps: [
            { title: 'Pause & Breathe', instruction: 'Pause whatever you\'re doing. Take one deep breath.', audioScript: 'Stop for a moment. Take one conscious, deep breath. Feel the pause.' },
            { title: 'Quick Interior Scan', instruction: 'Feel your body from within — quick scan.', audioScript: 'Quickly scan your body from within. What\'s the dominant sensation? Just notice.' },
            { title: 'Acknowledge', instruction: 'Notice the sensation and acknowledge the emotion.', audioScript: 'That sensation is connected to an emotion. Just acknowledge it without judgment.' }
        ],
        realLifeExample: 'Marcus started doing this at red lights. He found massive shoulder tension. Just noticing helped it release.',
        journalPrompts: [
            { label: 'What "traffic lights" did I use?', placeholder: 'e.g., elevator, waiting...' },
            { label: 'What did I notice?', placeholder: 'e.g., shoulders tight...' },
            { label: 'Were there patterns?', placeholder: 'Same tension, same time?' }
        ]
    },
    {
        id: 'emotional-detective', title: 'Emotional Detective', duration: '5 min', durationNum: 5,
        category: 'Emotions', tags: ['mood', 'identify', 'sensation'],
        whenToUse: "When you're in a 'mood' but can't identify the emotion",
        description: 'Trace sensations back to their emotional roots.',
        icon: Brain, color: '#FF7043',
        intro: "You're feeling something, but you don't know what. Let's find out.",
        steps: [
            { title: 'Go Within', instruction: "Sit quietly. Say: 'I'm feeling something, but I don't know what.'", audioScript: "Sit quietly. Close your eyes. Say: I am feeling something... but I don't know what. That's okay." },
            { title: 'Sensation Search', instruction: 'Scan: chest, stomach, throat, shoulders, jaw.', audioScript: 'Scan slowly... chest, stomach, throat, shoulders, jaw. Where is the sensation strongest?' },
            { title: 'Feel the Quality', instruction: 'Tight? Fluttery? Heavy? Hot? Cold?', audioScript: "Stay with the sensation. Don't name it yet. Just feel its quality." },
            { title: 'The Reveal', instruction: 'The emotion reveals itself through the sensation.', audioScript: "Rest here. The emotion will reveal itself. You aren't forcing it. Just witnessing." }
        ],
        realLifeExample: "Jennifer felt 'off' all day. This practice revealed a heavy sinking — grief she'd been too busy to acknowledge.",
        journalPrompts: [
            { label: 'Where was the sensation strongest?', placeholder: 'e.g., solar plexus, throat...' },
            { label: 'Describe the sensation', placeholder: 'e.g., tight, fluttery...' },
            { label: 'What emotion did it reveal?', placeholder: 'Name the feeling...' },
            { label: 'How did acknowledging it feel?', placeholder: 'The shift...' }
        ]
    },
    {
        id: 'difficult-conversation', title: 'Conversation Prep', duration: '3 min', durationNum: 3,
        category: 'Work', tags: ['presentation', 'grounding', 'anxiety'],
        whenToUse: 'Before a challenging conversation or presentation',
        description: 'Ground your energy to speak from presence, not reactivity.',
        icon: MessageSquare, color: '#9575CD',
        intro: "You're about to enter a challenging space. Let's find your center.",
        steps: [
            { title: 'Physical Grounding', instruction: 'Feet on the ground. Close your eyes.', audioScript: 'Sit or stand with feet on the ground. Feel the earth beneath you.' },
            { title: 'Feel the Foundation', instruction: 'Really feel the contact of feet on floor.', audioScript: 'Really feel your feet on the floor. The weight, the pressure. You are supported.' },
            { title: 'Internal Aliveness', instruction: 'Feel the aliveness throughout your whole body.', audioScript: 'Expand awareness to your whole body. Feel the subtle aliveness throughout.' },
            { title: 'The Shift', instruction: 'Notice fear or anxiety. Breathe into it.', audioScript: "Notice fear or nervousness. Don't fight it. This energy helps you be present." }
        ],
        realLifeExample: 'David had terrible presentation anxiety. By feeling it instead of fighting it, intensity reduced by half.',
        journalPrompts: [
            { label: 'What sensations did I notice?', placeholder: 'e.g., butterflies, tight throat...' },
            { label: 'Did grounding help?', placeholder: 'How?' },
            { label: 'Did the situation go differently?', placeholder: 'Notice the change...' }
        ]
    },
    {
        id: 'anger-release', title: 'Anger Release', duration: '10 min', durationNum: 10,
        category: 'Emotions', tags: ['anger', 'frustration', 'release'],
        whenToUse: "When you're angry but can't express it",
        description: "Witness the fire of anger without letting it burn you.",
        icon: Zap, color: '#FF7043',
        intro: 'There is fire in the system. Let it transform.',
        steps: [
            { title: 'Find Privacy', instruction: 'Find a private space. Sit comfortably.', audioScript: 'Find a private space. Sit comfortably. This is your time.' },
            { title: 'Locate the Fire', instruction: 'Where is the anger? Jaw, fists, chest?', audioScript: 'Where do you feel this anger? Jaw? Fists? Chest? Just locate the heat.' },
            { title: 'Full Immersion', instruction: "Feel it fully. Don't push it away.", audioScript: "Feel the anger fully. Hot? Buzzing? Tight? It's just energy." },
            { title: 'Vocal Release', instruction: 'Breathe into it. Make a sound if it helps.', audioScript: 'Breathe into the heat. A growl, a sigh, a hum. Let intensity soften.' }
        ],
        realLifeExample: "Lisa did this in her car after unfair criticism. After 10 minutes, rage became calm clarity.",
        journalPrompts: [
            { label: 'Where did I feel the anger?', placeholder: 'Physical location...' },
            { label: 'What was the texture?', placeholder: 'Hot, tight, buzzing...' },
            { label: 'What happened as I stayed?', placeholder: 'How did it shift?' },
            { label: 'How do I feel now?', placeholder: 'Current state...' }
        ]
    },
    {
        id: 'anxiety-grounding', title: 'Anxiety Grounding', duration: '5 min', durationNum: 5,
        category: 'Emotions', tags: ['anxiety', 'panic', 'grounding'],
        whenToUse: 'During anxiety attacks or overwhelm',
        description: '5-4-3-2-1 technique to anchor in the physical world.',
        icon: Anchor, color: '#ABCEC9',
        intro: 'The mind races, but the earth is stable.',
        steps: [
            { title: 'Physical Anchor', instruction: 'Feet on the ground. Press down.', audioScript: 'Feet on the ground. Press them down. You are here. You are safe.' },
            { title: 'Outer Vision', instruction: 'Name 5 things you can see.', audioScript: 'Look around. Name five things you can see. One... two... three... four... five.' },
            { title: 'Sensory Check', instruction: '4 touch, 3 hear, 2 smell, 1 taste.', audioScript: 'Touch four surfaces. Listen for three sounds. Two smells. One taste.' },
            { title: 'Full Presence', instruction: 'Feel yourself solid and present.', audioScript: 'You are solid. You are present. More grounded than the anxiety.' }
        ],
        realLifeExample: 'Tom rode out panic attacks with this grounding. After a month, attacks decreased significantly.',
        journalPrompts: [
            { label: 'What were my symptoms?', placeholder: 'e.g., racing heart...' },
            { label: 'How did grounding help?', placeholder: 'What shifted?' },
            { label: 'Body before vs after?', placeholder: 'Compare...' }
        ]
    },
    {
        id: 'sleep-body-scan', title: 'Sleep Body Scan', duration: '10 min', durationNum: 10,
        category: 'Sleep', tags: ['sleep', 'night', 'relax', 'insomnia'],
        whenToUse: 'Every night before bed',
        description: "Process the day's emotions and improve sleep.",
        icon: Moon, color: '#5C6BC0',
        intro: 'Let go of the day. Prepare for rest.',
        steps: [
            { title: 'Prepare', instruction: 'Lie in bed. Get comfortable.', audioScript: 'Lie in bed. Let your body sink into the mattress.' },
            { title: 'Toe to Head', instruction: 'Slowly scan up through your body.', audioScript: 'Bring attention to your toes. Slowly move upward...' },
            { title: 'Notice & Release', instruction: 'Breathe into tension. Let it soften.', audioScript: "Notice tension. Breathe into it. Let it soften." },
            { title: 'Acknowledge', instruction: "'Hello worry, you can rest now.'", audioScript: "Acknowledge emotions. Say: Hello worry, I see you. You can rest now." },
            { title: 'Whole Body', instruction: 'Feel your whole body breathing.', audioScript: 'Feel your whole body breathing. Let sleep come naturally.' }
        ],
        realLifeExample: 'Emma was falling asleep 30 minutes faster within two weeks of practicing this.',
        journalPrompts: [
            { label: 'What tension did I find?', placeholder: 'e.g., jaw, shoulders...' },
            { label: 'What emotions came up?', placeholder: 'e.g., worry...' },
            { label: 'How was my sleep?', placeholder: 'Better? Same?' }
        ]
    },
    {
        id: 'lunch-break-reset', title: 'Lunch Break Reset', duration: '5 min', durationNum: 5,
        category: 'Work', tags: ['midday', 'reset', 'recharge'],
        whenToUse: 'Midday when you need to reset',
        description: 'Reset energy to avoid afternoon burnout.',
        icon: Coffee, color: '#FFA726',
        intro: 'Reset before the afternoon.',
        steps: [
            { title: 'Step Away', instruction: 'Leave your desk. Find quiet.', audioScript: 'Step away from your work. Find a quiet spot.' },
            { title: 'Breathe', instruction: 'Close eyes. 5 deep breaths.', audioScript: 'Close your eyes. Five deep, slow breaths.' },
            { title: 'Scan', instruction: 'What accumulated this morning?', audioScript: 'Scan your body. What emotions accumulated? Just acknowledge them.' },
            { title: 'Refresh', instruction: 'Breathe fresh energy in.', audioScript: 'Breathe fresh energy in. Return to your day, present.' }
        ],
        realLifeExample: "Kevin's 5-minute midday reset gave him more energy and a better mood at home.",
        journalPrompts: [
            { label: 'What had accumulated?', placeholder: 'e.g., frustration...' },
            { label: 'Where was I holding it?', placeholder: 'e.g., neck...' },
            { label: 'How did the afternoon go?', placeholder: 'Energy, mood...' }
        ]
    },
    {
        id: '10-second-check', title: '10-Second Body Check', duration: '10 sec', durationNum: 0.17,
        category: 'Quick', tags: ['micro', 'instant', 'anytime'],
        whenToUse: 'Wherever, whenever',
        description: 'One breath. One sensation. Done.',
        icon: Timer, color: '#EF5350',
        intro: 'Ten seconds to come back to life.',
        steps: [
            { title: 'Breathe', instruction: 'One deep breath.', audioScript: 'Stop. One deep breath. Inhale... exhale.' },
            { title: 'Feel', instruction: 'Feel your body. 10 seconds.', audioScript: 'For ten seconds, just feel your body.' },
            { title: 'Notice', instruction: 'One sensation. Done.', audioScript: "Notice one sensation. That's it." }
        ],
        realLifeExample: "Mike, a busy exec, did this between emails. His baseline stress dropped.",
        journalPrompts: [
            { label: 'What did I notice?', placeholder: 'e.g., cold hands...' },
            { label: 'How many times today?', placeholder: 'Number...' }
        ]
    },
    {
        id: 'bathroom-break', title: 'Bathroom Break Practice', duration: '30 sec', durationNum: 0.5,
        category: 'Quick', tags: ['quick', 'private', 'micro'],
        whenToUse: 'Every time you use the bathroom',
        description: 'A biological break becomes a spiritual break.',
        icon: Droplet, color: '#4FC3F7',
        intro: 'A private moment to return to yourself.',
        steps: [
            { title: 'Pause', instruction: 'Before leaving, close your eyes.', audioScript: 'Before you leave, pause. Close your eyes.' },
            { title: 'Feel', instruction: 'Feel your body for 30 seconds.', audioScript: 'Feel your body for thirty seconds.' },
            { title: 'Notice', instruction: 'Any emotions present?', audioScript: "Is there an emotion? Just notice it." },
            { title: 'Return', instruction: 'Return refreshed.', audioScript: 'Open your eyes. Return refreshed.' }
        ],
        realLifeExample: "Sarah turned bathroom escapes into 30-second recharging sessions.",
        journalPrompts: [
            { label: 'What mood was I in?', placeholder: 'e.g., rushed...' },
            { label: 'Did the pause help?', placeholder: 'How?' }
        ]
    },
    {
        id: 'morning-coffee-ritual', title: 'Morning Coffee Ritual', duration: '2 min', durationNum: 2,
        category: 'Morning', tags: ['morning', 'ritual', 'intention'],
        whenToUse: 'While your coffee or tea brews',
        description: 'Waiting for caffeine becomes waiting for presence.',
        icon: Coffee, color: '#8D6E63',
        intro: 'Brewing is happening. Let presence happen too.',
        steps: [
            { title: 'Stand Still', instruction: "Don't check your phone.", audioScript: "Don't check your phone. Just stand still." },
            { title: 'Feel', instruction: 'Feel your body standing.', audioScript: 'Feel your feet on the floor. Feel yourself standing.' },
            { title: 'Intend', instruction: "'Today I will notice my body.'", audioScript: 'Set an intention: Today, I will notice my body.' }
        ],
        realLifeExample: "John stopped checking news while brewing. His mornings completely changed.",
        journalPrompts: [
            { label: 'How hard was no phone?', placeholder: '1-10...' },
            { label: 'Remember the intention later?', placeholder: 'Yes/No...' }
        ]
    },
];

const CHALLENGES = [
    { id: 'w2', title: 'Day Awareness', description: 'Alarm every 2 hours. Pause 10 seconds. Feel your body.', xp: 500, week: 2 },
    { id: 'w3', title: 'Emotion Deep Dive', description: 'Sit with a difficult emotion for 5 full minutes.', xp: 1000, week: 3 },
    { id: 'w4', title: 'Movement Awareness', description: 'Feel your body from within during routine activities.', xp: 1500, week: 4 },
    { id: 'w5', title: 'Silent Body Walk', description: '20-min walk. No phone, no music. Just body.', xp: 2000, week: 5 },
    { id: 'w6', title: 'Body Wisdom', description: 'Feel into each option. Notice expansion vs contraction.', xp: 3000, week: 6 },
];

const COLLECTIONS = [
    { id: 'start', title: 'Start Here', sub: 'Perfect for beginners', ids: ['10-second-check', 'traffic-light', 'morning-coffee-ritual'], accent: '#ABCEC9' },
    { id: 'emotions', title: 'Emotional Toolkit', sub: 'When feelings need space', ids: ['emotional-detective', 'anger-release', 'anxiety-grounding'], accent: '#FF7043' },
    { id: 'daily', title: 'Daily Anchors', sub: 'Build into your routine', ids: ['morning-scan', 'lunch-break-reset', 'sleep-body-scan'], accent: '#9575CD' },
];

const FAQ = [
    { q: "I don't feel anything", a: "Start with strong sensations — press feet on the floor. Even noticing nothing is noticing something." },
    { q: "Uncomfortable sensations arise", a: "You're uncovering suppressed emotions. Breathe into it. Remind yourself: just energy moving." },
    { q: "Strong emotions surface", a: "This is the practice working. You're not creating the emotion — you're releasing what was there." },
    { q: "Tingling or energy moving", a: "You're sensing your body's subtle energy field. Normal and good. Continue." },
    { q: "Mind keeps wandering", a: "Each time you notice and return is a success. The practice IS the noticing." },
];

const CATS = ['All', 'Quick', 'Morning', 'Work', 'Emotions', 'Sleep'] as const;
const CAT_ICONS: Record<string, React.ElementType> = { All: Sparkles, Quick: Zap, Morning: Sun, Work: Coffee, Emotions: Heart, Sleep: Moon };
const DURS = [
    { l: 'Any', fn: (_: number) => true },
    { l: '< 1m', fn: (d: number) => d < 1 },
    { l: '1-5m', fn: (d: number) => d >= 1 && d <= 5 },
    { l: '5-10m', fn: (d: number) => d > 5 && d <= 10 },
    { l: '10m+', fn: (d: number) => d > 10 },
];

/* ═══════════════════════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════════════════════ */

export const SituationalPractices: React.FC<{ onBack: () => void; isAdmin?: boolean }> = ({ onBack, isAdmin }) => {
    const { user } = useAuth();

    // Browse
    const [q, setQ] = useState('');
    const [cat, setCat] = useState(0);
    const [dur, setDur] = useState(0);
    const [showFaq, setShowFaq] = useState(false);
    const [showChallenges, setShowChallenges] = useState(false);

    // Practice
    const [sel, setSel] = useState<Situation | null>(null);
    const [step, setStep] = useState(0);
    const [active, setActive] = useState(false);
    const [paused, setPaused] = useState(false);
    const [journaling, setJournaling] = useState(false);
    const [jData, setJData] = useState<Record<string, string>>({});

    const hasFilter = cat > 0 || dur > 0 || q.trim().length > 0;
    const filtered = useMemo(() => SITUATIONS.filter(s => {
        if (cat > 0 && s.category !== CATS[cat]) return false;
        if (!DURS[dur].fn(s.durationNum)) return false;
        if (q.trim()) { const lq = q.toLowerCase(); return s.title.toLowerCase().includes(lq) || s.description.toLowerCase().includes(lq) || s.tags.some(t => t.includes(lq)); }
        return true;
    }), [q, cat, dur]);

    // Voice
    const speak = useCallback((text: string, onEnd?: () => void) => { if (!paused) VoiceService.speak(text, { onEnd }); }, [paused]);
    const onNext = useCallback(() => {
        if (!sel) return;
        if (step < sel.steps.length - 1) setStep(s => s + 1);
        else { setActive(false); setJournaling(true); }
    }, [step, sel]);

    useEffect(() => {
        if (active && sel && !paused) speak(sel.steps[step].audioScript, onNext);
        else VoiceService.stop();
    }, [step, active, sel, speak, onNext, paused]);

    const saveJournal = async () => {
        if (!user || !sel) return;
        try {
            await addDoc(collection(db, 'users', user.uid, 'situational-logs'), {
                situationId: sel.id, situationTitle: sel.title,
                responses: jData, type: 'situational',
                date: new Date().toLocaleDateString(), createdAt: serverTimestamp(),
            });
            setSel(null); setJournaling(false); setJData({});
        } catch (e) { console.error(e); }
    };

    const open = (s: Situation) => { setSel(s); setStep(0); setJData({}); setJournaling(false); setActive(false); };
    const clearAll = () => { setCat(0); setDur(0); setQ(''); };

    /* ─── Practice mode ─── */
    if (active && sel) return (
        <MeditationPortal title={sel.title}
            currentStepTitle={sel.steps[step].title}
            currentStepInstruction={sel.steps[step].instruction}
            onNext={onNext}
            onReset={() => { VoiceService.stop(); setStep(0); }}
            onTogglePlay={() => setPaused(!paused)}
            isPlaying={!paused}
            progress={(step + 1) / sel.steps.length} />
    );

    /* ─── Journal mode ─── */
    if (journaling && sel) return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl mx-auto pb-24 space-y-6">
            <button onClick={() => { setJournaling(false); setSel(null); }}
                className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <ArrowLeft size={14} />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Back</span>
            </button>

            <header>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-1" style={{ color: sel.color }}>
                    Reflect · {sel.title}
                </p>
                <h1 className="text-2xl font-serif font-light text-[var(--text-primary)]">How did that feel?</h1>
            </header>

            <div className="space-y-5">
                {sel.journalPrompts.map((p, i) => (
                    <div key={i}>
                        <label className="block text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)] mb-1.5">{p.label}</label>
                        <textarea value={jData[p.label] || ''} rows={3}
                            onChange={e => setJData({ ...jData, [p.label]: e.target.value })}
                            placeholder={p.placeholder}
                            className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4
                                text-[15px] font-serif text-[var(--text-primary)] resize-none outline-none
                                focus:border-[var(--border-default)] transition-colors placeholder:text-[var(--text-muted)]" />
                    </div>
                ))}
                <motion.button whileTap={{ scale: 0.97 }} onClick={saveJournal}
                    className="w-full py-3.5 rounded-xl font-bold uppercase tracking-[0.18em] text-[11px]
                        flex items-center justify-center gap-2 text-white shadow-lg transition-colors"
                    style={{ background: sel.color }}>
                    <Save size={14} /> Save Reflection
                </motion.button>
            </div>
        </motion.div>
    );

    /* ─── Browse ─── */
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-24 space-y-6">

            {/* ═══ HEADER ═══ */}
            <header className="flex justify-between items-start">
                <div>
                    <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-[var(--text-muted)] mb-1">
                        The Practice Room
                    </p>
                    <h1 className="text-[clamp(24px,3.5vw,36px)] font-serif font-light text-[var(--text-primary)] leading-[1.1]">
                        Guided Meditations
                    </h1>
                    <p className="text-[13px] font-serif italic text-[var(--text-muted)] mt-1.5">
                        {SITUATIONS.length} practices · 10 seconds to 10 minutes
                    </p>
                </div>
                <button onClick={() => setShowFaq(!showFaq)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider
                        bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-muted)]
                        hover:text-[var(--text-primary)] hover:border-[var(--border-default)] transition-all mt-1">
                    <HelpCircle size={12} /> FAQ
                </button>
            </header>

            {/* ═══ FAQ — inline expandable ═══ */}
            <AnimatePresence>
                {showFaq && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden">
                        <div className="rounded-[16px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--text-muted)]">Common Experiences</p>
                                <button onClick={() => setShowFaq(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={14} /></button>
                            </div>
                            {FAQ.map((f, i) => (
                                <div key={i} className="py-2 border-t border-[var(--border-subtle)]">
                                    <p className="text-[12px] font-bold text-[var(--text-primary)] mb-0.5">{f.q}</p>
                                    <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">{f.a}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ═══ SEARCH ═══ */}
            <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search practices..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]
                        text-[13px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]
                        focus:border-[var(--border-default)] transition-colors" />
            </div>

            {/* ═══ FILTERS ═══ */}
            <div className="flex items-center gap-1.5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                {CATS.map((c, i) => {
                    const Icon = CAT_ICONS[c]; const on = cat === i;
                    return (
                        <button key={c} onClick={() => setCat(i)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider
                                flex-shrink-0 border transition-all ${on
                                    ? 'bg-[var(--accent-primary)] text-[var(--bg-primary)] border-transparent'
                                    : 'text-[var(--text-muted)] border-[var(--border-subtle)] hover:border-[var(--border-default)] hover:text-[var(--text-secondary)]'}`}>
                            <Icon size={11} /> {c}
                        </button>
                    );
                })}
                <div className="w-px h-4 bg-[var(--border-subtle)] flex-shrink-0 mx-0.5" />
                {DURS.map((d, i) => (
                    <button key={d.l} onClick={() => setDur(i)}
                        className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold tracking-wider flex-shrink-0 border transition-all
                            ${dur === i
                                ? 'bg-[var(--bg-surface-hover)] text-[var(--text-primary)] border-[var(--border-default)]'
                                : 'text-[var(--text-muted)] border-transparent hover:text-[var(--text-secondary)]'}`}>
                        {d.l}
                    </button>
                ))}
            </div>

            {/* ═══ COLLECTIONS — only unfiltered ═══ */}
            {!hasFilter && (
                <div className="space-y-6">
                    {COLLECTIONS.map((col, ci) => {
                        const items = col.ids.map(id => SITUATIONS.find(s => s.id === id)!).filter(Boolean);
                        return (
                            <motion.section key={col.id} initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }} transition={{ delay: ci * 0.08 }}>
                                <div className="flex items-baseline gap-2 mb-2.5 pl-0.5">
                                    <h3 className="text-[14px] font-serif font-medium text-[var(--text-primary)]">{col.title}</h3>
                                    <span className="text-[10px] text-[var(--text-muted)] italic font-serif">{col.sub}</span>
                                </div>
                                <div className="flex gap-2.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                                    {items.map(sit => {
                                        const Icon = sit.icon;
                                        return (
                                            <motion.button key={sit.id} whileTap={{ scale: 0.97 }}
                                                onClick={() => open(sit)}
                                                className="flex-shrink-0 w-[190px] rounded-[16px] p-4 text-left transition-all
                                                    bg-[var(--bg-surface)] border border-[var(--border-subtle)]
                                                    hover:border-[var(--border-default)] hover:shadow-md group"
                                                style={{ borderLeftWidth: 3, borderLeftColor: col.accent + '60' }}>
                                                <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2.5
                                                    group-hover:scale-105 transition-transform"
                                                    style={{ background: sit.color + '12' }}>
                                                    <Icon size={15} style={{ color: sit.color }} strokeWidth={1.5} />
                                                </div>
                                                <p className="text-[13px] font-serif font-medium text-[var(--text-primary)] leading-snug mb-1">{sit.title}</p>
                                                <p className="text-[11px] text-[var(--text-muted)] line-clamp-2 leading-relaxed mb-2">{sit.description}</p>
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--text-muted)] tracking-wider">
                                                    <Clock size={9} /> {sit.duration}
                                                </span>
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </motion.section>
                        );
                    })}

                    <div className="flex items-center gap-3 pt-2">
                        <div className="h-px flex-1 bg-[var(--border-subtle)]" />
                        <span className="text-[10px] tracking-[0.3em] uppercase font-bold text-[var(--text-muted)]">All Practices</span>
                        <div className="h-px flex-1 bg-[var(--border-subtle)]" />
                    </div>
                </div>
            )}

            {/* ═══ LIST ═══ */}
            <div className="space-y-1.5">
                {hasFilter && (
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--text-muted)]">
                            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
                        </span>
                        <button onClick={clearAll} className="text-[10px] text-[var(--accent-primary)] font-bold uppercase tracking-wider hover:underline"
                            style={{ background: 'none', border: 'none', cursor: 'pointer' }}>Clear</button>
                    </div>
                )}

                <AnimatePresence mode="popLayout">
                    {filtered.map((sit, i) => {
                        const Icon = sit.icon;
                        return (
                            <motion.button key={sit.id} layout
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0, transition: { delay: i * 0.02 } }}
                                exit={{ opacity: 0 }}
                                whileTap={{ scale: 0.99 }}
                                onClick={() => open(sit)}
                                className="w-full flex items-center gap-3 p-3 rounded-[14px] text-left
                                    bg-[var(--bg-surface)] border border-[var(--border-subtle)]
                                    hover:border-[var(--border-default)] transition-colors group">
                                <div className="w-9 h-9 flex-shrink-0 rounded-xl flex items-center justify-center
                                    group-hover:scale-105 transition-transform"
                                    style={{ background: sit.color + '10', border: `1px solid ${sit.color}12` }}>
                                    <Icon size={15} style={{ color: sit.color }} strokeWidth={1.5} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[13px] font-serif font-medium text-[var(--text-primary)] truncate">{sit.title}</p>
                                    <p className="text-[11px] text-[var(--text-muted)] truncate">{sit.description}</p>
                                </div>
                                <span className="text-[10px] font-bold text-[var(--text-muted)] tracking-wider flex-shrink-0 hidden sm:block">{sit.duration}</span>
                                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0
                                    opacity-0 group-hover:opacity-100 transition-opacity"
                                    style={{ background: sit.color + '15' }}>
                                    <Play size={10} style={{ color: sit.color }} fill={sit.color} />
                                </div>
                            </motion.button>
                        );
                    })}
                </AnimatePresence>

                {filtered.length === 0 && (
                    <div className="py-14 text-center">
                        <p className="text-[var(--text-muted)] font-serif italic">No practices found</p>
                        <button onClick={clearAll} className="mt-2 text-[11px] text-[var(--accent-primary)] font-bold uppercase tracking-wider"
                            style={{ background: 'none', border: 'none', cursor: 'pointer' }}>Clear filters</button>
                    </div>
                )}
            </div>

            {/* ═══ CHALLENGES — collapsible ═══ */}
            <div className="pt-2">
                <button onClick={() => setShowChallenges(!showChallenges)}
                    className="w-full flex items-center justify-between py-2.5"
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-amber-500/10 border border-amber-500/15">
                            <Trophy size={12} className="text-amber-600" />
                        </div>
                        <span className="text-[13px] font-serif font-medium text-[var(--text-primary)]">Progressive Challenges</span>
                        <span className="text-[10px] text-[var(--text-muted)]">{CHALLENGES.length}</span>
                    </div>
                    <ChevronDown size={14} className={`text-[var(--text-muted)] transition-transform duration-300 ${showChallenges ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                    {showChallenges && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            className="overflow-hidden">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 pb-4">
                                {CHALLENGES.map(ch => (
                                    <div key={ch.id} className="p-3.5 rounded-[12px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] opacity-45">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-[9px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-full bg-[var(--bg-surface-hover)] text-[var(--text-muted)]">
                                                Wk {ch.week}
                                            </span>
                                            <span className="text-[9px] text-[var(--text-muted)] flex items-center gap-1"><Target size={8} />{ch.xp}</span>
                                        </div>
                                        <p className="text-[12px] font-serif font-medium text-[var(--text-secondary)] mb-0.5">{ch.title}</p>
                                        <p className="text-[11px] text-[var(--text-muted)] leading-relaxed blur-[1.5px]">Keep practicing to unlock.</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ═══ DETAIL MODAL — refined editorial layout ═══ */}
            <AnimatePresence>
                {sel && !active && !journaling && (() => {
                    const Icon = sel.icon;
                    return createPortal(
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[110] flex items-end md:items-center justify-center"
                            style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(12px)' }}
                            onClick={e => e.target === e.currentTarget && setSel(null)}>
                            <motion.div
                                initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }}
                                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                                className="w-full md:max-w-[460px] max-h-[92vh] overflow-y-auto
                                    rounded-t-[24px] md:rounded-[20px] bg-[var(--bg-primary)]
                                    border border-[var(--border-default)] shadow-2xl"
                                style={{ scrollbarWidth: 'none' }}>

                                {/* Mobile drag handle */}
                                <div className="flex justify-center pt-2.5 pb-0 md:hidden">
                                    <div className="w-8 h-[3px] rounded-full bg-[var(--border-default)]" />
                                </div>

                                {/* ─── Hero band with gradient ─── */}
                                <div className="relative overflow-hidden"
                                    style={{
                                        background: `linear-gradient(145deg, ${sel.color}0a, ${sel.color}04 60%, transparent)`,
                                    }}>
                                    {/* Close button */}
                                    <button onClick={() => setSel(null)}
                                        className="absolute top-4 right-4 z-10 w-7 h-7 rounded-full
                                            bg-[var(--bg-surface)] border border-[var(--border-subtle)]
                                            flex items-center justify-center text-[var(--text-muted)]
                                            hover:text-[var(--text-primary)] hover:border-[var(--border-default)]
                                            transition-all"
                                        style={{ backdropFilter: 'blur(8px)' }}>
                                        <X size={12} strokeWidth={2} />
                                    </button>

                                    <div className="px-5 pt-6 pb-5 md:px-6 md:pt-7 md:pb-6">
                                        {/* Icon + meta row */}
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0"
                                                style={{ background: sel.color + '14', border: `1px solid ${sel.color}18` }}>
                                                <Icon size={18} style={{ color: sel.color }} strokeWidth={1.5} />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] font-bold uppercase tracking-[0.10em] px-2 py-[3px] rounded-md"
                                                    style={{ background: sel.color + '10', color: sel.color }}>
                                                    {sel.category}
                                                </span>
                                                <span className="text-[9px] font-bold text-[var(--text-muted)] flex items-center gap-1 tracking-wider uppercase">
                                                    <Clock size={8} strokeWidth={2.5} />{sel.duration}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Title */}
                                        <h2 className="text-[22px] md:text-[24px] font-serif font-light text-[var(--text-primary)] leading-[1.2] mb-2">
                                            {sel.title}
                                        </h2>

                                        {/* Description */}
                                        <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
                                            {sel.description}
                                        </p>
                                    </div>
                                </div>

                                {/* ─── Content body ─── */}
                                <div className="px-5 pb-5 md:px-6 md:pb-6 space-y-5">

                                    {/* When to use — clean callout */}
                                    <div className="flex gap-3 items-start py-3 border-y border-[var(--border-subtle)]">
                                        <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ background: sel.color + '40' }} />
                                        <div>
                                            <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-[var(--text-muted)] block mb-1">
                                                Ideal for
                                            </span>
                                            <p className="text-[12px] font-serif italic text-[var(--text-secondary)] leading-relaxed">
                                                {sel.whenToUse}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Steps — clean timeline */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                                                {sel.steps.length} Steps
                                            </span>
                                            <span className="text-[10px] text-[var(--text-muted)] font-serif italic">
                                                Voice-guided
                                            </span>
                                        </div>

                                        <div className="space-y-0">
                                            {sel.steps.map((s, i) => {
                                                const isLast = i === sel.steps.length - 1;
                                                return (
                                                    <div key={i} className="flex gap-3">
                                                        {/* Timeline spine */}
                                                        <div className="flex flex-col items-center flex-shrink-0" style={{ width: 20 }}>
                                                            <div className="w-[18px] h-[18px] rounded-full flex items-center justify-center text-[8px] font-bold"
                                                                style={{
                                                                    background: sel.color + '12',
                                                                    color: sel.color,
                                                                    border: `1.5px solid ${sel.color}25`,
                                                                }}>
                                                                {i + 1}
                                                            </div>
                                                            {!isLast && (
                                                                <div className="w-[1px] flex-1 my-1" style={{ background: sel.color + '15' }} />
                                                            )}
                                                        </div>

                                                        {/* Step content */}
                                                        <div className={`flex-1 min-w-0 ${isLast ? 'pb-0' : 'pb-3'}`}>
                                                            <p className="text-[12px] font-bold text-[var(--text-primary)] leading-snug">{s.title}</p>
                                                            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed mt-0.5">{s.instruction}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Real story — editorial quote style */}
                                    <div className="relative rounded-[14px] p-4"
                                        style={{
                                            background: `linear-gradient(135deg, ${sel.color}06, transparent)`,
                                            border: `1px solid ${sel.color}10`,
                                        }}>
                                        {/* Decorative quote mark */}
                                        <span className="absolute top-2 left-3 text-[28px] font-serif leading-none select-none"
                                            style={{ color: sel.color + '18' }}>"</span>
                                        <div className="pl-5">
                                            <p className="text-[12px] font-serif italic text-[var(--text-secondary)] leading-[1.65]">
                                                {sel.realLifeExample}
                                            </p>
                                            <p className="text-[9px] font-bold uppercase tracking-[0.15em] mt-2" style={{ color: sel.color + '80' }}>
                                                Real experience
                                            </p>
                                        </div>
                                    </div>

                                    {/* CTA — clean, confident */}
                                    <motion.button whileTap={{ scale: 0.97 }}
                                        onClick={() => { setStep(0); setActive(true); }}
                                        className="w-full py-3.5 rounded-[14px] font-bold uppercase tracking-[0.2em] text-[11px]
                                            flex items-center justify-center gap-2.5 text-white transition-all"
                                        style={{
                                            background: sel.color,
                                            boxShadow: `0 2px 12px ${sel.color}30, 0 0 0 1px ${sel.color}20`,
                                        }}>
                                        <Play size={13} fill="white" strokeWidth={0} /> Begin Practice
                                    </motion.button>
                                </div>
                            </motion.div>
                        </motion.div>,
                        document.body
                    );
                })()}
            </AnimatePresence>
        </motion.div>
    );
};
