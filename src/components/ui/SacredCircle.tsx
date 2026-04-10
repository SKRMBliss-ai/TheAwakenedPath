import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../theme/ThemeSystem';

// ─── FONT TOKENS ─────────────────────────────────────────────────────────────
const fontSerif = "'Cormorant Garamond', Georgia, serif";

// ─── PARTICLE FIELD (canvas-based) ───────────────────────────────────────────
const ParticleField = ({ size, isLight, variant }: { size: number, isLight: boolean, variant: string }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particles = useRef<any[]>([]);
    const raf = useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = size * dpr;
        canvas.height = size * dpr;
        ctx.scale(dpr, dpr);

        const count = variant === 'A' ? 50 : variant === 'B' ? 35 : 70; // Slightly fewer particles for restraint
        const cx = size / 2;
        const cy = size / 2;
        const radius = size / 2 - 20;

        // Get particle color from CSS variable
        const particleColor = getComputedStyle(document.documentElement).getPropertyValue('--orb-particle').trim() || (isLight ? 'rgba(140, 100, 120, 0.3)' : 'rgba(220, 180, 200, 0.3)');

        particles.current = Array.from({ length: count }, () => {
            const angle = Math.random() * Math.PI * 2;
            const r = Math.random() * radius * 0.85;
            return {
                x: cx + Math.cos(angle) * r,
                y: cy + Math.sin(angle) * r,
                baseX: cx + Math.cos(angle) * r,
                baseY: cy + Math.sin(angle) * r,
                size: Math.random() * 1.2 + 0.3,
                speed: Math.random() * 0.0015 + 0.0008, // Slower drift
                offset: Math.random() * Math.PI * 2,
                alpha: Math.random() * 0.35 + 0.1,
            };
        });

        let time = 0;
        const animate = () => {
            ctx.clearRect(0, 0, size, size);
            time += 0.008; // Slower time step

            particles.current.forEach((p) => {
                const drift = Math.sin(time * p.speed * 100 + p.offset) * 6;
                const driftY = Math.cos(time * p.speed * 80 + p.offset) * 4;
                p.x = p.baseX + drift;
                p.y = p.baseY + driftY;

                const dist = Math.sqrt((p.x - cx) ** 2 + (p.y - cy) ** 2);
                if (dist > radius) return;

                const pulse = 0.5 + 0.5 * Math.sin(time * 1.5 + p.offset);
                const alpha = p.alpha * (0.6 + 0.4 * pulse);

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                // Extract base color if it's rgba
                const baseColor = particleColor.substring(0, particleColor.lastIndexOf(',')) || 'rgba(140, 100, 120';
                ctx.fillStyle = `${baseColor}, ${alpha})`;
                ctx.fill();
            });

            raf.current = requestAnimationFrame(animate);
        };
        animate();
        return () => cancelAnimationFrame(raf.current);
    }, [size, isLight, variant]);

    return (
        <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 pointer-events-none"
            style={{ width: size, height: size }}
        />
    );
};

// ─── MAIN SACRED CIRCLE COMPONENT ───────────────────────────────────────────
interface SacredCircleProps {
    variant?: 'A' | 'B' | 'C';
    size?: number | 'sm' | 'md' | 'lg' | 'xl';
    text?: string;
    isAnimating?: boolean;
}

const SIZE_MAP: Record<string, number> = {
    sm: 120,
    md: 220, // Reduced from 240/300
    lg: 260,
    xl: 300,
};

