/**
 * TinyTransformation.tsx
 * Animated 3-step path: Overwhelmed → 5 min Mind Gym → Calmer You
 * Matching the screenshot's transformation timeline.
 */
import type { Palette } from '../../../lib/siteTheme';

const SERIF = "'Cormorant Garamond', Georgia, serif";
const SANS  = "'Outfit', system-ui, sans-serif";

// Inline SVG icons matching the screenshot's illustrated feel
function StormCloud({ size = 56 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" aria-hidden="true">
      <circle cx="40" cy="40" r="38" fill="rgba(180,160,200,0.12)" />
      {/* Cloud body */}
      <path d="M20 48 C18 48 14 45 14 40 C14 35 18 31 23 31 C24 27 28 24 34 24 C38 24 42 26 44 30 C46 28 50 27 54 29 C58 31 60 36 58 41 C60 43 62 46 60 49 C58 52 54 52 52 52 L26 52 C22 52 20 50 20 48 Z" fill="rgba(160,140,190,0.5)" />
      {/* Rain drops */}
      <line x1="28" y1="55" x2="26" y2="63" stroke="rgba(140,120,180,0.6)" strokeWidth="2" strokeLinecap="round" />
      <line x1="36" y1="55" x2="34" y2="65" stroke="rgba(140,120,180,0.6)" strokeWidth="2" strokeLinecap="round" />
      <line x1="44" y1="55" x2="42" y2="62" stroke="rgba(140,120,180,0.6)" strokeWidth="2" strokeLinecap="round" />
      <line x1="52" y1="55" x2="50" y2="63" stroke="rgba(140,120,180,0.6)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SunRise({ size = 56 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" aria-hidden="true">
      <circle cx="40" cy="40" r="38" fill="rgba(220,180,100,0.12)" />
      {/* Sun circle */}
      <circle cx="40" cy="46" r="14" fill="rgba(220,170,60,0.7)" />
      {/* Rays */}
      <line x1="40" y1="18" x2="40" y2="24" stroke="rgba(220,170,60,0.8)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="58" y1="28" x2="53.5" y2="31.6" stroke="rgba(220,170,60,0.8)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="22" y1="28" x2="26.5" y2="31.6" stroke="rgba(220,170,60,0.8)" strokeWidth="2.5" strokeLinecap="round" />
      {/* Horizon line */}
      <path d="M16 46 Q40 38 64 46" stroke="rgba(180,145,80,0.4)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <line x1="12" y1="50" x2="68" y2="50" stroke="rgba(180,145,80,0.3)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function MindGymLogo({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none" aria-hidden="true">
      <circle cx="30" cy="30" r="28" fill="rgba(74,50,96,0.12)" stroke="rgba(74,50,96,0.25)" strokeWidth="1.5" />
      {/* Brain-like curves */}
      <path d="M20 30 C20 22 26 17 30 17 C34 17 38 20 38 24 C42 22 46 26 44 30 C46 34 42 38 38 36 C38 40 34 43 30 43 C26 43 22 40 22 36 C18 38 16 34 18 30 Z"
        fill="rgba(74,50,96,0.2)" stroke="rgba(74,50,96,0.5)" strokeWidth="1.5" />
      <path d="M30 17 C30 17 30 30 30 43" stroke="rgba(74,50,96,0.3)" strokeWidth="1" strokeDasharray="2 3" />
    </svg>
  );
}

// Dotted path connecting the steps
function DottedPath({ isDark }: { isDark: boolean }) {
  const color = isDark ? 'rgba(237,233,227,0.25)' : 'rgba(60,40,20,0.2)';
  return (
    <svg width="100%" height="32" viewBox="0 0 300 32" preserveAspectRatio="none" aria-hidden="true">
      <path d="M 10 16 Q 150 4 290 16" stroke={color} strokeWidth="1.5" fill="none" strokeDasharray="4 6" strokeLinecap="round" />
      {/* Arrow head */}
      <polyline points="283,11 290,16 283,21" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function TinyTransformation({ palette }: { palette: Palette }) {
  const isDark = palette.isDark;
  const ink    = isDark ? '#EDE9E3' : '#2A2118';
  const inkSub = isDark ? 'rgba(237,233,227,0.55)' : '#9C8B78';
return (
    <section
      className="si-reveal"
      style={{ padding: 'clamp(64px, 8vw, 96px) clamp(24px, 6vw, 96px)', textAlign: 'center', position: 'relative', zIndex: 2 }}
    >
      <p style={{ fontFamily: SANS, fontSize: 10, fontWeight: 800, letterSpacing: '0.24em', textTransform: 'uppercase', color: isDark ? '#C4913A' : '#9C8B78', marginBottom: 16 }}>
        The Science of Small Shifts
      </p>
      <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(26px, 3vw, 42px)', fontWeight: 400, color: ink, marginBottom: 56, letterSpacing: '-0.01em' }}>
        Tiny steps. Real transformation.
      </h2>

      {/* 3-step path */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr auto 1fr',
        alignItems: 'center',
        gap: 0,
        maxWidth: 680,
        margin: '0 auto',
      }}>
        {/* Step 1 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <StormCloud />
          <p style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: ink, margin: 0 }}>Overwhelmed</p>
          <p style={{ fontFamily: SANS, fontSize: 11, color: inkSub, margin: 0 }}>Thoughts everywhere</p>
        </div>

        {/* Arrow 1 */}
        <div style={{ width: 'clamp(48px, 8vw, 100px)', flexShrink: 1 }}>
          <DottedPath isDark={isDark} />
        </div>

        {/* Center: Mind Gym */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div style={{
            background: isDark ? 'rgba(74,50,96,0.2)' : 'rgba(74,50,96,0.08)',
            border: '1px solid rgba(74,50,96,0.25)',
            borderRadius: 20, padding: '20px 28px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          }}>
            <MindGymLogo size={48} />
            <p style={{ fontFamily: SANS, fontSize: 11, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: isDark ? 'rgba(237,233,227,0.5)' : '#9C8B78', margin: 0 }}>5 minutes</p>
            <p style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: ink, margin: 0 }}>of Mind Gym</p>
          </div>
        </div>

        {/* Arrow 2 */}
        <div style={{ width: 'clamp(48px, 8vw, 100px)', flexShrink: 1 }}>
          <DottedPath isDark={isDark} />
        </div>

        {/* Step 3 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <SunRise />
          <p style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: ink, margin: 0 }}>Calmer you</p>
          <p style={{ fontFamily: SANS, fontSize: 11, color: inkSub, margin: 0 }}>Clearer now</p>
        </div>
      </div>
    </section>
  );
}
