/**
 * KidsMindGymSales.tsx — /tiny-kids-transformations
 *
 * Sales page for the Kids Mind Gym (the kids' practice app) plus the live Zoom
 * class sold monthly or yearly. The earlier 3-day challenge is kept as a
 * smaller section and its registration page still works. Same chrome, palette
 * and type system as the other landing pages.
 *
 * No testimonials, counts or ratings anywhere on the page.
 */
import { useEffect, useRef } from 'react';
import { getAuth } from 'firebase/auth';
import {
  Heart, BookOpen, Gamepad2, NotebookPen, Leaf, Star, Users, Smile, ShieldCheck, Video, Calendar, Sparkles, Clock, MapPin,
} from 'lucide-react';
import { usePageSeo } from '../../lib/seo';
import { showToast } from '../../lib/toast';
import { useSiteTheme, type Palette } from '../../lib/siteTheme';
import { SiteHeader, SiteFooter } from '../../components/site/SiteChrome';
import KidsBackdrop from '../../components/site/KidsBackdrop';
import { useRazorpay } from '../../hooks/useRazorpay';
import { usePaypal } from '../../hooks/usePaypal';
import KidsVideo from './components/KidsVideo';
import { KIDS_AD_VIDEO, KIDS_GUIDE_VIDEOS } from './kidsVideos';
import {
  KIDS_ZOOM_PLANS, KIDS_ZOOM_CURRENCY, KIDS_ZOOM_SCHEDULE, formatKidsPrice, kidsZoomYearlyMath,
  type KidsZoomPlan,
} from './kidsPricing';
import FeaturedCourse from './components/FeaturedCourse';
import {
  KIDS_REGISTER_PATH, KIDS_TITLE, KIDS_DAYS, KIDS_CHART_IMG, KIDS_TAGLINE, KIDS_TIME, KIDS_AGE_BANDS, KIDS_INCLUDES,
  KIDS_ONLY_DIARY_IMG, KIDS_TEACHER_IMG, KIDS_TEACHER_POINTS, KIDS_TEACHER_QUOTE, trackKids,
} from './kidsChallengeData';

const SERIF = "'Cormorant Garamond', Georgia, serif";
const SANS = "'Outfit', system-ui, -apple-system, sans-serif";
const APP_PATH = '/mindgymforkids';
const WHATSAPP_URL = 'https://wa.me/918217581238'; // same number as the site footer
const URL_ = 'https://www.skrmblissai.in/tiny-kids-transformations';

const AREAS = [
  { icon: Smile, title: 'Feelings', body: 'Name what they feel and learn that every feeling is okay to have.' },
  { icon: BookOpen, title: 'Story Lab', body: 'Make up stories where characters face feelings and choices.' },
  { icon: Gamepad2, title: 'Games', body: 'Short playful games that practise calm, focus and kindness.' },
  { icon: NotebookPen, title: 'Diary', body: 'A place of their own to write or draw about their day.' },
  { icon: Leaf, title: 'Calm corner', body: 'Simple breathing and pause tools for when feelings feel big.' },
  { icon: Star, title: 'Rewards', body: 'Small celebrations for showing up and practising.' },
];

// What a family gets with the Kids Mind Gym itself (the Zoom sessions list
// stays in KIDS_INCLUDES, shown with the live sessions).
const MINDGYM_INCLUDES = [
  'The Kids Mind Gym: feelings, Story Lab, games and a calm corner',
  'A digital daily diary with gentle prompts to fill in each day',
  'The printed “Let’s Be Our Best Every Day!” diary chart',
  'Rewards that celebrate showing up and practising',
  'A grown-ups section with simple ways to support at home',
];

const STEPS = [
  { n: '1', title: 'Open it together', body: 'Your child picks a place to start. A grown-up sits alongside the first time.' },
  { n: '2', title: 'Play and practise', body: 'A few minutes of feelings, stories or games, at their own pace.' },
  { n: '3', title: 'Keep the habit', body: 'The diary and rewards make coming back a small, happy routine.' },
];

