import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';

// ─── BODY AWARENESS DATA ─────────────────────────────────────────────────────

export interface BodyAreaData {
    id: string;
    label: string;
    icon: string;
    size: number;
    bodyFeels: string;
    emotionalPatterns: string[];
    example: string;
    whatHelps: string;
}

export const BODY_AREAS: BodyAreaData[] = [
    {
        id: 'headaches', label: 'Headaches', icon: '🧠', size: 88,
        bodyFeels: 'Tension, pressure, or pain in your head',
        emotionalPatterns: ['Being too hard on yourself', 'Constant self-criticism', 'Trying to be perfect', 'Never feeling good enough'],
        example: 'You criticize yourself all day — "I should have done better." Your head literally gets tight from the mental pressure.',
        whatHelps: 'Be kinder to yourself. When you notice self-criticism, pause and say: "I\'m doing my best."',
    },
    {
        id: 'neck-shoulders', label: 'Neck & Shoulders', icon: '💆', size: 96,
        bodyFeels: 'Tight, stiff, or aching neck and shoulders',
        emotionalPatterns: ['Carrying too much responsibility', 'Feeling burdened', 'Stubborn thinking', 'Refusing other viewpoints'],
        example: 'Everything feels on your shoulders — work, family, finances. Your shoulders literally carry this weight.',
        whatHelps: 'Ask for help. Let some things go. Practice saying: "This isn\'t all my responsibility."',
    },
    {
        id: 'back-pain', label: 'Back Pain', icon: '🔙', size: 82,
        bodyFeels: 'Pain or tension anywhere along the spine',
        emotionalPatterns: ['Feeling unsupported emotionally', 'Guilt about the past', 'Money worries', 'Fear about the future'],
        example: 'Constant worry about finances — "How will I pay rent?" Your lower back holds this fear.',
        whatHelps: 'Address what you can practically, then ask: "Am I okay in this moment?"',
    },
    {
        id: 'stomach', label: 'Stomach', icon: '😰', size: 86,
        bodyFeels: 'Upset stomach, nausea, butterflies, digestive issues',
        emotionalPatterns: ['Fear of new things', 'Anxiety about what\'s coming', 'Can\'t accept what\'s happening', 'Gut-level dread'],
        example: 'A big event tomorrow — your stomach churns all night. Your body reacts to fearful thoughts.',
        whatHelps: 'Take 5 slow breaths and remind yourself: "I can handle this one step at a time."',
    },
    {
        id: 'throat', label: 'Throat', icon: '🗣️', size: 78,
        bodyFeels: 'Tightness, soreness, feeling like you can\'t speak',
        emotionalPatterns: ['Not speaking your truth', 'Holding back words', 'Fear of speaking up', 'Swallowing your words'],
        example: 'Someone treats you unfairly. You hold it in. Your throat tightens from unspoken words.',
        whatHelps: 'Find safe ways to express yourself — journal, talk to a friend. Even acknowledging "I have something to say" helps.',
    },
    {
        id: 'chest-heart', label: 'Heart Area', icon: '💗', size: 94,
        bodyFeels: 'Pressure, heaviness, or aching in your chest',
        emotionalPatterns: ['Lack of joy', 'Feeling heartbroken', 'Long-term stress', 'Feeling unloved'],
        example: 'Feeling lonely or unloved — your heart area literally aches. Your body feels the emotional pain.',
        whatHelps: 'Place your hand on your heart and breathe. Remind yourself: "I matter. I\'m worthy of love."',
    },
    {
        id: 'breathing', label: 'Breathing', icon: '🌬️', size: 80,
        bodyFeels: 'Can\'t take a full breath, tight chest, shallow breathing',
        emotionalPatterns: ['Fear of fully living', 'Feeling smothered', 'Not feeling safe', 'Suppressed emotions'],
        example: 'Even as an adult, you can\'t take full, deep breaths — like you\'re still holding yourself back.',
        whatHelps: 'Give yourself permission to take up space, to be yourself, to breathe freely.',
    },
    {
        id: 'fatigue', label: 'Fatigue', icon: '🔋', size: 84,
        bodyFeels: 'Exhausted, drained, no motivation',
        emotionalPatterns: ['Resistance to your life', '"What\'s the use?" attitude', 'Not loving yourself', 'Giving up'],
        example: 'You wake up tired because emotionally you\'re exhausted from fighting against your life.',
        whatHelps: 'Small steps. Find one thing that brings a tiny bit of joy. Rest when needed, but also move a little.',
    },
    {
        id: 'sleep', label: 'Sleep', icon: '🌙', size: 76,
        bodyFeels: 'Can\'t fall asleep, waking up at night, restless',
        emotionalPatterns: ['Mind won\'t stop worrying', 'Fear of letting go', 'Anxiety about tomorrow', 'Not feeling safe to rest'],
        example: 'You lie in bed and your mind races: "What if… I should have… Tomorrow I need to…"',
        whatHelps: 'Write down worries before bed. Tell yourself: "I\'m safe right now. I can rest."',
    },
    {
        id: 'skin', label: 'Skin', icon: '✋', size: 72,
        bodyFeels: 'Breakouts, itchiness, inflammation, rashes',
        emotionalPatterns: ['Anxiety and worry', 'Not accepting yourself', 'Feeling threatened', 'Old issues surfacing'],
        example: 'You criticize how you look. Your skin — your outer layer — shows this internal rejection.',
        whatHelps: 'Look in the mirror and find one thing to appreciate. Treat yourself with kindness.',
    },
    {
        id: 'knees', label: 'Knees', icon: '🦵', size: 74,
        bodyFeels: 'Pain, stiffness, hard to bend',
        emotionalPatterns: ['Stubborn thinking', 'Pride and ego', 'Refusing to be flexible', 'Fear of moving forward'],
        example: 'You refuse to compromise. Your knees — which need to bend to move forward — get stiff.',
        whatHelps: 'Practice flexibility. Ask: "What if there\'s another way to see this?"',
    },
    {
        id: 'illness', label: 'Getting Sick', icon: '🤧', size: 78,
        bodyFeels: 'Always getting sick, low immunity, run down',
        emotionalPatterns: ['Mental overload', 'Needing a break', '"I need to escape" feelings', 'Burnout'],
        example: 'You keep pushing. Your body forces rest by getting sick — it says: "Stop. Rest now."',
        whatHelps: 'Rest BEFORE you get sick. Listen to early signals and actually take breaks.',
    },
    {
        id: 'pressure', label: 'Inner Pressure', icon: '🫀', size: 80,
        bodyFeels: 'Feeling internal pressure that doesn\'t release',
        emotionalPatterns: ['Unresolved emotions', 'Chronic tension', 'Unexpressed anger', 'Constant inner pressure'],
        example: 'Stressed for years, never dealing with it, just pushing through. Your system is always "on."',
        whatHelps: 'If you can\'t change the situation, change how you respond. Release tension daily.',
    },
    {
        id: 'weight', label: 'Weight', icon: '⚖️', size: 76,
        bodyFeels: 'Weight changes connected to emotions',
        emotionalPatterns: ['Using food for comfort', 'Feeling unsafe', 'Running from emotions', 'Fear and insecurity'],
        example: 'When stressed, you eat to feel better. It\'s not about the food — it\'s about the feeling.',
        whatHelps: 'Ask: "Am I physically hungry, or feeding a feeling?" Learn other ways to comfort yourself.',
    },
    {
        id: 'digestive', label: 'Digestion', icon: '🫁', size: 82,
        bodyFeels: 'Constipation, IBS, or digestive irregularity',
        emotionalPatterns: ['Holding onto old beliefs', 'Refusing to let go', 'Long-term anxiety', 'Fear of releasing control'],
        example: 'You can\'t let go of a past hurt, replaying it. Your body mirrors this by literally not letting go.',
        whatHelps: 'Practice forgiveness — not for them, but to free yourself. Journal about what you\'re ready to release.',
    },
];

