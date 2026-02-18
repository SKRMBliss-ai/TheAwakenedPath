import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── DESIGN TOKENS ────────────────────────────────────────────────
const tokens = {
    plum: "#0D0014",
    deep: "#160020",
    mid: "#2D1040",
    magenta: "#D16BA5",
    teal: "#ABCEC9",
    muted: "rgba(255,255,255,0.08)",
    border: "rgba(255,255,255,0.07)",
};

// ─── NOISE TEXTURE SVG (grain overlay) ────────────────────────────
const NoiseOverlay = () => (
    <svg style={{ position: "fixed", inset: 0, width: "100%", height: "100%", opacity: 0.03, pointerEvents: "none", zIndex: 100 }}>
        <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise)" />
    </svg>
);

// ─── SECTION LABEL ─────────────────────────────────────────────────
const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
        <div style={{ height: 1, width: 40, background: `linear-gradient(90deg, ${tokens.magenta}60, transparent)` }} />
        <span style={{
            fontFamily: "monospace", fontSize: 9, letterSpacing: "0.5em",
            textTransform: "uppercase", color: "rgba(255,255,255,0.2)", whiteSpace: "nowrap"
        }}>{children}</span>
        <div style={{ height: 1, flex: 1, background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.04))` }} />
    </div>
);

// ══════════════════════════════════════════════════════════════════
// 1. WHISPER INPUT — Evolved
// ══════════════════════════════════════════════════════════════════
const WhisperInput = ({ label, placeholder, multiline, value, onChange }: any) => {
    const [focused, setFocused] = useState(false);
    const [hasValue, setHasValue] = useState(!!value);
    const Tag = multiline ? "textarea" : "input";

    const handleChange = (e: any) => {
        setHasValue(!!e.target.value);
        onChange?.(e.target.value);
    };

    return (
        <div style={{ position: "relative", paddingTop: 24 }}>
            {/* Floating label */}
            <motion.label
                animate={{
                    y: focused || hasValue ? -24 : 0,
                    fontSize: focused || hasValue ? 9 : 11,
                    opacity: focused ? 0.6 : hasValue ? 0.3 : 0.2,
                    color: focused ? tokens.teal : "white",
                    letterSpacing: focused || hasValue ? "0.5em" : "0.35em",
                }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                style={{
                    position: "absolute", top: 24, left: 0,
                    fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
                    textTransform: "uppercase", pointerEvents: "none",
                    transformOrigin: "left center", display: "block",
                } as any}
            >{label}</motion.label>

            {/* The input itself */}
            <Tag
                rows={multiline ? 3 : undefined}
                placeholder={focused ? placeholder : ""}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onChange={handleChange}
                style={{
                    width: "100%", background: "transparent",
                    border: "none", outline: "none", resize: "none",
                    fontFamily: "Georgia, 'Times New Roman', serif",
                    fontSize: 28, fontWeight: 300, fontStyle: "italic",
                    color: "rgba(255,255,255,0.85)",
                    lineHeight: 1.6, paddingBottom: 12, paddingTop: 4,
                    caretColor: tokens.teal,
                } as any}
            />

            {/* Bottom border — animated */}
            <div style={{ position: "relative", height: 1 }}>
                <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.06)" }} />
                <motion.div
                    animate={{ scaleX: focused ? 1 : 0, opacity: focused ? 1 : 0 }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                        position: "absolute", inset: 0,
                        background: `linear-gradient(90deg, transparent, ${tokens.teal}, transparent)`,
                        transformOrigin: "center",
                        boxShadow: `0 0 20px ${tokens.teal}60`,
                    }}
                />
            </div>

            {/* Character glow when typing */}
            <AnimatePresence>
                {focused && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{
                            position: "absolute", bottom: -20, left: 0, right: 0, height: 40,
                            background: `radial-gradient(ellipse 60% 100% at 30% 50%, ${tokens.teal}08, transparent)`,
                            pointerEvents: "none",
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

// ══════════════════════════════════════════════════════════════════
// 2. PRIMARY CTA — "Anchor" Button  
// ══════════════════════════════════════════════════════════════════
const AnchorButton = ({ children, variant = "ghost", onClick, loading }: any) => {
    const [hovered, setHovered] = useState(false);
    const [ripples, setRipples] = useState<any[]>([]);

    const handleClick = (e: any) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        const id = Date.now();
        setRipples(r => [...r, { id, x, y }]);
        setTimeout(() => setRipples(r => r.filter(rp => rp.id !== id)), 1200);
        onClick?.();
    };

    if (variant === "solid") {
        return (
            <motion.button
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                onHoverStart={() => setHovered(true)}
                onHoverEnd={() => setHovered(false)}
                onClick={handleClick}
                style={{
                    position: "relative", overflow: "hidden",
                    padding: "20px 48px",
                    background: hovered
                        ? `linear-gradient(135deg, ${tokens.teal}, #8AB5B0)`
                        : `linear-gradient(135deg, ${tokens.teal}E0, #7EB8B3)`,
                    borderRadius: 100, border: "none", cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
                    fontSize: 10, letterSpacing: "0.35em", textTransform: "uppercase",
                    color: "#0D1F1E",
                    boxShadow: hovered
                        ? `0 20px 60px ${tokens.teal}40, 0 0 0 1px ${tokens.teal}30`
                        : `0 8px 32px ${tokens.teal}20`,
                    transition: "all 0.5s cubic-bezier(0.16,1,0.3,1)",
                } as any}
            >
                <motion.div
                    animate={{ opacity: hovered ? 1 : 0 }}
                    style={{
                        position: "absolute", inset: 0,
                        background: "linear-gradient(135deg, rgba(255,255,255,0.15), transparent)",
                    }}
                />
                {ripples.map(r => (
                    <motion.div key={r.id}
                        initial={{ scale: 0, opacity: 0.4 }}
                        animate={{ scale: 8, opacity: 0 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        style={{
                            position: "absolute", width: 40, height: 40, borderRadius: "50%",
                            background: "rgba(255,255,255,0.3)",
                            left: `${r.x}%`, top: `${r.y}%`, transform: "translate(-50%,-50%)",
                            pointerEvents: "none",
                        } as any}
                    />
                ))}
                {loading ? (
                    <motion.div
                        animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                        style={{ display: "inline-block", width: 12, height: 12, border: `2px solid #0D1F1E`, borderTopColor: "transparent", borderRadius: "50%" }}
                    />
                ) : children}
            </motion.button>
        );
    }

    // Ghost / sacred variant
    return (
        <motion.button
            whileHover={{ scale: 1.005 }}
            whileTap={{ scale: 0.995 }}
            onHoverStart={() => setHovered(true)}
            onHoverEnd={() => setHovered(false)}
            onClick={handleClick}
            style={{
                position: "relative", overflow: "hidden",
                width: "100%", padding: "28px 48px",
                background: hovered ? "rgba(255,255,255,0.03)" : "transparent",
                border: `1px solid ${hovered ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.08)"}`,
                borderRadius: 32, cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
                fontSize: 10, letterSpacing: "0.5em", textTransform: "uppercase",
                color: hovered ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.4)",
                boxShadow: hovered ? `0 0 40px ${tokens.magenta}20, inset 0 0 30px ${tokens.magenta}05` : "none",
                transition: "all 0.6s cubic-bezier(0.16,1,0.3,1)",
            } as any}
        >
            {/* Corner glow accents */}
            <AnimatePresence>
                {hovered && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
                        {[
                            { k: 'tl', x: 0, y: 0 },
                            { k: 'tr', x: 100, y: 0 },
                            { k: 'bl', x: 0, y: 100 },
                            { k: 'br', x: 100, y: 100 }
                        ].map(({ k, x, y }) => (
                            <motion.div key={k}
                                initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                style={{
                                    position: "absolute", width: 4, height: 4,
                                    left: `${x}%`, top: `${y}%`,
                                    transform: "translate(-50%,-50%)",
                                    background: tokens.magenta,
                                    borderRadius: "50%",
                                    boxShadow: `0 0 8px ${tokens.magenta}`,
                                } as any}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
            {children}
        </motion.button>
    );
};

// ══════════════════════════════════════════════════════════════════
// 3. SACRED ORBS — Navigation / Status indicators
// ══════════════════════════════════════════════════════════════════
const SacredOrb = ({ label, active, pulse, size = 48, onClick }: any) => {
    const [hovered, setHovered] = useState(false);
    return (
        <motion.div
            onClick={onClick}
            onHoverStart={() => setHovered(true)}
            onHoverEnd={() => setHovered(false)}
            whileTap={{ scale: 0.92 }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, cursor: "pointer" }}
        >
            <div style={{ position: "relative", width: size, height: size }}>
                {/* Outer pulse ring */}
                {(active || pulse) && (
                    <motion.div
                        animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0, 0.4] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        style={{
                            position: "absolute", inset: -6, borderRadius: "50%",
                            border: `1px solid ${active ? tokens.teal : tokens.magenta}`,
                        }}
                    />
                )}
                {/* Hover ring */}
                <motion.div
                    animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.85 }}
                    transition={{ duration: 0.4 }}
                    style={{
                        position: "absolute", inset: -3, borderRadius: "50%",
                        border: `1px solid ${tokens.magenta}50`,
                        boxShadow: `0 0 15px ${tokens.magenta}30`,
                    }}
                />
                {/* Core */}
                <motion.div
                    animate={{
                        background: active
                            ? `radial-gradient(circle, ${tokens.teal}40, ${tokens.teal}10)`
                            : hovered
                                ? `radial-gradient(circle, ${tokens.magenta}20, transparent)`
                                : "radial-gradient(circle, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
                        boxShadow: active
                            ? `0 0 20px ${tokens.teal}60, inset 0 0 15px ${tokens.teal}20`
                            : hovered
                                ? `0 0 20px ${tokens.magenta}30`
                                : "none",
                    } as any}
                    transition={{ duration: 0.5 }}
                    style={{
                        width: "100%", height: "100%", borderRadius: "50%",
                        border: `1px solid ${active ? tokens.teal + "60" : "rgba(255,255,255,0.08)"}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                    } as any}
                >
                    <motion.div
                        animate={{ scale: active ? [1, 1.1, 1] : 1 }}
                        transition={{ duration: 2, repeat: active ? Infinity : 0, ease: "easeInOut" }}
                        style={{
                            width: 8, height: 8, borderRadius: "50%",
                            background: active ? tokens.teal : hovered ? tokens.magenta : "rgba(255,255,255,0.2)",
                            boxShadow: active ? `0 0 10px ${tokens.teal}` : "none",
                        }}
                    />
                </motion.div>
            </div>
            {label && (
                <span style={{
                    fontSize: 8, letterSpacing: "0.4em", textTransform: "uppercase",
                    color: active ? tokens.teal : "rgba(255,255,255,0.2)",
                    fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
                    transition: "color 0.4s",
                } as any}>{label}</span>
            )}
        </motion.div>
    );
};

// ══════════════════════════════════════════════════════════════════
// 4. EPOCH CARD — Journal Entry Card
// ══════════════════════════════════════════════════════════════════
const EpochCard = ({ date, preview, bucket = "today", emotions }: any) => {
    const [hovered, setHovered] = useState(false);
    const intensityMap: any = { today: 1, thisWeek: 0.6, thisMonth: 0.35, archive: 0.15 };
    const sizeMap: any = { today: 28, thisWeek: 22, thisMonth: 18, archive: 14 };
    const intensity = intensityMap[bucket];
    const fontSize = sizeMap[bucket];

    return (
        <motion.div
            onHoverStart={() => setHovered(true)}
            onHoverEnd={() => setHovered(false)}
            whileHover={{ y: bucket === "archive" ? 0 : -3 }}
            style={{ position: "relative", cursor: "pointer" }}
        >
            {/* Atmospheric glow */}
            <motion.div
                animate={{ opacity: hovered ? intensity * 0.4 : intensity * 0.08 }}
                transition={{ duration: 0.8 }}
                style={{
                    position: "absolute", inset: -12, borderRadius: 32,
                    background: tokens.magenta,
                    filter: "blur(24px)", pointerEvents: "none",
                }}
            />
            <motion.div
                animate={{
                    borderColor: hovered ? `rgba(255,255,255,${0.1 * intensity})` : "rgba(255,255,255,0.04)",
                    background: hovered ? `rgba(255,255,255,${0.02 * intensity})` : "transparent",
                } as any}
                transition={{ duration: 0.6 }}
                style={{
                    position: "relative",
                    padding: bucket === "archive" ? "12px 16px" : "24px 32px",
                    borderRadius: 24, border: "1px solid rgba(255,255,255,0.04)",
                } as any}
            >
                <div style={{
                    fontSize: 8, letterSpacing: "0.5em", textTransform: "uppercase",
                    color: `rgba(255,255,255,${0.15 * intensity})`,
                    fontFamily: "'DM Sans', sans-serif", fontWeight: 700, marginBottom: 10,
                } as any}>{date}</div>

                <p style={{
                    fontFamily: "Georgia, serif", fontStyle: "italic", fontWeight: 300,
                    fontSize, color: `rgba(255,255,255,${0.5 + 0.35 * intensity})`,
                    lineHeight: 1.6,
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: bucket === "archive" ? 1 : 3,
                    WebkitBoxOrient: "vertical",
                } as any}>"{preview}"</p>

                {emotions && bucket !== "archive" && (
                    <div style={{ display: "flex", gap: 6, marginTop: 14, flexWrap: "wrap" }}>
                        {emotions.map((e: string) => (
                            <span key={e} style={{
                                padding: "3px 10px", borderRadius: 100,
                                border: `1px solid rgba(171,206,201,${0.2 * intensity})`,
                                fontSize: 8, letterSpacing: "0.3em", textTransform: "uppercase",
                                color: `rgba(171,206,201,${0.5 * intensity})`,
                                fontFamily: "'DM Sans', sans-serif",
                            } as any}>{e}</span>
                        ))}
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
};

// ══════════════════════════════════════════════════════════════════
// 5. SACRED TOGGLE — Yes/No, Light/Deep, etc
// ══════════════════════════════════════════════════════════════════
const SacredToggle = ({ labelA, labelB, value, onChange }: any) => {
    return (
        <div style={{ display: "inline-flex", alignItems: "center", gap: 16 }}>
            <span style={{
                fontSize: 9, letterSpacing: "0.4em", textTransform: "uppercase",
                color: !value ? tokens.teal : "rgba(255,255,255,0.2)",
                fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
                transition: "color 0.5s",
            } as any}>{labelA}</span>

            <motion.div
                onClick={() => onChange(!value)}
                style={{
                    width: 52, height: 28, borderRadius: 100, position: "relative", cursor: "pointer",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    boxShadow: value ? `0 0 20px ${tokens.teal}30` : `0 0 20px ${tokens.magenta}20`,
                } as any}
            >
                <motion.div
                    animate={{ x: value ? 26 : 2 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    style={{
                        position: "absolute", top: 2, width: 22, height: 22, borderRadius: "50%",
                        background: value
                            ? `radial-gradient(circle, ${tokens.teal}, ${tokens.teal}90)`
                            : `radial-gradient(circle, ${tokens.magenta}, ${tokens.magenta}90)`,
                        boxShadow: value
                            ? `0 0 12px ${tokens.teal}80`
                            : `0 0 12px ${tokens.magenta}80`,
                    }}
                />
            </motion.div>

            <span style={{
                fontSize: 9, letterSpacing: "0.4em", textTransform: "uppercase",
                color: value ? tokens.teal : "rgba(255,255,255,0.2)",
                fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
                transition: "color 0.5s",
            } as any}>{labelB}</span>
        </div>
    );
};

// ══════════════════════════════════════════════════════════════════
// 6. MOOD SELECTOR — Radial sacred geometry
// ══════════════════════════════════════════════════════════════════
const moods = [
    { id: "stillness", label: "Still", color: "#7EAAA5" },
    { id: "expansion", label: "Open", color: "#B5A0D4" },
    { id: "tension", label: "Tense", color: "#D4907A" },
    { id: "clarity", label: "Clear", color: "#A0C4D4" },
    { id: "grief", label: "Heavy", color: "#7A8DA0" },
    { id: "joy", label: "Light", color: "#D4C47A" },
];

const MoodSelector = ({ selected, onSelect }: any) => {
    return (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {moods.map(mood => {
                const isSelected = selected === mood.id;
                return (
                    <motion.button
                        key={mood.id}
                        onClick={() => onSelect(mood.id === selected ? null : mood.id)}
                        whileTap={{ scale: 0.95 }}
                        whileHover={{ scale: 1.05 }}
                        style={{
                            padding: "8px 20px", borderRadius: 100, cursor: "pointer",
                            background: isSelected ? `${mood.color}20` : "rgba(255,255,255,0.03)",
                            border: `1px solid ${isSelected ? `${mood.color}60` : "rgba(255,255,255,0.06)"}`,
                            color: isSelected ? mood.color : "rgba(255,255,255,0.3)",
                            fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
                            fontSize: 9, letterSpacing: "0.35em", textTransform: "uppercase",
                            boxShadow: isSelected ? `0 0 20px ${mood.color}30` : "none",
                            transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
                        } as any}
                    >
                        {mood.label}
                    </motion.button>
                );
            })}
        </div>
    );
};

// ══════════════════════════════════════════════════════════════════
// 7. PROGRESS FILAMENT — Breath / Session progress
// ══════════════════════════════════════════════════════════════════
const ProgressFilament = ({ progress = 0.4, label }: any) => {
    return (
        <div style={{ width: "100%" }}>
            {label && (
                <div style={{
                    display: "flex", justifyContent: "space-between", marginBottom: 12,
                    fontSize: 8, letterSpacing: "0.5em", textTransform: "uppercase",
                    color: "rgba(255,255,255,0.2)", fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
                } as any}>
                    <span>{label}</span>
                    <span style={{ color: tokens.teal }}>{Math.round(progress * 100)}%</span>
                </div>
            )}
            <div style={{ height: 1, background: "rgba(255,255,255,0.05)", borderRadius: 1, position: "relative" }}>
                <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: progress }}
                    transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                        position: "absolute", left: 0, top: 0, bottom: 0,
                        background: `linear-gradient(90deg, ${tokens.magenta}80, ${tokens.teal})`,
                        borderRadius: 1, transformOrigin: "left",
                        boxShadow: `0 0 8px ${tokens.teal}60`,
                    }}
                />
                {/* Glowing head */}
                <motion.div
                    initial={{ left: "0%" }}
                    animate={{ left: `${progress * 100}%` }}
                    transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                        position: "absolute", top: "50%", transform: "translate(-50%,-50%)",
                        width: 4, height: 4, borderRadius: "50%",
                        background: tokens.teal,
                        boxShadow: `0 0 8px ${tokens.teal}, 0 0 20px ${tokens.teal}60`,
                    }}
                />
            </div>
        </div>
    );
};

// ══════════════════════════════════════════════════════════════════
// 8. EPOCH DIVIDER — Timeline separator
// ══════════════════════════════════════════════════════════════════
const EpochDivider = ({ label }: { label: string }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 20, margin: "32px 0 20px" }}>
        <div style={{ height: 1, flex: 1, background: `linear-gradient(90deg, ${tokens.magenta}50, transparent)` }} />
        <span style={{
            fontSize: 8, letterSpacing: "0.6em", textTransform: "uppercase",
            color: "rgba(255,255,255,0.2)", fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
        } as any}>{label}</span>
        <div style={{ height: 1, width: 32, background: "rgba(255,255,255,0.04)" }} />
    </div>
);

// ══════════════════════════════════════════════════════════════════
// 9. NOTIFICATION TOAST — Sacred affirmation
// ══════════════════════════════════════════════════════════════════
const SacredToast = ({ message, visible, type = "presence" }: any) => (
    <AnimatePresence>
        {visible && (
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: 10, scale: 0.97, filter: "blur(8px)" }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                style={{
                    position: "fixed", bottom: 40, left: "50%", transform: "translateX(-50%)",
                    padding: "14px 28px", borderRadius: 100, zIndex: 50,
                    background: "rgba(13,0,20,0.95)",
                    border: `1px solid ${type === "save" ? tokens.teal + "50" : tokens.magenta + "40"}`,
                    backdropFilter: "blur(20px)",
                    boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 30px ${type === "save" ? tokens.teal : tokens.magenta}20`,
                    display: "flex", alignItems: "center", gap: 12,
                    fontFamily: "'DM Sans', sans-serif",
                } as any}
            >
                <div style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: type === "save" ? tokens.teal : tokens.magenta,
                    boxShadow: `0 0 10px ${type === "save" ? tokens.teal : tokens.magenta}`,
                }} />
                <span style={{
                    fontSize: 9, letterSpacing: "0.4em", textTransform: "uppercase",
                    color: "rgba(255,255,255,0.7)", fontWeight: 700,
                } as any}>{message}</span>
            </motion.div>
        )}
    </AnimatePresence>
);

