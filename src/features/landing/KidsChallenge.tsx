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
import KidsBackdrop from '../../components/site/KidsBackdrop';
import FeaturedCourse from './components/FeaturedCourse';
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

function SessionScheduleBadge({ palette, isDark }: { palette: Palette, isDark: boolean }) {
  const border = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
  const cardBg = isDark ? 'rgba(255,255,255,0.03)' : '#FFFDF9';

  return (
    <div style={{
      background: cardBg,
      border: `1px solid ${border}`,
      borderRadius: 24,
      padding: '32px 32px 24px',
      fontFamily: SANS,
      color: palette.INK,
      boxShadow: isDark ? '0 12px 30px rgba(0,0,0,0.3)' : '0 12px 30px rgba(60,40,30,0.08)',
      width: '100%',
      maxWidth: 420,
      margin: '0 auto',
      position: 'relative',
      zIndex: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#FF4B72" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        <div>
          <h4 style={{ margin: '0 0 4px', fontSize: 22, fontFamily: SERIF, color: palette.INK, fontWeight: 500, letterSpacing: '0.02em' }}>Session Schedule</h4>
          <p style={{ margin: 0, fontSize: 13, color: palette.INK2, fontWeight: 700 }}>Every Friday · Saturday · Sunday</p>
        </div>
      </div>
      
      <div style={{
        background: '#5C5466',
        color: '#FFFFFF',
        borderRadius: 999,
        padding: '10px 16px',
        textAlign: 'center',
        fontWeight: 800,
        fontSize: 18,
        letterSpacing: '0.02em',
        marginBottom: 24,
      }}>
        4:00 PM UK Time
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 14, fontWeight: 700, color: palette.PURPLE_STRONG }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span><span style={{ fontSize: 10, textTransform: 'uppercase', marginRight: 6, fontWeight: 800, color: palette.INK2 }}>in</span> India (IST)</span>
          <span>8:30 PM</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span><span style={{ fontSize: 10, textTransform: 'uppercase', marginRight: 6, fontWeight: 800, color: palette.INK2 }}>us</span> USA – New York (ET)</span>
          <span>11:00 AM</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span><span style={{ fontSize: 10, textTransform: 'uppercase', marginRight: 6, fontWeight: 800, color: palette.INK2 }}>us</span> USA – Chicago (CT)</span>
          <span>10:00 AM</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span><span style={{ fontSize: 10, textTransform: 'uppercase', marginRight: 6, fontWeight: 800, color: palette.INK2 }}>us</span> USA – Denver (MT)</span>
          <span>9:00 AM</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span><span style={{ fontSize: 10, textTransform: 'uppercase', marginRight: 6, fontWeight: 800, color: palette.INK2 }}>us</span> USA – Los Angeles (PT)</span>
          <span>8:00 AM</span>
        </div>
      </div>

      <p style={{ margin: '24px 0 0', fontSize: 11, textAlign: 'center', color: palette.INK2, opacity: 0.8, lineHeight: 1.5, fontWeight: 500 }}>
        *Time may change with Daylight Saving.<br/>
        Please check your local time at registration.
      </p>
    </div>
  );
}

export default function KidsChallenge() {
  const { palette, toggle: toggleTheme } = useSiteTheme();
  const isDark = palette.isDark;

  usePageSeo({
    title: "Tiny Kids Transformations — 3-Day Live Challenge (Ages 3–12)",
    description:
      'A playful 3-day live online challenge helping children ages 3–12 notice their feelings, understand their choices and grow a little every day. Friday to Sunday on Zoom, 30–40 minutes a day.',
    url: 'https://www.skrmblissai.in/tiny-kids-transformations',
    image: 'https://firebasestorage.googleapis.com/v0/b/awakened-path-2026.firebasestorage.app/o/Marketting%2Fposter.png?alt=media',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Course',
        name: KIDS_TITLE,
        description: KIDS_BLURB,
        url: 'https://www.skrmblissai.in/tiny-kids-transformations',
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
          location: { '@type': 'VirtualLocation', url: 'https://www.skrmblissai.in/tiny-kids-transformations' },
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: KIDS_FAQ.map(faq => ({
          '@type': 'Question',
          name: faq.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.a,
          }
        }))
      }
    ],
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
      <KidsBackdrop />

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
                label: 'Feelings & Emotions',
                sub: '7-Episode Guided Course',
                href: '/feelingsandemotioncourse',
              },
              {
                label: 'Power of Now',
                sub: 'Coming Soon',
                href: '#',
              },
              {
                label: 'Wisdom Untethered',
                sub: 'Coming Soon',
                href: '#',
              },
              {
                label: 'For Kids',
                sub: 'Let’s Be Our Best Every Day! (3-Day Challenge)',
                badge: 'NEW',
                href: '/tiny-kids-transformations',
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

            {/* Session Schedule Badge placed stylisly within text section */}
            <div style={{
              marginTop: 48,
              transform: 'rotate(-2.5deg)',
              transformOrigin: 'top left',
              transition: 'transform 0.4s cubic-bezier(0.2,0.8,0.2,1)',
              cursor: 'default',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'rotate(0deg) scale(1.02)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'rotate(-2.5deg)'; }}
            >
              <SessionScheduleBadge palette={palette} isDark={isDark} />
            </div>
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
                src="https://firebasestorage.googleapis.com/v0/b/awakened-path-2026.firebasestorage.app/o/Marketting%2FPosterDairy.png?alt=media"
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

        <div className="si-kids-grid-4" style={{ 
          maxWidth: 1240, margin: '0 auto', 
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 
        }}>
          {KIDS_DAYS.map((d) => {
            const themeColor = d.theme === 'pink' ? '#FF4B72' : d.theme === 'blue' ? '#2563EB' : '#16A34A';
            return (
              <article key={d.day} style={{
                background: cardBg, border: `1px solid ${border}`, borderRadius: 28,
                padding: '24px 20px',
                position: 'relative', overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'default',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = isDark ? '0 16px 40px rgba(0,0,0,0.3)' : '0 16px 40px rgba(60,40,30,0.12)';
                e.currentTarget.style.borderColor = themeColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = border;
              }}
              >
                <div style={{
                  background: themeColor, color: '#FFF',
                  padding: '4px 16px', borderRadius: 999,
                  fontFamily: SANS, fontSize: 11, fontWeight: 800, letterSpacing: '0.05em',
                  margin: '0 auto 16px', display: 'table',
                }}>
                  {d.day}
                </div>
                
                <h3 style={{
                  fontFamily: SERIF, fontSize: 24, fontWeight: 700, color: palette.PURPLE_STRONG, margin: '0 0 16px', lineHeight: 1.2,
                  display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center'
                }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={themeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                  {d.title}
                </h3>

                <ul style={{ paddingLeft: 24, margin: '0 0 20px', fontFamily: SANS, fontSize: 14, color: palette.INK2, lineHeight: 1.6, fontWeight: 500 }}>
                  {d.bullets.map((b, idx) => <li key={idx} style={{ marginBottom: 6 }}>{b}</li>)}
                </ul>

                <p style={{
                  fontFamily: SANS, fontSize: 13, lineHeight: 1.5, color: themeColor,
                  fontWeight: 600, margin: 0,
                }}>
                  Take-home practice:<br/>
                  {d.practice}
                </p>
              </article>
            );
          })}

          {/* 4th Card: Every Child Receives */}
          <article style={{
            background: isDark ? 'rgba(83,74,183,0.1)' : '#F9F5FF', border: `1px solid ${palette.PURPLE_STRONG}`, borderRadius: 28,
            padding: '24px 20px',
            position: 'relative', overflow: 'hidden',
          }}>
            <h3 style={{
              fontFamily: SERIF, fontSize: 24, fontWeight: 700, color: palette.PURPLE_STRONG, margin: '0 0 16px', lineHeight: 1.2,
              display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center'
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={palette.PURPLE_STRONG} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="8" width="18" height="14" rx="2"/><path d="M12 5v17"/><path d="M19 8A5 5 0 0 0 12 5a5 5 0 0 0-7 3"/></svg>
              Every Child<br/>Receives
            </h3>

            <ul style={{ padding: 0, margin: '0 0 16px', listStyle: 'none' }}>
              {KIDS_INCLUDES.map((item, i) => (
                <li key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  fontFamily: SANS, fontSize: 14, color: palette.PURPLE_STRONG, fontWeight: 600, lineHeight: 1.4,
                  marginBottom: 12
                }}>
                  <div style={{ flexShrink: 0, marginTop: 2 }}><Check color="#FF4B72" /></div>
                  {item}
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      {/* ═══ The daily journal — the thing the weekend is built around ══════
          Placed straight after the three days on purpose: the sessions are
          what a family attends, but the journal is what they keep, so it
          earns a full band of its own rather than a thumbnail further down. */}
      <section
        id="journal"
        className="si-reveal si-journal-band"
        style={{
          position: 'relative', zIndex: 2,
          padding: 'clamp(56px, 8vw, 92px) clamp(24px, 6vw, 96px)',
          background: palette.BAND, color: palette.ON_BAND,
        }}
      >
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div className="si-journal-grid" style={{
            display: 'grid', gridTemplateColumns: '1.15fr 0.85fr',
            gap: 'clamp(32px, 4.5vw, 60px)', alignItems: 'center',
          }}>
            {/* ── The journal itself ── */}
            <div className="si-journal-media" style={{ position: 'relative' }}>
              <div aria-hidden="true" className="si-journal-back" style={{
                position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
                transform: 'rotate(-2.4deg) translate(-12px, 12px)',
                borderRadius: 26, background: 'rgba(255,255,255,0.5)',
                border: `1px solid ${palette.BAND_BORDER}`,
              }} />

              <div className="si-journal-frame" style={{
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
                  alt="The Let's Be Our Best Every Day! daily journal — seven daily practices tracked across a full month, with a Look Back &amp; Learn reflection panel"
                  loading="lazy"
                  style={{ width: '100%', display: 'block' }}
                  onError={(e) => { (e.currentTarget.parentElement as HTMLElement).style.display = 'none'; }}
                />
                <div aria-hidden="true" style={{
                  position: 'absolute', inset: 0, pointerEvents: 'none',
                  background: 'linear-gradient(118deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 42%)',
                }} />
              </div>

              <div className="si-journal-pill" style={{
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
                The weekend ends.<br />The journal keeps going.
              </h2>

              <p style={{
                fontFamily: SANS, fontSize: 15.5, lineHeight: 1.7,
                color: palette.ON_BAND_SOFT, margin: '0 0 24px', maxWidth: 460,
              }}>
                Three live sessions teach your child the practice. This daily journal is
                what carries it into everyday life — a full month of small, tickable
                choices they fill in themselves, then look back on together at the end.
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

              <Cta palette={palette} label="Reserve my child's place" event="KIDS_JOURNAL_CTA" />
            </div>
          </div>

          {/* ── Look Back & Learn — the monthly reflection built into the journal ── */}
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
              At the end of each month the journal turns into a conversation. Four questions,
              answered together:
            </p>

            <div className="si-journal-qs" style={{
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

      {/* ═══ Adult Course Cross-Sell ════════════════════════════════════════ */}
      <FeaturedCourse 
        palette={palette}
        kicker="For Parents · Adult Course"
        description="Looking to deepen your own emotional transformation? Explore our separate 7-episode guided video series for adults to quiet overthinking, release blockages, and live in deep presence."
        source="kids_page"
      />

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
          .si-journal-grid { grid-template-columns: 1fr !important; }
          .si-kids-hero { gap: clamp(32px, 6vw, 48px) !important; }
          /* The journal is dense and landscape — flatten the tilt so it can use
             the full column width, and pull the pill back inside the edge. */
          .si-journal-frame { transform: none !important; border-radius: 22px !important; }
          .si-journal-back { display: none !important; }
          .si-journal-pill { top: -12px !important; left: 6px !important; }
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
          article, details, .si-hero-frame, .si-cta-photo, .si-journal-frame { transition: none !important; }
        }
      `}</style>
    </div>
  );
}
