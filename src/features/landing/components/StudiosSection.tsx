// ─────────────────────────────────────────────────────────────────────────────
// StudiosSection — the home page's one question: "which studio?".
//
// Three tabs, one per studio, each with a glowing title so nobody misses that
// there is more than one. A tab opens that studio's own picture (the Meditation
// tab holds the candle and lantern), its offerings with their own prices, and
// its YouTube channel. Underneath, the common price: the one membership that
// covers everything. Names, links and plans come from src/config/studios.ts.
// ─────────────────────────────────────────────────────────────────────────────

import { useRef, useState } from 'react';
import { ArrowRight, Youtube, Sparkles } from 'lucide-react';
import type { Palette } from '../../../lib/siteTheme';
import { track } from '../../../lib/analytics';
import { STUDIOS, type Studio, type StudioKey } from '../../../config/studios';
import { priceOf, product } from '../../catalog/catalog';
import LightScene from '../../meditation/LightScene';

const SERIF = "'Cormorant Garamond', Georgia, serif";
const SANS = "'Outfit', system-ui, -apple-system, sans-serif";
const PER = { once: ' once', month: '/month', year: '/year' } as const;

const price = (id: string) => `${priceOf(id)}${PER[product(id).billing]}`;

/** The studio's own picture: photos, the Om, or the lantern and candles. */
function Visual({ s, palette }: { s: Studio; palette: Palette }) {
  if (s.key === 'meditation') {
    return (
      <div style={{ display: 'grid', placeItems: 'center', height: '100%', minHeight: 320, padding: 16,
        background: 'radial-gradient(ellipse at 50% 80%, rgba(255,190,90,.18), transparent 70%), #14111C' }}>
        <LightScene palette={{ ...palette, isDark: true }} bare />
      </div>
    );
  }
  return (
    <div className="st-visual" style={{ display: 'flex', height: '100%', minHeight: 320, overflow: 'hidden',
      background: 'radial-gradient(ellipse at 50% 100%, rgba(233,201,138,0.22), transparent 70%), #1C1425' }}>
      {s.images.map((im) => (
        <img key={im.src} src={im.src} alt={im.alt} loading="lazy" decoding="async"
          style={{ flex: 1, minWidth: 0, height: '100%', objectFit: im.contain ? 'contain' : 'cover', objectPosition: 'center top', padding: im.contain ? 28 : 0 }} />
      ))}
    </div>
  );
}

