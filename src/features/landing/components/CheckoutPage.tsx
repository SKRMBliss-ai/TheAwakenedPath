import { useEffect, useState } from 'react';
import { ArrowLeft, Check, ChevronDown, Lock, Mail, Phone, ShieldCheck, User } from 'lucide-react';
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

const COMMITMENTS = [
  { icon: '🌿', title: 'Instant access to inner practices', body: 'Stream released episodes, somatic releases and guided reflections the moment you join.' },
  { icon: '✨', title: 'Somatic emotional regulation', body: 'Guided by Sim Katyal, move beyond overthinking into bodily presence and nervous-system ease.' },
  { icon: '🕊️', title: 'Dedicated guidance & space', body: 'Structured practices, daily reflection tools and ongoing support for your inner growth.' },
  { icon: '⏳', title: 'Self-paced lifetime learning', body: 'Practice at your own rhythm — unlimited access to every current and upcoming episode.' },
  { icon: '🛡️', title: '14-day money-back guarantee', body: "Doesn't resonate within 14 days? Full refund, no questions asked." },
];

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

  // Collapsed by default — five paragraphs of "why trust us" copy ahead of a
  // form the buyer came to fill in was pure friction. It's here for whoever
  // wants it, not forced on everyone.
  const [commitmentOpen, setCommitmentOpen] = useState(false);
  // Same reasoning as the commitment accordion: PCI/privacy copy is
  // reassurance for whoever wants it, not something to force past on the
  // way to the pay button.
  const [trustOpen, setTrustOpen] = useState(false);

  const ink = isDark ? '#EDE9E3' : '#2A2118';
  const inkSub = isDark ? 'rgba(237,233,227,0.6)' : '#6B5744';
  const pageBg = isDark ? '#0D0A12' : '#FBF8F3';
  const cardBg = isDark ? 'rgba(255,255,255,0.035)' : '#FFFFFF';
  const borderC = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(196,181,160,0.4)';
  const accent = isDark ? GOLD : PLUM;
  const cardShadow = isDark ? '0 12px 32px rgba(0,0,0,0.28)' : '0 12px 32px rgba(74,50,96,0.06)';

  const card: React.CSSProperties = {
    background: cardBg,
    border: `1px solid ${borderC}`,
    borderRadius: 18,
    boxShadow: cardShadow,
  };

  const field: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px 12px 40px',
    borderRadius: 12,
    border: `1px solid ${borderC}`,
    background: isDark ? 'rgba(0,0,0,0.25)' : '#FFFFFF',
    color: ink,
    fontFamily: SANS,
    fontSize: 15, // <16px triggers an iOS Safari zoom-on-focus; 15 is the floor that doesn't
    outline: 'none',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
  };
  const fieldIcon: React.CSSProperties = {
    position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)',
    color: inkSub, pointerEvents: 'none',
  };
  const fieldWrap: React.CSSProperties = { position: 'relative' };
  const label: React.CSSProperties = {
    display: 'block', fontFamily: SANS, fontSize: 10.5, fontWeight: 700,
    letterSpacing: '0.08em', textTransform: 'uppercase', color: inkSub, marginBottom: 6,
  };

  const planName = selectedPlan === 'course' ? 'Feelings & Emotions Course' : 'Whole App — All-Access Pass';

  const razorpayButton = (
    <button
      type="submit"
      disabled={isProcessing}
      className="co-pay-btn"
      style={{
        width: '100%', padding: '15px', borderRadius: 999,
        cursor: isProcessing ? 'wait' : 'pointer',
        background: `linear-gradient(135deg, ${PLUM} 0%, #5D3D78 100%)`, color: '#fff', border: 'none',
        fontFamily: SANS, fontSize: 14.5, fontWeight: 800,
        opacity: isProcessing ? 0.7 : 1,
        boxShadow: '0 10px 24px rgba(74,50,96,0.32)',
        transition: 'transform 0.15s ease, filter 0.15s ease',
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
      {/* Focus rings on inline-styled inputs need real CSS (pseudo-classes
          can't be inline); scoped by class so it only touches this page. */}
      <style>{`
        .co-field:focus { border-color: ${accent} !important; box-shadow: 0 0 0 3px ${isDark ? 'rgba(196,145,58,0.18)' : 'rgba(74,50,96,0.12)'}; }
        .co-pay-btn:not(:disabled):hover { filter: brightness(1.08); transform: translateY(-1px); }
        .co-commitment-toggle:hover { opacity: 0.75; }
        @media (min-width: 861px) {
          .co-aside { position: sticky; top: 84px; }
        }
      `}</style>

      <header
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 20px', borderBottom: `1px solid ${borderC}`,
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
          maxWidth: 960, margin: '0 auto', padding: '24px 20px 56px',
          display: 'grid', gap: 20,
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          alignItems: 'start',
        }}
      >
        {/* Payment column */}
        <section style={{ ...card, padding: 22 }}>
          <h1 style={{ fontFamily: SERIF, fontSize: 27, fontWeight: 400, margin: '0 0 4px' }}>Complete your enrolment</h1>
          <p style={{ fontFamily: SANS, fontSize: 12.5, color: inkSub, margin: '0 0 14px' }}>
            Takes under a minute. Access opens the moment payment clears.
          </p>

          <TrustStrip isDark={isDark} ink={ink} inkSub={inkSub} />

          <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
            <div>
              <label style={label} htmlFor="co-name">Full name</label>
              <div style={fieldWrap}>
                <User size={16} style={fieldIcon} />
                <input
                  id="co-name" type="text" required autoComplete="name" placeholder="Your name"
                  value={guestName} onChange={(e) => onGuestName(e.target.value)} style={field} className="co-field"
                />
              </div>
            </div>

            <div>
              <label style={label} htmlFor="co-email">Email address</label>
              <div style={fieldWrap}>
                <Mail size={16} style={fieldIcon} />
                <input
                  id="co-email" type="email" required autoComplete="email" placeholder="you@example.com"
                  value={guestEmail} onChange={(e) => onGuestEmail(e.target.value)} style={field} className="co-field"
                />
              </div>
              <p style={{ fontFamily: SANS, fontSize: 11, color: inkSub, margin: '6px 0 0' }}>
                Sign in with this email to unlock the course.
              </p>
            </div>

            <div>
              <label style={label} htmlFor="co-phone">WhatsApp / Phone <span style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 500 }}>(for support &amp; updates)</span></label>
              <div style={fieldWrap}>
                <Phone size={16} style={fieldIcon} />
                <input
                  id="co-phone" type="tel" autoComplete="tel" placeholder="+1 (555) 000-0000"
                  value={guestPhone} onChange={(e) => onGuestPhone(e.target.value)} style={field} className="co-field"
                />
              </div>
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
                padding: '13px 16px', borderRadius: 14,
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(74,50,96,0.05)',
              }}
            >
              <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700 }}>Total</span>
              <span style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 500, color: accent }}>
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

            <div>
              <button
                type="button"
                className="co-commitment-toggle"
                onClick={() => setTrustOpen((o) => !o)}
                aria-expanded={trustOpen}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  gap: 10, padding: '10px 2px', background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: SANS, fontSize: 12, fontWeight: 700, color: inkSub,
                }}
              >
                Payment &amp; privacy details
                <ChevronDown
                  size={16}
                  style={{ flexShrink: 0, transition: 'transform 0.2s ease', transform: trustOpen ? 'rotate(180deg)' : 'none' }}
                />
              </button>
              {trustOpen && <TrustBadges isDark={isDark} />}
            </div>
          </form>
        </section>

        {/* Right Column: order summary, founder note, and (collapsed by
            default) the fuller commitment copy — kept off-screen unless the
            buyer actually wants to read it. */}
        <aside className="co-aside" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ ...card, padding: 22 }}>
            <p style={{ fontFamily: SANS, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: accent, margin: '0 0 6px' }}>
              Your order summary
            </p>
            <h2 style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 400, margin: '0 0 14px' }}>{planName}</h2>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 9 }}>
              {INCLUDED[selectedPlan].map((item) => (
                <li key={item} style={{ display: 'flex', gap: 9, alignItems: 'flex-start', fontFamily: SANS, fontSize: 13, color: inkSub }}>
                  <Check size={15} style={{ color: '#22863a', flexShrink: 0, marginTop: 2 }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Founder Welcome Card with transparent Namaste.webp — sized up
              and set on a soft radial backdrop so it reads as a portrait,
              not a small logo-sized cutout floating on white. */}
          <div
            style={{
              ...card,
              padding: '28px 22px 24px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <div
              aria-hidden="true"
              style={{
                position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)',
                width: 320, height: 320, borderRadius: '50%',
                background: isDark
                  ? 'radial-gradient(circle, rgba(196,145,58,0.16) 0%, rgba(196,145,58,0) 70%)'
                  : 'radial-gradient(circle, rgba(74,50,96,0.08) 0%, rgba(74,50,96,0) 70%)',
              }}
            />
            <img
              src="https://firebasestorage.googleapis.com/v0/b/awakened-path-2026.firebasestorage.app/o/EmotionAndFeelingsCourse%2FNamaste.webp?alt=media"
              alt="Sim Katyal & Shruti Khungar"
              style={{
                maxHeight: 280,
                width: 'auto',
                marginBottom: 16,
                objectFit: 'contain',
                display: 'block',
                position: 'relative',
                filter: isDark ? 'drop-shadow(0 10px 26px rgba(0,0,0,0.45))' : 'drop-shadow(0 10px 26px rgba(74,50,96,0.16))',
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/Namaste.webp';
              }}
            />
            <p style={{ fontFamily: SERIF, fontSize: 16.5, color: ink, fontStyle: 'italic', lineHeight: 1.6, margin: '0 0 10px', position: 'relative' }}>
              &ldquo;With deep presence and gratitude, we welcome you. Thank you for walking this path with us toward emotional freedom, quiet clarity, and returning home to your true self.&rdquo;
            </p>
            <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: accent, letterSpacing: '0.05em', textTransform: 'uppercase', position: 'relative' }}>
              — Sim Katyal &amp; Shruti Khungar
            </span>
            <span style={{ fontFamily: SANS, fontSize: 10.5, color: inkSub, display: 'block', marginTop: 3, position: 'relative' }}>
              Founders of Soulful Intelligence Studio &amp; Mind Gym
            </span>
          </div>

          {/* Our Commitment — collapsed by default so the sidebar doesn't
              dump five paragraphs on someone who's here to pay, not read. */}
          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            <button
              type="button"
              className="co-commitment-toggle"
              onClick={() => setCommitmentOpen((o) => !o)}
              aria-expanded={commitmentOpen}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                gap: 10, padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer',
                textAlign: 'left', color: ink,
              }}
            >
              <span>
                <span style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 500, display: 'block' }}>
                  Our commitment to your journey
                </span>
                <span style={{ fontFamily: SANS, fontSize: 11, color: inkSub, display: 'block', marginTop: 2 }}>
                  {commitmentOpen ? 'What to expect, in full' : 'Tap to read what to expect'}
                </span>
              </span>
              <ChevronDown
                size={18}
                style={{ color: inkSub, flexShrink: 0, transition: 'transform 0.2s ease', transform: commitmentOpen ? 'rotate(180deg)' : 'none' }}
              />
            </button>

            {commitmentOpen && (
              <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: 14, borderTop: `1px solid ${borderC}` }}>
                <div style={{ height: 2 }} />
                {COMMITMENTS.map((c) => (
                  <div key={c.title} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ padding: '6px 8px', borderRadius: 8, background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(74,50,96,0.06)', fontSize: 14 }}>
                      {c.icon}
                    </div>
                    <div>
                      <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: ink, display: 'block' }}>
                        {c.title}
                      </span>
                      <span style={{ fontFamily: SANS, fontSize: 11.5, color: inkSub, lineHeight: 1.5, display: 'block', marginTop: 2 }}>
                        {c.body}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ ...card, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShieldCheck size={18} style={{ color: accent, flexShrink: 0 }} />
            <span style={{ fontFamily: SANS, fontSize: 12, color: inkSub, lineHeight: 1.5 }}>
              Your payment is processed securely by Razorpay or PayPal. We never see or store your card details.
            </span>
          </div>

        </aside>
      </main>
    </div>
  );
}
