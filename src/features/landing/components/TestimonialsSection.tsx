/**
 * TestimonialsSection.tsx
 * Three testimonial cards + stats row (40k+, 5k+, 120+, 98%)
 */

import type { Palette } from '../../../lib/siteTheme';

const SERIF = "'Cormorant Garamond', Georgia, serif";
const SANS  = "'Outfit', system-ui, sans-serif";

const TESTIMONIALS = [
  {
    quote: '"Mind Gym helped me understand why I react the way I do. I finally feel grounded at my inner self."',
    name: 'Priya',
    location: 'Bengaluru',
    initial: 'P',
    color: '#8C6B9E',
  },
  {
    quote: '"The journaling practice has been life changing. I feel lighter and more aware every single day."',
    name: 'Arjun',
    location: 'Mumbai',
    initial: 'A',
    color: '#6B8C9E',
  },
  {
    quote: '"I sleep better, worry less and feel more connected to myself and my family."',
    name: 'Neha',
    location: 'Pune',
    initial: 'N',
    color: '#9E8C6B',
  },
];

const STATS = [
  { value: '40,000+', label: 'Meditation minutes' },
  { value: '5,000+',  label: 'Journal entries' },
  { value: '120+',    label: 'Guided lessons' },
  { value: '98%',     label: 'Feel more in control' },
];

export default function TestimonialsSection({ palette }: { palette: Palette }) {
  const isDark = palette.isDark;
  const ink    = isDark ? '#EDE9E3' : '#2A2118';
  const inkSub = isDark ? 'rgba(237,233,227,0.55)' : '#9C8B78';
  const statBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(60,40,20,0.04)';

  return (
    <section
      className="si-reveal"
      style={{ padding: 'clamp(72px, 10vw, 120px) clamp(24px, 6vw, 96px)', position: 'relative', zIndex: 2 }}
    >
      {/* Header */}
      <div style={{ marginBottom: 52 }}>
        <p style={{ fontFamily: SANS, fontSize: 10, fontWeight: 800, letterSpacing: '0.24em', textTransform: 'uppercase', color: isDark ? '#C4913A' : '#9C8B78', marginBottom: 14 }}>
          Real Stories
        </p>
        <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(28px, 3.5vw, 48px)', fontWeight: 400, color: ink, marginBottom: 8, letterSpacing: '-0.01em' }}>
          Loved by thousands on their inner journey
        </h2>
        <p style={{ fontFamily: SANS, fontSize: 13.5, color: inkSub }}>
          Real people. Real stories. Real transformation.
        </p>
      </div>

      {/* Testimonial cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 20,
        marginBottom: 56,
      }}>
        {TESTIMONIALS.map((t, i) => (
          <div key={i} className="si-testimonial-card">
            {/* Quote mark */}
            <p style={{
              fontFamily: SERIF,
              fontSize: 64,
              lineHeight: 0.6,
              color: `${t.color}40`,
              margin: '0 0 12px',
              fontStyle: 'italic',
              userSelect: 'none',
            }}>
              "
            </p>
            <p style={{
              fontFamily: SERIF,
              fontSize: 17,
              fontStyle: 'italic',
              lineHeight: 1.65,
              color: isDark ? 'rgba(237,233,227,0.85)' : '#4A3C2E',
              margin: '0 0 24px',
            }}>
              {t.quote}
            </p>

            {/* Author */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: `${t.color}25`,
                border: `2px solid ${t.color}50`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: SERIF, fontSize: 18, fontWeight: 600, color: t.color,
                flexShrink: 0,
              }}>
                {t.initial}
              </div>
              <div>
                <p style={{ fontFamily: SANS, fontSize: 13, fontWeight: 800, color: ink, margin: 0 }}>{t.name}</p>
                <p style={{ fontFamily: SANS, fontSize: 11, color: inkSub, margin: 0 }}>{t.location}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Stats row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 16,
        padding: '32px 0',
        borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(60,40,20,0.08)'}`,
      }}>
        {STATS.map((s, i) => (
          <div key={i} style={{
            textAlign: 'center', padding: '20px 16px',
            background: statBg, borderRadius: 16,
          }}>
            <p style={{
              fontFamily: SERIF,
              fontSize: 'clamp(28px, 3vw, 38px)',
              fontWeight: 400,
              color: isDark ? '#C4913A' : '#4A3260',
              margin: '0 0 6px',
              letterSpacing: '-0.01em',
            }}>
              {s.value}
            </p>
            <p style={{ fontFamily: SANS, fontSize: 11.5, color: inkSub, margin: 0, fontWeight: 600 }}>
              {s.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
