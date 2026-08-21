
const SANS = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

export interface ConsentCheckboxesProps {
  agreeTerms: boolean;
  setAgreeTerms: (val: boolean) => void;
  agreeMarketing: boolean;
  setAgreeMarketing: (val: boolean) => void;
  isDark?: boolean;
  ink?: string;
  inkSub?: string;
  termsUrl?: string;
  privacyUrl?: string;
}

export function ConsentCheckboxes({
  agreeTerms,
  setAgreeTerms,
  agreeMarketing,
  setAgreeMarketing,
  isDark = false,
  ink = isDark ? '#EDE9E3' : '#2A2118',
  inkSub = isDark ? 'rgba(237,233,227,0.7)' : '#6B5744',
  termsUrl = '/policies',
  privacyUrl = '/policies',
}: ConsentCheckboxesProps) {
  const accentColor = isDark ? '#C4913A' : '#4A3260';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4, marginBottom: 4 }}>
      {/* 1. Terms & Privacy Agreement */}
      <label
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 10,
          cursor: 'pointer',
          fontFamily: SANS,
          fontSize: 12,
          color: inkSub,
          lineHeight: 1.45,
          userSelect: 'none',
        }}
      >
        <input
          type="checkbox"
          checked={agreeTerms}
          onChange={(e) => setAgreeTerms(e.target.checked)}
          style={{
            marginTop: 2,
            width: 16,
            height: 16,
            accentColor: accentColor,
            cursor: 'pointer',
            flexShrink: 0,
          }}
        />
        <span>
          I have read and agree to the{' '}
          <a
            href={termsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            style={{ color: ink, fontWeight: 600, textDecoration: 'underline' }}
          >
            Terms of Service
          </a>{' '}
          and{' '}
          <a
            href={privacyUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            style={{ color: ink, fontWeight: 600, textDecoration: 'underline' }}
          >
            Privacy Policy
          </a>
          .
        </span>
      </label>

      {/* 2. Marketing / Newsletter Opt-in */}
      <label
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 10,
          cursor: 'pointer',
          fontFamily: SANS,
          fontSize: 12,
          color: inkSub,
          lineHeight: 1.45,
          userSelect: 'none',
        }}
      >
        <input
          type="checkbox"
          checked={agreeMarketing}
          onChange={(e) => setAgreeMarketing(e.target.checked)}
          style={{
            marginTop: 2,
            width: 16,
            height: 16,
            accentColor: accentColor,
            cursor: 'pointer',
            flexShrink: 0,
          }}
        />
        <span>
          I agree to receive product updates, newsletters, and promotional communications by email. I understand I can unsubscribe at any time.
        </span>
      </label>
    </div>
  );
}

export default ConsentCheckboxes;
