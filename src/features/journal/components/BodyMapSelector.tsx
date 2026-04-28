
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

interface BodyMapProps {
    activeAreas?: string[];
    selectedArea: string | null;
    onSelectArea?: (areaId: string | null) => void;
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const selectedZoneId = typeof selectedArea === 'object' ? (selectedArea as any)?.id : selectedArea;
    const selectedZone = BODY_ZONES.find(z => z.id === selectedZoneId) || null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleSelect = (zone: any) => {
        const toggled = selectedZoneId === zone.id ? null : zone.id;
        onSelectArea?.(toggled);
        if (onSelect) {
            onSelect(toggled ? zone : null);
        }
    };

    return (
        <div className="w-full flex flex-col items-center" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
            <div className="relative z-10 w-full max-w-4xl mx-auto pt-4 pb-4">
                <div className="relative flex justify-center mb-12">
                    <svg
                        viewBox="60 30 280 440"
                        className="w-full text-[var(--text-primary)] transition-all duration-700"
                        style={{ maxWidth: 420, maxHeight: 560, overflow: 'visible' }}
                        role="img"
                        aria-label="Human body map — tap a body area to explore"
                    >
                        <defs>
                            <radialGradient id="bodyGradient" cx="50%" cy="40%" r="60%">
                                <stop offset="0%" stopColor="var(--accent-primary-dim)" stopOpacity="0.6" />
                                <stop offset="60%" stopColor="#000" stopOpacity="0.2" />
                                <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                            </radialGradient>

                            <filter id="premium-glow" x="-50%" y="-50%" width="200%" height="200%">
                                <feGaussianBlur stdDeviation="5" result="blur" />
                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                        </defs>

                        {/* Body silhouette */}
                        <path d={BODY_PATH} fill="none" stroke="var(--border-subtle)" strokeWidth="1" strokeLinejoin="round" opacity="0.4" />
                        <path d={BODY_PATH} fill="url(#bodyGradient)" opacity="0.5" />

                        {/* Zone hotspots */}
                        {BODY_ZONES.map((zone, i) => {
                            const isSelected = selectedZoneId === zone.id;
                            const isOtherSelected = selectedZoneId && !isSelected;
                            const isActive = activeAreas.includes(zone.id) ||
                                (activeCategories && activeCategories.some((c: FeltExperience) => c.bodyAreas?.includes(zone.id)));

                            return (
                                <g key={zone.id} className="cursor-pointer outline-none group" onClick={() => handleSelect(zone)}>
                                    {/* Living Pulse Rings */}
                                    <circle cx={zone.cx} cy={zone.cy} r={12} fill="none" stroke={zone.color} strokeWidth="1" opacity={isSelected ? 0.8 : 0.3}>
                                        <animate attributeName="r" values="10;24;10" dur={`${4 + i * 0.4}s`} repeatCount="indefinite" />
                                        <animate attributeName="opacity" values="0.3;0;0.3" dur={`${4 + i * 0.4}s`} repeatCount="indefinite" />
                                    </circle>

                                    {/* Main dot */}
                                    <circle
                                        cx={zone.cx} cy={zone.cy} r={isSelected ? 14 : 7}
                                        fill={isSelected ? zone.color : isActive ? zone.color : "var(--border-subtle)"}
                                        className="transition-all duration-500 ease-out"
                                        style={{ 
                                            filter: isSelected || isActive ? 'url(#premium-glow)' : 'none',
                                            opacity: isOtherSelected ? 0.2 : 1
                                        }}
                                    />

                                    {/* Label */}
                                    <text
                                        x={zone.cx + zone.labelOffset.x}
                                        y={zone.cy + zone.labelOffset.y + 4}
                                        textAnchor={zone.labelOffset.x > 0 ? "start" : "end"}
                                        className="transition-all duration-500"
                                        style={{
                                            fontSize: isSelected ? 16 : 13,
                                            fontWeight: isSelected ? 800 : 700,
                                            fill: isSelected ? zone.color : 'var(--text-main)',
                                            fontFamily: "'Outfit', 'Inter', sans-serif",
                                            opacity: isOtherSelected ? 0.35 : 1,
                                            letterSpacing: '0',
                                        }}
                                    >
                                        {zone.label}
                                    </text>
                                </g>
                            );
                        })}
                    </svg>
                </div>

                <AnimatePresence mode="wait">
                    {selectedZone && (
                        <motion.div
                            key={selectedZone.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
                        >
                            <div className="rounded-[32px] p-8 sm:p-10 backdrop-blur-md shadow-lg"
                                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                                <h3 className="text-3xl sm:text-4xl font-serif font-bold mb-4" style={{ color: selectedZone.color }}>{selectedZone.label}</h3>
                                <p className="text-lg text-[var(--text-muted)] font-sans font-medium mb-8 pb-6" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                    {selectedZone.description}
                                </p>
                                <div className="space-y-8">
                                    <p className="text-xl sm:text-2xl italic font-serif">"{selectedZone.insight}"</p>
                                    <div className="p-6 rounded-[24px]" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-subtle)' }}>
                                        <p className="text-lg text-[var(--accent-secondary)] font-sans font-medium">{selectedZone.helps}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
