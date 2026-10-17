import { usePageSeo } from '../../lib/seo';
import { useSiteTheme } from '../../lib/siteTheme';
import { usePageView, track } from '../../lib/analytics';
import { SiteHeader, SiteFooter } from '../../components/site/SiteChrome';
import SiteBackdrop from '../../components/site/SiteBackdrop';
import { Testimonials } from './components/TrustBlocks';

const SERIF = "'Cormorant Garamond', Georgia, serif";
const SANS = "'Outfit', system-ui, -apple-system, sans-serif";
const PLUM = '#4A3260';

const BOOK_1TO1 =
  'https://wa.me/918217581238?text=' +
  encodeURIComponent("Hi Sim — I'd like to book a 1:1 conversation with you.");

const WORK_WITH = [
  'You keep repeating the same emotional or relationship patterns.',
  'You overthink, and quiet never quite arrives.',
  'You feel the feeling in your body before you can name it.',
  'You have read the books, done the work, and something still feels unfinished.',
  'You are ready for change that goes beyond motivation.',
];

/**
 * Fill these in and they appear; leave them empty and nothing is shown.
 * SESSION_DETAILS e.g. { label: 'Length', value: '60 minutes' },
 *   { label: 'Format', value: 'Video call' }, { label: 'Fee', value: '...' }
 * CREDENTIALS e.g. 'Certified in ...' (only what can be checked).
 */
const SESSION_DETAILS: { label: string; value: string }[] = [];
const CREDENTIALS: string[] = [];

const COURSES = [
  {
    tag: 'Live now',
    title: 'Transform Your Patterns. Transform Your Life.',
    name: 'Understanding Feelings & Emotions',
    body: 'A 7-episode guided course to know, embrace and transform what you feel. Break old emotional patterns, dissolve overthinking and live with more clarity and ease.',
    href: '/feelingsandemotioncourse',
    cta: 'Explore the course →',
  },
  {
    tag: 'Coming soon',
    title: 'Live Fully in the Present',
    name: 'Power of Now',
    body: 'Presence practice rooted in the teachings Sim has studied and practised for years.',
    href: '',
    cta: '',
  },
  {
    tag: 'Coming soon',
    title: 'Free Your Mind, Free Your Life',
    name: 'Wisdom Untethered',
    body: 'A guided path through the questions that keep the mind loud.',
    href: '',
    cta: '',
  },
];

const PILLARS = [
  { n: '01', title: 'Presence is the practice', body: 'Change happens now, not in the past or the future. It is practised, not just understood.' },
  { n: '02', title: 'Difficulty can teach', body: 'Hard seasons are not a failure. Understood well, they show us what needs attention.' },
  { n: '03', title: 'Joy is freedom', body: 'Real joy is not the absence of pain. It is being less ruled by it.' },
  { n: '04', title: 'The body keeps score', body: 'What the mind sets aside, the body often carries. Both deserve to be listened to.' },
];

const HOW_WE_WORK = [
  { title: 'Nothing here is theory', body: 'Everything Sim teaches was lived and tested first. If it did not hold up in real life, it is not offered.' },
  { title: 'We credit where we can', body: 'When an idea comes from a particular teacher or book, we say so, so you can read them for yourself. Much of what Sim knows also came from years of meditation, which no list can name.' },
  { title: 'Pay what it is worth to you', body: 'Our courses are pay-what-you-feel, with a real floor rather than a fake discount.' },
  { title: 'Leave whenever you want', body: 'No lock-in and no auto-renewing trap. Anything you pay for has a 14-day refund, asked for by email.' },
];

const TEACHERS = [
  ['Wayne Dyer', 'The Catalyst'], ['Eckhart Tolle', 'A New Earth'], ['Michael A. Singer', 'The Untethered Soul'],
  ['Louise Hay', 'Heal Your Life'], ['Linda Howe', 'Akashic Records'], ['Robert Schwartz', 'Your Soul’s Plan'],
  ['David Goggins', 'Can’t Hurt Me'], ['Neville Goddard', 'The Power of Awareness'], ['James Clear', 'Atomic Habits'],
  ['David R. Hawkins', 'Letting Go'], ['Gabrielle Bernstein', 'The Universe Has Your Back'], ['Sister Shivani', 'Inner Peace & Clarity'],
];

