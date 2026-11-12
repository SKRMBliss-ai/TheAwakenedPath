/**
 * KidsWallOfFame — video stories in a row, then text stories as cards.
 * Renders nothing until kidsTestimonials.ts has entries.
 */
import type { Palette } from '../../../lib/siteTheme';
import { KIDS_TESTIMONIALS } from '../kidsTestimonials';

const SANS = "'Outfit', system-ui, -apple-system, sans-serif";
const SERIF = "'Cormorant Garamond', Georgia, serif";

function Avatar({ name, photo, palette }: { name: string; photo?: string; palette: Palette }) {
  const base: React.CSSProperties = { width: 52, height: 52, borderRadius: '50%', flexShrink: 0 };
  if (photo) return <img src={photo} alt={name} loading="lazy" style={{ ...base, objectFit: 'cover' }} />;
  return (
    <span aria-hidden="true" style={{ ...base, display: 'grid', placeItems: 'center', background: palette.BAND,
      color: palette.ON_BAND, fontFamily: SERIF, fontSize: 24 }}>{name.trim().charAt(0).toUpperCase()}</span>
  );
}

export default function KidsWallOfFame({ palette }: { palette: Palette }) {
  if (KIDS_TESTIMONIALS.length === 0) return null;
  const videos = KIDS_TESTIMONIALS.filter((t) => t.video);
  const texts = KIDS_TESTIMONIALS.filter((t) => !t.video);
  const card: React.CSSProperties = { background: palette.CARD, border: `1px solid ${palette.BORDER}`, borderRadius: 22 };

  return (
    <section id="wall-of-fame" style={{ position: 'relative', zIndex: 2, padding: 'clamp(48px, 7vw, 80px) clamp(16px, 5vw, 96px)', scrollMarginTop: 72 }}>
      <div style={{ maxWidth: 720, margin: '0 auto 32px', textAlign: 'center' }}>
        <span style={{ fontFamily: SANS, fontSize: 10.5, fontWeight: 800, letterSpacing: '0.22em', textTransform: 'uppercase',
          color: palette.BROWN, display: 'block', marginBottom: 10 }}>Wall of Fame</span>
        <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 400, lineHeight: 1.15, color: palette.INK, margin: 0 }}>
          Hear their stories
        </h2>
      </div>

      {videos.length > 0 && (
        <div style={{ maxWidth: 1140, margin: '0 auto 28px', display: 'grid', gap: 16,
          gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))' }}>
          {videos.map((t) => (
            <figure key={t.name + t.video} className="mgk-card" style={{ ...card, margin: 0, padding: 12, textAlign: 'center' }}>
              <video src={t.video} poster={t.poster} controls playsInline preload="none" aria-label={`Story from ${t.name}`}
                style={{ width: '100%', aspectRatio: '9 / 16', objectFit: 'cover', borderRadius: 14, display: 'block', background: '#000' }} />
              <figcaption style={{ marginTop: 8, fontFamily: SANS, fontSize: 13.5, fontWeight: 700, color: palette.INK }}>{t.name}</figcaption>
            </figure>
          ))}
        </div>
      )}

      <div style={{ maxWidth: 1140, margin: '0 auto', display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
        {texts.map((t) => (
          <figure key={t.name + t.quote.slice(0, 20)} className="mgk-card" style={{ ...card, margin: 0, padding: '22px 20px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center' }}>
            <Avatar name={t.name} photo={t.photo} palette={palette} />
            <blockquote style={{ margin: 0, fontFamily: SANS, fontSize: 14, fontStyle: 'italic', lineHeight: 1.65, color: palette.INK2 }}>
              {t.quote}
            </blockquote>
            <figcaption style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 800, color: palette.INK }}>
              {t.name}
              {t.role && <span style={{ display: 'block', fontWeight: 500, fontSize: 12.5, color: palette.INK2 }}>{t.role}</span>}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
