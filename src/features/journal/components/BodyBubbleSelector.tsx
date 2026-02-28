import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── BODY AWARENESS DATA ─────────────────────────────────────────────────────

const BODY_AREAS = [
    {
        id: "headaches", label: "Headaches", icon: "🧠", size: 88,
        bodyFeels: "Tension, pressure, or pain in your head",
        emotionalPatterns: ["Being too hard on yourself", "Constant self-criticism", "Trying to be perfect", "Never feeling good enough"],
        example: 'You criticize yourself all day — "I should have done better." Your head literally gets tight from the mental pressure.',
        whatHelps: 'Be kinder to yourself. When you notice self-criticism, pause and say: "I\'m doing my best."',
    },
    {
        id: "neck-shoulders", label: "Neck & Shoulders", icon: "💆", size: 96,
        bodyFeels: "Tight, stiff, or aching neck and shoulders",
        emotionalPatterns: ["Carrying too much responsibility", "Feeling burdened", "Stubborn thinking", "Refusing other viewpoints"],
        example: "Everything feels on your shoulders — work, family, finances. Your shoulders literally carry this weight.",
        whatHelps: 'Ask for help. Let some things go. Practice saying: "This isn\'t all my responsibility."',
    },
    {
        id: "back-pain", label: "Back Pain", icon: "🔙", size: 82,
        bodyFeels: "Pain or tension anywhere along the spine",
        emotionalPatterns: ["Feeling unsupported emotionally", "Guilt about the past", "Money worries", "Fear about the future"],
        example: 'Constant worry about finances — "How will I pay rent?" Your lower back holds this fear.',
        whatHelps: 'Address what you can practically, then ask: "Am I okay in this moment?"',
    },
    {
        id: "stomach", label: "Stomach", icon: "😰", size: 86,
        bodyFeels: "Upset stomach, nausea, butterflies, digestive issues",
        emotionalPatterns: ["Fear of new things", "Anxiety about what's coming", "Can't accept what's happening", "Gut-level dread"],
        example: "A big event tomorrow — your stomach churns all night. Your body reacts to fearful thoughts.",
        whatHelps: 'Take 5 slow breaths and remind yourself: "I can handle this one step at a time."',
    },
    {
        id: "throat", label: "Throat", icon: "🗣️", size: 78,
        bodyFeels: "Tightness, soreness, feeling like you can't speak",
        emotionalPatterns: ["Not speaking your truth", "Holding back words", "Fear of speaking up", "Swallowing your words"],
        example: "Someone treats you unfairly. You hold it in. Your throat tightens from unspoken words.",
        whatHelps: 'Find safe ways to express yourself — journal, talk to a friend. Even acknowledging "I have something to say" helps.',
    },
    {
        id: "chest-heart", label: "Heart Area", icon: "💗", size: 94,
        bodyFeels: "Pressure, heaviness, or aching in your chest",
        emotionalPatterns: ["Lack of joy", "Feeling heartbroken", "Long-term stress", "Feeling unloved"],
        example: "Feeling lonely or unloved — your heart area literally aches. Your body feels the emotional pain.",
        whatHelps: 'Place your hand on your heart and breathe. Remind yourself: "I matter. I\'m worthy of love."',
    },
    {
        id: "breathing", label: "Breathing", icon: "🌬️", size: 80,
        bodyFeels: "Can't take a full breath, tight chest, shallow breathing",
        emotionalPatterns: ["Fear of fully living", "Feeling smothered", "Not feeling safe", "Suppressed emotions"],
        example: "Even as an adult, you can't take full, deep breaths — like you're still holding yourself back.",
        whatHelps: "Give yourself permission to take up space, to be yourself, to breathe freely.",
    },
    {
        id: "fatigue", label: "Fatigue", icon: "🔋", size: 84,
        bodyFeels: "Exhausted, drained, no motivation",
        emotionalPatterns: ["Resistance to your life", '"What\'s the use?" attitude', "Not loving yourself", "Giving up"],
        example: "You wake up tired because emotionally you're exhausted from fighting against your life.",
        whatHelps: "Small steps. Find one thing that brings a tiny bit of joy. Rest when needed, but also move a little.",
    },
    {
        id: "sleep", label: "Sleep", icon: "🌙", size: 76,
        bodyFeels: "Can't fall asleep, waking up at night, restless",
        emotionalPatterns: ["Mind won't stop worrying", "Fear of letting go", "Anxiety about tomorrow", "Not feeling safe to rest"],
        example: 'You lie in bed and your mind races: "What if… I should have… Tomorrow I need to…"',
        whatHelps: 'Write down worries before bed. Tell yourself: "I\'m safe right now. I can rest."',
    },
    {
        id: "skin", label: "Skin", icon: "✋", size: 72,
        bodyFeels: "Breakouts, itchiness, inflammation, rashes",
        emotionalPatterns: ["Anxiety and worry", "Not accepting yourself", "Feeling threatened", "Old issues surfacing"],
        example: "You criticize how you look. Your skin — your outer layer — shows this internal rejection.",
        whatHelps: "Look in the mirror and find one thing to appreciate. Treat yourself with kindness.",
    },
    {
        id: "knees", label: "Knees", icon: "🦵", size: 74,
        bodyFeels: "Pain, stiffness, hard to bend",
        emotionalPatterns: ["Stubborn thinking", "Pride and ego", "Refusing to be flexible", "Fear of moving forward"],
        example: "You refuse to compromise. Your knees — which need to bend to move forward — get stiff.",
        whatHelps: 'Practice flexibility. Ask: "What if there\'s another way to see this?"',
    },
    {
        id: "illness", label: "Getting Sick", icon: "🤧", size: 78,
        bodyFeels: "Always getting sick, low immunity, run down",
        emotionalPatterns: ["Mental overload", "Needing a break", '"I need to escape" feelings', "Burnout"],
        example: 'You keep pushing. Your body forces rest by getting sick — it says: "Stop. Rest now."',
        whatHelps: "Rest BEFORE you get sick. Listen to early signals and actually take breaks.",
    },
    {
        id: "pressure", label: "Inner Pressure", icon: "🫀", size: 80,
        bodyFeels: "Feeling internal pressure that doesn't release",
        emotionalPatterns: ["Unresolved emotions", "Chronic tension", "Unexpressed anger", "Constant inner pressure"],
        example: "Stressed for years, never dealing with it, just pushing through. Your system is always 'on.'",
        whatHelps: "If you can't change the situation, change how you respond. Release tension daily.",
    },
    {
        id: "weight", label: "Weight", icon: "⚖️", size: 76,
        bodyFeels: "Weight changes connected to emotions",
        emotionalPatterns: ["Using food for comfort", "Feeling unsafe", "Running from emotions", "Fear and insecurity"],
        example: "When stressed, you eat to feel better. It's not about the food — it's about the feeling.",
        whatHelps: 'Ask: "Am I physically hungry, or feeding a feeling?" Learn other ways to comfort yourself.',
    },
    {
        id: "digestive", label: "Digestion", icon: "🫁", size: 82,
        bodyFeels: "Constipation, IBS, or digestive irregularity",
        emotionalPatterns: ["Holding onto old beliefs", "Refusing to let go", "Long-term anxiety", "Fear of releasing control"],
        example: "You can't let go of a past hurt, replaying it. Your body mirrors this by literally not letting go.",
        whatHelps: "Practice forgiveness — not for them, but to free yourself. Journal about what you're ready to release.",
    },
];

