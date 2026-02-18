import React from 'react';
import { motion } from 'framer-motion';

// ─── TOKENS ──────────────────────────────────────────────────────────────────
const T = {
    magenta: '#D16BA5',
    magentaRgb: '209, 107, 165',
    teal: '#ABCEC9',
    tealRgb: '171, 206, 201',
};

// ─── SIZE MAP ─────────────────────────────────────────────────────────────────
const SIZE: Record<string, number> = {
    sm: 160,
    md: 240,
    lg: 300,
    xl: 340,
    '2xl': 400,
};

interface SacredCircleProps {
    text?: string;
    isAnimating?: boolean;
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

/**
 * SACRED CIRCLE — High fidelity implementation
 * Implements three-layer breathing glows, transparent void-glass core,
 * and cinematic light-weight typography.
 */
export const SacredCircle: React.FC<SacredCircleProps> = ({
    text = 'AWAKEN',
    isAnimating = false,
    size = 'xl',
}) => {
    const diameter = SIZE[size] ?? 340;

    return (
        /**
         * WRAPPER — transparent, no background, no border, no shadow.
         * Sized exactly to the circle so nothing rectangular bleeds out.
         * The only visual mass is the circle + its filter-applied glow.
         */
        <div style={{
            position: 'relative',
            width: diameter,
            height: diameter,
            // ─── THE KEY: transparent — inherits whatever is behind it ───
            background: 'transparent',
            border: 'none',
            boxShadow: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            // overflow:visible lets glows bleed outward past the div boundary
            overflow: 'visible',
        }}>

            {/* ══ LAYER 1: DEEP UNDERTOW — large, very soft, slow ══════════
          A wide elliptical bloom that fades into the plum background.
          Not clipped — it bleeds 120px beyond the circle in every direction.
          This is what creates the "floating" sensation.             */}
            <motion.div
                animate={{
                    scale: isAnimating ? [1, 1.18, 1] : [1, 1.06, 1],
                    opacity: isAnimating ? [0.22, 0.38, 0.22] : [0.1, 0.18, 0.1],
                }}
                transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                    position: 'absolute',
                    // Deliberately oversized — bleeds 120px beyond the orb
                    width: diameter + 240,
                    height: diameter + 240,
                    top: -120,
                    left: -120,
                    borderRadius: '50%',
                    background: `radial-gradient(circle, rgba(${T.magentaRgb}, 0.6) 0%, rgba(${T.magentaRgb}, 0) 70%)`,
                    filter: 'blur(70px)',
                    pointerEvents: 'none',
                    // mix-blend-mode: screen prevents the glow from
                    // darkening the background on its edges
                    mixBlendMode: 'screen',
                }}
            />

            {/* ══ LAYER 2: MID AURA — matches Soul Stats card glow ═════════
          This is the primary "Soul Stats style" magenta halo.
          Tighter radius, medium blur — gives the orb a warm backlight. */}
            <motion.div
                animate={{
                    scale: isAnimating ? [1, 1.25, 1] : [1, 1.1, 1],
                    opacity: isAnimating ? [0.45, 0.65, 0.45] : [0.25, 0.4, 0.25],
                }}
                transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                style={{
                    position: 'absolute',
                    width: diameter + 100,
                    height: diameter + 100,
                    top: -50,
                    left: -50,
                    borderRadius: '50%',
                    // rgba(230, 132, 174, 0.5) as specified — matches Soul Stats
                    background: `radial-gradient(circle, rgba(230, 132, 174, 0.55) 0%, rgba(${T.magentaRgb}, 0) 65%)`,
                    filter: 'blur(40px)',
                    pointerEvents: 'none',
                    mixBlendMode: 'screen',
                }}
            />

