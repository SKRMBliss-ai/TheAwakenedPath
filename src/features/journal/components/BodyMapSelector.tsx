
import { motion, AnimatePresence } from "framer-motion";
import type { FeltExperience } from "../../../data/feltExperiences";

export const BODY_ZONES = [
    {
        id: "Head",
        label: "Head",
        cx: 200, cy: 72,
        r: 34,
        labelOffset: { x: 90, y: 0 },
        color: "#A668B0",
        description: "Headaches, tension, pressure, racing mind",
        insight: "The head often holds self-criticism and overthinking. Your mind has been working overtime.",
        helps: 'Pause and say: "I\'m doing my best. I can let my mind rest."',
    },
    {
        id: "Throat & Jaw",
        label: "Throat & Jaw",
        cx: 200, cy: 132,
        r: 20,
        labelOffset: { x: -105, y: 0 },
        color: "#5C9FD4",
        description: "Tightness, clenching, lump in throat",
        insight: "The throat holds unspoken words. Jaw tension comes from holding back what you want to say.",
        helps: 'Even whispering "I have something to say" can begin to release the tension.',
    },
    {
        id: "Shoulders",
        label: "Shoulders",
        cx: 200, cy: 168,
        r: 50,
        labelOffset: { x: 100, y: 0 },
        color: "#D4883C",
        description: "Tight, stiff, heavy, aching",
        insight: "Shoulders carry responsibility. When life feels heavy, they literally tighten under the weight.",
        helps: 'Ask yourself: "What am I carrying that isn\'t mine to carry?" Let something go today.',
    },
    {
        id: "Chest & Heart",
        label: "Chest & Heart",
        cx: 200, cy: 220,
        r: 38,
        labelOffset: { x: -110, y: 0 },
        color: "#C65F8D",
        description: "Heaviness, tightness, aching, shallow breathing",
        insight: "The chest carries love, heartbreak, and loneliness. Tightness means emotions want to be felt.",
        helps: 'Place your hand on your heart. Breathe slowly. "I\'m here. I feel this. It\'s okay."',
    },
    {
        id: "Stomach & Gut",
        label: "Stomach & Gut",
        cx: 200, cy: 290,
        r: 35,
        labelOffset: { x: 105, y: 0 },
        color: "#D4A017",
        description: "Butterflies, nausea, churning, knots",
        insight: "Your gut reacts to fear and anxiety before your thinking mind catches up.",
        helps: 'Place your hand on your belly. 5 slow breaths. "I can handle this one moment at a time."',
    },
    {
        id: "Back",
        label: "Back",
        cx: 200, cy: 250,
        r: 30,
        labelOffset: { x: -100, y: 20 },
        color: "#6BAB6E",
        description: "Upper, middle, or lower back tension",
        insight: "Upper back: feeling unsupported. Lower back: money worries, fear about the future.",
        helps: 'Ask: "Am I okay right now, in this exact moment?" Usually the answer is yes.',
    },
    {
        id: "Limbs & Whole Body",
        label: "Legs & Whole Body",
        cx: 200, cy: 410,
        r: 35,
        labelOffset: { x: 100, y: 0 },
        color: "#4EA69E",
        description: "Fatigue, heaviness, stiffness, restlessness",
        insight: "Legs hold our ability to move forward. Whole-body exhaustion means your system needs deep rest.",
        helps: "One kind thing for yourself today. You don't need to fix everything at once.",
    },
];

const BODY_PATH = `
  M 200 45
  C 220 45, 235 55, 235 72
  C 235 89, 220 100, 200 100
  C 180 100, 165 89, 165 72
  C 165 55, 180 45, 200 45
  Z
  M 200 100
  L 200 108
  C 200 108, 190 112, 185 115
  L 140 135
  C 130 138, 120 145, 118 155
  L 105 210
  C 103 218, 108 222, 115 218
  L 155 180
  L 160 175
  L 165 178
  L 160 220
  L 155 290
  C 153 300, 155 310, 160 315
  L 160 320
  L 148 410
  C 146 425, 148 435, 155 440
  L 165 448
  C 170 450, 178 448, 180 442
  L 192 340
  L 200 320
  L 208 340
  L 220 442
  C 222 448, 230 450, 235 448
  L 245 440
  C 252 435, 254 425, 252 410
  L 240 320
  L 240 315
  C 245 310, 247 300, 245 290
  L 240 220
  L 235 178
  L 240 175
  L 245 180
  L 285 218
  C 292 222, 297 218, 295 210
  L 282 155
  C 280 145, 270 138, 260 135
  L 215 115
  C 210 112, 200 108, 200 108
  Z
`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fadeIn: any = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 1, 0.5, 1] } },
    exit: { opacity: 0, y: -8, transition: { duration: 0.3 } },
};

