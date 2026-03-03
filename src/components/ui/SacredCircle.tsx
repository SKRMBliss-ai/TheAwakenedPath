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

        const count = variant === 'A' ? 60 : variant === 'B' ? 40 : 80;
        const cx = size / 2;
        const cy = size / 2;
        const radius = size / 2 - 20;

        particles.current = Array.from({ length: count }, () => {
            const angle = Math.random() * Math.PI * 2;
            const r = Math.random() * radius * 0.85;
            return {
                x: cx + Math.cos(angle) * r,
                y: cy + Math.sin(angle) * r,
                baseX: cx + Math.cos(angle) * r,
                baseY: cy + Math.sin(angle) * r,
                size: Math.random() * 1.5 + 0.3,
                speed: Math.random() * 0.002 + 0.001,
                offset: Math.random() * Math.PI * 2,
                alpha: Math.random() * 0.4 + 0.1,
            };
        });

        let time = 0;
        const animate = () => {
            ctx.clearRect(0, 0, size, size);
            time += 0.01;

            particles.current.forEach((p) => {
                const drift = Math.sin(time * p.speed * 100 + p.offset) * 8;
                const driftY = Math.cos(time * p.speed * 80 + p.offset) * 6;
                p.x = p.baseX + drift;
                p.y = p.baseY + driftY;

                const dist = Math.sqrt((p.x - cx) ** 2 + (p.y - cy) ** 2);
                if (dist > radius) return;

                const pulse = 0.5 + 0.5 * Math.sin(time * 2 + p.offset);
                const alpha = p.alpha * (0.6 + 0.4 * pulse);

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = isLight
                    ? `rgba(180, 140, 160, ${alpha})`
                    : `rgba(220, 180, 200, ${alpha})`;
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
    sm: 160,
    md: 240,
    lg: 300,
    xl: 340,
};

export const SacredCircle: React.FC<SacredCircleProps> = ({
    variant = 'A',
    size = 'md',
    text = 'AWAKEN',
    isAnimating = false,
}) => {
    const { mode } = useTheme();
    const isLight = mode === 'light';
    const s = typeof size === 'number' ? size : (SIZE_MAP[size] || 240);

    // Common Breathe Animation Class
    // Using CSS for infinite breathing as per rule 4
    const breatheClass = isAnimating ? "animate-[breathe_4s_ease-in-out_infinite]" : "animate-[breathe_6s_ease-in-out_infinite]";
    const breatheClassSlow = isAnimating ? "animate-[breathe_6s_ease-in-out_infinite]" : "animate-[breathe_8s_ease-in-out_infinite]";
    const innerPulseClass = isAnimating ? "animate-[innerPulse_3s_ease-in-out_infinite]" : "animate-[innerPulse_4s_ease-in-out_infinite]";

    const renderVariant = () => {
        switch (variant) {
            case 'A':
                return (
                    <div className="relative group" style={{ width: s, height: s }}>
                        {/* Outer breathing glow */}
                        <div
                            className={`absolute -inset-3 rounded-full pointer-events-none ${breatheClass}`}
                            style={{
                                background: isLight
                                    ? "radial-gradient(circle, rgba(200,160,180,0.15) 0%, transparent 70%)"
                                    : "radial-gradient(circle, rgba(200,140,180,0.12) 0%, transparent 70%)",
                            }}
                        />

                        {/* Main circle */}
                        <div
                            className={`relative w-full h-full rounded-full overflow-hidden shadow-2xl ${breatheClass}`}
                            style={{
                                background: isLight
                                    ? "radial-gradient(circle at 40% 35%, #f0e0ea 0%, #e8d4de 30%, #dcc8d6 60%, #d4bcc8 100%)"
                                    : "radial-gradient(circle at 40% 35%, #3a2535 0%, #2d1a28 30%, #221420 60%, #1a0e18 100%)",
                                boxShadow: isLight
                                    ? "0 0 0 1px rgba(200,160,180,0.15), 0 0 60px rgba(200,160,180,0.12), inset 0 0 40px rgba(255,255,255,0.08)"
                                    : "0 0 0 1px rgba(200,140,180,0.1), 0 0 80px rgba(180,100,160,0.08), inset 0 0 40px rgba(200,140,180,0.04)",
                            }}
                        >
                            <ParticleField size={s} isLight={isLight} variant="A" />

                            {/* Edge light rim */}
                            <div className="absolute inset-0 rounded-full"
                                style={{
                                    background: isLight
                                        ? "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.25) 0%, transparent 50%)"
                                        : "radial-gradient(circle at 30% 25%, rgba(255,220,240,0.06) 0%, transparent 50%)",
                                }}
                            />

                            {/* AWAKEN text */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span
                                    className="font-light tracking-[0.25em] uppercase pointer-events-none text-center"
                                    style={{
                                        fontFamily: fontSerif,
                                        fontSize: s * 0.1,
                                        color: isLight ? "rgba(255,255,255,0.85)" : "rgba(255,240,248,0.7)",
                                        textShadow: isLight
                                            ? "0 0 20px rgba(200,160,180,0.3)"
                                            : "0 0 30px rgba(200,140,180,0.2)",
                                    }}
                                >
                                    {text}
                                </span>
                            </div>
                        </div>

                        {/* Single thin ring */}
                        <div
                            className={`absolute -inset-1.5 rounded-full border pointer-events-none ${breatheClass}`}
                            style={{
                                borderColor: isLight
                                    ? "rgba(200,160,180,0.12)"
                                    : "rgba(200,140,180,0.08)",
                            }}
                        />
                    </div>
                );

            case 'B':
                return (
                    <div className="relative" style={{ width: s, height: s }}>
                        {/* Outer ring 2 */}
                        <div
                            className={`absolute -inset-[18px] rounded-full border-[0.5px] pointer-events-none ${breatheClassSlow}`}
                            style={{
                                borderColor: isLight
                                    ? "rgba(180,140,160,0.1)"
                                    : "rgba(200,160,180,0.06)",
                                animationDelay: '0.5s'
                            }}
                        />

                        {/* Outer ring 1 */}
                        <div
                            className={`absolute -inset-2 rounded-full border pointer-events-none ${breatheClass}`}
                            style={{
                                borderColor: isLight
                                    ? "rgba(200,160,180,0.18)"
                                    : "rgba(200,140,180,0.1)",
                            }}
                        />

                        {/* Main circle */}
                        <div
                            className={`relative w-full h-full rounded-full overflow-hidden shadow-2xl ${breatheClass}`}
                            style={{
                                background: isLight
                                    ? "radial-gradient(circle at 45% 40%, #ede0e8 0%, #e2d2dc 40%, #d8c6d0 100%)"
                                    : "radial-gradient(circle at 45% 40%, #2e1e2a 0%, #241828 40%, #1c1020 100%)",
                                boxShadow: isLight
                                    ? "0 0 0 1px rgba(200,160,180,0.12), 0 0 40px rgba(200,160,180,0.08)"
                                    : "0 0 0 1px rgba(200,140,180,0.08), 0 0 60px rgba(180,100,160,0.06)",
                            }}
                        >
                            <ParticleField size={s} isLight={isLight} variant="B" />

                            <div className="absolute inset-0 rounded-full"
                                style={{
                                    background: isLight
                                        ? "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.2) 0%, transparent 45%)"
                                        : "radial-gradient(circle at 35% 30%, rgba(255,220,240,0.04) 0%, transparent 45%)",
                                }}
                            />

                            <div className="absolute inset-0 flex items-center justify-center">
                                <span
                                    className="font-light tracking-[0.3em] uppercase pointer-events-none text-center"
                                    style={{
                                        fontFamily: fontSerif,
                                        fontSize: s * 0.095,
                                        color: isLight ? "rgba(255,255,255,0.8)" : "rgba(255,240,248,0.6)",
                                        textShadow: isLight
                                            ? "0 0 15px rgba(200,160,180,0.25)"
                                            : "0 0 20px rgba(200,140,180,0.15)",
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
                            className={`absolute -inset-[30px] rounded-full pointer-events-none ${breatheClass}`}
                            style={{
                                background: isLight
                                    ? "radial-gradient(circle, rgba(200,160,180,0.1) 0%, transparent 60%)"
                                    : "radial-gradient(circle, rgba(180,100,160,0.08) 0%, transparent 60%)",
                            }}
                        />

                        {/* Main circle — frosted glass */}
                        <div
                            className={`relative w-full h-full rounded-full overflow-hidden backdrop-blur-[20px] ${breatheClass}`}
                            style={{
                                background: isLight
                                    ? "radial-gradient(circle at 50% 50%, rgba(230,215,225,0.95) 0%, rgba(215,200,210,0.9) 100%)"
                                    : "radial-gradient(circle at 50% 50%, rgba(40,28,38,0.95) 0%, rgba(28,18,28,0.9) 100%)",
                                boxShadow: isLight
                                    ? "0 0 0 1px rgba(200,160,180,0.08), inset 0 0 60px rgba(200,160,180,0.06)"
                                    : "0 0 0 1px rgba(200,140,180,0.06), inset 0 0 60px rgba(180,100,160,0.04)",
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
                                        ? "radial-gradient(circle, rgba(200,140,170,0.2) 0%, transparent 70%)"
                                        : "radial-gradient(circle, rgba(200,140,180,0.15) 0%, transparent 70%)",
                                }}
                            />

                            <div className="absolute inset-0 flex items-center justify-center">
                                <span
                                    className="font-light tracking-[0.28em] uppercase pointer-events-none text-center"
                                    style={{
                                        fontFamily: fontSerif,
                                        fontSize: s * 0.09,
                                        color: isLight ? "rgba(120,90,108,0.7)" : "rgba(220,190,210,0.5)",
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
