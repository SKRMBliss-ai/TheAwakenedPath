
const SANS = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
const SERIF = "'Cormorant Garamond', Georgia, serif";

export interface TrustStripProps {
  rating?: number | string;
  reviewCount?: string;
  testimonialText?: string;
  authorName?: string;
  isDark?: boolean;
  ink?: string;
  inkSub?: string;
  pills?: string[];
}

export function TrustStrip({
  rating = 4.9,
  reviewCount = '200+ students enrolled',
  testimonialText = "This course genuinely shifted something in me. The way Sim explains emotions is unlike anything I've read before.",
  authorName = 'Priya R., Verified Student',
  isDark = false,
  ink = isDark ? '#EDE9E3' : '#2A2118',
  inkSub = isDark ? 'rgba(237,233,227,0.7)' : '#6B5744',
  pills = ['14-Day Money-Back', 'Instant Access', '256-Bit Encrypted'],
}: TrustStripProps) {
  const cardBg = isDark ? 'rgba(196,145,58,0.06)' : 'rgba(74,50,96,0.04)';
  const borderC = isDark ? 'rgba(196,145,58,0.18)' : 'rgba(74,50,96,0.12)';
  const accentGold = isDark ? '#C4913A' : '#4A3260';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        background: cardBg,
        border: `1px solid ${borderC}`,
        borderRadius: 16,
        padding: '14px 18px',
        marginBottom: 20,
      }}
    >
      {/* Top Header: Star Rating + Student Count Badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ display: 'flex', gap: 2 }} aria-label={`${rating} out of 5 stars`}>
            {[1, 2, 3, 4, 5].map((s) => (
              <svg key={s} width="15" height="15" viewBox="0 0 24 24" fill="#F79E1B" aria-hidden="true">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>
          <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: ink, marginLeft: 2 }}>
            {rating}/5
          </span>
        </div>

        {reviewCount && (
          <span
            style={{
              fontFamily: SANS,
              fontSize: 11,
              fontWeight: 600,
              color: accentGold,
              background: isDark ? 'rgba(196,145,58,0.14)' : 'rgba(74,50,96,0.08)',
              padding: '3px 9px',
              borderRadius: 999,
              letterSpacing: '0.02em',
            }}
          >
            {reviewCount}
          </span>
        )}
      </div>

      {/* Testimonial Quote with Left Accent Bar */}
      {testimonialText && (
        <div
          style={{
            borderLeft: `2.5px solid ${accentGold}`,
            paddingLeft: 12,
            marginTop: 2,
            marginBottom: 2,
          }}
        >
          <p style={{ fontFamily: SERIF, fontSize: 14.5, color: ink, margin: 0, lineHeight: 1.4, fontStyle: 'italic' }}>
            &ldquo;{testimonialText}&rdquo;
          </p>
          {authorName && (
            <p style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, color: inkSub, margin: '4px 0 0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              — {authorName}
            </p>
          )}
        </div>
      )}

      {/* Trust Guarantee Badges Row */}
      {pills.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', paddingTop: 2 }}>
          {pills.map((tag) => (
            <div
              key={tag}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                fontFamily: SANS,
                fontSize: 11,
                fontWeight: 600,
                color: ink,
                background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.7)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
                padding: '4px 10px',
                borderRadius: 8,
                whiteSpace: 'nowrap',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22863a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>{tag}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TrustStrip;
