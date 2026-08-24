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
import { usePageSeo } from '../../lib/seo';
import { useSiteTheme, type Palette } from '../../lib/siteTheme';
import { SiteHeader, SiteFooter } from '../../components/site/SiteChrome';
import SiteBackdrop from '../../components/site/SiteBackdrop';
import {
  KIDS_REGISTER_PATH, KIDS_TITLE, KIDS_TAGLINE, KIDS_AGES, KIDS_FORMAT, KIDS_TIME,
  KIDS_BLURB, KIDS_DAYS, KIDS_AGE_BANDS, KIDS_INCLUDES, KIDS_STEPS, KIDS_FAQ,
  KIDS_CHART_IMG, KIDS_TEACHER_IMG, KIDS_TEACHER_POINTS, KIDS_TEACHER_QUOTE,
  trackKids,
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
          { label: 'Adult course', href: '/feelingsandemotioncourse', secondary: true },
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
      <header style={{ position: 'relative', zIndex: 2, padding: 'clamp(48px, 7vw, 88px) clamp(24px, 6vw, 96px) clamp(32px, 5vw, 56px)' }}>
        <div className="si-kids-hero" style={{
          maxWidth: 1100, margin: '0 auto',
          display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 'clamp(28px, 4vw, 56px)', alignItems: 'center',
        }}>
          <div>
            <span style={{
              display: 'inline-block', padding: '6px 14px', borderRadius: 999,
              background: isDark ? 'rgba(201,174,142,0.14)' : 'rgba(122,95,68,0.10)',
              border: `1px solid ${border}`,
              fontFamily: SANS, fontSize: 10, fontWeight: 800, letterSpacing: '0.2em',
              textTransform: 'uppercase', color: palette.BROWN, marginBottom: 22,
            }}>
              3-Day Kids Challenge
            </span>

            <h1 style={{
              fontFamily: SERIF, fontSize: 'clamp(40px, 6vw, 68px)', fontWeight: 400,
              lineHeight: 1.05, letterSpacing: '-0.015em', color: palette.INK, margin: '0 0 16px',
            }}>
              Let&rsquo;s Be Our <span style={{ color: palette.BROWN }}>Best</span> Every Day!
            </h1>

            <p style={{
              fontFamily: SERIF, fontSize: 'clamp(19px, 2.4vw, 25px)', fontStyle: 'italic',
              color: palette.INK2, margin: '0 0 20px',
            }}>
              {KIDS_TAGLINE}
            </p>

            <p style={{ fontFamily: SANS, fontSize: 16.5, lineHeight: 1.7, color: palette.INK2, maxWidth: 560, margin: '0 0 28px' }}>
              {KIDS_BLURB}
            </p>

            <Cta palette={palette} label="Reserve my child's place" event="KIDS_HERO_CTA" />

            <p style={{ fontFamily: SANS, fontSize: 12.5, color: palette.INK2, opacity: 0.8, marginTop: 14 }}>
              Parent or guardian registration required. Sessions run live on Zoom.
            </p>
          </div>

          {/* Notice · Choose · Grow card */}
          <div style={{
            background: palette.BAND, borderRadius: 28,
            padding: 'clamp(32px, 4vw, 48px)', textAlign: 'center',
            border: `1px solid ${palette.BAND_BORDER}`,
          }}>
            <div style={{ fontSize: 40, lineHeight: 1, marginBottom: 18 }} aria-hidden="true">♡</div>
            <p style={{
              fontFamily: SERIF, fontSize: 'clamp(26px, 3.4vw, 38px)', fontWeight: 400,
              lineHeight: 1.3, color: palette.ON_BAND, margin: 0,
            }}>
              Notice.<br />Choose.<br />Grow.
            </p>
            <p style={{
              fontFamily: SANS, fontSize: 12, fontWeight: 700, letterSpacing: '0.16em',
              textTransform: 'uppercase', color: palette.ON_BAND_ACCENT, marginTop: 20,
            }}>
              Three days · Three questions
            </p>
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

        <div className="si-kids-grid-3" style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
          {KIDS_DAYS.map((d, i) => (
            <article key={d.day} style={{
              background: cardBg, border: `1px solid ${border}`, borderRadius: 24,
              padding: 'clamp(24px, 3vw, 32px)',
            }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 34, height: 34, borderRadius: 999, marginBottom: 16,
                background: isDark ? 'rgba(191,176,189,0.16)' : 'rgba(105,94,104,0.10)',
                fontFamily: SANS, fontSize: 13, fontWeight: 800, color: palette.PURPLE_STRONG,
              }}>{i + 1}</span>

              <p style={{
                fontFamily: SANS, fontSize: 10.5, fontWeight: 800, letterSpacing: '0.2em',
                textTransform: 'uppercase', color: palette.BROWN, margin: '0 0 8px',
              }}>{d.day}</p>

              <h3 style={{
                fontFamily: SERIF, fontSize: 26, fontWeight: 400, color: palette.INK, margin: '0 0 12px',
              }}>{d.title}</h3>

              <p style={{ fontFamily: SANS, fontSize: 14.5, lineHeight: 1.65, color: palette.INK2, margin: '0 0 16px' }}>
                {d.body}
              </p>

              <p style={{
                fontFamily: SANS, fontSize: 12, lineHeight: 1.6, color: palette.INK2,
                opacity: 0.8, margin: 0, paddingTop: 14, borderTop: `1px solid ${border}`,
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
        <div className="si-kids-grid-2" style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 24, padding: 'clamp(28px, 3.5vw, 40px)' }}>
            <h2 style={{ fontFamily: SERIF, fontSize: 30, fontWeight: 400, color: palette.INK, margin: '0 0 20px' }}>
              Who is it for?
            </h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 16 }}>
              {KIDS_AGE_BANDS.map((a) => (
                <li key={a.band}>
                  <p style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 800, color: palette.BROWN, margin: '0 0 3px' }}>{a.band}</p>
                  <p style={{ fontFamily: SANS, fontSize: 14.5, lineHeight: 1.6, color: palette.INK2, margin: 0 }}>{a.detail}</p>
                </li>
              ))}
            </ul>
          </div>

          <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 24, padding: 'clamp(28px, 3.5vw, 40px)' }}>
            <h2 style={{ fontFamily: SERIF, fontSize: 30, fontWeight: 400, color: palette.INK, margin: '0 0 20px' }}>
              What families receive
            </h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 12 }}>
              {KIDS_INCLUDES.map((f) => (
                <li key={f} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontFamily: SANS, fontSize: 14.5, lineHeight: 1.6, color: palette.INK2 }}>
                  <span style={{ flexShrink: 0, marginTop: 3 }}><Check color={palette.BROWN} /></span>
                  {f}
                </li>
              ))}
            </ul>
            <div style={{ marginTop: 22, borderRadius: 16, overflow: 'hidden', border: `1px solid ${border}` }}>
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

        <div className="si-kids-grid-2" style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: '0.85fr 1.15fr', gap: 24, alignItems: 'stretch' }}>
          <div style={{ borderRadius: 24, overflow: 'hidden', border: `1px solid ${border}`, minHeight: 320 }}>
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

          <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 24, padding: 'clamp(26px, 3.5vw, 38px)' }}>
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

        <div style={{ maxWidth: 800, margin: '0 auto', display: 'grid', gap: 12 }}>
          {KIDS_FAQ.map((f) => (
            <details key={f.q} style={{
              background: cardBg, border: `1px solid ${border}`, borderRadius: 16, padding: '18px 22px',
            }}>
              <summary style={{
                fontFamily: SANS, fontSize: 15, fontWeight: 700, color: palette.INK, cursor: 'pointer',
              }}>{f.q}</summary>
              <p style={{ fontFamily: SANS, fontSize: 14.5, lineHeight: 1.7, color: palette.INK2, margin: '12px 0 0' }}>
                {f.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* ═══ Final CTA ══════════════════════════════════════════════════════ */}
      <section className="si-reveal" style={{
        position: 'relative', zIndex: 2, textAlign: 'center',
        padding: 'clamp(64px, 9vw, 110px) clamp(24px, 6vw, 96px)',
        background: palette.BAND, color: palette.ON_BAND,
      }}>
        <h2 style={{
          fontFamily: SERIF, fontSize: 'clamp(30px, 4.4vw, 48px)', fontWeight: 400,
          lineHeight: 1.15, color: palette.ON_BAND, margin: '0 auto 22px', maxWidth: 760,
        }}>
          Give your child three little days to discover something powerful.
        </h2>

        <p style={{
          fontFamily: SERIF, fontSize: 'clamp(19px, 2.4vw, 26px)', fontStyle: 'italic',
          lineHeight: 1.6, color: palette.ON_BAND, margin: '0 auto 32px', maxWidth: 560,
        }}>
          I can notice what I feel.<br />
          I can choose what I do.<br />
          I can grow a little every day.
        </p>

        <a
          href={KIDS_REGISTER_PATH}
          onClick={() => trackKids('KIDS_FINAL_CTA')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 9,
            padding: '16px 34px', borderRadius: 999,
            background: palette.ON_BAND, color: palette.BAND,
            textDecoration: 'none', fontFamily: SANS, fontSize: 15.5, fontWeight: 700,
          }}
        >
          Register my child <Arrow />
        </a>

        <p style={{ fontFamily: SANS, fontSize: 12.5, color: palette.ON_BAND_SOFT, marginTop: 16 }}>
          {KIDS_FORMAT} · {KIDS_TIME}
        </p>
      </section>

      <div style={{ position: 'relative', zIndex: 2 }}>
        <SiteFooter palette={palette} />
      </div>

      <style>{`
        @media (max-width: 900px) {
          .si-kids-hero, .si-kids-grid-2, .si-kids-grid-3 { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
