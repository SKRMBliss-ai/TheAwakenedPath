import { useState } from 'react';
import { usePageSeo } from '../../lib/seo';
import { useSiteTheme } from '../../lib/siteTheme';
import { SiteHeader, SiteFooter } from '../../components/site/SiteChrome';
import SiteBackdrop from '../../components/site/SiteBackdrop';

// ─────────────────────────────────────────────────────────────────────────────
// About Us — /about-us
//
// The trust page. Every claim here is checkable: real employers, real years,
// real books, real names. What it deliberately avoids is the unverifiable
// statistic ("10,000 lives changed") — on a page whose entire job is
// credibility, one number a visitor can't confirm discounts everything beside
// it.
//
// The coin motif carries over from /twinsouls, which stays as the deep dive.
// Each founder's coin opens that world rather than duplicating it here.
// ─────────────────────────────────────────────────────────────────────────────

const SERIF = "'Cormorant Garamond', Georgia, serif";
const SANS = "'Outfit', system-ui, -apple-system, sans-serif";
const GOLD = '#C4913A';
const PLUM = '#4A3260';

const TWINSOULS_URL = '/twinsouls/';

interface Founder {
  key: 'shruti' | 'sim';
  name: string;
  full: string;
  photo: string;
  role: string;
  discipline: string[];
  /** Checkable facts. This is the authority — not adjectives. */
  proof: { label: string; detail: string }[];
  story: string[];
  pull: string;
}

const FOUNDERS: Founder[] = [
  {
    key: 'shruti',
    name: 'Shruti',
    full: 'Shruti Khungar',
    photo: '/marketing/shruti.webp',
    role: 'Product Builder & Designer',
    discipline: ['Product Builder', 'Systems & Automation', 'App & Web Engineering', 'Creative Production'],
    proof: [
      { label: '20+ years', detail: 'Enterprise product engineering & design' },
      { label: 'Fortune 500', detail: 'Global technology strategy & enterprise architecture' },
      { label: 'Fortune 100', detail: 'Digital transformation for enterprise clients' },
    ],
    story: [
      'Twenty years inside enterprise software at Fortune 500 companies — architecture, global technology strategy, digital transformation. The kind of work measured in systems, migrations and scale.',
      'She now spends it on something much smaller and far more personal: an app that helps one person understand themselves. Same engineering discipline, pointed somewhere that matters more.',
    ],
    pull: 'If a practice can’t survive contact with a real, distracted, busy life, it isn’t finished.',
  },
  {
    key: 'sim',
    name: 'Sim',
    full: 'Sim Katyal',
    photo: '/marketing/sim.webp',
    role: 'Presence, Healing & Transformation',
    discipline: ['Presence', 'Emotional Healing', 'Somatic Practice', 'Transformation'],
    proof: [
      { label: 'India → UK', detail: 'A marriage that carried her across oceans' },
      { label: 'Autoimmune illness', detail: 'The body saying what words could not' },
      { label: 'Recurrent loss', detail: 'Including one that was life-threatening' },
      { label: 'The turning', detail: 'Wayne Dyer, and every teacher after him' },
    ],
    story: [
      'Sensitive to other people’s feelings from childhood, Sim moved from India to the UK after marriage. What followed were the hardest years of her life: autoimmune illness, unexplained fertility struggles, and repeated loss — one of them nearly fatal.',
      'She found Wayne Dyer in the middle of it, and something turned. What began as a search for her own healing became a decade of study and practice — Tolle, Singer, Hay, Hawkins — every teaching tested against her own experience before it was ever taught to anyone else.',
    ],
    pull: 'Her pain was not a wound to be hidden. It was a doorway — not a destination.',
  },
];

/** Named, checkable and specific — the opposite of "certified practitioner". */
const LINEAGE = [
  'Wayne Dyer', 'Eckhart Tolle', 'Michael A. Singer', 'Louise Hay',
  'David R. Hawkins', 'Neville Goddard', 'Robert Schwartz', 'Linda Howe',
  'Gabrielle Bernstein', 'Sister Shivani', 'James Clear', 'David Goggins',
];

