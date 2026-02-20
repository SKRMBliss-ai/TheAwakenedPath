import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, AlertCircle, Bell, Activity, Sparkles } from 'lucide-react';
import { useWitnessingVoice } from '../hooks/useWitnessingVoice';
import { getNoMindGrounding } from '../services/geminiService';
import { BodyTruthTest } from './BodyTruthTest';
import { usePresenceScheduler } from '../hooks/usePresenceScheduler';

// ─── SACRED UI TOKENS v3 — Unified Warm Palette ──────────────────
const T = {
    // Primary accent — warm magenta, unchanged
    magenta: '#D16BA5',
    magentaDim: 'rgba(209, 107, 165, 0.5)',

    // Secondary accent — was cyan, now warm lavender
    // Sits in the red-violet family, harmonizes with plum background
    lavender: '#B8A5D4',
    lavenderDim: 'rgba(184, 165, 212, 0.4)',

    // Tertiary — dusty mauve for third-state elements
    mauve: '#C4A8C8',

    // Functional — warm terracotta for alert/panic states
    rose: '#D4857A',

    // Background — unchanged
    plum: '#0D0014',
    deep: '#160020',

    // Monospace UI only (timer, code) — desaturated teal, not full cyan
    // Use sparingly, never as a glow color
    tealMuted: '#8AAFA8',
    border: 'rgba(255,255,255,0.06)',
};

// ─── GRAIN OVERLAY ───────────────────────────────────────────────────────────
const GrainOverlay = () => (
    <svg style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', opacity: 0.025, pointerEvents: 'none', zIndex: 100 }}>
        <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" /></filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
    </svg>
);

// ─── NAV PILL (matches Journal) ──────────────────────────────────────────────
const NavPill: React.FC<{ onClick?: () => void; children: React.ReactNode }> = ({ onClick, children }) => {
    const [hov, setHov] = useState(false);
    return (
        <motion.button onHoverStart={() => setHov(true)} onHoverEnd={() => setHov(false)}
            whileTap={{ scale: 0.97 }} onClick={onClick}
            style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 18px 8px 12px', borderRadius: 100, cursor: 'pointer',
                background: hov ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${hov ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)'}`,
                color: hov ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.25)',
                fontFamily: 'system-ui,sans-serif', fontWeight: 700,
                fontSize: 8, letterSpacing: '0.4em', textTransform: 'uppercase',
                transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
            }}>
            <motion.span animate={{ x: hov ? -2 : 0 }} transition={{ duration: 0.3 }}>
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <path d="M8 1L3 6L8 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </motion.span>
            {children}
        </motion.button>
    );
};

// ─── GHOST BUTTON ────────────────────────────────────────────────────────────
const GhostButton: React.FC<{ onClick?: () => void; children: React.ReactNode; disabled?: boolean; accentColor?: string; fullWidth?: boolean; onMouseDown?: () => void; onMouseUp?: () => void }> =
    ({ onClick, children, disabled, accentColor = T.magenta, fullWidth, onMouseDown, onMouseUp }) => {
        const [hov, setHov] = useState(false);
        return (
            <motion.button
                onHoverStart={() => setHov(true)} onHoverEnd={() => setHov(false)}
                whileHover={{ scale: 1.005 }} whileTap={{ scale: 0.995 }}
                onClick={onClick} onMouseDown={onMouseDown} onMouseUp={onMouseUp} disabled={disabled}
                style={{
                    position: 'relative', overflow: 'hidden',
                    width: fullWidth ? '100%' : 'auto',
                    padding: '18px 40px', borderRadius: 32, cursor: disabled ? 'not-allowed' : 'pointer',
                    background: hov ? 'rgba(255,255,255,0.025)' : 'transparent',
                    border: `1px solid ${hov ? `${accentColor}50` : 'rgba(255,255,255,0.07)'}`,
                    color: disabled ? 'rgba(255,255,255,0.2)' : hov ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.38)',
                    fontFamily: 'system-ui,sans-serif', fontWeight: 700,
                    fontSize: 9, letterSpacing: '0.5em', textTransform: 'uppercase',
                    boxShadow: hov ? `0 0 40px ${accentColor}18` : 'none',
                    transition: 'all 0.6s cubic-bezier(0.16,1,0.3,1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                }}>
                {/* Corner dots */}
                <AnimatePresence>
                    {hov && !disabled && ([[0, 0], [100, 0], [0, 100], [100, 100]] as [number, number][]).map(([x, y], i) => (
                        <motion.div key={i} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0 }} transition={{ duration: 0.25, delay: i * 0.04 }}
                            style={{
                                position: 'absolute', width: 3, height: 3, borderRadius: '50%',
                                left: `${x}%`, top: `${y}%`, transform: 'translate(-50%,-50%)',
                                background: accentColor, boxShadow: `0 0 6px ${accentColor}`, pointerEvents: 'none'
                            }}
                        />
                    ))}
                </AnimatePresence>
                {children}
            </motion.button>
        );
    };

