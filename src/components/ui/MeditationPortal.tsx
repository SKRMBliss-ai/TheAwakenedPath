import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Play, Pause, RotateCcw, ChevronRight } from 'lucide-react';
import { AwakenStage } from './SacredCircle';
import { VoiceService, useVoiceActive } from '../../services/voiceService';

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const T = {
    magenta: '#D16BA5',
    teal: '#ABCEC9',
    plum: '#0D0014',
};

// ─── GRAIN OVERLAY ────────────────────────────────────────────────────────────
const GrainOverlay = () => (
    <svg style={{
        position: 'fixed', inset: 0, width: '100%', height: '100%',
        opacity: 0.025, pointerEvents: 'none', zIndex: 200,
    }}>
        <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
    </svg>
);

// ─── AMBIENT QUOTES ───────────────────────────────────────────────────────────
const QUOTES = [
    'The present moment is the only moment available to us.',
    'Breathe, and know that you are alive.',
    'Your stillness is your strength.',
    'Witness the flow without becoming it.',
    'Everything you need is already here.',
];

// ─── PROPS ────────────────────────────────────────────────────────────────────
interface MeditationPortalProps {
    title: string;
    currentStepTitle: string;
    currentStepInstruction: string;
    onNext: () => void;
    onReset: () => void;
    onTogglePlay: () => void;
    isPlaying: boolean;
    progress: number;
    children?: React.ReactNode;
}

