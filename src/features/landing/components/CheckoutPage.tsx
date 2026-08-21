import { useEffect } from 'react';
import { ArrowLeft, Check, Lock, ShieldCheck } from 'lucide-react';
import PriceSlider from '../../../components/ui/PriceSlider';

const SERIF = "'Cormorant Garamond', Georgia, serif";
const SANS = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
const GOLD = '#C4913A';
const PLUM = '#4A3260';

interface PricingConfig {
  currency: string;
  symbol: string;
  min: number;
  suggested: number;
  max: number;
}

interface Props {
  isDark: boolean;
  selectedPlan: 'course' | 'allAccess';
  pricing: PricingConfig;
  guestName: string;
  onGuestName: (v: string) => void;
  guestEmail: string;
  onGuestEmail: (v: string) => void;
  guestPhone: string;
  onGuestPhone: (v: string) => void;
  amount: number;
  onAmount: (v: number) => void;
  error: string;
  onSubmit: (e: React.FormEvent) => void;
  isProcessing: boolean;
  /** PayPal's buttons only exist once the backend answered AND the form has
   *  the name/email they submit — until then the slot is empty, so the divider
   *  must not advertise an alternative that isn't on screen. */
  showPaypal: boolean;
  isPaypalProcessing: boolean;
  onClose: () => void;
}

const INCLUDED = {
  course: [
    '7 in-depth episodes — instant lifetime access',
    'Every future episode added, free',
    'Body-map & emotion practice library',
    'Watch on any device, forever',
  ],
  allAccess: [
    'Every course: Power of Now, Wisdom Untethered, Feelings & Emotions & more',
    'Journal, Breathwork, Audio, Meditations & Practices',
    'Personal Growth Analytics & Daily Tracker',
    'Every new course we release — lifetime free',
  ],
};

/**
 * Dedicated checkout page (not a modal). Payment lives on its own URL so the
 * buyer keeps a back button, a shareable/refreshable state and — on mobile —
 * the full screen instead of a scrolling dialog stacked over the sales page.
 */