// ─── SOLID BUTTON ────────────────────────────────────────────────────────────
const SolidButton: React.FC<{ onClick?: () => void; children: React.ReactNode; color?: string }> = ({ onClick, children, color = T.teal }) => {
    const [hov, setHov] = useState(false);
    return (
        <motion.button onHoverStart={() => setHov(true)} onHoverEnd={() => setHov(false)}
            whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }} onClick={onClick}
            style={{
                position: 'relative', overflow: 'hidden', padding: '18px 48px', borderRadius: 100,
                cursor: 'pointer', border: 'none',
                background: hov ? `linear-gradient(135deg,${color},${color}90)` : `linear-gradient(135deg,${color}E0,${color}90)`,
                color: '#0D1F1E', fontFamily: 'system-ui,sans-serif', fontWeight: 700,
                fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase',
                boxShadow: hov ? `0 20px 60px ${color}40` : `0 8px 32px ${color}20`,
                transition: 'all 0.5s cubic-bezier(0.16,1,0.3,1)',
            }}>
            <motion.div animate={{ opacity: hov ? 1 : 0 }}
                style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(255,255,255,0.18),transparent)' }} />
            {children}
        </motion.button>
    );
};

// ─── PROGRESS FILAMENT ───────────────────────────────────────────────────────
const ProgressFilament: React.FC<{ progress: number; label?: string }> = ({ progress, label }) => (
    <div style={{ width: '100%' }}>
        {label && (
            <div style={{
                display: 'flex', justifyContent: 'space-between', marginBottom: 12,
                fontSize: 8, letterSpacing: '0.5em', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.15)',
                fontFamily: 'system-ui, sans-serif', fontWeight: 700,
            }}>
                <span>{label}</span>
                <span style={{ color: T.lavender }}>{Math.round(progress * 100)}%</span>
            </div>
        )}

        {/* Track — give it a visible ambient glow so it reads on dark bg */}
        <div style={{
            height: 1, position: 'relative', borderRadius: 1,
            background: 'rgba(255,255,255,0.06)',
            boxShadow: '0 0 8px rgba(255,255,255,0.02)',  // ← track glows faintly
        }}>
            <motion.div
                initial={{ scaleX: 0 }} animate={{ scaleX: progress }}
                transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] as any }}
                style={{
                    position: 'absolute', left: 0, top: 0, bottom: 0,
                    background: `linear-gradient(90deg, ${T.magenta}70, ${T.lavender})`,
                    borderRadius: 1, transformOrigin: 'left',
                    boxShadow: `0 0 12px ${T.lavender}80, 0 0 4px ${T.lavender}`,  // ← double shadow
                }}
            />
            {/* Head dot — bigger, brighter */}
            <motion.div
                animate={{ left: `${progress * 100}%` }}
                transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] as any }}
                style={{
                    position: 'absolute', top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 6, height: 6,
                    borderRadius: '50%',
                    background: T.lavender,
                    boxShadow: `0 0 12px ${T.lavender}, 0 0 24px ${T.lavender}70, 0 0 40px ${T.lavender}30`,
                }}
            />
        </div>
    </div>
);

