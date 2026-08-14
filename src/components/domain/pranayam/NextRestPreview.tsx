import React from 'react';

interface NextRestPreviewProps {
  label?: string;
  durationSec?: number;
}

export const NextRestPreview: React.FC<NextRestPreviewProps> = ({
  label = 'NEXT: 10 SEC RELAXATION',
  durationSec = 10,
}) => {
  const secsFormatted = `00:${String(durationSec).padStart(2, '0')}`;

  return (
    <div
      style={{
        width: '100%',
        backgroundColor: 'rgba(255, 253, 248, 0.92)',
        border: '1.5px solid rgba(207, 168, 100, 0.35)',
        borderRadius: '20px',
        padding: '12px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 8px 24px rgba(122, 106, 88, 0.08)',
        backdropFilter: 'blur(16px)',
        boxSizing: 'border-box'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '16px' }}>🌱</span>
        <span
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '12px',
            fontWeight: 800,
            color: '#1C160F',
            letterSpacing: '0.12em',
            textTransform: 'uppercase'
          }}
        >
          {label}
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: 'rgba(207, 168, 100, 0.15)',
          border: '1px solid rgba(207, 168, 100, 0.4)',
          borderRadius: '12px',
          padding: '4px 10px'
        }}
      >
        <span style={{ fontSize: '12px' }}>⏳</span>
        <span
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '12px',
            fontWeight: 800,
            color: '#1C160F',
            letterSpacing: '0.08em'
          }}
        >
          {secsFormatted}
        </span>
      </div>
    </div>
  );
};
