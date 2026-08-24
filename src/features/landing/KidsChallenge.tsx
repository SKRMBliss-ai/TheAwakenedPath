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
      <header style={{ position: 'relative', zIndex: 2, padding: 'clamp(48px, 7vw, 88px) clamp(24px, 6vw, 96px) clamp(32px, 5vw, 56px)', overflow: 'hidden' }}>
        <div className="si-kids-hero" style={{
          maxWidth: 1100, margin: '0 auto',
          display: 'grid', gridTemplateColumns: '1.3fr 0.7fr', gap: 'clamp(20px, 3vw, 40px)', alignItems: 'center',
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

          {/* Notice · Choose · Grow poster — floating with shadow */}
          <div style={{
            borderRadius: 32,
            overflow: 'hidden',
            border: `1px solid ${palette.BAND_BORDER}`,
            background: palette.BAND,
            display: 'flex',
            boxShadow: isDark ? '0 16px 48px rgba(0,0,0,0.4)' : '0 16px 48px rgba(60,40,30,0.12)',
            transform: 'translateX(-16px)',
            zIndex: 1,
          }}>
            <img
              src={KIDS_POSTER_IMG}
              alt="Notice. Choose. Grow. Three days. Three questions."
              loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
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

      <div style={{ padding: '0 24px', position: 'relative', zIndex: 2 }}><div className="si-divider" /></div>

      {/* ═══ Who it is for + what families receive ══════════════════════════ */}
      <section id="who" className="si-reveal" style={{ position: 'relative', zIndex: 2, padding: 'clamp(56px, 8vw, 88px) clamp(24px, 6vw, 96px)' }}>
        <div className="si-kids-grid-2" style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 28, alignItems: 'start' }}>
          <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 28, padding: 'clamp(32px, 4vw, 44px)' }}>
            <h2 style={{ fontFamily: SERIF, fontSize: 32, fontWeight: 400, color: palette.INK, margin: '0 0 24px' }}>
              Who is it for?
            </h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 20 }}>
              {KIDS_AGE_BANDS.map((a) => (
                <li key={a.band} style={{ paddingBottom: 16, borderBottom: `1px solid ${border}`, opacity: 0.9 }}>
                  <p style={{ fontFamily: SANS, fontSize: 14, fontWeight: 900, color: palette.BROWN, margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{a.band}</p>
                  <p style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.7, color: palette.INK2, margin: 0 }}>{a.detail}</p>
                </li>
              ))}
            </ul>
          </div>

          <div style={{
            background: isDark ? 'linear-gradient(135deg, rgba(83,74,183,0.12) 0%, rgba(201,174,142,0.08) 100%)' : 'linear-gradient(135deg, rgba(83,74,183,0.08) 0%, rgba(201,174,142,0.05) 100%)',
            border: `1.5px solid ${palette.PURPLE_STRONG}`, borderRadius: 28, padding: 'clamp(32px, 4vw, 44px)',
            position: 'relative', overflow: 'hidden',
          }}>
            <span style={{
              position: 'absolute', top: 16, right: 16,
              background: palette.PURPLE_STRONG, color: palette.ON_ACCENT,
              padding: '6px 14px', borderRadius: 999,
              fontFamily: SANS, fontSize: 10, fontWeight: 800, letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}>✓ Included</span>

            <h2 style={{ fontFamily: SERIF, fontSize: 32, fontWeight: 400, color: palette.INK, margin: '0 0 24px', paddingTop: 12 }}>
              What families receive
            </h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 14 }}>
              {KIDS_INCLUDES.map((f) => (
                <li key={f} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', fontFamily: SANS, fontSize: 15, lineHeight: 1.7, color: palette.INK2 }}>
                  <span style={{ flexShrink: 0, marginTop: 2, color: palette.PURPLE_STRONG }}><Check color={palette.PURPLE_STRONG} /></span>
                  {f}
                </li>
              ))}
            </ul>
            <div style={{ marginTop: 28, borderRadius: 20, overflow: 'hidden', border: `1px solid ${palette.PURPLE_STRONG}`, boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.2)' : '0 8px 24px rgba(83,74,183,0.08)' }}>
              <img
                src={KIDS_CHART_IMG}
                alt="The Let's Be Our Best Every Day! activity chart"
                loading="lazy"
                style={{ width: '100%', display: 'block' }}
                onError={(e) => { (e.currentTarget.parentElement as HTMLElement).style.display = 'none'; }}
              />
            </div>
          </div>
        </div>
      </section>

      <div style={{ padding: '0 24px', position: 'relative', zIndex: 2 }}><div className="si-divider" /></div>

      {/* ═══ Know Your Teacher ══════════════════════════════════════════════ */}
      <section className="si-reveal" style={{ position: 'relative', zIndex: 2, padding: 'clamp(56px, 8vw, 88px) clamp(24px, 6vw, 96px)' }}>
        {sectionTitle('A mother’s journey · A global mission', 'Know Your Teacher', 'Because this journey began with one mother wanting to help her own child.')}

        <div className="si-kids-grid-2" style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: '0.95fr 1.05fr', gap: 32, alignItems: 'center', position: 'relative' }}>
          <div style={{
            borderRadius: 32, overflow: 'hidden', border: `1px solid ${border}`, minHeight: 360,
            boxShadow: isDark ? '0 16px 48px rgba(0,0,0,0.3)' : '0 16px 48px rgba(60,40,30,0.12)',
            position: 'relative', zIndex: 1,
          }}>
            <img
              src={KIDS_TEACHER_IMG}
              alt="A mother and her young son sharing a learning moment together"
              loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              onError={(e) => {
                (e.currentTarget.parentElement as HTMLElement).style.background =
                  'linear-gradient(135deg, #2A1E40 0%, #4A2860 50%, #C4913A 150%)';
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>

          <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 28, padding: 'clamp(32px, 4vw, 44px)', position: 'relative', zIndex: 2 }}>
            <p style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.7, color: palette.INK2, margin: '0 0 14px' }}>
              I&rsquo;m a mom on a journey of helping my 5-year-old understand his feelings, make thoughtful choices and grow into a kind, confident and mindful human being.
            </p>
            <p style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.7, color: palette.INK2, margin: '0 0 14px' }}>
              As I learned what helped my own child, I realised how valuable these simple everyday tools could be for other families too — so I want to share them with children around the world, in a way that feels playful, practical and easy for families to bring into everyday life.
            </p>

            <div style={{ display: 'grid', gap: 14, margin: '20px 0' }}>
              {KIDS_TEACHER_POINTS.map((p) => (
                <div key={p.title} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 22, flexShrink: 0, lineHeight: 1 }}>{p.icon}</span>
                  <span>
                    <strong style={{ fontFamily: SANS, fontSize: 14, color: palette.INK }}>{p.title}</strong>
                    <span style={{ display: 'block', fontFamily: SANS, fontSize: 13.5, color: palette.INK2, lineHeight: 1.5 }}>{p.body}</span>
                  </span>
                </div>
              ))}
            </div>

            <div style={{
              background: palette.PURPLE_STRONG, color: palette.ON_ACCENT,
              borderRadius: 16, padding: '16px 20px',
              fontFamily: SERIF, fontStyle: 'italic', fontSize: 15.5, lineHeight: 1.55,
            }}>
              &ldquo;{KIDS_TEACHER_QUOTE}&rdquo;
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
            gridTemplateColumns: '0.95fr 1.05fr',
            gap: 'clamp(32px, 5vw, 48px)',
            alignItems: 'center',
            position: 'relative', zIndex: 1,
          }}>
            {/* Poster image column */}
            <div style={{
              borderRadius: 36,
              overflow: 'hidden',
              border: `1.5px solid ${palette.BAND_BORDER}`,
              boxShadow: isDark ? '0 16px 48px rgba(0,0,0,0.3)' : '0 16px 48px rgba(60,40,30,0.12)',
            }}>
              <img
                src={KIDS_POSTER_IMG}
                alt="Let's Be Our Best Every Day! Poster"
                loading="lazy"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
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
                display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center',
                background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.65)',
                padding: '16px 20px', borderRadius: 20, marginBottom: 28,
                border: `1px solid ${border}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: SANS, fontSize: 12.5, fontWeight: 600, color: palette.INK2 }}>
                  <Calendar size={18} color={palette.PURPLE_STRONG} /> Every Friday–Sunday
                </div>
                <div style={{ width: 1, height: 16, background: border }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: SANS, fontSize: 12.5, fontWeight: 600, color: palette.INK2 }}>
                  <Clock size={18} color={palette.PURPLE_STRONG} /> 30–40 Mins
                </div>
                <div style={{ width: 1, height: 16, background: border }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: SANS, fontSize: 12.5, fontWeight: 600, color: palette.INK2 }}>
                  <MapPin size={18} color={palette.PURPLE_STRONG} /> {KIDS_TIME}
                </div>
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
          .si-kids-hero, .si-kids-grid-2, .si-kids-grid-3, .si-kids-footer-grid { grid-template-columns: 1fr !important; }
          .si-kids-hero { gap: clamp(20px, 3vw, 32px) !important; }
          .si-kids-hero > div:last-child { transform: translateX(0) !important; margin-top: 1rem; }
        }
        @media (prefers-reduced-motion: reduce) {
          article { transition: none !important; }
          details { transition: none !important; }
        }
      `}</style>
    </div>
  );
}