interface BodyMapProps {
    activeAreas?: string[];
    selectedArea: string | null;
    onSelectArea?: (areaId: string | null) => void;
    /** @deprecated Use onSelectArea instead */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSelect?: (zone: any) => void;
    activeCategories?: FeltExperience[];
}

export function BodyMapSelector({
    activeAreas = [],
    selectedArea,
    onSelectArea,
    onSelect,
    activeCategories = [],
}: BodyMapProps) {
    const selectedZone = BODY_ZONES.find(z => z.id === selectedArea) || null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleSelect = (zone: any) => {
        const toggled = selectedArea === zone.id ? null : zone.id;
        onSelectArea?.(toggled);
        // Backward compat for old GentleJournalForm
        if (onSelect) {
            onSelect(toggled ? zone : null);
        }
    };

    return (
        <div className="w-full flex flex-col items-center" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
            <div className="relative z-10 w-full max-w-md mx-auto pt-4 pb-12">
                <div className="relative flex justify-center">
                    <svg
                        viewBox="60 30 280 440"
                        className="w-full"
                        style={{ maxWidth: 380, maxHeight: 520, overflow: 'visible' }}
                        role="img"
                        aria-label="Human body map — tap a body area to explore"
                    >
                        {/* Body silhouette */}
                        <path d={BODY_PATH} fill="none" stroke="var(--border-subtle)" strokeWidth="1.5" strokeLinejoin="round" />
                        <path d={BODY_PATH} fill="url(#bodyGradient)" opacity="0.3" />

                        <defs>
                            <radialGradient id="bodyGradient" cx="50%" cy="40%" r="60%">
                                <stop offset="0%" stopColor="var(--accent-primary-muted)" />
                                <stop offset="100%" stopColor="var(--bg-surface)" />
                            </radialGradient>

                            {/* Glow filters for each zone */}
                            {BODY_ZONES.map((zone) => (
                                <filter key={`glow-${zone.id}`} id={`glow-${zone.id}`} x="-50%" y="-50%" width="200%" height="200%">
                                    <feGaussianBlur stdDeviation="6" result="blur" />
                                    <feFlood floodColor={zone.color} floodOpacity="0.4" />
                                    <feComposite in2="blur" operator="in" />
                                    <feMerge>
                                        <feMergeNode />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                            ))}
                        </defs>

                        {/* Zone hotspots */}
                        {BODY_ZONES.map((zone, i) => {
                            const isSelected = selectedArea === zone.id;
                            const isOther = selectedArea && selectedArea !== zone.id;
                            const isPreHighlighted = activeAreas.includes(zone.id);

                            return (
                                <g key={zone.id}>
                                    {/* Invisible large tap target */}
                                    <circle
                                        cx={zone.cx} cy={zone.cy} r={Math.max(zone.r, 30)}
                                        fill="transparent"
                                        style={{ cursor: "pointer" }}
                                        onClick={() => handleSelect(zone)}
                                        role="button"
                                        aria-label={`${zone.label}: ${zone.description}`}
                                        tabIndex={0}
                                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleSelect(zone); }}
                                    />

                                    {/* Pulsing outer ring (idle / pre-highlighted) */}
                                    {!isSelected && (
                                        <circle cx={zone.cx} cy={zone.cy} r={14}
                                            fill="none"
                                            stroke={isPreHighlighted ? zone.color : zone.color}
                                            strokeWidth={isPreHighlighted ? 2 : 1.5}
                                            opacity={isPreHighlighted ? 0.7 : 0.4}
                                        >
                                            <animate attributeName="r" values="14;20;14" dur={`${3 + i * 0.3}s`} repeatCount="indefinite" />
                                            <animate attributeName="opacity" values={isPreHighlighted ? "0.7;0.3;0.7" : "0.4;0.1;0.4"} dur={`${3 + i * 0.3}s`} repeatCount="indefinite" />
                                        </circle>
                                    )}

                                    {/* Main dot */}
                                    <circle
                                        cx={zone.cx} cy={zone.cy} r={isSelected ? 16 : 10}
                                        fill={isSelected ? zone.color : "var(--text-muted)"}
                                        stroke={isSelected ? zone.color : "var(--border-subtle)"}
                                        strokeWidth={isSelected ? 2 : 1.5}
                                        opacity={isOther ? 0.6 : 1}
                                        filter={isSelected ? `url(#glow-${zone.id})` : "none"}
                                        style={{ cursor: "pointer", transition: "all 0.4s ease" }}
                                        onClick={() => handleSelect(zone)}
                                    />

                                    {/* Inner bright center */}
                                    {isSelected && (
                                        <circle cx={zone.cx} cy={zone.cy} r={5} fill="white" opacity="0.5">
                                            <animate attributeName="opacity" values="0.5;0.2;0.5" dur="2s" repeatCount="indefinite" />
                                        </circle>
                                    )}

                                    {/* Label */}
                                    <text
                                        x={zone.cx + zone.labelOffset.x}
                                        y={zone.cy + zone.labelOffset.y + 1}
                                        textAnchor={zone.labelOffset.x > 0 ? "start" : "end"}
                                        style={{
                                            fontSize: isSelected ? 14 : 12,
                                            fontWeight: isSelected ? 700 : 500,
                                            fill: isSelected ? zone.color : isOther ? "var(--text-disabled)" : "var(--text-primary)",
                                            fontFamily: "Georgia, serif",
                                            cursor: "pointer",
                                            transition: "all 0.4s ease",
                                            letterSpacing: "0.03em",
                                        }}
                                        onClick={() => handleSelect(zone)}
                                    >
                                        {zone.label}
                                    </text>

                                    {/* Connecting line */}
                                    <line
                                        x1={zone.cx + (zone.labelOffset.x > 0 ? 18 : -18)}
                                        y1={zone.cy + zone.labelOffset.y}
                                        x2={zone.cx + zone.labelOffset.x + (zone.labelOffset.x > 0 ? -4 : 4)}
                                        y2={zone.cy + zone.labelOffset.y}
                                        stroke={isSelected ? zone.color : isOther ? "var(--text-disabled)" : "var(--text-muted)"}
                                        strokeWidth="1"
                                        strokeDasharray={isSelected ? "none" : "3,3"}
                                        style={{ transition: "all 0.4s ease" }}
                                    />
                                </g>
                            );
                        })}
                    </svg>
                </div>

                {/* Insight Card — from old version + new micro-intervention support */}
                <AnimatePresence>
                    {selectedZone && (
                        <motion.div
                            key={selectedZone.id}
                            variants={fadeIn}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="space-y-4"
                            style={{ marginTop: 24 }}
                        >
                            <div style={{ padding: "18px 22px", borderRadius: 20, background: "var(--bg-surface)", border: `1.5px solid ${selectedZone.color}30` }}>
                                <h3 style={{ fontSize: 20, fontWeight: 600, color: selectedZone.color, marginBottom: 4 }}>{selectedZone.label}</h3>
                                <p style={{ fontSize: 14, color: "var(--text-muted)" }}>{selectedZone.description}</p>
                            </div>

                            <div style={{ padding: "16px 20px", borderRadius: 16, background: "var(--bg-surface)", borderLeft: `3px solid ${selectedZone.color}40`, opacity: 0.8 }}>
                                <p style={{ fontSize: 15, color: "var(--text-primary)", fontStyle: "italic", lineHeight: 1.7 }}>
                                    {selectedZone.insight}
                                </p>
                            </div>

                            {/* Micro-intervention from matched felt experiences */}
                            {activeCategories.filter(fe => fe.bodyAreas.includes(selectedZone.id)).length > 0 ? (
                                activeCategories.filter(fe => fe.bodyAreas.includes(selectedZone.id)).map((fe, idx) => (
                                    <div key={idx} style={{ padding: "20px", borderRadius: 18, background: "var(--accent-secondary-muted)", border: "1px solid var(--accent-secondary-border)" }}>
                                        <div className="flex items-center gap-2" style={{ marginBottom: 8 }}>
                                            <span style={{ fontSize: 15 }}>💚</span>
                                            <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--accent-secondary)", opacity: 0.8 }}>
                                                A gentle suggestion
                                            </span>
                                        </div>
                                        <p style={{ fontSize: 15, color: "var(--accent-secondary)", lineHeight: 1.7 }}>
                                            {fe.microIntervention.instruction}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <div style={{ padding: "20px", borderRadius: 18, background: "var(--accent-secondary-muted)", border: "1px solid var(--accent-secondary-border)" }}>
                                    <div className="flex items-center gap-2" style={{ marginBottom: 8 }}>
                                        <span style={{ fontSize: 15 }}>💚</span>
                                        <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--accent-secondary)", opacity: 0.8 }}>
                                            A gentle suggestion
                                        </span>
                                    </div>
                                    <p style={{ fontSize: 15, color: "var(--accent-secondary)", lineHeight: 1.7 }}>
                                        {selectedZone.helps}
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {!selectedArea && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-center"
                        style={{ fontSize: 13, color: "var(--text-disabled)", marginTop: 24, fontStyle: "italic" }}
                    >
                        Each glowing point on the body is tappable
                    </motion.p>
                )}
            </div>
        </div>
    );
}
