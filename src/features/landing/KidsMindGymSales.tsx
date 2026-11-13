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
import { useEffect, useRef, useState } from 'react';
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, type User } from 'firebase/auth';
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
import KidsVideo, { useAvailableKidsVideos } from './components/KidsVideo';
import KidsWallOfFame from './components/KidsWallOfFame';
import { KIDS_AD_VIDEO, KIDS_GUIDE_VIDEOS } from './kidsVideos';
import {
  KIDS_ZOOM_PLANS, KIDS_ZOOM_CURRENCY, KIDS_ZOOM_SCHEDULE, KIDS_ZOOM_BOOKING_OPEN, KIDS_MEMBERSHIP_RECURRING, KIDS_FAMILY_PLANS, familyYearlyMath, formatKidsPrice, kidsZoomYearlyMath,
  type KidsZoomPlan,
} from './kidsPricing';
import FeaturedCourse from './components/FeaturedCourse';
import {
  KIDS_DAYS, KIDS_CHART_IMG, KIDS_TAGLINE, KIDS_AGE_BANDS,
  KIDS_ONLY_DIARY_IMG, KIDS_TEACHER_IMG, KIDS_TEACHER_POINTS, KIDS_TEACHER_QUOTE, trackKids,
} from './kidsChallengeData';

const SERIF = "'Cormorant Garamond', Georgia, serif";
const SANS = "'Outfit', system-ui, -apple-system, sans-serif";
const APP_PATH = '/mindgymforkids';
const ALL_VIDEOS = [KIDS_AD_VIDEO, ...KIDS_GUIDE_VIDEOS];
const WHATSAPP_URL = 'https://wa.me/918217581238'; // same number as the site footer
const URL_ = 'https://www.skrmblissai.in/tiny-kids-transformations';

// What the live Zoom class gives a family (no fixed weekday: the day is agreed on WhatsApp).
const ZOOM_INCLUDES = [
  'A live Zoom class on a Saturday or Sunday that suits you',
  'Day and time agreed with you on WhatsApp',
  '“Let’s Be Our Best Every Day!” activity chart',
  'A simple daily reflection practice',
  'Parent-supported emotional awareness activities',
  'Best Every Day Champion completion certificate',
];

// Real rooms from the Kids Mind Gym app (src/features/practise/kids/rooms.ts): name + what the child practises.
const APP_ROOMS: { name: string; practise: string }[] = [
  { name: 'Feelings Room', practise: 'Naming what I feel' },
  { name: 'Thought Room', practise: 'Noticing thoughts' },
  { name: 'Body Detective', practise: 'Listening to my body' },
  { name: 'Pause Room', practise: 'Breathing and slowing down' },
  { name: 'Different Story', practise: 'Seeing another point of view' },
  { name: 'Friendship Room', practise: 'Kind words and repair' },
  { name: 'Anger Room', practise: 'Handling big energy safely' },
  { name: 'Worry Room', practise: 'Facing worries bravely' },
  { name: 'Kindness Room', practise: 'Growing kindness' },
  { name: 'Reflection Room', practise: 'Noticing what I learned' },
];

const AREAS = [
  { icon: Smile, img: '/rooms/feelings_card.webp', alt: 'A smiling child holding a glowing jar of light under a rainbow', title: 'Feelings', body: 'Name what they feel and learn that every feeling is okay to have.' },
  { icon: BookOpen, img: '/rooms/story_card.webp', alt: 'A child reading a storybook while a castle in the clouds appears above', title: 'Story Lab', body: 'Make up stories where characters face feelings and choices.' },
  { icon: Gamepad2, img: '/rooms/friendship_card.webp', alt: 'Two children happily building a tower of colourful blocks together', title: 'Games', body: 'Short playful games that practise calm, focus and kindness.' },
  { icon: NotebookPen, img: '/rooms/thought_card.webp', alt: 'A thoughtful child resting their chin on their hand, ready to write', title: 'Diary', body: 'A place of their own to write or draw about their day.' },
  { icon: Leaf, img: '/rooms/pause_card.webp', alt: 'A child sitting calmly with eyes closed beside a waterfall', title: 'Calm corner', body: 'Simple breathing and pause tools for when feelings feel big.' },
  { icon: Star, img: '/rooms/kindness_card.webp', alt: 'A child gently watering a sunflower beside a Be Kind sign', title: 'Rewards', body: 'Small celebrations for showing up and practising.' },
];

