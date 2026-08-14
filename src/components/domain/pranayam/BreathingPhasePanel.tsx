import React from 'react';
import {
  SPECS_BY_LEVEL,
  type PranayamLevel,
  PHASE_COLORS,
  PHASE_ICONS,
  type PranayamType,
  activePhases,
  resolveBreath,
  phaseLabel,
} from './breathPattern';

interface BreathingPhasePanelProps {
  relTime: number;
  type: PranayamType;
  level?: PranayamLevel;
}

export const BreathingPhasePanel: React.FC<BreathingPhasePanelProps> = ({ relTime, type, level = 'beginner' }) => {
  const spec = SPECS_BY_LEVEL[level][type];
  const state = resolveBreath(spec, relTime);
  const phases = activePhases(spec);

  return (
    <div style={{
      width: '100%',
      backgroundColor: 'rgba(255, 253, 248, 0.95)',
      border: '1.5px solid rgba(207, 168, 100, 0.40)',
      borderRadius: '28px',
      padding: '24px 22px',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
      boxShadow: '0 16px 40px rgba(122, 106, 88, 0.12)',
      backdropFilter: 'blur(24px)',
      boxSizing: 'border-box'
    }}>
      {/* Header */}
      <div style={{
        fontFamily: "'Outfit', sans-serif",
        fontSize: '13px',
        fontWeight: 800,
        color: '#CFA864',
        letterSpacing: '0.22em',
        textTransform: 'uppercase'
      }}>
        TECHNIQUE PATTERN
      </div>

      {/* Phase Rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {phases.map((key) => {
          const isActive = state.phase === key && !state.resting && state.started;
          const label = phaseLabel(spec, key, state.side);
          const color = PHASE_COLORS[key];
          const dur = spec.pattern[key];

          return (
            <div
              key={key}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                borderRadius: '16px',
                backgroundColor: isActive ? 'rgba(255, 255, 255, 0.98)' : 'rgba(255, 253, 248, 0.5)',
                border: isActive ? `2px solid ${color}` : '1.5px solid rgba(207, 168, 100, 0.25)',
                boxShadow: isActive ? `0 8px 24px rgba(122, 106, 88, 0.15)` : 'none',
                overflow: 'hidden',
                transition: 'all 0.3s ease'
              }}
            >
              {/* Active Progress Bar Underlay */}
              {isActive && (
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    bottom: 0,
                    top: 0,
                    width: `${state.phaseProgress * 100}%`,
                    backgroundColor: `${color}18`,
                    transition: 'width 0.1s linear'
                  }}
                />
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', zIndex: 1 }}>
                <span style={{ fontSize: '18px' }}>{PHASE_ICONS[key]}</span>
                <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '15px', fontWeight: isActive ? 800 : 600, color: isActive ? '#1C160F' : '#6A5F52', letterSpacing: '0.06em' }}>
                  {label}
                </span>
              </div>

              <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '14px', fontWeight: 800, color: isActive ? color : '#9C8F7E', zIndex: 1 }}>
                {dur}S
              </span>
            </div>
          );
        })}
      </div>

      {/* Round Progress Footer */}
      <div style={{ borderTop: '1px border rgba(207, 168, 100, 0.3)', paddingTop: '14px', marginTop: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '11px', fontWeight: 800, color: '#CFA864', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
            ROUND PROGRESS
          </span>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '11px', fontWeight: 800, color: '#1C160F' }}>
            ROUND {state.round} OF {spec.rounds} · BREATH {state.turnInRound} / {spec.breathsPerRound}
          </span>
        </div>

        {/* Multi-Segment Round Progress Bar */}
        <div style={{ display: 'flex', gap: '4px', height: '6px', width: '100%' }}>
          {Array.from({ length: spec.rounds }).map((_, idx) => {
            const isCompletedRound = idx + 1 < state.round;
            const isCurrentRound = idx + 1 === state.round;
            const fillWidth = isCompletedRound ? '100%' : isCurrentRound ? `${(state.turnInRound / spec.breathsPerRound) * 100}%` : '0%';

            return (
              <div key={idx} style={{ flex: 1, backgroundColor: 'rgba(207, 168, 100, 0.2)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: fillWidth, height: '100%', backgroundColor: '#CFA864', transition: 'width 0.3s ease' }} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