const FAQ = [
  { q: 'Is this therapy?', a: 'No. It is practice and play for emotional skills such as naming feelings, pausing and making kind choices. It is not therapy, diagnosis or medical care, and it does not replace a professional if your child needs one.' },
  { q: 'What ages is it for?', a: 'It is designed for children about 5 to 10. Younger children can join with a grown-up reading along; older children may prefer to explore on their own.' },
  { q: 'Does my child need me with them?', a: 'We suggest a grown-up joins for the first sessions, then stays nearby. The grown-up section explains how to support at home.' },
  { q: 'What is the Zoom class?', a: 'A live class for kids on Zoom, run by the Soulful Intelligence team, that builds on the Mind Gym practice. It is sold as a monthly or a yearly package. The schedule is shown in the class section once confirmed.' },
  { q: 'Can I cancel the Zoom class?', a: 'Monthly and yearly packages are subscriptions. Cancellation terms are listed on our policies page; contact us if you need help.' },
  { q: 'What about the 3-day challenge?', a: 'The free-to-register 3-day weekend challenge is still available. See the section below; registration is on its own page.' },
];

function Cta({ palette, label, href, event, ghost = false }: {
  palette: Palette; label: string; href: string; event: string; ghost?: boolean;
}) {
  return (
    <a href={href} onClick={() => trackKids(event)} className="mgk-card" style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9, minHeight: 48,
      padding: '13px 28px', borderRadius: 999, textDecoration: 'none',
      background: ghost ? 'transparent' : palette.PURPLE_STRONG,
      color: ghost ? palette.PURPLE_STRONG : palette.ON_ACCENT,
      border: `1.5px solid ${palette.PURPLE_STRONG}`,
      fontFamily: SANS, fontSize: 15, fontWeight: 700,
    }}>{label}</a>
  );
}

function Check({ color }: { color: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function SectionTitle({ palette, kicker, title, sub }: { palette: Palette; kicker: string; title: string; sub?: string }) {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto 32px', textAlign: 'center' }}>
      <span style={{ fontFamily: SANS, fontSize: 10.5, fontWeight: 800, letterSpacing: '0.22em',
        textTransform: 'uppercase', color: palette.BROWN, display: 'block', marginBottom: 10 }}>{kicker}</span>
      <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 400, lineHeight: 1.15,
        color: palette.INK, margin: '0 0 10px' }}>{title}</h2>
      {sub && <p style={{ fontFamily: SANS, fontSize: 15.5, lineHeight: 1.65, color: palette.INK2, margin: 0 }}>{sub}</p>}
    </div>
  );
}

