// ─────────────────────────────────────────────────────────────────────────────
// PathChooser — the home page's one question: "Who is this for?"
//
// Three doors, one product each, read from DOORS in catalog.ts so the home
// page, the site menu and /pricing always show the same three choices.
// ─────────────────────────────────────────────────────────────────────────────

import { ArrowRight, Check } from 'lucide-react';
import type { Palette } from '../../../lib/siteTheme';
import { track } from '../../../lib/analytics';
import { DOORS, priceOf, product, type Door } from '../../catalog/catalog';

const SERIF = "'Cormorant Garamond', Georgia, serif";
const SANS = "'Outfit', system-ui, -apple-system, sans-serif";

const ART: Record<Door['id'], { img: string; contain?: boolean }> = {
  me: { img: '/mind-gym-product.png' },
  child: { img: '/marketing/kids/hero-sim-diary.webp' },
  mantras: { img: '/marketing/mantras/bowl-lotus.webp', contain: true },
};

const PER = { once: ' once', month: '/month', year: '/year' } as const;

/** "From ₹240/month" — the first (cheapest) plan at the door. */
function fromPrice(d: Door) {
  const p = product(d.plans[0]);
  return `${d.plans.length > 1 ? 'From ' : ''}${priceOf(p.id)}${PER[p.billing]}`;
}

export default function PathChooser({ palette }: { palette: Palette }) {
  const isDark = palette.isDark;

  return (
    <section aria-labelledby="choose-path" className="si-reveal"
      style={{ position: 'relative', zIndex: 2, padding: 'clamp(40px, 6vw, 80px) clamp(16px, 4vw, 40px)' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto clamp(24px, 4vw, 40px)' }}>
          <h2 id="choose-path" style={{ fontFamily: SERIF, fontSize: 'clamp(34px, 5vw, 56px)', fontWeight: 400, lineHeight: 1.1, color: palette.INK, margin: '0 0 10px' }}>
            Who is this for?
          </h2>
          <p style={{ fontFamily: SANS, fontSize: 16, lineHeight: 1.65, color: palette.INK2, margin: 0 }}>
            Choose one. Each is complete on its own.
          </p>
        </div>

        <div className="pc-grid">
          {DOORS.map((d) => {
            const art = ART[d.id];
            return (
              <article key={d.id} className="pc-card" style={{ background: palette.CARD, border: `1px solid ${palette.BORDER}`, color: palette.INK }}>
                <a href={d.learnHref} onClick={() => track('HOME_DOOR_CLICK', d.id)} className="pc-img" aria-hidden="true" tabIndex={-1}
                  style={{ background: isDark ? '#1B1714' : '#F1ECE2' }}>
                  <img src={art.img} alt="" loading="lazy" decoding="async" style={art.contain ? { objectFit: 'contain', padding: '6%' } : undefined} />
                </a>
                <div className="pc-body">
                  <span style={{ alignSelf: 'flex-start', fontFamily: SANS, fontSize: 12, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase',
                    padding: '6px 12px', borderRadius: 999, background: palette.BAND, color: palette.ON_BAND }}>{d.who}</span>
                  <h3 style={{ fontFamily: SERIF, fontSize: 'clamp(28px, 3vw, 36px)', fontWeight: 500, lineHeight: 1.1, margin: 0 }}>{d.title}</h3>
                  <p style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.6, color: palette.INK2, margin: 0 }}>{d.line}</p>
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 7 }}>
                    {d.includes.map((x) => (
                      <li key={x} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontFamily: SANS, fontSize: 14, lineHeight: 1.45, color: palette.INK }}>
                        <Check size={16} color={palette.PURPLE_STRONG} aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }} /> {x}
                      </li>
                    ))}
                  </ul>
                  <div style={{ marginTop: 'auto', paddingTop: 10 }}>
                    <p style={{ fontFamily: SANS, fontSize: 18, fontWeight: 700, margin: '0 0 12px' }}>{fromPrice(d)}</p>
                    <a href={d.learnHref} onClick={() => track('HOME_DOOR_CLICK', d.id)} className="pc-cta"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 48, borderRadius: 999,
                        background: palette.PURPLE_STRONG, color: palette.ON_ACCENT, fontFamily: SANS, fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>
                      Explore {d.title} <ArrowRight size={16} aria-hidden="true" />
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <p style={{ textAlign: 'center', fontFamily: SANS, fontSize: 14.5, color: palette.INK2, margin: '22px 0 0' }}>
          Not sure? <a href="/mindgym" onClick={() => track('HOME_DOOR_CLICK', 'start_free')} style={{ color: palette.PURPLE_STRONG, fontWeight: 700 }}>Start Adult Mind Gym free</a>
          {' '}· <a href="/pricing" onClick={() => track('HOME_DOOR_CLICK', 'pricing')} style={{ color: palette.PURPLE_STRONG, fontWeight: 700 }}>Compare all prices</a>
        </p>
      </div>

      <style>{`
        .pc-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; align-items: stretch; }
        .pc-card { display: flex; flex-direction: column; border-radius: 28px; overflow: hidden;
          transition: transform .3s ease, box-shadow .3s ease, border-color .3s ease; }
        .pc-card:hover, .pc-card:focus-within { transform: translateY(-4px); border-color: ${palette.PURPLE_STRONG} !important;
          box-shadow: ${isDark ? '0 20px 50px rgba(0,0,0,.55)' : '0 20px 50px rgba(60,40,30,.14)'}; }
        .pc-img { display: grid; place-items: center; aspect-ratio: 4 / 3; overflow: hidden; }
        .pc-img img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform .6s ease; }
        .pc-card:hover .pc-img img { transform: scale(1.04); }
        .pc-body { display: flex; flex-direction: column; gap: 12px; padding: 22px 22px 24px; flex: 1; }
        @media (max-width: 900px) { .pc-grid { grid-template-columns: 1fr; } .pc-img { aspect-ratio: 16 / 9; } }
        @media (prefers-reduced-motion: reduce) {
          .pc-card, .pc-img img { transition: none; }
          .pc-card:hover { transform: none; } .pc-card:hover .pc-img img { transform: none; }
        }
      `}</style>
    </section>
  );
}
