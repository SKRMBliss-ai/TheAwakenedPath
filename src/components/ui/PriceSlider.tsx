import { useMemo } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// PriceSlider — pay-what-you-want amount picker. A native range input (real
// accessibility + mobile drag behaviour for free) with a live price readout
// and quick-pick chips. The server always re-clamps to its own floor, so this
// is a trust-building UI, not the security boundary.
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  currency: string;         // 'INR' | 'USD' | …
  min: number;
  suggested: number;
  max?: number;              // default: a generous multiple of `suggested`
  value: number;
  onChange: (v: number) => void;
  accent?: string;           // CSS color for the track fill + chips
  dark?: boolean;
}

function fmt(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency', currency,
      maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    }).format(amount);
  } catch (_) {
    return `${currency} ${amount}`;
  }
}

export default function PriceSlider({ currency, min, suggested, max, value, onChange, accent = '#7A5F44', dark = false }: Props) {
  const top = max ?? Math.max(suggested * 3, min * 8);
  const pct = Math.min(100, Math.max(0, ((value - min) / (top - min)) * 100));

  const chips = useMemo(() => {
    const set = new Set([min, suggested, Math.round(suggested * 2)]);
    return Array.from(set).filter((v) => v >= min && v <= top).sort((a, b) => a - b);
  }, [min, suggested, top]);

  const textMain = dark ? '#fff' : '#2A2420';
  const textDim = dark ? 'rgba(255,255,255,0.55)' : '#6E6456';
  const trackBg = dark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.08)';

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 6, marginBottom: 14 }}>
        <span style={{ fontSize: 34, fontWeight: 800, color: accent, lineHeight: 1 }}>{fmt(value, currency)}</span>
      </div>

      <input
        type="range"
        min={min}
        max={top}
        step={min < 10 ? 0.5 : Math.max(1, Math.round(min / 10))}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label="Choose your price"
        style={{
          width: '100%', height: 8, borderRadius: 999, appearance: 'none', outline: 'none', cursor: 'pointer',
          background: `linear-gradient(to right, ${accent} 0%, ${accent} ${pct}%, ${trackBg} ${pct}%, ${trackBg} 100%)`,
          accentColor: accent,
        }}
        className="si-price-slider"
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, fontWeight: 700, color: textDim }}>
        <span>Min {fmt(min, currency)}</span>
        <span>Suggested {fmt(suggested, currency)}</span>
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 14, flexWrap: 'wrap' }}>
        {chips.map((c) => {
          const active = value === c;
          return (
            <button
              key={c}
              type="button"
              onClick={() => onChange(c)}
              style={{
                padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 800, cursor: 'pointer',
                border: `1.5px solid ${active ? accent : trackBg}`,
                background: active ? `${accent}22` : 'transparent',
                color: active ? accent : textMain,
                transition: 'all .15s',
              }}
            >
              {fmt(c, currency)}
            </button>
          );
        })}
      </div>

      <style>{`
        .si-price-slider::-webkit-slider-thumb {
          appearance: none; width: 22px; height: 22px; border-radius: 50%;
          background: ${accent}; border: 3px solid #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.3); cursor: pointer;
        }
        .si-price-slider::-moz-range-thumb {
          width: 22px; height: 22px; border-radius: 50%; border: 3px solid #fff;
          background: ${accent}; box-shadow: 0 2px 8px rgba(0,0,0,0.3); cursor: pointer;
        }
      `}</style>
    </div>
  );
}
