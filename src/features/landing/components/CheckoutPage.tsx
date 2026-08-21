import { useEffect } from 'react';
import { ArrowLeft, Check, Lock } from 'lucide-react';
import PriceSlider from '../../../components/ui/PriceSlider';
import { TrustStrip, TrustBadges, ConsentCheckboxes } from '../../../components/checkout';

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
  agreeTerms?: boolean;
  onAgreeTerms?: (v: boolean) => void;
  agreeMarketing?: boolean;
  onAgreeMarketing?: (v: boolean) => void;
}

const INCLUDED = {
  course: [
    '7 in-depth episodes — lifetime access',
    '3 episodes available now — Episodes 4, 5, 6 & 7 unlock weekly after enrollment',
    'Ebooks & PDF reference course materials',
    'Free guided meditations to practice what is taught',
    'Personal WhatsApp support available',
    'Access to Inner Circle community support',
    'Body-map & emotion practice library in Mind Gym app with unlimited music & meditations',
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
  agreeTerms = true, onAgreeTerms = () => {},
  agreeMarketing = true, onAgreeMarketing = () => {},
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
          <p style={{ fontFamily: SANS, fontSize: 13, color: inkSub, margin: '0 0 16px' }}>
            Takes under a minute. Access opens the moment payment clears.
          </p>

          <TrustStrip isDark={isDark} ink={ink} inkSub={inkSub} />

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
              <label style={label} htmlFor="co-phone">WhatsApp / Phone <span style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 500 }}>(for support &amp; updates)</span></label>
              <input
                id="co-phone" type="tel" autoComplete="tel" placeholder="+1 (555) 000-0000"
                value={guestPhone} onChange={(e) => onGuestPhone(e.target.value)} style={field}
              />
            </div>

            <ConsentCheckboxes
              agreeTerms={agreeTerms}
              setAgreeTerms={onAgreeTerms}
              agreeMarketing={agreeMarketing}
              setAgreeMarketing={onAgreeMarketing}
              isDark={isDark}
              ink={ink}
              inkSub={inkSub}
            />

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

            <TrustBadges isDark={isDark} />
          </form>
        </section>

        {/* Right Column: Founder Welcome & Commitment Section (Balanced with Left Column) */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Order Summary Box */}
          <div style={{ background: cardBg, border: `1px solid ${borderC}`, borderRadius: 20, padding: 24 }}>
            <p style={{ fontFamily: SANS, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: accent, margin: '0 0 6px' }}>
              Your order summary
            </p>
            <h2 style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 400, margin: '0 0 16px' }}>{planName}</h2>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 10 }}>
              {INCLUDED[selectedPlan].map((item) => (
                <li key={item} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontFamily: SANS, fontSize: 13.5, color: inkSub }}>
                  <Check size={16} style={{ color: '#22863a', flexShrink: 0, marginTop: 2 }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Founder Welcome Card with Namaste.webp */}
          <div
            style={{
              background: cardBg,
              border: `1px solid ${borderC}`,
              borderRadius: 20,
              padding: 24,
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.2)' : '0 10px 30px rgba(74,50,96,0.04)',
            }}
          >
            <div
              style={{
                position: 'relative',
                marginBottom: 16,
                padding: 4,
                borderRadius: 16,
                background: isDark ? 'rgba(196,145,58,0.12)' : 'rgba(74,50,96,0.06)',
                border: `1px solid ${isDark ? 'rgba(196,145,58,0.25)' : 'rgba(74,50,96,0.15)'}`,
              }}
            >
              <img
                src="https://firebasestorage.googleapis.com/v0/b/awakened-path-2026.firebasestorage.app/o/EmotionAndFeelingsCourse%2FNamaste.webp?alt=media"
                alt="Sim Katyal & Shruti Khungar"
                style={{
                  maxHeight: 190,
                  width: 'auto',
                  borderRadius: 12,
                  objectFit: 'contain',
                  display: 'block',
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/Namaste.webp';
                }}
              />
            </div>
            <p style={{ fontFamily: SERIF, fontSize: 16, color: ink, fontStyle: 'italic', lineHeight: 1.6, margin: '0 0 10px' }}>
              &ldquo;With deep presence and gratitude, we welcome you. Thank you for walking this path with us toward emotional freedom, quiet clarity, and returning home to your true self.&rdquo;
            </p>
            <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: accent, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              — Sim Katyal &amp; Shruti Khungar
            </span>
            <span style={{ fontFamily: SANS, fontSize: 10.5, color: inkSub, display: 'block', marginTop: 2 }}>
              Founders of Soulful Intelligence Studio &amp; Mind Gym
            </span>
          </div>

          {/* Our Commitment to Your Journey Section */}
          <div
            style={{
              background: cardBg,
              border: `1px solid ${borderC}`,
              borderRadius: 20,
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div style={{ borderBottom: `1px solid ${borderC}`, paddingBottom: 12 }}>
              <h3 style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 500, margin: 0, color: ink }}>
                Our Commitment to Your Journey
              </h3>
              <p style={{ fontFamily: SANS, fontSize: 11.5, color: inkSub, margin: '4px 0 0' }}>
                Everything you need for lasting emotional freedom and daily practice.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ padding: '6px 8px', borderRadius: 8, background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(74,50,96,0.06)', fontSize: 14 }}>
                  🌿
                </div>
                <div>
                  <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: ink, display: 'block' }}>
                    Instant Access to Inner Practices
                  </span>
                  <span style={{ fontFamily: SANS, fontSize: 11.5, color: inkSub, lineHeight: 1.5, display: 'block', marginTop: 2 }}>
                    Begin your journey immediately — stream released episodes, somatic releases, and guided reflections the moment you join.
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ padding: '6px 8px', borderRadius: 8, background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(74,50,96,0.06)', fontSize: 14 }}>
                  ✨
                </div>
                <div>
                  <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: ink, display: 'block' }}>
                    Somatic Emotional Regulation
                  </span>
                  <span style={{ fontFamily: SANS, fontSize: 11.5, color: inkSub, lineHeight: 1.5, display: 'block', marginTop: 2 }}>
                    Guided by Sim Katyal, move beyond mental overthinking into bodily presence, emotional freedom, and nervous system ease.
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ padding: '6px 8px', borderRadius: 8, background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(74,50,96,0.06)', fontSize: 14 }}>
                  🕊️
                </div>
                <div>
                  <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: ink, display: 'block' }}>
                    Dedicated Guidance &amp; Space
                  </span>
                  <span style={{ fontFamily: SANS, fontSize: 11.5, color: inkSub, lineHeight: 1.5, display: 'block', marginTop: 2 }}>
                    Gain access to structured practices, daily reflection tools, and guidance designed to support your ongoing inner growth.
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ padding: '6px 8px', borderRadius: 8, background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(74,50,96,0.06)', fontSize: 14 }}>
                  ⏳
                </div>
                <div>
                  <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: ink, display: 'block' }}>
                    Self-Paced Lifetime Learning
                  </span>
                  <span style={{ fontFamily: SANS, fontSize: 11.5, color: inkSub, lineHeight: 1.5, display: 'block', marginTop: 2 }}>
                    Practice at your own rhythm. Enjoy unlimited lifetime access to all current modules and every upcoming episode release.
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ padding: '6px 8px', borderRadius: 8, background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(74,50,96,0.06)', fontSize: 14 }}>
                  🛡️
                </div>
                <div>
                  <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: ink, display: 'block' }}>
                    14-Day Money-Back Guarantee
                  </span>
                  <span style={{ fontFamily: SANS, fontSize: 11.5, color: inkSub, lineHeight: 1.5, display: 'block', marginTop: 2 }}>
                    Experience the course with complete peace of mind. If this journey doesn&apos;t resonate within 14 days, receive a full refund — no questions asked.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