// ─── CHAPTER ICON ORB ────────────────────────────────────────────────────────
const ChapterOrb: React.FC<{ icon: React.ElementType; color: string; active: boolean; pulsing?: boolean }> = ({ icon: Icon, color, active, pulsing }) => (
    <div style={{ position: 'relative', width: 52, height: 52, flexShrink: 0 }}>
        {(active || pulsing) && (
            <motion.div animate={{ scale: [1, 1.9, 1], opacity: [0.35, 0, 0.35] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                    position: 'absolute', inset: -6, borderRadius: '50%',
                    border: `1px solid ${color}`, pointerEvents: 'none'
                }}
            />
        )}
        <motion.div animate={{
            background: active ? `radial-gradient(circle,${color}30,${color}08)` : 'radial-gradient(circle,rgba(255,255,255,0.05),rgba(255,255,255,0.01))',
            boxShadow: active ? `0 0 24px ${color}50, inset 0 0 12px ${color}15` : 'none',
            borderColor: active ? `${color}50` : 'rgba(255,255,255,0.07)',
        }}
            transition={{ duration: 0.6 }}
            style={{
                width: '100%', height: '100%', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.07)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
            <Icon size={20} style={{ color: active ? color : 'rgba(255,255,255,0.2)', strokeWidth: 1.5, transition: 'color 0.5s' }} />
        </motion.div>
    </div>
);

// ─── CHAPTER DATA ─────────────────────────────────────────────────────────────
const CHAPTERS = [
    { id: 'observer', num: 'I', subtitle: 'You Are Not Your Mind', desc: 'Witness the voice in your head and discover the gap of awareness behind it.', icon: Mic, color: '#B8A5D4' },
    { id: 'inner-body', num: 'II', subtitle: 'The Inner Body', desc: 'Move consciousness from the mind into the somatic field of the body.', icon: Activity, color: '#D16BA5' },
    { id: 'gaps', num: 'III', subtitle: 'Mindful Gaps', desc: 'Insert spaces of no-mind into the flow of your daily routine.', icon: Bell, color: '#C4A8C8' },
    { id: 'panic', num: 'IV', subtitle: 'Beyond the Storm', desc: 'Immediate grounding tools for when the mind-storm is too loud.', icon: AlertCircle, color: '#D4857A' },
];

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
interface PowerOfNowProps { initialChapter?: string; onReturn?: () => void; }

export const PowerOfNow: React.FC<PowerOfNowProps> = ({ initialChapter, onReturn }) => {
    const { isListening, transcript, reflection, isProcessing, startListening, stopListening } = useWitnessingVoice();
    const { lastReminder, requestPermission } = usePresenceScheduler();
    const [panicMode, setPanicMode] = useState(false);
    const [presenceValue, setPresenceValue] = useState(45);
    const [groundingText, setGroundingText] = useState('');
    const [expanded, setExpanded] = useState<string | null>(initialChapter || 'observer');
    const [notificationsEnabled, setNotificationsEnabled] = useState(Notification.permission === 'granted');

    useEffect(() => { if (initialChapter) setExpanded(initialChapter); }, [initialChapter]);

    const handleEnableNotifications = () => { requestPermission(); setNotificationsEnabled(true); };
    const togglePanic = () => setPanicMode(p => !p);
    const runGrounding = async (input: string) => {
        const exercise = await getNoMindGrounding(input);
        setGroundingText(exercise);
        setPresenceValue(p => Math.min(100, p + 10));
    };

    // ── HEADER PAGE-IN ─────────────────────────────────────────────────────────
    const pageIn = {
        hidden: { opacity: 0, y: 16, filter: 'blur(12px)' },
        visible: {
            opacity: 1, y: 0, filter: 'blur(0px)',
            transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] as any, staggerChildren: 0.1 }
        },
    };
    const childIn = {
        hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
        visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] as any } },
    };

    return (
        <div style={{ width: '100%', maxWidth: 860, margin: '0 auto', padding: '48px 24px 160px', boxSizing: 'border-box', position: 'relative' }}>
            <GrainOverlay />

            {/* ── PERSISTENT AMBIENT GLOW (lives outside AnimatePresence) ── */}
            <motion.div
                animate={{ opacity: [0.07, 0.15, 0.07], scale: [1, 1.08, 1] }}
                transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                    position: 'fixed', top: '35%', left: '50%', transform: 'translateX(-50%)',
                    width: 700, height: 500, borderRadius: '50%',
                    background: `radial-gradient(ellipse,${T.magenta}40,transparent)`,
                    filter: 'blur(130px)', pointerEvents: 'none', zIndex: 0,
                }}
            />

            {/* ── TOP NAV ─────────────────────────────────────────────────────── */}
            <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 72, position: 'relative', zIndex: 1 }}>
                <NavPill onClick={onReturn}>Return Home</NavPill>
            </nav>

            <motion.div variants={pageIn} initial="hidden" animate="visible" style={{ position: 'relative', zIndex: 1 }}>

                {/* ════════════════════════════════════════════════════════════════
            HEADER — floating, no card box
        ════════════════════════════════════════════════════════════════ */}
                <motion.header variants={childIn} style={{ marginBottom: 80, position: 'relative' }}>
                    {/* Glow IS the container */}
                    <motion.div
                        animate={{ opacity: [0.1, 0.2, 0.1] }}
                        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                        style={{
                            position: 'absolute', inset: '-40px -60px', borderRadius: '50%',
                            background: `radial-gradient(ellipse,${T.magenta}20,transparent)`,
                            filter: 'blur(80px)', pointerEvents: 'none'
                        }}
                    />

                    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 32 }}>
                        {/* Label row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Sparkles size={12} style={{ color: T.teal, opacity: 0.55, strokeWidth: 1.5 }} />
                            <span style={{
                                fontSize: 9, letterSpacing: '0.6em', textTransform: 'uppercase',
                                color: 'rgba(255,255,255,0.2)', fontFamily: 'system-ui,sans-serif', fontWeight: 700
                            }}>
                                Consciousness Stream
                            </span>
                        </div>

                        {/* Title + Presence side by side */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 24 }}>
                            <div>
                                <h1 style={{
                                    fontSize: 'clamp(40px, 5vw, 64px)',
                                    fontWeight: 300, letterSpacing: '-0.015em', margin: 0,
                                    lineHeight: 0.95,
                                    fontFamily: 'Georgia, serif',
                                    color: 'rgba(255,255,255,0.92)',
                                }}>
                                    The Power<br />of Now
                                </h1>
                                <p style={{
                                    fontSize: 9, letterSpacing: '0.65em', textTransform: 'uppercase',
                                    color: `${T.teal}40`, fontFamily: 'system-ui, sans-serif',
                                    fontWeight: 700, marginTop: 16,
                                }}>
                                    Eckhart Tolle · Living Study
                                </p>
                            </div>

                            {/* Presence frequency — a sacred number, not a badge */}
                            <div style={{ textAlign: 'right', paddingTop: 8 }}>
                                <p style={{
                                    fontSize: 8, letterSpacing: '0.5em', textTransform: 'uppercase',
                                    color: 'rgba(255,255,255,0.15)', fontFamily: 'system-ui, sans-serif',
                                    fontWeight: 700, margin: '0 0 6px',
                                }}>
                                    Presence
                                </p>
                                <motion.span
                                    key={presenceValue}
                                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as any }}
                                    style={{
                                        fontSize: 44,
                                        fontWeight: 300,
                                        fontFamily: 'Georgia, serif',
                                        color: T.magenta,
                                        lineHeight: 1,
                                        display: 'block',
                                        textShadow: `0 0 30px ${T.magenta}40`,
                                    }}>
                                    {presenceValue}
                                    <span style={{ fontSize: 14, opacity: 0.5, marginLeft: 2, color: 'rgba(184, 165, 212, 0.6)' }}>%</span>
                                </motion.span>
                            </div>
                        </div>

                        {/* Progress filament */}
                        <div style={{ paddingTop: 8 }}>
                            <ProgressFilament progress={presenceValue / 100} label="Spiritual Resonance" />
                        </div>
                    </div>
                </motion.header>

                {/* ════════════════════════════════════════════════════════════════
            CURRICULUM — Chapter Accordion
        ════════════════════════════════════════════════════════════════ */}
                <motion.div variants={childIn} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {CHAPTERS.map((chapter, idx) => {
                        const isOpen = expanded === chapter.id;
                        return (
                            <motion.div key={chapter.id} layout style={{ position: 'relative' }}>
                                {/* Chapter glow — only when open */}
                                <AnimatePresence>
                                    {isOpen && (
                                        <>
                                            {/* Wide ambient — very dim */}
                                            <motion.div
                                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                                transition={{ duration: 1.2 }}
                                                style={{
                                                    position: 'absolute', inset: '-20px -40px', borderRadius: 48,
                                                    background: chapter.color,
                                                    filter: 'blur(80px)',
                                                    opacity: 0.04,
                                                    pointerEvents: 'none',
                                                }}
                                            />
                                            {/* Tight edge accent — top-left origin only */}
                                            <motion.div
                                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                                transition={{ duration: 0.8 }}
                                                style={{
                                                    position: 'absolute', top: -4, left: -4, width: 80, height: 80,
                                                    background: chapter.color,
                                                    filter: 'blur(24px)',
                                                    opacity: 0.08,
                                                    borderRadius: '50%',
                                                    pointerEvents: 'none',
                                                }}
                                            />
                                        </>
                                    )}
                                </AnimatePresence>

                                <motion.div
                                    layout
                                    animate={{
                                        // Collapsed: subtle glass pill
                                        // Expanded: borderless, background dissolves to near-zero
                                        background: isOpen
                                            ? 'rgba(255,255,255,0.01)'
                                            : 'rgba(255,255,255,0.015)',
                                        borderColor: isOpen
                                            ? 'rgba(255,255,255,0.04)'
                                            : 'rgba(255,255,255,0.05)',
                                    }}
                                    transition={{ duration: 0.6 }}
                                    style={{
                                        borderRadius: 32, border: '1px solid rgba(255,255,255,0.05)',
                                        overflow: 'hidden', position: 'relative', zIndex: 1
                                    }}
                                >
                                    {/* ── CHAPTER TRIGGER ── */}
                                    <button
                                        onClick={() => setExpanded(isOpen ? null : chapter.id)}
                                        style={{
                                            width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                                            padding: '20px 28px', display: 'flex', alignItems: 'center', gap: 20,
                                            textAlign: 'left',
                                        }}
                                    >
                                        <ChapterOrb icon={chapter.icon} color={chapter.color} active={isOpen} />

                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                                                <span style={{
                                                    fontSize: 8, letterSpacing: '0.55em', textTransform: 'uppercase',
                                                    color: 'rgba(255,255,255,0.14)', fontFamily: 'system-ui,sans-serif', fontWeight: 700
                                                }}>
                                                    Chapter {chapter.num}
                                                </span>
                                                <motion.div
                                                    animate={{ rotate: isOpen ? 90 : 0, opacity: isOpen ? 0.6 : 0.2 }}
                                                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as any }}
                                                    style={{ color: 'white' }}
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                                        <path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </motion.div>
                                            </div>
                                            <h4 style={{
                                                fontSize: 28, fontWeight: 300, fontFamily: 'Georgia,serif',
                                                color: isOpen ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.55)',
                                                margin: 0, letterSpacing: '-0.01em', transition: 'color 0.4s'
                                            }}>
                                                {chapter.subtitle}
                                            </h4>
                                            {/* Description fades in only when closed on hover — handled via AnimatePresence */}
                                            <AnimatePresence>
                                                {!isOpen && (
                                                    <motion.p
                                                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 0.35, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        style={{
                                                            fontSize: 12, fontFamily: 'Georgia,serif', fontStyle: 'italic',
                                                            color: 'rgba(255,255,255,0.3)', marginTop: 6, lineHeight: 1.6,
                                                            overflow: 'hidden', fontWeight: 300
                                                        }}>
                                                        {chapter.desc}
                                                    </motion.p>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </button>

                                    {/* ── CHAPTER CONTENT ── */}
                                    <AnimatePresence>
                                        {isOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1, transition: { height: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as any }, opacity: { duration: 0.5, delay: 0.2 } } }}
                                                exit={{ height: 0, opacity: 0, transition: { height: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as any }, opacity: { duration: 0.2 } } }}
                                                style={{ overflow: 'hidden' }}
                                            >
                                                {/* Chapter lead text */}
                                                <div style={{ padding: '0 28px 16px 100px', borderLeft: 'none' }}>
                                                    <p style={{
                                                        fontSize: 13, fontFamily: 'Georgia,serif', fontStyle: 'italic',
                                                        color: 'rgba(255,255,255,0.35)', lineHeight: 1.75, fontWeight: 300,
                                                        paddingLeft: 16, borderLeft: '1px solid rgba(255,255,255,0.07)', maxWidth: 520
                                                    }}>
                                                        {chapter.desc}
                                                    </p>
                                                </div>

                                                {/* ── CHAPTER I: WITNESS THE VOICE ── */}
                                                {chapter.id === 'observer' && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                                                        transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] as any }}
                                                        style={{ padding: '20px 28px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32, textAlign: 'center' }}
                                                    >
                                                        {/* Mic orb */}
                                                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            {/* Three-layer atmospheric glow on the mic */}
                                                            <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.08, 0.18, 0.08] }}
                                                                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                                                                style={{
                                                                    position: 'absolute', width: 160, height: 160, borderRadius: '50%',
                                                                    background: '#B8A5D4', filter: 'blur(40px)', pointerEvents: 'none'
                                                                }} />
                                                            <AnimatePresence>
                                                                {isListening && (
                                                                    <motion.div
                                                                        initial={{ scale: 1, opacity: 0.5 }} animate={{ scale: 2.5, opacity: 0 }}
                                                                        transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                                                                        style={{ position: 'absolute', width: 88, height: 88, borderRadius: '50%', background: '#B8A5D4' }}
                                                                    />
                                                                )}
                                                            </AnimatePresence>
                                                            <motion.div
                                                                animate={{
                                                                    background: isListening
                                                                        ? `radial-gradient(circle, #B8A5D440, #B8A5D410)`
                                                                        : 'radial-gradient(circle,rgba(255,255,255,0.06),rgba(255,255,255,0.02))',
                                                                    boxShadow: isListening ? `0 0 40px #B8A5D460` : 'none',
                                                                    borderColor: isListening ? '#B8A5D460' : 'rgba(255,255,255,0.08)',
                                                                }}
                                                                transition={{ duration: 0.6 }}
                                                                style={{
                                                                    width: 88, height: 88, borderRadius: '50%',
                                                                    border: '1px solid rgba(255,255,255,0.08)',
                                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'
                                                                }}
                                                            >
                                                                <Mic size={28} strokeWidth={1.5}
                                                                    style={{ color: isListening ? '#B8A5D4' : 'rgba(255,255,255,0.25)', transition: 'color 0.5s' }} />
                                                            </motion.div>
                                                        </div>

                                                        <div>
                                                            <h3 style={{
                                                                fontSize: 36, fontWeight: 300, fontFamily: 'Georgia,serif',
                                                                color: 'rgba(255,255,255,0.88)', margin: '0 0 12px', letterSpacing: '-0.01em'
                                                            }}>
                                                                Witness the Voice
                                                            </h3>
                                                            <p style={{
                                                                fontSize: 13, color: 'rgba(255,255,255,0.28)', maxWidth: 380, lineHeight: 1.75,
                                                                fontFamily: 'Georgia,serif', fontStyle: 'italic', fontWeight: 300, margin: '0 auto'
                                                            }}>
                                                                Share a thought that has been circling. Let the Observer's light shine on it.
                                                            </p>
                                                        </div>

                                                        <GhostButton onMouseDown={startListening} onMouseUp={stopListening} accentColor={T.teal}>
                                                            {isListening ? 'Listening with Deep Presence…' : 'Anchor Consciousness'}
                                                        </GhostButton>

                                                        {/* Transcript + Reflection */}
                                                        <AnimatePresence>
                                                            {(transcript || reflection || isProcessing) && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, y: 24, filter: 'blur(10px)' }}
                                                                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                                                    exit={{ opacity: 0 }}
                                                                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as any }}
                                                                    style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, textAlign: 'left' }}
                                                                >
                                                                    {/* Mind's form */}
                                                                    <div>
                                                                        <p style={{
                                                                            fontSize: 8, letterSpacing: '0.5em', textTransform: 'uppercase',
                                                                            color: 'rgba(255,255,255,0.18)', fontFamily: 'system-ui,sans-serif',
                                                                            fontWeight: 700, marginBottom: 14
                                                                        }}>Mind's Form</p>
                                                                        <div style={{
                                                                            padding: '24px 28px', borderRadius: 24,
                                                                            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)'
                                                                        }}>
                                                                            <p style={{
                                                                                fontSize: 20, fontFamily: 'Georgia,serif', fontStyle: 'italic',
                                                                                color: 'rgba(255,255,255,0.4)', lineHeight: 1.65, margin: 0, fontWeight: 300
                                                                            }}>
                                                                                "{transcript || 'Listening to the thought…'}"
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    {/* Presence's light */}
                                                                    <div>
                                                                        <p style={{
                                                                            fontSize: 8, letterSpacing: '0.5em', textTransform: 'uppercase',
                                                                            color: `${T.teal}60`, fontFamily: 'system-ui,sans-serif',
                                                                            fontWeight: 700, marginBottom: 14
                                                                        }}>Presence's Light</p>
                                                                        <div style={{
                                                                            padding: '24px 28px', borderRadius: 24,
                                                                            background: `${T.teal}08`, border: `1px solid ${T.teal}15`
                                                                        }}>
                                                                            <p style={{
                                                                                fontSize: 20, fontFamily: 'Georgia,serif',
                                                                                color: T.teal, lineHeight: 1.65, margin: 0, fontWeight: 300
                                                                            }}>
                                                                                {isProcessing ? 'Seeing beyond the veil…' : (reflection || 'Silent witnessing…')}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </motion.div>
                                                )}

                                                {/* ── CHAPTER II: INNER BODY ── */}
                                                {chapter.id === 'inner-body' && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                                                        transition={{ duration: 0.8, delay: 0.15 }}
                                                        style={{ padding: '16px 28px 40px' }}>
                                                        <BodyTruthTest />
                                                    </motion.div>
                                                )}

                                                {/* ── CHAPTER III: MINDFUL GAPS ── */}
                                                {chapter.id === 'gaps' && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                                                        transition={{ duration: 0.8, delay: 0.15 }}
                                                        style={{ padding: '16px 28px 48px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28, textAlign: 'center' }}
                                                    >
                                                        {/* Bell orb */}
                                                        <div style={{ position: 'relative' }}>
                                                            <motion.div animate={{ opacity: [0.06, 0.14, 0.06] }}
                                                                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                                                                style={{
                                                                    position: 'absolute', width: 120, height: 120, borderRadius: '50%',
                                                                    background: '#C4A8C8', filter: 'blur(40px)', top: '50%', left: '50%',
                                                                    transform: 'translate(-50%,-50%)', pointerEvents: 'none'
                                                                }} />
                                                            <div style={{
                                                                width: 72, height: 72, borderRadius: '50%',
                                                                background: `#C4A8C810`, border: `1px solid #C4A8C820`,
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                            }}>
                                                                <Bell size={26} strokeWidth={1.5} style={{ color: '#C4A8C8' }} />
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <h3 style={{
                                                                fontSize: 34, fontWeight: 300, fontFamily: 'Georgia,serif',
                                                                color: 'rgba(255,255,255,0.88)', margin: '0 0 12px'
                                                            }}>
                                                                The Routine as Ritual
                                                            </h3>
                                                            <p style={{
                                                                fontSize: 13, fontStyle: 'italic', fontFamily: 'Georgia,serif',
                                                                color: 'rgba(255,255,255,0.28)', maxWidth: 360, lineHeight: 1.75,
                                                                fontWeight: 300, margin: '0 auto'
                                                            }}>
                                                                Every transition is an invitation to leave the mind and arrive in the Now.
                                                            </p>
                                                        </div>

                                                        {notificationsEnabled
                                                            ? <GhostButton disabled accentColor={T.teal}>Reminders Active</GhostButton>
                                                            : <SolidButton onClick={handleEnableNotifications} color={T.teal}>Awaken Reminders</SolidButton>
                                                        }

                                                        <AnimatePresence>
                                                            {lastReminder && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                                                    style={{
                                                                        width: '100%', paddingTop: 28,
                                                                        borderTop: '1px solid rgba(255,255,255,0.05)',
                                                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16
                                                                    }}
                                                                >
                                                                    <p style={{
                                                                        fontSize: 8, letterSpacing: '0.5em', textTransform: 'uppercase',
                                                                        color: 'rgba(255,255,255,0.18)', fontFamily: 'system-ui,sans-serif', fontWeight: 700
                                                                    }}>
                                                                        Latest Gate to Presence
                                                                    </p>
                                                                    <div style={{
                                                                        padding: '20px 28px', background: 'rgba(255,255,255,0.02)',
                                                                        borderRadius: 20, border: '1px solid rgba(255,255,255,0.05)', maxWidth: 400
                                                                    }}>
                                                                        <p style={{
                                                                            fontSize: 20, color: T.teal, fontStyle: 'italic',
                                                                            fontFamily: 'Georgia,serif', lineHeight: 1.65, margin: 0, fontWeight: 300
                                                                        }}>
                                                                            "{lastReminder}"
                                                                        </p>
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </motion.div>
                                                )}

                                                {/* ── CHAPTER IV: BEYOND THE STORM ── */}
                                                {chapter.id === 'panic' && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                                                        transition={{ duration: 0.8, delay: 0.15 }}
                                                        style={{ padding: '16px 28px 48px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28, textAlign: 'center' }}
                                                    >
                                                        <div style={{ position: 'relative' }}>
                                                            <motion.div animate={{ opacity: [0.06, 0.16, 0.06] }}
                                                                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                                                                style={{
                                                                    position: 'absolute', width: 130, height: 130, borderRadius: '50%',
                                                                    background: T.rose, filter: 'blur(40px)', top: '50%', left: '50%',
                                                                    transform: 'translate(-50%,-50%)', pointerEvents: 'none'
                                                                }} />
                                                            <div style={{
                                                                width: 72, height: 72, borderRadius: '50%',
                                                                background: `${T.rose}10`, border: `1px solid ${T.rose}20`,
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                            }}>
                                                                <AlertCircle size={26} strokeWidth={1.5} style={{ color: T.rose }} />
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <h3 style={{
                                                                fontSize: 34, fontWeight: 300, fontFamily: 'Georgia,serif',
                                                                color: 'rgba(255,255,255,0.88)', margin: '0 0 12px'
                                                            }}>
                                                                Emergency Awareness
                                                            </h3>
                                                            <p style={{
                                                                fontSize: 13, fontStyle: 'italic', fontFamily: 'Georgia,serif',
                                                                color: 'rgba(255,255,255,0.28)', maxWidth: 360, lineHeight: 1.75,
                                                                fontWeight: 300, margin: '0 auto'
                                                            }}>
                                                                When the storm of noise is too loud, return to the inner body anchor immediately.
                                                            </p>
                                                        </div>

                                                        <GhostButton onClick={togglePanic} accentColor={T.rose}>
                                                            Activate Rescue Anchor
                                                        </GhostButton>
                                                    </motion.div>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </motion.div>

            {/* ════════════════════════════════════════════════════════════════
          PANIC OVERLAY
      ════════════════════════════════════════════════════════════════ */}
            <AnimatePresence>
                {panicMode && (
                    <motion.div
                        initial={{ opacity: 0, filter: 'blur(20px)' }}
                        animate={{ opacity: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, filter: 'blur(20px)' }}
                        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] as any }}
                        style={{
                            position: 'fixed', inset: 0, zIndex: 1000,
                            background: 'rgba(13,0,20,0.98)', backdropFilter: 'blur(40px)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32,
                        }}
                    >
                        {/* Rose atmospheric glow */}
                        <motion.div
                            animate={{ opacity: [0.08, 0.18, 0.08], scale: [1, 1.1, 1] }}
                            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                            style={{
                                position: 'absolute', width: 600, height: 600, borderRadius: '50%',
                                background: `radial-gradient(circle,${T.rose}40,transparent)`,
                                filter: 'blur(120px)', pointerEvents: 'none'
                            }}
                        />

                        <motion.div
                            initial={{ opacity: 0, y: 32 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] as any }}
                            style={{ maxWidth: 560, width: '100%', textAlign: 'center', position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}
                        >
                            {/* Rose orb */}
                            <div style={{ position: 'relative', width: 80, height: 80 }}>
                                <motion.div animate={{ scale: [1, 1.6, 1], opacity: [0.3, 0, 0.3] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                                    style={{
                                        position: 'absolute', inset: -8, borderRadius: '50%',
                                        border: `1px solid ${T.rose}60`
                                    }} />
                                <div style={{
                                    width: '100%', height: '100%', borderRadius: '50%',
                                    background: `${T.rose}12`, border: `1px solid ${T.rose}30`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <AlertCircle size={28} strokeWidth={1.5} style={{ color: T.rose }} />
                                </div>
                            </div>

                            <div>
                                <h2 style={{
                                    fontSize: 72, fontWeight: 300, fontFamily: 'Georgia,serif',
                                    color: 'rgba(255,255,255,0.92)', margin: '0 0 16px', letterSpacing: '-0.02em', lineHeight: 1
                                }}>
                                    Stay Here
                                </h2>
                                <p style={{
                                    fontSize: 18, fontFamily: 'Georgia,serif', fontStyle: 'italic',
                                    color: 'rgba(255,255,255,0.35)', lineHeight: 1.75, fontWeight: 300, margin: 0
                                }}>
                                    {groundingText || 'The thoughts are noise. Your breath is the silence.\nFeel the life within your hands right now.'}
                                </p>
                            </div>

                            {/* Bottom divider */}
                            <div style={{ width: 60, height: 1, background: `linear-gradient(90deg,transparent,${T.rose}40,transparent)` }} />

                            {!groundingText ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 360 }}>
                                    <motion.button
                                        whileHover={{ background: 'rgba(255,255,255,0.06)' }} whileTap={{ scale: 0.97 }}
                                        onClick={() => runGrounding('Panic')}
                                        style={{
                                            padding: '20px 32px', borderRadius: 24, background: 'rgba(255,255,255,0.03)',
                                            border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.65)',
                                            fontFamily: 'Georgia,serif', fontSize: 20, fontWeight: 300, fontStyle: 'italic',
                                            cursor: 'pointer', transition: 'background 0.3s'
                                        }}>
                                        I am lost in worry
                                    </motion.button>
                                    <button onClick={togglePanic}
                                        style={{
                                            background: 'none', border: 'none', cursor: 'pointer', fontSize: 8,
                                            letterSpacing: '0.5em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)',
                                            fontFamily: 'system-ui,sans-serif', fontWeight: 700, padding: '12px',
                                            transition: 'color 0.3s'
                                        }}
                                        onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
                                        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.2)')}>
                                        No, I have returned
                                    </button>
                                </div>
                            ) : (
                                <SolidButton onClick={() => setGroundingText('')} color={T.teal}>
                                    I have Returned
                                </SolidButton>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
