import { useState } from 'react';

const SERIF = "'Cormorant Garamond', Georgia, serif";
const SANS = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

/**
 * The two founders. Sourced from the studio's transparent-background portraits
 * (Marketting/1.png, 2.png) converted to webp — the originals are 2000x2000
 * PNGs at ~4MB each, which is not something to ship to a checkout page.
 */
const FOUNDERS = [
  {
    key: 'shruti',
    name: 'Shruti Khungar',
    role: 'Co-founder · Soulful Intelligence',
    photo: '/marketing/shruti.webp',
    quote: 'You are not behind. You are exactly where the work begins.',
  },
  {
    key: 'sim',
    name: 'Sim Katyal',
    role: 'Co-founder · Mind Gym',
    photo: '/marketing/sim.webp',
    quote: 'Emotions are not problems to solve. They are messages to receive.',
  },
] as const;

export interface FoundersFlipCardProps {
  isDark?: boolean;
  ink?: string;
  inkSub?: string;
  /** Card chrome, so this matches whichever checkout page hosts it. */
  cardBg?: string;
  borderC?: string;
  accent?: string;
}

export function FoundersFlipCard({
  isDark = false,
  ink = isDark ? '#EDE9E3' : '#2A2118',
  inkSub = isDark ? 'rgba(237,233,227,0.6)' : '#6B5744',
  cardBg = isDark ? 'rgba(255,255,255,0.035)' : '#FFFFFF',
  borderC = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(196,181,160,0.4)',
  accent = isDark ? '#C4913A' : '#4A3260',
}: FoundersFlipCardProps) {
  const [flipped, setFlipped] = useState(false);
  const showing = flipped ? 1 : 0;
  const other = FOUNDERS[flipped ? 0 : 1];

  const face: React.CSSProperties = {
    position: 'absolute', inset: 0,
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '22px 20px 18px',
    borderRadius: 18,
    background: cardBg,
    border: `1px solid ${borderC}`,
    // Without this each face shows through the other mid-rotation.
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    overflow: 'hidden',
  };

  return (
    <div>
      <style>{`
        .si-flip-shell { perspective: 1200px; }
        .si-flip-inner {
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.7s cubic-bezier(0.4, 0.15, 0.2, 1);
        }
        .si-flip-inner.is-flipped { transform: rotateY(180deg); }
        .si-flip-back { transform: rotateY(180deg); }
        .si-flip-btn:hover .si-flip-hint { background: ${accent}; color: ${isDark ? '#15120F' : '#fff'}; }
        .si-flip-btn:focus-visible { outline: 2px solid ${accent}; outline-offset: 3px; border-radius: 20px; }
        @media (prefers-reduced-motion: reduce) {
          /* A half-second spin is exactly the kind of motion this setting is
             for; swap the faces instantly instead of disabling the control. */
          .si-flip-inner { transition: none; }
        }
      `}</style>

      <button
        type="button"
        className="si-flip-btn si-flip-shell"
        onClick={() => setFlipped((f) => !f)}
        aria-label={`Showing ${FOUNDERS[showing].name}. Tap to meet ${other.name}.`}
        style={{
          display: 'block', width: '100%', padding: 0, border: 'none',
          background: 'transparent', cursor: 'pointer', textAlign: 'inherit',
        }}
      >
        <div className={`si-flip-inner${flipped ? ' is-flipped' : ''}`} style={{ height: 384 }}>
          {FOUNDERS.map((f, i) => (
            <div key={f.key} className={i === 1 ? 'si-flip-back' : undefined} style={face}>
              {/* Soft halo so the cutout sits in the card rather than floating. */}
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute', top: -40, left: '50%', transform: 'translateX(-50%)',
                  width: 300, height: 300, borderRadius: '50%',
                  background: isDark
                    ? 'radial-gradient(circle, rgba(196,145,58,0.16) 0%, rgba(196,145,58,0) 70%)'
                    : 'radial-gradient(circle, rgba(74,50,96,0.09) 0%, rgba(74,50,96,0) 70%)',
                }}
              />

              <img
                src={f.photo}
                alt={f.name}
                loading="lazy"
                style={{
                  position: 'relative', height: 196, width: 'auto', objectFit: 'contain',
                  filter: isDark
                    ? 'drop-shadow(0 10px 24px rgba(0,0,0,0.45))'
                    : 'drop-shadow(0 10px 24px rgba(74,50,96,0.16))',
                }}
              />

              <p style={{
                position: 'relative', fontFamily: SERIF, fontSize: 15.5, fontStyle: 'italic',
                color: ink, lineHeight: 1.55, textAlign: 'center', margin: '12px 0 10px',
              }}>
                &ldquo;{f.quote}&rdquo;
              </p>

              <span style={{
                position: 'relative', fontFamily: SANS, fontSize: 11, fontWeight: 800,
                letterSpacing: '0.05em', textTransform: 'uppercase', color: accent,
              }}>
                {f.name}
              </span>
              <span style={{
                position: 'relative', fontFamily: SANS, fontSize: 10.5, color: inkSub, marginTop: 2,
              }}>
                {f.role}
              </span>

              <span
                className="si-flip-hint"
                style={{
                  position: 'relative', marginTop: 'auto',
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '5px 12px', borderRadius: 999,
                  border: `1px solid ${borderC}`,
                  fontFamily: SANS, fontSize: 10, fontWeight: 700, color: inkSub,
                  transition: 'background 0.2s, color 0.2s',
                }}
              >
                ⇄ Meet {FOUNDERS[i === 0 ? 1 : 0].name.split(' ')[0]}
              </span>
            </div>
          ))}
        </div>
      </button>
    </div>
  );
}
