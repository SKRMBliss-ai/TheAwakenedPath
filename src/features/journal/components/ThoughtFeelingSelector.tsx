import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/*
  ═══════════════════════════════════════════════════════════════
  COMBINED THOUGHT / FEELING SELECTOR
  ═══════════════════════════════════════════════════════════════
  
  9 "Felt Experience" categories from the clinical table.
  Each contains 3-4 specific thoughts + auto-mapped emotions.
  
  Flow: Tap category → see thoughts → tap what resonates
  Emotions are automatically captured from the category.
  
  New 3-step journal: Thought/Feeling → Body → Witness
  ═══════════════════════════════════════════════════════════════
*/

import { FELT_EXPERIENCES } from "../../../data/feltExperiences";
import { EMOTION_COLORS } from "../../../data/emotionColors";

// ─── ANIMATIONS ──────────────────────────────────────────────

const fadeIn: any = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 1, 0.5, 1] } },
};
const expand: any = {
    hidden: { height: 0, opacity: 0 },
    visible: { height: "auto", opacity: 1, transition: { duration: 0.4, ease: [0.25, 1, 0.5, 1] } },
    exit: { height: 0, opacity: 0, transition: { duration: 0.25 } },
};
const stagger: any = { visible: { transition: { staggerChildren: 0.04 } } };
const pop: any = {
    hidden: { opacity: 0, scale: 0.92 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: [0.25, 1, 0.5, 1] } },
};

// ─── MAIN COMPONENT ─────────────────────────────────────────

export interface ThoughtFeelingSelectorProps {
    selectedThoughts?: string[];
    onSelectionChange?: (thoughts: string[], emotions: string[]) => void;
}

