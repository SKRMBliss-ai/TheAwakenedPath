import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Play, Pause, RotateCcw, ChevronRight, X, Volume2 } from 'lucide-react';
import { AwakenStage } from './SacredCircle';
import { VoiceService, useVoiceActive } from '../../services/voiceService';

// ─── SACRED UI TOKENS v4 — Theme-aware via CSS variables ────────────────────
const T = {
    magenta: 'var(--accent-primary)',
    magentaDim: 'var(--accent-primary-dim)',
    lavender: 'var(--accent-secondary)',
    lavenderDim: 'var(--accent-secondary-dim)',
    mauve: 'var(--accent-secondary-muted)',
    rose: 'var(--accent-primary-border)',
    plum: 'var(--bg-primary)',
    deep: 'var(--bg-secondary)',
    tealMuted: 'var(--text-muted)',
};

// ─── GRAIN OVERLAY — CSS-only, no SVG filter overhead ─────────────────────────
const GrainOverlay = () => (
    <div
        style={{
            position: 'fixed', inset: 0,
            opacity: 0.018, pointerEvents: 'none', zIndex: 200,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '256px 256px',
        }}
    />
);

// ─── PROPS ────────────────────────────────────────────────────────────────────
interface MeditationPortalProps {
    title: string;
    currentStepTitle: string;
    currentStepInstruction: string;
    totalSteps: number;
    currentStepIndex: number;
    onNext: () => void;
    onReset: () => void;
    onTogglePlay: () => void;
    onClose: () => void;
    isPlaying: boolean;
    progress: number;
    accentColor?: string;
    children?: React.ReactNode;
}

