import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── BODY AREA DATA ──────────────────────────────────────────────────────────

const BODY_AREAS = [
    {
        id: "headaches", label: "Headaches", icon: "🧠",
        bodyFeels: "Tension, pressure, or pain in your head",
        patterns: ["Being too hard on yourself", "Constant self-criticism", "Trying to be perfect", "Never feeling good enough"],
        example: 'You criticize yourself throughout the day — "I should have done better." Your head gets tight from that mental pressure.',
        helps: 'Be kinder to yourself. When you notice self-criticism, pause and say: "I\'m doing my best."',
    },
    {
        id: "neck-shoulders", label: "Neck & Shoulders", icon: "💆",
        bodyFeels: "Tight, stiff, or aching neck and shoulders",
        patterns: ["Carrying too much responsibility", "Feeling burdened by life", "Stubborn thinking", "Refusing other viewpoints"],
        example: "Everything feels on your shoulders — work, family, finances. Your shoulders literally carry this weight.",
        helps: 'Ask for help. Let some things go. Practice saying: "This isn\'t all my responsibility."',
    },
    {
        id: "back-pain", label: "Back Pain", icon: "🦴",
        bodyFeels: "Pain or tension anywhere along the spine",
        patterns: ["Feeling unsupported emotionally", "Guilt about the past", "Money worries", "Fear about the future"],
        example: 'Constant worry about finances — "How will I pay rent?" Your lower back holds this fear.',
        helps: 'Address what you can practically, then ask: "Am I okay right now, in this moment?"',
    },
    {
        id: "stomach", label: "Stomach Problems", icon: "😰",
        bodyFeels: "Upset stomach, nausea, butterflies, digestive issues",
        patterns: ["Fear of new things", "Anxiety about what's coming", "Can't accept what's happening", "Gut-level dread"],
        example: "A big event tomorrow — your stomach churns all night. Your body is reacting to fearful thoughts.",
        helps: 'Take 5 slow breaths and remind yourself: "I can handle this one step at a time."',
    },
    {
        id: "throat", label: "Throat Tightness", icon: "🗣️",
        bodyFeels: "Tightness, soreness, or feeling like you can't speak",
        patterns: ["Not speaking your truth", "Holding back words", "Fear of speaking up", "Swallowing your words"],
        example: "Someone treats you unfairly. You hold it in. Your throat tightens from all those unspoken words.",
        helps: 'Find safe ways to express yourself — journal, talk to a friend. Even saying "I have something to say" helps.',
    },
    {
        id: "chest-heart", label: "Chest / Heart Area", icon: "💗",
        bodyFeels: "Pressure, heaviness, or aching in your chest",
        patterns: ["Lack of joy in life", "Feeling heartbroken", "Long-term stress", "Feeling unloved"],
        example: "Feeling lonely or unloved — your heart area literally aches. Your body feels the emotional pain.",
        helps: 'Place your hand on your heart and breathe. Remind yourself: "I matter. I\'m worthy of love."',
    },
    {
        id: "breathing", label: "Breathing Difficulty", icon: "🌬️",
        bodyFeels: "Can't take a full breath, tight chest, shallow breathing",
        patterns: ["Fear of fully living", "Feeling smothered or controlled", "Not feeling safe", "Suppressed emotions"],
        example: "Even as an adult, you can't take full, deep breaths — like you're still holding yourself back.",
        helps: "Give yourself permission to take up space, to be yourself, to breathe freely.",
    },
    {
        id: "fatigue", label: "Fatigue / Low Energy", icon: "🔋",
        bodyFeels: "Exhausted, drained, no motivation",
        patterns: ["Resistance to your life", '"What\'s the use?" attitude', "Not loving yourself", "Giving up"],
        example: "You wake up tired because emotionally you're exhausted from fighting against your life.",
        helps: "Small steps. Find one thing that brings a tiny bit of joy. Rest when needed, but also move a little.",
    },
    {
        id: "sleep", label: "Sleep Problems", icon: "🌙",
        bodyFeels: "Can't fall asleep, waking up at night, restless sleep",
        patterns: ["Mind won't stop worrying", "Fear of letting go of control", "Anxiety about tomorrow", "Not feeling safe to rest"],
        example: 'You lie in bed and your mind races: "What if… I should have… Tomorrow I need to…"',
        helps: 'Write down your worries before bed. Tell yourself: "I\'m safe right now. I can rest."',
    },
    {
        id: "skin", label: "Skin Problems", icon: "✋",
        bodyFeels: "Breakouts, itchiness, inflammation, rashes",
        patterns: ["Anxiety and worry", "Not accepting yourself", "Feeling threatened", "Old issues surfacing"],
        example: "You criticize how you look constantly. Your skin — your outer layer — shows this internal rejection.",
        helps: "Look in the mirror and find one thing to appreciate. Treat your skin (and yourself) with kindness.",
    },
    {
        id: "knees", label: "Knee Problems", icon: "🦵",
        bodyFeels: "Pain, stiffness, difficulty bending",
        patterns: ["Stubborn thinking", "Pride and ego", "Refusing to be flexible", "Fear of moving forward"],
        example: "You refuse to compromise or see another viewpoint. Your knees — which need to bend to move — get stiff.",
        helps: 'Practice flexibility. Ask yourself: "What if there\'s another way to see this?"',
    },
    {
        id: "illness", label: "Getting Sick Often", icon: "🤧",
        bodyFeels: "Always catching colds, low immunity, feeling run down",
        patterns: ["Too much going on mentally", "Needing a break but not taking one", "Wanting to escape", "Burnout"],
        example: 'You\'re overwhelmed but keep pushing. Your body forces you to rest by getting sick.',
        helps: "Rest BEFORE you get sick. Listen to early signals — tiredness, feeling run down — and take breaks.",
    },
    {
        id: "pressure", label: "Feeling Pressured Inside", icon: "🫀",
        bodyFeels: "Constant internal pressure, tension that won't release",
        patterns: ["Long-term unresolved emotions", "Chronic stress", "Unexpressed anger", "Always being 'on'"],
        example: "Stressed at work for years, never dealing with it, just pushing through. Your system never turns off.",
        helps: "If you can't change the situation, change how you respond to it. Find ways to release tension daily.",
    },
    {
        id: "weight", label: "Weight Concerns", icon: "⚖️",
        bodyFeels: "Weight changes that feel connected to your emotions",
        patterns: ["Using food for comfort", "Feeling unsafe", "Running from emotions", "Fear and insecurity"],
        example: "When stressed, you eat to feel better. It's not about the food — it's about what you're feeding emotionally.",
        helps: 'When reaching for food, ask: "Am I physically hungry, or am I feeding a feeling?"',
    },
    {
        id: "digestive", label: "Digestive Issues", icon: "🫁",
        bodyFeels: "Constipation, IBS, or digestive irregularity",
        patterns: ["Holding onto old beliefs", "Refusing to let go of the past", "Long-term anxiety", "Fear of releasing control"],
        example: "You can't let go of a past hurt, replaying it. Your body mirrors this by literally not letting go.",
        helps: "Practice forgiveness — not for them, but to free yourself. Journal about what you're ready to release.",
    },
];

