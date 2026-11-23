// ─────────────────────────────────────────────────────────────────────────────
// LightScene — a small interactive moment on the Meditation Studio pages.
//
// Hover (or tap, or press Enter on) the candles or the lantern and they light:
// the unlit picture crossfades to the lit one, a warm glow blooms behind it and
// the whole panel warms. Moving away lets them settle back. Works in light and
// dark mode, on touch screens and from the keyboard. Below, the studio's
// instruments lift and glow on hover.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import type { Palette } from '../../lib/siteTheme';

const SERIF = "'Cormorant Garamond', Georgia, serif";
const SANS = "'Outfit', system-ui, -apple-system, sans-serif";
const DIR = '/SoulfulStudios/Meditation';

function Lightable({ off, on, alt, lit, setLit, width, label, glow }: {
  off: string; on: string; alt: string; lit: boolean; setLit: (v: boolean) => void; width: number; label: string; glow: string;
}) {
  return (
    <button
      type="button"
      className="ls-obj"
      aria-pressed={lit}
      aria-label={`${lit ? 'Put out' : 'Light'} the ${label}`}
      onMouseEnter={() => setLit(true)}
      onMouseLeave={() => setLit(false)}
      onFocus={() => setLit(true)}
      onBlur={() => setLit(false)}
      onClick={() => setLit(!lit)}
      style={{ width: `min(${width}px, 42vw)` }}
    >
      <span className="ls-glow" aria-hidden="true" style={{ background: glow, opacity: lit ? 1 : 0 }} />
      <span className="ls-stack">
        <img src={off} alt="" width={width} loading="lazy" decoding="async" style={{ opacity: lit ? 0 : 1 }} />
        <img src={on} alt={alt} width={width} loading="lazy" decoding="async" className="ls-on" style={{ opacity: lit ? 1 : 0 }} />
      </span>
    </button>
  );
}

const INSTRUMENTS: { src: string; label: string; w: number }[] = [
  { src: `${DIR}/bowl.webp`, label: 'Singing bowl', w: 170 },
  { src: `${DIR}/tingsha.webp`, label: 'Tingsha bells', w: 150 },
  { src: `${DIR}/chime.webp`, label: 'Wind chime', w: 66 },
  { src: `${DIR}/flute.webp`, label: 'Flute', w: 180 },
];

export interface SceneCta { label: string; href: string; primary?: boolean }