export default function CheckoutPage({
  isDark, selectedPlan, pricing,
  guestName, onGuestName, guestEmail, onGuestEmail, guestPhone, onGuestPhone,
  amount, onAmount, error, onSubmit,
  isProcessing, showPaypal, isPaypalProcessing, onClose,
}: Props) {
  useEffect(() => {
    document.body.classList.add('si-checkout-open');
    return () => document.body.classList.remove('si-checkout-open');
  }, []);

  const ink = isDark ? '#EDE9E3' : '#2A2118';
  const inkSub = isDark ? 'rgba(237,233,227,0.6)' : '#6B5744';
  const pageBg = isDark ? '#0D0A12' : '#FBF8F3';
  const cardBg = isDark ? 'rgba(255,255,255,0.04)' : '#FFFFFF';
  const borderC = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(196,181,160,0.45)';
  const accent = isDark ? GOLD : PLUM;

  const field: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 12,
    border: `1px solid ${borderC}`,
    background: isDark ? 'rgba(0,0,0,0.25)' : '#FFFFFF',
    color: ink,
    fontFamily: SANS,
    fontSize: 15, // <16px triggers an iOS Safari zoom-on-focus; 15 is the floor that doesn't
    outline: 'none',
  };
  const label: React.CSSProperties = {
    display: 'block', fontFamily: SANS, fontSize: 10.5, fontWeight: 700,
    letterSpacing: '0.08em', textTransform: 'uppercase', color: inkSub, marginBottom: 6,
  };

  const planName = selectedPlan === 'course' ? 'Feelings & Emotions Course' : 'Whole App — All-Access Pass';

  const razorpayButton = (
    <button
      type="submit"
      disabled={isProcessing}
      style={{
        width: '100%', padding: '15px', borderRadius: 999,
        cursor: isProcessing ? 'wait' : 'pointer',
        background: PLUM, color: '#fff', border: 'none',
        fontFamily: SANS, fontSize: 14.5, fontWeight: 800,
        opacity: isProcessing ? 0.7 : 1,
      }}
    >
      {isProcessing ? 'Processing…' : `Pay ${pricing.symbol}${amount.toLocaleString()} by Card`}
    </button>
  );

  const paypalSlot = (
    <div id="paypal-button-container" style={{ minHeight: isPaypalProcessing ? 45 : undefined }} />
  );

  const divider = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ flex: 1, height: 1, background: borderC }} />
      <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: inkSub }}>OR</span>
      <div style={{ flex: 1, height: 1, background: borderC }} />
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: pageBg, color: ink }}>
      <header
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '16px 20px', borderBottom: `1px solid ${borderC}`,
          position: 'sticky', top: 0, zIndex: 10,
          background: pageBg,
        }}
      >
        <button
          onClick={onClose}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', cursor: 'pointer',
            color: inkSub, fontFamily: SANS, fontSize: 13, fontWeight: 700, padding: 0,
          }}
        >
          <ArrowLeft size={16} /> Back
        </button>
        <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: SANS, fontSize: 11, fontWeight: 700, color: inkSub }}>
          <Lock size={13} /> Secure checkout
        </span>
      </header>

      <main
        style={{
          maxWidth: 960, margin: '0 auto', padding: '28px 20px 56px',
          display: 'grid', gap: 24,
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          alignItems: 'start',
        }}
      >
        {/* Payment column */}
        <section style={{ background: cardBg, border: `1px solid ${borderC}`, borderRadius: 20, padding: 24 }}>
          <h1 style={{ fontFamily: SERIF, fontSize: 30, fontWeight: 400, margin: '0 0 4px' }}>Complete your enrolment</h1>
          <p style={{ fontFamily: SANS, fontSize: 13, color: inkSub, margin: '0 0 20px' }}>
            Takes under a minute. Access opens the moment payment clears.
          </p>

          <form onSubmit={onSubmit} style={{ display: 'grid', gap: 14 }}>
            <div>
              <label style={label} htmlFor="co-name">Full name</label>
              <input
                id="co-name" type="text" required autoComplete="name" placeholder="Your name"
                value={guestName} onChange={(e) => onGuestName(e.target.value)} style={field}
              />
            </div>

            <div>
              <label style={label} htmlFor="co-email">Email address</label>
              <input
                id="co-email" type="email" required autoComplete="email" placeholder="you@example.com"
                value={guestEmail} onChange={(e) => onGuestEmail(e.target.value)} style={field}
              />
              <p style={{ fontFamily: SANS, fontSize: 11, color: inkSub, margin: '6px 0 0' }}>
                Sign in with this email to unlock the course.
              </p>
            </div>

            <div>
              <label style={label} htmlFor="co-phone">Phone <span style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 500 }}>(optional)</span></label>
              <input
                id="co-phone" type="tel" autoComplete="tel" placeholder="+91 98765 43210"
                value={guestPhone} onChange={(e) => onGuestPhone(e.target.value)} style={field}
              />
            </div>

            <div>
              <label style={label}>Choose your contribution</label>
              <PriceSlider
                currency={pricing.currency}
                min={pricing.min}
                suggested={pricing.suggested}
                max={pricing.max}
                value={amount}
                onChange={onAmount}
                dark={isDark}
              />
            </div>

            <div
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '14px 16px', borderRadius: 14,
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(74,50,96,0.05)',
              }}
            >
              <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700 }}>Total</span>
              <span style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 500, color: accent }}>
                {pricing.symbol}{amount.toLocaleString()}
              </span>
            </div>

            {error && (
              <p role="alert" style={{ fontFamily: SANS, fontSize: 12.5, color: '#E53935', margin: 0 }}>{error}</p>
            )}

            {/* Both processors stay visible — never gated behind a region guess.
                Order flips so the one native to the buyer's currency leads. */}
            {!showPaypal ? razorpayButton : pricing.currency === 'INR' ? (
              <>{razorpayButton}{divider}{paypalSlot}</>
            ) : (
              <>{paypalSlot}{divider}{razorpayButton}</>
            )}

            <p style={{ fontFamily: SANS, fontSize: 10.5, color: inkSub, textAlign: 'center', margin: 0 }}>
              256-bit encrypted · 14-day money-back guarantee
            </p>
          </form>
        </section>

        {/* Summary column */}
        <aside style={{ display: 'grid', gap: 16 }}>
          <div style={{ background: cardBg, border: `1px solid ${borderC}`, borderRadius: 20, padding: 24 }}>
            <p style={{ fontFamily: SANS, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: accent, margin: '0 0 6px' }}>
              Your order
            </p>
            <h2 style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 400, margin: '0 0 16px' }}>{planName}</h2>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 10 }}>
              {INCLUDED[selectedPlan].map((item) => (
                <li key={item} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontFamily: SANS, fontSize: 13.5, color: inkSub }}>
                  <Check size={15} style={{ color: accent, flexShrink: 0, marginTop: 2 }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div
            style={{
              border: `1px solid ${borderC}`, borderLeft: `3px solid ${accent}`,
              borderRadius: 16, padding: '16px 18px', background: cardBg,
            }}
          >
            <p style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: SANS, fontSize: 12, fontWeight: 800, margin: '0 0 6px' }}>
              <ShieldCheck size={15} style={{ color: accent }} /> Pay once. Keep it for life.
            </p>
            <p style={{ fontFamily: SANS, fontSize: 12.5, color: inkSub, margin: 0, lineHeight: 1.6 }}>
              No subscription, no upsells. If it isn't for you, write in within 14 days for a full refund.
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}
