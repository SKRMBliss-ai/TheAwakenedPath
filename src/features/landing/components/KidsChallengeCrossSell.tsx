/**
 * KidsChallengeCrossSell.tsx — promo banner for the Kids Mind Gym.
 *
 * (The file keeps its old name so existing imports keep working; it used to
 * promote the 3-day challenge and now promotes the Kids Mind Gym membership,
 * with the live Zoom class included.) Shown on the brand home, the Feelings &
 * Emotions course page, the About page and the guides hub: places parents
 * already visit for their own emotional work.
 *
 * Palette-driven so it reads correctly in both site themes. Every claim here
 * matches /tiny-kids-transformations; nothing about results or outcomes.
 */
import type { Palette } from '../../../lib/siteTheme';
import { KIDS_PATH, KIDS_STEPS, trackKids } from '../kidsChallengeData';
import { KIDS_ZOOM_PLANS, formatKidsPrice } from '../kidsPricing';

const SERIF = "'Cormorant Garamond', Georgia, serif";
const SANS  = "'Outfit', system-ui, sans-serif";

type Source = 'home' | 'course' | 'about' | 'guides';

const FROM: Record<Source, string> = {
  home: '/', course: '/feelingsandemotioncourse', about: '/about-us', guides: '/guides',
};

const TILES = [
  { img: '/rooms/feelings_card.webp', alt: 'A smiling child holding a glowing jar of light', label: 'Feelings' },
  { img: '/rooms/story_card.webp', alt: 'A child reading a storybook with a castle in the clouds', label: 'Story Lab' },
  { img: '/rooms/pause_card.webp', alt: 'A child sitting calmly beside a waterfall', label: 'Calm corner' },
];

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
  source?: Source;
}) {
  const isDark = palette.isDark;
  const fromPage = FROM[source];
  const price = KIDS_ZOOM_PLANS.monthly.price;
  const chips = [
    'Kids Mind Gym app',
    'Live Zoom class included',
    'Ages 3–12',
    ...(price != null ? [`From ${formatKidsPrice(price)} a month`] : []),
    '100% money-back guarantee',
  ];

  return (
    <section
      style={{ padding: 'clamp(24px, 4vw, 48px) clamp(16px, 6vw, 96px)', position: 'relative', zIndex: 2 }}
      aria-labelledby={`kids-crosssell-heading-${source}`}
    >
      <div
        className="si-kids-cross"
        style={{
          maxWidth: 1100, margin: '0 auto',
          display: 'grid', gridTemplateColumns: '1.05fr 0.95fr',
          borderRadius: 28, overflow: 'hidden',
          background: palette.CARD, border: `1px solid ${palette.BORDER}`,
          boxShadow: isDark ? '0 30px 80px rgba(0,0,0,0.40)' : '0 24px 60px rgba(42,36,32,0.10)',
          position: 'relative',
        }}
      >
        <div
          className="si-badge-diagonal"
          style={{
            position: 'absolute', top: 22, left: -35, transform: 'rotate(-45deg)',
            background: 'linear-gradient(135deg, #783CB4 0%, #4A2860 100%)', color: '#FFFFFF',
            fontFamily: SANS, fontSize: 10, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase',
            padding: '6px 45px', boxShadow: '0 4px 14px rgba(0,0,0,0.3)', zIndex: 10, pointerEvents: 'none', textAlign: 'center',
          }}
        >
          For Your Kids
        </div>

        {/* ── Left: the pitch ── */}
        <div style={{ padding: 'clamp(32px, 4.5vw, 52px)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div>
            {source === 'course' && (
              <div style={{
                background: isDark ? 'rgba(201,174,142,0.15)' : 'rgba(122,95,68,0.08)',
                border: `1px solid ${palette.BORDER}`, borderRadius: 12, padding: '10px 14px', marginBottom: 18,
                fontFamily: SANS, fontSize: 12, color: palette.INK, lineHeight: 1.5,
              }}>
                💡 <strong>Note for parents:</strong> this page is for the adult video course. Below is a <em>separate</em> app for children.
              </div>
            )}

            <span style={{
              display: 'inline-block', padding: '5px 12px', borderRadius: 999,
              background: isDark ? 'rgba(201,174,142,0.14)' : 'rgba(122,95,68,0.10)',
              border: `1px solid ${palette.BORDER}`,
              fontFamily: SANS, fontSize: 9.5, fontWeight: 800, letterSpacing: '0.2em',
              textTransform: 'uppercase', color: palette.BROWN, marginBottom: 14,
            }}>
              Separate program · For children ages 3–12
            </span>

            <h2
              id={`kids-crosssell-heading-${source}`}
              style={{
                fontFamily: SERIF, fontSize: 'clamp(26px, 3vw, 40px)', fontWeight: 400,
                lineHeight: 1.14, letterSpacing: '-0.01em', color: palette.INK, margin: '0 0 10px',
              }}
            >
              The Kids Mind Gym
            </h2>

            <p style={{ fontFamily: SANS, fontSize: 14.5, lineHeight: 1.65, color: palette.INK2, margin: '0 0 18px', maxWidth: 470 }}>
              A playful place for your child to notice what they feel, calm down and make kind choices, through ten short rooms,
              stories, games and a daily diary. A live Zoom class is included, with printable support material and WhatsApp
              1-1 support.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '0 0 24px' }}>
              {chips.map((chip) => (
                <span key={chip} style={{
                  display: 'inline-flex', alignItems: 'center', padding: '7px 13px', borderRadius: 999,
                  background: isDark ? 'rgba(201,174,142,0.09)' : 'rgba(122,95,68,0.055)',
                  border: `1px solid ${palette.BORDER}`, fontFamily: SANS, fontSize: 11.5, fontWeight: 700, color: palette.INK2,
                }}>{chip}</span>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
            <a
              href={`${KIDS_PATH}#zoom`}
              onClick={() => trackKids('KIDS_CROSSSELL_JOIN', fromPage)}
              style={{
                minHeight: 48, padding: '0 26px', borderRadius: 999,
                background: palette.PURPLE_STRONG, color: palette.ON_ACCENT,
                textDecoration: 'none', fontFamily: SANS, fontSize: 13.5, fontWeight: 700,
                display: 'inline-flex', alignItems: 'center', gap: 8, transition: 'transform 0.25s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}
            >
              See membership <Arrow />
            </a>
            <a
              href={`${KIDS_PATH}#features`}
              onClick={() => trackKids('KIDS_CROSSSELL_DETAILS', fromPage)}
              style={{
                minHeight: 48, padding: '0 22px', borderRadius: 999, display: 'inline-flex', alignItems: 'center',
                background: 'transparent', border: `1px solid ${palette.BORDER}`, color: palette.INK,
                textDecoration: 'none', fontFamily: SANS, fontSize: 13.5, fontWeight: 700,
              }}
            >
              See what is inside
            </a>
          </div>
        </div>

        {/* ── Right: pictures from the app + Notice · Understand · Choose ── */}
        <div className="si-kids-cross-panel" style={{
          padding: 'clamp(24px, 3.5vw, 36px)',
          background: `linear-gradient(165deg, ${palette.BAND} 0%, ${palette.BAND_TILE} 100%)`,
          borderLeft: `1px solid ${palette.BAND_BORDER}`,
          display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12, position: 'relative',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 6 }}>
            {TILES.map((t) => (
              <figure key={t.label} style={{
                margin: 0, position: 'relative', aspectRatio: '3 / 4', borderRadius: 16, overflow: 'hidden',
                border: `1px solid ${palette.BAND_BORDER}`,
                boxShadow: isDark ? '0 14px 34px rgba(0,0,0,0.4)' : '0 14px 34px rgba(42,36,32,0.16)',
              }}>
                <img src={t.img} alt={t.alt} loading="lazy" width={300} height={400}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                <figcaption style={{
                  position: 'absolute', left: 0, right: 0, bottom: 0, padding: '18px 8px 8px', textAlign: 'center',
                  color: '#fff', fontFamily: SERIF, fontSize: 16, fontWeight: 500,
                  background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(12,8,20,0.8) 100%)',
                }}>{t.label}</figcaption>
              </figure>
            ))}
          </div>
          {KIDS_STEPS.map((s, i) => (
            <div key={s.label} style={{
              background: palette.BAND_TILE, border: `1px solid ${palette.BAND_BORDER}`,
              borderRadius: 18, padding: '13px 18px', display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <span style={{
                width: 30, height: 30, borderRadius: 999, flexShrink: 0, display: 'grid', placeItems: 'center',
                background: 'rgba(255,255,255,0.55)', fontFamily: SANS, fontSize: 13, fontWeight: 800, color: palette.ON_BAND_ACCENT,
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
          <p style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 600, color: palette.ON_BAND_SOFT, margin: '4px 0 0', textAlign: 'center' }}>
            Practice and play for emotional skills. Not therapy or medical care.
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 820px) {
          .si-kids-cross { grid-template-columns: 1fr !important; }
          .si-kids-cross-panel { border-left: none !important; border-top: 1px solid ${palette.BORDER} !important; }
        }
        @media (max-width: 580px) {
          .si-badge-diagonal { font-size: 8.5px !important; padding: 4px 34px !important; top: 16px !important; left: -30px !important; }
        }
      `}</style>
    </section>
  );
}
