// ─────────────────────────────────────────────────────────────────────────────
// /pricing — the ONE place anything is bought, across both studios.
//
// Every buy / upgrade / unlock button on the site and in the app links here,
// optionally with ?select=<product id> to open that product's checkout.
// Signed-in visitors are charged on their own account (uid); everyone else
// checks out as a guest by email, exactly like the course and kids pages.
// Products, prices and refunds all come from catalog.ts.
// ─────────────────────────────────────────────────────────────────────────────

import { Fragment, useEffect, useRef, useState } from 'react';
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth';
import { Check, ShieldCheck, Loader2 } from 'lucide-react';
import { usePageSeo } from '../../lib/seo';
import { track } from '../../lib/analytics';
import { useSiteTheme, type Palette } from '../../lib/siteTheme';
import { SiteHeader, SiteFooter, SERIF, SANS } from '../../components/site/SiteChrome';
import { siteNav } from '../../components/site/siteNav';
import { useRazorpay } from '../../hooks/useRazorpay';
import { usePaypal } from '../../hooks/usePaypal';
import { CURRENCY, DOORS, PRODUCTS, canonicalId, formatPrice, priceOf, product, refundOf, wasOf, type Door, type Product } from './catalog';

const t = (a: string, d = '') => track(a, d, '/pricing');
const PER: Record<Product['billing'], string> = { once: ' once', month: '/month', year: '/year' };

/** How a plan is named inside its door: "Monthly", "Yearly · save 17%", or its own name if it is an add-on. */
function optionLabel(id: string, door: Door): string {
  const p = product(id);
  const base = product(door.plans[0]);
  if (p.name !== base.name) return p.billing === 'month' ? `${p.name}, monthly` : p.name;
  if (p.billing === 'once') return 'One payment, yours to keep';
  if (p.billing === 'month') return 'Monthly';
  const monthly = PRODUCTS.find((x) => x.name === p.name && x.billing === 'month');
  if (!monthly) return 'Yearly';
  const save = Math.round((1 - p.price[CURRENCY] / (monthly.price[CURRENCY] * 12)) * 100);
  return save > 0 ? `Yearly · save ${save}%` : 'Yearly';
}