export default function SimKatyal() {
  const { palette, toggle: toggleTheme } = useSiteTheme();
  const isDark = palette.isDark;
  const ink = palette.INK;
  const inkSub = palette.INK2;
  const accent = isDark ? '#C4913A' : '#7A5F44';
  const cardBg = isDark ? 'rgba(255,255,255,0.04)' : '#FFFFFF';
  const border = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(74,50,96,0.14)';

  usePageSeo({
    title: 'Sim Katyal — 1:1 Consultation & Courses | Soulful Intelligence Studio',
    description:
      'Work with Sim Katyal 1:1, or learn through her guided courses on feelings, emotional patterns and presence. Rooted in lived experience, not theory.',
    url: 'https://www.skrmblissai.in/twinsouls/simkatyal',
  });
  usePageView('PAGE_VISIT_SIM_KATYAL');

  const eyebrow = {
    fontFamily: SANS, fontSize: 11, fontWeight: 500, letterSpacing: '0.22em',
    textTransform: 'uppercase' as const, color: accent, display: 'block', marginBottom: 14,
  };
  const h2 = {
    fontFamily: SANS, fontWeight: 500, fontSize: 'clamp(30px, 4.5vw, 52px)',
    letterSpacing: '-0.02em', lineHeight: 1.08, margin: '0 0 18px', color: ink,
  };
  const body = { fontFamily: SANS, fontSize: 16.5, lineHeight: 1.75, color: inkSub, margin: '0 0 16px' };
  const wrap = { maxWidth: 1100, margin: '0 auto', padding: '0 24px' };
  const section = { padding: 'clamp(48px, 7vw, 96px) 0' };
  const primaryBtn = {
    display: 'inline-block', padding: '15px 28px', borderRadius: 999, background: PLUM, color: '#fff',
    fontFamily: SANS, fontSize: 14, fontWeight: 700, letterSpacing: '0.04em', textDecoration: 'none',
  };

  return (
    <div className="min-h-screen w-full antialiased" style={{ fontFamily: SANS, background: palette.BG, color: ink }}>
      <SiteBackdrop />
      <SiteHeader
        palette={palette}
        onToggleTheme={toggleTheme}
        links={[
          { label: 'Home', href: '/' },
          { label: 'Work 1:1', href: '#one-to-one' },
          { label: 'Courses', href: '#courses' },
          { label: 'Twin Souls', href: '/twinsouls' },
        ]}
        cta={{ label: 'Book a conversation →', href: BOOK_1TO1, onClick: () => track('SIM_BOOK_HEADER') }}
      />

      <main style={{ position: 'relative', zIndex: 2 }}>
        {/* Hero */}
        <section style={{ ...section, paddingTop: 'clamp(40px, 6vw, 80px)' }}>
          <div style={{ ...wrap, display: 'grid', gap: 'clamp(28px, 5vw, 64px)', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', alignItems: 'center' }}>
            <div>
              <span style={eyebrow}>Presence · Emotional healing · Transformation</span>
              <h1 style={{ ...h2, fontSize: 'clamp(40px, 7vw, 88px)', lineHeight: 1.02, marginBottom: 22 }}>
                Sim Katyal
              </h1>
              <p style={{ ...body, fontFamily: SERIF, fontSize: 'clamp(22px, 2.6vw, 30px)', lineHeight: 1.4, color: ink }}>
                Understand the patterns behind how you feel.
              </p>
              <p style={body}>
                Sim guides people through emotional patterns, overthinking and presence, through private conversations and guided courses. The approach is practical, unhurried and grounded in what she has lived and practised herself.
              </p>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 26 }}>
                <a href={BOOK_1TO1} onClick={() => track('SIM_BOOK_HERO')} style={primaryBtn}>Book a 1:1 conversation</a>
                <a href="#courses" style={{ ...primaryBtn, background: 'transparent', color: ink, border: `1px solid ${border}` }}>See her courses</a>
              </div>
            </div>
            <img
              src="/marketing/sim.webp"
              alt="Sim Katyal"
              style={{ width: '100%', maxHeight: 640, objectFit: 'cover', borderRadius: 24, display: 'block' }}
            />
          </div>
        </section>

        {/* Journey */}
        <section style={section}>
          <div style={{ ...wrap, maxWidth: 860 }}>
            <span style={eyebrow}>About Sim</span>
            <h2 style={h2}>Practised before it was taught.</h2>
            <p style={body}>
              Sim has been sensitive to other people’s feelings since childhood. After moving from India to the UK, a difficult stretch of life led her to look seriously for practices that actually worked, rather than ones that only sounded right.
            </p>
            <p style={body}>
              Reading Wayne Dyer was where it started. Over the following years she studied and practised the work of Eckhart Tolle, Michael A. Singer, Louise Hay and many other teachers, alongside daily meditation, testing each idea against her own life before sharing it with anyone.
            </p>
            {CREDENTIALS.length > 0 && (
              <ul style={{ ...body, paddingLeft: 20 }}>
                {CREDENTIALS.map((c) => <li key={c}>{c}</li>)}
              </ul>
            )}
            <p style={body}>
              She now teaches what held up.
            </p>
          </div>
        </section>

        {/* Philosophy */}
        <section style={section}>
          <div style={wrap}>
            <span style={eyebrow}>How Sim works</span>
            <h2 style={h2}>Four ideas behind everything she teaches.</h2>
            <div style={{ display: 'grid', gap: 18, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', marginTop: 28 }}>
              {PILLARS.map((p) => (
                <div key={p.n} style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 20, padding: 26 }}>
                  <span style={{ fontFamily: SERIF, fontSize: 30, color: accent, opacity: 0.6 }}>{p.n}</span>
                  <h3 style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 22, margin: '6px 0 8px', color: ink }}>{p.title}</h3>
                  <p style={{ ...body, fontSize: 15, margin: 0 }}>{p.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 1:1 */}
        <section id="one-to-one" style={section}>
          <div style={wrap}>
            <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 28, padding: 'clamp(28px, 5vw, 56px)' }}>
              <span style={eyebrow}>Private 1:1 consultation</span>
              <h2 style={h2}>Work with Sim, one to one.</h2>
              <p style={{ ...body, maxWidth: 680 }}>
                A private conversation to understand the pattern you are living inside, where it began, and what needs to change for it to stop repeating. Every session is shaped around you, drawing on emotional healing, somatic awareness and presence work.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '22px 0 28px', display: 'grid', gap: 10, maxWidth: 680 }}>
                {WORK_WITH.map((t) => (
                  <li key={t} style={{ ...body, margin: 0, paddingLeft: 22, position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 0, color: accent }}>·</span>{t}
                  </li>
                ))}
              </ul>
              {SESSION_DETAILS.length > 0 && (
                <dl style={{ display: 'grid', gridTemplateColumns: 'max-content 1fr', gap: '8px 20px', margin: '0 0 28px', maxWidth: 680 }}>
                  {SESSION_DETAILS.map((d) => (
                    <div key={d.label} style={{ display: 'contents' }}>
                      <dt style={{ ...body, margin: 0, fontWeight: 700, color: ink }}>{d.label}</dt>
                      <dd style={{ ...body, margin: 0 }}>{d.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
              <a href={BOOK_1TO1} onClick={() => track('SIM_BOOK_1TO1')} style={primaryBtn}>Book a 1:1 conversation</a>
              <p style={{ ...body, fontSize: 13.5, marginTop: 16 }}>
                Opens WhatsApp. Tell Sim where you are and what you are ready to shift.
              </p>
            </div>
          </div>
        </section>

        {/* Courses */}
        <section id="courses" style={section}>
          <div style={wrap}>
            <span style={eyebrow}>Courses by Sim</span>
            <h2 style={h2}>Begin on your own, at your own pace.</h2>
            <div style={{ display: 'grid', gap: 22, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', marginTop: 32 }}>
              {COURSES.map((c) => {
                const live = Boolean(c.href);
                const inner = (
                  <>
                    <span style={{ ...eyebrow, fontSize: 10, marginBottom: 10 }}>{c.tag}</span>
                    <h3 style={{ fontFamily: SANS, fontWeight: 600, fontSize: 22, lineHeight: 1.2, margin: '0 0 6px', color: ink }}>{c.title}</h3>
                    <p style={{ ...body, fontSize: 13, margin: '0 0 12px', color: accent }}>{c.name}</p>
                    <p style={{ ...body, fontSize: 15, flex: 1 }}>{c.body}</p>
                    {live && <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: isDark ? '#FFDF9E' : PLUM }}>{c.cta}</span>}
                  </>
                );
                const style = {
                  display: 'flex', flexDirection: 'column' as const, padding: 28, borderRadius: 22, textDecoration: 'none',
                  background: cardBg, border: `1px solid ${border}`, opacity: live ? 1 : 0.7,
                };
                return live
                  ? <a key={c.name} href={c.href} onClick={() => track('SIM_COURSE_CLICK')} style={style}>{inner}</a>
                  : <div key={c.name} style={style}>{inner}</div>;
              })}
            </div>
          </div>
        </section>

        {/* Teachers */}
        <section style={section}>
          <div style={wrap}>
            <span style={eyebrow}>Where the ideas come from</span>
            <h2 style={h2}>A few of the teachers and books that shaped her.</h2>
            <p style={{ ...body, maxWidth: 620 }}>She has learned from many sources, and from meditation itself. These are some of them, if you would like to go to the source.</p>
            <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', marginTop: 24 }}>
              {TEACHERS.map(([name, book]) => (
                <div key={name} style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 14, padding: '16px 18px' }}>
                  <div style={{ fontFamily: SERIF, fontSize: 18, color: ink }}>{name}</div>
                  <div style={{ fontFamily: SANS, fontSize: 12.5, color: inkSub, marginTop: 2, fontStyle: 'italic' }}>{book}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Testimonials palette={palette} />

        {/* Trust: how we work, and what this is not */}
        <section style={section}>
          <div style={wrap}>
            <span style={eyebrow}>What to expect</span>
            <h2 style={h2}>Plain terms.</h2>
            <div style={{ display: 'grid', gap: 18, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', marginTop: 28 }}>
              {HOW_WE_WORK.map((h) => (
                <div key={h.title} style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 18, padding: 24 }}>
                  <h3 style={{ fontFamily: SANS, fontWeight: 600, fontSize: 17, margin: '0 0 8px', color: ink }}>{h.title}</h3>
                  <p style={{ ...body, fontSize: 14.5, margin: 0 }}>{h.body}</p>
                </div>
              ))}
            </div>
            <p style={{ ...body, fontSize: 14.5, maxWidth: 760, marginTop: 28 }}>
              Sim’s work is guidance and education. It is not medical or psychological treatment, and it is not a replacement for your doctor or therapist. If you are in crisis or unsafe, please contact local emergency services or a qualified professional first.
            </p>
            <p style={{ ...body, fontSize: 14.5, maxWidth: 760 }}>
              Read the full <a href="/policies" style={{ color: accent }}>privacy, terms and refund policy</a>, or meet both founders on the <a href="/twinsouls" style={{ color: accent }}>Twin Souls</a> page.
            </p>
          </div>
        </section>

        {/* Closing */}
        <section style={{ ...section, paddingBottom: 'clamp(72px, 10vw, 140px)' }}>
          <div style={{ ...wrap, maxWidth: 720, textAlign: 'center' }}>
            <h2 style={h2}>Begin with a conversation.</h2>
            <p style={body}>Share where you are and what you are ready to shift. No pressure, and no pitch. You can also write to connect@skrmblissai.in.</p>
            <a href={BOOK_1TO1} onClick={() => track('SIM_BOOK_FOOTER')} style={{ ...primaryBtn, marginTop: 10 }}>Book a 1:1 conversation</a>
          </div>
        </section>
      </main>
      <SiteFooter palette={palette} />
    </div>
  );
}
