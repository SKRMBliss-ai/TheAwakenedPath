// ─────────────────────────────────────────────────────────────────────────────
// MoodMoments — "How do you want to feel?" on the Meditation Studio page.
//
// One object for each mood, not a heap of them: the singing bowl for Calm, the
// candles for Deep, the lantern for Healing, the wind chime for Uplifting and
// the tingsha bells for Meditation. Hover (or tap, or focus) a card and its
// object comes alive: the candles and lantern light, the chime sways, the bells
// ring. Choosing a card filters the library below to that mood.
// ─────────────────────────────────────────────────────────────────────────────

import type { Palette } from '../../lib/siteTheme';

const SERIF = "'Cormorant Garamond', Georgia, serif";
const SANS = "'Outfit', system-ui, -apple-system, sans-serif";
const DIR = '/SoulfulStudios/Meditation';

export type Mood = 'Calm' | 'Deep' | 'Healing' | 'Uplifting' | 'Meditation';

interface Moment { mood: Mood; title: string; line: string; img: string; lit?: string; anim: 'sway' | 'ring' | 'glow' | 'float'; w: number }

const MOMENTS: Moment[] = [
  { mood: 'Calm', title: 'Calm', line: 'A settling breath after a long day.', img: `${DIR}/bowl.webp`, anim: 'float', w: 190 },
  { mood: 'Deep', title: 'Deep practice', line: 'Long, quiet sits, without a clock.', img: `${DIR}/candle-off.webp`, lit: `${DIR}/candle-on.webp`, anim: 'glow', w: 190 },
  { mood: 'Healing', title: 'Healing', line: 'Soft company on a heavy day.', img: `${DIR}/lantern-off.webp`, lit: `${DIR}/lantern-on.webp`, anim: 'glow', w: 120 },
  { mood: 'Uplifting', title: 'Uplifting', line: 'A brighter start to the morning.', img: `${DIR}/chime.webp`, anim: 'sway', w: 70 },
  { mood: 'Meditation', title: 'Guided stillness', line: 'Music to sit with, eyes closed.', img: `${DIR}/tingsha.webp`, anim: 'ring', w: 170 },
];

export default function MoodMoments({ palette, value, onChange }: { palette: Palette; value: Mood | null; onChange: (m: Mood | null) => void }) {
  const dark = palette.isDark;
  return (
    <div>
      <style>{`
        .mm-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:16px}
        @media (max-width:1000px){.mm-grid{grid-template-columns:repeat(3,1fr)}}
        @media (max-width:640px){.mm-grid{grid-template-columns:repeat(2,1fr);gap:12px}}
        .mm-card{position:relative;display:flex;flex-direction:column;align-items:center;text-align:center;gap:8px;padding:22px 14px 20px;border-radius:26px;cursor:pointer;
          background:var(--mm-card);border:1.5px solid var(--mm-line);color:var(--mm-ink);font-family:${SANS};transition:transform .35s ease,box-shadow .35s ease,border-color .35s ease,background .35s ease}
        .mm-card:hover,.mm-card:focus-visible{transform:translateY(-6px);box-shadow:0 22px 44px rgba(0,0,0,.22);border-color:#E9C98A}
        .mm-card:focus-visible{outline:3px solid #E9C98A;outline-offset:3px}
        .mm-card[aria-pressed="true"]{border-color:#E9C98A;box-shadow:0 0 0 2px #E9C98A,0 18px 40px rgba(233,185,90,.28);background:var(--mm-on)}
        .mm-art{position:relative;display:grid;place-items:end center;height:170px;width:100%}
        .mm-art img{display:block;height:auto;max-height:170px;object-fit:contain;transition:opacity .8s ease,transform .6s ease,filter .6s ease}
        .mm-art .mm-lit{position:absolute;left:50%;bottom:0;transform:translateX(-50%);opacity:0}
        .mm-card:hover .mm-lit,.mm-card:focus-visible .mm-lit,.mm-card[aria-pressed="true"] .mm-lit{opacity:1;filter:drop-shadow(0 0 20px rgba(255,190,90,.6))}
        .mm-card:hover .mm-base,.mm-card:focus-visible .mm-base,.mm-card[aria-pressed="true"] .mm-base{opacity:0}
        .mm-card[data-anim="float"]:hover .mm-art img{transform:translateY(-8px) scale(1.05);filter:drop-shadow(0 0 22px rgba(255,214,140,.55))}
        .mm-card[data-anim="sway"]:hover .mm-art img{animation:mm-sway 1.6s ease-in-out infinite;transform-origin:50% 0}
        .mm-card[data-anim="ring"]:hover .mm-art img{animation:mm-ring .9s ease-in-out infinite}
        @keyframes mm-sway{0%,100%{transform:rotate(-5deg)}50%{transform:rotate(5deg)}}
        @keyframes mm-ring{0%,100%{transform:rotate(-3deg) scale(1.03)}50%{transform:rotate(3deg) scale(1.06)}}
        @media (prefers-reduced-motion: reduce){.mm-card,.mm-art img{transition:none;animation:none!important}}
      `}</style>
      <div className="mm-grid" role="group" aria-label="Choose a mood">
        {MOMENTS.map((m) => (
          <button key={m.mood} type="button" className="mm-card" data-anim={m.anim} aria-pressed={value === m.mood}
            onClick={() => onChange(value === m.mood ? null : m.mood)}
            style={{ ['--mm-card' as string]: palette.CARD, ['--mm-line' as string]: palette.BORDER, ['--mm-ink' as string]: palette.INK,
              ['--mm-on' as string]: dark ? '#241C33' : '#FFF6E2' }}>
            <span className="mm-art" aria-hidden="true">
              <img className="mm-base" src={m.img} alt="" width={m.w} loading="lazy" decoding="async" style={{ width: m.w }} />
              {m.lit && <img className="mm-lit" src={m.lit} alt="" width={m.w} loading="lazy" decoding="async" style={{ width: m.w }} />}
            </span>
            <span style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 600, lineHeight: 1.15 }}>{m.title}</span>
            <span style={{ fontSize: 13.5, lineHeight: 1.5, color: palette.INK2 }}>{m.line}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