// ─── ORGANIC POSITION GENERATOR ──────────────────────────────────────────────

function generateBubblePositions(count: number) {
    const positions: { x: number; y: number }[] = [];
    const cx = 50, cy = 50;

    // 3 organic rings
    const rings = [
        { r: 0, count: 1 },
        { r: 18, count: 5 },
        { r: 34, count: 9 },
    ];

    let idx = 0;
    for (const ring of rings) {
        for (let i = 0; i < ring.count && idx < count; i++) {
            const angle = (i / ring.count) * Math.PI * 2 + (ring.r * 0.1);
            const jitterX = (Math.sin(idx * 2.7) * 4);  // deterministic jitter
            const jitterY = (Math.cos(idx * 3.1) * 4);
            positions.push({
                x: cx + Math.cos(angle) * ring.r + jitterX,
                y: cy + Math.sin(angle) * ring.r + jitterY,
            });
            idx++;
        }
    }
    return positions;
}

const POSITIONS = generateBubblePositions(BODY_AREAS.length);

// ─── FLOATING BUBBLE ─────────────────────────────────────────────────────────

const FloatingBubble = ({
    area,
    position,
    index,
    isSelected,
    isOtherSelected,
    onClick,
    containerWidth,
}: {
    area: BodyAreaData;
    position: { x: number; y: number };
    index: number;
    isSelected: boolean;
    isOtherSelected: boolean;
    onClick: () => void;
    containerWidth: number;
}) => {
    const scale = containerWidth / 800;
    const baseSize = area.size * Math.max(scale, 0.65);
    const displaySize = isSelected ? baseSize * 1.3 : isOtherSelected ? baseSize * 0.55 : baseSize;
    const floatDur = 4 + (index % 5) * 0.8;

    return (
        <motion.button
            onClick={onClick}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
                opacity: isOtherSelected ? 0.2 : 1,
                scale: 1,
                left: `${position.x}%`,
                top: `${position.y}%`,
                width: displaySize,
                height: displaySize,
            }}
            transition={{
                opacity: { duration: 0.5 },
                scale: { duration: 0.8, delay: index * 0.035, ease: [0.16, 1, 0.3, 1] },
                left: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
                top: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
                width: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
                height: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
            }}
            whileHover={{ scale: 1.12, zIndex: 10 }}
            whileTap={{ scale: 0.95 }}
            className="absolute rounded-full flex flex-col items-center justify-center cursor-pointer group"
            style={{
                marginLeft: -displaySize / 2,
                marginTop: -displaySize / 2,
                background: isSelected
                    ? 'radial-gradient(circle at 35% 35%, rgba(209,107,165,0.35), rgba(123,45,139,0.2))'
                    : 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.07), rgba(255,255,255,0.02))',
                border: isSelected
                    ? '1px solid rgba(209,107,165,0.5)'
                    : '1px solid rgba(255,255,255,0.08)',
                boxShadow: isSelected
                    ? '0 0 40px rgba(209,107,165,0.2), inset 0 1px 1px rgba(255,255,255,0.1)'
                    : '0 4px 30px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.05)',
                backdropFilter: 'blur(8px)',
                zIndex: isSelected ? 20 : 1,
            }}
        >
            {/* Shimmer on hover */}
            <div
                className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                style={{ background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.08), transparent 60%)' }}
            />

            {/* Breathing glow */}
            {isSelected && (
                <motion.div
                    animate={{ opacity: [0.15, 0.35, 0.15], scale: [1, 1.15, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute inset-[-8px] rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(209,107,165,0.3), transparent 70%)' }}
                />
            )}

            {/* Float animation */}
            <motion.div
                animate={{
                    y: [0, -3, 0, 2, 0],
                    x: [0, 1.5, 0, -1.5, 0],
                }}
                transition={{ duration: floatDur, delay: index * 0.15, repeat: Infinity, ease: 'easeInOut' }}
                className="flex flex-col items-center justify-center gap-0.5 relative z-10"
            >
                <span className="select-none" style={{ fontSize: displaySize * 0.28 }}>{area.icon}</span>
                <span
                    className="text-center font-semibold tracking-wide select-none leading-tight"
                    style={{
                        fontSize: Math.max(7, displaySize * 0.11),
                        color: isSelected ? 'rgba(209,107,165,0.9)' : 'rgba(255,255,255,0.5)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        maxWidth: displaySize * 0.8,
                    }}
                >
                    {area.label}
                </span>
            </motion.div>
        </motion.button>
    );
};

