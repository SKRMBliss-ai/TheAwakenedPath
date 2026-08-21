const SANS = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

export interface WhatsIncludedProps {
  items?: string[];
  isDark?: boolean;
  ink?: string;
  inkSub?: string;
}

export function WhatsIncluded({
  items = [
    'Access to current episodes + upcoming episode drops',
    'Lifetime access to all course updates',
    '14-day full refund, no questions asked',
  ],
  isDark = false,
  ink = isDark ? '#EDE9E3' : '#2A2118',
  inkSub = isDark ? 'rgba(237,233,227,0.7)' : '#6B5744',
}: WhatsIncludedProps) {
  const green = '#22863a';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: '14px 16px',
        borderRadius: 14,
        background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
        marginTop: 10,
        marginBottom: 10,
      }}
    >
      <span
        style={{
          fontFamily: SANS,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: inkSub,
        }}
      >
        What&apos;s Included
      </span>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {items.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke={green}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ flexShrink: 0, marginTop: 2 }}
              aria-hidden="true"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span style={{ fontFamily: SANS, fontSize: 12, color: ink, lineHeight: 1.4 }}>
              {item}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WhatsIncluded;