/** One door as a pricing column: who it is for, what is inside, and its plans. */
function DoorColumn({ palette, door, selected, onPick }: { palette: Palette; door: Door; selected: string | null; onPick: (id: string) => void }) {
  return (
    <section id={door.id} aria-labelledby={`door-${door.id}`} className="pr-col"
      style={{ background: palette.CARD, border: `1px solid ${palette.BORDER}`, borderRadius: 28, padding: 'clamp(18px, 3.5vw, 28px)', display: 'flex', flexDirection: 'column', gap: 14, scrollMarginTop: 90 }}>
      <span style={{ alignSelf: 'flex-start', fontSize: 12.5, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase',
        padding: '6px 12px', borderRadius: 999, background: palette.BAND, color: palette.ON_BAND }}>{door.who}</span>
      <h2 id={`door-${door.id}`} style={{ fontFamily: SERIF, fontSize: 'clamp(25px, 3.2vw, 36px)', fontWeight: 500, lineHeight: 1.15, margin: 0 }}>{door.title}</h2>
      <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.6, color: palette.INK2 }}>{door.line}</p>
      {door.id === 'me' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 160, margin: '2px 0 6px' }}>
          <img
            src="/assets/gym/adult-character@320.webp"
            alt="Adult Mind Gym"
            style={{ maxHeight: 160, width: 'auto', objectFit: 'contain' }}
            loading="lazy"
          />
        </div>
      )}
      {door.id === 'child' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 160, margin: '2px 0 6px' }}>
          <img
            src="/assets/gym/chirpy/chirpy-feelings-trio.webp"
            alt="Kids Mind Gym Chirpy Feelings & Emotions"
            style={{ maxHeight: 140, maxWidth: '95%', objectFit: 'contain' }}
            loading="lazy"
          />
        </div>
      )}
      {door.id === 'mantras' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 160, margin: '2px 0 6px' }}>
          <img
            src="/marketing/mantras/exec-ce641b41-377a-428e-9ae9-53d82af4accf.png"
            alt="Sacred Golden Om Lotus Emblem"
            style={{ maxHeight: 155, maxWidth: '95%', objectFit: 'contain' }}
            loading="lazy"
          />
        </div>
      )}
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 8 }}>
        {door.includes.map((x) => (
          <li key={x} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 15, lineHeight: 1.5 }}>
            <Check size={16} color={palette.PURPLE_STRONG} aria-hidden="true" style={{ flexShrink: 0, marginTop: 2 }} /> {x}
          </li>
        ))}
      </ul>
      <div role="radiogroup" aria-label={`${door.title} plans`} style={{ display: 'grid', gap: 10, marginTop: 'auto', paddingTop: 6 }}>
        {door.plans.map((id) => {
          const p = product(id);
          const on = selected === id;
          return (
            <button key={id} type="button" role="radio" aria-checked={on} onClick={() => onPick(id)} className="pr-opt"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, minHeight: 56, padding: '10px 16px', borderRadius: 16,
                cursor: 'pointer', textAlign: 'left', fontFamily: SANS, color: palette.INK,
                background: on ? (palette.isDark ? 'rgba(191,176,189,0.14)' : 'rgba(105,94,104,0.08)') : 'transparent',
                border: `${on ? 2 : 1}px solid ${on ? palette.PURPLE_STRONG : palette.BORDER}` }}>
              <span style={{ fontSize: 15.5, fontWeight: 700, lineHeight: 1.3 }}>{optionLabel(id, door)}</span>
              <span style={{ fontSize: 16.5, fontWeight: 800, whiteSpace: 'nowrap' }}>
                {priceOf(id)}<span style={{ fontSize: 13.5, fontWeight: 500, color: palette.INK2 }}>{PER[p.billing]}</span>
              </span>
            </button>
          );
        })}
      </div>
      {door.extra && (
        <p style={{ margin: 0, fontSize: 14, color: palette.INK2 }}>
          {door.extra.label}{' '}
          <button type="button" onClick={() => onPick(door.extra!.id)}
            style={{ background: 'none', border: 'none', padding: 0, color: palette.PURPLE_STRONG, fontWeight: 700, cursor: 'pointer', fontFamily: SANS, fontSize: 14, textDecoration: 'underline' }}>
            {priceOf(door.extra.id)} once
          </button>
        </p>
      )}
    </section>
  );
}

/** Other plans worth adding to this order: the primary plan of each door, plus standalone course where applicable. */
function upsells(id: string): string[] {
  const candidates = [
    'membership_monthly',   // Adult Mind Gym
    'kids_zoom_monthly',    // Kids Mind Gym
    'mantra_lifetime_pass', // Mantra Pass
  ];
  if (!product(id).unlocks.includes('emotion_course')) {
    candidates.push('emotion_feelings_course');
  }
  return candidates.filter((pid) => pid !== id && product(pid).name !== product(id).name);
}

