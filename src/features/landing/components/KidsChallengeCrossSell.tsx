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
  KIDS_PATH, KIDS_REGISTER_PATH, KIDS_TITLE, KIDS_AGES, KIDS_FORMAT,
  KIDS_STEPS, KIDS_POSTER_IMG, trackKids,
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
        }}
      >
        {/* ── Left: the pitch ───────────────────────────────────────────── */}
        <div style={{ padding: 'clamp(32px, 4.5vw, 56px)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <span style={{
              display: 'inline-block', padding: '5px 12px', borderRadius: 999,
              background: isDark ? 'rgba(201,174,142,0.14)' : 'rgba(122,95,68,0.10)',
              border: `1px solid ${palette.BORDER}`,
              fontFamily: SANS, fontSize: 9.5, fontWeight: 800, letterSpacing: '0.2em',
              textTransform: 'uppercase', color: palette.BROWN, marginBottom: 18,
            }}>
              New · For children
            </span>

            <h2
              id="kids-crosssell-heading"
              style={{
                fontFamily: SERIF, fontSize: 'clamp(26px, 3vw, 40px)', fontWeight: 400,
                lineHeight: 1.14, letterSpacing: '-0.01em', color: palette.INK, margin: '0 0 14px',
              }}
            >
              {KIDS_TITLE}
            </h2>

            <p style={{
              fontFamily: SANS, fontSize: 14.5, lineHeight: 1.65, color: palette.INK2,
              margin: '0 0 22px', maxWidth: 420,
            }}>
              {source === 'course'
                ? 'You are learning to meet your own feelings. This is the same practice, made playful — a 3-day live weekend challenge for your child.'
                : 'A 3-day live weekend challenge that helps children notice what they feel, understand their choices, and grow a little every day.'}
            </p>

            <p style={{
              fontFamily: SANS, fontSize: 12, fontWeight: 700, letterSpacing: '0.06em',
              textTransform: 'uppercase', color: palette.INK2, opacity: 0.85, margin: '0 0 24px',
            }}>
              {KIDS_AGES} &nbsp;·&nbsp; {KIDS_FORMAT}
            </p>
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
              Reserve my child&rsquo;s place <Arrow />
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
              See the 3 days
            </a>
          </div>
        </div>

        {/* ── Right: poster + Notice · Understand · Choose ────────────────── */}
        <div style={{
          padding: 'clamp(24px, 3.5vw, 36px)',
          background: palette.BAND,
          display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 14,
        }}>
          <div style={{ borderRadius: 18, overflow: 'hidden', marginBottom: 4 }}>
            <img
              src={KIDS_POSTER_IMG}
              alt="Let's Be Our Best Every Day! — a 3-day kids challenge for ages 3-12, helping children build emotional awareness, make positive choices and grow a happy heart"
              loading="lazy"
              style={{ width: '100%', display: 'block' }}
              onError={(e) => { (e.currentTarget.parentElement as HTMLElement).style.display = 'none'; }}
            />
          </div>
          {KIDS_STEPS.map((s, i) => (
            <div
              key={s.label}
              style={{
                background: palette.BAND_TILE,
                border: `1px solid ${palette.BAND_BORDER}`,
                borderRadius: 18, padding: '16px 18px',
                display: 'flex', alignItems: 'center', gap: 14,
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
        }
      `}</style>
    </section>
  );
}
