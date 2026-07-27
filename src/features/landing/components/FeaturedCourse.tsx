/**
 * FeaturedCourse.tsx
 * Dark editorial banner for "Understanding Feelings & Emotions"
 * Left: course details + CTA. Right: Firebase Storage course banner image.
 */
import type { Palette } from '../../../lib/siteTheme';

const SERIF = "'Cormorant Garamond', Georgia, serif";
const SANS  = "'Outfit', system-ui, sans-serif";

const COURSE_IMG =
  'https://firebasestorage.googleapis.com/v0/b/awakened-path-2026.firebasestorage.app/o/EmotionAndFeelingsCourse%2Fsite%2Fcourse-banner.webp?alt=media';

const FEATURES = [
  '7 Modules',
  '26 Lessons',
  'Guided Practices',
  'Lifetime Access',
];

// Checkmark icon
function Check() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export default function FeaturedCourse({ palette: _palette }: { palette: Palette }) {
  return (
    <section
      className="si-reveal"
      style={{ padding: 'clamp(24px, 4vw, 48px) clamp(24px, 6vw, 96px)', position: 'relative', zIndex: 2 }}
    >
      <div style={{
        maxWidth: 1100, margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        borderRadius: 28,
        overflow: 'hidden',
        background: '#1E1426',  // deep mauve-purple
        boxShadow: '0 40px 100px rgba(0,0,0,0.35)',
        minHeight: 360,
      }}>
        {/* Left: Course info */}
        <div style={{
          padding: 'clamp(36px, 5vw, 64px)',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          position: 'relative', zIndex: 1,
        }}>
          <div>
            <span style={{
              display: 'inline-block',
              padding: '5px 12px', borderRadius: 999,
              background: 'rgba(255,255,255,0.1)',
              fontFamily: SANS, fontSize: 9.5, fontWeight: 800, letterSpacing: '0.2em',
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)',
              marginBottom: 20,
            }}>
              Featured Course
            </span>

            <h2 style={{
              fontFamily: SERIF,
              fontSize: 'clamp(26px, 3vw, 42px)',
              fontWeight: 400,
              color: '#EDE9E3',
              lineHeight: 1.15,
              marginBottom: 16,
              letterSpacing: '-0.01em',
            }}>
              Understanding Feelings &amp; Emotions
            </h2>

            <p style={{
              fontFamily: SANS,
              fontSize: 14, lineHeight: 1.6,
              color: 'rgba(237,233,227,0.65)',
              marginBottom: 28, maxWidth: 340,
            }}>
              A 7-week guided journey to know, embrace and transform your emotions —
              from awareness to freedom.
            </p>

            {/* Features checklist */}
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 36px', display: 'grid', gap: 8 }}>
              {FEATURES.map((f) => (
                <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(237,233,227,0.75)', fontFamily: SANS, fontSize: 13, fontWeight: 600 }}>
                  <span style={{ color: '#C4913A', flexShrink: 0 }}><Check /></span>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <a
            href="/feelingsandemotioncourse"
            style={{
              alignSelf: 'flex-start',
              padding: '13px 28px', borderRadius: 999,
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.25)',
              color: '#fff', textDecoration: 'none',
              fontFamily: SANS, fontSize: 13.5, fontWeight: 700,
              transition: 'background 0.3s ease, transform 0.3s ease',
              display: 'inline-flex', alignItems: 'center', gap: 8,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.22)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.transform = 'none'; }}
            aria-label="Explore the Understanding Feelings and Emotions course"
          >
            Explore the Course
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </a>
        </div>

        {/* Right: Banner image */}
        <div style={{ position: 'relative', minHeight: 300, overflow: 'hidden' }}>
          <img
            src={COURSE_IMG}
            alt="Person walking toward a radiant light — representing emotional transformation"
            loading="lazy"
            decoding="async"
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
            onError={(e) => {
              // Fallback gradient if not yet uploaded
              (e.currentTarget.parentElement as HTMLElement).style.background =
                'linear-gradient(135deg, #2A1E40 0%, #4A2860 50%, #C4913A 150%)';
              e.currentTarget.style.display = 'none';
            }}
          />
          {/* Left overlay for text bleed */}
          <div aria-hidden="true" style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to right, rgba(30,20,38,0.9) 0%, rgba(30,20,38,0.4) 40%, transparent 70%)',
          }} />
        </div>
      </div>
    </section>
  );
}
