import React from 'react';

interface PranayamCardProps {
  number: number;
  title: string;
  sanskritName: string;
  durationMinutes: string | number;
  instructions: string[];
}

export const PranayamCard: React.FC<PranayamCardProps> = ({
  number,
  title,
  sanskritName,
  durationMinutes,
  instructions,
}) => {
  const stepIcons = ['🧘', '🫁', '💨', '〰️', '👁️'];

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(255, 253, 248, 0.95)',
        border: '2px solid rgba(255, 255, 255, 0.95)',
        outline: '1px solid rgba(207, 168, 100, 0.35)',
        borderRadius: '32px',
        padding: '30px 34px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '18px',
        boxShadow: '0 20px 50px rgba(122, 106, 88, 0.12), inset 0 1px 2px rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(30px) saturate(180%)',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}
    >
      {/* Top Header Section */}
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Technique Badge */}
        <div
          style={{
            backgroundColor: '#cfa864',
            color: '#ffffff',
            fontFamily: "'Outfit', sans-serif",
            fontSize: '13px',
            fontWeight: 800,
            padding: '6px 16px',
            borderRadius: '20px',
            letterSpacing: '0.12em',
            width: 'fit-content',
            textTransform: 'uppercase',
            marginBottom: '14px',
            boxShadow: '0 4px 12px rgba(207, 168, 100, 0.3)'
          }}
        >
          TECHNIQUE {number} OF 5
        </div>

        {/* Huge Serif Title */}
        <div
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: '40px',
            fontWeight: 700,
            color: '#2b2520',
            lineHeight: 1.06,
            letterSpacing: '0.01em',
            marginBottom: '8px',
            textTransform: 'uppercase',
            overflowWrap: 'break-word'
          }}
        >
          {title}
        </div>

        {/* Subtitle with Lotus Icon */}
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: '10px', marginBottom: '16px', minWidth: 0 }}>
          <span style={{ fontSize: '18px', lineHeight: 1.4, flexShrink: 0 }}>🪷</span>
          <span
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: '22px',
              fontStyle: 'italic',
              fontWeight: 600,
              color: '#cfa864',
              lineHeight: 1.25,
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {sanskritName}
          </span>
        </div>

        {/* Duration Pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(207, 168, 100, 0.15)',
            border: '1.5px solid rgba(207, 168, 100, 0.4)',
            padding: '6px 16px',
            borderRadius: '16px',
            width: 'fit-content',
            marginBottom: '20px'
          }}
        >
          <span style={{ fontSize: '15px' }}>⏱</span>
          <span
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '13px',
              fontWeight: 800,
              color: '#1C160F',
              letterSpacing: '0.1em',
              textTransform: 'uppercase'
            }}
          >
            {durationMinutes} MINUTES
          </span>
        </div>

        {/* Separator Line */}
        <div style={{ height: '1.5px', backgroundColor: 'rgba(207, 168, 100, 0.3)', width: '100%', marginBottom: '22px' }} />

        {/* Bullet Instructions List with Circular Icon Badges */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {instructions.map((inst, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: '14px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(207, 168, 100, 0.25)',
                  border: '1.5px solid rgba(207, 168, 100, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '15px',
                  flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(122, 106, 88, 0.08)'
                }}
              >
                {stepIcons[idx % stepIcons.length]}
              </div>
              <span
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '17px',
                  fontWeight: 600,
                  color: '#2b2520',
                  lineHeight: 1.35,
                  paddingTop: '3px'
                }}
              >
                {inst}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Safety Disclaimer Footer */}
      <div style={{ borderTop: '1px dashed rgba(207, 168, 100, 0.4)', paddingTop: '14px', marginTop: 'auto' }}>
        <div
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: '13px',
            fontStyle: 'italic',
            color: '#6A5F52',
            textAlign: 'center',
            lineHeight: 1.4,
            letterSpacing: '0.04em'
          }}
        >
          DO NOT STRAIN. PRACTICE WITHIN YOUR COMFORT. STOP IF YOU FEEL DIZZY OR UNCOMFORTABLE.
        </div>
      </div>
    </div>
  );
};
