const SANS = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

export interface OrderPromiseProps {
  brandName?: string;
  isDark?: boolean;
  ink?: string;
  inkSub?: string;
}

export function OrderPromise({
  brandName = 'Mind Gym',
  isDark = false,
  ink = isDark ? '#EDE9E3' : '#2A2118',
  inkSub = isDark ? 'rgba(237,233,227,0.7)' : '#6B5744',
}: OrderPromiseProps) {
  const accentColor = isDark ? '#C4913A' : '#4A3260';

  const promises = [
    {
      icon: '♾️',
      title: 'Pay Once. Lifetime Access.',
      description: 'Unlock all current episodes and new episode drops as they are released.',
    },
    {
      icon: '🏷️',
      title: 'No Upsells. No Surprises.',
      description: 'What you see is what you pay. No hidden subscription fees.',
    },
    {
      icon: '🔄',
      title: 'Full Refund. No Questions Asked.',
      description: 'Get your money back if you choose to cancel within 14 days.',
    },
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        padding: '16px 18px',
        borderRadius: 16,
        background: isDark ? 'rgba(196,145,58,0.06)' : 'rgba(74,50,96,0.04)',
        border: `1px solid ${isDark ? 'rgba(196,145,58,0.18)' : 'rgba(74,50,96,0.12)'}`,
        marginTop: 12,
        marginBottom: 12,
      }}
    >
      <span
        style={{
          fontFamily: SANS,
          fontSize: 12,
          fontWeight: 700,
          color: accentColor,
          letterSpacing: '0.04em',
        }}
      >
        {brandName} Promise
      </span>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {promises.map((p, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <span style={{ fontSize: 16, lineHeight: 1, marginTop: 1 }}>{p.icon}</span>
            <div>
              <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: ink, display: 'block' }}>
                {p.title}
              </span>
              <span style={{ fontFamily: SANS, fontSize: 11, color: inkSub, lineHeight: 1.45, display: 'block' }}>
                {p.description}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OrderPromise;
