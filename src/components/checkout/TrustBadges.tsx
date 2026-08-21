import React from 'react';

const SANS = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

export interface TrustBadgesProps {
  appName?: string;
  privacyUrl?: string;
  refundTitle?: string;
  refundDescription?: string;
  isDark?: boolean;
}

export function TrustBadges({
  appName = 'Mind Gym',
  privacyUrl = '/policies',
  refundTitle = '14-Day purchase protection',
  refundDescription = "Shop confidently knowing that if you're not satisfied within 14 days of purchase, we've always got your back with a full refund — no questions asked.",
  isDark = false,
}: TrustBadgesProps) {
  const badgeRadius = 4;
  const badgeBorder = '1px solid rgba(128,128,128,0.22)';
  const green = '#22863a';
  const textColor = isDark ? 'rgba(237,233,227,0.85)' : 'rgba(80,80,80,0.85)';

  const Section = ({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) => (
    <div style={{ borderTop: '1px solid rgba(128,128,128,0.15)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <span style={{ fontSize: 15 }}>{icon}</span>
        <span style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 700, color: green }}>{title}</span>
      </div>
      {children}
    </div>
  );

  const Bullet = ({ text }: { text: string }) => (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7 }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill={green} style={{ flexShrink: 0, marginTop: 1 }} aria-hidden="true">
        <path d="M20 6L9 17l-5-5 1.4-1.4L9 14.2 18.6 4.6z" />
      </svg>
      <span style={{ fontFamily: SANS, fontSize: 11.5, color: textColor, lineHeight: 1.5 }}>{text}</span>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 10 }}>
      {/* ── 1. Card Protection ─────────────────────────────────────────── */}
      <Section icon="🛡️" title={`${appName} protects your card information`}>
        <Bullet text="We follow the Payment Card Industry Data Security Standard (PCI DSS) when handling card data" />
        <Bullet text="Card information is secure and uncompromised" />
        <Bullet text="All data is safeguarded with 256-bit encryption" />
        <Bullet text="We never sell your card information" />

        {/* Badge row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap', marginTop: 2 }}>
          {/* PCI DSS */}
          <svg width="40" height="26" viewBox="0 0 40 26" style={{ borderRadius: badgeRadius, border: badgeBorder }} aria-label="PCI DSS">
            <rect width="40" height="26" rx="4" fill="#003087" />
            <text x="20" y="11" textAnchor="middle" fill="white" fontFamily="Arial" fontSize="6.5" fontWeight="bold">PCI</text>
            <text x="20" y="20" textAnchor="middle" fill="#F79E1B" fontFamily="Arial" fontSize="6" fontWeight="bold">DSS</text>
          </svg>
          {/* Visa Secure */}
          <svg width="40" height="26" viewBox="0 0 40 26" style={{ borderRadius: badgeRadius, border: badgeBorder }} aria-label="Visa Secure">
            <rect width="40" height="26" rx="4" fill="#1A1F71" />
            <text x="20" y="12" textAnchor="middle" fill="white" fontFamily="Arial" fontSize="9" fontWeight="bold" fontStyle="italic">VISA</text>
            <text x="20" y="21" textAnchor="middle" fill="#F79E1B" fontFamily="Arial" fontSize="5.5">SECURE</text>
          </svg>
          {/* Mastercard */}
          <svg width="40" height="26" viewBox="0 0 40 26" style={{ borderRadius: badgeRadius, border: badgeBorder }} aria-label="Mastercard ID Check">
            <rect width="40" height="26" rx="4" fill="#252525" />
            <circle cx="15" cy="13" r="6" fill="#EB001B" />
            <circle cx="25" cy="13" r="6" fill="#F79E1B" />
            <path d="M20 8.5a6 6 0 0 1 0 9A6 6 0 0 1 20 8.5z" fill="#FF5F00" />
          </svg>
          {/* Amex SafeKey */}
          <svg width="46" height="26" viewBox="0 0 46 26" style={{ borderRadius: badgeRadius, border: badgeBorder }} aria-label="Amex SafeKey">
            <rect width="46" height="26" rx="4" fill="#007BC1" />
            <text x="23" y="12" textAnchor="middle" fill="white" fontFamily="Arial" fontSize="8" fontWeight="bold">AMEX</text>
            <text x="23" y="21" textAnchor="middle" fill="white" fontFamily="Arial" fontSize="5.5">SafeKey</text>
          </svg>
          {/* Google Pay */}
          <svg width="50" height="26" viewBox="0 0 50 26" style={{ borderRadius: badgeRadius, border: badgeBorder, background: '#fff' }} aria-label="Google Pay">
            <text x="25" y="17" textAnchor="middle" fontFamily="Arial,sans-serif" fontSize="10" fontWeight="600">
              <tspan fill="#4285F4">G</tspan><tspan fill="#34A853">o</tspan><tspan fill="#FBBC05">o</tspan><tspan fill="#EA4335">g</tspan><tspan fill="#4285F4">le </tspan><tspan fill="#5F6368">Pay</tspan>
            </text>
          </svg>
          {/* Apple Pay */}
          <svg width="50" height="26" viewBox="0 0 50 26" style={{ borderRadius: badgeRadius, border: badgeBorder }} aria-label="Apple Pay">
            <rect width="50" height="26" rx="4" fill="#000" />
            <text x="25" y="17" textAnchor="middle" fill="white" fontFamily="-apple-system,Arial,sans-serif" fontSize="11" fontWeight="500"> Pay</text>
          </svg>
        </div>
      </Section>

      {/* ── 2. Secure Privacy ──────────────────────────────────────────── */}
      <Section icon="🔒" title="Secure privacy">
        <p style={{ fontFamily: SANS, fontSize: 11.5, color: textColor, margin: 0, lineHeight: 1.6 }}>
          Protecting your privacy matters to us. Your information will be kept secure and uncompromised.
          We do not sell your personal data and only use it to provide and improve our services,
          in accordance with our{' '}
          <a href={privacyUrl} style={{ color: green, textDecoration: 'underline' }}>Privacy Policy</a>.
        </p>
      </Section>

      {/* ── 3. Purchase Protection ─────────────────────────────────────── */}
      <Section icon="✅" title={refundTitle}>
        <p style={{ fontFamily: SANS, fontSize: 11.5, color: textColor, margin: 0, lineHeight: 1.6 }}>
          {refundDescription}
        </p>
        <a href={privacyUrl} style={{ fontFamily: SANS, fontSize: 11.5, color: green, textDecoration: 'none', fontWeight: 600 }}>
          Learn more →
        </a>
      </Section>
    </div>
  );
}

export default TrustBadges;
