import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "../../../lib/utils";

const HUMAN_DESCRIPTIONS: Record<string, string> = {
    "Feeling Rejected or Unseen": "When you feel invisible or unimportant to others",
    "Doubting Myself": "When you question whether you're good enough",
    "Worry & Overwhelm": "When the future feels like too much to handle",
    "Frustration": "When things aren't going the way you need",
    "Feeling Behind or Not Enough": "When everyone else seems further ahead",
    "Need for Control": "When uncertainty feels unbearable",
    "People-Pleasing Mode": "When you lose yourself trying to keep others happy",
    "Emotional Numbness": "When you can't feel anything at all",
    "Inner Critic Attack": "When the voice inside is harsh and relentless",
};

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
    onExpandCategory?: (categoryLabel: string, thoughts: string[]) => void;
}

export function ThoughtFeelingSelector({
    selectedThoughts = [],
    onSelectionChange,
    onExpandCategory,
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

    const [customInputs, setCustomInputs] = useState<Record<string, string>>({});
    
    const handleAddCustom = (feId: string) => {
        const text = customInputs[feId];
        if (!text || !text.trim()) return;
        
        const fe = FELT_EXPERIENCES.find(f => f.id === feId);
        if (fe) {
            const cleanText = text.trim();
            if (!fe.thoughts.includes(cleanText)) {
                fe.thoughts.push(cleanText);
            }
            if (!selectedThoughts.includes(cleanText)) {
                toggleThought(cleanText);
            }
            setCustomInputs(prev => ({ ...prev, [feId]: "" }));
        }
    };

    const hasSelectionIn = (fe: typeof FELT_EXPERIENCES[0]) =>
        fe.thoughts.some((t) => selectedThoughts.includes(t));

    const countIn = (fe: typeof FELT_EXPERIENCES[0]) =>
        fe.thoughts.filter((t) => selectedThoughts.includes(t)).length;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {FELT_EXPERIENCES.map((fe, idx) => {
                const isOpen = expandedId === fe.id;
                const hasSel = hasSelectionIn(fe);
                const count = countIn(fe);
                const isLastItem = idx === FELT_EXPERIENCES.length - 1;

                return (
                    <motion.div 
                        key={fe.id} 
                        variants={fadeIn} 
                        className={cn(isLastItem && !isOpen ? "md:col-span-2 lg:col-span-1" : "")}
                        style={{ ...(isOpen ? { gridColumn: '1 / -1' } : {}) }}
                    >
                        <motion.div
                            className={cn(
                                "rounded-[16px] transition-all duration-300 relative overflow-hidden",
                                isOpen 
                                    ? "bg-[var(--bg-surface-hover)] border-[var(--border-default)] border" 
                                    : "bg-[var(--bg-surface)] border-[var(--border-subtle)] border hover:border-[var(--border-default)]"
                            )}
                            style={{
                                boxShadow: isOpen 
                                    ? 'inset 0 1px 0 rgba(255,255,255,0.04), 0 4px 12px rgba(0,0,0,0.15)'
                                    : 'inset 0 1px 0 rgba(255,255,255,0.02)',
                                borderLeftWidth: hasSel && !isOpen ? 3 : 1.5,
                                borderLeftColor: hasSel && !isOpen ? fe.color : undefined,
                            }}
                        >
                            {!isOpen && count > 0 && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white z-10 shadow-sm"
                                    style={{ background: fe.color }}
                                >
                                    {count}
                                </motion.div>
                            )}

                            <div className={cn("flex", isOpen ? "flex-col sm:flex-row" : "flex-col")}>
                                {/* Header content */}
                                <div 
                                    className={cn(
                                        "p-3 sm:p-3.5 flex flex-col justify-center cursor-pointer transition-all w-full",
                                        isOpen ? "sm:w-[40%] sm:border-r sm:border-[var(--border-subtle)]" : ""
                                    )}
                                    onClick={() => {
                                        const becomingOpen = !isOpen;
                                        setExpandedId(becomingOpen ? fe.id : null);
                                        if (becomingOpen && onExpandCategory) {
                                            onExpandCategory(fe.label, fe.thoughts);
                                        }
                                    }}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <span className="text-[24px] flex-shrink-0">{fe.emoji}</span>
                                        <div className="flex-1 min-w-0">
                                            <span style={{
                                                fontSize: 18, fontWeight: 600, display: "block",
                                                color: hasSel ? fe.color : "var(--text-primary)",
                                            }}>{fe.label}</span>
                                            <span style={{
                                                fontSize: 14, display: "block", marginTop: 2,
                                                color: "var(--text-muted)", lineHeight: 1.3
                                            }}>
                                                {HUMAN_DESCRIPTIONS[fe.label] || fe.subtitle}
                                            </span>
                                            
                                            {/* Emotion Pills inside header, only when expanded */}
                                            {isOpen && fe.emotions.length > 0 && (
                                                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                                                    <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)] mt-0.5">
                                                        Auto-tagged:
                                                    </span>
                                                    {fe.emotions.map((emotion, i) => (
                                                        <motion.span
                                                            key={emotion}
                                                            initial={{ opacity: 0, scale: 0.9, y: 4 }}
                                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                                            transition={{ delay: i * 0.08 }}
                                                            className="text-[10px] px-2 py-0.5 rounded-full"
                                                            style={{ 
                                                                background: `${fe.color}15`,
                                                                border: `1px solid ${fe.color}25`,
                                                                color: fe.color,
                                                            }}
                                                        >
                                                            {emotion}
                                                        </motion.span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Expand / Collapse Icon */}
                                        <motion.div
                                            animate={{ rotate: isOpen ? 180 : 0 }}
                                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                            className={cn(
                                                "w-6 h-6 rounded-full border border-[var(--border-subtle)] flex items-center justify-center flex-shrink-0 ml-2",
                                                isOpen ? "sm:hidden" : ""
                                            )}
                                        >
                                            <ChevronDown size={12} className="text-[var(--text-muted)]" />
                                        </motion.div>
                                    </div>
                                </div>

                                {/* Expanded Body */}
                                <AnimatePresence>
                                    {isOpen && (
                                        <motion.div
                                            variants={expand} initial="hidden" animate="visible" exit="exit"
                                            className={cn(
                                                "overflow-hidden w-full",
                                                isOpen ? "sm:w-[60%]" : ""
                                            )}
                                            style={{ background: fe.color + "03" }}
                                        >
                                            <motion.div
                                                variants={stagger} initial="hidden" animate="visible"
                                                className="p-3 sm:p-4 flex flex-wrap gap-2"
                                            >
                                                {fe.thoughts.map((thought) => {
                                                    const sel = selectedThoughts.includes(thought);
                                                    return (
                                                        <motion.button
                                                            key={thought} variants={pop}
                                                            whileTap={{ scale: 0.96 }}
                                                            animate={sel ? { scale: [1, 1.04, 1] } : {}}
                                                            transition={{ duration: 0.2 }}
                                                            onClick={() => toggleThought(thought)}
                                                            className={cn(
                                                                "px-4 py-3 rounded-xl text-base font-serif transition-all duration-200 border flex items-center shadow-sm text-left leading-tight",
                                                                sel
                                                                    ? "font-medium"
                                                                    : "hover:border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-subtle)]"
                                                            )}
                                                            style={{
                                                                background: sel ? fe.color + "15" : undefined,
                                                                borderColor: sel ? fe.color + "60" : undefined,
                                                                color: sel ? fe.color : "var(--text-primary)"
                                                            }}
                                                        >
                                                            {sel && <span className="mr-1.5 font-bold" style={{ color: fe.color }}>✓</span>}
                                                            "{thought}"
                                                        </motion.button>
                                                    );
                                                })}

                                                {/* Custom Thought Input */}
                                                <div className="relative w-full mt-1">
                                                    <input
                                                        type="text"
                                                        placeholder='Enter your own...'
                                                        value={customInputs[fe.id] || ""}
                                                        onChange={(e) => setCustomInputs(prev => ({ ...prev, [fe.id]: e.target.value }))}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                handleAddCustom(fe.id);
                                                            }
                                                        }}
                                                        style={{
                                                            width: "100%", padding: "12px 36px 12px 16px",
                                                            borderRadius: 12,
                                                            border: `1.5px dashed var(--border-subtle)`,
                                                            background: "var(--bg-surface)",
                                                            color: "var(--text-primary)",
                                                            fontSize: 15, fontFamily: "var(--font-serif)", fontStyle: "italic",
                                                            outline: "none",
                                                            transition: "all 0.3s"
                                                        }}
                                                        onFocus={(e) => {
                                                            e.target.style.borderColor = fe.color;
                                                            e.target.style.background = fe.color + "08";
                                                        }}
                                                        onBlur={(e) => {
                                                            e.target.style.borderColor = "var(--border-subtle)";
                                                            e.target.style.background = "var(--bg-surface)";
                                                        }}
                                                    />
                                                    <AnimatePresence>
                                                        {(customInputs[fe.id] && customInputs[fe.id].trim().length > 0) && (
                                                            <motion.button
                                                                key="add-btn"
                                                                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                                                                onClick={(e) => { e.preventDefault(); handleAddCustom(fe.id); }}
                                                                className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center font-bold"
                                                                style={{ 
                                                                    background: fe.color, color: "#fff", 
                                                                    border: "none", borderRadius: "50%", 
                                                                    width: 24, height: 24, 
                                                                    cursor: "pointer", paddingBottom: 2
                                                                }}
                                                            >
                                                                +

                                                            </motion.button>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </motion.div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
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
                                    fontSize: 16, fontFamily: "var(--font-serif)",
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
