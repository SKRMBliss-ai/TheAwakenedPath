import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../theme/ThemeSystem';
import type { FeltExperience } from '../data/feltExperiences';
import { EMOTION_COLORS } from '../data/emotionColors';
import { ChevronDown } from 'lucide-react';

// ─── ANIMATION VARIANTS ─────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fadeUp: any = {
    hidden: { opacity: 0, y: 16 },
    visible: {
        opacity: 1, y: 0,
        transition: { duration: 0.55, ease: [0.25, 1, 0.5, 1] },
    },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const stagger: any = {
    visible: { transition: { staggerChildren: 0.18 } },
};

// ─── DISTORTION EXPLANATIONS ────────────────────────────────────────────────

const DISTORTION_EXPLANATIONS: Record<string, string> = {
    "Mind-reading / Personalizing": "assuming you know what others think without evidence, and taking events personally when they may not be about you.",
    "Fortune-telling / Labeling": "predicting negative outcomes before they happen, and assigning a fixed identity to yourself based on a single moment.",
    "Catastrophizing": "amplifying a difficulty into the worst possible outcome, magnifying the threat beyond what the evidence supports.",
    "Should-statements": "holding rigid rules about how things must be — creating frustration when reality doesn't follow.",
    "Social comparison / Overgeneralization": "measuring your worth against others' visible highlights, and drawing sweeping conclusions from limited events.",
    "Uncertainty intolerance": "treating 'not knowing' as danger, and seeking control to avoid the discomfort of unpredictability.",
    "Emotional reasoning": "using how you feel as evidence for what is true — 'I feel afraid, therefore it must be dangerous.'",
    "Avoidance / Dissociation": "when the system protects itself by dimming your feelings — a survival response, not a character flaw.",
    "Labeling / All-or-nothing thinking": "reducing a complex situation to a single harsh label, or seeing yourself in extremes — all good or all bad.",
};

const BODY_EMOJIS: Record<string, string> = {
    "Head": "🧠",
    "Throat & Jaw": "🗣️",
    "Shoulders": "🏋️",
    "Chest & Heart": "❤️",
    "Stomach & Gut": "🫁",
    "Back": "🦴",
    "Limbs & Whole Body": "🌿",
};

// ─── PROPS ───────────────────────────────────────────────────────────────────

