import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── DESIGN TOKENS ────────────────────────────────────────────────
export const tokens = {
    plum: "#0D0014",
    deep: "#160020",
    mid: "#2D1040",
    magenta: "#D16BA5",
    teal: "#ABCEC9",
    muted: "rgba(255,255,255,0.08)",
    border: "rgba(255,255,255,0.07)",
};

// ─── NOISE TEXTURE SVG (grain overlay) ────────────────────────────
export const NoiseOverlay = () => (
    <svg style={{ position: "fixed", inset: 0, width: "100%", height: "100%", opacity: 0.03, pointerEvents: "none", zIndex: 100 }}>
        <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise)" />
    </svg>
);

// ─── SECTION LABEL ─────────────────────────────────────────────────
export const SectionLabel = ({ children }: { children: React.ReactNode }) => (
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
export const WhisperInput = ({ label, placeholder, multiline, value, onChange }: any) => {
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
                value={value}
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
export const AnchorButton = ({ children, variant = "ghost", onClick, loading, className, disabled }: any) => {
    const [hovered, setHovered] = useState(false);
    const [ripples, setRipples] = useState<any[]>([]);

    const handleClick = (e: any) => {
        if (disabled || loading) return;
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
                disabled={disabled}
                className={className}
                style={{
                    position: "relative", overflow: "hidden",
                    padding: "20px 56px",
                    background: hovered
                        ? `linear-gradient(135deg, ${tokens.teal}, #8AB5B0)`
                        : `linear-gradient(135deg, ${tokens.teal}E0, #7EB8B3)`,
                    borderRadius: 100, border: "none", cursor: disabled ? "not-allowed" : "pointer",
                    fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
                    fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase",
                    color: "#0D1F1E",
                    opacity: disabled ? 0.3 : 1,
                    boxShadow: hovered && !disabled
                        ? `0 20px 60px ${tokens.teal}40, 0 0 0 1px ${tokens.teal}30`
                        : `0 8px 32px ${tokens.teal}20`,
                    transition: "all 0.5s cubic-bezier(0.16,1,0.3,1)",
                } as any}
            >
                <motion.div
                    animate={{ opacity: hovered ? 1 : 0 }}
                    style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,255,255,0.15), transparent)" }}
                />
                {loading ? (
                    <motion.div
                        animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                        style={{ display: "inline-block", width: 14, height: 14, border: `2px solid #0D1F1E`, borderTopColor: "transparent", borderRadius: "50%" }}
                    />
                ) : children}
            </motion.button>
        );
    }

    return (
        <motion.button
            whileHover={{ scale: 1.005 }}
            whileTap={{ scale: 0.995 }}
            onHoverStart={() => setHovered(true)}
            onHoverEnd={() => setHovered(false)}
            onClick={handleClick}
            disabled={disabled}
            className={className}
            style={{
                position: "relative", overflow: "hidden",
                width: "100%", padding: "26px 48px", borderRadius: 32, cursor: disabled ? "not-allowed" : "pointer",
                background: hovered ? "rgba(255,255,255,0.025)" : "transparent",
                border: `1px solid ${hovered ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.07)"}`,
                color: disabled ? "rgba(255,255,255,0.2)" : hovered ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.38)",
                fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
                fontSize: 9, letterSpacing: "0.5em", textTransform: "uppercase",
                boxShadow: hovered && !disabled ? `0 0 40px ${tokens.magenta}18, inset 0 0 30px ${tokens.magenta}04` : "none",
                transition: "all 0.6s cubic-bezier(0.16,1,0.3,1)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
            } as any}
        >
            <AnimatePresence>
                {hovered && !disabled && (
                    <>
                        {([[0, 0], [100, 0], [0, 100], [100, 100]] as [number, number][]).map(([x, y], i) => (
                            <motion.div key={i}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0 }}
                                transition={{ duration: 0.3, delay: i * 0.04 }}
                                style={{
                                    position: "absolute", width: 3, height: 3, borderRadius: "50%",
                                    left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)",
                                    background: tokens.magenta, boxShadow: `0 0 6px ${tokens.magenta}`,
                                    pointerEvents: "none",
                                } as any}
                            />
                        ))}
                    </>
                )}
            </AnimatePresence>
            {children}
        </motion.button>
    );
};

