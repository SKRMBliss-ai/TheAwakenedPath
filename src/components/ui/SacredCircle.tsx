// SacredCircle.tsx
// Drop-in replacement. API is identical to the original.
//
// WHAT CHANGED — LIGHT MODE
//   · Orb: warm stone/parchment gradient instead of flat CSS var
//   · Top-left specular highlight gives physical sphere depth
//   · Bottom-right warm amber rim light (not teal)
//   · AWAKEN: dark warm brown, not cold grey
//   · Ambient glow: warm amber-stone, not blue-grey
//   · Inner rings: warm sepia, not teal
//
// WHAT CHANGED — DARK MODE
//   · Removed ALL pink/magenta bias
//     (rgba(255,220,240), rgba(200,160,180), rgba(240,160,170) all gone)
//   · Orb: deep plum-black with gold undertone
//   · Ambient glow: gold (#B8973A), matches nav/logo accent
//   · Inner rings: gold, not rose
//   · Outer ring: gold, not rose
//   · AWAKEN: warm cream, not harsh white
//   · Rim light: gold, not pink
//
// BOTH THEMES
//   · Particle colour: hardcoded rgba — no fragile substring() CSS parsing
//   · Outer ring animation phase-delayed 0.7s behind orb breathe
//     so it reads as a pulse radiating outward, not in sync
//   · Variants A/B/C all use the same corrected colour system

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../theme/ThemeSystem';

const fontSerif = "'Cormorant Garamond', Georgia, serif";

// ─────────────────────────────────────────────────────────────────────────────
// Theme tokens — single source of truth, no CSS var dependency
// ─────────────────────────────────────────────────────────────────────────────

const LIGHT = {
  orbBg: `radial-gradient(ellipse at 37% 29%,
    #EDE3D8 0%, #D3C3B6 32%, #B9A89A 62%, #9E8E80 100%)`,
  orbBorder:   '1.5px solid rgba(160,120,90,0.30)',
  orbShadow:   [
    '0 0 0 1.5px rgba(160,120,90,0.28)',
    '0 8px 44px rgba(110,80,55,0.22)',
    'inset 0 1.5px 0 rgba(255,255,255,0.52)',
    'inset 0 -1px 0 rgba(0,0,0,0.07)',
  ].join(', '),
  highlightBg:    'radial-gradient(ellipse at center, rgba(255,255,255,0.52) 0%, transparent 78%)',
  highlightStyle: { top:'7%', left:'13%', width:'46%', height:'34%', transform:'rotate(-18deg)' },
  rimBg:          'radial-gradient(ellipse at center, rgba(255,215,150,0.28) 0%, transparent 78%)',
  rimStyle:       { bottom:'9%', right:'9%', width:'34%', height:'23%' },
  innerRing1:     'rgba(160,120,90,0.20)',
  innerRing2:     'rgba(160,120,90,0.11)',
  outerRing:      'rgba(160,120,90,0.15)',
  ambientBg:      'radial-gradient(circle, rgba(160,120,90,0.16) 0%, transparent 68%)',
  textColor:      'rgba(55,36,24,0.72)',
  textShadow:     '0 1px 0 rgba(255,255,255,0.55)',
  pR: 95, pG: 65, pB: 45,   // particle: warm sepia
};

const DARK = {
  // Orb fill is noticeably lighter than the ~#0C0A0F app background —
  // deep plum purple so the sphere reads as a distinct object
  orbBg: `radial-gradient(ellipse at 38% 32%,
    #3D2640 0%,
    #261830 28%,
    #180E22 55%,
    #0E0818 80%,
    #080510 100%
  )`,
  // Gold border — visible enough to separate orb from background
  orbBorder: '1px solid rgba(184,151,58,0.28)',
  orbShadow: [
    '0 0 0 1px rgba(184,151,58,0.14)',
    '0 0 28px rgba(184,151,58,0.18)',   // gold halo — creates separation
    '0 0 70px rgba(184,151,58,0.08)',   // wide soft gold bloom
    '0 16px 60px rgba(0,0,0,0.70)',
    'inset 0 1px 0 rgba(255,255,255,0.07)',
    'inset 0 -1px 0 rgba(0,0,0,0.60)',
  ].join(', '),
  highlightBg:    'radial-gradient(ellipse at center, rgba(255,248,255,0.09) 0%, transparent 78%)',
  highlightStyle: { top:'7%', left:'13%', width:'42%', height:'30%', transform:'rotate(-18deg)' },
  // Gold rim bottom-right — more prominent in dark
  rimBg:    'radial-gradient(ellipse at center, rgba(184,151,58,0.22) 0%, transparent 78%)',
  rimStyle: { bottom:'10%', right:'9%', width:'36%', height:'24%' },
  innerRing1: 'rgba(184,151,58,0.20)',
  innerRing2: 'rgba(184,151,58,0.09)',
  outerRing:  'rgba(184,151,58,0.16)',
  // Ambient: gold centre fading to soft purple — creates halo that lifts orb off bg
  ambientBg: `radial-gradient(circle,
    rgba(184,151,58,0.16) 0%,
    rgba(120,80,160,0.07) 45%,
    transparent 70%
  )`,
  textColor:  'rgba(238,220,228,0.75)',
  // Gold glow on text — feels like candlelight
  textShadow: '0 0 18px rgba(184,151,58,0.35), 0 1px 0 rgba(0,0,0,0.55)',
  pR: 212, pG: 188, pB: 160,  // particles: warm gold-cream
};