// ══════════════════════════════════════════════════════════════════════════════
export const MeditationPortal: React.FC<MeditationPortalProps> = ({
    title,
    currentStepTitle,
    currentStepInstruction,
    totalSteps,
    currentStepIndex,
    onNext,
    onReset,
    onTogglePlay,
    onClose,
    isPlaying,
    accentColor,
    children,
}) => {
    const [timer, setTimer] = useState(0);
    const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);
    const isVoiceActive = useVoiceActive();

    // Magnetic orb tilt
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const rotateX = useSpring(useTransform(mouseY, [-400, 400], [3, -3]), { stiffness: 10, damping: 30 });
    const rotateY = useSpring(useTransform(mouseX, [-400, 400], [-3, 3]), { stiffness: 10, damping: 30 });

    useEffect(() => {
        const handleResize = () => setIsLargeScreen(window.innerWidth >= 1024);
        window.addEventListener('resize', handleResize);
        let id: ReturnType<typeof setInterval>;
        if (isPlaying) id = setInterval(() => setTimer(t => t + 1), 1000);
        return () => {
            window.removeEventListener('resize', handleResize);
            clearInterval(id);
            VoiceService.stop();
        };
    }, [isPlaying]);

    const fmt = (s: number) =>
        `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        mouseX.set(e.clientX - left - width / 2);
        mouseY.set(e.clientY - top - height / 2);
    };

    return (
        <div
            onMouseMove={handleMouseMove}
            style={{
                position: 'fixed', inset: 0,
                left: isLargeScreen ? '288px' : '0px',
                zIndex: 100, overflow: 'hidden',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                background: T.plum,
                maxHeight: '100vh',
            }}
        >
            <GrainOverlay />

            {/* ── BACKGROUND — simplified to 2 layers ──────────────────────────── */}
            {/* Layer 1 — deep ambient undertow */}
            <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.18, 0.1] }}
                transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                    position: 'absolute', inset: 0,
                    background: `radial-gradient(ellipse 70% 60% at 50% 40%, var(--bg-secondary), transparent)`,
                    pointerEvents: 'none',
                }}
            />
            {/* Layer 2 — responsive center glow (reacts to voice) */}
            <motion.div
                animate={{
                    scale: isVoiceActive ? [1, 1.25, 1] : [0.95, 1.05, 0.95],
                    opacity: isVoiceActive ? [0.08, 0.2, 0.08] : [0.04, 0.1, 0.04],
                }}
                transition={{ duration: isVoiceActive ? 2.5 : 6, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                    position: 'absolute', top: '25%', left: '50%', transform: 'translateX(-50%)',
                    width: 400, height: 400, borderRadius: '50%',
                    background: `radial-gradient(circle, ${accentColor || 'var(--accent-secondary)'}40, transparent)`,
                    filter: 'blur(80px)', pointerEvents: 'none',
                }}
            />

            {/* ── HEADER ───────────────────────────────────────────────────────── */}
            <header style={{
                position: 'relative', zIndex: 30, width: '100%',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '20px 28px', boxSizing: 'border-box', flexShrink: 0,
            }}>
                {/* Close button */}
                <motion.button
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    onClick={onClose}
                    style={{
                        width: 40, height: 40, borderRadius: '50%', border: 'none',
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-muted)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'color 0.3s, border-color 0.3s',
                    }}
                    onMouseEnter={e => {
                        (e.target as HTMLElement).style.color = 'var(--text-primary)';
                        (e.target as HTMLElement).style.borderColor = 'var(--border-default)';
                    }}
                    onMouseLeave={e => {
                        (e.target as HTMLElement).style.color = 'var(--text-muted)';
                        (e.target as HTMLElement).style.borderColor = 'var(--border-subtle)';
                    }}
                >
                    <X size={16} strokeWidth={1.5} />
                </motion.button>

                {/* Timer + title pill */}
                <motion.div
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] as any }}
                    style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                    }}
                >
                    <span style={{
                        fontSize: 9, letterSpacing: '0.5em', textTransform: 'uppercase',
                        color: 'var(--text-muted)',
                        fontFamily: 'system-ui, sans-serif', fontWeight: 700,
                    }}>
                        {title}
                    </span>
                    <span style={{
                        fontSize: 18, letterSpacing: '0.15em', color: 'var(--text-secondary)',
                        fontFamily: 'Georgia, serif', fontWeight: 300,
                        fontVariantNumeric: 'tabular-nums',
                    }} className="font-serif">
                        {fmt(timer)}
                    </span>
                </motion.div>

                {/* Voice indicator */}
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.3 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                >
                    {isVoiceActive && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            {[0, 1, 2].map(i => (
                                <motion.div
                                    key={i}
                                    animate={{ scaleY: [0.4, 1, 0.4] }}
                                    transition={{
                                        duration: 0.8, repeat: Infinity,
                                        delay: i * 0.15, ease: 'easeInOut'
                                    }}
                                    style={{
                                        width: 2, height: 12, borderRadius: 1,
                                        background: 'var(--accent-secondary)',
                                        opacity: 0.6,
                                    }}
                                />
                            ))}
                        </div>
                    )}
                    <Volume2 size={14} style={{
                        color: isVoiceActive ? 'var(--accent-secondary)' : 'var(--text-muted)',
                        opacity: isVoiceActive ? 0.8 : 0.3,
                        transition: 'all 0.3s',
                    }} />
                </motion.div>
            </header>

            {/* ── STEP PROGRESS BAR — thin, beautiful ──────────────────────────── */}
            <div style={{
                width: '100%', maxWidth: 600, padding: '0 28px',
                boxSizing: 'border-box', flexShrink: 0,
            }}>
                <div style={{
                    display: 'flex', gap: 4,
                    width: '100%',
                }}>
                    {Array.from({ length: totalSteps }).map((_, i) => (
                        <div
                            key={i}
                            style={{
                                flex: 1, height: 2, borderRadius: 1,
                                background: i <= currentStepIndex
                                    ? (accentColor || 'var(--accent-secondary)')
                                    : 'var(--border-subtle)',
                                opacity: i <= currentStepIndex ? (i === currentStepIndex ? 1 : 0.5) : 0.3,
                                transition: 'all 0.6s cubic-bezier(0.16,1,0.3,1)',
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* ── MAIN STAGE ───────────────────────────────────────────────────── */}
            <main style={{
                position: 'relative', zIndex: 20, flex: 1, width: '100%',
                maxWidth: 1200, margin: '0 auto',
                display: 'flex', flexDirection: isLargeScreen ? 'row' : 'column',
                alignItems: 'center', justifyContent: 'center',
                padding: '0 40px', boxSizing: 'border-box',
                gap: isLargeScreen ? 64 : 32, overflow: 'hidden',
            }}>

                {/* ── ORB ZONE ──────────────────────────────────────────────── */}
                <div style={{
                    position: 'relative', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <motion.div style={{ scale: isLargeScreen ? 1 : 0.7 }}>
                        {children ?? (
                            <AwakenStage
                                isAnimating={isPlaying}
                                size="xl"
                                mouseX={rotateX}
                                mouseY={rotateY}
                            />
                        )}
                    </motion.div>
                </div>

                {/* ── TEXT ZONE ──────────────────────────────────────────────── */}
                <div style={{
                    flex: 1, display: 'flex', flexDirection: 'column',
                    alignItems: isLargeScreen ? 'flex-start' : 'center',
                    textAlign: isLargeScreen ? 'left' : 'center',
                    maxWidth: 480, gap: 16,
                }}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`${currentStepIndex}-${currentStepInstruction}`}
                            initial={{ opacity: 0, filter: 'blur(12px)', y: 20 }}
                            animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
                            exit={{ opacity: 0, filter: 'blur(12px)', y: -12 }}
                            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] as any }}
                            style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
                        >
                            {/* Step label — e.g. "Step 2 of 4 · The Scan" */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                <span style={{
                                    fontSize: 9, letterSpacing: '0.5em', textTransform: 'uppercase',
                                    color: accentColor || 'var(--accent-secondary)',
                                    fontFamily: 'system-ui, sans-serif', fontWeight: 700,
                                    opacity: 0.7,
                                }}>
                                    Step {currentStepIndex + 1} of {totalSteps}
                                </span>
                                <span style={{
                                    width: 3, height: 3, borderRadius: '50%',
                                    background: 'var(--text-muted)', opacity: 0.3,
                                }} />
                                <span style={{
                                    fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase',
                                    color: 'var(--text-muted)',
                                    fontFamily: 'system-ui, sans-serif', fontWeight: 600,
                                }}>
                                    {currentStepTitle}
                                </span>
                            </div>

                            {/* Instruction — the main text */}
                            <h2 style={{
                                fontSize: 'clamp(24px, 3.5vw, 44px)',
                                fontWeight: 300,
                                fontFamily: 'Georgia, serif',
                                color: 'var(--text-primary)',
                                lineHeight: 1.25,
                                margin: 0,
                            }} className="font-serif">
                                {currentStepInstruction}
                            </h2>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            {/* ── FOOTER CONTROLS ──────────────────────────────────────────────── */}
            <footer style={{
                position: 'relative', zIndex: 30, width: '100%',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 16, paddingBottom: 32, flexShrink: 0,
            }}>
                {/* Control row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
                    <ControlButton onClick={onReset} label="restart">
                        <RotateCcw size={16} strokeWidth={1.5} />
                    </ControlButton>

                    <PlayButton isPlaying={isPlaying} onClick={onTogglePlay} accentColor={accentColor} />

                    <ControlButton onClick={onNext} label="next">
                        <ChevronRight size={18} strokeWidth={1.5} />
                    </ControlButton>
                </div>
            </footer>
        </div>
    );
};

// ─── CONTROL BUTTON — smaller, cleaner ────────────────────────────────────────
const ControlButton: React.FC<{
    onClick: () => void;
    children: React.ReactNode;
    label: string;
}> = ({ onClick, children, label }) => {
    const [hov, setHov] = useState(false);
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <motion.button
                onHoverStart={() => setHov(true)} onHoverEnd={() => setHov(false)}
                whileTap={{ scale: 0.88 }} onClick={onClick}
                style={{
                    width: 48, height: 48, borderRadius: '50%', cursor: 'pointer',
                    background: hov ? 'var(--bg-secondary)' : 'var(--bg-surface)',
                    border: `1px solid ${hov ? 'var(--border-default)' : 'var(--border-subtle)'}`,
                    color: hov ? 'var(--text-primary)' : 'var(--text-muted)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.5s cubic-bezier(0.16,1,0.3,1)',
                    boxShadow: hov ? `0 0 16px var(--glow-primary)` : 'none',
                }}
            >
                {children}
            </motion.button>
            <span style={{
                fontSize: 7, letterSpacing: '0.4em', textTransform: 'uppercase',
                color: 'var(--text-muted)',
                fontFamily: 'system-ui, sans-serif', fontWeight: 700,
                opacity: hov ? 1 : 0, transition: 'opacity 0.3s',
                height: 10,
            }}>{label}</span>
        </div>
    );
};

// ─── PLAY BUTTON — uses accent color from practice ────────────────────────────
const PlayButton: React.FC<{
    isPlaying: boolean;
    onClick: () => void;
    accentColor?: string;
}> = ({ isPlaying, onClick, accentColor }) => {
    const [hov, setHov] = useState(false);
    const color = accentColor || 'var(--accent-secondary)';

    return (
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Outer pulse ring — only when playing */}
            <AnimatePresence>
                {isPlaying && (
                    <motion.div
                        initial={{ scale: 1, opacity: 0.25 }}
                        animate={{ scale: 1.7, opacity: 0 }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeOut' }}
                        style={{
                            position: 'absolute', width: 80, height: 80, borderRadius: '50%',
                            border: `1px solid ${color}`,
                            pointerEvents: 'none',
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Hover glow */}
            <motion.div
                animate={{ opacity: hov ? 0.8 : 0 }}
                style={{
                    position: 'absolute', width: 96, height: 96, borderRadius: '50%',
                    background: `radial-gradient(circle, ${color}15, transparent)`,
                    filter: 'blur(12px)', pointerEvents: 'none',
                }}
            />

            <motion.button
                onHoverStart={() => setHov(true)}
                onHoverEnd={() => setHov(false)}
                whileTap={{ scale: 0.93 }}
                onClick={onClick}
                style={{
                    position: 'relative', width: 80, height: 80, borderRadius: '50%',
                    cursor: 'pointer',
                    background: isPlaying
                        ? `radial-gradient(circle, rgba(255,255,255,0.06), rgba(255,255,255,0.02))`
                        : `radial-gradient(circle, ${color}18, ${color}05)`,
                    border: `1px solid ${isPlaying
                        ? (hov ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.07)')
                        : (hov ? `${color}50` : `${color}20`)}`,
                    color: isPlaying ? 'rgba(255,255,255,0.75)' : color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: isPlaying
                        ? (hov ? '0 0 30px rgba(255,255,255,0.04)' : 'none')
                        : (hov ? `0 0 30px ${color}20` : `0 0 12px ${color}08`),
                    transition: 'all 0.6s cubic-bezier(0.16,1,0.3,1)',
                }}
            >
                <AnimatePresence mode="wait">
                    {isPlaying ? (
                        <motion.div key="pause"
                            initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.6, opacity: 0 }} transition={{ duration: 0.25 }}>
                            <Pause size={22} strokeWidth={1.5} />
                        </motion.div>
                    ) : (
                        <motion.div key="play"
                            initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.6, opacity: 0 }} transition={{ duration: 0.25 }}>
                            <Play size={22} strokeWidth={1.5} style={{ marginLeft: 2 }} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>
        </div>
    );
};