// ══════════════════════════════════════════════════════════════════════════════
export const MeditationPortal: React.FC<MeditationPortalProps> = ({
    currentStepTitle,
    currentStepInstruction,
    onNext,
    onReset,
    onTogglePlay,
    isPlaying,
    progress,
    children,
}) => {
    const [timer, setTimer] = useState(0);
    const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);
    const [practiceCount] = useState(() => Math.floor(Math.random() * 5000 + 10000).toLocaleString());
    const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);
    const isVoiceActive = useVoiceActive();

    // Magnetic orb tilt on mouse move
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const rotateX = useSpring(useTransform(mouseY, [-400, 400], [7, -7]), { stiffness: 25, damping: 18 });
    const rotateY = useSpring(useTransform(mouseX, [-400, 400], [-7, 7]), { stiffness: 25, damping: 18 });

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
                // Account for sidebar on large screens (288px is equivalent to Tailwind's w-72)
                left: isLargeScreen ? '288px' : '0px',
                zIndex: 100, overflow: 'hidden',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                background: T.plum,
                maxHeight: '100vh',
            }}
        >
            <GrainOverlay />

            {/* ── THREE-LAYER DEPTH BACKGROUND ──────────────────────────────────── */}
            {/* Layer 1 — deep plum undertow, slow */}
            <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.12, 0.22, 0.12] }}
                transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                    position: 'absolute', inset: 0,
                    background: `radial-gradient(ellipse 80% 70% at 50% 40%, #2D104050, transparent)`,
                    pointerEvents: 'none',
                }}
            />
            {/* Layer 2 — magenta mid glow */}
            <motion.div
                animate={{ scale: [1, 1.08, 1], opacity: [0.06, 0.14, 0.06] }}
                transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                style={{
                    position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
                    width: 600, height: 600, borderRadius: '50%',
                    background: `radial-gradient(circle, ${T.magenta}40, transparent)`,
                    filter: 'blur(120px)', pointerEvents: 'none',
                }}
            />
            {/* Layer 3 — teal heart, tight + fast — responds to voice */}
            <motion.div
                animate={{
                    scale: isVoiceActive ? [1, 1.4, 1] : [0.95, 1.05, 0.95],
                    opacity: isVoiceActive ? [0.15, 0.35, 0.15] : [0.04, 0.1, 0.04],
                }}
                transition={{ duration: isVoiceActive ? 2 : 5, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                    position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)',
                    width: 280, height: 280, borderRadius: '50%',
                    background: `radial-gradient(circle, ${T.teal}80, transparent)`,
                    filter: 'blur(60px)', pointerEvents: 'none',
                }}
            />

            {/* ── HEADER ───────────────────────────────────────────────────────── */}
            <header style={{
                position: 'relative', zIndex: 30, width: '100%',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '28px 40px', boxSizing: 'border-box', flexShrink: 0,
            }}>
                {/* Timer pill */}
                <motion.div
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] as any }}
                    style={{
                        padding: '8px 18px', borderRadius: 100,
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        backdropFilter: 'blur(20px)',
                    }}
                >
                    <span style={{
                        fontSize: 12, letterSpacing: '0.2em', color: `${T.teal}90`,
                        fontFamily: 'ui-monospace, monospace', fontWeight: 400,
                    }}>
                        {fmt(timer)}
                    </span>
                </motion.div>

                {/* Practicing count */}
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.3 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 10 }}
                >
                    {/* Live pulse dot */}
                    <div style={{ position: 'relative', width: 7, height: 7 }}>
                        <motion.div
                            animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                            style={{
                                position: 'absolute', inset: 0, borderRadius: '50%',
                                background: T.teal,
                            }}
                        />
                        <div style={{
                            position: 'absolute', inset: 1, borderRadius: '50%',
                            background: T.teal,
                            boxShadow: `0 0 10px ${T.teal}`,
                        }} />
                    </div>
                    <span style={{
                        fontSize: 9, letterSpacing: '0.4em', textTransform: 'uppercase',
                        color: 'rgba(255,255,255,0.2)',
                        fontFamily: 'system-ui, sans-serif', fontWeight: 700,
                    }}>
                        {practiceCount} present
                    </span>
                </motion.div>
            </header>

            {/* ── MAIN STAGE ───────────────────────────────────────────────────── */}
            <main style={{
                position: 'relative', zIndex: 20, flex: 1, width: '100%',
                maxWidth: 1400, margin: '0 auto',
                display: 'flex', flexDirection: isLargeScreen ? 'row' : 'column',
                alignItems: 'center', justifyContent: 'center',
                padding: '0 48px', boxSizing: 'border-box',
                gap: 64, overflow: 'hidden',
            }}>

                {/* ── ORB ZONE — pure void, no container ──────────────────────── */}
                <div style={{
                    position: 'relative', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    {/* Circular progress ring */}
                    <svg
                        width={380} height={380}
                        style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%) scale(0.85) sm:scale(1)', pointerEvents: 'none' }}
                    >
                        {/* Track */}
                        <circle cx={190} cy={190} r={178} fill="none"
                            stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
                        {/* Progress arc */}
                        <motion.circle
                            cx={190} cy={190} r={178} fill="none"
                            stroke={`url(#arcGradient)`} strokeWidth={1.5}
                            strokeLinecap="round"
                            strokeDasharray={2 * Math.PI * 178}
                            initial={{ strokeDashoffset: 2 * Math.PI * 178 }}
                            animate={{ strokeDashoffset: 2 * Math.PI * 178 * (1 - progress) }}
                            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] as any }}
                            transform="rotate(-90 190 190)"
                            style={{ filter: `drop-shadow(0 0 6px ${T.teal}80)` }}
                        />
                        <defs>
                            <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor={T.magenta} stopOpacity="0.6" />
                                <stop offset="100%" stopColor={T.teal} stopOpacity="0.9" />
                            </linearGradient>
                        </defs>
                        {/* Progress head dot */}
                        <motion.circle
                            cx={190} cy={190 - 178} r={3} fill={T.teal}
                            style={{ filter: `drop-shadow(0 0 6px ${T.teal})`, transformOrigin: "190px 190px" }}
                            animate={{ rotate: 360 * progress }}
                        />
                    </svg>

                    {/* The orb — magnetic tilt */}
                    <motion.div style={{ scale: isLargeScreen ? 1 : 0.75 }}>
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
                    maxWidth: 500,
                }}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStepInstruction}
                            initial={{ opacity: 0, filter: 'blur(20px)', y: 32 }}
                            animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
                            exit={{ opacity: 0, filter: 'blur(20px)', y: -20 }}
                            transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] as any }}
                            style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
                        >
                            {/* Step label */}
                            <span style={{
                                fontSize: 9, letterSpacing: '0.7em', textTransform: 'uppercase',
                                color: `${T.teal}50`,
                                fontFamily: 'system-ui, sans-serif', fontWeight: 700,
                            }}>
                                {currentStepTitle}
                            </span>

                            {/* Instruction */}
                            <h2 style={{
                                fontSize: 'clamp(28px, 4.5vw, 58px)',
                                fontWeight: 300,
                                fontFamily: 'Georgia, "Times New Roman", serif',
                                color: 'rgba(255,255,255,0.88)',
                                lineHeight: 1.2,
                                letterSpacing: '-0.01em',
                                margin: 0,
                                textShadow: `0 0 80px ${T.magenta}20`,
                            }}>
                                {currentStepInstruction}
                            </h2>

                            {/* Ambient quote */}
                            <motion.p
                                animate={{ opacity: [0.12, 0.26, 0.12] }}
                                transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                                style={{
                                    fontSize: 16, fontWeight: 300, fontStyle: 'italic',
                                    fontFamily: 'Georgia, serif',
                                    color: 'rgba(255,255,255,0.5)',
                                    lineHeight: 1.75, letterSpacing: '0.03em',
                                    margin: '16px 0 0',
                                }}
                            >
                                {quote}
                            </motion.p>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            {/* ── FOOTER CONTROLS ──────────────────────────────────────────────── */}
            <footer style={{
                position: 'relative', zIndex: 30, width: '100%',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 20, paddingBottom: 40, flexShrink: 0,
            }}>
                {/* Progress fraction text */}
                <motion.span
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    style={{
                        fontSize: 8, letterSpacing: '0.5em', textTransform: 'uppercase',
                        color: 'rgba(255,255,255,0.15)',
                        fontFamily: 'system-ui, sans-serif', fontWeight: 700,
                    }}
                >
                    {Math.round(progress * 100)}% complete
                </motion.span>

                {/* Control row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 48 }}>

                    {/* Reset */}
                    <ControlButton onClick={onReset} label="restart">
                        <RotateCcw size={18} strokeWidth={1.5} />
                    </ControlButton>

                    {/* Play / Pause — the orb's sibling */}
                    <PlayButton isPlaying={isPlaying} onClick={onTogglePlay} />

                    {/* Next */}
                    <ControlButton onClick={onNext} label="next">
                        <ChevronRight size={20} strokeWidth={1.5} />
                    </ControlButton>
                </div>
            </footer>
        </div>
    );
};