// ─── PATTERN SUB-BUBBLE ──────────────────────────────────────────────────────

const PatternBubble = ({
    pattern,
    index,
    total,
    isSelected,
    onClick,
    centerX,
    centerY,
}: {
    pattern: string;
    index: number;
    total: number;
    isSelected: boolean;
    onClick: () => void;
    centerX: number;
    centerY: number;
}) => {
    const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
    const radius = 130;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;

    return (
        <motion.button
            onClick={onClick}
            initial={{ opacity: 0, scale: 0, left: centerX, top: centerY }}
            animate={{ opacity: 1, scale: 1, left: x, top: y }}
            exit={{
                opacity: 0, scale: 0, left: centerX, top: centerY,
                transition: { duration: 0.3, delay: index * 0.03 },
            }}
            transition={{ duration: 0.6, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ zIndex: 30 }}
        >
            <motion.div
                animate={{ y: [0, -2, 0, 2, 0] }}
                transition={{ duration: 3 + index * 0.5, repeat: Infinity, ease: 'easeInOut' }}
                className="flex items-center justify-center rounded-full px-4 py-2.5 cursor-pointer"
                style={{
                    minWidth: 70,
                    maxWidth: 150,
                    background: isSelected
                        ? 'radial-gradient(circle at 30% 30%, rgba(171,206,201,0.3), rgba(171,206,201,0.1))'
                        : 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
                    border: isSelected
                        ? '1px solid rgba(171,206,201,0.5)'
                        : '1px solid rgba(255,255,255,0.08)',
                    boxShadow: isSelected
                        ? '0 0 30px rgba(171,206,201,0.15), inset 0 1px 1px rgba(255,255,255,0.1)'
                        : '0 4px 20px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(12px)',
                }}
            >
                {isSelected && (
                    <motion.div
                        animate={{ opacity: [0.1, 0.25, 0.1] }}
                        transition={{ duration: 2.5, repeat: Infinity }}
                        className="absolute inset-[-4px] rounded-full"
                        style={{ background: 'radial-gradient(circle, rgba(171,206,201,0.2), transparent)' }}
                    />
                )}
                <span
                    className="text-center font-medium select-none relative z-10"
                    style={{
                        fontSize: 10,
                        lineHeight: 1.3,
                        color: isSelected ? 'rgba(171,206,201,0.95)' : 'rgba(255,255,255,0.45)',
                    }}
                >
                    {pattern}
                </span>
            </motion.div>
        </motion.button>
    );
};