// ─────────────────────────────────────────────────────────────────────────────
// Particle canvas
// ─────────────────────────────────────────────────────────────────────────────

const ParticleField: React.FC<{
  size: number;
  isLight: boolean;
  count?: number;
}> = ({ size, isLight, count = 44 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const raf = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width  = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const cx = size / 2, cy = size / 2, r = size / 2 - 20;
    const { pR, pG, pB } = isLight ? LIGHT : DARK;

    const ps = Array.from({ length: count }, () => {
      const a  = Math.random() * Math.PI * 2;
      const d  = Math.random() * r * 0.82;
      const bx = cx + Math.cos(a) * d;
      const by = cy + Math.sin(a) * d;
      return { bx, by, x: bx, y: by,
        sz:  Math.random() * 1.1 + 0.25,
        sp:  Math.random() * 0.0012 + 0.0007,
        off: Math.random() * Math.PI * 2,
        al:  Math.random() * 0.28 + 0.07,
      };
    });

    let t = 0;
    const animate = () => {
      ctx.clearRect(0, 0, size, size);
      t += 0.007;
      ps.forEach(p => {
        p.x = p.bx + Math.sin(t * p.sp * 100 + p.off) * 5;
        p.y = p.by + Math.cos(t * p.sp *  80 + p.off) * 4;
        if (Math.hypot(p.x - cx, p.y - cy) > r) return;
        const pulse = 0.5 + 0.5 * Math.sin(t * 1.4 + p.off);
        const alpha = p.al * (0.55 + 0.45 * pulse);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.sz, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${pR},${pG},${pB},${alpha})`;
        ctx.fill();
      });
      raf.current = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(raf.current);
  }, [size, isLight, count]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 pointer-events-none rounded-full"
      style={{ width: size, height: size }}
    />
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Shared orb interior
// ─────────────────────────────────────────────────────────────────────────────

const OrbInterior: React.FC<{
  s: number;
  isLight: boolean;
  text: string;
  breathDur: string;
  particleCount?: number;
}> = ({ s, isLight, text, breathDur, particleCount }) => {
  const th = isLight ? LIGHT : DARK;
  return (
    <div
      className="relative rounded-full overflow-hidden"
      style={{
        width: s, height: s,
        background: th.orbBg,
        border:     th.orbBorder,
        boxShadow:  th.orbShadow,
        animation:  `sacredBreathe ${breathDur} ease-in-out infinite`,
      }}
    >
      <ParticleField size={s} isLight={isLight} count={particleCount} />

      {/* Inner rings — phase-staggered */}
      {([th.innerRing2, th.innerRing1] as string[]).map((color, i) => (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width:  `${84 - i * 19}%`,
            height: `${84 - i * 19}%`,
            top: '50%', left: '50%',
            transform: 'translate(-50%,-50%)',
            border: `1px solid ${color}`,
            animation: `sacredRingPulse 6s ease-in-out infinite ${i * 0.55}s`,
          }}
        />
      ))}

      {/* Specular highlight */}
      <div
        className="absolute pointer-events-none rounded-full"
        style={{
          ...(th.highlightStyle as React.CSSProperties),
          background: th.highlightBg,
          position: 'absolute',
        }}
      />

      {/* Rim light */}
      <div
        className="absolute pointer-events-none rounded-full"
        style={{
          ...(th.rimStyle as React.CSSProperties),
          background: th.rimBg,
          position: 'absolute',
        }}
      />

      {/* Text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="pointer-events-none select-none text-center"
          style={{
            fontFamily:    fontSerif,
            fontWeight:    300,
            fontSize:      s * 0.095,
            letterSpacing: '0.30em',
            textTransform: 'uppercase',
            color:         th.textColor,
            textShadow:    th.textShadow,
          }}
        >
          {text}
        </span>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SacredCircle
// ─────────────────────────────────────────────────────────────────────────────

interface SacredCircleProps {
  variant?:     'A' | 'B' | 'C';
  size?:        number | 'sm' | 'md' | 'lg' | 'xl';
  text?:        string;
  isAnimating?: boolean;
}

const SIZE_MAP: Record<string, number> = { sm: 120, md: 220, lg: 260, xl: 300 };

export const SacredCircle: React.FC<SacredCircleProps> = ({
  variant     = 'A',
  size        = 'md',
  text        = 'AWAKEN',
  isAnimating = false,
}) => {
  const { mode } = useTheme();
  const isLight  = mode === 'light';
  const s        = typeof size === 'number' ? size : (SIZE_MAP[size] ?? 220);
  const th       = isLight ? LIGHT : DARK;
  const breathDur = isAnimating ? '5s' : '7s';

  const renderVariant = () => {
    if (variant === 'A') return (
      <div className="relative" style={{ width: s, height: s }}>
        {/* Ambient glow */}
        <div className="absolute rounded-full pointer-events-none"
          style={{ width: s * 1.35, height: s * 1.35,
            top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            background: th.ambientBg }} />
        {/* Outer ring — phase-delayed, feels like an emanation */}
        <div className="absolute rounded-full pointer-events-none"
          style={{ width: s + 28, height: s + 28,
            top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            border: `1px solid ${th.outerRing}`,
            animation: `sacredRingPulse ${breathDur} ease-in-out infinite 0.7s` }} />
        <OrbInterior s={s} isLight={isLight} text={text} breathDur={breathDur} />
      </div>
    );

    if (variant === 'B') return (
      <div className="relative" style={{ width: s, height: s }}>
        <div className="absolute rounded-full pointer-events-none"
          style={{ width: s + 36, height: s + 36,
            top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            border: `0.5px solid ${th.outerRing}`, opacity: 0.55,
            animation: `sacredRingPulse ${breathDur} ease-in-out infinite 1.1s` }} />
        <div className="absolute rounded-full pointer-events-none"
          style={{ width: s + 16, height: s + 16,
            top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            border: `1px solid ${th.outerRing}`,
            animation: `sacredRingPulse ${breathDur} ease-in-out infinite 0.5s` }} />
        <OrbInterior s={s} isLight={isLight} text={text} breathDur={breathDur} particleCount={36} />
      </div>
    );

    // Variant C
    return (
      <div className="relative" style={{ width: s, height: s }}>
        <div className="absolute rounded-full pointer-events-none"
          style={{ width: s * 1.5, height: s * 1.5,
            top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            background: th.ambientBg, opacity: 0.7 }} />
        <OrbInterior s={s} isLight={isLight} text={text} breathDur={breathDur} particleCount={64} />
      </div>
    );
  };

  return (
    <div
      className="flex items-center justify-center pointer-events-none"
      style={{ width: s + 60, height: s + 60 }}
    >
      {renderVariant()}

      <style>{`
        @keyframes sacredBreathe {
          0%,100% { transform: scale(1); }
          50%      { transform: scale(1.032); }
        }
        @keyframes sacredRingPulse {
          0%,100% { opacity: .30; transform: translate(-50%,-50%) scale(1); }
          50%     { opacity: .55; transform: translate(-50%,-50%) scale(1.038); }
        }
      `}</style>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// AwakenStage — identical public API
// ─────────────────────────────────────────────────────────────────────────────

interface AwakenStageProps {
  isAnimating?: boolean;
  size?:        SacredCircleProps['size'];
  variant?:     SacredCircleProps['variant'];
  mouseX?:      any;
  mouseY?:      any;
}

export const AwakenStage: React.FC<AwakenStageProps> = ({
  isAnimating,
  size    = 'md',
  variant = 'A',
  mouseX,
  mouseY,
}) => (
  <div className="relative flex items-center justify-center bg-transparent overflow-visible">
    <motion.div
      style={{
        ...(mouseX && mouseY ? { rotateX: mouseX, rotateY: mouseY } : {}),
        transformPerspective: 1000,
      }}
      className="bg-transparent overflow-visible"
    >
      <SacredCircle isAnimating={isAnimating} size={size} variant={variant} />
    </motion.div>
  </div>
);