// ══════════════════════════════════════════════════════════════════
// 8. EPOCH DIVIDER — Timeline separator
// ══════════════════════════════════════════════════════════════════
export const EpochDivider = ({ label }: { label: string }) => (
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
// 4. EPOCH CARD — Journal Entry Card
// ══════════════════════════════════════════════════════════════════
export const EpochCard = ({ date, preview, bucket = "today", emotions, onClick }: any) => {
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
            onClick={onClick}
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
                        {(Array.isArray(emotions) ? emotions : [emotions]).map((e: string) => (
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
// 7. PROGRESS FILAMENT — Breath / Session progress
// ══════════════════════════════════════════════════════════════════
export const ProgressFilament = ({ progress = 0.4, label }: any) => {
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

// --- PRACTICE CARD ---
export const PracticeCard = ({ title, type, level, xp, icon: Icon, accent = tokens.magenta, onClick }: any) => {
    return (
        <motion.div
            onClick={onClick}
            whileHover={{ y: -8 }}
            whileTap={{ scale: 0.98 }}
            className="group relative h-[320px] p-10 rounded-[48px] overflow-hidden cursor-pointer border border-white/5 bg-white/[0.01] transition-all duration-700"
        >
            {/* Massive Background Icon */}
            <div className="absolute right-[-10%] bottom-[-10%] opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-1000 pointer-events-none">
                <Icon size={300} style={{ color: accent }} strokeWidth={0.5} />
            </div>

            {/* Corner Accent Glow */}
            <div
                className="absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-0 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none"
                style={{ background: accent }}
            />

            <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                    <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center border border-white/10 mb-6 group-hover:scale-110 transition-transform duration-700"
                        style={{ background: `${accent}15` }}
                    >
                        <Icon size={24} style={{ color: accent }} />
                    </div>

                    <h3 className="text-3xl font-serif font-light text-white/90 group-hover:text-white mb-2 tracking-tight">
                        {title}
                    </h3>
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20">
                            {type} · {level}
                        </span>
                        <div className="w-1 h-1 rounded-full bg-white/10" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: accent }}>
                            +{xp} XP
                        </span>
                    </div>
                </div>

                <div className="flex justify-between items-center pt-8 border-t border-white/5 group-hover:border-white/10 transition-all">
                    <span className="text-[9px] font-bold uppercase tracking-[0.6em] text-white/20 group-hover:text-white/40 transition-colors">
                        Begin Journey
                    </span>
                    <div
                        className="w-2 h-2 rounded-full shadow-[0_0_15px_currentColor] group-hover:scale-125 transition-transform"
                        style={{ color: accent, background: 'currentColor' }}
                    />
                </div>
            </div>
        </motion.div>
    );
};
// ══════════════════════════════════════════════════════════════════
// 10. SACRED TOAST — Elevated feedback
// ══════════════════════════════════════════════════════════════════
export const SacredToast = ({ message, visible }: { message: string; visible: boolean }) => (
    <AnimatePresence>
        {visible && (
            <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.96, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: 8, scale: 0.97 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                style={{
                    position: "fixed", bottom: 40, left: "50%", transform: "translateX(-50%)",
                    padding: "14px 28px", borderRadius: 100, zIndex: 200,
                    background: "rgba(13,0,20,0.95)",
                    border: `1px solid ${tokens.teal}45`,
                    backdropFilter: "blur(20px)",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 30px rgba(171,206,201,0.15)",
                    display: "flex", alignItems: "center", gap: 12,
                }}
            >
                <div style={{
                    width: 5, height: 5, borderRadius: "50%",
                    background: tokens.teal, boxShadow: `0 0 10px ${tokens.teal}`,
                }} />
                <span style={{
                    fontSize: 8, letterSpacing: "0.45em", textTransform: "uppercase",
                    color: "rgba(255,255,255,0.65)", fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
                }}>{message}</span>
            </motion.div>
        )}
    </AnimatePresence>
);

// ─── NAV PILL ────────────────────────────────────────────────────────────────
import { ArrowLeft } from "lucide-react";
export const NavPill = ({ onClick, children }: { onClick?: () => void; children: React.ReactNode }) => {
    const [hovered, setHovered] = useState(false);
    return (
        <motion.button
            onHoverStart={() => setHovered(true)}
            onHoverEnd={() => setHovered(false)}
            whileTap={{ scale: 0.97 }}
            onClick={onClick}
            style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "8px 18px 8px 12px", borderRadius: 100, cursor: "pointer",
                background: hovered ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.02)",
                border: `1px solid ${hovered ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.06)"}`,
                color: hovered ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.25)",
                fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
                fontSize: 8, letterSpacing: "0.4em", textTransform: "uppercase",
                transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
            }}
        >
            <motion.span animate={{ x: hovered ? -2 : 0 }} transition={{ duration: 0.3 }}>
                <ArrowLeft size={11} strokeWidth={2} />
            </motion.span>
            {children}
        </motion.button>
    );
};
