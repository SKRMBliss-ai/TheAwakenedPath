/**
 * KidsChallenge.tsx — /kidschallenge
 *
 * Sales page for "Let's Be Our Best Every Day!", the 3-day live kids
 * challenge (ages 3–12). Same chrome, palette and typographic system as the
 * other landing pages so the children's program reads as part of Soulful
 * Intelligence rather than a bolt-on microsite. Registration lives on its own
 * page (/kidschallenge/register).
 */
import { useEffect } from 'react';
import { Heart, Calendar, Clock, MapPin, Sparkles } from 'lucide-react';
import { usePageSeo } from '../../lib/seo';
import { useSiteTheme, type Palette } from '../../lib/siteTheme';
import { SiteHeader, SiteFooter } from '../../components/site/SiteChrome';
import SiteBackdrop from '../../components/site/SiteBackdrop';
import {
  KIDS_REGISTER_PATH, KIDS_TITLE, KIDS_TAGLINE, KIDS_AGES, KIDS_TIME,
  KIDS_BLURB, KIDS_DAYS, KIDS_AGE_BANDS, KIDS_INCLUDES, KIDS_STEPS, KIDS_FAQ,
  KIDS_CHART_IMG, KIDS_TEACHER_IMG, KIDS_TEACHER_POINTS, KIDS_TEACHER_QUOTE,
  KIDS_POSTER_IMG, trackKids,
} from './kidsChallengeData';

const SERIF = "'Cormorant Garamond', Georgia, serif";
const SANS  = "'Outfit', system-ui, -apple-system, sans-serif";