/** Zoom class pricing + checkout. Buy buttons are disabled until the owner sets a price. */
function ZoomPlans({ palette }: { palette: Palette }) {
  const { subscribe, isProcessing } = useRazorpay();
  const { renderSubscription } = usePaypal();
  const math = kidsZoomYearlyMath();
  const paypalRendered = useRef(false);
  const cardBg = palette.CARD;

  // PayPal buttons only appear once a plan id AND price exist.
  useEffect(() => {
    if (paypalRendered.current) return;
    (['monthly', 'yearly'] as const).forEach((k) => {
      const p = KIDS_ZOOM_PLANS[k];
      if (p.paypalPlanId && p.price != null) {
        paypalRendered.current = true;
        renderSubscription(`kids-paypal-${k}`, p.paypalPlanId, () =>
          showToast('Subscription confirmed — we will email your class details.', { type: 'success' }));
      }
    });
  }, [renderSubscription]);

  const buy = (plan: KidsZoomPlan) => {
    if (plan.price == null) return;
    const user = getAuth().currentUser;
    if (!user) {
      showToast('Please sign in to Mind Gym first, then come back to subscribe.', { type: 'info' });
      window.location.href = '/mindgym';
      return;
    }
    trackKids(`KIDS_ZOOM_BUY_${plan.period.toUpperCase()}`);
    subscribe(user.uid, user.email || '', user.displayName || '', plan.razorpayPlanId, KIDS_ZOOM_CURRENCY,
      () => showToast('Subscription active — we will email your class details.', { type: 'success' }));
  };

  const card = (plan: KidsZoomPlan, featured: boolean) => {
    const priced = plan.price != null;
    const perMonth = featured && math ? formatKidsPrice(math.perMonth) : null;
    return (
      <div key={plan.period} className="mgk-card" style={{
        flex: '1 1 280px', maxWidth: 420, background: cardBg, borderRadius: 28, padding: '28px 24px',
        border: `${featured ? 2 : 1}px solid ${featured ? palette.PURPLE_STRONG : palette.BORDER}`,
        position: 'relative', display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        {featured && (
          <span style={{ position: 'absolute', top: -13, left: 24, background: palette.PURPLE_STRONG, color: palette.ON_ACCENT,
            borderRadius: 999, padding: '5px 14px', fontFamily: SANS, fontSize: 10.5, fontWeight: 800,
            letterSpacing: '0.14em', textTransform: 'uppercase' }}>
            {math && math.savePct > 0 ? `Save ${math.savePct}%` : 'Best value'}
          </span>
        )}
        <h3 style={{ margin: 0, fontFamily: SERIF, fontSize: 28, fontWeight: 500, color: palette.INK }}>{plan.label}</h3>
        <p style={{ margin: 0, fontFamily: SANS, fontSize: 36, fontWeight: 700, color: palette.INK, lineHeight: 1.1 }}>
          {priced ? formatKidsPrice(plan.price as number) : 'Price to be set'}
          {priced && <span style={{ fontSize: 15, fontWeight: 500, color: palette.INK2 }}> / {plan.period}</span>}
        </p>
        <p style={{ margin: 0, fontFamily: SANS, fontSize: 13.5, color: palette.INK2, minHeight: 20 }}>
          {featured
            ? (perMonth ? `Works out to ${perMonth} a month — less than paying monthly.` : 'Billed once a year. Cheaper per month than the monthly plan.')
            : 'Pay month to month.'}
        </p>
        <button type="button" onClick={() => buy(plan)} disabled={!priced || isProcessing}
          aria-label={`Subscribe to the ${plan.label.toLowerCase()} kids Zoom class`}
          style={{
            marginTop: 8, minHeight: 48, borderRadius: 999, border: 'none', fontFamily: SANS, fontSize: 15, fontWeight: 700,
            background: priced ? palette.PURPLE_STRONG : palette.BORDER, color: priced ? palette.ON_ACCENT : palette.INK2,
            cursor: priced ? 'pointer' : 'not-allowed', opacity: isProcessing ? 0.7 : 1,
          }}>
          {priced ? `Join ${plan.label.toLowerCase()}` : 'Opening soon'}
        </button>
        {plan.paypalPlanId && priced && <div id={`kids-paypal-${plan.period === 'month' ? 'monthly' : 'yearly'}`} />}
      </div>
    );
  };

  return (
    <>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center', maxWidth: 900, margin: '0 auto' }}>
        {card(KIDS_ZOOM_PLANS.monthly, false)}
        {card(KIDS_ZOOM_PLANS.yearly, true)}
      </div>
      {!math && (
        <p data-placeholder="kids-pricing" style={{ maxWidth: 640, margin: '20px auto 0', textAlign: 'center',
          fontFamily: SANS, fontSize: 12.5, fontWeight: 700, color: palette.BROWN }}>
          Class prices and dates are being finalised. Booking opens here as soon as they are confirmed — message us if you would like to be told.
        </p>
      )}
    </>
  );
}

export default function KidsMindGymSales() {
  const { palette, toggle: toggleTheme } = useSiteTheme();
  const isDark = palette.isDark;
  const border = palette.BORDER;
  const cardBg = palette.CARD;
  const sched = KIDS_ZOOM_SCHEDULE;

  usePageSeo({
    title: 'Kids Mind Gym — Feelings, Stories & Games for Ages 5–10 | Live Zoom Class',
    description:
      'Kids Mind Gym helps children about 5 to 10 practise noticing feelings, calming down and making kind choices through games, stories and a diary. Join the live Zoom class monthly or yearly.',
    url: URL_,
    image: 'https://firebasestorage.googleapis.com/v0/b/awakened-path-2026.firebasestorage.app/o/Marketting%2Fposter.png?alt=media',
    jsonLd: [
      {
        '@context': 'https://schema.org', '@type': 'WebPage', name: 'Kids Mind Gym', url: URL_,
        description: 'Practice and games for children about 5 to 10 to build emotional skills, with an optional live Zoom class.',
        publisher: { '@type': 'Organization', name: 'Soulful Intelligence Studio', url: 'https://www.skrmblissai.in' },
      },
      {
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: FAQ.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      },
    ],
  });

  useEffect(() => { trackKids('PAGE_VISIT_KIDS_MINDGYM_SALES'); }, []);

  // Reveal-on-scroll for shared components that use .si-reveal (FeaturedCourse).
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('.si-reveal');
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('si-visible'));
      return;
    }
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { (e.target as HTMLElement).classList.add('si-visible'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.08 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const sectionTitle = (kicker: string, title: string, sub?: string) => (
    <SectionTitle palette={palette} kicker={kicker} title={title} sub={sub} />
  );
  const sec = (): React.CSSProperties => ({
    position: 'relative', zIndex: 2, padding: 'clamp(48px, 7vw, 80px) clamp(16px, 5vw, 96px)', scrollMarginTop: 72,
  });
  const wrap: React.CSSProperties = { maxWidth: 1140, margin: '0 auto' };
  const box: React.CSSProperties = { background: cardBg, border: `1px solid ${border}`, borderRadius: 24 };

  return (
    <div className="min-h-screen w-full antialiased" style={{ fontFamily: SANS, background: palette.BG, color: palette.INK, overflowX: 'hidden' }}>
      <KidsBackdrop />
      {/* Hover-blur rule: scene sharp by default, soft blur while a card/button is
          hovered or focused (web); constant light blur on touch screens. */}
      <div aria-hidden="true" className="mgk-blur" />

      <SiteHeader
        palette={palette}
        onToggleTheme={toggleTheme}
        links={[
          { label: 'Home', href: '/' },
          { label: 'What kids get', href: '#inside' },
          { label: 'Zoom class', href: '#zoom', secondary: true },
          { label: 'Questions', href: '#faq', secondary: true },
        ]}
        cta={{ label: 'Try the Kids Mind Gym →', href: APP_PATH, onClick: () => trackKids('KIDS_HEADER_CTA') }}
      />

      {/* Hero */}
      <header style={{ ...sec(), paddingTop: 'clamp(36px, 6vw, 72px)' }}>
        <div className="mgk-hero" style={{ ...wrap, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(24px, 4vw, 56px)', alignItems: 'center' }}>
          <div>
            <span style={{ display: 'inline-block', padding: '7px 14px', borderRadius: 999, border: `1px solid ${border}`,
              fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: palette.BROWN, marginBottom: 18 }}>
              For kids about 5–10 · And their grown-ups
            </span>
            <h1 style={{ fontFamily: SERIF, fontSize: 'clamp(38px, 6vw, 66px)', fontWeight: 400, lineHeight: 1.08,
              letterSpacing: '-0.02em', margin: '0 0 16px' }}>
              Let&rsquo;s Be Our <span style={{ color: palette.BROWN }}>Best</span> Every Day!
            </h1>
            <p style={{ fontFamily: SERIF, fontSize: 'clamp(18px, 2.3vw, 24px)', fontStyle: 'italic', color: palette.INK2,
              margin: '0 0 18px', lineHeight: 1.5 }}>{KIDS_TAGLINE}</p>
            <p style={{ fontSize: 17, lineHeight: 1.7, color: palette.INK2, margin: '0 0 24px', maxWidth: 520 }}>
              The Kids Mind Gym gives your child a playful place to notice what they feel, calm down and make kind choices — through
              games, stories and a daily diary. A few minutes at a time, with you alongside.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <Cta palette={palette} label="Try the Kids Mind Gym" href={APP_PATH} event="KIDS_HERO_CTA" />
              <Cta palette={palette} label="See the Zoom class" href="#zoom" event="KIDS_HERO_ZOOM" ghost />
            </div>
            <p style={{ fontSize: 12.5, color: palette.INK2, opacity: 0.8, marginTop: 14 }}>
              Practice and play for emotional skills. Not therapy or medical care.
            </p>
          </div>
          <figure className="mgk-card" style={{ margin: 0, borderRadius: 32, overflow: 'hidden',
            border: `1px solid ${palette.BAND_BORDER}`, background: palette.BAND }}>
            <img src={KIDS_CHART_IMG}
              alt="Sim Katyal with her son, holding the Let's Be Our Best Every Day! daily diary chart"
              style={{ width: '100%', height: 'auto', display: 'block' }} />
            <figcaption style={{ padding: '12px 18px', fontSize: 13.5, fontWeight: 700, color: palette.ON_BAND, textAlign: 'center' }}>
              Guided by Sim Katyal · Guide
            </figcaption>
          </figure>
        </div>
      </header>

      {/* Trust strip — plain facts only, no claims we cannot back up */}
      <section aria-label="Good to know" style={{ ...sec(), paddingTop: 0, paddingBottom: 0 }}>
        <ul style={{ ...wrap, listStyle: 'none', padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          {[
            { icon: Heart, t: 'Made by a parent', b: 'Created by Sim Katyal, a mum, from what helped her own son.' },
            { icon: ShieldCheck, t: 'Honest about what it is', b: 'Practice and play for emotional skills. Not therapy or medical care.' },
            { icon: Users, t: 'You stay involved', b: 'Designed for a grown-up to sit alongside, especially at the start.' },
            { icon: Smile, t: 'Real people to talk to', b: 'Ask us anything on WhatsApp or email before you begin.' },
          ].map(({ icon: Icon, t, b }) => (
            <li key={t} className="mgk-card" style={{ ...box, padding: '16px 18px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <Icon size={20} color={palette.PURPLE_STRONG} aria-hidden="true" style={{ flexShrink: 0, marginTop: 2 }} />
              <span style={{ fontSize: 13.5, lineHeight: 1.55, color: palette.INK2 }}>
                <strong style={{ display: 'block', fontSize: 14.5, color: palette.INK }}>{t}</strong>{b}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* What kids get */}
      <section id="inside" style={sec()}>
        <SectionTitle palette={palette} kicker="What kids get" title="Six places to practise"
          sub="Each area of the Kids Mind Gym is short, friendly and built around one small skill." />
        <div style={{ ...wrap, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {AREAS.map(({ icon: Icon, title, body }) => (
            <article key={title} className="mgk-card" style={{ ...box, padding: '22px 20px' }}>
              <span style={{ display: 'inline-grid', placeItems: 'center', width: 44, height: 44, borderRadius: 14,
                background: palette.BAND, color: palette.ON_BAND, marginBottom: 12 }}><Icon size={22} aria-hidden="true" /></span>
              <h3 style={{ margin: '0 0 6px', fontFamily: SERIF, fontSize: 24, fontWeight: 500 }}>{title}</h3>
              <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.65, color: palette.INK2 }}>{body}</p>
            </article>
          ))}
        </div>

        <div className="mgk-card" style={{ ...box, ...wrap, marginTop: 20, padding: '22px 24px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <span style={{ flexShrink: 0, display: 'grid', placeItems: 'center', width: 44, height: 44, borderRadius: 14,
            background: palette.BAND, color: palette.ON_BAND }}><Users size={22} aria-hidden="true" /></span>
          <div>
            <h3 style={{ margin: '0 0 4px', fontFamily: SERIF, fontSize: 24, fontWeight: 500 }}>A section for grown-ups</h3>
            <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.65, color: palette.INK2 }}>
              A short guide for parents on what each area is for and simple ways to support practice at home.
            </p>
          </div>
        </div>
      </section>

      <section
        id="journal"
        className="si-journal-band"
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
                  src={KIDS_ONLY_DIARY_IMG}
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
                Printed diary provided · Digital diary in Mind Gym
              </span>

              <h2 style={{
                fontFamily: SERIF, fontSize: 'clamp(30px, 4vw, 50px)', fontWeight: 400,
                lineHeight: 1.1, letterSpacing: '-0.015em', color: palette.ON_BAND, margin: '0 0 16px',
              }}>
                One diary on paper.<br />One inside the Mind Gym.
              </h2>

              <p style={{
                fontFamily: SANS, fontSize: 15.5, lineHeight: 1.7,
                color: palette.ON_BAND_SOFT, margin: '0 0 24px', maxWidth: 460,
              }}>
                Your child gets this printed daily diary to fill in by hand. The Kids Mind Gym has a digital diary with the same kind of daily guidance, so the practice carries on every day — on paper, on screen, or both.
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

              <Cta palette={palette} label="Try the Kids Mind Gym" href={APP_PATH} event="KIDS_JOURNAL_CTA" />
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

      {/* ═══ Know Your Teacher ══════════════════════════════════════════════ */}
      <section style={{ position: 'relative', zIndex: 2, padding: 'clamp(56px, 8vw, 88px) clamp(24px, 6vw, 96px)' }}>
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

      {/* See inside */}
      <section id="see-inside" style={{ ...sec(), background: palette.BAND, color: palette.ON_BAND }}>
        <SectionTitle palette={{ ...palette, INK: palette.ON_BAND, INK2: palette.ON_BAND_SOFT, BROWN: palette.ON_BAND_ACCENT }}
          kicker="See inside" title="A short guide for every area" sub="Start with the short film, then eight quick videos, one for each part of the Kids Mind Gym." />
        <div id="ad" style={{ ...wrap, maxWidth: 820, marginBottom: 28 }}><KidsVideo video={KIDS_AD_VIDEO} palette={palette} large /></div>
        <div style={{ ...wrap, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 18 }}>
          {KIDS_GUIDE_VIDEOS.map((g) => (
            <figure key={g.name} style={{ margin: 0 }}>
              <KidsVideo video={g} palette={palette} />
              <figcaption style={{ marginTop: 8, fontSize: 13.5, lineHeight: 1.5, color: palette.ON_BAND_SOFT }}>
                <strong style={{ color: palette.ON_BAND }}>{g.title}.</strong> {g.blurb}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" style={sec()}>
        <SectionTitle palette={palette} kicker="How it works" title="Three easy steps" />
        <div style={{ ...wrap, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {STEPS.map((s) => (
            <div key={s.n} className="mgk-card" style={{ ...box, padding: '22px 20px' }}>
              <span style={{ display: 'inline-grid', placeItems: 'center', width: 36, height: 36, borderRadius: '50%',
                background: palette.PURPLE_STRONG, color: palette.ON_ACCENT, fontWeight: 800, marginBottom: 10 }}>{s.n}</span>
              <h3 style={{ margin: '0 0 6px', fontFamily: SERIF, fontSize: 24, fontWeight: 500 }}>{s.title}</h3>
              <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.65, color: palette.INK2 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ Who it is for + what families receive ══════════════════════════ */}
      <section id="who" style={{ position: 'relative', zIndex: 2, padding: 'clamp(56px, 8vw, 88px) clamp(24px, 6vw, 96px)' }}>
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
              {MINDGYM_INCLUDES.map((f) => (
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

      {/* ═══ The three days ═════════════════════════════════════════════════ */}
      <section id="days" style={{ position: 'relative', zIndex: 2, padding: 'clamp(56px, 8vw, 88px) clamp(24px, 6vw, 96px)' }}>
        {sectionTitle(
          'Inside the live Zoom sessions',
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

      {/* Zoom class */}
      <section id="zoom" style={sec()}>
        <SectionTitle palette={palette} kicker="Live Zoom class" title="Learn together, live"
          sub="A live class for kids on Zoom that builds on the Mind Gym practice. Choose monthly, or save with the yearly package." />
        <div style={{ ...wrap, display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginBottom: 32 }}>
          {[
            { icon: Calendar, label: 'Days', v: sched.days },
            { icon: Video, label: 'Time', v: sched.time },
            { icon: Smile, label: 'Length', v: sched.lengthMinutes ? `${sched.lengthMinutes} minutes` : null },
            { icon: Users, label: 'Ages', v: sched.ages },
          ].map(({ icon: Icon, label, v }) => (
            <div key={label} className="mgk-card" style={{ ...box, padding: '12px 18px', display: 'flex', gap: 10, alignItems: 'center', minWidth: 170 }}>
              <Icon size={18} color={palette.PURPLE_STRONG} aria-hidden="true" />
              <span style={{ fontSize: 13.5 }}>
                <span style={{ display: 'block', fontSize: 10, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: palette.INK2 }}>{label}</span>
                <strong>{v ?? 'To be announced'}</strong>
              </span>
            </div>
          ))}
        </div>
        <ZoomPlans palette={palette} />
        <p style={{ textAlign: 'center', fontSize: 12.5, color: palette.INK2, margin: '18px auto 0', maxWidth: 560 }}>
          <ShieldCheck size={14} style={{ verticalAlign: '-2px' }} aria-hidden="true" /> Payments by Razorpay{' '}
          (PayPal where available). Subscriptions renew until cancelled. Refund and cancellation terms for the class will be shown here before booking opens.{' '}
          <a href="/policies" style={{ color: palette.PURPLE_STRONG, display: "inline-block", padding: "14px 6px" }}>Policies</a>
        </p>
      </section>

      {/* 3-day challenge */}
      <section id="challenge" style={sec()}>
        <div className="mgk-card" style={{ ...box, ...wrap, maxWidth: 900, padding: 'clamp(22px, 4vw, 36px)' }}>
          <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: palette.BROWN }}>
            Also available · Ages 3–12
          </span>
          <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(26px, 3.4vw, 36px)', fontWeight: 400, margin: '8px 0 10px' }}>{KIDS_TITLE}</h2>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: palette.INK2, margin: '0 0 14px' }}>
            A playful 3-day weekend challenge on Zoom, Friday to Sunday: {KIDS_DAYS.map((d) => d.title).join(', ')}. Registration is free
            and donation-based; details are sent after you register.
          </p>
          <div style={{ border: `1px solid ${border}`, borderRadius: 18, padding: '16px 18px', margin: '0 0 18px', maxWidth: 460 }}>
            <p style={{ margin: '0 0 2px', fontFamily: SERIF, fontSize: 21 }}>Session schedule</p>
            <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: palette.INK2 }}>
              Every Friday · Saturday · Sunday · 30–40 minutes · {KIDS_TIME}
            </p>
            {[
              ['India (IST)', '8:30 PM'], ['USA – New York (ET)', '11:00 AM'], ['USA – Chicago (CT)', '10:00 AM'],
              ['USA – Denver (MT)', '9:00 AM'], ['USA – Los Angeles (PT)', '8:00 AM'],
            ].map(([place, t]) => (
              <div key={place} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 14, fontWeight: 600, padding: '4px 0' }}>
                <span>{place}</span><span>{t}</span>
              </div>
            ))}
            <p style={{ margin: '10px 0 0', fontSize: 11.5, color: palette.INK2 }}>
              Times may change with daylight saving. Please check your local time at registration.
            </p>
          </div>
          <Cta palette={palette} label="Register for the challenge" href={KIDS_REGISTER_PATH} event="KIDS_CHALLENGE_CTA" ghost />
        </div>
      </section>

      {/* ═══ Adult Course Cross-Sell ════════════════════════════════════════ */}
      <FeaturedCourse 
        palette={palette}
        kicker="For Parents · Adult Course"
        description="Looking to deepen your own emotional transformation? Explore our separate 7-episode guided video series for adults to quiet overthinking, release blockages, and live in deep presence."
        source="kids_page"
      />

      {/* FAQ */}
      <section id="faq" style={sec()}>
        <SectionTitle palette={palette} kicker="Before you start" title="Questions parents ask" />
        <div style={{ ...wrap, maxWidth: 800, display: 'grid', gap: 12 }}>
          {FAQ.map((f) => (
            <details key={f.q} className="mgk-card" style={{ ...box, borderRadius: 18, padding: '4px 22px' }}>
              <summary style={{ fontSize: 15.5, fontWeight: 700, cursor: 'pointer', minHeight: 44, display: 'flex', alignItems: 'center' }}>{f.q}</summary>
              <p style={{ fontSize: 15, lineHeight: 1.75, color: palette.INK2, margin: '0 0 16px' }}>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Talk to us */}
      <section id="contact" style={{ ...sec(), textAlign: 'center' }}>
        <SectionTitle palette={palette} kicker="Still unsure?" title="Talk to a real person first"
          sub="Ask about your child, the Mind Gym or the Zoom class. We reply ourselves." />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
          <Cta palette={palette} label="Message us on WhatsApp" href={WHATSAPP_URL} event="KIDS_CONTACT_WHATSAPP" />
          <Cta palette={palette} label="Email connect@skrmblissai.in" href="mailto:connect@skrmblissai.in" event="KIDS_CONTACT_EMAIL" ghost />
        </div>
      </section>

      {/* ═══ Final CTA (Full Bleed End-to-End) ══════════════════════════════ */}
      <section style={{
        position: 'relative', zIndex: 2,
        width: '100%',
        background: isDark
          ? 'linear-gradient(145deg, rgba(74, 40, 96, 0.85) 0%, rgba(32, 22, 52, 0.95) 100%)'
          : 'linear-gradient(145deg, rgba(253, 247, 243, 0.95) 0%, rgba(245, 237, 230, 0.90) 100%)',
        backdropFilter: 'blur(12px)',
        borderTop: `1px solid ${palette.BAND_BORDER}`,
        borderBottom: `1px solid ${palette.BAND_BORDER}`,
        boxShadow: isDark ? '0 32px 96px rgba(0,0,0,0.4)' : '0 32px 96px rgba(60,40,30,0.08)',
        padding: 'clamp(56px, 8vw, 96px) clamp(24px, 6vw, 96px)',
        overflow: 'hidden',
      }}>
        {/* Decorative accent */}
        <div style={{
          position: 'absolute', top: -60, right: -60, width: 300, height: 300,
          background: palette.PURPLE_STRONG, borderRadius: '50%', opacity: isDark ? 0.12 : 0.06, zIndex: 0, pointerEvents: 'none',
        }} />

        <div style={{
          maxWidth: 1200, margin: '0 auto',
          position: 'relative', zIndex: 1,
        }}>

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
                src="/marketing/kids/closing-poster.webp"
                alt="Sim Katyal and her son. Let's Be Our Best Every Day! Helping children understand their feelings, make better choices and grow a little every day."
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
                Give your child a few minutes a day to discover something powerful.
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
                  { icon: <Calendar size={17} color={palette.PURPLE_STRONG} />, label: 'Every day', value: 'A few minutes' },
                  { icon: <Clock size={17} color={palette.PURPLE_STRONG} />, label: 'Inside', value: 'Feelings · Stories · Games' },
                  { icon: <MapPin size={17} color={palette.PURPLE_STRONG} />, label: 'Keeps going', value: 'Daily diary' },
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
                  href={APP_PATH}
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
                  <Heart size={18} fill="currentColor" /> Try the Kids Mind Gym
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div style={{ position: 'relative', zIndex: 2 }}><SiteFooter palette={palette} /></div>

      <style>{`
        .mgk-blur { position: fixed; inset: 0; z-index: 1; pointer-events: none; opacity: 0;
          backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px);
          background: ${isDark ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.12)'}; transition: opacity .35s ease; }
        body:has(.mgk-card:hover, .mgk-card:focus-within) .mgk-blur { opacity: 1; }
        @media (hover: none) { .mgk-blur { opacity: 1; backdrop-filter: blur(2px); -webkit-backdrop-filter: blur(2px); } }
        .mgk-card { transition: transform .25s ease, box-shadow .25s ease; }
        @media (hover: hover) { .mgk-card:hover { transform: translateY(-3px); } }
        @media (max-width: 900px) {
          .si-kids-grid-2, .si-kids-footer-grid, .si-journal-grid { grid-template-columns: 1fr !important; }
          .si-journal-frame, .si-cta-photo { transform: none !important; }
          .si-journal-back { display: none !important; }
          .si-journal-pill { top: -12px !important; left: 6px !important; }
          .si-teacher-photo { min-height: 340px !important; }
        }
        @media (max-width: 520px) { section { padding-left: 16px !important; padding-right: 16px !important; } }
        @media (max-width: 860px) { .mgk-hero { grid-template-columns: 1fr !important; } }
        @media (prefers-reduced-motion: reduce) { .mgk-blur, .mgk-card { transition: none !important; } .mgk-card:hover { transform: none !important; } }
      `}</style>
    </div>
  );
}