interface WitnessStepProps {
    selectedThoughts: string[];
    selectedEmotions: string[];
    selectedBodyArea: string;
    activeCategories: FeltExperience[];
}

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export function WitnessStep({
    selectedThoughts,
    selectedEmotions,
    selectedBodyArea,
    activeCategories,
}: WitnessStepProps) {
    const { theme } = useTheme();
    const [showPhysNote, setShowPhysNote] = useState(false);

    // Pick the primary category — the one with the most selected thoughts
    const primaryCategory = activeCategories.reduce<FeltExperience | null>((best, fe) => {
        const count = fe.thoughts.filter(t => selectedThoughts.includes(t)).length;
        const bestCount = best ? best.thoughts.filter(t => selectedThoughts.includes(t)).length : -1;
        return count >= bestCount ? fe : best;
    }, null);

    const distortionKey = primaryCategory?.cognitiveDistortion ?? "";
    const distortionExplanation = DISTORTION_EXPLANATIONS[distortionKey] ?? "";
    const bodyEmoji = BODY_EMOJIS[selectedBodyArea] ?? "🫀";

    return (
        <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="space-y-6 px-1"
        >
            {/* ── HEADER ── */}
            <motion.div variants={fadeUp} className="text-center mb-8">
                <p className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: theme.accentSecondary }}>
                    The Witness
                </p>
                <h2
                    className="text-2xl font-serif"
                    style={{ color: theme.textPrimary, fontStyle: 'italic', lineHeight: 1.45 }}
                >
                    Observe what arose.
                </h2>
            </motion.div>

            {/* ── SECTION A: Pattern Reveal ── */}
            <motion.div
                variants={fadeUp}
                className="rounded-2xl p-6"
                style={{
                    background: theme.bgSurface,
                    border: `1px solid ${theme.borderGlass}`,
                    backdropFilter: theme.blur,
                }}
            >
                <p className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: theme.textMuted }}>
                    A Pattern Arose
                </p>

                {/* Thoughts */}
                <div className="mb-5">
                    <p className="text-xs uppercase tracking-wider mb-2" style={{ color: theme.textMuted }}>
                        A thought arose…
                    </p>
                    <div className="space-y-2">
                        {selectedThoughts.map((t) => (
                            <p
                                key={t}
                                className="text-lg font-serif italic leading-relaxed pl-3"
                                style={{
                                    color: theme.textPrimary,
                                    borderLeft: `2px solid ${theme.accentPrimary}50`,
                                }}
                            >
                                "{t}"
                            </p>
                        ))}
                    </div>
                </div>

                {/* Emotions */}
                <div className="mb-5">
                    <p className="text-xs uppercase tracking-wider mb-2" style={{ color: theme.textMuted }}>
                        It created…
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {selectedEmotions.map((e) => {
                            const color = EMOTION_COLORS[e] || theme.accentPrimary;
                            return (
                                <span
                                    key={e}
                                    className="px-3 py-1 rounded-full text-sm font-medium"
                                    style={{
                                        background: color + "18",
                                        border: `1.5px solid ${color}40`,
                                        color,
                                    }}
                                >
                                    {e}
                                </span>
                            );
                        })}
                    </div>
                </div>

                {/* Body */}
                {selectedBodyArea && (
                    <div className="mb-5">
                        <p className="text-xs uppercase tracking-wider mb-2" style={{ color: theme.textMuted }}>
                            You felt it in your…
                        </p>
                        <p className="text-base font-semibold" style={{ color: theme.textPrimary }}>
                            <span aria-hidden className="mr-2">{bodyEmoji}</span>
                            {selectedBodyArea}
                        </p>
                    </div>
                )}

                {/* Witness invitation */}
                <div
                    className="rounded-xl p-4 mt-4"
                    style={{
                        background: theme.accentPrimaryMuted,
                        border: `1px solid ${theme.accentPrimaryBorder}`,
                    }}
                >
                    <p
                        className="text-base font-serif italic leading-relaxed"
                        style={{ color: theme.textSecondary, lineHeight: 1.8 }}
                    >
                        But notice…&nbsp;
                        <span style={{ color: theme.accentPrimary }}>
                            you are the one who was watching.
                        </span>
                        <br />
                        You are not the thought. You are the awareness in which the thought arose.
                    </p>
                </div>
            </motion.div>

            {/* ── SECTION B: Cognitive Distortion ── */}
            {primaryCategory && (
                <motion.div
                    variants={fadeUp}
                    className="rounded-2xl p-6"
                    style={{
                        background: theme.bgSurface,
                        border: `1px solid ${theme.borderGlass}`,
                        backdropFilter: theme.blur,
                    }}
                >
                    <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: theme.textMuted }}>
                        What Your Mind Was Doing
                    </p>

                    <div
                        className="rounded-xl px-4 py-3 mb-4"
                        style={{
                            background: theme.chipBg,
                            border: `1.5px solid ${primaryCategory.color}40`,
                        }}
                    >
                        <p className="font-semibold text-base mb-1" style={{ color: primaryCategory.color }}>
                            {primaryCategory.cognitiveDistortion}
                        </p>
                    </div>

                    <p className="text-base font-serif leading-relaxed" style={{ color: theme.textSecondary, lineHeight: 1.8 }}>
                        This pattern is called{' '}
                        <span className="font-semibold" style={{ color: theme.textPrimary }}>
                            {distortionKey.toLowerCase()}
                        </span>
                        {distortionExplanation ? ` — ${distortionExplanation}` : '.'}
                    </p>

                    <p className="text-sm mt-4" style={{ color: theme.textMuted, fontStyle: 'italic' }}>
                        This is not a flaw. It is a pattern the mind learned. And patterns can shift.
                    </p>
                </motion.div>
            )}

            {/* ── SECTION C: Micro-Intervention ── */}
            {primaryCategory && (
                <motion.div
                    variants={fadeUp}
                    className="rounded-2xl p-6"
                    style={{
                        background: theme.bgSurface,
                        borderLeft: `3px solid ${theme.accentSecondary}`,
                        border: `1px solid ${theme.borderGlass}`,
                        borderLeftWidth: '3px',
                        borderLeftColor: theme.accentSecondary,
                        backdropFilter: theme.blur,
                    }}
                >
                    <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: theme.accentSecondary }}>
                        💚 A Gentle Practice
                    </p>

                    <p
                        className="text-sm font-semibold mb-3"
                        style={{ color: theme.textPrimary }}
                    >
                        {primaryCategory.microIntervention.technique}
                    </p>

                    <p
                        className="text-base font-serif leading-relaxed"
                        style={{ color: theme.textSecondary, lineHeight: 1.8 }}
                    >
                        {primaryCategory.microIntervention.instruction}
                    </p>

                    {/* "Why this helps" expandable */}
                    {primaryCategory.physiologicalNote && (
                        <div className="mt-5">
                            <button
                                onClick={() => setShowPhysNote((v: boolean) => !v)}
                                className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider"
                                style={{ color: theme.textMuted }}
                            >
                                Why this helps
                                <motion.span animate={{ rotate: showPhysNote ? 180 : 0 }}>
                                    <ChevronDown className="w-4 h-4" />
                                </motion.span>
                            </button>

                            <AnimatePresence>
                                {showPhysNote && (
                                    <motion.p
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1, transition: { duration: 0.35, ease: [0.25, 1, 0.5, 1] } }}
                                        exit={{ height: 0, opacity: 0, transition: { duration: 0.2 } }}
                                        className="text-sm mt-3 font-serif italic"
                                        style={{ color: theme.textMuted, lineHeight: 1.7 }}
                                    >
                                        {primaryCategory.physiologicalNote}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </motion.div>
            )}
        </motion.div>
    );
}
