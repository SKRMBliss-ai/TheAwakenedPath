// ─────────────────────────────────────────────────────────────────────────────
// StudiosSection — the home page's three big cards, one per YouTube channel.
// Each says what the studio publishes, what you can get under it (with its sales
// page), and links to the channel. Read from src/config/studios.ts.
// ─────────────────────────────────────────────────────────────────────────────

import { ArrowRight, Youtube } from 'lucide-react';
import type { Palette } from '../../../lib/siteTheme';
import { track } from '../../../lib/analytics';
import { STUDIOS } from '../../../config/studios';

const SERIF = "'Cormorant Garamond', Georgia, serif";
const SANS = "'Outfit', system-ui, -apple-system, sans-serif";

export default function StudiosSection({ palette }: { palette: Palette }) {
  return (
    <section id="studios" aria-labelledby="studios-h" className="si-reveal"
      style={{ position: 'relative', zIndex: 2, padding: 'clamp(40px, 6vw, 80px) clamp(16px, 4vw, 40px)' }}>
      <style>{`
        .st-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px;align-items:stretch}
        @media (max-width:980px){.st-grid{grid-template-columns:1fr;max-width:560px;margin:0 auto}}
        .st-row{display:block;padding:14px 4px;text-decoration:none;color:inherit;border-top:1px solid var(--st-line)}
        .st-row:first-child{border-top:0}
        .st-row:hover .st-name{text-decoration:underline}
      `}</style>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto clamp(24px, 4vw, 40px)' }}>
          <h2 id="studios-h" style={{ fontFamily: SERIF, fontSize: 'clamp(34px, 5vw, 56px)', fontWeight: 400, lineHeight: 1.1, color: palette.INK, margin: '0 0 10px' }}>
            Three studios, one calm place
          </h2>
          <p style={{ fontFamily: SANS, fontSize: 16, lineHeight: 1.65, color: palette.INK2, margin: 0 }}>
            Each studio has its own YouTube channel. Everything they make also lives inside the Mind Gym app.
          </p>
        </div>

        <div className="st-grid">
          {STUDIOS.map((s) => (
            <article key={s.key} style={{ ['--st-line' as string]: palette.BORDER, display: 'flex', flexDirection: 'column', background: palette.CARD,
              border: `1px solid ${palette.BORDER}`, borderRadius: 28, overflow: 'visible', color: palette.INK }}>
              {/* Picture band, with the studio's own logo sitting across its lower edge */}
              <div style={{ position: 'relative', height: 250, display: 'flex', background: 'radial-gradient(ellipse at 50% 100%, rgba(233,201,138,0.22), transparent 70%), #1C1425', borderBottom: `4px solid ${s.accent}` }}>
                <div style={{ display: 'flex', width: '100%', height: '100%', overflow: 'hidden', borderRadius: '27px 27px 0 0' }}>
                {s.images.map((im) => (
                  <img key={im.src} src={im.src} alt={im.alt} loading="lazy" decoding="async"
                    style={{ flex: 1, minWidth: 0, height: '100%', objectFit: im.contain ? 'contain' : 'cover', objectPosition: 'center top', padding: im.contain ? 18 : 0 }} />
                ))}
                </div>
                <img src={s.logo} alt={`${s.name} logo`} width={84} height={84} loading="lazy"
                  style={{ position: 'absolute', left: '50%', bottom: -42, transform: 'translateX(-50%)', width: 84, height: 84, objectFit: 'cover', borderRadius: '50%',
                    background: '#FFFFFF', border: '3px solid #FFFFFF', boxShadow: '0 8px 22px rgba(0,0,0,.3)' }} />
              </div>
              <div style={{ padding: '54px 24px 6px', textAlign: 'center' }}>
                <span style={{ display: 'block', fontFamily: SANS, fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: s.accent }}>{s.handle}</span>
                <h3 style={{ fontFamily: SERIF, fontSize: 'clamp(26px, 2.6vw, 32px)', fontWeight: 500, lineHeight: 1.15, margin: '6px 0 6px', color: palette.INK }}>{s.name}</h3>
                <p style={{ fontFamily: SANS, fontSize: 14.5, lineHeight: 1.55, margin: 0, color: palette.INK2 }}>{s.channelLine}</p>
              </div>

              <div style={{ padding: '10px 20px 4px', flex: 1 }}>
                {s.offerings.map((o) => (
                  <a key={o.label} href={o.learn} className="st-row" onClick={() => track('HOME_STUDIO_OFFER', `${s.key}:${o.label}`)}>
                    <span className="st-name" style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: SANS, fontSize: 16.5, fontWeight: 700, color: palette.INK }}>
                      {o.label}<ArrowRight size={15} aria-hidden="true" style={{ color: s.accent }} />
                    </span>
                    <span style={{ display: 'block', fontFamily: SANS, fontSize: 14, lineHeight: 1.55, color: palette.INK2, marginTop: 3 }}>{o.line}</span>
                  </a>
                ))}
              </div>

              <div style={{ padding: '6px 20px 22px', display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {s.offerings.find((o) => o.open) && (
                  <a href={s.offerings.find((o) => o.open)!.open!.href} onClick={() => track('HOME_STUDIO_OPEN', s.key)}
                    style={{ flex: '1 1 150px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minHeight: 46, padding: '0 18px', borderRadius: 999,
                      background: palette.PURPLE_STRONG, color: palette.ON_ACCENT, fontFamily: SANS, fontSize: 14.5, fontWeight: 700, textDecoration: 'none' }}>
                    {s.offerings.find((o) => o.open)!.open!.label}
                  </a>
                )}
                <a href={s.subscribe} target="_blank" rel="noopener noreferrer" onClick={() => track('HOME_STUDIO_YOUTUBE', s.key)}
                  aria-label={`Watch ${s.name} on YouTube`}
                  style={{ flex: '1 1 150px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 46, padding: '0 18px', borderRadius: 999,
                    border: `1.5px solid ${palette.BORDER}`, color: palette.INK, fontFamily: SANS, fontSize: 14.5, fontWeight: 700, textDecoration: 'none' }}>
                  <Youtube size={17} aria-hidden="true" /> Watch on YouTube
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