function Check({ color }: { color: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function Arrow() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function Cta({ palette, label, event }: { palette: Palette; label: string; event: string }) {
  return (
    <a
      href={KIDS_REGISTER_PATH}
      onClick={() => trackKids(event)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 9,
        padding: '15px 30px', borderRadius: 999,
        background: palette.PURPLE_STRONG, color: palette.ON_ACCENT,
        textDecoration: 'none', fontFamily: SANS, fontSize: 15, fontWeight: 700,
        transition: 'transform 0.25s ease',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}
    >
      {label} <Arrow />
    </a>
  );
}

function SectionTitle({ palette, kicker, title, sub }: { palette: Palette; kicker: string; title: string; sub?: string }) {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto 36px', textAlign: 'center' }}>
      <span style={{
        fontFamily: SANS, fontSize: 10.5, fontWeight: 800, letterSpacing: '0.22em',
        textTransform: 'uppercase', color: palette.BROWN, display: 'block', marginBottom: 12,
      }}>{kicker}</span>
      <h2 style={{
        fontFamily: SERIF, fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 400,
        lineHeight: 1.15, letterSpacing: '-0.01em', color: palette.INK, margin: '0 0 12px',
      }}>{title}</h2>
      {sub && (
        <p style={{ fontFamily: SANS, fontSize: 15.5, lineHeight: 1.65, color: palette.INK2, margin: 0 }}>
          {sub}
        </p>
      )}
    </div>
  );
}

export default function KidsChallenge() {
  const { palette, toggle: toggleTheme } = useSiteTheme();
  const isDark = palette.isDark;

  usePageSeo({
    title: "Let's Be Our Best Every Day! — 3-Day Live Kids Challenge (Ages 3–12)",
    description:
      'A playful 3-day live online challenge helping children ages 3–12 notice their feelings, understand their choices and grow a little every day. Friday to Sunday on Zoom, 30–40 minutes a day.',
    url: 'https://www.skrmblissai.in/kidschallenge',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: KIDS_TITLE,
      description: KIDS_BLURB,
      url: 'https://www.skrmblissai.in/kidschallenge',
      inLanguage: 'en',
      typicalAgeRange: '3-12',
      teaches: ['Emotional awareness for children', 'Self-regulation', 'Kindness and thoughtful choices'],
      provider: {
        '@type': 'Organization',
        name: 'Soulful Intelligence Studio',
        url: 'https://www.skrmblissai.in',
      },
      hasCourseInstance: {
        '@type': 'CourseInstance',
        courseMode: 'online',
        courseWorkload: 'PT2H',
        location: { '@type': 'VirtualLocation', url: 'https://www.skrmblissai.in/kidschallenge' },
      },
    },
  });

  useEffect(() => { trackKids('PAGE_VISIT_KIDS_CHALLENGE'); }, []);

  // Reveal-on-scroll, matching the other landing pages.
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          (e.target as HTMLElement).classList.add('si-visible');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });

    document.querySelectorAll<HTMLElement>('.si-reveal').forEach((el) => {
      if (el.getBoundingClientRect().top > window.innerHeight * 0.92) io.observe(el);
      else el.classList.add('si-visible');
    });
    return () => io.disconnect();
  }, []);

  const cardBg = palette.CARD;
  const border = palette.BORDER;
  const sectionTitle = (kicker: string, title: string, sub?: string) => (
    <SectionTitle palette={palette} kicker={kicker} title={title} sub={sub} />
  );

  return (
    <div className="min-h-screen w-full antialiased" style={{ fontFamily: SANS, background: palette.BG, color: palette.INK, overflowX: 'hidden' }}>
      <SiteBackdrop />

      <SiteHeader
        palette={palette}
        onToggleTheme={toggleTheme}
        links={[
          { label: 'Home', href: '/' },
          { label: 'The 3 days', href: '#days' },
          { label: 'Who it is for', href: '#who', secondary: true },
          { label: 'Questions', href: '#faq', secondary: true },
          {
            label: 'Courses',
            subItems: [
              {
                label: 'For All',
                sub: 'Feelings & Emotions · Power of Now · Wisdom Untethered',
                href: '/feelingsandemotioncourse',
              },
              {
                label: 'For Kids',
                sub: 'Let’s Be Our Best Every Day! (3-Day Challenge)',
                badge: 'NEW',
                href: '/kidschallenge',
              },
            ],
          },
        ]}
        cta={{ label: "Reserve my child's place →", href: KIDS_REGISTER_PATH, onClick: () => trackKids('KIDS_HEADER_CTA') }}
      />

      {/* Format strip */}
      <div style={{
        background: palette.BAND, color: palette.ON_BAND,
        padding: '10px 20px', textAlign: 'center',
        fontFamily: SANS, fontSize: 11.5, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase',
        position: 'relative', zIndex: 2,
      }}>
        Live on Zoom · Friday–Sunday · 30–40 minutes · {KIDS_AGES}
      </div>

      {/* ═══ Hero ═══════════════════════════════════════════════════════════ */}
      <header style={{ position: 'relative', zIndex: 2, padding: 'clamp(44px, 6vw, 76px) clamp(24px, 6vw, 96px) clamp(48px, 6vw, 84px)', overflow: 'hidden' }}>
        <div className="si-kids-hero" style={{
          maxWidth: 1240, margin: '0 auto',
          display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', gap: 'clamp(28px, 4vw, 64px)', alignItems: 'center',
          position: 'relative',
        }}>
          {/* Decorative orbs */}
          <div style={{
            position: 'absolute', top: -40, right: '15%', width: 120, height: 120,
            background: palette.PURPLE_STRONG, borderRadius: '50%', opacity: isDark ? 0.08 : 0.05, zIndex: 0, pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', bottom: -60, left: '10%', width: 150, height: 150,
            background: palette.BROWN, borderRadius: '50%', opacity: isDark ? 0.06 : 0.04, zIndex: 0, pointerEvents: 'none',
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <span style={{
              display: 'inline-block', padding: '8px 16px', borderRadius: 999,
              background: isDark ? 'rgba(201,174,142,0.18)' : 'rgba(122,95,68,0.12)',
              border: `1px solid ${border}`,
              fontFamily: SANS, fontSize: 10, fontWeight: 800, letterSpacing: '0.2em',
              textTransform: 'uppercase', color: palette.BROWN, marginBottom: 24,
            }}>
              3-Day Kids Challenge
            </span>

            <h1 style={{
              fontFamily: SERIF, fontSize: 'clamp(42px, 6.5vw, 72px)', fontWeight: 400,
              lineHeight: 1.08, letterSpacing: '-0.02em', color: palette.INK, margin: '0 0 18px',
            }}>
              Let&rsquo;s Be Our <span style={{ color: palette.BROWN }}>Best</span> Every Day!
            </h1>

            <p style={{
              fontFamily: SERIF, fontSize: 'clamp(18px, 2.3vw, 24px)', fontStyle: 'italic',
              color: palette.INK2, margin: '0 0 24px', lineHeight: 1.5,
            }}>
              {KIDS_TAGLINE}
            </p>

            <p style={{ fontFamily: SANS, fontSize: 16.5, lineHeight: 1.75, color: palette.INK2, maxWidth: 580, margin: '0 0 32px' }}>
              {KIDS_BLURB}
            </p>

            <Cta palette={palette} label="Reserve my child's place" event="KIDS_HERO_CTA" />

            <p style={{ fontFamily: SANS, fontSize: 12.5, color: palette.INK2, opacity: 0.7, marginTop: 16 }}>
              Parent or guardian registration required. Sessions run live on Zoom.
            </p>
          </div>

          {/* Poster — layered media stack with overlays */}
          <div className="si-hero-media" style={{ position: 'relative', zIndex: 1 }}>
            {/* Soft colour halo behind the stack */}
            <div aria-hidden="true" style={{
              position: 'absolute', inset: '-14% -10%', zIndex: 0, pointerEvents: 'none',
              background: `radial-gradient(58% 58% at 52% 46%, ${palette.PURPLE_STRONG} 0%, transparent 70%)`,
              opacity: isDark ? 0.3 : 0.16, filter: 'blur(52px)',
            }} />

            {/* Offset back card — gives the stack depth */}
            <div aria-hidden="true" className="si-hero-back" style={{
              position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
              transform: 'rotate(-3.5deg) translate(-16px, 16px)',
              borderRadius: 36, background: palette.BAND,
              border: `1px solid ${palette.BAND_BORDER}`,
              opacity: isDark ? 0.55 : 0.8,
            }} />

            {/* Main frame */}
            <div className="si-hero-frame" style={{
              position: 'relative', zIndex: 1,
              borderRadius: 36, overflow: 'hidden',
              border: `1px solid ${palette.BAND_BORDER}`,
              background: palette.BAND,
              transform: 'rotate(1.1deg)',
              boxShadow: isDark
                ? '0 40px 90px rgba(0,0,0,0.55), 0 8px 24px rgba(0,0,0,0.35)'
                : '0 40px 90px rgba(60,40,30,0.2), 0 8px 24px rgba(60,40,30,0.1)',
              transition: 'transform 0.55s cubic-bezier(0.2,0.8,0.2,1), box-shadow 0.55s ease',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'rotate(0deg) scale(1.02)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'rotate(1.1deg)'; }}
            >
              <img
                src="https://firebasestorage.googleapis.com/v0/b/awakened-path-2026.firebasestorage.app/o/Marketting%2FposterDairy.png?alt=media"
                alt="Let's Be Our Best Every Day! — a 3-day live kids challenge for ages 3 to 12, with poster and diary materials"
                style={{ width: '100%', height: 'auto', objectFit: 'cover', display: 'block' }}
              />

              {/* Bottom scrim so the glass bar always reads */}
              <div aria-hidden="true" style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                background: 'linear-gradient(180deg, rgba(0,0,0,0) 48%, rgba(26,16,36,0.62) 100%)',
              }} />

              {/* Diagonal sheen */}
              <div aria-hidden="true" style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                background: 'linear-gradient(118deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 44%)',
              }} />

              {/* Glass detail bar over the image */}
              <div className="si-hero-glass" style={{
                position: 'absolute', left: 14, right: 14, bottom: 14, zIndex: 2,
                display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 14,
                padding: '12px 18px', borderRadius: 20,
                background: 'rgba(26,16,36,0.46)',
                backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.24)',
                fontFamily: SANS, fontSize: 12.5, fontWeight: 700, color: '#FFFFFF',
              }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                  <Calendar size={15} /> Friday–Sunday
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                  <Clock size={15} /> 30–40 mins
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                  <MapPin size={15} /> {KIDS_TIME}
                </span>
              </div>
            </div>

            {/* Floating pill — top left */}
            <div className="si-hero-pill-a" style={{
              position: 'absolute', top: -20, left: -24, zIndex: 3,
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '11px 18px', borderRadius: 999,
              background: cardBg, border: `1px solid ${border}`,
              boxShadow: isDark ? '0 12px 30px rgba(0,0,0,0.45)' : '0 12px 30px rgba(60,40,30,0.14)',
              fontFamily: SANS, fontSize: 12.5, fontWeight: 800, color: palette.INK,
              letterSpacing: '0.02em',
            }}>
              <Sparkles size={16} color={palette.BROWN} /> {KIDS_AGES}
            </div>

            {/* Floating pill — bottom right */}
            <div className="si-hero-pill-b" style={{
              position: 'absolute', bottom: -22, right: -20, zIndex: 3,
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '11px 18px', borderRadius: 999,
              background: palette.PURPLE_STRONG, color: palette.ON_ACCENT,
              boxShadow: '0 14px 34px rgba(74,40,96,0.38)',
              fontFamily: SANS, fontSize: 12.5, fontWeight: 800, letterSpacing: '0.02em',
            }}>
              <Heart size={15} fill="currentColor" /> Live on Zoom
            </div>
          </div>
        </div>
      </header>

      <div style={{ padding: '0 24px', position: 'relative', zIndex: 2 }}><div className="si-divider" /></div>

      {/* ═══ The three days ═════════════════════════════════════════════════ */}
      <section id="days" className="si-reveal" style={{ position: 'relative', zIndex: 2, padding: 'clamp(56px, 8vw, 88px) clamp(24px, 6vw, 96px)' }}>
        {sectionTitle(
          'The weekend journey',
          'What will your child experience?',
          'Three short, interactive sessions built around real-life situations children already recognise — short enough to hold attention, meaningful enough to start a habit.',
        )}

        <div className="si-kids-grid-3" style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {KIDS_DAYS.map((d, i) => (
            <article key={d.day} style={{
              background: cardBg, border: `1px solid ${border}`, borderRadius: 28,
              padding: 'clamp(28px, 4vw, 36px)',
              position: 'relative', overflow: 'hidden',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'default',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-6px)';
              e.currentTarget.style.boxShadow = isDark ? '0 16px 40px rgba(0,0,0,0.3)' : '0 16px 40px rgba(60,40,30,0.12)';
              e.currentTarget.style.borderColor = palette.PURPLE_STRONG;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = border;
            }}
            >
              {/* Top accent border on hover */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                background: ['linear-gradient(90deg, ' + palette.PURPLE_STRONG + ', ' + palette.BROWN + ')',
                           'linear-gradient(90deg, ' + palette.BROWN + ', ' + palette.PURPLE_STRONG + ')',
                           'linear-gradient(90deg, ' + palette.PURPLE_STRONG + ', ' + palette.BROWN + ')'][i],
                opacity: 0,
                transition: 'opacity 0.3s ease',
              }}
              onMouseEnter={(e) => { (e.target as HTMLElement).style.opacity = '1'; }}
              onMouseLeave={(e) => { (e.target as HTMLElement).style.opacity = '0'; }}
              />

              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 40, height: 40, borderRadius: 999, marginBottom: 18,
                background: palette.PURPLE_STRONG, color: palette.ON_ACCENT,
                fontFamily: SANS, fontSize: 14, fontWeight: 800,
                boxShadow: isDark ? '0 4px 12px rgba(83,74,183,0.2)' : '0 4px 12px rgba(83,74,183,0.15)',
              }}>{i + 1}</span>

              <p style={{
                fontFamily: SANS, fontSize: 11, fontWeight: 900, letterSpacing: '0.22em',
                textTransform: 'uppercase', color: palette.BROWN, margin: '0 0 10px',
              }}>{d.day}</p>

              <h3 style={{
                fontFamily: SERIF, fontSize: 28, fontWeight: 400, color: palette.INK, margin: '0 0 14px', lineHeight: 1.2,
              }}>{d.title}</h3>

              <p style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.7, color: palette.INK2, margin: '0 0 18px' }}>
                {d.body}
              </p>

              <p style={{
                fontFamily: SANS, fontSize: 12.5, lineHeight: 1.65, color: palette.INK2,
                opacity: 0.75, margin: 0, paddingTop: 16, borderTop: `1px solid ${border}`,
              }}>
                {d.detail}
              </p>
            </article>
          ))}
        </div>

        <div style={{
          maxWidth: 1100, margin: '24px auto 0',
          background: cardBg, border: `1px solid ${border}`, borderRadius: 20,
          padding: '18px 24px', textAlign: 'center',
          fontFamily: SANS, fontSize: 14, fontWeight: 600, color: palette.INK,
        }}>
          <strong>{KIDS_TIME}</strong> each day.{' '}
          <span style={{ color: palette.INK2, fontWeight: 500 }}>
            Please check your own local time when you register — UK and US daylight saving can shift the conversion.
          </span>
        </div>
      </section>

      {/* ═══ The chart — the thing the weekend is built around ══════════════
          Placed straight after the three days on purpose: the sessions are
          what a family attends, but the chart is what they keep, so it earns
          a full band of its own rather than a thumbnail further down. */}
      <section
        id="chart"
        className="si-reveal si-chart-band"
        style={{
          position: 'relative', zIndex: 2,
          padding: 'clamp(56px, 8vw, 92px) clamp(24px, 6vw, 96px)',
          background: palette.BAND, color: palette.ON_BAND,
        }}
      >
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div className="si-chart-grid" style={{
            display: 'grid', gridTemplateColumns: '1.15fr 0.85fr',
            gap: 'clamp(32px, 4.5vw, 60px)', alignItems: 'center',
          }}>
            {/* ── The chart itself ── */}
            <div className="si-chart-media" style={{ position: 'relative' }}>
              <div aria-hidden="true" className="si-chart-back" style={{
                position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
                transform: 'rotate(-2.4deg) translate(-12px, 12px)',
                borderRadius: 26, background: palette.BAND_TILE,
                border: `1px solid ${palette.BAND_BORDER}`,
              }} />

              <div className="si-chart-frame" style={{
                position: 'relative', zIndex: 1,
                borderRadius: 26, overflow: 'hidden',
                border: `1px solid ${palette.BAND_BORDER}`,
                background: '#FFFFFF',
                transform: 'rotate(0.8deg)',
                boxShadow: '0 34px 80px rgba(20,14,26,0.34), 0 8px 22px rgba(20,14,26,0.2)',
                transition: 'transform 0.55s cubic-bezier(0.2,0.8,0.2,1)',
              }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'rotate(0deg) scale(1.015)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'rotate(0.8deg)'; }}
              >
                <img
                  src={KIDS_CHART_IMG}
                  alt="The Let's Be Our Best Every Day! chart — seven daily practices tracked across a full month, with a Look Back &amp; Learn reflection panel"
                  loading="lazy"
                  style={{ width: '100%', display: 'block' }}
                  onError={(e) => { (e.currentTarget.parentElement as HTMLElement).style.display = 'none'; }}
                />
                <div aria-hidden="true" style={{
                  position: 'absolute', inset: 0, pointerEvents: 'none',
                  background: 'linear-gradient(118deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 42%)',
                }} />
              </div>

              <div className="si-chart-pill" style={{
                position: 'absolute', top: -16, left: -16, zIndex: 3,
                display: 'inline-flex', alignItems: 'center', gap: 7,
                padding: '10px 17px', borderRadius: 999,
                background: palette.PURPLE_STRONG, color: palette.ON_ACCENT,
                boxShadow: '0 12px 30px rgba(20,14,26,0.32)',
                fontFamily: SANS, fontSize: 11.5, fontWeight: 800, letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}>
                <Sparkles size={14} /> Yours to keep
              </div>
            </div>

            {/* ── The pitch ── */}
            <div>
              <span style={{
                display: 'inline-block', padding: '7px 15px', borderRadius: 999,
                background: palette.BAND_TILE, border: `1px solid ${palette.BAND_BORDER}`,
                fontFamily: SANS, fontSize: 10, fontWeight: 800, letterSpacing: '0.2em',
                textTransform: 'uppercase', color: palette.ON_BAND_ACCENT, marginBottom: 18,
              }}>
                Included with the challenge
              </span>

              <h2 style={{
                fontFamily: SERIF, fontSize: 'clamp(30px, 4vw, 50px)', fontWeight: 400,
                lineHeight: 1.1, letterSpacing: '-0.015em', color: palette.ON_BAND, margin: '0 0 16px',
              }}>
                The weekend ends.<br />The chart keeps going.
              </h2>

              <p style={{
                fontFamily: SANS, fontSize: 15.5, lineHeight: 1.7,
                color: palette.ON_BAND_SOFT, margin: '0 0 24px', maxWidth: 460,
              }}>
                Three live sessions teach your child the practice. This chart is what
                carries it into everyday life — a full month of small, tickable choices
                they fill in themselves, then look back on together at the end.
              </p>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'grid', gap: 10 }}>
                {[
                  { k: '7 daily practices', v: 'Be kind · Tell the truth · Love everyone · Help others · and three more' },
                  { k: 'Thought, word and action', v: 'Each practice is tracked three ways, so children see the whole picture' },
                  { k: '31 days on one page', v: 'A month of progress the whole family can see at a glance' },
                ].map((row) => (
                  <li key={row.k} style={{
                    display: 'flex', gap: 12, alignItems: 'flex-start',
                    padding: '13px 16px', borderRadius: 16,
                    background: palette.BAND_TILE, border: `1px solid ${palette.BAND_BORDER}`,
                  }}>
                    <span style={{
                      flexShrink: 0, marginTop: 2, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: 24, height: 24, borderRadius: '50%', background: palette.PURPLE_STRONG,
                    }}><Check color={palette.ON_ACCENT} /></span>
                    <span style={{ fontFamily: SANS, fontSize: 14, lineHeight: 1.55, color: palette.ON_BAND }}>
                      <strong style={{ fontWeight: 800 }}>{row.k}</strong>
                      <span style={{ display: 'block', color: palette.ON_BAND_SOFT, fontSize: 13.5, marginTop: 2 }}>
                        {row.v}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>

              <Cta palette={palette} label="Reserve my child's place" event="KIDS_CHART_CTA" />
            </div>
          </div>

          {/* ── Look Back & Learn — the monthly reflection built into the chart ── */}
          <div style={{
            marginTop: 'clamp(32px, 4vw, 52px)',
            padding: 'clamp(24px, 3vw, 34px)',
            borderRadius: 26,
            background: palette.BAND_TILE,
            border: `1px solid ${palette.BAND_BORDER}`,
          }}>
            <p style={{
              fontFamily: SANS, fontSize: 10, fontWeight: 800, letterSpacing: '0.2em',
              textTransform: 'uppercase', color: palette.ON_BAND_ACCENT, margin: '0 0 6px',
            }}>
              Look Back &amp; Learn
            </p>
            <p style={{
              fontFamily: SANS, fontSize: 14.5, lineHeight: 1.65,
              color: palette.ON_BAND_SOFT, margin: '0 0 20px', maxWidth: 620,
            }}>
              At the end of each month the chart turns into a conversation. Four questions,
              answered together:
            </p>

            <div className="si-chart-qs" style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 12,
            }}>
              {[
                'What did I learn about myself this month?',
                'What made me feel proud?',
                'What was difficult — and what can I do next time?',
                'What are my goals for next month?',
              ].map((q, i) => (
                <div key={q} style={{
                  display: 'flex', gap: 11, alignItems: 'flex-start',
                  padding: '15px 17px', borderRadius: 18,
                  background: isDark ? 'rgba(0,0,0,0.14)' : 'rgba(255,255,255,0.42)',
                  border: `1px solid ${palette.BAND_BORDER}`,
                }}>
                  <span style={{
                    flexShrink: 0, width: 24, height: 24, borderRadius: 999,
                    display: 'grid', placeItems: 'center',
                    background: 'rgba(255,255,255,0.62)',
                    fontFamily: SANS, fontSize: 12, fontWeight: 800, color: palette.ON_BAND_ACCENT,
                  }}>{i + 1}</span>
                  <span style={{
                    fontFamily: SERIF, fontSize: 16.5, fontStyle: 'italic',
                    lineHeight: 1.4, color: palette.ON_BAND,
                  }}>{q}</span>
                </div>
              ))}
            </div>

            <p style={{
              fontFamily: SERIF, fontSize: 'clamp(17px, 2vw, 21px)', fontStyle: 'italic',
              textAlign: 'center', color: palette.ON_BAND, margin: '24px 0 0', lineHeight: 1.5,
            }}>
              &ldquo;I am the master of my choices. Every day I grow a little better.&rdquo;
            </p>
          </div>
        </div>
      </section>

      <div style={{ padding: '0 24px', position: 'relative', zIndex: 2 }}><div className="si-divider" /></div>

      {/* ═══ Who it is for + what families receive ══════════════════════════ */}
      <section id="who" className="si-reveal" style={{ position: 'relative', zIndex: 2, padding: 'clamp(56px, 8vw, 88px) clamp(24px, 6vw, 96px)' }}>
        <div className="si-kids-grid-2" style={{ maxWidth: 1140, margin: '0 auto', display: 'grid', gridTemplateColumns: '0.86fr 1.14fr', gap: 28, alignItems: 'start' }}>
          {/* Who is it for */}
          <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 28, padding: 'clamp(30px, 3.6vw, 40px)' }}>
            <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(27px, 2.6vw, 32px)', fontWeight: 400, color: palette.INK, margin: '0 0 22px', lineHeight: 1.15 }}>
              Who is it for?
            </h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 12 }}>
              {KIDS_AGE_BANDS.map((a) => (
                <li key={a.band} style={{
                  display: 'flex', gap: 14, alignItems: 'flex-start',
                  padding: '16px 18px', borderRadius: 20,
                  background: isDark ? 'rgba(201,174,142,0.07)' : 'rgba(122,95,68,0.045)',
                  border: `1px solid ${border}`,
                }}>
                  <span style={{
                    flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    minWidth: 46, height: 30, padding: '0 10px', borderRadius: 999,
                    background: isDark ? 'rgba(201,174,142,0.18)' : 'rgba(122,95,68,0.12)',
                    fontFamily: SANS, fontSize: 12.5, fontWeight: 800, color: palette.BROWN,
                    letterSpacing: '0.02em',
                  }}>{a.band.replace(/^Ages\s*/i, '')}</span>
                  <span>
                    <span style={{
                      display: 'block', fontFamily: SANS, fontSize: 11, fontWeight: 800,
                      letterSpacing: '0.16em', textTransform: 'uppercase', color: palette.BROWN, marginBottom: 5,
                    }}>{a.band}</span>
                    <span style={{ display: 'block', fontFamily: SANS, fontSize: 14.5, lineHeight: 1.65, color: palette.INK2 }}>
                      {a.detail}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* What families receive — featured */}
          <div style={{
            background: isDark
              ? `linear-gradient(150deg, rgba(83,74,183,0.20) 0%, rgba(201,174,142,0.07) 58%, rgba(83,74,183,0.10) 100%)`
              : `linear-gradient(150deg, rgba(83,74,183,0.10) 0%, rgba(201,174,142,0.07) 58%, rgba(83,74,183,0.05) 100%)`,
            border: `1.5px solid ${palette.PURPLE_STRONG}`, borderRadius: 28,
            padding: 'clamp(30px, 3.6vw, 40px)',
            position: 'relative', overflow: 'hidden',
            boxShadow: isDark ? '0 24px 60px rgba(0,0,0,0.3)' : '0 24px 60px rgba(83,74,183,0.10)',
          }}>
            {/* corner glow */}
            <div aria-hidden="true" style={{
              position: 'absolute', top: -70, right: -70, width: 220, height: 220, borderRadius: '50%',
              background: palette.PURPLE_STRONG, opacity: isDark ? 0.16 : 0.08, filter: 'blur(30px)', pointerEvents: 'none',
            }} />

            <div style={{
              position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexWrap: 'wrap', gap: 12, marginBottom: 22,
            }}>
              <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(27px, 2.6vw, 32px)', fontWeight: 400, color: palette.INK, margin: 0, lineHeight: 1.15 }}>
                What families receive
              </h2>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0,
                background: palette.PURPLE_STRONG, color: palette.ON_ACCENT,
                padding: '7px 15px', borderRadius: 999,
                fontFamily: SANS, fontSize: 10, fontWeight: 800, letterSpacing: '0.14em',
                textTransform: 'uppercase',
                boxShadow: '0 6px 18px rgba(74,40,96,0.28)',
              }}>
                <Check color={palette.ON_ACCENT} /> Included
              </span>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 12, position: 'relative' }}>
              {KIDS_INCLUDES.map((f) => (
                <li key={f} style={{
                  display: 'flex', gap: 13, alignItems: 'center',
                  padding: '13px 16px', borderRadius: 16,
                  background: isDark ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.6)',
                  border: `1px solid ${border}`,
                  fontFamily: SANS, fontSize: 14.5, lineHeight: 1.6, color: palette.INK,
                }}>
                  <span style={{
                    flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: 26, height: 26, borderRadius: '50%',
                    background: palette.PURPLE_STRONG,
                  }}><Check color={palette.ON_ACCENT} /></span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <div style={{ padding: '0 24px', position: 'relative', zIndex: 2 }}><div className="si-divider" /></div>

      {/* ═══ Know Your Teacher ══════════════════════════════════════════════ */}
      <section className="si-reveal" style={{ position: 'relative', zIndex: 2, padding: 'clamp(56px, 8vw, 88px) clamp(24px, 6vw, 96px)' }}>
        {sectionTitle('A mother’s journey · A global mission', 'Know Your Teacher', 'Because this journey began with one mother wanting to help her own child.')}

        <div className="si-kids-grid-2" style={{ maxWidth: 1060, margin: '0 auto', display: 'grid', gridTemplateColumns: '0.82fr 1.18fr', gap: 28, alignItems: 'stretch', position: 'relative' }}>
          <div className="si-teacher-photo" style={{
            borderRadius: 32, overflow: 'hidden', border: `1px solid ${border}`, minHeight: 420,
            boxShadow: isDark ? '0 28px 70px rgba(0,0,0,0.38)' : '0 28px 70px rgba(60,40,30,0.16)',
            position: 'relative', zIndex: 1, background: palette.BAND,
          }}>
            <img
              src={KIDS_TEACHER_IMG}
              alt="A mother and her young son sharing a learning moment together"
              loading="lazy"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 22%', display: 'block' }}
              onError={(e) => {
                (e.currentTarget.parentElement as HTMLElement).style.background =
                  'linear-gradient(135deg, #2A1E40 0%, #4A2860 50%, #C4913A 150%)';
                e.currentTarget.style.display = 'none';
              }}
            />
            {/* soft scrim for depth */}
            <div aria-hidden="true" style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              background: 'linear-gradient(180deg, rgba(0,0,0,0) 58%, rgba(26,16,36,0.42) 100%)',
            }} />
          </div>

          <div style={{
            background: cardBg, border: `1px solid ${border}`, borderRadius: 28,
            padding: 'clamp(30px, 3.6vw, 42px)', position: 'relative', zIndex: 2,
            display: 'flex', flexDirection: 'column',
          }}>
            <p style={{ fontFamily: SERIF, fontSize: 'clamp(17px, 1.9vw, 20px)', fontStyle: 'italic', lineHeight: 1.6, color: palette.INK, margin: '0 0 14px' }}>
              I&rsquo;m a mom on a journey of helping my 5-year-old understand his feelings, make thoughtful choices and grow into a kind, confident and mindful human being.
            </p>
            <p style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.75, color: palette.INK2, margin: '0 0 22px' }}>
              As I learned what helped my own child, I realised how valuable these simple everyday tools could be for other families too — so I want to share them with children around the world, in a way that feels playful, practical and easy for families to bring into everyday life.
            </p>

            <div style={{ display: 'grid', gap: 10, marginBottom: 24 }}>
              {KIDS_TEACHER_POINTS.map((p) => (
                <div key={p.title} style={{
                  display: 'flex', gap: 13, alignItems: 'flex-start',
                  padding: '13px 16px', borderRadius: 18,
                  background: isDark ? 'rgba(201,174,142,0.07)' : 'rgba(122,95,68,0.045)',
                  border: `1px solid ${border}`,
                }}>
                  <span style={{
                    flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: 36, height: 36, borderRadius: '50%', fontSize: 18, lineHeight: 1,
                    background: isDark ? 'rgba(191,176,189,0.16)' : 'rgba(255,255,255,0.85)',
                    border: `1px solid ${border}`,
                  }}>{p.icon}</span>
                  <span>
                    <strong style={{ display: 'block', fontFamily: SANS, fontSize: 14.5, fontWeight: 800, color: palette.INK, marginBottom: 3 }}>{p.title}</strong>
                    <span style={{ display: 'block', fontFamily: SANS, fontSize: 13.5, color: palette.INK2, lineHeight: 1.6 }}>{p.body}</span>
                  </span>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: 'auto',
              position: 'relative', overflow: 'hidden',
              background: `linear-gradient(135deg, ${palette.PURPLE_STRONG} 0%, ${palette.BROWN} 190%)`,
              color: palette.ON_ACCENT,
              borderRadius: 20, padding: '22px 24px 22px 54px',
              fontFamily: SERIF, fontStyle: 'italic', fontSize: 'clamp(15.5px, 1.7vw, 17.5px)', lineHeight: 1.6,
              boxShadow: '0 14px 34px rgba(74,40,96,0.28)',
            }}>
              <span aria-hidden="true" style={{
                position: 'absolute', left: 18, top: 6,
                fontFamily: SERIF, fontSize: 58, lineHeight: 1, opacity: 0.34, fontStyle: 'normal',
              }}>&ldquo;</span>
              {KIDS_TEACHER_QUOTE}
            </div>
          </div>
        </div>
      </section>

      <div style={{ padding: '0 24px', position: 'relative', zIndex: 2 }}><div className="si-divider" /></div>

      {/* ═══ The three questions ════════════════════════════════════════════ */}
      <section className="si-reveal" style={{ position: 'relative', zIndex: 2, padding: 'clamp(56px, 8vw, 88px) clamp(24px, 6vw, 96px)' }}>
        {sectionTitle(
          'Why this approach',
          'We are not asking children to be perfect.',
          'We are helping them become more aware of the choices they make — one small, conscious choice at a time.',
        )}

        <div className="si-kids-grid-3" style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
          {KIDS_STEPS.map((s) => (
            <div key={s.label} style={{
              background: palette.BAND, border: `1px solid ${palette.BAND_BORDER}`,
              borderRadius: 24, padding: 'clamp(26px, 3vw, 34px)', textAlign: 'center',
            }}>
              <p style={{
                fontFamily: SANS, fontSize: 11, fontWeight: 800, letterSpacing: '0.2em',
                textTransform: 'uppercase', color: palette.ON_BAND_ACCENT, margin: '0 0 12px',
              }}>{s.label}</p>
              <p style={{ fontFamily: SERIF, fontSize: 22, fontStyle: 'italic', lineHeight: 1.4, color: palette.ON_BAND, margin: 0 }}>
                {s.quote}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div style={{ padding: '0 24px', position: 'relative', zIndex: 2 }}><div className="si-divider" /></div>

      {/* ═══ FAQ ════════════════════════════════════════════════════════════ */}
      <section id="faq" className="si-reveal" style={{ position: 'relative', zIndex: 2, padding: 'clamp(56px, 8vw, 88px) clamp(24px, 6vw, 96px)' }}>
        {sectionTitle('Before you register', 'Questions parents may have')}

        <div style={{ maxWidth: 800, margin: '0 auto', display: 'grid', gap: 14 }}>
          {KIDS_FAQ.map((f) => (
            <details key={f.q} style={{
              background: cardBg, border: `1px solid ${border}`, borderRadius: 20, padding: '20px 24px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = palette.PURPLE_STRONG;
              e.currentTarget.style.boxShadow = isDark ? '0 4px 12px rgba(0,0,0,0.1)' : '0 4px 12px rgba(60,40,30,0.06)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = border;
              e.currentTarget.style.boxShadow = 'none';
            }}
            >
              <summary style={{
                fontFamily: SANS, fontSize: 15.5, fontWeight: 700, color: palette.INK, cursor: 'pointer', userSelect: 'none',
              }}>{f.q}</summary>
              <p style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.75, color: palette.INK2, margin: '14px 0 0', opacity: 0.9 }}>
                {f.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* ═══ Final CTA (Redesigned with Poster Graphic) ═════════════════════ */}
      <section className="si-reveal" style={{
        position: 'relative', zIndex: 2,
        padding: 'clamp(64px, 10vw, 104px) clamp(24px, 6vw, 96px)',
      }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto',
          background: isDark ? 'linear-gradient(145deg, rgba(74, 40, 96, 0.6) 0%, rgba(42, 30, 64, 0.8) 100%)' : 'linear-gradient(145deg, rgba(253, 247, 243, 0.8) 0%, rgba(245, 237, 230, 0.6) 100%)',
          backdropFilter: 'blur(10px)',
          borderRadius: 40, padding: 'clamp(36px, 5vw, 56px)',
          border: `1px solid ${palette.BAND_BORDER}`,
          boxShadow: isDark ? '0 32px 96px rgba(0,0,0,0.4)' : '0 32px 96px rgba(60,40,30,0.1)',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Decorative accent */}
          <div style={{
            position: 'absolute', top: -60, right: -60, width: 200, height: 200,
            background: palette.PURPLE_STRONG, borderRadius: '50%', opacity: isDark ? 0.08 : 0.05, zIndex: 0, pointerEvents: 'none',
          }} />

          <div className="si-kids-footer-grid" style={{
            display: 'grid',
            gridTemplateColumns: '1.05fr 1fr',
            gap: 'clamp(28px, 4vw, 44px)',
            alignItems: 'center',
            position: 'relative', zIndex: 1,
          }}>
            {/* Poster image column */}
            <div className="si-cta-photo" style={{
              position: 'relative',
              borderRadius: 32,
              overflow: 'hidden',
              border: `1px solid ${palette.BAND_BORDER}`,
              boxShadow: isDark ? '0 26px 64px rgba(0,0,0,0.38)' : '0 26px 64px rgba(60,40,30,0.16)',
              transform: 'rotate(-1.4deg)',
              transition: 'transform 0.55s cubic-bezier(0.2,0.8,0.2,1)',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'rotate(0deg) scale(1.02)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'rotate(-1.4deg)'; }}
            >
              <img
                src={KIDS_POSTER_IMG}
                alt="Let's Be Our Best Every Day! Poster"
                loading="lazy"
                style={{ width: '100%', height: 'auto', objectFit: 'cover', display: 'block' }}
              />
              <div aria-hidden="true" style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                background: 'linear-gradient(118deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 46%)',
              }} />
            </div>

            {/* Content column */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 16, color: palette.BROWN }}>
                <Sparkles size={24} /> <Heart size={24} fill="currentColor" /> <Sparkles size={24} />
              </div>

              <h2 style={{
                fontFamily: SERIF, fontSize: 'clamp(28px, 3.6vw, 44px)', fontWeight: 400,
                lineHeight: 1.15, color: palette.INK, margin: '0 0 18px',
              }}>
                Give your child three little days to discover something powerful.
              </h2>

              <p style={{
                fontFamily: SERIF, fontSize: 'clamp(18px, 2.2vw, 24px)', fontStyle: 'italic',
                lineHeight: 1.55, color: palette.INK2, margin: '0 0 28px',
              }}>
                I can notice what I feel.<br />
                I can choose what I do.<br />
                I can grow a little every day.
              </p>

              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10,
                marginBottom: 28,
              }}>
                {[
                  { icon: <Calendar size={17} color={palette.PURPLE_STRONG} />, label: 'Every week', value: 'Friday–Sunday' },
                  { icon: <Clock size={17} color={palette.PURPLE_STRONG} />, label: 'Each session', value: '30–40 mins' },
                  { icon: <MapPin size={17} color={palette.PURPLE_STRONG} />, label: 'Starts at', value: KIDS_TIME },
                ].map((m) => (
                  <div key={m.label} style={{
                    display: 'flex', alignItems: 'center', gap: 11,
                    background: isDark ? 'rgba(0,0,0,0.22)' : 'rgba(255,255,255,0.72)',
                    border: `1px solid ${border}`, borderRadius: 18, padding: '13px 15px',
                  }}>
                    <span style={{
                      flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: 34, height: 34, borderRadius: '50%',
                      background: isDark ? 'rgba(191,176,189,0.16)' : 'rgba(105,94,104,0.09)',
                    }}>{m.icon}</span>
                    <span style={{ minWidth: 0 }}>
                      <span style={{
                        display: 'block', fontFamily: SANS, fontSize: 9.5, fontWeight: 800,
                        letterSpacing: '0.16em', textTransform: 'uppercase', color: palette.INK2, opacity: 0.75, marginBottom: 2,
                      }}>{m.label}</span>
                      <span style={{ display: 'block', fontFamily: SANS, fontSize: 13.5, fontWeight: 800, color: palette.INK }}>
                        {m.value}
                      </span>
                    </span>
                  </div>
                ))}
              </div>

              <div>
                <a
                  href={KIDS_REGISTER_PATH}
                  onClick={() => trackKids('KIDS_FINAL_CTA')}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 9,
                    padding: '16px 36px', borderRadius: 999,
                    background: palette.PURPLE_STRONG, color: palette.ON_ACCENT,
                    textDecoration: 'none', fontFamily: SANS, fontSize: 15.5, fontWeight: 700,
                    boxShadow: '0 8px 24px rgba(74, 40, 96, 0.4)',
                    transition: 'transform 0.2s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <Heart size={18} fill="currentColor" /> Reserve my child&rsquo;s spot
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div style={{ position: 'relative', zIndex: 2 }}>
        <SiteFooter palette={palette} />
      </div>

      <style>{`
        @media (max-width: 900px) {
          .si-kids-hero, .si-kids-grid-2, .si-kids-grid-3, .si-kids-footer-grid,
          .si-chart-grid { grid-template-columns: 1fr !important; }
          .si-kids-hero { gap: clamp(32px, 6vw, 48px) !important; }
          /* The chart is dense and landscape — flatten the tilt so it can use
             the full column width, and pull the pill back inside the edge. */
          .si-chart-frame { transform: none !important; border-radius: 22px !important; }
          .si-chart-back { display: none !important; }
          .si-chart-pill { top: -12px !important; left: 6px !important; }
          .si-hero-media { margin-top: 8px; }
          .si-hero-frame { transform: none !important; border-radius: 28px !important; }
          .si-hero-back { display: none !important; }
          .si-hero-pill-a { top: -14px !important; left: 6px !important; }
          .si-hero-pill-b { bottom: -16px !important; right: 6px !important; }
          .si-teacher-photo { min-height: 340px !important; }
          .si-cta-photo { transform: none !important; }
        }
        @media (max-width: 520px) {
          .si-hero-glass { gap: 10px !important; padding: 10px 14px !important; font-size: 11.5px !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          article, details, .si-hero-frame, .si-cta-photo, .si-chart-frame { transition: none !important; }
        }
      `}</style>
    </div>
  );
}