// ─── ANIMATIONS ──────────────────────────────────────────────────────────────

const fadeUp: any = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 1, 0.5, 1] } },
    exit: { opacity: 0, y: -8, transition: { duration: 0.3 } },
};

const stagger: any = {
    visible: { transition: { staggerChildren: 0.04 } },
};

const cardPop: any = {
    hidden: { opacity: 0, y: 8, scale: 0.97 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.25, 1, 0.5, 1] } },
};

// ─── STEP TRACKER ────────────────────────────────────────────────────────────

const STEPS = [
    { num: 1, label: "Thoughts" },
    { num: 2, label: "Body" },
    { num: 3, label: "Feelings" },
    { num: 4, label: "Anything Else" },
];

function StepTracker({ current }: { current: number }) {
    return (
        <div className="flex items-center justify-center gap-1 py-3">
            {STEPS.map((step, i) => {
                const isActive = i === current;
                const isDone = i < current;
                return (
                    <div key={step.num} className="flex items-center gap-1">
                        <div className="flex flex-col items-center" style={{ minWidth: 56 }}>
                            <div
                                className="flex items-center justify-center rounded-full transition-all duration-500"
                                style={{
                                    width: 32,
                                    height: 32,
                                    background: isActive
                                        ? "rgba(209,107,165,0.25)"
                                        : isDone
                                            ? "rgba(171,206,201,0.2)"
                                            : "rgba(255,255,255,0.05)",
                                    border: isActive
                                        ? "2px solid rgba(209,107,165,0.6)"
                                        : isDone
                                            ? "2px solid rgba(171,206,201,0.4)"
                                            : "2px solid rgba(255,255,255,0.1)",
                                }}
                            >
                                {isDone ? (
                                    <span style={{ color: "rgba(171,206,201,0.8)", fontSize: 14 }}>✓</span>
                                ) : (
                                    <span
                                        style={{
                                            color: isActive ? "rgba(209,107,165,0.9)" : "rgba(255,255,255,0.25)",
                                            fontSize: 13,
                                            fontWeight: 600,
                                        }}
                                    >
                                        {step.num}
                                    </span>
                                )}
                            </div>
                            <span
                                className="mt-1 transition-colors duration-500"
                                style={{
                                    fontSize: 10,
                                    fontWeight: 600,
                                    letterSpacing: "0.06em",
                                    color: isActive
                                        ? "rgba(209,107,165,0.8)"
                                        : isDone
                                            ? "rgba(171,206,201,0.5)"
                                            : "rgba(255,255,255,0.2)",
                                }}
                            >
                                {step.label}
                            </span>
                        </div>
                        {i < STEPS.length - 1 && (
                            <div
                                className="transition-colors duration-500"
                                style={{
                                    width: 24,
                                    height: 2,
                                    borderRadius: 1,
                                    marginBottom: 14,
                                    background: isDone ? "rgba(171,206,201,0.3)" : "rgba(255,255,255,0.06)",
                                }}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ─── LARGE TEXTAREA ──────────────────────────────────────────────────────────

function GentleTextarea({ label, placeholder, value, onChange, hint }: { label: string, placeholder: string, value: string, onChange: (v: string) => void, hint?: string }) {
    const ref = useRef<HTMLTextAreaElement>(null);

    // Auto-resize
    useEffect(() => {
        if (ref.current) {
            ref.current.style.height = "auto";
            ref.current.style.height = Math.max(120, ref.current.scrollHeight) + "px";
        }
    }, [value]);

    return (
        <motion.div variants={fadeUp} className="space-y-3">
            <label
                style={{
                    display: "block",
                    fontSize: 18,
                    fontWeight: 400,
                    color: "rgba(255,255,255,0.75)",
                    fontFamily: "'Georgia', serif",
                    lineHeight: 1.4,
                }}
            >
                {label}
            </label>
            {hint && (
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.3)", fontStyle: "italic", lineHeight: 1.5 }}>
                    {hint}
                </p>
            )}
            <textarea
                ref={ref}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                rows={4}
                style={{
                    width: "100%",
                    minHeight: 120,
                    padding: "20px 24px",
                    fontSize: 17,
                    lineHeight: 1.7,
                    fontFamily: "'Georgia', serif",
                    color: "rgba(255,255,255,0.85)",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 20,
                    outline: "none",
                    resize: "none",
                    transition: "border-color 0.3s, background 0.3s",
                }}
                onFocus={(e) => {
                    e.target.style.borderColor = "rgba(209,107,165,0.4)";
                    e.target.style.background = "rgba(255,255,255,0.06)";
                }}
                onBlur={(e) => {
                    e.target.style.borderColor = "rgba(255,255,255,0.08)";
                    e.target.style.background = "rgba(255,255,255,0.04)";
                }}
            />
        </motion.div>
    );
}

// ─── BODY AREA CARD (large, tappable, clear) ────────────────────────────────

function BodyAreaCard({ area, isSelected, onClick }: { area: any, isSelected: boolean, onClick: () => void }) {
    return (
        <motion.button
            variants={cardPop}
            onClick={onClick}
            whileTap={{ scale: 0.97 }}
            className="w-full text-left"
            style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "18px 22px",
                borderRadius: 18,
                border: isSelected
                    ? "2px solid rgba(209,107,165,0.5)"
                    : "1.5px solid rgba(255,255,255,0.07)",
                background: isSelected
                    ? "rgba(209,107,165,0.1)"
                    : "rgba(255,255,255,0.03)",
                cursor: "pointer",
                transition: "all 0.3s ease",
                minHeight: 64,
            }}
        >
            <span style={{ fontSize: 28, lineHeight: 1, flexShrink: 0 }}>{area.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
                <span
                    style={{
                        fontSize: 16,
                        fontWeight: 600,
                        color: isSelected ? "rgba(209,107,165,0.95)" : "rgba(255,255,255,0.7)",
                        display: "block",
                    }}
                >
                    {area.label}
                </span>
                <span
                    style={{
                        fontSize: 13,
                        color: isSelected ? "rgba(209,107,165,0.55)" : "rgba(255,255,255,0.3)",
                        display: "block",
                        marginTop: 2,
                    }}
                >
                    {area.bodyFeels}
                </span>
            </div>
            {isSelected && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        background: "rgba(209,107,165,0.3)",
                        border: "2px solid rgba(209,107,165,0.6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                    }}
                >
                    <span style={{ color: "rgba(209,107,165,1)", fontSize: 14 }}>✓</span>
                </motion.div>
            )}
        </motion.button>
    );
}

// ─── PATTERN SELECTOR (large pill buttons) ───────────────────────────────────

function PatternSelector({ patterns, selected, onToggle }: { patterns: string[], selected: string[], onToggle: (p: string) => void }) {
    return (
        <motion.div variants={fadeUp} className="space-y-4">
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.6)", fontFamily: "'Georgia', serif" }}>
                Do any of these feel true for you?
            </p>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.25)", fontStyle: "italic" }}>
                Tap all that resonate — there are no wrong answers
            </p>
            <div className="flex flex-col gap-3">
                {patterns.map((p) => {
                    const isOn = selected.includes(p);
                    return (
                        <motion.button
                            key={p}
                            variants={cardPop}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => onToggle(p)}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 14,
                                padding: "16px 20px",
                                borderRadius: 16,
                                border: isOn
                                    ? "2px solid rgba(171,206,201,0.5)"
                                    : "1.5px solid rgba(255,255,255,0.07)",
                                background: isOn
                                    ? "rgba(171,206,201,0.08)"
                                    : "rgba(255,255,255,0.03)",
                                cursor: "pointer",
                                textAlign: "left",
                                width: "100%",
                                minHeight: 56,
                                transition: "all 0.3s ease",
                            }}
                        >
                            <div
                                style={{
                                    width: 24,
                                    height: 24,
                                    borderRadius: 8,
                                    border: isOn
                                        ? "2px solid rgba(171,206,201,0.6)"
                                        : "2px solid rgba(255,255,255,0.12)",
                                    background: isOn ? "rgba(171,206,201,0.2)" : "transparent",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                    transition: "all 0.3s ease",
                                }}
                            >
                                {isOn && <span style={{ color: "rgba(171,206,201,1)", fontSize: 13 }}>✓</span>}
                            </div>
                            <span
                                style={{
                                    fontSize: 15,
                                    color: isOn ? "rgba(171,206,201,0.9)" : "rgba(255,255,255,0.5)",
                                    lineHeight: 1.4,
                                }}
                            >
                                {p}
                            </span>
                        </motion.button>
                    );
                })}
            </div>
        </motion.div>
    );
}