// ─── INSIGHT PANEL ───────────────────────────────────────────────────────────

const InsightPanel = ({ area, selectedPatterns, onClose }: {
    area: BodyAreaData;
    selectedPatterns: string[];
    onClose: () => void;
}) => (
    <motion.div
        initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative"
    >
        <motion.div
            animate={{ opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute inset-[-20px] rounded-[40px] blur-[40px]"
            style={{ background: 'radial-gradient(circle, rgba(209,107,165,0.15), transparent)' }}
        />

        <div
            className="relative rounded-3xl p-8 space-y-6"
            style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
                border: '1px solid rgba(255,255,255,0.06)',
                backdropFilter: 'blur(20px)',
            }}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">{area.icon}</span>
                    <h3 className="text-white/80 font-serif text-xl font-light">{area.label}</h3>
                </div>
                <button onClick={onClose} className="text-white/20 hover:text-white/50 transition-colors text-sm">✕</button>
            </div>

            <div className="space-y-2">
                <p className="text-[9px] uppercase tracking-[0.5em] text-[#ABCEC9]/50 font-bold">What your body feels</p>
                <p className="text-white/50 font-serif italic text-sm leading-relaxed">{area.bodyFeels}</p>
            </div>

            {selectedPatterns.length > 0 && (
                <div className="space-y-2">
                    <p className="text-[9px] uppercase tracking-[0.5em] text-[#D16BA5]/60 font-bold">What resonated</p>
                    <div className="flex flex-wrap gap-2">
                        {selectedPatterns.map(p => (
                            <span key={p} className="px-3 py-1.5 rounded-full text-xs" style={{
                                background: 'rgba(209,107,165,0.15)',
                                border: '1px solid rgba(209,107,165,0.3)',
                                color: 'rgba(209,107,165,0.8)',
                            }}>{p}</span>
                        ))}
                    </div>
                </div>
            )}

            <div className="pl-4" style={{ borderLeft: '2px solid rgba(255,255,255,0.05)' }}>
                <p className="text-[9px] uppercase tracking-[0.4em] text-white/15 font-bold mb-2">For example</p>
                <p className="text-white/25 font-serif italic text-xs leading-relaxed">{area.example}</p>
            </div>

            <div className="rounded-2xl p-5" style={{ background: 'rgba(171,206,201,0.04)', border: '1px solid rgba(171,206,201,0.1)' }}>
                <div className="flex items-center gap-2 mb-2">
                    <Heart size={12} className="text-[#ABCEC9]/50" />
                    <p className="text-[9px] uppercase tracking-[0.5em] text-[#ABCEC9]/50 font-bold">What helps</p>
                </div>
                <p className="font-serif leading-relaxed text-[13px] text-[#ABCEC9]/65">{area.whatHelps}</p>
            </div>
        </div>
    </motion.div>
);

