/**
 * FeatureGrid.tsx
 * Six Mind Gym feature cards — Daily Practice, Journaling, Guided Courses,
 * Breathwork, Sound Library, Live Sessions.
 * Each card has a generated Firebase Storage image + icon + description.
 */
import type { Palette } from '../../../lib/siteTheme';

const SERIF = "'Cormorant Garamond', Georgia, serif";
const SANS  = "'Outfit', system-ui, sans-serif";

const FS = (file: string) =>
  `https://firebasestorage.googleapis.com/v0/b/awakened-path-2026.firebasestorage.app/o/EmotionAndFeelingsCourse%2Fsite%2F${encodeURIComponent(file)}?alt=media`;

const FEATURES = [
  {
    img: FS('feature-daily-practice.webp'),
    icon: 'M12 3a9 9 0 1 0 0 18A9 9 0 0 0 12 3Z|M12 7v5l3 3',
    title: 'Daily Practice',
    desc: 'Guided meditations to start your day with clarity.',
  },
  {
    img: FS('feature-journaling.webp'),
    icon: 'M4 6h16M4 12h10M4 18h8|M18 14v4M16 16h4',
    title: 'Journaling',
    desc: 'Reflect, release and understand your emotions.',
  },
  {
    img: FS('feature-courses.webp'),
    icon: 'M2 20h20M4 20V10l8-6 8 6v10|M10 20v-6h4v6',
    title: 'Guided Courses',
    desc: 'Step-by-step journeys into deep inner transformation.',
  },
  {
    img: FS('feature-breathwork.webp'),
    icon: 'M12 12m-3 0a3 3 0 1 0 6 0 3 3 0 1 0-6 0|M12 12m-7 0a7 7 0 1 0 14 0 7 7 0 1 0-14 0|M12 12m-11 0a11 11 0 1 0 22 0 11 11 0 1 0-22 0',
    title: 'Breathwork',
    desc: 'Reset your nervous system and find instant calm.',
  },
  {
    img: FS('feature-sound.webp'),
    icon: 'M9 18V5l12-2v13|M9 9l12-2|M6 15a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z|M18 13a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z',
    title: 'Sound Library',
    desc: 'Healing sounds for sleep, focus and relaxation.',
  },
  {
    img: FS('feature-live.webp'),
    icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2|M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z|M23 21v-2a4 4 0 0 0-3-3.87|M16 3.13a4 4 0 0 1 0 7.75',
    title: 'Live Sessions',
    desc: 'Practice together in a supportive community.',
  },
];

function FeatureIcon({ d, size = 20 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {d.split('|').map((seg, i) => <path key={i} d={seg} />)}
    </svg>
  );
}

export default function FeatureGrid({ palette, onExplore }: { palette: Palette; onExplore?: () => void }) {
  const isDark = palette.isDark;
  const ink    = isDark ? '#EDE9E3' : '#2A2118';
  const inkSub = isDark ? 'rgba(237,233,227,0.55)' : '#9C8B78';

  return (
    <section
      className="si-reveal"
      style={{
        padding: 'clamp(72px, 10vw, 120px) clamp(24px, 6vw, 96px)',
        position: 'relative', zIndex: 2,
        background: isDark ? 'rgba(12,9,16,0.4)' : 'rgba(240,232,220,0.35)',
      }}
    >
      {/* Section header */}
      <div style={{ textAlign: 'center', marginBottom: 56 }}>
        <p style={{ fontFamily: SANS, fontSize: 10, fontWeight: 800, letterSpacing: '0.24em', textTransform: 'uppercase', color: isDark ? '#C4913A' : '#9C8B78', marginBottom: 16 }}>
          Tools for Your Journey
        </p>
        <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(28px, 3.5vw, 48px)', fontWeight: 400, color: ink, marginBottom: 12, letterSpacing: '-0.01em' }}>
          Experience Mind Gym
        </h2>
        <p style={{ fontFamily: SANS, fontSize: 14, color: inkSub, maxWidth: 400, margin: '0 auto' }}>
          Simple practices for a lighter, more aware you.
        </p>
      </div>

      {/* 3×2 card grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: 20,
        maxWidth: 1100,
        margin: '0 auto 52px',
      }}>
        {FEATURES.map((feat, i) => (
          <div key={i} className="si-feature-card">
            {/* Card image */}
            <div style={{ height: 160, overflow: 'hidden', borderRadius: '20px 20px 0 0' }}>
              <img
                src={feat.img}
                alt={feat.title}
                className="si-card-img"
                loading="lazy"
                decoding="async"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                onError={(e) => {
                  // Fallback to gradient if image not yet uploaded
                  (e.currentTarget.parentElement as HTMLElement).style.background =
                    'linear-gradient(135deg, rgba(196,145,58,0.15) 0%, rgba(140,123,138,0.15) 100%)';
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>

            {/* Card body */}
            <div style={{ padding: '20px 22px 24px' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                marginBottom: 10,
                color: isDark ? '#C4913A' : '#9C8B78',
              }}>
                <FeatureIcon d={feat.icon} />
                <h3 style={{ fontFamily: SANS, fontSize: 14, fontWeight: 800, color: ink, margin: 0 }}>
                  {feat.title}
                </h3>
              </div>
              <p style={{ fontFamily: SANS, fontSize: 12.5, lineHeight: 1.6, color: inkSub, margin: 0 }}>
                {feat.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{ textAlign: 'center' }}>
        <button
          onClick={onExplore}
          style={{
            padding: '14px 36px', borderRadius: 999, cursor: 'pointer',
            background: isDark ? 'rgba(74,50,96,0.25)' : '#4A3260',
            color: '#fff', border: '1px solid rgba(74,50,96,0.4)',
            fontFamily: SANS, fontSize: 13.5, fontWeight: 700, letterSpacing: '0.02em',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#4A3260'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = isDark ? 'rgba(74,50,96,0.25)' : '#4A3260'; e.currentTarget.style.transform = 'none'; }}
          aria-label="Explore all Mind Gym features"
        >
          Explore All Features
        </button>
      </div>
    </section>
  );
}