const PROMISE = [
  { title: 'Nothing here is theory', body: 'Every practice was lived through before it was taught. If it did not work in the worst year of her life, it did not make it in.' },
  { title: 'Pay what it is worth to you', body: 'Our courses are pay-what-you-feel with a real floor, not a fake discount. If money is the obstacle, it should not be the obstacle.' },
  { title: 'We name our sources', body: 'The teachers named on this page did the original work. We point you to them rather than dressing their ideas up as our own.' },
  { title: 'Leave whenever you want', body: 'No lock-in, no auto-renewing trap, and a 14-day refund on anything paid — asked for by email, granted without an interrogation.' },
];

export default function AboutUs() {
  const { palette, toggle: toggleTheme } = useSiteTheme();
  const isDark = palette.isDark;
  const [flipped, setFlipped] = useState<Founder['key'] | null>(null);

  usePageSeo({
    title: 'About Us — Shruti Khungar & Sim Katyal | Soulful Intelligence Studio',
    description:
      'The twin sisters behind Soulful Intelligence Studio and Mind Gym: twenty years of enterprise product engineering, and a lived journey through illness, loss and emotional recovery.',
    url: 'https://www.skrmblissai.in/about-us',
  });

  const ink = isDark ? '#EDE9E3' : '#2A2118';
  const inkSub = isDark ? 'rgba(237,233,227,0.62)' : '#6B5744';
  const pageBg = isDark ? '#0D0A12' : '#F9F5EF';
  const cardBg = isDark ? 'rgba(255,255,255,0.035)' : '#FFFFFF';
  const borderC = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(196,181,160,0.42)';
  const accent = isDark ? GOLD : PLUM;

  const eyebrow: React.CSSProperties = {
    fontFamily: SANS, fontSize: 10.5, fontWeight: 800, letterSpacing: '0.22em',
    textTransform: 'uppercase', color: accent, margin: 0,
  };
  const h2: React.CSSProperties = {
    fontFamily: SERIF, fontSize: 'clamp(29px, 3.8vw, 44px)', fontWeight: 400,
    lineHeight: 1.15, color: ink, margin: '14px 0 0', letterSpacing: '-0.01em',
  };
  const body: React.CSSProperties = {
    fontFamily: SANS, fontSize: 15, lineHeight: 1.75, color: inkSub, margin: 0,
  };
  const shell: React.CSSProperties = {
    maxWidth: 1060, margin: '0 auto', padding: '0 clamp(20px, 5vw, 48px)',
  };
  const sectionPad = 'clamp(56px, 8vw, 96px)';

  return (
    <div style={{ background: pageBg, color: ink, fontFamily: SANS, minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>
      <SiteBackdrop />

      <style>{`
        .au-coin-shell { perspective: 1200px; }
        .au-flip { transform-style: preserve-3d; transition: transform .8s cubic-bezier(.4,.15,.2,1); }
        .au-flip.is-flipped { transform: rotateY(180deg); }
        .au-face { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
        .au-face-back { transform: rotateY(180deg); }
        .au-coin-shell:hover .au-hint { color: ${accent}; }
        .au-coin-shell:focus-visible { outline: 2px solid ${accent}; outline-offset: 6px; border-radius: 50%; }
        .au-cta { transition: filter .2s, transform .2s; }
        .au-cta:hover { filter: brightness(1.07); transform: translateY(-1px); }
        /* Same purple as the coin's active border, pulsing outward — draws
           the eye to "go deeper" without needing a hover first. */
        @keyframes au-world-pulse {
          0%, 100% { box-shadow: 0 0 0 0 ${PLUM}66; }
          50%      { box-shadow: 0 0 0 6px ${PLUM}00; }
        }
        .au-world-link {
          border: 1.5px solid ${PLUM} !important;
          animation: au-world-pulse 2.6s ease-in-out infinite;
        }
        .au-world-link:hover { filter: brightness(1.1); animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) {
          .au-world-link { animation: none; }
        }
        /* Founder rows alternate sides on desktop; on narrow screens they all
           stack portrait-first so the reading order never inverts. */
        @media (min-width: 640px) {
          .au-promise { grid-template-columns: 1fr 1fr; }
        }
        @media (min-width: 900px) {
          .au-founder { grid-template-columns: minmax(0,0.85fr) minmax(0,1.15fr); align-items: center; }
          .au-founder.is-reversed .au-portrait { order: 2; }
        }
        @media (prefers-reduced-motion: reduce) {
          .au-flip, .au-cta { transition: none !important; }
        }
      `}</style>

      <div style={{ position: 'relative', zIndex: 50 }}>
        <SiteHeader
          palette={palette}
          onToggleTheme={toggleTheme}
          links={[
            { label: 'Home', href: '/' },
            { label: 'Mind Gym', href: '/mindgym' },
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
            { label: 'Their worlds', href: TWINSOULS_URL, secondary: true },
          ]}
          cta={{ label: 'Enter Mind Gym →', href: '/mindgym' }}
        />
      </div>

      <main style={{ position: 'relative', zIndex: 2 }}>

        {/* ── 1. Opening statement ───────────────────────────────────── */}
        <section style={{ ...shell, paddingTop: 'clamp(48px, 7vw, 84px)', paddingBottom: 'clamp(32px, 5vw, 56px)', textAlign: 'center' }}>
          <p style={eyebrow}>Two sides of the same soul</p>
          <h1 style={{ ...h2, fontSize: 'clamp(36px, 5.6vw, 64px)', maxWidth: 800, margin: '16px auto 0' }}>
            Built by two sisters.
          </h1>
          <p style={{ ...body, fontSize: 16.5, maxWidth: 620, margin: '24px auto 0' }}>
            Soulful Intelligence Studio is run by twin sisters. Both carry decades of
            meditation practice passed down from their parents — a tradition they inherited
            long before they built anything with it. What they have built here is that
            inheritance combined with modern, evidence-based method: understanding feelings,
            emotions and the body as one system, turned into a daily practice anyone can use
            to see their own patterns — and change them.
          </p>

          <img
            src="/marketing/twins-facing.webp"
            alt="Shruti Khungar and Sim Katyal, facing each other"
            style={{
              width: '100%', maxWidth: 760, height: 'auto', display: 'block',
              margin: '36px auto 0',
              WebkitMaskImage: 'linear-gradient(to bottom, black 74%, transparent 99%)',
              maskImage: 'linear-gradient(to bottom, black 74%, transparent 99%)',
            }}
          />
        </section>

        {/* ── 2. Why & how ───────────────────────────────────────────── */}
        <section style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(74,50,96,0.04)', padding: `${sectionPad} 0` }}>
          <div style={{ ...shell, display: 'grid', gap: 'clamp(32px, 5vw, 64px)', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            <div>
              <p style={eyebrow}>Our why</p>
              <h2 style={h2}>Most wellbeing apps are built by people who never needed one.</h2>
              <p style={{ ...body, marginTop: 18 }}>
                They are designed from the outside — features assembled by teams who
                studied the problem rather than lived it. You can feel it. The advice is
                correct and weightless at the same time.
              </p>
              <p style={{ ...body, marginTop: 14 }}>
                We built this the other way round. One of us needed it, badly, for years.
                The other knew how to build software that actually holds up. Nothing here
                was added because it demoed well.
              </p>
            </div>
            <div>
              <p style={eyebrow}>Our craft</p>
              <h2 style={h2}>Ancient practice, engineered properly.</h2>
              <p style={{ ...body, marginTop: 18 }}>
                Presence, breath and somatic release are old. The delivery does not have to
                be. Every practice inside Mind Gym is built with the same rigour Shruti
                brought to enterprise systems: fast, private, and reliable on a bad phone
                and a worse connection.
              </p>
              <p style={{ ...body, marginTop: 14 }}>
                And each one is tested against a harder standard than any spec — whether it
                would have helped Sim on her worst day.
              </p>
            </div>
          </div>
        </section>

        {/* ── 3. The founders ────────────────────────────────────────── */}
        <section style={{ ...shell, padding: `${sectionPad} clamp(20px, 5vw, 48px)` }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(36px, 5vw, 60px)' }}>
            <p style={eyebrow}>Know the founders</p>
            <h2 style={{ ...h2, maxWidth: 620, margin: '14px auto 0' }}>
              Two people, and what each of them actually brings.
            </h2>
          </div>

          <div style={{ display: 'grid', gap: 'clamp(48px, 7vw, 88px)' }}>
            {FOUNDERS.map((f, i) => {
              const isFlipped = flipped === f.key;
              return (
                <article
                  key={f.key}
                  className={`au-founder${i % 2 === 1 ? ' is-reversed' : ''}`}
                  style={{ display: 'grid', gap: 'clamp(24px, 4vw, 48px)' }}
                >
                  {/* Coin portrait */}
                  <div className="au-portrait" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <button
                      type="button"
                      className="au-coin-shell"
                      onClick={() => setFlipped(isFlipped ? null : f.key)}
                      aria-expanded={isFlipped}
                      aria-label={`${f.full}. ${isFlipped ? 'Turn back to the portrait' : 'Turn the coin over for what she does'}.`}
                      style={{
                        width: '100%', maxWidth: 330, aspectRatio: '1', padding: 0,
                        border: 'none', background: 'transparent', cursor: 'pointer',
                      }}
                    >
                      <div className={`au-flip${isFlipped ? ' is-flipped' : ''}`} style={{ position: 'relative', width: '100%', height: '100%' }}>
                        {/* Front */}
                        <div
                          className="au-face"
                          style={{
                            position: 'absolute', inset: 0, borderRadius: '50%', overflow: 'hidden',
                            background: isDark
                              ? 'radial-gradient(circle at 50% 28%, #2A1B3D 0%, #14101B 78%)'
                              : 'radial-gradient(circle at 50% 28%, #FFFFFF 0%, #EFE7DA 82%)',
                            border: `3px solid ${isDark ? 'rgba(196,145,58,0.45)' : 'rgba(74,50,96,0.28)'}`,
                            boxShadow: isDark
                              ? '0 24px 60px -22px rgba(0,0,0,0.75), inset 0 0 46px rgba(0,0,0,0.45)'
                              : '0 24px 60px -22px rgba(74,50,96,0.35), inset 0 0 46px rgba(74,50,96,0.06)',
                            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                          }}
                        >
                          <img
                            src={f.photo}
                            alt=""
                            aria-hidden="true"
                            style={{
                              position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
                              height: '90%', width: 'auto', objectFit: 'contain',
                              opacity: isDark ? 0.62 : 1,
                            }}
                          />
                          <div
                            aria-hidden="true"
                            style={{
                              position: 'absolute', inset: 0,
                              background: isDark
                                ? 'linear-gradient(to top, rgba(20,16,27,0.95) 16%, rgba(20,16,27,0.15) 58%)'
                                : 'linear-gradient(to top, rgba(255,255,255,0.94) 14%, rgba(255,255,255,0) 54%)',
                            }}
                          />
                          <span style={{
                            position: 'relative', paddingBottom: '13%',
                            fontFamily: SERIF, fontSize: 'clamp(25px, 3.2vw, 34px)',
                            letterSpacing: '0.24em', color: ink, textTransform: 'uppercase',
                          }}>
                            {f.name}
                          </span>
                        </div>

                        {/* Back */}
                        <div
                          className="au-face au-face-back"
                          style={{
                            position: 'absolute', inset: 0, borderRadius: '50%',
                            background: isDark ? '#14101B' : '#FFFFFF',
                            border: `3px solid ${accent}`,
                            boxShadow: isDark
                              ? '0 24px 60px -22px rgba(0,0,0,0.75)'
                              : '0 24px 60px -22px rgba(74,50,96,0.35)',
                            display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center',
                            padding: '15%', textAlign: 'center', gap: 9,
                          }}
                        >
                          <span style={{ fontFamily: SANS, fontSize: 9.5, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: accent, marginBottom: 2 }}>
                            {f.full}
                          </span>
                          {f.discipline.map((d) => (
                            <span key={d} style={{ fontFamily: SERIF, fontSize: 'clamp(14px, 1.6vw, 17px)', fontStyle: 'italic', color: ink, lineHeight: 1.3 }}>
                              {d}
                            </span>
                          ))}
                        </div>
                      </div>
                    </button>

                    <span className="au-hint" style={{ fontFamily: SANS, fontSize: 13, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: inkSub, marginTop: 16, transition: 'color .2s' }}>
                      ⇄ Tap the coin
                    </span>
                  </div>

                  {/* Story */}
                  <div>
                    <p style={eyebrow}>{f.role}</p>
                    <h3 style={{ ...h2, fontSize: 'clamp(26px, 3.2vw, 36px)' }}>{f.full}</h3>

                    {f.story.map((para) => (
                      <p key={para.slice(0, 40)} style={{ ...body, marginTop: 16 }}>{para}</p>
                    ))}

                    <p style={{
                      fontFamily: SERIF, fontSize: 18, fontStyle: 'italic', color: ink,
                      lineHeight: 1.6, margin: '22px 0 0', paddingLeft: 18,
                      borderLeft: `2.5px solid ${accent}`,
                    }}>
                      “{f.pull}”
                    </p>

                    <ul style={{ listStyle: 'none', margin: '24px 0 0', padding: 0, display: 'grid', gap: 11 }}>
                      {f.proof.map((p) => (
                        <li key={p.label} style={{ display: 'flex', gap: 14, alignItems: 'baseline', flexWrap: 'wrap' }}>
                          <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 800, color: accent, minWidth: 128, flexShrink: 0 }}>
                            {p.label}
                          </span>
                          <span style={{ fontFamily: SANS, fontSize: 13.5, color: inkSub, lineHeight: 1.5, flex: 1, minWidth: 180 }}>
                            {p.detail}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <a
                      href={TWINSOULS_URL}
                      className="au-world-link"
                      style={{
                        marginTop: 26, display: 'inline-flex', alignItems: 'center', gap: 8,
                        padding: '11px 24px', borderRadius: 999,
                        textDecoration: 'none', background: PLUM,
                        fontFamily: SANS, fontSize: 11.5, fontWeight: 800,
                        letterSpacing: '0.08em', textTransform: 'uppercase', color: '#fff',
                      }}
                    >
                      Enter {f.name}&apos;s world →
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* ── 4. Lineage ─────────────────────────────────────────────── */}
        <section style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(74,50,96,0.04)', padding: `${sectionPad} 0` }}>
          <div style={{ ...shell, textAlign: 'center' }}>
            <p style={eyebrow}>The work this stands on</p>
            <h2 style={{ ...h2, maxWidth: 620, margin: '14px auto 0' }}>We did not invent any of this.</h2>
            <p style={{ ...body, maxWidth: 580, margin: '18px auto 32px' }}>
              Every practice inside Mind Gym traces back to teachers who did the original
              work. We name them because you deserve to know where this comes from — and
              because you should go read them yourself.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', maxWidth: 780, margin: '0 auto' }}>
              {LINEAGE.map((t) => (
                <span
                  key={t}
                  style={{
                    padding: '8px 16px', borderRadius: 999,
                    border: `1px solid ${borderC}`, background: cardBg,
                    fontFamily: SANS, fontSize: 12.5, fontWeight: 600, color: inkSub,
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── 5. Our promise ─────────────────────────────────────────── */}
        <section style={{ position: 'relative', padding: `${sectionPad} 0`, overflow: 'hidden' }}>
          {/* Dim watermark of the two of them behind the promises themselves —
              this is the section making the claims, so it is the one place on
              the page that gets to carry their likeness as a quiet backdrop
              rather than a subject. Cards keep full-opacity backgrounds on
              top, so the image only shows through the gaps. */}
          <img
            src="/marketing/twins-pair.webp"
            alt=""
            aria-hidden="true"
            style={{
              position: 'absolute', left: '50%', bottom: 0, transform: 'translateX(-50%)',
              width: 'min(1100px, 92vw)', height: 'auto',
              opacity: isDark ? 0.05 : 0.06,
              pointerEvents: 'none',
              filter: 'grayscale(1)',
            }}
          />

          <div style={{ ...shell, position: 'relative', padding: '0 clamp(20px, 5vw, 48px)' }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <p style={eyebrow}>Our promise</p>
              <h2 style={{ ...h2, maxWidth: 600, margin: '14px auto 0' }}>What you can hold us to.</h2>
            </div>
            {/* Explicit two-up rather than auto-fit: four cards across a 1060px
                shell fitted 3 per row and left the fourth stranded alone. */}
            <div className="au-promise" style={{ display: 'grid', gap: 18 }}>
              {PROMISE.map((p, i) => (
                <div key={p.title} style={{ background: cardBg, border: `1px solid ${borderC}`, borderRadius: 18, padding: 26 }}>
                  <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', color: accent }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 style={{ fontFamily: SERIF, fontSize: 21, fontWeight: 400, color: ink, margin: '10px 0 8px' }}>{p.title}</h3>
                  <p style={{ ...body, fontSize: 13.5, lineHeight: 1.65 }}>{p.body}</p>
                </div>
              ))}
            </div>

            <p style={{
              fontFamily: SERIF, fontSize: 'clamp(18px, 2.2vw, 24px)', fontStyle: 'italic',
              color: ink, lineHeight: 1.6, textAlign: 'center', margin: '48px auto 0', maxWidth: 620,
            }}>
              &ldquo;Take what you need. Give what you can. Everything here is offered pay-what-you-feel.&rdquo;
            </p>
            <p style={{
              fontFamily: SANS, fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
              color: accent, textAlign: 'center', margin: '14px 0 0',
            }}>
              — The Soulful Intelligence Promise
            </p>
          </div>
        </section>

        {/* ── 6. Close ───────────────────────────────────────────────── */}
        <section style={{ ...shell, paddingBottom: 'clamp(64px, 9vw, 104px)' }}>
          <div
            style={{
              background: cardBg, border: `1px solid ${borderC}`, borderRadius: 24,
              padding: 'clamp(32px, 5vw, 56px)', textAlign: 'center',
              boxShadow: isDark ? '0 20px 50px rgba(0,0,0,0.3)' : '0 20px 50px rgba(74,50,96,0.07)',
            }}
          >
            <h2 style={{ ...h2, margin: '0 auto', maxWidth: 540 }}>Start where you are.</h2>
            <p style={{ ...body, maxWidth: 500, margin: '16px auto 28px' }}>
              You do not have to believe any of this. Try one practice, and let your own
              experience decide.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
              <a
                href="/mindgym"
                className="au-cta"
                style={{
                  padding: '15px 32px', borderRadius: 999, textDecoration: 'none',
                  background: PLUM, color: '#fff',
                  fontFamily: SANS, fontSize: 14, fontWeight: 800,
                  boxShadow: '0 10px 28px rgba(74,50,96,0.3)',
                }}
              >
                Start Free Practice
              </a>
              <a
                href="/feelingsandemotioncourse"
                className="au-cta"
                style={{
                  padding: '15px 32px', borderRadius: 999, textDecoration: 'none',
                  border: `1.5px solid ${borderC}`, color: ink,
                  fontFamily: SANS, fontSize: 14, fontWeight: 800,
                }}
              >
                Feelings &amp; Emotions Course
              </a>
            </div>
          </div>
        </section>
      </main>

      <div style={{ position: 'relative', zIndex: 2 }}>
        <SiteFooter palette={palette} />
      </div>
    </div>
  );
}