// ─── EXPORTED COMPOSABLE COMPONENT ───────────────────────────────────────────

interface BodyBubbleFieldProps {
    onAreaChange?: (area: BodyAreaData | null) => void;
    onPatternsChange?: (patterns: string[]) => void;
    onGuidanceChange?: (guidance: string) => void;
}

export const BodyBubbleField: React.FC<BodyBubbleFieldProps> = ({
    onAreaChange,
    onPatternsChange,
    onGuidanceChange,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(600);
    const [selectedArea, setSelectedArea] = useState<BodyAreaData | null>(null);
    const [selectedPatterns, setSelectedPatterns] = useState<string[]>([]);
    const [showInsight, setShowInsight] = useState(false);

    useEffect(() => {
        const update = () => {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.getBoundingClientRect().width);
            }
        };
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, []);

    const handleSelectArea = (area: BodyAreaData) => {
        if (selectedArea?.id === area.id) {
            setSelectedArea(null);
            setSelectedPatterns([]);
            setShowInsight(false);
            onAreaChange?.(null);
            onPatternsChange?.([]);
            onGuidanceChange?.('');
        } else {
            setSelectedArea(area);
            setSelectedPatterns([]);
            setShowInsight(false);
            onAreaChange?.(area);
            onPatternsChange?.([]);
            onGuidanceChange?.(area.whatHelps);
        }
    };

    const handleTogglePattern = (pattern: string) => {
        const next = selectedPatterns.includes(pattern)
            ? selectedPatterns.filter(p => p !== pattern)
            : [...selectedPatterns, pattern];
        setSelectedPatterns(next);
        onPatternsChange?.(next);
        if (!showInsight && next.length > 0) {
            setTimeout(() => setShowInsight(true), 600);
        }
    };

    const handleClose = () => {
        setSelectedArea(null);
        setSelectedPatterns([]);
        setShowInsight(false);
        onAreaChange?.(null);
        onPatternsChange?.([]);
        onGuidanceChange?.('');
    };

    const selectedIdx = selectedArea ? BODY_AREAS.findIndex(a => a.id === selectedArea.id) : -1;
    const selectedPos = selectedIdx >= 0 ? POSITIONS[selectedIdx] : null;
    const containerHeight = Math.min(containerWidth * 0.85, 520);

    return (
        <div className="space-y-6">
            {/* Title */}
            <div className="text-center">
                <p className="text-[9px] uppercase tracking-[0.5em] text-white/25 font-bold mb-2">
                    {selectedArea ? 'Select what resonates' : 'Is your body speaking to you?'}
                </p>
                <p className="text-white/15 font-serif italic text-xs">
                    {selectedArea ? 'Tap the emotional patterns that feel true' : 'Tap whatever draws your attention'}
                </p>
            </div>

            {/* Bubble Field */}
            <div
                ref={containerRef}
                className="relative w-full"
                style={{ height: containerHeight }}
            >
                {BODY_AREAS.map((area, i) => (
                    <FloatingBubble
                        key={area.id}
                        area={area}
                        position={POSITIONS[i]}
                        index={i}
                        isSelected={selectedArea?.id === area.id}
                        isOtherSelected={!!selectedArea && selectedArea.id !== area.id}
                        onClick={() => handleSelectArea(area)}
                        containerWidth={containerWidth}
                    />
                ))}

                {/* Sub-pattern bubbles */}
                <AnimatePresence>
                    {selectedArea && !showInsight && selectedArea.emotionalPatterns.map((pattern, i) => (
                        <PatternBubble
                            key={pattern}
                            pattern={pattern}
                            index={i}
                            total={selectedArea.emotionalPatterns.length}
                            isSelected={selectedPatterns.includes(pattern)}
                            onClick={() => handleTogglePattern(pattern)}
                            centerX={selectedPos ? (selectedPos.x / 100) * containerWidth : containerWidth / 2}
                            centerY={selectedPos ? (selectedPos.y / 100) * containerHeight : containerHeight / 2}
                        />
                    ))}
                </AnimatePresence>
            </div>

            {/* Insight Panel */}
            <AnimatePresence>
                {showInsight && selectedArea && (
                    <InsightPanel
                        area={selectedArea}
                        selectedPatterns={selectedPatterns}
                        onClose={handleClose}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default BodyBubbleField;