function Checkout({ palette, id, user, onClose, queued, onAdd, onRemove }: {
  palette: Palette; id: string; user: User | null; onClose: () => void;
  queued: string[]; onAdd: (id: string) => void; onRemove: (id: string) => void;
}) {
  const p = product(id);
  const { checkOut, isProcessing } = useRazorpay();
  const { renderCheckout, isAvailable: paypalAvailable } = usePaypal();
  const [name, setName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [done, setDone] = useState(false);

  // Sync if user profile hydrates after component mount
  useEffect(() => {
    if (user?.email && !email) {
      setEmail(user.email);
    }
    if (user?.displayName && !name) {
      setName(user.displayName);
    }
  }, [user]);
  const emailOk = email.includes('@') && !!email.split('@')[1]?.includes('.');
  const phoneOk = phone.replace(/\D/g, '').length >= 8;
  // Email and phone are both required: access is opened by signing in with this email,
  // and we use the phone for WhatsApp support and kids class scheduling.
  const ready = name.trim().length > 0 && emailOk && phoneOk;

  const allItems = [id, ...queued];
  const totalAmount = allItems.reduce((sum, item) => sum + (product(item)?.price[CURRENCY] || 0), 0);
  const courseIdBundle = allItems.join(',');
  const formattedTotal = formatPrice(totalAmount);
  const uid = user && !user.isAnonymous ? user.uid : 'guest_pending';
  const paid = () => { t('PRICING_PAID', courseIdBundle); setDone(true); };
  const allUnlocks = new Set(allItems.flatMap((item) => product(item)?.unlocks || []));
  const addable = upsells(id).filter((x) =>
    !queued.includes(x) &&
    !queued.some((q) => product(q).name === product(x).name) &&
    !(x === 'emotion_feelings_course' && allUnlocks.has('mind_gym'))
  );

  useEffect(() => {
    if (!ready || done) return;
    const timer = setTimeout(() => {
      renderCheckout('pricing-paypal', uid, email.trim(), courseIdBundle, CURRENCY, paid, phone.trim(), totalAmount);
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseIdBundle, totalAmount, ready, name, email, phone]);

  const input: React.CSSProperties = { width: '100%', minHeight: 48, borderRadius: 14, border: `1px solid ${palette.BORDER}`, background: palette.BG,
    color: palette.INK, fontFamily: SANS, fontSize: 16, padding: '10px 14px', boxSizing: 'border-box' };
  const label: React.CSSProperties = { display: 'block', fontSize: 12.5, fontWeight: 700, color: palette.INK2, marginBottom: 6 };

  return (
    <div id="pricing-checkout" style={{ background: palette.CARD, border: `2px solid ${palette.PURPLE_STRONG}`, borderRadius: 28, padding: 'clamp(20px, 3vw, 28px)', fontFamily: SANS, color: palette.INK, overflow: 'hidden' }}>
      {/* Header Visual — Spacious, uncropped sacred diya */}
      <div style={{
        margin: 'calc(-1 * clamp(20px, 3vw, 28px)) calc(-1 * clamp(20px, 3vw, 28px)) 20px',
        height: 'clamp(200px, 28vw, 250px)',
        position: 'relative',
        overflow: 'hidden',
        borderTopLeftRadius: 26,
        borderTopRightRadius: 26,
        background: palette.isDark ? '#A07378' : '#F4E5D6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <img
          src={palette.isDark ? '/marketing/mantras/diya-banner-mauve.webp' : '/marketing/mantras/diya-banner-ivory.webp'}
          alt="Golden sacred diya altar"
          aria-hidden="true"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center center',
          }}
        />
        {/* Soft bottom fade into card surface — subtle 28px so it never obscures the marble pedestal or petal */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 28,
          background: `linear-gradient(to bottom, transparent 0%, ${palette.CARD} 100%)`,
          pointerEvents: 'none',
        }} />
      </div>

      {/* Order Info & Change Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14, marginBottom: 4 }}>
        <div style={{ flex: 1 }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 10.5,
            fontWeight: 800,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: palette.isDark ? '#E5A93C' : '#B46C1E',
            background: palette.isDark ? 'rgba(229,169,60,0.14)' : 'rgba(180,108,30,0.08)',
            padding: '3px 10px',
            borderRadius: 999,
            marginBottom: 8,
          }}>
            ✦ YOUR ORDER
          </span>
          <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 600, margin: '2px 0 4px', color: palette.INK, letterSpacing: '-0.01em' }}>
            {p.name}
          </h2>
          <p style={{ margin: 0, fontSize: 14, color: palette.INK2, lineHeight: 1.5 }}>
            {p.pitch}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '6px 14px',
            borderRadius: 999,
            border: `1px solid ${palette.BORDER}`,
            background: palette.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
            color: palette.INK2,
            fontSize: 12.5,
            fontWeight: 600,
            cursor: 'pointer',
            flexShrink: 0,
            marginTop: 4,
          }}
        >
          Change
        </button>
      </div>

      {done ? (
        <div role="status" style={{ marginTop: 16, padding: 18, borderRadius: 18, background: palette.BAND, color: palette.ON_BAND, lineHeight: 1.6 }}>
          <strong style={{ display: 'block', fontFamily: SERIF, fontSize: 24, fontWeight: 500 }}>Thank you. Your payment is confirmed.</strong>
          <p style={{ margin: '8px 0 12px', fontSize: 15 }}>
            {allItems.length > 1
              ? `All ${allItems.length} plans (${allItems.map(x => product(x).name).join(', ')}) are unlocked together.`
              : `${p.name} is unlocked.`}
          </p>
          {uid === 'guest_pending'
            ? <p style={{ margin: 0, fontSize: 14 }}>One last step: <strong>sign in with {email}</strong> to open what you bought. Your purchase is saved to this email, so it unlocks the moment you sign in, on any device.</p>
            : <p style={{ margin: 0, fontSize: 14 }}>It is unlocked on your account ({email}) now.</p>}
          <a href={uid === 'guest_pending' ? '/mindgym?claim=1' : '/mindgym'}
            style={{ display: 'inline-flex', alignItems: 'center', minHeight: 44, marginTop: 14, padding: '0 20px', borderRadius: 999,
              background: palette.PURPLE_STRONG, color: palette.ON_ACCENT, fontWeight: 700, textDecoration: 'none' }}>
            {uid === 'guest_pending' ? 'Sign in to access →' : 'Open Mind Gym →'}
          </a>
        </div>
      ) : (
        <>
          {uid === 'guest_pending' && (
            <p style={{ margin: '14px 0 0', fontSize: 13, lineHeight: 1.55, color: palette.INK2 }}>
              After paying you will sign in with this email to access it. Already have an account? <a href="/mindgym?claim=1" style={{ color: palette.PURPLE_STRONG, fontWeight: 700 }}>Sign in first</a>.
            </p>
          )}
          <dl style={{
            margin: '16px 0 14px',
            padding: '14px 18px',
            borderRadius: 18,
            border: `1px solid ${palette.BORDER}`,
            background: palette.isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)',
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: '8px 14px',
            fontSize: 14.5,
          }}>
            <dt style={{ color: palette.INK2 }}>{p.name}{p.billing !== 'once' ? ` (${p.billing === 'month' ? 'one month' : 'one year'})` : ''}</dt>
            <dd style={{ margin: 0 }}>{wasOf(id) && <s style={{ color: palette.INK2, marginRight: 8 }}>{wasOf(id)}</s>}{priceOf(id)}</dd>
            {queued.map((q) => (
              <Fragment key={q}>
                <dt style={{ color: palette.INK2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <span>{product(q).name}{product(q).billing !== 'once' ? ` (${product(q).billing === 'month' ? 'one month' : 'one year'})` : ''}</span>
                  <button type="button" onClick={() => onRemove(q)} aria-label={`Remove ${product(q).name}`}
                    style={{ background: 'none', border: 'none', color: palette.INK2, textDecoration: 'underline', cursor: 'pointer', fontFamily: SANS, fontSize: 12.5, padding: 0 }}>Remove</button>
                </dt>
                <dd style={{ margin: 0 }}>{priceOf(q)}</dd>
              </Fragment>
            ))}
            <dt style={{ fontWeight: 800, paddingTop: 10, borderTop: `1px solid ${palette.BORDER}`, color: palette.INK }}>
              {queued.length > 0 ? 'Total amount to pay' : 'Amount to pay now'}
            </dt>
            <dd style={{ margin: 0, fontWeight: 800, fontSize: 16, paddingTop: 10, borderTop: `1px solid ${palette.BORDER}`, color: palette.isDark ? '#E5A93C' : '#B46C1E' }}>{formattedTotal}</dd>
          </dl>
          {addable.length > 0 && (
            <div style={{ margin: '0 0 16px' }}>
              <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700, color: palette.INK }}>Add to your order</p>
              <div style={{ display: 'grid', gap: 8 }}>
                {addable.map((x) => (
                  <button key={x} type="button" onClick={() => { t('PRICING_ADD', x); onAdd(x); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', padding: '10px 14px', borderRadius: 14, cursor: 'pointer', fontFamily: SANS, color: palette.INK,
                      background: 'transparent', border: `1px solid ${palette.BORDER}` }}>
                    <span aria-hidden="true" style={{ flexShrink: 0, display: 'grid', placeItems: 'center', width: 30, height: 30, borderRadius: '50%', background: palette.PURPLE_STRONG, color: palette.ON_ACCENT, fontSize: 20, lineHeight: 1 }}>+</span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'block', fontSize: 14.5, fontWeight: 700 }}>{product(x).name}</span>
                      <span style={{ display: 'block', fontSize: 12.5, color: palette.INK2, lineHeight: 1.4 }}>{product(x).pitch}</span>
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 800, whiteSpace: 'nowrap' }}>{priceOf(x)}<span style={{ fontSize: 11.5, fontWeight: 500, color: palette.INK2 }}>{PER[product(x).billing]}</span></span>
                  </button>
                ))}
              </div>
            </div>
          )}
          <div style={{ display: 'grid', gap: 12 }}>
            <label><span style={label}>Your name</span><input style={input} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Full name" /></label>
            <label><span style={label}>Email{user?.email ? ' (your account)' : ' (use this email to sign in later)'}</span>
              <input style={input} type="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="name@example.com" /></label>
            <label><span style={label}>WhatsApp / phone number</span><input style={input} type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" placeholder="Mobile / WhatsApp number" /></label>
          </div>
          <button type="button" disabled={!ready || isProcessing}
            onClick={() => { t('PRICING_PAY_CLICK', courseIdBundle); checkOut(uid, email.trim(), name.trim(), courseIdBundle, CURRENCY, paid, phone.trim(), totalAmount); }}
            style={{
              width: '100%',
              minHeight: 52,
              marginTop: 18,
              borderRadius: 999,
              border: 'none',
              fontFamily: SANS,
              fontSize: 16,
              fontWeight: 800,
              letterSpacing: '0.01em',
              background: ready
                ? (palette.isDark ? 'linear-gradient(135deg, #F3BA4F 0%, #D4881E 100%)' : 'linear-gradient(135deg, #E09F3E 0%, #C47A1B 100%)')
                : palette.BORDER,
              color: ready ? '#1A1105' : palette.INK2,
              cursor: ready ? 'pointer' : 'not-allowed',
              boxShadow: ready ? '0 8px 24px rgba(212,136,30,0.30)' : 'none',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'all 0.25s ease',
            }}>
            {isProcessing ? <><Loader2 size={17} className="animate-spin" /> Opening secure payment…</> : `Proceed to pay ${formattedTotal}`}
          </button>
          <p style={{ textAlign: 'center', fontSize: 12.5, color: palette.INK2, margin: '10px 0 0' }}>
            {ready ? '🔒 Instant unlock via UPI, Google Pay, PhonePe, Cards & Net Banking' : 'Enter your name, email and phone number to continue.'}
          </p>
          {ready && paypalAvailable !== false && CURRENCY !== 'INR' && <div id="pricing-paypal" style={{ marginTop: 12 }} />}
          <p style={{ display: 'flex', gap: 8, alignItems: 'flex-start', margin: '14px 0 0', fontSize: 13, lineHeight: 1.55, color: palette.INK2 }}>
            <ShieldCheck size={17} color={palette.PURPLE_STRONG} aria-hidden="true" style={{ flexShrink: 0, marginTop: 2 }} />
            <span>{allItems.length > 1 ? 'Satisfaction guaranteed. ' : refundOf(id) + ' '}{allItems.some(item => product(item).billing !== 'once') && 'One-time payment for this period; it does not renew by itself. '}See our <a href="/policies#refund" style={{ color: palette.PURPLE_STRONG }}>refund policy</a>.</span>
          </p>
        </>
      )}
    </div>
  );
}

export default function PricingPage() {
  const { palette, toggle } = useSiteTheme();
  const [user, setUser] = useState<User | null>(null);
  const [selected, setSelected] = useState<string | null>(() => {
    const s = new URLSearchParams(window.location.search).get('select');
    return s && PRODUCTS.some((p) => p.id === s) ? canonicalId(s) : null;
  });
  const checkoutRef = useRef<HTMLDivElement>(null);
  const [queued, setQueued] = useState<string[]>([]);

  useEffect(() => onAuthStateChanged(getAuth(), setUser), []);
  useEffect(() => { t('PAGE_VISIT_PRICING', selected || ''); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (selected) setTimeout(() => checkoutRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
  }, [selected]);

  usePageSeo({
    title: 'Pricing: Adult Mind Gym, Kids Mind Gym, Mantras & Music | SKRM Bliss AI',
    description: 'Three simple plans: Adult Mind Gym for you, Kids Mind Gym for your child, and the Mantra Pass for mantras and meditation music.',
    url: 'https://www.skrmblissai.in/pricing',
  });

  const pick = (id: string) => {
    t('PRICING_PICK', id);
    setQueued([]);
    setSelected(id);
    const url = new URL(window.location.href); url.searchParams.set('select', id); window.history.replaceState({}, '', url);
  };

  const sec: React.CSSProperties = { padding: 'clamp(28px, 4vw, 48px) clamp(16px, 4vw, 40px)' };
  const wrap: React.CSSProperties = { maxWidth: 1140, margin: '0 auto' };

  return (
    <div className="min-h-screen w-full antialiased" style={{ fontFamily: SANS, background: palette.BG, color: palette.INK, overflowX: 'hidden' }}>
      <SiteHeader palette={palette} onToggleTheme={toggle}
        links={siteNav()}
        cta={null} />

      <nav aria-label="Back" style={{ ...wrap, padding: '10px clamp(16px, 4vw, 40px) 0' }}>
        <a href="/" onClick={(e) => { if (document.referrer.startsWith(window.location.origin) && window.history.length > 1) { e.preventDefault(); window.history.back(); } }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, minHeight: 44, color: palette.PURPLE_STRONG, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
          <span aria-hidden="true">←</span> Back
        </a>
      </nav>

      <header style={{ ...sec, paddingTop: 'clamp(16px, 3vw, 32px)', textAlign: 'center' }}>
        <h1 style={{ fontFamily: SERIF, fontSize: 'clamp(28px, 5.4vw, 54px)', fontWeight: 400, lineHeight: 1.1, margin: '0 auto 12px', maxWidth: 760 }}>
          Who is this for?
        </h1>
        <p style={{ fontSize: 16, lineHeight: 1.6, color: palette.INK2, margin: '0 auto', maxWidth: 560 }}>
          Choose one plan. Each is complete on its own.
        </p>
      </header>

      {/* The three doors, each with its plans */}
      <div id="plans" style={{ ...sec, paddingTop: 0, scrollMarginTop: 90 }}>
        <div className="pr-doors" style={wrap}>
          {DOORS.map((d) => <DoorColumn key={d.id} palette={palette} door={d} selected={selected} onPick={pick} />)}
        </div>
      </div>

      {/* Checkout appears here once something is chosen */}
      <div ref={checkoutRef} style={{ scrollMarginTop: 90 }}>
        {selected && (
          <section style={{ ...sec, paddingTop: 0 }}>
            <div style={{ ...wrap, maxWidth: 620 }}>
              <Checkout key={selected} palette={palette} id={selected} user={user} onClose={() => { setSelected(null); setQueued([]); }}
                queued={queued} onAdd={(x) => setQueued((q) => [...q, x])} onRemove={(x) => setQueued((q) => q.filter((y) => y !== x))} />
            </div>
          </section>
        )}
      </div>

      <section style={{ ...sec, paddingTop: 0, textAlign: 'center', paddingBottom: 'clamp(48px, 6vw, 80px)' }}>
        <p style={{ fontSize: 14.5, lineHeight: 1.7, color: palette.INK2, margin: '0 0 6px' }}>
          Want all three for life? <button type="button" onClick={() => pick('all_access')}
            style={{ background: 'none', border: 'none', padding: 0, color: palette.PURPLE_STRONG, fontWeight: 700, cursor: 'pointer', fontFamily: SANS, fontSize: 14.5, textDecoration: 'underline' }}>
            All Access, {priceOf('all_access')} once</button>.
        </p>
        <p style={{ fontSize: 14.5, color: palette.INK2, margin: 0 }}>
          Questions before you choose? <a href="https://wa.me/918217581238" target="_blank" rel="noopener noreferrer" style={{ color: palette.PURPLE_STRONG, fontWeight: 700 }}>Message us on WhatsApp</a>.
        </p>
      </section>

      <SiteFooter palette={palette} />

      <style>{`
        .pr-doors { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; align-items: stretch; }
        .pr-opt { transition: border-color .2s ease, background .2s ease; }
        .pr-opt:hover { border-color: ${palette.PURPLE_STRONG} !important; }
        @media (max-width: 900px) { .pr-doors { grid-template-columns: 1fr; } }
        @media (max-width: 600px) {
          .pr-doors { gap: 16px; }
          .pr-col { padding: 20px 16px !important; border-radius: 24px !important; }
        }
        @media (prefers-reduced-motion: reduce) { .pr-opt { transition: none; } }
      `}</style>
    </div>
  );
}