            {/* ══ LAYER 3: CORE FLICKER — tight, bright, fast ══════════════
          Sits just inside the orb boundary. Creates the sensation of
          an inner light source pulsing behind the frosted glass rim. */}
            <motion.div
                animate={{
                    scale: isAnimating ? [0.85, 1.05, 0.85] : [0.9, 0.98, 0.9],
                    opacity: isAnimating ? [0.5, 0.8, 0.5] : [0.2, 0.35, 0.2],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                style={{
                    position: 'absolute',
                    width: diameter * 0.7,
                    height: diameter * 0.7,
                    top: diameter * 0.15,
                    left: diameter * 0.15,
                    borderRadius: '50%',
                    background: `radial-gradient(circle, rgba(${T.magentaRgb}, 0.9) 0%, rgba(${T.magentaRgb}, 0) 70%)`,
                    filter: 'blur(24px)',
                    pointerEvents: 'none',
                    mixBlendMode: 'screen',
                }}
            />

            {/* ══ THE CIRCLE ITSELF ═════════════════════════════════════════
          Transparent background — the glow layers beneath provide
          all the color. The border is a barely-visible structural ring.
          filter: drop-shadow() applied here bleeds outward without
          clipping at the div boundary (unlike box-shadow).           */}
            <motion.div
                animate={isAnimating ? {
                    scale: [1, 1.015, 1],
                } : { scale: 1 }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                    position: 'relative',
                    width: diameter,
                    height: diameter,
                    borderRadius: '50%',

                    // ─── TRANSPARENT — never opaque ───────────────────────────
                    background: `
            radial-gradient(
              circle at 38% 38%,
              rgba(255, 255, 255, 0.06) 0%,
              rgba(255, 255, 255, 0.01) 40%,
              transparent 70%
            )
          `,

                    // ─── STRUCTURAL RING — barely visible ─────────────────────
                    border: '1px solid rgba(255, 255, 255, 0.08)',

                    // ─── THE SOUL STATS GLOW ──────────────────────────────────
                    // drop-shadow on the circle element itself — this is what
                    // makes it feel backlit and bleed into the background.
                    // Using filter: drop-shadow rather than box-shadow because
                    // box-shadow is clipped by overflow:hidden on parents.
                    filter: isAnimating
                        ? `
              drop-shadow(0 0 30px rgba(${T.magentaRgb}, 0.55))
              drop-shadow(0 0 80px rgba(${T.magentaRgb}, 0.25))
              drop-shadow(0 0 140px rgba(${T.magentaRgb}, 0.12))
            `
                        : `
              drop-shadow(0 0 20px rgba(${T.magentaRgb}, 0.35))
              drop-shadow(0 0 60px rgba(${T.magentaRgb}, 0.15))
            `,

                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2,
                }}
            >
                {/* ── AWAKEN TEXT ─────────────────────────────────────────── */}
                <motion.h2
                    animate={isAnimating ? {
                        opacity: [0.75, 1, 0.75],
                        textShadow: [
                            `0 0 20px rgba(255,255,255,0.3)`,
                            `0 0 40px rgba(255,255,255,0.6)`,
                            `0 0 20px rgba(255,255,255,0.3)`,
                        ],
                    } : {
                        opacity: 0.7,
                        textShadow: `0 0 20px rgba(255,255,255,0.2)`,
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    style={{
                        fontFamily: 'Georgia, "Times New Roman", serif',
                        fontWeight: 300,          // light — sacred inscription, not command
                        fontSize: Math.round(diameter * 0.1),
                        letterSpacing: '0.55em',
                        textTransform: 'uppercase',
                        color: 'rgba(255, 255, 255, 0.88)',
                        margin: 0,
                        userSelect: 'none',
                    }}
                >
                    {text}
                </motion.h2>
            </motion.div>

            {/* ══ OUTER STRUCTURAL RING — barely visible orbit ═════════════
          A second, larger ring gives depth without adding a container.
          Opacity so low it reads as negative space, not a border.    */}
            <div style={{
                position: 'absolute',
                width: diameter + 48,
                height: diameter + 48,
                top: -24,
                left: -24,
                borderRadius: '50%',
                border: '1px solid rgba(255, 255, 255, 0.035)',
                pointerEvents: 'none',
                zIndex: 1,
            }} />

            {/* ══ INNERMOST HIGHLIGHT ARC — top-left specular ══════════════
          A tiny bright arc at the top-left of the sphere, like light
          catching a glass surface. Pure CSS, no image needed.        */}
            <div style={{
                position: 'absolute',
                width: diameter * 0.45,
                height: diameter * 0.45,
                top: diameter * 0.06,
                left: diameter * 0.1,
                borderRadius: '50%',
                background: 'radial-gradient(circle at 40% 30%, rgba(255,255,255,0.06), transparent 65%)',
                pointerEvents: 'none',
                zIndex: 3,
            }} />
        </div>
    );
};

// ══════════════════════════════════════════════════════════════════════════════
// AWAKEN STAGE — drop-in wrapper for use in MeditationPortal
// Adds the magnetic tilt effect and ensures no rectangular parent
// ══════════════════════════════════════════════════════════════════════════════
interface AwakenStageProps {
    isAnimating?: boolean;
    size?: SacredCircleProps['size'];
    mouseX?: any;
    mouseY?: any;
}

export const AwakenStage: React.FC<AwakenStageProps> = ({
    isAnimating,
    size = 'xl',
    mouseX,
    mouseY,
}) => {
    // If no mouse motion values supplied, component works standalone
    return (
        <div style={{
            // The stage is also transparent — it is purely a positioning context
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            // overflow: visible — critical so glows are never clipped
            overflow: 'visible',
        }}>
            <motion.div
                style={{
                    ...(mouseX && mouseY ? {
                        rotateX: mouseX,   // caller passes in useSpring values
                        rotateY: mouseY,
                    } : {}),
                    transformPerspective: 1000,
                    // transparent wrapper — no visual mass
                    background: 'transparent',
                    overflow: 'visible', // Ensure no clipping here either
                }}
            >
                <SacredCircle isAnimating={isAnimating} size={size} />
            </motion.div>
        </div>
    );
};