// ─── INSIGHT CARD (the "What helps" reveal) ──────────────────────────────────

function InsightCard({ area }: { area: any }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
            className="space-y-6"
        >
            {/* Example */}
            <div
                style={{
                    padding: "20px 24px",
                    borderRadius: 20,
                    background: "rgba(255,255,255,0.03)",
                    borderLeft: "3px solid rgba(209,107,165,0.3)",
                }}
            >
                <p style={{ fontSize: 12, color: "rgba(209,107,165,0.5)", fontWeight: 600, letterSpacing: "0.08em", marginBottom: 8, textTransform: "uppercase" }}>
                    This might sound familiar
                </p>
                <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", fontFamily: "'Georgia', serif", fontStyle: "italic", lineHeight: 1.7 }}>
                    "{area.example}"
                </p>
            </div>

            {/* What helps */}
            <div
                style={{
                    padding: "24px",
                    borderRadius: 20,
                    background: "rgba(171,206,201,0.05)",
                    border: "1px solid rgba(171,206,201,0.12)",
                }}
            >
                <div className="flex items-center gap-3 mb-3">
                    <span style={{ fontSize: 18 }}>💚</span>
                    <p style={{ fontSize: 14, color: "rgba(171,206,201,0.6)", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                        A gentle suggestion
                    </p>
                </div>
                <p style={{ fontSize: 16, color: "rgba(171,206,201,0.75)", fontFamily: "'Georgia', serif", lineHeight: 1.7 }}>
                    {area.helps}
                </p>
            </div>
        </motion.div>
    );
}

// ─── SUMMARY CARD ────────────────────────────────────────────────────────────

function SummaryCard({ label, content, color = "white" }: { label: string, content: string, color?: "white" | "pink" | "teal" }) {
    if (!content) return null;
    const accentMap = {
        white: { bg: "rgba(255,255,255,0.03)", border: "rgba(255,255,255,0.06)", text: "rgba(255,255,255,0.5)", label: "rgba(255,255,255,0.25)" },
        pink: { bg: "rgba(209,107,165,0.05)", border: "rgba(209,107,165,0.12)", text: "rgba(209,107,165,0.65)", label: "rgba(209,107,165,0.4)" },
        teal: { bg: "rgba(171,206,201,0.05)", border: "rgba(171,206,201,0.12)", text: "rgba(171,206,201,0.65)", label: "rgba(171,206,201,0.4)" },
    };
    const c = accentMap[color] || accentMap.white;

    return (
        <div style={{ padding: "16px 20px", borderRadius: 16, background: c.bg, border: `1px solid ${c.border}` }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: c.label, marginBottom: 6 }}>
                {label}
            </p>
            <p style={{ fontSize: 14, color: c.text, lineHeight: 1.6, fontFamily: "'Georgia', serif" }}>
                {content}
            </p>
        </div>
    );
}