// ─── FLOATING POSITIONS (organic scatter) ────────────────────────────────────

function generateBubblePositions(count: number) {
    // Create organic-feeling positions in a roughly circular scatter
    const positions: { x: number; y: number }[] = [];
    const cx = 50, cy = 50;
    const rings = [
        { r: 0, count: 1 },
        { r: 18, count: 5 },
        { r: 34, count: 9 },
    ];

    let idx = 0;
    for (const ring of rings) {
        for (let i = 0; i < ring.count && idx < count; i++) {
            const angle = (i / ring.count) * Math.PI * 2 + (ring.r * 0.1); // slight offset per ring
            const jitterX = (Math.random() - 0.5) * 6;
            const jitterY = (Math.random() - 0.5) * 6;
            positions.push({
                x: cx + Math.cos(angle) * ring.r + jitterX,
                y: cy + Math.sin(angle) * ring.r + jitterY,
            });
            idx++;
        }
    }
    return positions;
}

// ─── FLOATING BUBBLE COMPONENT ───────────────────────────────────────────────

function FloatingBubble({ area, position, index, isSelected, isOtherSelected, onClick, containerSize }: any) {
    const baseSize = area.size * (containerSize / 800);
    const displaySize = isSelected ? baseSize * 1.3 : isOtherSelected ? baseSize * 0.6 : baseSize;

    // Organic floating animation offsets
    const floatDuration = 4 + (index % 5) * 0.8;
    const floatDelay = index * 0.15;

    return (
        <motion.button
            onClick={onClick}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
                opacity: isOtherSelected ? 0.25 : 1,
                scale: 1,
                x: `${position.x}%`,
                y: `${position.y}%`,
                width: displaySize,
                height: displaySize,
            }}
            exit={{ opacity: 0, scale: 0, transition: { duration: 0.3 } }}
            transition={{
                opacity: { duration: 0.5 },
                scale: { duration: 0.8, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] },
                x: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
                y: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
                width: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
                height: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
            }}
            whileHover={{ scale: 1.12, zIndex: 10 }}
            whileTap={{ scale: 0.95 }}
            className="absolute flex flex-col items-center justify-center rounded-full cursor-pointer group"
            style={{
                marginLeft: -displaySize / 2,
                marginTop: -displaySize / 2,
                background: isSelected
                    ? "radial-gradient(circle at 35% 35%, rgba(209,107,165,0.35), rgba(123,45,139,0.2))"
                    : "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.07), rgba(255,255,255,0.02))",
                border: isSelected
                    ? "1px solid rgba(209,107,165,0.5)"
                    : "1px solid rgba(255,255,255,0.08)",
                boxShadow: isSelected
                    ? "0 0 40px rgba(209,107,165,0.2), inset 0 1px 1px rgba(255,255,255,0.1)"
                    : "0 4px 30px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.05)",
                backdropFilter: "blur(8px)",
                zIndex: isSelected ? 20 : 1,
            }}
        >
            {/* Subtle inner shimmer */}
            <div
                className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                style={{
                    background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.08), transparent 60%)",
                }}
            />

            {/* Breathing glow for selected */}
            {isSelected && (
                <motion.div
                    animate={{ opacity: [0.15, 0.35, 0.15], scale: [1, 1.15, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-[-8px] rounded-full"
                    style={{ background: "radial-gradient(circle, rgba(209,107,165,0.3), transparent 70%)" }}
                />
            )}

            {/* Floating animation wrapper */}
            <motion.div
                animate={{
                    y: [0, -3, 0, 2, 0],
                    x: [0, 1.5, 0, -1.5, 0],
                }}
                transition={{
                    duration: floatDuration,
                    delay: floatDelay,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="flex flex-col items-center justify-center gap-1 relative z-10"
            >
                <span className="text-lg select-none" style={{ fontSize: displaySize * 0.28 }}>
                    {area.icon}
                </span>
                <span
                    className="text-center font-semibold tracking-wide select-none leading-tight"
                    style={{
                        fontSize: Math.max(8, displaySize * 0.11),
                        color: isSelected ? "rgba(209,107,165,0.9)" : "rgba(255,255,255,0.5)",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        maxWidth: displaySize * 0.8,
                    }}
                >
                    {area.label}
                </span>
            </motion.div>
        </motion.button>
    );
}

// ─── PATTERN SUB-BUBBLE ──────────────────────────────────────────────────────

function PatternBubble({ pattern, index, total, isSelected, onClick, centerX, centerY }: any) {
    // Position sub-bubbles in a ring around center
    const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
    const radius = 140;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    const size = 100 + pattern.length * 0.5;

    return (
        <motion.button
            onClick={onClick}
            initial={{ opacity: 0, scale: 0, x: centerX, y: centerY }}
            animate={{
                opacity: 1,
                scale: 1,
                x: x - size / 2,
                y: y - 24,
            }}
            exit={{
                opacity: 0,
                scale: 0,
                x: centerX,
                y: centerY,
                transition: { duration: 0.3, delay: index * 0.03 },
            }}
            transition={{
                duration: 0.6,
                delay: index * 0.08,
                ease: [0.16, 1, 0.3, 1],
            }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            className="absolute"
            style={{ zIndex: 30 }}
        >
            {/* Floating animation */}
            <motion.div
                animate={{
                    y: [0, -2, 0, 2, 0],
                }}
                transition={{
                    duration: 3 + index * 0.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="flex items-center justify-center rounded-full px-5 py-3 cursor-pointer"
                style={{
                    minWidth: 80,
                    maxWidth: 160,
                    background: isSelected
                        ? "radial-gradient(circle at 30% 30%, rgba(171,206,201,0.3), rgba(171,206,201,0.1))"
                        : "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
                    border: isSelected
                        ? "1px solid rgba(171,206,201,0.5)"
                        : "1px solid rgba(255,255,255,0.08)",
                    boxShadow: isSelected
                        ? "0 0 30px rgba(171,206,201,0.15), inset 0 1px 1px rgba(255,255,255,0.1)"
                        : "0 4px 20px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.05)",
                    backdropFilter: "blur(12px)",
                }}
            >
                {isSelected && (
                    <motion.div
                        animate={{ opacity: [0.1, 0.25, 0.1] }}
                        transition={{ duration: 2.5, repeat: Infinity }}
                        className="absolute inset-[-4px] rounded-full"
                        style={{ background: "radial-gradient(circle, rgba(171,206,201,0.2), transparent)" }}
                    />
                )}
                <span
                    className="text-center font-medium select-none relative z-10"
                    style={{
                        fontSize: 11,
                        lineHeight: 1.3,
                        color: isSelected ? "rgba(171,206,201,0.95)" : "rgba(255,255,255,0.45)",
                    }}
                >
                    {pattern}
                </span>
            </motion.div>
        </motion.button>
    );
}

// ─── INSIGHT PANEL (appears after selection) ─────────────────────────────────

function InsightPanel({ area, selectedPatterns, onClose }: any) {
    if (!area) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 20, filter: "blur(8px)" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative mx-auto max-w-lg"
        >
            {/* Glow behind card */}
            <motion.div
                animate={{ opacity: [0.1, 0.2, 0.1] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute inset-[-20px] rounded-[40px] blur-[40px]"
                style={{ background: "radial-gradient(circle, rgba(209,107,165,0.15), transparent)" }}
            />

            <div
                className="relative rounded-3xl p-8 space-y-6"
                style={{
                    background: "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))",
                    border: "1px solid rgba(255,255,255,0.06)",
                    backdropFilter: "blur(20px)",
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">{area.icon}</span>
                        <h3 className="text-white/80 font-serif text-xl font-light">{area.label}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/20 hover:text-white/50 transition-colors text-sm"
                    >
                        ✕
                    </button>
                </div>

                {/* Body feels */}
                <div className="space-y-2">
                    <p
                        style={{
                            fontSize: 9,
                            textTransform: "uppercase",
                            letterSpacing: "0.5em",
                            color: "rgba(171,206,201,0.5)",
                            fontWeight: 700,
                        }}
                    >
                        What your body feels
                    </p>
                    <p className="text-white/50 font-serif italic text-sm leading-relaxed">
                        {area.bodyFeels}
                    </p>
                </div>

                {/* Selected patterns */}
                {selectedPatterns.length > 0 && (
                    <div className="space-y-2">
                        <p
                            style={{
                                fontSize: 9,
                                textTransform: "uppercase",
                                letterSpacing: "0.5em",
                                color: "rgba(209,107,165,0.6)",
                                fontWeight: 700,
                            }}
                        >
                            What resonated with you
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {selectedPatterns.map((p: any) => (
                                <span
                                    key={p}
                                    className="px-3 py-1.5 rounded-full text-xs"
                                    style={{
                                        background: "rgba(209,107,165,0.15)",
                                        border: "1px solid rgba(209,107,165,0.3)",
                                        color: "rgba(209,107,165,0.8)",
                                    }}
                                >
                                    {p}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Example */}
                <div
                    className="pl-4"
                    style={{ borderLeft: "2px solid rgba(255,255,255,0.05)" }}
                >
                    <p
                        style={{
                            fontSize: 9,
                            textTransform: "uppercase",
                            letterSpacing: "0.4em",
                            color: "rgba(255,255,255,0.15)",
                            fontWeight: 700,
                            marginBottom: 6,
                        }}
                    >
                        For example
                    </p>
                    <p className="text-white/25 font-serif italic text-xs leading-relaxed">
                        {area.example}
                    </p>
                </div>

                {/* What helps */}
                <div
                    className="rounded-2xl p-5"
                    style={{
                        background: "rgba(171,206,201,0.04)",
                        border: "1px solid rgba(171,206,201,0.1)",
                    }}
                >
                    <div className="flex items-center gap-2 mb-2">
                        <span style={{ color: "rgba(171,206,201,0.5)", fontSize: 14 }}>♡</span>
                        <p
                            style={{
                                fontSize: 9,
                                textTransform: "uppercase",
                                letterSpacing: "0.5em",
                                color: "rgba(171,206,201,0.5)",
                                fontWeight: 700,
                            }}
                        >
                            What helps
                        </p>
                    </div>
                    <p
                        className="font-serif leading-relaxed"
                        style={{ fontSize: 13, color: "rgba(171,206,201,0.65)" }}
                    >
                        {area.whatHelps}
                    </p>
                </div>
            </div>
        </motion.div>
    );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function BodyBubbleSelector() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerSize, setContainerSize] = useState(600);
    const [selectedArea, setSelectedArea] = useState<any>(null);
    const [selectedPatterns, setSelectedPatterns] = useState<string[]>([]);
    const [showInsight, setShowInsight] = useState(false);
    const [positions] = useState(() => generateBubblePositions(BODY_AREAS.length));

    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                setContainerSize(Math.min(rect.width, rect.height));
            }
        };
        updateSize();
        window.addEventListener("resize", updateSize);
        return () => window.removeEventListener("resize", updateSize);
    }, []);

    const handleSelectArea = (area: any) => {
        if (selectedArea?.id === area.id) {
            setSelectedArea(null);
            setSelectedPatterns([]);
            setShowInsight(false);
        } else {
            setSelectedArea(area);
            setSelectedPatterns([]);
            setShowInsight(false);
        }
    };

    const handleTogglePattern = (pattern: string) => {
        setSelectedPatterns((prev) =>
            prev.includes(pattern) ? prev.filter((p) => p !== pattern) : [...prev, pattern]
        );
        if (!showInsight) {
            // Show insight after first pattern selection
            setTimeout(() => setShowInsight(true), 600);
        }
    };

    const handleClose = () => {
        setSelectedArea(null);
        setSelectedPatterns([]);
        setShowInsight(false);
    };

    // Find center position for sub-bubble ring
    const selectedPos = selectedArea
        ? positions[BODY_AREAS.findIndex((a: any) => a.id === selectedArea.id)]
        : null;

    return (
        <div
            className="w-full min-h-screen flex flex-col items-center justify-start p-4 overflow-hidden relative"
            style={{
                background: "radial-gradient(ellipse at 50% 30%, #1a0a2e 0%, #0d0014 50%, #050008 100%)",
                fontFamily: "'Georgia', 'Times New Roman', serif",
            }}
        >
            {/* Ambient glow */}
            <motion.div
                animate={{ opacity: [0.06, 0.14, 0.06], scale: [1, 1.08, 1] }}
                transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
                className="fixed top-[20%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-[120px] pointer-events-none"
                style={{
                    background: "radial-gradient(ellipse, rgba(209,107,165,0.12), transparent)",
                }}
            />

            {/* Noise overlay */}
            <div
                className="fixed inset-0 pointer-events-none opacity-[0.03]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
                    backgroundSize: "128px 128px",
                }}
            />

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="text-center mt-8 mb-4 relative z-10"
            >
                <p
                    style={{
                        fontSize: 9,
                        textTransform: "uppercase",
                        letterSpacing: "0.6em",
                        color: "rgba(171,206,201,0.4)",
                        fontWeight: 700,
                        marginBottom: 12,
                    }}
                >
                    Body Awareness
                </p>
                <h2
                    className="font-serif font-light"
                    style={{
                        fontSize: 32,
                        color: "rgba(255,255,255,0.8)",
                        lineHeight: 1.2,
                        textShadow: "0 0 60px rgba(209,107,165,0.15)",
                    }}
                >
                    {selectedArea
                        ? `Where does "${selectedArea.label}" live in you?`
                        : "Is your body speaking to you?"}
                </h2>
                <p className="text-white/20 font-serif italic text-sm mt-3 max-w-md mx-auto">
                    {selectedArea
                        ? "Select the emotional patterns that resonate"
                        : "Tap whatever draws your attention"}
                </p>
            </motion.div>

            {/* Bubble Field */}
            <div
                ref={containerRef}
                className="relative w-full flex-1 max-w-2xl mx-auto"
                style={{ minHeight: 500, maxHeight: 600 }}
            >
                {/* Main body area bubbles */}
                {BODY_AREAS.map((area, i) => (
                    <FloatingBubble
                        key={area.id}
                        area={area}
                        position={positions[i]}
                        index={i}
                        isSelected={selectedArea?.id === area.id}
                        isOtherSelected={!!selectedArea && selectedArea.id !== area.id}
                        onClick={() => handleSelectArea(area)}
                        containerSize={containerSize}
                    />
                ))}

                {/* Sub-bubbles for emotional patterns */}
                <AnimatePresence>
                    {selectedArea &&
                        !showInsight &&
                        selectedArea.emotionalPatterns.map((pattern: any, i: number) => (
                            <PatternBubble
                                key={pattern}
                                pattern={pattern}
                                index={i}
                                total={selectedArea.emotionalPatterns.length}
                                isSelected={selectedPatterns.includes(pattern)}
                                onClick={() => handleTogglePattern(pattern)}
                                centerX={selectedPos ? (selectedPos.x / 100) * containerSize : containerSize / 2}
                                centerY={selectedPos ? (selectedPos.y / 100) * containerSize : containerSize / 2}
                            />
                        ))}
                </AnimatePresence>
            </div>

            {/* Insight Panel */}
            <AnimatePresence>
                {showInsight && selectedArea && (
                    <div className="w-full max-w-2xl mx-auto relative z-40 pb-8 mt-12">
                        <InsightPanel
                            area={selectedArea}
                            selectedPatterns={selectedPatterns}
                            onClose={handleClose}
                        />
                    </div>
                )}
            </AnimatePresence>

            {/* Disclaimer */}
            <p className="text-center text-white/10 text-[10px] pb-6 max-w-sm mx-auto">
                This guide is for self-awareness only. It does not replace medical or mental health care.
            </p>
        </div>
    );
}
