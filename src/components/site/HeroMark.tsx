import { useMemo } from 'react';
import type { Palette } from '../../lib/siteTheme';

// ─────────────────────────────────────────────────────────────────────────────
// HeroMark — the brand's geometric figure, drawn as inline SVG.
//
// Echoes the Metatron's-cube mark in the logo with 13 nodes, rotating dashed
// guide rings, and a pulsing central compass star.
// Pure inline SVG — zero extra network requests, scales crisp to any size.
// ─────────────────────────────────────────────────────────────────────────────

const TAU = Math.PI * 2;

function ring(count: number, radius: number, offsetDeg = 0): [number, number][] {
  return Array.from({ length: count }, (_, i) => {
    const a = (i / count) * TAU + (offsetDeg * Math.PI) / 180;
    return [Math.cos(a) * radius, Math.sin(a) * radius] as [number, number];
  });
}

interface Props {
  palette?: Palette;
  size?: number;
  opacity?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function HeroMark({ palette, size = 380, opacity = 1, className = '', style = {} }: Props) {
  const { nodes, edges } = useMemo(() => {
    // 13 nodes: the centre, an inner hexagon, and an outer hexagon at twice the radius
    const inner = ring(6, 26, 30);
    const outer = ring(6, 52, 30);
    const pts: [number, number][] = [[0, 0], ...inner, ...outer];

    const segs: [number, number][][] = [];
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const d = Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1]);
        if (d <= 54.5) segs.push([pts[i], pts[j]]);
      }
    }
    return { nodes: pts, edges: segs };
  }, []);

  const isDark = palette?.isDark ?? false;
  const stroke = palette?.PURPLE || (isDark ? '#D4CDE8' : '#4A3260');
  const accent = palette?.BROWN  || (isDark ? '#C4913A' : '#7A5F44');

  return (
    <div
      aria-hidden="true"
      className={className}
      style={{
        position: 'relative',
        width: size,
        height: size,
        maxWidth: '92vw',
        maxHeight: '92vw',
        pointerEvents: 'none',
        flexShrink: 0,
        opacity,
        ...style,
      }}
    >
      <svg viewBox="-72 -72 144 144" width="100%" height="100%" style={{ display: 'block', overflow: 'visible' }}>
        <defs>
          <radialGradient id="hm-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={accent} stopOpacity={isDark ? 0.30 : 0.20} />
            <stop offset="55%" stopColor={stroke} stopOpacity={isDark ? 0.13 : 0.09} />
            <stop offset="100%" stopColor={stroke} stopOpacity="0" />
          </radialGradient>
          <linearGradient id="hm-line" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={stroke} stopOpacity="0.85" />
            <stop offset="100%" stopColor={accent} stopOpacity="0.85" />
          </linearGradient>
        </defs>

        {/* Soft halo */}
        <circle cx="0" cy="0" r="70" fill="url(#hm-glow)" />

        {/* Slow counter-rotating guide rings */}
        <g className="hm-spin-slow" style={{ transformOrigin: 'center' }}>
          <circle cx="0" cy="0" r="62" fill="none" stroke={stroke} strokeOpacity="0.22" strokeWidth="0.5" strokeDasharray="1.5 5" />
        </g>
        <g className="hm-spin-rev" style={{ transformOrigin: 'center' }}>
          <circle cx="0" cy="0" r="55" fill="none" stroke={accent} strokeOpacity="0.26" strokeWidth="0.5" />
        </g>

        {/* The figure */}
        <g>
          {edges.map(([a, b], i) => (
            <line
              key={i}
              x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]}
              stroke="url(#hm-line)" strokeOpacity="0.42" strokeWidth="0.42" strokeLinecap="round"
            />
          ))}
          {nodes.map(([x, y], i) => (
            <circle
              key={i}
              cx={x} cy={y} r={i === 0 ? 9.5 : 7.5}
              fill="none" stroke={stroke} strokeOpacity={i === 0 ? 0.5 : 0.33} strokeWidth="0.5"
            />
          ))}
        </g>

        {/* Centre light — the warm compass star */}
        <circle cx="0" cy="0" r="3.6" fill={accent} opacity="0.9" className="hm-pulse" style={{ transformOrigin: 'center' }} />
        <path
          d="M0-15 L1.5-1.5 L15 0 L1.5 1.5 L0 15 L-1.5 1.5 L-15 0 L-1.5-1.5 Z"
          fill={accent}
          opacity={isDark ? 0.5 : 0.38}
          className="hm-pulse"
          style={{ transformOrigin: 'center' }}
        />
      </svg>

      <style>{`
        @keyframes hm-rot { to { transform: rotate(360deg); } }
        @keyframes hm-rot-rev { to { transform: rotate(-360deg); } }
        @keyframes hm-breathe { 0%,100% { opacity: .45; transform: scale(.94); } 50% { opacity: .95; transform: scale(1.06); } }
        .hm-spin-slow { animation: hm-rot 78s linear infinite; }
        .hm-spin-rev  { animation: hm-rot-rev 54s linear infinite; }
        .hm-pulse     { animation: hm-breathe 7s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .hm-spin-slow, .hm-spin-rev, .hm-pulse { animation: none; }
        }
      `}</style>
    </div>
  );
}
