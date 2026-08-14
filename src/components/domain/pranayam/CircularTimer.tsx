import React from 'react';
import {
  SPECS_BY_LEVEL,
  type PranayamLevel,
  PHASE_COLORS,
  type PranayamType,
  activePhases,
  cycleSeconds,
  resolveBreath,
  phaseLabel,
} from './breathPattern';

interface CircularTimerProps {
  relTime: number;
  type?: PranayamType;
  level?: PranayamLevel;
}

function polarToXY(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const start = polarToXY(cx, cy, r, startDeg);
  const end = polarToXY(cx, cy, r, endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y}`;
}

export const CircularTimer: React.FC<CircularTimerProps> = ({
  relTime,
  type = 'bhastrika',
  level = 'beginner',
}) => {
  const spec = SPECS_BY_LEVEL[level][type];
  const state = resolveBreath(spec, relTime);

  const secondsLeft = state.practiceSecondsLeft;
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const timeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const activeColor = state.resting || !state.started ? '#CFA864' : PHASE_COLORS[state.phase];
  const cx = 200, cy = 200, r = 155;

  const phases = activePhases(spec);
  const cycle = cycleSeconds(spec);
  const segments: Array<{ key: typeof phases[number]; startDeg: number; endDeg: number; midDeg: number; color: string }> = [];
  let runDeg = 0;
  for (const key of phases) {
    const span = (spec.pattern[key] / cycle) * 360;
    segments.push({
      key,
      startDeg: runDeg,
      endDeg: runDeg + span,
      midDeg: runDeg + span / 2,
      color: PHASE_COLORS[key],
    });
    runDeg += span;
  }

  const dotAngle = state.started && !state.resting ? state.cycleProgress * 360 : 0;
  const dotPos = polarToXY(cx, cy, r, dotAngle);

  let centreLabel = phaseLabel(spec, state.phase, state.side);
  if (!state.started) centreLabel = 'GET READY';
  else if (state.resting) centreLabel = 'REST';

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      {/* Top Counters Bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', padding: '0 24px' }}>
        <div style={{ backgroundColor: 'rgba(255, 253, 248, 0.9)', border: '1.5px solid rgba(207, 168, 100, 0.35)', borderRadius: '16px', padding: '8px 18px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(122, 106, 88, 0.08)' }}>
          <span style={{ fontSize: '14px' }}>🔄</span>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '13px', fontWeight: 800, color: '#CFA864', letterSpacing: '0.1em' }}>
            BREATH <span style={{ color: '#1C160F', fontSize: '16px' }}>{state.turnInRound}</span> / {spec.breathsPerRound}
          </span>
        </div>

        <div style={{ backgroundColor: 'rgba(255, 253, 248, 0.9)', border: '1.5px solid rgba(207, 168, 100, 0.35)', borderRadius: '16px', padding: '8px 18px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(122, 106, 88, 0.08)' }}>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '13px', fontWeight: 800, color: '#CFA864', letterSpacing: '0.1em' }}>
            ROUND <span style={{ color: '#1C160F', fontSize: '16px' }}>{state.round}</span> OF {spec.rounds}
          </span>
        </div>
      </div>

      {/* SVG Circular Ring Display */}
      <div style={{ position: 'relative', width: '380px', height: '380px', marginTop: '40px' }}>
        <svg viewBox="0 0 400 400" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          {/* Background Track */}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(207, 168, 100, 0.15)" strokeWidth={18} />

          {/* Phase Colored Arcs */}
          {segments.map((seg) => (
            <path
              key={seg.key}
              d={arcPath(cx, cy, r, seg.startDeg + 0.5, seg.endDeg - 0.5)}
              fill="none"
              stroke={seg.color}
              strokeWidth={18}
              strokeLinecap="round"
              style={{ opacity: state.phase === seg.key && !state.resting ? 1 : 0.45, transition: 'stroke 0.3s ease, opacity 0.3s ease' }}
            />
          ))}

          {/* Faint Meditating Figure Watermark Outline inside Center */}
          <g transform="translate(145, 135) scale(1.1)" opacity={0.12} stroke="#1C160F" strokeWidth="2" fill="none">
            <circle cx="50" cy="25" r="14" />
            <path d="M 20 85 C 20 55, 80 55, 80 85 Z" />
            <path d="M 10 90 Q 50 105 90 90" />
          </g>

          {/* Traveling Dot Indicator on Circle Path */}
          <circle
            cx={dotPos.x}
            cy={dotPos.y}
            r={14}
            fill="#ffffff"
            stroke={activeColor}
            strokeWidth={4}
            style={{ filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.2))' }}
          />
        </svg>

        {/* Center Labels */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 40px' }}>
          <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '38px', fontWeight: 700, color: activeColor, textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: 1.1 }}>
            {centreLabel}
          </div>
        </div>
      </div>

      {/* Timer Counter Below Ring */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
        <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '42px', fontWeight: 700, color: '#1C160F', letterSpacing: '0.02em' }}>
          {timeFormatted}
        </span>
        <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '13px', fontWeight: 800, color: '#CFA864', letterSpacing: '0.16em', textTransform: 'uppercase' }}>
          REMAINING
        </span>
      </div>
    </div>
  );
};