/** `title`, `intro` and `ctas` let a page reuse the scene to point at its offerings (the home page does). */
export default function LightScene({ palette, title = 'Light a candle. Begin to settle.', intro = 'Hover over the candles or the lantern to light them. On a phone, tap.', ctas }: {
  palette: Palette; title?: string; intro?: string; ctas?: SceneCta[];
}) {
  const [candle, setCandle] = useState(false);
  const [lantern, setLantern] = useState(false);
  const dark = palette.isDark;
  const anyLit = candle || lantern;
  const bothLit = candle && lantern;

  const glow = 'radial-gradient(closest-side, rgba(255,200,110,.85), rgba(255,170,70,.35) 55%, transparent 75%)';
  const panelBg = dark
    ? `radial-gradient(ellipse at 50% 70%, rgba(255,180,80,${bothLit ? 0.28 : anyLit ? 0.16 : 0.05}), transparent 70%), #14111C`
    : `radial-gradient(ellipse at 50% 70%, rgba(255,190,90,${bothLit ? 0.5 : anyLit ? 0.3 : 0.08}), transparent 72%), ${palette.CARD}`;

  return (
    <section aria-labelledby="ls-h" style={{ padding: 'clamp(36px, 6vw, 72px) clamp(16px, 5vw, 96px)' }}>
      <style>{`
        .ls-panel{transition:background 1.2s ease;border-radius:32px;overflow:hidden}
        .ls-row{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:center;gap:clamp(16px,5vw,64px)}
        .ls-obj{position:relative;display:block;background:none;border:0;padding:0;cursor:pointer;-webkit-tap-highlight-color:transparent;border-radius:24px}
        .ls-obj:focus-visible{outline:3px solid #E9C98A;outline-offset:6px}
        .ls-stack{position:relative;display:block}
        .ls-stack img{display:block;width:100%;height:auto;transition:opacity .9s ease,filter .9s ease}
        .ls-stack img + img{position:absolute;inset:0}
        .ls-glow{position:absolute;left:50%;top:46%;width:150%;aspect-ratio:1;transform:translate(-50%,-50%);transition:opacity 1s ease;pointer-events:none;filter:blur(18px)}
        .ls-obj[aria-pressed="true"] .ls-glow{animation:ls-flicker 3.2s ease-in-out infinite}
        .ls-obj[aria-pressed="true"] .ls-on{filter:drop-shadow(0 0 22px rgba(255,190,90,.55))}
        @keyframes ls-flicker{0%,100%{transform:translate(-50%,-50%) scale(1)}35%{transform:translate(-50%,-50%) scale(1.05)}60%{transform:translate(-50%,-50%) scale(.98)}}
        .ls-inst{display:flex;flex-direction:column;align-items:center;gap:8px;transition:transform .5s ease}
        .ls-inst img{display:block;height:auto;transition:filter .5s ease}
        .ls-inst:hover{transform:translateY(-8px)}
        .ls-inst:hover img{filter:drop-shadow(0 12px 22px rgba(233,185,90,.55))}
        @media (prefers-reduced-motion: reduce){.ls-obj .ls-glow,.ls-inst{animation:none!important;transition:none}}
      `}</style>

      <div className="ls-panel" style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(28px, 5vw, 56px) clamp(16px, 4vw, 40px)', background: panelBg,
        border: `1px solid ${dark ? '#2A2338' : palette.BORDER}`, textAlign: 'center' }}>
        <h2 id="ls-h" style={{ fontFamily: SERIF, fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 400, lineHeight: 1.15, margin: '0 0 8px', color: dark ? '#F4EFE6' : palette.INK }}>
          {title}
        </h2>
        <p style={{ fontFamily: SANS, fontSize: 15.5, lineHeight: 1.6, margin: '0 auto clamp(20px, 4vw, 36px)', maxWidth: 520, color: dark ? 'rgba(244,239,230,.75)' : palette.INK2 }}>
          {intro}
        </p>

        <div className="ls-row">
          <Lightable off={`${DIR}/lantern-off.webp`} on={`${DIR}/lantern-on.webp`} alt="A lit golden lantern" lit={lantern} setLit={setLantern} width={230} label="lantern" glow={glow} />
          <Lightable off={`${DIR}/candle-off.webp`} on={`${DIR}/candle-on.webp`} alt="Three lit candles with jasmine" lit={candle} setLit={setCandle} width={400} label="candles" glow={glow} />
        </div>

        <ul className="ls-row" style={{ listStyle: 'none', margin: 'clamp(28px, 5vw, 48px) 0 0', padding: 0 }} aria-label="Instruments in the music">
          {INSTRUMENTS.map((i) => (
            <li key={i.label} className="ls-inst">
              <img src={i.src} alt={i.label} width={i.w} loading="lazy" decoding="async" style={{ width: `min(${i.w}px, 40vw)` }} />
            </li>
          ))}
        </ul>

        {ctas && ctas.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginTop: 'clamp(24px, 4vw, 40px)' }}>
            {ctas.map((c) => (
              <a key={c.href} href={c.href}
                style={{ display: 'inline-flex', alignItems: 'center', minHeight: 48, padding: '0 24px', borderRadius: 999, fontFamily: SANS, fontSize: 15, fontWeight: 700, textDecoration: 'none',
                  background: c.primary ? '#E9C98A' : 'transparent', color: c.primary ? '#241E24' : (dark ? '#F4EFE6' : palette.INK),
                  border: c.primary ? 'none' : `1.5px solid ${dark ? 'rgba(244,239,230,.5)' : palette.BORDER}` }}>
                {c.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
