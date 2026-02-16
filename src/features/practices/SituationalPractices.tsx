import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import {
    Sparkles,
    Sun,
    Wind,
    Brain,
    ArrowLeft,
    Clock,
    Flame,
    PenTool,
    Save,
    MessageSquare,
    Zap,
    Anchor,
    Moon,
    Coffee,
    Lightbulb,
    X,
    Trophy,
    Target,
    Timer,
    Droplet
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { MeditationPortal } from '../../components/ui/MeditationPortal.tsx';
import { db } from '../../firebase';
import {
    collection,
    addDoc,
    serverTimestamp
} from 'firebase/firestore';

interface Situation {
    id: string;
    title: string;
    whenToUse: string;
    description: string;
    duration: string;
    icon: React.ElementType;
    color: string;
    intro: string;
    steps: {
        title: string;
        instruction: string;
        audioScript: string;
    }[];
    realLifeExample: string;
    journalPrompts: {
        label: string;
        placeholder: string;
    }[];
}

const SITUATIONS: Situation[] = [
    {
        id: 'morning-scan',
        title: "The Morning Energy Scan",
        duration: "3 minutes",
        whenToUse: "First thing in the morning, before checking your phone",
        description: "Set your emotional state for the day by connecting with your inner body.",
        icon: Sun,
        color: "#ABCEC9",
        intro: "Good morning. Before the world rushes in, let's check in with your inner aliveness.",
        steps: [
            {
                title: "Step 1: Foundational Breath",
                instruction: "While still in bed, lie on your back. Take three deep breaths.",
                audioScript: "While still in bed, lie on your back. Take three slow, deep breaths. Feel the air filling your lungs and the gentle release as you exhale. Arrive fully in this moment."
            },
            {
                title: "Step 2: The Scan",
                instruction: "Starting at your toes, slowly scan up through your body.",
                audioScript: "Starting at your toes, slowly draw your attention upward. Move through your feet, your legs... slowly scanning through your torso, your arms, all the way to the top of your head."
            },
            {
                title: "Step 3: Internal Inquiry",
                instruction: "Ask at each part: 'How does this feel from the inside?'",
                audioScript: "As your awareness passes through each part of your body, ask silently: How does this feel from the inside? Don't visualize it. FEEL it. Notice where you feel energized, or where you might feel heavy or tense."
            }
        ],
        realLifeExample: "Sarah practiced this for a week. She discovered that on mornings when her chest felt tight and heavy, she was actually anxious about work—even though her mind was saying 'I'm fine.' This awareness helped her address the anxiety instead of pushing through and getting a stress headache by noon.",
        journalPrompts: [
            { label: "What parts of my body felt most alive?", placeholder: "e.g., fingertips, chest..." },
            { label: "What parts felt numb or disconnected?", placeholder: "e.g., lower back, feet..." },
            { label: "What is my body telling me about my emotional state today?", placeholder: "Listen to the inner signal..." }
        ]
    },
    {
        id: 'traffic-light',
        title: "The Traffic Light Check-In",
        duration: "30 seconds",
        whenToUse: "Throughout the day at 'traffic lights' - moments when you naturally pause",
        description: "Turn waiting time into presence time. Perfect for computer starts, red lights, or elevators.",
        icon: Wind,
        color: "#C65F9D",
        intro: "Let's use this pause to reconnect.",
        steps: [
            {
                title: "Pause & Breathe",
                instruction: "Pause whatever you're doing. Take one deep breath.",
                audioScript: "Stop for a moment. Take one conscious, deep breath. Feel the pause."
            },
            {
                title: "Quick Interior Scan",
                instruction: "Feel your body from within - quick scan.",
                audioScript: "Quickly scan your body from within. What's the dominant sensation? Tension? Ease? Heaviness? Just notice it."
            },
            {
                title: "Acknowledge the Emotion",
                instruction: "Notice the sensation and acknowledge the connected emotion.",
                audioScript: "That sensation is connected to an emotion. Just acknowledge it without judgment. Oh, there's anxiety, or, there's fatigue. Witness it, and stay present."
            }
        ],
        realLifeExample: "Marcus started doing this every time he stopped at a red light during his commute. He discovered he was carrying massive shoulder tension—a sign of stress he'd been completely unaware of. Just noticing it helped the tension release. After two weeks, his chronic neck pain significantly improved.",
        journalPrompts: [
            { label: "What 'traffic lights' did I use today?", placeholder: "e.g., elevator, boiling water..." },
            { label: "What did I notice in my body?", placeholder: "e.g., shoulders tight, stomach relaxed..." },
            { label: "Were there patterns? (Same tension at the same times?)", placeholder: "Notice the cycle..." }
        ]
    },
    {
        id: 'emotional-detective',
        title: "The Emotional Detective",
        duration: "5 minutes",
        whenToUse: "When you notice you're in a 'mood' but can't identify the emotion",
        description: "Trace sensations back to their emotional roots.",
        icon: Brain,
        color: "#FF7043",
        intro: "You're feeling something, but you don't know what. Let's find out together.",
        steps: [
            {
                title: "Go Within",
                instruction: "Sit quietly and close your eyes. Say to yourself: 'I'm feeling something, but I don't know what'",
                audioScript: "Sit quietly. Close your eyes. Say to yourself: I am feeling something... but I don't know what it is yet. That's okay. We are just going to look."
            },
            {
                title: "Sensation Search",
                instruction: "Scan slowly: chest, stomach, throat, shoulders, jaw, face. Where is it strongest?",
                audioScript: "Bring your attention to your body. Scan slowly... your chest, your stomach, your throat... move up to your shoulders, your jaw, your face. Where is the sensation strongest right now?"
            },
            {
                title: "Feel the Quality",
                instruction: "Stay with the sensation. Is it tight? Fluttery? Heavy? Hot? Cold?",
                audioScript: "Stay with that sensation. Don't try to name it yet. Just feel its quality. Is it tight? Is it fluttery? Heavy? Hot or cold? Just be the space for this sensation to exist."
            },
            {
                title: "The Reveal",
                instruction: "In time, the emotion will reveal itself through the sensation.",
                audioScript: "Rest here. Often, the emotion will reveal itself through the sensation. You aren't forcing it. You are just witnessing. Stay as long as you need."
            }
        ],
        realLifeExample: "Jennifer felt 'off' all day but couldn't identify why. She did this practice and noticed a heavy, sinking feeling in her chest and stomach. As she stayed with that sensation, she realized she was grieving—her best friend had moved away last week, and she'd been too busy to acknowledge the sadness. Once she let herself feel the grief, she cried for 10 minutes and felt significantly lighter.",
        journalPrompts: [
            { label: "Where in my body was the sensation strongest?", placeholder: "e.g., solar plexus, throat..." },
            { label: "How would I describe the sensation?", placeholder: "e.g., tight, fluttery, heavy..." },
            { label: "What emotion did it turn out to be?", placeholder: "The name of the feeling..." },
            { label: "How did I feel after acknowledging it?", placeholder: "The shift in your state..." }
        ]
    },
    {
        id: 'difficult-conversation',
        title: "The Difficult Conversation Preparation",
        duration: "3 minutes",
        whenToUse: "Before a challenging conversation, presentation, or difficult task",
        description: "Ground your energy so you can speak from presence rather than reactivity.",
        icon: MessageSquare,
        color: "#9575CD",
        intro: "You are about to enter a challenging space. Let's find your center first.",
        steps: [
            {
                title: "Physical Grounding",
                instruction: "Sit or stand with feet firmly on the ground. Close your eyes.",
                audioScript: "Sit or stand with yours feet firmly on the ground. Feel the solid earth beneath you. Close your eyes and bring your awareness into this moment."
            },
            {
                title: "Feeling the Foundation",
                instruction: "Feel your feet on the floor - really feel the contact.",
                audioScript: "Really feel the contact of your feet on the floor. The weight, the pressure. You are supported. You are here."
            },
            {
                title: "Internal Aliveness",
                instruction: "Feel your whole body - the aliveness throughout.",
                audioScript: "Now expand your awareness to your whole body. Feel the subtle aliveness, the vibration of life throughout your entire frame."
            },
            {
                title: "The Shift",
                instruction: "Notice emotions like fear or anxiety. Breathe into them and say: 'This energy is here to help me be alert and present'",
                audioScript: "Notice any fear or nervousness. Don't fight it. Breathe into those sensations. Say silently: This energy is here to help me be alert and present. You are grounded. You are ready."
            }
        ],
        realLifeExample: "David always got terrible anxiety before presentations. He'd try to think his way through it, which made it worse. He started doing this practice before each presentation. By feeling the anxiety in his body instead of fighting it, the intensity reduced by half. His presentations improved because he was present instead of lost in anxious thoughts.",
        journalPrompts: [
            { label: "What sensations did I notice before the conversation/event?", placeholder: "e.g., butterflies, tight throat..." },
            { label: "How did feeling my body help?", placeholder: "Did it ground you?" },
            { label: "Did the difficult situation go differently than usual?", placeholder: "Notice the change in interaction..." }
        ]
    },
    {
        id: 'anger-release',
        title: "The Anger Release",
        duration: "10 minutes",
        whenToUse: "When you're angry but can't express it appropriately (at work, in public, etc.)",
        description: "Witness the fire of anger without letting it burn you or others.",
        icon: Zap,
        color: "#FF7043",
        intro: "There is fire in the system. Let's give it space to transform.",
        steps: [
            {
                title: "Find Privacy",
                instruction: "Find privacy and sit comfortably.",
                audioScript: "Find a private space. Sit comfortably. This is your time to be with this energy without judgment."
            },
            {
                title: "Locate the Fire",
                instruction: "Bring attention to where you feel the anger in your body (jaw, fists, chest).",
                audioScript: "Where do you feel this anger? Is it in your jaw? Your fists? Your chest or stomach? Just locate the heat."
            },
            {
                title: "Full Immersion",
                instruction: "Feel the energy - hot, tight, buzzing. Don't try to make it go away.",
                audioScript: "Feel the energy of the anger fully. Is it hot? Buzzing? Tight? It's just energy. Don't push it away. Be the space for it."
            },
            {
                title: "Vocal Release",
                instruction: "Breathe into those areas. Sometimes making a sound (growl, sigh, humming) helps.",
                audioScript: "Breathe directly into the heat. If it helps, make a low sound... a growl, a deep sigh, or a hum. Let the intensity vibrate through you until it naturally begins to soften."
            }
        ],
        realLifeExample: "Lisa's boss criticized her unfairly in a meeting. She couldn't respond because he's her boss. She felt rage but had to smile and nod. At lunch, she sat in her car and did this practice. She felt the rage as heat and tightness in her chest and jaw. She breathed into it, made some low growling sounds, and let the energy move through her. After 10 minutes, the rage had transformed into calm clarity about how to address the situation professionally.",
        journalPrompts: [
            { label: "Where did I feel the anger in my body?", placeholder: "Describe the physical location..." },
            { label: "What did it feel like? (hot, tight, buzzing, etc.)", placeholder: "The texture of the anger..." },
            { label: "What happened as I stayed with the sensation?", placeholder: "How did it change?" },
            { label: "How do I feel now?", placeholder: "Your current mental state..." }
        ]
    },
    {
        id: 'anxiety-grounding',
        title: "The Anxiety Grounding",
        duration: "5 minutes",
        whenToUse: "During anxiety attacks or when feeling overwhelmed and panicky",
        description: "The 5-4-3-2-1 technique to anchor yourself in the physical world.",
        icon: Anchor,
        color: "#ABCEC9",
        intro: "The mind is racing, but the earth is stable. Let's come back to what is real.",
        steps: [
            {
                title: "Physical Anchor",
                instruction: "Sit or stand with feet firmly on the ground. Press them into the floor.",
                audioScript: "Feet on the ground. Press them down. Feel the pressure. You are here. You are safe."
            },
            {
                title: "Outer Vision",
                instruction: "Name 5 things you can see.",
                audioScript: "Look around you. Name five things you can see right now. One... two... three... four... five. These are real. They are here."
            },
            {
                title: "Sensory Check",
                instruction: "Name 4 things you can touch, 3 things you can hear, 2 smell, 1 taste.",
                audioScript: "Now, touch four different surfaces... notice their textures. Listen for three distinct sounds. Notice two things you can smell. And one thing you can taste, or the taste in your mouth."
            },
            {
                title: "Full Presence",
                instruction: "Bring attention to your whole body. Feel yourself solid and present.",
                audioScript: "Bring your attention back to your whole body. You are solid. You are present. The anxiety may still be there, but you are more grounded than the anxiety."
            }
        ],
        realLifeExample: "Tom suffered from panic attacks. When he felt one coming, he'd spiral into fear about the fear. He learned this practice and started using it at the first signs of panic. By grounding in his body through the senses, he could ride out the panic without it escalating. After a month, his panic attacks decreased significantly.",
        journalPrompts: [
            { label: "What were my anxiety symptoms?", placeholder: "e.g., racing heart, tight chest..." },
            { label: "How did the 5-4-3-2-1 grounding help?", placeholder: "What shifted in your focus?" },
            { label: "How did my body feel before vs. after?", placeholder: "Compare the states..." }
        ]
    },
    {
        id: 'sleep-body-scan',
        title: "The Body Scan Before Sleep",
        duration: "10 minutes",
        whenToUse: "Every night before bed to process the day's emotions and improve sleep",
        description: "Process the day's emotions and improve sleep by scanning your body.",
        icon: Moon,
        color: "#5C6BC0",
        intro: "Let go of the day and prepare for rest.",
        steps: [
            {
                title: "Prepare for Sleep",
                instruction: "Lie in bed, ready for sleep.",
                audioScript: "Lie in bed. Get comfortable. Let your body sink into the mattress. You are ready for sleep."
            },
            {
                title: "Start at the Toes",
                instruction: "Starting at your toes, slowly scan up through your body.",
                audioScript: "Bring your attention to your toes. Then your feet. Slowly move up your ankles, your calves... scanning slowly upward."
            },
            {
                title: "Notice & Release",
                instruction: "At each area, notice tension. Breathe into it and let it soften.",
                audioScript: "As you scan, notice any tension or sensation. Don't fight it. Just breathe into that area and let it soften. Let it go."
            },
            {
                title: "Acknowledge Emotions",
                instruction: "If emotions arise, acknowledge them: 'Hello worry, I see you. You can rest now.'",
                audioScript: "If emotions arise—sadness, worry, frustration—just acknowledge them. Say silently: Hello worry, I see you. You can rest now."
            },
            {
                title: "Whole Body Breathing",
                instruction: "Notice your whole body breathing. Let sleep come naturally.",
                audioScript: "Feel your whole body breathing. One unified field of aliveness. Let sleep come naturally."
            }
        ],
        realLifeExample: "Emma struggled with insomnia for years. Her mind would race at night. She started this practice and discovered she was carrying the day's stress in her body - jaw clenched, shoulders tight, stomach knotted. By releasing the physical tension, the mental racing quieted. Within two weeks, she was falling asleep 30 minutes faster.",
        journalPrompts: [
            { label: "What tension did I notice before releasing it?", placeholder: "e.g., jaw, shoulders..." },
            { label: "What emotions came up during the scan?", placeholder: "e.g., worry about tomorrow..." },
            { label: "How was my sleep compared to usual?", placeholder: "Better? Same?" }
        ]
    },
    {
        id: 'lunch-break-reset',
        title: "The Lunch Break Reset",
        duration: "5 minutes",
        whenToUse: "Midday when you need to reset and recharge",
        description: "Reset your energy midday to avoid afternoon burnout.",
        icon: Coffee,
        color: "#FFA726",
        intro: "Take a moment to reset before the afternoon.",
        steps: [
            {
                title: "Step Away",
                instruction: "Step away from your desk. Find a quiet spot.",
                audioScript: "Step away from your work. Find a quiet spot. This is your time to reset."
            },
            {
                title: "Breathe Deeply",
                instruction: "Sit comfortably. Close eyes. Take 5 deep breaths.",
                audioScript: "Sit comfortably. Close your eyes. Take five deep, slow breaths. Reset your system."
            },
            {
                title: "Scan & Acknowledge",
                instruction: "Scan for accumulated emotions. Acknowledge them without judgment.",
                audioScript: "Scan your body. What emotions accumulated this morning? Stress? Boredom? Excitement? Just acknowledge them without judgment."
            },
            {
                title: "Fresh Energy",
                instruction: "Imagine breathing fresh energy into your body. Return to work present.",
                audioScript: "Imagine breathing fresh, clean energy into your body. Feel it filling you up. When you are ready, return to your day, fully present."
            }
        ],
        realLifeExample: "Kevin would power through 10-hour workdays, then come home exhausted and irritable. He started taking a 5-minute lunch break to feel his body. He'd notice he was carrying tension and frustration. By acknowledging it and releasing it midday, he had more energy for the afternoon and came home in a better mood.",
        journalPrompts: [
            { label: "What emotions had accumulated by lunchtime?", placeholder: "e.g., frustration, rush..." },
            { label: "Where was I holding them in my body?", placeholder: "e.g., neck, stomach..." },
            { label: "How did I feel after the reset?", placeholder: "More clear? Calmer?" },
            { label: "Did the afternoon go differently?", placeholder: "Productivity, mood..." }
        ]
    },
    {
        id: '10-second-check',
        title: "The 10-Second Body Check",
        duration: "10 seconds",
        whenToUse: "Wherever you are, whatever you're doing",
        description: "A micro-dose of presence. One breath. One sensation. Done.",
        icon: Timer,
        color: "#EF5350",
        intro: "Ten seconds to come back to life.",
        steps: [
            {
                title: "Deep Breath",
                instruction: "Take one deep breath.",
                audioScript: "Stop. Take one deep breath. Inhale... and exhale."
            },
            {
                title: "Feel Body",
                instruction: "Feel your body for 10 seconds.",
                audioScript: "For the next ten seconds, just feel your body. Right here. Right now."
            },
            {
                title: "One Sensation",
                instruction: "Notice one sensation. That's it! Counts as practice.",
                audioScript: "Notice just one physical sensation. A rebel feeling. A warm spot. Anything. That's it. You're done."
            }
        ],
        realLifeExample: "Mike was a busy executive who 'didn't have time' to meditate. He started doing this 10-second check between emails. He realized he was holding his breath constantly. By catching it 10 times a day, his baseline stress level dropped noticeably.",
        journalPrompts: [
            { label: "What one sensation did I notice?", placeholder: "e.g., cold hands..." },
            { label: "How many times did I manage to do it today?", placeholder: "Number..." },
            { label: "Did it break my autopilot mode?", placeholder: "Yes/No..." }
        ]
    },
    {
        id: 'bathroom-break',
        title: "The Bathroom Break Practice",
        duration: "30 seconds",
        whenToUse: "Every time you go to the bathroom",
        description: "Use a natural biological break as a spiritual break.",
        icon: Droplet,
        color: "#4FC3F7",
        intro: "A private moment to return to yourself.",
        steps: [
            {
                title: "Pause",
                instruction: "Before leaving, close your eyes.",
                audioScript: "Before you leave this private space, pause. Close your eyes."
            },
            {
                title: "Feel",
                instruction: "Feel your body for 30 seconds.",
                audioScript: "Feel your body for just thirty seconds. Drop out of your mind and into your skin."
            },
            {
                title: "Notice Emotions",
                instruction: "Notice any emotions present.",
                audioScript: "Is there an emotion here? Just notice it. You don't have to fix it."
            },
            {
                title: "Return",
                instruction: "Return to your day.",
                audioScript: "Open your eyes. Return to your day refreshed."
            }
        ],
        realLifeExample: "Sarah used the bathroom as an escape from her chaotic open office. By adding this 30-second grounding practice, she turned 'hiding' into 'recharging'.",
        journalPrompts: [
            { label: "What mood was I in during the break?", placeholder: "e.g., rushed, bored..." },
            { label: "Did the pause change my re-entry to work?", placeholder: "Describe..." }
        ]
    },
    {
        id: 'morning-coffee-ritual',
        title: "The Morning Coffee/Tea Ritual",
        duration: "2 minutes",
        whenToUse: "While your coffee/tea is brewing",
        description: "Turn waiting for caffeine into waiting for presence.",
        icon: Coffee,
        color: "#8D6E63",
        intro: "The brewing is happening. Let presence happen too.",
        steps: [
            {
                title: "Stand Still",
                instruction: "Stand still while it brews.",
                audioScript: "Don't check your phone. Just stand still. Let the coffee brew."
            },
            {
                title: "Feel Body",
                instruction: "Feel your body standing there.",
                audioScript: "Feel your feet on the floor. Feel your body standing here, waiting. Feel the anticipation."
            },
            {
                title: "Set Intention",
                instruction: "Set an intention: 'Today I will notice my body'",
                audioScript: "Set a silent intention: Today, I will notice my body. Today, I will come back to myself."
            }
        ],
        realLifeExample: "John used to check news while his coffee brewed, starting his day with anxiety. Switching to this simple standing practice changed the tone of his entire morning.",
        journalPrompts: [
            { label: "How hard was it not to check my phone?", placeholder: "Scale 1-10..." },
            { label: "Did I remember my intention later in the day?", placeholder: "Yes/No..." }
        ]
    }
];

const CHALLENGES = [
    {
        id: 'week-2',
        title: "Week 2: Throughout the Day Awareness",
        description: "Set an alarm every 2 hours. When it goes off, pause for 10 seconds and feel your body. Track how your body state changes throughout the day.",
        xpRequired: 500,
        week: 2
    },
    {
        id: 'week-3',
        title: "Week 3: Difficult Emotion Deep Dive",
        description: "Next time a difficult emotion arises (anger, fear, sadness), instead of avoiding it, sit with it for 5 full minutes. Feel it completely in your body. Journal what happens.",
        xpRequired: 1000,
        week: 3
    },
    {
        id: 'week-4',
        title: "Week 4: Bring Awareness to Movement",
        description: "During routine activities (showering, walking, eating), feel your body from within while moving. Notice how different it feels to be present in your body during these activities.",
        xpRequired: 1500,
        week: 4
    },
    {
        id: 'week-5',
        title: "Week 5: The Silent Body Walk",
        description: "Go for a 20-minute walk with no phone, no music, no podcast. Just walk and feel your body moving. Notice everything - feet on ground, arms swinging, breath, body temperature.",
        xpRequired: 2000,
        week: 5
    },
    {
        id: 'week-6',
        title: "Week 6: Body Wisdom Decision Making",
        description: "Next time you have a decision to make, instead of just thinking about it, feel into your body with each option. Notice which option creates expansion and ease, which creates contraction and tension.",
        xpRequired: 3000,
        week: 6
    }
];

const COMMON_EXPERIENCES = [
    {
        title: "I Don't Feel Anything",
        whatIsHappening: "You're not used to paying attention to your body. The sensations are subtle.",
        whatToDo: [
            "Start with stronger sensations: Press your feet firmly on the floor. Feel that pressure.",
            "Try while doing something physical: walking, stretching, or after exercise.",
            "Be patient - this is a skill that develops with practice.",
            "Even noticing 'I feel nothing' is noticing something."
        ]
    },
    {
        title: "I Feel Uncomfortable Sensations",
        whatIsHappening: "You're uncovering emotions that have been suppressed. This is good!",
        whatToDo: [
            "Stay with it - discomfort won't hurt you.",
            "Breathe into the uncomfortable area.",
            "Remind yourself: 'This is just energy moving'.",
            "If it's too intense, ground yourself (feel your feet, look around the room).",
            "The discomfort will pass if you let yourself feel it."
        ]
    },
    {
        title: "Emotions Suddenly Come Up Strongly",
        whatIsHappening: "By giving space to feel, suppressed emotions are surfacing.",
        whatToDo: [
            "This is the practice working!",
            "Let yourself feel - cry if you need to, shake if you need to.",
            "You're not creating the emotion; you're releasing what was already there.",
            "After the release, you'll feel lighter.",
            "If it feels overwhelming, work with a therapist."
        ]
    },
    {
        title: "I Feel Tingling or Energy Moving",
        whatIsHappening: "You're becoming aware of your body's subtle energy field.",
        whatToDo: [
            "This is normal and good.",
            "The tingling is often blocked energy starting to flow.",
            "Continue the practice - it usually intensifies then becomes calming.",
            "You're developing sensitivity to your inner state."
        ]
    },
    {
        title: "My Mind Keeps Wandering",
        whatIsHappening: "This is completely normal, especially at first.",
        whatToDo: [
            "Don't fight your thoughts.",
            "When you notice your mind wandered, gently return attention to your body.",
            "Each time you notice and return is a success, not a failure.",
            "The practice is noticing the wandering and returning."
        ]
    }
];

export const SituationalPractices: React.FC<{ onBack: () => void; isAdmin?: boolean }> = ({ onBack, isAdmin }) => {
    const { user } = useAuth();
    const [selectedSituation, setSelectedSituation] = useState<Situation | null>(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [isPracticing, setIsPracticing] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [showLogEntry, setShowLogEntry] = useState(false);
    const [journalData, setJournalData] = useState<Record<string, string>>({});
    const [showGuidance, setShowGuidance] = useState(false);

    const speak = useCallback((text: string, onEnd?: () => void) => {
        if (isMuted) {
            const duration = text.split(" ").length * 500;
            setTimeout(() => onEnd?.(), duration);
            return;
        }

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.85;
        utterance.pitch = 1;

        const voices = window.speechSynthesis.getVoices();
        const preferred = ['Google UK English Female', 'Microsoft Zira', 'Samantha'];
        let selected = voices.find(v => preferred.some(p => v.name.includes(p)));
        if (selected) utterance.voice = selected;

        utterance.onstart = () => { };
        utterance.onend = () => {
        };
        window.speechSynthesis.speak(utterance);
    }, [isMuted]);

    const handleReset = useCallback(() => {
        window.speechSynthesis.cancel();
        setCurrentStep(0);
    }, []);

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
        if (isPracticing && selectedSituation) {
            speak(selectedSituation.steps[currentStep].audioScript, handleNextStep);
        } else {
            window.speechSynthesis.cancel();
        }
    }, [currentStep, isPracticing, selectedSituation, speak, handleNextStep]);

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
            console.error("Error saving log:", error);
        }
    };

    if (isPracticing && selectedSituation) {
        return (
            <MeditationPortal
                title={selectedSituation.title}
                currentStepTitle={selectedSituation.steps[currentStep].title}
                currentStepInstruction={selectedSituation.steps[currentStep].instruction}
                onNext={handleNextStep}
                onReset={handleReset}
                onTogglePlay={() => setIsMuted(!isMuted)}
                isPlaying={!isMuted}
                progress={(currentStep + 1) / selectedSituation.steps.length}
            />
        );
    }

    if (showLogEntry && selectedSituation) {
        return (
            <div className="max-w-3xl mx-auto space-y-12 pb-32">
                <button onClick={() => setShowLogEntry(false)} className="flex items-center gap-2 text-white/40 hover:text-white transition-all group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Back to situation</span>
                </button>

                <header className="space-y-6">
                    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-[#ABCEC9]/10 border border-[#ABCEC9]/20">
                        <PenTool className="w-4 h-4 text-[#ABCEC9]" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#ABCEC9]">Journal Prompt after practice</span>
                    </div>
                    <h1 className="text-4xl font-serif font-bold text-white">{selectedSituation.title} Log</h1>
                </header>

                <div className="space-y-8">
                    {selectedSituation.journalPrompts.map((prompt, i) => (
                        <div key={i} className="space-y-4">
                            <label className="text-[11px] font-bold uppercase tracking-widest text-white/40">{prompt.label}</label>
                            <textarea
                                value={journalData[prompt.label] || ''}
                                onChange={(e) => setJournalData({ ...journalData, [prompt.label]: e.target.value })}
                                placeholder={prompt.placeholder}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-xl font-serif text-white focus:border-[#ABCEC9]/50 transition-all outline-none min-h-[120px] resize-none"
                            />
                        </div>
                    ))}

                    <button
                        onClick={handleSaveJournal}
                        className="w-full py-6 bg-[#ABCEC9] text-black rounded-2xl font-bold uppercase tracking-[0.2em] text-xs shadow-lg hover:scale-[1.01] transition-all flex items-center justify-center gap-3"
                    >
                        <Save className="w-4 h-4" /> Seal Reflection
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-12 pt-24 md:pt-0 pb-32 md:pb-0">
            <div className="flex justify-end items-start">
                <button
                    onClick={() => setShowGuidance(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all border border-white/5 hover:border-white/20"
                >
                    <Lightbulb className="w-4 h-4 text-[#FFA726]" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Common Experiences</span>
                </button>
            </div>

            <header className="space-y-4">
                <h1 className="text-5xl font-serif font-bold text-white">Prepare for a Situation</h1>
                <p className="text-white/40 font-serif text-xl italic max-w-xl leading-relaxed">
                    Guided practices for specific moments, helping you transform daily challenges into presence.
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {SITUATIONS.map((sit) => (
                    <button
                        key={sit.id}
                        onClick={() => setSelectedSituation(sit)}
                        className="group relative flex flex-col text-left p-10 rounded-[40px] bg-white/[0.03] border border-white/5 hover:border-white/20 hover:bg-white/[0.05] transition-all duration-500 overflow-hidden"
                    >
                        <div className="relative z-10 space-y-6">
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500" style={{ backgroundColor: `${sit.color}15` }}>
                                <sit.icon className="w-8 h-8" style={{ color: sit.color }} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-serif font-bold text-white group-hover:text-[#ABCEC9] transition-colors">{sit.title}</h3>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                                    <Clock className="w-3 h-3" /> {sit.duration}
                                </div>
                            </div>
                            <p className="text-sm text-white/40 leading-relaxed font-serif line-clamp-3">
                                {sit.description}
                            </p>
                        </div>
                        {/* Decorative Gradient Overlay */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle_at_top_right,var(--sit-color),transparent_70%)] opacity-0 group-hover:opacity-10 transition-opacity" style={{ '--sit-color': sit.color } as any} />
                    </button>
                ))}
            </div>

            {/* PROGRESSIVE CHALLENGES SECTION */}
            <div className="pt-20 space-y-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#C65F9D]/20 flex items-center justify-center">
                        <Trophy className="w-6 h-6 text-[#C65F9D]" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-serif font-bold text-white">Progressive Challenges</h2>
                        <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">For When You're Ready</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {CHALLENGES.map((challenge) => {
                        const isUnlocked = isAdmin || ((user as any)?.xp || 0) >= challenge.xpRequired;

                        return (
                            <div
                                key={challenge.id}
                                className={`relative p-8 rounded-[32px] border transition-all ${isUnlocked
                                    ? 'bg-white/[0.03] border-white/10 hover:border-[#C65F9D]/50'
                                    : 'bg-black/20 border-white/5 opacity-60'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${isUnlocked ? 'bg-[#C65F9D]/20 text-[#C65F9D]' : 'bg-white/5 text-white/30'
                                        }`}>
                                        Week {challenge.week}
                                    </div>
                                    {!isUnlocked && (
                                        <div className="flex items-center gap-1 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                                            <Target className="w-3 h-3" />
                                            {challenge.xpRequired} XP
                                        </div>
                                    )}
                                </div>

                                <h3 className={`text-xl font-serif font-bold mb-3 ${isUnlocked ? 'text-white' : 'text-white/40'}`}>
                                    {challenge.title}
                                </h3>

                                <p className={`text-sm leading-relaxed ${isUnlocked ? 'text-white/60' : 'text-white/20 blur-[1px]'}`}>
                                    {isUnlocked ? challenge.description : "Keep practicing to unlock this challenge."}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {selectedSituation && !isPracticing && !showLogEntry && (
                <div className="fixed inset-0 z-[110] bg-[#1a151b]/95 backdrop-blur-xl flex items-center justify-center p-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-2xl w-full card-glow p-12 space-y-8"
                    >
                        <div className="flex justify-between items-start">
                            <div className="w-20 h-20 rounded-3xl flex items-center justify-center" style={{ backgroundColor: `${selectedSituation.color}15` }}>
                                <selectedSituation.icon className="w-10 h-10" style={{ color: selectedSituation.color }} />
                            </div>
                            <button onClick={() => setSelectedSituation(null)} className="text-white/20 hover:text-white">✕</button>
                        </div>

                        <div className="space-y-6">
                            <h2 className="text-4xl font-serif font-bold text-white">{selectedSituation.title}</h2>
                            <div className="space-y-2">
                                <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#ABCEC9]">When to use</div>
                                <p className="text-white/60 font-serif leading-relaxed italic">{selectedSituation.whenToUse}</p>
                            </div>
                            <div className="space-y-2">
                                <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">The Practice</div>
                                <p className="text-lg text-white/80 leading-relaxed">{selectedSituation.description}</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                                <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 flex items-center gap-2">
                                    <Sparkles className="w-3 h-3" /> Real-life example
                                </div>
                                <p className="text-sm text-white/40 leading-relaxed italic">
                                    {selectedSituation.realLifeExample}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsPracticing(true)}
                            className="w-full py-6 bg-white text-black rounded-2xl font-bold uppercase tracking-[0.2em] text-xs shadow-lg hover:bg-white/90 transition-all flex items-center justify-center gap-3"
                        >
                            <Flame className="w-4 h-4" /> Start Guidance
                        </button>
                    </motion.div>
                </div>
            )}

            {/* GUIDANCE MODAL */}
            {/* GUIDANCE MODAL */}
            {/* GUIDANCE MODAL */}
            {showGuidance && createPortal(
                <div className="fixed inset-0 z-[150] bg-[#1a151b]/95 backdrop-blur-xl flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-4xl w-full max-h-[90vh] card-glow flex flex-col relative overflow-hidden"
                    >
                        <div className="p-6 md:p-8 border-b border-white/5 flex justify-between items-center bg-[#1a151b]/50 backdrop-blur-lg flex-shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-[#FFA726]/20 flex items-center justify-center">
                                    <Lightbulb className="w-5 h-5 text-[#FFA726]" />
                                </div>
                                <div>
                                    <h2 className="text-xl md:text-2xl font-serif font-bold text-white">Common Experiences</h2>
                                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest hidden md:block">Guidance for your journey</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowGuidance(false)}
                                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar flex-1 min-h-0">
                            {COMMON_EXPERIENCES.map((exp, i) => (
                                <div key={i} className="space-y-4">
                                    <h3 className="text-lg font-serif font-bold text-white border-l-4 border-[#ABCEC9] pl-4">{exp.title}</h3>

                                    <div className="bg-white/5 rounded-2xl p-5 space-y-4">
                                        <div>
                                            <span className="text-[10px] font-bold text-[#ABCEC9] uppercase tracking-widest block mb-2">What's Happening</span>
                                            <p className="text-white/80 leading-relaxed italic text-sm">{exp.whatIsHappening}</p>
                                        </div>

                                        <div>
                                            <span className="text-[10px] font-bold text-[#ABCEC9] uppercase tracking-widest block mb-2">What to do</span>
                                            <ul className="space-y-2">
                                                {exp.whatToDo.map((step, j) => (
                                                    <li key={j} className="flex items-start gap-3 text-white/60 text-sm leading-relaxed">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-white/20 mt-2 flex-shrink-0" />
                                                        {step}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>,
                document.body
            )}
        </div>
    );
};