// What a family gets with the Kids Mind Gym itself (the Zoom sessions list
const MINDGYM_INCLUDES = [
  'The Kids Mind Gym: feelings, Story Lab, games and a calm corner',
  'A digital daily diary with gentle prompts to fill in each day',
  'Printable diary chart and activity sheets to support your child’s understanding',
  'WhatsApp 1-1 support: message us about your child, we reply the same day or the next',
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
  { q: 'What ages is it for?', a: 'It is designed for children ages 3 to 12. Children of 3 to 5 take part with a grown-up alongside; older children can explore more on their own.' },
  { q: 'Does my child need me with them?', a: 'We suggest a grown-up joins for the first sessions, then stays nearby. The grown-up section explains how to support at home.' },
  { q: 'What does membership include?', a: 'The full Kids Mind Gym app, plus a live Zoom class for your child run by the Soulful Intelligence team. The Zoom class is included in the membership; there is nothing extra to pay.' },
  { q: 'Can I cancel?', a: (KIDS_MEMBERSHIP_RECURRING
    ? 'Yes, any time. Membership renews automatically each month or year until you cancel; email or WhatsApp us and we stop it.'
    : 'Yes. Membership is a one-time payment for a month or a year and never renews on its own, so there is nothing to cancel later.') + ' Our 100% money-back guarantee applies, no questions asked: any time on the monthly plan, and within the first 30 days on the yearly plan. Refunds go to your original payment method, typically within 5–7 business days.' },
  { q: 'When is the live Zoom class?', a: 'On a Saturday or a Sunday, whichever suits you. After you join we message you on WhatsApp or email to agree the day and time, then send the Zoom link. The class is 30 to 40 minutes and is included with Kids Mind Gym membership.' },
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

/** Picture first; hover (web) or tap (phone) or Enter/Space flips it to show the text. */
function FlipCard({ palette, Icon, img, alt, title, body }: {
  palette: Palette; Icon: React.ComponentType<{ size?: number; 'aria-hidden'?: boolean | 'true' | 'false' }>;
  img: string; alt: string; title: string; body: string;
}) {
  const [flipped, setFlipped] = useState(false);
  return (
    <button type="button" className="mgk-card mgk-flip" data-flipped={flipped ? '1' : '0'} aria-pressed={flipped}
      aria-label={`${title}. ${flipped ? 'Showing details' : 'Show details'}`}
      onClick={() => setFlipped((v) => !v)}>
      <span className="mgk-flip-inner">
        <span className="mgk-flip-face mgk-flip-front">
          <img src={img} alt={alt} loading="lazy" width={600} height={800} />
          <span className="mgk-flip-title">
            <Icon size={18} aria-hidden="true" /> {title}
          </span>
        </span>
        <span className="mgk-flip-face mgk-flip-back" style={{ background: palette.CARD, border: `1px solid ${palette.BORDER}`, color: palette.INK }}>
          <span style={{ display: 'inline-grid', placeItems: 'center', width: 44, height: 44, borderRadius: 14,
            background: palette.BAND, color: palette.ON_BAND, marginBottom: 12 }}><Icon size={22} aria-hidden="true" /></span>
          <strong style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 500, display: 'block', marginBottom: 8 }}>{title}</strong>
          <span style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.6, color: palette.INK2, display: 'block' }}>{body}</span>
        </span>
      </span>
    </button>
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

/** Kids Mind Gym membership (app + live Zoom class included). Two billing
 *  modes, switched by KIDS_MEMBERSHIP_RECURRING in kidsPricing.ts:
 *   - one-time (default): guest checkout like the Feelings course — Razorpay,
 *     PayPal (with Apple Pay where offered) and Google Pay; the parent renews
 *     by paying again.
 *   - recurring: a Razorpay subscription, which needs a signed-in account. */