export const SacredCircle: React.FC<SacredCircleProps> = ({
    variant = 'A',
    size = 'md',
    text = 'AWAKEN',
    isAnimating = false,
}) => {
    const { mode } = useTheme();
    const isLight = mode === 'light';
    const s = typeof size === 'number' ? size : (SIZE_MAP[size] || 220);

    // Common Breathe Animation Class
    // Using CSS for infinite breathing as per rule 4
    const breatheClass = isAnimating ? "animate-[orb-breathe_5s_ease-in-out_infinite]" : "animate-[orb-breathe_7s_ease-in-out_infinite]";
    const innerPulseClass = isAnimating ? "animate-[innerPulse_4s_ease-in-out_infinite]" : "animate-[innerPulse_5s_ease-in-out_infinite]";

    const renderVariant = () => {
        switch (variant) {
            case 'A':
                return (
                    <div className="relative group" style={{ width: s, height: s }}>
                        {/* Outer breathing glow */}
                        <div
                            className={`absolute -inset-4 rounded-full pointer-events-none ${breatheClass} opacity-40`}
                            style={{
                                background: isLight
                                    ? "radial-gradient(circle, var(--accent-primary-dim) 0%, transparent 70%)"
                                    : "radial-gradient(circle, var(--glow-primary) 0%, transparent 70%)",
                            }}
                        />

                        {/* Main circle */}
                        <div
                            className={`relative w-full h-full rounded-full overflow-hidden ${breatheClass}`}
                            style={{
                                background: "var(--orb-fill)",
                                border: "1px solid var(--border-subtle)",
                                boxShadow: "var(--orb-shadow)",
                            }}
                        >
                            <ParticleField size={s} isLight={isLight} variant="A" />

                            {/* Edge light rim */}
                            <div className="absolute inset-0 rounded-full"
                                style={{
                                    background: isLight
                                        ? "radial-gradient(circle at 30% 25%, rgba(54, 171, 163, 0.35) 0%, transparent 60%)"
                                        : "radial-gradient(circle at 30% 25%, rgba(255,220,240,0.06) 0%, transparent 50%)",
                                }}
                            />

                            {/* AWAKEN text */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span
                                    className="font-light tracking-[0.3em] uppercase pointer-events-none text-center"
                                    style={{
                                        fontFamily: fontSerif,
                                        fontSize: s * 0.095,
                                        color: "var(--orb-text)",
                                        textShadow: isLight
                                            ? "0 0 15px rgba(255,255,255,0.4)"
                                            : "0 0 25px rgba(200,160,180,0.2)",
                                    }}
                                >
                                    {text}
                                </span>
                            </div>
                        </div>

                        {/* Single thin ring */}
                        <div
                            className={`absolute -inset-2 rounded-full border pointer-events-none ${breatheClass} opacity-30`}
                            style={{
                                borderColor: isLight
                                    ? "rgba(184, 112, 110, 0.15)"
                                    : "rgba(240, 160, 170, 0.1)",
                            }}
                        />
                    </div>
                );

            case 'B':
                return (
                    <div className="relative" style={{ width: s, height: s }}>
                        {/* Outer ring 2 */}
                        <div
                            className={`absolute -inset-[18px] rounded-full border-[0.5px] pointer-events-none ${breatheClass} opacity-20`}
                            style={{
                                borderColor: isLight
                                    ? "rgba(184, 112, 110, 0.12)"
                                    : "rgba(240, 160, 170, 0.08)",
                                animationDelay: '0.8s'
                            }}
                        />

                        {/* Outer ring 1 */}
                        <div
                            className={`absolute -inset-2 rounded-full border pointer-events-none ${breatheClass} opacity-30`}
                            style={{
                                borderColor: isLight
                                    ? "rgba(184, 112, 110, 0.2)"
                                    : "rgba(240, 160, 170, 0.12)",
                            }}
                        />

                        {/* Main circle */}
                        <div
                            className={`relative w-full h-full rounded-full overflow-hidden ${breatheClass}`}
                            style={{
                                background: "var(--orb-fill)",
                                border: "1px solid var(--border-subtle)",
                                boxShadow: "var(--orb-shadow)",
                            }}
                        >
                            <ParticleField size={s} isLight={isLight} variant="B" />

                            <div className="absolute inset-0 rounded-full"
                                style={{
                                    background: isLight
                                        ? "radial-gradient(circle at 35% 30%, rgba(54, 171, 163, 0.35) 0%, transparent 60%)"
                                        : "radial-gradient(circle at 35% 30%, rgba(255,220,240,0.04) 0%, transparent 45%)",
                                }}
                            />

                            <div className="absolute inset-0 flex items-center justify-center">
                                <span
                                    className="font-light tracking-[0.3em] uppercase pointer-events-none text-center"
                                    style={{
                                        fontFamily: fontSerif,
                                        fontSize: s * 0.092,
                                        color: "var(--orb-text)",
                                        textShadow: isLight
                                            ? "0 0 12px rgba(255,255,255,0.4)"
                                            : "0 0 20px rgba(200,160,180,0.15)",
                                    }}
                                >
                                    {text}
                                </span>
                            </div>
                        </div>
                    </div>
                );

            case 'C':
                return (
                    <div className="relative" style={{ width: s, height: s }}>
                        {/* Ambient glow behind */}
                        <div
                            className={`absolute -inset-[30px] rounded-full pointer-events-none ${breatheClass} opacity-30`}
                            style={{
                                background: isLight
                                    ? "radial-gradient(circle, var(--accent-primary-dim) 0%, transparent 60%)"
                                    : "radial-gradient(circle, var(--glow-primary) 0%, transparent 60%)",
                            }}
                        />

                        {/* Main circle — refined surface */}
                        <div
                            className={`relative w-full h-full rounded-full overflow-hidden ${breatheClass}`}
                            style={{
                                background: "var(--orb-fill)",
                                border: "1px solid var(--border-subtle)",
                                boxShadow: "var(--orb-shadow)",
                                backdropFilter: "var(--blur-val)",
                            }}
                        >
                            <ParticleField size={s} isLight={isLight} variant="C" />

                            {/* Center icon glow */}
                            <div
                                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none ${innerPulseClass}`}
                                style={{
                                    width: s * 0.22,
                                    height: s * 0.22,
                                    background: isLight
                                        ? "radial-gradient(circle, var(--accent-primary-dim) 0%, transparent 70%)"
                                        : "radial-gradient(circle, var(--glow-primary) 0%, transparent 70%)",
                                }}
                            />

                            <div className="absolute inset-0 flex items-center justify-center">
                                <span
                                    className="font-light tracking-[0.28em] uppercase pointer-events-none text-center"
                                    style={{
                                        fontFamily: fontSerif,
                                        fontSize: s * 0.088,
                                        color: "var(--orb-text)",
                                    }}
                                >
                                    {text}
                                </span>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div
            className="flex items-center justify-center pointer-events-none"
            style={{ width: s + 60, height: s + 60 }}
        >
            {renderVariant()}
        </div>
    );
};

// ─── AWAKEN STAGE WRAPPER ────────────────────────────────────────────────────
interface AwakenStageProps {
    isAnimating?: boolean;
    size?: SacredCircleProps['size'];
    variant?: SacredCircleProps['variant'];
    mouseX?: any;
    mouseY?: any;
}

export const AwakenStage: React.FC<AwakenStageProps> = ({
    isAnimating,
    size = 'md',
    variant = 'A',
    mouseX,
    mouseY,
}) => {
    return (
        <div className="relative flex items-center justify-center bg-transparent border-none overflow-visible">
            <motion.div
                style={{
                    ...(mouseX && mouseY ? {
                        rotateX: mouseX,
                        rotateY: mouseY,
                    } : {}),
                    transformPerspective: 1000,
                }}
                className="bg-transparent overflow-visible"
            >
                <SacredCircle isAnimating={isAnimating} size={size} variant={variant} />
            </motion.div>
        </div>
    );
};
