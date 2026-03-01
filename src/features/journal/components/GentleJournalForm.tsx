import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BodyMapSelector from "./BodyMapSelector";
import { useVoiceGuidance } from "../services/voiceGuidance";
import { VoiceToggle } from "./VoiceToggle";

// ─── ANIMATIONS & STYLES ─────────────────────────────────────────────────────

const T = {
    rose: "var(--accent-primary)",
    teal: "var(--accent-secondary)",
    cream: "var(--text-primary)",
} as const;

const fadeUp: any = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 1, 0.5, 1] } },
    exit: { opacity: 0, y: -8, transition: { duration: 0.3 } },
};

const stagger: any = {
    visible: { transition: { staggerChildren: 0.05 } },
};


const fadeIn: any = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 1, 0.5, 1] } },
};

const expand: any = {
    hidden: { height: 0, opacity: 0 },
    visible: { height: "auto", opacity: 1, transition: { duration: 0.4, ease: [0.25, 1, 0.5, 1] } },
    exit: { height: 0, opacity: 0, transition: { duration: 0.25 } },
};

const childPop: any = {
    hidden: { opacity: 0, scale: 0.92 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: [0.25, 1, 0.5, 1] } },
};



// ─── DATA CONSTANTS ──────────────────────────────────────────────────────────

const THOUGHT_GROUPS = [
    {
        id: "rejection",
        emoji: "💔",
        label: "Feeling rejected or unseen",
        color: T.rose,
        thoughts: [
            "Did they just ignore me?",
            "They don't want me around",
            "Nobody really cares about me",
        ],
    },
    {
        id: "self-doubt",
        emoji: "😔",
        label: "Doubting myself",
        color: T.teal,
        thoughts: [
            "I'm not good enough",
            "I messed up again",
            "People are judging me",
        ],
    },
    {
        id: "overwhelm",
        emoji: "😰",
        label: "Worry & overwhelm",
        color: T.cream,
        thoughts: [
            "It's all too much",
            "What if things go wrong?",
            "I can't control this situation",
        ],
    },
    {
        id: "resentment",
        emoji: "😤",
        label: "Frustration with life or others",
        color: T.rose,
        thoughts: [
            "That was so unfair",
            "Everyone else has it together",
            "I wish I had done things differently",
        ],
    },
];

const EMOTION_CARDS = [
    {
        id: "fear",
        emoji: "😰",
        label: "Fear & Anxiety",
        color: T.cream,
        description: "Worry, dread, unease",
        nuances: ["Anxious", "Panicked", "Overwhelmed", "Worried", "Insecure"],
    },
    {
        id: "sadness",
        emoji: "😢",
        label: "Sadness & Grief",
        color: T.teal,
        description: "Loss, loneliness, heaviness",
        nuances: ["Lonely", "Heartbroken", "Hopeless", "Disappointed", "Sorrowful"],
    },
    {
        id: "anger",
        emoji: "😤",
        label: "Anger & Frustration",
        color: T.rose,
        description: "Irritation, resentment, heat",
        nuances: ["Irritated", "Resentful", "Furious", "Annoyed", "Jealous"],
    },
    {
        id: "shame",
        emoji: "😳",
        label: "Shame & Worthlessness",
        color: T.rose,
        description: "Guilt, embarrassment, not enough",
        nuances: ["Embarrassed", "Guilty", "Humiliated", "Defective", "Inadequate"],
    },
    {
        id: "exhaustion",
        emoji: "😴",
        label: "Exhaustion & Numbness",
        color: T.cream,
        description: "Drained, disconnected, empty",
        nuances: ["Drained", "Apathetic", "Disconnected", "Burnt out", "Empty"],
    },
    {
        id: "peace",
        emoji: "😌",
        label: "Peace & Gratitude",
        color: T.teal,
        description: "Calm, relief, contentment",
        nuances: ["Calm", "Relieved", "Hopeful", "Appreciative", "Content"],
    },
];

const STEPS = [
    { num: 1, label: "Thought" },
    { num: 2, label: "Feeling" },
    { num: 3, label: "Body" },
    { num: 4, label: "Witness" },
];

// ─── REUSABLE UI COMPONENTS ──────────────────────────────────────────────────