// ─── BIG NAVIGATION BUTTONS ──────────────────────────────────────────────────

function NavButton({ children, onClick, variant = "next", disabled = false }: { children: React.ReactNode, onClick: () => void, variant?: "next" | "back" | "save", disabled?: boolean }) {
    const styles = {
        next: {
            bg: "rgba(209,107,165,0.15)",
            border: "rgba(209,107,165,0.35)",
            color: "rgba(209,107,165,0.9)",
            hoverBg: "rgba(209,107,165,0.25)",
        },
        back: {
            bg: "rgba(255,255,255,0.04)",
            border: "rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.5)",
            hoverBg: "rgba(255,255,255,0.07)",
        },
        save: {
            bg: "rgba(171,206,201,0.15)",
            border: "rgba(171,206,201,0.35)",
            color: "rgba(171,206,201,0.9)",
            hoverBg: "rgba(171,206,201,0.25)",
        },
    };
    const s = styles[variant];

    return (
        <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onClick}
            disabled={disabled}
            style={{
                padding: "18px 36px",
                borderRadius: 16,
                fontSize: 16,
                fontWeight: 600,
                letterSpacing: "0.04em",
                background: disabled ? "rgba(255,255,255,0.03)" : s.bg,
                border: `1.5px solid ${disabled ? "rgba(255,255,255,0.05)" : s.border}`,
                color: disabled ? "rgba(255,255,255,0.15)" : s.color,
                cursor: disabled ? "not-allowed" : "pointer",
                transition: "all 0.3s ease",
                minHeight: 58,
                minWidth: 120,
            }}
            onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.background = s.hoverBg; }}
            onMouseLeave={(e) => { if (!disabled) e.currentTarget.style.background = s.bg; }}
        >
            {children}
        </motion.button>
    );
}

