/**
 * FinalCta.tsx
 * Emotional closing section: large serif headline + single CTA.
 * "You have spent years trying to change your mind.
 *  Maybe it is time to understand it."
 */
import type { Palette } from '../../../lib/siteTheme';

const SERIF = "'Cormorant Garamond', Georgia, serif";
const SANS  = "'Outfit', system-ui, sans-serif";

export default function FinalCta({ palette, onCta }: { palette: Palette; onCta?: () => void }) {
  const isDark = palette.isDark;
  const ink    = isDark ? '#EDE9E3' : '#2A2118';

  return (
    <section
      className="si-reveal"
      style={{
        position: 'relative', zIndex: 2,
        padding: 'clamp(96px, 14vw, 160px) clamp(24px, 6vw, 96px)',
        textAlign: 'center',
        borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(60,40,20,0.07)'}`,
      }}
    >
      {/* Decorative circle */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 'min(500px, 80vw)', height: 'min(500px, 80vw)',
        borderRadius: '50%',
        background: isDark
          ? 'radial-gradient(circle, rgba(196,145,58,0.06) 0%, transparent 70%)'
          : 'radial-gradient(circle, rgba(196,145,58,0.09) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <p style={{
        fontFamily: SANS, fontSize: 11, fontWeight: 800, letterSpacing: '0.24em',
        textTransform: 'uppercase', color: isDark ? '#C4913A' : '#7A5F44', marginBottom: 28,
        position: 'relative',
      }}>
        Begin Your Journey
      </p>

      <h2 style={{
        fontFamily: SERIF,
        fontSize: 'clamp(32px, 5vw, 68px)',
        fontWeight: 400,
        lineHeight: 1.1,
        color: ink,
        maxWidth: 760, margin: '0 auto 20px',
        letterSpacing: '-0.02em',
        position: 'relative',
      }}>
        You have spent years trying to change your mind.
      </h2>

      <h3 style={{
        fontFamily: SERIF,
        fontSize: 'clamp(24px, 3.5vw, 52px)',
        fontWeight: 400,
        fontStyle: 'italic',
        lineHeight: 1.15,
        color: isDark ? 'rgba(237,233,227,0.75)' : '#6B5744',
        maxWidth: 680, margin: '0 auto 48px',
        letterSpacing: '-0.01em',
        position: 'relative',
      }}>
        Maybe it is time to understand it.
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, position: 'relative' }}>
        <a
          href="/mindgym"
          onClick={onCta}
          className="si-btn-breathe"
          style={{
            display: 'inline-block',
            padding: '16px 40px', borderRadius: 999,
            background: '#4A3260', color: '#fff', textDecoration: 'none',
            fontFamily: SANS, fontSize: 15, fontWeight: 800, letterSpacing: '0.01em',
          }}
          aria-label="Begin Your Journey — enter Mind Gym"
        >
          Begin Your Journey
        </a>
      </div>

      {/* Bottom decoration: minimal SVG circle */}
      <div aria-hidden="true" style={{ marginTop: 80, display: 'flex', justifyContent: 'center', gap: 16 }}>
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" opacity="0.2">
          <circle cx="24" cy="24" r="20" stroke={isDark ? '#EDE9E3' : '#4A3260'} strokeWidth="0.8" />
          <circle cx="24" cy="24" r="13" stroke={isDark ? '#EDE9E3' : '#4A3260'} strokeWidth="0.8" />
          <circle cx="24" cy="24" r="6" stroke={isDark ? '#EDE9E3' : '#4A3260'} strokeWidth="0.8" />
          <line x1="24" y1="4" x2="24" y2="44" stroke={isDark ? '#EDE9E3' : '#4A3260'} strokeWidth="0.5" />
          <line x1="4" y1="24" x2="44" y2="24" stroke={isDark ? '#EDE9E3' : '#4A3260'} strokeWidth="0.5" />
        </svg>
      </div>
    </section>
  );
}