function ZoomPlans({ palette }: { palette: Palette }) {
  const { subscribe, checkOut, isProcessing } = useRazorpay();
  const { renderCheckout, renderGooglePay, isAvailable: paypalAvailable } = usePaypal();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const emailOk = email.includes('@') && !!email.split('@')[1]?.includes('.');
  const formReady = name.trim().length > 0 && emailOk;
  const math = kidsZoomYearlyMath();
  const cardBg = palette.CARD;
  const [picked, setPicked] = useState<KidsZoomPlan | null>(null);
  const recurring = KIDS_MEMBERSHIP_RECURRING && picked?.kind !== 'family';
  const [user, setUser] = useState<User | null>(null);
  const [signingIn, setSigningIn] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  // Mind Gym creates anonymous accounts for quick entry; those cannot hold a membership.
  useEffect(() => onAuthStateChanged(getAuth(), (u) => setUser(u && !u.isAnonymous ? u : null)), []);

  const onPaidOnce = (plan: KidsZoomPlan, paidEmail: string) => {
    trackKids(`KIDS_MEMBERSHIP_PAID_${plan.period.toUpperCase()}`, undefined, plan.oneTimeProductId, paidEmail);
    setPicked(null);
    setDone(paidEmail);
  };

  // One-time mode: PayPal (and Apple Pay inside it) + Google Pay render once the form is valid.
  useEffect(() => {
    if (recurring || !picked || !formReady || !KIDS_ZOOM_BOOKING_OPEN) return;
    const userId = getAuth().currentUser?.uid || 'guest_pending';
    const paidEmail = email.trim();
    const plan = picked;
    const t = setTimeout(() => {
      renderCheckout('kids-paypal-container', userId, paidEmail, plan.oneTimeProductId, KIDS_ZOOM_CURRENCY,
        () => onPaidOnce(plan, paidEmail), phone.trim());
      renderGooglePay('kids-googlepay-container', userId, paidEmail, plan.oneTimeProductId, KIDS_ZOOM_CURRENCY,
        () => onPaidOnce(plan, paidEmail), phone.trim());
    }, 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recurring, picked, formReady, name, email, phone]);

  const payOnce = () => {
    if (!picked || !formReady) return;
    const plan = picked;
    const paidEmail = email.trim();
    const userId = getAuth().currentUser?.uid || 'guest_pending';
    trackKids(`KIDS_MEMBERSHIP_PAY_CLICK_${plan.period.toUpperCase()}`);
    checkOut(userId, paidEmail, name.trim(), plan.oneTimeProductId, KIDS_ZOOM_CURRENCY, () => onPaidOnce(plan, paidEmail), phone.trim());
  };

  const input: React.CSSProperties = {
    width: '100%', minHeight: 48, borderRadius: 14, border: `1px solid ${palette.BORDER}`, background: palette.BG,
    color: palette.INK, fontFamily: SANS, fontSize: 16, padding: '10px 14px', boxSizing: 'border-box',
  };
  const label: React.CSSProperties = { display: 'block', fontSize: 12.5, fontWeight: 700, color: palette.INK2, marginBottom: 6 };

  const pick = (plan: KidsZoomPlan) => {
    if (plan.price == null || !KIDS_ZOOM_BOOKING_OPEN) return;
    trackKids(`KIDS_MEMBERSHIP_PICK_${plan.period.toUpperCase()}`);
    setDone(null);
    setPicked(plan);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 60);
  };

  const googleSignIn = async () => {
    setSigningIn(true);
    try {
      await signInWithPopup(getAuth(), new GoogleAuthProvider());
    } catch {
      showToast('Sign-in was not completed. Please try again.', { type: 'error' });
    } finally {
      setSigningIn(false);
    }
  };

  const start = () => {
    if (!picked || !user) return;
    const plan = picked;
    const paidEmail = user.email || '';
    trackKids(`KIDS_MEMBERSHIP_PAY_CLICK_${plan.period.toUpperCase()}`);
    subscribe(user.uid, paidEmail, user.displayName || '', plan.productId, KIDS_ZOOM_CURRENCY, () => {
      trackKids(`KIDS_MEMBERSHIP_STARTED_${plan.period.toUpperCase()}`, undefined, plan.productId, paidEmail);
      setPicked(null);
      setDone(paidEmail || 'your email');
    });
  };

  const bigBtn = (on: boolean): React.CSSProperties => ({
    width: '100%', minHeight: 50, borderRadius: 999, border: 'none', fontFamily: SANS, fontSize: 15.5, fontWeight: 700,
    background: on ? palette.PURPLE_STRONG : palette.BORDER, color: on ? palette.ON_ACCENT : palette.INK2,
    cursor: on ? 'pointer' : 'not-allowed',
  });

  const card = (plan: KidsZoomPlan, featured: boolean) => {
    const family = plan.kind === 'family';
    const m = family ? familyYearlyMath() : math;
    const priced = plan.price != null;
    const canBuy = priced && KIDS_ZOOM_BOOKING_OPEN;
    const perMonth = featured && m
      ? formatKidsPrice(KIDS_ZOOM_CURRENCY === 'INR' ? Math.round(m.perMonth) : m.perMonth) : null;
    const active = picked?.period === plan.period;
    return (
      <div key={plan.period} className="mgk-card" style={{
        flex: '1 1 280px', maxWidth: 420, background: cardBg, borderRadius: 28, padding: '28px 24px',
        border: `${featured || active ? 2 : 1}px solid ${featured || active ? palette.PURPLE_STRONG : palette.BORDER}`,
        position: 'relative', display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        {featured && (
          <span style={{ position: 'absolute', top: -13, left: 24, background: palette.PURPLE_STRONG, color: palette.ON_ACCENT,
            borderRadius: 999, padding: '5px 14px', fontFamily: SANS, fontSize: 10.5, fontWeight: 800,
            letterSpacing: '0.14em', textTransform: 'uppercase' }}>
            {m && m.savePct > 0 ? `Save ${m.savePct}%` : 'Best value'}
          </span>
        )}
        <h3 style={{ margin: 0, fontFamily: SERIF, fontSize: 28, fontWeight: 500, color: palette.INK }}>{plan.label}</h3>
        <span style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 999,
          background: palette.BAND, color: palette.ON_BAND, fontFamily: SANS, fontSize: 11.5, fontWeight: 800 }}>
          <ShieldCheck size={14} aria-hidden="true" /> 100% money-back guarantee
        </span>
        <p style={{ margin: 0, fontFamily: SANS, fontSize: 36, fontWeight: 700, color: palette.INK, lineHeight: 1.1 }}>
          {priced ? formatKidsPrice(plan.price as number) : 'Price to be set'}
          {priced && <span style={{ fontSize: 15, fontWeight: 500, color: palette.INK2 }}> / {plan.period}</span>}
        </p>
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 6, fontFamily: SANS, fontSize: 13.5, lineHeight: 1.5, color: palette.INK2 }}>
          {[
            ...(family ? ['Everything in the Kids Mind Gym membership', 'Plus the adult Mind Gym app, for you'] : ['The full Kids Mind Gym app', 'Live Zoom class included']),
            'Printable diary chart and activity sheets',
            'WhatsApp 1-1 support',
            featured
              ? `${family ? '12 months for the price of 10' : '12 months for the price of 9'}${perMonth ? `, about ${perMonth} a month` : ''}`
              : ((KIDS_MEMBERSHIP_RECURRING && !family) ? 'Renews monthly, cancel any time' : 'One month at a time, no auto-renewal'),
            featured ? '100% money back in the first 30 days' : '100% money back, any time',
          ].map((line) => (
            <li key={line} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <span style={{ flexShrink: 0, marginTop: 3 }}><Check color={palette.PURPLE_STRONG} /></span>{line}
            </li>
          ))}
        </ul>
        <button type="button" onClick={() => pick(plan)} disabled={!canBuy}
          aria-label={`${family ? 'Join with the Family package' : 'Join the Kids Mind Gym'}, ${plan.label.toLowerCase()}`}
          style={{ ...bigBtn(canBuy), marginTop: 8, minHeight: 48, fontSize: 15 }}>
          {canBuy ? `${family ? 'Get the Family package' : 'Join'} ${plan.label.toLowerCase()}` : 'Opening soon'}
        </button>
      </div>
    );
  };

  return (
    <>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center', maxWidth: 900, margin: '0 auto' }}>
        {card(KIDS_ZOOM_PLANS.monthly, false)}
        {card(KIDS_ZOOM_PLANS.yearly, true)}
      </div>

      <div id="family" style={{ maxWidth: 900, margin: '44px auto 0', textAlign: 'center' }}>
        <span style={{ fontFamily: SANS, fontSize: 10.5, fontWeight: 800, letterSpacing: '0.22em', textTransform: 'uppercase', color: palette.BROWN }}>Practise together</span>
        <h3 style={{ fontFamily: SERIF, fontSize: 'clamp(26px, 3.4vw, 36px)', fontWeight: 400, margin: '8px 0 8px', color: palette.INK }}>Add the adult Mind Gym: the Family package</h3>
        <p style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.65, color: palette.INK2, margin: '0 auto 28px', maxWidth: 620 }}>
          Children learn best when the grown-up practises too. The Family package gives your child the Kids Mind Gym membership and gives you the adult Mind Gym app, with one payment and one sign-up.
        </p>
        <p style={{ fontFamily: SANS, fontSize: 13.5, lineHeight: 1.65, color: palette.INK2, margin: '-12px auto 28px', maxWidth: 620 }}>
          <strong style={{ color: palette.INK }}>The adult Mind Gym app:</strong> guided practices, the Practice Room, a Journal, Breathe, Sacred Sounds, and the Power of Now and Wisdom Untethered lessons. The separate Feelings &amp; Emotions course is not included.
        </p>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center', maxWidth: 900, margin: '0 auto' }}>
        {card(KIDS_FAMILY_PLANS.monthly, false)}
        {card(KIDS_FAMILY_PLANS.yearly, true)}
      </div>

      {done && (
        <div role="status" style={{ maxWidth: 560, margin: '24px auto 0', padding: '20px 22px', borderRadius: 20,
          background: palette.BAND, color: palette.ON_BAND, textAlign: 'center', fontFamily: SANS, fontSize: 15, lineHeight: 1.6 }}>
          <strong style={{ display: 'block', fontFamily: SERIF, fontSize: 24, fontWeight: 500 }}>Welcome to the Kids Mind Gym.</strong>
          Your membership is active. A welcome email is on its way to {done}, and we will contact you to agree a Saturday or Sunday that suits you, then send the Zoom link.
          <div style={{ marginTop: 14 }}>
            <a href={APP_PATH} style={{ display: 'inline-flex', alignItems: 'center', minHeight: 44, padding: '0 22px', borderRadius: 999,
              background: palette.PURPLE_STRONG, color: palette.ON_ACCENT, fontWeight: 700, textDecoration: 'none' }}>Open the Kids Mind Gym</a>
          </div>
        </div>
      )}

      {picked && (
        <div ref={formRef} id="kids-membership-checkout" style={{ maxWidth: 560, margin: '24px auto 0', padding: 'clamp(18px, 4vw, 26px)',
          borderRadius: 24, background: cardBg, border: `1px solid ${palette.BORDER}` }}>
          <h3 style={{ margin: '0 0 4px', fontFamily: SERIF, fontSize: 26, fontWeight: 500 }}>
            {picked.title} · {picked.label}
          </h3>
          <p style={{ margin: '0 0 16px', fontSize: 14, color: palette.INK2 }}>
            {formatKidsPrice(picked.price as number)} a {picked.period} · {picked.kind === 'family' ? 'kids membership and the adult Mind Gym app' : 'app and live Zoom class'} ·{' '}
            {recurring ? `renews each ${picked.period} until you cancel` : 'one-time payment, no auto-renewal'}
          </p>

          {!recurring ? (
            <>
              <div style={{ display: 'grid', gap: 12 }}>
                <label><span style={label}>Parent or guardian name</span>
                  <input style={input} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /></label>
                <label><span style={label}>Email (your Zoom link is sent here)</span>
                  <input style={input} type="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></label>
                <label><span style={label}>WhatsApp number (optional)</span>
                  <input style={input} type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" /></label>
              </div>
              <button type="button" onClick={payOnce} disabled={!formReady || isProcessing}
                style={{ ...bigBtn(formReady), marginTop: 16, opacity: isProcessing ? 0.7 : 1 }}>
                {isProcessing ? 'Opening secure payment…' : `Join for ${formatKidsPrice(picked.price as number)} — card, UPI or wallet`}
              </button>
              {formReady && paypalAvailable !== false && (
                <>
                  <p style={{ textAlign: 'center', fontSize: 12, color: palette.INK2, margin: '14px 0 8px' }}>or pay with</p>
                  <div id="kids-googlepay-container" style={{ marginBottom: 8 }} />
                  <div id="kids-paypal-container" />
                </>
              )}
              {!formReady && (
                <p style={{ textAlign: 'center', fontSize: 12, color: palette.INK2, margin: '12px 0 0' }}>
                  Enter your name and email to see all payment options.
                </p>
              )}
            </>
          ) : !user ? (
            <>
              <p style={{ margin: '0 0 12px', fontSize: 14, lineHeight: 1.6, color: palette.INK2 }}>
                First, sign in so the membership is saved to your account. Your child uses the same sign-in to open the Mind Gym.
              </p>
              <button type="button" onClick={googleSignIn} disabled={signingIn} style={bigBtn(!signingIn)}>
                {signingIn ? 'Opening Google…' : 'Continue with Google'}
              </button>
              <p style={{ textAlign: 'center', fontSize: 13, color: palette.INK2, margin: '12px 0 0' }}>
                No Google account?{' '}
                <a href="/mindgym?claim=1" style={{ color: palette.PURPLE_STRONG, display: 'inline-block', padding: '12px 4px' }}>
                  Sign in with email
                </a>, then come back to this page.
              </p>
            </>
          ) : (
            <>
              <p style={{ margin: '0 0 12px', fontSize: 14, color: palette.INK2 }}>
                Signed in as <strong style={{ color: palette.INK }}>{user.email}</strong>. Your Zoom link is sent to this address.
              </p>
              <button type="button" onClick={start} disabled={isProcessing} style={{ ...bigBtn(!isProcessing), opacity: isProcessing ? 0.7 : 1 }}>
                {isProcessing ? 'Opening secure payment…' : `Start membership — ${formatKidsPrice(picked.price as number)} / ${picked.period}`}
              </button>
              <p style={{ textAlign: 'center', fontSize: 12, color: palette.INK2, margin: '10px 0 0' }}>
                Card, UPI and wallets, handled securely by Razorpay.
              </p>
            </>
          )}

          <p style={{ fontSize: 12, color: palette.INK2, margin: '14px 0 0', lineHeight: 1.55 }}>
            By joining you agree to our <a href="/policies" style={{ color: palette.PURPLE_STRONG }}>terms and refund policy</a>.
          </p>
          <button type="button" onClick={() => setPicked(null)}
            style={{ display: 'block', margin: '8px auto 0', minHeight: 44, background: 'none', border: 'none', color: palette.INK2,
              fontFamily: SANS, fontSize: 13.5, textDecoration: 'underline', cursor: 'pointer' }}>
            Not now
          </button>
        </div>
      )}

      {!KIDS_ZOOM_BOOKING_OPEN && (
        <p style={{ maxWidth: 640, margin: '20px auto 0', textAlign: 'center', fontFamily: SANS, fontSize: 12.5, fontWeight: 700, color: palette.BROWN }}>
          Membership opens here shortly. To join now, message us on WhatsApp or email and we will set it up with you.
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
    title: 'Kids Mind Gym — Feelings, Stories & Games for Ages 3–12 | Live Zoom Class Included',
    description:
      'Kids Mind Gym helps children ages 3 to 12 practise noticing feelings, calming down and making kind choices through games, stories and a daily diary. Membership includes a live Zoom class on a Saturday or Sunday that suits you.',
    url: URL_,
    image: 'https://firebasestorage.googleapis.com/v0/b/awakened-path-2026.firebasestorage.app/o/Marketting%2Fposter.png?alt=media',
    jsonLd: [
      {
        '@context': 'https://schema.org', '@type': 'WebPage', name: 'Kids Mind Gym', url: URL_,
        description: 'Practice and games for children ages 3 to 12 to build emotional skills, with live Zoom class included in membership.',
        publisher: { '@type': 'Organization', name: 'Soulful Intelligence Studio', url: 'https://www.skrmblissai.in' },
      },
      {
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: FAQ.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      },
    ],
  });

  useEffect(() => { trackKids('PAGE_VISIT_KIDS_MINDGYM_SALES'); }, []);
  const liveVideos = useAvailableKidsVideos(ALL_VIDEOS);

  // Phone-only floating Join pill: appears after the hero, hides while the plans are on screen.
  const [showJoin, setShowJoin] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      const plans = document.getElementById('zoom');
      const r = plans?.getBoundingClientRect();
      const plansVisible = !!r && r.top < window.innerHeight && r.bottom > 0;
      setShowJoin(window.scrollY > 520 && !plansVisible);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
          { label: 'Membership', href: '#zoom', secondary: true },
          { label: 'Questions', href: '#faq', secondary: true },
        ]}
        cta={{ label: 'Join the Kids Mind Gym →', href: '#zoom', onClick: () => trackKids('KIDS_HEADER_CTA') }}
      />

      {/* Hero */}
      <header style={{ ...sec(), paddingTop: 'clamp(36px, 6vw, 72px)' }}>
        <div className="mgk-hero" style={{ ...wrap, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(24px, 4vw, 56px)', alignItems: 'center' }}>
          <div>
            <span style={{ display: 'inline-block', padding: '7px 14px', borderRadius: 999, border: `1px solid ${border}`,
              fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: palette.BROWN, marginBottom: 18 }}>
              For kids ages 3–12 · And their grown-ups
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
              <Cta palette={palette} label="Join the Kids Mind Gym" href="#zoom" event="KIDS_HERO_CTA" />
              <Cta palette={palette} label="Try it first" href={APP_PATH} event="KIDS_HERO_TRY" ghost />
            </div>
            <p style={{ fontSize: 12.5, color: palette.INK2, opacity: 0.8, marginTop: 14 }}>
              Practice and play for emotional skills. Not therapy or medical care.
            </p>
          </div>
          <figure className="mgk-card" style={{ margin: 0, borderRadius: 32, overflow: 'hidden',
            border: `1px solid ${palette.BAND_BORDER}`, background: palette.BAND }}>
            <img src="/marketing/kids/hero-sim-diary.webp" width={1200} height={1272} fetchPriority="high"
              onError={(e) => { if (e.currentTarget.src !== KIDS_CHART_IMG) e.currentTarget.src = KIDS_CHART_IMG; }}
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
        <p style={{ textAlign: 'center', margin: '-12px 0 18px', fontSize: 13, color: palette.INK2 }}>
          <span className="mgk-hint-hover">Hover over a card</span><span className="mgk-hint-touch">Tap a card</span> to see what is inside.
        </p>
        <div className="mgk-areas" style={{ ...wrap }}>
          {AREAS.map(({ icon: Icon, img, alt, title, body }) => (
            <FlipCard key={title} palette={palette} Icon={Icon} img={img} alt={alt} title={title} body={body} />
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
                <Sparkles size={14} /> Filled in daily
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
                Daily diary · Inside the Mind Gym
              </span>

              <h2 style={{
                fontFamily: SERIF, fontSize: 'clamp(30px, 4vw, 50px)', fontWeight: 400,
                lineHeight: 1.1, letterSpacing: '-0.015em', color: palette.ON_BAND, margin: '0 0 16px',
              }}>
                A daily diary,<br />inside the Mind Gym.
              </h2>

              <p style={{
                fontFamily: SANS, fontSize: 15.5, lineHeight: 1.7,
                color: palette.ON_BAND_SOFT, margin: '0 0 24px', maxWidth: 460,
              }}>
                The Kids Mind Gym has a digital diary your child fills in each day, with the same daily guidance as the chart shown here: seven small practices, tracked in thought, word and action.
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

              <Cta palette={palette} label="Join the Kids Mind Gym" href="#zoom" event="KIDS_JOURNAL_CTA" />
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

      {/* Everything inside the app */}
      <section id="features" style={sec()}>
        <SectionTitle palette={palette} kicker="Inside the app" title="Ten rooms, one friendly guide"
          sub="Chirpy the bird guides your child through ten short rooms. Each one practises a single skill through a quick, playful exercise." />
        <div style={{ ...wrap, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 12 }}>
          {APP_ROOMS.map((r) => (
            <div key={r.name} className="mgk-card" style={{ ...box, padding: '14px 16px', borderRadius: 18 }}>
              <strong style={{ display: 'block', fontFamily: SERIF, fontSize: 21, fontWeight: 500 }}>{r.name}</strong>
              <span style={{ fontSize: 13.5, color: palette.INK2 }}>{r.practise}</span>
            </div>
          ))}
        </div>
        <p style={{ ...wrap, maxWidth: 760, textAlign: 'center', margin: '20px auto 0', fontSize: 14.5, lineHeight: 1.7, color: palette.INK2 }}>
          Plus Story Lab, games, a daily diary, rewards for showing up and a section for grown-ups. Short sessions, no scores, no pressure.
        </p>
      </section>

      {/* Zoom class */}
      <section id="zoom" style={sec()}>
        <SectionTitle palette={palette} kicker="Membership" title="Join the Kids Mind Gym"
          sub="One membership: the full Kids Mind Gym app, with live Zoom class included. Choose monthly, or save with yearly." />
        <div style={{ ...wrap, display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginBottom: 32 }}>
          {[
            { icon: Calendar, label: 'Day', v: sched.days },
            { icon: Video, label: 'Time', v: sched.time },
            { icon: Smile, label: 'Length', v: sched.lengthMinutes ? `${sched.lengthMinutes} minutes` : '30–40 minutes' },
            { icon: Users, label: 'Ages', v: sched.ages },
          ].filter((c) => c.v).map(({ icon: Icon, label, v }) => (
            <div key={label} className="mgk-card" style={{ ...box, padding: '12px 18px', display: 'flex', gap: 10, alignItems: 'center', minWidth: 170 }}>
              <Icon size={18} color={palette.PURPLE_STRONG} aria-hidden="true" />
              <span style={{ fontSize: 13.5 }}>
                <span style={{ display: 'block', fontSize: 10, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: palette.INK2 }}>{label}</span>
                <strong>{v}</strong>
              </span>
            </div>
          ))}
        </div>
        <ZoomPlans palette={palette} />
        <p style={{ textAlign: 'center', fontSize: 12.5, color: palette.INK2, margin: '18px auto 0', maxWidth: 560 }}>
          <ShieldCheck size={14} style={{ verticalAlign: '-2px' }} aria-hidden="true" /> {KIDS_MEMBERSHIP_RECURRING
            ? 'Payments by Razorpay. Membership renews automatically each month or year until you cancel.'
            : 'Payments by Razorpay and PayPal. One-time payment for a month or a year; it never renews on its own.'}{' '}
          100% money-back guarantee, no questions asked: any time on the monthly plan, and within the first 30 days on the yearly plan. To cancel or ask for a refund, email or WhatsApp us; refunds go back to your original payment method, typically within 5–7 business days.{' '}
          <a href="/policies#refund" style={{ color: palette.PURPLE_STRONG, display: "inline-block", padding: "14px 6px" }}>Policies</a>
        </p>
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

      {/* See inside — only videos whose files exist are shown; the whole section hides when none do */}
      {liveVideos.size > 0 && (
        <section id="see-inside" style={{ ...sec(), background: palette.BAND, color: palette.ON_BAND }}>
          <SectionTitle palette={{ ...palette, INK: palette.ON_BAND, INK2: palette.ON_BAND_SOFT, BROWN: palette.ON_BAND_ACCENT }}
            kicker="See inside" title="Take a look around" sub="Short videos from inside the Kids Mind Gym." />
          {liveVideos.has(KIDS_AD_VIDEO.name) && (
            <div id="ad" style={{ ...wrap, maxWidth: 820, marginBottom: 28 }}><KidsVideo video={KIDS_AD_VIDEO} palette={palette} large /></div>
          )}
          <div style={{ ...wrap, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 18 }}>
            {KIDS_GUIDE_VIDEOS.filter((g) => liveVideos.has(g.name)).map((g) => (
              <figure key={g.name} style={{ margin: 0 }}>
                <KidsVideo video={g} palette={palette} />
                <figcaption style={{ marginTop: 8, fontSize: 13.5, lineHeight: 1.5, color: palette.ON_BAND_SOFT }}>
                  <strong style={{ color: palette.ON_BAND }}>{g.title}.</strong> {g.blurb}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

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
          'Inside the live Zoom class',
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
                  {d.day.replace(/^DAY (\d) – .*$/, "PART $1")}
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
              {ZOOM_INCLUDES.map((item, i) => (
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

      <KidsWallOfFame palette={palette} />

      {/* Choose your day — no fixed weekday; timing is agreed on WhatsApp */}
      <section id="schedule" style={{ ...sec(), paddingTop: 0 }}>
        <div className="mgk-card" style={{ ...box, ...wrap, maxWidth: 560, padding: 'clamp(20px, 4vw, 30px)', textAlign: 'center' }}>
          <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: palette.BROWN }}>
            Included with membership
          </span>
          <h3 style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 500, margin: '6px 0 8px' }}>Pick the day that suits you</h3>
          <p style={{ margin: '0 0 16px', fontSize: 14.5, lineHeight: 1.65, color: palette.INK2 }}>
            The live Zoom class takes place on a Saturday or a Sunday, 30–40 minutes. After you join, we message you on WhatsApp to agree
            the day and time that works for your family in your time zone, then send the Zoom link.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
            <Cta palette={palette} label="Join the Kids Mind Gym" href="#zoom" event="KIDS_SCHEDULE_CTA" />
            <Cta palette={palette} label="Ask on WhatsApp" href={WHATSAPP_URL} event="KIDS_SCHEDULE_WHATSAPP" ghost />
          </div>
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
                  href="#zoom"
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
                  <Heart size={18} fill="currentColor" /> Join the Kids Mind Gym
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div style={{ position: 'relative', zIndex: 2 }}><SiteFooter palette={palette} /></div>

      {KIDS_ZOOM_BOOKING_OPEN && KIDS_ZOOM_PLANS.monthly.price != null && (
        <a href="#zoom" className="mgk-join-pill" data-show={showJoin ? '1' : '0'} onClick={() => trackKids('KIDS_STICKY_JOIN')}
          aria-label="Join the Kids Mind Gym" tabIndex={showJoin ? 0 : -1}
          style={{ background: palette.PURPLE_STRONG, color: palette.ON_ACCENT, fontFamily: SANS }}>
          Join · {formatKidsPrice(KIDS_ZOOM_PLANS.monthly.price)}/mo
        </a>
      )}

      <style>{`
        .mgk-blur { position: fixed; inset: 0; z-index: 1; pointer-events: none; opacity: 0;
          backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px);
          background: ${isDark ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.12)'}; transition: opacity .35s ease; }
        body:has(.mgk-card:hover, .mgk-card:focus-within) .mgk-blur { opacity: 1; }
        @media (hover: none) { .mgk-blur { opacity: 1; backdrop-filter: blur(2px); -webkit-backdrop-filter: blur(2px); } }
        .mgk-card { transition: transform .25s ease, box-shadow .25s ease; }
        .mgk-areas { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        @media (max-width: 860px) { .mgk-areas { grid-template-columns: repeat(2, 1fr); gap: 12px; } }
        .mgk-flip { padding: 0; border: 0; background: none; cursor: pointer; text-align: left; font: inherit; color: inherit;
          aspect-ratio: 3 / 4; perspective: 1100px; border-radius: 24px; display: block; width: 100%; }
        .mgk-flip-inner { position: relative; display: block; width: 100%; height: 100%; transition: transform .6s cubic-bezier(.2,.8,.2,1);
          transform-style: preserve-3d; }
        .mgk-flip[data-flipped="1"] .mgk-flip-inner { transform: rotateY(180deg); }
        .mgk-flip-face { position: absolute; inset: 0; display: block; border-radius: 24px; overflow: hidden;
          backface-visibility: hidden; -webkit-backface-visibility: hidden; }
        .mgk-flip-front img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .mgk-flip-front::after { content: ''; position: absolute; inset: 0;
          background: linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(12,8,20,.78) 100%); }
        .mgk-flip-title { position: absolute; left: 0; right: 0; bottom: 0; z-index: 1; display: flex; align-items: center; gap: 8px;
          padding: 16px 18px; color: #fff; font-family: ${SERIF}; font-size: 26px; font-weight: 500; }
        .mgk-flip-back { transform: rotateY(180deg); padding: 22px 20px; box-sizing: border-box; overflow: auto; }
        .mgk-flip:focus-visible { outline: 3px solid ${palette.PURPLE_STRONG}; outline-offset: 3px; }
        .mgk-hint-touch { display: none; }
        @media (hover: hover) { .mgk-flip:hover .mgk-flip-inner { transform: rotateY(180deg); }
          .mgk-flip:hover[data-flipped="1"] .mgk-flip-inner { transform: rotateY(0deg); } }
        @media (hover: none) { .mgk-hint-hover { display: none; } .mgk-hint-touch { display: inline; } }
        @media (max-width: 520px) { .mgk-flip-title { font-size: 21px; padding: 12px 14px; }
          .mgk-flip-back { padding: 14px 12px; } .mgk-flip-back strong { font-size: 22px !important; }
          .mgk-flip-back span:last-child { font-size: 13.5px !important; } }
        .mgk-join-pill { display: none; }
        @media (max-width: 640px) {
          .mgk-join-pill { display: inline-flex; align-items: center; justify-content: center; position: fixed; z-index: 40;
            left: 50%; bottom: 22px; transform: translate(-50%, 90px); min-height: 48px; padding: 0 20px; border-radius: 999px;
            font-size: 14.5px; font-weight: 800; text-decoration: none; white-space: nowrap; max-width: calc(100vw - 176px);
            box-shadow: 0 10px 28px rgba(0,0,0,.35); transition: transform .3s ease; }
          .mgk-join-pill[data-show="1"] { transform: translate(-50%, 0); }
        }
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
        @media (prefers-reduced-motion: reduce) { .mgk-blur, .mgk-card, .mgk-flip-inner { transition: none !important; } .mgk-card:hover { transform: none !important; } }
      `}</style>
    </div>
  );
}
