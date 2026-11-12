/**
 * KidsMindGymSales.tsx — /tiny-kids-transformations
 *
 * Sales page for the Kids Mind Gym (the kids' practice app) plus the live Zoom
 * class sold monthly or yearly. The earlier 3-day challenge is kept as a
 * smaller section and its registration page still works. Same chrome, palette
 * and type system as the other landing pages.
 *
 * No testimonials, counts or ratings: the social-proof slot is an explicit
 * empty marker (see SOCIAL_PROOF_SLOT).
 */
import { useEffect, useRef } from 'react';
import { getAuth } from 'firebase/auth';
import {
  Heart, BookOpen, Gamepad2, NotebookPen, Leaf, Star, Users, Smile, ShieldCheck, Video, Calendar,
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
import { KIDS_REGISTER_PATH, KIDS_TITLE, KIDS_DAYS, KIDS_CHART_IMG, trackKids } from './kidsChallengeData';

const SERIF = "'Cormorant Garamond', Georgia, serif";
const SANS = "'Outfit', system-ui, -apple-system, sans-serif";
const APP_PATH = '/mindgymforkids';
const URL_ = 'https://www.skrmblissai.in/tiny-kids-transformations';

const AREAS = [
  { icon: Smile, title: 'Feelings', body: 'Name what they feel and learn that every feeling is okay to have.' },
  { icon: BookOpen, title: 'Story Lab', body: 'Make up stories where characters face feelings and choices.' },
  { icon: Gamepad2, title: 'Games', body: 'Short playful games that practise calm, focus and kindness.' },
  { icon: NotebookPen, title: 'Diary', body: 'A private place to write or draw about their day.' },
  { icon: Leaf, title: 'Calm corner', body: 'Simple breathing and pause tools for when feelings feel big.' },
  { icon: Star, title: 'Rewards', body: 'Small celebrations for showing up and practising.' },
];

const STEPS = [
  { n: '1', title: 'Open it together', body: 'Your child picks a place to start. A grown-up sits alongside the first time.' },
  { n: '2', title: 'Play and practise', body: 'A few minutes of feelings, stories or games, at their own pace.' },
  { n: '3', title: 'Keep the habit', body: 'The diary and rewards make coming back a small, happy routine.' },
];

const WHO = [
  'Children about 5 to 10 who are learning to name and manage feelings.',
  'Parents who want a gentle, screen-time-friendly way to practise calm and kindness.',
  'Families who like doing something together for a few minutes a day.',
];

const FAQ = [
  { q: 'Is this therapy?', a: 'No. It is practice and play for emotional skills such as naming feelings, pausing and making kind choices. It is not therapy, diagnosis or medical care, and it does not replace a professional if your child needs one.' },
  { q: 'What ages is it for?', a: 'It is designed for children about 5 to 10. Younger children can join with a grown-up reading along; older children may prefer to explore on their own.' },
  { q: 'Does my child need me with them?', a: 'We suggest a grown-up joins for the first sessions, then stays nearby. The grown-up section explains how to support at home.' },
  { q: 'What is the Zoom class?', a: 'A live class for kids on Zoom, run by the Soulful Intelligence team, that builds on the Mind Gym practice. It is sold as a monthly or a yearly package. The schedule is shown in the class section once confirmed.' },
  { q: 'Can I cancel the Zoom class?', a: 'Monthly and yearly packages are subscriptions. Cancellation terms are listed on our policies page; contact us if you need help.' },
  { q: 'What about the 3-day challenge?', a: 'The free-to-register 3-day weekend challenge is still available. See the section below; registration is on its own page.' },
];

// Social proof is intentionally empty. Do not add testimonials, quotes, counts
// or ratings here unless they are real and the owner supplies them.
const SOCIAL_PROOF_SLOT: { quote: string; who: string }[] = [];

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
            : 'Pay month to month. Cancel any time.'}
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
          PLACEHOLDER — prices and plan IDs are not set yet (see src/features/landing/kidsPricing.ts). Buying is switched off until they are.
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
              Big feelings, <span style={{ color: palette.BROWN }}>small steps.</span>
            </h1>
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
          <div id="ad"><KidsVideo video={KIDS_AD_VIDEO} palette={palette} large /></div>
        </div>
      </header>

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

      {/* Guide — the earlier Sim + diary banner, shown as is */}
      <section id="guide" style={sec()}>
        <SectionTitle palette={palette} kicker="Your guide" title="Guided by Sim Katyal"
          sub="Sim is a mum who began this work to help her own young son understand his feelings, and now shares the same simple tools with other families." />
        <figure className="mgk-card" style={{ ...wrap, maxWidth: 900, margin: '0 auto', borderRadius: 28, overflow: 'hidden',
          border: `1px solid ${palette.BAND_BORDER}`, background: palette.BAND }}>
          <img src={KIDS_CHART_IMG} loading="lazy"
            alt="Sim Katyal with her son and the Let's Be Our Best Every Day! poster and daily diary"
            style={{ width: '100%', height: 'auto', display: 'block' }} />
          <figcaption style={{ padding: '12px 18px', fontSize: 13.5, fontWeight: 700, color: palette.ON_BAND, textAlign: 'center' }}>
            Guided by Sim Katyal · Guide, Soulful Intelligence
          </figcaption>
        </figure>
      </section>

      {/* See inside */}
      <section id="see-inside" style={{ ...sec(), background: palette.BAND, color: palette.ON_BAND }}>
        <SectionTitle palette={{ ...palette, INK: palette.ON_BAND, INK2: palette.ON_BAND_SOFT, BROWN: palette.ON_BAND_ACCENT }}
          kicker="See inside" title="A short guide for every area" sub="Eight quick videos, one for each part of the Kids Mind Gym." />
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

      {/* Who for */}
      <section id="who" style={sec()}>
        <SectionTitle palette={palette} kicker="Who it is for" title="Made for curious kids and caring parents" />
        <ul style={{ ...wrap, maxWidth: 760, listStyle: 'none', padding: 0, display: 'grid', gap: 12 }}>
          {WHO.map((w) => (
            <li key={w} className="mgk-card" style={{ ...box, padding: '16px 20px', display: 'flex', gap: 12, alignItems: 'center', fontSize: 15, color: palette.INK2 }}>
              <Heart size={18} color={palette.BROWN} aria-hidden="true" style={{ flexShrink: 0 }} /> {w}
            </li>
          ))}
        </ul>
        {/* Social proof slot — intentionally empty until real, owner-approved quotes exist. */}
        {SOCIAL_PROOF_SLOT.length === 0 && (
          <p data-placeholder="social-proof" style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: palette.INK2, opacity: 0.7 }}>
            [Parent stories slot — empty on purpose. Add real, permissioned quotes only.]
          </p>
        )}
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
          (PayPal where available). Subscriptions renew until cancelled.{' '}
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
          <Cta palette={palette} label="Register for the challenge" href={KIDS_REGISTER_PATH} event="KIDS_CHALLENGE_CTA" ghost />
        </div>
      </section>

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

      {/* Final CTA */}
      <section style={{ ...sec(), textAlign: 'center' }}>
        <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 400, margin: '0 0 12px' }}>
          Give your child a calm, playful place to grow.
        </h2>
        <p style={{ fontSize: 15.5, color: palette.INK2, margin: '0 auto 22px', maxWidth: 520 }}>
          Start with the Kids Mind Gym. Add the live Zoom class whenever you like.
        </p>
        <Cta palette={palette} label="Try the Kids Mind Gym" href={APP_PATH} event="KIDS_FINAL_CTA" />
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
        @media (max-width: 860px) { .mgk-hero { grid-template-columns: 1fr !important; } }
        @media (prefers-reduced-motion: reduce) { .mgk-blur, .mgk-card { transition: none !important; } .mgk-card:hover { transform: none !important; } }
      `}</style>
    </div>
  );
}