// ─── MAIN GUIDED JOURNAL ─────────────────────────────────────────────────────

export function GentleJournalForm({ onSave, onCancel, initialData }: { onSave: (data: any) => void, onCancel: () => void, initialData?: any }) {
    const [step, setStep] = useState(0);
    const [thoughts, setThoughts] = useState(initialData?.thoughts || "");
    const [bodySensations, setBodySensations] = useState(initialData?.bodySensations || "");
    // Try to match initialData bodyArea to BODY_AREAS
    const initialAreaObj = BODY_AREAS.find(a => a.label === initialData?.bodyArea) || null;
    const [selectedArea, setSelectedArea] = useState<any | null>(initialAreaObj);
    const [selectedPatterns, setSelectedPatterns] = useState<string[]>(initialData?.emotions ? initialData.emotions.split(', ') : []);
    const [emotions, setEmotions] = useState(initialData?.emotions || ""); // If they override manually
    const [openReflection, setOpenReflection] = useState(initialData?.reflections || "");
    const scrollRef = useRef<HTMLDivElement>(null);

    // Scroll to top on step change
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
        }
    }, [step]);

    const handleSelectArea = (area: any) => {
        if (selectedArea?.id === area.id) {
            setSelectedArea(null);
            setSelectedPatterns([]);
        } else {
            setSelectedArea(area);
            setSelectedPatterns([]);
        }
    };

    const handleTogglePattern = (pattern: string) => {
        setSelectedPatterns((prev) =>
            prev.includes(pattern) ? prev.filter((p) => p !== pattern) : [...prev, pattern]
        );
    };

    const handleSave = () => {
        const entry = {
            thoughts,
            bodySensations: bodySensations || selectedArea?.bodyFeels || "",
            bodyArea: selectedArea?.label || "",
            emotions: selectedPatterns.length > 0 ? selectedPatterns.join(', ') : emotions,
            reflections: openReflection,
            guidance: selectedArea?.helps || "",
        };
        onSave(entry);
        setStep(5); // confirmation
    };

    const hasAnything = thoughts || bodySensations || selectedArea || emotions || openReflection || selectedPatterns.length > 0;

    return (
        <div
            ref={scrollRef}
            className="w-full h-full"
            style={{
                fontFamily: "'Georgia', 'Times New Roman', serif",
            }}
        >
            <div className="relative z-10 w-full max-w-xl mx-auto pb-32">
                {/* Step tracker */}
                {step < 5 && <StepTracker current={step} />}

                <div style={{ marginTop: 24 }}>
                    <AnimatePresence mode="wait">

                        {/* ════════════════════════════════════════════════════════════
               STEP 0: THOUGHTS
            ════════════════════════════════════════════════════════════ */}
                        {step === 0 && (
                            <motion.div
                                key="step0"
                                variants={fadeUp}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="space-y-8"
                            >
                                <GentleTextarea
                                    label="What's on your mind right now?"
                                    hint="There are no wrong answers. Whatever is there — worries, plans, random thoughts — just let it flow."
                                    placeholder="Write freely here..."
                                    value={thoughts}
                                    onChange={setThoughts}
                                />

                                <div className="flex justify-between pt-4">
                                    <NavButton onClick={onCancel} variant="back">
                                        Cancel
                                    </NavButton>
                                    <NavButton onClick={() => setStep(1)} variant="next">
                                        Next →
                                    </NavButton>
                                </div>
                            </motion.div>
                        )}

                        {/* ════════════════════════════════════════════════════════════
               STEP 1: BODY AWARENESS
            ════════════════════════════════════════════════════════════ */}
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                variants={fadeUp}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="space-y-8"
                            >
                                <GentleTextarea
                                    label="What do you notice in your body?"
                                    hint="Close your eyes for a moment. Notice any tension, warmth, tightness, heaviness, or lightness."
                                    placeholder="For example: tightness in my shoulders, heaviness in my chest..."
                                    value={bodySensations}
                                    onChange={setBodySensations}
                                />

                                {/* Body area selector */}
                                <motion.div variants={fadeUp} className="space-y-4">
                                    <div
                                        style={{
                                            padding: "16px 20px",
                                            borderRadius: 16,
                                            background: "rgba(209,107,165,0.04)",
                                            border: "1px solid rgba(209,107,165,0.08)",
                                        }}
                                    >
                                        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.65)", fontFamily: "'Georgia', serif", marginBottom: 4 }}>
                                            Is your body trying to tell you something?
                                        </p>
                                        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", fontStyle: "italic" }}>
                                            Optional — if something below sounds familiar, tap it
                                        </p>
                                    </div>

                                    <motion.div variants={stagger} initial="hidden" animate="visible" className="flex flex-col gap-3">
                                        {BODY_AREAS.map((area) => (
                                            <BodyAreaCard
                                                key={area.id}
                                                area={area}
                                                isSelected={selectedArea?.id === area.id}
                                                onClick={() => handleSelectArea(area)}
                                            />
                                        ))}
                                    </motion.div>
                                </motion.div>

                                {/* Expanded: patterns + insight */}
                                <AnimatePresence>
                                    {selectedArea && (
                                        <motion.div
                                            key="expanded"
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
                                            className="space-y-8 overflow-hidden"
                                        >
                                            <div
                                                style={{
                                                    height: 1,
                                                    background: "linear-gradient(90deg, transparent, rgba(209,107,165,0.2), transparent)",
                                                    margin: "8px 0",
                                                }}
                                            />

                                            <PatternSelector
                                                patterns={selectedArea.patterns}
                                                selected={selectedPatterns}
                                                onToggle={handleTogglePattern}
                                            />

                                            {selectedPatterns.length > 0 && (
                                                <InsightCard area={selectedArea} />
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="flex justify-between pt-4">
                                    <NavButton onClick={() => setStep(0)} variant="back">
                                        ← Back
                                    </NavButton>
                                    <NavButton onClick={() => setStep(2)} variant="next">
                                        Next →
                                    </NavButton>
                                </div>
                            </motion.div>
                        )}

                        {/* ════════════════════════════════════════════════════════════
               STEP 2: FEELINGS / WITNESS
            ════════════════════════════════════════════════════════════ */}
                        {step === 2 && (
                            <motion.div
                                key="step2"
                                variants={fadeUp}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="space-y-8"
                            >
                                <motion.div variants={fadeUp}>
                                    <p style={{ fontSize: 18, color: "rgba(255,255,255,0.6)", fontFamily: "'Georgia', serif", fontStyle: "italic", lineHeight: 1.6, marginBottom: 8 }}>
                                        Now, step back and simply notice…
                                    </p>
                                    <p style={{ fontSize: 14, color: "rgba(255,255,255,0.3)", lineHeight: 1.6 }}>
                                        Without judging or trying to change anything — what emotions are flowing through you right now?
                                    </p>
                                </motion.div>

                                {/* Show selected patterns as context */}
                                {selectedPatterns.length > 0 && (
                                    <motion.div variants={fadeUp}>
                                        <p style={{ fontSize: 12, color: "rgba(209,107,165,0.4)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>
                                            Patterns you noticed earlier
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedPatterns.map((p) => (
                                                <span
                                                    key={p}
                                                    style={{
                                                        padding: "8px 14px",
                                                        borderRadius: 12,
                                                        fontSize: 13,
                                                        background: "rgba(209,107,165,0.08)",
                                                        border: "1px solid rgba(209,107,165,0.15)",
                                                        color: "rgba(209,107,165,0.6)",
                                                    }}
                                                >
                                                    {p}
                                                </span>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                <GentleTextarea
                                    label="What emotions do you feel?"
                                    hint="Name them simply — sadness, relief, anxiety, gratitude, loneliness, hope…"
                                    placeholder="I feel..."
                                    value={emotions}
                                    onChange={setEmotions}
                                />

                                <div className="flex justify-between pt-4">
                                    <NavButton onClick={() => setStep(1)} variant="back">
                                        ← Back
                                    </NavButton>
                                    <NavButton onClick={() => setStep(3)} variant="next">
                                        Next →
                                    </NavButton>
                                </div>
                            </motion.div>
                        )}

                        {/* ════════════════════════════════════════════════════════════
               STEP 3: OPEN REFLECTION
            ════════════════════════════════════════════════════════════ */}
                        {step === 3 && (
                            <motion.div
                                key="step3"
                                variants={fadeUp}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="space-y-8"
                            >
                                <GentleTextarea
                                    label="Is there anything else you'd like to share?"
                                    hint="A dream, an intention, something unfinished, a gratitude — this space is completely yours."
                                    placeholder="Anything at all..."
                                    value={openReflection}
                                    onChange={setOpenReflection}
                                />

                                {/* Gentle reminder */}
                                {selectedArea && (
                                    <motion.div
                                        variants={fadeUp}
                                        style={{
                                            padding: "22px 24px",
                                            borderRadius: 20,
                                            background: "rgba(171,206,201,0.04)",
                                            border: "1px solid rgba(171,206,201,0.1)",
                                        }}
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <span style={{ fontSize: 16 }}>💚</span>
                                            <p style={{ fontSize: 13, color: "rgba(171,206,201,0.5)", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                                                Remember
                                            </p>
                                        </div>
                                        <p style={{ fontSize: 15, color: "rgba(171,206,201,0.65)", fontFamily: "'Georgia', serif", lineHeight: 1.7 }}>
                                            {selectedArea.helps}
                                        </p>
                                    </motion.div>
                                )}

                                {/* Summary of your reflection */}
                                <motion.div variants={fadeUp} className="space-y-4">
                                    <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)" }}>
                                        Your reflection today
                                    </p>
                                    <div className="flex flex-col gap-3">
                                        <SummaryCard label="Thoughts" content={thoughts} />
                                        <SummaryCard label="Body" content={bodySensations || selectedArea?.label} color="pink" />
                                        <SummaryCard label="Emotions" content={emotions || selectedPatterns.join(", ")} color="teal" />
                                        {openReflection && <SummaryCard label="Open Reflection" content={openReflection} />}
                                    </div>
                                </motion.div>

                                <div className="flex justify-between pt-4">
                                    <NavButton onClick={() => setStep(2)} variant="back">
                                        ← Back
                                    </NavButton>
                                    <NavButton onClick={handleSave} variant="save" disabled={!hasAnything}>
                                        Save Entry ✦
                                    </NavButton>
                                </div>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
