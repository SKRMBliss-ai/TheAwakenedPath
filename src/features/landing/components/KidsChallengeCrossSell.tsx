/**
 * KidsChallengeCrossSell.tsx
 *
 * Cross-sell banner for the 3-day kids challenge, "Let's Be Our Best Every
 * Day!". Rendered on the brand home (wellbeing world) and near the foot of the
 * Feelings & Emotions course page — the adult course is where parents already
 * are, so the children's program is the natural next step from there.
 *
 * Palette-driven so it reads correctly in both site themes.
 */
import type { Palette } from '../../../lib/siteTheme';
import {
  KIDS_PATH, KIDS_REGISTER_PATH, KIDS_TITLE,
  KIDS_STEPS, KIDS_CHART_IMG, trackKids,
} from '../kidsChallengeData';

const SERIF = "'Cormorant Garamond', Georgia, serif";
const SANS  = "'Outfit', system-ui, sans-serif";

function Arrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

export default function KidsChallengeCrossSell({
  palette,
  source = 'home',
}: {
  palette: Palette;
  /** Where this banner is being shown — logged so the placements stay distinguishable. */
  source?: 'home' | 'course';
}) {
  const isDark = palette.isDark;
  const fromPage = source === 'course' ? '/feelingsandemotioncourse' : '/';

  return (
    <section
      className="si-reveal"
      style={{ padding: 'clamp(24px, 4vw, 48px) clamp(24px, 6vw, 96px)', position: 'relative', zIndex: 2 }}
      aria-labelledby="kids-crosssell-heading"
    >
      <div
        className="si-kids-cross"
        style={{
          maxWidth: 1100, margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1.05fr 0.95fr',
          borderRadius: 28,
          overflow: 'hidden',
          background: palette.CARD,
          border: `1px solid ${palette.BORDER}`,
          boxShadow: isDark ? '0 30px 80px rgba(0,0,0,0.40)' : '0 24px 60px rgba(42,36,32,0.10)',
          position: 'relative',
        }}
      >
        {/* Diagonal Corner Badge */}
        <div style={{
          position: 'absolute',
          top: 22,
          left: -35,
          transform: 'rotate(-45deg)',
          background: 'linear-gradient(135deg, #783CB4 0%, #4A2860 100%)',
          color: '#FFFFFF',
          fontFamily: SANS,
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          padding: '6px 45px',
          boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
          zIndex: 10,
          pointerEvents: 'none',
          textAlign: 'center',
        }}>
          For Your Kids
        </div>
        {/* ── Left: the pitch ───────────────────────────────────────────── */}
        <div style={{ padding: 'clamp(32px, 4.5vw, 52px)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div>
            {source === 'course' && (
              <div style={{
                background: isDark ? 'rgba(201,174,142,0.15)' : 'rgba(122,95,68,0.08)',
                border: `1px solid ${palette.BORDER}`,
                borderRadius: 12, padding: '10px 14px', marginBottom: 18,
                fontFamily: SANS, fontSize: 12, color: palette.INK, lineHeight: 1.5,
              }}>
                💡 <strong>Note for Parents:</strong> This page is for the adult video course. Below is a <em>separate</em> 3-Day Live Zoom challenge for children.
              </div>
            )}

            <span style={{
              display: 'inline-block', padding: '5px 12px', borderRadius: 999,
              background: isDark ? 'rgba(201,174,142,0.14)' : 'rgba(122,95,68,0.10)',
              border: `1px solid ${palette.BORDER}`,
              fontFamily: SANS, fontSize: 9.5, fontWeight: 800, letterSpacing: '0.2em',
              textTransform: 'uppercase', color: palette.BROWN, marginBottom: 14,
            }}>
              Separate Program · For Children (Ages 3–12)
            </span>

            <h2
              id="kids-crosssell-heading"
              style={{
                fontFamily: SERIF, fontSize: 'clamp(26px, 3vw, 40px)', fontWeight: 400,
                lineHeight: 1.14, letterSpacing: '-0.01em', color: palette.INK, margin: '0 0 10px',
              }}
            >
              {KIDS_TITLE}
            </h2>

            <p style={{
              fontFamily: SANS, fontSize: 14.5, lineHeight: 1.65, color: palette.INK2,
              margin: '0 0 18px', maxWidth: 460,
            }}>
              {source === 'course'
                ? 'While you complete your adult reflection modules, give your child their own emotional awareness tools! This is a separate, interactive Live Zoom weekend challenge for kids. No upfront payment required.'
                : 'A separate 3-day live weekend challenge that helps children notice what they feel, understand their choices, and grow a little every day.'}
            </p>

            {/* Format chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '0 0 24px' }}>
              {['Live on Zoom', 'Friday–Sunday', '30–40 Mins', 'Ages 3–12', 'No Upfront Payment Required'].map((chip) => (
                <span key={chip} style={{
                  display: 'inline-flex', alignItems: 'center',
                  padding: '7px 13px', borderRadius: 999,
                  background: chip.includes('No Upfront') 
                    ? (isDark ? 'rgba(74,40,96,0.35)' : 'rgba(235,225,245,0.9)')
                    : (isDark ? 'rgba(201,174,142,0.09)' : 'rgba(122,95,68,0.055)'),
                  border: `1px solid ${chip.includes('No Upfront') ? palette.PURPLE_STRONG : palette.BORDER}`,
                  fontFamily: SANS, fontSize: 11.5, fontWeight: 700,
                  color: chip.includes('No Upfront') ? (isDark ? '#E8D2FF' : palette.PURPLE_STRONG) : palette.INK2,
                  whiteSpace: 'nowrap',
                }}>{chip}</span>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
            <a
              href={KIDS_REGISTER_PATH}
              onClick={() => trackKids('KIDS_CROSSSELL_REGISTER', fromPage)}
              style={{
                padding: '13px 26px', borderRadius: 999,
                background: palette.PURPLE_STRONG, color: palette.ON_ACCENT,
                textDecoration: 'none', fontFamily: SANS, fontSize: 13.5, fontWeight: 700,
                display: 'inline-flex', alignItems: 'center', gap: 8,
                transition: 'transform 0.25s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}
            >
              Register Child (No Payment Needed) <Arrow />
            </a>
            <a
              href={KIDS_PATH}
              onClick={() => trackKids('KIDS_CROSSSELL_DETAILS', fromPage)}
              style={{
                padding: '13px 22px', borderRadius: 999,
                background: 'transparent', border: `1px solid ${palette.BORDER}`,
                color: palette.INK, textDecoration: 'none',
                fontFamily: SANS, fontSize: 13.5, fontWeight: 700,
              }}
            >
              See Program Details
            </a>
            
            {/* Kids Challenge QR Code */}
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
              <img 
                src="https://firebasestorage.googleapis.com/v0/b/awakened-path-2026.firebasestorage.app/o/Marketting%2FKidsDiaryCourseQR.png?alt=media" 
                alt="Scan to Register" 
                style={{ width: 48, height: 48, borderRadius: 8, border: `1px solid ${palette.BORDER}` }} 
              />
              <span style={{ fontSize: 11, color: palette.INK2, fontFamily: SANS, fontWeight: 600, lineHeight: 1.2 }}>
                Scan to<br/>register
              </span>
            </div>
          </div>
        </div>

        {/* ── Right: poster + Notice · Understand · Choose ────────────────── */}
        <div className="si-kids-cross-panel" style={{
          padding: 'clamp(24px, 3.5vw, 36px)',
          /* Gradient rather than a flat slab, so the column reads as a panel of
             the same card instead of a hard vertical seam down the middle. */
          background: `linear-gradient(165deg, ${palette.BAND} 0%, ${palette.BAND_TILE} 100%)`,
          borderLeft: `1px solid ${palette.BAND_BORDER}`,
          display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12,
          position: 'relative',
        }}>
          <div style={{
            position: 'relative', borderRadius: 20, overflow: 'hidden', marginBottom: 6,
            border: `1px solid ${palette.BAND_BORDER}`,
            boxShadow: isDark ? '0 18px 44px rgba(0,0,0,0.4)' : '0 18px 44px rgba(42,36,32,0.16)',
          }}>
            <img
              src={KIDS_CHART_IMG}
              alt="Let's Be Our Best Every Day! — a 3-day kids challenge for ages 3-12, helping children build emotional awareness, make positive choices and grow a happy heart"
              loading="lazy"
              style={{ width: '100%', display: 'block' }}
              onError={(e) => { (e.currentTarget.parentElement as HTMLElement).style.display = 'none'; }}
            />
            <div aria-hidden="true" style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              background: 'linear-gradient(118deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 46%)',
            }} />
          </div>
          {KIDS_STEPS.map((s, i) => (
            <div
              key={s.label}
              style={{
                background: palette.BAND_TILE,
                border: `1px solid ${palette.BAND_BORDER}`,
                borderRadius: 18, padding: '15px 18px',
                display: 'flex', alignItems: 'center', gap: 14,
                transition: 'transform 0.25s ease, box-shadow 0.25s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateX(4px)';
                e.currentTarget.style.boxShadow = isDark ? '0 8px 22px rgba(0,0,0,0.28)' : '0 8px 22px rgba(42,36,32,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span style={{
                width: 30, height: 30, borderRadius: 999, flexShrink: 0,
                display: 'grid', placeItems: 'center',
                background: 'rgba(255,255,255,0.55)',
                fontFamily: SANS, fontSize: 13, fontWeight: 800, color: palette.ON_BAND_ACCENT,
              }}>{i + 1}</span>
              <span>
                <span style={{
                  display: 'block', fontFamily: SANS, fontSize: 12.5, fontWeight: 800,
                  letterSpacing: '0.1em', textTransform: 'uppercase', color: palette.ON_BAND_ACCENT,
                }}>{s.label}</span>
                <span style={{
                  display: 'block', fontFamily: SERIF, fontSize: 17, fontStyle: 'italic',
                  color: palette.ON_BAND, lineHeight: 1.35, marginTop: 2,
                }}>{s.quote}</span>
              </span>
            </div>
          ))}
          <p style={{
            fontFamily: SANS, fontSize: 11.5, fontWeight: 600, color: palette.ON_BAND_SOFT,
            margin: '4px 0 0', textAlign: 'center',
          }}>
            One small, conscious choice at a time — not perfection.
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 820px) {
          .si-kids-cross { grid-template-columns: 1fr !important; }
          /* Stacked, the panel sits below the pitch, so the seam is horizontal. */
          .si-kids-cross-panel { border-left: none !important; }
        }
      `}</style>
    </section>
  );
}