export default function StudiosSection({ palette }: { palette: Palette }) {
  const [active, setActive] = useState<StudioKey>('mind');
  const [seen, setSeen] = useState<Set<StudioKey>>(new Set(['mind']));
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const dark = palette.isDark;
  const s = STUDIOS.find((x) => x.key === active)!;

  const pick = (k: StudioKey, focus = false) => {
    setActive(k);
    setSeen((prev) => new Set(prev).add(k));
    track('HOME_STUDIO_TAB', k);
    if (focus) tabs.current[STUDIOS.findIndex((x) => x.key === k)]?.focus();
  };
  const onKey = (e: React.KeyboardEvent, i: number) => {
    const n = STUDIOS.length;
    if (e.key === 'ArrowRight') { e.preventDefault(); pick(STUDIOS[(i + 1) % n].key, true); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); pick(STUDIOS[(i + n - 1) % n].key, true); }
  };

  return (
    <section id="studios" aria-labelledby="studios-h" className="si-reveal"
      style={{ position: 'relative', zIndex: 2, padding: 'clamp(40px, 6vw, 80px) clamp(16px, 4vw, 40px)' }}>
      <style>{`
        .st-tabs{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:-1px;position:relative;z-index:1}
        .st-tab{position:relative;display:flex;align-items:center;gap:12px;padding:12px 16px;border-radius:22px 22px 0 0;cursor:pointer;text-align:left;
          background:var(--st-card);color:var(--st-ink);border:1.5px solid var(--st-line);border-bottom-color:transparent;font-family:${SANS};
          transition:transform .25s ease,box-shadow .25s ease,background .25s ease}
        .st-tab:hover{transform:translateY(-3px)}
        .st-tab:focus-visible{outline:3px solid var(--st-acc);outline-offset:3px}
        .st-tab img{width:52px;height:52px;border-radius:50%;object-fit:cover;background:#fff;flex-shrink:0;border:2px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,.25)}
        .st-tab .st-t{display:block;font-family:${SERIF};font-size:clamp(18px,2vw,24px);font-weight:600;line-height:1.1}
        .st-tab .st-h{display:block;font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;opacity:.7;margin-top:3px}
        .st-tab .st-new{position:absolute;top:-11px;right:14px;padding:3px 10px;border-radius:999px;background:var(--st-acc);color:#fff;font-size:10.5px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;white-space:nowrap}
        .st-tab[aria-selected="true"]{background:var(--st-acc);color:#fff;border-color:var(--st-acc);box-shadow:0 -6px 26px var(--st-glow)}
        .st-tab[aria-selected="true"] .st-h{opacity:.85}
        .st-tab[data-pulse="true"]{animation:st-pulse 2.2s ease-in-out infinite;border-color:var(--st-acc)}
        @keyframes st-pulse{0%,100%{box-shadow:0 0 0 0 var(--st-glow),0 0 10px var(--st-glow)}50%{box-shadow:0 0 0 6px transparent,0 0 26px var(--st-glow)}}
        .st-panel{position:relative;border:1.5px solid var(--st-line);border-radius:0 0 28px 28px;overflow:hidden;background:var(--st-card);animation:st-in .45s ease}
        @keyframes st-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
        .st-body{display:grid;grid-template-columns:1fr 1.05fr}
        .st-row{display:block;padding:14px 12px;margin:0 -8px;border-radius:16px;color:inherit;text-decoration:none;transition:background .25s ease}
        .st-row:hover,.st-row:focus-visible{background:var(--st-tint)}
        .st-row svg{transition:transform .25s ease}
        .st-row:hover svg{transform:translateX(5px)}
        .st-btn{flex:1 1 150px;display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:48px;padding:0 18px;border-radius:999px;font-family:${SANS};font-size:14.5px;font-weight:700;text-decoration:none;transition:transform .2s ease,box-shadow .2s ease}
        .st-btn:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(0,0,0,.18)}
        .st-visual img{transition:transform .8s ease}
        .st-panel:hover .st-visual img{transform:scale(1.04)}
        @media (max-width:860px){
          .st-body{grid-template-columns:1fr}
          .st-tabs{gap:8px}
          .st-tab{flex-direction:column;text-align:center;padding:10px 6px 12px;gap:6px;border-radius:18px 18px 0 0}
          .st-tab img{width:44px;height:44px}
          .st-tab .st-h{display:none}
        }
        @media (prefers-reduced-motion: reduce){.st-tab,.st-panel{animation:none!important;transition:none}}
      `}</style>

      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto clamp(26px, 4vw, 42px)' }}>
          <h2 id="studios-h" style={{ fontFamily: SERIF, fontSize: 'clamp(34px, 5vw, 56px)', fontWeight: 400, lineHeight: 1.1, color: palette.INK, margin: '0 0 10px' }}>
            Three studios, one web app
          </h2>
          <p style={{ fontFamily: SANS, fontSize: 16, lineHeight: 1.65, color: palette.INK2, margin: 0 }}>
            Pick a studio to see what is inside and what it costs. Each has its own YouTube channel, and everything also plays inside the Mind Gym web app.
          </p>
        </div>

        <div role="tablist" aria-label="Choose a studio" className="st-tabs">
          {STUDIOS.map((x, i) => {
            const on = x.key === active;
            const pulse = !on && !seen.has(x.key);
            return (
              <button key={x.key} ref={(el) => { tabs.current[i] = el; }} type="button" role="tab" id={`st-tab-${x.key}`} aria-selected={on} aria-controls="st-panel"
                tabIndex={on ? 0 : -1} data-pulse={pulse} className="st-tab"
                onClick={() => pick(x.key)} onKeyDown={(e) => onKey(e, i)}
                style={{ ['--st-acc' as string]: x.accent, ['--st-glow' as string]: `${x.accent}99`, ['--st-card' as string]: palette.CARD,
                  ['--st-ink' as string]: palette.INK, ['--st-line' as string]: palette.BORDER }}>
                {pulse && <span className="st-new"><Sparkles size={10} aria-hidden="true" style={{ display: 'inline', marginRight: 4, verticalAlign: '-1px' }} />Tap to explore</span>}
                <img src={x.logo} alt="" width={52} height={52} />
                <span><span className="st-t">{x.name.replace('Soulful ', '')}</span><span className="st-h">{x.handle}</span></span>
              </button>
            );
          })}
        </div>

        <div role="tabpanel" id="st-panel" aria-labelledby={`st-tab-${s.key}`} key={s.key} className="st-panel"
          style={{ ['--st-card' as string]: palette.CARD, ['--st-line' as string]: palette.BORDER, ['--st-tint' as string]: `${s.accent}18`, color: palette.INK }}>
          <div className="st-body">
            <Visual s={s} palette={palette} />

            <div style={{ padding: 'clamp(20px, 3.5vw, 36px)' }}>
              <span style={{ display: 'block', fontFamily: SANS, fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: s.accent }}>{s.handle}</span>
              <h3 style={{ fontFamily: SERIF, fontSize: 'clamp(28px, 3vw, 38px)', fontWeight: 500, lineHeight: 1.12, margin: '6px 0 8px' }}>{s.name}</h3>
              <p style={{ fontFamily: SANS, fontSize: 15.5, lineHeight: 1.6, color: palette.INK2, margin: '0 0 12px' }}>{s.channelLine}</p>

              <div>
                {s.offerings.map((o) => (
                  <a key={o.label} href={o.learn} className="st-row" onClick={() => track('HOME_STUDIO_OFFER', `${s.key}:${o.label}`)}>
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: SANS, fontSize: 17, fontWeight: 700 }}>
                        {o.label}<ArrowRight size={16} aria-hidden="true" style={{ color: s.accent }} />
                      </span>
                      {o.plans && (
                        <span style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 800, color: dark ? '#F4EFE6' : s.accent, background: `${s.accent}${dark ? '33' : '14'}`, padding: '4px 12px', borderRadius: 999 }}>
                          {o.plans.map(price).join(' · ')}
                        </span>
                      )}
                    </span>
                    <span style={{ display: 'block', fontFamily: SANS, fontSize: 14, lineHeight: 1.55, color: palette.INK2, marginTop: 4 }}>{o.line}</span>
                  </a>
                ))}
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 18 }}>
                {s.offerings.find((o) => o.open) && (
                  <a href={s.offerings.find((o) => o.open)!.open!.href} className="st-btn" onClick={() => track('HOME_STUDIO_OPEN', s.key)}
                    style={{ background: s.accent, color: '#FFFFFF' }}>
                    {s.offerings.find((o) => o.open)!.open!.label}
                  </a>
                )}
                <a href={s.subscribe} target="_blank" rel="noopener noreferrer" className="st-btn" onClick={() => track('HOME_STUDIO_YOUTUBE', s.key)}
                  aria-label={`Watch ${s.name} on YouTube`} style={{ border: `1.5px solid ${palette.BORDER}`, color: palette.INK }}>
                  <Youtube size={17} aria-hidden="true" /> Watch on YouTube
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* The common price: one membership that covers every studio */}
        <div style={{ marginTop: 22, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 18,
          padding: 'clamp(20px, 3.5vw, 30px)', borderRadius: 26, color: '#F4EFE6',
          background: 'linear-gradient(135deg, #2A1E40, #4A3260)', border: '1px solid rgba(233,201,138,.35)' }}>
          <div style={{ flex: '1 1 420px' }}>
            <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#E9C98A' }}>One membership for everything</span>
            <h3 style={{ fontFamily: SERIF, fontSize: 'clamp(26px, 3vw, 36px)', fontWeight: 500, margin: '6px 0 6px' }}>
              Adult Mind Gym · {price('membership_monthly')} or {price('membership_yearly')}
            </h3>
            <p style={{ fontFamily: SANS, fontSize: 14.5, lineHeight: 1.6, margin: 0, color: 'rgba(244,239,230,.85)' }}>
              Daily practice, journal, every course, all mantras and all meditation music, in the web app. Or add Kids Mind Gym with the Family plan from {price('family_monthly')}.
            </p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <a href="/pricing" className="st-btn" onClick={() => track('HOME_COMMON_PRICING')} style={{ background: '#E9C98A', color: '#241E24', flex: '0 0 auto', padding: '0 26px' }}>See all plans</a>
          </div>
        </div>
      </div>
    </section>
  );
}
