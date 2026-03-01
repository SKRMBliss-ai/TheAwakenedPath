export interface FeltExperience {
    id: string;
    emoji: string;
    label: string;                    // Display name
    subtitle: string;                 // Clinical framing (shown as subtext)
    color: string;                    // Emotion group color
    cognitiveDistortion: string;      // Silently logged, shown in Witness
    thoughts: string[];               // 3-4 specific thought options
    emotions: string[];               // Auto-tagged when user selects thoughts
    bodyAreas: string[];              // Pre-highlighted on body map
    sensations: string[];             // Shown when body area is tapped
    microIntervention: {
        technique: string;              // e.g., "Self-compassion"
        instruction: string;            // The actual 30-second practice
    };
    physiologicalNote: string;        // Shown optionally in Witness
}

export const FELT_EXPERIENCES: FeltExperience[] = [
    {
        id: "rejected",
        emoji: "💔",
        label: "Feeling Rejected or Unseen",
        subtitle: "Threat to belonging or attachment security",
        color: "#90CAF9",
        cognitiveDistortion: "Mind-reading / Personalizing",
        thoughts: [
            "They ignored me",
            "I'm not important to them",
            "I said too much",
            "They don't value me"
        ],
        emotions: ["Sadness", "Shame", "Loneliness", "Anxiety"],
        bodyAreas: ["Chest & Heart", "Throat & Jaw"],
        sensations: ["Chest ache", "Throat tightness", "Tearfulness", "Warmth in face"],
        microIntervention: {
            technique: "Self-compassion touch",
            instruction: "Place your hand on your heart. Breathe slowly. Say to yourself: 'I'm here. I feel this. It's okay.'"
        },
        physiologicalNote: "Social exclusion activates threat and pain-related networks. Stress response may increase heart rate and muscle tension."
    },
    {
        id: "self-doubt",
        emoji: "😔",
        label: "Doubting Myself",
        subtitle: "Anticipatory evaluation threat; reduced confidence",
        color: "#CE93D8",
        cognitiveDistortion: "Fortune-telling / Labeling",
        thoughts: [
            "I'm not qualified for this",
            "I'll mess this up",
            "Others are better than me",
            "I don't know enough"
        ],
        emotions: ["Insecurity", "Anxiety"],
        bodyAreas: ["Stomach & Gut", "Shoulders"],
        sensations: ["Butterflies", "Jaw tension", "Slight posture collapse", "Mild nausea"],
        microIntervention: {
            technique: "Evidence gathering",
            instruction: "Write or think of one thing you did well today. Just one. That's evidence your inner critic is ignoring."
        },
        physiologicalNote: "Uncertainty increases arousal via sympathetic activation. Cortisol and adrenaline prepare body for potential evaluation."
    },
    {
        id: "overwhelm",
        emoji: "😰",
        label: "Worry & Overwhelm",
        subtitle: "Excessive future simulation exceeding cognitive bandwidth",
        color: "#FFB74D",
        cognitiveDistortion: "Catastrophizing",
        thoughts: [
            "What if I forget something?",
            "Everything could go wrong",
            "I can't handle all this",
            "There's too much to do"
        ],
        emotions: ["Anxiety", "Pressure"],
        bodyAreas: ["Head", "Chest & Heart"],
        sensations: ["Rapid thinking", "Shallow breathing", "Racing pulse", "Restlessness"],
        microIntervention: {
            technique: "5-4-3-2-1 grounding",
            instruction: "Name 5 things you can see right now. 4 you can touch. 3 you can hear. 2 you can smell. 1 you can taste."
        },
        physiologicalNote: "Prolonged activation of stress response increases respiratory rate and heart rate."
    },
    {
        id: "frustration",
        emoji: "😤",
        label: "Frustration",
        subtitle: "Blocked goal response; mild anger activation",
        color: "#E57373",
        cognitiveDistortion: "Should-statements",
        thoughts: [
            "Why is this so slow?",
            "This shouldn't be happening",
            "I can't believe this",
            "Just work already!"
        ],
        emotions: ["Irritation", "Anger"],
        bodyAreas: ["Shoulders", "Throat & Jaw"],
        sensations: ["Heat", "Muscle tightening", "Clenched teeth", "Urge to act"],
        microIntervention: {
            technique: "Vagal brake breathing",
            instruction: "3 slow breaths. Inhale for 4 counts. Exhale for 6 counts. The longer exhale activates your calming system."
        },
        physiologicalNote: "Anger activates sympathetic system; increased blood flow to limbs prepares for action."
    },
    {
        id: "not-enough",
        emoji: "😞",
        label: "Feeling Behind or Not Enough",
        subtitle: "Negative social comparison; status threat",
        color: "#CE93D8",
        cognitiveDistortion: "Social comparison / Overgeneralization",
        thoughts: [
            "Everyone's ahead of me",
            "I'm failing at life",
            "I should be further by now",
            "I'm not impressive enough"
        ],
        emotions: ["Shame", "Discouragement"],
        bodyAreas: ["Chest & Heart", "Shoulders"],
        sensations: ["Heaviness", "Low energy", "Downward gaze", "Chest pressure"],
        microIntervention: {
            technique: "Perspective reframe",
            instruction: "Remind yourself: you're comparing your Chapter 3 to their Chapter 20. You can't see their full story. What's one thing YOU'VE grown in this year?"
        },
        physiologicalNote: "Shame is associated with social threat processing; parasympathetic slowing may reduce energy and posture height."
    },
    {
        id: "control",
        emoji: "😨",
        label: "Need for Control",
        subtitle: "Intolerance of unpredictability; prediction error discomfort",
        color: "#FFB74D",
        cognitiveDistortion: "Uncertainty intolerance",
        thoughts: [
            "I need to know what's coming",
            "This uncertainty is unbearable",
            "I can't relax until it's resolved",
            "What if I miss something?"
        ],
        emotions: ["Unease", "Vigilance"],
        bodyAreas: ["Chest & Heart", "Head"],
        sensations: ["Fidgeting", "Scanning eyes", "Chest tension"],
        microIntervention: {
            technique: "Circle of control",
            instruction: "Ask yourself: 'What can I actually influence right now?' Focus only on that. Let the rest exist without your involvement."
        },
        physiologicalNote: "Uncertainty activates salience network; mild sympathetic arousal increases vigilance and motor restlessness."
    },
    {
        id: "people-pleasing",
        emoji: "🫣",
        label: "People-Pleasing Mode",
        subtitle: "Fear of relational conflict; suppression of own needs",
        color: "#F48FB1",
        cognitiveDistortion: "Emotional reasoning",
        thoughts: [
            "Don't upset them",
            "Just agree and move on",
            "My needs can wait",
            "I shouldn't say what I really think"
        ],
        emotions: ["Anxiety", "Resentment"],
        bodyAreas: ["Throat & Jaw", "Stomach & Gut"],
        sensations: ["Tight smile", "Throat constriction", "Stomach knot"],
        microIntervention: {
            technique: "Needs identification",
            instruction: "Ask yourself: 'What do I actually need right now?' Not what they need. Not what's easiest. What do YOU need?"
        },
        physiologicalNote: "Social threat + emotional suppression increases autonomic tension; inhibited anger remains physiologically activated."
    },
    {
        id: "numbness",
        emoji: "😶",
        label: "Emotional Numbness",
        subtitle: "Hypo-arousal after prolonged stress; protective dampening",
        color: "#A5D6A7",
        cognitiveDistortion: "Avoidance / Dissociation",
        thoughts: [
            "I feel nothing",
            "I don't care anymore",
            "I'm disconnected from everything",
            "It doesn't matter"
        ],
        emotions: ["Detachment", "Flatness"],
        bodyAreas: ["Limbs & Whole Body", "Chest & Heart"],
        sensations: ["Low energy", "Shallow breathing", "Reduced facial expressiveness"],
        microIntervention: {
            technique: "Somatic re-engagement",
            instruction: "Feel your feet on the floor. Press them down gently. Wiggle your toes. Notice the texture beneath you. You are here."
        },
        physiologicalNote: "Dorsal vagal parasympathetic pathways may dominate after sustained stress; system shifts toward conservation mode."
    },
    {
        id: "inner-critic",
        emoji: "🗣️",
        label: "Inner Critic Attack",
        subtitle: "Internalized evaluation threat; self-directed hostility",
        color: "#E57373",
        cognitiveDistortion: "Labeling / All-or-nothing thinking",
        thoughts: [
            "You're useless",
            "That was stupid",
            "You always fail",
            "You're embarrassing yourself"
        ],
        emotions: ["Shame", "Guilt", "Anxiety"],
        bodyAreas: ["Chest & Heart", "Shoulders"],
        sensations: ["Tight chest", "Sinking feeling", "Lowered head", "Jaw tension"],
        microIntervention: {
            technique: "Compassionate reframe",
            instruction: "Rewrite that thought as if you were speaking to your closest friend. Would you say 'You're useless' to them? What would you actually say?"
        },
        physiologicalNote: "Self-criticism activates similar neural networks as external criticism; increases stress hormones and muscular contraction."
    }
];