// ─── CONTROL BUTTON — small ghost pill ────────────────────────────────────────
const ControlButton: React.FC<{ onClick: () => void; children: React.ReactNode; label: string }> = ({ onClick, children, label }) => {
    const [hov, setHov] = useState(false);
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <motion.button
                onHoverStart={() => setHov(true)} onHoverEnd={() => setHov(false)}
                whileTap={{ scale: 0.88 }} onClick={onClick}
                style={{
                    width: 52, height: 52, borderRadius: '50%', cursor: 'pointer',
                    background: hov ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${hov ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)'}`,
                    color: hov ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.5s cubic-bezier(0.16,1,0.3,1)',
                    boxShadow: hov ? `0 0 20px rgba(255,255,255,0.04)` : 'none',
                }}
            >
                {children}
            </motion.button>
            <span style={{
                fontSize: 7, letterSpacing: '0.4em', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.12)',
                fontFamily: 'system-ui, sans-serif', fontWeight: 700,
                opacity: hov ? 1 : 0, transition: 'opacity 0.3s',
            }}>{label}</span>
        </div>
    );
};

// ─── PLAY BUTTON — orb-sibling, center of the footer ─────────────────────────
const PlayButton: React.FC<{ isPlaying: boolean; onClick: () => void }> = ({ isPlaying, onClick }) => {
    const [hov, setHov] = useState(false);
    const T_local = { magenta: '#D16BA5', teal: '#ABCEC9' };

    return (
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Outer pulse — only when playing */}
            <AnimatePresence>
                {isPlaying && (
                    <motion.div
                        initial={{ scale: 1, opacity: 0.3 }}
                        animate={{ scale: 1.8, opacity: 0 }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeOut' }}
                        style={{
                            position: 'absolute', width: 88, height: 88, borderRadius: '50%',
                            border: `1px solid ${T_local.teal}`,
                            pointerEvents: 'none',
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Hover glow */}
            <motion.div
                animate={{ opacity: hov ? 1 : 0 }}
                style={{
                    position: 'absolute', width: 100, height: 100, borderRadius: '50%',
                    background: `radial-gradient(circle, ${T_local.magenta}20, transparent)`,
                    filter: 'blur(16px)', pointerEvents: 'none',
                }}
            />

            <motion.button
                onHoverStart={() => setHov(true)}
                onHoverEnd={() => setHov(false)}
                whileTap={{ scale: 0.93 }}
                onClick={onClick}
                style={{
                    position: 'relative', width: 88, height: 88, borderRadius: '50%',
                    cursor: 'pointer',
                    background: isPlaying
                        ? `radial-gradient(circle, rgba(255,255,255,0.07), rgba(255,255,255,0.02))`
                        : `radial-gradient(circle, ${T_local.teal}20, ${T_local.teal}05)`,
                    border: `1px solid ${isPlaying
                        ? (hov ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.08)')
                        : (hov ? `${T_local.teal}60` : `${T_local.teal}25`)}`,
                    color: isPlaying ? 'rgba(255,255,255,0.8)' : T_local.teal,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: isPlaying
                        ? (hov ? '0 0 40px rgba(255,255,255,0.06)' : 'none')
                        : (hov ? `0 0 40px ${T_local.teal}30` : `0 0 20px ${T_local.teal}10`),
                    transition: 'all 0.6s cubic-bezier(0.16,1,0.3,1)',
                }}
            >
                <AnimatePresence mode="wait">
                    {isPlaying ? (
                        <motion.div key="pause"
                            initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.6, opacity: 0 }} transition={{ duration: 0.25 }}>
                            <Pause size={24} strokeWidth={1.5} />
                        </motion.div>
                    ) : (
                        <motion.div key="play"
                            initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.6, opacity: 0 }} transition={{ duration: 0.25 }}>
                            <Play size={24} strokeWidth={1.5} style={{ marginLeft: 3 }} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>
        </div>
    );
};
