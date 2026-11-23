// ─────────────────────────────────────────────────────────────────────────────
// StudioTryFree — what replaces "Free resources" when the visitor picks the
// Mantras or Meditation tab: a handful of real, free things to open right now
// (mantra pages, or track previews), then the way on to the full library.
// ─────────────────────────────────────────────────────────────────────────────

import type { Palette } from '../../../lib/siteTheme';
import { track } from '../../../lib/analytics';
import { MANTRAS, thumb } from '../../mantras/mantraData';
import { SACRED_TRACKS } from '../../music/musicData';

const SERIF = "'Cormorant Garamond', Georgia, serif";
const SANS = "'Outfit', system-ui, -apple-system, sans-serif";
const FALLBACK = '/marketing/mantras/bowl-lotus.webp';

interface Card { key: string; title: string; kicker: string; line: string; img: string; href: string }

function cards(studio: 'mantra' | 'meditation'): Card[] {
  if (studio === 'mantra') {
    return MANTRAS.slice(0, 4).map((m) => ({
      key: m.slug, title: m.name, kicker: m.deity, line: m.blurb,
      img: m.cover || (m.videos?.[0] ? thumb(m.videos[0].id) : FALLBACK), href: `/mantras/${m.slug}`,
    }));
  }
  return SACRED_TRACKS.slice(0, 4).map((t) => ({
    key: t.id, title: t.title, kicker: `${t.mood} · ${t.duration}`, line: t.description,
    img: t.coverImage?.dark || FALLBACK, href: '/meditation-music',
  }));
}

export default function StudioTryFree({ palette, studio }: { palette: Palette; studio: 'mantra' | 'meditation' }) {
  const dark = palette.isDark;
  const mantra = studio === 'mantra';
  const accent = mantra ? '#C4913A' : '#3F7F86';
  const list = cards(studio);

  return (
    <section className="si-reveal si-visible" aria-labelledby="stf-h" style={{ padding: 'clamp(64px, 9vw, 104px) clamp(24px, 6vw, 96px)', position: 'relative', zIndex: 2 }}>
      <style>{`
        .stf-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:20px;max-width:1100px;margin:0 auto}
        .stf-card{display:flex;flex-direction:column;border-radius:22px;overflow:hidden;text-decoration:none;color:inherit;transition:transform .3s ease,box-shadow .3s ease}
        .stf-card:hover{transform:translateY(-5px);box-shadow:0 18px 40px rgba(0,0,0,.22)}
        .stf-card img{transition:transform .7s ease}
        .stf-card:hover img{transform:scale(1.06)}
        @media (prefers-reduced-motion: reduce){.stf-card,.stf-card img{transition:none}}
      `}</style>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <p style={{ fontFamily: SANS, fontSize: 10, fontWeight: 800, letterSpacing: '0.24em', textTransform: 'uppercase', color: accent, marginBottom: 14 }}>
          Try it free
        </p>
        <h2 id="stf-h" style={{ fontFamily: SERIF, fontSize: 'clamp(28px, 3.5vw, 48px)', fontWeight: 400, color: dark ? '#EDE9E3' : '#2A2118', margin: '0 0 10px' }}>
          {mantra ? 'Open a mantra and chant along' : 'Hear a track before you decide'}
        </h2>
        <p style={{ fontFamily: SANS, fontSize: 14.5, color: dark ? 'rgba(237,233,227,.65)' : '#7A5F44', maxWidth: 460, margin: '0 auto' }}>
          {mantra ? 'Every mantra page is free, with the Sanskrit, the meaning and a recording.' : 'Every track plays as a short free preview.'}
        </p>
      </div>

      <div className="stf-grid">
        {list.map((c) => (
          <a key={c.key} href={c.href} className="stf-card" onClick={() => track('HOME_TRY_FREE', `${studio}:${c.key}`)}
            style={{ background: palette.CARD, border: `1px solid ${palette.BORDER}` }}>
            <div style={{ overflow: 'hidden', aspectRatio: '16 / 10', background: '#1C1425' }}>
              <img src={c.img} alt="" loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
            <div style={{ padding: '16px 18px 20px' }}>
              <span style={{ display: 'block', fontFamily: SANS, fontSize: 11, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: accent }}>{c.kicker}</span>
              <span style={{ display: 'block', fontFamily: SERIF, fontSize: 24, fontWeight: 500, lineHeight: 1.2, color: palette.INK, margin: '6px 0' }}>{c.title}</span>
              <span style={{ display: 'block', fontFamily: SANS, fontSize: 13.5, lineHeight: 1.55, color: palette.INK2 }}>{c.line}</span>
            </div>
          </a>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: 32 }}>
        <a href={mantra ? '/mantras' : '/meditation-music'} onClick={() => track('HOME_TRY_FREE_ALL', studio)}
          style={{ display: 'inline-flex', alignItems: 'center', minHeight: 50, padding: '0 28px', borderRadius: 999, background: accent, color: '#FFFFFF', fontFamily: SANS, fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>
          {mantra ? 'Browse every mantra' : 'Browse all the music'}
        </a>
      </div>
    </section>
  );
}