function StepTracker({ current }: { current: number }) {
    return (
        <div className="flex items-center justify-center gap-1 py-3">
            {STEPS.map((step, i) => {
                const isActive = i === current;
                const isDone = i < current;
                return (
                    <div key={step.num} className="flex items-center gap-1">
                        <div className="flex flex-col items-center" style={{ minWidth: 56 }}>
                            <div className="flex items-center justify-center rounded-full transition-all duration-500"
                                style={{
                                    width: 32, height: 32,
                                    background: isActive ? "var(--nav-active-bg)" : isDone ? "var(--accent-secondary-muted)" : "var(--bg-surface)",
                                    border: isActive ? "2px solid var(--accent-primary)" : isDone ? "2px solid var(--accent-secondary-border)" : "2px solid var(--border-subtle)",
                                }}>
                                {isDone ? <span style={{ color: "var(--accent-secondary)", fontSize: 14 }}>✓</span> :
                                    <span style={{ color: isActive ? "var(--accent-primary)" : "var(--text-muted)", fontSize: 13, fontWeight: 600 }}>{step.num}</span>}
                            </div>
                            <span className="mt-1 transition-colors duration-500"
                                style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", color: isActive ? "var(--accent-primary)" : isDone ? "var(--accent-secondary)" : "var(--text-muted)" }}>
                                {step.label}
                            </span>
                        </div>
                        {i < STEPS.length - 1 && (
                            <div className="transition-colors duration-500"
                                style={{ width: 24, height: 2, borderRadius: 1, marginBottom: 14, background: isDone ? "var(--accent-secondary-border)" : "var(--border-subtle)" }} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

function GentleTextarea({ label, placeholder, value, onChange, hint }: { label: string, placeholder: string, value: string, onChange: (v: string) => void, hint?: string }) {
    const ref = useRef<HTMLTextAreaElement>(null);
    useEffect(() => {
        if (ref.current) {
            ref.current.style.height = "auto";
            ref.current.style.height = Math.max(120, ref.current.scrollHeight) + "px";
        }
    }, [value]);

    return (
        <motion.div variants={fadeUp} className="space-y-3">
            {label && <label style={{ display: "block", fontSize: 18, color: "var(--text-primary)", fontFamily: "'Georgia', serif", lineHeight: 1.4, opacity: 0.8 }}>{label}</label>}
            {hint && <p style={{ fontSize: 14, color: "var(--text-muted)", fontStyle: "italic", lineHeight: 1.5 }}>{hint}</p>}
            <textarea
                ref={ref} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={4}
                style={{
                    width: "100%", minHeight: 120, padding: "20px 24px", fontSize: 17, lineHeight: 1.7,
                    fontFamily: "'Georgia', serif", color: "var(--text-primary)", background: "var(--bg-input)",
                    border: "1px solid var(--border-subtle)", borderRadius: 20, outline: "none", resize: "none",
                    transition: "border-color 0.3s, background 0.3s",
                }}
                onFocus={(e) => { e.target.style.borderColor = "var(--accent-primary)"; e.target.style.background = "var(--bg-input-focus)"; }}
                onBlur={(e) => { e.target.style.borderColor = "var(--border-subtle)"; e.target.style.background = "var(--bg-input)"; }}
            />
        </motion.div>
    );
}

function SummaryCard({ label, content, color = "white" }: { label: string, content: string, color?: "white" | "pink" | "teal" }) {
    if (!content) return null;
    const accentMap = {
        white: { bg: "var(--bg-surface)", border: "var(--border-subtle)", text: "var(--text-primary)", label: "var(--text-muted)" },
        pink: { bg: "var(--accent-primary-muted)", border: "var(--accent-primary-border)", text: "var(--accent-primary)", label: "var(--accent-primary)" },
        teal: { bg: "var(--accent-secondary-muted)", border: "var(--accent-secondary-border)", text: "var(--accent-secondary)", label: "var(--accent-secondary)" },
    };
    const c = accentMap[color];
    return (
        <div style={{ padding: "16px 20px", borderRadius: 16, background: c.bg, border: `1px solid ${c.border}`, opacity: 0.9 }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: c.label, marginBottom: 6, opacity: 0.7 }}>{label}</p>
            <p style={{ fontSize: 14, color: c.text, lineHeight: 1.6, fontFamily: "'Georgia', serif" }}>{content}</p>
        </div>
    );
}

function NavButton({ children, onClick, variant = "next", disabled = false }: { children: React.ReactNode, onClick: () => void, variant?: "next" | "back" | "save", disabled?: boolean }) {
    const s = {
        next: { bg: "rgba(209,107,165,0.15)", border: "rgba(209,107,165,0.35)", color: "rgba(209,107,165,0.9)", hoverBg: "rgba(209,107,165,0.25)" },
        back: { bg: "var(--bg-surface)", border: "var(--border-default)", color: "var(--text-secondary)", hoverBg: "var(--bg-glass)" },
        save: { bg: "rgba(171,206,201,0.15)", border: "rgba(171,206,201,0.35)", color: "rgba(171,206,201,0.9)", hoverBg: "rgba(171,206,201,0.25)" },
    }[variant];
    return (
        <motion.button whileTap={{ scale: 0.97 }} onClick={onClick} disabled={disabled}
            style={{
                padding: "18px 36px", borderRadius: 16, fontSize: 16, fontWeight: 600, letterSpacing: "0.04em",
                background: disabled ? "var(--bg-surface)" : s.bg, border: `1.5px solid ${disabled ? "var(--border-subtle)" : s.border}`,
                color: disabled ? "var(--text-disabled)" : s.color, cursor: disabled ? "not-allowed" : "pointer",
                transition: "all 0.3s ease", minHeight: 58, minWidth: 120,
            }}
            onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.background = s.hoverBg; }}
            onMouseLeave={(e) => { if (!disabled) e.currentTarget.style.background = s.bg; }}
        >
            {children}
        </motion.button>
    );
}



function ThoughtSelector({
    selectedThoughts,
    onToggle,
}: {
    selectedThoughts: string[];
    onToggle: (thought: string) => void;
}) {
    const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

    const hasSelectionIn = (group: typeof THOUGHT_GROUPS[0]) =>
        group.thoughts.some((t) => selectedThoughts.includes(t));

    const countIn = (group: typeof THOUGHT_GROUPS[0]) =>
        group.thoughts.filter((t) => selectedThoughts.includes(t)).length;

    return (
        <div className="flex flex-col gap-3">
            {THOUGHT_GROUPS.map((group) => {
                const isOpen = expandedGroup === group.id;
                const hasSelection = hasSelectionIn(group);
                const count = countIn(group);

                return (
                    <motion.div key={group.id} variants={fadeIn}>
                        {/* Group header card */}
                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setExpandedGroup(isOpen ? null : group.id)}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 14,
                                width: "100%",
                                padding: "18px 20px",
                                borderRadius: isOpen ? "18px 18px 0 0" : 18,
                                border: `1.5px solid ${hasSelection ? group.color + "50" : isOpen ? group.color + "30" : "var(--border-default)"}`,
                                borderBottom: isOpen ? `1px solid ${group.color}20` : undefined,
                                background: hasSelection
                                    ? group.color + "12"
                                    : isOpen
                                        ? group.color + "08"
                                        : "var(--bg-surface)",
                                cursor: "pointer",
                                textAlign: "left",
                                minHeight: 68,
                                transition: "all 0.3s ease",
                            }}
                        >
                            <span style={{ fontSize: 30, lineHeight: 1, flexShrink: 0 }}>
                                {group.emoji}
                            </span>
                            <div style={{ flex: 1 }}>
                                <span
                                    style={{
                                        fontSize: 16,
                                        fontWeight: 600,
                                        color: hasSelection
                                            ? group.color
                                            : isOpen
                                                ? "var(--text-primary)"
                                                : "var(--text-secondary)",
                                        display: "block",
                                    }}
                                >
                                    {group.label}
                                </span>
                                {hasSelection && !isOpen && (
                                    <span
                                        style={{
                                            fontSize: 12,
                                            color: group.color + "90",
                                            marginTop: 2,
                                            display: "block",
                                        }}
                                    >
                                        {count} selected
                                    </span>
                                )}
                            </div>

                            {/* Badge or chevron */}
                            {hasSelection && !isOpen ? (
                                <div
                                    style={{
                                        width: 26,
                                        height: 26,
                                        borderRadius: "50%",
                                        background: group.color + "25",
                                        border: `2px solid ${group.color}60`,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                    }}
                                >
                                    <span style={{ color: group.color, fontSize: 13, fontWeight: 700 }}>
                                        ✓
                                    </span>
                                </div>
                            ) : (
                                <motion.span
                                    animate={{ rotate: isOpen ? 180 : 0 }}
                                    transition={{ duration: 0.3 }}
                                    style={{
                                        fontSize: 16,
                                        color: isOpen ? group.color + "80" : "var(--text-disabled)",
                                        flexShrink: 0,
                                    }}
                                >
                                    ▾
                                </motion.span>
                            )}
                        </motion.button>

                        {/* Expanded thoughts */}
                        <AnimatePresence>
                            {isOpen && (
                                <motion.div
                                    variants={expand}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    style={{
                                        overflow: "hidden",
                                        borderRadius: "0 0 18px 18px",
                                        border: `1.5px solid ${group.color}30`,
                                        borderTop: "none",
                                        background: group.color + "06",
                                    }}
                                >
                                    <motion.div
                                        variants={stagger}
                                        initial="hidden"
                                        animate="visible"
                                        style={{ padding: "10px 14px 14px" }}
                                        className="flex flex-col gap-2"
                                    >
                                        {group.thoughts.map((thought) => {
                                            const sel = selectedThoughts.includes(thought);
                                            return (
                                                <motion.button
                                                    key={thought}
                                                    variants={childPop}
                                                    whileTap={{ scale: 0.97 }}
                                                    onClick={() => onToggle(thought)}
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 12,
                                                        width: "100%",
                                                        padding: "14px 16px",
                                                        borderRadius: 14,
                                                        border: `1.5px solid ${sel ? group.color + "50" : "var(--border-subtle)"}`,
                                                        background: sel
                                                            ? group.color + "15"
                                                            : "var(--bg-surface)",
                                                        cursor: "pointer",
                                                        textAlign: "left",
                                                        minHeight: 52,
                                                        transition: "all 0.2s ease",
                                                    }}
                                                >
                                                    {/* Checkbox */}
                                                    <div
                                                        style={{
                                                            width: 22,
                                                            height: 22,
                                                            borderRadius: 7,
                                                            border: `2px solid ${sel ? group.color + "70" : "var(--border-default)"}`,
                                                            background: sel ? group.color + "20" : "transparent",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            flexShrink: 0,
                                                            transition: "all 0.2s",
                                                        }}
                                                    >
                                                        {sel && (
                                                            <motion.span
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                style={{
                                                                    color: group.color,
                                                                    fontSize: 12,
                                                                    fontWeight: 700,
                                                                }}
                                                            >
                                                                ✓
                                                            </motion.span>
                                                        )}
                                                    </div>
                                                    <span
                                                        style={{
                                                            fontSize: 15,
                                                            color: sel
                                                                ? group.color
                                                                : "var(--text-secondary)",
                                                            fontFamily: "Georgia, serif",
                                                            lineHeight: 1.4,
                                                        }}
                                                    >
                                                        {thought}
                                                    </span>
                                                </motion.button>
                                            );
                                        })}
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                );
            })}
        </div >
    );
}

function EmotionSelector({
    selectedEmotions,
    onToggle,
}: {
    selectedEmotions: string[];
    onToggle: (emotion: string) => void;
}) {
    const [expandedCard, setExpandedCard] = useState<string | null>(null);

    const hasSelectionIn = (card: typeof EMOTION_CARDS[0]) =>
        card.nuances.some((n) => selectedEmotions.includes(n));

    const getSelectedIn = (card: typeof EMOTION_CARDS[0]) =>
        card.nuances.filter((n) => selectedEmotions.includes(n));

    return (
        <div className="flex flex-col gap-3">
            {EMOTION_CARDS.map((card) => {
                const isOpen = expandedCard === card.id;
                const hasSelection = hasSelectionIn(card);
                const selected = getSelectedIn(card);

                return (
                    <motion.div key={card.id} variants={fadeIn}>
                        {/* Emotion card header */}
                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setExpandedCard(isOpen ? null : card.id)}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 14,
                                width: "100%",
                                padding: "18px 20px",
                                borderRadius: isOpen ? "18px 18px 0 0" : 18,
                                border: `1.5px solid ${hasSelection ? card.color + "50" : isOpen ? card.color + "30" : "var(--border-subtle)"}`,
                                borderBottom: isOpen ? `1px solid ${card.color}20` : undefined,
                                background: hasSelection
                                    ? card.color + "12"
                                    : isOpen
                                        ? card.color + "08"
                                        : "var(--bg-surface)",
                                cursor: "pointer",
                                textAlign: "left",
                                minHeight: 68,
                                transition: "all 0.3s ease",
                            }}
                        >
                            <span style={{ fontSize: 30, lineHeight: 1, flexShrink: 0 }}>
                                {card.emoji}
                            </span>
                            <div style={{ flex: 1 }}>
                                <span
                                    style={{
                                        fontSize: 16,
                                        fontWeight: 600,
                                        color: hasSelection
                                            ? card.color
                                            : isOpen
                                                ? "var(--text-primary)"
                                                : "var(--text-secondary)",
                                        display: "block",
                                    }}
                                >
                                    {card.label}
                                </span>
                                <span
                                    style={{
                                        fontSize: 13,
                                        color: hasSelection
                                            ? card.color
                                            : "var(--text-muted)",
                                        display: "block",
                                        marginTop: 2,
                                    }}
                                >
                                    {hasSelection && !isOpen
                                        ? selected.join(", ")
                                        : card.description}
                                </span>
                            </div>

                            {hasSelection && !isOpen ? (
                                <div
                                    style={{
                                        width: 26,
                                        height: 26,
                                        borderRadius: "50%",
                                        background: card.color + "25",
                                        border: `2px solid ${card.color}60`,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                    }}
                                >
                                    <span style={{ color: card.color, fontSize: 13, fontWeight: 700 }}>
                                        ✓
                                    </span>
                                </div>
                            ) : (
                                <motion.span
                                    animate={{ rotate: isOpen ? 180 : 0 }}
                                    transition={{ duration: 0.3 }}
                                    style={{
                                        fontSize: 16,
                                        color: isOpen ? card.color + "80" : "var(--text-disabled)",
                                        flexShrink: 0,
                                    }}
                                >
                                    ▾
                                </motion.span>
                            )}
                        </motion.button>

                        {/* Expanded nuances */}
                        <AnimatePresence>
                            {isOpen && (
                                <motion.div
                                    variants={expand}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    style={{
                                        overflow: "hidden",
                                        borderRadius: "0 0 18px 18px",
                                        border: `1.5px solid ${card.color}30`,
                                        borderTop: "none",
                                        background: card.color + "06",
                                    }}
                                >
                                    <motion.div
                                        variants={stagger}
                                        initial="hidden"
                                        animate="visible"
                                        style={{ padding: "10px 14px 14px" }}
                                        className="flex flex-wrap gap-2"
                                    >
                                        {card.nuances.map((nuance) => {
                                            const sel = selectedEmotions.includes(nuance);
                                            return (
                                                <motion.button
                                                    key={nuance}
                                                    variants={childPop}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => onToggle(nuance)}
                                                    style={{
                                                        padding: "12px 20px",
                                                        borderRadius: 14,
                                                        border: `1.5px solid ${sel ? card.color + "55" : "var(--border-subtle)"}`,
                                                        background: sel
                                                            ? card.color + "18"
                                                            : "var(--bg-surface)",
                                                        color: sel ? card.color : "var(--text-secondary)",
                                                        fontSize: 15,
                                                        fontWeight: sel ? 600 : 400,
                                                        cursor: "pointer",
                                                        minHeight: 48,
                                                        transition: "all 0.2s ease",
                                                    }}
                                                >
                                                    {nuance}
                                                </motion.button>
                                            );
                                        })}
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                );
            })}
        </div>
    );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export function GentleJournalForm({ onSave, onCancel, initialData }: { onSave: (data: any) => void, onCancel: () => void, initialData?: any }) {
    const [step, setStep] = useState(0);
    const voice = useVoiceGuidance();

    const [selectedThoughts, setSelectedThoughts] = useState<string[]>(initialData?.thoughts ? initialData.thoughts.split(' | ').filter(Boolean) : []);
    const [customThought, setCustomThought] = useState(initialData?.customThought || "");
    const [selectedEmotions, setSelectedEmotions] = useState<string[]>(initialData?.emotions ? initialData.emotions.split(', ') : []);
    const [selectedArea, setSelectedArea] = useState<any>(initialData?.bodyArea ? { label: initialData.bodyArea } : null);
    const [bodySensations, setBodySensations] = useState(initialData?.bodySensations || "");
    const [openReflection, setOpenReflection] = useState(initialData?.reflections || "");

    const scrollRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }, [step]);

    const bottomRef = useRef<HTMLDivElement>(null);
    const [showNextPrompt, setShowNextPrompt] = useState(false);
    useEffect(() => {
        setShowNextPrompt(false);
    }, [step]);

    // 🎙️ VOICE NARRATION SYSTEM
    useEffect(() => {
        if (!voice.audioEnabled) return;

        // Static intros (cacheable)
        const intros: Record<number, { text: string; key: string }> = {
            0: {
                text: "Take a moment... and notice what's been on your mind today. ... Sometimes thoughts come as quiet whispers... sometimes they feel loud and heavy. ... If anything below feels familiar... simply tap the one that resonates.",
                key: "step-0-intro"
            },
            1: {
                text: `Now... let's notice what that thought created inside you. ... Eckhart Tolle says... "Emotion arises at the place where mind and body meet. It is the body's reaction to your mind." ... What did that thought make you feel? ... Tap the feeling that comes closest.`,
                key: "step-1-intro"
            },
            2: {
                text: "Emotions are energy in motion... and that energy always lands somewhere in the body. ... If you can... close your eyes for a moment. ... Take one slow breath. ... Now notice... where in your body do you feel it? ... Tap the area that draws your attention.",
                key: "step-2-intro"
            }
        };

        if (intros[step]) {
            voice.playText(intros[step].text, intros[step].key);
        } else if (step === 3) {
            // Step 4 (Witness) — Fully Dynamic Narration
            const t = [...selectedThoughts, customThought].filter(Boolean).join("... and... ");
            const e = selectedEmotions.join("... ");
            const body = selectedArea?.label || "part of your body";

            const witnessText = `Now... step back. ...
A thought arose... "${t}" ...
Which created a feeling of... ${e}. ...
Which you felt in your... ${body}. ...
But notice something... ...
You are not the thought.
You are not the emotion.
You are not the sensation. ...
You... are the one... who was watching them happen. ...
That awareness... that witnessing presence...
that is who you truly are.`;

            voice.playText(witnessText);
        } else if (step === 5) {
            voice.playText("Your reflection has been saved. ... By watching the thought... feeling the emotion... and noticing the body... you have already begun to dissolve the pattern.");
        }
    }, [step]);

    const scrollToBottom = () => {
        setTimeout(() => {
            setShowNextPrompt(true);
            setTimeout(() => {
                bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            }, 100);
        }, 2000);
    };

    const handleToggleThought = (label: string) => {
        setSelectedThoughts(prev => {
            if (!prev.includes(label)) {
                scrollToBottom();
                voice.playText(`I see... "${label}". ... That's a thought many of us carry. Let's gently look at what it created inside you.`);
            }
            return prev.includes(label) ? prev.filter(t => t !== label) : [...prev, label];
        });
    };
    const handleToggleEmotion = (emotion: string) => {
        setSelectedEmotions(prev => {
            if (!prev.includes(emotion)) {
                scrollToBottom();
                voice.playText(`You're feeling ${emotion}. ... Thank you for naming that. ... Simply naming a feeling... is already an act of awareness.`);
            }
            return prev.includes(emotion) ? prev.filter(e => e !== emotion) : [...prev, emotion];
        });
    };

    const handleSelectArea = (area: any) => {
        setSelectedArea(area);
        if (area) scrollToBottom();
    };

    const handleSave = () => {
        const thoughtsStr = [...selectedThoughts, customThought].filter(Boolean).join(' | ');
        onSave({
            thoughts: thoughtsStr,
            emotions: selectedEmotions.join(', '),
            bodyArea: selectedArea?.label || "",
            bodySensations: bodySensations,
            reflections: openReflection,
        });
        setStep(5);
    };

    return (
        <div ref={scrollRef} className="w-full h-full" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
            <VoiceToggle enabled={voice.audioEnabled} playing={voice.isPlaying} loading={voice.isLoading} onToggle={voice.toggleAudio} />
            <div className="relative z-10 w-full max-w-xl mx-auto pb-32">
                {step < 5 && <StepTracker current={step} />}

                <div style={{ marginTop: 24 }}>
                    <AnimatePresence mode="wait">

                        {/* STEP 0: THOUGHTS */}
                        {step === 0 && (
                            <motion.div key="step0" variants={fadeUp} initial="hidden" animate="visible" exit="exit" className="space-y-8">
                                <motion.div variants={fadeUp} className="text-center space-y-2">
                                    <h2 style={{ fontSize: 28, fontFamily: "'Georgia', serif", color: "var(--text-primary)" }}>What's on your mind?</h2>
                                </motion.div>

                                <motion.div variants={fadeUp} style={{ padding: "20px 24px", borderRadius: 16, background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
                                    <p style={{ fontSize: 15, color: "var(--text-muted)", fontStyle: "italic", fontFamily: "'Georgia', serif", lineHeight: 1.6 }}>
                                        "The beginning of freedom is the realization that you are not the thinker."
                                    </p>
                                    <p style={{ fontSize: 12, color: "var(--text-disabled)", marginTop: 8, letterSpacing: "0.05em", textTransform: "uppercase" }}>— Eckhart Tolle</p>
                                </motion.div>

                                <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-4">
                                    <p style={{ fontSize: 16, color: "var(--text-primary)", fontFamily: "'Georgia', serif", opacity: 0.9 }}>
                                        Did any of these thoughts come up?
                                    </p>
                                    <p style={{ fontSize: 13, color: "var(--text-muted)", fontStyle: "italic", marginTop: -8 }}>Tap all that sound familiar — or write your own below</p>
                                    <div className="flex flex-col gap-3 mt-4">
                                        <ThoughtSelector
                                            selectedThoughts={selectedThoughts}
                                            onToggle={handleToggleThought}
                                        />
                                    </div>
                                </motion.div>

                                <motion.div variants={fadeUp} className="pt-4">
                                    <GentleTextarea label="Or in your own words:" placeholder="What was the thought? What triggered it?" value={customThought} onChange={setCustomThought} />
                                </motion.div>

                                <div ref={bottomRef} className="flex flex-col gap-6 pt-4">
                                    <AnimatePresence>
                                        {showNextPrompt && (
                                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                                                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", fontStyle: "italic", letterSpacing: "0.02em" }}>Please scroll down to continue ↓</p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    <div className="flex justify-between">
                                        <NavButton onClick={onCancel} variant="back">Cancel</NavButton>
                                        <NavButton onClick={() => setStep(1)} variant="next">Next →</NavButton>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 1: EMOTIONS */}
                        {step === 1 && (
                            <motion.div key="step1" variants={fadeUp} initial="hidden" animate="visible" exit="exit" className="space-y-8">
                                <motion.div variants={fadeUp} className="text-center space-y-2">
                                    <h2 style={{ fontSize: 28, fontFamily: "'Georgia', serif", color: "var(--text-primary)" }}>What did that make you feel?</h2>
                                    <p style={{ fontSize: 15, color: "var(--text-muted)", fontFamily: "'Georgia', serif" }}>Name the emotions simply, without judging them.</p>
                                </motion.div>

                                {(selectedThoughts.length > 0 || customThought) && (
                                    <motion.div variants={fadeUp} style={{ padding: "16px 20px", borderRadius: 16, background: "var(--accent-primary-muted)", borderLeft: `3px solid var(--accent-primary)` }}>
                                        <p style={{ fontSize: 12, color: "var(--accent-primary)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 6, opacity: 0.7 }}>Your thought was:</p>
                                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                            {selectedThoughts.map(t => <p key={t} style={{ fontSize: 15, color: "var(--text-primary)", fontFamily: "'Georgia', serif", fontStyle: "italic", opacity: 0.9 }}>"{t}"</p>)}
                                            {customThought && <p key="custom" style={{ fontSize: 15, color: "var(--text-primary)", fontFamily: "'Georgia', serif", fontStyle: "italic", opacity: 0.9 }}>"{customThought}"</p>}
                                        </div>
                                    </motion.div>
                                )}

                                <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-8">
                                    <EmotionSelector
                                        selectedEmotions={selectedEmotions}
                                        onToggle={handleToggleEmotion}
                                    />
                                </motion.div>

                                <div ref={bottomRef} className="flex flex-col gap-6 pt-4 mt-8">
                                    <AnimatePresence>
                                        {showNextPrompt && (
                                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                                                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", fontStyle: "italic", letterSpacing: "0.02em" }}>Please scroll down to continue ↓</p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    <div className="flex justify-between">
                                        <NavButton onClick={() => setStep(0)} variant="back">← Back</NavButton>
                                        <NavButton onClick={() => setStep(2)} variant="next">Next →</NavButton>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 2: BODY AWARENESS (MAP) */}
                        {step === 2 && (
                            <motion.div key="step2" variants={fadeUp} initial="hidden" animate="visible" exit="exit" className="space-y-8">
                                <motion.div variants={fadeUp} className="text-center space-y-2">
                                    <h2 style={{ fontSize: 28, fontFamily: "'Georgia', serif", color: "var(--text-primary)" }}>Where do you feel it in your body?</h2>
                                    <p style={{ fontSize: 15, color: "var(--text-muted)", fontFamily: "'Georgia', serif" }}>Emotion is energy in motion. It always lands somewhere physical.</p>
                                </motion.div>

                                {selectedEmotions.length > 0 && (
                                    <motion.div variants={fadeUp} className="flex flex-wrap gap-2 justify-center pb-4">
                                        {selectedEmotions.map(e => (
                                            <span key={e} style={{ padding: "6px 14px", borderRadius: 100, background: "var(--accent-secondary-muted)", border: "1px solid var(--accent-secondary-border)", color: "var(--accent-secondary)", fontSize: 13 }}>{e}</span>
                                        ))}
                                    </motion.div>
                                )}

                                <motion.div variants={fadeUp}>
                                    <BodyMapSelector selectedArea={selectedArea} onSelect={handleSelectArea} />
                                </motion.div>

                                <GentleTextarea
                                    label="Or describe it in your own words:"
                                    hint="Notice tension, warmth, tightness, heaviness, or lightness."
                                    placeholder="For example: tightness in my shoulders..."
                                    value={bodySensations}
                                    onChange={setBodySensations}
                                />

                                <div ref={bottomRef} className="flex flex-col gap-6 pt-4 mt-8">
                                    <AnimatePresence>
                                        {showNextPrompt && (
                                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                                                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", fontStyle: "italic", letterSpacing: "0.02em" }}>Please scroll down to continue ↓</p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    <div className="flex justify-between">
                                        <NavButton onClick={() => setStep(1)} variant="back">← Back</NavButton>
                                        <NavButton onClick={() => setStep(3)} variant="next">Next →</NavButton>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 3: WITNESS AND REFLECTION */}
                        {step === 3 && (
                            <motion.div key="step3" variants={fadeUp} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                                <motion.div variants={fadeUp} className="text-center space-y-2">
                                    <h2 style={{ fontSize: 28, fontFamily: "'Georgia', serif", color: "var(--text-primary)" }}>Step back and witness</h2>
                                </motion.div>

                                <motion.div variants={fadeUp} style={{ padding: "24px", borderRadius: 16, background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", textAlign: "center" }}>
                                    <p style={{ fontSize: 16, color: "var(--text-primary)", fontFamily: "'Georgia', serif", lineHeight: 1.6, opacity: 0.8 }}>
                                        You are not the thought, not the emotion, not the sensation.<br />
                                        <span style={{ color: "var(--accent-primary)", fontStyle: "italic", opacity: 1 }}>You are the one who is watching them happen.</span>
                                    </p>
                                </motion.div>

                                <motion.div variants={fadeUp} className="space-y-4">
                                    <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)" }}>What you witnessed today:</p>
                                    <div className="flex flex-col gap-3">
                                        <SummaryCard label="Thought" content={[...selectedThoughts, customThought].filter(Boolean).join(' | ')} />
                                        <SummaryCard label="Emotion" content={selectedEmotions.join(", ")} color="pink" />
                                        <SummaryCard label="Body" content={selectedArea?.label || bodySensations} color="teal" />
                                    </div>
                                </motion.div>

                                <GentleTextarea
                                    label="Anything else to release?"
                                    hint="A dream, an intention, something unfinished, a gratitude — this space is completely yours."
                                    placeholder="Write freely..."
                                    value={openReflection}
                                    onChange={setOpenReflection}
                                />

                                <div className="flex justify-between pt-4 mt-8">
                                    <NavButton onClick={() => setStep(2)} variant="back">← Back</NavButton>
                                    <NavButton onClick={handleSave} variant="save">Save Entry ✦</NavButton>
                                </div>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
