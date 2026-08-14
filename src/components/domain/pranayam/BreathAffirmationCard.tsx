import React from 'react';

interface BreathAffirmationCardProps {
  subtitle?: string;
  quote?: string;
}

export const BreathAffirmationCard: React.FC<BreathAffirmationCardProps> = ({
  subtitle = 'INHALE HEALING & POSITIVITY',
  quote = '"ABSORB VITAL OXYGEN, PURE LIFE FORCE & POSITIVE HEALING ENERGY INTO EVERY CELL."',
}) => {
  return (
    <div
      style={{
        width: '100%',
        backgroundColor: 'rgba(255, 253, 248, 0.95)',
        border: '1.5px solid rgba(207, 168, 100, 0.45)',
        borderRadius: '24px',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '18px',
        boxShadow: '0 12px 32px rgba(122, 106, 88, 0.1)',
        backdropFilter: 'blur(20px)',
        boxSizing: 'border-box'
      }}
    >
      <div
        style={{
          width: '42px',
          height: '42px',
          borderRadius: '50%',
          backgroundColor: 'rgba(90, 138, 106, 0.15)',
          border: '1.5px solid rgba(90, 138, 106, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          flexShrink: 0
        }}
      >
        🌿
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '11px',
            fontWeight: 800,
            color: '#5a8a6a',
            letterSpacing: '0.18em',
            textTransform: 'uppercase'
          }}
        >
          {subtitle}
        </div>
        <div
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: '17px',
            fontWeight: 700,
            color: '#1C160F',
            lineHeight: 1.3,
            letterSpacing: '0.02em',
            textTransform: 'uppercase'
          }}
        >
          {quote}
        </div>
      </div>
    </div>
  );
};