// ══════════════════════════════════════════════════════════════════
// 10. NAV PILL — Back button evolved
// ══════════════════════════════════════════════════════════════════
const NavPill = ({ children, onClick }: any) => {
    const [hovered, setHovered] = useState(false);
    return (
        <motion.button
            onHoverStart={() => setHovered(true)}
            onHoverEnd={() => setHovered(false)}
            whileTap={{ scale: 0.97 }}
            onClick={onClick}
            style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "8px 16px 8px 12px", borderRadius: 100, cursor: "pointer",
                background: hovered ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${hovered ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.06)"}`,
                color: hovered ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.3)",
                fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
                fontSize: 8, letterSpacing: "0.4em", textTransform: "uppercase",
                transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
                boxShadow: hovered ? `0 0 20px rgba(255,255,255,0.04)` : "none",
            } as any}
        >
            <motion.div
                animate={{ x: hovered ? -2 : 0 }}
                transition={{ duration: 0.3 }}
                style={{ display: "flex", alignItems: "center" }}
            >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M8 1L3 6L8 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </motion.div>
            {children}
        </motion.button>
    );
};

// ══════════════════════════════════════════════════════════════════
// MAIN SHOWCASE
// ══════════════════════════════════════════════════════════════════
export default function SacredUIShowcase() {
    const [toggleValue, setToggleValue] = useState(false);
    const [selectedMood, setSelectedMood] = useState(null);
    const [toastVisible, setToastVisible] = useState(false);
    const [toastType, setToastType] = useState("save");
    const [activeOrb, setActiveOrb] = useState(1);
    const [progress, setProgress] = useState(0.4);
    const [inputVal, setInputVal] = useState("");

    const fireToast = (type: string) => {
        setToastType(type);
        setToastVisible(true);
        setTimeout(() => setToastVisible(false), 2800);
    };

    useEffect(() => {
        const id = setInterval(() => {
            setProgress(p => p >= 1 ? 0.05 : p + 0.01);
        }, 120);
        return () => clearInterval(id);
    }, []);

    return (
        <div style={{
            minHeight: "100vh", background: tokens.plum,
            backgroundImage: `
        radial-gradient(ellipse 80% 50% at 50% -20%, #2D104060, transparent),
        radial-gradient(ellipse 60% 40% at 80% 80%, #D16BA508, transparent)
      `,
            color: "white", fontFamily: "Georgia, serif",
            padding: "60px 0 120px", boxSizing: "border-box",
        } as any}>
            <NoiseOverlay />

            {/* Header */}
            <header style={{ textAlign: "center", padding: "0 40px 80px", position: "relative" }}>
                <motion.div
                    animate={{ opacity: [0.1, 0.2, 0.1] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    style={{
                        position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
                        width: 400, height: 200,
                        background: `radial-gradient(ellipse, ${tokens.magenta}30, transparent)`,
                        filter: "blur(60px)", pointerEvents: "none",
                    }}
                />
                <p style={{ fontSize: 8, letterSpacing: "0.6em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", marginBottom: 16, fontFamily: "'DM Sans', sans-serif", fontWeight: 700 } as any}>
                    The Awakened Path
                </p>
                <h1 style={{ fontSize: 48, fontWeight: 300, letterSpacing: "-0.01em", margin: 0, color: "rgba(255,255,255,0.92)", lineHeight: 1 } as any}>
                    Sacred UI System
                </h1>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", marginTop: 16, fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.1em", fontWeight: 300 } as any}>
                    Component reference · v2.0
                </p>
            </header>

            <div style={{ maxWidth: 700, margin: "0 auto", padding: "0 32px", display: "flex", flexDirection: "column", gap: 80 }}>

                {/* ── NAVIGATION ── */}
                <section>
                    <SectionLabel>01 · Navigation</SectionLabel>
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        <NavPill>Return Home</NavPill>
                        <NavPill>Daily Log</NavPill>
                    </div>
                </section>

                {/* ── INPUTS ── */}
                <section>
                    <SectionLabel>02 · Whisper Inputs</SectionLabel>
                    <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
                        <WhisperInput
                            label="What arose in your inner body?"
                            placeholder="Warmth in the chest, a settling…"
                            value={inputVal}
                            onChange={setInputVal}
                        />
                        <WhisperInput
                            label="The current of emotion?"
                            placeholder="A quiet current of gratitude…"
                            multiline={false}
                        />
                        <WhisperInput
                            label="Deepened Awareness"
                            placeholder="I noticed a space between thoughts…"
                            multiline
                        />
                    </div>
                </section>

                {/* ── BUTTONS ── */}
                <section>
                    <SectionLabel>03 · Sacred Buttons</SectionLabel>
                    <div style={{ display: "flex", flexDirection: "column", gap: 20, alignItems: "center" }}>
                        <AnchorButton variant="solid" onClick={() => fireToast("save")}>
                            Begin Daily Meditation
                        </AnchorButton>
                        <AnchorButton variant="ghost" onClick={() => fireToast("presence")}>
                            ✦ Anchor Reflection
                        </AnchorButton>
                    </div>
                </section>

                {/* ── ORBS ── */}
                <section>
                    <SectionLabel>04 · Sacred Orbs · Navigation</SectionLabel>
                    <div style={{ display: "flex", gap: 32, justifyContent: "center" }}>
                        {["Breath", "Somatic", "Emotion", "Rest"].map((label, i) => (
                            <SacredOrb
                                key={label} label={label} size={52}
                                active={activeOrb === i}
                                pulse={activeOrb === i}
                                onClick={() => setActiveOrb(i)}
                            />
                        ))}
                    </div>
                </section>

                {/* ── MOOD ── */}
                <section>
                    <SectionLabel>05 · Emotional Field Selector</SectionLabel>
                    <MoodSelector selected={selectedMood} onSelect={setSelectedMood} />
                </section>

                {/* ── TOGGLE ── */}
                <section>
                    <SectionLabel>06 · Sacred Toggle</SectionLabel>
                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                        <SacredToggle labelA="Shallow" labelB="Deep" value={toggleValue} onChange={setToggleValue} />
                        <SacredToggle labelA="Quiet" labelB="Guided" value={!toggleValue} onChange={(v: boolean) => setToggleValue(!v)} />
                    </div>
                </section>

                {/* ── PROGRESS ── */}
                <section>
                    <SectionLabel>07 · Breath Filament · Progress</SectionLabel>
                    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                        <ProgressFilament progress={progress} label="Session Progress" />
                        <ProgressFilament progress={0.72} label="Weekly Continuity" />
                    </div>
                </section>

                {/* ── CARDS ── */}
                <section>
                    <SectionLabel>08 · Awareness Cards · Temporal Scaling</SectionLabel>

                    <EpochDivider label="This Moment" />
                    <EpochCard
                        bucket="today" date="Today · 07:42 AM"
                        preview="A warmth gathered in the sternum. Breath moved slower than usual. The mind was somewhere between sleep and waking — porous, receptive."
                        emotions={["Openness", "Clarity"]}
                    />

                    <EpochDivider label="This Week" />
                    <EpochCard
                        bucket="thisWeek" date="Feb 17 · 08:15 AM"
                        preview="Tension behind the eyes. Noticed resistance to sitting still — then, after three breaths, it dissolved into a kind of neutral watching."
                        emotions={["Tension", "Release"]}
                    />

                    <EpochDivider label="The Archive" />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                        {["Feb 13", "Feb 10", "Feb 7", "Feb 4", "Feb 1", "Jan 28"].map(d => (
                            <EpochCard key={d} bucket="archive" date={d}
                                preview="Stillness arrived early. Body felt like stone, in the good sense." />
                        ))}
                    </div>
                </section>

                {/* ── TOAST TRIGGER ── */}
                <section>
                    <SectionLabel>09 · Sacred Toast · Affirmations</SectionLabel>
                    <div style={{ display: "flex", gap: 12 }}>
                        <motion.button
                            whileTap={{ scale: 0.97 }}
                            onClick={() => fireToast("save")}
                            style={{
                                padding: "10px 24px", borderRadius: 100, cursor: "pointer",
                                border: `1px solid ${tokens.teal}30`, background: "transparent",
                                color: tokens.teal, fontSize: 9, letterSpacing: "0.4em", textTransform: "uppercase",
                                fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
                            } as any}
                        >Anchor Saved</motion.button>
                        <motion.button
                            whileTap={{ scale: 0.97 }}
                            onClick={() => fireToast("presence")}
                            style={{
                                padding: "10px 24px", borderRadius: 100, cursor: "pointer",
                                border: `1px solid ${tokens.magenta}30`, background: "transparent",
                                color: tokens.magenta, fontSize: 9, letterSpacing: "0.4em", textTransform: "uppercase",
                                fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
                            } as any}
                        >Presence Logged</motion.button>
                    </div>
                </section>

                {/* ── TYPOGRAPHY ── */}
                <section>
                    <SectionLabel>10 · Sacred Typography Scale</SectionLabel>
                    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                        <div>
                            <p style={{ fontSize: 8, letterSpacing: "0.5em", textTransform: "uppercase", color: "rgba(255,255,255,0.15)", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, marginBottom: 8 } as any}>Display / Hero</p>
                            <h1 style={{ fontSize: 64, fontWeight: 300, letterSpacing: "-0.01em", margin: 0, lineHeight: 1, color: "rgba(255,255,255,0.92)", textShadow: `0 0 60px ${tokens.magenta}30` } as any}>Daily Log</h1>
                        </div>
                        <div>
                            <p style={{ fontSize: 8, letterSpacing: "0.5em", textTransform: "uppercase", color: "rgba(255,255,255,0.15)", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, marginBottom: 8 } as any}>Section Header</p>
                            <h2 style={{ fontSize: 40, fontWeight: 300, letterSpacing: "-0.01em", margin: 0, lineHeight: 1.1, color: "rgba(255,255,255,0.85)" } as any}>Sacred Reflection</h2>
                        </div>
                        <div>
                            <p style={{ fontSize: 8, letterSpacing: "0.5em", textTransform: "uppercase", color: "rgba(255,255,255,0.15)", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, marginBottom: 8 } as any}>Journal Body</p>
                            <p style={{ fontSize: 22, fontWeight: 300, fontStyle: "italic", lineHeight: 1.7, color: "rgba(255,255,255,0.6)", margin: 0 } as any}>
                                "A warmth gathered in the sternum — breath moved slower than usual, the mind settling between states of knowing."
                            </p>
                        </div>
                        <div>
                            <p style={{ fontSize: 8, letterSpacing: "0.5em", textTransform: "uppercase", color: "rgba(255,255,255,0.15)", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, marginBottom: 8 } as any}>Whisper / Caption</p>
                            <p style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, margin: 0 } as any}>
                                The Presence Study · Day 12
                            </p>
                        </div>
                    </div>
                </section>

            </div>

            <SacredToast
                visible={toastVisible}
                message={toastType === "save" ? "Reflection Anchored" : "Presence Recorded"}
                type={toastType}
            />
        </div>
    );
}