export function ThoughtFeelingSelector({
    selectedThoughts = [],
    onSelectionChange,
}: ThoughtFeelingSelectorProps) {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    // Derive selected emotions from selected thoughts
    const selectedEmotions = (() => {
        const emoSet = new Set<string>();
        FELT_EXPERIENCES.forEach((fe) => {
            if (fe.thoughts.some((t) => selectedThoughts.includes(t))) {
                fe.emotions.forEach((e) => emoSet.add(e));
            }
        });
        return [...emoSet];
    })();

    const toggleThought = (thought: string) => {
        const nextThoughts = selectedThoughts.includes(thought)
            ? selectedThoughts.filter((t) => t !== thought)
            : [...selectedThoughts, thought];

        const nextEmotions = (() => {
            const emoSet = new Set<string>();
            FELT_EXPERIENCES.forEach((fe) => {
                if (fe.thoughts.some((t) => nextThoughts.includes(t))) {
                    fe.emotions.forEach((e) => emoSet.add(e));
                }
            });
            return [...emoSet];
        })();

        onSelectionChange?.(nextThoughts, nextEmotions);
    };

    const hasSelectionIn = (fe: typeof FELT_EXPERIENCES[0]) =>
        fe.thoughts.some((t) => selectedThoughts.includes(t));

    const countIn = (fe: typeof FELT_EXPERIENCES[0]) =>
        fe.thoughts.filter((t) => selectedThoughts.includes(t)).length;

    return (
        <div className="space-y-3">
            {FELT_EXPERIENCES.map((fe) => {
                const isOpen = expandedId === fe.id;
                const hasSel = hasSelectionIn(fe);
                const count = countIn(fe);

                return (
                    <motion.div key={fe.id} variants={fadeIn}>
                        {/* Category card */}
                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setExpandedId(isOpen ? null : fe.id)}
                            style={{
                                display: "flex", alignItems: "center", gap: 14,
                                width: "100%", padding: "16px 18px",
                                borderRadius: isOpen ? "18px 18px 0 0" : 18,
                                border: `1.5px solid ${hasSel ? fe.color + "50" : isOpen ? fe.color + "30" : "var(--border-subtle)"}`,
                                borderBottom: isOpen ? `1px solid ${fe.color}20` : undefined,
                                background: hasSel ? fe.color + "10" : isOpen ? fe.color + "06" : "var(--bg-surface)",
                                cursor: "pointer", textAlign: "left",
                                minHeight: 64, transition: "all 0.3s ease",
                            }}
                        >
                            <span style={{ fontSize: 28, lineHeight: 1, flexShrink: 0 }}>{fe.emoji}</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <span style={{
                                    fontSize: 15, fontWeight: 600, display: "block",
                                    color: hasSel ? fe.color : isOpen ? "var(--text-primary)" : "var(--text-secondary)",
                                }}>{fe.label}</span>
                                <span style={{
                                    fontSize: 12, display: "block", marginTop: 2,
                                    color: hasSel && !isOpen
                                        ? fe.color + "80"
                                        : "var(--text-muted)",
                                }}>
                                    {hasSel && !isOpen ? `${count} selected` : fe.subtitle}
                                </span>
                            </div>

                            {hasSel && !isOpen ? (
                                <div style={{
                                    width: 24, height: 24, borderRadius: "50%",
                                    background: fe.color + "20", border: `2px solid ${fe.color}50`,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    flexShrink: 0,
                                }}>
                                    <span style={{ color: fe.color, fontSize: 12, fontWeight: 700 }}>✓</span>
                                </div>
                            ) : (
                                <motion.span
                                    animate={{ rotate: isOpen ? 180 : 0 }}
                                    transition={{ duration: 0.3 }}
                                    style={{
                                        fontSize: 15, flexShrink: 0,
                                        color: isOpen ? fe.color + "70" : "var(--text-muted)",
                                    }}
                                >▾</motion.span>
                            )}
                        </motion.button>

                        {/* Expanded thoughts */}
                        <AnimatePresence>
                            {isOpen && (
                                <motion.div
                                    variants={expand} initial="hidden" animate="visible" exit="exit"
                                    style={{
                                        overflow: "hidden",
                                        borderRadius: "0 0 18px 18px",
                                        border: `1.5px solid ${fe.color}25`,
                                        borderTop: "none",
                                        background: fe.color + "05",
                                    }}
                                >
                                    {/* Auto-tagged emotions */}
                                    <div style={{
                                        padding: "10px 14px 6px",
                                        display: "flex", flexWrap: "wrap", gap: 6,
                                    }}>
                                        <span style={{
                                            fontSize: 10, fontWeight: 600, letterSpacing: "0.06em",
                                            textTransform: "uppercase", color: fe.color + "50",
                                            lineHeight: "22px",
                                        }}>FEELINGS:</span>
                                        {fe.emotions.map((e) => {
                                            const emotionColor = EMOTION_COLORS[e] || fe.color;
                                            return (
                                                <span key={e} style={{
                                                    padding: "2px 10px", borderRadius: 8, fontSize: 11,
                                                    background: emotionColor + "15",
                                                    border: `1px solid ${emotionColor}30`,
                                                    color: emotionColor,
                                                    fontWeight: 500,
                                                }}>{e}</span>
                                            );
                                        })}
                                    </div>

                                    {/* Thought checkboxes */}
                                    <motion.div
                                        variants={stagger} initial="hidden" animate="visible"
                                        style={{ padding: "6px 12px 14px" }}
                                        className="flex flex-col gap-2"
                                    >
                                        {fe.thoughts.map((thought) => {
                                            const sel = selectedThoughts.includes(thought);
                                            return (
                                                <motion.button
                                                    key={thought} variants={pop}
                                                    whileTap={{ scale: 0.97 }}
                                                    onClick={() => toggleThought(thought)}
                                                    style={{
                                                        display: "flex", alignItems: "center", gap: 12,
                                                        width: "100%", padding: "13px 14px",
                                                        borderRadius: 14,
                                                        border: `1.5px solid ${sel ? fe.color + "45" : "var(--border-subtle)"}`,
                                                        background: sel ? fe.color + "12" : "var(--bg-surface)",
                                                        cursor: "pointer", textAlign: "left",
                                                        minHeight: 50, transition: "all 0.2s ease",
                                                    }}
                                                >
                                                    <div style={{
                                                        width: 22, height: 22, borderRadius: 7, flexShrink: 0,
                                                        border: `2px solid ${sel ? fe.color + "60" : "var(--border-subtle)"}`,
                                                        background: sel ? fe.color + "18" : "transparent",
                                                        display: "flex", alignItems: "center", justifyContent: "center",
                                                        transition: "all 0.2s",
                                                    }}>
                                                        {sel && (
                                                            <motion.span
                                                                initial={{ scale: 0 }} animate={{ scale: 1 }}
                                                                style={{ color: fe.color, fontSize: 11, fontWeight: 700 }}
                                                            >✓</motion.span>
                                                        )}
                                                    </div>
                                                    <span style={{
                                                        fontSize: 15, fontFamily: "Georgia, serif",
                                                        color: sel ? fe.color : "var(--text-primary)",
                                                        lineHeight: 1.4, fontStyle: "italic",
                                                    }}>"{thought}"</span>
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

            {/* Selection summary */}
            <AnimatePresence>
                {selectedThoughts.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        style={{
                            padding: "16px 18px", borderRadius: 16,
                            background: "var(--bg-surface)",
                            border: "1px solid var(--border-subtle)",
                            marginTop: 8,
                        }}
                    >
                        <p style={{
                            fontSize: 10, fontWeight: 600, letterSpacing: "0.06em",
                            textTransform: "uppercase", color: "var(--text-muted)",
                            marginBottom: 8,
                        }}>YOUR PATTERN</p>

                        {/* Thoughts */}
                        <div style={{ marginBottom: 10 }}>
                            {selectedThoughts.map((t) => (
                                <p key={t} style={{
                                    fontSize: 14, fontFamily: "Georgia, serif",
                                    fontStyle: "italic", color: "var(--text-primary)",
                                    lineHeight: 1.5,
                                }}>"{t}"</p>
                            ))}
                        </div>

                        {/* Auto-tagged emotions */}
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                            <span style={{
                                fontSize: 10, fontWeight: 600, letterSpacing: "0.06em",
                                textTransform: "uppercase", color: "var(--text-muted)",
                                lineHeight: "24px",
                            }}>CREATING:</span>
                            {selectedEmotions.map((e) => {
                                const emotionColor = EMOTION_COLORS[e] || "var(--accent-primary)";
                                return (
                                    <span key={e} style={{
                                        padding: "3px 12px", borderRadius: 10, fontSize: 12, fontWeight: 500,
                                        background: emotionColor + "15",
                                        border: `1px solid ${emotionColor}40`,
                                        color: emotionColor,
                                    }}>{e}</span>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
