import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../../theme/ThemeSystem';
import type { FeltExperience } from '../../../data/feltExperiences';

export const BODY_ZONES = [
    {
        id: "Head",
        label: "Head & Forehead",
        cx: 200, cy: 72, r: 34,
        labelOffset: { x: 90, y: 0 },
    },
    {
        id: "Throat & Jaw",
        label: "Throat & Jaw",
        cx: 200, cy: 132, r: 20,
        labelOffset: { x: -105, y: 0 },
    },
    {
        id: "Shoulders",
        label: "Shoulders",
        cx: 200, cy: 168, r: 50,
        labelOffset: { x: 100, y: 0 },
    },
    {
        id: "Chest & Heart",
        label: "Chest & Heart",
        cx: 200, cy: 220, r: 38,
        labelOffset: { x: -110, y: 0 },
    },
    {
        id: "Stomach & Gut",
        label: "Stomach & Gut",
        cx: 200, cy: 290, r: 35,
        labelOffset: { x: 105, y: 0 },
    },
    {
        id: "Back",
        label: "Back",
        cx: 200, cy: 250, r: 30,
        labelOffset: { x: -100, y: 20 },
    },
    {
        id: "Limbs & Whole Body",
        label: "Limbs & Whole Body",
        cx: 200, cy: 410, r: 35,
        labelOffset: { x: 100, y: 0 },
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
  C 175 180, 185 180, 200 180
  C 215 180, 225 180, 235 178
  L 240 175
  L 245 180
  L 285 218
  C 292 222, 297 218, 295 210
  L 282 155
  C 280 145, 270 138, 260 135
  L 215 115
  C 210 112, 200 108, 200 108
  Z
  M 165 178
  C 165 240, 175 300, 200 300
  C 225 300, 235 240, 235 178
  L 200 180
  Z
  M 200 300
  C 180 300, 175 310, 170 330
  C 165 355, 160 400, 160 440
  C 160 460, 170 470, 180 470
  C 190 470, 195 460, 195 440
  L 200 340
  L 205 440
  C 205 460, 210 470, 220 470
  C 230 470, 240 460, 240 440
  C 240 400, 235 355, 230 330
  C 225 310, 220 300, 200 300
  Z
`;

interface BodyMapProps {
    activeAreas?: string[];
    selectedArea: string | null;
    onSelectArea?: (areaId: string) => void;
    /** @deprecated Use onSelectArea instead */
    onSelect?: (areaId: string) => void;
    activeCategories?: FeltExperience[];
}

export function BodyMapSelector({
    activeAreas = [],
    selectedArea,
    onSelectArea,
    onSelect,
    activeCategories = []
}: BodyMapProps) {
    const { theme } = useTheme();
    const handleSelect = (id: string) => { onSelectArea?.(id); onSelect?.(id); };

    return (
        <div className="flex flex-col items-center justify-center w-full">
            <div className="relative w-full max-w-sm h-[500px]">
                <svg
                    viewBox="0 0 400 500"
                    className="w-full h-full drop-shadow-2xl"
                    style={{ vectorEffect: "non-scaling-stroke" }}
                >
                    {/* Base Silhouette */}
                    <path
                        d={BODY_PATH}
                        fill="var(--bg-surface)"
                        stroke="var(--border-glass)"
                        strokeWidth="1.5"
                        className="transition-all duration-700 pointer-events-none"
                    />

                    {/* Zones */}
                    {BODY_ZONES.map((zone) => {
                        const isSelected = selectedArea === zone.id;
                        const isPreHighlighted = activeAreas.includes(zone.id);

                        return (
                            <g key={zone.id}>
                                {/* Connecting Lines */}
                                {(isSelected || isPreHighlighted) && (
                                    <motion.line
                                        initial={{ pathLength: 0, opacity: 0 }}
                                        animate={{ pathLength: 1, opacity: 1 }}
                                        x1={zone.cx}
                                        y1={zone.cy}
                                        x2={zone.cx + zone.labelOffset.x * 0.7}
                                        y2={zone.cy + zone.labelOffset.y * 0.7}
                                        stroke={isSelected ? theme.accentPrimary : theme.textMuted}
                                        strokeWidth="1"
                                        strokeDasharray="4 4"
                                        className="pointer-events-none"
                                    />
                                )}

                                {/* Interactive Tappable Circle */}
                                <motion.circle
                                    cx={zone.cx}
                                    cy={zone.cy}
                                    r={zone.r}
                                    fill="transparent"
                                    stroke={isSelected ? theme.accentPrimary : (isPreHighlighted ? theme.accentSecondary + "40" : "transparent")}
                                    strokeWidth="2"
                                    className="cursor-pointer transition-all duration-300"
                                    whileHover={{ scale: 1.05 }}
                                    onClick={() => handleSelect(zone.id)}
                                />

                                {/* Subdued Inner Glow/Pulse for Pre-highlighted areas */}
                                {isPreHighlighted && !isSelected && (
                                    <motion.circle
                                        cx={zone.cx}
                                        cy={zone.cy}
                                        r={zone.r - 2}
                                        fill={theme.accentSecondary + "10"}
                                        className="pointer-events-none"
                                        animate={{ r: [zone.r - 2, zone.r + 4, zone.r - 2], opacity: [0.3, 0.6, 0.3] }}
                                        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                                    />
                                )}

                                {/* Selected Core Glow */}
                                {isSelected && (
                                    <motion.circle
                                        cx={zone.cx}
                                        cy={zone.cy}
                                        r={zone.r}
                                        fill={theme.accentPrimary + "25"}
                                        filter="blur(16px)"
                                        className="pointer-events-none"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1.2 }}
                                    />
                                )}

                                {/* Label (Visible on select or pre-highlight) */}
                                {(isSelected || isPreHighlighted) && (
                                    <motion.text
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        x={zone.cx + zone.labelOffset.x}
                                        y={zone.cy + zone.labelOffset.y}
                                        className="text-[10px] font-bold tracking-widest uppercase pointer-events-none"
                                        fill={isSelected ? theme.accentPrimary : theme.textSecondary}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                    >
                                        {zone.label}
                                    </motion.text>
                                )}
                            </g>
                        );
                    })}
                </svg>
            </div>

            {/* Insight Card when Selected */}
            <AnimatePresence>
                {selectedArea && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        className="w-full mt-6"
                    >
                        {activeCategories.filter(fe => fe.bodyAreas.includes(selectedArea)).map((fe, idx) => (
                            <div key={idx} className="p-5 rounded-2xl mb-4" style={{
                                background: theme.bgSurface,
                                border: `1.5px solid ${theme.borderGlass}`,
                                boxShadow: theme.shadow
                            }}>
                                <div className="mb-3">
                                    <span style={{ fontSize: 10, fontWeight: 700, color: theme.textSecondary, letterSpacing: '0.05em' }} className="uppercase">Sensations</span>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {fe.sensations.map(s => (
                                            <span key={s} style={{
                                                background: theme.bgInput,
                                                border: `1px solid ${theme.borderSubtle}`,
                                                color: theme.textPrimary
                                            }} className="px-3 py-1 text-sm rounded-xl">
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div style={{
                                    background: theme.quoteBg,
                                    borderLeft: `2px solid ${fe.color || theme.accentSecondary}`,
                                    color: theme.textSecondary
                                }} className="p-3 mt-4 rounded-r-xl text-sm italic">
                                    <span className="mr-2">💚 A gentle suggestion:</span>
                                    {fe.microIntervention.instruction}
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
